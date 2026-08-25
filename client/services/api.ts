/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ApiResponse } from '../../shared/types/index.ts';
import { getApiUrl } from './apiConfig.ts';

class ApiService {
  /**
   * Helper to retrieve auth token on demand
   */
  private getAuthHeader(): Record<string, string> {
    const token = localStorage.getItem('metafirm_token');
    if (token) {
      return { Authorization: `Bearer ${token}` };
    }
    return {};
  }

  /**
   * Universal HTTP Request proxy
   */
  async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const authHeader = this.getAuthHeader();
    const headers = {
      'Content-Type': 'application/json',
      ...authHeader,
      ...(options.headers || {}),
    };

    try {
      const url = getApiUrl(endpoint);
      const response = await fetch(url, {
        credentials: 'include',
        ...options,
        headers,
      });

      const data: ApiResponse<T> = await response.json();
      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('metafirm_token');
          localStorage.removeItem('metafirm_user');
          window.dispatchEvent(new Event('metafirm_unauthorized'));
        }
        throw new Error(data.error?.message || `HTTP Request failed with status ${response.status}`);
      }

      return data;
    } catch (error: any) {
      console.error(`API Client Error [${endpoint}]:`, error);
      return {
        success: false,
        error: {
          code: 'NETWORK_OR_API_ERROR',
          message: error.message || 'An unexpected error occurred during request execution.',
        },
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * HTTP GET convenience method
   */
  async get<T>(endpoint: string, headers?: Record<string, string>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET', headers });
  }

  /**
   * HTTP POST convenience method
   */
  async post<T>(endpoint: string, body: any, headers?: Record<string, string>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
      headers,
    });
  }

  /**
   * HTTP PATCH convenience method
   */
  async patch<T>(endpoint: string, body: any, headers?: Record<string, string>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(body),
      headers,
    });
  }

  /**
   * HTTP DELETE convenience method
   */
  async delete<T>(endpoint: string, headers?: Record<string, string>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE', headers });
  }

  /**
   * Public: Retrieve current mobile app version requirements & APK download configuration
   */
  async getAppVersionConfig(): Promise<ApiResponse<{
    minRequiredVersion: string;
    latestVersion: string;
    downloadUrl: string;
    releaseNotes: string;
    forceUpdateEnabled: boolean;
    checkedAt: string;
  }>> {
    return this.get<any>('/system/app-version');
  }

  /**
   * Admin: Fetch admin dashboard overview metrics
   */
  async getAdminDashboardOverview(): Promise<ApiResponse<any>> {
    return this.get<any>('/admin/dashboard/overview');
  }

  /**
   * Admin: Fetch paginated, filtered, sorted users
   */
  async getAdminUsers(params: {
    search?: string;
    filter?: string;
    sortBy?: string;
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<any>> {
    const query = new URLSearchParams();
    if (params.search) query.append('search', params.search);
    if (params.filter) query.append('filter', params.filter);
    if (params.sortBy) query.append('sortBy', params.sortBy);
    if (params.page) query.append('page', params.page.toString());
    if (params.limit) query.append('limit', params.limit.toString());
    
    return this.get<any>(`/admin/users?${query.toString()}`);
  }

  /**
   * Admin: Get details of a single user profile
   */
  async getAdminUserProfile(targetUid: string): Promise<ApiResponse<any>> {
    return this.get<any>(`/admin/users/${targetUid}/profile`);
  }

  /**
   * Admin: Get full (active + archived) deposit address history for a user on a network
   */
  async getUserDepositAddressHistory(targetUid: string, network: string): Promise<ApiResponse<any>> {
    return this.get<any>(`/admin/users/${targetUid}/deposit-address-history?network=${encodeURIComponent(network)}`);
  }

  /**
   * Admin: Rotate a user's deposit address on a given network
   */
  async rotateUserDepositAddress(targetUid: string, network: string): Promise<ApiResponse<any>> {
    return this.post<any>(`/admin/users/${targetUid}/rotate-deposit-address`, { network });
  }

  /**
   * Admin: Update user profile info
   */
  async updateAdminUserProfile(
    targetUid: string,
    fields: {
      name?: string;
      email?: string;
      mobile?: string;
      status?: string;
    }
  ): Promise<ApiResponse<any>> {
    return this.patch<any>(`/admin/users/${targetUid}/profile`, fields);
  }

  /**
   * Admin: Adjust user wallet balance
   */
  async adjustAdminUserWallet(
    targetUid: string,
    payload: {
      amount: number;
      memo: string;
    }
  ): Promise<ApiResponse<any>> {
    return this.post<any>(`/admin/users/${targetUid}/wallet-adjustment`, payload);
  }

  /**
   * Admin: Send custom notification to a user
   */
  async sendAdminUserNotification(
    targetUid: string,
    payload: {
      message: string;
      priority?: string;
    }
  ): Promise<ApiResponse<any>> {
    return this.post<any>(`/admin/users/${targetUid}/send-notification`, payload);
  }

  /**
   * Admin: Retrieve user's transactions history
   */
  async getAdminUserTransactions(
    targetUid: string,
    params?: { page?: number; limit?: number }
  ): Promise<ApiResponse<any>> {
    const query = new URLSearchParams();
    if (params?.page) query.append('page', params.page.toString());
    if (params?.limit) query.append('limit', params.limit.toString());
    return this.get<any>(`/admin/users/${targetUid}/transactions?${query.toString()}`);
  }

  /**
   * Admin: Retrieve user's deposit history
   */
  async getAdminUserDeposits(
    targetUid: string,
    params?: { page?: number; limit?: number }
  ): Promise<ApiResponse<any>> {
    const query = new URLSearchParams();
    if (params?.page) query.append('page', params.page.toString());
    if (params?.limit) query.append('limit', params.limit.toString());
    return this.get<any>(`/admin/users/${targetUid}/deposits?${query.toString()}`);
  }

  /**
   * Admin: Retrieve user's withdrawal history
   */
  async getAdminUserWithdrawals(
    targetUid: string,
    params?: { page?: number; limit?: number }
  ): Promise<ApiResponse<any>> {
    const query = new URLSearchParams();
    if (params?.page) query.append('page', params.page.toString());
    if (params?.limit) query.append('limit', params.limit.toString());
    return this.get<any>(`/admin/users/${targetUid}/withdrawals?${query.toString()}`);
  }

  /**
   * Admin: Retrieve user's administrative audit trail
   */
  async getAdminUserAudits(
    targetUid: string,
    params?: { page?: number; limit?: number }
  ): Promise<ApiResponse<any>> {
    const query = new URLSearchParams();
    if (params?.page) query.append('page', params.page.toString());
    if (params?.limit) query.append('limit', params.limit.toString());
    return this.get<any>(`/admin/users/${targetUid}/audits?${query.toString()}`);
  }

  /**
   * Admin: Retrieve user's referral team network downlines
   */
  async getAdminUserTeamNetwork(targetUid: string): Promise<ApiResponse<any>> {
    return this.get<any>(`/admin/users/${targetUid}/team`);
  }

  /**
   * Admin: Perform administrative operations (like suspension or password reset) on a user's account
   */
  async adminActionUser(
    targetUid: string,
    payload: {
      action: 'RESET_PASSWORD' | 'FORCE_PASSWORD_CHANGE' | 'SUSPEND' | 'UNLOCK' | 'CHANGE_ROLE' | 'CHANGE_VIP';
      password?: string;
      value?: any;
    }
  ): Promise<ApiResponse<any>> {
    return this.post<any>(`/users/admin/action/${targetUid}`, payload);
  }

  /**
   * Users: Retrieve currently authenticated user dashboard metrics
   */
  async getUserDashboard(): Promise<ApiResponse<any>> {
    return this.get<any>('/users/dashboard');
  }

  /**
   * Users: Retrieve user deposit history
   */
  async getUserDeposits(params?: { limit?: number; offset?: number; status?: string }): Promise<ApiResponse<any>> {
    const query = new URLSearchParams();
    if (params?.limit) query.append('limit', params.limit.toString());
    if (params?.offset) query.append('offset', params.offset.toString());
    if (params?.status) query.append('status', params.status);
    return this.get<any>(`/users/deposits?${query.toString()}`);
  }

  /**
   * Users: Retrieve user transaction history
   */
  async getUserTransactions(params?: { limit?: number; offset?: number; type?: string; status?: string }): Promise<ApiResponse<any>> {
    const query = new URLSearchParams();
    if (params?.limit) query.append('limit', params.limit.toString());
    if (params?.offset) query.append('offset', params.offset.toString());
    if (params?.type) query.append('type', params.type);
    if (params?.status) query.append('status', params.status);
    return this.get<any>(`/users/transactions?${query.toString()}`);
  }

  /**
   * Users: Retrieve official VIP Qualification Matrix and requirements
   */
  async getVipMatrix(): Promise<ApiResponse<any>> {
    return this.get<any>('/users/vip-matrix');
  }

  /**
   * Users: Execute manual Daily DPY yield claim
   */
  async claimYield(claimId: string): Promise<ApiResponse<any>> {
    return this.post<any>('/users/claim-yield', { claimId });
  }

  /* =========================================================================
   * SUPPORT & ADMINISTRATIVE TICKETS ENDPOINTS
   * ========================================================================= */

  /**
   * Users: Fetch user's submitted support tickets
   */
  async getUserSupportTickets(): Promise<ApiResponse<any>> {
    return this.get<any>('/users/support/tickets');
  }

  /**
   * Users: Create a brand new support ticket (with optional attachments in base64 payload)
   */
  async createUserSupportTicket(payload: {
    category: string;
    subject: string;
    description: string;
    attachmentName?: string;
    attachmentData?: string;
  }): Promise<ApiResponse<any>> {
    return this.post<any>('/users/support/tickets', payload);
  }

  /**
   * Users: Fetch conversation thread history for a ticket
   */
  async getTicketMessages(ticketId: string): Promise<ApiResponse<any>> {
    return this.get<any>(`/users/support/tickets/${ticketId}/messages`);
  }

  /**
   * Users: Submit response/reply inside a ticket thread
   */
  async replyToTicket(ticketId: string, message: string): Promise<ApiResponse<any>> {
    return this.post<any>(`/users/support/tickets/${ticketId}/messages`, { message });
  }

  /**
   * Users: Resolve and close a ticket
   */
  async closeTicket(ticketId: string): Promise<ApiResponse<any>> {
    return this.post<any>(`/users/support/tickets/${ticketId}/close`, {});
  }

  /**
   * Admin: Retrieve all support tickets with pagination, search, and category filters
   */
  async getAdminSupportTickets(params?: {
    status?: string;
    priority?: string;
    category?: string;
    search?: string;
    limit?: number;
    offset?: number;
  }): Promise<ApiResponse<any>> {
    const query = new URLSearchParams();
    if (params?.status) query.append('status', params.status);
    if (params?.priority) query.append('priority', params.priority);
    if (params?.category) query.append('category', params.category);
    if (params?.search) query.append('search', params.search);
    if (params?.limit) query.append('limit', params.limit.toString());
    if (params?.offset) query.append('offset', params.offset.toString());

    return this.get<any>(`/admin/support/tickets?${query.toString()}`);
  }

  /**
   * Admin: Retrieve complete thread history for any ticket in system
   */
  async getAdminTicketMessages(ticketId: string): Promise<ApiResponse<any>> {
    return this.get<any>(`/admin/support/tickets/${ticketId}/messages`);
  }

  /**
   * Admin: Reply inside a user ticket thread
   */
  async replyToTicketAsAdmin(ticketId: string, message: string): Promise<ApiResponse<any>> {
    return this.post<any>(`/admin/support/tickets/${ticketId}/messages`, { message });
  }

  /**
   * Admin: Update ticket status, priority, or assignment properties
   */
  async updateTicketProperties(
    ticketId: string,
    payload: {
      status?: string;
      priority?: string;
      assignedAdminUid?: string;
    }
  ): Promise<ApiResponse<any>> {
    return this.patch<any>(`/admin/support/tickets/${ticketId}`, payload);
  }

  /* =========================================================================
   * ADMIN DEPOSITS, WITHDRAWALS, AUDIT LOGS & SETTINGS ENDPOINTS
   * ========================================================================= */

  /**
   * Admin: Get platform deposits
   */
  async getAdminDeposits(params?: { status?: string; page?: number; limit?: number }): Promise<ApiResponse<any>> {
    const query = new URLSearchParams();
    if (params?.status && params.status !== 'All') query.append('status', params.status);
    if (params?.page) query.append('page', params.page.toString());
    if (params?.limit) query.append('limit', params.limit.toString());
    return this.get<any>(`/admin/deposits?${query.toString()}`);
  }

  /**
   * Admin: Approve a pending deposit
   */
  async approveAdminDeposit(id: string, txHash?: string): Promise<ApiResponse<any>> {
    return this.post<any>(`/admin/deposits/${id}/approve`, { txHash });
  }

  /**
   * Admin: Reject a pending deposit
   */
  async rejectAdminDeposit(id: string, notes?: string): Promise<ApiResponse<any>> {
    return this.post<any>(`/admin/deposits/${id}/reject`, { notes });
  }

  /**
   * Admin: Get platform withdrawals
   */
  async getAdminWithdrawals(params?: { status?: string; page?: number; limit?: number }): Promise<ApiResponse<any>> {
    const query = new URLSearchParams();
    if (params?.status && params.status !== 'All') query.append('status', params.status);
    if (params?.page) query.append('page', params.page.toString());
    if (params?.limit) query.append('limit', params.limit.toString());
    return this.get<any>(`/admin/withdrawals?${query.toString()}`);
  }

  /**
   * Admin: Approve a pending withdrawal
   */
  async approveAdminWithdrawal(id: string, txHash?: string, notes?: string): Promise<ApiResponse<any>> {
    return this.post<any>(`/admin/withdrawals/${id}/approve`, { txHash, notes });
  }

  /**
   * Admin: Reject a pending withdrawal
   */
  async rejectAdminWithdrawal(id: string, notes?: string): Promise<ApiResponse<any>> {
    return this.post<any>(`/admin/withdrawals/${id}/reject`, { notes });
  }

  /**
   * Admin: Get system audit logs
   */
  async getAdminAuditLogs(params?: { action?: string; page?: number; limit?: number }): Promise<ApiResponse<any>> {
    const query = new URLSearchParams();
    if (params?.action) query.append('action', params.action);
    if (params?.page) query.append('page', params.page.toString());
    if (params?.limit) query.append('limit', params.limit.toString());
    return this.get<any>(`/admin/audit-logs?${query.toString()}`);
  }

  /**
   * Admin: Get system settings
   */
  async getAdminSettings(): Promise<ApiResponse<any>> {
    return this.get<any>('/admin/settings');
  }

  /**
   * Admin: Update system setting by key
   */
  async updateAdminSetting(key: string, value: string): Promise<ApiResponse<any>> {
    return this.patch<any>(`/admin/settings/${key}`, { value });
  }

  /**
   * Admin: Preview production cleanup counts before deleting test users
   */
  async getProductionCleanupPreview(): Promise<ApiResponse<any>> {
    return this.get<any>('/admin/reset/production-cleanup/preview');
  }

  /**
   * Admin: Execute pre-launch cleanup for all non-SUPERADMIN users
   */
  async deleteAllTestUsers(confirmation: string): Promise<ApiResponse<any>> {
    return this.post<any>('/admin/reset/production-cleanup', { confirmation });
  }

  /**
   * Admin: Create new user account
   */
  async createAdminUser(userData: any): Promise<ApiResponse<any>> {
    return this.post<any>('/admin/users', userData);
  }

  /**
   * Admin: Get VIP tiers matrix
   */
  async getVipTiers(): Promise<ApiResponse<any>> {
    return this.get<any>('/admin/vip/tiers');
  }

  /**
   * Admin: Update VIP tier configuration
   */
  async updateVipTier(tierName: string, updatedTier: any): Promise<ApiResponse<any>> {
    return this.patch<any>(`/admin/vip/tiers/${tierName}`, updatedTier);
  }

  /**
   * Admin: Get Security Command overview
   */
  async getSecurityOverview(): Promise<ApiResponse<any>> {
    return this.get<any>('/admin/security/overview');
  }

  /**
   * Admin: Update emergency security switches
   */
  async updateSecuritySwitches(switches: any): Promise<ApiResponse<any>> {
    return this.post<any>('/admin/security/switches', switches);
  }

  /**
   * Admin: Revoke active session
   */
  async revokeAdminSession(sessionId: string): Promise<ApiResponse<any>> {
    return this.post<any>(`/admin/security/sessions/${sessionId}/revoke`, {});
  }

  /**
   * Admin: Clear security alerts
   */
  async clearSecurityAlerts(): Promise<ApiResponse<any>> {
    return this.post<any>('/admin/security/alerts/clear', {});
  }

  /**
   * Admin: Get leader salary slabs
   */
  async getSalarySlabs(): Promise<ApiResponse<any>> {
    return this.get<any>('/admin/salary/slabs');
  }

  /**
   * Admin: Update leader salary slab
   */
  async updateSalarySlab(rank: string, updatedSlab: any): Promise<ApiResponse<any>> {
    return this.patch<any>(`/admin/salary/slabs/${rank}`, updatedSlab);
  }

  /**
   * Admin: Process monthly salary payouts
   */
  async processMonthlySalaryPayouts(): Promise<ApiResponse<any>> {
    return this.post<any>('/admin/salary/payout', {});
  }

  /**
   * Admin: Get Rewards Pool task definitions, metrics & claims
   */
  async getRewardsPool(): Promise<ApiResponse<any>> {
    return this.get<any>('/admin/rewards/pool');
  }

  /**
   * Admin: Update Task Definition in Rewards Pool
   */
  async updateTaskDefinition(id: string, updates: any): Promise<ApiResponse<any>> {
    return this.patch<any>(`/admin/rewards/tasks/${id}`, updates);
  }

  /**
   * Admin: Create new Task Definition in Rewards Pool
   */
  async createTaskDefinition(data: any): Promise<ApiResponse<any>> {
    return this.post<any>('/admin/rewards/tasks', data);
  }

  /**
   * Admin: Get Task Claims history log
   */
  async getTaskClaims(): Promise<ApiResponse<any>> {
    return this.get<any>('/admin/rewards/claims');
  }

  /**
   * Admin: Get reward campaigns
   */
  async getRewardCampaigns(): Promise<ApiResponse<any>> {
    return this.get<any>('/admin/rewards/campaigns');
  }

  /**
   * Admin: Create reward campaign
   */
  async createRewardCampaign(campaign: any): Promise<ApiResponse<any>> {
    return this.post<any>('/admin/rewards/campaigns', campaign);
  }

  /**
   * Admin: Update reward campaign
   */
  async updateRewardCampaign(id: string, updates: any): Promise<ApiResponse<any>> {
    return this.patch<any>(`/admin/rewards/campaigns/${id}`, updates);
  }

  /**
   * User: Get system announcements published by admin
   */
  async getUserAnnouncements(): Promise<ApiResponse<any>> {
    return this.get<any>('/users/announcements');
  }

  /**
   * Admin: Get system announcements
   */
  async getAnnouncements(): Promise<ApiResponse<any>> {
    return this.get<any>('/admin/announcements');
  }

  /**
   * Admin: Create system announcement
   */
  async createAnnouncement(announcement: any): Promise<ApiResponse<any>> {
    return this.post<any>('/admin/announcements', announcement);
  }

  /**
   * Admin: Delete system announcement
   */
  async deleteAnnouncement(id: string): Promise<ApiResponse<any>> {
    return this.delete<any>(`/admin/announcements/${id}`);
  }

  /* =========================================================================
   * NOTIFICATIONS ENDPOINTS
   * ========================================================================= */

  /**
   * Users: Fetch user notifications
   */
  async getNotifications(): Promise<ApiResponse<any>> {
    return this.get<any>('/users/notifications');
  }

  /**
   * Users: Mark a single notification as read
   */
  async markNotificationRead(id: string): Promise<ApiResponse<any>> {
    return this.post<any>(`/users/notifications/${id}/read`, {});
  }

  /**
   * Users: Mark all notifications as read
   */
  async markAllNotificationsRead(): Promise<ApiResponse<any>> {
    return this.post<any>('/users/notifications/read-all', {});
  }

  /**
   * Users: Delete/Dismiss a single notification
   */
  async deleteNotification(id: string): Promise<ApiResponse<any>> {
    return this.delete<any>(`/users/notifications/${id}`);
  }

  /* =========================================================================
   * TREASURY ENDPOINTS
   * ========================================================================= */

  /**
   * Admin: Get treasury overview for a network
   */
  async getTreasuryOverview(network: string): Promise<ApiResponse<any>> {
    return this.get<any>(`/admin/treasury/${network}`);
  }

  /**
   * Admin: Get sweep queue items for a network
   */
  async getTreasurySweepQueue(network?: string, status?: string): Promise<ApiResponse<any>> {
    const query = new URLSearchParams();
    if (network) query.append('network', network);
    if (status) query.append('status', status);
    return this.get<any>(`/admin/treasury/sweep-queue?${query.toString()}`);
  }

  /**
   * Admin: Save comprehensive sweep configuration/rules
   */
  async updateTreasurySweepMode(data: {
    network: string;
    sweepMode?: 'AUTOMATIC' | 'MANUAL' | 'HYBRID';
    sweepDelay?: string;
    customDelayMinutes?: number;
    autoSweepThreshold?: string;
    paused?: boolean;
  }): Promise<ApiResponse<any>> {
    return this.post<any>('/admin/treasury/sweep-mode', data);
  }

  /**
   * Admin: Sweep specific user deposit address to hot wallet
   */
  async sweepUserDepositAddress(addressId: string): Promise<ApiResponse<any>> {
    return this.post<any>('/admin/treasury/sweep/address', { addressId });
  }

  /**
   * Admin: Reclaim/collect native gas from a specific user deposit address
   */
  async sweepUserNativeGas(addressId: string): Promise<ApiResponse<any>> {
    return this.post<any>('/admin/treasury/sweep/gas/address', { addressId });
  }

  /**
   * Admin: Reclaim/collect native gas from all eligible deposit addresses on a network
   */
  async sweepAllUserNativeGas(network: string): Promise<ApiResponse<any>> {
    return this.post<any>('/admin/treasury/sweep/gas/all', { network });
  }

  /**
   * Admin: Sweep all eligible positive balance addresses for a network
   */
  async sweepAllEligibleAddresses(network: string): Promise<ApiResponse<any>> {
    return this.post<any>('/admin/treasury/sweep/all', { network });
  }

  /**
   * Admin: Transfer funds from Hot Wallet to Cold Wallet
   */
  async sweepHotToCold(network: string, amount: string): Promise<ApiResponse<any>> {
    return this.post<any>('/admin/treasury/sweep/hot-to-cold', { network, amount });
  }

  /**
   * Admin: Retry a failed sweep job
   */
  async retrySweepJob(jobId: string): Promise<ApiResponse<any>> {
    return this.post<any>('/admin/treasury/sweep/retry', { jobId });
  }

  /**
   * Admin: Fund native gas for a sweep queue item
   */
  async fundGasQueueItem(itemId: string): Promise<ApiResponse<any>> {
    return this.post<any>('/admin/treasury/sweep-queue/fund-gas', { itemId });
  }

  /**
   * Admin: Sweep a queue item
   */
  async sweepQueueItem(itemId: string): Promise<ApiResponse<any>> {
    return this.post<any>('/admin/treasury/sweep-queue/sweep', { itemId });
  }

  /**
   * Admin: Cancel a queue item
   */
  async cancelQueueItem(itemId: string): Promise<ApiResponse<any>> {
    return this.post<any>('/admin/treasury/sweep-queue/cancel', { itemId });
  }

  /**
   * Admin: Retry a failed sweep queue item
   */
  async retrySweepQueueItem(itemId: string): Promise<ApiResponse<any>> {
    return this.post<any>('/admin/treasury/sweep-queue/retry', { itemId });
  }

  /**
   * Admin: Bulk queue action
   */
  async bulkActionQueue(itemIds: string[], action: 'FUND_GAS' | 'SWEEP' | 'FUND_AND_SWEEP'): Promise<ApiResponse<any>> {
    return this.post<any>('/admin/treasury/sweep-queue/bulk-action', { itemIds, action });
  }
}

export const api = new ApiService();
export default api;
