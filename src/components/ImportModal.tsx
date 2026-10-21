import React, { useState, useRef } from 'react';
import {
  X,
  Upload,
  Sparkles,
  FileText,
  Image as ImageIcon,
  AlertCircle,
  Loader2,
  ClipboardPaste,
  Layers,
  CheckCircle2,
  Zap,
  RotateCcw,
} from 'lucide-react';
import { ClientRecord, Panel } from '../types';
import { parseRawTextToClients } from '../utils/parser';
import { FAITH_BATCH, KB4_BATCH } from '../data/sampleData';

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  panels: Panel[];
  onAddPanel: (name: string) => string;
  onImport: (
    clients: ClientRecord[],
    detectedRate?: number | null,
    title?: string,
    targetPanelId?: string
  ) => void;
  currency: string;
}

export const ImportModal: React.FC<ImportModalProps> = ({
  isOpen,
  onClose,
  panels,
  onAddPanel,
  onImport,
  currency,
}) => {
  const [activeTab, setActiveTab] = useState<'scan' | 'paste' | 'samples'>('scan');

  // Scanner state
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageMimeType, setImageMimeType] = useState<string>('image/jpeg');
  const [scanning, setScanning] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);
  const [scanElapsed, setScanElapsed] = useState<number>(0);

  // Panel selection state during upload (Defaults to first panel, e.g. Extra)
  const [selectedPanelId, setSelectedPanelId] = useState<string>(panels[0]?.id || 'new');
  const [customPanelName, setCustomPanelName] = useState<string>('');
  const [isAddingNewPanel, setIsAddingNewPanel] = useState<boolean>(false);

  // Text Paste state
  const [rawText, setRawText] = useState('');
  const [parsedPreview, setParsedPreview] = useState<{
    clients: ClientRecord[];
    detectedRate: number | null;
  }>({ clients: [], detectedRate: null });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const scanTimerRef = useRef<any>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  if (!isOpen) return null;

  const handleCancelScan = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    if (scanTimerRef.current) {
      clearInterval(scanTimerRef.current);
      scanTimerRef.current = null;
    }
    setScanning(false);
    setIsRetrying(false);
  };

  const getEffectivePanelId = (): string | undefined => {
    if (isAddingNewPanel && customPanelName.trim()) {
      return onAddPanel(customPanelName.trim());
    }
    if (selectedPanelId && selectedPanelId !== 'none' && selectedPanelId !== 'new') {
      return selectedPanelId;
    }
    if (panels.length > 0) {
      return panels[0].id;
    }
    return undefined;
  };

  // Canvas Downscaler: Preserves crisp text clarity for OCR/AI (max 1350px, 0.84 quality for fast mobile uploads)
  const compressImageForFastScan = (file: File): Promise<{ base64: string; mimeType: string }> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const maxDimension = 1350;
          let { width, height } = img;
          if (width > maxDimension || height > maxDimension) {
            if (width > height) {
              height = Math.round((height * maxDimension) / width);
              width = maxDimension;
            } else {
              width = Math.round((width * maxDimension) / height);
              height = maxDimension;
            }
          }
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            return resolve({ base64: e.target?.result as string, mimeType: 'image/jpeg' });
          }
          ctx.drawImage(img, 0, 0, width, height);
          const compressed = canvas.toDataURL('image/jpeg', 0.84);
          resolve({ base64: compressed, mimeType: 'image/jpeg' });
        };
        img.onerror = reject;
        img.src = e.target?.result as string;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const executeScan = async (base64Data: string, mimeType: string) => {
    setScanning(true);
    setScanError(null);
    setScanElapsed(0);

    const controller = new AbortController();
    abortControllerRef.current = controller;

    // Timeout safety: 28s abort to allow multi-model server failover
    const timeoutId = setTimeout(() => {
      controller.abort();
    }, 28000);

    const startTime = Date.now();
    scanTimerRef.current = setInterval(() => {
      setScanElapsed(Math.floor((Date.now() - startTime) / 100) / 10);
    }, 100);

    try {
      const res = await fetch('/api/extract-list', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          imageBase64: base64Data,
          mimeType: mimeType || 'image/jpeg',
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // Safe JSON parsing: handle non-JSON / HTML proxy error pages cleanly
      let data: any = null;
      const contentType = res.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        try {
          data = await res.json();
        } catch {
          data = null;
        }
      } else {
        await res.text().catch(() => '');
      }

      if (!res.ok || !data || data.error) {
        const errorMsg =
          data?.error ||
          (res.status === 502 || res.status === 503 || res.status === 504
            ? 'The AI extraction server is temporarily busy with high demand. Please click Retry or use the Paste tab.'
            : 'Could not extract table rows from screenshot. Please click Retry or paste text directly.');
        throw new Error(errorMsg);
      }

      if (data.clients && data.clients.length > 0) {
        const panelId = getEffectivePanelId();

        const mappedClients: ClientRecord[] = data.clients.map((c: any, i: number) => {
          const productCount = Number(c.sms) || 0;
          return {
            id: `ai-${Date.now()}-${i}`,
            name: c.name,
            sms: productCount,
            panels: panelId ? { [panelId]: productCount } : undefined,
          };
        });

        onImport(mappedClients, data.detectedRate, data.title, panelId);
        clearInterval(scanTimerRef.current);
        onClose();
      } else {
        throw new Error('No client rows detected in this image. Please paste text directly.');
      }
    } catch (err: any) {
      clearTimeout(timeoutId);
      const rawMessage = err?.message || '';
      if (err.name === 'AbortError') {
        setScanError('Scanning took longer than expected due to server traffic. Please click Retry or use the Paste tab.');
      } else if (rawMessage.includes('Unexpected token') || rawMessage.includes('JSON')) {
        setScanError('The server is temporarily busy or reconnecting. Please click Retry or paste the list directly.');
      } else {
        setScanError(rawMessage || 'Could not parse image. Please paste text directly.');
      }
    } finally {
      clearTimeout(timeoutId);
      clearInterval(scanTimerRef.current);
      setScanning(false);
      setIsRetrying(false);
      abortControllerRef.current = null;
    }
  };

  const handleImageSelect = async (file: File) => {
    setScanError(null);
    try {
      const { base64, mimeType } = await compressImageForFastScan(file);
      setImagePreview(base64);
      setImageMimeType(mimeType || 'image/jpeg');
      // Auto-trigger scan directly
      await executeScan(base64, mimeType || 'image/jpeg');
    } catch (err: any) {
      console.error(err);
      setScanError(err.message || 'Could not process screenshot image.');
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleImageSelect(e.dataTransfer.files[0]);
    }
  };

  const handlePasteEvent = (e: React.ClipboardEvent) => {
    if (e.clipboardData.files && e.clipboardData.files[0]) {
      const file = e.clipboardData.files[0];
      if (file.type.startsWith('image/')) {
        handleImageSelect(file);
      }
    }
  };

  const handleTextChange = (text: string) => {
    setRawText(text);
    const result = parseRawTextToClients(text);
    setParsedPreview(result);
  };

  const handleImportText = () => {
    if (parsedPreview.clients.length > 0) {
      const panelId = getEffectivePanelId();
      const mapped = parsedPreview.clients.map((c) => ({
        ...c,
        panels: panelId ? { [panelId]: c.sms } : undefined,
      }));
      onImport(mapped, parsedPreview.detectedRate, undefined, panelId);
      onClose();
    }
  };

  const currentPanelName =
    isAddingNewPanel && customPanelName.trim()
      ? customPanelName.trim()
      : panels.find((p) => p.id === selectedPanelId)?.name || 'Direct SMS';

  return (
    <div
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-hidden"
      onPaste={handlePasteEvent}
    >
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-2xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[95vh] sm:max-h-[90vh] animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="p-3.5 sm:p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50 shrink-0">
          <div>
            <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Upload className="w-5 h-5 text-sky-600 dark:text-sky-400" />
              <span>Import Clients</span>
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              Upload screenshot or paste text
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Panel Assignment Bar */}
        <div className="p-2.5 sm:p-3 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border-b border-amber-500/20 shrink-0">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
              <span className="text-xs font-black text-slate-800 dark:text-slate-200">
                Panel:
              </span>
            </div>

            {/* Quick Panel Buttons */}
            <div className="flex items-center gap-1.5 overflow-x-auto max-w-full pb-0.5">
              {panels.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => {
                    setSelectedPanelId(p.id);
                    setIsAddingNewPanel(false);
                  }}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                    !isAddingNewPanel && selectedPanelId === p.id
                      ? 'bg-amber-500 text-slate-950 font-black shadow-xs ring-2 ring-amber-400/50 scale-105'
                      : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-amber-400'
                  }`}
                >
                  {p.name}
                </button>
              ))}

              {isAddingNewPanel ? (
                <div className="flex items-center gap-1 bg-white dark:bg-slate-800 p-0.5 rounded-lg border border-amber-400 shadow-xs shrink-0">
                  <input
                    type="text"
                    value={customPanelName}
                    onChange={(e) => setCustomPanelName(e.target.value)}
                    placeholder="Panel Name"
                    className="px-2 py-1 text-xs font-bold text-slate-900 dark:text-white border-none outline-hidden w-24"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (!customPanelName.trim()) setIsAddingNewPanel(false);
                    }}
                    className="p-1 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsAddingNewPanel(true)}
                  className="px-2 py-1 rounded-lg text-xs font-bold bg-white dark:bg-slate-800 border border-dashed border-amber-400 hover:border-amber-500 text-amber-700 dark:text-amber-300 transition-colors cursor-pointer whitespace-nowrap shrink-0"
                >
                  + New Panel
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-100/70 dark:bg-slate-800/40 p-1.5 gap-1.5 shrink-0">
          <button
            onClick={() => setActiveTab('scan')}
            className={`flex-1 py-1.5 sm:py-2 px-2 sm:px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'scan'
                ? 'bg-white dark:bg-slate-800 text-sky-700 dark:text-sky-300 shadow-2xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-sky-500" />
            <span>Scan</span>
          </button>

          <button
            onClick={() => setActiveTab('paste')}
            className={`flex-1 py-1.5 sm:py-2 px-2 sm:px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'paste'
                ? 'bg-white dark:bg-slate-800 text-sky-700 dark:text-sky-300 shadow-2xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <ClipboardPaste className="w-3.5 h-3.5 text-emerald-500" />
            <span>Paste</span>
          </button>

          <button
            onClick={() => setActiveTab('samples')}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === 'samples'
                ? 'bg-white dark:bg-slate-800 text-sky-700 dark:text-sky-300 shadow-2xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <FileText className="w-4 h-4 text-amber-500" />
            <span>Samples</span>
          </button>
        </div>

        {/* Tab 1: AI Quick Scanner */}
        {activeTab === 'scan' && (
          <div className="p-4 sm:p-5 space-y-4 flex-1 min-h-0 overflow-y-auto overscroll-contain">
            <div
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              onClick={() => {
                if (!scanning) fileInputRef.current?.click();
              }}
              className={`border-2 border-dashed rounded-xl p-5 sm:p-6 text-center transition-all relative ${
                scanning
                  ? 'border-amber-400 bg-amber-50/40 dark:bg-amber-950/20 cursor-wait'
                  : imagePreview
                  ? 'border-sky-400 bg-sky-50/30 dark:bg-sky-950/20 cursor-pointer'
                  : 'border-slate-300 dark:border-slate-700 hover:border-sky-500 bg-slate-50/50 dark:bg-slate-800/30 cursor-pointer'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                disabled={scanning}
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleImageSelect(e.target.files[0]);
                  }
                }}
              />

              {scanning ? (
                <div className="py-6 space-y-3">
                  <div className="relative w-14 h-14 mx-auto flex items-center justify-center">
                    <div className="absolute inset-0 rounded-full border-4 border-amber-400/30 animate-ping" />
                    <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-300 text-slate-950 flex items-center justify-center shadow-lg shadow-amber-500/30">
                      {isRetrying ? (
                        <RotateCcw className="w-6 h-6 animate-spin text-slate-950" />
                      ) : (
                        <Zap className="w-6 h-6 animate-pulse text-slate-950" />
                      )}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-slate-900 dark:text-white">
                      Scanning Image...
                    </h4>
                    <p className="text-xs text-amber-600 dark:text-amber-400 font-bold mt-1">
                      Reading clients & counts ({scanElapsed}s)
                    </p>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCancelScan();
                      }}
                      className="mt-3 px-3 py-1 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 text-xs font-bold rounded-lg cursor-pointer transition shadow-xs"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : imagePreview ? (
                <div className="space-y-3">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="max-h-48 sm:max-h-56 mx-auto rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 object-contain"
                  />
                  <p className="text-xs font-semibold text-sky-700 dark:text-sky-400">
                    Click to select another image or drop file here
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="w-12 h-12 rounded-full bg-sky-100 dark:bg-sky-950/50 text-sky-600 dark:text-sky-400 mx-auto flex items-center justify-center">
                    <ImageIcon className="w-6 h-6" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                    Drop screenshot here or click to select
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Press <kbd className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 font-mono font-bold text-slate-700 dark:text-slate-300">Ctrl + V</kbd> to paste screenshot
                  </p>
                </div>
              )}
            </div>

            {scanError && (
              <div className="p-3.5 rounded-xl bg-amber-50/90 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 text-xs text-amber-800 dark:text-amber-300 space-y-2.5 shadow-sm">
                <div className="flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 shrink-0 text-amber-500 mt-0.5" />
                  <div className="flex-1 space-y-0.5">
                    <p className="font-bold">
                      Notice
                    </p>
                    <p className="text-[11px] font-normal leading-relaxed">
                      {scanError}
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2 pt-1 pl-6">
                  {imagePreview && (
                    <button
                      type="button"
                      onClick={() => executeScan(imagePreview, imageMimeType || 'image/jpeg')}
                      disabled={scanning}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg transition shadow-xs cursor-pointer text-xs"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Retry</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      setScanError(null);
                      setActiveTab('paste');
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold rounded-lg transition border border-slate-200 dark:border-slate-700 cursor-pointer text-xs"
                  >
                    <ClipboardPaste className="w-3.5 h-3.5 text-amber-500" />
                    <span>Paste Text</span>
                  </button>
                </div>
              </div>
            )}

            <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
              <span className="text-[11px] text-slate-400">
                Preserves sequence, zero duplicates
              </span>

              {imagePreview && !scanning && (
                <button
                  type="button"
                  onClick={() => executeScan(imagePreview, imageMimeType || 'image/jpeg')}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 shadow-xs transition-all cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Scan Again</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* Tab 2: Smart Text Paste */}
        {activeTab === 'paste' && (
          <div className="p-4 sm:p-5 space-y-4 flex-1 min-h-0 overflow-y-auto overscroll-contain">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Paste Text / Records:
              </label>
              <textarea
                value={rawText}
                onChange={(e) => handleTextChange(e.target.value)}
                rows={6}
                placeholder={`Client_A_Akrash 56\nClient_A_Shayan 62\nClient_Abdullah 230`}
                className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-mono text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-sky-500"
              />
            </div>

            {parsedPreview.clients.length > 0 && (
              <div className="bg-sky-50/60 dark:bg-sky-950/30 border border-sky-200 dark:border-sky-800 rounded-lg p-3">
                <div className="flex items-center justify-between text-xs font-bold text-sky-900 dark:text-sky-300 mb-1.5">
                  <span>Detected {parsedPreview.clients.length} Clients:</span>
                  {parsedPreview.detectedRate && (
                    <span className="bg-sky-200 dark:bg-sky-900 px-2 py-0.5 rounded text-sky-800 dark:text-sky-200">
                      Rate: {parsedPreview.detectedRate} {currency}
                    </span>
                  )}
                </div>
                <div className="max-h-24 overflow-y-auto text-xs text-slate-600 dark:text-slate-400 divide-y divide-sky-100 dark:divide-slate-800">
                  {parsedPreview.clients.slice(0, 6).map((c, i) => (
                    <div key={i} className="py-1 flex justify-between">
                      <span className="font-semibold text-slate-800 dark:text-slate-200">{c.name}</span>
                      <span className="font-bold text-sky-700 dark:text-sky-400">{c.sms} SMS</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                disabled={parsedPreview.clients.length === 0}
                onClick={handleImportText}
                className={`px-4 sm:px-5 py-2 rounded-lg text-xs font-bold text-white transition-colors cursor-pointer ${
                  parsedPreview.clients.length === 0
                    ? 'bg-slate-300 cursor-not-allowed'
                    : 'bg-emerald-600 hover:bg-emerald-700'
                }`}
              >
                Import {parsedPreview.clients.length} Clients
              </button>
            </div>
          </div>
        )}

        {/* Tab 3: Sample Datasets */}
        {activeTab === 'samples' && (
          <div className="p-4 sm:p-5 space-y-4 flex-1 min-h-0 overflow-y-auto overscroll-contain">
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Select one of the sample datasets to test calculations, slips, and Excel export instantly:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div
                onClick={() => {
                  const pId = getEffectivePanelId();
                  const mapped = FAITH_BATCH.map((c) => ({
                    ...c,
                    panels: pId ? { [pId]: c.sms } : undefined,
                  }));
                  onImport(mapped, 2.3, 'Faith SMS Report', pId);
                  onClose();
                }}
                className="p-3.5 border border-slate-200 dark:border-slate-700 rounded-xl hover:border-sky-500 hover:bg-sky-50/50 dark:hover:bg-slate-800/60 cursor-pointer transition-all"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-xs text-slate-900 dark:text-white">
                    Faith SMS Batch (23 Clients)
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-sky-100 text-sky-800 dark:bg-sky-900/50 dark:text-sky-300">
                    Rate: 2.3
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Total SMS: 5,649 • Amount: 12,992.7 PKR
                </p>
              </div>

              <div
                onClick={() => {
                  const pId = getEffectivePanelId();
                  const mapped = KB4_BATCH.map((c) => ({
                    ...c,
                    panels: pId ? { [pId]: c.sms } : undefined,
                  }));
                  onImport(mapped, 2.0, 'KB4 SMS Report', pId);
                  onClose();
                }}
                className="p-3.5 border border-slate-200 dark:border-slate-700 rounded-xl hover:border-sky-500 hover:bg-sky-50/50 dark:hover:bg-slate-800/60 cursor-pointer transition-all"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-xs text-slate-900 dark:text-white">
                    KB4 SMS Batch (21 Clients)
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300">
                    Rate: 2.0
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Total SMS: 4,008 • Amount: 8,016 PKR
                </p>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
