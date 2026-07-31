
import { useState } from "react";
import Breadcrumbs from "../../components/layout/Breadcrumbs";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import toast from "react-hot-toast";
import { Database, RefreshCw, Save, ShieldAlert, Upload } from "lucide-react";

const AdminSettings = () => {
  const [restoreModal, setRestoreModal] = useState(false);

  const handleBackup = () => {
    toast.success("Database backup archive generated and downloading...");
  };

  const handleRestore = () => {
    toast.success("System restored to selected backup point successfully!");
    setRestoreModal(false);
  };

  return (
    <div className="page-container max-w-4xl mx-auto space-y-6">
      <Breadcrumbs />

      <div>
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">System Settings & Maintenance</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm">
          System backup, database restore, email/SMS gateway configuration, and maintenance parameters.
        </p>
      </div>

      {}
      <div className="card p-6 space-y-4">
        <h3 className="font-bold text-base text-slate-800 dark:text-white border-b pb-3 border-slate-100 dark:border-slate-700 flex items-center gap-2">
          <Database className="w-5 h-5 text-primary-500" /> Database Backup & Disaster Recovery
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 bg-slate-50 dark:bg-slate-700/40 rounded-xl space-y-3">
            <h4 className="font-bold text-sm text-slate-800 dark:text-white">Full System Backup</h4>
            <p className="text-xs text-slate-500">Create an instant SQL/JSON snapshot of all users, applications, and documents.</p>
            <Button variant="primary" size="sm" onClick={handleBackup} icon={Database}>
              Generate Backup
            </Button>
          </div>

          <div className="p-4 bg-slate-50 dark:bg-slate-700/40 rounded-xl space-y-3">
            <h4 className="font-bold text-sm text-slate-800 dark:text-white">Restore System State</h4>
            <p className="text-xs text-slate-500">Restore system database from a previously saved backup file point.</p>
            <Button variant="outline" size="sm" onClick={() => setRestoreModal(true)} icon={Upload}>
              Restore from Backup
            </Button>
          </div>
        </div>
      </div>

      {}
      <div className="card p-6 space-y-4">
        <h3 className="font-bold text-base text-slate-800 dark:text-white border-b pb-3 border-slate-100 dark:border-slate-700 flex items-center gap-2">
          <RefreshCw className="w-5 h-5 text-primary-500" /> Infrastructure Gateways
        </h3>

        <form onSubmit={(e) => { e.preventDefault(); toast.success("Gateway settings saved."); }} className="space-y-4 max-w-md">
          <Input label="SMS Gateway Provider API URL" defaultValue="https://api.ugandasms.co.ug/v1/send" />
          <Input label="SMTP Server Host" defaultValue="smtp.kcca.go.ug" />
          <Input label="SMTP Port" defaultValue="587" />
          <Button type="submit" variant="primary" size="md" icon={Save}>
            Save Infrastructure Config
          </Button>
        </form>
      </div>

      <ConfirmDialog
        open={restoreModal}
        onClose={() => setRestoreModal(false)}
        onConfirm={handleRestore}
        title="Confirm System Restore"
        message="Restoring the database will overwrite active database records with the backup file. Proceed?"
        confirmLabel="Yes, Restore System"
        danger
      />
    </div>
  );
};

export default AdminSettings;
