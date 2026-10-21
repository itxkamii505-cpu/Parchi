import { ClientRecord, Panel, SlipCustomConfig } from '../types';
import { getSlipTemplate, SlipTemplateId, DEFAULT_SLIP_CUSTOM_CONFIG } from './slipTemplates';
import { naturalSortClients } from './sort';
import { calculateAmount, formatAmount } from './math';

export interface ParchiRenderOptions {
  client: ClientRecord;
  rate: number;
  currency: string;
  batchName?: string;
  startDate?: string;
  endDate?: string;
  showRate?: boolean;
  panelsList?: Panel[];
  templateId?: SlipTemplateId;
  clientIndex?: number;
  customConfig?: SlipCustomConfig;
}

/* =========================================================================
   LOGO RENDERERS FOR THE 10 DISTINCT TEMPLATES
   ========================================================================= */

// 1. Executive Insignia (Precision Corporate Luxury Emblem)
function drawExecutiveInsignia(ctx: CanvasRenderingContext2D, cx: number, cy: number, size: number, color: string) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = 1.6;

  const r = size * 0.46;

  // Outer precision faceted diamond frame
  ctx.beginPath();
  ctx.moveTo(0, -r);
  ctx.lineTo(r, 0);
  ctx.lineTo(0, r);
  ctx.lineTo(-r, 0);
  ctx.closePath();
  ctx.stroke();

  // Inner concentric diamond
  ctx.beginPath();
  const innerR = r * 0.68;
  ctx.moveTo(0, -innerR);
  ctx.lineTo(innerR, 0);
  ctx.lineTo(0, innerR);
  ctx.lineTo(-innerR, 0);
  ctx.closePath();
  ctx.stroke();

  // Solid Center Core Diamond
  const coreR = r * 0.32;
  ctx.beginPath();
  ctx.moveTo(0, -coreR);
  ctx.lineTo(coreR, 0);
  ctx.lineTo(0, coreR);
  ctx.lineTo(-coreR, 0);
  ctx.closePath();
  ctx.fill();

  // Refined horizontal precision balance lines
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(-r - 8, 0);
  ctx.lineTo(-r - 1.5, 0);
  ctx.moveTo(r + 1.5, 0);
  ctx.lineTo(r + 8, 0);
  ctx.stroke();

  // Micro pin accents
  ctx.beginPath();
  ctx.arc(-r - 9, 0, 1.2, 0, Math.PI * 2);
  ctx.arc(r + 9, 0, 1.2, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

// 2. Cyber Shield
function drawCyberShield(ctx: CanvasRenderingContext2D, cx: number, cy: number, size: number, color: string) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.fillStyle = 'rgba(16, 185, 129, 0.15)';

  const w = size * 0.8;
  const h = size;

  ctx.beginPath();
  ctx.moveTo(0, -h / 2);
  ctx.lineTo(w / 2, -h / 3);
  ctx.lineTo(w / 2, h / 6);
  ctx.lineTo(0, h / 2);
  ctx.lineTo(-w / 2, h / 6);
  ctx.lineTo(-w / 2, -h / 3);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Core Diamond Node
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(0, -h / 6);
  ctx.lineTo(w / 4, 0);
  ctx.lineTo(0, h / 6);
  ctx.lineTo(-w / 4, 0);
  ctx.closePath();
  ctx.fill();

  ctx.restore();
}

// 3. Apex Diamond (Carbon)
function drawApexDiamond(ctx: CanvasRenderingContext2D, cx: number, cy: number, size: number, color: string) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.fillStyle = color;
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.5;

  const w = size * 0.9;
  const h = size * 0.7;

  ctx.beginPath();
  ctx.moveTo(-w / 2, -h / 4);
  ctx.lineTo(-w / 4, -h / 2);
  ctx.lineTo(w / 4, -h / 2);
  ctx.lineTo(w / 2, -h / 4);
  ctx.lineTo(0, h / 2);
  ctx.closePath();
  ctx.stroke();

  // Facet lines
  ctx.beginPath();
  ctx.moveTo(-w / 2, -h / 4);
  ctx.lineTo(w / 2, -h / 4);
  ctx.lineTo(0, h / 2);
  ctx.lineTo(-w / 4, -h / 2);
  ctx.lineTo(0, h / 2);
  ctx.lineTo(w / 4, -h / 2);
  ctx.stroke();

  ctx.restore();
}

// 4. Swiss Precision Cross
function drawSwissCross(ctx: CanvasRenderingContext2D, cx: number, cy: number, size: number, color: string) {
  ctx.save();
  ctx.translate(cx, cy);

  // Outer circle
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(0, 0, size * 0.5, 0, Math.PI * 2);
  ctx.stroke();

  // Swiss Cross
  ctx.fillStyle = color;
  const arm = size * 0.22;
  const thick = size * 0.12;
  ctx.fillRect(-arm, -thick / 2, arm * 2, thick);
  ctx.fillRect(-thick / 2, -arm, thick, arm * 2);

  ctx.restore();
}

// 5. Vintage Heritage Star
function drawVintageStar(ctx: CanvasRenderingContext2D, cx: number, cy: number, size: number, color: string) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.fillStyle = color;

  const spikes = 8;
  const outerRadius = size * 0.5;
  const innerRadius = size * 0.22;
  let rot = (Math.PI / 2) * 3;
  let x = 0;
  let y = 0;
  const step = Math.PI / spikes;

  ctx.beginPath();
  ctx.moveTo(0, -outerRadius);
  for (let i = 0; i < spikes; i++) {
    x = Math.cos(rot) * outerRadius;
    y = Math.sin(rot) * outerRadius;
    ctx.lineTo(x, y);
    rot += step;

    x = Math.cos(rot) * innerRadius;
    y = Math.sin(rot) * innerRadius;
    ctx.lineTo(x, y);
    rot += step;
  }
  ctx.lineTo(0, -outerRadius);
  ctx.closePath();
  ctx.fill();

  ctx.restore();
}

// 6. Rose Starburst
function drawRoseStarburst(ctx: CanvasRenderingContext2D, cx: number, cy: number, size: number, color: string) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.fillStyle = color;
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.2;

  // 4 Main Rays
  const r = size * 0.55;
  ctx.beginPath();
  ctx.moveTo(0, -r);
  ctx.quadraticCurveTo(0, 0, r, 0);
  ctx.quadraticCurveTo(0, 0, 0, r);
  ctx.quadraticCurveTo(0, 0, -r, 0);
  ctx.quadraticCurveTo(0, 0, 0, -r);
  ctx.fill();

  // 4 Diagonal Accent Dots
  const diag = r * 0.45;
  ctx.fillStyle = '#ffffff';
  [-1, 1].forEach((dx) => {
    [-1, 1].forEach((dy) => {
      ctx.beginPath();
      ctx.arc(dx * diag, dy * diag, 1.8, 0, Math.PI * 2);
      ctx.fill();
    });
  });

  ctx.restore();
}

// 7. Crimson Dynasty Seal
function drawDynastySeal(ctx: CanvasRenderingContext2D, cx: number, cy: number, size: number, color: string) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.fillStyle = color;

  // Scalloped wax seal edge
  const r = size * 0.5;
  ctx.beginPath();
  for (let i = 0; i < 16; i++) {
    const angle = (i * Math.PI) / 8;
    const dist = i % 2 === 0 ? r : r * 0.88;
    const px = Math.cos(angle) * dist;
    const py = Math.sin(angle) * dist;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fill();

  // Gold Inner Ring
  ctx.strokeStyle = '#eab308';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(0, 0, r * 0.7, 0, Math.PI * 2);
  ctx.stroke();

  // Central Emblem Icon (Sleek Geometric Diamond)
  ctx.fillStyle = '#eab308';
  ctx.font = 'bold 11px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('◆', 0, 0);

  ctx.restore();
}

// 8. Oceanic Orbit Emblem
function drawOceanicOrbit(ctx: CanvasRenderingContext2D, cx: number, cy: number, size: number, color: string) {
  ctx.save();
  ctx.translate(cx, cy);

  // Central Orb
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(0, 0, size * 0.22, 0, Math.PI * 2);
  ctx.fill();

  // Elliptical Orbit Rings
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.ellipse(0, 0, size * 0.5, size * 0.2, Math.PI / 4, 0, Math.PI * 2);
  ctx.stroke();

  ctx.beginPath();
  ctx.ellipse(0, 0, size * 0.5, size * 0.2, -Math.PI / 4, 0, Math.PI * 2);
  ctx.stroke();

  ctx.restore();
}

// 9. Sunrise Solar Crest
function drawSunriseEmblem(ctx: CanvasRenderingContext2D, cx: number, cy: number, size: number, color: string) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.fillStyle = color;
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.5;

  // Half Sun
  const r = size * 0.35;
  ctx.beginPath();
  ctx.arc(0, r * 0.4, r, Math.PI, 0, false);
  ctx.fill();

  // Sun Rays
  for (let i = 0; i < 7; i++) {
    const angle = Math.PI + (i * Math.PI) / 6;
    const x1 = Math.cos(angle) * (r + 2);
    const y1 = Math.sin(angle) * (r + 2) + r * 0.4;
    const x2 = Math.cos(angle) * (r + 8);
    const y2 = Math.sin(angle) * (r + 8) + r * 0.4;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  }

  // Horizon base line
  ctx.fillRect(-size * 0.5, r * 0.4 + 1, size, 2);

  ctx.restore();
}

// 10. Monolith Cyber Hex
function drawMonolithHex(ctx: CanvasRenderingContext2D, cx: number, cy: number, size: number, color: string) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;

  // Hexagon
  const r = size * 0.5;
  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    const angle = (i * Math.PI) / 3;
    const px = Math.cos(angle) * r;
    const py = Math.sin(angle) * r;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.stroke();

  // Inner Monolith Square
  ctx.fillStyle = color;
  const sq = size * 0.22;
  ctx.fillRect(-sq / 2, -sq / 2, sq, sq);

  ctx.restore();
}

// Dispatcher for Template Logo
function drawTemplateLogo(
  ctx: CanvasRenderingContext2D,
  templateId: SlipTemplateId,
  cx: number,
  cy: number,
  size: number,
  color: string
) {
  switch (templateId) {
    case 'cyber_emerald':
      drawCyberShield(ctx, cx, cy, size, color);
      break;
    case 'carbon_stealth':
      drawApexDiamond(ctx, cx, cy, size, color);
      break;
    case 'swiss_precision':
      drawSwissCross(ctx, cx, cy, size, color);
      break;
    case 'vintage_parchment':
      drawVintageStar(ctx, cx, cy, size, color);
      break;
    case 'midnight_amethyst':
      drawRoseStarburst(ctx, cx, cy, size, color);
      break;
    case 'crimson_dynasty':
      drawDynastySeal(ctx, cx, cy, size, color);
      break;
    case 'oceanic_sapphire':
      drawOceanicOrbit(ctx, cx, cy, size, color);
      break;
    case 'sunset_amber':
      drawSunriseEmblem(ctx, cx, cy, size, color);
      break;
    case 'obsidian_monolith':
      drawMonolithHex(ctx, cx, cy, size, color);
      break;
    case 'royal_crown':
    default:
      drawExecutiveInsignia(ctx, cx, cy, size, color);
      break;
  }
}

/* =========================================================================
   MAIN SINGLE PARCHI CARD RENDERER (Supports all 10 Templates)
   ========================================================================= */

export function drawSingleParchiCard(
  ctx: CanvasRenderingContext2D,
  options: ParchiRenderOptions,
  x: number,
  y: number,
  cardWidth: number,
  cardHeight: number
) {
  const {
    client,
    rate,
    currency,
    startDate = '',
    endDate = '',
    showRate = true,
    panelsList = [],
    templateId = 'royal_crown',
    clientIndex = 1,
    customConfig,
  } = options;

  const t = getSlipTemplate(templateId);
  const total = calculateAmount(client.sms, rate).toFixed(2);

  // Determine active font family and scaling
  const fontFamily = customConfig?.fontFamily || 'Plus Jakarta Sans';
  const scaleMultiplier =
    customConfig?.fontSizeScale === 'large' ? 1.1 : customConfig?.fontSizeScale === 'compact' ? 0.92 : 1;

  // Colors (with optional custom override, 3-tone border combination & A to Z line color controls)
  const isCustomColor = customConfig?.overrideColors;
  const useTriTone = customConfig?.enableTriToneBorder ?? true;
  const topBorder = customConfig?.topBorderColor || (isCustomColor && customConfig?.customBorderColor ? customConfig.customBorderColor : t.colors.border);
  const centerBorder = customConfig?.centerBorderColor || (isCustomColor && customConfig?.customAccentColor ? customConfig.customAccentColor : t.colors.accent);
  const bottomBorder = customConfig?.bottomBorderColor || (isCustomColor && customConfig?.customBorderColor ? customConfig.customBorderColor : t.colors.border);

  const innerFrameBorder = customConfig?.innerFrameColor || centerBorder;
  const dividerLine = customConfig?.dividerLineColor || centerBorder;
  const clientBoxBorder = customConfig?.clientBoxBorderColor || centerBorder;
  const clientBoxBg = customConfig?.clientBoxBgColor || (isCustomColor && customConfig?.customBgColor ? 'rgba(0,0,0,0.08)' : t.colors.clientBoxBg);

  const cardBg = customConfig?.customBgColor || (isCustomColor && customConfig?.customBgColor ? customConfig.customBgColor : t.colors.cardBg);
  const accentColor = centerBorder;
  const titleColor = customConfig?.headerTitleColor || (isCustomColor && customConfig?.customTextColor ? customConfig.customTextColor : t.colors.titleColor);
  const subHeaderColor = customConfig?.subHeaderColor || (t.isDark ? '#94a3b8' : '#64748b');
  const clientNameColor = customConfig?.clientNameColor || (isCustomColor && customConfig?.customTextColor ? customConfig.customTextColor : t.colors.clientTextColor);
  const panelsColor = customConfig?.panelsColor || (t.isDark ? '#cbd5e1' : '#475569');
  const smsCountColor = customConfig?.smsCountColor || t.colors.smsCountColor;
  const rateColor = customConfig?.rateColor || t.colors.rateColor;
  const totalAmountColor = customConfig?.totalAmountColor || t.colors.totalColor;
  const customNoteColor = customConfig?.customNoteColor || accentColor;
  const stampColor = customConfig?.stampColor || t.colors.stampColor;

  // 1. Outer Card Background
  ctx.fillStyle = cardBg;
  ctx.fillRect(x, y, cardWidth, cardHeight);

  // 2. Borders: 3-Color Combination (Top, Center, Bottom)
  const triGrad = ctx.createLinearGradient(x, y, x, y + cardHeight);
  triGrad.addColorStop(0, topBorder);
  triGrad.addColorStop(0.32, topBorder);
  triGrad.addColorStop(0.48, centerBorder);
  triGrad.addColorStop(0.68, centerBorder);
  triGrad.addColorStop(0.85, bottomBorder);
  triGrad.addColorStop(1, bottomBorder);

  ctx.strokeStyle = triGrad;
  ctx.lineWidth = 2.5;
  ctx.strokeRect(x, y, cardWidth, cardHeight);

  // Top Section Accent Bar
  ctx.fillStyle = topBorder;
  ctx.fillRect(x, y, cardWidth, 3.5);

  // Bottom Section Accent Bar
  ctx.fillStyle = bottomBorder;
  ctx.fillRect(x, y + cardHeight - 3.5, cardWidth, 3.5);

  if (templateId === 'royal_crown' || templateId === 'crimson_dynasty') {
    // Elegant Inner Frame
    ctx.strokeStyle = innerFrameBorder;
    ctx.lineWidth = 1;
    ctx.strokeRect(x + 5, y + 5, cardWidth - 10, cardHeight - 10);

    // 4 Corner Brackets
    const cSize = 9;
    ctx.fillStyle = innerFrameBorder;
    ctx.fillRect(x + 5, y + 5, cSize, 2);
    ctx.fillRect(x + 5, y + 5, 2, cSize);
    ctx.fillRect(x + cardWidth - 5 - cSize, y + 5, cSize, 2);
    ctx.fillRect(x + cardWidth - 7, y + 5, 2, cSize);
    ctx.fillRect(x + 5, y + cardHeight - 7, cSize, 2);
    ctx.fillRect(x + 5, y + cardHeight - 5 - cSize, 2, cSize);
    ctx.fillRect(x + cardWidth - 5 - cSize, y + cardHeight - 7, cSize, 2);
    ctx.fillRect(x + cardWidth - 7, y + cardHeight - 5 - cSize, 2, cSize);
  } else if (templateId === 'cyber_emerald' || templateId === 'obsidian_monolith') {
    // Tech Glowing Inner Edge
    ctx.strokeStyle = innerFrameBorder;
    ctx.lineWidth = 0.8;
    ctx.strokeRect(x + 4, y + 4, cardWidth - 8, cardHeight - 8);
  } else if (templateId === 'vintage_parchment') {
    // Double Antique Border
    ctx.strokeStyle = innerFrameBorder;
    ctx.lineWidth = 1;
    ctx.strokeRect(x + 6, y + 6, cardWidth - 12, cardHeight - 12);
  }

  // 3. Template Custom Logo & Header Brand
  drawTemplateLogo(ctx, templateId, x + cardWidth / 2, y + 26, 28, centerBorder);

  const headerTitle = customConfig?.headerTitle?.trim() || 'KBMAX WEEKLY REPORTS';
  ctx.fillStyle = titleColor;
  ctx.font = `800 ${Math.round(15 * scaleMultiplier)}px "${fontFamily}", sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.fillText(headerTitle, x + cardWidth / 2, y + 46);

  // Date Range and Account ID / Pin metadata line
  const showDate = customConfig ? customConfig.showDateLine !== false : true;
  const showId = customConfig ? customConfig.showIdBadge !== false : true;

  if (showDate || showId) {
    const rawDate = startDate && endDate ? `${startDate} to ${endDate}` : (startDate || endDate || 'Weekly Report');
    const customSub = customConfig?.subHeader?.trim();
    const datePart = customSub ? customSub : rawDate;
    const idPart = showId ? `ID: KB-${String(clientIndex).padStart(3, '0')}` : '';
    const combinedMeta = [showDate ? `DATE: ${datePart}` : '', idPart].filter(Boolean).join(' • ');

    ctx.font = `600 ${Math.round(11.5 * scaleMultiplier)}px "${fontFamily}", sans-serif`;
    ctx.fillStyle = subHeaderColor;
    ctx.fillText(combinedMeta, x + cardWidth / 2, y + 68);
  }

  // Decorative Horizontal Divider
  ctx.strokeStyle = dividerLine;
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(x + 32, y + 88);
  ctx.lineTo(x + cardWidth - 32, y + 88);
  ctx.stroke();

  // 4. Executive Client Name Box (Center Section)
  const clientBoxY = y + 98;
  const clientBoxHeight = 52;
  const clientBoxMargin = 26;
  const clientBoxWidth = cardWidth - clientBoxMargin * 2;

  ctx.fillStyle = clientBoxBg;
  ctx.fillRect(x + clientBoxMargin, clientBoxY, clientBoxWidth, clientBoxHeight);

  ctx.strokeStyle = clientBoxBorder;
  ctx.lineWidth = 1.5;
  ctx.strokeRect(x + clientBoxMargin, clientBoxY, clientBoxWidth, clientBoxHeight);

  ctx.fillStyle = clientNameColor;
  ctx.font = `800 ${Math.round(20 * scaleMultiplier)}px "${fontFamily}", sans-serif`;
  ctx.textBaseline = 'middle';
  ctx.fillText(client.name, x + cardWidth / 2, clientBoxY + clientBoxHeight / 2);

  // 5. Active Panels Breakdown (if any)
  let currentY = clientBoxY + clientBoxHeight + 20;
  ctx.textBaseline = 'alphabetic';

  const clientPanels = client.panels || {};
  const activePanels: string[] = [];
  panelsList.forEach((p) => {
    const count = clientPanels[p.id];
    if (count !== undefined && count > 0) {
      activePanels.push(`${p.name}: ${count}`);
    }
  });

  if (activePanels.length > 0) {
    ctx.font = `700 ${Math.round(13 * scaleMultiplier)}px "${fontFamily}", sans-serif`;
    ctx.fillStyle = panelsColor;
    ctx.fillText(`Panels: ${activePanels.join('  •  ')}`, x + cardWidth / 2, currentY);
    currentY += 24;
  }

  // 6. Total SMS Count (prominently labeled SMS)
  ctx.font = `800 ${Math.round(18 * scaleMultiplier)}px "${fontFamily}", sans-serif`;
  ctx.fillStyle = smsCountColor;
  ctx.fillText(`Total SMS: ${client.sms.toLocaleString()} SMS`, x + cardWidth / 2, currentY);
  currentY += 26;

  // 7. Rate & Total Amount
  if (showRate) {
    ctx.font = `600 ${Math.round(14 * scaleMultiplier)}px "${fontFamily}", sans-serif`;
    ctx.fillStyle = rateColor;
    ctx.fillText(`Rate: ${rate} ${currency} / SMS`, x + cardWidth / 2, currentY);
    currentY += 25;
  }

  // Total Amount Highlight (Always preserved even when rate is hidden)
  ctx.font = `900 ${Math.round(22 * scaleMultiplier)}px "${fontFamily}", sans-serif`;
  ctx.fillStyle = totalAmountColor;
  ctx.fillText(`Total Amount: ${total} ${currency}`, x + cardWidth / 2, currentY);
  currentY += 20;

  // 8. Custom Note / Remarks Strip (if user entered remarks)
  if (customConfig?.customNote?.trim()) {
    ctx.font = `600 ${Math.round(11 * scaleMultiplier)}px "${fontFamily}", sans-serif`;
    ctx.fillStyle = customNoteColor;
    ctx.fillText(`* ${customConfig.customNote.trim()}`, x + cardWidth / 2, currentY + 4);
  }

  // 9. Authentic Template Verification Stamp at Bottom
  const showStamp = customConfig ? customConfig.showStamp !== false : true;
  if (showStamp) {
    const stampText = customConfig?.stampText?.trim() || t.stamp;
    ctx.font = `600 ${Math.round(10.5 * scaleMultiplier)}px "${fontFamily}", sans-serif`;
    ctx.fillStyle = stampColor;
    ctx.textBaseline = 'middle';
    ctx.fillText(stampText, x + cardWidth / 2, cardHeight + y - 18);
  }
}

/* =========================================================================
   HIGH-RES DATA URL & DOWNLOAD WRAPPERS
   ========================================================================= */

export function createParchiDataUrl(options: ParchiRenderOptions): string {
  const canvas = document.createElement('canvas');
  const scale = 3; // Ultra High-DPI (Crisp 1680px HD)
  const width = 560;

  const hasPanels = options.client.panels && Object.values(options.client.panels).some((v) => v > 0);
  const hasNote = Boolean(options.customConfig?.customNote?.trim());
  let height = 350;
  if (hasPanels) height += 28;
  if (hasNote) height += 24;
  if (!options.showRate) height -= 25;

  canvas.width = width * scale;
  canvas.height = height * scale;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  ctx.scale(scale, scale);

  const t = getSlipTemplate(options.templateId || 'royal_crown');
  const isCustom = options.customConfig?.overrideColors;
  ctx.fillStyle = isCustom && options.customConfig?.customBgColor ? options.customConfig.customBgColor : t.colors.bg;
  ctx.fillRect(0, 0, width, height);

  drawSingleParchiCard(ctx, options, 14, 12, width - 28, height - 24);

  return canvas.toDataURL('image/png');
}

export function createParchiSheetDataUrl(
  clientsSlice: ClientRecord[],
  rate: number,
  currency: string = 'PKR',
  pageTitle?: string,
  startDate?: string,
  endDate?: string,
  showRate: boolean = true,
  panelsList: Panel[] = [],
  templateId: SlipTemplateId = 'royal_crown',
  customConfig?: SlipCustomConfig
): string {
  const canvas = document.createElement('canvas');
  const scale = 2;
  const cardWidth = 532;
  const hasPanels = clientsSlice.some((c) => c.panels && Object.values(c.panels).some((v) => v > 0));
  const hasNote = Boolean(customConfig?.customNote?.trim());
  const cardHeight = (showRate ? 320 : 295) + (hasPanels ? 28 : 0) + (hasNote ? 24 : 0);
  const padding = 20;
  const gap = 18;
  const headerHeight = 70;

  const totalWidth = cardWidth + padding * 2;
  const totalHeight =
    headerHeight + padding * 2 + clientsSlice.length * cardHeight + (clientsSlice.length - 1) * gap;

  canvas.width = totalWidth * scale;
  canvas.height = totalHeight * scale;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  ctx.scale(scale, scale);

  const t = getSlipTemplate(templateId);
  const isCustom = customConfig?.overrideColors;

  // Background matching template
  ctx.fillStyle = isCustom && customConfig?.customBgColor ? customConfig.customBgColor : (t.isDark ? '#0b0f17' : '#f8fafc');
  ctx.fillRect(0, 0, totalWidth, totalHeight);

  let currentY = padding;

  const accent = isCustom && customConfig?.customAccentColor ? customConfig.customAccentColor : t.colors.accent;
  // Global Sheet Header with Template Logo
  drawTemplateLogo(ctx, templateId, totalWidth / 2, currentY + 18, 28, accent);

  const title = customConfig?.headerTitle?.trim() || 'KBMAX WEEKLY REPORTS';
  const fontFamily = customConfig?.fontFamily || 'Plus Jakarta Sans';
  ctx.font = `900 17px "${fontFamily}", sans-serif`;
  ctx.fillStyle = t.isDark ? '#ffffff' : (isCustom && customConfig?.customTextColor ? customConfig.customTextColor : t.colors.titleColor);
  ctx.textAlign = 'center';
  ctx.fillText(title, totalWidth / 2, currentY + 40);

  ctx.font = `700 12px "${fontFamily}", sans-serif`;
  ctx.fillStyle = t.isDark ? '#94a3b8' : '#64748b';
  const sub = `${pageTitle || t.name} | Date: ${startDate || ''} to ${endDate || ''}`;
  ctx.fillText(sub, totalWidth / 2, currentY + 58);

  currentY += headerHeight;
  ctx.textAlign = 'left';

  clientsSlice.forEach((client, idx) => {
    drawSingleParchiCard(
      ctx,
      {
        client,
        rate,
        currency,
        startDate,
        endDate,
        showRate,
        panelsList,
        templateId,
        clientIndex: idx + 1,
        customConfig,
      },
      padding,
      currentY,
      cardWidth,
      cardHeight
    );
    currentY += cardHeight + gap;
  });

  return canvas.toDataURL('image/png');
}

export function downloadParchiImage(options: ParchiRenderOptions) {
  const dataUrl = createParchiDataUrl(options);
  const link = document.createElement('a');
  const dateTag = options.startDate ? `_${options.startDate}` : '';
  const templateTag = options.templateId ? `_${options.templateId}` : '';
  link.download = `KBMAX_Slip_${options.client.name}${templateTag}${dateTag}.png`;
  link.href = dataUrl;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function downloadParchiSheet(
  clientsSlice: ClientRecord[],
  pageNumber: number,
  rate: number,
  currency: string = 'PKR',
  batchName: string = 'KBMAX Weekly Reports',
  startDate?: string,
  endDate?: string,
  showRate: boolean = true,
  panelsList: Panel[] = [],
  templateId: SlipTemplateId = 'royal_crown',
  customConfig?: SlipCustomConfig
) {
  const title = `Page ${pageNumber} of ${batchName}`;
  const dataUrl = createParchiSheetDataUrl(
    clientsSlice,
    rate,
    currency,
    title,
    startDate,
    endDate,
    showRate,
    panelsList,
    templateId,
    customConfig
  );
  const link = document.createElement('a');
  link.download = `KBMAX_Weekly_Part_${pageNumber}_${templateId}.png`;
  link.href = dataUrl;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/* =========================================================================
   COMBINED SLIP GENERATION (Multi-Account in 1 High-Res Picture Slip)
   Renders multiple client accounts into a single ledger slip with grand total
   ========================================================================= */

export interface CombinedParchiRenderOptions {
  clients: ClientRecord[];
  rate: number;
  currency?: string;
  batchName?: string;
  startDate?: string;
  endDate?: string;
  showRate?: boolean;
  panelsList?: Panel[];
  templateId?: SlipTemplateId;
  customConfig?: SlipCustomConfig;
  scale?: number;
}

export function createCombinedParchiDataUrl(options: CombinedParchiRenderOptions): string {
  const {
    clients,
    rate,
    currency = 'PKR',
    batchName = 'KBMAX Weekly Reports',
    startDate = '',
    endDate = '',
    showRate = true,
    panelsList = [],
    templateId = 'royal_crown',
    customConfig,
  } = options;

  if (!clients || clients.length === 0) return '';

  const canvas = document.createElement('canvas');
  // Adaptive scale to prevent mobile canvas limit crash and memory freeze on 20-30+ accounts:
  // For 1-6 accounts: scale 2.0 (crisp high-DPI)
  // For 7-15 accounts: scale 1.6
  // For 16-35+ accounts: scale 1.25 (canvas height remains under 3500px, fast and light)
  const defaultScale =
    clients.length > 20 ? 1.25 : clients.length > 10 ? 1.5 : 2.0;
  const scale = options.scale || defaultScale;
  const cardWidth = 640;
  const padding = 20;
  const t = getSlipTemplate(templateId);

  const isCustomColor = customConfig?.overrideColors;
  const useTriTone = customConfig?.enableTriToneBorder ?? true;
  const topBorder = customConfig?.topBorderColor || (isCustomColor && customConfig?.customBorderColor ? customConfig.customBorderColor : t.colors.border);
  const centerBorder = customConfig?.centerBorderColor || (isCustomColor && customConfig?.customAccentColor ? customConfig.customAccentColor : t.colors.accent);
  const bottomBorder = customConfig?.bottomBorderColor || (isCustomColor && customConfig?.customBorderColor ? customConfig.customBorderColor : t.colors.border);

  const innerFrameBorder = customConfig?.innerFrameColor || centerBorder;
  const dividerLine = customConfig?.dividerLineColor || centerBorder;
  const clientBoxBorder = customConfig?.clientBoxBorderColor || centerBorder;
  const clientBoxBg = customConfig?.clientBoxBgColor || (isCustomColor && customConfig?.customBgColor ? 'rgba(0,0,0,0.06)' : t.colors.clientBoxBg);

  const cardBg = customConfig?.customBgColor || (isCustomColor && customConfig?.customBgColor ? customConfig.customBgColor : t.colors.bg);
  const titleColor = customConfig?.headerTitleColor || (isCustomColor && customConfig?.customTextColor ? customConfig.customTextColor : t.colors.titleColor);
  const subHeaderColor = customConfig?.subHeaderColor || centerBorder;
  const clientNameColor = customConfig?.clientNameColor || (isCustomColor && customConfig?.customTextColor ? customConfig.customTextColor : t.colors.clientTextColor);
  const panelsColor = customConfig?.panelsColor || (t.isDark ? '#94a3b8' : '#64748b');
  const smsCountColor = customConfig?.smsCountColor || t.colors.smsCountColor;
  const rateColor = customConfig?.rateColor || t.colors.rateColor;
  const totalAmountColor = customConfig?.totalAmountColor || t.colors.totalColor;
  const stampColor = customConfig?.stampColor || t.colors.stampColor;
  const grandTotalBorder = customConfig?.grandTotalBorderColor || centerBorder;
  const grandTotalBg = customConfig?.grandTotalBgColor || (t.isDark ? '#0f172a' : '#f1f5f9');
  const accentColor = centerBorder;
  const fontFamily = customConfig?.fontFamily || 'Plus Jakarta Sans';
  const scaleMultiplier =
    customConfig?.fontSizeScale === 'large' ? 1.1 : customConfig?.fontSizeScale === 'compact' ? 0.92 : 1;

  // Calculate dynamic dimensions
  const headerHeight = 96;
  const tableHeaderHeight = 34;
  const grandTotalHeight = showRate ? 104 : 84;
  const clientItemGap = 12;

  // Sort clients naturally A-to-Z so accounts appear grouped and ordered
  const sortedClients = naturalSortClients(clients);

  // Calculate client heights based on whether panels are present
  const clientHeights = sortedClients.map((c) => {
    const hasPanels = c.panels && Object.values(c.panels).some((v) => v > 0);
    return hasPanels ? 88 : 68;
  });

  const totalClientsHeight = clientHeights.reduce((a, b) => a + b, 0) + (sortedClients.length - 1) * clientItemGap;
  const topPadding = 24;
  const headerBottomGap = 12;
  const tableHeaderBottomGap = 10;
  const grandTotalTopGap = 16;
  const footerTopGap = 18;
  const footerHeight = 44;
  const bottomBorderMargin = 20;

  const totalHeight =
    topPadding +
    headerHeight +
    headerBottomGap +
    tableHeaderHeight +
    tableHeaderBottomGap +
    totalClientsHeight +
    grandTotalTopGap +
    grandTotalHeight +
    footerTopGap +
    footerHeight +
    bottomBorderMargin;

  canvas.width = cardWidth * scale;
  canvas.height = totalHeight * scale;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  ctx.scale(scale, scale);

  // 1. Background Fill
  ctx.fillStyle = cardBg;
  ctx.fillRect(0, 0, cardWidth, totalHeight);

  // 2. Outer Border Frame
  const borderGrad = ctx.createLinearGradient(0, 0, 0, totalHeight);
  borderGrad.addColorStop(0, topBorder);
  borderGrad.addColorStop(0.5, centerBorder);
  borderGrad.addColorStop(1, bottomBorder);

  ctx.strokeStyle = borderGrad;
  ctx.lineWidth = 3;
  ctx.strokeRect(6, 6, cardWidth - 12, totalHeight - 12);

  // Subtle Inner Frame
  ctx.strokeStyle = innerFrameBorder;
  ctx.lineWidth = 1;
  ctx.strokeRect(10, 10, cardWidth - 20, totalHeight - 20);

  let currentY = topPadding;

  // 3. Header Section (Company & Report Title)
  drawTemplateLogo(ctx, templateId, cardWidth / 2, currentY + 16, 28, centerBorder);

  const headerTitle = customConfig?.headerTitle?.trim() || batchName || 'KBMAX WEEKLY REPORTS';
  ctx.fillStyle = titleColor;
  ctx.font = `900 ${Math.round(16 * scaleMultiplier)}px "${fontFamily}", sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  ctx.fillText(headerTitle.toUpperCase(), cardWidth / 2, currentY + 36);

  // Report Statement Subtitle
  ctx.fillStyle = subHeaderColor;
  ctx.font = `800 ${Math.round(11.5 * scaleMultiplier)}px "${fontFamily}", sans-serif`;
  const periodText = startDate && endDate ? `${startDate} to ${endDate}` : startDate || endDate || new Date().toLocaleDateString();
  ctx.fillText(`◆ STATEMENT OF ACCOUNTS (COMBINED REPORT • ${sortedClients.length} CLIENTS) ◆`, cardWidth / 2, currentY + 54);

  // Period & Rate Metadata Bar
  ctx.font = `700 ${Math.round(10.5 * scaleMultiplier)}px "${fontFamily}", sans-serif`;
  const rateText = showRate ? `  |  RATE: ${rate} ${currency}/SMS` : '';
  ctx.fillText(`PERIOD: ${periodText}${rateText}`, cardWidth / 2, currentY + 70);

  // Divider
  ctx.strokeStyle = dividerLine;
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(28, currentY + 82);
  ctx.lineTo(cardWidth - 28, currentY + 82);
  ctx.stroke();

  currentY += headerHeight + headerBottomGap;

  // 4. Report Table Header (Column Headers)
  const tableX = padding + 6;
  const tableWidth = cardWidth - (padding + 6) * 2;

  ctx.fillStyle = clientBoxBg;
  ctx.fillRect(tableX, currentY, tableWidth, tableHeaderHeight);

  ctx.strokeStyle = clientBoxBorder;
  ctx.lineWidth = 1;
  ctx.strokeRect(tableX, currentY, tableWidth, tableHeaderHeight);

  ctx.textBaseline = 'middle';
  ctx.font = `800 ${Math.round(10.5 * scaleMultiplier)}px "${fontFamily}", sans-serif`;
  ctx.fillStyle = accentColor;

  // # Column
  ctx.textAlign = 'left';
  ctx.fillText('#', tableX + 14, currentY + tableHeaderHeight / 2);

  // Client Name Column
  ctx.fillText('ACCOUNT / CLIENT NAME', tableX + 44, currentY + tableHeaderHeight / 2);

  // SMS Column
  ctx.textAlign = 'right';
  ctx.fillText('TOTAL SMS', tableX + tableWidth - 140, currentY + tableHeaderHeight / 2);

  // Amount Column
  ctx.fillText(`AMOUNT (${currency})`, tableX + tableWidth - 16, currentY + tableHeaderHeight / 2);

  currentY += tableHeaderHeight + tableHeaderBottomGap;

  // 5. Individual Client Ledger Rows
  let totalCombinedSms = 0;

  sortedClients.forEach((client, idx) => {
    const itemHeight = clientHeights[idx];
    const clientBoxX = padding + 6;
    const clientBoxWidth = cardWidth - (padding + 6) * 2;

    totalCombinedSms += client.sms;

    // Client Row Background
    ctx.fillStyle = clientBoxBg;
    ctx.fillRect(clientBoxX, currentY, clientBoxWidth, itemHeight);

    ctx.strokeStyle = clientBoxBorder;
    ctx.lineWidth = 1;
    ctx.strokeRect(clientBoxX, currentY, clientBoxWidth, itemHeight);

    ctx.textBaseline = 'top';

    // Account Number indicator (#01, #02...)
    ctx.textAlign = 'left';
    ctx.fillStyle = accentColor;
    ctx.font = `800 ${Math.round(12 * scaleMultiplier)}px "${fontFamily}", sans-serif`;
    ctx.fillText(`#0${idx + 1}`, clientBoxX + 12, currentY + 14);

    // Client Name
    ctx.fillStyle = clientNameColor;
    ctx.font = `800 ${Math.round(16 * scaleMultiplier)}px "${fontFamily}", sans-serif`;
    ctx.fillText(client.name, clientBoxX + 44, currentY + 12);

    // SMS Count (Right aligned, NO 'Units'!)
    ctx.textAlign = 'right';
    ctx.fillStyle = smsCountColor;
    ctx.font = `800 ${Math.round(15 * scaleMultiplier)}px "${fontFamily}", sans-serif`;
    ctx.fillText(`${client.sms.toLocaleString()} SMS`, clientBoxX + clientBoxWidth - 140, currentY + 13);

    // Amount (Right aligned)
    const clientAmount = calculateAmount(client.sms, rate).toFixed(2);
    ctx.fillStyle = totalAmountColor;
    ctx.font = `800 ${Math.round(15 * scaleMultiplier)}px "${fontFamily}", sans-serif`;
    ctx.fillText(`${clientAmount} ${currency}`, clientBoxX + clientBoxWidth - 16, currentY + 13);

    // Panels Breakdown or Sub-line (if present)
    const clientPanels = client.panels || {};
    const activePanels: string[] = [];
    panelsList.forEach((p) => {
      const count = clientPanels[p.id];
      if (count !== undefined && count > 0) {
        activePanels.push(`${p.name}: ${count}`);
      }
    });

    if (activePanels.length > 0) {
      ctx.textAlign = 'left';
      ctx.fillStyle = panelsColor;
      ctx.font = `700 ${Math.round(10.5 * scaleMultiplier)}px "${fontFamily}", sans-serif`;
      ctx.fillText(`Panels: ${activePanels.join('  •  ')}`, clientBoxX + 44, currentY + 38);
    } else if (showRate) {
      // Show rate breakdown
      ctx.textAlign = 'left';
      ctx.fillStyle = rateColor;
      ctx.font = `600 ${Math.round(10 * scaleMultiplier)}px "${fontFamily}", sans-serif`;
      ctx.fillText(`@ ${rate} ${currency} / SMS`, clientBoxX + 44, currentY + 38);
    }

    if (idx < sortedClients.length - 1) {
      currentY += itemHeight + clientItemGap;
    } else {
      currentY += itemHeight;
    }
  });

  currentY += grandTotalTopGap;

  // 6. GRAND TOTAL / STATEMENT SUMMARY SECTION
  const grandBoxX = padding + 6;
  const grandBoxWidth = cardWidth - (padding + 6) * 2;
  const totalCombinedAmount = calculateAmount(totalCombinedSms, rate);

  ctx.fillStyle = grandTotalBg;
  ctx.fillRect(grandBoxX, currentY, grandBoxWidth, grandTotalHeight);

  ctx.strokeStyle = grandTotalBorder;
  ctx.lineWidth = 2;
  ctx.strokeRect(grandBoxX, currentY, grandBoxWidth, grandTotalHeight);

  // Grand Total Banner Header
  ctx.fillStyle = grandTotalBorder;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.font = `900 ${Math.round(12.5 * scaleMultiplier)}px "${fontFamily}", sans-serif`;
  ctx.fillText(
    `★ STATEMENT GRAND TOTAL (${sortedClients.length} ACCOUNTS) ★`,
    cardWidth / 2,
    currentY + 12
  );

  // Combined SMS
  ctx.textAlign = 'left';
  ctx.fillStyle = smsCountColor;
  ctx.font = `800 ${Math.round(15.5 * scaleMultiplier)}px "${fontFamily}", sans-serif`;
  ctx.fillText(`Total SMS: ${totalCombinedSms.toLocaleString()} SMS`, grandBoxX + 20, currentY + (showRate ? 40 : 46));

  if (showRate) {
    ctx.textAlign = 'left';
    ctx.fillStyle = rateColor;
    ctx.font = `700 ${Math.round(12.5 * scaleMultiplier)}px "${fontFamily}", sans-serif`;
    ctx.fillText(`Billing Rate: ${rate} ${currency} / SMS`, grandBoxX + 20, currentY + 66);
  }

  // Net Total Amount
  ctx.textAlign = 'right';
  ctx.fillStyle = totalAmountColor;
  ctx.font = `900 ${Math.round(20 * scaleMultiplier)}px "${fontFamily}", sans-serif`;
  const formattedGrandTotal = totalCombinedAmount.toFixed(2);
  ctx.fillText(`NET TOTAL: ${formattedGrandTotal} ${currency}`, grandBoxX + grandBoxWidth - 20, currentY + (showRate ? 50 : 46));

  currentY += grandTotalHeight + footerTopGap;

  // 7. Footer Stamp & Authentication Note (Crisp, perfectly centered with spacious clearance)
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const stampText = customConfig?.stampText?.trim() || t.stamp || 'OFFICIALLY VERIFIED COMBINED REPORT';
  ctx.fillStyle = stampColor;
  ctx.font = `700 ${Math.round(11 * scaleMultiplier)}px "${fontFamily}", sans-serif`;
  ctx.fillText(`★ ${stampText} ★`, cardWidth / 2, currentY + Math.round(footerHeight / 2));

  return canvas.toDataURL('image/png');
}

export function downloadCombinedParchiImage(options: CombinedParchiRenderOptions) {
  const downloadScale = options.clients.length > 20 ? 1.8 : 2.2;
  const dataUrl = createCombinedParchiDataUrl({ ...options, scale: downloadScale });
  if (!dataUrl) return;

  const namesTag = options.clients
    .map((c) => c.name.replace(/[^a-zA-Z0-9]/g, '_'))
    .join('_and_')
    .substring(0, 36);

  const link = document.createElement('a');
  link.download = `KBMAX_Combined_Report_${namesTag}.png`;
  link.href = dataUrl;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

