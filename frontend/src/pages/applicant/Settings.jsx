// src/pages/applicant/Settings.jsx
import { useState } from "react";
import Breadcrumbs from "../../components/layout/Breadcrumbs";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import toast from "react-hot-toast";
import { Bell, Lock, Shield, Save } from "lucide-react";

const Settings = () => {
  const [notifyEmail, setNotifyEmail] = useState(true);
  const [notifySMS, setNotifySMS] = useState(true);
  const [notifyPortal, setNotifyPortal] = useState(true);

  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");

  const handleSavePreferences = (e) => {
    e.preventDefault();
    toast.success("Notification preferences saved.");
  };

  const handleChangePassword = (e) => {
    e.preventDefault();
    if (!currentPw || !newPw) {
      toast.error("Please fill all password fields.");
      return;
    }
    if (newPw !== confirmPw) {
      toast.error("New passwords do not match.");
      return;
    }
    toast.success("Password changed successfully!");
    setCurrentPw("");
    setNewPw("");
    setConfirmPw("");
  };

  return (
    <div className="page-container max-w-4xl mx-auto space-y-6">
      <Breadcrumbs />

      <div>
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Account Settings</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm">
          Manage your notification channels, security, and portal preferences.
        </p>
      </div>

      {/* Notification Channels Settings */}
      <div className="card p-6 space-y-6">
        <div className="flex items-center gap-2 border-b pb-4 border-slate-100 dark:border-slate-700">
          <Bell className="w-5 h-5 text-primary-500" />
          <div>
            <h3 className="font-bold text-slate-800 dark:text-white text-base">Notification Channels</h3>
            <p className="text-xs text-slate-400">Choose how KCCA contacts you about application updates and interviews.</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-700">
            <div>
              <p className="font-semibold text-sm text-slate-800 dark:text-white">Email Notifications</p>
              <p className="text-xs text-slate-500">Receive application updates, interview invites, and offer letters via email.</p>
            </div>
            <input
              type="checkbox"
              checked={notifyEmail}
              onChange={(e) => setNotifyEmail(e.target.checked)}
              className="w-5 h-5 accent-primary-500 rounded"
            />
          </div>

          <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-700">
            <div>
              <p className="font-semibold text-sm text-slate-800 dark:text-white">SMS Notifications</p>
              <p className="text-xs text-slate-500">Receive urgent SMS reminders for interview schedules and deadlines.</p>
            </div>
            <input
              type="checkbox"
              checked={notifySMS}
              onChange={(e) => setNotifySMS(e.target.checked)}
              className="w-5 h-5 accent-primary-500 rounded"
            />
          </div>

          <div className="flex items-center justify-between py-2">
            <div>
              <p className="font-semibold text-sm text-slate-800 dark:text-white">In-Portal Badge Notifications</p>
              <p className="text-xs text-slate-500">Show notification badges in your top navigation header.</p>
            </div>
            <input
              type="checkbox"
              checked={notifyPortal}
              onChange={(e) => setNotifyPortal(e.target.checked)}
              className="w-5 h-5 accent-primary-500 rounded"
            />
          </div>
        </div>

        <Button variant="primary" size="sm" onClick={handleSavePreferences} icon={Save}>
          Save Preferences
        </Button>
      </div>

      {/* Change Password */}
      <div className="card p-6 space-y-6">
        <div className="flex items-center gap-2 border-b pb-4 border-slate-100 dark:border-slate-700">
          <Lock className="w-5 h-5 text-primary-500" />
          <div>
            <h3 className="font-bold text-slate-800 dark:text-white text-base">Change Password</h3>
            <p className="text-xs text-slate-400">Ensure your account uses a strong, unique password.</p>
          </div>
        </div>

        <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
          <Input
            label="Current Password"
            type="password"
            value={currentPw}
            onChange={(e) => setCurrentPw(e.target.value)}
          />
          <Input
            label="New Password"
            type="password"
            value={newPw}
            onChange={(e) => setNewPw(e.target.value)}
          />
          <Input
            label="Confirm New Password"
            type="password"
            value={confirmPw}
            onChange={(e) => setConfirmPw(e.target.value)}
          />
          <Button type="submit" variant="primary" size="md">
            Update Password
          </Button>
        </form>
      </div>
    </div>
  );
};

export default Settings;
