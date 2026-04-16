import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import User from "@/models/User";
import AuditLog from "@/models/AuditLog";
import { setSession, getRoleRedirect } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    const user = await User.findOne({ email: email.toLowerCase() })
      .select("+password +sessionToken")
      .lean<any>(false);

    if (!user) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Check if account is locked
    if (user.isLocked && user.isLocked()) {
      const lockTime = Math.ceil(
        ((user.lockUntil as Date).getTime() - Date.now()) / 60000
      );
      return NextResponse.json(
        {
          error: `Account locked. Try again in ${lockTime} minutes.`,
        },
        { status: 423 }
      );
    }

    // Check if account is active
    if (!user.isActive) {
      return NextResponse.json(
        { error: "Account is deactivated. Contact administrator." },
        { status: 403 }
      );
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      await user.incrementLoginAttempts();

      await AuditLog.create({
        user: user._id,
        action: "login_failed",
        resource: "auth",
        details: { email },
        ipAddress: request.headers.get("x-forwarded-for") || "unknown",
        userAgent: request.headers.get("user-agent") || "unknown",
        status: "failure",
      });

      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Reset login attempts on successful login
    await User.findByIdAndUpdate(user._id, {
      $set: { loginAttempts: 0, lastLogin: new Date() },
      $unset: { lockUntil: 1 },
    });

    // Create session
    const response = NextResponse.json({
      success: true,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
      },
      redirectTo: getRoleRedirect(user.role),
    });

    await setSession(response, {
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
      name: user.name,
    });

    // Audit log
    await AuditLog.create({
      user: user._id,
      action: "login_success",
      resource: "auth",
      ipAddress: request.headers.get("x-forwarded-for") || "unknown",
      userAgent: request.headers.get("user-agent") || "unknown",
      status: "success",
    });

    return response;
  } catch (error: any) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}