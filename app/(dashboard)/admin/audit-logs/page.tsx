"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, ShieldAlert, Activity } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function AdminAuditLogsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const res = await fetch("/api/audit-logs");
      if (res.ok) setLogs(await res.json());
    } finally {
      setLoading(false);
    }
  };

  const getActionBadge = (action: string) => {
    if (action.includes("create")) return <Badge variant="default" className="bg-blue-500">Create</Badge>;
    if (action.includes("delete")) return <Badge variant="destructive">Delete</Badge>;
    if (action.includes("update")) return <Badge variant="secondary" className="bg-orange-500 text-white">Update</Badge>;
    if (action.includes("login")) return <Badge className="bg-emerald-500">Auth</Badge>;
    return <Badge variant="outline">{action}</Badge>;
  };

  const filtered = logs.filter(log => 
    log.action.toLowerCase().includes(search.toLowerCase()) || 
    log.actor?.name?.toLowerCase().includes(search.toLowerCase()) ||
    log.targetModel.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2 mb-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Audit Logs</h2>
          <p className="text-muted-foreground flex items-center gap-2">
            <ShieldAlert className="h-4 w-4" /> System security & activity records.
          </p>
        </div>
      </div>

      <div className="relative w-72 mb-4">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Filter by action, user, or model..." className="pl-8" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Timestamp</TableHead>
                <TableHead>Actor</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Target Model</TableHead>
                <TableHead>Details</TableHead>
                <TableHead className="text-right">IP Address</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                 <TableRow><TableCell colSpan={6} className="text-center h-24"><Activity className="animate-spin inline mr-2" />Loading logs...</TableCell></TableRow>
              ) : filtered.length === 0 ? (
                 <TableRow><TableCell colSpan={6} className="text-center h-24">No audit logs found.</TableCell></TableRow>
              ) : (
                filtered.map((log) => (
                  <TableRow key={log._id}>
                    <TableCell className="whitespace-nowrap text-muted-foreground">
                      {format(new Date(log.createdAt), "MMM d, HH:mm:ss")}
                    </TableCell>
                    <TableCell className="font-medium">{log.actor?.name || "System"}</TableCell>
                    <TableCell>{getActionBadge(log.action)}</TableCell>
                    <TableCell className="font-mono text-xs">{log.targetModel}</TableCell>
                    <TableCell className="text-xs max-w-[200px] truncate" title={JSON.stringify(log.details)}>
                      {JSON.stringify(log.details)}
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground text-xs">{log.ipAddress || "N/A"}</TableCell>
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
