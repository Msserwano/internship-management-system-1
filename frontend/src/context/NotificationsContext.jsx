
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { notificationService } from "../api/services";
import { useAuth } from "./AuthContext";

const NotificationsContext = createContext(null);

export function NotificationsProvider({ children }) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const fetchNotifications = async (p = 1) => {
    if (!user) return setNotifications([]);
    setLoading(true);
    try {
      const res = await notificationService.getAll({ page: p, limit: 10 });
      const body = res.data || {};
      const raw = body.data || [];
      const items = raw.map((n) => {
        let title = n.type.replace(/_/g, ' ');
        let message = '';
        try {
          const p = typeof n.payload === 'string' ? JSON.parse(n.payload) : n.payload || {};
          if (n.type === 'application_submitted') {
            title = 'New application';
            message = `Application ${p.applicationId || ''} submitted`;
          } else if (n.type === 'application_assigned') {
            title = 'Assigned to you';
            message = `Application ${p.applicationId || ''} assigned to you`;
          } else {
            message = p.message || '';
          }
          return { ...n, payload: p, title, message };
        } catch (e) {
          return { ...n, title, message };
        }
      });
      if (p > 1) setNotifications((prev) => [...prev, ...items]);
      else setNotifications(items);
      setPage(body.page || p);
      setHasMore((body.count || 0) > ((body.page || p) * (body.limit || 10)));
    } catch (err) {
      console.error('[NOTIFICATIONS] fetch failed', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const iv = setInterval(fetchNotifications, 30000);
    return () => clearInterval(iv);

  }, [user]);

  const unread = useMemo(() => notifications.filter(n => !n.isRead).length, [notifications]);

  const markRead = async (id) => {
    try {
      await notificationService.markRead(id);
      setNotifications((prev) => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    } catch (err) {
      console.error('[NOTIFICATIONS] markRead failed', err);
    }
  };

  const markAllRead = async () => {
    try {
      if (notificationService.markAllRead) {
        await notificationService.markAllRead();
      } else {
        const unreadIds = notifications.filter(n => !n.isRead).map(n => n.id);
        await Promise.all(unreadIds.map(id => notificationService.markRead(id)));
      }
      setNotifications((prev) => prev.map(n => ({ ...n, isRead: true })));
    } catch (err) {
      console.error('[NOTIFICATIONS] markAllRead failed', err);
    }
  };

  const loadMore = async () => {
    if (!hasMore) return;
    const next = page + 1;
    await fetchNotifications(next);
  };

  return (
    <NotificationsContext.Provider value={{ notifications, loading, fetchNotifications, unread, markRead, markAllRead, loadMore, hasMore }}>
      {children}
    </NotificationsContext.Provider>
  );
}

export const useNotifications = () => {
  const ctx = useContext(NotificationsContext);
  if (!ctx) throw new Error('useNotifications must be used inside NotificationsProvider');
  return ctx;
};
