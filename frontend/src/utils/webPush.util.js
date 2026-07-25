/**
 * Native Browser Web Push Notification Engine (HTML5 Notification API)
 * Displays native OS system desktop notifications even when browser tab is minimized or backgrounded.
 */

export const requestNotificationPermission = async () => {
  if (!('Notification' in window)) {
    console.warn('[Web Push] Browser does not support desktop notifications.');
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  return false;
};

export const sendDesktopPushNotification = (title, body, link = '/') => {
  if (!('Notification' in window)) return;

  if (Notification.permission === 'granted') {
    try {
      const options = {
        body,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        vibrate: [200, 100, 200],
        tag: 'enterprise-security-notification',
        renotify: true,
        requireInteraction: false,
      };

      const notification = new Notification(title, options);

      notification.onclick = (event) => {
        event.preventDefault();
        window.focus();
        if (link) {
          window.location.href = link;
        }
        notification.close();
      };
    } catch (err) {
      console.error('[Web Push Error]:', err);
    }
  }
};
