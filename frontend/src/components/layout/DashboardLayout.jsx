// src/components/layout/DashboardLayout.jsx
import { useState } from "react";
import { Outlet } from "react-router-dom";
import { motion } from "framer-motion";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import { cn } from "../../utils/cn";

const DashboardLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-bg dark:bg-slate-900">
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />
      <Navbar collapsed={collapsed} setMobileOpen={setMobileOpen} />
      <motion.main
        animate={{ marginLeft: collapsed ? 72 : 260 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className={cn("transition-all duration-300 pt-16 min-h-screen", "ml-0 md:ml-auto")}
        style={{ marginLeft: undefined }}
      >
        {/* Desktop margin handled via CSS */}
        <div
          className="transition-all duration-300 min-h-screen"
          style={{ marginLeft: 0 }}
        >
          <Outlet />
        </div>
      </motion.main>
      {/* Desktop push layout */}
      <style>{`
        @media (min-width: 768px) {
          main { margin-left: ${collapsed ? 72 : 260}px !important; }
        }
      `}</style>
    </div>
  );
};
export default DashboardLayout;
