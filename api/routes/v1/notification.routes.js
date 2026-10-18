/**
 * @file apps/api/routes/v1/notification.routes.js
 * @description In-app notification center routes (/api/v1/notifications)
 */

import { Router } from 'express';
import {
  getMyNotifications,
  markAsRead,
  markAllAsRead,
  getUnreadCount,
  broadcastNotification,
  deleteNotification
} from '../../controllers/notification.controller.js';
import { authenticate } from '../../middleware/auth.middleware.js';
import { requireAdmin } from '../../middleware/rbac.middleware.js';

const router = Router();

router.use(authenticate);

router.get('/', getMyNotifications);
router.get('/unread-count', getUnreadCount);
router.post('/broadcast', requireAdmin, broadcastNotification);
router.put('/:id/read', markAsRead);
router.put('/read-all', markAllAsRead);
router.delete('/:id', deleteNotification);

export default router;
