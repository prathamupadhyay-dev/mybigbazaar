import React, { useState, useEffect } from 'react';
import PageHeader from '../components/ui/PageHeader';
import ExportButton from '../components/common/ExportButton';
import { apiFetch } from '../utils/api';
import { getAssetUrl, DEFAULT_PRODUCT_PLACEHOLDER } from '../config';

export const INITIAL_PENDING_LISTINGS = [];

const REJECTION_REASONS = [
  'Inappropriate or Prohibited Item',
  'Suspected Counterfeit / Fraudulent',
  'Duplicate Listing or Spam',
  'Missing Price or Critical Specifications',
  'Low Quality / Inaccurate Photos',
  'Suspected Price Gouging / Unrealistic Value'
];

export default function PendingListings() {
  const [pendingList, setPendingList] = useState(INITIAL_PENDING_LISTINGS);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [toastMessage, setToastMessage] = useState(null);

  const fetchPending = async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const res = await apiFetch('/product/get-all');
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText || 'Unable to fetch pending listings'}`);
      }
      const json = await res.json().catch(() => ({}));
      const rawProducts = Array.isArray(json.products) ? json.products : (Array.isArray(json.data) ? json.data : (Array.isArray(json) ? json : []));
      const resolvedIds = JSON.parse(localStorage.getItem('resolved_pending_listings') || '[]');
      const pending = rawProducts
        .filter(p => (p.status === 'pending' || p.status === 'Pending' || p.status === 'pending_approval') && !resolvedIds.includes(p._id || p.id))
        .map((p, idx) => {
          const numericPrice = Number(p.productPrice ?? p.price) || 0;
          const dateStr = p.createdAt ? new Date(p.createdAt).toLocaleDateString() : 'Recent';
          return {
            id: p._id || p.id || `pending-${idx + 1}`,
            title: p.productName || p.title || 'Untitled Listing',
            price: numericPrice > 0 ? `₹${numericPrice.toLocaleString('en-IN')}` : (p.price || '₹0'),
            numericPrice,
            seller: p.sellerName || p.seller || 'Verified Seller',
            sellerTrustScore: p.sellerTrustScore || 95,
            condition: p.condition || 'Good',
            promoTier: p.promoTier || (p.isFeatured ? 'Featured' : 'Free'),
            category: (p.productCategorysId && p.productCategorysId[0]?.name) || p.category || 'General',
            submittedDate: dateStr,
            dateSubmitted: dateStr,
            description: p.productDetails || p.description || 'No description provided.',
            location: p.location || p.city || 'India',
            status: 'Pending',
            image: (p.images && p.images[0]) ? getAssetUrl(p.images[0]) : (p.image ? getAssetUrl(p.image) : DEFAULT_PRODUCT_PLACEHOLDER),
            raw: p
          };
        });
      setPendingList(pending);
    } catch (err) {
      setLoadError(String(err?.message || 'Failed to load pending listings from backend'));
      setPendingList([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPending();
  }, []);

  // Rejection modal
  const [rejectingListing, setRejectingListing] = useState(null);
  const [selectedReason, setSelectedReason] = useState(REJECTION_REASONS[0]);
  const [rejectionNotes, setRejectionNotes] = useState('');

  // Details inspection modal
  const [inspectingListing, setInspectingListing] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const recordResolved = (id) => {
    try {
      const resolved = JSON.parse(localStorage.getItem('resolved_pending_listings') || '[]');
      if (!resolved.includes(id)) {
        resolved.push(id);
        localStorage.setItem('resolved_pending_listings', JSON.stringify(resolved));
      }
    } catch (e) {}
  };

  const handleApprove = (listing) => {
    const listingId = listing.id;
    recordResolved(listingId);
    setPendingList((prev) => prev.filter((item) => item.id !== listingId));
    apiFetch(`/api/v1/listings/${listingId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status: 'live', moderationStatus: 'approved' })
    }).catch(console.warn);
    apiFetch(`/api/v1/moderation/listings/${listingId}`, {
      method: 'PUT',
      body: JSON.stringify({ action: 'approve' })
    }).catch(() => {});
    showToast(`Listing "${listing.title}" approved and published to live catalog.`);
  };

  const handleOpenReject = (listing) => {
    setRejectingListing(listing);
    setSelectedReason(REJECTION_REASONS[0]);
    setRejectionNotes('');
  };

  const handleConfirmReject = () => {
    if (!rejectingListing) return;
    const listingId = rejectingListing.id;
    recordResolved(listingId);
    setPendingList((prev) => prev.filter((item) => item.id !== listingId));
    apiFetch(`/api/v1/listings/${listingId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status: 'rejected', moderationStatus: 'rejected', rejectionReason: selectedReason, notes: rejectionNotes })
    }).catch(console.warn);
    apiFetch(`/api/v1/moderation/listings/${listingId}`, {
      method: 'PUT',
      body: JSON.stringify({ action: 'reject', reason: selectedReason })
    }).catch(() => {});
    showToast(`Listing "${rejectingListing.title}" rejected. Reason: ${selectedReason}.`);
    setRejectingListing(null);
  };

  const filteredListings = pendingList.filter((item) => {
    const q = (searchQuery || '').toLowerCase();
    const matchesSearch =
      (item.title || '').toLowerCase().includes(q) ||
      (item.seller || '').toLowerCase().includes(q) ||
      (item.id || '').toLowerCase().includes(q);
    const matchesCategory = categoryFilter === 'All' || item.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="admin-page">
      {/* Toast Alert */}
      {toastMessage && (
        <div
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            zIndex: 9999,
            backgroundColor: 'var(--card-bg)',
            backdropFilter: 'var(--glass-blur)',
            WebkitBackdropFilter: 'var(--glass-blur)',
            color: 'var(--text-primary)',
            padding: '12px 20px',
            borderRadius: 'var(--mbb-radius-md)',
            border: '1px solid var(--border-color)',
            boxShadow: '0 12px 36px rgba(0,0,0,0.18)',
            fontWeight: 600,
            fontSize: '0.84rem',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--status-success-text)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <PageHeader
        title="Pending Approvals"
        description="Review listings before publishing them to the marketplace."
        breadcrumbs={['Marketplace', 'Pending Approvals']}
      >
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button
            type="button"
            className="btn-secondary"
            onClick={fetchPending}
            disabled={loading}
            style={{ padding: '8px 14px', fontSize: '0.84rem' }}
          >
            {loading ? 'Refreshing...' : 'Refresh Queue'}
          </button>
          <ExportButton
            data={filteredListings}
            filename="pending_listings.csv"
            label="Export Approvals CSV"
            dateKey="submittedDate"
            columns={[
              { key: 'id', label: 'Listing ID' },
              { key: 'title', label: 'Item Title' },
              { key: 'category', label: 'Category' },
              { key: 'price', label: 'Price' },
              { key: 'seller', label: 'Seller' },
              { key: 'submittedDate', label: 'Submission Date' },
              { key: 'status', label: 'Status' }
            ]}
          />
        </div>
      </PageHeader>

      {/* Metrics Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', marginBottom: '20px' }}>
        <div className="admin-card" style={{ padding: '16px' }}>
          <div style={{ color: 'var(--text-secondary)', fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Awaiting Review
          </div>
          <div style={{ fontSize: '24px', fontWeight: '600', color: 'var(--text-primary)', marginTop: '4px' }}>
            {pendingList.length}
          </div>
        </div>

        <div className="admin-card" style={{ padding: '16px' }}>
          <div style={{ color: 'var(--text-secondary)', fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            High Value (&gt; ₹50K)
          </div>
          <div style={{ fontSize: '24px', fontWeight: '600', color: 'var(--text-primary)', marginTop: '4px' }}>
            {pendingList.filter((item) => item.numericPrice >= 50000).length}
          </div>
        </div>

        <div className="admin-card" style={{ padding: '16px' }}>
          <div style={{ color: 'var(--text-secondary)', fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Boosted Priority
          </div>
          <div style={{ fontSize: '24px', fontWeight: '600', color: 'var(--text-primary)', marginTop: '4px' }}>
            {pendingList.filter((item) => item.promoTier !== 'Free').length}
          </div>
        </div>

        <div className="admin-card" style={{ padding: '16px' }}>
          <div style={{ color: 'var(--text-secondary)', fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Standard Listings
          </div>
          <div style={{ fontSize: '24px', fontWeight: '600', color: 'var(--text-primary)', marginTop: '4px' }}>
            {pendingList.filter((item) => item.promoTier === 'Free' || !item.promoTier).length}
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="admin-card" style={{ padding: '20px' }}>
        {/* Filter Controls */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', gap: '16px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', gap: '12px', flex: 1, minWidth: '300px' }}>
            <input
              type="text"
              placeholder="Search by ID, title, or seller name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                flex: 1,
                padding: '9px 14px',
                borderRadius: '8px',
                border: '1px solid var(--border-color)',
                background: 'var(--input-bg)',
                color: 'var(--text-primary)',
                fontSize: '14px',
                outline: 'none'
              }}
            />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              style={{
                padding: '9px 14px',
                borderRadius: '8px',
                border: '1px solid var(--border-color)',
                fontSize: '14px',
                outline: 'none',
                background: 'var(--input-bg)',
                color: 'var(--text-primary)'
              }}
            >
              <option value="All">All Categories</option>
              <option value="Vehicles">Vehicles</option>
              <option value="Electronics">Electronics</option>
              <option value="Furniture">Furniture</option>
            </select>
          </div>
          <div style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>
            Showing <strong>{filteredListings.length}</strong> items
          </div>
        </div>

        {/* Table */}
        <div style={{ overflowX: 'auto' }}>
          <table className="admin-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                <th style={{ padding: '12px 14px', fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 600 }}>Item</th>
                <th style={{ padding: '12px 14px', fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 600 }}>Seller &amp; Trust</th>
                <th style={{ padding: '12px 14px', fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 600 }}>Category</th>
                <th style={{ padding: '12px 14px', fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 600 }}>Price</th>
                <th style={{ padding: '12px 14px', fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 600 }}>Tier</th>
                <th style={{ padding: '12px 14px', fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 600 }}>Submitted</th>
                <th style={{ padding: '12px 14px', fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 600, textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                    Loading pending listings queue from backend...
                  </td>
                </tr>
              ) : loadError ? (
                <tr>
                  <td colSpan="7" style={{ padding: '40px', textAlign: 'center', color: '#DC2626' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                      <div style={{ fontWeight: '600', fontSize: '15px' }}>Failed to load pending listings</div>
                      <div style={{ fontSize: '13px', color: '#7F1D1D' }}>{String(loadError)}</div>
                      <button type="button" className="btn-secondary" onClick={fetchPending} style={{ marginTop: '8px', cursor: 'pointer' }}>Retry</button>
                    </div>
                  </td>
                </tr>
              ) : filteredListings.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                    <div style={{ marginBottom: '12px', display: 'flex', justifyContent: 'center' }}><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg></div>
                    <div style={{ fontWeight: '600', fontSize: '15px', color: 'var(--text-primary)' }}>Queue Clear</div>
                    <div style={{ fontSize: '13px', marginTop: '4px' }}>All submitted listings have been reviewed.</div>
                  </td>
                </tr>
              ) : (
                filteredListings.map((item) => (
                <tr key={item.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <img
                        src={item.image || DEFAULT_PRODUCT_PLACEHOLDER}
                        alt={item.title}
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = DEFAULT_PRODUCT_PLACEHOLDER;
                        }}
                        style={{ width: '44px', height: '44px', borderRadius: '8px', objectFit: 'cover', background: 'var(--hover-bg)' }}
                      />
                      <div>
                        <div style={{ fontWeight: '600', fontSize: '14px', color: 'var(--text-primary)' }}>{item.title}</div>
                        <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{item.id} • {item.condition}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '14px' }}>
                    <div style={{ fontWeight: '600', fontSize: '13px', color: 'var(--text-primary)' }}>{item.seller}</div>
                    <div style={{ fontSize: '11px', color: 'var(--status-success-text)', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor" stroke="none">
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                      </svg>
                      <span>{item.sellerTrustScore}% Trust Score</span>
                    </div>
                  </td>
                  <td style={{ padding: '14px', fontSize: '13px' }}>
                    <span style={{ background: 'rgba(30, 70, 189, 0.1)', color: 'var(--accent-color)', padding: '3px 8px', borderRadius: '6px', fontSize: '12px', fontWeight: '600' }}>
                      {item.category}
                    </span>
                  </td>
                  <td style={{ padding: '14px', fontWeight: '600', fontSize: '15px', color: 'var(--text-primary)' }}>
                    {item.price}
                  </td>
                  <td style={{ padding: '14px' }}>
                    {item.promoTier === 'Urgent' && (
                      <span style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#EF4444', padding: '3px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: '600' }}>
                        Urgent Priority
                      </span>
                    )}
                    {item.promoTier === 'Featured' && (
                      <span style={{ background: 'rgba(233, 109, 15, 0.12)', color: '#E96D0F', padding: '3px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: '600' }}>
                        Featured Tier
                      </span>
                    )}
                    {item.promoTier === 'Free' && (
                      <span style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>Standard</span>
                    )}
                  </td>
                  <td style={{ padding: '14px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                    {item.dateSubmitted}
                  </td>
                  <td style={{ padding: '14px', textAlign: 'right' }}>
                    <button
                      onClick={() => setInspectingListing(item)}
                      className="btn-secondary"
                      style={{ padding: '6px 12px', marginRight: '6px', borderRadius: '6px', fontSize: '12px' }}
                    >
                      Inspect
                    </button>
                    <button
                      onClick={() => handleApprove(item)}
                      className="btn-primary"
                      style={{ padding: '6px 12px', marginRight: '6px', borderRadius: '6px', fontSize: '12px', background: '#1E9E5A', borderColor: '#1E9E5A' }}
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleOpenReject(item)}
                      className="btn-danger"
                      style={{ padding: '6px 12px', borderRadius: '6px', fontSize: '12px' }}
                    >
                      Reject
                    </button>
                  </td>
                </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Rejection Reason Modal */}
      {rejectingListing && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            backdropFilter: 'var(--glass-blur)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10000
          }}
        >
          <div
            className="admin-card"
            style={{
              background: 'var(--modal-bg)',
              borderRadius: '12px',
              padding: '24px',
              maxWidth: '520px',
              width: '90%',
              boxShadow: '0 12px 32px rgba(0,0,0,0.3)',
              border: '1px solid var(--border-color)'
            }}
          >
            <h3 style={{ fontSize: '17px', fontWeight: '600', color: '#EF4444', margin: '0 0 12px' }}>
              Reject Listing: {rejectingListing.title}
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '0 0 16px' }}>
              Select a reason for rejection. This will be recorded and shared with the seller.
            </p>

            <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '6px', color: 'var(--text-primary)' }}>
              Rejection Category
            </label>
            <select
              value={selectedReason}
              onChange={(e) => setSelectedReason(e.target.value)}
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '8px',
                border: '1px solid var(--border-color)',
                background: 'var(--input-bg)',
                color: 'var(--text-primary)',
                fontSize: '14px',
                marginBottom: '16px',
                outline: 'none'
              }}
            >
              {REJECTION_REASONS.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>

            <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '6px', color: 'var(--text-primary)' }}>
              Additional Moderation Notes (Optional)
            </label>
            <textarea
              rows={3}
              value={rejectionNotes}
              onChange={(e) => setRejectionNotes(e.target.value)}
              placeholder="e.g. Please upload clear photos showing both front and back of the item..."
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '8px',
                border: '1px solid var(--border-color)',
                background: 'var(--input-bg)',
                color: 'var(--text-primary)',
                fontSize: '13px',
                marginBottom: '20px',
                outline: 'none',
                resize: 'none'
              }}
            />

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                onClick={() => setRejectingListing(null)}
                className="btn-secondary"
                style={{ padding: '8px 16px', borderRadius: '6px' }}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmReject}
                className="btn-danger"
                style={{ padding: '8px 16px', borderRadius: '6px' }}
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Inspect Listing Modal */}
      {inspectingListing && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            backdropFilter: 'var(--glass-blur)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10000
          }}
        >
          <div
            className="admin-card"
            style={{
              background: 'var(--modal-bg)',
              borderRadius: '16px',
              padding: '24px',
              maxWidth: '650px',
              width: '90%',
              maxHeight: '90vh',
              overflowY: 'auto',
              border: '1px solid var(--border-color)',
              boxShadow: '0 12px 32px rgba(0,0,0,0.3)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '17px', fontWeight: '600', color: 'var(--text-primary)' }}>Listing Inspection</h3>
              <button
                type="button"
                onClick={() => setInspectingListing(null)}
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  border: '1px solid var(--border-color)',
                  backgroundColor: 'var(--hover-bg)',
                  color: 'var(--text-secondary)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer'
                }}
                aria-label="Close"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>

            <img
              src={inspectingListing.image}
              alt={inspectingListing.title}
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = DEFAULT_PRODUCT_PLACEHOLDER;
              }}
              style={{ width: '100%', height: '260px', borderRadius: '12px', objectFit: 'cover', marginBottom: '16px', background: 'var(--hover-bg)' }}
            />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
              <div>
                <h4 style={{ fontSize: '17px', fontWeight: '600', margin: '0 0 4px', color: 'var(--text-primary)' }}>
                  {inspectingListing.title}
                </h4>
                <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                  {inspectingListing.category} • Condition: <strong>{inspectingListing.condition}</strong>
                </div>
              </div>
              <div style={{ fontSize: '20px', fontWeight: '600', color: 'var(--accent-color)' }}>
                {inspectingListing.price}
              </div>
            </div>

            <div style={{ background: 'var(--hover-bg)', padding: '14px', borderRadius: '10px', marginBottom: '16px', fontSize: '13px' }}>
              <div style={{ fontWeight: '600', marginBottom: '4px', color: 'var(--text-primary)' }}>Description</div>
              <p style={{ margin: 0, color: 'var(--text-secondary)', lineHeight: '20px' }}>{inspectingListing.description}</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', marginBottom: '20px', fontSize: '13px' }}>
              <div style={{ padding: '10px', border: '1px solid var(--border-color)', borderRadius: '8px' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Seller:</span> <strong style={{ color: 'var(--text-primary)' }}>{inspectingListing.seller}</strong>
              </div>
              <div style={{ padding: '10px', border: '1px solid var(--border-color)', borderRadius: '8px' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Location:</span>{' '}
                <strong style={{ color: 'var(--text-primary)' }}>
                  {typeof inspectingListing.location === 'object' && inspectingListing.location !== null
                    ? ([inspectingListing.location.address, inspectingListing.location.city, inspectingListing.location.state].filter(Boolean).join(', ') || inspectingListing.location.city || 'India')
                    : (inspectingListing.location || 'India')}
                </strong>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                onClick={() => {
                  const toReject = inspectingListing;
                  setInspectingListing(null);
                  handleOpenReject(toReject);
                }}
                className="btn-danger"
                style={{ padding: '8px 16px', borderRadius: '6px' }}
              >
                Reject Listing
              </button>
              <button
                onClick={() => {
                  const toApprove = inspectingListing;
                  setInspectingListing(null);
                  handleApprove(toApprove);
                }}
                className="btn-primary"
                style={{ padding: '8px 16px', borderRadius: '6px', background: '#1E9E5A', borderColor: '#1E9E5A' }}
              >
                Approve &amp; Publish
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
