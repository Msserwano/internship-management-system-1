// src/pages/admin/Roles.jsx
import Breadcrumbs from "../../components/layout/Breadcrumbs";
import Button from "../../components/ui/Button";
import { Shield, Check, X } from "lucide-react";
import toast from "react-hot-toast";

const PERMISSIONS = [
  { module: "Dashboard Access", applicant: true, hr: true, admin: true, supervisor: true },
  { module: "Apply for Internships", applicant: true, hr: false, admin: false, supervisor: false },
  { module: "View Personal Applications", applicant: true, hr: false, admin: false, supervisor: false },
  { module: "Create & Post Vacancies", applicant: false, hr: true, admin: true, supervisor: false },
  { module: "Review Applications", applicant: false, hr: true, admin: true, supervisor: true },
  { module: "Shortlist Candidates", applicant: false, hr: true, admin: true, supervisor: false },
  { module: "Schedule Panel Interviews", applicant: false, hr: true, admin: true, supervisor: false },
  { module: "Issue Offer Letters", applicant: false, hr: true, admin: true, supervisor: false },
  { module: "Manage System Users", applicant: false, hr: false, admin: true, supervisor: false },
  { module: "View Audit Logs", applicant: false, hr: false, admin: true, supervisor: false },
  { module: "System Backup & Restore", applicant: false, hr: false, admin: true, supervisor: false },
];

const AdminRoles = () => {
  return (
    <div className="page-container">
      <Breadcrumbs />

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Roles & Permissions Matrix</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            Role-Based Access Control (RBAC) permissions overview across system roles.
          </p>
        </div>

        <Button variant="primary" size="md" onClick={() => toast.success("Role matrix updated!")} icon={Shield}>
          Save Permissions
        </Button>
      </div>

      <div className="card p-6">
        <div className="overflow-x-auto">
          <table className="data-table text-center">
            <thead>
              <tr>
                <th className="text-left">Module / Feature Permission</th>
                <th>Applicant</th>
                <th>HR Officer</th>
                <th>Supervisor</th>
                <th>System Admin</th>
              </tr>
            </thead>
            <tbody>
              {PERMISSIONS.map((p, idx) => (
                <tr key={idx}>
                  <td className="text-left font-bold text-slate-800 dark:text-white">{p.module}</td>
                  <td>
                    {p.applicant ? <Check className="w-5 h-5 text-accent-500 mx-auto" /> : <X className="w-5 h-5 text-slate-300 mx-auto" />}
                  </td>
                  <td>
                    {p.hr ? <Check className="w-5 h-5 text-accent-500 mx-auto" /> : <X className="w-5 h-5 text-slate-300 mx-auto" />}
                  </td>
                  <td>
                    {p.supervisor ? <Check className="w-5 h-5 text-accent-500 mx-auto" /> : <X className="w-5 h-5 text-slate-300 mx-auto" />}
                  </td>
                  <td>
                    {p.admin ? <Check className="w-5 h-5 text-accent-500 mx-auto" /> : <X className="w-5 h-5 text-slate-300 mx-auto" />}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminRoles;
