"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Bell, X, Check, CheckCheck, AlertCircle,
         Info, AlertTriangle, Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

interface Notification {
  _id: string;
  title: string;
  message: string;
  type: string;
  priority: string;
  isRead: string[];
  createdAt: string;
  link?: string;
  sender?: { name: string; role: string };
}

interface NotificationBellProps {
  userId: string;
  role: string;
}

const getNotificationIcon = (type: string, priority: string) => {
  if (priority === "critical" || priority === "high") {
    return <AlertCircle className="w-4 h-4 text-destructive shrink-0" />;
  }
  switch (type) {
    case "maintenance_scheduled":
    case "maintenance_started":
      return <Wrench className="w-4 h-4 text-orange-500 shrink-0" />;
    case "system_alert":
      return <AlertTriangle className="w-4 h-4 text-yellow-500 shrink-0" />;
    default:
      return <Info className="w-4 h-4 text-primary shrink-0" />;
  }
};

export function NotificationBell({ userId, role }: NotificationBellProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch("/api/notifications?limit=10&unreadOnly=false");
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
    // Poll every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const markAsRead = async (notificationId: string) => {
    try {
      await fetch(`/api/notifications/${notificationId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "mark_read" }),
      });
      setNotifications((prev) =>
        prev.map((n) =>
          n._id === notificationId
            ? { ...n, isRead: [...n.isRead, userId] }
            : n
        )
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Failed to mark as read:", error);
    }
  };

  const markAllAsRead = async () => {
    setLoading(true);
    try {
      await fetch("/api/notifications/mark-read", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markAll: true }),
      });
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, isRead: [...n.isRead, userId] }))
      );
      setUnreadCount(0);
    } catch (error) {
      console.error("Failed to mark all as read:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.isRead.includes(userId)) {
      markAsRead(notification._id);
    }
    if (notification.link) {
      router.push(notification.link);
      setOpen(false);
    }
  };

  const isUnread = (notification: Notification) =>
    !notification.isRead.includes(userId);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-0" align="end">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4" />
            <span className="font-semibold text-sm">Notifications</span>
            {unreadCount > 0 && (
              <Badge variant="secondary" className="text-xs">
                {unreadCount} new
              </Badge>
            )}
          </div>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="text-xs h-7 gap-1"
              onClick={markAllAsRead}
              disabled={loading}
            >
              <CheckCheck className="w-3 h-3" />
              Mark all read
            </Button>
          )}
        </div>

        {/* Notifications List */}
        <ScrollArea className="max-h-[400px]">
          {notifications.length === 0 ? (
            <div className="p-8 text-center">
              <Bell className="w-8 h-8 mx-auto text-muted-foreground mb-3 opacity-50" />
              <p className="text-sm text-muted-foreground">
                No notifications yet
              </p>
            </div>
          ) : (
            <div>
              {notifications.map((notification, index) => (
                <div key={notification._id}>
                  <div
                    className={cn(
                      "flex gap-3 p-4 cursor-pointer hover:bg-accent/50 transition-colors",
                      isUnread(notification) && "bg-primary/5"
                    )}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="mt-0.5">
                      {getNotificationIcon(
                        notification.type,
                        notification.priority
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p
                          className={cn(
                            "text-sm leading-tight",
                            isUnread(notification)
                              ? "font-semibold text-foreground"
                              : "font-medium text-foreground"
                          )}
                        >
                          {notification.title}
                        </p>
                        {isUnread(notification) && (
                          <div className="w-2 h-2 rounded-full bg-primary shrink-0 mt-1" />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                        {notification.message}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatDistanceToNow(new Date(notification.createdAt), {
                          addSuffix: true,
                        })}
                      </p>
                    </div>
                  </div>
                  {index < notifications.length - 1 && (
                    <Separator className="opacity-50" />
                  )}
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        {/* Footer */}
        <div className="p-2 border-t border-border">
          <Button
            variant="ghost"
            className="w-full text-xs h-8"
            onClick={() => {
              const notifPath = `/${role.replace("_manager", "")}/notifications`;
              router.push(notifPath);
              setOpen(false);
            }}
          >
            View all notifications
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}