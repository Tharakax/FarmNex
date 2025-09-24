# 📧 Email Configuration Guide for Notification System

## Overview
The FarmNex notification system now supports sending email notifications to users when creating or updating notifications. This guide explains how to set up email functionality.

## Environment Variables Required

Add the following environment variables to your `.env` file in the `backend` directory:

```env
# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Optional: Frontend URL for email links
FRONTEND_URL=http://localhost:3001
```

## Gmail Setup (Recommended)

1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate App Password**:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate a new app password for "Mail"
   - Use this password in `EMAIL_PASS`

## Other Email Providers

### Outlook/Hotmail
```env
EMAIL_HOST=smtp-mail.outlook.com
EMAIL_PORT=587
EMAIL_USER=your-email@outlook.com
EMAIL_PASS=your-password
```

### Yahoo
```env
EMAIL_HOST=smtp.mail.yahoo.com
EMAIL_PORT=587
EMAIL_USER=your-email@yahoo.com
EMAIL_PASS=your-password
```

## Testing Email Configuration

Run this command to test your email setup:

```bash
node -e "
import { testEmailConfiguration } from './services/emailService.js';
testEmailConfiguration().then(result => {
  console.log('Email test result:', result);
  process.exit(result.success ? 0 : 1);
});
"
```

## User Email Preferences

For emails to be sent, users must have:
1. A valid email address in their profile
2. `emailNotifications: true` in their user document

## Email Features

### Automatic Email Sending
- ✅ Professional HTML email templates
- ✅ Responsive design for mobile/desktop
- ✅ Priority-based styling (High/Medium/Low)
- ✅ Type-based icons (Alert 🚨, Offer 🎉, Update 📢)
- ✅ Audience filtering (FARMER, USER, BOTH)

### Email Content Includes
- Notification title and body
- Priority and type indicators
- Timestamp
- Link to view all notifications
- Unsubscribe information

### Email Tracking
- `emailSent`: Boolean flag indicating if email was sent
- `emailSentAt`: Timestamp of when email was sent
- Success/failure status in API responses

## Troubleshooting

### Common Issues

1. **"Email configuration not found"**
   - Check that `EMAIL_USER` and `EMAIL_PASS` are set in `.env`
   - Restart the server after adding environment variables

2. **"Authentication failed"**
   - For Gmail: Use App Password, not regular password
   - For other providers: Check username/password combination

3. **"No recipients found"**
   - Users must have `emailNotifications: true` in their profile
   - Check that users exist in the selected audience (FARMER/USER/BOTH)

4. **"Connection refused"**
   - Check EMAIL_HOST and EMAIL_PORT values
   - Ensure firewall allows outbound connections on the specified port

## API Usage

### Create Notification with Email
```javascript
POST /api/notifications
{
  "title": "Important Alert",
  "body": "This message will be sent via email too",
  "audience": "FARMER",
  "type": "ALERT",
  "priority": "HIGH",
  "sendEmail": true
}
```

### Response with Email Status
```javascript
{
  "notification": {
    "notificationId": "NOT-1234567890-123",
    "title": "Important Alert",
    "sendEmail": true,
    "emailSent": true,
    "emailSentAt": "2024-09-24T09:00:00.000Z"
  },
  "emailStatus": {
    "success": true,
    "totalRecipients": 5,
    "successCount": 5,
    "failCount": 0
  }
}
```

## Security Notes

- Never commit `.env` file to version control
- Use App Passwords instead of main account passwords
- Regularly rotate email credentials
- Monitor email sending quotas to avoid being rate-limited

## Email Template Customization

Email templates are located in `services/emailService.js`. You can customize:
- HTML structure and styling
- Color scheme and branding
- Content layout and sections
- Footer information

The template automatically adapts to:
- Different notification types and priorities
- User names and email addresses
- Mobile and desktop viewing