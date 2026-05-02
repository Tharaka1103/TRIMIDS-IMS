"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check, X, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";

export default function HRLeavesPage() {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  useEffect(() => {
    fetchLeaves();
  }, []);

  const fetchLeaves = async () => {
    try {
      const res = await fetch("/api/leaves");
      if (res.ok) setLeaves(await res.json());
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id: string, status: string) => {
    const res = await fetch("/api/leaves", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });

    if (res.ok) {
      toast.success(`Leave request ${status.toLowerCase()}`);
      fetchLeaves();
    } else {
      toast.error("Failed to update status.");
    }
  };

  const filteredLeaves = leaves.filter((l: any) => {
    const matchesSearch = l.user?.name.toLowerCase().includes(search.toLowerCase()) ||
      l.reason.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "All" || l.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="flex-1 space-y-4 pl-4 pr-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Time-Off Requests</h2>
          <p className="text-muted-foreground">Review employee leaves, vacations, and sick days.</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-4 mb-4">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search employee or reason..."
            className="pl-8"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          className="flex h-10 w-full sm:w-auto rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="All">All Requests</option>
          <option value="Pending">Pending</option>
          <option value="Approved">Approved</option>
          <option value="Rejected">Rejected</option>
        </select>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Leave Directory</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={6} className="text-center"><Spinner className="mx-auto" /></TableCell></TableRow>
              ) : filteredLeaves.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground">No leave records found.</TableCell></TableRow>
              ) : (
                filteredLeaves.map((leave: any) => (
                  <TableRow key={leave._id}>
                    <TableCell className="font-medium text-sm">{leave.user?.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{leave.type}</Badge>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {format(new Date(leave.startDate), 'MMM dd, yyyy')} - {format(new Date(leave.endDate), 'MMM dd, yyyy')}
                    </TableCell>
                    <TableCell className="text-sm max-w-[200px] truncate">{leave.reason}</TableCell>
                    <TableCell>
                      <Badge variant={
                        leave.status === "Approved" ? "default" :
                          leave.status === "Rejected" ? "destructive" : "secondary"
                      } className={leave.status === "Approved" ? "bg-emerald-500" : ""}>
                        {leave.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {leave.status === "Pending" ? (
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-green-600 hover:bg-green-50" onClick={() => handleAction(leave._id, "Approved")}>
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600 hover:bg-red-50" onClick={() => handleAction(leave._id, "Rejected")}>
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">Processed</span>
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