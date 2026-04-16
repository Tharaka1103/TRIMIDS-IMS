import mongoose, { Schema, Document } from "mongoose";
import { Role } from "@/types/permissions";

export type NotificationType =
  | "task_assigned"
  | "task_completed"
  | "task_overdue"
  | "attendance_reminder"
  | "system_alert"
  | "maintenance_scheduled"
  | "maintenance_started"
  | "maintenance_ended"
  | "user_created"
  | "announcement"
  | "report_ready"
  | "approval_required"
  | "approval_granted"
  | "approval_rejected";

export type NotificationPriority = "low" | "medium" | "high" | "critical";

export interface INotification extends Document {
  _id: any;
  title: string;
  message: string;
  type: NotificationType;
  priority: NotificationPriority;
  recipients: mongoose.Types.ObjectId[];
  recipientRoles?: Role[];
  sender?: mongoose.Types.ObjectId;
  isRead: mongoose.Types.ObjectId[];
  isDeleted: mongoose.Types.ObjectId[];
  link?: string;
  metadata?: Record<string, any>;
  expiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      maxlength: [100, "Title too long"],
    },
    message: {
      type: String,
      required: [true, "Message is required"],
      trim: true,
      maxlength: [500, "Message too long"],
    },
    type: {
      type: String,
      enum: [
        "task_assigned",
        "task_completed",
        "task_overdue",
        "attendance_reminder",
        "system_alert",
        "maintenance_scheduled",
        "maintenance_started",
        "maintenance_ended",
        "user_created",
        "announcement",
        "report_ready",
        "approval_required",
        "approval_granted",
        "approval_rejected",
      ],
      required: true,
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high", "critical"],
      default: "medium",
    },
    recipients: [{ type: Schema.Types.ObjectId, ref: "User" }],
    recipientRoles: [{ type: String }],
    sender: { type: Schema.Types.ObjectId, ref: "User" },
    isRead: [{ type: Schema.Types.ObjectId, ref: "User" }],
    isDeleted: [{ type: Schema.Types.ObjectId, ref: "User" }],
    link: { type: String },
    metadata: { type: Schema.Types.Mixed },
    expiresAt: { type: Date },
  },
  { timestamps: true }
);

NotificationSchema.index({ recipients: 1, createdAt: -1 });
NotificationSchema.index({ recipientRoles: 1, createdAt: -1 });
NotificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.models.Notification ||
  mongoose.model<INotification>("Notification", NotificationSchema);