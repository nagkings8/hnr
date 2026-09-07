import React, { useState } from 'react';
import { StaffUser } from '../../types';
import { X, Lock, UserCheck } from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  staff: StaffUser[];
  onLogin: (user: StaffUser) => void;
  onShowToast: (msg: string) => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  staff,
  onLogin,
  onShowToast,
}) => {
  const [role, setRole] = useState<'STAFF' | 'ADMIN'>('STAFF');
  const [selectedStaffId, setSelectedStaffId] = useState<string>(
    staff[0]?.id ? String(staff[0].id) : ''
  );
  const [password, setPassword] = useState<string>('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (role === 'ADMIN') {
      onLogin({
        id: 999,
        name: 'Administrator',
        role: 'ADMIN',
        cadre: 'System Administrator',
        active: true,
      });
      onClose();
      onShowToast('Welcome, Administrator! Signed in with administrative privileges.');
    } else {
      const selected = staff.find((s) => String(s.id) === selectedStaffId);
      if (!selected) {
        onShowToast('Please select a valid staff member.');
        return;
      }
      onLogin(selected);
      onClose();
      onShowToast(`Welcome, ${selected.name}! Signed in successfully.`);
    }
  };

  const activeStaffList = staff.filter((s) => s.active);

  return (
    <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center z-50 p-3">
      <div className="bg-white border border-slate-200 rounded-xl shadow-2xl max-w-sm w-full overflow-hidden">
        <div className="bg-[#061122] text-white px-5 py-3.5 flex justify-between items-center border-b-2 border-amber-500">
          <h3 className="font-bold text-sm text-white flex items-center gap-1.5">
            <Lock className="w-4 h-4 text-amber-500" />
            <span>Official Staff Login</span>
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          <div>
            <label className="font-bold text-slate-700 block mb-1">Select Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as 'STAFF' | 'ADMIN')}
              className="w-full px-3 py-2 border border-slate-300 rounded-md font-bold focus:border-blue-500 focus:outline-none bg-white"
            >
              <option value="STAFF">D Section Staff</option>
              <option value="ADMIN">Administrator</option>
            </select>
          </div>

          {role === 'STAFF' && (
            <div>
              <label className="font-bold text-slate-700 block mb-1">Select Staff Member</label>
              <select
                required
                value={selectedStaffId}
                onChange={(e) => setSelectedStaffId(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-md font-medium focus:border-blue-500 focus:outline-none bg-white"
              >
                {activeStaffList.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.cadre})
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="font-bold text-slate-700 block mb-1">Password</label>
            <input
              type="password"
              required
              placeholder="Enter official password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:border-blue-500 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded-md transition cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
          >
            <UserCheck className="w-4 h-4" />
            <span>Sign In</span>
          </button>
        </form>
      </div>
    </div>
  );
};
