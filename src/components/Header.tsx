import React from 'react';
import {
  Menu,
  Sun,
  Moon,
  ShieldCheck,
  LogOut,
} from 'lucide-react';
import { ActiveTab, ThemeMode } from '../types';

interface HeaderProps {
  activeTab: ActiveTab;
  theme: ThemeMode;
  onToggleTheme: () => void;
  onToggleSidebar: () => void;
  onLogout: () => void;
  companyName: string;
  username?: string;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  theme,
  onToggleTheme,
  onToggleSidebar,
  onLogout,
  companyName,
  username = 'Admin',
}) => {
  const getTabTitle = () => {
    switch (activeTab) {
      case 'dashboard':
        return 'Dashboard';
      case 'table':
        return 'Reports';
      case 'parchiyan':
        return 'Slips';
      case 'history':
        return 'History';
      case 'settings':
        return 'Settings';
      default:
        return 'Portal';
    }
  };

  return (
    <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-30 shadow-2xs transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          {/* Left: Mobile hamburger & Current View Breadcrumb */}
          <div className="flex items-center gap-3">
            <button
              onClick={onToggleSidebar}
              className="md:hidden p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 cursor-pointer"
              title="Open Navigation Menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2">
              <span className="text-base">🏛️</span>
              <div>
                <h2 className="text-sm sm:text-base font-black text-slate-900 dark:text-white leading-tight">
                  {getTabTitle()}
                </h2>
                <p className="text-[10px] text-slate-400 font-medium hidden sm:block">
                  {companyName}
                </p>
              </div>
            </div>
          </div>

          {/* Right: Quick Global Controls (Username, Theme, Logout) */}
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>{username}</span>
            </div>

            <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-[11px] font-bold text-emerald-700 dark:text-emerald-400">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>PIN Protected</span>
            </div>

            {/* Dark / Light Theme Toggle */}
            <button
              onClick={onToggleTheme}
              className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                theme === 'dark'
                  ? 'bg-slate-800 border-slate-700 text-amber-400 hover:bg-slate-700'
                  : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
              }`}
              title="Toggle Light / Dark Mode"
            >
              {theme === 'dark' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4 text-amber-500" />}
            </button>

            {/* Logout Button */}
            <button
              onClick={onLogout}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-red-50 dark:hover:bg-red-950/40 text-slate-600 dark:text-slate-300 hover:text-red-600 dark:hover:text-red-400 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
