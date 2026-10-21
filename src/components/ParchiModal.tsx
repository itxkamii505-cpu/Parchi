import React, { useState, useEffect } from 'react';
import { X, Download, Copy, Check, MessageCircle, Lock, Palette } from 'lucide-react';
import { ClientRecord, LanguageMode, Panel, SlipCustomConfig } from '../types';
import { generateParchiText } from '../utils/export';
import { createParchiDataUrl } from '../utils/parchiImage';
import { SLIP_TEMPLATES, SlipTemplateId, getSlipTemplate } from '../utils/slipTemplates';

interface ParchiModalProps {
  client: ClientRecord | null;
  onClose: () => void;
  rate: number;
  currency: string;
  batchName: string;
  language: LanguageMode;
  startDate: string;
  endDate: string;
  showRate: boolean;
  panels: Panel[];
  selectedTemplate?: SlipTemplateId;
  onSelectTemplate?: (t: SlipTemplateId) => void;
  onRequestDownloadImage: (client: ClientRecord) => void;
  customConfig?: SlipCustomConfig;
}

export const ParchiModal: React.FC<ParchiModalProps> = ({
  client,
  onClose,
  rate,
  currency,
  batchName,
  language,
  startDate,
  endDate,
  showRate,
  panels,
  selectedTemplate = 'royal_crown',
  onSelectTemplate,
  onRequestDownloadImage,
  customConfig,
}) => {
  const [currentTemplate, setCurrentTemplate] = useState<SlipTemplateId>(selectedTemplate);
  const [dataUrl, setDataUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setCurrentTemplate(selectedTemplate);
  }, [selectedTemplate]);

  useEffect(() => {
    if (client) {
      const url = createParchiDataUrl({
        client,
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
    }
  }, [client, rate, currency, batchName, startDate, endDate, showRate, panels, currentTemplate, customConfig]);

  if (!client) return null;

  const activeT = getSlipTemplate(currentTemplate);

  const text = generateParchiText(
    client,
    rate,
    currency,
    language,
    startDate,
    endDate,
    showRate,
    panels
  );

  const handleCopyText = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const handleWhatsApp = () => {
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const handleTemplateChange = (tId: SlipTemplateId) => {
    setCurrentTemplate(tId);
    if (onSelectTemplate) {
      onSelectTemplate(tId);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-hidden">
      <div className="bg-white dark:bg-slate-900 max-w-lg w-full rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[94vh] sm:max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-3.5 sm:p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50 shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-xl">{activeT.badgeIcon}</span>
            <div>
              <h3 className="text-sm font-black text-slate-900 dark:text-white">
                {activeT.name} - {client.name}
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Period: {startDate || ''} to {endDate || ''} • Rate: {rate} {currency}/SMS
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
        <div className="p-2.5 sm:p-3 bg-slate-100 dark:bg-slate-800/70 border-b border-slate-200 dark:border-slate-700 flex items-center gap-2 overflow-x-auto shrink-0">
          <div className="flex items-center gap-1 text-[11px] font-bold text-slate-500 dark:text-slate-400 whitespace-nowrap">
            <Palette className="w-3.5 h-3.5 text-amber-500" />
            <span>Theme:</span>
          </div>
          <div className="flex items-center gap-1.5 flex-nowrap">
            {SLIP_TEMPLATES.map((t) => {
              const isSelected = currentTemplate === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => handleTemplateChange(t.id)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1 ${
                    isSelected
                      ? 'bg-[#002a4e] text-amber-300 shadow-xs ring-2 ring-amber-400'
                      : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 border border-slate-200 dark:border-slate-700'
                  }`}
                >
                  <span>{t.badgeIcon}</span>
                  <span>{t.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Modal Body: High Resolution Slip Picture Preview */}
        <div
          className="p-3 sm:p-5 flex-1 min-h-0 overflow-y-auto overscroll-contain flex flex-col items-center bg-slate-100/60 dark:bg-slate-950/60"
          style={{ WebkitOverflowScrolling: 'touch', touchAction: 'pan-y' }}
        >
          <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-2 flex items-center gap-1.5">
            <span>HD Slip Picture Generated</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span className="text-[10px] uppercase font-black tracking-wider text-amber-600 dark:text-amber-400">
              Style #{activeT.number}: {activeT.name}
            </span>
          </div>

          {dataUrl ? (
            <div className="rounded-xl overflow-hidden shadow-xl border border-slate-300 dark:border-slate-700 max-w-full bg-white my-auto">
              <img
                src={dataUrl}
                alt={`${client.name} Slip Preview`}
                className="w-full h-auto block select-none"
              />
            </div>
          ) : (
            <div className="w-full h-56 flex items-center justify-center text-slate-400 text-xs my-auto">
              Rendering HD Slip Picture...
            </div>
          )}
        </div>

        {/* Modal Footer Actions */}
        <div className="p-3 sm:p-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2 sm:gap-3 shrink-0">
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyText}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 text-slate-700 dark:text-slate-200 text-xs font-bold transition-colors cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>

            <button
              onClick={handleWhatsApp}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 text-emerald-700 dark:text-emerald-300 text-xs font-bold border border-emerald-200 dark:border-emerald-800 transition-colors cursor-pointer"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>WhatsApp</span>
            </button>
          </div>

          <button
            onClick={() => {
              onClose();
              onRequestDownloadImage(client);
            }}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-[#002a4e] to-blue-900 hover:from-blue-900 hover:to-[#002a4e] text-white text-xs font-black shadow-md transition-all cursor-pointer group"
          >
            <Lock className="w-3.5 h-3.5 text-amber-400 group-hover:rotate-12 transition-transform" />
            <span>Download</span>
          </button>
        </div>
      </div>
    </div>
  );
};
