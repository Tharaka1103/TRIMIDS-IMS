import { NextResponse } from "next/server";
import { getSession } from '@/lib/auth';
import { hasPermission } from "@/lib/permissions";
import connectDB from '@/lib/db';
import AuditLog from '@/models/AuditLog';

export async function GET() {
  try {
    const currentUser = await getSession();
    if (!currentUser || !hasPermission(currentUser.role, "manage:system" as any)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    await connectDB();
    const logs = await AuditLog.find()
      .populate("actor", "name email")
      .sort({ createdAt: -1 })
      .limit(100);

    return NextResponse.json(logs);
  } catch (error) {
    console.error("Error fetching audit logs:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

