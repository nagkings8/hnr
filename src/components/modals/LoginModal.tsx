import React, { useState } from 'react';
import { StaffUser, AdminProfile } from '../../types';
import { 
  X, 
  Lock, 
  UserCheck, 
  ShieldCheck, 
  AlertCircle, 
  ArrowLeft,
  KeyRound,
  Eye,
  EyeOff,
  BookOpen
} from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  staff: StaffUser[];
  adminProfile: AdminProfile;
  onLogin: (user: StaffUser) => void;
  onShowToast: (msg: string) => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  staff,
  adminProfile,
  onLogin,
  onShowToast,
}) => {
  const [role, setRole] = useState<'STAFF' | 'ADMIN'>('STAFF');
  const [selectedStaffId, setSelectedStaffId] = useState<string>(
    staff[0]?.id ? String(staff[0].id) : ''
  );
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  if (!isOpen) return null;

  const activeStaffList = staff.filter((s) => s.active);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (role === 'ADMIN') {
      const expectedAdminPassword = adminProfile.password || 'admin';
      if (password !== expectedAdminPassword) {
        onShowToast('❌ Incorrect Administrator password. Please try again or check security credentials.');
        return;
      }

      onLogin({
        id: adminProfile.id || 999,
        name: adminProfile.name,
        role: 'ADMIN',
        cadre: adminProfile.cadre,
        phone: adminProfile.phone,
        active: true,
      });
      setPassword('');
      onClose();
      onShowToast(`Welcome, ${adminProfile.name}! Signed in with full administrative privileges.`);
    } else {
      const selected = staff.find((s) => String(s.id) === selectedStaffId);
      if (!selected) {
        onShowToast('Please select a valid staff member.');
        return;
      }

      const expectedStaffPassword = selected.password || 'staff';
      if (password !== expectedStaffPassword) {
        onShowToast(`❌ Incorrect password for ${selected.name}. Please contact Administrator to reset.`);
        return;
      }

      onLogin(selected);
      setPassword('');
      onClose();
      onShowToast(`Welcome, ${selected.name}! Signed in successfully.`);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center z-50 p-3">
      <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden transition-all">
        {/* Header */}
        <div className="bg-[#061122] text-white px-5 py-4 flex justify-between items-center border-b-2 border-amber-500">
          <h3 className="font-bold text-sm text-white flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-400">
              <Lock className="w-4 h-4" />
            </div>
            <span>{showForgotPassword ? 'Password Assistance' : 'Official Portal Login'}</span>
          </h3>
          <button 
            onClick={() => {
              setShowForgotPassword(false);
              setPassword('');
              onClose();
            }} 
            className="text-slate-400 hover:text-white transition cursor-pointer p-1 rounded-md hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* FORGOT PASSWORD VIEW - NO PHONE NUMBER AS REQUESTED */}
        {showForgotPassword ? (
          <div className="p-6 space-y-5 text-xs animate-in fade-in duration-200">
            <div className="text-center space-y-2">
              <div className="w-14 h-14 bg-amber-50 border-2 border-amber-200 rounded-2xl flex items-center justify-center text-amber-600 mx-auto shadow-inner">
                <ShieldCheck className="w-7 h-7" />
              </div>
              <h4 className="text-base font-black text-slate-900">
                Contact Administrator
              </h4>
              <p className="text-xs text-amber-800 font-semibold">
                పాస్‌వర్డ్ కొరకు అడ్మిన్‌ను సంప్రదించండి
              </p>
              <p className="text-[12px] text-slate-600 max-w-xs mx-auto leading-relaxed">
                For security and audit protocol, staff passwords cannot be reset automatically. Only the <strong>Revenue Divisional Officer (Administrator)</strong> can reset your credentials.
              </p>
            </div>

            {/* Admin Contact Card - Clean, dignified, NO PHONE NUMBER */}
            <div className="bg-gradient-to-br from-slate-50 via-amber-50/40 to-slate-50 border border-amber-200 rounded-xl p-4 shadow-xs space-y-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#061122] text-amber-400 flex items-center justify-center font-bold text-sm shrink-0 border border-amber-500/30">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-[10px] text-amber-700 font-black uppercase tracking-wider">
                    Authorized Administrator
                  </div>
                  <div className="text-sm font-bold text-slate-950 truncate">
                    {adminProfile.name}
                  </div>
                  <div className="text-[11px] text-slate-500 font-medium truncate">
                    {adminProfile.cadre}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-blue-50/80 border border-blue-200 rounded-lg p-3 text-[11px] text-blue-900 space-y-1">
              <div className="font-bold flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span>Contact Administrator Directly</span>
              </div>
              <p className="text-blue-800">
                Please contact the Administrator in person or through official office communication to reset or update your account password.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowForgotPassword(false)}
              className="w-full bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold py-2.5 rounded-xl transition cursor-pointer flex items-center justify-center gap-2 border border-slate-300"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Login</span>
            </button>
          </div>
        ) : (
          /* STANDARD LOGIN VIEW */
          <form onSubmit={handleSubmit} className="p-5 md:p-6 space-y-4 text-xs">
            {/* Informational banner for public viewers */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-[11px] text-slate-600 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
              <span>
                <strong>Note:</strong> Public viewers do not need to sign in. Records and registers are directly viewable. Authentication is required only for Section Staff &amp; Administrator operations.
              </span>
            </div>

            {/* Role Selection Tabs: Staff or Admin */}
            <div>
              <label className="font-bold text-slate-700 block mb-1.5">Select Account Type</label>
              <div className="grid grid-cols-2 gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200">
                <button
                  type="button"
                  onClick={() => {
                    setRole('STAFF');
                    setPassword('');
                  }}
                  className={`py-2 px-3 rounded-lg font-bold text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    role === 'STAFF'
                      ? 'bg-white text-blue-900 shadow-sm border border-slate-200/80'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <UserCheck className="w-4 h-4 text-blue-600" />
                  <span>Section Staff (సిబ్బంది)</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setRole('ADMIN');
                    setPassword('');
                  }}
                  className={`py-2 px-3 rounded-lg font-bold text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    role === 'ADMIN'
                      ? 'bg-[#061122] text-amber-400 shadow-sm border border-amber-500/40'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <ShieldCheck className="w-4 h-4 text-amber-500" />
                  <span>Administrator (అడ్మిన్)</span>
                </button>
              </div>
            </div>

            {role === 'STAFF' ? (
              /* STAFF SELECTION */
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Select Staff Member <span className="text-rose-500">*</span>
                </label>
                <select
                  required
                  value={selectedStaffId}
                  onChange={(e) => setSelectedStaffId(e.target.value)}
                  className="w-full px-3 py-2.5 border border-slate-300 rounded-xl font-medium focus:border-blue-600 focus:ring-1 focus:ring-blue-600 focus:outline-none bg-white shadow-2xs"
                >
                  {activeStaffList.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} — {s.cadre}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              /* ADMIN ACCOUNT INFO (NO PHONE DISPLAYED) */
              <div className="bg-amber-50/60 border border-amber-200/80 rounded-xl p-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[#061122] text-amber-400 flex items-center justify-center font-bold">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 text-xs">{adminProfile.name}</div>
                    <div className="text-[11px] text-slate-600">{adminProfile.cadre}</div>
                  </div>
                </div>
                <span className="text-[10px] font-black bg-amber-200 text-amber-900 px-2 py-0.5 rounded border border-amber-300 uppercase">
                  Full Access
                </span>
              </div>
            )}

            {/* PASSWORD FIELD (Only for Staff and Admin) */}
            {role !== 'VIEWER' && (
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-bold text-slate-700">
                    Password <span className="text-rose-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowForgotPassword(true)}
                    className="text-[11px] text-blue-600 hover:text-blue-800 font-bold hover:underline cursor-pointer flex items-center gap-1"
                  >
                    <KeyRound className="w-3 h-3 text-amber-600" />
                    <span>Forgot Password?</span>
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder={role === 'ADMIN' ? 'Enter administrator password' : 'Enter staff password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-3 pr-10 py-2.5 border border-slate-300 rounded-xl focus:border-blue-600 focus:ring-1 focus:ring-blue-600 focus:outline-none shadow-2xs text-xs font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-[10px] text-slate-500 mt-1 flex items-center justify-between">
                  <span>Authorized personnel only</span>
                  <span className="text-amber-700 font-medium">Forgot? Click above to contact Admin</span>
                </p>
              </div>
            )}

            {/* SUBMIT BUTTON */}
            <button
              type="submit"
              className={`w-full text-white font-bold py-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 shadow-md hover:shadow-lg hover:-translate-y-0.5 mt-2 text-xs ${
                role === 'VIEWER'
                  ? 'bg-emerald-700 hover:bg-emerald-800'
                  : 'bg-[#134674] hover:bg-[#0f3b63]'
              }`}
            >
              {role === 'VIEWER' ? (
                <>
                  <BookOpen className="w-4 h-4" />
                  <span>Enter as Viewer (Read-Only)</span>
                </>
              ) : (
                <>
                  <UserCheck className="w-4 h-4" />
                  <span>Sign In as {role === 'ADMIN' ? 'Administrator' : 'Staff Member'}</span>
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
