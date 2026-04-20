import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import connectDB from "@/lib/db";
import Evaluation from "@/models/Evaluation";
import { logAuditActivity } from "@/lib/audit";

export async function GET(request: NextRequest) {
  try {
    const currentUser = await getSession();
    if (!currentUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectDB();
    const { searchParams } = new URL(request.url);
    const internId = searchParams.get("internId");
    const evaluatorId = searchParams.get("evaluatorId");

    let query: any = {};
    if (internId) query.internId = internId;
    if (evaluatorId) query.evaluatorId = evaluatorId;

    const evaluations = await Evaluation.find(query)
      .populate("internId", "name email")
      .populate("evaluatorId", "name email")
      .sort({ createdAt: -1 })
      .lean();
    return NextResponse.json(evaluations);
  } catch (error) {
    console.error("Error fetching evaluations:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const currentUser = await getSession();
    if (!currentUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const {
      internId,
      weekNumber,
      year,
      period,
      performanceScore,
      technicalSkills,
      communication,
      teamwork,
      problemSolving,
      attendance,
      strengths,
      areasForImprovement,
      goals,
      overallFeedback,
    } = body;

    if (!internId || !weekNumber || !year) {
      return NextResponse.json({ error: "internId, weekNumber, and year are required" }, { status: 400 });
    }

    await connectDB();

    const evaluation = await Evaluation.create({
      internId,
      evaluatorId: currentUser.userId,
      weekNumber,
      year,
      period: period || "bi-weekly",
      performanceScore,
      technicalSkills,
      communication,
      teamwork,
      problemSolving,
      attendance,
      strengths,
      areasForImprovement,
      goals,
      overallFeedback,
    });

    await logAuditActivity({
      user: currentUser.userId,
      action: "create_evaluation",
      resource: "evaluations",
      resourceId: evaluation._id.toString(),
      details: { internId, weekNumber, year, performanceScore },
      req: request,
    });

    const populated = await Evaluation.findById(evaluation._id)
      .populate("internId", "name email")
      .populate("evaluatorId", "name email")
      .lean();

    return NextResponse.json(populated, { status: 201 });
  } catch (error: any) {
    console.error("Error creating evaluation:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const currentUser = await getSession();
    if (!currentUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id, ...updateData } = await request.json();

    if (!id) {
      return NextResponse.json({ error: "Evaluation ID is required" }, { status: 400 });
    }

    await connectDB();

    const evaluation = await Evaluation.findByIdAndUpdate(
      id,
      { ...updateData, updatedAt: new Date() },
      { new: true }
    )
      .populate("internId", "name email")
      .populate("evaluatorId", "name email")
      .lean();

    if (!evaluation) {
      return NextResponse.json({ error: "Evaluation not found" }, { status: 404 });
    }

    await logAuditActivity({
      user: currentUser.userId,
      action: "update_evaluation",
      resource: "evaluations",
      resourceId: id,
      details: updateData,
      req: request,
    });

    return NextResponse.json(evaluation);
  } catch (error) {
    console.error("Error updating evaluation:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
