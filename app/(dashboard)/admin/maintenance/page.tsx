"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar, Plus, Settings2, Trash } from "lucide-react";

type Maintenance = {
  _id: any;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  status: "scheduled" | "active" | "completed";
  createdBy: {
    name: string;
    email: string;
  };
};

export default function AdminMaintenancePage() {
  const [schedules, setSchedules] = useState<Maintenance[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchSchedules();
  }, []);

  const fetchSchedules = async () => {
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
        setIsDialogOpen(false);
        setTitle("");
        setDescription("");
        setStartDate("");
        setEndDate("");
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge variant="destructive">Active Now</Badge>;
      case "scheduled":
        return <Badge variant="secondary">Scheduled</Badge>;
      case "completed":
        return <Badge variant="outline">Completed</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">System Maintenance</h2>
          <p className="text-muted-foreground">
            Schedule and manage system downtime windows.
          </p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Schedule Downtime
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Schedule Maintenance Window</DialogTitle>
              <DialogDescription>
                During this window, regular users will be locked out of the system.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="title">Event Title</Label>
                <Input
                  id="title"
                  placeholder="e.g., Q3 Database Migration"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">User-facing Message</Label>
                <Textarea
                  id="description"
                  placeholder="We are undergoing planned maintenance..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="start">Start Time</Label>
                  <Input
                    id="start"
                    type="datetime-local"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="end">End Time</Label>
                  <Input
                    id="end"
                    type="datetime-local"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    required
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" type="button" onClick={() => setIsDialogOpen(false)}>
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

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Event</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Start Time</TableHead>
              <TableHead>End Time</TableHead>
              <TableHead>Scheduled By</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center h-24">
                  Loading schedules...
                </TableCell>
              </TableRow>
            ) : schedules.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center h-24 text-muted-foreground">
                  No maintenance windows scheduled.
                </TableCell>
              </TableRow>
            ) : (
              schedules.map((schedule) => (
                <TableRow key={schedule._id}>
                  <TableCell>
                    <div className="font-medium">{schedule.title}</div>
                    <div className="text-xs text-muted-foreground line-clamp-1">
                      {schedule.description}
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(schedule.status)}</TableCell>
                  <TableCell>
                    {format(new Date(schedule.startTime), "PPp")}
                  </TableCell>
                  <TableCell>
                    {format(new Date(schedule.endTime), "PPp")}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <div className="text-sm">{schedule.createdBy?.name || "System"}</div>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" disabled={schedule.status === "completed"}>
                      <Settings2 className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600" disabled={schedule.status === "completed"}>
                      <Trash className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
