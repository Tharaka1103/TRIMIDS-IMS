import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import connectDB from "@/lib/db";
import Intern from "@/models/Intern";

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== "intern") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const intern = await Intern.findOne({ user: session.userId }).lean();

    if (!intern) {
      return NextResponse.json({ error: "Intern record not found" }, { status: 404 });
    }

    const { startDate, badges, evaluations, totalWeeks } = intern as any;

    const now = new Date();
    const start = new Date(startDate);
    const diffTime = now.getTime() - start.getTime();
    
    let completedWeeks = 0;
    if (diffTime > 0) {
      completedWeeks = Math.floor(diffTime / (1000 * 60 * 60 * 24 * 7));
    }
    const finalTotalWeeks = totalWeeks || 12;
    completedWeeks = Math.min(completedWeeks, finalTotalWeeks);

    const overallScore = evaluations && evaluations.length > 0 
      ? Math.round(evaluations.reduce((acc: number, curr: any) => acc + curr.score, 0) / evaluations.length)
      : 0;

    return NextResponse.json({
      progress: {
        completedWeeks,
        totalWeeks: finalTotalWeeks,
        overallScore,
        badges: badges || [],
        evaluations: (evaluations || []).sort((a: any, b: any) => b.week - a.week),
      }
    });

  } catch (error) {
    console.error("Progress fetch error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
