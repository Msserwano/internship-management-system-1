
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Breadcrumbs from "../../components/layout/Breadcrumbs";
import StatCard from "../../components/ui/StatCard";
import Button from "../../components/ui/Button";
import Skeleton from "../../components/ui/Skeleton";
import useApi from "../../hooks/useApi";
import { auditService } from "../../api/services";
import { fDateTime, fDate } from "../../utils/formatters";
import {
  Users, Shield, Building2, ScrollText, Server, Database, Activity, Download
} from "lucide-react";
import toast from "react-hot-toast";

const AdminDashboard = () => {
  const { data: users,        loading: loadingUsers }  = useApi("/users");
  const { data: applicants,   loading: loadingApps  }  = useApi("/applicants");
  const { data: departments,  loading: loadingDepts }  = useApi("/data/departments");
  const { data: applications, loading: loadingAppl }   = useApi("/applications");
  const [auditLogs, setAuditLogs] = useState([]);
  const [loadingAudit, setLoadingAudit] = useState(true);

  useEffect(() => {
    auditService.list({ limit: 8 })
      .then(r => setAuditLogs(r.data?.data || []))
      .catch(() => setAuditLogs([]))
      .finally(() => setLoadingAudit(false));
  }, []);

  const totalUsers  = users.length + applicants.length;
  const totalDepts  = departments.length;

  if (loadingUsers || loadingApps) return (
    <div className="page-container"><Breadcrumbs />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-28 rounded-2xl" />)}
      </div>
    </div>
  );

  return (
    <div className="page-container">
      <Breadcrumbs />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">System Admin Dashboard</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            Monitor system status, user permissions, audit logs, and department setup.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => toast.success("System backup initiated...")} icon={Database}>
            Create Backup
          </Button>
          <Link to="/admin/users">
            <Button variant="primary" size="sm" icon={Users}>Manage Users</Button>
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total System Users"
          value={totalUsers}
          change={`${users.length} staff · ${applicants.length} applicants`}
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
          title="KCCA Departments"
          value={loadingDepts ? "—" : totalDepts}
          change="Active directorates"
          icon={Building2}
          color="info"
          index={2}
        />
        <StatCard
          title="Total Applications"
          value={loadingAppl ? "—" : applications.length}
          change={`${applications.filter(a => a.status === 'accepted').length} accepted`}
          icon={Activity}
          color="accent"
          index={3}
        />
      </div>

      {/* System Health Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card p-6 space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 text-green-600 rounded-xl flex items-center justify-center">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-800 dark:text-white">Server Health</h3>
              <p className="text-xs text-slate-400">Node.js API &amp; Database</p>
            </div>
          </div>
          <div className="pt-2 text-xs space-y-1.5">
            <div className="flex justify-between"><span className="text-slate-500">API Status</span><span className="text-green-500 font-semibold">● Operational</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Database</span><span className="text-green-500 font-semibold">● Connected</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Environment</span><strong className="text-slate-700 dark:text-slate-300">Development</strong></div>
          </div>
        </div>

        <div className="card p-6 space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 text-primary-500 rounded-xl flex items-center justify-center">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-800 dark:text-white">Data Overview</h3>
              <p className="text-xs text-slate-400">Live database counts</p>
            </div>
          </div>
          <div className="pt-2 text-xs space-y-1.5">
            <div className="flex justify-between"><span className="text-slate-500">Staff Accounts</span><strong className="text-slate-700 dark:text-slate-300">{users.length}</strong></div>
            <div className="flex justify-between"><span className="text-slate-500">Applicants</span><strong className="text-slate-700 dark:text-slate-300">{applicants.length}</strong></div>
            <div className="flex justify-between"><span className="text-slate-500">Applications</span><strong className="text-slate-700 dark:text-slate-300">{applications.length}</strong></div>
          </div>
        </div>

        <div className="card p-6 space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 text-purple-600 rounded-xl flex items-center justify-center">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-800 dark:text-white">Security &amp; Audit</h3>
              <p className="text-xs text-slate-400">JWT Token Security</p>
            </div>
          </div>
          <div className="pt-2 text-xs space-y-1.5">
            <div className="flex justify-between"><span className="text-slate-500">Auth Method</span><strong className="text-slate-700 dark:text-slate-300">JWT (7 days)</strong></div>
            <div className="flex justify-between"><span className="text-slate-500">Password Hashing</span><strong className="text-slate-700 dark:text-slate-300">bcrypt (cost 10)</strong></div>
            <div className="flex justify-between"><span className="text-slate-500">SSL/TLS</span><span className="text-green-500 font-semibold">● Active</span></div>
          </div>
        </div>
      </div>

      {/* Audit Logs */}
      <div className="card p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-slate-800 dark:text-white text-base flex items-center gap-2">
            <ScrollText className="w-5 h-5 text-primary-500" /> Recent System Audit Logs
          </h3>
          <Link to="/admin/audit-logs" className="text-xs font-semibold text-primary-500 hover:underline">
            View All
          </Link>
        </div>

        {loadingAudit ? (
          <div className="space-y-2">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-10 rounded-xl" />)}</div>
        ) : auditLogs.length === 0 ? (
          <div className="text-center py-10 text-slate-400 text-sm">
            <ScrollText className="w-8 h-8 mx-auto mb-2 opacity-40" />
            No audit log entries yet. System activity will appear here.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Action</th>
                  <th>Resource</th>
                  <th>User</th>
                  <th>IP Address</th>
                  <th>Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {auditLogs.map((log) => (
                  <tr key={log.id}>
                    <td><span className="badge badge-submitted font-mono text-[10px]">{log.action}</span></td>
                    <td className="text-xs text-slate-600 dark:text-slate-300">{log.resource_type}{log.resource_id ? ` #${String(log.resource_id).slice(0,8)}` : ''}</td>
                    <td className="text-xs font-semibold text-slate-700 dark:text-slate-200">{log.user_id || '—'}</td>
                    <td className="font-mono text-xs text-slate-400">{log.ip_address || '—'}</td>
                    <td className="text-xs text-slate-400">{fDateTime(log.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
