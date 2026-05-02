"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { FileDown, RefreshCw, Users, FileText, Database, Layers, CheckCircle, CalendarDays, Loader2 } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

type SummaryData = {
  users: number;
  interns: number;
  departments: number;
  tasks: number;
  attendances: number;
  leaveRequests: number;
};

const REPORT_CARDS = [
  { id: "users", title: "Users Report", description: "Complete overview of all registered system users.", icon: Users, key: "users" },
  { id: "interns", title: "Interns Details", description: "Detailed intern profiles and their evaluations.", icon: FileText, key: "interns" },
  { id: "departments", title: "Departments", description: "Organizational structure and department heads.", icon: Database, key: "departments" },
  { id: "tasks", title: "Task Assignments", description: "Task distribution, priorities, and completion statuses.", icon: CheckCircle, key: "tasks" },
  { id: "attendances", title: "Attendance Logs", description: "Daily attendance logs and active working hours.", icon: Layers, key: "attendances" },
  { id: "leaveRequests", title: "Leave Requests", description: "Historical and pending employee leave requests.", icon: CalendarDays, key: "leaveRequests" },
];

export default function ReportsPage() {
  const [summary, setSummary] = useState<SummaryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [generateLoading, setGenerateLoading] = useState<string | null>(null);

  // Dialog state
  const [customReportOpen, setCustomReportOpen] = useState(false);
  const [selectedModel, setSelectedModel] = useState<string>("");

  useEffect(() => {
    fetchSummary();
  }, []);

  const fetchSummary = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/reports/summary");
      if (res.ok) {
        const data = await res.json();
        setSummary(data);
      } else {
        toast.error("Failed to load reports summary.");
      }
    } catch (e) {
      console.error(e);
      toast.error("Error occurred while fetching summary.");
    } finally {
      setLoading(false);
    }
  };

  const generatePdf = async (type: string) => {
    setGenerateLoading(type);
    try {
      const res = await fetch(`/api/reports/export?type=${type}`);
      if (!res.ok) throw new Error("Failed to fetch report data");

      const { title, columns, data } = await res.json();

      if (!data || data.length === 0) {
        toast.warning("No data available to generate report for " + title);
        return;
      }

      // Generate PDF
      const doc = new jsPDF();

      // Header
      doc.setFontSize(20);
      doc.text(title, 14, 22);
      doc.setFontSize(11);
      doc.setTextColor(100);
      doc.text(`Generated on: ${format(new Date(), "PPpp")}`, 14, 30);

      // AutoTable
      autoTable(doc, {
        startY: 36,
        head: [columns],
        body: data,
        theme: "grid",
        styles: { fontSize: 9, cellPadding: 3 },
        headStyles: { fillColor: [41, 128, 185], textColor: 255 },
        alternateRowStyles: { fillColor: [245, 247, 250] },
      });

      doc.save(`${type}-report-${Date.now()}.pdf`);
      toast.success("Report downloaded successfully");
      if (customReportOpen) setCustomReportOpen(false);

    } catch (e) {
      console.error(e);
      toast.error("Failed to generate PDF map");
    } finally {
      setGenerateLoading(null);
    }
  };

  return (
    <div className="flex-1 space-y-6 pl-4 pr-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-2 sm:space-y-0">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">System Reports</h2>
          <p className="text-muted-foreground">
            Generate and download comprehensive PDF reports for system entries.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={fetchSummary} disabled={loading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button onClick={() => { setSelectedModel(""); setCustomReportOpen(true); }}>
            <FileDown className="mr-2 h-4 w-4" />
            Custom Export
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {REPORT_CARDS.map((card) => {
          const Icon = card.icon;
          const count = summary ? summary[card.key as keyof SummaryData] : 0;
          return (
            <Card key={card.id} className="hover:border-primary/50 transition-colors shadow-sm relative overflow-hidden group">
              <div className="absolute right-0 top-0 w-24 h-24 bg-primary/5 rounded-bl-full -z-10 transition-transform group-hover:scale-110" />
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-xl font-medium">
                  {card.title}
                </CardTitle>
                <Icon className="h-5 w-5 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {loading ? (
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  ) : (
                    count || "0"
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {card.description}
                </p>
              </CardContent>
              <CardFooter>
                <Button
                  variant="secondary"
                  className="w-full mt-2"
                  onClick={() => generatePdf(card.id)}
                  disabled={generateLoading === card.id || loading || !count}
                >
                  {generateLoading === card.id ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Compiling...</>
                  ) : (
                    <><FileDown className="mr-2 h-4 w-4" /> Download PDF</>
                  )}
                </Button>
              </CardFooter>
            </Card>
          )
        })}
      </div>

      {/* Custom Report Dialog */}
      <Dialog open={customReportOpen} onOpenChange={setCustomReportOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Generate Custom Report</DialogTitle>
            <DialogDescription>
              Select an entity model to generate a full PDF data export for offline viewing.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="model">Select Data Model</Label>
              <Select value={selectedModel} onValueChange={setSelectedModel}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a model..." />
                </SelectTrigger>
                <SelectContent>
                  {REPORT_CARDS.map(card => (
                    <SelectItem key={`sel-${card.id}`} value={card.id}>{card.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCustomReportOpen(false)}>Cancel</Button>
            <Button
              disabled={!selectedModel || generateLoading !== null}
              onClick={() => generatePdf(selectedModel)}
            >
              {generateLoading ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating...</>
              ) : (
                "Generate PDF Report"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}