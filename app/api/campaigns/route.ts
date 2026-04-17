import { NextRequest, NextResponse } from "next/server";
import connectDB from '@/lib/db';
import { Campaign } from "@/models/Campaign";
import { getSession } from '@/lib/auth';
import { logAuditActivity } from "@/lib/audit";

export async function GET(req: NextRequest) {
  try {
    const user = await getSession();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectDB();
    const campaigns = await Campaign.find({}).populate("owner", "name").sort({ createdAt: -1 }).lean();
    return NextResponse.json(campaigns);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getSession();
    if (!user || !["admin", "marketing_manager"].includes(user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await connectDB();
    const body = await req.json();
    body.owner = user.userId;

    const newCampaign = await Campaign.create(body);
    const populated = await newCampaign.populate("owner", "name");

    await logAuditActivity({
      user: user.userId,
      action: "create_campaign",
      resource: "campaigns",
      resourceId: newCampaign._id.toString(),
      details: { name: body.name, budget: body.budget },
      req
    });

    return NextResponse.json(populated, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const user = await getSession();
    if (!user || !["admin", "marketing_manager"].includes(user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await connectDB();
    const { id, ...updates } = await req.json();

    if (!id) return NextResponse.json({ error: "Missing campaign ID" }, { status: 400 });

    const campaign = await Campaign.findByIdAndUpdate(id, updates, { new: true }).populate("owner", "name");

    if (!campaign) return NextResponse.json({ error: "Campaign not found" }, { status: 404 });

    await logAuditActivity({
      user: user.userId,
      action: "update_campaign",
      resource: "campaigns",
      resourceId: campaign._id.toString(),
      details: { updates: Object.keys(updates) },
      req
    });

    return NextResponse.json(campaign);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
