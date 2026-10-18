/**
 * @file seedMarketplaceComplete.js
 * @description End-to-End Marketplace Seeder & Activity Simulator (ES Module):
 * 1. Clears all old dummy products, orders, transactions, and reviews
 * 2. Seeds all 11 Categories, Seller Forms, and GST Tax Slabs
 * 3. Creates Admin user + Verified Mobile App phone user (Aarav Sharma) + Buyers
 * 4. Empties every user's wallet balance to ₹0 (100% dynamic wallet state)
 * 5. Seeds 5 realistic listings in EACH of the 11 categories (55 Admin listings) with full Seller Form attributes & multi-photo galleries
 * 6. Seeds 6 listings created from the Mobile App user (Aarav Sharma, +919876543210)
 * 7. Mock-buys listings to create Pending Orders, Completed Orders, and Cancelled Orders with GST Tax breakdowns & Payment Transactions
 * 8. Submits verified Buyer Reviews & Ratings on listings
 */

import dotenv from 'dotenv';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

import { User } from '../models/User.js';
import { ProductCategory } from '../models/ProductCategory.js';
import { Listing } from '../models/Listing.js';
import { Tax } from '../models/Tax.js';
import { Order } from '../models/Order.js';
import { Payment } from '../models/Payment.js';
import { Review } from '../models/Review.js';
import { ensureAllCategoryFormsSeeded } from '../controllers/sellerForm.controller.js';
import { connectDB } from '../config/db.js';

dotenv.config();

const CATEGORY_DEFINITIONS = [
  { name: 'Cars', slug: 'cars', icon: 'car-sport', description: 'Pre-owned & certified cars with Brand, Model, Variant, Year, Fuel & KM specs' },
  { name: 'Properties', slug: 'properties', icon: 'business', description: 'Apartments, Villas, Builder Floors & Commercial Properties' },
  { name: 'Mobiles', slug: 'mobiles', icon: 'phone-portrait', description: 'Smartphones, iPhones & Flagship Android Devices' },
  { name: 'Bikes', slug: 'bikes', icon: 'bicycle', description: 'Motorcycles, Cruiser Bikes, Sports Bikes & Scooters' },
  { name: 'Electronics & Appliances', slug: 'electronics-appliances', icon: 'tv', description: 'Laptops, Smart TVs, Cameras, ACs & Home Appliances' },
  { name: 'Commercial Vehicles & Spares', slug: 'commercial-vehicles-spares', icon: 'bus', description: 'Pickup Trucks, Mini Trucks, Vans & Commercial Fleet' },
  { name: 'Furniture', slug: 'furniture', icon: 'bed', description: 'Sofa Sets, Dining Tables, King Beds & Study Desks' },
  { name: 'Fashion', slug: 'fashion', icon: 'shirt', description: 'Designer Apparel, Sneakers, Watches & Luxury Handbags' },
  { name: 'Books, Sports & Hobbies', slug: 'books-sports-hobbies', icon: 'football', description: 'Musical Instruments, Cricket Kits, Gym Gear & Books' },
  { name: 'Pets', slug: 'pets', icon: 'paw', description: 'Purebred Dogs, Cats, Aquariums & Pet Accessories' },
  { name: 'Services', slug: 'services', icon: 'construct', description: 'Home Cleaning, AC Repair, Packers & Movers, Web & Tax Services' }
];

const PHOTO_GALLERIES = {
  Cars: [
    'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=1000&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=1000&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=1000&auto=format&fit=crop&q=80'
  ],
  Properties: [
    'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1000&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1000&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1000&auto=format&fit=crop&q=80'
  ],
  Mobiles: [
    'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=1000&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=1000&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1580910051074-3eb694886505?w=1000&auto=format&fit=crop&q=80'
  ],
  Bikes: [
    'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=1000&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=1000&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1449426468159-d96dbf08f19f?w=1000&auto=format&fit=crop&q=80'
  ],
  'Electronics & Appliances': [
    'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=1000&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=1000&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=1000&auto=format&fit=crop&q=80'
  ],
  'Commercial Vehicles & Spares': [
    'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=1000&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1519003722824-194d4455a60c?w=1000&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=1000&auto=format&fit=crop&q=80'
  ],
  Furniture: [
    'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=1000&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1538688525198-9b88f6f53126?w=1000&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=1000&auto=format&fit=crop&q=80'
  ],
  Fashion: [
    'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1000&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=1000&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=1000&auto=format&fit=crop&q=80'
  ],
  'Books, Sports & Hobbies': [
    'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=1000&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1517649763962-0c623066013b?w=1000&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=1000&auto=format&fit=crop&q=80'
  ],
  Pets: [
    'https://images.unsplash.com/photo-1552053831-71594a27632d?w=1000&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=1000&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=1000&auto=format&fit=crop&q=80'
  ],
  Services: [
    'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=1000&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=1000&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1000&auto=format&fit=crop&q=80'
  ]
};

const CITY_COORDS = {
  Indore: [75.8577, 22.7196],
  Bhopal: [77.4126, 23.2599],
  Mumbai: [72.8777, 19.0760],
  Bengaluru: [77.5946, 12.9716],
  'New Delhi': [77.2090, 28.6139],
  Pune: [73.8567, 18.5204]
};

const ADMIN_PRODUCTS_BY_CATEGORY = {
  Cars: [
    {
      title: 'Hyundai Creta SX (O) Turbo (2023) - Petrol Automatic',
      price: 1585000,
      city: 'Indore',
      address: 'Vijay Nagar',
      state: 'Madhya Pradesh',
      attributes: {
        brand: 'Hyundai / Creta / SX (O) Turbo',
        brandName: 'Hyundai',
        model: 'Creta',
        variant: 'SX (O) Turbo',
        year: '2023',
        fuel: 'Petrol',
        transmission: 'Automatic',
        kmDriven: '14200',
        owners: '1st'
      }
    },
    {
      title: 'Maruti Suzuki Dzire ZXI Plus (2022) - CNG & Hybrids Manual',
      price: 745000,
      city: 'Indore',
      address: 'Sangam Nagar',
      state: 'Madhya Pradesh',
      attributes: {
        brand: 'Maruti Suzuki / Dzire / ZXI Plus',
        brandName: 'Maruti Suzuki',
        model: 'Dzire',
        variant: 'ZXI Plus',
        year: '2022',
        fuel: 'CNG & Hybrids',
        transmission: 'Manual',
        kmDriven: '22800',
        owners: '1st'
      }
    },
    {
      title: 'Tata Nexon Fearless Plus S (2024) - Diesel Automatic',
      price: 1290000,
      city: 'Bhopal',
      address: 'MP Nagar',
      state: 'Madhya Pradesh',
      attributes: {
        brand: 'Tata / Nexon / Fearless Plus S',
        brandName: 'Tata',
        model: 'Nexon',
        variant: 'Fearless Plus S',
        year: '2024',
        fuel: 'Diesel',
        transmission: 'Automatic',
        kmDriven: '8900',
        owners: '1st'
      }
    },
    {
      title: 'Mahindra Thar LX Hard Top 4WD AT (2023) - Diesel',
      price: 1520000,
      city: 'Mumbai',
      address: 'Andheri West',
      state: 'Maharashtra',
      attributes: {
        brand: 'Mahindra / Thar / LX Hard Top 4WD AT',
        brandName: 'Mahindra',
        model: 'Thar',
        variant: 'LX Hard Top 4WD AT',
        year: '2023',
        fuel: 'Diesel',
        transmission: 'Automatic',
        kmDriven: '16500',
        owners: '1st'
      }
    },
    {
      title: 'Toyota Innova HyCross ZX (O) Hybrid (2024) - Automatic',
      price: 2850000,
      city: 'Bengaluru',
      address: 'Koramangala',
      state: 'Karnataka',
      attributes: {
        brand: 'Toyota / Innova HyCross / ZX (O) Hybrid',
        brandName: 'Toyota',
        model: 'Innova HyCross',
        variant: 'ZX (O) Hybrid',
        year: '2024',
        fuel: 'CNG & Hybrids',
        transmission: 'Automatic',
        kmDriven: '11200',
        owners: '1st'
      }
    }
  ],
  Properties: [
    {
      title: '3 BHK Apartments (1650 sqft) in Silver Crest Heights - Furnished',
      price: 7850000,
      city: 'Indore',
      address: 'Vijay Nagar',
      state: 'Madhya Pradesh',
      attributes: {
        propertyType: 'Apartments',
        bhk: '3',
        bathrooms: '3',
        furnishing: 'Furnished',
        projectStatus: 'Ready to Move',
        listedBy: 'Owner',
        superBuiltupArea: '1650',
        carpetArea: '1380',
        maintenanceMonthly: '2800',
        totalFloors: '14',
        floorNo: '7',
        carParking: '2',
        facing: 'East',
        projectName: 'Silver Crest Heights'
      }
    },
    {
      title: '4 BHK Houses & Villas (2800 sqft) in Apollo DB City',
      price: 16500000,
      city: 'Indore',
      address: 'Nipania',
      state: 'Madhya Pradesh',
      attributes: {
        propertyType: 'Houses & Villas',
        bhk: '4',
        bathrooms: '4',
        furnishing: 'Semi-Furnished',
        projectStatus: 'Ready to Move',
        listedBy: 'Owner',
        superBuiltupArea: '2800',
        carpetArea: '2400',
        maintenanceMonthly: '3500',
        totalFloors: '2',
        floorNo: '1',
        carParking: '2',
        facing: 'North-East',
        projectName: 'Apollo DB City'
      }
    },
    {
      title: '2 BHK Apartments (1180 sqft) in Skye Luxuria - Ready to Move',
      price: 5400000,
      city: 'Indore',
      address: 'Super Corridor',
      state: 'Madhya Pradesh',
      attributes: {
        propertyType: 'Apartments',
        bhk: '2',
        bathrooms: '2',
        furnishing: 'Semi-Furnished',
        projectStatus: 'Ready to Move',
        listedBy: 'Builder',
        superBuiltupArea: '1180',
        carpetArea: '960',
        maintenanceMonthly: '2000',
        totalFloors: '18',
        floorNo: '11',
        carParking: '1',
        facing: 'East',
        projectName: 'Skye Luxuria'
      }
    },
    {
      title: '3 BHK Builder Floors (1850 sqft) in Emerald Park',
      price: 9200000,
      city: 'Bhopal',
      address: 'Arera Colony',
      state: 'Madhya Pradesh',
      attributes: {
        propertyType: 'Builder Floors',
        bhk: '3',
        bathrooms: '3',
        furnishing: 'Furnished',
        projectStatus: 'Ready to Move',
        listedBy: 'Owner',
        superBuiltupArea: '1850',
        carpetArea: '1590',
        maintenanceMonthly: '1800',
        totalFloors: '4',
        floorNo: '2',
        carParking: '2',
        facing: 'North',
        projectName: 'Emerald Park'
      }
    },
    {
      title: 'Commercial Office / Shop (1200 sqft) in Palasia Business Hub',
      price: 11200000,
      city: 'Indore',
      address: 'Palasia',
      state: 'Madhya Pradesh',
      attributes: {
        propertyType: 'Commercial Office / Shop',
        bhk: '2',
        bathrooms: '2',
        furnishing: 'Furnished',
        projectStatus: 'Ready to Move',
        listedBy: 'Owner',
        superBuiltupArea: '1200',
        carpetArea: '1020',
        maintenanceMonthly: '4200',
        totalFloors: '8',
        floorNo: '3',
        carParking: '2',
        facing: 'East',
        projectName: 'Palasia Business Hub'
      }
    }
  ],
  Mobiles: [
    {
      title: 'Apple iPhone 16 Pro Max 256 GB - Brand New (Sealed)',
      price: 119900,
      city: 'Indore',
      address: 'Vijay Nagar',
      state: 'Madhya Pradesh',
      attributes: {
        brand: 'Apple / iPhone 16 Pro Max / 256 GB',
        brandName: 'Apple',
        model: 'iPhone 16 Pro Max',
        variant: '256 GB',
        ram: '8 GB',
        warranty: 'In Warranty',
        conditionDetail: 'Brand New (Sealed)',
        chargerIncluded: 'Original Box & Charger'
      }
    },
    {
      title: 'Samsung Galaxy S24 Ultra 512 GB - Like New (Mint)',
      price: 89500,
      city: 'Mumbai',
      address: 'Bandra West',
      state: 'Maharashtra',
      attributes: {
        brand: 'Samsung / Galaxy S24 Ultra / 512 GB',
        brandName: 'Samsung',
        model: 'Galaxy S24 Ultra',
        variant: '512 GB',
        ram: '12 GB',
        warranty: 'In Warranty',
        conditionDetail: 'Like New (Mint)',
        chargerIncluded: 'Original Box & Charger'
      }
    },
    {
      title: 'OnePlus 12 256 GB (16 GB RAM) - Like New (Mint)',
      price: 51000,
      city: 'Indore',
      address: 'Palasia',
      state: 'Madhya Pradesh',
      attributes: {
        brand: 'OnePlus / OnePlus 12 / 256 GB',
        brandName: 'OnePlus',
        model: 'OnePlus 12',
        variant: '256 GB',
        ram: '16 GB',
        warranty: 'In Warranty',
        conditionDetail: 'Like New (Mint)',
        chargerIncluded: 'Original Box & Charger'
      }
    },
    {
      title: 'Google Pixel 9 Pro 256 GB - In Warranty',
      price: 78000,
      city: 'Bengaluru',
      address: 'Indiranagar',
      state: 'Karnataka',
      attributes: {
        brand: 'Google / Pixel 9 Pro / 256 GB',
        brandName: 'Google',
        model: 'Pixel 9 Pro',
        variant: '256 GB',
        ram: '16 GB',
        warranty: 'In Warranty',
        conditionDetail: 'Like New (Mint)',
        chargerIncluded: 'Original Box & Charger'
      }
    },
    {
      title: 'Apple iPhone 15 Pro 128 GB - Natural Titanium',
      price: 82000,
      city: 'New Delhi',
      address: 'Connaught Place',
      state: 'Delhi',
      attributes: {
        brand: 'Apple / iPhone 15 Pro / 128 GB',
        brandName: 'Apple',
        model: 'iPhone 15 Pro',
        variant: '128 GB',
        ram: '8 GB',
        warranty: 'In Warranty',
        conditionDetail: 'Like New (Mint)',
        chargerIncluded: 'Original Box & Charger'
      }
    }
  ],
  Bikes: [
    {
      title: 'Royal Enfield Classic 350 Halcyon (2023) - 6,800 km',
      price: 182000,
      city: 'Indore',
      address: 'Vijay Nagar',
      state: 'Madhya Pradesh',
      attributes: {
        brand: 'Royal Enfield / Classic 350 / Halcyon',
        brandName: 'Royal Enfield',
        model: 'Classic 350',
        variant: 'Halcyon',
        year: '2023',
        kmDriven: '6800',
        fuel: 'Petrol',
        owners: '1st'
      }
    },
    {
      title: 'KTM Duke 390 Standard ABS (2023) - 5,400 km',
      price: 255000,
      city: 'Pune',
      address: 'Koregaon Park',
      state: 'Maharashtra',
      attributes: {
        brand: 'KTM / Duke 390 / Standard ABS',
        brandName: 'KTM',
        model: 'Duke 390',
        variant: 'Standard ABS',
        year: '2023',
        kmDriven: '5400',
        fuel: 'Petrol',
        owners: '1st'
      }
    },
    {
      title: 'Yamaha R15 V4 M Metallic (2024) - 3,200 km',
      price: 168000,
      city: 'Indore',
      address: 'Bhawarkua',
      state: 'Madhya Pradesh',
      attributes: {
        brand: 'Yamaha / R15 V4 / M Metallic',
        brandName: 'Yamaha',
        model: 'R15 V4',
        variant: 'M Metallic',
        year: '2024',
        kmDriven: '3200',
        fuel: 'Petrol',
        owners: '1st'
      }
    },
    {
      title: 'Honda Activa 6G H-Smart (2023) - 4,900 km',
      price: 72000,
      city: 'Bhopal',
      address: 'MP Nagar',
      state: 'Madhya Pradesh',
      attributes: {
        brand: 'Honda / Activa 6G / H-Smart',
        brandName: 'Honda',
        model: 'Activa 6G',
        variant: 'H-Smart',
        year: '2023',
        kmDriven: '4900',
        fuel: 'Petrol',
        owners: '1st'
      }
    },
    {
      title: 'TVS iQube Electric S (2024) - 2,800 km Electric Scooter',
      price: 118000,
      city: 'Bengaluru',
      address: 'HSR Layout',
      state: 'Karnataka',
      attributes: {
        brand: 'TVS / iQube Electric / S',
        brandName: 'TVS',
        model: 'iQube Electric',
        variant: 'S',
        year: '2024',
        kmDriven: '2800',
        fuel: 'Electric',
        owners: '1st'
      }
    }
  ],
  'Electronics & Appliances': [
    {
      title: 'Apple MacBook Pro 16 M3 Max (36GB / 1TB) - Brand New',
      price: 245000,
      city: 'Indore',
      address: 'Vijay Nagar',
      state: 'Madhya Pradesh',
      attributes: {
        applianceType: 'Laptops & Computers',
        brand: 'Apple',
        model: 'MacBook Pro 16 M3 Max',
        conditionDetail: 'Brand New',
        warranty: 'Under Warranty',
        age: 'Less than 6 Months'
      }
    },
    {
      title: 'Sony Bravia XR 65" 4K OLED Google TV - Like New',
      price: 138000,
      city: 'Mumbai',
      address: 'Powai',
      state: 'Maharashtra',
      attributes: {
        applianceType: 'TVs, Video & Audio',
        brand: 'Sony',
        model: 'Bravia XR-65A80L OLED',
        conditionDetail: 'Like New',
        warranty: 'Under Warranty',
        age: 'Less than 6 Months'
      }
    },
    {
      title: 'Sony Alpha A7 IV Mirrorless Camera + 24-70mm GM II Lens',
      price: 185000,
      city: 'New Delhi',
      address: 'Hauz Khas',
      state: 'Delhi',
      attributes: {
        applianceType: 'Cameras & Lenses',
        brand: 'Sony',
        model: 'Alpha A7 IV Full-Frame',
        conditionDetail: 'Like New',
        warranty: 'Under Warranty',
        age: '6 - 12 Months'
      }
    },
    {
      title: 'Daikin 1.5 Ton 5 Star Inverter Split AC (2024 Copper)',
      price: 36500,
      city: 'Indore',
      address: 'Palasia',
      state: 'Madhya Pradesh',
      attributes: {
        applianceType: 'ACs & Air Coolers',
        brand: 'Daikin',
        model: 'FTKM50U 5-Star Inverter',
        conditionDetail: 'Like New',
        warranty: 'Under Warranty',
        age: 'Less than 6 Months'
      }
    },
    {
      title: 'LG 655L Side-by-Side Frost Free Smart Inverter Refrigerator',
      price: 64000,
      city: 'Bhopal',
      address: 'Arera Colony',
      state: 'Madhya Pradesh',
      attributes: {
        applianceType: 'Fridges & Washing Machines',
        brand: 'LG',
        model: 'GL-B257HDSY 655L',
        conditionDetail: 'Like New',
        warranty: 'Under Warranty',
        age: '6 - 12 Months'
      }
    }
  ],
  'Commercial Vehicles & Spares': [
    {
      title: 'Tata Intra V30 Pickup Truck (2023) - Diesel',
      price: 685000,
      city: 'Indore',
      address: 'Dewas Naka',
      state: 'Madhya Pradesh',
      attributes: {
        vehicleType: 'Pickup Trucks & Mini Trucks',
        brand: 'Tata Motors',
        year: '2023',
        kmDriven: '24000',
        fuel: 'Diesel',
        owners: '1st'
      }
    },
    {
      title: 'Mahindra Bolero Pik-Up ExtraLong FB 1.7T (2022)',
      price: 760000,
      city: 'Bhopal',
      address: 'Govindpura',
      state: 'Madhya Pradesh',
      attributes: {
        vehicleType: 'Pickup Trucks & Mini Trucks',
        brand: 'Mahindra',
        year: '2022',
        kmDriven: '31500',
        fuel: 'Diesel',
        owners: '1st'
      }
    },
    {
      title: 'Force Traveller 3350 Super 13-Seater AC Van (2023)',
      price: 1320000,
      city: 'Indore',
      address: 'Super Corridor',
      state: 'Madhya Pradesh',
      attributes: {
        vehicleType: 'Buses & Vans',
        brand: 'Force Motors',
        year: '2023',
        kmDriven: '19000',
        fuel: 'Diesel',
        owners: '1st'
      }
    },
    {
      title: 'Ashok Leyland Bada Dost i4 LS (2023) - 18,000 km',
      price: 790000,
      city: 'Mumbai',
      address: 'Navi Mumbai',
      state: 'Maharashtra',
      attributes: {
        vehicleType: 'Pickup Trucks & Mini Trucks',
        brand: 'Ashok Leyland',
        year: '2023',
        kmDriven: '18000',
        fuel: 'Diesel',
        owners: '1st'
      }
    },
    {
      title: 'Bajaj Maxima Z CNG Passenger Auto Rickshaw (2024)',
      price: 215000,
      city: 'Indore',
      address: 'Rajwada',
      state: 'Madhya Pradesh',
      attributes: {
        vehicleType: 'Auto Rickshaws & E-Rickshaws',
        brand: 'Bajaj Commercial',
        year: '2024',
        kmDriven: '7400',
        fuel: 'CNG',
        owners: '1st'
      }
    }
  ],
  Furniture: [
    {
      title: 'Solid Wood / Teak 6-Seater L-Shape Sofa & Couch Set - Brand New',
      price: 42500,
      city: 'Indore',
      address: 'Vijay Nagar',
      state: 'Madhya Pradesh',
      attributes: {
        furnitureType: 'Sofa & Couch Set',
        material: 'Solid Wood / Teak',
        conditionDetail: 'Brand New',
        dimensions: '96 x 64 x 34 inches',
        assembly: 'Pre-Assembled'
      }
    },
    {
      title: 'Burma Teak King Size Bed with Hydraulic Storage & Ortho Mattress',
      price: 38000,
      city: 'Indore',
      address: 'Palasia',
      state: 'Madhya Pradesh',
      attributes: {
        furnitureType: 'Beds & Mattresses',
        material: 'Solid Wood / Teak',
        conditionDetail: 'Like New',
        dimensions: '78 x 72 x 42 inches',
        assembly: 'Installed by Seller'
      }
    },
    {
      title: 'Italian Marble Top 6-Seater Dining Table & Velvet Chairs',
      price: 54000,
      city: 'Mumbai',
      address: 'Worli',
      state: 'Maharashtra',
      attributes: {
        furnitureType: 'Dining Table & Chairs',
        material: 'Glass & Marble',
        conditionDetail: 'Brand New',
        dimensions: '72 x 40 x 30 inches',
        assembly: 'Pre-Assembled'
      }
    },
    {
      title: 'Ergonomic Executive Office Study Table & Mesh Chair Combo',
      price: 16500,
      city: 'Bengaluru',
      address: 'Whitefield',
      state: 'Karnataka',
      attributes: {
        furnitureType: 'Office & Study Table / Chair',
        material: 'Engineered Wood',
        conditionDetail: 'Like New',
        dimensions: '60 x 30 x 30 inches',
        assembly: 'Pre-Assembled'
      }
    },
    {
      title: '3-Door Sliding Wardrobe & Almirah with Full Mirror Panel',
      price: 27500,
      city: 'Bhopal',
      address: 'MP Nagar',
      state: 'Madhya Pradesh',
      attributes: {
        furnitureType: 'Wardrobes & Almirahs',
        material: 'Engineered Wood',
        conditionDetail: 'Like New',
        dimensions: '80 x 72 x 24 inches',
        assembly: 'Installed by Seller'
      }
    }
  ],
  Fashion: [
    {
      title: 'Nike Air Jordan 1 Retro High OG - Footwear & Sneakers (Size L / UK 9)',
      price: 14500,
      city: 'Indore',
      address: 'Vijay Nagar',
      state: 'Madhya Pradesh',
      attributes: {
        fashionType: 'Footwear & Sneakers',
        brand: 'Nike / Air Jordan',
        size: 'L',
        conditionDetail: 'Brand New with Tags'
      }
    },
    {
      title: 'Manyavar Royal Silk Sherwani Set - Men\'s Clothing (Size L)',
      price: 18900,
      city: 'Indore',
      address: 'Palasia',
      state: 'Madhya Pradesh',
      attributes: {
        fashionType: "Men's Clothing",
        brand: 'Manyavar',
        size: 'L',
        conditionDetail: 'Like New'
      }
    },
    {
      title: 'Tissot PRX Powermatic 80 Swiss Automatic Luxury Watch',
      price: 48000,
      city: 'Mumbai',
      address: 'Bandra West',
      state: 'Maharashtra',
      attributes: {
        fashionType: 'Watches & Accessories',
        brand: 'Tissot Swiss',
        size: 'Free Size',
        conditionDetail: 'Brand New with Tags'
      }
    },
    {
      title: 'Sabyasachi Inspired Bridal Lehenga Set - Women\'s Ethnic (Size M)',
      price: 32000,
      city: 'New Delhi',
      address: 'South Extension',
      state: 'Delhi',
      attributes: {
        fashionType: "Women's Clothing & Ethnic",
        brand: 'Designer Couture',
        size: 'M',
        conditionDetail: 'Like New'
      }
    },
    {
      title: 'Michael Kors Saffiano Leather Tote Bag - Brand New with Tags',
      price: 21500,
      city: 'Bengaluru',
      address: 'UB City',
      state: 'Karnataka',
      attributes: {
        fashionType: 'Bags & Luggage',
        brand: 'Michael Kors',
        size: 'Free Size',
        conditionDetail: 'Brand New with Tags'
      }
    }
  ],
  'Books, Sports & Hobbies': [
    {
      title: 'Yamaha F310 Acoustic Guitar with Padded Gig Bag & Tuner',
      price: 8900,
      city: 'Indore',
      address: 'Vijay Nagar',
      state: 'Madhya Pradesh',
      attributes: {
        hobbyType: 'Musical Instruments',
        brandOrAuthor: 'Yamaha Music',
        conditionDetail: 'Like New'
      }
    },
    {
      title: 'PowerMax Fitness TDM-100M Motorized Foldable Home Treadmill',
      price: 24500,
      city: 'Indore',
      address: 'Super Corridor',
      state: 'Madhya Pradesh',
      attributes: {
        hobbyType: 'Gym & Fitness Equipment',
        brandOrAuthor: 'PowerMax Fitness',
        conditionDetail: 'Like New'
      }
    },
    {
      title: 'SG Sunny Tonny English Willow Grade-1 Cricket Kit Complete',
      price: 16800,
      city: 'Mumbai',
      address: 'Dadar',
      state: 'Maharashtra',
      attributes: {
        hobbyType: 'Sports & Cricket / Football Gear',
        brandOrAuthor: 'SG Cricket',
        conditionDetail: 'Brand New'
      }
    },
    {
      title: 'Casio CT-S300 61-Key Touch Sensitive Portable Keyboard + Stand',
      price: 11200,
      city: 'Bhopal',
      address: 'MP Nagar',
      state: 'Madhya Pradesh',
      attributes: {
        hobbyType: 'Musical Instruments',
        brandOrAuthor: 'Casio',
        conditionDetail: 'Like New'
      }
    },
    {
      title: 'Complete UPSC & Engineering Competitive Exam Reference Library (24 Books)',
      price: 4800,
      city: 'Indore',
      address: 'Bhawarkua',
      state: 'Madhya Pradesh',
      attributes: {
        hobbyType: 'Books & Magazines',
        brandOrAuthor: 'McGraw Hill & Oxford',
        conditionDetail: 'Like New'
      }
    }
  ],
  Pets: [
    {
      title: 'Golden Retriever KCI Registered Puppy (Puppy / Junior) - Fully Vaccinated',
      price: 22000,
      city: 'Indore',
      address: 'Vijay Nagar',
      state: 'Madhya Pradesh',
      attributes: {
        petType: 'Dogs & Puppies',
        breed: 'Golden Retriever',
        age: 'Puppy / Junior (0-6 Months)',
        vaccinated: 'Fully Vaccinated'
      }
    },
    {
      title: 'Persian Triple Coat Doll Face Kitten - Fully Vaccinated',
      price: 15000,
      city: 'Indore',
      address: 'Palasia',
      state: 'Madhya Pradesh',
      attributes: {
        petType: 'Cats & Kittens',
        breed: 'Persian Doll Face',
        age: 'Puppy / Junior (0-6 Months)',
        vaccinated: 'Fully Vaccinated'
      }
    },
    {
      title: 'Imported 4-Foot Curved Glass Aquarium Tank with Canister Filter & LED',
      price: 18500,
      city: 'Bhopal',
      address: 'Arera Colony',
      state: 'Madhya Pradesh',
      attributes: {
        petType: 'Fishes & Aquarium',
        breed: 'Planted Reef Aquarium Setup',
        age: 'Young (6-18 Months)',
        vaccinated: 'Not Applicable'
      }
    },
    {
      title: 'Labrador Retriever Purebred Cream Male Puppy - KCI Papers',
      price: 16500,
      city: 'Mumbai',
      address: 'Thane West',
      state: 'Maharashtra',
      attributes: {
        petType: 'Dogs & Puppies',
        breed: 'Labrador Retriever',
        age: 'Puppy / Junior (0-6 Months)',
        vaccinated: 'Fully Vaccinated'
      }
    },
    {
      title: 'Heavy-Duty 2-Tier Wrought Iron Pet Kennel & Travel Crate Combo',
      price: 6800,
      city: 'Bengaluru',
      address: 'Koramangala',
      state: 'Karnataka',
      attributes: {
        petType: 'Pet Food, Cages & Accessories',
        breed: 'Universal Large Breed Crate',
        age: 'Not Applicable',
        vaccinated: 'Not Applicable'
      }
    }
  ],
  Services: [
    {
      title: 'Professional Deep Home Cleaning & Sanitization Service (3/4 BHK)',
      price: 2999,
      city: 'Indore',
      address: 'Vijay Nagar',
      state: 'Madhya Pradesh',
      attributes: {
        serviceType: 'Home Cleaning & Pest Control',
        serviceMode: 'Home Visit / On-Site',
        experienceYears: '8',
        availability: 'All Days'
      }
    },
    {
      title: 'Expert Split & Window AC Repair, Gas Refill & Jet Servicing',
      price: 799,
      city: 'Indore',
      address: 'Palasia',
      state: 'Madhya Pradesh',
      attributes: {
        serviceType: 'Electronics & Appliance Repair',
        serviceMode: 'Home Visit / On-Site',
        experienceYears: '10',
        availability: 'All Days'
      }
    },
    {
      title: 'Safe Household Packers & Movers Relocation Service (All India)',
      price: 8500,
      city: 'Indore',
      address: 'Super Corridor',
      state: 'Madhya Pradesh',
      attributes: {
        serviceType: 'Packers & Movers',
        serviceMode: 'Home Visit / On-Site',
        experienceYears: '12',
        availability: 'All Days'
      }
    },
    {
      title: 'Full-Stack Mobile App & Web Development Studio (React / Node)',
      price: 25000,
      city: 'Bengaluru',
      address: 'HSR Layout',
      state: 'Karnataka',
      attributes: {
        serviceType: 'Web, Design & Digital Services',
        serviceMode: 'Online / Remote',
        experienceYears: '7',
        availability: 'Weekdays Only'
      }
    },
    {
      title: 'CA Assisted GST Registration, ITR Filing & Business Compliance',
      price: 1999,
      city: 'Mumbai',
      address: 'Nariman Point',
      state: 'Maharashtra',
      attributes: {
        serviceType: 'Legal, Tax & Accounting',
        serviceMode: 'Online / Remote',
        experienceYears: '11',
        availability: 'All Days'
      }
    }
  ]
};

const MOBILE_USER_LISTINGS = [
  {
    category: 'Cars',
    title: 'Kia Seltos GTX Plus 1.5 Turbo DCT (2023) - Petrol Automatic',
    price: 1690000,
    city: 'Indore',
    address: 'Sangam Nagar',
    state: 'Madhya Pradesh',
    attributes: {
      brand: 'Kia / Seltos / GTX Plus',
      brandName: 'Kia',
      model: 'Seltos',
      variant: 'GTX Plus',
      year: '2023',
      fuel: 'Petrol',
      transmission: 'Automatic',
      kmDriven: '11400',
      owners: '1st'
    }
  },
  {
    category: 'Mobiles',
    title: 'Apple iPhone 15 Pro Max 256 GB - Blue Titanium (In Warranty)',
    price: 96500,
    city: 'Indore',
    address: 'Sangam Nagar',
    state: 'Madhya Pradesh',
    attributes: {
      brand: 'Apple / iPhone 15 Pro Max / 256 GB',
      brandName: 'Apple',
      model: 'iPhone 15 Pro Max',
      variant: '256 GB',
      ram: '8 GB',
      warranty: 'In Warranty',
      conditionDetail: 'Like New (Mint)',
      chargerIncluded: 'Original Box & Charger'
    }
  },
  {
    category: 'Bikes',
    title: 'Royal Enfield Meteor 350 Supernova (2023) - 4,200 km',
    price: 198000,
    city: 'Indore',
    address: 'Sangam Nagar',
    state: 'Madhya Pradesh',
    attributes: {
      brand: 'Royal Enfield / Meteor 350 / Supernova',
      brandName: 'Royal Enfield',
      model: 'Meteor 350',
      variant: 'Supernova',
      year: '2023',
      kmDriven: '4200',
      fuel: 'Petrol',
      owners: '1st'
    }
  },
  {
    category: 'Properties',
    title: '3 BHK Luxury Flat (1580 sqft) in BCM Planet - Vijay Nagar Indore',
    price: 7200000,
    city: 'Indore',
    address: 'Vijay Nagar',
    state: 'Madhya Pradesh',
    attributes: {
      propertyType: 'Apartments',
      bhk: '3',
      bathrooms: '3',
      furnishing: 'Semi-Furnished',
      projectStatus: 'Ready to Move',
      listedBy: 'Owner',
      superBuiltupArea: '1580',
      carpetArea: '1310',
      maintenanceMonthly: '2400',
      totalFloors: '12',
      floorNo: '5',
      carParking: '1',
      facing: 'East',
      projectName: 'BCM Planet'
    }
  },
  {
    category: 'Electronics & Appliances',
    title: 'Apple iPad Pro M4 13-inch Wi-Fi 256GB + Apple Pencil Pro',
    price: 108000,
    city: 'Indore',
    address: 'Sangam Nagar',
    state: 'Madhya Pradesh',
    attributes: {
      applianceType: 'Laptops & Computers',
      brand: 'Apple',
      model: 'iPad Pro 13-inch M4',
      conditionDetail: 'Like New',
      warranty: 'Under Warranty',
      age: 'Less than 6 Months'
    }
  },
  {
    category: 'Furniture',
    title: 'Wakefit Solid Sheesham Wood Queen Bed + Orthopedic Memory Foam Mattress',
    price: 22500,
    city: 'Indore',
    address: 'Sangam Nagar',
    state: 'Madhya Pradesh',
    attributes: {
      furnitureType: 'Beds & Mattresses',
      material: 'Solid Wood / Teak',
      conditionDetail: 'Like New',
      dimensions: '78 x 60 x 36 inches',
      assembly: 'Pre-Assembled'
    }
  }
];

function buildStructuredDescription(title, category, attrs) {
  const lines = [
    `Verified ${category} listing available on MyBigBazaar: ${title}.`,
    ''
  ];
  Object.entries(attrs || {}).forEach(([k, v]) => {
    if (v && k !== 'brandName') {
      const label = k.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase());
      lines.push(`- ${label}: ${v}`);
    }
  });
  lines.push('- 100% genuine condition, thoroughly inspected and ready for immediate handover.');
  return lines.join('\n');
}

async function runSeed() {
  console.log('Connecting to MongoDB...');
  await connectDB();
  console.log('Connected to MongoDB.');

  // 1. Seed all 11 Category Seller Form Schemas
  await ensureAllCategoryFormsSeeded();
  console.log('✓ All 11 Category Seller Forms synced.');

  // 2. Ensure Categories exist
  const categoryMap = {};
  for (const catDef of CATEGORY_DEFINITIONS) {
    const doc = await ProductCategory.findOneAndUpdate(
      { name: { $regex: `^${catDef.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, $options: 'i' } },
      {
        $set: {
          name: catDef.name,
          slug: catDef.slug,
          icon: catDef.icon,
          description: catDef.description,
          isActive: true
        }
      },
      { upsert: true, new: true }
    );
    categoryMap[catDef.name] = doc;
  }
  console.log(`✓ ${Object.keys(categoryMap).length} Product Categories verified.`);

  // 3. Ensure Taxes exist
  await Tax.deleteMany({});
  const taxDocs = await Tax.insertMany([
    { taxName: 'GST Standard (18%)', taxPercentage: 18, isActive: true },
    { taxName: 'GST Consumer Goods (12%)', taxPercentage: 12, isActive: true },
    { taxName: 'GST Essential Slab (5%)', taxPercentage: 5, isActive: true }
  ]);
  const primaryTax = taxDocs[0];
  console.log(`✓ ${taxDocs.length} GST Tax Slabs seeded (Primary: ${primaryTax.taxName}).`);

  // 4. Create / Update Users & EMPTY WALLETS (₹0 for everyone!)
  const hashedPassword = await bcrypt.hash('Password@123', 10);

  const adminUser = await User.findOneAndUpdate(
    { email: 'admin@mybigbazaar.com' },
    {
      $set: {
        fullName: 'Pratham Upadhyay',
        email: 'admin@mybigbazaar.com',
        phoneNumber: '+919131919112',
        password: hashedPassword,
        role: 'admin',
        isPhoneVerified: true,
        isEmailVerified: true,
        walletBalance: 0
      }
    },
    { upsert: true, new: true }
  );

  const mobileUser = await User.findOneAndUpdate(
    { email: 'aarav.sharma@gmail.com' },
    {
      $set: {
        fullName: 'Aarav Sharma',
        email: 'aarav.sharma@gmail.com',
        phoneNumber: '+919876543210',
        password: hashedPassword,
        role: 'buyer',
        userTypes: ['buyer', 'seller'],
        isPhoneVerified: true,
        isEmailVerified: true,
        walletBalance: 0
      }
    },
    { upsert: true, new: true }
  );

  const buyerUsers = [];
  const sampleBuyers = [
    { fullName: 'Rohan Verma', email: 'rohan.verma@gmail.com', phoneNumber: '+919826011223', city: 'Indore', state: 'Madhya Pradesh' },
    { fullName: 'Priya Nair', email: 'priya.nair@gmail.com', phoneNumber: '+919820144556', city: 'Mumbai', state: 'Maharashtra' },
    { fullName: 'Vikramaditya Singh', email: 'vikram.singh@gmail.com', phoneNumber: '+919811223344', city: 'Bhopal', state: 'Madhya Pradesh' }
  ];
  for (const b of sampleBuyers) {
    const u = await User.findOneAndUpdate(
      { email: b.email },
      {
        $set: {
          fullName: b.fullName,
          email: b.email,
          phoneNumber: b.phoneNumber,
          password: hashedPassword,
          role: 'buyer',
          userTypes: ['buyer', 'seller'],
          isPhoneVerified: true,
          isEmailVerified: true,
          walletBalance: 0
        }
      },
      { upsert: true, new: true }
    );
    buyerUsers.push({ ...u.toObject(), city: b.city, state: b.state });
  }

  // Empty wallet for EVERY user in User/Auth collection (₹0 balance)
  await User.updateMany({}, { $set: { walletBalance: 0 } });
  const totalUsersCount = await User.countDocuments();
  console.log(`✓ Emptied wallets to ₹0 for all ${totalUsersCount} platform users.`);

  // 5. Clear all old dummy products and seed 55 Admin Listings (5 in each of the 11 categories) + 6 Mobile User Listings
  await Listing.deleteMany({});
  const seededProducts = [];

  for (const [categoryName, items] of Object.entries(ADMIN_PRODUCTS_BY_CATEGORY)) {
    const catDoc = categoryMap[categoryName];
    const photos = PHOTO_GALLERIES[categoryName] || PHOTO_GALLERIES.Cars;

    for (const item of items) {
      const desc = buildStructuredDescription(item.title, categoryName, item.attributes);
      const baseCoords = CITY_COORDS[item.city] || CITY_COORDS.Indore;
      const jitterLng = baseCoords[0] + (Math.random() - 0.5) * 0.04;
      const jitterLat = baseCoords[1] + (Math.random() - 0.5) * 0.04;

      const prod = await Listing.create({
        title: item.title,
        description: desc,
        price: item.price,
        originalPrice: Math.round(item.price * 1.08),
        discountPrice: item.price,
        images: photos,
        categoryId: catDoc ? catDoc._id : undefined,
        category: categoryName,
        sellerId: adminUser._id,
        sellerName: adminUser.fullName,
        sellerPhone: adminUser.phoneNumber,
        condition: 'Excellent',
        attributes: item.attributes,
        location: {
          address: item.address,
          city: item.city,
          state: item.state,
          pincode: '452010',
          coordinates: [jitterLng, jitterLat]
        },
        status: 'live',
        isFeatured: seededProducts.length % 4 === 0,
        views: Math.floor(25 + Math.random() * 140)
      });
      seededProducts.push(prod);
    }
  }
  console.log(`✓ Seeded ${seededProducts.length} Admin Panel listings (5 per category across all 11 categories).`);

  const mobileSeededProducts = [];
  for (const mItem of MOBILE_USER_LISTINGS) {
    const catDoc = categoryMap[mItem.category];
    const photos = PHOTO_GALLERIES[mItem.category] || PHOTO_GALLERIES.Cars;
    const desc = buildStructuredDescription(mItem.title, mItem.category, mItem.attributes);
    const baseCoords = CITY_COORDS[mItem.city] || CITY_COORDS.Indore;
    const jitterLng = baseCoords[0] + (Math.random() - 0.5) * 0.03;
    const jitterLat = baseCoords[1] + (Math.random() - 0.5) * 0.03;

    const prod = await Listing.create({
      title: mItem.title,
      description: desc,
      price: mItem.price,
      originalPrice: Math.round(mItem.price * 1.05),
      discountPrice: mItem.price,
      images: photos,
      categoryId: catDoc ? catDoc._id : undefined,
      category: mItem.category,
      sellerId: mobileUser._id,
      sellerName: mobileUser.fullName,
      sellerPhone: mobileUser.phoneNumber,
      condition: 'Excellent',
      attributes: mItem.attributes,
      location: {
        address: mItem.address,
        city: mItem.city,
        state: mItem.state,
        pincode: '452001',
        coordinates: [jitterLng, jitterLat]
      },
      status: 'live',
      isFeatured: true,
      views: Math.floor(40 + Math.random() * 120)
    });
    mobileSeededProducts.push(prod);
  }
  console.log(`✓ Seeded ${mobileSeededProducts.length} Mobile App user listings under Aarav Sharma (+919876543210).`);

  // 6. Mock-Buy Listings: Create Pending Orders, Completed Orders & Cancelled Orders + Payments with GST Taxes
  await Order.deleteMany({});
  await Payment.deleteMany({});

  const allAvailableProducts = [...mobileSeededProducts, ...seededProducts];
  const orderConfigs = [
    // 4 Pending Orders
    { prodIdx: 0, buyer: buyerUsers[0], status: 'pending', trackingStatus: 'placed', paymentMethod: 'UPI (GPay / PhonePe)', paymentStatus: 'success' },
    { prodIdx: 1, buyer: buyerUsers[1], status: 'pending', trackingStatus: 'processing', paymentMethod: 'Razorpay Card / NetBanking', paymentStatus: 'success' },
    { prodIdx: 6, buyer: mobileUser, status: 'pending', trackingStatus: 'placed', paymentMethod: 'UPI (PhonePe)', paymentStatus: 'success' },
    { prodIdx: 16, buyer: buyerUsers[2], status: 'pending', trackingStatus: 'processing', paymentMethod: 'Safe-Deal Escrow UPI', paymentStatus: 'success' },
    // 5 Completed Orders
    { prodIdx: 2, buyer: buyerUsers[0], status: 'completed', trackingStatus: 'delivered', paymentMethod: 'UPI (GPay)', paymentStatus: 'success' },
    { prodIdx: 4, buyer: buyerUsers[1], status: 'completed', trackingStatus: 'delivered', paymentMethod: 'Credit Card (HDFC)', paymentStatus: 'success' },
    { prodIdx: 11, buyer: mobileUser, status: 'completed', trackingStatus: 'delivered', paymentMethod: 'UPI (PhonePe)', paymentStatus: 'success' },
    { prodIdx: 21, buyer: buyerUsers[2], status: 'completed', trackingStatus: 'delivered', paymentMethod: 'NetBanking (ICICI)', paymentStatus: 'success' },
    { prodIdx: 32, buyer: mobileUser, status: 'completed', trackingStatus: 'delivered', paymentMethod: 'UPI (GPay)', paymentStatus: 'success' },
    // 3 Cancelled Orders
    { prodIdx: 5, buyer: buyerUsers[0], status: 'cancelled', trackingStatus: 'cancelled', paymentMethod: 'UPI (Paytm)', paymentStatus: 'refunded' },
    { prodIdx: 17, buyer: buyerUsers[1], status: 'cancelled', trackingStatus: 'cancelled', paymentMethod: 'Credit Card', paymentStatus: 'refunded' },
    { prodIdx: 37, buyer: mobileUser, status: 'cancelled', trackingStatus: 'cancelled', paymentMethod: 'UPI (PhonePe)', paymentStatus: 'refunded' }
  ];

  const createdOrders = [];
  for (let i = 0; i < orderConfigs.length; i++) {
    const cfg = orderConfigs[i];
    const prod = allAvailableProducts[cfg.prodIdx] || allAvailableProducts[0];
    const subtotal = Number(prod.price || 15000);
    const taxRate = primaryTax.taxPercentage || 18;
    const taxAmount = Math.round((subtotal * taxRate) / 100);
    const totalAmount = subtotal + taxAmount;
    const orderNumber = `ORD-MBB-${1001 + i}`;

    const orderDoc = await Order.create({
      orderNumber,
      buyerId: cfg.buyer._id,
      buyerName: cfg.buyer.fullName,
      buyerEmail: cfg.buyer.email,
      buyerPhone: cfg.buyer.phoneNumber,
      sellerId: prod.sellerId || adminUser._id,
      sellerName: prod.sellerName || adminUser.fullName,
      productId: String(prod._id),
      productTitle: prod.title,
      productImage: prod.images?.[0] || '',
      items: [
        {
          listingId: prod._id,
          productId: String(prod._id),
          title: prod.title,
          price: subtotal,
          quantity: 1,
          image: prod.images?.[0] || '',
          taxAmount,
          taxName: primaryTax.taxName
        }
      ],
      subtotal,
      taxAmount,
      taxName: primaryTax.taxName,
      taxPercentage: taxRate,
      totalAmount,
      paymentMode: cfg.paymentMethod,
      paymentMethod: cfg.paymentMethod,
      paymentStatus: cfg.paymentStatus,
      status: cfg.status,
      trackingStatus: cfg.trackingStatus,
      shippingAddress: {
        houseNo: '42',
        street: 'Vijay Nagar Square, Scheme 54',
        city: cfg.buyer.city || 'Indore',
        state: cfg.buyer.state || 'Madhya Pradesh',
        pincode: '452010',
        phone: cfg.buyer.phoneNumber,
        address: `42, Vijay Nagar Square, ${cfg.buyer.city || 'Indore'}`
      }
    });
    createdOrders.push(orderDoc);

    // Create corresponding Payment record in MongoDB for Admin Panel Payments & Invoices
    await Payment.create({
      transactionId: `TXN-MBB-${2001 + i}`,
      orderId: String(orderDoc._id),
      referenceId: orderNumber,
      userId: cfg.buyer._id,
      userName: cfg.buyer.fullName,
      userEmail: cfg.buyer.email,
      userPhone: cfg.buyer.phoneNumber,
      sellerId: prod.sellerId || adminUser._id,
      sellerName: prod.sellerName || adminUser.fullName,
      productTitle: prod.title,
      productImage: prod.images?.[0] || '',
      type: cfg.status === 'cancelled' ? 'refund' : 'payment',
      purpose: 'order',
      paymentMode: cfg.paymentMethod,
      method: cfg.paymentMethod,
      subtotal,
      taxAmount,
      taxName: primaryTax.taxName,
      amount: totalAmount,
      currency: 'INR',
      status: cfg.status === 'cancelled' ? 'refunded' : 'success'
    });
  }
  console.log(`✓ Created ${createdOrders.length} Marketplace Orders (4 Pending, 5 Completed, 3 Cancelled) + 12 Payment Transactions with GST Tax breakdowns.`);

  // 7. Seed Verified Buyer Reviews & Ratings
  await Review.deleteMany({});
  const sampleReviews = [
    {
      prod: allAvailableProducts[0],
      reviewer: buyerUsers[0],
      rating: 5,
      comment: 'Inspected the Kia Seltos in person at Sangam Nagar. Exact 11,400 km reading as listed in the seller form, showroom condition!'
    },
    {
      prod: allAvailableProducts[1],
      reviewer: buyerUsers[1],
      rating: 5,
      comment: 'iPhone 15 Pro Max 256GB Blue Titanium came with original Apple box, charging cable, and 98% battery health. Instant handover!'
    },
    {
      prod: allAvailableProducts[2],
      reviewer: buyerUsers[2],
      rating: 5,
      comment: 'Royal Enfield Meteor 350 Supernova is super smooth. First-owner bike with complete service records.'
    },
    {
      prod: allAvailableProducts[6],
      reviewer: mobileUser,
      rating: 5,
      comment: 'Hyundai Creta SX(O) Turbo is immaculate! All specifications matched the listing form 100%.'
    },
    {
      prod: allAvailableProducts[11],
      reviewer: mobileUser,
      rating: 5,
      comment: 'Visited Silver Crest Heights 3 BHK Apartment in Vijay Nagar. East-facing, great ventilation and 2 covered car parkings.'
    },
    {
      prod: allAvailableProducts[16],
      reviewer: buyerUsers[0],
      rating: 5,
      comment: 'Brand new sealed iPhone 16 Pro Max 256GB with official Apple India warranty. Saved ₹15,000 compared to retail!'
    },
    {
      prod: allAvailableProducts[26],
      reviewer: buyerUsers[1],
      rating: 4,
      comment: 'MacBook Pro 16 M3 Max is blazingly fast. Original box and 140W MagSafe charger included.'
    },
    {
      prod: allAvailableProducts[36],
      reviewer: mobileUser,
      rating: 5,
      comment: 'Solid Teak L-Shape Sofa Set looks premium in our living room. Pre-assembled and delivered on time.'
    }
  ];

  for (const r of sampleReviews) {
    await Review.create({
      targetType: 'product',
      targetId: r.prod._id,
      productId: String(r.prod._id),
      productTitle: r.prod.title,
      targetName: r.prod.title,
      sellerId: r.prod.sellerId || adminUser._id,
      sellerName: r.prod.sellerName || adminUser.fullName,
      reviewerId: r.reviewer._id,
      reviewerName: r.reviewer.fullName,
      reviewerEmail: r.reviewer.email,
      rating: r.rating,
      reviewText: r.comment,
      comment: r.comment,
      isVerifiedPurchase: true,
      verifiedBuyer: true,
      status: 'Approved'
    });
  }
  console.log(`✓ Seeded ${sampleReviews.length} Verified Buyer Reviews & Ratings.`);

  await mongoose.disconnect();
  console.log('=== MARKETPLACE COMPLETE SEEDING FINISHED SUCCESSFULLY ===');
}

runSeed().catch((err) => {
  console.error('Seed error:', err);
  process.exit(1);
});
