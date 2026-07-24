import Session from '../models/Session.model.js';

/**
 * Session verification middleware checking session active status and timeout inactivity.
 */
const verifySession = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Unauthenticated.' });
    }

    const refreshToken = req.cookies?.refreshToken;
    const timeoutMinutes = parseInt(process.env.SESSION_TIMEOUT_MINUTES || '30', 10);

    // Look up user's active session
    const activeSession = await Session.findOne({
      user: req.user._id,
      isActive: true,
    }).sort({ updatedAt: -1 });

    if (!activeSession) {
      return res.status(401).json({
        success: false,
        message: 'Session has been invalidated or logged out elsewhere.',
        code: 'SESSION_INVALIDATED',
      });
    }

    // Check Inactivity Timeout
    const lastActive = new Date(activeSession.lastActiveAt).getTime();
    const now = Date.now();
    const elapsedMinutes = (now - lastActive) / (1000 * 60);

    if (elapsedMinutes > timeoutMinutes) {
      activeSession.isActive = false;
      await activeSession.save();

      return res.status(401).json({
        success: false,
        message: `Session timed out due to ${timeoutMinutes} minutes of inactivity.`,
        code: 'SESSION_TIMEOUT',
      });
    }

    // Update lastActiveAt heartbeat
    activeSession.lastActiveAt = new Date();
    await activeSession.save();

    req.session = activeSession;
    next();
  } catch (error) {
    console.error('[Session Middleware Error]:', error.message);
    next();
  }
};

export { verifySession };
