import { NextRequest, NextResponse } from "next/server";
import { getSession } from '@/lib/auth';
import connectDB from '@/lib/db';
import User from '@/models/User';
import { logAuditActivity } from '@/lib/audit';

export async function GET(request: NextRequest) {
  try {
    const currentUser = await getSession();
    
    if (!currentUser || (currentUser.role !== "admin" && currentUser.role !== "hr_manager")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    await connectDB();
    
    const interns = await User.find({ role: "intern" })
      .select("-password")
      .sort({ createdAt: -1 });
      
    return NextResponse.json(interns);
  } catch (error) {
    console.error("Error fetching interns:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const currentUser = await getSession();
    
    if (!currentUser || (currentUser.role !== "admin" && currentUser.role !== "hr_manager")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { name, email, password, department, mobile } = await request.json();
    
    if (!name || !email || !password) {
      return NextResponse.json({ error: "Name, email, and password are required" }, { status: 400 });
    }

    await connectDB();
    
    const newIntern = await User.create({
      name,
      email,
      password,
      role: "intern",
      department,
      mobile,
      createdBy: currentUser.userId
    });
    
    await logAuditActivity({
      user: currentUser.userId,
      action: "create_intern",
      resource: "users",
      resourceId: newIntern._id.toString(),
      details: { email },
      req: request
    });

    const populated = await User.findById(newIntern._id).select("-password").lean();
    return NextResponse.json(populated, { status: 201 });
  } catch (error: any) {
    console.error("Error creating intern:", error);
    if (error.code === 11000) {
      return NextResponse.json({ error: "Email already exists" }, { status: 409 });
    }
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

