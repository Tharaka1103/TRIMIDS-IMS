import { NextResponse } from "next/server";
import { getSession } from '@/lib/auth';
import { hasPermission } from "@/lib/permissions";
import { PERMISSIONS } from "@/types/permissions";
import connectDB from '@/lib/db';
import AuditLog from '@/models/AuditLog';

export async function GET() {
  try {
    const currentUser = await getSession();
    if (!currentUser || !hasPermission(currentUser.role, PERMISSIONS.AUDIT_VIEW)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    await connectDB();
    // Find all successful login logs
    const logs = await AuditLog.find({
      action: "login_success",
      resource: "auth"
    })
      .populate("user", "name email role lastLogin")
      .sort({ createdAt: -1 })
      .limit(200)
      .lean();

    // Map to a clean response shape
    const result = logs.map((log: Record<string, unknown>) => {
      const user = log.user as Record<string, unknown> | null;
      return {
        _id: log._id,
        admin: {
          id: user?._id,
          name: user?.name,
          email: user?.email,
          role: user?.role,
          lastLogin: user?.lastLogin,
        },
        timestamp: log.createdAt,
        ipAddress: log.ipAddress,
        userAgent: log.userAgent,
        status: log.status,
        details: log.details,
      };
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching admin login logs:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
