import mongoose, { Schema, Document } from "mongoose";

export interface IEvaluation extends Document {
  _id: any;
  internId: mongoose.Types.ObjectId;
  evaluatorId: mongoose.Types.ObjectId;
  weekNumber: number;
  year: number;
  period: "weekly" | "bi-weekly" | "monthly";
  performanceScore: number;
  technicalSkills: number;
  communication: number;
  teamwork: number;
  problemSolving: number;
  attendance: number;
  strengths: string;
  areasForImprovement: string;
  goals: string;
  overallFeedback: string;
  createdAt: Date;
  updatedAt: Date;
}

const EvaluationSchema = new Schema<IEvaluation>({
  internId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  evaluatorId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  weekNumber: { type: Number, required: true },
  year: { type: Number, required: true },
  period: { type: String, enum: ["weekly", "bi-weekly", "monthly"], default: "bi-weekly" },
  performanceScore: { type: Number, min: 1, max: 5, required: true },
  technicalSkills: { type: Number, min: 1, max: 5, required: true },
  communication: { type: Number, min: 1, max: 5, required: true },
  teamwork: { type: Number, min: 1, max: 5, required: true },
  problemSolving: { type: Number, min: 1, max: 5, required: true },
  attendance: { type: Number, min: 1, max: 5, required: true },
  strengths: { type: String, required: true },
  areasForImprovement: { type: String, required: true },
  goals: { type: String, required: true },
  overallFeedback: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export default mongoose.models.Evaluation || mongoose.model<IEvaluation>("Evaluation", EvaluationSchema);
