import { NextResponse } from "next/server";
import { getSession } from '@/lib/auth';
import connectDB from '@/lib/db';
import Attendance from '@/models/Attendance';
import { startOfDay, endOfDay } from "date-fns";

export async function GET(request: Request) {
  try {
    const currentUser = await getSession();
    if (!currentUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectDB();
    
    // Admin can see all, employees see their own.
    const query = currentUser.role === "admin" ? {} : { user: currentUser.userId };
    
    const records = await Attendance.find(query)
      .populate("user", "name email")
      .sort({ date: -1 })
      .limit(50);

    return NextResponse.json(records);
  } catch (error) {
    console.error("Error fetching attendance:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
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
      record = await Attendance.create({
        user: currentUser.userId,
        date: todayStart,
        status: isLate ? "late" : "present",
        checkIn: now,
      });

    } else if (action === "checkOut") {
      if (!record || !record.checkIn) {
        return NextResponse.json({ error: "No check-in record found for today" }, { status: 400 });
      }
      if (record.checkOut) {
        return NextResponse.json({ error: "Already checked out today" }, { status: 400 });
      }

      record.checkOut = now;
      await record.save();
    } else {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    return NextResponse.json(record, { status: 200 });
  } catch (error) {
    console.error("Error with attendance:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

