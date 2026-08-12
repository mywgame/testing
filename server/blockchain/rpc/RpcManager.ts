/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ethers } from 'ethers';
import { blockchainConfig } from '../config/blockchainConfig.ts';

export interface RpcEndpoint {
  url: string;
  weight: number;
  isFailing?: boolean;
  lastFailureTime?: number;
}

export class RpcManager {
  private endpoints: Record<string, RpcEndpoint[]> = {};
  private providerCache: Map<string, ethers.JsonRpcProvider> = new Map();

  constructor() {
    this.initializeEndpoints();
  }

  /**
   * Get chain ID for EVM networks
   */
  public getChainId(network: string): number {
    const isTestnet = blockchainConfig.isTestnet;
    if (network === 'USDT_BEP20') {
      return isTestnet ? 97 : 56;
    }
    if (network === 'USDT_POLYGON') {
      return isTestnet ? 80002 : 137;
    }
    return 1;
  }

  /**
   * Get or create a cached static JsonRpcProvider instance per rpcUrl
   * Prevents ethers v6 background eth_chainId auto-detection retries and warnings
   */
  public getProvider(network: string, rpcUrl: string): ethers.JsonRpcProvider {
    let provider = this.providerCache.get(rpcUrl);
    if (!provider) {
      const chainId = this.getChainId(network);
      const networkObj = ethers.Network.from(chainId);
      provider = new ethers.JsonRpcProvider(rpcUrl, networkObj, { staticNetwork: networkObj });
      this.providerCache.set(rpcUrl, provider);
    }
    return provider;
  }

  private initializeEndpoints() {
    const isTestnet = blockchainConfig.isTestnet;

    // BSC endpoints
    const bscEnvPrimary = process.env.BSC_RPC_URL;
    const bscEnvSecondary = process.env.BSC_RPC_URL_FALLBACK;

    const defaultBsc = isTestnet
      ? [
          'https://data-seed-prebsc-1-s1.binance.org:8545',
          'https://bsc-testnet.publicnode.com',
          'https://data-seed-prebsc-2-s1.binance.org:8545',
        ]
      : [
          'https://bsc-dataseed.binance.org',
          'https://bsc-mainnet.publicnode.com',
          'https://1rpc.io/bnb',
        ];

    const bscUrls = [
      ...(bscEnvPrimary ? [bscEnvPrimary] : []),
      ...(bscEnvSecondary ? [bscEnvSecondary] : []),
      ...defaultBsc,
    ];

    this.endpoints['USDT_BEP20'] = Array.from(new Set(bscUrls)).map((url, i) => ({
      url,
      weight: 100 - i * 10,
    }));

    // Polygon endpoints
    const polygonEnvPrimary = process.env.POLYGON_RPC_URL;
    const polygonEnvSecondary = process.env.POLYGON_RPC_URL_FALLBACK;

    const defaultPolygon = isTestnet
      ? [
          'https://rpc-amoy.polygon.technology',
          'https://polygon-amoy.drpc.org',
          'https://polygon-amoy.publicnode.com',
        ]
      : [
          'https://polygon-rpc.com',
          'https://polygon-bor.publicnode.com',
          'https://1rpc.io/matic',
        ];

    const polygonUrls = [
      ...(polygonEnvPrimary ? [polygonEnvPrimary] : []),
      ...(polygonEnvSecondary ? [polygonEnvSecondary] : []),
      ...defaultPolygon,
    ];

    this.endpoints['USDT_POLYGON'] = Array.from(new Set(polygonUrls)).map((url, i) => ({
      url,
      weight: 100 - i * 10,
    }));

    // Tron endpoints
    const tronEnvPrimary = process.env.TRON_RPC_URL;
    const tronEnvSecondary = process.env.TRON_RPC_URL_FALLBACK;

    const defaultTron = isTestnet
      ? [
          'https://nile.trongrid.io',
          'https://api.shasta.trongrid.io',
        ]
      : [
          'https://api.trongrid.io',
          'https://tron.drpc.org',
        ];

    const tronUrls = [
      ...(tronEnvPrimary ? [tronEnvPrimary] : []),
      ...(tronEnvSecondary ? [tronEnvSecondary] : []),
      ...defaultTron,
    ];

    this.endpoints['USDT_TRC20'] = Array.from(new Set(tronUrls)).map((url, i) => ({
      url,
      weight: 100 - i * 10,
    }));
  }

  /**
   * Get active RPC endpoint for a given network with failover support
   */
  public getEndpoint(network: string): string {
    const list = this.endpoints[network] || [];
    const now = Date.now();

    // Reset endpoints that failed more than 2 minutes ago
    for (const ep of list) {
      if (ep.isFailing && ep.lastFailureTime && now - ep.lastFailureTime > 120000) {
        ep.isFailing = false;
      }
    }

    const available = list.filter((ep) => !ep.isFailing);
    if (available.length === 0) {
      // If all are failing, reset all and return the first one
      for (const ep of list) ep.isFailing = false;
      return list[0]?.url || '';
    }

    return available[0].url;
  }

  /**
   * Mark an endpoint as failing to trigger failover
   */
  public markFailing(network: string, url: string) {
    const list = this.endpoints[network] || [];
    const target = list.find((ep) => ep.url === url);
    if (target) {
      target.isFailing = true;
      target.lastFailureTime = Date.now();
      console.warn(`[RpcManager] Marked RPC endpoint as failing for ${network}: ${url}`);
    }
  }

  /**
   * Execute JSON-RPC call with automatic RPC failover and retry
   */
  public async executeRpc<T>(
    network: string,
    executor: (rpcUrl: string) => Promise<T>
  ): Promise<T> {
    const list = this.endpoints[network] || [];
    let lastError: Error | null = null;

    for (let attempt = 0; attempt < Math.max(3, list.length); attempt++) {
      const url = this.getEndpoint(network);
      try {
        return await executor(url);
      } catch (err: any) {
        lastError = err;
        this.markFailing(network, url);
        console.warn(`[RpcManager] RPC call failed on ${url} for ${network}: ${err.message}. Retrying with next endpoint...`);
      }
    }

    throw new Error(
      `[RpcManager] All RPC endpoints failed for network ${network}. Last error: ${lastError?.message}`
    );
  }
}

export const rpcManager = new RpcManager();
export default rpcManager;
