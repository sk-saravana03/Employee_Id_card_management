/**
 * Enterprise Logger Utility
 */
const logger = {
  info: (msg, meta = {}) => {
    console.log(`[INFO] [${new Date().toISOString()}] ${msg}`, Object.keys(meta).length ? meta : '');
  },
  warn: (msg, meta = {}) => {
    console.warn(`[WARN] [${new Date().toISOString()}] ${msg}`, Object.keys(meta).length ? meta : '');
  },
  error: (msg, error = {}) => {
    console.error(`[ERROR] [${new Date().toISOString()}] ${msg}`, error?.stack || error);
  },
  audit: (action, userId, meta = {}) => {
    console.log(`[AUDIT] [${new Date().toISOString()}] Action: ${action} | User: ${userId}`, meta);
  }
};

export default logger;
