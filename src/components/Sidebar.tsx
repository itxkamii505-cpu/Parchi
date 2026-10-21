import React from 'react';
import {
  LayoutDashboard,
  TableProperties,
  ScrollText,
  History,
  Settings,
  LogOut,
  Sun,
  Moon,
  X,
  Shield,
} from 'lucide-react';
import { ActiveTab, ThemeMode } from '../types';

interface SidebarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  theme: ThemeMode;
  onToggleTheme: () => void;
  onLogout: () => void;
  clientsCount: number;
  historyCount: number;
  username?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  isOpen,
  setIsOpen,
  theme,
  onToggleTheme,
  onLogout,
  clientsCount,
  historyCount,
  username = 'Admin',
}) => {
  const navItems: { id: ActiveTab; label: string; icon: React.ReactNode; badge?: number }[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <LayoutDashboard className="w-4 h-4" />,
    },
    {
      id: 'table',
      label: 'Reports',
      icon: <TableProperties className="w-4 h-4" />,
      badge: clientsCount,
    },
    {
      id: 'parchiyan',
      label: 'Slips',
      icon: <ScrollText className="w-4 h-4 text-amber-500" />,
      badge: clientsCount,
    },
    {
      id: 'history',
      label: 'History',
      icon: <History className="w-4 h-4 text-emerald-500" />,
      badge: historyCount > 0 ? historyCount : undefined,
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: <Settings className="w-4 h-4" />,
    },
  ];

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs md:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-60 transition-transform duration-300 ease-in-out md:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } ${
          theme === 'dark'
            ? 'bg-slate-900 border-slate-800 text-slate-200'
            : 'bg-white border-slate-200 text-slate-800'
        } border-r flex flex-col`}
      >
        {/* Top Logo & Brand */}
        <div className="p-3.5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#002a4e] to-blue-900 flex items-center justify-center text-amber-400 shadow-md">
              <span className="text-base">🏛️</span>
            </div>
            <div>
              <h2 className="text-xs font-black tracking-tight text-slate-900 dark:text-white leading-tight">
                KBMAX
              </h2>
              <span className="text-[9px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                Billing Portal
              </span>
            </div>
          </div>

          <button
            onClick={() => setIsOpen(false)}
            className="md:hidden p-1 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="p-2.5 space-y-1 flex-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#002a4e] text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className={isActive ? 'text-amber-300' : ''}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </div>

                {item.badge !== undefined && (
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Bottom Utility Controls: Theme Toggle & Logout */}
        <div className="p-2.5 border-t border-slate-200 dark:border-slate-800 space-y-2">
          {/* Day / Night Theme Switcher */}
          <button
            onClick={onToggleTheme}
            className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
              theme === 'dark'
                ? 'bg-slate-800 border-slate-700 text-amber-400 hover:bg-slate-700'
                : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <div className="flex items-center gap-2">
              {theme === 'dark' ? <Moon className="w-3.5 h-3.5" /> : <Sun className="w-3.5 h-3.5 text-amber-500" />}
              <span>{theme === 'dark' ? 'Dark Mode' : 'Light Mode'}</span>
            </div>
            <span className="text-[10px] opacity-70">Switch</span>
          </button>

          {/* Secure User Profile & Logout */}
          <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-6 h-6 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-xs shrink-0">
                <Shield className="w-3 h-3" />
              </div>
              <div className="text-left min-w-0">
                <p className="text-[11px] font-bold text-slate-900 dark:text-white leading-none truncate">
                  {username}
                </p>
                <span className="text-[9px] text-emerald-600 dark:text-emerald-400 font-medium">
                  Active
                </span>
              </div>
            </div>

            <button
              onClick={onLogout}
              className="p-1 rounded text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors cursor-pointer shrink-0"
              title="Logout"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
