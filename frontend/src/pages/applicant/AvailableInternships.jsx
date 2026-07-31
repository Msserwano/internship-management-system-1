
import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import Breadcrumbs from "../../components/layout/Breadcrumbs";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Select from "../../components/ui/Select";
import Modal from "../../components/ui/Modal";
import EmptyState from "../../components/ui/EmptyState";
import Skeleton from "../../components/ui/Skeleton";
import useApi from "../../hooks/useApi";
import { KCCA_DEPARTMENTS, DURATIONS, LOCATIONS } from "../../utils/constants";
import { fDate, fDeadline } from "../../utils/formatters";
import { Search, Filter, Briefcase, MapPin, Clock, Users, ArrowRight, X, Calendar } from "lucide-react";

const AvailableInternships = () => {
  const { data: internships, loading } = useApi("/internships");
  const { data: myApplications } = useApi("/applications");
  const [search, setSearch] = useState("");
  const [deptFilter, setDeptFilter] = useState("");
  const [durationFilter, setDurationFilter] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [selectedJob, setSelectedJob] = useState(null);

  const isApplied = (jobId) =>
    Array.isArray(myApplications) &&
    myApplications.some((a) => String(a.internshipId || a.internship_id) === String(jobId));

  const filtered = useMemo(() => {
    return internships.filter((job) => {
      const matchSearch =
        job.title?.toLowerCase().includes(search.toLowerCase()) ||
        job.department?.toLowerCase().includes(search.toLowerCase()) ||
        job.description?.toLowerCase().includes(search.toLowerCase());
      const matchDept = !deptFilter || job.department === deptFilter;
      const matchDuration = !durationFilter || job.duration === durationFilter;
      const matchLocation = !locationFilter || job.location === locationFilter;
      return matchSearch && matchDept && matchDuration && matchLocation;
    });
  }, [internships, search, deptFilter, durationFilter, locationFilter]);

  const clearFilters = () => {
    setSearch("");
    setDeptFilter("");
    setDurationFilter("");
    setLocationFilter("");
  };

  if (loading) return (
    <div className="page-container"><Breadcrumbs />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">{[...Array(6)].map((_, i) => <Skeleton key={i} className="h-64 rounded-2xl" />)}</div>
    </div>
  );

  return (
    <div className="page-container">
      <Breadcrumbs />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Available Internships</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            Explore current internship vacancies across KCCA directorates and departments.
          </p>
        </div>
      </div>

      {}
      <div className="card p-5 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <Input
            placeholder="Search by title or keywords..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            icon={Search}
          />
          <Select
            placeholder="All Departments"
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            options={KCCA_DEPARTMENTS}
          />
          <Select
            placeholder="All Durations"
            value={durationFilter}
            onChange={(e) => setDurationFilter(e.target.value)}
            options={DURATIONS}
          />
          <Select
            placeholder="All Locations"
            value={locationFilter}
            onChange={(e) => setLocationFilter(e.target.value)}
            options={LOCATIONS}
          />
        </div>

        {(search || deptFilter || durationFilter || locationFilter) && (
          <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-700">
            <span className="text-xs text-slate-500">
              Showing {filtered.length} of {internships.length} vacancies
            </span>
            <Button variant="ghost" size="xs" onClick={clearFilters} icon={X}>
              Clear Filters
            </Button>
          </div>
        )}
      </div>

      {}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((job, idx) => (
            <motion.div
              key={job.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="card p-6 flex flex-col justify-between hover:shadow-card-md hover:-translate-y-1 transition-all cursor-pointer group"
              onClick={() => setSelectedJob(job)}
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="w-10 h-10 bg-primary-50 dark:bg-primary-900/30 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Briefcase className="w-5 h-5 text-primary-500" />
                  </div>
                  {isApplied(job.id) ? (
                    <span className="badge badge-accepted text-[10px]">Applied</span>
                  ) : (
                    <span className="badge badge-open text-[10px]">Open</span>
                  )}
                </div>

                <h3 className="font-bold text-slate-800 dark:text-white text-base mb-1 group-hover:text-primary-600 transition">
                  {job.title}
                </h3>
                <p className="text-xs font-semibold text-primary-600 dark:text-primary-400 mb-3">
                  {job.department}
                </p>

                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-4 leading-relaxed">
                  {job.description}
                </p>

                {/* Details */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
                    <Clock className="w-4 h-4 text-slate-400" />
                    <span>Duration: <strong>{job.duration}</strong></span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
                    <MapPin className="w-4 h-4 text-slate-400" />
                    <span>{job.location}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
                    <Users className="w-4 h-4 text-slate-400" />
                    <span>{job.vacancies} Position{job.vacancies > 1 ? "s" : ""}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
                    <Calendar className="w-4 h-4 text-slate-400" />
                    <span>Deadline: <strong className="text-danger">{fDeadline(job.deadline)}</strong></span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between">
                <span className="text-[11px] text-slate-500 font-medium">
                  Posted: {fDate(job.posted_at || job.postedAt || job.created_at || job.posted)}
                </span>
                {isApplied(job.id) ? (
                  <Link
                    to="/applicant/applications"
                    onClick={(e) => e.stopPropagation()}
                    className="btn btn-outline btn-xs !text-accent-600 !border-accent-400"
                  >
                    View Status
                  </Link>
                ) : (
                  <Link
                    to={`/applicant/apply/${job.id}`}
                    onClick={(e) => e.stopPropagation()}
                    className="btn btn-primary btn-xs"
                  >
                    Apply Now <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Briefcase}
          title="No Internships Found"
          description="We couldn't find any internships matching your search criteria. Try clearing your filters."
          action={<Button variant="outline" size="sm" onClick={clearFilters}>Reset Search</Button>}
        />
      )}

      {/* Detail Modal */}
      {selectedJob && (
        <Modal
          open={!!selectedJob}
          onClose={() => setSelectedJob(null)}
          title={selectedJob.title}
          size="lg"
        >
          <div className="p-6 space-y-6">
            <div className="flex flex-wrap items-center gap-2">
              <span className="badge badge-open text-xs">Open Vacancy</span>
              <span className="text-xs font-semibold text-primary-600 dark:text-primary-400">{selectedJob.department}</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 p-4 bg-slate-50 dark:bg-slate-700/50 rounded-2xl">
              <div>
                <p className="text-[11px] text-slate-400">Date Posted</p>
                <p className="text-xs font-bold text-slate-700 dark:text-slate-200">{fDate(selectedJob.posted_at || selectedJob.postedAt || selectedJob.created_at)}</p>
              </div>
              <div>
                <p className="text-[11px] text-slate-400">Duration</p>
                <p className="text-xs font-bold text-slate-700 dark:text-slate-200">{selectedJob.duration}</p>
              </div>
              <div>
                <p className="text-[11px] text-slate-400">Location</p>
                <p className="text-xs font-bold text-slate-700 dark:text-slate-200">{selectedJob.location}</p>
              </div>
              <div>
                <p className="text-[11px] text-slate-400">Vacancies</p>
                <p className="text-xs font-bold text-slate-700 dark:text-slate-200">{selectedJob.vacancies}</p>
              </div>
              <div>
                <p className="text-[11px] text-slate-400">Deadline</p>
                <p className="text-xs font-bold text-danger">{fDate(selectedJob.deadline)}</p>
              </div>
            </div>

            <div>
              <h4 className="font-bold text-slate-800 dark:text-white text-sm mb-2">Description</h4>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{selectedJob.description}</p>
            </div>

            <div>
              <h4 className="font-bold text-slate-800 dark:text-white text-sm mb-2">Requirements</h4>
              <ul className="list-disc list-inside text-sm text-slate-600 dark:text-slate-300 space-y-1">
                {selectedJob.requirements.map((req, i) => (
                  <li key={i}>{req}</li>
                ))}
              </ul>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-700">
              <span className="text-xs text-slate-500">Supervisor: <strong>{selectedJob.supervisor}</strong></span>
              {isApplied(selectedJob.id) ? (
                <Link to="/applicant/applications">
                  <Button variant="secondary" size="md">
                    View My Submitted Application
                  </Button>
                </Link>
              ) : (
                <Link to={`/applicant/apply/${selectedJob.id}`}>
                  <Button variant="primary" size="md" icon={ArrowRight}>
                    Proceed to Application
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default AvailableInternships;
