/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import type { BlockchainProvider } from '../interfaces/BlockchainProvider.ts';
import { RpcProvider } from './RpcProvider.ts';
import { TatumProvider } from './TatumProvider.ts';

const selectedProviderName = (process.env.BLOCKCHAIN_PROVIDER || 'rpc').trim().toLowerCase();

export const activeBlockchainProvider: BlockchainProvider =
  selectedProviderName === 'tatum' ? new TatumProvider() : new RpcProvider();

console.log(`[BlockchainProvider] Active blockchain provider initialized: ${selectedProviderName.toUpperCase()}`);

export default activeBlockchainProvider;
