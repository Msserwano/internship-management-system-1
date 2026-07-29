// src/pages/hr/Dashboard.jsx
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import Breadcrumbs from "../../components/layout/Breadcrumbs";
import StatCard from "../../components/ui/StatCard";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";
import Skeleton from "../../components/ui/Skeleton";
import useApi from "../../hooks/useApi";
import {
  DepartmentBarChart, GenderPieChart, StatusDoughnutChart,
  MonthlyLineChart, UniversityBarChart
} from "../../components/charts/DashboardCharts";
import { fDate } from "../../utils/formatters";
import {
  FileText, Building2, CheckCircle2, XCircle, Clock, Plus, ArrowRight, Download, Users
} from "lucide-react";

const HRDashboard = () => {
  const { data: applications, loading: loadingApps } = useApi("/applications");
  const { data: internships, loading: loadingJobs }  = useApi("/internships");

  if (loadingApps || loadingJobs) return (
    <div className="page-container"><Breadcrumbs />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-28 rounded-2xl" />)}</div>
    </div>
  );
  return (
    <div className="page-container">
      <Breadcrumbs />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">HR Officer Dashboard</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            Overview of internship recruitment, applicant pipeline, and department analytics.
          </p>
        </div>

        <div className="flex gap-2">
          <Link to="/hr/internships">
            <Button variant="primary" size="sm" icon={Plus}>
              Create Internship
            </Button>
          </Link>
          <Link to="/hr/reports">
            <Button variant="outline" size="sm" icon={Download}>
              Export Reports
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          title="Total Applications"
          value={String(applications.length)}
          change="+18% this month"
          icon={FileText}
          color="primary"
          index={0}
        />
        <StatCard
          title="Active Postings"
          value={String(internships.filter(i => i.status === 'open').length)}
          change="Open Vacancies"
          icon={Building2}
          color="info"
          index={1}
        />
        <StatCard
          title="Accepted Interns"
          value={String(applications.filter(a => a.status === 'accepted').length)}
          change="Placed"
          icon={CheckCircle2}
          color="accent"
          index={2}
        />
        <StatCard
          title="Pending Review"
          value={String(applications.filter(a => ['submitted', 'under_review'].includes(a.status)).length)}
          change="Action required"
          icon={Clock}
          color="secondary"
          index={3}
        />
        <StatCard
          title="Rejected"
          value={String(applications.filter(a => a.status === 'rejected').length)}
          change="Unsuccessful"
          icon={XCircle}
          color="danger"
          index={4}
        />
      </div>

      {/* Charts Row 1: Applications by Department & Status Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 card p-6">
          <h3 className="font-bold text-slate-800 dark:text-white text-base mb-4">
            Applications by Department
          </h3>
          <DepartmentBarChart />
        </div>

        <div className="card p-6">
          <h3 className="font-bold text-slate-800 dark:text-white text-base mb-4">
            Application Status Distribution
          </h3>
          <StatusDoughnutChart />
        </div>
      </div>

      {/* Charts Row 2: Monthly Applications Trend, Gender Distribution, Top Universities */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card p-6">
          <h3 className="font-bold text-slate-800 dark:text-white text-base mb-4">
            Monthly Applications Trend
          </h3>
          <MonthlyLineChart />
        </div>

        <div className="card p-6">
          <h3 className="font-bold text-slate-800 dark:text-white text-base mb-4">
            Gender Diversity Ratio
          </h3>
          <GenderPieChart />
        </div>

        <div className="card p-6">
          <h3 className="font-bold text-slate-800 dark:text-white text-base mb-4">
            Top Applicant Universities
          </h3>
          <UniversityBarChart />
        </div>
      </div>

      {/* Recent Applications Table */}
      <div className="card p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-slate-800 dark:text-white text-base">Recent Applications Received</h3>
          <Link to="/hr/applications" className="text-xs font-semibold text-primary-500 hover:underline flex items-center gap-1">
            View All Applications <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Applicant Name</th>
                <th>Internship Role</th>
                <th>Department</th>
                <th>University</th>
                <th>GPA</th>
                <th>Status</th>
                <th>Submitted</th>
              </tr>
            </thead>
            <tbody>
              {applications.slice(0, 5).map((app) => (
                <tr key={app.id}>
                  <td className="font-bold text-slate-800 dark:text-white">{app.applicantName}</td>
                  <td>{app.internshipTitle}</td>
                  <td>{app.department}</td>
                  <td>{app.university}</td>
                  <td><span className="font-semibold text-primary-600">{app.gpa}</span></td>
                  <td><Badge status={app.status} /></td>
                  <td className="text-xs text-slate-400">{fDate(app.submittedAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default HRDashboard;
