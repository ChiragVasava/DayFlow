const mongoose = require('mongoose');
const Employee = require('./models/Employee');
require('dotenv').config();

const createAdmin = async () => {
  try {
    // Connect to MongoDB
    const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/dayflow';
    await mongoose.connect(mongoURI);
    console.log('✅ Connected to MongoDB');

    // Check if admin with Employee ID format already exists
    const existingAdmin = await Employee.findOne({ employeeId: 'OIADMN20230001' });
    if (existingAdmin) {
      console.log('⚠️  Admin account with Employee ID OIADMN20230001 already exists:');
      console.log(`   Employee ID: ${existingAdmin.employeeId}`);
      console.log(`   Name: ${existingAdmin.firstName} ${existingAdmin.lastName}`);
      console.log(`   Email: ${existingAdmin.email}`);
      console.log('\n💡 Tip: You can modify this script to create a different admin account.');
      process.exit(0);
    }

    // Create admin account
    const adminData = {
      employeeId: 'OIADMN20230001',
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@dayflow.com',
      password: 'admin123', // Will be hashed by pre-save hook
      role: 'Admin',
      department: 'Management',
      designation: 'System Administrator',
      phoneNumber: '+1234567890',
      dateOfJoining: new Date(),
      isVerified: true,
      isActive: true,
      isFirstLogin: false, // Admin can login without password change
      leaveBalance: {
        annual: 20,
        sick: 10,
        casual: 5,
      },
    };

    const admin = await Employee.create(adminData);

    console.log('\n🎉 Admin account created successfully!\n');
    console.log('═══════════════════════════════════════');
    console.log('📋 Admin Credentials:');
    console.log('═══════════════════════════════════════');
    console.log(`   Employee ID: ${admin.employeeId}`);
    console.log(`   Password:    admin123`);
    console.log(`   Email:       ${admin.email}`);
    console.log(`   Role:        ${admin.role}`);
    console.log('═══════════════════════════════════════\n');
    console.log('⚠️  IMPORTANT: Change the admin password after first login!\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating admin:', error);
    process.exit(1);
  }
};

createAdmin();
