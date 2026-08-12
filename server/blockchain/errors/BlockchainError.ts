/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export class BlockchainError extends Error {
  constructor(message: string, public readonly code: string = 'BLOCKCHAIN_ERROR') {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends BlockchainError {
  constructor(message: string, code: string = 'VALIDATION_ERROR') {
    super(message, code);
  }
}

export class ProviderError extends BlockchainError {
  constructor(message: string, public readonly statusCode?: number, code: string = 'PROVIDER_ERROR') {
    super(message, code);
  }
}

export class TransactionNotFoundError extends BlockchainError {
  constructor(txHash: string) {
    super(`Transaction with hash ${txHash} was not found on-chain.`, 'TRANSACTION_NOT_FOUND');
  }
}

export class LowBalanceError extends BlockchainError {
  constructor(message: string) {
    super(message, 'LOW_BALANCE');
  }
}
