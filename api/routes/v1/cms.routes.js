/**
 * @file apps/api/routes/v1/cms.routes.js
 * @description CMS Banners and static pages routes (/api/v1/cms, /api/v1/banners, /banner, /banners)
 */

import { Router } from 'express';
import {
  getBanners,
  createBanner,
  updateBanner,
  reorderBanners,
  toggleBannerStatus,
  deleteBanner,
  trackBannerEvent,
  getBannerAnalytics,
  getStaticPage,
  updateStaticPage,
  getGalleryImages,
  uploadGalleryImages,
  deleteGalleryImage,
  getBannerSettings,
  updateBannerSettings,
  getAllCMSPages
} from '../../controllers/cms.controller.js';
import { optionalAuth } from '../../middleware/auth.middleware.js';
import { upload } from '../../middleware/upload.middleware.js';

const router = Router();

router.use(optionalAuth);

// Banners & Slider Settings under /api/v1/cms
router.get('/banners/settings', getBannerSettings);
router.put('/banners/settings', updateBannerSettings);
router.put('/banners/reorder', reorderBanners);
router.get('/banners', getBanners);
router.get('/banners/get-all', getBanners);
router.get('/banners/analytics', getBannerAnalytics);
router.post('/banners/:id/track', trackBannerEvent);
router.post('/banners', upload.any(), createBanner);
router.post('/banners/create', upload.any(), createBanner);
router.put('/banners/:id/status', toggleBannerStatus);
router.put('/banners/update/:id', upload.any(), updateBanner);
router.put('/banners/:id', upload.any(), updateBanner);
router.delete('/banners/delete/:id', deleteBanner);
router.delete('/banners/:id', deleteBanner);

// Media Gallery
router.get('/gallery', getGalleryImages);
router.post('/gallery/upload', upload.array('images', 20), uploadGalleryImages);
router.delete('/gallery/:filename', deleteGalleryImage);

// Static & Dynamic Pages
router.get('/pages', getAllCMSPages);
router.get('/pages/:slug', getStaticPage);
router.put('/pages/:slug', updateStaticPage);
router.get('/:slug', getStaticPage);
router.put('/:slug', updateStaticPage);

// Standalone Banner Router for /banner, /banners, and /api/v1/banners
export const bannerRouter = Router();
bannerRouter.use(optionalAuth);
bannerRouter.get('/settings', getBannerSettings);
bannerRouter.put('/settings', updateBannerSettings);
bannerRouter.put('/reorder', reorderBanners);
bannerRouter.get('/analytics', getBannerAnalytics);
bannerRouter.get('/get-all', getBanners);
bannerRouter.get('/', getBanners);
bannerRouter.post('/create', upload.any(), createBanner);
bannerRouter.post('/', upload.any(), createBanner);
bannerRouter.post('/:id/track', trackBannerEvent);
bannerRouter.put('/:id/status', toggleBannerStatus);
bannerRouter.put('/update/:id', upload.any(), updateBanner);
bannerRouter.patch('/update/:id', upload.any(), updateBanner);
bannerRouter.put('/:id', upload.any(), updateBanner);
bannerRouter.patch('/:id', upload.any(), updateBanner);
bannerRouter.delete('/delete/:id', deleteBanner);
bannerRouter.delete('/:id', deleteBanner);

export default router;
