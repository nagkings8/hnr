import React from 'react';
import { LayoutDashboard, FolderOpen, Mail, FileSpreadsheet, Users, Scale } from 'lucide-react';
import { StaffUser } from '../types';

export type ActiveTab = 'dashboardTab' | 'bhuBharatiTab' | 'tapalTab' | 'sadabainamaTab' | 'appealCasesTab' | 'adminTab';

interface NavigationProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  currentUser: StaffUser | null;
}

export const Navigation: React.FC<NavigationProps> = ({ activeTab, onTabChange, currentUser }) => {
  const tabs = [
    { id: 'dashboardTab' as ActiveTab, label: 'Dashboard', icon: LayoutDashboard, color: 'hover:text-blue-700 hover:border-blue-600', activeClass: 'text-blue-700 border-blue-600 bg-blue-50' },
    { id: 'bhuBharatiTab' as ActiveTab, label: 'Bhu Bharati Files', icon: FolderOpen, color: 'hover:text-sky-700 hover:border-sky-600', activeClass: 'text-sky-700 border-sky-600 bg-sky-50' },
    { id: 'tapalTab' as ActiveTab, label: 'Tapal Register', icon: Mail, color: 'hover:text-amber-700 hover:border-amber-600', activeClass: 'text-amber-700 border-amber-600 bg-amber-50' },
    { id: 'sadabainamaTab' as ActiveTab, label: 'Sadabainama', icon: FileSpreadsheet, color: 'hover:text-emerald-700 hover:border-emerald-600', activeClass: 'text-emerald-700 border-emerald-600 bg-emerald-50' },
    { id: 'appealCasesTab' as ActiveTab, label: 'Appeal Cases', icon: Scale, color: 'hover:text-indigo-700 hover:border-indigo-600', activeClass: 'text-indigo-700 border-indigo-600 bg-indigo-50' },
  ];

  if (currentUser?.role === 'ADMIN') {
    tabs.push({
      id: 'adminTab' as ActiveTab,
      label: 'Staff & Section Admin',
      icon: Users,
      color: 'hover:text-purple-700 hover:border-purple-600',
      activeClass: 'text-purple-700 border-purple-600 bg-purple-50'
    });
  }

  return (
    <nav className="bg-white border-b-2 border-slate-200 px-4 md:px-8 flex flex-wrap gap-1.5 shadow-sm">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`px-4 py-3 text-sm font-bold flex items-center gap-2 rounded-t-lg border-b-[3.5px] transition-all cursor-pointer ${
              isActive
                ? `${tab.activeClass} shadow-sm`
                : `text-slate-600 border-transparent hover:bg-slate-50 ${tab.color}`
            }`}
          >
            <Icon className="w-4 h-4" />
            <span>{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
};
