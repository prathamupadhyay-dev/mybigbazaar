// ============================================================
// MyBigBazaar Admin — Mobile App Hero Banner Slider CMS
// macOS Sequoia Native Architecture & Apple System Design Tokens
// Pure image banners for mobile homepage hero banner slider
// - Sequential 1-to-1 Slot Locking with Conflict Handling
// - Single Status column with macOS Slide-Type Toggle
// - macOS Rounded Square Action Buttons (Edit, Delete, Preview)
// - Media Gallery Browser in Banner Upload Form + Device Upload
// - Configurable Slider Duration (Range Slider only — strictly no number input)
// ============================================================

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  UploadCloud,
  Image as ImageIcon,
  Trash2,
  X,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Eye,
  Pencil,
  Clock,
  Calendar,
  Smartphone,
  Check,
  Crop,
  ZoomIn,
  ZoomOut,
  Move,
  RotateCcw,
  ChevronUp,
  ChevronDown,
  Layers,
  ArrowRight,
  FolderOpen,
  ExternalLink,
  Sliders,
  Sparkles,
  Info,
  Search
} from 'lucide-react';
import PageHeader from '../components/ui/PageHeader';
import { apiFetch } from '../utils/api';
import { getAssetUrl, DEFAULT_PRODUCT_PLACEHOLDER } from '../config';

const PLACEMENT = 'home_hero';

// Duration preset buttons for range slider
const DURATION_PRESETS = [
  { label: '3.0s Fast', value: 3.0 },
  { label: '4.5s Standard', value: 4.5 },
  { label: '6.0s Relaxed', value: 6.0 },
  { label: '8.0s Slow', value: 8.0 }
];

export default function Banners() {
  const navigate = useNavigate();
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'active' | 'inactive'
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingBanner, setEditingBanner] = useState(null);
  const [viewingBanner, setViewingBanner] = useState(null);
  const [deleteCandidate, setDeleteCandidate] = useState(null);
  const [toast, setToast] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Slider Duration Settings (Range only - strictly no number input)
  const [sliderInterval, setSliderInterval] = useState(4.5);
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  // File & Media picker state
  const [mediaSource, setMediaSource] = useState('device'); // 'device' | 'gallery' | 'url'
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  // Gallery Picker State
  const [galleryItems, setGalleryItems] = useState([]);
  const [galleryLoading, setGalleryLoading] = useState(false);
  const [selectedGalleryUrl, setSelectedGalleryUrl] = useState('');

  // Image Crop & Frame Editor State (2.4 : 1 Mobile Container)
  const [showCropModal, setShowCropModal] = useState(false);
  const [cropZoom, setCropZoom] = useState(100);
  const [cropPanX, setCropPanX] = useState(0);
  const [cropPanY, setCropPanY] = useState(0);
  const [cropFitMode, setCropFitMode] = useState('cover');
  const [isDraggingFrame, setIsDraggingFrame] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0, panX: 0, panY: 0 });

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    imageUrl: '',
    placement: 'home_hero',
    targetScreen: 'ProductList',
    order: 1,
    validUntil: '',
    noExpiry: true,
    status: 'Active',
    slotAction: 'shift' // 'shift' | 'swap' | 'replace'
  });

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const isExpired = (validUntil) => {
    if (!validUntil || validUntil === '2026-12-31') return false;
    const expTime = new Date(validUntil).getTime();
    return !isNaN(expTime) && expTime < Date.now();
  };

  // Separate active banners and inactive/off-carousel banners
  const activeBanners = banners
    .filter((b) => (b.status === 'Active' || b.isActive === true) && !isExpired(b.validUntil))
    .sort((a, b) => (a.sortOrder ?? a.order ?? 0) - (b.sortOrder ?? b.order ?? 0))
    .map((b, idx) => ({
      ...b,
      isActive: true,
      status: 'Active',
      sortOrder: idx + 1,
      order: idx + 1,
      slot: idx + 1
    }));

  const inactiveBanners = banners
    .filter((b) => b.status === 'Inactive' || b.isActive === false || isExpired(b.validUntil))
    .map((b) => ({
      ...b,
      isActive: false,
      status: 'Inactive',
      sortOrder: null,
      order: null,
      slot: null
    }));

  const activeCount = activeBanners.length;
  const inactiveCount = inactiveBanners.length;

  const rawDisplayedBanners =
    activeTab === 'active'
      ? activeBanners
      : activeTab === 'inactive'
      ? inactiveBanners
      : [...activeBanners, ...inactiveBanners];

  const displayedBanners = rawDisplayedBanners.filter((b) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    const title = (b.title || '').toLowerCase();
    const slotStr = b.slot ? `slot #${b.slot}`.toLowerCase() : '';
    const target = (b.targetScreen || '').toLowerCase();
    return title.includes(term) || slotStr.includes(term) || target.includes(term);
  });

  // Load Banners from backend
  const loadBanners = useCallback(async () => {
    try {
      const res = await apiFetch('/api/v1/cms/banners?placement=home_hero&all=true');
      const json = await res.json();
      if (json && Array.isArray(json.data)) {
        const heroBanners = json.data.filter(
          (b) =>
            b.placement === 'home_hero' ||
            b.placement === 'home' ||
            b.placement === 'hero_banner_slider' ||
            !b.placement
        );
        setBanners(heroBanners);
      }
    } catch (err) {
      console.warn('Failed to load hero banners:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load Banner Settings (Autoplay Duration Interval)
  const loadBannerSettings = useCallback(async () => {
    try {
      const res = await apiFetch('/api/v1/cms/banners/settings');
      const json = await res.json();
      if (json && json.data && typeof json.data.autoplayIntervalSeconds === 'number') {
        setSliderInterval(json.data.autoplayIntervalSeconds);
      }
    } catch (err) {
      console.warn('Failed to load banner settings:', err);
    }
  }, []);

  // Load Gallery Media Library for in-form thumbnail picker
  const loadGalleryMedia = useCallback(async () => {
    setGalleryLoading(true);
    try {
      const res = await apiFetch('/api/v1/cms/gallery');
      const json = await res.json();
      if (json && Array.isArray(json.data)) {
        setGalleryItems(json.data);
      } else {
        setGalleryItems([]);
      }
    } catch (err) {
      console.warn('Failed to load gallery items:', err);
    } finally {
      setGalleryLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBanners();
    loadBannerSettings();
  }, [loadBanners, loadBannerSettings]);

  // Persist Slider Interval (Debounced range update or preset click)
  const handleUpdateDuration = async (seconds) => {
    const val = Math.min(10, Math.max(2, parseFloat(seconds) || 4.5));
    setSliderInterval(val);
    setIsSavingSettings(true);
    try {
      await apiFetch('/api/v1/cms/banners/settings', {
        method: 'PUT',
        body: JSON.stringify({ autoplayIntervalSeconds: val })
      });
      showToast(`Sliding interval set to ${val.toFixed(1)}s for mobile app.`, 'success');
    } catch (err) {
      console.warn('Failed to save banner duration setting:', err);
    } finally {
      setIsSavingSettings(false);
    }
  };

  // Open Add Banner Modal
  const handleOpenAdd = () => {
    setEditingBanner(null);
    setSelectedFile(null);
    setPreviewUrl('');
    setSelectedGalleryUrl('');
    setMediaSource('device');

    // Auto-assign next sequential active slot
    const nextSlot = activeCount + 1;
    setFormData({
      title: '',
      imageUrl: '',
      placement: 'home_hero',
      targetScreen: 'ProductList',
      order: nextSlot,
      validUntil: '',
      noExpiry: true,
      status: 'Active',
      slotAction: 'shift'
    });
    setShowModal(true);
  };

  // Open Edit Banner Modal
  const handleOpenEdit = (banner) => {
    setEditingBanner(banner);
    setSelectedFile(null);
    const existingImg = banner.imageUrl || '';
    setPreviewUrl(existingImg ? getAssetUrl(existingImg) : '');
    setSelectedGalleryUrl(existingImg);
    setMediaSource('device');

    const hasExpiry = banner.validUntil && banner.validUntil !== '2026-12-31' && banner.validUntil !== '';
    let formattedDate = '';
    if (hasExpiry) {
      try {
        const d = new Date(banner.validUntil);
        formattedDate = d.toISOString().slice(0, 16);
      } catch (e) {
        formattedDate = banner.validUntil;
      }
    }

    const isCurrentActive = (banner.status === 'Active' || banner.isActive === true) && !isExpired(banner.validUntil);
    let currentSlot = activeCount + 1;
    if (isCurrentActive) {
      const activeIdx = activeBanners.findIndex((b) => (b.id || b._id) === (banner.id || banner._id));
      currentSlot = activeIdx !== -1 ? activeIdx + 1 : (banner.sortOrder ?? banner.order ?? 1);
    }

    setFormData({
      title: banner.title || '',
      imageUrl: banner.imageUrl || '',
      placement: banner.placement || 'home_hero',
      targetScreen: banner.targetScreen || 'ProductList',
      order: currentSlot,
      validUntil: formattedDate,
      noExpiry: !hasExpiry,
      status: isCurrentActive ? 'Active' : 'Inactive',
      slotAction: 'swap'
    });
    setShowModal(true);
  };

  // Conflict detection strictly against ACTIVE banners (inactive banners do not hold slots)
  const targetSlotNum = Number(formData.order) || 1;
  const currentEditingId = editingBanner ? (editingBanner.id || editingBanner._id) : null;
  const isFormActive = formData.status === 'Active';
  const conflictingBanner = isFormActive
    ? activeBanners.find((b) => {
        const bId = b.id || b._id;
        if (currentEditingId && bId === currentEditingId) return false;
        const bSlot = b.sortOrder ?? b.order ?? 1;
        return bSlot === targetSlotNum;
      })
    : null;

  // Reorder Slot Move (Instant Up/Down Swap strictly among active carousel banners)
  const handleMoveSlot = async (banner, direction) => {
    const currentIndex = activeBanners.findIndex(
      (b) => (b.id || b._id) === (banner.id || banner._id)
    );
    if (currentIndex === -1) return;

    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= activeBanners.length) return;

    // Swap positions locally among active banners
    const newActives = [...activeBanners];
    const temp = newActives[currentIndex];
    newActives[currentIndex] = newActives[targetIndex];
    newActives[targetIndex] = temp;

    const updatedActives = newActives.map((b, idx) => ({
      ...b,
      sortOrder: idx + 1,
      order: idx + 1,
      slot: idx + 1
    }));

    setBanners([...updatedActives, ...inactiveBanners]);

    try {
      const orderedIds = updatedActives.map((b) => b.id || b._id);
      await apiFetch('/api/v1/cms/banners/reorder', {
        method: 'PUT',
        body: JSON.stringify({ bannerIds: orderedIds, orderedIds })
      });
      showToast('Banner carousel slot order updated.', 'success');
    } catch (err) {
      console.warn('Reorder failed:', err);
      showToast('Failed to save reorder on server.', 'error');
      loadBanners();
    }
  };

  // Handle local file upload
  const handleFileChange = (file) => {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('Please select a valid image file (PNG, JPG, WEBP).', 'error');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      showToast('Image file size must be less than 10MB.', 'error');
      return;
    }

    setSelectedFile(file);
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
  };

  const handleRemoveImage = () => {
    setSelectedFile(null);
    setPreviewUrl('');
    setSelectedGalleryUrl('');
    setFormData((prev) => ({ ...prev, imageUrl: '' }));
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Select image from media gallery
  const handleSelectGalleryItem = (item) => {
    setSelectedGalleryUrl(item.url);
    setSelectedFile(null);
    setFormData((prev) => ({ ...prev, imageUrl: item.url }));
    setPreviewUrl(getAssetUrl(item.url));
    showToast(`Selected "${item.name}" from Media Gallery`, 'success');
  };

  // Crop & Frame Editor Functions
  const handleOpenCropModal = () => {
    if (!previewUrl) {
      showToast('Please select or upload an image first.', 'error');
      return;
    }
    setCropZoom(100);
    setCropPanX(0);
    setCropPanY(0);
    setCropFitMode('cover');
    setShowCropModal(true);
  };

  const handleFrameMouseDown = (e) => {
    setIsDraggingFrame(true);
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      panX: cropPanX,
      panY: cropPanY
    };
  };

  const handleFrameMouseMove = (e) => {
    if (!isDraggingFrame) return;
    const deltaX = (e.clientX - dragStartRef.current.x) / 2.5;
    const deltaY = (e.clientY - dragStartRef.current.y) / 2.5;
    const newPanX = Math.max(-50, Math.min(50, Math.round(dragStartRef.current.panX + deltaX)));
    const newPanY = Math.max(-50, Math.min(50, Math.round(dragStartRef.current.panY + deltaY)));
    setCropPanX(newPanX);
    setCropPanY(newPanY);
  };

  const handleFrameMouseUp = () => {
    setIsDraggingFrame(false);
  };

  const handleApplyCrop = async () => {
    if (!previewUrl) return;

    try {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = previewUrl;

      await new Promise((resolve, reject) => {
        if (img.complete && img.naturalWidth !== 0) return resolve();
        img.onload = resolve;
        img.onerror = () => reject(new Error('Failed to load image for framing.'));
      });

      const CANVAS_WIDTH = 1200;
      const CANVAS_HEIGHT = 500;
      const canvas = document.createElement('canvas');
      canvas.width = CANVAS_WIDTH;
      canvas.height = CANVAS_HEIGHT;
      const ctx = canvas.getContext('2d');

      if (!ctx) throw new Error('Could not initialize canvas context');

      ctx.fillStyle = '#090D16';
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      const natW = img.naturalWidth || CANVAS_WIDTH;
      const natH = img.naturalHeight || CANVAS_HEIGHT;

      let baseScale;
      if (cropFitMode === 'contain') {
        baseScale = Math.min(CANVAS_WIDTH / natW, CANVAS_HEIGHT / natH);
      } else {
        baseScale = Math.max(CANVAS_WIDTH / natW, CANVAS_HEIGHT / natH);
      }

      const totalScale = baseScale * (cropZoom / 100);
      const drawW = natW * totalScale;
      const drawH = natH * totalScale;

      const offsetX = (cropPanX / 100) * (drawW * 0.4);
      const offsetY = (cropPanY / 100) * (drawH * 0.4);

      const drawX = (CANVAS_WIDTH - drawW) / 2 + offsetX;
      const drawY = (CANVAS_HEIGHT - drawH) / 2 + offsetY;

      ctx.drawImage(img, drawX, drawY, drawW, drawH);

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            showToast('Failed to export framed banner.', 'error');
            return;
          }

          const fileName = selectedFile
            ? `framed-${selectedFile.name.replace(/\.[^/.]+$/, '')}.jpg`
            : `hero-banner-framed-${Date.now()}.jpg`;

          const framedFile = new File([blob], fileName, { type: 'image/jpeg' });
          setSelectedFile(framedFile);
          const newPreview = URL.createObjectURL(blob);
          setPreviewUrl(newPreview);
          setMediaSource('device');
          setShowCropModal(false);
          showToast('Banner framed successfully for the 2.4:1 container!', 'success');
        },
        'image/jpeg',
        0.92
      );
    } catch (err) {
      console.warn('Canvas framing error:', err);
      showToast('Could not process framing: ' + (err.message || 'CORS error'), 'error');
      setShowCropModal(false);
    }
  };

  // Toggle Status via macOS Slide Switch
  const toggleStatus = async (banner) => {
    const bannerId = banner.id || banner._id;
    const isCurrentlyActive = (banner.status === 'Active' || banner.isActive === true) && !isExpired(banner.validUntil);
    const nextStatus = isCurrentlyActive ? 'Inactive' : 'Active';

    // Optimistic UI update:
    // If deactivating, remove immediately from active carousel slots and resequence remaining active slots
    // If activating, append to the next active slot
    if (isCurrentlyActive) {
      const remainingActives = activeBanners
        .filter((b) => (b.id || b._id) !== bannerId)
        .map((b, idx) => ({
          ...b,
          sortOrder: idx + 1,
          order: idx + 1,
          slot: idx + 1
        }));
      const deactivatedItem = {
        ...banner,
        isActive: false,
        status: 'Inactive',
        sortOrder: null,
        order: null,
        slot: null
      };
      setBanners([
        ...remainingActives,
        deactivatedItem,
        ...inactiveBanners.filter((b) => (b.id || b._id) !== bannerId)
      ]);
    } else {
      const activatedItem = {
        ...banner,
        isActive: true,
        status: 'Active',
        sortOrder: activeCount + 1,
        order: activeCount + 1,
        slot: activeCount + 1
      };
      setBanners([
        ...activeBanners,
        activatedItem,
        ...inactiveBanners.filter((b) => (b.id || b._id) !== bannerId)
      ]);
    }

    if (viewingBanner && (viewingBanner.id === bannerId || viewingBanner._id === bannerId)) {
      setViewingBanner((prev) => ({
        ...prev,
        isActive: !isCurrentlyActive,
        status: nextStatus,
        sortOrder: isCurrentlyActive ? null : activeCount + 1
      }));
    }

    try {
      await apiFetch(`/api/v1/cms/banners/${bannerId}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status: nextStatus })
      });
      showToast(
        nextStatus === 'Active'
          ? `Hero banner turned ON (assigned to Slot #${activeCount + 1}).`
          : 'Hero banner turned OFF and removed from active carousel slots.',
        'success'
      );
      await loadBanners();
    } catch (err) {
      console.warn('Failed to toggle banner status:', err);
      showToast('Failed to update status on server.', 'error');
      loadBanners();
    }
  };

  // Save Banner (Add or Edit with Slot Conflict Resolution)
  const handleSaveBanner = async () => {
    if (!selectedFile && !formData.imageUrl.trim() && !previewUrl) {
      showToast('Please select or upload a banner image.', 'error');
      return;
    }

    setIsSubmitting(true);

    try {
      const bannerId = editingBanner ? (editingBanner.id || editingBanner._id) : null;
      const finalExpiry = formData.noExpiry ? '' : formData.validUntil;
      const isSavingActive = formData.status === 'Active';
      const slotNum = isSavingActive ? (Number(formData.order) || (activeCount + 1)) : 999;
      let res;

      const customTitle = formData.title?.trim() || (isSavingActive ? `Hero Banner #${slotNum}` : 'Hero Banner (Draft)');

      if (selectedFile) {
        // Multipart FormData upload
        const data = new FormData();
        data.append('image', selectedFile);
        data.append('title', customTitle);
        data.append('placement', PLACEMENT);
        data.append('targetScreen', formData.targetScreen);
        data.append('sortOrder', String(slotNum));
        data.append('order', String(slotNum));
        data.append('slotAction', formData.slotAction || 'shift');
        data.append('validUntil', finalExpiry);
        data.append('status', formData.status);
        data.append('isActive', String(isSavingActive));

        if (editingBanner) {
          res = await apiFetch(`/api/v1/cms/banners/${bannerId}`, {
            method: 'PUT',
            body: data
          });
        } else {
          res = await apiFetch('/api/v1/cms/banners', {
            method: 'POST',
            body: data
          });
        }
      } else {
        // JSON payload with image URL / Gallery URL
        const payload = {
          title: customTitle,
          imageUrl: formData.imageUrl.trim() || editingBanner?.imageUrl || '',
          placement: PLACEMENT,
          targetScreen: formData.targetScreen,
          sortOrder: slotNum,
          order: slotNum,
          slotAction: formData.slotAction || 'shift',
          validUntil: finalExpiry,
          status: formData.status,
          isActive: isSavingActive
        };

        if (editingBanner) {
          res = await apiFetch(`/api/v1/cms/banners/${bannerId}`, {
            method: 'PUT',
            body: JSON.stringify(payload)
          });
        } else {
          res = await apiFetch('/api/v1/cms/banners', {
            method: 'POST',
            body: JSON.stringify(payload)
          });
        }
      }

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.message || `Server responded with ${res.status}`);
      }

      showToast(
        !isSavingActive
          ? 'Hero banner saved as Inactive (off-carousel).'
          : editingBanner
          ? `Slot #${slotNum} updated successfully.`
          : `Hero banner published to Slot #${slotNum}!`,
        'success'
      );
      setShowModal(false);
      setSelectedFile(null);
      setPreviewUrl('');
      setSelectedGalleryUrl('');
      await loadBanners();
    } catch (err) {
      console.error('Failed to save banner:', err);
      showToast(err.message || 'Failed to save banner.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete Banner Confirmation
  const confirmDelete = async () => {
    if (!deleteCandidate) return;
    const bannerId = deleteCandidate.id || deleteCandidate._id;

    setBanners((prev) => prev.filter((b) => b.id !== bannerId && b._id !== bannerId));
    if (viewingBanner && (viewingBanner.id === bannerId || viewingBanner._id === bannerId)) {
      setViewingBanner(null);
    }
    showToast('Hero banner deleted.', 'success');
    setDeleteCandidate(null);

    try {
      await apiFetch(`/api/v1/cms/banners/${bannerId}`, {
        method: 'DELETE'
      });
      loadBanners();
    } catch (err) {
      console.warn('Failed to delete banner:', err);
      showToast('Failed to delete banner on backend.', 'error');
      loadBanners();
    }
  };

  const formatDateTime = (dateStr) => {
    if (!dateStr || dateStr === '2026-12-31') return null;
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return null;
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit'
      });
    } catch (e) {
      return null;
    }
  };

  const formatDateAdded = (dateStr) => {
    if (!dateStr) return 'Recently';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch (e) {
      return 'Recently';
    }
  };

  return (
    <div className="admin-page" style={{ maxWidth: '1440px', margin: '0 auto', paddingBottom: '60px' }}>
      {/* Page Header */}
      <PageHeader
        title="Hero Banner Slider"
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={() => navigate('/dashboard/cms/gallery')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: 'rgba(0, 122, 255, 0.08)',
              color: '#007AFF',
              border: '1px solid rgba(0, 122, 255, 0.25)',
              borderRadius: '8px',
              padding: '7px 14px',
              fontSize: '12.5px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 140ms ease'
            }}
          >
            <FolderOpen size={14} />
            <span>Open Gallery</span>
          </button>

          <button
            onClick={handleOpenAdd}
            data-testid="add-banner-btn"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: '#007AFF',
              color: '#FFFFFF',
              border: '1px solid #007AFF',
              borderRadius: '8px',
              padding: '7px 16px',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              boxShadow: '0 2px 6px rgba(0, 122, 255, 0.3)',
              transition: 'all 140ms ease'
            }}
          >
            <Plus size={16} strokeWidth={2.4} />
            <span>Upload New Banner</span>
          </button>
        </div>
      </PageHeader>

      {/* Toast Notification */}
      {toast && (
        <div
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            backgroundColor: '#FFFFFF',
            border: `1px solid ${toast.type === 'error' ? '#FF3B30' : '#34C759'}`,
            boxShadow: '0 12px 30px rgba(0, 0, 0, 0.15)',
            borderRadius: '10px',
            padding: '12px 18px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            zIndex: 9999,
            fontSize: '13px',
            fontWeight: 600,
            color: toast.type === 'error' ? '#FF3B30' : '#1C1917',
            animation: 'toastSlide 180ms ease-out'
          }}
        >
          {toast.type === 'error' ? (
            <AlertCircle size={18} color="#FF3B30" />
          ) : (
            <CheckCircle2 size={18} color="#34C759" />
          )}
          <span>{toast.message}</span>
        </div>
      )}

      {/* macOS Sequoia Top Bar: Live Status & Interactive Sliding Duration Range */}
      <div
        style={{
          background: 'rgba(255, 255, 255, 0.85)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(0, 0, 0, 0.08)',
          borderRadius: '14px',
          padding: '16px 20px',
          marginBottom: '22px',
          boxShadow: '0 4px 18px rgba(0, 0, 0, 0.04)',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px'
        }}
      >
        {/* Top Row: Active Banners Status & Traffic Lights */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ display: 'flex', gap: '6px' }}>
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#FF5F56' }} />
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#FFBD2E' }} />
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#27C93F' }} />
            </div>

            <div style={{ height: '14px', width: '1px', backgroundColor: 'rgba(0,0,0,0.1)' }} />

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Smartphone size={16} color={activeCount === 0 ? '#FF3B30' : activeCount === 1 ? '#007AFF' : '#34C759'} />
              <span style={{ fontSize: '13.5px', fontWeight: 600, color: '#1C1917' }}>
                Hero Banner Slider on Mobile App:
              </span>
              <span style={{
                fontSize: '12px',
                fontWeight: 600,
                padding: '2px 9px',
                borderRadius: '999px',
                backgroundColor: activeCount === 0 ? 'rgba(255, 59, 48, 0.1)' : activeCount === 1 ? 'rgba(0, 122, 255, 0.1)' : 'rgba(52, 199, 89, 0.12)',
                color: activeCount === 0 ? '#FF3B30' : activeCount === 1 ? '#007AFF' : '#248A3D'
              }}>
                {activeCount === 0
                  ? '0 Active — Container displays clean blank'
                  : activeCount === 1
                  ? '1 Active — Single static banner (no sliding)'
                  : `${activeCount} Active — Sliding Carousel`}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={loadBanners}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              borderRadius: '7px',
              border: '1px solid rgba(0, 0, 0, 0.1)',
              backgroundColor: '#FFFFFF',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
              color: '#57534E',
              boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
            }}
          >
            <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
            <span>Sync</span>
          </button>
        </div>

        {/* Bottom Row: Sliding Interval Range Control (STRICT: Range only, NO number input) */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '16px',
            paddingTop: '12px',
            borderTop: '1px solid rgba(0, 0, 0, 0.05)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: 1, minWidth: '280px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Clock size={15} color="#007AFF" />
              <span style={{ fontSize: '13px', fontWeight: 600, color: '#1C1917' }}>
                Sliding Duration Interval:
              </span>
              <span
                style={{
                  fontSize: '13px',
                  fontWeight: 700,
                  color: '#007AFF',
                  backgroundColor: 'rgba(0, 122, 255, 0.08)',
                  padding: '2px 8px',
                  borderRadius: '6px',
                  fontFamily: 'SF Pro Text, -apple-system, monospace'
                }}
              >
                {sliderInterval.toFixed(1)}s
              </span>
            </div>

            {/* Range Slider (Strict constraint: range only, no number input) */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, maxWidth: '280px' }}>
              <span style={{ fontSize: '11px', color: '#8E8E93', fontWeight: 600 }}>2s</span>
              <input
                type="range"
                min="2.0"
                max="10.0"
                step="0.5"
                value={sliderInterval}
                onChange={(e) => handleUpdateDuration(e.target.value)}
                style={{
                  flex: 1,
                  accentColor: '#007AFF',
                  cursor: 'pointer',
                  height: '6px'
                }}
                title={`Adjust slider duration (${sliderInterval.toFixed(1)}s)`}
              />
              <span style={{ fontSize: '11px', color: '#8E8E93', fontWeight: 600 }}>10s</span>
            </div>
          </div>

          {/* Quick Segmented Duration Presets */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '11.5px', color: '#8E8E93', fontWeight: 500, marginRight: '2px' }}>Presets:</span>
            {DURATION_PRESETS.map((preset) => {
              const isSelected = Math.abs(sliderInterval - preset.value) < 0.1;
              return (
                <button
                  key={preset.value}
                  type="button"
                  onClick={() => handleUpdateDuration(preset.value)}
                  style={{
                    padding: '4px 10px',
                    borderRadius: '6px',
                    fontSize: '11.5px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 120ms ease',
                    border: isSelected ? '1px solid #007AFF' : '1px solid rgba(0,0,0,0.08)',
                    backgroundColor: isSelected ? '#007AFF' : '#FFFFFF',
                    color: isSelected ? '#FFFFFF' : '#48484A',
                    boxShadow: isSelected ? '0 1px 4px rgba(0,122,255,0.3)' : 'none'
                  }}
                >
                  {preset.label}
                </button>
              );
            })}
          </div>
        </div>

      </div>

      {/* Search Bar for Banners */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
          marginBottom: '16px'
        }}
      >
        <div style={{ position: 'relative', width: '360px', maxWidth: '100%' }}>
          <Search
            size={15}
            color="#8E8E93"
            style={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              pointerEvents: 'none'
            }}
          />
          <input
            type="text"
            placeholder="Search banner by name or slot..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '8px 12px 8px 36px',
              borderRadius: '8px',
              border: '1px solid rgba(0, 0, 0, 0.12)',
              backgroundColor: '#FFFFFF',
              fontSize: '12.5px',
              color: '#1C1917',
              outline: 'none',
              boxShadow: '0 1px 2px rgba(0,0,0,0.03)'
            }}
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm('')}
              style={{
                position: 'absolute',
                right: '10px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: '#8E8E93',
                display: 'flex',
                alignItems: 'center',
                padding: 0
              }}
              title="Clear search"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {searchTerm && (
          <div style={{ fontSize: '12px', color: '#636366' }}>
            Found <strong>{displayedBanners.length}</strong> matching "{searchTerm}"
          </div>
        )}
      </div>

      {/* Hero Banners macOS Card Table */}
      <div
        className="admin-card"
        style={{
          padding: 0,
          overflow: 'hidden',
          borderRadius: '14px',
          border: '1px solid rgba(0, 0, 0, 0.08)',
          boxShadow: '0 6px 20px rgba(0, 0, 0, 0.03)',
          backgroundColor: '#FFFFFF'
        }}
      >
        <div className="table-responsive-wrapper" style={{ border: 'none', borderRadius: 0 }}>
          <table className="admin-table">
            <thead>
              <tr style={{ background: '#F9F9FB', borderBottom: '1px solid rgba(0,0,0,0.08)' }}>
                <th style={{ width: '140px', paddingLeft: '20px' }}>Slot / Order</th>
                <th style={{ width: '280px' }}>Banner Creative & Name</th>
                <th>Date Added</th>
                <th>Active Until</th>
                <th style={{ textAlign: 'center', width: '150px' }}>Status</th>
                <th style={{ textAlign: 'right', width: '140px', paddingRight: '20px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" style={{ padding: '50px', textAlign: 'center', color: '#8E8E93' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px' }}>
                      <RefreshCw size={18} className="animate-spin" color="#007AFF" />
                      <span style={{ fontSize: '13px', fontWeight: 600 }}>Loading Hero Banners...</span>
                    </div>
                  </td>
                </tr>
              ) : displayedBanners.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ padding: '60px 20px', textAlign: 'center' }}>
                    <div style={{ maxWidth: '420px', margin: '0 auto' }}>
                      <div
                        style={{
                          width: '52px',
                          height: '52px',
                          borderRadius: '14px',
                          backgroundColor: 'rgba(0, 122, 255, 0.08)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          margin: '0 auto 14px auto',
                          color: '#007AFF'
                        }}
                      >
                        {searchTerm ? <Search size={26} /> : <ImageIcon size={28} />}
                      </div>
                      <div style={{ fontWeight: 700, color: '#1C1917', fontSize: '15px' }}>
                        {searchTerm
                          ? `No Banners Matching "${searchTerm}"`
                          : activeTab === 'active'
                          ? 'No Active Banners in Carousel'
                          : activeTab === 'inactive'
                          ? 'No Inactive / Draft Banners'
                          : 'No Hero Banners Uploaded'}
                      </div>
                      <div style={{ fontSize: '13px', marginTop: '6px', color: '#636366', lineHeight: 1.5 }}>
                        {searchTerm
                          ? `No banners matched your search query. Clear the search input to see all uploaded hero banners.`
                          : activeTab === 'active'
                          ? 'The mobile app currently has no active hero slides. Switch inactive banners ON to activate them, or upload a new one.'
                          : activeTab === 'inactive'
                          ? 'All uploaded banners are currently active and live in the hero slider.'
                          : 'The mobile app displays the container blank. Upload images to activate the hero slider.'}
                      </div>
                      {searchTerm ? (
                        <button
                          type="button"
                          onClick={() => setSearchTerm('')}
                          style={{
                            marginTop: '16px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '8px 16px',
                            backgroundColor: '#FFFFFF',
                            color: '#1C1917',
                            border: '1px solid rgba(0, 0, 0, 0.15)',
                            borderRadius: '8px',
                            fontSize: '13px',
                            fontWeight: 600,
                            cursor: 'pointer',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
                          }}
                        >
                          <X size={14} />
                          <span>Clear Search</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={handleOpenAdd}
                          style={{
                            marginTop: '16px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '8px 16px',
                            backgroundColor: '#007AFF',
                            color: '#FFFFFF',
                            border: 'none',
                            borderRadius: '8px',
                            fontSize: '13px',
                            fontWeight: 600,
                            cursor: 'pointer',
                            boxShadow: '0 2px 6px rgba(0, 122, 255, 0.3)'
                          }}
                        >
                          <Plus size={15} />
                          <span>Upload Banner</span>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                displayedBanners.map((b) => {
                  const bId = b.id || b._id;
                  const isActive = (b.status === 'Active' || b.isActive === true) && !isExpired(b.validUntil);
                  const expired = isExpired(b.validUntil);
                  const expiryText = formatDateTime(b.validUntil);
                  const dateAddedText = formatDateAdded(b.createdAt);

                  const activeIdx = activeBanners.findIndex((x) => (x.id || x._id) === bId);
                  const slotNum = activeIdx !== -1 ? activeIdx + 1 : (b.sortOrder ?? b.slot ?? 1);
                  const isFirstActive = activeIdx === 0;
                  const isLastActive = activeIdx === activeBanners.length - 1;

                  return (
                    <tr
                      key={bId}
                      style={{
                        transition: 'background-color 120ms ease',
                        borderBottom: '1px solid rgba(0,0,0,0.05)',
                        backgroundColor: !isActive ? 'rgba(0,0,0,0.015)' : 'transparent'
                      }}
                    >
                      {/* Slot / Order with Reorder Controls strictly for Active Slots */}
                      <td style={{ paddingLeft: '20px' }}>
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
                                onClick={() => handleMoveSlot(b, 'up')}
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
                                onClick={() => handleMoveSlot(b, 'down')}
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
                            <span>Off Carousel</span>
                          </span>
                        )}
                      </td>

                      {/* Banner Creative & Name */}
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          {b.imageUrl ? (
                            <div
                              onClick={() => setViewingBanner(b)}
                              style={{
                                position: 'relative',
                                width: '130px',
                                height: '54px',
                                borderRadius: '8px',
                                overflow: 'hidden',
                                border: '1px solid rgba(0,0,0,0.1)',
                                backgroundColor: '#090D16',
                                cursor: 'pointer',
                                boxShadow: '0 2px 6px rgba(0,0,0,0.06)',
                                flexShrink: 0
                              }}
                              title="Click to preview banner"
                            >
                              <img
                                src={getAssetUrl(b.imageUrl)}
                                alt={b.title || 'Hero Banner'}
                                onError={(e) => {
                                  e.currentTarget.onerror = null;
                                  e.currentTarget.src = DEFAULT_PRODUCT_PLACEHOLDER;
                                }}
                                style={{
                                  width: '100%',
                                  height: '100%',
                                  objectFit: 'cover'
                                }}
                              />
                            </div>
                          ) : (
                            <div
                              style={{
                                width: '130px',
                                height: '54px',
                                backgroundColor: '#F2F2F7',
                                borderRadius: '8px',
                                border: '1px solid rgba(0,0,0,0.08)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '11px',
                                color: '#8E8E93',
                                flexShrink: 0
                              }}
                            >
                              No Image
                            </div>
                          )}

                          <div style={{ minWidth: 0 }}>
                            <div
                              style={{
                                fontSize: '13px',
                                fontWeight: 700,
                                color: '#1C1917',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                maxWidth: '170px'
                              }}
                              title={b.title || (isActive ? `Hero Banner #${slotNum}` : 'Hero Banner (Draft)')}
                            >
                              {b.title || (isActive ? `Hero Banner #${slotNum}` : 'Hero Banner (Draft)')}
                            </div>
                            <span
                              style={{
                                display: 'inline-block',
                                fontSize: '10px',
                                color: '#8E8E93',
                                backgroundColor: '#F2F2F7',
                                padding: '1px 5px',
                                borderRadius: '4px',
                                marginTop: '3px',
                                fontFamily: 'SF Pro Text, -apple-system, monospace'
                              }}
                            >
                              2.4 : 1 Mobile Ratio
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Date Added */}
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12.5px', color: '#1C1917' }}>
                          <Calendar size={14} color="#8E8E93" />
                          <span>{dateAddedText}</span>
                        </div>
                      </td>

                      {/* Active Until */}
                      <td>
                        {expired ? (
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              padding: '2px 8px',
                              borderRadius: '6px',
                              fontSize: '11px',
                              fontWeight: 600,
                              backgroundColor: 'rgba(255, 59, 48, 0.1)',
                              color: '#FF3B30'
                            }}
                          >
                            <Clock size={12} />
                            <span>Expired ({expiryText})</span>
                          </span>
                        ) : expiryText ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#636366' }}>
                            <Clock size={14} color="#8E8E93" />
                            <span>{expiryText}</span>
                          </div>
                        ) : (
                          <span style={{ fontSize: '12px', color: '#8E8E93' }}>
                            Always Active (No Expiry)
                          </span>
                        )}
                      </td>

                      {/* SINGLE Status Column with macOS Slide Toggle */}
                      <td style={{ textAlign: 'center' }}>
                        <div
                          onClick={() => toggleStatus(b)}
                          title={isActive ? 'Click to turn OFF (Switch to Inactive / Off-Carousel)' : 'Click to turn ON (Switch to Active Carousel Slot)'}
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
                                toggleStatus(b);
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
                            {expired && (
                              <div style={{ fontSize: '10px', color: '#FF3B30', fontWeight: 600 }}>
                                Expired
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Actions: macOS Rounded Square Styled Buttons */}
                      <td style={{ textAlign: 'right', paddingRight: '20px' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                          {/* Preview Button */}
                          <button
                            type="button"
                            onClick={() => setViewingBanner(b)}
                            style={{
                              width: '32px',
                              height: '32px',
                              borderRadius: '8px',
                              border: '1px solid rgba(0, 0, 0, 0.1)',
                              backgroundColor: '#FFFFFF',
                              color: '#636366',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: 'pointer',
                              boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
                              transition: 'all 120ms ease'
                            }}
                            title="Preview banner"
                          >
                            <Eye size={15} />
                          </button>

                          {/* macOS Edit Button (Apple Blue) */}
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(b)}
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
                            title="Edit banner"
                          >
                            <Pencil size={15} />
                          </button>

                          {/* macOS Delete Button (Apple Red) */}
                          <button
                            type="button"
                            onClick={() => setDeleteCandidate(b)}
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
                            title="Delete banner"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. VIEW BANNER PREVIEW MODAL (macOS Sequoia Window)                      */}
      {/* ========================================================================= */}
      {viewingBanner && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(0, 0, 0, 0.55)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            zIndex: 10000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}
        >
          <div
            style={{
              width: '640px',
              maxWidth: '100%',
              backgroundColor: '#FFFFFF',
              border: '1px solid rgba(0, 0, 0, 0.12)',
              boxShadow: '0 30px 70px rgba(0, 0, 0, 0.35)',
              borderRadius: '16px',
              overflow: 'hidden'
            }}
          >
            {/* macOS Window Title Bar */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 18px',
                background: '#F6F6F6',
                borderBottom: '1px solid rgba(0, 0, 0, 0.08)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <div
                    onClick={() => setViewingBanner(null)}
                    style={{ width: '11px', height: '11px', borderRadius: '50%', backgroundColor: '#FF5F56', cursor: 'pointer' }}
                  />
                  <div style={{ width: '11px', height: '11px', borderRadius: '50%', backgroundColor: '#FFBD2E' }} />
                  <div style={{ width: '11px', height: '11px', borderRadius: '50%', backgroundColor: '#27C93F' }} />
                </div>
                <span style={{ fontSize: '13px', fontWeight: 600, color: '#1C1917', marginLeft: '6px' }}>
                  Hero Banner Preview — {viewingBanner.isActive || viewingBanner.status === 'Active' ? `Slot #${viewingBanner.sortOrder ?? viewingBanner.order ?? 1}` : 'Off Carousel (Inactive)'}
                </span>
              </div>

              <button
                type="button"
                onClick={() => setViewingBanner(null)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#8E8E93',
                  cursor: 'pointer',
                  padding: '4px'
                }}
              >
                <X size={15} />
              </button>
            </div>

            <div style={{ padding: '20px' }}>
              <div
                style={{
                  borderRadius: '10px',
                  overflow: 'hidden',
                  border: '1px solid rgba(0,0,0,0.1)',
                  backgroundColor: '#090D16',
                  marginBottom: '16px'
                }}
              >
                <img
                  src={getAssetUrl(viewingBanner.imageUrl)}
                  alt="Banner Preview"
                  style={{ width: '100%', height: '240px', objectFit: 'cover', display: 'block' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => setViewingBanner(null)}
                  style={{
                    padding: '7px 18px',
                    borderRadius: '8px',
                    border: '1px solid rgba(0,0,0,0.15)',
                    backgroundColor: '#FFFFFF',
                    color: '#48484A',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. CROP & FRAME EDITOR MODAL (2.4 : 1 MOBILE CONTAINER)                   */}
      {/* ========================================================================= */}
      {showCropModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(0, 0, 0, 0.65)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            zIndex: 10050,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px'
          }}
        >
          <div
            style={{
              width: '700px',
              maxWidth: '100%',
              maxHeight: '94vh',
              overflowY: 'auto',
              backgroundColor: '#FFFFFF',
              border: '1px solid rgba(0, 0, 0, 0.12)',
              boxShadow: '0 30px 80px rgba(0, 0, 0, 0.4)',
              borderRadius: '16px',
              overflow: 'hidden'
            }}
          >
            {/* macOS Window Header */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 18px',
                background: '#F6F6F6',
                borderBottom: '1px solid rgba(0, 0, 0, 0.08)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <div
                    onClick={() => setShowCropModal(false)}
                    style={{ width: '11px', height: '11px', borderRadius: '50%', backgroundColor: '#FF5F56', cursor: 'pointer' }}
                  />
                  <div style={{ width: '11px', height: '11px', borderRadius: '50%', backgroundColor: '#FFBD2E' }} />
                  <div style={{ width: '11px', height: '11px', borderRadius: '50%', backgroundColor: '#27C93F' }} />
                </div>
                <span style={{ fontSize: '13px', fontWeight: 600, color: '#1C1917', marginLeft: '6px' }}>
                  Frame Hero Banner — 2.4 : 1 Mobile Container
                </span>
              </div>

              <button
                type="button"
                onClick={() => setShowCropModal(false)}
                style={{ background: 'transparent', border: 'none', color: '#8E8E93', cursor: 'pointer' }}
              >
                <X size={15} />
              </button>
            </div>

            <div style={{ padding: '20px' }}>
              {/* Interactive Frame Container */}
              <div style={{ marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: '#1C1917', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Smartphone size={14} color="#007AFF" />
                    Mobile Screen Aspect Ratio (~2.4 : 1)
                  </span>
                  <span style={{ fontSize: '11px', color: '#8E8E93', fontFamily: 'SF Pro Text, -apple-system, monospace' }}>
                    Drag image to pan / adjust positioning
                  </span>
                </div>

                <div
                  style={{
                    position: 'relative',
                    width: '100%',
                    aspectRatio: '2.4 / 1',
                    maxHeight: '260px',
                    backgroundColor: '#090D16',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    border: '2px solid rgba(0, 122, 255, 0.3)',
                    boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.5)',
                    cursor: isDraggingFrame ? 'grabbing' : 'grab',
                    userSelect: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                  onMouseDown={handleFrameMouseDown}
                  onMouseMove={handleFrameMouseMove}
                  onMouseUp={handleFrameMouseUp}
                  onMouseLeave={handleFrameMouseUp}
                >
                  <img
                    src={previewUrl}
                    alt="Cropping Subject"
                    draggable={false}
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = DEFAULT_PRODUCT_PLACEHOLDER;
                    }}
                    style={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: `translate(calc(-50% + ${cropPanX * 1.5}px), calc(-50% + ${cropPanY * 1.5}px)) scale(${cropZoom / 100})`,
                      transformOrigin: 'center center',
                      width: cropFitMode === 'cover' ? '100%' : 'auto',
                      height: cropFitMode === 'cover' ? '100%' : 'auto',
                      maxWidth: cropFitMode === 'contain' ? '100%' : 'none',
                      maxHeight: cropFitMode === 'contain' ? '100%' : 'none',
                      objectFit: cropFitMode,
                      pointerEvents: 'none',
                      transition: isDraggingFrame ? 'none' : 'transform 100ms ease-out'
                    }}
                  />

                  {/* Grid Lines Overlay */}
                  <div
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr 1fr',
                      gridTemplateRows: '1fr 1fr 1fr',
                      pointerEvents: 'none',
                      border: '1px solid rgba(255, 255, 255, 0.15)'
                    }}
                  >
                    <div style={{ borderRight: '1px dashed rgba(255,255,255,0.2)', borderBottom: '1px dashed rgba(255,255,255,0.2)' }} />
                    <div style={{ borderRight: '1px dashed rgba(255,255,255,0.2)', borderBottom: '1px dashed rgba(255,255,255,0.2)' }} />
                    <div style={{ borderBottom: '1px dashed rgba(255,255,255,0.2)' }} />
                    <div style={{ borderRight: '1px dashed rgba(255,255,255,0.2)', borderBottom: '1px dashed rgba(255,255,255,0.2)' }} />
                    <div style={{ borderRight: '1px dashed rgba(255,255,255,0.2)', borderBottom: '1px dashed rgba(255,255,255,0.2)' }} />
                    <div style={{ borderBottom: '1px dashed rgba(255,255,255,0.2)' }} />
                    <div style={{ borderRight: '1px dashed rgba(255,255,255,0.2)' }} />
                    <div style={{ borderRight: '1px dashed rgba(255,255,255,0.2)' }} />
                    <div />
                  </div>

                  <div
                    style={{
                      position: 'absolute',
                      bottom: '8px',
                      right: '8px',
                      backgroundColor: 'rgba(0, 0, 0, 0.7)',
                      color: '#FFFFFF',
                      fontSize: '11px',
                      padding: '3px 8px',
                      borderRadius: '5px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      pointerEvents: 'none'
                    }}
                  >
                    <Move size={11} />
                    <span>Drag to reposition</span>
                  </div>
                </div>
              </div>

              {/* Sliders & Controls */}
              <div
                style={{
                  backgroundColor: '#F9F9FB',
                  padding: '16px',
                  borderRadius: '10px',
                  border: '1px solid rgba(0,0,0,0.06)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  marginBottom: '18px'
                }}
              >
                {/* Zoom */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <label style={{ fontSize: '12px', fontWeight: 600, color: '#1C1917', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <ZoomIn size={13} color="#007AFF" />
                      <span>Zoom / Scale ({cropZoom}%)</span>
                    </label>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <button
                      type="button"
                      onClick={() => setCropZoom((prev) => Math.max(100, prev - 10))}
                      style={{ padding: '3px 8px', borderRadius: '5px', border: '1px solid rgba(0,0,0,0.1)', background: '#fff', cursor: 'pointer' }}
                    >
                      <ZoomOut size={12} />
                    </button>
                    <input
                      type="range"
                      min="100"
                      max="300"
                      step="5"
                      value={cropZoom}
                      onChange={(e) => setCropZoom(Number(e.target.value))}
                      style={{ flex: 1, accentColor: '#007AFF', cursor: 'pointer' }}
                    />
                    <button
                      type="button"
                      onClick={() => setCropZoom((prev) => Math.min(300, prev + 10))}
                      style={{ padding: '3px 8px', borderRadius: '5px', border: '1px solid rgba(0,0,0,0.1)', background: '#fff', cursor: 'pointer' }}
                    >
                      <ZoomIn size={12} />
                    </button>
                  </div>
                </div>

                {/* Vertical Alignment */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <label style={{ fontSize: '12px', fontWeight: 600, color: '#1C1917' }}>Vertical Offset</label>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      <button
                        type="button"
                        onClick={() => setCropPanY(-30)}
                        style={{ padding: '2px 8px', fontSize: '10px', borderRadius: '4px', border: '1px solid rgba(0,0,0,0.1)', background: cropPanY === -30 ? '#007AFF' : '#fff', color: cropPanY === -30 ? '#fff' : 'inherit', cursor: 'pointer' }}
                      >
                        Top
                      </button>
                      <button
                        type="button"
                        onClick={() => setCropPanY(0)}
                        style={{ padding: '2px 8px', fontSize: '10px', borderRadius: '4px', border: '1px solid rgba(0,0,0,0.1)', background: cropPanY === 0 ? '#007AFF' : '#fff', color: cropPanY === 0 ? '#fff' : 'inherit', cursor: 'pointer' }}
                      >
                        Center
                      </button>
                      <button
                        type="button"
                        onClick={() => setCropPanY(30)}
                        style={{ padding: '2px 8px', fontSize: '10px', borderRadius: '4px', border: '1px solid rgba(0,0,0,0.1)', background: cropPanY === 30 ? '#007AFF' : '#fff', color: cropPanY === 30 ? '#fff' : 'inherit', cursor: 'pointer' }}
                      >
                        Bottom
                      </button>
                    </div>
                  </div>
                  <input
                    type="range"
                    min="-50"
                    max="50"
                    step="1"
                    value={cropPanY}
                    onChange={(e) => setCropPanY(Number(e.target.value))}
                    style={{ width: '100%', accentColor: '#007AFF', cursor: 'pointer' }}
                  />
                </div>

                {/* Horizontal Alignment */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <label style={{ fontSize: '12px', fontWeight: 600, color: '#1C1917' }}>Horizontal Offset</label>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      <button
                        type="button"
                        onClick={() => setCropPanX(-30)}
                        style={{ padding: '2px 8px', fontSize: '10px', borderRadius: '4px', border: '1px solid rgba(0,0,0,0.1)', background: cropPanX === -30 ? '#007AFF' : '#fff', color: cropPanX === -30 ? '#fff' : 'inherit', cursor: 'pointer' }}
                      >
                        Left
                      </button>
                      <button
                        type="button"
                        onClick={() => setCropPanX(0)}
                        style={{ padding: '2px 8px', fontSize: '10px', borderRadius: '4px', border: '1px solid rgba(0,0,0,0.1)', background: cropPanX === 0 ? '#007AFF' : '#fff', color: cropPanX === 0 ? '#fff' : 'inherit', cursor: 'pointer' }}
                      >
                        Center
                      </button>
                      <button
                        type="button"
                        onClick={() => setCropPanX(30)}
                        style={{ padding: '2px 8px', fontSize: '10px', borderRadius: '4px', border: '1px solid rgba(0,0,0,0.1)', background: cropPanX === 30 ? '#007AFF' : '#fff', color: cropPanX === 30 ? '#fff' : 'inherit', cursor: 'pointer' }}
                      >
                        Right
                      </button>
                    </div>
                  </div>
                  <input
                    type="range"
                    min="-50"
                    max="50"
                    step="1"
                    value={cropPanX}
                    onChange={(e) => setCropPanX(Number(e.target.value))}
                    style={{ width: '100%', accentColor: '#007AFF', cursor: 'pointer' }}
                  />
                </div>

                {/* Reset & Fit Toolbar */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '6px', borderTop: '1px solid rgba(0,0,0,0.06)' }}>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button
                      type="button"
                      onClick={() => setCropFitMode('cover')}
                      style={{
                        padding: '4px 10px',
                        borderRadius: '6px',
                        fontSize: '11px',
                        fontWeight: 600,
                        border: `1px solid ${cropFitMode === 'cover' ? '#007AFF' : 'rgba(0,0,0,0.1)'}`,
                        backgroundColor: cropFitMode === 'cover' ? '#007AFF' : '#fff',
                        color: cropFitMode === 'cover' ? '#fff' : '#48484A',
                        cursor: 'pointer'
                      }}
                    >
                      Cover (Fill Container)
                    </button>
                    <button
                      type="button"
                      onClick={() => setCropFitMode('contain')}
                      style={{
                        padding: '4px 10px',
                        borderRadius: '6px',
                        fontSize: '11px',
                        fontWeight: 600,
                        border: `1px solid ${cropFitMode === 'contain' ? '#007AFF' : 'rgba(0,0,0,0.1)'}`,
                        backgroundColor: cropFitMode === 'contain' ? '#007AFF' : '#fff',
                        color: cropFitMode === 'contain' ? '#fff' : '#48484A',
                        cursor: 'pointer'
                      }}
                    >
                      Contain (Full Image)
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setCropZoom(100);
                      setCropPanX(0);
                      setCropPanY(0);
                      setCropFitMode('cover');
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '4px 10px',
                      borderRadius: '6px',
                      fontSize: '11px',
                      border: '1px solid rgba(0,0,0,0.1)',
                      background: '#fff',
                      color: '#48484A',
                      cursor: 'pointer'
                    }}
                  >
                    <RotateCcw size={12} />
                    <span>Reset</span>
                  </button>
                </div>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setShowCropModal(false)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '8px',
                    border: '1px solid rgba(0,0,0,0.15)',
                    backgroundColor: '#fff',
                    color: '#48484A',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleApplyCrop}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 20px',
                    borderRadius: '8px',
                    backgroundColor: '#007AFF',
                    color: '#fff',
                    border: 'none',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    boxShadow: '0 2px 8px rgba(0, 122, 255, 0.3)'
                  }}
                >
                  <Check size={14} />
                  <span>Apply & Use Framed Image</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. UPLOAD / EDIT BANNER MODAL (macOS Sequoia Window & Gallery Picker)     */}
      {/* ========================================================================= */}
      {showModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(0, 0, 0, 0.55)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            zIndex: 10000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}
        >
          <div
            style={{
              width: '640px',
              maxWidth: '100%',
              maxHeight: '92vh',
              overflowY: 'auto',
              backgroundColor: '#FFFFFF',
              border: '1px solid rgba(0, 0, 0, 0.12)',
              boxShadow: '0 30px 80px rgba(0, 0, 0, 0.35)',
              borderRadius: '16px',
              overflow: 'hidden'
            }}
          >
            {/* macOS Window Chrome Header */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 18px',
                background: '#F6F6F6',
                borderBottom: '1px solid rgba(0, 0, 0, 0.08)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <div
                    onClick={() => setShowModal(false)}
                    style={{ width: '11px', height: '11px', borderRadius: '50%', backgroundColor: '#FF5F56', cursor: 'pointer' }}
                  />
                  <div style={{ width: '11px', height: '11px', borderRadius: '50%', backgroundColor: '#FFBD2E' }} />
                  <div style={{ width: '11px', height: '11px', borderRadius: '50%', backgroundColor: '#27C93F' }} />
                </div>
                <span style={{ fontSize: '13px', fontWeight: 600, color: '#1C1917', marginLeft: '6px' }}>
                  {editingBanner ? `Edit Banner — Slot #${formData.order}` : `Upload Banner to Hero Slider`}
                </span>
              </div>

              <button
                type="button"
                onClick={() => setShowModal(false)}
                style={{ background: 'transparent', border: 'none', color: '#8E8E93', cursor: 'pointer' }}
              >
                <X size={15} />
              </button>
            </div>

            <div style={{ padding: '22px' }}>
              {/* Banner Name Field */}
              <div style={{ marginBottom: '18px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#1C1917', marginBottom: '6px' }}>
                  Banner Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Mega Summer Discount / Diwali Mega Carnival"
                  value={formData.title}
                  onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: '1px solid rgba(0, 0, 0, 0.15)',
                    fontSize: '13px',
                    color: '#1C1917',
                    outline: 'none',
                    backgroundColor: '#FFFFFF',
                    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.02)'
                  }}
                />
                <span style={{ fontSize: '11px', color: '#8E8E93', marginTop: '4px', display: 'block' }}>
                  Give this banner an identifiable name to find it easily in search and lists.
                </span>
              </div>

              {/* Image Source Segmented Selector */}
              <div style={{ marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <label style={{ fontSize: '13px', fontWeight: 600, color: '#1C1917' }}>
                    Select Banner Image *
                  </label>

                  {/* macOS Segmented Tab Control */}
                  <div
                    style={{
                      display: 'inline-flex',
                      padding: '3px',
                      borderRadius: '8px',
                      backgroundColor: '#EEEEF0',
                      border: '1px solid rgba(0, 0, 0, 0.04)'
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => setMediaSource('device')}
                      style={{
                        padding: '4px 12px',
                        borderRadius: '6px',
                        fontSize: '11.5px',
                        fontWeight: 600,
                        border: 'none',
                        cursor: 'pointer',
                        transition: 'all 120ms ease',
                        backgroundColor: mediaSource === 'device' ? '#FFFFFF' : 'transparent',
                        color: mediaSource === 'device' ? '#1C1917' : '#636366',
                        boxShadow: mediaSource === 'device' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
                      }}
                    >
                      Upload from Device
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setMediaSource('gallery');
                        if (galleryItems.length === 0) loadGalleryMedia();
                      }}
                      style={{
                        padding: '4px 12px',
                        borderRadius: '6px',
                        fontSize: '11.5px',
                        fontWeight: 600,
                        border: 'none',
                        cursor: 'pointer',
                        transition: 'all 120ms ease',
                        backgroundColor: mediaSource === 'gallery' ? '#FFFFFF' : 'transparent',
                        color: mediaSource === 'gallery' ? '#1C1917' : '#636366',
                        boxShadow: mediaSource === 'gallery' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
                      }}
                    >
                      Select from Gallery
                    </button>

                    <button
                      type="button"
                      onClick={() => setMediaSource('url')}
                      style={{
                        padding: '4px 12px',
                        borderRadius: '6px',
                        fontSize: '11.5px',
                        fontWeight: 600,
                        border: 'none',
                        cursor: 'pointer',
                        transition: 'all 120ms ease',
                        backgroundColor: mediaSource === 'url' ? '#FFFFFF' : 'transparent',
                        color: mediaSource === 'url' ? '#1C1917' : '#636366',
                        boxShadow: mediaSource === 'url' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
                      }}
                    >
                      Image URL
                    </button>
                  </div>
                </div>

                {/* MODE A: Upload from Device */}
                {mediaSource === 'device' && (
                  <div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/png,image/jpeg,image/jpg,image/webp"
                      style={{ display: 'none' }}
                      onChange={(e) => {
                        if (e.target.files?.[0]) handleFileChange(e.target.files[0]);
                      }}
                    />

                    {previewUrl ? (
                      <div
                        style={{
                          borderRadius: '10px',
                          overflow: 'hidden',
                          border: '1px solid rgba(0,0,0,0.1)',
                          backgroundColor: '#090D16'
                        }}
                      >
                        <div style={{ position: 'relative', width: '100%', height: '180px' }}>
                          <img
                            src={previewUrl}
                            alt="Banner Preview"
                            onError={(e) => {
                              e.currentTarget.onerror = null;
                              e.currentTarget.src = DEFAULT_PRODUCT_PLACEHOLDER;
                            }}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                          <div
                            style={{
                              position: 'absolute',
                              top: '8px',
                              left: '8px',
                              backgroundColor: 'rgba(0, 0, 0, 0.75)',
                              color: '#fff',
                              fontSize: '11px',
                              fontWeight: 600,
                              padding: '3px 8px',
                              borderRadius: '5px',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}
                          >
                            <Smartphone size={12} color="#007AFF" />
                            <span>Mobile Hero Container Preview</span>
                          </div>
                        </div>

                        <div
                          style={{
                            padding: '10px 14px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            backgroundColor: '#FFFFFF',
                            borderTop: '1px solid rgba(0,0,0,0.08)'
                          }}
                        >
                          <span style={{ fontSize: '12px', fontWeight: 600, color: '#1C1917', maxWidth: '240px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {selectedFile ? selectedFile.name : 'Current Banner Creative'}
                          </span>

                          <div style={{ display: 'flex', gap: '6px' }}>
                            <button
                              type="button"
                              onClick={handleOpenCropModal}
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                padding: '5px 10px',
                                borderRadius: '6px',
                                border: '1px solid rgba(0, 122, 255, 0.3)',
                                backgroundColor: 'rgba(0, 122, 255, 0.08)',
                                color: '#007AFF',
                                fontSize: '11.5px',
                                fontWeight: 600,
                                cursor: 'pointer'
                              }}
                            >
                              <Crop size={12} />
                              <span>Crop / Position</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => fileInputRef.current?.click()}
                              style={{
                                padding: '5px 10px',
                                borderRadius: '6px',
                                border: '1px solid rgba(0,0,0,0.12)',
                                backgroundColor: '#fff',
                                fontSize: '11.5px',
                                fontWeight: 500,
                                cursor: 'pointer'
                              }}
                            >
                              Change
                            </button>

                            <button
                              type="button"
                              onClick={handleRemoveImage}
                              style={{
                                padding: '5px 8px',
                                borderRadius: '6px',
                                border: '1px solid rgba(255, 59, 48, 0.25)',
                                backgroundColor: 'rgba(255, 59, 48, 0.08)',
                                color: '#FF3B30',
                                cursor: 'pointer'
                              }}
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div
                        onClick={() => fileInputRef.current?.click()}
                        onDragOver={(e) => {
                          e.preventDefault();
                          setIsDragging(true);
                        }}
                        onDragLeave={(e) => {
                          e.preventDefault();
                          setIsDragging(false);
                        }}
                        onDrop={(e) => {
                          e.preventDefault();
                          setIsDragging(false);
                          if (e.dataTransfer.files?.[0]) handleFileChange(e.dataTransfer.files[0]);
                        }}
                        style={{
                          border: `1.5px dashed ${isDragging ? '#007AFF' : 'rgba(0,0,0,0.18)'}`,
                          borderRadius: '12px',
                          padding: '30px 16px',
                          textAlign: 'center',
                          backgroundColor: isDragging ? 'rgba(0, 122, 255, 0.04)' : '#F9F9FB',
                          cursor: 'pointer',
                          transition: 'all 140ms ease'
                        }}
                      >
                        <div
                          style={{
                            width: '44px',
                            height: '44px',
                            borderRadius: '50%',
                            backgroundColor: '#FFFFFF',
                            border: '1px solid rgba(0,0,0,0.08)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 10px auto',
                            color: '#007AFF'
                          }}
                        >
                          <UploadCloud size={22} />
                        </div>
                        <div style={{ fontSize: '13px', fontWeight: 600, color: '#1C1917' }}>
                          Click to select banner image, or drag and drop
                        </div>
                        <div style={{ fontSize: '11.5px', color: '#8E8E93', marginTop: '4px' }}>
                          PNG, JPG, or WEBP (2.4:1 ratio recommended, up to 10MB)
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* MODE B: Select from Media Gallery */}
                {mediaSource === 'gallery' && (
                  <div
                    style={{
                      border: '1px solid rgba(0,0,0,0.1)',
                      borderRadius: '12px',
                      padding: '12px',
                      backgroundColor: '#F9F9FB'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                      <span style={{ fontSize: '12px', fontWeight: 600, color: '#636366' }}>
                        Click any uploaded thumbnail to select:
                      </span>

                      <button
                        type="button"
                        onClick={loadGalleryMedia}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          background: 'none',
                          border: 'none',
                          color: '#007AFF',
                          fontSize: '11.5px',
                          fontWeight: 600,
                          cursor: 'pointer'
                        }}
                      >
                        <RefreshCw size={11} className={galleryLoading ? 'animate-spin' : ''} />
                        <span>Refresh Gallery</span>
                      </button>
                    </div>

                    {galleryLoading ? (
                      <div style={{ padding: '30px', textAlign: 'center', color: '#8E8E93' }}>
                        <RefreshCw size={16} className="animate-spin" />
                        <span style={{ fontSize: '12px', marginLeft: '6px' }}>Loading media gallery...</span>
                      </div>
                    ) : galleryItems.length === 0 ? (
                      <div style={{ padding: '24px', textAlign: 'center' }}>
                        <ImageIcon size={28} color="#8E8E93" style={{ opacity: 0.5, marginBottom: '6px' }} />
                        <div style={{ fontSize: '12.5px', fontWeight: 600, color: '#1C1917' }}>
                          No images found in Gallery
                        </div>
                        <div style={{ fontSize: '11px', color: '#8E8E93', marginTop: '2px' }}>
                          Upload images via "Upload from Device" or visit the Media Gallery tab.
                        </div>
                      </div>
                    ) : (
                      <div
                        style={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))',
                          gap: '8px',
                          maxHeight: '180px',
                          overflowY: 'auto',
                          paddingRight: '4px'
                        }}
                      >
                        {galleryItems.map((item) => {
                          const isSelected =
                            selectedGalleryUrl === item.url ||
                            formData.imageUrl === item.url;
                          return (
                            <div
                              key={item.id || item.url}
                              onClick={() => handleSelectGalleryItem(item)}
                              style={{
                                position: 'relative',
                                height: '70px',
                                borderRadius: '8px',
                                overflow: 'hidden',
                                border: isSelected
                                  ? '2px solid #007AFF'
                                  : '1px solid rgba(0,0,0,0.1)',
                                cursor: 'pointer',
                                backgroundColor: '#090D16',
                                transition: 'all 120ms ease'
                              }}
                              title={item.name}
                            >
                              <img
                                src={getAssetUrl(item.url)}
                                alt={item.name}
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                              />
                              {isSelected && (
                                <div
                                  style={{
                                    position: 'absolute',
                                    top: '4px',
                                    right: '4px',
                                    width: '18px',
                                    height: '18px',
                                    borderRadius: '50%',
                                    backgroundColor: '#007AFF',
                                    color: '#fff',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    boxShadow: '0 1px 3px rgba(0,0,0,0.3)'
                                  }}
                                >
                                  <Check size={11} strokeWidth={3} />
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {previewUrl && (
                      <div style={{ marginTop: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '8px', borderTop: '1px solid rgba(0,0,0,0.06)' }}>
                        <span style={{ fontSize: '11.5px', color: '#248A3D', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <CheckCircle2 size={13} />
                          Image Selected
                        </span>
                        <button
                          type="button"
                          onClick={handleOpenCropModal}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            padding: '4px 10px',
                            borderRadius: '6px',
                            border: '1px solid rgba(0, 122, 255, 0.3)',
                            backgroundColor: 'rgba(0, 122, 255, 0.08)',
                            color: '#007AFF',
                            fontSize: '11.5px',
                            fontWeight: 600,
                            cursor: 'pointer'
                          }}
                        >
                          <Crop size={12} />
                          <span>Crop & Frame for Container</span>
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* MODE C: Direct Image URL */}
                {mediaSource === 'url' && (
                  <div>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="https://images.unsplash.com/... or CDN link"
                      value={formData.imageUrl}
                      onChange={(e) => {
                        const val = e.target.value;
                        setFormData((prev) => ({ ...prev, imageUrl: val }));
                        setPreviewUrl(val);
                      }}
                      style={{
                        borderRadius: '8px',
                        borderColor: 'rgba(0,0,0,0.15)',
                        fontSize: '13px'
                      }}
                    />
                    {previewUrl && (
                      <div style={{ marginTop: '8px', display: 'flex', justifyContent: 'flex-end' }}>
                        <button
                          type="button"
                          onClick={handleOpenCropModal}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            padding: '4px 10px',
                            borderRadius: '6px',
                            border: '1px solid rgba(0, 122, 255, 0.3)',
                            backgroundColor: 'rgba(0, 122, 255, 0.08)',
                            color: '#007AFF',
                            fontSize: '11.5px',
                            fontWeight: 600,
                            cursor: 'pointer'
                          }}
                        >
                          <Crop size={12} />
                          <span>Crop & Frame for Container</span>
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Display Slot Locking & Conflict Handling (Active Banners Only) */}
              <div
                style={{
                  backgroundColor: '#F9F9FB',
                  border: '1px solid rgba(0,0,0,0.08)',
                  borderRadius: '12px',
                  padding: '16px',
                  marginBottom: '16px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <label style={{ fontSize: '13px', fontWeight: 600, color: '#1C1917', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Layers size={14} color="#007AFF" />
                    <span>Carousel Display Slot</span>
                  </label>

                  <span style={{ fontSize: '12px', color: '#8E8E93' }}>
                    Active Carousel Banners: {activeCount}
                  </span>
                </div>

                {isFormActive ? (
                  <>
                    {/* Discrete Slot Buttons (1-to-1 Unique Slots) */}
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '10px' }}>
                      {Array.from(
                        { length: Math.max(activeCount + (editingBanner && (editingBanner.status === 'Active' || editingBanner.isActive) ? 0 : 1), 5) },
                        (_, i) => i + 1
                      ).map((slot) => {
                        const isSelected = targetSlotNum === slot;
                        const isOccupied = activeBanners.some((b) => {
                          const bId = b.id || b._id;
                          if (currentEditingId && bId === currentEditingId) return false;
                          const bSlot = b.sortOrder ?? b.order ?? 1;
                          return bSlot === slot;
                        });

                        return (
                          <button
                            key={slot}
                            type="button"
                            onClick={() => setFormData((prev) => ({ ...prev, order: slot }))}
                            style={{
                              padding: '6px 14px',
                              borderRadius: '8px',
                              fontSize: '12.5px',
                              fontWeight: 700,
                              cursor: 'pointer',
                              transition: 'all 120ms ease',
                              border: isSelected
                                ? '1.5px solid #007AFF'
                                : isOccupied
                                ? '1px solid rgba(255, 149, 0, 0.4)'
                                : '1px solid rgba(0,0,0,0.1)',
                              backgroundColor: isSelected
                                ? '#007AFF'
                                : isOccupied
                                ? 'rgba(255, 149, 0, 0.08)'
                                : '#FFFFFF',
                              color: isSelected
                                ? '#FFFFFF'
                                : isOccupied
                                ? '#D97706'
                                : '#1C1917',
                              boxShadow: isSelected ? '0 2px 6px rgba(0, 122, 255, 0.3)' : 'none'
                            }}
                          >
                            Slot {slot}
                            {isOccupied && !isSelected && ' •'}
                          </button>
                        );
                      })}
                    </div>

                    {/* macOS Conflict Resolution Prompt */}
                    {conflictingBanner && (
                      <div
                        style={{
                          backgroundColor: 'rgba(255, 149, 0, 0.08)',
                          border: '1px solid rgba(255, 149, 0, 0.3)',
                          borderRadius: '8px',
                          padding: '12px 14px',
                          marginTop: '8px'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                          <AlertCircle size={15} color="#D97706" />
                          <span style={{ fontSize: '12.5px', fontWeight: 700, color: '#B45309' }}>
                            Slot #{targetSlotNum} is currently occupied!
                          </span>
                        </div>

                        <p style={{ fontSize: '12px', color: '#78350F', margin: '0 0 10px 0', lineHeight: 1.4 }}>
                          Another active banner is already assigned to Slot #{targetSlotNum}. How would you like to resolve this slot conflict?
                        </p>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', cursor: 'pointer', color: '#1C1917' }}>
                            <input
                              type="radio"
                              name="slotAction"
                              checked={formData.slotAction === 'shift'}
                              onChange={() => setFormData((prev) => ({ ...prev, slotAction: 'shift' }))}
                              style={{ accentColor: '#007AFF' }}
                            />
                            <span>
                              <strong>Shift down:</strong> Insert into Slot #{targetSlotNum} and shift current banner to #{targetSlotNum + 1}
                            </span>
                          </label>

                          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', cursor: 'pointer', color: '#1C1917' }}>
                            <input
                              type="radio"
                              name="slotAction"
                              checked={formData.slotAction === 'swap'}
                              onChange={() => setFormData((prev) => ({ ...prev, slotAction: 'swap' }))}
                              style={{ accentColor: '#007AFF' }}
                            />
                            <span>
                              <strong>Swap positions:</strong> Swap slots with the banner currently occupying Slot #{targetSlotNum}
                            </span>
                          </label>

                          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', cursor: 'pointer', color: '#1C1917' }}>
                            <input
                              type="radio"
                              name="slotAction"
                              checked={formData.slotAction === 'replace'}
                              onChange={() => setFormData((prev) => ({ ...prev, slotAction: 'replace' }))}
                              style={{ accentColor: '#007AFF' }}
                            />
                            <span>
                              <strong>Replace & Deactivate:</strong> Take Slot #{targetSlotNum} and move previous banner off-carousel
                            </span>
                          </label>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      backgroundColor: 'rgba(142, 142, 147, 0.08)',
                      border: '1px solid rgba(142, 142, 147, 0.18)',
                      borderRadius: '8px',
                      padding: '12px 14px'
                    }}
                  >
                    <Layers size={18} color="#8E8E93" />
                    <div>
                      <div style={{ fontSize: '12.5px', fontWeight: 600, color: '#1C1917' }}>
                        Off Carousel (No Slot Assigned)
                      </div>
                      <div style={{ fontSize: '11.5px', color: '#636366', marginTop: '2px', lineHeight: 1.4 }}>
                        Inactive banners do not occupy any slot in the active mobile hero slider. Once turned ON, this banner will automatically join the active carousel list.
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Set Time Till When Banner Will Be Active */}
              <div
                style={{
                  backgroundColor: '#F9F9FB',
                  padding: '14px',
                  borderRadius: '10px',
                  marginBottom: '16px',
                  border: '1px solid rgba(0,0,0,0.08)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <label style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12.5px', fontWeight: 600, color: '#1C1917' }}>
                    <Clock size={14} color="#007AFF" />
                    <span>Active Until (Expiration Date & Time)</span>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', cursor: 'pointer', userSelect: 'none' }}>
                    <input
                      type="checkbox"
                      checked={formData.noExpiry}
                      onChange={(e) => setFormData({ ...formData, noExpiry: e.target.checked })}
                      style={{ accentColor: '#007AFF' }}
                    />
                    <span style={{ fontWeight: 500, color: '#57534E' }}>No Expiry (Always Active)</span>
                  </label>
                </div>

                {!formData.noExpiry && (
                  <div>
                    <input
                      type="datetime-local"
                      className="form-input"
                      value={formData.validUntil}
                      onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
                      style={{ borderRadius: '8px', borderColor: 'rgba(0,0,0,0.15)', fontSize: '13px' }}
                    />
                    <div style={{ fontSize: '11px', color: '#8E8E93', marginTop: '4px' }}>
                      Banner will automatically deactivate after this date and time.
                    </div>
                  </div>
                )}
              </div>

              {/* Status and Placement Row */}
              <div className="admin-grid-2">
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" style={{ fontSize: '12.5px', fontWeight: 600 }}>
                    Placement
                  </label>
                  <select
                    className="form-select"
                    value={formData.placement || 'home_hero'}
                    disabled
                    style={{ borderRadius: '8px', backgroundColor: '#F2F2F7', color: '#1C1917', fontSize: '13px' }}
                  >
                    <option value="home_hero">Hero Banner Slider</option>
                  </select>
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" style={{ fontSize: '12.5px', fontWeight: 600 }}>
                    Initial Status
                  </label>
                  <select
                    className="form-select"
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    style={{ borderRadius: '8px', fontSize: '13px' }}
                  >
                    <option value="Active">Active (Turned ON)</option>
                    <option value="Inactive">Inactive (Turned OFF)</option>
                  </select>
                </div>
              </div>

              {/* Modal Actions */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: '10px',
                  marginTop: '22px',
                  paddingTop: '16px',
                  borderTop: '1px solid rgba(0, 0, 0, 0.08)'
                }}
              >
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  style={{
                    padding: '8px 18px',
                    borderRadius: '8px',
                    border: '1px solid rgba(0,0,0,0.15)',
                    backgroundColor: '#FFFFFF',
                    color: '#48484A',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveBanner}
                  disabled={isSubmitting || (!selectedFile && !formData.imageUrl.trim() && !previewUrl)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    backgroundColor: '#007AFF',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '8px 20px',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor:
                      isSubmitting || (!selectedFile && !formData.imageUrl.trim() && !previewUrl)
                        ? 'not-allowed'
                        : 'pointer',
                    opacity:
                      isSubmitting || (!selectedFile && !formData.imageUrl.trim() && !previewUrl)
                        ? 0.6
                        : 1,
                    boxShadow: '0 2px 8px rgba(0, 122, 255, 0.3)',
                    transition: 'all 140ms ease'
                  }}
                >
                  {isSubmitting && <RefreshCw size={14} className="animate-spin" />}
                  <span>{editingBanner ? 'Save Changes' : `Publish to Slot #${targetSlotNum}`}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. DELETE CONFIRMATION MODAL (macOS Sequoia Alert Sheet)                 */}
      {/* ========================================================================= */}
      {deleteCandidate && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(0, 0, 0, 0.55)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            zIndex: 10001,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}
        >
          <div
            style={{
              width: '420px',
              maxWidth: '100%',
              backgroundColor: '#FFFFFF',
              border: '1px solid rgba(0, 0, 0, 0.12)',
              boxShadow: '0 30px 80px rgba(0, 0, 0, 0.35)',
              borderRadius: '16px',
              padding: '24px',
              textAlign: 'center'
            }}
          >
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                backgroundColor: 'rgba(255, 59, 48, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 14px auto',
                color: '#FF3B30'
              }}
            >
              <Trash2 size={24} />
            </div>

            <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 700, color: '#1C1917' }}>
              Delete Hero Banner?
            </h3>
            <p style={{ fontSize: '13px', color: '#636366', margin: '10px 0 22px 0', lineHeight: 1.5 }}>
              Are you sure you want to delete {deleteCandidate.title ? `"${deleteCandidate.title}"` : `Banner in Slot #${deleteCandidate.sortOrder ?? deleteCandidate.order ?? 1}`}? This action cannot be undone.
            </p>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
              <button
                type="button"
                onClick={() => setDeleteCandidate(null)}
                style={{
                  padding: '8px 20px',
                  borderRadius: '8px',
                  border: '1px solid rgba(0, 0, 0, 0.15)',
                  backgroundColor: '#FFFFFF',
                  color: '#48484A',
                  fontSize: '13px',
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
                  padding: '8px 20px',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: '#FF3B30',
                  color: '#FFFFFF',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(255, 59, 48, 0.3)'
                }}
              >
                Delete Banner
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
