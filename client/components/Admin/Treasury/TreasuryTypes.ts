/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ThemeTokens } from '../../ui/themeTokens.ts';

export interface SweepJob {
  id: string;
  network: string;
  sourceAddress: string;
  destinationAddress: string;
  sweepType: 'USER_TO_HOT' | 'HOT_TO_COLD';
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED' | 'AWAITING_CONFIRMATION';
  amount: string;
  txHash: string | null;
  errorMessage: string | null;
  attempts: number;
  createdAt: string;
  dsUserId?: string | null;
  userName?: string | null;
  userEmail?: string | null;
}

export interface DepositAddress {
  id: string;
  userId: string;
  network: string;
  address: string;
  onChainBalance: string;
  nativeGasBalance?: string;
  dsUserId?: string | null;
  userName?: string | null;
  userEmail?: string | null;
}

export interface SweepQueueItem {
  id: string;
  depositId: string;
  depositAddress: string;
  network: string;
  amount: string;
  status: 'PENDING' | 'WAITING_DELAY' | 'WAITING_FOR_GAS' | 'WAITING_GAS' | 'GAS_FUNDING' | 'WAITING_GAS_CONFIRMATION' | 'READY_TO_SWEEP' | 'SWEEPING' | 'WAITING_SWEEP_CONFIRMATION' | 'COMPLETED' | 'FAILED' | 'RETRY_PENDING' | 'CANCELLED';
  gasStatus: 'LOW' | 'FUNDING_SENT' | 'OK' | 'FAILED';
  gasTxHash: string | null;
  sweepTxHash: string | null;
  errorMessage: string | null;
  attempts: number;
  eligibleAt: string;
  createdAt: string;
  updatedAt: string;
  userEmail: string;
  userName: string | null;
  dsUserId: string;
  nativeGasBalance: string;
  requiredGas: string;
  confirmations: number;
  requiredConfirmations: number;
}

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

export interface TreasuryComponentProps {
  t: ThemeTokens;
  isDark: boolean;
}
