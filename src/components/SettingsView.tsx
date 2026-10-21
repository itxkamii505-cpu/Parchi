import React, { useState } from 'react';
import {
  Settings,
  Lock,
  Palette,
  Coins,
  Layers,
  Trash2,
  Plus,
  Save,
  Check,
  Sun,
  Moon,
} from 'lucide-react';
import { AppSettings, Panel } from '../types';

interface SettingsViewProps {
  settings: AppSettings;
  onUpdateSettings: (newSettings: AppSettings) => void;
  panels: Panel[];
  onAddPanel: (name: string) => void;
  onRemovePanel: (id: string) => void;
  onClearAllData: () => void;
  onLoadDemoData: () => void;
  onOpenCustomizeModal?: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  onUpdateSettings,
  panels,
  onAddPanel,
  onRemovePanel,
  onClearAllData,
  onLoadDemoData,
  onOpenCustomizeModal,
}) => {
  const [form, setForm] = useState<AppSettings>({ ...settings });
  const [newPanelInput, setNewPanelInput] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [showWipeModal, setShowWipeModal] = useState(false);
  const [showReloadModal, setShowReloadModal] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSettings(form);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  const handleCreatePanel = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPanelInput.trim()) return;
    onAddPanel(newPanelInput.trim());
    setNewPanelInput('');
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in duration-200">
      {/* Settings Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-2xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[#002a4e] text-white flex items-center justify-center font-bold text-lg">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900 dark:text-white">
                System & Security Settings
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Configure security PIN, admin credentials, rate defaults, product panels, and appearance.
              </p>
            </div>
          </div>

          {savedSuccess && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 text-xs font-bold animate-in fade-in">
              <Check className="w-4 h-4" />
              <span>Settings Saved!</span>
            </div>
          )}
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Security & Access Section */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-2xs space-y-4">
          <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
            <Lock className="w-4 h-4 text-amber-500" />
            <span>Security PIN & Admin Password</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Display Username
              </label>
              <input
                type="text"
                value={form.username || 'Admin'}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                className="w-full px-3 py-2 text-xs font-bold rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#002a4e]"
                placeholder="Admin"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Download Security PIN
              </label>
              <input
                type="text"
                maxLength={6}
                value={form.securityPin}
                onChange={(e) => setForm({ ...form, securityPin: e.target.value })}
                className="w-full px-3 py-2 text-xs font-bold rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#002a4e]"
                placeholder="1234"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Portal Password
              </label>
              <input
                type="text"
                value={form.adminPassword}
                onChange={(e) => setForm({ ...form, adminPassword: e.target.value })}
                className="w-full px-3 py-2 text-xs font-bold rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#002a4e]"
                placeholder="admin"
              />
            </div>
          </div>
        </div>

        {/* Company & Billing Defaults */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-2xs space-y-4">
          <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
            <Coins className="w-4 h-4 text-emerald-500" />
            <span>Company Branding & SMS Rate Defaults</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Company Brand Title
              </label>
              <input
                type="text"
                value={form.companyName}
                onChange={(e) => setForm({ ...form, companyName: e.target.value })}
                className="w-full px-3 py-2 text-sm font-bold rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Default Rate per SMS
              </label>
              <input
                type="number"
                step="0.05"
                value={form.defaultRate}
                onChange={(e) => setForm({ ...form, defaultRate: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 text-sm font-bold rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Currency Symbol
              </label>
              <select
                value={form.currency}
                onChange={(e) => setForm({ ...form, currency: e.target.value })}
                className="w-full px-3 py-2 text-sm font-bold rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
              >
                <option value="PKR">PKR (₨)</option>
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
              </select>
            </div>
          </div>

          <div className="pt-2 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Show Rate on Slips by Default
              </p>
              <span className="text-[11px] text-slate-400">
                When turned off, rate is hidden while Total PKR amount is always preserved.
              </span>
            </div>
            <input
              type="checkbox"
              checked={form.showRateOnSlips}
              onChange={(e) => setForm({ ...form, showRateOnSlips: e.target.checked })}
              className="w-5 h-5 rounded text-[#002a4e] cursor-pointer"
            />
          </div>

          {onOpenCustomizeModal && (
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Report Pic & Slip All Line Colors (A to Z)
                </p>
                <span className="text-[11px] text-slate-400">
                  Customize every border, divider, text, SMS count, PKR total amount and background color.
                </span>
              </div>
              <button
                type="button"
                onClick={onOpenCustomizeModal}
                className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-bold text-xs shadow-xs hover:from-amber-400 hover:to-yellow-300 transition cursor-pointer flex items-center gap-1.5"
              >
                <Palette className="w-3.5 h-3.5" />
                <span>Customize Colors (A to Z)</span>
              </button>
            </div>
          )}
        </div>

        {/* Panels Management */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-2xs space-y-4">
          <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
            <Layers className="w-4 h-4 text-sky-500" />
            <span>Manage SMS Panels</span>
          </h3>

          <div className="flex flex-wrap gap-2">
            {panels.map((p) => (
              <div
                key={p.id}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800 text-xs font-bold text-[#002a4e] dark:text-sky-300"
              >
                <span>{p.name}</span>
                <button
                  type="button"
                  onClick={() => onRemovePanel(p.id)}
                  className="text-slate-400 hover:text-red-500 cursor-pointer p-0.5"
                  title="Delete Panel"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>

          {/* Quick Add Panel Input */}
          <div className="flex items-center gap-2 pt-2">
            <input
              type="text"
              value={newPanelInput}
              onChange={(e) => setNewPanelInput(e.target.value)}
              placeholder="New Panel Name (e.g. Jazz, Panel 2)"
              className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white w-60"
            />
            <button
              type="button"
              onClick={handleCreatePanel}
              className="px-3 py-1.5 rounded-lg bg-[#002a4e] hover:bg-blue-900 text-white text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Panel</span>
            </button>
          </div>
        </div>

        {/* Theme Appearance Mode */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-2xs space-y-4">
          <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
            <Palette className="w-4 h-4 text-purple-500" />
            <span>Theme & Display Mode</span>
          </h3>

          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setForm({ ...form, theme: 'light' })}
              className={`p-3 rounded-xl border flex items-center gap-2.5 transition-all cursor-pointer ${
                form.theme === 'light'
                  ? 'border-[#002a4e] bg-sky-50 dark:bg-sky-950/40 text-slate-900 ring-2 ring-[#002a4e]'
                  : 'border-slate-200 dark:border-slate-800 text-slate-600'
              }`}
            >
              <Sun className="w-4 h-4 text-amber-500" />
              <div className="text-left">
                <p className="text-xs font-bold">Day Theme (Light)</p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setForm({ ...form, theme: 'dark' })}
              className={`p-3 rounded-xl border flex items-center gap-2.5 transition-all cursor-pointer ${
                form.theme === 'dark'
                  ? 'border-sky-500 bg-slate-800 text-white ring-2 ring-sky-500'
                  : 'border-slate-200 dark:border-slate-800 text-slate-600'
              }`}
            >
              <Moon className="w-4 h-4 text-amber-400" />
              <div className="text-left">
                <p className="text-xs font-bold text-white">Night Theme (Dark)</p>
              </div>
            </button>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="px-4 py-2 rounded-xl bg-[#002a4e] hover:bg-blue-900 text-white text-xs font-bold shadow-md transition-all cursor-pointer flex items-center gap-1.5"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Settings</span>
          </button>
        </div>
      </form>

      {/* Data Management & Clean Slate */}
      <div className="bg-red-50/50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 rounded-2xl p-5 shadow-2xs space-y-2">
        <h3 className="text-xs font-bold text-red-900 dark:text-red-400 uppercase tracking-wider flex items-center gap-1.5">
          <Trash2 className="w-3.5 h-3.5" />
          <span>Reset & Clean Slate</span>
        </h3>

        <div className="flex flex-wrap gap-2 pt-1">
          <button
            type="button"
            onClick={() => setShowWipeModal(true)}
            className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-semibold cursor-pointer transition-colors shadow-xs"
          >
            Wipe All Clients
          </button>

          <button
            type="button"
            onClick={() => setShowReloadModal(true)}
            className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 text-xs font-semibold cursor-pointer transition-colors"
          >
            Reload Sample Data
          </button>
        </div>
      </div>

      {/* WIPE ALL DATA CONFIRM MODAL */}
      {showWipeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-sm w-full p-6 text-center shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Wipe All Current Clients?</h3>
              <p className="text-xs text-slate-400 mt-1">
                Wipe all current table clients to start completely fresh with an empty slate?
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowWipeModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:bg-slate-800 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  onClearAllData();
                  setShowWipeModal(false);
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-600/30 transition cursor-pointer"
              >
                Yes, Wipe All
              </button>
            </div>
          </div>
        </div>
      )}

      {/* RELOAD SAMPLE DATA CONFIRM MODAL */}
      {showReloadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-sm w-full p-6 text-center shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center mx-auto">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Reload Sample Data?</h3>
              <p className="text-xs text-slate-400 mt-1">
                This will load the 23 demo clients into your current workspace.
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowReloadModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:bg-slate-800 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  onLoadDemoData();
                  setShowReloadModal(false);
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/30 transition cursor-pointer"
              >
                Reload Data
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
