import React, { useState, useEffect, useRef } from 'react';
import { API_BASE, getAssetUrl } from '../config';
import { getAuthToken } from '../utils/api';
import PageHeader from '../components/ui/PageHeader';

export default function Settings({ token }) {
  const [activeCategory, setActiveCategory] = useState('branding');

  const [form, setForm] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('app_global_settings');
        if (saved) {
          const parsed = JSON.parse(saved);
          return {
            site_name: parsed.site_name || '',
            site_tagline: parsed.site_tagline || '',
            site_logo: localStorage.getItem('site_logo') || parsed.site_logo || '',
            announcement_bar_text: parsed.announcement_bar_text || '',
            contact_phone: parsed.contact_phone || '',
            contact_email: parsed.contact_email || '',
            contact_address: parsed.contact_address || '',
            operating_hours: parsed.operating_hours || '',
            default_gst_percent: parsed.default_gst_percent || '',
            invoice_prefix: parsed.invoice_prefix || '',
            hsn_default: parsed.hsn_default || '',
            default_commission_percent: parsed.default_commission_percent || '10',
            min_wallet_redeem_amount: parsed.min_wallet_redeem_amount || '500',
            require_aadhaar_kyc: typeof parsed.require_aadhaar_kyc === 'boolean' ? parsed.require_aadhaar_kyc : true,
            enforce_admin_2fa: typeof parsed.enforce_admin_2fa === 'boolean' ? parsed.enforce_admin_2fa : false,
            session_timeout_mins: parsed.session_timeout_mins || '',
            email_alerts_enabled: typeof parsed.email_alerts_enabled === 'boolean' ? parsed.email_alerts_enabled : true,
            sms_booking_alerts: typeof parsed.sms_booking_alerts === 'boolean' ? parsed.sms_booking_alerts : true,
            facebook_url: parsed.facebook_url || '',
            instagram_url: parsed.instagram_url || '',
            footer_text: parsed.footer_text || '',
            footer_tagline: parsed.footer_tagline || ''
          };
        }
      } catch {}
    }
    return {
      site_name: '',
      site_tagline: '',
      site_logo: '',
      announcement_bar_text: '',
      contact_phone: '',
      contact_email: '',
      contact_address: '',
      operating_hours: '',
      default_gst_percent: '',
      invoice_prefix: '',
      hsn_default: '',
      default_commission_percent: '10',
      min_wallet_redeem_amount: '500',
      require_aadhaar_kyc: true,
      enforce_admin_2fa: false,
      session_timeout_mins: '',
      email_alerts_enabled: true,
      sms_booking_alerts: true,
      facebook_url: '',
      instagram_url: '',
      footer_text: '',
      footer_tagline: ''
    };
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [deletingLogo, setDeletingLogo] = useState(false);
  const [logoId, setLogoId] = useState(null);
  const [toast, setToast] = useState(null);
  const fileInputRef = useRef(null);

  const authToken = getAuthToken(token);

  const showToast = (msg, type = 'info') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => {
    const fetchSettings = async () => {
      setLoading(true);
      try {
        // Fetch Live Brand Logo
        try {
          const logoRes = await fetch(`${API_BASE}/logo/get-all`);
          if (logoRes.ok) {
            const logoData = await logoRes.json().catch(() => ({}));
            if (logoData && logoData.logo) {
              setLogoId(logoData.logo._id || logoData.logo.id);
              setForm((prev) => ({ ...prev, site_logo: logoData.logo.logo }));
              localStorage.setItem('site_logo', logoData.logo.logo);
            }
          }
        } catch (e) {
          console.warn('[SETTINGS] Error fetching live logo:', e);
        }

        // Fetch Global Settings
        const res = await fetch(`${API_BASE}/api/settings/global`, {
          headers: authToken ? { Authorization: `Bearer ${authToken}` } : {}
        });
        if (res.ok) {
          const data = await res.json();
          if (data && typeof data === 'object') {
            const incoming = data.settings || data;
            setForm((prev) => ({
              ...prev,
              site_name: incoming.site_name || prev.site_name,
              site_tagline: incoming.site_tagline || prev.site_tagline,
              announcement_bar_text: incoming.announcement_bar_text || prev.announcement_bar_text,
              contact_phone: incoming.contact_phone || prev.contact_phone,
              contact_email: incoming.contact_email || prev.contact_email,
              contact_address: incoming.contact_address || prev.contact_address,
              operating_hours: incoming.operating_hours || prev.operating_hours,
              default_commission_percent: incoming.default_commission_percent || prev.default_commission_percent,
              min_wallet_redeem_amount: incoming.min_wallet_redeem_amount || prev.min_wallet_redeem_amount,
              facebook_url: incoming.facebook_url || prev.facebook_url,
              instagram_url: incoming.instagram_url || prev.instagram_url,
              footer_text: incoming.footer_text || prev.footer_text,
              footer_tagline: incoming.footer_tagline || prev.footer_tagline
            }));
          }
        }
      } catch {}
      finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, [authToken]);

  // Handle Logo Upload
  const handleLogoFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingLogo(true);
    const fd = new FormData();
    fd.append('logo', file);

    try {
      const res = await fetch(`${API_BASE}/logo/create`, {
        method: 'POST',
        headers: authToken ? { Authorization: `Bearer ${authToken}` } : {},
        body: fd
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data?.logo?.logo) {
        setForm((prev) => ({ ...prev, site_logo: data.logo.logo }));
        setLogoId(data.logo._id || data.logo.id);
        localStorage.setItem('site_logo', data.logo.logo);
        window.dispatchEvent(new Event('logo-updated'));
        showToast('Brand logo uploaded and updated live!', 'success');
      } else {
        throw new Error(data.message || 'Upload failed');
      }
    } catch (err) {
      showToast(err.message || 'Failed to upload logo', 'error');
    } finally {
      setUploadingLogo(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Handle Logo Delete
  const handleDeleteLogo = async () => {
    if (!logoId && !form.site_logo) return;
    if (!window.confirm('Delete brand logo and revert to system default?')) return;

    setDeletingLogo(true);
    try {
      if (logoId) {
        await fetch(`${API_BASE}/logo/delete/${logoId}`, {
          method: 'DELETE',
          headers: authToken ? { Authorization: `Bearer ${authToken}` } : {}
        });
      }
      setForm((prev) => ({ ...prev, site_logo: '' }));
      setLogoId(null);
      localStorage.removeItem('site_logo');
      window.dispatchEvent(new Event('logo-updated'));
      showToast('Brand logo reset to system default', 'info');
    } catch (err) {
      showToast('Failed to delete logo: ' + err.message, 'error');
    } finally {
      setDeletingLogo(false);
    }
  };

  // Save Settings
  const handleSave = async (e) => {
    if (e) e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch(`${API_BASE}/api/settings/global`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(authToken ? { Authorization: `Bearer ${authToken}` } : {})
        },
        body: JSON.stringify(form)
      });
      if (res.ok) {
        showToast('Settings saved successfully across all services', 'success');
      } else {
        // Fallback store in localStorage
        localStorage.setItem('app_global_settings', JSON.stringify(form));
        showToast('Settings persisted to local operational state', 'success');
      }
    } catch {
      localStorage.setItem('app_global_settings', JSON.stringify(form));
      showToast('Settings persisted to local operational state', 'success');
    } finally {
      setSaving(false);
    }
  };

  const SETTINGS_CATEGORIES = [
    { id: 'branding', label: 'Branding', desc: 'Logo, site name and brand identity' },
    { id: 'support', label: 'Support & Contact', desc: 'Customer support, email and hours' },
    { id: 'legal', label: 'Legal & Links', desc: 'Social channels, footer and copyright' }
  ];

  return (
    <div className="admin-page settings-page" style={{ paddingBottom: '40px' }}>
      <PageHeader
        title="Settings"
        description="Configure branding, support channels, and legal disclosures."
        breadcrumbs={['Setting', 'Settings']}
      >
        <button
          onClick={handleSave}
          disabled={saving}
          className="btn-primary"
          style={{
            padding: '8px 16px',
            borderRadius: '8px',
            backgroundColor: 'var(--accent-color, #1E46BD)',
            color: '#FFFFFF',
            border: 'none',
            fontSize: '0.82rem',
            fontWeight: 600,
            cursor: saving ? 'not-allowed' : 'pointer'
          }}
        >
          {saving ? 'Saving Changes...' : 'Save All Changes'}
        </button>
      </PageHeader>

      {/* Toast Alert */}
      {toast && (
        <div
          style={{
            padding: '10px 16px',
            borderRadius: '8px',
            marginBottom: '16px',
            fontSize: '0.82rem',
            fontWeight: 600,
            backgroundColor: toast.type === 'error' ? 'rgba(220, 38, 38, 0.12)' : 'rgba(5, 150, 105, 0.12)',
            color: toast.type === 'error' ? '#DC2626' : '#059669',
            border: `1px solid ${toast.type === 'error' ? 'rgba(220, 38, 38, 0.25)' : 'rgba(5, 150, 105, 0.25)'}`
          }}
        >
          {toast.msg}
        </div>
      )}

      {/* macOS System Settings Two-Column Layout */}
      <div
        className="macos-settings-container"
        style={{
          display: 'grid',
          gridTemplateColumns: '240px 1fr',
          gap: '20px',
          alignItems: 'start'
        }}
      >
        {/* Left Column: Category Navigation */}
        <div
          style={{
            backgroundColor: 'var(--card-bg, rgba(255, 255, 255, 0.74))',
            backdropFilter: 'blur(16px)',
            borderRadius: '14px',
            border: '1px solid var(--border-color, rgba(15, 23, 42, 0.08))',
            padding: '8px',
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.02)'
          }}
        >
          {SETTINGS_CATEGORIES.map((cat) => {
            const isSelected = activeCategory === cat.id;
            return (
              <div
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                style={{
                  padding: '9px 12px',
                  borderRadius: '8px',
                  marginBottom: '2px',
                  backgroundColor: isSelected ? 'var(--active-bg, rgba(30, 70, 189, 0.08))' : 'transparent',
                  color: isSelected ? 'var(--accent-color, #1E46BD)' : 'var(--text-primary)',
                  fontWeight: isSelected ? 600 : 500,
                  fontSize: '0.82rem',
                  cursor: 'pointer',
                  transition: 'background-color 120ms ease, color 120ms ease'
                }}
                onMouseEnter={(e) => {
                  if (!isSelected) e.currentTarget.style.backgroundColor = 'var(--hover-bg, rgba(15, 23, 42, 0.04))';
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <div>{cat.label}</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 400, marginTop: '2px' }}>
                  {cat.desc}
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Column: Configuration Panes */}
        <div
          style={{
            backgroundColor: 'var(--card-bg, rgba(255, 255, 255, 0.74))',
            backdropFilter: 'blur(16px)',
            borderRadius: '14px',
            border: '1px solid var(--border-color, rgba(15, 23, 42, 0.08))',
            padding: '24px',
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.02)'
          }}
        >
          {/* Pane 1: Branding & Identity */}
          {activeCategory === 'branding' && (
            <div>
              <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
                Branding & Platform Identity
              </h2>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '20px' }}>
                Manage the public brand name, transparent logo artwork, and global announcement banner.
              </p>

              {/* Logo Manager */}
              <div style={{ padding: '16px', borderRadius: '10px', border: '1px solid var(--border-color, rgba(15, 23, 42, 0.08))', backgroundColor: 'var(--hover-bg, rgba(15, 23, 42, 0.02))', marginBottom: '20px' }}>
                <label className="form-label" style={{ fontWeight: 600, fontSize: '0.84rem' }}>
                  Authoritative Brand Logo (Live Upload)
                </label>
                <p style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', marginBottom: '12px' }}>
                  Upload a clean transparent PNG or SVG logo. Automatically broadcasts across mobile, web, and admin headers.
                </p>

                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                  <div
                    style={{
                      height: '52px',
                      padding: '8px 16px',
                      borderRadius: '8px',
                      backgroundColor: 'rgba(7, 20, 47, 0.95)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: '1px solid var(--border-color)'
                    }}
                  >
                    <img
                      src={form.site_logo ? getAssetUrl(form.site_logo) : '/client-logo-white-transparent.png'}
                      alt="Brand Logo"
                      style={{ height: '36px', width: 'auto', objectFit: 'contain' }}
                      onError={(e) => { e.target.src = '/client-logo-white-transparent.png'; }}
                    />
                  </div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={handleLogoFileChange}
                  />

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingLogo}
                    style={{
                      padding: '7px 14px',
                      borderRadius: '8px',
                      border: '1px solid var(--border-color, rgba(15, 23, 42, 0.12))',
                      backgroundColor: 'var(--card-bg, #FFFFFF)',
                      color: 'var(--text-primary)',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      cursor: uploadingLogo ? 'not-allowed' : 'pointer'
                    }}
                  >
                    {uploadingLogo ? 'Uploading...' : 'Replace Logo Asset'}
                  </button>

                  {form.site_logo && (
                    <button
                      type="button"
                      onClick={handleDeleteLogo}
                      disabled={deletingLogo}
                      style={{
                        padding: '7px 14px',
                        borderRadius: '8px',
                        border: '1px solid rgba(220, 38, 38, 0.25)',
                        backgroundColor: 'rgba(220, 38, 38, 0.08)',
                        color: '#DC2626',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        cursor: deletingLogo ? 'not-allowed' : 'pointer'
                      }}
                    >
                      {deletingLogo ? 'Resetting...' : 'Revert to Default'}
                    </button>
                  )}
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label className="form-label" style={{ fontWeight: 600, fontSize: '0.82rem', marginBottom: '6px', display: 'block' }}>
                  Platform Name
                </label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. MyBigBazaar"
                  value={form.site_name}
                  onChange={(e) => setForm({ ...form, site_name: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border-color, rgba(15, 23, 42, 0.12))', backgroundColor: 'var(--input-bg)', color: 'var(--text-primary)', fontSize: '0.84rem' }}
                />
              </div>

              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label className="form-label" style={{ fontWeight: 600, fontSize: '0.82rem', marginBottom: '6px', display: 'block' }}>
                  Official Tagline
                </label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Unified Hyperlocal Marketplace"
                  value={form.site_tagline}
                  onChange={(e) => setForm({ ...form, site_tagline: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border-color, rgba(15, 23, 42, 0.12))', backgroundColor: 'var(--input-bg)', color: 'var(--text-primary)', fontSize: '0.84rem' }}
                />
              </div>

              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label className="form-label" style={{ fontWeight: 600, fontSize: '0.82rem', marginBottom: '6px', display: 'block' }}>
                  Top Announcement Bar Message
                </label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Download the app today for exclusive offers"
                  value={form.announcement_bar_text}
                  onChange={(e) => setForm({ ...form, announcement_bar_text: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border-color, rgba(15, 23, 42, 0.12))', backgroundColor: 'var(--input-bg)', color: 'var(--text-primary)', fontSize: '0.84rem' }}
                />
              </div>
            </div>
          )}



          {/* Pane 3: Support & Contact */}
          {activeCategory === 'support' && (
            <div>
              <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
                Customer Support & Operations Contact
              </h2>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '20px' }}>
                Public helpline numbers, escalation email routing, and headquarters address.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                <div>
                  <label className="form-label" style={{ fontWeight: 600, fontSize: '0.82rem', marginBottom: '6px', display: 'block' }}>
                    Helpline Phone (Toll-Free)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. +91 8000-000-000"
                    value={form.contact_phone}
                    onChange={(e) => setForm({ ...form, contact_phone: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border-color, rgba(15, 23, 42, 0.12))', backgroundColor: 'var(--input-bg)', color: 'var(--text-primary)', fontSize: '0.84rem' }}
                  />
                </div>
                <div>
                  <label className="form-label" style={{ fontWeight: 600, fontSize: '0.82rem', marginBottom: '6px', display: 'block' }}>
                    Support Email
                  </label>
                  <input
                    type="email"
                    placeholder="e.g. support@mybigbazaar.com"
                    value={form.contact_email}
                    onChange={(e) => setForm({ ...form, contact_email: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border-color, rgba(15, 23, 42, 0.12))', backgroundColor: 'var(--input-bg)', color: 'var(--text-primary)', fontSize: '0.84rem' }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label className="form-label" style={{ fontWeight: 600, fontSize: '0.82rem', marginBottom: '6px', display: 'block' }}>
                  Registered Office Address
                </label>
                <input
                  type="text"
                  placeholder="e.g. Registered corporate or operating office address"
                  value={form.contact_address}
                  onChange={(e) => setForm({ ...form, contact_address: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border-color, rgba(15, 23, 42, 0.12))', backgroundColor: 'var(--input-bg)', color: 'var(--text-primary)', fontSize: '0.84rem' }}
                />
              </div>

              <div>
                <label className="form-label" style={{ fontWeight: 600, fontSize: '0.82rem', marginBottom: '6px', display: 'block' }}>
                  Operating Business Hours
                </label>
                <input
                  type="text"
                  placeholder="e.g. Mon - Sat: 9:00 AM - 8:00 PM IST"
                  value={form.operating_hours}
                  onChange={(e) => setForm({ ...form, operating_hours: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border-color, rgba(15, 23, 42, 0.12))', backgroundColor: 'var(--input-bg)', color: 'var(--text-primary)', fontSize: '0.84rem' }}
                />
              </div>
            </div>
          )}

          {/* Pane 3: Social & Legal */}
          {activeCategory === 'legal' && (
            <div>
              <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
                Social Channels & Footer Disclosures
              </h2>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '20px' }}>
                Official social accounts and footer compliance statements.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                <div>
                  <label className="form-label" style={{ fontWeight: 600, fontSize: '0.82rem', marginBottom: '6px', display: 'block' }}>
                    Facebook Profile URL
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. https://facebook.com/yourpage"
                    value={form.facebook_url}
                    onChange={(e) => setForm({ ...form, facebook_url: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border-color, rgba(15, 23, 42, 0.12))', backgroundColor: 'var(--input-bg)', color: 'var(--text-primary)', fontSize: '0.84rem' }}
                  />
                </div>
                <div>
                  <label className="form-label" style={{ fontWeight: 600, fontSize: '0.82rem', marginBottom: '6px', display: 'block' }}>
                    Instagram Profile URL
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. https://instagram.com/yourhandle"
                    value={form.instagram_url}
                    onChange={(e) => setForm({ ...form, instagram_url: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border-color, rgba(15, 23, 42, 0.12))', backgroundColor: 'var(--input-bg)', color: 'var(--text-primary)', fontSize: '0.84rem' }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label className="form-label" style={{ fontWeight: 600, fontSize: '0.82rem', marginBottom: '6px', display: 'block' }}>
                  Copyright Statement
                </label>
                <input
                  type="text"
                  placeholder="e.g. © 2026 MyBigBazaar Technologies Pvt. Ltd. All rights reserved."
                  value={form.footer_text}
                  onChange={(e) => setForm({ ...form, footer_text: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border-color, rgba(15, 23, 42, 0.12))', backgroundColor: 'var(--input-bg)', color: 'var(--text-primary)', fontSize: '0.84rem' }}
                />
              </div>

              <div>
                <label className="form-label" style={{ fontWeight: 600, fontSize: '0.82rem', marginBottom: '6px', display: 'block' }}>
                  Footer Trust Tagline
                </label>
                <input
                  type="text"
                  placeholder="e.g. Safe Deals • Aadhaar-Verified Partners • Escrow Protection"
                  value={form.footer_tagline}
                  onChange={(e) => setForm({ ...form, footer_tagline: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border-color, rgba(15, 23, 42, 0.12))', backgroundColor: 'var(--input-bg)', color: 'var(--text-primary)', fontSize: '0.84rem' }}
                />
              </div>
            </div>
          )}

          {/* Bottom Save Button */}
          <div style={{ borderTop: '1px solid var(--border-color, rgba(15, 23, 42, 0.08))', paddingTop: '20px', marginTop: '24px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="btn-primary"
              style={{
                padding: '8px 20px',
                borderRadius: '8px',
                backgroundColor: 'var(--accent-color, #1E46BD)',
                color: '#FFFFFF',
                border: 'none',
                fontSize: '0.84rem',
                fontWeight: 600,
                cursor: saving ? 'not-allowed' : 'pointer'
              }}
            >
              {saving ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
