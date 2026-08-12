/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { walletService as newWalletService, WalletService as NewWalletService } from '../blockchain/services/WalletService.ts';

export const walletService = newWalletService;
export const WalletService = NewWalletService;
export default walletService;
