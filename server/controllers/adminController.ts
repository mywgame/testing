/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middlewares/auth.ts';
import { adminService } from '../services/adminService.ts';
import { productionCleanupService } from '../services/productionCleanupService.ts';
import { supportService } from '../services/supportService.ts';
import { userRepository } from '../repositories/userRepository.ts';
import { notificationRepository } from '../repositories/notificationRepository.ts';
import { auditRepository } from '../repositories/auditRepository.ts';
import { sendSuccess } from '../utils/response.ts';
import { ApiError } from '../middlewares/errorHandler.ts';
import { treasuryService } from '../blockchain/services/TreasuryService.ts';
import { db } from '../../src/db/index.ts';
import { sweepQueue, treasuryWallets, users } from '../../src/db/schema.ts';
import { sweepQueueProcessor } from '../blockchain/services/SweepQueueProcessor.ts';
import { gasCalculator } from '../blockchain/services/GasCalculator.ts';
import { activeBlockchainProvider } from '../blockchain/providers/index.ts';
import { blockchainConfig } from '../blockchain/config/blockchainConfig.ts';
import { eq, and, desc } from 'drizzle-orm';
import QRCode from 'qrcode';
import crypto from 'crypto';
import { totp } from '../utils/totp.ts';
import { encryptText, decryptText, hashCode } from '../utils/encryption.ts';
import { adminSecurityRepository } from '../repositories/adminSecurityRepository.ts';
import { settingsRepository } from '../repositories/settingsRepository.ts';
import { taskRepository } from '../repositories/taskRepository.ts';
import { SecurityLogger } from '../utils/securityLogger.ts';

export class AdminController {
  /**
   * GET Preview counts for the pre-launch production cleanup.
   */
  async getProductionCleanupPreview(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new ApiError(401, 'Authentication credentials required', 'UNAUTHORIZED');
      }

      const preview = await productionCleanupService.getPreview();
      return sendSuccess(res, preview, 200);
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST Delete every non-SUPERADMIN user and all test operational data.
   */
  async deleteAllTestUsers(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new ApiError(401, 'Authentication credentials required', 'UNAUTHORIZED');
      }

      const { confirmation } = req.body;
      if (confirmation !== 'DELETE TEST USERS') {
        throw new ApiError(400, 'Confirmation text is invalid.', 'INVALID_CONFIRMATION');
      }

      const summary = await productionCleanupService.deleteAllTestUsers(confirmation);
      return sendSuccess(res, summary, 200);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Fetch compiled admin dashboard overview aggregation and statistics
   */
  async getDashboardOverview(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new ApiError(401, 'Authentication credentials required', 'UNAUTHORIZED');
      }

      const overviewData = await adminService.getAdminDashboardOverview();
      return sendSuccess(res, overviewData, 200);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET Admin list of users with search, sort, filter, pagination
   */
  async getUsers(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new ApiError(401, 'Authentication credentials required', 'UNAUTHORIZED');
      }

      const search = req.query.search as string || '';
      const filter = req.query.filter as string || 'All';
      const sortBy = req.query.sortBy as string || 'Newest';
      const page = parseInt(req.query.page as string || '1', 10);
      const limit = parseInt(req.query.limit as string || '500', 10);
      const offset = (page - 1) * limit;

      const result = await adminService.getAdminUsersPaginated({
        search,
        filter,
        sortBy,
        limit,
        offset,
      });

      return sendSuccess(res, result, 200);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET Detailed profile of a single user
   */
  async getUserProfile(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new ApiError(401, 'Authentication credentials required', 'UNAUTHORIZED');
      }

      const { targetUid } = req.params;
      if (!targetUid) {
        throw new ApiError(400, 'Target user UID is required', 'BAD_REQUEST');
      }

      const result = await adminService.getUserProfileDetail(targetUid);
      return sendSuccess(res, result, 200);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET Full deposit address history (active + archived) for a user on a network
   */
  async getUserDepositAddressHistory(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new ApiError(401, 'Authentication credentials required', 'UNAUTHORIZED');
      }

      const { targetUid } = req.params;
      const { network } = req.query;

      if (!targetUid) {
        throw new ApiError(400, 'Target user UID is required', 'BAD_REQUEST');
      }
      if (!network || typeof network !== 'string') {
        throw new ApiError(400, 'network query parameter is required', 'BAD_REQUEST');
      }

      const result = await adminService.getUserDepositAddressHistory(targetUid, network);
      return sendSuccess(res, result, 200);
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST Rotate a user's deposit address on a given network
   */
  async rotateUserDepositAddress(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new ApiError(401, 'Authentication credentials required', 'UNAUTHORIZED');
      }

      const { targetUid } = req.params;
      const { network } = req.body;

      if (!targetUid) {
        throw new ApiError(400, 'Target user UID is required', 'BAD_REQUEST');
      }
      if (!network || typeof network !== 'string') {
        throw new ApiError(400, 'network is required', 'BAD_REQUEST');
      }

      const result = await adminService.rotateUserDepositAddress(
        req.user.uid,
        req.user.email,
        targetUid,
        network
      );
      return sendSuccess(res, result, 200);
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH Update user's profile info
   */
  async updateUserProfile(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new ApiError(401, 'Authentication credentials required', 'UNAUTHORIZED');
      }

      const { targetUid } = req.params;
      const { name, email, mobile, status } = req.body;

      if (!targetUid) {
        throw new ApiError(400, 'Target user UID is required', 'BAD_REQUEST');
      }

      const result = await adminService.updateAdminUserProfile(
        req.user.uid,
        targetUid,
        { name, email, phone: mobile, status },
        req.ip,
        req.headers['user-agent']
      );

      return sendSuccess(res, result, 200);
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST Adjust a user's wallet
   */
  async adjustWalletBalance(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new ApiError(401, 'Authentication credentials required', 'UNAUTHORIZED');
      }

      const { targetUid } = req.params;
      const { amount, memo } = req.body;

      if (!targetUid) {
        throw new ApiError(400, 'Target user UID is required', 'BAD_REQUEST');
      }

      const user = await userRepository.findByUid(targetUid);
      if (!user) {
        throw new ApiError(404, 'User not found', 'NOT_FOUND');
      }

      const result = await adminService.adjustWalletBalance(
        user.id,
        { availableBalance: amount.toString() },
        memo || 'Manual wallet adjustment by administrator',
        req.user.uid
      );

      return sendSuccess(res, result, 200);
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST Send notification to a user
   */
  async sendNotification(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new ApiError(401, 'Authentication credentials required', 'UNAUTHORIZED');
      }

      const { targetUid } = req.params;
      const { message, priority } = req.body;

      if (!targetUid) {
        throw new ApiError(400, 'Target user UID is required', 'BAD_REQUEST');
      }

      const user = await userRepository.findByUid(targetUid);
      if (!user) {
        throw new ApiError(404, 'User not found', 'NOT_FOUND');
      }

      await notificationRepository.createNotification({
        userId: user.id,
        message,
        priority: priority || 'MEDIUM',
      });

      return sendSuccess(res, { success: true, message: 'Notification sent successfully.' }, 200);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET Retrieve user's transaction history
   */
  async getUserTransactions(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new ApiError(401, 'Authentication credentials required', 'UNAUTHORIZED');
      }

      const { targetUid } = req.params;
      const page = parseInt(req.query.page as string || '1', 10);
      const limit = parseInt(req.query.limit as string || '50', 10);
      const offset = (page - 1) * limit;

      if (!targetUid) {
        throw new ApiError(400, 'Target user UID is required', 'BAD_REQUEST');
      }

      const result = await adminService.getUserTransactions(targetUid, { limit, offset });
      return sendSuccess(res, result, 200);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET Retrieve user's deposit history
   */
  async getUserDeposits(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new ApiError(401, 'Authentication credentials required', 'UNAUTHORIZED');
      }

      const { targetUid } = req.params;
      const page = parseInt(req.query.page as string || '1', 10);
      const limit = parseInt(req.query.limit as string || '50', 10);
      const offset = (page - 1) * limit;

      if (!targetUid) {
        throw new ApiError(400, 'Target user UID is required', 'BAD_REQUEST');
      }

      const result = await adminService.getUserDeposits(targetUid, { limit, offset });
      return sendSuccess(res, result, 200);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET Retrieve user's withdrawal history
   */
  async getUserWithdrawals(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new ApiError(401, 'Authentication credentials required', 'UNAUTHORIZED');
      }

      const { targetUid } = req.params;
      const page = parseInt(req.query.page as string || '1', 10);
      const limit = parseInt(req.query.limit as string || '50', 10);
      const offset = (page - 1) * limit;

      if (!targetUid) {
        throw new ApiError(400, 'Target user UID is required', 'BAD_REQUEST');
      }

      const result = await adminService.getUserWithdrawals(targetUid, { limit, offset });
      return sendSuccess(res, result, 200);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET Retrieve user's audit logs
   */
  async getUserAudits(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new ApiError(401, 'Authentication credentials required', 'UNAUTHORIZED');
      }

      const { targetUid } = req.params;
      const page = parseInt(req.query.page as string || '1', 10);
      const limit = parseInt(req.query.limit as string || '50', 10);
      const offset = (page - 1) * limit;

      if (!targetUid) {
        throw new ApiError(400, 'Target user UID is required', 'BAD_REQUEST');
      }

      const result = await adminService.getUserAudits(targetUid, { limit, offset });
      return sendSuccess(res, result, 200);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET Retrieve user's referral team network
   */
  async getUserTeamNetwork(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new ApiError(401, 'Authentication credentials required', 'UNAUTHORIZED');
      }

      const { targetUid } = req.params;
      if (!targetUid) {
        throw new ApiError(400, 'Target user UID is required', 'BAD_REQUEST');
      }

      const result = await adminService.getUserTeamNetwork(targetUid);
      return sendSuccess(res, result, 200);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET Retrieve all support tickets with query filters and search (Admin Oversight)
   */
  async getAdminTickets(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new ApiError(401, 'Authentication credentials required', 'UNAUTHORIZED');
      }

      const status = req.query.status as string;
      const priority = req.query.priority as string;
      const category = req.query.category as string;
      const search = req.query.search as string;
      const limit = parseInt(req.query.limit as string || '100', 10);
      const offset = parseInt(req.query.offset as string || '0', 10);

      const tickets = await supportService.getAdminTickets({
        status,
        priority,
        category,
        search,
        limit,
        offset,
      });

      return sendSuccess(res, tickets, 200);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET Retrieve conversation history under a specific ticket (Admin view)
   */
  async getAdminTicketMessages(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new ApiError(401, 'Authentication credentials required', 'UNAUTHORIZED');
      }

      const { ticketId } = req.params;
      if (!ticketId) {
        throw new ApiError(400, 'Ticket ID is required', 'BAD_REQUEST');
      }

      const messages = await supportService.getTicketMessages(ticketId, '', true);
      return sendSuccess(res, messages, 200);
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST Submit an admin reply to a ticket thread
   */
  async replyToTicketAsAdmin(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new ApiError(401, 'Authentication credentials required', 'UNAUTHORIZED');
      }

      const { ticketId } = req.params;
      const { message } = req.body;

      if (!ticketId || !message) {
        throw new ApiError(400, 'Ticket ID and message content are required', 'BAD_REQUEST');
      }

      const adminUser = await userRepository.findByUid(req.user.uid);
      if (!adminUser) {
        throw new ApiError(404, 'Admin user profile not found', 'NOT_FOUND');
      }

      const messageRecord = await supportService.addTicketReply({
        ticketId,
        senderId: adminUser.id,
        senderType: 'ADMIN',
        message,
      });

      return sendSuccess(res, messageRecord, 201);
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH Update properties of a support ticket (status, priority, assignment)
   */
  async updateTicketProperties(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new ApiError(401, 'Authentication credentials required', 'UNAUTHORIZED');
      }

      const { ticketId } = req.params;
      const { status, priority, assignedAdminUid } = req.body;

      if (!ticketId) {
        throw new ApiError(400, 'Ticket ID is required', 'BAD_REQUEST');
      }

      const updatedTicket = await supportService.updateTicketProperties(ticketId, {
        status,
        priority,
        assignedAdminUid,
      });

      return sendSuccess(res, updatedTicket, 200);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET Retrieve treasury wallet configurations, balances, and deposit addresses for a network
   */
  async getTreasuryOverview(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new ApiError(401, 'Authentication credentials required', 'UNAUTHORIZED');
      }

      const { network } = req.params;
      if (!network) {
        throw new ApiError(400, 'Network parameter is required.', 'BAD_REQUEST');
      }

      const overview = await treasuryService.getTreasuryOverview(network);
      const jobs = await treasuryService.getSweepJobs(network);

      return sendSuccess(res, { ...overview, jobs }, 200);
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST Sweep a specific user deposit address to Hot Wallet
   */
  async sweepUserDepositAddress(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new ApiError(401, 'Authentication credentials required', 'UNAUTHORIZED');
      }

      const { addressId } = req.body;
      if (!addressId) {
        throw new ApiError(400, 'Address ID is required.', 'BAD_REQUEST');
      }

      const result = await treasuryService.sweepUserDepositAddress(addressId, req.user.uid);
      if (!result.success) {
        throw new ApiError(500, result.error || 'Failed to execute sweep operation.', 'INTERNAL_ERROR');
      }

      return sendSuccess(res, result, 200);
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST Reclaim/collect native gas from a specific user permanent deposit address
   */
  async sweepUserNativeGas(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new ApiError(401, 'Authentication credentials required', 'UNAUTHORIZED');
      }

      const { addressId } = req.body;
      if (!addressId) {
        throw new ApiError(400, 'Address ID is required.', 'BAD_REQUEST');
      }

      const result = await treasuryService.sweepUserNativeGas(addressId, req.user.uid);
      if (!result.success) {
        throw new ApiError(500, result.error || 'Failed to execute gas collection operation.', 'INTERNAL_ERROR');
      }

      return sendSuccess(res, result, 200);
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST Reclaim/collect native gas from all eligible deposit addresses on a network
   */
  async sweepAllUserNativeGas(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new ApiError(401, 'Authentication credentials required', 'UNAUTHORIZED');
      }

      const { network } = req.body;
      if (!network) {
        throw new ApiError(400, 'Network parameter is required.', 'BAD_REQUEST');
      }

      const results = await treasuryService.sweepAllUserNativeGas(network, req.user.uid);
      return sendSuccess(res, { results }, 200);
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST Sweep all positive-balance deposit addresses on a network
   */
  async sweepAllEligibleAddresses(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new ApiError(401, 'Authentication credentials required', 'UNAUTHORIZED');
      }

      const { network } = req.body;
      if (!network) {
        throw new ApiError(400, 'Network parameter is required.', 'BAD_REQUEST');
      }

      const results = await treasuryService.sweepAllEligibleAddresses(network, req.user.uid);
      return sendSuccess(res, { results }, 200);
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST Sweep funds from Hot Wallet to Cold Wallet
   */
  async sweepHotToCold(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new ApiError(401, 'Authentication credentials required', 'UNAUTHORIZED');
      }

      const { network, amount } = req.body;
      if (!network || !amount) {
        throw new ApiError(400, 'Network and amount are required parameters.', 'BAD_REQUEST');
      }

      const result = await treasuryService.sweepHotToCold(network, amount, req.user.uid);
      if (!result.success) {
        throw new ApiError(500, result.error || 'Failed to transfer to cold wallet.', 'INTERNAL_ERROR');
      }

      return sendSuccess(res, result, 200);
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST Retry a failed sweep job
   */
  async sweepRetryJob(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new ApiError(401, 'Authentication credentials required', 'UNAUTHORIZED');
      }

      const { jobId } = req.body;
      if (!jobId) {
        throw new ApiError(400, 'Job ID is required.', 'BAD_REQUEST');
      }

      const result = await treasuryService.retrySweepJob(jobId, req.user.uid);
      if (!result.success) {
        throw new ApiError(500, result.error || 'Failed to retry sweep job.', 'INTERNAL_ERROR');
      }

      return sendSuccess(res, result, 200);
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST Update auto-sweep configurations
   */
  async updateAutoSweepConfig(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new ApiError(401, 'Authentication credentials required', 'UNAUTHORIZED');
      }

      const { network, autoSweepEnabled, autoSweepThreshold } = req.body;
      if (!network || autoSweepEnabled === undefined || !autoSweepThreshold) {
        throw new ApiError(400, 'All parameters are required.', 'BAD_REQUEST');
      }

      const updated = await treasuryService.updateAutoSweepConfig(
        network,
        autoSweepEnabled,
        autoSweepThreshold,
        req.user.uid
      );

      return sendSuccess(res, updated, 200);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET Retrieve all sweep jobs
   */
  async getSweepJobs(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new ApiError(401, 'Authentication credentials required', 'UNAUTHORIZED');
      }

      const network = req.query.network as string;
      const jobs = await treasuryService.getSweepJobs(network);

      return sendSuccess(res, jobs, 200);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET Retrieve sweep queue items with real-time native gas balances
   */
  async getSweepQueue(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new ApiError(401, 'Authentication credentials required', 'UNAUTHORIZED');
      }
      const network = req.query.network as string;
      const status = req.query.status as string;

      let q = db
        .select({
          id: sweepQueue.id,
          depositId: sweepQueue.depositId,
          depositAddress: sweepQueue.depositAddress,
          network: sweepQueue.network,
          amount: sweepQueue.amount,
          status: sweepQueue.status,
          gasStatus: sweepQueue.gasStatus,
          gasTxHash: sweepQueue.gasTxHash,
          sweepTxHash: sweepQueue.sweepTxHash,
          errorMessage: sweepQueue.errorMessage,
          attempts: sweepQueue.attempts,
          eligibleAt: sweepQueue.eligibleAt,
          createdAt: sweepQueue.createdAt,
          updatedAt: sweepQueue.updatedAt,
          // Real user identity fields for the admin UI — the internal user UUID
          // (sweepQueue.userId) is intentionally NOT selected here so it can never be
          // displayed. dsUserId is the user-facing formatted ID (e.g. "DS322256").
          userEmail: users.email,
          userName: users.name,
          dsUserId: users.userId,
        })
        .from(sweepQueue)
        .innerJoin(users, eq(sweepQueue.userId, users.id));

      const conditions = [];
      if (network) {
        conditions.push(eq(sweepQueue.network, network.toUpperCase()));
      }
      if (status) {
        conditions.push(eq(sweepQueue.status, status));
      }

      if (conditions.length > 0) {
        q = q.where(and(...conditions)) as any;
      }

      const items = await q.orderBy(desc(sweepQueue.createdAt));

      // Inject live native balance, required gas, and real on-chain confirmation
      // progress for each item — never fabricated.
      const itemsWithGas = await Promise.all(
        items.map(async (item) => {
          let nativeGasBalance = '0.00000000';
          let requiredGas = '0.00000000';
          let confirmations = 0;
          const requiredConfirmations =
            blockchainConfig.networks[item.network]?.confirmationsRequired ?? (blockchainConfig.isTestnet ? 1 : 6);
          try {
            nativeGasBalance = await activeBlockchainProvider.getNativeBalance(item.network, item.depositAddress);
            const req = await gasCalculator.getMinGasRequirement(item.network);
            requiredGas = req.minRequiredGas;

            if (item.sweepTxHash) {
              const tx = await activeBlockchainProvider.getTransaction(item.network, item.sweepTxHash);
              if (tx) confirmations = tx.confirmations || 0;
            } else if (item.gasTxHash) {
              const tx = await activeBlockchainProvider.getTransaction(item.network, item.gasTxHash);
              if (tx) confirmations = tx.confirmations || 0;
            }
          } catch (e) {
            // fallback gracefully
          }
          return {
            ...item,
            nativeGasBalance,
            requiredGas,
            confirmations,
            requiredConfirmations,
          };
        })
      );

      return sendSuccess(res, itemsWithGas, 200);
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST Fund gas manually for a specific queue item
   */
  async fundGasQueueItem(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new ApiError(401, 'Authentication credentials required', 'UNAUTHORIZED');
      }
      const { itemId } = req.body;
      if (!itemId) {
        throw new ApiError(400, 'Queue Item ID is required.', 'BAD_REQUEST');
      }
      const txHash = await sweepQueueProcessor.fundGasForQueueItem(itemId, req.user.uid);
      return sendSuccess(res, { success: true, txHash }, 200);
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST Sweep a specific queue item manually
   */
  async sweepQueueItem(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new ApiError(401, 'Authentication credentials required', 'UNAUTHORIZED');
      }
      const { itemId } = req.body;
      if (!itemId) {
        throw new ApiError(400, 'Queue Item ID is required.', 'BAD_REQUEST');
      }
      const txHash = await sweepQueueProcessor.sweepQueueItem(itemId, req.user.uid);
      return sendSuccess(res, { success: true, txHash }, 200);
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST Cancel a sweep queue item
   */
  async cancelQueueItem(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new ApiError(401, 'Authentication credentials required', 'UNAUTHORIZED');
      }
      const { itemId } = req.body;
      if (!itemId) {
        throw new ApiError(400, 'Queue Item ID is required.', 'BAD_REQUEST');
      }
      await sweepQueueProcessor.cancelQueueItem(itemId, req.user.uid);
      return sendSuccess(res, { success: true }, 200);
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST Retry a failed sweep queue item
   */
  async retryQueueItem(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new ApiError(401, 'Authentication credentials required', 'UNAUTHORIZED');
      }
      const { itemId } = req.body;
      if (!itemId) {
        throw new ApiError(400, 'Queue Item ID is required.', 'BAD_REQUEST');
      }
      await sweepQueueProcessor.retryQueueItem(itemId, req.user.uid);
      return sendSuccess(res, { success: true }, 200);
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST Bulk sweep queue actions
   */
  async bulkActionQueue(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new ApiError(401, 'Authentication credentials required', 'UNAUTHORIZED');
      }
      const { itemIds, action } = req.body;
      if (!itemIds || !Array.isArray(itemIds) || !action) {
        throw new ApiError(400, 'itemIds (array) and action are required parameters.', 'BAD_REQUEST');
      }

      let results;
      if (action === 'FUND_GAS') {
        results = await sweepQueueProcessor.bulkFundGas(itemIds, req.user.uid);
      } else if (action === 'SWEEP') {
        results = await sweepQueueProcessor.bulkSweep(itemIds, req.user.uid);
      } else if (action === 'FUND_AND_SWEEP') {
        results = await sweepQueueProcessor.bulkFundAndSweep(itemIds, req.user.uid);
      } else {
        throw new ApiError(400, `Unsupported bulk action: ${action}`, 'BAD_REQUEST');
      }

      return sendSuccess(res, { results }, 200);
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST Update sweep mode and delay configuration
   */
  async updateSweepModeConfig(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new ApiError(401, 'Authentication credentials required', 'UNAUTHORIZED');
      }
      const { network, sweepMode, sweepDelay, customDelayMinutes, autoSweepThreshold, paused } = req.body;
      if (!network) {
        throw new ApiError(400, 'Network parameter is required.', 'BAD_REQUEST');
      }

      const cleanNetwork = network.toUpperCase();
      await treasuryService.getOrCreateTreasuryWallet(cleanNetwork);

      const updateFields: any = { updatedAt: new Date() };
      if (sweepMode !== undefined) updateFields.sweepMode = sweepMode;
      if (sweepDelay !== undefined) updateFields.sweepDelay = sweepDelay;
      if (customDelayMinutes !== undefined) updateFields.customDelayMinutes = parseInt(customDelayMinutes, 10);
      if (autoSweepThreshold !== undefined) updateFields.autoSweepThreshold = autoSweepThreshold;
      if (paused !== undefined) updateFields.paused = paused;

      const updated = await db
        .update(treasuryWallets)
        .set(updateFields)
        .where(eq(treasuryWallets.network, cleanNetwork))
        .returning();

      await auditRepository.createAuditLog({
        actorUid: req.user.uid,
        userId: null as any,
        action: 'TREASURY_SWEEP_CONFIG_COMPREHENSIVE_UPDATE',
        resource: `treasury/config/${cleanNetwork}`,
        oldValue: 'STALE',
        newValue: JSON.stringify(updateFields),
      });

      return sendSuccess(res, updated[0], 200);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET Platform Deposits
   */
  async getAdminDeposits(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new ApiError(401, 'Authentication credentials required', 'UNAUTHORIZED');
      }
      const status = req.query.status as string | undefined;
      const page = parseInt(req.query.page as string || '1', 10);
      const limit = parseInt(req.query.limit as string || '50', 10);
      const offset = (page - 1) * limit;

      const result = await adminService.getAllDeposits({ status, limit, offset });
      return sendSuccess(res, result, 200);
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST Approve Deposit
   */
  async approveDeposit(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new ApiError(401, 'Authentication credentials required', 'UNAUTHORIZED');
      }
      const { id } = req.params;
      const { txHash } = req.body;
      const result = await adminService.approveDeposit(id, req.user.uid, txHash);
      return sendSuccess(res, result, 200);
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST Reject Deposit
   */
  async rejectDeposit(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new ApiError(401, 'Authentication credentials required', 'UNAUTHORIZED');
      }
      const { id } = req.params;
      const { notes } = req.body;
      const result = await adminService.rejectDeposit(id, req.user.uid, notes);
      return sendSuccess(res, result, 200);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET Platform Withdrawals
   */
  async getAdminWithdrawals(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new ApiError(401, 'Authentication credentials required', 'UNAUTHORIZED');
      }
      const status = req.query.status as string | undefined;
      const page = parseInt(req.query.page as string || '1', 10);
      const limit = parseInt(req.query.limit as string || '50', 10);
      const offset = (page - 1) * limit;

      const result = await adminService.getAllWithdrawals({ status, limit, offset });
      return sendSuccess(res, result, 200);
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST Approve Withdrawal
   */
  async approveWithdrawal(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new ApiError(401, 'Authentication credentials required', 'UNAUTHORIZED');
      }
      const { id } = req.params;
      const { txHash, notes } = req.body;
      const result = await adminService.approveWithdrawal(id, req.user.uid, notes, txHash);
      return sendSuccess(res, result, 200);
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST Reject Withdrawal
   */
  async rejectWithdrawal(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new ApiError(401, 'Authentication credentials required', 'UNAUTHORIZED');
      }
      const { id } = req.params;
      const { notes } = req.body;
      const result = await adminService.rejectWithdrawal(id, req.user.uid, notes || 'Rejected by admin');
      return sendSuccess(res, result, 200);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET System Audit Logs
   */
  async getSystemAuditLogs(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new ApiError(401, 'Authentication credentials required', 'UNAUTHORIZED');
      }
      const action = req.query.action as string | undefined;
      const page = parseInt(req.query.page as string || '1', 10);
      const limit = parseInt(req.query.limit as string || '100', 10);
      const offset = (page - 1) * limit;

      const logs = await adminService.getSystemAuditLogs({ action, limit, offset });
      return sendSuccess(res, logs, 200);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET Admin System Settings
   */
  async getSystemSettings(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new ApiError(401, 'Authentication credentials required', 'UNAUTHORIZED');
      }

      const settings = await adminService.getSystemSettings();
      return sendSuccess(res, settings, 200);
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH Update Admin System Setting by key
   */
  async updateSystemSetting(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new ApiError(401, 'Authentication credentials required', 'UNAUTHORIZED');
      }

      const { key } = req.params;
      const { value } = req.body;

      if (!key || value === undefined) {
        throw new ApiError(400, 'Setting key and value are required', 'BAD_REQUEST');
      }

      const updated = await adminService.updateSystemSetting(key, String(value), req.user.uid);
      return sendSuccess(res, updated, 200);
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST Create new admin user account
   */
  async createAdminUser(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new ApiError(401, 'Authentication credentials required', 'UNAUTHORIZED');
      }

      const { name, email, mobile, rank, balance, referralCode } = req.body;
      if (!name || !email) {
        throw new ApiError(400, 'Name and Email are required', 'BAD_REQUEST');
      }

      const newUser = await adminService.createAdminUser({
        name,
        email,
        phone: mobile,
        rank,
        initialBalance: parseFloat(balance || '0'),
        referralCode,
      }, req.user.uid);

      return sendSuccess(res, newUser, 201);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET VIP Tiers Matrix
   */
  async getVipTiers(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new ApiError(401, 'Authentication credentials required', 'UNAUTHORIZED');
      }

      const tiers = await adminService.getVipTiers();
      return sendSuccess(res, tiers, 200);
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH VIP Tier
   */
  async updateVipTier(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new ApiError(401, 'Authentication credentials required', 'UNAUTHORIZED');
      }

      const { tierName } = req.params;
      const updated = await adminService.updateVipTier(tierName, req.body, req.user.uid);
      return sendSuccess(res, updated, 200);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET Security Command Overview
   */
  async getSecurityOverview(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new ApiError(401, 'Authentication credentials required', 'UNAUTHORIZED');
      }

      const security = await adminService.getSecurityOverview();
      return sendSuccess(res, security, 200);
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST Update Security Switches
   */
  async updateSecuritySwitches(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new ApiError(401, 'Authentication credentials required', 'UNAUTHORIZED');
      }

      const switches = await adminService.updateSecuritySwitches(req.body, req.user.uid);
      return sendSuccess(res, switches, 200);
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST Revoke Admin Session
   */
  async revokeAdminSession(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new ApiError(401, 'Authentication credentials required', 'UNAUTHORIZED');
      }

      const { sessionId } = req.params;
      const result = await adminService.revokeAdminSession(sessionId, req.user.uid);
      return sendSuccess(res, result, 200);
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST Clear Security Alerts
   */
  async clearSecurityAlerts(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new ApiError(401, 'Authentication credentials required', 'UNAUTHORIZED');
      }

      const result = await adminService.clearSecurityAlerts(req.user.uid);
      return sendSuccess(res, result, 200);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET Leader Salary Slabs
   */
  async getSalarySlabs(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new ApiError(401, 'Authentication credentials required', 'UNAUTHORIZED');
      }

      const slabs = await adminService.getSalarySlabs();
      return sendSuccess(res, slabs, 200);
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH Leader Salary Slab
   */
  async updateSalarySlab(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new ApiError(401, 'Authentication credentials required', 'UNAUTHORIZED');
      }

      const { rank } = req.params;
      const updated = await adminService.updateSalarySlab(rank, req.body, req.user.uid);
      return sendSuccess(res, updated, 200);
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST Process Monthly Salary Payouts
   */
  async processMonthlySalaryPayouts(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new ApiError(401, 'Authentication credentials required', 'UNAUTHORIZED');
      }

      const result = await adminService.processMonthlySalaryPayouts(req.user.uid);
      return sendSuccess(res, result, 200);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET Reward Campaigns
   */
  async getRewardCampaigns(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new ApiError(401, 'Authentication credentials required', 'UNAUTHORIZED');
      }

      const campaigns = await adminService.getRewardCampaigns();
      return sendSuccess(res, campaigns, 200);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET Rewards Pool Task Definitions & Metrics
   */
  async getRewardsPool(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new ApiError(401, 'Authentication credentials required', 'UNAUTHORIZED');
      }

      const tasks = await taskRepository.findAllTaskDefinitionsForAdmin();
      const metrics = await taskRepository.getRewardsPoolMetrics();
      const claims = await taskRepository.getRecentTaskClaims(50);

      return sendSuccess(res, {
        tasks,
        metrics,
        claims,
      }, 200);
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH Update Task Definition
   */
  async updateTaskDefinition(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new ApiError(401, 'Authentication credentials required', 'UNAUTHORIZED');
      }

      const { id } = req.params;
      const updated = await taskRepository.updateTaskDefinition(id, req.body);

      await SecurityLogger.logAudit({
        actorUid: req.user.uid,
        action: 'UPDATE_TASK_DEFINITION',
        resource: `task_definitions/${id}`,
        oldValue: '',
        newValue: JSON.stringify(req.body),
      });

      return sendSuccess(res, updated, 200);
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST Create Task Definition
   */
  async createTaskDefinition(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new ApiError(401, 'Authentication credentials required', 'UNAUTHORIZED');
      }

      const created = await taskRepository.createTaskDefinition(req.body);

      await SecurityLogger.logAudit({
        actorUid: req.user.uid,
        action: 'CREATE_TASK_DEFINITION',
        resource: `task_definitions/${created?.id || 'new'}`,
        oldValue: '',
        newValue: JSON.stringify(req.body),
      });

      return sendSuccess(res, created, 201);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET Recent Task Claims Log
   */
  async getTaskClaims(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new ApiError(401, 'Authentication credentials required', 'UNAUTHORIZED');
      }

      const claims = await taskRepository.getRecentTaskClaims(100);
      return sendSuccess(res, claims, 200);
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST Create Reward Campaign
   */
  async createRewardCampaign(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new ApiError(401, 'Authentication credentials required', 'UNAUTHORIZED');
      }

      const campaign = await adminService.createRewardCampaign(req.body, req.user.uid);
      return sendSuccess(res, campaign, 201);
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH Update Reward Campaign
   */
  async updateRewardCampaign(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new ApiError(401, 'Authentication credentials required', 'UNAUTHORIZED');
      }

      const { id } = req.params;
      const updated = await adminService.updateRewardCampaign(id, req.body, req.user.uid);
      return sendSuccess(res, updated, 200);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET System Announcements
   */
  async getAnnouncements(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new ApiError(401, 'Authentication credentials required', 'UNAUTHORIZED');
      }

      const announcements = await adminService.getAnnouncements();
      return sendSuccess(res, announcements, 200);
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST Create System Announcement
   */
  async createAnnouncement(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new ApiError(401, 'Authentication credentials required', 'UNAUTHORIZED');
      }

      const announcement = await adminService.createAnnouncement(req.body, req.user.uid);
      return sendSuccess(res, announcement, 201);
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE System Announcement
   */
  async deleteAnnouncement(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new ApiError(401, 'Authentication credentials required', 'UNAUTHORIZED');
      }

      const { id } = req.params;
      const result = await adminService.deleteAnnouncement(id, req.user.uid);
      return sendSuccess(res, result, 200);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET Admin Profile details & 2FA status
   */
  async getAdminProfile(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new ApiError(401, 'Authentication credentials required', 'UNAUTHORIZED');
      }

      const user = await userRepository.findByUid(req.user.uid);
      if (!user) {
        throw new ApiError(404, 'Admin profile not found', 'NOT_FOUND');
      }

      const sec = await adminSecurityRepository.findByUserId(user.id);
      const userSettings = await settingsRepository.findUserSettingsByUserId(user.id);

      const isTotpEnabled = !!(
        (sec && (sec.totpEnabled === true || String(sec.totpEnabled) === 'true') && sec.totpSecret) ||
        (userSettings && (userSettings.mfaEnabled === true || String(userSettings.mfaEnabled) === 'true') && userSettings.mfaSecret)
      );

      return sendSuccess(res, {
        id: user.id,
        uid: user.uid,
        name: user.name || user.username || 'Admin Operator',
        email: user.email,
        username: user.username,
        role: user.role,
        status: user.status,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        totpEnabled: isTotpEnabled,
        hasRecoveryCodes: !!sec?.recoveryCodes,
      }, 200);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET Setup details for Google Authenticator (TOTP secret & QR Code Data URL)
   */
  async getMfaSetup(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new ApiError(401, 'Authentication credentials required', 'UNAUTHORIZED');
      }

      const user = await userRepository.findByUid(req.user.uid);
      if (!user) {
        throw new ApiError(404, 'Admin profile not found', 'NOT_FOUND');
      }

      const secret = totp.generateSecret();
      const encryptedSecret = encryptText(secret);

      await adminSecurityRepository.upsertAdminSecurity(user.id, {
        totpSecret: encryptedSecret,
      });

      const otpauthUrl = totp.getOtpauthUrl(user.email, secret, 'MetaFirm Admin');
      const qrCodeUrl = await QRCode.toDataURL(otpauthUrl);

      return sendSuccess(res, {
        secret,
        otpauthUrl,
        qrCodeUrl,
      }, 200);
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST Enable Google Authenticator & Generate 10 Recovery Codes
   */
  async enableMfa(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new ApiError(401, 'Authentication credentials required', 'UNAUTHORIZED');
      }

      const { code, secret } = req.body;
      if (!code || !code.trim()) {
        throw new ApiError(400, '6-digit verification code from Google Authenticator is required.', 'BAD_REQUEST');
      }

      const user = await userRepository.findByUid(req.user.uid);
      if (!user) {
        throw new ApiError(404, 'Admin profile not found', 'NOT_FOUND');
      }

      const sec = await adminSecurityRepository.findByUserId(user.id);
      let mfaSecret = secret;
      if (!mfaSecret && sec?.totpSecret) {
        mfaSecret = decryptText(sec.totpSecret);
      }

      if (!mfaSecret) {
        throw new ApiError(400, 'MFA setup has not been initiated. Please fetch QR Code configuration first.', 'BAD_REQUEST');
      }

      const isValid = totp.verifyToken(mfaSecret, code.trim());
      if (!isValid) {
        throw new ApiError(400, 'Invalid Google Authenticator code. Verification failed.', 'BAD_REQUEST');
      }

      // Generate 10 random recovery codes (8 chars uppercase)
      const rawRecoveryCodes: string[] = [];
      const hashedRecoveryCodes: string[] = [];

      for (let i = 0; i < 10; i++) {
        const raw = crypto.randomBytes(4).toString('hex').toUpperCase(); // 8 characters
        rawRecoveryCodes.push(raw);
        hashedRecoveryCodes.push(hashCode(raw));
      }

      await adminSecurityRepository.upsertAdminSecurity(user.id, {
        totpEnabled: true,
        totpSecret: encryptText(mfaSecret),
        recoveryCodes: JSON.stringify(hashedRecoveryCodes),
      });

      await settingsRepository.updateUserSettings(user.id, {
        mfaEnabled: true,
        mfaSecret: encryptText(mfaSecret),
      });

      await SecurityLogger.logActivity({
        userId: user.id,
        event: 'SECURITY_EVENT',
        status: 'SUCCESS',
        details: 'Admin enabled Google Authenticator 2FA and generated recovery codes.',
      });

      return sendSuccess(res, {
        message: 'Google Authenticator 2FA enabled successfully!',
        recoveryCodes: rawRecoveryCodes,
      }, 200);
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST Disable Google Authenticator
   */
  async disableMfa(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new ApiError(401, 'Authentication credentials required', 'UNAUTHORIZED');
      }

      const { code } = req.body;
      if (!code || !code.trim()) {
        throw new ApiError(400, 'Google Authenticator verification code is required.', 'BAD_REQUEST');
      }

      const user = await userRepository.findByUid(req.user.uid);
      if (!user) {
        throw new ApiError(404, 'Admin profile not found', 'NOT_FOUND');
      }

      const sec = await adminSecurityRepository.findByUserId(user.id);
      if (!sec || !sec.totpEnabled || !sec.totpSecret) {
        throw new ApiError(400, 'Google Authenticator is not currently enabled for this account.', 'BAD_REQUEST');
      }

      const decryptedSecret = decryptText(sec.totpSecret);
      const isValid = totp.verifyToken(decryptedSecret, code.trim());

      if (!isValid) {
        throw new ApiError(400, 'Invalid verification code. Could not disable 2FA.', 'BAD_REQUEST');
      }

      await adminSecurityRepository.upsertAdminSecurity(user.id, {
        totpEnabled: false,
        totpSecret: null,
        recoveryCodes: null,
      });

      await settingsRepository.updateUserSettings(user.id, {
        mfaEnabled: false,
        mfaSecret: null,
      });

      await SecurityLogger.logActivity({
        userId: user.id,
        event: 'SECURITY_EVENT',
        status: 'SUCCESS',
        details: 'Admin disabled Google Authenticator 2FA.',
      });

      return sendSuccess(res, {
        message: 'Google Authenticator 2FA disabled successfully!',
      }, 200);
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST Regenerate Recovery Codes
   */
  async regenerateRecoveryCodes(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new ApiError(401, 'Authentication credentials required', 'UNAUTHORIZED');
      }

      const { code } = req.body;
      if (!code || !code.trim()) {
        throw new ApiError(400, 'Google Authenticator code is required to regenerate recovery codes.', 'BAD_REQUEST');
      }

      const user = await userRepository.findByUid(req.user.uid);
      if (!user) {
        throw new ApiError(404, 'Admin profile not found', 'NOT_FOUND');
      }

      const sec = await adminSecurityRepository.findByUserId(user.id);
      if (!sec || !sec.totpEnabled || !sec.totpSecret) {
        throw new ApiError(400, 'Google Authenticator 2FA must be enabled before generating recovery codes.', 'BAD_REQUEST');
      }

      const decryptedSecret = decryptText(sec.totpSecret);
      const isValid = totp.verifyToken(decryptedSecret, code.trim());
      if (!isValid) {
        throw new ApiError(400, 'Invalid Google Authenticator code.', 'BAD_REQUEST');
      }

      const rawRecoveryCodes: string[] = [];
      const hashedRecoveryCodes: string[] = [];

      for (let i = 0; i < 10; i++) {
        const raw = crypto.randomBytes(4).toString('hex').toUpperCase();
        rawRecoveryCodes.push(raw);
        hashedRecoveryCodes.push(hashCode(raw));
      }

      await adminSecurityRepository.upsertAdminSecurity(user.id, {
        recoveryCodes: JSON.stringify(hashedRecoveryCodes),
      });

      await SecurityLogger.logActivity({
        userId: user.id,
        event: 'SECURITY_EVENT',
        status: 'SUCCESS',
        details: 'Admin regenerated 2FA recovery codes.',
      });

      return sendSuccess(res, {
        message: 'New recovery codes generated successfully!',
        recoveryCodes: rawRecoveryCodes,
      }, 200);
    } catch (error) {
      next(error);
    }
  }
}

export const adminController = new AdminController();
export default adminController;
