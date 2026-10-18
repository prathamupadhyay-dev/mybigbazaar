/**
 * Seed script to ensure rich dynamic banners for all placements exist in MongoDB
 */
import mongoose from 'mongoose';
import dns from 'dns';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

try {
  dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1', '1.0.0.1']);
} catch (dnsErr) {}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

const BannerSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    subtitle: { type: String, default: '' },
    imageUrl: { type: String, required: true },
    linkUrl: { type: String, default: '' },
    targetScreen: { type: String, default: 'ProductList' },
    ctaText: { type: String, default: 'Shop Now' },
    tag: { type: String, default: 'Special Offer' },
    placement: {
      type: String,
      enum: ['home_hero', 'onboarding', 'services', 'promotions', 'home', 'marketplace'],
      default: 'home_hero'
    },
    sortOrder: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    impressions: { type: Number, default: 0 },
    clicks: { type: Number, default: 0 },
    validUntil: { type: String, default: '2026-12-31' }
  },
  { timestamps: true, collection: 'HomeBanner' }
);

const Banner = mongoose.model('Banner', BannerSchema);

async function seed() {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.error('MONGO_URI is missing');
    process.exit(1);
  }

  await mongoose.connect(uri);
  console.log('Connected to MongoDB');

  const existingBanners = await Banner.find();
  console.log(`Found ${existingBanners.length} existing banners.`);

  const sampleBanners = [
    {
      title: 'Big Deals\nBigger Happiness',
      subtitle: 'Shop Smart, Live Better with verified local deals.',
      imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80',
      linkUrl: '/products',
      targetScreen: 'ProductList',
      ctaText: 'Shop Now',
      tag: 'Special Offer',
      placement: 'home_hero',
      sortOrder: 1,
      isActive: true,
      impressions: 4210,
      clicks: 482,
      validUntil: '2026-12-31'
    },
    {
      title: 'Verified Home Services\nAt Your Doorstep',
      subtitle: 'Cleaning, AC Repair, Plumbing & Electricians.',
      imageUrl: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800&auto=format&fit=crop&q=80',
      linkUrl: '/services',
      targetScreen: 'Services',
      ctaText: 'Book Service',
      tag: 'Trending',
      placement: 'home_hero',
      sortOrder: 2,
      isActive: true,
      impressions: 3190,
      clicks: 345,
      validUntil: '2026-12-31'
    },
    {
      title: 'Unbeatable Prices!',
      subtitle: 'Exclusive discounts, limited-time deals & the best prices nearby.',
      imageUrl: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=800&auto=format&fit=crop&q=80',
      linkUrl: '/products?filter=discount',
      targetScreen: 'ProductList',
      ctaText: 'Get Flat ₹300 Off',
      tag: 'First Open',
      placement: 'onboarding',
      sortOrder: 1,
      isActive: true,
      impressions: 5620,
      clicks: 890,
      validUntil: '2026-12-31'
    },
    {
      title: 'Your Favorite Brands, All in One Place',
      subtitle: 'From premium electronics to everyday home essentials.',
      imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80',
      linkUrl: '/products',
      targetScreen: 'AllItems',
      ctaText: 'Explore Brands',
      tag: 'Verified',
      placement: 'onboarding',
      sortOrder: 2,
      isActive: true,
      impressions: 5120,
      clicks: 720,
      validUntil: '2026-12-31'
    },
    {
      title: 'Fashion for Everyone, Every Occasion',
      subtitle: 'Find styles that match your vibe with verified local sellers.',
      imageUrl: 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=800&auto=format&fit=crop&q=80',
      linkUrl: '/products?category=Fashion',
      targetScreen: 'ProductList',
      ctaText: 'Shop Fashion',
      tag: 'New Styles',
      placement: 'onboarding',
      sortOrder: 3,
      isActive: true,
      impressions: 4890,
      clicks: 654,
      validUntil: '2026-12-31'
    },
    {
      title: 'Professional Home Care & Repair',
      subtitle: 'Save up to 25% on certified AC and appliance repairs today.',
      imageUrl: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=800&auto=format&fit=crop&q=80',
      linkUrl: '/services',
      targetScreen: 'Services',
      ctaText: 'Book Now',
      tag: 'Popular',
      placement: 'services',
      sortOrder: 1,
      isActive: true,
      impressions: 2140,
      clicks: 298,
      validUntil: '2026-12-31'
    },
    {
      title: 'Turn Unused Items Into Instant Cash',
      subtitle: 'Post free ads locally and connect with verified buyers near you.',
      imageUrl: 'https://images.unsplash.com/photo-1556742049-0a67c5574f73?w=800&auto=format&fit=crop&q=80',
      linkUrl: '/ads/post',
      targetScreen: 'PostAd',
      ctaText: 'Post an Ad',
      tag: 'Earn Cash',
      placement: 'promotions',
      sortOrder: 1,
      isActive: true,
      impressions: 3870,
      clicks: 512,
      validUntil: '2026-12-31'
    }
  ];

  for (const item of sampleBanners) {
    const existing = await Banner.findOne({ title: item.title });
    if (existing) {
      Object.assign(existing, item);
      await existing.save();
      console.log(`Updated banner: ${item.title}`);
    } else {
      await Banner.create(item);
      console.log(`Created banner: ${item.title}`);
    }
  }

  console.log('Seeding completed successfully!');
  await mongoose.disconnect();
  process.exit(0);
}

seed().catch(err => {
  console.error('Seed error:', err);
  process.exit(1);
});
