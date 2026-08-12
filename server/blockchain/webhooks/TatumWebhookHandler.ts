/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { depositAddressRepository } from '../../repositories/depositAddressRepository.ts';
import { depositRepository } from '../../repositories/depositRepository.ts';
import { depositService } from '../services/DepositService.ts';
import { logger } from '../../utils/logger.ts';
import { blockchainConfig } from '../config/blockchainConfig.ts';
import { normalizeAmount } from '../utils/amountUtils.ts';
import { activeBlockchainProvider } from '../providers/index.ts';

export interface TatumWebhookPayload {
  address: string;
  txId: string;
  chain?: string;
  amount: string;
  asset?: string;
  type?: string;
  contractAddress?: string;
  tokenAddress?: string;
}

export class TatumWebhookHandler {
  /**
   * Process an incoming Tatum transaction webhook payload
   */
  async handleIncomingNotification(payload: TatumWebhookPayload) {
    logger.info(`[TatumWebhookHandler] Received webhook notification: ${JSON.stringify(payload)}`);

    const address = payload.address || (payload as any).account || (payload as any).to || (payload as any).counterAddress;
    const txId = payload.txId || (payload as any).txHash || (payload as any).hash || (payload as any).transactionId;
    let amount = payload.amount || (payload as any).value || '0';
    const asset = payload.asset || (payload as any).currency || (payload as any).token;

    if (!address || !txId) {
      logger.warn(`[TatumWebhookHandler] Payload missing address or txId. Ignoring.`);
      return { status: 'ignored', reason: 'missing_address_or_txid' };
    }

    // 1. Resolve watched address back to our user
    let addressRecord = await depositAddressRepository.findByAddress(address);
    if (!addressRecord) {
      addressRecord = await depositAddressRepository.findByAddress(address.toLowerCase());
    }

    if (!addressRecord) {
      logger.warn(`[TatumWebhookHandler] Webhook address ${address} does not map to any system user. Ignoring.`);
      return { status: 'ignored', reason: 'address_not_found' };
    }

    const userId = addressRecord.userId;
    const network = addressRecord.network; // USDT_BEP20, USDT_POLYGON, USDT_TRC20
    const networkConfig = blockchainConfig.networks[network];
    const expectedContractAddress = networkConfig?.contractAddress;

    // 2. Check if this txId is already recorded or processed
    const existingDeposit = await depositRepository.findByTxHash(txId);
    if (existingDeposit) {
      if (existingDeposit.status === 'COMPLETED') {
        logger.info(`[TatumWebhookHandler] Webhook tx ${txId} was already successfully processed. Skipping.`);
        return { status: 'processed_already', depositId: existingDeposit.id };
      }

      // If it exists but is PENDING, trigger immediate successful processing!
      logger.info(`[TatumWebhookHandler] Webhook tx ${txId} exists as pending. Completing now.`);
      await depositService.processSuccessfulDeposit(existingDeposit.id, txId, 'SYSTEM');
      return { status: 'completed', depositId: existingDeposit.id };
    }

    // 3. Contract Address & Asset Validation
    let incomingContractAddress = payload.contractAddress || payload.tokenAddress || (payload as any).contract;

    // If asset looks like a contract address (e.g. starts with 0x or T), treat it as contract address
    if (!incomingContractAddress && asset && (asset.startsWith('0x') || asset.startsWith('T'))) {
      incomingContractAddress = asset;
    }

    if (incomingContractAddress && expectedContractAddress) {
      const isTron = network === 'USDT_TRC20';
      const isContractValid = isTron
        ? incomingContractAddress === expectedContractAddress
        : incomingContractAddress.toLowerCase() === expectedContractAddress.toLowerCase();

      if (!isContractValid) {
        logger.warn(
          `[TatumWebhookHandler] SECURITY REJECTION: Fake or mismatched token contract address detected! ` +
          `txHash=${txId}, network=${network}, incomingContractAddress=${incomingContractAddress}, ` +
          `expectedContractAddress=${expectedContractAddress}, depositAddress=${address}`
        );
        return { status: 'rejected', reason: 'contract_address_mismatch' };
      }
    }

    // 4. On-Chain Verification Fallback: Always query the blockchain via provider to verify tx on-chain
    try {
      const onChainTx = await activeBlockchainProvider.getTransaction(network, txId);
      if (onChainTx) {
        if (!onChainTx.isSuccessful) {
          logger.warn(`[TatumWebhookHandler] Webhook tx ${txId} failed on-chain. Rejecting.`);
          return { status: 'rejected', reason: 'transaction_failed_onchain' };
        }
        if (onChainTx.receiver && onChainTx.receiver.toLowerCase() !== address.toLowerCase()) {
          logger.warn(`[TatumWebhookHandler] Webhook tx ${txId} receiver mismatch on-chain. Expected ${address}, got ${onChainTx.receiver}`);
          return { status: 'rejected', reason: 'receiver_mismatch_onchain' };
        }
        if (onChainTx.amount && parseFloat(onChainTx.amount) > 0) {
          amount = onChainTx.amount;
        }
      }
    } catch (err: any) {
      logger.warn(`[TatumWebhookHandler] On-chain check for ${txId} gave error (proceeding with payload data): ${err.message}`);
    }

    // 5. Create a new deposit record and complete it immediately
    const networkDecimals = networkConfig?.decimals ?? (network === 'USDT_BEP20' ? 18 : 6);
    const normalizedAmount = normalizeAmount(amount, networkDecimals);
    logger.info(`[TatumWebhookHandler] Generating new deposit record for user ${userId} of ${normalizedAmount} USDT via webhook.`);
    const newDeposit = await depositService.createDeposit(userId, normalizedAmount, network, address, txId);
    await depositService.processSuccessfulDeposit(newDeposit.id, txId, 'SYSTEM');

    return { status: 'created_and_completed', depositId: newDeposit.id };
  }
}

export const tatumWebhookHandler = new TatumWebhookHandler();
export default tatumWebhookHandler;
