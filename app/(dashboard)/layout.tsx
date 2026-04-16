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

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) redirect("/login");

  const [unreadCount, activeMaintenance] = await Promise.all([
    getUnreadCount(session.userId, session.role),
    checkActiveMaintenance(session.role),
  ]);

  // Block non-admin users during maintenance
  if (activeMaintenance && session.role !== "admin") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-orange-100 dark:bg-orange-900 flex items-center justify-center mx-auto">
            <span className="text-3xl">🔧</span>
          </div>
          <h1 className="text-2xl font-bold text-foreground">
            System Maintenance
          </h1>
          <p className="text-muted-foreground">
            TRIMIDS is currently undergoing scheduled maintenance. Please check
            back later.
          </p>
          <div className="bg-card border border-border rounded-lg p-4 text-left space-y-2">
            <p className="text-sm font-medium text-foreground">
              {(activeMaintenance as any).title}
            </p>
            <p className="text-sm text-muted-foreground">
              {(activeMaintenance as any).description}
            </p>
            <p className="text-xs text-muted-foreground">
              Expected completion:{" "}
              {new Date(
                (activeMaintenance as any).endTime
              ).toLocaleString()}
            </p>
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
    >
      {children}
    </DashboardLayoutClient>
  );
}