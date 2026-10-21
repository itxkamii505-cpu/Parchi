import React, { useState, useMemo } from 'react';
import {
  Download,
  Share2,
  Copy,
  ExternalLink,
  Check,
  Search,
  Lock,
  Palette,
  Sparkles,
  CheckCircle2,
  Sliders,
  Type,
  Plus,
  Pencil,
  Trash2,
  FileEdit,
  Users,
  CheckSquare,
  Square,
} from 'lucide-react';
import { ClientRecord, Panel, SlipCustomConfig, ClientHistoryRecord } from '../types';
import { downloadParchiSheet } from '../utils/parchiImage';
import { generateParchiText, openWhatsApp } from '../utils/export';
import { SLIP_TEMPLATES, SlipTemplateId, getSlipTemplate, DEFAULT_SLIP_CUSTOM_CONFIG } from '../utils/slipTemplates';
import { naturalSortClients } from '../utils/sort';
import { SlipCustomizeModal } from './SlipCustomizeModal';
import { ClientEditModal } from './ClientEditModal';
import { CombinedSlipModal } from './CombinedSlipModal';

interface ParchiyanViewProps {
  clients: ClientRecord[];
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
  onSaveCustomConfig?: (cfg: SlipCustomConfig) => void;
  onAddClient?: (client: ClientRecord) => void;
  onUpdateClient?: (client: ClientRecord) => void;
  onDeleteClient?: (clientId: string) => void;
  onPreviewClient: (client: ClientRecord) => void;
  onCopyAllParchiyan: () => void;
  onRequestDownloadImage: (client: ClientRecord) => void;
  onRequestSaveCombinedPin?: (clients: ClientRecord[]) => void;
  onSaveCombinedToHistory?: (record: ClientHistoryRecord) => void;
}

export const ParchiyanView: React.FC<ParchiyanViewProps> = ({
  clients,
  rate,
  currency,
  batchName,
  startDate,
  endDate,
  showRate = true,
  panels = [],
  selectedTemplate = 'royal_crown',
  onSelectTemplate,
  customConfig = DEFAULT_SLIP_CUSTOM_CONFIG,
  onSaveCustomConfig,
  onAddClient,
  onUpdateClient,
  onDeleteClient,
  onPreviewClient,
  onCopyAllParchiyan,
  onRequestDownloadImage,
  onRequestSaveCombinedPin,
  onSaveCombinedToHistory,
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [galleryExpanded, setGalleryExpanded] = useState(false);

  // Modals state
  const [isCustomizeOpen, setIsCustomizeOpen] = useState(false);
  const [clientModalOpen, setClientModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<ClientRecord | null>(null);
  const [clientToDelete, setClientToDelete] = useState<ClientRecord | null>(null);

  // Multi-client combined slip state
  const [selectedClientIds, setSelectedClientIds] = useState<string[]>([]);
  const [isCombinedModalOpen, setIsCombinedModalOpen] = useState(false);

  const toggleSelectClient = (clientId: string) => {
    setSelectedClientIds((prev) =>
      prev.includes(clientId) ? prev.filter((id) => id !== clientId) : [...prev, clientId]
    );
  };

  const selectAllClients = () => {
    setSelectedClientIds(clients.map((c) => c.id));
  };

  const clearClientSelection = () => {
    setSelectedClientIds([]);
  };

  const activeT = getSlipTemplate(selectedTemplate);

  // Natural A-to-Z Alphabetical Sorting
  const filteredClients = useMemo(() => {
    const list = clients.filter((c) =>
      c.name.toLowerCase().includes(search.toLowerCase())
    );
    return naturalSortClients(list);
  }, [clients, search]);

  const handleCopyText = (client: ClientRecord) => {
    const text = generateParchiText(
      client,
      rate,
      currency,
      'english',
      startDate,
      endDate,
      showRate,
      panels
    );
    navigator.clipboard.writeText(text);
    setCopiedId(client.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleWhatsApp = (client: ClientRecord) => {
    const text = generateParchiText(
      client,
      rate,
      currency,
      'english',
      startDate,
      endDate,
      showRate,
      panels
    );
    openWhatsApp(text);
  };

  const handleDownloadSheet = (chunkSize: number = 4) => {
    const chunks: ClientRecord[][] = [];
    for (let i = 0; i < filteredClients.length; i += chunkSize) {
      chunks.push(filteredClients.slice(i, i + chunkSize));
    }

    chunks.forEach((chunk, index) => {
      setTimeout(() => {
        downloadParchiSheet(
          chunk,
          index + 1,
          rate,
          currency,
          batchName,
          startDate,
          endDate,
          showRate,
          panels,
          selectedTemplate,
          customConfig
        );
      }, index * 400);
    });
  };

  // Open add client modal
  const handleOpenAddClient = () => {
    setEditingClient(null);
    setClientModalOpen(true);
  };

  // Open edit client modal
  const handleOpenEditClient = (client: ClientRecord) => {
    setEditingClient(client);
    setClientModalOpen(true);
  };

  const handleSaveClientModal = (client: ClientRecord) => {
    if (editingClient) {
      if (onUpdateClient) onUpdateClient(client);
    } else {
      if (onAddClient) onAddClient(client);
    }
  };

  const handleDeleteClientDirect = (clientId: string) => {
    if (onDeleteClient) onDeleteClient(clientId);
  };

  const formattedDate =
    startDate && endDate ? `${startDate} to ${endDate}` : startDate || endDate || 'Weekly Period';

  const activeFontFamily = `"${customConfig.fontFamily}", sans-serif`;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* 1. TOP HEADER WITH CUSTOMIZE STUDIO & ACTIONS BAR */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border border-slate-700 rounded-2xl p-5 shadow-xl text-white">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-300 text-slate-950 flex items-center justify-center font-black text-2xl shadow-lg shadow-amber-500/20">
              {activeT.badgeIcon}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg sm:text-xl font-black text-white tracking-wide">
                  Slips
                </h2>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold">
                  {activeT.name}
                </span>
                <span className="text-xs px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700 font-medium">
                  {customConfig.fontFamily}
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1">
                Period: <strong>{formattedDate}</strong> • Rate: <strong className="text-emerald-400">{rate} {currency}</strong>
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* COMBINE BUTTON */}
            <button
              onClick={() => {
                if (selectedClientIds.length === 0 && clients.length > 0) {
                  setSelectedClientIds(clients.slice(0, 2).map((c) => c.id));
                }
                setIsCombinedModalOpen(true);
              }}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold transition-all cursor-pointer shadow-md"
              title="Combine selected clients into 1 slip"
            >
              <Users className="w-4 h-4" />
              <span>Combine</span>
              {selectedClientIds.length > 0 && (
                <span className="bg-amber-400 text-slate-950 px-1.5 py-0.2 rounded-full text-[10px] font-black">
                  {selectedClientIds.length}
                </span>
              )}
            </button>

            {/* COLORS BUTTON */}
            <button
              onClick={() => setIsCustomizeOpen(true)}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-all cursor-pointer shadow-md"
              title="Customize colors and styling"
            >
              <Palette className="w-4 h-4" />
              <span>Colors</span>
            </button>

            {/* ADD CLIENT BUTTON */}
            {onAddClient && (
              <button
                onClick={handleOpenAddClient}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all cursor-pointer shadow-md"
              >
                <Plus className="w-4 h-4" />
                <span>Add Client</span>
              </button>
            )}

            {/* BATCH 4-IN-1 SHEET */}
            <button
              onClick={() => handleDownloadSheet(4)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-200 text-xs font-bold transition-colors cursor-pointer"
            >
              <Download className="w-4 h-4 text-amber-400" />
              <span>Batch (4)</span>
            </button>

            {/* COPY TEXT */}
            <button
              onClick={onCopyAllParchiyan}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
            >
              <Copy className="w-4 h-4" />
              <span>Copy</span>
            </button>
          </div>
        </div>

        {/* Templates Drawer Toggle */}
        <div className="mt-4 pt-4 border-t border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Template:</span>
            <span className="text-xs font-bold text-amber-400">#{activeT.number} {activeT.name}</span>
          </div>

          <button
            onClick={() => setGalleryExpanded(!galleryExpanded)}
            className="text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer transition"
          >
            <Palette className="w-3.5 h-3.5" />
            <span>{galleryExpanded ? 'Hide Templates' : 'Templates (10)'}</span>
          </button>
        </div>

        {/* 10 SLIP STYLES GRID */}
        {galleryExpanded && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 pt-4 mt-2 border-t border-slate-800">
            {SLIP_TEMPLATES.map((t) => {
              const isSelected = selectedTemplate === t.id;
              return (
                <div
                  key={t.id}
                  onClick={() => onSelectTemplate && onSelectTemplate(t.id)}
                  className={`p-2.5 rounded-xl border-2 cursor-pointer transition-all flex flex-col justify-between ${
                    isSelected
                      ? 'border-amber-400 bg-amber-500/10 shadow-md ring-1 ring-amber-400/60'
                      : 'border-slate-800 bg-slate-950/60 hover:border-slate-700 hover:bg-slate-900'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-lg">{t.badgeIcon}</span>
                    {isSelected ? (
                      <span className="text-[10px] font-black uppercase px-1.5 py-0.5 rounded bg-amber-400 text-slate-950">
                        Active
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-400">#{t.number}</span>
                    )}
                  </div>
                  <h4 className="text-xs font-bold text-white truncate">{t.name}</h4>
                  <p className="text-[10px] text-slate-400 truncate">{t.tagline}</p>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 2. SEARCH BAR & STATS */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search client slips by name..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400"
          />
        </div>

        <div className="flex items-center gap-3 text-xs font-medium text-slate-500 dark:text-slate-400">
          <span>
            Total Slips: <strong className="text-slate-900 dark:text-white font-bold">{filteredClients.length}</strong>
          </span>
          <span>•</span>
          <span className="text-amber-600 dark:text-amber-400 font-semibold">
            Active Font: {customConfig.fontFamily}
          </span>
        </div>
      </div>

      {/* MULTI-CLIENT COMBINED SLIP SELECTION BANNER */}
      {selectedClientIds.length > 0 && (
        <div className="bg-gradient-to-r from-[#002a4e] via-blue-900 to-[#002a4e] border-2 border-amber-400 rounded-2xl p-3 sm:p-4 shadow-xl flex flex-wrap items-center justify-between gap-3 text-white animate-in slide-in-from-top-2 duration-150">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-400 text-slate-950 font-black text-sm flex items-center justify-center shadow-md">
              {selectedClientIds.length}
            </div>
            <div>
              <p className="text-xs sm:text-sm font-black text-white flex items-center gap-2">
                <span>{selectedClientIds.length} Clients Selected for Combined Slip</span>
                <span className="text-[10px] bg-amber-400/20 text-amber-300 font-bold px-2 py-0.5 rounded-full border border-amber-400/30">
                  Ready to Generate 1 Pic
                </span>
              </p>
              <p className="text-[11px] text-amber-200">
                All selected clients will be combined into a single HD picture slip with individual breakdowns & Grand Total.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsCombinedModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black transition cursor-pointer shadow-lg flex items-center gap-1.5 hover:scale-[1.02]"
            >
              <Users className="w-4 h-4" />
              <span>📸 Generate Combined Slip ({selectedClientIds.length})</span>
            </button>
            <button
              onClick={selectAllClients}
              className="px-2.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition cursor-pointer"
            >
              Select All
            </button>
            <button
              onClick={clearClientSelection}
              className="px-2.5 py-1.5 rounded-xl bg-white/10 hover:bg-rose-500/30 text-slate-200 hover:text-white text-xs font-bold transition cursor-pointer"
            >
              Clear
            </button>
          </div>
        </div>
      )}

      {/* 3. SLIP CARDS GRID */}
      {filteredClients.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8">
          <span className="text-4xl block mb-2">{activeT.badgeIcon}</span>
          <p className="text-slate-700 dark:text-slate-200 font-bold text-base">
            {search ? 'No client slips match your search' : 'No clients added yet'}
          </p>
          <p className="text-xs text-slate-400 mt-1 mb-4">
            Add a new client to generate custom slips immediately.
          </p>
          {onAddClient && (
            <button
              onClick={handleOpenAddClient}
              className="px-4 py-2 rounded-xl bg-amber-500 text-slate-950 text-xs font-bold hover:bg-amber-400 transition inline-flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add First Client
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredClients.map((client, idx) => {
            const totalAmount = (client.sms * rate).toFixed(1);
            const isCopied = copiedId === client.id;
            const isSelectedForCombine = selectedClientIds.includes(client.id);
            const ui = activeT.uiCardClasses;

            const useTriTone = customConfig.enableTriToneBorder ?? true;
            const topC = (useTriTone && customConfig.topBorderColor) ? customConfig.topBorderColor : (customConfig.overrideColors && customConfig.customBorderColor ? customConfig.customBorderColor : activeT.colors.border);
            const centerC = (useTriTone && customConfig.centerBorderColor) ? customConfig.centerBorderColor : (customConfig.overrideColors && customConfig.customAccentColor ? customConfig.customAccentColor : activeT.colors.accent);
            const bottomC = (useTriTone && customConfig.bottomBorderColor) ? customConfig.bottomBorderColor : (customConfig.overrideColors && customConfig.customBorderColor ? customConfig.customBorderColor : activeT.colors.border);

            return (
              <div
                key={client.id}
                className={`rounded-2xl transition-all duration-200 flex flex-col justify-between overflow-hidden group relative hover:shadow-2xl hover:-translate-y-0.5 border-2 ${isSelectedForCombine ? 'ring-3 ring-amber-400 shadow-xl' : ''} ${ui.card}`}
                style={{
                  fontFamily: activeFontFamily,
                  backgroundColor: customConfig.overrideColors && customConfig.customBgColor ? customConfig.customBgColor : undefined,
                  borderImageSource: `linear-gradient(to bottom, ${topC} 0%, ${topC} 32%, ${centerC} 48%, ${centerC} 68%, ${bottomC} 85%, ${bottomC} 100%)`,
                  borderImageSlice: 1,
                  color: customConfig.overrideColors && customConfig.customTextColor ? customConfig.customTextColor : undefined,
                }}
              >
                {/* Top Section Border Bar (Top Color) */}
                <div
                  className="h-1.5 w-full"
                  style={{ backgroundColor: topC }}
                />

                {/* Slip Card Top Selection & Quick Toolbar */}
                <div className="px-4 pt-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleSelectClient(client.id);
                      }}
                      className={`flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] font-bold transition cursor-pointer border ${
                        isSelectedForCombine
                          ? 'bg-amber-400 text-slate-950 border-amber-500 shadow-xs'
                          : 'bg-black/10 dark:bg-white/10 text-slate-600 dark:text-slate-300 border-slate-300/60 dark:border-slate-700/60 hover:border-amber-400'
                      }`}
                      title={isSelectedForCombine ? 'Deselect from combined slip' : 'Select client for combined slip'}
                    >
                      {isSelectedForCombine ? (
                        <CheckSquare className="w-3.5 h-3.5 text-slate-950" />
                      ) : (
                        <Square className="w-3.5 h-3.5" />
                      )}
                      <span>{isSelectedForCombine ? 'Selected' : 'Select'}</span>
                    </button>

                    <span className="text-xs opacity-70 font-bold">
                      {customConfig.showIdBadge !== false ? `KB-${String(idx + 1).padStart(3, '0')}` : ''}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition">
                    {/* Quick Edit Client Button */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenEditClient(client);
                      }}
                      className="p-1 rounded-lg bg-black/10 hover:bg-black/20 text-slate-600 dark:text-slate-300 hover:text-amber-500 transition cursor-pointer"
                      title="Edit client name or SMS count"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>

                    {/* Quick Delete Client Button */}
                    {onDeleteClient && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setClientToDelete(client);
                        }}
                        className="p-1 rounded-lg bg-black/10 hover:bg-rose-500/20 text-slate-600 dark:text-slate-300 hover:text-rose-500 transition cursor-pointer"
                        title="Delete this client slip"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Slip Header & Content */}
                <div className="px-5 pb-3 text-center">
                  <div className="flex items-center justify-center gap-1.5 text-xs tracking-wider">
                    <span className="text-lg">{activeT.badgeIcon}</span>
                    <span
                      className={`uppercase font-black text-xs ${ui.brandText}`}
                      style={{
                        color: customConfig.overrideColors && customConfig.customTextColor
                          ? customConfig.customTextColor
                          : activeT.colors.titleColor,
                      }}
                    >
                      {customConfig.headerTitle || 'KBMAX WEEKLY REPORTS'}
                    </span>
                  </div>

                  {/* Date line */}
                  {customConfig.showDateLine !== false && (
                    <p className={`text-[10px] font-bold mt-0.5 ${ui.dateText}`}>
                      {customConfig.subHeader || `Date: ${formattedDate}`}
                    </p>
                  )}

                  {/* Center Border Accent Divider */}
                  <div
                    className="h-[1.5px] w-2/3 mx-auto my-2"
                    style={{ backgroundColor: centerC }}
                  />

                  {/* Client Name Box (Center Section) */}
                  <div
                    className={`mt-2 py-2 px-3 rounded-xl shadow-2xs border ${ui.clientBox}`}
                    style={{ borderColor: centerC }}
                  >
                    <h3 className={`text-base font-black truncate ${ui.clientText}`}>
                      {client.name}
                    </h3>
                  </div>

                  {/* Panels Breakdown */}
                  {client.panels && Object.keys(client.panels).length > 0 && (
                    <div className="mt-2.5 flex flex-wrap items-center justify-center gap-1">
                      {Object.entries(client.panels).map(([pId, count]) => {
                        const pName = panels.find((p) => p.id === pId)?.name || pId;
                        if (!count || count <= 0) return null;
                        return (
                          <span
                            key={pId}
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${ui.panelBadge}`}
                          >
                            {pName}: {count}
                          </span>
                        );
                      })}
                    </div>
                  )}

                  {/* Total SMS Count */}
                  <div className="mt-2.5">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      Total SMS Count
                    </span>
                    <p className={`text-2xl font-black mt-0.5 ${ui.smsNumber}`}>
                      {client.sms.toLocaleString()}
                    </p>
                  </div>

                  {/* Rate & Total (Total Amount always shown, Rate conditionally hidden) */}
                  <div className="mt-2.5 pt-2.5 border-t border-slate-200/50 dark:border-slate-800 flex items-center justify-around text-xs">
                    {showRate && (
                      <>
                        <div>
                          <span className="text-[10px] opacity-70 uppercase font-semibold">Rate</span>
                          <p className="font-bold">
                            {rate} {currency}
                          </p>
                        </div>
                        <div className="h-6 w-px bg-slate-300 dark:bg-slate-700" />
                      </>
                    )}
                    <div>
                      <span className="text-[10px] opacity-70 uppercase font-semibold">Total Amount</span>
                      <p className={`font-black text-sm ${ui.totalAmount}`}>
                        {totalAmount} {currency}
                      </p>
                    </div>
                  </div>

                  {/* Custom Note Strip */}
                  {customConfig.customNote && (
                    <div
                      className="mt-2 text-[10px] font-semibold italic"
                      style={{ color: centerC }}
                    >
                      * {customConfig.customNote}
                    </div>
                  )}

                  {/* Stamp text at bottom of slip */}
                  {customConfig.showStamp !== false && (
                    <p
                      className="text-[9px] font-bold uppercase mt-2.5 tracking-wider"
                      style={{ color: bottomC }}
                    >
                      {customConfig.stampText || activeT.stamp}
                    </p>
                  )}
                </div>

                {/* Bottom Section Border Bar (Bottom Color) */}
                <div
                  className="h-1 w-full"
                  style={{ backgroundColor: bottomC }}
                />

                {/* Bottom Action Footer */}
                <div className="p-3 bg-slate-500/5 border-t border-slate-200/40 dark:border-slate-800 flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => onRequestDownloadImage(client)}
                    className={`flex-1 py-1.5 rounded-xl text-xs font-bold shadow-xs transition-all cursor-pointer flex items-center justify-center gap-1.5 group ${ui.primaryButton}`}
                    title={`Download Slip (${activeT.name} style)`}
                  >
                    <Lock className="w-3.5 h-3.5 group-hover:rotate-12 transition-transform" />
                    <span>Save Slip</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleCopyText(client)}
                    className={`p-1.5 rounded-xl transition-colors cursor-pointer border ${ui.actionButton}`}
                    title="Copy WhatsApp text"
                  >
                    {isCopied ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleWhatsApp(client)}
                    className="p-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white transition-colors cursor-pointer"
                    title="Send via WhatsApp"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => onPreviewClient(client)}
                    className={`p-1.5 rounded-xl transition-colors cursor-pointer border ${ui.actionButton}`}
                    title="Slip Preview"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* CUSTOMIZE STUDIO MODAL */}
      <SlipCustomizeModal
        isOpen={isCustomizeOpen}
        onClose={() => setIsCustomizeOpen(false)}
        config={customConfig}
        onSaveConfig={(newCfg) => {
          if (onSaveCustomConfig) onSaveCustomConfig(newCfg);
        }}
        currentTemplateId={selectedTemplate}
        sampleClient={filteredClients[0] || clients[0]}
        rate={rate}
        currency={currency}
        startDate={startDate}
        endDate={endDate}
        panels={panels}
      />

      {/* CLIENT ADD / EDIT MODAL */}
      <ClientEditModal
        isOpen={clientModalOpen}
        onClose={() => setClientModalOpen(false)}
        client={editingClient}
        onSaveClient={handleSaveClientModal}
        onDeleteClient={handleDeleteClientDirect}
        panels={panels}
      />

      {/* COMBINED SLIP MODAL (Multi-Account in 1 Picture) */}
      <CombinedSlipModal
        isOpen={isCombinedModalOpen}
        onClose={() => setIsCombinedModalOpen(false)}
        allClients={clients}
        initialSelectedIds={selectedClientIds}
        rate={rate}
        currency={currency}
        batchName={batchName}
        startDate={startDate}
        endDate={endDate}
        showRate={showRate}
        panels={panels}
        selectedTemplate={selectedTemplate}
        onSelectTemplate={onSelectTemplate}
        customConfig={customConfig}
        onOpenCustomizeModal={() => setIsCustomizeOpen(true)}
        onSaveToHistory={onSaveCombinedToHistory}
        onRequestSavePin={onRequestSaveCombinedPin}
      />

      {/* CLIENT DELETE CONFIRMATION MODAL */}
      {clientToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-sm w-full p-6 text-center shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Delete Client Slip?</h3>
              <p className="text-xs text-slate-400 mt-1">
                Are you sure you want to delete the slip for <strong>{clientToDelete.name}</strong>?
                <br />
                <span className="text-rose-300 font-medium">This record will be removed from the active list.</span>
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setClientToDelete(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:bg-slate-800 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  handleDeleteClientDirect(clientToDelete.id);
                  setClientToDelete(null);
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-600/30 transition cursor-pointer"
              >
                Yes, Delete Slip
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
