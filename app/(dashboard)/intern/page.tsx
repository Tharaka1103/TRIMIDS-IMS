"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ClipboardList, Clock, FileText, TrendingUp, CheckCircle2, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Spinner } from "@/components/ui/spinner";
import { Progress } from "@/components/ui/progress";

export default function InternDashboardPage() {
  const [tasks, setTasks] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/tasks?mine=true").then(res => res.json()).catch(() => []),
      fetch("/api/attendance?mine=true").then(res => res.json()).catch(() => [])
    ]).then(([tasksData, attendanceData]) => {
      setTasks(tasksData || []);
      setAttendance(attendanceData || []);
      setLoading(false);
    });
  }, []);

  const pendingTasks = tasks.filter((t: any) => t.status !== "Done");
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t: any) => t.status === "Done").length;
  const progressPercentage = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

  const hoursLoggedThisWeek = attendance.reduce((acc: number, record: any) => {
    if (record.status === "Present" || record.status === "Half Day") {
      return acc + (record.hoursWorked || 8);
    }
    return acc;
  }, 0);

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Internship Portal</h2>
          <p className="text-muted-foreground">Track your progress, view assignments, and log attendance.</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
             <CardTitle className="text-sm font-medium">Pending Tasks</CardTitle>
             <ClipboardList className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
             <div className="text-2xl font-bold text-blue-600">{pendingTasks.length}</div> 
             <p className="text-xs text-muted-foreground mt-1">Assignments awaiting completion</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
             <CardTitle className="text-sm font-medium">Hours Logged</CardTitle>
             <Clock className="h-4 w-4 text-emerald-500" />     
          </CardHeader>
          <CardContent>
             <div className="text-2xl font-bold text-emerald-600">{hoursLoggedThisWeek}h</div>
             <p className="text-xs text-muted-foreground mt-1">Time tracked this month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
             <CardTitle className="text-sm font-medium">Documents</CardTitle>
             <FileText className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
             <div className="text-2xl font-bold">2</div>
             <p className="text-xs text-muted-foreground mt-1">Pending signatures required</p>     
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
             <CardTitle className="text-sm font-medium">Overall Progress</CardTitle>  
             <TrendingUp className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
             <div className="text-2xl font-bold text-purple-600">{progressPercentage}%</div>    
             <Progress value={progressPercentage} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between bg-muted/40 pb-4">
            <div>
              <CardTitle>My Tasks</CardTitle>
              <CardDescription>Your recently assigned work</CardDescription>
            </div>
            <Link href="/intern/tasks">
              <Button variant="outline" size="sm">View All</Button>
            </Link>
          </CardHeader>
          <CardContent className="pt-4">
            {loading ? (
              <div className="flex justify-center p-4"><Spinner /></div>
            ) : pendingTasks.length > 0 ? (
              <div className="space-y-4">
                {pendingTasks.slice(0, 4).map((task: any) => (
                  <div key={task._id} className="flex items-start justify-between border-b pb-3 last:border-0 last:pb-0">
                    <div>
                      <p className="text-sm font-medium leading-none mb-1">{task.title}</p>
                      <p className="text-xs text-muted-foreground line-clamp-1">{task.description}</p>
                    </div>
                    <Badge variant="secondary" className="ml-2 whitespace-nowrap">{task.status}</Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center p-6 text-center text-muted-foreground">
                <CheckCircle2 className="h-8 w-8 text-emerald-500 mb-2" />
                <p className="text-sm font-medium text-foreground">You're all caught up!</p>
                <p className="text-xs">No pending tasks found.</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="bg-muted/40 pb-4">
            <CardTitle>Important Milestones</CardTitle>
            <CardDescription>Your internship timeline</CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-300 before:to-transparent">
              <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-emerald-500 text-slate-50 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
                <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white dark:bg-slate-900 border p-4 rounded-xl shadow-sm">
                  <div className="flex items-center justify-between space-x-2 mb-1">
                    <div className="font-bold text-sm text-slate-900 dark:text-slate-100">Orientation Completed</div>
                    <time className="text-xs font-medium text-emerald-500">Day 1</time>
                  </div>
                  <div className="text-slate-500 text-xs">Onboarded with HR and acquired system credentials.</div>
                </div>
              </div>
              <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
                <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-blue-500 text-slate-50 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                  <AlertCircle className="h-5 w-5 text-white" />
                </div>
                <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white dark:bg-slate-900 border p-4 rounded-xl shadow-sm">
                  <div className="flex items-center justify-between space-x-2 mb-1">
                    <div className="font-bold text-sm text-slate-900 dark:text-slate-100">Mid-term Evaluation</div>
                    <time className="text-xs font-medium text-blue-500">Month 2</time>
                  </div>
                  <div className="text-slate-500 text-xs">Performance review with direct supervisor.</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}