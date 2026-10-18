/**
 * @file apps/api/routes/v1/chat.routes.js
 * @description P2P chat, offer negotiation, and Admin conversation monitor routes (/api/v1/chat)
 */

import { Router } from 'express';
import {
  getConversations,
  getOrCreateConversation,
  getMessages,
  sendMessage,
  respondToOffer,
  getAdminUserConversations,
  getAdminAllConversations,
  updateAdminConversationStatus,
  deleteAdminConversation
} from '../../controllers/chat.controller.js';
import { optionalAuth } from '../../middleware/auth.middleware.js';

const router = Router();

router.use(optionalAuth);

// Admin global & per-user chat auditing endpoints
router.get('/admin/conversations', getAdminAllConversations);
router.patch('/admin/conversations/:conversationId', updateAdminConversationStatus);
router.delete('/admin/conversations/:conversationId', deleteAdminConversation);
router.get('/admin/user/:userId', getAdminUserConversations);

// Buyer & Seller P2P conversation and offer endpoints
router.get('/conversations', getConversations);
router.post('/conversations', getOrCreateConversation);
router.get('/conversations/:conversationId/messages', getMessages);
router.post('/conversations/:conversationId/messages', sendMessage);
router.post('/messages/:messageId/offer', respondToOffer);

export default router;
