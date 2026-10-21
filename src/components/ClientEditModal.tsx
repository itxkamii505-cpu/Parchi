import React, { useState, useEffect } from 'react';
import { X, UserPlus, UserCheck, Trash2, Hash } from 'lucide-react';
import { ClientRecord, Panel } from '../types';

interface ClientEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  client: ClientRecord | null; // null means adding a new client
  onSaveClient: (client: ClientRecord) => void;
  onDeleteClient?: (clientId: string) => void;
  panels: Panel[];
}

export const ClientEditModal: React.FC<ClientEditModalProps> = ({
  isOpen,
  onClose,
  client,
  onSaveClient,
  onDeleteClient,
  panels,
}) => {
  const [name, setName] = useState('');
  const [sms, setSms] = useState<number>(0);
  const [panelCounts, setPanelCounts] = useState<Record<string, number>>({});
  const [error, setError] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);

  const isEditing = Boolean(client);

  useEffect(() => {
    if (client) {
      setName(client.name);
      setSms(client.sms);
      setPanelCounts(client.panels ? { ...client.panels } : {});
    } else {
      setName('');
      setSms(0);
      setPanelCounts({});
    }
    setError('');
    setConfirmDelete(false);
  }, [client, isOpen]);

  if (!isOpen) return null;

  const handlePanelChange = (panelId: string, valueStr: string) => {
    const val = parseInt(valueStr, 10) || 0;
    const updated = { ...panelCounts, [panelId]: Math.max(0, val) };
    setPanelCounts(updated);

    // If panels exist, auto-sum to total SMS
    const totalFromPanels = Object.values(updated).reduce((acc, curr) => acc + (curr || 0), 0);
    if (panels.length > 0) {
      setSms(totalFromPanels);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please enter client name');
      return;
    }
    if (sms <= 0 && panels.length === 0) {
      setError('Please enter a valid SMS quantity');
      return;
    }

    const newRecord: ClientRecord = {
      id: client?.id || `client-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      name: name.trim(),
      sms: Math.max(0, sms),
      panels: panelCounts,
      lastUpdated: new Date().toISOString(),
    };

    onSaveClient(newRecord);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-950/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
              {isEditing ? <UserCheck className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">
                {isEditing ? 'Edit Client' : 'Add Client'}
              </h3>
              <p className="text-[11px] text-slate-400">
                {isEditing ? 'Update name or SMS count' : 'Enter name and count'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSave} className="p-5 space-y-4">
          {error && (
            <div className="px-3 py-2 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-medium">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">
              Client Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setError('');
              }}
              placeholder="e.g. Client_Name"
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-white text-sm focus:outline-none focus:border-amber-400 transition"
              autoFocus
            />
          </div>

          {/* If Panels exist, show breakdown */}
          {panels.length > 0 ? (
            <div className="space-y-2.5">
              <label className="block text-xs font-bold text-slate-300">
                Panels Breakdown
              </label>
              <div className="space-y-2 bg-slate-950/60 p-3 rounded-xl border border-slate-800 max-h-48 overflow-y-auto">
                {panels.map((p) => (
                  <div key={p.id} className="flex items-center justify-between gap-3">
                    <span className="text-xs text-slate-300 font-medium truncate">{p.name}</span>
                    <input
                      type="number"
                      min="0"
                      value={panelCounts[p.id] ?? ''}
                      onChange={(e) => handlePanelChange(p.id, e.target.value)}
                      placeholder="0"
                      className="w-28 bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-right text-xs text-amber-300 font-mono focus:outline-none focus:border-amber-400"
                    />
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between px-2 pt-1 text-xs">
                <span className="text-slate-400">Total SMS:</span>
                <span className="font-bold text-amber-400 font-mono">{sms.toLocaleString()}</span>
              </div>
            </div>
          ) : (
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                SMS Count *
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  value={sms || ''}
                  onChange={(e) => {
                    setSms(Math.max(0, parseInt(e.target.value, 10) || 0));
                    setError('');
                  }}
                  placeholder="e.g. 25000"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3.5 py-2 text-white text-sm font-mono focus:outline-none focus:border-amber-400 transition"
                />
                <Hash className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
              </div>
            </div>
          )}

          {/* Footer Buttons */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-800">
            {isEditing && onDeleteClient && client ? (
              confirmDelete ? (
                <div className="flex items-center gap-1.5 animate-in fade-in duration-150">
                  <button
                    type="button"
                    onClick={() => {
                      onDeleteClient(client.id);
                      onClose();
                    }}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white shadow-md transition flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Confirm
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmDelete(false)}
                    className="px-2 py-1.5 rounded-lg text-xs text-slate-400 hover:text-white"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setConfirmDelete(true)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold text-rose-400 hover:text-rose-200 hover:bg-rose-500/10 transition flex items-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Delete
                </button>
              )
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md shadow-amber-500/20 transition"
              >
                {isEditing ? 'Save' : 'Add'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
