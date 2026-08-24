/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as dotenv from 'dotenv';
dotenv.config();

export interface NetworkConfig {
  contractAddress: string;
  xpub: string;
  hotPrivateKey: string;
  hotAddress?: string;
  coldAddress?: string;
  chainName: string;
  decimals: number;
  confirmationsRequired: number;
}

export type BlockchainEnvironment = 'production' | 'sandbox' | 'development';

// Parse BLOCKCHAIN_ENV strictly as the single source of truth
const rawEnv = process.env.BLOCKCHAIN_ENV?.trim().toLowerCase();

if (!rawEnv) {
  throw new Error(
    "[blockchainConfig] Critical Configuration Error: BLOCKCHAIN_ENV environment variable is missing or empty. " +
    "You must explicitly set BLOCKCHAIN_ENV to 'production', 'sandbox', 'testnet', or 'development' in your environment configuration."
  );
}

let blockchainEnv: BlockchainEnvironment;
let isTestnet: boolean;

if (rawEnv === 'production' || rawEnv === 'mainnet') {
  blockchainEnv = 'production';
  isTestnet = false;
} else if (rawEnv === 'sandbox' || rawEnv === 'testnet') {
  blockchainEnv = 'sandbox';
  isTestnet = true;
} else if (rawEnv === 'development') {
  blockchainEnv = 'development';
  isTestnet = true;
} else {
  throw new Error(
    `[blockchainConfig] Critical Configuration Error: Invalid BLOCKCHAIN_ENV value '${process.env.BLOCKCHAIN_ENV}'. ` +
    "Allowed values are 'production', 'sandbox', 'testnet', or 'development'."
  );
}

export { blockchainEnv };

const apiKey = process.env.TATUM_API_KEY || '';
const baseUrl = process.env.TATUM_BASE_URL || 'https://api.tatum.io';

export const blockchainConfig = {
  env: blockchainEnv,
  baseUrl: baseUrl,
  apiKey: apiKey,
  isConfigured: !!apiKey,
  isTestnet: isTestnet,
  monitoringIntervalMs: parseInt(process.env.MONITORING_INTERVAL_MS || (isTestnet ? '120000' : '300000'), 10),
  blockChunkSize: parseInt(process.env.BLOCK_CHUNK_SIZE || (isTestnet ? '5' : '50'), 10),
  initialReplayBlocks: parseInt(process.env.INITIAL_REPLAY_BLOCKS || '10', 10),

  networks: {
    USDT_BEP20: {
      contractAddress:
        process.env.USDT_BEP20_CONTRACT ||
        process.env.USDT_CONTRACT ||
        (isTestnet
          ? '0x01F9Bc7BaBaFDFA8713628994dAEd75b8D07bF3C'
          : '0x55d398326f99059ff775485246999027b3197955'),
      xpub: process.env.USDT_BEP20_XPUB || process.env.USDT_XPUB || '',
      hotPrivateKey:
        process.env.USDT_BEP20_HOT1_PRIVATE_KEY ||
        process.env.USDT_BEP20_HOT_PRIVATE_KEY ||
        process.env.HOT_WALLET_PRIVATE_KEY ||
        '',
      hotAddress:
        process.env.USDT_BEP20_HOT1_ADDRESS ||
        process.env.USDT_BEP20_HOT_ADDRESS ||
        process.env.HOT_WALLET_ADDRESS ||
        '0x543fb86e08dd5C4128ca860966Ffb8f9F0E23c3F',
      coldAddress:
        process.env.USDT_BEP20_COLD_ADDRESS ||
        process.env.USDT_BEP20_COLD1_ADDRESS ||
        '0x75DbF92F40aC02Ad6a959211E2fC7aD413A87f8b',
      chainName: 'BSC',
      decimals: parseInt(process.env.USDT_BEP20_DECIMALS || process.env.USDT_DECIMALS || '18', 10),
      confirmationsRequired: parseInt(
        process.env.USDT_BEP20_CONFIRMATIONS || (isTestnet ? '1' : '6'),
        10
      ),
    } as NetworkConfig,

    USDT_POLYGON: {
      contractAddress:
        process.env.USDT_POLYGON_CONTRACT ||
        (isTestnet
          ? '0x41e94eb019c0762f9bfcf9fb1e58725bfb01728b'
          : '0xc2132d05d31c914a87c6611c10748aeb04b58e8f'),
      xpub: process.env.USDT_POLYGON_XPUB || '',
      hotPrivateKey:
        process.env.USDT_POLYGON_HOT1_PRIVATE_KEY ||
        process.env.USDT_POLYGON_HOT_PRIVATE_KEY ||
        '',
      hotAddress:
        process.env.USDT_POLYGON_HOT1_ADDRESS ||
        process.env.USDT_POLYGON_HOT_ADDRESS ||
        '0x79d73418F24804aaddF2AA6423567d814097d884',
      coldAddress:
        process.env.USDT_POLYGON_COLD_ADDRESS ||
        process.env.USDT_POLYGON_COLD1_ADDRESS ||
        '0x768432E5ab2EBA3fC549F36aed76Fc2c684F2D1d',
      chainName: 'POLYGON',
      decimals: parseInt(process.env.USDT_POLYGON_DECIMALS || '6', 10),
      confirmationsRequired: parseInt(
        process.env.USDT_POLYGON_CONFIRMATIONS || (isTestnet ? '1' : '12'),
        10
      ),
    } as NetworkConfig,

    USDT_TRC20: {
      contractAddress:
        process.env.USDT_TRC20_CONTRACT ||
        (isTestnet
          ? 'TXYZdfUrW2Dx79gSStj7Q47S8oexuF3pC3'
          : 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t'),
      xpub: process.env.USDT_TRC20_XPUB || '',
      hotPrivateKey:
        process.env.USDT_TRC20_HOT1_PRIVATE_KEY ||
        process.env.USDT_TRC20_HOT_PRIVATE_KEY ||
        '',
      hotAddress:
        process.env.USDT_TRC20_HOT1_ADDRESS ||
        process.env.USDT_TRC20_HOT_ADDRESS ||
        'TUhnNoVtAR4qJwFgzkRSGJPf6sxhXfQCBP',
      coldAddress:
        process.env.USDT_TRC20_COLD_ADDRESS ||
        process.env.USDT_TRC20_COLD1_ADDRESS ||
        'TVJg1SG998zcMj8XJx55gRtGmhTFGteLsM',
      chainName: 'TRON',
      decimals: parseInt(process.env.USDT_TRC20_DECIMALS || '6', 10),
      confirmationsRequired: parseInt(
        process.env.USDT_TRC20_CONFIRMATIONS || (isTestnet ? '1' : '19'),
        10
      ),
    } as NetworkConfig,
  } as Record<string, NetworkConfig>,
};
export default blockchainConfig;
