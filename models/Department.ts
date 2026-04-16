import mongoose, { Schema, Document } from "mongoose";

export interface IDepartment extends Document {
  name: string;
  description?: string;
  head?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const DepartmentSchema = new Schema<IDepartment>(
  {
    name: {
      type: String,
      required: [true, "Please provide a department name"],
      trim: true,
      unique: true,
    },
    description: {
      type: String,
      trim: true,
    },
    head: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

export const Department =
  mongoose.models.Department ||
  mongoose.model<IDepartment>("Department", DepartmentSchema);
