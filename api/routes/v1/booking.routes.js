/**
 * @file apps/api/routes/v1/booking.routes.js
 * @description Hyperlocal service booking routes (/api/v1/bookings, /booking, /bookings)
 */

import { Router } from 'express';
import {
  createBooking,
  getMyBookings,
  getBookingById,
  updateBookingStatus,
  cancelBooking
} from '../../controllers/booking.controller.js';
import { optionalAuth } from '../../middleware/auth.middleware.js';

const router = Router();

router.use(optionalAuth);

router.post('/', createBooking);
router.post('/create', createBooking);
router.get('/', getMyBookings);
router.get('/get-all', getMyBookings);
router.get('/get-by-user/:userId', getMyBookings);
router.get('/:id', getBookingById);
router.put('/update-status/:id', updateBookingStatus);
router.patch('/update-status/:id', updateBookingStatus);
router.put('/:id/status', updateBookingStatus);
router.patch('/:id/status', updateBookingStatus);
router.put('/:id', updateBookingStatus);
router.post('/:id/cancel', cancelBooking);

export default router;
