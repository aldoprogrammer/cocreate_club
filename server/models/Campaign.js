const mongoose = require("mongoose");

const campaignSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    images: [{ type: String }],
    category: { type: String },
    price: { type: Number, required: true, min: 0.001 },
    status: { 
      type: String, 
      enum: ["active", "finished"], 
      default: "active" 
    },
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
        amountPaid: { type: Number, min: 0 },
        vote: { type: Number },
        addressReward: { type: String },
      },
    ],
    topParticipantImage: { type: String, required: false },
    allParticipantsImage: { type: String, required: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Campaign", campaignSchema);