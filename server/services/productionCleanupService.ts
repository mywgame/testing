/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { and, eq, isNotNull, ne, notInArray, sql } from 'drizzle-orm';
import { db } from '../../src/db/index.ts';
import {
  achievements,
  activityLogs,
  auditLogs,
  claims,
  depositAddresses,
  deposits,
  incomeHistory,
  notifications,
  referralIncomeHistory,
  referralRelationships,
  salaryHistory,
  sessions,
  supportMessages,
  supportTickets,
  sweepQueue,
  systemSettings,
  teamCommissionHistory,
  transactions,
  treasurySweepJobs,
  treasuryWallets,
  userSettings,
  users,
  vipHistory,
  vipStatus,
  wallets,
  withdrawals,
} from '../../src/db/schema.ts';

export interface ProductionCleanupPreview {
  usersToDelete: number;
  wallets: number;
  depositAddresses: number;
  deposits: number;
  withdrawals: number;
  transactions: number;
  totalRecordsToDelete: number;
  details: Record<string, number>;
  preserved: {
    superadmin: {
      id: string;
      uid: string;
      email: string;
      dsUserId: string;
    };
    systemSettings: number;
    treasuryWallets: number;
  };
}

export interface ProductionCleanupSummary extends ProductionCleanupPreview {
  success: true;
  checks: {
    superadminPreserved: boolean;
    treasuryConfigurationPreserved: boolean;
    systemSettingsPreserved: boolean;
    allTestUsersDeleted: boolean;
    databaseReadyForProduction: boolean;
  };
}

const CONFIRMATION_PHRASE = 'DELETE TEST USERS';

class ProductionCleanupService {
  private async countRows(executor: any, table: any, whereClause?: any): Promise<number> {
    let query = executor
      .select({ count: sql<number>`count(*)::int` })
      .from(table)
      .$dynamic();

    if (whereClause) {
      query = query.where(whereClause);
    }

    const result = await query;
    return Number(result[0]?.count || 0);
  }

  private async getSingleSuperadmin(executor: any) {
    const superadmins = await executor
      .select({
        id: users.id,
        uid: users.uid,
        email: users.email,
        dsUserId: users.userId,
      })
      .from(users)
      .where(eq(users.role, 'SUPERADMIN'));

    if (superadmins.length !== 1) {
      throw new Error(`Cleanup aborted: expected exactly one SUPERADMIN, found ${superadmins.length}.`);
    }

    return superadmins[0];
  }

  private async buildPreview(executor: any): Promise<ProductionCleanupPreview> {
    const superadmin = await this.getSingleSuperadmin(executor);
    const superadminId = superadmin.id;

    const details: Record<string, number> = {
      users: await this.countRows(executor, users, ne(users.role, 'SUPERADMIN')),
      wallets: await this.countRows(executor, wallets, ne(wallets.userId, superadminId)),
      depositAddresses: await this.countRows(executor, depositAddresses, ne(depositAddresses.userId, superadminId)),
      deposits: await this.countRows(executor, deposits),
      withdrawals: await this.countRows(executor, withdrawals),
      transactions: await this.countRows(executor, transactions),
      claims: await this.countRows(executor, claims),
      incomeHistory: await this.countRows(executor, incomeHistory),
      referralRelationships: await this.countRows(executor, referralRelationships),
      referralIncomeHistory: await this.countRows(executor, referralIncomeHistory),
      teamCommissionHistory: await this.countRows(executor, teamCommissionHistory),
      salaryHistory: await this.countRows(executor, salaryHistory),
      sessions: await this.countRows(executor, sessions),
      notifications: await this.countRows(executor, notifications),
      activityLogs: await this.countRows(executor, activityLogs),
      auditLogs: await this.countRows(executor, auditLogs),
      supportTickets: await this.countRows(executor, supportTickets),
      supportMessages: await this.countRows(executor, supportMessages),
      sweepQueue: await this.countRows(executor, sweepQueue),
      treasurySweepJobs: await this.countRows(executor, treasurySweepJobs),
      vipHistory: await this.countRows(executor, vipHistory),
      achievements: await this.countRows(executor, achievements),
      userSettings: await this.countRows(executor, userSettings, ne(userSettings.userId, superadminId)),
      vipStatus: await this.countRows(executor, vipStatus, ne(vipStatus.userId, superadminId)),
    };

    const totalRecordsToDelete = Object.values(details).reduce((sum, count) => sum + count, 0);

    return {
      usersToDelete: details.users,
      wallets: details.wallets,
      depositAddresses: details.depositAddresses,
      deposits: details.deposits,
      withdrawals: details.withdrawals,
      transactions: details.transactions,
      totalRecordsToDelete,
      details,
      preserved: {
        superadmin,
        systemSettings: await this.countRows(executor, systemSettings),
        treasuryWallets: await this.countRows(executor, treasuryWallets),
      },
    };
  }

  async getPreview(): Promise<ProductionCleanupPreview> {
    return this.buildPreview(db);
  }

  async deleteAllTestUsers(confirmation: string): Promise<ProductionCleanupSummary> {
    if (confirmation !== CONFIRMATION_PHRASE) {
      throw new Error(`Confirmation text must match "${CONFIRMATION_PHRASE}".`);
    }

    return db.transaction(async (tx) => {
      const preview = await this.buildPreview(tx);
      const superadminId = preview.preserved.superadmin.id;

      await tx.update(users).set({ parentReferralId: null }).where(isNotNull(users.parentReferralId));

      await tx.delete(teamCommissionHistory);
      await tx.delete(referralIncomeHistory);
      await tx.delete(referralRelationships);
      await tx.delete(salaryHistory);
      await tx.delete(incomeHistory);
      await tx.delete(sweepQueue);
      await tx.delete(treasurySweepJobs);
      await tx.delete(supportMessages);
      await tx.delete(supportTickets);
      await tx.delete(claims);
      await tx.delete(deposits);
      await tx.delete(withdrawals);
      await tx.delete(transactions);
      await tx.delete(vipHistory);
      await tx.delete(achievements);
      await tx.delete(notifications);
      await tx.delete(activityLogs);
      await tx.delete(auditLogs);
      await tx.delete(sessions);

      await tx
        .update(depositAddresses)
        .set({ rotatedBy: null })
        .where(and(isNotNull(depositAddresses.rotatedBy), ne(depositAddresses.rotatedBy, superadminId)));

      const keptAddressRows = await tx
        .select({ id: depositAddresses.id })
        .from(depositAddresses)
        .where(eq(depositAddresses.userId, superadminId));
      const keptAddressIds = keptAddressRows.map((row) => row.id);

      if (keptAddressIds.length > 0) {
        await tx
          .update(depositAddresses)
          .set({ replacedByAddressId: null })
          .where(
            and(
              eq(depositAddresses.userId, superadminId),
              isNotNull(depositAddresses.replacedByAddressId),
              notInArray(depositAddresses.replacedByAddressId, keptAddressIds)
            )
          );
      }

      await tx.delete(depositAddresses).where(ne(depositAddresses.userId, superadminId));
      await tx.delete(userSettings).where(ne(userSettings.userId, superadminId));
      await tx.delete(vipStatus).where(ne(vipStatus.userId, superadminId));
      await tx.delete(wallets).where(ne(wallets.userId, superadminId));
      await tx.delete(users).where(ne(users.role, 'SUPERADMIN'));

      const remainingNonSuperadminUsers = await this.countRows(tx, users, ne(users.role, 'SUPERADMIN'));
      const remainingSuperadminUsers = await this.countRows(tx, users, eq(users.role, 'SUPERADMIN'));
      const remainingSystemSettings = await this.countRows(tx, systemSettings);
      const remainingTreasuryWallets = await this.countRows(tx, treasuryWallets);

      return {
        ...preview,
        success: true,
        checks: {
          superadminPreserved: remainingSuperadminUsers === 1,
          treasuryConfigurationPreserved: remainingTreasuryWallets === preview.preserved.treasuryWallets,
          systemSettingsPreserved: remainingSystemSettings === preview.preserved.systemSettings,
          allTestUsersDeleted: remainingNonSuperadminUsers === 0,
          databaseReadyForProduction:
            remainingSuperadminUsers === 1 &&
            remainingNonSuperadminUsers === 0 &&
            remainingTreasuryWallets === preview.preserved.treasuryWallets &&
            remainingSystemSettings === preview.preserved.systemSettings,
        },
      };
    });
  }
}

export const productionCleanupService = new ProductionCleanupService();
export default productionCleanupService;
