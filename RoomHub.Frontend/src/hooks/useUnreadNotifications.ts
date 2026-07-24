import { useEffect, useState, useCallback } from 'react';
import api from '../services/api';

/**
 * Polls the unread-notification count every 15s and refetches immediately whenever a
 * 'notification_changed' event is dispatched (e.g. after marking one as read).
 * Shared by OwnerLayout, TenantLayout, and Navbar, which previously each reimplemented this.
 *
 * @param enabled Pass `isAuthenticated` on pages reachable while logged out (e.g. Navbar) so it
 * doesn't poll a protected endpoint for anonymous visitors. Defaults to true for layouts that are
 * only ever rendered once a role-restricted section has already confirmed the user is logged in.
 */
export const useUnreadNotifications = (enabled: boolean = true) => {
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchUnreadCount = useCallback(async () => {
    if (!enabled) return;
    try {
      const res = await api.get('/notifications/unread-count');
      setUnreadCount(res.data.unreadCount);
    } catch (err) {
      console.error('Lỗi khi fetch unread count:', err);
    }
  }, [enabled]);

  useEffect(() => {
    if (!enabled) return;
    fetchUnreadCount();
    const handleNotificationChange = () => fetchUnreadCount();
    window.addEventListener('notification_changed', handleNotificationChange);
    const interval = setInterval(fetchUnreadCount, 15000);

    return () => {
      window.removeEventListener('notification_changed', handleNotificationChange);
      clearInterval(interval);
    };
  }, [enabled, fetchUnreadCount]);

  return { unreadCount, refetch: fetchUnreadCount };
};
