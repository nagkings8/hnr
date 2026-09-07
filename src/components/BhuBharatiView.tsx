import React, { useState, useMemo } from 'react';
import { BhuFile, MANDAL_VILLAGES, MANDAL_LIST, REVENUE_MODULES, FILE_STATUSES } from '../types';
import { Search, RotateCcw, Download, PlusCircle, FileText, RefreshCw, Printer, Trash2 } from 'lucide-react';
import { exportBhuBharatiToCSV } from '../utils/storage';
import { printTableReport } from '../utils/printReport';

interface BhuBharatiViewProps {
  files: BhuFile[];
  initialStatusFilter?: string;
  onNewFile: () => void;
  onUpdateStatus: (file: BhuFile) => void;
  onPrintSlip: (file: BhuFile) => void;
  onViewPdf: (file: BhuFile) => void;
  onDeleteFile: (file: BhuFile) => void;
}

export const BhuBharatiView: React.FC<BhuBharatiViewProps> = ({
  files,
  initialStatusFilter = '',
  onNewFile,
  onUpdateStatus,
  onPrintSlip,
  onViewPdf,
  onDeleteFile,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMandal, setSelectedMandal] = useState('');
  const [selectedVillage, setSelectedVillage] = useState('');
  const [selectedModule, setSelectedModule] = useState('');
  const [selectedStatus, setSelectedStatus] = useState(initialStatusFilter);

  // Update village options when mandal changes
  const villageOptions = useMemo(() => {
    if (!selectedMandal) return [];
    return MANDAL_VILLAGES[selectedMandal] || [];
  }, [selectedMandal]);

  const handleMandalChange = (mandal: string) => {
    setSelectedMandal(mandal);
    setSelectedVillage('');
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedMandal('');
    setSelectedVillage('');
    setSelectedModule('');
    setSelectedStatus('');
  };

  const filteredFiles = useMemo(() => {
    return files.filter(f => {
      const q = searchTerm.toLowerCase();
      const matchSearch =
        (f.appNumber || '').toLowerCase().includes(q) ||
        (f.applicantName || '').toLowerCase().includes(q) ||
        (f.surveyNo || '').toLowerCase().includes(q) ||
        (f.village || '').toLowerCase().includes(q) ||
        (f.mandal || '').toLowerCase().includes(q);

      const matchMandal = selectedMandal === '' || f.mandal === selectedMandal;
      const matchVillage = selectedVillage === '' || f.village === selectedVillage;
      const matchModule = selectedModule === '' || f.module === selectedModule;
      const matchStatus = selectedStatus === '' || f.status === selectedStatus;

      return matchSearch && matchMandal && matchVillage && matchModule && matchStatus;
    });
  }, [files, searchTerm, selectedMandal, selectedVillage, selectedModule, selectedStatus]);

  const getStatusBadgeClass = (status: string) => {
    if (!status) return 'bg-amber-50 text-amber-800 border-amber-200';
    if (status.includes('Pending') || status.includes('Received')) return 'bg-amber-50 text-amber-800 border-amber-200';
    if (status.includes('Forwarded')) return 'bg-sky-50 text-sky-800 border-sky-200';
    if (status.includes('Completed') || status.includes('Disposed')) return 'bg-emerald-50 text-emerald-800 border-emerald-200';
    if (status.includes('Returned')) return 'bg-rose-50 text-rose-800 border-rose-200';
    return 'bg-slate-50 text-slate-800 border-slate-200';
  };

  const handlePrintTable = () => {
    const tableHeader = `
      <tr>
        <th style="width: 35px; background: #164875; color: #fff;">S.No</th>
        <th style="background: #164875; color: #fff;">Application No</th>
        <th style="background: #164875; color: #fff;">Applicant Name</th>
        <th style="background: #164875; color: #fff;">Mandal</th>
        <th style="background: #164875; color: #fff;">Village</th>
        <th style="background: #164875; color: #fff;">Survey No</th>
        <th style="background: #164875; color: #fff;">Extent</th>
        <th style="background: #164875; color: #fff;">Module</th>
        <th style="background: #164875; color: #fff;">File Status</th>
        <th style="background: #164875; color: #fff;">Assigned Seat</th>
        <th style="background: #164875; color: #fff;">Date Received</th>
      </tr>
    `;

    const tableRows = filteredFiles.map((f, i) => `
      <tr>
        <td style="text-align: center; font-weight: bold; border: 1px solid #94a3b8; padding: 5px;">${i + 1}</td>
        <td style="font-weight: bold; border: 1px solid #94a3b8; padding: 5px;">${f.appNumber}</td>
        <td style="border: 1px solid #94a3b8; padding: 5px;">${f.applicantName}</td>
        <td style="border: 1px solid #94a3b8; padding: 5px;">${f.mandal}</td>
        <td style="border: 1px solid #94a3b8; padding: 5px;">${f.village}</td>
        <td style="text-align: center; border: 1px solid #94a3b8; padding: 5px;">${f.surveyNo || '-'}</td>
        <td style="text-align: center; border: 1px solid #94a3b8; padding: 5px;">${f.extent || '-'}</td>
        <td style="border: 1px solid #94a3b8; padding: 5px;">${f.module}</td>
        <td style="text-align: center; font-weight: bold; border: 1px solid #94a3b8; padding: 5px;">${f.status}</td>
        <td style="border: 1px solid #94a3b8; padding: 5px;">${f.assignedSeat || '-'}</td>
        <td style="text-align: center; border: 1px solid #94a3b8; padding: 5px;">${f.receivedDate}</td>
      </tr>
    `).join('');

    const tableHtml = `
      <table style="width: 100%; border-collapse: collapse; font-size: 10px;">
        <thead>${tableHeader}</thead>
        <tbody>${tableRows}</tbody>
        <tfoot>
          <tr style="background-color: #e2e8f0; font-weight: bold;">
            <td colspan="11" style="padding: 6px 8px; text-align: left; border: 1px solid #64748b;">
              Total Records: ${filteredFiles.length} file(s)
              ${selectedMandal ? ` • Mandal: ${selectedMandal}` : ''}
              ${selectedModule ? ` • Module: ${selectedModule}` : ''}
              ${selectedStatus ? ` • Status: ${selectedStatus}` : ''}
            </td>
          </tr>
        </tfoot>
      </table>
    `;

    printTableReport(tableHtml, {
      title: 'Bhu Bharati Files Master Register',
      subtitle: 'Revenue Divisional Office, Huzurnagar • Suryapet District',
      period: 'Active Revenue Land Files Register',
      landscape: true,
    });
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 md:p-6 shadow-xs space-y-4">
      {/* Header section */}
      <div className="flex flex-wrap justify-between items-center gap-3 border-b border-slate-100 pb-4">
        <div>
          <h2 className="text-xl font-black text-slate-900">Bhu Bharati Files Master Register</h2>
          <p className="text-xs font-semibold text-slate-500">
            Revenue Divisional Office, Huzurnagar • 16 Revenue Land Modules
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handlePrintTable}
            className="bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold px-3 py-2 rounded-lg flex items-center gap-1.5 shadow-sm transition cursor-pointer"
            title="Print Bhu Bharati Files Table"
          >
            <Printer className="w-3.5 h-3.5 text-sky-300" />
            <span>Print Files Register</span>
          </button>
          <button
            onClick={() => exportBhuBharatiToCSV(files)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3 py-2 rounded-lg flex items-center gap-1.5 shadow-sm transition cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Excel (CSV)</span>
          </button>
          <button
            onClick={onNewFile}
            className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-3 py-2 rounded-lg flex items-center gap-1.5 shadow-sm transition cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>New Bhu Bharati File</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap gap-2.5 items-center bg-slate-50 p-3 rounded-lg border border-slate-200">
        <div className="relative min-w-[220px] flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-2.5 top-2.5" />
          <input
            type="text"
            placeholder="Search App No / Name / Survey..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-300 rounded-md focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <select
          value={selectedMandal}
          onChange={(e) => handleMandalChange(e.target.value)}
          className="text-xs bg-white border border-slate-300 rounded-md py-1.5 px-2.5 focus:border-blue-500 focus:outline-none"
        >
          <option value="">All Mandals</option>
          {MANDAL_LIST.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>

        <select
          value={selectedVillage}
          onChange={(e) => setSelectedVillage(e.target.value)}
          disabled={!selectedMandal}
          className="text-xs bg-white border border-slate-300 rounded-md py-1.5 px-2.5 focus:border-blue-500 focus:outline-none disabled:bg-slate-100 disabled:text-slate-400"
        >
          <option value="">{selectedMandal ? 'All Villages' : 'Select Mandal First'}</option>
          {villageOptions.map((v) => (
            <option key={v} value={v}>
              {v}
            </option>
          ))}
        </select>

        <select
          value={selectedModule}
          onChange={(e) => setSelectedModule(e.target.value)}
          className="text-xs bg-white border border-slate-300 rounded-md py-1.5 px-2.5 focus:border-blue-500 focus:outline-none"
        >
          <option value="">All 16 Modules</option>
          {REVENUE_MODULES.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>

        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="text-xs bg-white border border-slate-300 rounded-md py-1.5 px-2.5 focus:border-blue-500 focus:outline-none"
        >
          <option value="">All Statuses</option>
          {FILE_STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>

        <button
          onClick={handleResetFilters}
          className="bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold px-2.5 py-1.5 rounded-md flex items-center gap-1 transition cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset</span>
        </button>
      </div>

      {/* Table Container */}
      <div className="overflow-x-auto border border-slate-200 rounded-lg">
        <table className="w-full text-xs text-left border-collapse bg-white">
          <thead className="bg-slate-50 text-slate-900 uppercase font-bold border-b border-slate-200 text-[11px]">
            <tr>
              <th className="py-2.5 px-3 border-r border-slate-200 w-12 text-center">Sl.No</th>
              <th className="py-2.5 px-3 border-r border-slate-200">Application ID</th>
              <th className="py-2.5 px-3 border-r border-slate-200">Applicant Name</th>
              <th className="py-2.5 px-3 border-r border-slate-200">Mandal &amp; Village</th>
              <th className="py-2.5 px-3 border-r border-slate-200">Survey No</th>
              <th className="py-2.5 px-3 border-r border-slate-200">Module</th>
              <th className="py-2.5 px-3 border-r border-slate-200">Received Date</th>
              <th className="py-2.5 px-3 border-r border-slate-200">Status</th>
              <th className="py-2.5 px-3 border-r border-slate-200 text-center">Document</th>
              <th className="py-2.5 px-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {filteredFiles.length === 0 ? (
              <tr>
                <td colSpan={10} className="py-8 text-center text-slate-400 font-medium">
                  No matching Bhu Bharati records found.
                </td>
              </tr>
            ) : (
              filteredFiles.map((f, idx) => (
                <tr key={f.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-2.5 px-3 text-center font-medium text-slate-500 border-r border-slate-200">
                    {idx + 1}
                  </td>
                  <td className="py-2.5 px-3 font-bold text-slate-900 border-r border-slate-200">
                    {f.appNumber}
                  </td>
                  <td className="py-2.5 px-3 font-medium text-slate-800 border-r border-slate-200">
                    {f.applicantName}
                  </td>
                  <td className="py-2.5 px-3 border-r border-slate-200">
                    <div className="font-semibold text-slate-900">{f.mandal}</div>
                    <div className="text-[11px] text-slate-500">{f.village}</div>
                  </td>
                  <td className="py-2.5 px-3 font-medium text-slate-800 border-r border-slate-200">
                    {f.surveyNo}
                  </td>
                  <td className="py-2.5 px-3 border-r border-slate-200">
                    <span className="inline-block px-2 py-0.5 rounded text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                      {f.module}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 font-medium text-slate-600 border-r border-slate-200 whitespace-nowrap">
                    {f.receivedDate}
                  </td>
                  <td className="py-2.5 px-3 border-r border-slate-200">
                    <span
                      className={`inline-block px-2 py-0.5 rounded-full text-[11px] font-bold border ${getStatusBadgeClass(
                        f.status
                      )}`}
                    >
                      {f.status}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-center border-r border-slate-200">
                    {f.hasAttachment || f.fileAttachment ? (
                      <button
                        onClick={() => onViewPdf(f)}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-2 py-1 rounded text-[11px] inline-flex items-center gap-1 transition cursor-pointer shadow-xs"
                        title="View Complete PDF Dossier"
                      >
                        <FileText className="w-3 h-3" />
                        <span>View PDF</span>
                      </button>
                    ) : (
                      <span className="text-[11px] text-slate-400">No File</span>
                    )}
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        onClick={() => onUpdateStatus(f)}
                        className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-2 py-1 rounded text-[11px] inline-flex items-center gap-1 transition cursor-pointer shadow-xs"
                        title="Update File Status Movement"
                      >
                        <RefreshCw className="w-3 h-3" />
                        <span>Status</span>
                      </button>
                      <button
                        onClick={() => onPrintSlip(f)}
                        className="bg-slate-800 hover:bg-slate-900 text-white font-bold px-2 py-1 rounded text-[11px] inline-flex items-center gap-1 transition cursor-pointer shadow-xs"
                        title="Print Official Tracking Slip"
                      >
                        <Printer className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => onDeleteFile(f)}
                        className="bg-rose-600 hover:bg-rose-700 text-white font-bold px-2 py-1 rounded text-[11px] inline-flex items-center gap-1 transition cursor-pointer shadow-xs"
                        title="Delete File Record"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
