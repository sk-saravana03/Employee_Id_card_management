import Employee from '../models/Employee.model.js';

/**
 * Calculates correct lifecycle status based on dates
 */
export const calculateEmployeeStatus = (employee) => {
  const now = new Date();
  const joining = employee.joiningDate ? new Date(employee.joiningDate) : null;
  const termination = employee.terminationDate ? new Date(employee.terminationDate) : null;
  const noticeDays = employee.noticePeriodDays || 30;

  // Don't auto-modify ARCHIVED manually archived records
  if (employee.status === 'ARCHIVED') {
    return 'ARCHIVED';
  }

  // 1. Termination checks
  if (termination && !isNaN(termination.getTime())) {
    if (now >= termination) {
      return 'AUTO_DEACTIVATED';
    }
    const msToTermination = termination.getTime() - now.getTime();
    const daysToTermination = msToTermination / (1000 * 60 * 60 * 24);
    if (daysToTermination <= noticeDays) {
      return 'NOTICE_PERIOD';
    }
  }

  // 2. Joining checks
  if (joining && !isNaN(joining.getTime())) {
    if (now >= joining) {
      return 'ACTIVE';
    } else {
      return 'WAITING_FOR_JOINING';
    }
  }

  return employee.status || 'RECRUITMENT';
};

/**
 * Process lifecycle updates across active database employees
 */
export const syncEmployeeLifecycles = async () => {
  try {
    const employees = await Employee.find({ status: { $ne: 'ARCHIVED' } });
    let updatedCount = 0;

    for (const emp of employees) {
      const calculated = calculateEmployeeStatus(emp);
      if (calculated !== emp.status) {
        emp.status = calculated;
        emp.lifecycleHistory.push({
          status: calculated,
          date: new Date(),
          reason: `Automated lifecycle transition based on schedule dates`,
        });
        await emp.save();
        updatedCount++;
      }
    }
    return { success: true, updatedCount };
  } catch (error) {
    console.error('[Lifecycle Sync Error]:', error.message);
    return { success: false, error: error.message };
  }
};
