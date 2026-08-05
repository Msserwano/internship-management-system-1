
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from "chart.js";
import { Bar, Doughnut, Line, Pie } from "react-chartjs-2";

ChartJS.register(
  CategoryScale, LinearScale, BarElement, PointElement,
  LineElement, ArcElement, Title, Tooltip, Legend, Filler
);

const BAR_OPTS = {
  responsive: true,
  plugins: { legend: { display: false }, tooltip: { cornerRadius: 8 } },
  scales: {
    y: { grid: { color: "rgba(0,0,0,0.05)" }, ticks: { precision: 0 } },
    x: { grid: { display: false } },
  },
};

const PIE_OPTS = {
  responsive: true,
  plugins: { legend: { position: "bottom", labels: { padding: 12, font: { size: 11 } } } },
};

// ── Department Bar Chart — driven by real application data ─────────────────
export const DepartmentBarChart = ({ applications = [] }) => {
  const deptMap = {};
  applications.forEach(a => {
    const dept = a.department || "Other";
    deptMap[dept] = (deptMap[dept] || 0) + 1;
  });
  const sorted = Object.entries(deptMap).sort((a, b) => b[1] - a[1]).slice(0, 8);
  const labels = sorted.map(([d]) => d.split(" ").slice(0, 2).join(" "));
  const values = sorted.map(([, v]) => v);

  const data = {
    labels,
    datasets: [{
      label: "Applications",
      data: values,
      backgroundColor: "rgba(0, 91, 172, 0.85)",
      borderRadius: 8,
    }],
  };
  return <Bar data={data} options={BAR_OPTS} />;
};

// ── Status Doughnut — real status breakdown ─────────────────────────────────
export const StatusDoughnutChart = ({ applications = [] }) => {
  const statuses = ["submitted", "under_review", "shortlisted", "interview", "accepted", "rejected", "withdrawn"];
  const labels    = ["Submitted", "Under Review", "Shortlisted", "Interview", "Accepted", "Rejected", "Withdrawn"];
  const colors    = ["#3b82f6", "#eab308", "#a855f7", "#f97316", "#22c55e", "#ef4444", "#94a3b8"];
  const counts    = statuses.map(s => applications.filter(a => a.status === s).length);

  const data = {
    labels,
    datasets: [{ data: counts, backgroundColor: colors, borderWidth: 0 }],
  };
  const options = { ...PIE_OPTS, cutout: "70%" };
  return <Doughnut data={data} options={options} />;
};

// ── Monthly Trend — real submitted_at buckets ──────────────────────────────
export const MonthlyLineChart = ({ applications = [] }) => {
  const now = new Date();
  const months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
    return { label: d.toLocaleString("default", { month: "short" }), year: d.getFullYear(), month: d.getMonth() };
  });
  const counts = months.map(({ year, month }) =>
    applications.filter(a => {
      const d = new Date(a.submitted_at || a.submittedAt);
      return d.getFullYear() === year && d.getMonth() === month;
    }).length
  );

  const data = {
    labels: months.map(m => m.label),
    datasets: [{
      fill: true,
      label: "Applications",
      data: counts,
      borderColor: "#006837",
      backgroundColor: "rgba(0, 104, 55, 0.12)",
      tension: 0.4,
      pointRadius: 4,
      pointBackgroundColor: "#006837",
    }],
  };
  const options = {
    responsive: true,
    plugins: { legend: { display: false } },
    scales: {
      y: { grid: { color: "rgba(0,0,0,0.05)" }, ticks: { precision: 0 }, beginAtZero: true },
      x: { grid: { display: false } },
    },
  };
  return <Line data={data} options={options} />;
};

// ── University Bar Chart — top universities by applicant count ─────────────
export const UniversityBarChart = ({ applications = [] }) => {
  const uniMap = {};
  applications.forEach(a => {
    if (!a.university) return;
    const uni = String(a.university).split(" ").slice(0, 2).join(" ");
    uniMap[uni] = (uniMap[uni] || 0) + 1;
  });
  const sorted = Object.entries(uniMap).sort((a, b) => b[1] - a[1]).slice(0, 6);
  const labels = sorted.map(([u]) => u);
  const values = sorted.map(([, v]) => v);

  const data = {
    labels,
    datasets: [{
      label: "Applicants",
      data: values,
      backgroundColor: "rgba(0, 104, 55, 0.85)",
      borderRadius: 8,
    }],
  };
  return <Bar data={data} options={BAR_OPTS} />;
};

// ── Gender Pie — placeholder (no gender stored in DB yet) ──────────────────
export const GenderPieChart = () => {
  const data = {
    labels: ["Female", "Male", "Not Specified"],
    datasets: [{
      data: [1, 1, 1],
      backgroundColor: ["#006837", "#ED1C24", "#FFC20E"],
      borderWidth: 0,
    }],
  };
  return (
    <div className="flex flex-col items-center gap-3">
      <Pie data={data} options={PIE_OPTS} />
      <p className="text-[10px] text-slate-400 text-center">Gender data not collected during application</p>
    </div>
  );
};
