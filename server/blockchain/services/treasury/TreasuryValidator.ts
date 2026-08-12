/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { normalizeEvmAddress } from '../../utils/blockchainUtils.ts';
import { blockchainConfig } from '../../config/blockchainConfig.ts';
import { logger } from '../../../utils/logger.ts';

export class TreasuryValidator {
  /**
   * Helper to retrieve configured Hot Wallet address environment variable
   */
  async getEnvConfiguredHotAddress(network: string, walletNumber: number): Promise<string | null> {
    const cleanNetwork = network.toUpperCase();
    const netShort = cleanNetwork.replace(/^USDT_/, '');

    let addr =
      process.env[`USDT_${netShort}_HOT${walletNumber}_ADDRESS`] ||
      process.env[`${cleanNetwork}_HOT${walletNumber}_ADDRESS`];

    if (!addr && walletNumber === 1) {
      addr =
        process.env[`USDT_${netShort}_HOT_ADDRESS`] ||
        process.env[`${cleanNetwork}_HOT_ADDRESS`] ||
        process.env['HOT_WALLET_ADDRESS'] ||
        blockchainConfig.networks[cleanNetwork]?.hotAddress;
    }

    return addr ? addr.trim() : null;
  }

  /**
   * Helper to retrieve configured Cold Wallet address environment variable
   */
  async getEnvConfiguredColdAddress(network: string, walletNumber: number): Promise<string | null> {
    const cleanNetwork = network.toUpperCase();
    const netShort = cleanNetwork.replace(/^USDT_/, '');

    let addr =
      process.env[`USDT_${netShort}_COLD${walletNumber}_ADDRESS`] ||
      process.env[`${cleanNetwork}_COLD${walletNumber}_ADDRESS`];

    if (!addr && walletNumber === 1) {
      addr =
        process.env[`USDT_${netShort}_COLD_ADDRESS`] ||
        process.env[`${cleanNetwork}_COLD_ADDRESS`] ||
        process.env['COLD_WALLET_ADDRESS'] ||
        blockchainConfig.networks[cleanNetwork]?.coldAddress;
    }

    return addr ? addr.trim() : null;
  }

  /**
   * Validate wallet address string format
   */
  validateWalletAddress(network: string, address: string): boolean {
    if (!address || typeof address !== 'string') return false;
    const cleanNetwork = network.toUpperCase();
    const trimmed = address.trim();

    if (cleanNetwork === 'USDT_TRC20') {
      return trimmed.startsWith('T') && trimmed.length === 34;
    } else {
      // EVM address validation
      return /^0x[a-fA-F0-9]{40}$/.test(trimmed);
    }
  }
}

export const treasuryValidator = new TreasuryValidator();
