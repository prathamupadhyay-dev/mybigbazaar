// ============================================================
// MyBigBazaar Admin — Ad Campaign Banner CMS (Promotional Space)
// macOS Sequoia Native Architecture & Apple System Design Tokens
// Pure Image Promotional Banner Container placed directly above Best Sellers
// Strictly 1 Active Banner at a Time (No sliding interval needed)
// Features:
// - Live Spotlight Card with 1/1 Active Indicator
// - macOS Slide Switch for Single-Active Status
// - "Activate Next" Instant Promotion for Queued Campaigns
// - Pure Image Creative Upload (Device, Gallery, URL)
// - 2.4 : 1 Aspect Ratio Crop & Frame Canvas Editor
// - Schedule Duration & Expiry Management (validUntil / noExpiry)
// - Realistic Apple iPhone Mobile Viewport Mockup Modal
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
  FolderOpen,
  ExternalLink,
  Sparkles,
  Info,
  Radio,
  Play,
  Layers,
  ArrowRight
} from 'lucide-react';
import PageHeader from '../components/ui/PageHeader';
import { apiFetch } from '../utils/api';
import { getAssetUrl, DEFAULT_PRODUCT_PLACEHOLDER } from '../config';

const PLACEMENT = 'promotions';

export default function AdCampaigns() {
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

  // Image Crop & Frame Editor State (2.4 : 1 Container)
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
    placement: PLACEMENT,
    targetScreen: 'PostAd',
    linkUrl: '',
    validUntil: '',
    noExpiry: true,
    status: 'Active'
  });

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const isExpired = (validUntil) => {
    if (!validUntil || validUntil === '2026-12-31' || validUntil === '') return false;
    const expTime = new Date(validUntil).getTime();
    return !isNaN(expTime) && expTime < Date.now();
  };

  // Separate active banners and inactive queued banners
  const activeBanners = banners.filter(
    (b) => (b.status === 'Active' || b.isActive === true) && !isExpired(b.validUntil)
  );
  const inactiveBanners = banners.filter(
    (b) => b.status === 'Inactive' || b.isActive === false || isExpired(b.validUntil)
  );

  const activeBanner = activeBanners[0] || null;
  const activeCount = activeBanners.length;
  const inactiveCount = inactiveBanners.length;

  // Filtered banners based on search and active tab
  const displayedBanners = banners
    .filter((b) => {
      const isActive = (b.status === 'Active' || b.isActive === true) && !isExpired(b.validUntil);
      if (activeTab === 'active') return isActive;
      if (activeTab === 'inactive') return !isActive;
      return true;
    })
    .filter((b) => {
      if (!searchTerm.trim()) return true;
      const term = searchTerm.toLowerCase();
      return (
        (b.title || '').toLowerCase().includes(term) ||
        (b.targetScreen || '').toLowerCase().includes(term) ||
        (b.linkUrl || '').toLowerCase().includes(term)
      );
    });

  // Load Promotional Banners from backend
  const loadBanners = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiFetch(`/api/v1/cms/banners?placement=${PLACEMENT}&all=true`);
      const json = await res.json();
      if (json && Array.isArray(json.data)) {
        setBanners(json.data);
      } else {
        setBanners([]);
      }
    } catch (err) {
      console.warn('Failed to load promotional banners:', err);
      showToast('Failed to load promotional banners', 'error');
    } finally {
      setLoading(false);
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
  }, [loadBanners]);

  // Open Add Banner Modal
  const handleOpenAdd = () => {
    setEditingBanner(null);
    setSelectedFile(null);
    setPreviewUrl('');
    setSelectedGalleryUrl('');
    setMediaSource('device');

    setFormData({
      title: `Promotional Campaign #${banners.length + 1}`,
      imageUrl: '',
      placement: PLACEMENT,
      targetScreen: 'PostAd',
      linkUrl: '',
      validUntil: '',
      noExpiry: true,
      status: activeCount === 0 ? 'Active' : 'Inactive'
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

    setFormData({
      title: banner.title || '',
      imageUrl: banner.imageUrl || '',
      placement: PLACEMENT,
      targetScreen: banner.targetScreen || 'PostAd',
      linkUrl: banner.linkUrl || '',
      validUntil: formattedDate,
      noExpiry: !hasExpiry,
      status: isCurrentActive ? 'Active' : 'Inactive'
    });
    setShowModal(true);
  };

  // Local File Upload
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

  // Crop & Frame Editor Functions (2.4 : 1 Mobile Container)
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
      const CANVAS_HEIGHT = 500; // 2.4 : 1 ratio
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
            : `campaign-banner-framed-${Date.now()}.jpg`;

          const framedFile = new File([blob], fileName, { type: 'image/jpeg' });
          setSelectedFile(framedFile);
          const newPreview = URL.createObjectURL(blob);
          setPreviewUrl(newPreview);
          setMediaSource('device');
          setShowCropModal(false);
          showToast('Campaign banner framed successfully for 2.4:1 container!', 'success');
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

  // Instant 1-Click "Activate Next" Promotion for Queued Campaigns
  const handleActivateNext = async (banner) => {
    const bannerId = banner.id || banner._id;

    // Optimistic UI update
    setBanners((prev) =>
      prev.map((b) => {
        const bId = b.id || b._id;
        if (bId === bannerId) {
          return { ...b, isActive: true, status: 'Active', sortOrder: 1, order: 1, slot: 1 };
        }
        return { ...b, isActive: false, status: 'Inactive', sortOrder: 999, order: 999, slot: null };
      })
    );

    try {
      const res = await apiFetch(`/api/v1/cms/banners/${bannerId}/status`, {
        method: 'PUT',
        body: JSON.stringify({
          status: 'Active',
          isActive: true,
          singleActive: true
        })
      });

      if (!res.ok) {
        throw new Error('Server responded with an error');
      }

      showToast(`"${banner.title || 'Campaign'}" is now LIVE on mobile app! Replaced previous campaign.`, 'success');
      loadBanners();
    } catch (err) {
      console.warn('Activate Next error:', err);
      showToast('Failed to activate campaign on server.', 'error');
      loadBanners();
    }
  };

  // Toggle Single Active Status via macOS Slide Switch
  const toggleStatus = async (banner) => {
    const bannerId = banner.id || banner._id;
    const isCurrentlyActive = (banner.status === 'Active' || banner.isActive === true) && !isExpired(banner.validUntil);
    const nextStatus = isCurrentlyActive ? 'Inactive' : 'Active';

    // Optimistic UI update
    setBanners((prev) =>
      prev.map((b) => {
        const bId = b.id || b._id;
        if (bId === bannerId) {
          return {
            ...b,
            isActive: !isCurrentlyActive,
            status: nextStatus,
            sortOrder: !isCurrentlyActive ? 1 : 999,
            order: !isCurrentlyActive ? 1 : 999,
            slot: !isCurrentlyActive ? 1 : null
          };
        }
        if (!isCurrentlyActive) {
          // If turning this banner ON, all others become inactive
          return { ...b, isActive: false, status: 'Inactive', sortOrder: 999, order: 999, slot: null };
        }
        return b;
      })
    );

    try {
      const res = await apiFetch(`/api/v1/cms/banners/${bannerId}/status`, {
        method: 'PUT',
        body: JSON.stringify({
          status: nextStatus,
          isActive: !isCurrentlyActive,
          singleActive: true
        })
      });

      if (!res.ok) {
        throw new Error('Failed to update status on server');
      }

      showToast(
        nextStatus === 'Active'
          ? `Campaign turned ON and is now LIVE on mobile app.`
          : 'Campaign turned OFF. Fallback banner will show on mobile.',
        'success'
      );
      loadBanners();
    } catch (err) {
      console.warn('Status toggle error:', err);
      showToast('Failed to update status on server.', 'error');
      loadBanners();
    }
  };

  // Save Banner (Add or Edit)
  const handleSaveBanner = async () => {
    if (!selectedFile && !formData.imageUrl.trim() && !previewUrl) {
      showToast('Please select or upload a campaign banner image.', 'error');
      return;
    }

    setIsSubmitting(true);

    try {
      const bannerId = editingBanner ? (editingBanner.id || editingBanner._id) : null;
      const finalExpiry = formData.noExpiry ? '' : formData.validUntil;
      const isSavingActive = formData.status === 'Active';
      const campaignTitle = (formData.title && formData.title.trim()) || `Ad Campaign ${Date.now()}`;
      let res;

      if (selectedFile) {
        // Multipart FormData upload
        const data = new FormData();
        data.append('image', selectedFile);
        data.append('title', campaignTitle);
        data.append('placement', PLACEMENT);
        data.append('targetScreen', formData.targetScreen || 'PostAd');
        data.append('linkUrl', formData.linkUrl || '');
        data.append('validUntil', finalExpiry);
        data.append('status', formData.status);
        data.append('isActive', String(isSavingActive));
        data.append('singleActive', 'true');
        data.append('sortOrder', isSavingActive ? '1' : '999');

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
          title: campaignTitle,
          imageUrl: formData.imageUrl.trim() || editingBanner?.imageUrl || '',
          placement: PLACEMENT,
          targetScreen: formData.targetScreen || 'PostAd',
          linkUrl: formData.linkUrl || '',
          validUntil: finalExpiry,
          status: formData.status,
          isActive: isSavingActive,
          singleActive: true,
          sortOrder: isSavingActive ? 1 : 999
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
        isSavingActive
          ? 'Campaign banner is now LIVE on mobile app!'
          : 'Campaign banner saved to queue as Inactive.',
        'success'
      );
      setShowModal(false);
      setSelectedFile(null);
      setPreviewUrl('');
      setSelectedGalleryUrl('');
      await loadBanners();
    } catch (err) {
      console.error('Failed to save campaign banner:', err);
      showToast(err.message || 'Failed to save campaign banner.', 'error');
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
    showToast('Campaign banner deleted.', 'success');
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
        title="Ad Campaign Banner"
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
            data-testid="add-campaign-btn"
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
            <span>Upload New Campaign</span>
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

      {/* macOS Sequoia Top Bar: Live Status & Sync */}
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
        {/* Top Row: Active Banner Status & Traffic Lights */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ display: 'flex', gap: '6px' }}>
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#FF5F56' }} />
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#FFBD2E' }} />
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#27C93F' }} />
            </div>

            <div style={{ height: '14px', width: '1px', backgroundColor: 'rgba(0,0,0,0.1)' }} />

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Smartphone size={16} color={activeCount === 0 ? '#FF3B30' : '#34C759'} />
              <span style={{ fontSize: '13.5px', fontWeight: 600, color: '#1C1917' }}>
                Promotional Campaign Banner on Mobile App:
              </span>
              <span style={{
                fontSize: '12px',
                fontWeight: 600,
                padding: '2px 9px',
                borderRadius: '999px',
                backgroundColor: activeCount === 0 ? 'rgba(255, 149, 0, 0.12)' : 'rgba(52, 199, 89, 0.12)',
                color: activeCount === 0 ? '#C2410C' : '#248A3D',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px'
              }}>
                {activeCount === 0 ? (
                  <>
                    <Radio size={11} color="#C2410C" />
                    <span>0 Active — Default Fallback Displayed</span>
                  </>
                ) : (
                  <>
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#34C759' }} />
                    <span>1/1 Active — Live Above Best Sellers</span>
                  </>
                )}
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

        {/* Schedule & Queue Summary Line */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px',
            paddingTop: '12px',
            borderTop: '1px solid rgba(0, 0, 0, 0.05)',
            fontSize: '12.5px',
            color: '#636366'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <Clock size={14} color="#007AFF" />
              <span style={{ color: '#1C1917', fontWeight: 600 }}>Active Schedule:</span>
              <span>
                {activeBanner ? (
                  activeBanner.validUntil && activeBanner.validUntil !== '2026-12-31' ? (
                    `Valid until ${formatDateTime(activeBanner.validUntil)}`
                  ) : (
                    'Always Active (No Expiry)'
                  )
                ) : (
                  'No Campaign Active'
                )}
              </span>
            </div>

            <span style={{ color: '#D1D1D6' }}>•</span>

            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <Layers size={14} color="#57534E" />
              <span style={{ color: '#1C1917', fontWeight: 600 }}>Queued Campaigns:</span>
              <span style={{ fontWeight: 600, color: '#007AFF' }}>{inactiveCount}</span>
              <span>waiting in library</span>
            </div>
          </div>

          <div style={{ fontSize: '11.5px', color: '#8E8E93', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Sparkles size={12} color="#007AFF" />
            <span>Use "Activate Next" on any queued banner to swap it live instantly</span>
          </div>
        </div>
      </div>

      {/* Top Metrics Cards Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '16px',
          marginBottom: '22px'
        }}
      >
        {/* Card 1: Currently Live Campaign */}
        <div
          className="admin-card"
          style={{
            padding: '18px 20px',
            borderRadius: '14px',
            border: '1px solid rgba(0, 0, 0, 0.08)',
            backgroundColor: '#FFFFFF',
            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.02)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: '#8E8E93', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Live in App (1/1 Slot)
            </span>
            <div
              style={{
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                backgroundColor: activeBanner ? '#34C759' : '#FF9500',
                boxShadow: activeBanner ? '0 0 8px rgba(52, 199, 89, 0.6)' : 'none'
              }}
            />
          </div>
          <div style={{ fontSize: '24px', fontWeight: 700, color: '#1C1917' }}>
            {activeBanner ? '1 Active' : '0 Active'}
          </div>
          <div style={{ fontSize: '12px', color: '#636366', marginTop: '4px' }}>
            {activeBanner ? (
              <span>Target: <strong style={{ color: '#007AFF' }}>{activeBanner.targetScreen || 'PostAd'}</strong></span>
            ) : (
              'Fallback promotional space active'
            )}
          </div>
        </div>

        {/* Card 2: Queued Campaigns */}
        <div
          className="admin-card"
          style={{
            padding: '18px 20px',
            borderRadius: '14px',
            border: '1px solid rgba(0, 0, 0, 0.08)',
            backgroundColor: '#FFFFFF',
            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.02)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: '#8E8E93', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Queued Campaigns
            </span>
            <Layers size={16} color="#007AFF" />
          </div>
          <div style={{ fontSize: '24px', fontWeight: 700, color: '#1C1917' }}>
            {inactiveCount}
          </div>
          <div style={{ fontSize: '12px', color: '#636366', marginTop: '4px' }}>
            Ready to promote with 1-click Activate Next
          </div>
        </div>

        {/* Card 3: Total Library Campaigns */}
        <div
          className="admin-card"
          style={{
            padding: '18px 20px',
            borderRadius: '14px',
            border: '1px solid rgba(0, 0, 0, 0.08)',
            backgroundColor: '#FFFFFF',
            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.02)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: '#8E8E93', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Total Campaigns
            </span>
            <ImageIcon size={16} color="#8E8E93" />
          </div>
          <div style={{ fontSize: '24px', fontWeight: 700, color: '#1C1917' }}>
            {banners.length}
          </div>
          <div style={{ fontSize: '12px', color: '#636366', marginTop: '4px' }}>
            Promotional banners in system
          </div>
        </div>
      </div>

      {/* Live Active Spotlight Card */}
      <div
        className="admin-card"
        style={{
          borderRadius: '16px',
          border: '1px solid rgba(0, 0, 0, 0.08)',
          backgroundColor: '#FFFFFF',
          padding: '20px',
          marginBottom: '22px',
          boxShadow: '0 6px 20px rgba(0, 0, 0, 0.03)'
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px',
            paddingBottom: '16px',
            borderBottom: '1px solid rgba(0, 0, 0, 0.06)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                backgroundColor: 'rgba(0, 122, 255, 0.08)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#007AFF'
              }}
            >
              <Smartphone size={20} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: '#1C1917' }}>
                  Currently Live on Mobile App (Above Best Sellers)
                </h3>
                {activeBanner ? (
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                      padding: '2px 8px',
                      borderRadius: '999px',
                      backgroundColor: 'rgba(52, 199, 89, 0.12)',
                      color: '#248A3D',
                      fontSize: '11px',
                      fontWeight: 700
                    }}
                  >
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#34C759' }} />
                    1/1 Active Slot
                  </span>
                ) : (
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                      padding: '2px 8px',
                      borderRadius: '999px',
                      backgroundColor: 'rgba(255, 149, 0, 0.12)',
                      color: '#C2410C',
                      fontSize: '11px',
                      fontWeight: 700
                    }}
                  >
                    Fallback Active
                  </span>
                )}
              </div>
              <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#636366' }}>
                Strictly 1 promotional banner is displayed at a time to maintain high-impact mobile screen engagement.
              </p>
            </div>
          </div>

          {activeBanner && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                type="button"
                onClick={() => setViewingBanner(activeBanner)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 12px',
                  borderRadius: '7px',
                  border: '1px solid rgba(0, 0, 0, 0.1)',
                  backgroundColor: '#FFFFFF',
                  color: '#48484A',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                <Eye size={13} />
                <span>Mobile Preview</span>
              </button>

              <button
                type="button"
                onClick={() => handleOpenEdit(activeBanner)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 12px',
                  borderRadius: '7px',
                  border: '1px solid rgba(0, 122, 255, 0.3)',
                  backgroundColor: 'rgba(0, 122, 255, 0.08)',
                  color: '#007AFF',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                <Pencil size={13} />
                <span>Edit</span>
              </button>
            </div>
          )}
        </div>

        {activeBanner ? (
          <div
            style={{
              marginTop: '16px',
              display: 'flex',
              flexDirection: 'row',
              flexWrap: 'wrap',
              alignItems: 'center',
              gap: '20px',
              padding: '16px',
              borderRadius: '12px',
              backgroundColor: '#F9F9FB',
              border: '1px solid rgba(0, 0, 0, 0.05)'
            }}
          >
            {/* 2.4 : 1 Banner Image Preview */}
            <div
              onClick={() => setViewingBanner(activeBanner)}
              style={{
                position: 'relative',
                width: '280px',
                height: '116px',
                borderRadius: '10px',
                overflow: 'hidden',
                backgroundColor: '#090D16',
                border: '1px solid rgba(0, 0, 0, 0.1)',
                cursor: 'pointer',
                boxShadow: '0 3px 10px rgba(0, 0, 0, 0.08)',
                flexShrink: 0
              }}
              title="Click to preview on realistic mobile frame"
            >
              <img
                src={getAssetUrl(activeBanner.imageUrl)}
                alt={activeBanner.title}
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = DEFAULT_PRODUCT_PLACEHOLDER;
                }}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              <div
                style={{
                  position: 'absolute',
                  bottom: '6px',
                  right: '6px',
                  backgroundColor: 'rgba(0,0,0,0.65)',
                  color: '#fff',
                  fontSize: '10px',
                  padding: '2px 6px',
                  borderRadius: '4px',
                  fontWeight: 600
                }}
              >
                2.4 : 1 Container
              </div>
            </div>

            {/* Banner Information & Destination */}
            <div style={{ flex: 1, minWidth: '240px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    color: '#007AFF',
                    backgroundColor: 'rgba(0, 122, 255, 0.08)',
                    padding: '2px 8px',
                    borderRadius: '6px'
                  }}
                >
                  Destination: {activeBanner.targetScreen || 'PostAd'}
                </span>
                <span style={{ fontSize: '12px', color: '#8E8E93' }}>
                  {formatDateAdded(activeBanner.createdAt)}
                </span>
              </div>

              <h4 style={{ margin: '0 0 6px 0', fontSize: '16px', fontWeight: 700, color: '#1C1917' }}>
                {activeBanner.title || 'Promotional Campaign Banner'}
              </h4>

              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap', marginTop: '10px' }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '12px', color: '#636366' }}>
                  <Clock size={13} color="#007AFF" />
                  <span>
                    Schedule Duration:{' '}
                    <strong style={{ color: '#1C1917' }}>
                      {activeBanner.validUntil && activeBanner.validUntil !== '2026-12-31'
                        ? formatDateTime(activeBanner.validUntil)
                        : 'Always Active (No Expiry)'}
                    </strong>
                  </span>
                </div>

                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '12px', color: '#636366' }}>
                  <CheckCircle2 size={13} color="#34C759" />
                  <span>CTR: <strong>{activeBanner.ctr || '0%'}</strong> ({activeBanner.clicks || 0} clicks / {activeBanner.impressions || 0} views)</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div
            style={{
              marginTop: '16px',
              padding: '26px 20px',
              borderRadius: '12px',
              backgroundColor: 'rgba(255, 149, 0, 0.04)',
              border: '1px dashed rgba(255, 149, 0, 0.3)',
              textAlign: 'center'
            }}
          >
            <Radio size={28} color="#FF9500" style={{ margin: '0 auto 8px auto', opacity: 0.8 }} />
            <h4 style={{ margin: '0 0 4px 0', fontSize: '14px', fontWeight: 700, color: '#C2410C' }}>
              No Custom Promotional Banner Is Currently Active
            </h4>
            <p style={{ margin: '0 auto 14px auto', fontSize: '12.5px', color: '#636366', maxWidth: '460px', lineHeight: 1.4 }}>
              The mobile app homepage is currently showing the default verified promo fallback. Click "Activate Next" on any banner below or upload a new one to make it live!
            </p>
            <button
              type="button"
              onClick={handleOpenAdd}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '7px 16px',
                borderRadius: '8px',
                backgroundColor: '#007AFF',
                color: '#FFFFFF',
                fontSize: '12.5px',
                fontWeight: 600,
                border: 'none',
                cursor: 'pointer',
                boxShadow: '0 2px 6px rgba(0, 122, 255, 0.3)'
              }}
            >
              <Plus size={14} />
              <span>Publish Campaign Banner</span>
            </button>
          </div>
        )}
      </div>

      {/* Tabs & Search Bar */}
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
        <div style={{ display: 'inline-flex', padding: '3px', backgroundColor: '#EFEFEF', borderRadius: '10px' }}>
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            style={{
              padding: '6px 14px',
              borderRadius: '8px',
              border: 'none',
              fontSize: '12px',
              fontWeight: activeTab === 'all' ? 700 : 500,
              backgroundColor: activeTab === 'all' ? '#FFFFFF' : 'transparent',
              color: activeTab === 'all' ? '#1C1917' : '#636366',
              boxShadow: activeTab === 'all' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
              cursor: 'pointer',
              transition: 'all 120ms ease'
            }}
          >
            All Campaigns ({banners.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('active')}
            style={{
              padding: '6px 14px',
              borderRadius: '8px',
              border: 'none',
              fontSize: '12px',
              fontWeight: activeTab === 'active' ? 700 : 500,
              backgroundColor: activeTab === 'active' ? '#FFFFFF' : 'transparent',
              color: activeTab === 'active' ? '#1C1917' : '#636366',
              boxShadow: activeTab === 'active' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
              cursor: 'pointer',
              transition: 'all 120ms ease'
            }}
          >
            Live ({activeCount})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('inactive')}
            style={{
              padding: '6px 14px',
              borderRadius: '8px',
              border: 'none',
              fontSize: '12px',
              fontWeight: activeTab === 'inactive' ? 700 : 500,
              backgroundColor: activeTab === 'inactive' ? '#FFFFFF' : 'transparent',
              color: activeTab === 'inactive' ? '#1C1917' : '#636366',
              boxShadow: activeTab === 'inactive' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
              cursor: 'pointer',
              transition: 'all 120ms ease'
            }}
          >
            Queued ({inactiveCount})
          </button>
        </div>

        <div style={{ width: '260px' }}>
          <input
            type="text"
            placeholder="Search campaigns..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '6px 12px',
              borderRadius: '8px',
              border: '1px solid rgba(0, 0, 0, 0.12)',
              backgroundColor: '#FFFFFF',
              fontSize: '12px',
              color: '#1C1917',
              outline: 'none'
            }}
          />
        </div>
      </div>

      {/* Campaigns macOS Card Table */}
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
                <th style={{ width: '220px', paddingLeft: '20px' }}>Campaign Creative</th>
                <th style={{ width: '160px' }}>Target Destination</th>
                <th>Date Added</th>
                <th>Schedule Duration</th>
                <th style={{ textAlign: 'center', width: '150px' }}>Live Status</th>
                <th style={{ textAlign: 'center', width: '150px' }}>Queue Promotion</th>
                <th style={{ textAlign: 'right', width: '130px', paddingRight: '20px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" style={{ padding: '50px', textAlign: 'center', color: '#8E8E93' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px' }}>
                      <RefreshCw size={18} className="animate-spin" color="#007AFF" />
                      <span style={{ fontSize: '13px', fontWeight: 600 }}>Loading Ad Campaign Banners...</span>
                    </div>
                  </td>
                </tr>
              ) : displayedBanners.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ padding: '60px 20px', textAlign: 'center' }}>
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
                        <ImageIcon size={28} />
                      </div>
                      <div style={{ fontWeight: 700, color: '#1C1917', fontSize: '15px' }}>
                        {activeTab === 'active'
                          ? 'No Live Campaign Active'
                          : activeTab === 'inactive'
                          ? 'No Queued Campaigns'
                          : 'No Campaigns Found'}
                      </div>
                      <div style={{ fontSize: '13px', marginTop: '6px', color: '#636366', lineHeight: 1.5 }}>
                        Upload pure image promotional creatives to feature deals and services directly above Best Sellers on the mobile app.
                      </div>
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
                        <span>Upload Campaign</span>
                      </button>
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

                  return (
                    <tr
                      key={bId}
                      style={{
                        transition: 'background-color 120ms ease',
                        borderBottom: '1px solid rgba(0,0,0,0.05)',
                        backgroundColor: isActive ? 'rgba(0, 122, 255, 0.02)' : 'transparent'
                      }}
                    >
                      {/* Creative Image Preview */}
                      <td style={{ paddingLeft: '20px' }}>
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
                              title="Click to preview on realistic mobile frame"
                            >
                              <img
                                src={getAssetUrl(b.imageUrl)}
                                alt={b.title}
                                onError={(e) => {
                                  e.currentTarget.onerror = null;
                                  e.currentTarget.src = DEFAULT_PRODUCT_PLACEHOLDER;
                                }}
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
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
                            <div style={{ fontSize: '13px', fontWeight: 700, color: '#1C1917', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '140px' }}>
                              {b.title || 'Promotional Campaign'}
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
                              2.4 : 1 Ratio
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Target Destination */}
                      <td>
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            padding: '3px 8px',
                            borderRadius: '6px',
                            fontSize: '11.5px',
                            fontWeight: 600,
                            backgroundColor: '#F5F5F7',
                            color: '#1C1917',
                            border: '1px solid rgba(0, 0, 0, 0.08)'
                          }}
                        >
                          <Smartphone size={12} color="#007AFF" />
                          <span>{b.targetScreen || 'PostAd'}</span>
                        </span>
                      </td>

                      {/* Date Added */}
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#1C1917' }}>
                          <Calendar size={13} color="#8E8E93" />
                          <span>{dateAddedText}</span>
                        </div>
                      </td>

                      {/* Schedule Duration */}
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
                            <Clock size={13} color="#007AFF" />
                            <span>{expiryText}</span>
                          </div>
                        ) : (
                          <span style={{ fontSize: '12px', color: '#8E8E93' }}>
                            Always Active (No Expiry)
                          </span>
                        )}
                      </td>

                      {/* Status Column with macOS Slide Toggle */}
                      <td style={{ textAlign: 'center' }}>
                        <div
                          onClick={() => toggleStatus(b)}
                          title={
                            isActive
                              ? 'Click to turn OFF (Switch to Inactive / Queued)'
                              : 'Click to turn ON (Make exclusive live campaign)'
                          }
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '8px',
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
                              width: '42px',
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
                                left: isActive ? '20px' : '2px',
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
                                fontSize: '12px',
                                fontWeight: 600,
                                color: isActive ? '#248A3D' : '#8E8E93',
                                lineHeight: 1.2
                              }}
                            >
                              {isActive ? 'Active' : 'Inactive'}
                            </div>
                            <div style={{ fontSize: '10px', color: '#8E8E93' }}>
                              {isActive ? '1/1 Live' : 'Queued'}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Queue Promotion: 1-Click "Activate Next" Button */}
                      <td style={{ textAlign: 'center' }}>
                        {isActive ? (
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '5px',
                              padding: '4px 10px',
                              borderRadius: '8px',
                              backgroundColor: 'rgba(52, 199, 89, 0.12)',
                              color: '#248A3D',
                              fontSize: '11.5px',
                              fontWeight: 700
                            }}
                          >
                            <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#34C759' }} />
                            <span>Live in App</span>
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleActivateNext(b)}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '5px',
                              padding: '5px 12px',
                              borderRadius: '8px',
                              backgroundColor: '#007AFF',
                              color: '#FFFFFF',
                              border: 'none',
                              fontSize: '11.5px',
                              fontWeight: 600,
                              cursor: 'pointer',
                              boxShadow: '0 2px 6px rgba(0, 122, 255, 0.25)',
                              transition: 'all 120ms ease'
                            }}
                            title="Promote this campaign to live active slot immediately"
                          >
                            <Play size={11} fill="#FFFFFF" />
                            <span>Activate Next</span>
                          </button>
                        )}
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
                            title="Preview on realistic mobile phone frame"
                          >
                            <Eye size={15} />
                          </button>

                          {/* Edit Button */}
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
                            title="Edit campaign"
                          >
                            <Pencil size={15} />
                          </button>

                          {/* Delete Button */}
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
                            title="Delete campaign"
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
      {/* 1. UPLOAD / EDIT CAMPAIGN BANNER MODAL (macOS Sequoia Sheet)             */}
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
              width: '680px',
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
                    onClick={() => setShowModal(false)}
                    style={{ width: '11px', height: '11px', borderRadius: '50%', backgroundColor: '#FF5F56', cursor: 'pointer' }}
                  />
                  <div style={{ width: '11px', height: '11px', borderRadius: '50%', backgroundColor: '#FFBD2E' }} />
                  <div style={{ width: '11px', height: '11px', borderRadius: '50%', backgroundColor: '#27C93F' }} />
                </div>
                <span style={{ fontSize: '13px', fontWeight: 600, color: '#1C1917', marginLeft: '6px' }}>
                  {editingBanner ? 'Edit Promotional Campaign Banner' : 'Upload Promotional Campaign Banner'}
                </span>
              </div>

              <button
                type="button"
                onClick={() => setShowModal(false)}
                style={{ background: 'transparent', border: 'none', color: '#8E8E93', cursor: 'pointer', padding: '4px' }}
              >
                <X size={15} />
              </button>
            </div>

            <div style={{ padding: '24px' }}>
              {/* SECTION A: Pure Image Creative */}
              <div style={{ marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <label style={{ margin: 0, fontSize: '13px', fontWeight: 600, color: '#1C1917' }}>
                    Campaign Creative Image (Pure Image Banner) *
                  </label>
                  <span style={{ fontSize: '11.5px', color: '#8E8E93' }}>
                    Standard Ratio: ~2.4 : 1 (e.g. 800x340px)
                  </span>
                </div>

                {/* Source Selection Tabs */}
                <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                  <button
                    type="button"
                    onClick={() => setMediaSource('device')}
                    style={{
                      padding: '6px 14px',
                      borderRadius: '8px',
                      fontSize: '12px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      border: mediaSource === 'device' ? '1px solid #007AFF' : '1px solid rgba(0,0,0,0.1)',
                      backgroundColor: mediaSource === 'device' ? '#007AFF' : '#FFFFFF',
                      color: mediaSource === 'device' ? '#FFFFFF' : '#48484A',
                      transition: 'all 120ms ease'
                    }}
                  >
                    Upload from Device
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setMediaSource('gallery');
                      loadGalleryMedia();
                    }}
                    style={{
                      padding: '6px 14px',
                      borderRadius: '8px',
                      fontSize: '12px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      border: mediaSource === 'gallery' ? '1px solid #007AFF' : '1px solid rgba(0,0,0,0.1)',
                      backgroundColor: mediaSource === 'gallery' ? '#007AFF' : '#FFFFFF',
                      color: mediaSource === 'gallery' ? '#FFFFFF' : '#48484A',
                      transition: 'all 120ms ease'
                    }}
                  >
                    Media Gallery
                  </button>

                  <button
                    type="button"
                    onClick={() => setMediaSource('url')}
                    style={{
                      padding: '6px 14px',
                      borderRadius: '8px',
                      fontSize: '12px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      border: mediaSource === 'url' ? '1px solid #007AFF' : '1px solid rgba(0,0,0,0.1)',
                      backgroundColor: mediaSource === 'url' ? '#007AFF' : '#FFFFFF',
                      color: mediaSource === 'url' ? '#FFFFFF' : '#48484A',
                      transition: 'all 120ms ease'
                    }}
                  >
                    Image URL
                  </button>
                </div>

                {/* MODE A: Device Upload */}
                {mediaSource === 'device' && (
                  <div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/png,image/jpeg,image/webp,image/jpg"
                      style={{ display: 'none' }}
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          handleFileChange(e.target.files[0]);
                        }
                      }}
                    />

                    <div
                      onDragOver={(e) => {
                        e.preventDefault();
                        setIsDragging(true);
                      }}
                      onDragLeave={() => setIsDragging(false)}
                      onDrop={(e) => {
                        e.preventDefault();
                        setIsDragging(false);
                        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                          handleFileChange(e.dataTransfer.files[0]);
                        }
                      }}
                      onClick={() => fileInputRef.current?.click()}
                      style={{
                        border: isDragging ? '2px dashed #007AFF' : '2px dashed rgba(0,0,0,0.15)',
                        backgroundColor: isDragging ? 'rgba(0, 122, 255, 0.04)' : '#F9F9FB',
                        borderRadius: '12px',
                        padding: '24px 20px',
                        textAlign: 'center',
                        cursor: 'pointer',
                        transition: 'all 140ms ease'
                      }}
                    >
                      <UploadCloud size={32} color="#007AFF" style={{ margin: '0 auto 8px auto', opacity: 0.8 }} />
                      <div style={{ fontSize: '13px', fontWeight: 600, color: '#1C1917' }}>
                        Click to select image or drag & drop file here
                      </div>
                      <div style={{ fontSize: '11.5px', color: '#8E8E93', marginTop: '4px' }}>
                        Supports PNG, JPG, or WebP up to 10MB
                      </div>
                    </div>

                    {previewUrl && (
                      <div
                        style={{
                          marginTop: '12px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '10px 14px',
                          backgroundColor: '#F2F2F7',
                          borderRadius: '10px',
                          border: '1px solid rgba(0,0,0,0.06)'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div
                            style={{
                              width: '64px',
                              height: '32px',
                              borderRadius: '6px',
                              overflow: 'hidden',
                              backgroundColor: '#090D16',
                              border: '1px solid rgba(0,0,0,0.1)'
                            }}
                          >
                            <img src={previewUrl} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          </div>
                          <div>
                            <div style={{ fontSize: '12px', fontWeight: 600, color: '#1C1917' }}>
                              {selectedFile ? selectedFile.name : 'Image selected'}
                            </div>
                            <div style={{ fontSize: '10.5px', color: '#34C759', fontWeight: 600 }}>
                              Ready for upload
                            </div>
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
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
                            <span>Crop & Frame for Container</span>
                          </button>

                          <button
                            type="button"
                            onClick={handleRemoveImage}
                            style={{
                              padding: '5px',
                              borderRadius: '6px',
                              border: '1px solid rgba(255, 59, 48, 0.25)',
                              backgroundColor: 'rgba(255, 59, 48, 0.08)',
                              color: '#FF3B30',
                              cursor: 'pointer'
                            }}
                            title="Remove image"
                          >
                            <X size={13} />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* MODE B: Media Gallery */}
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
                          const isSelected = selectedGalleryUrl === item.url || formData.imageUrl === item.url;
                          return (
                            <div
                              key={item.id || item.url}
                              onClick={() => handleSelectGalleryItem(item)}
                              style={{
                                position: 'relative',
                                height: '70px',
                                borderRadius: '8px',
                                overflow: 'hidden',
                                border: isSelected ? '2px solid #007AFF' : '1px solid rgba(0,0,0,0.1)',
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
                                    justifyContent: 'center'
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
                        fontSize: '13px',
                        width: '100%',
                        padding: '8px 12px'
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

              {/* Title / Campaign Label */}
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#1C1917', marginBottom: '6px' }}>
                  Campaign Title / Internal Identifier *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Mega Summer Discount / Verified Sellers Promotion"
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: '1px solid rgba(0,0,0,0.15)',
                    fontSize: '13px',
                    color: '#1C1917'
                  }}
                />
              </div>

              {/* Target Screen Destination & Custom Link */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#1C1917', marginBottom: '6px' }}>
                    Target Screen Destination
                  </label>
                  <select
                    value={formData.targetScreen}
                    onChange={(e) => setFormData({ ...formData, targetScreen: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      border: '1px solid rgba(0,0,0,0.15)',
                      fontSize: '13px',
                      color: '#1C1917',
                      backgroundColor: '#FFFFFF'
                    }}
                  >
                    <option value="PostAd">Post Ad (Sell Flow)</option>
                    <option value="ProductList">Deals & Product List</option>
                    <option value="Services">Services Marketplace</option>
                    <option value="AllItems">All Items Marketplace</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#1C1917', marginBottom: '6px' }}>
                    Custom Deep Link (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.linkUrl}
                    onChange={(e) => setFormData({ ...formData, linkUrl: e.target.value })}
                    placeholder="e.g. /ads/post or https://..."
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      border: '1px solid rgba(0,0,0,0.15)',
                      fontSize: '13px',
                      color: '#1C1917'
                    }}
                  />
                </div>
              </div>

              {/* Schedule Duration: Expiry Date & Time */}
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
                    <span>Active Until (Campaign Expiry Schedule)</span>
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
                      value={formData.validUntil}
                      onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        borderRadius: '8px',
                        border: '1px solid rgba(0,0,0,0.15)',
                        fontSize: '13px',
                        color: '#1C1917'
                      }}
                    />
                    <div style={{ fontSize: '11px', color: '#8E8E93', marginTop: '4px' }}>
                      Campaign will automatically deactivate after this date and time.
                    </div>
                  </div>
                )}
              </div>

              {/* Status Switch (1 Active Strictly) */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 16px',
                  backgroundColor: '#F9F9FB',
                  borderRadius: '10px',
                  border: '1px solid rgba(0,0,0,0.08)',
                  marginBottom: '20px'
                }}
              >
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#1C1917' }}>
                    Set as Live Active Campaign
                  </div>
                  <div style={{ fontSize: '11.5px', color: '#636366' }}>
                    Replaces any currently live campaign above Best Sellers on the mobile app.
                  </div>
                </div>

                <div
                  onClick={() =>
                    setFormData((prev) => ({
                      ...prev,
                      status: prev.status === 'Active' ? 'Inactive' : 'Active'
                    }))
                  }
                  style={{
                    position: 'relative',
                    width: '44px',
                    height: '24px',
                    borderRadius: '999px',
                    backgroundColor: formData.status === 'Active' ? '#34C759' : '#D1D1D6',
                    cursor: 'pointer',
                    transition: 'background-color 200ms ease'
                  }}
                >
                  <div
                    style={{
                      position: 'absolute',
                      top: '2px',
                      left: formData.status === 'Active' ? '22px' : '2px',
                      width: '20px',
                      height: '20px',
                      borderRadius: '50%',
                      backgroundColor: '#FFFFFF',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                      transition: 'left 200ms ease'
                    }}
                  />
                </div>
              </div>

              {/* Modal Action Buttons */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: '10px',
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
                    cursor: isSubmitting || (!selectedFile && !formData.imageUrl.trim() && !previewUrl) ? 'not-allowed' : 'pointer',
                    opacity: isSubmitting || (!selectedFile && !formData.imageUrl.trim() && !previewUrl) ? 0.6 : 1,
                    boxShadow: '0 2px 8px rgba(0, 122, 255, 0.3)',
                    transition: 'all 140ms ease'
                  }}
                >
                  {isSubmitting && <RefreshCw size={14} className="animate-spin" />}
                  <span>{editingBanner ? 'Save Changes' : formData.status === 'Active' ? 'Publish as Live Campaign' : 'Save to Queue'}</span>
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
                  Frame Campaign Banner — 2.4 : 1 Mobile Container
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
                    Mobile Banner Aspect Ratio (~2.4 : 1)
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

              {/* Controls */}
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

                {/* Fit Mode Toggle & Reset */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '8px', borderTop: '1px solid rgba(0,0,0,0.06)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '12px', fontWeight: 600, color: '#1C1917' }}>Fit Mode:</span>
                    <button
                      type="button"
                      onClick={() => setCropFitMode('cover')}
                      style={{
                        padding: '4px 10px',
                        borderRadius: '6px',
                        fontSize: '11.5px',
                        fontWeight: 600,
                        border: cropFitMode === 'cover' ? '1px solid #007AFF' : '1px solid rgba(0,0,0,0.1)',
                        backgroundColor: cropFitMode === 'cover' ? '#007AFF' : '#FFFFFF',
                        color: cropFitMode === 'cover' ? '#FFFFFF' : '#48484A',
                        cursor: 'pointer'
                      }}
                    >
                      Cover (Fill Canvas)
                    </button>
                    <button
                      type="button"
                      onClick={() => setCropFitMode('contain')}
                      style={{
                        padding: '4px 10px',
                        borderRadius: '6px',
                        fontSize: '11.5px',
                        fontWeight: 600,
                        border: cropFitMode === 'contain' ? '1px solid #007AFF' : '1px solid rgba(0,0,0,0.1)',
                        backgroundColor: cropFitMode === 'contain' ? '#007AFF' : '#FFFFFF',
                        color: cropFitMode === 'contain' ? '#FFFFFF' : '#48484A',
                        cursor: 'pointer'
                      }}
                    >
                      Contain (Whole Image)
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
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '4px 10px',
                      borderRadius: '6px',
                      border: '1px solid rgba(0,0,0,0.1)',
                      background: '#FFFFFF',
                      fontSize: '11.5px',
                      color: '#48484A',
                      cursor: 'pointer'
                    }}
                  >
                    <RotateCcw size={11} />
                    <span>Reset Frame</span>
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setShowCropModal(false)}
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
                  onClick={handleApplyCrop}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 20px',
                    borderRadius: '8px',
                    backgroundColor: '#007AFF',
                    color: '#FFFFFF',
                    border: 'none',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    boxShadow: '0 2px 8px rgba(0, 122, 255, 0.3)'
                  }}
                >
                  <Check size={14} />
                  <span>Apply Frame & Save</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. REALISTIC APPLE IPHONE MOBILE VIEWPORT PREVIEW MODAL                  */}
      {/* ========================================================================= */}
      {viewingBanner && (
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
            zIndex: 10000,
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
              boxShadow: '0 30px 80px rgba(0, 0, 0, 0.45)',
              borderRadius: '24px',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column'
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
                    onClick={() => setViewingBanner(null)}
                    style={{ width: '11px', height: '11px', borderRadius: '50%', backgroundColor: '#FF5F56', cursor: 'pointer' }}
                  />
                  <div style={{ width: '11px', height: '11px', borderRadius: '50%', backgroundColor: '#FFBD2E' }} />
                  <div style={{ width: '11px', height: '11px', borderRadius: '50%', backgroundColor: '#27C93F' }} />
                </div>
                <span style={{ fontSize: '13px', fontWeight: 600, color: '#1C1917', marginLeft: '6px' }}>
                  Mobile App Viewport Preview
                </span>
              </div>

              <button
                type="button"
                onClick={() => setViewingBanner(null)}
                style={{ background: 'transparent', border: 'none', color: '#8E8E93', cursor: 'pointer' }}
              >
                <X size={15} />
              </button>
            </div>

            {/* Simulated iPhone Screen */}
            <div style={{ padding: '20px', backgroundColor: '#F2F2F7', display: 'flex', justifyContent: 'center' }}>
              <div
                style={{
                  width: '320px',
                  backgroundColor: '#FFFFFF',
                  borderRadius: '36px',
                  border: '8px solid #1C1917',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
                  overflow: 'hidden',
                  position: 'relative'
                }}
              >
                {/* Dynamic Island Notch */}
                <div
                  style={{
                    height: '28px',
                    backgroundColor: '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                    padding: '0 18px'
                  }}
                >
                  <span style={{ fontSize: '10px', fontWeight: 700, color: '#1C1917' }}>9:41</span>
                  <div
                    style={{
                      position: 'absolute',
                      top: '6px',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      width: '74px',
                      height: '18px',
                      borderRadius: '999px',
                      backgroundColor: '#000000'
                    }}
                  />
                </div>

                {/* Mobile Header Bar */}
                <div style={{ padding: '8px 12px', borderBottom: '1px solid #F2F2F7', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div style={{ width: '22px', height: '22px', borderRadius: '6px', backgroundColor: '#007AFF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '11px', fontWeight: 900 }}>
                      B
                    </div>
                    <span style={{ fontSize: '12px', fontWeight: 800, color: '#1C1917' }}>MyBigBazaar</span>
                  </div>
                  <div style={{ fontSize: '10px', color: '#8E8E93' }}>Indore</div>
                </div>

                {/* Mobile Content Canvas */}
                <div style={{ padding: '12px' }}>
                  {/* Subtle Categories Slider preview indicator */}
                  <div style={{ display: 'flex', gap: '6px', marginBottom: '14px', opacity: 0.5 }}>
                    <div style={{ width: '42px', height: '14px', borderRadius: '4px', backgroundColor: '#E5E5EA' }} />
                    <div style={{ width: '42px', height: '14px', borderRadius: '4px', backgroundColor: '#E5E5EA' }} />
                    <div style={{ width: '42px', height: '14px', borderRadius: '4px', backgroundColor: '#E5E5EA' }} />
                    <div style={{ width: '42px', height: '14px', borderRadius: '4px', backgroundColor: '#E5E5EA' }} />
                  </div>

                  {/* PROMOTIONAL CONTAINER (Above Best Sellers) */}
                  <div style={{ marginBottom: '14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span style={{ fontSize: '9px', fontWeight: 700, color: '#007AFF', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        Promotional Ad Container (Pure Image)
                      </span>
                      <span style={{ fontSize: '9px', color: '#8E8E93' }}>
                        1 Active Slot
                      </span>
                    </div>

                    <div
                      style={{
                        width: '100%',
                        aspectRatio: '2.4 / 1',
                        borderRadius: '12px',
                        overflow: 'hidden',
                        backgroundColor: '#090D16',
                        border: '1px solid rgba(0, 122, 255, 0.3)',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                        position: 'relative'
                      }}
                    >
                      <img
                        src={getAssetUrl(viewingBanner.imageUrl)}
                        alt={viewingBanner.title}
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = DEFAULT_PRODUCT_PLACEHOLDER;
                        }}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    </div>
                  </div>

                  {/* Context: Best Sellers Section directly below */}
                  <div style={{ paddingTop: '6px', borderTop: '1px dashed #E5E5EA' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span style={{ fontSize: '11px', fontWeight: 800, color: '#1C1917' }}>Best Sellers</span>
                      <span style={{ fontSize: '9.5px', color: '#007AFF', fontWeight: 600 }}>See all &gt;</span>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                      <div style={{ height: '56px', borderRadius: '8px', backgroundColor: '#F2F2F7', border: '1px solid #E5E5EA', padding: '6px' }}>
                        <div style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: '#E5E5EA' }} />
                      </div>
                      <div style={{ height: '56px', borderRadius: '8px', backgroundColor: '#F2F2F7', border: '1px solid #E5E5EA', padding: '6px' }}>
                        <div style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: '#E5E5EA' }} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* iPhone Home Indicator */}
                <div style={{ height: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ width: '80px', height: '3px', borderRadius: '999px', backgroundColor: '#1C1917' }} />
                </div>
              </div>
            </div>

            {/* Preview Footer Details */}
            <div
              style={{
                padding: '14px 18px',
                borderTop: '1px solid rgba(0, 0, 0, 0.08)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <div>
                <div style={{ fontSize: '12px', fontWeight: 700, color: '#1C1917' }}>
                  {viewingBanner.title || 'Promotional Campaign'}
                </div>
                <div style={{ fontSize: '11px', color: '#636366' }}>
                  Destination: <strong style={{ color: '#007AFF' }}>{viewingBanner.targetScreen || 'PostAd'}</strong>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setViewingBanner(null)}
                style={{
                  padding: '6px 14px',
                  borderRadius: '7px',
                  border: '1px solid rgba(0,0,0,0.12)',
                  backgroundColor: '#FFFFFF',
                  color: '#48484A',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. DELETE CONFIRMATION ALERT SHEET                                       */}
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
              Delete Campaign Banner?
            </h3>
            <p style={{ fontSize: '13px', color: '#636366', margin: '10px 0 22px 0', lineHeight: 1.5 }}>
              Are you sure you want to delete "{deleteCandidate.title || 'this campaign'}"? This action cannot be undone.
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
                Delete Campaign
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
