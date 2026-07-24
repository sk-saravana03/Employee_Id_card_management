import dotenv from 'dotenv';
dotenv.config();
import mongoose from 'mongoose';
import dns from 'dns';

try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {
  // Ignore if custom DNS cannot be set
}

import Role from './models/Role.model.js';
import Branch from './models/Branch.model.js';
import Department from './models/Department.model.js';
import User from './models/User.model.js';

const seedDatabase = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/enterprise_id_card_db';
    await mongoose.connect(mongoUri);
    console.log('[Seeder] Connected to MongoDB.');

    // 1. Seed Roles
    const rolesList = [
      {
        name: 'Super Admin',
        description: 'Full Unrestricted System Access & Governance',
        permissions: ['*'],
      },
      {
        name: 'HR/Admin',
        description: 'Employee Directory & ID Request Management',
        permissions: ['employees:read', 'employees:write', 'id_cards:request'],
      },
      {
        name: 'Printer Operator',
        description: 'ID Card Printing Queue & Hardware Processing',
        permissions: ['id_cards:print', 'id_cards:queue'],
      },
      {
        name: 'Security Officer',
        description: 'Verification & Access Gate Control',
        permissions: ['verify:card', 'logs:read'],
      },
      {
        name: 'Employee',
        description: 'Self-service Employee Portal User',
        permissions: ['profile:read', 'profile:update'],
      },
    ];

    console.log('[Seeder] Seeding Roles...');
    for (const r of rolesList) {
      await Role.findOneAndUpdate({ name: r.name }, r, { upsert: true, new: true });
    }

    // 2. Seed Default Branch
    console.log('[Seeder] Seeding Default Branch...');
    const branch = await Branch.findOneAndUpdate(
      { code: 'HQ-01' },
      { name: 'Corporate Headquarters', code: 'HQ-01', city: 'Global Tech Hub', country: 'United States' },
      { upsert: true, new: true }
    );

    // 3. Seed Default Department
    console.log('[Seeder] Seeding Default Department...');
    const department = await Department.findOneAndUpdate(
      { code: 'IT-DEV' },
      { name: 'Information Technology', code: 'IT-DEV', branch: branch._id },
      { upsert: true, new: true }
    );

    // 4. Seed Super Admin User
    const superAdminRole = await Role.findOne({ name: 'Super Admin' });

    console.log('[Seeder] Seeding Default Super Admin User...');
    const existingAdmin = await User.findOne({ email: 'admin@enterprise.com' });
    if (!existingAdmin) {
      const admin = new User({
        employeeId: 'EMP-00001',
        firstName: 'System',
        lastName: 'Administrator',
        email: 'admin@enterprise.com',
        password: 'Admin@123456', // Pre-save hook hashes password
        role: superAdminRole._id,
        branch: branch._id,
        department: department._id,
        isVerified: true,
        status: 'ACTIVE',
      });
      admin.setSensitivePhone('+1 (800) 555-0199');
      admin.setSensitiveNationalId('SSN-999-00-1234');
      await admin.save();
      console.log(' -> Created default Super Admin: admin@enterprise.com / Admin@123456');
    } else {
      console.log(' -> Default Super Admin already exists.');
    }

    console.log('[Seeder] Database seeding completed successfully.');
    process.exit(0);
  } catch (error) {
    console.error('[Seeder Error]:', error);
    process.exit(1);
  }
};

seedDatabase();
