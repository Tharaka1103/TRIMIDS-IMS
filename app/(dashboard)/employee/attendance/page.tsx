"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { LogIn, LogOut, Clock } from "lucide-react";

export default function EmployeeAttendancePage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"checkingIn" | "checkingOut" | "idle">("idle");

  useEffect(() => {
    fetchRecords();
  }, []);

  const fetchRecords = async () => {
    const res = await fetch("/api/attendance");
    if (res.ok) setData(await res.json());
  };

  const handleAttendance = async (action: "checkIn" | "checkOut") => {
    setStatus(action === "checkIn" ? "checkingIn" : "checkingOut");
    try {
      const res = await fetch("/api/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      if (res.ok) fetchRecords();
      else alert((await res.json()).error);
    } finally {
      setStatus("idle");
    }
  };

  const todaysRecord = data.find(
    (record: any) =>
      format(new Date(record.date), "yyyy-MM-dd") ===
      format(new Date(), "yyyy-MM-dd")
  ) as any;

  return (
    <div className="flex-1 space-y-4 pl-4 pr-4">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Attendance</h2>
        <p className="text-muted-foreground">Clock in and out of your shift.</p>
      </div>

      <div className="flex gap-4 mb-8">
        <Card className="flex-1">
          <CardHeader><CardTitle className="flex items-center gap-2"><Clock /> Today's Status</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4">
              <Button size="lg" className="w-full bg-emerald-600 hover:bg-emerald-700"
                onClick={() => handleAttendance("checkIn")} disabled={status !== "idle" || !!todaysRecord?.checkIn}>
                <LogIn className="mr-2 h-5 w-5" /> Check In
              </Button>
              <Button size="lg" variant="outline" className="w-full border-red-200 text-red-600 hover:bg-red-50"
                onClick={() => handleAttendance("checkOut")} disabled={status !== "idle" || !todaysRecord?.checkIn || !!todaysRecord?.checkOut}>
                <LogOut className="mr-2 h-5 w-5" /> Check Out
              </Button>
            </div>
            <p className="text-xs text-muted-foreground text-center">Checking in after 9:00 AM will flag your shift as Late.</p>
          </CardContent>
        </Card>
      </div>

      <h3 className="text-xl font-semibold">History</h3>
      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Check In</TableHead>
              <TableHead>Check Out</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((record: any) => (
              <TableRow key={record._id}>
                <TableCell>{format(new Date(record.date), "MMM d, yyyy")}</TableCell>
                <TableCell>{record.checkIn ? format(new Date(record.checkIn), "hh:mm a") : "-"}</TableCell>
                <TableCell>{record.checkOut ? format(new Date(record.checkOut), "hh:mm a") : "-"}</TableCell>
                <TableCell>
                  <Badge variant={record.status === "late" ? "destructive" : record.status === "absent" ? "secondary" : "default"}>
                    {record.status}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
