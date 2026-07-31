
import Breadcrumbs from "../../components/layout/Breadcrumbs";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import toast from "react-hot-toast";
import { Settings as SettingsIcon, Save, Bell, Lock } from "lucide-react";

const HRSettings = () => {
  const handleSave = (e) => {
    e.preventDefault();
    toast.success("HR settings saved!");
  };

  return (
    <div className="page-container max-w-4xl mx-auto space-y-6">
      <Breadcrumbs />

      <div>
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">HR Portal Settings</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm">
          Configure recruitment parameters, notification templates, and reviewer defaults.
        </p>
      </div>

      <div className="card p-6 space-y-6">
        <h3 className="font-bold text-base text-slate-800 dark:text-white border-b pb-3 border-slate-100 dark:border-slate-700 flex items-center gap-2">
          <SettingsIcon className="w-5 h-5 text-primary-500" /> Recruitment Parameters
        </h3>

        <form onSubmit={handleSave} className="space-y-4 max-w-md">
          <Input label="Default Application Open Period (Days)" type="number" defaultValue={30} />
          <Input label="Maximum Applications Per Candidate" type="number" defaultValue={2} />
          <Input label="HR Contact Email for Portal Inquiries" defaultValue="internships@kcca.go.ug" />

          <Button type="submit" variant="primary" size="md" icon={Save}>
            Save Configuration
          </Button>
        </form>
      </div>
    </div>
  );
};

export default HRSettings;
