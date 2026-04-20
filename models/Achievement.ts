import mongoose, { Schema, Document } from "mongoose";

export interface IAchievement extends Document {
  _id: any;
  name: string;
  description: string;
  category: string;
  icon: string;
  points: number;
  color: string;
  createdAt: Date;
}

const AchievementSchema = new Schema<IAchievement>({
  name: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  icon: { type: String, required: true },
  points: { type: Number, default: 0 },
  color: { type: String, default: "#3b82f6" },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Achievement || mongoose.model<IAchievement>("Achievement", AchievementSchema);
