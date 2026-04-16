"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";

export default function EmployeeLeavesPage() {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [type, setType] = useState("Annual");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reason, setReason] = useState("");

  useEffect(() => {
    fetchLeaves();
  }, []);

  const fetchLeaves = async () => {
    const res = await fetch("/api/leaves?mine=true");
    if (res.ok) setLeaves(await res.json());
    setLoading(false);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/leaves", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, startDate, endDate, reason }),
      });
      if (res.ok) {
        setIsDialogOpen(false);
        setType("Annual");
        setStartDate("");
        setEndDate("");
        setReason("");
        fetchLeaves();
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">My Leave Requests</h2>
          <p className="text-muted-foreground">Submit and track your time off.</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>Request Leave</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>New Leave Request</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-2">
                <Label>Leave Type</Label>
                <select 
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={type} onChange={(e) => setType(e.target.value)} required>
                  <option value="Annual">Annual Paid Leave</option>
                  <option value="Sick">Sick Leave</option>
                  <option value="Maternity">Maternity/Paternity</option>
                  <option value="Other">Other Unpaid Leave</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Start Date</Label>
                  <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label>End Date</Label>
                  <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} required />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Reason / Notes</Label>
                <Textarea value={reason} onChange={(e) => setReason(e.target.value)} required placeholder="Additional details for HR..." />
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={submitting}>Submit Request</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Submission History</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={5} className="text-center">Loading...</TableCell></TableRow>
              ) : leaves.length === 0 ? (
                <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground">No leave requests found.</TableCell></TableRow>
              ) : (
                leaves.map((leave: any) => (
                  <TableRow key={leave._id}>
                    <TableCell className="font-medium">{leave.type}</TableCell>
                    <TableCell>{format(new Date(leave.startDate), "MMM d")} - {format(new Date(leave.endDate), "MMM d, yyyy")}</TableCell>
                    <TableCell className="max-w-[200px] truncate" title={leave.reason}>{leave.reason}</TableCell>
                    <TableCell>{format(new Date(leave.createdAt), "MMM d, yyyy")}</TableCell>
                    <TableCell>
                      <Badge variant={leave.status === "Approved" ? "default" : leave.status === "Rejected" ? "destructive" : "secondary"}>
                        {leave.status}
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
