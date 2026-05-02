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
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";
import { Plus, Search, Filter, Trash2, Download, Users, UserCheck, GraduationCap } from "lucide-react";

export default function HRTasksPage() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "medium",
    dueDate: "",
    department: "",
    tags: "",
    bulkAssign: false,
    assignToAllEmployees: false,
    assignToAllInterns: false,
    selectedUsers: [] as string[],
  });

  useEffect(() => {
    fetchTasks();
    fetchUsers();
  }, []);

  const fetchTasks = async () => {
    try {
      const res = await fetch("/api/tasks");
      if (res.ok) {
        const data = await res.json();
        setTasks(Array.isArray(data) ? data : []);
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/users");
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users || []);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const handleCreateTask = async () => {
    if (!formData.title || !formData.dueDate) {
      toast.error("Title and Due Date are required");
      return;
    }

    if (!formData.bulkAssign && formData.selectedUsers.length === 0) {
      toast.error("Please select at least one user to assign the task");
      return;
    }

    if (formData.bulkAssign && !formData.assignToAllEmployees && !formData.assignToAllInterns && formData.selectedUsers.length === 0) {
      toast.error("Please select users or choose to assign to all employees/interns");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        ...formData,
        tags: formData.tags ? formData.tags.split(",").map((t) => t.trim()) : [],
        assignedTo: formData.selectedUsers,
      };

      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const data = await res.json();
        toast.success(`Task assigned to ${data.count} user(s) successfully`);
        setIsAddOpen(false);
        resetForm();
        fetchTasks();
      } else {
        toast.error("Failed to create task");
      }
    } catch (error) {
      toast.error("Error creating task");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteTask = async (id: string) => {
    if (!confirm("Are you sure you want to delete this task?")) return;

    try {
      const res = await fetch(`/api/tasks?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Task deleted successfully");
        fetchTasks();
      } else {
        toast.error("Failed to delete task");
      }
    } catch (error) {
      toast.error("Error deleting task");
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      priority: "medium",
      dueDate: "",
      department: "",
      tags: "",
      bulkAssign: false,
      assignToAllEmployees: false,
      assignToAllInterns: false,
      selectedUsers: [],
    });
  };

  const handleUserSelection = (userId: string, checked: boolean) => {
    setFormData((prev) => {
      const selectedUsers = checked
        ? [...prev.selectedUsers, userId]
        : prev.selectedUsers.filter((id) => id !== userId);
      return { ...prev, selectedUsers };
    });
  };

  const filteredTasks = tasks.filter((task) => {
    const matchesSearch =
      task.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || task.status === statusFilter;
    const matchesPriority = priorityFilter === "all" || task.priority === priorityFilter;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const employees = users.filter((u) => ["employee", "hr", "finance", "marketing"].includes(u.role));
  const interns = users.filter((u) => u.role === "intern");

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

  return (
    <div className="flex-1 space-y-4 pl-4 pr-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Task Management</h2>
          <p className="text-muted-foreground">Assign and manage tasks for employees and interns</p>
        </div>
        <Button onClick={() => setIsAddOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Assign New Task
        </Button>
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
          <CardTitle>All Tasks</CardTitle>
          <CardDescription>View and manage all assigned tasks</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Task</TableHead>
                <TableHead>Assigned To</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Progress</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center">
                    <Spinner className="mx-auto" />
                  </TableCell>
                </TableRow>
              ) : filteredTasks.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground">
                    No tasks found
                  </TableCell>
                </TableRow>
              ) : (
                filteredTasks.map((task) => (
                  <TableRow key={task._id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{task.title}</p>
                        <p className="text-xs text-muted-foreground line-clamp-1">{task.description}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {task.assignedTo?.name && (
                          <>
                            <Badge variant="outline" className="capitalize">
                              {task.assignedTo.name}
                            </Badge>
                            <Badge variant="secondary" className="capitalize text-xs">
                              {task.assignedTo.role}
                            </Badge>
                          </>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{getPriorityBadge(task.priority)}</TableCell>
                    <TableCell>{getStatusBadge(task.status)}</TableCell>
                    <TableCell className="text-sm">
                      {format(new Date(task.dueDate), "MMM dd, yyyy")}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-full bg-gray-200 rounded-full h-2 w-24">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${task.progress || 0}%` }}
                          />
                        </div>
                        <span className="text-xs text-muted-foreground">{task.progress || 0}%</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-red-600 hover:bg-red-50"
                        onClick={() => handleDeleteTask(task._id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Assign New Task</DialogTitle>
            <DialogDescription>Create a new task and assign it to employees or interns</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Task Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Enter task title"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Enter task description"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="priority">Priority</Label>
                <Select
                  value={formData.priority}
                  onValueChange={(value) => setFormData({ ...formData, priority: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="dueDate">Due Date *</Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="department">Department</Label>
              <Input
                id="department"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                placeholder="Enter department (optional)"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="tags">Tags (comma-separated)</Label>
              <Input
                id="tags"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                placeholder="e.g., urgent, frontend, backend"
              />
            </div>

            <div className="border-t pt-4">
              <div className="flex items-center space-x-2 mb-4">
                <Checkbox
                  id="bulkAssign"
                  checked={formData.bulkAssign}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, bulkAssign: checked as boolean })
                  }
                />
                <Label htmlFor="bulkAssign" className="font-medium">
                  Bulk Assignment Mode
                </Label>
              </div>

              {formData.bulkAssign ? (
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="assignToAllEmployees"
                      checked={formData.assignToAllEmployees}
                      onCheckedChange={(checked) =>
                        setFormData({ ...formData, assignToAllEmployees: checked as boolean })
                      }
                    />
                    <Label htmlFor="assignToAllEmployees" className="flex items-center gap-2">
                      <Users className="h-4 w-4" /> Assign to All Employees
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="assignToAllInterns"
                      checked={formData.assignToAllInterns}
                      onCheckedChange={(checked) =>
                        setFormData({ ...formData, assignToAllInterns: checked as boolean })
                      }
                    />
                    <Label htmlFor="assignToAllInterns" className="flex items-center gap-2">
                      <GraduationCap className="h-4 w-4" /> Assign to All Interns
                    </Label>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium mb-2 block">Select Employees</Label>
                    <div className="max-h-32 overflow-y-auto space-y-2 border rounded-md p-3">
                      {employees.length === 0 ? (
                        <p className="text-sm text-muted-foreground">No employees available</p>
                      ) : (
                        employees.map((user) => (
                          <div key={user._id} className="flex items-center space-x-2">
                            <Checkbox
                              id={`emp-${user._id}`}
                              checked={formData.selectedUsers.includes(user._id)}
                              onCheckedChange={(checked) => handleUserSelection(user._id, checked as boolean)}
                            />
                            <Label htmlFor={`emp-${user._id}`} className="text-sm cursor-pointer">
                              {user.name} <span className="text-muted-foreground">({user.role})</span>
                            </Label>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium mb-2 block">Select Interns</Label>
                    <div className="max-h-32 overflow-y-auto space-y-2 border rounded-md p-3">
                      {interns.length === 0 ? (
                        <p className="text-sm text-muted-foreground">No interns available</p>
                      ) : (
                        interns.map((user) => (
                          <div key={user._id} className="flex items-center space-x-2">
                            <Checkbox
                              id={`int-${user._id}`}
                              checked={formData.selectedUsers.includes(user._id)}
                              onCheckedChange={(checked) => handleUserSelection(user._id, checked as boolean)}
                            />
                            <Label htmlFor={`int-${user._id}`} className="text-sm cursor-pointer">
                              {user.name}
                            </Label>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => { setIsAddOpen(false); resetForm(); }}>
              Cancel
            </Button>
            <Button onClick={handleCreateTask} disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Assign Task"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
