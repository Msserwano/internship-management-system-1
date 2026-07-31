
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import StatCard from "../../components/ui/StatCard";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import Breadcrumbs from "../../components/layout/Breadcrumbs";
import Skeleton from "../../components/ui/Skeleton";
import useApi from "../../hooks/useApi";
import { fDate } from "../../utils/formatters";
import {
  Briefcase, FileText, CheckCircle2, Clock, ArrowRight, User,
  Calendar, Award, AlertCircle
} from "lucide-react";

const ApplicantDashboard = () => {
  const { user } = useAuth();
  const { data: internships, loading: loadingJobs } = useApi("/internships");
  const { data: applications, loading: loadingApps } = useApi("/applications");

  const openVacanciesCount = internships.filter(i => i.status === "open").length;
  const userApplications   = applications.length > 0 ? applications : [];
  const totalApps          = userApplications.length;
  const shortlistedCount   = userApplications.filter(a => a.status === "shortlisted").length;
  const pendingCount       = userApplications.filter(a => a.status === "under_review" || a.status === "submitted").length;

  return (
    <div className="page-container">
      <Breadcrumbs />

      {}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-3xl p-8 text-white bg-gradient-to-r from-primary-600 via-primary-500 to-sky-500 shadow-lg relative overflow-hidden"
      >
        <div className="relative z-10 max-w-3xl">
          <h1 className="text-3xl font-extrabold mb-2">
            Welcome back, {user?.name?.split(" ")[0] || "Applicant"}!
          </h1>
          <p className="text-primary-100 text-base mb-6 leading-relaxed">
            Explore open roles, track your applications, and keep your profile in great shape all from one place.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link to="/applicant/internships">
              <Button variant="secondary" size="md" icon={Briefcase}>
                Browse Vacancies
              </Button>
            </Link>
            <Link to="/applicant/applications">
              <Button variant="outline" size="md" className="!text-white !border-white/40 hover:!bg-white/10" icon={FileText}>
                My Applications
              </Button>
            </Link>
            <Link to="/applicant/profile">
              <Button variant="ghost" size="md" className="!text-white hover:!bg-white/10" icon={User}>
                Update Profile
              </Button>
            </Link>
          </div>
        </div>
        <div className="absolute right-6 -bottom-6 opacity-15 pointer-events-none hidden lg:block">
          <Briefcase className="w-64 h-64 text-white" />
        </div>
      </motion.div>

      {}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Open Vacancies"
          value={openVacanciesCount}
          icon={Briefcase}
          color="primary"
          index={0}
        />
        <StatCard
          title="Total Applications"
          value={totalApps}
          icon={Clock}
          color="info"
          index={1}
        />
        <StatCard
          title="Shortlisted"
          value={shortlistedCount}
          icon={CheckCircle2}
          color="accent"
          index={2}
        />
        <StatCard
          title="Pending Review"
          value={pendingCount}
          icon={AlertCircle}
          color="secondary"
          index={3}
        />
      </div>

      {}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-slate-800 dark:text-white text-base">Application Status Breakdown</h3>
          <span className="text-xs text-slate-500">Total: {totalApps}</span>
        </div>

        {}
        <div className="w-full h-3 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden flex gap-0.5">
          <div className="h-full bg-yellow-400" style={{ width: totalApps ? `${(pendingCount / totalApps) * 100}%` : '0%' }} title="Under Review" />
          <div className="h-full bg-purple-500" style={{ width: totalApps ? `${(shortlistedCount / totalApps) * 100}%` : '0%' }} title="Shortlisted" />
          <div className="h-full bg-green-500" style={{ width: totalApps ? `${(userApplications.filter(a => a.status === 'accepted').length / totalApps) * 100}%` : '0%' }} title="Accepted" />
        </div>

        <div className="flex flex-wrap gap-6 mt-4 text-xs font-medium text-slate-600 dark:text-slate-300">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-yellow-400 inline-block" />
            Under Review ({pendingCount})
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-purple-500 inline-block" />
            Shortlisted ({shortlistedCount})
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-green-500 inline-block" />
            Accepted ({userApplications.filter(a => a.status === 'accepted').length})
          </div>
        </div>
      </div>

      {}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {}
        <div className="lg:col-span-2 space-y-4">
          <div className="card p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-slate-800 dark:text-white">Recent Applications</h3>
              <Link to="/applicant/applications" className="text-sm font-semibold text-primary-500 hover:underline flex items-center gap-1">
                View all <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="space-y-4">
              {userApplications.length > 0 ? (
                userApplications.map((app) => (
                  <div
                    key={app.id}
                    className="p-5 rounded-2xl border border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-slate-100/50 dark:hover:bg-slate-700/40 transition flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="font-bold text-slate-800 dark:text-white text-base">
                          {app.internshipTitle}
                        </h4>
                        <Badge status={app.status} />
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Department: <strong className="text-slate-700 dark:text-slate-300 font-semibold">{app.department}</strong>
                      </p>
                      <p className="text-xs text-slate-400">
                        Submitted: {fDate(app.submittedAt)}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <Link to="/applicant/internships">
                        <Button variant="outline" size="xs">
                          Vacancy
                        </Button>
                      </Link>
                      <Link to="/applicant/applications">
                        <Button variant="primary" size="xs">
                          Details
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-10 text-slate-500">
                  <p>You haven't submitted any applications yet.</p>
                  <Link to="/applicant/internships" className="btn btn-primary btn-sm mt-3">
                    Browse Internships
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {}
        <div className="space-y-6">
          {}
          <div className="card p-6">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Your Profile</h3>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-700">
                <span className="text-slate-500">Name</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{user?.name}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-700">
                <span className="text-slate-500">Username</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{user?.email?.split('@')[0]}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-700 truncate">
                <span className="text-slate-500">Email</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200 truncate ml-2">{user?.email}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-700">
                <span className="text-slate-500">Phone</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{user?.phone || "+256 701 234 567"}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-700">
                <span className="text-slate-500">Address</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{user?.address || "Kampala, Uganda"}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-700">
                <span className="text-slate-500">Nationality</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{user?.nationality || "Ugandan"}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-700">
                <span className="text-slate-500">Gender</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{user?.gender || "Female"}</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-slate-500">Date of Birth</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{user?.dob ? fDate(user.dob) : "14 Mar 2001"}</span>
              </div>
            </div>

            <Link to="/applicant/profile" className="block mt-5">
              <Button variant="primary" size="md" className="w-full" icon={User}>
                Update Profile
              </Button>
            </Link>
          </div>

          {}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-800 dark:text-white">Featured Vacancies</h3>
              <Link to="/applicant/internships" className="text-xs text-primary-500 hover:underline">
                See more &gt;
              </Link>
            </div>

            <div className="space-y-3">
              {internships.slice(0, 3).map((job) => (
                <div key={job.id} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-700/50 hover:bg-slate-100 transition">
                  <p className="font-semibold text-slate-800 dark:text-white text-xs">{job.title}</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{job.department} • {job.duration}</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-[10px] text-primary-600 dark:text-primary-400 font-medium">{job.location}</span>
                    <Link to={`/applicant/apply/${job.id}`} className="text-xs text-primary-500 font-bold hover:underline">
                      Apply
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApplicantDashboard;
