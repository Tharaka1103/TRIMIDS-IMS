"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, FileText, UserPlus, Activity, Check, X } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function HRDashboardPage() {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaves();
  }, []);

  const fetchLeaves = async () => {
    const res = await fetch("/api/leaves");
    if (res.ok) setLeaves(await res.json());
    setLoading(false);
  };

  const handleAction = async (id: string, status: string) => {
    const res = await fetch("/api/leaves", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    if (res.ok) fetchLeaves();
  };

  const pendingLeaves = leaves.filter((l: any) => l.status === "Pending");

  return (
    <div className="flex-1 space-y-4 pl-4 pr-4">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Human Resources</h2>
        <p className="text-muted-foreground">Manage personnel, leaves, and recruitment.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">142</div>
            <p className="text-xs text-muted-foreground mt-1">+4 from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Leaves</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600 border-amber-600">{pendingLeaves.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Requires approval</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open Positions</CardTitle>
            <UserPlus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">3</div>
            <p className="text-xs text-muted-foreground mt-1">Active job postings</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Interns Active</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground mt-1">Currently enrolled</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Leave Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow><TableCell colSpan={4} className="text-center">Loading leaves...</TableCell></TableRow>
                ) : pendingLeaves.length === 0 ? (
                  <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground">No pending leaves.</TableCell></TableRow>
                ) : (
                  pendingLeaves.slice(0, 3).map((leave: any) => (
                    <TableRow key={leave._id}>
                      <TableCell className="font-medium">{leave.user?.name}</TableCell>
                      <TableCell>{leave.type}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{format(new Date(leave.startDate), "MMM d")} - {format(new Date(leave.endDate), "MMM d")}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" className="text-green-600 hover:text-green-700 hover:bg-green-50" onClick={() => handleAction(leave._id, "Approved")}>
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => handleAction(leave._id, "Rejected")}>
                          <X className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Recent Onboarding</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {[
                { name: "Michael Chang", role: "Software Engineer", date: "2 days ago" },
                { name: "Jessica Davis", role: "Marketing Intern", date: "1 week ago" },
                { name: "David Wilson", role: "Finance Analyst", date: "2 weeks ago" },
              ].map((person, i) => (
                <div key={i} className="flex items-center justify-between text-sm">
                  <div className="space-y-1">
                    <p className="font-medium leading-none">{person.name}</p>
                    <p className="text-muted-foreground">{person.role}</p>
                  </div>
                  <div className="text-muted-foreground text-xs">{person.date}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
