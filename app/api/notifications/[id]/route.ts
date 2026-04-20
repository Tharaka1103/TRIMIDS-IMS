import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import connectDB from "@/lib/db";
import Notification from "@/models/Notification";
import { hasPermission } from "@/lib/permissions";
import { PERMISSIONS } from "@/types/permissions";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    
    await connectDB();
    const body = await request.json();
    const resolvedParams = await params;
    
    if (body.action === "mark_read") {
      await Notification.findByIdAndUpdate(resolvedParams.id, {
        $addToSet: { isRead: session.userId }
      });
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getSession();
    if (!session || !hasPermission(session.role, PERMISSIONS.NOTIFICATION_SEND)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    await connectDB();

    const notification = await Notification.findById(id);

    if (!notification) {
      return NextResponse.json({ error: "Notification not found" }, { status: 404 });
    }

    if (notification.sender?.toString() !== session.userId && session.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await Notification.findByIdAndDelete(id);

    return NextResponse.json({ message: "Notification deleted successfully" });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
