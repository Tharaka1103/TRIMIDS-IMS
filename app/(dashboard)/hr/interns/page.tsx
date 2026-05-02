"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";
import { Search, Award, TrendingUp, Users, Gift, Star, CheckCircle2, Calendar, Target, Zap, Crown, Medal, Trophy, Flame, Rocket, Sparkles, Gem, Diamond, Heart, Shield, Sword, Wand, Ribbon, BadgeCheck, BadgeAlert, BadgeHelp, BadgeInfo, Sparkle } from "lucide-react";

interface Achievement {
  _id: string;
  name: string;
  description: string;
  category: string;
  icon: string;
  points: number;
  color: string;
}

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
}

const HARDCODED_ACHIEVEMENTS: Achievement[] = [
  { _id: "1", name: "First Steps", description: "Complete your first task", category: "Milestone", icon: "🎯", points: 10, color: "#3b82f6" },
  { _id: "2", name: "Quick Learner", description: "Complete 5 tasks in a week", category: "Speed", icon: "⚡", points: 25, color: "#f59e0b" },
  { _id: "3", name: "Consistent Performer", description: "Maintain 100% attendance for a month", category: "Attendance", icon: "📅", points: 30, color: "#10b981" },
  { _id: "4", name: "Problem Solver", description: "Solve a complex issue independently", category: "Skills", icon: "🧩", points: 40, color: "#8b5cf6" },
  { _id: "5", name: "Team Player", description: "Help 3 teammates with their tasks", category: "Teamwork", icon: "🤝", points: 35, color: "#ec4899" },
  { _id: "6", name: "Code Champion", description: "Write clean, documented code", category: "Technical", icon: "💻", points: 45, color: "#06b6d4" },
  { _id: "7", name: "Bug Buster", description: "Fix 10 bugs", category: "Technical", icon: "🐛", points: 50, color: "#ef4444" },
  { _id: "8", name: "Early Bird", description: "Complete tasks before deadline consistently", category: "Time Management", icon: "🌅", points: 20, color: "#f97316" },
  { _id: "9", name: "Innovator", description: "Propose a new feature idea", category: "Innovation", icon: "💡", points: 55, color: "#eab308" },
  { _id: "10", name: "Mentor", description: "Help onboard a new intern", category: "Leadership", icon: "🎓", points: 60, color: "#6366f1" },
  { _id: "11", name: "Documentation Expert", description: "Create comprehensive documentation", category: "Skills", icon: "📝", points: 40, color: "#14b8a6" },
  { _id: "12", name: "Test Master", description: "Write 100 test cases", category: "Quality", icon: "✅", points: 70, color: "#22c55e" },
  { _id: "13", name: "Speed Demon", description: "Complete a task in under 2 hours", category: "Speed", icon: "🚀", points: 35, color: "#3b82f6" },
  { _id: "14", name: "Perfect Attendance", description: "No absences for 3 months", category: "Attendance", icon: "🌟", points: 100, color: "#fbbf24" },
  { _id: "15", name: "Collaborator", description: "Work on 5 team projects", category: "Teamwork", icon: "👥", points: 45, color: "#a855f7" },
  { _id: "16", name: "Security Guardian", description: "Identify a security vulnerability", category: "Technical", icon: "🛡️", points: 80, color: "#dc2626" },
  { _id: "17", name: "UI/UX Wizard", description: "Design 10 user interfaces", category: "Design", icon: "🎨", points: 50, color: "#ec4899" },
  { _id: "18", name: "Database Pro", description: "Optimize database queries", category: "Technical", icon: "🗄️", points: 55, color: "#0891b2" },
  { _id: "19", name: "Communication Star", description: "Present in 3 team meetings", category: "Communication", icon: "🎤", points: 30, color: "#f43f5e" },
  { _id: "20", name: "Deadline Crusher", description: "Complete all weekly tasks on time", category: "Time Management", icon: "🎯", points: 40, color: "#8b5cf6" },
  { _id: "21", name: "Code Reviewer", description: "Review 20 pull requests", category: "Quality", icon: "👁️", points: 60, color: "#0ea5e9" },
  { _id: "22", name: "Automation Expert", description: "Automate a manual process", category: "Innovation", icon: "⚙️", points: 65, color: "#64748b" },
  { _id: "23", name: "Customer Focus", description: "Receive positive feedback from client", category: "Service", icon: "💼", points: 75, color: "#059669" },
  { _id: "24", name: "Knowledge Sharer", description: "Conduct a knowledge sharing session", category: "Leadership", icon: "📚", points: 50, color: "#7c3aed" },
  { _id: "25", name: "Bug Prevention", description: "Prevent a bug in production", category: "Quality", icon: "🚫", points: 85, color: "#be185d" },
  { _id: "26", name: "Performance Tuner", description: "Improve app performance by 20%", category: "Technical", icon: "📈", points: 70, color: "#0d9488" },
  { _id: "27", name: "Cross-Team Player", description: "Collaborate with another department", category: "Teamwork", icon: "🌐", points: 45, color: "#4f46e5" },
  { _id: "28", name: "Research Pioneer", description: "Research and implement new technology", category: "Innovation", icon: "🔬", points: 90, color: "#c026d3" },
  { _id: "29", name: "Quality Champion", description: "Maintain 100% code quality score", category: "Quality", icon: "🏆", points: 95, color: "#d97706" },
  { _id: "30", name: "All-Star Intern", description: "Earn 1000 total achievement points", category: "Milestone", icon: "⭐", points: 150, color: "#fcd34d" },
  { _id: "31", name: "Creative Mind", description: "Design a creative solution", category: "Innovation", icon: "🎭", points: 55, color: "#f472b6" },
  { _id: "32", name: "Debug Master", description: "Debug a critical issue", category: "Technical", icon: "🔍", points: 60, color: "#6366f1" },
];

export default function HRInternsPage() {
  const [activeTab, setActiveTab] = useState("achievements");
  const [achievements, setAchievements] = useState<Achievement[]>(HARDCODED_ACHIEVEMENTS);
  const [filteredAchievements, setFilteredAchievements] = useState<Achievement[]>(HARDCODED_ACHIEVEMENTS);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const [interns, setInterns] = useState<User[]>([]);
  const [loadingInterns, setLoadingInterns] = useState(true);

  const [isGiftModalOpen, setIsGiftModalOpen] = useState(false);
  const [selectedIntern, setSelectedIntern] = useState<User | null>(null);
  const [selectedAchievements, setSelectedAchievements] = useState<string[]>([]);
  const [isGifting, setIsGifting] = useState(false);
  const [alreadyGiftedAchievements, setAlreadyGiftedAchievements] = useState<string[]>([]);

  const [evaluations, setEvaluations] = useState<any[]>([]);
  const [selectedInternForEval, setSelectedInternForEval] = useState<User | null>(null);
  const [isEvalModalOpen, setIsEvalModalOpen] = useState(false);
  const [isSubmittingEval, setIsSubmittingEval] = useState(false);

  const [evalForm, setEvalForm] = useState({
    weekNumber: getCurrentWeek(),
    year: new Date().getFullYear(),
    period: "bi-weekly",
    performanceScore: 3,
    technicalSkills: 3,
    communication: 3,
    teamwork: 3,
    problemSolving: 3,
    attendance: 3,
    strengths: "",
    areasForImprovement: "",
    goals: "",
    overallFeedback: "",
  });

  useEffect(() => {
    fetchInterns();
    fetchEvaluations();
  }, []);

  useEffect(() => {
    filterAchievements();
  }, [searchTerm, categoryFilter]);

  function getCurrentWeek() {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 1);
    const diff = now.getTime() - start.getTime();
    return Math.ceil(diff / (7 * 24 * 60 * 60 * 1000));
  }

  const fetchInterns = async () => {
    try {
      const res = await fetch("/api/users");
      if (res.ok) {
        const data = await res.json();
        setInterns(data.users.filter((u: User) => u.role === "intern"));
      }
    } finally {
      setLoadingInterns(false);
    }
  };

  const fetchEvaluations = async () => {
    try {
      const res = await fetch("/api/evaluations");
      if (res.ok) {
        setEvaluations(await res.json());
      }
    } catch (error) {
      console.error("Error fetching evaluations:", error);
    }
  };

  const filterAchievements = () => {
    let filtered = achievements;

    if (searchTerm) {
      filtered = filtered.filter(
        (a) =>
          a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          a.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          a.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (categoryFilter !== "all") {
      filtered = filtered.filter((a) => a.category === categoryFilter);
    }

    setFilteredAchievements(filtered);
  };

  const fetchAlreadyGiftedAchievements = async (userId: string) => {
    try {
      const res = await fetch(`/api/achievements?userId=${userId}`);
      if (res.ok) {
        const data = await res.json();
        const giftedIds = data.map((ua: any) => {
          if (typeof ua.achievementId === 'object' && ua.achievementId?._id) {
            return ua.achievementId._id;
          }
          return ua.achievementId;
        });
        setAlreadyGiftedAchievements(giftedIds);
      }
    } catch (error) {
      console.error("Error fetching gifted achievements:", error);
    }
  };

  const handleGiftAchievements = async () => {
    if (!selectedIntern || selectedAchievements.length === 0) {
      toast.error("Please select an intern and at least one achievement");
      return;
    }

    setIsGifting(true);
    try {
      const res = await fetch("/api/achievements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: selectedIntern._id,
          achievementIds: selectedAchievements,
        }),
      });

      if (res.ok) {
        toast.success(`Successfully gifted ${selectedAchievements.length} achievement(s) to ${selectedIntern.name}`);
        setIsGiftModalOpen(false);
        setSelectedIntern(null);
        setSelectedAchievements([]);
        setAlreadyGiftedAchievements([]);
      } else {
        toast.error("Failed to gift achievements");
      }
    } catch (error) {
      toast.error("Error gifting achievements");
    } finally {
      setIsGifting(false);
    }
  };

  const handleEvaluationSubmit = async () => {
    if (!selectedInternForEval) return;

    setIsSubmittingEval(true);
    try {
      const res = await fetch("/api/evaluations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          internId: selectedInternForEval._id,
          ...evalForm,
        }),
      });

      if (res.ok) {
        toast.success("Evaluation submitted successfully");
        setIsEvalModalOpen(false);
        setSelectedInternForEval(null);
        setEvalForm({
          weekNumber: getCurrentWeek(),
          year: new Date().getFullYear(),
          period: "bi-weekly",
          performanceScore: 3,
          technicalSkills: 3,
          communication: 3,
          teamwork: 3,
          problemSolving: 3,
          attendance: 3,
          strengths: "",
          areasForImprovement: "",
          goals: "",
          overallFeedback: "",
        });
        fetchEvaluations();
        fetchInterns();
      } else {
        toast.error("Failed to submit evaluation");
      }
    } catch (error) {
      toast.error("Error submitting evaluation");
    } finally {
      setIsSubmittingEval(false);
    }
  };

  const categories = Array.from(new Set(achievements.map((a) => a.category)));

  const getInternEvaluations = (internId: string) => {
    return evaluations.filter((e) => e.internId._id === internId);
  };

  const getAverageScore = (internId: string) => {
    const internEvals = getInternEvaluations(internId);
    if (internEvals.length === 0) return "0.0";
    const sum = internEvals.reduce((acc: number, e: any) => acc + (e.performanceScore || 0), 0);
    return (sum / internEvals.length).toFixed(1);
  };

  return (
    <div className="flex-1 space-y-6 pl-4 pr-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Intern Management</h2>
          <p className="text-muted-foreground">Manage intern achievements and performance evaluations</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 lg:w-[600px]">
          <TabsTrigger value="achievements" className="flex items-center gap-2">
            <Award className="h-4 w-4" /> Achievements
          </TabsTrigger>
          <TabsTrigger value="evaluations" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" /> Evaluations
          </TabsTrigger>
          <TabsTrigger value="leaderboard" className="flex items-center gap-2">
            <Trophy className="h-4 w-4" /> Leaderboard
          </TabsTrigger>
        </TabsList>

        <TabsContent value="achievements" className="space-y-6 mt-6">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="relative w-full sm:max-w-xs">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search achievements..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={() => setIsGiftModalOpen(true)} className="gap-2">
              <Gift className="h-4 w-4" /> Gift Achievements
            </Button>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredAchievements.map((achievement) => (
              <Card key={achievement._id} className="hover:shadow-lg transition-shadow border-2" style={{ borderColor: achievement.color }}>
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
                  <p className="text-sm text-muted-foreground">{achievement.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="evaluations" className="space-y-6 mt-6">
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Current Week: {getCurrentWeek()} | Year: {new Date().getFullYear()}
            </div>
            <Button onClick={() => setIsEvalModalOpen(true)} className="gap-2">
              <Star className="h-4 w-4" /> New Evaluation
            </Button>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {loadingInterns ? (
              <div className="col-span-full text-center py-8">
                <Spinner className="mx-auto" />
              </div>
            ) : interns.length === 0 ? (
              <div className="col-span-full text-center text-muted-foreground py-8">
                No interns found
              </div>
            ) : (
              interns.map((intern) => {
                const internEvals = getInternEvaluations(intern._id);
                const avgScore = parseFloat(getAverageScore(intern._id));
                const scoreNum = isNaN(avgScore) ? 0 : avgScore;
                return (
                  <Card key={intern._id} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => { setSelectedInternForEval(intern); setIsEvalModalOpen(true); }}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{intern.name}</CardTitle>
                        <Badge variant={scoreNum >= 4 ? "default" : scoreNum >= 3 ? "secondary" : "destructive"}>
                          Avg: {scoreNum}/5
                        </Badge>
                      </div>
                      <CardDescription className="text-xs">{intern.email}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Evaluations</span>
                          <span className="font-medium">{internEvals.length}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Latest Week</span>
                          <span className="font-medium">
                            {internEvals.length > 0 ? `Week ${internEvals[0].weekNumber}` : "N/A"}
                          </span>
                        </div>
                        {internEvals.length > 0 && (
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full transition-all"
                              style={{ width: `${(scoreNum / 5) * 100}%` }}
                            />
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </TabsContent>

        <TabsContent value="leaderboard" className="space-y-6 mt-6">
          <div className="grid gap-4">
            {loadingInterns ? (
              <div className="text-center py-8">
                <Spinner className="mx-auto" />
              </div>
            ) : interns.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                No interns found
              </div>
            ) : (
              [...interns]
                .sort((a, b) => parseFloat(getAverageScore(b._id)) - parseFloat(getAverageScore(a._id)))
                .map((intern, index) => {
                  const internEvals = getInternEvaluations(intern._id);
                  const avgScore = parseFloat(getAverageScore(intern._id));
                  const scoreNum = isNaN(avgScore) ? 0 : avgScore;
                  const rank = index + 1;
                  const rankColor = rank === 1 ? "text-yellow-500" : rank === 2 ? "text-gray-400" : rank === 3 ? "text-amber-600" : "text-muted-foreground";
                  const rankIcon = rank === 1 ? "🥇" : rank === 2 ? "🥈" : rank === 3 ? "🥉" : `#${rank}`;
                  return (
                    <Card key={intern._id} className="hover:shadow-lg transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-4">
                          <div className="text-2xl font-bold w-12 text-center">{rankIcon}</div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold">{intern.name}</h3>
                              {rank <= 3 && <Badge className="bg-gradient-to-r from-yellow-400 to-amber-500 text-white">Top {rank}</Badge>}
                            </div>
                            <p className="text-sm text-muted-foreground">{intern.email}</p>
                          </div>
                          <div className="text-right space-y-1">
                            <div className="text-sm text-muted-foreground">Evaluations</div>
                            <div className="font-medium">{internEvals.length}</div>
                          </div>
                          <div className="text-right space-y-1">
                            <div className="text-sm text-muted-foreground">Avg Score</div>
                            <div className={`font-bold ${scoreNum >= 4 ? "text-green-600" : scoreNum >= 3 ? "text-yellow-600" : "text-red-600"}`}>
                              {scoreNum}/5
                            </div>
                          </div>
                          <div className="text-right space-y-1">
                            <div className="text-sm text-muted-foreground">Latest Week</div>
                            <div className="font-medium text-sm">
                              {internEvals.length > 0 ? `W${internEvals[0].weekNumber}` : "N/A"}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
            )}
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={isGiftModalOpen} onOpenChange={setIsGiftModalOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Gift className="h-5 w-5" /> Gift Achievements to Intern
            </DialogTitle>
            <DialogDescription>Select an intern and choose achievements to gift</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="grid gap-2">
              <Label>Select Intern</Label>
              <Select value={selectedIntern?._id} onValueChange={(value) => {
                const intern = interns.find((i) => i._id === value) || null;
                setSelectedIntern(intern);
                setSelectedAchievements([]);
                setAlreadyGiftedAchievements([]);
                if (intern) fetchAlreadyGiftedAchievements(intern._id);
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose an intern" />
                </SelectTrigger>
                <SelectContent>
                  {interns.map((intern) => (
                    <SelectItem key={intern._id} value={intern._id}>
                      {intern.name} ({intern.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedIntern && (
              <>
                <div className="border-t pt-4">
                  <Label className="text-sm font-medium mb-3 block">Select Achievements ({selectedAchievements.length} selected)</Label>
                  <div className="grid gap-3 max-h-64 overflow-y-auto">
                    {achievements.map((achievement) => {
                      const isAlreadyGifted = alreadyGiftedAchievements.includes(achievement._id);
                      return (
                        <div
                          key={achievement._id}
                          className={`flex items-start gap-3 p-3 border rounded-lg ${isAlreadyGifted ? 'bg-muted/50 opacity-60 cursor-not-allowed' : 'hover:bg-accent cursor-pointer'}`}
                          onClick={() => {
                            if (!isAlreadyGifted) {
                              setSelectedAchievements((prev) =>
                                prev.includes(achievement._id)
                                  ? prev.filter((id) => id !== achievement._id)
                                  : [...prev, achievement._id]
                              );
                            }
                          }}
                        >
                          <Checkbox
                            checked={isAlreadyGifted || selectedAchievements.includes(achievement._id)}
                            disabled={isAlreadyGifted}
                            onChange={() => { }}
                          />
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="text-2xl">{achievement.icon}</span>
                              <div>
                                <p className="font-medium text-sm">{achievement.name}</p>
                                <p className="text-xs text-muted-foreground">{achievement.description}</p>
                              </div>
                            </div>
                            {isAlreadyGifted && (
                              <Badge variant="secondary" className="mt-1">Already Gifted</Badge>
                            )}
                          </div>
                          <Badge style={{ backgroundColor: achievement.color }}>{achievement.points} pts</Badge>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </>
            )}
          </div>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => { setIsGiftModalOpen(false); setSelectedIntern(null); setSelectedAchievements([]); setAlreadyGiftedAchievements([]); }}>
              Cancel
            </Button>
            <Button onClick={handleGiftAchievements} disabled={!selectedIntern || selectedAchievements.length === 0 || isGifting}>
              {isGifting ? "Gifting..." : "Gift Achievements"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isEvalModalOpen} onOpenChange={setIsEvalModalOpen}>
        <DialogContent className="sm:max-w-[800px] max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Star className="h-5 w-5" /> Performance Evaluation
            </DialogTitle>
            <DialogDescription>
              {selectedInternForEval ? `Evaluating ${selectedInternForEval.name} - Week ${evalForm.weekNumber}, ${evalForm.year}` : "Select an intern to evaluate"}
            </DialogDescription>
          </DialogHeader>
          {selectedInternForEval && (
            <div className="space-y-4 pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Week Number</Label>
                  <Input type="number" value={evalForm.weekNumber} onChange={(e) => setEvalForm({ ...evalForm, weekNumber: parseInt(e.target.value) })} />
                </div>
                <div className="grid gap-2">
                  <Label>Year</Label>
                  <Input type="number" value={evalForm.year} onChange={(e) => setEvalForm({ ...evalForm, year: parseInt(e.target.value) })} />
                </div>
              </div>

              <div className="grid gap-2">
                <Label>Performance Score (1-5)</Label>
                <div className="flex items-center gap-4">
                  <Input type="range" min="1" max="5" value={evalForm.performanceScore} onChange={(e) => setEvalForm({ ...evalForm, performanceScore: parseInt(e.target.value) })} className="flex-1" />
                  <Badge variant="outline" className="text-lg px-4 py-2">{evalForm.performanceScore}/5</Badge>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="grid gap-2">
                  <Label>Technical Skills (1-5)</Label>
                  <Select value={evalForm.technicalSkills.toString()} onValueChange={(v) => setEvalForm({ ...evalForm, technicalSkills: parseInt(v) })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5].map((n) => <SelectItem key={n} value={n.toString()}>{n}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Communication (1-5)</Label>
                  <Select value={evalForm.communication.toString()} onValueChange={(v) => setEvalForm({ ...evalForm, communication: parseInt(v) })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5].map((n) => <SelectItem key={n} value={n.toString()}>{n}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Teamwork (1-5)</Label>
                  <Select value={evalForm.teamwork.toString()} onValueChange={(v) => setEvalForm({ ...evalForm, teamwork: parseInt(v) })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5].map((n) => <SelectItem key={n} value={n.toString()}>{n}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Problem Solving (1-5)</Label>
                  <Select value={evalForm.problemSolving.toString()} onValueChange={(v) => setEvalForm({ ...evalForm, problemSolving: parseInt(v) })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5].map((n) => <SelectItem key={n} value={n.toString()}>{n}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Attendance (1-5)</Label>
                  <Select value={evalForm.attendance.toString()} onValueChange={(v) => setEvalForm({ ...evalForm, attendance: parseInt(v) })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5].map((n) => <SelectItem key={n} value={n.toString()}>{n}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Period</Label>
                  <Select value={evalForm.period} onValueChange={(v) => setEvalForm({ ...evalForm, period: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="bi-weekly">Bi-Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-2">
                <Label>Strengths</Label>
                <Textarea value={evalForm.strengths} onChange={(e) => setEvalForm({ ...evalForm, strengths: e.target.value })} placeholder="Describe the intern's strengths..." rows={2} />
              </div>

              <div className="grid gap-2">
                <Label>Areas for Improvement</Label>
                <Textarea value={evalForm.areasForImprovement} onChange={(e) => setEvalForm({ ...evalForm, areasForImprovement: e.target.value })} placeholder="Describe areas where the intern can improve..." rows={2} />
              </div>

              <div className="grid gap-2">
                <Label>Goals</Label>
                <Textarea value={evalForm.goals} onChange={(e) => setEvalForm({ ...evalForm, goals: e.target.value })} placeholder="Set goals for the next period..." rows={2} />
              </div>

              <div className="grid gap-2">
                <Label>Overall Feedback</Label>
                <Textarea value={evalForm.overallFeedback} onChange={(e) => setEvalForm({ ...evalForm, overallFeedback: e.target.value })} placeholder="Provide overall feedback..." rows={3} />
              </div>
            </div>
          )}
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => { setIsEvalModalOpen(false); setSelectedInternForEval(null); }}>
              Cancel
            </Button>
            <Button onClick={handleEvaluationSubmit} disabled={!selectedInternForEval || isSubmittingEval}>
              {isSubmittingEval ? "Submitting..." : "Submit Evaluation"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
