/**
 * @file apps/api/seeds/seedSampleData.js
 * @description Seeds initial representative marketplace listings, service ads, and banners
 */

import Listing from '../models/Listing.js';
import Service from '../models/Service.js';
import Banner from '../models/Banner.js';
import StaticPage from '../models/StaticPage.js';
import User from '../models/User.js';
import ProductCategory from '../models/ProductCategory.js';
import ServiceCategory from '../models/ServiceCategory.js';
import ProviderProfile from '../models/ProviderProfile.js';
import Booking from '../models/Booking.js';
import Report from '../models/Report.js';
import AuditLog from '../models/AuditLog.js';
import { ListingStatus, KycStatus, BookingStatus, PaymentStatus } from '../config/constants.js';

export const seedSampleData = async () => {
  console.log('[SEED] Checking sample listings & services...'.cyan);

  const seller = await User.findOne({ email: 'seller@bigbazaar.com' }) || await User.findOne();
  const provider = await User.findOne({ email: 'provider@bigbazaar.com' }) || await User.findOne();

  if (!seller) {
    console.warn('[SEED] No seller account found for sample data. Skipping listings.');
    return;
  }

  // 1. Seed Sample Listings if empty
  const listingCount = await Listing.countDocuments();
  if (listingCount === 0) {
    console.log('[SEED] Seeding sample marketplace listings...'.cyan);
    const electronicsCat = await ProductCategory.findOne({ name: 'Electronics' });
    const vehiclesCat = await ProductCategory.findOne({ name: 'Vehicles' });

    await Listing.create([
      {
        title: 'Apple iPhone 14 Pro Max - 128GB Deep Purple',
        description: 'Excellent condition with original box, bill, and Apple Care warranty. Battery health 94%. No scratches.',
        price: 74999,
        originalPrice: 129900,
        category: 'Electronics',
        subcategory: 'Smartphones',
        categoryId: electronicsCat?._id,
        condition: 'Like New',
        sellerId: seller._id,
        sellerName: seller.fullName,
        sellerPhone: seller.phoneNumber,
        images: ['https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800'],
        location: { city: 'Kottayam', pincode: '686001', state: 'Kerala' },
        status: ListingStatus.LIVE,
        isFeatured: true,
        attributes: { brand: 'Apple', storage: '128GB', color: 'Deep Purple' }
      },
      {
        title: 'Sony WH-1000XM5 Wireless Noise Canceling Headphones',
        description: 'Brand new sealed pack Sony XM5 wireless headphones. Active noise cancelling with 30-hour battery life.',
        price: 24999,
        originalPrice: 34990,
        category: 'Electronics',
        subcategory: 'Accessories',
        categoryId: electronicsCat?._id,
        condition: 'New',
        sellerId: seller._id,
        sellerName: seller.fullName,
        sellerPhone: seller.phoneNumber,
        images: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800'],
        location: { city: 'Changanassery', pincode: '686101', state: 'Kerala' },
        status: ListingStatus.LIVE,
        isFeatured: true
      },
      {
        title: 'Royal Enfield Classic 350 (2022) - Stealth Black',
        description: 'Single owner Royal Enfield Classic 350. Well maintained, periodic showroom service records available. 14,000 km driven.',
        price: 165000,
        originalPrice: 220000,
        category: 'Vehicles',
        subcategory: 'Motorcycles',
        categoryId: vehiclesCat?._id,
        condition: 'Good',
        sellerId: seller._id,
        sellerName: seller.fullName,
        sellerPhone: seller.phoneNumber,
        images: ['https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=800'],
        location: { city: 'Pala', pincode: '686575', state: 'Kerala' },
        status: ListingStatus.LIVE,
        isFeatured: false
      }
    ]);
  }

  // 2. Seed Sample Services if empty
  const serviceCount = await Service.countDocuments();
  if (serviceCount === 0 && provider) {
    console.log('[SEED] Seeding sample service offerings...'.cyan);
    const plumbingCat = await ServiceCategory.findOne({ name: 'Plumbing' });
    const electricianCat = await ServiceCategory.findOne({ name: 'Electrician' });

    await Service.create([
      {
        title: 'Expert Home Plumbing & Leakage Repair',
        description: 'Fast, verified 24/7 plumbing service. Tap leakage, flush tank repairs, pipe blockages, and water line fittings.',
        providerId: provider._id,
        providerName: provider.fullName,
        category: 'Plumbing',
        subcategory: 'Tap Leakage & Valve Repair',
        categoryId: plumbingCat?._id,
        basePrice: 299,
        packages: [
          { name: 'Standard Inspection & Minor Fix', price: 299, duration: '45 mins', features: ['Leak detection', 'Washer replacement', '30-day warranty'] },
          { name: 'Full Bathroom Fixture Fitting', price: 999, duration: '2 hours', features: ['Faucet & shower setup', 'Pressure check', '60-day warranty'] }
        ],
        images: ['https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800'],
        rating: 4.9,
        reviewCount: 42,
        timeEstimate: '30-60 mins',
        location: 'Kottayam',
        serviceAreas: ['Kottayam', 'Changanassery', 'Pala'],
        status: 'live'
      },
      {
        title: 'Professional Home Electrical Wiring & Appliance Setup',
        description: 'Licensed electricians for short circuit diagnosis, switchboard installations, inverter battery setups, and fan installations.',
        providerId: provider._id,
        providerName: provider.fullName,
        category: 'Electrician',
        subcategory: 'Switchboard & MCB Tripping',
        categoryId: electricianCat?._id,
        basePrice: 249,
        packages: [
          { name: 'Basic Check & Switch Fix', price: 249, duration: '30 mins', features: ['Voltage testing', '1-switch replacement'] },
          { name: 'Complete Distribution Box Setup', price: 1499, duration: '3 hours', features: ['MCB installation', 'Earthing check'] }
        ],
        images: ['https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=800'],
        rating: 4.8,
        reviewCount: 36,
        timeEstimate: '1-2 hours',
        location: 'Kottayam',
        serviceAreas: ['Kottayam', 'Changanassery'],
        status: 'live'
      }
    ]);
  }

  // 3. Seed Banners if empty
  const bannerCount = await Banner.countDocuments();
  if (bannerCount === 0) {
    await Banner.create([
      {
        title: 'Festive Electronics Sale',
        imageUrl: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1200',
        linkUrl: '/marketplace?category=Electronics',
        placement: 'home',
        sortOrder: 1,
        isActive: true
      },
      {
        title: 'Verified Home Services at Your Doorstep',
        imageUrl: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=1200',
        linkUrl: '/services',
        placement: 'services',
        sortOrder: 2,
        isActive: true
      }
    ]);
  }

  // 4. Seed Static CMS Pages if empty
  const staticPages = [
    { slug: 'about-us', title: 'About MyBigBazaar', content: 'MyBigBazaar is India\'s unified hyperlocal marketplace connecting buyers, sellers, and verified local service professionals.' },
    { slug: 'privacy-policy', title: 'Privacy Policy', content: 'We take your privacy seriously. Your data is encrypted in transit and never shared with unauthorized third parties.' },
    { slug: 'terms-conditions', title: 'Terms & Conditions', content: 'By using MyBigBazaar, you agree to abide by our fair trading rules, escrow safety policies, and community guidelines.' },
    { slug: 'refund-policy', title: 'Refund & Cancellation Policy', content: 'Service bookings can be cancelled up to 2 hours before scheduled time with full refund. Escrow payments are held securely until delivery.' }
  ];

  for (const page of staticPages) {
    await StaticPage.findOneAndUpdate(
      { slug: page.slug },
      { $setOnInsert: page },
      { upsert: true }
    );
  }

  // 5. Seed ProviderProfile if empty
  const buyer = await User.findOne({ email: 'buyer@bigbazaar.com' }) || await User.findOne();
  const admin = await User.findOne({ email: 'admin@bigbazaar.com' }) || await User.findOne();
  const plumbingCat = await ServiceCategory.findOne({ name: 'Plumbing' });

  if (provider) {
    const existingProfile = await ProviderProfile.findOne({ userId: provider._id });
    if (!existingProfile) {
      console.log('[SEED] Seeding provider KYC profile...'.cyan);
      await ProviderProfile.create({
        userId: provider._id,
        businessName: 'Apex Home Care & Electricals',
        experienceYears: 6,
        bio: 'Certified master electrician and professional plumber with 6+ years experience in Kerala.',
        serviceCategories: plumbingCat ? [plumbingCat._id] : [],
        serviceAreas: ['Kottayam', 'Changanassery', 'Pala'],
        kycStatus: KycStatus.VERIFIED,
        kycDocuments: [
          {
            docType: 'Aadhaar',
            docNumber: 'XXXX-XXXX-8921',
            docUrl: 'https://images.unsplash.com/photo-1606326608606-aa0b62935f2b?w=800',
            verifiedAt: new Date()
          },
          {
            docType: 'Trade License',
            docNumber: 'KL-KTM-TL-2023-994',
            docUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800',
            verifiedAt: new Date()
          }
        ],
        isAvailable: true,
        rating: 4.9,
        reviewCount: 42
      });
    }
  }

  // 6. Seed Sample Bookings if empty
  const bookingCount = await Booking.countDocuments();
  const sampleService = await Service.findOne();
  if (bookingCount === 0 && buyer && provider && sampleService) {
    console.log('[SEED] Seeding sample service bookings...'.cyan);
    await Booking.create([
      {
        customerId: buyer._id,
        providerId: provider._id,
        serviceId: sampleService._id,
        serviceName: sampleService.title,
        category: sampleService.category,
        subCategoryName: sampleService.subcategory,
        scheduledDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
        scheduledTimeSlot: '10:00 AM - 12:00 PM',
        providerName: provider.fullName,
        providerContact: provider.phoneNumber,
        serviceAddress: {
          houseNo: 'Flat 4B',
          street: 'Skyline Apartments',
          landmark: 'Near KSRTC',
          city: 'Kottayam',
          pincode: '686001',
          state: 'Kerala'
        },
        customerAddress: {
          addressLine1: 'Flat 4B, Skyline Apartments',
          city: 'Kottayam',
          pincode: '686001',
          state: 'Kerala'
        },
        amount: sampleService.basePrice,
        totalAmount: Math.round(sampleService.basePrice * 1.18) - 50,
        pricing: {
          basePrice: sampleService.basePrice,
          addonPrice: 0,
          discount: 50,
          tax: Math.round(sampleService.basePrice * 0.18),
          totalAmount: Math.round(sampleService.basePrice * 1.18) - 50
        },
        status: BookingStatus.CONFIRMED,
        paymentStatus: PaymentStatus.COMPLETED,
        paymentMethod: 'online'
      },
      {
        customerId: buyer._id,
        providerId: provider._id,
        serviceId: sampleService._id,
        serviceName: sampleService.title,
        category: sampleService.category,
        subCategoryName: sampleService.subcategory,
        scheduledDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        scheduledTimeSlot: '02:00 PM - 04:00 PM',
        providerName: provider.fullName,
        providerContact: provider.phoneNumber,
        serviceAddress: {
          houseNo: 'House 12',
          street: 'Riverview Enclave',
          landmark: 'Temple Road',
          city: 'Changanassery',
          pincode: '686101',
          state: 'Kerala'
        },
        customerAddress: {
          addressLine1: 'House 12, Riverview Enclave',
          city: 'Changanassery',
          pincode: '686101',
          state: 'Kerala'
        },
        amount: sampleService.basePrice,
        totalAmount: Math.round(sampleService.basePrice * 1.18),
        pricing: {
          basePrice: sampleService.basePrice,
          addonPrice: 0,
          discount: 0,
          tax: Math.round(sampleService.basePrice * 0.18),
          totalAmount: Math.round(sampleService.basePrice * 1.18)
        },
        status: BookingStatus.PENDING,
        paymentStatus: PaymentStatus.PENDING,
        paymentMethod: 'cash_on_delivery'
      }
    ]);
  }

  // 7. Seed Sample Report if empty
  const reportCount = await Report.countDocuments();
  const sampleListing = await Listing.findOne();
  if (reportCount === 0 && buyer && sampleListing) {
    console.log('[SEED] Seeding sample moderation report...'.cyan);
    await Report.create({
      reporterId: buyer._id,
      targetType: 'listing',
      targetId: sampleListing._id,
      reason: 'Suspicious pricing or description',
      description: 'Seller claims device is brand new, requested verification of warranty card.',
      status: 'pending'
    });
  }

  // 8. Seed Sample AuditLog if empty
  const auditCount = await AuditLog.countDocuments();
  if (auditCount === 0 && admin) {
    console.log('[SEED] Seeding sample security audit logs...'.cyan);
    await AuditLog.create([
      {
        actorId: admin._id,
        action: 'PLATFORM_INITIALIZATION',
        resourceType: 'system',
        resourceId: admin._id,
        details: { message: 'Platform core initialized with canonical categories and security configurations' },
        ipAddress: '127.0.0.1'
      },
      {
        actorId: admin._id,
        action: 'ADMIN_SIGN_IN',
        resourceType: 'auth',
        resourceId: admin._id,
        details: { email: admin.email, role: admin.role },
        ipAddress: '127.0.0.1'
      }
    ]);
  }

  console.log('[SEED] Sample listings, bookings, KYC, and CMS data ready!'.green);
};

export default seedSampleData;
