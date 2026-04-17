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
    
    // In a real app we'd validate with Zod here
    
    const existingUser = await User.findOne({ email: body.email });
    if (existingUser) {
      return NextResponse.json({ error: "Email already exists" }, { status: 400 });
    }

    const user = await User.create({
      ...body,
      createdBy: session.userId,
      password: body.password || "Password@123" // default password if not provided
    });

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
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}