"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, Star, Award, Target, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface Evaluation {
  _id: string;
  week: number;
  score: number;
  feedback: string;
}

export default function InternProgressPage() {
  const [progress, setProgress] = useState({ 
    completedWeeks: 0, 
    totalWeeks: 0, 
    overallScore: 0,
    badges: [] as string[],
    evaluations: [] as Evaluation[]
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProgress();
  }, []);

  const fetchProgress = async () => {
    try {
      const res = await fetch("/api/interns/progress");
      if (res.ok) {
        const data = await res.json();
        setProgress(data.progress);
      } else {
        const error = await res.json();
        toast.error(error.error || "Failed to load progress");
      }
    } catch (err) {
      toast.error("Failed to load progress");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2 mb-4">
        <h2 className="text-3xl font-bold tracking-tight">Internship Progress</h2>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Timeline</CardTitle>
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Week {progress.completedWeeks} / {progress.totalWeeks}</div>
            <Progress 
              value={progress.totalWeeks > 0 ? (progress.completedWeeks / progress.totalWeeks) * 100 : 0} 
              className="mt-4 h-2" 
            />
            <p className="text-xs text-muted-foreground mt-2">
              {Math.max(0, progress.totalWeeks - progress.completedWeeks)} weeks remaining
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overall Performance</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">{progress.overallScore}%</div>
            <p className="text-xs text-muted-foreground mt-2">
              Based on supervisor evaluations
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Achievements</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2 pt-2">
            {progress.badges.length > 0 ? (
                progress.badges.map((badge, i) => (
                <Badge key={i} variant="secondary" className="flex items-center">
                    <Star className="h-3 w-3 mr-1 text-yellow-500" />
                    {badge}
                </Badge>
                ))
            ) : (
                <span className="text-sm text-muted-foreground">No badges earned yet.</span>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Supervisor Evaluations</CardTitle>
          <CardDescription>Bi-weekly performance reviews</CardDescription>
        </CardHeader>
        <CardContent>
          {progress.evaluations.length > 0 ? (
            <div className="space-y-8">
              {progress.evaluations.map((evalRecord) => (
                <div key={evalRecord._id} className="flex items-start space-x-4 border-b pb-6 last:border-0 last:pb-0">
                  <div className="bg-primary/10 p-3 rounded-full shrink-0">
                    <span className="font-bold text-primary">W{evalRecord.week}</span>
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm border rounded-full px-2 py-0.5 font-medium border-slate-200">
                        Score: <span className="text-indigo-600 font-bold">{evalRecord.score}/100</span>
                      </p>
                    </div>
                    <p className="text-slate-600 italic">"{evalRecord.feedback}"</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6">
                <Target className="w-12 h-12 text-muted-foreground opacity-50 mx-auto mb-2" />
                <p className="text-muted-foreground">No evaluations have been submitted yet.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
