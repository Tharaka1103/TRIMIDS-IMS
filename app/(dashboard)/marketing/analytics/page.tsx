"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Download, BarChart3, PieChartIcon, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function MarketingAnalyticsPage() {
  const handleDownload = () => {
    alert("Exporting analytics suite...");
  };

  return (
    <div className="flex-1 space-y-4 pl-4 pr-4">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Analytics Metrics</h2>
          <p className="text-muted-foreground">Deep dive into ROI, consumer demographics, and ad performance.</p>
        </div>
        <Button onClick={handleDownload}>
          <Download className="mr-2 h-4 w-4" /> Export Report
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <TrendingUp className="mr-2 h-5 w-5 text-emerald-500" />
              Conversion Tracking
            </CardTitle>
            <CardDescription>Monthly lead acquisition</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">Export detailed funnel metrics including bounce rates and acquisition cost per channel.</p>
            <Button variant="outline" className="w-full" onClick={handleDownload}>Download PDF</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <BarChart3 className="mr-2 h-5 w-5 text-blue-500" />
              Campaign ROI
            </CardTitle>
            <CardDescription>Generated on demand</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">View total budget expenditures vs direct revenue correlations generated over the past 12 months.</p>
            <Button variant="outline" className="w-full" onClick={handleDownload}>Download CSV</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <PieChartIcon className="mr-2 h-5 w-5 text-purple-500" />
              Audience Demographics
            </CardTitle>
            <CardDescription>Latest census update</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">Audience profiles broken down by region, engagement time, and device platform preferences.</p>
            <Button variant="outline" className="w-full" onClick={handleDownload}>Download XML</Button>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-8 bg-muted/20 border-dashed">
        <CardHeader>
          <CardTitle>Google Analytics Integration</CardTitle>
          <CardDescription>Live connection status</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium">Tracking Tag ID: G-TKX9L23P</p>
            <p className="text-xs text-emerald-600 flex items-center">
              <span className="w-2 h-2 rounded-full bg-emerald-500 mr-2" />
              Receiving live pings normally.
            </p>
          </div>
          <Button variant="secondary" size="sm">Manage Connection</Button>
        </CardContent>
      </Card>
    </div>
  );
}