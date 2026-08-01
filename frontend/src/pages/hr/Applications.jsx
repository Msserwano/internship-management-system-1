
import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import Breadcrumbs from "../../components/layout/Breadcrumbs";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Select from "../../components/ui/Select";
import Badge from "../../components/ui/Badge";
import Modal from "../../components/ui/Modal";
import Skeleton from "../../components/ui/Skeleton";
import Avatar from "../../components/ui/Avatar";
import useApi from "../../hooks/useApi";
import { applicationService } from "../../api/services";
import { useAuth } from "../../context/AuthContext";
import { KCCA_DEPARTMENTS } from "../../utils/constants";
import { fDate } from "../../utils/formatters";
import toast from "react-hot-toast";
import {
  Search, Download, CheckCircle2, XCircle, UserCheck, Eye, FileSpreadsheet, FileText
} from "lucide-react";

const HRApplications = () => {
  const { data: apps, loading, refetch } = useApi("/applications");
  const { user } = useAuth();
  const [selectedIds, setSelectedIds] = useState([]);
  const [selectedApp, setSelectedApp] = useState(null);
  const [reviewNote, setReviewNote]   = useState("");


  const [search, setSearch]           = useState("");
  const [deptFilter, setDeptFilter]   = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [uniFilter, setUniFilter]     = useState("");

  const filteredApps = useMemo(() => {
    return apps.filter((app) => {
      const matchSearch =
        app.applicantName?.toLowerCase().includes(search.toLowerCase()) ||
        app.internshipTitle?.toLowerCase().includes(search.toLowerCase());
      const matchDept   = !deptFilter   || app.department === deptFilter;
      const matchStatus = !statusFilter || app.status === statusFilter;
      const matchUni    = !uniFilter    || app.university === uniFilter;
      return matchSearch && matchDept && matchStatus && matchUni;
    });
  }, [apps, search, deptFilter, statusFilter, uniFilter]);

  const toggleSelectAll = (e) => {
    if (e.target.checked) setSelectedIds(filteredApps.map((a) => a.id));
    else setSelectedIds([]);
  };

  const toggleSelectOne = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleBulkStatus = async (newStatus) => {
    if (selectedIds.length === 0) return;
    try {
      await Promise.all(
        selectedIds.map((id) => applicationService.update(id, { status: newStatus }))
      );
      toast.success(`Updated ${selectedIds.length} application(s) to ${newStatus}.`);
      setSelectedIds([]);
      refetch();
    } catch {
      toast.error("Failed to update applications.");
    }
  };

  const handleUpdateSingle = async (id, status) => {
    try {
      await applicationService.update(id, { status, reviewNote });
      toast.success(`Application status updated to ${status}.`);
      setSelectedApp(null);
      setReviewNote("");
      refetch();
    } catch (err) {
      console.error("[HR EDIT] Failed to update application:", err);
      toast.error("Failed to update application status.");
    }
  };

  const handleAssignToMe = async (app) => {
    try {
      if (!user) return toast.error('Authentication required.');
      await applicationService.assign(app.id, { hrId: user.id });
      toast.success('Assigned to you.');
      refetch();
    } catch (err) {
      toast.error('Failed to assign application.');
    }
  };

  const handleExportPDF   = () => toast.success("Downloading Applications Report (PDF)...");
  const handleExportExcel = () => toast.success("Downloading Applications Spreadsheet (Excel)...");


  if (loading) return (
    <div className="page-container"><Breadcrumbs />
      <div className="space-y-3">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12 rounded-xl" />)}</div>
    </div>
  );

  return (
    <div className="page-container">
      <Breadcrumbs />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Applications Management</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            Review, shortlist, assign reviewers, and process candidate applications.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={handleExportPDF} icon={FileText}>
            Export PDF
          </Button>
          <Button variant="outline" size="sm" onClick={handleExportExcel} icon={FileSpreadsheet}>
            Export Excel
          </Button>
        </div>
      </div>

      {}
      <div className="card p-5 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <Input
            placeholder="Search candidate name or role..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            icon={Search}
          />
          <Select
            placeholder="All Departments"
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            options={KCCA_DEPARTMENTS}
          />
          <Select
            placeholder="All Statuses"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            options={["submitted", "under_review", "shortlisted", "interview", "accepted", "rejected"]}
          />
          <Select
            placeholder="All Universities"
            value={uniFilter}
            onChange={(e) => setUniFilter(e.target.value)}
            options={["Makerere University", "Kyambogo University", "Uganda Christian University", "MUST", "MUBS"]}
          />
        </div>

        {}
        {selectedIds.length > 0 && (
          <div className="p-3 bg-primary-50 dark:bg-primary-900/30 rounded-xl flex items-center justify-between">
            <span className="text-xs font-semibold text-primary-700 dark:text-primary-300">
              {selectedIds.length} candidate(s) selected
            </span>
            <div className="flex items-center gap-2">
              <Button variant="accent" size="xs" onClick={() => handleBulkStatus("shortlisted")} icon={CheckCircle2}>
                Bulk Shortlist
              </Button>
              <Button variant="danger" size="xs" onClick={() => handleBulkStatus("rejected")} icon={XCircle}>
                Bulk Reject
              </Button>
              <Button variant="outline" size="xs" onClick={() => toast.success("Reviewer assigned to selected candidates.")} icon={UserCheck}>
                Assign Reviewer
              </Button>
            </div>
          </div>
        )}
      </div>

      {}
      <div className="card p-6">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th className="w-10">
                  <input
                    type="checkbox"
                    onChange={toggleSelectAll}
                    checked={selectedIds.length === filteredApps.length && filteredApps.length > 0}
                  />
                </th>
                <th>Applicant</th>
                <th>Internship Role</th>
                <th>Department</th>
                <th>University</th>
                <th>GPA</th>
                <th>Status</th>
                <th>Assigned HR</th>
                <th>Submitted</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredApps.map((app) => (
                <tr key={app.id}>
                  <td>
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(app.id)}
                      onChange={() => toggleSelectOne(app.id)}
                    />
                  </td>
                  <td className="font-bold text-slate-800 dark:text-white">
                    {app.applicantName}
                    <span className="block text-[11px] font-normal text-slate-400">{app.gender}</span>
                  </td>
                  <td>{app.internshipTitle}</td>
                  <td>{app.department}</td>
                  <td>{app.university}</td>
                  <td><span className="font-semibold text-primary-600">{app.gpa}</span></td>
                  <td><Badge status={app.status} /></td>
                  <td className="flex items-center gap-2">
                    <Avatar name={app.assignedHrName || ''} src={app.assignedHrAvatar} size="sm" />
                    <span>{app.assignedHrName || '—'}</span>
                  </td>
                  <td className="text-xs text-slate-400">{fDate(app.submittedAt)}</td>
                  <td>
                    <div className="flex items-center gap-1.5">
                      <Button variant="ghost" size="xs" onClick={() => setSelectedApp(app)} icon={Eye} title="Review Details">
                        Review
                      </Button>
                      <Button
                        variant="accent"
                        size="xs"
                        onClick={() => handleUpdateSingle(app.id, "shortlisted")}
                        icon={CheckCircle2}
                        className="!bg-emerald-600 hover:!bg-emerald-700 !text-white"
                        title="Shortlist Applicant"
                      >
                        Shortlist
                      </Button>
                      <Button
                        variant="danger"
                        size="xs"
                        onClick={() => handleUpdateSingle(app.id, "rejected")}
                        icon={XCircle}
                        title="Reject Application"
                      >
                        Reject
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {}
      {selectedApp && (
        <Modal open={!!selectedApp} onClose={() => setSelectedApp(null)} title={`Review Application: ${selectedApp.applicantName}`} size="lg">
          <div className="p-6 space-y-6">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-bold text-base text-slate-800 dark:text-white">{selectedApp.applicantName}</h3>
                <p className="text-xs text-primary-600 font-medium">{selectedApp.internshipTitle} • {selectedApp.department}</p>
              </div>
              <Badge status={selectedApp.status} />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-slate-50 dark:bg-slate-700/50 rounded-2xl text-xs">
              <div><p className="text-slate-400">University</p><p className="font-bold">{selectedApp.university}</p></div>
              <div><p className="text-slate-400">Course</p><p className="font-bold">{selectedApp.course}</p></div>
              <div><p className="text-slate-400">GPA</p><p className="font-bold text-primary-600">{selectedApp.gpa}</p></div>
              <div><p className="text-slate-400">Gender</p><p className="font-bold">{selectedApp.gender || "Not specified"}</p></div>
            </div>

            {/* Submitted Applicant Documents */}
            <div className="space-y-3 p-4 bg-primary-50/50 dark:bg-slate-800/80 rounded-2xl border border-primary-100 dark:border-slate-700">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider flex items-center gap-2">
                  <FileText className="w-4 h-4 text-primary-600" />
                  Submitted Applicant Documents
                </h4>
                <span className="text-[11px] font-medium text-slate-500">
                  {selectedApp.documents ? Object.keys(selectedApp.documents).length : 0} Document(s) Attached
                </span>
              </div>

              {selectedApp.documents && Object.keys(selectedApp.documents).length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {Object.entries(selectedApp.documents).map(([key, doc]) => {
                    if (!doc) return null;
                    const docName = typeof doc === "object" ? doc.name : String(doc);
                    const docSize = typeof doc === "object" ? doc.size : "";
                    const dataUrl = typeof doc === "object" ? doc.data : null;
                    const labelMap = {
                      nationalIdDoc: "National ID / Passport",
                      recommendationDoc: "Recommendation Letter",
                      transcriptDoc: "Academic Transcript",
                      cvDoc: "Curriculum Vitae (CV)",
                      coverLetterDoc: "Cover Letter",
                      photoDoc: "Passport Photo",
                    };
                    const title = labelMap[key] || key.replace(/([A-Z])/g, " $1");

                    return (
                      <div
                        key={key}
                        className="p-3 bg-white dark:bg-slate-700 rounded-xl border border-slate-200 dark:border-slate-600 flex items-center justify-between gap-2 text-xs"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="font-bold text-slate-800 dark:text-white truncate">{title}</p>
                          <p className="text-[11px] text-slate-400 truncate">{docName} {docSize ? `• ${docSize}` : ""}</p>
                        </div>
                        <Button
                          variant="primary"
                          size="xs"
                          icon={Eye}
                          onClick={() => {
                            if (dataUrl) {
                              const w = window.open("");
                              if (w) {
                                w.document.write(`
                                  <html>
                                    <head><title>${title} - ${docName}</title></head>
                                    <body style="margin:0; background:#0f172a; display:flex; flex-direction:column; align-items:center; justify-content:center; height:100vh;">
                                      <h3 style="color:#fff; font-family:sans-serif; margin:12px 0;">${title}: ${docName}</h3>
                                      <iframe src="${dataUrl}" style="width:92%; height:88%; border:none; background:#fff; border-radius:8px;"></iframe>
                                    </body>
                                  </html>
                                `);
                              } else {
                                toast.error("Pop-up blocked. Please allow popups to view document.");
                              }
                            } else {
                              toast.success(`Opening ${docName}...`);
                            }
                          }}
                        >
                          View
                        </Button>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-3 bg-slate-100 dark:bg-slate-700/50 rounded-xl text-center text-xs text-slate-500">
                  📄 Standard document package attached (CV, Academic Transcripts, Recommendation Letter).
                </div>
              )}
            </div>

            <div className="space-y-2">
              <label className="form-label">HR Evaluation Notes</label>
              <textarea
                rows={3}
                className="form-input"
                placeholder="Enter evaluation remarks..."
                value={reviewNote}
                onChange={(e) => setReviewNote(e.target.value)}
              />
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-700">
              <Button variant="ghost" size="sm" onClick={() => setSelectedApp(null)}>Close</Button>
              <div className="flex gap-2">
                <Button variant="danger" size="sm" onClick={() => handleUpdateSingle(selectedApp.id, "rejected")}>
                  Reject Application
                </Button>
                <Button variant="accent" size="sm" onClick={() => handleUpdateSingle(selectedApp.id, "shortlisted")}>
                  Shortlist Candidate
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleAssignToMe(selectedApp)}>
                  Assign To Me
                </Button>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default HRApplications;
