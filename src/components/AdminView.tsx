import React from 'react';
import { StaffUser } from '../types';
import { UserPlus, Printer } from 'lucide-react';
import { printTableReport } from '../utils/printReport';

interface AdminViewProps {
  staff: StaffUser[];
  onOpenAddUser: () => void;
  onToggleUserStatus: (id: number) => void;
}

export const AdminView: React.FC<AdminViewProps> = ({
  staff,
  onOpenAddUser,
  onToggleUserStatus,
}) => {
  const handlePrintStaff = () => {
    const tableHeader = `
      <tr>
        <th style="width: 40px; background: #164875; color: #fff;">S.No</th>
        <th style="background: #164875; color: #fff;">Staff Name</th>
        <th style="background: #164875; color: #fff;">Cadre / Designation</th>
        <th style="background: #164875; color: #fff;">Assigned Role</th>
        <th style="background: #164875; color: #fff;">Account Status</th>
      </tr>
    `;

    const tableRows = staff.map((u, i) => `
      <tr>
        <td style="text-align: center; font-weight: bold; border: 1px solid #94a3b8; padding: 6px;">${i + 1}</td>
        <td style="font-weight: bold; border: 1px solid #94a3b8; padding: 6px;">${u.name}</td>
        <td style="border: 1px solid #94a3b8; padding: 6px;">${u.cadre}</td>
        <td style="border: 1px solid #94a3b8; padding: 6px;">${u.role}</td>
        <td style="text-align: center; font-weight: bold; border: 1px solid #94a3b8; padding: 6px;">
          ${u.active ? 'ACTIVE' : 'DISABLED'}
        </td>
      </tr>
    `).join('');

    const tableHtml = `
      <table style="width: 100%; border-collapse: collapse; font-size: 11px;">
        <thead>${tableHeader}</thead>
        <tbody>${tableRows}</tbody>
      </table>
    `;

    printTableReport(tableHtml, {
      title: 'Staff & Section Officers Directory',
      subtitle: 'Revenue Divisional Office, Huzurnagar • Suryapet District',
      period: 'D Section Administration',
      landscape: false,
    });
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 md:p-6 shadow-xs space-y-4">
      <div className="flex flex-wrap justify-between items-center gap-3 border-b border-slate-100 pb-4">
        <div>
          <h2 className="text-xl font-black text-slate-900">Staff &amp; Section Administration</h2>
          <p className="text-xs font-semibold text-slate-500">
            Manage D Section officer accounts, designations, roles, and access controls
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrintStaff}
            className="bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold px-3 py-2 rounded-lg flex items-center gap-1.5 shadow-sm transition cursor-pointer"
            title="Print Staff Directory"
          >
            <Printer className="w-3.5 h-3.5 text-sky-300" />
            <span>Print Staff Directory</span>
          </button>
          <button
            onClick={onOpenAddUser}
            className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-3 py-2 rounded-lg flex items-center gap-1.5 shadow-sm transition cursor-pointer"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Add Staff Account</span>
          </button>
        </div>
      </div>

      <div className="overflow-x-auto border border-slate-200 rounded-lg">
        <table className="w-full text-xs text-left border-collapse bg-white">
          <thead className="bg-slate-50 text-slate-900 uppercase font-bold border-b border-slate-200 text-[11px]">
            <tr>
              <th className="py-2.5 px-3 border-r border-slate-200">Staff Name</th>
              <th className="py-2.5 px-3 border-r border-slate-200">Cadre / Designation</th>
              <th className="py-2.5 px-3 border-r border-slate-200">Role</th>
              <th className="py-2.5 px-3 border-r border-slate-200">Account Status</th>
              <th className="py-2.5 px-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {staff.map((u) => (
              <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                <td className="py-2.5 px-3 font-bold text-slate-900 border-r border-slate-200">
                  {u.name}
                </td>
                <td className="py-2.5 px-3 text-slate-700 border-r border-slate-200">
                  {u.cadre}
                </td>
                <td className="py-2.5 px-3 border-r border-slate-200">
                  <span className="inline-block px-2 py-0.5 rounded text-[11px] font-bold bg-blue-50 text-blue-800 border border-blue-200">
                    {u.role}
                  </span>
                </td>
                <td className="py-2.5 px-3 border-r border-slate-200">
                  {u.active ? (
                    <span className="inline-block px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                      Active
                    </span>
                  ) : (
                    <span className="inline-block px-2 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-800 border border-rose-200">
                      Disabled
                    </span>
                  )}
                </td>
                <td className="py-2.5 px-3 text-center">
                  <button
                    onClick={() => onToggleUserStatus(u.id)}
                    className={`font-bold px-2.5 py-1 rounded text-[11px] transition cursor-pointer shadow-xs ${
                      u.active
                        ? 'bg-rose-600 hover:bg-rose-700 text-white'
                        : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                    }`}
                  >
                    {u.active ? 'Disable' : 'Enable'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
