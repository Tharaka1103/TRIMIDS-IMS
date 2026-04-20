import { NextRequest, NextResponse } from "next/server";
import { getSession } from '@/lib/auth';
import connectDB from '@/lib/db';
import Attendance from '@/models/Attendance';
import { startOfDay, endOfDay } from "date-fns";
import { logAuditActivity } from "@/lib/audit";

export async function GET(request: NextRequest) {
  try {
    const currentUser = await getSession();
    if (!currentUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectDB();

    // Admin/HR can see all, employees see their own.
    const isAdminOrHR = (currentUser.role as any) === "admin" || currentUser.role === "hr_manager";
    const query = isAdminOrHR ? {} : { user: currentUser.userId };

    const records = await Attendance.find(query)
      .populate("user", "name email")
      .sort({ date: -1 })
      .lean();

    return NextResponse.json(records);
  } catch (error) {
    console.error("Error fetching attendance:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const currentUser = await getSession();
    if (!currentUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectDB();

    const { action } = await request.json(); // "checkIn" or "checkOut"
    const now = new Date();
    const todayStart = startOfDay(now);
    const todayEnd = endOfDay(now);

    let record = await Attendance.findOne({
      user: currentUser.userId,
      date: { $gte: todayStart, $lte: todayEnd },
    });

    if (action === "checkIn") {
      if (record && record.checkIn) {
        return NextResponse.json({ error: "Already checked in today" }, { status: 400 });
      }

      const isLate = now.getHours() > 9; // example threshold 9 AM
      if (!record) {
        record = await Attendance.create({
          user: currentUser.userId,
          date: todayStart,
          status: isLate ? "late" : "present",
          checkIn: now,
        });
      } else {
        record.checkIn = now;
        record.status = isLate ? "late" : "present";
        await record.save();
      }

    } else if (action === "checkOut") {
      if (!record || !record.checkIn) {
        return NextResponse.json({ error: "No check-in record found for today" }, { status: 400 });
      }
      if (record.checkOut) {
        return NextResponse.json({ error: "Already checked out today" }, { status: 400 });
      }

      record.checkOut = now;
      if (record.checkIn) {
        const diffMs = now.getTime() - record.checkIn.getTime();
        const diffHrs = Math.round((diffMs / (1000 * 60 * 60)) * 100) / 100;
        record.workHours = diffHrs;
      }
      await record.save();
    } else {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });   
    }

    await logAuditActivity({
      user: currentUser.userId,
      action: `attendance_${action}`,
      resource: "attendance",
      resourceId: record._id.toString(),
      details: { action, time: now },
      req: request
    });

    return NextResponse.json(record, { status: 200 });
  } catch (error) {
    console.error("Error with attendance:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

