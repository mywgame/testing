/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ethers } from 'ethers';

/**
 * Format raw token BigInt atomic units into standardized 8-decimal string
 * @param rawBigInt The raw token value (wei/atomic units)
 * @param decimals Token decimals (e.g., 18 for BSC BEP20 custom USDT, 6 for standard TRC20/Polygon USDT)
 */
export function formatTokenAmount(rawBigInt: bigint, decimals: number = 18): string {
  if (rawBigInt <= 0n) return '0.00000000';

  const divisor = BigInt(10 ** decimals);
  const integerPart = rawBigInt / divisor;
  const remainderPart = rawBigInt % divisor;

  if (remainderPart === 0n) {
    return `${integerPart.toString()}.00000000`;
  }

  let remainderStr = remainderPart.toString().padStart(decimals, '0');
  if (decimals > 8) {
    remainderStr = remainderStr.slice(0, 8);
  } else if (decimals < 8) {
    remainderStr = remainderStr.padEnd(8, '0');
  }

  return `${integerPart.toString()}.${remainderStr}`;
}

/**
 * Normalizes input raw amount (hex, BigInt raw string, or float string) into standard 8-decimal string
 */
export function normalizeAmount(rawAmount: string | number, decimals: number = 18): string {
  if (rawAmount === undefined || rawAmount === null || rawAmount === '') {
    return '0.00000000';
  }

  const strAmount = String(rawAmount).trim();

  // If hex string (e.g. 0x8ac7230489e80000)
  if (strAmount.startsWith('0x') || strAmount.startsWith('0X')) {
    try {
      return formatTokenAmount(BigInt(strAmount), decimals);
    } catch (_) {
      return '0.00000000';
    }
  }

  // If integer string without decimal point or exponent notation
  if (!strAmount.includes('.') && !strAmount.includes('e') && !strAmount.includes('E')) {
    try {
      const rawBigInt = BigInt(strAmount);
      // If it looks like raw atomic units (greater than 0.01 tokens in atomic units)
      const threshold = BigInt(10 ** Math.max(0, decimals - 2));
      if (rawBigInt > threshold) {
        return formatTokenAmount(rawBigInt, decimals);
      }
    } catch (_) {
      // Fallthrough to parseFloat if BigInt conversion fails
    }
  }

  const parsed = parseFloat(strAmount);
  if (isNaN(parsed) || parsed <= 0) return '0.00000000';
  return parsed.toFixed(8);
}

/**
 * Converts human readable amount string (e.g., "100.5") into BigInt atomic units
 */
export function denormalizeAmount(humanAmount: string | number, decimals: number = 18): bigint {
  if (!humanAmount) return 0n;
  try {
    const cleanAmount = String(humanAmount).trim();
    return ethers.parseUnits(cleanAmount, decimals);
  } catch {
    return 0n;
  }
}
