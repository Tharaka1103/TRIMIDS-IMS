"use client";

import { useEffect, useState, useCallback } from "react";
import { format, formatDistanceToNow, isPast, isFuture } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import {
  Plus,
  Settings2,
  Trash2,
  Play,
  CheckCircle2,
  XCircle,
  Clock,
  Zap,
  Shield,
  Calendar,
  Timer,
  Edit,
  AlertTriangle,
  RefreshCw,
} from "lucide-react";

interface Maintenance {
  _id: string;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  status: "scheduled" | "active" | "completed" | "cancelled";
  isActive: boolean;
  affectedRoles: string[];
  scheduledBy: {
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

const SAMPLE_MESSAGES = [
  "We are performing scheduled system maintenance. The system will be temporarily unavailable. We apologize for any inconvenience.",
  "Planned database maintenance is in progress. All services will resume shortly. Thank you for your patience.",
  "System upgrade in progress. New features and improvements are being deployed. Please check back soon.",
  "Emergency maintenance is underway to resolve a critical issue. We are working to restore services as quickly as possible.",
  "Routine security updates are being applied. The system will be back online shortly.",
];

export default function AdminMaintenancePage() {
  const [schedules, setSchedules] = useState<Maintenance[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Maintenance | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Live timer
  const [, setTick] = useState(0);

  useEffect(() => {
    fetchSchedules();
  }, []);

  // Tick every 30s to update countdown/elapsed timers
  useEffect(() => {
    const interval = setInterval(() => setTick((t) => t + 1), 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchSchedules = useCallback(async () => {
    try {
      const res = await fetch("/api/maintenance/schedule");
      if (res.ok) {
        const data = await res.json();
        setSchedules(data);
      }
    } catch (error) {
      console.error("Failed to fetch schedules:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setStartDate("");
    setEndDate("");
    setEditingId(null);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/maintenance/schedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          startTime: startDate,
          endTime: endDate,
        }),
      });
      if (res.ok) {
        setIsCreateOpen(false);
        resetForm();
        fetchSchedules();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to create schedule");
      }
    } catch (error) {
      console.error("Error creating schedule:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingId) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/maintenance/${editingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          startTime: startDate,
          endTime: endDate,
        }),
      });
      if (res.ok) {
        setIsEditOpen(false);
        resetForm();
        fetchSchedules();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to update schedule");
      }
    } catch (error) {
      console.error("Error updating schedule:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleAction = async (id: string, action: "activate" | "complete" | "cancel") => {
    setActionLoading(id);
    try {
      const res = await fetch(`/api/maintenance/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      if (res.ok) {
        fetchSchedules();
      } else {
        const data = await res.json();
        alert(data.error || `Failed to ${action} maintenance`);
      }
    } catch (error) {
      console.error(`Error ${action} maintenance:`, error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setActionLoading(deleteTarget._id);
    try {
      const res = await fetch(`/api/maintenance/${deleteTarget._id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setDeleteTarget(null);
        fetchSchedules();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to delete schedule");
      }
    } catch (error) {
      console.error("Error deleting schedule:", error);
    } finally {
      setActionLoading(null);
    }
  };

  const openEditDialog = (schedule: Maintenance) => {
    setEditingId(schedule._id);
    setTitle(schedule.title);
    setDescription(schedule.description);
    setStartDate(format(new Date(schedule.startTime), "yyyy-MM-dd'T'HH:mm"));
    setEndDate(format(new Date(schedule.endTime), "yyyy-MM-dd'T'HH:mm"));
    setIsEditOpen(true);
  };

  const getStatusBadge = (schedule: Maintenance) => {
    switch (schedule.status) {
      case "active":
        return (
          <Badge className="bg-red-500 text-white animate-pulse gap-1">
            <Zap className="w-3 h-3" /> Active Now
          </Badge>
        );
      case "scheduled":
        return (
          <Badge variant="secondary" className="bg-blue-500/10 text-blue-500 border-blue-500/20 gap-1">
            <Clock className="w-3 h-3" /> Scheduled
          </Badge>
        );
      case "completed":
        return (
          <Badge variant="outline" className="text-emerald-500 border-emerald-500/20 gap-1">
            <CheckCircle2 className="w-3 h-3" /> Completed
          </Badge>
        );
      case "cancelled":
        return (
          <Badge variant="outline" className="text-muted-foreground gap-1">
            <XCircle className="w-3 h-3" /> Cancelled
          </Badge>
        );
      default:
        return <Badge>{schedule.status}</Badge>;
    }
  };

  const getTimeInfo = (schedule: Maintenance) => {
    const now = new Date();
    const start = new Date(schedule.startTime);
    const end = new Date(schedule.endTime);

    if (schedule.status === "active") {
      return (
        <span className="text-xs text-red-400 flex items-center gap-1">
          <Timer className="w-3 h-3" />
          Ends {formatDistanceToNow(end, { addSuffix: true })}
        </span>
      );
    }
    if (schedule.status === "scheduled" && isFuture(start)) {
      return (
        <span className="text-xs text-blue-400 flex items-center gap-1">
          <Timer className="w-3 h-3" />
          Starts {formatDistanceToNow(start, { addSuffix: true })}
        </span>
      );
    }
    if (schedule.status === "completed") {
      return (
        <span className="text-xs text-muted-foreground">
          Completed {formatDistanceToNow(end, { addSuffix: true })}
        </span>
      );
    }
    return null;
  };

  // Stats
  const activeCount = schedules.filter((s) => s.status === "active").length;
  const scheduledCount = schedules.filter((s) => s.status === "scheduled").length;
  const completedCount = schedules.filter((s) => s.status === "completed").length;

  const formContent = (
    <>
      <div className="space-y-2">
        <Label htmlFor="m-title">Event Title</Label>
        <Input
          id="m-title"
          placeholder="e.g., Q3 Database Migration"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="m-description">User-facing Message</Label>
        <Textarea
          id="m-description"
          placeholder="We are undergoing planned maintenance..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          required
        />
        <div className="space-y-1.5">
          <p className="text-xs text-muted-foreground">Quick templates:</p>
          <div className="flex flex-wrap gap-1.5">
            {SAMPLE_MESSAGES.map((msg, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setDescription(msg)}
                className="text-xs px-2 py-1 rounded-md border border-border bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors text-left"
              >
                {msg.length > 55 ? msg.slice(0, 55) + "…" : msg}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="m-start">Start Time</Label>
          <Input
            id="m-start"
            type="datetime-local"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="m-end">End Time</Label>
          <Input
            id="m-end"
            type="datetime-local"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            required
          />
        </div>
      </div>
    </>
  );

  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Shield className="w-8 h-8 text-primary" />
            System Maintenance
          </h2>
          <p className="text-muted-foreground mt-1">
            Schedule, manage and monitor system downtime windows.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => { setLoading(true); fetchSchedules(); }}>
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
          <Dialog open={isCreateOpen} onOpenChange={(open) => { setIsCreateOpen(open); if (!open) resetForm(); }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" /> Schedule Downtime
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] max-h-[85vh] overflow-y-auto scrollbar-hide-y">
              <DialogHeader>
                <DialogTitle>Schedule Maintenance Window</DialogTitle>
                <DialogDescription>
                  During this window, non-admin users will be locked out of the system.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreate} className="space-y-4 pt-2">
                {formContent}
                <DialogFooter>
                  <Button variant="outline" type="button" onClick={() => setIsCreateOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={submitting}>
                    {submitting ? "Scheduling..." : "Confirm Schedule"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center">
              <Zap className="w-5 h-5 text-red-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{activeCount}</p>
              <p className="text-xs text-muted-foreground">Active Now</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{scheduledCount}</p>
              <p className="text-xs text-muted-foreground">Scheduled</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{completedCount}</p>
              <p className="text-xs text-muted-foreground">Completed</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Active Maintenance Alert */}
      {schedules.filter((s) => s.status === "active").map((active) => (
        <div key={active._id} className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center animate-pulse">
              <AlertTriangle className="w-5 h-5 text-red-500" />
            </div>
            <div>
              <p className="font-semibold text-foreground">{active.title} — ACTIVE</p>
              <p className="text-xs text-muted-foreground">
                Non-admin users are currently locked out • Ends {formatDistanceToNow(new Date(active.endTime), { addSuffix: true })}
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="border-red-500/30 text-red-500 hover:bg-red-500/10"
            onClick={() => handleAction(active._id, "complete")}
            disabled={actionLoading === active._id}
          >
            <CheckCircle2 className="w-4 h-4 mr-1" />
            End Now
          </Button>
        </div>
      ))}

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto overflow-y-auto max-h-[500px] scrollbar-hide-y">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="whitespace-nowrap">Event</TableHead>
                  <TableHead className="whitespace-nowrap">Status</TableHead>
                  <TableHead className="whitespace-nowrap">Start Time</TableHead>
                  <TableHead className="whitespace-nowrap">End Time</TableHead>
                  <TableHead className="whitespace-nowrap">Duration</TableHead>
                  <TableHead className="whitespace-nowrap">Scheduled By</TableHead>
                  <TableHead className="whitespace-nowrap text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center h-24">
                      <RefreshCw className="animate-spin inline mr-2 h-4 w-4" />
                      Loading schedules...
                    </TableCell>
                  </TableRow>
                ) : schedules.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center h-24 text-muted-foreground">
                      <Settings2 className="inline mr-2 h-4 w-4" />
                      No maintenance windows scheduled.
                    </TableCell>
                  </TableRow>
                ) : (
                  schedules.map((schedule) => {
                    const durationMs = new Date(schedule.endTime).getTime() - new Date(schedule.startTime).getTime();
                    const durationHrs = Math.floor(durationMs / 3600000);
                    const durationMins = Math.floor((durationMs % 3600000) / 60000);
                    const durationStr = durationHrs > 0 ? `${durationHrs}h ${durationMins}m` : `${durationMins}m`;
                    const isEditable = schedule.status === "scheduled" || schedule.status === "active";

                    return (
                      <TableRow key={schedule._id} className={schedule.status === "active" ? "bg-red-500/5" : ""}>
                        <TableCell>
                          <div className="font-medium whitespace-nowrap">{schedule.title}</div>
                          <div className="text-xs text-muted-foreground line-clamp-1 max-w-[250px]">
                            {schedule.description}
                          </div>
                          {getTimeInfo(schedule)}
                        </TableCell>
                        <TableCell className="whitespace-nowrap">{getStatusBadge(schedule)}</TableCell>
                        <TableCell className="whitespace-nowrap text-sm">
                          {format(new Date(schedule.startTime), "MMM d, HH:mm")}
                        </TableCell>
                        <TableCell className="whitespace-nowrap text-sm">
                          {format(new Date(schedule.endTime), "MMM d, HH:mm")}
                        </TableCell>
                        <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                          {durationStr}
                        </TableCell>
                        <TableCell className="whitespace-nowrap">
                          <div className="text-sm">{schedule.scheduledBy?.name || "System"}</div>
                        </TableCell>
                        <TableCell className="text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1">
                            {/* Activate */}
                            {schedule.status === "scheduled" && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-blue-500 hover:text-blue-600 hover:bg-blue-500/10"
                                title="Activate Now"
                                onClick={() => handleAction(schedule._id, "activate")}
                                disabled={actionLoading === schedule._id}
                              >
                                <Play className="h-4 w-4" />
                              </Button>
                            )}
                            {/* Complete */}
                            {schedule.status === "active" && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-emerald-500 hover:text-emerald-600 hover:bg-emerald-500/10"
                                title="Mark Complete"
                                onClick={() => handleAction(schedule._id, "complete")}
                                disabled={actionLoading === schedule._id}
                              >
                                <CheckCircle2 className="h-4 w-4" />
                              </Button>
                            )}
                            {/* Edit */}
                            {isEditable && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                title="Edit"
                                onClick={() => openEditDialog(schedule)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            )}
                            {/* Cancel / Delete */}
                            {isEditable && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-500/10"
                                title="Cancel Maintenance"
                                onClick={() => setDeleteTarget(schedule)}
                                disabled={actionLoading === schedule._id}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={(open) => { setIsEditOpen(open); if (!open) resetForm(); }}>
        <DialogContent className="sm:max-w-[500px] max-h-[85vh] overflow-y-auto scrollbar-hide-y">
          <DialogHeader>
            <DialogTitle>Edit Maintenance Window</DialogTitle>
            <DialogDescription>
              Update the maintenance window details.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEdit} className="space-y-4 pt-2">
            {formContent}
            <DialogFooter>
              <Button variant="outline" type="button" onClick={() => { setIsEditOpen(false); resetForm(); }}>
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Maintenance Window?</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteTarget?.status === "active"
                ? "This maintenance is currently active. Cancelling it will immediately restore access for all users."
                : "This will cancel the scheduled maintenance window. Users will no longer be affected by it."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep It</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-500 hover:bg-red-600"
            >
              {deleteTarget?.status === "active" ? "Cancel & Restore Access" : "Cancel Maintenance"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
