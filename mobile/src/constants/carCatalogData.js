/**
 * Comprehensive Category Catalogs (Brand -> Model -> Variant),
 * Canonical OLX-style Seller Form Schemas for ALL Categories,
 * and Smart AI "Write for me" / "Rephrase" Suggestion Generator.
 * Shared across Admin Panel (MarketplaceSellerForms & AllListings) and Mobile App (PostAdScreen).
 */

export const CAR_BRANDS_CATALOG = [
  {
    brand: 'Maruti Suzuki',
    models: [
      {
        model: 'Dzire',
        variants: ['1.2 Range Extender', 'LXI', 'VXI', 'VXI AMT', 'VXI CNG', 'ZXI', 'ZXI AMT', 'ZXI CNG', 'ZXI+', 'ZXI+ AMT', 'VDI', 'ZDI+']
      },
      {
        model: 'Swift',
        variants: ['LXI', 'VXI', 'VXI(O)', 'VXI AMT', 'VXI CNG', 'ZXI', 'ZXI AMT', 'ZXI CNG', 'ZXI+', 'ZXI+ AMT']
      },
      {
        model: 'Baleno',
        variants: ['Sigma', 'Delta', 'Delta AMT', 'Delta CNG', 'Zeta', 'Zeta AMT', 'Zeta CNG', 'Alpha', 'Alpha AMT']
      },
      {
        model: 'Brezza',
        variants: ['LXI', 'LXI CNG', 'VXI', 'VXI AT', 'VXI CNG', 'ZXI', 'ZXI AT', 'ZXI CNG', 'ZXI+', 'ZXI+ AT']
      },
      {
        model: 'Wagon R',
        variants: ['LXI 1.0', 'LXI 1.0 CNG', 'VXI 1.0', 'VXI 1.0 AMT', 'VXI 1.0 CNG', 'ZXI 1.2', 'ZXI+ 1.2 AMT']
      },
      {
        model: 'Ertiga',
        variants: ['LXI(O)', 'VXI(O)', 'VXI(O) CNG', 'VXI AT', 'ZXI(O)', 'ZXI(O) CNG', 'ZXI+', 'ZXI+ AT']
      },
      {
        model: 'Grand Vitara',
        variants: ['Sigma Smart Hybrid', 'Delta Smart Hybrid', 'Delta CNG', 'Zeta Smart Hybrid', 'Alpha Smart Hybrid', 'Alpha+ Electric Hybrid']
      },
      {
        model: 'Fronx',
        variants: ['Sigma 1.2', 'Sigma CNG', 'Delta 1.2', 'Delta+ 1.0 Turbo', 'Zeta 1.0 Turbo', 'Alpha 1.0 Turbo AT']
      },
      {
        model: 'Alto K10',
        variants: ['Std', 'LXI', 'VXI', 'VXI AMT', 'VXI+', 'VXI+ AMT', 'VXI CNG']
      }
    ]
  },
  {
    brand: 'Hyundai',
    models: [
      {
        model: 'Creta',
        variants: ['E 1.5 Petrol', 'EX 1.5 Petrol', 'S 1.5 Petrol', 'SX 1.5 Petrol', 'SX(O) IVT', 'SX(O) Turbo DCT', 'SX(O) 1.5 Diesel AT', 'N Line N10']
      },
      {
        model: 'Venue',
        variants: ['E 1.2 Petrol', 'S 1.2 Petrol', 'S(O) 1.0 Turbo iMT', 'SX 1.2 Petrol', 'SX(O) 1.0 Turbo DCT', 'SX(O) 1.5 Diesel']
      },
      {
        model: 'i20',
        variants: ['Era', 'Magna', 'Sportz', 'Sportz IVT', 'Asta', 'Asta(O) IVT', 'N Line N8 DCT']
      },
      {
        model: 'Verna',
        variants: ['EX 1.5', 'S 1.5', 'SX 1.5', 'SX IVT', 'SX(O) 1.5', 'SX(O) 1.5 Turbo DCT']
      },
      {
        model: 'Grand i10 Nios',
        variants: ['Era', 'Magna', 'Magna CNG', 'Sportz', 'Sportz AMT', 'Sportz CNG', 'Asta']
      },
      {
        model: 'Exter',
        variants: ['EX', 'S', 'S CNG', 'SX', 'SX AMT', 'SX(O) Connect', 'SX(O) Connect AMT']
      }
    ]
  },
  {
    brand: 'Tata',
    models: [
      {
        model: 'Nexon',
        variants: ['Smart', 'Pure', 'Creative', 'Creative+ S', 'Fearless+ S DCA', 'Fearless+ S Diesel', 'Empowered+ S EV']
      },
      {
        model: 'Punch',
        variants: ['Pure', 'Adventure', 'Adventure Rhythm', 'Accomplished', 'Accomplished Dazzle', 'Creative Flagship', 'iCNG Accomplished']
      },
      {
        model: 'Harrier',
        variants: ['Smart', 'Pure+', 'Adventure+', 'Fearless', 'Fearless+ Dark Edition AT']
      },
      {
        model: 'Safari',
        variants: ['Smart', 'Pure+', 'Adventure+ A', 'Accomplished+', 'Accomplished+ Dark 6S AT']
      },
      {
        model: 'Tiago',
        variants: ['XE', 'XM', 'XT(O)', 'XT', 'XZ+', 'XZ+ iCNG', 'XT.ev Long Range']
      },
      {
        model: 'Altroz',
        variants: ['XE', 'XM+', 'XT', 'XZ', 'XZ+ S', 'XZ+ iCNG', 'Racer R3']
      }
    ]
  },
  {
    brand: 'Mahindra',
    models: [
      {
        model: 'Scorpio N',
        variants: ['Z2 Petrol', 'Z4 Diesel', 'Z6 Diesel', 'Z8 Select', 'Z8L Diesel 4WD', 'Z8L Diesel AT 4WD']
      },
      {
        model: 'XUV700',
        variants: ['MX 5 Str', 'AX3 5 Str', 'AX5 7 Str', 'AX7 7 Str', 'AX7 Luxury Pack AT', 'AX7 Luxury AWD']
      },
      {
        model: 'Thar',
        variants: ['AX Opt Convertible', 'LX Hard Top RWD Diesel', 'LX Hard Top 4WD Petrol AT', 'LX Hard Top 4WD Diesel AT', 'Roxx MX5 4WD']
      },
      {
        model: 'XUV 3XO',
        variants: ['MX1', 'MX3 Pro', 'AX5', 'AX5 Luxury', 'AX7', 'AX7 Luxury TGDi AT']
      },
      {
        model: 'Bolero',
        variants: ['B4', 'B6', 'B6(O)', 'Neo N4', 'Neo N8', 'Neo N10(O)']
      }
    ]
  },
  {
    brand: 'Toyota',
    models: [
      {
        model: 'Innova Crysta',
        variants: ['2.4 GX 7 STR', '2.4 GX 8 STR', '2.4 VX 7 STR', '2.4 VX 8 STR', '2.4 ZX 7 STR']
      },
      {
        model: 'Innova Hycross',
        variants: ['GX 7 STR', 'GX(O) 7 STR', 'VX Hybrid 7 STR', 'VX(O) Hybrid', 'ZX Hybrid', 'ZX(O) Hybrid']
      },
      {
        model: 'Fortuner',
        variants: ['4x2 MT Petrol', '4x2 AT Diesel', '4x4 MT Diesel', '4x4 AT Diesel', 'Legender 4x2 AT', 'Legender 4x4 AT', 'GR-S 4x4']
      },
      {
        model: 'Glanza',
        variants: ['E', 'S', 'S AMT', 'S E-CNG', 'G', 'G AMT', 'G E-CNG', 'V', 'V AMT']
      },
      {
        model: 'Urban Cruiser Hyryder',
        variants: ['E NeoDrive', 'S NeoDrive', 'S E-CNG', 'G NeoDrive', 'G Hybrid', 'V Hybrid']
      }
    ]
  },
  {
    brand: 'Honda',
    models: [
      {
        model: 'City',
        variants: ['SV MT', 'V MT', 'V CVT', 'VX MT', 'VX CVT', 'ZX MT', 'ZX CVT', 'e:HEV ZX Hybrid']
      },
      {
        model: 'Amaze',
        variants: ['E MT', 'S MT', 'S CVT', 'VX MT', 'VX CVT', 'Elite Edition']
      },
      {
        model: 'Elevate',
        variants: ['SV MT', 'V MT', 'V CVT', 'VX MT', 'VX CVT', 'ZX MT', 'ZX CVT Dual Tone']
      }
    ]
  },
  {
    brand: 'Kia',
    models: [
      {
        model: 'Seltos',
        variants: ['HTE', 'HTK', 'HTK+', 'HTX', 'HTX IVT', 'GTX+ S', 'GTX+ Turbo DCT', 'GTX+ Diesel AT', 'X-Line']
      },
      {
        model: 'Sonet',
        variants: ['HTE', 'HTK', 'HTK+', 'HTX', 'HTX Turbo iMT', 'HTX Diesel AT', 'GTX+ DCT', 'X-Line']
      },
      {
        model: 'Carens',
        variants: ['Premium', 'Prestige', 'Prestige+', 'Luxury', 'Luxury Plus DCT', 'X-Line 6 STR']
      }
    ]
  },
  {
    brand: 'Volkswagen',
    models: [
      {
        model: 'Virtus',
        variants: ['Comfortline 1.0 TSI', 'Highline 1.0 TSI', 'Topline 1.0 TSI AT', 'GT Line', 'GT Plus 1.5 TSI EVO DSG']
      },
      {
        model: 'Taigun',
        variants: ['Comfortline 1.0 TSI', 'Highline 1.0 TSI', 'Topline 1.0 TSI AT', 'GT 1.5 TSI', 'GT Plus Chrome DSG']
      }
    ]
  },
  {
    brand: 'Skoda',
    models: [
      {
        model: 'Slavia',
        variants: ['Classic 1.0 TSI', 'Signature 1.0 TSI', 'Signature AT', 'Prestige 1.0 TSI', 'Prestige 1.5 TSI DSG', 'Monte Carlo']
      },
      {
        model: 'Kushaq',
        variants: ['Classic 1.0 TSI', 'Onyx 1.0 TSI', 'Signature 1.0 TSI', 'Monte Carlo', 'Prestige 1.5 TSI DSG']
      }
    ]
  },
  {
    brand: 'MG',
    models: [
      {
        model: 'Hector',
        variants: ['Style', 'Shine Pro', 'Select Pro', 'Sharp Pro', 'Sharp Pro CVT', 'Savvy Pro CVT', 'Blackstorm']
      },
      {
        model: 'Astor',
        variants: ['Sprint', 'Shine', 'Select', 'Sharp Pro', 'Savvy Pro Turbo AT']
      },
      {
        model: 'Comet EV',
        variants: ['Executive', 'Excite', 'Excite FC', 'Exclusive', 'Exclusive FC']
      }
    ]
  }
];

export const BIKE_BRANDS_CATALOG = [
  {
    brand: 'Royal Enfield',
    models: [
      { model: 'Classic 350', variants: ['Redditch', 'Halcyon', 'Signals', 'Dark Stealth Black', 'Chrome Bronze'] },
      { model: 'Hunter 350', variants: ['Retro Factory', 'Metro Dapper', 'Metro Rebel'] },
      { model: 'Bullet 350', variants: ['Military', 'Standard', 'Black Gold'] },
      { model: 'Meteor 350', variants: ['Fireball', 'Stellar', 'Aurora', 'Supernova'] },
      { model: 'Himalayan 450', variants: ['Base Kaza Brown', 'Pass Slate', 'Kamet White', 'Hanle Black'] },
      { model: 'Continental GT 650', variants: ['British Racing Green', 'Rocker Red', 'Apex Grey', 'Mr Clean Chrome'] }
    ]
  },
  {
    brand: 'Honda',
    models: [
      { model: 'Activa 6G', variants: ['Standard', 'Deluxe', 'H-Smart'] },
      { model: 'Activa 125', variants: ['Drum', 'Drum Alloy', 'Disc', 'H-Smart'] },
      { model: 'Shine 125', variants: ['Drum OBD2', 'Disc OBD2'] },
      { model: 'SP 125', variants: ['Drum', 'Disc', 'Sports Edition'] },
      { model: 'CB350 H\'ness', variants: ['DLX', 'DLX Pro', 'DLX Pro Chrome', 'Legacy Edition'] }
    ]
  },
  {
    brand: 'Hero',
    models: [
      { model: 'Splendor Plus', variants: ['Self with Alloy', 'Black and Accent', 'i3S', 'XTEC', 'XTEC 2.0'] },
      { model: 'HF Deluxe', variants: ['Kick Start', 'Self Start', 'i3S', 'Canvas Black'] },
      { model: 'Xpulse 200 4V', variants: ['Standard', 'Pro Edition', 'Dakar Edition'] },
      { model: 'Karizma XMR', variants: ['Standard 210cc'] }
    ]
  },
  {
    brand: 'Bajaj',
    models: [
      { model: 'Pulsar NS200', variants: ['Single Channel ABS', 'Dual Channel ABS Bluetooth'] },
      { model: 'Pulsar N160', variants: ['Single Seat', 'Dual Channel ABS', 'USD Fork Bluetooth'] },
      { model: 'Pulsar 150', variants: ['Single Disc', 'Twin Disc'] },
      { model: 'Dominar 400', variants: ['Touring Edition ABS'] },
      { model: 'Chetak Electric', variants: ['Urbane 2901', 'Premium 3201', 'TecPac'] }
    ]
  },
  {
    brand: 'TVS',
    models: [
      { model: 'Apache RTR 160 4V', variants: ['Drum', 'Single Disc', 'Dual Channel ABS', 'Special Edition'] },
      { model: 'Apache RTR 200 4V', variants: ['Dual Channel ABS with Ride Modes'] },
      { model: 'Raider 125', variants: ['Single Seat', 'Split Seat', 'SmartXonnect TFT'] },
      { model: 'Jupiter 110', variants: ['Drum', 'Drum Alloy', 'SmartXonnect Disc'] },
      { model: 'iQube Electric', variants: ['2.2 kWh', '3.4 kWh', 'S 3.4 kWh', 'ST 5.1 kWh'] }
    ]
  },
  {
    brand: 'Yamaha',
    models: [
      { model: 'R15 V4', variants: ['Metallic Red', 'Dark Knight', 'Racing Blue', 'R15M Carbon'] },
      { model: 'MT-15 V2', variants: ['Standard', 'Deluxe Bluetooth', 'MotoGP Edition'] },
      { model: 'FZ-S FI V4', variants: ['Standard', 'DLX'] },
      { model: 'Aerox 155', variants: ['Standard', 'Version S Smart Key'] }
    ]
  },
  {
    brand: 'KTM',
    models: [
      { model: 'Duke 200', variants: ['Dual Channel ABS LED'] },
      { model: 'Duke 250', variants: ['Gen-3 Quickshifter'] },
      { model: 'Duke 390', variants: ['Gen-3 TFT Launch Control'] },
      { model: 'RC 390', variants: ['Standard', 'GP Edition'] }
    ]
  },
  {
    brand: 'Ola Electric',
    models: [
      { model: 'S1 Pro', variants: ['Gen 2 4kWh'] },
      { model: 'S1 Air', variants: ['3kWh'] },
      { model: 'S1 X', variants: ['2kWh', '3kWh', '4kWh'] }
    ]
  }
];

export const MOBILE_BRANDS_CATALOG = [
  {
    brand: 'Apple',
    models: [
      { model: 'iPhone 16 Pro Max', variants: ['256 GB', '512 GB', '1 TB'] },
      { model: 'iPhone 16 Pro', variants: ['128 GB', '256 GB', '512 GB', '1 TB'] },
      { model: 'iPhone 16', variants: ['128 GB', '256 GB', '512 GB'] },
      { model: 'iPhone 15 Pro Max', variants: ['256 GB', '512 GB', '1 TB'] },
      { model: 'iPhone 15', variants: ['128 GB', '256 GB', '512 GB'] },
      { model: 'iPhone 14', variants: ['128 GB', '256 GB', '512 GB'] },
      { model: 'iPhone 13', variants: ['128 GB', '256 GB'] }
    ]
  },
  {
    brand: 'Samsung',
    models: [
      { model: 'Galaxy S24 Ultra', variants: ['12GB / 256GB', '12GB / 512GB', '12GB / 1TB'] },
      { model: 'Galaxy S24+', variants: ['12GB / 256GB', '12GB / 512GB'] },
      { model: 'Galaxy S23 Ultra', variants: ['12GB / 256GB', '12GB / 512GB'] },
      { model: 'Galaxy Z Fold 6', variants: ['12GB / 256GB', '12GB / 512GB'] },
      { model: 'Galaxy A55 5G', variants: ['8GB / 128GB', '8GB / 256GB', '12GB / 256GB'] }
    ]
  },
  {
    brand: 'OnePlus',
    models: [
      { model: 'OnePlus 12', variants: ['12GB / 256GB', '16GB / 512GB'] },
      { model: 'OnePlus 12R', variants: ['8GB / 128GB', '8GB / 256GB', '16GB / 256GB'] },
      { model: 'OnePlus Nord 4', variants: ['8GB / 128GB', '8GB / 256GB', '12GB / 256GB'] },
      { model: 'OnePlus Open', variants: ['16GB / 512GB'] }
    ]
  },
  {
    brand: 'Xiaomi',
    models: [
      { model: 'Xiaomi 14', variants: ['12GB / 512GB'] },
      { model: 'Redmi Note 13 Pro+ 5G', variants: ['8GB / 256GB', '12GB / 256GB', '12GB / 512GB'] },
      { model: 'Redmi Note 13 5G', variants: ['6GB / 128GB', '8GB / 256GB'] }
    ]
  },
  {
    brand: 'Google Pixel',
    models: [
      { model: 'Pixel 9 Pro XL', variants: ['16GB / 256GB', '16GB / 512GB'] },
      { model: 'Pixel 9', variants: ['12GB / 256GB'] },
      { model: 'Pixel 8a', variants: ['8GB / 128GB', '8GB / 256GB'] }
    ]
  },
  {
    brand: 'Vivo',
    models: [
      { model: 'Vivo X100 Pro', variants: ['16GB / 512GB'] },
      { model: 'Vivo V40 Pro', variants: ['8GB / 256GB', '12GB / 512GB'] },
      { model: 'Vivo T3 Ultra', variants: ['8GB / 128GB', '12GB / 256GB'] }
    ]
  }
];

export const CAR_FUEL_OPTIONS = [
  'CNG & Hybrids',
  'Diesel',
  'Electric',
  'LPG',
  'Petrol'
];

export const CAR_TRANSMISSION_OPTIONS = [
  'Automatic',
  'Manual'
];

export const CAR_OWNER_OPTIONS = [
  '1st',
  '2nd',
  '3rd',
  '4th',
  '4+'
];

/**
 * Returns the cascading Brand -> Model -> Variant catalog for a given category
 */
export function getCascadingCatalogForCategory(categoryName = '') {
  const lower = String(categoryName || '').toLowerCase();
  if (lower.includes('bike') || lower.includes('scooter') || lower.includes('motorcycle')) {
    return BIKE_BRANDS_CATALOG;
  }
  if (lower.includes('mobile') || lower.includes('phone') || lower.includes('tablet')) {
    return MOBILE_BRANDS_CATALOG;
  }
  return CAR_BRANDS_CATALOG;
}

/**
 * Canonical OLX-style Seller Form Schemas for ALL 11 Marketplace Categories
 */
export const ALL_CATEGORY_SELLER_FORMS = {
  Cars: {
    category: 'Cars',
    title: 'Include some details',
    fields: [
      { id: 'f_car_bmv', key: 'brandModelVariant', label: 'Brand', type: 'brand_model_variant', placeholder: 'Brand *', required: true, order: 1 },
      { id: 'f_car_year', key: 'year', label: 'Year', type: 'number', placeholder: 'Year *', required: true, maxLength: 4, minValue: 1900, helperText: 'Year has a minimum value of 1900.', order: 2 },
      { id: 'f_car_fuel', key: 'fuel', label: 'Fuel', type: 'select', placeholder: 'Fuel *', options: CAR_FUEL_OPTIONS, required: true, order: 3 },
      { id: 'f_car_transmission', key: 'transmission', label: 'Transmission', type: 'segmented', options: CAR_TRANSMISSION_OPTIONS, required: false, order: 4 },
      { id: 'f_car_kmDriven', key: 'kmDriven', label: 'KM driven', type: 'number', placeholder: 'KM driven *', required: true, maxLength: 6, order: 5 },
      { id: 'f_car_owners', key: 'owners', label: 'No. of Owners', type: 'select', placeholder: 'No. of Owners', options: CAR_OWNER_OPTIONS, required: false, order: 6 }
    ]
  },
  Properties: {
    category: 'Properties',
    title: 'Include some details',
    fields: [
      { id: 'f_prop_type', key: 'propertyType', label: 'Type', type: 'select', placeholder: 'Type *', options: ['Apartments', 'Builder Floors', 'Farm Houses', 'Houses & Villas', 'Plots & Land', 'Shops & Offices', 'PG & Guest Houses'], required: true, order: 1 },
      { id: 'f_prop_bhk', key: 'bhk', label: 'BHK', type: 'segmented', options: ['1', '2', '3', '4', '4+'], required: false, order: 2 },
      { id: 'f_prop_bathrooms', key: 'bathrooms', label: 'Bathrooms', type: 'segmented', options: ['1', '2', '3', '4', '4+'], required: false, order: 3 },
      { id: 'f_prop_furnishing', key: 'furnishing', label: 'Furnishing', type: 'segmented', options: ['Furnished', 'Semi-Furnished', 'Unfurnished'], required: false, order: 4 },
      { id: 'f_prop_status', key: 'projectStatus', label: 'Construction Status', type: 'segmented', options: ['New Launch', 'Ready to Move', 'Under Construction'], required: false, order: 5 },
      { id: 'f_prop_listedBy', key: 'listedBy', label: 'Listed by', type: 'segmented', options: ['Builder', 'Dealer', 'Owner'], required: false, order: 6 },
      { id: 'f_prop_superBuiltup', key: 'superBuiltupArea', label: 'Super Builtup area (ft²)', type: 'number', placeholder: 'Super Builtup area (ft²) *', required: true, maxLength: 6, order: 7 },
      { id: 'f_prop_carpetArea', key: 'carpetArea', label: 'Carpet Area (ft²)', type: 'number', placeholder: 'Carpet Area (ft²) *', required: true, maxLength: 6, order: 8 },
      { id: 'f_prop_maintenance', key: 'maintenanceMonthly', label: 'Maintenance (Monthly)', type: 'number', placeholder: 'Maintenance (Monthly)', required: false, maxLength: 5, order: 9 },
      { id: 'f_prop_totalFloors', key: 'totalFloors', label: 'Total Floors', type: 'number', placeholder: 'Total Floors', required: false, maxLength: 3, order: 10 },
      { id: 'f_prop_floorNo', key: 'floorNo', label: 'Floor No', type: 'number', placeholder: 'Floor No', required: false, maxLength: 3, order: 11 },
      { id: 'f_prop_carParking', key: 'carParking', label: 'Car Parking', type: 'segmented', options: ['0', '1', '2', '3', '3+'], required: false, order: 12 },
      { id: 'f_prop_facing', key: 'facing', label: 'Facing', type: 'select', placeholder: 'Facing', options: ['East', 'North', 'North-East', 'North-West', 'South', 'South-East', 'South-West', 'West'], required: false, order: 13 },
      { id: 'f_prop_projectName', key: 'projectName', label: 'Project Name', type: 'text', placeholder: 'Project / Society Name', maxLength: 70, required: false, order: 14 }
    ]
  },
  Mobiles: {
    category: 'Mobiles',
    title: 'Include some details',
    fields: [
      { id: 'f_mob_bmv', key: 'brandModelVariant', label: 'Brand', type: 'brand_model_variant', placeholder: 'Brand / Model / Storage *', required: true, order: 1 },
      { id: 'f_mob_ram', key: 'ram', label: 'RAM', type: 'segmented', options: ['4 GB', '6 GB', '8 GB', '12 GB', '16 GB'], required: false, order: 2 },
      { id: 'f_mob_storage', key: 'storage', label: 'Internal Storage', type: 'segmented', options: ['64 GB', '128 GB', '256 GB', '512 GB', '1 TB'], required: true, order: 3 },
      { id: 'f_mob_network', key: 'network', label: 'Network Type', type: 'segmented', options: ['5G', '4G LTE'], required: false, order: 4 },
      { id: 'f_mob_battery', key: 'batteryHealth', label: 'Battery / Device Condition', type: 'select', placeholder: 'Select Condition *', options: ['Brand New Sealed', '90% - 100% (Mint)', '80% - 89% (Good)', 'Below 80%'], required: true, order: 5 },
      { id: 'f_mob_warranty', key: 'warranty', label: 'Warranty Status', type: 'segmented', options: ['In Warranty', 'Out of Warranty'], required: false, order: 6 },
      { id: 'f_mob_accessories', key: 'accessories', label: 'Accessories Included', type: 'select', placeholder: 'Bill & Box Included', options: ['Original Box, Bill & Charger', 'Original Box & Charger', 'Only Charger', 'Phone Only'], required: false, order: 7 }
    ]
  },
  Bikes: {
    category: 'Bikes',
    title: 'Include some details',
    fields: [
      { id: 'f_bike_bmv', key: 'brandModelVariant', label: 'Brand', type: 'brand_model_variant', placeholder: 'Brand / Model / Variant *', required: true, order: 1 },
      { id: 'f_bike_year', key: 'year', label: 'Year', type: 'number', placeholder: 'Year *', required: true, maxLength: 4, minValue: 1900, helperText: 'Year has a minimum value of 1900.', order: 2 },
      { id: 'f_bike_fuel', key: 'fuel', label: 'Fuel', type: 'segmented', options: ['Petrol', 'Electric'], required: true, order: 3 },
      { id: 'f_bike_kmDriven', key: 'kmDriven', label: 'KM driven', type: 'number', placeholder: 'KM driven *', required: true, maxLength: 6, order: 4 },
      { id: 'f_bike_owners', key: 'owners', label: 'No. of Owners', type: 'select', placeholder: 'No. of Owners', options: CAR_OWNER_OPTIONS, required: false, order: 5 }
    ]
  },
  'Electronics & Appliances': {
    category: 'Electronics & Appliances',
    title: 'Include some details',
    fields: [
      { id: 'f_elec_type', key: 'applianceType', label: 'Appliance / Device Type', type: 'select', placeholder: 'Appliance / Device Type *', options: ['TVs, Video - Audio', 'Computers & Laptops', 'Cameras & Lenses', 'Fridges & Refrigerators', 'Washing Machines', 'ACs & Coolers', 'Kitchen & Other Appliances', 'Gaming Consoles'], required: true, order: 1 },
      { id: 'f_elec_brand', key: 'brand', label: 'Brand', type: 'select', placeholder: 'Brand *', options: ['Sony', 'LG', 'Samsung', 'Apple', 'Dell', 'HP', 'Lenovo', 'Asus', 'Canon', 'Nikon', 'Whirlpool', 'Voltas', 'Daikin', 'Bose', 'JBL', 'Other'], required: true, order: 2 },
      { id: 'f_elec_model', key: 'model', label: 'Model / Series', type: 'text', placeholder: 'Model / Capacity / Screen Size *', required: true, maxLength: 60, order: 3 },
      { id: 'f_elec_condition', key: 'conditionGrade', label: 'Condition', type: 'segmented', options: ['Brand New', 'Like New', 'Excellent', 'Good'], required: true, order: 4 },
      { id: 'f_elec_warranty', key: 'warranty', label: 'Warranty', type: 'segmented', options: ['Under Warranty', 'Out of Warranty'], required: false, order: 5 },
      { id: 'f_elec_year', key: 'year', label: 'Purchase Year', type: 'number', placeholder: 'Year', required: false, maxLength: 4, minValue: 1990, order: 6 }
    ]
  },
  'Commercial Vehicles & Spares': {
    category: 'Commercial Vehicles & Spares',
    title: 'Include some details',
    fields: [
      { id: 'f_comm_type', key: 'vehicleType', label: 'Vehicle / Spare Type', type: 'select', placeholder: 'Select Type *', options: ['Trucks & Tempos', 'Auto-rickshaws & E-rickshaws', 'Buses & Vans', 'Tractors & Farm Vehicles', 'Heavy Construction Machinery', 'Spare Parts & Accessories'], required: true, order: 1 },
      { id: 'f_comm_brand', key: 'brand', label: 'Brand', type: 'select', placeholder: 'Brand *', options: ['Tata Motors', 'Mahindra', 'Ashok Leyland', 'Eicher', 'BharatBenz', 'Force Motors', 'Piaggio', 'Bajaj', 'Swaraj', 'John Deere', 'Other'], required: true, order: 2 },
      { id: 'f_comm_model', key: 'model', label: 'Model', type: 'text', placeholder: 'e.g. Ace Gold, Bolero Pik-Up, Intra V30 *', required: true, maxLength: 50, order: 3 },
      { id: 'f_comm_year', key: 'year', label: 'Year', type: 'number', placeholder: 'Year *', required: true, maxLength: 4, minValue: 1900, order: 4 },
      { id: 'f_comm_fuel', key: 'fuel', label: 'Fuel', type: 'select', placeholder: 'Fuel *', options: CAR_FUEL_OPTIONS, required: true, order: 5 },
      { id: 'f_comm_kmDriven', key: 'kmDriven', label: 'KM driven', type: 'number', placeholder: 'KM driven *', required: true, maxLength: 6, order: 6 },
      { id: 'f_comm_owners', key: 'owners', label: 'No. of Owners', type: 'select', placeholder: 'No. of Owners', options: CAR_OWNER_OPTIONS, required: false, order: 7 }
    ]
  },
  Furniture: {
    category: 'Furniture',
    title: 'Include some details',
    fields: [
      { id: 'f_furn_type', key: 'furnitureType', label: 'Furniture Type', type: 'select', placeholder: 'Furniture Type *', options: ['Sofa & Dining', 'Beds & Wardrobes', 'Home Decor & Garden', 'Kids Furniture', 'Office Tables & Chairs', 'Other Household Items'], required: true, order: 1 },
      { id: 'f_furn_material', key: 'material', label: 'Primary Material', type: 'select', placeholder: 'Primary Material *', options: ['Solid Teak / Sheesham Wood', 'Engineered Wood', 'Metal / Wrought Iron', 'Leatherette / Fabric', 'Glass & Marble', 'Cane / Rattan'], required: true, order: 2 },
      { id: 'f_furn_condition', key: 'conditionGrade', label: 'Condition', type: 'segmented', options: ['Brand New', 'Like New', 'Good', 'Gently Used'], required: true, order: 3 },
      { id: 'f_furn_dimensions', key: 'dimensions', label: 'Dimensions (L × W × H)', type: 'text', placeholder: 'e.g. 78 x 36 x 32 inches', required: false, maxLength: 50, order: 4 },
      { id: 'f_furn_assembly', key: 'assembly', label: 'Assembly Status', type: 'segmented', options: ['Pre-Assembled', 'DIY / Knockdown'], required: false, order: 5 }
    ]
  },
  Fashion: {
    category: 'Fashion',
    title: 'Include some details',
    fields: [
      { id: 'f_fash_type', key: 'fashionCategory', label: 'Fashion Category', type: 'select', placeholder: 'Category *', options: ['Men\'s Apparel', 'Women\'s Apparel', 'Footwear & Sneakers', 'Watches & Luxury Accessories', 'Ethnic & Bridal Wear', 'Kids Fashion'], required: true, order: 1 },
      { id: 'f_fash_brand', key: 'brand', label: 'Brand / Designer', type: 'select', placeholder: 'Brand *', options: ['Zara', 'H&M', 'Nike', 'Adidas', 'Levi\'s', 'Manyavar', 'Fabindia', 'Puma', 'Tommy Hilfiger', 'Fossil', 'Casio', 'Designer Boutique', 'Other'], required: true, order: 2 },
      { id: 'f_fash_size', key: 'size', label: 'Size', type: 'segmented', options: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'Free Size'], required: true, order: 3 },
      { id: 'f_fash_condition', key: 'conditionGrade', label: 'Condition', type: 'segmented', options: ['New with Tags', 'Worn Once', 'Like New', 'Good'], required: true, order: 4 },
      { id: 'f_fash_color', key: 'color', label: 'Color / Shade', type: 'text', placeholder: 'e.g. Midnight Black, Royal Blue, Ivory', required: false, maxLength: 40, order: 5 }
    ]
  },
  'Books, Sports & Hobbies': {
    category: 'Books, Sports & Hobbies',
    title: 'Include some details',
    fields: [
      { id: 'f_bsh_type', key: 'itemType', label: 'Category Type', type: 'select', placeholder: 'Select Item Type *', options: ['Books & Competitive Exam Material', 'Gym & Fitness Equipment', 'Musical Instruments', 'Cricket, Football & Sports Gear', 'Cycles & Bicycles', 'Collectibles & Board Games'], required: true, order: 1 },
      { id: 'f_bsh_brand', key: 'brand', label: 'Brand / Author / Publisher', type: 'text', placeholder: 'e.g. Yamaha, Cosco, Yonex, Pearson *', required: true, maxLength: 60, order: 2 },
      { id: 'f_bsh_condition', key: 'conditionGrade', label: 'Condition', type: 'segmented', options: ['Brand New', 'Like New', 'Good', 'Used'], required: true, order: 3 },
      { id: 'f_bsh_age', key: 'usageAge', label: 'Usage Age / Edition', type: 'select', placeholder: 'Select Age', options: ['Unused / New', 'Less than 6 Months', '6 - 12 Months', '1 - 2 Years', '2+ Years'], required: false, order: 4 }
    ]
  },
  Pets: {
    category: 'Pets',
    title: 'Include some details',
    fields: [
      { id: 'f_pet_type', key: 'petType', label: 'Pet / Accessory Type', type: 'select', placeholder: 'Select Type *', options: ['Dogs & Puppies', 'Cats & Kittens', 'Aquarium & Fishes', 'Birds', 'Pet Food, Cages & Accessories'], required: true, order: 1 },
      { id: 'f_pet_breed', key: 'breed', label: 'Breed / Item Name', type: 'text', placeholder: 'e.g. Golden Retriever, Persian Cat, 4ft Glass Aquarium *', required: true, maxLength: 60, order: 2 },
      { id: 'f_pet_age', key: 'age', label: 'Age', type: 'select', placeholder: 'Select Age', options: ['0 - 3 Months', '3 - 6 Months', '6 - 12 Months', '1 - 3 Years', 'Brand New Accessory'], required: false, order: 3 },
      { id: 'f_pet_vaccinated', key: 'vaccination', label: 'Vaccination / Quality Status', type: 'segmented', options: ['Fully Vaccinated', 'Partially Vaccinated', 'N/A (Accessory)'], required: false, order: 4 },
      { id: 'f_pet_certified', key: 'certified', label: 'KCI Registered / Vet Checked', type: 'segmented', options: ['Yes', 'No'], required: false, order: 5 }
    ]
  },
  Services: {
    category: 'Services',
    title: 'Include some details',
    fields: [
      { id: 'f_srv_type', key: 'serviceType', label: 'Service Category', type: 'select', placeholder: 'Select Service Type *', options: ['Electronics & Appliance Repair', 'Home Deep Cleaning & Pest Control', 'Packers & Movers', 'Plumbing, Electrical & Carpentry', 'Tuition & Academic Coaching', 'Beauty & Salon at Home', 'Web, IT & Digital Marketing', 'Event Photography & Catering'], required: true, order: 1 },
      { id: 'f_srv_provider', key: 'providerBrand', label: 'Business / Provider Name', type: 'text', placeholder: 'e.g. Apex Home Services, Rapid Tech Care *', required: true, maxLength: 60, order: 2 },
      { id: 'f_srv_mode', key: 'serviceMode', label: 'Service Delivery Mode', type: 'segmented', options: ['Doorstep / On-Site', 'In-Studio / Shop', 'Online / Remote'], required: true, order: 3 },
      { id: 'f_srv_exp', key: 'experience', label: 'Experience', type: 'select', placeholder: 'Years of Experience', options: ['1 - 2 Years', '3 - 5 Years', '5 - 10 Years', '10+ Years Certified'], required: false, order: 4 },
      { id: 'f_srv_warranty', key: 'warranty', label: 'Service Guarantee', type: 'segmented', options: ['30 Days Warranty', '7 Days Warranty', 'Standard'], required: false, order: 5 }
    ]
  },
  Jobs: {
    category: 'Jobs',
    title: 'Include some details',
    fields: [
      { id: 'f_job_role', key: 'jobRole', label: 'Job Category / Role', type: 'select', placeholder: 'Select Job Role *', options: ['Data Entry & Back Office', 'Sales & Marketing', 'BPO & Telecaller', 'Driver & Delivery', 'Office Assistant', 'Teacher & Trainer', 'Cook & Hospitality', 'Receptionist & Front Office', 'IT Engineer & Developer', 'Accountant', 'Other Jobs'], required: true, order: 1 },
      { id: 'f_job_company', key: 'companyName', label: 'Company / Employer Name', type: 'text', placeholder: 'e.g. TechNova Solutions, Reliance Retail *', required: true, maxLength: 60, order: 2 },
      { id: 'f_job_type', key: 'positionType', label: 'Position Type', type: 'segmented', options: ['Full-time', 'Part-time', 'Contract', 'Work From Home'], required: true, order: 3 },
      { id: 'f_job_period', key: 'salaryPeriod', label: 'Salary Period', type: 'segmented', options: ['Monthly', 'Weekly', 'Hourly', 'Yearly'], required: true, order: 4 },
      { id: 'f_job_exp', key: 'experienceRequired', label: 'Experience Required', type: 'select', placeholder: 'Select Experience', options: ['Fresher (0 - 1 Year)', '1 - 3 Years', '3 - 5 Years', '5+ Years'], required: false, order: 5 }
    ]
  }
};

/**
 * Generates OLX-style suggested Ad Title and Description for Cars
 */
export function generateCarSuggestion({
  brand = '',
  model = '',
  variant = '',
  year = '',
  fuel = '',
  transmission = '',
  kmDriven = '',
  owners = '',
  variantIndex = 0
}) {
  const cleanBrand = brand.trim() || 'Maruti Suzuki';
  const cleanModel = model.trim() || 'Dzire';
  const cleanVariant = variant.trim() || '1.2 Range Extender';
  const shortVariant = cleanVariant.split(' ')[0] || '';
  const cleanYear = String(year || '').trim() || String(new Date().getFullYear());

  const suggestedTitle = `${cleanBrand} ${cleanModel} ${shortVariant} ${cleanYear}`
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 70);

  const templates = [
    [
      `Step into the ${cleanModel} with its ${cleanVariant} technology.`,
      `- Model: ${cleanModel}`,
      `- Make: ${cleanBrand}`,
      fuel ? `- Fuel: ${fuel}` : null,
      transmission ? `- Transmission: ${transmission}` : null,
      kmDriven ? `- Odometer reading: ${kmDriven} km driven` : null,
      owners ? `- ${owners} owner vehicle` : null,
      `- Vehicle in excellent condition`
    ],
    [
      `Discover the ${cleanBrand} ${cleanModel} ${cleanVariant} in immaculate condition.`,
      `- Model: ${cleanModel}`,
      `- Variant: ${cleanVariant}`,
      year ? `- Year: ${cleanYear}` : null,
      fuel ? `- Fuel Type: ${fuel}` : null,
      transmission ? `- Transmission: ${transmission}` : null,
      kmDriven ? `- Odometer Reading: ${kmDriven} km driven` : null,
      owners ? `- ${owners} owner, well maintained` : null,
      `- This ${cleanModel} is perfect for those looking for a reliable and efficient vehicle.`
    ],
    [
      `Well-maintained ${cleanYear} ${cleanBrand} ${cleanModel} (${cleanVariant}) available for immediate sale.`,
      `- Brand: ${cleanBrand}`,
      `- Model: ${cleanModel} ${cleanVariant}`,
      fuel ? `- Fuel: ${fuel}` : null,
      transmission ? `- Gearbox: ${transmission}` : null,
      kmDriven ? `- Driven: ${kmDriven} km` : null,
      owners ? `- Ownership: ${owners} owner` : null,
      `- Clean interiors, timely serviced, and ready for a test drive.`
    ]
  ];

  const chosenLines = templates[variantIndex % templates.length].filter(Boolean);
  return {
    title: suggestedTitle,
    description: chosenLines.join('\n')
  };
}

/**
 * Universal Category Suggestion Generator for "Write for me" / "Rephrase" across ALL categories
 */
export function generateCategorySuggestion(categoryName = '', attrs = {}, variantIndex = 0) {
  const catLower = String(categoryName || '').toLowerCase();

  // 1. Cars
  if (catLower.includes('car')) {
    return generateCarSuggestion({
      brand: attrs.brand || '',
      model: attrs.model || '',
      variant: attrs.variant || '',
      year: attrs.year || '',
      fuel: attrs.fuel || '',
      transmission: attrs.transmission || '',
      kmDriven: attrs.kmDriven || '',
      owners: attrs.owners || '',
      variantIndex
    });
  }

  // 2. Bikes
  if (catLower.includes('bike')) {
    const brand = attrs.brand || 'Royal Enfield';
    const model = attrs.model || 'Classic 350';
    const variant = attrs.variant || '';
    const year = attrs.year || '2022';
    const title = `${brand} ${model} ${variant} ${year}`.replace(/\s+/g, ' ').trim().slice(0, 70);
    const lines = [
      variantIndex % 2 === 0
        ? `Ride home this well-maintained ${year} ${brand} ${model} ${variant} in top mechanical condition.`
        : `Immaculate ${brand} ${model} (${year}) available for immediate ownership transfer.`,
      `- Brand: ${brand}`,
      `- Model: ${model} ${variant}`.trim(),
      attrs.year ? `- Registration Year: ${attrs.year}` : null,
      attrs.fuel ? `- Fuel: ${attrs.fuel}` : null,
      attrs.kmDriven ? `- Odometer: ${attrs.kmDriven} km driven` : null,
      attrs.owners ? `- Ownership: ${attrs.owners} owner` : null,
      `- Single-hand ridden, timely serviced at authorized service center with valid insurance.`
    ].filter(Boolean);
    return { title, description: lines.join('\n') };
  }

  // 3. Properties
  if (catLower.includes('prop')) {
    const bhk = attrs.bhk ? `${attrs.bhk} BHK ` : '';
    const pType = attrs.propertyType || 'Apartment';
    const proj = attrs.projectName ? ` in ${attrs.projectName}` : '';
    const area = attrs.superBuiltupArea ? ` (${attrs.superBuiltupArea} sqft)` : '';
    const title = `${bhk}${pType}${proj}${area}`.replace(/\s+/g, ' ').trim().slice(0, 70);
    const lines = [
      variantIndex % 2 === 0
        ? `Spacious ${bhk}${pType}${proj} available with prime connectivity and modern amenities.`
        : `Premium ${bhk}${pType} featuring excellent ventilation, Vastu compliance, and 24x7 security.`,
      `- Property Type: ${pType}`,
      attrs.bhk ? `- Configuration: ${attrs.bhk} BHK, ${attrs.bathrooms || '2'} Bathrooms` : null,
      attrs.furnishing ? `- Furnishing: ${attrs.furnishing}` : null,
      attrs.superBuiltupArea ? `- Super Built-up Area: ${attrs.superBuiltupArea} sq.ft` : null,
      attrs.carpetArea ? `- Carpet Area: ${attrs.carpetArea} sq.ft` : null,
      attrs.projectStatus ? `- Status: ${attrs.projectStatus}` : null,
      attrs.facing ? `- Facing: ${attrs.facing}` : null,
      attrs.carParking ? `- Covered Parking: ${attrs.carParking}` : null,
      `- Clear title property ready for site visit.`
    ].filter(Boolean);
    return { title, description: lines.join('\n') };
  }

  // 4. Mobiles
  if (catLower.includes('mobile') || catLower.includes('phone')) {
    const brand = attrs.brand || 'Apple';
    const model = attrs.model || 'iPhone 15 Pro';
    const storage = attrs.storage || attrs.variant || '256 GB';
    const title = `${brand} ${model} ${storage} (${attrs.batteryHealth || 'Mint Condition'})`.replace(/\s+/g, ' ').trim().slice(0, 70);
    const lines = [
      variantIndex % 2 === 0
        ? `100% genuine ${brand} ${model} (${storage}) in scratchless condition.`
        : `Upgrade to the ${brand} ${model} with flagship performance and pristine display.`,
      `- Brand & Model: ${brand} ${model}`,
      attrs.ram ? `- RAM: ${attrs.ram}` : null,
      storage ? `- Storage: ${storage}` : null,
      attrs.network ? `- Network: ${attrs.network}` : null,
      attrs.batteryHealth ? `- Condition / Battery: ${attrs.batteryHealth}` : null,
      attrs.warranty ? `- Warranty: ${attrs.warranty}` : null,
      attrs.accessories ? `- Included: ${attrs.accessories}` : null,
      `- Never repaired, original display, FaceID/fingerprint working flawlessly.`
    ].filter(Boolean);
    return { title, description: lines.join('\n') };
  }

  // 5. Generic / Other Categories (Electronics, Commercial, Furniture, Fashion, Books, Pets, Services)
  const primaryParts = [
    attrs.brand || attrs.providerBrand,
    attrs.model || attrs.breed || attrs.furnitureType || attrs.applianceType || attrs.serviceType || attrs.fashionCategory || attrs.itemType || attrs.vehicleType,
    attrs.conditionGrade || attrs.year || attrs.size || attrs.serviceMode
  ].filter(Boolean);

  const fallbackTitle = primaryParts.length > 0
    ? primaryParts.join(' - ').slice(0, 70)
    : `Premium ${categoryName} Listing`;

  const detailBullets = Object.entries(attrs)
    .filter(([k, v]) => v && k !== 'brandModelVariant')
    .map(([k, v]) => {
      const cleanKey = k.replace(/([A-Z])/g, ' $1').replace(/^./, (c) => c.toUpperCase());
      return `- ${cleanKey}: ${v}`;
    });

  const descLines = [
    variantIndex % 2 === 0
      ? `High-quality ${fallbackTitle} available in verified condition.`
      : `Discover this genuine ${fallbackTitle} at an unbeatable marketplace value.`,
    ...detailBullets,
    `- Thoroughly checked and ready for immediate inspection or doorstep delivery.`
  ];

  return {
    title: fallbackTitle,
    description: descLines.join('\n')
  };
}
