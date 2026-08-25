/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Router, Request, Response } from 'express';
import { supportService } from '../../services/supportService.ts';
import { sendSuccess, sendError } from '../../utils/response.ts';

const router = Router();

/**
 * @route POST /api/v1/support/guest/inquiry
 * @desc Create a new guest / pre-login support inquiry ticket
 * @access Public
 */
router.post('/guest/inquiry', async (req: Request, res: Response) => {
  try {
    const { guestSessionId, guestName, guestEmail, guestPhone, category, subject, description } = req.body;

    if (!guestSessionId) {
      return sendError(res, 'Guest session ID is required.', 'BAD_REQUEST', 400);
    }
    if (!description || !description.trim()) {
      return sendError(res, 'Please describe your inquiry or issue.', 'BAD_REQUEST', 400);
    }

    const ticket = await supportService.createGuestSupportInquiry({
      guestSessionId: guestSessionId.trim(),
      guestName: (guestName || '').trim() || 'Guest Visitor',
      guestEmail: (guestEmail || '').trim(),
      guestPhone: (guestPhone || '').trim(),
      category: category || 'LOGIN_ISSUE',
      subject: (subject || '').trim() || 'Support Inquiry',
      description: description.trim(),
    });

    return sendSuccess(res, ticket, 201);
  } catch (error: any) {
    return sendError(res, error.message || 'Failed to submit support inquiry.', 'SUPPORT_ERROR', 500);
  }
});

/**
 * @route GET /api/v1/support/guest/tickets/:guestSessionId
 * @desc Fetch all support tickets created in this guest session
 * @access Public
 */
router.get('/guest/tickets/:guestSessionId', async (req: Request, res: Response) => {
  try {
    const { guestSessionId } = req.params;
    if (!guestSessionId) {
      return sendError(res, 'Guest session ID is required.', 'BAD_REQUEST', 400);
    }

    const tickets = await supportService.getGuestTickets(guestSessionId);
    return sendSuccess(res, tickets, 200);
  } catch (error: any) {
    return sendError(res, error.message || 'Failed to fetch tickets.', 'SUPPORT_ERROR', 500);
  }
});

/**
 * @route GET /api/v1/support/guest/tickets/:ticketId/messages
 * @desc Fetch message thread for a guest ticket
 * @access Public (Requires matching guestSessionId header or query)
 */
router.get('/guest/tickets/:ticketId/messages', async (req: Request, res: Response) => {
  try {
    const { ticketId } = req.params;
    const guestSessionId = (req.headers['x-guest-session-id'] as string) || (req.query.guestSessionId as string);

    if (!ticketId) {
      return sendError(res, 'Ticket ID is required.', 'BAD_REQUEST', 400);
    }
    if (!guestSessionId) {
      return sendError(res, 'Guest session ID is required to verify ownership.', 'BAD_REQUEST', 400);
    }

    const messages = await supportService.getGuestTicketMessages(ticketId, guestSessionId);
    return sendSuccess(res, messages, 200);
  } catch (error: any) {
    return sendError(res, error.message || 'Failed to fetch messages.', 'SUPPORT_ERROR', 500);
  }
});

/**
 * @route POST /api/v1/support/guest/tickets/:ticketId/reply
 * @desc Post a guest reply to an existing support ticket
 * @access Public (Requires matching guestSessionId)
 */
router.post('/guest/tickets/:ticketId/reply', async (req: Request, res: Response) => {
  try {
    const { ticketId } = req.params;
    const { guestSessionId, senderName, message } = req.body;

    if (!ticketId) {
      return sendError(res, 'Ticket ID is required.', 'BAD_REQUEST', 400);
    }
    if (!guestSessionId) {
      return sendError(res, 'Guest session ID is required.', 'BAD_REQUEST', 400);
    }
    if (!message || !message.trim()) {
      return sendError(res, 'Message cannot be empty.', 'BAD_REQUEST', 400);
    }

    const reply = await supportService.addGuestTicketReply({
      ticketId,
      guestSessionId: guestSessionId.trim(),
      senderName: senderName?.trim(),
      message: message.trim(),
    });

    return sendSuccess(res, reply, 201);
  } catch (error: any) {
    return sendError(res, error.message || 'Failed to post reply.', 'SUPPORT_ERROR', 500);
  }
});

export default router;
