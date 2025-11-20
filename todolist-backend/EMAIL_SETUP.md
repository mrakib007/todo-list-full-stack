# Email Notification Setup Guide

This guide will help you configure email notifications for task reminders using nodemailer.

## Overview

The application sends automated email notifications to users:
- **12 hours before** a task's due date
- **6 hours before** a task's due date

## Prerequisites

1. An email account (Gmail, Outlook, or any SMTP-compatible email service)
2. SMTP credentials for your email provider

## What is SMTP?

SMTP (Simple Mail Transfer Protocol) is the standard protocol for sending emails. Think of it as the "post office" for your emails - it's how your application sends emails to users.

**You don't need to install anything special** - you just need the settings from your email provider (Gmail, Outlook, etc.) to connect to their email servers.

## Common Email Provider SMTP Settings

Here are the SMTP settings for the most popular email providers:

### 📧 Gmail (Google)

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
```

**Note**: Gmail requires an "App Password" (not your regular password). See setup instructions below.

### 📧 Outlook / Hotmail / Live.com

```env
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@outlook.com
SMTP_PASSWORD=your-password
```

### 📧 Yahoo Mail

```env
SMTP_HOST=smtp.mail.yahoo.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@yahoo.com
SMTP_PASSWORD=your-app-password
```

**Note**: Yahoo also requires an App Password.

### 📧 Zoho Mail

```env
SMTP_HOST=smtp.zoho.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@zoho.com
SMTP_PASSWORD=your-password
```

### 📧 ProtonMail

```env
SMTP_HOST=127.0.0.1
SMTP_PORT=1025
SMTP_SECURE=false
SMTP_USER=your-email@protonmail.com
SMTP_PASSWORD=your-password
```

**Note**: ProtonMail requires ProtonMail Bridge to be installed and running.

### 📧 Custom Email / Business Email

If you have a custom email (like `yourname@yourcompany.com`), check with your email hosting provider or IT department. Common settings:

```env
SMTP_HOST=mail.yourdomain.com  # or smtp.yourdomain.com
SMTP_PORT=587                  # or 465 for SSL
SMTP_SECURE=false              # or true for port 465
SMTP_USER=your-email@yourdomain.com
SMTP_PASSWORD=your-password
```

## Configuration

### Step 1: Choose Your Email Provider

**Easiest Option**: Use Gmail (most common and well-documented)

### Step 2: Add Environment Variables

Add the following variables to your `.env` file in the `todolist-backend` directory, using the settings from above:

```env
# Email Configuration (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM_NAME=TodoApp Notifications
```

**Note**: `SMTP_FROM_NAME` is optional. This is the name that will appear in the "From" field of emails. If not set, it defaults to "Todo List App".

### Step 3: Email Provider Setup

#### For Gmail:

1. **Enable 2-Factor Authentication** on your Google account
2. **Generate an App Password**:
   - Go to [Google Account Settings](https://myaccount.google.com/)
   - Navigate to **Security** → **2-Step Verification**
   - Scroll down to **App passwords**
   - Generate a new app password for "Mail"
   - Copy the 16-character password

3. **Update your `.env` file**:
   ```env
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_SECURE=false
   SMTP_USER=your-email@gmail.com
   SMTP_PASSWORD=your-16-character-app-password
   ```

#### For Outlook/Hotmail:

```env
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@outlook.com
SMTP_PASSWORD=your-password
```

#### For Other SMTP Providers:

Check your email provider's SMTP settings and update accordingly:
- **Host**: Your SMTP server address
- **Port**: Usually 587 (TLS) or 465 (SSL)
- **Secure**: `true` for port 465, `false` for port 587

### Step 3: Verify Configuration

1. Restart your backend server
2. Check the console logs - you should see:
   ```
   ✅ Cron jobs scheduled for email notifications
      - 12-hour reminders: Every hour at minute 0
      - 6-hour reminders: Every hour at minute 0
   ```

3. If email is not configured, you'll see:
   ```
   ⚠️  Email notifications disabled: SMTP credentials not configured
   ```

## How It Works

1. **Cron Jobs**: Two cron jobs run every hour at minute 0:
   - One checks for tasks due in 12 hours
   - One checks for tasks due in 6 hours

2. **Notification Tracking**: The system tracks which notifications have been sent to avoid duplicates using the `task_notifications` table.

3. **Email Sending**: When a task is found:
   - The system checks if a notification was already sent
   - If not, it sends an email to the user
   - The notification is marked as sent in the database

## Testing

### Manual Test

You can test the email service manually by creating a task with a due date:
- **12 hours from now**: Create a task due in 12 hours
- **6 hours from now**: Create a task due in 6 hours

Wait for the next hour (when the cron job runs) and check:
1. Your email inbox
2. The server console logs for confirmation

### Test Email Service Directly

You can create a test script to verify email configuration:

```javascript
// test-email.js
require('dotenv').config();
const emailService = require('./services/emailService');

emailService.sendTaskReminder(
  'test@example.com',
  'Test User',
  'Test Task',
  'This is a test task',
  new Date(Date.now() + 12 * 60 * 60 * 1000),
  12
).then(result => {
  console.log('Email test result:', result);
  process.exit(0);
}).catch(error => {
  console.error('Email test failed:', error);
  process.exit(1);
});
```

Run it with: `node test-email.js`

## Troubleshooting

### Email Not Sending

1. **Check SMTP credentials**: Verify your email and password are correct
2. **Check firewall/network**: Ensure port 587 or 465 is not blocked
3. **Check email provider settings**: Some providers require app passwords
4. **Check server logs**: Look for error messages in the console

### Common Errors

- **"Invalid login"**: Wrong email or password
- **"Connection timeout"**: Firewall blocking SMTP port
- **"Authentication failed"**: Need to use app password instead of regular password (Gmail)

### Gmail Specific Issues

- **"Less secure app access"**: Gmail no longer supports this. Use App Passwords instead.
- **"2FA required"**: You must enable 2-Factor Authentication to generate app passwords

## Database Schema

The system automatically creates a `task_notifications` table to track sent notifications:

```sql
CREATE TABLE task_notifications (
  id SERIAL PRIMARY KEY,
  task_id INTEGER REFERENCES tasks(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  notification_type VARCHAR(50) NOT NULL, -- '12_hours' or '6_hours'
  sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(task_id, notification_type)
);
```

## Cron Schedule

- **Frequency**: Every hour at minute 0 (e.g., 1:00, 2:00, 3:00)
- **Timezone**: UTC
- **Both jobs run simultaneously**: One checks for 12-hour reminders, one for 6-hour reminders

## Customization

### Change Notification Times

Edit `app.js` to change when notifications are sent:

```javascript
// For 24 hours and 12 hours instead
cron.schedule('0 * * * *', async () => {
  await notificationService.sendNotificationsForTasksDueInHours(24, '24_hours');
}, { scheduled: true, timezone: "UTC" });
```

### Change Cron Schedule

Modify the cron expression in `app.js`:
- `'0 * * * *'` - Every hour at minute 0
- `'0 */2 * * *'` - Every 2 hours
- `'*/15 * * * *'` - Every 15 minutes (for testing)

### Customize Email Template

Edit `services/emailService.js` to customize the email HTML template.

## Security Notes

1. **Never commit `.env` file** to version control
2. **Use App Passwords** instead of your main password
3. **Rotate passwords** regularly
4. **Use environment-specific credentials** for production vs development

## Support

If you encounter issues:
1. Check server logs for detailed error messages
2. Verify SMTP settings with your email provider
3. Test email connectivity using the test script above

