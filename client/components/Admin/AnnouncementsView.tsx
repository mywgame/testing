/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Megaphone,
  Plus,
  Trash2,
  Calendar,
  X,
  Bell,
  Eye,
  CheckCircle,
  Clock,
  Pin,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { Card, Button, Input, Select, Badge } from '../ui/index.ts';
import { ThemeTokens } from '../ui/themeTokens.ts';
import { Toast } from '../ui/Feedback/index.tsx';
import { api } from '../../services/api.ts';

interface Broadcast {
  id: string;
  title: string;
  message: string;
  targetAudience: string;
  priority: 'Urgent' | 'Standard' | 'Low';
  createdAt: string;
  pinned: boolean;
}

interface AnnouncementsViewProps {
  t: ThemeTokens;
  isDark: boolean;
}

export const AnnouncementsView: React.FC<AnnouncementsViewProps> = ({ t, isDark }) => {
  const [broadcasts, setBroadcasts] = useState<Broadcast[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newBroadcast, setNewBroadcast] = useState<Omit<Broadcast, 'id' | 'createdAt'>>({
    title: '',
    message: '',
    targetAudience: 'All Users',
    priority: 'Standard',
    pinned: false
  });
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const loadAnnouncements = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getAnnouncements();
      if (res.success && res.data) {
        setBroadcasts(res.data);
      } else {
        setError(res.error?.message || 'Failed to retrieve system broadcasts.');
      }
    } catch (err: any) {
      setError(err.message || 'Error connecting to backend services.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnnouncements();
  }, []);

  // Create Broadcast
  const handleCreateBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.createAnnouncement(newBroadcast);
      if (res.success) {
        setIsAddOpen(false);
        setNewBroadcast({
          title: '',
          message: '',
          targetAudience: 'All Users',
          priority: 'Standard',
          pinned: false
        });
        showToast('System announcement broadcast published.');
        loadAnnouncements();
      } else {
        showToast(res.error?.message || 'Failed to publish announcement.');
      }
    } catch (err: any) {
      showToast(err.message || 'Error creating announcement.');
    }
  };

  // Delete Broadcast
  const handleDeleteBroadcast = async (id: string, title: string) => {
    try {
      const res = await api.deleteAnnouncement(id);
      if (res.success) {
        showToast(`Announcement "${title}" removed.`);
        loadAnnouncements();
      } else {
        showToast(res.error?.message || 'Failed to delete announcement.');
      }
    } catch (err: any) {
      showToast(err.message || 'Error deleting announcement.');
    }
  };

  if (loading) {
    return (
      <Card className="p-12 text-center flex flex-col items-center justify-center space-y-3">
        <RefreshCw className="w-8 h-8 text-blue-500 animate-spin" />
        <p className={`text-xs font-bold ${t.textMuted}`}>Loading System Announcement broadcasts...</p>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-8 text-center flex flex-col items-center justify-center space-y-4 border-rose-500/20 bg-rose-500/5">
        <AlertCircle className="w-8 h-8 text-rose-500" />
        <div className="space-y-1">
          <p className="text-sm font-bold text-rose-500">Failed to load announcements</p>
          <p className={`text-xs ${t.textSub}`}>{error}</p>
        </div>
        <Button onClick={loadAnnouncements} variant="secondary" size="sm" leftIcon={<RefreshCw className="w-3.5 h-3.5" />}>
          Retry Connection
        </Button>
      </Card>
    );
  }

  return (
    <div className="space-y-6 text-left">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight">System Broadcasts & Announcements</h2>
          <p className={`text-xs mt-1 ${t.textSub}`}>Dispatch urgent platform banners, maintenance updates, and rank target messages.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={loadAnnouncements} variant="secondary" size="sm" leftIcon={<RefreshCw className="w-3.5 h-3.5" />}>
            Sync Feeds
          </Button>
          <Button
            onClick={() => setIsAddOpen(true)}
            className="flex items-center gap-1.5"
            leftIcon={<Megaphone className="w-4 h-4" />}
          >
            Create Broadcast
          </Button>
        </div>
      </div>

      {/* Broadcast Feed list */}
      <div className="space-y-4">
        {broadcasts.length === 0 ? (
          <Card className={`p-12 text-center font-medium ${t.textMuted}`}>
            No system broadcasts or announcements published.
          </Card>
        ) : (
          broadcasts.map((bc) => (
            <Card key={bc.id} className="p-5 relative overflow-hidden text-left">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-2 max-w-2xl">
                  <div className="flex items-center gap-2 flex-wrap">
                    {bc.pinned && (
                      <span className="p-1 rounded-md bg-amber-500/10 text-amber-500" title="Pinned to Top">
                        <Pin className="w-3.5 h-3.5" />
                      </span>
                    )}
                    <Badge variant={bc.priority === 'Urgent' ? 'rose' : bc.priority === 'Standard' ? 'blue' : 'neutral'}>
                      {bc.priority} Priority
                    </Badge>
                    <Badge variant="purple">
                      Audience: {bc.targetAudience}
                    </Badge>
                    <span className={`text-[10px] font-mono font-medium flex items-center gap-1 ${t.textMuted}`}>
                      <Clock className="w-3 h-3" />
                      {bc.createdAt}
                    </span>
                  </div>

                  <h4 className="font-display font-bold text-base tracking-tight">{bc.title || (bc as any).headline}</h4>
                  <p className={`text-xs leading-relaxed ${t.textSub}`}>{bc.message || (bc as any).content}</p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleDeleteBroadcast(bc.id, bc.title || (bc as any).headline || 'Announcement')}
                    className="p-2 rounded-xl text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                    title="Delete Announcement"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Add Broadcast Modal Overlay */}
      {isAddOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0" onClick={() => setIsAddOpen(false)} />
          <div className={`rounded-3xl border p-6 shadow-2xl max-w-md w-full relative z-10 text-left space-y-5 backdrop-blur-xl ${
            isDark ? 'bg-[#0f112e]' : 'bg-white'
          } ${t.sep}`}>
            <div className={`flex items-center justify-between pb-3 border-b ${t.sep}`}>
              <h3 className="text-sm font-bold flex items-center gap-2">
                <Megaphone className="w-4 h-4 text-purple-500" />
                <span>Publish Platform Announcement</span>
              </h3>
              <button onClick={() => setIsAddOpen(false)} className={`p-1 rounded-lg hover:bg-black/5 cursor-pointer ${t.textMuted}`}>
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateBroadcast} className="space-y-4">
              <Input
                label="Headline Title"
                placeholder="e.g. Scheduled Network Upgrade"
                value={newBroadcast.title}
                onChange={e => setNewBroadcast(prev => ({ ...prev, title: e.target.value }))}
                required
              />

              <div className="space-y-1">
                <label className={`block text-xs font-bold ${t.textSub}`}>Broadcast Message Body</label>
                <textarea
                  rows={3}
                  className={`w-full rounded-2xl p-3 text-xs border outline-none focus:ring-2 focus:ring-blue-500/50 transition-all ${
                    isDark ? 'bg-black/30 border-white/10 text-white' : 'bg-white border-gray-200 text-gray-900'
                  }`}
                  placeholder="Type official notification text..."
                  value={newBroadcast.message}
                  onChange={e => setNewBroadcast(prev => ({ ...prev, message: e.target.value }))}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Select
                  label="Target Audience"
                  value={newBroadcast.targetAudience}
                  onChange={e => setNewBroadcast(prev => ({ ...prev, targetAudience: e.target.value }))}
                  options={[
                    { value: 'All Users', label: 'All Registered Members' },
                    { value: 'VIP Leaders', label: 'VIP Leaders Only' },
                    { value: 'Bronze & Above', label: 'Bronze & Above' }
                  ]}
                />
                <Select
                  label="Priority Level"
                  value={newBroadcast.priority}
                  onChange={e => setNewBroadcast(prev => ({ ...prev, priority: e.target.value as any }))}
                  options={[
                    { value: 'Standard', label: 'Standard Notice' },
                    { value: 'Urgent', label: 'Urgent Banner' },
                    { value: 'Low', label: 'Low Info' }
                  ]}
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="pinNotice"
                  checked={newBroadcast.pinned}
                  onChange={e => setNewBroadcast(prev => ({ ...prev, pinned: e.target.checked }))}
                  className="rounded text-blue-500 cursor-pointer"
                />
                <label htmlFor="pinNotice" className={`text-xs font-bold cursor-pointer ${t.textSub}`}>
                  Pin announcement to top of user dashboard feed
                </label>
              </div>

              <div className="flex gap-3 pt-3">
                <Button type="button" variant="secondary" onClick={() => setIsAddOpen(false)} className="flex-1">
                  Cancel
                </Button>
                <Button type="submit" variant="primary" className="flex-1">
                  Publish Broadcast
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {toastMessage && (
        <Toast
          message={toastMessage}
          variant="success"
          onClose={() => setToastMessage(null)}
        />
      )}
    </div>
  );
};
export default AnnouncementsView;
