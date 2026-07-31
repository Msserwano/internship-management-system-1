
import { useState } from "react";
import Breadcrumbs from "../../components/layout/Breadcrumbs";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Modal from "../../components/ui/Modal";
import Badge from "../../components/ui/Badge";
import { MOCK_DEPARTMENTS } from "../../api/mockData";
import { Building2, Plus, Edit3, Users, Briefcase } from "lucide-react";
import toast from "react-hot-toast";

const HRDepartments = () => {
  const [departments, setDepartments] = useState(MOCK_DEPARTMENTS);
  const [modalOpen, setModalOpen] = useState(false);
  const [deptName, setDeptName] = useState("");
  const [deptHead, setDeptHead] = useState("");

  const handleAdd = (e) => {
    e.preventDefault();
    if (!deptName) return;
    const newDept = {
      id: `DEPT0${departments.length + 1}`,
      name: deptName,
      head: deptHead || "Director TBD",
      openings: 0,
      totalInterns: 0,
      status: "active",
    };
    setDepartments([...departments, newDept]);
    toast.success("Department added!");
    setModalOpen(false);
    setDeptName("");
    setDeptHead("");
  };

  return (
    <div className="page-container">
      <Breadcrumbs />

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Departments Directory</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            KCCA Directorates and Departments managing internship allocations.
          </p>
        </div>

        <Button variant="primary" size="md" onClick={() => setModalOpen(true)} icon={Plus}>
          Add Department
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {departments.map((d) => (
          <div key={d.id} className="card p-6 space-y-4 hover:shadow-card-md transition">
            <div className="flex justify-between items-start">
              <div className="w-10 h-10 bg-primary-50 dark:bg-primary-900/30 rounded-xl flex items-center justify-center">
                <Building2 className="w-5 h-5 text-primary-500" />
              </div>
              <Badge status={d.status} />
            </div>

            <div>
              <h3 className="font-bold text-slate-800 dark:text-white text-base">{d.name}</h3>
              <p className="text-xs text-slate-400 mt-0.5">Head: {d.head}</p>
            </div>

            <div className="grid grid-cols-2 gap-2 p-3 bg-slate-50 dark:bg-slate-700/40 rounded-xl text-xs">
              <div>
                <p className="text-slate-400">Open Positions</p>
                <p className="font-bold text-slate-800 dark:text-white text-sm">{d.openings}</p>
              </div>
              <div>
                <p className="text-slate-400">Total Interns Placed</p>
                <p className="font-bold text-primary-600 text-sm">{d.totalInterns}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {modalOpen && (
        <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Add Department" size="sm">
          <form onSubmit={handleAdd} className="p-6 space-y-4">
            <Input label="Department Name" required value={deptName} onChange={e => setDeptName(e.target.value)} placeholder="e.g. Urban Planning" />
            <Input label="Director / Head of Dept" value={deptHead} onChange={e => setDeptHead(e.target.value)} placeholder="e.g. Eng. Moses Kabugo" />
            <div className="flex justify-end gap-2 pt-3 border-t">
              <Button type="button" variant="ghost" size="sm" onClick={() => setModalOpen(false)}>Cancel</Button>
              <Button type="submit" variant="primary" size="sm">Add Directorate</Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default HRDepartments;
