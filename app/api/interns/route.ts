import { NextResponse } from "next/server";
import { getSession } from '@/lib/auth';
import { hasPermission } from "@/lib/permissions";
import connectDB from '@/lib/db';
import User from '@/models/User';

export async function GET(request: Request) {
  try {
    const currentUser = await getSession();
    
    if (!currentUser || !hasPermission(currentUser.role, "read:users" as any)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    await connectDB();
    
    const interns = await User.find({ role: "intern" })
      .select("-password")
      .sort({ createdAt: -1 });
      
    return NextResponse.json(interns);
  } catch (error) {
    console.error("Error fetching interns:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

