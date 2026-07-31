
import { useState } from "react";
import Breadcrumbs from "../../components/layout/Breadcrumbs";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";
import { MOCK_AUDIT_LOGS } from "../../api/mockData";
import { fDateTime } from "../../utils/formatters";
import { ScrollText, Search, Download, Filter } from "lucide-react";
import toast from "react-hot-toast";

const AdminAuditLogs = () => {
  const [search, setSearch] = useState("");
  const [logs] = useState(MOCK_AUDIT_LOGS);

  const filtered = logs.filter(l =>
    l.user.toLowerCase().includes(search.toLowerCase()) ||
    l.action.toLowerCase().includes(search.toLowerCase()) ||
    l.detail.toLowerCase().includes(search.toLowerCase())
  );

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

        <Button variant="outline" size="sm" onClick={() => toast.success("Exporting Audit Logs (CSV)...")} icon={Download}>
          Export Logs CSV
        </Button>
      </div>

      <div className="card p-4">
        <Input
          placeholder="Filter logs by user email, action, or keyword..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          icon={Search}
          className="max-w-md"
        />
      </div>

      <div className="card p-6">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Log ID</th>
                <th>Action Type</th>
                <th>User Account</th>
                <th>Event Details</th>
                <th>IP Address</th>
                <th>Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((log) => (
                <tr key={log.id}>
                  <td className="font-mono text-xs text-slate-400">{log.id}</td>
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

export default AdminAuditLogs;
