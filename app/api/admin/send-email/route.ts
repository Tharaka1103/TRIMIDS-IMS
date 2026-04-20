import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import connectDB from "@/lib/db";
import User from "@/models/User";
import { sendEmail } from "@/lib/email";
import { logAuditActivity } from "@/lib/audit";

export async function POST(request: NextRequest) {
  try {
    const currentUser = await getSession();
    if (!currentUser || currentUser.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { recipients, subject, htmlContent, textContent, templateId } = body;

    if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
      return NextResponse.json({ error: "Recipients are required" }, { status: 400 });
    }

    if (!subject) {
      return NextResponse.json({ error: "Subject is required" }, { status: 400 });
    }

    if (!htmlContent && !textContent) {
      return NextResponse.json({ error: "Email content is required" }, { status: 400 });
    }

    await connectDB();

    // Get user details for recipients
    const users = await User.find({ _id: { $in: recipients } }).select("name email").lean();
    const recipientEmails = users.map((u: any) => u.email);

    // Send email
    const emailSent = await sendEmail({
      to: recipientEmails,
      subject,
      html: htmlContent || "",
      text: textContent || "",
    });

    if (!emailSent) {
      return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
    }

    await logAuditActivity({
      user: currentUser.userId,
      action: "send_custom_email",
      resource: "emails",
      resourceId: undefined,
      details: { 
        recipients: recipientEmails.length,
        subject,
        templateId,
      },
      req: request,
    });

    return NextResponse.json({ 
      message: "Email sent successfully",
      recipientCount: recipientEmails.length 
    });
  } catch (error: any) {
    console.error("Error sending email:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
