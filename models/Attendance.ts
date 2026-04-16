import mongoose, { Schema, Document } from "mongoose";

export interface IAttendance extends Document {
  _id: any;
  user: mongoose.Types.ObjectId;
  date: Date;
  checkIn?: Date;
  checkOut?: Date;
  status: "present" | "absent" | "late" | "half_day" | "leave" | "holiday";
  workHours?: number;
  notes?: string;
  approvedBy?: mongoose.Types.ObjectId;
  location?: string;
  createdAt: Date;
  updatedAt: Date;
}

const AttendanceSchema = new Schema<IAttendance>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    checkIn: { type: Date },
    checkOut: { type: Date },
    status: {
      type: String,
      enum: ["present", "absent", "late", "half_day", "leave", "holiday"],
      default: "absent",
    },
    workHours: { type: Number },
    notes: { type: String },
    approvedBy: { type: Schema.Types.ObjectId, ref: "User" },
    location: { type: String },
  },
  { timestamps: true }
);

AttendanceSchema.index({ user: 1, date: -1 });
AttendanceSchema.index({ date: 1 });

export default mongoose.models.Attendance ||
  mongoose.model<IAttendance>("Attendance", AttendanceSchema);