"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  Bell,
  Settings,
  LogOut,
  ChevronDown,
  ChevronRight,
  Wrench,
  BarChart3,
  FileText,
  Clock,
  Building2,
  DollarSign,
  Megaphone,
  UserCheck,
  ShieldCheck,
  ClipboardList,
  TrendingUp,
  Calendar,
  Target,
  PieChart,
  Shield,
} from "lucide-react";
import { Role } from "@/types/permissions";
import { getRoleDisplayName } from "@/lib/permissions";

interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
  children?: NavItem[];
}

interface SidebarProps {
  role: Role;
  userName: string;
  userEmail: string;
  unreadCount?: number;
  collapsed?: boolean;
}

const getNavItems = (role: Role, unreadCount: number = 0): NavItem[] => {
  const adminItems: NavItem[] = [
    {
      title: "Dashboard",
      href: "/admin",
      icon: LayoutDashboard,
    },
    {
      title: "User Management",
      href: "/admin/users",
      icon: Users,
    },
    {
      title: "Intern Management",
      href: "/admin/interns",
      icon: GraduationCap,
    },
    {
      title: "Departments",
      href: "/admin/departments",
      icon: Building2,
    },
    {
      title: "Reports",
      href: "/admin/reports",
      icon: BarChart3,
    },
    {
      title: "Audit Logs",
      href: "/admin/audit-logs",
      icon: ShieldCheck,
    },
    {
      title: "Maintenance",
      href: "/admin/maintenance",
      icon: Wrench,
    },
    {
      title: "Notifications",
      href: "/admin/notifications",
      icon: Bell,
      badge: unreadCount,
    },
    {
      title: "Employee Dashboards",
      href: "#",
      icon: Users,
      children: [
        { title: "Employee Dashboard", href: "/employee", icon: LayoutDashboard },
        { title: "Employee Tasks", href: "/employee/tasks", icon: ClipboardList },
        { title: "Employee Leaves", href: "/employee/leaves", icon: Calendar },
        { title: "Employee Attendance", href: "/employee/attendance", icon: Clock },
        { title: "Intern Dashboard", href: "/intern", icon: LayoutDashboard },
        { title: "Intern Tasks", href: "/intern/tasks", icon: ClipboardList },
        { title: "Intern Attendance", href: "/intern/attendance", icon: Clock },
        { title: "Intern Documents", href: "/intern/documents", icon: FileText },
        { title: "Intern Progress", href: "/intern/progress", icon: TrendingUp },
        { title: "HR Dashboard", href: "/hr", icon: LayoutDashboard },
        { title: "HR Employees", href: "/hr/employees", icon: Users },
        { title: "HR Leaves", href: "/hr/leaves", icon: FileText },
        { title: "HR Assign Tasks", href: "/hr/tasks", icon: FileText },
        { title: "HR Manage Interns", href: "/hr/interns", icon: FileText },
        { title: "HR Recruitment", href: "/hr/recruitment", icon: UserCheck },
        { title: "Finance Dashboard", href: "/finance", icon: LayoutDashboard },
        { title: "Finance Finances", href: "/finance/finances", icon: DollarSign },
        { title: "Finance Payroll", href: "/finance/payroll", icon: PieChart },
        { title: "Finance Reports", href: "/finance/reports", icon: BarChart3 },
        { title: "Marketing Dashboard", href: "/marketing", icon: LayoutDashboard },
        { title: "Marketing Campaigns", href: "/marketing/campaigns", icon: Target },
        { title: "Marketing Analytics", href: "/marketing/analytics", icon: BarChart3 },
      ],
    },
    {
      title: "Settings",
      href: "/admin/settings",
      icon: Settings,
    },
  ];

  const internItems: NavItem[] = [
    { title: "Dashboard", href: "/intern", icon: LayoutDashboard },
    { title: "My Tasks", href: "/intern/tasks", icon: ClipboardList },
    { title: "Attendance", href: "/intern/attendance", icon: Clock },
    { title: "Documents", href: "/intern/documents", icon: FileText },
    { title: "Progress", href: "/intern/progress", icon: TrendingUp },
    {
      title: "Notifications",
      href: "/intern/notifications",
      icon: Bell,
      badge: unreadCount,
    },
    { title: "Settings", href: "/intern/settings", icon: Settings },
  ];

  const employeeItems: NavItem[] = [
    { title: "Dashboard", href: "/employee", icon: LayoutDashboard },
    { title: "My Tasks", href: "/employee/tasks", icon: ClipboardList },
    { title: "Employee Leaves", href: "/employee/leaves", icon: Calendar },
    { title: "Attendance", href: "/employee/attendance", icon: Clock },
    {
      title: "Notifications",
      href: "/employee/notifications",
      icon: Bell,
      badge: unreadCount,
    },
    { title: "Settings", href: "/employee/settings", icon: Settings },
  ];

  const hrItems: NavItem[] = [
    { title: "Dashboard", href: "/hr", icon: LayoutDashboard },
    { title: "Employees", href: "/hr/employees", icon: Users },
    { title: "Leaves", href: "/hr/leaves", icon: FileText },
    { title: "HR Manage Interns", href: "/hr/interns", icon: FileText },
    { title: "HR Recruitment", href: "/hr/recruitment", icon: UserCheck },
    { title: "Recruitment", href: "/hr/recruitment", icon: UserCheck },
    {
      title: "Notifications",
      href: "/hr/notifications",
      icon: Bell,
      badge: unreadCount,
    },
    { title: "Settings", href: "/hr/settings", icon: Settings },
  ];

  const financeItems: NavItem[] = [
    { title: "Dashboard", href: "/finance", icon: LayoutDashboard },
    { title: "Finances", href: "/finance/finances", icon: DollarSign },
    { title: "Payroll", href: "/finance/payroll", icon: PieChart },
    { title: "Reports", href: "/finance/reports", icon: BarChart3 },
    {
      title: "Notifications",
      href: "/finance/notifications",
      icon: Bell,
      badge: unreadCount,
    },
    { title: "Settings", href: "/finance/settings", icon: Settings },
  ];

  const marketingItems: NavItem[] = [
    { title: "Dashboard", href: "/marketing", icon: LayoutDashboard },
    { title: "Campaigns", href: "/marketing/campaigns", icon: Target },
    { title: "Analytics", href: "/marketing/analytics", icon: BarChart3 },
    {
      title: "Notifications",
      href: "/marketing/notifications",
      icon: Bell,
      badge: unreadCount,
    },
    { title: "Settings", href: "/marketing/settings", icon: Settings },
  ];

  const navMap: Record<Role, NavItem[]> = {
    admin: adminItems,
    intern: internItems,
    employee: employeeItems,
    hr_manager: hrItems,
    finance_manager: financeItems,
    marketing_manager: marketingItems,
  };

  return navMap[role] || [];
};

export function Sidebar({
  role,
  userName,
  userEmail,
  unreadCount = 0,
  collapsed = false,
}: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const navItems = getNavItems(role, unreadCount);
  const [openItems, setOpenItems] = useState<string[]>([]);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  };

  const toggleItem = (title: string) => {
    setOpenItems((prev) =>
      prev.includes(title)
        ? prev.filter((i) => i !== title)
        : [...prev, title]
    );
  };

  const isActive = (href: string) => {
    if (href === "#") return false;
    if (
      href === "/admin" ||
      href === "/intern" ||
      href === "/employee" ||
      href === "/hr" ||
      href === "/finance" ||
      href === "/marketing"
    ) {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  const initials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="flex flex-col h-full bg-card border-r border-border">
      {/* Logo Header */}
      <div className="h-16 flex items-center px-6 border-b border-border shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <Shield className="w-5 h-5 text-primary-foreground" />
          </div>
          {!collapsed && (
            <div>
              <span className="font-bold text-foreground text-lg">TRIMIDS</span>
              <p className="text-xs text-muted-foreground leading-none">
                {getRoleDisplayName(role)}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 min-h-0 px-3 py-4 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        <nav className="space-y-1">
          {navItems.map((item) => {
            if (item.children) {
              const isOpen = openItems.includes(item.title);
              const hasActiveChild = item.children.some((child) =>
                isActive(child.href)
              );

              return (
                <Collapsible
                  key={item.title}
                  open={isOpen || hasActiveChild}
                  onOpenChange={() => toggleItem(item.title)}
                >
                  <CollapsibleTrigger asChild>
                    <Button
                      variant="ghost"
                      className={cn(
                        "w-full justify-start gap-3 h-10 px-3 font-normal",
                        hasActiveChild &&
                        "bg-accent text-accent-foreground font-medium"
                      )}
                    >
                      <item.icon className="w-4 h-4 shrink-0" />
                      {!collapsed && (
                        <>
                          <span className="flex-1 text-left text-sm">
                            {item.title}
                          </span>
                          {isOpen || hasActiveChild ? (
                            <ChevronDown className="w-3 h-3 text-muted-foreground" />
                          ) : (
                            <ChevronRight className="w-3 h-3 text-muted-foreground" />
                          )}
                        </>
                      )}
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="ml-4 mt-1 space-y-1 border-l border-border pl-3">
                    {item.children.map((child) => (
                      <Link key={child.href} href={child.href}>
                        <Button
                          variant="ghost"
                          className={cn(
                            "w-full justify-start gap-3 h-9 px-3 font-normal text-sm",
                            isActive(child.href) &&
                            "bg-primary/10 text-primary font-medium"
                          )}
                        >
                          <child.icon className="w-3.5 h-3.5 shrink-0" />
                          {!collapsed && <span>{child.title}</span>}
                        </Button>
                      </Link>
                    ))}
                  </CollapsibleContent>
                </Collapsible>
              );
            }

            return (
              <Link key={item.href} href={item.href}>
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full justify-start gap-3 h-10 px-3 font-normal relative",
                    isActive(item.href) &&
                    "bg-primary/10 text-primary font-medium hover:bg-primary/15"
                  )}
                >
                  <item.icon className="w-4 h-4 shrink-0" />
                  {!collapsed && (
                    <span className="flex-1 text-left text-sm">
                      {item.title}
                    </span>
                  )}
                  {!collapsed && item.badge && item.badge > 0 ? (
                    <span className="ml-auto bg-primary text-primary-foreground text-xs rounded-full px-1.5 py-0.5 min-w-[18px] text-center leading-none">
                      {item.badge > 99 ? "99+" : item.badge}
                    </span>
                  ) : null}
                </Button>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* User Section */}
      <div className="p-3 border-t border-border shrink-0">
        <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent transition-colors">
          <Avatar className="w-8 h-8 shrink-0">
            <AvatarFallback className="bg-primary text-primary-foreground text-xs font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">
                {userName}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {userEmail}
              </p>
            </div>
          )}
        </div>
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 h-10 px-3 mt-1 text-destructive hover:text-destructive hover:bg-destructive/10"
          onClick={handleLogout}
        >
          <LogOut className="w-4 h-4 shrink-0" />
          {!collapsed && <span className="text-sm">Logout</span>}
        </Button>
      </div>
    </div>
  );
}