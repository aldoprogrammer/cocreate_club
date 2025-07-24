const express = require("express");
const router = express.Router();
const Campaign = require("../models/Campaign");
const auth = require("../middleware/auth");

// CREATE
router.post("/", auth, async (req, res) => {
  try {
    const { title, description, images, category, price, options } = req.body;

    if (!Array.isArray(options) || options.length < 2)
      return res.status(400).send({ error: "At least two vote options are required" });

    if (price < 0.001)
      return res.status(400).send({ error: "Minimum price is 0.001" });

    const campaign = new Campaign({
      title,
      description,
      images,
      category,
      price,
      creator: req.user._id,
       options: options.map(label => ({ label })), // ✅ FIXED
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
router.patch("/:id", auth, async (req, res) => {
  const allowed = ["title", "description", "images", "category", "price"];
  const updates = Object.keys(req.body);
  const isValid = updates.every((key) => allowed.includes(key));

  if (!isValid) return res.status(400).send({ error: "Invalid updates!" });

  try {
    const campaign = await Campaign.findById(req.params.id);
    if (!campaign) return res.status(404).send({ error: "Campaign not found" });
    if (!campaign.creator.equals(req.user._id))
      return res.status(403).send({ error: "Unauthorized" });

    updates.forEach(key => (campaign[key] = req.body[key]));

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

    campaign.options = options.map(label => ({ label, count: 0 }));
    await campaign.save();

    res.send({ message: "Options updated", options: campaign.options });
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
});

// VOTE (PAKE INDEX)
router.post("/:id/vote", auth, async (req, res) => {
  try {
    const { voteIndex, amountPaid } = req.body;

    const campaign = await Campaign.findById(req.params.id);
    if (!campaign) return res.status(404).send({ error: "Campaign not found" });

    if (amountPaid < campaign.price)
      return res.status(400).send({ error: "Insufficient payment" });

    const alreadyVoted = campaign.participants.find(p =>
      p.user.equals(req.user._id)
    );
    if (alreadyVoted) return res.status(400).send({ error: "Already voted" });

    if (
      typeof voteIndex !== "number" ||
      voteIndex < 0 ||
      voteIndex >= campaign.options.length
    ) {
      return res.status(400).send({ error: "Invalid vote index" });
    }

    campaign.options[voteIndex].count += 1;

    campaign.participants.push({
      user: req.user._id,
      hasPaid: true,
      vote: voteIndex,
    });

    await campaign.save();
    res.send({ message: "Vote recorded successfully" });
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
});

module.exports = router;
