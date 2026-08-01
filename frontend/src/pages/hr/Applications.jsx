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
import { exportApplicationsToPDF, exportApplicationsToExcel } from "../../utils/exportApplications";
import toast from "react-hot-toast";
import {
  Search, Download, CheckCircle2, XCircle, UserCheck, Eye, FileSpreadsheet, FileText,
  AlertCircle, FileCode, ExternalLink, Paperclip
} from "lucide-react";

const HRApplications = () => {
  const { data: apps, loading, refetch } = useApi("/applications");
  const { user } = useAuth();
  const [selectedIds, setSelectedIds] = useState([]);
  const [selectedApp, setSelectedApp] = useState(null);
  const [reviewNote, setReviewNote]   = useState("");
  const [docPreview,  setDocPreview]  = useState(null);
  const [exporting,   setExporting]   = useState(false);


  const [search, setSearch]           = useState("");
  const [deptFilter, setDeptFilter]   = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [uniFilter, setUniFilter]     = useState("");

  const filteredApps = useMemo(() => {
    return apps.filter((app) => {
      const matchSearch =
        !search ||
        app.applicantName?.toLowerCase().includes(search.toLowerCase()) ||
        app.internshipTitle?.toLowerCase().includes(search.toLowerCase());
      const matchDept   = !deptFilter   || app.department === deptFilter;
      const matchStatus = !statusFilter || app.status === statusFilter;
      const matchUni    = !uniFilter    || (app.university || "").toLowerCase().includes(uniFilter.toLowerCase());
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

  const handleExportPDF = async () => {
    if (filteredApps.length === 0) {
      toast.error("No applications to export.");
      return;
    }
    setExporting(true);
    const toastId = toast.loading(`Generating PDF for ${filteredApps.length} application(s)...`);
    try {
      const filename = await exportApplicationsToPDF(filteredApps, {
        status: statusFilter,
        dept:   deptFilter,
        search,
      });
      toast.success(`PDF downloaded: ${filename}`, { id: toastId });
    } catch (err) {
      console.error("PDF export failed:", err);
      toast.error("Failed to generate PDF. Please try again.", { id: toastId });
    } finally {
      setExporting(false);
    }
  };

  const handleExportExcel = async () => {
    if (filteredApps.length === 0) {
      toast.error("No applications to export.");
      return;
    }
    setExporting(true);
    const toastId = toast.loading(`Generating Excel for ${filteredApps.length} application(s)...`);
    try {
      const filename = await exportApplicationsToExcel(filteredApps, {
        status: statusFilter,
        dept:   deptFilter,
        search,
      });
      toast.success(`Excel downloaded: ${filename}`, { id: toastId });
    } catch (err) {
      console.error("Excel export failed:", err);
      toast.error("Failed to generate Excel file. Please try again.", { id: toastId });
    } finally {
      setExporting(false);
    }
  };


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
          <Button
            variant="outline" size="sm"
            onClick={handleExportPDF}
            icon={FileText}
            loading={exporting}
            disabled={exporting}
          >
            Export PDF
          </Button>
          <Button
            variant="outline" size="sm"
            onClick={handleExportExcel}
            icon={FileSpreadsheet}
            loading={exporting}
            disabled={exporting}
          >
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
                        variant="outline"
                        size="xs"
                        onClick={() => handleUpdateSingle(app.id, "shortlisted")}
                        icon={CheckCircle2}
                        title="Shortlist Applicant"
                      >
                        Shortlist
                      </Button>
                      <Button
                        variant="primary"
                        size="xs"
                        onClick={() => handleUpdateSingle(app.id, "accepted")}
                        icon={UserCheck}
                        className="!bg-emerald-600 hover:!bg-emerald-700 !text-white font-bold"
                        title="Accept & Offer Placement"
                      >
                        Accept &amp; Offer
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
            {(() => {
              const DOC_LABELS = {
                recommendationDoc: "Recommendation Letter",
                transcriptDoc:     "Academic Transcript",
                cvDoc:             "Curriculum Vitae (CV)",
                coverLetterDoc:    "Cover Letter",
                photoDoc:          "Passport Photo",
              };
              const REQUIRED = Object.keys(DOC_LABELS);
              let rawDocs = selectedApp.documents;
              if (typeof rawDocs === "string") {
                try { rawDocs = JSON.parse(rawDocs); } catch { rawDocs = null; }
              }
              const hasDocs = rawDocs && typeof rawDocs === "object" && Object.keys(rawDocs).length > 0;
              const uploadedCount = hasDocs ? Object.values(rawDocs).filter(Boolean).length : 0;

              return (
                <div className="space-y-3 p-4 bg-primary-50/50 dark:bg-slate-800/80 rounded-2xl border border-primary-100 dark:border-slate-700">
                  {/* Header */}
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider flex items-center gap-2">
                      <Paperclip className="w-4 h-4 text-primary-600" />
                      Submitted Documents
                    </h4>
                    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                      uploadedCount === REQUIRED.length
                        ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300"
                        : "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300"
                    }`}>
                      {uploadedCount}/{REQUIRED.length} docs
                    </span>
                  </div>

                  {/* Required doc checklist */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {REQUIRED.map((key) => {
                      const doc      = hasDocs ? rawDocs[key] : null;
                      const uploaded = !!doc;
                      const label    = DOC_LABELS[key];
                      return (
                        <div key={key} className={`flex items-center gap-1.5 p-2 rounded-lg text-[11px] font-medium ${
                          uploaded
                            ? "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800"
                            : "bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800"
                        }`}>
                          {uploaded
                            ? <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
                            : <AlertCircle  className="w-3.5 h-3.5 flex-shrink-0" />}
                          <span className="truncate">{label}</span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Document rows with view/download */}
                  {hasDocs ? (
                    <div className="space-y-2 mt-1">
                      {Object.entries(rawDocs).map(([key, doc]) => {
                        if (!doc) return null;
                        const docName  = typeof doc === "object" ? doc.name  : String(doc);
                        const docSize  = typeof doc === "object" ? doc.size  : "";
                        const dataUrl  = typeof doc === "object" ? doc.data  : null;
                        const docType  = typeof doc === "object" ? doc.type  : "";
                        const isImage  = docType?.startsWith("image") || /\.(png|jpg|jpeg|gif|webp)$/i.test(docName);
                        const title    = DOC_LABELS[key] || key.replace(/([A-Z])/g, " $1");

                        const handleView = () => {
                          if (dataUrl) {
                            setDocPreview({ title, filename: docName, dataUrl, isImage });
                          } else {
                            toast.info("Document data not available for preview.");
                          }
                        };

                        const handleDownload = () => {
                          if (dataUrl) {
                            const a = document.createElement("a");
                            a.href = dataUrl;
                            a.download = docName;
                            a.click();
                          } else {
                            toast.success(`Downloading ${docName}...`);
                          }
                        };

                        return (
                          <div
                            key={key}
                            className="p-3 bg-white dark:bg-slate-700 rounded-xl border border-slate-200 dark:border-slate-600 flex items-center gap-3 text-xs"
                          >
                            <div className="w-8 h-8 bg-primary-50 dark:bg-primary-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                              {isImage
                                ? <img src={dataUrl} alt={title} className="w-8 h-8 object-cover rounded-lg" />
                                : <FileText className="w-4 h-4 text-primary-500" />}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="font-bold text-slate-800 dark:text-white truncate">{title}</p>
                              <p className="text-[10px] text-slate-400 truncate">{docName}{docSize ? ` • ${docSize}` : ""}</p>
                            </div>
                            <div className="flex items-center gap-1 flex-shrink-0">
                              <Button variant="outline" size="xs" icon={Eye}      onClick={handleView}    title="Preview document">View</Button>
                              <Button variant="ghost"   size="xs" icon={Download} onClick={handleDownload} title="Download document" />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="p-4 bg-slate-100 dark:bg-slate-700/50 rounded-xl text-center text-xs text-slate-500">
                      <FileCode className="w-6 h-6 text-slate-400 mx-auto mb-1" />
                      No documents were attached with this application.
                    </div>
                  )}
                </div>
              );
            })()}

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
              <div className="flex flex-wrap gap-2">
                <Button variant="danger" size="sm" onClick={() => handleUpdateSingle(selectedApp.id, "rejected")}>
                  Reject Application
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleUpdateSingle(selectedApp.id, "shortlisted")}>
                  Shortlist Candidate
                </Button>
                <Button variant="primary" size="sm" className="!bg-emerald-600 hover:!bg-emerald-700 !text-white font-bold" onClick={() => handleUpdateSingle(selectedApp.id, "accepted")}>
                  Accept &amp; Offer Placement
                </Button>
                <Button variant="ghost" size="sm" onClick={() => handleAssignToMe(selectedApp)}>
                  Assign To Me
                </Button>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Document Full Preview Modal */}
      {docPreview && (
        <Modal open={!!docPreview} onClose={() => setDocPreview(null)} title={docPreview.title} size="xl">
          <div className="p-6 space-y-4">
            <p className="text-xs text-slate-500 text-center">{docPreview.filename}</p>

            {docPreview.isImage ? (
              <img
                src={docPreview.dataUrl}
                alt={docPreview.title}
                className="max-h-[70vh] w-full object-contain rounded-xl border border-slate-200 dark:border-slate-700"
              />
            ) : (
              <iframe
                src={docPreview.dataUrl}
                title={docPreview.title}
                className="w-full h-[70vh] rounded-xl border border-slate-200 dark:border-slate-700 bg-white"
              />
            )}

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-700">
              <Button variant="ghost" size="sm" onClick={() => setDocPreview(null)}>Close</Button>
              <Button
                variant="primary"
                size="sm"
                icon={Download}
                onClick={() => {
                  const a = document.createElement("a");
                  a.href = docPreview.dataUrl;
                  a.download = docPreview.filename;
                  a.click();
                }}
              >
                Download
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default HRApplications;
