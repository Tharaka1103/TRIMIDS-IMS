import mongoose, { Schema, Document } from "mongoose";

export type TaskStatus = "todo" | "in_progress" | "review" | "completed" | "cancelled";
export type TaskPriority = "low" | "medium" | "high" | "urgent";

export interface ITask extends Document {
  _id: any;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignedTo: mongoose.Types.ObjectId;
  assignedBy: mongoose.Types.ObjectId;
  department?: string;
  dueDate: Date;
  completedAt?: Date;
  tags?: string[];
  attachments?: string[];
  comments?: {
    user: mongoose.Types.ObjectId;
    message: string;
    createdAt: Date;
  }[];
  progress: number;
  estimatedHours?: number;
  actualHours?: number;
  createdAt: Date;
  updatedAt: Date;
}

const TaskSchema = new Schema<ITask>(
  {
    title: {
      type: String,
      required: [true, "Task title is required"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Task description is required"],
    },
    status: {
      type: String,
      enum: ["todo", "in_progress", "review", "completed", "cancelled"],
      default: "todo",
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high", "urgent"],
      default: "medium",
    },
    assignedTo: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    assignedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    department: { type: String },
    dueDate: {
      type: Date,
      required: true,
    },
    completedAt: { type: Date },
    tags: [{ type: String }],
    attachments: [{ type: String }],
    comments: [
      {
        user: { type: Schema.Types.ObjectId, ref: "User" },
        message: { type: String, required: true },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    progress: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    estimatedHours: { type: Number },
    actualHours: { type: Number },
  },
  { timestamps: true }
);

TaskSchema.index({ assignedTo: 1, status: 1 });
TaskSchema.index({ dueDate: 1 });

export default mongoose.models.Task ||
  mongoose.model<ITask>("Task", TaskSchema);