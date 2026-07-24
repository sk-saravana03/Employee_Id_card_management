import AuditLog from '../models/AuditLog.model.js';

/**
 * Creates audit log records for enterprise compliance.
 */
const recordAuditLog = async ({ userId, action, module, details = {}, req }) => {
  try {
    const ipAddress = req?.headers['x-forwarded-for'] || req?.socket?.remoteAddress || '127.0.0.1';
    const userAgent = req?.headers['user-agent'] || 'System Process';

    await AuditLog.create({
      userId: userId || null,
      action,
      module: module || 'AUTH',
      details,
      ipAddress,
      userAgent,
      timestamp: new Date(),
    });
  } catch (error) {
    console.error('[Audit Logger Error] Failed to write audit log:', error.message);
  }
};

export { recordAuditLog };
