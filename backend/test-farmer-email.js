import { sendNotificationEmail } from './services/emailService.js';

async function testFarmerEmail() {
  console.log('🌾 FARMER EMAIL DELIVERY TEST');
  console.log('═'.repeat(50));
  
  const testNotifications = [
    {
      notificationId: 'FARMER-TEST-' + Date.now(),
      title: '🚨 Farm Alert: Check Your Email!',
      body: `Hello Farmer!

This is a test notification sent directly to shababhanaan22@gmail.com to verify that farmer emails are working correctly.

📧 Email Details:
• Recipient: shababhanaan22@gmail.com
• Role: Farmer
• Template: Green agricultural theme with 🌾 branding
• Priority: HIGH (Red badge)
• Type: ALERT (🚨 icon)

If you receive this email, the farmer notification system is working perfectly!

Best regards,
FarmNex Team`,
      type: 'ALERT',
      priority: 'HIGH',
      audience: 'FARMER'
    },
    {
      notificationId: 'FARMER-OFFER-' + Date.now() + 1,
      title: '🎉 Special Farming Equipment Discount',
      body: `Dear Valued Farmer,

Exciting news! We have a special offer just for farmers:

💰 25% OFF on all farming equipment
🚚 Free delivery to your farm
⏰ Limited time: Valid until end of month

This email should arrive with:
• Green farmer theme
• 🌾 Agricultural branding  
• Professional HTML layout
• Call-to-action button

Happy farming!
FarmNex Agricultural Team`,
      type: 'OFFER',
      priority: 'MEDIUM',
      audience: 'FARMER'
    }
  ];

  console.log(`📧 Sending ${testNotifications.length} test emails to shababhanaan22@gmail.com...\n`);

  for (const [index, notification] of testNotifications.entries()) {
    console.log(`📮 Test ${index + 1}: ${notification.title}`);
    console.log(`🔔 Type: ${notification.type} | Priority: ${notification.priority}`);
    
    try {
      const result = await sendNotificationEmail(notification);
      
      if (result.success) {
        console.log(`✅ SUCCESS! Email sent successfully`);
        console.log(`📊 Recipients: ${result.successCount}/${result.totalRecipients}`);
        console.log(`📧 Delivered to: ${result.results.map(r => r.email).join(', ')}`);
      } else {
        console.log(`❌ FAILED: ${result.message}`);
      }
    } catch (error) {
      console.log(`💥 ERROR: ${error.message}`);
    }
    
    console.log('─'.repeat(40));
  }

  console.log('\n🎯 SUMMARY:');
  console.log('If both emails were sent successfully, check your inbox at:');
  console.log('📧 shababhanaan22@gmail.com');
  console.log('\nLook for:');
  console.log('🌾 Green agricultural-themed emails');
  console.log('🚨 Alert email with red HIGH priority badge');
  console.log('🎉 Offer email with yellow MEDIUM priority badge');
  console.log('🔗 "View Farming Notifications" buttons');
  
  console.log('\n✨ Email delivery test completed!');
}

// Run the test
testFarmerEmail().catch(console.error);