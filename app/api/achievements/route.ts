import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import connectDB from "@/lib/db";
import Achievement from "@/models/Achievement";
import UserAchievement from "@/models/UserAchievement";
import User from "@/models/User";
import { logAuditActivity } from "@/lib/audit";
import { sendAchievementEmail } from "@/lib/email";

const HARDCODED_ACHIEVEMENTS: any[] = [
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

export async function GET(request: NextRequest) {
  try {
    const currentUser = await getSession();
    if (!currentUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");
    const userId = searchParams.get("userId");

    if (userId) {
      await connectDB();
      const userAchievements = await UserAchievement.find({ userId })
        .populate("giftedBy", "name email")
        .sort({ giftedAt: -1 })
        .lean();

      const enriched = userAchievements.map((ua: any) => ({
        ...ua,
        achievementId: HARDCODED_ACHIEVEMENTS.find((a) => a._id === ua.achievementId) || ua.achievementId,
      }));

      return NextResponse.json(enriched);
    }

    let filtered = HARDCODED_ACHIEVEMENTS;

    if (search) {
      filtered = filtered.filter(
        (a) =>
          a.name.toLowerCase().includes(search.toLowerCase()) ||
          a.description.toLowerCase().includes(search.toLowerCase()) ||
          a.category.toLowerCase().includes(search.toLowerCase())
      );
    }

    return NextResponse.json(filtered);
  } catch (error) {
    console.error("Error fetching achievements:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const currentUser = await getSession();
    if (!currentUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { userId, achievementIds } = await request.json();

    if (!userId || !achievementIds || !Array.isArray(achievementIds)) {
      return NextResponse.json({ error: "userId and achievementIds array are required" }, { status: 400 });
    }

    await connectDB();

    const userAchievements = await Promise.all(
      achievementIds.map((achievementId: string) =>
        UserAchievement.create({
          userId,
          achievementId,
          giftedBy: currentUser.userId,
        })
      )
    );

    // Send email notifications to the user
    const recipientUser = await User.findById(userId).select("name email").lean();
    const giftedByUser = await User.findById(currentUser.userId).select("name").lean();
    
    if (recipientUser) {
      for (const achievementId of achievementIds) {
        const achievement = HARDCODED_ACHIEVEMENTS.find((a) => a._id === achievementId);
        if (achievement) {
          try {
            await sendAchievementEmail(
              recipientUser.email,
              recipientUser.name,
              achievement.name,
              achievement.description,
              achievement.points,
              giftedByUser?.name || "System"
            );
          } catch (emailError) {
            console.error(`Failed to send achievement email to ${recipientUser.email}:`, emailError);
          }
        }
      }
    }

    await logAuditActivity({
      user: currentUser.userId,
      action: "gift_achievements",
      resource: "achievements",
      resourceId: userAchievements[0]._id.toString(),
      details: { userId, achievementIds, count: achievementIds.length },
      req: request,
    });

    return NextResponse.json({ userAchievements, count: userAchievements.length }, { status: 201 });
  } catch (error: any) {
    console.error("Error gifting achievements:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
