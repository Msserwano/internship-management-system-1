
import { useState } from "react";
import Breadcrumbs from "../../components/layout/Breadcrumbs";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import Skeleton from "../../components/ui/Skeleton";
import useApi from "../../hooks/useApi";
import { auditService } from "../../api/services";
import { fDateTime } from "../../utils/formatters";
import { ScrollText, Search, Download, Shield, Clock } from "lucide-react";
import toast from "react-hot-toast";

const ACTION_COLORS = {
  CREATE:  "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  UPDATE:  "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  DELETE:  "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  LOGIN:   "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  LOGOUT:  "bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300",
  VIEW:    "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
};

const AdminAuditLogs = () => {
  const { data: logs, loading, refetch } = useApi("/data/audit-logs");
  const [search, setSearch] = useState("");

  const filtered = logs.filter(l =>
    !search ||
    String(l.user_id || "").toLowerCase().includes(search.toLowerCase()) ||
    String(l.action || "").toLowerCase().includes(search.toLowerCase()) ||
    String(l.resource_type || "").toLowerCase().includes(search.toLowerCase()) ||
    String(l.ip_address || "").toLowerCase().includes(search.toLowerCase())
  );

  const handleExport = async () => {
    try {
      const res = await auditService.export({}, { responseType: "blob" });
      const url = URL.createObjectURL(res.data);
      const a = document.createElement("a");
      a.href = url;
      a.download = `audit-logs-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Audit logs exported.");
    } catch {
      toast.error("Export failed — server may not support CSV yet.");
    }
  };

  return (
    <div className="page-container">
      <Breadcrumbs />

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Audit Trail Logs</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            Immutable system activity logs for compliance and security monitoring.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={refetch} icon={Clock}>Refresh</Button>
          <Button variant="outline" size="sm" onClick={handleExport} icon={Download}>Export CSV</Button>
        </div>
      </div>

      {/* Search */}
      <div className="card p-4">
        <Input
          id="audit-search"
          placeholder="Filter by user, action type, resource, or IP address..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          icon={Search}
          className="max-w-lg"
        />
      </div>

      {/* Table */}
      <div className="card p-6">
        {loading ? (
          <div className="space-y-2">{[...Array(6)].map((_, i) => <Skeleton key={i} className="h-11 rounded-xl" />)}</div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400 text-sm gap-3">
            <ScrollText className="w-12 h-12 opacity-30" />
            <p className="font-medium">{search ? "No logs match your filter." : "No audit log entries yet."}</p>
            <p className="text-xs text-slate-400 max-w-xs text-center">System actions (logins, creates, updates, deletes) will appear here as they occur.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Action</th>
                  <th>Resource</th>
                  <th>User</th>
                  <th>IP Address</th>
                  <th>Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((log) => {
                  const colorClass = ACTION_COLORS[log.action?.toUpperCase()] || ACTION_COLORS.VIEW;
                  return (
                    <tr key={log.id}>
                      <td className="font-mono text-xs text-slate-400">#{log.id}</td>
                      <td>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide ${colorClass}`}>
                          {log.action}
                        </span>
                      </td>
                      <td>
                        <span className="text-xs text-slate-700 dark:text-slate-200 font-medium">{log.resource_type}</span>
                        {log.resource_id && (
                          <span className="ml-1 font-mono text-[10px] text-slate-400">#{String(log.resource_id).slice(0, 10)}</span>
                        )}
                      </td>
                      <td className="text-xs text-slate-600 dark:text-slate-300">{log.user_id || <span className="italic text-slate-400">system</span>}</td>
                      <td className="font-mono text-xs text-slate-400">{log.ip_address || "—"}</td>
                      <td className="text-xs text-slate-400">{fDateTime(log.created_at)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <p className="text-xs text-slate-400 text-right mt-3">{filtered.length} record{filtered.length !== 1 ? "s" : ""}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminAuditLogs;
