const nodemailer = require('nodemailer');

// Create reusable transporter object using SMTP transport
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  });
};

// Email template for task reminder
const getTaskReminderEmailTemplate = (userName, taskTitle, taskDescription, dueDate, hoursUntilDue) => {
  const formattedDate = new Date(dueDate).toLocaleString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return {
    subject: `⏰ Task Reminder: "${taskTitle}" due in ${hoursUntilDue} hours`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            text-align: center;
            border-radius: 10px 10px 0 0;
          }
          .content {
            background: #f9fafb;
            padding: 30px;
            border-radius: 0 0 10px 10px;
          }
          .task-card {
            background: white;
            border-left: 4px solid #667eea;
            padding: 20px;
            margin: 20px 0;
            border-radius: 5px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          }
          .task-title {
            font-size: 20px;
            font-weight: bold;
            color: #1f2937;
            margin-bottom: 10px;
          }
          .task-detail {
            margin: 10px 0;
            color: #6b7280;
          }
          .due-date {
            background: #fef3c7;
            padding: 15px;
            border-radius: 5px;
            margin: 15px 0;
            text-align: center;
            font-weight: bold;
            color: #92400e;
          }
          .footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            color: #9ca3af;
            font-size: 12px;
          }
          .button {
            display: inline-block;
            padding: 12px 24px;
            background: #667eea;
            color: white;
            text-decoration: none;
            border-radius: 5px;
            margin-top: 20px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>📋 Task Reminder</h1>
        </div>
        <div class="content">
          <p>Hi ${userName},</p>
          <p>This is a friendly reminder that you have a task due in <strong>${hoursUntilDue} hours</strong>:</p>
          
          <div class="task-card">
            <div class="task-title">${taskTitle}</div>
            ${taskDescription ? `<div class="task-detail">${taskDescription}</div>` : ''}
            <div class="due-date">
              📅 Due: ${formattedDate}
            </div>
          </div>
          
          <p>Don't forget to complete it on time!</p>
          
          <div style="text-align: center;">
            <a href="${process.env.FRONTEND_URL || 'http://localhost:3001'}" class="button">View Task</a>
          </div>
        </div>
        <div class="footer">
          <p>This is an automated reminder from your Todo List App.</p>
          <p>You're receiving this because you have a task with a due date.</p>
        </div>
      </body>
      </html>
    `,
    text: `
      Task Reminder: "${taskTitle}" due in ${hoursUntilDue} hours
      
      Hi ${userName},
      
      This is a friendly reminder that you have a task due in ${hoursUntilDue} hours:
      
      Task: ${taskTitle}
      ${taskDescription ? `Description: ${taskDescription}` : ''}
      Due Date: ${formattedDate}
      
      Don't forget to complete it on time!
      
      View your tasks: ${process.env.FRONTEND_URL || 'http://localhost:3001'}
      
      ---
      This is an automated reminder from your Todo List App.
    `,
  };
};

// Send email
const sendEmail = async (to, subject, html, text) => {
  try {
    const transporter = createTransporter();
    
    // Get the "From" name from environment variable or use default
    const fromName = process.env.SMTP_FROM_NAME || 'Todo List App';
    
    const mailOptions = {
      from: `"${fromName}" <${process.env.SMTP_USER}>`,
      to: to,
      subject: subject,
      html: html,
      text: text,
    };

    const info = await transporter.sendMail(mailOptions);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Send task reminder email
const sendTaskReminder = async (userEmail, userName, taskTitle, taskDescription, dueDate, hoursUntilDue) => {
  const emailTemplate = getTaskReminderEmailTemplate(
    userName,
    taskTitle,
    taskDescription,
    dueDate,
    hoursUntilDue
  );

  return await sendEmail(
    userEmail,
    emailTemplate.subject,
    emailTemplate.html,
    emailTemplate.text
  );
};

module.exports = {
  sendEmail,
  sendTaskReminder,
  createTransporter,
};

