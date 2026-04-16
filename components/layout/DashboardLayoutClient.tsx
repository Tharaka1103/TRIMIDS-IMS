"use client";

import React, { useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { NotificationBell } from "@/components/layout/NotificationBell";
import { Role } from "@/types/permissions";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { Menu, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DashboardLayoutClientProps {
  children: React.ReactNode;
  session: { role: string; name: string; email: string; userId: string };
  unreadCount: number;
}

export function DashboardLayoutClient({ children, session, unreadCount }: DashboardLayoutClientProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="flex h-screen bg-background overflow-hidden relative">
      {/* Desktop Sidebar */}
      <div 
        className={`shrink-0 hidden md:block transition-all duration-300 border-r border-border bg-card ${
          isCollapsed ? "w-[72px]" : "w-64"
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
        {/* Top Bar */}
        <header className="h-16 border-b border-border bg-card flex items-center justify-between px-4 sm:px-6 shrink-0 transition-all duration-300">
          <div className="flex items-center gap-2 sm:gap-4">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="w-5 h-5 text-foreground" />
                  <span className="sr-only">Toggle mobile menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 border-none w-64 bg-card">
                <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                <Sidebar
                  role={session.role as Role}
                  userName={session.name}
                  userEmail={session.email}
                  unreadCount={unreadCount}
                  collapsed={false}
                />
              </SheetContent>
            </Sheet>

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
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}