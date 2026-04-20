import { NextResponse } from "next/server";
import { getSession } from '@/lib/auth';
import { hasPermission } from "@/lib/permissions";
import { PERMISSIONS } from "@/types/permissions";
import connectDB from '@/lib/db';
import MaintenanceWindow from '@/models/MaintenanceWindow';

export async function GET(request: Request) {
  try {
    const currentUser = await getSession();
    
    if (!currentUser || !hasPermission(currentUser.role, PERMISSIONS.MAINTENANCE_MANAGE)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    await connectDB();
    
    const schedules = await MaintenanceWindow.find()
      .populate("scheduledBy", "name email")
      .sort({ startTime: -1 });
      
    return NextResponse.json(schedules);
  } catch (error) {
    console.error("Error fetching maintenance schedules:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const currentUser = await getSession();
    
    if (!currentUser || !hasPermission(currentUser.role, PERMISSIONS.MAINTENANCE_MANAGE)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { title, description, startTime, endTime } = await request.json();

    if (!title || !description || !startTime || !endTime) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    await connectDB();

    // Check for overlap
    const existing = await MaintenanceWindow.findOne({
      $or: [
        {
          startTime: { $lt: new Date(endTime) },
          endTime: { $gt: new Date(startTime) },
        },
      ],
      status: { $ne: "completed" },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Maintenance window overlaps with an existing schedule" },
        { status: 409 }
      );
    }

    // Determine status based on start time
    let status = "scheduled";
    const now = new Date();
    if (new Date(startTime) <= now && new Date(endTime) > now) {
      status = "active";
    }

    const newWindow = await MaintenanceWindow.create({
      title,
      description,
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      status,
      scheduledBy: currentUser.userId,
    });

    return NextResponse.json(newWindow, { status: 201 });
  } catch (error) {
    console.error("Error creating maintenance schedule:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

