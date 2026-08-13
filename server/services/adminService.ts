/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { userRepository } from '../repositories/userRepository.ts';
import { walletRepository } from '../repositories/walletRepository.ts';
import { transactionRepository } from '../repositories/transactionRepository.ts';
import { auditRepository } from '../repositories/auditRepository.ts';
import { notificationRepository } from '../repositories/notificationRepository.ts';
import { supportRepository } from '../repositories/supportRepository.ts';
import { depositRepository } from '../repositories/depositRepository.ts';
import { withdrawalRepository } from '../repositories/withdrawalRepository.ts';
import { vipRepository } from '../repositories/vipRepository.ts';
import { depositAddressRepository } from '../repositories/depositAddressRepository.ts';
import { settingsRepository } from '../repositories/settingsRepository.ts';
import { withdrawalService } from './withdrawalService.ts';
import { depositService } from './depositService.ts';
import { notificationService } from './notificationService.ts';
import { vipService } from './vipService.ts';
import { referralService } from './referralService.ts';
import { settingsService } from './settingsService.ts';
import { salaryService } from './salaryService.ts';
import { addressService } from '../blockchain/services/AddressService.ts';
import { SecurityLogger } from '../utils/securityLogger.ts';
import { db } from '../../src/db/index.ts';
import { users, wallets, deposits, withdrawals, supportTickets, activityLogs, vipStatus, sessions } from '../../src/db/schema.ts';
import { eq, like, or, and, desc, asc, sql } from 'drizzle-orm';

/**
 * BUSINESS RULE — Single Source of Truth:
 * AdminService NEVER re-implements Withdrawal or VIP business logic.
 * - Withdrawal approve/reject is owned EXCLUSIVELY by WithdrawalService.
 * - VIP recalculation is owned EXCLUSIVELY by VipService.
 * AdminService only adds the admin-specific authorization/audit wrapper around them.
 */

export class AdminService {
  /**
   * Fetch paginated, filtered and sorted list of admin users
   */
  async getAdminUsersPaginated(options: {
    search?: string;
    filter?: string;
    sortBy?: string;
    limit: number;
    offset: number;
  }) {
    const conditions = [];

    if (options.search) {
      const pattern = `%${options.search}%`;
      conditions.push(
        or(
          like(users.name, pattern),
          like(users.email, pattern),
          like(users.phone, pattern),
          like(users.userId, pattern),
          like(users.uid, pattern)
        )
      );
    }

    if (options.filter && options.filter !== 'All') {
      if (options.filter === 'Active') {
        conditions.push(eq(users.status, 'ACTIVE'));
      } else if (options.filter === 'Suspended') {
        conditions.push(eq(users.status, 'SUSPENDED'));
      } else if (options.filter.startsWith('VIP')) {
        conditions.push(eq(vipStatus.tier, options.filter));
      }
    }

    let orderByClause;
    switch (options.sortBy) {
      case 'HighestBalance':
        orderByClause = desc(wallets.availableBalance);
        break;
      case 'LowestBalance':
        orderByClause = asc(wallets.availableBalance);
        break;
      case 'HighestReferrals':
        orderByClause = desc(vipStatus.levelAValidCount);
        break;
      case 'HighestTeamSize':
        orderByClause = desc(vipStatus.teamTotalCount);
        break;
      case 'Newest':
        orderByClause = desc(users.createdAt);
        break;
      case 'Oldest':
        orderByClause = asc(users.createdAt);
        break;
      default:
        orderByClause = desc(users.createdAt);
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Total Count query
    const countResult = await db
      .select({ count: sql<number>`count(${users.id})::int` })
      .from(users)
      .leftJoin(vipStatus, eq(vipStatus.userId, users.id))
      .where(whereClause);

    const totalCount = countResult[0]?.count || 0;

    // Paginated list query
    const results = await db
      .select({
        user: users,
        wallet: wallets,
        vip: vipStatus,
      })
      .from(users)
      .leftJoin(wallets, eq(wallets.userId, users.id))
      .leftJoin(vipStatus, eq(vipStatus.userId, users.id))
      .where(whereClause)
      .orderBy(orderByClause)
      .limit(options.limit)
      .offset(options.offset);

    const mappedUsers = [];
    for (const r of results) {
      const u = r.user;
      const wallet = r.wallet;
      const vip = r.vip;

      const descendants = await referralService.getDownlineDescendants(u.id);
      const levelA = descendants.filter(d => d.referralLevel === 1).length;
      const levelB = descendants.filter(d => d.referralLevel === 2).length;
      const levelC = descendants.filter(d => d.referralLevel === 3).length;
      const levelD = descendants.filter(d => d.referralLevel === 4).length;

      mappedUsers.push({
        id: u.uid, // mapped to uid so frontend actions target uid
        userId: u.userId,
        name: u.name || '',
        email: u.email,
        mobile: u.phone || '',
        rank: vip?.tier || 'VIP1',
        balance: wallet ? `$${parseFloat(wallet.availableBalance).toFixed(2)}` : '$0.00',
        levelA,
        levelB,
        levelC,
        levelD,
        status: u.status === 'ACTIVE' ? 'Active' : 'Suspended',
        joined: new Date(u.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        adminNotes: u.name ? `Administrative profile for ${u.name}.` : 'No administrative notes.',
      });
    }

    return {
      users: mappedUsers,
      pagination: {
        total: totalCount,
        page: Math.floor(options.offset / options.limit) + 1,
        limit: options.limit,
      },
    };
  }

  /**
   * Get complete details of a single user
   */
  async getUserProfileDetail(targetUid: string) {
    const user = await userRepository.findByUid(targetUid);
    if (!user) {
      throw new Error(`User not found with UID: ${targetUid}`);
    }

    const wallet = await walletRepository.findByUserId(user.id);
    const vip = await db.select().from(vipStatus).where(eq(vipStatus.userId, user.id));
    const descendants = await referralService.getDownlineDescendants(user.id);

    // Blockchain deposit wallets — only the currently ACTIVE address per network is
    // returned here (matches Member Profile Card display requirements). Full history
    // is available via getUserDepositAddressHistory().
    const activeDepositAddresses = await depositAddressRepository.findByUserId(user.id);

    // Withdrawal destination addresses — read-only, already stored per-network in
    // user_settings (JSON). No new table needed; this is purely a read.
    const userSettings = await settingsRepository.findUserSettingsByUserId(user.id);
    let withdrawalAddresses: Record<string, string[]> = {};
    if (userSettings?.withdrawalAddresses) {
      try {
        withdrawalAddresses = JSON.parse(userSettings.withdrawalAddresses);
      } catch {
        withdrawalAddresses = {};
      }
    }

    return {
      id: user.uid,
      userId: user.userId,
      name: user.name || '',
      email: user.email,
      mobile: user.phone || '',
      rank: vip[0]?.tier || 'VIP1',
      balance: wallet ? `$${parseFloat(wallet.availableBalance).toFixed(2)}` : '$0.00',
      status: user.status === 'ACTIVE' ? 'Active' : 'Suspended',
      joined: new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      walletDetails: wallet ? {
        availableBalance: parseFloat(wallet.availableBalance),
        lockedBalance: parseFloat(wallet.lockedBalance),
        principalBalance: parseFloat(wallet.principalBalance),
        trialBalance: parseFloat(wallet.trialBalance),
        referralIncome: parseFloat(wallet.referralIncome),
        dailyYield: parseFloat(wallet.dailyYield),
        teamIncome: parseFloat(wallet.teamIncome),
        incentiveIncome: parseFloat(wallet.incentiveIncome),
      } : null,
      teamCounts: {
        levelA: descendants.filter(d => d.referralLevel === 1).length,
        levelB: descendants.filter(d => d.referralLevel === 2).length,
        levelC: descendants.filter(d => d.referralLevel === 3).length,
        levelD: descendants.filter(d => d.referralLevel === 4).length,
        total: descendants.length,
      },
      depositAddresses: activeDepositAddresses.map(a => ({
        network: a.network,
        address: a.address,
      })),
      withdrawalAddresses,
    };
  }

  /**
   * Get the full, permanent deposit-address history (active + archived) for a user on a
   * given network — powers the "View Address History" modal. Archived addresses are
   * never deleted, so this always reflects every address ever issued.
   */
  async getUserDepositAddressHistory(targetUid: string, network: string) {
    const user = await userRepository.findByUid(targetUid);
    if (!user) {
      throw new Error(`User not found with UID: ${targetUid}`);
    }
    const history = await depositAddressRepository.findHistoryByUserAndNetwork(user.id, network);
    return history.map(a => ({
      id: a.id,
      network: a.network,
      address: a.address,
      derivationIndex: a.derivationIndex,
      isActive: a.isActive,
      createdAt: a.createdAt,
      rotatedAt: a.rotatedAt,
      rotationReason: a.rotationReason,
    }));
  }

  /**
   * Rotate a user's deposit address on a given network (admin action). Generates a new
   * HD wallet address the exact same way as new-user registration (AddressService is the
   * single owning service for this — no duplicate blockchain logic here), archives the
   * previous address (never deleted), and writes the audit log entry atomically in the
   * SAME database transaction as the address swap — if the audit write fails, the
   * rotation itself rolls back too, so there is never a partial update.
   */
  async rotateUserDepositAddress(
    adminUid: string,
    adminEmail: string,
    targetUid: string,
    network: string
  ) {
    const targetUser = await userRepository.findByUid(targetUid);
    if (!targetUser) {
      throw new Error(`User not found with UID: ${targetUid}`);
    }
    const admin = await userRepository.findByUid(adminUid);
    if (!admin) {
      throw new Error(`Admin not found with UID: ${adminUid}`);
    }

    const reason = 'Manual Admin Rotation';

    const { previousAddress, newAddress } = await addressService.rotateDepositAddress(
      targetUser.id,
      network,
      admin.id,
      reason,
      async (tx) => {
        // Runs INSIDE the same transaction as the address insert + archive above —
        // a failure here rolls back the entire rotation, per the "no partial updates"
        // requirement.
        await auditRepository.createAuditLog(
          {
            actorUid: adminUid,
            userId: targetUser.id,
            action: 'ADMIN_ROTATED_DEPOSIT_ADDRESS',
            resource: `deposit_addresses/${targetUser.id}/${network}`,
            oldValue: JSON.stringify({
              adminId: adminUid,
              adminEmail,
              userId: targetUser.id,
              dsUserId: targetUser.userId,
              network,
              oldAddress: previousAddress.address,
              reason,
            }),
            newValue: JSON.stringify({
              newAddress: newAddress.address,
              timestamp: new Date().toISOString(),
            }),
          },
          tx
        );
      }
    );

    return {
      network,
      oldAddress: previousAddress.address,
      newAddress: newAddress.address,
    };
  }

  /**
   * Update editable fields of user's profile
   */
  async updateAdminUserProfile(
    adminUid: string,
    targetUid: string,
    fields: {
      name?: string;
      email?: string;
      phone?: string;
      status?: string;
    },
    ipAddress?: string | null,
    userAgent?: string | null
  ) {
    const targetUser = await userRepository.findByUid(targetUid);
    if (!targetUser) {
      throw new Error(`User not found with UID: ${targetUid}`);
    }

    const updates: any = { updatedAt: new Date() };
    if (fields.name !== undefined) updates.name = fields.name;
    if (fields.email !== undefined) updates.email = fields.email;
    if (fields.phone !== undefined) updates.phone = fields.phone;
    if (fields.status !== undefined) {
      updates.status = fields.status === 'Suspended' ? 'SUSPENDED' : 'ACTIVE';
    }

    const updatedUser = await userRepository.updateUserProfile(targetUid, updates);

    // Write audit record
    await auditRepository.createAuditLog({
      actorUid: adminUid,
      userId: targetUser.id,
      action: 'ADMIN_PROFILE_UPDATE',
      resource: `users/${targetUid}`,
      oldValue: JSON.stringify({
        name: targetUser.name,
        email: targetUser.email,
        phone: targetUser.phone,
        status: targetUser.status,
      }),
      newValue: JSON.stringify(updates),
    });

    return updatedUser;
  }

  /**
   * Get user transactions history
   */
  async getUserTransactions(targetUid: string, options?: { limit?: number; offset?: number }) {
    const user = await userRepository.findByUid(targetUid);
    if (!user) {
      throw new Error(`User not found with UID: ${targetUid}`);
    }
    const txs = await transactionRepository.findByUserId(user.id, options);
    return txs.map(t => ({
      id: t.id,
      type: t.type,
      amount: `$${parseFloat(t.amount).toFixed(2)}`,
      status: t.status,
      date: new Date(t.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
      description: t.description,
    }));
  }

  /**
   * Get user deposit history
   */
  async getUserDeposits(targetUid: string, options?: { limit?: number; offset?: number }) {
    const user = await userRepository.findByUid(targetUid);
    if (!user) {
      throw new Error(`User not found with UID: ${targetUid}`);
    }
    const deps = await depositRepository.findByUserId(user.id, options);
    return deps.map(d => ({
      id: d.id,
      amount: `$${parseFloat(d.amount).toFixed(2)}`,
      method: d.network || 'USDT',
      txHash: d.txHash || 'N/A',
      date: new Date(d.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
      status: d.status === 'COMPLETED' ? 'Completed' : d.status === 'PENDING' ? 'Pending' : 'Rejected',
    }));
  }

  /**
   * Get user withdrawal history
   */
  async getUserWithdrawals(targetUid: string, options?: { limit?: number; offset?: number }) {
    const user = await userRepository.findByUid(targetUid);
    if (!user) {
      throw new Error(`User not found with UID: ${targetUid}`);
    }
    const withs = await withdrawalRepository.findByUserId(user.id, options);
    return withs.map(w => ({
      id: w.id,
      amount: `$${parseFloat(w.amount).toFixed(2)}`,
      wallet: w.walletAddress,
      date: new Date(w.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
      status: w.status === 'COMPLETED' ? 'Approved' : w.status === 'PENDING' ? 'Pending' : 'Rejected',
    }));
  }

  /**
   * Get user audit history
   */
  async getUserAudits(targetUid: string, options?: { limit?: number; offset?: number }) {
    const user = await userRepository.findByUid(targetUid);
    if (!user) {
      throw new Error(`User not found with UID: ${targetUid}`);
    }
    const audits = await auditRepository.findByUserId(user.id, options);
    return audits.map(a => ({
      action: a.action,
      admin: a.actorUid === 'SYSTEM' ? 'System' : 'Admin',
      ip: '127.0.0.1', // Standard fallback IP
      time: new Date(a.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
      module: a.resource,
    }));
  }

  /**
   * Get user team network list of Level A, B, C, D descendants
   */
  async getUserTeamNetwork(targetUid: string) {
    const user = await userRepository.findByUid(targetUid);
    if (!user) {
      throw new Error(`User not found with UID: ${targetUid}`);
    }
    const descendants = await referralService.getDownlineDescendants(user.id);
    const list = [];
    for (const d of descendants) {
      const u = await userRepository.findById(d.childId);
      if (u) {
        const wallet = await walletRepository.findByUserId(u.id);
        const vip = await db.select().from(vipStatus).where(eq(vipStatus.userId, u.id));
        list.push({
          id: u.uid,
          userId: u.userId,
          name: u.name || 'Anonymous',
          email: u.email,
          level: d.referralLevel === 1 ? 'A' : d.referralLevel === 2 ? 'B' : d.referralLevel === 3 ? 'C' : 'D',
          vipTier: vip[0]?.tier || 'VIP1',
          walletBalance: wallet ? parseFloat(wallet.availableBalance) : 0,
          joined: new Date(u.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        });
      }
    }
    return list;
  }

  /**
   * Adjust user wallet balances atomically (Manual Admin Ledger Adjustment)
   */
  async adjustWalletBalance(
    userId: string,
    deltas: {
      availableBalance?: string;
      lockedBalance?: string;
      principalBalance?: string;
      trialBalance?: string;
      referralIncome?: string;
      dailyYield?: string;
      teamIncome?: string;
      incentiveIncome?: string;
    },
    memo: string,
    adminUid: string
  ) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new Error(`User not found with ID: ${userId}`);
    }

    const wallet = await walletRepository.findByUserId(userId);
    if (!wallet) {
      throw new Error(`Wallet not found for user ${userId}`);
    }

    const beforeBalance = parseFloat(wallet.availableBalance);
    const availableDelta = parseFloat(deltas.availableBalance || '0.0');
    const afterBalance = beforeBalance + availableDelta;

    // Apply atomic adjustments
    const updatedWallet = await walletRepository.incrementBalances(wallet.id, deltas);

    // Save adjustment inside transaction ledger
    const txn = await transactionRepository.createTransaction({
      userId,
      walletId: wallet.id,
      type: 'ADMIN_ADJUST',
      referenceId: wallet.id,
      status: 'COMPLETED',
      description: memo || 'Administrative manual account balance adjustment.',
      amount: availableDelta.toFixed(8),
      balanceBefore: beforeBalance.toFixed(8),
      balanceAfter: afterBalance.toFixed(8),
      createdBy: adminUid,
    });

    // Write audit record
    await auditRepository.createAuditLog({
      actorUid: adminUid,
      userId,
      action: 'WALLET_MANUAL_ADJUSTMENT',
      resource: `wallets/${wallet.id}`,
      oldValue: JSON.stringify(wallet),
      newValue: JSON.stringify(updatedWallet),
    });

    // Send notification
    await notificationRepository.createNotification({
      userId,
      message: `Your account balance was adjusted by our support team: "${memo}"`,
      priority: 'MEDIUM',
    });

    // Recalculate VIP tier — VipService is the single source of truth for VIP logic.
    // Business Logic Spec Section 6: VIP recalculates after Wallet Balance Change.
    await vipService.recalculateVip(userId);

    return updatedWallet;
  }

  /**
   * Update a user's account active status (ACTIVE, SUSPENDED, PENDING_VERIFICATION)
   */
  async updateUserStatus(userId: string, status: string, adminUid: string, reason: string) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new Error(`User not found with ID: ${userId}`);
    }

    // Since UserRepository.updateUserProfile only types Partial<{ role: string }> but updates the table,
    // we safely cast parameters to update the status field of the users table.
    const updatedUser = await userRepository.updateUserProfile(user.uid, { status } as any);

    await auditRepository.createAuditLog({
      actorUid: adminUid,
      userId,
      action: 'USER_STATUS_CHANGE',
      resource: `users/${userId}`,
      oldValue: user.status,
      newValue: status,
    });

    await notificationRepository.createNotification({
      userId,
      message: `Your account status has been updated to ${status}. Reason: ${reason}`,
      priority: 'HIGH',
    });

    return updatedUser;
  }

  /**
   * Retrieve all platform deposits (paginated, newest first)
   */
  async getAllDeposits(options?: { status?: string; limit?: number; offset?: number }) {
    const deps = await depositRepository.findAll(options);
    const result = [];
    for (const d of deps) {
      let userName = 'Unknown User';
      if (d.userId) {
        const u = await userRepository.findById(d.userId);
        if (u) {
          userName = u.name || u.email || u.uid;
        }
      }
      result.push({
        id: d.id,
        user: userName,
        amount: `$${parseFloat(d.amount).toFixed(2)}`,
        method: d.network || 'USDT',
        txHash: d.txHash || 'N/A',
        date: new Date(d.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
        status: d.status === 'COMPLETED' ? 'Completed' : d.status === 'PENDING' ? 'Pending' : 'Rejected',
      });
    }
    return result;
  }

  /**
   * Administrative completion / approval of deposit
   */
  async approveDeposit(depositId: string, adminUid: string, txHash?: string) {
    return depositService.processSuccessfulDeposit(depositId, txHash, adminUid);
  }

  /**
   * Administrative rejection of deposit
   */
  async rejectDeposit(depositId: string, adminUid: string, notes?: string) {
    const deposit = await depositRepository.findById(depositId);
    if (!deposit) {
      throw new Error(`Deposit record not found for ID: ${depositId}`);
    }
    if (deposit.status !== 'PENDING') {
      throw new Error(`Deposit has already been processed with status: ${deposit.status}`);
    }
    const updated = await depositRepository.updateStatus(depositId, 'REJECTED', {
      adminNotes: notes || `Rejected by admin ${adminUid}`,
    });

    await auditRepository.createAuditLog({
      actorUid: adminUid,
      userId: deposit.userId,
      action: 'DEPOSIT_REJECTED',
      resource: `deposits/${depositId}`,
      oldValue: 'PENDING',
      newValue: 'REJECTED',
    });

    await notificationService.createStructuredNotification(deposit.userId, {
      title: 'Deposit Rejected',
      description: `Your deposit request for ${deposit.amount} USDT has been rejected. Reason: ${notes || 'Administrative review'}`,
      icon: 'XCircle',
      type: 'deposit',
      priority: 'HIGH',
    });

    return updated;
  }

  /**
   * Retrieve all platform withdrawals (paginated, newest first)
   */
  async getAllWithdrawals(options?: { status?: string; limit?: number; offset?: number }) {
    const withs = await withdrawalRepository.findAll(options);
    const result = [];
    for (const w of withs) {
      let userName = 'Unknown User';
      if (w.userId) {
        const u = await userRepository.findById(w.userId);
        if (u) {
          userName = u.name || u.email || u.uid;
        }
      }
      result.push({
        id: w.id,
        user: userName,
        amount: `$${parseFloat(w.amount).toFixed(2)}`,
        wallet: w.walletAddress,
        date: new Date(w.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
        status: w.status === 'COMPLETED' ? 'Approved' : w.status === 'PENDING' ? 'Pending' : 'Rejected',
      });
    }
    return result;
  }

  /**
   * Administrative Approval of pending Withdrawals.
   * Delegates ALL ledger/wallet/VIP logic to WithdrawalService (single source of truth)
   * and only adds the admin-specific audit trail on top.
   */
  async approveWithdrawal(withdrawalId: string, adminUid: string, notes?: string, manualTxHash?: string) {
    const updatedW = await withdrawalService.processWithdrawalApproval(withdrawalId, adminUid, notes, manualTxHash);

    await auditRepository.createAuditLog({
      actorUid: adminUid,
      userId: updatedW.userId,
      action: 'WITHDRAWAL_APPROVAL',
      resource: `withdrawals/${updatedW.id}`,
      newValue: notes ? `APPROVED — ${notes}` : 'APPROVED',
    });

    return updatedW;
  }

  /**
   * Administrative Rejection of pending Withdrawals.
   * Delegates ALL ledger/wallet logic to WithdrawalService (single source of truth)
   * and only adds the admin-specific audit trail on top.
   */
  async rejectWithdrawal(withdrawalId: string, adminUid: string, notes: string) {
    const updatedW = await withdrawalService.rejectWithdrawal(withdrawalId, notes, adminUid);

    await auditRepository.createAuditLog({
      actorUid: adminUid,
      userId: updatedW.userId,
      action: 'WITHDRAWAL_REJECTION',
      resource: `withdrawals/${updatedW.id}`,
      newValue: 'REJECTED',
    });

    return updatedW;
  }

  /**
   * Retrieve platform system wide audit logs
   */
  async getSystemAuditLogs(options?: { limit?: number; offset?: number; action?: string }) {
    const logs = await auditRepository.findAll(options);
    const result = [];
    for (const a of logs) {
      let adminLabel = 'System';
      if (a.actorUid && a.actorUid !== 'SYSTEM') {
        const u = await userRepository.findByUid(a.actorUid);
        adminLabel = u ? (u.name || u.email || a.actorUid) : a.actorUid;
      }

      let module = 'Settings';
      if (a.resource?.includes('user')) module = 'Users';
      else if (a.resource?.includes('deposit')) module = 'Deposits';
      else if (a.resource?.includes('withdrawal')) module = 'Withdrawals';

      result.push({
        id: a.id,
        action: a.action,
        admin: adminLabel,
        ip: a.ipAddress || '127.0.0.1',
        time: new Date(a.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
        module,
      });
    }
    return result;
  }

  /**
   * Fetch all registered users in the platform (paginated, newest first).
   */
  async getAllUsers(options?: { limit?: number; offset?: number }) {
    return userRepository.findAll(options);
  }

  /**
   * Retrieve all platform support tickets
   */
  async getAllSupportTickets(options?: { status?: string; priority?: string; limit?: number; offset?: number }) {
    return supportRepository.findAll(options);
  }

  /**
   * Retrieve aggregated admin dashboard statistics and trends (Single Source of Truth)
   */
  async getAdminDashboardOverview() {
    // 1. Fetch total registered users
    const allUsers = await db.select().from(users);
    const totalUsers = allUsers.length;

    // 2. Fetch active users (status = 'ACTIVE')
    const activeUsers = allUsers.filter(u => u.status === 'ACTIVE').length;

    // 3. Fetch suspended users
    const suspendedUsers = allUsers.filter(u => u.status === 'SUSPENDED').length;

    // 4. Calculate Platform Liquidity Pool (sum of available + locked + principal balances)
    const allWallets = await db.select().from(wallets);
    let totalLiquidity = 0;
    for (const w of allWallets) {
      totalLiquidity += parseFloat(w.availableBalance) + parseFloat(w.lockedBalance) + parseFloat(w.principalBalance);
    }

    // 5. Calculate Total Inbound Deposits (sum of amount for status = 'COMPLETED')
    const allDeposits = await db.select().from(deposits);
    let totalInboundDeposits = 0;
    for (const d of allDeposits) {
      if (d.status === 'COMPLETED') {
        totalInboundDeposits += parseFloat(d.amount);
      }
    }

    // 6. Counts for operational highlight queues
    const allWithdrawals = await db.select().from(withdrawals);
    const pendingWithdrawalsCount = allWithdrawals.filter(w => w.status === 'PENDING').length;
    const pendingDepositsCount = allDeposits.filter(d => d.status === 'PENDING').length;

    const allTickets = await db.select().from(supportTickets);
    const activeSupportTicketsCount = allTickets.filter(t => t.status === 'OPEN').length;

    const allActivityLogs = await db.select().from(activityLogs);
    const securityThreatsCount = allActivityLogs.filter(
      l => l.event === 'SECURITY_EVENT' || l.status === 'FAILED'
    ).length;

    // 7. Dynamic aggregations for charts (User Growth, Deposits vs Withdrawals, Revenue Trends)
    // We can generate monthly trends for the last 6 months
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    // Let's find the last 6 months' start dates
    const now = new Date();
    const last6Months = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      last6Months.push({
        year: d.getFullYear(),
        month: d.getMonth(),
        label: `${monthNames[d.getMonth()]} ${d.getFullYear().toString().slice(-2)}`,
        usersCount: 0,
        depositsSum: 0,
        withdrawalsSum: 0,
        revenueSum: 0,
      });
    }

    // Allocate user registrations to months
    for (const u of allUsers) {
      const uDate = new Date(u.createdAt);
      for (const m of last6Months) {
        if (uDate.getFullYear() === m.year && uDate.getMonth() === m.month) {
          m.usersCount++;
        }
      }
    }

    // Cumulative registered user growth trend
    // Find the number of users registered BEFORE the start of our 6-month window
    const firstMonthDate = new Date(last6Months[0].year, last6Months[0].month, 1);
    let cumulativeUsers = allUsers.filter(u => new Date(u.createdAt) < firstMonthDate).length;

    const userGrowthTrend = last6Months.map(m => {
      cumulativeUsers += m.usersCount;
      return {
        month: m.label,
        users: cumulativeUsers,
      };
    });

    // Allocate completed deposits and withdrawals
    for (const d of allDeposits) {
      if (d.status === 'COMPLETED') {
        const dDate = new Date(d.createdAt);
        for (const m of last6Months) {
          if (dDate.getFullYear() === m.year && dDate.getMonth() === m.month) {
            m.depositsSum += parseFloat(d.amount);
          }
        }
      }
    }

    for (const w of allWithdrawals) {
      if (w.status === 'COMPLETED') {
        const wDate = new Date(w.createdAt);
        for (const m of last6Months) {
          if (wDate.getFullYear() === m.year && wDate.getMonth() === m.month) {
            m.withdrawalsSum += parseFloat(w.amount);
          }
        }
      }
    }

    const txFlowTrend = last6Months.map(m => ({
      month: m.label,
      deposits: m.depositsSum,
      withdrawals: m.withdrawalsSum,
    }));

    // Revenue trend / Platform margins
    for (const w of allWithdrawals) {
      if (w.status === 'COMPLETED') {
        const wDate = new Date(w.createdAt);
        for (const m of last6Months) {
          if (wDate.getFullYear() === m.year && wDate.getMonth() === m.month) {
            m.revenueSum += parseFloat(w.fee || '0');
          }
        }
      }
    }

    const revenueTrend = last6Months.map(m => ({
      month: m.label,
      revenue: m.revenueSum,
    }));

    return {
      stats: {
        totalUsers,
        activeUsers,
        liquidityPool: totalLiquidity,
        totalInboundDeposits,
      },
      queues: {
        pendingWithdrawals: pendingWithdrawalsCount,
        pendingDeposits: pendingDepositsCount,
        activeSupportTickets: activeSupportTicketsCount,
        securityThreats: securityThreatsCount,
        suspendedUsers: suspendedUsers,
      },
      charts: {
        userGrowth: userGrowthTrend,
        txFlow: txFlowTrend,
        revenue: revenueTrend,
      }
    };
  }

  /**
   * Fetch all system settings for Admin Settings module
   */
  async getSystemSettings() {
    return settingsService.getSystemSettings();
  }

  /**
   * Update a system setting by key (e.g., TRIAL_FUND_AMOUNT, TRIAL_FUND_DURATION_DAYS)
   */
  async updateSystemSetting(key: string, value: string, adminUid: string) {
    const setting = await settingsService.updateSystemSetting(key, value, adminUid);
    await SecurityLogger.logAudit({
      actorUid: adminUid,
      action: 'UPDATE_SETTING',
      resource: `system_settings/${key}`,
      oldValue: '',
      newValue: JSON.stringify({ key, value }),
    });
    return setting;
  }

  /**
   * Create a new user account as Admin
   */
  async createAdminUser(userData: {
    name: string;
    email: string;
    phone?: string;
    rank?: string;
    initialBalance?: number;
    referralCode?: string;
  }, adminUid: string) {
    const newUser = await userRepository.createUser({
      name: userData.name,
      email: userData.email,
      phone: userData.phone || '',
      passwordHash: 'PBKDF2_PLACEHOLDER_PASS',
      status: 'ACTIVE',
      role: 'USER',
    });

    const wallet = await walletRepository.createWallet(newUser.id);
    await vipRepository.createVipStatus({
      userId: newUser.id,
      tier: userData.rank || 'VIP1',
    });

    if (userData.initialBalance && userData.initialBalance > 0) {
      await walletRepository.incrementBalances(wallet.id, {
        availableBalance: userData.initialBalance.toFixed(8),
        totalDeposited: userData.initialBalance.toFixed(8),
      });
    }

    await SecurityLogger.logAudit({
      actorUid: adminUid,
      action: 'ADMIN_CREATE_USER',
      resource: `users/${newUser.id}`,
      oldValue: '',
      newValue: JSON.stringify({ name: userData.name, email: userData.email, rank: userData.rank }),
    });

    return newUser;
  }

  /**
   * VIP Module: Retrieve matrix & tiers
   */
  async getVipTiers() {
    const stored = await settingsService.getSystemSetting('VIP_TIERS_MATRIX', '');
    let tiers;
    if (stored) {
      try {
        tiers = JSON.parse(stored);
      } catch (e) {
        tiers = null;
      }
    }

    if (!tiers) {
      const defaultMatrix = vipService.getVipMatrix();
      tiers = defaultMatrix.map(m => ({
        tier: m.tier,
        minBalance: `$${m.minBalance.toLocaleString()}`,
        levelA: m.levelA,
        levelBCD: m.levelBCD,
        teamTotal: m.teamTotal,
        dpy: `${(m.dpy * 100).toFixed(2)}%`,
        activeUsersCount: 0,
        monthlyYieldEstimate: `$${(m.minBalance * m.dpy * 30).toFixed(0)}`
      }));
    }

    // Enrich with live counts from DB
    const allVipStatuses = await db.select({ tier: vipStatus.tier, count: sql<number>`count(*)::int` }).from(vipStatus).groupBy(vipStatus.tier);
    const countsMap: Record<string, number> = {};
    for (const r of allVipStatuses) {
      countsMap[r.tier] = r.count;
    }

    const enrichedTiers = tiers.map((t: any) => ({
      ...t,
      activeUsersCount: countsMap[t.tier] || t.activeUsersCount || 0
    }));

    return enrichedTiers;
  }

  /**
   * VIP Module: Update tier configuration
   */
  async updateVipTier(tierName: string, updatedTier: any, adminUid: string) {
    const tiers = await this.getVipTiers();
    const updatedList = tiers.map((t: any) => t.tier === tierName ? { ...t, ...updatedTier } : t);
    await settingsService.updateSystemSetting('VIP_TIERS_MATRIX', JSON.stringify(updatedList), adminUid);

    await SecurityLogger.logAudit({
      actorUid: adminUid,
      action: 'UPDATE_VIP_TIER',
      resource: `vip_tiers/${tierName}`,
      oldValue: '',
      newValue: JSON.stringify(updatedTier),
    });

    return updatedList;
  }

  /**
   * Security Module: Get overview
   */
  async getSecurityOverview() {
    const storedSwitches = await settingsService.getSystemSetting('SECURITY_SWITCHES', '');
    let switches = { freezeWithdrawals: false, freezeRegistrations: false, enforce2FA: true };
    if (storedSwitches) {
      try { switches = JSON.parse(storedSwitches); } catch (e) {}
    }

    const storedAlerts = await settingsService.getSystemSetting('SECURITY_ALERTS', '');
    let alerts = [];
    if (storedAlerts) {
      try { alerts = JSON.parse(storedAlerts); } catch (e) {}
    }

    // Active sessions from DB
    const activeSessionsRaw = await db.select({
      id: sessions.id,
      device: sessions.device,
      browser: sessions.browser,
      ipAddress: sessions.ipAddress,
      lastActivity: sessions.lastActivity,
      userId: sessions.userId,
      revoked: sessions.revoked,
      userName: users.name,
      userRole: users.role,
    })
    .from(sessions)
    .innerJoin(users, eq(users.id, sessions.userId))
    .where(eq(sessions.revoked, false))
    .orderBy(desc(sessions.lastActivity))
    .limit(20);

    const activeSessions = activeSessionsRaw.map(s => ({
      id: s.id,
      ip: s.ipAddress || '127.0.0.1',
      location: 'Verified System Ingress',
      device: `${s.browser || 'Browser'} / ${s.device || 'Workstation'}`,
      adminName: `${s.userName} (${s.userRole})`,
      sessionTime: new Date(s.lastActivity).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'Active'
    }));

    return { switches, activeSessions, alerts };
  }

  /**
   * Security Module: Update security switches
   */
  async updateSecuritySwitches(switches: any, adminUid: string) {
    await settingsService.updateSystemSetting('SECURITY_SWITCHES', JSON.stringify(switches), adminUid);
    await SecurityLogger.logAudit({
      actorUid: adminUid,
      action: 'UPDATE_SECURITY_SWITCHES',
      resource: 'security/switches',
      oldValue: '',
      newValue: JSON.stringify(switches),
    });
    return switches;
  }

  /**
   * Security Module: Revoke session
   */
  async revokeAdminSession(sessionId: string, adminUid: string) {
    await db.update(sessions).set({ revoked: true }).where(eq(sessions.id, sessionId));
    await SecurityLogger.logAudit({
      actorUid: adminUid,
      action: 'REVOKE_SESSION',
      resource: `sessions/${sessionId}`,
      oldValue: '',
      newValue: 'revoked',
    });
    return { success: true };
  }

  /**
   * Security Module: Clear security alerts
   */
  async clearSecurityAlerts(adminUid: string) {
    await settingsService.updateSystemSetting('SECURITY_ALERTS', JSON.stringify([]), adminUid);
    await SecurityLogger.logAudit({
      actorUid: adminUid,
      action: 'CLEAR_SECURITY_ALERTS',
      resource: 'security/alerts',
      oldValue: '',
      newValue: 'cleared',
    });
    return { success: true };
  }

  /**
   * Salary Module: Get Slabs
   */
  async getSalarySlabs() {
    const stored = await settingsService.getSystemSetting('SALARY_SLABS_MATRIX', '');
    let slabs;
    if (stored) {
      try { slabs = JSON.parse(stored); } catch (e) {}
    }

    if (!slabs) {
      slabs = [
        { rank: 'Bronze', members: 1240, salary: '$0', requirement: '1 Direct Active VIP1', nextPayout: 'Aug 1, 2024' },
        { rank: 'Silver', members: 840, salary: '$100', requirement: '5 Direct Active VIP2', nextPayout: 'Aug 1, 2024' },
        { rank: 'Gold', members: 612, salary: '$500', requirement: '10 Direct Active VIP2', nextPayout: 'Aug 1, 2024' },
        { rank: 'Diamond', members: 310, salary: '$1,500', requirement: '25 Direct Active VIP2', nextPayout: 'Aug 1, 2024' },
        { rank: 'Crown', members: 114, salary: '$5,000', requirement: '50 Direct Active VIP2', nextPayout: 'Aug 1, 2024' }
      ];
    }

    return slabs;
  }

  /**
   * Salary Module: Update Slab
   */
  async updateSalarySlab(rank: string, updatedSlab: any, adminUid: string) {
    const slabs = await this.getSalarySlabs();
    const updatedList = slabs.map((s: any) => s.rank === rank ? { ...s, ...updatedSlab } : s);
    await settingsService.updateSystemSetting('SALARY_SLABS_MATRIX', JSON.stringify(updatedList), adminUid);

    await SecurityLogger.logAudit({
      actorUid: adminUid,
      action: 'UPDATE_SALARY_SLAB',
      resource: `salary_slabs/${rank}`,
      oldValue: '',
      newValue: JSON.stringify(updatedSlab),
    });

    return updatedList;
  }

  /**
   * Salary Module: Process Weekly Leadership Incentive Payouts
   *
   * Business Logic Spec Section 12 — Weekly Leadership Incentive & Section 17 —
   * Service Ownership Matrix: SalaryService is the single owning service for this
   * business rule. AdminService only orchestrates the batch run across all users and
   * never recalculates or duplicates the reward logic itself.
   */
  async processMonthlySalaryPayouts(adminUid: string) {
    const payPeriodEnd = new Date();
    const payPeriodStart = new Date(payPeriodEnd.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Fetch every registered user — this is an admin-triggered batch job, not a
    // paginated UI listing, so we intentionally request a high ceiling.
    const allUsers = await userRepository.findAll({ limit: 100000, offset: 0 });

    let processedCount = 0;
    let totalTransmitted = 0;

    for (const user of allUsers) {
      try {
        const result = await salaryService.processWeeklySalaryForUser(user.id, payPeriodStart, payPeriodEnd);
        if (result.paid) {
          processedCount++;
          totalTransmitted += result.reward;
        }
      } catch (err: any) {
        console.error(`Failed to process Weekly Leadership Incentive for user ${user.id}:`, err.message);
      }
    }

    const totalTransmittedStr = totalTransmitted.toFixed(2);

    // Audit execution — records the real outcome, not a placeholder.
    await SecurityLogger.logAudit({
      actorUid: adminUid,
      action: 'PROCESS_WEEKLY_SALARY_PAYOUTS',
      resource: 'salary/payouts',
      oldValue: '',
      newValue: JSON.stringify({ payPeriodStart, payPeriodEnd, processedCount, totalTransmitted: totalTransmittedStr }),
    });

    return {
      processedCount,
      totalTransmitted: `$${totalTransmittedStr}`,
      payPeriodStart,
      payPeriodEnd,
    };
  }

  /**
   * Rewards Module: Get Campaigns
   */
  async getRewardCampaigns() {
    const stored = await settingsService.getSystemSetting('REWARD_CAMPAIGNS', '');
    let campaigns;
    if (stored) {
      try { campaigns = JSON.parse(stored); } catch (e) {}
    }

    if (!campaigns) {
      campaigns = [
        { id: 'CAMP-01', title: 'Welcome Registration Bonus', bonusAmount: '$10', minDepRequired: '$0', claimsCount: 1428, status: 'Active', description: 'Credit upon verified user profile registration.' },
        { id: 'CAMP-02', title: 'First Deposit Match Incentive', bonusAmount: '$50', minDepRequired: '$500', claimsCount: 892, status: 'Active', description: 'Matched bonus credit applied once deposit completes.' },
        { id: 'CAMP-03', title: 'Annual Anniversary Reward', bonusAmount: '$200', minDepRequired: '$2,000', claimsCount: 42, status: 'Paused', description: 'Special reward distributed to accounts active over 1 year.' }
      ];
    }

    return campaigns;
  }

  /**
   * Rewards Module: Create Campaign
   */
  async createRewardCampaign(newCampaign: any, adminUid: string) {
    const campaigns = await this.getRewardCampaigns();
    const id = `CAMP-0${campaigns.length + 1}`;
    const created = { ...newCampaign, id, claimsCount: 0 };
    const updatedList = [...campaigns, created];
    await settingsService.updateSystemSetting('REWARD_CAMPAIGNS', JSON.stringify(updatedList), adminUid);

    await SecurityLogger.logAudit({
      actorUid: adminUid,
      action: 'CREATE_REWARD_CAMPAIGN',
      resource: `reward_campaigns/${id}`,
      oldValue: '',
      newValue: JSON.stringify(created),
    });

    return created;
  }

  /**
   * Rewards Module: Update Campaign
   */
  async updateRewardCampaign(id: string, updates: any, adminUid: string) {
    const campaigns = await this.getRewardCampaigns();
    const updatedList = campaigns.map((c: any) => c.id === id ? { ...c, ...updates } : c);
    await settingsService.updateSystemSetting('REWARD_CAMPAIGNS', JSON.stringify(updatedList), adminUid);

    await SecurityLogger.logAudit({
      actorUid: adminUid,
      action: 'UPDATE_REWARD_CAMPAIGN',
      resource: `reward_campaigns/${id}`,
      oldValue: '',
      newValue: JSON.stringify(updates),
    });

    return updatedList;
  }

  /**
   * Announcements Module: Get Announcements
   */
  async getAnnouncements() {
    const stored = await settingsService.getSystemSetting('SYSTEM_ANNOUNCEMENTS', '');
    let announcements: any[] = [];
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          announcements = parsed;
        }
      } catch (e) {
        announcements = [];
      }
    }

    return announcements;
  }

  /**
   * Announcements Module: Create Announcement
   */
  async createAnnouncement(newBroadcast: any, adminUid: string) {
    const announcements = await this.getAnnouncements();
    const id = `ANN-${Date.now()}`;
    const dateStr = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    const created = {
      id,
      title: newBroadcast.title || newBroadcast.headline || '',
      headline: newBroadcast.headline || newBroadcast.title || '',
      message: newBroadcast.message || newBroadcast.content || '',
      content: newBroadcast.content || newBroadcast.message || '',
      excerpt: newBroadcast.message || newBroadcast.content || '',
      category: newBroadcast.category || (newBroadcast.priority === 'Urgent' ? 'Security' : 'Audit'),
      priority: newBroadcast.priority || 'Standard',
      targetAudience: newBroadcast.targetAudience || newBroadcast.target || 'All Users',
      target: newBroadcast.target || newBroadcast.targetAudience || 'All Users',
      pinned: Boolean(newBroadcast.pinned),
      publishedBy: adminUid,
      date: dateStr,
      createdAt: dateStr,
    };

    const updatedList = [created, ...announcements];
    await settingsService.updateSystemSetting('SYSTEM_ANNOUNCEMENTS', JSON.stringify(updatedList), adminUid);

    await SecurityLogger.logAudit({
      actorUid: adminUid,
      action: 'CREATE_ANNOUNCEMENT',
      resource: `announcements/${id}`,
      oldValue: '',
      newValue: JSON.stringify(created),
    });

    return created;
  }

  /**
   * Announcements Module: Delete Announcement
   */
  async deleteAnnouncement(id: string, adminUid: string) {
    const announcements = await this.getAnnouncements();
    const updatedList = announcements.filter((a: any) => a.id !== id);
    await settingsService.updateSystemSetting('SYSTEM_ANNOUNCEMENTS', JSON.stringify(updatedList), adminUid);

    await SecurityLogger.logAudit({
      actorUid: adminUid,
      action: 'DELETE_ANNOUNCEMENT',
      resource: `announcements/${id}`,
      oldValue: '',
      newValue: 'deleted',
    });

    return { success: true };
  }
}

export const adminService = new AdminService();
export default adminService;
