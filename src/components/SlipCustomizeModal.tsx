import React, { useState } from 'react';
import {
  X,
  Type,
  Palette,
  Check,
  RotateCcw,
  Sparkles,
  Eye,
  Sliders,
  FileText,
  Download,
  Layers,
  Square,
  Bookmark,
} from 'lucide-react';
import { SlipCustomConfig, SlipFontFamily, ClientRecord, Panel } from '../types';
import { SLIP_FONTS, DEFAULT_SLIP_CUSTOM_CONFIG, getSlipTemplate, SlipTemplateId } from '../utils/slipTemplates';
import { downloadParchiImage, createCombinedParchiDataUrl } from '../utils/parchiImage';

interface SlipCustomizeModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: SlipCustomConfig;
  onSaveConfig: (newConfig: SlipCustomConfig) => void;
  currentTemplateId: SlipTemplateId;
  sampleClient?: ClientRecord;
  rate: number;
  currency: string;
  startDate?: string;
  endDate?: string;
  panels: Panel[];
}

export const SlipCustomizeModal: React.FC<SlipCustomizeModalProps> = ({
  isOpen,
  onClose,
  config,
  onSaveConfig,
  currentTemplateId,
  sampleClient,
  rate,
  currency,
  startDate = '',
  endDate = '',
  panels,
}) => {
  const [activeTab, setActiveTab] = useState<'colors' | 'text' | 'fonts'>('colors');
  const [previewMode, setPreviewMode] = useState<'single' | 'combined'>('single');
  const [colorSubSection, setColorSubSection] = useState<'borders' | 'boxes' | 'text'>('borders');
  const [form, setForm] = useState<SlipCustomConfig>({ ...DEFAULT_SLIP_CUSTOM_CONFIG, ...config });

  if (!isOpen) return null;

  const currentTemplate = getSlipTemplate(currentTemplateId);

  const previewClient: ClientRecord = sampleClient || {
    id: 'sample-1',
    name: 'M. Kamran (VIP VIP)',
    sms: 48500,
    panels: { [panels[0]?.id || 'p1']: 25000, [panels[1]?.id || 'p2']: 23500 },
  };

  const sampleCombinedClients: ClientRecord[] = [
    previewClient,
    {
      id: 'sample-2',
      name: 'Ahmed Telecom Service',
      sms: 32000,
      panels: { [panels[0]?.id || 'p1']: 18000, [panels[1]?.id || 'p2']: 14000 },
    },
  ];

  const handleSave = () => {
    onSaveConfig(form);
    onClose();
  };

  const handleReset = () => {
    setForm({ ...DEFAULT_SLIP_CUSTOM_CONFIG });
  };

  const handleTestDownload = () => {
    downloadParchiImage({
      client: previewClient,
      rate,
      currency,
      startDate: startDate || '2026-09-24',
      endDate: endDate || '2026-09-30',
      showRate: true,
      panelsList: panels,
      templateId: currentTemplateId,
      customConfig: form,
    });
  };

  // Font setup
  const fontObj = SLIP_FONTS.find((f) => f.family === form.fontFamily) || SLIP_FONTS[0];
  const activeFontFamily = `"${fontObj.family}", sans-serif`;

  // Resolved Colors for Live Preview
  const useTriTone = form.enableTriToneBorder ?? true;
  const topC = form.topBorderColor || (form.overrideColors && form.customBorderColor ? form.customBorderColor : currentTemplate.colors.border);
  const centerC = form.centerBorderColor || (form.overrideColors && form.customAccentColor ? form.customAccentColor : currentTemplate.colors.accent);
  const bottomC = form.bottomBorderColor || (form.overrideColors && form.customBorderColor ? form.customBorderColor : currentTemplate.colors.border);
  const innerC = form.innerFrameColor || centerC;
  const dividerC = form.dividerLineColor || centerC;
  const clientBoxBorderC = form.clientBoxBorderColor || centerC;
  const clientBoxBgC = form.clientBoxBgColor || (currentTemplate.isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)');
  const cardBgC = form.customBgColor || (currentTemplate.isDark ? '#0f172a' : '#ffffff');
  const titleC = form.headerTitleColor || (form.overrideColors && form.customTextColor ? form.customTextColor : currentTemplate.colors.titleColor);
  const subHeaderC = form.subHeaderColor || (currentTemplate.isDark ? '#94a3b8' : '#64748b');
  const clientNameC = form.clientNameColor || (form.overrideColors && form.customTextColor ? form.customTextColor : currentTemplate.colors.clientTextColor);
  const panelsC = form.panelsColor || (currentTemplate.isDark ? '#cbd5e1' : '#475569');
  const smsCountC = form.smsCountColor || currentTemplate.colors.smsCountColor;
  const rateC = form.rateColor || currentTemplate.colors.rateColor;
  const totalAmountC = form.totalAmountColor || currentTemplate.colors.totalColor;
  const customNoteC = form.customNoteColor || centerC;
  const stampC = form.stampColor || currentTemplate.colors.stampColor;
  const grandTotalBorderC = form.grandTotalBorderColor || centerC;
  const grandTotalBgC = form.grandTotalBgColor || (currentTemplate.isDark ? '#0f172a' : '#f8fafc');

  // Master Color Themes Presets
  const applyMasterTheme = (theme: {
    top: string;
    center: string;
    bottom: string;
    inner: string;
    divider: string;
    boxBorder: string;
    boxBg: string;
    title: string;
    sub: string;
    client: string;
    panels: string;
    sms: string;
    rate: string;
    total: string;
    note: string;
    stamp: string;
    bg: string;
    grandBorder: string;
    grandBg: string;
  }) => {
    setForm({
      ...form,
      enableTriToneBorder: true,
      topBorderColor: theme.top,
      centerBorderColor: theme.center,
      bottomBorderColor: theme.bottom,
      innerFrameColor: theme.inner,
      dividerLineColor: theme.divider,
      clientBoxBorderColor: theme.boxBorder,
      clientBoxBgColor: theme.boxBg,
      headerTitleColor: theme.title,
      subHeaderColor: theme.sub,
      clientNameColor: theme.client,
      panelsColor: theme.panels,
      smsCountColor: theme.sms,
      rateColor: theme.rate,
      totalAmountColor: theme.total,
      customNoteColor: theme.note,
      stampColor: theme.stamp,
      customBgColor: theme.bg,
      grandTotalBorderColor: theme.grandBorder,
      grandTotalBgColor: theme.grandBg,
    });
  };

  // Helper component for Color input with direct Hex code box
  const ColorItem = ({
    label,
    value,
    onChange,
    hint,
  }: {
    label: string;
    value?: string;
    onChange: (c: string) => void;
    hint?: string;
  }) => (
    <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[11px] font-bold text-slate-200">{label}</span>
        {hint && <span className="text-[9px] text-slate-400">{hint}</span>}
      </div>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={value || '#002a4e'}
          onChange={(e) => onChange(e.target.value)}
          className="w-7 h-7 rounded border border-slate-700 cursor-pointer bg-transparent p-0"
        />
        <input
          type="text"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder="#002a4e"
          className="bg-slate-950 border border-slate-700 rounded px-2 py-1 text-xs text-white font-mono flex-1 focus:outline-hidden focus:border-amber-400"
        />
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-5xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden my-auto max-h-[94vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-300 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-amber-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                Slip Styling
              </h2>
              <p className="text-xs text-slate-400">
                Customize colors, typography, and borders
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleReset}
              className="px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition flex items-center gap-1.5 cursor-pointer"
              title="Reset all settings to default"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Navigation Tabs */}
        <div className="flex border-b border-slate-800 bg-slate-900/60 px-6 gap-2 pt-2">
          <button
            onClick={() => setActiveTab('colors')}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-t-lg transition border-b-2 cursor-pointer ${
              activeTab === 'colors'
                ? 'text-amber-400 border-amber-400 bg-slate-800/60'
                : 'text-slate-400 border-transparent hover:text-slate-200'
            }`}
          >
            <Palette className="w-3.5 h-3.5" />
            Colors
          </button>
          <button
            onClick={() => setActiveTab('text')}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-t-lg transition border-b-2 cursor-pointer ${
              activeTab === 'text'
                ? 'text-amber-400 border-amber-400 bg-slate-800/60'
                : 'text-slate-400 border-transparent hover:text-slate-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            Text
          </button>
          <button
            onClick={() => setActiveTab('fonts')}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-t-lg transition border-b-2 cursor-pointer ${
              activeTab === 'fonts'
                ? 'text-amber-400 border-amber-400 bg-slate-800/60'
                : 'text-slate-400 border-transparent hover:text-slate-200'
            }`}
          >
            <Type className="w-3.5 h-3.5" />
            Fonts
          </button>
        </div>

        {/* Modal Body: Controls & Live Preview */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Editor Controls (7 Cols) */}
          <div className="lg:col-span-7 space-y-5">
            {/* TAB 1: ALL LINES & COLORS (A TO Z) */}
            {activeTab === 'colors' && (
              <div className="space-y-4">
                {/* 1-Click Master Color Presets */}
                <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" />
                      1-Click Master Color Themes (All Colors in 1-Click)
                    </span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        applyMasterTheme({
                          top: '#002a4e',
                          center: '#c89d3c',
                          bottom: '#002a4e',
                          inner: '#c89d3c',
                          divider: '#c89d3c',
                          boxBorder: '#c89d3c',
                          boxBg: 'rgba(200, 157, 60, 0.08)',
                          title: '#002a4e',
                          sub: '#64748b',
                          client: '#002a4e',
                          panels: '#475569',
                          sms: '#0369a1',
                          rate: '#64748b',
                          total: '#047857',
                          note: '#c89d3c',
                          stamp: '#c89d3c',
                          bg: '#ffffff',
                          grandBorder: '#c89d3c',
                          grandBg: '#f8fafc',
                        })
                      }
                      className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-left hover:border-amber-400 transition cursor-pointer"
                    >
                      <div className="flex gap-1 mb-1">
                        <span className="w-3 h-3 rounded-full bg-[#002a4e]" />
                        <span className="w-3 h-3 rounded-full bg-[#c89d3c]" />
                        <span className="w-3 h-3 rounded-full bg-[#047857]" />
                      </div>
                      <span className="text-[11px] font-bold text-white block truncate">👑 Royal Navy & Gold</span>
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        applyMasterTheme({
                          top: '#064e3b',
                          center: '#10b981',
                          bottom: '#064e3b',
                          inner: '#10b981',
                          divider: '#10b981',
                          boxBorder: '#10b981',
                          boxBg: 'rgba(16, 185, 129, 0.08)',
                          title: '#064e3b',
                          sub: '#64748b',
                          client: '#064e3b',
                          panels: '#047857',
                          sms: '#059669',
                          rate: '#64748b',
                          total: '#059669',
                          note: '#10b981',
                          stamp: '#047857',
                          bg: '#ffffff',
                          grandBorder: '#10b981',
                          grandBg: '#f0fdf4',
                        })
                      }
                      className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-left hover:border-emerald-400 transition cursor-pointer"
                    >
                      <div className="flex gap-1 mb-1">
                        <span className="w-3 h-3 rounded-full bg-[#064e3b]" />
                        <span className="w-3 h-3 rounded-full bg-[#10b981]" />
                        <span className="w-3 h-3 rounded-full bg-[#059669]" />
                      </div>
                      <span className="text-[11px] font-bold text-white block truncate">🌿 Cyber Emerald</span>
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        applyMasterTheme({
                          top: '#0c4a6e',
                          center: '#0284c7',
                          bottom: '#0369a1',
                          inner: '#06b6d4',
                          divider: '#0284c7',
                          boxBorder: '#0284c7',
                          boxBg: 'rgba(2, 132, 199, 0.08)',
                          title: '#0c4a6e',
                          sub: '#64748b',
                          client: '#0369a1',
                          panels: '#0284c7',
                          sms: '#0284c7',
                          rate: '#64748b',
                          total: '#0284c7',
                          note: '#06b6d4',
                          stamp: '#0369a1',
                          bg: '#ffffff',
                          grandBorder: '#0284c7',
                          grandBg: '#f0f9ff',
                        })
                      }
                      className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-left hover:border-cyan-400 transition cursor-pointer"
                    >
                      <div className="flex gap-1 mb-1">
                        <span className="w-3 h-3 rounded-full bg-[#0c4a6e]" />
                        <span className="w-3 h-3 rounded-full bg-[#0284c7]" />
                        <span className="w-3 h-3 rounded-full bg-[#06b6d4]" />
                      </div>
                      <span className="text-[11px] font-bold text-white block truncate">💎 Sapphire Ice</span>
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        applyMasterTheme({
                          top: '#881337',
                          center: '#f43f5e',
                          bottom: '#881337',
                          inner: '#f43f5e',
                          divider: '#f43f5e',
                          boxBorder: '#f43f5e',
                          boxBg: 'rgba(244, 63, 94, 0.08)',
                          title: '#881337',
                          sub: '#64748b',
                          client: '#881337',
                          panels: '#be123c',
                          sms: '#be123c',
                          rate: '#64748b',
                          total: '#be123c',
                          note: '#f43f5e',
                          stamp: '#be123c',
                          bg: '#ffffff',
                          grandBorder: '#f43f5e',
                          grandBg: '#fff1f2',
                        })
                      }
                      className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-left hover:border-rose-400 transition cursor-pointer"
                    >
                      <div className="flex gap-1 mb-1">
                        <span className="w-3 h-3 rounded-full bg-[#881337]" />
                        <span className="w-3 h-3 rounded-full bg-[#f43f5e]" />
                        <span className="w-3 h-3 rounded-full bg-[#be123c]" />
                      </div>
                      <span className="text-[11px] font-bold text-white block truncate">🍷 Crimson Dynasty</span>
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        applyMasterTheme({
                          top: '#18181b',
                          center: '#d97706',
                          bottom: '#18181b',
                          inner: '#f59e0b',
                          divider: '#d97706',
                          boxBorder: '#d97706',
                          boxBg: '#18181b',
                          title: '#f8fafc',
                          sub: '#a1a1aa',
                          client: '#fbbf24',
                          panels: '#d4d4d8',
                          sms: '#38bdf8',
                          rate: '#94a3b8',
                          total: '#34d399',
                          note: '#fbbf24',
                          stamp: '#f59e0b',
                          bg: '#09090b',
                          grandBorder: '#d97706',
                          grandBg: '#18181b',
                        })
                      }
                      className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-left hover:border-amber-400 transition cursor-pointer"
                    >
                      <div className="flex gap-1 mb-1">
                        <span className="w-3 h-3 rounded-full bg-[#18181b]" />
                        <span className="w-3 h-3 rounded-full bg-[#d97706]" />
                        <span className="w-3 h-3 rounded-full bg-[#34d399]" />
                      </div>
                      <span className="text-[11px] font-bold text-white block truncate">🖤 Dark Obsidian & Gold</span>
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        applyMasterTheme({
                          top: '#1e1b4b',
                          center: '#8b5cf6',
                          bottom: '#312e81',
                          inner: '#a78bfa',
                          divider: '#8b5cf6',
                          boxBorder: '#8b5cf6',
                          boxBg: '#1e1b4b',
                          title: '#f8fafc',
                          sub: '#c4b5fd',
                          client: '#ede9fe',
                          panels: '#c4b5fd',
                          sms: '#38bdf8',
                          rate: '#94a3b8',
                          total: '#a855f7',
                          note: '#c084fc',
                          stamp: '#a78bfa',
                          bg: '#09090b',
                          grandBorder: '#8b5cf6',
                          grandBg: '#1e1b4b',
                        })
                      }
                      className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-left hover:border-purple-400 transition cursor-pointer"
                    >
                      <div className="flex gap-1 mb-1">
                        <span className="w-3 h-3 rounded-full bg-[#1e1b4b]" />
                        <span className="w-3 h-3 rounded-full bg-[#8b5cf6]" />
                        <span className="w-3 h-3 rounded-full bg-[#a855f7]" />
                      </div>
                      <span className="text-[11px] font-bold text-white block truncate">⚡ Midnight Violet</span>
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        applyMasterTheme({
                          top: '#7c2d12',
                          center: '#ea580c',
                          bottom: '#991b1b',
                          inner: '#f97316',
                          divider: '#ea580c',
                          boxBorder: '#ea580c',
                          boxBg: 'rgba(234, 88, 12, 0.08)',
                          title: '#7c2d12',
                          sub: '#64748b',
                          client: '#9a3412',
                          panels: '#ea580c',
                          sms: '#ea580c',
                          rate: '#64748b',
                          total: '#c2410c',
                          note: '#f97316',
                          stamp: '#9a3412',
                          bg: '#ffffff',
                          grandBorder: '#ea580c',
                          grandBg: '#fff7ed',
                        })
                      }
                      className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-left hover:border-orange-400 transition cursor-pointer"
                    >
                      <div className="flex gap-1 mb-1">
                        <span className="w-3 h-3 rounded-full bg-[#7c2d12]" />
                        <span className="w-3 h-3 rounded-full bg-[#ea580c]" />
                        <span className="w-3 h-3 rounded-full bg-[#f97316]" />
                      </div>
                      <span className="text-[11px] font-bold text-white block truncate">🌅 Sunset Amber</span>
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        applyMasterTheme({
                          top: '#334155',
                          center: '#64748b',
                          bottom: '#334155',
                          inner: '#94a3b8',
                          divider: '#64748b',
                          boxBorder: '#64748b',
                          boxBg: 'rgba(100, 116, 139, 0.08)',
                          title: '#0f172a',
                          sub: '#64748b',
                          client: '#0f172a',
                          panels: '#475569',
                          sms: '#2563eb',
                          rate: '#64748b',
                          total: '#059669',
                          note: '#64748b',
                          stamp: '#475569',
                          bg: '#ffffff',
                          grandBorder: '#64748b',
                          grandBg: '#f8fafc',
                        })
                      }
                      className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-left hover:border-slate-400 transition cursor-pointer"
                    >
                      <div className="flex gap-1 mb-1">
                        <span className="w-3 h-3 rounded-full bg-[#334155]" />
                        <span className="w-3 h-3 rounded-full bg-[#64748b]" />
                        <span className="w-3 h-3 rounded-full bg-[#2563eb]" />
                      </div>
                      <span className="text-[11px] font-bold text-white block truncate">🏛️ Platinum Executive</span>
                    </button>
                  </div>
                </div>

                {/* Sub-Tabs for Line Categories */}
                <div className="flex gap-2 border-b border-slate-800 pb-2">
                  <button
                    type="button"
                    onClick={() => setColorSubSection('borders')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                      colorSubSection === 'borders'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                        : 'text-slate-400 hover:text-white bg-slate-950/60'
                    }`}
                  >
                    <Layers className="w-3.5 h-3.5" />
                    Borders
                  </button>
                  <button
                    type="button"
                    onClick={() => setColorSubSection('boxes')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                      colorSubSection === 'boxes'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                        : 'text-slate-400 hover:text-white bg-slate-950/60'
                    }`}
                  >
                    <Square className="w-3.5 h-3.5" />
                    Containers
                  </button>
                  <button
                    type="button"
                    onClick={() => setColorSubSection('text')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                      colorSubSection === 'text'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                        : 'text-slate-400 hover:text-white bg-slate-950/60'
                    }`}
                  >
                    <Bookmark className="w-3.5 h-3.5" />
                    Text & Amounts
                  </button>
                </div>

                {/* SUB-SECTION 1: BORDERS & DIVIDERS */}
                {colorSubSection === 'borders' && (
                  <div className="space-y-3">
                    <p className="text-xs text-slate-400">
                      Customize outer frame lines, top accent bar, center line, bottom accent bar and horizontal dividers:
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <ColorItem
                        label="1. Top Border Line (Header)"
                        value={form.topBorderColor}
                        onChange={(c) => setForm({ ...form, topBorderColor: c })}
                        hint="Top border line"
                      />
                      <ColorItem
                        label="2. Center Border Line (Body)"
                        value={form.centerBorderColor}
                        onChange={(c) => setForm({ ...form, centerBorderColor: c })}
                        hint="Center border line"
                      />
                      <ColorItem
                        label="3. Bottom Border Line (Footer)"
                        value={form.bottomBorderColor}
                        onChange={(c) => setForm({ ...form, bottomBorderColor: c })}
                        hint="Bottom border line"
                      />
                      <ColorItem
                        label="4. Inner Frame & Corner Brackets"
                        value={form.innerFrameColor}
                        onChange={(c) => setForm({ ...form, innerFrameColor: c })}
                        hint="Inner frame & corner brackets"
                      />
                      <ColorItem
                        label="5. Horizontal Separator / Divider Line"
                        value={form.dividerLineColor}
                        onChange={(c) => setForm({ ...form, dividerLineColor: c })}
                        hint="Center divider line"
                      />
                    </div>
                  </div>
                )}

                {/* SUB-SECTION 2: BOXES & BACKGROUNDS */}
                {colorSubSection === 'boxes' && (
                  <div className="space-y-3">
                    <p className="text-xs text-slate-400">
                      Customize box outlines, container backgrounds, and overall slip background fill:
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <ColorItem
                        label="1. Client Box Border Line"
                        value={form.clientBoxBorderColor}
                        onChange={(c) => setForm({ ...form, clientBoxBorderColor: c })}
                        hint="Client account box border"
                      />
                      <ColorItem
                        label="2. Client Box Background Fill"
                        value={form.clientBoxBgColor}
                        onChange={(c) => setForm({ ...form, clientBoxBgColor: c })}
                        hint="Client account box background"
                      />
                      <ColorItem
                        label="3. Grand Total Box Border (Combined)"
                        value={form.grandTotalBorderColor}
                        onChange={(c) => setForm({ ...form, grandTotalBorderColor: c })}
                        hint="Grand total box border"
                      />
                      <ColorItem
                        label="4. Grand Total Box Background (Combined)"
                        value={form.grandTotalBgColor}
                        onChange={(c) => setForm({ ...form, grandTotalBgColor: c })}
                        hint="Grand total box background"
                      />
                      <ColorItem
                        label="5. Main Slip Background Fill"
                        value={form.customBgColor}
                        onChange={(c) => setForm({ ...form, customBgColor: c })}
                        hint="Main slip canvas background"
                      />
                    </div>
                  </div>
                )}

                {/* SUB-SECTION 3: TEXT LINES & AMOUNTS */}
                {colorSubSection === 'text' && (
                  <div className="space-y-3">
                    <p className="text-xs text-slate-400">
                      Customize text colors for every line from brand title down to the stamp seal:
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <ColorItem
                        label="1. Header Brand Title Line"
                        value={form.headerTitleColor}
                        onChange={(c) => setForm({ ...form, headerTitleColor: c })}
                        hint="Company title line"
                      />
                      <ColorItem
                        label="2. Subtitle / Date & ID Line"
                        value={form.subHeaderColor}
                        onChange={(c) => setForm({ ...form, subHeaderColor: c })}
                        hint="Date range & ID metadata"
                      />
                      <ColorItem
                        label="3. Client Name Line"
                        value={form.clientNameColor}
                        onChange={(c) => setForm({ ...form, clientNameColor: c })}
                        hint="Client account name"
                      />
                      <ColorItem
                        label="4. Panels Breakdown Line"
                        value={form.panelsColor}
                        onChange={(c) => setForm({ ...form, panelsColor: c })}
                        hint="Panels breakdown text"
                      />
                      <ColorItem
                        label="5. Total SMS Count Line"
                        value={form.smsCountColor}
                        onChange={(c) => setForm({ ...form, smsCountColor: c })}
                        hint="Total SMS count"
                      />
                      <ColorItem
                        label="6. Rate Line (/SMS)"
                        value={form.rateColor}
                        onChange={(c) => setForm({ ...form, rateColor: c })}
                        hint="Rate per SMS text"
                      />
                      <ColorItem
                        label="7. Total Amount PKR Line (Highlighted)"
                        value={form.totalAmountColor}
                        onChange={(c) => setForm({ ...form, totalAmountColor: c })}
                        hint="Total amount PKR highlight"
                      />
                      <ColorItem
                        label="8. Custom Remarks / Notice Line"
                        value={form.customNoteColor}
                        onChange={(c) => setForm({ ...form, customNoteColor: c })}
                        hint="Custom note & remarks"
                      />
                      <ColorItem
                        label="9. Stamp Seal Line"
                        value={form.stampColor}
                        onChange={(c) => setForm({ ...form, stampColor: c })}
                        hint="Verification stamp & seal"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: TEXT & CONTENT */}
            {activeTab === 'text' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                    Slip Brand / Header Title
                  </label>
                  <input
                    type="text"
                    value={form.headerTitle}
                    onChange={(e) => setForm({ ...form, headerTitle: e.target.value })}
                    placeholder="e.g. KBMAX WEEKLY REPORTS or Your Company Name"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-white text-xs focus:outline-hidden focus:border-amber-400 transition"
                  />
                  <span className="text-[11px] text-slate-400 mt-1 block">
                    Displayed prominently directly below the slip logo.
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                    Custom Subtitle / Date Description
                  </label>
                  <input
                    type="text"
                    value={form.subHeader}
                    onChange={(e) => setForm({ ...form, subHeader: e.target.value })}
                    placeholder="Leave empty for auto dates, or e.g. WEEKLY BILLING RECORD"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-white text-xs focus:outline-hidden focus:border-amber-400 transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                    Custom Stamp / Seal Text
                  </label>
                  <input
                    type="text"
                    value={form.stampText}
                    onChange={(e) => setForm({ ...form, stampText: e.target.value })}
                    placeholder={`Default: ${currentTemplate.stamp}`}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-white text-xs focus:outline-hidden focus:border-amber-400 transition"
                  />
                  <span className="text-[11px] text-slate-400 mt-1 block">
                    Verification text stamped at the bottom of the slip.
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                    Custom Remarks / Notice Strip
                  </label>
                  <input
                    type="text"
                    value={form.customNote}
                    onChange={(e) => setForm({ ...form, customNote: e.target.value })}
                    placeholder="e.g. Payment due Monday • Thank you for your business"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-white text-xs focus:outline-hidden focus:border-amber-400 transition"
                  />
                  <span className="text-[11px] text-slate-400 mt-1 block">
                    Optional footer note or special instruction for clients.
                  </span>
                </div>

                {/* Display Toggles */}
                <div className="pt-2 border-t border-slate-800 grid grid-cols-3 gap-3">
                  <label className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 cursor-pointer hover:border-slate-700 transition">
                    <input
                      type="checkbox"
                      checked={form.showDateLine}
                      onChange={(e) => setForm({ ...form, showDateLine: e.target.checked })}
                      className="rounded text-amber-500 focus:ring-amber-400"
                    />
                    <span className="text-xs text-slate-300 font-medium">Show Date Line</span>
                  </label>

                  <label className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 cursor-pointer hover:border-slate-700 transition">
                    <input
                      type="checkbox"
                      checked={form.showIdBadge}
                      onChange={(e) => setForm({ ...form, showIdBadge: e.target.checked })}
                      className="rounded text-amber-500 focus:ring-amber-400"
                    />
                    <span className="text-xs text-slate-300 font-medium">Show ID (KB-001)</span>
                  </label>

                  <label className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 cursor-pointer hover:border-slate-700 transition">
                    <input
                      type="checkbox"
                      checked={form.showStamp}
                      onChange={(e) => setForm({ ...form, showStamp: e.target.checked })}
                      className="rounded text-amber-500 focus:ring-amber-400"
                    />
                    <span className="text-xs text-slate-300 font-medium">Show Stamp Seal</span>
                  </label>
                </div>
              </div>
            )}

            {/* TAB 3: FONTS & TYPOGRAPHY */}
            {activeTab === 'fonts' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Select Slip Font Family (10 Fonts)
                  </label>
                  <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, fontSizeScale: 'compact' })}
                      className={`px-2 py-1 text-xs rounded font-medium cursor-pointer ${
                        form.fontSizeScale === 'compact'
                          ? 'bg-amber-500 text-slate-950 font-bold'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Compact
                    </button>
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, fontSizeScale: 'normal' })}
                      className={`px-2 py-1 text-xs rounded font-medium cursor-pointer ${
                        form.fontSizeScale === 'normal'
                          ? 'bg-amber-500 text-slate-950 font-bold'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Normal
                    </button>
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, fontSizeScale: 'large' })}
                      className={`px-2 py-1 text-xs rounded font-medium cursor-pointer ${
                        form.fontSizeScale === 'large'
                          ? 'bg-amber-500 text-slate-950 font-bold'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Large
                    </button>
                  </div>
                </div>

                {/* 10 Font Cards Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[420px] overflow-y-auto pr-1">
                  {SLIP_FONTS.map((font) => {
                    const isSelected = form.fontFamily === font.family;
                    return (
                      <button
                        key={font.family}
                        type="button"
                        onClick={() => setForm({ ...form, fontFamily: font.family })}
                        className={`text-left p-3 rounded-xl border transition-all relative cursor-pointer ${
                          isSelected
                            ? 'bg-amber-500/10 border-amber-400 ring-1 ring-amber-400/50 shadow-md'
                            : 'bg-slate-950/70 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-bold text-white">{font.label}</span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                            {font.category}
                          </span>
                        </div>
                        <p
                          className="text-sm font-semibold text-amber-300/90 truncate tracking-wide mt-1"
                          style={{ fontFamily: `"${font.family}", sans-serif` }}
                        >
                          {font.previewText}
                        </p>
                        {isSelected && (
                          <div className="absolute bottom-2 right-2 w-5 h-5 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center">
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Live Interactive Slip Preview (5 Cols) */}
          <div className="lg:col-span-5 flex flex-col items-center justify-start p-4 bg-slate-950/90 rounded-2xl border border-slate-800">
            {/* Preview Controls Header */}
            <div className="w-full flex items-center justify-between mb-3 text-xs text-slate-400 px-1">
              <span className="flex items-center gap-1.5 font-bold text-slate-300">
                <Eye className="w-4 h-4 text-amber-400" />
                Live Preview
              </span>
              <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800">
                <button
                  type="button"
                  onClick={() => setPreviewMode('single')}
                  className={`px-2 py-0.5 rounded text-[11px] font-bold cursor-pointer transition ${
                    previewMode === 'single'
                      ? 'bg-amber-500 text-slate-950'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Single Slip
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewMode('combined')}
                  className={`px-2 py-0.5 rounded text-[11px] font-bold cursor-pointer transition ${
                    previewMode === 'combined'
                      ? 'bg-amber-500 text-slate-950'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Combined Report
                </button>
              </div>
            </div>

            {/* SINGLE SLIP LIVE PREVIEW */}
            {previewMode === 'single' ? (
              <div
                className="w-full max-w-[340px] rounded-xl border-2 p-5 text-center shadow-2xl relative transition-all duration-300 overflow-hidden"
                style={{
                  fontFamily: activeFontFamily,
                  backgroundColor: cardBgC,
                  borderImageSource: `linear-gradient(to bottom, ${topC} 0%, ${topC} 32%, ${centerC} 48%, ${centerC} 68%, ${bottomC} 85%, ${bottomC} 100%)`,
                  borderImageSlice: 1,
                  color: titleC,
                }}
              >
                {/* Distinct Top Section Bar (Top Border) */}
                <div
                  className="absolute top-0 left-0 right-0 h-1"
                  style={{ backgroundColor: topC }}
                />

                {/* Distinct Bottom Section Bar (Bottom Border) */}
                <div
                  className="absolute bottom-0 left-0 right-0 h-1"
                  style={{ backgroundColor: bottomC }}
                />

                {/* Decorative Corner Ornaments */}
                <div
                  className="absolute top-1.5 left-1.5 w-2.5 h-2.5 border-t-2 border-l-2"
                  style={{ borderColor: innerC }}
                />
                <div
                  className="absolute top-1.5 right-1.5 w-2.5 h-2.5 border-t-2 border-r-2"
                  style={{ borderColor: innerC }}
                />
                <div
                  className="absolute bottom-1.5 left-1.5 w-2.5 h-2.5 border-b-2 border-l-2"
                  style={{ borderColor: innerC }}
                />
                <div
                  className="absolute bottom-1.5 right-1.5 w-2.5 h-2.5 border-b-2 border-r-2"
                  style={{ borderColor: innerC }}
                />

                {/* Logo / Badge */}
                <div className="text-2xl mb-1">{currentTemplate.badgeIcon}</div>

                {/* Header Title Line */}
                <h3
                  className="font-extrabold text-sm tracking-wide"
                  style={{ color: titleC }}
                >
                  {form.headerTitle || 'KBMAX WEEKLY REPORTS'}
                </h3>

                {/* Subheader / Date Line */}
                {(form.showDateLine || form.showIdBadge) && (
                  <p
                    className="text-[10px] font-semibold mt-0.5"
                    style={{ color: subHeaderC }}
                  >
                    {form.showDateLine && (form.subHeader || `${startDate || '2026-09-24'} to ${endDate || '2026-09-30'}`)}
                    {form.showDateLine && form.showIdBadge && ' • '}
                    {form.showIdBadge && 'ID: KB-001'}
                  </p>
                )}

                {/* Divider Line */}
                <div
                  className="h-[1.5px] w-3/4 mx-auto my-3"
                  style={{ backgroundColor: dividerC }}
                />

                {/* Client Box */}
                <div
                  className="py-2.5 px-3 rounded-lg my-2 border shadow-xs"
                  style={{
                    borderColor: clientBoxBorderC,
                    backgroundColor: clientBoxBgC,
                  }}
                >
                  <div
                    className="font-black text-base tracking-wide"
                    style={{ color: clientNameC }}
                  >
                    {previewClient.name}
                  </div>
                </div>

                {/* Panels Line */}
                <div className="flex flex-wrap items-center justify-center gap-1.5 my-2">
                  {panels.slice(0, 2).map((p, idx) => (
                    <span
                      key={p.id}
                      className="text-[10px] px-2 py-0.5 rounded-full border font-semibold"
                      style={{
                        borderColor: clientBoxBorderC,
                        color: panelsC,
                        backgroundColor: clientBoxBgC,
                      }}
                    >
                      {p.name}: {idx === 0 ? '25,000' : '23,500'}
                    </span>
                  ))}
                </div>

                {/* Total SMS Line */}
                <div className="my-1.5">
                  <span
                    className="text-sm font-black"
                    style={{ color: smsCountC }}
                  >
                    Total SMS: {previewClient.sms.toLocaleString()} SMS
                  </span>
                </div>

                {/* Rate Line */}
                <div className="mt-1">
                  <div
                    className="text-xs font-semibold"
                    style={{ color: rateC }}
                  >
                    Rate: {rate} {currency} / SMS
                  </div>
                  {/* Total PKR Amount Line */}
                  <div
                    className="text-base font-black mt-0.5"
                    style={{ color: totalAmountC }}
                  >
                    Total Amount: {(previewClient.sms * rate).toFixed(1)} {currency}
                  </div>
                </div>

                {/* Custom Note Line */}
                {form.customNote && (
                  <div
                    className="mt-2 text-[10px] font-semibold italic"
                    style={{ color: customNoteC }}
                  >
                    * {form.customNote}
                  </div>
                )}

                {/* Verification Stamp Seal Line */}
                {form.showStamp && (
                  <div
                    className="mt-3 pt-2 text-[9px] font-bold tracking-wider uppercase border-t opacity-90"
                    style={{
                      color: stampC,
                      borderColor: dividerC,
                    }}
                  >
                    {form.stampText || currentTemplate.stamp}
                  </div>
                )}
              </div>
            ) : (
              /* COMBINED REPORT SLIP LIVE PREVIEW */
              <div
                className="w-full max-w-[340px] rounded-xl border-2 p-4 text-center shadow-2xl relative transition-all duration-300 overflow-hidden text-xs"
                style={{
                  fontFamily: activeFontFamily,
                  backgroundColor: cardBgC,
                  borderColor: centerC,
                  color: titleC,
                }}
              >
                {/* Header */}
                <div className="text-xl mb-0.5">{currentTemplate.badgeIcon}</div>
                <h4
                  className="font-black text-xs uppercase"
                  style={{ color: titleC }}
                >
                  {form.headerTitle || 'KBMAX WEEKLY REPORTS'}
                </h4>
                <p
                  className="text-[9px] font-bold mt-0.5"
                  style={{ color: subHeaderC }}
                >
                  ◆ COMBINED BILLING STATEMENT (2 ACCOUNTS)
                </p>

                {/* Divider Line */}
                <div
                  className="h-[1px] w-full my-2"
                  style={{ backgroundColor: dividerC }}
                />

                {/* Client Entries Preview */}
                <div className="space-y-1.5 my-2">
                  {sampleCombinedClients.map((c, i) => (
                    <div
                      key={c.id}
                      className="p-2 rounded-lg border text-left flex items-center justify-between"
                      style={{
                        borderColor: clientBoxBorderC,
                        backgroundColor: clientBoxBgC,
                      }}
                    >
                      <div>
                        <div className="flex items-center gap-1">
                          <span
                            className="text-[9px] font-bold"
                            style={{ color: centerC }}
                          >
                            #0{i + 1}
                          </span>
                          <span
                            className="font-bold text-[11px] truncate max-w-[130px]"
                            style={{ color: clientNameC }}
                          >
                            {c.name}
                          </span>
                        </div>
                        <div
                          className="text-[9px] font-semibold mt-0.5"
                          style={{ color: panelsC }}
                        >
                          Panel-1: {(c.sms / 2).toLocaleString()}
                        </div>
                      </div>
                      <div className="text-right">
                        <div
                          className="font-bold text-[11px]"
                          style={{ color: smsCountC }}
                        >
                          {c.sms.toLocaleString()} SMS
                        </div>
                        <div
                          className="font-black text-[11px]"
                          style={{ color: totalAmountC }}
                        >
                          {(c.sms * rate).toLocaleString()} {currency}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Grand Total Box */}
                <div
                  className="p-2.5 rounded-lg border-2 text-left my-2"
                  style={{
                    borderColor: grandTotalBorderC,
                    backgroundColor: grandTotalBgC,
                  }}
                >
                  <div
                    className="text-[9px] font-black text-center uppercase tracking-wide mb-1"
                    style={{ color: grandTotalBorderC }}
                  >
                    ★ STATEMENT GRAND TOTAL ★
                  </div>
                  <div className="flex justify-between items-center text-[11px]">
                    <span
                      className="font-bold"
                      style={{ color: smsCountC }}
                    >
                      80,500 Combined SMS
                    </span>
                    <span
                      className="font-black text-xs"
                      style={{ color: totalAmountC }}
                    >
                      {(80500 * rate).toLocaleString()} {currency}
                    </span>
                  </div>
                </div>

                {/* Stamp */}
                {form.showStamp && (
                  <div
                    className="text-[8px] font-bold uppercase mt-2 pt-1 border-t"
                    style={{
                      color: stampC,
                      borderColor: dividerC,
                    }}
                  >
                    {form.stampText || 'OFFICIALLY VERIFIED COMBINED SLIP'}
                  </div>
                )}
              </div>
            )}

            {/* Test Download Button */}
            <button
              type="button"
              onClick={handleTestDownload}
              className="mt-3 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition flex items-center gap-2 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-amber-400" />
              <span>Test Download</span>
            </button>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="flex items-center justify-between px-6 py-3 border-t border-slate-800 bg-slate-950/80">
          <div className="text-xs text-slate-400 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>Applies to Single Slips, Combined Slips, and Sheets.</span>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-4 py-1.5 rounded-xl text-xs font-bold bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 hover:from-amber-400 hover:to-yellow-300 shadow-md shadow-amber-500/20 transition flex items-center gap-1.5 cursor-pointer"
            >
              <Check className="w-3.5 h-3.5 stroke-[3]" />
              <span>Save</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
