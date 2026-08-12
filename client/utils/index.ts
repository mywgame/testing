/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Format raw high-precision string values into local currency formats
 */
/**
 * Clean helper to format amounts in notification strings to 2 decimal places.
 * e.g., "500.00000000 USDT" -> "500.00 USDT", "0.60000000 USDT" -> "0.60 USDT"
 */
export * from './sound.ts';

export function formatNotificationText(text: string): string {

  return text.replace(/(\$)?(\d+(?:\.\d+)?)\s*(USDT|usdt|USD|usd)?/g, (match, prefix, numStr, suffix) => {
    const hasDecimal = numStr.includes('.');
    if (!prefix && !suffix && (!hasDecimal || numStr.split('.')[1].length < 3)) {
      return match;
    }
    const num = parseFloat(numStr);
    if (isNaN(num)) return match;

    const formatted = num.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
      useGrouping: false,
    });

    const p = prefix || '';
    const s = suffix ? ` ${suffix.toUpperCase()}` : '';
    return `${p}${formatted}${s}`;
  });
}


/**
 * Clean helper to truncate transaction hashes or wallet keys
 */
export function truncateKey(key: string, startChars = 6, endChars = 4): string {
  if (!key || key.length <= startChars + endChars) return key;
  return `${key.substring(0, startChars)}...${key.substring(key.length - endChars)}`;
}

/**
 * Calculate dates helper (standard FinTech interval support)
 */
export function getRelativeDays(dateInput: Date | string): string {
  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return `${diffDays} days ago`;
}
