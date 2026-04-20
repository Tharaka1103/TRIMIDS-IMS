import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";
import { PERMISSIONS } from "@/types/permissions";
import connectDB from "@/lib/db";
import MaintenanceWindow from "@/models/MaintenanceWindow";
import mongoose from "mongoose";

/**
 * PATCH /api/maintenance/[id]
 * Update a maintenance window — supports field updates and status transitions.
 * body.action can be: "activate" | "complete" | "cancel" for quick status changes.
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const currentUser = await getSession();
    if (
      !currentUser ||
      !hasPermission(currentUser.role, PERMISSIONS.MAINTENANCE_MANAGE)
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { id } = await params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "Invalid maintenance ID" },
        { status: 400 }
      );
    }

    await connectDB();

    const maintenance = await MaintenanceWindow.findById(id);
    if (!maintenance) {
      return NextResponse.json(
        { error: "Maintenance window not found" },
        { status: 404 }
      );
    }

    const body = await request.json();

    // Handle quick status actions
    if (body.action) {
      switch (body.action) {
        case "activate":
          if (maintenance.status === "completed" || maintenance.status === "cancelled") {
            return NextResponse.json(
              { error: "Cannot activate a completed or cancelled maintenance" },
              { status: 400 }
            );
          }
          maintenance.status = "active";
          maintenance.isActive = true;
          break;

        case "complete":
          if (maintenance.status !== "active") {
            return NextResponse.json(
              { error: "Only active maintenance can be completed" },
              { status: 400 }
            );
          }
          maintenance.status = "completed";
          maintenance.isActive = false;
          maintenance.endTime = new Date();
          break;

        case "cancel":
          if (maintenance.status === "completed") {
            return NextResponse.json(
              { error: "Cannot cancel a completed maintenance" },
              { status: 400 }
            );
          }
          maintenance.status = "cancelled";
          maintenance.isActive = false;
          break;

        default:
          return NextResponse.json(
            { error: "Invalid action" },
            { status: 400 }
          );
      }

      await maintenance.save();
      const populated = await MaintenanceWindow.findById(id)
        .populate("scheduledBy", "name email")
        .lean();
      return NextResponse.json(populated);
    }

    // Handle field updates
    if (maintenance.status === "completed" || maintenance.status === "cancelled") {
      return NextResponse.json(
        { error: "Cannot edit a completed or cancelled maintenance window" },
        { status: 400 }
      );
    }

    const { title, description, startTime, endTime } = body;

    if (title) maintenance.title = title;
    if (description) maintenance.description = description;
    if (startTime) maintenance.startTime = new Date(startTime);
    if (endTime) maintenance.endTime = new Date(endTime);

    // Re-check status based on updated times
    const now = new Date();
    if (maintenance.startTime <= now && maintenance.endTime > now) {
      maintenance.status = "active";
      maintenance.isActive = true;
    } else if (maintenance.endTime <= now) {
      maintenance.status = "completed";
      maintenance.isActive = false;
    } else {
      maintenance.status = "scheduled";
      maintenance.isActive = false;
    }

    await maintenance.save();

    const populated = await MaintenanceWindow.findById(id)
      .populate("scheduledBy", "name email")
      .lean();

    return NextResponse.json(populated);
  } catch (error) {
    console.error("Error updating maintenance:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/maintenance/[id]
 * Cancel (soft-delete) a maintenance window.
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const currentUser = await getSession();
    if (
      !currentUser ||
      !hasPermission(currentUser.role, PERMISSIONS.MAINTENANCE_MANAGE)
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { id } = await params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "Invalid maintenance ID" },
        { status: 400 }
      );
    }

    await connectDB();

    const maintenance = await MaintenanceWindow.findById(id);
    if (!maintenance) {
      return NextResponse.json(
        { error: "Maintenance window not found" },
        { status: 404 }
      );
    }

    if (maintenance.status === "active") {
      // Deactivate first then cancel
      maintenance.isActive = false;
    }

    maintenance.status = "cancelled";
    maintenance.isActive = false;
    await maintenance.save();

    return NextResponse.json({ success: true, message: "Maintenance cancelled" });
  } catch (error) {
    console.error("Error deleting maintenance:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
