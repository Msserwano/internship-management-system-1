
import { useState } from "react";
import Breadcrumbs from "../../components/layout/Breadcrumbs";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Avatar from "../../components/ui/Avatar";
import Modal from "../../components/ui/Modal";
import Skeleton from "../../components/ui/Skeleton";
import useApi from "../../hooks/useApi";
import { Search, Mail, Phone, GraduationCap, Eye, Download } from "lucide-react";
import toast from "react-hot-toast";

const HRApplicants = () => {
  const { data: users, loading } = useApi("/users");
  const [search, setSearch] = useState("");
  const [selectedApplicant, setSelectedApplicant] = useState(null);

  const applicants = users.filter(u => u.role === "applicant").filter(a =>
    a.name?.toLowerCase().includes(search.toLowerCase()) ||
    a.email?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return (
    <div className="page-container"><Breadcrumbs />
      <div className="space-y-3">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-12 rounded-xl" />)}</div>
    </div>
  );

  return (
    <div className="page-container">
      <Breadcrumbs />

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Applicant Directory</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            Registered candidate directory and profile records.
          </p>
        </div>
      </div>

      <div className="card p-4">
        <Input
          placeholder="Search applicants by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          icon={Search}
          className="max-w-md"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {applicants.map((a) => (
          <div key={a.id} className="card p-5 space-y-4 hover:shadow-card-md transition">
            <div className="flex items-center gap-3">
              <Avatar name={a.name} size="md" />
              <div>
                <h3 className="font-bold text-slate-800 dark:text-white text-sm">{a.name}</h3>
                <p className="text-xs text-slate-400">{a.email}</p>
              </div>
            </div>

            <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
              <div className="flex items-center gap-2"><Phone className="w-3.5 h-3.5 text-slate-400"/> +256 701 234 567</div>
              <div className="flex items-center gap-2"><GraduationCap className="w-3.5 h-3.5 text-slate-400"/> Makerere University</div>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-700 flex justify-between items-center">
              <span className="text-[10px] text-slate-400">Joined {a.joinedAt}</span>
              <Button variant="outline" size="xs" onClick={() => setSelectedApplicant(a)} icon={Eye}>
                View Profile
              </Button>
            </div>
          </div>
        ))}
      </div>

      {selectedApplicant && (
        <Modal open={!!selectedApplicant} onClose={() => setSelectedApplicant(null)} title="Applicant Profile" size="md">
          <div className="p-6 space-y-4 text-sm">
            <div className="flex items-center gap-4">
              <Avatar name={selectedApplicant.name} size="lg" />
              <div>
                <h3 className="font-bold text-slate-800 dark:text-white text-base">{selectedApplicant.name}</h3>
                <p className="text-xs text-slate-500">{selectedApplicant.email}</p>
              </div>
            </div>

            <div className="space-y-2 p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
              <p><strong>University:</strong> Makerere University</p>
              <p><strong>Course:</strong> Computer Science</p>
              <p><strong>GPA:</strong> 4.2</p>
              <p><strong>District:</strong> Kampala</p>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-700">
              <Button variant="ghost" size="sm" onClick={() => setSelectedApplicant(null)}>Close</Button>
              <Button variant="primary" size="sm" onClick={() => toast.success("Downloading candidate dossier...")} icon={Download}>
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
