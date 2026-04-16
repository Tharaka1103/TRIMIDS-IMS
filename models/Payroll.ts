import mongoose from "mongoose";

const payrollSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  month: { type: String, required: true },
  year: { type: Number, required: true },
  baseSalary: { type: Number, required: true },
  bonuses: { type: Number, default: 0 },
  deductions: { type: Number, default: 0 },
  netPay: { type: Number, required: true },
  status: { type: String, enum: ["Draft", "Approved", "Paid"], default: "Draft" },
}, { timestamps: true });

export const Payroll = mongoose.models.Payroll || mongoose.model("Payroll", payrollSchema);