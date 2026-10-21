import { ClientRecord, ClientHistoryRecord, AppSettings, Panel } from '../types';

const STORAGE_KEYS = {
  CLIENTS: 'kbmax_clients_v2',
  HISTORY: 'kbmax_history_v2',
  PANELS: 'kbmax_panels_v2',
  SETTINGS: 'kbmax_settings_v2',
  AUTH: 'kbmax_auth_session_v2',
  DATE_RANGE: 'kbmax_date_range_v2',
};

export const DEFAULT_SETTINGS: AppSettings = {
  username: 'Admin',
  securityPin: '1234',
  adminPassword: 'admin',
  defaultRate: 2.3,
  currency: 'PKR',
  companyName: 'KBMAX Weekly Reports',
  showRateOnSlips: true,
  theme: 'light',
};

export const DEFAULT_PANELS: Panel[] = [
  { id: 'p1', name: 'Extra', color: '#0284c7' },
  { id: 'p2', name: 'Core', color: '#d97706' },
];

export function getStoredClients(): ClientRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CLIENTS);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    console.error('Error loading clients from storage', e);
    return [];
  }
}

export function saveStoredClients(clients: ClientRecord[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.CLIENTS, JSON.stringify(clients));
  } catch (e) {
    console.error('Error saving clients', e);
  }
}

export function getStoredHistory(): ClientHistoryRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.HISTORY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    console.error('Error loading history', e);
    return [];
  }
}

export function saveStoredHistory(history: ClientHistoryRecord[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(history));
  } catch (e) {
    console.error('Error saving history', e);
  }
}

export function addHistoryRecord(record: ClientHistoryRecord): void {
  const current = getStoredHistory();
  // Prepend newest first
  saveStoredHistory([record, ...current]);
}

export function getStoredPanels(): Panel[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PANELS);
    if (!raw) return DEFAULT_PANELS;
    const parsed = JSON.parse(raw);
    return parsed.length > 0 ? parsed : DEFAULT_PANELS;
  } catch (e) {
    return DEFAULT_PANELS;
  }
}

export function saveStoredPanels(panels: Panel[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.PANELS, JSON.stringify(panels));
  } catch (e) {
    console.error('Error saving panels', e);
  }
}

export function getStoredSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (!raw) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch (e) {
    return DEFAULT_SETTINGS;
  }
}

export function saveStoredSettings(settings: AppSettings): void {
  try {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  } catch (e) {
    console.error('Error saving settings', e);
  }
}

export function isUserAuthenticated(): boolean {
  return localStorage.getItem(STORAGE_KEYS.AUTH) === 'true';
}

export function setUserAuthenticated(auth: boolean): void {
  if (auth) {
    localStorage.setItem(STORAGE_KEYS.AUTH, 'true');
  } else {
    localStorage.removeItem(STORAGE_KEYS.AUTH);
  }
}
