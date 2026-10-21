import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  Download,
  Copy,
  Check,
  Share2,
  Users,
  CheckSquare,
  Square,
  Lock,
  Palette,
  Sparkles,
  Calculator,
  Search,
  CheckCircle2,
} from 'lucide-react';
import { ClientRecord, Panel, SlipCustomConfig, ClientHistoryRecord } from '../types';
import { createCombinedParchiDataUrl, downloadCombinedParchiImage } from '../utils/parchiImage';
import { generateCombinedParchiText, openWhatsApp } from '../utils/export';
import { SLIP_TEMPLATES, SlipTemplateId, getSlipTemplate } from '../utils/slipTemplates';
import { addHistoryRecord } from '../utils/storage';
import { naturalSortClients } from '../utils/sort';
import { calculateAmount } from '../utils/math';

interface CombinedSlipModalProps {
  isOpen: boolean;
  onClose: () => void;
  allClients: ClientRecord[];
  initialSelectedIds?: string[];
  rate: number;
  currency: string;
  batchName: string;
  startDate?: string;
  endDate?: string;
  showRate?: boolean;
  panels?: Panel[];
  selectedTemplate?: SlipTemplateId;
  onSelectTemplate?: (t: SlipTemplateId) => void;
  customConfig?: SlipCustomConfig;
  onRequestSavePin?: (clients: ClientRecord[]) => void;
  onOpenCustomizeModal?: () => void;
  onSaveToHistory?: (record: ClientHistoryRecord) => void;
}

export const CombinedSlipModal: React.FC<CombinedSlipModalProps> = ({
  isOpen,
  onClose,
  allClients,
  initialSelectedIds = [],
  rate,
  currency,
  batchName,
  startDate = '',
  endDate = '',
  showRate = true,
  panels = [],
  selectedTemplate = 'royal_crown',
  onSelectTemplate,
  customConfig,
  onRequestSavePin,
  onOpenCustomizeModal,
  onSaveToHistory,
}) => {
  // Client selection state
  const [selectedIds, setSelectedIds] = useState<string[]>(() => {
    if (initialSelectedIds.length > 0) return initialSelectedIds;
    // Default to first 2 clients if none selected
    return allClients.slice(0, 2).map((c) => c.id);
  });

  const [currentTemplate, setCurrentTemplate] = useState<SlipTemplateId>(selectedTemplate);
  const [clientSearch, setClientSearch] = useState('');
  const [dataUrl, setDataUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [isClientDrawerOpen, setIsClientDrawerOpen] = useState(false);
  const [archivedSuccess, setArchivedSuccess] = useState(false);

  // Sync initial selection when modal opens
  useEffect(() => {
    if (isOpen) {
      if (initialSelectedIds.length > 0) {
        setSelectedIds(initialSelectedIds);
      } else if (selectedIds.length === 0 && allClients.length > 0) {
        setSelectedIds(allClients.slice(0, 2).map((c) => c.id));
      }
    }
  }, [isOpen, initialSelectedIds]);

  useEffect(() => {
    setCurrentTemplate(selectedTemplate);
  }, [selectedTemplate]);

  // Compute selected clients in natural A-to-Z order
  const selectedClients = useMemo(() => {
    const list = allClients.filter((c) => selectedIds.includes(c.id));
    return naturalSortClients(list);
  }, [allClients, selectedIds]);

  // Combined stats
  const totalCombinedSms = useMemo(() => {
    return selectedClients.reduce((sum, c) => sum + (Number(c.sms) || 0), 0);
  }, [selectedClients]);

  const totalCombinedAmount = useMemo(() => {
    return calculateAmount(totalCombinedSms, rate);
  }, [totalCombinedSms, rate]);

  const filteredAllClients = useMemo(() => {
    const list = allClients.filter((c) =>
      c.name.toLowerCase().includes(clientSearch.toLowerCase())
    );
    return naturalSortClients(list);
  }, [allClients, clientSearch]);

  // Generate data URL for the combined slip
  useEffect(() => {
    if (isOpen && selectedClients.length > 0) {
      try {
        const url = createCombinedParchiDataUrl({
          clients: selectedClients,
          rate,
          currency,
          batchName,
          startDate,
          endDate,
          showRate,
          panelsList: panels,
          templateId: currentTemplate,
          customConfig,
        });
        setDataUrl(url);
      } catch (err) {
        console.error('Error rendering combined parchi:', err);
      }
    } else {
      setDataUrl('');
    }
  }, [
    isOpen,
    selectedClients,
    rate,
    currency,
    batchName,
    startDate,
    endDate,
    showRate,
    panels,
    currentTemplate,
    customConfig,
  ]);

  if (!isOpen) return null;

  const activeT = getSlipTemplate(currentTemplate);

  const toggleClient = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const selectAll = () => {
    setSelectedIds(allClients.map((c) => c.id));
  };

  const clearSelection = () => {
    setSelectedIds([]);
  };

  const handleTemplateChange = (tId: SlipTemplateId) => {
    setCurrentTemplate(tId);
    if (onSelectTemplate) onSelectTemplate(tId);
  };

  const archiveCurrentCombinedToHistory = () => {
    if (selectedClients.length === 0) return;
    const dateRangeStr = startDate && endDate ? `${startDate} to ${endDate}` : startDate || endDate || 'Combined Statement';
    const names = selectedClients.map((c) => c.name).join(', ');
    const historyEntry: ClientHistoryRecord = {
      id: `hist-comb-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      clientId: `comb-${Date.now()}`,
      clientName: `Combined Report: ${names}`,
      sms: totalCombinedSms,
      rate,
      currency,
      totalAmount: totalCombinedAmount,
      dateRange: dateRangeStr,
      downloadedAt: new Date().toISOString(),
      batchName: batchName || 'Combined Report',
      isCombined: true,
      combinedClients: selectedClients.map((c) => ({
        id: c.id,
        name: c.name,
        sms: c.sms,
        amount: c.sms * rate,
        panels: c.panels ? { ...c.panels } : undefined,
      })),
    };

    addHistoryRecord(historyEntry);
    if (onSaveToHistory) {
      onSaveToHistory(historyEntry);
    }
    setArchivedSuccess(true);
    setTimeout(() => setArchivedSuccess(false), 4500);
  };

  const handleDownload = () => {
    if (selectedClients.length === 0) return;
    if (onRequestSavePin) {
      onRequestSavePin(selectedClients);
      onClose();
    } else {
      handleDirectDownload();
    }
  };

  const handleDirectDownload = () => {
    if (selectedClients.length === 0) return;
    downloadCombinedParchiImage({
      clients: selectedClients,
      rate,
      currency,
      batchName,
      startDate,
      endDate,
      showRate,
      panelsList: panels,
      templateId: currentTemplate,
      customConfig,
    });
    archiveCurrentCombinedToHistory();
  };

  const handleCopyText = () => {
    if (selectedClients.length === 0) return;
    const text = generateCombinedParchiText(
      selectedClients,
      rate,
      currency,
      startDate,
      endDate,
      showRate,
      panels
    );
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleWhatsApp = () => {
    if (selectedClients.length === 0) return;
    const text = generateCombinedParchiText(
      selectedClients,
      rate,
      currency,
      startDate,
      endDate,
      showRate,
      panels
    );
    openWhatsApp(text);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-hidden">
      <div className="bg-white dark:bg-slate-900 max-w-4xl w-full rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col h-[95vh] sm:h-[90vh]">
        {/* Modal Top Header */}
        <div className="p-3 sm:p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/60 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-300 text-slate-950 flex items-center justify-center font-black shadow-md shadow-amber-500/20 shrink-0">
              <Users className="w-5 h-5 text-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
                  Combined Slip
                </h3>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400 font-bold border border-amber-500/30">
                  {selectedClients.length} Selected
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Period: {startDate || ''} to {endDate || ''} • Rate: {rate} {currency} • Total: <strong className="text-emerald-600 dark:text-emerald-400">{totalCombinedAmount.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 2 })} {currency}</strong>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Template Quick Switcher Ribbon */}
        <div className="px-3 sm:px-4 py-2 bg-slate-100 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 flex items-center gap-2 overflow-x-auto text-xs shrink-0">
          <span className="text-slate-500 dark:text-slate-400 font-bold flex items-center gap-1 whitespace-nowrap">
            <Palette className="w-3.5 h-3.5 text-amber-500" />
            <span>Theme:</span>
          </span>
          <div className="flex items-center gap-1.5 flex-nowrap">
            {onOpenCustomizeModal && (
              <button
                type="button"
                onClick={onOpenCustomizeModal}
                className="px-2.5 py-1 rounded-lg text-xs font-black whitespace-nowrap transition-all cursor-pointer flex items-center gap-1 bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 shadow-xs"
                title="Customize colors"
              >
                <Palette className="w-3.5 h-3.5" />
                <span>Colors</span>
              </button>
            )}
            {SLIP_TEMPLATES.map((t) => {
              const isSelected = currentTemplate === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => handleTemplateChange(t.id)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1 ${
                    isSelected
                      ? 'bg-[#002a4e] text-amber-300 shadow-xs ring-2 ring-amber-400'
                      : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
                  }`}
                >
                  <span>{t.badgeIcon}</span>
                  <span>{t.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Interactive Client Selector Bar (Scrollable strip to prevent mobile screen hijacking) */}
        <div className="p-2.5 sm:p-3 bg-amber-50/50 dark:bg-amber-950/20 border-b border-amber-200/60 dark:border-amber-900/30 flex flex-col sm:flex-row sm:items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1 shrink-0">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span className="hidden sm:inline">Accounts:</span>
              <span className="text-amber-600 font-black">({selectedClients.length})</span>
            </span>

            {/* Selected Pills Container - Scrollable horizontally to never take up vertical height */}
            <div className="flex items-center gap-1.5 overflow-x-auto max-w-full pb-0.5 scrollbar-thin">
              {selectedClients.map((c, i) => (
                <span
                  key={c.id}
                  className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-800 dark:text-slate-200 shadow-2xs shrink-0 whitespace-nowrap"
                >
                  <span className="text-amber-600 font-mono">#{i + 1}</span>
                  <span className="truncate max-w-[120px]">{c.name}</span>
                  <span className="text-slate-400">({c.sms})</span>
                  <button
                    onClick={() => toggleClient(c.id)}
                    className="ml-0.5 text-slate-400 hover:text-rose-500 cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 justify-end">
            <button
              onClick={() => setIsClientDrawerOpen(!isClientDrawerOpen)}
              className="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition cursor-pointer shadow-2xs flex items-center gap-1"
            >
              <span>{isClientDrawerOpen ? '▲ Close List' : '▼ Select Accounts'}</span>
            </button>
            <button
              onClick={selectAll}
              className="text-[11px] font-bold text-sky-600 dark:text-sky-400 hover:underline cursor-pointer"
            >
              All
            </button>
            <span className="text-slate-300">|</span>
            <button
              onClick={clearSelection}
              className="text-[11px] font-bold text-slate-500 hover:text-rose-500 cursor-pointer"
            >
              Clear
            </button>
          </div>
        </div>

        {/* Collapsible Client Checklist Drawer */}
        {isClientDrawerOpen && (
          <div className="p-3 bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 animate-in fade-in duration-150 shrink-0 max-h-48 overflow-y-auto">
            <div className="flex items-center justify-between mb-2">
              <div className="relative flex-1 max-w-xs">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={clientSearch}
                  onChange={(e) => setClientSearch(e.target.value)}
                  placeholder="Search client to add..."
                  className="w-full pl-8 pr-3 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none"
                />
              </div>
              <span className="text-[11px] text-slate-500">
                Tick clients you want combined in 1 picture
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 max-h-36 overflow-y-auto p-1">
              {filteredAllClients.map((c) => {
                const isChecked = selectedIds.includes(c.id);
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => toggleClient(c.id)}
                    className={`flex items-center gap-2 p-2 rounded-xl text-left transition cursor-pointer border text-xs ${
                      isChecked
                        ? 'bg-amber-500/15 border-amber-400 text-amber-950 dark:text-amber-200 font-bold'
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
                    }`}
                  >
                    {isChecked ? (
                      <CheckSquare className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                    ) : (
                      <Square className="w-4 h-4 text-slate-400 shrink-0" />
                    )}
                    <div className="truncate">
                      <p className="truncate font-semibold">{c.name}</p>
                      <p className="text-[10px] text-slate-400">{c.sms} SMS</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Modal Main Content: Live HD Combined Slip Picture with Smooth Touch Scroll */}
        <div
          className="p-3 sm:p-6 flex-1 min-h-0 overflow-y-auto overscroll-contain bg-slate-100/70 dark:bg-slate-950/70 flex flex-col items-center justify-start"
          style={{
            WebkitOverflowScrolling: 'touch',
            touchAction: 'pan-y',
          }}
        >
          {selectedClients.length === 0 ? (
            <div className="text-center py-12 my-auto">
              <Users className="w-12 h-12 text-slate-400 mx-auto mb-2 opacity-50" />
              <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">
                No clients selected yet
              </h4>
              <p className="text-xs text-slate-400 mt-1 max-w-sm">
                Select 2 or more clients above to generate their combined report picture. Both accounts and the grand total will be rendered on 1 slip.
              </p>
              <button
                onClick={() => setSelectedIds(allClients.slice(0, 2).map((c) => c.id))}
                className="mt-3 px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition cursor-pointer"
              >
                Select First 2 Clients
              </button>
            </div>
          ) : dataUrl ? (
            <div className="flex flex-col items-center max-w-md w-full pb-8 my-auto">
              {archivedSuccess && (
                <div className="w-full mb-3 p-3 bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-xs animate-in fade-in duration-200">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Combined slip downloaded & archived to History successfully!</span>
                </div>
              )}
              <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-2 flex items-center gap-1.5">
                <span>HD Combined Slip Generated</span>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] uppercase font-black tracking-wider text-amber-600 dark:text-amber-400">
                  {selectedClients.length} Accounts Included
                </span>
              </div>

              <div className="rounded-2xl overflow-hidden shadow-2xl border-2 border-slate-300 dark:border-slate-700 w-full bg-white dark:bg-slate-900 transition-transform duration-200">
                <img
                  src={dataUrl}
                  alt="Combined Slip Preview"
                  className="w-full h-auto block select-none"
                />
              </div>
            </div>
          ) : (
            <div className="py-12 my-auto text-slate-400 text-xs flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
              <span>Generating Crisp Combined Slip Picture...</span>
            </div>
          )}
        </div>

        {/* Modal Bottom Actions */}
        <div className="p-3 sm:p-4 bg-slate-50 dark:bg-slate-800/60 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2 sm:gap-3 shrink-0">
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyText}
              disabled={selectedClients.length === 0}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 text-slate-700 dark:text-slate-200 text-xs font-bold transition cursor-pointer disabled:opacity-40"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>

            <button
              onClick={handleWhatsApp}
              disabled={selectedClients.length === 0}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 text-emerald-700 dark:text-emerald-300 text-xs font-bold border border-emerald-200 dark:border-emerald-800 transition cursor-pointer disabled:opacity-40"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>WhatsApp</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            {/* PIN Protected Download Combined Slip */}
            <button
              onClick={handleDownload}
              disabled={selectedClients.length === 0}
              className="flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-amber-600 to-amber-500 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-black shadow-lg shadow-amber-500/25 transition-all cursor-pointer disabled:opacity-40 group hover:scale-[1.02]"
            >
              <Lock className="w-4 h-4 text-slate-950 group-hover:rotate-12 transition-transform" />
              <span>Download ({selectedClients.length})</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
