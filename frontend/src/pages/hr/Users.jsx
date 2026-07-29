// src/pages/hr/Users.jsx
import { useState } from "react";
import Breadcrumbs from "../../components/layout/Breadcrumbs";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Avatar from "../../components/ui/Avatar";
import Badge from "../../components/ui/Badge";
import Skeleton from "../../components/ui/Skeleton";
import useApi from "../../hooks/useApi";
import { Search } from "lucide-react";
import toast from "react-hot-toast";
import { fDate } from "../../utils/formatters";

const HRUsers = () => {
  const { data: users, loading } = useApi("/users");
  const [search, setSearch] = useState("");

  const filtered = users.filter(u =>
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  );


  return (
    <div className="page-container">
      <Breadcrumbs />

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">User Accounts Overview</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            View system registered applicants, supervisors, and HR personnel.
          </p>
        </div>
      </div>

      <div className="card p-4">
        <Input
          placeholder="Search user accounts..."
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
                <th>User Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Joined Date</th>
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
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default HRUsers;
