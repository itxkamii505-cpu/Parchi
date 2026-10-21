import React, { useState } from 'react';
import {
  Users,
  Package,
  Coins,
  Layers,
  ArrowUpRight,
  Upload,
  FileSpreadsheet,
  Calendar,
  History,
  Crown,
  ChevronRight,
  Calculator,
  Sliders,
  Lock,
  Check,
  X,
  ShieldCheck,
} from 'lucide-react';
import { ClientRecord, Panel, SummaryStats } from '../types';

interface DashboardViewProps {
  clients: ClientRecord[];
  stats: SummaryStats;
  rate: number;
  setRate: (rate: number) => void;
  currency: string;
  setCurrency: (c: string) => void;
  batchName: string;
  setBatchName: (name: string) => void;
  startDate: string;
  setStartDate: (d: string) => void;
  endDate: string;
  setEndDate: (d: string) => void;
  panels: Panel[];
  historyCount: number;
  onOpenImport: () => void;
  onNavigateToTable: () => void;
  onNavigateToParchiyan: () => void;
  onNavigateToHistory: () => void;
  onExportExcel: () => void;
  onNavigateToSettings?: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  clients,
  stats,
  rate,
  setRate,
  currency,
  setCurrency,
  batchName,
  setBatchName,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  panels,
  historyCount,
  onOpenImport,
  onNavigateToTable,
  onNavigateToParchiyan,
  onNavigateToHistory,
  onExportExcel,
  onNavigateToSettings,
}) => {
  const ratePresets = [2.0, 2.3, 2.5, 3.0];
  const formattedDate =
    startDate && endDate ? `${startDate} to ${endDate}` : startDate || endDate || 'Weekly Period';

  // Explicit Save Rate Modal State (Protects against accidental live rate boost)
  const [isRateModalOpen, setIsRateModalOpen] = useState(false);
  const [draftRate, setDraftRate] = useState<number>(rate);
  const [draftCurrency, setDraftCurrency] = useState<string>(currency);

  const handleOpenRateModal = () => {
    setDraftRate(rate);
    setDraftCurrency(currency);
    setIsRateModalOpen(true);
  };

  const handleSaveRate = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (draftRate > 0) {
      setRate(draftRate);
      setCurrency(draftCurrency);
    }
    setIsRateModalOpen(false);
  };

  const handleCancelRate = () => {
    // Revert draft changes so active rate is preserved untouched!
    setDraftRate(rate);
    setDraftCurrency(currency);
    setIsRateModalOpen(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* SECTION 1: REPORT CONTROLS */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-2xs space-y-4">
        {/* Top line: Batch Name & Date to Date */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-lg bg-[#002a4e] text-amber-300 text-xs font-black uppercase tracking-wider">
              Report
            </span>
            <input
              type="text"
              value={batchName}
              onChange={(e) => setBatchName(e.target.value)}
              placeholder="Report Name"
              className="text-base sm:text-lg font-black text-slate-900 dark:text-white bg-transparent border-b border-transparent hover:border-slate-300 dark:hover:border-slate-700 focus:border-sky-500 focus:outline-hidden transition-all max-w-sm"
              title="Click to edit report title"
            />
          </div>

          {/* Date to Date Picker */}
          <div className="flex flex-wrap items-center gap-2 bg-slate-50 dark:bg-slate-800/80 p-1.5 sm:p-2 rounded-xl border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300">
              <Calendar className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
              <span>Period:</span>
            </div>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="text-xs font-semibold px-2 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-100 cursor-pointer"
            />
            <span className="text-xs text-slate-400 font-bold">to</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="text-xs font-semibold px-2 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-100 cursor-pointer"
            />
          </div>
        </div>

        {/* Bottom line: Rate per Product & Actions */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 flex-wrap">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              <Calculator className="w-4 h-4 text-sky-600" />
              <span>Rate:</span>
            </div>

            {/* Rate Input */}
            <div className="relative">
              <input
                type="number"
                step="0.05"
                min="0.1"
                value={rate}
                onChange={(e) => setRate(parseFloat(e.target.value) || 0)}
                className="w-24 px-3 py-1 bg-slate-50 dark:bg-slate-800 border-2 border-sky-500 rounded-xl text-sm font-extrabold text-slate-900 dark:text-white focus:outline-hidden"
              />
              <span className="absolute right-2 top-1 text-xs font-bold text-slate-400 pointer-events-none">
                {currency}
              </span>
            </div>

            {/* Presets */}
            <div className="flex items-center gap-1">
              {ratePresets.map((r) => {
                const isActive = Math.abs(rate - r) < 0.001;
                return (
                  <button
                    key={r}
                    onClick={() => setRate(r)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      isActive
                        ? 'bg-[#002a4e] text-white shadow-xs'
                        : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    {r}
                  </button>
                );
              })}
            </div>

            {/* Currency selector */}
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="text-xs font-bold bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2 py-1.5 rounded-lg text-slate-700 dark:text-slate-300 cursor-pointer focus:outline-hidden"
            >
              <option value="PKR">PKR (₨)</option>
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
              <option value="GBP">GBP (£)</option>
            </select>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={onOpenImport}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black transition-all shadow-xs cursor-pointer"
            >
              <Upload className="w-4 h-4" />
              <span>Import</span>
            </button>

            <button
              onClick={onExportExcel}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Export</span>
            </button>
          </div>
        </div>
      </div>

      {/* SECTION 2: KPI CARDS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Clients */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Clients</span>
            <div className="p-2 rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-2">
            {stats.totalClients}
          </p>
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500">
            <span>Total</span>
            <button
              onClick={onNavigateToTable}
              className="text-sky-600 dark:text-sky-400 font-bold hover:underline flex items-center gap-0.5 cursor-pointer"
            >
              <span>Table</span>
              <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Total SMS Volume */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Total SMS</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-2">
            {stats.totalSms.toLocaleString()}
          </p>
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500">
            <span>Avg: ~{stats.averageSms} / client</span>
            <span className="font-semibold text-emerald-600 dark:text-emerald-400">Calculated</span>
          </div>
        </div>

        {/* Total Gross Amount */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Total Amount</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <Coins className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-2">
            {stats.totalAmount.toLocaleString(undefined, {
              minimumFractionDigits: 1,
              maximumFractionDigits: 1,
            })}{' '}
            <span className="text-xs font-bold text-slate-500">{currency}</span>
          </p>
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500">
            <span>At {rate} {currency}</span>
            <button
              onClick={onNavigateToParchiyan}
              className="text-amber-600 dark:text-amber-400 font-bold hover:underline flex items-center gap-0.5 cursor-pointer"
            >
              <span>Slips</span>
              <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Panels & History Stats */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Panels</span>
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-2">
            {panels.length}{' '}
            <span className="text-xs font-bold text-slate-500">Active</span>
          </p>
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500">
            <span>{historyCount} History</span>
            <button
              onClick={onNavigateToHistory}
              className="text-purple-600 dark:text-purple-400 font-bold hover:underline flex items-center gap-0.5 cursor-pointer"
            >
              <span>History</span>
              <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* SECTION 4: PANELS BREAKDOWN & TOP HIGHLIGHTS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: Active Panels Breakdown */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <Layers className="w-4 h-4 text-sky-600" />
                <span>Active Panels Distribution</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                SMS volume aggregated per panel across all clients
              </p>
            </div>
            <button
              onClick={onNavigateToTable}
              className="text-xs font-bold text-sky-600 dark:text-sky-400 hover:underline cursor-pointer"
            >
              Manage Panels
            </button>
          </div>

          <div className="space-y-3">
            {panels.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">
                No custom panels created yet. Add panels in the table view or during list import.
              </p>
            ) : (
              panels.map((p) => {
                const panelTotal = clients.reduce(
                  (sum, c) => sum + ((c.panels && c.panels[p.id]) || 0),
                  0
                );
                const percentage =
                  stats.totalSms > 0 ? ((panelTotal / stats.totalSms) * 100).toFixed(1) : '0';

                return (
                  <div
                    key={p.id}
                    className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800"
                  >
                    <div className="flex items-center justify-between text-xs font-bold mb-1.5">
                      <span className="text-slate-800 dark:text-slate-200">{p.name}</span>
                      <span className="text-sky-700 dark:text-sky-400">
                        {panelTotal.toLocaleString()} SMS ({percentage}%)
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-sky-500 to-[#002a4e] rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(100, Math.max(2, Number(percentage)))}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right: Quick Action Hub & Highlights */}
        <div className="lg:col-span-5 space-y-4">
          {/* Top Client Card */}
          {stats.highestClient && (
            <div className="bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/30 rounded-2xl p-5 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-700 dark:text-amber-400 flex items-center gap-1">
                  <Crown className="w-3.5 h-3.5" />
                  Top Volume Client
                </span>
                <span className="text-xs font-black text-amber-700 dark:text-amber-400">
                  {stats.highestClient.sms} SMS
                </span>
              </div>
              <h4 className="text-base font-black text-slate-900 dark:text-white mt-1.5 truncate">
                {stats.highestClient.name}
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Billed: {(stats.highestClient.sms * rate).toFixed(1)} {currency}
              </p>
            </div>
          )}

          {/* Quick Nav Cards */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-2xs space-y-2">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
              Shortcuts
            </h4>

            <button
              onClick={onNavigateToParchiyan}
              className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 hover:bg-sky-50 dark:hover:bg-slate-800 text-left transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <span className="text-lg">🏛️</span>
                <div>
                  <p className="text-xs font-bold text-slate-900 dark:text-white">
                    Slips
                  </p>
                  <p className="text-[10px] text-slate-500">
                    Images and receipts
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </button>

            <button
              onClick={onNavigateToHistory}
              className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 hover:bg-purple-50 dark:hover:bg-slate-800 text-left transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <History className="w-4 h-4 text-purple-600" />
                <div>
                  <p className="text-xs font-bold text-slate-900 dark:text-white">
                    History
                  </p>
                  <p className="text-[10px] text-slate-500">
                    {historyCount} records
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
