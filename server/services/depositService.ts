/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { depositService as newDepositService, DepositService as NewDepositService } from '../blockchain/services/DepositService.ts';

export const depositService = newDepositService;
export const DepositService = NewDepositService;
export default depositService;
