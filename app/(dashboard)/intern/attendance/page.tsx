"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, LogIn, LogOut, FileClock } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";

export default function InternAttendancePage() {
  const [attendance, setAttendance] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAttendance();
  }, []);

  const fetchAttendance = async () => {
    try {
      const res = await fetch("/api/attendance?mine=true");
      if (res.ok) setAttendance(await res.json());
    } finally {
      setLoading(false);
    }
  };

  const handleCheckin = async () => {
    const res = await fetch("/api/attendance", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "checkIn" })
    });

    if (res.ok) {
      toast.success("Clocked in successfully");
      fetchAttendance();
    } else {
      const data = await res.json();
      toast.error(data.error || "Failed to clock in");
    }
  };

  const handleCheckout = async () => {
    const res = await fetch("/api/attendance", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "checkOut" })
    });

    if (res.ok) {
      toast.success("Clocked out successfully");
      fetchAttendance();
    } else {
      const data = await res.json();
      toast.error(data.error || "Failed to clock out");
    }
  };

  const todaysRecord = attendance.find(
    (record: any) => format(new Date(record.date), "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd")
  ) as any;

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Attendance Logs</h2>
          <p className="text-muted-foreground">Clock in and track your daily required hours.</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>Time Tracker</CardTitle>
            <CardDescription>Remember to clock out before you leave.</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-between gap-4 p-6 bg-slate-50 dark:bg-slate-900 rounded-lg">
            <div className="space-y-1">
              <span className="text-4xl font-bold font-mono tracking-tighter text-blue-600 block">{format(new Date(), 'HH:mm')}</span>
              <span className="text-sm font-medium text-slate-500 uppercase tracking-widest">{format(new Date(), 'EEEE, MMMM do')}</span>
            </div>
            <div className="space-y-2">
              <Button 
                className="w-full justify-start" 
                variant="outline"
                onClick={handleCheckin}
                disabled={!!todaysRecord?.checkIn}
              >
                <LogIn className="mr-2 h-4 w-4" /> Clock In
              </Button>
              <Button
                className="w-full justify-start"
                variant="destructive"
                onClick={handleCheckout}
                disabled={!todaysRecord?.checkIn || todaysRecord?.checkOut}
              >
                <LogOut className="mr-2 h-4 w-4" /> Clock Out For the Day
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>History</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Clock In</TableHead>
                <TableHead>Clock Out</TableHead>
                <TableHead>Hours Logged</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={5} className="text-center"><Spinner className="mx-auto" /></TableCell></TableRow>
              ) : attendance.length === 0 ? (
                <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground">No attendance records found.</TableCell></TableRow>
              ) : (
                attendance.map((record: any) => (
                  <TableRow key={record._id}>
                    <TableCell className="font-medium text-sm">{format(new Date(record.date), 'MMM dd, yyyy')}</TableCell>
                    <TableCell className="text-sm">
                      {record.checkIn ? format(new Date(record.checkIn), 'HH:mm a') : "--:--"}
                    </TableCell>
                    <TableCell className="text-sm">
                      {record.checkOut ? format(new Date(record.checkOut), 'HH:mm a') : "--:--"}
                    </TableCell>
                    <TableCell className="text-sm text-blue-600 font-bold">{record.hoursWorked || 0} hrs</TableCell>
                    <TableCell>
                      <Badge variant={
                        record.status === "Present" ? "default" :
                        record.status === "Half Day" ? "secondary" : "destructive"
                      } className={record.status === "Present" ? "bg-emerald-500" : ""}>
                        {record.status}
                      </Badge>
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
