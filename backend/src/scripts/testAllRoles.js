import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../../.env') });

const API_BASE = 'http://localhost:5000/api/v1';

const testAccounts = [
  { role: 'Super Admin', email: 'admin@enterprise.com', pass: 'Admin@123456', expectedStatus: 200 },
  { role: 'HR/Admin', email: 'sarah.jenkins@enterprise.com', pass: 'Sara2834', expectedStatus: 200 },
  { role: 'Printer Operator', email: 'patrick.miller@enterprise.com', pass: 'Patr8765', expectedStatus: 200 },
  { role: 'Security Officer', email: 'sam.officer@enterprise.com', pass: 'Samu4321', expectedStatus: 200 },
  { role: 'Employee (Active)', email: 'emily.davis@enterprise.com', pass: 'Emil1122', expectedStatus: 200 },
  { role: 'Employee (Future Joining / Inactive)', email: 'isaac.newton@enterprise.com', pass: 'Isaa9988', expectedStatus: 403 },
];

async function loginUser(email, password) {
  try {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const cookieHeader = res.headers.get('set-cookie');
    const data = await res.json();
    const token = data?.data?.accessToken || data?.accessToken;
    return { status: res.status, data, cookieHeader, token };
  } catch (err) {
    return { status: 500, error: err.message };
  }
}

async function fetchWithAuth(endpoint, method = 'GET', token = '', cookieHeader = '', body = null) {
  try {
    const headers = {
      'Content-Type': 'application/json',
    };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    if (cookieHeader) headers['Cookie'] = cookieHeader;

    const options = { method, headers };
    if (body) options.body = JSON.stringify(body);

    const res = await fetch(`${API_BASE}${endpoint}`, options);
    const data = await res.json();
    return { status: res.status, data };
  } catch (err) {
    return { status: 500, error: err.message };
  }
}

async function runComprehensiveRoleTests() {
  console.log('\n================================================================');
  console.log('       ENTERPRISE ID SYSTEM - COMPREHENSIVE AUTOMATED ROLE TESTS');
  console.log('================================================================\n');

  const results = [];

  // 1. Test Authentication & Future Joining Date Restrictions
  console.log('1. TESTING AUTHENTICATION & JOINING DATE LOCK FOR ALL ACCOUNTS:');
  console.log('----------------------------------------------------------------');

  const tokens = {};
  const cookies = {};
  for (const acc of testAccounts) {
    const loginRes = await loginUser(acc.email, acc.pass);
    const passed = loginRes.status === acc.expectedStatus;

    console.log(
      `[${passed ? 'PASS' : 'FAIL'}] ${acc.role.padEnd(38)} | Login Status: ${loginRes.status} (Expected ${acc.expectedStatus})`
    );

    if (!passed && acc.expectedStatus === 403) {
      console.log(`       -> Lock Reason: ${loginRes.data?.message || 'Access Denied'}`);
    } else if (!passed) {
      console.log(`       -> Fail Details: ${loginRes.data?.message}`);
    }

    if (loginRes.status === 200) {
      tokens[acc.role] = loginRes.token;
      cookies[acc.role] = loginRes.cookieHeader;
    }

    results.push({
      category: 'Authentication',
      role: acc.role,
      action: 'Login & Joining Lock Check',
      status: passed ? 'PASSED' : 'FAILED',
    });
  }

  // 2. Test Module Endpoint Access Control Across Roles
  console.log('\n2. TESTING RBAC MODULE AUTHORIZATION MATRIX:');
  console.log('----------------------------------------------------------------');

  const moduleTests = [
    { module: 'User Accounts Governance', endpoint: '/users', allowedRoles: ['Super Admin', 'HR/Admin'] },
    { module: 'Branches Governance', endpoint: '/branches', allowedRoles: ['Super Admin', 'HR/Admin', 'Printer Operator', 'Security Officer'] },
    { module: 'Departments Governance', endpoint: '/departments', allowedRoles: ['Super Admin', 'HR/Admin', 'Printer Operator', 'Security Officer'] },
    { module: 'Identity Mgmt & ID Cards', endpoint: '/id-cards', allowedRoles: ['Super Admin', 'HR/Admin', 'Printer Operator', 'Security Officer', 'Employee (Active)'] },
    { module: 'Notifications Center', endpoint: '/notifications', allowedRoles: ['Super Admin', 'HR/Admin', 'Printer Operator', 'Security Officer', 'Employee (Active)'] },
  ];

  for (const t of moduleTests) {
    console.log(`\n  Checking Module: ${t.module} (${t.endpoint})`);
    for (const role of ['Super Admin', 'HR/Admin', 'Printer Operator', 'Security Officer', 'Employee (Active)']) {
      const token = tokens[role];
      const cookie = cookies[role];
      if (!token) continue;

      const res = await fetchWithAuth(t.endpoint, 'GET', token, cookie);
      const isAllowed = t.allowedRoles.includes(role);
      const passed = isAllowed ? res.status === 200 : res.status === 403;

      console.log(
        `   -> [${passed ? 'PASS' : 'FAIL'}] ${role.padEnd(22)} | API Status: ${res.status} | Access Allowed: ${isAllowed}`
      );

      results.push({
        category: 'RBAC Authorization',
        role,
        action: `Access ${t.module}`,
        status: passed ? 'PASSED' : 'FAILED',
      });
    }
  }

  // 3. Test AES-256 Profile Update for Logged-In User
  console.log('\n3. TESTING AES-256 ENCRYPTED PERSONAL PROFILE UPDATE:');
  console.log('----------------------------------------------------------------');

  const empToken = tokens['Employee (Active)'];
  const empCookie = cookies['Employee (Active)'];
  if (empToken) {
    const profileUpdateRes = await fetchWithAuth('/auth/profile', 'PUT', empToken, empCookie, {
      phone: '+1 (555) 777-9999',
      nationalId: 'SSN-999-88-7777',
      emergencyContact: '+1 (555) 000-1111',
      address: '777 Tech Innovation Way',
      bloodGroup: 'O+',
    });

    const passed = profileUpdateRes.status === 200;
    console.log(
      `[${passed ? 'PASS' : 'FAIL'}] Employee AES-256 Profile Update | Status: ${profileUpdateRes.status}`
    );
    if (passed) {
      console.log(`       -> Result Message: ${profileUpdateRes.data?.message}`);
    } else {
      console.log(`       -> Error Details: ${profileUpdateRes.data?.message}`);
    }

    results.push({
      category: 'Security & Encryption',
      role: 'Employee (Active)',
      action: 'AES-256 Sensitive Data Encryption',
      status: passed ? 'PASSED' : 'FAILED',
    });
  }

  // 4. Summary Matrix
  console.log('\n================================================================');
  console.log('                  AUTOMATED TEST SUITE SUMMARY                  ');
  console.log('================================================================');

  const totalPassed = results.filter((r) => r.status === 'PASSED').length;
  const totalFailed = results.filter((r) => r.status === 'FAILED').length;

  console.log(`Total Scenarios Executed: ${results.length}`);
  console.log(`Passed: ${totalPassed}  |  Failed: ${totalFailed}`);
  console.log('----------------------------------------------------------------\n');
}

runComprehensiveRoleTests();
