/**
 * @file apps/api/routes/v1/review.routes.js
 * @description Customer reviews and rating feedback routes (/api/v1/reviews)
 */

import { Router } from 'express';
import { addReview, getReviews, deleteReview, updateReviewStatus } from '../../controllers/review.controller.js';
import { optionalAuth } from '../../middleware/auth.middleware.js';

const router = Router();

router.use(optionalAuth);

router.get('/', getReviews);
router.get('/get-all', getReviews);
router.post('/', addReview);
router.post('/create', addReview);
router.put('/:id/status', updateReviewStatus);
router.patch('/:id/status', updateReviewStatus);
router.put('/:id', updateReviewStatus);
router.patch('/:id', updateReviewStatus);
router.delete('/:id', deleteReview);

export default router;
