/**
 * @file apps/admin/src/pages/CustomerReviews.jsx
 * @description Customer Reviews & Ratings moderation and feedback audit page
 * macOS Native Desktop Architecture (Warm minimalist luxury canvas #F6F5F2, cards #FBFBFA)
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  Star,
  Trash2,
  Search,
  Filter,
  MessageSquare,
  AlertCircle,
  CheckCircle2,
  Eye,
  X,
  ExternalLink,
  Layers,
  Sparkles
} from 'lucide-react';
import PageHeader from '../components/ui/PageHeader';
import ExportButton from '../components/common/ExportButton';
import { apiGet, apiPut, apiDelete } from '../utils/api';

export default function CustomerReviews({ token }) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [ratingFilter, setRatingFilter] = useState('ALL');
  const [targetTypeFilter, setTargetTypeFilter] = useState('ALL');
  const [selectedReview, setSelectedReview] = useState(null);
  const [deletingReview, setDeletingReview] = useState(null);
  const [toast, setToast] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Fetch reviews from backend
  const fetchReviews = async () => {
    setLoading(true);
    try {
      const res = await apiGet('/api/v1/reviews', {}, token);
      const list = Array.isArray(res.data) ? res.data : (Array.isArray(res) ? res : []);
      setReviews(list);
    } catch (err) {
      console.warn('Failed to load reviews from API:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [token]);

  // Handle Approve / Flag Review Status
  const handleUpdateStatus = async (review, newStatus) => {
    const id = review._id || review.id;
    try {
      await apiPut(`/api/v1/reviews/${id}/status`, { status: newStatus }, {}, token);
      setReviews(prev =>
        prev.map(r => ((r._id || r.id) === id ? { ...r, status: newStatus } : r))
      );
      if (selectedReview && (selectedReview._id || selectedReview.id) === id) {
        setSelectedReview(prev => (prev ? { ...prev, status: newStatus } : null));
      }
      showToast(`Review marked as ${newStatus}.`);
    } catch (err) {
      showToast('Failed to update review status', 'error');
    }
  };

  // Handle Delete Review
  const handleDeleteReview = async () => {
    if (!deletingReview) return;
    setIsDeleting(true);
    try {
      const id = deletingReview._id || deletingReview.id;
      await apiDelete(`/api/v1/reviews/${id}`, {}, token);
      setReviews(prev => prev.filter(r => (r._id !== id && r.id !== id)));
      showToast('Review removed from public platform.');
      setDeletingReview(null);
    } catch (err) {
      const errMsg = err.data?.message || err.message || 'Failed to delete review';
      showToast(errMsg, 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  // KPI Calculations
  const stats = useMemo(() => {
    if (reviews.length === 0) {
      return { avg: '0.0', total: 0, fiveStar: 0, critical: 0, positivePercent: 0 };
    }
    const total = reviews.length;
    const sum = reviews.reduce((acc, r) => acc + (Number(r.rating) || 5), 0);
    const avg = (sum / total).toFixed(1);
    const fiveStar = reviews.filter(r => Number(r.rating) === 5).length;
    const critical = reviews.filter(r => Number(r.rating) <= 2 || r.status === 'Flagged').length;
    const positive = reviews.filter(r => Number(r.rating) >= 4).length;
    const positivePercent = Math.round((positive / total) * 100);

    return { avg, total, fiveStar, critical, positivePercent };
  }, [reviews]);

  // Filtered reviews
  const filteredReviews = useMemo(() => {
    return reviews.filter(rev => {
      // Rating filter
      if (ratingFilter !== 'ALL' && Number(rev.rating) !== Number(ratingFilter)) {
        return false;
      }
      // Target type filter
      if (targetTypeFilter !== 'ALL' && (rev.targetType || '').toLowerCase() !== targetTypeFilter.toLowerCase()) {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const reviewer = (rev.reviewerName || rev.userName || rev.reviewerId?.fullName || '').toLowerCase();
        const text = (rev.reviewText || rev.comment || '').toLowerCase();
        const target = (rev.productTitle || rev.targetName || rev.targetTitle || rev.targetType || '').toLowerCase();
        const seller = (rev.sellerName || '').toLowerCase();
        if (!reviewer.includes(q) && !text.includes(q) && !target.includes(q) && !seller.includes(q)) {
          return false;
        }
      }
      return true;
    });
  }, [reviews, ratingFilter, targetTypeFilter, searchQuery]);

  // Render Star Icons Helper
  const renderStars = (rating) => {
    const num = Math.min(5, Math.max(1, Math.round(Number(rating) || 5)));
    return (
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '2px' }}>
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={13}
            fill={star <= num ? '#F59E0B' : 'transparent'}
            stroke={star <= num ? '#F59E0B' : '#D1D5DB'}
            strokeWidth={1.8}
          />
        ))}
      </div>
    );
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '16px 8px 48px' }}>
      {/* Toast Alert */}
      {toast && (
        <div
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            backgroundColor: toast.type === 'error' ? '#FEF2F2' : '#F0FDF4',
            border: `1px solid ${toast.type === 'error' ? '#FCA5A5' : '#86EFAC'}`,
            color: toast.type === 'error' ? '#991B1B' : '#166534',
            padding: '12px 18px',
            borderRadius: '10px',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.08)',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontSize: '13px',
            fontWeight: 500,
            zIndex: 99999
          }}
        >
          {toast.type === 'error' ? <AlertCircle size={16} /> : <CheckCircle2 size={16} />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Top Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '20px',
          paddingBottom: '16px',
          borderBottom: '1px solid var(--color-border, #E7E5E4)'
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h1
              style={{
                fontSize: '22px',
                fontWeight: 700,
                color: 'var(--color-text-primary, #1C1917)',
                letterSpacing: '-0.02em',
                margin: 0
              }}
            >
              Customer Reviews
            </h1>
            <span
              style={{
                fontSize: '11px',
                fontWeight: 600,
                padding: '2px 8px',
                borderRadius: '999px',
                backgroundColor: 'var(--color-sunken, #EEEDE9)',
                color: 'var(--color-text-secondary, #57534E)',
                fontFamily: 'var(--font-mono, monospace)'
              }}
            >
              {reviews.length} {reviews.length === 1 ? 'Review' : 'Reviews'}
            </span>
          </div>
          <p
            style={{
              fontSize: '13px',
              color: 'var(--color-text-secondary, #57534E)',
              margin: '4px 0 0',
              lineHeight: 1.4
            }}
          >
            Monitor user feedback, verify star ratings, and moderate customer reviews across marketplace services & products.
          </p>
        </div>
        <ExportButton
          data={filteredReviews.map(r => ({
            id: r._id || r.id,
            createdAt: r.createdAt || '',
            userName: r.userName || 'Anonymous',
            targetType: r.targetType || 'service',
            targetTitle: r.targetTitle || 'Marketplace Item',
            rating: r.rating || 5,
            comment: r.comment || '',
            status: r.status || 'Active'
          }))}
          filename="customer_reviews.csv"
          label="Export Reviews CSV"
          dateKey="createdAt"
          columns={[
            { key: 'id', label: 'Review ID' },
            { key: 'createdAt', label: 'Date' },
            { key: 'userName', label: 'Reviewer' },
            { key: 'targetType', label: 'Category / Type' },
            { key: 'targetTitle', label: 'Target Product / Service' },
            { key: 'rating', label: 'Rating (Stars)' },
            { key: 'comment', label: 'Review Feedback' },
            { key: 'status', label: 'Status' }
          ]}
        />
      </div>

      {/* KPI Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '14px',
          marginBottom: '20px'
        }}
      >
        {/* Card 1: Average Rating */}
        <div
          style={{
            backgroundColor: 'var(--color-panel, #FBFBFA)',
            borderRadius: '12px',
            border: '1px solid var(--color-border, #E7E5E4)',
            padding: '16px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
          }}
        >
          <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-text-metadata, #6F6A65)', letterSpacing: '0.04em' }}>
            Average Customer Rating
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginTop: '6px' }}>
            <span style={{ fontSize: '28px', fontWeight: 800, color: 'var(--color-text-primary, #1C1917)', letterSpacing: '-0.03em' }}>
              {stats.avg}
            </span>
            <span style={{ fontSize: '13px', color: 'var(--color-text-metadata, #6F6A65)' }}>
              out of 5.0
            </span>
          </div>
          <div style={{ marginTop: '6px' }}>
            {renderStars(stats.avg)}
          </div>
        </div>

        {/* Card 2: Total Reviews */}
        <div
          style={{
            backgroundColor: 'var(--color-panel, #FBFBFA)',
            borderRadius: '12px',
            border: '1px solid var(--color-border, #E7E5E4)',
            padding: '16px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
          }}
        >
          <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-text-metadata, #6F6A65)', letterSpacing: '0.04em' }}>
            Total Reviews
          </div>
          <div style={{ fontSize: '28px', fontWeight: 800, color: 'var(--color-text-primary, #1C1917)', marginTop: '6px', letterSpacing: '-0.03em' }}>
            {stats.total}
          </div>
          <div style={{ fontSize: '11.5px', color: 'var(--color-text-secondary, #57534E)', marginTop: '6px' }}>
            Verified customer feedbacks
          </div>
        </div>

        {/* Card 3: Positive Sentiment */}
        <div
          style={{
            backgroundColor: 'var(--color-panel, #FBFBFA)',
            borderRadius: '12px',
            border: '1px solid var(--color-border, #E7E5E4)',
            padding: '16px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
          }}
        >
          <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-text-metadata, #6F6A65)', letterSpacing: '0.04em' }}>
            Positive Sentiment (4-5★)
          </div>
          <div style={{ fontSize: '28px', fontWeight: 800, color: '#059669', marginTop: '6px', letterSpacing: '-0.03em' }}>
            {stats.positivePercent}%
          </div>
          <div style={{ fontSize: '11.5px', color: 'var(--color-text-secondary, #57534E)', marginTop: '6px' }}>
            {stats.fiveStar} perfect 5-star ratings
          </div>
        </div>

        {/* Card 4: Critical Reviews */}
        <div
          style={{
            backgroundColor: 'var(--color-panel, #FBFBFA)',
            borderRadius: '12px',
            border: '1px solid var(--color-border, #E7E5E4)',
            padding: '16px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
          }}
        >
          <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-text-metadata, #6F6A65)', letterSpacing: '0.04em' }}>
            Critical Feedback (&le; 2★)
          </div>
          <div style={{ fontSize: '28px', fontWeight: 800, color: stats.critical > 0 ? '#DC2626' : 'var(--color-text-primary, #1C1917)', marginTop: '6px', letterSpacing: '-0.03em' }}>
            {stats.critical}
          </div>
          <div style={{ fontSize: '11.5px', color: 'var(--color-text-secondary, #57534E)', marginTop: '6px' }}>
            Flagged for support follow-up
          </div>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
          marginBottom: '16px',
          padding: '10px 14px',
          backgroundColor: 'var(--color-panel, #FBFBFA)',
          borderRadius: '10px',
          border: '1px solid var(--color-border, #E7E5E4)'
        }}
      >
        {/* Search Input */}
        <div style={{ position: 'relative', width: '320px', maxWidth: '100%' }}>
          <Search
            size={14}
            style={{
              position: 'absolute',
              left: '10px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--color-text-metadata, #6F6A65)'
            }}
          />
          <input
            type="text"
            placeholder="Search reviewer, comment, or target..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '6px 10px 6px 30px',
              fontSize: '12.5px',
              borderRadius: '6px',
              border: '1px solid var(--color-border, #E7E5E4)',
              backgroundColor: '#FFFFFF',
              color: 'var(--color-text-primary, #1C1917)',
              boxSizing: 'border-box'
            }}
          />
        </div>

        {/* Filter Pills */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          {/* Target Type Filter */}
          <div style={{ display: 'flex', alignItems: 'center', backgroundColor: 'var(--color-sunken, #EEEDE9)', borderRadius: '6px', padding: '2px' }}>
            {['ALL', 'service', 'product', 'provider'].map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setTargetTypeFilter(type)}
                style={{
                  padding: '4px 8px',
                  fontSize: '11px',
                  fontWeight: 600,
                  borderRadius: '4px',
                  border: 'none',
                  backgroundColor: targetTypeFilter === type ? 'var(--color-panel, #FBFBFA)' : 'transparent',
                  color: targetTypeFilter === type ? 'var(--color-text-primary, #1C1917)' : 'var(--color-text-secondary, #57534E)',
                  boxShadow: targetTypeFilter === type ? '0 1px 2px rgba(0,0,0,0.06)' : 'none',
                  cursor: 'pointer',
                  textTransform: 'capitalize'
                }}
              >
                {type === 'ALL' ? 'All Types' : type}
              </button>
            ))}
          </div>

          {/* Rating Star Filter */}
          <div style={{ display: 'flex', alignItems: 'center', backgroundColor: 'var(--color-sunken, #EEEDE9)', borderRadius: '6px', padding: '2px' }}>
            {['ALL', '5', '4', '3', '2', '1'].map((stars) => (
              <button
                key={stars}
                type="button"
                onClick={() => setRatingFilter(stars)}
                style={{
                  padding: '4px 7px',
                  fontSize: '11px',
                  fontWeight: 600,
                  borderRadius: '4px',
                  border: 'none',
                  backgroundColor: ratingFilter === stars ? 'var(--color-panel, #FBFBFA)' : 'transparent',
                  color: ratingFilter === stars ? 'var(--color-text-primary, #1C1917)' : 'var(--color-text-secondary, #57534E)',
                  boxShadow: ratingFilter === stars ? '0 1px 2px rgba(0,0,0,0.06)' : 'none',
                  cursor: 'pointer'
                }}
              >
                {stars === 'ALL' ? 'All Stars' : `${stars}★`}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Reviews Table / Listing */}
      <div
        style={{
          backgroundColor: 'var(--color-panel, #FBFBFA)',
          borderRadius: '12px',
          border: '1px solid var(--color-border, #E7E5E4)',
          overflow: 'hidden',
          boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
        }}
      >
        {/* Table Header */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(180px, 1.8fr) 110px minmax(240px, 3fr) minmax(180px, 2fr) 110px 145px',
            padding: '10px 16px',
            backgroundColor: 'var(--color-sunken, #EEEDE9)',
            borderBottom: '1px solid var(--color-border, #E7E5E4)',
            fontSize: '11px',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            color: 'var(--color-text-metadata, #6F6A65)'
          }}
        >
          <div>Customer</div>
          <div>Rating</div>
          <div>Review Comment</div>
          <div>Product &amp; Seller</div>
          <div>Date &amp; Status</div>
          <div style={{ textAlign: 'right' }}>Actions</div>
        </div>

        {/* Rows */}
        {loading ? (
          <div style={{ padding: '36px', textAlign: 'center', color: 'var(--color-text-secondary, #57534E)', fontSize: '13px' }}>
            Loading customer reviews...
          </div>
        ) : filteredReviews.length === 0 ? (
          <div style={{ padding: '48px 24px', textAlign: 'center' }}>
            <MessageSquare size={32} style={{ color: '#A8A29E', margin: '0 auto 12px', display: 'block' }} />
            <p style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: 'var(--color-text-primary, #1C1917)' }}>
              No reviews found
            </p>
            <p style={{ margin: '4px 0 0', fontSize: '12px', color: 'var(--color-text-secondary, #57534E)' }}>
              Try adjusting your search query or filters.
            </p>
          </div>
        ) : (
          filteredReviews.map((rev) => {
            const reviewerName = rev.reviewerName || rev.userName || rev.reviewerId?.fullName || 'Verified Customer';
            const reviewerEmail = rev.reviewerEmail || rev.reviewerId?.email || '';
            const targetTitle = rev.productTitle || rev.targetName || rev.targetTitle || (rev.targetType ? `${rev.targetType.toUpperCase()} #${(rev.targetId || '').slice(-6)}` : 'Marketplace Item');
            const targetType = rev.targetType || 'product';
            const sellerName = rev.sellerName || '';
            const commentText = rev.reviewText || rev.comment || '';
            const status = rev.status || 'Approved';
            const isNegative = Number(rev.rating) <= 2 || status === 'Flagged';

            return (
              <div
                key={rev._id || rev.id}
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'minmax(180px, 1.8fr) 110px minmax(240px, 3fr) minmax(180px, 2fr) 110px 145px',
                  alignItems: 'center',
                  padding: '13px 16px',
                  borderBottom: '1px solid var(--color-border, #E7E5E4)',
                  transition: 'background-color 120ms ease'
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--hover-bg, #F6F5F2)')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
              >
                {/* 1. Customer */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0, paddingRight: '12px' }}>
                  <div
                    style={{
                      width: '30px',
                      height: '30px',
                      borderRadius: '50%',
                      backgroundColor: 'var(--color-navy, #0B2545)',
                      color: '#FBFBFA',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '11px',
                      fontWeight: 700,
                      flexShrink: 0
                    }}
                  >
                    {reviewerName.charAt(0).toUpperCase()}
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--color-text-primary, #1C1917)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {reviewerName}
                    </div>
                    {reviewerEmail ? (
                      <div style={{ fontSize: '11px', color: 'var(--color-text-metadata, #6F6A65)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {reviewerEmail}
                      </div>
                    ) : (
                      <div style={{ fontSize: '10.5px', color: '#059669', fontWeight: 600 }}>
                        Verified Buyer
                      </div>
                    )}
                  </div>
                </div>

                {/* 2. Rating */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span style={{ fontSize: '12.5px', fontWeight: 700, color: isNegative ? '#DC2626' : 'var(--color-text-primary, #1C1917)' }}>
                      {Number(rev.rating || 5).toFixed(1)}
                    </span>
                    {renderStars(rev.rating)}
                  </div>
                </div>

                {/* 3. Review Comment */}
                <div style={{ paddingRight: '16px' }}>
                  <div
                    style={{
                      fontSize: '12.5px',
                      color: 'var(--color-text-secondary, #57534E)',
                      lineHeight: 1.4,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'normal',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical'
                    }}
                  >
                    {commentText || <em style={{ color: '#A8A29E' }}>No written comment provided.</em>}
                  </div>
                </div>

                {/* 4. Target Entity & Seller */}
                <div style={{ paddingRight: '12px' }}>
                  <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-primary, #1C1917)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {targetTitle}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px', flexWrap: 'wrap' }}>
                    <span
                      style={{
                        display: 'inline-block',
                        fontSize: '10px',
                        fontWeight: 600,
                        padding: '1px 5px',
                        borderRadius: '4px',
                        backgroundColor: 'var(--color-sunken, #EEEDE9)',
                        color: 'var(--color-text-metadata, #6F6A65)',
                        textTransform: 'uppercase'
                      }}
                    >
                      {targetType}
                    </span>
                    {sellerName && (
                      <span style={{ fontSize: '11px', color: 'var(--color-text-metadata, #6F6A65)' }}>
                        Seller: {sellerName}
                      </span>
                    )}
                  </div>
                </div>

                {/* 5. Date & Status */}
                <div>
                  <div style={{ fontSize: '11.5px', color: 'var(--color-text-metadata, #6F6A65)', fontFamily: 'var(--font-mono, monospace)' }}>
                    {rev.createdAt ? new Date(rev.createdAt).toLocaleDateString() : 'Recent'}
                  </div>
                  <span
                    style={{
                      display: 'inline-block',
                      marginTop: '2px',
                      fontSize: '10px',
                      fontWeight: 700,
                      padding: '1px 6px',
                      borderRadius: '4px',
                      backgroundColor: status === 'Flagged' ? '#FEE2E2' : '#DCFCE7',
                      color: status === 'Flagged' ? '#DC2626' : '#15803D'
                    }}
                  >
                    {status}
                  </span>
                </div>

                {/* 6. Actions */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '5px' }}>
                  {status !== 'Approved' && (
                    <button
                      type="button"
                      onClick={() => handleUpdateStatus(rev, 'Approved')}
                      title="Approve review"
                      style={{
                        padding: '4px 7px',
                        fontSize: '10.5px',
                        fontWeight: 600,
                        borderRadius: '5px',
                        border: '1px solid #86EFAC',
                        backgroundColor: '#F0FDF4',
                        color: '#15803D',
                        cursor: 'pointer'
                      }}
                    >
                      Approve
                    </button>
                  )}
                  {status !== 'Flagged' && (
                    <button
                      type="button"
                      onClick={() => handleUpdateStatus(rev, 'Flagged')}
                      title="Flag review"
                      style={{
                        padding: '4px 7px',
                        fontSize: '10.5px',
                        fontWeight: 600,
                        borderRadius: '5px',
                        border: '1px solid #FDE68A',
                        backgroundColor: '#FFFBEB',
                        color: '#B45309',
                        cursor: 'pointer'
                      }}
                    >
                      Flag
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setSelectedReview(rev)}
                    title="View details"
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '6px',
                      border: '1px solid var(--color-border, #E7E5E4)',
                      backgroundColor: 'transparent',
                      color: 'var(--color-text-metadata, #6F6A65)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer'
                    }}
                  >
                    <Eye size={13} />
                  </button>

                  <button
                    type="button"
                    onClick={() => setDeletingReview(rev)}
                    title="Delete review"
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '6px',
                      border: '1px solid var(--color-border, #E7E5E4)',
                      backgroundColor: 'transparent',
                      color: 'var(--color-text-metadata, #6F6A65)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer'
                    }}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ======================================================== */}
      {/* MODAL: VIEW REVIEW DETAILS                                */}
      {/* ======================================================== */}
      {selectedReview && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(28, 25, 23, 0.45)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            zIndex: 10000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelectedReview(null);
          }}
        >
          <div
            style={{
              width: '520px',
              maxWidth: '92vw',
              backgroundColor: 'var(--color-panel, #FBFBFA)',
              borderRadius: '14px',
              border: '1px solid var(--color-border, #E7E5E4)',
              boxShadow: '0 20px 40px -10px rgba(0,0,0,0.22)',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            {/* Modal Header */}
            <div
              style={{
                padding: '16px 20px',
                borderBottom: '1px solid var(--color-border, #E7E5E4)',
                backgroundColor: 'var(--color-sunken, #EEEDE9)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <div>
                <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: 'var(--color-text-primary, #1C1917)' }}>
                  Review Details
                </h3>
                <span style={{ fontSize: '11px', color: 'var(--color-text-metadata, #6F6A65)' }}>
                  ID: {selectedReview._id || selectedReview.id}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedReview(null)}
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '6px',
                  border: '1px solid var(--color-border, #E7E5E4)',
                  backgroundColor: 'transparent',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: 'var(--color-text-metadata, #6F6A65)'
                }}
              >
                <X size={15} />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Rating & Reviewer Banner */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 14px',
                  backgroundColor: '#FFFFFF',
                  borderRadius: '8px',
                  border: '1px solid var(--color-border, #E7E5E4)'
                }}
              >
                <div>
                  <div style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--color-text-primary, #1C1917)' }}>
                    {selectedReview.reviewerName || selectedReview.reviewerId?.fullName || 'Verified Customer'}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--color-text-metadata, #6F6A65)' }}>
                    {selectedReview.reviewerEmail || selectedReview.reviewerId?.email || 'customer@mybigbazaar.com'}
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '16px', fontWeight: 800, color: '#F59E0B' }}>
                    {selectedReview.rating}.0
                  </div>
                  <div>{renderStars(selectedReview.rating)}</div>
                </div>
              </div>

              {/* Review Text */}
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-text-metadata, #6F6A65)', marginBottom: '4px' }}>
                  Review Comment
                </label>
                <div
                  style={{
                    padding: '12px 14px',
                    borderRadius: '8px',
                    backgroundColor: '#FFFFFF',
                    border: '1px solid var(--color-border, #E7E5E4)',
                    fontSize: '13px',
                    color: 'var(--color-text-primary, #1C1917)',
                    lineHeight: 1.5
                  }}
                >
                  {selectedReview.reviewText || 'No written comment.'}
                </div>
              </div>

              {/* Target Entity */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-text-metadata, #6F6A65)', marginBottom: '4px' }}>
                    Reviewed Target
                  </label>
                  <div style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--color-text-primary, #1C1917)' }}>
                    {selectedReview.targetName || selectedReview.targetTitle || selectedReview.targetType || 'Item'}
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-text-metadata, #6F6A65)', marginBottom: '4px' }}>
                    Entity Classification
                  </label>
                  <span
                    style={{
                      display: 'inline-block',
                      fontSize: '11px',
                      fontWeight: 600,
                      padding: '2px 8px',
                      borderRadius: '4px',
                      backgroundColor: 'var(--color-sunken, #EEEDE9)',
                      color: 'var(--color-text-metadata, #6F6A65)',
                      textTransform: 'uppercase'
                    }}
                  >
                    {selectedReview.targetType || 'Service'}
                  </span>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div
              style={{
                padding: '12px 20px',
                borderTop: '1px solid var(--color-border, #E7E5E4)',
                backgroundColor: 'var(--color-sunken, #EEEDE9)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
                gap: '8px'
              }}
            >
              <button
                type="button"
                onClick={() => setSelectedReview(null)}
                style={{
                  padding: '7px 14px',
                  fontSize: '12px',
                  fontWeight: 600,
                  borderRadius: '6px',
                  border: '1px solid var(--color-border, #E7E5E4)',
                  backgroundColor: 'transparent',
                  color: 'var(--color-text-secondary, #57534E)',
                  cursor: 'pointer'
                }}
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  const rev = selectedReview;
                  setSelectedReview(null);
                  setDeletingReview(rev);
                }}
                style={{
                  padding: '7px 14px',
                  fontSize: '12px',
                  fontWeight: 600,
                  borderRadius: '6px',
                  border: 'none',
                  backgroundColor: '#DC2626',
                  color: '#FFFFFF',
                  cursor: 'pointer'
                }}
              >
                Delete Review
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: DELETE REVIEW CONFIRMATION                         */}
      {/* ======================================================== */}
      {deletingReview && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(28, 25, 23, 0.45)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            zIndex: 10000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget && !isDeleting) setDeletingReview(null);
          }}
        >
          <div
            style={{
              width: '420px',
              maxWidth: '92vw',
              backgroundColor: 'var(--color-panel, #FBFBFA)',
              borderRadius: '12px',
              border: '1px solid var(--color-border, #E7E5E4)',
              boxShadow: '0 20px 40px -10px rgba(0,0,0,0.22)',
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  backgroundColor: '#FEE2E2',
                  color: '#DC2626',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}
              >
                <Trash2 size={18} />
              </div>
              <div>
                <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: 'var(--color-text-primary, #1C1917)' }}>
                  Delete Review?
                </h4>
                <p style={{ margin: '2px 0 0', fontSize: '12px', color: 'var(--color-text-secondary, #57534E)' }}>
                  Are you sure you want to permanently delete this customer review? It will be removed from ratings.
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px', marginTop: '6px' }}>
              <button
                type="button"
                onClick={() => setDeletingReview(null)}
                disabled={isDeleting}
                style={{
                  padding: '7px 14px',
                  fontSize: '12px',
                  fontWeight: 600,
                  borderRadius: '6px',
                  border: '1px solid var(--color-border, #E7E5E4)',
                  backgroundColor: 'transparent',
                  color: 'var(--color-text-secondary, #57534E)',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteReview}
                disabled={isDeleting}
                style={{
                  padding: '7px 16px',
                  fontSize: '12px',
                  fontWeight: 600,
                  borderRadius: '6px',
                  border: 'none',
                  backgroundColor: '#DC2626',
                  color: '#FFFFFF',
                  cursor: 'pointer'
                }}
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
