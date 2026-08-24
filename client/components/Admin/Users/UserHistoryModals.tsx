/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  User,
  X,
  Copy,
  RefreshCw,
  History,
  FileText,
  FileDown,
  Network,
  ShieldAlert,
} from 'lucide-react';
import { Avatar, Button } from '../../ui/index.ts';
import { ThemeTokens } from '../../ui/themeTokens.ts';
import { AdminUser } from '../types.ts';
import { UserVipBadge } from './UserVipBadge.tsx';

// ----------------------------------------------------
// 1. Full User Profile Card Modal
// ----------------------------------------------------
interface UserProfileModalProps {
  user: AdminUser;
  profileDetail: any;
  loadingDetails: boolean;
  onEdit: () => void;
  onClose: () => void;
  onViewHistory: (network: string) => void;
  onCopyAddress: (address: string) => void;
  onRotateAddress: (network: string) => void;
  rotatingNetwork: string | null;
  t: ThemeTokens;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  profileDetail,
  loadingDetails,
  onEdit,
  onClose,
  onViewHistory,
  onCopyAddress,
  onRotateAddress,
  rotatingNetwork,
  t,
}) => {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0" onClick={onClose} />
      <div className="rounded-3xl border p-6 shadow-2xl max-w-xl w-full relative z-10 text-left space-y-6 bg-white dark:bg-[#0f112e] border-gray-200 dark:border-white/10 overflow-y-auto max-h-[90vh] text-gray-900 dark:text-white">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-white/5">
          <h3 className="text-sm font-bold flex items-center gap-2 text-gray-900 dark:text-white">
            <User className="w-4 h-4 text-blue-500" />
            <span>Member Profile Card</span>
          </h3>
          <button
            onClick={onClose}
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
                <h4 className="text-base font-extrabold text-gray-900 dark:text-white">{profileDetail.name}</h4>
                <p className={`text-xs ${t.textMuted}`}>{profileDetail.email}</p>
                <p className={`text-xs font-mono font-medium ${t.textMuted} mt-0.5`}>User ID: {profileDetail.userId}</p>
              </div>
            </div>

            {/* Statistics Grid */}
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5">
                <p className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase">Wallet Balance</p>
                <p className="text-sm font-extrabold mt-1 text-gray-900 dark:text-white">{profileDetail.balance}</p>
              </div>
              <div className="p-3 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5">
                <p className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase">VIP Level</p>
                <div className="mt-1"><UserVipBadge rank={profileDetail.rank} /></div>
              </div>
              <div className="p-3 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5">
                <p className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase">Registered Date</p>
                <p className="text-xs font-semibold mt-1.5 text-blue-500">{profileDetail.joined}</p>
              </div>
            </div>

            {/* Network breakdown */}
            <div className="space-y-2">
              <p className="text-xs font-mono font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Referral Downline network</p>
              <div className="grid grid-cols-4 gap-2 text-center">
                {[
                  { label: 'Level A (Direct)', val: profileDetail.teamCounts?.levelA ?? profileDetail.levelA ?? 0 },
                  { label: 'Level B', val: profileDetail.teamCounts?.levelB ?? profileDetail.levelB ?? 0 },
                  { label: 'Level C', val: profileDetail.teamCounts?.levelC ?? profileDetail.levelC ?? 0 },
                  { label: 'Level D', val: profileDetail.teamCounts?.levelD ?? profileDetail.levelD ?? 0 },
                ].map(line => (
                  <div key={line.label} className="p-2 rounded-xl bg-gray-50 dark:bg-white/3 border border-gray-100 dark:border-white/5">
                    <p className="text-[9px] font-bold text-gray-500 dark:text-gray-400 truncate">{line.label}</p>
                    <p className="text-sm font-bold mt-0.5 text-gray-900 dark:text-white">{line.val}</p>
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
                <p className="text-[10px] font-mono font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">
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
                      <span className="text-gray-600 dark:text-gray-400 font-bold">{sub.label}:</span>
                      <span className="font-mono font-semibold text-gray-900 dark:text-white">${sub.val.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Blockchain Deposit Wallets */}
            <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 space-y-3">
              <p className="text-[10px] font-mono font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">
                Blockchain Deposit Wallets
              </p>
              {['USDT_BEP20', 'USDT_POLYGON', 'USDT_TRC20'].map((network) => {
                const addr = profileDetail.depositAddresses?.find((a: any) => a.network === network);
                return (
                  <div key={network} className="p-2.5 rounded-xl bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-blue-500">{network}</span>
                      <button
                        onClick={() => onViewHistory(network)}
                        className="text-[9px] font-semibold text-gray-500 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 flex items-center gap-1 cursor-pointer"
                      >
                        <History className="w-3 h-3" /> View Address History
                      </button>
                    </div>
                    <p className="text-[9px] text-gray-500 dark:text-gray-400 uppercase font-semibold">Deposit Address</p>
                    {addr ? (
                      <>
                        <p className="text-[11px] font-mono font-semibold break-all text-gray-900 dark:text-white">{addr.address}</p>
                        <div className="flex gap-2 pt-1">
                          <button
                            onClick={() => onCopyAddress(addr.address)}
                            className="flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-lg bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20 text-gray-700 dark:text-gray-200 cursor-pointer"
                          >
                            <Copy className="w-3 h-3" /> Copy
                          </button>
                          <button
                            onClick={() => onRotateAddress(network)}
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
              <p className="text-[10px] font-mono font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">
                Withdrawal Destination
              </p>
              <div className="space-y-1">
                {['USDT_BEP20', 'USDT_POLYGON', 'USDT_TRC20'].map((network) => {
                  const addrs: string[] = profileDetail.withdrawalAddresses?.[network] || [];
                  return (
                    <div key={network} className="flex items-start justify-between text-[11px] py-1 border-b border-gray-100 dark:border-white/5">
                      <span className="text-gray-600 dark:text-gray-400 font-bold">{network}</span>
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
          <Button onClick={onEdit} variant="primary" className="flex-1 text-xs">
            Edit Member Details
          </Button>
          <Button onClick={onClose} variant="secondary" className="flex-1 text-xs">
            Dismiss Card
          </Button>
        </div>
      </div>
    </div>
  );
};

// ----------------------------------------------------
// 2. Rotate Address Confirm Modal
// ----------------------------------------------------
interface RotateAddressConfirmModalProps {
  network: string | null;
  rotatingNetwork: string | null;
  onConfirm: (network: string) => void;
  onClose: () => void;
}

export const RotateAddressConfirmModal: React.FC<RotateAddressConfirmModalProps> = ({
  network,
  rotatingNetwork,
  onConfirm,
  onClose,
}) => {
  if (!network) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-xs z-[60] flex items-center justify-center p-4">
      <div
        className="fixed inset-0"
        onClick={() => { if (rotatingNetwork !== network) onClose(); }}
      />
      <div className="rounded-2xl border p-6 shadow-2xl max-w-sm w-full relative z-10 text-left space-y-4 bg-white dark:bg-[#0f112e] border-gray-200 dark:border-white/10 text-gray-900 dark:text-white">
        <h3 className="text-sm font-bold flex items-center gap-2 text-gray-900 dark:text-white">
          <RefreshCw className="w-4 h-4 text-amber-500" />
          Rotate Deposit Address ({network})
        </h3>
        <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
          Generate a brand-new deposit address for this user?
          <br /><br />
          The previous deposit address will become inactive.
          Future deposits must be sent only to the new address.
        </p>
        <div className="flex gap-3 pt-2">
          <Button
            onClick={onClose}
            disabled={rotatingNetwork === network}
            variant="secondary"
            className="flex-1 text-xs"
          >
            Cancel
          </Button>
          <Button
            onClick={() => onConfirm(network)}
            disabled={rotatingNetwork === network}
            variant="primary"
            className="flex-1 text-xs"
          >
            {rotatingNetwork === network ? (
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
  );
};

// ----------------------------------------------------
// 3. Address History Modal
// ----------------------------------------------------
interface AddressHistoryModalProps {
  network: string | null;
  history: any[];
  loading: boolean;
  onCopyAddress: (address: string) => void;
  onClose: () => void;
}

export const AddressHistoryModal: React.FC<AddressHistoryModalProps> = ({
  network,
  history,
  loading,
  onCopyAddress,
  onClose,
}) => {
  if (!network) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-xs z-[60] flex items-center justify-center p-4">
      <div className="fixed inset-0" onClick={onClose} />
      <div className="rounded-2xl border p-6 shadow-2xl max-w-lg w-full relative z-10 text-left space-y-4 bg-white dark:bg-[#0f112e] border-gray-200 dark:border-white/10 max-h-[80vh] overflow-y-auto text-gray-900 dark:text-white">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold flex items-center gap-2 text-gray-900 dark:text-white">
            <History className="w-4 h-4 text-blue-500" />
            Address History — {network}
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 cursor-pointer text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {loading ? (
          <div className="py-10 text-center flex flex-col items-center justify-center space-y-2">
            <span className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-xs text-gray-500 dark:text-gray-400">Loading address history...</p>
          </div>
        ) : history.length === 0 ? (
          <p className="text-xs text-gray-500 dark:text-gray-400 italic py-6 text-center">No address history found.</p>
        ) : (
          <div className="space-y-2.5">
            {history.map((entry) => (
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
                    onClick={() => onCopyAddress(entry.address)}
                    className="flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded-lg bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20 text-gray-700 dark:text-gray-200 cursor-pointer"
                  >
                    <Copy className="w-2.5 h-2.5" /> Copy
                  </button>
                </div>
                <p className="text-[11px] font-mono font-semibold break-all text-gray-900 dark:text-white">{entry.address}</p>
                <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[9px] text-gray-500 dark:text-gray-400 pt-1">
                  <span>Derivation Index: <span className="text-gray-700 dark:text-gray-300 font-semibold">{entry.derivationIndex ?? '—'}</span></span>
                  <span>Created At: <span className="text-gray-700 dark:text-gray-300 font-semibold">{new Date(entry.createdAt).toLocaleString()}</span></span>
                  {entry.rotatedAt && (
                    <span className="col-span-2">Rotated At: <span className="text-gray-700 dark:text-gray-300 font-semibold">{new Date(entry.rotatedAt).toLocaleString()}</span></span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// ----------------------------------------------------
// 4. Transactions Modal
// ----------------------------------------------------
interface TransactionsModalProps {
  user: AdminUser;
  transactions: any[];
  loading: boolean;
  onClose: () => void;
  t: ThemeTokens;
}

export const TransactionsModal: React.FC<TransactionsModalProps> = ({
  user,
  transactions,
  loading,
  onClose,
  t,
}) => {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0" onClick={onClose} />
      <div className="rounded-3xl border p-6 shadow-2xl max-w-xl w-full relative z-10 text-left space-y-4 bg-white dark:bg-[#0f112e] border-gray-200 dark:border-white/10 text-gray-900 dark:text-white">
        <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-white/5">
          <h3 className="text-sm font-bold flex items-center gap-2 text-gray-900 dark:text-white">
            <FileText className="w-4 h-4 text-cyan-500" />
            <span>Transactions Ledger ({user.name})</span>
          </h3>
          <button
            onClick={onClose}
            className={`p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 cursor-pointer ${t.textMuted}`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {loading ? (
          <div className="py-12 text-center flex flex-col items-center justify-center space-y-2">
            <span className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <p className={`text-xs ${t.textMuted}`}>Fetching transaction records...</p>
          </div>
        ) : (
          <div className="overflow-x-auto border border-gray-200 dark:border-white/10 rounded-2xl max-h-[350px]">
            <table className="w-full text-xs text-left">
              <thead className="bg-gray-50 dark:bg-white/3">
                <tr className="border-b border-gray-200 dark:border-white/10 font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  <th className="px-4 py-2.5">TX ID</th>
                  <th className="px-4 py-2.5">Transaction Type</th>
                  <th className="px-4 py-2.5 text-right">Amount</th>
                  <th className="px-4 py-2.5">Timestamp</th>
                  <th className="px-4 py-2.5 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                {transactions.length > 0 ? (
                  transactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-gray-50 dark:hover:bg-white/3 text-gray-900 dark:text-white">
                      <td className="px-4 py-3 font-mono text-gray-500 dark:text-gray-400">{tx.id}</td>
                      <td className="px-4 py-3 font-bold">{tx.type}</td>
                      <td className={`px-4 py-3 font-mono font-bold text-right ${
                        tx.amount.startsWith('-') ? 'text-red-500' : 'text-emerald-500'
                      }`}>{tx.amount}</td>
                      <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{tx.date}</td>
                      <td className="px-4 py-3 text-center">
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-500 text-[10px] font-bold">
                          {tx.status}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="text-center py-8 text-gray-500 dark:text-gray-400">No transaction entries found in ledger database.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        <div className="flex justify-end pt-2">
          <Button onClick={onClose} variant="secondary" className="text-xs">
            Close Ledger
          </Button>
        </div>
      </div>
    </div>
  );
};

// ----------------------------------------------------
// 5. Deposits History Modal
// ----------------------------------------------------
interface DepositsModalProps {
  user: AdminUser;
  deposits: any[];
  loading: boolean;
  onClose: () => void;
  t: ThemeTokens;
}

export const DepositsModal: React.FC<DepositsModalProps> = ({
  user,
  deposits,
  loading,
  onClose,
  t,
}) => {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0" onClick={onClose} />
      <div className="rounded-3xl border p-6 shadow-2xl max-w-2xl w-full relative z-10 text-left space-y-4 bg-white dark:bg-[#0f112e] border-gray-200 dark:border-white/10 text-gray-900 dark:text-white">
        <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-white/5">
          <h3 className="text-sm font-bold flex items-center gap-2 text-gray-900 dark:text-white">
            <FileDown className="w-4 h-4 text-blue-500" />
            <span>Blockchain Deposit Registry ({user.name})</span>
          </h3>
          <button
            onClick={onClose}
            className={`p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 cursor-pointer ${t.textMuted}`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {loading ? (
          <div className="py-12 text-center flex flex-col items-center justify-center space-y-2">
            <span className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <p className={`text-xs ${t.textMuted}`}>Fetching deposit records...</p>
          </div>
        ) : (
          <div className="overflow-x-auto border border-gray-200 dark:border-white/10 rounded-2xl max-h-[350px]">
            <table className="w-full text-xs text-left">
              <thead className="bg-gray-50 dark:bg-white/3">
                <tr className="border-b border-gray-200 dark:border-white/10 font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  <th className="px-4 py-2.5">Deposit ID</th>
                  <th className="px-4 py-2.5">Processed Amount</th>
                  <th className="px-4 py-2.5">Transfer Network</th>
                  <th className="px-4 py-2.5">Transaction Hash</th>
                  <th className="px-4 py-2.5">Execution Date</th>
                  <th className="px-4 py-2.5 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                {deposits.length > 0 ? (
                  deposits.map((dep) => (
                    <tr key={dep.id} className="hover:bg-gray-50 dark:hover:bg-white/3 text-gray-900 dark:text-white">
                      <td className="px-4 py-3 font-mono text-gray-500 dark:text-gray-400">{dep.id}</td>
                      <td className="px-4 py-3 font-bold text-emerald-500">{dep.amount}</td>
                      <td className="px-4 py-3 font-medium">{dep.method}</td>
                      <td className="px-4 py-3 font-mono text-[10px] text-gray-500 dark:text-gray-400 truncate max-w-[120px]" title={dep.txHash}>
                        {dep.txHash}
                      </td>
                      <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{dep.date}</td>
                      <td className="px-4 py-3 text-center">
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-500 text-[10px] font-bold">
                          {dep.status}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-gray-500 dark:text-gray-400">No deposit entries found in blockchain ledger.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        <div className="flex justify-end pt-2">
          <Button onClick={onClose} variant="secondary" className="text-xs">
            Close Registry
          </Button>
        </div>
      </div>
    </div>
  );
};

// ----------------------------------------------------
// 6. Withdrawal History Modal
// ----------------------------------------------------
interface WithdrawalsModalProps {
  user: AdminUser;
  withdrawals: any[];
  loading: boolean;
  onClose: () => void;
  t: ThemeTokens;
}

export const WithdrawalsModal: React.FC<WithdrawalsModalProps> = ({
  user,
  withdrawals,
  loading,
  onClose,
  t,
}) => {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0" onClick={onClose} />
      <div className="rounded-3xl border p-6 shadow-2xl max-w-2xl w-full relative z-10 text-left space-y-4 bg-white dark:bg-[#0f112e] border-gray-200 dark:border-white/10 text-gray-900 dark:text-white">
        <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-white/5">
          <h3 className="text-sm font-bold flex items-center gap-2 text-gray-900 dark:text-white">
            <History className="w-4 h-4 text-rose-500" />
            <span>Withdrawal Requests History ({user.name})</span>
          </h3>
          <button
            onClick={onClose}
            className={`p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 cursor-pointer ${t.textMuted}`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {loading ? (
          <div className="py-12 text-center flex flex-col items-center justify-center space-y-2">
            <span className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <p className={`text-xs ${t.textMuted}`}>Fetching withdrawal records...</p>
          </div>
        ) : (
          <div className="overflow-x-auto border border-gray-200 dark:border-white/10 rounded-2xl max-h-[350px]">
            <table className="w-full text-xs text-left">
              <thead className="bg-gray-50 dark:bg-white/3">
                <tr className="border-b border-gray-200 dark:border-white/10 font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  <th className="px-4 py-2.5">Withdrawal ID</th>
                  <th className="px-4 py-2.5 text-right">Requested</th>
                  <th className="px-4 py-2.5">Payout Address</th>
                  <th className="px-4 py-2.5">Execution Date</th>
                  <th className="px-4 py-2.5 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                {withdrawals.length > 0 ? (
                  withdrawals.map((wd) => (
                    <tr key={wd.id} className="hover:bg-gray-50 dark:hover:bg-white/3 text-gray-900 dark:text-white">
                      <td className="px-4 py-3 font-mono text-gray-500 dark:text-gray-400">{wd.id}</td>
                      <td className="px-4 py-3 text-right font-bold text-gray-900 dark:text-white">{wd.amount}</td>
                      <td className="px-4 py-3 font-mono text-[10px] text-gray-500 dark:text-gray-400 truncate max-w-[150px]" title={wd.wallet}>
                        {wd.wallet}
                      </td>
                      <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{wd.date}</td>
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
                    <td colSpan={5} className="text-center py-8 text-gray-500 dark:text-gray-400">No withdrawal records found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        <div className="flex justify-end pt-2">
          <Button onClick={onClose} variant="secondary" className="text-xs">
            Close Ledger
          </Button>
        </div>
      </div>
    </div>
  );
};

// ----------------------------------------------------
// 7. Team Network Modal
// ----------------------------------------------------
interface TeamNetworkModalProps {
  user: AdminUser;
  team: any[];
  loading: boolean;
  onClose: () => void;
  t: ThemeTokens;
}

export const TeamNetworkModal: React.FC<TeamNetworkModalProps> = ({
  user,
  team,
  loading,
  onClose,
  t,
}) => {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0" onClick={onClose} />
      <div className="rounded-3xl border p-6 shadow-2xl max-w-2xl w-full relative z-10 text-left space-y-4 bg-white dark:bg-[#0f112e] border-gray-200 dark:border-white/10 text-gray-900 dark:text-white">
        <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-white/5">
          <h3 className="text-sm font-bold flex items-center gap-2 text-gray-900 dark:text-white">
            <Network className="w-4 h-4 text-purple-500" />
            <span>Referral Downline Network Lineage</span>
          </h3>
          <button
            onClick={onClose}
            className={`p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 cursor-pointer ${t.textMuted}`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {loading ? (
          <div className="py-12 text-center flex flex-col items-center justify-center space-y-2">
            <span className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <p className={`text-xs ${t.textMuted}`}>Traversing network hierarchy downlines...</p>
          </div>
        ) : (
          <div className="space-y-4 max-h-[450px] overflow-y-auto pr-1">
            <div className="flex items-center justify-between p-3 rounded-2xl bg-gray-50 dark:bg-white/3 border border-gray-100 dark:border-white/5">
              <div>
                <p className="text-[10px] font-mono font-bold text-gray-500 dark:text-gray-400 uppercase">Upline Leader Account</p>
                <p className="font-extrabold text-sm mt-0.5 text-gray-900 dark:text-white">{user.name}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-mono font-bold text-gray-500 dark:text-gray-400 uppercase">Total Referral Lines (A-D)</p>
                <p className="font-extrabold text-sm text-purple-500 mt-0.5">
                  {team.length} members
                </p>
              </div>
            </div>

            {/* Tabulated view for Levels A, B, C, D */}
            <div className="space-y-3">
              {['A', 'B', 'C', 'D'].map((lvl) => {
                const tierMembers = team.filter(m => m.level === lvl);
                return (
                  <div key={lvl} className="border border-gray-200 dark:border-white/10 rounded-2xl overflow-hidden bg-gray-50/50 dark:bg-white/3">
                    <div className="px-4 py-2.5 bg-gray-100 dark:bg-white/5 flex items-center justify-between border-b border-gray-200 dark:border-white/10">
                      <span className="font-bold text-xs text-gray-900 dark:text-white">Level {lvl} Team Network</span>
                      <span className="px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-500 text-[10px] font-bold font-mono">
                        {tierMembers.length} members
                      </span>
                    </div>

                    <div className="overflow-x-auto p-2">
                      <table className="w-full text-[11px] text-left">
                        <thead>
                          <tr className="text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider text-[9px] border-b border-gray-200 dark:border-white/10">
                            <th className="px-3 py-1.5">User Details</th>
                            <th className="px-3 py-1.5 text-center">VIP Privileges</th>
                            <th className="px-3 py-1.5 text-right">Ledger Asset</th>
                            <th className="px-3 py-1.5">Joined Date</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                          {tierMembers.length > 0 ? (
                            tierMembers.map((mem) => (
                              <tr key={mem.id} className="hover:bg-gray-100/50 dark:hover:bg-white/3 text-gray-900 dark:text-white">
                                <td className="px-3 py-2">
                                  <div className="font-bold text-gray-900 dark:text-white">{mem.name}</div>
                                  <div className="text-[9px] text-gray-500 dark:text-gray-400 font-mono">{mem.userId}</div>
                                </td>
                                <td className="px-3 py-2 text-center"><UserVipBadge rank={mem.vipTier} /></td>
                                <td className="px-3 py-2 text-right font-bold font-mono text-gray-900 dark:text-gray-100">
                                  ${mem.walletBalance.toFixed(2)}
                                </td>
                                <td className="px-3 py-2 text-gray-500 dark:text-gray-400">{mem.joined}</td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan={4} className="text-center py-4 text-gray-500 dark:text-gray-400 text-[10px]">No members found in this referral layer.</td>
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
          <Button onClick={onClose} variant="secondary" className="text-xs">
            Dismiss Hierarchy
          </Button>
        </div>
      </div>
    </div>
  );
};

// ----------------------------------------------------
// 8. Compliance Audit Logs Modal
// ----------------------------------------------------
interface AuditLogsModalProps {
  user: AdminUser;
  audits: any[];
  loading: boolean;
  onClose: () => void;
  t: ThemeTokens;
}

export const AuditLogsModal: React.FC<AuditLogsModalProps> = ({
  user,
  audits,
  loading,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0" onClick={onClose} />
      <div className="rounded-3xl border p-6 shadow-2xl max-w-xl w-full relative z-10 text-left space-y-4 bg-white dark:bg-[#0f112e] border-gray-200 dark:border-white/10 text-gray-900 dark:text-white">
        <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-white/5">
          <h3 className="text-sm font-bold flex items-center gap-2 text-gray-900 dark:text-white">
            <ShieldAlert className="w-4 h-4 text-indigo-500" />
            <span>Administrative Compliance Audits</span>
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 cursor-pointer text-gray-500 dark:text-gray-400"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {loading ? (
          <div className="py-12 text-center flex flex-col items-center justify-center space-y-2">
            <span className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-xs text-gray-500 dark:text-gray-400">Fetching compliance audits...</p>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="px-3 py-2.5 rounded-2xl bg-gray-50 dark:bg-white/3 border border-gray-100 dark:border-white/5 text-xs">
              <p className="font-bold text-gray-500 dark:text-gray-400">Account Holder</p>
              <p className="font-extrabold text-sm mt-0.5 text-gray-900 dark:text-white">{user.name} ({user.userId})</p>
            </div>

            {/* Audit timelines */}
            <div className="space-y-4 max-h-[350px] overflow-y-auto pr-1">
              {audits.length > 0 ? (
                audits.map((audit, i) => (
                  <div key={i} className="relative pl-5 border-l-2 border-indigo-500/20 space-y-1">
                    <div className="absolute -left-1.5 top-1 w-2.5 h-2.5 rounded-full bg-indigo-500 ring-4 ring-indigo-500/10" />

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs font-bold gap-1">
                      <span className="text-gray-900 dark:text-white leading-tight">{audit.action}</span>
                      <span className="text-[10px] font-mono font-medium text-gray-500 dark:text-gray-400">{audit.time}</span>
                    </div>

                    <p className="text-[10px] text-gray-500 dark:text-gray-400">
                      Operator: <span className="font-semibold text-gray-700 dark:text-gray-300 font-mono">{audit.admin}</span> | IP: <span className="font-semibold text-gray-700 dark:text-gray-300 font-mono">{audit.ip}</span>
                    </p>

                    <p className="text-xs text-gray-600 dark:text-gray-400 italic bg-gray-50 dark:bg-white/3 p-2 rounded-xl mt-1.5 leading-relaxed border border-gray-100 dark:border-white/5">
                      Resource: {audit.module}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-center py-6 text-gray-500 dark:text-gray-400 text-xs">No audit logs recorded for this account.</p>
              )}
            </div>
          </div>
        )}

        <div className="flex justify-end pt-2">
          <Button onClick={onClose} variant="secondary" className="text-xs">
            Close Audit Logs
          </Button>
        </div>
      </div>
    </div>
  );
};
