import { useEffect, useState, useCallback } from "react";
import { Building2, Plus, Pencil, Trash2, Search, CheckCircle, XCircle, RefreshCw } from "lucide-react";
import api from "../../api/axios";
import toast from "react-hot-toast";

// ─── helpers ─────────────────────────────────────────────────────────────────
const INITIAL_FORM = { name: "", directorate: "", is_active: true };

function DepartmentModal({ open, onClose, initial, onSave }) {
  const [form, setForm] = useState(initial || INITIAL_FORM);
  const [saving, setSaving] = useState(false);

  useEffect(() => { setForm(initial || INITIAL_FORM); }, [initial]);

  const change = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((p) => ({ ...p, [name]: type === "checkbox" ? checked : value }));
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return toast.error("Department name is required.");
    setSaving(true);
    try {
      await onSave(form);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-card border border-border rounded-2xl shadow-card-lg w-full max-w-md p-6 animate-fade-in">
        <h2 className="text-lg font-semibold text-text mb-5">
          {initial?.department_id ? "Edit Department" : "Add Department"}
        </h2>
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">Department Name *</label>
            <input
              name="name"
              value={form.name}
              onChange={change}
              className="w-full px-3 py-2 rounded-lg bg-bg border border-border text-text text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="e.g. Information & Communication Technology"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">Directorate</label>
            <input
              name="directorate"
              value={form.directorate}
              onChange={change}
              className="w-full px-3 py-2 rounded-lg bg-bg border border-border text-text text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="e.g. KCCA Directorate of ICT"
            />
          </div>
          <div className="flex items-center gap-3">
            <input
              id="dept-active"
              type="checkbox"
              name="is_active"
              checked={form.is_active}
              onChange={change}
              className="w-4 h-4 rounded border-border accent-primary-500 cursor-pointer"
            />
            <label htmlFor="dept-active" className="text-sm text-text-secondary cursor-pointer select-none">
              Active department
            </label>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium rounded-lg border border-border text-text-secondary hover:bg-bg transition-colors">
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 text-sm font-semibold rounded-lg bg-primary-600 hover:bg-primary-700 text-white transition-colors disabled:opacity-60"
            >
              {saving ? "Saving…" : "Save Department"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function AdminDepartments() {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading]         = useState(true);
  const [search, setSearch]           = useState("");
  const [modal, setModal]             = useState({ open: false, initial: null });
  const [deletingId, setDeletingId]   = useState(null);

  // ── Fetch ──────────────────────────────────────────────────────────────────
  const fetchDepartments = useCallback(async () => {
    setLoading(true);
    try {
      // Use the generic data endpoint which queries the departments table
      const res = await api.get("/data/departments");
      const rows = res.data?.data || [];
      setDepartments(rows);
    } catch (err) {
      // Fallback: try direct query via a potential future dedicated endpoint
      console.error("[Departments] fetch failed:", err.message);
      toast.error("Failed to load departments.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchDepartments(); }, [fetchDepartments]);

  // ── CRUD ───────────────────────────────────────────────────────────────────
  const handleSave = async (form) => {
    try {
      if (modal.initial?.department_id) {
        await api.put(`/data/departments/${modal.initial.department_id}`, form);
        toast.success("Department updated.");
      } else {
        await api.post("/data/departments", form);
        toast.success("Department created.");
      }
      fetchDepartments();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save department.");
      throw err;
    }
  };

  const handleDelete = async (dept) => {
    if (!window.confirm(`Delete department "${dept.name}"? This cannot be undone.`)) return;
    setDeletingId(dept.department_id || dept.id);
    try {
      await api.delete(`/data/departments/${dept.department_id || dept.id}`);
      toast.success("Department deleted.");
      fetchDepartments();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete department.");
    } finally {
      setDeletingId(null);
    }
  };

  // ── Filter ─────────────────────────────────────────────────────────────────
  const filtered = departments.filter((d) =>
    !search ||
    d.name?.toLowerCase().includes(search.toLowerCase()) ||
    d.directorate?.toLowerCase().includes(search.toLowerCase())
  );

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary-500/10 flex items-center justify-center">
            <Building2 className="w-5 h-5 text-primary-500" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-text">Departments</h1>
            <p className="text-sm text-text-secondary">Manage KCCA organisational departments</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchDepartments}
            className="p-2 rounded-lg border border-border text-text-secondary hover:bg-bg transition-colors"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            id="add-department-btn"
            onClick={() => setModal({ open: true, initial: null })}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold transition-colors shadow"
          >
            <Plus className="w-4 h-4" />
            Add Department
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
        <input
          id="dept-search"
          type="text"
          placeholder="Search departments…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-card border border-border text-text text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {[
          { label: "Total", value: departments.length, color: "text-primary-500" },
          { label: "Active", value: departments.filter((d) => d.is_active !== false).length, color: "text-emerald-500" },
          { label: "Inactive", value: departments.filter((d) => d.is_active === false).length, color: "text-rose-500" },
        ].map((s) => (
          <div key={s.label} className="bg-card border border-border rounded-xl p-4">
            <p className="text-xs text-text-secondary uppercase tracking-wide">{s.label}</p>
            <p className={`text-2xl font-bold mt-1 ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-card">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <RefreshCw className="w-8 h-8 text-primary-500 animate-spin" />
            <p className="text-text-secondary text-sm">Loading departments…</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Building2 className="w-12 h-12 text-text-secondary/40" />
            <p className="text-text-secondary font-medium">
              {search ? "No departments match your search." : "No departments yet."}
            </p>
            {!search && (
              <button
                onClick={() => setModal({ open: true, initial: null })}
                className="mt-2 px-4 py-2 rounded-lg bg-primary-600 text-white text-sm font-semibold hover:bg-primary-700 transition-colors"
              >
                Add First Department
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-bg/60">
                  <th className="text-left px-6 py-3 font-semibold text-text-secondary">Department</th>
                  <th className="text-left px-6 py-3 font-semibold text-text-secondary hidden md:table-cell">Directorate</th>
                  <th className="text-center px-6 py-3 font-semibold text-text-secondary">Status</th>
                  <th className="text-right px-6 py-3 font-semibold text-text-secondary">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((dept, i) => (
                  <tr
                    key={dept.department_id || dept.id || i}
                    className="border-b border-border/50 last:border-0 hover:bg-bg/40 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-primary-500/10 flex items-center justify-center flex-shrink-0">
                          <Building2 className="w-4 h-4 text-primary-500" />
                        </div>
                        <span className="font-medium text-text">{dept.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-text-secondary hidden md:table-cell">
                      {dept.directorate || <span className="italic text-text-secondary/50">—</span>}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {dept.is_active !== false ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-500">
                          <CheckCircle className="w-3 h-3" /> Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-500">
                          <XCircle className="w-3 h-3" /> Inactive
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          id={`edit-dept-${dept.department_id || i}`}
                          onClick={() => setModal({ open: true, initial: dept })}
                          className="p-1.5 rounded-lg text-text-secondary hover:text-primary-500 hover:bg-primary-500/10 transition-colors"
                          title="Edit"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          id={`delete-dept-${dept.department_id || i}`}
                          onClick={() => handleDelete(dept)}
                          disabled={deletingId === (dept.department_id || dept.id)}
                          className="p-1.5 rounded-lg text-text-secondary hover:text-rose-500 hover:bg-rose-500/10 transition-colors disabled:opacity-40"
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
        )}
      </div>

      {/* Modal */}
      <DepartmentModal
        open={modal.open}
        initial={modal.initial}
        onClose={() => setModal({ open: false, initial: null })}
        onSave={handleSave}
      />
    </div>
  );
}
