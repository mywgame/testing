/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  Headphones,
  X,
  Send,
  User,
  Mail,
  ChevronLeft,
  MessageSquare,
  Sparkles,
  AlertCircle,
  Clock,
  CheckCircle2
} from 'lucide-react';
import { api } from '../../services/api.ts';
import { useTheme } from '../../hooks/useTheme.ts';

interface FloatingSupportWidgetProps {
  isDark?: boolean;
}

interface GuestTicket {
  id: string;
  ticketNumber: string;
  category: string;
  subject: string;
  description: string;
  status: string;
  priority: string;
  createdAt: string;
}

interface SupportMessage {
  id: string;
  ticketId: string;
  senderType: 'USER' | 'ADMIN' | 'SYSTEM' | 'GUEST';
  senderName?: string;
  message: string;
  createdAt: string;
}

export const FloatingSupportWidget: React.FC<FloatingSupportWidgetProps> = ({ isDark: propIsDark }) => {
  const themeContext = useTheme();
  const isDark = propIsDark !== undefined ? propIsDark : themeContext.isDark;

  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [guestSessionId, setGuestSessionId] = useState<string>('');
  
  // Navigation inside chat widget: 'FORM' | 'CHAT'
  const [view, setView] = useState<'FORM' | 'CHAT'>('FORM');
  
  // Tickets & Chat state
  const [tickets, setTickets] = useState<GuestTicket[]>([]);
  const [activeTicket, setActiveTicket] = useState<GuestTicket | null>(null);
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [newMessage, setNewMessage] = useState<string>('');
  const [isSending, setIsSending] = useState<boolean>(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState<boolean>(false);
  const [hasUnread, setHasUnread] = useState<boolean>(false);

  // New Ticket Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    description: '',
  });
  const [isSubmittingTicket, setIsSubmittingTicket] = useState<boolean>(false);
  const [formError, setFormError] = useState<string>('');

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const [mounted, setMounted] = useState<boolean>(false);
  const [isScrolledPastHero, setIsScrolledPastHero] = useState<boolean>(false);
  const [scrollProgress, setScrollProgress] = useState<number>(0);

  // Detect scroll past Hero section and calculate page scroll progress
  useEffect(() => {
    const checkScrollPosition = () => {
      const scrollY = window.scrollY || window.pageYOffset || 0;
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = scrollHeight > 0 ? Math.min(100, Math.max(0, (scrollY / scrollHeight) * 100)) : 0;
      setScrollProgress(progress);

      const hero = document.getElementById('hero');
      if (hero) {
        const heroRect = hero.getBoundingClientRect();
        const pastHero = heroRect.bottom <= 220 || scrollY > 320;
        setIsScrolledPastHero(pastHero);
      } else {
        setIsScrolledPastHero(scrollY > 280);
      }
    };

    checkScrollPosition();
    window.addEventListener('scroll', checkScrollPosition, { passive: true });
    window.addEventListener('resize', checkScrollPosition, { passive: true });
    return () => {
      window.removeEventListener('scroll', checkScrollPosition);
      window.removeEventListener('resize', checkScrollPosition);
    };
  }, []);

  // Initialize or retrieve Guest Session ID
  useEffect(() => {
    setMounted(true);
    let sid = localStorage.getItem('metafirm_guest_session_id');
    if (!sid) {
      sid = 'guest_' + Math.random().toString(36).substring(2, 11) + '_' + Date.now();
      localStorage.setItem('metafirm_guest_session_id', sid);
    }
    setGuestSessionId(sid);

    // Restore cached contact details
    const savedName = localStorage.getItem('metafirm_guest_name') || '';
    const savedEmail = localStorage.getItem('metafirm_guest_email') || '';
    setFormData(prev => ({ ...prev, name: savedName, email: savedEmail }));

    fetchGuestTickets(sid);
  }, []);

  // Poll for messages when chat view is active
  useEffect(() => {
    if (isOpen && view === 'CHAT' && activeTicket && guestSessionId) {
      loadMessages(activeTicket.id, guestSessionId);
      const interval = setInterval(() => {
        loadMessages(activeTicket.id, guestSessionId, true);
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [isOpen, view, activeTicket, guestSessionId]);

  // Scroll to bottom when messages update
  useEffect(() => {
    if (view === 'CHAT') {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, view]);

  const fetchGuestTickets = async (sid: string) => {
    try {
      const res = await api.getGuestTickets(sid);
      if (res.success && Array.isArray(res.data)) {
        setTickets(res.data);
        if (res.data.length > 0 && !activeTicket) {
          const openTicket = res.data.find((t: any) => t.status === 'OPEN' || t.status === 'IN_PROGRESS') || res.data[0];
          setActiveTicket(openTicket);
        }
      }
    } catch (err) {
      console.error('Failed to load guest tickets:', err);
    }
  };

  const loadMessages = async (ticketId: string, sid: string, isPolling = false) => {
    if (!isPolling) setIsLoadingMessages(true);
    try {
      const res = await api.getGuestTicketMessages(ticketId, sid);
      if (res.success && Array.isArray(res.data)) {
        if (messages.length > 0 && res.data.length > messages.length) {
          const lastMsg = res.data[res.data.length - 1];
          if (lastMsg.senderType === 'ADMIN') {
            setHasUnread(true);
          }
        }
        setMessages(res.data);
      }
    } catch (err) {
      console.error('Failed to load guest messages:', err);
    } finally {
      if (!isPolling) setIsLoadingMessages(false);
    }
  };

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setFormError('Please enter your name or username.');
      return;
    }
    if (!formData.email.trim() || !formData.email.includes('@')) {
      setFormError('Please enter a valid email address.');
      return;
    }
    if (!formData.description.trim()) {
      setFormError('Please describe your issue or question.');
      return;
    }

    setIsSubmittingTicket(true);
    setFormError('');

    try {
      if (formData.name) localStorage.setItem('metafirm_guest_name', formData.name.trim());
      if (formData.email) localStorage.setItem('metafirm_guest_email', formData.email.trim());

      const autoSubject = formData.subject.trim() || `Inquiry from ${formData.name.trim()}`;

      const res = await api.createGuestSupportInquiry({
        guestSessionId,
        guestName: formData.name.trim(),
        guestEmail: formData.email.trim(),
        category: 'GENERAL',
        subject: autoSubject,
        description: formData.description.trim(),
      });

      if (res.success && res.data) {
        const createdTicket = res.data;
        setActiveTicket(createdTicket);
        setTickets(prev => [createdTicket, ...prev]);
        setView('CHAT');
        loadMessages(createdTicket.id, guestSessionId);
        setFormData(prev => ({ ...prev, subject: '', description: '' }));
      } else {
        setFormError(res.error?.message || 'Failed to submit inquiry. Please try again.');
      }
    } catch (err: any) {
      setFormError(err.message || 'An error occurred. Please try again.');
    } finally {
      setIsSubmittingTicket(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeTicket || isSending) return;

    const messageText = newMessage.trim();
    setNewMessage('');
    setIsSending(true);

    try {
      const res = await api.replyToGuestTicket(activeTicket.id, {
        guestSessionId,
        senderName: formData.name || activeTicket.subject || 'Guest Visitor',
        message: messageText,
      });

      if (res.success) {
        loadMessages(activeTicket.id, guestSessionId);
      }
    } catch (err) {
      console.error('Failed to send guest message:', err);
    } finally {
      setIsSending(false);
    }
  };

  if (!mounted || typeof document === 'undefined') {
    return null;
  }

  return createPortal(
    <>
      {/* Floating Trigger Button (Hidden on Hero, Appears after scrolling past Hero) */}
      <div
        className={`fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-[9999] flex items-center gap-3 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          isScrolledPastHero || isOpen
            ? 'opacity-100 translate-y-0 pointer-events-auto scale-100'
            : 'opacity-0 translate-y-6 pointer-events-none scale-90'
        }`}
      >
        {!isOpen && (
          <div className="hidden md:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/90 dark:bg-navy-900/90 text-white text-[11px] shadow-2xl border border-white/15 backdrop-blur-xl animate-fade-in pointer-events-none select-none">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-bold tracking-wide text-slate-200 font-sans">24/7 Support Desk</span>
          </div>
        )}

        {/* Trigger Button with Circular Scroll Progress Ring */}
        <div className="relative group">
          {/* Circular SVG Scroll Progress Ring */}
          {!isOpen && (
            <svg
              className="absolute -inset-1.5 sm:-inset-2 w-[calc(100%+12px)] sm:w-[calc(100%+16px)] h-[calc(100%+12px)] sm:h-[calc(100%+16px)] pointer-events-none -rotate-90 z-0 transition-opacity duration-300"
              viewBox="0 0 100 100"
            >
              <defs>
                <linearGradient id="supportScrollProgressGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#E91E8C" />
                  <stop offset="50%" stopColor="#1565F0" />
                  <stop offset="100%" stopColor="#29ABE2" />
                </linearGradient>
              </defs>

              {/* Background Track Ring */}
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="currentColor"
                strokeWidth="3.5"
                className="text-slate-300/30 dark:text-white/10"
              />

              {/* Animated Progress Arc */}
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="url(#supportScrollProgressGrad)"
                strokeWidth="3.8"
                strokeLinecap="round"
                strokeDasharray={2 * Math.PI * 45}
                strokeDashoffset={2 * Math.PI * 45 * (1 - scrollProgress / 100)}
                className="transition-[stroke-dashoffset] duration-150 ease-out"
                style={{
                  filter: 'drop-shadow(0 0 4px rgba(233, 30, 140, 0.6))',
                }}
              />
            </svg>
          )}

          <button
            onClick={() => {
              setIsOpen(!isOpen);
              if (!isOpen) {
                setHasUnread(false);
              }
            }}
            className={`relative z-10 w-13 h-13 sm:w-14 sm:h-14 rounded-full flex items-center justify-center transition-all duration-300 transform hover:scale-105 active:scale-95 cursor-pointer touch-manipulation focus:outline-none ${
              isOpen
                ? 'bg-slate-900 dark:bg-navy-900 text-white rotate-90 border border-white/20 shadow-2xl'
                : 'bg-brand-gradient text-white shadow-[0_12px_32px_-4px_rgba(233,30,140,0.55),0_6px_16px_rgba(21,101,240,0.35)] hover:shadow-[0_16px_36px_-2px_rgba(233,30,140,0.7),0_8px_20px_rgba(41,171,226,0.45)] ring-2 ring-white/25 hover:ring-white/50'
            }`}
            aria-label="Open Live Support"
            title={isOpen ? 'Close Support' : `Open Live Support (${Math.round(scrollProgress)}% scrolled)`}
          >
            {isOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <>
                <Headphones className="w-6 h-6 drop-shadow-md" />
                {hasUnread && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-extrabold rounded-full flex items-center justify-center border-2 border-slate-950 shadow-md animate-bounce">
                    1
                  </span>
                )}
              </>
            )}
          </button>
        </div>
      </div>

      {/* Slide-Up Support Desk Window */}
      {isOpen && (
        <div
          className="fixed bottom-20 sm:bottom-24 right-3 sm:right-6 left-3 sm:left-auto w-auto sm:w-[410px] max-w-[calc(100vw-1.5rem)] max-h-[85vh] sm:max-h-[580px] h-[520px] sm:h-[550px] rounded-3xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.7),0_0_40px_rgba(233,30,140,0.2)] flex flex-col overflow-hidden border border-slate-200/80 dark:border-white/15 bg-white/95 dark:bg-navy-950/95 text-slate-900 dark:text-slate-100 backdrop-blur-2xl z-[9999] animate-scale-up"
        >
          {/* Top MetaFirm Signature Gradient Strip */}
          <div className="h-1.5 w-full bg-brand-gradient shrink-0" />

          {/* Header */}
          <div className="bg-slate-50/90 dark:bg-navy-900/90 px-4 py-3.5 border-b border-slate-200 dark:border-white/10 flex items-center justify-between shrink-0 backdrop-blur-md">
            <div className="flex items-center gap-3">
              {view === 'CHAT' && (
                <button
                  onClick={() => setView('FORM')}
                  className="p-1.5 rounded-xl hover:bg-slate-200 dark:hover:bg-white/10 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
                  title="Back to New Inquiry"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
              )}
              
              <div className="w-9 h-9 rounded-xl bg-brand-gradient p-[1px] shadow-sm shrink-0">
                <div className="w-full h-full rounded-[11px] bg-slate-900 flex items-center justify-center text-white">
                  <Headphones className="w-4 h-4 text-brand-cyan" />
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-display font-bold text-sm text-slate-900 dark:text-white tracking-tight">
                    MetaFirm Support
                  </h3>
                  <span className="flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/25">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Online
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-ink-300 font-medium">
                  Guest & Visitor Live Assistance
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-white/10 transition-colors cursor-pointer"
              title="Close support desk"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body Content */}
          <div className="flex-1 overflow-y-auto flex flex-col bg-slate-50/40 dark:bg-navy-950/60">
            {/* VIEW: DIRECT INQUIRY FORM */}
            {view === 'FORM' && (
              <form onSubmit={handleCreateTicket} className="p-4 sm:p-5 flex flex-col gap-4 flex-1 justify-between">
                <div className="space-y-3.5">
                  {/* Active chat shortcut if previous ticket exists */}
                  {tickets.length > 0 && (
                    <div className="flex items-center justify-between p-3 rounded-2xl bg-brand-blue/10 dark:bg-brand-blue/15 border border-brand-blue/20 dark:border-brand-cyan/25 text-xs backdrop-blur-sm">
                      <div className="flex items-center gap-2">
                        <MessageSquare className="w-4 h-4 text-brand-blue dark:text-brand-cyan shrink-0" />
                        <span className="text-[11px] font-medium text-slate-700 dark:text-ink-300">
                          Active conversation thread found
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const latestTicket = tickets[0];
                          setActiveTicket(latestTicket);
                          setView('CHAT');
                        }}
                        className="text-[11px] font-bold text-brand-blue dark:text-brand-cyan hover:underline cursor-pointer flex items-center gap-1 font-mono"
                      >
                        Resume Chat →
                      </button>
                    </div>
                  )}

                  {/* Contact Inputs */}
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                        Your Name / Username <span className="text-brand-magenta">*</span>
                      </label>
                      <div className="relative">
                        <User className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3.5 top-3 pointer-events-none" />
                        <input
                          type="text"
                          placeholder="e.g. Alex Trader"
                          value={formData.name}
                          onChange={e => setFormData({ ...formData, name: e.target.value })}
                          required
                          className="w-full bg-white dark:bg-navy-900/80 border border-slate-300/80 dark:border-white/15 rounded-2xl pl-10 pr-4 py-2.5 text-xs sm:text-sm font-medium text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-blue/30 focus:border-brand-blue-light transition-all shadow-sm"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                        Email Address <span className="text-brand-magenta">*</span>
                      </label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3.5 top-3 pointer-events-none" />
                        <input
                          type="email"
                          placeholder="investor@example.com"
                          value={formData.email}
                          onChange={e => setFormData({ ...formData, email: e.target.value })}
                          required
                          className="w-full bg-white dark:bg-navy-900/80 border border-slate-300/80 dark:border-white/15 rounded-2xl pl-10 pr-4 py-2.5 text-xs sm:text-sm font-medium text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-blue/30 focus:border-brand-blue-light transition-all shadow-sm"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                        Describe your problem <span className="text-brand-magenta">*</span>
                      </label>
                      <textarea
                        rows={3}
                        placeholder="Please explain the issue or question in detail..."
                        value={formData.description}
                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                        required
                        className="w-full bg-white dark:bg-navy-900/80 border border-slate-300/80 dark:border-white/15 rounded-2xl p-3.5 text-xs sm:text-sm font-medium text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-blue/30 focus:border-brand-blue-light resize-none transition-all shadow-sm min-h-[105px]"
                      />
                    </div>
                  </div>

                  {formError && (
                    <div className="text-xs text-red-600 dark:text-red-400 bg-red-500/10 border border-red-500/20 p-2.5 rounded-xl flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{formError}</span>
                    </div>
                  )}
                </div>

                {/* Submit Action Button */}
                <button
                  type="submit"
                  disabled={isSubmittingTicket}
                  className="w-full py-3.5 px-5 rounded-2xl bg-brand-gradient text-white text-xs sm:text-sm font-bold shadow-[0_10px_25px_-5px_rgba(233,30,140,0.45)] hover:shadow-[0_14px_30px_-3px_rgba(233,30,140,0.6)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed mt-2"
                >
                  {isSubmittingTicket ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Connecting Specialist...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Start Live Support Chat</span>
                    </>
                  )}
                </button>
              </form>
            )}

            {/* VIEW: LIVE CHAT */}
            {view === 'CHAT' && activeTicket && (
              <div className="flex-1 flex flex-col h-full">
                {/* Active Ticket Banner */}
                <div className="bg-slate-100/90 dark:bg-navy-900/90 px-4 py-2.5 border-b border-slate-200 dark:border-white/10 flex items-center justify-between text-xs backdrop-blur-sm">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-brand-blue dark:text-brand-cyan font-bold text-xs bg-brand-blue/10 dark:bg-brand-cyan/10 px-2 py-0.5 rounded-lg">
                      {activeTicket.ticketNumber}
                    </span>
                    <span className="text-slate-700 dark:text-slate-200 font-semibold truncate max-w-[180px]">
                      {activeTicket.subject}
                    </span>
                  </div>
                  <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                    activeTicket.status === 'OPEN'
                      ? 'bg-amber-500/20 text-amber-600 dark:text-amber-300 border border-amber-500/30'
                      : activeTicket.status === 'RESOLVED'
                      ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 border border-emerald-500/30'
                      : 'bg-slate-200 dark:bg-navy-800 text-slate-600 dark:text-slate-400'
                  }`}>
                    {activeTicket.status}
                  </span>
                </div>

                {/* Messages List */}
                <div className="flex-1 p-4 overflow-y-auto space-y-3">
                  {isLoadingMessages && messages.length === 0 ? (
                    <div className="py-14 text-center">
                      <div className="w-5 h-5 border-2 border-brand-magenta border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Connecting with support specialist...</p>
                    </div>
                  ) : (
                    <>
                      {/* Initial description message */}
                      <div className="flex justify-start">
                        <div className="max-w-[85%] rounded-2xl rounded-tl-none p-3 text-xs bg-white dark:bg-navy-900 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-slate-200 shadow-sm">
                          <div className="flex items-center justify-between gap-3 text-[10px] text-slate-400 dark:text-slate-500 mb-1.5 border-b border-slate-100 dark:border-white/5 pb-1">
                            <span className="font-bold text-slate-700 dark:text-slate-300">{formData.name || 'You (Guest)'}</span>
                            <span className="font-mono">{new Date(activeTicket.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                          <p className="whitespace-pre-wrap leading-relaxed">{activeTicket.description}</p>
                        </div>
                      </div>

                      {/* Thread Replies */}
                      {messages
                        .filter(m => m.message !== activeTicket.description)
                        .map(msg => {
                          const isAgent = msg.senderType === 'ADMIN' || msg.senderType === 'SYSTEM';
                          return (
                            <div
                              key={msg.id}
                              className={`flex ${isAgent ? 'justify-start' : 'justify-end'}`}
                            >
                              <div
                                className={`max-w-[85%] rounded-2xl p-3 text-xs shadow-md ${
                                  isAgent
                                    ? 'bg-gradient-to-r from-slate-900 to-navy-900 text-white border border-brand-cyan/30 rounded-tl-none'
                                    : 'bg-brand-gradient text-white rounded-tr-none'
                                }`}
                              >
                                <div className="flex items-center justify-between gap-3 text-[10px] opacity-80 mb-1 border-b border-white/15 pb-1">
                                  <span className="font-bold">
                                    {isAgent ? 'MetaFirm Support Specialist' : (msg.senderName || 'You')}
                                  </span>
                                  <span className="font-mono">{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                </div>
                                <p className="whitespace-pre-wrap leading-relaxed font-sans">{msg.message}</p>
                              </div>
                            </div>
                          );
                        })}
                      <div ref={messagesEndRef} />
                    </>
                  )}
                </div>

                {/* Reply Box */}
                {activeTicket.status !== 'CLOSED' && activeTicket.status !== 'RESOLVED' ? (
                  <form onSubmit={handleSendMessage} className="p-3 bg-slate-100/90 dark:bg-navy-900/90 border-t border-slate-200 dark:border-white/10 flex gap-2 backdrop-blur-sm">
                    <input
                      type="text"
                      placeholder="Type your message..."
                      value={newMessage}
                      onChange={e => setNewMessage(e.target.value)}
                      disabled={isSending}
                      className="flex-1 bg-white dark:bg-navy-950 border border-slate-300 dark:border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-blue/30 focus:border-brand-blue-light"
                    />
                    <button
                      type="submit"
                      disabled={isSending || !newMessage.trim()}
                      className="p-2.5 rounded-xl bg-brand-gradient text-white disabled:opacity-40 transition-all hover:scale-105 active:scale-95 cursor-pointer flex items-center justify-center shadow-md shadow-brand-magenta/25"
                    >
                      {isSending ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Send className="w-4 h-4" />
                      )}
                    </button>
                  </form>
                ) : (
                  <div className="p-3 bg-slate-100 dark:bg-navy-900 border-t border-slate-200 dark:border-white/10 text-center text-xs text-slate-500 dark:text-slate-400">
                    This inquiry has been settled. Click{' '}
                    <button type="button" onClick={() => setView('FORM')} className="text-brand-blue dark:text-brand-cyan underline font-bold">
                      here
                    </button>{' '}
                    to start a new inquiry.
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </>,
    document.body
  );
};

export default FloatingSupportWidget;


