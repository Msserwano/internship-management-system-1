
import { useState } from "react";
import { motion } from "framer-motion";
import Breadcrumbs from "../../components/layout/Breadcrumbs";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Select from "../../components/ui/Select";
import Modal from "../../components/ui/Modal";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import Badge from "../../components/ui/Badge";
import Skeleton from "../../components/ui/Skeleton";
import useApi from "../../hooks/useApi";
import { internshipService } from "../../api/services";
import { KCCA_DEPARTMENTS, DURATIONS, LOCATIONS } from "../../utils/constants";
import { fDate } from "../../utils/formatters";
import toast from "react-hot-toast";
import { Plus, Search, Edit3, Trash2, XCircle, MapPin, Clock, Users } from "lucide-react";

const HRInternships = () => {
  const { data: internships, loading, refetch } = useApi("/internships");
  const [search, setSearch]       = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem]   = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);


  const [formData, setFormData] = useState({
    title: "",
    department: KCCA_DEPARTMENTS[0],
    description: "",
    requirements: "",
    vacancies: 3,
    deadline: "2026-09-30",
    supervisor: "",
    duration: "3 Months",
    location: "City Hall – Kampala",
  });

  const handleOpenCreate = () => {
    setEditItem(null);
    setFormData({
      title: "",
      department: KCCA_DEPARTMENTS[0],
      description: "",
      requirements: "",
      vacancies: 3,
      deadline: "2026-09-30",
      supervisor: "Eng. Moses Kabugo",
      duration: "3 Months",
      location: "City Hall – Kampala",
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (item) => {
    setEditItem(item);
    setFormData({
      title: item.title,
      department: item.department,
      description: item.description,
      requirements: Array.isArray(item.requirements) ? item.requirements.join("\n") : (item.requirements || ""),
      vacancies: item.vacancies,
      deadline: item.deadline,
      supervisor: item.supervisor,
      duration: item.duration,
      location: item.location,
    });
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.description) {
      toast.error("Please fill in required fields.");
      return;
    }

    const payload = {
      ...formData,
      requirements: typeof formData.requirements === "string"
        ? formData.requirements.split("\n").filter(Boolean)
        : formData.requirements,
    };

    try {
      if (editItem) {
        await internshipService.update(editItem.id, payload);
        toast.success("Internship updated successfully.");
      } else {
        await internshipService.create(payload);
        toast.success("New Internship posting published!");
      }
      setModalOpen(false);
      refetch();
    } catch {
      toast.error("Failed to save internship posting.");
    }
  };

  const handleClosePosting = async (id) => {
    try {
      await internshipService.update(id, { status: "closed" });
      toast.success("Internship vacancy marked as closed.");
      refetch();
    } catch {
      toast.error("Failed to close posting.");
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await internshipService.remove(deleteTarget.id);
      toast.success("Internship posting deleted.");
      setDeleteTarget(null);
      refetch();
    } catch {
      toast.error("Failed to delete posting.");
    }
  };

  const filtered = internships.filter(i =>
    i.title?.toLowerCase().includes(search.toLowerCase()) ||
    i.department?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return (
    <div className="page-container"><Breadcrumbs />
      <div className="space-y-3">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-12 rounded-xl" />)}</div>
    </div>
  );


  return (
    <div className="page-container">
      <Breadcrumbs />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Internship Management</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            Create, edit, manage, and close internship postings across KCCA departments.
          </p>
        </div>

        <Button variant="primary" size="md" onClick={handleOpenCreate} icon={Plus}>
          Create New Internship
        </Button>
      </div>

      {}
      <div className="card p-4">
        <Input
          placeholder="Search postings by title or department..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          icon={Search}
          className="max-w-md"
        />
      </div>

      {}
      <div className="card p-6">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Department</th>
                <th>Vacancies</th>
                <th>Duration</th>
                <th>Location</th>
                <th>Deadline</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((job) => (
                <tr key={job.id}>
                  <td className="font-bold text-slate-800 dark:text-white">{job.title}</td>
                  <td>{job.department}</td>
                  <td><span className="font-semibold text-primary-600">{job.vacancies}</span></td>
                  <td>{job.duration}</td>
                  <td>{job.location}</td>
                  <td className="text-xs text-slate-500">{fDate(job.deadline)}</td>
                  <td><Badge status={job.status} /></td>
                  <td>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEdit(job)}
                        className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300"
                        title="Edit"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>

                      {job.status === "open" && (
                        <button
                          onClick={() => handleClosePosting(job.id)}
                          className="p-1.5 rounded-lg hover:bg-amber-50 text-warning"
                          title="Close Posting"
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                      )}

                      <button
                        onClick={() => setDeleteTarget(job)}
                        className="p-1.5 rounded-lg hover:bg-red-50 text-danger"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {}
      {modalOpen && (
        <Modal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          title={editItem ? "Edit Internship Posting" : "Create New Internship Posting"}
          size="lg"
        >
          <form onSubmit={handleSave} className="p-6 space-y-4">
            <Input
              label="Internship Title"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Software Development Intern"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                label="Department Directorate"
                required
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                options={KCCA_DEPARTMENTS}
              />
              <Input
                label="Number of Vacancies"
                type="number"
                required
                value={formData.vacancies}
                onChange={(e) => setFormData({ ...formData, vacancies: Number(e.target.value) })}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Select
                label="Duration"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                options={DURATIONS}
              />
              <Select
                label="Location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                options={LOCATIONS}
              />
              <Input
                label="Application Deadline"
                type="date"
                required
                value={formData.deadline}
                onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
              />
            </div>

            <Input
              label="Assigned HR / Department Supervisor"
              required
              value={formData.supervisor}
              onChange={(e) => setFormData({ ...formData, supervisor: e.target.value })}
              placeholder="e.g. Eng. Moses Kabugo"
            />

            <div>
              <label className="form-label">Detailed Description</label>
              <textarea
                rows={3}
                className="form-input"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe responsibilities and scope..."
              />
            </div>

            <div>
              <label className="form-label">Requirements (one per line)</label>
              <textarea
                rows={3}
                className="form-input"
                value={formData.requirements}
                onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                placeholder="Degree in Computer Science&#10;2nd year and above"
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-700">
              <Button type="button" variant="ghost" size="sm" onClick={() => setModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="md">
                {editItem ? "Save Changes" : "Publish Posting"}
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {}
      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Internship Posting"
        message={`Are you sure you want to delete "${deleteTarget?.title}"? This cannot be undone.`}
        confirmLabel="Yes, Delete"
        danger
      />
    </div>
  );
};

export default HRInternships;
