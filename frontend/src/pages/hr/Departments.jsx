
import Breadcrumbs from "../../components/layout/Breadcrumbs";
import Button from "../../components/ui/Button";
import Skeleton from "../../components/ui/Skeleton";
import useApi from "../../hooks/useApi";
import { Building2, Users, Briefcase, CheckCircle, XCircle } from "lucide-react";

const HRDepartments = () => {
  const { data: departments, loading } = useApi("/data/departments");
  const { data: internships } = useApi("/internships");

  const getOpenings = (deptName) =>
    internships.filter(i => i.department === deptName && i.status === "open")
      .reduce((sum, i) => sum + (i.vacancies || 0), 0);

  const getPostings = (deptName) =>
    internships.filter(i => i.department === deptName).length;

  if (loading) return (
    <div className="page-container"><Breadcrumbs />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-44 rounded-2xl" />)}
      </div>
    </div>
  );

  return (
    <div className="page-container">
      <Breadcrumbs />

      <div>
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Departments Directory</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm">
          KCCA Directorates and departments managing internship allocations — {departments.length} department{departments.length !== 1 ? "s" : ""} registered.
        </p>
      </div>

      {departments.length === 0 ? (
        <div className="card p-12 flex flex-col items-center text-center text-slate-400 gap-3">
          <Building2 className="w-12 h-12 opacity-30" />
          <p className="font-semibold">No departments configured yet.</p>
          <p className="text-xs">Ask your administrator to add departments from the Admin panel.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {departments.map((d) => {
            const openings = getOpenings(d.name);
            const postings = getPostings(d.name);
            const isActive = d.is_active !== false;

            return (
              <div key={d.department_id || d.id} className="card p-6 space-y-4 hover:shadow-card-md transition-all duration-200">
                {/* Icon + Status */}
                <div className="flex justify-between items-start">
                  <div className="w-10 h-10 bg-primary-50 dark:bg-primary-900/30 rounded-xl flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-primary-500" />
                  </div>
                  {isActive ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400">
                      <CheckCircle className="w-3 h-3" /> Active
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400">
                      <XCircle className="w-3 h-3" /> Inactive
                    </span>
                  )}
                </div>

                {/* Name + Directorate */}
                <div>
                  <h3 className="font-bold text-slate-800 dark:text-white text-base leading-snug">{d.name}</h3>
                  {d.directorate && (
                    <p className="text-xs text-slate-400 mt-0.5 truncate">{d.directorate}</p>
                  )}
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-2 p-3 bg-slate-50 dark:bg-slate-700/40 rounded-xl text-xs">
                  <div className="flex items-center gap-2">
                    <Briefcase className="w-3.5 h-3.5 text-primary-400" />
                    <div>
                      <p className="text-slate-400">Open Slots</p>
                      <p className="font-bold text-slate-800 dark:text-white">{openings}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-3.5 h-3.5 text-slate-400" />
                    <div>
                      <p className="text-slate-400">Postings</p>
                      <p className="font-bold text-primary-600">{postings}</p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default HRDepartments;
