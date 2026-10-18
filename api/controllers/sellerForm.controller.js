/**
 * @file apps/api/controllers/sellerForm.controller.js
 * @description Controller for dynamic marketplace category/subcategory seller forms across all 11 categories
 */

import mongoose from 'mongoose';
import { SellerForm, ProductCategory } from '../models/index.js';

const CAR_FUEL_OPTIONS = ['CNG & Hybrids', 'Diesel', 'Electric', 'LPG', 'Petrol'];
const CAR_TRANSMISSION_OPTIONS = ['Automatic', 'Manual'];
const CAR_OWNER_OPTIONS = ['1st', '2nd', '3rd', '4th', '4+'];

// Predefined seed templates for ALL 12 Marketplace Categories (fed into MongoDB on DB connection)
export const DEFAULT_SELLER_FORM_TEMPLATES = [
  {
    category: 'Cars',
    subCategory: '',
    title: 'Include some details',
    description: 'Dynamic specifications for Cars marketplace listings (Brand -> Model -> Variant, Year, Fuel, Transmission, KM driven, No. of Owners)',
    fields: [
      { id: 'f_car_bmv', key: 'brandModelVariant', label: 'Brand', type: 'brand_model_variant', placeholder: 'Brand *', required: true, order: 1 },
      { id: 'f_car_year', key: 'year', label: 'Year', type: 'number', placeholder: 'Year *', required: true, maxLength: 4, minValue: 1900, helperText: 'Year has a minimum value of 1900.', order: 2 },
      { id: 'f_car_fuel', key: 'fuel', label: 'Fuel', type: 'select', placeholder: 'Fuel *', options: CAR_FUEL_OPTIONS, required: true, order: 3 },
      { id: 'f_car_transmission', key: 'transmission', label: 'Transmission', type: 'segmented', options: CAR_TRANSMISSION_OPTIONS, required: false, order: 4 },
      { id: 'f_car_kmDriven', key: 'kmDriven', label: 'KM driven', type: 'number', placeholder: 'KM driven *', required: true, maxLength: 6, order: 5 },
      { id: 'f_car_owners', key: 'owners', label: 'No. of Owners', type: 'select', placeholder: 'No. of Owners', options: CAR_OWNER_OPTIONS, required: false, order: 6 }
    ],
    isActive: true
  },
  {
    category: 'Properties',
    subCategory: '',
    title: 'Include some details',
    description: 'Dynamic specifications for residential and commercial properties',
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
    ],
    isActive: true
  },
  {
    category: 'Mobiles',
    subCategory: '',
    title: 'Include some details',
    description: 'Dynamic specifications for Mobiles & Smartphones',
    fields: [
      { id: 'f_mob_bmv', key: 'brandModelVariant', label: 'Brand', type: 'brand_model_variant', placeholder: 'Brand / Model / Storage *', required: true, order: 1 },
      { id: 'f_mob_ram', key: 'ram', label: 'RAM', type: 'segmented', options: ['4 GB', '6 GB', '8 GB', '12 GB', '16 GB'], required: false, order: 2 },
      { id: 'f_mob_storage', key: 'storage', label: 'Internal Storage', type: 'segmented', options: ['64 GB', '128 GB', '256 GB', '512 GB', '1 TB'], required: true, order: 3 },
      { id: 'f_mob_network', key: 'network', label: 'Network Type', type: 'segmented', options: ['5G', '4G LTE'], required: false, order: 4 },
      { id: 'f_mob_battery', key: 'batteryHealth', label: 'Battery / Device Condition', type: 'select', placeholder: 'Select Condition *', options: ['Brand New Sealed', '90% - 100% (Mint)', '80% - 89% (Good)', 'Below 80%'], required: true, order: 5 },
      { id: 'f_mob_warranty', key: 'warranty', label: 'Warranty Status', type: 'segmented', options: ['In Warranty', 'Out of Warranty'], required: false, order: 6 },
      { id: 'f_mob_accessories', key: 'accessories', label: 'Accessories Included', type: 'select', placeholder: 'Bill & Box Included', options: ['Original Box, Bill & Charger', 'Original Box & Charger', 'Only Charger', 'Phone Only'], required: false, order: 7 }
    ],
    isActive: true
  },
  {
    category: 'Bikes',
    subCategory: '',
    title: 'Include some details',
    description: 'Dynamic specifications for 2-wheeler Motorcycles & Scooters',
    fields: [
      { id: 'f_bike_bmv', key: 'brandModelVariant', label: 'Brand', type: 'brand_model_variant', placeholder: 'Brand / Model / Variant *', required: true, order: 1 },
      { id: 'f_bike_year', key: 'year', label: 'Year', type: 'number', placeholder: 'Year *', required: true, maxLength: 4, minValue: 1900, helperText: 'Year has a minimum value of 1900.', order: 2 },
      { id: 'f_bike_fuel', key: 'fuel', label: 'Fuel', type: 'segmented', options: ['Petrol', 'Electric'], required: true, order: 3 },
      { id: 'f_bike_kmDriven', key: 'kmDriven', label: 'KM driven', type: 'number', placeholder: 'KM driven *', required: true, maxLength: 6, order: 4 },
      { id: 'f_bike_owners', key: 'owners', label: 'No. of Owners', type: 'select', placeholder: 'No. of Owners', options: CAR_OWNER_OPTIONS, required: false, order: 5 }
    ],
    isActive: true
  },
  {
    category: 'Electronics & Appliances',
    subCategory: '',
    title: 'Include some details',
    description: 'Dynamic specifications for Electronics, Laptops, TVs & Home Appliances',
    fields: [
      { id: 'f_elec_type', key: 'applianceType', label: 'Appliance / Device Type', type: 'select', placeholder: 'Appliance / Device Type *', options: ['TVs, Video - Audio', 'Computers & Laptops', 'Cameras & Lenses', 'Fridges & Refrigerators', 'Washing Machines', 'ACs & Coolers', 'Kitchen & Other Appliances', 'Gaming Consoles'], required: true, order: 1 },
      { id: 'f_elec_brand', key: 'brand', label: 'Brand', type: 'select', placeholder: 'Brand *', options: ['Sony', 'LG', 'Samsung', 'Apple', 'Dell', 'HP', 'Lenovo', 'Asus', 'Canon', 'Nikon', 'Whirlpool', 'Voltas', 'Daikin', 'Bose', 'JBL', 'Other'], required: true, order: 2 },
      { id: 'f_elec_model', key: 'model', label: 'Model / Series', type: 'text', placeholder: 'Model / Capacity / Screen Size *', required: true, maxLength: 60, order: 3 },
      { id: 'f_elec_condition', key: 'conditionGrade', label: 'Condition', type: 'segmented', options: ['Brand New', 'Like New', 'Excellent', 'Good'], required: true, order: 4 },
      { id: 'f_elec_warranty', key: 'warranty', label: 'Warranty', type: 'segmented', options: ['Under Warranty', 'Out of Warranty'], required: false, order: 5 },
      { id: 'f_elec_year', key: 'year', label: 'Purchase Year', type: 'number', placeholder: 'Year', required: false, maxLength: 4, minValue: 1990, order: 6 }
    ],
    isActive: true
  },
  {
    category: 'Commercial Vehicles & Spares',
    subCategory: '',
    title: 'Include some details',
    description: 'Dynamic specifications for Commercial Vehicles, Trucks, Autos & Spare Parts',
    fields: [
      { id: 'f_comm_type', key: 'vehicleType', label: 'Vehicle / Spare Type', type: 'select', placeholder: 'Select Type *', options: ['Trucks & Tempos', 'Auto-rickshaws & E-rickshaws', 'Buses & Vans', 'Tractors & Farm Vehicles', 'Heavy Construction Machinery', 'Spare Parts & Accessories'], required: true, order: 1 },
      { id: 'f_comm_brand', key: 'brand', label: 'Brand', type: 'select', placeholder: 'Brand *', options: ['Tata Motors', 'Mahindra', 'Ashok Leyland', 'Eicher', 'BharatBenz', 'Force Motors', 'Piaggio', 'Bajaj', 'Swaraj', 'John Deere', 'Other'], required: true, order: 2 },
      { id: 'f_comm_model', key: 'model', label: 'Model', type: 'text', placeholder: 'e.g. Ace Gold, Bolero Pik-Up, Intra V30 *', required: true, maxLength: 50, order: 3 },
      { id: 'f_comm_year', key: 'year', label: 'Year', type: 'number', placeholder: 'Year *', required: true, maxLength: 4, minValue: 1900, order: 4 },
      { id: 'f_comm_fuel', key: 'fuel', label: 'Fuel', type: 'select', placeholder: 'Fuel *', options: CAR_FUEL_OPTIONS, required: true, order: 5 },
      { id: 'f_comm_kmDriven', key: 'kmDriven', label: 'KM driven', type: 'number', placeholder: 'KM driven *', required: true, maxLength: 6, order: 6 },
      { id: 'f_comm_owners', key: 'owners', label: 'No. of Owners', type: 'select', placeholder: 'No. of Owners', options: CAR_OWNER_OPTIONS, required: false, order: 7 }
    ],
    isActive: true
  },
  {
    category: 'Furniture',
    subCategory: '',
    title: 'Include some details',
    description: 'Dynamic specifications for Sofas, Beds, Dining & Office Furniture',
    fields: [
      { id: 'f_furn_type', key: 'furnitureType', label: 'Furniture Type', type: 'select', placeholder: 'Furniture Type *', options: ['Sofa & Dining', 'Beds & Wardrobes', 'Home Decor & Garden', 'Kids Furniture', 'Office Tables & Chairs', 'Other Household Items'], required: true, order: 1 },
      { id: 'f_furn_material', key: 'material', label: 'Primary Material', type: 'select', placeholder: 'Primary Material *', options: ['Solid Teak / Sheesham Wood', 'Engineered Wood', 'Metal / Wrought Iron', 'Leatherette / Fabric', 'Glass & Marble', 'Cane / Rattan'], required: true, order: 2 },
      { id: 'f_furn_condition', key: 'conditionGrade', label: 'Condition', type: 'segmented', options: ['Brand New', 'Like New', 'Good', 'Gently Used'], required: true, order: 3 },
      { id: 'f_furn_dimensions', key: 'dimensions', label: 'Dimensions (L × W × H)', type: 'text', placeholder: 'e.g. 78 x 36 x 32 inches', required: false, maxLength: 50, order: 4 },
      { id: 'f_furn_assembly', key: 'assembly', label: 'Assembly Status', type: 'segmented', options: ['Pre-Assembled', 'DIY / Knockdown'], required: false, order: 5 }
    ],
    isActive: true
  },
  {
    category: 'Fashion',
    subCategory: '',
    title: 'Include some details',
    description: 'Dynamic specifications for Fashion, Apparel, Footwear & Watches',
    fields: [
      { id: 'f_fash_type', key: 'fashionCategory', label: 'Fashion Category', type: 'select', placeholder: 'Category *', options: ['Men\'s Apparel', 'Women\'s Apparel', 'Footwear & Sneakers', 'Watches & Luxury Accessories', 'Ethnic & Bridal Wear', 'Kids Fashion'], required: true, order: 1 },
      { id: 'f_fash_brand', key: 'brand', label: 'Brand / Designer', type: 'select', placeholder: 'Brand *', options: ['Zara', 'H&M', 'Nike', 'Adidas', 'Levi\'s', 'Manyavar', 'Fabindia', 'Puma', 'Tommy Hilfiger', 'Fossil', 'Casio', 'Designer Boutique', 'Other'], required: true, order: 2 },
      { id: 'f_fash_size', key: 'size', label: 'Size', type: 'segmented', options: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'Free Size'], required: true, order: 3 },
      { id: 'f_fash_condition', key: 'conditionGrade', label: 'Condition', type: 'segmented', options: ['New with Tags', 'Worn Once', 'Like New', 'Good'], required: true, order: 4 },
      { id: 'f_fash_color', key: 'color', label: 'Color / Shade', type: 'text', placeholder: 'e.g. Midnight Black, Royal Blue, Ivory', required: false, maxLength: 40, order: 5 }
    ],
    isActive: true
  },
  {
    category: 'Books, Sports & Hobbies',
    subCategory: '',
    title: 'Include some details',
    description: 'Dynamic specifications for Books, Gym Gear, Musical Instruments & Sports',
    fields: [
      { id: 'f_bsh_type', key: 'itemType', label: 'Category Type', type: 'select', placeholder: 'Select Item Type *', options: ['Books & Competitive Exam Material', 'Gym & Fitness Equipment', 'Musical Instruments', 'Cricket, Football & Sports Gear', 'Cycles & Bicycles', 'Collectibles & Board Games'], required: true, order: 1 },
      { id: 'f_bsh_brand', key: 'brand', label: 'Brand / Author / Publisher', type: 'text', placeholder: 'e.g. Yamaha, Cosco, Yonex, Pearson *', required: true, maxLength: 60, order: 2 },
      { id: 'f_bsh_condition', key: 'conditionGrade', label: 'Condition', type: 'segmented', options: ['Brand New', 'Like New', 'Good', 'Used'], required: true, order: 3 },
      { id: 'f_bsh_age', key: 'usageAge', label: 'Usage Age / Edition', type: 'select', placeholder: 'Select Age', options: ['Unused / New', 'Less than 6 Months', '6 - 12 Months', '1 - 2 Years', '2+ Years'], required: false, order: 4 }
    ],
    isActive: true
  },
  {
    category: 'Pets',
    subCategory: '',
    title: 'Include some details',
    description: 'Dynamic specifications for Pets, Aquariums & Pet Accessories',
    fields: [
      { id: 'f_pet_type', key: 'petType', label: 'Pet / Accessory Type', type: 'select', placeholder: 'Select Type *', options: ['Dogs & Puppies', 'Cats & Kittens', 'Aquarium & Fishes', 'Birds', 'Pet Food, Cages & Accessories'], required: true, order: 1 },
      { id: 'f_pet_breed', key: 'breed', label: 'Breed / Item Name', type: 'text', placeholder: 'e.g. Golden Retriever, Persian Cat, 4ft Glass Aquarium *', required: true, maxLength: 60, order: 2 },
      { id: 'f_pet_age', key: 'age', label: 'Age', type: 'select', placeholder: 'Select Age', options: ['0 - 3 Months', '3 - 6 Months', '6 - 12 Months', '1 - 3 Years', 'Brand New Accessory'], required: false, order: 3 },
      { id: 'f_pet_vaccinated', key: 'vaccination', label: 'Vaccination / Quality Status', type: 'segmented', options: ['Fully Vaccinated', 'Partially Vaccinated', 'N/A (Accessory)'], required: false, order: 4 },
      { id: 'f_pet_certified', key: 'certified', label: 'KCI Registered / Vet Checked', type: 'segmented', options: ['Yes', 'No'], required: false, order: 5 }
    ],
    isActive: true
  },
  {
    category: 'Services',
    subCategory: '',
    title: 'Include some details',
    description: 'Dynamic specifications for Local Home, Repair & Professional Services',
    fields: [
      { id: 'f_srv_type', key: 'serviceType', label: 'Service Category', type: 'select', placeholder: 'Select Service Type *', options: ['Electronics & Appliance Repair', 'Home Deep Cleaning & Pest Control', 'Packers & Movers', 'Plumbing, Electrical & Carpentry', 'Tuition & Academic Coaching', 'Beauty & Salon at Home', 'Web, IT & Digital Marketing', 'Event Photography & Catering'], required: true, order: 1 },
      { id: 'f_srv_provider', key: 'providerBrand', label: 'Business / Provider Name', type: 'text', placeholder: 'e.g. Apex Home Services, Rapid Tech Care *', required: true, maxLength: 60, order: 2 },
      { id: 'f_srv_mode', key: 'serviceMode', label: 'Service Delivery Mode', type: 'segmented', options: ['Doorstep / On-Site', 'In-Studio / Shop', 'Online / Remote'], required: true, order: 3 },
      { id: 'f_srv_exp', key: 'experience', label: 'Experience', type: 'select', placeholder: 'Years of Experience', options: ['1 - 2 Years', '3 - 5 Years', '5 - 10 Years', '10+ Years Certified'], required: false, order: 4 },
      { id: 'f_srv_warranty', key: 'warranty', label: 'Service Guarantee', type: 'segmented', options: ['30 Days Warranty', '7 Days Warranty', 'Standard'], required: false, order: 5 }
    ],
    isActive: true
  },
  {
    category: 'Jobs',
    subCategory: '',
    title: 'Include some details',
    description: 'Dynamic specifications for Full-Time, Part-Time, Remote & Local Job Openings',
    fields: [
      { id: 'f_job_role', key: 'jobRole', label: 'Job Category / Role', type: 'select', placeholder: 'Select Job Role *', options: ['Data Entry & Back Office', 'Sales & Marketing', 'BPO & Telecaller', 'Driver & Delivery', 'Office Assistant', 'Teacher & Trainer', 'Cook & Hospitality', 'Receptionist & Front Office', 'IT Engineer & Developer', 'Accountant', 'Other Jobs'], required: true, order: 1 },
      { id: 'f_job_company', key: 'companyName', label: 'Company / Employer Name', type: 'text', placeholder: 'e.g. TechNova Solutions, Reliance Retail *', required: true, maxLength: 60, order: 2 },
      { id: 'f_job_type', key: 'positionType', label: 'Position Type', type: 'segmented', options: ['Full-time', 'Part-time', 'Contract', 'Work From Home'], required: true, order: 3 },
      { id: 'f_job_period', key: 'salaryPeriod', label: 'Salary Period', type: 'segmented', options: ['Monthly', 'Weekly', 'Hourly', 'Yearly'], required: true, order: 4 },
      { id: 'f_job_exp', key: 'experienceRequired', label: 'Experience Required', type: 'select', placeholder: 'Select Experience', options: ['Fresher (0 - 1 Year)', '1 - 3 Years', '3 - 5 Years', '5+ Years'], required: false, order: 5 }
    ],
    isActive: true
  }
];

const isDbConnected = () => mongoose.connection.readyState === 1;

export async function ensureAllCategoryFormsSeeded() {
  if (!isDbConnected()) return false;
  try {
    for (let idx = 0; idx < DEFAULT_SELLER_FORM_TEMPLATES.length; idx++) {
      const tpl = DEFAULT_SELLER_FORM_TEMPLATES[idx];
      let catDoc = null;
      try {
        catDoc = await ProductCategory.findOne({
          name: new RegExp(`^${tpl.category.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i')
        }).lean();
        if (!catDoc) {
          catDoc = await ProductCategory.findOneAndUpdate(
            { name: new RegExp(`^${tpl.category.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') },
            {
              $setOnInsert: {
                name: tpl.category,
                title: tpl.category,
                slug: tpl.category.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
                isActive: true,
                sortOrder: idx + 1
              }
            },
            { upsert: true, new: true }
          ).lean();
        }
      } catch {}

      const escapedCat = tpl.category.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const existing = await SellerForm.findOne({ category: new RegExp(`^${escapedCat}$`, 'i') }).lean();
      if (!existing) {
        await SellerForm.findOneAndUpdate(
          { category: new RegExp(`^${escapedCat}$`, 'i') },
          {
            $set: {
              ...tpl,
              categoryId: catDoc ? catDoc._id : null
            }
          },
          { upsert: true, returnDocument: 'after' }
        );
      } else if (
        ['cars', 'bikes', 'mobiles'].includes(tpl.category.toLowerCase()) &&
        !(existing.fields || []).some((f) => f.type === 'brand_model_variant')
      ) {
        await SellerForm.findOneAndUpdate(
          { _id: existing._id },
          {
            $set: {
              title: tpl.title,
              description: tpl.description,
              fields: tpl.fields,
              categoryId: existing.categoryId || (catDoc ? catDoc._id : null)
            }
          },
          { returnDocument: 'after' }
        );
      }
    }
    return true;
  } catch {
    return false;
  }
}

/**
 * GET /api/v1/seller-forms
 * Returns all active seller form configurations strictly from MongoDB.
 * Returns empty / 503 if there is no active database connection.
 */
export const getAllSellerForms = async (req, res) => {
  if (!isDbConnected()) {
    return res.status(503).json({
      success: false,
      dbConnected: false,
      count: 0,
      data: [],
      message: 'Database connection is unavailable. Seller forms cannot be loaded without an active DB connection.'
    });
  }

  try {
    await ensureAllCategoryFormsSeeded();
    const forms = await SellerForm.find({ isActive: { $ne: false } }).sort({ category: 1 }).lean();

    return res.status(200).json({
      success: true,
      dbConnected: true,
      count: forms.length,
      data: forms
    });
  } catch (error) {
    return res.status(503).json({
      success: false,
      dbConnected: false,
      count: 0,
      data: [],
      message: 'Failed to query Seller Forms from database',
      error: error.message
    });
  }
};

/**
 * GET /api/v1/seller-forms/find?category=...
 * Finds the specific form schema for category strictly from MongoDB.
 */
export const getSellerFormByCategory = async (req, res) => {
  if (!isDbConnected()) {
    return res.status(503).json({
      success: false,
      dbConnected: false,
      data: null,
      message: 'Database connection is unavailable'
    });
  }

  try {
    const category = (req.query.category || '').trim();

    if (!category) {
      return res.status(400).json({ success: false, message: 'Category parameter is required' });
    }

    await ensureAllCategoryFormsSeeded();

    const escaped = category.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const form = await SellerForm.findOne({
      category: new RegExp(`^${escaped}$`, 'i')
    }).lean();

    if (!form) {
      return res.status(200).json({
        success: true,
        dbConnected: true,
        data: null,
        message: 'No seller form configured in database for this category'
      });
    }

    return res.status(200).json({
      success: true,
      dbConnected: true,
      data: form
    });
  } catch (error) {
    return res.status(503).json({
      success: false,
      dbConnected: false,
      data: null,
      message: 'Failed to retrieve seller form schema from database',
      error: error.message
    });
  }
};

/**
 * POST /api/v1/seller-forms
 * Upserts a seller form schema (creates or updates by category)
 */
export const upsertSellerForm = async (req, res) => {
  if (!isDbConnected()) {
    return res.status(503).json({
      success: false,
      dbConnected: false,
      message: 'Database connection is unavailable. Cannot save seller form.'
    });
  }

  try {
    const {
      category,
      categoryId = null,
      title = '',
      description = '',
      fields = [],
      isActive = true
    } = req.body;

    if (!category || !category.trim()) {
      return res.status(400).json({ success: false, message: 'Category is required' });
    }

    const trimmedCat = category.trim();
    const escapedCat = trimmedCat.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    const sanitizedFields = (Array.isArray(fields) ? fields : []).map((f, idx) => ({
      id: f.id || `f_${Date.now()}_${idx}`,
      key: (f.key || f.label || `field_${idx}`).replace(/[^a-zA-Z0-9_]/g, ''),
      label: (f.label || 'Field').trim(),
      type: ['text', 'number', 'segmented', 'select', 'textarea', 'brand_model_variant'].includes(f.type) ? f.type : 'text',
      placeholder: f.placeholder || '',
      required: Boolean(f.required),
      maxLength: f.maxLength ? Number(f.maxLength) : null,
      minValue: f.minValue ? Number(f.minValue) : null,
      options: Array.isArray(f.options) ? f.options.filter(Boolean) : [],
      helperText: f.helperText || '',
      order: f.order !== undefined ? Number(f.order) : idx + 1
    }));

    const updated = await SellerForm.findOneAndUpdate(
      {
        category: new RegExp(`^${escapedCat}$`, 'i')
      },
      {
        $set: {
          category: trimmedCat,
          subCategory: '',
          categoryId,
          title: title || 'Include some details',
          description,
          fields: sanitizedFields,
          isActive: isActive !== undefined ? Boolean(isActive) : true
        }
      },
      { upsert: true, new: true, runValidators: true }
    );

    return res.status(200).json({
      success: true,
      dbConnected: true,
      message: 'Seller form saved successfully to database',
      data: updated
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to save seller form',
      error: error.message
    });
  }
};

/**
 * DELETE /api/v1/seller-forms/:id
 * Deletes a seller form schema
 */
export const deleteSellerForm = async (req, res) => {
  if (!isDbConnected()) {
    return res.status(503).json({
      success: false,
      dbConnected: false,
      message: 'Database connection is unavailable. Cannot delete seller form.'
    });
  }

  try {
    const { id } = req.params;
    await SellerForm.findByIdAndDelete(id);
    return res.status(200).json({
      success: true,
      dbConnected: true,
      message: 'Seller form deleted'
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to delete seller form',
      error: error.message
    });
  }
};
