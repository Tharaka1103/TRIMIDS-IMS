"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";
import { Search, Play, Pause, CheckCircle } from "lucide-react";

export default function MarketingCampaignsPage() {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const [formData, setFormData] = useState({
    name: "",
    type: "Email",
    budget: 0,
    startDate: "",
    endDate: ""
  });

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

  const handleStatusUpdate = async (id: string, newStatus: string) => {
    const res = await fetch("/api/campaigns", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status: newStatus }),
    });

    if (res.ok) {
      toast.success(`Campaign marked as ${newStatus}`);
      fetchCampaigns();
    } else {
      toast.error("Failed to update campaign.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.startDate || !formData.endDate || formData.budget <= 0) {
      toast.error("Please fill all required fields correctly.");
      return;
    }

    const res = await fetch("/api/campaigns", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    if (res.ok) {
      toast.success("Campaign launched!");
      setIsDialogOpen(false);
      fetchCampaigns();
      setFormData({
        name: "",
        type: "Email",
        budget: 0,
        startDate: "",
        endDate: ""
      });
    } else {
      toast.error("Failed to create campaign.");
    }
  };

  const filteredCampaigns = campaigns.filter((c: any) => 
    c.name.toLowerCase().includes(search.toLowerCase()) || c.type.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Campaign Manager</h2>
          <p className="text-muted-foreground">Draft, schedule, and oversee marketing operations.</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>Create Campaign</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Deploy New Campaign</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>Campaign Name</Label>
                <Input required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="e.g. Q4 Winter Sale" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Type</Label>
                  <select
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  >
                    <option value="Email">Email Marketing</option>
                    <option value="Social Media">Social Media</option>
                    <option value="SEO">SEO</option>
                    <option value="PPC">PPC Ads</option>
                    <option value="Event">Live Event</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Total Budget ($)</Label>
                  <Input type="number" required value={formData.budget} onChange={(e) => setFormData({ ...formData, budget: Number(e.target.value) })} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Start Date</Label>
                  <Input type="date" required value={formData.startDate} onChange={(e) => setFormData({ ...formData, startDate: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>End Date</Label>
                  <Input type="date" required value={formData.endDate} onChange={(e) => setFormData({ ...formData, endDate: e.target.value })} />
                </div>
              </div>
              <div className="pt-4 flex justify-end">
                <Button type="submit">Save & Initialize</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative w-full sm:max-w-xs mb-4">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search campaigns..."
          className="pl-8"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Campaigns</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Campaign Name</TableHead>
                <TableHead>Strategy Type</TableHead>
                <TableHead>Timeline</TableHead>
                <TableHead>Budget</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={6} className="text-center"><Spinner className="mx-auto" /></TableCell></TableRow>
              ) : filteredCampaigns.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground">No campaigns match your query.</TableCell></TableRow>
              ) : (
                filteredCampaigns.map((campaign: any) => (
                  <TableRow key={campaign._id}>
                    <TableCell className="font-medium text-sm">{campaign.name}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{campaign.type}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {format(new Date(campaign.startDate), 'MMM dd')} - {format(new Date(campaign.endDate), 'MMM dd, yyyy')}
                    </TableCell>
                    <TableCell className="text-sm">
                      <div className="flex flex-col">
                        <span>${campaign.spent.toLocaleString()} spent</span>
                        <span className="text-xs text-muted-foreground">of ${campaign.budget.toLocaleString()}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={
                        campaign.status === "Active" ? "default" :
                        campaign.status === "Paused" ? "secondary" : 
                        campaign.status === "Completed" ? "outline" : "outline"
                      } className={campaign.status === "Active" ? "bg-emerald-500" : ""}>
                        {campaign.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {campaign.status === "Draft" || campaign.status === "Paused" ? (
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-emerald-600 hover:bg-emerald-50" onClick={() => handleStatusUpdate(campaign._id, "Active")}>
                            <Play className="h-4 w-4" />
                          </Button>
                        ) : campaign.status === "Active" ? (
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-amber-600 hover:bg-amber-50" onClick={() => handleStatusUpdate(campaign._id, "Paused")}>
                            <Pause className="h-4 w-4" />
                          </Button>
                        ) : null}
                        {campaign.status !== "Completed" && (
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600 hover:bg-blue-50" onClick={() => handleStatusUpdate(campaign._id, "Completed")}>
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
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