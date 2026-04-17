import { NextRequest, NextResponse } from "next/server";
import { getSession } from '@/lib/auth';
import connectDB from '@/lib/db';
import { LeaveRequest } from "@/models/LeaveRequest";
import { hasPermission } from "@/lib/permissions";
import { logAuditActivity } from "@/lib/audit";

export async function GET(request: NextRequest) {
  try {
    const currentUser = await getSession();
    if (!currentUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectDB();
    const { searchParams } = new URL(request.url);
    const mineOnly = searchParams.get("mine") === "true";

    const query: any = mineOnly ? { user: currentUser.userId } : {};

    if (!mineOnly) { 
       if (!["admin", "hr_manager", "finance_manager"].includes(currentUser.role)) {
          return NextResponse.json({ error: "Forbidden" }, { status: 403 });
       }
    }

    const leaves = await LeaveRequest.find(query)
      .populate("user", "name email")
      .populate("approvedBy", "name")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json(leaves);
  } catch (error) {
    console.error("Error fetching leaves:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const currentUser = await getSession();
    if (!currentUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { type, startDate, endDate, reason } = await request.json();
    if (!type || !startDate || !endDate || !reason) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    await connectDB();
    const leave = await LeaveRequest.create({
      user: currentUser.userId,
      type,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      reason,
    });

    await logAuditActivity({
      user: currentUser.userId,
      action: "create_leave_request",
      resource: "leaves",
      resourceId: leave._id.toString(),
      details: { type, startDate, endDate, reason },
      req: request
    });

    return NextResponse.json(leave, { status: 201 });
  } catch (error: any) {
    console.error("Error creating leave request:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const currentUser = await getSession();
    if (!currentUser || !["admin", "hr_manager"].includes(currentUser.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { id, status } = await request.json();
    if (!id || !["Approved", "Rejected"].includes(status)) {
      return NextResponse.json({ error: "Invalid parameters" }, { status: 400 });
    }

    await connectDB();
    const leave = await LeaveRequest.findByIdAndUpdate(
      id,
      { status, approvedBy: currentUser.userId },
      { new: true }
    );

    if (leave) {
      await logAuditActivity({
        user: currentUser.userId,
        action: `leave_${status.toLowerCase()}`,
        resource: "leaves",
        resourceId: leave._id.toString(),
        details: { status },
        req: request
      });
    }

    return NextResponse.json(leave);
  } catch (error: any) {
    console.error("Error updating leave request:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

