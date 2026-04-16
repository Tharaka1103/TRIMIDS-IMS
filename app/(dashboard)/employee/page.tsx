"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, Clock, CalendarDays, Banknote } from "lucide-react";

export default function EmployeeDashboardPage() {
  const [tasks, setTasks] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/tasks?assignedToMe=true").then(res => res.json()),
      fetch("/api/attendance").then(res => res.json()),
      fetch("/api/leaves?mine=true").then(res => res.json()),
      fetch("/api/expenses?mine=true").then(res => res.json())
    ]).then(([tasksData, attendanceData, leavesData, expensesData]) => {
      setTasks(tasksData || []);
      setAttendance(attendanceData || []);
      setLeaves(leavesData || []);
      setExpenses(expensesData || []);
    }).catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const completedTasks = tasks.filter((t: any) => t.status === "completed").length;
  const progressPercent = tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0;
  const pendingLeaves = leaves.filter((l: any) => l.status === "Pending").length;
  const pendingExpenses = expenses.filter((e: any) => e.status === "Pending").reduce((acc, curr: any) => acc + curr.amount, 0);

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Employee Portal</h2>
        <p className="text-muted-foreground">Manage your workday, leaves, expenses, and tasks.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Task Progress</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{progressPercent}%</div>
            <Progress value={progressPercent} className="mt-2" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Shifts Logged</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{attendance.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Days present</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Leaves</CardTitle>
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingLeaves}</div>
            <p className="text-xs text-muted-foreground mt-1">Awaiting HR approval</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Expenses</CardTitle>
            <Banknote className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">${pendingExpenses.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground mt-1">Awaiting Finance repayment</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 mt-4">
         <Card>
           <CardHeader><CardTitle>Recent Tasks</CardTitle></CardHeader>
           <CardContent>
              {loading ? <p className="text-xs text-muted-foreground">Loading...</p> : tasks.length === 0 ? <p className="text-xs text-muted-foreground">No tasks.</p> : (
                 <div className="space-y-4">
                    {tasks.slice(0, 4).map((t: any) => (
                       <div key={t._id} className="flex items-center justify-between border-b pb-2 last:border-0 last:pb-0">
                          <div>
                            <p className="font-medium text-sm">{t.title}</p>
                            <p className="text-xs text-muted-foreground">{t.dueDate ? format(new Date(t.dueDate), "MMM d") : "No due date"}</p>
                          </div>
                          <span className={`text-xs px-2 py-1 rounded-full ${t.status === "completed" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}`}>{t.status}</span>
                       </div>
                    ))}
                 </div>
              )}
           </CardContent>
         </Card>
         <Card>
           <CardHeader><CardTitle>Recent Finance Claims</CardTitle></CardHeader>
           <CardContent>
              {loading ? <p className="text-xs text-muted-foreground">Loading...</p> : expenses.length === 0 ? <p className="text-xs text-muted-foreground">No claims.</p> : (
                 <div className="space-y-4">
                    {expenses.slice(0, 4).map((e: any) => (
                       <div key={e._id} className="flex items-center justify-between border-b pb-2 last:border-0 last:pb-0">
                          <div>
                            <p className="font-medium text-sm">{e.description}</p>
                            <p className="text-xs text-muted-foreground">{format(new Date(e.createdAt), "MMM d")}</p>
                          </div>
                          <div className="text-right">
                             <p className="font-medium text-sm">${e.amount.toFixed(2)}</p>
                             <span className={`text-xs ${e.status === "Approved" ? "text-green-600" : e.status === "Rejected" ? "text-red-500" : "text-amber-500"}`}>{e.status}</span>
                          </div>
                       </div>
                    ))}
                 </div>
              )}
           </CardContent>
         </Card>
      </div>
    </div>
  );
}
