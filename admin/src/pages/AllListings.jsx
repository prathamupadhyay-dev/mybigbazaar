import React, { useState, useEffect, useMemo, useRef } from 'react';
import BulkActionBar from '../components/common/BulkActionBar';
import ExportButton from '../components/common/ExportButton';
import StatusPill from '../components/common/StatusPill';
import { apiFetch, getAdminUser } from '../utils/api';
import { getAssetUrl, DEFAULT_PRODUCT_PLACEHOLDER } from '../config';
import {
  ALL_CATEGORY_SELLER_FORMS,
  getCascadingCatalogForCategory,
  generateCategorySuggestion
} from '../utils/carCatalogData';
import {
  Plus,
  Search,
  LayoutGrid,
  List,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  MapPin,
  Eye,
  Trash2,
  Star,
  ShieldAlert,
  ChevronRight,
  Camera,
  Tag,
  UserCheck,
  SlidersHorizontal,
  X,
  RefreshCw,
  Layers,
  Car,
  Building2,
  Smartphone,
  Bike,
  Tv,
  Truck,
  Sofa,
  Shirt,
  BookOpen,
  PawPrint,
  Wrench,
  Briefcase
} from 'lucide-react';

// Zero dummy products — all listings are fetched dynamically from the live backend
export const INITIAL_ALL_LISTINGS = [];

const MAC_FONT = "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', 'Inter', system-ui, sans-serif";

const STANDARD_11_CATEGORIES = [
  'Cars',
  'Properties',
  'Mobiles',
  'Bikes',
  'Electronics & Appliances',
  'Commercial Vehicles & Spares',
  'Furniture',
  'Fashion',
  'Books, Sports & Hobbies',
  'Pets',
  'Services'
];

const CATEGORY_BADGE_META = {
  cars: { icon: Car, color: '#FF3B30', tint: 'rgba(255, 59, 48, 0.12)' },
  properties: { icon: Building2, color: '#007AFF', tint: 'rgba(0, 122, 255, 0.12)' },
  mobiles: { icon: Smartphone, color: '#34C759', tint: 'rgba(52, 199, 89, 0.12)' },
  bikes: { icon: Bike, color: '#FF2D55', tint: 'rgba(255, 45, 85, 0.12)' },
  'electronics & appliances': { icon: Tv, color: '#AF52DE', tint: 'rgba(175, 82, 222, 0.12)' },
  'commercial vehicles & spares': { icon: Truck, color: '#FF9500', tint: 'rgba(255, 149, 0, 0.12)' },
  furniture: { icon: Sofa, color: '#30B0C7', tint: 'rgba(48, 176, 199, 0.12)' },
  fashion: { icon: Shirt, color: '#E03E8C', tint: 'rgba(224, 62, 140, 0.12)' },
  'books, sports & hobbies': { icon: BookOpen, color: '#5856D6', tint: 'rgba(88, 86, 214, 0.12)' },
  pets: { icon: PawPrint, color: '#A2845E', tint: 'rgba(162, 132, 94, 0.14)' },
  services: { icon: Wrench, color: '#00C7BE', tint: 'rgba(0, 199, 190, 0.12)' },
  jobs: { icon: Briefcase, color: '#0A84FF', tint: 'rgba(10, 132, 255, 0.12)' }
};

function renderCategoryThumb(catName, categoriesList = [], size = 18, active = false) {
  const cleanName = (catName || '').toLowerCase().trim();
  const matchedCat = categoriesList.find(
    (c) => (c.name || c.title || '').toLowerCase().trim() === cleanName
  );
  const rawImg =
    matchedCat?.image ||
    (Array.isArray(matchedCat?.images) && matchedCat.images[0]) ||
    matchedCat?.iconUrl ||
    '';

  if (rawImg && (rawImg.startsWith('http') || rawImg.startsWith('/') || rawImg.startsWith('data:'))) {
    return (
      <img
        src={getAssetUrl(rawImg)}
        alt={catName}
        onError={(e) => {
          e.currentTarget.style.display = 'none';
        }}
        style={{
          width: `${size}px`,
          height: `${size}px`,
          borderRadius: '4px',
          objectFit: 'cover',
          flexShrink: 0
        }}
      />
    );
  }

  const meta = CATEGORY_BADGE_META[cleanName] || { icon: Tag, color: '#007AFF' };
  const IconComp = meta.icon || Tag;
  return (
    <IconComp
      size={Math.max(13, size - 3)}
      color={active ? '#FFFFFF' : meta.color}
      style={{ flexShrink: 0 }}
    />
  );
}

const POPULAR_LOCATIONS = [
  { address: 'Vijay Nagar', city: 'Indore', state: 'Madhya Pradesh' },
  { address: 'Palasia', city: 'Indore', state: 'Madhya Pradesh' },
  { address: 'Bhawarkua', city: 'Indore', state: 'Madhya Pradesh' },
  { address: 'Super Corridor', city: 'Indore', state: 'Madhya Pradesh' },
  { address: 'MP Nagar', city: 'Bhopal', state: 'Madhya Pradesh' },
  { address: 'Andheri West', city: 'Mumbai', state: 'Maharashtra' },
  { address: 'Koramangala', city: 'Bengaluru', state: 'Karnataka' },
  { address: 'Connaught Place', city: 'New Delhi', state: 'Delhi' }
];

function formatDynamicSubtitle(attributes = {}, category = '') {
  if (!attributes || typeof attributes !== 'object') return '';
  const cat = (category || '').toLowerCase();
  if (cat.includes('car') || cat.includes('bike') || cat.includes('commercial')) {
    const parts = [
      attributes.year,
      attributes.kmDriven ? `${Number(attributes.kmDriven).toLocaleString('en-IN')} km` : null,
      attributes.fuel,
      attributes.transmission
    ].filter(Boolean);
    if (parts.length > 0) return parts.join(' • ');
  }
  if (cat.includes('prop')) {
    const parts = [
      attributes.bhk ? `${attributes.bhk} BHK` : attributes.propertyType,
      attributes.superBuiltupArea ? `${attributes.superBuiltupArea} sqft` : null,
      attributes.furnishing
    ].filter(Boolean);
    if (parts.length > 0) return parts.join(' • ');
  }
  if (cat.includes('mob')) {
    const parts = [attributes.brandName || attributes.brand, attributes.ram, attributes.warranty].filter(Boolean);
    if (parts.length > 0) return parts.join(' • ');
  }
  const generic = Object.entries(attributes)
    .filter(([k, v]) => v && !['brandName', 'model', 'variant'].includes(k))
    .slice(0, 3)
    .map(([, v]) => String(v));
  return generic.join(' • ');
}

export default function AllListings() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'
  const [statusFilter, setStatusFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Reference Data: Categories, Subcategories, Taxes, Users, Seller Forms
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [taxes, setTaxes] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [sellerFormsMap, setSellerFormsMap] = useState({});

  // Resolve Default Logged-in User
  const loggedInUser = useMemo(() => {
    const raw = getAdminUser() || {};
    let storedUser = {};
    try {
      storedUser = JSON.parse(localStorage.getItem('admin_user') || '{}');
    } catch {}
    const id = raw._id || raw.id || storedUser._id || storedUser.id || localStorage.getItem('adminId') || 'admin-default';
    const name = raw.fullName || raw.name || storedUser.fullName || storedUser.name || localStorage.getItem('adminName') || 'Pratham Upadhyay';
    const email = raw.email || storedUser.email || localStorage.getItem('adminEmail') || 'admin@mybigbazaar.com';
    const phone = raw.phoneNumber || raw.phone || storedUser.phoneNumber || '+919131919112';
    const avatar = raw.profileImage || raw.avatar || storedUser.profileImage || storedUser.avatar || '';
    return {
      id,
      name,
      email,
      phone,
      avatar,
      role: 'Admin (Logged-in User)',
      isCurrentLoginUser: true
    };
  }, []);

  // 6-Step Create Listing Wizard State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createStep, setCreateStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createError, setCreateError] = useState(null);
  const [userSearchTerm] = useState('');

  // Cascading Brand -> Model -> Variant Modal State
  const [bmvModalOpen, setBmvModalOpen] = useState(false);
  const [bmvStep, setBmvStep] = useState('brand');
  const [bmvSearch, setBmvSearch] = useState('');
  const [tempBrandObj, setTempBrandObj] = useState(null);
  const [tempModelObj, setTempModelObj] = useState(null);

  // Select Option Dialog Modal State
  const [selectDialogField, setSelectDialogField] = useState(null);

  // Rephrase / Write for me counter
  const [rephraseIndex, setRephraseIndex] = useState(0);
  const [hasGeneratedSuggestion, setHasGeneratedSuggestion] = useState(false);

  // Review details profile picture preview
  const [sellerAvatarPreview, setSellerAvatarPreview] = useState('');
  const avatarFileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    productCategorysId: '',
    categoryName: 'Cars',
    subCategoryId: '',
    subCategoryName: '',
    selectedUserId: '',
    selectedUserName: '',
    selectedUserPhone: '+919131919112',
    productName: '',
    productDescription: '',
    productPrice: '',
    productDiscountPrice: '',
    condition: 'Excellent',
    address: 'Vijay Nagar',
    city: 'Indore',
    state: 'Madhya Pradesh',
    pincode: '',
    taxId: '',
    status: 'active'
  });

  // Dynamic category attributes filled in Step 2
  const [categoryAttributes, setCategoryAttributes] = useState({});

  // Multiple Images state in Step 3
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [extraImageUrls, setExtraImageUrls] = useState([]);
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const fileInputRef = useRef(null);

  // Inspect & Delete Modals
  const [selectedListing, setSelectedListing] = useState(null);
  const [deleteCandidate, setDeleteCandidate] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      selectedUserId: prev.selectedUserId || loggedInUser.id,
      selectedUserName: prev.selectedUserName || loggedInUser.name,
      selectedUserPhone: prev.selectedUserPhone || loggedInUser.phone || '+919131919112'
    }));
    if (loggedInUser.avatar) {
      setSellerAvatarPreview(loggedInUser.avatar);
    }
  }, [loggedInUser]);

  // Normalize backend product data
  const normalizeProduct = (p, catMap = {}) => {
    const rawCatId = Array.isArray(p.productCategorysId) ? p.productCategorysId[0] : (p.categoryId || p.productCategorysId);
    const catName =
      p.category ||
      catMap[rawCatId] ||
      (typeof rawCatId === 'object' ? (rawCatId?.name || rawCatId?.title) : null) ||
      'Cars';

    let imgUrl = DEFAULT_PRODUCT_PLACEHOLDER;
    if (Array.isArray(p.images) && p.images.length > 0 && p.images[0]) {
      imgUrl = getAssetUrl(p.images[0]);
    } else if (p.image) {
      imgUrl = getAssetUrl(p.image);
    }

    const numericPriceVal = Number(p.productPrice ?? p.price ?? 0);
    const sellerLabel =
      p.sellerName ||
      (typeof p.sellerId === 'object' && p.sellerId !== null
        ? (p.sellerId.fullName || p.sellerId.name || p.sellerId.email)
        : null) ||
      (typeof p.authId === 'object' && p.authId !== null
        ? (p.authId.fullName || p.authId.name || p.authId.email)
        : null) ||
      p.seller ||
      'Verified Seller';

    let parsedAttrs = p.attributes || {};
    if (typeof parsedAttrs === 'string') {
      try {
        parsedAttrs = JSON.parse(parsedAttrs);
      } catch {
        parsedAttrs = {};
      }
    }

    return {
      id: p._id || p.id || `prod-${Date.now()}`,
      title: p.productName || p.title || 'Untitled Listing',
      description: p.productDescription || p.description || '',
      price: `₹${numericPriceVal.toLocaleString('en-IN')}`,
      numericPrice: numericPriceVal,
      discountPrice: p.productDiscountPrice
        ? `₹${Number(p.productDiscountPrice).toLocaleString('en-IN')}`
        : null,
      seller: sellerLabel,
      sellerPhone: p.sellerPhone || '+91 9876543210',
      location:
        typeof p.location === 'object' && p.location !== null
          ? ([p.location.address, p.location.city, p.location.state].filter(Boolean).join(', ') || p.location.city || 'Indore')
          : (p.location || [p.address, p.city, p.state].filter(Boolean).join(', ') || 'Indore, MP'),
      category: catName,
      subCategory: p.subcategory || p.subCategory || '',
      condition: p.condition || 'Excellent',
      attributes: parsedAttrs,
      subtitleSummary: formatDynamicSubtitle(parsedAttrs, catName),
      status:
        p.status === 'active' || p.status === 'Live' || p.status === 'live'
          ? 'Live'
          : p.status === 'suspended' || p.status === 'Suspended'
            ? 'Suspended'
            : 'Live',
      isFeatured: Boolean(p.isFeatured),
      views: p.views || 0,
      dateAdded: p.createdAt ? new Date(p.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Today',
      createdAt: p.createdAt || new Date().toISOString(),
      image: imgUrl,
      allImages: Array.isArray(p.images) && p.images.length > 0 ? p.images.map(getAssetUrl) : [imgUrl],
      rawProduct: p
    };
  };

  const loadAllCatalogData = async () => {
    setLoading(true);
    let catMap = {};
    try {
      const [catRes, subRes] = await Promise.all([
        apiFetch('/product-category/get-all').catch(() => null),
        apiFetch('/product-sub-category/get-all').catch(() => null)
      ]);

      if (catRes && catRes.ok) {
        const catJson = await catRes.json().catch(() => ({}));
        const rawCats = Array.isArray(catJson.data) ? catJson.data : (Array.isArray(catJson) ? catJson : []);
        const activeCats = rawCats.filter((c) => c.isActive !== false && c.status !== 'Inactive');
        let listToUse = activeCats.length > 0 ? activeCats : rawCats;

        // Ensure all 11 standard categories are represented
        STANDARD_11_CATEGORIES.forEach((stdName) => {
          const exists = listToUse.some((c) => (c.name || c.title || '').toLowerCase() === stdName.toLowerCase());
          if (!exists) {
            listToUse.push({ _id: `cat-${stdName.toLowerCase().replace(/[^a-z0-9]/g, '-')}`, name: stdName, isActive: true });
          }
        });

        setCategories(listToUse);
        listToUse.forEach((c) => {
          if (c._id) catMap[c._id] = c.name || c.title;
        });
        if (listToUse.length > 0) {
          const carsCat = listToUse.find((c) => (c.name || c.title || '').toLowerCase() === 'cars') || listToUse[0];
          setFormData((prev) => ({
            ...prev,
            productCategorysId: prev.productCategorysId || carsCat._id || carsCat.id,
            categoryName: prev.categoryName || carsCat.name || carsCat.title || 'Cars'
          }));
        }
      } else {
        setCategories(
          STANDARD_11_CATEGORIES.map((name) => ({
            _id: `cat-${name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
            name
          }))
        );
      }

      if (subRes && subRes.ok) {
        const subJson = await subRes.json().catch(() => ({}));
        const rawSubs = Array.isArray(subJson.data) ? subJson.data : (Array.isArray(subJson) ? subJson : []);
        setSubcategories(rawSubs.filter((s) => s.isActive !== false));
      }
    } catch {}

    // Load Seller Forms strictly from Backend DB
    try {
      const formsMap = {};
      const sfRes = await apiFetch('/seller-forms').catch(() => null);
      if (sfRes && sfRes.ok) {
        const sfJson = await sfRes.json().catch(() => ({}));
        const sfList = Array.isArray(sfJson.data) ? sfJson.data : (Array.isArray(sfJson) ? sfJson : []);
        sfList.forEach((formDoc) => {
          if (formDoc.category && Array.isArray(formDoc.fields)) {
            const key = formDoc.category.toLowerCase().trim();
            formsMap[key] = formDoc;
          }
        });
      }
      setSellerFormsMap(formsMap);
    } catch {
      setSellerFormsMap({});
    }

    // Load Users for Seller Selection
    try {
      let uRes = await apiFetch('/api/v1/admin/users?limit=200').catch(() => null);
      if (!uRes || !uRes.ok) {
        uRes = await apiFetch('/auth/get-all-users').catch(() => null);
      }
      if (uRes && uRes.ok) {
        const uJson = await uRes.json().catch(() => ({}));
        const rawUsers = Array.isArray(uJson) ? uJson : (uJson.data || uJson.users || []);
        const mappedUsers = rawUsers.map((u) => ({
          id: u._id || u.id,
          name: u.fullName || u.name || 'Platform User',
          email: u.email || '',
          phone: u.phoneNumber || u.mobileNumber || u.phone || '+919131919112',
          avatar: u.profileImage || u.avatarUrl || u.avatar || '',
          role: u.role === 'admin' ? 'Admin' : 'User'
        }));
        setUsersList(mappedUsers);
      }
    } catch {}

    // Load Taxes
    try {
      const taxRes = await apiFetch('/tax/get-all').catch(() => null);
      if (taxRes && taxRes.ok) {
        const taxJson = await taxRes.json().catch(() => ({}));
        const rawTaxes = Array.isArray(taxJson.taxes) ? taxJson.taxes : (Array.isArray(taxJson.data) ? taxJson.data : []);
        if (rawTaxes.length > 0) {
          setTaxes(rawTaxes);
          setFormData((prev) => ({ ...prev, taxId: prev.taxId || rawTaxes[0]._id || rawTaxes[0].id }));
        }
      }
    } catch {}

    // Load Live Products (Zero dummy fallback)
    try {
      const res = await apiFetch('/product/get-all');
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText || 'Unable to fetch marketplace catalog'}`);
      }
      const json = await res.json().catch(() => ({}));
      const rawProducts = Array.isArray(json.products)
        ? json.products
        : Array.isArray(json.data)
          ? json.data
          : Array.isArray(json)
            ? json
            : [];
      setListings(rawProducts.map((item) => normalizeProduct(item, catMap)));
      setLoadError(null);
    } catch (err) {
      setLoadError(String(err?.message || 'Failed to load live marketplace catalog'));
      setListings([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllCatalogData();
  }, []);

  const allSelectableUsers = useMemo(() => {
    const defaultOption = {
      id: loggedInUser.id,
      name: loggedInUser.name,
      email: loggedInUser.email,
      phone: loggedInUser.phone || '+919131919112',
      avatar: loggedInUser.avatar || '',
      role: 'Logged-in Admin (Default)',
      isDefault: true
    };
    const others = usersList.filter(
      (u) =>
        String(u.id) !== String(loggedInUser.id) &&
        (!loggedInUser.email || (u.email || '').toLowerCase() !== loggedInUser.email.toLowerCase())
    );
    const combined = [defaultOption, ...others];
    if (!userSearchTerm.trim()) return combined;
    const q = userSearchTerm.toLowerCase();
    return combined.filter(
      (u) =>
        (u.name || '').toLowerCase().includes(q) ||
        (u.email || '').toLowerCase().includes(q) ||
        (u.phone || '').toLowerCase().includes(q)
    );
  }, [loggedInUser, usersList, userSearchTerm]);

  const selectedCategoryObj = useMemo(() => {
    return categories.find((c) => String(c._id || c.id) === String(formData.productCategorysId)) || null;
  }, [categories, formData.productCategorysId]);

  const resolvedCategoryName = selectedCategoryObj?.name || selectedCategoryObj?.title || formData.categoryName || 'Cars';

  // Resolve Seller Form Schema strictly from Backend DB
  const activeCategoryFormSchema = useMemo(() => {
    const catKey = resolvedCategoryName.toLowerCase().trim();
    if (sellerFormsMap[catKey] && Array.isArray(sellerFormsMap[catKey].fields)) {
      return sellerFormsMap[catKey];
    }
    return { category: resolvedCategoryName, title: 'Include some details', fields: [] };
  }, [resolvedCategoryName, sellerFormsMap]);

  // Cascading catalog for the currently selected category (Cars, Bikes, Mobiles)
  const activeCascadingCatalog = useMemo(() => {
    return getCascadingCatalogForCategory(resolvedCategoryName);
  }, [resolvedCategoryName]);

  const handleOpenCreateModal = (preselectedCatName = null) => {
    setCreateError(null);
    const targetCatName = preselectedCatName && preselectedCatName !== 'All' ? preselectedCatName : 'Cars';
    const matchedCat =
      categories.find((c) => (c.name || c.title || '').toLowerCase() === targetCatName.toLowerCase()) ||
      categories[0];

    setFormData({
      productCategorysId: matchedCat ? (matchedCat._id || matchedCat.id) : 'cat-cars',
      categoryName: matchedCat ? (matchedCat.name || matchedCat.title) : targetCatName,
      subCategoryId: '',
      subCategoryName: '',
      selectedUserId: loggedInUser.id,
      selectedUserName: loggedInUser.name,
      selectedUserPhone: loggedInUser.phone || '+919131919112',
      productName: '',
      productDescription: '',
      productPrice: '',
      productDiscountPrice: '',
      condition: 'Excellent',
      address: 'Vijay Nagar',
      city: 'Indore',
      state: 'Madhya Pradesh',
      pincode: '',
      taxId: taxes[0] ? (taxes[0]._id || taxes[0].id) : '',
      status: 'active'
    });
    setCategoryAttributes({});
    setSelectedFiles([]);
    setExtraImageUrls([]);
    setImageUrlInput('');
    setRephraseIndex(0);
    setHasGeneratedSuggestion(false);
    setSellerAvatarPreview(loggedInUser.avatar || '');
    setCreateStep(preselectedCatName && preselectedCatName !== 'All' ? 2 : 1);
    setShowCreateModal(true);
  };

  // Cascading Brand -> Model -> Variant Handlers
  const openBrandModelVariantSelector = () => {
    setBmvSearch('');
    setBmvStep('brand');
    setTempBrandObj(null);
    setTempModelObj(null);
    setBmvModalOpen(true);
  };

  const handleSelectBrand = (brandObj) => {
    setTempBrandObj(brandObj);
    setBmvSearch('');
    setBmvStep('model');
  };

  const handleSelectModel = (modelObj) => {
    setTempModelObj(modelObj);
    setBmvSearch('');
    setBmvStep('variant');
  };

  const handleSelectVariant = (variantName) => {
    const brandName = tempBrandObj?.brand || '';
    const modelName = tempModelObj?.model || '';
    const combinedDisplay = `${brandName} / ${modelName} / ${variantName}`;
    setCategoryAttributes((prev) => ({
      ...prev,
      brand: combinedDisplay,
      brandName,
      model: modelName,
      variant: variantName,
      brandModelVariant: combinedDisplay
    }));
    setBmvModalOpen(false);
    setCreateError(null);
  };

  // Write for me / Rephrase for ALL 11 Categories
  const handleWriteForMe = () => {
    const suggestion = generateCategorySuggestion(resolvedCategoryName, categoryAttributes, rephraseIndex);
    setFormData((prev) => ({
      ...prev,
      productName: suggestion.title,
      productDescription: suggestion.description
    }));
    setRephraseIndex((prev) => prev + 1);
    setHasGeneratedSuggestion(true);
    setCreateError(null);
  };

  // Step Validations
  const handleNextFromStep1 = () => {
    setCreateError(null);
    if (!formData.productCategorysId && !formData.categoryName) {
      setCreateError('Please select a category first.');
      return;
    }
    setCreateStep(2);
  };

  const handleNextFromStep2 = () => {
    setCreateError(null);
    const fields = activeCategoryFormSchema?.fields || [];
    for (const field of fields) {
      const val = categoryAttributes[field.key];
      if (field.required) {
        if (val === undefined || val === null || String(val).trim() === '') {
          setCreateError(`Please fill in "${field.label}" * before continuing.`);
          return;
        }
      }
      if (field.minValue && val !== undefined && String(val).trim() !== '') {
        const numVal = Number(val);
        if (isNaN(numVal) || numVal < Number(field.minValue)) {
          setCreateError(`${field.label} has a minimum value of ${field.minValue}.`);
          return;
        }
      }
    }
    if (!formData.productName.trim()) {
      setCreateError('Please enter Ad title* (or click "Write for me").');
      return;
    }
    if (!formData.productDescription.trim()) {
      setCreateError('Please enter "Describe what you are selling *" (or click "Write for me").');
      return;
    }
    setCreateStep(3);
  };

  const handleNextFromStep3 = () => {
    setCreateError(null);
    if (selectedFiles.length === 0 && extraImageUrls.length === 0) {
      setCreateError('Please upload or add at least 1 photo before proceeding to Price.');
      return;
    }
    setCreateStep(4);
  };

  const handleNextFromStep4 = () => {
    setCreateError(null);
    const cleanPrice = Number(String(formData.productPrice).replace(/[^0-9.]/g, ''));
    if (!cleanPrice || cleanPrice <= 0) {
      setCreateError('Please enter a valid Price (₹).');
      return;
    }
    setCreateStep(5);
  };

  const handleNextFromStep5 = () => {
    setCreateError(null);
    if (!formData.city.trim()) {
      setCreateError('Please enter or select your City.');
      return;
    }
    if (!formData.state.trim()) {
      setCreateError('Please enter or select your State.');
      return;
    }
    setCreateStep(6);
  };

  // Multi-photo upload handlers
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    if (selectedFiles.length + extraImageUrls.length + files.length > 20) {
      setCreateError('Maximum 20 photos allowed per listing.');
      return;
    }
    setSelectedFiles((prev) => [...prev, ...files].slice(0, 20));
    setCreateError(null);
    if (e.target) e.target.value = '';
  };

  const handleDropFiles = (e) => {
    e.preventDefault();
    setIsDraggingOver(false);
    const files = Array.from(e.dataTransfer?.files || []).filter((f) => f.type.startsWith('image/'));
    if (files.length === 0) return;
    setSelectedFiles((prev) => [...prev, ...files].slice(0, 20));
    setCreateError(null);
  };

  const handleRemoveFile = (index) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleMakeCoverFile = (index) => {
    if (index <= 0) return;
    setSelectedFiles((prev) => {
      const copy = [...prev];
      const [chosen] = copy.splice(index, 1);
      return [chosen, ...copy];
    });
  };

  const handleAddImageUrl = () => {
    const trimmed = imageUrlInput.trim();
    if (!trimmed) return;
    if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
      setCreateError('Please enter a valid http:// or https:// image URL.');
      return;
    }
    setExtraImageUrls((prev) => [...prev, trimmed]);
    setImageUrlInput('');
    setCreateError(null);
  };

  const handleRemoveImageUrl = (idx) => {
    setExtraImageUrls((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleAvatarFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSellerAvatarPreview(URL.createObjectURL(file));
  };

  // Final Submit on Step 6 ("Post now")
  const handleCreateProduct = async (e) => {
    if (e) e.preventDefault();
    setCreateError(null);

    if (!formData.selectedUserName.trim()) {
      setCreateError('Please enter the account name in Review your details.');
      return;
    }

    setIsSubmitting(true);
    try {
      const body = new FormData();
      body.append('productName', formData.productName.trim());
      body.append('title', formData.productName.trim());
      body.append('productDescription', formData.productDescription.trim());
      body.append('description', formData.productDescription.trim());
      body.append('productPrice', String(formData.productPrice));
      body.append('price', String(formData.productPrice));
      body.append('productDiscountPrice', String(formData.productDiscountPrice || formData.productPrice));
      body.append('condition', formData.condition || 'Excellent');
      body.append('address', formData.address || '');
      body.append('city', formData.city || 'Indore');
      body.append('state', formData.state || 'Madhya Pradesh');
      if (formData.pincode) body.append('pincode', formData.pincode);
      if (formData.taxId) body.append('taxId', formData.taxId);

      body.append('authId', formData.selectedUserId || loggedInUser.id);
      body.append('sellerId', formData.selectedUserId || loggedInUser.id);
      body.append('sellerName', formData.selectedUserName || loggedInUser.name);
      if (formData.selectedUserPhone) {
        body.append('sellerPhone', formData.selectedUserPhone);
      }
      body.append('status', formData.status || 'active');

      if (formData.productCategorysId && !String(formData.productCategorysId).startsWith('cat-')) {
        body.append('productCategorysId[]', formData.productCategorysId);
        body.append('categoryId', formData.productCategorysId);
      }
      body.append('category', resolvedCategoryName);
      body.append('attributes', JSON.stringify(categoryAttributes));

      selectedFiles.forEach((file) => {
        body.append('images', file);
      });
      if (extraImageUrls.length > 0) {
        body.append('imageUrls', JSON.stringify(extraImageUrls));
      }

      const res = await apiFetch('/product/create', {
        method: 'POST',
        body,
        timeout: 120000
      });

      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(json.message || `Failed to create listing (HTTP ${res.status})`);
      }

      const catMap = { [formData.productCategorysId]: resolvedCategoryName };
      const localPreviewUrls = [
        ...selectedFiles.map((f) => URL.createObjectURL(f)),
        ...extraImageUrls
      ];

      const createdProduct = json.data || json.product || {
        _id: json._id || `prod-${Date.now()}`,
        productName: formData.productName,
        productDescription: formData.productDescription,
        productPrice: Number(formData.productPrice),
        productDiscountPrice: Number(formData.productDiscountPrice || formData.productPrice),
        productCategorysId: [formData.productCategorysId],
        category: resolvedCategoryName,
        sellerName: formData.selectedUserName,
        sellerPhone: formData.selectedUserPhone,
        condition: formData.condition,
        attributes: categoryAttributes,
        location: {
          address: formData.address,
          city: formData.city,
          state: formData.state
        },
        status: formData.status,
        images: localPreviewUrls
      };

      const normalized = normalizeProduct(createdProduct, catMap);
      setListings((prev) => [normalized, ...prev]);

      showToast(`Published "${formData.productName}" in ${resolvedCategoryName}!`);
      setShowCreateModal(false);
    } catch (err) {
      setCreateError(err.message || 'Error communicating with live backend.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleSuspend = async (listing) => {
    const newStatus = listing.status === 'Suspended' ? 'Live' : 'Suspended';
    const apiStatus = newStatus === 'Live' ? 'live' : 'suspended';
    setListings((prev) =>
      prev.map((item) => (item.id === listing.id ? { ...item, status: newStatus } : item))
    );
    showToast(`Listing "${listing.title}" is now ${newStatus}.`);

    try {
      await apiFetch(`/api/v1/listings/${listing.id}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status: apiStatus })
      });
    } catch {}
  };

  const handleToggleFeatured = async (listing) => {
    const updatedFeatured = !listing.isFeatured;
    setListings((prev) =>
      prev.map((item) => (item.id === listing.id ? { ...item, isFeatured: updatedFeatured } : item))
    );
    showToast(`Listing "${listing.title}" ${updatedFeatured ? 'marked Featured ★' : 'set to Standard'}.`);

    try {
      await apiFetch(`/api/v1/listings/${listing.id}`, {
        method: 'PUT',
        body: JSON.stringify({ isFeatured: updatedFeatured })
      });
    } catch {}
  };

  const confirmDelete = async () => {
    if (!deleteCandidate) return;
    const targetId = deleteCandidate.id;
    setListings((prev) => prev.filter((item) => item.id !== targetId));
    showToast(`Listing "${deleteCandidate.title}" removed.`);
    setDeleteCandidate(null);
    setSelectedIds((prev) => prev.filter((id) => id !== targetId));

    try {
      let res = await apiFetch(`/product/delete/${targetId}`, { method: 'DELETE' });
      if (!res.ok) {
        await apiFetch(`/api/v1/listings/${targetId}`, { method: 'DELETE' });
      }
    } catch {}
  };

  const filteredListings = useMemo(() => {
    return listings.filter((item) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        (item.title || '').toLowerCase().includes(q) ||
        (item.seller || '').toLowerCase().includes(q) ||
        (item.category || '').toLowerCase().includes(q) ||
        (item.location || '').toLowerCase().includes(q) ||
        (item.subtitleSummary || '').toLowerCase().includes(q);
      const matchesStatus = statusFilter === 'All' || item.status === statusFilter;
      const matchesCategory =
        categoryFilter === 'All' ||
        (item.category || '').toLowerCase().trim() === categoryFilter.toLowerCase().trim();
      return matchesSearch && matchesStatus && matchesCategory;
    });
  }, [listings, searchQuery, statusFilter, categoryFilter]);

  // Count per category for the macOS Finder Sidebar
  const categoryCounts = useMemo(() => {
    const counts = { All: listings.length };
    STANDARD_11_CATEGORIES.forEach((c) => {
      counts[c] = 0;
    });
    listings.forEach((item) => {
      const matched = STANDARD_11_CATEGORIES.find(
        (c) => c.toLowerCase() === (item.category || '').toLowerCase().trim()
      );
      if (matched) {
        counts[matched] = (counts[matched] || 0) + 1;
      }
    });
    return counts;
  }, [listings]);

  const filteredBmvItems = useMemo(() => {
    const q = bmvSearch.trim().toLowerCase();
    if (bmvStep === 'brand') {
      return activeCascadingCatalog.filter((b) => !q || b.brand.toLowerCase().includes(q));
    }
    if (bmvStep === 'model') {
      const models = tempBrandObj?.models || [];
      return models.filter((m) => !q || m.model.toLowerCase().includes(q));
    }
    if (bmvStep === 'variant') {
      const variants = tempModelObj?.variants || [];
      return variants.filter((v) => !q || v.toLowerCase().includes(q));
    }
    return [];
  }, [bmvStep, bmvSearch, tempBrandObj, tempModelObj, activeCascadingCatalog]);

  const WIZARD_STEPS = [
    { num: 1, label: 'Category', title: 'What are you offering?' },
    { num: 2, label: 'Details', title: 'Include some details' },
    { num: 3, label: 'Photos', title: 'Upload your photos' },
    { num: 4, label: 'Price', title: 'Set a price' },
    { num: 5, label: 'Location', title: 'Confirm your location' },
    { num: 6, label: 'Review', title: 'Review your details' }
  ];

  const activeStepMeta = WIZARD_STEPS.find((s) => s.num === createStep) || WIZARD_STEPS[0];

  return (
    <div
      style={{
        fontFamily: MAC_FONT,
        color: '#1D1D1F',
        paddingBottom: '40px',
        WebkitFontSmoothing: 'antialiased'
      }}
    >
      {/* macOS Notification Banner Toast */}
      {toastMessage && (
        <div
          style={{
            position: 'fixed',
            top: '20px',
            right: '24px',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '12px 18px',
            borderRadius: '14px',
            backgroundColor: 'rgba(255, 255, 255, 0.94)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            color: '#1D1D1F',
            border: '1px solid rgba(0,0,0,0.1)',
            boxShadow: '0 12px 32px rgba(0,0,0,0.14)',
            fontWeight: 600,
            fontSize: '13px'
          }}
        >
          <CheckCircle2 size={16} color="#34C759" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* =================================================================== */}
      {/* MACOS SONOMA / SEQUOIA FINDER WINDOW CONTAINER                      */}
      {/* =================================================================== */}
      <div
        style={{
          backgroundColor: '#F5F5F7',
          borderRadius: '18px',
          border: '1px solid rgba(0, 0, 0, 0.12)',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.08), 0 1px 3px rgba(0, 0, 0, 0.04)',
          overflow: 'hidden'
        }}
      >
        {/* macOS Window Top Toolbar */}
        <div
          style={{
            padding: '14px 20px',
            backgroundColor: 'rgba(255, 255, 255, 0.88)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            borderBottom: '1px solid rgba(0, 0, 0, 0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '14px'
          }}
        >
          {/* Left: Traffic Lights + Window Title */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ width: '12px', height: '12px', borderRadius: '999px', backgroundColor: '#FF5F57', border: '1px solid rgba(0,0,0,0.12)' }} />
              <span style={{ width: '12px', height: '12px', borderRadius: '999px', backgroundColor: '#FEBC2E', border: '1px solid rgba(0,0,0,0.12)' }} />
              <span style={{ width: '12px', height: '12px', borderRadius: '999px', backgroundColor: '#28C840', border: '1px solid rgba(0,0,0,0.12)' }} />
            </div>

            <div style={{ height: '20px', width: '1px', backgroundColor: 'rgba(0,0,0,0.1)' }} />

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '15px', fontWeight: 700, color: '#1D1D1F', letterSpacing: '-0.02em' }}>
                  Marketplace Listings
                </span>
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: '999px',
                    backgroundColor: 'rgba(52, 199, 89, 0.14)',
                    color: '#248A3D'
                  }}
                >
                  {listings.length} Live Ads
                </span>
              </div>
            </div>
          </div>

          {/* Center/Right: Search + Segmented View Mode + Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            {/* Spotlight Search */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '7px',
                backgroundColor: 'rgba(118, 118, 128, 0.12)',
                borderRadius: '8px',
                padding: '6px 12px',
                width: '240px'
              }}
            >
              <Search size={14} color="#8E8E93" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search title, brand, city, seller..."
                style={{
                  border: 'none',
                  outline: 'none',
                  backgroundColor: 'transparent',
                  fontSize: '12.5px',
                  color: '#1D1D1F',
                  width: '100%',
                  fontFamily: MAC_FONT
                }}
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{
                padding: '6px 10px',
                borderRadius: '8px',
                border: '1px solid rgba(0,0,0,0.12)',
                backgroundColor: '#FFFFFF',
                fontSize: '12px',
                fontWeight: 600,
                color: '#1D1D1F',
                cursor: 'pointer'
              }}
            >
              <option value="All">All Statuses</option>
              <option value="Live">Live Only</option>
              <option value="Suspended">Suspended</option>
            </select>

            {/* macOS Segmented View Switcher (Cards vs Table) */}
            <div
              style={{
                display: 'inline-flex',
                backgroundColor: 'rgba(118, 118, 128, 0.12)',
                padding: '2px',
                borderRadius: '8px'
              }}
            >
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  padding: '5px 10px',
                  borderRadius: '6px',
                  border: 'none',
                  backgroundColor: viewMode === 'grid' ? '#FFFFFF' : 'transparent',
                  color: '#1D1D1F',
                  fontSize: '11.5px',
                  fontWeight: 600,
                  boxShadow: viewMode === 'grid' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                  cursor: 'pointer'
                }}
              >
                <LayoutGrid size={13} />
                Cards
              </button>
              <button
                type="button"
                onClick={() => setViewMode('table')}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  padding: '5px 10px',
                  borderRadius: '6px',
                  border: 'none',
                  backgroundColor: viewMode === 'table' ? '#FFFFFF' : 'transparent',
                  color: '#1D1D1F',
                  fontSize: '11.5px',
                  fontWeight: 600,
                  boxShadow: viewMode === 'table' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                  cursor: 'pointer'
                }}
              >
                <List size={13} />
                Table
              </button>
            </div>

            <button
              type="button"
              onClick={loadAllCatalogData}
              title="Refresh Live Catalog"
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                border: '1px solid rgba(0,0,0,0.12)',
                backgroundColor: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: '#1D1D1F'
              }}
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            </button>

            <ExportButton
              data={filteredListings}
              filename="mybigbazaar-live-listings.csv"
              label="Export CSV"
              dateKey="createdAt"
              columns={[
                { key: 'id', label: 'Listing ID' },
                { key: 'title', label: 'Title' },
                { key: 'category', label: 'Category' },
                { key: 'price', label: 'Price' },
                { key: 'seller', label: 'Seller' },
                { key: 'location', label: 'Location' },
                { key: 'status', label: 'Status' }
              ]}
            />

            <button
              type="button"
              onClick={() => handleOpenCreateModal(categoryFilter)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '7px 15px',
                borderRadius: '8px',
                border: 'none',
                background: 'linear-gradient(180deg, #007AFF 0%, #0062CC 100%)',
                color: '#FFFFFF',
                fontWeight: 600,
                fontSize: '12.5px',
                cursor: 'pointer',
                boxShadow: '0 2px 6px rgba(0, 122, 255, 0.3)'
              }}
            >
              <Plus size={15} />
              Create Listing
            </button>
          </div>
        </div>

        {/* ================================================================= */}
        {/* MACOS SPLIT VIEW: LEFT CATEGORY SIDEBAR + RIGHT CATALOG CANVAS    */}
        {/* ================================================================= */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '240px 1fr',
            minHeight: '720px'
          }}
        >
          {/* Left Finder Sidebar: All 11 Categories */}
          <div
            style={{
              backgroundColor: 'rgba(242, 242, 247, 0.92)',
              borderRight: '1px solid rgba(0, 0, 0, 0.08)',
              padding: '14px 10px',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px'
            }}
          >
            <div
              style={{
                fontSize: '11px',
                fontWeight: 700,
                color: '#86868B',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                padding: '4px 10px 6px'
              }}
            >
              Categories
            </div>

            <button
              type="button"
              onClick={() => setCategoryFilter('All')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '8px 10px',
                borderRadius: '9px',
                border: 'none',
                backgroundColor: categoryFilter === 'All' ? '#007AFF' : 'transparent',
                color: categoryFilter === 'All' ? '#FFFFFF' : '#1D1D1F',
                fontSize: '13px',
                fontWeight: categoryFilter === 'All' ? 600 : 500,
                cursor: 'pointer',
                textAlign: 'left'
              }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Layers size={15} color={categoryFilter === 'All' ? '#FFFFFF' : '#007AFF'} />
                <span>All Categories</span>
              </span>
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  padding: '1px 7px',
                  borderRadius: '999px',
                  backgroundColor: categoryFilter === 'All' ? 'rgba(255,255,255,0.22)' : 'rgba(118,118,128,0.12)',
                  color: categoryFilter === 'All' ? '#FFFFFF' : '#6E6E73'
                }}
              >
                {categoryCounts.All || 0}
              </span>
            </button>

            {STANDARD_11_CATEGORIES.map((catName) => {
              const active = categoryFilter.toLowerCase() === catName.toLowerCase();
              const count = categoryCounts[catName] || 0;
              return (
                <button
                  key={catName}
                  type="button"
                  onClick={() => setCategoryFilter(catName)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '7.5px 10px',
                    borderRadius: '9px',
                    border: 'none',
                    backgroundColor: active ? '#007AFF' : 'transparent',
                    color: active ? '#FFFFFF' : '#1D1D1F',
                    fontSize: '12.5px',
                    fontWeight: active ? 600 : 500,
                    cursor: 'pointer',
                    textAlign: 'left'
                  }}
                >
                  <span
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      minWidth: 0,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {renderCategoryThumb(catName, categories, 18, active)}
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{catName}</span>
                  </span>
                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: 700,
                      padding: '1px 7px',
                      borderRadius: '999px',
                      backgroundColor: active ? 'rgba(255,255,255,0.22)' : 'rgba(118,118,128,0.12)',
                      color: active ? '#FFFFFF' : '#6E6E73',
                      flexShrink: 0
                    }}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Right Main Content Area */}
          <div style={{ backgroundColor: '#FFFFFF', padding: '22px 24px', overflowY: 'auto' }}>
            {/* Category Context Bar */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '18px',
                paddingBottom: '12px',
                borderBottom: '1px solid rgba(0, 0, 0, 0.07)'
              }}
            >
              <div>
                <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: '#1D1D1F', letterSpacing: '-0.02em' }}>
                  {categoryFilter === 'All' ? 'All Marketplace Listings' : categoryFilter}
                </h2>
                <div style={{ fontSize: '12px', color: '#86868B', marginTop: '2px' }}>
                  Showing {filteredListings.length} verified listings
                </div>
              </div>

              {categoryFilter !== 'All' && (
                <button
                  type="button"
                  onClick={() => handleOpenCreateModal(categoryFilter)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '6px 12px',
                    borderRadius: '8px',
                    border: '1px solid rgba(0, 122, 255, 0.25)',
                    backgroundColor: 'rgba(0, 122, 255, 0.08)',
                    color: '#007AFF',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  <Plus size={13} />
                  Add {categoryFilter} Listing
                </button>
              )}
            </div>

            {loading ? (
              <div style={{ padding: '60px 20px', textAlign: 'center', color: '#86868B', fontSize: '14px' }}>
                Loading live marketplace catalog...
              </div>
            ) : loadError ? (
              <div
                style={{
                  padding: '48px 24px',
                  textAlign: 'center',
                  backgroundColor: '#FEF2F2',
                  borderRadius: '16px',
                  border: '1px solid #FCA5A5'
                }}
              >
                <AlertCircle size={28} color="#DC2626" style={{ margin: '0 auto 10px' }} />
                <div style={{ fontSize: '16px', fontWeight: 700, color: '#991B1B', marginBottom: '6px' }}>
                  Unable to Load Catalog
                </div>
                <p style={{ fontSize: '13px', color: '#B91C1C', maxWidth: '420px', margin: '0 auto 18px' }}>
                  {String(loadError)}
                </p>
                <button
                  type="button"
                  onClick={loadAllCatalogData}
                  style={{
                    padding: '9px 18px',
                    borderRadius: '8px',
                    border: 'none',
                    backgroundColor: '#DC2626',
                    color: '#FFF',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Retry Loading
                </button>
              </div>
            ) : filteredListings.length === 0 ? (
              <div
                style={{
                  padding: '64px 24px',
                  textAlign: 'center',
                  backgroundColor: '#F5F5F7',
                  borderRadius: '16px',
                  border: '1px dashed rgba(0,0,0,0.14)'
                }}
              >
                <Layers size={28} color="#86868B" style={{ margin: '0 auto 10px' }} />
                <div style={{ fontSize: '16px', fontWeight: 700, color: '#1D1D1F', marginBottom: '6px' }}>
                  No Listings Found in {categoryFilter}
                </div>
                <p style={{ fontSize: '13px', color: '#6E6E73', maxWidth: '420px', margin: '0 auto 18px' }}>
                  Create a new listing to publish it to the marketplace.
                </p>
                <button
                  type="button"
                  onClick={() => handleOpenCreateModal(categoryFilter)}
                  style={{
                    padding: '9px 18px',
                    borderRadius: '8px',
                    border: 'none',
                    backgroundColor: '#007AFF',
                    color: '#FFFFFF',
                    fontWeight: 600,
                    fontSize: '13px',
                    cursor: 'pointer'
                  }}
                >
                  + Create {categoryFilter !== 'All' ? categoryFilter : ''} Listing
                </button>
              </div>
            ) : viewMode === 'grid' ? (
              /* ============================================================= */
              /* MACOS SONOMA CARD GRID VIEW                                   */
              /* ============================================================= */
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(265px, 1fr))',
                  gap: '16px'
                }}
              >
                {filteredListings.map((item) => {
                  return (
                    <div
                      key={item.id}
                      style={{
                        borderRadius: '14px',
                        backgroundColor: '#FFFFFF',
                        border: '1px solid rgba(0, 0, 0, 0.09)',
                        boxShadow: '0 4px 14px rgba(0, 0, 0, 0.04)',
                        overflow: 'hidden',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        transition: 'transform 0.15s ease, box-shadow 0.15s ease'
                      }}
                    >
                      <div>
                        {/* Cover Photo + Badges */}
                        <div
                          onClick={() => setSelectedListing(item)}
                          style={{
                            position: 'relative',
                            height: '168px',
                            backgroundColor: '#F5F5F7',
                            cursor: 'pointer',
                            overflow: 'hidden'
                          }}
                        >
                          <img
                            src={item.image}
                            alt={item.title}
                            onError={(e) => {
                              e.currentTarget.onerror = null;
                              e.currentTarget.src = DEFAULT_PRODUCT_PLACEHOLDER;
                            }}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />

                          {/* Top Left: Category Pill with Uploaded Category Image/Icon */}
                          <span
                            style={{
                              position: 'absolute',
                              top: '10px',
                              left: '10px',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                              padding: '3px 9px',
                              borderRadius: '999px',
                              backgroundColor: 'rgba(255, 255, 255, 0.92)',
                              backdropFilter: 'blur(8px)',
                              fontSize: '11px',
                              fontWeight: 700,
                              color: '#1D1D1F',
                              boxShadow: '0 2px 6px rgba(0,0,0,0.12)'
                            }}
                          >
                            {renderCategoryThumb(item.category, categories, 14, false)}
                            <span>{item.category}</span>
                          </span>

                          {/* Top Right: Status or Featured */}
                          <span
                            style={{
                              position: 'absolute',
                              top: '10px',
                              right: '10px',
                              padding: '3px 8px',
                              borderRadius: '6px',
                              backgroundColor: item.status === 'Live' ? 'rgba(52, 199, 89, 0.92)' : 'rgba(255, 59, 48, 0.92)',
                              color: '#FFFFFF',
                              fontSize: '10.5px',
                              fontWeight: 700
                            }}
                          >
                            {item.status}
                          </span>

                          {/* Bottom Right: Photo count */}
                          {item.allImages?.length > 1 && (
                            <span
                              style={{
                                position: 'absolute',
                                bottom: '8px',
                                right: '8px',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                padding: '2px 7px',
                                borderRadius: '6px',
                                backgroundColor: 'rgba(0, 0, 0, 0.65)',
                                color: '#FFFFFF',
                                fontSize: '10.5px',
                                fontWeight: 600
                              }}
                            >
                              <Camera size={11} />
                              {item.allImages.length}
                            </span>
                          )}
                        </div>

                        {/* Card Details */}
                        <div style={{ padding: '14px' }}>
                          <div
                            style={{
                              fontSize: '17px',
                              fontWeight: 800,
                              color: '#1D1D1F',
                              letterSpacing: '-0.02em',
                              marginBottom: '3px'
                            }}
                          >
                            {item.price}
                          </div>

                          <div
                            onClick={() => setSelectedListing(item)}
                            style={{
                              fontSize: '13.5px',
                              fontWeight: 600,
                              color: '#1D1D1F',
                              lineHeight: 1.35,
                              cursor: 'pointer',
                              display: '-webkit-box',
                              WebkitLineClamp: 1,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden'
                            }}
                          >
                            {item.title}
                          </div>

                          {/* Dynamic Category Attribute Subtitle */}
                          {item.subtitleSummary && (
                            <div
                              style={{
                                fontSize: '11.5px',
                                color: '#6E6E73',
                                fontWeight: 500,
                                marginTop: '4px',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis'
                              }}
                            >
                              {item.subtitleSummary}
                            </div>
                          )}

                          {/* Seller & Location Row */}
                          <div
                            style={{
                              marginTop: '10px',
                              paddingTop: '9px',
                              borderTop: '1px solid rgba(0, 0, 0, 0.06)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              fontSize: '11px',
                              color: '#86868B'
                            }}
                          >
                            <span style={{ fontWeight: 600, color: '#3A3A3C', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '125px' }}>
                              {item.seller}
                            </span>
                            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '110px' }}>
                              {item.location}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Card Footer Actions */}
                      <div
                        style={{
                          padding: '8px 12px',
                          backgroundColor: '#FAFAFC',
                          borderTop: '1px solid rgba(0, 0, 0, 0.06)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: '6px'
                        }}
                      >
                        <button
                          type="button"
                          onClick={() => setSelectedListing(item)}
                          style={{
                            flex: 1,
                            padding: '5px 8px',
                            borderRadius: '6px',
                            border: '1px solid rgba(0,0,0,0.1)',
                            backgroundColor: '#FFFFFF',
                            color: '#1D1D1F',
                            fontSize: '11.5px',
                            fontWeight: 600,
                            cursor: 'pointer'
                          }}
                        >
                          Inspect
                        </button>
                        <button
                          type="button"
                          onClick={() => handleToggleFeatured(item)}
                          title="Toggle Featured"
                          style={{
                            padding: '5px 8px',
                            borderRadius: '6px',
                            border: '1px solid rgba(0,0,0,0.1)',
                            backgroundColor: item.isFeatured ? 'rgba(255, 149, 0, 0.14)' : '#FFFFFF',
                            color: item.isFeatured ? '#C93400' : '#6E6E73',
                            fontSize: '11.5px',
                            fontWeight: 600,
                            cursor: 'pointer'
                          }}
                        >
                          ★
                        </button>
                        <button
                          type="button"
                          onClick={() => handleToggleSuspend(item)}
                          style={{
                            padding: '5px 8px',
                            borderRadius: '6px',
                            border: '1px solid rgba(0,0,0,0.1)',
                            backgroundColor: '#FFFFFF',
                            color: item.status === 'Suspended' ? '#248A3D' : '#D70015',
                            fontSize: '11.5px',
                            fontWeight: 600,
                            cursor: 'pointer'
                          }}
                        >
                          {item.status === 'Suspended' ? 'Activate' : 'Suspend'}
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteCandidate(item)}
                          title="Delete Listing"
                          style={{
                            padding: '5px 7px',
                            borderRadius: '6px',
                            border: 'none',
                            backgroundColor: 'rgba(255, 59, 48, 0.08)',
                            color: '#FF3B30',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center'
                          }}
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              /* ============================================================= */
              /* MACOS FINDER TABLE VIEW                                       */
              /* ============================================================= */
              <div style={{ overflowX: 'auto', borderRadius: '12px', border: '1px solid rgba(0,0,0,0.08)' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#F5F5F7', borderBottom: '1px solid rgba(0,0,0,0.08)', textAlign: 'left' }}>
                      <th style={{ padding: '10px 14px', fontWeight: 600, color: '#6E6E73' }}>Listing</th>
                      <th style={{ padding: '10px 14px', fontWeight: 600, color: '#6E6E73' }}>Category &amp; Specs</th>
                      <th style={{ padding: '10px 14px', fontWeight: 600, color: '#6E6E73' }}>Seller &amp; Location</th>
                      <th style={{ padding: '10px 14px', fontWeight: 600, color: '#6E6E73' }}>Price</th>
                      <th style={{ padding: '10px 14px', fontWeight: 600, color: '#6E6E73' }}>Status</th>
                      <th style={{ padding: '10px 14px', fontWeight: 600, color: '#6E6E73', textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredListings.map((item) => (
                      <tr key={item.id} style={{ borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
                        <td style={{ padding: '10px 14px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <img
                              src={item.image}
                              alt={item.title}
                              onError={(e) => {
                                e.currentTarget.onerror = null;
                                e.currentTarget.src = DEFAULT_PRODUCT_PLACEHOLDER;
                              }}
                              style={{ width: '44px', height: '44px', borderRadius: '8px', objectFit: 'cover' }}
                            />
                            <div>
                              <div style={{ fontWeight: 600, color: '#1D1D1F' }}>{item.title}</div>
                              <div style={{ fontSize: '11px', color: '#86868B' }}>
                                {item.allImages?.length || 1} photos • Listed {item.dateAdded}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: '10px 14px' }}>
                          <span
                            style={{
                              display: 'inline-block',
                              padding: '2px 8px',
                              borderRadius: '6px',
                              backgroundColor: 'rgba(0, 122, 255, 0.1)',
                              color: '#0062CC',
                              fontSize: '11.5px',
                              fontWeight: 600
                            }}
                          >
                            {item.category}
                          </span>
                          {item.subtitleSummary && (
                            <div style={{ fontSize: '11.5px', color: '#6E6E73', marginTop: '3px' }}>
                              {item.subtitleSummary}
                            </div>
                          )}
                        </td>
                        <td style={{ padding: '10px 14px' }}>
                          <div style={{ fontWeight: 600, color: '#1D1D1F' }}>{item.seller}</div>
                          <div style={{ fontSize: '11.5px', color: '#86868B' }}>{item.location}</div>
                        </td>
                        <td style={{ padding: '10px 14px', fontWeight: 700, fontSize: '14px', color: '#1D1D1F' }}>
                          {item.price}
                        </td>
                        <td style={{ padding: '10px 14px' }}>
                          <StatusPill status={item.status} />
                        </td>
                        <td style={{ padding: '10px 14px', textAlign: 'right' }}>
                          <div style={{ display: 'inline-flex', gap: '6px' }}>
                            <button
                              type="button"
                              onClick={() => setSelectedListing(item)}
                              style={{
                                padding: '5px 10px',
                                borderRadius: '6px',
                                border: '1px solid rgba(0,0,0,0.12)',
                                backgroundColor: '#FFFFFF',
                                fontSize: '12px',
                                fontWeight: 600,
                                cursor: 'pointer'
                              }}
                            >
                              Inspect
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeleteCandidate(item)}
                              style={{
                                padding: '5px 8px',
                                borderRadius: '6px',
                                border: 'none',
                                backgroundColor: 'rgba(255,59,48,0.1)',
                                color: '#FF3B30',
                                cursor: 'pointer'
                              }}
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* 6-STEP MACOS CREATE LISTING WIZARD SHEET (ALL 11 CATEGORIES)          */}
      {/* ===================================================================== */}
      {showCreateModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9500,
            backgroundColor: 'rgba(0, 0, 0, 0.42)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}
          onClick={() => !isSubmitting && setShowCreateModal(false)}
        >
          <div
            style={{
              maxWidth: '650px',
              width: '100%',
              maxHeight: '92vh',
              overflowY: 'auto',
              backgroundColor: '#FFFFFF',
              borderRadius: '18px',
              border: '1px solid rgba(0,0,0,0.12)',
              boxShadow: '0 28px 70px rgba(0, 0, 0, 0.28)',
              fontFamily: MAC_FONT,
              position: 'relative',
              display: 'flex',
              flexDirection: 'column'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Wizard Top Bar */}
            <div
              style={{
                padding: '16px 22px',
                backgroundColor: '#F5F5F7',
                borderBottom: '1px solid rgba(0,0,0,0.08)',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  {createStep > 1 && (
                    <button
                      type="button"
                      onClick={() => {
                        setCreateError(null);
                        setCreateStep((prev) => prev - 1);
                      }}
                      disabled={isSubmitting}
                      style={{
                        width: '30px',
                        height: '30px',
                        borderRadius: '999px',
                        border: '1px solid rgba(0,0,0,0.12)',
                        backgroundColor: '#FFFFFF',
                        color: '#1D1D1F',
                        cursor: 'pointer',
                        fontWeight: 700
                      }}
                    >
                      ←
                    </button>
                  )}
                  <div>
                    <h3 style={{ margin: 0, fontWeight: 700, fontSize: '16px', color: '#1D1D1F' }}>
                      {activeStepMeta.title}
                    </h3>
                    <div style={{ fontSize: '11.5px', color: '#86868B' }}>
                      Step {createStep} of 6 • {resolvedCategoryName} Seller Flow
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => !isSubmitting && setShowCreateModal(false)}
                  style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '999px',
                    border: 'none',
                    backgroundColor: 'rgba(0,0,0,0.06)',
                    color: '#6E6E73',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <X size={15} />
                </button>
              </div>

              {/* 6-Step Progress Pills */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '6px' }}>
                {WIZARD_STEPS.map((st) => {
                  const isCurrent = createStep === st.num;
                  const isDone = createStep > st.num;
                  return (
                    <div
                      key={st.num}
                      onClick={() => {
                        if (isDone && !isSubmitting) {
                          setCreateError(null);
                          setCreateStep(st.num);
                        }
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '5px',
                        padding: '6px 4px',
                        borderRadius: '8px',
                        backgroundColor: isCurrent
                          ? '#007AFF'
                          : isDone
                            ? 'rgba(52, 199, 89, 0.14)'
                            : '#FFFFFF',
                        color: isCurrent ? '#FFFFFF' : isDone ? '#248A3D' : '#86868B',
                        border: isCurrent ? 'none' : '1px solid rgba(0,0,0,0.08)',
                        fontSize: '11px',
                        fontWeight: 600,
                        cursor: isDone ? 'pointer' : 'default'
                      }}
                    >
                      <span>{isDone ? '✓' : st.num}</span>
                      <span>{st.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Wizard Body */}
            <div style={{ padding: '22px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {createError && (
                <div
                  style={{
                    padding: '10px 14px',
                    borderRadius: '10px',
                    backgroundColor: 'rgba(255, 59, 48, 0.1)',
                    border: '1px solid rgba(255, 59, 48, 0.25)',
                    color: '#D70015',
                    fontSize: '12.5px',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <AlertCircle size={15} />
                  <span>{createError}</span>
                </div>
              )}

              {/* STEP 1: SELECT CATEGORY & SELLER ACCOUNT */}
              {createStep === 1 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div
                    style={{
                      padding: '12px 14px',
                      borderRadius: '10px',
                      backgroundColor: '#F5F5F7',
                      border: '1px solid rgba(0,0,0,0.07)'
                    }}
                  >
                    <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, color: '#6E6E73', marginBottom: '6px', textTransform: 'uppercase' }}>
                      Listing Seller Account (Default: Logged-In User)
                    </label>
                    <select
                      value={formData.selectedUserId}
                      onChange={(e) => {
                        const chosenId = e.target.value;
                        const uObj = allSelectableUsers.find((u) => String(u.id) === String(chosenId));
                        if (uObj) {
                          setFormData((prev) => ({
                            ...prev,
                            selectedUserId: uObj.id,
                            selectedUserName: uObj.name,
                            selectedUserPhone: uObj.phone || '+919131919112'
                          }));
                        }
                      }}
                      style={{
                        width: '100%',
                        padding: '9px 12px',
                        borderRadius: '8px',
                        border: '1px solid rgba(0,0,0,0.14)',
                        backgroundColor: '#FFFFFF',
                        fontSize: '13px',
                        fontWeight: 600,
                        color: '#1D1D1F'
                      }}
                    >
                      {allSelectableUsers.map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.isDefault
                            ? `★ ${u.name} (${u.phone}) — Default Logged-in User`
                            : `${u.name} (${u.phone})`}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: '10px', fontWeight: 700, fontSize: '13.5px', color: '#1D1D1F' }}>
                      Choose a Category to Open Its Custom Seller Form *
                    </label>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
                      {categories.map((cat) => {
                        const cId = cat._id || cat.id;
                        const cName = cat.name || cat.title || 'Category';
                        const isSelected = (formData.categoryName || '').toLowerCase() === cName.toLowerCase();

                        return (
                          <button
                            key={cId}
                            type="button"
                            onClick={() => {
                              setFormData((prev) => ({
                                ...prev,
                                productCategorysId: cId,
                                categoryName: cName
                              }));
                              setCategoryAttributes({});
                              setCreateError(null);
                              setCreateStep(2);
                            }}
                            style={{
                              padding: '13px 14px',
                              borderRadius: '12px',
                              border: isSelected ? '2px solid #007AFF' : '1px solid rgba(0,0,0,0.1)',
                              backgroundColor: isSelected ? 'rgba(0, 122, 255, 0.06)' : '#FFFFFF',
                              color: '#1D1D1F',
                              textAlign: 'left',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              gap: '10px'
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <div
                                style={{
                                  width: '32px',
                                  height: '32px',
                                  borderRadius: '8px',
                                  backgroundColor: '#F5F5F7',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  overflow: 'hidden',
                                  flexShrink: 0
                                }}
                              >
                                {renderCategoryThumb(cName, categories, 22, false)}
                              </div>
                              <div>
                                <div style={{ fontSize: '13.5px', fontWeight: 700 }}>{cName}</div>
                                <div style={{ fontSize: '11px', color: '#86868B' }}>
                                  Open {cName} seller form
                                </div>
                              </div>
                            </div>
                            <ChevronRight size={16} color="#007AFF" />
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 2: DYNAMIC CATEGORY SELLER FORM + SUGGESTED BOX */}
              {createStep === 2 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(0,0,0,0.08)', paddingBottom: '10px' }}>
                    <div>
                      <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#002F34' }}>
                        {resolvedCategoryName}
                      </h2>
                      <div style={{ fontSize: '12px', color: '#64748B' }}>
                        {activeCategoryFormSchema?.title || 'Include some details'}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setCreateStep(1)}
                      style={{
                        border: 'none',
                        background: 'rgba(0, 122, 255, 0.1)',
                        color: '#007AFF',
                        padding: '5px 10px',
                        borderRadius: '6px',
                        fontWeight: 600,
                        fontSize: '12px',
                        cursor: 'pointer'
                      }}
                    >
                      Change Category
                    </button>
                  </div>

                  {/* Render Category Specification Fields */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {(activeCategoryFormSchema?.fields || []).map((field) => {
                      const val = categoryAttributes[field.key] ?? '';

                      if (field.type === 'brand_model_variant') {
                        const hasBmv = Boolean(val);
                        return (
                          <div key={field.id || field.key}>
                            <div
                              onClick={openBrandModelVariantSelector}
                              style={{
                                borderBottom: '1.5px solid #002F34',
                                padding: '10px 4px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between'
                              }}
                            >
                              <div>
                                {hasBmv ? (
                                  <>
                                    <div style={{ fontSize: '11.5px', color: '#64748B', marginBottom: '2px' }}>
                                      Brand / Model / Variant
                                    </div>
                                    <div style={{ fontSize: '14.5px', fontWeight: 600, color: '#002F34' }}>
                                      {val}
                                    </div>
                                  </>
                                ) : (
                                  <div style={{ fontSize: '14px', color: '#64748B', fontWeight: 500 }}>
                                    {field.label} {field.required ? '*' : ''}
                                  </div>
                                )}
                              </div>
                              <ChevronRight size={17} color="#64748B" />
                            </div>
                          </div>
                        );
                      }

                      if (field.type === 'select') {
                        return (
                          <div key={field.id || field.key}>
                            <div
                              onClick={() => setSelectDialogField(field)}
                              style={{
                                borderBottom: '1.5px solid #002F34',
                                padding: '10px 4px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between'
                              }}
                            >
                              <div>
                                {val ? (
                                  <>
                                    <div style={{ fontSize: '11.5px', color: '#64748B', marginBottom: '2px' }}>
                                      {field.label} {field.required ? '*' : ''}
                                    </div>
                                    <div style={{ fontSize: '14.5px', fontWeight: 600, color: '#002F34' }}>
                                      {val}
                                    </div>
                                  </>
                                ) : (
                                  <div style={{ fontSize: '14px', color: '#64748B', fontWeight: 500 }}>
                                    {field.label} {field.required ? '*' : ''}
                                  </div>
                                )}
                              </div>
                              <ChevronRight size={17} color="#64748B" />
                            </div>
                          </div>
                        );
                      }

                      if (field.type === 'segmented') {
                        return (
                          <div key={field.id || field.key}>
                            <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#002F34', marginBottom: '8px' }}>
                              {field.label} {field.required ? '*' : ''}
                            </label>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                              {(field.options || []).map((opt) => {
                                const active = val === opt;
                                return (
                                  <button
                                    key={opt}
                                    type="button"
                                    onClick={() =>
                                      setCategoryAttributes((prev) => ({
                                        ...prev,
                                        [field.key]: active ? '' : opt
                                      }))
                                    }
                                    style={{
                                      padding: '9px 16px',
                                      borderRadius: '8px',
                                      fontSize: '13px',
                                      fontWeight: active ? 700 : 500,
                                      border: active ? '1.5px solid #002F34' : '1px solid rgba(0,0,0,0.16)',
                                      backgroundColor: active ? '#D8F3F0' : '#FFFFFF',
                                      color: '#002F34',
                                      cursor: 'pointer'
                                    }}
                                  >
                                    {opt}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        );
                      }

                      const strVal = String(val);
                      const minVal = field.minValue;
                      const isInvalidMin =
                        minVal && strVal.length > 0 && (isNaN(Number(strVal)) || Number(strVal) < Number(minVal));

                      return (
                        <div key={field.id || field.key}>
                          <label
                            style={{
                              display: 'block',
                              fontSize: '12.5px',
                              fontWeight: 600,
                              color: isInvalidMin ? '#DC2626' : '#002F34',
                              marginBottom: '5px'
                            }}
                          >
                            {field.label} {field.required ? '*' : ''}
                          </label>
                          <input
                            type="text"
                            inputMode={field.type === 'number' ? 'numeric' : 'text'}
                            maxLength={field.maxLength || undefined}
                            placeholder={field.placeholder || `${field.label}`}
                            value={strVal}
                            onChange={(e) => {
                              const nextVal =
                                field.type === 'number'
                                  ? e.target.value.replace(/[^0-9]/g, '').slice(0, field.maxLength || 10)
                                  : e.target.value;
                              setCategoryAttributes((prev) => ({ ...prev, [field.key]: nextVal }));
                            }}
                            style={{
                              width: '100%',
                              padding: '10px 12px',
                              borderRadius: '8px',
                              border: isInvalidMin ? '2px solid #DC2626' : '1px solid rgba(0,0,0,0.18)',
                              fontSize: '13.5px',
                              color: '#1D1D1F'
                            }}
                          />
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '3px', fontSize: '11px' }}>
                            <span style={{ color: '#DC2626', fontWeight: 600 }}>
                              {isInvalidMin ? `${field.label} has a minimum value of ${minVal}.` : ''}
                            </span>
                            {field.maxLength && (
                              <span style={{ color: '#86868B' }}>
                                {strVal.length}/{field.maxLength}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Lavender ✦ Suggested Box */}
                  <div
                    style={{
                      padding: '16px',
                      borderRadius: '12px',
                      backgroundColor: '#FAF5FF',
                      border: '1px solid #E9D5FF',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '12px'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '5px',
                          backgroundColor: '#FFFFFF',
                          border: '1px solid #E9D5FF',
                          padding: '4px 10px',
                          borderRadius: '999px',
                          fontSize: '11.5px',
                          fontWeight: 700,
                          color: '#6B21A8'
                        }}
                      >
                        ✦ Suggested for {resolvedCategoryName}
                      </span>

                      <button
                        type="button"
                        onClick={handleWriteForMe}
                        style={{
                          padding: '6px 12px',
                          borderRadius: '7px',
                          border: '1.5px solid #004896',
                          backgroundColor: '#FFFFFF',
                          color: '#004896',
                          fontWeight: 700,
                          fontSize: '12px',
                          cursor: 'pointer'
                        }}
                      >
                        ↻ {hasGeneratedSuggestion ? 'Rephrase' : 'Write for me'}
                      </button>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#002F34', marginBottom: '4px' }}>
                        Ad title*
                      </label>
                      <input
                        type="text"
                        maxLength={70}
                        placeholder="Enter Ad title*"
                        value={formData.productName}
                        onChange={(e) => setFormData({ ...formData, productName: e.target.value.slice(0, 70) })}
                        style={{
                          width: '100%',
                          padding: '10px 12px',
                          borderRadius: '8px',
                          border: '1.5px solid #002F34',
                          backgroundColor: '#FFFFFF',
                          fontSize: '13.5px',
                          fontWeight: 600,
                          color: '#002F34'
                        }}
                      />
                      <div style={{ textAlign: 'right', fontSize: '11px', color: '#64748B', marginTop: '3px' }}>
                        {formData.productName.length}/70
                      </div>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#002F34', marginBottom: '4px' }}>
                        Describe what you are selling *
                      </label>
                      <textarea
                        rows={5}
                        maxLength={4096}
                        placeholder="Include condition, features and reason for selling"
                        value={formData.productDescription}
                        onChange={(e) => setFormData({ ...formData, productDescription: e.target.value.slice(0, 4096) })}
                        style={{
                          width: '100%',
                          padding: '10px 12px',
                          borderRadius: '8px',
                          border: '1.5px solid #002F34',
                          backgroundColor: '#FFFFFF',
                          fontSize: '13px',
                          color: '#002F34',
                          lineHeight: 1.5
                        }}
                      />
                      <div style={{ textAlign: 'right', fontSize: '11px', color: '#64748B', marginTop: '3px' }}>
                        {formData.productDescription.length}/4096
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 3: UPLOAD PHOTOS */}
              {createStep === 3 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleFileChange}
                    style={{ display: 'none' }}
                  />
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsDraggingOver(true);
                    }}
                    onDragLeave={() => setIsDraggingOver(false)}
                    onDrop={handleDropFiles}
                    style={{
                      padding: '32px 20px',
                      borderRadius: '14px',
                      border: isDraggingOver ? '2px dashed #007AFF' : '2px dashed rgba(0,0,0,0.18)',
                      backgroundColor: '#F5F5F7',
                      textAlign: 'center',
                      cursor: 'pointer'
                    }}
                  >
                    <Camera size={28} color="#007AFF" style={{ marginBottom: '8px' }} />
                    <div style={{ fontWeight: 700, fontSize: '14px', color: '#1D1D1F' }}>
                      Upload Multiple Photos ({selectedFiles.length + extraImageUrls.length}/20)
                    </div>
                    <div style={{ fontSize: '12px', color: '#86868B', marginTop: '4px' }}>
                      Click to select multiple files or drag &amp; drop images here
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input
                      type="url"
                      placeholder="Or paste an https:// image URL..."
                      value={imageUrlInput}
                      onChange={(e) => setImageUrlInput(e.target.value)}
                      style={{
                        flex: 1,
                        padding: '9px 12px',
                        borderRadius: '8px',
                        border: '1px solid rgba(0,0,0,0.16)',
                        fontSize: '13px'
                      }}
                    />
                    <button
                      type="button"
                      onClick={handleAddImageUrl}
                      style={{
                        padding: '0 14px',
                        borderRadius: '8px',
                        border: '1px solid rgba(0,0,0,0.14)',
                        backgroundColor: '#FFFFFF',
                        fontWeight: 600,
                        fontSize: '12.5px',
                        cursor: 'pointer'
                      }}
                    >
                      + Add URL
                    </button>
                  </div>

                  {(selectedFiles.length > 0 || extraImageUrls.length > 0) && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(105px, 1fr))', gap: '10px' }}>
                      {selectedFiles.map((file, idx) => (
                        <div
                          key={`file-${idx}`}
                          style={{
                            position: 'relative',
                            height: '96px',
                            borderRadius: '10px',
                            overflow: 'hidden',
                            border: idx === 0 ? '2px solid #007AFF' : '1px solid rgba(0,0,0,0.1)'
                          }}
                        >
                          <img src={URL.createObjectURL(file)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          <button
                            type="button"
                            onClick={() => handleRemoveFile(idx)}
                            style={{
                              position: 'absolute',
                              top: '4px',
                              right: '4px',
                              width: '20px',
                              height: '20px',
                              borderRadius: '999px',
                              border: 'none',
                              backgroundColor: '#FF3B30',
                              color: '#FFF',
                              cursor: 'pointer'
                            }}
                          >
                            ×
                          </button>
                        </div>
                      ))}
                      {extraImageUrls.map((url, idx) => (
                        <div
                          key={`url-${idx}`}
                          style={{
                            position: 'relative',
                            height: '96px',
                            borderRadius: '10px',
                            overflow: 'hidden',
                            border: '1px solid rgba(0,0,0,0.1)'
                          }}
                        >
                          <img src={url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          <button
                            type="button"
                            onClick={() => handleRemoveImageUrl(idx)}
                            style={{
                              position: 'absolute',
                              top: '4px',
                              right: '4px',
                              width: '20px',
                              height: '20px',
                              borderRadius: '999px',
                              border: 'none',
                              backgroundColor: '#FF3B30',
                              color: '#FFF',
                              cursor: 'pointer'
                            }}
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* STEP 4: SET A PRICE */}
              {createStep === 4 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#002F34', marginBottom: '6px' }}>
                      Price *
                    </label>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        borderRadius: '10px',
                        border: '2px solid #002F34',
                        height: '52px',
                        overflow: 'hidden'
                      }}
                    >
                      <span style={{ padding: '0 16px', fontSize: '18px', fontWeight: 700, borderRight: '1px solid rgba(0,0,0,0.1)' }}>
                        ₹
                      </span>
                      <input
                        type="text"
                        inputMode="numeric"
                        placeholder="Enter selling price"
                        value={formData.productPrice}
                        onChange={(e) => setFormData({ ...formData, productPrice: e.target.value.replace(/[^0-9]/g, '') })}
                        style={{
                          flex: 1,
                          border: 'none',
                          padding: '0 14px',
                          fontSize: '17px',
                          fontWeight: 700,
                          outline: 'none'
                        }}
                      />
                    </div>
                    {Number(formData.productPrice) > 0 && (
                      <div style={{ marginTop: '6px', fontSize: '13px', fontWeight: 700, color: '#248A3D' }}>
                        ₹ {Number(formData.productPrice).toLocaleString('en-IN')}
                      </div>
                    )}
                  </div>

                  {taxes.length > 0 && (
                    <div>
                      <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#6E6E73', marginBottom: '6px' }}>
                        Applicable GST / Tax Slab
                      </label>
                      <select
                        value={formData.taxId}
                        onChange={(e) => setFormData({ ...formData, taxId: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '10px 12px',
                          borderRadius: '8px',
                          border: '1px solid rgba(0,0,0,0.16)',
                          fontSize: '13px'
                        }}
                      >
                        {taxes.map((t) => (
                          <option key={t._id || t.id} value={t._id || t.id}>
                            {t.taxName || t.name} ({t.taxPercentage ?? t.percentage ?? 18}%)
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              )}

              {/* STEP 5: CONFIRM YOUR LOCATION */}
              {createStep === 5 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {POPULAR_LOCATIONS.map((loc) => {
                      const label = `${loc.address}, ${loc.city}`;
                      const active = formData.address === loc.address && formData.city === loc.city;
                      return (
                        <button
                          key={label}
                          type="button"
                          onClick={() =>
                            setFormData((prev) => ({
                              ...prev,
                              address: loc.address,
                              city: loc.city,
                              state: loc.state
                            }))
                          }
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            padding: '6px 11px',
                            borderRadius: '999px',
                            border: active ? '1.5px solid #007AFF' : '1px solid rgba(0,0,0,0.12)',
                            backgroundColor: active ? 'rgba(0,122,255,0.1)' : '#F5F5F7',
                            color: active ? '#007AFF' : '#1D1D1F',
                            fontSize: '12px',
                            fontWeight: 600,
                            cursor: 'pointer'
                          }}
                        >
                          <MapPin size={12} />
                          <span>{label}</span>
                        </button>
                      );
                    })}
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, marginBottom: '4px' }}>
                      Locality / Area
                    </label>
                    <input
                      type="text"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid rgba(0,0,0,0.16)', fontSize: '13px' }}
                    />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, marginBottom: '4px' }}>
                        City *
                      </label>
                      <input
                        type="text"
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid rgba(0,0,0,0.16)', fontSize: '13px' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, marginBottom: '4px' }}>
                        State *
                      </label>
                      <input
                        type="text"
                        value={formData.state}
                        onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                        style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid rgba(0,0,0,0.16)', fontSize: '13px' }}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 6: REVIEW YOUR DETAILS */}
              {createStep === 6 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <input
                      ref={avatarFileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarFileChange}
                      style={{ display: 'none' }}
                    />
                    <div
                      onClick={() => avatarFileInputRef.current?.click()}
                      style={{
                        width: '72px',
                        height: '72px',
                        borderRadius: '999px',
                        backgroundColor: '#002F34',
                        color: '#FFFFFF',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '26px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        overflow: 'hidden',
                        flexShrink: 0
                      }}
                    >
                      {sellerAvatarPreview ? (
                        <img src={sellerAvatarPreview} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        (formData.selectedUserName || 'U').charAt(0).toUpperCase()
                      )}
                    </div>
                    <div style={{ flex: 1 }}>
                      <label style={{ display: 'block', fontSize: '11.5px', color: '#6E6E73', marginBottom: '4px' }}>
                        Your name
                      </label>
                      <input
                        type="text"
                        maxLength={30}
                        value={formData.selectedUserName}
                        onChange={(e) => setFormData({ ...formData, selectedUserName: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '9px 12px',
                          borderRadius: '8px',
                          border: '1.5px solid #002F34',
                          fontSize: '14px',
                          fontWeight: 600
                        }}
                      />
                    </div>
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '12px 14px',
                      borderRadius: '10px',
                      backgroundColor: '#F5F5F7'
                    }}
                  >
                    <span style={{ fontSize: '13.5px', fontWeight: 600, color: '#1D1D1F' }}>
                      ✓ Verified phone number
                    </span>
                    <span style={{ fontSize: '13.5px', fontWeight: 700, color: '#248A3D' }}>
                      {formData.selectedUserPhone}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Wizard Footer */}
            <div
              style={{
                padding: '14px 22px',
                backgroundColor: '#F5F5F7',
                borderTop: '1px solid rgba(0,0,0,0.08)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <div>
                {createStep > 1 && (
                  <button
                    type="button"
                    onClick={() => setCreateStep((p) => p - 1)}
                    style={{
                      padding: '8px 16px',
                      borderRadius: '8px',
                      border: '1px solid rgba(0,0,0,0.14)',
                      backgroundColor: '#FFFFFF',
                      fontWeight: 600,
                      fontSize: '12.5px',
                      cursor: 'pointer'
                    }}
                  >
                    ← Back
                  </button>
                )}
              </div>

              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => {
                  if (createStep === 1) handleNextFromStep1();
                  else if (createStep === 2) handleNextFromStep2();
                  else if (createStep === 3) handleNextFromStep3();
                  else if (createStep === 4) handleNextFromStep4();
                  else if (createStep === 5) handleNextFromStep5();
                  else handleCreateProduct();
                }}
                style={{
                  padding: '9px 24px',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: '#004896',
                  color: '#FFFFFF',
                  fontWeight: 700,
                  fontSize: '13.5px',
                  cursor: 'pointer'
                }}
              >
                {createStep === 6 ? (isSubmitting ? 'Posting...' : 'Post now') : 'Next →'}
              </button>
            </div>

            {/* Cascading Brand -> Model -> Variant Overlay */}
            {bmvModalOpen && (
              <div
                style={{
                  position: 'fixed',
                  inset: 0,
                  zIndex: 10050,
                  backgroundColor: 'rgba(0,0,0,0.55)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '20px'
                }}
                onClick={() => setBmvModalOpen(false)}
              >
                <div
                  style={{
                    width: '100%',
                    maxWidth: '440px',
                    maxHeight: '78vh',
                    backgroundColor: '#FFFFFF',
                    borderRadius: '14px',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    boxShadow: '0 24px 60px rgba(0,0,0,0.3)'
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div style={{ padding: '14px 18px', borderBottom: '1px solid #E2E8F0', fontWeight: 700, fontSize: '14px', color: '#002F34' }}>
                    {resolvedCategoryName} &gt;{' '}
                    {bmvStep === 'brand'
                      ? 'Select Brand'
                      : bmvStep === 'model'
                        ? `${tempBrandObj?.brand} > Select Model`
                        : `${tempBrandObj?.brand} > ${tempModelObj?.model} > Select Variant`}
                  </div>
                  <div style={{ padding: '10px 16px', borderBottom: '1px solid #F1F5F9' }}>
                    <input
                      type="text"
                      placeholder={`Search ${bmvStep}...`}
                      value={bmvSearch}
                      onChange={(e) => setBmvSearch(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        borderRadius: '8px',
                        border: '1px solid #CBD5E1',
                        fontSize: '13px'
                      }}
                    />
                  </div>
                  <div style={{ flex: 1, overflowY: 'auto' }}>
                    {bmvStep === 'brand' &&
                      filteredBmvItems.map((b) => (
                        <button
                          key={b.brand}
                          type="button"
                          onClick={() => handleSelectBrand(b)}
                          style={{
                            width: '100%',
                            padding: '12px 18px',
                            border: 'none',
                            borderBottom: '1px solid #F1F5F9',
                            backgroundColor: '#FFFFFF',
                            textAlign: 'left',
                            fontSize: '13.5px',
                            fontWeight: 600,
                            color: '#002F34',
                            display: 'flex',
                            justifyContent: 'space-between',
                            cursor: 'pointer'
                          }}
                        >
                          <span>{b.brand}</span>
                          <span>›</span>
                        </button>
                      ))}
                    {bmvStep === 'model' &&
                      filteredBmvItems.map((m) => (
                        <button
                          key={m.model}
                          type="button"
                          onClick={() => handleSelectModel(m)}
                          style={{
                            width: '100%',
                            padding: '12px 18px',
                            border: 'none',
                            borderBottom: '1px solid #F1F5F9',
                            backgroundColor: '#FFFFFF',
                            textAlign: 'left',
                            fontSize: '13.5px',
                            fontWeight: 600,
                            color: '#002F34',
                            display: 'flex',
                            justifyContent: 'space-between',
                            cursor: 'pointer'
                          }}
                        >
                          <span>{m.model}</span>
                          <span>›</span>
                        </button>
                      ))}
                    {bmvStep === 'variant' &&
                      filteredBmvItems.map((v) => (
                        <button
                          key={v}
                          type="button"
                          onClick={() => handleSelectVariant(v)}
                          style={{
                            width: '100%',
                            padding: '12px 18px',
                            border: 'none',
                            borderBottom: '1px solid #F1F5F9',
                            backgroundColor: '#FFFFFF',
                            textAlign: 'left',
                            fontSize: '13.5px',
                            fontWeight: 600,
                            color: '#002F34',
                            cursor: 'pointer'
                          }}
                        >
                          {v}
                        </button>
                      ))}
                  </div>
                </div>
              </div>
            )}

            {/* Select Option Popup Dialog */}
            {selectDialogField && (
              <div
                style={{
                  position: 'fixed',
                  inset: 0,
                  zIndex: 10050,
                  backgroundColor: 'rgba(0,0,0,0.55)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '20px'
                }}
                onClick={() => setSelectDialogField(null)}
              >
                <div
                  style={{
                    width: '100%',
                    maxWidth: '380px',
                    backgroundColor: '#FFFFFF',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    boxShadow: '0 20px 50px rgba(0,0,0,0.3)'
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div style={{ padding: '16px 20px 10px', fontWeight: 700, fontSize: '14.5px', color: '#002F34' }}>
                    {resolvedCategoryName} &gt; {selectDialogField.label}
                  </div>
                  <div style={{ maxHeight: '320px', overflowY: 'auto' }}>
                    {(selectDialogField.options || []).map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => {
                          setCategoryAttributes((prev) => ({
                            ...prev,
                            [selectDialogField.key]: opt
                          }));
                          setSelectDialogField(null);
                        }}
                        style={{
                          width: '100%',
                          padding: '12px 20px',
                          border: 'none',
                          borderBottom: '1px solid #F1F5F9',
                          backgroundColor: '#FFFFFF',
                          textAlign: 'left',
                          fontSize: '13.5px',
                          color: '#002F34',
                          cursor: 'pointer'
                        }}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                  <div style={{ padding: '10px 20px 14px', textAlign: 'right' }}>
                    <button
                      type="button"
                      onClick={() => setSelectDialogField(null)}
                      style={{
                        border: 'none',
                        background: 'none',
                        fontWeight: 700,
                        fontSize: '12px',
                        color: '#002F34',
                        cursor: 'pointer'
                      }}
                    >
                      CANCEL
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Inspect Listing Modal */}
      {selectedListing && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9500,
            backgroundColor: 'rgba(0,0,0,0.45)',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}
          onClick={() => setSelectedListing(null)}
        >
          <div
            style={{
              maxWidth: '620px',
              width: '100%',
              maxHeight: '88vh',
              overflowY: 'auto',
              backgroundColor: '#FFFFFF',
              borderRadius: '18px',
              padding: '22px',
              boxShadow: '0 24px 60px rgba(0,0,0,0.25)',
              fontFamily: MAC_FONT
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
              <div>
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    padding: '3px 9px',
                    borderRadius: '999px',
                    backgroundColor: 'rgba(0,122,255,0.1)',
                    color: '#007AFF'
                  }}
                >
                  {selectedListing.category}
                </span>
                <h3 style={{ margin: '8px 0 2px', fontSize: '18px', fontWeight: 800, color: '#1D1D1F' }}>
                  {selectedListing.title}
                </h3>
                <div style={{ fontSize: '20px', fontWeight: 800, color: '#004896' }}>
                  {selectedListing.price}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedListing(null)}
                style={{
                  width: '30px',
                  height: '30px',
                  borderRadius: '999px',
                  border: 'none',
                  backgroundColor: '#F5F5F7',
                  cursor: 'pointer'
                }}
              >
                ×
              </button>
            </div>

            {/* Gallery */}
            <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', marginBottom: '16px' }}>
              {(selectedListing.allImages || [selectedListing.image]).map((img, i) => (
                <img
                  key={i}
                  src={img}
                  alt=""
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = DEFAULT_PRODUCT_PLACEHOLDER;
                  }}
                  style={{
                    width: '140px',
                    height: '105px',
                    borderRadius: '10px',
                    objectFit: 'cover',
                    border: '1px solid rgba(0,0,0,0.08)',
                    flexShrink: 0
                  }}
                />
              ))}
            </div>

            {/* Category Attributes Grid */}
            {selectedListing.attributes && Object.keys(selectedListing.attributes).length > 0 && (
              <div style={{ marginBottom: '16px' }}>
                <div style={{ fontSize: '11.5px', fontWeight: 700, color: '#86868B', textTransform: 'uppercase', marginBottom: '8px' }}>
                  Category Seller Form Specifications
                </div>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '8px',
                    padding: '12px',
                    borderRadius: '12px',
                    backgroundColor: '#F5F5F7'
                  }}
                >
                  {Object.entries(selectedListing.attributes).map(([k, v]) => (
                    <div key={k} style={{ fontSize: '12.5px' }}>
                      <span style={{ color: '#6E6E73', textTransform: 'capitalize' }}>{k}: </span>
                      <strong style={{ color: '#1D1D1F' }}>{String(v)}</strong>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '11.5px', fontWeight: 700, color: '#86868B', textTransform: 'uppercase', marginBottom: '6px' }}>
                Description
              </div>
              <div style={{ fontSize: '13px', color: '#1D1D1F', whiteSpace: 'pre-line', lineHeight: 1.55 }}>
                {selectedListing.description}
              </div>
            </div>

            <div
              style={{
                padding: '12px',
                borderRadius: '10px',
                backgroundColor: '#F5F5F7',
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '12.5px'
              }}
            >
              <span>
                Seller: <strong>{selectedListing.seller}</strong> ({selectedListing.sellerPhone})
              </span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <MapPin size={12} />
                <span>{selectedListing.location}</span>
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteCandidate && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9600,
            backgroundColor: 'rgba(0,0,0,0.45)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}
          onClick={() => setDeleteCandidate(null)}
        >
          <div
            style={{
              maxWidth: '400px',
              width: '100%',
              backgroundColor: '#FFFFFF',
              borderRadius: '16px',
              padding: '20px',
              fontFamily: MAC_FONT
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ margin: '0 0 8px', fontSize: '16px', color: '#FF3B30' }}>Remove Listing?</h3>
            <p style={{ margin: '0 0 18px', fontSize: '13px', color: '#3A3A3C' }}>
              Are you sure you want to permanently delete <strong>"{deleteCandidate.title}"</strong> from the live database?
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <button
                type="button"
                onClick={() => setDeleteCandidate(null)}
                style={{
                  padding: '7px 14px',
                  borderRadius: '8px',
                  border: '1px solid rgba(0,0,0,0.14)',
                  backgroundColor: '#FFFFFF',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                style={{
                  padding: '7px 16px',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: '#FF3B30',
                  color: '#FFFFFF',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
