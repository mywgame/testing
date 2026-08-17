/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middlewares/auth.ts';
import { userService } from '../services/userService.ts';
import { dashboardService } from '../services/dashboardService.ts';
import { claimService } from '../services/claimService.ts';
import { supportService } from '../services/supportService.ts';
import { notificationService } from '../services/notificationService.ts';
import { sendSuccess } from '../utils/response.ts';
import { ApiError } from '../middlewares/errorHandler.ts';
import { UserRole } from '../../shared/types/index.ts';
import { db } from '../../src/db/index.ts';
import { wallets, vipStatus } from '../../src/db/schema.ts';
import { eq } from 'drizzle-orm';
import { depositService } from '../services/depositService.ts';
import { blockchainProvider } from '../services/blockchainProvider.ts';
import { depositAddressRepository } from '../repositories/depositAddressRepository.ts';
import { depositRepository } from '../repositories/depositRepository.ts';
import { transactionRepository } from '../repositories/transactionRepository.ts';
import { settingsRepository } from '../repositories/settingsRepository.ts';
import { withdrawalRepository } from '../repositories/withdrawalRepository.ts';
import { withdrawalService } from '../services/withdrawalService.ts';
import { emailService } from '../services/emailService.ts';
import { totp } from '../utils/totp.ts';
import { otpService } from '../cache/services/otpService.ts';
import { addressService } from '../blockchain/services/AddressService.ts';
import { referralService } from '../services/referralService.ts';
import { adminService } from '../services/adminService.ts';
import { userRepository } from '../repositories/userRepository.ts';
import { walletRepository } from '../repositories/walletRepository.ts';
import { vipRepository } from '../repositories/vipRepository.ts';
import { claimRepository } from '../repositories/claimRepository.ts';
import { teamCommissionHistoryRepository } from '../repositories/teamCommissionHistoryRepository.ts';

function isValidCryptoAddress(network: string, address: string): boolean {
  if (network === 'USDT_BEP20' || network === 'USDT_POLYGON') {
    return /^0x[a-fA-F0-9]{40}$/.test(address);
  } else if (network === 'USDT_TRC20') {
    return /^T[a-zA-Z0-9]{33}$/.test(address);
  }
  return false;
}

export class UserController {
  /**
   * Sync authenticated User credentials to local PostgreSQL database
   */
  async syncUser(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new ApiError(401, 'Authentication credentials required', 'UNAUTHORIZED');
      }

      const { uid, email } = req.user;

      const syncedUser = await userService.syncUserAuthentication(uid, email);
      return sendSuccess(res, syncedUser, 200);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Fetch details of currently authenticated user profile
   */
  async getProfile(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new ApiError(401, 'Authentication credentials required', 'UNAUTHORIZED');
      }

      const user = await userService.getUserProfile(req.user.uid);
      const walletRecord = await db.select().from(wallets).where(eq(wallets.userId, user.id));
      const vipRecord = await db.select().from(vipStatus).where(eq(vipStatus.userId, user.id));

      const profile = {
        ...user,
        walletBalance: walletRecord[0] ? parseFloat(walletRecord[0].availableBalance) : 0,
        vipTier: vipRecord[0] ? vipRecord[0].tier : 'VIP_0',
      };

      return sendSuccess(res, profile, 200);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Fetch compiled dashboard aggregation metrics for currently authenticated user
   */
  async getDashboard(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new ApiError(401, 'Authentication credentials required', 'UNAUTHORIZED');
      }

      const userProfile = await userService.getUserProfile(req.user.uid);
      const dashboardData = await dashboardService.getDashboardData(userProfile.id);
      
      return sendSuccess(res, dashboardData, 200);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Fetch official VIP Qualification Matrix and requirements
   */
  async getVipMatrix(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new ApiError(401, 'Authentication credentials required', 'UNAUTHORIZED');
      }

      const { vipService } = await import('../services/vipService.ts');
      const matrix = vipService.getVipMatrix();
      return sendSuccess(res, matrix, 200);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Execute manual Daily DPY yield claim
   */
  async claimYield(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new ApiError(401, 'Authentication credentials required', 'UNAUTHORIZED');
      }

      const { claimId } = req.body;
      if (!claimId) {
        throw new ApiError(400, 'Claim ID is required to process yield.', 'BAD_REQUEST');
      }

      const userProfile = await userService.getUserProfile(req.user.uid);
      const result = await claimService.claimDailyYield(claimId, userProfile.id);

      return sendSuccess(res, result, 200);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update Profile info (Name and Phone)
   */
  async updateProfile(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new ApiError(401, 'Authentication credentials required', 'UNAUTHORIZED');
      }

      const { name, phone } = req.body;
      const result = await userService.updateProfile(req.user.uid, { name, phone }, req.ip, req.headers['user-agent']);
      return sendSuccess(res, result, 200);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Change password securely
   */
  async changePassword(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new ApiError(401, 'Authentication credentials required', 'UNAUTHORIZED');
      }

      const { currentPassword, newPassword, confirmPassword } = req.body;
      if (!currentPassword || !newPassword || !confirmPassword) {
        throw new ApiError(400, 'All password fields are required.', 'BAD_REQUEST');
      }

      if (newPassword !== confirmPassword) {
        throw new ApiError(400, 'Passwords do not match.', 'BAD_REQUEST');
      }

      const result = await userService.changePassword(
        req.user.uid,
        { currentPlain: currentPassword, newPlain: newPassword },
        req.ip,
        req.headers['user-agent']
      );

      return sendSuccess(res, result, 200);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Change email address
   */
  async changeEmail(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new ApiError(401, 'Authentication credentials required', 'UNAUTHORIZED');
      }

      const { currentPassword, newEmail } = req.body;
      if (!currentPassword || !newEmail) {
        throw new ApiError(400, 'Current password and new email are required.', 'BAD_REQUEST');
      }

      const result = await userService.changeEmail(
        req.user.uid,
        { currentPlain: currentPassword, newEmail },
        req.ip,
        req.headers['user-agent']
      );

      return sendSuccess(res, result, 200);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Fetch active sessions for currently authenticated user
   */
  async getSessions(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new ApiError(401, 'Authentication credentials required', 'UNAUTHORIZED');
      }

      const sessionsList = await userService.getSessions(req.user.uid);
      return sendSuccess(res, sessionsList, 200);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Terminate all other sessions except current
   */
  async logoutAllOthers(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new ApiError(401, 'Authentication credentials required', 'UNAUTHORIZED');
      }

      // Read refreshToken from signed/unsigned cookies or request body
      const refreshToken = req.cookies?.refreshToken || req.body?.refreshToken;
      if (!refreshToken) {
        throw new ApiError(400, 'No active refresh token found. Unable to authenticate session to keep.', 'BAD_REQUEST');
      }

      const result = await userService.logoutAllOthers(
        req.user.uid,
        refreshToken,
        req.ip,
        req.headers['user-agent']
      );

      return sendSuccess(res, result, 200);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET Admin level users list
   */
  async getAdminUserList(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new ApiError(401, 'Authentication credentials required', 'UNAUTHORIZED');
      }

      const userList = await userService.getAdminUserList();
      return sendSuccess(res, userList, 200);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Admin actions on users
   */
  async adminActionUser(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new ApiError(401, 'Authentication credentials required', 'UNAUTHORIZED');
      }

      const { targetUid } = req.params;
      const { action, password, value } = req.body;

      if (!targetUid) {
        throw new ApiError(400, 'Target user UID is required', 'BAD_REQUEST');
      }

      const updatedUser = await userService.adminActionUser(
        req.user.uid,
        targetUid,
        { action, password, value },
        req.ip,
        req.headers['user-agent']
      );

      return sendSuccess(res, updatedUser, 200);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Fetch current security summary profile metrics
   */
  async getSecuritySummary(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new ApiError(401, 'Authentication credentials required', 'UNAUTHORIZED');
      }

      const summary = await userService.getSecuritySummary(req.user.uid);
      return sendSuccess(res, summary, 200);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Legacy Admin update user role (backwards compatible)
   */
  async adminUpdateUser(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { targetUid } = req.params;
      const { role } = req.body;

      if (!targetUid) {
        throw new ApiError(400, 'Target user UID is required', 'BAD_REQUEST');
      }

      const updatedUser = await userService.updateProfileByAdmin(
        targetUid,
        role as UserRole
      );
      return sendSuccess(res, updatedUser, 200);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET Fetch support tickets created by the authenticated user
   */
  async getSupportTickets(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new ApiError(401, 'Authentication credentials required', 'UNAUTHORIZED');
      }
      const user = await userService.getUserProfile(req.user.uid);
      const tickets = await supportService.getUserTickets(user.id);
      return sendSuccess(res, tickets, 200);
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST Create a support ticket
   */
  async createSupportTicket(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new ApiError(401, 'Authentication credentials required', 'UNAUTHORIZED');
      }
      const user = await userService.getUserProfile(req.user.uid);
      const { category, subject, description, attachmentName, attachmentData } = req.body;

      if (!category || !subject || !description) {
        throw new ApiError(400, 'Category, subject, and description are required fields.', 'BAD_REQUEST');
      }

      const ticket = await supportService.createSupportTicket({
        userId: user.id,
        category,
        subject,
        description,
        attachmentName,
        attachmentData,
      });

      return sendSuccess(res, ticket, 201);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET Fetch conversation messages under a support ticket
   */
  async getTicketMessages(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new ApiError(401, 'Authentication credentials required', 'UNAUTHORIZED');
      }
      const user = await userService.getUserProfile(req.user.uid);
      const { ticketId } = req.params;

      if (!ticketId) {
        throw new ApiError(400, 'Ticket ID is required', 'BAD_REQUEST');
      }

      const messages = await supportService.getTicketMessages(ticketId, user.id, false);
      return sendSuccess(res, messages, 200);
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST Reply to an existing support ticket
   */
  async replyToTicket(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new ApiError(401, 'Authentication credentials required', 'UNAUTHORIZED');
      }
      const user = await userService.getUserProfile(req.user.uid);
      const { ticketId } = req.params;
      const { message } = req.body;

      if (!ticketId || !message) {
        throw new ApiError(400, 'Ticket ID and message content are required', 'BAD_REQUEST');
      }

      const messageRecord = await supportService.addTicketReply({
        ticketId,
        senderId: user.id,
        senderType: 'USER',
        message,
      });

      return sendSuccess(res, messageRecord, 201);
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST Close a support ticket
   */
  async closeTicket(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new ApiError(401, 'Authentication credentials required', 'UNAUTHORIZED');
      }
      const user = await userService.getUserProfile(req.user.uid);
      const { ticketId } = req.params;

      if (!ticketId) {
        throw new ApiError(400, 'Ticket ID is required', 'BAD_REQUEST');
      }

      const ticket = await supportService.getTicketById(ticketId);
      if (!ticket) {
        throw new ApiError(404, 'Ticket not found', 'NOT_FOUND');
      }
      if (ticket.userId !== user.id) {
        throw new ApiError(403, 'Unauthorized to close this support ticket', 'FORBIDDEN');
      }

      const updatedTicket = await supportService.updateTicketProperties(ticketId, {
        status: 'CLOSED'
      });

      return sendSuccess(res, updatedTicket, 200);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET Fetch notifications for the authenticated user
   */
  async getNotifications(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new ApiError(401, 'Authentication credentials required', 'UNAUTHORIZED');
      }
      const user = await userService.getUserProfile(req.user.uid);
      const notifications = await notificationService.getUserNotifications(user.id);
      return sendSuccess(res, notifications, 200);
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST Mark a single notification as read
   */
  async markNotificationRead(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new ApiError(401, 'Authentication credentials required', 'UNAUTHORIZED');
      }
      const user = await userService.getUserProfile(req.user.uid);
      const { id } = req.params;
      if (!id) {
        throw new ApiError(400, 'Notification ID is required', 'BAD_REQUEST');
      }
      const updated = await notificationService.markNotificationAsRead(id, user.id);
      return sendSuccess(res, updated, 200);
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST Mark all notifications as read
   */
  async markAllNotificationsRead(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new ApiError(401, 'Authentication credentials required', 'UNAUTHORIZED');
      }
      const user = await userService.getUserProfile(req.user.uid);
      await notificationService.markAllNotificationsAsRead(user.id);
      return sendSuccess(res, { success: true }, 200);
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE Delete/Dismiss a single notification
   */
  async deleteNotification(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new ApiError(401, 'Authentication credentials required', 'UNAUTHORIZED');
      }
      const user = await userService.getUserProfile(req.user.uid);
      const { id } = req.params;
      if (!id) {
        throw new ApiError(400, 'Notification ID is required', 'BAD_REQUEST');
      }
      const deleted = await notificationService.deleteNotification(id, user.id);
      return sendSuccess(res, deleted, 200);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Verify and automatically credit a deposit based on a provided transaction hash.
   */
  async verifyDeposit(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new ApiError(401, 'Authentication credentials required', 'UNAUTHORIZED');
      }

      const { txHash, network } = req.body;
      if (!txHash || !network) {
        throw new ApiError(400, 'Transaction Hash and Network are required.', 'BAD_REQUEST');
      }

      const user = await userService.getUserProfile(req.user.uid);
      
      // 1. Fetch user's assigned deposit address for this network
      const userAddressRecord = await depositAddressRepository.findByUserAndNetwork(user.id, network);
      if (!userAddressRecord) {
        throw new ApiError(404, 'No deposit address generated for this network. Please contact support.', 'NOT_FOUND');
      }

      const assignedAddress = userAddressRecord.address;

      // 2. Query blockchain via provider
      const blockchainTx = await blockchainProvider.getTransaction(network, txHash);
      if (!blockchainTx) {
        throw new ApiError(404, 'Transaction hash not found on the blockchain. Please verify and retry.', 'NOT_FOUND');
      }

      // 3. Perform security and business logic checks
      if (!blockchainTx.isSuccessful) {
        throw new ApiError(400, 'The provided transaction failed on-chain.', 'BAD_REQUEST');
      }

      // Check if receiver matches user's assigned address (ignoring case)
      if (blockchainTx.receiver.toLowerCase() !== assignedAddress.toLowerCase()) {
        throw new ApiError(400, `Transaction receiver (${blockchainTx.receiver}) does not match your assigned address for this network.`, 'BAD_REQUEST');
      }

      // Prevent replay attacks (check if deposit already exists for this txHash)
      const existingDeposit = await depositRepository.findByTxHash(txHash);
      if (existingDeposit) {
        throw new ApiError(400, 'This transaction hash has already been verified and credited.', 'REPLAY_ATTACK');
      }

      // 4. Create pending deposit record and process success atomically in db transaction
      const deposit = await depositService.createDeposit(
        user.id,
        blockchainTx.amount,
        network,
        assignedAddress,
        txHash
      );

      const completedDeposit = await depositService.processSuccessfulDeposit(deposit.id, txHash, 'SYSTEM');

      return sendSuccess(res, {
        message: 'Deposit verified and credited successfully!',
        deposit: completedDeposit
      }, 200);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Generates and returns a new 2FA setup secret and QR code URL
   */
  async getMfaSetup(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new ApiError(401, 'Authentication credentials required', 'UNAUTHORIZED');
      }
      
      const user = await userService.getUserProfile(req.user.uid);
      const secret = totp.generateSecret();
      
      // Save secret key temporarily (not yet fully enabled)
      await settingsRepository.updateUserSettings(user.id, {
        mfaSecret: secret
      });

      const otpauthUrl = totp.getOtpauthUrl(user.email, secret, 'MetaFirm');
      
      return sendSuccess(res, {
        secret,
        otpauthUrl,
        qrCodeUrl: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(otpauthUrl)}`
      }, 200);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Verifies the setup code and enables MFA
   */
  async enableMfa(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new ApiError(401, 'Authentication credentials required', 'UNAUTHORIZED');
      }
      
      const { code, secret } = req.body;
      if (!code) {
        throw new ApiError(400, 'Verification code is required.', 'BAD_REQUEST');
      }

      const user = await userService.getUserProfile(req.user.uid);
      const settings = await settingsRepository.findUserSettingsByUserId(user.id);
      const mfaSecret = settings?.mfaSecret || secret;
      
      if (!mfaSecret) {
        throw new ApiError(400, 'MFA setup has not been initiated. Please fetch configuration first.', 'BAD_REQUEST');
      }

      const isValid = totp.verifyToken(mfaSecret, code);
      if (!isValid) {
        throw new ApiError(400, 'Invalid Google Authenticator code. Verification failed.', 'BAD_REQUEST');
      }

      await settingsRepository.updateUserSettings(user.id, {
        mfaEnabled: true,
        mfaSecret: mfaSecret
      });

      return sendSuccess(res, {
        message: 'Google Authenticator 2FA enabled successfully!'
      }, 200);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Disables MFA requiring verification
   */
  async disableMfa(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new ApiError(401, 'Authentication credentials required', 'UNAUTHORIZED');
      }
      
      const { code } = req.body;
      if (!code) {
        throw new ApiError(400, 'Verification code is required.', 'BAD_REQUEST');
      }

      const user = await userService.getUserProfile(req.user.uid);
      const settings = await settingsRepository.findUserSettingsByUserId(user.id);
      
      if (!settings || !settings.mfaEnabled || !settings.mfaSecret) {
        throw new ApiError(400, 'MFA is not currently enabled.', 'BAD_REQUEST');
      }

      const isValid = totp.verifyToken(settings.mfaSecret, code);
      if (!isValid) {
        throw new ApiError(400, 'Invalid Google Authenticator code. Verification failed.', 'BAD_REQUEST');
      }

      await settingsRepository.updateUserSettings(user.id, {
        mfaEnabled: false,
        mfaSecret: null
      });

      return sendSuccess(res, {
        message: 'Google Authenticator 2FA disabled successfully!'
      }, 200);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Retrieves user's registered withdrawal addresses
   */
  async getWithdrawalAddresses(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new ApiError(401, 'Authentication credentials required', 'UNAUTHORIZED');
      }
      const user = await userService.getUserProfile(req.user.uid);
      const settings = await settingsRepository.findUserSettingsByUserId(user.id);
      
      const addresses = settings && settings.withdrawalAddresses 
        ? JSON.parse(settings.withdrawalAddresses) 
        : { USDT_BEP20: [], USDT_POLYGON: [], USDT_TRC20: [] };

      return sendSuccess(res, addresses, 200);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Generates and dispatches Email OTP to add/change withdrawal address
   */
  async sendWithdrawalAddressOtp(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new ApiError(401, 'Authentication credentials required', 'UNAUTHORIZED');
      }
      const { network, address } = req.body;
      if (network && address) {
        if (!isValidCryptoAddress(network, address)) {
          const expected = (network === 'USDT_TRC20') 
            ? 'Tron TRC20 address starting with "T" (34 characters).' 
            : 'EVM (BEP20/Polygon) 0x-prefixed hex address (42 characters).';
          throw new ApiError(400, `Invalid address format for ${network}. Expected ${expected}`, 'BAD_REQUEST');
        }
      }

      const user = await userService.getUserProfile(req.user.uid);
      const { otp } = await otpService.generateAndStoreOtp(user.email, 'withdrawal-address');
      
      await emailService.sendOtpEmail(user.email, otp, 'Registering new withdrawal address');
      
      return sendSuccess(res, {
        message: 'OTP sent successfully to your registered email.',
      }, 200);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Validates Email OTP and adds a verified withdrawal address
   */
  async addWithdrawalAddress(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new ApiError(401, 'Authentication credentials required', 'UNAUTHORIZED');
      }
      const { network, address, otp } = req.body;
      if (!network || !address || !otp) {
        throw new ApiError(400, 'Network, address, and OTP code are required.', 'BAD_REQUEST');
      }

      if (!isValidCryptoAddress(network, address)) {
        const expected = (network === 'USDT_TRC20') 
          ? 'Tron TRC20 address starting with "T" (34 characters).' 
          : 'EVM (BEP20/Polygon) 0x-prefixed hex address (42 characters).';
        throw new ApiError(400, `Invalid address format for ${network}. Expected ${expected}`, 'BAD_REQUEST');
      }

      const user = await userService.getUserProfile(req.user.uid);
      
      // Verify Email OTP
      await otpService.verifyOtp(user.email, otp, 'withdrawal-address');

      // Update addresses map in DB
      const settings = await settingsRepository.findUserSettingsByUserId(user.id);
      const addresses = settings && settings.withdrawalAddresses 
        ? JSON.parse(settings.withdrawalAddresses) 
        : { USDT_BEP20: [], USDT_POLYGON: [], USDT_TRC20: [] };

      if (!addresses[network]) {
        addresses[network] = [];
      }
      
      // Ensure no duplicates
      if (!addresses[network].includes(address)) {
        addresses[network].push(address);
      }

      await settingsRepository.updateUserSettings(user.id, {
        withdrawalAddresses: JSON.stringify(addresses)
      });

      return sendSuccess(res, {
        message: 'Withdrawal address added and verified successfully!',
        addresses
      }, 200);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Deletes a registered withdrawal address
   */
  async deleteWithdrawalAddress(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new ApiError(401, 'Authentication credentials required', 'UNAUTHORIZED');
      }
      const { network, address } = req.body;
      if (!network || !address) {
        throw new ApiError(400, 'Network and address are required.', 'BAD_REQUEST');
      }

      const user = await userService.getUserProfile(req.user.uid);
      const settings = await settingsRepository.findUserSettingsByUserId(user.id);
      
      const addresses = settings && settings.withdrawalAddresses 
        ? JSON.parse(settings.withdrawalAddresses) 
        : { USDT_BEP20: [], USDT_POLYGON: [], USDT_TRC20: [] };

      if (addresses[network]) {
        addresses[network] = addresses[network].filter((a: string) => a !== address);
      }

      await settingsRepository.updateUserSettings(user.id, {
        withdrawalAddresses: JSON.stringify(addresses)
      });

      return sendSuccess(res, {
        message: 'Withdrawal address deleted successfully.',
        addresses
      }, 200);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Generates and dispatches Email OTP to process a withdrawal
   */
  async sendWithdrawalOtp(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new ApiError(401, 'Authentication credentials required', 'UNAUTHORIZED');
      }
      const user = await userService.getUserProfile(req.user.uid);
      const { otp } = await otpService.generateAndStoreOtp(user.email, 'withdrawal');
      
      await emailService.sendOtpEmail(user.email, otp, 'Initiating an outbound withdrawal');
      
      return sendSuccess(res, {
        message: 'OTP sent successfully to your registered email.',
      }, 200);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Dual-factor validated withdrawal submission
   */
  async requestWithdrawal(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new ApiError(401, 'Authentication credentials required', 'UNAUTHORIZED');
      }
      const { amount, network, walletAddress, emailOtp, googleAuth2fa } = req.body;
      if (!amount || !network || !walletAddress || !emailOtp || !googleAuth2fa) {
        throw new ApiError(400, 'Amount, network, address, Email OTP, and Authenticator code are required.', 'BAD_REQUEST');
      }

      const user = await userService.getUserProfile(req.user.uid);
      const settings = await settingsRepository.findUserSettingsByUserId(user.id);

      // 1. Verify Email OTP
      await otpService.verifyOtp(user.email, emailOtp, 'withdrawal');

      // 2. Verify Google Authenticator (if enabled)
      if (settings && settings.mfaEnabled && settings.mfaSecret) {
        const isValid = totp.verifyToken(settings.mfaSecret, googleAuth2fa);
        if (!isValid) {
          throw new ApiError(400, 'Invalid Google Authenticator code.', 'BAD_REQUEST');
        }
      } else {
        throw new ApiError(400, 'Multi-Factor Google Authenticator is required for withdrawal execution. Please enable it in Security first.', 'BAD_REQUEST');
      }

      // 3. Verify destination address matches one of the user's registered & verified addresses
      const verifiedAddresses = settings && settings.withdrawalAddresses
        ? JSON.parse(settings.withdrawalAddresses)
        : {};
      const networkList = verifiedAddresses[network] || [];
      if (!networkList.includes(walletAddress)) {
        throw new ApiError(400, 'The specified withdrawal address has not been registered and verified in your Security configuration.', 'BAD_REQUEST');
      }

      // 4. Delegate to transactionally safe withdrawal service
      const withdrawal = await withdrawalService.createWithdrawal(
        user.id,
        amount,
        walletAddress,
        network
      );

      return sendSuccess(res, {
        message: 'Withdrawal request submitted successfully for administrative review.',
        withdrawal
      }, 201);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Fetch deposits for the current user
   */
  async getDeposits(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new ApiError(401, 'Authentication credentials required', 'UNAUTHORIZED');
      }
      const user = await userService.getUserProfile(req.user.uid);
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
      const offset = req.query.offset ? parseInt(req.query.offset as string) : 0;
      const status = req.query.status as string | undefined;
      const list = await depositRepository.findByUserId(user.id, { limit, offset, status });
      return sendSuccess(res, list, 200);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Fetch transactions for the current user
   */
  async getTransactions(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new ApiError(401, 'Authentication credentials required', 'UNAUTHORIZED');
      }
      const user = await userService.getUserProfile(req.user.uid);
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 200;
      const offset = req.query.offset ? parseInt(req.query.offset as string) : 0;
      const type = req.query.type as string | undefined;
      const status = req.query.status as string | undefined;

      // Filter transactions for the last 3 months (90 days)
      const threeMonthsAgo = new Date();
      threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

      const list = await transactionRepository.findByUserId(user.id, {
        limit,
        offset,
        type,
        status,
        startDate: threeMonthsAgo,
      });
      return sendSuccess(res, list, 200);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Fetch withdrawals for the current user
   */
  async getWithdrawals(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new ApiError(401, 'Authentication credentials required', 'UNAUTHORIZED');
      }
      const user = await userService.getUserProfile(req.user.uid);
      const list = await withdrawalRepository.findByUserId(user.id);
      return sendSuccess(res, list, 200);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Generate or retrieve a permanent deposit address for a selected network
   */
  async generateDepositAddress(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new ApiError(401, 'Authentication credentials required', 'UNAUTHORIZED');
      }

      const { network } = req.body;
      if (!network) {
        throw new ApiError(400, 'Network parameter is required.', 'BAD_REQUEST');
      }

      const user = await userService.getUserProfile(req.user.uid);
      const addressRecord = await addressService.getOrCreateDepositAddress(user.id, network);

      return sendSuccess(res, addressRecord, 200);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Fetch team members for currently authenticated user
   */
  async getTeamMembers(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new ApiError(401, 'Authentication credentials required', 'UNAUTHORIZED');
      }

      const user = await userService.getUserProfile(req.user.uid);
      const userVip = await vipRepository.findByUserId(user.id);
      const userTier = userVip?.tier || 'VIP1';

      const descendants = await referralService.getDownlineDescendants(user.id);
      const totalCommissionsMap = await teamCommissionHistoryRepository.getTotalCommissionsByReceiver(user.id);
      const now = new Date();

      const members = await Promise.all(
        descendants.map(async (d) => {
          const childUser = await userRepository.findById(d.childId);
          const childWallet = await walletRepository.findByUserId(d.childId);
          const childVip = await vipRepository.findByUserId(d.childId);

          const levelLabel = d.referralLevel === 1 ? 'Level A' : d.referralLevel === 2 ? 'Level B' : d.referralLevel === 3 ? 'Level C' : 'Level D';

          // Determine today's DPY generated/claimed by that team member
          let childClaim = (await claimRepository.findAnyClaimInWindow(d.childId, now))[0] || null;
          if (!childClaim) {
            childClaim = await claimService.generateClaimForUser(d.childId, now);
          }

          const childDpyAmount = childClaim ? parseFloat(childClaim.rewardAmount) : 0;

          // Check current user's team commission eligibility for this referral level
          const actualRate = referralService.getTeamCommissionRate(userTier, d.referralLevel);
          const isEligible = actualRate > 0;

          let contributionAmount = 0;
          let contributionStatus: 'Qualified' | 'Missed' = 'Qualified';
          let formattedIncome = '$0.00';

          if (isEligible) {
            // Actual Team Commission calculation for eligible upline
            contributionAmount = childDpyAmount * actualRate;
            contributionStatus = 'Qualified';
            formattedIncome = `+$${contributionAmount.toFixed(2)}`;
          } else {
            // Informational display only: amount that would have been Qualified if VIP qualification was met
            const potentialRate = referralService.getBaseCommissionRate(d.referralLevel);
            contributionAmount = childDpyAmount * potentialRate;
            contributionStatus = 'Missed';
            formattedIncome = `$${contributionAmount.toFixed(2)}`;
          }

          // Cumulative total contribution from this member to current user
          const cumulativeContribution = totalCommissionsMap[d.childId] || 0;
          const formattedTotalContribution = `$${cumulativeContribution.toFixed(2)}`;

          const rawUserId = childUser?.userId || (childUser as any)?.user_id;
          const visibleUserId = (rawUserId && rawUserId !== 'DS------')
            ? rawUserId
            : (childUser ? `DS${childUser.id.replace(/-/g, '').slice(0, 6).toUpperCase()}` : 'DS000000');

          return {
            id: d.childId,
            username: childUser?.username || 'user_' + d.childId.slice(0, 6),
            userId: visibleUserId,
            referralLevel: d.referralLevel,
            levelLabel,
            vipRank: childVip?.tier || 'VIP1',
            todaysIncome: formattedIncome,
            totalContribution: formattedTotalContribution,
            totalContributionAmount: cumulativeContribution,
            contributionAmount,
            contributionStatus,
            isEligible,
            claimedDpy: childDpyAmount.toFixed(2),
            totalDeposited: childWallet?.totalDeposited || '0.00000000',
            createdAt: childUser?.createdAt || new Date(),
          };
        })
      );

      return sendSuccess(res, members, 200);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Fetch active platform announcements broadcasted by admin
   */
  async getAnnouncements(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const announcements = await adminService.getAnnouncements();
      return sendSuccess(res, announcements || [], 200);
    } catch (error) {
      next(error);
    }
  }
}

export const userController = new UserController();
export default userController;
