"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { format } from "date-fns";
import { Bell, Send, AlertTriangle, Info, Megaphone, CheckCircle2, Search, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

import { NotificationsInbox } from "@/app/components/shared/notifications-inbox";

const notificationSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  message: z.string().min(10, "Message must be at least 10 characters"),
  type: z.enum(["announcement", "system_alert", "maintenance_scheduled", "report_ready"]),
  priority: z.enum(["low", "medium", "high", "critical"]),
  targetRoles: z.array(z.string()).min(1, "Select at least one target role"),
  link: z.string().url("Must be a valid URL").optional().or(z.literal("")),
});

type NotificationFormValues = z.infer<typeof notificationSchema>;

const ROLES = [
  { id: "admin", label: "Administrators" },
  { id: "hr_manager", label: "HR Managers" },
  { id: "intern", label: "Interns" },
];

export default function AdminNotificationsPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [history, setHistory] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  const form = useForm<NotificationFormValues>({
    resolver: zodResolver(notificationSchema),
    defaultValues: {
      title: "",
      message: "",
      type: "announcement",
      priority: "medium",
      targetRoles: [],
      link: "",
    },
  });

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    setLoadingHistory(true);
    try {
      const res = await fetch("/api/notifications/history");
      if (res.ok) {
        const data = await res.json();
        setHistory(data.notifications || []);
      }
    } catch {
      toast.error("Failed to load notification history");
    } finally {
      setLoadingHistory(false);
    }
  };

  const onSubmit = async (data: NotificationFormValues) => {
    setIsSubmitting(true);
    try {
      const payload = {
        title: data.title,
        message: data.message,
        type: data.type,
        priority: data.priority,
        recipientRoles: data.targetRoles.includes("all") ? ROLES.map(r => r.id) : data.targetRoles,
        link: data.link || undefined,
      };

      const res = await fetch("/api/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to send notification");
      }

      toast.success("Notification sent successfully to selected roles!");
      form.reset();
      fetchHistory(); // Refresh history
    } catch (error: any) {
      toast.error(error.message || "An error occurred while sending notification");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/notifications/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        toast.success("Notification deleted/recalled");
        fetchHistory();
      } else {
        toast.error("Failed to delete notification");
      }
    } catch {
      toast.error("An error occurred");
    }
  };

  const handleSelectAllRoles = (checked: boolean) => {
    if (checked) {
      form.setValue("targetRoles", ["all", ...ROLES.map(r => r.id)]);
    } else {
      form.setValue("targetRoles", []);
    }
  };

  const PriorityIcon = () => {
    switch (form.watch("priority")) {
      case "critical": return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case "high": return <AlertTriangle className="w-4 h-4 text-orange-500" />;
      case "medium": return <Info className="w-4 h-4 text-blue-500" />;
      case "low": return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      default: return <Bell className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "critical": return <Badge variant="destructive">Critical</Badge>;
      case "high": return <Badge className="bg-orange-500 hover:bg-orange-600">High</Badge>;
      case "medium": return <Badge variant="secondary" className="bg-blue-100 text-blue-800">Medium</Badge>;
      case "low": return <Badge className="bg-green-500 hover:bg-green-600">Low</Badge>;
      default: return <Badge variant="outline">{priority}</Badge>;
    }
  };

  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Notification Center</h2>
          <p className="text-muted-foreground">
            Broadcast messages, system alerts, and announcements to your organization.
          </p>
        </div>
      </div>

      <Tabs defaultValue="compose" className="w-full">
        <TabsList className="grid w-full grid-cols-3 md:w-[600px]"><TabsTrigger value="inbox">Inbox</TabsTrigger>
          <TabsTrigger value="compose">Compose Notification</TabsTrigger>
          <TabsTrigger value="history">Sent History</TabsTrigger>
        </TabsList>
        
        <TabsContent value="inbox" className="mt-6"><div className="max-w-5xl"><NotificationsInbox userId="admin_id" /></div></TabsContent><TabsContent value="compose" className="mt-6">
          <div className="grid gap-6 md:grid-cols-2">
        <Card className="col-span-1 md:col-span-2 lg:col-span-1 border shadow-sm">
          <CardHeader className="bg-muted/30 border-b pb-4 mb-4">
            <CardTitle className="flex items-center gap-2 text-xl">
              <Megaphone className="h-5 w-5 text-primary" /> Compose Notification
            </CardTitle>
            <CardDescription>
              Craft your message and select the appropriate audience.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form id="notification-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title" className="font-semibold">Title</Label>
                <Input
                  id="title"
                  placeholder="e.g. Scheduled Maintenance Notice"
                  {...form.register("title")}
                  className={form.formState.errors.title ? "border-red-500" : ""}
                />
                {form.formState.errors.title && (
                  <p className="text-xs text-red-500">{form.formState.errors.title.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="message" className="font-semibold">Message</Label>
                <Textarea
                  id="message"
                  placeholder="Provide more details here..."
                  className={`min-h-[120px] ${form.formState.errors.message ? "border-red-500" : ""}`}
                  {...form.register("message")}
                />
                {form.formState.errors.message && (
                  <p className="text-xs text-red-500">{form.formState.errors.message.message}</p>
                )}
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label className="font-semibold">Notification Type</Label>
                  <Select
                    onValueChange={(value) => form.setValue("type", value as any)}
                    defaultValue={form.watch("type")}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="announcement">Announcement</SelectItem>
                      <SelectItem value="system_alert">System Alert</SelectItem>
                      <SelectItem value="maintenance_scheduled">Maintenance Scheduled</SelectItem>
                      <SelectItem value="report_ready">Report Ready</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="font-semibold">Priority Level</Label>
                  <Select
                    onValueChange={(value) => form.setValue("priority", value as any)}
                    defaultValue={form.watch("priority")}
                  >
                    <SelectTrigger>
                      <div className="flex items-center gap-2">
                        <PriorityIcon />
                        <SelectValue placeholder="Select priority" />
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low - General Info</SelectItem>
                      <SelectItem value="medium">Medium - Standard</SelectItem>
                      <SelectItem value="high">High - Important</SelectItem>
                      <SelectItem value="critical">Critical - Urgent Action</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-3">
                <Label className="font-semibold">Target Audience</Label>
                <div className="rounded-md border p-4 space-y-3 bg-muted/10">
                  <div className="flex items-center space-x-2 border-b pb-3 mb-1">
                    <Checkbox
                      id="all-roles"
                      checked={form.watch("targetRoles").includes("all") || form.watch("targetRoles").length >= ROLES.length}
                      onCheckedChange={handleSelectAllRoles}
                    />
                    <Label htmlFor="all-roles" className="font-medium">All Organization Members</Label>
                  </div>
                  <div className="grid grid-cols-2 gap-3 pl-2">
                    {ROLES.map((role) => (
                      <div key={role.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`role-${role.id}`}
                          checked={form.watch("targetRoles").includes(role.id)}
                          onCheckedChange={(checked) => {
                            const currentRoles = form.watch("targetRoles").filter((r) => r !== "all");
                            if (checked) {
                              form.setValue("targetRoles", [...currentRoles, role.id]);
                            } else {
                              form.setValue(
                                "targetRoles",
                                currentRoles.filter((r) => r !== role.id)
                              );
                            }
                          }}
                        />
                        <Label htmlFor={`role-${role.id}`} className="font-normal cursor-pointer">
                          {role.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
                {form.formState.errors.targetRoles && (
                  <p className="text-xs text-red-500 mt-1">{form.formState.errors.targetRoles.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="link" className="font-semibold">Action Link (Optional)</Label>
                <Input
                  id="link"
                  placeholder="https://example.com/action-required"
                  {...form.register("link")}
                  className={form.formState.errors.link ? "border-red-500" : ""}
                />
                {form.formState.errors.link && (
                  <p className="text-xs text-red-500">{form.formState.errors.link.message}</p>
                )}
                <p className="text-xs text-muted-foreground">Add an optional URL where users can go for more details.</p>
              </div>
            </form>
          </CardContent>
          <CardFooter className="bg-muted/30 border-t p-4 flex justify-between">
            <p className="text-sm text-muted-foreground hidden md:block">
              Double check your audience before sending.
            </p>
            <Button
              type="submit"
              form="notification-form"
              disabled={isSubmitting}
              className="w-full md:w-auto"
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">Sending... <Bell className="animate-spin w-4 h-4" /></span>
              ) : (
                <span className="flex items-center gap-2"><Send className="w-4 h-4" /> Send Notification</span>
              )}
            </Button>
          </CardFooter>
        </Card>

        {/* Live Preview Panel */}
        <div className="hidden lg:block space-y-6">
          <Card className="border-dashed shadow-none bg-muted/10 h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg text-muted-foreground">
                <Info className="h-5 w-5" /> Live Preview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative overflow-hidden rounded-lg border bg-background p-6 shadow-md mx-auto max-w-sm mt-4">
                <div className="flex justify-between items-start mb-4 gap-4">
                  <div className="flex gap-3">
                    <div className={`p-2 rounded-full h-fit flex-shrink-0 ${
                      form.watch("priority") === "critical" ? "bg-red-100 text-red-600" :
                      form.watch("priority") === "high" ? "bg-orange-100 text-orange-600" :
                      form.watch("priority") === "medium" ? "bg-blue-100 text-blue-600" :
                      "bg-green-100 text-green-600"
                    }`}>
                      <Bell className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold truncate w-48 leading-tight">
                        {form.watch("title") || "Notification Title"}
                      </h4>
                      <p className="text-xs text-muted-foreground mt-0.5">Just now</p>
                    </div>
                  </div>
                </div>
                <div className="text-sm text-foreground/90 whitespace-pre-wrap break-words min-h-[60px]">
                  {form.watch("message") || "Message body preview..."}
                </div>
                {form.watch("link") && !form.formState.errors.link && (
                  <div className="mt-4">
                    <Button variant="outline" size="sm" className="w-full text-xs h-8" disabled>
                      View Details
                    </Button>
                  </div>
                )}
              </div>
              <div className="mt-8 text-center text-sm text-muted-foreground">
                <p>This is how the notification card might appear inside the users' layout.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      </TabsContent>

      <TabsContent value="history" className="mt-6">
        <Card className="border shadow-sm">
          <CardHeader>
            <CardTitle>Sent Notifications History</CardTitle>
            <CardDescription>View messages you've recently broadcasted to the organization.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[200px]">Title</TableHead>
                    <TableHead>Message Extract</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Recipients</TableHead>
                    <TableHead>Date Sent</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loadingHistory ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center h-24">Loading history...</TableCell>
                    </TableRow>
                  ) : history.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center h-24">No notifications sent yet.</TableCell>
                    </TableRow>
                  ) : (
                    history.map((note) => (
                      <TableRow key={note._id}>
                        <TableCell className="font-medium truncate max-w-[200px]">{note.title}</TableCell>
                        <TableCell className="truncate max-w-[250px]">{note.message}</TableCell>
                        <TableCell className="capitalize">{note.type.replace(/_/g, ' ')}</TableCell>
                        <TableCell>{getPriorityBadge(note.priority)}</TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {note.recipientRoles?.map((r: string) => (
                               <Badge key={r} variant="outline" className="text-xs capitalize">{r.replace('_', ' ')}</Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell className="text-sm whitespace-nowrap">{format(new Date(note.createdAt), "MMM d, h:mm a")}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="destructive" size="icon" className="h-8 w-8" onClick={() => handleDelete(note._id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>

    </div>
  );
}
