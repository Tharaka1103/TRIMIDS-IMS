import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import connectDB from "@/lib/db";
import User from "@/models/User";
import Task from "@/models/Task";
import Notification from "@/models/Notification";
import { MaintenanceAlert } from "@/components/dashboard/MaintenanceAlert";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  GraduationCap,
  ClipboardList,
  Bell,
  TrendingUp,
  UserCheck,
  AlertCircle,
} from "lucide-react";
import { AdminCharts } from "./_components/AdminCharts";
import { RecentUsers } from "./_components/RecentUsers";

async function getAdminStats() {
  await connectDB();

  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const [
    totalUsers,
    activeUsers,
    totalInterns,
    activeInterns,
    pendingTasks,
    completedTasksThisMonth,
    unreadNotifications,
    usersByRole,
  ] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ isActive: true }),
    User.countDocuments({ role: "intern" }),
    User.countDocuments({ role: "intern", isActive: true }),
    Task.countDocuments({ status: { $in: ["todo", "in_progress"] } }),
    Task.countDocuments({
      status: "completed",
      completedAt: { $gte: thirtyDaysAgo },
    }),
    Notification.countDocuments({
      createdAt: { $gte: thirtyDaysAgo },
    }),
    User.aggregate([
      { $group: { _id: "$role", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]),
  ]);

  const recentUsers = await User.find()
    .select("name email role isActive createdAt")
    .sort({ createdAt: -1 })
    .limit(5)
    .lean()
    .then((users) =>
      users.map((user) => ({
        ...user,
        _id: user._id.toString(),
      }))
    );

  return {
    totalUsers,
    activeUsers,
    totalInterns,
    activeInterns,
    pendingTasks,
    completedTasksThisMonth,
    unreadNotifications,
    usersByRole,
    recentUsers,
  };
}

export default async function AdminDashboard() {
  const session = await getSession();
  if (!session || session.role !== "admin") redirect("/login");

  const stats = await getAdminStats();

  const statCards = [
    {
      title: "Total Users",
      value: stats.totalUsers,
      description: `${stats.activeUsers} active`,
      icon: Users,
      trend: "+12%",
      color: "text-blue-500",
      bg: "bg-blue-500/10",
    },
    {
      title: "Total Interns",
      value: stats.totalInterns,
      description: `${stats.activeInterns} currently active`,
      icon: GraduationCap,
      trend: "+5%",
      color: "text-green-500",
      bg: "bg-green-500/10",
    },
    {
      title: "Pending Tasks",
      value: stats.pendingTasks,
      description: "Across all users",
      icon: ClipboardList,
      trend: "-3%",
      color: "text-orange-500",
      bg: "bg-orange-500/10",
    },
    {
      title: "Completed This Month",
      value: stats.completedTasksThisMonth,
      description: "Tasks completed",
      icon: UserCheck,
      trend: "+18%",
      color: "text-purple-500",
      bg: "bg-purple-500/10",
    },
  ];

  return (
    <div className="space-y-6">
      <MaintenanceAlert role="admin" />

      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Admin Dashboard
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Complete overview of TRIMIDS platform
          </p>
        </div>
        <Badge
          variant="outline"
          className="hidden sm:flex items-center gap-1.5"
        >
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          System Operational
        </Badge>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <Card key={stat.title} className="border-border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground font-medium">
                    {stat.title}
                  </p>
                  <p className="text-3xl font-bold text-foreground">
                    {stat.value.toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {stat.description}
                  </p>
                </div>
                <div className={`p-3 rounded-xl ${stat.bg}`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
              </div>
              <div className="mt-4 flex items-center gap-1 text-xs">
                <TrendingUp className="w-3 h-3 text-green-500" />
                <span className="text-green-500 font-medium">{stat.trend}</span>
                <span className="text-muted-foreground">vs last month</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <AdminCharts usersByRole={stats.usersByRole as any[]} />

      {/* Recent Users */}
      <RecentUsers users={stats.recentUsers as any[]} />
    </div>
  );
}