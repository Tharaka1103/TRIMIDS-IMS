"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { toast } from "sonner";
import { Bell, AlertTriangle, Info, CheckCircle2, MoreHorizontal, Check, Trash2, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface INotification {
  _id: string;
  title: string;
  message: string;
  type: string;
  priority: "low" | "medium" | "high" | "critical";
  isRead: string[]; // User IDs who read it
  createdAt: string;
  link?: string;
  sender?: { _id: string; name: string };
}

interface NotificationsInboxProps {
  userId: string;
}

export function NotificationsInbox({ userId }: NotificationsInboxProps) {
  const [notifications, setNotifications] = useState<INotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "unread">("all");

  useEffect(() => {
    fetchNotifications();
  }, [filter]);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const url = new URL("/api/notifications", window.location.origin);
      if (filter === "unread") {
        url.searchParams.append("unreadOnly", "true");
      }
      url.searchParams.append("limit", "50");

      const res = await fetch(url.toString());
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
      }
    } catch (err) {
      toast.error("Failed to load notifications");
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      const res = await fetch(`/api/notifications/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "mark_read" }),
      });
      if (res.ok) {
        setNotifications(notifications.map(n => 
          n._id === id 
            ? { ...n, isRead: [...(n.isRead || []), userId] }
            : n
        ));
        toast.success("Marked as read");
      }
    } catch {
      toast.error("Error updating notification");
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "critical": return <AlertTriangle className="w-5 h-5 text-red-500" />;
      case "high": return <AlertTriangle className="w-5 h-5 text-orange-500" />;
      case "low": return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      default: return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  const isUserUnread = (note: INotification) => !note.isRead?.includes(userId);

  return (
    <Card className="col-span-1 border shadow-sm h-[calc(100vh-140px)] flex flex-col">
      <CardHeader className="border-b space-y-4 pb-4">
        <div className="flex items-center justify-between">
          <div>
             <CardTitle className="text-2xl flex items-center gap-2">
               <Bell className="w-6 h-6 text-primary" /> Notifications Inbox
             </CardTitle>
             <CardDescription className="mt-1">
               Stay updated with system messages, tasks, and administrative alerts.
             </CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={fetchNotifications}>
             <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
             Refresh
          </Button>
        </div>
        <Tabs value={filter} onValueChange={(v) => setFilter(v as any)} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="all">All Notifications</TabsTrigger>
            <TabsTrigger value="unread">Unread</TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>
      
      <CardContent className="flex-1 p-0 overflow-hidden">
        <ScrollArea className="h-full">
          {loading ? (
             <div className="p-4 space-y-4">
               {[1, 2, 3, 4].map((i) => (
                 <div key={i} className="flex items-start gap-4 space-y-2">
                   <Skeleton className="h-10 w-10 rounded-full" />
                   <div className="space-y-2 flex-1">
                     <Skeleton className="h-4 w-3/4" />
                     <Skeleton className="h-3 w-1/2" />
                   </div>
                 </div>
               ))}
             </div>
          ) : notifications.length === 0 ? (
             <div className="flex flex-col items-center justify-center p-12 text-muted-foreground h-full">
               <Bell className="w-12 h-12 mb-4 opacity-20" />
               <p>No notifications found.</p>
               <p className="text-sm">You are all caught up!</p>
             </div>
          ) : (
            <div className="divide-y">
              {notifications.map((note) => {
                const unread = isUserUnread(note);
                return (
                  <div 
                    key={note._id} 
                    className={`flex items-start gap-4 p-4 transition-colors hover:bg-muted/50 ${unread ? 'bg-primary/5' : ''}`}
                  >
                    <div className={`mt-1 p-2 rounded-full hidden sm:block ${
                      note.priority === 'critical' ? 'bg-red-100' :
                      note.priority === 'high' ? 'bg-orange-100' :
                      note.priority === 'low' ? 'bg-green-100' : 'bg-blue-100'
                    }`}>
                      {getPriorityIcon(note.priority)}
                    </div>
                    
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {unread && <span className="w-2 h-2 rounded-full bg-primary" />}
                          <h4 className={`text-sm font-semibold ${unread ? 'text-foreground' : 'text-muted-foreground'}`}>
                            {note.title}
                          </h4>
                          {note.type && (
                             <Badge variant="secondary" className="text-[10px] hidden md:inline-flex capitalize">
                               {note.type.replace(/_/g, ' ')}
                             </Badge>
                          )}
                        </div>
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                          {format(new Date(note.createdAt), "MMM d, h:mm a")}
                        </span>
                      </div>
                      
                      <p className={`text-sm ${unread ? 'text-foreground/90' : 'text-muted-foreground'}`}>
                        {note.message}
                      </p>
                      
                      {note.link && (
                        <a 
                          href={note.link} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="inline-block mt-2 text-xs text-primary hover:underline font-medium"
                        >
                          View Details &rarr;
                        </a>
                      )}
                    </div>

                    <div className="pl-2">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {unread && (
                            <DropdownMenuItem onClick={() => markAsRead(note._id)}>
                              <Check className="mr-2 h-4 w-4" /> Mark as read
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}