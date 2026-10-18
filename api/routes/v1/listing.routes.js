/**
 * @file apps/api/routes/v1/listing.routes.js
 * @description Marketplace listings, classifieds, moderation, and favorites routes (/api/v1/listings)
 */

import { Router } from 'express';
import {
  getListings,
  getListingById,
  createListing,
  updateListing,
  deleteListing,
  getMyListings,
  toggleFavorite,
  getMyFavorites
} from '../../controllers/listing.controller.js';
import { optionalAuth } from '../../middleware/auth.middleware.js';
import { upload } from '../../middleware/upload.middleware.js';

const router = Router();

router.use(optionalAuth);

// Public / optional auth feed and search
router.get('/', getListings);
router.get('/get-all', getListings);
router.get('/my/all', getMyListings);
router.get('/my/favorites', getMyFavorites);
router.get('/:id', getListingById);

// Listing creation, moderation & updates
router.post('/', upload.any(), createListing);
router.post('/create', upload.any(), createListing);
router.put('/update/:id', upload.any(), updateListing);
router.put('/:id', upload.any(), updateListing);
router.patch('/:id', upload.any(), updateListing);
router.put('/:id/status', updateListing);
router.patch('/:id/status', updateListing);
router.put('/:id/moderate', updateListing);
router.patch('/:id/moderate', updateListing);
router.delete('/delete/:id', deleteListing);
router.delete('/:id', deleteListing);
router.post('/:id/favorite', toggleFavorite);

export default router;
