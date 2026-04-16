import mongoose, { Schema, Document } from "mongoose";

export interface ILeaveRequest extends Document {
  user: mongoose.Types.ObjectId;
  type: "Annual" | "Sick" | "Maternity" | "Other";
  startDate: Date;
  endDate: Date;
  reason: string;
  status: "Pending" | "Approved" | "Rejected";
  approvedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const LeaveRequestSchema = new Schema<ILeaveRequest>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: ["Annual", "Sick", "Maternity", "Other"],
      required: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    reason: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["Pending", "Approved", "Rejected"],
      default: "Pending",
    },
    approvedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

export const LeaveRequest =
  mongoose.models.LeaveRequest ||
  mongoose.model<ILeaveRequest>("LeaveRequest", LeaveRequestSchema);
