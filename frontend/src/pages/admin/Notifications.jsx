
import Breadcrumbs from "../../components/layout/Breadcrumbs";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import toast from "react-hot-toast";
import { Bell, Send, Mail, Smartphone } from "lucide-react";

const AdminNotifications = () => {
  const handleBroadcast = (e) => {
    e.preventDefault();
    toast.success("Broadcast notification sent to all active users via Email, SMS & Portal!");
  };

  return (
    <div className="page-container max-w-4xl mx-auto space-y-6">
      <Breadcrumbs />

      <div>
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Broadcast Notifications</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm">
          Send announcements to applicants, HR officers, and supervisors across Email, SMS, and Portal channels.
        </p>
      </div>

      <div className="card p-6 space-y-6">
        <h3 className="font-bold text-base text-slate-800 dark:text-white border-b pb-3 border-slate-100 dark:border-slate-700 flex items-center gap-2">
          <Bell className="w-5 h-5 text-primary-500" /> Dispatch Announcement
        </h3>

        <form onSubmit={handleBroadcast} className="space-y-4">
          <Input label="Notification Title" required placeholder="e.g. KCCA Internship Deadline Extended" />

          <div>
            <label className="form-label">Message Content</label>
            <textarea
              rows={4}
              required
              className="form-input"
              placeholder="Enter message details for broadcast..."
            />
          </div>

          <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl space-y-2 text-xs">
            <p className="font-bold text-slate-700 dark:text-slate-200">Target Channels</p>
            <div className="flex flex-wrap gap-4">
              <label className="flex items-center gap-2"><input type="checkbox" defaultChecked className="accent-primary-500"/> <Mail className="w-3.5 h-3.5"/> Send Email</label>
              <label className="flex items-center gap-2"><input type="checkbox" defaultChecked className="accent-primary-500"/> <Smartphone className="w-3.5 h-3.5"/> Send SMS</label>
              <label className="flex items-center gap-2"><input type="checkbox" defaultChecked className="accent-primary-500"/> <Bell className="w-3.5 h-3.5"/> In-Portal Notification</label>
            </div>
          </div>

          <Button type="submit" variant="primary" size="md" icon={Send}>
            Dispatch Broadcast
          </Button>
        </form>
      </div>
    </div>
  );
};

export default AdminNotifications;
