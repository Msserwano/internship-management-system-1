
import { useState } from "react";
import Breadcrumbs from "../../components/layout/Breadcrumbs";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Avatar from "../../components/ui/Avatar";
import Modal from "../../components/ui/Modal";
import Skeleton from "../../components/ui/Skeleton";
import EmptyState from "../../components/ui/EmptyState";
import useApi from "../../hooks/useApi";
import { Search, Mail, Phone, GraduationCap, Eye, Download, Users, BookOpen, Calendar } from "lucide-react";
import { fDate } from "../../utils/formatters";
import toast from "react-hot-toast";

const HRApplicants = () => {
  const { data: applicants, loading } = useApi("/applicants");
  const [search, setSearch] = useState("");
  const [selectedApplicant, setSelectedApplicant] = useState(null);

  const filtered = applicants.filter((a) =>
    !search ||
    a.name?.toLowerCase().includes(search.toLowerCase()) ||
    a.email?.toLowerCase().includes(search.toLowerCase()) ||
    a.institution?.toLowerCase().includes(search.toLowerCase()) ||
    a.course?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return (
    <div className="page-container"><Breadcrumbs />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-44 rounded-2xl" />)}
      </div>
    </div>
  );

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
        <Button
          variant="outline"
          size="sm"
          icon={Download}
          onClick={() => toast.success("Exporting applicant directory...")}
        >
          Export CSV
        </Button>
      </div>

      {/* Search */}
      <div className="card p-4">
        <Input
          id="applicant-search"
          placeholder="Search by name, email, university or course..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          icon={Search}
          className="max-w-lg"
        />
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No Applicants Found"
          description={search ? "No applicants match your search." : "No applicants have registered yet."}
        />
      ) : (
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
                {a.year_level && (
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                    <span>{a.year_level}</span>
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
                  <p className="text-xs text-slate-500">{selectedApplicant.email}</p>
                </div>
                {selectedApplicant.phone && (
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <p className="text-xs text-slate-500">{selectedApplicant.phone}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Academic Details */}
            <div className="space-y-2 p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
              <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Academic Information</h4>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-slate-400">Institution</p>
                  <p className="font-semibold text-slate-800 dark:text-white text-sm">{selectedApplicant.institution || '—'}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Course</p>
                  <p className="font-semibold text-slate-800 dark:text-white text-sm">{selectedApplicant.course || '—'}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Year Level</p>
                  <p className="font-semibold text-slate-800 dark:text-white text-sm">{selectedApplicant.year_level || '—'}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Registered</p>
                  <p className="font-semibold text-slate-800 dark:text-white text-sm">{fDate(selectedApplicant.created_at)}</p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-700">
              <Button variant="ghost" size="sm" onClick={() => setSelectedApplicant(null)}>Close</Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => toast.success("Downloading candidate dossier...")}
                icon={Download}
              >
                Export Dossier
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default HRApplicants;
