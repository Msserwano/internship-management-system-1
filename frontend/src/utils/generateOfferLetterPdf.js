export const generateOfferLetterPdf = (app = {}, user = {}) => {
  const applicantName   = app.applicantName || user?.name || "Sserwano Moris";
  const genderPrefix    = (user?.gender || "").toLowerCase() === "female" ? "Ms." : "Mr.";
  const fullNameWithSalutation = applicantName.startsWith("Mr.") || applicantName.startsWith("Ms.") || applicantName.startsWith("Mrs.") || applicantName.startsWith("Dr.")
    ? applicantName
    : `${genderPrefix} ${applicantName}`;

  const university      = app.university || user?.university || "Azerbaijan State Oil and Industry University";
  const phone           = app.phone || user?.phone || "0756481468";
  const department      = app.department || "Information and Communication Technology";
  const refNo           = `DAHR/KCCA/201/${app.id ? String(app.id).replace(/\D/g, "").slice(-2) || "08" : "08"}`;

  const getOrdinalDate = (dateObj) => {
    const day = dateObj.getDate();
    const month = dateObj.toLocaleString("en-US", { month: "long" });
    const year = dateObj.getFullYear();
    let suffix = "th";
    if (day % 10 === 1 && day !== 11) suffix = "st";
    else if (day % 10 === 2 && day !== 12) suffix = "nd";
    else if (day % 10 === 3 && day !== 13) suffix = "rd";
    return `${day}<sup>${suffix}</sup> ${month}, ${year}`;
  };

  const today = new Date();
  const letterDateStr = getOrdinalDate(today);

  // Reference letter date (approx 12 days prior)
  const refDateObj = new Date(today);
  refDateObj.setDate(refDateObj.getDate() - 12);
  const refDateStr = getOrdinalDate(refDateObj);

  // Start date (approx 30 days after)
  const startDateObj = new Date(today);
  startDateObj.setDate(startDateObj.getDate() + 30);
  const startDateStr = getOrdinalDate(startDateObj);

  // End date (approx 80 days after)
  const endDateObj = new Date(today);
  endDateObj.setDate(endDateObj.getDate() + 80);
  const endDateStr = getOrdinalDate(endDateObj);

  // Orientation date (approx 1 day after letter)
  const orientDateObj = new Date(today);
  orientDateObj.setDate(orientDateObj.getDate() + 1);
  const orientDateStr = getOrdinalDate(orientDateObj);

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>KCCA Internship Placement Letter - ${applicantName}</title>
      <style>
        @page {
          size: A4 portrait;
          margin: 0;
        }
        * {
          box-sizing: border-box;
        }
        body {
          font-family: Arial, Helvetica, sans-serif;
          color: #111111;
          margin: 0;
          padding: 0;
          background: #ffffff;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }
        .page {
          width: 210mm;
          min-height: 297mm;
          padding: 20mm 20mm 35mm 22mm;
          position: relative;
          background: #ffffff;
          overflow: hidden;
        }

        /* Background Watermark */
        .watermark {
          position: absolute;
          top: 48%;
          left: 50%;
          transform: translate(-50%, -50%);
          font-size: 140px;
          font-weight: 900;
          color: rgba(0, 0, 0, 0.035);
          letter-spacing: 12px;
          pointer-events: none;
          user-select: none;
          z-index: 1;
          font-family: Arial, sans-serif;
        }

        /* Top Header Grid */
        .top-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 25px;
          position: relative;
          z-index: 2;
        }
        .logo-block {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
        }
        .kcca-logo-svg {
          width: 140px;
          height: auto;
        }

        .header-title-block {
          text-align: right;
          max-width: 320px;
          padding-top: 5px;
        }
        .dept-title {
          font-size: 14px;
          font-weight: 800;
          color: #1e293b;
          text-transform: uppercase;
          line-height: 1.35;
          letter-spacing: 0.5px;
        }

        /* Ref & Date */
        .ref-block {
          font-size: 13.5px;
          font-weight: bold;
          color: #0f172a;
          margin-bottom: 6px;
          position: relative;
          z-index: 2;
        }
        .date-block {
          font-size: 13.5px;
          color: #0f172a;
          margin-bottom: 20px;
          position: relative;
          z-index: 2;
        }

        /* Recipient Block */
        .recipient-info {
          font-size: 13.5px;
          line-height: 1.45;
          color: #0f172a;
          margin-bottom: 22px;
          position: relative;
          z-index: 2;
        }
        .recipient-info .name {
          font-weight: bold;
        }
        .recipient-info .city {
          font-weight: bold;
          text-transform: uppercase;
          margin-top: 2px;
        }

        /* Subject Line */
        .subject-line {
          font-size: 13.5px;
          font-weight: 800;
          text-transform: uppercase;
          color: #0f172a;
          margin-bottom: 18px;
          letter-spacing: 0.2px;
          position: relative;
          z-index: 2;
        }

        /* Letter Body Paragraphs */
        .letter-body {
          font-size: 13px;
          line-height: 1.6;
          color: #1e293b;
          text-align: justify;
          position: relative;
          z-index: 2;
        }
        .letter-body p {
          margin: 0 0 16px 0;
        }

        /* Signature Section */
        .signature-section {
          margin-top: 28px;
          position: relative;
          z-index: 2;
        }
        .signature-img {
          width: 150px;
          height: auto;
          margin-bottom: -10px;
          display: block;
        }
        .signatory-name {
          font-size: 13.5px;
          font-weight: bold;
          color: #0f172a;
          margin-top: 4px;
        }
        .signatory-title {
          font-size: 12.5px;
          font-weight: 800;
          color: #0f172a;
          text-transform: uppercase;
          letter-spacing: 0.3px;
        }

        /* Copy List (CC) */
        .cc-block {
          margin-top: 22px;
          font-size: 12.5px;
          color: #0f172a;
          position: relative;
          z-index: 2;
          line-height: 1.5;
        }
        .cc-block strong {
          font-weight: bold;
        }
        .cc-list {
          padding-left: 45px;
          margin-top: -18px;
        }

        /* Bottom Right Dark Angle Footer Graphic */
        .footer-banner {
          position: absolute;
          bottom: 0;
          right: 0;
          width: 75%;
          height: 110px;
          background: linear-gradient(135deg, #334155 0%, #0f172a 100%);
          clip-path: polygon(18% 0, 100% 0, 100% 100%, 0% 100%);
          color: #ffffff;
          padding: 25px 25px 12px 60px;
          text-align: right;
          font-size: 10.5px;
          line-height: 1.45;
          z-index: 10;
        }
        .footer-banner p {
          margin: 1px 0;
          color: #f1f5f9;
        }
        .footer-banner .web {
          font-weight: bold;
          color: #ffffff;
        }

        /* No Print Toolbar */
        .no-print-bar {
          background: #0f172a;
          color: #ffffff;
          padding: 14px 20px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-family: system-ui, sans-serif;
          position: sticky;
          top: 0;
          z-index: 100;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }
        .print-btn {
          background: #fbbf24;
          color: #0f172a;
          border: none;
          padding: 9px 22px;
          font-size: 14px;
          font-weight: bold;
          border-radius: 8px;
          cursor: pointer;
          transition: background 0.2s;
          display: inline-flex;
          align-items: center;
          gap: 8px;
        }
        .print-btn:hover {
          background: #f59e0b;
        }

        @media print {
          .no-print-bar {
            display: none !important;
          }
          .page {
            padding: 15mm 18mm 30mm 18mm;
            width: 100%;
            min-height: auto;
          }
          .footer-banner {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        }
      </style>
    </head>
    <body>
      <div class="no-print-bar">
        <div>
          <strong style="font-size:15px;">Official KCCA Placement Letter Format</strong>
          <span style="font-size:12px; color:#cbd5e1; margin-left:10px;">Ready for Print / PDF Export</span>
        </div>
        <button class="print-btn" onclick="window.print()">
          🖨️ Save as PDF / Print
        </button>
      </div>

      <div class="page">
        <!-- Watermark -->
        <div class="watermark">KCCA</div>

        <!-- Top Header -->
        <div class="top-header">
          <div class="logo-block">
            <!-- KCCA Official Logo SVG -->
            <svg class="kcca-logo-svg" viewBox="0 0 280 120" xmlns="http://www.w3.org/2000/svg">
              <!-- Clock Tower Graphic -->
              <g transform="translate(70, 0)">
                <rect x="42" y="5" width="26" height="42" fill="#1e293b" rx="2" />
                <polygon points="55,0 38,10 72,10" fill="#0f172a" />
                <circle cx="55" cy="22" r="7" fill="#ffffff" stroke="#0f172a" stroke-width="2" />
                <line x1="55" y1="22" x2="55" y2="18" stroke="#0f172a" stroke-width="1.5" stroke-linecap="round" />
                <line x1="55" y1="22" x2="58" y2="22" stroke="#0f172a" stroke-width="1.5" stroke-linecap="round" />
                <!-- Base arches -->
                <rect x="36" y="47" width="38" height="6" fill="#334155" />
                <path d="M 30,53 L 80,53 L 74,62 L 36,62 Z" fill="#1e293b" />
              </g>
              <!-- KCCA Text -->
              <text x="5" y="86" font-family="Arial, Helvetica, sans-serif" font-size="44" font-weight="900" fill="#0f172a" letter-spacing="-1">KCCA</text>
              <text x="6" y="98" font-family="Arial, Helvetica, sans-serif" font-size="7.5" font-weight="bold" fill="#334155" letter-spacing="0.5">KAMPALA CAPITAL CITY AUTHORITY</text>
              <text x="32" y="110" font-family="'Georgia', serif" font-size="9" font-style="italic" fill="#475569">For a better City</text>
            </svg>
          </div>

          <div class="header-title-block">
            <div class="dept-title">
              DIRECTORATE OF ADMINISTRATION<br>AND HUMAN RESOURCE
            </div>
          </div>
        </div>

        <!-- Ref & Date -->
        <div class="ref-block">REF: ${refNo}</div>
        <div class="date-block">${letterDateStr}</div>

        <!-- Recipient Info -->
        <div class="recipient-info">
          <div class="name">${fullNameWithSalutation}</div>
          <div>${university}</div>
          <div>Tel: ${phone}</div>
          <div class="city">KAMPALA</div>
        </div>

        <!-- Subject -->
        <div class="subject-line">
          RE: APPLICATION FOR INTERNSHIP PLACEMENT
        </div>

        <!-- Letter Body -->
        <div class="letter-body">
          <p>
            Reference is made to your letter date ${refDateStr} on the above subject.
          </p>

          <p>
            This is to inform you that your request has been granted. You will be training, and supervised in the Directorate of <strong>${department}</strong> from ${startDateStr} to ${endDateStr}. You are therefore expected to adhere to the timeline.
          </p>

          <p>
            You are expected to attend orientation, which will be conducted on ${orientDateStr} at 9:00am in the mayor's parlor, City Hall. In addition, you will be required to take an Oath of Secrecy with the Directorate of Administration and Human Resource in and thereafter be deployed to your respective Directorate.
          </p>

          <p>
            By copy of this letter, the assigned Supervisor is expected to assess and provide a report on your performance and behavior at the end of the training period.
          </p>

          <p>
            I wish you a satisfactory experience during your two months Internship training with Kampala Capital City Authority.
          </p>
        </div>

        <!-- Signature Section -->
        <div class="signature-section">
          <!-- Stylized Blue Ink Signature SVG matching original photo -->
          <svg class="signature-img" viewBox="0 0 200 65" xmlns="http://www.w3.org/2000/svg">
            <path d="M 15,45 C 35,10 50,5 65,35 C 75,55 90,15 110,30 C 120,40 100,50 85,55 C 70,60 60,40 75,20 C 85,10 120,5 140,25 C 150,35 130,50 115,52 C 90,55 80,30 95,15 C 110,5 145,15 165,35 C 175,45 155,55 140,50" fill="none" stroke="#1d4ed8" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" />
            <path d="M 45,20 L 45,55 M 35,38 L 85,38" fill="none" stroke="#1d4ed8" stroke-width="1.8" stroke-linecap="round" />
          </svg>

          <div class="signatory-name">Grace Akullo (Mrs.)</div>
          <div class="signatory-title">DIRECTOR ADMINISTRATION AND HUMAN RESOURCE</div>
        </div>

        <!-- Copy List (CC) -->
        <div class="cc-block">
          <strong>Copy:</strong>
          <div class="cc-list">
            <div>Deputy Director ${department}</div>
            <div>File Copy</div>
          </div>
        </div>

        <!-- Bottom Right Dark Angle Footer -->
        <div class="footer-banner">
          <p><strong>P. O. Box 7010 Kampala- Uganda</strong></p>
          <p>Plot 1-3 Apollo Kaggwa Road</p>
          <p>Tel: 0414 231 446 / 0204 660 000</p>
          <p class="web">Web: www.kcca.go.ug, Email: info@kcca.go.ug</p>
        </div>
      </div>

      <script>
        window.onload = function() {
          setTimeout(function() {
            window.print();
          }, 500);
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
