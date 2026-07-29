// src/components/charts/DashboardCharts.jsx
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
);

export const DepartmentBarChart = () => {
  const data = {
    labels: ["ICT", "Public Health", "Education", "Finance", "Legal", "Urban Planning", "Engineering", "Gender"],
    datasets: [
      {
        label: "Applications Received",
        data: [45, 62, 78, 52, 24, 38, 41, 56],
        backgroundColor: "rgba(0, 91, 172, 0.85)",
        borderRadius: 8,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { display: false },
      tooltip: { cornerRadius: 8 },
    },
    scales: {
      y: { grid: { color: "rgba(0,0,0,0.05)" } },
      x: { grid: { display: false } },
    },
  };

  return <Bar data={data} options={options} />;
};

export const GenderPieChart = () => {
  const data = {
    labels: ["Female", "Male"],
    datasets: [
      {
        data: [54, 46],
        backgroundColor: ["#005BAC", "#F4B400"],
        borderWidth: 0,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { position: "bottom" },
    },
  };

  return <Pie data={data} options={options} />;
};

export const StatusDoughnutChart = () => {
  const data = {
    labels: ["Submitted", "Under Review", "Shortlisted", "Interview", "Accepted", "Rejected"],
    datasets: [
      {
        data: [30, 45, 20, 15, 25, 10],
        backgroundColor: ["#3b82f6", "#eab308", "#a855f7", "#f97316", "#22c55e", "#ef4444"],
        borderWidth: 0,
      },
    ],
  };

  const options = {
    responsive: true,
    cutout: "70%",
    plugins: {
      legend: { position: "bottom" },
    },
  };

  return <Doughnut data={data} options={options} />;
};

export const MonthlyLineChart = () => {
  const data = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"],
    datasets: [
      {
        fill: true,
        label: "Applications Trend",
        data: [65, 80, 120, 140, 190, 240, 310],
        borderColor: "#005BAC",
        backgroundColor: "rgba(0, 91, 172, 0.1)",
        tension: 0.4,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { display: false },
    },
    scales: {
      y: { grid: { color: "rgba(0,0,0,0.05)" } },
      x: { grid: { display: false } },
    },
  };

  return <Line data={data} options={options} />;
};

export const UniversityBarChart = () => {
  const data = {
    labels: ["Makerere", "Kyambogo", "UCU", "MUBS", "MUST", "IUIU"],
    datasets: [
      {
        label: "Applicants Count",
        data: [140, 95, 70, 85, 45, 30],
        backgroundColor: "rgba(22, 163, 74, 0.85)",
        borderRadius: 8,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: { legend: { display: false } },
    scales: {
      y: { grid: { color: "rgba(0,0,0,0.05)" } },
      x: { grid: { display: false } },
    },
  };

  return <Bar data={data} options={options} />;
};
