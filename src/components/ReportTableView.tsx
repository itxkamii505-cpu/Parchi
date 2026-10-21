import React, { useState } from 'react';
import {
  FileSpreadsheet,
  Download,
  Printer,
  Plus,
  Trash2,
  ArrowUpDown,
  Check,
  Edit2,
  Calendar,
  Eye,
  EyeOff,
  X,
  Lock,
  Search,
  Users,
  CheckSquare,
  Square,
} from 'lucide-react';
import { ClientRecord, Panel, ClientHistoryRecord, SlipCustomConfig } from '../types';
import { CombinedSlipModal } from './CombinedSlipModal';
import { SlipTemplateId } from '../utils/slipTemplates';
import { naturalSortClients } from '../utils/sort';
import { calculateAmount } from '../utils/math';

interface ReportTableViewProps {
  clients: ClientRecord[];
  rate: number;
  currency: string;
  batchName: string;
  startDate: string;
  setStartDate: (d: string) => void;
  endDate: string;
  setEndDate: (d: string) => void;
  panels: Panel[];
  onAddPanel: (name: string) => void;
  onRemovePanel: (id: string) => void;
  showRate: boolean;
  setShowRate: (show: boolean) => void;
  onUpdateClient: (id: string, name: string, sms: number, panelsData?: Record<string, number>) => void;
  onDeleteClient: (id: string) => void;
  onAddClient: (name: string, sms: number, panelsData?: Record<string, number>) => void;
  onExportExcel: () => void;
  onExportCSV: () => void;
  onRequestDownloadImage: (client: ClientRecord) => void;
  onRequestSaveCombinedPin?: (clients: ClientRecord[]) => void;
  selectedTemplate?: SlipTemplateId;
  customConfig?: SlipCustomConfig;
  onOpenCustomizeModal?: () => void;
  onSaveCombinedToHistory?: (record: ClientHistoryRecord) => void;
}

export const ReportTableView: React.FC<ReportTableViewProps> = ({
  clients,
  rate,
  currency,
  batchName,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  panels,
  onAddPanel,
  onRemovePanel,
  showRate,
  setShowRate,
  onUpdateClient,
  onDeleteClient,
  onAddClient,
  onExportExcel,
  onExportCSV,
  onRequestDownloadImage,
  onRequestSaveCombinedPin,
  selectedTemplate,
  customConfig,
  onOpenCustomizeModal,
  onSaveCombinedToHistory,
}) => {
  const [sortMode, setSortMode] = useState<'alpha' | 'original' | 'high' | 'low'>('alpha');
  const [search, setSearch] = useState('');

  // Editing state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editSms, setEditSms] = useState<number>(0);
  const [editPanels, setEditPanels] = useState<Record<string, number>>({});

  // Add Panel state
  const [newPanelName, setNewPanelName] = useState('');
  const [isAddingPanel, setIsAddingPanel] = useState(false);

  // Quick Add Client bottom row
  const [newName, setNewName] = useState('');
  const [newPanelValues, setNewPanelValues] = useState<Record<string, string>>({});
  const [newDirectSms, setNewDirectSms] = useState<string>('');

  // Multi-client selection for combined slip
  const [selectedClientIds, setSelectedClientIds] = useState<string[]>([]);
  const [isCombinedModalOpen, setIsCombinedModalOpen] = useState(false);

  const getSortedClients = () => {
    let list = clients.filter((c) =>
      c.name.toLowerCase().includes(search.toLowerCase())
    );
    if (sortMode === 'high') {
      return [...list].sort((a, b) => b.sms - a.sms);
    }
    if (sortMode === 'low') {
      return [...list].sort((a, b) => a.sms - b.sms);
    }
    if (sortMode === 'original') {
      return list;
    }
    // Default: 'alpha' (Natural A-to-Z Alphanumeric order: Abdullah, Abdullah 1, Abdullah 2, Ali...)
    return naturalSortClients(list);
  };

  const sortedList = getSortedClients();
  const totalSms = clients.reduce((sum, c) => sum + c.sms, 0);
  const grandTotal = calculateAmount(totalSms, rate);

  const startEdit = (c: ClientRecord) => {
    setEditingId(c.id);
    setEditName(c.name);

    let initialPanels: Record<string, number> = {};
    if (c.panels && Object.keys(c.panels).length > 0) {
      initialPanels = { ...c.panels };
    } else if (panels.length > 0) {
      initialPanels = { [panels[0].id]: c.sms };
    }
    setEditPanels(initialPanels);
    setEditSms(c.sms);
  };

  const handleEditPanelValue = (panelId: string, value: number) => {
    const updated = { ...editPanels, [panelId]: Math.max(0, value) };
    setEditPanels(updated);
    // Strict recalculation: SMS count is strictly the sum of all panels
    const newSum = Object.values(updated).reduce((sum, val) => sum + (val || 0), 0);
    setEditSms(newSum);
  };

  const saveEdit = (id: string) => {
    if (editName.trim()) {
      const computedSms =
        panels.length > 0
          ? Object.values(editPanels).reduce((sum, v) => sum + (v || 0), 0)
          : Math.max(0, editSms);
      onUpdateClient(id, editName.trim(), computedSms, editPanels);
    }
    setEditingId(null);
  };

  const handleCreatePanel = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newPanelName.trim()) return;
    onAddPanel(newPanelName.trim());
    setNewPanelName('');
    setIsAddingPanel(false);
  };

  const handleAddNewClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    const panelsData: Record<string, number> = {};
    let sum = 0;

    if (panels.length > 0) {
      panels.forEach((p) => {
        const val = parseInt(newPanelValues[p.id] || '0', 10) || 0;
        panelsData[p.id] = val;
        sum += val;
      });
    } else {
      sum = parseInt(newDirectSms, 10) || 0;
    }

    onAddClient(newName.trim(), sum, panelsData);
    setNewName('');
    setNewPanelValues({});
    setNewDirectSms('');
  };

  const formattedDateRange =
    startDate && endDate ? `${startDate} to ${endDate}` : startDate || endDate || 'Weekly Period';

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs overflow-hidden animate-in fade-in duration-200">
      {/* Table Toolbar Header */}
      <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex flex-col gap-4 bg-slate-50/70 dark:bg-slate-800/40">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-black text-slate-900 dark:text-white">
                {batchName}
              </h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Period: <strong className="text-slate-800 dark:text-slate-200">{formattedDateRange}</strong> • Rate:{' '}
              <strong className="text-sky-600 dark:text-sky-400">
                {rate} {currency}
              </strong>
            </p>
          </div>

          {/* Date Picker Bar */}
          <div className="flex flex-wrap items-center gap-2 bg-white dark:bg-slate-800 p-2 rounded-xl border border-slate-200 dark:border-slate-700 shadow-2xs">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300">
              <Calendar className="w-4 h-4 text-sky-600" />
              <span>Period:</span>
            </div>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="text-xs font-semibold px-2 py-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-100 cursor-pointer"
            />
            <span className="text-xs text-slate-400 font-bold">to</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="text-xs font-semibold px-2 py-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-100 cursor-pointer"
            />
          </div>
        </div>

        {/* Second Toolbar Row: Panels Control & Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-200/80 dark:border-slate-800">
          <div className="flex items-center gap-2 flex-wrap">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search..."
                className="pl-8 pr-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-hidden w-36 sm:w-48"
              />
            </div>

            {/* Sort Selector */}
            <div className="flex items-center bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-1 text-xs">
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 mx-1.5" />
              <select
                value={sortMode}
                onChange={(e) => setSortMode(e.target.value as any)}
                className="bg-transparent text-slate-700 dark:text-slate-200 font-semibold focus:outline-hidden cursor-pointer text-xs"
              >
                <option value="alpha">A to Z</option>
                <option value="original">Original</option>
                <option value="high">SMS: High</option>
                <option value="low">SMS: Low</option>
              </select>
            </div>

            {/* ADD PANEL Control */}
            {isAddingPanel ? (
              <form
                onSubmit={handleCreatePanel}
                className="flex items-center gap-1 bg-white dark:bg-slate-800 p-1 rounded-lg border border-amber-400 shadow-xs"
              >
                <input
                  type="text"
                  value={newPanelName}
                  onChange={(e) => setNewPanelName(e.target.value)}
                  placeholder="Panel Name (e.g. Panel 2)"
                  className="px-2 py-1 text-xs font-bold text-slate-800 dark:text-white border-none outline-hidden w-36"
                  autoFocus
                />
                <button
                  type="submit"
                  className="px-2.5 py-1 bg-[#002a4e] hover:bg-blue-900 text-white text-xs font-bold rounded cursor-pointer"
                >
                  Add
                </button>
                <button
                  type="button"
                  onClick={() => setIsAddingPanel(false)}
                  className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </form>
            ) : (
              <button
                onClick={() => setIsAddingPanel(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 text-amber-900 dark:text-amber-300 text-xs font-bold border border-amber-300 dark:border-amber-800 transition-colors cursor-pointer shadow-2xs"
                title="Add a new custom product panel column"
              >
                <Plus className="w-3.5 h-3.5 text-amber-600" />
                <span>+ Add Panel</span>
                {panels.length > 0 && (
                  <span className="bg-amber-200 dark:bg-amber-800 text-amber-900 dark:text-amber-100 text-[10px] px-1.5 py-0.2 rounded-full font-black">
                    {panels.length}
                  </span>
                )}
              </button>
            )}

            {/* Rate Show / Hide Toggle Button */}
            <button
              onClick={() => setShowRate(!showRate)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors cursor-pointer ${
                showRate
                  ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700'
              }`}
              title="Show or Hide Rate in Slips and Reports"
            >
              {showRate ? <Eye className="w-3.5 h-3.5 text-emerald-600" /> : <EyeOff className="w-3.5 h-3.5 text-slate-500" />}
              <span>{showRate ? 'Rate: Shown' : 'Rate: Hidden'}</span>
            </button>
          </div>

          {/* Export & Actions */}
          <div className="flex items-center gap-2">
            {/* 📸 COMBINE SLIPS BUTTON */}
            <button
              onClick={() => {
                if (selectedClientIds.length === 0 && clients.length > 0) {
                  setSelectedClientIds(clients.slice(0, 2).map((c) => c.id));
                }
                setIsCombinedModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-sky-600 to-blue-700 hover:from-sky-500 hover:to-blue-600 text-white text-xs font-bold transition-all cursor-pointer shadow-2xs hover:scale-[1.02]"
              title="Select 2 or more clients to create 1 combined slip picture"
            >
              <Users className="w-3.5 h-3.5 text-amber-300" />
              <span>📸 Combine Slips {selectedClientIds.length > 0 ? `(${selectedClientIds.length})` : ''}</span>
            </button>

            <button
              onClick={onExportExcel}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors cursor-pointer shadow-2xs"
              title="Export complete table to Excel (.xlsx)"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Excel</span>
            </button>

            <button
              onClick={onExportCSV}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 text-slate-800 dark:text-slate-200 text-xs font-semibold transition-colors cursor-pointer"
              title="Export CSV"
            >
              <Download className="w-3.5 h-3.5" />
              <span>CSV</span>
            </button>

            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 text-slate-800 dark:text-slate-200 text-xs font-semibold transition-colors cursor-pointer"
              title="Print Table"
            >
              <Printer className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Table Container */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="bg-slate-100/90 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold uppercase tracking-wider">
              {/* Multi-Select Checkbox Column */}
              <th className="py-3 px-2 text-center w-8">
                <button
                  type="button"
                  onClick={() => {
                    if (selectedClientIds.length === clients.length) {
                      setSelectedClientIds([]);
                    } else {
                      setSelectedClientIds(clients.map((c) => c.id));
                    }
                  }}
                  className="p-0.5 hover:text-amber-500 cursor-pointer"
                  title={selectedClientIds.length === clients.length ? 'Deselect All' : 'Select All for Combined Slip'}
                >
                  {selectedClientIds.length > 0 && selectedClientIds.length === clients.length ? (
                    <CheckSquare className="w-4 h-4 text-amber-500" />
                  ) : (
                    <Square className="w-4 h-4 text-slate-400" />
                  )}
                </button>
              </th>

              {/* Date to Date Column */}
              <th className="py-3 px-3 text-center w-28 whitespace-nowrap">
                Date Range
              </th>

              {/* Client Name */}
              <th className="py-3 px-4 min-w-[170px]">
                Client / User Name
              </th>

              {/* Dynamic Panel Columns */}
              {panels.map((p) => (
                <th
                  key={p.id}
                  className="py-3 px-3 text-right bg-amber-50/50 dark:bg-amber-950/20 border-x border-amber-100 dark:border-amber-900/30 text-amber-900 dark:text-amber-300 whitespace-nowrap min-w-[110px]"
                >
                  <div className="flex items-center justify-end gap-1.5">
                    <span>{p.name}</span>
                    <button
                      onClick={() => onRemovePanel(p.id)}
                      className="text-slate-400 hover:text-red-500 cursor-pointer p-0.5 rounded"
                      title={`Remove ${p.name}`}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                </th>
              ))}

              {/* SMS Count Column */}
              <th className="py-3 px-4 text-right whitespace-nowrap">
                Total SMS
              </th>

              {/* Rate Column */}
              {showRate && (
                <th className="py-3 px-4 text-right whitespace-nowrap">
                  Rate ({currency})
                </th>
              )}

              {/* Total Column (Always shown) */}
              <th className="py-3 px-4 text-right whitespace-nowrap">
                Total ({currency})
              </th>

              {/* Actions */}
              <th className="py-3 px-4 text-center w-36 whitespace-nowrap">
                Report Action
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
            {sortedList.length === 0 ? (
              <tr>
                <td
                  colSpan={6 + panels.length + (showRate ? 1 : 0)}
                  className="py-12 text-center text-slate-400 text-sm"
                >
                  No client records yet. Click "Import SMS List" or add a client below.
                </td>
              </tr>
            ) : (
              sortedList.map((client, index) => {
                const isEditing = editingId === client.id;
                const rowTotal = calculateAmount(client.sms, rate).toFixed(2);
                const isSelected = selectedClientIds.includes(client.id);

                return (
                  <tr
                    key={client.id}
                    className={`hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors group ${
                      isSelected ? 'bg-amber-500/10 dark:bg-amber-950/20' : ''
                    }`}
                  >
                    {/* Multi-Select Row Checkbox */}
                    <td className="py-3 px-2 text-center">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedClientIds((prev) =>
                            prev.includes(client.id) ? prev.filter((id) => id !== client.id) : [...prev, client.id]
                          );
                        }}
                        className="p-1 cursor-pointer"
                        title="Select client for combined slip"
                      >
                        {isSelected ? (
                          <CheckSquare className="w-4 h-4 text-amber-500" />
                        ) : (
                          <Square className="w-4 h-4 text-slate-300 dark:text-slate-600 hover:text-slate-500" />
                        )}
                      </button>
                    </td>

                    {/* Date Range */}
                    <td className="py-3 px-3 text-center font-bold text-slate-600 dark:text-slate-400 text-xs whitespace-nowrap">
                      <span className="text-slate-400 font-mono mr-1">#{index + 1}</span>
                      <span className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-[11px]">
                        {startDate && endDate ? `${startDate.substring(5)} to ${endDate.substring(5)}` : 'Weekly'}
                      </span>
                    </td>

                    {/* Client Name */}
                    <td className="py-3 px-4 font-bold text-slate-800 dark:text-slate-100">
                      {isEditing ? (
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="w-full px-2 py-1 text-sm font-bold border border-sky-400 rounded focus:outline-hidden"
                          autoFocus
                        />
                      ) : (
                        <span
                          onClick={() => startEdit(client)}
                          className="hover:text-sky-600 cursor-pointer"
                          title="Click to edit name"
                        >
                          {client.name}
                        </span>
                      )}
                    </td>

                    {/* Panels Cells */}
                    {panels.map((p) => {
                      const panelVal = isEditing
                        ? editPanels[p.id] ?? 0
                        : (client.panels && client.panels[p.id]) ?? 0;

                      return (
                        <td
                          key={p.id}
                          className="py-3 px-3 text-right bg-amber-50/20 dark:bg-amber-950/10 border-x border-amber-100/60 dark:border-amber-900/20 font-semibold text-slate-700 dark:text-slate-300"
                        >
                          {isEditing ? (
                            <input
                              type="number"
                              min="0"
                              value={panelVal}
                              onChange={(e) =>
                                handleEditPanelValue(p.id, parseInt(e.target.value, 10) || 0)
                              }
                              className="w-20 px-1.5 py-1 text-xs font-bold border border-amber-400 rounded text-right focus:outline-hidden bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                            />
                          ) : (
                            <span
                              onClick={() => startEdit(client)}
                              className="cursor-pointer hover:text-amber-600"
                              title={`Edit ${p.name} SMS`}
                            >
                              {panelVal > 0 ? panelVal.toLocaleString() : '-'}
                            </span>
                          )}
                        </td>
                      );
                    })}

                    {/* SMS Count Column */}
                    <td className="py-3 px-4 text-right font-extrabold text-sky-700 dark:text-sky-400">
                      {isEditing && panels.length === 0 ? (
                        <input
                          type="number"
                          value={editSms}
                          onChange={(e) => setEditSms(parseInt(e.target.value, 10) || 0)}
                          className="w-24 px-2 py-1 text-sm font-bold border border-sky-400 rounded text-right focus:outline-hidden"
                        />
                      ) : (
                        <span
                          onClick={() => startEdit(client)}
                          className="cursor-pointer hover:underline"
                          title="Total SMS Count"
                        >
                          {client.sms.toLocaleString()}
                        </span>
                      )}
                    </td>

                    {/* Rate Column */}
                    {showRate && (
                      <td className="py-3 px-4 text-right text-slate-600 dark:text-slate-400 font-medium text-xs">
                        {rate}
                      </td>
                    )}

                    {/* Total PKR Column (Always shown) */}
                    <td className="py-3 px-4 text-right font-extrabold text-[#002a4e] dark:text-amber-400">
                      {rowTotal}
                    </td>

                    {/* Actions: Priority Save Slip with PIN */}
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        {isEditing ? (
                          <button
                            onClick={() => saveEdit(client.id)}
                            className="p-1.5 bg-emerald-100 text-emerald-800 rounded-lg font-bold hover:bg-emerald-200 cursor-pointer"
                            title="Save changes"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                        ) : (
                          <>
                            {/* PRIORITY SLIP SAVE WITH PIN */}
                            <button
                              onClick={() => onRequestDownloadImage(client)}
                              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-gradient-to-r from-[#002a4e] to-blue-900 hover:from-blue-900 hover:to-[#002a4e] text-white text-[11px] font-bold cursor-pointer shadow-xs group"
                              title="Download Crown Slip (Requires PIN, archives to History)"
                            >
                              <Lock className="w-3 h-3 text-amber-400 group-hover:rotate-12 transition-transform" />
                              <span>Save Slip</span>
                            </button>

                            <button
                              onClick={() => startEdit(client)}
                              className="p-1 text-slate-400 hover:text-sky-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded cursor-pointer"
                              title="Edit Client"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={() => onDeleteClient(client.id)}
                              className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 rounded cursor-pointer"
                              title="Delete Client"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>

          {/* Table Footer with Totals */}
          {clients.length > 0 && (
            <tfoot>
              <tr className="bg-slate-100 dark:bg-slate-800 font-extrabold text-slate-900 dark:text-white border-t-2 border-slate-300 dark:border-slate-700">
                <td className="py-3.5 px-2 text-center text-xs text-slate-400">
                  {selectedClientIds.length > 0 ? `${selectedClientIds.length}✓` : ''}
                </td>
                <td className="py-3.5 px-3 text-center text-xs text-slate-500">
                  {formattedDateRange}
                </td>
                <td className="py-3.5 px-4 text-slate-800 dark:text-slate-100">
                  TOTAL ({clients.length} Clients)
                </td>

                {/* Panel Column Totals */}
                {panels.map((p) => {
                  const pSum = clients.reduce(
                    (sum, c) => sum + ((c.panels && c.panels[p.id]) || 0),
                    0
                  );
                  return (
                    <td
                      key={p.id}
                      className="py-3.5 px-3 text-right bg-amber-100/60 dark:bg-amber-950/40 border-x border-amber-200 dark:border-amber-900/40 text-amber-900 dark:text-amber-300 font-black"
                    >
                      {pSum.toLocaleString()}
                    </td>
                  );
                })}

                <td className="py-3.5 px-4 text-right text-sky-700 dark:text-sky-400 text-base font-black">
                  {totalSms.toLocaleString()}
                </td>

                {showRate && (
                  <td className="py-3.5 px-4 text-right text-xs text-slate-500 font-semibold">
                    {rate} {currency}
                  </td>
                )}

                <td className="py-3.5 px-4 text-right text-emerald-600 dark:text-emerald-400 text-base font-black">
                  {grandTotal.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}{' '}
                  {currency}
                </td>

                <td className="py-3.5 px-4 text-center">
                  <span className="text-[11px] text-slate-500 font-bold">
                    ★ KBMAX Verified
                  </span>
                </td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>

      {/* Quick Add Client Row at Bottom */}
      <form
        onSubmit={handleAddNewClient}
        className="p-3 bg-slate-50 dark:bg-slate-800/60 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center gap-2"
      >
        <span className="text-xs font-bold text-slate-600 dark:text-slate-300 whitespace-nowrap flex items-center gap-1">
          <Plus className="w-3.5 h-3.5 text-sky-600" />
          Add Client:
        </span>

        <input
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="Client Name (e.g. Client Alpha)"
          className="flex-1 min-w-[150px] px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-semibold text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-[#002a4e]"
        />

        {/* Panel inputs if panels exist */}
        {panels.length > 0 ? (
          panels.map((p) => (
            <input
              key={p.id}
              type="number"
              min="0"
              value={newPanelValues[p.id] || ''}
              onChange={(e) =>
                setNewPanelValues({ ...newPanelValues, [p.id]: e.target.value })
              }
              placeholder={`${p.name} SMS`}
              className="w-28 px-2 py-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-bold text-slate-800 dark:text-slate-100 placeholder-slate-400 text-right focus:outline-hidden focus:ring-2 focus:ring-amber-500"
            />
          ))
        ) : (
          <input
            type="number"
            min="0"
            value={newDirectSms}
            onChange={(e) => setNewDirectSms(e.target.value)}
            placeholder="SMS Count"
            className="w-28 px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-semibold text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-sky-500"
          />
        )}

        <button
          type="submit"
          className="px-4 py-1.5 rounded-lg bg-[#002a4e] hover:bg-blue-900 text-white text-xs font-bold transition-colors cursor-pointer shadow-2xs whitespace-nowrap"
        >
          + Add Client Row
        </button>
      </form>

      {/* COMBINED SLIP MODAL */}
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
        customConfig={customConfig}
        onOpenCustomizeModal={onOpenCustomizeModal}
        onSaveToHistory={onSaveCombinedToHistory}
        onRequestSavePin={onRequestSaveCombinedPin}
      />
    </div>
  );
};
