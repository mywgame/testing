/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { SupportTicket, SupportReply } from './types.ts';
import { SupportTicketForm } from './SupportTicketForm.tsx';
import { TicketList } from './TicketList.tsx';
import { SupportInfo } from './SupportInfo.tsx';
import { useTheme } from '../../../hooks/useTheme.ts';
import { api } from '../../../services/api.ts';
import { ShieldAlert, CheckCircle, MessageSquare } from 'lucide-react';

export const SupportView: React.FC = () => {
  const { t } = useTheme();
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load user tickets on mount
  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.getUserSupportTickets();
      if (response.success && Array.isArray(response.data)) {
        // Fetch replies for each ticket in parallel
        const mappedTickets = await Promise.all(
          response.data.map(async (ticket: any) => {
            let replies: SupportReply[] = [];
            try {
              const msgRes = await api.getTicketMessages(ticket.id);
              if (msgRes.success && Array.isArray(msgRes.data)) {
                replies = msgRes.data.map((msg: any) => ({
                  id: msg.id.toString(),
                  sender: msg.senderType === 'USER' ? 'user' : 'support',
                  message: msg.message,
                  createdAt: new Date(msg.createdAt).toLocaleString(),
                }));
              }
            } catch (err) {
              console.error(`Failed to load messages for ticket ${ticket.id}:`, err);
            }

            // Map status
            let mappedStatus: SupportTicket['status'] = 'Open';
            if (ticket.status === 'CLOSED') {
              mappedStatus = 'Closed';
            } else if (ticket.status === 'RESOLVED') {
              mappedStatus = 'Resolved';
            } else if (ticket.status === 'PENDING_USER' || ticket.status === 'IN_PROGRESS') {
              mappedStatus = 'In Progress';
            }

            return {
              id: ticket.id.toString(),
              ticketNumber: ticket.ticketNumber,
              category: ticket.category as any,
              subject: ticket.subject,
              description: ticket.description,
              status: mappedStatus,
              priority: ticket.priority as any,
              createdAt: new Date(ticket.createdAt).toLocaleString(),
              attachmentName: ticket.attachmentName || undefined,
              replies,
            };
          })
        );
        setTickets(mappedTickets);
      }
    } catch (err: any) {
      console.error('Failed to load support tickets:', err);
      setError('Failed to fetch support tickets. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateTicket = async (ticketData: {
    subject: string;
    description: string;
    category: 'DEPOSIT' | 'WITHDRAWAL' | 'VIP' | 'ACCOUNT' | 'OTHER';
    attachment?: File;
  }) => {
    setIsSubmitting(true);
    setError(null);

    try {
      let attachmentName: string | undefined;
      let attachmentData: string | undefined;

      if (ticketData.attachment) {
        attachmentName = ticketData.attachment.name;
        // Convert to base64
        attachmentData = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.readAsDataURL(ticketData.attachment!);
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = (error) => reject(error);
        });
      }

      const response = await api.createUserSupportTicket({
        category: ticketData.category,
        subject: ticketData.subject,
        description: ticketData.description,
        attachmentName,
        attachmentData,
      });

      if (response.success) {
        setToastMessage(`Support ticket successfully submitted! Reference: ${response.data.ticketNumber}`);
        fetchTickets();
        setTimeout(() => {
          setToastMessage(null);
        }, 5000);
      } else {
        setError(response.error?.message || 'Failed to submit support ticket.');
      }
    } catch (err: any) {
      console.error('Failed to submit ticket:', err);
      setError(err.message || 'An error occurred during ticket submission.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReplyToTicket = async (ticketId: string, message: string) => {
    try {
      const response = await api.replyToTicket(ticketId, message);
      if (response.success) {
        // Refresh tickets to update replies
        fetchTickets();
      } else {
        alert(response.error?.message || 'Failed to send reply.');
      }
    } catch (err: any) {
      console.error('Reply failed:', err);
      alert(err.message || 'Failed to submit reply.');
    }
  };

  const handleCloseTicket = async (ticketId: string) => {
    try {
      const response = await api.closeTicket(ticketId);
      if (response.success) {
        fetchTickets();
      } else {
        alert(response.error?.message || 'Failed to close ticket.');
      }
    } catch (err: any) {
      console.error('Close failed:', err);
      alert(err.message || 'Failed to close ticket.');
    }
  };

  return (
    <div className="space-y-6 text-left" id="support-view-container">
      {/* 1. Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <div className="p-1.5 bg-cyan-500/10 border border-cyan-500/20 rounded-xl text-cyan-500 dark:text-cyan-400">
              <MessageSquare className="w-5 h-5" />
            </div>
            <h1 className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${t.text}`}>
              MetaFirm Support
            </h1>
          </div>
          <p className={`text-xs sm:text-sm mt-1.5 ${t.textSub}`}>
            Submit assistance requests, track ticket status, and read our quick help resources.
          </p>
        </div>
      </div>

      {/* Toast Alert Banner */}
      {toastMessage && (
        <div className="fixed top-24 right-4 z-50 flex items-center space-x-2.5 p-4 rounded-2xl bg-emerald-500 text-black font-semibold shadow-2xl animate-bounce">
          <CheckCircle className="w-5 h-5" />
          <span className="text-xs sm:text-sm font-sans">{toastMessage}</span>
        </div>
      )}

      {/* Error Alert Box */}
      {error && (
        <div className="flex items-start space-x-2 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 dark:text-red-400 text-sm font-sans">
          <ShieldAlert className="w-5 h-5 shrink-0" />
          <span className="leading-normal">{error}</span>
        </div>
      )}

      {/* Grid of form, history list and direct support guides */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Side: Form and Active tickets history */}
        <div className="lg:col-span-7 space-y-6">
          <SupportTicketForm onSubmit={handleCreateTicket} isSubmitting={isSubmitting} />
          {isLoading ? (
            <div className={`p-12 text-center border rounded-3xl ${t.card} flex flex-col items-center justify-center space-y-3`}>
              <div className="w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
              <p className={`text-sm ${t.textMuted}`}>Synchronizing your support tickets ledger...</p>
            </div>
          ) : (
            <TicketList tickets={tickets} onReply={handleReplyToTicket} onClose={handleCloseTicket} />
          )}
        </div>

        {/* Right Side: Quick info, safety guide, FAQs */}
        <div className="lg:col-span-5">
          <SupportInfo />
        </div>
      </div>
    </div>
  );
};

export default SupportView;
