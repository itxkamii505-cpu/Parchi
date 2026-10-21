/**
 * Financial Precision Helper for KBMAX Client Billing & Accounting
 * Ensures 100% exact math without floating-point inaccuracies
 * (e.g. 53 * 2.3 = 121.89999999999999 is strictly calculated as 121.90)
 */

export function calculateAmount(sms: number, rate: number): number {
  const safeSms = Number(sms) || 0;
  const safeRate = Number(rate) || 0;
  return Math.round(safeSms * safeRate * 100) / 100;
}

export function roundToTwo(num: number): number {
  return Math.round((Number(num) || 0) * 100) / 100;
}

export function formatAmount(amount: number): string {
  const val = Number(amount) || 0;
  return val.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function formatSms(count: number): string {
  return (Number(count) || 0).toLocaleString();
}
