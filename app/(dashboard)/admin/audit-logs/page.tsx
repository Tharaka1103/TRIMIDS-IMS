"use client";


import { useEffect, useState } from "react";
import { format } from "date-fns";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, ShieldAlert, Activity, LogIn, Globe, MonitorSmartphone } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function AdminAuditLogsPage() {
  const [tab, setTab] = useState("logs");
  const [logs, setLogs] = useState<any[]>([]);
  const [logins, setLogins] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingLogins, setLoadingLogins] = useState(true);
  const [search, setSearch] = useState("");
  const [loginSearch, setLoginSearch] = useState("");

  useEffect(() => {
    fetchLogs();
    fetchLogins();
  }, []);

  const fetchLogs = async () => {
    try {
      const res = await fetch("/api/audit-logs");
      if (res.ok) setLogs(await res.json());
    } finally {
      setLoading(false);
    }
  };

  const fetchLogins = async () => {
    try {
      const res = await fetch("/api/audit-logs/admin-logins");
      if (res.ok) setLogins(await res.json());
    } finally {
      setLoadingLogins(false);
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
    log.action?.toLowerCase().includes(search.toLowerCase()) ||
    log.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
    log.resource?.toLowerCase().includes(search.toLowerCase())
  );

  const filteredLogins = logins.filter((login) =>
    (login.admin?.name?.toLowerCase() || "").includes(loginSearch.toLowerCase()) ||
    (login.admin?.email?.toLowerCase() || "").includes(loginSearch.toLowerCase()) ||
    (login.ipAddress || "").includes(loginSearch)
  );

  return (
    <div className="flex-1 space-y-4 pl-4 pr-4">
      <div className="flex items-center justify-between space-y-2 mb-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Audit Logs</h2>
          <p className="text-muted-foreground flex items-center gap-2">
            <ShieldAlert className="h-4 w-4" /> System security & activity records.
          </p>
        </div>
      </div>

      <Tabs value={tab} onValueChange={setTab} className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="logs">Audit Logs</TabsTrigger>
          <TabsTrigger value="logins"><LogIn className="inline w-4 h-4 mr-1" />Admin Logins</TabsTrigger>
        </TabsList>

        <TabsContent value="logs">
          <div className="relative w-72 mb-4">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Filter by action, user, or model..." className="pl-8" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto overflow-y-auto max-h-[500px] scrollbar-hide-y">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="whitespace-nowrap">Timestamp</TableHead>
                      <TableHead className="whitespace-nowrap">User</TableHead>
                      <TableHead className="whitespace-nowrap">Action</TableHead>
                      <TableHead className="whitespace-nowrap">Resource</TableHead>
                      <TableHead className="whitespace-nowrap">Status</TableHead>
                      <TableHead className="whitespace-nowrap">Details</TableHead>
                      <TableHead className="whitespace-nowrap text-right">IP Address</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow><TableCell colSpan={7} className="text-center h-24"><Activity className="animate-spin inline mr-2" />Loading logs...</TableCell></TableRow>
                    ) : filtered.length === 0 ? (
                      <TableRow><TableCell colSpan={7} className="text-center h-24">No audit logs found.</TableCell></TableRow>
                    ) : (
                      filtered.map((log) => (
                        <TableRow key={log._id}>
                          <TableCell className="whitespace-nowrap text-muted-foreground">
                            {format(new Date(log.createdAt), "MMM d, HH:mm:ss")}
                          </TableCell>
                          <TableCell className="font-medium whitespace-nowrap">{log.user?.name || "System"}</TableCell>
                          <TableCell className="whitespace-nowrap">{getActionBadge(log.action)}</TableCell>
                          <TableCell className="font-mono text-xs capitalize whitespace-nowrap">{log.resource || "-"}</TableCell>
                          <TableCell className="whitespace-nowrap">
                            {log.status === "success" ? (
                              <Badge className="bg-emerald-500">Success</Badge>
                            ) : (
                              <Badge variant="destructive">Failed</Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-xs max-w-[200px] truncate" title={log.details ? JSON.stringify(log.details) : ""}>
                            {log.details ? JSON.stringify(log.details) : "-"}
                          </TableCell>
                          <TableCell className="text-right text-muted-foreground text-xs whitespace-nowrap">{log.ipAddress || "N/A"}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logins">
          <div className="relative w-72 mb-4">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Filter by admin, email, or IP..." className="pl-8" value={loginSearch} onChange={(e) => setLoginSearch(e.target.value)} />
          </div>
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto overflow-y-auto max-h-[500px] scrollbar-hide-y">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="whitespace-nowrap">Date</TableHead>
                      <TableHead className="whitespace-nowrap">Time</TableHead>
                      <TableHead className="whitespace-nowrap">Admin</TableHead>
                      <TableHead className="whitespace-nowrap">Email</TableHead>
                      <TableHead className="whitespace-nowrap">Last Login</TableHead>
                      <TableHead className="whitespace-nowrap">IP Address</TableHead>
                      <TableHead className="whitespace-nowrap">Browser</TableHead>
                      <TableHead className="whitespace-nowrap">Status</TableHead>
                      <TableHead className="whitespace-nowrap">Details</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loadingLogins ? (
                      <TableRow><TableCell colSpan={9} className="text-center h-24"><Activity className="animate-spin inline mr-2" />Loading logins...</TableCell></TableRow>
                    ) : filteredLogins.length === 0 ? (
                      <TableRow><TableCell colSpan={9} className="text-center h-24">No admin logins found.</TableCell></TableRow>
                    ) : (
                      filteredLogins.map((login) => (
                        <TableRow key={login._id}>
                          <TableCell className="whitespace-nowrap">{format(new Date(login.timestamp), "yyyy-MM-dd")}</TableCell>
                          <TableCell className="whitespace-nowrap">{format(new Date(login.timestamp), "HH:mm:ss")}</TableCell>
                          <TableCell className="font-medium whitespace-nowrap">{login.admin?.name || "-"}</TableCell>
                          <TableCell className="font-mono text-xs whitespace-nowrap">{login.admin?.email}</TableCell>
                          <TableCell className="text-xs whitespace-nowrap">{login.admin?.lastLogin ? format(new Date(login.admin.lastLogin), "MMM d, HH:mm") : "-"}</TableCell>
                          <TableCell className="text-xs whitespace-nowrap">{login.ipAddress || "-"}</TableCell>
                          <TableCell className="text-xs whitespace-nowrap" title={login.userAgent}><MonitorSmartphone className="inline w-4 h-4 mr-1" />{login.userAgent?.split(" ")[0]}</TableCell>
                          <TableCell className="whitespace-nowrap">{login.status === "success" ? <Badge className="bg-emerald-500">Success</Badge> : <Badge variant="destructive">Failed</Badge>}</TableCell>
                          <TableCell className="text-xs max-w-[200px] truncate" title={JSON.stringify(login.details)}>{login.details ? JSON.stringify(login.details) : "-"}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
