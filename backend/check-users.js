import User from './models/usermodel.js';

async function checkUsers() {
  try {
    console.log('🔍 Checking users in database...\n');
    
    const users = await User.find();
    
    if (users.length === 0) {
      console.log('❌ No users found in database');
      return;
    }
    
    console.log(`✅ Found ${users.length} users in database:\n`);
    
    users.forEach((user, i) => {
      console.log(`${i+1}. Name: ${user.fullName}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Role: ${user.role}`);
      console.log(`   Status: ${user.status}`);
      console.log(`   Created: ${user.createdAt}`);
      console.log('   ---');
    });
    
    // Check role distribution
    const roleCount = {};
    users.forEach(user => {
      roleCount[user.role] = (roleCount[user.role] || 0) + 1;
    });
    
    console.log('\n📊 Role Distribution:');
    Object.entries(roleCount).forEach(([role, count]) => {
      console.log(`   ${role}: ${count} users`);
    });
    
  } catch (error) {
    console.error('❌ Error checking users:', error.message);
  }
  
  process.exit(0);
}

checkUsers();