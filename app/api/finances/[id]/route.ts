import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import connectDB from "@/lib/db";
import { Finance } from "@/models/Finance";
import { hasPermission } from "@/lib/permissions";
import { PERMISSIONS } from "@/types/permissions";
import { logAuditActivity } from "@/lib/audit";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session || !hasPermission(session.role, PERMISSIONS.FINANCE_MANAGE)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const body = await request.json();
    const { id } = await params;

    const finance = await Finance.findByIdAndUpdate(
      id,
      { ...body, approvedBy: session.userId },
      { new: true }
    ).lean();

    if (!finance) {
      return NextResponse.json({ error: "Finance record not found" }, { status: 404 });
    }

    await logAuditActivity({
      user: session.userId,
      action: "update_finance",
      resource: "finances",
      resourceId: finance._id.toString(),
      details: { type: finance.type, amount: finance.amount },
      req: request,
    });

    return NextResponse.json(finance);
  } catch (error: any) {
    console.error("PATCH /api/finances/[id] error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session || !hasPermission(session.role, PERMISSIONS.FINANCE_MANAGE)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const { id } = await params;
    const finance = await Finance.findByIdAndDelete(id);

    if (!finance) {
      return NextResponse.json({ error: "Finance record not found" }, { status: 404 });
    }

    await logAuditActivity({
      user: session.userId,
      action: "delete_finance",
      resource: "finances",
      resourceId: finance._id.toString(),
      details: { type: finance.type, amount: finance.amount },
      req: request,
    });

    return NextResponse.json({ message: "Finance record deleted" });
  } catch (error: any) {
    console.error("DELETE /api/finances/[id] error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
