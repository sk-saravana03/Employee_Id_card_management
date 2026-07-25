import Notification from '../models/Notification.model.js';

/**
 * Creates and persists a system notification.
 *
 * @param {Object} param0
 * @param {string} [param0.recipient] - Optional specific user ObjectId
 * @param {string} [param0.targetRole] - Optional target role name (e.g. 'HR/Admin', 'Super Admin')
 * @param {string} param0.title - Notification title
 * @param {string} param0.message - Detailed notification message
 * @param {string} [param0.type] - Category type
 * @param {string} [param0.link] - Action link URL
 */
export const createNotification = async ({
  recipient = null,
  targetRole = '',
  title,
  message,
  type = 'SYSTEM',
  link = '/dashboard',
}) => {
  try {
    const notification = await Notification.create({
      recipient,
      targetRole,
      title,
      message,
      type,
      link,
    });
    console.log(`[Notification Service] Triggered notification [${type}]: ${title}`);
    return notification;
  } catch (error) {
    console.error('[Notification Service Error]:', error.message || error);
    return null;
  }
};
