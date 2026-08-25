/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { eq, sql, and, desc } from 'drizzle-orm';
import { db } from '../../../src/db/index.ts';
import { treasuryWallets, treasurySweepJobs, depositAddresses, users } from '../../../src/db/schema.ts';
import { activeBlockchainProvider } from '../providers/index.ts';
import { logger } from '../../utils/logger.ts';
import { auditRepository } from '../../repositories/auditRepository.ts';
import { keyManager } from '../keys/KeyManager.ts';
import { hdWalletEngine } from '../hd/HdWalletEngine.ts';
import { normalizeEvmAddress } from '../utils/blockchainUtils.ts';
import { blockchainConfig } from '../config/blockchainConfig.ts';
import { gasCalculator } from './GasCalculator.ts';

import { treasuryValidator } from './treasury/TreasuryValidator.ts';
import { walletSyncService } from './treasury/WalletSyncService.ts';
import { sweepExecutionService } from './treasury/SweepExecutionService.ts';

export interface TreasuryWalletRecord {
  id?: string;
  network: string;
  walletType: 'HOT' | 'COLD';
  walletNumber: number;
  label: string;
  address: string;
  status: 'ACTIVE' | 'DISABLED';
  priority: number;
  balance?: string;
}

export interface TreasuryWalletConfig {
  network: string;
  hotAddress: string;
  coldAddress: string;
  hotBalance: string;
  coldBalance: string;
  autoSweepEnabled: boolean;
  autoSweepThreshold: string;
  sweepMode?: string;
  sweepDelay?: string;
  customDelayMinutes?: number;
  paused?: boolean;
  hotWallets?: TreasuryWalletRecord[];
  coldWallets?: TreasuryWalletRecord[];
}

// Initial registered treasury wallets per network
const INITIAL_TREASURY_WALLETS: Record<
  string,
  { hotWallets: TreasuryWalletRecord[]; coldWallets: TreasuryWalletRecord[] }
> = {
  USDT_BEP20: {
    hotWallets: [
      {
        network: 'USDT_BEP20',
        walletType: 'HOT',
        walletNumber: 1,
        label: 'BSC Hot Wallet 1',
        address: normalizeEvmAddress('0x543fb86e08dd5C4128ca860966Ffb8f9F0E23c3F'),
        status: 'ACTIVE',
        priority: 1,
        balance: '0.00000000',
      },
      {
        network: 'USDT_BEP20',
        walletType: 'HOT',
        walletNumber: 2,
        label: 'BSC Hot Wallet 2',
        address: '',
        status: 'DISABLED',
        priority: 2,
        balance: '0.00000000',
      },
      {
        network: 'USDT_BEP20',
        walletType: 'HOT',
        walletNumber: 3,
        label: 'BSC Hot Wallet 3',
        address: '',
        status: 'DISABLED',
        priority: 3,
        balance: '0.00000000',
      },
    ],
    coldWallets: [
      {
        network: 'USDT_BEP20',
        walletType: 'COLD',
        walletNumber: 1,
        label: 'BSC Cold Wallet 1',
        address: normalizeEvmAddress('0x75DbF92F40aC02Ad6a959211E2fC7aD413A87f8b'),
        status: 'ACTIVE',
        priority: 1,
        balance: '0.00000000',
      },
      {
        network: 'USDT_BEP20',
        walletType: 'COLD',
        walletNumber: 2,
        label: 'BSC Cold Wallet 2',
        address: '',
        status: 'DISABLED',
        priority: 2,
        balance: '0.00000000',
      },
    ],
  },

  USDT_POLYGON: {
    hotWallets: [
      {
        network: 'USDT_POLYGON',
        walletType: 'HOT',
        walletNumber: 1,
        label: 'Polygon Hot Wallet 1',
        address: normalizeEvmAddress('0x79d73418F24804aaddF2AA6423567d814097d884'),
        status: 'ACTIVE',
        priority: 1,
        balance: '0.00000000',
      },
      {
        network: 'USDT_POLYGON',
        walletType: 'HOT',
        walletNumber: 2,
        label: 'Polygon Hot Wallet 2',
        address: '',
        status: 'DISABLED',
        priority: 2,
        balance: '0.00000000',
      },
      {
        network: 'USDT_POLYGON',
        walletType: 'HOT',
        walletNumber: 3,
        label: 'Polygon Hot Wallet 3',
        address: '',
        status: 'DISABLED',
        priority: 3,
        balance: '0.00000000',
      },
    ],
    coldWallets: [
      {
        network: 'USDT_POLYGON',
        walletType: 'COLD',
        walletNumber: 1,
        label: 'Polygon Cold Wallet 1',
        address: normalizeEvmAddress('0x768432E5ab2EBA3fC549F36aed76Fc2c684F2D1d'),
        status: 'ACTIVE',
        priority: 1,
        balance: '0.00000000',
      },
      {
        network: 'USDT_POLYGON',
        walletType: 'COLD',
        walletNumber: 2,
        label: 'Polygon Cold Wallet 2',
        address: '',
        status: 'DISABLED',
        priority: 2,
        balance: '0.00000000',
      },
    ],
  },

  USDT_TRC20: {
    hotWallets: [
      {
        network: 'USDT_TRC20',
        walletType: 'HOT',
        walletNumber: 1,
        label: 'TRON Hot Wallet 1',
        address: 'TUhnNoVtAR4qJwFgzkRSGJPf6sxhXfQCBP',
        status: 'ACTIVE',
        priority: 1,
        balance: '0.00000000',
      },
      {
        network: 'USDT_TRC20',
        walletType: 'HOT',
        walletNumber: 2,
        label: 'TRON Hot Wallet 2',
        address: '',
        status: 'DISABLED',
        priority: 2,
        balance: '0.00000000',
      },
      {
        network: 'USDT_TRC20',
        walletType: 'HOT',
        walletNumber: 3,
        label: 'TRON Hot Wallet 3',
        address: '',
        status: 'DISABLED',
        priority: 3,
        balance: '0.00000000',
      },
    ],
    coldWallets: [
      {
        network: 'USDT_TRC20',
        walletType: 'COLD',
        walletNumber: 1,
        label: 'TRON Cold Wallet 1',
        address: 'TVJg1SG998zcMj8XJx55gRtGmhTFGteLsM',
        status: 'ACTIVE',
        priority: 1,
        balance: '0.00000000',
      },
      {
        network: 'USDT_TRC20',
        walletType: 'COLD',
        walletNumber: 2,
        label: 'TRON Cold Wallet 2',
        address: '',
        status: 'DISABLED',
        priority: 2,
        balance: '0.00000000',
      },
    ],
  },
};

export class TreasuryService {
  private isValidated = false;

  constructor(private readonly provider = activeBlockchainProvider) {}

  /**
   * Helper to retrieve configured Hot Wallet address environment variable
   */
  private async getEnvConfiguredHotAddress(network: string, walletNumber: number): Promise<string | null> {
    return treasuryValidator.getEnvConfiguredHotAddress(network, walletNumber);
  }

  /**
   * Helper to retrieve configured Cold Wallet address environment variable
   */
  private async getEnvConfiguredColdAddress(network: string, walletNumber: number): Promise<string | null> {
    return treasuryValidator.getEnvConfiguredColdAddress(network, walletNumber);
  }

  /**
   * Startup Validation:
   * 1. Reads configured Hot Wallet private keys
   * 2. Derives blockchain address from private key
   * 3. Compares derived address with configured environment address (if set)
   * 4. Syncs wallet records to the database
   */
  public async validateAndSyncTreasuryWallets() {
    if (this.isValidated) {
      return;
    }
    logger.info('[TreasuryService] Commencing multi-wallet Treasury architecture startup validation...');

    // Automatically apply schema migrations if new columns don't exist yet on database
    try {
      await db.execute(sql`
        ALTER TABLE treasury_wallets
        ADD COLUMN IF NOT EXISTS wallet_type TEXT DEFAULT 'HOT',
        ADD COLUMN IF NOT EXISTS wallet_number INTEGER DEFAULT 1,
        ADD COLUMN IF NOT EXISTS label TEXT DEFAULT 'Treasury Wallet',
        ADD COLUMN IF NOT EXISTS address TEXT DEFAULT '',
        ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'ACTIVE',
        ADD COLUMN IF NOT EXISTS priority INTEGER DEFAULT 1,
        ADD COLUMN IF NOT EXISTS balance NUMERIC(20, 8) DEFAULT '0.00000000';
      `);
      await db.execute(sql`
        ALTER TABLE treasury_wallets DROP CONSTRAINT IF EXISTS treasury_wallets_network_unique;
        ALTER TABLE treasury_wallets DROP CONSTRAINT IF EXISTS treasury_wallets_network_key;
      `);
    } catch (dbErr: any) {
      logger.warn(`[TreasuryService] Database schema auto-migration notice: ${dbErr.message}`);
    }

    const networks = Object.keys(INITIAL_TREASURY_WALLETS);

    for (const network of networks) {
      const config = INITIAL_TREASURY_WALLETS[network];
      const isEvm = !network.includes('TRC20');

      // 1. Validate Hot Wallets
      for (const hw of config.hotWallets) {
        let pk = await keyManager.getHotWalletPrivateKey(network, hw.walletNumber);
        if (!pk && hw.walletNumber === 1) {
          pk = blockchainConfig.networks[network]?.hotPrivateKey || null;
        }

        if (pk && pk.trim()) {
          try {
            const derivedAddress = hdWalletEngine.deriveAddressFromPrivateKey(network, pk.trim());
            const envAddr = await this.getEnvConfiguredHotAddress(network, hw.walletNumber);

            if (envAddr) {
              const cleanDerived = isEvm ? normalizeEvmAddress(derivedAddress) : derivedAddress;
              const cleanEnv = isEvm ? normalizeEvmAddress(envAddr) : envAddr;

              if (cleanDerived !== cleanEnv) {
                const errMsg = `[Treasury Startup Validation Failure] ${hw.label} address mismatch for network ${network}! Derived address '${cleanDerived}' from private key does not match configured address '${cleanEnv}'.`;
                logger.error(errMsg);
                throw new Error(errMsg);
              }
            }

            hw.address = isEvm ? normalizeEvmAddress(derivedAddress) : derivedAddress;
            hw.status = 'ACTIVE';
            logger.info(
              `[TreasuryService] Startup Validation PASSED: ${hw.label} (${hw.address}) derived successfully from private key.`
            );
          } catch (err: any) {
            if (err.message.includes('Startup Validation Failure')) {
              throw err;
            }
            logger.error(`[TreasuryService] Failed to derive address for ${hw.label}: ${err.message}`);
            if (hw.walletNumber === 1) {
              throw new Error(`[Treasury Startup Validation] Critical failure deriving ${hw.label}: ${err.message}`);
            }
            hw.status = 'DISABLED';
          }
        } else {
          if (hw.walletNumber === 1 && hw.address) {
            logger.warn(
              `[TreasuryService] ${hw.label} using default address ${hw.address}. Private key was not provided in env.`
            );
          } else {
            hw.status = 'DISABLED';
            logger.info(`[TreasuryService] ${hw.label} has no private key configured. Marked as DISABLED.`);
          }
        }
      }

      // 2. Validate Cold Wallets (Receive-Only: NO private key / mnemonic loaded!)
      for (const cw of config.coldWallets) {
        const envCold = await this.getEnvConfiguredColdAddress(network, cw.walletNumber);
        if (envCold) {
          cw.address = isEvm ? normalizeEvmAddress(envCold) : envCold;
        }
        cw.status = cw.address ? 'ACTIVE' : 'DISABLED';
        logger.info(
          `[TreasuryService] Startup Validation PASSED: ${cw.label} (${cw.address || 'N/A'}) configured as Receive-Only.`
        );
      }

      // 3. Upsert into Database
      await this.syncNetworkWalletsToDb(network, config);
    }

    this.isValidated = true;
    logger.info('[TreasuryService] All Treasury Wallet architecture validations and database syncs completed successfully.');
  }

  /**
   * Persist / Sync network wallet records in database
   */
  private async syncNetworkWalletsToDb(
    network: string,
    config: { hotWallets: TreasuryWalletRecord[]; coldWallets: TreasuryWalletRecord[] }
  ) {
    const activeHot1 = config.hotWallets.find((w) => w.walletNumber === 1 && w.status === 'ACTIVE') || config.hotWallets[0];
    const activeCold1 = config.coldWallets.find((w) => w.walletNumber === 1 && w.status === 'ACTIVE') || config.coldWallets[0];

    const allWallets = [...config.hotWallets, ...config.coldWallets];

    for (const wallet of allWallets) {
      if (!wallet.address) continue;

      const existing = await db
        .select()
        .from(treasuryWallets)
        .where(
          and(
            eq(treasuryWallets.network, network),
            eq(treasuryWallets.walletType, wallet.walletType),
            eq(treasuryWallets.walletNumber, wallet.walletNumber)
          )
        )
        .limit(1);

      if (existing.length > 0) {
        await db
          .update(treasuryWallets)
          .set({
            address: wallet.address,
            label: wallet.label,
            status: wallet.status,
            priority: wallet.priority,
            hotAddress: activeHot1.address,
            coldAddress: activeCold1.address,
            updatedAt: new Date(),
          })
          .where(eq(treasuryWallets.id, existing[0].id));
      } else {
        await db.insert(treasuryWallets).values({
          network,
          walletType: wallet.walletType,
          walletNumber: wallet.walletNumber,
          label: wallet.label,
          address: wallet.address,
          status: wallet.status,
          priority: wallet.priority,
          balance: '0.00000000',
          hotAddress: activeHot1.address,
          coldAddress: activeCold1.address,
          hotBalance: '0.00000000',
          coldBalance: '0.00000000',
          autoSweepEnabled: true,
          autoSweepThreshold: '50.00000000',
          sweepMode: 'AUTOMATIC',
          sweepDelay: 'IMMEDIATE',
          customDelayMinutes: 0,
          paused: false,
        });
      }
    }
  }

  /**
   * Retrieve active hot wallets for a network sorted by priority
   */
  /**
   * Retrieve active hot wallets for a network sorted by priority
   */
  async getHotWallets(network: string): Promise<TreasuryWalletRecord[]> {
    const cleanNetwork = network.toUpperCase();
    const records = await db
      .select()
      .from(treasuryWallets)
      .where(and(eq(treasuryWallets.network, cleanNetwork), eq(treasuryWallets.walletType, 'HOT')));

    if (records.length > 0) {
      const result: TreasuryWalletRecord[] = [];
      for (const r of records) {
        let bal = r.balance || r.hotBalance || '0.00000000';
        const addr = r.address || r.hotAddress || '';
        if (addr && r.status === 'ACTIVE') {
          try {
            bal = await this.provider.getBalance(cleanNetwork, addr);
            await db
              .update(treasuryWallets)
              .set({ balance: bal, hotBalance: bal, updatedAt: new Date() })
              .where(eq(treasuryWallets.id, r.id));
          } catch (e: any) {
            logger.warn(`[TreasuryService] Failed to fetch live balance for hot wallet ${addr}: ${e.message}`);
          }
        }
        result.push({
          id: r.id,
          network: r.network,
          walletType: 'HOT',
          walletNumber: r.walletNumber || 1,
          label: r.label || `Hot Wallet ${r.walletNumber || 1}`,
          address: addr,
          status: (r.status as any) || 'ACTIVE',
          priority: r.priority || 1,
          balance: bal,
        });
      }
      return result;
    }

    return INITIAL_TREASURY_WALLETS[cleanNetwork]?.hotWallets || [];
  }

  /**
   * Retrieve active cold wallets for a network sorted by priority
   */
  async getColdWallets(network: string): Promise<TreasuryWalletRecord[]> {
    const cleanNetwork = network.toUpperCase();
    const records = await db
      .select()
      .from(treasuryWallets)
      .where(and(eq(treasuryWallets.network, cleanNetwork), eq(treasuryWallets.walletType, 'COLD')));

    if (records.length > 0) {
      const result: TreasuryWalletRecord[] = [];
      for (const r of records) {
        let bal = r.balance || r.coldBalance || '0.00000000';
        const addr = r.address || r.coldAddress || '';
        if (addr && r.status === 'ACTIVE') {
          try {
            bal = await this.provider.getBalance(cleanNetwork, addr);
            await db
              .update(treasuryWallets)
              .set({ balance: bal, coldBalance: bal, updatedAt: new Date() })
              .where(eq(treasuryWallets.id, r.id));
          } catch (e: any) {
            logger.warn(`[TreasuryService] Failed to fetch live balance for cold wallet ${addr}: ${e.message}`);
          }
        }
        result.push({
          id: r.id,
          network: r.network,
          walletType: 'COLD',
          walletNumber: r.walletNumber || 1,
          label: r.label || `Cold Wallet ${r.walletNumber || 1}`,
          address: addr,
          status: (r.status as any) || 'ACTIVE',
          priority: r.priority || 1,
          balance: bal,
        });
      }
      return result;
    }

    return INITIAL_TREASURY_WALLETS[cleanNetwork]?.coldWallets || [];
  }

  /**
   * Get primary active Hot Wallet for a network
   */
  async getActiveHotWallet(network: string): Promise<TreasuryWalletRecord> {
    const hws = await this.getHotWallets(network);
    const active = hws.find((w) => w.status === 'ACTIVE') || hws[0];
    if (!active || !active.address) {
      const fallbackAddr = INITIAL_TREASURY_WALLETS[network.toUpperCase()]?.hotWallets[0]?.address;
      if (!fallbackAddr) {
        throw new Error(`No active Hot Wallet configured for network ${network}`);
      }
      return {
        network,
        walletType: 'HOT',
        walletNumber: 1,
        label: `${network} Hot Wallet 1`,
        address: fallbackAddr,
        status: 'ACTIVE',
        priority: 1,
      };
    }
    return active;
  }

  /**
   * Get primary active Cold Wallet for a network
   */
  async getActiveColdWallet(network: string): Promise<TreasuryWalletRecord> {
    const cws = await this.getColdWallets(network);
    const active = cws.find((w) => w.status === 'ACTIVE') || cws[0];
    if (!active || !active.address) {
      const fallbackAddr = INITIAL_TREASURY_WALLETS[network.toUpperCase()]?.coldWallets[0]?.address;
      if (!fallbackAddr) {
        throw new Error(`No active Cold Wallet configured for network ${network}`);
      }
      return {
        network,
        walletType: 'COLD',
        walletNumber: 1,
        label: `${network} Cold Wallet 1`,
        address: fallbackAddr,
        status: 'ACTIVE',
        priority: 1,
      };
    }
    return active;
  }

  /**
   * Seed / retrieve the treasury configuration for a specific network (backward compatible)
   */
  async getOrCreateTreasuryWallet(network: string) {
    const cleanNetwork = network.toUpperCase();

    if (!this.isValidated) {
      await this.validateAndSyncTreasuryWallets();
    }

    const hotWallet = await this.getActiveHotWallet(cleanNetwork);
    const coldWallet = await this.getActiveColdWallet(cleanNetwork);

    const existingSettings = await db
      .select()
      .from(treasuryWallets)
      .where(eq(treasuryWallets.network, cleanNetwork))
      .limit(1);

    const settings = existingSettings.length > 0 ? existingSettings[0] : null;

    return {
      id: settings?.id,
      network: cleanNetwork,
      hotAddress: hotWallet.address,
      coldAddress: coldWallet.address,
      hotBalance: settings?.hotBalance || '0.00000000',
      coldBalance: settings?.coldBalance || '0.00000000',
      autoSweepEnabled: settings ? settings.autoSweepEnabled : true,
      autoSweepThreshold: settings ? settings.autoSweepThreshold : '50.00000000',
      sweepMode: settings?.sweepMode || 'AUTOMATIC',
      sweepDelay: settings?.sweepDelay || 'IMMEDIATE',
      customDelayMinutes: settings?.customDelayMinutes || 0,
      paused: settings?.paused || false,
    };
  }

  /**
   * Initialize all default treasury wallet configurations if missing
   */
  async ensureAllTreasuryWallets() {
    await this.validateAndSyncTreasuryWallets();
  }

  /**
   * Fetch complete treasury metrics and list of deposit addresses for a network
   */
  async getTreasuryOverview(network: string) {
    const cleanNetwork = network.toUpperCase();
    const config = await this.getOrCreateTreasuryWallet(cleanNetwork);

    const hotWallets = await this.getHotWallets(cleanNetwork);
    const coldWallets = await this.getColdWallets(cleanNetwork);

    // Fetch user deposit addresses with on-chain balances
    const addresses = await db
      .select({
        id: depositAddresses.id,
        userId: depositAddresses.userId,
        network: depositAddresses.network,
        address: depositAddresses.address,
        onChainBalance: depositAddresses.onChainBalance,
        isActive: depositAddresses.isActive,
        createdAt: depositAddresses.createdAt,
        dsUserId: users.userId,
        userName: users.name,
        userEmail: users.email,
      })
      .from(depositAddresses)
      .leftJoin(users, eq(depositAddresses.userId, users.id))
      .where(eq(depositAddresses.network, cleanNetwork))
      .orderBy(desc(depositAddresses.createdAt));

    // Update live on-chain token balance for every deposit address
    await walletSyncService.syncUserDepositAddressesBalance(cleanNetwork, addresses);

    let totalPendingSweep = 0;
    addresses.forEach((addr) => {
      totalPendingSweep += parseFloat(addr.onChainBalance);
    });

    let liveHotBalance = config.hotBalance;
    let liveColdBalance = config.coldBalance;
    let liveHotNativeGas = '0.00000000';
    let totalUserGas = '0.00000000';

    try {
      const liveHot = await this.provider.getBalance(cleanNetwork, config.hotAddress);
      const liveCold = await this.provider.getBalance(cleanNetwork, config.coldAddress);

      liveHotBalance = liveHot;
      liveColdBalance = liveCold;

      await db
        .update(treasuryWallets)
        .set({
          hotBalance: liveHot,
          coldBalance: liveCold,
          balance: liveHot,
          updatedAt: new Date(),
        })
        .where(eq(treasuryWallets.network, cleanNetwork));
    } catch (err: any) {
      logger.warn(`[TreasuryService] Failed to fetch live balances for ${cleanNetwork}: ${err.message}`);
    }

    try {
      if (config.hotAddress) {
        liveHotNativeGas = await this.provider.getNativeBalance(cleanNetwork, config.hotAddress);
      }
    } catch (err: any) {
      logger.warn(`[TreasuryService] Failed to fetch hot wallet native gas balance: ${err.message}`);
    }

    try {
      const gasBals = await Promise.all(
        addresses.map(async (a) => {
          try {
            const balStr = await this.provider.getNativeBalance(cleanNetwork, a.address);
            return parseFloat(balStr || '0');
          } catch {
            return 0;
          }
        })
      );
      const userGasSum = gasBals.reduce((sum, val) => sum + val, 0);
      totalUserGas = userGasSum.toFixed(8);
    } catch (err: any) {
      logger.warn(`[TreasuryService] Failed to calculate total user gas: ${err.message}`);
    }

    return {
      config,
      hotWallets,
      coldWallets,
      totalPendingSweep: totalPendingSweep.toFixed(8),
      liveHotBalance,
      liveColdBalance,
      liveHotNativeGas,
      totalUserGas,
      depositAddresses: addresses,
    };
  }

  /**
   * Sweep funds from a specific user deposit address to the Hot Wallet (USER_TO_HOT)
   */
  async sweepUserDepositAddress(addressId: string, adminUid: string = 'SYSTEM') {
    const addressRecord = await db
      .select()
      .from(depositAddresses)
      .where(eq(depositAddresses.id, addressId))
      .limit(1);

    if (addressRecord.length === 0) {
      throw new Error(`User deposit address record not found: ${addressId}`);
    }

    const addr = addressRecord[0];
    const hotWallet = await this.getActiveHotWallet(addr.network);
    return sweepExecutionService.sweepUserDepositAddress(addressId, hotWallet.address, adminUid);
  }

  /**
   * Sweep ALL eligible deposit addresses on a selected network
   */
  async sweepAllEligibleAddresses(network: string, adminUid: string = 'SYSTEM') {
    const cleanNetwork = network.toUpperCase();
    const addresses = await db
      .select()
      .from(depositAddresses)
      .where(
        and(
          eq(depositAddresses.network, cleanNetwork),
          sql`CAST(${depositAddresses.onChainBalance} AS DECIMAL) > 0`
        )
      );

    logger.info(`[TreasuryService] Found ${addresses.length} eligible addresses with positive balance for ${cleanNetwork}`);

    const results = [];
    for (const addr of addresses) {
      const res = await this.sweepUserDepositAddress(addr.id, adminUid);
      results.push({ address: addr.address, ...res });
    }

    return results;
  }

  /**
   * Transfer funds from Hot Wallet to Cold Wallet (HOT_TO_COLD)
   */
  async sweepHotToCold(network: string, amount: string, adminUid: string = 'SYSTEM') {
    const cleanNetwork = network.toUpperCase();
    const hotWallet = await this.getActiveHotWallet(cleanNetwork);
    const coldWallet = await this.getActiveColdWallet(cleanNetwork);
    const treasury = await this.getOrCreateTreasuryWallet(cleanNetwork);

    const amountFloat = parseFloat(amount);
    if (amountFloat <= 0) {
      throw new Error('Transfer amount to cold wallet must be strictly positive.');
    }

    const currentHotFloat = parseFloat(treasury.hotBalance);
    if (currentHotFloat < amountFloat) {
      throw new Error(`Insufficient Hot Wallet balance. Available: ${treasury.hotBalance} USDT, Requested: ${amount} USDT`);
    }

    logger.info(
      `[TreasuryService] Commencing sweep from Hot Wallet (${hotWallet.address}) to Cold Wallet (${coldWallet.address}) of ${amount} USDT`
    );

    const job = await db
      .insert(treasurySweepJobs)
      .values({
        network: cleanNetwork,
        sourceAddress: hotWallet.address,
        destinationAddress: coldWallet.address,
        sweepType: 'HOT_TO_COLD',
        amount,
        status: 'PENDING',
        attempts: 1,
      })
      .returning();

    const jobId = job[0].id;
    let txHash: string | null = null;

    try {
      await db
        .update(treasurySweepJobs)
        .set({ status: 'IN_PROGRESS', updatedAt: new Date() })
        .where(eq(treasurySweepJobs.id, jobId));

      txHash = await this.provider.broadcastTransaction(cleanNetwork, coldWallet.address, amount);

      // Broadcast succeeded — the transaction is submitted, but NOT yet confirmed on-chain.
      // Do not move any balance and do not mark COMPLETED yet.
      await db
        .update(treasurySweepJobs)
        .set({
          status: 'AWAITING_CONFIRMATION',
          txHash,
          errorMessage: null,
          updatedAt: new Date(),
        })
        .where(eq(treasurySweepJobs.id, jobId));

      logger.info(`[TreasuryService] Hot to Cold Sweep BROADCASTED. TxHash: ${txHash}. Awaiting on-chain confirmation.`);

      await auditRepository.createAuditLog({
        actorUid: adminUid,
        userId: null as any,
        action: 'TREASURY_SWEEP_HOT_TO_COLD_BROADCASTED',
        resource: `treasury/jobs/${jobId}`,
        oldValue: amount,
        newValue: txHash,
      });

      return { success: true, jobId, txHash, awaitingConfirmation: true };
    } catch (err: any) {
      logger.error(`[TreasuryService] Hot to Cold Sweep FAILED:`, err.message);

      if (txHash) {
        // Broadcast itself succeeded but something after it threw. Stay in
        // AWAITING_CONFIRMATION — the poller resolves this against real chain state.
        await db
          .update(treasurySweepJobs)
          .set({
            status: 'AWAITING_CONFIRMATION',
            txHash,
            errorMessage: err.message,
            updatedAt: new Date(),
          })
          .where(eq(treasurySweepJobs.id, jobId));

        return { success: true, jobId, txHash, awaitingConfirmation: true };
      }

      await db
        .update(treasurySweepJobs)
        .set({
          status: 'FAILED',
          errorMessage: err.message,
          updatedAt: new Date(),
        })
        .where(eq(treasurySweepJobs.id, jobId));

      return { success: false, jobId, error: err.message };
    }
  }

  /**
   * Poll every AWAITING_CONFIRMATION HOT_TO_COLD sweep job and finalize it against real
   * on-chain state. This is the ONLY place a HOT_TO_COLD job is ever moved to COMPLETED.
   */
  async pollAndFinalizeHotToColdJobs(): Promise<void> {
    const CONFIRMATION_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes

    const pendingJobs = await db
      .select()
      .from(treasurySweepJobs)
      .where(and(eq(treasurySweepJobs.status, 'AWAITING_CONFIRMATION'), eq(treasurySweepJobs.sweepType, 'HOT_TO_COLD')));

    for (const job of pendingJobs) {
      if (!job.txHash) continue;

      try {
        const txInfo = await this.provider.getTransaction(job.network, job.txHash);

        if (!txInfo) {
          const isStuck = new Date(job.updatedAt).getTime() < Date.now() - CONFIRMATION_TIMEOUT_MS;
          if (isStuck) {
            await db
              .update(treasurySweepJobs)
              .set({ status: 'FAILED', errorMessage: 'On-chain confirmation timeout: transaction hash was never indexed.', updatedAt: new Date() })
              .where(and(eq(treasurySweepJobs.id, job.id), eq(treasurySweepJobs.status, 'AWAITING_CONFIRMATION')));
            logger.error(`[TreasuryService] Hot to Cold sweep job ${job.id} timed out awaiting on-chain confirmation.`);
          }
          continue;
        }

        if (!txInfo.isSuccessful) {
          await db
            .update(treasurySweepJobs)
            .set({ status: 'FAILED', errorMessage: 'Transaction was reverted/failed on-chain.', updatedAt: new Date() })
            .where(and(eq(treasurySweepJobs.id, job.id), eq(treasurySweepJobs.status, 'AWAITING_CONFIRMATION')));
          logger.error(`[TreasuryService] Hot to Cold sweep job ${job.id} FAILED on-chain.`);
          continue;
        }

        const requiredConfirmations =
          blockchainConfig.networks[job.network]?.confirmationsRequired ?? (blockchainConfig.isTestnet ? 1 : 6);

        if ((txInfo.confirmations || 0) < requiredConfirmations) {
          logger.info(
            `[TreasuryService] Hot to Cold sweep job ${job.id} has ${txInfo.confirmations}/${requiredConfirmations} confirmations. Awaiting additional blocks...`
          );
          continue;
        }

        const amountFloat = parseFloat(job.amount);
        await db.transaction(async (tx) => {
          await tx
            .update(treasurySweepJobs)
            .set({ status: 'COMPLETED', errorMessage: null, updatedAt: new Date() })
            .where(and(eq(treasurySweepJobs.id, job.id), eq(treasurySweepJobs.status, 'AWAITING_CONFIRMATION')));

          const twRecord = await tx
            .select()
            .from(treasuryWallets)
            .where(eq(treasuryWallets.network, job.network))
            .limit(1);

          if (twRecord.length > 0) {
            const currentHotFloat = parseFloat(twRecord[0].hotBalance || '0');
            const currentColdFloat = parseFloat(twRecord[0].coldBalance || '0');
            const newHotStr = (currentHotFloat - amountFloat).toFixed(8);
            const newColdStr = (currentColdFloat + amountFloat).toFixed(8);
            await tx
              .update(treasuryWallets)
              .set({ hotBalance: newHotStr, coldBalance: newColdStr, updatedAt: new Date() })
              .where(eq(treasuryWallets.network, job.network));
          }
        });

        logger.info(`[TreasuryService] Hot to Cold sweep job ${job.id} CONFIRMED on-chain and COMPLETED. TxHash: ${job.txHash}`);

        await auditRepository.createAuditLog({
          actorUid: 'SYSTEM',
          userId: null as any,
          action: 'TREASURY_SWEEP_HOT_TO_COLD_CONFIRMED',
          resource: `treasury/jobs/${job.id}`,
          oldValue: job.amount,
          newValue: job.txHash,
        });
      } catch (err: any) {
        logger.error(`[TreasuryService] Error polling confirmation for Hot to Cold sweep job ${job.id}:`, err.message);
      }
    }
  }

  /**
   * Retry a failed sweep job
   */
  async retrySweepJob(jobId: string, adminUid: string = 'SYSTEM') {
    const jobRecord = await db
      .select()
      .from(treasurySweepJobs)
      .where(eq(treasurySweepJobs.id, jobId))
      .limit(1);

    if (jobRecord.length === 0) {
      throw new Error(`Sweep job record not found: ${jobId}`);
    }

    const job = jobRecord[0];
    if (job.status !== 'FAILED') {
      throw new Error(`Only failed sweep jobs can be retried. Current status is: ${job.status}`);
    }

    logger.info(`[TreasuryService] Retrying failed sweep job ${jobId} of ${job.amount} USDT on ${job.network}`);

    await db
      .update(treasurySweepJobs)
      .set({
        attempts: job.attempts + 1,
        status: 'IN_PROGRESS',
        updatedAt: new Date(),
      })
      .where(eq(treasurySweepJobs.id, jobId));

    try {
      const txHash = await this.provider.broadcastTransaction(job.network, job.destinationAddress, job.amount);

      // Broadcast succeeded — do NOT credit any balance and do NOT mark COMPLETED yet.
      // This job now sits in AWAITING_CONFIRMATION and is picked up by the appropriate
      // poller (SweepExecutionService.pollAndFinalizeAwaitingConfirmationJobs() for
      // USER_TO_HOT, or this.pollAndFinalizeHotToColdJobs() for HOT_TO_COLD) once the
      // blockchain actually confirms it.
      await db
        .update(treasurySweepJobs)
        .set({
          status: 'AWAITING_CONFIRMATION',
          txHash,
          errorMessage: null,
          updatedAt: new Date(),
        })
        .where(eq(treasurySweepJobs.id, jobId));

      logger.info(`[TreasuryService] Retry for job ${jobId} broadcasted successfully. TxHash: ${txHash}. Awaiting on-chain confirmation.`);

      await auditRepository.createAuditLog({
        actorUid: adminUid,
        userId: null as any,
        action: 'TREASURY_SWEEP_RETRY_BROADCASTED',
        resource: `treasury/jobs/${jobId}`,
        oldValue: job.attempts.toString(),
        newValue: txHash,
      });

      return { success: true, txHash, awaitingConfirmation: true };
    } catch (err: any) {
      logger.error(`[TreasuryService] Retry for job ${jobId} failed:`, err.message);

      await db
        .update(treasurySweepJobs)
        .set({
          status: 'FAILED',
          errorMessage: err.message,
          updatedAt: new Date(),
        })
        .where(eq(treasurySweepJobs.id, jobId));

      return { success: false, error: err.message };
    }
  }

  /**
   * Trigger threshold check on a specific deposit address
   */
  async checkAndTriggerAutoSweep(addressId: string) {
    try {
      const addressRecord = await db
        .select()
        .from(depositAddresses)
        .where(eq(depositAddresses.id, addressId))
        .limit(1);

      if (addressRecord.length === 0) return;

      const addr = addressRecord[0];
      const treasury = await this.getOrCreateTreasuryWallet(addr.network);

      if (!treasury.autoSweepEnabled) {
        logger.debug(`[TreasuryService] Auto-sweep is disabled for network ${addr.network}`);
        return;
      }

      const balanceFloat = parseFloat(addr.onChainBalance);
      const thresholdFloat = parseFloat(treasury.autoSweepThreshold);

      if (balanceFloat >= thresholdFloat) {
        logger.info(
          `[TreasuryService] Auto-sweep triggered! Address ${addr.address} balance ${balanceFloat} USDT >= threshold ${thresholdFloat} USDT`
        );
        await this.sweepUserDepositAddress(addr.id, 'SYSTEM');
      }
    } catch (err: any) {
      logger.error(`[TreasuryService] Failed to check / trigger auto-sweep for address ${addressId}:`, err.message);
    }
  }

  /**
   * Update auto-sweep configurations for a network
   */
  async updateAutoSweepConfig(
    network: string,
    enabled: boolean,
    threshold: string,
    adminUid: string = 'SYSTEM'
  ) {
    const cleanNetwork = network.toUpperCase();
    await this.getOrCreateTreasuryWallet(cleanNetwork);

    const updated = await db
      .update(treasuryWallets)
      .set({
        autoSweepEnabled: enabled,
        autoSweepThreshold: threshold,
        updatedAt: new Date(),
      })
      .where(eq(treasuryWallets.network, cleanNetwork))
      .returning();

    await auditRepository.createAuditLog({
      actorUid: adminUid,
      userId: null as any,
      action: 'TREASURY_AUTO_SWEEP_CONFIG_UPDATE',
      resource: `treasury/config/${cleanNetwork}`,
      oldValue: JSON.stringify({ enabled: !enabled }),
      newValue: JSON.stringify({ enabled, threshold }),
    });

    return updated[0];
  }

  /**
   * Get list of all sweep jobs with user details
   */
  async getSweepJobs(network?: string) {
    let q = db
      .select({
        id: treasurySweepJobs.id,
        network: treasurySweepJobs.network,
        sourceAddress: treasurySweepJobs.sourceAddress,
        destinationAddress: treasurySweepJobs.destinationAddress,
        sweepType: treasurySweepJobs.sweepType,
        amount: treasurySweepJobs.amount,
        txHash: treasurySweepJobs.txHash,
        status: treasurySweepJobs.status,
        errorMessage: treasurySweepJobs.errorMessage,
        attempts: treasurySweepJobs.attempts,
        createdAt: treasurySweepJobs.createdAt,
        updatedAt: treasurySweepJobs.updatedAt,
        dsUserId: users.userId,
        userName: users.name,
        userEmail: users.email,
      })
      .from(treasurySweepJobs)
      .leftJoin(depositAddresses, eq(treasurySweepJobs.sourceAddress, depositAddresses.address))
      .leftJoin(users, eq(depositAddresses.userId, users.id));

    if (network) {
      const cleanNetwork = network.toUpperCase();
      return q.where(eq(treasurySweepJobs.network, cleanNetwork)).orderBy(desc(treasurySweepJobs.createdAt));
    }

    return q.orderBy(desc(treasurySweepJobs.createdAt));
  }
}

export const treasuryService = new TreasuryService();
export default treasuryService;
