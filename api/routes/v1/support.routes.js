/**
 * @file apps/api/routes/v1/support.routes.js
 * @description Support and grievance redressal routes (/api/v1/support)
 */

import { Router } from 'express';
import {
  createSupportTicket,
  getTicketStatus,
  getAllTickets,
  updateTicket,
  getFAQs
} from '../../controllers/support.controller.js';
import { authenticate } from '../../middleware/auth.middleware.js';
import { requireAdmin } from '../../middleware/rbac.middleware.js';

const router = Router();

// Public customer support endpoints
router.post('/contact', createSupportTicket);
router.get('/tickets/:ticketId', getTicketStatus);
router.get('/faqs', getFAQs);

// Protected Admin/Moderator management endpoints
router.get('/admin/tickets', authenticate, requireAdmin, getAllTickets);
router.put('/admin/tickets/:ticketId', authenticate, requireAdmin, updateTicket);

export default router;
