"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";
import { Search, Download, Play, CheckCircle2, Clock, MessageSquare, AlertCircle, TrendingUp, ListTodo } from "lucide-react";

export default function InternTasksPage() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");

  const [isUpdateOpen, setIsUpdateOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [updateForm, setUpdateForm] = useState({
    status: "",
    progress: 0,
    comment: "",
  });

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const res = await fetch("/api/tasks?assignedToMe=true");
      if (res.ok) setTasks(await res.json());
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async () => {
    if (!selectedTask) return;

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/tasks", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: selectedTask._id,
          status: updateForm.status,
          progress: updateForm.progress,
          comment: updateForm.comment,
        }),
      });

      if (res.ok) {
        toast.success("Task updated successfully");
        setIsUpdateOpen(false);
        setSelectedTask(null);
        setUpdateForm({ status: "", progress: 0, comment: "" });
        fetchTasks();
      } else {
        toast.error("Failed to update task");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const openUpdateDialog = (task: any) => {
    setSelectedTask(task);
    setUpdateForm({
      status: task.status,
      progress: task.progress || 0,
      comment: "",
    });
    setIsUpdateOpen(true);
  };

  const generatePDFReport = () => {
    const reportContent = tasks.map((task) => ({
      Title: task.title,
      Description: task.description,
      Status: task.status,
      Priority: task.priority,
      Progress: `${task.progress || 0}%`,
      "Due Date": format(new Date(task.dueDate), "MMM dd, yyyy"),
      "Assigned By": task.assignedBy?.name || "System",
    }));

    const csvContent = [
      Object.keys(reportContent[0]).join(","),
      ...reportContent.map((row) => Object.values(row).join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `intern-tasks-report-${format(new Date(), "yyyy-MM-dd")}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast.success("Task report downloaded successfully");
  };

  const filteredTasks = tasks.filter((task) => {
    const matchesSearch =
      task.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || task.status === statusFilter;
    const matchesPriority = priorityFilter === "all" || task.priority === priorityFilter;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "secondary" | "default" | "outline" | "destructive"> = {
      todo: "secondary",
      in_progress: "default",
      review: "outline",
      completed: "default",
      cancelled: "destructive",
    };
    return (
      <Badge variant={variants[status] || "secondary"} className="capitalize">
        {status.replace("_", " ")}
      </Badge>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const colors: Record<string, string> = {
      low: "text-blue-600 bg-blue-50",
      medium: "text-amber-600 bg-amber-50",
      high: "text-orange-600 bg-orange-50",
      urgent: "text-red-600 bg-red-50",
    };
    return (
      <Badge className={colors[priority] || colors.medium} variant="outline">
        {priority.charAt(0).toUpperCase() + priority.slice(1)}
      </Badge>
    );
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority.toLowerCase()) {
      case "high":
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case "medium":
        return <AlertCircle className="h-4 w-4 text-amber-500" />;
      case "low":
        return <ListTodo className="h-4 w-4 text-blue-500" />;
      default:
        return <ListTodo className="h-4 w-4 text-slate-500" />;
    }
  };

  const getTaskStats = () => {
    const total = tasks.length;
    const completed = tasks.filter((t) => t.status === "completed").length;
    const inProgress = tasks.filter((t) => t.status === "in_progress").length;
    const pending = tasks.filter((t) => t.status === "todo").length;
    const overdue = tasks.filter((t) => new Date(t.dueDate) < new Date() && t.status !== "completed").length;
    return { total, completed, inProgress, pending, overdue };
  };

  const stats = getTaskStats();

  return (
    <div className="flex-1 space-y-4 pl-4 pr-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold  tracking-tight">Assignment Tracker</h2>
          <p className="text-muted-foreground">Manage your daily tasks, assignments, and submit work for review</p>
        </div>
        <Button onClick={generatePDFReport}>
          <Download className="mr-2 h-4 w-4" /> Download Report
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">Assigned to you</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
            <p className="text-xs text-muted-foreground">Tasks done</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <Play className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.inProgress}</div>
            <p className="text-xs text-muted-foreground">Currently working</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">{stats.pending}</div>
            <p className="text-xs text-muted-foreground">Waiting to start</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.overdue}</div>
            <p className="text-xs text-muted-foreground">Past due date</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-4">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search tasks..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[150px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="todo">To Do</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="review">Review</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
        <Select value={priorityFilter} onValueChange={setPriorityFilter}>
          <SelectTrigger className="w-full sm:w-[150px]">
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priority</SelectItem>
            <SelectItem value="low">Low</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="urgent">Urgent</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>My Tasks</CardTitle>
          <CardDescription>View and update your assigned tasks</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Task Details</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Assigned By</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Progress</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Comments</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center">
                    <Spinner className="mx-auto" />
                  </TableCell>
                </TableRow>
              ) : filteredTasks.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-muted-foreground">
                    No tasks found
                  </TableCell>
                </TableRow>
              ) : (
                filteredTasks.map((task) => (
                  <TableRow
                    key={task._id}
                    className={task.status === "completed" ? "opacity-50" : ""}
                  >
                    <TableCell>
                      <p className="font-medium text-sm">{task.title}</p>
                      <p className="text-xs text-muted-foreground line-clamp-1">{task.description}</p>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getPriorityIcon(task.priority)}
                        <span className="text-xs font-medium">{task.priority}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {task.assignedBy?.name || "System"}
                    </TableCell>
                    <TableCell>{getStatusBadge(task.status)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="bg-gray-200 rounded-full h-2 w-24">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${task.progress || 0}%` }}
                          />
                        </div>
                        <span className="text-xs text-muted-foreground">{task.progress || 0}%</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs font-medium">
                      {format(new Date(task.dueDate), "MMM dd, yyyy")}
                    </TableCell>
                    <TableCell>
                      {task.comments && task.comments.length > 0 ? (
                        <div className="flex items-center gap-1">
                          <MessageSquare className="h-4 w-4 text-blue-500" />
                          <span className="text-xs text-muted-foreground">{task.comments.length}</span>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openUpdateDialog(task)}
                        disabled={task.status === "completed" || task.status === "cancelled"}
                      >
                        Update
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isUpdateOpen} onOpenChange={setIsUpdateOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Update Task</DialogTitle>
            <DialogDescription>
              Update the status and progress for: {selectedTask?.title}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="grid gap-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={updateForm.status}
                onValueChange={(value) => setUpdateForm({ ...updateForm, status: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todo">To Do</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="review">Review</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="progress">Progress: {updateForm.progress}%</Label>
              <Input
                id="progress"
                type="range"
                min="0"
                max="100"
                value={updateForm.progress}
                onChange={(e) => setUpdateForm({ ...updateForm, progress: parseInt(e.target.value) })}
                className="w-full"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="comment">Comment (optional)</Label>
              <Textarea
                id="comment"
                value={updateForm.comment}
                onChange={(e) => setUpdateForm({ ...updateForm, comment: e.target.value })}
                placeholder="Add a comment about this task..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => { setIsUpdateOpen(false); setSelectedTask(null); }}>
              Cancel
            </Button>
            <Button onClick={handleStatusUpdate} disabled={isSubmitting}>
              {isSubmitting ? "Updating..." : "Update Task"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}