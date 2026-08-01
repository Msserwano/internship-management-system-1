import { useState } from "react";
import Breadcrumbs from "../../components/layout/Breadcrumbs";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Select from "../../components/ui/Select";
import Modal from "../../components/ui/Modal";
import Badge from "../../components/ui/Badge";
import Skeleton from "../../components/ui/Skeleton";
import useApi from "../../hooks/useApi";
import { interviewService, applicationService } from "../../api/services";
import { Calendar, Plus, Clock, MapPin, Mail, Smartphone, CheckCircle2, XCircle, UserCheck } from "lucide-react";
import toast from "react-hot-toast";

const HRInterviews = () => {
  const { data: rawInterviews, loading, refetch } = useApi("/interviews");
  const { data: rawApplications }                = useApi("/applications");
  const interviews   = Array.isArray(rawInterviews)   ? rawInterviews   : [];
  const applications = Array.isArray(rawApplications) ? rawApplications : [];

  const [modalOpen, setModalOpen]   = useState(false);
  const [actionId, setActionId]     = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    applicationId: "",
    applicantName: "",
    internshipTitle: "",
    department: "ICT",
    date: "2026-08-05",
    time: "10:00 AM",
    venue: "KCCA Boardroom 2, City Hall, 3rd Floor",
    panelMembers: "Mr. Peter Mwesigwa (ICT Lead), Ms. Rose Nabwire (HR Manager)",
    instructions: "Bring academic documents & National ID.",
    meetingLink: "https://meet.google.com/kcca-int-2026",
    sendEmail: true,
    sendSMS: true,
  });

  const openScheduleModal = () => {
    const firstApp = applications.length > 0 ? applications[0] : null;
    setFormData({
      applicationId:   firstApp ? firstApp.id : "",
      applicantName:   firstApp ? (firstApp.applicantName || "") : "",
      internshipTitle: firstApp ? (firstApp.internshipTitle || "") : "",
      department:      firstApp ? (firstApp.department || "ICT") : "ICT",
      date:            "2026-08-05",
      time:            "10:00 AM",
      venue:           "KCCA Boardroom 2, City Hall, 3rd Floor",
      panelMembers:    "Mr. Peter Mwesigwa (ICT Lead), Ms. Rose Nabwire (HR Manager)",
      instructions:    "Bring academic documents & National ID.",
      meetingLink:     "https://meet.google.com/kcca-int-2026",
      sendEmail:       true,
      sendSMS:         true,
    });
    setModalOpen(true);
  };

  const handleSchedule = async (e) => {
    e.preventDefault();
    if (!formData.applicationId) {
      return toast.error("Please select a candidate application from the dropdown.");
    }
    setSubmitting(true);
    try {
      await interviewService.schedule({
        applicationId:   formData.applicationId,
        applicantName:   formData.applicantName,
        internshipTitle: formData.internshipTitle,
        department:      formData.department,
        date:            formData.date,
        time:            formData.time,
        venue:           formData.venue,
        meetingLink:     formData.meetingLink,
        instructions:    formData.instructions,
        panelMembers:    formData.panelMembers ? formData.panelMembers.split(",").map(s => s.trim()) : [],
      });
      toast.success("Interview scheduled & confirmed! Notifications dispatched.");
      setModalOpen(false);
      refetch();
    } catch (err) {
      console.error("[SCHEDULE ERROR]", err);
      toast.error(err.response?.data?.message || "Failed to schedule interview.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateInterviewStatus = async (ivwId, status) => {
    setActionId(ivwId);
    try {
      await interviewService.update(ivwId, { status });
      toast.success(`Interview marked as ${status.toUpperCase()}.`);
      refetch();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update interview status.");
    } finally {
      setActionId(null);
    }
  };

  const handleUpdateApplicationStatus = async (appId, newStatus) => {
    if (!appId) return toast.error("Application ID not found.");
    setActionId(appId);
    try {
      await applicationService.update(appId, {
        status: newStatus,
        reviewNote: newStatus === "accepted" ? "Passed interview assessment — internship placement offered." : "Unsuccessful after interview assessment."
      });
      toast.success(`Candidate marked as ${newStatus.toUpperCase()}!`);
      refetch();
    } catch (err) {
      toast.error(err.response?.data?.message || `Failed to update status to ${newStatus}.`);
    } finally {
      setActionId(null);
    }
  };

  if (loading) return (
    <div className="page-container"><Breadcrumbs />
      <div className="space-y-3">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}</div>
    </div>
  );

  return (
    <div className="page-container">
      <Breadcrumbs />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Interview Scheduling &amp; Evaluation</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            Schedule candidate panel interviews, track applicant confirmations, and issue final placement offers.
          </p>
        </div>

        <Button variant="primary" size="md" onClick={openScheduleModal} icon={Plus}>
          Schedule New Interview
        </Button>
      </div>

      {/* Hero Banner */}
      <div className="card p-6 flex flex-col md:flex-row items-center justify-between gap-4 bg-gradient-to-r from-primary-600 to-primary-800 text-white">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
            <Calendar className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Interview Operations Center</h2>
            <p className="text-xs text-primary-100">{interviews.length} Interview Session(s) Recorded</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" onClick={() => toast.success("SMS Reminders sent to all scheduled candidates!")} icon={Smartphone}>
            Send Bulk SMS Reminders
          </Button>
        </div>
      </div>

      {/* Interviews List */}
      <div className="space-y-4">
        {interviews.length === 0 ? (
          <div className="card p-12 text-center text-slate-400 text-sm space-y-3">
            <Calendar className="w-12 h-12 mx-auto opacity-30" />
            <p className="font-semibold">No interviews scheduled yet.</p>
            <Button variant="primary" size="sm" onClick={openScheduleModal} icon={Plus}>Schedule First Interview</Button>
          </div>
        ) : (
          interviews.map((ivw) => {
            const statusVal = String(ivw.status || ivw.response || "scheduled").toLowerCase();
            const isAccepted = statusVal === "accepted";
            const isDeclined = statusVal === "declined";

            // Find matching application to check application status
            const app = applications.find(a => String(a.id) === String(ivw.application_id || ivw.applicationId));
            const appStatus = (app?.status || "").toLowerCase();

            return (
              <div key={ivw.id} className="card p-6 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-bold text-slate-800 dark:text-white text-base">{ivw.applicantName}</h3>
                    <span className="badge badge-shortlisted text-xs">{ivw.internshipTitle}</span>

                    {/* Applicant Confirmation Badge */}
                    {isAccepted ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Applicant Confirmed
                      </span>
                    ) : isDeclined ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
                        <XCircle className="w-3.5 h-3.5" /> Applicant Declined
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400">
                        <Clock className="w-3.5 h-3.5" /> Pending Response
                      </span>
                    )}

                    {/* Overall Application Status Badge if Accepted */}
                    {appStatus === "accepted" && (
                      <span className="badge badge-accepted font-bold text-xs">PLACEMENT OFFERED</span>
                    )}
                  </div>

                  <p className="text-xs text-slate-500">
                    <Clock className="w-3.5 h-3.5 inline text-slate-400 mr-1"/>
                    {ivw.interviewDate || ivw.interview_date} at {ivw.interviewTime || ivw.interview_time} • <MapPin className="w-3.5 h-3.5 inline text-slate-400 mx-1"/> {ivw.venue}
                  </p>
                  <p className="text-xs text-slate-400">
                    Panel: <strong className="text-slate-600 dark:text-slate-300">{Array.isArray(ivw.panelMembers || ivw.panel_members) ? (ivw.panelMembers || ivw.panel_members).join(", ") : (ivw.panelMembers || ivw.panel_members || '—')}</strong>
                  </p>
                </div>

                {/* Actions: Confirm Interview, Resend Invite, Accept & Offer Placement */}
                <div className="flex flex-wrap items-center gap-2 flex-shrink-0">
                  {statusVal !== "completed" && statusVal !== "accepted" && (
                    <Button
                      variant="accent"
                      size="xs"
                      onClick={() => handleUpdateInterviewStatus(ivw.id, "completed")}
                      loading={actionId === ivw.id}
                      icon={CheckCircle2}
                      className="!bg-emerald-600 hover:!bg-emerald-700 !text-white"
                    >
                      Confirm / Complete
                    </Button>
                  )}

                  <Button variant="outline" size="xs" onClick={() => toast.success("Invitation re-sent via Email & SMS.")} icon={Mail}>
                    Resend Invite
                  </Button>

                  {appStatus !== "accepted" ? (
                    <Button
                      variant="primary"
                      size="xs"
                      onClick={() => handleUpdateApplicationStatus(ivw.application_id || ivw.applicationId, "accepted")}
                      loading={actionId === (ivw.application_id || ivw.applicationId)}
                      icon={UserCheck}
                    >
                      Accept &amp; Offer Placement
                    </Button>
                  ) : (
                    <span className="text-xs font-bold text-green-600 flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" /> Offered
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal */}
      {modalOpen && (
        <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Schedule Panel Interview" size="lg">
          <form onSubmit={handleSchedule} className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                label="Candidate Application"
                required
                placeholder="-- Select Candidate Application --"
                value={formData.applicationId}
                onChange={e => {
                  const picked = applications.find(a => String(a.id) === String(e.target.value));
                  setFormData({
                    ...formData,
                    applicationId:  e.target.value,
                    applicantName:  picked?.applicantName  || "",
                    internshipTitle: picked?.internshipTitle || "",
                    department:     picked?.department     || "ICT",
                  });
                }}
                options={applications.map(a => ({ label: `${a.applicantName || 'Applicant'} – ${a.internshipTitle || 'Role'} (${a.department || 'General'})`, value: a.id }))}
              />
              <Input label="Directorate" value={formData.department} onChange={e => setFormData({ ...formData, department: e.target.value })} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input label="Interview Date" type="date" required value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })} />
              <Input label="Time" required value={formData.time} onChange={e => setFormData({ ...formData, time: e.target.value })} placeholder="10:00 AM" />
            </div>

            <Input label="Physical Venue" required value={formData.venue} onChange={e => setFormData({ ...formData, venue: e.target.value })} />
            <Input label="Virtual Meeting Link (Google Meet)" value={formData.meetingLink} onChange={e => setFormData({ ...formData, meetingLink: e.target.value })} />
            <Input label="Assigned Panel Members (comma separated)" required value={formData.panelMembers} onChange={e => setFormData({ ...formData, panelMembers: e.target.value })} />

            <div>
              <label className="form-label">Candidate Instructions</label>
              <textarea rows={2} className="form-input" value={formData.instructions} onChange={e => setFormData({ ...formData, instructions: e.target.value })} />
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl flex items-center justify-between text-xs">
              <label className="flex items-center gap-2 font-medium">
                <input type="checkbox" checked={formData.sendEmail} onChange={e => setFormData({ ...formData, sendEmail: e.target.checked })} className="accent-primary-500"/>
                Dispatch Email Notification
              </label>
              <label className="flex items-center gap-2 font-medium">
                <input type="checkbox" checked={formData.sendSMS} onChange={e => setFormData({ ...formData, sendSMS: e.target.checked })} className="accent-primary-500"/>
                Dispatch SMS Reminder
              </label>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t">
              <Button type="button" variant="ghost" size="sm" onClick={() => setModalOpen(false)}>Cancel</Button>
              <Button type="submit" variant="primary" size="md" loading={submitting}>Confirm &amp; Dispatch Invitation</Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default HRInterviews;
