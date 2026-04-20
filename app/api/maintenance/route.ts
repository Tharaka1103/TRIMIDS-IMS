import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import MaintenanceWindow from "@/models/MaintenanceWindow";

/**
 * GET /api/maintenance?upcoming=true
 * Returns next upcoming/active maintenance window.
 * Also auto-syncs statuses: activates scheduled windows that have started,
 * and completes active windows that have ended.
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    await connectDB();
    const searchParams = request.nextUrl.searchParams;

    if (searchParams.get("upcoming") === "true") {
      const now = new Date();

      // Auto-activate scheduled maintenance whose start time has passed
      await MaintenanceWindow.updateMany(
        {
          status: "scheduled",
          startTime: { $lte: now },
          endTime: { $gt: now },
        },
        { $set: { status: "active", isActive: true } }
      );

      // Auto-complete active maintenance whose end time has passed
      await MaintenanceWindow.updateMany(
        {
          status: "active",
          endTime: { $lte: now },
        },
        { $set: { status: "completed", isActive: false } }
      );

      // Return next upcoming or currently active maintenance
      const maintenance = await MaintenanceWindow.findOne({
        status: { $in: ["scheduled", "active"] },
        endTime: { $gt: now },
      })
        .sort({ startTime: 1 })
        .lean();

      return NextResponse.json({ maintenance });
    }

    return NextResponse.json({ maintenance: null });
  } catch (error) {
    console.error("Error in maintenance status check:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}