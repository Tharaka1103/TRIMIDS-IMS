import { NextRequest, NextResponse } from "next/server";
import { getSession } from '@/lib/auth';
import connectDB from '@/lib/db';
import { Expense } from "@/models/Expense";
import { logAuditActivity } from "@/lib/audit";

export async function GET(request: NextRequest) {
  try {
    const currentUser = await getSession();
    if (!currentUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectDB();
    const { searchParams } = new URL(request.url);
    const mineOnly = searchParams.get("mine") === "true";

    const query: any = mineOnly ? { user: currentUser.userId } : {};

    if (!mineOnly && !["admin", "finance_manager"].includes(currentUser.role)) {
       return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const expenses = await Expense.find(query)
      .populate("user", "name email")
      .populate("approvedBy", "name")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json(expenses);
  } catch (error) {
    console.error("Error fetching expenses:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const currentUser = await getSession();
    if (!currentUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { description, category, amount, receiptUrl } = await request.json();
    if (!description || !category || amount === undefined) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    await connectDB();
    const expense = await Expense.create({
      user: currentUser.userId,
      description,
      category,
      amount: Number(amount),
      receiptUrl,
    });

    await logAuditActivity({
      user: currentUser.userId,
      action: "submit_expense",
      resource: "expenses",
      resourceId: expense._id.toString(),
      details: { amount, category, description },
      req: request
    });

    return NextResponse.json(expense, { status: 201 });
  } catch (error) {
    console.error("Error creating expense:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const currentUser = await getSession();
    if (!currentUser || !["admin", "finance_manager"].includes(currentUser.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { id, status } = await request.json();
    if (!id || !["Approved", "Paid", "Rejected"].includes(status)) {
      return NextResponse.json({ error: "Invalid parameters" }, { status: 400 });
    }

    await connectDB();
    const expense = await Expense.findByIdAndUpdate(
      id,
      { status, approvedBy: currentUser.userId },
      { new: true }
    );
    
    if (expense) {
      await logAuditActivity({
        user: currentUser.userId,
        action: `expense_${status.toLowerCase()}`,
        resource: "expenses",
        resourceId: expense._id.toString(),
        details: { status, amount: expense.amount },
        req: request
      });
    }

    return NextResponse.json(expense);
  } catch (error) {
    console.error("Error updating expense:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

