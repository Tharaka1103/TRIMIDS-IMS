"use client";

import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Plus, Search, UserCheck, UserX } from "lucide-react";
import { format } from "date-fns";

type Intern = {
  _id: any;
  name: string;
  email: string;
  status: "active" | "inactive" | "suspended";
  department?: string;
  createdAt: string;
};

export default function AdminInternsPage() {
  const [interns, setInterns] = useState<Intern[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchInterns();
  }, []);

  const fetchInterns = async () => {
    try {
      const res = await fetch("/api/interns");
      if (res.ok) {
        const data = await res.json();
        setInterns(data);
      }
    } catch (error) {
      console.error("Failed to fetch interns", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredInterns = interns.filter(
    (intern) =>
      intern.name.toLowerCase().includes(search.toLowerCase()) ||
      intern.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Intern Management</h2>
          <p className="text-muted-foreground">
            View and manage intern accounts across the organization.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button>
            <Plus className="mr-2 h-4 w-4" /> Add Intern
          </Button>
        </div>
      </div>

      <div className="flex items-center justify-between mb-4">
        <div className="relative w-72">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search interns..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center h-24">
                  Loading interns...
                </TableCell>
              </TableRow>
            ) : filteredInterns.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center h-24">
                  No interns found.
                </TableCell>
              </TableRow>
            ) : (
              filteredInterns.map((intern) => (
                <TableRow key={intern._id}>
                  <TableCell className="font-medium">{intern.name}</TableCell>
                  <TableCell>{intern.email}</TableCell>
                  <TableCell>{intern.department || "N/A"}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        intern.status === "active"
                          ? "default"
                          : intern.status === "suspended"
                          ? "destructive"
                          : "secondary"
                      }
                    >
                      {intern.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {format(new Date(intern.createdAt), "MMM d, yyyy")}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem
                          onClick={() => navigator.clipboard.writeText(intern.email)}
                        >
                          Copy email
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>View details</DropdownMenuItem>
                        <DropdownMenuItem>Edit intern</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {intern.status === "active" ? (
                          <DropdownMenuItem className="text-red-600">
                            <UserX className="mr-2 h-4 w-4" />
                            Suspend
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem className="text-green-600">
                            <UserCheck className="mr-2 h-4 w-4" />
                            Activate
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
