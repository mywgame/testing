/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { eq, and, desc, or, ilike } from 'drizzle-orm';
import { db } from '../../src/db/index.ts';
import { supportTickets, supportMessages, users } from '../../src/db/schema.ts';

export class SupportRepository {
  /**
   * Find a support ticket by its unique sequential database ID
   */
  async findById(id: string) {
    try {
      const result = await db
        .select()
        .from(supportTickets)
        .where(eq(supportTickets.id, id));
      return result[0] || null;
    } catch (error) {
      console.error('Database query (findById) failed:', error);
      throw new Error('Failed to retrieve support ticket.');
    }
  }

  /**
   * Find a support ticket by its human-readable unique code
   */
  async findByTicketNumber(ticketNumber: string) {
    try {
      const result = await db
        .select()
        .from(supportTickets)
        .where(eq(supportTickets.ticketNumber, ticketNumber));
      return result[0] || null;
    } catch (error) {
      console.error('Database query (findByTicketNumber) failed:', error);
      throw new Error('Failed to retrieve support ticket by code.');
    }
  }

  /**
   * Retrieve support tickets for a user with pagination and optional status filter
   */
  async findByUserId(
    userId: string,
    options?: {
      limit?: number;
      offset?: number;
      status?: string;
    }
  ) {
    try {
      const limit = options?.limit ?? 50;
      const offset = options?.offset ?? 0;
      const status = options?.status;

      let query = db.select().from(supportTickets).$dynamic();
      const conditions = [eq(supportTickets.userId, userId)];

      if (status) {
        conditions.push(eq(supportTickets.status, status));
      }

      const result = await query
        .where(and(...conditions))
        .orderBy(desc(supportTickets.createdAt))
        .limit(limit)
        .offset(offset);

      return result;
    } catch (error) {
      console.error('Database query (findByUserId) failed:', error);
      throw new Error('Failed to query user support tickets.');
    }
  }

  /**
   * Create a new support ticket
   */
  async createTicket(data: {
    userId: string;
    ticketNumber: string;
    category: string;
    subject: string;
    description: string;
    priority?: string;
    attachmentName?: string;
    attachmentData?: string;
  }) {
    try {
      const result = await db
        .insert(supportTickets)
        .values({
          userId: data.userId,
          ticketNumber: data.ticketNumber,
          category: data.category,
          subject: data.subject,
          description: data.description,
          priority: data.priority || 'LOW',
          status: 'OPEN',
          attachmentName: data.attachmentName || null,
          attachmentData: data.attachmentData || null,
        })
        .returning();
      return result[0];
    } catch (error) {
      console.error('Database insertion (createTicket) failed:', error);
      throw new Error('Failed to submit new support ticket.');
    }
  }

  /**
   * Update support ticket status, priority, or assignee
   */
  async updateTicket(
    id: string,
    updates: Partial<{
      status: string;
      priority: string;
      assignedAdminUid: string;
    }>
  ) {
    try {
      const result = await db
        .update(supportTickets)
        .set({
          ...updates,
          updatedAt: new Date(),
        })
        .where(eq(supportTickets.id, id))
        .returning();
      return result[0] || null;
    } catch (error) {
      console.error('Database update (updateTicket) failed:', error);
      throw new Error('Failed to update support ticket.');
    }
  }

  /**
   * Find all support tickets joined with user details (admin audit panel view)
   */
  async findAdminTickets(options?: {
    status?: string;
    priority?: string;
    category?: string;
    search?: string;
    limit?: number;
    offset?: number;
  }) {
    try {
      const limit = options?.limit ?? 100;
      const offset = options?.offset ?? 0;
      const status = options?.status;
      const priority = options?.priority;
      const category = options?.category;
      const search = options?.search;

      let query = db
        .select({
          id: supportTickets.id,
          userId: supportTickets.userId,
          ticketNumber: supportTickets.ticketNumber,
          status: supportTickets.status,
          priority: supportTickets.priority,
          assignedAdminUid: supportTickets.assignedAdminUid,
          category: supportTickets.category,
          subject: supportTickets.subject,
          description: supportTickets.description,
          attachmentName: supportTickets.attachmentName,
          attachmentData: supportTickets.attachmentData,
          createdAt: supportTickets.createdAt,
          updatedAt: supportTickets.updatedAt,
          userEmail: users.email,
          userName: users.name,
          userVisibleId: users.userId,
        })
        .from(supportTickets)
        .leftJoin(users, eq(supportTickets.userId, users.id))
        .$dynamic();

      const conditions = [];

      if (status && status !== 'All' && status !== 'ALL') {
        conditions.push(eq(supportTickets.status, status));
      }
      if (priority && priority !== 'All' && priority !== 'ALL') {
        conditions.push(eq(supportTickets.priority, priority));
      }
      if (category && category !== 'All' && category !== 'ALL') {
        conditions.push(eq(supportTickets.category, category));
      }

      if (search) {
        const searchPattern = `%${search}%`;
        conditions.push(
          or(
            ilike(supportTickets.ticketNumber, searchPattern),
            ilike(supportTickets.subject, searchPattern),
            ilike(supportTickets.description, searchPattern),
            ilike(users.email, searchPattern),
            ilike(users.name, searchPattern)
          )
        );
      }

      if (conditions.length > 0) {
        query = query.where(and(...conditions));
      }

      const result = await query
        .orderBy(desc(supportTickets.updatedAt))
        .limit(limit)
        .offset(offset);

      return result;
    } catch (error) {
      console.error('Database query (findAdminTickets) failed:', error);
      throw new Error('Failed to retrieve system support tickets ledger.');
    }
  }

  /**
   * Find all support tickets (admin audit panel view)
   */
  async findAll(options?: {
    status?: string;
    priority?: string;
    limit?: number;
    offset?: number;
  }) {
    try {
      const limit = options?.limit ?? 50;
      const offset = options?.offset ?? 0;
      const status = options?.status;
      const priority = options?.priority;

      let query = db.select().from(supportTickets).$dynamic();
      const conditions = [];

      if (status) {
        conditions.push(eq(supportTickets.status, status));
      }
      if (priority) {
        conditions.push(eq(supportTickets.priority, priority));
      }

      if (conditions.length > 0) {
        query = query.where(and(...conditions));
      }

      const result = await query
        .orderBy(desc(supportTickets.updatedAt))
        .limit(limit)
        .offset(offset);

      return result;
    } catch (error) {
      console.error('Database query (findAll) failed:', error);
      throw new Error('Failed to retrieve system support tickets ledger.');
    }
  }

  /**
   * Create a support message / reply under a specific ticket
   */
  async createMessage(data: {
    ticketId: string;
    senderId?: string | null;
    senderType: 'USER' | 'ADMIN' | 'SYSTEM';
    message: string;
  }) {
    try {
      const result = await db
        .insert(supportMessages)
        .values({
          ticketId: data.ticketId,
          senderId: data.senderId || null,
          senderType: data.senderType,
          message: data.message,
        })
        .returning();
      return result[0];
    } catch (error) {
      console.error('Database insertion (createMessage) failed:', error);
      throw new Error('Failed to save support thread reply.');
    }
  }

  /**
   * Get messages / replies under a support ticket to display conversations
   */
  async findMessagesByTicketId(
    ticketId: string,
    options?: {
      limit?: number;
      offset?: number;
    }
  ) {
    try {
      const limit = options?.limit ?? 100;
      const offset = options?.offset ?? 0;

      const result = await db
        .select()
        .from(supportMessages)
        .where(eq(supportMessages.ticketId, ticketId))
        .orderBy(desc(supportMessages.createdAt)) // Show message chain
        .limit(limit)
        .offset(offset);

      return result;
    } catch (error) {
      console.error('Database query (findMessagesByTicketId) failed:', error);
      throw new Error('Failed to retrieve support ticket conversation.');
    }
  }
}

export const supportRepository = new SupportRepository();
export default supportRepository;
