import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Create transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: process.env.EMAIL_PORT || 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

// Function to get user emails based on audience
const getUserEmails = async (audience) => {
  try {
    // Check if we're in test mode (no database available)
    const isTestMode = process.env.EMAIL_TEST_MODE === 'true';
    
    if (isTestMode) {
      console.log('📧 Email Test Mode: Using test recipients instead of database');
      
      // Return test recipients based on audience
      const testRecipients = {
        'FARMER': [
          { 
            email: 'shababhanaan22@gmail.com', 
            name: 'Test Farmer', 
            role: 'farmer' 
          }
        ],
        'USER': [
          { 
            email: process.env.EMAIL_USER, 
            name: 'Test User', 
            role: 'user' 
          }
        ],
        'BOTH': [
          { 
            email: process.env.EMAIL_USER, 
            name: 'Test User', 
            role: 'user' 
          },
          { 
            email: 'shababhanaan22@gmail.com', 
            name: 'Test Farmer', 
            role: 'farmer' 
          }
        ]
      };
      
      return testRecipients[audience] || [];
    }
    
    // Production database logic - using actual user schema
    try {
      console.log('📧 Production Mode: Fetching users from database...');
      const User = (await import('../models/usermodel.js')).default;
      
      let filter = {};
      
      // Map your actual roles to email audiences
      // Your roles: 'Admin', 'FarmStaff', 'Manager', 'DeliveryStaff', 'Customer'
      switch (audience) {
        case 'FARMER':
          // Send to FarmStaff and Manager (farming-related roles)
          filter = { 
            role: { $in: ['FarmStaff', 'Manager'] },
            status: 'Active'
          };
          break;
        case 'USER':
          // Send to Customer and DeliveryStaff (marketplace/customer-related roles)
          filter = { 
            role: { $in: ['Customer', 'DeliveryStaff'] },
            status: 'Active'
          };
          break;
        case 'ADMIN':
          // Send to Admin only
          filter = { 
            role: 'Admin',
            status: 'Active'
          };
          break;
        case 'BOTH':
          // Send to all active users (excluding Admin unless specified)
          filter = { 
            role: { $in: ['FarmStaff', 'Manager', 'Customer', 'DeliveryStaff'] },
            status: 'Active'
          };
          break;
        case 'ALL':
          // Send to everyone including Admin
          filter = { 
            status: 'Active'
          };
          break;
        default:
          console.log(`⚠️  Unknown audience: ${audience}`);
          return [];
      }
      
      console.log('🔍 Database filter:', JSON.stringify(filter));
      const users = await User.find(filter).select('email fullName role status');
      
      if (users.length === 0) {
        console.log(`⚠️  No active users found for audience: ${audience}`);
        return [];
      }
      
      console.log(`✅ Found ${users.length} users for audience: ${audience}`);
      
      return users.map(user => {
        // Map your roles to email template roles
        let templateRole = 'user'; // default
        if (['FarmStaff', 'Manager'].includes(user.role)) {
          templateRole = 'farmer';
        } else if (['Customer', 'DeliveryStaff', 'Admin'].includes(user.role)) {
          templateRole = 'user';
        }
        
        return {
          email: user.email,
          name: user.fullName || 'Valued User',
          role: templateRole,
          originalRole: user.role // Keep original role for reference
        };
      });
      
    } catch (dbError) {
      console.log('⚠️  Database error, checking connection...', dbError.message);
      
      // If database is truly unavailable, fallback to test mode temporarily
      console.log('🔄 Temporary fallback to test recipients due to database issue');
      const fallbackRecipients = {
        'FARMER': [{ email: 'shababhanaan22@gmail.com', name: 'Database Unavailable - Farmer Test', role: 'farmer' }],
        'USER': [{ email: process.env.EMAIL_USER, name: 'Database Unavailable - User Test', role: 'user' }],
        'ADMIN': [{ email: process.env.EMAIL_USER, name: 'Database Unavailable - Admin Test', role: 'user' }],
        'BOTH': [
          { email: process.env.EMAIL_USER, name: 'Database Unavailable - User Test', role: 'user' },
          { email: 'shababhanaan22@gmail.com', name: 'Database Unavailable - Farmer Test', role: 'farmer' }
        ]
      };
      
      return fallbackRecipients[audience] || [];
    }
  } catch (error) {
    console.error('💥 Critical error in getUserEmails:', error);
    return [];
  }
};

// Function to generate role-specific HTML email template
const generateEmailTemplate = (notification, recipientName, recipientRole = 'user') => {
  const priorityColors = {
    HIGH: '#dc3545',
    MEDIUM: '#ffc107', 
    LOW: '#28a745'
  };
  
  const typeIcons = {
    ALERT: '🚨',
    OFFER: '🎉',
    UPDATE: '📢'
  };

  // Unified green theme configuration for all roles
  const config = {
    headerColor: '#4CAF50', // Green theme for all
    icon: '<i class="fa fa-leaf" style="font-size: 24px; color: white;"></i>',
    title: 'FarmNex - Agricultural Platform',
    subtitle: 'Sustainable Farming Innovation',
    dashboardUrl: recipientRole === 'farmer' ? '/farmer-dashboard' : '/user-dashboard',
    roleSpecificContent: {
      ALERT: recipientRole === 'farmer' ? 'Important farming alert that requires your immediate attention.' : 'Important platform alert that may affect your account.',
      OFFER: recipientRole === 'farmer' ? 'Special agricultural offer available for farmers.' : 'Exciting offer available on our platform.',
      UPDATE: recipientRole === 'farmer' ? 'Latest farming update and agricultural information.' : 'Latest platform update and information.'
    }
  };


  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${config.title} Notification</title>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, ${config.headerColor}, ${config.headerColor}dd); color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background: white; padding: 30px; border: 1px solid #ddd; border-top: none; }
    .priority-badge { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: bold; color: white; margin-bottom: 15px; }
    .type-icon { font-size: 20px; margin-right: 10px; }
    .footer { background: #f8f9fa; padding: 20px; text-align: center; border-radius: 0 0 8px 8px; border: 1px solid #ddd; border-top: none; font-size: 12px; color: #666; }
    .btn { display: inline-block; padding: 12px 24px; background: ${config.headerColor}; color: white; text-decoration: none; border-radius: 4px; margin-top: 20px; }
    .role-specific { background: ${config.headerColor}15; border-left: 4px solid ${config.headerColor}; padding: 15px; margin: 15px 0; border-radius: 4px; }
    h1 { margin: 0; font-size: 24px; }
    h2 { color: #333; margin-bottom: 10px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div style="margin-bottom: 10px;">
        ${config.icon}
      </div>
      <h1 style="margin: 0; font-size: 28px; font-weight: bold;">${config.title}</h1>
      <p style="margin: 8px 0 0 0; font-size: 16px; opacity: 0.9;">${config.subtitle}</p>
    </div>
    
    <div class="content">
      <p>Hello ${recipientName || 'Valued User'},</p>
      
      <div class="priority-badge" style="background-color: ${priorityColors[notification.priority]};">
        ${notification.priority} PRIORITY
      </div>
      
      <h2>
        <span class="type-icon">${typeIcons[notification.type]}</span>
        ${notification.title}
      </h2>
      
      <div class="role-specific">
        <p><strong>${config.roleSpecificContent[notification.type]}</strong></p>
      </div>
      
      <div style="background: #f8f9fa; padding: 20px; border-left: 4px solid ${priorityColors[notification.priority]}; margin: 20px 0;">
        ${notification.body.replace(/\n/g, '<br>')}
      </div>
      
      <div style="margin-top: 20px; padding: 15px; background: #e3f2fd; border-radius: 4px;">
        <strong>📋 Notification Details:</strong><br>
        <strong>Type:</strong> ${notification.type}<br>
        <strong>Priority:</strong> ${notification.priority}<br>
        <strong>Audience:</strong> ${notification.audience}<br>
        <strong>Date:</strong> ${new Date().toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })}
      </div>
      
      <a href="${process.env.FRONTEND_URL || 'http://localhost:3001'}${config.dashboardUrl}/notifications" class="btn">
        View ${recipientRole === 'farmer' ? 'Farming' : 'Marketplace'} Notifications
      </a>
    </div>
    
    <div class="footer">
      <div style="margin-bottom: 10px;">
        <i class="fa fa-leaf" style="color: #4CAF50; margin-right: 8px;"></i>
        <strong style="color: #4CAF50;">FarmNex - Sustainable Agriculture Platform</strong>
      </div>
      <p style="margin: 8px 0;">This is an automated notification from FarmNex. Please do not reply to this email.</p>
      <p style="margin: 8px 0; font-size: 11px; color: #999;">
        If you no longer wish to receive these notifications, you can update your preferences in your account settings.
      </p>
    </div>
  </div>
</body>
</html>`;
};

// Main function to send notification emails
export const sendNotificationEmail = async (notification) => {
  try {
    console.log(`📧 Preparing to send email for notification: ${notification.notificationId}`);
    
    // Check if email configuration is available
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.log('⚠️  Email configuration not found. Skipping email send.');
      return { success: false, message: 'Email configuration not found' };
    }
    
    // Get recipient emails based on audience
    const recipients = await getUserEmails(notification.audience);
    
    if (recipients.length === 0) {
      console.log('⚠️  No recipients found for this notification.');
      return { success: false, message: 'No recipients found' };
    }
    
    console.log(`📮 Sending to ${recipients.length} recipients...`);
    
    // Create transporter
    const transporter = createTransporter();
    
    // Verify transporter configuration
    await transporter.verify();
    console.log('✅ Email server connection verified');
    
    const emailPromises = recipients.map(async (recipient) => {
      const mailOptions = {
        from: {
          name: 'FarmNex Notifications',
          address: process.env.EMAIL_USER
        },
        to: recipient.email,
        subject: `${notification.type === 'ALERT' ? '🚨' : notification.type === 'OFFER' ? '🎉' : '📢'} ${notification.title}`,
        html: generateEmailTemplate(notification, recipient.name, recipient.role),
        // Add text version as fallback
        text: `
FarmNex Notification

Hello ${recipient.name || 'Valued User'},

${notification.title}

${notification.body}

Type: ${notification.type}
Priority: ${notification.priority}
Audience: ${notification.audience}

Visit FarmNex to view all notifications.

This is an automated notification from FarmNex.
        `.trim()
      };
      
      try {
        const result = await transporter.sendMail(mailOptions);
        console.log(`✅ Email sent to ${recipient.email}`);
        return { success: true, email: recipient.email, messageId: result.messageId };
      } catch (error) {
        console.error(`❌ Failed to send email to ${recipient.email}:`, error.message);
        return { success: false, email: recipient.email, error: error.message };
      }
    });
    
    const results = await Promise.all(emailPromises);
    const successCount = results.filter(r => r.success).length;
    const failCount = results.filter(r => !r.success).length;
    
    console.log(`📊 Email sending complete: ${successCount} sent, ${failCount} failed`);
    
    return {
      success: true,
      totalRecipients: recipients.length,
      successCount,
      failCount,
      results
    };
    
  } catch (error) {
    console.error('❌ Error sending notification emails:', error.message);
    return { 
      success: false, 
      message: error.message,
      error: error.message 
    };
  }
};

// Function to test email configuration
export const testEmailConfiguration = async () => {
  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      return { success: false, message: 'Email configuration not found' };
    }
    
    const transporter = createTransporter();
    await transporter.verify();
    
    return { success: true, message: 'Email configuration is valid' };
  } catch (error) {
    return { success: false, message: error.message };
  }
};

export default {
  sendNotificationEmail,
  testEmailConfiguration
};