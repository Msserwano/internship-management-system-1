// src/context/NotificationsContext.jsx
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { notificationService } from "../api/services";
import { useAuth } from "./AuthContext";

const NotificationsContext = createContext(null);

export function NotificationsProvider({ children }) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchNotifications = async () => {
    if (!user) return setNotifications([]);
    setLoading(true);
    try {
      const res = await notificationService.getAll();
      setNotifications(res.data || []);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      const unreadIds = notifications.filter(n => !n.isRead).map(n => n.id);
      await Promise.all(unreadIds.map(id => notificationService.markRead(id)));
      setNotifications((prev) => prev.map(n => ({ ...n, isRead: true })));
    } catch (err) {
      console.error('[NOTIFICATIONS] markAllRead failed', err);
    }
  };

  return (
    <NotificationsContext.Provider value={{ notifications, loading, fetchNotifications, unread, markRead, markAllRead }}>
      {children}
    </NotificationsContext.Provider>
  );
}

export const useNotifications = () => {
  const ctx = useContext(NotificationsContext);
  if (!ctx) throw new Error('useNotifications must be used inside NotificationsProvider');
  return ctx;
};
