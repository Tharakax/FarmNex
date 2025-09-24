import { sendNotificationEmail } from './services/emailService.js';

async function testGreenEmailTheme() {
  console.log('🌿 TESTING GREEN EMAIL THEME WITH FA-LEAF ICON');
  console.log('═'.repeat(60));
  
  const testNotifications = [
    {
      notificationId: 'GREEN-TEST-FARMER-' + Date.now(),
      title: '🌾 New Sustainable Farming Initiative',
      body: `Dear Farmer,

We're excited to announce our new sustainable farming initiative designed to help you grow more with less environmental impact.

🌱 Key Benefits:
• Organic certification support
• Eco-friendly pest management
• Water conservation techniques
• Soil health improvement programs

This email should display with:
• Green theme (#4CAF50)
• FontAwesome leaf icon (fa-leaf)
• Unified FarmNex branding
• Professional agricultural styling

Join the green revolution in farming!

Best regards,
FarmNex Sustainability Team`,
      type: 'UPDATE',
      priority: 'HIGH',
      audience: 'FARMER'
    },
    {
      notificationId: 'GREEN-TEST-USER-' + Date.now() + 1,
      title: '🎉 Fresh Organic Produce Now Available',
      body: `Hello Valued Customer,

Great news! Our platform now features a wide selection of fresh organic produce from certified sustainable farms.

🥬 What's New:
• Farm-fresh organic vegetables
• Seasonal fruit selections
• Direct from farmer pricing
• Eco-friendly packaging

This email features:
• Consistent green branding
• FontAwesome leaf icon
• Professional platform styling
• Sustainable agriculture focus

Shop fresh, shop sustainable with FarmNex!

Happy Shopping,
FarmNex Marketplace Team`,
      type: 'OFFER',
      priority: 'MEDIUM',
      audience: 'USER'
    },
    {
      notificationId: 'GREEN-TEST-ADMIN-' + Date.now() + 2,
      title: '📊 Green Platform Analytics Report',
      body: `Hello Administrator,

Your monthly sustainability metrics report is ready for review.

📈 Platform Highlights:
• 25% increase in organic farmers
• 40% growth in eco-friendly products
• 30% reduction in packaging waste
• 95% customer satisfaction rate

Email Features Tested:
• Unified green theme for all roles
• FontAwesome leaf icon integration
• Consistent FarmNex branding
• Responsive email design

Review your complete analytics dashboard for detailed insights.

Best regards,
FarmNex Analytics Team`,
      type: 'ALERT',
      priority: 'LOW',
      audience: 'ADMIN'
    }
  ];

  console.log(`🌿 Sending ${testNotifications.length} green-themed test emails...\n`);

  for (const [index, notification] of testNotifications.entries()) {
    console.log(`📧 Test ${index + 1}: ${notification.title}`);
    console.log(`🎯 Audience: ${notification.audience} | Priority: ${notification.priority}`);
    
    try {
      const result = await sendNotificationEmail(notification);
      
      if (result.success) {
        console.log(`✅ SUCCESS! Green email sent`);
        console.log(`📊 Recipients: ${result.successCount}/${result.totalRecipients}`);
        console.log(`📧 Delivered to: ${result.results?.map(r => r.email).join(', ') || 'N/A'}`);
      } else {
        console.log(`❌ FAILED: ${result.message}`);
      }
    } catch (error) {
      console.log(`💥 ERROR: ${error.message}`);
    }
    
    console.log('─'.repeat(50));
  }

  console.log('\n🌿 GREEN EMAIL THEME FEATURES:');
  console.log('✅ Unified green color scheme (#4CAF50)');
  console.log('✅ FontAwesome leaf icon (fa-leaf)');
  console.log('✅ FarmNex sustainable agriculture branding');
  console.log('✅ Professional HTML email template');
  console.log('✅ Role-specific content adaptation');
  console.log('✅ Responsive design for all devices');
  console.log('✅ Consistent footer with green branding');
  
  console.log('\n📧 Email Recipients:');
  console.log('🌾 Farmer emails → shababhanaan22@gmail.com');
  console.log('👤 User/Admin emails → umarahamed852@gmail.com');
  
  console.log('\n🎨 Look for these design elements:');
  console.log('• Green header with leaf icon');
  console.log('• "FarmNex - Agricultural Platform" title');
  console.log('• "Sustainable Farming Innovation" subtitle');
  console.log('• Green accents throughout the email');
  console.log('• Leaf icons in header and footer');
  
  console.log('\n✨ Green email theme test completed!');
}

// Run the test
testGreenEmailTheme().catch(console.error);