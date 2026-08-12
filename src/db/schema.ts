/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * FINANCIAL INTEGRITY & ARCHITECTURE RULES:
 * 1. Financial values must always use fixed-precision decimal types (NUMERIC/DECIMAL with 20,8 precision).
 * 2. Floating-point arithmetic (FLOAT, DOUBLE, REAL) is strictly prohibited for any financial or balance calculations to prevent precision loss.
 * 3. Historical ledger records are immutable.
 * 4. Financial and ledger records (such as transactions, deposits, withdrawals, etc.) must NEVER be updated or deleted.
 * 5. Corrections must always be inserted as new ledger records to maintain audit logs.
 * 6. This project strictly follows an append-only financial ledger architecture.
 */

// Central Schema Aggregator: Re-exporting all normalized sub-schemas 
// to keep them organized, maintainable, and fully compliant with Drizzle's loader.

export * from './users.ts';
export * from './wallets.ts';
export * from './deposit_addresses.ts';
export * from './deposits.ts';
export * from './withdrawals.ts';
export * from './transactions.ts';
export * from './vip.ts';
export * from './referrals.ts';
export * from './claims.ts';
export * from './income.ts';
export * from './salary.ts';
export * from './achievements.ts';
export * from './notifications.ts';
export * from './support.ts';
export * from './audit.ts';
export * from './activities.ts';
export * from './settings.ts';
export * from './sessions.ts';
export * from './team_commission_history.ts';
export * from './treasury.ts';
export * from './admin_security.ts';
export * from './tasks.ts';
