import React, { useState } from 'react';
import { Users, Package, TrendingUp, Check, Copy } from 'lucide-react';
import { SummaryStats } from '../types';

interface StatsBarProps {
  stats: SummaryStats;
  rate: number;
  currency: string;
  onCopySummary: () => void;
}

export const StatsBar: React.FC<StatsBarProps> = ({
  stats,
  rate,
  currency,
  onCopySummary,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    onCopySummary();
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 my-5">
      {/* Total Clients Card */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs hover:shadow-xs transition-all">
        <div className="flex items-center justify-between text-slate-500 mb-1">
          <span className="text-xs font-bold uppercase tracking-wider">
            Active Clients
          </span>
          <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <Users className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            {stats.totalClients}
          </span>
          <span className="text-xs font-semibold text-slate-400">clients</span>
        </div>
      </div>

      {/* Total SMS Card */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs hover:shadow-xs transition-all">
        <div className="flex items-center justify-between text-slate-500 mb-1">
          <span className="text-xs font-bold uppercase tracking-wider">
            Total SMS
          </span>
          <div className="w-7 h-7 rounded-lg bg-sky-50 dark:bg-sky-950/50 text-sky-600 dark:text-sky-400 flex items-center justify-center">
            <Package className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl sm:text-3xl font-black text-sky-600 dark:text-sky-400">
            {stats.totalSms.toLocaleString()}
          </span>
          <span className="text-xs font-semibold text-slate-400">SMS</span>
        </div>
      </div>

      {/* Rate Applied Card */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs hover:shadow-xs transition-all">
        <div className="flex items-center justify-between text-slate-500 mb-1">
          <span className="text-xs font-bold uppercase tracking-wider">
            Rate Per SMS
          </span>
          <div className="w-7 h-7 rounded-lg bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <TrendingUp className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline gap-1">
          <span className="text-2xl sm:text-3xl font-black text-slate-800 dark:text-slate-100">
            {rate}
          </span>
          <span className="text-xs font-bold text-slate-400">{currency}</span>
        </div>
      </div>

      {/* Total Amount Card */}
      <div className="bg-gradient-to-br from-[#002a4e] to-blue-900 p-4 rounded-2xl text-white shadow-md shadow-blue-950/20 relative overflow-hidden border border-blue-950">
        <div className="relative z-10 flex items-center justify-between mb-1">
          <span className="text-xs font-bold uppercase tracking-wider text-amber-300">
            Total Gross Amount
          </span>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1 bg-white/10 hover:bg-white/20 text-white px-2 py-0.5 rounded text-[11px] font-semibold transition-colors cursor-pointer"
            title="Copy Total Summary"
          >
            {copied ? <Check className="w-3 h-3 text-amber-300" /> : <Copy className="w-3 h-3" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
        </div>
        <div className="relative z-10 flex items-baseline gap-1.5">
          <span className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            {stats.totalAmount.toLocaleString(undefined, {
              minimumFractionDigits: 1,
              maximumFractionDigits: 1,
            })}
          </span>
          <span className="text-sm font-bold text-amber-300">{currency}</span>
        </div>
        {/* Subtle decorative glow */}
        <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-amber-400/10 rounded-full blur-xs pointer-events-none" />
      </div>
    </div>
  );
};
