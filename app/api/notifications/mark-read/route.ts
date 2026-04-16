import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Notification from "@/models/Notification";
import { getSession } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    
    await connectDB();
    const body = await request.json();
    
    if (body.markAll) {
      await Notification.updateMany(
        { 
          $or: [{ recipients: session.userId }, { recipientRoles: session.role }], 
          isRead: { $ne: session.userId } 
        },
        { $push: { isRead: session.userId } }
      );
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}