/**
 * @file apps/api/routes/v1/home.routes.js
 * @description Dynamic aggregated homepage feed for mobile and web surfaces (/api/v1/home)
 */

import { Router } from 'express';
import Listing from '../../models/Listing.js';
import Service from '../../models/Service.js';
import Banner from '../../models/Banner.js';
import ProductCategory from '../../models/ProductCategory.js';
import { optionalAuth } from '../../middleware/auth.middleware.js';
import { asyncHandler } from '../../middleware/error.middleware.js';

const router = Router();

// GET /api/v1/home/home-data (or /home/home-data)
router.get('/home-data', optionalAuth, asyncHandler(async (req, res) => {
  const [banners, services, listings, categories] = await Promise.all([
    Banner.find({ isActive: true, placement: { $in: ['home', 'home_hero'] } }).sort({ sortOrder: 1, createdAt: -1 }).limit(10),
    Service.find({ isActive: true }).populate({ path: 'categoryId', select: 'name image', strictPopulate: false }).limit(6),
    Listing.find({ status: { $in: ['live', 'active'] } }).sort({ createdAt: -1 }).limit(20),
    ProductCategory.find({ isActive: true }).sort({ sortOrder: 1 })
  ]);

  // Dynamic hero banners matching the high-end UI design
  const formattedBanners = banners.length > 0 ? banners.map(b => ({
    _id: b._id,
    id: b._id.toString(),
    title: b.title,
    subtitle: b.subtitle || 'Shop Smart, Live Better.',
    ctaText: b.ctaText || 'Shop Now',
    ctaLink: b.linkUrl || '/products',
    targetScreen: b.targetScreen || 'ProductList',
    imageUrl: b.imageUrl,
    tag: b.tag || 'Special Offer',
    placement: b.placement || 'home_hero'
  })) : [
    {
      _id: 'banner-01',
      id: 'banner-01',
      title: 'Big Deals\nBigger Happiness',
      subtitle: 'Shop Smart, Live Better.',
      ctaText: 'Shop Now',
      ctaLink: '/products',
      targetScreen: 'ProductList',
      imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80',
      tag: 'Special Offer',
      placement: 'home_hero'
    },
    {
      _id: 'banner-02',
      id: 'banner-02',
      title: 'Verified Home Services\nAt Your Doorstep',
      subtitle: 'Cleaning, Repair, AC & Plumbing.',
      ctaText: 'Book Service',
      ctaLink: '/services',
      targetScreen: 'Services',
      imageUrl: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800&auto=format&fit=crop&q=80',
      tag: 'Trending',
      placement: 'home_hero'
    }
  ];

  // Quick navigation pill categories matching the UI spec
  const categoryPills = [
    { id: 'cat-all', name: 'Categories', icon: 'grid', route: 'AllItems' },
    { id: 'cat-offers', name: 'Offers', icon: 'pricetag', route: 'ProductList', params: { filter: 'discount' } },
    { id: 'cat-services', name: 'Services', icon: 'construct', route: 'Services' },
    { id: 'cat-ads', name: 'Ads', icon: 'megaphone', route: 'MyAds' },
    { id: 'cat-more', name: 'More', icon: 'ellipsis-horizontal', route: 'AllItems' }
  ];

  // Format nearby services with blueprint defaults if empty
  const defaultServices = [
    {
      id: 'svc-01',
      title: 'Home Cleaning',
      category: 'Cleaning',
      price: 499,
      formattedPrice: '₹499',
      rating: 4.9,
      reviewsCount: 48,
      imageUrl: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=600&auto=format&fit=crop&q=80'
    },
    {
      id: 'svc-02',
      title: 'AC Service',
      category: 'Appliance',
      price: 799,
      formattedPrice: '₹799',
      rating: 4.8,
      reviewsCount: 32,
      imageUrl: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=600&auto=format&fit=crop&q=80'
    },
    {
      id: 'svc-03',
      title: 'Plumbing Repair',
      category: 'Home Care',
      price: 349,
      formattedPrice: '₹349',
      rating: 4.7,
      reviewsCount: 29,
      imageUrl: 'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=600&auto=format&fit=crop&q=80'
    }
  ];

  const nearbyServices = services.length > 0
    ? services.map(s => ({
        id: s._id,
        title: s.title || s.name,
        category: s.category?.name || s.category || 'Home Services',
        price: s.basePrice || (s.packages && s.packages[0]?.price) || 499,
        formattedPrice: `₹${s.basePrice || (s.packages && s.packages[0]?.price) || 499}`,
        rating: s.rating || 4.8,
        reviewsCount: s.reviewCount || 12,
        imageUrl: s.images && s.images[0] ? s.images[0] : 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=600'
      }))
    : defaultServices;

  // Format popular products with blueprint defaults if empty
  const defaultProducts = [
    {
      id: 'prod-01',
      title: 'Wireless Earbuds',
      category: 'Electronics',
      price: 1999,
      formattedPrice: '₹1,999',
      originalPrice: '₹3,499',
      condition: 'New',
      location: 'Bengaluru',
      imageUrl: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600&auto=format&fit=crop&q=80',
      isFeatured: true
    },
    {
      id: 'prod-02',
      title: 'Smart Watch Series 8',
      category: 'Electronics',
      price: 3499,
      formattedPrice: '₹3,499',
      originalPrice: '₹5,999',
      condition: 'New',
      location: 'Bengaluru',
      imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80',
      isFeatured: true
    },
    {
      id: 'prod-03',
      title: 'Casual Denim Jacket',
      category: 'Fashion',
      price: 1299,
      formattedPrice: '₹1,299',
      originalPrice: '₹2,199',
      condition: 'Like New',
      location: 'Bengaluru',
      imageUrl: 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=600&auto=format&fit=crop&q=80',
      isFeatured: false
    },
    {
      id: 'prod-04',
      title: 'Ergonomic Office Chair',
      category: 'Furniture',
      price: 5499,
      formattedPrice: '₹5,499',
      originalPrice: '₹8,999',
      condition: 'Like New',
      location: 'Bengaluru',
      imageUrl: 'https://images.unsplash.com/photo-1580481077194-c78201a4fcf3?w=600&auto=format&fit=crop&q=80',
      isFeatured: true
    }
  ];

  const popularProducts = listings.length > 0
    ? listings.map(l => ({
        id: l._id,
        title: l.title,
        category: l.category || 'General',
        price: l.price || 0,
        formattedPrice: `₹${Number(l.price || 0).toLocaleString('en-IN')}`,
        originalPrice: l.originalPrice ? `₹${Number(l.originalPrice).toLocaleString('en-IN')}` : null,
        condition: l.condition || 'New',
        location: l.location?.city || 'Bengaluru',
        imageUrl: l.images && l.images[0] ? l.images[0] : 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600',
        isFeatured: Boolean(l.isFeatured)
      }))
    : defaultProducts;

  // User location
  let userLocation = {
    address: '123, MG Road, Bengaluru, Karnataka 560001',
    city: 'Bengaluru',
    state: 'Karnataka',
    pincode: '560001'
  };

  if (req.user && Array.isArray(req.user.addresses) && req.user.addresses.length > 0) {
    const defaultAddr = req.user.addresses.find(a => a.isDefault) || req.user.addresses[0];
    userLocation = {
      address: `${defaultAddr.street ? defaultAddr.street + ', ' : ''}${defaultAddr.city}, ${defaultAddr.state || 'Karnataka'}`,
      city: defaultAddr.city,
      state: defaultAddr.state || 'Karnataka',
      pincode: defaultAddr.pincode
    };
  }

  res.status(200).json({
    success: true,
    data: {
      banners: formattedBanners,
      categoryPills,
      categories: categories.map(c => ({
        id: c._id,
        _id: c._id,
        name: c.name,
        title: c.title || c.name,
        icon: c.icon,
        image: (Array.isArray(c.images) && c.images[0]) || c.image || c.icon,
        slug: c.slug,
        sortOrder: c.sortOrder
      })),
      nearbyServices,
      popularProducts,
      userLocation
    }
  });
}));

export default router;
