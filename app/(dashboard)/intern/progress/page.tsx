"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Spinner } from "@/components/ui/spinner";
import { Progress } from "@/components/ui/progress";
import { Award, TrendingUp, Calendar, Star, Target, Trophy, Zap, Crown, Medal, Flame, Rocket, Sparkles, Gem, Shield, Heart, CheckCircle2, AlertCircle, TrendingDown, Award as AwardIcon } from "lucide-react";

interface UserAchievement {
  _id: string;
  achievementId: {
    _id: string;
    name: string;
    description: string;
    category: string;
    icon: string;
    points: number;
    color: string;
  };
  giftedBy: {
    name: string;
    email: string;
  };
  giftedAt: string;
}

interface Evaluation {
  _id: string;
  internId: {
    _id: string;
    name: string;
    email: string;
  };
  evaluatorId: {
    _id: string;
    name: string;
    email: string;
  };
  weekNumber: number;
  year: number;
  period: string;
  performanceScore: number;
  technicalSkills: number;
  communication: number;
  teamwork: number;
  problemSolving: number;
  attendance: number;
  strengths: string;
  areasForImprovement: string;
  goals: string;
  overallFeedback: string;
  createdAt: string;
  updatedAt: string;
}

export default function InternProgressPage() {
  const [userAchievements, setUserAchievements] = useState<UserAchievement[]>([]);
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const meRes = await fetch("/api/auth/me");
      if (!meRes.ok) {
        console.error("Failed to fetch user session");
        setLoading(false);
        return;
      }
      const currentUser = await meRes.json();
      if (!currentUser.user?._id) return;

      const [achievementsRes, evalsRes] = await Promise.all([
        fetch(`/api/achievements?userId=${currentUser.user._id}`),
        fetch(`/api/evaluations?internId=${currentUser.user._id}`),
      ]);

      if (achievementsRes.ok) {
        const achievementsData = await achievementsRes.json();
        setUserAchievements(achievementsData);
      }
      if (evalsRes.ok) {
        const evalsData = await evalsRes.json();
        setEvaluations(evalsData);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getTotalPoints = () => {
    return userAchievements.reduce((sum, ua) => {
      const points = typeof ua.achievementId === 'object' && ua.achievementId?.points ? ua.achievementId.points : 0;
      return sum + points;
    }, 0);
  };

  const getAverageScore = () => {
    if (evaluations.length === 0) return 0;
    const sum = evaluations.reduce((acc, e) => acc + e.performanceScore, 0);
    return (sum / evaluations.length).toFixed(1);
  };

  const getScoreColor = (score: number) => {
    if (score >= 4) return "text-green-600";
    if (score >= 3) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreIcon = (score: number) => {
    if (score >= 4) return <TrendingUp className="h-4 w-4 text-green-600" />;
    if (score >= 3) return <Target className="h-4 w-4 text-yellow-600" />;
    return <TrendingDown className="h-4 w-4 text-red-600" />;
  };

  const getLevel = () => {
    const points = getTotalPoints();
    if (points >= 1000) return { level: "All-Star", icon: "👑", color: "#fcd34d" };
    if (points >= 500) return { level: "Expert", icon: "⭐", color: "#f59e0b" };
    if (points >= 300) return { level: "Advanced", icon: "🚀", color: "#8b5cf6" };
    if (points >= 100) return { level: "Intermediate", icon: "⚡", color: "#3b82f6" };
    return { level: "Beginner", icon: "🌱", color: "#10b981" };
  };

  const level = getLevel();

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Spinner className="mx-auto" />
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">My Progress</h2>
          <p className="text-muted-foreground">Track your achievements and performance evaluations</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Points</CardTitle>
            <Trophy className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{getTotalPoints()}</div>
            <p className="text-xs text-muted-foreground mt-1">Achievement points earned</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Level</CardTitle>
            <div className="text-2xl">{level.icon}</div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{level.level}</div>
            <p className="text-xs text-muted-foreground mt-1">Based on points earned</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Score</CardTitle>
            <Star className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{getAverageScore()}/5</div>
            <p className="text-xs text-muted-foreground mt-1">Performance average</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950 dark:to-amber-900">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Achievements</CardTitle>
            <Award className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-amber-600">{userAchievements.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Badges earned</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="achievements" className="w-full">
        <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
          <TabsTrigger value="achievements" className="flex items-center gap-2">
            <Award className="h-4 w-4" /> Achievements
          </TabsTrigger>
          <TabsTrigger value="evaluations" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" /> Evaluations
          </TabsTrigger>
        </TabsList>

        <TabsContent value="achievements" className="space-y-6 mt-6">
          <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950 rounded-lg border">
            <div className="text-5xl">{level.icon}</div>
            <div>
              <h3 className="text-xl font-bold">{level.level} Intern</h3>
              <p className="text-sm text-muted-foreground">
                {getTotalPoints()} points earned • {userAchievements.length} achievements unlocked
              </p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {userAchievements.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <Award className="w-16 h-16 text-muted-foreground opacity-50 mx-auto mb-4" />
                <p className="text-muted-foreground">No achievements earned yet. Keep working hard!</p>
              </div>
            ) : (
              userAchievements.map((ua) => {
                const achievement = typeof ua.achievementId === 'object' ? ua.achievementId : null;
                if (!achievement) return null;
                return (
                  <Card key={ua._id} className="hover:shadow-lg transition-all hover:scale-105 border-2" style={{ borderColor: achievement.color }}>
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="text-4xl">{achievement.icon}</div>
                        <Badge className="ml-2" style={{ backgroundColor: achievement.color }}>
                          {achievement.points} pts
                        </Badge>
                      </div>
                      <CardTitle className="text-lg mt-2">{achievement.name}</CardTitle>
                      <CardDescription className="text-xs">{achievement.category}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-3">{achievement.description}</p>
                      <div className="text-xs text-muted-foreground flex items-center gap-1">
                        <GiftedIcon />
                        <span>Gifted by {ua.giftedBy?.name || 'Unknown'}</span>
                      </div>
                      <div className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                        <Calendar className="h-3 w-3" />
                        <span>{format(new Date(ua.giftedAt), "MMM dd, yyyy")}</span>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </TabsContent>

        <TabsContent value="evaluations" className="space-y-6 mt-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {evaluations.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <TrendingUp className="w-16 h-16 text-muted-foreground opacity-50 mx-auto mb-4" />
                <p className="text-muted-foreground">No evaluations submitted yet. Your supervisor will provide feedback soon.</p>
              </div>
            ) : (
              evaluations.map((evaluation) => (
                <Card key={evaluation._id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">Week {evaluation.weekNumber}</CardTitle>
                      <div className="flex items-center gap-2">
                        {getScoreIcon(evaluation.performanceScore)}
                        <Badge variant="outline" className={getScoreColor(evaluation.performanceScore)}>
                          {evaluation.performanceScore}/5
                        </Badge>
                      </div>
                    </div>
                    <CardDescription className="text-xs">
                      {evaluation.period} • {format(new Date(evaluation.createdAt), "MMM dd, yyyy")}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex flex-col gap-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Technical</span>
                        <div className="flex items-center gap-1">
                          <Progress value={(evaluation.technicalSkills / 5) * 100} className="w-16 h-2" />
                          <span className="font-medium text-xs">{evaluation.technicalSkills}/5</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Communication</span>
                        <div className="flex items-center gap-1">
                          <Progress value={(evaluation.communication / 5) * 100} className="w-16 h-2" />
                          <span className="font-medium text-xs">{evaluation.communication}/5</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Teamwork</span>
                        <div className="flex items-center gap-1">
                          <Progress value={(evaluation.teamwork / 5) * 100} className="w-16 h-2" />
                          <span className="font-medium text-xs">{evaluation.teamwork}/5</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Problem Solving</span>
                        <div className="flex items-center gap-1">
                          <Progress value={(evaluation.problemSolving / 5) * 100} className="w-16 h-2" />
                          <span className="font-medium text-xs">{evaluation.problemSolving}/5</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-sm col-span-2">
                        <span className="text-muted-foreground">Attendance</span>
                        <div className="flex items-center gap-1">
                          <Progress value={(evaluation.attendance / 5) * 100} className="w-16 h-2" />
                          <span className="font-medium text-xs">{evaluation.attendance}/5</span>
                        </div>
                      </div>
                    </div>

                    {evaluation.strengths && (
                      <div className="border-t pt-3">
                        <p className="text-xs font-medium text-green-600 mb-1 flex items-center gap-1">
                          <CheckCircle2 className="h-3 w-3" /> Strengths
                        </p>
                        <p className="text-sm text-muted-foreground">{evaluation.strengths}</p>
                      </div>
                    )}

                    {evaluation.areasForImprovement && (
                      <div className="border-t pt-3">
                        <p className="text-xs font-medium text-amber-600 mb-1 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" /> Areas for Improvement
                        </p>
                        <p className="text-sm text-muted-foreground">{evaluation.areasForImprovement}</p>
                      </div>
                    )}

                    {evaluation.goals && (
                      <div className="border-t pt-3">
                        <p className="text-xs font-medium text-blue-600 mb-1 flex items-center gap-1">
                          <Target className="h-3 w-3" /> Goals
                        </p>
                        <p className="text-sm text-muted-foreground">{evaluation.goals}</p>
                      </div>
                    )}

                    {evaluation.overallFeedback && (
                      <div className="border-t pt-3">
                        <p className="text-xs font-medium text-purple-600 mb-1 flex items-center gap-1">
                          <Star className="h-3 w-3" /> Overall Feedback
                        </p>
                        <p className="text-sm text-muted-foreground italic">"{evaluation.overallFeedback}"</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function GiftedIcon() {
  return <Award className="h-3 w-3" />;
}
