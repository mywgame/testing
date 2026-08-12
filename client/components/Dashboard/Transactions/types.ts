/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type TransactionType =
  | 'Deposit'
  | 'Withdrawal'
  | 'Yield Claim'
  | 'Reward'
  | 'Team Income'
  | 'Referral Income'
  | 'Salary'
  | 'Bonus';

export type TransactionStatus =
  | 'Completed'
  | 'Pending'
  | 'Processing'
  | 'Failed';

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: string;
  status: TransactionStatus;
  method: string;
  date: string;
}
