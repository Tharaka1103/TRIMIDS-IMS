import mongoose, { Schema, Document } from "mongoose";

export interface IExpense extends Document {
  user: mongoose.Types.ObjectId;
  description: string;
  category: "Travel" | "Operations" | "Software" | "Hardware" | "Other";
  amount: number;
  status: "Pending" | "Approved" | "Paid" | "Rejected";
  receiptUrl?: string;
  approvedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ExpenseSchema = new Schema<IExpense>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      enum: ["Travel", "Operations", "Software", "Hardware", "Other"],
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ["Pending", "Approved", "Paid", "Rejected"],
      default: "Pending",
    },
    receiptUrl: {
      type: String,
    },
    approvedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

export const Expense =
  mongoose.models.Expense ||
  mongoose.model<IExpense>("Expense", ExpenseSchema);
