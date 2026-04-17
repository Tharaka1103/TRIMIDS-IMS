import { NextRequest, NextResponse } from "next/server";
import { getSession } from '@/lib/auth';
import { hasPermission } from "@/lib/permissions";
import connectDB from '@/lib/db';
import Department from "@/models/Department";
import { logAuditActivity } from "@/lib/audit";

export async function GET(req: NextRequest) {
  try {
    const currentUser = await getSession();
    if (!currentUser || (!hasPermission(currentUser.role, "manage:system" as any) && currentUser.role !== "hr_manager")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    await connectDB();
    const departments = await Department.find()
      .populate("head", "name email")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json(departments);
  } catch (error) {
    console.error("Error fetching departments:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const currentUser = await getSession();
    if (!currentUser || !hasPermission(currentUser.role, "manage:system" as any)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { name, description } = await request.json();
    if (!name) return NextResponse.json({ error: "Name is required" }, { status: 400 });

    await connectDB();
    const department = await Department.create({ name, description });
    
    await logAuditActivity({
      user: currentUser.userId,
      action: "create_department",
      resource: "departments",
      resourceId: department._id.toString(),
      details: { name },
      req: request
    });

    return NextResponse.json(department, { status: 201 });
  } catch (error: any) {
    if (error.code === 11000) {
      return NextResponse.json({ error: "Department already exists" }, { status: 409 });
    }
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

