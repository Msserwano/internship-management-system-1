/**
 * exportApplications.js
 * Utility functions for exporting HR applications data to PDF and Excel.
 * Uses jsPDF + jspdf-autotable for PDF, and xlsx (SheetJS) for Excel.
 */

import { fDate } from "./formatters";

const KCCA_BLUE  = [0, 70, 127];   // #00467F
const KCCA_GREEN = [0, 128, 70];   // #008046

// ---------------------------------------------------------------------------
// Helper: normalize a status string for display
// ---------------------------------------------------------------------------
const fStatus = (s) => (s || "").replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

// ---------------------------------------------------------------------------
// Export to PDF
// ---------------------------------------------------------------------------
export async function exportApplicationsToPDF(apps, filters = {}) {
  const { default: jsPDF }    = await import("jspdf");
  const { default: autoTable } = await import("jspdf-autotable");

  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });

  // --- Header bar ---
  doc.setFillColor(...KCCA_BLUE);
  doc.rect(0, 0, 297, 22, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("KCCA Internship Management System", 14, 10);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text("Applications Report", 14, 17);

  // --- Meta info ---
  doc.setTextColor(80, 80, 80);
  doc.setFontSize(8);
  const now = new Date().toLocaleString("en-UG", { dateStyle: "medium", timeStyle: "short" });
  doc.text(`Generated: ${now}`, 14, 28);
  doc.text(`Total records: ${apps.length}`, 14, 33);

  // --- Active filters ---
  const filterParts = [];
  if (filters.status)   filterParts.push(`Status: ${fStatus(filters.status)}`);
  if (filters.dept)     filterParts.push(`Dept: ${filters.dept}`);
  if (filters.search)   filterParts.push(`Search: "${filters.search}"`);
  if (filterParts.length) {
    doc.setTextColor(...KCCA_GREEN);
    doc.text(`Filters: ${filterParts.join("  |  ")}`, 14, 38);
  }

  // --- Status summary badges row ---
  const statuses   = ["submitted", "under_review", "shortlisted", "interview", "accepted", "rejected"];
  const statusColors = {
    submitted:    [59, 130, 246],
    under_review: [234, 179, 8],
    shortlisted:  [168, 85, 247],
    interview:    [249, 115, 22],
    accepted:     [34, 197, 94],
    rejected:     [239, 68, 68],
  };
  let xPos = 14;
  statuses.forEach((s) => {
    const count = apps.filter((a) => a.status === s).length;
    doc.setFillColor(...(statusColors[s] || [100, 100, 100]));
    doc.roundedRect(xPos, 43, 42, 8, 1.5, 1.5, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(7);
    doc.setFont("helvetica", "bold");
    doc.text(`${fStatus(s)}: ${count}`, xPos + 2, 48.5);
    xPos += 45;
  });

  // --- Table ---
  autoTable(doc, {
    startY: 57,
    head: [[
      "#", "Applicant Name", "Email", "Internship Role",
      "Department", "University", "GPA", "Status", "Submitted"
    ]],
    body: apps.map((app, i) => [
      i + 1,
      app.applicantName || "—",
      app.applicantEmail || "—",
      app.internshipTitle || "—",
      app.department || "—",
      app.university || "—",
      app.gpa || "—",
      fStatus(app.status),
      fDate(app.submittedAt),
    ]),
    styles: {
      fontSize: 7.5,
      cellPadding: 2.5,
      overflow: "linebreak",
    },
    headStyles: {
      fillColor: KCCA_BLUE,
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 7.5,
    },
    alternateRowStyles: { fillColor: [245, 247, 250] },
    columnStyles: {
      0:  { cellWidth: 8,  halign: "center" },
      6:  { cellWidth: 12, halign: "center" },
      7:  { cellWidth: 22, halign: "center" },
      8:  { cellWidth: 22, halign: "center" },
    },
    didDrawCell: (data) => {
      // Color-code the Status column cells
      if (data.section === "body" && data.column.index === 7) {
        const raw = apps[data.row.index]?.status;
        const col = statusColors[raw];
        if (col) {
          doc.setFillColor(...col);
          doc.setTextColor(255, 255, 255);
          const { x, y, width: w, height: h } = data.cell;
          doc.roundedRect(x + 1, y + 1, w - 2, h - 2, 1.5, 1.5, "F");
          doc.setFontSize(6.5);
          doc.text(fStatus(raw), x + w / 2, y + h / 2 + 0.5, { align: "center" });
        }
      }
    },
    margin: { left: 14, right: 14 },
  });

  // --- Footer ---
  const pageCount = doc.internal.getNumberOfPages();
  for (let p = 1; p <= pageCount; p++) {
    doc.setPage(p);
    doc.setFontSize(7);
    doc.setTextColor(150, 150, 150);
    doc.text(
      "KCCA Internship Management System — Confidential",
      14,
      doc.internal.pageSize.height - 6
    );
    doc.text(
      `Page ${p} of ${pageCount}`,
      297 - 14,
      doc.internal.pageSize.height - 6,
      { align: "right" }
    );
  }

  const filename = `KCCA_Applications_${new Date().toISOString().slice(0, 10)}.pdf`;
  doc.save(filename);
  return filename;
}

// ---------------------------------------------------------------------------
// Export to Excel (XLSX)
// ---------------------------------------------------------------------------
export async function exportApplicationsToExcel(apps, filters = {}) {
  const XLSX = await import("xlsx");

  // Sheet 1: Applications data
  const headers = [
    "No.", "Application ID", "Applicant Name", "Email",
    "Internship Role", "Department", "University", "Course",
    "GPA", "Gender", "Status", "Assigned HR", "Submitted Date"
  ];

  const rows = apps.map((app, i) => ({
    "No.":             i + 1,
    "Application ID":  app.id,
    "Applicant Name":  app.applicantName || "",
    "Email":           app.applicantEmail || "",
    "Internship Role": app.internshipTitle || "",
    "Department":      app.department || "",
    "University":      app.university || "",
    "Course":          app.course || "",
    "GPA":             app.gpa || "",
    "Gender":          app.gender || "",
    "Status":          fStatus(app.status),
    "Assigned HR":     app.assignedHrName || "Unassigned",
    "Submitted Date":  fDate(app.submittedAt),
  }));

  // Sheet 2: Summary pivot
  const statuses   = ["submitted", "under_review", "shortlisted", "interview", "accepted", "rejected", "withdrawn"];
  const summaryRows = statuses.map((s) => ({
    Status:     fStatus(s),
    Count:      apps.filter((a) => a.status === s).length,
    Percentage: apps.length
      ? `${((apps.filter((a) => a.status === s).length / apps.length) * 100).toFixed(1)}%`
      : "0%",
  }));
  summaryRows.push({
    Status:     "TOTAL",
    Count:      apps.length,
    Percentage: "100%",
  });

  const wb = XLSX.utils.book_new();

  // Applications sheet
  const wsApps = XLSX.utils.json_to_sheet(rows, { header: headers });
  // Make headers bold by setting column widths
  wsApps["!cols"] = [
    { wch: 5 },  { wch: 15 }, { wch: 25 }, { wch: 30 },
    { wch: 30 }, { wch: 25 }, { wch: 25 }, { wch: 25 },
    { wch: 8 },  { wch: 10 }, { wch: 16 }, { wch: 20 }, { wch: 16 },
  ];
  XLSX.utils.book_append_sheet(wb, wsApps, "Applications");

  // Summary sheet
  const wsSummary = XLSX.utils.json_to_sheet(summaryRows);
  wsSummary["!cols"] = [{ wch: 20 }, { wch: 10 }, { wch: 14 }];
  XLSX.utils.book_append_sheet(wb, wsSummary, "Status Summary");

  const filename = `KCCA_Applications_${new Date().toISOString().slice(0, 10)}.xlsx`;
  XLSX.writeFile(wb, filename);
  return filename;
}
