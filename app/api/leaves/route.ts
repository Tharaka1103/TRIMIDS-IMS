import { NextResponse } from "next/server";
import { getSession } from '@/lib/auth';
import connectDB from '@/lib/db';
import { LeaveRequest } from "@/models/LeaveRequest";
import { hasPermission } from "@/lib/permissions";

export async function GET(request: Request) {
  try {
    const currentUser = await getSession();
    if (!currentUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectDB();
    const { searchParams } = new URL(request.url);
    const mineOnly = searchParams.get("mine") === "true";

    const query = mineOnly ? { user: currentUser.userId } : {};

    // Only HR/Admins can see non-mine requests
    if (!mineOnly && !hasPermission(currentUser.role, "manage:events" as any)) { // Using events as a proxy for hr actions if manage:users not assigned, let's assume if it's admin or hr. (HR generally has 'manage:users' in our permission schema)
       if (!["admin", "hr", "manager"].includes(currentUser.role)) {
          return NextResponse.json({ error: "Forbidden" }, { status: 403 });
       }
    }

    const leaves = await LeaveRequest.find(query)
      .populate("user", "name email")
      .populate("approvedBy", "name")
      .sort({ createdAt: -1 });

    return NextResponse.json(leaves);
  } catch (error) {
    console.error("Error fetching leaves:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
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

    return NextResponse.json(leave, { status: 201 });
  } catch (error) {
    console.error("Error creating leave request:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const currentUser = await getSession();
    if (!currentUser || !["admin", "hr", "manager"].includes(currentUser.role)) {
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

    return NextResponse.json(leave);
  } catch (error) {
    console.error("Error updating leave request:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

