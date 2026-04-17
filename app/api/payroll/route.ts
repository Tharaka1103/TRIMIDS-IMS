import { NextRequest, NextResponse } from "next/server";
import connectDB from '@/lib/db';
import { Payroll } from "@/models/Payroll";
import User from '@/models/User';
import { getSession } from '@/lib/auth';
import { logAuditActivity } from "@/lib/audit";

export async function GET(req: NextRequest) {
  try {
    const user = await getSession();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const mineOnly = searchParams.get("mine") === "true";

    await connectDB();

    if (mineOnly) {
      const payrolls = await Payroll.find({ user: user.userId }).populate("user", "name email").sort({ createdAt: -1 }).lean();
      return NextResponse.json(payrolls);
    }

    if (!["admin", "finance_manager", "hr_manager"].includes(user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const payrolls = await Payroll.find({}).populate("user", "name email department").sort({ createdAt: -1 }).lean();
    return NextResponse.json(payrolls);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getSession();
    if (!user || !["admin", "finance_manager", "hr_manager"].includes(user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await connectDB();
    const body = await req.json();

    const netPay = Number(body.baseSalary) + Number(body.bonuses || 0) - Number(body.deductions || 0);

    const newPayroll = await Payroll.create({
      ...body,
      netPay
    });

    await logAuditActivity({
      user: user.userId,
      action: "create_payroll",
      resource: "payroll",
      resourceId: newPayroll._id.toString(),
      details: { amount: netPay, month: body.month, year: body.year, employee: body.user },
      req
    });

    const populated = await newPayroll.populate("user", "name email");
    return NextResponse.json(populated, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const user = await getSession();
    if (!user || !["admin", "finance_manager", "hr_manager"].includes(user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await connectDB();
    const body = await req.json();

    if (!body.id || !body.status) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const payroll = await Payroll.findByIdAndUpdate(
      body.id,
      { status: body.status },
      { new: true }
    ).populate("user", "name email");

    if (!payroll) {
      return NextResponse.json({ error: "Payroll not found" }, { status: 404 });
    }

    await logAuditActivity({
      user: user.userId,
      action: "update_payroll_status",
      resource: "payroll",
      resourceId: payroll._id.toString(),
      details: { status: body.status, employee: payroll.user?._id },
      req
    });

    return NextResponse.json(payroll);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
