/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  Bell,
  ArrowDownCircle,
  ArrowUpCircle,
  ShieldAlert,
  Sparkles,
  MessageSquare,
  Award,
  Key,
  Trash2,
  Check,
  CheckSquare,
  X
} from 'lucide-react';
import { useTheme } from '../../hooks/useTheme.ts';
import { api } from '../../services/api.ts';
import { formatNotificationText } from '../../utils/index.ts';

interface NotificationData {
  id: string;
  message: string;
  read: boolean;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  createdAt: string;
}

interface ParsedNotification {
  id: string;
  title: string;
  description: string;
  icon: string;
  type: string;
  read: boolean;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  createdAt: string;
}

export const NotificationBell: React.FC = () => {
  const { t } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<ParsedNotification[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Parse structured or simple notification payloads safely
  const parseNotification = (n: NotificationData): ParsedNotification => {
    try {
      if (n.message.startsWith('{')) {
        const parsed = JSON.parse(n.message);
        return {
          id: n.id,
          title: formatNotificationText(parsed.title || 'Notification'),
          description: formatNotificationText(parsed.description || ''),
          icon: parsed.icon || 'Bell',
          type: parsed.type || 'system',
          read: n.read,
          priority: n.priority,
          createdAt: n.createdAt,
        };
      }
    } catch (err) {
      // Fail-safe
    }
    return {
      id: n.id,
      title: 'System Update',
      description: formatNotificationText(n.message),
      icon: 'Bell',
      type: 'system',
      read: n.read,
      priority: n.priority,
      createdAt: n.createdAt,
    };
  };

  // Fetch user notifications from API
  const fetchNotifications = async () => {
    const token = localStorage.getItem('metafirm_token');
    if (!token) return;
    try {
      const response = await api.getNotifications();
      if (response.success && response.data) {
        const rawList = response.data as NotificationData[];
        const parsedList = rawList.map(parseNotification);
        setNotifications(parsedList);
      }
    } catch (error) {
      console.error('Failed to load notifications:', error);
    }
  };

  // Poll for notifications periodically when tab is active (60s interval instead of 10s to conserve DB compute)
  useEffect(() => {
    fetchNotifications();

    const interval = setInterval(() => {
      if (typeof document !== 'undefined' && document.visibilityState === 'visible') {
        fetchNotifications();
      }
    }, 60000);

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchNotifications();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // Handle outside clicks to close the dropdown
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [isOpen]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleMarkAllRead = async () => {
    try {
      const response = await api.markAllNotificationsRead();
      if (response.success) {
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      }
    } catch (error) {
      console.error('Error marking all read:', error);
    }
  };

  const handleMarkSingleRead = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const response = await api.markNotificationRead(id);
      if (response.success) {
        setNotifications((prev) =>
          prev.map((n) => (n.id === id ? { ...n, read: true } : n))
        );
      }
    } catch (error) {
      console.error('Error marking read:', error);
    }
  };

  const handleDeleteNotification = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const response = await api.deleteNotification(id);
      if (response.success) {
        setNotifications((prev) => prev.filter((n) => n.id !== id));
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const getNotificationIcon = (iconName: string) => {
    switch (iconName) {
      case 'ArrowDownCircle':
        return <ArrowDownCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />;
      case 'ArrowUpCircle':
        return <ArrowUpCircle className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />;
      case 'ShieldAlert':
        return <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />;
      case 'Sparkles':
        return <Sparkles className="w-4 h-4 text-yellow-400 shrink-0 mt-0.5" />;
      case 'MessageSquare':
        return <MessageSquare className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />;
      case 'Award':
        return <Award className="w-4 h-4 text-violet-400 shrink-0 mt-0.5" />;
      case 'Key':
        return <Key className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />;
      default:
        return <Bell className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />;
    }
  };

  const formatTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHrs = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHrs / 24);

      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHrs < 24) return `${diffHrs}h ago`;
      if (diffDays < 7) return `${diffDays}d ago`;
      return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    } catch {
      return '';
    }
  };

  return (
    <div className="relative" ref={dropdownRef} id="notification-bell-container">
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center justify-center p-2 rounded-2xl border transition-all duration-300 relative cursor-pointer focus:outline-none ${t.pill} ${t.pillHover} text-cyan-500`}
        title="Notifications"
        id="notification-bell-button"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span
            className="absolute -top-1 -right-1 flex h-4 min-w-[16px] px-1 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white shadow-md border border-slate-900 animate-pulse"
            id="notification-badge"
          >
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div
          className={`fixed left-1/2 -translate-x-1/2 top-16 w-[92vw] max-w-[400px] md:absolute md:right-0 md:left-auto md:translate-x-0 md:top-auto md:mt-2.5 md:w-[420px] rounded-3xl border p-4 shadow-2xl z-50 transition-all duration-200 text-left ${
            t.isDark
              ? 'bg-[#0f132e]/98 border-purple-500/30 text-white shadow-purple-950/80 backdrop-blur-2xl'
              : 'bg-white/98 border-purple-200 text-slate-900 shadow-xl shadow-purple-900/10 backdrop-blur-2xl'
          }`}
          id="notification-dropdown"
        >
          {/* Header */}
          <div
            className={`flex items-center justify-between pb-3 mb-3 border-b ${
              t.isDark ? 'border-white/10' : 'border-slate-200'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <span className={`font-bold text-base tracking-tight ${t.isDark ? 'text-white' : 'text-slate-900'}`}>
                Notifications
              </span>
              {unreadCount > 0 && (
                <span className="text-[11px] bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 px-2 py-0.5 rounded-full font-mono font-bold">
                  {unreadCount} new
                </span>
              )}
            </div>
            {notifications.length > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="flex items-center gap-1.5 text-xs font-bold text-cyan-400 hover:text-cyan-300 cursor-pointer focus:outline-none transition-colors px-2 py-1 rounded-lg hover:bg-cyan-500/10"
                title="Mark all as read"
                id="notification-mark-all-read"
              >
                <CheckSquare className="w-3.5 h-3.5" />
                <span>Mark all read</span>
              </button>
            )}
          </div>

          {/* List Content */}
          <div className="max-h-[380px] overflow-y-auto space-y-2.5 pr-1 custom-scrollbar" id="notification-list">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center px-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-3 ${
                  t.isDark ? 'bg-white/5 text-slate-400' : 'bg-slate-100 text-slate-500'
                }`}>
                  <Bell className="w-6 h-6 opacity-60" />
                </div>
                <p className={`text-sm font-semibold ${t.isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  No notifications yet
                </p>
                <p className={`text-xs mt-1 leading-relaxed max-w-xs ${t.isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Platform updates, daily claim yields, and security alerts will appear here.
                </p>
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  onClick={(e) => handleMarkSingleRead(n.id, e)}
                  className={`relative flex items-start gap-3 p-3.5 rounded-2xl border transition-all duration-200 cursor-pointer group ${
                    t.isDark
                      ? n.read
                        ? 'bg-white/[0.03] border-white/5 hover:bg-white/[0.06]'
                        : 'bg-cyan-950/20 border-cyan-500/30 hover:bg-cyan-950/30 shadow-lg shadow-cyan-950/20'
                      : n.read
                        ? 'bg-slate-50/80 border-slate-200/80 hover:bg-slate-100'
                        : 'bg-cyan-50/80 border-cyan-200 hover:bg-cyan-100/70 shadow-sm'
                  }`}
                  id={`notification-item-${n.id}`}
                >
                  {/* Priority Indicator */}
                  {!n.read && (
                    <span
                      className={`absolute left-1.5 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full shadow-sm ${
                        n.priority === 'URGENT' || n.priority === 'HIGH' ? 'bg-rose-500 animate-pulse' : 'bg-cyan-400'
                      }`}
                    />
                  )}

                  {/* Icon Container */}
                  <div
                    className={`p-2.5 rounded-xl shrink-0 h-10 w-10 flex items-center justify-center border ${
                      t.isDark
                        ? n.read
                          ? 'bg-white/5 border-white/10 text-slate-400'
                          : 'bg-cyan-500/15 border-cyan-400/30 text-cyan-300'
                        : n.read
                          ? 'bg-slate-200/60 border-slate-300/60 text-slate-600'
                          : 'bg-cyan-100 border-cyan-300 text-cyan-700'
                    }`}
                  >
                    {getNotificationIcon(n.icon)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0 text-left">
                    <div className="flex items-center justify-between gap-2">
                      <p
                        className={`text-xs sm:text-sm font-bold tracking-tight truncate leading-snug ${
                          t.isDark
                            ? n.read
                              ? 'text-slate-200'
                              : 'text-white'
                            : n.read
                              ? 'text-slate-800'
                              : 'text-slate-950 font-extrabold'
                        }`}
                      >
                        {n.title}
                      </p>
                      <span
                        className={`text-[10px] font-mono shrink-0 whitespace-nowrap font-medium ${
                          t.isDark ? 'text-slate-400' : 'text-slate-500'
                        }`}
                      >
                        {formatTime(n.createdAt)}
                      </span>
                    </div>
                    <p
                      className={`text-xs leading-relaxed mt-1 break-words font-normal ${
                        t.isDark
                          ? n.read
                            ? 'text-slate-300'
                            : 'text-slate-100 font-medium'
                          : n.read
                            ? 'text-slate-600'
                            : 'text-slate-800 font-medium'
                      }`}
                    >
                      {n.description}
                    </p>
                  </div>

                  {/* Inline Action Buttons (Dismiss/Read) */}
                  <div className="flex flex-col items-center justify-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-1">
                    {!n.read && (
                      <button
                        onClick={(e) => handleMarkSingleRead(n.id, e)}
                        className={`p-1.5 rounded-lg border transition-all cursor-pointer focus:outline-none ${
                          t.isDark
                            ? 'bg-slate-800 border-white/10 hover:bg-cyan-500/20 hover:text-cyan-300 text-slate-300'
                            : 'bg-white border-slate-300 hover:bg-cyan-50 hover:text-cyan-700 text-slate-600 shadow-sm'
                        }`}
                        title="Mark as read"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button
                      onClick={(e) => handleDeleteNotification(n.id, e)}
                      className={`p-1.5 rounded-lg border transition-all cursor-pointer focus:outline-none ${
                        t.isDark
                          ? 'bg-slate-800 border-white/10 hover:bg-rose-500/20 hover:text-rose-300 text-slate-300'
                          : 'bg-white border-slate-300 hover:bg-rose-50 hover:text-rose-700 text-slate-600 shadow-sm'
                      }`}
                      title="Delete notification"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
