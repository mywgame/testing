/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { transactionMonitor as newTransactionMonitor, TransactionMonitor as NewTransactionMonitor } from '../blockchain/services/TransactionMonitor.ts';

export const transactionMonitor = newTransactionMonitor;
export const TransactionMonitor = NewTransactionMonitor;
export default transactionMonitor;
