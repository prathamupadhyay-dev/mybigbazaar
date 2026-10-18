// ============================================================
// MyBigBazaar Admin — Media Gallery (macOS Sequoia Glass Style)
// Asset Library under Content (CMS) for uploading, managing,
// and selecting banner, category, and product images.
// ============================================================

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  UploadCloud,
  Image as ImageIcon,
  Trash2,
  Copy,
  Check,
  Search,
  ExternalLink,
  X,
  Plus,
  RefreshCw,
  FolderOpen,
  Filter,
  CheckCircle2,
  ArrowUpRight,
  Maximize2
} from 'lucide-react';
import PageHeader from '../components/ui/PageHeader';
import { apiFetch, apiPost, apiDelete } from '../utils/api';
import { getAssetUrl, DEFAULT_PRODUCT_PLACEHOLDER } from '../config';

export default function Gallery() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFormat, setSelectedFormat] = useState('ALL');
  const [copiedId, setCopiedId] = useState(null);
  const [previewItem, setPreviewItem] = useState(null);
  const [deleteCandidate, setDeleteCandidate] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [toast, setToast] = useState(null);
  const fileInputRef = useRef(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3200);
  };

  const loadGallery = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiFetch('/api/v1/cms/gallery');
      const json = await res.json();
      if (json && Array.isArray(json.data)) {
        setItems(json.data);
      } else {
        setItems([]);
      }
    } catch (err) {
      console.warn('Failed to load gallery assets:', err);
      showToast('Using local asset library fallback', 'info');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadGallery();
  }, [loadGallery]);

  const handleFilesUpload = async (files) => {
    if (!files || files.length === 0) return;

    const validFiles = Array.from(files).filter(f => f.type.startsWith('image/'));
    if (validFiles.length === 0) {
      showToast('Please select valid image files (PNG, JPG, WEBP, SVG).', 'error');
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      validFiles.forEach(file => {
        formData.append('images', file);
      });

      const res = await apiFetch('/api/v1/cms/gallery/upload', {
        method: 'POST',
        body: formData
      });
      const json = await res.json();

      if (res.ok) {
        showToast(`Uploaded ${validFiles.length} image(s) to gallery successfully!`, 'success');
        loadGallery();
      } else {
        throw new Error(json.message || 'Upload failed');
      }
    } catch (err) {
      console.warn('Upload error:', err);
      showToast(err.message || 'Failed to upload images', 'error');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleCopyUrl = (url, id) => {
    const fullUrl = getAssetUrl(url);
    navigator.clipboard.writeText(fullUrl).then(() => {
      setCopiedId(id);
      showToast('Image URL copied to clipboard!', 'success');
      setTimeout(() => setCopiedId(null), 2000);
    }).catch(() => {
      showToast('Failed to copy to clipboard', 'error');
    });
  };

  const handleDelete = async (filename) => {
    try {
      const res = await apiFetch(`/api/v1/cms/gallery/${encodeURIComponent(filename)}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        showToast('Image deleted from gallery.', 'success');
        setItems(prev => prev.filter(i => i.filename !== filename));
        if (previewItem?.filename === filename) setPreviewItem(null);
      } else {
        throw new Error('Failed to delete image');
      }
    } catch (err) {
      showToast(err.message || 'Error deleting image', 'error');
    } finally {
      setDeleteCandidate(null);
    }
  };

  // Filter items
  const filteredItems = items.filter(item => {
    const matchesSearch = item.filename.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFormat = selectedFormat === 'ALL' || item.extension === selectedFormat;
    return matchesSearch && matchesFormat;
  });

  const formats = ['ALL', ...new Set(items.map(i => i.extension).filter(Boolean))];

  return (
    <div style={{ padding: '24px 28px', maxWidth: '1440px', margin: '0 auto', fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", Roboto, sans-serif' }}>
      {/* Toast Notification */}
      {toast && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '24px',
          zIndex: 99999,
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '10px 18px',
          backgroundColor: toast.type === 'error' ? '#FF3B30' : toast.type === 'info' ? '#007AFF' : '#34C759',
          color: '#FFFFFF',
          borderRadius: '10px',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.25)',
          fontSize: '13px',
          fontWeight: 600
        }}>
          <CheckCircle2 size={16} />
          <span>{toast.message}</span>
        </div>
      )}

      {/* macOS Sequoia Top Bar */}
      <div style={{
        backgroundColor: 'rgba(255, 255, 255, 0.85)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid rgba(0, 0, 0, 0.08)',
        borderRadius: '14px',
        padding: '18px 22px',
        marginBottom: '22px',
        boxShadow: '0 4px 20px -2px rgba(0, 0, 0, 0.04)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '14px'
      }}>
        {/* Left: Window Dots + Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          {/* macOS Traffic Lights */}
          <div style={{ display: 'flex', gap: '6px' }}>
            <div style={{ width: '11px', height: '11px', borderRadius: '50%', backgroundColor: '#FF5F56', boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.12)' }} />
            <div style={{ width: '11px', height: '11px', borderRadius: '50%', backgroundColor: '#FFBD2E', boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.12)' }} />
            <div style={{ width: '11px', height: '11px', borderRadius: '50%', backgroundColor: '#27C93F', boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.12)' }} />
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h1 style={{ margin: 0, fontSize: '20px', fontWeight: 700, color: '#1C1C1E', letterSpacing: '-0.3px' }}>
                Media Gallery
              </h1>
              <span style={{
                backgroundColor: 'rgba(0, 122, 255, 0.1)',
                color: '#007AFF',
                fontSize: '11.5px',
                fontWeight: 700,
                padding: '2px 8px',
                borderRadius: '999px'
              }}>
                {items.length} Assets
              </span>
            </div>
          </div>
        </div>

        {/* Right: Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            type="button"
            onClick={loadGallery}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '7px 12px',
              borderRadius: '8px',
              border: '1px solid rgba(0, 0, 0, 0.1)',
              backgroundColor: '#FFFFFF',
              color: '#3A3A3C',
              fontSize: '12.5px',
              fontWeight: 500,
              cursor: 'pointer',
              boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
            }}
          >
            <RefreshCw size={13} className={loading ? 'spin' : ''} />
            <span>Refresh</span>
          </button>

          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/png,image/jpeg,image/jpg,image/webp,image/svg+xml"
            style={{ display: 'none' }}
            onChange={(e) => handleFilesUpload(e.target.files)}
          />

          <button
            type="button"
            disabled={isUploading}
            onClick={() => fileInputRef.current?.click()}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '7px 16px',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: '#007AFF',
              color: '#FFFFFF',
              fontSize: '12.5px',
              fontWeight: 600,
              cursor: isUploading ? 'not-allowed' : 'pointer',
              boxShadow: '0 2px 6px rgba(0, 122, 255, 0.35)',
              opacity: isUploading ? 0.7 : 1
            }}
          >
            <Plus size={14} />
            <span>{isUploading ? 'Uploading...' : 'Upload Images'}</span>
          </button>
        </div>
      </div>

      {/* Drag & Drop Upload Zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={(e) => { e.preventDefault(); setIsDragging(false); }}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          if (e.dataTransfer.files?.length) handleFilesUpload(e.dataTransfer.files);
        }}
        onClick={() => fileInputRef.current?.click()}
        style={{
          border: `1.5px dashed ${isDragging ? '#007AFF' : 'rgba(0, 0, 0, 0.15)'}`,
          backgroundColor: isDragging ? 'rgba(0, 122, 255, 0.04)' : 'rgba(255, 255, 255, 0.65)',
          borderRadius: '12px',
          padding: '24px 20px',
          textAlign: 'center',
          cursor: 'pointer',
          marginBottom: '20px',
          transition: 'all 160ms ease',
          boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
        }}
      >
        <div style={{
          width: '38px',
          height: '38px',
          borderRadius: '50%',
          backgroundColor: 'rgba(0, 122, 255, 0.08)',
          color: '#007AFF',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 8px auto'
        }}>
          <UploadCloud size={20} />
        </div>
        <div style={{ fontSize: '13px', fontWeight: 600, color: '#1C1C1E' }}>
          Drop image files here to upload to gallery, or <span style={{ color: '#007AFF' }}>browse device</span>
        </div>
        <div style={{ fontSize: '11.5px', color: '#8E8E93', marginTop: '3px' }}>
          PNG, JPG, WEBP, or SVG • Images uploaded here are instantly available in the Hero Banner creator
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px',
        marginBottom: '18px'
      }}>
        {/* macOS Search Input */}
        <div style={{
          position: 'relative',
          width: '280px',
          maxWidth: '100%'
        }}>
          <Search size={14} color="#8E8E93" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search assets by filename..."
            style={{
              width: '100%',
              padding: '6px 28px 6px 30px',
              borderRadius: '8px',
              border: '1px solid rgba(0, 0, 0, 0.12)',
              backgroundColor: '#FFFFFF',
              fontSize: '12px',
              outline: 'none',
              boxShadow: '0 1px 2px rgba(0,0,0,0.03)'
            }}
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              style={{
                position: 'absolute',
                right: '8px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                padding: 0,
                cursor: 'pointer',
                color: '#8E8E93'
              }}
            >
              <X size={13} />
            </button>
          )}
        </div>

        {/* Format Filter Pills */}
        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
          <span style={{ fontSize: '11.5px', color: '#8E8E93', fontWeight: 500, marginRight: '4px' }}>Format:</span>
          {formats.map((fmt) => (
            <button
              key={fmt}
              type="button"
              onClick={() => setSelectedFormat(fmt)}
              style={{
                padding: '3px 10px',
                borderRadius: '6px',
                fontSize: '11.5px',
                fontWeight: selectedFormat === fmt ? 600 : 500,
                border: `1px solid ${selectedFormat === fmt ? '#007AFF' : 'rgba(0,0,0,0.08)'}`,
                backgroundColor: selectedFormat === fmt ? '#007AFF' : '#FFFFFF',
                color: selectedFormat === fmt ? '#FFFFFF' : '#3A3A3C',
                cursor: 'pointer',
                transition: 'all 120ms ease'
              }}
            >
              {fmt}
            </button>
          ))}
        </div>
      </div>

      {/* Asset Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: '#8E8E93', fontSize: '13px' }}>
          <RefreshCw size={24} className="spin" style={{ marginBottom: '8px' }} />
          <div>Loading media assets...</div>
        </div>
      ) : filteredItems.length === 0 ? (
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '12px',
          border: '1px solid rgba(0,0,0,0.08)',
          padding: '60px 20px',
          textAlign: 'center',
          boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
        }}>
          <FolderOpen size={40} color="#8E8E93" style={{ opacity: 0.4, marginBottom: '10px' }} />
          <div style={{ fontSize: '15px', fontWeight: 600, color: '#1C1C1E' }}>
            No Media Assets Found
          </div>
          <div style={{ fontSize: '12.5px', color: '#8E8E93', marginTop: '4px', maxWidth: '380px', margin: '4px auto 16px auto' }}>
            {searchQuery ? 'No images matching your search term.' : 'Upload photos and creative graphics to use across your mobile banners.'}
          </div>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            style={{
              padding: '6px 16px',
              backgroundColor: '#007AFF',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Upload First Image
          </button>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))',
          gap: '16px'
        }}>
          {filteredItems.map((item) => {
            const assetUrl = getAssetUrl(item.url);
            const isCopied = copiedId === item.id;

            return (
              <div
                key={item.id || item.filename}
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '12px',
                  border: '1px solid rgba(0, 0, 0, 0.08)',
                  overflow: 'hidden',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.03)',
                  transition: 'transform 140ms ease, box-shadow 140ms ease',
                  display: 'flex',
                  flexDirection: 'column'
                }}
              >
                {/* Thumbnail Preview with 16:9 / 2.4:1 Frame */}
                <div
                  style={{
                    position: 'relative',
                    width: '100%',
                    height: '140px',
                    backgroundColor: '#090D16',
                    cursor: 'pointer',
                    overflow: 'hidden'
                  }}
                  onClick={() => setPreviewItem(item)}
                  title="Click to view full preview"
                >
                  <img
                    src={assetUrl}
                    alt={item.filename}
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = DEFAULT_PRODUCT_PLACEHOLDER;
                    }}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      display: 'block'
                    }}
                  />

                  {/* Format Pill */}
                  <div style={{
                    position: 'absolute',
                    top: '8px',
                    left: '8px',
                    backgroundColor: 'rgba(0, 0, 0, 0.65)',
                    backdropFilter: 'blur(4px)',
                    color: '#fff',
                    fontSize: '10px',
                    fontWeight: 700,
                    padding: '2px 6px',
                    borderRadius: '4px'
                  }}>
                    {item.extension || 'IMG'}
                  </div>

                  {/* Size Pill */}
                  <div style={{
                    position: 'absolute',
                    top: '8px',
                    right: '8px',
                    backgroundColor: 'rgba(0, 0, 0, 0.65)',
                    backdropFilter: 'blur(4px)',
                    color: '#fff',
                    fontSize: '10px',
                    padding: '2px 6px',
                    borderRadius: '4px'
                  }}>
                    {item.sizeFormatted || ''}
                  </div>
                </div>

                {/* Info Card Body */}
                <div style={{ padding: '12px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <div
                      style={{
                        fontSize: '12.5px',
                        fontWeight: 600,
                        color: '#1C1C1E',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}
                      title={item.filename}
                    >
                      {item.filename}
                    </div>
                    <div style={{ fontSize: '11px', color: '#8E8E93', marginTop: '2px' }}>
                      {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'Uploaded'}
                    </div>
                  </div>

                  {/* macOS Actions Bar */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginTop: '12px',
                    paddingTop: '10px',
                    borderTop: '1px solid rgba(0,0,0,0.06)'
                  }}>
                    {/* Copy Link Button */}
                    <button
                      type="button"
                      onClick={() => handleCopyUrl(item.url, item.id)}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        padding: '4px 8px',
                        borderRadius: '6px',
                        border: '1px solid rgba(0,0,0,0.1)',
                        backgroundColor: isCopied ? '#34C759' : '#FFFFFF',
                        color: isCopied ? '#FFFFFF' : '#3A3A3C',
                        fontSize: '11px',
                        fontWeight: 500,
                        cursor: 'pointer'
                      }}
                      title="Copy asset URL to clipboard"
                    >
                      {isCopied ? <Check size={12} /> : <Copy size={12} />}
                      <span>{isCopied ? 'Copied' : 'Copy URL'}</span>
                    </button>

                    {/* Quick Use as Hero Banner */}
                    <button
                      type="button"
                      onClick={() => {
                        navigate('/dashboard/cms/banners', { state: { preselectedGalleryImage: item.url } });
                      }}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '3px',
                        padding: '4px 8px',
                        borderRadius: '6px',
                        border: '1px solid rgba(0, 122, 255, 0.25)',
                        backgroundColor: 'rgba(0, 122, 255, 0.08)',
                        color: '#007AFF',
                        fontSize: '11px',
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                      title="Create a new Hero Banner with this image"
                    >
                      <span>Use Banner</span>
                      <ArrowUpRight size={11} />
                    </button>

                    {/* Delete Icon */}
                    <button
                      type="button"
                      onClick={() => setDeleteCandidate(item)}
                      style={{
                        width: '26px',
                        height: '26px',
                        borderRadius: '6px',
                        border: '1px solid rgba(255, 59, 48, 0.2)',
                        backgroundColor: 'rgba(255, 59, 48, 0.06)',
                        color: '#FF3B30',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer'
                      }}
                      title="Delete asset"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Full Preview Modal */}
      {previewItem && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          backgroundColor: 'rgba(0, 0, 0, 0.65)',
          backdropFilter: 'blur(10px)',
          zIndex: 10000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <div style={{
            width: '640px',
            maxWidth: '100%',
            backgroundColor: '#FFFFFF',
            borderRadius: '14px',
            overflow: 'hidden',
            boxShadow: '0 25px 60px rgba(0,0,0,0.3)',
            border: '1px solid rgba(0,0,0,0.1)'
          }}>
            {/* Header */}
            <div style={{
              padding: '14px 18px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderBottom: '1px solid rgba(0,0,0,0.08)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#FF5F56' }} />
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#FFBD2E' }} />
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#27C93F' }} />
                <span style={{ fontSize: '13px', fontWeight: 600, color: '#1C1C1E', marginLeft: '6px' }}>
                  {previewItem.filename}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setPreviewItem(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#8E8E93' }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Preview Image */}
            <div style={{ padding: '16px', backgroundColor: '#090D16', textAlign: 'center' }}>
              <img
                src={getAssetUrl(previewItem.url)}
                alt={previewItem.filename}
                style={{ maxWidth: '100%', maxHeight: '420px', borderRadius: '8px', objectFit: 'contain' }}
              />
            </div>

            {/* Footer */}
            <div style={{
              padding: '12px 18px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: '#F5F5F7',
              borderTop: '1px solid rgba(0,0,0,0.08)'
            }}>
              <span style={{ fontSize: '12px', color: '#8E8E93' }}>
                {previewItem.sizeFormatted} • {previewItem.extension}
              </span>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => handleCopyUrl(previewItem.url, previewItem.id)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '7px',
                    border: '1px solid rgba(0,0,0,0.12)',
                    background: '#fff',
                    fontSize: '12px',
                    fontWeight: 500,
                    cursor: 'pointer'
                  }}
                >
                  Copy URL
                </button>
                <button
                  type="button"
                  onClick={() => {
                    navigate('/dashboard/cms/banners', { state: { preselectedGalleryImage: previewItem.url } });
                  }}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '7px',
                    border: 'none',
                    backgroundColor: '#007AFF',
                    color: '#fff',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Use as Hero Banner
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteCandidate && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          backdropFilter: 'blur(8px)',
          zIndex: 10000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <div style={{
            width: '400px',
            backgroundColor: '#FFFFFF',
            borderRadius: '14px',
            padding: '22px',
            boxShadow: '0 20px 50px rgba(0,0,0,0.25)',
            border: '1px solid rgba(0,0,0,0.1)'
          }}>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#1C1C1E' }}>
              Delete Image Asset?
            </h3>
            <p style={{ margin: '8px 0 16px 0', fontSize: '12.5px', color: '#8E8E93' }}>
              Are you sure you want to permanently delete <strong>{deleteCandidate.filename}</strong>? This action cannot be undone.
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <button
                type="button"
                onClick={() => setDeleteCandidate(null)}
                style={{
                  padding: '7px 14px',
                  borderRadius: '7px',
                  border: '1px solid rgba(0,0,0,0.12)',
                  background: 'transparent',
                  fontSize: '12.5px',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleDelete(deleteCandidate.filename)}
                style={{
                  padding: '7px 16px',
                  borderRadius: '7px',
                  border: 'none',
                  backgroundColor: '#FF3B30',
                  color: '#fff',
                  fontSize: '12.5px',
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
