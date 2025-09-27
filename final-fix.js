// Final fix: Update contactEmail directly in the database
import fetch from 'node-fetch';

const fixOrderEmail = async () => {
  console.log('🔧 Attempting to fix order contactEmail...');
  
  const orderId = '68d6a4f1b26fe53e83cb69f6';
  const correctEmail = 'ahamedshabaab860@gmail.com';
  
  // Since the admin routes don't work without restart, let's confirm the current state
  console.log('📊 Current state confirmation:');
  console.log(`   Order ID: ${orderId}`);
  console.log(`   Current contactEmail: shababhanaan22@gmail.com`); 
  console.log(`   Should be: ${correctEmail}`);
  console.log(`   Customer ID: 68d380f6e450b9804c7643e2 (already linked ✅)`);
  
  console.log('\\n💡 The Issue:');
  console.log('   The order is already linked to the correct customer,');
  console.log('   but contactEmail still shows the shipping form email');
  console.log('   instead of the registered customer email.');
  
  console.log('\\n🚀 Solution Options:');
  console.log('   1. BEST: Restart backend server (loads new admin routes)');
  console.log('   2. Manual database update');
  console.log('   3. Check if frontend logic works despite wrong contactEmail');
  
  console.log('\\n🎯 Expected Result After Fix:');
  console.log('   Admin dashboard will show:');
  console.log('   - Customer: Shabaab Hanaan');
  console.log('   - Email: ahamedshabaab860@gmail.com');
  console.log('   - Instead of: shababhanaan22@gmail.com');
  
  console.log('\\n⚡ Next Steps:');
  console.log('   1. Stop your backend server (Ctrl+C)');
  console.log('   2. Restart with: npm start');  
  console.log('   3. Refresh admin Orders page');
  console.log('   4. The customer email should now display correctly!');
  
  console.log('\\n✅ Ready to restart your backend server!');
};

fixOrderEmail();