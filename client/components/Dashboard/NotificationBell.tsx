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

  // Poll for notifications every 10 seconds to mimic real-time
  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 10000);
    return () => clearInterval(interval);
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
            className="absolute -top-1 -right-1 flex h-4 min-w-[16px] px-1 items-center justify-center rounded-full bg-rose-500 text-[9px] font-bold text-white border border-slate-900 animate-pulse"
            id="notification-badge"
          >
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div
          className={`fixed left-1/2 -translate-x-1/2 top-16 w-72 md:absolute md:right-0 md:left-auto md:translate-x-0 md:top-auto md:mt-2.5 md:w-96 rounded-2xl border p-3 shadow-2xl z-50 backdrop-blur-xl animate-in fade-in slide-in-from-top-2 duration-200 text-left ${t.card} ${t.sep}`}
          id="notification-dropdown"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/5">
            <div className="flex items-center gap-2">
              <span className={`font-bold text-sm ${t.text}`}>Notifications</span>
              {unreadCount > 0 && (
                <span className="text-[10px] bg-cyan-500/10 text-cyan-400 px-1.5 py-0.5 rounded-full font-mono font-semibold">
                  {unreadCount} new
                </span>
              )}
            </div>
            {notifications.length > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="flex items-center gap-1 text-[11px] font-bold text-cyan-400 hover:text-cyan-300 cursor-pointer focus:outline-none transition-colors"
                title="Mark all as read"
                id="notification-mark-all-read"
              >
                <CheckSquare className="w-3.5 h-3.5" />
                <span>Mark all read</span>
              </button>
            )}
          </div>

          {/* List Content */}
          <div className="max-h-80 overflow-y-auto space-y-1.5 pr-0.5" id="notification-list">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center px-4">
                <Bell className="w-8 h-8 text-slate-500/40 mb-2.5" />
                <p className="text-xs text-slate-500 font-medium">You have no notifications yet</p>
                <p className="text-[10px] text-slate-600 mt-1 leading-normal">
                  Platform events such as deposits, rewards, and support replies will appear here.
                </p>
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  onClick={(e) => handleMarkSingleRead(n.id, e)}
                  className={`relative flex gap-3 p-2.5 rounded-xl border transition-all duration-300 hover:bg-white/5 cursor-pointer group ${
                    n.read 
                      ? 'bg-transparent border-transparent opacity-75' 
                      : 'bg-white/[0.02] border-cyan-500/10'
                  }`}
                  id={`notification-item-${n.id}`}
                >
                  {/* Priority Indicator */}
                  {!n.read && (
                    <span
                      className={`absolute left-0.5 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full ${
                        n.priority === 'URGENT' || n.priority === 'HIGH' ? 'bg-rose-500' : 'bg-cyan-500'
                      }`}
                    />
                  )}

                  {/* Icon */}
                  <div className={`p-1.5 rounded-lg shrink-0 h-8 w-8 flex items-center justify-center ${
                    n.read ? 'bg-slate-800/20' : 'bg-cyan-500/5'
                  }`}>
                    {getNotificationIcon(n.icon)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0 text-left">
                    <div className="flex items-start justify-between gap-2">
                      <p className={`text-xs font-semibold truncate leading-snug ${n.read ? 'text-slate-400' : t.text}`}>
                        {n.title}
                      </p>
                      <span className="text-[9px] font-mono text-slate-500 shrink-0 whitespace-nowrap">
                        {formatTime(n.createdAt)}
                      </span>
                    </div>
                    <p className={`text-[11px] leading-relaxed mt-0.5 break-words ${n.read ? 'text-slate-500' : 'text-slate-400'}`}>
                      {n.description}
                    </p>
                  </div>

                  {/* Inline Action Buttons (Dismiss/Read) */}
                  <div className="flex flex-col items-center justify-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-1">
                    {!n.read && (
                      <button
                        onClick={(e) => handleMarkSingleRead(n.id, e)}
                        className="p-1 rounded bg-slate-800 hover:bg-cyan-500/20 hover:text-cyan-400 text-slate-400 transition-all cursor-pointer focus:outline-none"
                        title="Mark as read"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button
                      onClick={(e) => handleDeleteNotification(n.id, e)}
                      className="p-1 rounded bg-slate-800 hover:bg-rose-500/20 hover:text-rose-400 text-slate-400 transition-all cursor-pointer focus:outline-none"
                      title="Delete"
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
