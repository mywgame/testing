/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { withdrawalService as newWithdrawalService, WithdrawalService as NewWithdrawalService } from '../blockchain/services/WithdrawalService.ts';

export const withdrawalService = newWithdrawalService;
export const WithdrawalService = NewWithdrawalService;
export default withdrawalService;
