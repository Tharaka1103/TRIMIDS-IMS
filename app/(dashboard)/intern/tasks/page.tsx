"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, Play, ListTodo, AlertCircle, LogOut } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";
import { usePathname } from "next/navigation";

export default function InternTasksPage() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const res = await fetch("/api/tasks?mine=true");
      if (res.ok) setTasks(await res.json());
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id: string, newStatus: string) => {
    const res = await fetch("/api/tasks", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status: newStatus }),
    });

    if (res.ok) {
      toast.success(`Task status changed to ${newStatus}`);
      fetchTasks();
    } else {
      toast.error("Failed to update status.");
    }
  };

  const calculateStatusColor = (status: string) => {
    switch (status) {
      case "To Do": return "bg-slate-500 text-white";
      case "In Progress": return "bg-blue-500 text-white";
      case "Review": return "bg-amber-500 text-white";
      case "Done": return "bg-emerald-500 text-white";
      default: return "bg-slate-500";
    }
  };

  const calculatePriorityIcon = (priority: string) => {
    switch (priority) {
      case "High": return <AlertCircle className="h-4 w-4 text-red-500" />;
      case "Medium": return <AlertCircle className="h-4 w-4 text-amber-500" />;
      case "Low": return <ListTodo className="h-4 w-4 text-blue-500" />;
      default: return <ListTodo className="h-4 w-4 text-slate-500" />;
    }
  };

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Assignment Tracker</h2>
          <p className="text-muted-foreground">Manage your daily tasks, assignments, and submit work for review.</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>My Tasks</CardTitle>
          <CardDescription>Drag and drop support coming soon.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Task Details</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Assigned By</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Current Status</TableHead>
                <TableHead className="text-right">Update Workflow</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={6} className="text-center"><Spinner className="mx-auto" /></TableCell></TableRow>
              ) : tasks.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground">You have no tasks assigned right now.</TableCell></TableRow>
              ) : (
                tasks.map((task: any) => (
                  <TableRow key={task._id} className={task.status === "Done" ? "opacity-50" : ""}>
                    <TableCell>
                      <p className="font-medium text-sm">{task.title}</p>
                      <p className="text-xs text-muted-foreground line-clamp-1">{task.description}</p>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {calculatePriorityIcon(task.priority)}
                        <span className="text-xs font-medium">{task.priority}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">{task.assignedBy?.name || "System"}</TableCell>
                    <TableCell className="text-xs font-medium">
                      {format(new Date(task.dueDate), 'MMM dd, yyyy')}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={calculateStatusColor(task.status)}>
                        {task.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {task.status === "To Do" && (
                         <Button variant="outline" size="sm" onClick={() => handleStatusUpdate(task._id, "In Progress")}>
                           <Play className="h-4 w-4 mr-1" /> Start Task
                         </Button>
                      )}
                      {task.status === "In Progress" && (
                         <Button variant="default" size="sm" className="bg-amber-500 hover:bg-amber-600 focus:bg-amber-600" onClick={() => handleStatusUpdate(task._id, "Review")}>
                           <LogOut className="h-4 w-4 mr-1" /> Submit for Review
                         </Button>
                      )}
                      {task.status === "Review" && (
                         <span className="text-xs text-amber-600 font-medium">Pending Manager Check</span>
                      )}
                      {task.status === "Done" && (
                         <span className="text-xs text-emerald-600 font-medium">Completed</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}