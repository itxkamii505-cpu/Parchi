import React, { useState, useMemo, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { CheckCircle2 } from 'lucide-react';
import {
  ClientRecord,
  ClientHistoryRecord,
  LanguageMode,
  ThemeMode,
  ActiveTab,
  AppSettings,
  Panel,
  SummaryStats,
} from './types';
import {
  getStoredClients,
  saveStoredClients,
  getStoredHistory,
  saveStoredHistory,
  addHistoryRecord,
  getStoredPanels,
  saveStoredPanels,
  getStoredSettings,
  saveStoredSettings,
  isUserAuthenticated,
  setUserAuthenticated,
} from './utils/storage';
import { FAITH_BATCH, KB4_BATCH } from './data/sampleData';
import { downloadParchiImage, downloadCombinedParchiImage } from './utils/parchiImage';
import { exportToExcel, exportToCSV, generateFullReportText, generateParchiText } from './utils/export';
import { SlipTemplateId, DEFAULT_SLIP_CUSTOM_CONFIG } from './utils/slipTemplates';
import { SlipCustomConfig } from './types';
import { naturalSortClients } from './utils/sort';
import { calculateAmount } from './utils/math';

// Components
import { LoginView } from './components/LoginView';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { DashboardView } from './components/DashboardView';
import { ReportTableView } from './components/ReportTableView';
import { ParchiyanView } from './components/ParchiyanView';
import { HistoryView } from './components/HistoryView';
import { SlipCustomizeModal } from './components/SlipCustomizeModal';
import { SettingsView } from './components/SettingsView';
import { PinModal } from './components/PinModal';
import { ImportModal } from './components/ImportModal';
import { ParchiModal } from './components/ParchiModal';

export default function App() {
  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => isUserAuthenticated());

  // Settings
  const [settings, setSettings] = useState<AppSettings>(() => getStoredSettings());

  // Theme Mode
  const [theme, setTheme] = useState<ThemeMode>(() => settings.theme || 'light');

  // Sync theme with html document class
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Sidebar Mobile Toggle
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);

  // Active Tab
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');

  // Date Range (Weekly default)
  const defaultEndDate = new Date().toISOString().split('T')[0];
  const d = new Date();
  d.setDate(d.getDate() - 7);
  const defaultStartDate = d.toISOString().split('T')[0];

  const [startDate, setStartDate] = useState<string>(defaultStartDate);
  const [endDate, setEndDate] = useState<string>(defaultEndDate);

  // Panels
  const [panels, setPanels] = useState<Panel[]>(() => getStoredPanels());

  // Show/Hide Rate Toggle
  const [showRate, setShowRate] = useState<boolean>(() => settings.showRateOnSlips ?? true);

  // Rate & Batch info
  const [rate, setRate] = useState<number>(() => settings.defaultRate || 2.3);
  const [currency, setCurrency] = useState<string>(() => settings.currency || 'PKR');
  const [batchName, setBatchName] = useState<string>(() => settings.companyName || 'KBMAX Weekly Reports');
  const [language, setLanguage] = useState<LanguageMode>('english');

  // Clients Data (Starts with stored clients; clean slate if none)
  const [clients, setClients] = useState<ClientRecord[]>(() => {
    const saved = getStoredClients();
    if (saved && saved.length > 0) return saved;
    // Default clean start: Start with an empty list for fresh ledger entry
    // Return empty list so user enters real data cleanly, or load via settings!
    return [];
  });

  // Active Slip Template (1 of 10 professional designs)
  const [selectedTemplate, setSelectedTemplate] = useState<SlipTemplateId>(() => {
    return (localStorage.getItem('kbmax_slip_template') as SlipTemplateId) || 'royal_crown';
  });

  useEffect(() => {
    localStorage.setItem('kbmax_slip_template', selectedTemplate);
  }, [selectedTemplate]);

  // Slip Customization & Fonts Studio State
  const [slipCustomConfig, setSlipCustomConfig] = useState<SlipCustomConfig>(() => {
    const saved = localStorage.getItem('kbmax_slip_custom_config');
    if (saved) {
      try {
        return { ...DEFAULT_SLIP_CUSTOM_CONFIG, ...JSON.parse(saved) };
      } catch {
        // fallback
      }
    }
    return DEFAULT_SLIP_CUSTOM_CONFIG;
  });

  useEffect(() => {
    localStorage.setItem('kbmax_slip_custom_config', JSON.stringify(slipCustomConfig));
  }, [slipCustomConfig]);

  // History Records
  const [history, setHistory] = useState<ClientHistoryRecord[]>(() => getStoredHistory());

  // Modals & PIN
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [previewClient, setPreviewClient] = useState<ClientRecord | null>(null);
  const [isGlobalCustomizeOpen, setIsGlobalCustomizeOpen] = useState(false);
  const [pinModalOpen, setPinModalOpen] = useState(false);
  const [clientForPinDownload, setClientForPinDownload] = useState<ClientRecord | null>(null);
  const [combinedClientsForPin, setCombinedClientsForPin] = useState<ClientRecord[] | null>(null);

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2800);
  };

  // Persist clients when changed
  useEffect(() => {
    saveStoredClients(clients);
  }, [clients]);

  // Persist panels
  useEffect(() => {
    saveStoredPanels(panels);
  }, [panels]);

  // Persist settings
  useEffect(() => {
    saveStoredSettings({ ...settings, theme, defaultRate: rate, currency, showRateOnSlips: showRate });
  }, [settings, theme, rate, currency, showRate]);

  // Stats calculation
  const stats: SummaryStats = useMemo(() => {
    const totalClients = clients.length;
    const totalSms = clients.reduce((sum, c) => sum + c.sms, 0);
    const totalAmount = calculateAmount(totalSms, rate);
    const averageSms = totalClients > 0 ? Math.round(totalSms / totalClients) : 0;

    let highestClient = clients[0] || null;
    let lowestClient = clients[0] || null;

    clients.forEach((c) => {
      if (!highestClient || c.sms > highestClient.sms) highestClient = c;
      if (!lowestClient || c.sms < lowestClient.sms) lowestClient = c;
    });

    const panelTotals: Record<string, number> = {};
    panels.forEach((p) => {
      panelTotals[p.id] = clients.reduce(
        (sum, c) => sum + ((c.panels && c.panels[p.id]) || 0),
        0
      );
    });

    return {
      totalClients,
      totalSms,
      totalAmount,
      averageSms,
      highestClient,
      lowestClient,
      panelTotals,
    };
  }, [clients, rate, panels]);

  // Handle Login & Logout
  const handleLogin = () => {
    setUserAuthenticated(true);
    setIsAuthenticated(true);
    showToast('Welcome to KBMAX Weekly Reports');
  };

  const handleLogout = () => {
    setUserAuthenticated(false);
    setIsAuthenticated(false);
    showToast('Logged out successfully');
  };

  // Toggle Theme
  const handleToggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    setSettings((prev) => ({ ...prev, theme: next }));
  };

  // Panels operations
  const handleAddPanel = (name: string): string => {
    const newId = `panel_${Date.now()}`;
    const newPanel: Panel = { id: newId, name };
    setPanels((prev) => [...prev, newPanel]);
    showToast(`Added Panel "${name}"`);
    return newId;
  };

  const handleRemovePanel = (id: string) => {
    setPanels((prev) => prev.filter((p) => p.id !== id));
    // Remove panel key from client records without losing their overall SMS count
    setClients((prev) =>
      prev.map((c) => {
        if (!c.panels || !(id in c.panels)) return c;
        const copy = { ...c.panels };
        delete copy[id];
        return { ...c, panels: copy };
      })
    );
    showToast('Panel removed');
  };

  // Client operations (Strict no-double-counting)
  const handleUpdateClient = (
    id: string,
    name: string,
    sms: number,
    panelsData?: Record<string, number>
  ) => {
    setClients((prev) =>
      prev.map((c) => {
        if (c.id !== id) return c;
        const p = panelsData !== undefined ? panelsData : c.panels;
        const computedSms =
          p && Object.keys(p).length > 0
            ? Object.values(p).reduce((sum, v) => sum + (v || 0), 0)
            : sms;
        return {
          ...c,
          name,
          sms: computedSms,
          panels: p,
          lastUpdated: new Date().toISOString(),
        };
      })
    );
    showToast(`Updated ${name}`);
  };

  const handleDeleteClient = (id: string) => {
    setClients((prev) => prev.filter((c) => c.id !== id));
    showToast('Client removed from list');
  };

  const handleAddClient = (
    name: string,
    sms: number,
    panelsData?: Record<string, number>
  ) => {
    // If client with same name already exists in table, update it instead of duplicate
    const existing = clients.find((c) => c.name.toLowerCase() === name.trim().toLowerCase());
    if (existing) {
      handleUpdateClient(existing.id, name.trim(), sms, panelsData);
      showToast(`Updated existing client: ${name}`);
      return;
    }

    const computedSms =
      panelsData && Object.keys(panelsData).length > 0
        ? Object.values(panelsData).reduce((sum, v) => sum + (v || 0), 0)
        : sms;

    const newRecord: ClientRecord = {
      id: `client-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name: name.trim(),
      sms: computedSms,
      panels: panelsData,
      dateRange: `${startDate} to ${endDate}`,
      lastUpdated: new Date().toISOString(),
    };

    setClients((prev) => [...prev, newRecord]);
    showToast(`Added ${name} (${computedSms} SMS)`);
  };

  // Normalize client name for zero-duplicate matching across panels
  const normalizeClientName = (name: string): string => {
    return (name || '')
      .trim()
      .toLowerCase()
      .replace(/[\s_.-]+/g, ' ')
      .trim();
  };

  // Import handler with target panel support & bulletproof username-based aggregation
  // Automatically matches and aggregates multiple panel reports by username without duplicates
  const handleImport = (
    newClients: ClientRecord[],
    detectedRate?: number | null,
    title?: string,
    targetPanelId?: string
  ) => {
    setClients((prev) => {
      const updated = [...prev];
      newClients.forEach((imported) => {
        const normImported = normalizeClientName(imported.name);
        if (!normImported) return;

        const idx = updated.findIndex((c) => normalizeClientName(c.name) === normImported);
        if (idx >= 0) {
          // Existing client found: merge panel counts, DO NOT create duplicate row
          const existing = updated[idx];
          const mergedPanels = { ...(existing.panels || {}) };

          if (targetPanelId) {
            // Set/update the count for this panel (e.g. Extra or Core)
            mergedPanels[targetPanelId] = imported.sms;
          } else if (imported.panels && Object.keys(imported.panels).length > 0) {
            Object.assign(mergedPanels, imported.panels);
          } else {
            mergedPanels['direct'] = imported.sms;
          }

          // Exact sum across all panels for 100% payment accuracy
          const totalSms = Object.keys(mergedPanels).length > 0
            ? Object.values(mergedPanels).reduce((a, b) => a + (Number(b) || 0), 0)
            : imported.sms;

          updated[idx] = {
            ...existing,
            sms: totalSms,
            panels: mergedPanels,
            lastUpdated: new Date().toISOString(),
          };
        } else {
          // New client not yet in table: add with specified panel count
          const initialPanels: Record<string, number> = {};
          if (targetPanelId) {
            initialPanels[targetPanelId] = imported.sms;
          } else if (imported.panels && Object.keys(imported.panels).length > 0) {
            Object.assign(initialPanels, imported.panels);
          }

          updated.push({
            ...imported,
            sms: imported.sms,
            panels: Object.keys(initialPanels).length > 0 ? initialPanels : undefined,
            dateRange: `${startDate} to ${endDate}`,
            lastUpdated: new Date().toISOString(),
          });
        }
      });
      return updated;
    });

    if (detectedRate) setRate(detectedRate);
    if (title) setBatchName(title);

    const panelName = panels.find((p) => p.id === targetPanelId)?.name;
    const msg = panelName
      ? `Merged ${newClients.length} records into panel "${panelName}"!`
      : `Imported ${newClients.length} clients!`;
    showToast(msg);
    confetti({ particleCount: 30, spread: 50, origin: { y: 0.7 } });
  };

  // PIN Protected Single Image Download & Move to History
  const handleRequestDownloadImage = (client: ClientRecord) => {
    setClientForPinDownload(client);
    setCombinedClientsForPin(null);
    setPinModalOpen(true);
  };

  // PIN Protected Combined Slip Download & Move Selected Accounts to History
  const handleRequestSaveCombinedPin = (selectedClients: ClientRecord[]) => {
    if (!selectedClients || selectedClients.length === 0) {
      showToast('Select at least 1 account to download combined slip!');
      return;
    }
    setClientForPinDownload(null);
    setCombinedClientsForPin(selectedClients);
    setPinModalOpen(true);
  };

  const handlePinSuccess = () => {
    // A) COMBINED SLIP FLOW (Downloads ONLY 1 combined slip picture and moves ONLY selected accounts to History)
    if (combinedClientsForPin && combinedClientsForPin.length > 0) {
      const selectedCombined = naturalSortClients(combinedClientsForPin);
      const selectedIds = new Set(selectedCombined.map((c) => c.id));
      const totalSms = selectedCombined.reduce((sum, c) => sum + (Number(c.sms) || 0), 0);
      const totalAmount = calculateAmount(totalSms, rate);

      // 1. Download ONLY the 1 combined slip picture
      downloadCombinedParchiImage({
        clients: selectedCombined,
        rate,
        currency,
        batchName,
        startDate,
        endDate,
        showRate,
        panelsList: panels,
        templateId: selectedTemplate,
        customConfig: slipCustomConfig,
      });

      // 2. Build history record for the combined slip
      const combinedHistoryEntry: ClientHistoryRecord = {
        id: `hist-comb-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        clientId: `combined-${Date.now()}`,
        clientName: `Combined Slip (${selectedCombined.length} Accounts: ${selectedCombined.map((c) => c.name).join(', ')})`,
        sms: totalSms,
        rate,
        currency,
        totalAmount,
        dateRange: startDate && endDate ? `${startDate} to ${endDate}` : startDate || endDate || '',
        downloadedAt: new Date().toISOString(),
        batchName,
        isCombined: true,
        combinedClients: selectedCombined.map((c) => ({
          id: c.id,
          name: c.name,
          sms: c.sms,
          amount: calculateAmount(c.sms, rate),
          panels: c.panels,
        })),
      };

      // 3. Save to History
      addHistoryRecord(combinedHistoryEntry);
      setHistory((prev) => [combinedHistoryEntry, ...prev]);

      // 4. Remove ONLY the selected combined accounts from the active table (unselected accounts stay untouched)
      setClients((prev) => prev.filter((c) => !selectedIds.has(c.id)));

      setPinModalOpen(false);
      setCombinedClientsForPin(null);
      showToast(`Combined slip saved! ${selectedCombined.length} accounts archived to History.`);
      confetti({ particleCount: 45, spread: 65, origin: { y: 0.6 } });
      return;
    }

    // B) SINGLE SLIP FLOW
    if (!clientForPinDownload) return;
    const client = clientForPinDownload;

    // 1. Download HD Slip with chosen template style and custom font/content
    downloadParchiImage({
      client,
      rate,
      currency,
      batchName,
      startDate,
      endDate,
      showRate,
      panelsList: panels,
      templateId: selectedTemplate,
      customConfig: slipCustomConfig,
    });

    // 2. Build history record with panel breakdown
    const historyEntry: ClientHistoryRecord = {
      id: `hist-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      clientId: client.id,
      clientName: client.name,
      sms: client.sms,
      rate,
      currency,
      totalAmount: calculateAmount(client.sms, rate),
      dateRange: `${startDate} to ${endDate}`,
      panelsBreakdown: client.panels ? { ...client.panels } : undefined,
      downloadedAt: new Date().toISOString(),
      batchName,
    };

    // 3. Save to History
    addHistoryRecord(historyEntry);
    setHistory((prev) => [historyEntry, ...prev]);

    // 4. Remove ONLY this single client from active table
    setClients((prev) => prev.filter((c) => c.id !== client.id));

    setPinModalOpen(false);
    setClientForPinDownload(null);
    showToast(`Slip saved! ${client.name} moved to History Archive.`);
    confetti({ particleCount: 35, spread: 55, origin: { y: 0.6 } });
  };

  // Restore client from history
  const handleRestoreFromHistory = (rec: ClientHistoryRecord) => {
    if (rec.isCombined && rec.combinedClients && rec.combinedClients.length > 0) {
      const restoredList: ClientRecord[] = rec.combinedClients.map((cc) => ({
        id: cc.id || `restored-${Date.now()}-${Math.random()}`,
        name: cc.name,
        sms: cc.sms,
        panels: cc.panels,
        dateRange: rec.dateRange,
      }));
      setClients((prev) => [...restoredList, ...prev]);
      showToast(`Restored ${restoredList.length} accounts from combined report to active table`);
      return;
    }

    const restored: ClientRecord = {
      id: rec.clientId || `restored-${Date.now()}`,
      name: rec.clientName,
      sms: rec.sms,
      panels: rec.panelsBreakdown,
      dateRange: rec.dateRange,
    };
    setClients((prev) => [restored, ...prev]);
    showToast(`Restored ${rec.clientName} to active report`);
  };

  const handleSaveCombinedToHistory = (record: ClientHistoryRecord) => {
    setHistory((prev) => [record, ...prev]);
    showToast('Combined slip archived to History!');
  };

  const handleClearHistory = () => {
    saveStoredHistory([]);
    setHistory([]);
    showToast('History archive cleared');
  };

  const handleDeleteHistoryRecord = (recordId: string) => {
    const updated = history.filter((h) => h.id !== recordId);
    saveStoredHistory(updated);
    setHistory(updated);
    showToast('Slip deleted from history');
  };

  // Wipe All Data / Load Demo
  const handleClearAllData = () => {
    setClients([]);
    saveStoredClients([]);
    showToast('All clients cleared! Workspace is clean.');
  };

  const handleLoadDemoData = () => {
    const mapped = FAITH_BATCH.map((c) => ({
      ...c,
      panels: panels[0] ? { [panels[0].id]: c.sms } : undefined,
    }));
    setClients(mapped);
    showToast('Loaded Faith Demo Batch (23 Clients)');
  };

  const handleExportExcel = () => {
    exportToExcel(
      clients,
      rate,
      currency,
      batchName,
      startDate,
      endDate,
      panels,
      showRate
    );
    showToast(`Downloaded ${batchName}.xlsx`);
  };

  const handleExportCSV = () => {
    exportToCSV(
      clients,
      rate,
      currency,
      batchName,
      startDate,
      endDate,
      panels,
      showRate
    );
    showToast('Downloaded CSV');
  };

  const handleCopySummary = () => {
    const text = generateFullReportText(
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
    navigator.clipboard.writeText(text);
    showToast('KBMAX Summary copied to clipboard!');
  };

  const handleCopyAllParchiyan = () => {
    const allText = clients
      .map(
        (c, i) =>
          `#${i + 1}\n` +
          generateParchiText(
            c,
            rate,
            currency,
            language,
            startDate,
            endDate,
            showRate,
            panels
          )
      )
      .join('\n\n━━━━━━━━━━━━━━━━━━━━\n\n');
    navigator.clipboard.writeText(allText);
    showToast(`Copied all ${clients.length} slips!`);
  };

  // If not authenticated, show Login View
  if (!isAuthenticated) {
    return (
      <LoginView
        onLogin={handleLogin}
        correctPassword={settings.adminPassword}
        theme={theme}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex transition-colors">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-[#002a4e] text-white px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2 text-xs font-bold border border-blue-900 animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-amber-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Responsive Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
        theme={theme}
        onToggleTheme={handleToggleTheme}
        onLogout={handleLogout}
        clientsCount={clients.length}
        historyCount={history.length}
        username={settings.username || 'Admin'}
      />

      {/* Main Content Area (offset by sidebar on desktop) */}
      <div className="flex-1 md:pl-60 flex flex-col min-w-0">
        {/* Top Header */}
        <Header
          activeTab={activeTab}
          theme={theme}
          onToggleTheme={handleToggleTheme}
          onToggleSidebar={() => setSidebarOpen(true)}
          onLogout={handleLogout}
          companyName={batchName}
          username={settings.username || 'Admin'}
        />

        {/* View Switcher Container */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {/* TAB 1: Executive Dashboard */}
          {activeTab === 'dashboard' && (
            <DashboardView
              clients={clients}
              stats={stats}
              rate={rate}
              setRate={setRate}
              currency={currency}
              setCurrency={setCurrency}
              batchName={batchName}
              setBatchName={setBatchName}
              startDate={startDate}
              setStartDate={setStartDate}
              endDate={endDate}
              setEndDate={setEndDate}
              panels={panels}
              historyCount={history.length}
              onOpenImport={() => setIsImportOpen(true)}
              onNavigateToTable={() => setActiveTab('table')}
              onNavigateToParchiyan={() => setActiveTab('parchiyan')}
              onNavigateToHistory={() => setActiveTab('history')}
              onExportExcel={handleExportExcel}
            />
          )}

          {/* TAB 2: Full Reports Table (Panels & Date Range) */}
          {activeTab === 'table' && (
            <div className="space-y-5">
              <ReportTableView
                clients={clients}
                rate={rate}
                currency={currency}
                batchName={batchName}
                startDate={startDate}
                setStartDate={setStartDate}
                endDate={endDate}
                setEndDate={setEndDate}
                panels={panels}
                onAddPanel={handleAddPanel}
                onRemovePanel={handleRemovePanel}
                showRate={showRate}
                setShowRate={setShowRate}
                onUpdateClient={handleUpdateClient}
                onDeleteClient={handleDeleteClient}
                onAddClient={handleAddClient}
                onExportExcel={handleExportExcel}
                onExportCSV={handleExportCSV}
                onRequestDownloadImage={handleRequestDownloadImage}
                onRequestSaveCombinedPin={handleRequestSaveCombinedPin}
                selectedTemplate={selectedTemplate}
                customConfig={slipCustomConfig}
                onOpenCustomizeModal={() => setIsGlobalCustomizeOpen(true)}
                onSaveCombinedToHistory={handleSaveCombinedToHistory}
              />
            </div>
          )}

          {/* TAB 3: Crown Executive Slips (Parchiyan) */}
          {activeTab === 'parchiyan' && (
            <ParchiyanView
              clients={clients}
              rate={rate}
              currency={currency}
              batchName={batchName}
              startDate={startDate}
              endDate={endDate}
              showRate={showRate}
              panels={panels}
              selectedTemplate={selectedTemplate}
              onSelectTemplate={setSelectedTemplate}
              customConfig={slipCustomConfig}
              onSaveCustomConfig={(cfg) => {
                setSlipCustomConfig(cfg);
                showToast('Saved');
              }}
              onAddClient={(c) => {
                handleAddClient(c.name, c.sms, c.panels);
                showToast(`Added client "${c.name}"`);
              }}
              onUpdateClient={(c) => {
                handleUpdateClient(c.id, c.name, c.sms, c.panels);
                showToast(`Updated "${c.name}"`);
              }}
              onDeleteClient={(id) => {
                handleDeleteClient(id);
                showToast('Client deleted');
              }}
              onPreviewClient={(c) => setPreviewClient(c)}
              onCopyAllParchiyan={handleCopyAllParchiyan}
              onRequestDownloadImage={handleRequestDownloadImage}
              onRequestSaveCombinedPin={handleRequestSaveCombinedPin}
              onSaveCombinedToHistory={handleSaveCombinedToHistory}
            />
          )}

          {/* TAB 4: Client History & Archives */}
          {activeTab === 'history' && (
            <HistoryView
              history={history}
              onClearHistory={handleClearHistory}
              onRestoreClient={handleRestoreFromHistory}
              onDeleteRecord={handleDeleteHistoryRecord}
              panels={panels}
              currency={currency}
              selectedTemplate={selectedTemplate}
              customConfig={slipCustomConfig}
            />
          )}

          {/* TAB 5: Settings & Full Control */}
          {activeTab === 'settings' && (
            <SettingsView
              settings={settings}
              onUpdateSettings={(newSettings) => {
                setSettings(newSettings);
                setTheme(newSettings.theme);
                setRate(newSettings.defaultRate);
                setCurrency(newSettings.currency);
                setBatchName(newSettings.companyName);
                setShowRate(newSettings.showRateOnSlips);
                showToast('Settings saved successfully');
              }}
              panels={panels}
              onAddPanel={handleAddPanel}
              onRemovePanel={handleRemovePanel}
              onClearAllData={handleClearAllData}
              onLoadDemoData={handleLoadDemoData}
              onOpenCustomizeModal={() => setIsGlobalCustomizeOpen(true)}
            />
          )}
        </main>

        {/* Global Footer */}
        <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-3 text-center text-xs text-slate-500 dark:text-slate-400 mt-auto">
          <p>
            <strong>KBMAX</strong> • Billing Portal
          </p>
        </footer>
      </div>

      {/* Security PIN Modal before Slip Download */}
      <PinModal
        isOpen={pinModalOpen}
        onClose={() => {
          setPinModalOpen(false);
          setClientForPinDownload(null);
          setCombinedClientsForPin(null);
        }}
        onSuccess={handlePinSuccess}
        correctPin={settings.securityPin || '1234'}
        clientName={
          combinedClientsForPin
            ? `Combined Slip (${combinedClientsForPin.length} Accounts)`
            : clientForPinDownload?.name
        }
      />

      {/* Import Modal */}
      <ImportModal
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
        panels={panels}
        onAddPanel={handleAddPanel}
        onImport={handleImport}
        currency={currency}
      />

      {/* Global Slip & Report Picture Color Customizer Modal (A to Z) */}
      <SlipCustomizeModal
        isOpen={isGlobalCustomizeOpen}
        onClose={() => setIsGlobalCustomizeOpen(false)}
        config={slipCustomConfig}
        onSaveConfig={(newCfg) => {
          setSlipCustomConfig(newCfg);
          showToast('All slip and report picture colors updated successfully!');
        }}
        currentTemplateId={selectedTemplate}
        sampleClient={clients[0]}
        rate={rate}
        currency={currency}
        startDate={startDate}
        endDate={endDate}
        panels={panels}
      />

      {/* Single Parchi HD Modal */}
      <ParchiModal
        client={previewClient}
        onClose={() => setPreviewClient(null)}
        rate={rate}
        currency={currency}
        batchName={batchName}
        language={language}
        startDate={startDate}
        endDate={endDate}
        showRate={showRate}
        panels={panels}
        selectedTemplate={selectedTemplate}
        onSelectTemplate={setSelectedTemplate}
        onRequestDownloadImage={handleRequestDownloadImage}
        customConfig={slipCustomConfig}
      />
    </div>
  );
}
