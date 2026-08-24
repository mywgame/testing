/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Edit,
  DollarSign,
  Bell,
  Plus,
  X,
  Upload,
  Trash2,
} from 'lucide-react';
import { Button, Input, Select, Textarea } from '../../ui/index.ts';
import { ThemeTokens } from '../../ui/themeTokens.ts';
import { AdminUser } from '../types.ts';

// ----------------------------------------------------
// 1. Edit Profile Modal
// ----------------------------------------------------
interface UserEditModalProps {
  user: AdminUser;
  profileDetail: any;
  loadingDetails: boolean;
  editForm: {
    name: string;
    email: string;
    mobile: string;
    status: 'Active' | 'Suspended';
    adminNotes: string;
  };
  setEditForm: React.Dispatch<React.SetStateAction<{
    name: string;
    email: string;
    mobile: string;
    status: 'Active' | 'Suspended';
    adminNotes: string;
  }>>;
  onSave: (e: React.FormEvent) => void;
  onClose: () => void;
  t: ThemeTokens;
}

export const UserEditModal: React.FC<UserEditModalProps> = ({
  user,
  profileDetail,
  loadingDetails,
  editForm,
  setEditForm,
  onSave,
  onClose,
  t,
}) => {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0" onClick={onClose} />
      <div className="rounded-3xl border p-6 shadow-2xl max-w-lg w-full relative z-10 text-left space-y-5 bg-white dark:bg-[#0f112e] border-gray-200 dark:border-white/10 overflow-y-auto max-h-[90vh] text-gray-900 dark:text-white">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-white/5">
          <h3 className="text-sm font-bold flex items-center gap-2 text-gray-900 dark:text-white">
            <Edit className="w-4 h-4 text-amber-500" />
            <span>Configure Account Settings ({user.name})</span>
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
            <p className={`text-xs ${t.textMuted}`}>Fetching complete editable states...</p>
          </div>
        ) : (
          <form onSubmit={onSave} className="space-y-4">
            {/* Editable Fields Section */}
            <div className="space-y-3">
              <p className="text-[10px] font-mono font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">
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
                <p className="text-[10px] font-mono font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-1.5">
                  Read Only Fields (Server-Authoritative)
                </p>
                <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-[11px]">
                  <div className="flex justify-between py-1 border-b border-gray-100 dark:border-white/5">
                    <span className="text-gray-500 dark:text-gray-400 font-bold">User ID:</span>
                    <span className="font-mono font-semibold text-gray-900 dark:text-white">{profileDetail.userId}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-gray-100 dark:border-white/5">
                    <span className="text-gray-500 dark:text-gray-400 font-bold">VIP Class:</span>
                    <span className="font-semibold text-gray-900 dark:text-white">{profileDetail.rank}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-gray-100 dark:border-white/5">
                    <span className="text-gray-500 dark:text-gray-400 font-bold">Wallet Balance:</span>
                    <span className="font-semibold text-gray-900 dark:text-white">{profileDetail.balance}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-gray-100 dark:border-white/5">
                    <span className="text-gray-500 dark:text-gray-400 font-bold">Level A Team:</span>
                    <span className="font-semibold text-gray-900 dark:text-white">{(profileDetail.teamCounts?.levelA ?? profileDetail.levelA) || 0} members</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-gray-100 dark:border-white/5">
                    <span className="text-gray-500 dark:text-gray-400 font-bold">Level B Team:</span>
                    <span className="font-semibold text-gray-900 dark:text-white">{(profileDetail.teamCounts?.levelB ?? profileDetail.levelB) || 0} members</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-gray-100 dark:border-white/5">
                    <span className="text-gray-500 dark:text-gray-400 font-bold">Level C Team:</span>
                    <span className="font-semibold text-gray-900 dark:text-white">{(profileDetail.teamCounts?.levelC ?? profileDetail.levelC) || 0} members</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-gray-100 dark:border-white/5">
                    <span className="text-gray-500 dark:text-gray-400 font-bold">Level D Team:</span>
                    <span className="font-semibold text-gray-900 dark:text-white">{(profileDetail.teamCounts?.levelD ?? profileDetail.levelD) || 0} members</span>
                  </div>
                </div>
              </div>
            )}

            {/* Form Buttons */}
            <div className="flex gap-3 pt-2">
              <Button type="button" variant="secondary" onClick={onClose} className="flex-1 text-xs">
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
  );
};

// ----------------------------------------------------
// 2. Wallet Adjustment Modal
// ----------------------------------------------------
interface UserWalletAdjustmentModalProps {
  user: AdminUser;
  walletForm: {
    type: 'credit' | 'debit';
    amount: string;
    reason: string;
    adminNote: string;
  };
  setWalletForm: React.Dispatch<React.SetStateAction<{
    type: 'credit' | 'debit';
    amount: string;
    reason: string;
    adminNote: string;
  }>>;
  onConfirm: (e: React.FormEvent) => void;
  onClose: () => void;
  t: ThemeTokens;
}

export const UserWalletAdjustmentModal: React.FC<UserWalletAdjustmentModalProps> = ({
  user,
  walletForm,
  setWalletForm,
  onConfirm,
  onClose,
  t,
}) => {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0" onClick={onClose} />
      <div className="rounded-3xl border p-6 shadow-2xl max-w-md w-full relative z-10 text-left space-y-5 bg-white dark:bg-[#0f112e] border-gray-200 dark:border-white/10 text-gray-900 dark:text-white">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-white/5">
          <h3 className="text-sm font-bold flex items-center gap-2 text-gray-900 dark:text-white">
            <DollarSign className="w-4 h-4 text-emerald-500" />
            <span>Adjust Wallet Ledger Balance</span>
          </h3>
          <button
            onClick={onClose}
            className={`p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 cursor-pointer ${t.textMuted}`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={onConfirm} className="space-y-4">
          {/* Target User */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-gray-50 dark:bg-white/3 border border-gray-100 dark:border-white/5">
            <div className="min-w-0">
              <p className="text-[10px] font-mono font-bold text-gray-500 dark:text-gray-400 uppercase">Target User</p>
              <p className="font-bold text-sm truncate mt-0.5 text-gray-900 dark:text-white">{user.name}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-mono font-bold text-gray-500 dark:text-gray-400 uppercase">Available Balance</p>
              <p className="font-extrabold text-sm text-emerald-500 mt-0.5">{user.balance}</p>
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
                    : 'border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/3 text-gray-600 dark:text-gray-400'
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
                    : 'border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/3 text-gray-600 dark:text-gray-400'
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
            <Button type="button" variant="secondary" onClick={onClose} className="flex-1 text-xs">
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
  );
};

// ----------------------------------------------------
// 3. Custom Mail Notification Modal
// ----------------------------------------------------
interface UserNotificationModalProps {
  user: AdminUser;
  notifForm: {
    title: string;
    message: string;
    type: 'Info' | 'Success' | 'Warning' | 'Security' | 'Promotion';
    priority: 'Normal' | 'High';
    attachments: string[];
  };
  setNotifForm: React.Dispatch<React.SetStateAction<{
    title: string;
    message: string;
    type: 'Info' | 'Success' | 'Warning' | 'Security' | 'Promotion';
    priority: 'Normal' | 'High';
    attachments: string[];
  }>>;
  onSend: (e: React.FormEvent) => void;
  onClose: () => void;
  triggerToast: (msg: string, variant?: 'info' | 'success' | 'error') => void;
  t: ThemeTokens;
}

export const UserNotificationModal: React.FC<UserNotificationModalProps> = ({
  user,
  notifForm,
  setNotifForm,
  onSend,
  onClose,
  triggerToast,
  t,
}) => {
  const [isDraggingFile, setIsDraggingFile] = useState(false);

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

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0" onClick={onClose} />
      <div className="rounded-3xl border p-6 shadow-2xl max-w-lg w-full relative z-10 text-left space-y-5 bg-white dark:bg-[#0f112e] border-gray-200 dark:border-white/10 overflow-y-auto max-h-[90vh] text-gray-900 dark:text-white">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-white/5">
          <h3 className="text-sm font-bold flex items-center gap-2 text-gray-900 dark:text-white">
            <Bell className="w-4 h-4 text-blue-500" />
            <span>Transmit Custom Mail Dispatch</span>
          </h3>
          <button
            onClick={onClose}
            className={`p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 cursor-pointer ${t.textMuted}`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={onSend} className="space-y-4">
          {/* User badge */}
          <div className="flex items-center justify-between px-3 py-2.5 rounded-2xl bg-gray-50 dark:bg-white/3 border border-gray-100 dark:border-white/5">
            <span className="text-xs font-bold text-gray-600 dark:text-gray-300">To Recipient:</span>
            <span className="font-mono font-extrabold text-xs text-blue-500">{user.name} ({user.userId})</span>
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
                <p className="text-xs font-bold text-gray-900 dark:text-white">Drag and Drop media files here or click to browse</p>
                <p className="text-[10px] text-gray-500 dark:text-gray-400">Supports PNG, JPG, JPEG up to 5MB</p>
              </label>
            </div>

            {/* Display uploaded files */}
            {notifForm.attachments.length > 0 && (
              <div className="space-y-1.5 pt-1.5">
                <p className="text-[10px] font-mono font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">Selected Attachments</p>
                <div className="space-y-1">
                  {notifForm.attachments.map((file, i) => (
                    <div key={i} className="flex items-center justify-between text-xs p-2 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5">
                      <span className="truncate font-medium text-gray-900 dark:text-white">{file}</span>
                      <button
                        type="button"
                        onClick={() => setNotifForm(prev => ({ ...prev, attachments: prev.attachments.filter((_, idx) => idx !== i) }))}
                        className="p-1 rounded text-red-500 hover:bg-red-500/15 cursor-pointer"
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
            <Button type="button" variant="secondary" onClick={onClose} className="flex-1 text-xs">
              Cancel
            </Button>
            <Button type="submit" variant="primary" className="flex-1 text-xs bg-blue-600 hover:bg-blue-700 text-white">
              Send Message
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ----------------------------------------------------
// 4. Suspend / Activate Confirm Modal
// ----------------------------------------------------
interface UserConfirmToggleStatusModalProps {
  user: AdminUser | null;
  onConfirm: (user: AdminUser) => void;
  onClose: () => void;
}

export const UserConfirmToggleStatusModal: React.FC<UserConfirmToggleStatusModalProps> = ({
  user,
  onConfirm,
  onClose,
}) => {
  if (!user) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0" onClick={onClose} />
      <div className="rounded-3xl border p-6 shadow-2xl max-w-sm w-full relative z-10 text-center space-y-5 bg-white dark:bg-[#0f112e] border-gray-200 dark:border-white/10 text-gray-900 dark:text-white">
        <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto text-xl bg-amber-500/15 text-amber-500">
          ⚠️
        </div>
        <div className="space-y-1.5">
          <h3 className="font-display font-bold text-base text-gray-900 dark:text-white">
            Confirm Security Action
          </h3>
          <p className="text-xs leading-relaxed text-gray-600 dark:text-gray-400">
            Are you absolutely sure you want to{' '}
            <span className="font-extrabold text-red-500 uppercase">
              {user.status === 'Active' ? 'SUSPEND' : 'ACTIVATE'}
            </span>{' '}
            access privileges for user account <span className="font-bold text-gray-900 dark:text-white">{user.name}</span> ({user.userId})? This will restrict their financial claims immediately on-site.
          </p>
        </div>

        <div className="flex gap-3">
          <Button type="button" variant="secondary" onClick={onClose} className="flex-1 text-xs">
            Cancel
          </Button>
          <Button
            type="button"
            onClick={() => onConfirm(user)}
            className={`flex-1 text-xs text-white ${
              user.status === 'Active' ? 'bg-red-600 hover:bg-red-700' : 'bg-emerald-600 hover:bg-emerald-700'
            }`}
          >
            Confirm
          </Button>
        </div>
      </div>
    </div>
  );
};

// ----------------------------------------------------
// 5. Add User Modal
// ----------------------------------------------------
interface AddUserModalProps {
  isOpen: boolean;
  newUser: {
    name: string;
    email: string;
    mobile: string;
    rank: string;
    balance: string;
    referralCode: string;
    levelA: number;
    levelB: number;
    levelC: number;
    levelD: number;
    status: 'Active' | 'Suspended';
    adminNotes: string;
  };
  setNewUser: React.Dispatch<React.SetStateAction<{
    name: string;
    email: string;
    mobile: string;
    rank: string;
    balance: string;
    referralCode: string;
    levelA: number;
    levelB: number;
    levelC: number;
    levelD: number;
    status: 'Active' | 'Suspended';
    adminNotes: string;
  }>>;
  onSubmit: (e: React.FormEvent) => void;
  onClose: () => void;
  t: ThemeTokens;
}

export const AddUserModal: React.FC<AddUserModalProps> = ({
  isOpen,
  newUser,
  setNewUser,
  onSubmit,
  onClose,
  t,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0" onClick={onClose} />
      <div className="rounded-3xl border p-6 shadow-2xl max-w-lg w-full relative z-10 text-left space-y-5 bg-white dark:bg-[#0f112e] border-gray-200 dark:border-white/10 overflow-y-auto max-h-[90vh] text-gray-900 dark:text-white">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-white/5">
          <h3 className="text-sm font-bold flex items-center gap-2 text-gray-900 dark:text-white">
            <Plus className="w-4 h-4 text-blue-500" />
            <span>Initialize Member Account</span>
          </h3>
          <button onClick={onClose} className={`p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 cursor-pointer ${t.textMuted}`}>
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-4 text-xs">
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
            <Button type="button" variant="secondary" onClick={onClose} className="flex-1 text-xs">
              Cancel
            </Button>
            <Button type="submit" variant="primary" className="flex-1 text-xs bg-blue-600 hover:bg-blue-700 text-white">
              Add Member Account
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
