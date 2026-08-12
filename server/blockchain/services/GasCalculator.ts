/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ethers } from 'ethers';
import { rpcManager } from '../rpc/RpcManager.ts';
import { logger } from '../../utils/logger.ts';

export interface GasRequirement {
  network: string;
  minRequiredGas: string;
  upperSafetyLimit: string;
  gasSymbol: string;
  estimatedCostUnit: string;
  calculationMethod: string;
}

export interface GasTopUpResult {
  network: string;
  currentBalance: string;
  requiredMinGas: string;
  upperSafetyLimit: string;
  topUpNeeded: string;
  gasSymbol: string;
  isSufficient: boolean;
}

// Configurable network gas safety limits and defaults
export const NETWORK_GAS_CONFIG: Record<
  string,
  {
    symbol: string;
    upperSafetyLimit: string;
    fallbackMinGas: string;
    gasLimitUnits: number; // e.g. 60000 gas for BEP20 transfer
  }
> = {
  USDT_BEP20: {
    symbol: 'BNB',
    upperSafetyLimit: '0.001', // Max safety limit as instructed
    fallbackMinGas: '0.00025',  // Default min cost at standard gas prices (~3 Gwei * 60k gas + buffer)
    gasLimitUnits: 60000,
  },
  USDT_POLYGON: {
    symbol: 'POL',
    upperSafetyLimit: '0.05',  // Max safety limit for Polygon
    fallbackMinGas: '0.003',   // Default min cost at standard gas prices (~35 Gwei * 65k gas + buffer)
    gasLimitUnits: 65000,
  },
  USDT_TRC20: {
    symbol: 'TRX',
    upperSafetyLimit: '30.0',   // Upper safety limit for TRC20 transfer
    fallbackMinGas: '28.0',    // Covers 65,000 Energy (27.3 TRX @ 420 SUN) + 0.35 TRX Bandwidth
    gasLimitUnits: 65000,
  },
};

export class GasCalculator {
  /**
   * Get exact minimum gas requirements for a network dynamically
   */
  public async getMinGasRequirement(network: string): Promise<GasRequirement> {
    const config = NETWORK_GAS_CONFIG[network] || {
      symbol: 'GAS',
      upperSafetyLimit: '0.01',
      fallbackMinGas: '0.001',
      gasLimitUnits: 65000,
    };

    if (network === 'USDT_BEP20' || network === 'USDT_POLYGON') {
      try {
        const gasPriceWei = await rpcManager.executeRpc(network, async (rpcUrl) => {
          const provider = rpcManager.getProvider(network, rpcUrl);
          const feeData = await provider.getFeeData();
          return feeData.gasPrice || ethers.parseUnits('3', 'gwei');
        });

        // Calculate: gasLimit * gasPrice
        const totalCostWei = gasPriceWei * BigInt(config.gasLimitUnits);
        // Add 25% safety buffer for network fee fluctuations
        const bufferedCostWei = (totalCostWei * 125n) / 100n;
        const calculatedEth = ethers.formatEther(bufferedCostWei);

        // Ensure calculated cost is clamped between floor and upper safety limit
        const upperLimitEth = parseFloat(config.upperSafetyLimit);
        const floorEth = parseFloat(config.fallbackMinGas);
        let finalMinGas = Math.max(floorEth, parseFloat(calculatedEth));
        finalMinGas = Math.min(upperLimitEth, finalMinGas);

        return {
          network,
          minRequiredGas: finalMinGas.toFixed(8),
          upperSafetyLimit: config.upperSafetyLimit,
          gasSymbol: config.symbol,
          estimatedCostUnit: `${ethers.formatUnits(gasPriceWei, 'gwei')} Gwei`,
          calculationMethod: `Dynamic GasPrice (${config.gasLimitUnits} gas units + 25% safety buffer)`,
        };
      } catch (err: any) {
        logger.warn(`[GasCalculator] Failed to fetch live gas price for ${network}: ${err.message}. Using fallback.`);
        return {
          network,
          minRequiredGas: config.fallbackMinGas,
          upperSafetyLimit: config.upperSafetyLimit,
          gasSymbol: config.symbol,
          estimatedCostUnit: 'Fallback Static Rate',
          calculationMethod: 'Static Network Fallback',
        };
      }
    } else if (network === 'USDT_TRC20') {
      // TRON TRC20 transfer energy & bandwidth calculation:
      // - 65,000 Energy @ 420 SUN = 27.3 TRX
      // - 345 Bandwidth bytes @ 1,000 SUN = 0.345 TRX
      // Total = ~27.65 TRX -> rounded to safe 28.0 TRX (or 14.0 TRX if destination already holds USDT)
      return {
        network,
        minRequiredGas: '28.00000000',
        upperSafetyLimit: '30.00000000',
        gasSymbol: 'TRX',
        estimatedCostUnit: '65,000 Energy @ 420 SUN + 345 Bandwidth bytes',
        calculationMethod: 'TRON Protocol Energy/Bandwidth Model',
      };
    }

    return {
      network,
      minRequiredGas: config.fallbackMinGas,
      upperSafetyLimit: config.upperSafetyLimit,
      gasSymbol: config.symbol,
      estimatedCostUnit: 'Standard Default',
      calculationMethod: 'Default Network Profile',
    };
  }

  /**
   * Calculate top-up amount needed given current deposit address balance.
   * Ensures wallet is NEVER overfunded!
   */
  public async calculateTopUpNeeded(network: string, currentBalanceStr: string): Promise<GasTopUpResult> {
    const requirement = await this.getMinGasRequirement(network);
    const currentBal = parseFloat(currentBalanceStr || '0');
    const minRequired = parseFloat(requirement.minRequiredGas);
    const upperLimit = parseFloat(requirement.upperSafetyLimit);

    if (currentBal >= minRequired) {
      return {
        network,
        currentBalance: currentBal.toFixed(8),
        requiredMinGas: minRequired.toFixed(8),
        upperSafetyLimit: requirement.upperSafetyLimit,
        topUpNeeded: '0.00000000',
        gasSymbol: requirement.gasSymbol,
        isSufficient: true,
      };
    }

    // Top up ONLY the difference needed to reach minRequired, capped at upperSafetyLimit
    let needed = minRequired - currentBal;
    needed = Math.max(0, needed);
    needed = Math.min(upperLimit, needed);

    return {
      network,
      currentBalance: currentBal.toFixed(8),
      requiredMinGas: minRequired.toFixed(8),
      upperSafetyLimit: requirement.upperSafetyLimit,
      topUpNeeded: needed.toFixed(8),
      gasSymbol: requirement.gasSymbol,
      isSufficient: false,
    };
  }
}

export const gasCalculator = new GasCalculator();
