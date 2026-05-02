"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, UserPlus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import Link from "next/link";

export default function HREmployeesPage() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const res = await fetch("/api/users");
      if (res.ok) setEmployees(await res.json());
    } finally {
      setLoading(false);
    }
  };

  const filteredEmployees = employees.filter((e: any) => {
    const matchesSearch = e.name?.toLowerCase().includes(search.toLowerCase()) ||
      e.email?.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === "All" || e.role === roleFilter.toLowerCase() || e.role?.includes(roleFilter.toLowerCase());
    return matchesSearch && matchesRole;
  });

  return (
    <div className="flex-1 space-y-4 pl-4 pr-4">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Employee Directory</h2>
          <p className="text-muted-foreground">Manage active staff, interns, and contractors across departments.</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-4 mb-4">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search name or email..."
            className="pl-8"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          className="flex h-10 w-full sm:w-auto rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
        >
          <option value="All">All Roles</option>
          <option value="employee">Employee</option>
          <option value="intern">Intern</option>
          <option value="hr">HR</option>
          <option value="finance">Finance</option>
          <option value="marketing">Marketing</option>
          <option value="admin">Admin</option>
        </select>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Staff List</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Roles</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={5} className="text-center"><Spinner className="mx-auto" /></TableCell></TableRow>
              ) : filteredEmployees.length === 0 ? (
                <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground">No employees found.</TableCell></TableRow>
              ) : (
                filteredEmployees.map((user: any) => (
                  <TableRow key={user._id}>
                    <TableCell className="font-medium text-sm">{user.name}</TableCell>
                    <TableCell className="text-sm">{user.email}</TableCell>
                    <TableCell>
                      <div className="flex gap-1 flex-wrap">
                        <Badge variant="outline" className="text-xs uppercase">{user.role}</Badge>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">{format(new Date(user.createdAt || new Date()), 'PP')}</TableCell>
                    <TableCell>
                      {user.isActive ? (
                        <Badge variant="default" className="bg-emerald-500 hover:bg-emerald-600">Active</Badge>
                      ) : (
                        <Badge variant="destructive">Inactive</Badge>
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
