import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import connectDB from "@/lib/db";
import { Finance } from "@/models/Finance";
import { hasPermission } from "@/lib/permissions";
import { PERMISSIONS } from "@/types/permissions";
import { logAuditActivity } from "@/lib/audit";

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || !hasPermission(session.role, PERMISSIONS.FINANCE_MANAGE)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");
    const status = searchParams.get("status");
    const search = searchParams.get("search");

    let query: any = {};
    if (type) query.type = type;
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { description: { $regex: search, $options: "i" } },
        { category: { $regex: search, $options: "i" } },
      ];
    }

    const finances = await Finance.find(query)
      .populate("createdBy", "name email")
      .populate("approvedBy", "name email")
      .sort({ date: -1 })
      .lean();

    return NextResponse.json(finances);
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || !hasPermission(session.role, PERMISSIONS.FINANCE_MANAGE)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const body = await request.json();

    const finance = await Finance.create({
      ...body,
      createdBy: session.userId,
    });

    await logAuditActivity({
      user: session.userId,
      action: "create_finance",
      resource: "finances",
      resourceId: finance._id.toString(),
      details: { type: finance.type, amount: finance.amount },
      req: request,
    });

    return NextResponse.json(finance, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/finances error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
