/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import crypto from 'crypto';
import { hdWalletEngine } from '../hd/HdWalletEngine.ts';

/**
 * Interface representing a secret provider for future secret manager integrations.
 */
export interface SecretProvider {
  getSecret(key: string): Promise<string | null>;
}

/**
 * Standard Environment Secret Provider (default implementation).
 */
export class EnvSecretProvider implements SecretProvider {
  async getSecret(key: string): Promise<string | null> {
    return process.env[key] || null;
  }
}

export class KeyManager {
  private secretProvider: SecretProvider;

  constructor(secretProvider?: SecretProvider) {
    this.secretProvider = secretProvider || new EnvSecretProvider();
  }

  /**
   * Sets a custom secret provider (e.g. Google Secret Manager, AWS Secrets Manager)
   */
  public setSecretProvider(provider: SecretProvider): void {
    this.secretProvider = provider;
  }

  /**
   * Get master seed or network specific xpriv/xpub
   */
  private async getMasterSecret(network: string): Promise<string> {
    const masterMnemonic = await this.secretProvider.getSecret('MASTER_SEED_MNEMONIC');
    if (masterMnemonic) return masterMnemonic.trim();

    const masterSeed = await this.secretProvider.getSecret('MASTER_SEED_HEX');
    if (masterSeed) return masterSeed.trim();

    const cleanNetwork = network.toUpperCase().replace('USDT_', '');
    const xpriv = await this.secretProvider.getSecret(`USDT_${cleanNetwork}_XPRIV`);
    if (xpriv) return xpriv.trim();

    const xpub = await this.secretProvider.getSecret(`USDT_${cleanNetwork}_XPUB`);
    if (xpub) return xpub.trim();

    return 'metafirm-default-sandbox-master-seed';
  }

  /**
   * Derive a child public deposit address for a network and index.
   */
  public async deriveAddress(network: string, derivationIndex: number): Promise<string> {
    const secret = await this.getMasterSecret(network);
    if (!secret) {
      return this.generateDeterministicFallbackAddress(network, derivationIndex);
    }

    try {
      if (network.toUpperCase().includes('TRC20') || network.toUpperCase().includes('TRON')) {
        return hdWalletEngine.deriveTronAddress(secret, derivationIndex).address;
      } else {
        return hdWalletEngine.deriveEvmAddress(secret, derivationIndex).address;
      }
    } catch (error: any) {
      console.warn(`[KeyManager] HD derivation failed for ${network} at index ${derivationIndex}: ${error.message}. Using deterministic fallback.`);
      return this.generateDeterministicFallbackAddress(network, derivationIndex);
    }
  }

  /**
   * Derive a child private key for a network and index.
   * Private keys are NEVER stored in the database or logs.
   */
  public async derivePrivateKey(network: string, derivationIndex: number): Promise<string> {
    const secret = await this.getMasterSecret(network);
    if (!secret) {
      return this.generateDeterministicFallbackPrivateKey(network, derivationIndex);
    }

    try {
      if (network.toUpperCase().includes('TRC20') || network.toUpperCase().includes('TRON')) {
        return hdWalletEngine.deriveTronAddress(secret, derivationIndex).privateKey;
      } else {
        return hdWalletEngine.deriveEvmAddress(secret, derivationIndex).privateKey;
      }
    } catch (error: any) {
      console.warn(`[KeyManager] HD private key derivation failed for ${network} at index ${derivationIndex}: ${error.message}. Using deterministic fallback.`);
      return this.generateDeterministicFallbackPrivateKey(network, derivationIndex);
    }
  }

  /**
   * Helper to generate a deterministic fallback address for simulation mode
   */
  public generateDeterministicFallbackAddress(network: string, derivationIndex: number): string {
    const cleanNetwork = network.toUpperCase();
    if (cleanNetwork.includes('TRC20') || cleanNetwork.includes('TRON')) {
      const hash = crypto.createHash('sha256').update(`tron:${derivationIndex}`).digest('hex');
      const chars = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
      let derived = 'T';
      for (let i = 0; i < 33; i++) {
        const index = parseInt(hash.slice(i * 2, i * 2 + 2), 16) % chars.length;
        derived += chars[index];
      }
      return derived;
    } else {
      const hash = crypto.createHash('sha256').update(`evm:${network}:${derivationIndex}`).digest('hex');
      return `0x${hash.slice(0, 40)}`;
    }
  }

  /**
   * Helper to generate a deterministic fallback private key for simulation mode
   */
  public generateDeterministicFallbackPrivateKey(network: string, derivationIndex: number): string {
    const seed = `metafirm:${network}:private:${derivationIndex}`;
    const hash = crypto.createHash('sha256').update(seed).digest('hex');
    return `0x${hash}`;
  }

  /**
   * Get configured Hot Wallet private key for a network and wallet number (1, 2, 3...)
   */
  public async getHotWalletPrivateKey(network: string, walletNumber: number = 1): Promise<string | null> {
    const cleanNetwork = network.toUpperCase();
    const netShort = cleanNetwork.replace(/^USDT_/, '');

    // Check USDT_<NET>_HOT<N>_PRIVATE_KEY or <NET>_HOT<N>_PRIVATE_KEY
    let key = await this.secretProvider.getSecret(`USDT_${netShort}_HOT${walletNumber}_PRIVATE_KEY`) ||
              await this.secretProvider.getSecret(`${cleanNetwork}_HOT${walletNumber}_PRIVATE_KEY`);

    if (!key && walletNumber === 1) {
      key = await this.secretProvider.getSecret(`USDT_${netShort}_HOT_PRIVATE_KEY`) ||
            await this.secretProvider.getSecret(`${cleanNetwork}_HOT_PRIVATE_KEY`) ||
            await this.secretProvider.getSecret('HOT_WALLET_PRIVATE_KEY');
    }

    return key ? key.trim() : null;
  }
}

export const keyManager = new KeyManager();
export default keyManager;
