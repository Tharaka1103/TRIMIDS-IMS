import mongoose, { Schema, Document } from 'mongoose';

export interface IFinance extends Document {
  type: 'income' | 'expense';
  description: string;
  category: string;
  amount: number;
  status: 'Pending' | 'Approved' | 'Paid' | 'Rejected';
  date: Date;
  receiptUrl?: string;
  approvedBy?: mongoose.Types.ObjectId;
  createdBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const FinanceSchema = new Schema<IFinance>(
  {
    type: {
      type: String,
      enum: ['income', 'expense'],
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ['Pending', 'Approved', 'Paid', 'Rejected'],
      default: 'Pending',
    },
    date: {
      type: Date,
      required: true,
      default: Date.now,
    },
    receiptUrl: {
      type: String,
    },
    approvedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
);

export const Finance =
  mongoose.models.Finance ||
  mongoose.model<IFinance>('Finance', FinanceSchema);
