import { NextRequest, NextResponse } from "next/server";
import { clearSession } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const response = NextResponse.json({ success: true, message: "Logged out" });
    await clearSession(response);
    return response;
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}