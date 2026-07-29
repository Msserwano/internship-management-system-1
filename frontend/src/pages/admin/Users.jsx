// src/pages/admin/Users.jsx
import { useState } from "react";
import Breadcrumbs from "../../components/layout/Breadcrumbs";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Select from "../../components/ui/Select";
import Modal from "../../components/ui/Modal";
import Avatar from "../../components/ui/Avatar";
import Badge from "../../components/ui/Badge";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import Skeleton from "../../components/ui/Skeleton";
import useApi from "../../hooks/useApi";
import { userService } from "../../api/services";
import { Search, Plus, Edit3, Trash2, Shield, UserCheck } from "lucide-react";
import toast from "react-hot-toast";

const AdminUsers = () => {
  const { data: users, loading, refetch } = useApi("/users");
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "applicant",
    status: "active",
  });

  const handleOpenCreate = () => {
    setEditUser(null);
    setFormData({ name: "", email: "", role: "applicant", status: "active" });
    setModalOpen(true);
  };

  const handleOpenEdit = (u) => {
    setEditUser(u);
    setFormData({ name: u.name, email: u.email, role: u.role, status: u.status });
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email) return;

    try {
      if (editUser) {
        await userService.update(editUser.id, formData);
        toast.success("User account updated.");
      } else {
        await userService.create({ ...formData, password: "password123" });
        toast.success("New user account created.");
      }
      setModalOpen(false);
      refetch();
    } catch {
      toast.error("Failed to save user account.");
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await userService.remove(deleteTarget.id);
      toast.success("User account deleted.");
      setDeleteTarget(null);
      refetch();
    } catch {
      toast.error("Failed to delete user account.");
    }
  };

  if (loading) return (
    <div className="page-container"><Breadcrumbs />
      <div className="space-y-3">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-12 rounded-xl" />)}</div>
    </div>
  );

  const filtered = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="page-container">
      <Breadcrumbs />

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">User Management</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            Create user accounts, assign system roles, and configure access permissions.
          </p>
        </div>

        <Button variant="primary" size="md" onClick={handleOpenCreate} icon={Plus}>
          Add New User
        </Button>
      </div>

      <div className="card p-4">
        <Input
          placeholder="Search user name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          icon={Search}
          className="max-w-md"
        />
      </div>

      <div className="card p-6">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Email</th>
                <th>Assigned Role</th>
                <th>Account Status</th>
                <th>Created Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => (
                <tr key={u.id}>
                  <td className="font-bold text-slate-800 dark:text-white flex items-center gap-3">
                    <Avatar name={u.name} size="sm" />
                    {u.name}
                  </td>
                  <td>{u.email}</td>
                  <td><Badge status={`badge-${u.role}`} label={u.role.toUpperCase()} /></td>
                  <td><Badge status={u.status} /></td>
                  <td className="text-xs text-slate-400">{u.joinedAt}</td>
                  <td>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEdit(u)}
                        className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300"
                        title="Edit User"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteTarget(u)}
                        className="p-1.5 rounded-lg hover:bg-red-50 text-danger"
                        title="Delete User"
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

      {modalOpen && (
        <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editUser ? "Edit User Account" : "Create New User Account"} size="md">
          <form onSubmit={handleSave} className="p-6 space-y-4">
            <Input label="Full Name" required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
            <Input label="Email Address" type="email" required value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
            <Select
              label="Assigned System Role"
              value={formData.role}
              onChange={e => setFormData({ ...formData, role: e.target.value })}
              options={["applicant", "hr", "admin", "supervisor"]}
            />
            <Select
              label="Account Status"
              value={formData.status}
              onChange={e => setFormData({ ...formData, status: e.target.value })}
              options={["active", "inactive"]}
            />
            <div className="flex justify-end gap-2 pt-3 border-t">
              <Button type="button" variant="ghost" size="sm" onClick={() => setModalOpen(false)}>Cancel</Button>
              <Button type="submit" variant="primary" size="sm">Save User</Button>
            </div>
          </form>
        </Modal>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete User Account"
        message={`Are you sure you want to delete user "${deleteTarget?.name}"?`}
        confirmLabel="Yes, Delete"
        danger
      />
    </div>
  );
};

export default AdminUsers;
