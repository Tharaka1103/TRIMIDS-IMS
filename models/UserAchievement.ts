import mongoose, { Schema, Document } from "mongoose";

export interface IUserAchievement extends Document {
  _id: any;
  userId: mongoose.Types.ObjectId;
  achievementId: string;
  giftedBy: mongoose.Types.ObjectId;
  giftedAt: Date;
  isDisplayed: boolean;
}

const UserAchievementSchema = new Schema<IUserAchievement>({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  achievementId: { type: String, required: true },
  giftedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  giftedAt: { type: Date, default: Date.now },
  isDisplayed: { type: Boolean, default: true },
});

delete (mongoose.models as any).UserAchievement;
delete (mongoose.connection.models as any).UserAchievement;

export default mongoose.model<IUserAchievement>("UserAchievement", UserAchievementSchema);
