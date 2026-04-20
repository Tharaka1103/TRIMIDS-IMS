import nodemailer from 'nodemailer';

interface EmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
}

// Create transporter with SMTP configuration
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.zoho.com',
    port: parseInt(process.env.EMAIL_PORT || '465'),
    secure: process.env.EMAIL_SECURE === 'true',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

// Send email function
export async function sendEmail(options: EmailOptions): Promise<boolean> {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: `"${process.env.EMAIL_FROM_NAME || 'Trimids (Pvt) Ltd'}" <${process.env.EMAIL_FROM_ADDRESS || 'noreply@trimids.com'}>`,
      to: Array.isArray(options.to) ? options.to.join(', ') : options.to,
      subject: options.subject,
      html: options.html,
      text: options.text || '',
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info.messageId);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
}

// Email templates
export const emailTemplates = {
  taskAssigned: (recipientName: string, taskTitle: string, taskDescription: string, dueDate: string, assignedBy: string) => `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>New Task Assigned</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .task-title { font-size: 24px; font-weight: bold; color: #667eea; margin-bottom: 20px; }
        .task-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .task-details p { margin: 10px 0; }
        .label { font-weight: bold; color: #555; }
        .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin-top: 20px; }
        .footer { text-align: center; margin-top: 30px; color: #888; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎯 New Task Assigned</h1>
        </div>
        <div class="content">
          <p>Dear <strong>${recipientName}</strong>,</p>
          <p>You have been assigned a new task in the TRIMIDS IMS system.</p>
          
          <div class="task-details">
            <p><span class="label">Task Title:</span> ${taskTitle}</p>
            <p><span class="label">Description:</span> ${taskDescription}</p>
            <p><span class="label">Due Date:</span> ${dueDate}</p>
            <p><span class="label">Assigned By:</span> ${assignedBy}</p>
          </div>
          
          <p>Please log in to your dashboard to view the complete task details and track your progress.</p>
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" class="button">View Task Dashboard</a>
          
          <div class="footer">
            <p>This is an automated email from TRIMIDS (Pvt) Ltd IMS System.</p>
            <p>If you have any questions, please contact your supervisor.</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `,

  achievementGifted: (recipientName: string, achievementName: string, achievementDescription: string, points: number, giftedBy: string) => `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Achievement Unlocked!</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .achievement-icon { font-size: 60px; text-align: center; margin: 20px 0; }
        .achievement-title { font-size: 28px; font-weight: bold; color: #f5576c; text-align: center; margin-bottom: 10px; }
        .achievement-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center; }
        .points-badge { background: #f5576c; color: white; padding: 10px 20px; border-radius: 20px; display: inline-block; font-size: 18px; font-weight: bold; margin: 10px 0; }
        .button { display: inline-block; background: #f5576c; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin-top: 20px; }
        .footer { text-align: center; margin-top: 30px; color: #888; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🏆 Achievement Unlocked!</h1>
        </div>
        <div class="content">
          <div class="achievement-icon">🎉</div>
          <div class="achievement-title">${achievementName}</div>
          <p style="text-align: center;">Congratulations, <strong>${recipientName}</strong>!</p>
          
          <div class="achievement-details">
            <p>${achievementDescription}</p>
            <div class="points-badge">+${points} Points</div>
            <p><span class="label">Gifted By:</span> ${giftedBy}</p>
          </div>
          
          <p style="text-align: center;">Keep up the excellent work! This achievement has been added to your profile.</p>
          <div style="text-align: center;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/intern/progress" class="button">View Your Achievements</a>
          </div>
          
          <div class="footer">
            <p>This is an automated email from TRIMIDS (Pvt) Ltd IMS System.</p>
            <p>Congratulations on your achievement!</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `,

  evaluationCreated: (recipientName: string, evaluatorName: string, overallScore: string, feedback: string, evaluationDate: string) => `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>New Performance Evaluation</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .evaluation-icon { font-size: 60px; text-align: center; margin: 20px 0; }
        .evaluation-title { font-size: 28px; font-weight: bold; color: #4facfe; text-align: center; margin-bottom: 10px; }
        .evaluation-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .evaluation-details p { margin: 10px 0; }
        .label { font-weight: bold; color: #555; }
        .score-badge { background: #4facfe; color: white; padding: 10px 20px; border-radius: 20px; display: inline-block; font-size: 18px; font-weight: bold; margin: 10px 0; }
        .feedback-box { background: #e8f4f8; padding: 15px; border-left: 4px solid #4facfe; margin: 15px 0; border-radius: 4px; }
        .button { display: inline-block; background: #4facfe; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin-top: 20px; }
        .footer { text-align: center; margin-top: 30px; color: #888; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>📊 Performance Evaluation</h1>
        </div>
        <div class="content">
          <div class="evaluation-icon">📋</div>
          <div class="evaluation-title">New Evaluation Available</div>
          <p style="text-align: center;">Dear <strong>${recipientName}</strong>,</p>
          
          <div class="evaluation-details">
            <p><span class="label">Evaluated By:</span> ${evaluatorName}</p>
            <p><span class="label">Evaluation Date:</span> ${evaluationDate}</p>
            <div style="text-align: center; margin: 15px 0;">
              <span class="score-badge">Overall Score: ${overallScore}/5</span>
            </div>
            <div class="feedback-box">
              <p><span class="label">Feedback:</span></p>
              <p>${feedback}</p>
            </div>
          </div>
          
          <p style="text-align: center;">Your performance has been evaluated. Please review the feedback and continue your great work!</p>
          <div style="text-align: center;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/intern/progress" class="button">View Full Evaluation</a>
          </div>
          
          <div class="footer">
            <p>This is an automated email from TRIMIDS (Pvt) Ltd IMS System.</p>
            <p>Keep striving for excellence!</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `,
};

// Helper functions to send specific email types
export async function sendTaskAssignmentEmail(
  recipientEmail: string,
  recipientName: string,
  taskTitle: string,
  taskDescription: string,
  dueDate: string,
  assignedBy: string
): Promise<boolean> {
  return sendEmail({
    to: recipientEmail,
    subject: '🎯 New Task Assigned - TRIMIDS IMS',
    html: emailTemplates.taskAssigned(recipientName, taskTitle, taskDescription, dueDate, assignedBy),
  });
}

export async function sendAchievementEmail(
  recipientEmail: string,
  recipientName: string,
  achievementName: string,
  achievementDescription: string,
  points: number,
  giftedBy: string
): Promise<boolean> {
  return sendEmail({
    to: recipientEmail,
    subject: '🏆 Achievement Unlocked - TRIMIDS IMS',
    html: emailTemplates.achievementGifted(recipientName, achievementName, achievementDescription, points, giftedBy),
  });
}

export async function sendEvaluationEmail(
  recipientEmail: string,
  recipientName: string,
  evaluatorName: string,
  overallScore: string,
  feedback: string,
  evaluationDate: string
): Promise<boolean> {
  return sendEmail({
    to: recipientEmail,
    subject: '📊 New Performance Evaluation - TRIMIDS IMS',
    html: emailTemplates.evaluationCreated(recipientName, evaluatorName, overallScore, feedback, evaluationDate),
  });
}
