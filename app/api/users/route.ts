import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import connectDB from "@/lib/db";
import User from "@/models/User";
import { hasPermission } from "@/lib/permissions";
import { PERMISSIONS } from "@/types/permissions";
import { logAuditActivity } from "@/lib/audit";

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || !hasPermission(session.role, PERMISSIONS.USER_VIEW)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const users = await User.find({})
      .select("-password -sessionToken")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ users });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || !hasPermission(session.role, PERMISSIONS.USER_CREATE)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const body = await request.json();
    
    // Validate required fields
    if (!body.name || !body.email || !body.role) {
      return NextResponse.json({ error: "Name, email, and role are required" }, { status: 400 });
    }

    // Normalize role to lowercase
    const normalizedRole = body.role.toLowerCase();
    
    const existingUser = await User.findOne({ email: body.email });
    if (existingUser) {
      return NextResponse.json({ error: "Email already exists" }, { status: 400 });
    }

    const userData = {
      name: body.name,
      email: body.email.toLowerCase(),
      role: normalizedRole,
      department: body.department || "",
      position: body.position || "",
      isActive: body.isActive !== undefined ? body.isActive : true,
      createdBy: session.userId,
      password: body.password || "Password@123"
    };

    const user = await User.create(userData);

      await logAuditActivity({
        user: session.userId,
        action: "create_user",
        resource: "users",
        resourceId: user._id.toString(),
        details: { email: user.email, role: user.role },
        req: request,
      });

      const userWithoutPassword = await User.findById(user._id).select("-password -sessionToken").lean();

      return NextResponse.json(
        { user: userWithoutPassword, message: "User created successfully" },
        { status: 201 }
      );
    } catch (error: any) {
    console.error("POST /api/users error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}