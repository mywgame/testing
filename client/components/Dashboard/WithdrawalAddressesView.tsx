/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth.ts';
import { useTheme } from '../../hooks/useTheme.ts';
import { Wallet, Plus, Pencil, Trash2, BadgeCheck, CheckCircle, AlertTriangle, Key, RotateCw } from 'lucide-react';
import { SecurityVerification } from '../Auth/SecurityVerification/SecurityVerification.tsx';
import { getApiUrl } from '../../services/apiConfig.ts';

type WithdrawalNetwork = 'USDT_BEP20' | 'USDT_POLYGON' | 'USDT_TRC20';

interface WithdrawalAddressState {
  network: WithdrawalNetwork;
  addresses: string[];
}

const NETWORK_META: Record<WithdrawalNetwork, { label: string; networkName: string; color: string; patternNote: string }> = {
  USDT_BEP20: {
    label: 'USDT · BEP20 (BNB Smart Chain)',
    networkName: 'BNB Smart Chain (BEP20)',
    color: '#f0b90b',
    patternNote: 'Starts with 0x (42 characters)',
  },
  USDT_POLYGON: {
    label: 'USDT · Polygon',
    networkName: 'Polygon (POS)',
    color: '#8247e5',
    patternNote: 'Starts with 0x (42 characters)',
  },
  USDT_TRC20: {
    label: 'USDT · TRC20 (Tron)',
    networkName: 'TRON (TRC20)',
    color: '#ef4444',
    patternNote: 'Starts with T (34 characters)',
  },
};

export const WithdrawalAddressesView: React.FC = () => {
  const { user, token } = useAuth();
  const { t } = useTheme();

  const [addressData, setAddressData] = useState<Record<WithdrawalNetwork, string[]>>({
    USDT_BEP20: [],
    USDT_POLYGON: [],
    USDT_TRC20: [],
  });
  const [loading, setLoading] = useState(false);
  const [editingNetwork, setEditingNetwork] = useState<WithdrawalNetwork | null>(null);
  const [deletingKey, setDeletingKey] = useState<{ network: WithdrawalNetwork; address: string } | null>(null);
  const [feedbackSuccess, setFeedbackSuccess] = useState('');
  const [feedbackError, setFeedbackError] = useState('');

  useEffect(() => {
    if (token) {
      fetchWithdrawalAddresses();
    }
  }, [token]);

  const fetchWithdrawalAddresses = async () => {
    setLoading(true);
    try {
      const res = await fetch(getApiUrl('/users/security/withdrawal-addresses'), {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const body = await res.json();
        if (body.success && body.data) {
          setAddressData(body.data as Record<WithdrawalNetwork, string[]>);
        }
      }
    } catch (err) {
      console.error('Failed to load withdrawal addresses:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAddress = async (network: WithdrawalNetwork, address: string) => {
    setFeedbackSuccess('');
    setFeedbackError('');
    try {
      const res = await fetch(getApiUrl('/users/security/withdrawal-addresses'), {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ network, address }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error?.message || 'Failed to delete withdrawal address.');

      setFeedbackSuccess(`Address for ${NETWORK_META[network].networkName} deleted successfully.`);
      setDeletingKey(null);
      fetchWithdrawalAddresses();
    } catch (err: any) {
      setFeedbackError(err.message || 'Failed to delete address.');
    }
  };

  const totalSavedCount = (Object.values(addressData) as string[][]).reduce((sum: number, list: string[]) => sum + (list?.length || 0), 0);

  return (
    <div className="space-y-6 text-left" id="withdrawal-addresses-view-tab">
      {/* 1. Header Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className={`rounded-2xl border p-4 backdrop-blur-lg flex flex-col justify-between ${t.card}`}>
          <span className={`text-[10px] font-bold uppercase tracking-widest ${t.textMuted}`}>Bound Addresses</span>
          <h4 className={`text-lg font-extrabold mt-1 ${t.text}`}>
            {totalSavedCount} Registered Wallet{totalSavedCount === 1 ? '' : 's'}
          </h4>
        </div>

        <div className={`rounded-2xl border p-4 backdrop-blur-lg flex flex-col justify-between ${t.card}`}>
          <span className={`text-[10px] font-bold uppercase tracking-widest ${t.textMuted}`}>Verification Standard</span>
          <h4 className={`text-sm font-extrabold flex items-center gap-1.5 mt-1 ${t.text}`}>
            <BadgeCheck className="w-4 h-4 text-emerald-500 shrink-0" /> Email OTP Verified
          </h4>
        </div>

        <div className={`rounded-2xl border p-4 backdrop-blur-lg flex flex-col justify-between ${t.card}`}>
          <span className={`text-[10px] font-bold uppercase tracking-widest ${t.textMuted}`}>Supported Networks</span>
          <h4 className={`text-xs font-bold mt-1 ${t.text}`}>
            BEP20 · Polygon · TRC20
          </h4>
        </div>
      </div>

      {/* 2. Global Feedback Notices */}
      {feedbackSuccess && (
        <div className="p-3.5 rounded-xl text-xs font-semibold flex items-center border bg-emerald-500/10 border-emerald-500/25 text-emerald-500">
          <CheckCircle className="w-4 h-4 mr-2 shrink-0" /> {feedbackSuccess}
        </div>
      )}
      {feedbackError && (
        <div className="p-3.5 rounded-xl text-xs font-semibold flex items-center border bg-red-500/10 border-red-500/25 text-red-400">
          <AlertTriangle className="w-4 h-4 mr-2 shrink-0" /> {feedbackError}
        </div>
      )}

      {/* 3. Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-8 space-y-6">
          <div className={`rounded-2xl border p-6 backdrop-blur-lg space-y-6 ${t.card}`}>
            <div className={`pb-4 border-b flex items-center justify-between ${t.sep}`}>
              <div>
                <h3 className={`text-base font-extrabold flex items-center gap-2 ${t.text}`}>
                  <Wallet className="w-5 h-5 text-cyan-500" /> Withdrawal Wallet Addresses
                </h3>
                <p className={`text-xs mt-1 ${t.textMuted}`}>
                  Manage verified payout destinations. Adding, modifying, or removing a withdrawal address requires Email OTP verification.
                </p>
              </div>
              {loading && (
                <RotateCw className="w-4 h-4 animate-spin text-cyan-500 shrink-0" />
              )}
            </div>

            <div className="space-y-4">
              {(['USDT_BEP20', 'USDT_POLYGON', 'USDT_TRC20'] as WithdrawalNetwork[]).map((network) => {
                const meta = NETWORK_META[network];
                const list = addressData[network] || [];
                const isEditingThis = editingNetwork === network;

                return (
                  <div key={network} className={`rounded-2xl border p-5 ${t.inset} space-y-3`}>
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="w-3 h-3 rounded-full shrink-0" style={{ background: meta.color }} />
                        <div>
                          <p className={`text-sm font-extrabold ${t.text}`}>{meta.label}</p>
                          <p className={`text-[11px] ${t.textMuted}`}>{meta.patternNote}</p>
                        </div>
                      </div>

                      <button
                        onClick={() => setEditingNetwork(isEditingThis ? null : network)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-cyan-500 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/25 transition-colors cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" /> Add Address
                      </button>
                    </div>

                    {/* Address List */}
                    {list.length === 0 ? (
                      <div className={`py-4 text-center rounded-xl border border-dashed text-xs ${t.textMuted} ${t.sep}`}>
                        No verified address registered for {meta.networkName}.
                      </div>
                    ) : (
                      <div className="space-y-2 pt-1">
                        {list.map((addr) => {
                          const isConfirmingDelete = deletingKey?.network === network && deletingKey?.address === addr;
                          return (
                            <div key={addr} className={`rounded-xl border p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 ${t.card}`}>
                              <div className="min-w-0 flex items-center gap-2">
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-500 shrink-0">
                                  <BadgeCheck className="w-3 h-3" /> Verified
                                </span>
                                <code className={`text-xs font-mono font-bold truncate ${t.text}`}>{addr}</code>
                              </div>

                              <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                                {isConfirmingDelete ? (
                                  <div className="flex items-center gap-1.5">
                                    <span className="text-[10px] text-red-400 font-bold">Confirm?</span>
                                    <button
                                      onClick={() => handleDeleteAddress(network, addr)}
                                      className="px-2.5 py-1 rounded-lg text-xs font-bold text-white bg-red-600 hover:bg-red-700 cursor-pointer"
                                    >
                                      Delete
                                    </button>
                                    <button
                                      onClick={() => setDeletingKey(null)}
                                      className="px-2 py-1 rounded-lg text-xs font-medium text-gray-400 hover:text-gray-200 cursor-pointer"
                                    >
                                      Cancel
                                    </button>
                                  </div>
                                ) : (
                                  <button
                                    onClick={() => setDeletingKey({ network, address: addr })}
                                    title="Delete address"
                                    className="p-1.5 rounded-lg border text-red-400 hover:text-red-500 hover:bg-red-500/10 border-red-500/20 transition-colors cursor-pointer"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Add Address Form Modal / Inline drawer */}
                    {isEditingThis && (
                      <div className={`mt-3 pt-3 border-t space-y-3 ${t.sep}`}>
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-bold text-cyan-500">Register New {meta.networkName} Address</span>
                        </div>
                        <SecurityVerification
                          token={token || ''}
                          network={network}
                          networkLabel={meta.label}
                          userEmail={user?.email}
                          onSuccess={() => {
                            setEditingNetwork(null);
                            fetchWithdrawalAddresses();
                            setFeedbackSuccess(`New ${meta.networkName} address bound successfully.`);
                          }}
                          onCancel={() => setEditingNetwork(null)}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Side Info Cards */}
        <div className="lg:col-span-4 space-y-4">
          <div className={`rounded-2xl border p-5 backdrop-blur-lg space-y-3 ${t.card}`}>
            <div className="flex items-center gap-2 text-cyan-500">
              <Key className="w-4 h-4" />
              <h5 className="text-xs font-bold">Address Lock Policy</h5>
            </div>
            <p className={`text-[11px] leading-relaxed ${t.textMuted}`}>
              Withdrawal addresses are strictly verified via Email OTP before registration. Your payouts will only be routed to your registered wallet destinations.
            </p>
          </div>

          <div className={`rounded-2xl border p-5 backdrop-blur-lg space-y-3 ${t.card}`}>
            <div className="flex items-center gap-2 text-amber-500">
              <AlertTriangle className="w-4 h-4" />
              <h5 className="text-xs font-bold">Network Compatibility</h5>
            </div>
            <p className={`text-[11px] leading-relaxed ${t.textMuted}`}>
              Please verify that your wallet address matches the chosen network (BEP20, Polygon, or TRC20). Sending funds to an incorrect network address may result in permanent loss.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WithdrawalAddressesView;
