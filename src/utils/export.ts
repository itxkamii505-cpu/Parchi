import * as XLSX from 'xlsx';
import { ClientRecord, LanguageMode, Panel } from '../types';
import { naturalSortClients } from './sort';
import { calculateAmount, formatAmount } from './math';

export function exportToExcel(
  clients: ClientRecord[],
  rate: number,
  currency: string = 'PKR',
  batchName: string = 'KBMAX Weekly Reports',
  startDate: string = '',
  endDate: string = '',
  panels: Panel[] = [],
  showRate: boolean = true
) {
  const sortedClients = naturalSortClients(clients);
  const dateStr = startDate && endDate ? `${startDate} to ${endDate}` : startDate || endDate || 'Weekly';

  const rows = sortedClients.map((c, index) => {
    const rowObj: Record<string, any> = {
      '# No': index + 1,
      'Date Range': dateStr,
      'Client / User Name': c.name,
    };

    // Add each panel column
    panels.forEach((p) => {
      rowObj[`${p.name} SMS`] = (c.panels && c.panels[p.id]) || 0;
    });

    rowObj['Total SMS'] = c.sms;

    if (showRate) {
      rowObj[`Rate (${currency})`] = rate;
    }
    rowObj[`Total (${currency})`] = calculateAmount(c.sms, rate);

    return rowObj;
  });

  // Total summary row at bottom
  const totalSms = sortedClients.reduce((sum, c) => sum + c.sms, 0);
  const totalRow: Record<string, any> = {
    '# No': 'TOTAL',
    'Date Range': dateStr,
    'Client / User Name': `${sortedClients.length} Clients`,
  };

  panels.forEach((p) => {
    const pTotal = sortedClients.reduce((sum, c) => sum + ((c.panels && c.panels[p.id]) || 0), 0);
    totalRow[`${p.name} SMS`] = pTotal;
  });

  totalRow['Total SMS'] = totalSms;

  if (showRate) {
    totalRow[`Rate (${currency})`] = rate;
  }
  totalRow[`Total (${currency})`] = calculateAmount(totalSms, rate);

  rows.push(totalRow);

  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'KBMAX Weekly Report');

  const cleanName = batchName.replace(/[^a-zA-Z0-9_-]/g, '_');
  XLSX.writeFile(workbook, `${cleanName}_${dateStr.replace(/[^a-zA-Z0-9_-]/g, '-')}.xlsx`);
}

export function exportToCSV(
  clients: ClientRecord[],
  rate: number,
  currency: string = 'PKR',
  batchName: string = 'KBMAX Weekly Reports',
  startDate: string = '',
  endDate: string = '',
  panels: Panel[] = [],
  showRate: boolean = true
) {
  const sortedClients = naturalSortClients(clients);
  const dateStr = startDate && endDate ? `${startDate} to ${endDate}` : startDate || endDate || 'Weekly';

  const headers = ['# No', 'Date Range', 'Client / User Name'];
  panels.forEach((p) => headers.push(`${p.name} SMS`));
  headers.push('Total SMS');
  if (showRate) {
    headers.push(`Rate (${currency})`);
  }
  headers.push(`Total (${currency})`);

  const csvRows = [headers.join(',')];

  sortedClients.forEach((c, index) => {
    const row = [index + 1, `"${dateStr}"`, `"${c.name}"`];
    panels.forEach((p) => {
      row.push(((c.panels && c.panels[p.id]) || 0).toString());
    });
    row.push(c.sms.toString());
    if (showRate) {
      row.push(rate.toString());
    }
    row.push(calculateAmount(c.sms, rate).toFixed(2));
    csvRows.push(row.join(','));
  });

  // Summary Row
  const totalSms = sortedClients.reduce((sum, c) => sum + c.sms, 0);
  const totalRow = ['TOTAL', `"${dateStr}"`, `"${sortedClients.length} Clients"`];
  panels.forEach((p) => {
    const pTotal = sortedClients.reduce((sum, c) => sum + ((c.panels && c.panels[p.id]) || 0), 0);
    totalRow.push(pTotal.toString());
  });
  totalRow.push(totalSms.toString());
  if (showRate) {
    totalRow.push(rate.toString());
  }
  totalRow.push(calculateAmount(totalSms, rate).toFixed(2));
  csvRows.push(totalRow.join(','));

  const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  const cleanName = batchName.replace(/[^a-zA-Z0-9_-]/g, '_');
  link.setAttribute('download', `${cleanName}_${dateStr.replace(/[^a-zA-Z0-9_-]/g, '-')}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function generateParchiText(
  client: ClientRecord,
  rate: number,
  currency: string = 'PKR',
  mode: LanguageMode = 'english',
  startDate?: string,
  endDate?: string,
  showRate: boolean = true,
  panelsList: Panel[] = []
): string {
  const amount = calculateAmount(client.sms, rate);
  const dateStr = startDate && endDate ? `${startDate} to ${endDate}` : startDate || endDate || '';

  // Check if panel details exist
  let panelsDetails = '';
  if (client.panels && panelsList.length > 0) {
    const activePanels: string[] = [];
    panelsList.forEach((p) => {
      const val = client.panels?.[p.id];
      if (val !== undefined && val > 0) {
        activePanels.push(`• ${p.name}: ${val.toLocaleString()} SMS`);
      }
    });
    if (activePanels.length > 0) {
      panelsDetails = `\n${activePanels.join('\n')}`;
    }
  }

  let out = `*KBMAX Weekly Report*\n`;
  out += `Client: *${client.name}*\n`;
  if (dateStr) out += `Period: ${dateStr}\n`;
  if (panelsDetails) out += `Panels Breakdown:${panelsDetails}\n`;
  out += `Total SMS: *${client.sms.toLocaleString()} SMS*\n`;
  if (showRate) {
    out += `Rate: ${rate} ${currency}\n`;
  }
  out += `Total Amount: *${amount.toFixed(2)} ${currency}*\n`;
  out += `Thank you!`;
  return out;
}

export function generateWhatsAppText(
  clients: ClientRecord[],
  rate: number,
  currency: string = 'PKR',
  language?: LanguageMode,
  batchName: string = 'KBMAX Weekly Reports',
  startDate: string = '',
  endDate: string = '',
  panels: Panel[] = [],
  showRate: boolean = true
): string {
  const sortedClients = naturalSortClients(clients);
  const totalSms = sortedClients.reduce((sum, c) => sum + c.sms, 0);
  const totalAmount = calculateAmount(totalSms, rate);
  const dateStr = startDate && endDate ? `${startDate} to ${endDate}` : startDate || endDate || '';

  let out = `*${batchName}*\n`;
  if (dateStr) {
    out += `Period: ${dateStr}\n`;
  }
  out += `━━━━━━━━━━━━━━━━━━━━━\n`;

  sortedClients.forEach((c, i) => {
    let panelText = '';
    if (c.panels && panels.length > 0) {
      const parts: string[] = [];
      panels.forEach((p) => {
        const v = c.panels?.[p.id];
        if (v) parts.push(`${p.name}: ${v}`);
      });
      if (parts.length > 0) panelText = ` (${parts.join(', ')})`;
    }

    const rowAmt = calculateAmount(c.sms, rate).toFixed(2);
    if (showRate) {
      out += `${i + 1}. ${c.name}${panelText} -> ${c.sms} SMS @ ${rate} ${currency} = ${rowAmt} ${currency}\n`;
    } else {
      out += `${i + 1}. ${c.name}${panelText} -> ${c.sms} SMS = ${rowAmt} ${currency}\n`;
    }
  });

  out += `━━━━━━━━━━━━━━━━━━━━━\n`;
  out += `Total Clients: ${sortedClients.length}\n`;
  out += `Total SMS: ${totalSms.toLocaleString()} SMS\n`;
  if (showRate) {
    out += `Rate: ${rate} ${currency}\n`;
  }
  out += `Grand Total: *${totalAmount.toFixed(2)} ${currency}*\n`;
  return out;
}

export function generateCombinedParchiText(
  clients: ClientRecord[],
  rate: number,
  currency: string = 'PKR',
  startDate?: string,
  endDate?: string,
  showRate: boolean = true,
  panelsList: Panel[] = []
): string {
  const sortedClients = naturalSortClients(clients);
  const totalSms = sortedClients.reduce((sum, c) => sum + c.sms, 0);
  const totalAmount = calculateAmount(totalSms, rate);
  const dateText = startDate && endDate ? `${startDate} to ${endDate}` : startDate || endDate || '';

  let res = `*KBMAX Weekly Reports - Combined Billing Slip*\n`;
  if (dateText) res += `Date: ${dateText}\n`;
  res += `Combined Accounts: ${sortedClients.length}\n`;
  res += `━━━━━━━━━━━━━━━━━━━━━\n`;

  sortedClients.forEach((c, idx) => {
    res += `#0${idx + 1} *${c.name}*\n`;
    if (c.panels && panelsList.length > 0) {
      const activePanels: string[] = [];
      panelsList.forEach((p) => {
        const val = c.panels?.[p.id];
        if (val !== undefined && val > 0) {
          activePanels.push(`${p.name}: ${val.toLocaleString()}`);
        }
      });
      if (activePanels.length > 0) {
        res += `   Panels: ${activePanels.join(' | ')}\n`;
      }
    }
    const clientAmt = calculateAmount(c.sms, rate).toFixed(2);
    res += `   SMS: ${c.sms.toLocaleString()} = ${clientAmt} ${currency}\n`;
  });

  res += `━━━━━━━━━━━━━━━━━━━━━\n`;
  res += `★ *COMBINED GRAND TOTAL*\n`;
  res += `Total SMS: *${totalSms.toLocaleString()} SMS*\n`;
  if (showRate) {
    res += `Rate: ${rate} ${currency} / SMS\n`;
  }
  res += `Grand Total: *${totalAmount.toFixed(2)} ${currency}*`;
  return res.trim();
}

export function openWhatsApp(text: string) {
  const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
  window.open(url, '_blank', 'noopener,noreferrer');
}

export const generateFullReportText = generateWhatsAppText;
