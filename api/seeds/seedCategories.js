/**
 * @file apps/api/seeds/seedCategories.js
 * @description Seeds canonical marketplace & service category taxonomies idempotently
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import ProductCategory from '../models/ProductCategory.js';
import ProductSubCategory from '../models/ProductSubCategory.js';
import ServiceCategory from '../models/ServiceCategory.js';
import ServiceSubCategory from '../models/ServiceSubCategory.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const seedCategories = async () => {
  console.log('[SEED] Seeding canonical categories & subcategories...'.cyan);

  // 1. Load canonical marketplace categories JSON
  const canonicalPath = path.resolve(
    __dirname,
    '../../../docs/legacy-audit/backend/reference-data/canonical-categories.json'
  );

  let marketplaceCategories = [];
  if (fs.existsSync(canonicalPath)) {
    const raw = fs.readFileSync(canonicalPath, 'utf8');
    const parsed = JSON.parse(raw);
    marketplaceCategories = parsed.categories || [];
  } else {
    marketplaceCategories = [
      { name: 'Electronics', slug: 'electronics', subcategories: ['Smartphones', 'Laptops & Computers', 'TV & Audio', 'Cameras', 'Accessories'] },
      { name: 'Vehicles', slug: 'vehicles', subcategories: ['Cars', 'Motorcycles', 'Scooters', 'Bicycles', 'Spare Parts'] },
      { name: 'Furniture', slug: 'furniture', subcategories: ['Sofas & Living Room', 'Beds & Mattresses', 'Office Furniture', 'Dining Tables', 'Wardrobes'] },
      { name: 'Appliances', slug: 'appliances', subcategories: ['Refrigerators', 'Washing Machines', 'Air Conditioners', 'Microwaves', 'Kitchen Appliances'] },
      { name: 'Fashion', slug: 'fashion', subcategories: ['Men\'s Clothing', 'Women\'s Clothing', 'Watches', 'Footwear', 'Bags & Luggage'] },
      { name: 'Sports', slug: 'sports', subcategories: ['Fitness & Gym Equipment', 'Cricket & Outdoor Gear', 'Bicycles', 'Camping'] },
      { name: 'Books', slug: 'books', subcategories: ['Fiction & Novels', 'Higher Education Textbooks', 'Competitive Exam Prep', 'Comics & Manga'] }
    ];
  }

  for (let i = 0; i < marketplaceCategories.length; i++) {
    const item = marketplaceCategories[i];
    const category = await ProductCategory.findOneAndUpdate(
      { name: item.name },
      {
        $setOnInsert: {
          name: item.name,
          slug: item.slug || item.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          title: `${item.name} Marketplace`,
          sortOrder: i,
          isActive: true
        }
      },
      { upsert: true, returnDocument: 'after' }
    );

    if (Array.isArray(item.subcategories)) {
      for (let j = 0; j < item.subcategories.length; j++) {
        const subName = item.subcategories[j];
        await ProductSubCategory.findOneAndUpdate(
          { productCategoryId: category._id, name: subName },
          {
            $setOnInsert: {
              productCategoryId: category._id,
              name: subName,
              slug: subName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
              sortOrder: j,
              isActive: true
            }
          },
          { upsert: true, returnDocument: 'after' }
        );
      }
    }
  }

  // 2. Service Categories & Subcategories
  const serviceHierarchy = [
    {
      name: 'Plumbing',
      slug: 'plumbing',
      subcategories: [
        { name: 'Tap Leakage & Valve Repair', basePrice: 299 },
        { name: 'Pipe Fitting & Drainage', basePrice: 499 },
        { name: 'Water Heater & Geyser Installation', basePrice: 599 },
        { name: 'Toilet & Sanitary Fitting', basePrice: 699 },
        { name: 'Full Bathroom Renovation', basePrice: 4999 }
      ]
    },
    {
      name: 'Electrician',
      slug: 'electrician',
      subcategories: [
        { name: 'Switchboard & MCB Tripping', basePrice: 249 },
        { name: 'Ceiling Fan & Light Installation', basePrice: 199 },
        { name: 'Complete Home Wiring', basePrice: 3499 },
        { name: 'Appliance Repair & Servicing', basePrice: 449 },
        { name: 'Inverter & Battery Setup', basePrice: 799 }
      ]
    },
    {
      name: 'Home Cleaning',
      slug: 'home-cleaning',
      subcategories: [
        { name: 'Full Deep Cleaning', basePrice: 2499 },
        { name: 'Kitchen Deep Cleaning', basePrice: 999 },
        { name: 'Bathroom Sanitization', basePrice: 499 },
        { name: 'Sofa & Carpet Shampooing', basePrice: 799 }
      ]
    },
    {
      name: 'AC Repair',
      slug: 'ac-repair',
      subcategories: [
        { name: 'AC Servicing & Gas Refill', basePrice: 1499 },
        { name: 'AC Installation & Uninstallation', basePrice: 999 },
        { name: 'Cooling Issue & Leakage', basePrice: 599 }
      ]
    },
    {
      name: 'Carpentry',
      slug: 'carpentry',
      subcategories: [
        { name: 'Furniture Repair & Assembly', basePrice: 399 },
        { name: 'Door & Lock Fitting', basePrice: 349 },
        { name: 'Custom Wardrobes & Modular Work', basePrice: 2999 }
      ]
    },
    {
      name: 'Tutoring',
      slug: 'tutoring',
      subcategories: [
        { name: 'Class 1-5 Primary Foundation', basePrice: 1500 },
        { name: 'Class 6-10 Mathematics & Science', basePrice: 2500 },
        { name: 'Class 11-12 Board Exam Prep', basePrice: 3500 }
      ]
    },
    {
      name: 'Painting',
      slug: 'painting',
      subcategories: [
        { name: 'Interior Wall Painting', basePrice: 4999 },
        { name: 'Exterior Weatherproof Painting', basePrice: 8999 },
        { name: 'Waterproofing & Seepage Treatment', basePrice: 2999 }
      ]
    },
    {
      name: 'Salon',
      slug: 'salon',
      subcategories: [
        { name: 'Haircut & Styling (At Home)', basePrice: 399 },
        { name: 'Facial & Skin Glow Treatment', basePrice: 899 },
        { name: 'Manicure & Pedicure', basePrice: 699 }
      ]
    },
    {
      name: 'Pest Control',
      slug: 'pest-control',
      subcategories: [
        { name: 'Cockroach & Ant Control', basePrice: 799 },
        { name: 'Termite Treatment Protection', basePrice: 2199 },
        { name: 'Bed Bug Eradication', basePrice: 1299 }
      ]
    }
  ];

  for (let i = 0; i < serviceHierarchy.length; i++) {
    const sCat = serviceHierarchy[i];
    const category = await ServiceCategory.findOneAndUpdate(
      { name: sCat.name },
      {
        $setOnInsert: {
          name: sCat.name,
          slug: sCat.slug,
          title: `${sCat.name} Services`,
          sortOrder: i,
          isActive: true
        }
      },
      { upsert: true, new: true }
    );

    for (let j = 0; j < sCat.subcategories.length; j++) {
      const sub = sCat.subcategories[j];
      await ServiceSubCategory.findOneAndUpdate(
        { serviceCategoryId: category._id, name: sub.name },
        {
          $setOnInsert: {
            serviceCategoryId: category._id,
            name: sub.name,
            slug: sub.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
            basePrice: sub.basePrice,
            sortOrder: j,
            isActive: true
          }
        },
        { upsert: true, new: true }
      );
    }
  }

  console.log('[SEED] Categories seeded successfully!'.green);
};

export default seedCategories;
