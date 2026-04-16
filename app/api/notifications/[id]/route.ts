import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Notification from "@/models/Notification";
import { getSession } from "@/lib/auth";

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