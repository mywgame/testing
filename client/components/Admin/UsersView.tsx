/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Search,
  Eye,
  Ban,
  MessageSquare,
  Plus,
  X,
  Edit,
  Trash2,
  CheckCircle,
  AlertCircle,
  Award,
  MoreVertical,
  ArrowUpDown,
  DollarSign,
  User,
  Bell,
  History,
  Network,
  FileText,
  Upload,
  UserCheck,
  Check,
  FileDown,
  ChevronDown,
  ShieldAlert,
  Inbox,
  Copy,
  RefreshCw
} from 'lucide-react';
import { Card, Button, Input, Select, Badge, Avatar, Toast, Textarea } from '../ui/index.ts';
import { ThemeTokens } from '../ui/themeTokens.ts';
import { AdminUser } from './types.ts';
import { api } from '../../services/api.ts';

interface UsersViewProps {
  t: ThemeTokens;
  isDark: boolean;
}

export const UsersView: React.FC<UsersViewProps> = ({ t, isDark }) => {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [filter, setFilter] = useState<string>('All');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<string>('Newest');
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(10);
  const [total, setTotal] = useState<number>(0);

  // Dynamic Detail/History States for Modals
  const [loadingDetails, setLoadingDetails] = useState<boolean>(false);
  const [profileDetail, setProfileDetail] = useState<any>(null);
  const [modalTransactions, setModalTransactions] = useState<any[]>([]);
  const [modalDeposits, setModalDeposits] = useState<any[]>([]);
  const [modalWithdrawals, setModalWithdrawals] = useState<any[]>([]);
  const [modalAudits, setModalAudits] = useState<any[]>([]);
  const [modalTeam, setModalTeam] = useState<any[]>([]);

  // Deposit Address Rotation / History States
  const [rotateConfirmNetwork, setRotateConfirmNetwork] = useState<string | null>(null);
  const [rotatingNetwork, setRotatingNetwork] = useState<string | null>(null);
  const [historyNetwork, setHistoryNetwork] = useState<string | null>(null);
  const [addressHistory, setAddressHistory] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState<boolean>(false);

  // Interactive Toast State
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastVariant, setToastVariant] = useState<'info' | 'success' | 'error'>('success');

  // Selected User for Actions
  const [activeDropdownUserId, setActiveDropdownUserId] = useState<string | null>(null);
  const [activeActionUser, setActiveActionUser] = useState<AdminUser | null>(null);
  const [activeActionType, setActiveActionType] = useState<
    | 'view_profile'
    | 'edit_profile'
    | 'wallet_adjustment'
    | 'send_notification'
    | 'transactions'
    | 'deposits'
    | 'withdrawals'
    | 'team'
    | 'audit'
    | null
  >(null);

  // User status toggle confirmation modals
  const [confirmToggleUser, setConfirmToggleUser] = useState<AdminUser | null>(null);

  // Create User Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New User Form State (local mock setup, can be plugged to signup endpoint if needed)
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

  // Edit Profile Form State (Local Copy)
  const [editForm, setEditForm] = useState<{
    name: string;
    email: string;
    mobile: string;
    status: 'Active' | 'Suspended';
    adminNotes: string;
  }>({
    name: '',
    email: '',
    mobile: '',
    status: 'Active',
    adminNotes: ''
  });

  // Wallet Adjustment Form State
  const [walletForm, setWalletForm] = useState({
    type: 'credit' as 'credit' | 'debit',
    amount: '',
    reason: 'Yield Correction',
    adminNote: ''
  });

  // Custom Notification Form State
  const [notifForm, setNotifForm] = useState({
    title: '',
    message: '',
    type: 'Info' as 'Info' | 'Success' | 'Warning' | 'Security' | 'Promotion',
    priority: 'Normal' as 'Normal' | 'High',
    attachments: [] as string[]
  });

  // Drag and drop attachment visualization
  const [isDraggingFile, setIsDraggingFile] = useState(false);

  // Helper trigger for custom toasts
  const triggerToast = (msg: string, variant: 'info' | 'success' | 'error' = 'success') => {
    setToastMessage(null);
    setTimeout(() => {
      setToastMessage(msg);
      setToastVariant(variant);
    }, 50);
  };

  // Main fetch function to load paginated users matching search/filters
  const loadUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getAdminUsers({
        search,
        filter,
        sortBy,
        page,
        limit,
      });
      if (res.success && res.data) {
        setUsers(res.data.users);
        setTotal(res.data.pagination.total);
      } else {
        setError(res.error?.message || 'Failed to retrieve ledger data.');
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected networking failure occurred.');
    } finally {
      setLoading(false);
    }
  };

  // Trigger list reloading on dependency updates
  useEffect(() => {
    loadUsers();
  }, [search, filter, sortBy, page, limit]);

  // Close dropdown menu if clicking anywhere
  useEffect(() => {
    const handleGlobalClick = () => {
      setActiveDropdownUserId(null);
    };
    window.addEventListener('click', handleGlobalClick);
    return () => window.removeEventListener('click', handleGlobalClick);
  }, []);

  // Quick Action triggers - fetches resource-specific data on the fly
  const openActionModal = async (user: AdminUser, type: typeof activeActionType) => {
    setActiveActionUser(user);
    setActiveActionType(type);
    setActiveDropdownUserId(null);
    setLoadingDetails(true);

    try {
      if (type === 'view_profile' || type === 'edit_profile') {
        const res = await api.getAdminUserProfile(user.id);
        if (res.success && res.data) {
          setProfileDetail(res.data);
          setEditForm({
            name: res.data.name || '',
            email: res.data.email || '',
            mobile: res.data.mobile || '',
            status: res.data.status || 'Active',
            adminNotes: user.adminNotes || ''
          });
        } else {
          triggerToast(res.error?.message || 'Failed to fetch user profile card.', 'error');
        }
      } else if (type === 'transactions') {
        const res = await api.getAdminUserTransactions(user.id);
        if (res.success && res.data) {
          setModalTransactions(res.data);
        } else {
          triggerToast(res.error?.message || 'Failed to fetch transactions history.', 'error');
        }
      } else if (type === 'deposits') {
        const res = await api.getAdminUserDeposits(user.id);
        if (res.success && res.data) {
          setModalDeposits(res.data);
        } else {
          triggerToast(res.error?.message || 'Failed to fetch deposits history.', 'error');
        }
      } else if (type === 'withdrawals') {
        const res = await api.getAdminUserWithdrawals(user.id);
        if (res.success && res.data) {
          setModalWithdrawals(res.data);
        } else {
          triggerToast(res.error?.message || 'Failed to fetch withdrawals history.', 'error');
        }
      } else if (type === 'audit') {
        const res = await api.getAdminUserAudits(user.id);
        if (res.success && res.data) {
          setModalAudits(res.data);
        } else {
          triggerToast(res.error?.message || 'Failed to fetch compliance audit trail.', 'error');
        }
      } else if (type === 'team') {
        const res = await api.getAdminUserTeamNetwork(user.id);
        if (res.success && res.data) {
          setModalTeam(res.data);
        } else {
          triggerToast(res.error?.message || 'Failed to fetch network team size.', 'error');
        }
      }

      // Reset specific action form values
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
    } catch (err: any) {
      triggerToast(err.message || 'Error occurred while loading member resources.', 'error');
    } finally {
      setLoadingDetails(false);
    }
  };

  // Copy a deposit/withdrawal address to clipboard
  const handleCopyAddress = (address: string) => {
    navigator.clipboard.writeText(address);
    triggerToast('Address copied to clipboard.', 'success');
  };

  // Execute the actual rotation after the admin confirms in the dialog
  const handleConfirmRotate = async (network: string) => {
    if (!activeActionUser) return;
    setRotatingNetwork(network);
    try {
      const res = await api.rotateUserDepositAddress(activeActionUser.id, network);
      if (res.success) {
        triggerToast('✓ Deposit address rotated successfully.', 'success');
        setRotateConfirmNetwork(null);
        // Refresh the modal automatically with the new active address
        await openActionModal(activeActionUser, 'view_profile');
      } else {
        triggerToast(res.error?.message || 'Failed to rotate deposit address.', 'error');
      }
    } catch (err: any) {
      triggerToast(err.message || 'Error occurred while rotating deposit address.', 'error');
    } finally {
      setRotatingNetwork(null);
    }
  };

  // Fetch and open the full address history modal for a network
  const handleViewHistory = async (network: string) => {
    if (!activeActionUser) return;
    setHistoryNetwork(network);
    setLoadingHistory(true);
    try {
      const res = await api.getUserDepositAddressHistory(activeActionUser.id, network);
      if (res.success && res.data) {
        setAddressHistory(res.data);
      } else {
        triggerToast(res.error?.message || 'Failed to fetch address history.', 'error');
      }
    } catch (err: any) {
      triggerToast(err.message || 'Error occurred while loading address history.', 'error');
    } finally {
      setLoadingHistory(false);
    }
  };

  // Handle Edit Profile Save
  const handleSaveProfileEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeActionUser) return;

    try {
      const res = await api.updateAdminUserProfile(activeActionUser.id, editForm);
      if (res.success) {
        triggerToast(`Profile for ${editForm.name} successfully updated on the server!`, 'success');
        setActiveActionUser(null);
        setActiveActionType(null);
        loadUsers();
      } else {
        triggerToast(res.error?.message || 'Failed to save profile changes.', 'error');
      }
    } catch (err: any) {
      triggerToast(err.message || 'Error executing request.', 'error');
    }
  };

  // Handle Wallet Adjustment Confirm
  const handleConfirmWalletAdjustment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeActionUser) return;

    const adjustmentAmount = parseFloat(walletForm.amount);
    if (isNaN(adjustmentAmount) || adjustmentAmount <= 0) {
      triggerToast('Please provide a valid ledger adjustment amount', 'error');
      return;
    }

    const finalAmount = walletForm.type === 'credit' ? adjustmentAmount : -adjustmentAmount;

    try {
      const res = await api.adjustAdminUserWallet(activeActionUser.id, {
        amount: finalAmount,
        memo: `${walletForm.reason}. Admin Note: ${walletForm.adminNote || 'None'}`
      });
      if (res.success) {
        triggerToast(`Successfully registered manual ledger balance adjustment of ${walletForm.type === 'credit' ? '+' : '-'}$${adjustmentAmount.toFixed(2)}`, 'success');
        setActiveActionUser(null);
        setActiveActionType(null);
        loadUsers();
      } else {
        triggerToast(res.error?.message || 'Failed to adjust ledger balance.', 'error');
      }
    } catch (err: any) {
      triggerToast(err.message || 'Error executing balance modification.', 'error');
    }
  };

  // Handle Custom Notification Delivery
  const handleSendNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeActionUser) return;

    if (!notifForm.title.trim() || !notifForm.message.trim()) {
      triggerToast('Title and message content cannot be blank.', 'error');
      return;
    }

    try {
      const res = await api.sendAdminUserNotification(activeActionUser.id, {
        message: `Subject: ${notifForm.title}. Body: ${notifForm.message}`,
        priority: notifForm.priority === 'High' ? 'HIGH' : 'MEDIUM'
      });
      if (res.success) {
        triggerToast(`Notification successfully dispatched to the target user mailbox!`, 'success');
        setActiveActionUser(null);
        setActiveActionType(null);
      } else {
        triggerToast(res.error?.message || 'Failed to transmit custom notification.', 'error');
      }
    } catch (err: any) {
      triggerToast(err.message || 'Error delivering message.', 'error');
    }
  };

  // Handle Quick User Status Toggle (Suspend / Activate)
  const handleToggleStatus = async (user: AdminUser) => {
    const actionType = user.status === 'Active' ? 'SUSPEND' : 'UNLOCK';

    try {
      const res = await api.adminActionUser(user.id, {
        action: actionType
      });
      if (res.success) {
        triggerToast(`Account status updated to ${user.status === 'Active' ? 'Suspended' : 'Active'} for ${user.name}`, 'success');
        setConfirmToggleUser(null);
        loadUsers();
      } else {
        triggerToast(res.error?.message || 'Failed to execute account restriction updates.', 'error');
      }
    } catch (err: any) {
      triggerToast(err.message || 'Error executing security privileges toggles.', 'error');
    }
  };

  // Handle Add New User
  const handleAddUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.createAdminUser(newUser);
      if (res.success) {
        triggerToast(`Member account for ${newUser.name} created successfully!`, 'success');
        setIsAddModalOpen(false);
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
        loadUsers();
      } else {
        triggerToast(res.error?.message || 'Failed to initialize account.', 'error');
      }
    } catch (err: any) {
      triggerToast(err.message || 'Error executing request.', 'error');
    }
  };

  // File Upload Handlers (Drag and Drop Visuals)
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingFile(true);
  };

  const handleDragLeave = () => {
    setIsDraggingFile(false);
  };

  const handleDropFile = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingFile(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const fileName = e.dataTransfer.files[0].name;
      setNotifForm(prev => ({
        ...prev,
        attachments: [...prev.attachments, fileName]
      }));
      triggerToast(`Attached file: ${fileName}`, 'info');
    }
  };

  const handleSelectFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const fileName = e.target.files[0].name;
      setNotifForm(prev => ({
        ...prev,
        attachments: [...prev.attachments, fileName]
      }));
      triggerToast(`Attached file: ${fileName}`, 'info');
    }
  };

  // Helper for rendering high-quality consistent VIP Badges
  const getVipBadge = (rank: string) => {
    const vipColors: Record<string, { bg: string; text: string; border: string; glow?: string }> = {
      VIP1: { bg: 'bg-orange-500/10 dark:bg-orange-500/15', text: 'text-orange-600 dark:text-orange-400', border: 'border-orange-500/20' },
      VIP2: { bg: 'bg-slate-500/10 dark:bg-slate-400/15', text: 'text-slate-600 dark:text-slate-300', border: 'border-slate-500/20' },
      VIP3: { bg: 'bg-amber-500/10 dark:bg-amber-500/15', text: 'text-amber-600 dark:text-amber-400', border: 'border-amber-500/20' },
      VIP4: { bg: 'bg-emerald-500/10 dark:bg-emerald-500/15', text: 'text-emerald-600 dark:text-emerald-400', border: 'border-emerald-500/20' },
      VIP5: { bg: 'bg-cyan-500/10 dark:bg-cyan-500/15', text: 'text-cyan-600 dark:text-cyan-400', border: 'border-cyan-500/20' },
      VIP6: { bg: 'bg-purple-500/10 dark:bg-purple-500/15', text: 'text-purple-600 dark:text-purple-400', border: 'border-purple-500/20' },
      VIP7: { bg: 'bg-rose-500/10 dark:bg-rose-500/15', text: 'text-rose-600 dark:text-rose-400', border: 'border-rose-500/20' },
      VIP8: { bg: 'bg-indigo-500/15 dark:bg-indigo-500/20', text: 'text-indigo-600 dark:text-indigo-400', border: 'border-indigo-500/30', glow: 'shadow-xs shadow-indigo-500/25 animate-pulse' },
    };

    const style = vipColors[rank] || { bg: 'bg-blue-500/10', text: 'text-blue-600', border: 'border-blue-500/20' };

    return (
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-mono font-extrabold uppercase tracking-wider border ${style.bg} ${style.text} ${style.border} ${style.glow || ''}`}>
        <Award className="w-2.5 h-2.5" />
        {rank}
      </span>
    );
  };

  return (
    <div className="space-y-6 text-left relative">
      {/* Toast Notification Container */}
      {toastMessage && (
        <Toast
          message={toastMessage}
          variant={toastVariant}
          onClose={() => setToastMessage(null)}
        />
      )}

      {/* Top Banner Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight font-display">User Accounts Ledger</h2>
          <p className={`text-xs mt-1 ${t.textSub}`}>
            Audit user network lines, execute ledger changes, transmit targeted notifications, and configure user permissions.
          </p>
        </div>
        <Button
          onClick={() => setIsAddModalOpen(true)}
          className="sm:self-center flex items-center gap-1.5 self-start"
          leftIcon={<Plus className="w-4 h-4" />}
        >
          Create User
        </Button>
      </div>

      {/* Stats Bento Box Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { l: 'Total Accounts Registered', v: total, c: 'text-blue-500' },
          { l: 'Active Operations access', v: users.filter(u => u.status === 'Active').length, c: 'text-emerald-500' },
          { l: 'Suspended Platform Access', v: users.filter(u => u.status === 'Suspended').length, c: 'text-red-500' },
          { l: 'Core VIP Privilege tier 5-8', v: users.filter(u => ['VIP5', 'VIP6', 'VIP7', 'VIP8'].includes(u.rank)).length, c: 'text-purple-500' },
        ].map((stat) => (
          <Card key={stat.l} className="p-4 flex flex-col justify-between min-h-[90px]">
            <span className={`text-[10px] font-mono font-bold tracking-wider ${t.textMuted} uppercase`}>{stat.l}</span>
            <span className={`text-xl font-extrabold font-display leading-none mt-2 ${stat.c}`}>{stat.v}</span>
          </Card>
        ))}
      </div>

      {/* Filters and Search Tools */}
      <Card className="p-0 overflow-hidden border">
        <div className={`p-4 border-b flex flex-col xl:flex-row gap-4 items-center justify-between ${t.sep}`}>
          {/* Left search and sort filters */}
          <div className="flex flex-col sm:flex-row gap-3 w-full xl:w-auto items-stretch sm:items-center">
            {/* Search Input */}
            <div className="relative w-full sm:w-72">
              <Search className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 ${t.textMuted}`} />
              <input
                type="text"
                placeholder="Search by name, ID, phone, email..."
                value={search}
                onChange={e => { setSearch(e.target.value); setPage(1); }}
                className={`w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all ${t.input}`}
              />
            </div>

            {/* Sort Select */}
            <div className="relative w-full sm:w-56 flex items-center gap-2">
              <span className={`text-xs whitespace-nowrap font-bold font-mono ${t.textMuted}`}>Sort By:</span>
              <select
                value={sortBy}
                onChange={e => { setSortBy(e.target.value); setPage(1); }}
                className={`w-full px-3 py-2 text-xs rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white dark:bg-white/5 text-gray-900 dark:text-white border-gray-200 dark:border-white/10`}
              >
                <option value="Newest">Newest Users</option>
                <option value="Oldest">Oldest Users</option>
                <option value="HighestBalance">Highest Wallet Balance</option>
                <option value="LowestBalance">Lowest Wallet Balance</option>
                <option value="HighestReferrals">Highest Direct Referrals</option>
                <option value="HighestTeamSize">Highest Team Size</option>
              </select>
            </div>
          </div>

          {/* Quick Filters - VIP and access status scrollable selection line */}
          <div className="w-full xl:w-auto">
            <div className="flex gap-1.5 overflow-x-auto pb-1.5 xl:pb-0 scrollbar-thin">
              {[
                { label: 'All Users', val: 'All' },
                { label: 'Active', val: 'Active' },
                { label: 'Suspended', val: 'Suspended' },
                { label: 'VIP1', val: 'VIP1' },
                { label: 'VIP2', val: 'VIP2' },
                { label: 'VIP3', val: 'VIP3' },
                { label: 'VIP4', val: 'VIP4' },
                { label: 'VIP5', val: 'VIP5' },
                { label: 'VIP6', val: 'VIP6' },
                { label: 'VIP7', val: 'VIP7' },
                { label: 'VIP8', val: 'VIP8' }
              ].map(item => {
                const active = filter === item.val;
                return (
                  <button
                    key={item.val}
                    onClick={() => { setFilter(item.val); setPage(1); }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                      active
                        ? 'bg-blue-600 text-white shadow-xs'
                        : `${isDark ? 'bg-white/5 text-gray-400 hover:bg-white/8' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`
                     }`}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Enhanced Table Area */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-12 text-center flex flex-col items-center justify-center space-y-2">
              <span className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
              <p className={`text-xs ${t.textMuted}`}>Synchronizing users ledger with backend database...</p>
            </div>
          ) : error ? (
            <div className="p-12 text-center text-red-500 font-bold space-y-2">
              <AlertCircle className="w-8 h-8 mx-auto" />
              <p>{error}</p>
            </div>
          ) : (
            <table className="w-full text-left text-xs whitespace-nowrap">
              <thead>
                <tr className={`border-b ${t.sep} ${isDark ? 'bg-white/2' : 'bg-gray-50'}`}>
                  <th className={`px-5 py-3.5 font-bold uppercase tracking-wider ${t.textMuted}`}>User Profile</th>
                  <th className={`px-5 py-3.5 font-bold uppercase tracking-wider ${t.textMuted}`}>User ID</th>
                  <th className={`px-5 py-3.5 font-bold uppercase tracking-wider ${t.textMuted}`}>VIP Tier</th>
                  <th className={`px-5 py-3.5 font-bold uppercase tracking-wider ${t.textMuted}`}>Wallet Balance</th>
                  <th className={`px-5 py-3.5 font-bold uppercase tracking-wider ${t.textMuted} text-center`}>Level A</th>
                  <th className={`px-5 py-3.5 font-bold uppercase tracking-wider ${t.textMuted} text-center`}>Level B</th>
                  <th className={`px-5 py-3.5 font-bold uppercase tracking-wider ${t.textMuted} text-center`}>Level C</th>
                  <th className={`px-5 py-3.5 font-bold uppercase tracking-wider ${t.textMuted} text-center`}>Level D</th>
                  <th className={`px-5 py-3.5 font-bold uppercase tracking-wider ${t.textMuted}`}>Access Status</th>
                  <th className={`px-5 py-3.5 font-bold uppercase tracking-wider ${t.textMuted}`}>Registered Date</th>
                  <th className={`px-5 py-3.5 font-bold uppercase tracking-wider ${t.textMuted} text-right`}>Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100/10">
                {users.length > 0 ? (
                  users.map((user) => (
                    <tr key={user.id} className={`transition-colors ${t.cardInner}`}>
                      {/* User Profile column */}
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <Avatar name={user.name} size="md" className={user.status === 'Suspended' ? 'opacity-60' : ''} />
                          <div className="min-w-0">
                            <p className="font-bold truncate text-sm">{user.name}</p>
                            <div className={`flex flex-col text-[10px] ${t.textMuted} mt-0.5 space-y-0.5`}>
                              <span className="truncate">{user.email}</span>
                              <span>{user.mobile}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* User ID */}
                      <td className={`px-5 py-3 font-mono font-semibold text-xs ${t.textMuted}`}>{user.userId}</td>

                      {/* VIP Tier */}
                      <td className="px-5 py-3">{getVipBadge(user.rank)}</td>

                      {/* Wallet Balance */}
                      <td className="px-5 py-3 font-bold font-display text-sm text-gray-900 dark:text-white">
                        {user.balance}
                      </td>

                      {/* Level A */}
                      <td className="px-5 py-3 text-center font-mono font-bold text-gray-800 dark:text-gray-200">
                        {user.levelA}
                      </td>

                      {/* Level B */}
                      <td className="px-5 py-3 text-center font-mono text-gray-500 dark:text-gray-400">
                        {user.levelB}
                      </td>

                      {/* Level C */}
                      <td className="px-5 py-3 text-center font-mono text-gray-500 dark:text-gray-400">
                        {user.levelC}
                      </td>

                      {/* Level D */}
                      <td className="px-5 py-3 text-center font-mono text-gray-500 dark:text-gray-400">
                        {user.levelD}
                      </td>

                      {/* Access Status */}
                      <td className="px-5 py-3">
                        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          user.status === 'Active' ? 'bg-emerald-500/15 text-emerald-500' : 'bg-red-500/15 text-red-500'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${user.status === 'Active' ? 'bg-emerald-500' : 'bg-red-500'}`} />
                          {user.status}
                        </span>
                      </td>

                      {/* Registered Date */}
                      <td className={`px-5 py-3 font-semibold ${t.textMuted}`}>{user.joined}</td>

                      {/* Actions Menu */}
                      <td className="px-5 py-3 text-right relative">
                        <div className="inline-block text-left">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveDropdownUserId(prev => (prev === user.id ? null : user.id));
                            }}
                            className={`p-2 rounded-xl border border-transparent hover:border-gray-200 dark:hover:border-white/10 hover:bg-gray-100 dark:hover:bg-white/5 transition-all cursor-pointer`}
                          >
                            <MoreVertical className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                          </button>

                          {/* Interactive Dropdown Box */}
                          {activeDropdownUserId === user.id && (
                            <div
                              onClick={(e) => e.stopPropagation()}
                              className="absolute right-5 mt-1 w-64 rounded-2xl bg-white dark:bg-[#0c0d24] border border-gray-200 dark:border-white/10 shadow-2xl z-50 text-left overflow-hidden divide-y divide-gray-100 dark:divide-white/5"
                            >
                              {/* Profile Section */}
                              <div className="p-2 space-y-1">
                                <p className="px-2.5 py-1 text-[9px] font-mono font-bold text-gray-400 uppercase tracking-widest">
                                  Profile & Network
                                </p>
                                <button
                                  onClick={() => openActionModal(user, 'view_profile')}
                                  className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/5 transition"
                                >
                                  <Eye className="w-3.5 h-3.5 text-blue-500" />
                                  View Profile
                                </button>
                                <button
                                  onClick={() => openActionModal(user, 'edit_profile')}
                                  className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/5 transition"
                                >
                                  <Edit className="w-3.5 h-3.5 text-amber-500" />
                                  Edit Profile
                                </button>
                                <button
                                  onClick={() => openActionModal(user, 'team')}
                                  className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/5 transition"
                                >
                                  <Network className="w-3.5 h-3.5 text-purple-500" />
                                  View Team Network (A-D)
                                </button>
                              </div>

                              {/* Ledger Section */}
                              <div className="p-2 space-y-1">
                                <p className="px-2.5 py-1 text-[9px] font-mono font-bold text-gray-400 uppercase tracking-widest">
                                  Financial Ledgers
                                </p>
                                <button
                                  onClick={() => openActionModal(user, 'wallet_adjustment')}
                                  className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/5 transition"
                                >
                                  <DollarSign className="w-3.5 h-3.5 text-emerald-500" />
                                  Wallet Adjustment
                                </button>
                                <button
                                  onClick={() => openActionModal(user, 'transactions')}
                                  className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/5 transition"
                                >
                                  <FileText className="w-3.5 h-3.5 text-cyan-500" />
                                  View Transactions
                                </button>
                                <button
                                  onClick={() => openActionModal(user, 'deposits')}
                                  className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/5 transition"
                                >
                                  <FileDown className="w-3.5 h-3.5 text-blue-500" />
                                  Deposit History
                                </button>
                                <button
                                  onClick={() => openActionModal(user, 'withdrawals')}
                                  className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/5 transition"
                                >
                                  <History className="w-3.5 h-3.5 text-rose-500" />
                                  Withdrawal History
                                </button>
                              </div>

                              {/* Operations Section */}
                              <div className="p-2 space-y-1">
                                <p className="px-2.5 py-1 text-[9px] font-mono font-bold text-gray-400 uppercase tracking-widest">
                                  System Security & Audits
                                </p>
                                <button
                                  onClick={() => openActionModal(user, 'send_notification')}
                                  className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/5 transition"
                                >
                                  <MessageSquare className="w-3.5 h-3.5 text-blue-400" />
                                  Send Custom Mail
                                </button>
                                <button
                                  onClick={() => openActionModal(user, 'audit')}
                                  className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/5 transition"
                                >
                                  <ShieldAlert className="w-3.5 h-3.5 text-indigo-500" />
                                  Administrative Audits
                                </button>
                                {user.status === 'Active' ? (
                                  <button
                                    onClick={() => setConfirmToggleUser(user)}
                                    className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-500/10 transition"
                                  >
                                    <Ban className="w-3.5 h-3.5 text-red-500" />
                                    Suspend User
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => setConfirmToggleUser(user)}
                                    className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 transition"
                                  >
                                    <UserCheck className="w-3.5 h-3.5 text-emerald-500" />
                                    Activate User
                                  </button>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={11} className={`px-5 py-12 text-center font-medium ${t.textMuted}`}>
                      No users found matching current filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* Real Dynamic Pagination */}
        {!loading && !error && total > 0 && (
          <div className={`p-4 border-t flex flex-col sm:flex-row gap-4 items-center justify-between ${t.sep}`}>
            <p className={`text-xs ${t.textMuted}`}>
              Showing <span className="font-bold text-gray-900 dark:text-white">{(page - 1) * limit + 1}</span> to{' '}
              <span className="font-bold text-gray-900 dark:text-white">{Math.min(page * limit, total)}</span> of{' '}
              <span className="font-bold text-gray-900 dark:text-white">{total}</span> users
            </p>
            <div className="flex gap-2">
              <Button
                onClick={() => setPage(p => Math.max(p - 1, 1))}
                disabled={page === 1}
                variant="secondary"
                className="text-xs px-3 py-1.5"
              >
                Previous
              </Button>
              <Button
                onClick={() => setPage(p => Math.min(p + 1, Math.ceil(total / limit)))}
                disabled={page >= Math.ceil(total / limit)}
                variant="secondary"
                className="text-xs px-3 py-1.5"
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* -------------------- DYNAMIC MODALS -------------------- */}

      {/* 1. VIEW PROFILE MODAL */}
      {activeActionUser && activeActionType === 'view_profile' && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0" onClick={() => { setActiveActionUser(null); setActiveActionType(null); }} />
          <div className={`rounded-3xl border p-6 shadow-2xl max-w-xl w-full relative z-10 text-left space-y-6 bg-white dark:bg-[#0f112e] border-gray-200 dark:border-white/10 overflow-y-auto max-h-[90vh]`}>
            {/* Header */}
            <div className={`flex items-center justify-between pb-3 border-b border-gray-100 dark:border-white/5`}>
              <h3 className="text-sm font-bold flex items-center gap-2">
                <User className="w-4 h-4 text-blue-500" />
                <span>Member Profile Card</span>
              </h3>
              <button
                onClick={() => { setActiveActionUser(null); setActiveActionType(null); }}
                className={`p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 cursor-pointer ${t.textMuted}`}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {loadingDetails ? (
              <div className="py-12 text-center flex flex-col items-center justify-center space-y-2">
                <span className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                <p className={`text-xs ${t.textMuted}`}>Fetching complete ledger states...</p>
              </div>
            ) : profileDetail ? (
              <div className="space-y-5">
                <div className="flex items-center gap-4">
                  <Avatar name={profileDetail.name} size="lg" />
                  <div>
                    <h4 className="text-base font-extrabold">{profileDetail.name}</h4>
                    <p className={`text-xs ${t.textMuted}`}>{profileDetail.email}</p>
                    <p className={`text-xs font-mono font-medium ${t.textMuted} mt-0.5`}>User ID: {profileDetail.userId}</p>
                  </div>
                </div>

                {/* Statistics Grid */}
                <div className="grid grid-cols-3 gap-3">
                  <div className={`p-3 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5`}>
                    <p className="text-[10px] font-bold text-gray-400 uppercase">Wallet Balance</p>
                    <p className="text-sm font-extrabold mt-1">{profileDetail.balance}</p>
                  </div>
                  <div className={`p-3 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5`}>
                    <p className="text-[10px] font-bold text-gray-400 uppercase">VIP Level</p>
                    <div className="mt-1">{getVipBadge(profileDetail.rank)}</div>
                  </div>
                  <div className={`p-3 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5`}>
                    <p className="text-[10px] font-bold text-gray-400 uppercase">Registered Date</p>
                    <p className="text-xs font-semibold mt-1.5 text-blue-500">{profileDetail.joined}</p>
                  </div>
                </div>

                {/* Network breakdown */}
                <div className="space-y-2">
                  <p className="text-xs font-mono font-bold text-gray-400 uppercase tracking-wider">Referral Downline network</p>
                  <div className="grid grid-cols-4 gap-2 text-center">
                    {[
                      { label: 'Level A (Direct)', val: profileDetail.teamCounts?.levelA || 0 },
                      { label: 'Level B', val: profileDetail.teamCounts?.levelB || 0 },
                      { label: 'Level C', val: profileDetail.teamCounts?.levelC || 0 },
                      { label: 'Level D', val: profileDetail.teamCounts?.levelD || 0 },
                    ].map(line => (
                      <div key={line.label} className="p-2 rounded-xl bg-gray-50 dark:bg-white/3 border border-gray-100 dark:border-white/5">
                        <p className="text-[9px] font-bold text-gray-400 truncate">{line.label}</p>
                        <p className="text-sm font-bold mt-0.5">{line.val}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Extra Details */}
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <p className={`font-bold ${t.textMuted}`}>Mobile Contact</p>
                    <p className="font-semibold mt-1 text-gray-900 dark:text-white">{profileDetail.mobile || 'None Listed'}</p>
                  </div>
                  <div>
                    <p className={`font-bold ${t.textMuted}`}>Security Status</p>
                    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold mt-1 ${
                      profileDetail.status === 'Active' ? 'bg-emerald-500/15 text-emerald-500' : 'bg-red-500/15 text-red-500'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${profileDetail.status === 'Active' ? 'bg-emerald-500' : 'bg-red-500'}`} />
                      {profileDetail.status}
                    </span>
                  </div>
                </div>

                {/* Detailed Wallet Balance Items */}
                {profileDetail.walletDetails && (
                  <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 space-y-2.5">
                    <p className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-widest">
                      Sub-Ledger Wallet Accounts (Server-Authoritative)
                    </p>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-[11px]">
                      {[
                        { label: 'Locked Balance', val: profileDetail.walletDetails.lockedBalance },
                        { label: 'Principal Balance', val: profileDetail.walletDetails.principalBalance },
                        { label: 'Trial Fund Balance', val: profileDetail.walletDetails.trialBalance },
                        { label: 'Referral Income', val: profileDetail.walletDetails.referralIncome },
                        { label: 'Daily Yield Balance', val: profileDetail.walletDetails.dailyYield },
                        { label: 'Team Commission Income', val: profileDetail.walletDetails.teamIncome },
                      ].map(sub => (
                        <div key={sub.label} className="flex justify-between py-1 border-b border-gray-100 dark:border-white/5">
                          <span className="text-gray-400 font-bold">{sub.label}:</span>
                          <span className="font-mono font-semibold text-gray-900 dark:text-white">${sub.val.toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Blockchain Deposit Wallets */}
                <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 space-y-3">
                  <p className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-widest">
                    Blockchain Deposit Wallets
                  </p>
                  {['USDT_BEP20', 'USDT_POLYGON', 'USDT_TRC20'].map((network) => {
                    const addr = profileDetail.depositAddresses?.find((a: any) => a.network === network);
                    return (
                      <div key={network} className="p-2.5 rounded-xl bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold text-blue-500">{network}</span>
                          <button
                            onClick={() => handleViewHistory(network)}
                            className="text-[9px] font-semibold text-gray-400 hover:text-blue-500 flex items-center gap-1 cursor-pointer"
                          >
                            <History className="w-3 h-3" /> View Address History
                          </button>
                        </div>
                        <p className="text-[9px] text-gray-400 uppercase">Deposit Address</p>
                        {addr ? (
                          <>
                            <p className="text-[11px] font-mono font-semibold break-all text-gray-900 dark:text-white">{addr.address}</p>
                            <div className="flex gap-2 pt-1">
                              <button
                                onClick={() => handleCopyAddress(addr.address)}
                                className="flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-lg bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20 cursor-pointer"
                              >
                                <Copy className="w-3 h-3" /> Copy
                              </button>
                              <button
                                onClick={() => setRotateConfirmNetwork(network)}
                                disabled={rotatingNetwork === network}
                                className="flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-lg bg-amber-500/15 text-amber-500 hover:bg-amber-500/25 disabled:opacity-50 cursor-pointer"
                              >
                                <RefreshCw className={`w-3 h-3 ${rotatingNetwork === network ? 'animate-spin' : ''}`} />
                                {rotatingNetwork === network ? 'Rotating...' : 'Rotate'}
                              </button>
                            </div>
                          </>
                        ) : (
                          <p className="text-[10px] text-gray-400 italic">No deposit address generated yet.</p>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Withdrawal Destination */}
                <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 space-y-2.5">
                  <p className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-widest">
                    Withdrawal Destination
                  </p>
                  <div className="space-y-1">
                    {['USDT_BEP20', 'USDT_POLYGON', 'USDT_TRC20'].map((network) => {
                      const addrs: string[] = profileDetail.withdrawalAddresses?.[network] || [];
                      return (
                        <div key={network} className="flex items-start justify-between text-[11px] py-1 border-b border-gray-100 dark:border-white/5">
                          <span className="text-gray-400 font-bold">{network}</span>
                          <span className="font-mono font-semibold text-right text-gray-900 dark:text-white break-all max-w-[60%]">
                            {addrs.length > 0 ? addrs.join(', ') : 'Not configured'}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ) : null}

            <div className="flex gap-3 pt-2">
              <Button onClick={() => openActionModal(activeActionUser, 'edit_profile')} variant="primary" className="flex-1 text-xs">
                Edit Member Details
              </Button>
              <Button onClick={() => { setActiveActionUser(null); setActiveActionType(null); }} variant="secondary" className="flex-1 text-xs">
                Dismiss Card
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ROTATE DEPOSIT ADDRESS — CONFIRMATION DIALOG */}
      {rotateConfirmNetwork && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs z-[60] flex items-center justify-center p-4">
          <div
            className="fixed inset-0"
            onClick={() => { if (rotatingNetwork !== rotateConfirmNetwork) setRotateConfirmNetwork(null); }}
          />
          <div className="rounded-2xl border p-6 shadow-2xl max-w-sm w-full relative z-10 text-left space-y-4 bg-white dark:bg-[#0f112e] border-gray-200 dark:border-white/10">
            <h3 className="text-sm font-bold flex items-center gap-2">
              <RefreshCw className="w-4 h-4 text-amber-500" />
              Rotate Deposit Address
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
              Generate a brand-new deposit address for this user?
              <br /><br />
              The previous deposit address will become inactive.
              Future deposits must be sent only to the new address.
            </p>
            <div className="flex gap-3 pt-2">
              <Button
                onClick={() => setRotateConfirmNetwork(null)}
                disabled={rotatingNetwork === rotateConfirmNetwork}
                variant="secondary"
                className="flex-1 text-xs"
              >
                Cancel
              </Button>
              <Button
                onClick={() => handleConfirmRotate(rotateConfirmNetwork)}
                disabled={rotatingNetwork === rotateConfirmNetwork}
                variant="primary"
                className="flex-1 text-xs"
              >
                {rotatingNetwork === rotateConfirmNetwork ? (
                  <span className="flex items-center justify-center gap-1.5">
                    <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Generating...
                  </span>
                ) : (
                  'Generate New Address'
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* VIEW ADDRESS HISTORY MODAL */}
      {historyNetwork && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs z-[60] flex items-center justify-center p-4">
          <div className="fixed inset-0" onClick={() => { setHistoryNetwork(null); setAddressHistory([]); }} />
          <div className="rounded-2xl border p-6 shadow-2xl max-w-lg w-full relative z-10 text-left space-y-4 bg-white dark:bg-[#0f112e] border-gray-200 dark:border-white/10 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold flex items-center gap-2">
                <History className="w-4 h-4 text-blue-500" />
                Address History — {historyNetwork}
              </h3>
              <button
                onClick={() => { setHistoryNetwork(null); setAddressHistory([]); }}
                className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {loadingHistory ? (
              <div className="py-10 text-center flex flex-col items-center justify-center space-y-2">
                <span className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                <p className="text-xs text-gray-400">Loading address history...</p>
              </div>
            ) : addressHistory.length === 0 ? (
              <p className="text-xs text-gray-400 italic py-6 text-center">No address history found.</p>
            ) : (
              <div className="space-y-2.5">
                {addressHistory.map((entry) => (
                  <div
                    key={entry.id}
                    className={`p-3 rounded-xl border space-y-1.5 ${
                      entry.isActive
                        ? 'bg-emerald-500/5 border-emerald-500/30'
                        : 'bg-gray-50 dark:bg-white/5 border-gray-100 dark:border-white/10'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[9px] font-bold ${
                        entry.isActive ? 'bg-emerald-500/15 text-emerald-500' : 'bg-gray-400/15 text-gray-400'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${entry.isActive ? 'bg-emerald-500' : 'bg-gray-400'}`} />
                        {entry.isActive ? 'Active' : 'Archived'}
                      </span>
                      <button
                        onClick={() => handleCopyAddress(entry.address)}
                        className="flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded-lg bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20 cursor-pointer"
                      >
                        <Copy className="w-2.5 h-2.5" /> Copy
                      </button>
                    </div>
                    <p className="text-[11px] font-mono font-semibold break-all text-gray-900 dark:text-white">{entry.address}</p>
                    <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[9px] text-gray-400 pt-1">
                      <span>Derivation Index: <span className="text-gray-600 dark:text-gray-300 font-semibold">{entry.derivationIndex ?? '—'}</span></span>
                      <span>Created At: <span className="text-gray-600 dark:text-gray-300 font-semibold">{new Date(entry.createdAt).toLocaleString()}</span></span>
                      {entry.rotatedAt && (
                        <span className="col-span-2">Rotated At: <span className="text-gray-600 dark:text-gray-300 font-semibold">{new Date(entry.rotatedAt).toLocaleString()}</span></span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 2. EDIT PROFILE MODAL */}
      {activeActionUser && activeActionType === 'edit_profile' && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0" onClick={() => { setActiveActionUser(null); setActiveActionType(null); }} />
          <div className={`rounded-3xl border p-6 shadow-2xl max-w-lg w-full relative z-10 text-left space-y-5 bg-white dark:bg-[#0f112e] border-gray-200 dark:border-white/10 overflow-y-auto max-h-[90vh]`}>
            {/* Header */}
            <div className={`flex items-center justify-between pb-3 border-b border-gray-100 dark:border-white/5`}>
              <h3 className="text-sm font-bold flex items-center gap-2">
                <Edit className="w-4 h-4 text-amber-500" />
                <span>Configure Account Settings</span>
              </h3>
              <button
                onClick={() => { setActiveActionUser(null); setActiveActionType(null); }}
                className={`p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 cursor-pointer ${t.textMuted}`}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {loadingDetails ? (
              <div className="py-12 text-center flex flex-col items-center justify-center space-y-2">
                <span className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                <p className={`text-xs ${t.textMuted}`}>Fetching complete editable states...</p>
              </div>
            ) : (
              <form onSubmit={handleSaveProfileEdit} className="space-y-4">
                {/* Editable Fields Section */}
                <div className="space-y-3">
                  <p className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-widest">
                    Editable Fields
                  </p>
                  <Input
                    label="Full Name"
                    value={editForm.name}
                    onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                    required
                  />
                  <Input
                    label="Email Address"
                    type="email"
                    value={editForm.email}
                    onChange={e => setEditForm({ ...editForm, email: e.target.value })}
                    required
                  />
                  <Input
                    label="Mobile Contact"
                    value={editForm.mobile}
                    onChange={e => setEditForm({ ...editForm, mobile: e.target.value })}
                    required
                  />
                  <Select
                    label="Security Access Status"
                    value={editForm.status}
                    onChange={e => setEditForm({ ...editForm, status: e.target.value as any })}
                    options={[
                      { value: 'Active', label: 'Access Enabled (Active)' },
                      { value: 'Suspended', label: 'Access Blocked (Suspended)' }
                    ]}
                  />
                  <Textarea
                    label="Internal Admin Notes"
                    value={editForm.adminNotes}
                    onChange={e => setEditForm({ ...editForm, adminNotes: e.target.value })}
                    placeholder="Insert internal administrative security flags, chargeback records, or verification logs..."
                    rows={3}
                  />
                </div>

                {/* Read Only Fields Section */}
                {profileDetail && (
                  <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 space-y-2.5">
                    <p className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-widest mb-1.5">
                      Read Only Fields (Server-Authoritative)
                    </p>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-[11px]">
                      <div className="flex justify-between py-1 border-b border-gray-100 dark:border-white/5">
                        <span className="text-gray-400 font-bold">User ID:</span>
                        <span className="font-mono font-semibold text-gray-900 dark:text-white">{profileDetail.userId}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-gray-100 dark:border-white/5">
                        <span className="text-gray-400 font-bold">VIP Class:</span>
                        <span className="font-semibold text-gray-900 dark:text-white">{profileDetail.rank}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-gray-100 dark:border-white/5">
                        <span className="text-gray-400 font-bold">Wallet Balance:</span>
                        <span className="font-semibold text-gray-900 dark:text-white">{profileDetail.balance}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-gray-100 dark:border-white/5">
                        <span className="text-gray-400 font-bold">Level A Team:</span>
                        <span className="font-semibold text-gray-900 dark:text-white">{profileDetail.teamCounts?.levelA} members</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-gray-100 dark:border-white/5">
                        <span className="text-gray-400 font-bold">Level B Team:</span>
                        <span className="font-semibold text-gray-900 dark:text-white">{profileDetail.teamCounts?.levelB} members</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-gray-100 dark:border-white/5">
                        <span className="text-gray-400 font-bold">Level C Team:</span>
                        <span className="font-semibold text-gray-900 dark:text-white">{profileDetail.teamCounts?.levelC} members</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-gray-100 dark:border-white/5">
                        <span className="text-gray-400 font-bold">Level D Team:</span>
                        <span className="font-semibold text-gray-900 dark:text-white">{profileDetail.teamCounts?.levelD} members</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Form Buttons */}
                <div className="flex gap-3 pt-2">
                  <Button type="button" variant="secondary" onClick={() => { setActiveActionUser(null); setActiveActionType(null); }} className="flex-1 text-xs">
                    Cancel
                  </Button>
                  <Button type="submit" variant="primary" className="flex-1 text-xs bg-blue-600 hover:bg-blue-700 text-white">
                    Save Changes
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* 3. WALLET ADJUSTMENT MODAL */}
      {activeActionUser && activeActionType === 'wallet_adjustment' && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0" onClick={() => { setActiveActionUser(null); setActiveActionType(null); }} />
          <div className={`rounded-3xl border p-6 shadow-2xl max-w-md w-full relative z-10 text-left space-y-5 bg-white dark:bg-[#0f112e] border-gray-200 dark:border-white/10`}>
            {/* Header */}
            <div className={`flex items-center justify-between pb-3 border-b border-gray-100 dark:border-white/5`}>
              <h3 className="text-sm font-bold flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-emerald-500" />
                <span>Adjust Wallet Ledger Balance</span>
              </h3>
              <button
                onClick={() => { setActiveActionUser(null); setActiveActionType(null); }}
                className={`p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 cursor-pointer ${t.textMuted}`}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleConfirmWalletAdjustment} className="space-y-4">
              {/* Target User */}
              <div className="flex items-center justify-between p-3 rounded-2xl bg-gray-50 dark:bg-white/3 border border-gray-100 dark:border-white/5">
                <div className="min-w-0">
                  <p className="text-[10px] font-mono font-bold text-gray-400 uppercase">Target User</p>
                  <p className="font-bold text-sm truncate mt-0.5">{activeActionUser.name}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-mono font-bold text-gray-400 uppercase">Available Balance</p>
                  <p className="font-extrabold text-sm text-emerald-500 mt-0.5">{activeActionUser.balance}</p>
                </div>
              </div>

              {/* Adjustment Direction Selection */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">Adjustment Action</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setWalletForm({ ...walletForm, type: 'credit' })}
                    className={`p-3 rounded-xl border font-bold text-xs flex flex-col items-center justify-center gap-1 transition cursor-pointer ${
                      walletForm.type === 'credit'
                        ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shadow-sm'
                        : 'border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/3 text-gray-500'
                    }`}
                  >
                    <span className="text-lg">📥</span>
                    <span>CREDIT (Add Funds)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setWalletForm({ ...walletForm, type: 'debit' })}
                    className={`p-3 rounded-xl border font-bold text-xs flex flex-col items-center justify-center gap-1 transition cursor-pointer ${
                      walletForm.type === 'debit'
                        ? 'border-red-500/40 bg-red-500/10 text-red-600 dark:text-red-400 shadow-sm'
                        : 'border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/3 text-gray-500'
                    }`}
                  >
                    <span className="text-lg">📤</span>
                    <span>DEBIT (Subtract Funds)</span>
                  </button>
                </div>
              </div>

              {/* Amount */}
              <Input
                label="Adjustment Amount (USDT)"
                type="number"
                step="0.01"
                min="0.01"
                placeholder="e.g. 500.00"
                value={walletForm.amount}
                onChange={e => setWalletForm({ ...walletForm, amount: e.target.value })}
                required
              />

              {/* Preconfigured Reason */}
              <Select
                label="Primary Authorization Reason"
                value={walletForm.reason}
                onChange={e => setWalletForm({ ...walletForm, reason: e.target.value })}
                options={[
                  { value: 'Yield Correction', label: 'DPY Daily Yield Correction' },
                  { value: 'Referral Compensation', label: 'Direct Referral Commission correction' },
                  { value: 'Leadership Salary Payout', label: 'Weekly Leadership Incentive compensation' },
                  { value: 'Promotional Airdrop Reward', label: 'Platform marketing promotional bonus' },
                  { value: 'Direct Block Deposit Match', label: 'Manual Blockchain deposit match' },
                  { value: 'Compliance Penalty Debit', label: 'Compliance penalty deduction' }
                ]}
              />

              {/* Note */}
              <Textarea
                label="Internal Audit Log Details"
                placeholder="Describe why this balance is adjusted manually. Notes are saved to immutable audit logs."
                value={walletForm.adminNote}
                onChange={e => setWalletForm({ ...walletForm, adminNote: e.target.value })}
                rows={3}
                required
              />

              {/* Buttons */}
              <div className="flex gap-3 pt-2">
                <Button type="button" variant="secondary" onClick={() => { setActiveActionUser(null); setActiveActionType(null); }} className="flex-1 text-xs">
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className={`flex-1 text-xs text-white ${
                    walletForm.type === 'credit'
                      ? 'bg-emerald-600 hover:bg-emerald-700'
                      : 'bg-red-600 hover:bg-red-700'
                  }`}
                >
                  Confirm Adjustment
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. SEND CUSTOM NOTIFICATION MODAL */}
      {activeActionUser && activeActionType === 'send_notification' && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0" onClick={() => { setActiveActionUser(null); setActiveActionType(null); }} />
          <div className={`rounded-3xl border p-6 shadow-2xl max-w-lg w-full relative z-10 text-left space-y-5 bg-white dark:bg-[#0f112e] border-gray-200 dark:border-white/10 overflow-y-auto max-h-[90vh]`}>
            {/* Header */}
            <div className={`flex items-center justify-between pb-3 border-b border-gray-100 dark:border-white/5`}>
              <h3 className="text-sm font-bold flex items-center gap-2">
                <Bell className="w-4 h-4 text-blue-500" />
                <span>Transmit Custom Mail Dispatch</span>
              </h3>
              <button
                onClick={() => { setActiveActionUser(null); setActiveActionType(null); }}
                className={`p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 cursor-pointer ${t.textMuted}`}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSendNotification} className="space-y-4">
              {/* User badge */}
              <div className="flex items-center justify-between px-3 py-2.5 rounded-2xl bg-gray-50 dark:bg-white/3 border border-gray-100 dark:border-white/5">
                <span className={`text-xs font-bold ${t.textSub}`}>To Recipient:</span>
                <span className="font-mono font-extrabold text-xs text-blue-500">{activeActionUser.name} ({activeActionUser.userId})</span>
              </div>

              {/* Title */}
              <Input
                label="Mail Header Subject"
                placeholder="e.g. Account Verification Completed Successfully"
                value={notifForm.title}
                onChange={e => setNotifForm({ ...notifForm, title: e.target.value })}
                required
              />

              {/* Message */}
              <Textarea
                label="Target Mail Content Body"
                placeholder="Write message details..."
                value={notifForm.message}
                onChange={e => setNotifForm({ ...notifForm, message: e.target.value })}
                rows={4}
                required
              />

              {/* Drag and Drop File upload visualization */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">Mail Attachment Images</label>
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDropFile}
                  className={`border-2 border-dashed rounded-2xl p-4 text-center cursor-pointer transition ${
                    isDraggingFile
                      ? 'border-blue-500 bg-blue-500/10'
                      : 'border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/3'
                  }`}
                >
                  <input
                    type="file"
                    id="mail-file"
                    multiple
                    accept="image/*"
                    onChange={handleSelectFileInput}
                    className="hidden"
                  />
                  <label htmlFor="mail-file" className="cursor-pointer space-y-1.5 block">
                    <Upload className="w-6 h-6 text-gray-400 mx-auto" />
                    <p className="text-xs font-bold">Drag and Drop media files here or click to browse</p>
                    <p className="text-[10px] text-gray-400">Supports PNG, JPG, JPEG up to 5MB</p>
                  </label>
                </div>

                {/* Display uploaded files */}
                {notifForm.attachments.length > 0 && (
                  <div className="space-y-1.5 pt-1.5">
                    <p className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-widest">Selected Attachments</p>
                    <div className="space-y-1">
                      {notifForm.attachments.map((file, i) => (
                        <div key={i} className="flex items-center justify-between text-xs p-2 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5">
                          <span className="truncate font-medium">{file}</span>
                          <button
                            type="button"
                            onClick={() => setNotifForm(prev => ({ ...prev, attachments: prev.attachments.filter((_, idx) => idx !== i) }))}
                            className="p-1 rounded text-red-500 hover:bg-red-500/15"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Configuration items */}
              <div className="grid grid-cols-2 gap-3">
                <Select
                  label="Notification Type"
                  value={notifForm.type}
                  onChange={e => setNotifForm({ ...notifForm, type: e.target.value as any })}
                  options={[
                    { value: 'Info', label: '📢 Informational (Info)' },
                    { value: 'Success', label: '✅ Action Succeeded (Success)' },
                    { value: 'Warning', label: '⚠️ Alert warning (Warning)' },
                    { value: 'Security', label: '🚨 Account Security alert' },
                    { value: 'Promotion', label: '🎁 Reward/Promo bonus' }
                  ]}
                />
                <Select
                  label="Mail Delivery Priority"
                  value={notifForm.priority}
                  onChange={e => setNotifForm({ ...notifForm, priority: e.target.value as any })}
                  options={[
                    { value: 'Normal', label: 'Normal Priority' },
                    { value: 'High', label: 'High Priority (Flash Notification)' }
                  ]}
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-2">
                <Button type="button" variant="secondary" onClick={() => { setActiveActionUser(null); setActiveActionType(null); }} className="flex-1 text-xs">
                  Cancel
                </Button>
                <Button type="submit" variant="primary" className="flex-1 text-xs bg-blue-600 hover:bg-blue-700 text-white">
                  Send Message
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. VIEW TRANSACTIONS MODAL */}
      {activeActionUser && activeActionType === 'transactions' && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0" onClick={() => { setActiveActionUser(null); setActiveActionType(null); }} />
          <div className={`rounded-3xl border p-6 shadow-2xl max-w-xl w-full relative z-10 text-left space-y-4 bg-white dark:bg-[#0f112e] border-gray-200 dark:border-white/10`}>
            {/* Header */}
            <div className={`flex items-center justify-between pb-3 border-b border-gray-100 dark:border-white/5`}>
              <h3 className="text-sm font-bold flex items-center gap-2">
                <FileText className="w-4 h-4 text-cyan-500" />
                <span>Transactions Ledger ({activeActionUser.name})</span>
              </h3>
              <button
                onClick={() => { setActiveActionUser(null); setActiveActionType(null); }}
                className={`p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 cursor-pointer ${t.textMuted}`}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {loadingDetails ? (
              <div className="py-12 text-center flex flex-col items-center justify-center space-y-2">
                <span className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                <p className={`text-xs ${t.textMuted}`}>Fetching transaction records...</p>
              </div>
            ) : (
              <div className="overflow-x-auto border rounded-2xl max-h-[350px]">
                <table className="w-full text-xs text-left">
                  <thead className="bg-gray-50 dark:bg-white/3">
                    <tr className="border-b border-gray-100 dark:border-white/5 font-bold uppercase tracking-wider text-gray-400">
                      <th className="px-4 py-2.5">TX ID</th>
                      <th className="px-4 py-2.5">Transaction Type</th>
                      <th className="px-4 py-2.5 text-right">Amount</th>
                      <th className="px-4 py-2.5">Timestamp</th>
                      <th className="px-4 py-2.5 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100/10">
                    {modalTransactions.length > 0 ? (
                      modalTransactions.map((tx) => (
                        <tr key={tx.id} className="hover:bg-gray-50 dark:hover:bg-white/3">
                          <td className="px-4 py-3 font-mono text-gray-500">{tx.id}</td>
                          <td className="px-4 py-3 font-bold">{tx.type}</td>
                          <td className={`px-4 py-3 font-mono font-bold text-right ${
                            tx.amount.startsWith('-') ? 'text-red-500' : 'text-emerald-500'
                          }`}>{tx.amount}</td>
                          <td className="px-4 py-3 text-gray-500">{tx.date}</td>
                          <td className="px-4 py-3 text-center">
                            <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-500 text-[10px] font-bold">
                              {tx.status}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="text-center py-8 text-gray-400">No transaction entries found in ledger database.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

            <div className="flex justify-end pt-2">
              <Button onClick={() => { setActiveActionUser(null); setActiveActionType(null); }} variant="secondary" className="text-xs">
                Close Ledger
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* 6. DEPOSIT HISTORY MODAL */}
      {activeActionUser && activeActionType === 'deposits' && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0" onClick={() => { setActiveActionUser(null); setActiveActionType(null); }} />
          <div className={`rounded-3xl border p-6 shadow-2xl max-w-2xl w-full relative z-10 text-left space-y-4 bg-white dark:bg-[#0f112e] border-gray-200 dark:border-white/10`}>
            {/* Header */}
            <div className={`flex items-center justify-between pb-3 border-b border-gray-100 dark:border-white/5`}>
              <h3 className="text-sm font-bold flex items-center gap-2">
                <FileDown className="w-4 h-4 text-blue-500" />
                <span>Blockchain Deposit Registry ({activeActionUser.name})</span>
              </h3>
              <button
                onClick={() => { setActiveActionUser(null); setActiveActionType(null); }}
                className={`p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 cursor-pointer ${t.textMuted}`}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {loadingDetails ? (
              <div className="py-12 text-center flex flex-col items-center justify-center space-y-2">
                <span className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                <p className={`text-xs ${t.textMuted}`}>Fetching deposit records...</p>
              </div>
            ) : (
              <div className="overflow-x-auto border rounded-2xl max-h-[350px]">
                <table className="w-full text-xs text-left">
                  <thead className="bg-gray-50 dark:bg-white/3">
                    <tr className="border-b border-gray-100 dark:border-white/5 font-bold uppercase tracking-wider text-gray-400">
                      <th className="px-4 py-2.5">Deposit ID</th>
                      <th className="px-4 py-2.5">Processed Amount</th>
                      <th className="px-4 py-2.5">Transfer Network</th>
                      <th className="px-4 py-2.5">Transaction Hash</th>
                      <th className="px-4 py-2.5">Execution Date</th>
                      <th className="px-4 py-2.5 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100/10">
                    {modalDeposits.length > 0 ? (
                      modalDeposits.map((dep) => (
                        <tr key={dep.id} className="hover:bg-gray-50 dark:hover:bg-white/3">
                          <td className="px-4 py-3 font-mono text-gray-500">{dep.id}</td>
                          <td className="px-4 py-3 font-bold text-emerald-500">{dep.amount}</td>
                          <td className="px-4 py-3 font-medium">{dep.method}</td>
                          <td className="px-4 py-3 font-mono text-[10px] text-gray-400 truncate max-w-[120px]" title={dep.txHash}>
                            {dep.txHash}
                          </td>
                          <td className="px-4 py-3 text-gray-500">{dep.date}</td>
                          <td className="px-4 py-3 text-center">
                            <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-500 text-[10px] font-bold">
                              {dep.status}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="text-center py-8 text-gray-400">No deposit entries found in blockchain ledger.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

            <div className="flex justify-end pt-2">
              <Button onClick={() => { setActiveActionUser(null); setActiveActionType(null); }} variant="secondary" className="text-xs">
                Close Registry
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* 7. WITHDRAWAL HISTORY MODAL */}
      {activeActionUser && activeActionType === 'withdrawals' && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0" onClick={() => { setActiveActionUser(null); setActiveActionType(null); }} />
          <div className={`rounded-3xl border p-6 shadow-2xl max-w-2xl w-full relative z-10 text-left space-y-4 bg-white dark:bg-[#0f112e] border-gray-200 dark:border-white/10`}>
            {/* Header */}
            <div className={`flex items-center justify-between pb-3 border-b border-gray-100 dark:border-white/5`}>
              <h3 className="text-sm font-bold flex items-center gap-2">
                <History className="w-4 h-4 text-rose-500" />
                <span>Withdrawal Requests History ({activeActionUser.name})</span>
              </h3>
              <button
                onClick={() => { setActiveActionUser(null); setActiveActionType(null); }}
                className={`p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 cursor-pointer ${t.textMuted}`}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {loadingDetails ? (
              <div className="py-12 text-center flex flex-col items-center justify-center space-y-2">
                <span className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                <p className={`text-xs ${t.textMuted}`}>Fetching withdrawal records...</p>
              </div>
            ) : (
              <div className="overflow-x-auto border rounded-2xl max-h-[350px]">
                <table className="w-full text-xs text-left">
                  <thead className="bg-gray-50 dark:bg-white/3">
                    <tr className="border-b border-gray-100 dark:border-white/5 font-bold uppercase tracking-wider text-gray-400">
                      <th className="px-4 py-2.5">Withdrawal ID</th>
                      <th className="px-4 py-2.5 text-right">Requested</th>
                      <th className="px-4 py-2.5">Payout Address</th>
                      <th className="px-4 py-2.5">Execution Date</th>
                      <th className="px-4 py-2.5 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100/10">
                    {modalWithdrawals.length > 0 ? (
                      modalWithdrawals.map((wd) => (
                        <tr key={wd.id} className="hover:bg-gray-50 dark:hover:bg-white/3">
                          <td className="px-4 py-3 font-mono text-gray-500">{wd.id}</td>
                          <td className="px-4 py-3 text-right font-bold text-gray-900 dark:text-white">{wd.amount}</td>
                          <td className="px-4 py-3 font-mono text-[10px] text-gray-400 truncate max-w-[150px]" title={wd.wallet}>
                            {wd.wallet}
                          </td>
                          <td className="px-4 py-3 text-gray-500">{wd.date}</td>
                          <td className="px-4 py-3 text-center">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              wd.status === 'Approved' ? 'bg-emerald-500/15 text-emerald-500' : wd.status === 'Pending' ? 'bg-amber-500/15 text-amber-500' : 'bg-red-500/15 text-red-500'
                            }`}>
                              {wd.status}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="text-center py-8 text-gray-400">No withdrawal records found.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

            <div className="flex justify-end pt-2">
              <Button onClick={() => { setActiveActionUser(null); setActiveActionType(null); }} variant="secondary" className="text-xs">
                Close Ledger
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* 8. VIEW TEAM NETWORK LEVEL A-D */}
      {activeActionUser && activeActionType === 'team' && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0" onClick={() => { setActiveActionUser(null); setActiveActionType(null); }} />
          <div className={`rounded-3xl border p-6 shadow-2xl max-w-2xl w-full relative z-10 text-left space-y-4 bg-white dark:bg-[#0f112e] border-gray-200 dark:border-white/10`}>
            {/* Header */}
            <div className={`flex items-center justify-between pb-3 border-b border-gray-100 dark:border-white/5`}>
              <h3 className="text-sm font-bold flex items-center gap-2">
                <Network className="w-4 h-4 text-purple-500" />
                <span>Referral Downline Network Lineage</span>
              </h3>
              <button
                onClick={() => { setActiveActionUser(null); setActiveActionType(null); }}
                className={`p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 cursor-pointer ${t.textMuted}`}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {loadingDetails ? (
              <div className="py-12 text-center flex flex-col items-center justify-center space-y-2">
                <span className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                <p className={`text-xs ${t.textMuted}`}>Traversing network hierarchy downlines...</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-[450px] overflow-y-auto pr-1">
                <div className="flex items-center justify-between p-3 rounded-2xl bg-gray-50 dark:bg-white/3 border border-gray-100 dark:border-white/5">
                  <div>
                    <p className="text-[10px] font-mono font-bold text-gray-400 uppercase">Upline Leader Account</p>
                    <p className="font-extrabold text-sm mt-0.5">{activeActionUser.name}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-mono font-bold text-gray-400 uppercase">Total Referral Lines (A-D)</p>
                    <p className="font-extrabold text-sm text-purple-500 mt-0.5">
                      {modalTeam.length} members
                    </p>
                  </div>
                </div>

                {/* Tabulated view for Levels A, B, C, D */}
                <div className="space-y-3">
                  {['A', 'B', 'C', 'D'].map((lvl) => {
                    const tierMembers = modalTeam.filter(m => m.level === lvl);
                    return (
                      <div key={lvl} className="border dark:border-white/5 rounded-2xl overflow-hidden bg-gray-50/50 dark:bg-white/1">
                        <div className="px-4 py-2.5 bg-gray-100 dark:bg-white/3 flex items-center justify-between border-b dark:border-white/5">
                          <span className="font-bold text-xs">Level {lvl} Team Network</span>
                          <span className="px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-500 text-[10px] font-bold font-mono">
                            {tierMembers.length} members
                          </span>
                        </div>

                        <div className="overflow-x-auto p-2">
                          <table className="w-full text-[11px] text-left">
                            <thead>
                              <tr className="text-gray-400 font-bold uppercase tracking-wider text-[9px] border-b dark:border-white/5">
                                <th className="px-3 py-1.5">User Details</th>
                                <th className="px-3 py-1.5 text-center">VIP Privileges</th>
                                <th className="px-3 py-1.5 text-right">Ledger Asset</th>
                                <th className="px-3 py-1.5">Joined Date</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y dark:divide-white/5">
                              {tierMembers.length > 0 ? (
                                tierMembers.map((mem) => (
                                  <tr key={mem.id} className="hover:bg-gray-100/50 dark:hover:bg-white/2">
                                    <td className="px-3 py-2">
                                      <div className="font-bold">{mem.name}</div>
                                      <div className="text-[9px] text-gray-400 font-mono">{mem.userId}</div>
                                    </td>
                                    <td className="px-3 py-2 text-center">{getVipBadge(mem.vipTier)}</td>
                                    <td className="px-3 py-2 text-right font-bold font-mono text-gray-800 dark:text-gray-200">
                                      ${mem.walletBalance.toFixed(2)}
                                    </td>
                                    <td className="px-3 py-2 text-gray-500">{mem.joined}</td>
                                  </tr>
                                ))
                              ) : (
                                <tr>
                                  <td colSpan={4} className="text-center py-4 text-gray-400 text-[10px]">No members found in this referral layer.</td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="flex justify-end pt-2">
              <Button onClick={() => { setActiveActionUser(null); setActiveActionType(null); }} variant="secondary" className="text-xs">
                Dismiss Hierarchy
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* 9. VIEW AUDIT HISTORY */}
      {activeActionUser && activeActionType === 'audit' && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0" onClick={() => { setActiveActionUser(null); setActiveActionType(null); }} />
          <div className={`rounded-3xl border p-6 shadow-2xl max-w-xl w-full relative z-10 text-left space-y-4 bg-white dark:bg-[#0f112e] border-gray-200 dark:border-white/10`}>
            {/* Header */}
            <div className={`flex items-center justify-between pb-3 border-b border-gray-100 dark:border-white/5`}>
              <h3 className="text-sm font-bold flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-indigo-500" />
                <span>Administrative Compliance Audits</span>
              </h3>
              <button
                onClick={() => { setActiveActionUser(null); setActiveActionType(null); }}
                className={`p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 cursor-pointer ${t.textMuted}`}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {loadingDetails ? (
              <div className="py-12 text-center flex flex-col items-center justify-center space-y-2">
                <span className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                <p className={`text-xs ${t.textMuted}`}>Fetching compliance audits...</p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="px-3 py-2.5 rounded-2xl bg-gray-50 dark:bg-white/3 border text-xs">
                  <p className={`font-bold ${t.textMuted}`}>Account Holder</p>
                  <p className="font-extrabold text-sm mt-0.5">{activeActionUser.name} ({activeActionUser.userId})</p>
                </div>

                {/* Audit timelines */}
                <div className="space-y-4 max-h-[350px] overflow-y-auto pr-1">
                  {modalAudits.length > 0 ? (
                    modalAudits.map((audit, i) => (
                      <div key={i} className="relative pl-5 border-l-2 border-indigo-500/20 space-y-1">
                        {/* Bullet marker */}
                        <div className="absolute -left-1.5 top-1 w-2.5 h-2.5 rounded-full bg-indigo-500 ring-4 ring-indigo-500/10" />

                        <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs font-bold gap-1">
                          <span className="text-gray-900 dark:text-white leading-tight">{audit.action}</span>
                          <span className="text-[10px] font-mono font-medium text-gray-400">{audit.time}</span>
                        </div>

                        <p className="text-[10px] text-gray-500 dark:text-gray-400">
                          Operator: <span className="font-semibold text-gray-700 dark:text-gray-300 font-mono">{audit.admin}</span> | IP: <span className="font-semibold text-gray-700 dark:text-gray-300 font-mono">{audit.ip}</span>
                        </p>

                        <p className="text-xs text-gray-600 dark:text-gray-400 italic bg-gray-50 dark:bg-white/3 p-2 rounded-xl mt-1.5 leading-relaxed">
                          Resource: {audit.module}
                        </p>
                      </div>
                    ))
                  ) : (
                    <p className="text-center py-6 text-gray-400 text-xs">No audit logs recorded for this account.</p>
                  )}
                </div>
              </div>
            )}

            <div className="flex justify-end pt-2">
              <Button onClick={() => { setActiveActionUser(null); setActiveActionType(null); }} variant="secondary" className="text-xs">
                Close Audit Logs
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* 10. SUSPEND / ACTIVATE CONFIRMATION DIALOG */}
      {confirmToggleUser && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0" onClick={() => setConfirmToggleUser(null)} />
          <div className={`rounded-3xl border p-6 shadow-2xl max-w-sm w-full relative z-10 text-center space-y-5 bg-white dark:bg-[#0f112e] border-gray-200 dark:border-white/10`}>
            <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto text-xl bg-amber-500/15 text-amber-500`}>
              ⚠️
            </div>
            <div className="space-y-1.5">
              <h3 className="font-display font-bold text-base">
                Confirm Security Action
              </h3>
              <p className={`text-xs leading-relaxed ${t.textMuted}`}>
                Are you absolutely sure you want to{' '}
                <span className="font-extrabold text-red-500 uppercase">
                  {confirmToggleUser.status === 'Active' ? 'SUSPEND' : 'ACTIVATE'}
                </span>{' '}
                access privileges for user account <span className="font-bold text-gray-900 dark:text-white">{confirmToggleUser.name}</span> ({confirmToggleUser.userId})? This will restrict their financial claims immediately on-site.
              </p>
            </div>

            <div className="flex gap-3">
              <Button type="button" variant="secondary" onClick={() => setConfirmToggleUser(null)} className="flex-1 text-xs">
                Cancel
              </Button>
              <Button
                type="button"
                onClick={() => handleToggleStatus(confirmToggleUser)}
                className={`flex-1 text-xs text-white ${
                  confirmToggleUser.status === 'Active' ? 'bg-red-600 hover:bg-red-700' : 'bg-emerald-600 hover:bg-emerald-700'
                }`}
              >
                Confirm
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* 11. CREATE USER MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0" onClick={() => setIsAddModalOpen(false)} />
          <div className={`rounded-3xl border p-6 shadow-2xl max-w-lg w-full relative z-10 text-left space-y-5 bg-white dark:bg-[#0f112e] border-gray-200 dark:border-white/10 overflow-y-auto max-h-[90vh]`}>
            {/* Header */}
            <div className={`flex items-center justify-between pb-3 border-b border-gray-100 dark:border-white/5`}>
              <h3 className="text-sm font-bold flex items-center gap-2">
                <Plus className="w-4 h-4 text-blue-500" />
                <span>Initialize Member Account</span>
              </h3>
              <button onClick={() => setIsAddModalOpen(false)} className={`p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 cursor-pointer ${t.textMuted}`}>
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddUserSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Full Name"
                  placeholder="e.g. Charlie Brown"
                  value={newUser.name}
                  onChange={e => setNewUser({ ...newUser, name: e.target.value })}
                  required
                />
                <Input
                  label="Email Address"
                  type="email"
                  placeholder="e.g. charlie@domain.com"
                  value={newUser.email}
                  onChange={e => setNewUser({ ...newUser, email: e.target.value })}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Mobile Contact"
                  placeholder="e.g. +1-415-555-0100"
                  value={newUser.mobile}
                  onChange={e => setNewUser({ ...newUser, mobile: e.target.value })}
                  required
                />
                <Input
                  label="Custom Referral Code"
                  placeholder="e.g. CHARLIE88 (Optional)"
                  value={newUser.referralCode}
                  onChange={e => setNewUser({ ...newUser, referralCode: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Select
                  label="Initial VIP Tier Privileges"
                  value={newUser.rank}
                  onChange={e => setNewUser({ ...newUser, rank: e.target.value })}
                  options={[
                    { value: 'VIP1', label: 'VIP1 Tier' },
                    { value: 'VIP2', label: 'VIP2 Tier' },
                    { value: 'VIP3', label: 'VIP3 Tier' },
                    { value: 'VIP4', label: 'VIP4 Tier' },
                    { value: 'VIP5', label: 'VIP5 Tier' },
                    { value: 'VIP6', label: 'VIP6 Tier' },
                    { value: 'VIP7', label: 'VIP7 Tier' },
                    { value: 'VIP8', label: 'VIP8 Tier' }
                  ]}
                />
                <Input
                  label="Initial Deposit Balance (USDT)"
                  type="number"
                  step="0.01"
                  placeholder="e.g. 100.00"
                  value={newUser.balance}
                  onChange={e => setNewUser({ ...newUser, balance: e.target.value })}
                  required
                />
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-2">
                <Button type="button" variant="secondary" onClick={() => setIsAddModalOpen(false)} className="flex-1 text-xs">
                  Cancel
                </Button>
                <Button type="submit" variant="primary" className="flex-1 text-xs bg-blue-600 hover:bg-blue-700 text-white">
                  Add Member Account
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersView;
