const mongoose = require("mongoose");

const campaignSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    images: [{ type: String }],
    category: { type: String },
    price: { type: Number, required: true, min: 0.001 },
    creator: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    options: [
      {
        label: { type: String, required: true },
        count: { type: Number, default: 0 },
      },
    ],
    participants: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        hasPaid: { type: Boolean, default: false },
        vote: { type: Number }, // pake index
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Campaign", campaignSchema);
