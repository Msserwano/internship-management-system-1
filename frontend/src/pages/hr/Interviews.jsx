
import { useState } from "react";
import Breadcrumbs from "../../components/layout/Breadcrumbs";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Select from "../../components/ui/Select";
import Modal from "../../components/ui/Modal";
import Badge from "../../components/ui/Badge";
import Skeleton from "../../components/ui/Skeleton";
import useApi from "../../hooks/useApi";
import { interviewService } from "../../api/services";
import { Calendar, Plus, Clock, MapPin, Mail, Smartphone, Video } from "lucide-react";
import toast from "react-hot-toast";

const HRInterviews = () => {
  const { data: interviews, loading, refetch } = useApi("/interviews");
  const { data: applications }                 = useApi("/applications");
  const [modalOpen, setModalOpen] = useState(false);

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

  const handleSchedule = async (e) => {
    e.preventDefault();
    try {
      await interviewService.schedule({
        applicationId:  formData.applicationId,
        applicantName:  formData.applicantName,
        internshipTitle: formData.internshipTitle,
        department:     formData.department,
        date:           formData.date,
        time:           formData.time,
        venue:          formData.venue,
        meetingLink:    formData.meetingLink,
        instructions:   formData.instructions,
        panelMembers:   formData.panelMembers.split(","),
      });
      toast.success("Interview scheduled! Email & SMS notifications dispatched.");
      setModalOpen(false);
      refetch();
    } catch {
      toast.error("Failed to schedule interview.");
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
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Interview Scheduling</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            Schedule candidate panel interviews, assign venues, and dispatch automated invitations.
          </p>
        </div>

        <Button variant="primary" size="md" onClick={() => setModalOpen(true)} icon={Plus}>
          Schedule New Interview
        </Button>
      </div>

      {}
      <div className="card p-6 flex flex-col md:flex-row items-center justify-between gap-4 bg-gradient-to-r from-primary-600 to-primary-800 text-white">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
            <Calendar className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold">August 2026 Interview Calendar</h2>
            <p className="text-xs text-primary-100">{interviews.length} Panel Session(s) Scheduled</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" onClick={() => toast.success("SMS Reminders sent to all scheduled candidates!")} icon={Smartphone}>
            Send Bulk SMS Reminders
          </Button>
        </div>
      </div>

      {}
      <div className="space-y-4">
        {interviews.map((ivw) => (
          <div key={ivw.id} className="card p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-800 dark:text-white text-base">{ivw.applicantName}</h3>
                <span className="badge badge-shortlisted">{ivw.internshipTitle}</span>
              </div>
              <p className="text-xs text-slate-500">
                <Clock className="w-3.5 h-3.5 inline text-slate-400 mr-1"/>
                {ivw.date} at {ivw.time} • <MapPin className="w-3.5 h-3.5 inline text-slate-400 mx-1"/> {ivw.venue}
              </p>
              <p className="text-xs text-slate-400">
                Panel: <strong className="text-slate-600 dark:text-slate-300">{Array.isArray(ivw.panelMembers) ? ivw.panelMembers.join(", ") : ivw.panelMembers}</strong>
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="outline" size="xs" onClick={() => toast.success("Invitation re-sent via Email & SMS.")} icon={Mail}>
                Resend Invite
              </Button>
            </div>
          </div>
        ))}
      </div>

      {}
      {modalOpen && (
        <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Schedule Panel Interview" size="lg">
          <form onSubmit={handleSchedule} className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                label="Candidate Application"
                required
                value={formData.applicationId}
                onChange={e => {
                  const picked = applications.find(a => a.id === e.target.value);
                  setFormData({
                    ...formData,
                    applicationId:  e.target.value,
                    applicantName:  picked?.applicantName  || "",
                    internshipTitle: picked?.internshipTitle || "",
                    department:     picked?.department     || "",
                  });
                }}
                options={applications.map(a => ({ label: `${a.applicantName} – ${a.internshipTitle}`, value: a.id }))}
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
              <Button type="submit" variant="primary" size="md">Confirm & Dispatch Invitation</Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default HRInterviews;
