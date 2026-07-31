
import { useState } from "react";
import Breadcrumbs from "../../components/layout/Breadcrumbs";
import Button from "../../components/ui/Button";
import Select from "../../components/ui/Select";
import { KCCA_DEPARTMENTS } from "../../utils/constants";
import { BarChart3, Download, FileText, FileSpreadsheet, Filter, CheckCircle2 } from "lucide-react";
import toast from "react-hot-toast";

const HRReports = () => {
  const [reportType, setReportType] = useState("Applications Summary");
  const [deptFilter, setDeptFilter] = useState("All Departments");
  const [format, setFormat] = useState("PDF");

  const handleGenerate = (e) => {
    e.preventDefault();
    toast.success(`Generating ${reportType} report in ${format} format...`);
  };

  return (
    <div className="page-container max-w-5xl mx-auto space-y-6">
      <Breadcrumbs />

      <div>
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Reports & Analytics Generator</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm">
          Generate comprehensive recruitment reports and export data to PDF, Excel, or CSV formats.
        </p>
      </div>

      {}
      <div className="card p-6 space-y-6">
        <h3 className="font-bold text-base text-slate-800 dark:text-white border-b pb-3 border-slate-100 dark:border-slate-700 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-primary-500" /> Report Configuration
        </h3>

        <form onSubmit={handleGenerate} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Select
            label="Report Type"
            value={reportType}
            onChange={(e) => setReportType(e.target.value)}
            options={[
              "Applications Summary",
              "Accepted Candidates List",
              "Rejected Applications Audit",
              "Gender Diversity Breakdown",
              "University Distribution Report",
              "District Representation Report"
            ]}
          />
          <Select
            label="Filter Directorate"
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            options={["All Departments", ...KCCA_DEPARTMENTS]}
          />
          <Select
            label="Export Format"
            value={format}
            onChange={(e) => setFormat(e.target.value)}
            options={["PDF Document (.pdf)", "Excel Spreadsheet (.xlsx)", "CSV File (.csv)"]}
          />
        </form>

        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-700">
          <Button variant="outline" size="md" onClick={() => toast.success("Exporting Excel...")} icon={FileSpreadsheet}>
            Export Excel
          </Button>
          <Button variant="primary" size="md" onClick={handleGenerate} icon={Download}>
            Generate & Download PDF
          </Button>
        </div>
      </div>

      {}
      <div className="card p-6 space-y-4">
        <h3 className="font-bold text-base text-slate-800 dark:text-white">Generated Report Preview ({reportType})</h3>

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
              {[
                { dept: "ICT", total: 45, shortlisted: 15, accepted: 4, rejected: 10, rate: "8.8%" },
                { dept: "Public Health", total: 62, shortlisted: 20, accepted: 6, rejected: 14, rate: "9.6%" },
                { dept: "Education", total: 78, shortlisted: 25, accepted: 8, rejected: 18, rate: "10.2%" },
                { dept: "Finance & Planning", total: 52, shortlisted: 18, accepted: 5, rejected: 12, rate: "9.6%" },
                { dept: "Legal Services", total: 24, shortlisted: 8, accepted: 2, rejected: 6, rate: "8.3%" },
              ].map((row, i) => (
                <tr key={i}>
                  <td className="font-bold text-slate-800 dark:text-white">{row.dept}</td>
                  <td>{row.total}</td>
                  <td><span className="text-purple-600 font-semibold">{row.shortlisted}</span></td>
                  <td><span className="text-accent-500 font-bold">{row.accepted}</span></td>
                  <td><span className="text-danger font-semibold">{row.rejected}</span></td>
                  <td><span className="badge badge-accepted">{row.rate}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default HRReports;
