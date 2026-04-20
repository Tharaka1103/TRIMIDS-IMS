import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { DashboardLayoutClient } from "@/components/layout/DashboardLayoutClient";
import { Role } from "@/types/permissions";
import connectDB from "@/lib/db";
import Notification from "@/models/Notification";
import MaintenanceWindow from "@/models/MaintenanceWindow";

async function getUnreadCount(userId: string, role: string): Promise<number> {
  try {
    await connectDB();
    const count = await Notification.countDocuments({
      $or: [{ recipients: userId }, { recipientRoles: role }],
      isRead: { $ne: userId },
      isDeleted: { $ne: userId },
    });
    return count;
  } catch {
    return 0;
  }
}

async function checkActiveMaintenance(role: string) {
  try {
    await connectDB();
    const now = new Date();
    const maintenance = await MaintenanceWindow.findOne({
      status: "active",
      startTime: { $lte: now },
      endTime: { $gte: now },
      affectedRoles: role,
    }).lean();
    return maintenance;
  } catch {
    return null;
  }
}

async function getUpcomingMaintenance() {
  try {
    await connectDB();
    const now = new Date();

    // Auto-activate scheduled maintenance whose start time has passed
    await MaintenanceWindow.updateMany(
      { status: "scheduled", startTime: { $lte: now }, endTime: { $gt: now } },
      { $set: { status: "active", isActive: true } }
    );

    // Auto-complete active maintenance whose end time has passed
    await MaintenanceWindow.updateMany(
      { status: "active", endTime: { $lte: now } },
      { $set: { status: "completed", isActive: false } }
    );

    // Return next upcoming scheduled maintenance (not yet active)
    const upcoming = await MaintenanceWindow.findOne({
      status: "scheduled",
      startTime: { $gt: now },
    })
      .sort({ startTime: 1 })
      .select("title description startTime endTime")
      .lean();

    return upcoming;
  } catch {
    return null;
  }
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) redirect("/login");

  const [unreadCount, activeMaintenance, upcomingMaintenance] = await Promise.all([
    getUnreadCount(session.userId, session.role),
    checkActiveMaintenance(session.role),
    session.role !== "admin" ? getUpcomingMaintenance() : null,
  ]);

  // Block non-admin users during maintenance
  if (activeMaintenance && session.role !== "admin") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="w-20 h-20 rounded-full bg-orange-100 dark:bg-orange-900/50 flex items-center justify-center mx-auto animate-pulse">
            <span className="text-4xl">🔧</span>
          </div>
          <h1 className="text-2xl font-bold text-foreground">
            System Under Maintenance
          </h1>
          <p className="text-muted-foreground">
            TRIMIDS is currently undergoing scheduled maintenance. We&apos;ll be back online shortly.
          </p>
          <div className="bg-card border border-border rounded-lg p-5 text-left space-y-3">
            <p className="text-sm font-semibold text-foreground">
              {(activeMaintenance as Record<string, unknown>).title as string}
            </p>
            <p className="text-sm text-muted-foreground">
              {(activeMaintenance as Record<string, unknown>).description as string}
            </p>
            <div className="flex items-center gap-2 text-xs text-muted-foreground border-t border-border pt-3">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              Expected completion:{" "}
              {new Date(
                (activeMaintenance as Record<string, unknown>).endTime as string
              ).toLocaleString()}
            </div>
          </div>
          <form action="/api/auth/logout" method="POST">
            <button className="text-sm text-primary hover:underline">
              Sign out
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <DashboardLayoutClient
      session={{
        role: session.role,
        name: session.name,
        email: session.email,
        userId: session.userId,
      }}
      unreadCount={unreadCount}
      upcomingMaintenance={
        upcomingMaintenance
          ? {
              title: (upcomingMaintenance as Record<string, unknown>).title as string,
              description: (upcomingMaintenance as Record<string, unknown>).description as string,
              startTime: ((upcomingMaintenance as Record<string, unknown>).startTime as Date).toISOString(),
              endTime: ((upcomingMaintenance as Record<string, unknown>).endTime as Date).toISOString(),
            }
          : null
      }
    >
      {children}
    </DashboardLayoutClient>
  );
}