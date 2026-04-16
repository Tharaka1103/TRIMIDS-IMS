import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import MaintenanceWindow from "@/models/MaintenanceWindow";

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const searchParams = request.nextUrl.searchParams;
    
    if (searchParams.get("upcoming") === "true") {
      const now = new Date();
      const maintenance = await MaintenanceWindow.findOne({
        status: { $in: ["scheduled", "active"] },
        endTime: { $gt: now }
      }).sort({ startTime: 1 }).lean();
      
      return NextResponse.json({ maintenance });
    }
    
    return NextResponse.json({ maintenance: null });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}