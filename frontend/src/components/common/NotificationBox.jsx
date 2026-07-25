import React, { useState, useEffect, useRef } from 'react';
import { Bell, CheckCheck, ShieldAlert, CreditCard, UserPlus, Printer, Info, ExternalLink, Monitor } from 'lucide-react';
import toast from 'react-hot-toast';
import { notificationService } from '../../services/notification.service';
import { requestNotificationPermission, sendDesktopPushNotification } from '../../utils/webPush.util';

export const NotificationBox = ({ isWidget = false }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [hasDesktopPermission, setHasDesktopPermission] = useState(false);
  const notifiedIdsRef = useRef(new Set());

  const fetchNotifications = async (showPush = false) => {
    try {
      const res = await notificationService.getNotifications();
      if (res?.data) {
        const newNotifs = res.data.notifications || [];
        const newUnread = res.data.unreadCount || 0;

        // Check for new unread notifications that haven't been popped up yet
        if (showPush) {
          const freshUnreadNotifs = newNotifs.filter(
            (n) => !n.isRead && !notifiedIdsRef.current.has(n._id)
          );

          if (freshUnreadNotifs.length > 0) {
            freshUnreadNotifs.forEach((n) => {
              notifiedIdsRef.current.add(n._id);

              // 1. In-App Toast
              toast((t) => (
                <div className="flex items-start gap-2 text-xs font-medium">
                  <Bell className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-slate-900">{n.title}</p>
                    <p className="text-slate-600 mt-0.5">{n.message}</p>
                  </div>
                </div>
              ), { duration: 5000 });

              // 2. Native OS Desktop System Push
              sendDesktopPushNotification(n.title, n.message, n.link || '/');
            });
          }
        } else {
          // Initialize already existing notification IDs into set so we don't spam on first load
          newNotifs.forEach((n) => notifiedIdsRef.current.add(n._id));
        }

        setNotifications(newNotifs);
        setUnreadCount(newUnread);
      }
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    }
  };

  useEffect(() => {
    // Check & request OS desktop notification permission
    requestNotificationPermission().then((granted) => {
      setHasDesktopPermission(granted);
    });

    fetchNotifications(false);
    // Poll for background push notifications every 10 seconds
    const interval = setInterval(() => {
      fetchNotifications(true);
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleEnableDesktop = async () => {
    const granted = await requestNotificationPermission();
    setHasDesktopPermission(granted);
    if (granted) {
      toast.success('Native Desktop & Background Push Notifications Enabled!');
      sendDesktopPushNotification('Desktop Notifications Enabled!', 'You will now receive real-time OS alerts even when tab is minimized.');
    } else {
      toast.error('Desktop Push Notifications blocked by browser.');
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await notificationService.markAsRead(id);
      fetchNotifications(false);
    } catch (err) {
      toast.error('Failed to update notification.');
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllAsRead();
      toast.success('All notifications marked as read.');
      fetchNotifications(false);
    } catch (err) {
      toast.error('Failed to mark notifications read.');
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'ID_CARD_REQUEST':
        return <CreditCard className="w-4 h-4 text-emerald-600" />;
      case 'HR_APPROVAL':
        return <ShieldAlert className="w-4 h-4 text-blue-600" />;
      case 'ADMIN_APPROVAL':
        return <CheckCheck className="w-4 h-4 text-indigo-600" />;
      case 'PRINT_COMPLETED':
        return <Printer className="w-4 h-4 text-purple-600" />;
      case 'USER_PROVISIONED':
        return <UserPlus className="w-4 h-4 text-emerald-600" />;
      default:
        return <Info className="w-4 h-4 text-slate-500" />;
    }
  };

  if (isWidget) {
    // Embedded Widget Version for Dashboard
    return (
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50/60">
          <div className="flex items-center gap-2">
            <div className="relative">
              <Bell className="w-5 h-5 text-emerald-600" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-rose-500 rounded-full animate-ping" />
              )}
            </div>
            <h3 className="text-sm font-bold text-slate-900">Live Module Notifications</h3>
            {unreadCount > 0 && (
              <span className="px-2 py-0.5 text-[10px] font-bold text-white bg-rose-500 rounded-full">
                {unreadCount} New
              </span>
            )}
          </div>
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 transition-colors"
            >
              Mark all read
            </button>
          )}
        </div>

        <div className="divide-y divide-slate-100 max-h-[340px] overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400">
              No recent notifications.
            </div>
          ) : (
            notifications.map((n) => (
              <div
                key={n._id}
                onClick={() => !n.isRead && handleMarkAsRead(n._id)}
                className={`p-4 transition-colors cursor-pointer flex items-start gap-3 ${
                  n.isRead ? 'bg-white opacity-75' : 'bg-emerald-50/30 font-medium'
                }`}
              >
                <div className="p-2 rounded-lg bg-slate-100 shrink-0 mt-0.5">
                  {getIcon(n.type)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-bold text-slate-900 truncate">{n.title}</p>
                    <span className="text-[10px] text-slate-400 shrink-0">
                      {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1 line-clamp-2">{n.message}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    );
  }

  // Header Dropdown Version
  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-white" />
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 overflow-hidden animate-fade-in">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50/70">
            <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <Bell className="w-4 h-4 text-emerald-600" /> Notifications ({unreadCount})
            </span>
            <div className="flex items-center gap-2">
              {!hasDesktopPermission && (
                <button
                  onClick={handleEnableDesktop}
                  className="text-[10px] font-bold text-indigo-600 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded flex items-center gap-1 hover:bg-indigo-100"
                  title="Enable OS Desktop Push Alerts"
                >
                  <Monitor className="w-3 h-3" /> Enable OS Push
                </button>
              )}
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  className="text-[11px] font-semibold text-emerald-700 hover:underline"
                >
                  Mark all read
                </button>
              )}
            </div>
          </div>

          <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400">
                No notifications right now.
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n._id}
                  onClick={() => {
                    handleMarkAsRead(n._id);
                    setIsOpen(false);
                  }}
                  className={`p-3.5 flex items-start gap-3 cursor-pointer hover:bg-slate-50 transition-colors ${
                    !n.isRead ? 'bg-emerald-50/20' : ''
                  }`}
                >
                  <div className="p-1.5 rounded-lg bg-slate-100 shrink-0 mt-0.5">
                    {getIcon(n.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-slate-900">{n.title}</p>
                    <p className="text-[11px] text-slate-600 mt-0.5 line-clamp-2">{n.message}</p>
                    <span className="text-[10px] text-slate-400 mt-1 block">
                      {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBox;
