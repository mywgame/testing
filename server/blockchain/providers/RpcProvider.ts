/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { evmRpcProvider } from './EvmRpcProvider.ts';
import { tronRpcProvider } from './TronRpcProvider.ts';
import type { BlockchainProvider, BlockchainTransaction } from '../interfaces/BlockchainProvider.ts';

export class RpcProvider implements BlockchainProvider {
  /**
   * Helper to resolve appropriate chain sub-provider
   */
  private getSubProvider(network: string): BlockchainProvider {
    const cleanNetwork = network.toUpperCase();
    if (cleanNetwork.includes('TRC20') || cleanNetwork.includes('TRON')) {
      return tronRpcProvider;
    }
    return evmRpcProvider;
  }

  async generateDepositAddress(network: string, derivationIndex: number): Promise<string> {
    return this.getSubProvider(network).generateDepositAddress(network, derivationIndex);
  }

  async getBalance(network: string, address: string): Promise<string> {
    return this.getSubProvider(network).getBalance(network, address);
  }

  async getNativeBalance(network: string, address: string): Promise<string> {
    return this.getSubProvider(network).getNativeBalance(network, address);
  }

  async fundGas(network: string, toAddress: string, amount: string): Promise<string> {
    return this.getSubProvider(network).fundGas(network, toAddress, amount);
  }

  async broadcastTransaction(
    network: string,
    toAddress: string,
    amount: string,
    fromPrivateKey?: string
  ): Promise<string> {
    return this.getSubProvider(network).broadcastTransaction(network, toAddress, amount, fromPrivateKey);
  }

  async validateAddress(network: string, address: string): Promise<boolean> {
    return this.getSubProvider(network).validateAddress(network, address);
  }

  async getTransaction(network: string, txHash: string): Promise<BlockchainTransaction | null> {
    return this.getSubProvider(network).getTransaction(network, txHash);
  }
}

export const rpcProvider = new RpcProvider();
export default rpcProvider;
