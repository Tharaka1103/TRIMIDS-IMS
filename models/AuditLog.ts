import mongoose, { Schema, Document } from "mongoose";

export interface IAuditLog extends Document {
  _id: any;
  user: mongoose.Types.ObjectId;
  action: string;
  resource: string;
  resourceId?: string;
  details?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  status: "success" | "failure";
  createdAt: Date;
}

const AuditLogSchema = new Schema<IAuditLog>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    action: { type: String, required: true },
    resource: { type: String, required: true },
    resourceId: { type: String },
    details: { type: Schema.Types.Mixed },
    ipAddress: { type: String },
    userAgent: { type: String },
    status: {
      type: String,
      enum: ["success", "failure"],
      default: "success",
    },
  },
  { timestamps: true, versionKey: false }
);

AuditLogSchema.index({ user: 1, createdAt: -1 });
AuditLogSchema.index({ action: 1 });
AuditLogSchema.index({ createdAt: -1 });

export default mongoose.models.AuditLog ||
  mongoose.model<IAuditLog>("AuditLog", AuditLogSchema);