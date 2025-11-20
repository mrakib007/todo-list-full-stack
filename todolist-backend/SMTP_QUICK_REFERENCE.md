# SMTP Settings Quick Reference Guide

## What is SMTP?

SMTP (Simple Mail Transfer Protocol) is how applications send emails. You need SMTP settings from your email provider to send emails from your application.

**Think of it like this**: Your email provider (Gmail, Outlook, etc.) has a "mail server" that accepts emails. SMTP settings are like the address and key to that server.

## How to Find Your SMTP Settings

### Method 1: Use the Common Settings Below

Most email providers use standard SMTP settings. Just pick your provider from the list below!

### Method 2: Search Online

If your email provider isn't listed, search for:
- `"[your email provider] SMTP settings"`
- `"[your email provider] outgoing mail server"`

For example:
- "Gmail SMTP settings"
- "Outlook SMTP settings"
- "Yahoo SMTP settings"

### Method 3: Check Your Email Provider's Help/Support

Most email providers have documentation:
- Gmail: https://support.google.com/mail
- Outlook: https://support.microsoft.com/outlook
- Yahoo: https://help.yahoo.com

## Common Email Provider SMTP Settings

### 📧 Gmail (Most Popular - Recommended for Beginners)

**Settings:**
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
```

**Important**: 
- You CANNOT use your regular Gmail password
- You MUST create an "App Password" (see Gmail setup below)
- Your account must have 2-Factor Authentication enabled

**Why Gmail is recommended**: 
- Free
- Well-documented
- Reliable
- Easy to set up

---

### 📧 Outlook / Hotmail / Live.com / MSN

**Settings:**
```env
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@outlook.com
SMTP_PASSWORD=your-password
```

**Note**: Use your regular Outlook password (no app password needed for basic accounts).

---

### 📧 Yahoo Mail

**Settings:**
```env
SMTP_HOST=smtp.mail.yahoo.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@yahoo.com
SMTP_PASSWORD=your-app-password
```

**Note**: Yahoo requires an App Password (similar to Gmail).

---

### 📧 AOL Mail

**Settings:**
```env
SMTP_HOST=smtp.aol.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@aol.com
SMTP_PASSWORD=your-app-password
```

---

### 📧 Zoho Mail

**Settings:**
```env
SMTP_HOST=smtp.zoho.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@zoho.com
SMTP_PASSWORD=your-password
```

---

### 📧 iCloud Mail (Apple)

**Settings:**
```env
SMTP_HOST=smtp.mail.me.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@icloud.com
SMTP_PASSWORD=your-app-password
```

**Note**: Requires App-Specific Password from Apple ID settings.

---

### 📧 Custom/Business Email

If you have a custom email (like `name@yourcompany.com`), you need to:

1. **Check with your IT department** or email hosting provider
2. **Look in your email client settings** (Outlook, Apple Mail, etc.)
3. **Check your hosting control panel** (cPanel, Plesk, etc.)

**Common patterns:**
- `mail.yourdomain.com`
- `smtp.yourdomain.com`
- `smtp.youremailhost.com`

**Ports:**
- `587` - Most common (TLS)
- `465` - SSL (set `SMTP_SECURE=true`)
- `25` - Usually blocked by ISPs

---

## Quick Setup Guide

### For Gmail (Easiest):

1. **Enable 2-Factor Authentication**
   - Go to: https://myaccount.google.com/security
   - Turn on "2-Step Verification"

2. **Create App Password**
   - Go to: https://myaccount.google.com/apppasswords
   - Select "Mail" and "Other (Custom name)"
   - Name it "Todo App" or similar
   - Copy the 16-character password

3. **Add to .env file:**
   ```env
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_SECURE=false
   SMTP_USER=your-email@gmail.com
   SMTP_PASSWORD=abcd-efgh-ijkl-mnop
   ```
   (Replace with your actual email and app password)

4. **Restart your server**

### For Outlook:

1. **Use your regular email and password**
2. **Add to .env file:**
   ```env
   SMTP_HOST=smtp-mail.outlook.com
   SMTP_PORT=587
   SMTP_SECURE=false
   SMTP_USER=your-email@outlook.com
   SMTP_PASSWORD=your-password
   ```
3. **Restart your server**

---

## Testing Your SMTP Settings

After configuring, test with a task that's due in 12 hours:

1. Create a task with due date = current time + 12 hours
2. Wait for the next hour (cron runs at minute 0)
3. Check your email inbox
4. Check server logs for any errors

---

## Troubleshooting

### "Invalid login" or "Authentication failed"
- **Gmail/Yahoo**: Make sure you're using an App Password, not your regular password
- **Outlook**: Try your regular password
- **Double-check**: Email and password are correct

### "Connection timeout"
- Check your internet connection
- Firewall might be blocking port 587
- Try port 465 with `SMTP_SECURE=true`

### "Less secure app access" (Gmail)
- Gmail no longer supports this
- You MUST use App Passwords with 2FA enabled

### Still not working?
1. Check server logs for detailed error messages
2. Verify your email provider's current SMTP settings (they sometimes change)
3. Try a different email provider (Gmail is usually the most reliable)

---

## Security Tips

1. **Never commit your .env file** to Git
2. **Use App Passwords** when available (more secure)
3. **Don't share your SMTP credentials**
4. **Rotate passwords** regularly
5. **Use different credentials** for development and production

---

## Need Help?

If you're still stuck:
1. Check the full setup guide: `EMAIL_SETUP.md`
2. Search for your email provider + "SMTP settings"
3. Contact your email provider's support

