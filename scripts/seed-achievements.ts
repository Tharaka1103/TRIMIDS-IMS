import connectDB from "@/lib/db";
import Achievement from "@/models/Achievement";

const achievements = [
  { name: "First Steps", description: "Complete your first task", category: "Milestone", icon: "🎯", points: 10, color: "#3b82f6" },
  { name: "Quick Learner", description: "Complete 5 tasks in a week", category: "Speed", icon: "⚡", points: 25, color: "#f59e0b" },
  { name: "Consistent Performer", description: "Maintain 100% attendance for a month", category: "Attendance", icon: "📅", points: 30, color: "#10b981" },
  { name: "Problem Solver", description: "Solve a complex issue independently", category: "Skills", icon: "🧩", points: 40, color: "#8b5cf6" },
  { name: "Team Player", description: "Help 3 teammates with their tasks", category: "Teamwork", icon: "🤝", points: 35, color: "#ec4899" },
  { name: "Code Champion", description: "Write clean, documented code", category: "Technical", icon: "💻", points: 45, color: "#06b6d4" },
  { name: "Bug Buster", description: "Fix 10 bugs", category: "Technical", icon: "🐛", points: 50, color: "#ef4444" },
  { name: "Early Bird", description: "Complete tasks before deadline consistently", category: "Time Management", icon: "🌅", points: 20, color: "#f97316" },
  { name: "Innovator", description: "Propose a new feature idea", category: "Innovation", icon: "💡", points: 55, color: "#eab308" },
  { name: "Mentor", description: "Help onboard a new intern", category: "Leadership", icon: "🎓", points: 60, color: "#6366f1" },
  { name: "Documentation Expert", description: "Create comprehensive documentation", category: "Skills", icon: "📝", points: 40, color: "#14b8a6" },
  { name: "Test Master", description: "Write 100 test cases", category: "Quality", icon: "✅", points: 70, color: "#22c55e" },
  { name: "Speed Demon", description: "Complete a task in under 2 hours", category: "Speed", icon: "🚀", points: 35, color: "#3b82f6" },
  { name: "Perfect Attendance", description: "No absences for 3 months", category: "Attendance", icon: "🌟", points: 100, color: "#fbbf24" },
  { name: "Collaborator", description: "Work on 5 team projects", category: "Teamwork", icon: "👥", points: 45, color: "#a855f7" },
  { name: "Security Guardian", description: "Identify a security vulnerability", category: "Technical", icon: "🛡️", points: 80, color: "#dc2626" },
  { name: "UI/UX Wizard", description: "Design 10 user interfaces", category: "Design", icon: "🎨", points: 50, color: "#ec4899" },
  { name: "Database Pro", description: "Optimize database queries", category: "Technical", icon: "🗄️", points: 55, color: "#0891b2" },
  { name: "Communication Star", description: "Present in 3 team meetings", category: "Communication", icon: "🎤", points: 30, color: "#f43f5e" },
  { name: "Deadline Crusher", description: "Complete all weekly tasks on time", category: "Time Management", icon: "🎯", points: 40, color: "#8b5cf6" },
  { name: "Code Reviewer", description: "Review 20 pull requests", category: "Quality", icon: "👁️", points: 60, color: "#0ea5e9" },
  { name: "Automation Expert", description: "Automate a manual process", category: "Innovation", icon: "⚙️", points: 65, color: "#64748b" },
  { name: "Customer Focus", description: "Receive positive feedback from client", category: "Service", icon: "💼", points: 75, color: "#059669" },
  { name: "Knowledge Sharer", description: "Conduct a knowledge sharing session", category: "Leadership", icon: "📚", points: 50, color: "#7c3aed" },
  { name: "Bug Prevention", description: "Prevent a bug in production", category: "Quality", icon: "🚫", points: 85, color: "#be185d" },
  { name: "Performance Tuner", description: "Improve app performance by 20%", category: "Technical", icon: "📈", points: 70, color: "#0d9488" },
  { name: "Cross-Team Player", description: "Collaborate with another department", category: "Teamwork", icon: "🌐", points: 45, color: "#4f46e5" },
  { name: "Research Pioneer", description: "Research and implement new technology", category: "Innovation", icon: "🔬", points: 90, color: "#c026d3" },
  { name: "Quality Champion", description: "Maintain 100% code quality score", category: "Quality", icon: "🏆", points: 95, color: "#d97706" },
  { name: "All-Star Intern", description: "Earn 1000 total achievement points", category: "Milestone", icon: "⭐", points: 150, color: "#fcd34d" },
  { name: "Creative Mind", description: "Design a creative solution", category: "Innovation", icon: "🎭", points: 55, color: "#f472b6" },
  { name: "Debug Master", description: "Debug a critical issue", category: "Technical", icon: "🔍", points: 60, color: "#6366f1" },
];

async function seedAchievements() {
  try {
    await connectDB();
    
    // Clear existing achievements
    await Achievement.deleteMany({});
    console.log("Cleared existing achievements");
    
    // Insert new achievements
    const inserted = await Achievement.insertMany(achievements);
    console.log(`Successfully seeded ${inserted.length} achievements`);
    
    process.exit(0);
  } catch (error) {
    console.error("Error seeding achievements:", error);
    process.exit(1);
  }
}

seedAchievements();
