/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Database,
  RefreshCw,
  ShieldCheck,
  Trash2,
} from 'lucide-react';
import { Card, Button, Input } from '../ui/index.ts';
import { ThemeTokens } from '../ui/themeTokens.ts';
import { Toast } from '../ui/Feedback/index.tsx';
import { api } from '../../services/api.ts';

interface ResetViewProps {
  t: ThemeTokens;
  isDark: boolean;
}

interface CleanupPreview {
  usersToDelete: number;
  wallets: number;
  depositAddresses: number;
  deposits: number;
  withdrawals: number;
  transactions: number;
  totalRecordsToDelete: number;
  preserved: {
    superadmin: {
      dsUserId: string;
      email: string;
    };
    systemSettings: number;
    treasuryWallets: number;
  };
}

interface CleanupSummary extends CleanupPreview {
  checks: {
    superadminPreserved: boolean;
    treasuryConfigurationPreserved: boolean;
    systemSettingsPreserved: boolean;
    allTestUsersDeleted: boolean;
    databaseReadyForProduction: boolean;
  };
}

const CONFIRMATION_PHRASE = 'DELETE TEST USERS';

export const ResetView: React.FC<ResetViewProps> = ({ t, isDark }) => {
  const [preview, setPreview] = useState<CleanupPreview | null>(null);
  const [summary, setSummary] = useState<CleanupSummary | null>(null);
  const [confirmation, setConfirmation] = useState('');
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toastOpen, setToastOpen] = useState(false);

  const isConfirmed = confirmation === CONFIRMATION_PHRASE;

  const previewRows = useMemo(() => {
    if (!preview) return [];
    return [
      ['Users to delete', preview.usersToDelete],
      ['Wallets', preview.wallets],
      ['Deposit Addresses', preview.depositAddresses],
      ['Deposits', preview.deposits],
      ['Withdrawals', preview.withdrawals],
      ['Transactions', preview.transactions],
      ['Total records', preview.totalRecordsToDelete],
    ];
  }, [preview]);

  const fetchPreview = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.getProductionCleanupPreview();
      if (res.success && res.data) {
        setPreview(res.data as CleanupPreview);
      } else {
        setError(res.error?.message || 'Unable to load cleanup preview.');
      }
    } catch (err: any) {
      setError(err.message || 'Unable to load cleanup preview.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPreview();
  }, []);

  const handleDelete = async () => {
    if (!isConfirmed || deleting) return;

    try {
      setDeleting(true);
      setError(null);
      const res = await api.deleteAllTestUsers(confirmation);
      if (res.success && res.data) {
        setSummary(res.data as CleanupSummary);
        setPreview(res.data as CleanupSummary);
        setConfirmation('');
        setToastOpen(true);
        setTimeout(() => setToastOpen(false), 3500);
      } else {
        setError(res.error?.message || 'Cleanup failed. No data was deleted.');
      }
    } catch (err: any) {
      setError(err.message || 'Cleanup failed. No data was deleted.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6 text-left relative">
      <Card className="p-6 space-y-6" hoverEffect={false}>
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-600 text-white flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-mono font-extrabold uppercase tracking-wider text-red-500">
                Reset / Danger Zone
              </p>
              <h2 className={`text-xl font-black tracking-tight ${t.text}`}>Delete All Test Users</h2>
              <p className={`text-xs leading-relaxed max-w-2xl ${t.textSub}`}>
                This production cleanup removes every non-SUPERADMIN account and related testing records while preserving platform infrastructure.
              </p>
            </div>
          </div>

          <Button
            variant="secondary"
            size="sm"
            onClick={fetchPreview}
            disabled={loading || deleting}
            leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />}
          >
            Preview
          </Button>
        </div>

        {error && (
          <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-xs font-bold text-red-500 flex items-center justify-between gap-3">
            <span>{error}</span>
            <Button variant="secondary" size="sm" onClick={fetchPreview} disabled={loading || deleting}>
              Retry
            </Button>
          </div>
        )}

        <div className={`rounded-xl border ${isDark ? 'border-red-500/20 bg-red-500/10' : 'border-red-100 bg-red-50'} p-4`}>
          <div className="flex items-start gap-3">
            <Trash2 className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h3 className="text-sm font-black text-red-600">Irreversible production cleanup</h3>
              <p className={`text-xs leading-relaxed ${isDark ? 'text-red-100/80' : 'text-red-800'}`}>
                This action deletes test users, wallets, deposit addresses, ledgers, support data, queues, notifications, sessions, audit history, and every other user-owned operational record. It preserves only SUPERADMIN, system settings, treasury wallets, schema, and migrations.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-blue-500" />
            <h3 className={`text-sm font-black ${t.text}`}>Preview</h3>
          </div>

          {loading ? (
            <div className={`py-10 text-center text-xs font-bold ${t.textMuted}`}>
              Loading cleanup counts...
            </div>
          ) : preview ? (
            <div className={`border-y ${t.sep} divide-y ${t.sep}`}>
              {previewRows.map(([label, value]) => (
                <div key={label} className="flex items-center justify-between gap-4 py-3">
                  <span className={`text-xs font-bold ${t.textSub}`}>{label}</span>
                  <span className={`text-sm font-mono font-black ${label === 'Total records' ? 'text-red-500' : t.text}`}>
                    {Number(value).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className={`py-10 text-center text-xs font-bold ${t.textMuted}`}>
              Cleanup preview unavailable.
            </div>
          )}
        </div>

        {preview && (
          <div className={`rounded-xl border ${t.sep} p-4 space-y-2`}>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span className={`text-xs font-black ${t.text}`}>Preserved infrastructure</span>
            </div>
            <div className={`grid grid-cols-1 md:grid-cols-3 gap-2 text-[11px] font-bold ${t.textSub}`}>
              <span>SUPERADMIN: {preview.preserved.superadmin.dsUserId}</span>
              <span>System settings: {preview.preserved.systemSettings}</span>
              <span>Treasury wallets: {preview.preserved.treasuryWallets}</span>
            </div>
          </div>
        )}

        {!summary ? (
          <div className="space-y-4">
            <Input
              label="Confirmation"
              value={confirmation}
              onChange={(e) => setConfirmation(e.target.value)}
              placeholder={CONFIRMATION_PHRASE}
              disabled={deleting || loading}
              helperText={`Type exactly: ${CONFIRMATION_PHRASE}`}
              className="font-mono"
            />

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-2">
              <span className={`text-[11px] font-bold ${t.textMuted}`}>
                The delete button stays locked until the confirmation text matches exactly.
              </span>
              <Button
                variant="danger"
                onClick={handleDelete}
                disabled={!isConfirmed || loading || deleting || !preview}
                isLoading={deleting}
                leftIcon={<Trash2 className="w-4 h-4" />}
              >
                Delete Test Users
              </Button>
            </div>
          </div>
        ) : (
          <div className={`rounded-xl border ${isDark ? 'border-emerald-500/20 bg-emerald-500/10' : 'border-emerald-100 bg-emerald-50'} p-4 space-y-3`}>
            {[
              ['SUPERADMIN preserved', summary.checks.superadminPreserved],
              ['Treasury configuration preserved', summary.checks.treasuryConfigurationPreserved],
              ['System settings preserved', summary.checks.systemSettingsPreserved],
              ['All test users deleted', summary.checks.allTestUsersDeleted],
              ['Database ready for production', summary.checks.databaseReadyForProduction],
            ].map(([label, ok]) => (
              <div key={String(label)} className="flex items-center gap-2 text-xs font-black text-emerald-600">
                <CheckCircle2 className={`w-4 h-4 ${ok ? 'text-emerald-500' : 'text-amber-500'}`} />
                <span>{label}</span>
              </div>
            ))}
          </div>
        )}
      </Card>

      {toastOpen && (
        <Toast
          message="Production cleanup completed."
          variant="success"
          onClose={() => setToastOpen(false)}
        />
      )}
    </div>
  );
};

export default ResetView;
