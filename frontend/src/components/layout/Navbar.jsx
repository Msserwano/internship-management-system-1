// src/components/layout/Navbar.jsx
import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, ChevronDown, Menu, Search, LogOut, User, Settings } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useNotifications } from "../../context/NotificationsContext";
import Avatar from "../ui/Avatar";
import { fRelative } from "../../utils/formatters";
import { cn } from "../../utils/cn";

const NotifIcon = { success:"bg-green-100 text-green-600", info:"bg-blue-100 text-blue-600", warning:"bg-yellow-100 text-yellow-600", error:"bg-red-100 text-red-600" };
const typeMap = { application_submitted: 'info', application_assigned: 'success' };

const Navbar = ({ collapsed, setMobileOpen }) => {
  const { user, logout } = useAuth();
  const { notifications, unread, markRead, markAllRead } = useNotifications();
  const navigate = useNavigate();
  const [notifOpen, setNotifOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const notifRef = useRef(null);
  const userRef  = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
      if (userRef.current  && !userRef.current.contains(e.target))  setUserOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const roleLabels = { applicant:"Applicant", hr:"HR Officer", admin:"System Admin", supervisor:"Supervisor" };
  const rolePrefix = { applicant:"/applicant", hr:"/hr", admin:"/admin", supervisor:"/supervisor" };

  return (
    <header
      className={cn(
        "fixed top-0 right-0 z-20 h-16 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-center px-4 gap-3 shadow-sm transition-all duration-300",
        collapsed ? "left-[72px]" : "left-[260px]",
        "left-0 md:left-auto",
        collapsed ? "md:left-[72px]" : "md:left-[260px]"
      )}
    >
      <button
        onClick={() => setMobileOpen(true)}
        className="md:hidden p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition"
      >
        <Menu className="w-5 h-5 text-slate-600 dark:text-slate-300" />
      </button>

      {/* Search */}
      <div className="hidden sm:flex items-center gap-2 bg-slate-100 dark:bg-slate-700 rounded-xl px-3 py-2 flex-1 max-w-xs">
        <Search className="w-4 h-4 text-slate-400 flex-shrink-0" />
        <input
          placeholder="Search internships, applications…"
          className="bg-transparent text-sm text-slate-700 dark:text-slate-200 placeholder-slate-400 outline-none flex-1 min-w-0"
        />
      </div>

      <div className="ml-auto flex items-center gap-2">
        {/* Notifications */}
        <div ref={notifRef} className="relative">
          <button
            onClick={() => { setNotifOpen(!notifOpen); setUserOpen(false); }}
            className="relative p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition"
          >
            <Bell className="w-5 h-5 text-slate-600 dark:text-slate-300" />
            {unread > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-danger rounded-full text-white text-[10px] font-bold flex items-center justify-center">
                {unread > 9 ? "9+" : unread}
              </span>
            )}
          </button>
          <AnimatePresence>
            {notifOpen && (
              <motion.div
                initial={{ opacity:0, y:8, scale:.97 }} animate={{ opacity:1, y:0, scale:1 }} exit={{ opacity:0, y:8, scale:.97 }}
                className="absolute right-0 top-12 w-80 bg-white dark:bg-slate-800 rounded-2xl shadow-card-lg border border-slate-100 dark:border-slate-700 overflow-hidden z-50"
              >
                <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-700">
                  <h4 className="font-semibold text-slate-800 dark:text-white text-sm">Notifications {unread>0 && <span className="ml-1 text-xs bg-danger text-white px-1.5 rounded-full">{unread}</span>}</h4>
                  {unread > 0 && <button onClick={markAllRead} className="text-xs text-primary-500 hover:underline">Mark all read</button>}
                </div>
                <div className="max-h-72 overflow-y-auto divide-y divide-slate-50 dark:divide-slate-700">
                  {notifications.slice(0,6).map(n => {
                    const kind = typeMap[n.type] || 'info';
                    return (
                      <div key={n.id} onClick={() => markRead(n.id)}
                        className={cn("px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-700/50 cursor-pointer transition", !n.isRead && "bg-primary-50/50 dark:bg-primary-900/10")}
                      >
                        <div className="flex items-start gap-2.5">
                          <div className={cn("w-8 h-8 rounded-full flex items-center justify-center text-sm flex-shrink-0", NotifIcon[kind])}>{n.type === 'application_assigned' ? 'A' : 'N'}</div>
                          <div className="min-w-0">
                            <p className="text-xs font-semibold text-slate-700 dark:text-slate-200">{n.title || n.type.replace(/_/g,' ')}</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-0.5">{n.message || (n.payload?.applicationId ? `Application ${n.payload.applicationId}` : '')}</p>
                            <p className="text-[10px] text-slate-400 mt-1">{fRelative(n.createdAt)}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="px-4 py-2.5 border-t border-slate-100 dark:border-slate-700 text-center">
                  <Link to={`${rolePrefix[user?.role]}/notifications`} onClick={() => setNotifOpen(false)} className="text-xs text-primary-500 hover:underline">
                    View all notifications
                  </Link>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* User menu */}
        <div ref={userRef} className="relative">
          <button
            onClick={() => { setUserOpen(!userOpen); setNotifOpen(false); }}
            className="flex items-center gap-2 px-2 py-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition"
          >
            <Avatar name={user?.name} size="sm" />
            <div className="hidden sm:block text-left">
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 leading-tight">{user?.name}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">{roleLabels[user?.role]}</p>
            </div>
            <ChevronDown className="w-4 h-4 text-slate-400 hidden sm:block" />
          </button>
          <AnimatePresence>
            {userOpen && (
              <motion.div
                initial={{ opacity:0, y:8, scale:.97 }} animate={{ opacity:1, y:0, scale:1 }} exit={{ opacity:0, y:8, scale:.97 }}
                className="absolute right-0 top-12 w-56 bg-white dark:bg-slate-800 rounded-2xl shadow-card-lg border border-slate-100 dark:border-slate-700 overflow-hidden z-50"
              >
                <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700">
                  <p className="text-sm font-semibold text-slate-800 dark:text-white">{user?.name}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{user?.email}</p>
                </div>
                <div className="py-1">
                  <Link to={`${rolePrefix[user?.role]}/profile`} onClick={() => setUserOpen(false)}
                    className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition">
                    <User className="w-4 h-4" /> My Profile
                  </Link>
                  <Link to={`${rolePrefix[user?.role]}/settings`} onClick={() => setUserOpen(false)}
                    className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition">
                    <Settings className="w-4 h-4" /> Settings
                  </Link>
                  <button onClick={() => { logout(); navigate("/login"); }}
                    className="flex items-center gap-2 px-4 py-2.5 text-sm text-danger hover:bg-red-50 dark:hover:bg-red-900/20 w-full transition">
                    <LogOut className="w-4 h-4" /> Logout
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
};
export default Navbar;
