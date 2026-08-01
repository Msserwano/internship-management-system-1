
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { notificationService } from "../api/services";
import { useAuth } from "./AuthContext";
import { subscribeDataChange } from "../utils/eventBus";

const NotificationsContext = createContext(null);

export function NotificationsProvider({ children }) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading]   = useState(false);
  const [page, setPage]         = useState(1);
  const [hasMore, setHasMore]   = useState(true);

  // Normalise a raw notification row into a consistent shape
  const normalise = (n) => {
    let title   = (n.type || "").replace(/_/g, " ");
    let message = "";
    let payload = n.payload;

    try {
      if (typeof payload === "string") payload = JSON.parse(payload);
      payload = payload || {};

      if (n.type === "application_submitted") {
        title   = "New Application Received";
        message = `Application ${payload.applicationId || ""} for ${payload.title || "a role"} has been submitted by ${payload.applicantName || "an applicant"}.`;
      } else if (n.type === "application_assigned") {
        title   = "Application Assigned to You";
        message = `Application ${payload.applicationId || ""} has been assigned to you for review.`;
      } else if (n.type === "application_accepted") {
        title   = "🎉 CONGRATULATIONS! Internship Offer";
        message = payload.message || `Your application for ${payload.internshipTitle || "an internship"} has been ACCEPTED!`;
      } else if (n.type === "application_rejected") {
        title   = "Application Update";
        message = payload.message || `Your application status has been updated.`;
      } else if (n.type === "status_updated") {
        title   = "Application Status Updated";
        message = payload.message || `Your application status has been updated to ${payload.status || "a new status"}.`;
      } else if (n.type === "interview_accepted") {
        title   = "Interview Confirmed";
        message = payload.message || `${payload.applicantName || "An applicant"} has accepted their interview invitation.`;
      } else if (n.type === "interview_declined") {
        title   = "Interview Declined";
        message = payload.message || `${payload.applicantName || "An applicant"} has declined their interview invitation.`;
      } else {
        message = payload.message || "";
      }
    } catch {
      payload = {};
    }

    return { ...n, payload, title, message };
  };

  // Stable fetch function wrapped in useCallback to prevent stale closures in setInterval
  const fetchNotifications = useCallback(async (p = 1) => {
    if (!user) {
      setNotifications([]);
      return;
    }
    setLoading(true);
    try {
      const res  = await notificationService.getAll({ page: p, limit: 20 });
      const body = res.data || {};
      const raw  = body.data || [];
      const items = raw.map(normalise);

      if (p > 1) {
        setNotifications((prev) => [...prev, ...items]);
      } else {
        setNotifications(items);
      }
      setPage(body.page || p);
      setHasMore((body.count || 0) > (body.page || p) * (body.limit || 20));
    } catch (err) {
      console.error("[NOTIFICATIONS] fetch failed:", err.message || err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Fetch on mount and when user changes; poll every 30 s for new notifications
  useEffect(() => {
    fetchNotifications(1);
    const interval = setInterval(() => fetchNotifications(1), 30_000);
    const unsubscribe = subscribeDataChange(() => {
      fetchNotifications(1);
    });
    return () => {
      clearInterval(interval);
      unsubscribe();
    };
  }, [fetchNotifications]);

  // Derived unread count — based on the correct field name from the API
  const unread = useMemo(() => notifications.filter((n) => !n.isRead).length, [notifications]);

  const markRead = useCallback(async (id) => {
    try {
      await notificationService.markRead(id);
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
    } catch (err) {
      console.error("[NOTIFICATIONS] markRead failed:", err.message || err);
    }
  }, []);

  const markAllRead = useCallback(async () => {
    try {
      await notificationService.markAllRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (err) {
      console.error("[NOTIFICATIONS] markAllRead failed:", err.message || err);
    }
  }, []);

  const loadMore = useCallback(async () => {
    if (!hasMore || loading) return;
    await fetchNotifications(page + 1);
  }, [hasMore, loading, page, fetchNotifications]);

  return (
    <NotificationsContext.Provider
      value={{ notifications, loading, fetchNotifications, unread, markRead, markAllRead, loadMore, hasMore }}
    >
      {children}
    </NotificationsContext.Provider>
  );
}

export const useNotifications = () => {
  const ctx = useContext(NotificationsContext);
  if (!ctx) throw new Error("useNotifications must be used inside NotificationsProvider");
  return ctx;
};
