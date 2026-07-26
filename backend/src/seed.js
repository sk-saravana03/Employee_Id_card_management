import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });
import mongoose from 'mongoose';
import dns from 'dns';

try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {}

import Role from './models/Role.model.js';
import Branch from './models/Branch.model.js';
import Department from './models/Department.model.js';
import User from './models/User.model.js';
import Employee from './models/Employee.model.js';
import Visitor from './models/Visitor.model.js';
import IdCard from './models/IdCard.model.js';
import PrintQueue from './models/PrintQueue.model.js';

const seedDatabase = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/enterprise_id_card_db';
    await mongoose.connect(mongoUri);
    console.log('[Seeder] Connected to MongoDB.');

    // 1. Seed Roles
    const rolesList = [
      { name: 'Super Admin', description: 'Full Unrestricted System Access & Governance', permissions: ['*'] },
      { name: 'HR/Admin', description: 'Employee Directory, Approvals, & ID Governance', permissions: ['employees:read', 'employees:write', 'id_cards:request'] },
      { name: 'Printer Operator', description: 'ID Card Printing Queue & Production Hardware', permissions: ['id_cards:print', 'id_cards:queue'] },
      { name: 'Security Officer', description: 'Verification, Gate Check-In, & Visitor Registration', permissions: ['verify:card', 'visitors:register', 'logs:read'] },
      { name: 'Employee', description: 'Self-service Portal & Physical ID Card Request', permissions: ['profile:read', 'profile:update'] },
    ];

    console.log('[Seeder] Seeding System Roles...');
    const roleDocs = {};
    for (const r of rolesList) {
      const doc = await Role.findOneAndUpdate({ name: r.name }, r, { upsert: true, new: true });
      roleDocs[r.name] = doc;
    }

    // 2. Seed Corporate Branches
    console.log('[Seeder] Seeding Corporate Branches...');
    const b1 = await Branch.findOneAndUpdate(
      { code: 'HQ-01' },
      { name: 'Corporate Headquarters', code: 'HQ-01', city: 'Global Tech Hub', country: 'United States' },
      { upsert: true, new: true }
    );
    const b2 = await Branch.findOneAndUpdate(
      { code: 'REG-02' },
      { name: 'Regional Engineering Center', code: 'REG-02', city: 'Chicago', country: 'United States' },
      { upsert: true, new: true }
    );
    const b3 = await Branch.findOneAndUpdate(
      { code: 'OPS-03' },
      { name: 'Operations & Logistics Center', code: 'OPS-03', city: 'Austin', country: 'United States' },
      { upsert: true, new: true }
    );

    // 3. Seed Departments
    console.log('[Seeder] Seeding Departments...');
    const d1 = await Department.findOneAndUpdate(
      { code: 'IT-DEV' },
      { name: 'Information Technology', code: 'IT-DEV', branch: b1._id, description: 'Systems & Development' },
      { upsert: true, new: true }
    );
    const d2 = await Department.findOneAndUpdate(
      { code: 'HR-OPS' },
      { name: 'Human Resources', code: 'HR-OPS', branch: b1._id, description: 'People & Culture' },
      { upsert: true, new: true }
    );
    const d3 = await Department.findOneAndUpdate(
      { code: 'SEC-01' },
      { name: 'Security & Compliance', code: 'SEC-01', branch: b1._id, description: 'Access Control & Gate Patrol' },
      { upsert: true, new: true }
    );
    const d4 = await Department.findOneAndUpdate(
      { code: 'FIN-01' },
      { name: 'Finance & Accounting', code: 'FIN-01', branch: b2._id, description: 'Financial Operations' },
      { upsert: true, new: true }
    );
    const d5 = await Department.findOneAndUpdate(
      { code: 'PRN-01' },
      { name: 'Operations & Printing', code: 'PRN-01', branch: b3._id, description: 'ID Card Printing Hub' },
      { upsert: true, new: true }
    );

    // Helper: Predefined Password generator (First 4 letters of name + Last 4 digits of phone)
    const genPass = (name, phone) => {
      const cleanName = (name || 'User').trim().replace(/[^a-zA-Z]/g, '');
      let namePart = cleanName.slice(0, 4);
      if (namePart.length < 4) namePart = (namePart + 'User').slice(0, 4);
      const formattedName = namePart.charAt(0).toUpperCase() + namePart.slice(1).toLowerCase();
      const digitsOnly = (phone || '').replace(/\D/g, '');
      const phonePart = digitsOnly.length >= 4 ? digitsOnly.slice(-4) : '1234';
      return `${formattedName}${phonePart}`;
    };

    // 4. Seed User Accounts across all 5 Roles
    console.log('[Seeder] Seeding Users & Employees for all 5 roles...');

    const userSeedData = [
      {
        employeeId: 'SAD260000001',
        firstName: 'System',
        lastName: 'Administrator',
        email: 'admin@enterprise.com',
        phone: '+1 (800) 555-0199',
        role: roleDocs['Super Admin']._id,
        branch: b1._id,
        department: d1._id,
        designation: 'CTO / Technical Director',
        joiningDate: new Date('2020-01-01'),
        status: 'ACTIVE',
      },
      {
        employeeId: 'HRA260000001',
        firstName: 'Sarah',
        lastName: 'Jenkins',
        email: 'sarah.jenkins@enterprise.com',
        phone: '+1 (555) 019-2834',
        role: roleDocs['HR/Admin']._id,
        branch: b1._id,
        department: d2._id,
        designation: 'HR Operations Manager',
        joiningDate: new Date('2021-03-15'),
        status: 'ACTIVE',
      },
      {
        employeeId: 'POP260000001',
        firstName: 'Patrick',
        lastName: 'Miller',
        email: 'patrick.miller@enterprise.com',
        phone: '+1 (555) 019-8765',
        role: roleDocs['Printer Operator']._id,
        branch: b3._id,
        department: d5._id,
        designation: 'ID Card Printing Operator',
        joiningDate: new Date('2022-06-01'),
        status: 'ACTIVE',
      },
      {
        employeeId: 'SEC260000001',
        firstName: 'Sam',
        lastName: 'Officer',
        email: 'sam.officer@enterprise.com',
        phone: '+1 (555) 019-4321',
        role: roleDocs['Security Officer']._id,
        branch: b1._id,
        department: d3._id,
        designation: 'Senior Security Officer',
        joiningDate: new Date('2022-08-10'),
        status: 'ACTIVE',
      },
      {
        employeeId: 'EMP260000001',
        firstName: 'Emily',
        lastName: 'Davis',
        email: 'emily.davis@enterprise.com',
        phone: '+1 (555) 019-1122',
        role: roleDocs['Employee']._id,
        branch: b2._id,
        department: d4._id,
        designation: 'Financial Analyst',
        joiningDate: new Date('2023-02-01'),
        status: 'ACTIVE',
      },
      {
        // FUTURE JOINING DATE -> Status PRE_ACTIVATE until user manually activates on login!
        employeeId: 'EMP260000002',
        firstName: 'Isaac',
        lastName: 'Newton',
        email: 'isaac.newton@enterprise.com',
        phone: '+1 (555) 019-9988',
        role: roleDocs['Employee']._id,
        branch: b1._id,
        department: d1._id,
        designation: 'Lead Systems Architect',
        joiningDate: new Date('2026-09-01'), // Future Joining Date
        status: 'PRE_ACTIVATE',
      },
    ];

    const createdUsers = {};
    for (const uData of userSeedData) {
      const predefinedPass = genPass(uData.firstName, uData.phone);
      let user = await User.findOne({ email: uData.email });
      if (!user) {
        user = new User({
          ...uData,
          password: predefinedPass,
          isVerified: true,
          bloodGroup: 'O+',
          emergencyContact: '+1 (555) 999-0000',
          address: 'Corporate District, Suite 100',
        });
        await user.save();
        console.log(` -> Created user [${uData.email}] with Predefined Password: ${predefinedPass}`);
      }
      createdUsers[uData.email] = user;

      // Sync Employee record
      let employee = await Employee.findOne({ email: uData.email });
      if (!employee) {
        await Employee.create({
          employeeId: uData.employeeId,
          firstName: uData.firstName,
          lastName: uData.lastName,
          email: uData.email,
          phone: uData.phone,
          designation: uData.designation,
          branch: uData.branch,
          department: uData.department,
          joiningDate: uData.joiningDate,
          status: uData.status,
          lifecycleHistory: [
            {
              status: uData.status,
              date: new Date(),
              reason: uData.status === 'PRE_ACTIVATE' ? 'Awaiting user manual activation (Pre-Activate State)' : 'Initial Seeder Onboarding',
            },
          ],
        });
      }
    }

    // 5. Seed Visitors (Registered by Security Officer, Accepted by Admin)
    console.log('[Seeder] Seeding Visitor Records...');
    const secUser = createdUsers['sam.officer@enterprise.com'];

    const visitorSeed = [
      {
        visitorId: 'VIS-2026-0001',
        passNumber: 'PASS-88001',
        fullName: 'Michael Vance',
        company: 'Vance Tech Solutions',
        email: 'michael.vance@vancetech.io',
        phone: '+1 (555) 888-1111',
        hostEmployeeName: 'Emily Davis',
        purposeOfVisit: 'Vendor Security Compliance Audit',
        branch: b1._id,
        expectedEntryTime: new Date(),
        expiryTime: new Date(Date.now() + 8 * 3600 * 1000),
        status: 'REGISTERED', // Registered by Security, waiting for Admin acceptance
        registeredBy: secUser._id,
        badgeQrData: 'PASS-88001-QR',
      },
      {
        visitorId: 'VIS-2026-0002',
        passNumber: 'PASS-88002',
        fullName: 'Alice Johnson',
        company: 'Global Logistics Corp',
        email: 'alice.johnson@globallogistics.com',
        phone: '+1 (555) 888-2222',
        hostEmployeeName: 'Sarah Jenkins',
        purposeOfVisit: 'HR Partnership Review',
        branch: b1._id,
        expectedEntryTime: new Date(),
        expiryTime: new Date(Date.now() + 6 * 3600 * 1000),
        status: 'APPROVED', // Accepted by Admin
        registeredBy: secUser._id,
        badgeQrData: 'PASS-88002-QR',
      },
      {
        visitorId: 'VIS-2026-0003',
        passNumber: 'PASS-88003',
        fullName: 'Robert Sterling',
        company: 'Apex Security Inspection',
        email: 'robert.sterling@apexsec.com',
        phone: '+1 (555) 888-3333',
        hostEmployeeName: 'Sam Officer',
        purposeOfVisit: 'Gate Control Equipment Maintenance',
        branch: b1._id,
        expectedEntryTime: new Date(),
        expiryTime: new Date(Date.now() + 10 * 3600 * 1000),
        status: 'CHECKED_IN', // Checked-in at gate by Security
        registeredBy: secUser._id,
        badgeQrData: 'PASS-88003-QR',
        checkInTime: new Date(),
      },
    ];

    for (const v of visitorSeed) {
      await Visitor.findOneAndUpdate({ passNumber: v.passNumber }, v, { upsert: true, new: true });
    }

    // 6. Seed Physical ID Card Requests
    console.log('[Seeder] Seeding Physical ID Card Requests...');
    const empRecord = await Employee.findOne({ email: 'emily.davis@enterprise.com' });
    if (empRecord) {
      const existingCard = await IdCard.findOne({ employee: empRecord._id });
      if (!existingCard) {
        const idCard = await IdCard.create({
          cardId: `IDC-${empRecord.employeeId}-101`,
          employee: empRecord._id,
          version: 1,
          template: 'EXECUTIVE_CORPORATE',
          qrCodeData: `IDC-${empRecord.employeeId}-101-QR`,
          barcodeValue: `*${empRecord.employeeId}*`,
          issueDate: new Date(),
          expiryDate: new Date(Date.now() + 3 * 365 * 24 * 3600 * 1000),
          status: 'REQUESTED_PENDING_HR',
          approvalWorkflow: {
            hrApproval: { status: 'PENDING' },
            adminApproval: { status: 'PENDING' },
            printingStatus: { status: 'QUEUED' },
          },
        });

        await PrintQueue.create({
          jobId: 'PRN-99001',
          idCard: idCard._id,
          employee: empRecord._id,
          requestType: 'NEW_ISSUE',
          priority: 'HIGH',
          status: 'QUEUED',
        });
      }
    }

    console.log('[Seeder] Database seeding for all roles, fields, and workflows completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('[Seeder Error]:', error);
    process.exit(1);
  }
};

seedDatabase();
