"use client";

import React, { useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { NotificationBell } from "@/components/layout/NotificationBell";
import { Role } from "@/types/permissions";
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetClose } from "@/components/ui/sheet";
import { Menu, PanelLeftClose, PanelLeftOpen, X, AlertTriangle, LogOut, Home, Calendar, ClipboardList, User, MoreHorizontal, Users, Bell, Settings, TrendingUp, DollarSign, PieChart, BarChart3, Target, UserCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";

interface UpcomingMaintenance {
  title: string;
  description: string;
  startTime: string;
  endTime: string;
}

// Configuration for the mobile bottom navigation bar based on user role.
// You can change the icons, titles, and hrefs here for different user roles.
const mobileNavConfig: Record<string, { title: string; href: string; icon: React.ComponentType<any> }[]> = {
  admin: [
    { title: "Interns", href: "/hr/interns", icon: Users },
    { title: "Notifs", href: "/admin/notifications", icon: Bell },
    { title: "Settings", href: "/admin/settings", icon: Settings },
  ],
  intern: [
    { title: "Tasks", href: "/intern/tasks", icon: ClipboardList },
    { title: "Progress", href: "/intern/progress", icon: TrendingUp },
    { title: "Notifs", href: "/intern/notifications", icon: Bell },
  ],
  employee: [
    { title: "Tasks", href: "/employee/tasks", icon: ClipboardList },
    { title: "Leaves", href: "/employee/leaves", icon: Calendar },
    { title: "Atten.", href: "/employee/attendance", icon: User },
  ],
  hr_manager: [
    { title: "Employees", href: "/hr/employees", icon: Users },
    { title: "Leaves", href: "/hr/leaves", icon: Calendar },
    { title: "Recruit", href: "/hr/recruitment", icon: UserCheck },
  ],
  finance_manager: [
    { title: "Finances", href: "/finance/finances", icon: DollarSign },
    { title: "Payroll", href: "/finance/payroll", icon: PieChart },
    { title: "Reports", href: "/finance/reports", icon: BarChart3 },
  ],
  marketing_manager: [
    { title: "Campaigns", href: "/marketing/campaigns", icon: Target },
    { title: "Analytics", href: "/marketing/analytics", icon: BarChart3 },
    { title: "Notifs", href: "/marketing/notifications", icon: Bell },
  ],
};

interface DashboardLayoutClientProps {
  children: React.ReactNode;
  session: { role: string; name: string; email: string; userId: string };
  unreadCount: number;
  upcomingMaintenance?: UpcomingMaintenance | null;
}

export function DashboardLayoutClient({
  children,
  session,
  unreadCount,
  upcomingMaintenance,
}: DashboardLayoutClientProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isBannerDismissed, setIsBannerDismissed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  };

  const showBanner = upcomingMaintenance && !isBannerDismissed;

  /** Format a date diff as human readable text */
  function formatTimeUntil(dateStr: string): string {
    const diff = new Date(dateStr).getTime() - Date.now();
    if (diff <= 0) return "starting soon";
    const hours = Math.floor(diff / 3600000);
    const minutes = Math.floor((diff % 3600000) / 60000);
    if (hours > 24) {
      const days = Math.floor(hours / 24);
      return `in ${days}d ${hours % 24}h`;
    }
    if (hours > 0) return `in ${hours}h ${minutes}m`;
    return `in ${minutes}m`;
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden relative">
      {/* Desktop Sidebar */}
      <div
        className={`shrink-0 hidden md:block transition-all duration-300 border-r border-border bg-card ${isCollapsed ? "w-[72px]" : "w-64"
          }`}
      >
        <Sidebar
          role={session.role as Role}
          userName={session.name}
          userEmail={session.email}
          unreadCount={unreadCount}
          collapsed={isCollapsed}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Maintenance Alert Banner */}
        {showBanner && (
          <div className="bg-amber-500/10 border-b border-amber-500/30 px-4 py-2.5 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3 min-w-0">
              <div className="shrink-0 w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  Scheduled Maintenance: {upcomingMaintenance?.title}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  System will be unavailable {formatTimeUntil(upcomingMaintenance?.startTime || "")} •{" "}
                  {new Date(upcomingMaintenance?.startTime || "").toLocaleString()}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="shrink-0 h-9 w-9 text-muted-foreground hover:text-foreground"
              onClick={() => setIsBannerDismissed(true)}
            >
              <X className="w-5 h-5" />
              <span className="sr-only">Dismiss</span>
            </Button>
          </div>
        )}

        {/* Top Bar */}
        <header className="h-16 border-b border-border bg-card flex items-center justify-between px-4 sm:px-6 shrink-0 transition-all duration-300">
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Mobile Branding */}
            <div className="flex md:hidden items-center">
              <span className="font-bold text-blue-500 text-lg">TRI<span className="text-red-500">MIDS</span></span>
            </div>

            <Button
              variant="ghost"
              size="icon"
              className="hidden md:flex"
              onClick={() => setIsCollapsed(!isCollapsed)}
            >
              {isCollapsed ? (
                <PanelLeftOpen className="w-5 h-5 text-foreground" />
              ) : (
                <PanelLeftClose className="w-5 h-5 text-foreground" />
              )}
              <span className="sr-only">Toggle desktop sidebar</span>
            </Button>

            <h2 className="text-sm font-medium text-muted-foreground hidden sm:block">
              Welcome back,{" "}
              <span className="text-foreground font-semibold">
                {session.name}
              </span>
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <NotificationBell
              userId={session.userId}
              role={session.role}
            />

            {/* Profile Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Avatar className="w-8 h-8">
                    <AvatarFallback className="bg-primary text-primary-foreground text-xs font-semibold">
                      {session.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Profile</DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout} className="text-destructive font-medium focus:text-destructive-foreground focus:bg-destructive cursor-pointer">
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Separate Logout Icon Button */}
            <Button
              variant="outline"
              size="icon"
              onClick={handleLogout}
              className="rounded-full text-white transition-all duration-200 bg-red-800/80"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-4 sm:p-6 pb-24 md:pb-6">{children}</main>

        {/* Mobile Bottom Navigation */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 border-border bg-transparent backdrop-blur-xs z-50 flex items-center justify-around px-2 shadow-[0_-4px_10px_rgba(0,0,0,0.05)] dark:shadow-[0_-4px_10px_rgba(0,0,0,0.2)]">
          {(() => {
            const items = mobileNavConfig[session.role] || mobileNavConfig.employee;
            const Icon0 = items[0].icon;
            const Icon1 = items[1].icon;
            const Icon2 = items[2].icon;

            return (
              <>
                <Link href={items[0].href} className="flex flex-col items-center justify-center w-14 h-full text-muted-foreground hover:text-primary transition-colors">
                  <Icon0 className={`w-6 h-6 mb-1 ${pathname.includes(items[0].href) ? 'text-primary' : ''}`} />
                  <span className={`text-[11px] font-medium ${pathname.includes(items[0].href) ? 'text-primary' : ''}`}>{items[0].title}</span>
                </Link>

                <Link href={items[1].href} className="flex flex-col items-center justify-center w-14 h-full text-muted-foreground hover:text-primary transition-colors">
                  <Icon1 className={`w-6 h-6 mb-1 ${pathname.includes(items[1].href) ? 'text-primary' : ''}`} />
                  <span className={`text-[11px] font-medium ${pathname.includes(items[1].href) ? 'text-primary' : ''}`}>{items[1].title}</span>
                </Link>

                {/* Center Home Button */}
                <Link
                  href={`/${session.role === "hr_manager" ? "hr" : session.role === "finance_manager" ? "finance" : session.role === "marketing_manager" ? "marketing" : session.role}`}
                  className="flex flex-col items-center justify-center w-14 h-14 bg-primary text-primary-foreground rounded-full -translate-y-4 shadow-lg hover:bg-primary/90 transition-transform hover:scale-105"
                >
                  <Home className="w-6 h-6" />
                </Link>

                <Link href={items[2].href} className="flex flex-col items-center justify-center w-14 h-full text-muted-foreground hover:text-primary transition-colors">
                  <Icon2 className={`w-6 h-6 mb-1 ${pathname.includes(items[2].href) ? 'text-primary' : ''}`} />
                  <span className={`text-[11px] font-medium ${pathname.includes(items[2].href) ? 'text-primary' : ''}`}>{items[2].title}</span>
                </Link>
              </>
            );
          })()}

          {/* More Sheet Trigger */}
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <button className="flex flex-col items-center justify-center w-14 h-full text-muted-foreground hover:text-primary transition-colors">
                <Menu className="w-6 h-6 mb-1" />
                <span className="text-[11px] font-medium">More</span>
              </button>
            </SheetTrigger>
            <SheetContent side="right" className="h-full rounded-t-2xl px-0 pb-0 flex flex-col">
              <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
              <div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                <Sidebar
                  role={session.role as Role}
                  userName={session.name}
                  userEmail={session.email}
                  unreadCount={unreadCount}
                  collapsed={false}
                  onNavClick={() => setIsMobileMenuOpen(false)}
                />
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </div>
  );
}