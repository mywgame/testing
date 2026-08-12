/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Router } from 'express';
import { userController } from '../../controllers/userController.ts';
import { requireAuth, requireRole } from '../../middlewares/auth.ts';
import { validateRequest } from '../../middlewares/validate.ts';
import { RegisterUserSchema, UpdateUserAdminSchema } from '../../../shared/validators/index.ts';
import { UserRole } from '../../../shared/types/index.ts';

const router = Router();

/**
 * @route POST /api/v1/users/sync
 * @desc Sync authenticated user credentials
 * @access Private (JWT Auth token required)
 */
router.post(
  '/sync',
  requireAuth,
  validateRequest(RegisterUserSchema),
  userController.syncUser
);

/**
 * @route GET /api/v1/users/profile
 * @desc Get currently authenticated user profile info
 * @access Private
 */
router.get(
  '/profile',
  requireAuth,
  userController.getProfile
);

/**
 * @route GET /api/v1/users/dashboard
 * @desc Get currently authenticated user dashboard metrics
 * @access Private
 */
router.get(
  '/dashboard',
  requireAuth,
  userController.getDashboard
);

/**
 * @route GET /api/v1/users/vip-matrix
 * @desc Get official VIP qualification requirements matrix
 * @access Private
 */
router.get(
  '/vip-matrix',
  requireAuth,
  userController.getVipMatrix
);

/**
 * @route POST /api/v1/users/claim-yield
 * @desc Claim daily yield DPY reward manually
 * @access Private
 */
router.post(
  '/claim-yield',
  requireAuth,
  userController.claimYield
);

/**
 * @route PATCH /api/v1/users/profile
 * @desc Update user profile display info (Name & Phone)
 * @access Private
 */
router.patch(
  '/profile',
  requireAuth,
  userController.updateProfile
);

/**
 * @route POST /api/v1/users/security/change-password
 * @desc Update password securely
 * @access Private
 */
router.post(
  '/security/change-password',
  requireAuth,
  userController.changePassword
);

/**
 * @route POST /api/v1/users/security/change-email
 * @desc Update email address securely
 * @access Private
 */
router.post(
  '/security/change-email',
  requireAuth,
  userController.changeEmail
);

/**
 * @route GET /api/v1/users/security/sessions
 * @desc Fetch active user sessions list
 * @access Private
 */
router.get(
  '/security/sessions',
  requireAuth,
  userController.getSessions
);

/**
 * @route POST /api/v1/users/security/sessions/logout-all-others
 * @desc Terminate other sessions
 * @access Private
 */
router.post(
  '/security/sessions/logout-all-others',
  requireAuth,
  userController.logoutAllOthers
);

/**
 * @route GET /api/v1/users/security/summary
 * @desc Get security audit profile metrics
 * @access Private
 */
router.get(
  '/security/summary',
  requireAuth,
  userController.getSecuritySummary
);

/**
 * @route GET /api/v1/users/admin/list
 * @desc Fetch list of users with details (Admin only)
 * @access Private (Admin and Superadmin only)
 */
router.get(
  '/admin/list',
  requireAuth,
  requireRole([UserRole.ADMIN, UserRole.SUPERADMIN]),
  userController.getAdminUserList
);

/**
 * @route POST /api/v1/users/admin/action/:targetUid
 * @desc Perform admin action on user account (Admin only)
 * @access Private (Admin and Superadmin only)
 */
router.post(
  '/admin/action/:targetUid',
  requireAuth,
  requireRole([UserRole.ADMIN, UserRole.SUPERADMIN]),
  userController.adminActionUser
);

/**
 * @route PATCH /api/v1/users/admin/update/:targetUid
 * @desc Modify user role (Admin only - legacy support)
 * @access Private (Admin and Superadmin only)
 */
router.patch(
  '/admin/update/:targetUid',
  requireAuth,
  requireRole([UserRole.ADMIN, UserRole.SUPERADMIN]),
  validateRequest(UpdateUserAdminSchema),
  userController.adminUpdateUser
);

/**
 * @route GET /api/v1/users/notifications
 * @desc Get list of own notifications
 * @access Private
 */
router.get(
  '/notifications',
  requireAuth,
  userController.getNotifications
);

/**
 * @route POST /api/v1/users/notifications/read-all
 * @desc Mark all notifications as read
 * @access Private
 */
router.post(
  '/notifications/read-all',
  requireAuth,
  userController.markAllNotificationsRead
);

/**
 * @route POST /api/v1/users/notifications/:id/read
 * @desc Mark a single notification as read
 * @access Private
 */
router.post(
  '/notifications/:id/read',
  requireAuth,
  userController.markNotificationRead
);

/**
 * @route DELETE /api/v1/users/notifications/:id
 * @desc Delete/Dismiss a single notification
 * @access Private
 */
router.delete(
  '/notifications/:id',
  requireAuth,
  userController.deleteNotification
);

/**
 * @route GET /api/v1/users/support/tickets
 * @desc Get list of own support tickets
 * @access Private
 */
router.get(
  '/support/tickets',
  requireAuth,
  userController.getSupportTickets
);

/**
 * @route POST /api/v1/users/support/tickets
 * @desc Create a support ticket
 * @access Private
 */
router.post(
  '/support/tickets',
  requireAuth,
  userController.createSupportTicket
);

/**
 * @route GET /api/v1/users/support/tickets/:ticketId/messages
 * @desc Retrieve ticket message conversation thread
 * @access Private
 */
router.get(
  '/support/tickets/:ticketId/messages',
  requireAuth,
  userController.getTicketMessages
);

/**
 * @route POST /api/v1/users/support/tickets/:ticketId/messages
 * @desc Submit reply message inside ticket thread
 * @access Private
 */
router.post(
  '/support/tickets/:ticketId/messages',
  requireAuth,
  userController.replyToTicket
);

/**
 * @route POST /api/v1/users/support/tickets/:ticketId/close
 * @desc Mark a support ticket as resolved and closed
 * @access Private
 */
router.post(
  '/support/tickets/:ticketId/close',
  requireAuth,
  userController.closeTicket
);

/**
 * @route GET /api/v1/users/deposits
 * @desc Get list of own deposit records
 * @access Private
 */
router.get(
  '/deposits',
  requireAuth,
  userController.getDeposits
);

/**
 * @route GET /api/v1/users/transactions
 * @desc Get list of own transaction ledger records
 * @access Private
 */
router.get(
  '/transactions',
  requireAuth,
  userController.getTransactions
);

/**
 * @route POST /api/v1/users/deposits/verify
 * @desc Submit and verify transactional deposit hash
 * @access Private
 */
router.post(
  '/deposits/verify',
  requireAuth,
  userController.verifyDeposit
);

/**
 * @route POST /api/v1/users/deposits/address
 * @desc Generate or fetch permanent deposit address on-demand
 * @access Private
 */
router.post(
  '/deposits/address',
  requireAuth,
  userController.generateDepositAddress
);

/**
 * @route GET /api/v1/users/security/mfa/setup
 * @desc Retrieve secret key and otpauth config parameters for 2FA setup
 * @access Private
 */
router.get(
  '/security/mfa/setup',
  requireAuth,
  userController.getMfaSetup
);

/**
 * @route POST /api/v1/users/security/mfa/enable
 * @desc Verify pin code and enable 2FA
 * @access Private
 */
router.post(
  '/security/mfa/enable',
  requireAuth,
  userController.enableMfa
);

/**
 * @route POST /api/v1/users/security/mfa/disable
 * @desc Verify pin code and disable 2FA
 * @access Private
 */
router.post(
  '/security/mfa/disable',
  requireAuth,
  userController.disableMfa
);

/**
 * @route GET /api/v1/users/security/withdrawal-addresses
 * @desc Fetch verified outbound withdrawal addresses
 * @access Private
 */
router.get(
  '/security/withdrawal-addresses',
  requireAuth,
  userController.getWithdrawalAddresses
);

/**
 * @route POST /api/v1/users/security/withdrawal-addresses/send-otp
 * @desc Send verification OTP for registering a withdrawal address
 * @access Private
 */
router.post(
  '/security/withdrawal-addresses/send-otp',
  requireAuth,
  userController.sendWithdrawalAddressOtp
);

/**
 * @route POST /api/v1/users/security/withdrawal-addresses
 * @desc Submit and record verified withdrawal address
 * @access Private
 */
router.post(
  '/security/withdrawal-addresses',
  requireAuth,
  userController.addWithdrawalAddress
);

/**
 * @route DELETE /api/v1/users/security/withdrawal-addresses
 * @desc Delete a registered withdrawal address
 * @access Private
 */
router.delete(
  '/security/withdrawal-addresses',
  requireAuth,
  userController.deleteWithdrawalAddress
);

/**
 * @route POST /api/v1/users/withdrawals/send-otp
 * @desc Send verification OTP for withdrawal processing
 * @access Private
 */
router.post(
  '/withdrawals/send-otp',
  requireAuth,
  userController.sendWithdrawalOtp
);

/**
 * @route POST /api/v1/users/withdrawals/request
 * @desc Submit outbound withdrawal request
 * @access Private
 */
router.post(
  '/withdrawals/request',
  requireAuth,
  userController.requestWithdrawal
);

/**
 * @route GET /api/v1/users/withdrawals
 * @desc Get list of own withdrawal requests
 * @access Private
 */
router.get(
  '/withdrawals',
  requireAuth,
  userController.getWithdrawals
);

/**
 * @route GET /api/v1/users/team/members
 * @desc Get list of own team members
 * @access Private
 */
router.get(
  '/team/members',
  requireAuth,
  userController.getTeamMembers
);

export default router;
