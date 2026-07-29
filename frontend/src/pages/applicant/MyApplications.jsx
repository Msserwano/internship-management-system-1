// src/pages/applicant/MyApplications.jsx
import { useState } from "react";
import { motion } from "framer-motion";
import Breadcrumbs from "../../components/layout/Breadcrumbs";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import EmptyState from "../../components/ui/EmptyState";
import Skeleton from "../../components/ui/Skeleton";
import useApi from "../../hooks/useApi";
import { applicationService } from "../../api/services";
import { fDate } from "../../utils/formatters";
import toast from "react-hot-toast";
import {
  FileText, Download, XCircle, Clock, CheckCircle2, AlertCircle,
  Eye, Calendar, ChevronRight
} from "lucide-react";

const MyApplications = () => {
  const { data: applications, loading, refetch } = useApi("/applications");
  const [selectedApp, setSelectedApp] = useState(null);
  const [withdrawTarget, setWithdrawTarget] = useState(null);

  const counts = {
    all: applications.length,
    submitted: applications.filter(a => a.status === "submitted").length,
    under_review: applications.filter(a => a.status === "under_review").length,
    shortlisted: applications.filter(a => a.status === "shortlisted").length,
    interview: applications.filter(a => a.status === "interview").length,
    accepted: applications.filter(a => a.status === "accepted").length,
    rejected: applications.filter(a => a.status === "rejected").length,
  };

  const handleWithdraw = async () => {
    if (!withdrawTarget) return;
    try {
      await applicationService.update(withdrawTarget.id, { status: "withdrawn" });
      toast.success("Application withdrawn successfully.");
      setWithdrawTarget(null);
      setSelectedApp(null);
      refetch();
    } catch {
      toast.error("Failed to withdraw application.");
    }
  };

  const handleDownloadOffer = (app) => {
    toast.success(`Downloading Offer Letter for ${app.internshipTitle}...`);
  };

  if (loading) return (
    <div className="page-container"><Breadcrumbs />
      <div className="space-y-4">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-32 rounded-2xl" />)}</div>
    </div>
  );

  return (
    <div className="page-container">
      <Breadcrumbs />

      <div>
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">My Applications</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm">
          Track and manage your internship applications to KCCA.
        </p>
      </div>

      {/* Status Summary Bar Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
        {[
          { label: "Submitted", count: counts.submitted, color: "text-blue-600 bg-blue-50" },
          { label: "Under Review", count: counts.under_review, color: "text-yellow-600 bg-yellow-50" },
          { label: "Shortlisted", count: counts.shortlisted, color: "text-purple-600 bg-purple-50" },
          { label: "Interview", count: counts.interview, color: "text-orange-600 bg-orange-50" },
          { label: "Accepted", count: counts.accepted, color: "text-green-600 bg-green-50" },
          { label: "Rejected", count: counts.rejected, color: "text-red-600 bg-red-50" },
        ].map((item) => (
          <div key={item.label} className="card p-3.5 text-center">
            <p className="text-xs text-slate-500 font-medium">{item.label}</p>
            <p className="text-xl font-bold text-slate-800 dark:text-white mt-1">{item.count}</p>
          </div>
        ))}
      </div>

      {/* Applications List */}
      {applications.length > 0 ? (
        <div className="space-y-4">
          {applications.map((app) => (
            <motion.div
              key={app.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="card p-6 flex flex-col md:flex-row md:items-center justify-between gap-6"
            >
              <div className="space-y-2 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-bold text-slate-800 dark:text-white text-base">
                    {app.internshipTitle}
                  </h3>
                  <Badge status={app.status} />
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Department: <strong className="text-slate-700 dark:text-slate-300 font-semibold">{app.department}</strong> • Submitted on {fDate(app.submittedAt)}
                </p>

                {/* Progress bar preview */}
                <div className="flex items-center gap-2 pt-1 max-w-md">
                  {["submitted", "under_review", "shortlisted", "interview", "accepted"].map((stepStatus, idx) => {
                    const statusOrder = ["submitted", "under_review", "shortlisted", "interview", "accepted"];
                    const currentIdx = statusOrder.indexOf(app.status);
                    const isPassed = currentIdx >= idx;
                    const isRejected = app.status === "rejected";

                    return (
                      <div key={stepStatus} className="flex-1 flex flex-col items-center">
                        <div
                          className={`h-1.5 w-full rounded-full ${
                            isRejected
                              ? "bg-red-200"
                              : isPassed
                              ? "bg-primary-500"
                              : "bg-slate-200 dark:bg-slate-700"
                          }`}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => setSelectedApp(app)} icon={Eye}>
                  Timeline & Details
                </Button>

                {app.status === "accepted" && (
                  <Button variant="accent" size="sm" onClick={() => handleDownloadOffer(app)} icon={Download}>
                    Offer Letter
                  </Button>
                )}

                {["submitted", "under_review"].includes(app.status) && (
                  <Button variant="ghost" size="sm" className="text-danger" onClick={() => setWithdrawTarget(app)} icon={XCircle}>
                    Withdraw
                  </Button>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={FileText}
          title="No Applications Found"
          description="You haven't submitted any applications yet."
        />
      )}

      {/* Timeline Modal */}
      {selectedApp && (
        <Modal open={!!selectedApp} onClose={() => setSelectedApp(null)} title="Application Details & Timeline" size="lg">
          <div className="p-6 space-y-6">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-bold text-lg text-slate-800 dark:text-white">{selectedApp.internshipTitle}</h3>
                <p className="text-xs text-primary-600 font-medium">{selectedApp.department}</p>
              </div>
              <Badge status={selectedApp.status} />
            </div>

            {/* Application Timeline Visual */}
            <div className="card p-5 bg-slate-50 dark:bg-slate-700/40 border-none">
              <h4 className="font-bold text-xs uppercase tracking-wider text-slate-500 mb-4">Application History</h4>
              
              <div className="space-y-4 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-600">
                {selectedApp.timeline?.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-4 relative pl-8">
                    <div className="absolute left-1.5 top-1.5 w-3 h-3 rounded-full bg-primary-500 ring-4 ring-white dark:ring-slate-800" />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-slate-800 dark:text-white capitalize">{item.status.replace("_", " ")}</span>
                        <span className="text-[10px] text-slate-400">{fDate(item.date)}</span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{item.note}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {selectedApp.reviewNote && (
              <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200 rounded-xl text-xs">
                <strong>HR Review Notes:</strong> {selectedApp.reviewNote}
              </div>
            )}

            <div className="flex justify-between items-center pt-4 border-t border-slate-100 dark:border-slate-700">
              <Button variant="ghost" size="sm" onClick={() => setSelectedApp(null)}>Close</Button>
              {selectedApp.status === "accepted" && (
                <Button variant="accent" size="sm" onClick={() => handleDownloadOffer(selectedApp)} icon={Download}>
                  Download Official Offer Letter
                </Button>
              )}
            </div>
          </div>
        </Modal>
      )}

      {/* Withdraw Dialog */}
      <ConfirmDialog
        open={!!withdrawTarget}
        onClose={() => setWithdrawTarget(null)}
        onConfirm={handleWithdraw}
        title="Withdraw Application"
        message={`Are you sure you want to withdraw your application for "${withdrawTarget?.internshipTitle}"? This action cannot be undone.`}
        confirmLabel="Yes, Withdraw"
        danger
      />
    </div>
  );
};

export default MyApplications;
