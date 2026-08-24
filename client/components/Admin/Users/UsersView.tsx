/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  Users,
  Search,
  Plus,
  Shield,
  Download,
  Filter,
  MoreVertical,
  CheckCircle,
  Eye,
  Edit,
  DollarSign,
  Bell,
  Trash2,
  FileText,
  FileDown,
  History,
  Network,
  ShieldAlert,
  ArrowUpDown,
  CheckSquare,
  Square,
  Sparkles,
} from 'lucide-react';
import { Button, Avatar } from '../../ui/index.ts';
import { ThemeTokens } from '../../ui/themeTokens.ts';
import { useTheme } from '../../../hooks/useTheme.ts';
import { AdminUser } from '../types.ts';
import { api } from '../../../services/api.ts';
import { UserVipBadge } from './UserVipBadge.tsx';
import {
  UserEditModal,
  UserWalletAdjustmentModal,
  UserNotificationModal,
  UserConfirmToggleStatusModal,
  AddUserModal,
} from './UserActionModals.tsx';
import {
  UserProfileModal,
  RotateAddressConfirmModal,
  AddressHistoryModal,
  TransactionsModal,
  DepositsModal,
  WithdrawalsModal,
  TeamNetworkModal,
  AuditLogsModal,
} from './UserHistoryModals.tsx';

interface UsersViewProps {
  t?: ThemeTokens;
  isDark?: boolean;
  onSelectUser?: (user: AdminUser) => void;
}

export const UsersView: React.FC<UsersViewProps> = ({ t: propT, isDark: propIsDark, onSelectUser }) => {
  const hookTheme = useTheme();
  const t = propT || hookTheme.t;
  const isDark = propIsDark !== undefined ? propIsDark : hookTheme.isDark;

  // State Management
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRank, setSelectedRank] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [sortBy, setSortBy] = useState<
    | 'joined'
    | 'newest'
    | 'oldest'
    | 'top_depositor'
    | 'top_performer'
    | 'top_earner'
    | 'balance'
    | 'teamSize'
    | 'rank'
  >('newest');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [isExporting, setIsExporting] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Modals & Action Sheet State
  const [activeActionUser, setActiveActionUser] = useState<AdminUser | null>(null);
  const [activeActionType, setActiveActionType] = useState<
    'profile' | 'edit' | 'wallet_adjustment' | 'send_notification' | 'transactions' | 'deposits' | 'withdrawals' | 'team' | 'audit' | null
  >(null);
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [confirmToggleUser, setConfirmToggleUser] = useState<AdminUser | null>(null);

  // Action Menu Dropdown State
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  // Deep inspection records state
  const [profileDetail, setProfileDetail] = useState<any>(null);
  const [modalTransactions, setModalTransactions] = useState<any[]>([]);
  const [modalDeposits, setModalDeposits] = useState<any[]>([]);
  const [modalWithdrawals, setModalWithdrawals] = useState<any[]>([]);
  const [modalTeam, setModalTeam] = useState<any[]>([]);
  const [modalAudits, setModalAudits] = useState<any[]>([]);
  const [loadingDetails, setLoadingDetails] = useState(false);

  // Address Rotation & History State
  const [rotatingNetwork, setRotatingNetwork] = useState<string | null>(null);
  const [rotateConfirmNetwork, setRotateConfirmNetwork] = useState<string | null>(null);
  const [addressHistoryModal, setAddressHistoryModal] = useState<{ network: string; history: any[]; loading: boolean } | null>(null);

  // Interactive Form States
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    mobile: '',
    status: 'Active' as 'Active' | 'Suspended',
    adminNotes: ''
  });

  const [walletForm, setWalletForm] = useState({
    type: 'credit' as 'credit' | 'debit',
    amount: '',
    reason: 'Yield Correction',
    adminNote: ''
  });

  const [notifForm, setNotifForm] = useState<{
    title: string;
    message: string;
    type: 'Info' | 'Success' | 'Warning' | 'Security' | 'Promotion';
    priority: 'Normal' | 'High';
    attachments: string[];
  }>({
    title: '',
    message: '',
    type: 'Info',
    priority: 'Normal',
    attachments: []
  });

  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    mobile: '',
    rank: 'VIP1',
    balance: '0.00',
    referralCode: '',
    levelA: 0,
    levelB: 0,
    levelC: 0,
    levelD: 0,
    status: 'Active' as 'Active' | 'Suspended',
    adminNotes: ''
  });

  // Feedback Toast
  const [toastMessage, setToastMessage] = useState<{ text: string; variant?: 'info' | 'success' | 'error' } | null>(null);

  const triggerToast = (text: string, variant: 'info' | 'success' | 'error' = 'success') => {
    setToastMessage({ text, variant });
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpenDropdownId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch Users
  const loadUsers = async () => {
    try {
      setLoading(true);
      const res = await api.getAdminUsers({ limit: 500 });
      if (res && res.success && res.data) {
        const list = res.data.users || (Array.isArray(res.data) ? res.data : []);
        setUsers(list);
      } else if (res && res.data && res.data.users) {
        setUsers(res.data.users);
      }
    } catch (err) {
      console.error('Failed to fetch admin users:', err);
      triggerToast('Failed to load user records from database', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  // Open Actions / Detail Modals
  const openActionModal = async (
    user: AdminUser,
    type: 'profile' | 'edit' | 'wallet_adjustment' | 'send_notification' | 'transactions' | 'deposits' | 'withdrawals' | 'team' | 'audit'
  ) => {
    setActiveActionUser(user);
    setActiveActionType(type);
    setOpenDropdownId(null);

    if (type === 'edit') {
      setEditForm({
        name: user.name,
        email: user.email,
        mobile: user.mobile || '+1-415-555-0199',
        status: user.status as any,
        adminNotes: 'Compliance verified - account in good standing'
      });
    }

    if (type === 'wallet_adjustment') {
      setWalletForm({
        type: 'credit',
        amount: '',
        reason: 'Yield Correction',
        adminNote: ''
      });
    }

    if (type === 'send_notification') {
      setNotifForm({
        title: '',
        message: '',
        type: 'Info',
        priority: 'Normal',
        attachments: []
      });
    }

    // Fetch deep inspection data
    try {
      setLoadingDetails(true);
      const [profileRes, txRes, depRes, wdRes, teamRes, auditRes] = await Promise.all([
        api.getAdminUserProfile(user.id).catch(() => null),
        api.getAdminUserTransactions(user.id).catch(() => null),
        api.getAdminUserDeposits(user.id).catch(() => null),
        api.getAdminUserWithdrawals(user.id).catch(() => null),
        api.getAdminUserTeamNetwork(user.id).catch(() => null),
        api.getAdminUserAudits(user.id).catch(() => null),
      ]);

      if (profileRes && profileRes.data) {
        setProfileDetail(profileRes.data.profile || profileRes.data || user);
      } else {
        setProfileDetail(user);
      }

      setModalTransactions(txRes?.data?.transactions || txRes?.data || []);
      setModalDeposits(depRes?.data?.deposits || depRes?.data || []);
      setModalWithdrawals(wdRes?.data?.withdrawals || wdRes?.data || []);
      setModalTeam(teamRes?.data?.team || teamRes?.data || []);
      setModalAudits(auditRes?.data?.audits || auditRes?.data || []);
    } catch (err) {
      console.error('Failed to load user sub-ledger info:', err);
      setProfileDetail(user);
    } finally {
      setLoadingDetails(false);
    }
  };

  // Address copy handler
  const handleCopyAddress = (address: string) => {
    navigator.clipboard.writeText(address);
    triggerToast(`Address copied to clipboard: ${address.slice(0, 8)}...${address.slice(-6)}`, 'info');
  };

  // Address rotation handler
  const handleRotateAddress = async (network: string) => {
    if (!activeActionUser) return;
    try {
      setRotatingNetwork(network);
      const res = await api.rotateUserDepositAddress(activeActionUser.id, network);
      if (res && res.success && res.data) {
        const newAddress = res.data.newAddress || res.data;
        setProfileDetail((prev: any) => {
          if (!prev) return prev;
          const updated = (prev.depositAddresses || []).map((a: any) =>
            a.network === network ? { ...a, address: newAddress.address || newAddress } : a
          );
          if (!updated.find((a: any) => a.network === network)) {
            updated.push({ network, address: newAddress.address || newAddress });
          }
          return { ...prev, depositAddresses: updated };
        });
        triggerToast(`New ${network} deposit address generated successfully!`, 'success');
      }
    } catch (err: any) {
      console.error('Failed to rotate deposit address:', err);
      triggerToast(err?.message || 'Failed to rotate deposit address', 'error');
    } finally {
      setRotatingNetwork(null);
      setRotateConfirmNetwork(null);
    }
  };

  // View address history handler
  const handleViewAddressHistory = async (network: string) => {
    if (!activeActionUser) return;
    setAddressHistoryModal({ network, history: [], loading: true });
    try {
      const res = await api.getUserDepositAddressHistory(activeActionUser.id, network);
      const historyList = res?.data?.history || (Array.isArray(res?.data) ? res.data : []);
      setAddressHistoryModal({ network, history: historyList, loading: false });
    } catch (err: any) {
      console.error('Failed to fetch address history:', err);
      triggerToast('Failed to load address history', 'error');
      setAddressHistoryModal(null);
    }
  };

  // Edit user save handler
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeActionUser) return;

    try {
      const res = await api.updateAdminUserProfile(activeActionUser.id, {
        name: editForm.name,
        email: editForm.email,
        mobile: editForm.mobile,
        status: editForm.status
      });

      const updated = res?.data || { ...activeActionUser, ...editForm };
      setUsers(prev => prev.map(u => (u.id === activeActionUser.id ? { ...u, ...updated } : u)));
      triggerToast(`Account details for ${editForm.name} updated successfully!`);
      setActiveActionUser(null);
      setActiveActionType(null);
    } catch (err) {
      console.error('Failed to update user:', err);
      triggerToast('Failed to commit profile updates to server', 'error');
    }
  };

  // Confirm wallet adjustment handler
  const handleConfirmWalletAdjustment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeActionUser || !walletForm.amount || isNaN(Number(walletForm.amount))) {
      triggerToast('Please provide a valid numeric adjustment amount', 'error');
      return;
    }

    try {
      const delta = walletForm.type === 'credit' ? Number(walletForm.amount) : -Number(walletForm.amount);
      const res = await api.adjustAdminUserWallet(activeActionUser.id, {
        amount: delta,
        memo: `${walletForm.reason}: ${walletForm.adminNote}`
      });

      const newBalance = res?.data?.newBalance || `$${(parseFloat(activeActionUser.balance.replace(/[^0-9.-]+/g, '')) + delta).toFixed(2)}`;
      setUsers(prev => prev.map(u => (u.id === activeActionUser.id ? { ...u, balance: newBalance } : u)));
      triggerToast(`Successfully adjusted wallet ledger by $${walletForm.amount} for ${activeActionUser.name}!`);
      setActiveActionUser(null);
      setActiveActionType(null);
    } catch (err) {
      console.error('Failed to adjust wallet balance:', err);
      triggerToast('Failed to apply balance ledger adjustment', 'error');
    }
  };

  // Notification transmission handler
  const handleSendNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeActionUser || !notifForm.title || !notifForm.message) {
      triggerToast('Subject title and message content are required', 'error');
      return;
    }

    try {
      await api.sendAdminUserNotification(activeActionUser.id, {
        message: `${notifForm.title} — ${notifForm.message}`,
        priority: notifForm.priority
      });

      triggerToast(`Direct mail dispatched to ${activeActionUser.name} (${activeActionUser.userId || activeActionUser.id})!`);
      setActiveActionUser(null);
      setActiveActionType(null);
    } catch (err) {
      console.error('Failed to transmit direct notification:', err);
      triggerToast('Mail dispatch failed to deliver to mailbox', 'error');
    }
  };

  // Toggle user status handler
  const handleToggleStatus = async (user: AdminUser) => {
    const nextStatus = user.status === 'Active' ? 'Suspended' : 'Active';
    try {
      await api.adminActionUser(user.id, {
        action: nextStatus === 'Suspended' ? 'SUSPEND' : 'UNLOCK'
      });
      setUsers(prev => prev.map(u => (u.id === user.id ? { ...u, status: nextStatus } : u)));
      triggerToast(`User ${user.name} has been set to ${nextStatus}.`);
      setConfirmToggleUser(null);
    } catch (err) {
      console.error('Failed to update status:', err);
      triggerToast('Failed to modify account privilege status', 'error');
    }
  };

  // Bulk operations handler
  const handleBulkAction = async (action: 'activate' | 'suspend' | 'export') => {
    if (selectedUserIds.length === 0) return;

    if (action === 'activate' || action === 'suspend') {
      const nextStatus = action === 'activate' ? 'Active' : 'Suspended';
      const actionType = action === 'activate' ? 'UNLOCK' : 'SUSPEND';
      try {
        await Promise.all(selectedUserIds.map(id => api.adminActionUser(id, { action: actionType })));
        setUsers(prev => prev.map(u => (selectedUserIds.includes(u.id) ? { ...u, status: nextStatus } : u)));
        triggerToast(`Bulk operation executed: ${selectedUserIds.length} users marked as ${nextStatus}!`);
        setSelectedUserIds([]);
      } catch (err) {
        console.error('Bulk update failure:', err);
        triggerToast('Failed to apply bulk status modification', 'error');
      }
    } else if (action === 'export') {
      handleExportCSV(selectedUserIds);
    }
  };

  // CSV Export
  const handleExportCSV = (specificIds?: string[]) => {
    setIsExporting(true);
    try {
      const targetUsers = specificIds ? users.filter(u => specificIds.includes(u.id)) : users;
      const headers = ['User ID', 'Name', 'Email', 'Mobile', 'VIP Rank', 'Balance (USDT)', 'Team Size', 'Status', 'Registration Date'];
      const rows = targetUsers.map(u => [
        `"${u.userId || u.id}"`,
        `"${u.name}"`,
        `"${u.email}"`,
        `"${u.mobile || ''}"`,
        `"${u.rank}"`,
        `"${u.balance}"`,
        `"${u.teamSize ?? ((u.levelA || 0) + (u.levelB || 0) + (u.levelC || 0) + (u.levelD || 0))}"`,
        `"${u.status}"`,
        `"${u.joined}"`
      ]);

      const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `platform_users_audit_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      triggerToast(`Exported ${targetUsers.length} user records to CSV spreadsheet!`);
    } catch (err) {
      console.error('CSV Export failure:', err);
      triggerToast('Failed to generate export dataset', 'error');
    } finally {
      setIsExporting(false);
    }
  };

  // Add user submission handler
  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUser.name || !newUser.email) {
      triggerToast('Please provide valid full name and email address', 'error');
      return;
    }

    try {
      const payload = {
        ...newUser,
        userId: `U${Math.floor(100000 + Math.random() * 900000)}`,
        joined: new Date().toISOString().slice(0, 10),
        teamSize: 0
      };
      const res = await api.createAdminUser(payload);
      const created = res?.data || payload;

      setUsers(prev => [created, ...prev]);
      triggerToast(`New user account ${created.name || newUser.name} registered successfully!`);
      setIsAddUserOpen(false);
      setNewUser({
        name: '',
        email: '',
        mobile: '',
        rank: 'VIP1',
        balance: '0.00',
        referralCode: '',
        levelA: 0,
        levelB: 0,
        levelC: 0,
        levelD: 0,
        status: 'Active',
        adminNotes: ''
      });
    } catch (err) {
      console.error('Failed to create user:', err);
      triggerToast('Failed to persist user in registry', 'error');
    }
  };

  // Filter and Sort users
  const filteredUsers = users
    .filter(u => {
      const matchesSearch =
        u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (u.userId && u.userId.toLowerCase().includes(searchTerm.toLowerCase())) ||
        u.id.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRank = selectedRank === 'all' || u.rank === selectedRank;
      const matchesStatus = selectedStatus === 'all' || u.status === selectedStatus;
      return matchesSearch && matchesRank && matchesStatus;
    })
    .sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'newest' || sortBy === 'joined') {
        comparison = new Date(b.joined).getTime() - new Date(a.joined).getTime();
      } else if (sortBy === 'oldest') {
        comparison = new Date(a.joined).getTime() - new Date(b.joined).getTime();
      } else if (sortBy === 'top_depositor') {
        const depA = typeof a.totalDeposits === 'number' ? a.totalDeposits : parseFloat(String(a.totalDeposits || '0').replace(/[^0-9.-]+/g, '')) || 0;
        const depB = typeof b.totalDeposits === 'number' ? b.totalDeposits : parseFloat(String(b.totalDeposits || '0').replace(/[^0-9.-]+/g, '')) || 0;
        comparison = depB - depA;
      } else if (sortBy === 'top_performer') {
        // Performer sorted by total team network and direct referral volume
        const perfA = (a.teamSize || 0) + (a.levelA || 0) * 2;
        const perfB = (b.teamSize || 0) + (b.levelA || 0) * 2;
        comparison = perfB - perfA;
      } else if (sortBy === 'top_earner') {
        const earnA = typeof a.totalEarnings === 'number' ? a.totalEarnings : parseFloat(String(a.totalEarnings || '0').replace(/[^0-9.-]+/g, '')) || 0;
        const earnB = typeof b.totalEarnings === 'number' ? b.totalEarnings : parseFloat(String(b.totalEarnings || '0').replace(/[^0-9.-]+/g, '')) || 0;
        comparison = earnB - earnA;
      } else if (sortBy === 'balance') {
        const balA = parseFloat(a.balance.replace(/[^0-9.-]+/g, '')) || 0;
        const balB = parseFloat(b.balance.replace(/[^0-9.-]+/g, '')) || 0;
        comparison = balB - balA;
      } else if (sortBy === 'teamSize') {
        comparison = (b.teamSize || 0) - (a.teamSize || 0);
      } else if (sortBy === 'rank') {
        comparison = b.rank.localeCompare(a.rank);
      }
      return sortOrder === 'desc' ? comparison : -comparison;
    });

  // Paginated Slices
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage) || 1;
  const paginatedUsers = filteredUsers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const toggleSelectAll = () => {
    if (selectedUserIds.length === paginatedUsers.length) {
      setSelectedUserIds([]);
    } else {
      setSelectedUserIds(paginatedUsers.map(u => u.id));
    }
  };

  const toggleSelectUser = (id: string) => {
    setSelectedUserIds(prev => (prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]));
  };

  return (
    <div className="space-y-6">
      {/* Toast notification banner */}
      {toastMessage && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-2xl shadow-xl flex items-center gap-3 border text-xs font-bold transition-all duration-300 animate-in fade-in slide-in-from-bottom-5 ${
            toastMessage.variant === 'error'
              ? 'bg-red-500/90 text-white border-red-400 backdrop-blur-md'
              : toastMessage.variant === 'info'
              ? 'bg-blue-600/90 text-white border-blue-400 backdrop-blur-md'
              : 'bg-emerald-600/90 text-white border-emerald-400 backdrop-blur-md'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* HEADER SECTION */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h2 className="font-display font-black text-2xl lg:text-3xl text-gray-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <Users className="w-7 h-7 text-blue-500" />
            <span>User Management Directory</span>
          </h2>
          <p className={`text-xs ${t.textMuted} mt-1 font-medium`}>
            Audit, inspect balances, adjust ledgers, and manage KYC compliance across all registered accounts.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            variant="secondary"
            onClick={() => handleExportCSV()}
            disabled={isExporting || users.length === 0}
            className="text-xs h-10 px-3.5"
          >
            <Download className="w-3.5 h-3.5 mr-1.5" />
            <span>Export CSV</span>
          </Button>

          <Button
            variant="primary"
            onClick={() => setIsAddUserOpen(true)}
            className="text-xs h-10 px-4 shadow-lg shadow-blue-500/20"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            <span>Add Member Account</span>
          </Button>
        </div>
      </div>

      {/* STATS BENTO CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className={`p-4 rounded-3xl border ${t.cardBg || t.card} ${t.cardBorder || ''} transition-all`}>
          <div className="flex items-center justify-between">
            <span className={`text-xs font-bold ${t.textMuted}`}>Total Accounts</span>
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-display font-black text-gray-900 dark:text-white mt-2">{users.length}</p>
          <p className="text-[10px] text-emerald-500 font-bold mt-0.5">100% database synched</p>
        </div>

        <div className={`p-4 rounded-3xl border ${t.cardBg || t.card} ${t.cardBorder || ''} transition-all`}>
          <div className="flex items-center justify-between">
            <span className={`text-xs font-bold ${t.textMuted}`}>Active Privileges</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <CheckCircle className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-display font-black text-gray-900 dark:text-white mt-2">
            {users.filter(u => u.status === 'Active').length}
          </p>
          <p className="text-[10px] text-gray-500 dark:text-gray-400 font-medium mt-0.5">
            {users.length > 0 ? Math.round((users.filter(u => u.status === 'Active').length / users.length) * 100) : 0}% of all members
          </p>
        </div>

        <div className={`p-4 rounded-3xl border ${t.cardBg || t.card} ${t.cardBorder || ''} transition-all`}>
          <div className="flex items-center justify-between">
            <span className={`text-xs font-bold ${t.textMuted}`}>Suspended / Flagged</span>
            <div className="w-8 h-8 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center">
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-display font-black text-rose-500 mt-2">
            {users.filter(u => u.status === 'Suspended').length}
          </p>
          <p className="text-[10px] text-rose-500 font-bold mt-0.5">Requires compliance review</p>
        </div>

        <div className={`p-4 rounded-3xl border ${t.cardBg || t.card} ${t.cardBorder || ''} transition-all`}>
          <div className="flex items-center justify-between">
            <span className={`text-xs font-bold ${t.textMuted}`}>VIP Leaders (VIP4+)</span>
            <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center">
              <Shield className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-display font-black text-purple-500 mt-2">
            {users.filter(u => ['VIP4', 'VIP5', 'VIP6', 'VIP7', 'VIP8'].includes(u.rank)).length}
          </p>
          <p className="text-[10px] text-purple-500 font-bold mt-0.5">Eligible for weekly bonus</p>
        </div>
      </div>

      {/* FILTER CONTROLS & BULK BAR */}
      <div className={`p-4 rounded-3xl border ${t.cardBg || t.card} ${t.cardBorder || ''} space-y-4 shadow-sm`}>
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          {/* Search Bar */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search user name, email, ID..."
              value={searchTerm}
              onChange={e => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-10 pr-4 py-2 text-xs rounded-2xl border bg-gray-50/50 dark:bg-white/5 border-gray-200 dark:border-white/10 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500/30"
            />
          </div>

          {/* Filters and Sort */}
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end">
            <div className="flex items-center gap-1.5">
              <Filter className={`w-3.5 h-3.5 ${t.textMuted}`} />
              <span className={`text-[11px] font-bold ${t.textMuted}`}>Sort:</span>
              <select
                aria-label="Sort users by"
                value={sortBy}
                onChange={e => setSortBy(e.target.value as any)}
                className="text-xs py-1.5 px-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#0f112e] text-gray-900 dark:text-white font-semibold cursor-pointer"
              >
                <option value="newest">New Register (Recent First)</option>
                <option value="oldest">Old Register (Oldest First)</option>
                <option value="top_depositor">Top Depositor (Highest Deposit)</option>
                <option value="top_performer">Top Performer (Network Leader)</option>
                <option value="top_earner">Top Earner (Total Earnings)</option>
                <option value="balance">Wallet Balance (Highest Balance)</option>
                <option value="teamSize">Team Size (Most Members)</option>
                <option value="rank">VIP Rank (Highest VIP)</option>
              </select>

              <button
                onClick={() => setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'))}
                title={`Sort ${sortOrder === 'asc' ? 'Descending' : 'Ascending'}`}
                className="p-1.5 rounded-xl border border-gray-200 dark:border-white/10 hover:bg-gray-100 dark:hover:bg-white/5 text-gray-700 dark:text-gray-300 cursor-pointer"
              >
                <ArrowUpDown className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-gray-100 dark:border-white/5">
          <div className="flex items-center gap-1 overflow-x-auto pb-1 max-w-full">
            <span className={`text-[10px] uppercase font-bold tracking-wider mr-1 ${t.textMuted}`}>Rank:</span>
            {['all', 'VIP1', 'VIP2', 'VIP3', 'VIP4', 'VIP5', 'VIP6', 'VIP7', 'VIP8'].map(rank => (
              <button
                key={rank}
                onClick={() => {
                  setSelectedRank(rank);
                  setCurrentPage(1);
                }}
                className={`px-2.5 py-1 rounded-full text-[10px] font-bold font-mono transition-all cursor-pointer ${
                  selectedRank === rank
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-white/10'
                }`}
              >
                {rank.toUpperCase()}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1 ml-auto">
            <span className={`text-[10px] uppercase font-bold tracking-wider mr-1 ${t.textMuted}`}>Status:</span>
            {['all', 'Active', 'Suspended'].map(st => (
              <button
                key={st}
                onClick={() => {
                  setSelectedStatus(st);
                  setCurrentPage(1);
                }}
                className={`px-2.5 py-1 rounded-full text-[10px] font-bold transition-all cursor-pointer ${
                  selectedStatus === st
                    ? 'bg-gray-900 text-white dark:bg-white dark:text-black shadow-xs'
                    : 'bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-white/10'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {/* Bulk Action Toolbar */}
        {selectedUserIds.length > 0 && (
          <div className="p-3 rounded-2xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-between animate-in fade-in text-xs font-semibold">
            <div className="flex items-center gap-2 text-blue-500">
              <CheckSquare className="w-4 h-4" />
              <span>{selectedUserIds.length} users selected</span>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                onClick={() => handleBulkAction('activate')}
                className="text-[11px] h-7 px-2.5 bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/30 border-0"
              >
                Activate All
              </Button>
              <Button
                variant="secondary"
                onClick={() => handleBulkAction('suspend')}
                className="text-[11px] h-7 px-2.5 bg-rose-500/20 text-rose-600 dark:text-rose-400 hover:bg-rose-500/30 border-0"
              >
                Suspend All
              </Button>
              <Button
                variant="secondary"
                onClick={() => handleBulkAction('export')}
                className="text-[11px] h-7 px-2.5 bg-blue-500/20 text-blue-600 dark:text-blue-400 hover:bg-blue-500/30 border-0"
              >
                Export Selected
              </Button>
              <button
                onClick={() => setSelectedUserIds([])}
                className={`text-[11px] underline ml-2 cursor-pointer ${t.textMuted} hover:text-gray-900 dark:hover:text-white`}
              >
                Deselect
              </button>
            </div>
          </div>
        )}
      </div>

      {/* USERS DATA TABLE */}
      <div className={`rounded-3xl border ${t.cardBg || t.card} ${t.cardBorder || ''} overflow-hidden shadow-sm`}>
        <div className="overflow-x-auto min-h-[380px]">
          <table className="w-full text-left text-xs">
            <thead className={`bg-gray-50/75 dark:bg-white/3 border-b ${t.cardBorder || 'border-gray-200 dark:border-white/10'}`}>
              <tr className="text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider text-[10px]">
                <th className="p-4 w-10 text-center">
                  <button onClick={toggleSelectAll} className="cursor-pointer">
                    {selectedUserIds.length > 0 && selectedUserIds.length === paginatedUsers.length ? (
                      <CheckSquare className="w-4 h-4 text-blue-500" />
                    ) : (
                      <Square className="w-4 h-4 text-gray-400" />
                    )}
                  </button>
                </th>
                <th className="py-3.5 px-4">User Account</th>
                <th className="py-3.5 px-4">VIP Level</th>
                <th className="py-3.5 px-4 text-right">Wallet Balance</th>
                <th className="py-3.5 px-4 text-center">Referral Network</th>
                <th className="py-3.5 px-4">Registration</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className={`divide-y ${isDark ? 'divide-white/5' : 'divide-gray-100'}`}>
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center">
                    <div className="inline-flex flex-col items-center justify-center space-y-2">
                      <span className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
                      <p className={`text-xs ${t.textMuted} font-medium`}>Loading member directory records...</p>
                    </div>
                  </td>
                </tr>
              ) : paginatedUsers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center">
                    <div className="inline-flex flex-col items-center justify-center space-y-2">
                      <Users className="w-8 h-8 text-gray-400" />
                      <p className="text-sm font-bold text-gray-900 dark:text-white">No accounts match search filters</p>
                      <p className={`text-xs ${t.textMuted}`}>Try adjusting your keywords or clearing rank filters.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedUsers.map((u) => {
                  const isSelected = selectedUserIds.includes(u.id);
                  const isDropdownOpen = openDropdownId === u.id;

                  return (
                    <tr
                      key={u.id}
                      className={`hover:bg-blue-50/30 dark:hover:bg-white/2 transition-colors ${
                        isSelected ? 'bg-blue-500/5' : ''
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="p-4 text-center">
                        <button onClick={() => toggleSelectUser(u.id)} className="cursor-pointer">
                          {isSelected ? (
                            <CheckSquare className="w-4 h-4 text-blue-500" />
                          ) : (
                            <Square className="w-4 h-4 text-gray-300 dark:text-gray-600" />
                          )}
                        </button>
                      </td>

                      {/* User Account Info */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <Avatar name={u.name} size="sm" />
                          <div className="min-w-0">
                            <div className="font-extrabold text-gray-900 dark:text-white truncate max-w-[150px]">{u.name}</div>
                            <div className={`text-[10px] ${t.textMuted} truncate max-w-[150px]`}>{u.email}</div>
                            <div className="text-[9px] font-mono text-gray-400">{u.userId || u.id}</div>
                          </div>
                        </div>
                      </td>

                      {/* VIP Rank */}
                      <td className="py-3.5 px-4">
                        <UserVipBadge rank={u.rank} />
                      </td>

                      {/* Wallet Balance */}
                      <td className="py-3.5 px-4 text-right">
                        <span className="font-mono font-black text-gray-900 dark:text-white text-xs">{u.balance}</span>
                        <div className="text-[9px] text-gray-400 font-medium">
                          Dep: <span className="font-bold text-gray-600 dark:text-gray-300 font-mono">{u.totalDeposits || '$0.00'}</span>
                        </div>
                      </td>

                      {/* Referral Network Size */}
                      <td className="py-3.5 px-4 text-center">
                        <button
                          onClick={() => openActionModal(u, 'team')}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-600 dark:text-purple-400 font-bold text-[11px] cursor-pointer transition"
                        >
                          <Network className="w-3 h-3" />
                          <span>{u.teamSize ?? ((u.levelA || 0) + (u.levelB || 0) + (u.levelC || 0) + (u.levelD || 0))} members</span>
                        </button>
                      </td>

                      {/* Join Date */}
                      <td className="py-3.5 px-4 font-mono text-[11px] text-gray-500 dark:text-gray-400">
                        {u.joined}
                      </td>

                      {/* Status Flag */}
                      <td className="py-3.5 px-4 text-center">
                        <button
                          onClick={() => setConfirmToggleUser(u)}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold cursor-pointer transition ${
                            u.status === 'Active'
                              ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/25'
                              : 'bg-red-500/15 text-red-600 dark:text-red-400 hover:bg-red-500/25'
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${u.status === 'Active' ? 'bg-emerald-500' : 'bg-red-500'}`} />
                          <span>{u.status}</span>
                        </button>
                      </td>

                      {/* Action Dropdown Menu */}
                      <td className="py-3.5 px-4 text-right relative">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => openActionModal(u, 'profile')}
                            title="Quick View Profile"
                            className={`p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 cursor-pointer ${t.textMuted} hover:text-gray-900 dark:hover:text-white`}
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          <div className="relative">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setOpenDropdownId(isDropdownOpen ? null : u.id);
                              }}
                              className={`p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 cursor-pointer ${
                                isDropdownOpen ? 'bg-gray-100 dark:bg-white/10 text-gray-900 dark:text-white' : t.textMuted
                              }`}
                            >
                              <MoreVertical className="w-4 h-4" />
                            </button>

                            {/* Dropdown Menu Overlay */}
                            {isDropdownOpen && (
                              <div
                                ref={dropdownRef}
                                className="absolute right-0 top-8 w-56 rounded-2xl border p-1.5 shadow-2xl z-50 animate-in fade-in zoom-in-95 text-left bg-white dark:bg-[#0f112e] border-gray-200 dark:border-white/10 text-gray-900 dark:text-white"
                              >
                                <div className="px-3 py-1.5 border-b border-gray-100 dark:border-white/5">
                                  <p className="text-[10px] font-mono font-bold text-gray-500 dark:text-gray-400 uppercase">Actions: {u.name}</p>
                                </div>

                                <div className="space-y-0.5 pt-1">
                                  <button
                                    onClick={() => openActionModal(u, 'profile')}
                                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold hover:bg-blue-500/10 hover:text-blue-500 transition cursor-pointer text-gray-700 dark:text-gray-300"
                                  >
                                    <Eye className="w-3.5 h-3.5 text-blue-500" />
                                    <span>Full Profile Card</span>
                                  </button>

                                  <button
                                    onClick={() => openActionModal(u, 'edit')}
                                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold hover:bg-amber-500/10 hover:text-amber-500 transition cursor-pointer text-gray-700 dark:text-gray-300"
                                  >
                                    <Edit className="w-3.5 h-3.5 text-amber-500" />
                                    <span>Edit User Settings</span>
                                  </button>

                                  <button
                                    onClick={() => openActionModal(u, 'wallet_adjustment')}
                                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold hover:bg-emerald-500/10 hover:text-emerald-500 transition cursor-pointer text-gray-700 dark:text-gray-300"
                                  >
                                    <DollarSign className="w-3.5 h-3.5 text-emerald-500" />
                                    <span>Adjust Ledger Balance</span>
                                  </button>

                                  <button
                                    onClick={() => openActionModal(u, 'send_notification')}
                                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold hover:bg-blue-500/10 hover:text-blue-500 transition cursor-pointer text-gray-700 dark:text-gray-300"
                                  >
                                    <Bell className="w-3.5 h-3.5 text-blue-500" />
                                    <span>Send Custom Mail</span>
                                  </button>

                                  <div className="my-1 border-t border-gray-100 dark:border-white/5" />

                                  <button
                                    onClick={() => openActionModal(u, 'transactions')}
                                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold hover:bg-cyan-500/10 hover:text-cyan-500 transition cursor-pointer text-gray-700 dark:text-gray-300"
                                  >
                                    <FileText className="w-3.5 h-3.5 text-cyan-500" />
                                    <span>View Transactions</span>
                                  </button>

                                  <button
                                    onClick={() => openActionModal(u, 'deposits')}
                                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold hover:bg-blue-500/10 hover:text-blue-500 transition cursor-pointer text-gray-700 dark:text-gray-300"
                                  >
                                    <FileDown className="w-3.5 h-3.5 text-blue-500" />
                                    <span>Deposit Registry</span>
                                  </button>

                                  <button
                                    onClick={() => openActionModal(u, 'withdrawals')}
                                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold hover:bg-rose-500/10 hover:text-rose-500 transition cursor-pointer text-gray-700 dark:text-gray-300"
                                  >
                                    <History className="w-3.5 h-3.5 text-rose-500" />
                                    <span>Withdrawal Ledger</span>
                                  </button>

                                  <button
                                    onClick={() => openActionModal(u, 'team')}
                                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold hover:bg-purple-500/10 hover:text-purple-500 transition cursor-pointer text-gray-700 dark:text-gray-300"
                                  >
                                    <Network className="w-3.5 h-3.5 text-purple-500" />
                                    <span>Team Network (A-D)</span>
                                  </button>

                                  <button
                                    onClick={() => openActionModal(u, 'audit')}
                                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold hover:bg-indigo-500/10 hover:text-indigo-500 transition cursor-pointer text-gray-700 dark:text-gray-300"
                                  >
                                    <ShieldAlert className="w-3.5 h-3.5 text-indigo-500" />
                                    <span>Audit Logs Trail</span>
                                  </button>

                                  <div className="my-1 border-t border-gray-100 dark:border-white/5" />

                                  <button
                                    onClick={() => {
                                      setOpenDropdownId(null);
                                      setConfirmToggleUser(u);
                                    }}
                                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
                                      u.status === 'Active'
                                        ? 'hover:bg-red-500/10 text-red-500'
                                        : 'hover:bg-emerald-500/10 text-emerald-500'
                                    }`}
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                    <span>{u.status === 'Active' ? 'Suspend Access' : 'Activate Access'}</span>
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION BAR */}
        <div className={`p-4 border-t ${t.cardBorder || 'border-gray-200 dark:border-white/10'} flex flex-col sm:flex-row items-center justify-between gap-3 text-xs`}>
          <p className={`${t.textMuted}`}>
            Showing <span className="font-bold text-gray-900 dark:text-white">{(currentPage - 1) * itemsPerPage + 1}</span> to{' '}
            <span className="font-bold text-gray-900 dark:text-white">
              {Math.min(currentPage * itemsPerPage, filteredUsers.length)}
            </span>{' '}
            of <span className="font-bold text-gray-900 dark:text-white">{filteredUsers.length}</span> members
          </p>

          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
              className="text-xs h-8 px-3"
            >
              Previous
            </Button>
            <span className="font-mono font-bold px-2 text-gray-900 dark:text-white">
              {currentPage} / {totalPages}
            </span>
            <Button
              variant="secondary"
              disabled={currentPage === totalPages || totalPages === 0}
              onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
              className="text-xs h-8 px-3"
            >
              Next
            </Button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODALS RENDERING (Form Modals & History Modals) */}
      {/* ========================================================================= */}

      {/* 1. Edit User Modal */}
      {activeActionUser && activeActionType === 'edit' && (
        <UserEditModal
          user={activeActionUser}
          profileDetail={profileDetail}
          loadingDetails={loadingDetails}
          editForm={editForm}
          setEditForm={setEditForm}
          onSave={handleSaveEdit}
          onClose={() => { setActiveActionUser(null); setActiveActionType(null); }}
          t={t}
        />
      )}

      {/* 2. Wallet Adjustment Modal */}
      {activeActionUser && activeActionType === 'wallet_adjustment' && (
        <UserWalletAdjustmentModal
          user={activeActionUser}
          walletForm={walletForm}
          setWalletForm={setWalletForm}
          onConfirm={handleConfirmWalletAdjustment}
          onClose={() => { setActiveActionUser(null); setActiveActionType(null); }}
          t={t}
        />
      )}

      {/* 3. Send Notification Modal */}
      {activeActionUser && activeActionType === 'send_notification' && (
        <UserNotificationModal
          user={activeActionUser}
          notifForm={notifForm}
          setNotifForm={setNotifForm}
          onSend={handleSendNotification}
          onClose={() => { setActiveActionUser(null); setActiveActionType(null); }}
          triggerToast={triggerToast}
          t={t}
        />
      )}

      {/* 4. Full Profile Modal */}
      {activeActionUser && activeActionType === 'profile' && (
        <UserProfileModal
          user={activeActionUser}
          profileDetail={profileDetail}
          loadingDetails={loadingDetails}
          onEdit={() => openActionModal(activeActionUser, 'edit')}
          onClose={() => { setActiveActionUser(null); setActiveActionType(null); }}
          onViewHistory={handleViewAddressHistory}
          onCopyAddress={handleCopyAddress}
          onRotateAddress={(net) => setRotateConfirmNetwork(net)}
          rotatingNetwork={rotatingNetwork}
          t={t}
        />
      )}

      {/* 5. Address History Modal */}
      {addressHistoryModal && (
        <AddressHistoryModal
          network={addressHistoryModal.network}
          history={addressHistoryModal.history}
          loading={addressHistoryModal.loading}
          onCopyAddress={handleCopyAddress}
          onClose={() => setAddressHistoryModal(null)}
        />
      )}

      {/* 6. Rotate Address Confirmation Modal */}
      {rotateConfirmNetwork && (
        <RotateAddressConfirmModal
          network={rotateConfirmNetwork}
          rotatingNetwork={rotatingNetwork}
          onConfirm={handleRotateAddress}
          onClose={() => setRotateConfirmNetwork(null)}
        />
      )}

      {/* 7. Transactions Ledger Modal */}
      {activeActionUser && activeActionType === 'transactions' && (
        <TransactionsModal
          user={activeActionUser}
          transactions={modalTransactions}
          loading={loadingDetails}
          onClose={() => { setActiveActionUser(null); setActiveActionType(null); }}
          t={t}
        />
      )}

      {/* 8. Deposits History Modal */}
      {activeActionUser && activeActionType === 'deposits' && (
        <DepositsModal
          user={activeActionUser}
          deposits={modalDeposits}
          loading={loadingDetails}
          onClose={() => { setActiveActionUser(null); setActiveActionType(null); }}
          t={t}
        />
      )}

      {/* 9. Withdrawal History Modal */}
      {activeActionUser && activeActionType === 'withdrawals' && (
        <WithdrawalsModal
          user={activeActionUser}
          withdrawals={modalWithdrawals}
          loading={loadingDetails}
          onClose={() => { setActiveActionUser(null); setActiveActionType(null); }}
          t={t}
        />
      )}

      {/* 10. Team Network Hierarchy Modal */}
      {activeActionUser && activeActionType === 'team' && (
        <TeamNetworkModal
          user={activeActionUser}
          team={modalTeam}
          loading={loadingDetails}
          onClose={() => { setActiveActionUser(null); setActiveActionType(null); }}
          t={t}
        />
      )}

      {/* 11. Audit Logs Modal */}
      {activeActionUser && activeActionType === 'audit' && (
        <AuditLogsModal
          user={activeActionUser}
          audits={modalAudits}
          loading={loadingDetails}
          onClose={() => { setActiveActionUser(null); setActiveActionType(null); }}
          t={t}
        />
      )}

      {/* 12. Suspend / Activate Status Confirmation Modal */}
      {confirmToggleUser && (
        <UserConfirmToggleStatusModal
          user={confirmToggleUser}
          onConfirm={handleToggleStatus}
          onClose={() => setConfirmToggleUser(null)}
        />
      )}

      {/* 13. Add Member Account Modal */}
      <AddUserModal
        isOpen={isAddUserOpen}
        newUser={newUser}
        setNewUser={setNewUser}
        onSubmit={handleAddUser}
        onClose={() => setIsAddUserOpen(false)}
        t={t}
      />
    </div>
  );
};
