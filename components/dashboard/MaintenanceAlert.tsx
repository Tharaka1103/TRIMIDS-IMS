"use client";

import { useEffect, useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Wrench, Clock, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow, format } from "date-fns";

interface MaintenanceWindow {
  _id: string;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  status: string;
}

interface MaintenanceAlertProps {
  role: string;
}

export function MaintenanceAlert({ role }: MaintenanceAlertProps) {
  const [maintenance, setMaintenance] = useState<MaintenanceWindow | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const fetchMaintenance = async () => {
      try {
        const res = await fetch("/api/maintenance?upcoming=true");
        if (res.ok) {
          const data = await res.json();
          if (data.maintenance) {
            setMaintenance(data.maintenance);
          }
        }
      } catch (error) {
        console.error("Failed to fetch maintenance:", error);
      }
    };

    fetchMaintenance();
  }, []);

  if (!maintenance || dismissed) return null;

  const isActive = maintenance.status === "active";
  const startTime = new Date(maintenance.startTime);
  const endTime = new Date(maintenance.endTime);

  return (
    <Alert
      className={`mb-6 border-2 ${
        isActive
          ? "border-destructive bg-destructive/10"
          : "border-orange-500 bg-orange-500/10"
      }`}
    >
      <Wrench
        className={`h-4 w-4 ${isActive ? "text-destructive" : "text-orange-500"}`}
      />
      <AlertTitle className="flex items-center justify-between">
        <span className={isActive ? "text-destructive" : "text-orange-600 dark:text-orange-400"}>
          {isActive ? "🔴 Maintenance In Progress" : "⚠️ Scheduled Maintenance"}
          {" — "}
          {maintenance.title}
        </span>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 -mt-1 -mr-1"
          onClick={() => setDismissed(true)}
        >
          <X className="h-3 w-3" />
        </Button>
      </AlertTitle>
      <AlertDescription className="mt-1">
        <p className="text-sm">{maintenance.description}</p>
        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {isActive
              ? `Ends ${formatDistanceToNow(endTime, { addSuffix: true })}`
              : `Starts ${formatDistanceToNow(startTime, { addSuffix: true })}`}
          </span>
          <span>
            {format(startTime, "MMM dd, HH:mm")} —{" "}
            {format(endTime, "MMM dd, HH:mm")}
          </span>
        </div>
      </AlertDescription>
    </Alert>
  );
}