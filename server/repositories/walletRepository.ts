/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { eq, sql } from 'drizzle-orm';
import { db } from '../../src/db/index.ts';
import { wallets } from '../../src/db/schema.ts';

export class WalletRepository {
  /**
   * Find wallet by user ID
   */
  async findByUserId(userId: string) {
    try {
      const result = await db.select().from(wallets).where(eq(wallets.userId, userId));
      return result[0] || null;
    } catch (error) {
      console.error('Database query (findByUserId) failed:', error);
      throw new Error('Failed to retrieve wallet from database.');
    }
  }

  /**
   * Find wallet by wallet ID
   */
  async findById(id: string) {
    try {
      const result = await db.select().from(wallets).where(eq(wallets.id, id));
      return result[0] || null;
    } catch (error) {
      console.error('Database query (findById) failed:', error);
      throw new Error('Failed to retrieve wallet from database.');
    }
  }

  /**
   * Create a new wallet for a user
   */
  async createWallet(data: {
    userId: string;
    availableBalance?: string;
    lockedBalance?: string;
    principalBalance?: string;
    trialBalance?: string;
    trialExpiresAt?: Date | null;
    referralIncome?: string;
    dailyYield?: string;
    teamIncome?: string;
    incentiveIncome?: string;
  }) {
    try {
      const result = await db
        .insert(wallets)
        .values({
          userId: data.userId,
          availableBalance: data.availableBalance || '0.00000000',
          lockedBalance: data.lockedBalance || '0.00000000',
          principalBalance: data.principalBalance || '0.00000000',
          trialBalance: data.trialBalance || '0.00000000',
          trialExpiresAt: data.trialExpiresAt ?? null,
          referralIncome: data.referralIncome || '0.00000000',
          dailyYield: data.dailyYield || '0.00000000',
          teamIncome: data.teamIncome || '0.00000000',
          incentiveIncome: data.incentiveIncome || '0.00000000',
        })
        .returning();
      return result[0];
    } catch (error) {
      console.error('Database insertion (createWallet) failed:', error);
      throw new Error('Failed to initialize wallet in database.');
    }
  }

  /**
   * Update wallet balances directly (non-atomic overwriting, e.g., for admin adjustments or resets)
   */
  async updateBalances(
    id: string,
    balances: Partial<{
      availableBalance: string;
      lockedBalance: string;
      principalBalance: string;
      trialBalance: string;
      trialExpiresAt: Date | null;
      referralIncome: string;
      dailyYield: string;
      teamIncome: string;
      incentiveIncome: string;
      totalDeposited: string;
      totalWithdrawn: string;
      totalEarned: string;
    }>
  ) {
    try {
      const result = await db
        .update(wallets)
        .set({
          ...balances,
          updatedAt: new Date(),
        })
        .where(eq(wallets.id, id))
        .returning();
      return result[0] || null;
    } catch (error) {
      console.error('Database update (updateBalances) failed:', error);
      throw new Error('Failed to update wallet balances in database.');
    }
  }

  /**
   * Increment/Decrement wallet balances atomically to protect against race conditions.
   * Provide string representation of decimal increments (e.g. "10.00000000" or "-5.50000000").
   */
  async incrementBalances(
    id: string,
    deltas: Partial<{
      availableBalance: string;
      lockedBalance: string;
      principalBalance: string;
      trialBalance: string;
      referralIncome: string;
      dailyYield: string;
      teamIncome: string;
      incentiveIncome: string;
      totalDeposited: string;
      totalWithdrawn: string;
      totalEarned: string;
    }>
  ) {
    try {
      const updateFields: Record<string, any> = { updatedAt: new Date() };
      for (const [key, val] of Object.entries(deltas)) {
        if (val !== undefined && val !== null) {
          updateFields[key] = sql`${wallets[key as keyof typeof wallets]} + ${val}`;
        }
      }
      const result = await db
        .update(wallets)
        .set(updateFields)
        .where(eq(wallets.id, id))
        .returning();
      return result[0] || null;
    } catch (error) {
      console.error('Database update (incrementBalances) failed:', error);
      throw new Error('Failed to atomically update wallet balances.');
    }
  }
}

export const walletRepository = new WalletRepository();
export default walletRepository;
