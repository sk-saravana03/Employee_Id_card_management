/**
 * Dynamic Designation Catalog mapped by Department Name and Branch context.
 */

export const DESIGNATIONS_BY_DEPARTMENT = {
  // Information Technology & Software
  it: [
    'Software Engineer',
    'Senior Software Engineer',
    'Lead Systems Architect',
    'DevOps Specialist',
    'IT Support Specialist',
    'Database Administrator',
    'Cybersecurity Analyst',
    'IT Department Head',
    'CTO / Technical Director',
  ],
  tech: [
    'Software Engineer',
    'Senior Software Engineer',
    'Full Stack Developer',
    'Cloud Operations Engineer',
    'QA Automation Lead',
    'Systems Administrator',
  ],
  engineering: [
    'Systems Engineer',
    'Senior Hardware Engineer',
    'Infrastructure Architect',
    'Firmware Engineer',
    'Engineering Manager',
  ],

  // Human Resources & People Operations
  hr: [
    'HR Executive',
    'Senior HR Specialist',
    'Talent Acquisition Specialist',
    'HR Business Partner',
    'Payroll & Benefits Administrator',
    'HR Operations Manager',
    'Chief Human Resources Officer',
  ],
  human: [
    'HR Executive',
    'Senior HR Officer',
    'People & Culture Specialist',
    'Employee Relations Manager',
  ],

  // Security & Compliance
  security: [
    'Security Officer',
    'Senior Security Officer',
    'Access Control Specialist',
    'Surveillance Room Operator',
    'Safety & Compliance Inspector',
    'Chief Security Officer',
  ],
  guard: [
    'Security Guard',
    'Senior Gate Patrol',
    'Access Control Supervisor',
  ],

  // Printing & Hardware Operations
  print: [
    'ID Card Printing Operator',
    'Print Queue Supervisor',
    'Hardware Maintenance Specialist',
    'Card Personalization Technician',
    'Print Production Lead',
  ],
  operation: [
    'Operations Executive',
    'Operations Manager',
    'Logistics Coordinator',
    'Facilities Manager',
    'Process Improvement Specialist',
  ],

  // Finance & Accounting
  finance: [
    'Financial Analyst',
    'Senior Accountant',
    'Finance Manager',
    'Payroll Specialist',
    'Chief Financial Officer',
  ],
  accounting: [
    'Accounts Executive',
    'Audit Officer',
    'Taxation Specialist',
    'Accounts Manager',
  ],

  // Sales & Marketing
  sales: [
    'Sales Executive',
    'Account Executive',
    'Business Development Manager',
    'Regional Sales Lead',
  ],
  marketing: [
    'Marketing Specialist',
    'Digital Marketing Manager',
    'Brand Coordinator',
    'Communications Officer',
  ],

  // Administration & Executive
  admin: [
    'Administrative Officer',
    'Executive Assistant',
    'Office Manager',
    'Facilities Administrator',
  ],
  management: [
    'General Manager',
    'Branch Operations Manager',
    'Director of Operations',
    'Managing Director',
  ],

  // Default fallback list
  default: [
    'Staff Member',
    'Team Member',
    'Assistant',
    'Associate',
    'Senior Associate',
    'Team Lead',
    'Manager',
    'Director',
    'Consultant',
  ],
};

/**
 * Returns dynamic designation options based on department name and branch name.
 *
 * @param {string} departmentName
 * @param {string} branchName
 * @returns {Array<string>} List of available designations
 */
export const getDynamicDesignations = (departmentName = '', branchName = '') => {
  const deptKey = (departmentName || '').toLowerCase().trim();
  const branchKey = (branchName || '').toLowerCase().trim();

  let matchedDesignations = [];

  // Match department key
  for (const [key, options] of Object.entries(DESIGNATIONS_BY_DEPARTMENT)) {
    if (key === 'default') continue;
    if (deptKey.includes(key)) {
      matchedDesignations = [...options];
      break;
    }
  }

  // Fallback to default if no department match
  if (matchedDesignations.length === 0) {
    matchedDesignations = [...DESIGNATIONS_BY_DEPARTMENT.default];
  }

  // Supplement with Branch context designations if applicable
  if (branchKey.includes('hq') || branchKey.includes('headquarter') || branchKey.includes('corporate')) {
    if (!matchedDesignations.includes('Corporate Executive')) {
      matchedDesignations.unshift('Corporate Executive', 'VP of Operations');
    }
  } else if (branchKey) {
    if (!matchedDesignations.includes('Branch Operations Supervisor')) {
      matchedDesignations.push('Branch Operations Supervisor', 'Site Representative');
    }
  }

  return Array.from(new Set(matchedDesignations));
};
