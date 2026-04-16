import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import connectDB from "@/lib/db";
import Notification from "@/models/Notification";
import User from "@/models/User";
import { hasPermission } from "@/lib/permissions";
import { PERMISSIONS } from "@/types/permissions";

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const unreadOnly = searchParams.get("unreadOnly") === "true";
    const skip = (page - 1) * limit;

    const query: any = {
      $or: [
        { recipients: session.userId },
        { recipientRoles: session.role },
      ],
      isDeleted: { $ne: session.userId },
    };

    if (unreadOnly) {
      query.isRead = { $ne: session.userId };
    }

    const [notifications, total, unreadCount] = await Promise.all([
      Notification.find(query)
        .populate("sender", "name role avatar")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Notification.countDocuments(query),
      Notification.countDocuments({
        ...query,
        isRead: { $ne: session.userId },
      }),
    ]);

    return NextResponse.json({
      notifications,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      unreadCount,
    });
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
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!hasPermission(session.role, PERMISSIONS.NOTIFICATION_SEND)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await connectDB();

    const body = await request.json();
    const {
      title,
      message,
      type,
      priority,
      recipientRoles,
      recipientIds,
      link,
      metadata,
    } = body;

    let recipients: string[] = recipientIds || [];

    if (recipientRoles && recipientRoles.length > 0) {
      const usersWithRoles = await User.find({
        role: { $in: recipientRoles },
        isActive: true,
      }).select("_id");
      recipients = [
        ...new Set([
          ...recipients,
          ...usersWithRoles.map((u) => u._id.toString()),
        ]),
      ];
    }

    const notification = await Notification.create({
      title,
      message,
      type: type || "announcement",
      priority: priority || "medium",
      recipients,
      recipientRoles,
      sender: session.userId,
      link,
      metadata,
    });

    return NextResponse.json(
      { notification, message: "Notification sent successfully" },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}