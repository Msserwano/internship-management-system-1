
import { NavLink, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { useNotifications } from "../../context/NotificationsContext";
import Avatar from "../ui/Avatar";
import {
  LayoutDashboard, Briefcase, FileText, Calendar, FolderOpen,
  MessageSquare, User, Settings, LogOut, ChevronLeft, ChevronRight,
  Building2, Users, BarChart3, ClipboardList, Shield, ScrollText,
  Database, Bell, Sun, Moon, X,
} from "lucide-react";
import { cn } from "../../utils/cn";
import { useState } from "react";

const APPLICANT_NAV = [
  { label: "Dashboard",            icon: LayoutDashboard, to: "/applicant/dashboard" },
  { label: "Available Internships",icon: Briefcase,       to: "/applicant/internships" },
  { label: "My Applications",      icon: FileText,        to: "/applicant/applications" },
  { label: "Interview Schedule",   icon: Calendar,        to: "/applicant/interviews" },
  { label: "Documents",            icon: FolderOpen,      to: "/applicant/documents" },
  { label: "Messages",             icon: MessageSquare,   to: "/applicant/messages" },
  { label: "Profile",              icon: User,            to: "/applicant/profile" },
  { label: "Settings",             icon: Settings,        to: "/applicant/settings" },
];

const HR_NAV = [
  { label: "Dashboard",       icon: LayoutDashboard, to: "/hr/dashboard" },
  { label: "Internships",     icon: Briefcase,       to: "/hr/internships" },
  { label: "Applications",    icon: FileText,        to: "/hr/applications" },
  { label: "Applicants",      icon: Users,           to: "/hr/applicants" },
  { label: "Departments",     icon: Building2,       to: "/hr/departments" },
  { label: "Interviews",      icon: Calendar,        to: "/hr/interviews" },
  { label: "Reports",         icon: BarChart3,       to: "/hr/reports" },
  { label: "Users",           icon: ClipboardList,   to: "/hr/users" },
  { label: "Settings",        icon: Settings,        to: "/hr/settings" },
];

const ADMIN_NAV = [
  { label: "Dashboard",    icon: LayoutDashboard, to: "/admin/dashboard" },
  { label: "Users",        icon: Users,           to: "/admin/users" },
  { label: "Roles",        icon: Shield,          to: "/admin/roles" },
  { label: "Departments",  icon: Building2,       to: "/admin/departments" },
  { label: "Audit Logs",   icon: ScrollText,      to: "/admin/audit-logs" },
  { label: "Notifications",icon: Bell,            to: "/admin/notifications" },
  { label: "Settings",     icon: Database,        to: "/admin/settings" },
];

const NAV_MAP = { applicant: APPLICANT_NAV, hr: HR_NAV, admin: ADMIN_NAV };

const Sidebar = ({ collapsed, setCollapsed, mobileOpen, setMobileOpen }) => {
  const { user, logout } = useAuth();
  const { dark, toggle } = useTheme();
  const { unread } = useNotifications();
  const navigate = useNavigate();
  const nav = NAV_MAP[user?.role] || APPLICANT_NAV;

  const handleLogout = () => { logout(); navigate("/login"); };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {}
      <div className={cn("flex items-center gap-3 px-4 py-4 border-b border-white/10", collapsed && !mobileOpen && "justify-center px-2")}>
        <img src="/kcca-logo.png" alt="KCCA Logo" className="w-9 h-9 object-contain bg-white rounded-xl p-0.5 shadow-sm flex-shrink-0" />
        {(!collapsed || mobileOpen) && (
          <div className="min-w-0">
            <p className="text-white font-bold text-sm leading-tight">KCCA</p>
            <p className="text-primary-200 text-xs leading-tight">Internship Portal</p>
          </div>
        )}
        {mobileOpen && (
          <button onClick={() => setMobileOpen(false)} className="ml-auto text-primary-200 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {}
      {(!collapsed || mobileOpen) && (
        <div className="px-4 py-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <Avatar name={user?.name} size="sm" />
            <div className="min-w-0 flex-1">
              <p className="text-white text-sm font-semibold truncate">{user?.name}</p>
              <p className="text-primary-200 text-xs capitalize">{user?.role}</p>
            </div>
          </div>
        </div>
      )}

      {}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {nav.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={() => setMobileOpen?.(false)}
            className={({ isActive }) =>
              cn("sidebar-item relative", isActive && "sidebar-item-active text-white",
                collapsed && !mobileOpen && "justify-center px-2")
            }
            title={collapsed && !mobileOpen ? item.label : undefined}
          >
            <item.icon className="w-5 h-5 flex-shrink-0" />
            {(!collapsed || mobileOpen) && (
              <span className="flex-1 truncate">{item.label}</span>
            )}
            {item.label === "Messages" && unread > 0 && (!collapsed || mobileOpen) && (
              <span className="ml-auto bg-secondary-500 text-slate-900 text-xs font-bold px-1.5 py-0.5 rounded-full">
                {unread}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      {}
      <div className={cn("px-3 py-4 border-t border-white/10 space-y-1", collapsed && !mobileOpen && "px-2")}>
        <button
          onClick={toggle}
          className={cn("sidebar-item text-primary-200 hover:text-white w-full", collapsed && !mobileOpen && "justify-center px-2")}
        >
          {dark ? <Sun className="w-5 h-5 flex-shrink-0" /> : <Moon className="w-5 h-5 flex-shrink-0" />}
          {(!collapsed || mobileOpen) && <span>{dark ? "Light Mode" : "Dark Mode"}</span>}
        </button>
        <button
          onClick={handleLogout}
          className={cn("sidebar-item text-red-300 hover:text-red-100 hover:bg-red-500/20 w-full", collapsed && !mobileOpen && "justify-center px-2")}
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {(!collapsed || mobileOpen) && <span>Logout</span>}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {}
      <motion.aside
        animate={{ width: collapsed ? 72 : 260 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="hidden md:flex flex-col h-screen bg-gradient-to-b from-primary-700 to-primary-900 fixed left-0 top-0 z-30 shadow-xl overflow-hidden"
      >
        <SidebarContent />
        {}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute top-5 -right-3 w-6 h-6 bg-white dark:bg-slate-700 rounded-full shadow-md flex items-center justify-center border border-slate-200 dark:border-slate-600 hover:bg-slate-50"
        >
          {collapsed ? <ChevronRight className="w-3 h-3 text-slate-600" /> : <ChevronLeft className="w-3 h-3 text-slate-600" />}
        </button>
      </motion.aside>

      {}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40 md:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed left-0 top-0 bottom-0 w-72 bg-gradient-to-b from-primary-700 to-primary-900 z-50 md:hidden shadow-2xl flex flex-col"
            >
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
};
export default Sidebar;
