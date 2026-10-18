import React, { useState, useEffect, useMemo, useRef } from 'react';
import { apiFetch } from '../utils/api';
import PageHeader from '../components/ui/PageHeader';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Tag,
  Layers,
  CheckCircle2,
  XCircle,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  FolderTree,
  Grid,
  Check,
  X,
  Car,
  Home,
  Smartphone,
  Briefcase,
  Bike,
  Tv,
  Truck,
  Armchair,
  Shirt,
  BookOpen,
  HeartHandshake,
  Wrench,
  Sparkles,
  Filter,
  RefreshCw
} from 'lucide-react';

const MACOS_FONT_STACK =
  '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Helvetica Neue", Helvetica, Arial, sans-serif';

export default function MarketplaceSubcategories() {
  const [subcategories, setSubcategories] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [toast, setToast] = useState(null);

  // Category Slider ref & scroll state
  const categorySliderRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScrollPosition = () => {
    if (categorySliderRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = categorySliderRef.current;
      setCanScrollLeft(scrollLeft > 4);
      setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 6);
    }
  };

  useEffect(() => {
    const slider = categorySliderRef.current;
    if (!slider) return;
    checkScrollPosition();
    slider.addEventListener('scroll', checkScrollPosition, { passive: true });
    window.addEventListener('resize', checkScrollPosition);
    return () => {
      slider.removeEventListener('scroll', checkScrollPosition);
      window.removeEventListener('resize', checkScrollPosition);
    };
  }, [categories]);

  const handleScrollSlider = (direction) => {
    if (categorySliderRef.current) {
      const scrollAmount = 280;
      categorySliderRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
      setTimeout(checkScrollPosition, 320);
    }
  };

  // Add / Edit Modal
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentSubId, setCurrentSubId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    title: '',
    productCategoryId: '',
    sortOrder: 1,
    status: 'Active'
  });

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchData = async () => {
    setIsLoading(true);
    setErrorMessage('');
    try {
      const [subRes, catRes] = await Promise.all([
        apiFetch('/product-subCategory/get-all').catch(() => null),
        apiFetch('/product-category/get-all').catch(() => null)
      ]);

      let loadedCategories = [];
      if (catRes && catRes.ok) {
        const catJson = await catRes.json().catch(() => ({}));
        if (catJson && catJson.success && Array.isArray(catJson.data)) {
          loadedCategories = catJson.data;
        } else if (Array.isArray(catJson)) {
          loadedCategories = catJson;
        }
        setCategories(loadedCategories);
      }

      if (subRes && subRes.ok) {
        const subJson = await subRes.json().catch(() => ({}));
        if (subJson && subJson.success && Array.isArray(subJson.data)) {
          setSubcategories(subJson.data);
        } else if (Array.isArray(subJson)) {
          setSubcategories(subJson);
        }
      }

      // Check URL search parameters to pre-select category if redirected from Categories page
      const urlParams = new URLSearchParams(window.location.search);
      const categoryParam = urlParams.get('category');
      const categoryIdParam = urlParams.get('categoryId');

      if (categoryIdParam) {
        setSelectedCategoryFilter(categoryIdParam);
      } else if (categoryParam && loadedCategories.length > 0) {
        const match = loadedCategories.find(
          c => (c.name || '').toLowerCase() === categoryParam.toLowerCase() ||
               (c.slug || '').toLowerCase() === categoryParam.toLowerCase()
        );
        if (match) {
          setSelectedCategoryFilter(match._id || match.id);
        }
      }
    } catch (err) {
      setErrorMessage(err.message || 'Failed to load subcategories');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Standard Open Add Subcategory (prefills with current filtered category or first available)
  const handleOpenAdd = () => {
    setIsEditing(false);
    setCurrentSubId(null);
    const defaultCatId = selectedCategoryFilter !== 'All'
      ? selectedCategoryFilter
      : (categories[0]?._id || categories[0]?.id || '');

    const currentCatSubs = subcategories.filter(s => {
      const pId = s.productCategoryId?._id || s.productCategoryId?.id || s.productCategoryId;
      return String(pId) === String(defaultCatId);
    });

    setFormData({
      name: '',
      title: '',
      productCategoryId: defaultCatId,
      sortOrder: currentCatSubs.length + 1,
      status: 'Active'
    });
    setShowModal(true);
  };

  // Direct 1-Click Open Add Subcategory for a specific category (from Category Card Corner)
  const handleOpenAddForCategory = (catId) => {
    setIsEditing(false);
    setCurrentSubId(null);
    setSelectedCategoryFilter(catId);

    const currentCatSubs = subcategories.filter(s => {
      const pId = s.productCategoryId?._id || s.productCategoryId?.id || s.productCategoryId;
      return String(pId) === String(catId);
    });

    setFormData({
      name: '',
      title: '',
      productCategoryId: catId,
      sortOrder: currentCatSubs.length + 1,
      status: 'Active'
    });
    setShowModal(true);
  };

  const handleOpenEdit = (sub) => {
    setIsEditing(true);
    const subId = sub._id || sub.id;
    setCurrentSubId(subId);
    const parentId = sub.productCategoryId?._id || sub.productCategoryId?.id || sub.productCategoryId || '';
    setFormData({
      name: sub.name || '',
      title: sub.title || sub.name || '',
      productCategoryId: parentId,
      sortOrder: sub.sortOrder || 1,
      status: sub.status || (sub.isActive !== false ? 'Active' : 'Inactive')
    });
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      showToast('Subcategory name is required', 'error');
      return;
    }
    if (!formData.productCategoryId) {
      showToast('Parent Category is required', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        name: formData.name.trim(),
        title: (formData.title || formData.name).trim(),
        productCategoryId: formData.productCategoryId,
        sortOrder: Number(formData.sortOrder) || 1,
        status: formData.status,
        isActive: formData.status === 'Active'
      };

      let res;
      if (isEditing && currentSubId) {
        res = await apiFetch(`/product-subCategory/update/${currentSubId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      } else {
        res = await apiFetch('/product-subCategory/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      }

      const resData = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(resData.message || 'Operation failed');
      }

      showToast(isEditing ? 'Subcategory updated successfully' : 'Subcategory created successfully');
      setShowModal(false);
      await fetchData();
    } catch (err) {
      showToast(err.message || 'Failed to save subcategory', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Move Subcategory Slot Up or Down within its category
  const handleMoveSlot = async (sub, direction) => {
    const parentCatId = sub.productCategoryId?._id || sub.productCategoryId?.id || sub.productCategoryId;

    // Target group: active subcategories of the same parent category
    const catSubs = subcategories.filter(s => {
      const pId = s.productCategoryId?._id || s.productCategoryId?.id || s.productCategoryId;
      const isActive = s.status === 'Active' || (s.isActive !== false && s.status !== 'Inactive');
      return String(pId) === String(parentCatId) && isActive;
    }).sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));

    const currentIndex = catSubs.findIndex(s => (s._id || s.id) === (sub._id || sub.id));
    if (currentIndex === -1) return;

    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= catSubs.length) return;

    // Swap positions
    const newActives = [...catSubs];
    const temp = newActives[currentIndex];
    newActives[currentIndex] = newActives[targetIndex];
    newActives[targetIndex] = temp;

    // Renumber active slots 1..N
    const reorderedActives = newActives.map((s, i) => ({ ...s, sortOrder: i + 1 }));

    // Optimistic state update
    setSubcategories(prev => {
      const activeIds = new Set(reorderedActives.map(s => s._id || s.id));
      const remaining = prev.filter(s => !activeIds.has(s._id || s.id));
      return [...reorderedActives, ...remaining];
    });

    try {
      const res = await apiFetch('/product-subCategory/reorder', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subcategories: reorderedActives.map(s => ({
            id: s._id || s.id,
            _id: s._id || s.id,
            sortOrder: s.sortOrder
          }))
        })
      });

      if (!res.ok) {
        showToast('Slot moved locally, failed to persist to server', 'error');
      } else {
        showToast(`Slot moved ${direction === 'up' ? 'up' : 'down'} successfully`);
      }
    } catch (err) {
      showToast('Error syncing slot order', 'error');
    }
  };

  // Toggle Active/Inactive status with macOS slide switch
  const handleToggleStatus = async (sub) => {
    const subId = sub._id || sub.id;
    const isCurrentlyActive = sub.status === 'Active' || (sub.isActive !== false && sub.status !== 'Inactive');
    const newStatus = isCurrentlyActive ? 'Inactive' : 'Active';
    const parentCatId = sub.productCategoryId?._id || sub.productCategoryId?.id || sub.productCategoryId;

    // Recalculate sort orders for this category
    const catSubs = subcategories.filter(s => {
      const pId = s.productCategoryId?._id || s.productCategoryId?.id || s.productCategoryId;
      return String(pId) === String(parentCatId);
    });

    let newSortOrder = sub.sortOrder;
    let otherReorders = [];

    if (newStatus === 'Active') {
      const currentActives = catSubs.filter(s =>
        (s._id !== subId && s.id !== subId) && (s.status === 'Active' || (s.isActive !== false && s.status !== 'Inactive'))
      );
      newSortOrder = currentActives.length + 1;
    } else {
      newSortOrder = 9999;
      const remainingActives = catSubs
        .filter(s => (s._id !== subId && s.id !== subId) && (s.status === 'Active' || (s.isActive !== false && s.status !== 'Inactive')))
        .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
      otherReorders = remainingActives.map((s, idx) => ({
        id: s._id || s.id,
        _id: s._id || s.id,
        sortOrder: idx + 1
      }));
    }

    // Optimistic local update
    setSubcategories(prev =>
      prev.map(s => {
        if (s._id === subId || s.id === subId) {
          return { ...s, status: newStatus, isActive: newStatus === 'Active', sortOrder: newSortOrder };
        }
        const found = otherReorders.find(r => r.id === (s._id || s.id));
        if (found) {
          return { ...s, sortOrder: found.sortOrder };
        }
        return s;
      })
    );

    try {
      const res = await apiFetch(`/product-subCategory/update/${subId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: newStatus,
          isActive: newStatus === 'Active',
          sortOrder: newSortOrder
        })
      });

      if (res.ok) {
        if (otherReorders.length > 0) {
          apiFetch('/product-subCategory/reorder', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ subcategories: otherReorders })
          }).catch(() => {});
        }
        showToast(newStatus === 'Active' ? `"${sub.name}" turned ON for app` : `"${sub.name}" turned OFF`);
      } else {
        showToast('Failed to update status', 'error');
        fetchData();
      }
    } catch (err) {
      showToast(err.message || 'Error updating status', 'error');
      fetchData();
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    const subId = deleteTarget._id || deleteTarget.id;
    try {
      const res = await apiFetch(`/product-subCategory/delete/${subId}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        showToast(`Subcategory "${deleteTarget.name}" deleted successfully.`);
        setDeleteTarget(null);
        await fetchData();
      } else {
        showToast('Failed to delete subcategory', 'error');
      }
    } catch (err) {
      showToast(err.message || 'Error deleting subcategory', 'error');
    }
  };

  const getParentCategoryName = (sub) => {
    if (typeof sub.productCategoryId === 'object' && sub.productCategoryId?.name) {
      return sub.productCategoryId.name;
    }
    const found = categories.find(c => (c._id === sub.productCategoryId || c.id === sub.productCategoryId));
    return found ? found.name : 'General';
  };

  // Helper to resolve an icon component for category cards
  const getCategoryIconComponent = (cat) => {
    const slug = (cat.slug || cat.name || '').toLowerCase();
    if (slug.includes('car')) return Car;
    if (slug.includes('bike')) return Bike;
    if (slug.includes('prop')) return Home;
    if (slug.includes('mob')) return Smartphone;
    if (slug.includes('elec') || slug.includes('appliance')) return Tv;
    if (slug.includes('job')) return Briefcase;
    if (slug.includes('comm')) return Truck;
    if (slug.includes('furn')) return Armchair;
    if (slug.includes('fash')) return Shirt;
    if (slug.includes('book') || slug.includes('sport')) return BookOpen;
    if (slug.includes('pet')) return HeartHandshake;
    if (slug.includes('serv')) return Wrench;
    return Tag;
  };

  // Filter & partition subcategories
  const filteredSubcategories = useMemo(() => {
    return subcategories.filter(sub => {
      const nameMatch = (sub.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (sub.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (sub.slug || '').toLowerCase().includes(searchTerm.toLowerCase());

      const parentCatId = sub.productCategoryId?._id || sub.productCategoryId?.id || sub.productCategoryId;
      const categoryMatch = selectedCategoryFilter === 'All' || String(parentCatId) === String(selectedCategoryFilter);

      const subStatus = sub.status || (sub.isActive !== false ? 'Active' : 'Inactive');
      const statusMatch = statusFilter === 'All' || subStatus === statusFilter;

      return nameMatch && categoryMatch && statusMatch;
    });
  }, [subcategories, searchTerm, selectedCategoryFilter, statusFilter]);

  // Active vs Inactive partitioning for slot sequencing
  const activeSubcategories = useMemo(() => {
    return filteredSubcategories
      .filter(s => s.status === 'Active' || (s.isActive !== false && s.status !== 'Inactive'))
      .sort((a, b) => {
        const orderA = typeof a.sortOrder === 'number' ? a.sortOrder : 9999;
        const orderB = typeof b.sortOrder === 'number' ? b.sortOrder : 9999;
        return orderA - orderB;
      });
  }, [filteredSubcategories]);

  const inactiveSubcategories = useMemo(() => {
    return filteredSubcategories.filter(s => s.status === 'Inactive' || s.isActive === false);
  }, [filteredSubcategories]);

  const selectedCategoryObj = categories.find(c => (c._id || c.id) === selectedCategoryFilter);

  // Global KPI numbers
  const totalSubCount = subcategories.length;
  const activeSubCount = subcategories.filter(s => s.status === 'Active' || (s.isActive !== false && s.status !== 'Inactive')).length;
  const inactiveSubCount = totalSubCount - activeSubCount;

  return (
    <div className="admin-page" style={{ padding: '0 0 40px 0', fontFamily: MACOS_FONT_STACK }}>
      {/* Toast Notification (macOS Floating Glass Pill) */}
      {toast && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          zIndex: 9999,
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
            <XCircle size={18} color="#FF3B30" strokeWidth={2.2} />
          ) : (
            <CheckCircle2 size={18} color="#34C759" strokeWidth={2.4} />
          )}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Page Header (Clean macOS minimal header) */}
      <PageHeader
        title="Subcategories"
        breadcrumbs={['Marketplace', 'Subcategories']}
      >
        <button
          onClick={handleOpenAdd}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: '#007AFF',
            color: '#FFFFFF',
            border: 'none',
            padding: '9px 18px',
            borderRadius: '10px',
            fontSize: '13px',
            fontWeight: 600,
            cursor: 'pointer',
            boxShadow: '0 2px 6px rgba(0, 122, 255, 0.25)',
            transition: 'all 140ms ease'
          }}
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#0066DC'; }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#007AFF'; }}
        >
          <Plus size={16} strokeWidth={2.5} />
          <span>Add Subcategory</span>
        </button>
      </PageHeader>

      {/* macOS Frosted KPI Metric Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
        gap: '14px',
        marginBottom: '20px'
      }}>
        {/* KPI 1: Total Subcategories */}
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '14px',
          border: '1px solid #E7E5E4',
          padding: '16px 18px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
        }}>
          <div style={{ fontSize: '11px', color: '#6F6A65', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.04em' }}>
            Total Subcategories
          </div>
          <div style={{ fontSize: '24px', fontWeight: 700, color: '#1C1917', marginTop: '6px' }}>
            {totalSubCount}
          </div>
          <div style={{ fontSize: '11.5px', color: '#8E8E93', marginTop: '2px' }}>
            Across {categories.length} categories
          </div>
        </div>

        {/* KPI 2: Active on App */}
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '14px',
          border: '1px solid #E7E5E4',
          padding: '16px 18px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
        }}>
          <div style={{ fontSize: '11px', color: '#6F6A65', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.04em' }}>
            Active on Mobile App
          </div>
          <div style={{ fontSize: '24px', fontWeight: 700, color: '#34C759', marginTop: '6px' }}>
            {activeSubCount}
          </div>
          <div style={{ fontSize: '11.5px', color: '#34C759', marginTop: '2px', fontWeight: 500 }}>
            • Displayed dynamically
          </div>
        </div>

        {/* KPI 3: Inactive / Off App */}
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
            {inactiveSubCount}
          </div>
          <div style={{ fontSize: '11.5px', color: '#8E8E93', marginTop: '2px' }}>
            Hidden from customer catalog
          </div>
        </div>

        {/* KPI 4: Parent Category Active Filter */}
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '14px',
          border: '1px solid #E7E5E4',
          padding: '16px 18px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
        }}>
          <div style={{ fontSize: '11px', color: '#6F6A65', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.04em' }}>
            Selected Filter
          </div>
          <div style={{ fontSize: '18px', fontWeight: 700, color: '#007AFF', marginTop: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Layers size={18} color="#007AFF" />
            <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {selectedCategoryObj ? selectedCategoryObj.name : 'All Categories'}
            </span>
          </div>
          <div style={{ fontSize: '11.5px', color: '#8E8E93', marginTop: '4px' }}>
            {filteredSubcategories.length} matching subcategories
          </div>
        </div>
      </div>

      {/* 1. Category Slider Section (macOS horizontal strip with quick category corner add) */}
      <div style={{
        backgroundColor: '#FFFFFF',
        borderRadius: '14px',
        border: '1px solid #E7E5E4',
        padding: '16px 18px',
        marginBottom: '20px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
      }}>
        <style>{`
          .mbb-category-slider-track {
            scrollbar-width: none;
            -ms-overflow-style: none;
          }
          .mbb-category-slider-track::-webkit-scrollbar {
            display: none;
          }
          .mbb-cat-card-quick-add {
            opacity: 0;
            transform: scale(0.85);
            transition: all 140ms ease;
          }
          .mbb-cat-card:hover .mbb-cat-card-quick-add {
            opacity: 1;
            transform: scale(1);
          }
        `}</style>

        {/* Category Slider Header Bar */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '14px',
          flexWrap: 'wrap',
          gap: '8px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '28px',
              height: '28px',
              borderRadius: '7px',
              backgroundColor: 'rgba(0, 122, 255, 0.08)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Grid size={15} color="#007AFF" />
            </div>
            <div>
              <span style={{ fontSize: '13.5px', fontWeight: 700, color: '#1C1917' }}>
                Categories Filter
              </span>
              <span style={{
                fontSize: '11px',
                color: '#636366',
                backgroundColor: '#F6F5F2',
                padding: '2px 8px',
                borderRadius: '6px',
                fontWeight: 600,
                marginLeft: '8px'
              }}>
                {categories.length} categories
              </span>
            </div>
            <span style={{ fontSize: '12px', color: '#8E8E93', marginLeft: '4px' }}>
              • Select category to filter or click (+) on any card to add
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: '#8E8E93' }}>
              Active View:
            </span>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 10px',
              borderRadius: '8px',
              backgroundColor: 'rgba(0, 122, 255, 0.08)',
              color: '#007AFF',
              fontWeight: 700,
              fontSize: '12px',
              border: '1px solid rgba(0, 122, 255, 0.2)'
            }}>
              {selectedCategoryObj ? selectedCategoryObj.name : 'All Categories'}
            </span>

            {/* Quick macOS Slider Arrow Controls */}
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', marginLeft: '6px' }}>
              <button
                type="button"
                onClick={() => handleScrollSlider('left')}
                disabled={!canScrollLeft}
                title="Scroll categories left"
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '7px',
                  border: '1px solid #E7E5E4',
                  backgroundColor: canScrollLeft ? '#FFFFFF' : '#F6F5F2',
                  color: canScrollLeft ? '#1C1917' : '#8E8E93',
                  opacity: canScrollLeft ? 1 : 0.45,
                  cursor: canScrollLeft ? 'pointer' : 'default',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 140ms ease'
                }}
              >
                <ChevronLeft size={15} />
              </button>
              <button
                type="button"
                onClick={() => handleScrollSlider('right')}
                disabled={!canScrollRight}
                title="Scroll categories right"
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '7px',
                  border: '1px solid #E7E5E4',
                  backgroundColor: canScrollRight ? '#FFFFFF' : '#F6F5F2',
                  color: canScrollRight ? '#1C1917' : '#8E8E93',
                  opacity: canScrollRight ? 1 : 0.45,
                  cursor: canScrollRight ? 'pointer' : 'default',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 140ms ease'
                }}
              >
                <ChevronRight size={15} />
              </button>
            </div>
          </div>
        </div>

        {/* Categories Slider Strip */}
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* Side Left Arrow */}
          <button
            type="button"
            onClick={() => handleScrollSlider('left')}
            disabled={!canScrollLeft}
            style={{
              flexShrink: 0,
              width: '28px',
              height: '62px',
              borderRadius: '8px',
              border: '1px solid #E7E5E4',
              backgroundColor: canScrollLeft ? '#FFFFFF' : '#F6F5F2',
              color: canScrollLeft ? '#1C1917' : '#8E8E93',
              opacity: canScrollLeft ? 1 : 0.35,
              cursor: canScrollLeft ? 'pointer' : 'default',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 140ms ease',
              boxShadow: canScrollLeft ? '0 1px 3px rgba(0,0,0,0.05)' : 'none'
            }}
            title="Previous categories"
          >
            <ChevronLeft size={16} />
          </button>

          {/* Scrollable Track */}
          <div
            ref={categorySliderRef}
            className="mbb-category-slider-track"
            style={{
              display: 'flex',
              alignItems: 'stretch',
              gap: '10px',
              overflowX: 'auto',
              scrollBehavior: 'smooth',
              padding: '4px 2px 6px 2px',
              flex: 1
            }}
          >
            {/* 'All Categories' Option Tile */}
            <div
              className="mbb-cat-card"
              onClick={() => setSelectedCategoryFilter('All')}
              style={{
                flex: '0 0 auto',
                width: '100px',
                minWidth: '100px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '10px 6px 8px 6px',
                borderRadius: '12px',
                border: selectedCategoryFilter === 'All' ? '1.5px solid #007AFF' : '1px solid #E7E5E4',
                backgroundColor: selectedCategoryFilter === 'All' ? 'rgba(0, 122, 255, 0.06)' : '#FFFFFF',
                cursor: 'pointer',
                position: 'relative',
                transition: 'all 140ms ease',
                textAlign: 'center',
                boxShadow: selectedCategoryFilter === 'All' ? '0 2px 8px rgba(0, 122, 255, 0.15)' : '0 1px 2px rgba(0,0,0,0.02)'
              }}
            >
              {selectedCategoryFilter === 'All' && (
                <span style={{
                  position: 'absolute',
                  top: '5px',
                  right: '5px',
                  width: '15px',
                  height: '15px',
                  borderRadius: '50%',
                  backgroundColor: '#007AFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Check size={10} color="#FFFFFF" strokeWidth={3} />
                </span>
              )}
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '10px',
                backgroundColor: selectedCategoryFilter === 'All' ? '#007AFF' : '#F6F5F2',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '5px'
              }}>
                <Layers size={17} color={selectedCategoryFilter === 'All' ? '#FFFFFF' : '#6F6A65'} />
              </div>
              <span style={{
                fontSize: '12px',
                fontWeight: selectedCategoryFilter === 'All' ? 700 : 600,
                color: selectedCategoryFilter === 'All' ? '#007AFF' : '#1C1917',
                lineHeight: '1.2',
                height: '24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center'
              }}>
                All
              </span>
              <span style={{
                fontSize: '11px',
                color: selectedCategoryFilter === 'All' ? '#007AFF' : '#8E8E93',
                marginTop: '2px',
                fontWeight: 500
              }}>
                {subcategories.length} total
              </span>
            </div>

            {/* Dynamic Category Cards */}
            {categories.map((cat) => {
              const catId = cat._id || cat.id;
              const isSelected = String(selectedCategoryFilter) === String(catId);
              const IconComp = getCategoryIconComponent(cat);
              const count = subcategories.filter(s => {
                const pId = s.productCategoryId?._id || s.productCategoryId?.id || s.productCategoryId;
                return String(pId) === String(catId);
              }).length;

              const hasImage = Array.isArray(cat.images) && cat.images.length > 0
                ? cat.images[0]
                : (cat.image || (cat.icon && (cat.icon.startsWith('http') || cat.icon.startsWith('/uploads')) ? cat.icon : null));

              return (
                <div
                  key={catId}
                  className="mbb-cat-card"
                  title={cat.name}
                  onClick={() => setSelectedCategoryFilter(catId)}
                  style={{
                    flex: '0 0 auto',
                    width: '104px',
                    minWidth: '104px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '10px 6px 8px 6px',
                    borderRadius: '12px',
                    border: isSelected ? '1.5px solid #007AFF' : '1px solid #E7E5E4',
                    backgroundColor: isSelected ? 'rgba(0, 122, 255, 0.06)' : '#FFFFFF',
                    cursor: 'pointer',
                    position: 'relative',
                    transition: 'all 140ms ease',
                    textAlign: 'center',
                    boxShadow: isSelected ? '0 2px 8px rgba(0, 122, 255, 0.15)' : '0 1px 2px rgba(0,0,0,0.02)'
                  }}
                >
                  {/* Category Corner: Quick Add Subcategory Button (+) */}
                  <button
                    type="button"
                    className="mbb-cat-card-quick-add"
                    title={`+ Add Subcategory under ${cat.name}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenAddForCategory(catId);
                    }}
                    style={{
                      position: 'absolute',
                      top: '4px',
                      left: '4px',
                      width: '20px',
                      height: '20px',
                      borderRadius: '6px',
                      backgroundColor: '#007AFF',
                      color: '#FFFFFF',
                      border: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      zIndex: 3,
                      boxShadow: '0 2px 5px rgba(0, 122, 255, 0.35)'
                    }}
                  >
                    <Plus size={13} strokeWidth={3} />
                  </button>

                  {/* Selected Active Checkmark */}
                  {isSelected && (
                    <span style={{
                      position: 'absolute',
                      top: '5px',
                      right: '5px',
                      width: '15px',
                      height: '15px',
                      borderRadius: '50%',
                      backgroundColor: '#007AFF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      zIndex: 2
                    }}>
                      <Check size={10} color="#FFFFFF" strokeWidth={3} />
                    </span>
                  )}

                  {/* Thumbnail / Icon Squircle */}
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '10px',
                    backgroundColor: isSelected ? '#DBEAFE' : '#F6F5F2',
                    border: isSelected ? '1px solid #BFDBFE' : '1px solid #E7E5E4',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '5px',
                    overflow: 'hidden'
                  }}>
                    {hasImage ? (
                      <img
                        src={hasImage}
                        alt={cat.name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        onError={(e) => { e.currentTarget.style.display = 'none'; }}
                      />
                    ) : (
                      <IconComp size={17} color={isSelected ? '#007AFF' : '#6F6A65'} />
                    )}
                  </div>

                  {/* Category Name */}
                  <span style={{
                    fontSize: '12px',
                    fontWeight: isSelected ? 700 : 600,
                    color: isSelected ? '#007AFF' : '#1C1917',
                    lineHeight: '1.2',
                    height: '26px',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    textAlign: 'center',
                    wordBreak: 'break-word'
                  }}>
                    {cat.name}
                  </span>

                  {/* Items Count */}
                  <span style={{
                    fontSize: '11px',
                    color: isSelected ? '#007AFF' : '#8E8E93',
                    marginTop: '2px',
                    fontWeight: 500
                  }}>
                    {count} {count === 1 ? 'item' : 'items'}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Side Right Arrow */}
          <button
            type="button"
            onClick={() => handleScrollSlider('right')}
            disabled={!canScrollRight}
            style={{
              flexShrink: 0,
              width: '28px',
              height: '62px',
              borderRadius: '8px',
              border: '1px solid #E7E5E4',
              backgroundColor: canScrollRight ? '#FFFFFF' : '#F6F5F2',
              color: canScrollRight ? '#1C1917' : '#8E8E93',
              opacity: canScrollRight ? 1 : 0.35,
              cursor: canScrollRight ? 'pointer' : 'default',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 140ms ease',
              boxShadow: canScrollRight ? '0 1px 3px rgba(0,0,0,0.05)' : 'none'
            }}
            title="Next categories"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* 2. Main Subcategories Listing Table Card (With macOS Corner Button & Styling) */}
      <div style={{
        backgroundColor: '#FFFFFF',
        borderRadius: '14px',
        border: '1px solid #E7E5E4',
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
        overflow: 'hidden'
      }}>
        {/* LISTING CARD CORNER HEADER: Title on Left, "+ Add Subcategory" Button on Corner Right */}
        <div style={{
          padding: '16px 20px',
          borderBottom: '1px solid #E7E5E4',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
          backgroundColor: '#FFFFFF'
        }}>
          {/* Left: Card Title & Category Pill */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              backgroundColor: 'rgba(0, 122, 255, 0.08)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <FolderTree size={17} color="#007AFF" />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h2 style={{
                  fontSize: '15px',
                  fontWeight: 700,
                  color: '#1C1917',
                  margin: 0,
                  letterSpacing: '-0.01em'
                }}>
                  {selectedCategoryObj ? `${selectedCategoryObj.name} Subcategories` : 'All Subcategories'}
                </h2>
                <span style={{
                  fontSize: '11px',
                  fontWeight: 600,
                  padding: '2px 8px',
                  borderRadius: '6px',
                  backgroundColor: '#F6F5F2',
                  color: '#636366'
                }}>
                  {filteredSubcategories.length} total
                </span>
                <span style={{
                  fontSize: '11px',
                  fontWeight: 600,
                  padding: '2px 8px',
                  borderRadius: '6px',
                  backgroundColor: 'rgba(52, 199, 89, 0.1)',
                  color: '#248A3D'
                }}>
                  {activeSubcategories.length} active
                </span>
              </div>
              <div style={{ fontSize: '11.5px', color: '#8E8E93', marginTop: '2px' }}>
                {selectedCategoryObj ? (
                  <span>
                    Scoped to <strong>{selectedCategoryObj.name}</strong> •{' '}
                    <button
                      onClick={() => setSelectedCategoryFilter('All')}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#007AFF',
                        fontWeight: 600,
                        cursor: 'pointer',
                        padding: 0,
                        fontSize: '11.5px',
                        textDecoration: 'underline'
                      }}
                    >
                      Show all categories
                    </button>
                  </span>
                ) : (
                  'Showing subcategories across all marketplace categories'
                )}
              </div>
            </div>
          </div>

          {/* RIGHT / CORNER: "+ Add Subcategory" Button in Listing Card Corner */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              onClick={() => {
                if (selectedCategoryObj) {
                  handleOpenAddForCategory(selectedCategoryObj._id || selectedCategoryObj.id);
                } else {
                  handleOpenAdd();
                }
              }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '7px',
                backgroundColor: '#007AFF',
                color: '#FFFFFF',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '9px',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                boxShadow: '0 2px 6px rgba(0, 122, 255, 0.25)',
                transition: 'all 140ms ease'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#0066DC'; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#007AFF'; }}
            >
              <Plus size={15} strokeWidth={2.5} />
              <span>
                {selectedCategoryObj ? `+ Add to ${selectedCategoryObj.name}` : '+ Add Subcategory'}
              </span>
            </button>
          </div>
        </div>

        {/* macOS Controls Strip: Spotlight Search & Segmented Status Toggle */}
        <div style={{
          padding: '12px 20px',
          backgroundColor: '#FAF9F6',
          borderBottom: '1px solid #E7E5E4',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          {/* Spotlight Search Box */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: '#FFFFFF',
            padding: '7px 14px',
            borderRadius: '9px',
            border: '1px solid #E7E5E4',
            width: '300px',
            boxShadow: '0 1px 2px rgba(0,0,0,0.02)'
          }}>
            <Search size={15} color="#8E8E93" />
            <input
              type="text"
              placeholder={selectedCategoryObj ? `Search within ${selectedCategoryObj.name}...` : 'Search subcategories...'}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                border: 'none',
                background: 'transparent',
                outline: 'none',
                fontSize: '13px',
                width: '100%',
                color: '#1C1917',
                fontFamily: MACOS_FONT_STACK
              }}
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
              >
                <X size={14} color="#8E8E93" />
              </button>
            )}
          </div>

          {/* macOS Segmented Status Toggle */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '12px', color: '#6F6A65', fontWeight: 600 }}>Status:</span>
            <div style={{
              display: 'inline-flex',
              backgroundColor: '#EAE8E4',
              padding: '3px',
              borderRadius: '8px',
              gap: '2px'
            }}>
              {['All', 'Active', 'Inactive'].map((status) => {
                const isCurrent = statusFilter === status;
                return (
                  <button
                    key={status}
                    type="button"
                    onClick={() => setStatusFilter(status)}
                    style={{
                      padding: '4px 12px',
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontWeight: 600,
                      border: 'none',
                      cursor: 'pointer',
                      backgroundColor: isCurrent ? '#FFFFFF' : 'transparent',
                      color: isCurrent ? '#1C1917' : '#6F6A65',
                      boxShadow: isCurrent ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                      transition: 'all 120ms ease'
                    }}
                  >
                    {status}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Table View */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
            <thead>
              <tr style={{ backgroundColor: '#FBFBFA', borderBottom: '1px solid #E7E5E4' }}>
                <th style={{ padding: '10px 18px', fontWeight: 600, color: '#57534E', width: '130px' }}>Slot / Order</th>
                <th style={{ padding: '10px 18px', fontWeight: 600, color: '#57534E' }}>Subcategory</th>
                <th style={{ padding: '10px 18px', fontWeight: 600, color: '#57534E' }}>Parent Category</th>
                <th style={{ padding: '10px 18px', fontWeight: 600, color: '#57534E' }}>Slug</th>
                <th style={{ padding: '10px 18px', fontWeight: 600, color: '#57534E', textAlign: 'center', width: '160px' }}>Status</th>
                <th style={{ padding: '10px 18px', fontWeight: 600, color: '#57534E', textAlign: 'right', width: '120px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan="6" style={{ padding: '60px 20px', textAlign: 'center', color: '#6F6A65' }}>
                    Loading subcategories from database...
                  </td>
                </tr>
              ) : filteredSubcategories.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ padding: '60px 20px', textAlign: 'center' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                      <Tag size={32} opacity={0.3} color="#8E8E93" />
                      <div style={{ fontSize: '14px', fontWeight: 600, color: '#1C1917' }}>No subcategories found</div>
                      <div style={{ fontSize: '12px', color: '#6F6A65' }}>
                        {selectedCategoryObj ? `No subcategories in "${selectedCategoryObj.name}" yet.` : 'No subcategories match your filters.'}
                      </div>
                      <button
                        onClick={selectedCategoryObj ? () => handleOpenAddForCategory(selectedCategoryObj._id || selectedCategoryObj.id) : handleOpenAdd}
                        style={{
                          marginTop: '12px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          backgroundColor: '#007AFF',
                          color: '#FFFFFF',
                          border: 'none',
                          padding: '7px 16px',
                          borderRadius: '8px',
                          fontSize: '12.5px',
                          fontWeight: 600,
                          cursor: 'pointer'
                        }}
                      >
                        <Plus size={14} strokeWidth={2.5} />
                        Add First Subcategory
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                <>
                  {/* Active Subcategories */}
                  {activeSubcategories.map((sub, index) => {
                    const isFirst = index === 0;
                    const isLast = index === activeSubcategories.length - 1;
                    const subId = sub._id || sub.id;

                    return (
                      <tr
                        key={subId}
                        style={{
                          borderBottom: '1px solid #F1EFEA',
                          transition: 'background-color 100ms ease'
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#FAF9F6'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                      >
                        {/* Slot / Order Stepper */}
                        <td style={{ padding: '12px 18px' }}>
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
                                fontFamily: MACOS_FONT_STACK
                              }}
                            >
                              Slot #{index + 1}
                            </span>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                              <button
                                type="button"
                                disabled={isFirst}
                                onClick={() => handleMoveSlot(sub, 'up')}
                                style={{
                                  width: '20px',
                                  height: '16px',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  border: '1px solid rgba(0,0,0,0.1)',
                                  borderRadius: '4px',
                                  backgroundColor: isFirst ? 'transparent' : '#FFFFFF',
                                  color: isFirst ? '#C7C7CC' : '#48484A',
                                  cursor: isFirst ? 'not-allowed' : 'pointer'
                                }}
                                title="Move slot up"
                              >
                                <ChevronUp size={12} />
                              </button>
                              <button
                                type="button"
                                disabled={isLast}
                                onClick={() => handleMoveSlot(sub, 'down')}
                                style={{
                                  width: '20px',
                                  height: '16px',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  border: '1px solid rgba(0,0,0,0.1)',
                                  borderRadius: '4px',
                                  backgroundColor: isLast ? 'transparent' : '#FFFFFF',
                                  color: isLast ? '#C7C7CC' : '#48484A',
                                  cursor: isLast ? 'not-allowed' : 'pointer'
                                }}
                                title="Move slot down"
                              >
                                <ChevronDown size={12} />
                              </button>
                            </div>
                          </div>
                        </td>

                        {/* Subcategory Name & Title */}
                        <td style={{ padding: '12px 18px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{
                              width: '34px',
                              height: '34px',
                              borderRadius: '9px',
                              backgroundColor: 'rgba(0, 122, 255, 0.08)',
                              border: '1px solid rgba(0, 122, 255, 0.18)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '13px',
                              fontWeight: 700,
                              color: '#007AFF'
                            }}>
                              {sub.name?.charAt(0)?.toUpperCase() || 'S'}
                            </div>
                            <div>
                              <div style={{ fontWeight: 600, color: '#1C1917', fontSize: '13.5px' }}>
                                {sub.name}
                              </div>
                              {sub.title && sub.title !== sub.name && (
                                <div style={{ fontSize: '11.5px', color: '#6F6A65', marginTop: '1px' }}>
                                  {sub.title}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Parent Category */}
                        <td style={{ padding: '12px 18px' }}>
                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '4px 10px',
                            borderRadius: '7px',
                            fontSize: '12px',
                            fontWeight: 600,
                            backgroundColor: '#F6F5F2',
                            color: '#1C1917',
                            border: '1px solid #E7E5E4'
                          }}>
                            <Layers size={13} color="#007AFF" />
                            {getParentCategoryName(sub)}
                          </span>
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
                            {sub.slug || sub.name?.toLowerCase().replace(/[^a-z0-9]+/g, '-')}
                          </span>
                        </td>

                        {/* Status (macOS Slide Switch) */}
                        <td style={{ textAlign: 'center', padding: '12px 18px' }}>
                          <div
                            onClick={() => handleToggleStatus(sub)}
                            title="Click to toggle status on app"
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
                              aria-checked={true}
                              tabIndex={0}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                  e.preventDefault();
                                  handleToggleStatus(sub);
                                }
                              }}
                              style={{
                                position: 'relative',
                                width: '44px',
                                height: '24px',
                                borderRadius: '999px',
                                backgroundColor: '#34C759',
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
                                  left: '22px',
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
                                  color: '#248A3D',
                                  lineHeight: 1.2
                                }}
                              >
                                Active
                              </div>
                              <div style={{ fontSize: '10px', color: '#8E8E93', marginTop: '1px' }}>
                                Switch to Off
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Actions (macOS Rounded Square Buttons) */}
                        <td style={{ padding: '12px 18px', textAlign: 'right' }}>
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                            <button
                              type="button"
                              onClick={() => handleOpenEdit(sub)}
                              title="Edit subcategory"
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
                            <button
                              type="button"
                              onClick={() => setDeleteTarget(sub)}
                              title="Delete subcategory"
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

                  {/* Inactive Subcategories Divider & Rows */}
                  {inactiveSubcategories.length > 0 && (
                    <>
                      <tr>
                        <td colSpan="6" style={{
                          padding: '10px 18px',
                          backgroundColor: '#F6F5F2',
                          borderTop: '1px solid #E7E5E4',
                          borderBottom: '1px solid #E7E5E4',
                          fontSize: '11px',
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          letterSpacing: '0.04em',
                          color: '#8E8E93'
                        }}>
                          Inactive Subcategories ({inactiveSubcategories.length}) — Hidden from mobile app
                        </td>
                      </tr>
                      {inactiveSubcategories.map((sub) => {
                        const subId = sub._id || sub.id;
                        return (
                          <tr
                            key={subId}
                            style={{
                              borderBottom: '1px solid #F1EFEA',
                              opacity: 0.72,
                              transition: 'background-color 100ms ease'
                            }}
                            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#FAF9F6'; }}
                            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                          >
                            <td style={{ padding: '12px 18px' }}>
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
                            </td>
                            <td style={{ padding: '12px 18px' }}>
                              <div style={{ fontWeight: 600, fontSize: '13.5px', color: '#636366' }}>
                                {sub.name}
                              </div>
                            </td>
                            <td style={{ padding: '12px 18px' }}>
                              <span style={{ fontSize: '12px', color: '#8E8E93' }}>
                                {getParentCategoryName(sub)}
                              </span>
                            </td>
                            <td style={{ padding: '12px 18px', fontSize: '12px', color: '#8E8E93', fontFamily: 'monospace' }}>
                              {sub.slug || sub.name?.toLowerCase().replace(/[^a-z0-9]+/g, '-')}
                            </td>
                            <td style={{ textAlign: 'center', padding: '12px 18px' }}>
                              <div
                                onClick={() => handleToggleStatus(sub)}
                                title="Click to activate on app"
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '10px',
                                  cursor: 'pointer',
                                  padding: '4px 8px',
                                  borderRadius: '8px'
                                }}
                              >
                                <div
                                  role="switch"
                                  aria-checked={false}
                                  tabIndex={0}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter' || e.key === ' ') {
                                      e.preventDefault();
                                      handleToggleStatus(sub);
                                    }
                                  }}
                                  style={{
                                    position: 'relative',
                                    width: '44px',
                                    height: '24px',
                                    borderRadius: '999px',
                                    backgroundColor: '#D1D1D6',
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
                                      left: '2px',
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
                                  <div style={{ fontSize: '12.5px', fontWeight: 600, color: '#8E8E93', lineHeight: 1.2 }}>
                                    Inactive
                                  </div>
                                  <div style={{ fontSize: '10px', color: '#8E8E93', marginTop: '1px' }}>
                                    Switch to On
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td style={{ padding: '12px 18px', textAlign: 'right' }}>
                              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                                <button
                                  type="button"
                                  onClick={() => handleOpenEdit(sub)}
                                  title="Edit subcategory"
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
                                    cursor: 'pointer'
                                  }}
                                >
                                  <Edit2 size={14} />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setDeleteTarget(sub)}
                                  title="Delete subcategory"
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
                                    cursor: 'pointer'
                                  }}
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </>
                  )}
                </>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 3. Add / Edit Subcategory Modal (macOS Sheet Style) */}
      {showModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.4)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10000,
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            border: '1px solid #E7E5E4',
            width: '100%',
            maxWidth: '500px',
            boxShadow: '0 24px 60px rgba(0,0,0,0.18), 0 2px 8px rgba(0,0,0,0.06)',
            overflow: 'hidden'
          }}>
            {/* Modal Header */}
            <div style={{
              padding: '16px 20px',
              borderBottom: '1px solid #E7E5E4',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: '#FAF9F6'
            }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: '#1C1917' }}>
                  {isEditing ? 'Edit Subcategory' : 'Add New Subcategory'}
                </h3>
                <div style={{ fontSize: '12px', color: '#8E8E93', marginTop: '2px' }}>
                  Configure marketplace subcategory properties
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  border: 'none',
                  backgroundColor: '#EAE8E4',
                  color: '#636366',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'background-color 120ms ease'
                }}
              >
                <X size={15} />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSave} style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#57534E', marginBottom: '6px' }}>
                  Parent Category *
                </label>
                <select
                  value={formData.productCategoryId}
                  onChange={(e) => setFormData({ ...formData, productCategoryId: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '9px',
                    border: '1px solid #E7E5E4',
                    backgroundColor: '#F6F5F2',
                    color: '#1C1917',
                    fontSize: '13px',
                    outline: 'none',
                    fontFamily: MACOS_FONT_STACK
                  }}
                  required
                >
                  <option value="">Select Parent Category</option>
                  {categories.map((c) => (
                    <option key={c._id || c.id} value={c._id || c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#57534E', marginBottom: '6px' }}>
                  Subcategory Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Used Cars, Commercial Vehicles, Spare Parts..."
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '9px',
                    border: '1px solid #E7E5E4',
                    backgroundColor: '#F6F5F2',
                    color: '#1C1917',
                    fontSize: '13px',
                    outline: 'none',
                    boxSizing: 'border-box',
                    fontFamily: MACOS_FONT_STACK
                  }}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#57534E', marginBottom: '6px' }}>
                  Display Title (Optional)
                </label>
                <input
                  type="text"
                  placeholder="Optional display label"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '9px',
                    border: '1px solid #E7E5E4',
                    backgroundColor: '#F6F5F2',
                    color: '#1C1917',
                    fontSize: '13px',
                    outline: 'none',
                    boxSizing: 'border-box',
                    fontFamily: MACOS_FONT_STACK
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#57534E', marginBottom: '6px' }}>
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: '9px',
                      border: '1px solid #E7E5E4',
                      backgroundColor: '#F6F5F2',
                      color: '#1C1917',
                      fontSize: '13px',
                      outline: 'none',
                      fontFamily: MACOS_FONT_STACK
                    }}
                  >
                    <option value="Active">Active (Display on App)</option>
                    <option value="Inactive">Inactive (Off App)</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#57534E', marginBottom: '6px' }}>
                    Slot / Sort Order
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.sortOrder}
                    onChange={(e) => setFormData({ ...formData, sortOrder: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: '9px',
                      border: '1px solid #E7E5E4',
                      backgroundColor: '#F6F5F2',
                      color: '#1C1917',
                      fontSize: '13px',
                      outline: 'none',
                      boxSizing: 'border-box',
                      fontFamily: MACOS_FONT_STACK
                    }}
                  />
                </div>
              </div>

              {/* Modal Footer Controls */}
              <div style={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '10px',
                marginTop: '10px',
                paddingTop: '16px',
                borderTop: '1px solid #E7E5E4'
              }}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  disabled={isSubmitting}
                  style={{
                    padding: '8px 16px',
                    fontSize: '13px',
                    fontWeight: 600,
                    borderRadius: '8px',
                    border: '1px solid #E7E5E4',
                    backgroundColor: '#F6F5F2',
                    color: '#57534E',
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
                    fontSize: '13px',
                    fontWeight: 600,
                    borderRadius: '8px',
                    border: 'none',
                    backgroundColor: '#007AFF',
                    color: '#FFFFFF',
                    cursor: isSubmitting ? 'not-allowed' : 'pointer',
                    boxShadow: '0 2px 6px rgba(0, 122, 255, 0.25)'
                  }}
                >
                  {isSubmitting ? 'Saving...' : (isEditing ? 'Save Changes' : 'Create Subcategory')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. Delete Confirmation Modal (macOS Alert Style) */}
      {deleteTarget && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.4)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10000,
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            border: '1px solid #E7E5E4',
            width: '100%',
            maxWidth: '420px',
            padding: '24px',
            boxShadow: '0 24px 60px rgba(0,0,0,0.18)'
          }}>
            <h3 style={{ margin: '0 0 10px 0', fontSize: '16px', fontWeight: 700, color: '#1C1917' }}>
              Delete Subcategory
            </h3>
            <p style={{ margin: '0 0 20px 0', fontSize: '13px', color: '#6F6A65', lineHeight: 1.5 }}>
              Are you sure you want to delete <strong>"{deleteTarget.name}"</strong>? This action will remove it from the database and mobile app.
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                style={{
                  padding: '8px 16px',
                  fontSize: '13px',
                  fontWeight: 600,
                  borderRadius: '8px',
                  border: '1px solid #E7E5E4',
                  backgroundColor: '#F6F5F2',
                  color: '#57534E',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                style={{
                  padding: '8px 18px',
                  fontSize: '13px',
                  fontWeight: 600,
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: '#FF3B30',
                  color: '#FFFFFF',
                  cursor: 'pointer',
                  boxShadow: '0 2px 6px rgba(255, 59, 48, 0.25)'
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
