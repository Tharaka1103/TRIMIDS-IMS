"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, Star, Award, Target } from "lucide-react";

export default function InternProgressPage() {
  const [progress, setProgress] = useState({ 
    completedWeeks: 4, 
    totalWeeks: 12, 
    overallScore: 88,
    badges: ['Fast Learner', 'Code Ninja', 'Punctual'],
    evaluations: [
      { id: 1, week: 2, score: 85, feedback: "Good start, needs more familiarity with the stack." },
      { id: 2, week: 4, score: 90, feedback: "Excellent improvement. Handling tasks well." }
    ]
  });

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
            <Progress value={(progress.completedWeeks / progress.totalWeeks) * 100} className="mt-4 h-2" />
            <p className="text-xs text-muted-foreground mt-2">
              {(progress.totalWeeks - progress.completedWeeks)} weeks remaining
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
            {progress.badges.map((badge, i) => (
              <Badge key={i} variant="secondary" className="flex items-center">
                <Star className="h-3 w-3 mr-1 text-yellow-500" />
                {badge}
              </Badge>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Supervisor Evaluations</CardTitle>
          <CardDescription>Bi-weekly performance reviews</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-8">
            {progress.evaluations.map((evalRecord) => (
              <div key={evalRecord.id} className="flex items-start space-x-4 border-b pb-6 last:border-0 last:pb-0">
                <div className="bg-primary/10 p-3 rounded-full">
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
        </CardContent>
      </Card>
    </div>
  );
}