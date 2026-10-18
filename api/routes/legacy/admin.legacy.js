/**
 * @file apps/api/routes/legacy/admin.legacy.js
 * @description Express routers mounting legacy root endpoints (/admin, /category, /product, /booking, etc.)
 */

import { Router } from 'express';
import {
  legacyAdminLogin,
  legacyAdminSignup,
  legacyGetCategories,
  legacyCreateCategory,
  legacyUpdateCategory,
  legacyDeleteCategory,
  legacyGetSubCategories,
  legacyCreateSubCategory,
  legacyUpdateSubCategory,
  legacyDeleteSubCategory,
  legacyGetProducts,
  legacyGetProductById,
  legacyCreateProduct,
  legacyUpdateProduct,
  legacyDeleteProduct,
  legacyGetServiceCategories,
  legacyCreateServiceCategory,
  legacyUpdateServiceCategory,
  legacyDeleteServiceCategory,
  legacyGetServiceSubCategories,
  legacyCreateServiceSubCategory,
  legacyUpdateServiceSubCategory,
  legacyDeleteServiceSubCategory,
  legacyGetTaxes,
  legacyCreateTax,
  legacyUpdateTax,
  legacyDeleteTax,
  legacyGetCoupons,
  legacyCreateCoupon,
  legacyUpdateCoupon,
  legacyDeleteCoupon,
  legacyGetKycs,
  legacyUpdateKyc,
  legacyGetAllUsers,
  legacyDashboardAnalytics,
  legacyEnquiries,
  legacyGetEnquiries,
  legacyUpdateEnquiryStatus
} from '../../controllers/legacy.controller.js';
import {
  createBooking,
  getMyBookings,
  getBookingById,
  updateBookingStatus,
  cancelBooking
} from '../../controllers/booking.controller.js';
import { optionalAuth, authenticate } from '../../middleware/auth.middleware.js';
import { requireAdmin } from '../../middleware/rbac.middleware.js';
import { upload } from '../../middleware/upload.middleware.js';

export const adminLegacyRouter = Router();
adminLegacyRouter.post('/login', legacyAdminLogin);
adminLegacyRouter.post('/signup', legacyAdminSignup);

export const enquiriesRouter = Router();
enquiriesRouter.use(optionalAuth);
enquiriesRouter.post('/', legacyEnquiries);
enquiriesRouter.post('/create', legacyEnquiries);
enquiriesRouter.get('/', legacyGetEnquiries);
enquiriesRouter.get('/get-all', legacyGetEnquiries);
enquiriesRouter.get('/notifications', legacyGetEnquiries);
enquiriesRouter.put('/:id/status', legacyUpdateEnquiryStatus);
enquiriesRouter.patch('/:id/status', legacyUpdateEnquiryStatus);
enquiriesRouter.put('/:id', legacyUpdateEnquiryStatus);
enquiriesRouter.patch('/:id', legacyUpdateEnquiryStatus);

export const categoryLegacyRouter = Router();
categoryLegacyRouter.use(optionalAuth);
categoryLegacyRouter.get('/', legacyGetCategories);
categoryLegacyRouter.get('/get-all', legacyGetCategories);
categoryLegacyRouter.post('/create', upload.any(), legacyCreateCategory);
categoryLegacyRouter.post('/', upload.any(), legacyCreateCategory);
categoryLegacyRouter.put('/update/:id', upload.any(), legacyUpdateCategory);
categoryLegacyRouter.put('/:id', upload.any(), legacyUpdateCategory);
categoryLegacyRouter.delete('/delete/:id', legacyDeleteCategory);
categoryLegacyRouter.delete('/:id', legacyDeleteCategory);

export const subCategoryLegacyRouter = Router();
subCategoryLegacyRouter.use(optionalAuth);
subCategoryLegacyRouter.get('/', legacyGetSubCategories);
subCategoryLegacyRouter.get('/get-all', legacyGetSubCategories);
subCategoryLegacyRouter.post('/create', upload.any(), legacyCreateSubCategory);
subCategoryLegacyRouter.post('/', upload.any(), legacyCreateSubCategory);
subCategoryLegacyRouter.put('/update/:id', upload.any(), legacyUpdateSubCategory);
subCategoryLegacyRouter.put('/:id', upload.any(), legacyUpdateSubCategory);
subCategoryLegacyRouter.delete('/delete/:id', legacyDeleteSubCategory);
subCategoryLegacyRouter.delete('/:id', legacyDeleteSubCategory);

export const productLegacyRouter = Router();
productLegacyRouter.use(optionalAuth);
productLegacyRouter.get('/', legacyGetProducts);
productLegacyRouter.get('/get-all', legacyGetProducts);
productLegacyRouter.get('/get/:id', legacyGetProductById);
productLegacyRouter.get('/:id', legacyGetProductById);
productLegacyRouter.post('/create', upload.any(), legacyCreateProduct);
productLegacyRouter.post('/', upload.any(), legacyCreateProduct);
productLegacyRouter.put('/update/:id', upload.any(), legacyUpdateProduct);
productLegacyRouter.patch('/update/:id', upload.any(), legacyUpdateProduct);
productLegacyRouter.put('/:id/moderate', legacyUpdateProduct);
productLegacyRouter.put('/:id/status', legacyUpdateProduct);
productLegacyRouter.patch('/:id/status', legacyUpdateProduct);
productLegacyRouter.put('/:id', upload.any(), legacyUpdateProduct);
productLegacyRouter.patch('/:id', upload.any(), legacyUpdateProduct);
productLegacyRouter.delete('/delete/:id', legacyDeleteProduct);
productLegacyRouter.delete('/:id', legacyDeleteProduct);

export const serviceCategoryLegacyRouter = Router();
serviceCategoryLegacyRouter.use(optionalAuth);
serviceCategoryLegacyRouter.get('/', legacyGetServiceCategories);
serviceCategoryLegacyRouter.get('/get-all', legacyGetServiceCategories);
serviceCategoryLegacyRouter.post('/create', upload.any(), legacyCreateServiceCategory);
serviceCategoryLegacyRouter.post('/', upload.any(), legacyCreateServiceCategory);
serviceCategoryLegacyRouter.put('/update/:id', upload.any(), legacyUpdateServiceCategory);
serviceCategoryLegacyRouter.put('/:id', upload.any(), legacyUpdateServiceCategory);
serviceCategoryLegacyRouter.delete('/delete/:id', legacyDeleteServiceCategory);
serviceCategoryLegacyRouter.delete('/:id', legacyDeleteServiceCategory);

export const serviceSubCategoryLegacyRouter = Router();
serviceSubCategoryLegacyRouter.use(optionalAuth);
serviceSubCategoryLegacyRouter.get('/', legacyGetServiceSubCategories);
serviceSubCategoryLegacyRouter.get('/get-all', legacyGetServiceSubCategories);
serviceSubCategoryLegacyRouter.post('/create', upload.any(), legacyCreateServiceSubCategory);
serviceSubCategoryLegacyRouter.post('/', upload.any(), legacyCreateServiceSubCategory);
serviceSubCategoryLegacyRouter.put('/update/:id', upload.any(), legacyUpdateServiceSubCategory);
serviceSubCategoryLegacyRouter.put('/:id', upload.any(), legacyUpdateServiceSubCategory);
serviceSubCategoryLegacyRouter.delete('/delete/:id', legacyDeleteServiceSubCategory);
serviceSubCategoryLegacyRouter.delete('/:id', legacyDeleteServiceSubCategory);

export const bookingLegacyRouter = Router();
bookingLegacyRouter.use(optionalAuth);
bookingLegacyRouter.post('/create', createBooking);
bookingLegacyRouter.post('/', createBooking);
bookingLegacyRouter.get('/get-all', authenticate, requireAdmin, getMyBookings);
bookingLegacyRouter.get('/get-by-user/:userId', getMyBookings);
bookingLegacyRouter.get('/', getMyBookings);
bookingLegacyRouter.get('/:id', getBookingById);
bookingLegacyRouter.put('/update-status/:id', updateBookingStatus);
bookingLegacyRouter.patch('/update-status/:id', updateBookingStatus);
bookingLegacyRouter.put('/:id/status', updateBookingStatus);
bookingLegacyRouter.patch('/:id/status', updateBookingStatus);
bookingLegacyRouter.put('/:id', updateBookingStatus);
bookingLegacyRouter.post('/:id/cancel', cancelBooking);

export const taxLegacyRouter = Router();
taxLegacyRouter.use(optionalAuth);
taxLegacyRouter.get('/', legacyGetTaxes);
taxLegacyRouter.get('/get-all', legacyGetTaxes);
taxLegacyRouter.post('/create', legacyCreateTax);
taxLegacyRouter.post('/', legacyCreateTax);
taxLegacyRouter.put('/update/:id', legacyUpdateTax);
taxLegacyRouter.put('/:id', legacyUpdateTax);
taxLegacyRouter.delete('/delete/:id', legacyDeleteTax);
taxLegacyRouter.delete('/:id', legacyDeleteTax);

export const couponLegacyRouter = Router();
couponLegacyRouter.use(optionalAuth);
couponLegacyRouter.get('/', legacyGetCoupons);
couponLegacyRouter.get('/get-all', legacyGetCoupons);
couponLegacyRouter.post('/create', legacyCreateCoupon);
couponLegacyRouter.post('/', legacyCreateCoupon);
couponLegacyRouter.put('/update/:id', legacyUpdateCoupon);
couponLegacyRouter.put('/:id', legacyUpdateCoupon);
couponLegacyRouter.delete('/delete/:id', legacyDeleteCoupon);
couponLegacyRouter.delete('/:id', legacyDeleteCoupon);

export const kycLegacyRouter = Router();
kycLegacyRouter.use(optionalAuth);
kycLegacyRouter.get('/', legacyGetKycs);
kycLegacyRouter.get('/get-all', authenticate, requireAdmin, legacyGetKycs);
kycLegacyRouter.put('/update/:id', legacyUpdateKyc);
kycLegacyRouter.patch('/:id/status', legacyUpdateKyc);
kycLegacyRouter.put('/:id/status', legacyUpdateKyc);
kycLegacyRouter.put('/:id', legacyUpdateKyc);

export const userLegacyRouter = Router();
userLegacyRouter.use(optionalAuth);
userLegacyRouter.get('/get-all', legacyGetAllUsers);
userLegacyRouter.get('/', legacyGetAllUsers);

export const analyticsLegacyRouter = Router();
analyticsLegacyRouter.use(optionalAuth);
analyticsLegacyRouter.get('/dashboard', legacyDashboardAnalytics);

export const auditLogLegacyRouter = Router();
auditLogLegacyRouter.use(optionalAuth);
auditLogLegacyRouter.get('/get-all', (req, res) => {
  res.status(200).json({
    status: true,
    success: true,
    auditLogs: [
      { id: '1', action: 'SYSTEM_BOOT', adminName: 'System', timestamp: new Date() }
    ],
    data: [
      { id: '1', action: 'SYSTEM_BOOT', adminName: 'System', timestamp: new Date() }
    ]
  });
});
auditLogLegacyRouter.get('/', (req, res) => {
  res.status(200).json({
    status: true,
    success: true,
    auditLogs: [
      { id: '1', action: 'SYSTEM_BOOT', adminName: 'System', timestamp: new Date() }
    ],
    data: [
      { id: '1', action: 'SYSTEM_BOOT', adminName: 'System', timestamp: new Date() }
    ]
  });
});
