/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import crypto from 'crypto';
import { supportRepository } from '../repositories/supportRepository.ts';
import { notificationService } from './notificationService.ts';

export class SupportService {
  /**
   * Helper to generate a unique human-readable ticket number (e.g. TICK-ABCD-1234)
   */
  private generateTicketNumber(): string {
    const randomHex = crypto.randomBytes(3).toString('hex').toUpperCase();
    const seq = Math.floor(100 + Math.random() * 900);
    return `MF-${randomHex}-${seq}`;
  }

  /**
   * User or Admin creates a brand new support ticket
   */
  async createSupportTicket(data: {
    userId: string;
    category: string;
    subject: string;
    description: string;
    priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
    attachmentName?: string;
    attachmentData?: string;
  }) {
    const ticketNumber = this.generateTicketNumber();
    const ticket = await supportRepository.createTicket({
      userId: data.userId,
      ticketNumber,
      category: data.category,
      subject: data.subject,
      description: data.description,
      priority: data.priority || 'LOW',
      attachmentName: data.attachmentName,
      attachmentData: data.attachmentData,
    });

    // Automatically append the initial user description as the first thread message
    await supportRepository.createMessage({
      ticketId: ticket.id,
      senderId: data.userId,
      senderType: 'USER',
      message: data.description,
    });

    // Dispatch notification to administrators
    await notificationService.notifyAdmins({
      title: 'New Support Ticket Created',
      description: `Inquiry ${ticket.ticketNumber} regarding ${data.category} has been opened.`,
      icon: 'MessageSquare',
      type: 'support',
      priority: 'MEDIUM',
    });

    return ticket;
  }

  /**
   * Add a response/reply message under a support ticket thread with authorization mapping
   */
  async addTicketReply(data: {
    ticketId: string;
    senderId: string;
    senderType: 'USER' | 'ADMIN' | 'SYSTEM';
    message: string;
  }) {
    const ticket = await supportRepository.findById(data.ticketId);
    if (!ticket) {
      throw new Error(`Support ticket not found for ID: ${data.ticketId}`);
    }

    // Safety checks: If sender is user, ensure they own the ticket
    if (data.senderType === 'USER' && ticket.userId !== data.senderId) {
      throw new Error('Unauthorized action on support ticket thread.');
    }

    const messageRecord = await supportRepository.createMessage({
      ticketId: data.ticketId,
      senderId: data.senderId,
      senderType: data.senderType,
      message: data.message,
    });

    // Update ticket state based on responder type to notify counterpart
    const newStatus = data.senderType === 'ADMIN' ? 'PENDING_USER' : 'OPEN';
    await supportRepository.updateTicket(ticket.id, { status: newStatus });

    // Send notifications
    if (data.senderType === 'ADMIN') {
      // Notify the ticket owner user of admin's reply
      await notificationService.createStructuredNotification(ticket.userId, {
        title: 'New Support Message',
        description: `MetaFirm Support has replied to your ticket ${ticket.ticketNumber}: "${data.message.substring(0, 60)}..."`,
        icon: 'MessageSquare',
        type: 'support',
        priority: 'HIGH',
      });
    } else if (data.senderType === 'USER') {
      // Notify administrators of the user's response reply
      await notificationService.notifyAdmins({
        title: 'New User Ticket Reply',
        description: `User replied to ticket ${ticket.ticketNumber}: "${data.message.substring(0, 60)}..."`,
        icon: 'MessageSquare',
        type: 'support',
        priority: 'MEDIUM',
      });
    }

    return messageRecord;
  }

  /**
   * Retrieve list of support tickets submitted by a specific user
   */
  async getUserTickets(userId: string, options?: { limit?: number; offset?: number; status?: string }) {
    return supportRepository.findByUserId(userId, options);
  }

  /**
   * Retrieve list of all support tickets for administrative oversight
   */
  async getAdminTickets(options?: {
    status?: string;
    priority?: string;
    category?: string;
    search?: string;
    limit?: number;
    offset?: number;
  }) {
    return supportRepository.findAdminTickets(options);
  }

  /**
   * Retrieve all messages/conversation history under a specific ticket
   */
  async getTicketMessages(ticketId: string, userId: string, isAdmin = false) {
    const ticket = await supportRepository.findById(ticketId);
    if (!ticket) {
      throw new Error(`Support ticket not found for ID: ${ticketId}`);
    }

    // Authorization check
    if (!isAdmin && ticket.userId !== userId) {
      throw new Error('Unauthorized action. You do not have permission to view this support conversation.');
    }

    return supportRepository.findMessagesByTicketId(ticketId);
  }

  /**
   * Update ticket properties (status, priority, admin assignee) - Administrative Actions
   */
  async updateTicketProperties(
    ticketId: string,
    updates: Partial<{
      status: string;
      priority: string;
      assignedAdminUid: string;
    }>
  ) {
    const ticket = await supportRepository.findById(ticketId);
    if (!ticket) {
      throw new Error(`Support ticket not found for ID: ${ticketId}`);
    }

    return supportRepository.updateTicket(ticket.id, updates);
  }

  /**
   * Find a specific support ticket by its sequential database ID
   */
  async getTicketById(ticketId: string) {
    return supportRepository.findById(ticketId);
  }
}

export const supportService = new SupportService();
export default supportService;
