import React, { useState, useEffect } from 'react';
import {
  Save,
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  Play,
  Film,
  X,
  Sparkles,
  HelpCircle,
  Eye
} from 'lucide-react';
import { apiGet, apiPut } from '../utils/api';

// YouTube SVG Icon
const YoutubeIcon = ({ size = 20, color = '#FF0000' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path
      d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"
      fill={color}
    />
    <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" fill="#FFFFFF" />
  </svg>
);

// Helper to strictly validate and extract 11-char YouTube video ID
export function extractYouTubeId(url) {
  if (!url || typeof url !== 'string') return null;
  const trimmed = url.trim();
  if (!/(youtube\.com|youtu\.be)/i.test(trimmed)) return null;
  const regExp = /(?:youtube\.com\/(?:watch\?.*v=|embed\/|shorts\/|v\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/i;
  const match = trimmed.match(regExp);
  return match && match[1] ? match[1] : null;
}

export default function EliteBuyerPageCMS({ token }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  // YouTube URL & Validation State
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [thumbnailError, setThumbnailError] = useState(false);
  const [isPlayingInline, setIsPlayingInline] = useState(false);

  // Preserve existing page metadata & config for mobile app compatibility
  const [fullPageRecord, setFullPageRecord] = useState(null);

  const trimmedUrl = (youtubeUrl || '').trim();
  const videoId = extractYouTubeId(trimmedUrl);
  const isValidYouTube = !!videoId;
  const isInputEmpty = trimmedUrl === '';
  const isInvalidUrl = !isInputEmpty && !isValidYouTube;

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => {
    let mounted = true;
    const loadPage = async () => {
      setLoading(true);
      try {
        const res = await apiGet('/cms/pages/elite-buyer', {}, token);
        if (mounted && res?.data) {
          const d = res.data;
          setFullPageRecord(d);
          if (d.youtubeUrl !== undefined) {
            setYoutubeUrl(d.youtubeUrl || '');
          }
        }
      } catch (err) {
        console.warn('Failed to load elite buyer cms page:', err);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    loadPage();
    return () => {
      mounted = false;
    };
  }, [token]);

  // Handle Save
  const handleSave = async (e) => {
    if (e) e.preventDefault();

    if (isInvalidUrl) {
      showToast('Please enter a valid YouTube video link or leave the field blank.', 'error');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        title: fullPageRecord?.title || 'Elite Buyer Membership',
        content: fullPageRecord?.content || 'Call owners directly & close deals 2x faster',
        youtubeUrl: trimmedUrl,
        supportEmail: fullPageRecord?.supportEmail || 'support@bigbazaar.com',
        supportPhone: fullPageRecord?.supportPhone || '1800-258-3333',
        published: fullPageRecord?.published !== undefined ? fullPageRecord.published : true,
        config: fullPageRecord?.config || {
          badgeText: 'Buy ⚡ Fast',
          headline: 'Call owners directly & close deals 2x faster',
          highlightWord: 'owners',
          card1Title: 'Call Owners Directly',
          card1Subtitle: 'Direct phone connection to genuine sellers',
          card2Title: 'Daily New Matches',
          card2Subtitle: 'Instant alerts for matched owner ads',
          ctaText: 'Get Started'
        }
      };

      await apiPut('/cms/pages/elite-buyer', payload, token);
      showToast(trimmedUrl ? 'YouTube video link updated successfully!' : 'YouTube link cleared successfully.');
    } catch (err) {
      console.error('Failed to save elite buyer YouTube link:', err);
      showToast(err.message || 'Failed to save YouTube link', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      style={{
        maxWidth: '960px',
        margin: '0 auto',
        padding: '24px 16px 80px',
        fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Helvetica Neue", sans-serif',
        color: '#1D1D1F'
      }}
    >
      {/* Toast Notification */}
      {toast && (
        <div
          style={{
            position: 'fixed',
            top: '24px',
            right: '24px',
            zIndex: 9999,
            backgroundColor: toast.type === 'error' ? 'rgba(239, 68, 68, 0.95)' : 'rgba(28, 28, 30, 0.94)',
            backdropFilter: 'blur(16px)',
            color: '#FFFFFF',
            padding: '12px 20px',
            borderRadius: '12px',
            boxShadow: '0 12px 32px rgba(0, 0, 0, 0.18)',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontSize: '13.5px',
            fontWeight: 500,
            animation: 'fadeIn 0.2s ease-out'
          }}
        >
          {toast.type === 'error' ? <AlertCircle size={18} /> : <CheckCircle2 size={18} color="#34D399" />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* macOS Window Shell */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '16px',
          border: '1px solid rgba(0, 0, 0, 0.09)',
          boxShadow: '0 20px 48px -12px rgba(0, 0, 0, 0.08), 0 1px 3px rgba(0, 0, 0, 0.04)',
          overflow: 'hidden'
        }}
      >
        {/* macOS Title Bar */}
        <div
          style={{
            height: '48px',
            background: 'linear-gradient(180deg, #F9F9FB 0%, #ECECED 100%)',
            borderBottom: '1px solid rgba(0, 0, 0, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 16px',
            userSelect: 'none'
          }}
        >
          {/* Traffic Light Dots */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '80px' }}>
            <span
              style={{
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                backgroundColor: '#FF5F56',
                border: '1px solid #E0443E',
                display: 'inline-block',
                boxShadow: 'inset 0 1px 1px rgba(0,0,0,0.1)'
              }}
            />
            <span
              style={{
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                backgroundColor: '#FFBD2E',
                border: '1px solid #DEA123',
                display: 'inline-block',
                boxShadow: 'inset 0 1px 1px rgba(0,0,0,0.1)'
              }}
            />
            <span
              style={{
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                backgroundColor: '#27C93F',
                border: '1px solid #1AAB29',
                display: 'inline-block',
                boxShadow: 'inset 0 1px 1px rgba(0,0,0,0.1)'
              }}
            />
          </div>

          {/* Window Title */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: '#2C2C2E', letterSpacing: '-0.01em' }}>
              Content / Elite Buyer Page
            </span>
          </div>

          {/* Right Header Space */}
          <div style={{ width: '80px' }} />
        </div>

        {/* Toolbar */}
        <div
          style={{
            padding: '14px 24px',
            backgroundColor: '#FBFBFD',
            borderBottom: '1px solid rgba(0, 0, 0, 0.06)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px'
          }}
        >
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 700, margin: 0, color: '#1D1D1F', letterSpacing: '-0.02em' }}>
              YouTube Video Configuration
            </h2>
            <p style={{ fontSize: '13px', color: '#6E6E73', margin: '3px 0 0 0' }}>
              Mobile users tap <span style={{ fontWeight: 600, color: '#007AFF' }}>"See how it works?"</span> to play this video inline inside the mobile app.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {/* Save Button */}
            <button
              type="button"
              onClick={handleSave}
              disabled={saving || isInvalidUrl}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '7px 18px',
                fontSize: '13px',
                fontWeight: 600,
                color: '#FFFFFF',
                backgroundColor: isInvalidUrl ? '#C7C7CC' : '#007AFF',
                border: 'none',
                borderRadius: '7px',
                cursor: saving || isInvalidUrl ? 'not-allowed' : 'pointer',
                boxShadow: !isInvalidUrl ? '0 2px 6px rgba(0, 122, 255, 0.28)' : 'none',
                opacity: saving ? 0.75 : 1,
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={(e) => {
                if (!isInvalidUrl && !saving) e.currentTarget.style.backgroundColor = '#0062CC';
              }}
              onMouseLeave={(e) => {
                if (!isInvalidUrl && !saving) e.currentTarget.style.backgroundColor = '#007AFF';
              }}
            >
              <Save size={14} />
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>

        {/* macOS Card Body: ONLY the YouTube Link Card */}
        <div style={{ padding: '28px 24px' }}>
          <div
            style={{
              backgroundColor: '#FFFFFF',
              border: '1px solid rgba(0, 0, 0, 0.08)',
              borderRadius: '14px',
              padding: '24px',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.03)'
            }}
          >
            {/* Card Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '10px',
                  backgroundColor: '#FFF0F0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 1px 3px rgba(255, 0, 0, 0.08)'
                }}
              >
                <YoutubeIcon size={24} />
              </div>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: 700, margin: 0, color: '#1D1D1F' }}>
                  YouTube Video Link
                </h3>
                <p style={{ fontSize: '13px', color: '#6E6E73', margin: '2px 0 0 0' }}>
                  Enter any valid YouTube video or Short URL. Only YouTube links are accepted.
                </p>
              </div>
            </div>

            {/* Input Field */}
            <div style={{ marginBottom: '20px' }}>
              <label
                style={{
                  display: 'block',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: '#1D1D1F',
                  marginBottom: '8px'
                }}
              >
                Video URL <span style={{ color: '#FF3B30' }}>*</span>
              </label>

              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <div
                  style={{
                    position: 'absolute',
                    left: '12px',
                    pointerEvents: 'none',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                >
                  <YoutubeIcon size={18} color={isInvalidUrl ? '#FF3B30' : '#8E8E93'} />
                </div>

                <input
                  type="text"
                  value={youtubeUrl}
                  onChange={(e) => {
                    setYoutubeUrl(e.target.value);
                    setThumbnailError(false);
                    setIsPlayingInline(false);
                  }}
                  placeholder="https://www.youtube.com/watch?v=dQw4w9WgXcQ"
                  style={{
                    width: '100%',
                    padding: '11px 40px 11px 38px',
                    fontSize: '14px',
                    fontFamily: 'inherit',
                    color: '#1D1D1F',
                    backgroundColor: '#FFFFFF',
                    border: `1.5px solid ${isInvalidUrl ? '#FF3B30' : isValidYouTube ? '#34C759' : '#D1D1D6'}`,
                    borderRadius: '10px',
                    outline: 'none',
                    transition: 'all 0.15s ease',
                    boxSizing: 'border-box'
                  }}
                  onFocus={(e) => {
                    if (!isInvalidUrl) {
                      e.target.style.borderColor = '#007AFF';
                      e.target.style.boxShadow = '0 0 0 3px rgba(0, 122, 255, 0.2)';
                    }
                  }}
                  onBlur={(e) => {
                    e.target.style.boxShadow = 'none';
                    if (!isInvalidUrl) {
                      e.target.style.borderColor = isValidYouTube ? '#34C759' : '#D1D1D6';
                    }
                  }}
                />

                {/* Clear Button */}
                {youtubeUrl && (
                  <button
                    type="button"
                    onClick={() => {
                      setYoutubeUrl('');
                      setIsPlayingInline(false);
                    }}
                    style={{
                      position: 'absolute',
                      right: '12px',
                      background: 'none',
                      border: 'none',
                      color: '#8E8E93',
                      cursor: 'pointer',
                      padding: '4px',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                    title="Clear input"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>

              {/* Real-time Status / Validation Feedback */}
              <div style={{ marginTop: '8px', minHeight: '20px' }}>
                {isInvalidUrl && (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      fontSize: '12.5px',
                      color: '#FF3B30',
                      fontWeight: 500
                    }}
                  >
                    <AlertCircle size={15} />
                    <span>
                      Only valid YouTube links are accepted (e.g. <code>https://www.youtube.com/watch?v=...</code> or <code>https://youtu.be/...</code>).
                    </span>
                  </div>
                )}

                {isValidYouTube && (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      fontSize: '12.5px',
                      color: '#1B873F',
                      fontWeight: 500
                    }}
                  >
                    <CheckCircle2 size={15} color="#34C759" />
                    <span>
                      Valid YouTube link detected • Video ID:{' '}
                      <strong style={{ fontFamily: 'monospace', background: '#F2F2F7', padding: '1px 5px', borderRadius: '4px' }}>
                        {videoId}
                      </strong>
                    </span>
                  </div>
                )}

                {isInputEmpty && (
                  <div style={{ fontSize: '12.5px', color: '#8E8E93' }}>
                    Paste a YouTube link to display the thumbnail and set the in-app video.
                  </div>
                )}
              </div>
            </div>

            {/* macOS Divider */}
            <div style={{ height: '1px', backgroundColor: 'rgba(0, 0, 0, 0.07)', margin: '22px 0' }} />

            {/* YouTube Thumbnail / Video Preview Area */}
            <div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '12px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Eye size={15} color="#007AFF" />
                  <span style={{ fontSize: '13px', fontWeight: 600, color: '#1D1D1F' }}>
                    Preview
                  </span>
                </div>

                {isValidYouTube && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <button
                      type="button"
                      onClick={() => setIsPlayingInline(!isPlayingInline)}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px',
                        padding: '4px 10px',
                        fontSize: '12px',
                        fontWeight: 600,
                        color: isPlayingInline ? '#FFFFFF' : '#007AFF',
                        backgroundColor: isPlayingInline ? '#007AFF' : 'rgba(0, 122, 255, 0.1)',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      {isPlayingInline ? <Film size={13} /> : <Play size={13} />}
                      {isPlayingInline ? 'Show Thumbnail' : 'Test Player'}
                    </button>

                    <a
                      href={youtubeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        padding: '4px 10px',
                        fontSize: '12px',
                        fontWeight: 500,
                        color: '#6E6E73',
                        textDecoration: 'none',
                        backgroundColor: '#F2F2F7',
                        borderRadius: '6px',
                        transition: 'all 0.15s ease'
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = '#007AFF')}
                      onMouseLeave={(e) => (e.currentTarget.style.color = '#6E6E73')}
                    >
                      <span>Open on YouTube</span>
                      <ExternalLink size={12} />
                    </a>
                  </div>
                )}
              </div>

              {/* Thumbnail / Player Container */}
              {isValidYouTube ? (
                <div
                  style={{
                    position: 'relative',
                    width: '100%',
                    maxWidth: '680px',
                    aspectRatio: '16 / 9',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    backgroundColor: '#000000',
                    border: '1px solid rgba(0, 0, 0, 0.12)',
                    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)'
                  }}
                >
                  {isPlayingInline ? (
                    /* Inline YouTube Embed Player */
                    <iframe
                      src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`}
                      title="YouTube video preview player"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      style={{
                        width: '100%',
                        height: '100%',
                        display: 'block',
                        border: 'none'
                      }}
                    />
                  ) : (
                    /* YouTube High-Resolution Thumbnail View */
                    <div
                      style={{
                        position: 'relative',
                        width: '100%',
                        height: '100%',
                        cursor: 'pointer'
                      }}
                      onClick={() => setIsPlayingInline(true)}
                    >
                      <img
                        src={
                          thumbnailError
                            ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
                            : `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
                        }
                        onError={() => setThumbnailError(true)}
                        alt="YouTube Video Thumbnail"
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          display: 'block'
                        }}
                      />

                      {/* Dark Vignette Overlay */}
                      <div
                        style={{
                          position: 'absolute',
                          inset: 0,
                          background: 'linear-gradient(180deg, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.55) 100%)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          transition: 'background 0.2s ease'
                        }}
                      >
                        {/* YouTube Style Play Button */}
                        <div
                          style={{
                            width: '68px',
                            height: '48px',
                            backgroundColor: 'rgba(255, 0, 0, 0.95)',
                            borderRadius: '14px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
                            transition: 'transform 0.15s ease'
                          }}
                        >
                          <polygon points="2 2 14 10 2 18" fill="#FFFFFF" />
                          <Play size={22} color="#FFFFFF" fill="#FFFFFF" style={{ marginLeft: '3px' }} />
                        </div>
                      </div>

                      {/* Bottom Info Bar Overlay */}
                      <div
                        style={{
                          position: 'absolute',
                          bottom: '12px',
                          left: '12px',
                          right: '12px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          color: '#FFFFFF'
                        }}
                      >
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            backgroundColor: 'rgba(0, 0, 0, 0.72)',
                            backdropFilter: 'blur(8px)',
                            padding: '4px 10px',
                            borderRadius: '6px',
                            fontSize: '12px',
                            fontWeight: 500
                          }}
                        >
                          <YoutubeIcon size={14} />
                          <span>Click to preview player</span>
                        </div>

                        <span
                          style={{
                            backgroundColor: 'rgba(0, 0, 0, 0.72)',
                            backdropFilter: 'blur(8px)',
                            padding: '4px 10px',
                            borderRadius: '6px',
                            fontSize: '11px',
                            fontWeight: 600,
                            letterSpacing: '0.04em'
                          }}
                        >
                          HD THUMBNAIL
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                /* Empty / Invalid Placeholder Box */
                <div
                  style={{
                    width: '100%',
                    maxWidth: '680px',
                    aspectRatio: '16 / 9',
                    borderRadius: '12px',
                    border: '2px dashed #D1D1D6',
                    backgroundColor: '#F9F9FB',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '10px',
                    color: '#8E8E93',
                    textAlign: 'center',
                    padding: '20px',
                    boxSizing: 'border-box'
                  }}
                >
                  <div
                    style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '50%',
                      backgroundColor: '#E5E5EA',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#8E8E93'
                    }}
                  >
                    <Film size={24} />
                  </div>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: '#3A3A3C', marginBottom: '3px' }}>
                      No YouTube Video Loaded
                    </div>
                    <div style={{ fontSize: '12.5px', color: '#8E8E93', maxWidth: '340px' }}>
                      Enter a valid YouTube URL in the field above to see the official video thumbnail preview here.
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
