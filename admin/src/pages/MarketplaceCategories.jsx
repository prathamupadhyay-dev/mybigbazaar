import React, { useState, useEffect, useMemo } from 'react';
import { apiFetch } from '../utils/api';
import PageHeader from '../components/ui/PageHeader';
import {
  Car, Bike, Truck, Bus, Plane, Train,
  Home, Building, Building2, Landmark, Warehouse, Key,
  Smartphone, Laptop, Tv, Tablet, Headphones, Camera, Watch, Speaker, Gamepad2, Cpu,
  Briefcase, Wrench, Hammer, GraduationCap, UserCheck, HardHat,
  Shirt, ShoppingBag, Glasses, Footprints, Scissors,
  Armchair, Bed, Lamp, Sofa,
  PawPrint, Dog, Cat, Fish,
  Trophy, BookOpen, Dumbbell, Music, Palette, Film, Compass,
  Tag, Gift, Heart, Sparkles, Star, ShieldCheck, Utensils, Coffee, Package, Box,
  Layers, Plus, Search, Edit2, Trash2, CheckCircle2, XCircle, Upload, Image as ImageIcon,
  Check, X, Eye, ArrowUpDown, ChevronRight, FolderTree, ChevronUp, ChevronDown
} from 'lucide-react';

// ==========================================
// 60+ Categorized Icon Registry for Admin
// ==========================================
export const ICON_CATALOG = [
  // Vehicles
  { id: 'car-sport', name: 'car-sport', label: 'Car / Auto', group: 'vehicles', icon: Car },
  { id: 'bicycle', name: 'bicycle', label: 'Bicycle / Bike', group: 'vehicles', icon: Bike },
  { id: 'bus', name: 'bus', label: 'Bus / Commercial', group: 'vehicles', icon: Bus },
  { id: 'truck', name: 'truck', label: 'Truck', group: 'vehicles', icon: Truck },
  { id: 'airplane', name: 'airplane', label: 'Airplane', group: 'vehicles', icon: Plane },
  { id: 'train', name: 'train', label: 'Train', group: 'vehicles', icon: Train },

  // Real Estate & Property
  { id: 'business', name: 'business', label: 'Building / Property', group: 'property', icon: Building2 },
  { id: 'home', name: 'home', label: 'House / Home', group: 'property', icon: Home },
  { id: 'building', name: 'building', label: 'Commercial Complex', group: 'property', icon: Building },
  { id: 'landmark', name: 'landmark', label: 'Landmark / Plots', group: 'property', icon: Landmark },
  { id: 'warehouse', name: 'warehouse', label: 'Warehouse / Storage', group: 'property', icon: Warehouse },
  { id: 'key', name: 'key', label: 'Rental Key', group: 'property', icon: Key },

  // Mobiles & Tech
  { id: 'phone-portrait', name: 'phone-portrait', label: 'Mobile / Phone', group: 'tech', icon: Smartphone },
  { id: 'laptop', name: 'laptop', label: 'Laptop / PC', group: 'tech', icon: Laptop },
  { id: 'tv', name: 'tv', label: 'TV / Appliances', group: 'tech', icon: Tv },
  { id: 'tablet', name: 'tablet', label: 'Tablet / iPad', group: 'tech', icon: Tablet },
  { id: 'headphones', name: 'headphones', label: 'Headphones', group: 'tech', icon: Headphones },
  { id: 'camera', name: 'camera', label: 'Camera / Photo', group: 'tech', icon: Camera },
  { id: 'watch', name: 'watch', label: 'Smart Watch', group: 'tech', icon: Watch },
  { id: 'speaker', name: 'speaker', label: 'Audio Speaker', group: 'tech', icon: Speaker },
  { id: 'gamepad', name: 'gamepad', label: 'Gaming Console', group: 'tech', icon: Gamepad2 },
  { id: 'cpu', name: 'cpu', label: 'Gadgets & Parts', group: 'tech', icon: Cpu },

  // Jobs & Services
  { id: 'briefcase', name: 'briefcase', label: 'Jobs & Careers', group: 'services', icon: Briefcase },
  { id: 'construct', name: 'construct', label: 'Services / Repair', group: 'services', icon: Wrench },
  { id: 'hammer', name: 'hammer', label: 'Carpentry / Hardware', group: 'services', icon: Hammer },
  { id: 'school', name: 'school', label: 'Education / Classes', group: 'services', icon: GraduationCap },
  { id: 'user-check', name: 'user-check', label: 'Verified Staff', group: 'services', icon: UserCheck },
  { id: 'hardhat', name: 'hardhat', label: 'Civil / Labour', group: 'services', icon: HardHat },

  // Fashion & Beauty
  { id: 'shirt', name: 'shirt', label: 'Clothing / Fashion', group: 'fashion', icon: Shirt },
  { id: 'bag', name: 'bag', label: 'Bags & Luggage', group: 'fashion', icon: ShoppingBag },
  { id: 'glasses', name: 'glasses', label: 'Eyewear & Accessories', group: 'fashion', icon: Glasses },
  { id: 'footprints', name: 'footprints', label: 'Footwear & Shoes', group: 'fashion', icon: Footprints },
  { id: 'scissors', name: 'scissors', label: 'Salon & Grooming', group: 'fashion', icon: Scissors },

  // Furniture & Home Living
  { id: 'bed', name: 'bed', label: 'Beds & Wardrobes', group: 'home', icon: Bed },
  { id: 'sofa', name: 'sofa', label: 'Sofas & Living Room', group: 'home', icon: Sofa },
  { id: 'armchair', name: 'armchair', label: 'Chairs & Tables', group: 'home', icon: Armchair },
  { id: 'lamp', name: 'lamp', label: 'Lighting & Decor', group: 'home', icon: Lamp },

  // Pets & Animals
  { id: 'paw', name: 'paw', label: 'Pets & Supplies', group: 'pets', icon: PawPrint },
  { id: 'dog', name: 'dog', label: 'Dogs & Puppies', group: 'pets', icon: Dog },
  { id: 'cat', name: 'cat', label: 'Cats & Kittens', group: 'pets', icon: Cat },
  { id: 'fish', name: 'fish', label: 'Aquarium & Fish', group: 'pets', icon: Fish },

  // Hobbies, Sports & Books
  { id: 'football', name: 'football', label: 'Sports & Games', group: 'hobbies', icon: Trophy },
  { id: 'book', name: 'book', label: 'Books & Literature', group: 'hobbies', icon: BookOpen },
  { id: 'barbell', name: 'barbell', label: 'Gym & Fitness', group: 'hobbies', icon: Dumbbell },
  { id: 'music', name: 'music', label: 'Musical Instruments', group: 'hobbies', icon: Music },
  { id: 'palette', name: 'palette', label: 'Art & Craft', group: 'hobbies', icon: Palette },
  { id: 'film', name: 'film', label: 'Entertainment', group: 'hobbies', icon: Film },
  { id: 'compass', name: 'compass', label: 'Travel & Outdoor', group: 'hobbies', icon: Compass },

  // General & Badges
  { id: 'tag', name: 'tag', label: 'Special Deals', group: 'general', icon: Tag },
  { id: 'gift', name: 'gift', label: 'Gifts & Toys', group: 'general', icon: Gift },
  { id: 'heart', name: 'heart', label: 'Health & Wellness', group: 'general', icon: Heart },
  { id: 'sparkles', name: 'sparkles', label: 'Premium Listings', group: 'general', icon: Sparkles },
  { id: 'star', name: 'star', label: 'Featured Category', group: 'general', icon: Star },
  { id: 'shield', name: 'shield', label: 'Verified Safe-Deal', group: 'general', icon: ShieldCheck },
  { id: 'utensils', name: 'utensils', label: 'Food & Dining', group: 'general', icon: Utensils },
  { id: 'coffee', name: 'coffee', label: 'Cafe & Snacks', group: 'general', icon: Coffee },
  { id: 'package', name: 'package', label: 'Courier & Parcel', group: 'general', icon: Package },
  { id: 'box', name: 'box', label: 'Miscellaneous Box', group: 'general', icon: Box },
];

const ICON_GROUPS = [
  { id: 'all', label: 'All Icons' },
  { id: 'vehicles', label: 'Vehicles' },
  { id: 'property', label: 'Property' },
  { id: 'tech', label: 'Tech & Mobiles' },
  { id: 'services', label: 'Jobs & Services' },
  { id: 'fashion', label: 'Fashion' },
  { id: 'home', label: 'Furniture' },
  { id: 'pets', label: 'Pets' },
  { id: 'hobbies', label: 'Sports & Books' },
  { id: 'general', label: 'General' },
];

// Helper to find icon component by string name
export function getLucideIcon(iconName) {
  if (!iconName) return Layers;
  const match = ICON_CATALOG.find(
    i => i.id === iconName || i.name === iconName || i.label.toLowerCase().includes(iconName.toLowerCase())
  );
  return match ? match.icon : Layers;
}

// Color palette for category cards & badges
const BADGE_COLORS = [
  { text: '#DC2626', bg: '#FEE2E2', border: '#FECACA' },
  { text: '#2563EB', bg: '#EFF6FF', border: '#DBEAFE' },
  { text: '#059669', bg: '#ECFDF5', border: '#D1FAE5' },
  { text: '#D97706', bg: '#FEF3C7', border: '#FDE68A' },
  { text: '#7C3AED', bg: '#F5F3FF', border: '#EDE9FE' },
  { text: '#E11D48', bg: '#FFE4E6', border: '#FECDD3' },
  { text: '#EA580C', bg: '#FFF7ED', border: '#FFEDD5' },
  { text: '#0891B2', bg: '#ECFEFF', border: '#CFFAFE' },
  { text: '#16A34A', bg: '#F0FDF4', border: '#DCFCE7' },
  { text: '#BE185D', bg: '#FCE7F3', border: '#FBCFE8' },
  { text: '#4F46E5', bg: '#EEF2FF', border: '#E0E7FF' },
  { text: '#0284C7', bg: '#E0F2FE', border: '#BAE6FD' },
];

export default function MarketplaceCategories() {
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [toast, setToast] = useState(null);

  // Add / Edit Modal
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    title: '',
    slug: '',
    visualType: 'icon', // 'icon' or 'image'
    icon: 'car-sport',
    imageUrl: '',
    sortOrder: 1,
    status: 'Active',
    commissionRate: 10
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);

  // Icon Picker Filtering
  const [iconSearch, setIconSearch] = useState('');
  const [activeIconGroup, setActiveIconGroup] = useState('all');

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchCategories = async () => {
    setIsLoading(true);
    setErrorMessage('');
    try {
      const catRes = await apiFetch('/product-category/get-all?includeInactive=true').catch(() => null);

      let catData = [];
      if (catRes && catRes.ok) {
        const catJson = await catRes.json().catch(() => ({}));
        if (catJson && catJson.success && Array.isArray(catJson.data)) {
          catData = catJson.data;
        } else if (Array.isArray(catJson)) {
          catData = catJson;
        }
      }

      const mapped = catData.map((item, index) => {
        const catId = item._id || item.id;
        const hasImage = Array.isArray(item.images) && item.images.length > 0
          ? item.images[0]
          : (item.image || (item.icon && (item.icon.startsWith('http') || item.icon.startsWith('/uploads')) ? item.icon : null));

        return {
          id: catId,
          _id: catId,
          name: item.name || '',
          title: item.title || item.name || '',
          slug: item.slug || (item.name ? item.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') : ''),
          icon: item.icon || 'car-sport',
          image: hasImage,
          images: Array.isArray(item.images) ? item.images : (hasImage ? [hasImage] : []),
          sortOrder: item.sortOrder ?? index + 1,
          status: item.isActive !== false ? 'Active' : 'Inactive',
          commissionRate: item.commissionRate ?? 10
        };
      });

      // Sort by sortOrder
      mapped.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
      setCategories(mapped);
    } catch (err) {
      setErrorMessage(err.message || 'Failed to load categories from live backend');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // Separate active and inactive categories
  const activeCategories = useMemo(() => {
    return categories
      .filter(c => c.status === 'Active')
      .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
  }, [categories]);

  const inactiveCategories = useMemo(() => {
    return categories.filter(c => c.status !== 'Active');
  }, [categories]);

  // Filter Categories (Active categories listed first in slot order)
  const filteredCategories = useMemo(() => {
    const list = statusFilter === 'Active'
      ? activeCategories
      : statusFilter === 'Inactive'
      ? inactiveCategories
      : [...activeCategories, ...inactiveCategories];

    if (!searchTerm.trim()) return list;
    return list.filter(c =>
      (c.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.slug || '').toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [activeCategories, inactiveCategories, statusFilter, searchTerm]);

  // Filter Icons in Picker
  const visibleIcons = useMemo(() => {
    return ICON_CATALOG.filter(icon => {
      const matchGroup = activeIconGroup === 'all' || icon.group === activeIconGroup;
      const matchSearch = icon.label.toLowerCase().includes(iconSearch.toLowerCase()) ||
        icon.id.toLowerCase().includes(iconSearch.toLowerCase());
      return matchGroup && matchSearch;
    });
  }, [activeIconGroup, iconSearch]);

  // Open Add Modal
  const handleOpenAdd = () => {
    setEditingCategory(null);
    setFormData({
      name: '',
      title: '',
      slug: '',
      visualType: 'icon',
      icon: 'car-sport',
      imageUrl: '',
      sortOrder: activeCategories.length + 1,
      status: 'Active',
      commissionRate: 10
    });
    setSelectedFile(null);
    setPreviewImage(null);
    setIconSearch('');
    setActiveIconGroup('all');
    setShowModal(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (c) => {
    setEditingCategory(c);
    const hasImg = !!c.image;
    setFormData({
      name: c.name || '',
      title: c.title || c.name || '',
      slug: c.slug || '',
      visualType: hasImg ? 'image' : 'icon',
      icon: c.icon || 'car-sport',
      imageUrl: hasImg ? c.image : '',
      sortOrder: c.sortOrder ?? 1,
      status: c.status || 'Active',
      commissionRate: c.commissionRate ?? 10
    });
    setSelectedFile(null);
    setPreviewImage(hasImg ? c.image : null);
    setIconSearch('');
    setActiveIconGroup('all');
    setShowModal(true);
  };

  // Image File Upload Change
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const objectUrl = URL.createObjectURL(file);
      setPreviewImage(objectUrl);
      setFormData(prev => ({ ...prev, visualType: 'image' }));
    }
  };

  // Remove Image
  const handleRemoveImage = () => {
    setSelectedFile(null);
    setPreviewImage(null);
    setFormData(prev => ({ ...prev, imageUrl: '', visualType: 'icon' }));
  };

  // Move Category Slot Up or Down (instant swap among active categories)
  const handleMoveSlot = async (cat, direction) => {
    const activeCats = categories.filter(c => c.status === 'Active');
    const currentIndex = activeCats.findIndex(c => c.id === cat.id);
    if (currentIndex === -1) return;

    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= activeCats.length) return;

    // Swap positions
    const newActives = [...activeCats];
    const temp = newActives[currentIndex];
    newActives[currentIndex] = newActives[targetIndex];
    newActives[targetIndex] = temp;

    // Resequence sortOrder
    const updatedActives = newActives.map((c, idx) => ({
      ...c,
      sortOrder: idx + 1
    }));

    const inactives = categories.filter(c => c.status !== 'Active');
    const combined = [...updatedActives, ...inactives];
    setCategories(combined);

    try {
      const orderedIds = updatedActives.map(c => c.id || c._id);
      await apiFetch('/product-category/reorder', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderedIds, categoryIds: orderedIds })
      });
      showToast(`Category display order updated (${cat.name} moved ${direction}).`);
    } catch (err) {
      console.warn('Reorder failed:', err);
      showToast('Failed to save order on server: ' + err.message, 'error');
      fetchCategories();
    }
  };

  // Toggle Category Status (macOS Slide Switch with slot resequencing)
  const handleToggleStatus = async (cat) => {
    const isCurrentlyActive = cat.status === 'Active';
    const newStatus = isCurrentlyActive ? 'Inactive' : 'Active';
    const activeCats = categories.filter(c => c.status === 'Active');

    let updatedList;
    if (isCurrentlyActive) {
      // Removing from active slots -> resequence remaining active slots
      const remainingActives = activeCats
        .filter(c => c.id !== cat.id)
        .map((c, idx) => ({ ...c, sortOrder: idx + 1 }));
      const deactivated = { ...cat, status: 'Inactive', sortOrder: null };
      const inactives = categories.filter(c => c.status !== 'Active' && c.id !== cat.id);
      updatedList = [...remainingActives, deactivated, ...inactives];
    } else {
      // Activating -> append to the next active slot
      const activated = { ...cat, status: 'Active', sortOrder: activeCats.length + 1 };
      const inactives = categories.filter(c => c.status !== 'Active' && c.id !== cat.id);
      updatedList = [...activeCats, activated, ...inactives];
    }

    setCategories(updatedList);

    try {
      // Update status and sortOrder on server
      await apiFetch(`/product-category/update/${cat.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: newStatus,
          isActive: newStatus === 'Active',
          sortOrder: newStatus === 'Active' ? activeCats.length + 1 : 9999
        })
      });

      // Persist the reordered active list so mobile app immediately reflects new order
      const activeIds = updatedList.filter(c => c.status === 'Active').map(c => c.id || c._id);
      if (activeIds.length > 0) {
        await apiFetch('/product-category/reorder', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orderedIds: activeIds, categoryIds: activeIds })
        });
      }

      showToast(
        newStatus === 'Active'
          ? `"${cat.name}" turned ON (assigned to Slot #${activeCats.length + 1}).`
          : `"${cat.name}" turned OFF (hidden from mobile app).`
      );
    } catch (err) {
      console.warn('Status toggle error:', err);
      showToast('Error updating status: ' + err.message, 'error');
      fetchCategories();
    }
  };

  // Save Category (Create or Update)
  const handleSaveCategory = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      showToast('Category name is required', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const finalIcon = formData.visualType === 'image' && previewImage ? previewImage : formData.icon;

      if (selectedFile) {
        // Multipart FormData for uploaded file
        const data = new FormData();
        data.append('name', formData.name.trim());
        data.append('title', (formData.title || formData.name).trim());
        data.append('sortOrder', String(formData.sortOrder || 1));
        data.append('status', formData.status);
        data.append('isActive', String(formData.status === 'Active'));
        data.append('commissionRate', String(formData.commissionRate || 10));
        data.append('images', selectedFile);
        data.append('icon', finalIcon);

        const url = editingCategory
          ? `/product-category/update/${editingCategory.id}`
          : '/product-category/create';
        const method = editingCategory ? 'PUT' : 'POST';

        const res = await apiFetch(url, { method, body: data });
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.message || 'Operation failed');
        }
      } else {
        // JSON Payload
        const payload = {
          name: formData.name.trim(),
          title: (formData.title || formData.name).trim(),
          sortOrder: Number(formData.sortOrder) || 1,
          status: formData.status,
          isActive: formData.status === 'Active',
          commissionRate: Number(formData.commissionRate) || 10,
          icon: formData.visualType === 'icon' ? formData.icon : (formData.imageUrl || finalIcon),
          image: formData.visualType === 'image' ? (formData.imageUrl || previewImage) : undefined
        };

        const url = editingCategory
          ? `/product-category/update/${editingCategory.id}`
          : '/product-category/create';
        const method = editingCategory ? 'PUT' : 'POST';

        const res = await apiFetch(url, {
          method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.message || 'Operation failed');
        }
      }

      showToast(editingCategory ? `Category "${formData.name}" updated!` : `Category "${formData.name}" created!`);
      setShowModal(false);
      setEditingCategory(null);
      await fetchCategories();
    } catch (err) {
      showToast('Error saving category: ' + err.message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete Category
  const handleDeleteCategory = async () => {
    if (!deleteConfirm) return;
    try {
      const res = await apiFetch(`/product-category/delete/${deleteConfirm.id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        showToast(`Category "${deleteConfirm.name}" deleted.`);
        setDeleteConfirm(null);
        await fetchCategories();
      } else {
        showToast('Failed to delete category', 'error');
      }
    } catch (err) {
      showToast('Error deleting category: ' + err.message, 'error');
    }
  };

  return (
    <div className="admin-page" style={{ padding: '0 0 48px 0' }}>
      {/* Toast Notification (macOS Floating Glass Pill) */}
      {toast && (
        <div style={{
          position: 'fixed',
          bottom: '28px',
          right: '28px',
          zIndex: 99999,
          backgroundColor: 'rgba(255, 255, 255, 0.94)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          color: '#1C1917',
          border: '1px solid rgba(0, 0, 0, 0.08)',
          padding: '12px 20px',
          borderRadius: '12px',
          boxShadow: '0 16px 40px rgba(0,0,0,0.14), 0 2px 6px rgba(0,0,0,0.04)',
          fontWeight: 600,
          fontSize: '0.86rem',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          {toast.type === 'error' ? (
            <XCircle size={18} color="#EF4444" strokeWidth={2.2} />
          ) : (
            <CheckCircle2 size={18} color="#10B981" strokeWidth={2.4} />
          )}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Page Header (Clean macOS minimal header - No subtitle fluff, no sub-tabs) */}
      <PageHeader
        title="Categories"
        breadcrumbs={['Marketplace', 'Categories']}
      >
        <button
          onClick={handleOpenAdd}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: '#0078FF',
            color: '#FFFFFF',
            border: 'none',
            padding: '9px 18px',
            borderRadius: '10px',
            fontSize: '13px',
            fontWeight: 600,
            cursor: 'pointer',
            boxShadow: '0 2px 6px rgba(0, 120, 255, 0.25)',
            transition: 'all 140ms ease'
          }}
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#0066DC'; }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#0078FF'; }}
        >
          <Plus size={16} strokeWidth={2.5} />
          <span>Add Category</span>
        </button>
      </PageHeader>

      {/* KPI Cards (macOS frosted glass cards) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
        gap: '14px',
        marginBottom: '20px'
      }}>
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '14px',
          border: '1px solid #E7E5E4',
          padding: '16px 18px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
        }}>
          <div style={{ fontSize: '11px', color: '#6F6A65', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.04em' }}>
            Total Categories
          </div>
          <div style={{ fontSize: '24px', fontWeight: 700, color: '#1C1917', marginTop: '6px' }}>
            {categories.length}
          </div>
        </div>

        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '14px',
          border: '1px solid #E7E5E4',
          padding: '16px 18px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
        }}>
          <div style={{ fontSize: '11px', color: '#6F6A65', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.04em' }}>
            Active on App
          </div>
          <div style={{ fontSize: '24px', fontWeight: 700, color: '#059669', marginTop: '6px' }}>
            {categories.filter(c => c.status === 'Active').length}
          </div>
        </div>

        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '14px',
          border: '1px solid #E7E5E4',
          padding: '16px 18px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
        }}>
          <div style={{ fontSize: '11px', color: '#6F6A65', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.04em' }}>
            Inactive (Off App)
          </div>
          <div style={{ fontSize: '24px', fontWeight: 700, color: '#8E8E93', marginTop: '6px' }}>
            {inactiveCategories.length}
          </div>
        </div>
      </div>

      {/* Main Table Container (macOS Restrained Card) */}
      <div style={{
        backgroundColor: '#FFFFFF',
        borderRadius: '14px',
        border: '1px solid #E7E5E4',
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
        overflow: 'hidden'
      }}>
        {/* Search & Filter Bar */}
        <div style={{
          padding: '14px 18px',
          borderBottom: '1px solid #E7E5E4',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          {/* Search Box */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: '#F6F5F2',
            padding: '7px 14px',
            borderRadius: '9px',
            border: '1px solid #E7E5E4',
            width: '280px'
          }}>
            <Search size={15} color="#6F6A65" />
            <input
              type="text"
              placeholder="Search categories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                border: 'none',
                background: 'transparent',
                outline: 'none',
                fontSize: '13px',
                width: '100%',
                color: '#1C1917'
              }}
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
              >
                <X size={14} color="#6F6A65" />
              </button>
            )}
          </div>

          {/* Status Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '12px', color: '#6F6A65', fontWeight: 600 }}>Status:</span>
            {['All', 'Active', 'Inactive'].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                style={{
                  padding: '5px 12px',
                  borderRadius: '7px',
                  fontSize: '12px',
                  fontWeight: 600,
                  border: 'none',
                  cursor: 'pointer',
                  backgroundColor: statusFilter === status ? '#0B2545' : '#F6F5F2',
                  color: statusFilter === status ? '#FFFFFF' : '#6F6A65',
                  transition: 'all 120ms ease'
                }}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {/* Categories Table */}
        {isLoading ? (
          <div style={{ padding: '60px 20px', textAlign: 'center', color: '#6F6A65', fontSize: '13px' }}>
            Loading categories from database...
          </div>
        ) : filteredCategories.length === 0 ? (
          <div style={{ padding: '60px 20px', textAlign: 'center' }}>
            <div style={{ fontSize: '14px', fontWeight: 600, color: '#1C1917' }}>No categories found</div>
            <div style={{ fontSize: '12px', color: '#6F6A65', marginTop: '4px' }}>
              {searchTerm ? 'Try adjusting your search criteria' : 'Click "Add Category" above to create your first category'}
            </div>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
              <thead>
                <tr style={{ backgroundColor: '#FBFBFA', borderBottom: '1px solid #E7E5E4' }}>
                  <th style={{ padding: '10px 18px', fontWeight: 600, color: '#57534E', width: '70px' }}>Icon</th>
                  <th style={{ padding: '10px 18px', fontWeight: 600, color: '#57534E' }}>Category Name</th>
                  <th style={{ padding: '10px 18px', fontWeight: 600, color: '#57534E' }}>Slug</th>
                  <th style={{ padding: '10px 18px', fontWeight: 600, color: '#57534E', width: '140px' }}>Slot / Order</th>
                  <th style={{ padding: '10px 18px', fontWeight: 600, color: '#57534E', textAlign: 'center', width: '160px' }}>Status</th>
                  <th style={{ padding: '10px 18px', fontWeight: 600, color: '#57534E', textAlign: 'right', width: '140px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCategories.map((cat, idx) => {
                  const IconComponent = getLucideIcon(cat.icon);
                  const colorScheme = BADGE_COLORS[idx % BADGE_COLORS.length];
                  const isActive = cat.status === 'Active';
                  const activeIdx = activeCategories.findIndex(c => c.id === cat.id);
                  const slotNum = activeIdx !== -1 ? activeIdx + 1 : (cat.sortOrder ?? idx + 1);
                  const isFirstActive = activeIdx === 0;
                  const isLastActive = activeIdx === activeCategories.length - 1;

                  return (
                    <tr
                      key={cat.id || idx}
                      style={{
                        borderBottom: '1px solid #F1EFEA',
                        transition: 'background-color 100ms ease'
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#FAF9F6'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                    >
                      {/* Icon / Image Thumbnail */}
                      <td style={{ padding: '12px 18px' }}>
                        {cat.image ? (
                          <div style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '10px',
                            overflow: 'hidden',
                            border: '1px solid #E7E5E4',
                            backgroundColor: '#FFFFFF',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}>
                            <img
                              src={cat.image}
                              alt={cat.name}
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                              onError={(e) => {
                                e.target.style.display = 'none';
                              }}
                            />
                          </div>
                        ) : (
                          <div style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '10px',
                            backgroundColor: colorScheme.bg,
                            border: `1px solid ${colorScheme.border}`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: colorScheme.text
                          }}>
                            <IconComponent size={20} strokeWidth={2} />
                          </div>
                        )}
                      </td>

                      {/* Name */}
                      <td style={{ padding: '12px 18px' }}>
                        <div style={{ fontWeight: 600, color: '#1C1917', fontSize: '13.5px' }}>
                          {cat.name}
                        </div>
                        {cat.title && cat.title !== cat.name && (
                          <div style={{ fontSize: '11.5px', color: '#6F6A65', marginTop: '1px' }}>
                            {cat.title}
                          </div>
                        )}
                      </td>

                      {/* Slug */}
                      <td style={{ padding: '12px 18px' }}>
                        <span style={{
                          fontFamily: 'monospace',
                          fontSize: '12px',
                          color: '#57534E',
                          backgroundColor: '#F6F5F2',
                          padding: '3px 7px',
                          borderRadius: '5px'
                        }}>
                          {cat.slug || cat.name?.toLowerCase().replace(/\s+/g, '-')}
                        </span>
                      </td>

                      {/* Slot / Order with Reorder Controls strictly for Active Slots */}
                      <td style={{ padding: '12px 18px' }}>
                        {isActive ? (
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                            <span
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                padding: '3px 9px',
                                borderRadius: '7px',
                                backgroundColor: 'rgba(0, 122, 255, 0.08)',
                                color: '#007AFF',
                                fontSize: '12px',
                                fontWeight: 700,
                                fontFamily: 'SF Pro Text, -apple-system, monospace'
                              }}
                            >
                              Slot #{slotNum}
                            </span>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                              <button
                                type="button"
                                disabled={isFirstActive}
                                onClick={() => handleMoveSlot(cat, 'up')}
                                style={{
                                  width: '20px',
                                  height: '16px',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  border: '1px solid rgba(0,0,0,0.1)',
                                  borderRadius: '4px',
                                  backgroundColor: isFirstActive ? 'transparent' : '#FFFFFF',
                                  color: isFirstActive ? '#C7C7CC' : '#48484A',
                                  cursor: isFirstActive ? 'not-allowed' : 'pointer'
                                }}
                                title="Move Slot Up"
                              >
                                <ChevronUp size={12} />
                              </button>
                              <button
                                type="button"
                                disabled={isLastActive}
                                onClick={() => handleMoveSlot(cat, 'down')}
                                style={{
                                  width: '20px',
                                  height: '16px',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  border: '1px solid rgba(0,0,0,0.1)',
                                  borderRadius: '4px',
                                  backgroundColor: isLastActive ? 'transparent' : '#FFFFFF',
                                  color: isLastActive ? '#C7C7CC' : '#48484A',
                                  cursor: isLastActive ? 'not-allowed' : 'pointer'
                                }}
                                title="Move Slot Down"
                              >
                                <ChevronDown size={12} />
                              </button>
                            </div>
                          </div>
                        ) : (
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '5px',
                              padding: '3px 9px',
                              borderRadius: '7px',
                              backgroundColor: 'rgba(142, 142, 147, 0.12)',
                              color: '#636366',
                              fontSize: '11.5px',
                              fontWeight: 600
                            }}
                          >
                            <Layers size={11} color="#8E8E93" />
                            <span>Off App</span>
                          </span>
                        )}
                      </td>

                      {/* SINGLE Status Column with macOS Slide Toggle */}
                      <td style={{ textAlign: 'center', padding: '12px 18px' }}>
                        <div
                          onClick={() => handleToggleStatus(cat)}
                          title={isActive ? 'Click to turn OFF (Hide from Mobile App)' : 'Click to turn ON (Display on Mobile App)'}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '10px',
                            cursor: 'pointer',
                            padding: '4px 8px',
                            borderRadius: '8px',
                            transition: 'background-color 150ms ease'
                          }}
                        >
                          <div
                            role="switch"
                            aria-checked={isActive}
                            tabIndex={0}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                handleToggleStatus(cat);
                              }
                            }}
                            style={{
                              position: 'relative',
                              width: '44px',
                              height: '24px',
                              borderRadius: '999px',
                              backgroundColor: isActive ? '#34C759' : '#D1D1D6',
                              transition: 'background-color 220ms cubic-bezier(0.16, 1, 0.3, 1)',
                              boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.1)',
                              userSelect: 'none',
                              flexShrink: 0
                            }}
                          >
                            <div
                              style={{
                                position: 'absolute',
                                top: '2px',
                                left: isActive ? '22px' : '2px',
                                width: '20px',
                                height: '20px',
                                borderRadius: '50%',
                                backgroundColor: '#FFFFFF',
                                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.25)',
                                transition: 'left 220ms cubic-bezier(0.16, 1, 0.3, 1)'
                              }}
                            />
                          </div>

                          <div style={{ textAlign: 'left' }}>
                            <div
                              style={{
                                fontSize: '12.5px',
                                fontWeight: 600,
                                color: isActive ? '#248A3D' : '#8E8E93',
                                lineHeight: 1.2
                              }}
                            >
                              {isActive ? 'Active' : 'Inactive'}
                            </div>
                            <div style={{ fontSize: '10px', color: '#8E8E93', marginTop: '1px' }}>
                              {isActive ? 'Switch to Off' : 'Switch to On'}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Actions: macOS Rounded Square Styled Buttons */}
                      <td style={{ padding: '12px 18px', textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                          {/* macOS Edit Button (Apple Blue) */}
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(cat)}
                            title="Edit Category"
                            style={{
                              width: '32px',
                              height: '32px',
                              borderRadius: '8px',
                              border: '1px solid rgba(0, 122, 255, 0.25)',
                              backgroundColor: 'rgba(0, 122, 255, 0.08)',
                              color: '#007AFF',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: 'pointer',
                              boxShadow: '0 1px 2px rgba(0, 122, 255, 0.06)',
                              transition: 'all 120ms ease'
                            }}
                          >
                            <Edit2 size={14} />
                          </button>

                          {/* macOS Delete Button (Apple Red) */}
                          <button
                            type="button"
                            onClick={() => setDeleteConfirm(cat)}
                            title="Delete Category"
                            style={{
                              width: '32px',
                              height: '32px',
                              borderRadius: '8px',
                              border: '1px solid rgba(255, 59, 48, 0.25)',
                              backgroundColor: 'rgba(255, 59, 48, 0.08)',
                              color: '#FF3B30',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: 'pointer',
                              boxShadow: '0 1px 2px rgba(255, 59, 48, 0.06)',
                              transition: 'all 120ms ease'
                            }}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ========================================================= */}
      {/* ADD / EDIT CATEGORY MODAL (macOS Sheet Style)             */}
      {/* ========================================================= */}
      {showModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.4)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            border: '1px solid rgba(0,0,0,0.08)',
            boxShadow: '0 24px 60px rgba(0,0,0,0.22)',
            width: '100%',
            maxWidth: '640px',
            maxHeight: '90vh',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            animation: 'fadeIn 150ms ease'
          }}>
            {/* Modal Header */}
            <div style={{
              padding: '16px 20px',
              borderBottom: '1px solid #E7E5E4',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: '#FBFBFA'
            }}>
              <div>
                <div style={{ fontSize: '15px', fontWeight: 700, color: '#1C1917' }}>
                  {editingCategory ? 'Edit Category' : 'Add New Category'}
                </div>
                <div style={{ fontSize: '12px', color: '#6F6A65', marginTop: '2px' }}>
                  Syncs dynamically across Mobile App and Admin Panel
                </div>
              </div>
              <button
                onClick={() => setShowModal(false)}
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  border: 'none',
                  backgroundColor: '#EEEDE9',
                  color: '#6F6A65',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer'
                }}
              >
                <X size={15} />
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <form onSubmit={handleSaveCategory} style={{ display: 'flex', flexDirection: 'column', flex: 1, overflowY: 'auto' }}>
              <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
                {/* Category Name & Title */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#1C1917', marginBottom: '6px' }}>
                      Category Name <span style={{ color: '#EF4444' }}>*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Cars, Mobiles, Fashion"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      style={{
                        width: '100%',
                        padding: '9px 12px',
                        borderRadius: '9px',
                        border: '1px solid #E7E5E4',
                        backgroundColor: '#FBFBFA',
                        fontSize: '13px',
                        color: '#1C1917',
                        outline: 'none',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#1C1917', marginBottom: '6px' }}>
                      Display Title (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Cars & Vehicles"
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      style={{
                        width: '100%',
                        padding: '9px 12px',
                        borderRadius: '9px',
                        border: '1px solid #E7E5E4',
                        backgroundColor: '#FBFBFA',
                        fontSize: '13px',
                        color: '#1C1917',
                        outline: 'none',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                </div>

                {/* Display Order & Status */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#1C1917', marginBottom: '6px' }}>
                      Sort Order
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={formData.sortOrder}
                      onChange={(e) => setFormData(prev => ({ ...prev, sortOrder: parseInt(e.target.value, 10) || 1 }))}
                      style={{
                        width: '100%',
                        padding: '9px 12px',
                        borderRadius: '9px',
                        border: '1px solid #E7E5E4',
                        backgroundColor: '#FBFBFA',
                        fontSize: '13px',
                        color: '#1C1917',
                        outline: 'none',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#1C1917', marginBottom: '6px' }}>
                      Status
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                      style={{
                        width: '100%',
                        padding: '9px 12px',
                        borderRadius: '9px',
                        border: '1px solid #E7E5E4',
                        backgroundColor: '#FBFBFA',
                        fontSize: '13px',
                        color: '#1C1917',
                        outline: 'none',
                        boxSizing: 'border-box'
                      }}
                    >
                      <option value="Active">Active (Visible on App)</option>
                      <option value="Inactive">Inactive (Hidden)</option>
                    </select>
                  </div>
                </div>

                {/* Visual Representation Type (Segmented Switch: Choose Icon vs Upload Image) */}
                <div style={{
                  border: '1px solid #E7E5E4',
                  borderRadius: '12px',
                  padding: '14px',
                  backgroundColor: '#FAF9F6'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '12px'
                  }}>
                    <span style={{ fontSize: '12px', fontWeight: 700, color: '#1C1917' }}>
                      Visual Representation
                    </span>

                    {/* Segmented Control */}
                    <div style={{
                      display: 'inline-flex',
                      backgroundColor: '#EEEDE9',
                      padding: '3px',
                      borderRadius: '8px'
                    }}>
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, visualType: 'icon' }))}
                        style={{
                          padding: '4px 14px',
                          borderRadius: '6px',
                          border: 'none',
                          fontSize: '12px',
                          fontWeight: 600,
                          cursor: 'pointer',
                          backgroundColor: formData.visualType === 'icon' ? '#FFFFFF' : 'transparent',
                          color: formData.visualType === 'icon' ? '#0B2545' : '#6F6A65',
                          boxShadow: formData.visualType === 'icon' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none'
                        }}
                      >
                        Choose Icon
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, visualType: 'image' }))}
                        style={{
                          padding: '4px 14px',
                          borderRadius: '6px',
                          border: 'none',
                          fontSize: '12px',
                          fontWeight: 600,
                          cursor: 'pointer',
                          backgroundColor: formData.visualType === 'image' ? '#FFFFFF' : 'transparent',
                          color: formData.visualType === 'image' ? '#0B2545' : '#6F6A65',
                          boxShadow: formData.visualType === 'image' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none'
                        }}
                      >
                        Upload Image
                      </button>
                    </div>
                  </div>

                  {/* OPTION 1: CHOOSE ICON */}
                  {formData.visualType === 'icon' && (
                    <div>
                      {/* Selected Icon Preview Banner */}
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        backgroundColor: '#FFFFFF',
                        border: '1px solid #E7E5E4',
                        padding: '10px 14px',
                        borderRadius: '10px',
                        marginBottom: '12px'
                      }}>
                        {React.createElement(getLucideIcon(formData.icon), {
                          size: 24,
                          color: '#0078FF',
                          strokeWidth: 2.2
                        })}
                        <div>
                          <div style={{ fontSize: '12.5px', fontWeight: 600, color: '#1C1917' }}>
                            Selected Icon: <span style={{ color: '#0078FF', fontFamily: 'monospace' }}>{formData.icon}</span>
                          </div>
                          <div style={{ fontSize: '11px', color: '#6F6A65' }}>
                            Click any icon from the catalog below to select it
                          </div>
                        </div>
                      </div>

                      {/* Icon Group Filters */}
                      <div style={{
                        display: 'flex',
                        gap: '6px',
                        overflowX: 'auto',
                        paddingBottom: '8px',
                        marginBottom: '10px'
                      }}>
                        {ICON_GROUPS.map((grp) => (
                          <button
                            key={grp.id}
                            type="button"
                            onClick={() => setActiveIconGroup(grp.id)}
                            style={{
                              padding: '4px 10px',
                              borderRadius: '6px',
                              fontSize: '11px',
                              fontWeight: 600,
                              whiteSpace: 'nowrap',
                              border: 'none',
                              cursor: 'pointer',
                              backgroundColor: activeIconGroup === grp.id ? '#0B2545' : '#EEEDE9',
                              color: activeIconGroup === grp.id ? '#FFFFFF' : '#6F6A65'
                            }}
                          >
                            {grp.label}
                          </button>
                        ))}
                      </div>

                      {/* Icon Search */}
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        backgroundColor: '#FFFFFF',
                        padding: '6px 10px',
                        borderRadius: '8px',
                        border: '1px solid #E7E5E4',
                        marginBottom: '12px'
                      }}>
                        <Search size={14} color="#6F6A65" />
                        <input
                          type="text"
                          placeholder="Search 60+ icons..."
                          value={iconSearch}
                          onChange={(e) => setIconSearch(e.target.value)}
                          style={{
                            border: 'none',
                            background: 'transparent',
                            outline: 'none',
                            fontSize: '12px',
                            width: '100%',
                            color: '#1C1917'
                          }}
                        />
                      </div>

                      {/* Icon Grid */}
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(56px, 1fr))',
                        gap: '8px',
                        maxHeight: '180px',
                        overflowY: 'auto',
                        backgroundColor: '#FFFFFF',
                        padding: '10px',
                        borderRadius: '10px',
                        border: '1px solid #E7E5E4'
                      }}>
                        {visibleIcons.map((ic) => {
                          const IconComp = ic.icon;
                          const isSelected = formData.icon === ic.id;

                          return (
                            <button
                              key={ic.id}
                              type="button"
                              onClick={() => setFormData(prev => ({ ...prev, icon: ic.id }))}
                              title={ic.label}
                              style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                height: '52px',
                                borderRadius: '8px',
                                border: isSelected ? '2px solid #0078FF' : '1px solid #E7E5E4',
                                backgroundColor: isSelected ? '#EFF6FF' : '#FBFBFA',
                                color: isSelected ? '#0078FF' : '#57534E',
                                cursor: 'pointer',
                                transition: 'all 120ms ease'
                              }}
                            >
                              <IconComp size={20} strokeWidth={isSelected ? 2.3 : 1.8} />
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* OPTION 2: UPLOAD IMAGE */}
                  {formData.visualType === 'image' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {previewImage ? (
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '14px',
                          backgroundColor: '#FFFFFF',
                          border: '1px solid #E7E5E4',
                          padding: '12px',
                          borderRadius: '10px'
                        }}>
                          <div style={{
                            width: '54px',
                            height: '54px',
                            borderRadius: '10px',
                            overflow: 'hidden',
                            border: '1px solid #E7E5E4',
                            backgroundColor: '#F6F5F2'
                          }}>
                            <img
                              src={previewImage}
                              alt="Preview"
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: '12.5px', fontWeight: 600, color: '#1C1917' }}>
                              Custom Image Loaded
                            </div>
                            <div style={{ fontSize: '11px', color: '#059669', marginTop: '2px' }}>
                              Will be rendered as category tile on app
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={handleRemoveImage}
                            style={{
                              padding: '6px 12px',
                              borderRadius: '7px',
                              border: '1px solid #FEE2E2',
                              backgroundColor: '#FEF2F2',
                              color: '#DC2626',
                              fontSize: '12px',
                              fontWeight: 600,
                              cursor: 'pointer'
                            }}
                          >
                            Remove
                          </button>
                        </div>
                      ) : (
                        <div style={{
                          border: '2px dashed #D6D3D1',
                          borderRadius: '10px',
                          padding: '24px 16px',
                          textAlign: 'center',
                          backgroundColor: '#FFFFFF',
                          cursor: 'pointer'
                        }}>
                          <Upload size={24} color="#6F6A65" style={{ margin: '0 auto 8px auto' }} />
                          <div style={{ fontSize: '13px', fontWeight: 600, color: '#1C1917' }}>
                            Upload Category Image
                          </div>
                          <div style={{ fontSize: '11px', color: '#6F6A65', marginTop: '3px' }}>
                            PNG, JPG or WEBP (Recommended square 256x256)
                          </div>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            style={{
                              marginTop: '12px',
                              fontSize: '12px',
                              color: '#57534E'
                            }}
                          />
                        </div>
                      )}

                      {/* Or image URL input */}
                      <div>
                        <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 600, color: '#57534E', marginBottom: '4px' }}>
                          Or Paste Public Image URL:
                        </label>
                        <input
                          type="url"
                          placeholder="https://example.com/category-icon.png"
                          value={formData.imageUrl}
                          onChange={(e) => {
                            const url = e.target.value;
                            setFormData(prev => ({ ...prev, imageUrl: url }));
                            if (url) setPreviewImage(url);
                          }}
                          style={{
                            width: '100%',
                            padding: '8px 12px',
                            borderRadius: '8px',
                            border: '1px solid #E7E5E4',
                            backgroundColor: '#FFFFFF',
                            fontSize: '12.5px',
                            color: '#1C1917',
                            outline: 'none',
                            boxSizing: 'border-box'
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Modal Actions Footer */}
              <div style={{
                padding: '14px 20px',
                borderTop: '1px solid #E7E5E4',
                backgroundColor: '#FBFBFA',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
                gap: '10px'
              }}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '8px',
                    border: '1px solid #E7E5E4',
                    backgroundColor: '#FFFFFF',
                    color: '#57534E',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{
                    padding: '8px 20px',
                    borderRadius: '8px',
                    border: 'none',
                    backgroundColor: '#0078FF',
                    color: '#FFFFFF',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: isSubmitting ? 'not-allowed' : 'pointer',
                    opacity: isSubmitting ? 0.7 : 1,
                    boxShadow: '0 2px 6px rgba(0, 120, 255, 0.25)'
                  }}
                >
                  {isSubmitting ? 'Saving...' : editingCategory ? 'Update Category' : 'Create Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* DELETE CONFIRMATION DIALOG (macOS Alert Style)            */}
      {/* ========================================================= */}
      {deleteConfirm && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.4)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          zIndex: 99999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            border: '1px solid rgba(0,0,0,0.08)',
            boxShadow: '0 24px 60px rgba(0,0,0,0.22)',
            width: '100%',
            maxWidth: '400px',
            padding: '24px',
            textAlign: 'center'
          }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              backgroundColor: '#FEE2E2',
              color: '#DC2626',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px auto'
            }}>
              <Trash2 size={24} strokeWidth={2.2} />
            </div>

            <div style={{ fontSize: '16px', fontWeight: 700, color: '#1C1917', marginBottom: '8px' }}>
              Delete "{deleteConfirm.name}"?
            </div>
            <div style={{ fontSize: '13px', color: '#6F6A65', lineHeight: 1.5, marginBottom: '20px' }}>
              This will remove the category from both Admin and the Mobile App.
            </div>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              <button
                type="button"
                onClick={() => setDeleteConfirm(null)}
                style={{
                  flex: 1,
                  padding: '9px 16px',
                  borderRadius: '9px',
                  border: '1px solid #E7E5E4',
                  backgroundColor: '#FFFFFF',
                  color: '#57534E',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteCategory}
                style={{
                  flex: 1,
                  padding: '9px 16px',
                  borderRadius: '9px',
                  border: 'none',
                  backgroundColor: '#DC2626',
                  color: '#FFFFFF',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  boxShadow: '0 2px 6px rgba(220, 38, 38, 0.25)'
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
