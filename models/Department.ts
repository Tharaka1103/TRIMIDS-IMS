import mongoose, { Schema, Document } from 'mongoose';

export interface IDepartment extends Document {
  name: string;
  description?: string;
  head?: mongoose.Types.ObjectId;
  budget: number;
  employeeCount: number;
}

const DepartmentSchema = new Schema<IDepartment>(
  {
    name: { type: String, required: true, unique: true, trim: true },
    description: { type: String, trim: true },
    head: { type: Schema.Types.ObjectId, ref: 'User' },
    budget: { type: Number, required: true, default: 0, min: 0 },
    employeeCount: { type: Number, required: true, default: 0, min: 0 },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Department || mongoose.model<IDepartment>('Department', DepartmentSchema);
