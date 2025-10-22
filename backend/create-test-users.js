import User from './models/usermodel.js';
import bcrypt from 'bcrypt';

async function createTestUsers() {
  try {
    console.log('🔧 Creating test users for role-based email testing...\n');
    
    // First, check if users already exist
    const existingUsers = await User.find();
    console.log(`📊 Current users in database: ${existingUsers.length}`);
    
    const testUsers = [
      {
        fullName: 'Shabab Hanaan',
        email: 'shababhanaan22@gmail.com',
        username: 'farmer_shabab',
        password: 'password123',
        role: 'FarmStaff',
        age: 28,
        phone: '+94771234567',
        address: 'Farm District, Sri Lanka',
        status: 'Active'
      },
      {
        fullName: 'Farm Manager Ali',
        email: 'manager@farm.com',
        username: 'manager_ali',
        password: 'password123',
        role: 'Manager', 
        age: 35,
        phone: '+94771234568',
        address: 'Management Office, Sri Lanka',
        status: 'Active'
      },
      {
        fullName: 'Customer John',
        email: 'customer@example.com',
        username: 'customer_john',
        password: 'password123',
        role: 'Customer',
        age: 30,
        phone: '+94771234569',
        address: 'City Center, Sri Lanka',
        status: 'Active'
      },
      {
        fullName: 'Delivery Driver Mike',
        email: 'delivery@example.com',
        username: 'delivery_mike',
        password: 'password123',
        role: 'DeliveryStaff',
        age: 25,
        phone: '+94771234570',
        address: 'Delivery Center, Sri Lanka',
        status: 'Active'
      },
      {
        fullName: 'Admin Umar',
        email: 'umarahamed852@gmail.com',
        username: 'admin_umar',
        password: 'password123',
        role: 'Admin',
        age: 32,
        phone: '+94771234571',
        address: 'Admin Office, Sri Lanka',
        status: 'Active'
      }
    ];
    
    for (const userData of testUsers) {
      try {
        // Check if user already exists
        const existingUser = await User.findOne({ 
          $or: [
            { email: userData.email },
            { username: userData.username }
          ]
        });
        
        if (existingUser) {
          console.log(`⚠️  User ${userData.fullName} (${userData.email}) already exists - skipping`);
          continue;
        }
        
        // Hash password
        const hashedPassword = await bcrypt.hash(userData.password, 10);
        userData.password = hashedPassword;
        
        // Create user
        const newUser = new User(userData);
        await newUser.save();
        
        console.log(`✅ Created user: ${userData.fullName} (${userData.role}) - ${userData.email}`);
        
      } catch (userError) {
        console.error(`❌ Error creating user ${userData.fullName}:`, userError.message);
      }
    }
    
    // Show final user list
    console.log('\n📋 Final user list:');
    const finalUsers = await User.find().select('fullName email role status');
    
    finalUsers.forEach(user => {
      console.log(`   ${user.fullName} - ${user.role} (${user.email}) [${user.status}]`);
    });
    
    // Show role mapping for email system
    console.log('\n🎯 Email System Role Mapping:');
    console.log('   FARMER audience → FarmStaff, Manager roles');
    console.log('   USER audience → Customer, DeliveryStaff roles'); 
    console.log('   ADMIN audience → Admin role');
    console.log('   BOTH audience → FarmStaff, Manager, Customer, DeliveryStaff');
    console.log('   ALL audience → All active users');
    
    console.log('\n✅ Test users created successfully!');
    console.log('💡 Now you can test role-based email notifications!');
    
  } catch (error) {
    console.error('❌ Error in createTestUsers:', error);
  }
  
  process.exit(0);
}

createTestUsers();