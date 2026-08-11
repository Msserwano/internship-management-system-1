
import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Breadcrumbs from "../../components/layout/Breadcrumbs";
import Skeleton from "../../components/ui/Skeleton";
import useApi from "../../hooks/useApi";
import {
  ClipboardCheck, Star, ThumbsUp, ThumbsDown, Search, ChevronDown,
  ChevronUp, BarChart3, Users, Award, MessageSquare, X, Lightbulb, AlertTriangle,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const StarDisplay = ({ value }) => (
  <div className="flex gap-0.5">
    {[1, 2, 3, 4, 5].map((s) => (
      <Star
        key={s}
        className={`w-3.5 h-3.5 ${s <= value ? "fill-yellow-400 text-yellow-400" : "fill-none text-slate-300 dark:text-slate-600"}`}
      />
    ))}
  </div>
);

const StarDisplayLg = ({ value }) => (
  <div className="flex gap-1">
    {[1, 2, 3, 4, 5].map((s) => (
      <Star
        key={s}
        className={`w-5 h-5 ${s <= value ? "fill-yellow-400 text-yellow-400" : "fill-none text-slate-300 dark:text-slate-600"}`}
      />
    ))}
  </div>
);

const ratingLabel = ["", "Poor", "Fair", "Good", "Very Good", "Excellent"];

const avgRating = (evals, key) => {
  if (!evals.length) return 0;
  const camel = key;
  const snake = key.replace(/([A-Z])/g, "_$1").toLowerCase();
  const sum = evals.reduce((acc, e) => acc + (e[camel] ?? e[snake] ?? 0), 0);
  return (sum / evals.length).toFixed(1);
};

const getVal = (obj, camel) => {
  const snake = camel.replace(/([A-Z])/g, "_$1").toLowerCase();
  return obj[camel] ?? obj[snake] ?? 0;
};

// ---------------------------------------------------------------------------
// Detail Modal
// ---------------------------------------------------------------------------
const EvalModal = ({ evaluation: ev, onClose }) => {
  if (!ev) return null;
  const recommend = ev.wouldRecommend ?? ev.would_recommend;

  const ratingRows = [
    { label: "Overall Experience", key: "overallRating" },
    { label: "Supervisor Support",  key: "supervisorRating" },
    { label: "Learning Opportunities", key: "learningRating" },
    { label: "Facilities & Resources", key: "facilitiesRating" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto border border-slate-200 dark:border-slate-700"
      >
        {/* Modal Header */}
        <div className="sticky top-0 bg-white dark:bg-slate-800 px-6 pt-6 pb-4 border-b border-slate-100 dark:border-slate-700 flex items-start justify-between gap-4 rounded-t-3xl z-10">
          <div>
            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">
              {ev.applicantName || "Applicant"}
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              {ev.internshipTitle || ev.internship_title || "Internship"} · {ev.department || "KCCA"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-600 transition-colors flex-shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-6 pb-6 space-y-5 mt-4">
          {/* Ratings */}
          <div>
            <h3 className="text-sm font-bold text-slate-600 dark:text-slate-300 mb-3 uppercase tracking-wide">Ratings</h3>
            <div className="space-y-2">
              {ratingRows.map(({ label, key }) => {
                const val = getVal(ev, key);
                return (
                  <div key={key} className="flex items-center justify-between py-2.5 px-3 rounded-xl bg-slate-50 dark:bg-slate-700/40 border border-slate-100 dark:border-slate-700">
                    <span className="text-sm text-slate-600 dark:text-slate-300 font-medium">{label}</span>
                    <div className="flex items-center gap-2">
                      <StarDisplayLg value={val} />
                      <span className="text-xs font-semibold text-slate-400 w-16 text-right">{ratingLabel[val]}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recommendation */}
          <div className={`flex items-center gap-3 p-3.5 rounded-xl border ${recommend ? "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800" : "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800"}`}>
            {recommend ? (
              <><ThumbsUp className="w-5 h-5 text-emerald-500 flex-shrink-0" /><span className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">Would Recommend This Internship</span></>
            ) : (
              <><ThumbsDown className="w-5 h-5 text-red-500 flex-shrink-0" /><span className="text-sm font-semibold text-red-700 dark:text-red-400">Would Not Recommend This Internship</span></>
            )}
          </div>

          {/* Open responses */}
          {[
            { label: "Highlights", icon: Star, field: "highlights", color: "text-yellow-500" },
            { label: "Challenges", icon: AlertTriangle, field: "challenges", color: "text-orange-500" },
            { label: "Suggestions", icon: Lightbulb, field: "suggestions", color: "text-blue-500" },
          ].map(({ label, icon: Icon, field, color }) => (
            <div key={field}>
              <div className="flex items-center gap-2 mb-2">
                <Icon className={`w-4 h-4 ${color}`} />
                <h3 className="text-sm font-bold text-slate-600 dark:text-slate-300">{label}</h3>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed pl-6 bg-slate-50 dark:bg-slate-700/40 p-3 rounded-xl border border-slate-100 dark:border-slate-700">
                {ev[field] || <span className="italic text-slate-400">No response provided.</span>}
              </p>
            </div>
          ))}

          {/* Submitted date */}
          <p className="text-xs text-slate-400 text-right">
            Submitted: {ev.submittedAt || ev.submitted_at
              ? new Date(ev.submittedAt || ev.submitted_at).toLocaleDateString("en-UG", { day: "numeric", month: "long", year: "numeric" })
              : "—"}
          </p>
        </div>
      </motion.div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------
const HREvaluations = () => {
  const { data: rawEvals, loading } = useApi("/evaluations");
  const evaluations = Array.isArray(rawEvals) ? rawEvals : [];

  const [search, setSearch]         = useState("");
  const [deptFilter, setDeptFilter] = useState("All");
  const [selectedEval, setSelectedEval] = useState(null);
  const [sortField, setSortField]   = useState("submittedAt");
  const [sortDir, setSortDir]       = useState("desc");

  // Stats
  const totalEvals    = evaluations.length;
  const avgOverall    = avgRating(evaluations, "overallRating");
  const recommendPct  = totalEvals
    ? Math.round((evaluations.filter(e => e.wouldRecommend ?? e.would_recommend).length / totalEvals) * 100)
    : 0;
  const avgSupervisor = avgRating(evaluations, "supervisorRating");

  // Unique departments
  const departments = useMemo(() => {
    const set = new Set(evaluations.map(e => e.department).filter(Boolean));
    return ["All", ...Array.from(set).sort()];
  }, [evaluations]);

  // Filtered + sorted
  const filtered = useMemo(() => {
    let rows = [...evaluations];
    if (deptFilter !== "All") rows = rows.filter(e => e.department === deptFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      rows = rows.filter(e =>
        (e.applicantName || "").toLowerCase().includes(q) ||
        (e.internshipTitle || e.internship_title || "").toLowerCase().includes(q) ||
        (e.department || "").toLowerCase().includes(q)
      );
    }
    rows.sort((a, b) => {
      const camel = sortField;
      const snake = sortField.replace(/([A-Z])/g, "_$1").toLowerCase();
      const va = a[camel] ?? a[snake] ?? "";
      const vb = b[camel] ?? b[snake] ?? "";
      if (typeof va === "number") return sortDir === "asc" ? va - vb : vb - va;
      return sortDir === "asc" ? String(va).localeCompare(String(vb)) : String(vb).localeCompare(String(va));
    });
    return rows;
  }, [evaluations, deptFilter, search, sortField, sortDir]);

  const handleSort = (field) => {
    if (sortField === field) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortField(field); setSortDir("desc"); }
  };

  const SortIcon = ({ field }) =>
    sortField === field
      ? sortDir === "asc" ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />
      : <ChevronDown className="w-3.5 h-3.5 opacity-30" />;

  // Loading skeleton
  if (loading) {
    return (
      <div className="page-container">
        <Breadcrumbs />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-28 rounded-2xl" />)}
        </div>
        <Skeleton className="h-10 rounded-xl mb-4" />
        <Skeleton className="h-64 rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="page-container">
      <Breadcrumbs />

      {/* Page header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-slate-800 dark:text-slate-100 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center shadow-md">
              <ClipboardCheck className="w-5 h-5 text-white" />
            </div>
            Intern Evaluations
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">
            Post-internship feedback submitted by applicants.
          </p>
        </div>
        <div className="text-sm text-slate-500 dark:text-slate-400 font-medium">
          {totalEvals} evaluation{totalEvals !== 1 ? "s" : ""}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total Evaluations", value: totalEvals, icon: Users, color: "from-red-500 to-red-700", text: "text-red-600" },
          { label: "Avg Overall Rating", value: `${avgOverall} / 5`, icon: Star, color: "from-yellow-400 to-yellow-600", text: "text-yellow-600" },
          { label: "Would Recommend", value: `${recommendPct}%`, icon: ThumbsUp, color: "from-emerald-500 to-teal-600", text: "text-emerald-600" },
          { label: "Avg Supervisor Rating", value: `${avgSupervisor} / 5`, icon: Award, color: "from-purple-500 to-purple-700", text: "text-purple-600" },
        ].map(({ label, value, icon: Icon, color, text }) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="card p-5"
          >
            <div className="flex items-center justify-between mb-3">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center shadow-sm`}>
                <Icon className="w-5 h-5 text-white" />
              </div>
            </div>
            <p className={`text-2xl font-black ${text}`}>{value}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">{label}</p>
          </motion.div>
        ))}
      </div>

      {/* Filters */}
      <div className="card p-4 mb-5 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            className="form-input pl-9"
            placeholder="Search by applicant, internship, or department…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <select
          className="form-input sm:w-56"
          value={deptFilter}
          onChange={e => setDeptFilter(e.target.value)}
        >
          {departments.map(d => <option key={d} value={d}>{d === "All" ? "All Departments" : d}</option>)}
        </select>
      </div>

      {/* Empty state */}
      {filtered.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="card p-16 flex flex-col items-center justify-center text-center gap-4"
        >
          <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
            <ClipboardCheck className="w-7 h-7 text-slate-400" />
          </div>
          <div>
            <p className="font-bold text-slate-600 dark:text-slate-300">No evaluations found</p>
            <p className="text-sm text-slate-400 mt-1">
              {totalEvals === 0
                ? "No evaluations have been submitted yet."
                : "Try adjusting your search or filter."}
            </p>
          </div>
        </motion.div>
      ) : (
        /* Table */
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-700/50 border-b border-slate-100 dark:border-slate-700">
                  {[
                    { label: "Applicant",         field: "applicantName" },
                    { label: "Internship",         field: "internshipTitle" },
                    { label: "Department",         field: "department" },
                    { label: "Overall",            field: "overallRating" },
                    { label: "Supervisor",         field: "supervisorRating" },
                    { label: "Learning",           field: "learningRating" },
                    { label: "Facilities",         field: "facilitiesRating" },
                    { label: "Recommend",          field: "wouldRecommend" },
                    { label: "Submitted",          field: "submittedAt" },
                    { label: "",                   field: null },
                  ].map(({ label, field }) => (
                    <th
                      key={label}
                      className={`px-4 py-3 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide whitespace-nowrap ${field ? "cursor-pointer hover:text-slate-700 dark:hover:text-slate-200 select-none" : ""}`}
                      onClick={() => field && handleSort(field)}
                    >
                      <span className="flex items-center gap-1">
                        {label}
                        {field && <SortIcon field={field} />}
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                <AnimatePresence>
                  {filtered.map((ev, i) => {
                    const recommend = ev.wouldRecommend ?? ev.would_recommend;
                    const submittedDate = ev.submittedAt || ev.submitted_at;
                    return (
                      <motion.tr
                        key={ev.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.02 }}
                        className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors"
                      >
                        <td className="px-4 py-3">
                          <div>
                            <p className="font-semibold text-slate-700 dark:text-slate-200 truncate max-w-[140px]">
                              {ev.applicantName || "—"}
                            </p>
                            <p className="text-xs text-slate-400 truncate max-w-[140px]">{ev.applicantEmail || ""}</p>
                          </div>
                        </td>
                        <td className="px-4 py-3 max-w-[180px]">
                          <p className="text-slate-600 dark:text-slate-300 truncate text-xs font-medium">
                            {ev.internshipTitle || ev.internship_title || "—"}
                          </p>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-[120px] block">
                            {ev.department || "—"}
                          </span>
                        </td>
                        {["overallRating", "supervisorRating", "learningRating", "facilitiesRating"].map(key => {
                          const val = getVal(ev, key);
                          return (
                            <td key={key} className="px-4 py-3">
                              <div className="flex flex-col gap-0.5">
                                <StarDisplay value={val} />
                                <span className="text-[10px] text-slate-400">{ratingLabel[val]}</span>
                              </div>
                            </td>
                          );
                        })}
                        <td className="px-4 py-3">
                          {recommend ? (
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-xs font-semibold">
                              <ThumbsUp className="w-3 h-3" /> Yes
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-xs font-semibold">
                              <ThumbsDown className="w-3 h-3" /> No
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-xs text-slate-400">
                          {submittedDate ? new Date(submittedDate).toLocaleDateString("en-UG", { day: "numeric", month: "short", year: "numeric" }) : "—"}
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => setSelectedEval(ev)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-xs font-semibold hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
                          >
                            <MessageSquare className="w-3.5 h-3.5" /> View
                          </button>
                        </td>
                      </motion.tr>
                    );
                  })}
                </AnimatePresence>
              </tbody>
            </table>
          </div>

          {/* Table footer */}
          <div className="px-4 py-3 border-t border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50">
            <p className="text-xs text-slate-400">
              Showing {filtered.length} of {totalEvals} evaluation{totalEvals !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedEval && (
          <EvalModal evaluation={selectedEval} onClose={() => setSelectedEval(null)} />
        )}
      </AnimatePresence>
    </div>
  );
};

export default HREvaluations;
