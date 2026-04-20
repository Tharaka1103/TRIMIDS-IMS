import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import connectDB from "@/lib/db";
import User from "@/models/User";
import Intern from "@/models/Intern";
import Department from "@/models/Department";
import Task from "@/models/Task";
import Attendance from "@/models/Attendance";
import {LeaveRequest} from "@/models/LeaveRequest";

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || (session.role !== "admin" && session.role !== "hr_manager")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    await connectDB();

    const [
      users,
      interns,
      departments,
      tasks,
      attendances,
      leaveRequests
    ] = await Promise.all([
      User.countDocuments(),
      Intern.countDocuments(),
      Department.countDocuments(),
      Task.countDocuments(),
      Attendance.countDocuments(),
      LeaveRequest.countDocuments()
    ]);

    return NextResponse.json({
      users,
      interns,
      departments,
      tasks,
      attendances,
      leaveRequests
    });
  } catch (error: any) {
    console.error("Summary error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}