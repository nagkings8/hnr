import React, { useRef, useState } from 'react';
import { BhuFile } from '../../types';
import { X, Printer, Download, CheckCircle2 } from 'lucide-react';
import { RDO_LOGO_BASE64 } from '../../utils/logoBase64';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface PrintSlipModalProps {
  isOpen: boolean;
  onClose: () => void;
  file: BhuFile | null;
  onShowToast: (msg: string) => void;
}

export const PrintSlipModal: React.FC<PrintSlipModalProps> = ({
  isOpen,
  onClose,
  file,
  onShowToast,
}) => {
  const slipRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  if (!isOpen || !file) return null;

  const handleDownloadPdf = async () => {
    if (!slipRef.current) return;
    setIsGenerating(true);

    try {
      const element = slipRef.current;
      const canvas = await html2canvas(element, {
        scale: 2.5,
        backgroundColor: '#ffffff',
        useCORS: true,
        logging: false,
        scrollX: 0,
        scrollY: 0,
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      const margin = 10;
      const printableWidth = pageWidth - margin * 2;
      const printableHeight = (canvas.height * printableWidth) / canvas.width;

      // Fit within one page if slightly over
      let finalWidth = printableWidth;
      let finalHeight = printableHeight;
      if (finalHeight > pageHeight - margin * 2) {
        const scale = (pageHeight - margin * 2) / finalHeight;
        finalHeight = pageHeight - margin * 2;
        finalWidth = finalWidth * scale;
      }

      const x = margin + (printableWidth - finalWidth) / 2;
      const y = margin;

      pdf.addImage(imgData, 'PNG', x, y, finalWidth, finalHeight);
      pdf.save(`RDO_File_Tracking_Slip_${file.appNumber}.pdf`);
      onShowToast(`Official Slip for Application #${file.appNumber} downloaded as PDF!`);
    } catch (err: any) {
      console.error('Slip PDF error:', err);
      onShowToast('Error creating PDF slip. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePrint = () => {
    // Generate clean print window with only the slip HTML
    try {
      if (!slipRef.current) return;
      const slipHtml = slipRef.current.outerHTML;
      const printWindow = window.open('', '_blank', 'width=800,height=900');
      if (printWindow) {
        printWindow.document.open();
        printWindow.document.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>Official Tracking Slip - ${file.appNumber}</title>
              <style>
                @page { size: A4 portrait; margin: 10mm; }
                body { margin: 0; padding: 0; background: #ffffff; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
                * { box-sizing: border-box; }
                table { width: 100%; border-collapse: collapse; }
                th, td { border: 1px solid #000000; }
              </style>
            </head>
            <body>
              ${slipHtml}
              <script>
                window.onload = function() {
                  window.focus();
                  window.print();
                  setTimeout(function() { window.close(); }, 500);
                };
              </script>
            </body>
          </html>
        `);
        printWindow.document.close();
      } else {
        window.print();
      }
    } catch (err) {
      console.warn('Print error:', err);
      handleDownloadPdf();
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center z-50 p-3 overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-xl shadow-2xl max-w-3xl w-full overflow-hidden my-6">
        {/* Controls Bar */}
        <div className="bg-[#061122] text-white px-5 py-3 flex justify-between items-center border-b-2 border-amber-500">
          <div className="flex items-center gap-2">
            <span className="bg-amber-500 text-slate-950 font-black text-[10px] px-2 py-0.5 rounded tracking-wider uppercase">
              BHU BHARATI
            </span>
            <h3 className="font-extrabold text-sm text-white">Official File Tracking Slip</h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadPdf}
              disabled={isGenerating}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3.5 py-1.5 rounded-lg text-xs flex items-center gap-1.5 transition cursor-pointer shadow-sm disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              <span>{isGenerating ? 'Generating PDF...' : 'Download PDF'}</span>
            </button>
            <button
              onClick={handlePrint}
              className="bg-slate-700 hover:bg-slate-600 text-white font-semibold px-3 py-1.5 rounded-lg text-xs flex items-center gap-1.5 transition cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5 text-slate-300" />
              <span>Print Slip</span>
            </button>
            <button onClick={onClose} className="text-slate-400 hover:text-white transition cursor-pointer ml-1">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Slip Area */}
        <div className="p-6 bg-white overflow-y-auto max-h-[75vh]">
          <div
            ref={slipRef}
            id="slipContent"
            className="border-2 border-black p-6 bg-white text-black font-sans space-y-4"
            style={{ color: '#000000', backgroundColor: '#ffffff' }}
          >
            {/* Header with Official RDO Huzurnagar Logo */}
            <div className="border-b-2 border-black pb-3">
              <div className="flex items-center justify-between gap-4">
                <img
                  src={RDO_LOGO_BASE64}
                  alt="RDO Office Huzurnagar Logo"
                  className="w-16 h-16 object-contain shrink-0"
                />
                <div className="text-center flex-1">
                  <h2 className="text-base sm:text-lg font-black uppercase tracking-wide">
                    GOVERNMENT OF TELANGANA
                  </h2>
                  <h3 className="text-xs sm:text-sm font-extrabold text-slate-900">
                    REVENUE DIVISIONAL OFFICE, HUZURNAGAR
                  </h3>
                  <p className="text-[10px] sm:text-[11px] font-black tracking-wider text-slate-800 mt-0.5 uppercase">
                    D SECTION – OFFICIAL FILE TRACKING ACKNOWLEDGEMENT SLIP
                  </p>
                </div>
                <div className="w-16 flex flex-col items-center justify-center shrink-0 border border-black rounded p-1 text-center bg-slate-50">
                  <span className="text-[9px] font-black uppercase tracking-wider text-slate-900">
                    OFFICIAL
                  </span>
                  <span className="text-[7.5px] font-bold text-slate-700 leading-tight">
                    SLIP
                  </span>
                </div>
              </div>
            </div>

            {/* Details Table */}
            <table className="w-full text-xs border-collapse border border-black">
              <tbody>
                <tr>
                  <td className="w-1/3 font-bold p-2 border border-black bg-slate-50">
                    Application Number:
                  </td>
                  <td className="font-black p-2 border border-black text-sm">{file.appNumber}</td>
                </tr>
                <tr>
                  <td className="font-bold p-2 border border-black bg-slate-50">Applicant Name:</td>
                  <td className="font-semibold p-2 border border-black">{file.applicantName}</td>
                </tr>
                <tr>
                  <td className="font-bold p-2 border border-black bg-slate-50">
                    Mandal / Revenue Village:
                  </td>
                  <td className="font-semibold p-2 border border-black">
                    {file.mandal} • {file.village}
                  </td>
                </tr>
                <tr>
                  <td className="font-bold p-2 border border-black bg-slate-50">Survey Number(s):</td>
                  <td className="font-semibold p-2 border border-black">{file.surveyNo}</td>
                </tr>
                <tr>
                  <td className="font-bold p-2 border border-black bg-slate-50">Module:</td>
                  <td className="font-bold p-2 border border-black">{file.module}</td>
                </tr>
                <tr>
                  <td className="font-bold p-2 border border-black bg-slate-50">
                    Received from MRO Date:
                  </td>
                  <td className="font-semibold p-2 border border-black">{file.receivedDate}</td>
                </tr>
                <tr>
                  <td className="font-bold p-2 border border-black bg-slate-50">Current Status:</td>
                  <td className="font-black p-2 border border-black">{file.status}</td>
                </tr>
                <tr>
                  <td className="font-bold p-2 border border-black bg-slate-50">Remarks:</td>
                  <td className="p-2 border border-black">{file.remarks || 'None'}</td>
                </tr>
              </tbody>
            </table>

            {/* Timeline */}
            <div>
              <h4 className="border-b border-black font-extrabold text-xs pb-1 mb-2 uppercase">
                File Movement &amp; Endorsement Timeline:
              </h4>
              <table className="w-full text-[11px] border-collapse border border-black">
                <thead>
                  <tr className="bg-slate-100 font-bold">
                    <th className="border border-black p-1.5 text-center">Date</th>
                    <th className="border border-black p-1.5 text-left">Action Taken</th>
                    <th className="border border-black p-1.5 text-center">From</th>
                    <th className="border border-black p-1.5 text-center">To</th>
                    <th className="border border-black p-1.5 text-left">Remarks</th>
                    <th className="border border-black p-1.5 text-center">Updated By</th>
                  </tr>
                </thead>
                <tbody>
                  {(file.history || []).map((h, i) => (
                    <tr key={i}>
                      <td className="border border-black p-1.5 text-center whitespace-nowrap">
                        {h.date}
                      </td>
                      <td className="border border-black p-1.5 font-semibold">{h.action}</td>
                      <td className="border border-black p-1.5 text-center">{h.from}</td>
                      <td className="border border-black p-1.5 text-center">{h.to}</td>
                      <td className="border border-black p-1.5">{h.remarks || '-'}</td>
                      <td className="border border-black p-1.5 text-center">{h.user || 'Staff'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Signatures */}
            <div className="pt-6 flex justify-between items-end text-xs font-bold">
              <div>Generated by: D Section, RDO Office Huzurnagar</div>
              <div className="text-right">
                <div className="border-t border-black pt-1">Signature &amp; Stamp of Competent Authority</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
