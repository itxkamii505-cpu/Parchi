export interface Panel {
  id: string;
  name: string;
  color?: string;
}

export interface ClientRecord {
  id: string;
  name: string;
  sms: number; // Represents total product quantity / count
  panels?: Record<string, number>; // panelId -> product count
  dateRange?: string;
  lastUpdated?: string;
}

export interface ClientHistoryRecord {
  id: string;
  clientId: string;
  clientName: string;
  sms: number; // SMS count
  rate: number;
  currency: string;
  totalAmount: number;
  dateRange: string;
  panelsBreakdown?: Record<string, number>;
  panelNames?: Record<string, string>;
  downloadedAt: string;
  batchName: string;
  isCombined?: boolean;
  combinedClients?: {
    id: string;
    name: string;
    sms: number;
    amount: number;
    panels?: Record<string, number>;
  }[];
}

export type LanguageMode = 'english' | 'urdu';
export type ThemeMode = 'dark' | 'light';
export type ActiveTab = 'dashboard' | 'table' | 'parchiyan' | 'history' | 'settings';

export interface AppSettings {
  username: string; // User's display name (default 'Admin')
  securityPin: string; // 4-digit PIN required before downloading slips (default '1234')
  adminPassword: string; // Password for app login (default 'admin123')
  defaultRate: number;
  currency: string;
  companyName: string;
  showRateOnSlips: boolean;
  theme: ThemeMode;
}

export interface SummaryStats {
  totalClients: number;
  totalSms: number; // Total products
  totalAmount: number;
  averageSms: number; // Average products per client
  highestClient: ClientRecord | null;
  lowestClient: ClientRecord | null;
  panelTotals: Record<string, number>;
}

export type SlipFontFamily =
  | 'Plus Jakarta Sans'
  | 'Cinzel'
  | 'Playfair Display'
  | 'JetBrains Mono'
  | 'Montserrat'
  | 'Outfit'
  | 'Rajdhani'
  | 'Oswald'
  | 'Great Vibes'
  | 'Noto Nastaliq Urdu';

export interface SlipCustomConfig {
  headerTitle: string;
  subHeader: string;
  customNote: string;
  stampText: string;
  fontFamily: SlipFontFamily;
  fontSizeScale: 'compact' | 'normal' | 'large';
  showDateLine: boolean;
  showIdBadge: boolean;
  showStamp: boolean;
  overrideColors: boolean;
  customBgColor?: string;
  customBorderColor?: string;
  customAccentColor?: string;
  customTextColor?: string;
  // 3-Color Border Combination (Top, Center, Bottom)
  enableTriToneBorder?: boolean;
  topBorderColor?: string;
  centerBorderColor?: string;
  bottomBorderColor?: string;
  // Comprehensive A to Z Line & Element Color Customization
  innerFrameColor?: string;
  dividerLineColor?: string;
  clientBoxBorderColor?: string;
  clientBoxBgColor?: string;
  headerTitleColor?: string;
  subHeaderColor?: string;
  clientNameColor?: string;
  panelsColor?: string;
  smsCountColor?: string;
  rateColor?: string;
  totalAmountColor?: string;
  customNoteColor?: string;
  stampColor?: string;
  grandTotalBorderColor?: string;
  grandTotalBgColor?: string;
}
