
import { useState, useMemo } from "react";
import Breadcrumbs from "../../components/layout/Breadcrumbs";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Select from "../../components/ui/Select";
import Avatar from "../../components/ui/Avatar";
import Modal from "../../components/ui/Modal";
import Skeleton from "../../components/ui/Skeleton";
import EmptyState from "../../components/ui/EmptyState";
import useApi from "../../hooks/useApi";
import {
  Search, Mail, Phone, GraduationCap, Eye, Download, Users, BookOpen,
  Calendar, LayoutList, LayoutGrid, MapPin, Award, FileSpreadsheet
} from "lucide-react";
import { fDate } from "../../utils/formatters";
import toast from "react-hot-toast";

const HRApplicants = () => {
  const { data: applicants, loading } = useApi("/applicants");
  const [search, setSearch] = useState("");
  const [institutionFilter, setInstitutionFilter] = useState("");
  const [viewMode, setViewMode] = useState("list");
  const [selectedIds, setSelectedIds] = useState([]);
  const [selectedApplicant, setSelectedApplicant] = useState(null);

  const institutions = useMemo(() => {
    const set = new Set();
    (applicants || []).forEach((a) => {
      if (a.institution) set.add(a.institution);
    });
    return Array.from(set);
  }, [applicants]);

  const filtered = useMemo(() => {
    return (applicants || []).filter((a) => {
      const matchSearch =
        !search ||
        a.name?.toLowerCase().includes(search.toLowerCase()) ||
        a.email?.toLowerCase().includes(search.toLowerCase()) ||
        a.institution?.toLowerCase().includes(search.toLowerCase()) ||
        a.course?.toLowerCase().includes(search.toLowerCase()) ||
        a.phone?.toLowerCase().includes(search.toLowerCase());
      
      const matchInst = !institutionFilter || a.institution === institutionFilter;
      return matchSearch && matchInst;
    });
  }, [applicants, search, institutionFilter]);

  const toggleSelectAll = (e) => {
    if (e.target.checked) setSelectedIds(filtered.map((a) => a.id));
    else setSelectedIds([]);
  };

  const toggleSelectOne = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const exportToCSV = (itemsToExport) => {
    const list = itemsToExport && itemsToExport.length > 0 ? itemsToExport : filtered;
    if (list.length === 0) {
      toast.error("No applicants to export.");
      return;
    }

    const headers = ["ID", "Full Name", "Email", "Phone", "Institution", "Course", "Year Level", "GPA", "District", "Registered Date"];
    const rows = list.map((a) => [
      a.id || "",
      `"${a.name || ''}"`,
      `"${a.email || ''}"`,
      `"${a.phone || ''}"`,
      `"${a.institution || ''}"`,
      `"${a.course || ''}"`,
      `"${a.year_of_study || a.year_level || ''}"`,
      `"${a.gpa || ''}"`,
      `"${a.district || ''}"`,
      `"${fDate(a.created_at)}"`
    ]);

    const csvContent = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `kcca_applicants_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success(`Exported ${list.length} applicant records to CSV.`);
  };

  if (loading) {
    return (
      <div className="page-container">
        <Breadcrumbs />
        <div className="space-y-4">
          <Skeleton className="h-10 w-64 rounded-xl" />
          <Skeleton className="h-16 w-full rounded-2xl" />
          <Skeleton className="h-96 w-full rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <Breadcrumbs />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Applicant Directory</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            Registered candidate profiles — <strong>{applicants.length}</strong> applicant{applicants.length !== 1 ? 's' : ''} on record.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* View Mode Toggle */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setViewMode("list")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                viewMode === "list"
                  ? "bg-white dark:bg-slate-700 text-primary-600 dark:text-primary-400 shadow-sm"
                  : "text-slate-500 hover:text-slate-800 dark:hover:text-white"
              }`}
              title="List Table View"
            >
              <LayoutList className="w-4 h-4" />
              List View
            </button>
            <button
              onClick={() => setViewMode("grid")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                viewMode === "grid"
                  ? "bg-white dark:bg-slate-700 text-primary-600 dark:text-primary-400 shadow-sm"
                  : "text-slate-500 hover:text-slate-800 dark:hover:text-white"
              }`}
              title="Grid Card View"
            >
              <LayoutGrid className="w-4 h-4" />
              Grid View
            </button>
          </div>

          <Button
            variant="outline"
            size="sm"
            icon={Download}
            onClick={() => exportToCSV(selectedIds.length > 0 ? filtered.filter(a => selectedIds.includes(a.id)) : filtered)}
          >
            Export CSV
          </Button>
        </div>
      </div>

      {/* Stats Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Total Applicants</p>
            <p className="text-2xl font-bold text-slate-800 dark:text-white">{applicants.length}</p>
          </div>
        </div>

        <div className="card p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Universities & Colleges</p>
            <p className="text-2xl font-bold text-slate-800 dark:text-white">{institutions.length}</p>
          </div>
        </div>

        <div className="card p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Filtered Candidates</p>
            <p className="text-2xl font-bold text-slate-800 dark:text-white">{filtered.length}</p>
          </div>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="card p-4 space-y-3 sm:space-y-0 sm:flex sm:items-center sm:justify-between gap-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1">
          <Input
            id="applicant-search"
            placeholder="Search by name, email, university or course..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            icon={Search}
            className="max-w-md"
          />

          <Select
            value={institutionFilter}
            onChange={(e) => setInstitutionFilter(e.target.value)}
            options={[
              { value: "", label: "All Universities / Institutions" },
              ...institutions.map((inst) => ({ value: inst, label: inst }))
            ]}
            className="w-full sm:w-64"
          />

          {(search || institutionFilter) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => { setSearch(""); setInstitutionFilter(""); }}
              className="text-slate-500"
            >
              Reset Filters
            </Button>
          )}
        </div>

        {selectedIds.length > 0 && (
          <div className="flex items-center gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-700">
            <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
              {selectedIds.length} selected
            </span>
            <Button
              variant="outline"
              size="xs"
              icon={FileSpreadsheet}
              onClick={() => exportToCSV(filtered.filter(a => selectedIds.includes(a.id)))}
            >
              Export Selected
            </Button>
          </div>
        )}
      </div>

      {/* Content Rendering: List View vs Grid View */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No Applicants Found"
          description={search || institutionFilter ? "No registered applicants match your filter criteria." : "No applicants have registered yet."}
        />
      ) : viewMode === "list" ? (
        /* LIST FORM TABLE */
        <div className="card p-0 overflow-hidden shadow-card">
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th className="w-10">
                    <input
                      type="checkbox"
                      onChange={toggleSelectAll}
                      checked={selectedIds.length === filtered.length && filtered.length > 0}
                      className="rounded border-slate-300 dark:border-slate-600 text-primary-600 focus:ring-primary-500"
                    />
                  </th>
                  <th>Applicant Name & Email</th>
                  <th>Contact Info</th>
                  <th>Institution / University</th>
                  <th>Course & Level</th>
                  <th>GPA</th>
                  <th>Registered</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((a) => (
                  <tr key={a.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-700/30 transition-colors">
                    <td>
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(a.id)}
                        onChange={() => toggleSelectOne(a.id)}
                        className="rounded border-slate-300 dark:border-slate-600 text-primary-600 focus:ring-primary-500"
                      />
                    </td>
                    <td>
                      <div className="flex items-center gap-3">
                        <Avatar name={a.name} size="sm" />
                        <div className="min-w-0">
                          <p className="font-bold text-slate-800 dark:text-white text-sm hover:text-primary-600 transition-colors">
                            {a.name}
                          </p>
                          <p className="text-xs text-slate-400 truncate">{a.email}</p>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="space-y-0.5 text-xs text-slate-600 dark:text-slate-300">
                        {a.phone ? (
                          <div className="flex items-center gap-1.5">
                            <Phone className="w-3 h-3 text-slate-400" />
                            <span>{a.phone}</span>
                          </div>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                        {a.district && (
                          <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                            <MapPin className="w-3 h-3" />
                            <span>{a.district}</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center gap-1.5 text-xs font-medium text-slate-700 dark:text-slate-200">
                        <GraduationCap className="w-3.5 h-3.5 text-primary-500 flex-shrink-0" />
                        <span className="truncate max-w-[200px]">{a.institution || "—"}</span>
                      </div>
                    </td>
                    <td>
                      <div className="space-y-0.5">
                        <p className="text-xs font-semibold text-slate-800 dark:text-white truncate max-w-[180px]">
                          {a.course || "—"}
                        </p>
                        {(a.year_of_study || a.year_level) && (
                          <span className="inline-block text-[10px] bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded-full font-medium">
                            {a.year_of_study || a.year_level}
                          </span>
                        )}
                      </div>
                    </td>
                    <td>
                      {a.gpa ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                          {a.gpa}
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400">—</span>
                      )}
                    </td>
                    <td>
                      <span className="text-xs text-slate-500 whitespace-nowrap">
                        {fDate(a.created_at)}
                      </span>
                    </td>
                    <td className="text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {a.email && (
                          <a
                            href={`mailto:${a.email}`}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors"
                            title={`Email ${a.name}`}
                          >
                            <Mail className="w-4 h-4" />
                          </a>
                        )}
                        <Button
                          id={`view-applicant-${a.id}`}
                          variant="outline"
                          size="xs"
                          onClick={() => setSelectedApplicant(a)}
                          icon={Eye}
                        >
                          View Profile
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* GRID FORM CARDS */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((a) => (
            <div
              key={a.id}
              className="card p-5 space-y-4 hover:shadow-card-md transition-all duration-200"
            >
              {/* Avatar + Name */}
              <div className="flex items-center gap-3">
                <Avatar name={a.name} size="md" />
                <div className="min-w-0">
                  <h3 className="font-bold text-slate-800 dark:text-white text-sm truncate">{a.name}</h3>
                  <p className="text-xs text-slate-400 truncate">{a.email}</p>
                </div>
              </div>

              {/* Details */}
              <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                {a.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                    <span className="truncate">{a.phone}</span>
                  </div>
                )}
                {a.institution && (
                  <div className="flex items-center gap-2">
                    <GraduationCap className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                    <span className="truncate">{a.institution}</span>
                  </div>
                )}
                {a.course && (
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                    <span className="truncate">{a.course}</span>
                  </div>
                )}
                {(a.year_of_study || a.year_level) && (
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                    <span>{a.year_of_study || a.year_level}</span>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-700 flex justify-between items-center">
                <span className="text-[10px] text-slate-400">Registered {fDate(a.created_at)}</span>
                <Button
                  id={`view-applicant-${a.id}`}
                  variant="outline"
                  size="xs"
                  onClick={() => setSelectedApplicant(a)}
                  icon={Eye}
                >
                  View Profile
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Profile Modal */}
      {selectedApplicant && (
        <Modal
          open={!!selectedApplicant}
          onClose={() => setSelectedApplicant(null)}
          title="Applicant Profile"
          size="md"
        >
          <div className="p-6 space-y-5 text-sm">
            {/* Header */}
            <div className="flex items-center gap-4">
              <Avatar name={selectedApplicant.name} size="lg" />
              <div>
                <h3 className="font-bold text-slate-800 dark:text-white text-base">{selectedApplicant.name}</h3>
                <div className="flex items-center gap-1.5 mt-1">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <a href={`mailto:${selectedApplicant.email}`} className="text-xs text-primary-600 hover:underline">
                    {selectedApplicant.email}
                  </a>
                </div>
                {selectedApplicant.phone && (
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <p className="text-xs text-slate-500">{selectedApplicant.phone}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Personal & Academic Details */}
            <div className="space-y-3 p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
              <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Academic & Personal Details</h4>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-slate-400">Institution / University</p>
                  <p className="font-semibold text-slate-800 dark:text-white text-sm">{selectedApplicant.institution || '—'}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Course of Study</p>
                  <p className="font-semibold text-slate-800 dark:text-white text-sm">{selectedApplicant.course || '—'}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Year Level</p>
                  <p className="font-semibold text-slate-800 dark:text-white text-sm">{selectedApplicant.year_of_study || selectedApplicant.year_level || '—'}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">GPA / Grade Point</p>
                  <p className="font-semibold text-emerald-600 dark:text-emerald-400 text-sm">{selectedApplicant.gpa || '—'}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Gender / Nationality</p>
                  <p className="font-semibold text-slate-800 dark:text-white text-sm">
                    {selectedApplicant.gender || '—'} {selectedApplicant.nationality ? `(${selectedApplicant.nationality})` : ''}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">District / Location</p>
                  <p className="font-semibold text-slate-800 dark:text-white text-sm">{selectedApplicant.district || selectedApplicant.address || '—'}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">National ID</p>
                  <p className="font-semibold text-slate-800 dark:text-white text-sm">{selectedApplicant.national_id || '—'}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Registration Date</p>
                  <p className="font-semibold text-slate-800 dark:text-white text-sm">{fDate(selectedApplicant.created_at)}</p>
                </div>
              </div>
            </div>

            {/* Skills & Languages if available */}
            {selectedApplicant.skills && selectedApplicant.skills.length > 0 && (
              <div>
                <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Skills</h4>
                <div className="flex flex-wrap gap-1.5">
                  {selectedApplicant.skills.map((s, idx) => (
                    <span key={idx} className="px-2.5 py-1 rounded-md text-xs font-medium bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-700">
              <Button variant="ghost" size="sm" onClick={() => setSelectedApplicant(null)}>Close</Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => exportToCSV([selectedApplicant])}
                icon={Download}
              >
                Export Profile CSV
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default HRApplicants;
