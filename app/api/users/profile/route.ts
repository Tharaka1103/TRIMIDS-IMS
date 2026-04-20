import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import connectDB from "@/lib/db";
import User from "@/models/User";
import { logAuditActivity } from "@/lib/audit";

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const user = await User.findById(session.userId).select("-password -sessionToken").lean();
    
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ user });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const updates = await req.json();

    await connectDB();
    // Exclude password from the initial fetch to avoid exposing it,
    // but if we are saving we might need it? Actually Mongoose requires +password to bypass "required" validation
    // wait, we can just use findByIdAndUpdate to avoid validation errors on unselected fields
    const user = await User.findById(session.userId).select("+password");
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Only allow specific updates (name, mobile, avatar, preferences, etc.)
    // Explicitly disallow changing role or core security settings via this route.
    const allowedFields = ["name", "mobile", "avatar", "preferences"];
    
    Object.keys(updates).forEach((key) => {
      if (allowedFields.includes(key)) {
        if (key === "preferences") {
          // Merge preferences safely
          if (updates.preferences && typeof updates.preferences === 'object') {
            Object.keys(updates.preferences).forEach((prefKey) => {
              user.set(`preferences.${prefKey}`, updates.preferences[prefKey]);
            });
          }
        } else {
          user.set(key, updates[key]);
        }
      }
    });

    if (updates.password) {
      user.password = updates.password;
    }

    await user.save();

    await logAuditActivity({
      user: session.userId,
      action: "update_profile",
      resource: "users",
      resourceId: session.userId,
      req,
      details: { updatedFields: Object.keys(updates) }
    });

    const updatedProfile = await User.findById(session.userId).select("-password -sessionToken").lean();

    return NextResponse.json({ 
      user: updatedProfile, 
      message: "Profile updated successfully" 
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}