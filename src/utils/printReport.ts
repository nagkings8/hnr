/**
 * Utility for generating and printing official government formatted reports for RDO Huzurnagar
 */

export interface PrintReportPayload {
  title: string;
  subtitle?: string;
  period?: string;
  landscape?: boolean;
  tableHtml: string;
  fileName?: string;
}

export const generatePrintHtml = (payload: PrintReportPayload, autoPrint = false): string => {
  const {
    title,
    subtitle = 'Revenue Divisional Office, Huzurnagar • Suryapet District',
    period,
    landscape = false,
    tableHtml,
  } = payload;

  const currentDate = new Date().toLocaleDateString('en-IN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
  const currentTime = new Date().toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });

  const isCourtDoc =
    title.toLowerCase().includes('court') ||
    title.toLowerCase().includes('appeal') ||
    title.toLowerCase().includes('cause list') ||
    title.toLowerCase().includes('case') ||
    (subtitle && subtitle.toLowerCase().includes('court'));

  return `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>${title} - RDO Huzurnagar</title>
    <style>
      @page {
        size: ${landscape ? 'A4 landscape' : 'A4 portrait'};
        margin: ${landscape ? '6mm 7mm 8mm 7mm' : '8mm 10mm 10mm 10mm'};
      }
      * {
        box-sizing: border-box;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
      body {
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
        color: #000000;
        margin: 0;
        padding: ${landscape ? '4px 6px' : '8px 10px'};
        background: #ffffff;
        font-size: ${landscape ? '9pt' : '11pt'};
        line-height: ${landscape ? '1.32' : '1.45'};
      }
      .header-container {
        text-align: center;
        border-bottom: 2.5px solid #0f3b63;
        padding-bottom: ${landscape ? '4px' : '8px'};
        margin-bottom: ${landscape ? '8px' : '14px'};
      }
      .emblem-title {
        font-size: ${landscape ? '10.5pt' : '13pt'};
        font-weight: 900;
        color: #0f3b63;
        letter-spacing: 0.5px;
        text-transform: uppercase;
        margin-bottom: 2px;
      }
      .office-title {
        font-size: ${landscape ? '11.5pt' : '15pt'};
        font-weight: 900;
        color: #000000;
        margin-bottom: 3px;
      }
      .report-title {
        display: inline-block;
        background-color: #134674;
        color: #ffffff;
        font-size: ${landscape ? '9.5pt' : '12.5pt'};
        font-weight: 900;
        padding: ${landscape ? '3px 14px' : '5px 18px'};
        border-radius: 4px;
        margin-top: 3px;
        letter-spacing: 0.3px;
        text-transform: uppercase;
      }
      .meta-bar {
        display: flex;
        justify-content: space-between;
        font-size: ${landscape ? '8.5pt' : '10pt'};
        color: #1e293b;
        font-weight: 700;
        margin-top: 5px;
        padding: 0 4px;
        border-top: 1px solid #cbd5e1;
        padding-top: 4px;
      }
      .table-container {
        width: 100%;
        overflow: visible;
      }
      table {
        width: 100% !important;
        border-collapse: collapse !important;
        table-layout: fixed !important;
        font-size: ${landscape ? '9pt' : '10.5pt'} !important;
        margin-bottom: ${landscape ? '10px' : '16px'} !important;
        word-wrap: break-word !important;
        overflow-wrap: break-word !important;
      }
      th, td {
        border: 1.2px solid #334155 !important;
        padding: ${landscape ? '5px 4px' : '7px 9px'} !important;
        vertical-align: top !important;
        word-break: break-word !important;
        overflow-wrap: break-word !important;
        color: #000000 !important;
      }
      th {
        background-color: #0c2a47 !important;
        color: #ffffff !important;
        font-weight: 900 !important;
        font-size: ${landscape ? '9.5pt' : '11pt'} !important;
        text-align: center !important;
        letter-spacing: 0.2px;
      }
      table {
        page-break-inside: auto !important;
      }
      tbody {
        page-break-inside: auto !important;
      }
      tr {
        page-break-inside: avoid !important;
        break-inside: avoid !important;
        page-break-after: auto;
      }
      thead {
        display: table-header-group !important;
      }
      tfoot {
        display: table-footer-group !important;
      }
      tr:nth-child(even) td {
        background-color: #f8fafc;
      }
      .tahsildar-pending {
        background-color: #ffffc8 !important;
        font-weight: 900 !important;
        color: #000000 !important;
      }
      .rdo-pending {
        background-color: #ffedd5 !important;
        font-weight: 900 !important;
        color: #000000 !important;
      }
      .total-row td {
        background-color: #e2e8f0 !important;
        font-weight: 900 !important;
        color: #0f172a !important;
        border-top: 2px solid #334155;
        border-bottom: 2px solid #334155;
      }
      .total-tahsildar {
        background-color: #fef08a !important;
        font-weight: 900 !important;
      }
      .total-rdo {
        background-color: #fed7aa !important;
        font-weight: 900 !important;
      }
      .footer-sign {
        margin-top: 18px;
        display: flex;
        justify-content: space-between;
        page-break-inside: avoid !important;
        break-inside: avoid !important;
        font-size: ${landscape ? '8.5pt' : '9.5pt'};
        font-weight: 700;
        color: #000000;
        padding: 0 8px;
      }
      .sign-box {
        text-align: center;
      }
      .no-print {
        display: none !important;
      }
    </style>
  </head>
  <body>
    <div class="header-container">
      <div class="emblem-title">GOVERNMENT OF TELANGANA • REVENUE DEPARTMENT</div>
      <div class="office-title">${subtitle}</div>
      <div class="report-title">${title}</div>
      <div class="meta-bar">
        <span>District: Suryapet &nbsp;|&nbsp; Division: Huzurnagar</span>
        <span>${period ? `Period / As on: ${period} &nbsp;|&nbsp; ` : ''}Printed on: ${currentDate} ${currentTime}</span>
      </div>
    </div>

    <div class="table-container">
      ${tableHtml}
    </div>

    <div class="footer-sign">
      <div class="sign-box">
        <div style="color: #64748b; font-weight: normal;">${isCourtDoc ? 'Court Prepared by:' : 'Prepared by:'}</div>
        <div style="margin-top: 26px; font-weight: 800; color: #0f172a;">
          ${isCourtDoc ? 'Bench Clerk / Superintendent' : 'Senior Assistant / D Section'}
        </div>
        <div style="font-size: 7.5pt; color: #64748b; font-weight: normal;">
          ${isCourtDoc ? 'Appeal Cases Section • RDO Huzurnagar' : 'RDO Office, Huzurnagar'}
        </div>
      </div>
      <div class="sign-box">
        <div style="color: #64748b; font-weight: normal;">Verified by:</div>
        <div style="margin-top: 26px; font-weight: 800; color: #0f172a;">
          Divisional Administrative Officer (DAO)
        </div>
        <div style="font-size: 7.5pt; color: #64748b; font-weight: normal;">
          RDO Office, Huzurnagar
        </div>
      </div>
      <div class="sign-box">
        <div style="color: #64748b; font-weight: normal;">${isCourtDoc ? 'Bench Presiding Officer:' : 'Approved by:'}</div>
        <div style="margin-top: 26px; font-weight: 800; color: #0f172a;">
          ${isCourtDoc ? 'Revenue Divisional Officer & SDM' : 'Revenue Divisional Officer (RDO)'}
        </div>
        <div style="font-size: 7.5pt; color: #64748b; font-weight: normal;">
          Huzurnagar Division
        </div>
      </div>
    </div>
    ${
      autoPrint
        ? `<script>
            window.addEventListener('load', function() {
              setTimeout(function() {
                window.focus();
                window.print();
              }, 250);
            });
          </script>`
        : ''
    }
  </body>
</html>`;
};

export const printTableReport = (
  tableHtml: string,
  options: {
    title: string;
    subtitle?: string;
    period?: string;
    landscape?: boolean;
    fileName?: string;
  }
) => {
  const payload: PrintReportPayload = {
    title: options.title,
    subtitle: options.subtitle,
    period: options.period,
    landscape: options.landscape,
    tableHtml,
    fileName: options.fileName,
  };

  // Dispatch custom event to open the in-app interactive Print Preview Modal
  window.dispatchEvent(
    new CustomEvent('app-open-print-preview', {
      detail: payload,
    })
  );
};
