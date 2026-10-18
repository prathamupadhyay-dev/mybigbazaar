/**
 * @file apps/web/src/data/mockData.js
 * @description Canonical realistic mock and seed dataset for MyBigBazaar Web.
 * Conforms 100% to @my-big-bazaar/shared domain models and status enums.
 */

export const MOCK_USERS = [
  {
    id: 'usr-buyer-01',
    name: 'Aarav Sharma',
    email: 'buyer@bigbazaar.com',
    phone: '+91 98765 43210',
    role: 'buyer',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    location: 'Indiranagar, Bengaluru',
    verified: true,
    rating: 4.9,
    joinedDate: 'Jan 2024',
    savedAddresses: [
      {
        id: 'addr-01',
        tag: 'Home',
        fullName: 'Aarav Sharma',
        phone: '+91 98765 43210',
        street: 'Flat 402, Green Glen Layout, Bellandur',
        city: 'Bengaluru',
        state: 'Karnataka',
        pincode: '560103',
        isDefault: true
      },
      {
        id: 'addr-02',
        tag: 'Office',
        fullName: 'Aarav Sharma',
        phone: '+91 98765 43210',
        street: 'Prestige Tech Park, Marathahalli-Sarjapur Ring Rd',
        city: 'Bengaluru',
        state: 'Karnataka',
        pincode: '560087',
        isDefault: false
      }
    ]
  },
  {
    id: 'usr-seller-01',
    name: 'Priya Patel',
    email: 'seller@bigbazaar.com',
    phone: '+91 98220 12345',
    role: 'seller',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    location: 'Koramangala, Bengaluru',
    verified: true,
    rating: 4.85,
    responseTime: '< 15 mins',
    joinedDate: 'Aug 2023',
    totalListings: 14,
    successfulSales: 38
  },
  {
    id: 'usr-provider-01',
    name: 'Rajesh Kumar Tech',
    email: 'provider@bigbazaar.com',
    phone: '+91 98111 87654',
    role: 'provider',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    location: 'HSR Layout, Bengaluru',
    verified: true,
    rating: 4.92,
    jobsCompleted: 340,
    trade: 'Master Electrician & AC Specialist',
    joinedDate: 'Feb 2023'
  },
  {
    id: 'usr-admin-01',
    name: 'Super Admin',
    email: 'admin@bigbazaar.com',
    phone: '+91 99999 88888',
    role: 'admin',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    location: 'HQ, Bengaluru',
    verified: true,
    rating: 5.0,
    joinedDate: 'Jan 2023'
  }
];

export const MOCK_CATEGORIES = [
  {
    id: 'cat-elec',
    name: 'Electronics',
    slug: 'electronics',
    icon: 'Smartphone',
    count: 320,
    image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&auto=format&fit=crop&q=80',
    subcategories: [
      'Smartphones',
      'Laptops & Computers',
      'Audio & Headphones',
      'Cameras & Optics',
      'Accessories & Chargers',
      'Gaming & Consoles'
    ]
  },
  {
    id: 'cat-fash',
    name: 'Fashion',
    slug: 'fashion',
    icon: 'Shirt',
    count: 245,
    image: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=400&auto=format&fit=crop&q=80',
    subcategories: [
      'Men Clothing',
      'Women Clothing',
      'Footwear',
      'Watches & Wearables',
      'Bags & Luggage',
      'Jewelry & Accessories'
    ]
  },
  {
    id: 'cat-furn',
    name: 'Furniture',
    slug: 'furniture',
    icon: 'Armchair',
    count: 180,
    image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&auto=format&fit=crop&q=80',
    subcategories: [
      'Living Room',
      'Bedroom Furniture',
      'Office & Study Desks',
      'Dining Tables & Chairs',
      'Storage & Wardrobes'
    ]
  },
  {
    id: 'cat-bike',
    name: 'Bikes',
    slug: 'bikes',
    icon: 'Bike',
    count: 110,
    image: 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=400&auto=format&fit=crop&q=80',
    subcategories: [
      'Motorcycles',
      'Scooters',
      'Bicycles',
      'Spare Parts & Helmets'
    ]
  },
  {
    id: 'cat-appl',
    name: 'Appliances',
    slug: 'appliances',
    icon: 'Tv',
    count: 95,
    image: 'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?w=400&auto=format&fit=crop&q=80',
    subcategories: [
      'Refrigerators',
      'Washing Machines',
      'Kitchen Appliances',
      'Microwaves & Ovens',
      'Air Purifiers'
    ]
  },
  {
    id: 'cat-book',
    name: 'Books',
    slug: 'books',
    icon: 'BookOpen',
    count: 210,
    image: 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=400&auto=format&fit=crop&q=80',
    subcategories: [
      'Fiction & Literature',
      'Academic & Textbooks',
      'Self-Help & Business',
      'Children & Comics'
    ]
  },
  {
    id: 'cat-spor',
    name: 'Sports',
    slug: 'sports',
    icon: 'Dumbbell',
    count: 85,
    image: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=400&auto=format&fit=crop&q=80',
    subcategories: [
      'Fitness Equipment',
      'Outdoor Sports',
      'Athletic Footwear',
      'Sports Gear & Kits'
    ]
  },
  {
    id: 'cat-othr',
    name: 'Other',
    slug: 'other',
    icon: 'MoreHorizontal',
    count: 65,
    image: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=400&auto=format&fit=crop&q=80',
    subcategories: [
      'Collectibles & Antiques',
      'Musical Instruments',
      'Art & Craft',
      'Pet Supplies'
    ]
  }
];

export const MOCK_SERVICE_CATEGORIES = [
  {
    id: 'scat-ac',
    name: 'AC Repair',
    slug: 'ac-repair',
    icon: 'Wind',
    startingPrice: 399,
    rating: 4.88,
    image: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=400&auto=format&fit=crop&q=80',
    subcategories: [
      'AC Servicing & Filter Deep Clean',
      'Gas Refill & Leak Check',
      'AC Installation & Uninstallation',
      'Cooling Coil & PCB Repair'
    ]
  },
  {
    id: 'scat-elec',
    name: 'Electrician',
    slug: 'electrician',
    icon: 'Zap',
    startingPrice: 199,
    rating: 4.9,
    image: 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=400&auto=format&fit=crop&q=80',
    subcategories: [
      'Switchboard & MCB Tripping',
      'Ceiling Fan & Light Installation',
      'Complete Home Wiring',
      'Appliance Repair & Servicing',
      'Inverter & Battery Setup'
    ]
  },
  {
    id: 'scat-plumb',
    name: 'Plumbing',
    slug: 'plumbing',
    icon: 'Wrench',
    startingPrice: 249,
    rating: 4.82,
    image: 'https://images.unsplash.com/photo-1581244277943-fe4a9c777189?w=400&auto=format&fit=crop&q=80',
    subcategories: [
      'Tap Leakage & Valve Repair',
      'Pipe Fitting & Drainage',
      'Water Heater & Geyser Installation',
      'Toilet & Sanitary Fitting',
      'Full Bathroom Renovation'
    ]
  },
  {
    id: 'scat-clean',
    name: 'Home Cleaning',
    slug: 'home-cleaning',
    icon: 'Sparkles',
    startingPrice: 699,
    rating: 4.91,
    image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400&auto=format&fit=crop&q=80',
    subcategories: [
      'Full Home Deep Cleaning',
      'Bathroom Deep Clean',
      'Kitchen Degreasing & Clean',
      'Sofa & Carpet Dry Cleaning',
      'Balcony & Floor Scrubbing'
    ]
  },
  {
    id: 'scat-carp',
    name: 'Carpentry',
    slug: 'carpentry',
    icon: 'Hammer',
    startingPrice: 299,
    rating: 4.79,
    image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&auto=format&fit=crop&q=80',
    subcategories: [
      'Furniture Assembly & Repair',
      'Door & Window Latch Fitting',
      'Lock & Handle Replacement',
      'Custom Shelving & Woodwork'
    ]
  },
  {
    id: 'scat-paint',
    name: 'Painting',
    slug: 'painting',
    icon: 'Paintbrush',
    startingPrice: 1499,
    rating: 4.85,
    image: 'https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=400&auto=format&fit=crop&q=80',
    subcategories: [
      'Full Interior Home Painting',
      'Exterior Weatherproof Painting',
      'Waterproofing & Wall Sealing',
      'Accent Wall & Texture Finish'
    ]
  },
  {
    id: 'scat-pest',
    name: 'Pest Control',
    slug: 'pest-control',
    icon: 'ShieldCheck',
    startingPrice: 599,
    rating: 4.87,
    image: 'https://images.unsplash.com/photo-1628177142898-93e36e4e3a50?w=400&auto=format&fit=crop&q=80',
    subcategories: [
      'Cockroach & Ant Eradication',
      'Termite Treatment & Drill',
      'Bedbug Chemical Treatment',
      'Rodent & Mosquito Control'
    ]
  },
  {
    id: 'scat-tutor',
    name: 'Tutoring',
    slug: 'tutoring',
    icon: 'GraduationCap',
    startingPrice: 499,
    rating: 4.95,
    image: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=400&auto=format&fit=crop&q=80',
    subcategories: [
      'Class 1-5 Primary Foundation',
      'Class 6-10 Mathematics & Science',
      'Class 11-12 Board Exam Prep',
      'Language Learning',
      'Music Lessons'
    ]
  },
  {
    id: 'scat-salon',
    name: 'Salon',
    slug: 'salon',
    icon: 'Scissors',
    startingPrice: 349,
    rating: 4.89,
    image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400&auto=format&fit=crop&q=80',
    subcategories: [
      'Haircut & Beard Styling',
      'Facials & Skincare',
      'Waxing & Threading',
      'Manicure & Pedicure',
      'Deep Tissue Massage Therapy'
    ]
  }
];

export const MOCK_LISTINGS = [
  {
    id: 'list-01',
    title: 'Apple iPhone 14 Pro 128GB - Deep Purple (Under Warranty)',
    price: 68500,
    originalPrice: 119900,
    category: 'Electronics',
    subcategory: 'Smartphones',
    condition: 'Like New',
    status: 'live',
    featured: true,
    location: 'Indiranagar, Bengaluru',
    postedTime: '2 hours ago',
    images: [
      'https://images.unsplash.com/photo-1678685888221-cda773a3dcdb?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=800&auto=format&fit=crop&q=80'
    ],
    seller: {
      id: 'usr-seller-01',
      name: 'Priya Patel',
      rating: 4.9,
      reviewsCount: 38,
      verified: true,
      memberSince: 'Aug 2023',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
      responseTime: '< 15 mins'
    },
    description: 'Immaculate condition iPhone 14 Pro 128GB in Deep Purple. AppleCare+ valid until November 2026. 96% battery health. Comes with original box, braided lightning cable, and Spigen Armor case. Zero scratches on screen or body.',
    specs: {
      'Brand': 'Apple',
      'Model': 'iPhone 14 Pro',
      'Storage': '128 GB',
      'Color': 'Deep Purple',
      'Battery Health': '96%',
      'Warranty': 'Valid until Nov 2026'
    },
    views: 412,
    favoritesCount: 34
  },
  {
    id: 'list-02',
    title: 'Sony WH-1000XM5 Wireless Noise Cancelling Headphones',
    price: 18900,
    originalPrice: 29990,
    category: 'Electronics',
    subcategory: 'Audio & Headphones',
    condition: 'Like New',
    status: 'live',
    featured: true,
    location: 'Koramangala, Bengaluru',
    postedTime: '4 hours ago',
    images: [
      'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80'
    ],
    seller: {
      id: 'usr-seller-02',
      name: 'Vikram Mehta',
      rating: 4.8,
      reviewsCount: 19,
      verified: true,
      memberSince: 'Mar 2023',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
      responseTime: '< 30 mins'
    },
    description: 'Selling my Sony WH-1000XM5 Silver ANC headphones. Only 4 months old, used solely during office flights. Complete with hardshell travel case, 3.5mm cable, and flight adapter. Phenomenal sound and battery.',
    specs: {
      'Brand': 'Sony',
      'Model': 'WH-1000XM5',
      'Color': 'Platinum Silver',
      'Battery Life': '30 Hours ANC',
      'Connectivity': 'Bluetooth 5.2 / LDAC'
    },
    views: 280,
    favoritesCount: 18
  },
  {
    id: 'list-03',
    title: 'Solid Teak Wood 6-Seater Dining Table with Cushioned Chairs',
    price: 24500,
    originalPrice: 52000,
    category: 'Furniture',
    subcategory: 'Dining Tables & Chairs',
    condition: 'Good',
    status: 'live',
    featured: false,
    location: 'HSR Layout, Bengaluru',
    postedTime: '1 day ago',
    images: [
      'https://images.unsplash.com/photo-1617806118233-18e1de247200?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&auto=format&fit=crop&q=80'
    ],
    seller: {
      id: 'usr-seller-03',
      name: 'Ananya Deshmukh',
      rating: 4.95,
      reviewsCount: 42,
      verified: true,
      memberSince: 'Jan 2022',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
      responseTime: '< 10 mins'
    },
    description: 'Handcrafted CP teak wood 6-seater dining set. Honey oak polish. Glass top included for table protection. All chairs have stain-resistant upholstered seating. Relocating abroad, need urgent pick up.',
    specs: {
      'Material': '100% Solid Teak Wood',
      'Seating Capacity': '6 People',
      'Dimensions': '6ft x 3.5ft',
      'Glass Top': '8mm Toughened'
    },
    views: 520,
    favoritesCount: 47
  },
  {
    id: 'list-04',
    title: 'Royal Enfield Classic 350 (Dual Channel ABS, Gunmetal Grey)',
    price: 145000,
    originalPrice: 215000,
    category: 'Bikes',
    subcategory: 'Motorcycles',
    condition: 'Good',
    status: 'live',
    featured: true,
    location: 'Whitefield, Bengaluru',
    postedTime: '1 day ago',
    images: [
      'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=800&auto=format&fit=crop&q=80'
    ],
    seller: {
      id: 'usr-seller-04',
      name: 'Rohan Sen',
      rating: 4.75,
      reviewsCount: 11,
      verified: true,
      memberSince: 'Jun 2023',
      avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
      responseTime: '< 1 hour'
    },
    description: '2022 model Royal Enfield Classic 350 BS6 with Dual ABS. 18,200 km driven. Single owner, company serviced on schedule. Clean RC, insurance valid till Nov 2027. Includes leg guard, sump guard, and touring seat.',
    specs: {
      'Make Year': '2022',
      'KM Driven': '18,200 km',
      'Fuel': 'Petrol BS6',
      'Color': 'Gunmetal Grey Matte',
      'Ownership': '1st Owner'
    },
    views: 890,
    favoritesCount: 82
  },
  {
    id: 'list-05',
    title: 'Dell XPS 15 9520 (Intel i7-12700H, 32GB RAM, 1TB SSD, RTX 3050Ti)',
    price: 92000,
    originalPrice: 175000,
    category: 'Electronics',
    subcategory: 'Laptops & Computers',
    condition: 'Like New',
    status: 'live',
    featured: false,
    location: 'Electronic City, Bengaluru',
    postedTime: '2 days ago',
    images: [
      'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800&auto=format&fit=crop&q=80'
    ],
    seller: {
      id: 'usr-seller-01',
      name: 'Priya Patel',
      rating: 4.9,
      reviewsCount: 38,
      verified: true,
      memberSince: 'Aug 2023',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
      responseTime: '< 15 mins'
    },
    description: 'Flawless Dell XPS 15 laptop. 3.5K OLED touch display, 32GB DDR5 RAM, 1TB NVMe SSD. Used for UI design work. Battery holds 8+ hours. Includes original 130W USB-C charger and neoprene sleeve.',
    specs: {
      'Processor': 'Intel Core i7 12th Gen',
      'RAM': '32 GB DDR5',
      'Storage': '1 TB Gen4 NVMe SSD',
      'Display': '15.6" 3.5K OLED Touch',
      'GPU': 'NVIDIA GeForce RTX 3050 Ti'
    },
    views: 640,
    favoritesCount: 51
  },
  {
    id: 'list-06',
    title: 'Samsung 653L Frost Free Side-by-Side Inverter Refrigerator',
    price: 46000,
    originalPrice: 89000,
    category: 'Appliances',
    subcategory: 'Refrigerators',
    condition: 'Good',
    status: 'live',
    featured: false,
    location: 'Jayanagar, Bengaluru',
    postedTime: '3 days ago',
    images: [
      'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?w=800&auto=format&fit=crop&q=80'
    ],
    seller: {
      id: 'usr-seller-05',
      name: 'Kavita Hegde',
      rating: 4.88,
      reviewsCount: 24,
      verified: true,
      memberSince: 'Feb 2023',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      responseTime: '< 20 mins'
    },
    description: 'Samsung Side by Side Refrigerator with SpaceMax technology. In perfect cooling condition. Digital Inverter with 10-year warranty certificate. Gentle Luxe Black finish. Moving out sale.',
    specs: {
      'Brand': 'Samsung',
      'Capacity': '653 Liters',
      'Type': 'Side-by-Side Frost Free',
      'Color': 'Gentle Black Inox',
      'Energy Rating': 'Inverter Smart'
    },
    views: 310,
    favoritesCount: 22
  },
  {
    id: 'list-07',
    title: 'Ergonomic Mesh Office Chair with 3D Armrests & Lumbar Support',
    price: 6800,
    originalPrice: 14500,
    category: 'Furniture',
    subcategory: 'Office & Study Desks',
    condition: 'Like New',
    status: 'live',
    featured: false,
    location: 'BTM Layout, Bengaluru',
    postedTime: '3 days ago',
    images: [
      'https://images.unsplash.com/photo-1580481077195-73ab013f636f?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1505797149-43b0069ec26b?w=800&auto=format&fit=crop&q=80'
    ],
    seller: {
      id: 'usr-seller-02',
      name: 'Vikram Mehta',
      rating: 4.8,
      reviewsCount: 19,
      verified: true,
      memberSince: 'Mar 2023',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
      responseTime: '< 30 mins'
    },
    description: 'Green Soul ergonomic high-back mesh chair. Fully adjustable headrest, 3D armrests, heavy-duty metal base, and multi-lock synchro tilt mechanism. Under 6 months of light home office use.',
    specs: {
      'Brand': 'Green Soul',
      'Frame': 'Heavy Duty Glass Nylon & Metal',
      'Weight Capacity': '135 kg',
      'Adjustments': '3D Arms, Lumbar, Recline'
    },
    views: 215,
    favoritesCount: 19
  },
  {
    id: 'list-08',
    title: 'Decathlon Triban RC 100 Road Bike (Medium, 7 Speed Shimano)',
    price: 11500,
    originalPrice: 19999,
    category: 'Bikes',
    subcategory: 'Bicycles',
    condition: 'Good',
    status: 'live',
    featured: false,
    location: 'Bellandur, Bengaluru',
    postedTime: '4 days ago',
    images: [
      'https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1507035895480-2b3156c31fc8?w=800&auto=format&fit=crop&q=80'
    ],
    seller: {
      id: 'usr-seller-04',
      name: 'Rohan Sen',
      rating: 4.75,
      reviewsCount: 11,
      verified: true,
      memberSince: 'Jun 2023',
      avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
      responseTime: '< 1 hour'
    },
    description: 'Decathlon Triban RC100 road bicycle in great mechanical condition. Frame size Medium (fits 5\'6" to 5\'11"). Recently serviced with new puncture-resistant 700x32c tires. Bottle cage and LED headlamp included.',
    specs: {
      'Brand': 'Triban / Decathlon',
      'Gears': '7-speed Shimano SIS',
      'Frame': '6061 T6 Aluminum',
      'Brakes': 'Promax Caliper'
    },
    views: 340,
    favoritesCount: 29
  }
];

export const MOCK_SERVICES = [
  {
    id: 'srv-01',
    title: 'Complete Split AC Foam Jet Deep Servicing',
    category: 'AC Repair',
    subcategory: 'AC Servicing & Filter Deep Clean',
    price: 499,
    originalPrice: 899,
    rating: 4.92,
    reviewsCount: 184,
    duration: '45 mins',
    image: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=800&auto=format&fit=crop&q=80',
    description: 'High-pressure 2X foam jet service for indoor and outdoor coils. Eliminates odor, removes 99% accumulated dust, and restores optimal cooling efficiency. Includes 30-day BigBazaar warranty.',
    inclusions: [
      'Indoor unit dismantling & foam cleaning',
      'High pressure water jet wash for cooling coil',
      'Outdoor condenser coil water wash',
      'Gas pressure & amp check',
      '30-day post service warranty'
    ],
    exclusions: [
      'Spare part replacements if damaged',
      'Gas refill (charged separately if needed)'
    ],
    popular: true
  },
  {
    id: 'srv-02',
    title: 'AC Gas Leak Check & Comprehensive Refill',
    category: 'AC Repair',
    subcategory: 'Gas Refill & Leak Check',
    price: 1899,
    originalPrice: 2499,
    rating: 4.88,
    reviewsCount: 96,
    duration: '60 mins',
    image: 'https://images.unsplash.com/photo-1581244277943-fe4a9c777189?w=800&auto=format&fit=crop&q=80',
    description: 'Nitrogen pressure testing to detect hairline refrigerant leaks, brazing repair, and 100% genuine R32/R410A gas top-up with pressure gauge verification.',
    inclusions: [
      'Nitrogen leak testing',
      'Copper pipe braze joint repair',
      'Full vacuum evacuation & compressor inspection',
      'OEM certified refrigerant charge (R32 / R410A / R22)',
      '60-day BigBazaar cooling warranty'
    ],
    exclusions: [
      'Compressor motor replacement'
    ],
    popular: false
  },
  {
    id: 'srv-03',
    title: 'Switchboard, MCB & Electrical Tripping Repair',
    category: 'Electrician',
    subcategory: 'Switchboard & MCB Tripping',
    price: 199,
    originalPrice: 349,
    rating: 4.91,
    reviewsCount: 220,
    duration: '30 mins',
    image: 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=800&auto=format&fit=crop&q=80',
    description: 'Fast diagnosis and fixing of short circuits, loose connections, MCB tripping, or sparking switchboards by verified licensed electricians.',
    inclusions: [
      'Insulation resistance & load check',
      'Switch / socket replacement labor',
      'MCB connection tightening',
      'Safety grounding check'
    ],
    exclusions: [
      'Cost of physical switches/sockets'
    ],
    popular: true
  },
  {
    id: 'srv-04',
    title: 'Ceiling Fan & Designer Chandelier Installation',
    category: 'Electrician',
    subcategory: 'Ceiling Fan & Light Installation',
    price: 249,
    originalPrice: 399,
    rating: 4.87,
    reviewsCount: 145,
    duration: '40 mins',
    image: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800&auto=format&fit=crop&q=80',
    description: 'Secure hook mounting, downrod assembly, balancing, and testing of BLDC or regular ceiling fans with warranty against wobble.',
    inclusions: [
      'Ceiling hook alignment',
      'Fan blade balancing & test run',
      'Wall regulator wiring'
    ],
    exclusions: [
      'New anchor bolts if missing from ceiling'
    ],
    popular: false
  },
  {
    id: 'srv-05',
    title: 'Tap Leakage, Valve & Mixer Faucet Repair',
    category: 'Plumbing',
    subcategory: 'Tap Leakage & Valve Repair',
    price: 229,
    originalPrice: 399,
    rating: 4.83,
    reviewsCount: 178,
    duration: '35 mins',
    image: 'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=800&auto=format&fit=crop&q=80',
    description: 'Fix dripping faucets, replace internal spindle valves, washers, or install brand new bath/kitchen mixer units with zero mess.',
    inclusions: [
      'Washer & spindle replacement labor',
      'Thread sealing tape application',
      'Water pressure test'
    ],
    exclusions: [
      'Cost of replacement brass faucet/cartridge'
    ],
    popular: true
  },
  {
    id: 'srv-06',
    title: 'Full 3BHK Home Deep Cleaning & Sanitization',
    category: 'Home Cleaning',
    subcategory: 'Full Home Deep Cleaning',
    price: 3499,
    originalPrice: 5999,
    rating: 4.94,
    reviewsCount: 312,
    duration: '5 - 6 hours',
    image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800&auto=format&fit=crop&q=80',
    description: 'Thorough top-to-bottom scrub down with Taski chemicals and single-disc scrubbers. Covers 3 bedrooms, 3 bathrooms, kitchen degreasing, living room, and balconies.',
    inclusions: [
      'Machine scrubbing for all tile floors',
      'Kitchen chimney & countertop degreasing',
      'Bathroom descaling & acid-free sanitization',
      'Ceiling fan, window track & switch dusting',
      'Balcony floor jet washing'
    ],
    exclusions: [
      'Paint touch-up or exterior facade washing'
    ],
    popular: true
  },
  {
    id: 'srv-07',
    title: 'Fabric Sofa & Carpet Shampooing (3+2 Set)',
    category: 'Home Cleaning',
    subcategory: 'Sofa & Carpet Dry Cleaning',
    price: 1199,
    originalPrice: 1899,
    rating: 4.89,
    reviewsCount: 154,
    duration: '90 mins',
    image: 'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=800&auto=format&fit=crop&q=80',
    description: 'Professional injection-extraction foam wash for upholstered sofas. Removes stubborn coffee/oil stains, pet dander, and odors without damaging delicate fabrics.',
    inclusions: [
      'Dry vacuuming of crevices',
      'Fabric-safe shampoo foam treatment',
      'High-power suction moisture extraction',
      'Deodorizing mist'
    ],
    exclusions: [
      'Leather sofa polish (separate service)'
    ],
    popular: false
  },
  {
    id: 'srv-08',
    title: 'Complete Bathroom Descaling & Acid-Free Deep Clean',
    category: 'Home Cleaning',
    subcategory: 'Bathroom Deep Clean',
    price: 499,
    originalPrice: 899,
    rating: 4.86,
    reviewsCount: 240,
    duration: '60 mins',
    image: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=800&auto=format&fit=crop&q=80',
    description: 'Hard water salt removal from shower glass, chrome fittings, tiles, and WC toilet bowl using eco-safe descalers. Leaves bathroom sparkling like new.',
    inclusions: [
      'Hard water scale removal from mirrors & taps',
      'Tile grout grime scrubbing',
      'WC bowl internal & external sanitization',
      'Exhaust fan & geyser body wipe'
    ],
    exclusions: [
      'Tile regrouting'
    ],
    popular: true
  }
];

export const MOCK_PROVIDERS = [
  {
    id: 'prv-01',
    name: 'Rajesh Kumar Tech',
    trade: 'Master Electrician & AC Specialist',
    rating: 4.92,
    reviewsCount: 340,
    experience: '8+ Years',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    location: 'HSR Layout & Koramangala',
    verified: true,
    backgroundChecked: true,
    badges: ['Top Rated Pro', 'BigBazaar Verified', 'Emergency Fast Response'],
    bio: 'Government certified master electrician with specialized HVAC technical training. Completed 1,200+ residential and commercial electrical projects across Bengaluru with 100% safety record.',
    servicesOffered: ['AC Repair', 'Electrician', 'Appliance Servicing']
  },
  {
    id: 'prv-02',
    name: 'Santosh Plumbing Works',
    trade: 'Licensed Master Plumber',
    rating: 4.88,
    reviewsCount: 265,
    experience: '11+ Years',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    location: 'Indiranagar & Whitefield',
    verified: true,
    backgroundChecked: true,
    badges: ['Leak Specialist', 'BigBazaar Verified', 'Same-Day Service'],
    bio: 'Specialist in concealed pipeline leak detection, CPVC/GI pipe fitting, high-rise pressure issues, and modern luxury sanitary installations.',
    servicesOffered: ['Plumbing', 'Waterproofing', 'Bathroom Renovation']
  },
  {
    id: 'prv-03',
    name: 'CleanPro Hygiene Squad',
    trade: 'Commercial & Home Sanitization Team',
    rating: 4.95,
    reviewsCount: 480,
    experience: '6+ Years',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    location: 'All Bengaluru Localities',
    verified: true,
    backgroundChecked: true,
    badges: ['Top Clean Agency', 'Eco-Friendly Chemicals', 'Verified Team'],
    bio: 'Trained and background-verified team equipped with industrial single-disc floor scrubbers and Karcher vacuum extractors for deep cleaning.',
    servicesOffered: ['Home Cleaning', 'Pest Control', 'Sofa Dry Cleaning']
  }
];

export const MOCK_NOTIFICATIONS = [
  {
    id: 'notif-01',
    title: 'Listing Approved & Live!',
    body: 'Your listing "Apple iPhone 14 Pro 128GB" passed AI content review and is now live to thousands of buyers.',
    time: '25 mins ago',
    read: false,
    type: 'listing',
    link: '/listing/list-01'
  },
  {
    id: 'notif-02',
    title: 'New Offer Received: ₹62,000',
    body: 'Aarav Sharma made an offer of ₹62,000 for your "Apple iPhone 14 Pro 128GB".',
    time: '1 hour ago',
    read: false,
    type: 'offer',
    link: '/chat'
  },
  {
    id: 'notif-03',
    title: 'Service Partner Assigned',
    body: 'Rajesh Kumar Tech is assigned to your AC Foam Jet Deep Clean scheduled for tomorrow at 10:00 AM.',
    time: '3 hours ago',
    read: true,
    type: 'booking',
    link: '/orders'
  },
  {
    id: 'notif-04',
    title: 'Welcome to MyBigBazaar!',
    body: 'Use code FIRST20 on your first marketplace deal or service booking for 20% instant discount.',
    time: '1 day ago',
    read: true,
    type: 'promo',
    link: '/services'
  }
];

export const MOCK_CHATS = [
  {
    id: 'chat-01',
    listingId: 'list-01',
    listingTitle: 'Apple iPhone 14 Pro 128GB',
    listingPrice: 68500,
    listingImage: 'https://images.unsplash.com/photo-1678685888221-cda773a3dcdb?w=200&auto=format&fit=crop&q=80',
    otherUser: {
      id: 'usr-seller-01',
      name: 'Priya Patel',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
      online: true,
      role: 'Seller'
    },
    lastMessage: 'Sure, ₹64,000 works if you can pick it up tomorrow afternoon from Indiranagar.',
    lastTime: '12:45 PM',
    unreadCount: 1,
    messages: [
      {
        id: 'msg-01',
        sender: 'other',
        text: 'Hi Aarav, thanks for your interest in the iPhone 14 Pro.',
        time: '12:30 PM'
      },
      {
        id: 'msg-02',
        sender: 'me',
        text: 'Hello Priya, is the bill and original box available? Also what is the lowest you can do?',
        time: '12:32 PM'
      },
      {
        id: 'msg-03',
        sender: 'other',
        text: 'Yes! Original box, Apple invoice, and USB-C braided cable are included. Battery is 96%.',
        time: '12:35 PM'
      },
      {
        id: 'msg-04',
        sender: 'me',
        type: 'offer',
        offerAmount: 62000,
        offerStatus: 'countered',
        text: 'Made an offer: ₹62,000',
        time: '12:38 PM'
      },
      {
        id: 'msg-05',
        sender: 'other',
        type: 'offer',
        offerAmount: 64000,
        offerStatus: 'pending',
        text: 'Counter-offer received: ₹64,000',
        time: '12:42 PM'
      },
      {
        id: 'msg-06',
        sender: 'other',
        text: 'Sure, ₹64,000 works if you can pick it up tomorrow afternoon from Indiranagar.',
        time: '12:45 PM'
      }
    ]
  },
  {
    id: 'chat-02',
    listingId: 'list-02',
    listingTitle: 'Sony WH-1000XM5 Headphones',
    listingPrice: 18900,
    listingImage: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=200&auto=format&fit=crop&q=80',
    otherUser: {
      id: 'usr-seller-02',
      name: 'Vikram Mehta',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
      online: false,
      role: 'Seller'
    },
    lastMessage: 'I have kept it packed in the travel case. Let me know when you reach Koramangala.',
    lastTime: 'Yesterday',
    unreadCount: 0,
    messages: [
      {
        id: 'msg-10',
        sender: 'me',
        text: 'Hi Vikram, are the Sony headphones still available?',
        time: 'Yesterday 3:15 PM'
      },
      {
        id: 'msg-11',
        sender: 'other',
        text: 'Yes they are! Barely used, immaculate condition.',
        time: 'Yesterday 3:20 PM'
      },
      {
        id: 'msg-12',
        sender: 'other',
        text: 'I have kept it packed in the travel case. Let me know when you reach Koramangala.',
        time: 'Yesterday 4:00 PM'
      }
    ]
  }
];

export const MOCK_BOOKINGS = [
  {
    id: 'BKG-882194',
    serviceTitle: 'Complete Split AC Foam Jet Deep Servicing',
    category: 'AC Repair',
    date: 'Tomorrow, Oct 3, 2026',
    timeSlot: '10:00 AM - 12:00 PM',
    status: 'assigned',
    amount: 499,
    discount: 100,
    platformFee: 10,
    total: 409,
    paymentMethod: 'UPI (Paid Online)',
    paymentStatus: 'paid',
    address: 'Flat 402, Green Glen Layout, Bellandur, Bengaluru - 560103',
    provider: {
      id: 'prv-01',
      name: 'Rajesh Kumar Tech',
      phone: '+91 98111 87654',
      rating: 4.92,
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
    },
    timeline: [
      { step: 'Booked', time: 'Oct 2, 8:15 PM', done: true },
      { step: 'Confirmed', time: 'Oct 2, 8:20 PM', done: true },
      { step: 'Assigned', time: 'Oct 2, 8:30 PM', done: true },
      { step: 'On the Way', time: 'Scheduled Oct 3, 9:30 AM', done: false },
      { step: 'In Progress', time: 'Scheduled Oct 3, 10:00 AM', done: false },
      { step: 'Completed', time: 'Pending completion', done: false }
    ]
  },
  {
    id: 'BKG-771032',
    serviceTitle: 'Full 3BHK Home Deep Cleaning & Sanitization',
    category: 'Home Cleaning',
    date: 'Sep 28, 2026',
    timeSlot: '9:00 AM - 3:00 PM',
    status: 'completed',
    amount: 3499,
    discount: 500,
    platformFee: 70,
    total: 3069,
    paymentMethod: 'Pay After Service (Cash)',
    paymentStatus: 'paid',
    address: 'Flat 402, Green Glen Layout, Bellandur, Bengaluru - 560103',
    provider: {
      id: 'prv-03',
      name: 'CleanPro Hygiene Squad',
      phone: '+91 98222 33445',
      rating: 4.95,
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80'
    },
    timeline: [
      { step: 'Booked', time: 'Sep 26, 4:00 PM', done: true },
      { step: 'Confirmed', time: 'Sep 26, 4:10 PM', done: true },
      { step: 'Assigned', time: 'Sep 27, 9:00 AM', done: true },
      { step: 'In Progress', time: 'Sep 28, 9:15 AM', done: true },
      { step: 'Completed', time: 'Sep 28, 3:30 PM', done: true }
    ]
  }
];

export const MOCK_ORDERS = [
  {
    id: 'ORD-991204',
    itemTitle: 'Sony WH-1000XM5 Wireless Headphones',
    type: 'product',
    amount: 18900,
    platformFee: 378,
    total: 19278,
    date: 'Oct 1, 2026',
    status: 'in_escrow',
    escrowStatus: 'Escrow Held Safely',
    seller: {
      name: 'Vikram Mehta',
      phone: '+91 98333 44556',
      location: 'Koramangala, Bengaluru'
    },
    deliveryAddress: 'Flat 402, Green Glen Layout, Bellandur, Bengaluru - 560103',
    timeline: [
      { step: 'Order Placed', time: 'Oct 1, 11:20 AM', done: true },
      { step: 'Payment in Escrow', time: 'Oct 1, 11:22 AM', done: true },
      { step: 'Seller Confirmed', time: 'Oct 1, 2:00 PM', done: true },
      { step: 'Handover / Inspection', time: 'Scheduled Oct 3', done: false },
      { step: 'Payment Released', time: 'Pending Buyer OK', done: false }
    ]
  }
];

export const MOCK_REVIEWS = [
  {
    id: 'rev-01',
    author: 'Sunita Reddy',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    rating: 5,
    date: '3 days ago',
    comment: 'Priya was super transparent about the phone condition. Met at a Starbucks in Indiranagar, tested all features, battery health was exactly as advertised. Very trustworthy seller!',
    verifiedPurchase: true
  },
  {
    id: 'rev-02',
    author: 'Karthik Narayanan',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    rating: 5,
    date: '1 week ago',
    comment: 'Rajesh arrived right on time with all pressure washer equipment. Cleaned our 2 ACs thoroughly, no mess on the floor. AC cooling is back to icy cold.',
    verifiedPurchase: true
  }
];
