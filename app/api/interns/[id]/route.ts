import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import connectDB from "@/lib/db";
import User from "@/models/User";
import { logAuditActivity } from "@/lib/audit";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getSession();
    if (!session || (session.role !== "admin" && session.role !== "hr_manager")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    await connectDB();
    const user = await User.findOne({ _id: id, role: "intern" }).select("-password");

    if (!user) {
      return NextResponse.json({ error: "Intern not found" }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error: any) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getSession();
    if (!session || (session.role !== "admin" && session.role !== "hr_manager")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    await connectDB();
    
    // We allow updating name, email, department, mobile, isActive
    const updates = await req.json();
    const { name, email, department, mobile, isActive } = updates;

    const user = await User.findOneAndUpdate(
      { _id: id, role: "intern" },
      { name, email, department, mobile, isActive },
      { new: true }
    ).select("-password");

    if (!user) {
      return NextResponse.json({ error: "Intern not found" }, { status: 404 });
    }

    await logAuditActivity({
      user: session.userId,
      action: "update_intern",
      resource: "users",
      resourceId: user._id.toString(),
      details: { updates },
      req
    });

    return NextResponse.json(user);
  } catch (error: any) {
    if (error.code === 11000) {
      return NextResponse.json({ error: "Email already exists" }, { status: 409 });
    }
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getSession();
    if (!session || (session.role !== "admin" && session.role !== "hr_manager")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    await connectDB();
    const user = await User.findOneAndDelete({ _id: id, role: "intern" });

    if (!user) {
      return NextResponse.json({ error: "Intern not found" }, { status: 404 });
    }

    await logAuditActivity({
      user: session.userId,
      action: "delete_intern",
      resource: "users",
      resourceId: id,
      req
    });

    return NextResponse.json({ message: "Intern successfully deleted" });
  } catch (error: any) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
