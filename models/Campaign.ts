import mongoose from "mongoose";

const campaignSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, enum: ["Email", "Social Media", "SEO", "PPC", "Event"], required: true },
  status: { type: String, enum: ["Draft", "Active", "Completed", "Paused"], default: "Draft" },
  budget: { type: Number, required: true },
  spent: { type: Number, default: 0 },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }
}, { timestamps: true });

export const Campaign = mongoose.models.Campaign || mongoose.model("Campaign", campaignSchema);