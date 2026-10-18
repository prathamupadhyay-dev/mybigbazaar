import React, { useState, useEffect, useRef } from 'react';
import PageHeader from '../components/ui/PageHeader';
import { LEGAL_DOCUMENTS } from '../../../../packages/shared/content.js';
import { apiGet, apiPut } from '../utils/api.js';
import { STOREFRONT_URL } from '../config.js';

export const SLUG_MAPPING = {
  terms: 'terms-of-service',
  privacy: 'privacy-policy',
  refunds: 'refund-policy',
  safety: 'trust-safety',
  buyerProtection: 'buyer-protection',
  about: 'about-us'
};

export const WEB_ROUTE_MAPPING = {
  terms: '/terms',
  privacy: '/privacy',
  refunds: '/refunds',
  safety: '/safety',
  buyerProtection: '/terms',
  about: '/about'
};

const DOC_ICONS = {
  terms: 'gavel',
  privacy: 'shield_lock',
  refunds: 'currency_rupee',
  safety: 'verified_user',
  buyerProtection: 'health_and_safety',
  about: 'info'
};

export const initialPages = {
  terms: {
    id: 'terms',
    slug: 'terms-of-service',
    title: 'Terms of Service',
    version: LEGAL_DOCUMENTS.terms.version,
    lastUpdated: '2026-09-15',
    status: 'Published',
    content: `# MyBigBazaar Terms of Service\n\nWelcome to MyBigBazaar. By accessing our mobile application, website, or services, you agree to comply with and be bound by the following terms.\n\n### 1. User Eligibility and Account Integrity\nAll users posting classified ads or offering services must maintain valid phone and identity credentials. Fraudulent, duplicate, or deceptive accounts will be permanently terminated.\n\n### 2. Marketplace Code of Conduct & Prohibited Items\n- Buyers and sellers must deal in good faith.\n- Directing transactions off-platform to avoid buyer protection is strictly prohibited.\n- Prohibited items: Weapons, prescription drugs, counterfeit items, stolen goods.\n\n### 3. Service Appointments & Cancellations\n- Customers may reschedule or cancel up to 2 hours before the scheduled time window at no fee.\n- Cancellations within 2 hours may incur a ₹99 technician dispatch surcharge.`
  },
  privacy: {
    id: 'privacy',
    slug: 'privacy-policy',
    title: 'Privacy Policy',
    version: LEGAL_DOCUMENTS.privacy.version,
    lastUpdated: '2026-08-20',
    status: 'Published',
    content: `# MyBigBazaar Privacy Policy\n\nYour privacy is paramount to us. This policy describes how we collect, store, and utilize your personal information.\n\n### 1. Information Collected\n- Contact Information: Full name, phone number, verified email address.\n- Geolocation Data: Used strictly for hyper-local discovery of goods and nearby technicians.\n- Financial Details: Payment transactions are processed via PCI-DSS compliant third-party gateways.\n\n### 2. Data Protection\nWe do not sell user phone numbers or behavioral telemetry to any third-party marketing entities.`
  },
  refunds: {
    id: 'refunds',
    slug: 'refund-policy',
    title: 'Refund & Cancellation Policy',
    version: LEGAL_DOCUMENTS.refunds.version,
    lastUpdated: '2026-09-01',
    status: 'Published',
    content: `# MyBigBazaar Refund & Cancellation Policy\n\nClear, transparent terms regarding escrow refunds, appointment cancellations, and service rework procedures.\n\n### 1. Escrow Protection Refunds\nIf the item received is defective or significantly different from the ad, the buyer may reject the item during daylight in-person inspection. 100% of escrow funds are refunded within 24-48 hours.\n\n### 2. 30-Day Service Re-Work Guarantee\nAll home repairs, electrical fixes, plumbing installations, and AC servicing booked through MyBigBazaar include an automatic 30-day warranty. If an issue recurs, a technician returns to fix it with zero inspection fees.`
  },
  safety: {
    id: 'safety',
    slug: 'trust-safety',
    title: 'Trust, Safety & Escrow Guidelines',
    version: LEGAL_DOCUMENTS.safety.version,
    lastUpdated: '2026-09-10',
    status: 'Published',
    content: `# MyBigBazaar Trust & Safety Guidelines\n\nEssential safety best practices for conducting safe peer-to-peer neighborhood transactions and home service appointments.\n\n### 1. Safe Meeting Places\nAlways arrange to meet sellers or buyers in busy, well-lit public places during daylight hours like metro stations, cafe lobbies, or society clubhouses.\n\n### 2. Beware of Reverse QR Scams\nScanning a QR code or entering your UPI MPIN always withdrawals money from your account, never deposits it. Never pay via QR codes sent in chat.`
  },
  buyerProtection: {
    id: 'buyerProtection',
    slug: 'buyer-protection',
    title: 'Buyer Protection Guarantee',
    version: '1.8.0',
    lastUpdated: '2026-09-01',
    status: 'Published',
    content: `# MyBigBazaar 100% Secure Deal Guarantee\n\nWe ensure that your marketplace purchases and home services are completely risk-free.\n\n### Service Satisfaction Guarantee\nIf an assigned technician fails to deliver the promised service standard or leaves incomplete work, our Quality Escalation Team will arrange a free rework or 100% refund within 48 hours.`
  },
  about: {
    id: 'about',
    slug: 'about-us',
    title: 'About MyBigBazaar',
    version: '1.0.0',
    lastUpdated: '2026-01-10',
    status: 'Published',
    content: `# About MyBigBazaar\n\nMyBigBazaar is India's next-generation unified hyper-local super-app, bringing classifieds commerce and verified on-demand home professionals under one seamless digital roof.`
  }
};

export default function StaticPages() {
  const [pages, setPages] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('admin_static_pages');
      if (saved) {
        try {
          return { ...initialPages, ...JSON.parse(saved) };
        } catch {
          // fallback
        }
      }
    }
    return initialPages;
  });

  const [selectedKey, setSelectedKey] = useState('terms');
  const [editTitle, setEditTitle] = useState(initialPages.terms.title);
  const [editContent, setEditContent] = useState(initialPages.terms.content);
  const [editVersion, setEditVersion] = useState(initialPages.terms.version);
  const [editStatus, setEditStatus] = useState(initialPages.terms.status);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [previewMode, setPreviewMode] = useState(false);

  const textareaRef = useRef(null);

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem('admin_static_pages', JSON.stringify(pages));
  }, [pages]);

  // Attempt to fetch fresh page from backend CMS
  useEffect(() => {
    const slug = SLUG_MAPPING[selectedKey] || selectedKey;
    apiGet(`/api/v1/cms/pages/${slug}`)
      .then((res) => {
        if (res?.data && res.data.content && !res.data.content.startsWith('Default content for')) {
          setPages((prev) => ({
            ...prev,
            [selectedKey]: {
              ...prev[selectedKey],
              title: res.data.title || prev[selectedKey].title,
              content: res.data.content,
              lastUpdated: res.data.updatedAt?.slice(0, 10) || prev[selectedKey].lastUpdated
            }
          }));
          setEditTitle(res.data.title || editTitle);
          setEditContent(res.data.content);
        }
      })
      .catch(() => {});
  }, [selectedKey]);

  const handleSelectPage = (key) => {
    setSelectedKey(key);
    const p = pages[key] || initialPages[key];
    setEditTitle(p.title);
    setEditContent(p.content);
    setEditVersion(p.version);
    setEditStatus(p.status || 'Published');
    setSaveMessage('');
    setPreviewMode(false);
  };

  const applyFormat = (prefix, suffix = '', defaultText = '') => {
    const el = textareaRef.current;
    if (!el) return;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const selected = editContent.substring(start, end) || defaultText;
    const replacement = `${prefix}${selected}${suffix}`;
    const newContent = editContent.substring(0, start) + replacement + editContent.substring(end);
    setEditContent(newContent);
    setTimeout(() => {
      el.focus();
      el.setSelectionRange(start + prefix.length, start + prefix.length + selected.length);
    }, 0);
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveMessage('');

    const slug = SLUG_MAPPING[selectedKey] || selectedKey;
    const updatedDoc = {
      ...pages[selectedKey],
      title: editTitle,
      content: editContent,
      version: editVersion,
      status: editStatus,
      lastUpdated: new Date().toISOString().slice(0, 10)
    };

    const newPages = {
      ...pages,
      [selectedKey]: updatedDoc
    };
    setPages(newPages);

    try {
      localStorage.setItem('admin_static_pages', JSON.stringify(newPages));
      localStorage.setItem(`mbb_cms_${slug}`, JSON.stringify({
        slug,
        title: editTitle,
        content: editContent,
        version: editVersion,
        status: editStatus,
        lastUpdated: updatedDoc.lastUpdated
      }));
      window.dispatchEvent(new Event('storage'));
    } catch (e) {
      console.warn('[CMS] LocalStorage write error:', e);
    }

    let apiSuccess = false;
    try {
      await apiPut(`/api/v1/cms/pages/${slug}`, {
        title: editTitle,
        content: editContent,
        version: editVersion,
        status: editStatus
      });
      apiSuccess = true;
    } catch {
      try {
        await apiPut(`/api/v1/cms/${slug}`, {
          title: editTitle,
          content: editContent
        });
        apiSuccess = true;
      } catch (err) {
        console.info('[CMS] Backend API sync deferred; stored in persistent local cache.');
      }
    }

    setIsSaving(false);
    if (apiSuccess) {
      setSaveMessage('Published live to database and storefront!');
    } else {
      setSaveMessage('Saved to local storage cache.');
    }

    setTimeout(() => {
      setSaveMessage('');
    }, 4500);
  };

  return (
    <div className="admin-page">
      <PageHeader
        title="Pages"
      >
        <a
          href={`${STOREFRONT_URL}${WEB_ROUTE_MAPPING[selectedKey] || '/terms'}`}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-secondary"
          style={{
            fontWeight: 600,
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            textDecoration: 'none'
          }}
          title="Open live published policy on web storefront"
        >
          <span>View Live on Web</span>
          <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>open_in_new</span>
        </a>
        <button
          type="button"
          className="btn-secondary"
          style={{ fontWeight: 600 }}
          onClick={() => setPreviewMode(!previewMode)}
        >
          {previewMode ? 'Edit Mode' : 'Live Preview'}
        </button>
        <button 
          className="btn-primary" 
          onClick={handleSave}
          disabled={isSaving}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>publish</span>
          <span>{isSaving ? 'Publishing...' : 'Save & Publish'}</span>
        </button>
      </PageHeader>

      {saveMessage && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          backgroundColor: 'var(--color-panel)',
          border: '1px solid #10b981',
          boxShadow: '0 8px 30px rgba(0,0,0,0.18)',
          borderRadius: '10px',
          padding: '12px 20px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          zIndex: 9999,
          fontSize: '0.88rem',
          fontWeight: 600,
          color: '#10b981'
        }}>
          <span className="material-symbols-outlined" style={{ fontSize: '18px', color: '#10b981' }}>check_circle</span>
          <span>{saveMessage}</span>
        </div>
      )}

      <div className="admin-split-pane" style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '20px' }}>
        {/* Left Sidebar List */}
        <div className="admin-card" style={{ padding: '16px', borderRadius: '12px' }}>
          <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--color-text-secondary)', fontWeight: 700, marginBottom: '12px', letterSpacing: '0.04em' }}>
            DOCUMENTS ({Object.keys(pages).length})
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {Object.keys(pages).map(key => {
              const p = pages[key];
              const isSelected = selectedKey === key;
              const iconName = DOC_ICONS[key] || 'description';
              return (
                <div
                  key={key}
                  style={{
                    padding: '10px 14px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    background: isSelected ? 'var(--hover-bg)' : 'transparent',
                    borderLeft: isSelected ? '3px solid var(--primary-color)' : '3px solid transparent',
                    color: isSelected ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
                    transition: 'all 120ms ease'
                  }}
                  onClick={() => handleSelectPage(key)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '18px', color: isSelected ? 'var(--primary-color)' : 'var(--color-text-secondary)' }}>
                      {iconName}
                    </span>
                    <div style={{ fontWeight: 600, fontSize: '0.88rem' }}>{p.title}</div>
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--color-text-secondary)', marginTop: '4px', display: 'flex', justifyContent: 'space-between', paddingLeft: '26px' }}>
                    <span>v{p.version}</span>
                    <span style={{ color: p.status === 'Published' ? '#10B981' : '#F59E0B', fontWeight: 600 }}>{p.status || 'Published'}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Editor / Preview Pane */}
        <div className="admin-card" style={{ borderRadius: '12px', padding: '24px' }}>
          <div className="admin-grid-3" style={{ marginBottom: '16px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label" style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '6px' }}>Document Title</label>
              <input
                type="text"
                className="form-input"
                style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', fontSize: '0.85rem' }}
                value={editTitle}
                onChange={e => setEditTitle(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label" style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '6px' }}>Version Number</label>
              <input
                type="text"
                className="form-input"
                style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', fontSize: '0.85rem' }}
                value={editVersion}
                onChange={e => setEditVersion(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label" style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '6px' }}>Publication Status</label>
              <select
                className="form-select"
                style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', fontSize: '0.85rem' }}
                value={editStatus}
                onChange={e => setEditStatus(e.target.value)}
              >
                <option value="Published">Published (Live)</option>
                <option value="Draft">Draft (Internal Only)</option>
              </select>
            </div>
          </div>

          {previewMode ? (
            <div style={{
              padding: '24px',
              backgroundColor: 'var(--hover-bg)',
              borderRadius: '8px',
              minHeight: '360px',
              lineHeight: '1.7',
              whiteSpace: 'pre-wrap',
              fontFamily: 'system-ui, sans-serif'
            }}>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '12px', color: 'var(--color-text-primary)' }}>{editTitle}</h2>
              <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginBottom: '16px' }}>
                Version: {editVersion} • Status: {editStatus} • Slug: <code>{SLUG_MAPPING[selectedKey]}</code> • Live URL: <code>{WEB_ROUTE_MAPPING[selectedKey]}</code>
              </div>
              <div style={{ fontSize: '0.92rem', color: 'var(--color-text-primary)' }}>
                {editContent}
              </div>
            </div>
          ) : (
            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <label className="form-label" style={{ fontSize: '12px', fontWeight: 600 }}>
                  Page Content
                </label>
                <span style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>Supports Markdown formatting</span>
              </div>

              {/* Rich Text Toolbar */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                padding: '6px 8px',
                background: 'var(--hover-bg)',
                border: '1px solid var(--border-color)',
                borderBottom: 'none',
                borderTopLeftRadius: '6px',
                borderTopRightRadius: '6px',
                flexWrap: 'wrap'
              }}>
                <button
                  type="button"
                  onClick={() => applyFormat('**', '**', 'bold text')}
                  title="Bold"
                  style={{
                    padding: '4px 8px',
                    borderRadius: '4px',
                    border: '1px solid var(--border-color)',
                    background: 'var(--bg-primary)',
                    color: 'var(--color-text-primary)',
                    cursor: 'pointer',
                    fontWeight: 700,
                    fontSize: '0.85rem'
                  }}
                >
                  B
                </button>
                <button
                  type="button"
                  onClick={() => applyFormat('*', '*', 'italic text')}
                  title="Italic"
                  style={{
                    padding: '4px 8px',
                    borderRadius: '4px',
                    border: '1px solid var(--border-color)',
                    background: 'var(--bg-primary)',
                    color: 'var(--color-text-primary)',
                    cursor: 'pointer',
                    fontStyle: 'italic',
                    fontSize: '0.85rem'
                  }}
                >
                  I
                </button>
                <button
                  type="button"
                  onClick={() => applyFormat('# ', '', 'Heading 1')}
                  title="Heading 1"
                  style={{
                    padding: '4px 8px',
                    borderRadius: '4px',
                    border: '1px solid var(--border-color)',
                    background: 'var(--bg-primary)',
                    color: 'var(--color-text-primary)',
                    cursor: 'pointer',
                    fontWeight: 700,
                    fontSize: '0.85rem'
                  }}
                >
                  H1
                </button>
                <button
                  type="button"
                  onClick={() => applyFormat('## ', '', 'Heading 2')}
                  title="Heading 2"
                  style={{
                    padding: '4px 8px',
                    borderRadius: '4px',
                    border: '1px solid var(--border-color)',
                    background: 'var(--bg-primary)',
                    color: 'var(--color-text-primary)',
                    cursor: 'pointer',
                    fontWeight: 700,
                    fontSize: '0.85rem'
                  }}
                >
                  H2
                </button>
                <button
                  type="button"
                  onClick={() => applyFormat('- ', '', 'List item')}
                  title="Bullet List"
                  style={{
                    padding: '4px 8px',
                    borderRadius: '4px',
                    border: '1px solid var(--border-color)',
                    background: 'var(--bg-primary)',
                    color: 'var(--color-text-primary)',
                    cursor: 'pointer',
                    fontSize: '0.85rem'
                  }}
                >
                  • List
                </button>
                <button
                  type="button"
                  onClick={() => applyFormat('[', '](https://)', 'Link text')}
                  title="Link"
                  style={{
                    padding: '4px 8px',
                    borderRadius: '4px',
                    border: '1px solid var(--border-color)',
                    background: 'var(--bg-primary)',
                    color: 'var(--color-text-primary)',
                    cursor: 'pointer',
                    fontSize: '0.85rem'
                  }}
                >
                  🔗 Link
                </button>
                <button
                  type="button"
                  onClick={() => applyFormat('`', '`', 'code')}
                  title="Inline Code"
                  style={{
                    padding: '4px 8px',
                    borderRadius: '4px',
                    border: '1px solid var(--border-color)',
                    background: 'var(--bg-primary)',
                    color: 'var(--color-text-primary)',
                    cursor: 'pointer',
                    fontSize: '0.85rem',
                    fontFamily: 'monospace'
                  }}
                >
                  &lt;/&gt;
                </button>
              </div>

              <textarea
                ref={textareaRef}
                className="form-textarea"
                rows="18"
                style={{
                  width: '100%',
                  padding: '12px',
                  borderTopLeftRadius: 0,
                  borderTopRightRadius: 0,
                  borderBottomLeftRadius: '6px',
                  borderBottomRightRadius: '6px',
                  border: '1px solid var(--border-color)',
                  background: 'var(--bg-primary)',
                  color: 'var(--color-text-primary)',
                  fontFamily: 'monospace',
                  fontSize: '0.85rem',
                  lineHeight: '1.5',
                  boxSizing: 'border-box'
                }}
                value={editContent}
                onChange={e => setEditContent(e.target.value)}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
