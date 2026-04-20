import { NextRequest, NextResponse } from "next/server";
import { getSession } from '@/lib/auth';
import connectDB from '@/lib/db';
import Task from '@/models/Task';
import User from '@/models/User';
import { logAuditActivity } from "@/lib/audit";
import { sendTaskAssignmentEmail } from "@/lib/email";

export async function GET(request: NextRequest) {
  try {
    const currentUser = await getSession();
    if (!currentUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectDB();
    const { searchParams } = new URL(request.url);
    const assignedMode = searchParams.get("assignedToMe");
    const status = searchParams.get("status");
    const priority = searchParams.get("priority");

    const query: any = {};
    if (assignedMode === "true") {
      query.assignedTo = currentUser.userId;
    }
    if (status) {
      query.status = status;
    }
    if (priority) {
      query.priority = priority;
    }

    const tasks = await Task.find(query)
      .populate("assignedTo", "name email")
      .populate("assignedBy", "name email")
      .sort({ dueDate: 1 })
      .lean();

    return NextResponse.json(tasks);
  } catch (error) {
    console.error("Error fetching tasks:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const currentUser = await getSession();
    if (!currentUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const { 
      title, 
      description, 
      assignedTo, 
      priority, 
      dueDate, 
      department,
      tags,
      attachments,
      bulkAssign,
      assignToAllEmployees,
      assignToAllInterns
    } = body;

    if (!title || !dueDate) {
      return NextResponse.json({ error: "Title and DueDate are required" }, { status: 400 });
    }

    await connectDB();

    let assignedUsers: string[] = [];

    if (bulkAssign) {
      if (assignToAllEmployees) {
        const employees = await User.find({ role: { $in: ["employee", "hr", "finance", "marketing"] } }).select("_id").lean();
        assignedUsers = employees.map((e: any) => e._id.toString());
      }
      if (assignToAllInterns) {
        const interns = await User.find({ role: "intern" }).select("_id").lean();
        const internIds = interns.map((i: any) => i._id.toString());
        assignedUsers = [...new Set([...assignedUsers, ...internIds])];
      }
      if (assignedTo && Array.isArray(assignedTo)) {
        assignedUsers = [...new Set([...assignedUsers, ...assignedTo])];
      }
    } else if (assignedTo) {
      assignedUsers = Array.isArray(assignedTo) ? assignedTo : [assignedTo];
    }

    if (assignedUsers.length === 0) {
      return NextResponse.json({ error: "At least one assignee is required" }, { status: 400 });
    }

    const taskData = {
      title,
      description: description || "",
      priority: priority || "medium",
      status: "todo",
      dueDate: new Date(dueDate),
      assignedBy: currentUser.userId,
      department: department || "",
      tags: tags || [],
      attachments: attachments || [],
      progress: 0,
    };

    const tasks = await Promise.all(
      assignedUsers.map((userId) =>
        Task.create({
          ...taskData,
          assignedTo: userId,
        })
      )
    );

    // Send email notifications to assigned users
    const assigneeUsers = await User.find({ _id: { $in: assignedUsers } }).select("name email").lean();
    const assignedByUser = await User.findById(currentUser.userId).select("name").lean();
    
    for (const assignee of assigneeUsers) {
      try {
        await sendTaskAssignmentEmail(
          assignee.email,
          assignee.name,
          title,
          description || "",
          new Date(dueDate).toLocaleDateString(),
          assignedByUser?.name || "System"
        );
      } catch (emailError) {
        console.error(`Failed to send email to ${assignee.email}:`, emailError);
      }
    }

    await logAuditActivity({
      user: currentUser.userId,
      action: "create_task",
      resource: "tasks",
      resourceId: tasks[0]._id.toString(),
      details: { title, assignedTo: assignedUsers, priority, bulkAssign },
      req: request
    });

    return NextResponse.json({ tasks, count: tasks.length }, { status: 201 });
  } catch (error: any) {
    console.error("Error creating task:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const currentUser = await getSession();
    if (!currentUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id, status, progress, comment } = await request.json();
    if (!id || (!status && progress === undefined && !comment)) {
      return NextResponse.json({ error: "Invalid parameters" }, { status: 400 });
    }

    await connectDB();

    const taskDoc = await Task.findById(id);
    if (!taskDoc) return NextResponse.json({ error: "Task not found" }, { status: 404 });

    if (taskDoc.assignedTo.toString() !== currentUser.userId && 
        taskDoc.assignedBy.toString() !== currentUser.userId && 
        currentUser.role !== "admin") {
       return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (status) taskDoc.status = status;
    if (progress !== undefined) taskDoc.progress = progress;
    if (status === 'completed' || status === 'cancelled') taskDoc.completedAt = new Date();
    
    if (comment) {
      taskDoc.comments = taskDoc.comments || [];
      taskDoc.comments.push({
        user: currentUser.userId,
        message: comment,
        createdAt: new Date(),
      });
    }

    await taskDoc.save();

    await logAuditActivity({
      user: currentUser.userId,
      action: "update_task",
      resource: "tasks",
      resourceId: taskDoc._id.toString(),
      details: { status, progress, hasComment: !!comment },
      req: request
    });

    const populated = await Task.findById(id)
      .populate("assignedTo", "name email")
      .populate("assignedBy", "name email")
      .populate("comments.user", "name email")
      .lean();

    return NextResponse.json(populated);
  } catch (error) {
    console.error("Error updating task:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const currentUser = await getSession();
    if (!currentUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Task ID is required" }, { status: 400 });
    }

    await connectDB();

    const taskDoc = await Task.findById(id);
    if (!taskDoc) return NextResponse.json({ error: "Task not found" }, { status: 404 });

    if (taskDoc.assignedBy.toString() !== currentUser.userId && currentUser.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await Task.findByIdAndDelete(id);

    await logAuditActivity({
      user: currentUser.userId,
      action: "delete_task",
      resource: "tasks",
      resourceId: id,
      details: { title: taskDoc.title },
      req: request
    });

    return NextResponse.json({ message: "Task deleted successfully" });
  } catch (error) {
    console.error("Error deleting task:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

