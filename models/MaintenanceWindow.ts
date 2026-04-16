import mongoose, { Schema, Document } from "mongoose";

export interface IMaintenanceWindow extends Document {
  _id: any;
  title: string;
  description: string;
  startTime: Date;
  endTime: Date;
  isActive: boolean;
  affectedRoles: string[];
  scheduledBy: mongoose.Types.ObjectId;
  status: "scheduled" | "active" | "completed" | "cancelled";
  notificationSent: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const MaintenanceWindowSchema = new Schema<IMaintenanceWindow>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    startTime: {
      type: Date,
      required: true,
    },
    endTime: {
      type: Date,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: false,
    },
    affectedRoles: {
      type: [String],
      default: ["intern", "employee", "hr_manager",
                "finance_manager", "marketing_manager"],
    },
    scheduledBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["scheduled", "active", "completed", "cancelled"],
      default: "scheduled",
    },
    notificationSent: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export default mongoose.models.MaintenanceWindow ||
  mongoose.model<IMaintenanceWindow>(
    "MaintenanceWindow",
    MaintenanceWindowSchema
  );