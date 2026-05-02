"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Target, TrendingUp, Users, DollarSign, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Spinner } from "@/components/ui/spinner";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

export default function MarketingDashboardPage() {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    try {
      const res = await fetch("/api/campaigns");
      if (res.ok) setCampaigns(await res.json());
    } finally {
      setLoading(false);
    }
  };

  const activeCampaignsCount = campaigns.filter((c: any) => c.status === "Active").length;
  const totalBudget = campaigns.reduce((acc: number, c: any) => acc + c.budget, 0);
  const totalSpent = campaigns.reduce((acc: number, c: any) => acc + c.spent, 0);

  const data = [
    { name: 'Week 1', traffic: 4000, conversion: 240 },
    { name: 'Week 2', traffic: 3000, conversion: 139 },
    { name: 'Week 3', traffic: 2000, conversion: 980 },
    { name: 'Week 4', traffic: 2780, conversion: 390 },
  ];

  return (
    <div className="flex-1 space-y-4 pl-4 pr-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Marketing HQ</h2>
          <p className="text-muted-foreground">Monitor active campaigns, marketing spend, and lead generation velocity.</p>
        </div>
        <div className="flex gap-2">
          <Link href="/marketing/campaigns">
            <Button><Target className="mr-2 h-4 w-4" /> Go to Campaigns</Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Campaigns</CardTitle>
            <Target className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">{activeCampaignsCount}</div>
            <p className="text-xs text-muted-foreground mt-1">Currently running</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Spend (Live)</CardTitle>
            <DollarSign className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalSpent.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">Of ${totalBudget.toLocaleString()} allocated budget</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New Leads (Monthly)</CardTitle>
            <Users className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,842</div>
            <p className="text-xs text-muted-foreground mt-1">+14.5% vs last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4.2%</div>
            <p className="text-xs text-muted-foreground mt-1">+0.8% trajectory</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-4">
        <Card className="col-span-1 lg:col-span-4">
          <CardHeader>
            <CardTitle>Inbound Traffic Validation</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} />
                  <YAxis yAxisId="left" axisLine={false} tickLine={false} />
                  <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} />
                  <Tooltip cursor={{ stroke: '#cbd5e1' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Line yAxisId="left" type="monotone" dataKey="traffic" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                  <Line yAxisId="right" type="monotone" dataKey="conversion" stroke="#8b5cf6" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-1 lg:col-span-3">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Live Campaigns Rollout</CardTitle>
            <Link href="/marketing/campaigns" className="text-xs text-blue-600 flex items-center hover:underline">
              Manage <ArrowRight className="h-3 w-3 ml-1" />
            </Link>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center p-8"><Spinner /></div>
            ) : (
              <div className="space-y-4">
                {campaigns.slice(0, 5).map((campaign: any) => (
                  <div key={campaign._id} className="flex items-center justify-between py-2 border-b last:border-b-0">
                    <div>
                      <p className="text-sm font-medium leading-none">{campaign.name}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Ends: {format(new Date(campaign.endDate), 'MMM dd, yy')} • By: {campaign.owner?.name?.split(' ')[0]}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <Badge variant={
                        campaign.status === "Active" ? "default" :
                          campaign.status === "Completed" ? "secondary" : "outline"
                      } className={campaign.status === "Active" ? "bg-emerald-500" : ""}>
                        {campaign.status}
                      </Badge>
                      <span className="text-xs text-muted-foreground mr-1">${campaign.spent.toLocaleString()} spent</span>
                    </div>
                  </div>
                ))}
                {!loading && campaigns.length === 0 && (
                  <div className="text-center p-8 text-muted-foreground text-sm flex flex-col items-center">
                    <Target className="h-8 w-8 text-muted-foreground mb-2" />
                    <p>No campaigns deployed yet.</p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}