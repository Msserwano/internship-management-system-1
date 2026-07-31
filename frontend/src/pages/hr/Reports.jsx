import { useState, useMemo } from "react";
import Breadcrumbs from "../../components/layout/Breadcrumbs";
import Button from "../../components/ui/Button";
import Select from "../../components/ui/Select";
import Skeleton from "../../components/ui/Skeleton";
import useApi from "../../hooks/useApi";
import { KCCA_DEPARTMENTS } from "../../utils/constants";
import { fDate } from "../../utils/formatters";
import { BarChart3, Download, FileText, FileSpreadsheet, RefreshCw } from "lucide-react";
import toast from "react-hot-toast";

const REPORT_TYPES = [
  "Applications Summary",
  "Accepted Candidates List",
  "Rejected Applications Audit",
  "Gender Diversity Breakdown",
  "University Distribution Report",
];

const HRReports = () => {
  const { data: applications, loading, refetch } = useApi("/applications");
  const { data: rawDepts } = useApi("/data/departments");

  const [reportType, setReportType] = useState("Applications Summary");
  const [deptFilter, setDeptFilter] = useState("All Departments");
  const [format, setFormat] = useState("PDF Document (.pdf)");

  // Extract unique departments from live applications, database, and system constants
  const departmentOptions = useMemo(() => {
    const set = new Set(KCCA_DEPARTMENTS);
    if (Array.isArray(rawDepts)) {
      rawDepts.forEach((d) => d.name && set.add(d.name));
    }
    if (Array.isArray(applications)) {
      applications.forEach((a) => a.department && set.add(a.department));
    }
    return ["All Departments", ...Array.from(set).sort()];
  }, [rawDepts, applications]);

  // Compute Applications Summary Report by Directorate
  const summaryReportData = useMemo(() => {
    const deptMap = {};

    // Initialize all departments with 0 counts
    departmentOptions.forEach((d) => {
      if (d !== "All Departments") {
        deptMap[d] = { total: 0, shortlisted: 0, accepted: 0, rejected: 0 };
      }
    });

    // Populate counts from real live applications
    if (Array.isArray(applications)) {
      applications.forEach((app) => {
        const dept = app.department || "General";
        if (!deptMap[dept]) {
          deptMap[dept] = { total: 0, shortlisted: 0, accepted: 0, rejected: 0 };
        }
        deptMap[dept].total += 1;

        const st = (app.status || "").toLowerCase();
        if (st === "shortlisted" || st === "interview") {
          deptMap[dept].shortlisted += 1;
        } else if (st === "accepted") {
          deptMap[dept].accepted += 1;
        } else if (st === "rejected") {
          deptMap[dept].rejected += 1;
        }
      });
    }

    let rows = Object.entries(deptMap).map(([dept, counts]) => {
      const rate = counts.total > 0 ? ((counts.accepted / counts.total) * 100).toFixed(1) + "%" : "0.0%";
      return { dept, ...counts, rate };
    });

    if (deptFilter !== "All Departments") {
      rows = rows.filter((r) => r.dept === deptFilter);
    }

    return rows;
  }, [applications, departmentOptions, deptFilter]);

  // Compute Accepted Candidates Report
  const acceptedCandidatesData = useMemo(() => {
    if (!Array.isArray(applications)) return [];
    return applications
      .filter((a) => (a.status || "").toLowerCase() === "accepted")
      .filter((a) => deptFilter === "All Departments" || a.department === deptFilter);
  }, [applications, deptFilter]);

  // Compute Rejected Applications Audit Report
  const rejectedCandidatesData = useMemo(() => {
    if (!Array.isArray(applications)) return [];
    return applications
      .filter((a) => (a.status || "").toLowerCase() === "rejected")
      .filter((a) => deptFilter === "All Departments" || a.department === deptFilter);
  }, [applications, deptFilter]);

  // Compute University Distribution Report
  const universityDistributionData = useMemo(() => {
    if (!Array.isArray(applications)) return [];
    const uniMap = {};
    applications.forEach((a) => {
      if (deptFilter !== "All Departments" && a.department !== deptFilter) return;
      const uni = a.university || "Other / Unspecified";
      if (!uniMap[uni]) uniMap[uni] = { total: 0, shortlisted: 0, accepted: 0 };
      uniMap[uni].total += 1;
      const st = (a.status || "").toLowerCase();
      if (st === "shortlisted" || st === "interview") uniMap[uni].shortlisted += 1;
      if (st === "accepted") uniMap[uni].accepted += 1;
    });

    return Object.entries(uniMap).map(([university, c]) => ({
      university,
      ...c,
      rate: c.total > 0 ? ((c.accepted / c.total) * 100).toFixed(1) + "%" : "0.0%",
    }));
  }, [applications, deptFilter]);

  // Download CSV export based on active dynamic report table data
  const handleExportCSV = () => {
    let csvContent = "";
    let filename = `kcca_report_${reportType.toLowerCase().replace(/\s+/g, "_")}.csv`;

    if (reportType === "Applications Summary") {
      csvContent = "Directorate,Total Applicants,Shortlisted,Accepted,Rejected,Placement Rate\n";
      summaryReportData.forEach((r) => {
        csvContent += `"${r.dept}",${r.total},${r.shortlisted},${r.accepted},${r.rejected},"${r.rate}"\n`;
      });
    } else if (reportType === "Accepted Candidates List") {
      csvContent = "Applicant Name,Internship Title,Department,University,GPA,Submission Date\n";
      acceptedCandidatesData.forEach((a) => {
        csvContent += `"${a.applicantName}","${a.internshipTitle}","${a.department}","${a.university}","${a.gpa || ""}","${fDate(a.submittedAt)}"\n`;
      });
    } else if (reportType === "Rejected Applications Audit") {
      csvContent = "Applicant Name,Internship Title,Department,Review Note,Submission Date\n";
      rejectedCandidatesData.forEach((a) => {
        csvContent += `"${a.applicantName}","${a.internshipTitle}","${a.department}","${a.reviewNote || ""}","${fDate(a.submittedAt)}"\n`;
      });
    } else if (reportType === "University Distribution Report") {
      csvContent = "University,Total Applicants,Shortlisted,Accepted,Success Rate\n";
      universityDistributionData.forEach((u) => {
        csvContent += `"${u.university}",${u.total},${u.shortlisted},${u.accepted},"${u.rate}"\n`;
      });
    } else {
      csvContent = "Directorate,Total Applicants,Shortlisted,Accepted,Rejected,Placement Rate\n";
      summaryReportData.forEach((r) => {
        csvContent += `"${r.dept}",${r.total},${r.shortlisted},${r.accepted},${r.rejected},"${r.rate}"\n`;
      });
    }

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success(`Exported ${filename} cleanly.`);
  };

  const handleGenerate = (e) => {
    e?.preventDefault();
    toast.success(`Generated ${reportType} report for ${deptFilter} in ${format}.`);
    handleExportCSV();
  };

  if (loading) return (
    <div className="page-container max-w-5xl mx-auto"><Breadcrumbs />
      <div className="space-y-4">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-16 rounded-2xl" />)}</div>
    </div>
  );

  return (
    <div className="page-container max-w-5xl mx-auto space-y-6">
      <Breadcrumbs />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Reports & Analytics Generator</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            Generate live recruitment reports reflecting real system applications, directorates, and candidates.
          </p>
        </div>

        <Button variant="ghost" size="sm" onClick={() => refetch()} icon={RefreshCw}>
          Refresh Live Data
        </Button>
      </div>

      {/* Configuration Form */}
      <div className="card p-6 space-y-6">
        <h3 className="font-bold text-base text-slate-800 dark:text-white border-b pb-3 border-slate-100 dark:border-slate-700 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-primary-500" /> Report Configuration
        </h3>

        <form onSubmit={handleGenerate} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Select
            label="Report Type"
            value={reportType}
            onChange={(e) => setReportType(e.target.value)}
            options={REPORT_TYPES}
          />
          <Select
            label="Filter Directorate"
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            options={departmentOptions}
          />
          <Select
            label="Export Format"
            value={format}
            onChange={(e) => setFormat(e.target.value)}
            options={["PDF Document (.pdf)", "Excel Spreadsheet (.xlsx)", "CSV File (.csv)"]}
          />
        </form>

        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-700">
          <Button variant="outline" size="md" onClick={handleExportCSV} icon={FileSpreadsheet}>
            Export Excel / CSV
          </Button>
          <Button variant="primary" size="md" onClick={handleGenerate} icon={Download}>
            Generate & Download Report
          </Button>
        </div>
      </div>

      {/* Dynamic Report Table Preview */}
      <div className="card p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-base text-slate-800 dark:text-white">
            Generated Report Preview ({reportType})
          </h3>
          <span className="text-xs font-semibold text-primary-600 bg-primary-50 dark:bg-primary-900/30 px-3 py-1 rounded-lg">
            Live System Data ({applications.length} Total Applications)
          </span>
        </div>

        {/* 1. Applications Summary Table */}
        {reportType === "Applications Summary" && (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Directorate</th>
                  <th>Total Applicants</th>
                  <th>Shortlisted</th>
                  <th>Accepted</th>
                  <th>Rejected</th>
                  <th>Placement Rate</th>
                </tr>
              </thead>
              <tbody>
                {summaryReportData.map((row, i) => (
                  <tr key={i}>
                    <td className="font-bold text-slate-800 dark:text-white">{row.dept}</td>
                    <td>{row.total}</td>
                    <td><span className="text-purple-600 font-semibold">{row.shortlisted}</span></td>
                    <td><span className="text-emerald-600 font-bold">{row.accepted}</span></td>
                    <td><span className="text-rose-500 font-semibold">{row.rejected}</span></td>
                    <td><span className="badge badge-accepted">{row.rate}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* 2. Accepted Candidates List */}
        {reportType === "Accepted Candidates List" && (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Applicant Name</th>
                  <th>Internship Role</th>
                  <th>Department</th>
                  <th>University</th>
                  <th>GPA</th>
                  <th>Submission Date</th>
                </tr>
              </thead>
              <tbody>
                {acceptedCandidatesData.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-6 text-slate-400">
                      No accepted candidates found for the selected criteria.
                    </td>
                  </tr>
                ) : (
                  acceptedCandidatesData.map((a) => (
                    <tr key={a.id}>
                      <td className="font-bold text-slate-800 dark:text-white">{a.applicantName}</td>
                      <td>{a.internshipTitle}</td>
                      <td>{a.department}</td>
                      <td>{a.university}</td>
                      <td><span className="font-semibold text-primary-600">{a.gpa || "—"}</span></td>
                      <td className="text-xs text-slate-400">{fDate(a.submittedAt)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* 3. Rejected Applications Audit */}
        {reportType === "Rejected Applications Audit" && (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Applicant Name</th>
                  <th>Internship Role</th>
                  <th>Department</th>
                  <th>Review Remarks</th>
                  <th>Submission Date</th>
                </tr>
              </thead>
              <tbody>
                {rejectedCandidatesData.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-6 text-slate-400">
                      No rejected applications found for the selected criteria.
                    </td>
                  </tr>
                ) : (
                  rejectedCandidatesData.map((a) => (
                    <tr key={a.id}>
                      <td className="font-bold text-slate-800 dark:text-white">{a.applicantName}</td>
                      <td>{a.internshipTitle}</td>
                      <td>{a.department}</td>
                      <td className="text-xs text-slate-600 dark:text-slate-300">{a.reviewNote || "No remarks entered"}</td>
                      <td className="text-xs text-slate-400">{fDate(a.submittedAt)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* 4. University Distribution Report */}
        {reportType === "University Distribution Report" && (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>University / Institution</th>
                  <th>Total Applicants</th>
                  <th>Shortlisted</th>
                  <th>Accepted</th>
                  <th>Success Rate</th>
                </tr>
              </thead>
              <tbody>
                {universityDistributionData.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-6 text-slate-400">
                      No university application data available.
                    </td>
                  </tr>
                ) : (
                  universityDistributionData.map((u, i) => (
                    <tr key={i}>
                      <td className="font-bold text-slate-800 dark:text-white">{u.university}</td>
                      <td>{u.total}</td>
                      <td><span className="text-purple-600 font-semibold">{u.shortlisted}</span></td>
                      <td><span className="text-emerald-600 font-bold">{u.accepted}</span></td>
                      <td><span className="badge badge-accepted">{u.rate}</span></td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default HRReports;
