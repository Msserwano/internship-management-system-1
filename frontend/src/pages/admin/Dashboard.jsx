// src/pages/admin/Dashboard.jsx
import { Link } from "react-router-dom";
import Breadcrumbs from "../../components/layout/Breadcrumbs";
import StatCard from "../../components/ui/StatCard";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";
import { MOCK_AUDIT_LOGS, MOCK_USERS_LIST } from "../../api/mockData";
import { fDateTime } from "../../utils/formatters";
import {
  Users, Shield, Building2, ScrollText, Server, Database, Activity, RefreshCw, Download
} from "lucide-react";
import toast from "react-hot-toast";

const AdminDashboard = () => {
  return (
    <div className="page-container">
      <Breadcrumbs />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">System Admin Dashboard</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            Monitor system status, user permissions, audit logs, and system backups.
          </p>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => toast.success("System backup initiated...")} icon={Database}>
            Create Backup
          </Button>
          <Link to="/admin/users">
            <Button variant="primary" size="sm" icon={Users}>
              Manage Users
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Registered Users"
          value={MOCK_USERS_LIST.length}
          change="+12 this week"
          icon={Users}
          color="primary"
          index={0}
        />
        <StatCard
          title="System Roles"
          value="4 Roles"
          change="Applicant, HR, Admin, Supervisor"
          icon={Shield}
          color="purple"
          index={1}
        />
        <StatCard
          title="KCCA Directorates"
          value="12"
          change="Active Directorates"
          icon={Building2}
          color="info"
          index={2}
        />
        <StatCard
          title="System Status"
          value="99.9%"
          change="Operational"
          icon={Activity}
          color="accent"
          index={3}
        />
      </div>

      {/* Health & Backup Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card p-6 space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 text-accent-500 rounded-xl flex items-center justify-center">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-800 dark:text-white">Server Health</h3>
              <p className="text-xs text-slate-400">Node.js API & Database</p>
            </div>
          </div>
          <div className="pt-2 text-xs space-y-1">
            <div className="flex justify-between"><span>CPU Usage</span><strong className="text-accent-500">14%</strong></div>
            <div className="flex justify-between"><span>Memory Usage</span><strong className="text-primary-600">32%</strong></div>
            <div className="flex justify-between"><span>Uptime</span><strong>14d 8h 22m</strong></div>
          </div>
        </div>

        <div className="card p-6 space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 text-primary-500 rounded-xl flex items-center justify-center">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-800 dark:text-white">Last Database Backup</h3>
              <p className="text-xs text-slate-400">Automated Daily Snapshot</p>
            </div>
          </div>
          <div className="pt-2 text-xs space-y-1">
            <div className="flex justify-between"><span>Last Backup Date</span><strong>2026-07-27 03:00 AM</strong></div>
            <div className="flex justify-between"><span>File Size</span><strong>42.8 MB</strong></div>
            <div className="flex justify-between"><span>Status</span><span className="badge badge-accepted">Success</span></div>
          </div>
        </div>

        <div className="card p-6 space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-800 dark:text-white">Security & Audit</h3>
              <p className="text-xs text-slate-400">JWT Token Security</p>
            </div>
          </div>
          <div className="pt-2 text-xs space-y-1">
            <div className="flex justify-between"><span>Active Sessions</span><strong>28</strong></div>
            <div className="flex justify-between"><span>Failed Logins (24h)</span><strong className="text-slate-600">0</strong></div>
            <div className="flex justify-between"><span>SSL Certificate</span><span className="badge badge-accepted">Valid</span></div>
          </div>
        </div>
      </div>

      {/* Recent Audit Trail */}
      <div className="card p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-slate-800 dark:text-white text-base flex items-center gap-2">
            <ScrollText className="w-5 h-5 text-primary-500" /> Recent System Audit Logs
          </h3>
          <Link to="/admin/audit-logs" className="text-xs font-semibold text-primary-500 hover:underline">
            View All Audit Logs
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Action</th>
                <th>Performed By</th>
                <th>Details</th>
                <th>IP Address</th>
                <th>Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_AUDIT_LOGS.map((log) => (
                <tr key={log.id}>
                  <td><span className="badge badge-submitted font-mono text-[10px]">{log.action}</span></td>
                  <td className="font-bold text-slate-800 dark:text-white">{log.user}</td>
                  <td className="text-xs">{log.detail}</td>
                  <td className="font-mono text-xs text-slate-400">{log.ip}</td>
                  <td className="text-xs text-slate-400">{fDateTime(log.timestamp)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
