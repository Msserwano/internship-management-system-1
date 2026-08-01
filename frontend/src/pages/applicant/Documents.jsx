
import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import Breadcrumbs from "../../components/layout/Breadcrumbs";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import EmptyState from "../../components/ui/EmptyState";
import Skeleton from "../../components/ui/Skeleton";
import Badge from "../../components/ui/Badge";
import useApi from "../../hooks/useApi";
import toast from "react-hot-toast";
import {
  FileText, Upload, Download, Eye, CheckCircle2, AlertCircle,
  Trash2, FileCode, Paperclip, Link as LinkIcon
} from "lucide-react";

/* ------------------------------------------------------------------
   Map the document field key used in ApplyWizard to a human label
------------------------------------------------------------------ */
const DOC_LABELS = {
  recommendationDoc: { label: "University Recommendation Letter", type: "Recommendation Letter" },
  transcriptDoc:     { label: "Academic Transcript",               type: "Transcript" },
  cvDoc:             { label: "Curriculum Vitae (CV)",             type: "CV" },
  coverLetterDoc:    { label: "Cover Letter",                      type: "Cover Letter" },
  photoDoc:          { label: "Passport Photo",                    type: "Passport Photo" },
};

const REQUIRED_TYPES = ["Recommendation Letter", "Transcript", "CV", "Cover Letter", "Passport Photo"];

const Documents = () => {
  const { data: applications, loading } = useApi("/applications");
  const [previewDoc, setPreviewDoc] = useState(null);
  const [extraDocs, setExtraDocs]   = useState([]);

  /* ----------------------------------------------------------------
     Derive documents list from applications' `documents` JSONB field
  ---------------------------------------------------------------- */
  const appDocs = useMemo(() => {
    if (!Array.isArray(applications)) return [];
    const result = [];

    applications.forEach((app) => {
      if (!app.documents) return;
      let docs = app.documents;
      if (typeof docs === "string") {
        try { docs = JSON.parse(docs); } catch { return; }
      }
      if (typeof docs !== "object") return;

      Object.entries(docs).forEach(([key, val]) => {
        if (!val) return;
        const meta = DOC_LABELS[key] || { label: key, type: "Other Document" };
        const fileObj = typeof val === "object" ? val : { name: String(val) };

        result.push({
          id:               `${app.id}_${key}`,
          name:             meta.label,
          type:             meta.type,
          filename:         fileObj.name || meta.label,
          size:             fileObj.size || "–",
          status:           app.status === "accepted" ? "verified" : "pending",
          date:             fileObj.uploadedAt
                              ? fileObj.uploadedAt.split("T")[0]
                              : (app.submittedAt ? String(app.submittedAt).split("T")[0] : "–"),
          internshipTitle:  app.internshipTitle || "Internship",
          applicationId:    app.id,
          dataUrl:          fileObj.data || null,
        });
      });
    });

    return result;
  }, [applications]);

  // Merge application docs + manually uploaded docs
  const allDocs = useMemo(() => {
    const seen = new Set();
    const merged = [];
    [...appDocs, ...extraDocs].forEach((d) => {
      const key = d.type + d.filename;
      if (!seen.has(key)) {
        seen.add(key);
        merged.push(d);
      }
    });
    return merged;
  }, [appDocs, extraDocs]);

  const handleUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const newDoc = {
      id:       `manual_${Date.now()}`,
      name:     file.name.replace(/\.[^/.]+$/, ""),
      type:     "Other Document",
      filename: file.name,
      size:     `${(file.size / 1024).toFixed(0)} KB`,
      status:   "pending",
      date:     new Date().toISOString().split("T")[0],
      dataUrl:  null,
    };
    setExtraDocs((prev) => [...prev, newDoc]);
    toast.success(`${file.name} added to documents.`);
    e.target.value = "";
  };

  const handleDelete = (id) => {
    setExtraDocs((prev) => prev.filter((d) => d.id !== id));
    toast.success("Document removed.");
  };

  const handleDownload = (doc) => {
    if (doc.dataUrl) {
      const a = document.createElement("a");
      a.href = doc.dataUrl;
      a.download = doc.filename;
      a.click();
    } else {
      toast.success(`Downloading ${doc.filename}...`);
    }
  };

  if (loading) return (
    <div className="page-container">
      <Breadcrumbs />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-40 rounded-2xl" />)}
      </div>
    </div>
  );

  return (
    <div className="page-container">
      <Breadcrumbs />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">My Documents</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            Documents submitted with your internship applications. Upload additional files below.
          </p>
        </div>

        <label className="btn btn-primary btn-md cursor-pointer flex items-center gap-2">
          <Upload className="w-4 h-4" /> Upload New Document
          <input type="file" className="hidden" onChange={handleUpload} accept=".pdf,.png,.jpg,.jpeg,.doc,.docx" />
        </label>
      </div>

      {/* Required Document Checklist */}
      <div className="card p-6 bg-slate-50 dark:bg-slate-800 border-none">
        <h3 className="font-bold text-sm text-slate-800 dark:text-white mb-3">
          Required Document Verification Status
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {REQUIRED_TYPES.map((reqType) => {
            const uploaded = allDocs.find((d) => d.type === reqType);
            return (
              <div
                key={reqType}
                className={`p-3 rounded-xl border text-center transition ${
                  uploaded
                    ? "bg-green-50/50 dark:bg-green-900/10 border-green-200 dark:border-green-800 text-green-700 dark:text-green-300"
                    : "bg-amber-50/50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300"
                }`}
              >
                <div className="flex justify-center mb-1">
                  {uploaded ? <CheckCircle2 className="w-4 h-4 text-accent-500" /> : <AlertCircle className="w-4 h-4 text-warning" />}
                </div>
                <p className="text-[11px] font-bold truncate">{reqType}</p>
                <p className="text-[10px] opacity-75">{uploaded ? "Uploaded" : "Required"}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Application source legend */}
      {appDocs.length > 0 && (
        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 -mt-2">
          <Paperclip className="w-3.5 h-3.5 text-primary-500" />
          Documents automatically pulled from your{" "}
          <strong className="text-primary-600 dark:text-primary-400">{applications.length} submitted application(s)</strong>.
        </div>
      )}

      {/* Documents grid */}
      {allDocs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {allDocs.map((doc, idx) => (
            <motion.div
              key={doc.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="card p-5 space-y-4 hover:shadow-card-md transition"
            >
              <div className="flex items-start justify-between">
                <div className="w-10 h-10 bg-primary-50 dark:bg-primary-900/30 rounded-xl flex items-center justify-center">
                  <FileText className="w-5 h-5 text-primary-500" />
                </div>
                <span className={`badge ${doc.status === "verified" ? "badge-accepted" : "badge-under_review"}`}>
                  {doc.status === "verified" ? "Verified" : "Pending Review"}
                </span>
              </div>

              <div>
                <h4 className="font-bold text-slate-800 dark:text-white text-sm truncate">{doc.name}</h4>
                <p className="text-xs text-slate-400 mt-0.5 truncate">{doc.filename} • {doc.size}</p>
                {doc.internshipTitle && (
                  <p className="text-[10px] text-primary-500 mt-0.5 flex items-center gap-1 truncate">
                    <LinkIcon className="w-3 h-3 flex-shrink-0" />
                    {doc.internshipTitle}
                  </p>
                )}
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between">
                <span className="text-[10px] text-slate-400">Uploaded {doc.date}</span>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setPreviewDoc(doc)}
                    className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300"
                    title="Preview"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDownload(doc)}
                    className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300"
                    title="Download"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                  {/* Only allow deleting manually added docs */}
                  {doc.id.startsWith("manual_") && (
                    <button
                      onClick={() => handleDelete(doc.id)}
                      className="p-1.5 rounded-lg hover:bg-red-50 text-danger"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={FileText}
          title="No Documents Yet"
          description="Documents you upload during your internship applications will appear here automatically."
        />
      )}

      {/* Preview Modal */}
      {previewDoc && (
        <Modal open={!!previewDoc} onClose={() => setPreviewDoc(null)} title={previewDoc.name} size="lg">
          <div className="p-6 text-center space-y-4">
            <div className="w-16 h-16 bg-primary-50 rounded-full flex items-center justify-center mx-auto text-primary-500">
              <FileCode className="w-8 h-8" />
            </div>
            <p className="text-sm font-semibold text-slate-800 dark:text-white">{previewDoc.filename}</p>
            <p className="text-xs text-slate-400">
              Document Size: {previewDoc.size} • Uploaded on {previewDoc.date}
            </p>
            {previewDoc.internshipTitle && (
              <p className="text-xs text-primary-600 font-semibold">
                Submitted with: {previewDoc.internshipTitle}
              </p>
            )}

            {previewDoc.dataUrl ? (
              previewDoc.dataUrl.startsWith("data:image") ? (
                <img
                  src={previewDoc.dataUrl}
                  alt={previewDoc.filename}
                  className="max-h-80 mx-auto rounded-xl object-contain border border-slate-200 dark:border-slate-700"
                />
              ) : (
                <div className="p-6 bg-slate-100 dark:bg-slate-700/50 rounded-2xl border border-dashed border-slate-300 dark:border-slate-600">
                  <FileText className="w-10 h-10 text-primary-400 mx-auto mb-2" />
                  <p className="text-xs text-slate-500">
                    PDF / Document Preview — click Download to open.
                  </p>
                </div>
              )
            ) : (
              <div className="p-10 bg-slate-100 dark:bg-slate-700/50 rounded-2xl border border-dashed border-slate-300 dark:border-slate-600">
                <p className="text-xs text-slate-500">Document viewer preview simulated for {previewDoc.name}.</p>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-700">
              <Button variant="ghost" size="sm" onClick={() => setPreviewDoc(null)}>Close</Button>
              <Button variant="primary" size="sm" onClick={() => handleDownload(previewDoc)} icon={Download}>
                Download File
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default Documents;
