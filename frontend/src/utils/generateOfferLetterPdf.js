export const generateOfferLetterPdf = (app, user) => {
  const applicantName   = app.applicantName || user?.name || "Applicant";
  const internshipTitle = app.internshipTitle || "Internship Program";
  const department      = app.department || "Directorate of Administration";
  const university      = app.university || user?.university || "Makerere University";
  const course          = app.course || user?.course || "Undergraduate Degree Program";
  const refNo           = `KCCA/HR/INT/${new Date().getFullYear()}/${app.id || 'OFFER'}`;
  const todayDate       = new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>KCCA Internship Placement Offer Letter - ${applicantName}</title>
      <style>
        @page {
          size: A4;
          margin: 20mm;
        }
        body {
          font-family: 'Times New Roman', Times, serif;
          color: #111827;
          line-height: 1.6;
          margin: 0;
          padding: 30px;
          background: #fff;
        }
        .header-table {
          width: 100%;
          border-collapse: collapse;
          border-bottom: 3px double #0f766e;
          padding-bottom: 15px;
          margin-bottom: 20px;
        }
        .logo-title {
          text-align: center;
        }
        .kcca-title {
          font-size: 22px;
          font-weight: bold;
          color: #065f46;
          text-transform: uppercase;
          letter-spacing: 1px;
          margin: 0;
        }
        .sub-title {
          font-size: 13px;
          font-weight: bold;
          color: #1f2937;
          margin: 2px 0 0 0;
          text-transform: uppercase;
        }
        .address-line {
          font-size: 11px;
          color: #4b5563;
          margin: 2px 0 0 0;
        }
        .ref-date-row {
          display: flex;
          justify-content: space-between;
          font-size: 13px;
          font-weight: bold;
          margin-bottom: 25px;
          color: #374151;
        }
        .recipient-block {
          margin-bottom: 25px;
          font-size: 14px;
        }
        .recipient-name {
          font-weight: bold;
          text-transform: uppercase;
        }
        .subject-bar {
          background-color: #f0fdf4;
          border-left: 4px solid #16a34a;
          padding: 10px 15px;
          font-size: 14px;
          font-weight: bold;
          color: #065f46;
          text-transform: uppercase;
          margin-bottom: 20px;
        }
        .body-text {
          font-size: 13.5px;
          text-align: justify;
          margin-bottom: 15px;
        }
        .details-box {
          width: 100%;
          border-collapse: collapse;
          margin: 20px 0;
          font-size: 13px;
        }
        .details-box td {
          padding: 8px 12px;
          border: 1px solid #d1d5db;
        }
        .details-box tr:nth-child(even) {
          background-color: #f9fafb;
        }
        .details-label {
          font-weight: bold;
          width: 35%;
          color: #1f2937;
        }
        .requirements-list {
          font-size: 13px;
          margin-bottom: 25px;
          padding-left: 20px;
        }
        .signature-block {
          margin-top: 40px;
          font-size: 13px;
        }
        .stamp-box {
          display: inline-block;
          border: 2px dashed #16a34a;
          color: #15803d;
          font-weight: bold;
          padding: 8px 20px;
          border-radius: 8px;
          text-transform: uppercase;
          font-size: 11px;
          letter-spacing: 1px;
          margin-top: 15px;
        }
        .footer-note {
          margin-top: 40px;
          border-top: 1px solid #e5e7eb;
          padding-top: 10px;
          font-size: 10px;
          color: #6b7280;
          text-align: center;
        }
        @media print {
          body { padding: 0; }
          .no-print { display: none !important; }
        }
      </style>
    </head>
    <body>
      <div class="no-print" style="background:#0f766e; color:#fff; padding:12px; text-align:center; font-family:sans-serif; margin-bottom:20px; border-radius:8px;">
        <button onclick="window.print()" style="background:#fbbf24; color:#000; border:none; padding:8px 20px; font-weight:bold; font-size:14px; border-radius:6px; cursor:pointer; margin-right:10px;">
          🖨️ Print / Save as PDF
        </button>
        <span style="font-size:13px;">Click the button above or press Ctrl+P to save this official placement offer letter as a PDF document.</span>
      </div>

      <table class="header-table">
        <tr>
          <td class="logo-title">
            <h1 class="kcca-title">Kampala Capital City Authority</h1>
            <p class="sub-title">Directorate of Administration & Human Resource Management</p>
            <p class="address-line">City Hall, P.O. Box 7010, Kampala, Uganda | Phone: +256 (0) 414 581 294 | Email: info@kcca.go.ug</p>
          </td>
        </tr>
      </table>

      <div class="ref-date-row">
        <div>REF: ${refNo}</div>
        <div>DATE: ${todayDate}</div>
      </div>

      <div class="recipient-block">
        <div class="recipient-name">${applicantName}</div>
        <div>${course}</div>
        <div>${university}</div>
        <div>Kampala, Uganda</div>
      </div>

      <div class="subject-bar">
        RE: OFFICIAL OFFER OF INTERNSHIP PLACEMENT — ${internshipTitle.toUpperCase()}
      </div>

      <div class="body-text">
        Dear <strong>${applicantName}</strong>,
      </div>

      <div class="body-text">
        Following your application and successful evaluation for the <strong>${internshipTitle}</strong> opportunity at Kampala Capital City Authority (KCCA), we are pleased to inform you that you have been <strong>SELECTED</strong> for an internship placement under the <strong>${department}</strong> Directorate.
      </div>

      <div class="body-text">
        The key details regarding your internship placement are outlined below:
      </div>

      <table class="details-box">
        <tr>
          <td class="details-label">Candidate Name:</td>
          <td><strong>${applicantName}</strong></td>
        </tr>
        <tr>
          <td class="details-label">Institution / University:</td>
          <td>${university}</td>
        </tr>
        <tr>
          <td class="details-label">Internship Title:</td>
          <td><strong>${internshipTitle}</strong></td>
        </tr>
        <tr>
          <td class="details-label">Assigned Directorate:</td>
          <td><strong>${department}</strong></td>
        </tr>
        <tr>
          <td class="details-label">Reporting Location:</td>
          <td>KCCA City Hall, Kampala (Directorate Offices)</td>
        </tr>
        <tr>
          <td class="details-label">Placement Status:</td>
          <td><strong style="color:#15803d;">CONFIRMED &amp; APPROVED</strong></td>
        </tr>
      </table>

      <div class="body-text">
        <strong>Reporting Requirements:</strong><br>
        On your first day of reporting, you are required to present the following documents to the Human Resource Management Office (3rd Floor, Room 314, City Hall):
      </div>

      <ol class="requirements-list">
        <li>Original National Identity Card (NIN) or Valid Student Identification Card.</li>
        <li>Original Letter of Recommendation from <strong>${university}</strong>.</li>
        <li>Two (2) recent passport-size photographs.</li>
        <li>Copy of your academic transcripts or testimonial.</li>
      </ol>

      <div class="body-text">
        Please note that this internship program is governed by the KCCA Standing Orders and Internship Policy guidelines. You will be assigned a designated Departmental Mentor/Supervisor upon reporting.
      </div>

      <div class="body-text">
        We congratulate you on your selection and look forward to your valuable contribution toward building a vibrant, attractive, and sustainable capital city.
      </div>

      <div class="signature-block">
        <div>Yours Faithfully,</div>
        <br><br>
        <div style="font-weight:bold; font-size:14px;">DIRECTOR HUMAN RESOURCE &amp; ADMINISTRATION</div>
        <div style="font-size:12px; color:#4b5563;">Kampala Capital City Authority (KCCA)</div>

        <div class="stamp-box">
          ✓ OFFICIALLY VERIFIED &amp; ISSUED BY KCCA HR
        </div>
      </div>

      <div class="footer-note">
        This is an official computer-generated document issued by the KCCA Internship Portal (${refNo}). For verification queries, email hr@kcca.go.ug.
      </div>

      <script>
        window.onload = function() {
          setTimeout(function() {
            window.print();
          }, 600);
        };
      </script>
    </body>
    </html>
  `;

  const printWindow = window.open("", "_blank");
  if (printWindow) {
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  }
};
