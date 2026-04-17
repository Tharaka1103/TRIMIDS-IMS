import mongoose from "mongoose";
import AuditLog from "@/models/AuditLog";
import connectDB from "@/lib/db";
import { NextRequest } from "next/server";

interface AuditLogOptions {
  user: string;
  action: string;
  resource: string;
  resourceId?: string;
  details?: Record<string, any>;
  status?: "success" | "failure";
  req?: Request | NextRequest;
}

export async function logAuditActivity({
  user,
  action,
  resource,
  resourceId,
  details,
  status = "success",
  req,
}: AuditLogOptions) {
  try {
    await connectDB();

    let ipAddress = "unknown";
    let userAgent = "unknown";

    if (req) {
      if (req instanceof Request) {
        userAgent = req.headers.get("user-agent") || "unknown";
        ipAddress = req.headers.get("x-forwarded-for") || "unknown";
      }
    }

    await AuditLog.create({
      user: new mongoose.Types.ObjectId(user),
      action,
      resource,
      resourceId,
      details,
      ipAddress,
      userAgent,
      status,
    });
  } catch (error) {
    console.error("Failed to write audit log:", error);
  }
}
