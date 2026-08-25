/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Router } from 'express';
import { adminController } from '../../controllers/adminController.ts';
import { requireAuth, requireRole } from '../../middlewares/auth.ts';
import { UserRole } from '../../../shared/types/index.ts';

const router = Router();

/**
 * @route GET /api/v1/admin/reset/production-cleanup/preview
 * @desc Preview the pre-launch cleanup counts before deleting test users
 * @access Private (Superadmin only)
 */
router.get(
  '/reset/production-cleanup/preview',
  requireAuth,
  requireRole([UserRole.SUPERADMIN]),
  adminController.getProductionCleanupPreview
);

/**
 * @route POST /api/v1/admin/reset/production-cleanup
 * @desc Delete every non-SUPERADMIN user and related testing data
 * @access Private (Superadmin only)
 */
router.post(
  '/reset/production-cleanup',
  requireAuth,
  requireRole([UserRole.SUPERADMIN]),
  adminController.deleteAllTestUsers
);

/**
 * @route GET /api/v1/admin/dashboard/overview
 * @desc Retrieve platform-wide operational statistics and charts for Super Admin & Admin
 * @access Private (Admin and Superadmin only)
 */
router.get(
  '/dashboard/overview',
  requireAuth,
  requireRole([UserRole.ADMIN, UserRole.SUPERADMIN]),
  adminController.getDashboardOverview
);

/**
 * @route GET /api/v1/admin/profile
 * @desc Get Admin Profile & Security status
 * @access Private (Admin and Superadmin)
 */
router.get(
  '/profile',
  requireAuth,
  requireRole([UserRole.ADMIN, UserRole.SUPERADMIN]),
  adminController.getAdminProfile
);

/**
 * @route GET /api/v1/admin/security/setup
 * @desc Setup Google Authenticator 2FA (Secret & QR Code)
 * @access Private (Admin and Superadmin)
 */
router.get(
  '/security/setup',
  requireAuth,
  requireRole([UserRole.ADMIN, UserRole.SUPERADMIN]),
  adminController.getMfaSetup
);

/**
 * @route POST /api/v1/admin/security/enable
 * @desc Enable Google Authenticator 2FA & Generate Recovery Codes
 * @access Private (Admin and Superadmin)
 */
router.post(
  '/security/enable',
  requireAuth,
  requireRole([UserRole.ADMIN, UserRole.SUPERADMIN]),
  adminController.enableMfa
);

/**
 * @route POST /api/v1/admin/security/disable
 * @desc Disable Google Authenticator 2FA
 * @access Private (Admin and Superadmin)
 */
router.post(
  '/security/disable',
  requireAuth,
  requireRole([UserRole.ADMIN, UserRole.SUPERADMIN]),
  adminController.disableMfa
);

/**
 * @route POST /api/v1/admin/security/regenerate-recovery
 * @desc Regenerate Recovery Codes for Google Authenticator 2FA
 * @access Private (Admin and Superadmin)
 */
router.post(
  '/security/regenerate-recovery',
  requireAuth,
  requireRole([UserRole.ADMIN, UserRole.SUPERADMIN]),
  adminController.regenerateRecoveryCodes
);

/**
 * @route GET /api/v1/admin/users
 * @desc Retrieve paginated list of users with search, sort, and filters
 */
router.get(
  '/users',
  requireAuth,
  requireRole([UserRole.ADMIN, UserRole.SUPERADMIN]),
  adminController.getUsers
);

/**
 * @route GET /api/v1/admin/users/:targetUid/profile
 * @desc Get complete details of a single user
 */
router.get(
  '/users/:targetUid/profile',
  requireAuth,
  requireRole([UserRole.ADMIN, UserRole.SUPERADMIN]),
  adminController.getUserProfile
);

/**
 * @route PATCH /api/v1/admin/users/:targetUid/profile
 * @desc Update editable fields of user's profile
 */
router.patch(
  '/users/:targetUid/profile',
  requireAuth,
  requireRole([UserRole.ADMIN, UserRole.SUPERADMIN]),
  adminController.updateUserProfile
);

/**
 * @route GET /api/v1/admin/users/:targetUid/deposit-address-history
 * @desc Get the full (active + archived) deposit address history for a user on a network
 */
router.get(
  '/users/:targetUid/deposit-address-history',
  requireAuth,
  requireRole([UserRole.ADMIN, UserRole.SUPERADMIN]),
  adminController.getUserDepositAddressHistory
);

/**
 * @route POST /api/v1/admin/users/:targetUid/rotate-deposit-address
 * @desc Rotate a user's deposit address on a given network (generates a fresh HD wallet
 *       address and archives the previous one — never deleted).
 */
router.post(
  '/users/:targetUid/rotate-deposit-address',
  requireAuth,
  requireRole([UserRole.ADMIN, UserRole.SUPERADMIN]),
  adminController.rotateUserDepositAddress
);

/**
 * @route POST /api/v1/admin/users/:targetUid/wallet-adjustment
 * @desc Adjust user wallet balances atomically
 */
router.post(
  '/users/:targetUid/wallet-adjustment',
  requireAuth,
  requireRole([UserRole.ADMIN, UserRole.SUPERADMIN]),
  adminController.adjustWalletBalance
);

/**
 * @route POST /api/v1/admin/users/:targetUid/send-notification
 * @desc Send custom notification to user
 */
router.post(
  '/users/:targetUid/send-notification',
  requireAuth,
  requireRole([UserRole.ADMIN, UserRole.SUPERADMIN]),
  adminController.sendNotification
);

/**
 * @route GET /api/v1/admin/users/:targetUid/transactions
 * @desc Retrieve user's transaction history
 */
router.get(
  '/users/:targetUid/transactions',
  requireAuth,
  requireRole([UserRole.ADMIN, UserRole.SUPERADMIN]),
  adminController.getUserTransactions
);

/**
 * @route GET /api/v1/admin/users/:targetUid/deposits
 * @desc Retrieve user's deposit history
 */
router.get(
  '/users/:targetUid/deposits',
  requireAuth,
  requireRole([UserRole.ADMIN, UserRole.SUPERADMIN]),
  adminController.getUserDeposits
);

/**
 * @route GET /api/v1/admin/users/:targetUid/withdrawals
 * @desc Retrieve user's withdrawal history
 */
router.get(
  '/users/:targetUid/withdrawals',
  requireAuth,
  requireRole([UserRole.ADMIN, UserRole.SUPERADMIN]),
  adminController.getUserWithdrawals
);

/**
 * @route GET /api/v1/admin/users/:targetUid/audits
 * @desc Retrieve user's administrative audit trail
 */
router.get(
  '/users/:targetUid/audits',
  requireAuth,
  requireRole([UserRole.ADMIN, UserRole.SUPERADMIN]),
  adminController.getUserAudits
);

/**
 * @route GET /api/v1/admin/users/:targetUid/team
 * @desc Retrieve user's referral team network downlines
 */
router.get(
  '/users/:targetUid/team',
  requireAuth,
  requireRole([UserRole.ADMIN, UserRole.SUPERADMIN]),
  adminController.getUserTeamNetwork
);

/**
 * @route GET /api/v1/admin/support/tickets
 * @desc Retrieve all support tickets in system with filters
 */
router.get(
  '/support/tickets',
  requireAuth,
  requireRole([UserRole.ADMIN, UserRole.SUPERADMIN]),
  adminController.getAdminTickets
);

/**
 * @route GET /api/v1/admin/support/tickets/:ticketId/messages
 * @desc Get complete conversation history of a specific ticket
 */
router.get(
  '/support/tickets/:ticketId/messages',
  requireAuth,
  requireRole([UserRole.ADMIN, UserRole.SUPERADMIN]),
  adminController.getAdminTicketMessages
);

/**
 * @route POST /api/v1/admin/support/tickets/:ticketId/messages
 * @desc Submit admin reply under ticket thread
 */
router.post(
  '/support/tickets/:ticketId/messages',
  requireAuth,
  requireRole([UserRole.ADMIN, UserRole.SUPERADMIN]),
  adminController.replyToTicketAsAdmin
);

/**
 * @route PATCH /api/v1/admin/support/tickets/:ticketId
 * @desc Update support ticket state/properties (status, priority, assignment)
 */
router.patch(
  '/support/tickets/:ticketId',
  requireAuth,
  requireRole([UserRole.ADMIN, UserRole.SUPERADMIN]),
  adminController.updateTicketProperties
);

/**
 * @route POST /api/v1/admin/treasury/sweep/address
 * @desc Sweep a specific user deposit address
 */
router.post(
  '/treasury/sweep/address',
  requireAuth,
  requireRole([UserRole.ADMIN, UserRole.SUPERADMIN]),
  adminController.sweepUserDepositAddress
);

/**
 * @route POST /api/v1/admin/treasury/sweep/all
 * @desc Sweep all eligible deposit addresses on a network
 */
router.post(
  '/treasury/sweep/all',
  requireAuth,
  requireRole([UserRole.ADMIN, UserRole.SUPERADMIN]),
  adminController.sweepAllEligibleAddresses
);

/**
 * @route POST /api/v1/admin/treasury/sweep/hot-to-cold
 * @desc Sweep funds from hot wallet to cold wallet
 */
router.post(
  '/treasury/sweep/hot-to-cold',
  requireAuth,
  requireRole([UserRole.ADMIN, UserRole.SUPERADMIN]),
  adminController.sweepHotToCold
);

/**
 * @route POST /api/v1/admin/treasury/sweep/retry
 * @desc Retry a failed sweep job
 */
router.post(
  '/treasury/sweep/retry',
  requireAuth,
  requireRole([UserRole.ADMIN, UserRole.SUPERADMIN]),
  adminController.sweepRetryJob
);

/**
 * @route POST /api/v1/admin/treasury/auto-sweep-config
 * @desc Update auto sweep threshold and settings
 */
router.post(
  '/treasury/auto-sweep-config',
  requireAuth,
  requireRole([UserRole.ADMIN, UserRole.SUPERADMIN]),
  adminController.updateAutoSweepConfig
);

/**
 * @route GET /api/v1/admin/treasury/sweep-queue
 * @desc Retrieve current sweep queue items with real-time native gas balances
 */
router.get(
  '/treasury/sweep-queue',
  requireAuth,
  requireRole([UserRole.ADMIN, UserRole.SUPERADMIN]),
  adminController.getSweepQueue
);

/**
 * @route GET /api/v1/admin/treasury/:network
 * @desc Retrieve treasury wallet configurations, balances, and deposit addresses for a network
 */
router.get(
  '/treasury/:network',
  requireAuth,
  requireRole([UserRole.ADMIN, UserRole.SUPERADMIN]),
  adminController.getTreasuryOverview
);

/**
 * @route POST /api/v1/admin/treasury/sweep-queue/fund-gas
 * @desc Fund native gas manually for a specific queue item
 */
router.post(
  '/treasury/sweep-queue/fund-gas',
  requireAuth,
  requireRole([UserRole.ADMIN, UserRole.SUPERADMIN]),
  adminController.fundGasQueueItem
);

/**
 * @route POST /api/v1/admin/treasury/sweep-queue/sweep
 * @desc Sweep a specific queue item manually
 */
router.post(
  '/treasury/sweep-queue/sweep',
  requireAuth,
  requireRole([UserRole.ADMIN, UserRole.SUPERADMIN]),
  adminController.sweepQueueItem
);

/**
 * @route POST /api/v1/admin/treasury/sweep-queue/cancel
 * @desc Cancel a sweep queue item
 */
router.post(
  '/treasury/sweep-queue/cancel',
  requireAuth,
  requireRole([UserRole.ADMIN, UserRole.SUPERADMIN]),
  adminController.cancelQueueItem
);

/**
 * @route POST /api/v1/admin/treasury/sweep-queue/retry
 * @desc Retry a failed sweep queue item
 */
router.post(
  '/treasury/sweep-queue/retry',
  requireAuth,
  requireRole([UserRole.ADMIN, UserRole.SUPERADMIN]),
  adminController.retryQueueItem
);

/**
 * @route POST /api/v1/admin/treasury/sweep-queue/bulk-action
 * @desc Execute bulk actions on selected queue items
 */
router.post(
  '/treasury/sweep-queue/bulk-action',
  requireAuth,
  requireRole([UserRole.ADMIN, UserRole.SUPERADMIN]),
  adminController.bulkActionQueue
);

/**
 * @route POST /api/v1/admin/treasury/sweep-mode
 * @desc Update comprehensive sweep modes, delay configuration, and emergency pausing
 */
router.post(
  '/treasury/sweep-mode',
  requireAuth,
  requireRole([UserRole.ADMIN, UserRole.SUPERADMIN]),
  adminController.updateSweepModeConfig
);

/**
 * @route GET /api/v1/admin/settings
 * @desc Retrieve all platform system settings
 */
router.get(
  '/settings',
  requireAuth,
  requireRole([UserRole.ADMIN, UserRole.SUPERADMIN]),
  adminController.getSystemSettings
);

/**
 * @route PATCH /api/v1/admin/settings/:key
 * @desc Update a platform system setting by key
 */
router.patch(
  '/settings/:key',
  requireAuth,
  requireRole([UserRole.ADMIN, UserRole.SUPERADMIN]),
  adminController.updateSystemSetting
);

/**
 * @route GET /api/v1/admin/deposits
 * @desc Retrieve all platform deposits
 */
router.get(
  '/deposits',
  requireAuth,
  requireRole([UserRole.ADMIN, UserRole.SUPERADMIN]),
  adminController.getAdminDeposits
);

/**
 * @route POST /api/v1/admin/deposits/:id/approve
 * @desc Approve a pending deposit
 */
router.post(
  '/deposits/:id/approve',
  requireAuth,
  requireRole([UserRole.ADMIN, UserRole.SUPERADMIN]),
  adminController.approveDeposit
);

/**
 * @route POST /api/v1/admin/deposits/:id/reject
 * @desc Reject a pending deposit
 */
router.post(
  '/deposits/:id/reject',
  requireAuth,
  requireRole([UserRole.ADMIN, UserRole.SUPERADMIN]),
  adminController.rejectDeposit
);

/**
 * @route GET /api/v1/admin/withdrawals
 * @desc Retrieve all platform withdrawals
 */
router.get(
  '/withdrawals',
  requireAuth,
  requireRole([UserRole.ADMIN, UserRole.SUPERADMIN]),
  adminController.getAdminWithdrawals
);

/**
 * @route POST /api/v1/admin/withdrawals/:id/approve
 * @desc Approve a pending withdrawal
 */
router.post(
  '/withdrawals/:id/approve',
  requireAuth,
  requireRole([UserRole.ADMIN, UserRole.SUPERADMIN]),
  adminController.approveWithdrawal
);

/**
 * @route POST /api/v1/admin/withdrawals/:id/reject
 * @desc Reject a pending withdrawal
 */
router.post(
  '/withdrawals/:id/reject',
  requireAuth,
  requireRole([UserRole.ADMIN, UserRole.SUPERADMIN]),
  adminController.rejectWithdrawal
);

/**
 * @route GET /api/v1/admin/audit-logs
 * @desc Retrieve platform-wide system audit trail logs
 */
router.get(
  '/audit-logs',
  requireAuth,
  requireRole([UserRole.ADMIN, UserRole.SUPERADMIN]),
  adminController.getSystemAuditLogs
);

/**
 * @route POST /api/v1/admin/users
 * @desc Create a new user account
 */
router.post(
  '/users',
  requireAuth,
  requireRole([UserRole.ADMIN, UserRole.SUPERADMIN]),
  adminController.createAdminUser
);

/**
 * @route GET /api/v1/admin/vip/tiers
 * @desc Get VIP tiers matrix
 */
router.get(
  '/vip/tiers',
  requireAuth,
  requireRole([UserRole.ADMIN, UserRole.SUPERADMIN]),
  adminController.getVipTiers
);

/**
 * @route PATCH /api/v1/admin/vip/tiers/:tierName
 * @desc Update a VIP tier configuration
 */
router.patch(
  '/vip/tiers/:tierName',
  requireAuth,
  requireRole([UserRole.ADMIN, UserRole.SUPERADMIN]),
  adminController.updateVipTier
);

/**
 * @route GET /api/v1/admin/security/overview
 * @desc Get security command overview
 */
router.get(
  '/security/overview',
  requireAuth,
  requireRole([UserRole.ADMIN, UserRole.SUPERADMIN]),
  adminController.getSecurityOverview
);

/**
 * @route POST /api/v1/admin/security/switches
 * @desc Update emergency security switches
 */
router.post(
  '/security/switches',
  requireAuth,
  requireRole([UserRole.ADMIN, UserRole.SUPERADMIN]),
  adminController.updateSecuritySwitches
);

/**
 * @route POST /api/v1/admin/security/sessions/:sessionId/revoke
 * @desc Revoke an active admin session
 */
router.post(
  '/security/sessions/:sessionId/revoke',
  requireAuth,
  requireRole([UserRole.ADMIN, UserRole.SUPERADMIN]),
  adminController.revokeAdminSession
);

/**
 * @route POST /api/v1/admin/security/alerts/clear
 * @desc Clear security threat alerts
 */
router.post(
  '/security/alerts/clear',
  requireAuth,
  requireRole([UserRole.ADMIN, UserRole.SUPERADMIN]),
  adminController.clearSecurityAlerts
);

/**
 * @route GET /api/v1/admin/salary/slabs
 * @desc Get leader salary slabs
 */
router.get(
  '/salary/slabs',
  requireAuth,
  requireRole([UserRole.ADMIN, UserRole.SUPERADMIN]),
  adminController.getSalarySlabs
);

/**
 * @route PATCH /api/v1/admin/salary/slabs/:rank
 * @desc Update leader salary slab
 */
router.patch(
  '/salary/slabs/:rank',
  requireAuth,
  requireRole([UserRole.ADMIN, UserRole.SUPERADMIN]),
  adminController.updateSalarySlab
);

/**
 * @route POST /api/v1/admin/salary/payout
 * @desc Process monthly salary payouts
 */
router.post(
  '/salary/payout',
  requireAuth,
  requireRole([UserRole.ADMIN, UserRole.SUPERADMIN]),
  adminController.processMonthlySalaryPayouts
);

/**
 * @route GET /api/v1/admin/rewards/pool
 * @desc Get task definitions, metrics, and claim history for rewards pool
 */
router.get(
  '/rewards/pool',
  requireAuth,
  requireRole([UserRole.ADMIN, UserRole.SUPERADMIN]),
  adminController.getRewardsPool
);

/**
 * @route POST /api/v1/admin/rewards/tasks
 * @desc Create a new task definition in rewards pool
 */
router.post(
  '/rewards/tasks',
  requireAuth,
  requireRole([UserRole.ADMIN, UserRole.SUPERADMIN]),
  adminController.createTaskDefinition
);

/**
 * @route PATCH /api/v1/admin/rewards/tasks/:id
 * @desc Update a task definition (reward amount, active status, threshold, etc.)
 */
router.patch(
  '/rewards/tasks/:id',
  requireAuth,
  requireRole([UserRole.ADMIN, UserRole.SUPERADMIN]),
  adminController.updateTaskDefinition
);

/**
 * @route GET /api/v1/admin/rewards/claims
 * @desc Get user claims history log
 */
router.get(
  '/rewards/claims',
  requireAuth,
  requireRole([UserRole.ADMIN, UserRole.SUPERADMIN]),
  adminController.getTaskClaims
);

/**
 * @route GET /api/v1/admin/rewards/campaigns
 * @desc Get reward campaigns
 */
router.get(
  '/rewards/campaigns',
  requireAuth,
  requireRole([UserRole.ADMIN, UserRole.SUPERADMIN]),
  adminController.getRewardCampaigns
);

/**
 * @route POST /api/v1/admin/rewards/campaigns
 * @desc Create reward campaign
 */
router.post(
  '/rewards/campaigns',
  requireAuth,
  requireRole([UserRole.ADMIN, UserRole.SUPERADMIN]),
  adminController.createRewardCampaign
);

/**
 * @route PATCH /api/v1/admin/rewards/campaigns/:id
 * @desc Update reward campaign
 */
router.patch(
  '/rewards/campaigns/:id',
  requireAuth,
  requireRole([UserRole.ADMIN, UserRole.SUPERADMIN]),
  adminController.updateRewardCampaign
);

/**
 * @route GET /api/v1/admin/announcements
 * @desc Get system announcements
 */
router.get(
  '/announcements',
  requireAuth,
  requireRole([UserRole.ADMIN, UserRole.SUPERADMIN]),
  adminController.getAnnouncements
);

/**
 * @route POST /api/v1/admin/announcements
 * @desc Create system announcement
 */
router.post(
  '/announcements',
  requireAuth,
  requireRole([UserRole.ADMIN, UserRole.SUPERADMIN]),
  adminController.createAnnouncement
);

/**
 * @route DELETE /api/v1/admin/announcements/:id
 * @desc Delete system announcement
 */
router.delete(
  '/announcements/:id',
  requireAuth,
  requireRole([UserRole.ADMIN, UserRole.SUPERADMIN]),
  adminController.deleteAnnouncement
);

export default router;
