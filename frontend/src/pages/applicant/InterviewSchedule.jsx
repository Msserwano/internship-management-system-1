
import { useState } from "react";
import { motion } from "framer-motion";
import Breadcrumbs from "../../components/layout/Breadcrumbs";
import Button from "../../components/ui/Button";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import EmptyState from "../../components/ui/EmptyState";
import Skeleton from "../../components/ui/Skeleton";
import useApi from "../../hooks/useApi";
import { interviewService } from "../../api/services";
import toast from "react-hot-toast";
import {
  Calendar, MapPin, Clock, Users, Video, CheckCircle2, XCircle, FileText, ExternalLink
} from "lucide-react";

const InterviewSchedule = () => {
  const { data: interviews, loading, refetch } = useApi("/interviews");
  const [declineTarget, setDeclineTarget] = useState(null);

  const handleAccept = async (id) => {
    try {
      await interviewService.update(id, { status: "accepted" });
      toast.success("Interview invitation accepted! HR has been notified.");
      refetch();
    } catch {
      toast.error("Failed to accept invitation.");
    }
  };

  const handleDecline = async () => {
    if (!declineTarget) return;
    try {
      await interviewService.update(declineTarget.id, { status: "declined" });
      toast.success("Interview invitation declined.");
      setDeclineTarget(null);
      refetch();
    } catch {
      toast.error("Failed to decline invitation.");
    }
  };

  if (loading) return (
    <div className="page-container"><Breadcrumbs />
      <div className="space-y-4">{[...Array(2)].map((_, i) => <Skeleton key={i} className="h-48 rounded-2xl" />)}</div>
    </div>
  );

  return (
    <div className="page-container">
      <Breadcrumbs />

      <div>
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Interview Schedule</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm">
          View your upcoming interview schedules and respond to invitations.
        </p>
      </div>

      {interviews.length > 0 ? (
        <div className="space-y-6">
          {interviews.map((ivw) => (
            <motion.div
              key={ivw.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="card p-6 md:p-8 space-y-6 border-l-4 border-l-primary-500"
            >
              {}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-700">
                <div>
                  <span className="badge badge-shortlisted text-xs mb-2">Interview Invitation</span>
                  <h2 className="text-xl font-bold text-slate-800 dark:text-white">
                    {ivw.internshipTitle}
                  </h2>
                  <p className="text-xs text-primary-600 font-semibold">{ivw.department} Directorate</p>
                </div>

                {}
                {ivw.response === "accepted" ? (
                  <span className="badge badge-accepted text-xs py-1 px-3">
                    <CheckCircle2 className="w-4 h-4 mr-1 inline" /> Accepted
                  </span>
                ) : ivw.response === "declined" ? (
                  <span className="badge badge-rejected text-xs py-1 px-3">
                    <XCircle className="w-4 h-4 mr-1 inline" /> Declined
                  </span>
                ) : (
                  <span className="badge badge-under_review text-xs py-1 px-3">
                    Action Required
                  </span>
                )}
              </div>

              {}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="p-4 bg-slate-50 dark:bg-slate-700/40 rounded-xl space-y-1">
                  <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
                    <Calendar className="w-4 h-4 text-primary-500" /> Date & Time
                  </div>
                  <p className="text-sm font-bold text-slate-800 dark:text-white">
                    {ivw.date} at {ivw.time}
                  </p>
                </div>

                <div className="p-4 bg-slate-50 dark:bg-slate-700/40 rounded-xl space-y-1">
                  <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
                    <MapPin className="w-4 h-4 text-primary-500" /> Venue / Location
                  </div>
                  <p className="text-sm font-bold text-slate-800 dark:text-white">
                    {ivw.venue}
                  </p>
                </div>

                <div className="p-4 bg-slate-50 dark:bg-slate-700/40 rounded-xl space-y-1">
                  <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
                    <Video className="w-4 h-4 text-primary-500" /> Virtual Link
                  </div>
                  {ivw.meetingLink ? (
                    <a
                      href={ivw.meetingLink}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-primary-500 font-bold hover:underline inline-flex items-center gap-1 mt-1"
                    >
                      Join Google Meet <ExternalLink className="w-3 h-3" />
                    </a>
                  ) : (
                    <p className="text-xs text-slate-400">Physical Interview Only</p>
                  )}
                </div>
              </div>

              {}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                <div>
                  <h4 className="font-bold text-xs uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1">
                    <Users className="w-4 h-4 text-primary-500" /> Panel Members
                  </h4>
                  <ul className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
                    {ivw.panelMembers?.map((member, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary-500" />
                        {member}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="font-bold text-xs uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1">
                    <FileText className="w-4 h-4 text-primary-500" /> Special Instructions
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-700/30 p-3 rounded-xl">
                    {ivw.instructions}
                  </p>
                </div>
              </div>

              {}
              {!ivw.response && (
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-700">
                  <Button variant="ghost" size="sm" className="text-danger" onClick={() => setDeclineTarget(ivw)}>
                    Decline Invitation
                  </Button>
                  <Button variant="accent" size="sm" onClick={() => handleAccept(ivw.id)} icon={CheckCircle2}>
                    Accept Invitation
                  </Button>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Calendar}
          title="No Scheduled Interviews"
          description="You do not have any upcoming interview invitations at the moment."
        />
      )}

      {}
      <ConfirmDialog
        open={!!declineTarget}
        onClose={() => setDeclineTarget(null)}
        onConfirm={handleDecline}
        title="Decline Interview Invitation"
        message="Are you sure you want to decline this interview? This will notify KCCA HR team."
        confirmLabel="Yes, Decline"
        danger
      />
    </div>
  );
};

export default InterviewSchedule;
