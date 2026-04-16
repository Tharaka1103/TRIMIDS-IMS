"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { CheckCircle2, Clock, PlayCircle } from "lucide-react";

export default function EmployeeTasksPage() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

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

  const getStatusIcon = (status: string) => {
    if (status === "todo") return <Clock className="text-gray-400" />;
    if (status === "in-progress") return <PlayCircle className="text-blue-500" />;
    return <CheckCircle2 className="text-emerald-500" />;
  };

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">My Tasks</h2>
        <p className="text-muted-foreground">Manage your assigned duties.</p>
      </div>

      {loading ? (
        <p className="text-muted-foreground">Loading tasks...</p>
      ) : tasks.length === 0 ? (
        <p className="text-muted-foreground">You have no tasks assigned.</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {tasks.map((task: any) => (
             <Card key={task._id} className="hover:shadow-md transition-shadow">
               <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                 <CardTitle className="text-sm font-semibold">{task.title}</CardTitle>
                 {getStatusIcon(task.status)}
               </CardHeader>
               <CardContent>
                 <div className="text-xs text-muted-foreground mb-4">
                   {task.description.slice(0, 80)}{task.description.length > 80 ? "..." : ""}
                 </div>
                 <div className="flex justify-between items-center text-xs">
                   <span className="font-medium">Due: {task.dueDate ? format(new Date(task.dueDate), "MMM d") : "No date"}</span>
                   <Badge variant={task.priority === "high" ? "destructive" : task.priority === "medium" ? "default" : "secondary"}>
                     {task.priority}
                   </Badge>
                 </div>
               </CardContent>
             </Card>
          ))}
        </div>
      )}
    </div>
  );
}
