"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatDistanceToNow } from "date-fns";
import { getRoleDisplayName, getRoleBadgeColor } from "@/lib/permissions";
import { Badge } from "@/components/ui/badge";

interface RecentUsersProps {
  users: {
    _id: any;
    name: string;
    email: string;
    role: string;
    isActive: boolean;
    createdAt: Date;
  }[];
}

export function RecentUsers({ users }: RecentUsersProps) {
  return (
    <Card className="border-border">
      <CardHeader>
        <CardTitle>Recent Users</CardTitle>
        <CardDescription>Newly created accounts on the platform</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Joined</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user._id}>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-medium text-foreground">{user.name}</span>
                    <span className="text-sm text-muted-foreground">{user.email}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className={getRoleBadgeColor(user.role as any)}>
                    {getRoleDisplayName(user.role as any)}
                  </Badge>
                </TableCell>
                <TableCell>
                  {user.isActive ? (
                    <Badge variant="outline" className="bg-green-500/10 text-green-500 hover:bg-green-500/20 border-green-500/20">
                      Active
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="bg-red-500/10 text-red-500 hover:bg-red-500/20 border-red-500/20">
                      Inactive
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {formatDistanceToNow(new Date(user.createdAt), { addSuffix: true })}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}