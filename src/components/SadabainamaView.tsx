import React, { useState, useRef, useMemo } from 'react';
import { 
  Upload, 
  Trash2, 
  Search, 
  FileSpreadsheet, 
  Download, 
  RotateCcw, 
  X,
  CheckCircle2,
  AlertCircle,
  Printer
} from 'lucide-react';
import { safeSaveLocalStorage } from '../utils/storage';
import { DEFAULT_SADABAINAMA_ABSTRACT, DEFAULT_SADABAINAMA_REPORT } from '../data/sadabainamaData';
import { printTableReport } from '../utils/printReport';

interface SadabainamaViewProps {
  abstractData: any[][] | null;
  reportData: any[][] | null;
  onUpdateAbstract: (data: any[][] | null) => void;
  onUpdateReport: (data: any[][] | null) => void;
  onShowToast: (msg: string) => void;
}

export const SadabainamaView: React.FC<SadabainamaViewProps> = ({
  abstractData,
  reportData,
  onUpdateAbstract,
  onUpdateReport,
  onShowToast,
}) => {
  const [abstractSearch, setAbstractSearch] = useState('');
  const [reportSearch, setReportSearch] = useState('');

  // Default to the official report data if none uploaded
  const currentAbstract = abstractData || DEFAULT_SADABAINAMA_ABSTRACT;
  const currentReport = reportData || DEFAULT_SADABAINAMA_REPORT;

  const abstractFileInputRef = useRef<HTMLInputElement>(null);
  const reportFileInputRef = useRef<HTMLInputElement>(null);

  const handleExcelUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'abstract' | 'report') => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!window.XLSX) {
      onShowToast('SheetJS library is still initializing. Please wait a moment.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const buffer = evt.target?.result;
        if (!buffer) return;
        const data = new Uint8Array(buffer as ArrayBuffer);
        const workbook = window.XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const rawRows: any[][] = window.XLSX.utils.sheet_to_json(worksheet, {
          header: 1,
          defval: '',
        });

        if (!rawRows || rawRows.length === 0) {
          onShowToast('Uploaded Excel file is empty.');
          return;
        }

        if (type === 'abstract') {
          onUpdateAbstract(rawRows);
          safeSaveLocalStorage('rdo_sadabainama_abstract', rawRows);
          onShowToast('Sadabainama Abstract uploaded successfully verbatim!');
        } else {
          onUpdateReport(rawRows);
          safeSaveLocalStorage('rdo_sadabainama_report', rawRows);
          onShowToast('Sadabainama Detailed Report uploaded successfully verbatim!');
        }
      } catch (err) {
        console.error('Excel parse error:', err);
        onShowToast('Error parsing Excel file. Please ensure it is a valid format.');
      }
    };
    reader.readAsArrayBuffer(file);
    e.target.value = '';
  };

  const handleClear = (type: 'abstract' | 'report') => {
    if (type === 'abstract') {
      onUpdateAbstract(null);
      localStorage.removeItem('rdo_sadabainama_abstract');
      setAbstractSearch('');
      onShowToast('Sadabainama Abstract cleared. Reset to official report.');
    } else {
      onUpdateReport(null);
      localStorage.removeItem('rdo_sadabainama_report');
      setReportSearch('');
      onShowToast('Sadabainama Report cleared.');
    }
  };

  const handleResetAbstract = () => {
    onUpdateAbstract(DEFAULT_SADABAINAMA_ABSTRACT);
    safeSaveLocalStorage('rdo_sadabainama_abstract', DEFAULT_SADABAINAMA_ABSTRACT);
    setAbstractSearch('');
    onShowToast('Reset to official Huzurnagar Sadabainama Abstract report!');
  };

  const handleResetReport = () => {
    onUpdateReport(DEFAULT_SADABAINAMA_REPORT);
    safeSaveLocalStorage('rdo_sadabainama_report', DEFAULT_SADABAINAMA_REPORT);
    setReportSearch('');
    onShowToast('Reset to official Huzurnagar Sadabainama Detailed Report!');
  };

  // Export to CSV
  const handleExportCSV = (rows: any[][], fileName: string) => {
    if (!rows || rows.length === 0) return;
    const csvContent = rows
      .map((row) =>
        row
          .map((cell) => {
            const str = String(cell !== undefined && cell !== null ? cell : '');
            if (str.includes(',') || str.includes('"') || str.includes('\n')) {
              return `"${str.replace(/"/g, '""')}"`;
            }
            return str;
          })
          .join(',')
      )
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${fileName}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    onShowToast(`${fileName}.csv downloaded.`);
  };

  // Categorize columns in Abstract table for exact color matching
  const getColType = (colName: any, idx: number): 'tahsildarPending' | 'rdoPending' | 'mandal' | 'sno' | 'normal' => {
    const name = String(colName || '').toLowerCase().trim();
    if (name.includes('s. no') || name.includes('s.no') || (idx === 0 && name.includes('no'))) {
      return 'sno';
    }
    if (name.includes('mandal')) {
      return 'mandal';
    }
    // Column 5 in image: Total Applications Pending At Tahsildar
    if (
      (name.includes('pending') && name.includes('tahsildar') && (name.includes('application') || !name.includes('survey'))) ||
      idx === 5
    ) {
      return 'tahsildarPending';
    }
    // Column 6 in image: Total Applications Pending At RDO
    if (
      (name.includes('pending') && name.includes('rdo') && (name.includes('application') || !name.includes('survey'))) ||
      idx === 6
    ) {
      return 'rdoPending';
    }
    return 'normal';
  };

  // Parse Abstract rows into header, data rows, total row, and reportTitle
  const parsedAbstract = useMemo(() => {
    if (!currentAbstract || currentAbstract.length === 0) {
      return { 
        header: [], 
        dataRows: [], 
        totalRow: null, 
        reportTitle: 'Sadabainama Abstract Report as on 05-09-2026 17.56.04' 
      };
    }

    let reportTitle = 'Sadabainama Abstract Report as on 05-09-2026 17.56.04';
    let headerRowIdx = 0;

    const row0 = currentAbstract[0] || [];
    const row1 = currentAbstract[1] || [];

    // Check if row 0 is actually the Title row (e.g. from uploaded Excel)
    const row0FirstCell = String(row0[0] || '').trim();
    const row0NonEmptyCount = row0.filter((c) => String(c || '').trim() !== '').length;

    const isRow0Title =
      row0FirstCell.toLowerCase().includes('sadabainama') ||
      row0FirstCell.toLowerCase().includes('abstract') ||
      (row0NonEmptyCount <= 2 && row1 && row1.length > 2 && (
        String(row1[0] || '').toLowerCase().includes('s. no') ||
        String(row1[0] || '').toLowerCase().includes('s.no') ||
        String(row1[1] || '').toLowerCase().includes('mandal') ||
        String(row1[2] || '').toLowerCase().includes('application')
      ));

    if (isRow0Title) {
      reportTitle = row0FirstCell || reportTitle;
      headerRowIdx = 1;
    }

    const header = currentAbstract[headerRowIdx] || [];
    const rest = currentAbstract.slice(headerRowIdx + 1);

    // Look for row where any column equals "TOTAL"
    let totalRow: any[] | null = null;
    const dataRows: any[][] = [];

    for (const row of rest) {
      const isTotal = row.some((c) => String(c || '').trim().toUpperCase() === 'TOTAL');
      if (isTotal) {
        totalRow = row;
      } else if (row.some((c) => String(c || '').trim() !== '')) {
        dataRows.push(row);
      }
    }

    return { header, dataRows, totalRow, reportTitle };
  }, [currentAbstract]);

  // Filtered data rows based on search
  const filteredAbstractDataRows = useMemo(() => {
    if (!abstractSearch.trim()) return parsedAbstract.dataRows;
    const q = abstractSearch.toLowerCase().trim();
    return parsedAbstract.dataRows.filter((row) =>
      row.some((cell) => String(cell || '').toLowerCase().includes(q))
    );
  }, [parsedAbstract.dataRows, abstractSearch]);

  // Recalculate dynamic totals if filtered, or use official total row
  const displayTotalRow = useMemo(() => {
    if (!parsedAbstract.header.length) return null;
    
    // If not searching and we have an official total row, use it directly
    if (!abstractSearch.trim() && parsedAbstract.totalRow) {
      return parsedAbstract.totalRow;
    }

    // If searching, calculate the sum for numeric columns of the filtered rows
    const colsCount = parsedAbstract.header.length;
    const sumRow: any[] = new Array(colsCount).fill('');
    
    sumRow[0] = '';
    // Find mandal column index
    const mandalIdx = parsedAbstract.header.findIndex((h) => String(h).toLowerCase().includes('mandal'));
    sumRow[mandalIdx >= 0 ? mandalIdx : 1] = abstractSearch.trim() 
      ? `TOTAL (${filteredAbstractDataRows.length} MANDALS)` 
      : 'TOTAL';

    for (let c = 0; c < colsCount; c++) {
      if (c === 0 || c === mandalIdx) continue;
      let colSum = 0;
      let hasNumbers = false;
      for (const row of filteredAbstractDataRows) {
        const val = String(row[c] || '').replace(/,/g, '').trim();
        const num = parseFloat(val);
        if (!isNaN(num)) {
          colSum += num;
          hasNumbers = true;
        }
      }
      if (hasNumbers) {
        sumRow[c] = colSum.toLocaleString('en-IN');
      } else {
        sumRow[c] = '';
      }
    }

    return sumRow;
  }, [parsedAbstract.header, parsedAbstract.totalRow, filteredAbstractDataRows, abstractSearch]);

  // Parse Detailed Report rows into reportTitle, header row, and data rows
  const parsedDetailedReport = useMemo(() => {
    if (!currentReport || currentReport.length === 0) {
      return {
        reportTitle: 'Sadabainama Detailed Report as on 05-09-2026 17.56.04',
        header: [] as any[],
        dataRows: [] as any[][],
      };
    }

    let reportTitle = 'Sadabainama Detailed Report as on 05-09-2026 17.56.04';
    let headerRowIdx = 0;

    const row0 = currentReport[0] || [];
    const row1 = currentReport[1] || [];

    const row0FirstCell = String(row0[0] || '').trim();
    const row0NonEmptyCount = row0.filter((c) => String(c || '').trim() !== '').length;

    // Check if row 0 is actually the Title row (e.g. from uploaded Excel or default format)
    const isRow0Title =
      row0FirstCell.toLowerCase().includes('sadabainama') ||
      row0FirstCell.toLowerCase().includes('detailed') ||
      row0FirstCell.toLowerCase().includes('report as on') ||
      (row0NonEmptyCount <= 2 && row1 && row1.length > 2 && (
        String(row1[0] || '').toLowerCase().includes('s. no') ||
        String(row1[0] || '').toLowerCase().includes('s.no') ||
        String(row1[1] || '').toLowerCase().includes('mandal') ||
        String(row1[2] || '').toLowerCase().includes('village') ||
        String(row1[3] || '').toLowerCase().includes('application')
      ));

    if (isRow0Title) {
      reportTitle = row0FirstCell || reportTitle;
      headerRowIdx = 1;
    }

    const header = currentReport[headerRowIdx] || [];
    const rawData = currentReport.slice(headerRowIdx + 1);
    const dataRows = rawData.filter((row) => row.some((c) => String(c || '').trim() !== ''));

    return {
      reportTitle,
      header,
      dataRows,
    };
  }, [currentReport]);

  // Filtered detailed report rows based on search
  const filteredDetailedDataRows = useMemo(() => {
    if (!reportSearch.trim()) return parsedDetailedReport.dataRows;
    const q = reportSearch.toLowerCase().trim();
    return parsedDetailedReport.dataRows.filter((row) =>
      row.some((cell) => String(cell || '').toLowerCase().includes(q))
    );
  }, [parsedDetailedReport.dataRows, reportSearch]);

  const handlePrintAbstract = () => {
    const ths = parsedAbstract.header.map((colName: any, idx: number) => {
      const colType = getColType(colName, idx);
      const bg = colType === 'tahsildarPending' 
        ? '#134674; color: #ffff00' 
        : colType === 'rdoPending' 
        ? '#134674; color: #fed7aa' 
        : '#164875; color: #ffffff';
      return `<th style="background: ${bg}; font-size: 10px; padding: 6px; border: 1px solid #94a3b8;">${colName}</th>`;
    }).join('');

    const trs = filteredAbstractDataRows.map((row: any[]) => {
      const tds = parsedAbstract.header.map((colName: any, cIdx: number) => {
        const colType = getColType(colName, cIdx);
        const isTahsildarPending = colType === 'tahsildarPending';
        const isRdoPending = colType === 'rdoPending';
        const isMandal = colType === 'mandal';
        const isSno = colType === 'sno';
        const val = row[cIdx] !== undefined && row[cIdx] !== null ? row[cIdx] : '';
        const style = isTahsildarPending 
          ? 'background-color: #ffffc8 !important; font-weight: 900; text-align: center;' 
          : isRdoPending 
          ? 'background-color: #ffedd5 !important; font-weight: 900; text-align: center;' 
          : isMandal 
          ? 'text-align: left; font-weight: 700; padding-left: 8px;' 
          : isSno 
          ? 'text-align: center; font-weight: 700;' 
          : 'text-align: center; font-weight: 600;';
        return `<td style="${style} padding: 5px; border: 1px solid #94a3b8;">${val}</td>`;
      }).join('');
      return `<tr>${tds}</tr>`;
    }).join('');

    let totalTr = '';
    if (displayTotalRow) {
      const tds = parsedAbstract.header.map((colName: any, cIdx: number) => {
        const colType = getColType(colName, cIdx);
        const isTahsildarPending = colType === 'tahsildarPending';
        const isRdoPending = colType === 'rdoPending';
        const val = displayTotalRow[cIdx] !== undefined && displayTotalRow[cIdx] !== null ? displayTotalRow[cIdx] : '';
        const bg = isTahsildarPending 
          ? '#fef08a' 
          : isRdoPending 
          ? '#fed7aa' 
          : '#e9ecf5';
        return `<td style="background-color: ${bg} !important; font-weight: 900; text-align: ${cIdx === 1 ? 'left' : 'center'}; padding: 6px; border: 1px solid #64748b;">${val}</td>`;
      }).join('');
      totalTr = `<tfoot><tr style="border-top: 2px solid #0f172a; border-bottom: 2px solid #0f172a;">${tds}</tr></tfoot>`;
    }

    const titleTh = `
      <tr>
        <th colspan="${parsedAbstract.header.length}" style="background-color: #134674 !important; color: #ffffff !important; font-size: 13px; font-weight: 900; text-align: center; padding: 9px; border: 1px solid #94a3b8;">
          ${parsedAbstract.reportTitle}
        </th>
      </tr>
    `;

    const tableHtml = `
      <table style="width: 100%; border-collapse: collapse; font-size: 10px;">
        <thead>
          ${titleTh}
          <tr>${ths}</tr>
        </thead>
        <tbody>${trs}</tbody>
        ${totalTr}
      </table>
    `;

    printTableReport(tableHtml, {
      title: parsedAbstract.reportTitle,
      subtitle: 'Revenue Divisional Office, Huzurnagar • Suryapet District',
      period: '05-09-2026 17:56:04',
      landscape: true,
    });
  };

  const handlePrintDetailed = () => {
    if (!parsedDetailedReport.header.length) {
      onShowToast('No detailed report data loaded to print.');
      return;
    }
    const header = parsedDetailedReport.header;
    const dataRows = filteredDetailedDataRows;

    const titleTh = `
      <tr>
        <th colspan="${header.length}" style="background-color: #134674 !important; color: #ffffff !important; font-size: 13px; font-weight: 900; text-align: center; padding: 9px; border: 1px solid #94a3b8;">
          ${parsedDetailedReport.reportTitle}
        </th>
      </tr>
    `;

    const ths = header.map((col: any) => 
      `<th style="background-color: #164875 !important; color: #ffffff !important; padding: 6px; border: 1px solid #94a3b8; font-weight: 800; text-align: center;">${col}</th>`
    ).join('');

    const trs = dataRows.map((row: any[]) => {
      const tds = header.map((_: any, idx: number) => {
        const val = row[idx] !== undefined && row[idx] !== null ? String(row[idx]) : '';
        const isPendingTah = val.toLowerCase().includes('pending at tahsildar');
        const isPendingRdo = val.toLowerCase().includes('pending at rdo');
        const bg = isPendingTah 
          ? 'background-color: #ffffc8 !important; font-weight: bold;' 
          : isPendingRdo 
          ? 'background-color: #ffedd5 !important; font-weight: bold;' 
          : '';
        return `<td style="padding: 5px; text-align: center; border: 1px solid #94a3b8; ${bg}">${val}</td>`;
      }).join('');
      return `<tr>${tds}</tr>`;
    }).join('');

    const tableHtml = `
      <table style="width: 100%; border-collapse: collapse; font-size: 9.5px;">
        <thead>
          ${titleTh}
          <tr>${ths}</tr>
        </thead>
        <tbody>${trs}</tbody>
      </table>
    `;

    printTableReport(tableHtml, {
      title: parsedDetailedReport.reportTitle,
      subtitle: 'Revenue Divisional Office, Huzurnagar • Suryapet District',
      period: '05-09-2026 17:56:04',
      landscape: true,
      fileName: 'Sadabainama_Detailed_Report',
    });
  };

  return (
    <div className="space-y-8">
      {/* ============================================================ */}
      {/* SECTION 1: SADABAINAMA ABSTRACT REPORT (EXACT MATCH TO IMAGE) */}
      {/* ============================================================ */}
      <div className="bg-white border-2 border-[#134674] rounded-xl shadow-lg overflow-hidden">
        {/* Action Controls Bar with Search and Quick Filters */}
        <div className="bg-slate-50 border-b border-slate-200 p-4 space-y-3">
          <div className="flex flex-wrap justify-between items-center gap-3">
            {/* Search Box - LOCKED HEADERS WORK ALWAYS EVEN WITH SEARCH */}
            <div className="relative w-full sm:w-96">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                id="abstractSearchInput"
                placeholder="Search Mandal, S.No, numbers, status..."
                value={abstractSearch}
                onChange={(e) => setAbstractSearch(e.target.value)}
                className="w-full pl-9 pr-8 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:border-blue-600 focus:ring-1 focus:ring-blue-600 focus:outline-none shadow-2xs font-medium"
              />
              {abstractSearch && (
                <button
                  onClick={() => setAbstractSearch('')}
                  className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                  title="Clear Search"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Controls: Upload, Export, Reset */}
            <div className="flex flex-wrap items-center gap-2">
              <input
                type="file"
                ref={abstractFileInputRef}
                accept=".xls,.xlsx,.csv"
                className="hidden"
                onChange={(e) => handleExcelUpload(e, 'abstract')}
              />
              <button
                onClick={() => abstractFileInputRef.current?.click()}
                className="bg-[#134674] hover:bg-[#0f3b63] text-white text-xs font-bold px-3 py-2 rounded-lg flex items-center gap-1.5 shadow-xs transition cursor-pointer"
                title="Upload custom Excel or CSV"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Upload Abstract Excel</span>
              </button>

              <button
                onClick={handlePrintAbstract}
                className="bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold px-3 py-2 rounded-lg flex items-center gap-1.5 shadow-xs transition cursor-pointer"
                title="Print official Sadabainama Abstract Table"
              >
                <Printer className="w-3.5 h-3.5 text-sky-300" />
                <span>Print Abstract Table</span>
              </button>

              <button
                onClick={() => handleExportCSV(currentAbstract, 'Sadabainama_Abstract_Huzurnagar')}
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3 py-2 rounded-lg flex items-center gap-1.5 shadow-xs transition cursor-pointer"
                title="Export as CSV"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export CSV</span>
              </button>

              <button
                onClick={handleResetAbstract}
                className="bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold px-3 py-2 rounded-lg flex items-center gap-1.5 transition cursor-pointer"
                title="Reset to official Huzurnagar dataset"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Official</span>
              </button>

              {abstractData && (
                <button
                  onClick={() => handleClear('abstract')}
                  className="bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold px-3 py-2 rounded-lg flex items-center gap-1.5 transition cursor-pointer"
                  title="Clear uploaded file"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Clear</span>
                </button>
              )}
            </div>
          </div>

          {/* Quick Mandal Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1 text-xs">
            <span className="text-slate-500 font-bold mr-1">Filter Mandal:</span>
            <button
              onClick={() => setAbstractSearch('')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition cursor-pointer ${
                !abstractSearch
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              All ({parsedAbstract.dataRows.length})
            </button>
            {parsedAbstract.dataRows.map((r, i) => {
              const mandal = String(r[1] || '').trim();
              if (!mandal) return null;
              const isSelected = abstractSearch.toLowerCase().trim() === mandal.toLowerCase();
              return (
                <button
                  key={i}
                  onClick={() => setAbstractSearch(isSelected ? '' : mandal)}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition cursor-pointer ${
                    isSelected
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {mandal.replace(/ \(.*\)/, '')}
                </button>
              );
            })}
          </div>
        </div>

        {/* Filter count notice */}
        {abstractSearch.trim() && (
          <div className="bg-blue-50/80 border-b border-blue-200 px-4 py-2 text-xs font-bold text-blue-900 flex justify-between items-center">
            <span>
              Search active: Showing {filteredAbstractDataRows.length} of {parsedAbstract.dataRows.length} mandals for "{abstractSearch}"
            </span>
            <button
              onClick={() => setAbstractSearch('')}
              className="text-blue-700 hover:underline cursor-pointer flex items-center gap-1 text-[11px]"
            >
              <X className="w-3.5 h-3.5" />
              <span>Clear Filter (Show All)</span>
            </button>
          </div>
        )}

        {/* ============================================================ */}
        {/* SCROLLABLE TABLE CONTAINER WITH LOCKED 1 & 2 HEADERS */}
        {/* ============================================================ */}
        <div 
          className="relative overflow-x-auto overflow-y-auto max-h-[620px] bg-white select-none"
          style={{ scrollBehavior: 'smooth' }}
        >
          <table className="w-full text-xs text-left border-separate border-spacing-0 border-t border-l border-slate-300">
            {/* LOCKED THEAD - 1 & 2 HEADERS STAY LOCKED AT TOP ON SCROLL & SEARCH */}
            <thead className="sticky top-0 z-30 shadow-md">
              {/* HEADER 1: FULLY MERGED ACROSS ALL COLUMNS AND CENTERED IN TABLE MIDDLE */}
              <tr className="sticky top-0 z-40 bg-[#134674]" style={{ height: '46px' }}>
                <th
                  colSpan={parsedAbstract.header.length || 12}
                  className="sticky top-0 left-0 z-40 bg-[#134674] text-white px-4 py-2.5 border-b-2 border-r border-[#0e3253] text-center select-none shadow-sm"
                  style={{ backgroundColor: '#134674', height: '46px' }}
                >
                  <div className="w-full flex items-center justify-center text-center">
                    <span className="text-sm md:text-base font-black text-white tracking-wide">
                      {parsedAbstract.reportTitle}
                    </span>
                  </div>
                </th>
              </tr>

              {/* HEADER 2: COLUMN NAMES - LOCKED AT TOP-46px */}
              <tr className="sticky top-[46px] z-30 bg-[#164875]">
                {parsedAbstract.header.map((colName: any, idx: number) => {
                  const colType = getColType(colName, idx);
                  const isTahsildarPending = colType === 'tahsildarPending';
                  const isRdoPending = colType === 'rdoPending';
                  const isMandal = colType === 'mandal';
                  const isSno = colType === 'sno';

                  // Sticky coordinates for columns 1 & 2
                  let colStickyClass = 'sticky top-[46px] z-30 bg-[#164875]';
                  let colStyle: React.CSSProperties = { backgroundColor: '#164875' };

                  if (isSno) {
                    colStickyClass = 'sticky top-[46px] left-0 z-50 bg-[#164875]';
                  } else if (isMandal) {
                    colStickyClass = 'sticky top-[46px] left-[55px] z-50 bg-[#164875]';
                  }

                  return (
                    <th
                      key={idx}
                      className={`${colStickyClass} py-3.5 px-3 border-b-2 border-r border-slate-400/60 font-black text-xs tracking-wider select-none whitespace-normal ${
                        isTahsildarPending 
                          ? 'text-[#ffff00] text-center min-w-[130px] max-w-[140px]' 
                          : isRdoPending 
                          ? 'text-[#fed7aa] text-center min-w-[130px] max-w-[140px]'
                          : isMandal 
                          ? 'text-white text-left min-w-[240px] pl-4' 
                          : isSno 
                          ? 'text-white text-center w-[55px] min-w-[55px] max-w-[55px]' 
                          : 'text-white text-center min-w-[110px]'
                      }`}
                      style={colStyle}
                    >
                      {String(colName || '')}
                    </th>
                  );
                })}
              </tr>
            </thead>

            {/* TBODY - DATA ROWS (COLUMNS 1 & 2 FROZEN ON HORIZONTAL SCROLL) */}
            <tbody>
              {filteredAbstractDataRows.length === 0 ? (
                <tr>
                  <td
                    colSpan={parsedAbstract.header.length || 12}
                    className="py-12 text-center text-slate-500 bg-slate-50 font-medium border-b border-r border-slate-300"
                  >
                    <div className="flex flex-col items-center justify-center gap-2">
                      <AlertCircle className="w-8 h-8 text-amber-500" />
                      <p className="text-sm font-bold text-slate-700">
                        No matching records found for "{abstractSearch}"
                      </p>
                      <button
                        onClick={() => setAbstractSearch('')}
                        className="text-xs text-blue-600 hover:underline font-bold mt-1 cursor-pointer"
                      >
                        Reset Search to Show All Mandals
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredAbstractDataRows.map((row, rIdx) => {
                  return (
                    <tr 
                      key={rIdx} 
                      className="hover:bg-blue-50/40 transition-colors"
                    >
                      {parsedAbstract.header.map((colName: any, cIdx: number) => {
                        const colType = getColType(colName, cIdx);
                        const isTahsildarPending = colType === 'tahsildarPending';
                        const isRdoPending = colType === 'rdoPending';
                        const isMandal = colType === 'mandal';
                        const isSno = colType === 'sno';
                        const val = String(row[cIdx] !== undefined && row[cIdx] !== null ? row[cIdx] : '');

                        // Column locking coordinates
                        let cellStickyClass = '';
                        if (isSno) {
                          cellStickyClass = 'sticky left-0 z-20 shadow-[1px_0_0_0_#cbd5e1]';
                        } else if (isMandal) {
                          cellStickyClass = 'sticky left-[55px] z-20 shadow-[1px_0_0_0_#cbd5e1]';
                        }

                        return (
                          <td
                            key={cIdx}
                            className={`${cellStickyClass} py-2.5 px-3 border-b border-r border-slate-300 text-xs ${
                              isTahsildarPending
                                ? 'bg-[#ffffc8] text-slate-950 font-black text-center text-sm'
                                : isRdoPending
                                ? 'bg-[#ffedd5] text-slate-950 font-black text-center text-sm'
                                : isMandal
                                ? 'bg-white text-slate-900 font-bold text-left pl-4 min-w-[240px]'
                                : isSno
                                ? 'bg-white text-slate-800 font-bold text-center w-[55px] min-w-[55px] max-w-[55px]'
                                : 'bg-white text-slate-800 font-bold text-center'
                            }`}
                            style={{
                              backgroundColor: isTahsildarPending 
                                ? '#ffffc8' 
                                : isRdoPending 
                                ? '#ffedd5' 
                                : '#ffffff'
                            }}
                          >
                            {val}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })
              )}
            </tbody>

            {/* LOCKED / PINNED FOOTER: TOTAL ROW (EXACT REPLICA OF SCREENSHOT) */}
            {displayTotalRow && (
              <tfoot className="sticky bottom-0 z-30 shadow-md">
                <tr className="font-black bg-[#e9ecf5]">
                  {parsedAbstract.header.map((colName: any, cIdx: number) => {
                    const colType = getColType(colName, cIdx);
                    const isTahsildarPending = colType === 'tahsildarPending';
                    const isRdoPending = colType === 'rdoPending';
                    const isMandal = colType === 'mandal';
                    const isSno = colType === 'sno';
                    const val = String(displayTotalRow[cIdx] !== undefined && displayTotalRow[cIdx] !== null ? displayTotalRow[cIdx] : '');

                    // Sticky coordinates for footer columns 1 & 2
                    let footerStickyClass = 'sticky bottom-0 z-30';
                    if (isSno) {
                      footerStickyClass = 'sticky bottom-0 left-0 z-40';
                    } else if (isMandal) {
                      footerStickyClass = 'sticky bottom-0 left-[55px] z-40';
                    }

                    return (
                      <td
                        key={cIdx}
                        className={`${footerStickyClass} py-3 px-3 border-t-2 border-b-2 border-r border-slate-400 font-black text-xs ${
                          isTahsildarPending
                            ? 'bg-[#fef08a] text-slate-950 text-center text-sm'
                            : isRdoPending
                            ? 'bg-[#fed7aa] text-slate-950 text-center text-sm'
                            : isMandal
                            ? 'bg-[#e9ecf5] text-slate-950 text-left pl-4 uppercase tracking-wider text-sm min-w-[240px]'
                            : isSno
                            ? 'bg-[#e9ecf5] text-slate-950 text-center w-[55px] min-w-[55px] max-w-[55px]'
                            : 'bg-[#e9ecf5] text-slate-950 text-center text-sm'
                        }`}
                        style={{
                          backgroundColor: isTahsildarPending 
                            ? '#fef08a' 
                            : isRdoPending 
                            ? '#fed7aa' 
                            : '#e9ecf5',
                        }}
                      >
                        {val}
                      </td>
                    );
                  })}
                </tr>
              </tfoot>
            )}
          </table>
        </div>

        {/* Footer info legend */}
        <div className="bg-slate-100 border-t border-slate-300 px-4 py-2.5 flex flex-wrap justify-between items-center text-xs text-slate-600 gap-3">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 font-bold">
              <span className="w-3.5 h-3.5 rounded bg-[#ffffc8] border border-amber-300 inline-block"></span>
              <span>Pending at Tahsildar</span>
            </span>
            <span className="flex items-center gap-1.5 font-bold">
              <span className="w-3.5 h-3.5 rounded bg-[#ffedd5] border border-orange-300 inline-block"></span>
              <span>Pending at RDO</span>
            </span>
          </div>
          <span className="font-semibold text-slate-500">
            Official Revenue Portal • Huzurnagar Division
          </span>
        </div>
      </div>

      {/* ============================================================ */}
      {/* SECTION 2: SADABAINAMA DETAILED REPORT (2 LOCKED BLUE HEADERS) */}
      {/* ============================================================ */}
      <div className="bg-white border border-slate-200 border-t-4 border-t-blue-600 rounded-xl p-5 md:p-6 shadow-xs space-y-4">
        <div className="flex flex-wrap justify-between items-center gap-3 border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-blue-600" />
              <span>Sadabainama Detailed Report</span>
            </h2>
            <p className="text-xs font-semibold text-slate-500">
              Upload and view verbatim detailed report data as-is from Excel (.xls, .xlsx, .csv)
            </p>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="file"
              ref={reportFileInputRef}
              accept=".xls,.xlsx,.csv"
              className="hidden"
              onChange={(e) => handleExcelUpload(e, 'report')}
            />
            <button
              onClick={() => reportFileInputRef.current?.click()}
              className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-3 py-2 rounded-lg flex items-center gap-1.5 shadow-sm transition cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Upload Report Excel</span>
            </button>
            <button
              onClick={handleResetReport}
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-3 py-2 rounded-lg flex items-center gap-1.5 border border-slate-300 shadow-xs transition cursor-pointer"
              title="Reset to official Huzurnagar sample report"
            >
              <RotateCcw className="w-3.5 h-3.5 text-blue-600" />
              <span>Reset Sample</span>
            </button>
            {parsedDetailedReport.header.length > 0 && (
              <button
                onClick={handlePrintDetailed}
                className="bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold px-3 py-2 rounded-lg flex items-center gap-1.5 shadow-sm transition cursor-pointer"
                title="Print Detailed Report"
              >
                <Printer className="w-3.5 h-3.5 text-sky-300" />
                <span>Print Detailed Report</span>
              </button>
            )}
            {parsedDetailedReport.header.length > 0 && (
              <button
                onClick={() => handleExportCSV(currentReport || [], 'Sadabainama_Detailed_Report')}
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3 py-2 rounded-lg flex items-center gap-1.5 shadow-sm transition cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export CSV</span>
              </button>
            )}
            <button
              onClick={() => handleClear('report')}
              className="bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold px-3 py-2 rounded-lg flex items-center gap-1.5 transition cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear</span>
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="relative w-full max-w-sm">
            <Search className="w-4 h-4 text-slate-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder="Search by Mandal, Village, Applicant, Application No, Khata, Survey..."
              value={reportSearch}
              onChange={(e) => setReportSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-300 rounded-md focus:border-blue-500 focus:outline-none"
            />
            {reportSearch && (
              <button 
                onClick={() => setReportSearch('')}
                className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500">
              Showing <span className="text-blue-700 font-extrabold">{filteredDetailedDataRows.length}</span> Records
            </span>
          </div>
        </div>

        {/* Detailed Report Table with Locked 2 Blue Header Rows & Scrolling Data Rows */}
        {parsedDetailedReport.header.length === 0 ? (
          <div className="text-center py-12 text-slate-400 text-xs font-medium border border-dashed border-slate-200 rounded-lg space-y-2">
            <div>No Detailed Report data loaded yet.</div>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => reportFileInputRef.current?.click()}
                className="text-blue-600 hover:underline font-bold"
              >
                Upload Report Excel
              </button>
              <span>or</span>
              <button
                onClick={handleResetReport}
                className="text-blue-600 hover:underline font-bold"
              >
                Load Sample Data
              </button>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto overflow-y-auto max-h-[520px] border border-slate-300 rounded-lg shadow-sm">
            <table className="w-full text-xs text-left border-separate border-spacing-0 border-t border-l border-slate-300 bg-white">
              {/* LOCKED THEAD - 1 & 2 HEADERS STAY LOCKED IN BLUE WITH WHITE FONTS */}
              <thead className="sticky top-0 z-30 shadow-md">
                {/* ROW 1: FULLY MERGED ACROSS ALL COLUMNS, CENTERED IN MIDDLE, BLUE WITH WHITE FONTS, LOCKED AT TOP */}
                <tr className="sticky top-0 z-40 bg-[#134674]" style={{ height: '46px' }}>
                  <th
                    colSpan={parsedDetailedReport.header.length || 1}
                    className="sticky top-0 left-0 z-40 bg-[#134674] text-white px-4 py-2.5 border-b-2 border-r border-[#0e3253] text-center select-none shadow-sm"
                    style={{ backgroundColor: '#134674', height: '46px' }}
                  >
                    <div className="w-full flex items-center justify-center text-center">
                      <span className="text-sm md:text-base font-black text-white tracking-wide">
                        {parsedDetailedReport.reportTitle}
                      </span>
                    </div>
                  </th>
                </tr>

                {/* ROW 2: COLUMN HEADERS, BLUE BACKGROUND WITH WHITE FONTS, LOCKED AT TOP-46px */}
                <tr className="sticky top-[46px] z-30 bg-[#164875]" style={{ height: '38px' }}>
                  {parsedDetailedReport.header.map((colName: any, idx: number) => (
                    <th
                      key={idx}
                      className="sticky top-[46px] z-30 bg-[#164875] py-2.5 px-3 border-b border-r border-slate-400/50 whitespace-nowrap font-bold text-white text-center shadow-xs text-[11px]"
                      style={{ backgroundColor: '#164875' }}
                    >
                      {String(colName || '')}
                    </th>
                  ))}
                </tr>
              </thead>

              {/* BODY: REMAINING DATA ROWS THAT SCROLL SMOOTHLY UNDERNEATH */}
              <tbody className="divide-y divide-slate-200">
                {filteredDetailedDataRows.length === 0 ? (
                  <tr>
                    <td
                      colSpan={parsedDetailedReport.header.length || 1}
                      className="py-8 text-center text-slate-400 border-r border-b border-slate-200"
                    >
                      No matching records found for "{reportSearch}".
                    </td>
                  </tr>
                ) : (
                  filteredDetailedDataRows.map((row, rIdx) => {
                    const rowBg = rIdx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50';
                    return (
                      <tr key={rIdx} className={`${rowBg} hover:bg-blue-50/60 transition-colors`}>
                        {parsedDetailedReport.header.map((colName: any, cIdx: number) => {
                          const val = row[cIdx] !== undefined && row[cIdx] !== null ? String(row[cIdx]) : '';
                          const lowerVal = val.toLowerCase();
                          const isPendingTah = lowerVal.includes('pending at tahsildar');
                          const isPendingRdo = lowerVal.includes('pending at rdo');
                          const isCompleted = lowerVal.includes('completed') || lowerVal.includes('orders issued');

                          let cellBgClass = '';
                          let textClass = 'text-slate-800';

                          if (isPendingTah) {
                            cellBgClass = 'bg-[#ffffc8]/90 font-bold text-amber-900';
                          } else if (isPendingRdo) {
                            cellBgClass = 'bg-[#ffedd5]/90 font-bold text-orange-950';
                          } else if (isCompleted) {
                            cellBgClass = 'bg-emerald-50 font-bold text-emerald-800';
                          }

                          return (
                            <td
                              key={cIdx}
                              className={`py-2 px-3 border-r border-b border-slate-200 whitespace-nowrap text-center text-[11px] font-medium ${cellBgClass || textClass}`}
                            >
                              {val}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer info legend */}
        <div className="bg-slate-100 border border-slate-200 rounded-lg px-4 py-2.5 flex flex-wrap justify-between items-center text-xs text-slate-600 gap-3">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 font-bold">
              <span className="w-3.5 h-3.5 rounded bg-[#ffffc8] border border-amber-300 inline-block"></span>
              <span>Pending at Tahsildar</span>
            </span>
            <span className="flex items-center gap-1.5 font-bold">
              <span className="w-3.5 h-3.5 rounded bg-[#ffedd5] border border-orange-300 inline-block"></span>
              <span>Pending at RDO</span>
            </span>
            <span className="flex items-center gap-1.5 font-bold">
              <span className="w-3.5 h-3.5 rounded bg-emerald-100 border border-emerald-300 inline-block"></span>
              <span>Completed</span>
            </span>
          </div>
          <span className="font-semibold text-slate-500">
            Huzurnagar Revenue Division • Official Detailed Records
          </span>
        </div>
      </div>
    </div>
  );
};

