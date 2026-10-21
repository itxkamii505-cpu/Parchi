import React, { useState } from 'react';
import {
  History,
  Search,
  Download,
  Trash2,
  RotateCcw,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { ClientHistoryRecord, Panel, SlipCustomConfig } from '../types';
import { downloadParchiImage, downloadCombinedParchiImage } from '../utils/parchiImage';
import { SlipTemplateId } from '../utils/slipTemplates';
import { naturalCompare } from '../utils/sort';
import { roundToTwo } from '../utils/math';

interface HistoryViewProps {
  history: ClientHistoryRecord[];
  onClearHistory: () => void;
  onRestoreClient: (record: ClientHistoryRecord) => void;
  onDeleteRecord?: (recordId: string) => void;
  panels: Panel[];
  currency: string;
  selectedTemplate?: SlipTemplateId;
  customConfig?: SlipCustomConfig;
}

export const HistoryView: React.FC<HistoryViewProps> = ({
  history,
  onClearHistory,
  onRestoreClient,
  onDeleteRecord,
  panels,
  currency,
  selectedTemplate = 'royal_crown',
  customConfig,
}) => {
  const [search, setSearch] = useState('');
  const [selectedDate, setSelectedDate] = useState<string>('all');
  const [expandedClient, setExpandedClient] = useState<string | null>(null);
  const [showClearConfirmModal, setShowClearConfirmModal] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState<ClientHistoryRecord | null>(null);

  // Filter history
  const filteredHistory = history.filter((h) => {
    const matchesSearch = h.clientName.toLowerCase().includes(search.toLowerCase());
    const matchesDate = selectedDate === 'all' || h.dateRange === selectedDate;
    return matchesSearch && matchesDate;
  });

  // Extract unique dates
  const uniqueDates = Array.from(new Set(history.map((h) => h.dateRange))).filter(Boolean);

  // Group by client
  const clientGroups: Record<string, ClientHistoryRecord[]> = {};
  filteredHistory.forEach((h) => {
    if (!clientGroups[h.clientName]) {
      clientGroups[h.clientName] = [];
    }
    clientGroups[h.clientName].push(h);
  });

  const totalArchivedSms = filteredHistory.reduce((sum, h) => sum + h.sms, 0);
  const totalArchivedAmount = roundToTwo(filteredHistory.reduce((sum, h) => sum + h.totalAmount, 0));

  const handleDownloadHistoricalImage = (record: ClientHistoryRecord) => {
    if (record.isCombined && record.combinedClients && record.combinedClients.length > 0) {
      downloadCombinedParchiImage({
        clients: record.combinedClients.map((cc) => ({
          id: cc.id,
          name: cc.name,
          sms: cc.sms,
          panels: cc.panels,
        })),
        rate: record.rate,
        currency: record.currency || currency,
        batchName: record.batchName,
        startDate: record.dateRange.split(' to ')[0] || '',
        endDate: record.dateRange.split(' to ')[1] || '',
        showRate: true,
        panelsList: panels,
        templateId: selectedTemplate,
        customConfig,
      });
      return;
    }

    downloadParchiImage({
      client: {
        id: record.clientId,
        name: record.clientName,
        sms: record.sms,
        panels: record.panelsBreakdown,
      },
      rate: record.rate,
      currency: record.currency || currency,
      batchName: record.batchName,
      startDate: record.dateRange.split(' to ')[0] || '',
      endDate: record.dateRange.split(' to ')[1] || '',
      showRate: true,
      panelsList: panels,
      templateId: selectedTemplate,
      customConfig,
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Banner */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold text-xl">
              <History className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900 dark:text-white">
                History
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Archived slips and client records
              </p>
            </div>
          </div>

          {history.length > 0 && (
            <button
              onClick={() => setShowClearConfirmModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 dark:bg-red-950/30 dark:hover:bg-red-900/40 border border-red-200 dark:border-red-900/50 transition-colors cursor-pointer self-start md:self-auto shadow-xs"
            >
              <Trash2 className="w-4 h-4" />
              <span>Clear</span>
            </button>
          )}
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-5 pt-5 border-t border-slate-100 dark:border-slate-800">
          <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl">
            <span className="text-[10px] font-bold uppercase text-slate-400">Slips</span>
            <p className="text-xl font-black text-slate-900 dark:text-white mt-0.5">
              {filteredHistory.length}
            </p>
          </div>
          <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl">
            <span className="text-[10px] font-bold uppercase text-slate-400">Total SMS</span>
            <p className="text-xl font-black text-sky-600 dark:text-sky-400 mt-0.5">
              {totalArchivedSms.toLocaleString()}
            </p>
          </div>
          <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl">
            <span className="text-[10px] font-bold uppercase text-slate-400">Revenue</span>
            <p className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-0.5">
              {totalArchivedAmount.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}{' '}
              <span className="text-xs font-bold">{currency}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:max-w-xs">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search client in history..."
            className="w-full pl-9 pr-3 py-2 text-xs font-semibold rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-purple-500"
          />
        </div>

        {/* Date Filter */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs font-bold text-slate-500 whitespace-nowrap">Filter Date:</span>
          <select
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-3 py-2 text-xs font-semibold rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 focus:outline-hidden cursor-pointer"
          >
            <option value="all">All Dates ({uniqueDates.length})</option>
            {uniqueDates.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Client Records List */}
      {Object.keys(clientGroups).length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center">
          <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-600 mx-auto flex items-center justify-center mb-3">
            <History className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
            No Records in History
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
            When you save a slip image from the Reports or Slips page (by entering your PIN), that record will automatically be archived here!
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {Object.entries(clientGroups)
            .sort(([a], [b]) => naturalCompare(a, b))
            .map(([clientName, records]) => {
              const isExpanded = expandedClient === clientName;
              const totalClientSms = records.reduce((s, r) => s + r.sms, 0);
              const totalClientAmount = roundToTwo(records.reduce((s, r) => s + r.totalAmount, 0));

            return (
              <div
                key={clientName}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-2xs transition-all"
              >
                {/* Client Group Header */}
                <div
                  onClick={() => setExpandedClient(isExpanded ? null : clientName)}
                  className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 flex items-center justify-center font-black text-xs">
                      {records.length}
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-slate-900 dark:text-white">
                        {clientName}
                      </h4>
                      <p className="text-xs text-slate-500">
                        {records.length} slip{records.length > 1 ? 's' : ''} recorded • Latest: {records[0].dateRange}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right hidden sm:block">
                      <p className="text-xs font-black text-sky-600 dark:text-sky-400">
                        {totalClientSms.toLocaleString()} SMS
                      </p>
                      <p className="text-[11px] font-bold text-slate-500">
                        {totalClientAmount.toFixed(2)} {currency}
                      </p>
                    </div>

                    <div className="text-slate-400">
                      {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </div>
                  </div>
                </div>

                {/* Expanded Client Records */}
                {isExpanded && (
                  <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20 space-y-2">
                    {records.map((rec) => (
                      <div
                        key={rec.id}
                        className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-black text-purple-700 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/50 px-2 py-0.5 rounded">
                              {rec.dateRange}
                            </span>
                            {rec.isCombined && (
                              <span className="text-[11px] font-bold text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-950/60 px-2 py-0.5 rounded border border-amber-300 dark:border-amber-800/40">
                                📑 Combined Statement ({rec.combinedClients?.length || 2} Accounts)
                              </span>
                            )}
                            <span className="text-[11px] text-slate-400 font-medium">
                              Archived: {new Date(rec.downloadedAt).toLocaleDateString()}
                            </span>
                          </div>

                          {rec.isCombined && rec.combinedClients && rec.combinedClients.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 pt-0.5">
                              {rec.combinedClients.map((cc) => (
                                <span
                                  key={cc.id}
                                  className="text-[11px] font-medium px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                                >
                                  <strong>{cc.name}:</strong> {cc.sms.toLocaleString()} SMS
                                </span>
                              ))}
                            </div>
                          )}

                          {rec.panelsBreakdown && Object.keys(rec.panelsBreakdown).length > 0 && (
                            <p className="text-[11px] text-slate-500 font-medium">
                              Panels:{' '}
                              {Object.entries(rec.panelsBreakdown)
                                .map(([pId, count]) => {
                                  const pName = panels.find((p) => p.id === pId)?.name || pId;
                                  return `${pName}: ${count} SMS`;
                                })
                                .join(' | ')}
                            </p>
                          )}
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <span className="text-sm font-black text-slate-900 dark:text-white">
                              {rec.sms.toLocaleString()} SMS
                            </span>
                            <span className="block text-xs font-bold text-emerald-600 dark:text-emerald-400">
                              {rec.totalAmount.toFixed(2)} {rec.currency}
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => handleDownloadHistoricalImage(rec)}
                              className="p-2 rounded-lg bg-[#002a4e] text-white hover:bg-blue-900 transition-colors cursor-pointer"
                              title={rec.isCombined ? "Re-download Combined Statement Report Picture" : "Re-download Crown Slip Image"}
                            >
                              <Download className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={() => onRestoreClient(rec)}
                              className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
                              title="Restore back to active table"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                            </button>

                            {onDeleteRecord && (
                              <button
                                onClick={() => setRecordToDelete(rec)}
                                className="p-2 rounded-lg bg-red-50 hover:bg-red-100 dark:bg-red-950/40 dark:hover:bg-red-900/50 text-red-600 dark:text-red-400 transition-colors cursor-pointer"
                                title="Delete this slip from history"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* CLEAR ALL ARCHIVE CONFIRMATION MODAL */}
      {showClearConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-sm w-full p-6 text-center shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Clear All History Archive?</h3>
              <p className="text-xs text-slate-400 mt-1">
                Are you sure you want to delete all <strong>{history.length}</strong> archived slips?
                <br />
                <span className="text-amber-400/90 font-medium">All archived records will be permanently deleted.</span>
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowClearConfirmModal(false)}
                className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-slate-300 hover:bg-slate-800 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  onClearHistory();
                  setShowClearConfirmModal(false);
                }}
                className="px-4 py-1.5 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-500 text-white shadow-md shadow-red-600/30 transition cursor-pointer"
              >
                Yes, Clear All
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SINGLE RECORD DELETE CONFIRMATION MODAL */}
      {recordToDelete && onDeleteRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-sm w-full p-6 text-center shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Delete Slip from History?</h3>
              <p className="text-xs text-slate-400 mt-1">
                Delete archived slip for <strong>{recordToDelete.clientName}</strong> ({recordToDelete.dateRange})?
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setRecordToDelete(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:bg-slate-800 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  onDeleteRecord(recordToDelete.id);
                  setRecordToDelete(null);
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-600/30 transition"
              >
                Delete Slip
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
