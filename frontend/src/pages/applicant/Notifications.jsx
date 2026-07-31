
import { useState } from "react";
import Breadcrumbs from "../../components/layout/Breadcrumbs";
import Button from "../../components/ui/Button";
import EmptyState from "../../components/ui/EmptyState";
import { useNotifications } from "../../context/NotificationsContext";
import { fRelative } from "../../utils/formatters";
import { Bell, Check, CheckCheck, Mail, MessageSquare, Smartphone } from "lucide-react";

const Notifications = () => {
  const { notifications, unread, markRead, markAllRead } = useNotifications();
  const [filter, setFilter] = useState("all");

  const filteredNotifs = notifications.filter(n => {
    if (filter === "unread") return !n.read;
    return true;
  });

  return (
    <div className="page-container max-w-4xl mx-auto space-y-6">
      <Breadcrumbs />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
            Notification Center {unread > 0 && <span className="badge badge-rejected text-xs">{unread} Unread</span>}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            Stay updated with your applications, schedules, and KCCA announcements.
          </p>
        </div>

        {unread > 0 && (
          <Button variant="outline" size="sm" onClick={markAllRead} icon={CheckCheck}>
            Mark All Read
          </Button>
        )}
      </div>

      {}
      <div className="flex gap-2 border-b border-slate-200 dark:border-slate-700 pb-3">
        {["all", "unread"].map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold capitalize transition ${
              filter === tab
                ? "bg-primary-500 text-white"
                : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {}
      {filteredNotifs.length > 0 ? (
        <div className="card divide-y divide-slate-100 dark:divide-slate-700">
          {filteredNotifs.map((n) => (
            <div
              key={n.id}
              onClick={() => markRead(n.id)}
              className={`p-5 flex items-start gap-4 cursor-pointer transition ${
                !n.read ? "bg-primary-50/40 dark:bg-primary-900/10" : "hover:bg-slate-50 dark:hover:bg-slate-700/30"
              }`}
            >
              <div className={`p-2.5 rounded-xl flex-shrink-0 ${
                n.type === "success" ? "bg-green-100 text-accent-500" :
                n.type === "warning" ? "bg-amber-100 text-warning" : "bg-blue-100 text-primary-500"
              }`}>
                <Bell className="w-5 h-5" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <h4 className="font-bold text-sm text-slate-800 dark:text-white">{n.title}</h4>
                  <span className="text-[11px] text-slate-400">{fRelative(n.createdAt)}</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{n.message}</p>

                {}
                <div className="flex items-center gap-3 mt-3 text-[10px] text-slate-400">
                  <span className="flex items-center gap-1"><Mail className="w-3 h-3"/> Sent to Email</span>
                  <span className="flex items-center gap-1"><Smartphone className="w-3 h-3"/> Sent via SMS</span>
                </div>
              </div>

              {!n.read && (
                <span className="w-2.5 h-2.5 rounded-full bg-primary-500 flex-shrink-0 mt-2" title="Unread" />
              )}
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Bell}
          title="No Notifications"
          description="You are all caught up! There are no notifications to display."
        />
      )}
    </div>
  );
};

export default Notifications;
