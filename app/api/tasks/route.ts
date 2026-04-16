import { NextResponse } from "next/server";
import { getSession } from '@/lib/auth';
import connectDB from '@/lib/db';
import Task from '@/models/Task';

export async function GET(request: Request) {
  try {
    const currentUser = await getSession();
    if (!currentUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectDB();
    const { searchParams } = new URL(request.url);
    const assignedMode = searchParams.get("assignedToMe");

    const query: any = {};
    if (assignedMode === "true") {
      query.assignee = currentUser.userId;
    }

    const tasks = await Task.find(query)
      .populate("assignee", "name email")
      .populate("createdBy", "name email")
      .sort({ dueDate: 1 });

    return NextResponse.json(tasks);
  } catch (error) {
    console.error("Error fetching tasks:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const currentUser = await getSession();
    if (!currentUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { title, description, assignee, priority, dueDate } = await request.json();
    if (!title) return NextResponse.json({ error: "Title is required" }, { status: 400 });

    await connectDB();
    const task = await Task.create({
      title,
      description,
      assignee,
      priority: priority || "medium",
      status: "todo",
      dueDate: dueDate ? new Date(dueDate) : undefined,
      createdBy: currentUser.userId,
    });

    return NextResponse.json(task, { status: 201 });
  } catch (error) {
    console.error("Error creating task:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

