import React, { useState, useEffect } from 'react';
import { StaffUser } from '../types';
import { LogIn, LogOut, Clock, ExternalLink } from 'lucide-react';

interface HeaderProps {
  currentUser: StaffUser | null;
  onOpenLogin: () => void;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({ currentUser, onOpenLogin, onLogout }) => {
  const [timeStr, setTimeStr] = useState<string>('');
  const [dateStr, setDateStr] = useState<string>('');

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      let hours = now.getHours();
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const seconds = String(now.getSeconds()).padStart(2, '0');
      const ampm = hours >= 12 ? 'pm' : 'am';
      hours = hours % 12;
      hours = hours ? hours : 12;
      const hoursStr = String(hours).padStart(2, '0');

      setTimeStr(`${hoursStr}:${minutes}:${seconds} ${ampm}`);

      const day = String(now.getDate()).padStart(2, '0');
      const monthNames = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
      ];
      const month = monthNames[now.getMonth()];
      const year = now.getFullYear();
      setDateStr(`${day} ${month} ${year}`);
    };

    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="bg-[#061122] border-b-4 border-amber-500 px-4 md:px-8 py-3.5 flex flex-wrap justify-between items-center gap-4 shadow-lg select-none">
      {/* CENTER TITLE */}
      <div className="text-left flex-1 min-w-[280px]">
        <div className="flex items-center gap-2 leading-none mb-1">
          <span className="text-[11px] md:text-xs font-extrabold text-amber-500 tracking-wider uppercase">
            GOVERNMENT OF TELANGANA
          </span>
          <span className="text-slate-500 text-xs">•</span>
          <span className="text-[11px] md:text-xs font-bold text-emerald-400">
            Revenue Department
          </span>
        </div>
        <h1 className="text-base md:text-2xl font-black text-white tracking-tight drop-shadow-sm">
          Revenue Divisional Office, Huzurnagar
        </h1>
        <div className="flex items-center gap-2 mt-1">
          <span className="bg-blue-700 text-white text-[10px] md:text-xs font-bold px-2 py-0.5 rounded tracking-wide uppercase">
            D SECTION
          </span>
          <span className="text-xs md:text-sm font-medium text-slate-300">
            File Tracking &amp; Information Management System
          </span>
        </div>
      </div>

      {/* RIGHT SIDE: CLOCK & LOGIN BUTTON */}
      <div className="flex items-center gap-2.5">
        {/* Open App in New Tab (useful for native printing outside iframe) */}
        <a
          href={window.location.href}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-[#091830] hover:bg-[#0f284e] border border-blue-500/30 text-slate-200 hover:text-white rounded-lg px-2.5 py-2 flex items-center gap-1.5 text-xs font-bold transition shadow-xs cursor-pointer"
          title="Open entire system in full new tab for direct native browser printing"
        >
          <ExternalLink className="w-3.5 h-3.5 text-amber-400" />
          <span className="hidden sm:inline">New Tab</span>
        </a>

        {/* Digital Clock */}
        <div className="bg-[#091830] border border-blue-500/30 rounded-lg px-3 py-1.5 flex items-center gap-2.5 shadow-md">
          <Clock className="w-5 h-5 text-amber-500" />
          <div className="flex flex-col items-end">
            <div className="text-[11px] font-semibold text-white tracking-wide">{dateStr}</div>
            <div className="font-mono text-sm md:text-base font-extrabold text-amber-400 leading-tight">
              {timeStr}
            </div>
          </div>
        </div>

        {/* Auth status / Login Button */}
        {currentUser ? (
          <div className="flex items-center gap-2 bg-slate-800/80 border border-slate-700 rounded-lg px-3 py-1.5">
            <div className="text-right">
              <div className="text-xs font-bold text-amber-300">{currentUser.name}</div>
              <div className="text-[10px] text-emerald-400 font-semibold uppercase">{currentUser.role} ({currentUser.cadre})</div>
            </div>
            <button
              onClick={onLogout}
              className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold px-2 py-1 rounded transition-colors flex items-center gap-1 cursor-pointer"
              title="Sign Out"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
          </div>
        ) : (
          <button
            onClick={onOpenLogin}
            className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold px-3.5 py-2 rounded-lg text-xs md:text-sm flex items-center gap-1.5 shadow-md transition transform hover:-translate-y-0.5 cursor-pointer"
          >
            <LogIn className="w-4 h-4" />
            <span>LOGIN</span>
          </button>
        )}
      </div>
    </header>
  );
};
