/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface BlockchainTransaction {
  hash: string;
  amount: string;
  sender: string;
  receiver: string;
  confirmations: number;
  isSuccessful: boolean;
}

export interface BlockchainProvider {
  generateDepositAddress(network: string, derivationIndex: number): Promise<string>;
  getBalance(network: string, address: string): Promise<string>;
  getNativeBalance(network: string, address: string): Promise<string>;
  fundGas(network: string, toAddress: string, amount: string): Promise<string>;
  broadcastTransaction(network: string, toAddress: string, amount: string, fromPrivateKey?: string): Promise<string>;
  validateAddress(network: string, address: string): Promise<boolean>;
  getTransaction(network: string, txHash: string): Promise<BlockchainTransaction | null>;
  subscribeAddress?(network: string, address: string, webhookUrl: string): Promise<boolean>;
}
