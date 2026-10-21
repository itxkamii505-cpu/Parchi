import { ClientRecord, Panel } from '../types';

export type SlipTemplateId =
  | 'royal_crown'
  | 'cyber_emerald'
  | 'carbon_stealth'
  | 'swiss_precision'
  | 'vintage_parchment'
  | 'midnight_amethyst'
  | 'crimson_dynasty'
  | 'oceanic_sapphire'
  | 'sunset_amber'
  | 'obsidian_monolith';

export interface SlipTemplateConfig {
  id: SlipTemplateId;
  number: number;
  name: string;
  tagline: string;
  badgeIcon: string;
  isDark: boolean;
  colors: {
    bg: string;
    cardBg: string;
    border: string;
    accent: string;
    titleColor: string;
    clientBoxBg: string;
    clientBoxBorder: string;
    clientTextColor: string;
    smsCountColor: string;
    rateColor: string;
    totalColor: string;
    stampColor: string;
    panelBadgeBg: string;
    panelBadgeText: string;
    panelBadgeBorder: string;
  };
  uiCardClasses: {
    card: string;
    headerIcon: string;
    brandText: string;
    dateText: string;
    clientBox: string;
    clientText: string;
    smsNumber: string;
    totalAmount: string;
    panelBadge: string;
    primaryButton: string;
    actionButton: string;
    stampText: string;
  };
  stamp: string;
}

export const SLIP_TEMPLATES: SlipTemplateConfig[] = [
  // 1. Royal Crown VIP (Navy & 24K Gold)
  {
    id: 'royal_crown',
    number: 1,
    name: 'Executive Elite VIP',
    tagline: 'Imperial Deep Navy & 24K Gold Filigree',
    badgeIcon: '◆',
    isDark: false,
    colors: {
      bg: '#ffffff',
      cardBg: '#ffffff',
      border: '#002a4e',
      accent: '#c89d3c',
      titleColor: '#002a4e',
      clientBoxBg: '#f8fafc',
      clientBoxBorder: '#002a4e',
      clientTextColor: '#002a4e',
      smsCountColor: '#0f172a',
      rateColor: '#475569',
      totalColor: '#002a4e',
      stampColor: '#64748b',
      panelBadgeBg: '#fef3c7',
      panelBadgeText: '#92400e',
      panelBadgeBorder: '#fde68a',
    },
    uiCardClasses: {
      card: 'bg-white dark:bg-slate-900 border-2 border-[#002a4e] dark:border-amber-500 shadow-md',
      headerIcon: 'text-amber-500',
      brandText: 'text-[#002a4e] dark:text-amber-400 font-black',
      dateText: 'text-slate-500',
      clientBox: 'bg-slate-50 dark:bg-slate-800/80 border border-[#002a4e] dark:border-amber-500/50',
      clientText: 'text-[#002a4e] dark:text-amber-300 font-black',
      smsNumber: 'text-slate-900 dark:text-white',
      totalAmount: 'text-[#002a4e] dark:text-amber-400',
      panelBadge: 'bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-800',
      primaryButton: 'bg-gradient-to-r from-[#002a4e] to-blue-900 text-white',
      actionButton: 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200',
      stampText: '★ KBMAX OFFICIAL RECORD • VERIFIED',
    },
    stamp: '★ KBMAX OFFICIAL RECORD • VERIFIED',
  },

  // 2. Cyber Emerald Ledger
  {
    id: 'cyber_emerald',
    number: 2,
    name: 'Cyber Emerald Ledger',
    tagline: 'Dark Obsidian Matrix & High-Contrast Mint',
    badgeIcon: '🛡️',
    isDark: true,
    colors: {
      bg: '#041c14',
      cardBg: '#041c14',
      border: '#10b981',
      accent: '#34d399',
      titleColor: '#34d399',
      clientBoxBg: '#072e21',
      clientBoxBorder: '#10b981',
      clientTextColor: '#ecfdf5',
      smsCountColor: '#34d399',
      rateColor: '#a7f3d0',
      totalColor: '#10b981',
      stampColor: '#6ee7b7',
      panelBadgeBg: '#064e3b',
      panelBadgeText: '#a7f3d0',
      panelBadgeBorder: '#059669',
    },
    uiCardClasses: {
      card: 'bg-[#041c14] border-2 border-emerald-500 shadow-emerald-950/30 text-emerald-100',
      headerIcon: 'text-emerald-400',
      brandText: 'text-emerald-400 font-mono font-black',
      dateText: 'text-emerald-300/70 font-mono',
      clientBox: 'bg-[#072e21] border border-emerald-500/80 shadow-inner',
      clientText: 'text-white font-mono font-black',
      smsNumber: 'text-emerald-400 font-mono',
      totalAmount: 'text-emerald-300 font-mono',
      panelBadge: 'bg-emerald-950 text-emerald-300 border-emerald-700 font-mono',
      primaryButton: 'bg-gradient-to-r from-emerald-600 to-teal-700 text-white font-mono',
      actionButton: 'bg-[#072e21] border-emerald-800 text-emerald-200',
      stampText: '🛡️ ENCRYPTED LEDGER V2 • CONFIRMED',
    },
    stamp: '🛡️ ENCRYPTED LEDGER V2 • CONFIRMED',
  },

  // 3. Carbon Stealth Matte
  {
    id: 'carbon_stealth',
    number: 3,
    name: 'Carbon Stealth Matte',
    tagline: 'Triple Black & Champagne Titanium Accents',
    badgeIcon: '⚡',
    isDark: true,
    colors: {
      bg: '#0f1115',
      cardBg: '#0f1115',
      border: '#d4af37',
      accent: '#f59e0b',
      titleColor: '#d4af37',
      clientBoxBg: '#1b1e26',
      clientBoxBorder: '#374151',
      clientTextColor: '#f9fafb',
      smsCountColor: '#f3f4f6',
      rateColor: '#9ca3af',
      totalColor: '#d4af37',
      stampColor: '#6b7280',
      panelBadgeBg: '#232730',
      panelBadgeText: '#d4af37',
      panelBadgeBorder: '#374151',
    },
    uiCardClasses: {
      card: 'bg-[#0f1115] border-2 border-amber-500/80 shadow-2xl text-slate-100',
      headerIcon: 'text-amber-400',
      brandText: 'text-amber-400 tracking-wider font-black',
      dateText: 'text-slate-400',
      clientBox: 'bg-[#1b1e26] border border-slate-700',
      clientText: 'text-white font-black',
      smsNumber: 'text-white',
      totalAmount: 'text-amber-400',
      panelBadge: 'bg-[#232730] text-amber-300 border-slate-700',
      primaryButton: 'bg-gradient-to-r from-amber-600 to-amber-700 text-black font-black',
      actionButton: 'bg-[#1b1e26] border-slate-700 text-slate-300',
      stampText: '⚡ EXECUTIVE MATTE EDITION • AUTHENTIC',
    },
    stamp: '⚡ EXECUTIVE MATTE EDITION • AUTHENTIC',
  },

  // 4. Swiss Precision Invoice
  {
    id: 'swiss_precision',
    number: 4,
    name: 'Swiss Precision Invoice',
    tagline: 'Studio White Minimalist & Electric Sapphire',
    badgeIcon: '✓',
    isDark: false,
    colors: {
      bg: '#ffffff',
      cardBg: '#ffffff',
      border: '#1e40af',
      accent: '#2563eb',
      titleColor: '#0f172a',
      clientBoxBg: '#f8fafc',
      clientBoxBorder: '#cbd5e1',
      clientTextColor: '#0f172a',
      smsCountColor: '#0f172a',
      rateColor: '#64748b',
      totalColor: '#1e40af',
      stampColor: '#94a3b8',
      panelBadgeBg: '#eff6ff',
      panelBadgeText: '#1e40af',
      panelBadgeBorder: '#bfdbfe',
    },
    uiCardClasses: {
      card: 'bg-white dark:bg-slate-900 border-2 border-blue-600 shadow-sm text-slate-900 dark:text-white',
      headerIcon: 'text-blue-600',
      brandText: 'text-slate-900 dark:text-white font-bold tracking-tight',
      dateText: 'text-slate-400',
      clientBox: 'bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700',
      clientText: 'text-slate-900 dark:text-white font-bold',
      smsNumber: 'text-slate-900 dark:text-white',
      totalAmount: 'text-blue-700 dark:text-blue-400',
      panelBadge: 'bg-blue-50 dark:bg-blue-950/40 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-800',
      primaryButton: 'bg-blue-700 hover:bg-blue-800 text-white font-bold',
      actionButton: 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200',
      stampText: '✓ SWISS CERTIFIED BILLING RECORD',
    },
    stamp: '✓ SWISS CERTIFIED BILLING RECORD',
  },

  // 5. Vintage Heritage Certificate
  {
    id: 'vintage_parchment',
    number: 5,
    name: 'Vintage Heritage Certificate',
    tagline: 'Antique Sepia Parchment & Warm Copper',
    badgeIcon: '★',
    isDark: false,
    colors: {
      bg: '#fbf7ee',
      cardBg: '#fbf7ee',
      border: '#8c5b36',
      accent: '#b45309',
      titleColor: '#451a03',
      clientBoxBg: '#f5edd9',
      clientBoxBorder: '#a16207',
      clientTextColor: '#451a03',
      smsCountColor: '#451a03',
      rateColor: '#78350f',
      totalColor: '#78350f',
      stampColor: '#92400e',
      panelBadgeBg: '#fef3c7',
      panelBadgeText: '#78350f',
      panelBadgeBorder: '#fde68a',
    },
    uiCardClasses: {
      card: 'bg-[#fbf7ee] border-2 border-[#8c5b36] shadow-md text-amber-950',
      headerIcon: 'text-amber-800',
      brandText: 'text-amber-950 font-serif font-black',
      dateText: 'text-amber-800/80',
      clientBox: 'bg-[#f5edd9] border border-amber-700/60 shadow-inner',
      clientText: 'text-amber-950 font-serif font-black',
      smsNumber: 'text-amber-950 font-serif',
      totalAmount: 'text-amber-900 font-serif font-black',
      panelBadge: 'bg-amber-100 text-amber-900 border-amber-300 font-serif',
      primaryButton: 'bg-gradient-to-r from-[#8c5b36] to-amber-900 text-amber-50 font-serif font-bold',
      actionButton: 'bg-[#f5edd9] border-amber-700/50 text-amber-900',
      stampText: '★ SEAL OF AUTHENTIC RECORD ★',
    },
    stamp: '★ SEAL OF AUTHENTIC RECORD ★',
  },

  // 6. Midnight Amethyst & Rose Gold
  {
    id: 'midnight_amethyst',
    number: 6,
    name: 'Midnight Amethyst',
    tagline: 'Deep Royal Violet & Shimmering Rose Gold',
    badgeIcon: '✦',
    isDark: true,
    colors: {
      bg: '#170b24',
      cardBg: '#170b24',
      border: '#f43f5e',
      accent: '#fda4af',
      titleColor: '#fda4af',
      clientBoxBg: '#27143d',
      clientBoxBorder: '#fb7185',
      clientTextColor: '#fff1f2',
      smsCountColor: '#fce7f3',
      rateColor: '#e9d5ff',
      totalColor: '#fb7185',
      stampColor: '#c084fc',
      panelBadgeBg: '#3b185f',
      panelBadgeText: '#fce7f3',
      panelBadgeBorder: '#a855f7',
    },
    uiCardClasses: {
      card: 'bg-[#170b24] border-2 border-rose-500 shadow-xl text-purple-100',
      headerIcon: 'text-rose-400',
      brandText: 'text-rose-300 font-black',
      dateText: 'text-purple-300/80',
      clientBox: 'bg-[#27143d] border border-rose-500/60 shadow-inner',
      clientText: 'text-white font-black',
      smsNumber: 'text-purple-100',
      totalAmount: 'text-rose-400 font-black',
      panelBadge: 'bg-[#3b185f] text-pink-200 border-purple-600',
      primaryButton: 'bg-gradient-to-r from-rose-600 to-purple-800 text-white font-bold',
      actionButton: 'bg-[#27143d] border-purple-800 text-pink-200',
      stampText: '✦ PRIVILEGED CLIENT RECORD • VERIFIED',
    },
    stamp: '✦ PRIVILEGED CLIENT RECORD • VERIFIED',
  },

  // 7. Crimson Dynasty Executive
  {
    id: 'crimson_dynasty',
    number: 7,
    name: 'Crimson Dynasty',
    tagline: 'Imperial Scarlet Red & Warm Polished Brass',
    badgeIcon: '◆',
    isDark: false,
    colors: {
      bg: '#ffffff',
      cardBg: '#ffffff',
      border: '#7f1d1d',
      accent: '#eab308',
      titleColor: '#7f1d1d',
      clientBoxBg: '#fef2f2',
      clientBoxBorder: '#b91c1c',
      clientTextColor: '#7f1d1d',
      smsCountColor: '#1c1917',
      rateColor: '#78716c',
      totalColor: '#991b1b',
      stampColor: '#a8a29e',
      panelBadgeBg: '#fee2e2',
      panelBadgeText: '#991b1b',
      panelBadgeBorder: '#fca5a5',
    },
    uiCardClasses: {
      card: 'bg-white dark:bg-slate-900 border-2 border-red-800 shadow-md text-slate-900 dark:text-white',
      headerIcon: 'text-amber-500',
      brandText: 'text-red-900 dark:text-red-400 font-black',
      dateText: 'text-slate-500',
      clientBox: 'bg-red-50/70 dark:bg-red-950/30 border border-red-700/60',
      clientText: 'text-red-900 dark:text-red-300 font-black',
      smsNumber: 'text-slate-900 dark:text-white',
      totalAmount: 'text-red-700 dark:text-red-400 font-black',
      panelBadge: 'bg-red-50 dark:bg-red-950/40 text-red-800 dark:text-red-300 border-red-200 dark:border-red-800',
      primaryButton: 'bg-gradient-to-r from-red-800 to-amber-700 text-white font-bold',
      actionButton: 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200',
      stampText: '★ IMPERIAL SEAL • AUTHORIZED BATCH',
    },
    stamp: '★ IMPERIAL SEAL • AUTHORIZED BATCH',
  },

  // 8. Oceanic Sapphire Glass
  {
    id: 'oceanic_sapphire',
    number: 8,
    name: 'Oceanic Sapphire',
    tagline: 'Deep Ocean Azure & Holographic Neon Cyan',
    badgeIcon: '❖',
    isDark: true,
    colors: {
      bg: '#02162e',
      cardBg: '#02162e',
      border: '#06b6d4',
      accent: '#38bdf8',
      titleColor: '#38bdf8',
      clientBoxBg: '#08284d',
      clientBoxBorder: '#0284c7',
      clientTextColor: '#f0f9ff',
      smsCountColor: '#38bdf8',
      rateColor: '#bae6fd',
      totalColor: '#06b6d4',
      stampColor: '#67e8f9',
      panelBadgeBg: '#0b396e',
      panelBadgeText: '#bae6fd',
      panelBadgeBorder: '#0284c7',
    },
    uiCardClasses: {
      card: 'bg-[#02162e] border-2 border-cyan-500 shadow-xl text-cyan-50',
      headerIcon: 'text-cyan-400',
      brandText: 'text-cyan-300 font-black',
      dateText: 'text-sky-300/80',
      clientBox: 'bg-[#08284d] border border-cyan-500/60 shadow-inner',
      clientText: 'text-white font-black',
      smsNumber: 'text-cyan-300',
      totalAmount: 'text-cyan-400 font-black',
      panelBadge: 'bg-[#0b396e] text-cyan-200 border-cyan-700',
      primaryButton: 'bg-gradient-to-r from-cyan-600 to-blue-700 text-white font-bold',
      actionButton: 'bg-[#08284d] border-cyan-800 text-cyan-200',
      stampText: '❖ GLOBAL TELECOM GATEWAY • VALIDATED',
    },
    stamp: '❖ GLOBAL TELECOM GATEWAY • VALIDATED',
  },

  // 9. Sunset Amber Corporate
  {
    id: 'sunset_amber',
    number: 9,
    name: 'Sunset Amber Corporate',
    tagline: 'Warm Espresso Slate, Sunset Gold & Tangerine Glow',
    badgeIcon: '☼',
    isDark: true,
    colors: {
      bg: '#1c1917',
      cardBg: '#1c1917',
      border: '#f59e0b',
      accent: '#ea580c',
      titleColor: '#fbbf24',
      clientBoxBg: '#292524',
      clientBoxBorder: '#d97706',
      clientTextColor: '#fffbeb',
      smsCountColor: '#fbbf24',
      rateColor: '#fed7aa',
      totalColor: '#f59e0b',
      stampColor: '#fcd34d',
      panelBadgeBg: '#44403c',
      panelBadgeText: '#fde68a',
      panelBadgeBorder: '#b45309',
    },
    uiCardClasses: {
      card: 'bg-[#1c1917] border-2 border-amber-500 shadow-lg text-amber-50',
      headerIcon: 'text-amber-400',
      brandText: 'text-amber-300 font-black',
      dateText: 'text-amber-200/70',
      clientBox: 'bg-[#292524] border border-amber-500/60 shadow-inner',
      clientText: 'text-amber-50 font-black',
      smsNumber: 'text-amber-300',
      totalAmount: 'text-amber-400 font-black',
      panelBadge: 'bg-[#44403c] text-amber-200 border-amber-700',
      primaryButton: 'bg-gradient-to-r from-amber-600 to-orange-700 text-white font-bold',
      actionButton: 'bg-[#292524] border-stone-700 text-amber-200',
      stampText: '☼ PREMIER SMS ARCHIVE • SETTLED',
    },
    stamp: '☼ PREMIER SMS ARCHIVE • SETTLED',
  },

  // 10. Obsidian Monolith Cyber
  {
    id: 'obsidian_monolith',
    number: 10,
    name: 'Obsidian Cyber Monolith',
    tagline: 'Pure Jet Black, Chrome Silver & Electric Lime Accent',
    badgeIcon: '▣',
    isDark: true,
    colors: {
      bg: '#09090b',
      cardBg: '#09090b',
      border: '#84cc16',
      accent: '#a3e635',
      titleColor: '#a3e635',
      clientBoxBg: '#18181b',
      clientBoxBorder: '#3f3f46',
      clientTextColor: '#fafafa',
      smsCountColor: '#a3e635',
      rateColor: '#a1a1aa',
      totalColor: '#bef264',
      stampColor: '#65a30d',
      panelBadgeBg: '#27272a',
      panelBadgeText: '#bef264',
      panelBadgeBorder: '#4d7c0f',
    },
    uiCardClasses: {
      card: 'bg-[#09090b] border-2 border-lime-500 shadow-xl text-zinc-100',
      headerIcon: 'text-lime-400',
      brandText: 'text-lime-400 font-mono font-black',
      dateText: 'text-zinc-400 font-mono',
      clientBox: 'bg-[#18181b] border border-zinc-700 shadow-inner',
      clientText: 'text-white font-mono font-black',
      smsNumber: 'text-lime-400 font-mono',
      totalAmount: 'text-lime-300 font-mono font-black',
      panelBadge: 'bg-zinc-800 text-lime-300 border-lime-700 font-mono',
      primaryButton: 'bg-gradient-to-r from-lime-600 to-emerald-700 text-black font-mono font-black',
      actionButton: 'bg-[#18181b] border-zinc-700 text-zinc-300',
      stampText: '▣ SECURE PROTOCOL TRANSACTION • SIGNED',
    },
    stamp: '▣ SECURE PROTOCOL TRANSACTION • SIGNED',
  },
];

export function getSlipTemplate(id: SlipTemplateId): SlipTemplateConfig {
  return SLIP_TEMPLATES.find((t) => t.id === id) || SLIP_TEMPLATES[0];
}

export interface SlipFontOption {
  family: import('../types').SlipFontFamily;
  label: string;
  category: string;
  cssStyle?: string;
  previewText: string;
}

export const SLIP_FONTS: SlipFontOption[] = [
  {
    family: 'Plus Jakarta Sans',
    label: 'Jakarta Modern (Default)',
    category: 'Corporate Sans',
    previewText: 'KBMAX SLIP 123',
  },
  {
    family: 'Cinzel',
    label: 'Cinzel Royal VIP',
    category: 'Imperial Luxury',
    previewText: 'ROYAL CROWN VIP',
  },
  {
    family: 'Playfair Display',
    label: 'Playfair Editorial',
    category: 'Heritage Classic',
    previewText: 'Heritage Ledger 99',
  },
  {
    family: 'JetBrains Mono',
    label: 'JetBrains Cyber Mono',
    category: 'Tech Code / Monospace',
    previewText: 'SMS_COUNT: 24,500',
  },
  {
    family: 'Montserrat',
    label: 'Montserrat Ultra Bold',
    category: 'Punchy Geometric',
    previewText: 'PREMIER BILLING',
  },
  {
    family: 'Outfit',
    label: 'Outfit Neo Clean',
    category: 'Clean Minimalist',
    previewText: 'Clean Telecom Slip',
  },
  {
    family: 'Rajdhani',
    label: 'Rajdhani Cyber Matrix',
    category: 'Sci-Fi Futuristic',
    previewText: 'MATRIX PROTOCOL 01',
  },
  {
    family: 'Oswald',
    label: 'Oswald Condensed Impact',
    category: 'High Impact Tall',
    previewText: 'TOTAL SMS REPORT',
  },
  {
    family: 'Great Vibes',
    label: 'Great Vibes Luxury Script',
    category: 'Calligraphic Script',
    previewText: 'Executive VIP Slip',
  },
  {
    family: 'Noto Nastaliq Urdu',
    label: 'Nastaliq Calligraphy',
    category: 'Urdu Nastaliq',
    previewText: 'Weekly Report Slip',
  },
];

export const DEFAULT_SLIP_CUSTOM_CONFIG: import('../types').SlipCustomConfig = {
  headerTitle: 'KBMAX WEEKLY REPORTS',
  subHeader: '',
  customNote: '',
  stampText: '',
  fontFamily: 'Plus Jakarta Sans',
  fontSizeScale: 'normal',
  showDateLine: true,
  showIdBadge: true,
  showStamp: true,
  overrideColors: false,
  customBgColor: '#ffffff',
  customBorderColor: '#002a4e',
  customAccentColor: '#c89d3c',
  customTextColor: '#0f172a',
  enableTriToneBorder: true,
  topBorderColor: '#002a4e', // Deep Navy Header
  centerBorderColor: '#c89d3c', // 24K Gold Body
  bottomBorderColor: '#002a4e', // Deep Navy Base
  innerFrameColor: '#c89d3c',
  dividerLineColor: '#c89d3c',
  clientBoxBorderColor: '#c89d3c',
  clientBoxBgColor: 'rgba(200, 157, 60, 0.08)',
  headerTitleColor: '#002a4e',
  subHeaderColor: '#64748b',
  clientNameColor: '#002a4e',
  panelsColor: '#475569',
  smsCountColor: '#0369a1',
  rateColor: '#64748b',
  totalAmountColor: '#047857',
  customNoteColor: '#c89d3c',
  stampColor: '#c89d3c',
  grandTotalBorderColor: '#c89d3c',
  grandTotalBgColor: '#f8fafc',
};

