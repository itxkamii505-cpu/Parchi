import { ClientRecord } from '../types';

export function parseRawTextToClients(text: string): {
  clients: ClientRecord[];
  detectedRate: number | null;
} {
  const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  const clients: ClientRecord[] = [];
  let detectedRate: number | null = null;

  // Check for rate mention in standard billing formats (e.g., "Rate: 2.3", "Rate = 2.5", "@ 2.3")
  const rateMatch = text.match(/(?:rate|price|unit\s*rate|cost|@)\s*[:=-]?\s*([0-9]+(?:\.[0-9]+)?)/i);
  if (rateMatch && rateMatch[1]) {
    const r = parseFloat(rateMatch[1]);
    if (!isNaN(r) && r > 0 && r < 500) {
      detectedRate = r;
    }
  }

  let counter = 1;

  for (const line of lines) {
    // Skip general header lines or total lines
    if (
      /^(no\b|sr|client|user\s*name|client\s*name|sms|count|quantity|total|subtotal|net\s*total|sum|grand\s*total|rate)/i.test(line) &&
      !line.includes('_')
    ) {
      continue;
    }

    // Standard client list formats:
    // "1. Faith_A_Akrash - 56"
    // "Faith_A_Akrash: 56"
    // "Faith_A_Akrash 56"
    // "Faith_A_Akrash, 56"
    // "Faith_A_Akrash \t 56"

    // Remove leading numbering like "1. ", "1 - ", "#1 "
    let cleanLine = line.replace(/^\s*(?:#?\d+[\.\-\)\s:]+)/, '').trim();

    // Try matching: Client name followed by separator and integer product/sms count at end
    const match = cleanLine.match(/^([A-Za-z0-9_\-\.\s]+?)(?:[\s\t,:\-|=]+)(\d+)(?:\s*(?:sms|msg|messages|units|pcs|rs|pkr|usd)?)?$/i);

    if (match) {
      const rawName = match[1].trim();
      const rawSms = parseInt(match[2], 10);

      // Avoid capturing keywords or summary labels as client names
      if (
        rawName &&
        !/^(total|subtotal|sum|rate|price|average|count|amount)$/i.test(rawName) &&
        !isNaN(rawSms)
      ) {
        clients.push({
          id: `row-${Date.now()}-${counter++}`,
          name: rawName,
          sms: rawSms,
        });
      }
    }
  }

  return { clients, detectedRate };
}
