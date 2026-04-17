import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import connectDB from "@/lib/db";
import User from "@/models/User";
import { logAuditActivity } from "@/lib/audit";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getSession();
    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const userToUpdate = await User.findById(id);
    if (!userToUpdate) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const updates = await request.json();

    if (updates.password) {
      userToUpdate.password = updates.password;
    }

    Object.keys(updates).forEach(key => {
      if (key !== 'password' && key !== '_id') {
        userToUpdate.set(key, updates[key]);
      }
    });

    await userToUpdate.save();
    const updatedUser = await User.findById(id).select("-password -sessionToken").lean();

      await logAuditActivity({
        user: session.userId,
        action: "update_user",
        resource: "users",
        resourceId: id,
        details: updates,
        req: request,
      });

      return NextResponse.json({ user: updatedUser, message: "User updated successfully" });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getSession();
    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.userId === id) {
       return NextResponse.json({ error: "You cannot delete yourself" }, { status: 400 });
    }

    await connectDB();
    const deletedUser = await User.findByIdAndDelete(id);

    if (!deletedUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

      await logAuditActivity({
        user: session.userId,
        action: "delete_user",
        resource: "users",
        resourceId: id,
        details: { email: deletedUser.email, role: deletedUser.role },
        req: request,
      });

      return NextResponse.json({ message: "User deleted successfully" });

  } catch (error: any) {
     return NextResponse.json({ error: error.message }, { status: 500 });
  }
}