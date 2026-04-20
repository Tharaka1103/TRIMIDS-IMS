import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import connectDB from "@/lib/db";
import User from "@/models/User";
import Intern from "@/models/Intern";
import Department from "@/models/Department";
import Task from "@/models/Task";
import Attendance from "@/models/Attendance";
import {LeaveRequest} from "@/models/LeaveRequest";

// Helper mapper for flattening arrays
function mapUsers(docs: any[]) {
    return docs.map(d => [d.name, d.email, d.role, d.department || '-', d.isActive ? 'Active' : 'Inactive']);
}

function mapInterns(docs: any[]) {
    return docs.map(d => [
      d.user?.name || 'Unknown', 
      d.university || '-', 
      d.status, 
      d.totalWeeks, 
      d.startDate ? new Date(d.startDate).toLocaleDateString() : '-',
      d.endDate ? new Date(d.endDate).toLocaleDateString() : '-'
    ]);
}

function mapDepartments(docs: any[]) {
    return docs.map(d => [d.name, d.description || '-', typeof d.manager === 'object' ? d.manager?.name : (d.manager || '-'), d.createdAt ? new Date(d.createdAt).toLocaleDateString() : '-']);
}

function mapTasks(docs: any[]) {
    return docs.map(d => [d.title, d.status, d.priority, d.assignedTo?.name || '-', d.dueDate ? new Date(d.dueDate).toLocaleDateString() : '-']);
}

function mapAttendances(docs: any[]) {
    return docs.map(d => [
      d.user?.name || '-', 
      d.date ? new Date(d.date).toLocaleDateString() : '-',
      d.status,
      d.checkIn || '-',
      d.checkOut || '-',
      d.workingHours || '-'
    ]);
}

function mapLeaves(docs: any[]) {
    return docs.map(d => [
      d.user?.name || '-', 
      d.type, 
      `${new Date(d.startDate).toLocaleDateString()} - ${new Date(d.endDate).toLocaleDateString()}`,
      d.status,
      d.reason || '-'
    ]);
}

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || (session.role !== "admin" && session.role !== "hr_manager")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type");

    await connectDB();

    let data: any[] = [];
    let columns: string[] = [];
    let title = "System Report";

    switch(type) {
      case "users":
        const usersDocs = await User.find({}).lean();
        columns = ["Name", "Email", "Role", "Department", "Status"];
        data = mapUsers(usersDocs);
        title = "All Users Report";
        break;
      case "interns":
        const internsDocs = await Intern.find({}).populate("user", "name").lean();
        columns = ["Intern Name", "University", "Status", "Weeks", "Start Date", "End Date"];
        data = mapInterns(internsDocs);
        title = "Interns & Evaluations Report";
        break;
      case "departments":
        const deptsDocs = await Department.find({}).populate("manager", "name").lean();
        columns = ["Department Name", "Description", "Manager", "Created At"];
        data = mapDepartments(deptsDocs);
        title = "Departments Report";
        break;
      case "tasks":
        const tasksDocs = await Task.find({}).populate("assignedTo", "name").lean();
        columns = ["Task Title", "Status", "Priority", "Assigned To", "Due Date"];
        data = mapTasks(tasksDocs);
        title = "Tasks Report";
        break;
      case "attendances":
        const attDocs = await Attendance.find({}).populate("user", "name").lean();
        columns = ["User", "Date", "Status", "Check-In", "Check-Out", "Hours"];
        data = mapAttendances(attDocs);
        title = "Attendance Records";
        break;
      case "leaveRequests":
        const leaveDocs = await LeaveRequest.find({}).populate("user", "name").lean();
        columns = ["User", "Type", "Date Range", "Status", "Reason"];
        data = mapLeaves(leaveDocs);
        title = "Leave Requests Report";
        break;
      default:
        return NextResponse.json({ error: "Invalid report type requested" }, { status: 400 });
    }

    return NextResponse.json({
        title,
        columns,
        data
    });
  } catch (error: any) {
    console.error("Export error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}