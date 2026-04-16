"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from "recharts";

interface AdminChartsProps {
  usersByRole: { _id: any; count: number }[];
}

export function AdminCharts({ usersByRole }: AdminChartsProps) {
  const data = usersByRole.map((role) => ({
    name: role._id.replace("_", " ").toUpperCase(),
    users: role.count,
  }));

  return (
    <Card className="border-border">
      <CardHeader>
        <CardTitle>Users by Role</CardTitle>
        <CardDescription>Current distribution of active platform accounts</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`} />
              <Tooltip cursor={{ fill: "transparent" }} />
              <Bar dataKey="users" radius={[4, 4, 0, 0]} className="fill-primary" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}