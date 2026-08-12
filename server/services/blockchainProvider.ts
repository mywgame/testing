/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import activeBlockchainProvider from '../blockchain/providers/index.ts';

export interface BlockchainTransaction {
  hash: string;
  amount: string;
  sender: string;
  receiver: string;
  confirmations: number;
  isSuccessful: boolean;
}

export class GenericBlockchainProviderService {
  async generateAddress(network: string, derivationIndex: number): Promise<string> {
    return activeBlockchainProvider.generateDepositAddress(network, derivationIndex);
  }

  async getTransaction(network: string, txHash: string): Promise<BlockchainTransaction | null> {
    return activeBlockchainProvider.getTransaction(network, txHash);
  }

  async transferUSDT(network: string, toAddress: string, amount: string): Promise<string> {
    return activeBlockchainProvider.broadcastTransaction(network, toAddress, amount);
  }
}

export const blockchainProvider = new GenericBlockchainProviderService();
export default blockchainProvider;
