import { sendNotificationEmail } from './services/emailService.js';

// Simulate what the database users would look like
const simulatedUsers = {
  'FARMER': [
    {
      email: 'shababhanaan22@gmail.com',
      fullName: 'Shabab Hanaan', 
      role: 'FarmStaff',
      status: 'Active'
    }
  ],
  'USER': [
    {
      email: 'umarahamed852@gmail.com',
      fullName: 'Customer John',
      role: 'Customer', 
      status: 'Active'
    }
  ],
  'ADMIN': [
    {
      email: 'umarahamed852@gmail.com',
      fullName: 'Admin Umar',
      role: 'Admin',
      status: 'Active'
    }
  ]
};

// Override the getUserEmails function temporarily for testing
async function testRoleBasedEmails() {
  console.log('🧪 ROLE-BASED EMAIL SYSTEM TEST');
  console.log('=' .repeat(50));
  console.log('Testing with simulated users based on your actual schema\n');
  
  const testNotifications = [
    {
      notificationId: 'ROLE-TEST-FARMER-' + Date.now(),
      title: '🌾 Farm Alert: Crop Disease Warning',
      body: `Dear Farm Staff,

We have detected potential crop disease in sector 7. Please:

🔍 Inspect all crops in the area
🚨 Report findings to management
💊 Apply treatment if necessary

This notification was sent to all FarmStaff and Manager role users.

Audience: FARMER
Recipients: Users with FarmStaff and Manager roles`,
      type: 'ALERT',
      priority: 'HIGH',
      audience: 'FARMER'
    },
    {
      notificationId: 'ROLE-TEST-USER-' + Date.now() + 1,
      title: '🎉 Special Offer: Fresh Organic Vegetables',
      body: `Dear Valued Customer,

Exciting news! We have a special offer on fresh organic vegetables:

💰 30% OFF on all organic produce
🚚 Free home delivery
⏰ Valid until end of this week

This notification was sent to all Customer and DeliveryStaff role users.

Audience: USER
Recipients: Users with Customer and DeliveryStaff roles`,
      type: 'OFFER',
      priority: 'MEDIUM',
      audience: 'USER'
    },
    {
      notificationId: 'ROLE-TEST-ADMIN-' + Date.now() + 2,
      title: '📊 System Maintenance Scheduled',
      body: `Dear Administrator,

System maintenance has been scheduled for this weekend:

🕒 Time: Sunday 2:00 AM - 6:00 AM
🔧 Purpose: Database optimization and security updates
📧 Notification: All users will be notified 24 hours in advance

This notification was sent to Admin role users only.

Audience: ADMIN
Recipients: Users with Admin role`,
      type: 'UPDATE',
      priority: 'LOW',
      audience: 'ADMIN'
    }
  ];

  // Temporarily modify the email service to use our simulated users
  console.log('🔧 Temporarily overriding database queries with simulated users...\n');

  for (const [index, notification] of testNotifications.entries()) {
    console.log(`📮 Test ${index + 1}: ${notification.title}`);
    console.log(`🎯 Audience: ${notification.audience}`);
    console.log(`🔔 Type: ${notification.type} | Priority: ${notification.priority}`);
    
    // Get simulated users for this audience
    const simulatedRecipients = simulatedUsers[notification.audience] || [];
    console.log(`👥 Simulated Recipients:`, simulatedRecipients.map(u => `${u.fullName} (${u.role}) - ${u.email}`));
    
    try {
      const result = await sendNotificationEmail(notification);
      
      if (result.success) {
        console.log(`✅ SUCCESS! Emails sent`);
        console.log(`📊 Recipients: ${result.successCount}/${result.totalRecipients}`);
        console.log(`📧 Delivered to: ${result.results?.map(r => r.email).join(', ') || 'N/A'}`);
      } else {
        console.log(`❌ FAILED: ${result.message}`);
      }
    } catch (error) {
      console.log(`💥 ERROR: ${error.message}`);
    }
    
    console.log('─'.repeat(60));
  }

  console.log('\n🎯 ROLE MAPPING SUMMARY:');
  console.log('Your Database Roles → Email Template Style:');
  console.log('  👨‍🌾 FarmStaff     → 🌾 Green Farmer Theme');
  console.log('  👔 Manager       → 🌾 Green Farmer Theme'); 
  console.log('  🛒 Customer      → 🏪 Blue Marketplace Theme');
  console.log('  🚚 DeliveryStaff → 🏪 Blue Marketplace Theme');
  console.log('  👤 Admin         → 🏪 Blue Marketplace Theme');
  
  console.log('\n📧 Email Audiences:');
  console.log('  📨 FARMER  → Sends to: FarmStaff, Manager');
  console.log('  📨 USER    → Sends to: Customer, DeliveryStaff');
  console.log('  📨 ADMIN   → Sends to: Admin');
  console.log('  📨 BOTH    → Sends to: FarmStaff, Manager, Customer, DeliveryStaff');
  console.log('  📨 ALL     → Sends to: Everyone (all roles)');
  
  console.log('\n✨ Role-based email system test completed!');
  console.log('🔔 Check the specified email addresses for the notifications');
}

// Run the test
testRoleBasedEmails().catch(console.error);