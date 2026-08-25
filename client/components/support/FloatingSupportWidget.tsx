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
  ChevronLeft
} from 'lucide-react';
import { api } from '../../services/api.ts';

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

export const FloatingSupportWidget: React.FC<FloatingSupportWidgetProps> = ({ isDark = true }) => {
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

  // New Ticket Form State (Simplified: Name, Required Email, Problem Description)
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

  // Detect scroll past Hero section so widget is hidden on Hero and appears upon scrolling down
  useEffect(() => {
    const checkScrollPosition = () => {
      const hero = document.getElementById('hero');
      if (hero) {
        const heroRect = hero.getBoundingClientRect();
        // Visible once the hero section is scrolled past or scrollY exceeds 320px
        const pastHero = heroRect.bottom <= 220 || window.scrollY > 320;
        setIsScrolledPastHero(pastHero);
      } else {
        setIsScrolledPastHero(window.scrollY > 280);
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
          // If there's an open ticket, select it
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
          // New message received
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
      // Save contact details to local storage
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
        className={`fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-[9999] flex items-center gap-2.5 transition-all duration-400 ease-out ${
          isScrolledPastHero || isOpen
            ? 'opacity-100 translate-y-0 pointer-events-auto scale-100'
            : 'opacity-0 translate-y-6 pointer-events-none scale-90'
        }`}
      >
        {!isOpen && (
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/95 text-white text-[11px] shadow-xl border border-white/15 backdrop-blur-md animate-fade-in pointer-events-none select-none">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-semibold text-slate-200">24/7 Support</span>
          </div>
        )}

        <button
          onClick={() => {
            setIsOpen(!isOpen);
            if (!isOpen) {
              setHasUnread(false);
            }
          }}
          className={`relative w-12 h-12 sm:w-14 sm:h-14 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 transform hover:scale-105 active:scale-95 cursor-pointer touch-manipulation ${
            isOpen
              ? 'bg-slate-800 text-white rotate-90 border border-slate-700'
              : 'bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white shadow-blue-500/40 ring-2 ring-blue-400/30'
          }`}
          aria-label="Open Live Support"
          title="Open Live Support"
        >
          {isOpen ? (
            <X className="w-5 h-5 sm:w-6 sm:h-6" />
          ) : (
            <>
              <Headphones className="w-5 h-5 sm:w-6 sm:h-6" />
              {hasUnread && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-slate-950">
                  1
                </span>
              )}
            </>
          )}
        </button>
      </div>

      {/* Slide-Up Chat Window */}
      {isOpen && (
        <div
          className="fixed bottom-18 sm:bottom-22 right-3 sm:right-6 left-3 sm:left-auto w-auto sm:w-[380px] max-w-[calc(100vw-1.5rem)] max-h-[85vh] sm:max-h-[560px] h-[500px] sm:h-[520px] rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-slate-700/60 bg-slate-900 text-slate-100 backdrop-blur-2xl z-[9999] animate-scale-up"
          style={{ boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7), 0 0 30px rgba(59, 130, 246, 0.15)' }}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 p-3.5 border-b border-slate-800 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2.5">
              {view === 'CHAT' && (
                <button
                  onClick={() => setView('FORM')}
                  className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
                  title="Back to New Inquiry"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
              )}
              <div className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0">
                <Headphones className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-xs text-white tracking-tight">Support Desk</h3>
                  <span className="flex items-center gap-1 text-[9px] text-emerald-400 font-semibold px-1.5 py-0.2 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                    <span className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse" />
                    Online
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 font-medium">Guest & Visitor Assistance</p>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              title="Minimize chat"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body Content */}
          <div className="flex-1 overflow-y-auto flex flex-col bg-slate-950/50">
            {/* VIEW: DIRECT INQUIRY FORM */}
            {view === 'FORM' && (
              <form onSubmit={handleCreateTicket} className="p-4 flex flex-col gap-3">
                {/* Active chat shortcut if previous ticket exists */}
                {tickets.length > 0 && (
                  <div className="flex items-center justify-between p-2 rounded-xl bg-blue-950/40 border border-blue-500/20 text-xs">
                    <span className="text-[11px] text-slate-300">Previous chat available</span>
                    <button
                      type="button"
                      onClick={() => {
                        const latestTicket = tickets[0];
                        setActiveTicket(latestTicket);
                        setView('CHAT');
                      }}
                      className="text-[11px] font-bold text-blue-400 hover:text-blue-300 underline cursor-pointer"
                    >
                      View Active Thread →
                    </button>
                  </div>
                )}

                {/* Contact Inputs */}
                <div className="space-y-2.5">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      Your Name / Username <span className="text-red-400">*</span>
                    </label>
                    <div className="relative">
                      <User className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
                      <input
                        type="text"
                        placeholder="e.g. John Doe"
                        value={formData.name}
                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                        required
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      Email Address <span className="text-red-400">*</span>
                    </label>
                    <div className="relative">
                      <Mail className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
                      <input
                        type="email"
                        placeholder="name@email.com"
                        value={formData.email}
                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                        required
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      Describe your problem <span className="text-red-400">*</span>
                    </label>
                    <textarea
                      rows={4}
                      placeholder="Please explain the issue or question..."
                      value={formData.description}
                      onChange={e => setFormData({ ...formData, description: e.target.value })}
                      required
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 resize-none"
                    />
                  </div>
                </div>

                {formError && (
                  <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 p-2 rounded-xl">
                    {formError}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={isSubmittingTicket}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 disabled:opacity-50 transition-all cursor-pointer mt-1"
                >
                  {isSubmittingTicket ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Submitting Inquiry...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
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
                <div className="bg-slate-900/90 px-3.5 py-2 border-b border-slate-800 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-blue-400 font-bold text-[11px]">{activeTicket.ticketNumber}</span>
                    <span className="text-slate-300 font-semibold truncate max-w-[170px]">{activeTicket.subject}</span>
                  </div>
                  <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded ${
                    activeTicket.status === 'OPEN'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      : activeTicket.status === 'RESOLVED'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-slate-800 text-slate-400'
                  }`}>
                    {activeTicket.status}
                  </span>
                </div>

                {/* Messages List */}
                <div className="flex-1 p-3.5 overflow-y-auto space-y-2.5">
                  {isLoadingMessages && messages.length === 0 ? (
                    <div className="py-12 text-center">
                      <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                      <p className="text-xs text-slate-500">Connecting to support agent...</p>
                    </div>
                  ) : (
                    <>
                      {/* Initial description message */}
                      <div className="flex justify-start">
                        <div className="max-w-[85%] rounded-2xl rounded-tl-none p-2.5 text-xs bg-slate-900 border border-slate-800 text-slate-200">
                          <div className="flex items-center justify-between gap-3 text-[10px] text-slate-400 mb-1 border-b border-slate-800 pb-1">
                            <span className="font-semibold">{formData.name || 'You (Guest)'}</span>
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
                                className={`max-w-[85%] rounded-2xl p-2.5 text-xs shadow-sm ${
                                  isAgent
                                    ? 'bg-gradient-to-r from-blue-900/90 to-indigo-900/90 text-white border border-blue-500/30 rounded-tl-none'
                                    : 'bg-slate-800 text-slate-100 border border-slate-700/80 rounded-tr-none'
                                }`}
                              >
                                <div className="flex items-center justify-between gap-3 text-[10px] opacity-75 mb-1 border-b border-white/10 pb-1">
                                  <span className="font-bold">
                                    {isAgent ? 'Support Specialist' : (msg.senderName || 'You')}
                                  </span>
                                  <span className="font-mono">{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                </div>
                                <p className="whitespace-pre-wrap leading-relaxed">{msg.message}</p>
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
                  <form onSubmit={handleSendMessage} className="p-2.5 bg-slate-900 border-t border-slate-800 flex gap-2">
                    <input
                      type="text"
                      placeholder="Type your message..."
                      value={newMessage}
                      onChange={e => setNewMessage(e.target.value)}
                      disabled={isSending}
                      className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                    />
                    <button
                      type="submit"
                      disabled={isSending || !newMessage.trim()}
                      className="p-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white disabled:opacity-40 transition-colors cursor-pointer flex items-center justify-center"
                    >
                      {isSending ? (
                        <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Send className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </form>
                ) : (
                  <div className="p-2.5 bg-slate-900 border-t border-slate-800 text-center text-xs text-slate-400">
                    This inquiry has been settled. Click <button type="button" onClick={() => setView('NEW_TICKET')} className="text-blue-400 underline font-bold">here</button> to open a new chat.
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

