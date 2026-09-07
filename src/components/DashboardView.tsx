import React from 'react';
import { BhuFile, InwardTapal, OutwardDespatch, StaffUser, AppealCase } from '../types';
import { FolderOpen, Mail, Users, ArrowRight, PlusCircle, Send, Printer, Scale, FileSpreadsheet } from 'lucide-react';
import { ActiveTab } from './Navigation';
import { printTableReport } from '../utils/printReport';

interface DashboardViewProps {
  files: BhuFile[];
  inwards: InwardTapal[];
  outwards: OutwardDespatch[];
  staff: StaffUser[];
  appealCases?: AppealCase[];
  onNavigate: (tab: ActiveTab, filterState?: any) => void;
  onNewFile: () => void;
  onNewInward: () => void;
  onNewOutward: () => void;
  onOpenAdmin: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  files,
  inwards,
  outwards,
  staff,
  appealCases = [],
  onNavigate,
  onNewFile,
  onNewInward,
  onNewOutward,
  onOpenAdmin,
}) => {
  // Bhu Bharati metrics
  const totalBhu = files.length;
  const pendingBhu = files.filter(f => f.status === 'Pending at RDO' || f.status === 'Received from MRO').length;
  const forwardedBhu = files.filter(f => f.status === 'Forwarded to Collectorate').length;
  const returnedBhu = files.filter(f => f.status === 'Returned to MRO').length;
  const returnedCollBhu = files.filter(f => f.status === 'Returned from Collectorate').length;
  const completedBhu = files.filter(f => f.status === 'Completed').length;

  // Tapal Register metrics
  const totalInward = inwards.length;
  const scrutinyInward = inwards.filter(t => t.status === 'Under Scrutiny').length;
  const disposedInward = inwards.filter(t => t.status === 'Disposed').length;

  const outwardToMro = outwards.filter(o => (o.sentTo || '').includes('MRO')).length;
  const outwardToCollectorate = outwards.filter(o => (o.sentTo || '').includes('Collectorate')).length;
  const totalOutward = outwards.length;

  // Appeal Cases metrics
  const totalAppeals = appealCases.length;
  const finalOrdersCount = appealCases.filter(c => c.status.toLowerCase().includes('final order') || Boolean(c.finalOrderNo)).length;

  const activeStaffCount = staff.filter(s => s.active).length;

  const handlePrintSummary = () => {
    const tableHtml = `
      <h3 style="margin: 15px 0 6px 0; color: #164875; font-size: 12px; font-weight: 800;">1. Bhu Bharati Land Files Status</h3>
      <table>
        <thead>
          <tr>
            <th style="background: #164875; color: #fff;">Metric / Category</th>
            <th style="background: #164875; color: #fff; text-align: center; width: 120px;">Count</th>
            <th style="background: #164875; color: #fff; text-align: center; width: 100px;">Percentage</th>
          </tr>
        </thead>
        <tbody>
          <tr><td>Total Active Bhu Bharati Files</td><td style="text-align: center; font-weight: bold;">${totalBhu}</td><td style="text-align: center;">100%</td></tr>
          <tr><td>Pending at RDO / Received from MRO</td><td style="text-align: center; font-weight: bold; background: #ffffc8;">${pendingBhu}</td><td style="text-align: center;">${totalBhu ? Math.round((pendingBhu / totalBhu) * 100) : 0}%</td></tr>
          <tr><td>Forwarded to Collectorate</td><td style="text-align: center; font-weight: bold;">${forwardedBhu}</td><td style="text-align: center;">${totalBhu ? Math.round((forwardedBhu / totalBhu) * 100) : 0}%</td></tr>
          <tr><td>Returned to MRO / Clarifications</td><td style="text-align: center; font-weight: bold;">${returnedBhu}</td><td style="text-align: center;">${totalBhu ? Math.round((returnedBhu / totalBhu) * 100) : 0}%</td></tr>
          <tr><td>Completed / Disposed</td><td style="text-align: center; font-weight: bold; background: #dcfce7;">${completedBhu}</td><td style="text-align: center;">${totalBhu ? Math.round((completedBhu / totalBhu) * 100) : 0}%</td></tr>
        </tbody>
      </table>

      <h3 style="margin: 15px 0 6px 0; color: #164875; font-size: 12px; font-weight: 800;">2. Tapal Correspondence (Inward & Outward)</h3>
      <table>
        <thead>
          <tr>
            <th style="background: #164875; color: #fff;">Correspondence Stream</th>
            <th style="background: #164875; color: #fff; text-align: center; width: 120px;">Total</th>
            <th style="background: #164875; color: #fff; text-align: center;">Under Scrutiny / In Progress</th>
            <th style="background: #164875; color: #fff; text-align: center;">Disposed / Sent</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Inward Tapal Receipts</td>
            <td style="text-align: center; font-weight: bold;">${totalInward}</td>
            <td style="text-align: center; font-weight: bold; background: #ffffc8;">${scrutinyInward}</td>
            <td style="text-align: center; font-weight: bold; background: #dcfce7;">${disposedInward}</td>
          </tr>
          <tr>
            <td>Outward Despatches</td>
            <td style="text-align: center; font-weight: bold;">${totalOutward}</td>
            <td style="text-align: center;">To MROs: ${outwardToMro}</td>
            <td style="text-align: center; font-weight: bold; background: #dcfce7;">To Collectorate: ${outwardToCollectorate}</td>
          </tr>
        </tbody>
      </table>

      <h3 style="margin: 15px 0 6px 0; color: #164875; font-size: 12px; font-weight: 800;">3. D Section Active Staff Strength</h3>
      <table>
        <thead>
          <tr>
            <th style="background: #164875; color: #fff;">Total Staff Enrolled</th>
            <th style="background: #164875; color: #fff; text-align: center;">Active Officers</th>
            <th style="background: #164875; color: #fff; text-align: center;">Disabled Accounts</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style="font-weight: bold;">${staff.length} personnel</td>
            <td style="text-align: center; font-weight: bold; background: #dcfce7;">${activeStaffCount} Active</td>
            <td style="text-align: center; font-weight: bold;">${staff.length - activeStaffCount} Disabled</td>
          </tr>
        </tbody>
      </table>
    `;

    printTableReport(tableHtml, {
      title: 'D Section Executive Summary Report',
      subtitle: 'Revenue Divisional Office, Huzurnagar • Suryapet District',
      period: 'Current Operational Status',
      landscape: false,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap justify-between items-center gap-3">
        <div>
          <div className="text-[11px] font-extrabold tracking-widest text-amber-600 uppercase mb-1">
            EXECUTIVE CONTROL CENTER
          </div>
          <h2 className="text-xl md:text-2xl font-black text-slate-900">
            Revenue Divisional Office Huzurnagar • D Section Dashboard
          </h2>
        </div>
        <button
          onClick={handlePrintSummary}
          className="bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold px-3 py-2 rounded-lg flex items-center gap-1.5 shadow-sm transition cursor-pointer"
          title="Print Executive Summary Report"
        >
          <Printer className="w-3.5 h-3.5 text-sky-300" />
          <span>Print Summary Report</span>
        </button>
      </div>

      {/* Portal Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Portal 1: Bhu Bharati */}
        <div
          onClick={() => onNavigate('bhuBharatiTab')}
          className="bg-white border-1.5 border-slate-200 border-t-4 border-t-blue-600 rounded-xl p-5 cursor-pointer shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all flex flex-col justify-between min-h-[200px]"
        >
          <div>
            <div className="flex justify-between items-center mb-3">
              <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
                <FolderOpen className="w-6 h-6" />
              </div>
              <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-blue-50 text-blue-800 border border-blue-200">
                16 Modules
              </span>
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-1">Bhu Bharati Files</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Log, track, filter and manage all revenue land files across 16 approved modules including Pending Mutation, Extent Correction, and Succession.
            </p>
          </div>
          <div className="flex justify-between items-center border-t border-slate-100 pt-3 mt-4 text-xs font-bold text-blue-600">
            <span>{totalBhu} Active Files</span>
            <ArrowRight className="w-4 h-4" />
          </div>
        </div>

        {/* Portal 2: Tapal Register */}
        <div
          onClick={() => onNavigate('tapalTab')}
          className="bg-white border-1.5 border-slate-200 border-t-4 border-t-amber-600 rounded-xl p-5 cursor-pointer shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all flex flex-col justify-between min-h-[200px]"
        >
          <div>
            <div className="flex justify-between items-center mb-3">
              <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
                <Mail className="w-6 h-6" />
              </div>
              <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-amber-50 text-amber-800 border border-amber-200">
                Inward &amp; Outward
              </span>
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-1">Tapal Register</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Dedicated ledger to record Inward Tapal received from MROs/citizens and manage Outward Despatches forwarded to IDOC Collectorate or other offices.
            </p>
          </div>
          <div className="flex justify-between items-center border-t border-slate-100 pt-3 mt-4 text-xs font-bold text-amber-600">
            <span>{totalInward} Tapals • {totalOutward} Despatches</span>
            <ArrowRight className="w-4 h-4" />
          </div>
        </div>

        {/* Portal 3: Appeal Cases (COURT CASES & FINAL ORDERS) */}
        <div
          onClick={() => onNavigate('appealCasesTab')}
          className="bg-white border-1.5 border-slate-200 border-t-4 border-t-indigo-600 rounded-xl p-5 cursor-pointer shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all flex flex-col justify-between min-h-[200px]"
        >
          <div>
            <div className="flex justify-between items-center mb-3">
              <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-700">
                <Scale className="w-6 h-6" />
              </div>
              <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-indigo-50 text-indigo-800 border border-indigo-200">
                Revenue Court
              </span>
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-1">Appeal Cases</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              RDO Court Revenue Appeal cases register, cause lists, hearings, and signed Final Orders copy upload &amp; verification (RoR, Tenancy, Inams).
            </p>
          </div>
          <div className="flex justify-between items-center border-t border-slate-100 pt-3 mt-4 text-xs font-bold text-indigo-700">
            <span>{totalAppeals} Appeals • {finalOrdersCount} Final Orders</span>
            <ArrowRight className="w-4 h-4" />
          </div>
        </div>

        {/* Portal 4: Sadabainama */}
        <div
          onClick={() => onNavigate('sadabainamaTab')}
          className="bg-white border-1.5 border-slate-200 border-t-4 border-t-emerald-600 rounded-xl p-5 cursor-pointer shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all flex flex-col justify-between min-h-[200px]"
        >
          <div>
            <div className="flex justify-between items-center mb-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700">
                <FileSpreadsheet className="w-6 h-6" />
              </div>
              <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200">
                Regularisation
              </span>
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-1">Sadabainama</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Sadabainama abstract monitoring and detailed village-wise regularisation report with dual frozen headers and Excel upload.
            </p>
          </div>
          <div className="flex justify-between items-center border-t border-slate-100 pt-3 mt-4 text-xs font-bold text-emerald-700">
            <span>Abstract &amp; Detailed Report</span>
            <ArrowRight className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* BHU BHARATI DASHBOARD METRICS */}
      <div className="bg-white border border-slate-200 border-t-4 border-t-blue-600 rounded-2xl p-5 md:p-6 shadow-sm">
        <div className="flex flex-wrap justify-between items-center gap-3 border-b border-slate-100 pb-4 mb-5">
          <div className="flex items-center gap-2 text-lg font-black text-slate-900">
            <FolderOpen className="w-5 h-5 text-blue-600" />
            <span>Bhu Bharati Files Dashboard (16 Revenue Modules)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
              Revenue Land Files
            </span>
            <button
              onClick={onNewFile}
              className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow-sm transition cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>New File Entry</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Card 1 */}
          <div
            onClick={() => onNavigate('bhuBharatiTab', { status: '' })}
            className="bg-white border border-slate-200 border-l-[6px] border-l-blue-600 rounded-xl p-4 cursor-pointer shadow-xs hover:shadow-md hover:-translate-y-1 transition"
          >
            <div className="text-[11px] font-extrabold text-blue-800 uppercase">TOTAL BHU BHARATI FILES</div>
            <div className="text-3xl font-extrabold text-blue-900 my-1">{totalBhu}</div>
            <div className="text-xs font-bold text-blue-600 flex items-center gap-1">Across All 7 Mandals →</div>
          </div>

          {/* Card 2 */}
          <div
            onClick={() => onNavigate('bhuBharatiTab', { status: 'Pending at RDO' })}
            className="bg-white border border-slate-200 border-l-[6px] border-l-amber-600 rounded-xl p-4 cursor-pointer shadow-xs hover:shadow-md hover:-translate-y-1 transition"
          >
            <div className="text-[11px] font-extrabold text-amber-800 uppercase">PENDING AT RDO</div>
            <div className="text-3xl font-extrabold text-amber-600 my-1">{pendingBhu}</div>
            <div className="text-xs font-bold text-amber-700 flex items-center gap-1">Action In-Progress →</div>
          </div>

          {/* Card 3 */}
          <div
            onClick={() => onNavigate('bhuBharatiTab', { status: 'Forwarded to Collectorate' })}
            className="bg-white border border-slate-200 border-l-[6px] border-l-sky-600 rounded-xl p-4 cursor-pointer shadow-xs hover:shadow-md hover:-translate-y-1 transition"
          >
            <div className="text-[11px] font-extrabold text-sky-800 uppercase">FORWARDED TO COLLECTORATE</div>
            <div className="text-3xl font-extrabold text-sky-600 my-1">{forwardedBhu}</div>
            <div className="text-xs font-bold text-sky-600 flex items-center gap-1">Under IDOC Review →</div>
          </div>

          {/* Card 4 */}
          <div
            onClick={() => onNavigate('bhuBharatiTab', { status: 'Returned to MRO' })}
            className="bg-white border border-slate-200 border-l-[6px] border-l-red-600 rounded-xl p-4 cursor-pointer shadow-xs hover:shadow-md hover:-translate-y-1 transition"
          >
            <div className="text-[11px] font-extrabold text-red-800 uppercase">RETURNED TO MRO</div>
            <div className="text-3xl font-extrabold text-red-600 my-1">{returnedBhu}</div>
            <div className="text-xs font-bold text-red-600 flex items-center gap-1">Clarification Sought →</div>
          </div>

          {/* Card 5 */}
          <div
            onClick={() => onNavigate('bhuBharatiTab', { status: 'Returned from Collectorate' })}
            className="bg-white border border-slate-200 border-l-[6px] border-l-rose-600 rounded-xl p-4 cursor-pointer shadow-xs hover:shadow-md hover:-translate-y-1 transition"
          >
            <div className="text-[11px] font-extrabold text-rose-800 uppercase">RETURNED FROM COLLECTORATE</div>
            <div className="text-3xl font-extrabold text-rose-600 my-1">{returnedCollBhu}</div>
            <div className="text-xs font-bold text-rose-600 flex items-center gap-1">Re-examination Required →</div>
          </div>

          {/* Card 6 */}
          <div
            onClick={() => onNavigate('bhuBharatiTab', { status: 'Completed' })}
            className="bg-white border border-slate-200 border-l-[6px] border-l-emerald-600 rounded-xl p-4 cursor-pointer shadow-xs hover:shadow-md hover:-translate-y-1 transition"
          >
            <div className="text-[11px] font-extrabold text-emerald-800 uppercase">DISPOSED / COMPLETED</div>
            <div className="text-3xl font-extrabold text-emerald-600 my-1">{completedBhu}</div>
            <div className="text-xs font-bold text-emerald-700 flex items-center gap-1">Final Orders Issued →</div>
          </div>
        </div>
      </div>

      {/* TAPAL REGISTER DASHBOARD METRICS */}
      <div className="bg-white border border-slate-200 border-t-4 border-t-amber-500 rounded-2xl p-5 md:p-6 shadow-sm">
        <div className="flex flex-wrap justify-between items-center gap-3 border-b border-slate-100 pb-4 mb-5">
          <div className="flex items-center gap-2 text-lg font-black text-slate-900">
            <Mail className="w-5 h-5 text-amber-600" />
            <span>Tapal Register Dashboard (Inward &amp; Outward Correspondence)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
              Official Tapals &amp; Despatches
            </span>
            <button
              onClick={onNewInward}
              className="bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-extrabold px-3 py-1.5 rounded-lg flex items-center gap-1 shadow-sm transition cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>New Inward</span>
            </button>
            <button
              onClick={onNewOutward}
              className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 shadow-sm transition cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Outward</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div
            onClick={() => onNavigate('tapalTab', { type: 'inward', status: '' })}
            className="bg-white border border-slate-200 border-l-[6px] border-l-blue-600 rounded-xl p-4 cursor-pointer shadow-xs hover:shadow-md hover:-translate-y-1 transition"
          >
            <div className="text-[11px] font-extrabold text-blue-800 uppercase">TOTAL INWARD TAPALS</div>
            <div className="text-3xl font-extrabold text-blue-900 my-1">{totalInward}</div>
            <div className="text-xs font-bold text-blue-600 flex items-center gap-1">All Inward Letters →</div>
          </div>

          <div
            onClick={() => onNavigate('tapalTab', { type: 'inward', status: 'Under Scrutiny' })}
            className="bg-white border border-slate-200 border-l-[6px] border-l-amber-600 rounded-xl p-4 cursor-pointer shadow-xs hover:shadow-md hover:-translate-y-1 transition"
          >
            <div className="text-[11px] font-extrabold text-amber-800 uppercase">UNDER SCRUTINY (INWARD)</div>
            <div className="text-3xl font-extrabold text-amber-600 my-1">{scrutinyInward}</div>
            <div className="text-xs font-bold text-amber-700 flex items-center gap-1">Initial Verification →</div>
          </div>

          <div
            onClick={() => onNavigate('tapalTab', { type: 'inward', status: 'Disposed' })}
            className="bg-white border border-slate-200 border-l-[6px] border-l-emerald-600 rounded-xl p-4 cursor-pointer shadow-xs hover:shadow-md hover:-translate-y-1 transition"
          >
            <div className="text-[11px] font-extrabold text-emerald-800 uppercase">DISPOSED INWARDS</div>
            <div className="text-3xl font-extrabold text-emerald-600 my-1">{disposedInward}</div>
            <div className="text-xs font-bold text-emerald-700 flex items-center gap-1">Action Completed →</div>
          </div>

          <div
            onClick={() => onNavigate('tapalTab', { type: 'outward', sentTo: 'Forwarded to MRO' })}
            className="bg-white border border-slate-200 border-l-[6px] border-l-sky-600 rounded-xl p-4 cursor-pointer shadow-xs hover:shadow-md hover:-translate-y-1 transition"
          >
            <div className="text-[11px] font-extrabold text-sky-800 uppercase">FORWARDED TO MRO (OUTWARD)</div>
            <div className="text-3xl font-extrabold text-sky-600 my-1">{outwardToMro}</div>
            <div className="text-xs font-bold text-sky-600 flex items-center gap-1">Outward to Tahsildars →</div>
          </div>

          <div
            onClick={() => onNavigate('tapalTab', { type: 'outward', sentTo: 'Forwarded to Collectorate' })}
            className="bg-white border border-slate-200 border-l-[6px] border-l-purple-600 rounded-xl p-4 cursor-pointer shadow-xs hover:shadow-md hover:-translate-y-1 transition"
          >
            <div className="text-[11px] font-extrabold text-purple-800 uppercase">FORWARDED TO COLLECTORATE (OUTWARD)</div>
            <div className="text-3xl font-extrabold text-purple-600 my-1">{outwardToCollectorate}</div>
            <div className="text-xs font-bold text-purple-700 flex items-center gap-1">Outward to IDOC →</div>
          </div>

          <div
            onClick={() => onNavigate('tapalTab', { type: 'outward' })}
            className="bg-white border border-slate-200 border-l-[6px] border-l-rose-600 rounded-xl p-4 cursor-pointer shadow-xs hover:shadow-md hover:-translate-y-1 transition"
          >
            <div className="text-[11px] font-extrabold text-rose-800 uppercase">TOTAL OUTWARD DESPATCHES</div>
            <div className="text-3xl font-extrabold text-rose-600 my-1">{totalOutward}</div>
            <div className="text-xs font-bold text-rose-600 flex items-center gap-1">All Despatched Letters →</div>
          </div>
        </div>
      </div>
    </div>
  );
};
