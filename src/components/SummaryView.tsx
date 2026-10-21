import React, { useState } from 'react';
import {
  Copy,
  Check,
  Share2,
  FileSpreadsheet,
  Calculator,
  Crown,
  Package,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { ClientRecord, LanguageMode, Panel, SummaryStats } from '../types';
import { generateFullReportText, exportToExcel } from '../utils/export';

interface SummaryViewProps {
  clients: ClientRecord[];
  stats: SummaryStats;
  rate: number;
  currency: string;
  batchName: string;
  language: LanguageMode;
  setLanguage: (lang: LanguageMode) => void;
  startDate: string;
  endDate: string;
  panels: Panel[];
  showRate: boolean;
}

export const SummaryView: React.FC<SummaryViewProps> = ({
  clients,
  stats,
  rate,
  currency,
  batchName,
  language,
  startDate,
  endDate,
  panels,
  showRate,
}) => {
  const [copied, setCopied] = useState(false);

  const reportText = generateFullReportText(
    clients,
    rate,
    currency,
    language,
    batchName,
    startDate,
    endDate,
    panels,
    showRate
  );

  const handleCopy = () => {
    navigator.clipboard.writeText(reportText);
    setCopied(true);
    confetti({
      particleCount: 40,
      spread: 60,
      origin: { y: 0.8 },
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleWhatsApp = () => {
    const url = `https://wa.me/?text=${encodeURIComponent(reportText)}`;
    window.open(url, '_blank');
  };

  const compareRates = [2.0, 2.3, 2.5, 3.0];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 animate-in fade-in duration-200">
      {/* Left Column: Formatted WhatsApp Ready Copy Box */}
      <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-extrabold text-slate-800 dark:text-white flex items-center gap-1.5">
              <Package className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>KBMAX SMS Summary Text</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Formatted with Date Range, Panels breakdown & Total Amount
            </p>
          </div>
        </div>

        {/* Textarea / Output Preview */}
        <div className="p-4 flex-1">
          <textarea
            readOnly
            value={reportText}
            rows={14}
            className="w-full h-80 p-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl font-mono text-xs text-slate-800 dark:text-slate-100 leading-relaxed resize-none focus:outline-hidden focus:bg-white dark:focus:bg-slate-800"
          />
        </div>

        {/* Action Buttons */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            Total {clients.length} clients included in this summary
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={handleWhatsApp}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 text-emerald-700 dark:text-emerald-300 text-xs font-bold border border-emerald-200 dark:border-emerald-800 transition-colors cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Send via WhatsApp</span>
            </button>

            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#002a4e] hover:bg-blue-900 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-amber-300" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied to Clipboard!' : 'Copy Full Report Text'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Right Column: Rate Analysis & Client Insights */}
      <div className="lg:col-span-5 space-y-4">
        {/* Rate Comparison Card */}
        {showRate && (
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Calculator className="w-4 h-4 text-sky-600" />
                <span>Multi-Rate Comparison</span>
              </h4>
              <span className="text-[11px] font-semibold text-slate-400">Total: {stats.totalSms} SMS</span>
            </div>

            <div className="space-y-2">
              {compareRates.map((r) => {
                const amount = stats.totalSms * r;
                const isCurrent = Math.abs(rate - r) < 0.001;

                return (
                  <div
                    key={r}
                    className={`p-2.5 rounded-xl border flex items-center justify-between transition-all ${
                      isCurrent
                        ? 'bg-sky-50/80 dark:bg-sky-950/40 border-sky-300 dark:border-sky-800 ring-1 ring-sky-400'
                        : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs font-extrabold px-2 py-0.5 rounded ${
                          isCurrent
                            ? 'bg-[#002a4e] text-white'
                            : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {r} {currency}
                      </span>
                      <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                        {isCurrent ? '(Active Rate)' : 'rate model'}
                      </span>
                    </div>
                    <span className="text-sm font-black text-slate-900 dark:text-white">
                      {amount.toLocaleString(undefined, {
                        minimumFractionDigits: 1,
                        maximumFractionDigits: 1,
                      })}{' '}
                      {currency}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Top Performer & Highlights */}
        {stats.highestClient && (
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs">
            <h4 className="text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Crown className="w-4 h-4 text-amber-500" />
              <span>Top & Lowest Client Highlights</span>
            </h4>

            <div className="grid grid-cols-2 gap-3">
              {/* Highest */}
              <div className="bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 p-3 rounded-xl">
                <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400 uppercase block">
                  Top Volume Client
                </span>
                <p className="font-extrabold text-xs text-slate-900 dark:text-white truncate mt-0.5" title={stats.highestClient.name}>
                  {stats.highestClient.name}
                </p>
                <div className="flex items-baseline justify-between mt-1">
                  <span className="text-sm font-black text-amber-800 dark:text-amber-300">
                    {stats.highestClient.sms} SMS
                  </span>
                  <span className="text-xs font-bold text-slate-600 dark:text-slate-400">
                    {(stats.highestClient.sms * rate).toFixed(1)} {currency}
                  </span>
                </div>
              </div>

              {/* Lowest */}
              {stats.lowestClient && (
                <div className="bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 p-3 rounded-xl">
                  <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase block">
                    Lowest Client
                  </span>
                  <p className="font-extrabold text-xs text-slate-900 dark:text-white truncate mt-0.5" title={stats.lowestClient.name}>
                    {stats.lowestClient.name}
                  </p>
                  <div className="flex items-baseline justify-between mt-1">
                    <span className="text-sm font-black text-slate-700 dark:text-slate-300">
                      {stats.lowestClient.sms} SMS
                    </span>
                    <span className="text-xs font-bold text-slate-600 dark:text-slate-400">
                      {(stats.lowestClient.sms * rate).toFixed(1)} {currency}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Quick Export Card */}
        <div className="bg-gradient-to-br from-[#002a4e] to-slate-900 text-white p-5 rounded-2xl shadow-xs border border-blue-950">
          <div className="flex items-center gap-2 mb-2">
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-300">
              KBMAX Weekly Excel Export
            </span>
          </div>
          <p className="text-xs text-slate-300 mb-3">
            Download standard Excel sheet (.xlsx) including Date Range, Panels columns, SMS counts and sums.
          </p>
          <button
            onClick={() =>
              exportToExcel(
                clients,
                rate,
                currency,
                batchName,
                startDate,
                endDate,
                panels,
                showRate
              )
            }
            className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-sm"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Download {batchName}.xlsx</span>
          </button>
        </div>
      </div>
    </div>
  );
};
