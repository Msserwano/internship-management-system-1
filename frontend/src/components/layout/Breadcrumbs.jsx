
import { Link, useLocation } from "react-router-dom";
import { ChevronRight, Home } from "lucide-react";

const LABELS = {
  applicant:"Portal", hr:"HR Portal", admin:"Admin",
  dashboard:"Dashboard", internships:"Internships", applications:"Applications",
  interviews:"Interviews", documents:"Documents",
  profile:"Profile", settings:"Settings", notifications:"Notifications",
  reports:"Reports", users:"Users", departments:"Departments",
  applicants:"Applicants", roles:"Roles", "audit-logs":"Audit Logs",
  "apply":"Apply Now",
};

const Breadcrumbs = () => {
  const { pathname } = useLocation();
  const parts = pathname.split("/").filter(Boolean);

  return (
    <nav className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mb-4">
      <Home className="w-3.5 h-3.5" />
      {parts.map((part, i) => {
        const to = "/" + parts.slice(0, i + 1).join("/");
        const label = LABELS[part] || part.charAt(0).toUpperCase() + part.slice(1);
        const isLast = i === parts.length - 1;
        return (
          <span key={to} className="flex items-center gap-1.5">
            <ChevronRight className="w-3 h-3 text-slate-300" />
            {isLast
              ? <span className="text-slate-700 dark:text-slate-200 font-medium">{label}</span>
              : <Link to={to} className="hover:text-primary-500 transition">{label}</Link>
            }
          </span>
        );
      })}
    </nav>
  );
};
export default Breadcrumbs;
