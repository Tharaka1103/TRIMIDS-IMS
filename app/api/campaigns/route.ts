import { NextResponse } from "next/server";
import connectDB from '@/lib/db';
import { Campaign } from "@/models/Campaign";
import { getSession } from '@/lib/auth';

export async function GET(req: Request) {
  try {
    const user = await getSession();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectDB();
    const campaigns = await Campaign.find({}).populate("owner", "name").sort({ createdAt: -1 });
    return NextResponse.json(campaigns);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getSession();
    if (!user || (user.role !== "admin" && user.role !== "marketing_manager")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await connectDB();
    const body = await req.json();
    body.owner = user.userId;

    const newCampaign = await Campaign.create(body);
    const populated = await newCampaign.populate("owner", "name");
    
    return NextResponse.json(populated, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const user = await getSession();
    if (!user || (user.role !== "admin" && user.role !== "marketing_manager")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await connectDB();
    const { id, ...updates } = await req.json();

    if (!id) return NextResponse.json({ error: "Missing campaign ID" }, { status: 400 });

    const campaign = await Campaign.findByIdAndUpdate(id, updates, { new: true }).populate("owner", "name");
    
    if (!campaign) return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
    return NextResponse.json(campaign);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
