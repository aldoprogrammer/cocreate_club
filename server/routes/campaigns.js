const express = require("express");
const router = express.Router();
const Campaign = require("../models/Campaign");
const auth = require("../middleware/auth");
const multer = require("multer");
const path = require("path");

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Store files in uploads/ directory
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, `${uniqueSuffix}-${file.originalname}`);
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed"), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
});

// Serve uploaded images statically
router.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// CREATE
router.post("/", auth, upload.fields([
  { name: "images", maxCount: 10 },
  { name: "topParticipantImage", maxCount: 1 },
  { name: "allParticipantsImage", maxCount: 1 }
]), async (req, res) => {
  try {
    const { title, description, category, price, options } = req.body;

    if (!Array.isArray(options) || options.length < 2)
      return res
        .status(400)
        .send({ error: "At least two vote options are required" });

    if (price < 0.001)
      return res.status(400).send({ error: "Minimum price is 0.001" });

    const imageUrls = req.files.images
      ? req.files.images.map((file) => `/uploads/${file.filename}`)
      : [];

    const campaign = new Campaign({
      title,
      description,
      images: imageUrls,
      category,
      price,
      creator: req.user._id,
      options: options.map((label) => ({ label })),
      topParticipantImage: req.files.topParticipantImage 
        ? `/uploads/${req.files.topParticipantImage[0].filename}` 
        : undefined,
      allParticipantsImage: req.files.allParticipantsImage 
        ? `/uploads/${req.files.allParticipantsImage[0].filename}` 
        : undefined,
    });

    await campaign.save();
    res.status(201).send(campaign);
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
});

// GET ALL
router.get("/", async (req, res) => {
  try {
    const campaigns = await Campaign.find()
      .populate("creator", "fullName")
      .select("-participants.vote");
    res.send(campaigns);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

// GET BY ID
router.get("/:id", async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.id)
      .populate("creator", "fullName")
      .populate("participants.user", "fullName email");

    if (!campaign) return res.status(404).send({ error: "Campaign not found" });

    res.send(campaign);
  } catch (error) {
    res.status(400).send({ error: "Invalid campaign ID" });
  }
});

// UPDATE
router.patch("/:id", auth, upload.fields([
  { name: "images", maxCount: 10 },
  { name: "topParticipantImage", maxCount: 1 },
  { name: "allParticipantsImage", maxCount: 1 }
]), async (req, res) => {
  const allowed = ["title", "description", "category", "price", "status", "topParticipantImage", "allParticipantsImage"];
  const updates = Object.keys(req.body);
  const isValid = updates.every((key) => allowed.includes(key));

  if (!isValid) return res.status(400).send({ error: "Invalid updates!" });

  try {
    const campaign = await Campaign.findById(req.params.id);
    if (!campaign) return res.status(404).send({ error: "Campaign not found" });
    if (!campaign.creator.equals(req.user._id))
      return res.status(403).send({ error: "Unauthorized" });

    updates.forEach((key) => {
      campaign[key] = req.body[key];
    });

    if (req.files.images && req.files.images.length > 0) {
      campaign.images = req.files.images.map((file) => `/uploads/${file.filename}`);
    }
    if (req.files.topParticipantImage && req.files.topParticipantImage.length > 0) {
      campaign.topParticipantImage = `/uploads/${req.files.topParticipantImage[0].filename}`;
    }
    if (req.files.allParticipantsImage && req.files.allParticipantsImage.length > 0) {
      campaign.allParticipantsImage = `/uploads/${req.files.allParticipantsImage[0].filename}`;
    }

    await campaign.save();
    res.send(campaign);
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
});

// DELETE
router.delete("/:id", auth, async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.id);
    if (!campaign) return res.status(404).send({ error: "Campaign not found" });
    if (!campaign.creator.equals(req.user._id))
      return res.status(403).send({ error: "Unauthorized" });

    await campaign.remove();
    res.send({ message: "Deleted successfully" });
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

// SET OPTIONS
router.patch("/:id/options", auth, async (req, res) => {
  try {
    const { options } = req.body;

    if (!Array.isArray(options) || options.length < 2)
      return res.status(400).send({ error: "Minimum 2 options required" });

    const campaign = await Campaign.findById(req.params.id);
    if (!campaign) return res.status(404).send({ error: "Campaign not found" });
    if (!campaign.creator.equals(req.user._id))
      return res.status(403).send({ error: "Unauthorized" });

    campaign.options = options.map((label) => ({ label, count: 0 }));
    await campaign.save();

    res.send({ message: "Options updated", options: campaign.options });
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
});

// VOTE
router.post("/:id/vote", auth, async (req, res) => {
  try {
    const { voteIndex, amountPaid, addressReward } = req.body;

    const campaign = await Campaign.findById(req.params.id);
    if (!campaign) return res.status(404).send({ error: "Campaign not found" });
    if (campaign.status === "finished") 
      return res.status(400).send({ error: "Campaign has finished" });

    if (amountPaid < campaign.price)
      return res.status(400).send({ error: "Insufficient payment" });

    const userVotes = campaign.participants.filter((p) =>
      p.user.equals(req.user._id)
    );
    if (userVotes.length >= 5)
      return res.status(400).send({ error: "Maximum 5 votes per user reached" });

    if (
      typeof voteIndex !== "number" ||
      voteIndex < 0 ||
      voteIndex >= campaign.options.length
    ) {
      return res.status(400).send({ error: "Invalid vote index" });
    }

    if (!addressReward) {
      return res.status(400).send({ error: "Wallet address is required" });
    }

    campaign.options[voteIndex].count += 1;

    campaign.participants.push({
      user: req.user._id,
      hasPaid: true,
      amountPaid,
      vote: voteIndex,
      addressReward,
    });

    await campaign.save();
    res.send({ message: "Vote recorded successfully" });
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
});

// TOGGLE STATUS
router.patch("/:id/status", auth, async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.id);
    if (!campaign) return res.status(404).send({ error: "Campaign not found" });
    if (!campaign.creator.equals(req.user._id))
      return res.status(403).send({ error: "Unauthorized" });

    campaign.status = campaign.status === "active" ? "finished" : "active";
    await campaign.save();

    res.send({ message: "Status updated", status: campaign.status });
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
});

module.exports = router;