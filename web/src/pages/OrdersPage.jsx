/**
 * @file apps/web/src/pages/OrdersPage.jsx
 * @description Master Orders & Bookings tracking dashboard for consumer accounts.
 * Features live 6-stage dynamic Order Tracking synced with /api/v1/orders and Admin Panel.
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';
import AuthModal from '../components/AuthModal.jsx';
import { useApp } from '../context/AppContext.jsx';
import { webApi } from '../services/apiClient.js';

const WEB_TRACKING_STAGES = [
  { key: 'placed', step: 1, title: 'Order Placed' },
  { key: 'confirmed', step: 2, title: 'Order Confirmed' },
  { key: 'processing', step: 3, title: 'Packed & Processing' },
  { key: 'shipped', step: 4, title: 'Shipped / In-Transit' },
  { key: 'out_for_delivery', step: 5, title: 'Out for Delivery' },
  { key: 'delivered', step: 6, title: 'Delivered & Completed' }
];

function getOrderStep(trackingStatus, status) {
  const s = String(status || '').toLowerCase();
  const t = String(trackingStatus || '').toLowerCase();
  if (['cancelled', 'canceled', 'returned', 'rejected'].includes(s) || ['cancelled', 'canceled', 'returned', 'rejected'].includes(t)) {
    return 0;
  }
  if (['completed', 'delivered'].includes(s) || ['completed', 'delivered'].includes(t)) {
    return 6;
  }
  if (t === 'out_for_delivery') return 5;
  if (t === 'shipped') return 4;
  if (t === 'processing') return 3;
  if (t === 'confirmed') return 2;
  return 1;
}

export default function OrdersPage() {
  const { userBookings } = useApp();
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'orders' | 'services'
  const [orderStatusFilter, setOrderStatusFilter] = useState('All'); // 'All' | 'Pending' | 'Completed' | 'Cancelled'
  const [bookingsList, setBookingsList] = useState([]);
  const [ordersList, setOrdersList] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  // Live Order Tracking Modal State
  const [trackingOrder, setTrackingOrder] = useState(null);

  // Review Modal State
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [reviewTarget, setReviewTarget] = useState(null);
  const [ratingVal, setRatingVal] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState(false);

  const loadAllData = async () => {
    setLoadingOrders(true);
    try {
      const [bkgs, ords] = await Promise.all([
        webApi.getBookings(),
        webApi.getOrders()
      ]);
      setBookingsList(Array.isArray(bkgs) ? bkgs : []);
      setOrdersList(Array.isArray(ords) ? ords : []);
      if (trackingOrder) {
        const refreshed = (Array.isArray(ords) ? ords : []).find(
          (o) =>
            (o._id || o.id) === (trackingOrder._id || trackingOrder.id) ||
            o.orderNumber === trackingOrder.orderNumber
        );
        if (refreshed) setTrackingOrder(refreshed);
      }
    } finally {
      setLoadingOrders(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, [userBookings]);

  const getOrderBucket = (ord) => {
    const s = String(ord.status || '').toLowerCase();
    const t = String(ord.trackingStatus || '').toLowerCase();
    if (['cancelled', 'canceled', 'returned', 'rejected'].includes(s) || ['cancelled', 'canceled', 'returned', 'rejected'].includes(t)) {
      return 'Cancelled';
    }
    if (['completed', 'delivered'].includes(s) || ['completed', 'delivered'].includes(t)) {
      return 'Completed';
    }
    return 'Pending';
  };

  const filteredOrders = useMemo(() => {
    if (orderStatusFilter === 'All') return ordersList;
    return ordersList.filter((o) => getOrderBucket(o) === orderStatusFilter);
  }, [ordersList, orderStatusFilter]);

  const handleOrderAction = async (ord, targetStatus, noteText) => {
    const id = ord._id || ord.id || ord.orderNumber;
    await webApi.updateOrderStatus(id, targetStatus, noteText);
    await loadAllData();
  };

  const handleOpenReview = (item) => {
    setReviewTarget(item);
    setRatingVal(5);
    setReviewText('');
    setReviewSuccess(false);
    setReviewModalOpen(true);
  };

  const handleSubmitReview = (e) => {
    e.preventDefault();
    setReviewSuccess(true);
    setTimeout(() => {
      setReviewModalOpen(false);
      setReviewSuccess(false);
    }, 1500);
  };

  return (
    <div className="orders-dashboard-page">
      <Navbar />
      <AuthModal />

      <main className="container orders-container">
        <div className="orders-header">
          <div>
            <h1 className="orders-title">My Orders &amp; Live Tracking</h1>
            <p className="orders-subtitle">
              Track your physical marketplace orders in real time, manage service bookings, and download GST invoices.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <button
              type="button"
              className="btn-secondary"
              style={{ padding: '8px 14px', fontSize: '13px' }}
              onClick={loadAllData}
              disabled={loadingOrders}
            >
              {loadingOrders ? 'Syncing...' : '↻ Sync Live Status'}
            </button>

            <div className="orders-tab-group">
              <button
                type="button"
                className={`orders-tab-btn ${activeTab === 'all' ? 'active' : ''}`}
                onClick={() => setActiveTab('all')}
              >
                All ({ordersList.length + bookingsList.length})
              </button>
              <button
                type="button"
                className={`orders-tab-btn ${activeTab === 'orders' ? 'active' : ''}`}
                onClick={() => setActiveTab('orders')}
              >
                Marketplace Orders ({ordersList.length})
              </button>
              <button
                type="button"
                className={`orders-tab-btn ${activeTab === 'services' ? 'active' : ''}`}
                onClick={() => setActiveTab('services')}
              >
                Services ({bookingsList.length})
              </button>
            </div>
          </div>
        </div>

        {/* Marketplace Orders Section */}
        {(activeTab === 'all' || activeTab === 'orders') && (
          <div className="orders-section-block">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
              <h2 className="section-block-title" style={{ margin: 0 }}>
                Marketplace Orders &amp; Live Shipment Tracking
              </h2>
              <div style={{ display: 'flex', gap: '6px' }}>
                {['All', 'Pending', 'Completed', 'Cancelled'].map((flt) => (
                  <button
                    key={flt}
                    type="button"
                    onClick={() => setOrderStatusFilter(flt)}
                    style={{
                      padding: '6px 12px',
                      borderRadius: '999px',
                      border: orderStatusFilter === flt ? '1px solid #002F34' : '1px solid #CBD5E1',
                      background: orderStatusFilter === flt ? '#002F34' : '#FFFFFF',
                      color: orderStatusFilter === flt ? '#FFFFFF' : '#475569',
                      fontSize: '12px',
                      fontWeight: '700',
                      cursor: 'pointer'
                    }}
                  >
                    {flt}
                  </button>
                ))}
              </div>
            </div>

            {filteredOrders.length === 0 ? (
              <div className="empty-orders-card">
                <p>No {orderStatusFilter !== 'All' ? orderStatusFilter.toLowerCase() : ''} marketplace orders found.</p>
                <Link to="/marketplace" className="btn-primary" style={{ display: 'inline-block', marginTop: '10px' }}>
                  Browse Marketplace
                </Link>
              </div>
            ) : (
              <div className="orders-cards-list">
                {filteredOrders.map((ord, idx) => {
                  const bucket = getOrderBucket(ord);
                  const stepNum = getOrderStep(ord.trackingStatus, ord.status);
                  const firstItem = (ord.items && ord.items[0]) || {};
                  const title = ord.productTitle || firstItem.title || ord.itemTitle || ord.title || 'Marketplace Product';
                  const total = Number(ord.totalAmount ?? ord.total ?? ord.price ?? 0);
                  const tax = Number(ord.taxAmount ?? 0);
                  const orderNum = ord.orderNumber || ord.id || `ORD-${idx + 1}`;
                  const trackLabel = String(ord.trackingStatus || ord.status || 'placed')
                    .replace(/_/g, ' ')
                    .toUpperCase();

                  return (
                    <div key={ord._id || ord.id || idx} className="order-item-card">
                      <div className="order-card-header">
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                            <span className="order-id-label">Order #{orderNum}</span>
                            <span
                              className={`badge ${
                                bucket === 'Completed'
                                  ? 'badge-green'
                                  : bucket === 'Cancelled'
                                  ? 'badge-red'
                                  : 'badge-blue'
                              }`}
                            >
                              {trackLabel}
                            </span>
                          </div>
                          <h3 className="order-item-name">{title}</h3>
                        </div>

                        <div className="order-amount-box">
                          <span className="order-amount">₹{total.toLocaleString('en-IN')}</span>
                          <small className="order-payment-status">
                            {ord.paymentMethod || ord.paymentMode || 'UPI'} {tax > 0 ? `(incl. ₹${tax} GST)` : ''}
                          </small>
                        </div>
                      </div>

                      {/* Dynamic 6-Stage Progress Bar */}
                      {bucket !== 'Cancelled' && (
                        <div
                          onClick={() => setTrackingOrder(ord)}
                          style={{
                            background: '#F8FAFC',
                            border: '1px solid #E2E8F0',
                            borderRadius: '10px',
                            padding: '12px 14px',
                            marginBottom: '14px',
                            cursor: 'pointer'
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', fontSize: '12px', fontWeight: '700' }}>
                            <span style={{ color: '#002F34' }}>
                              Live Shipment Progress: Step {Math.min(stepNum, 6)} of 6 ({trackLabel})
                            </span>
                            <span style={{ color: '#1548A6' }}>
                              {ord.courierName || ord.trackingNumber
                                ? `🚚 ${[ord.courierName, ord.trackingNumber].filter(Boolean).join(' • ')}`
                                : `Est. Delivery: ${ord.estimatedDelivery || '3-4 business days'}`}
                            </span>
                          </div>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '6px' }}>
                            {WEB_TRACKING_STAGES.map((st) => (
                              <div key={st.key} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                <div
                                  style={{
                                    height: '6px',
                                    borderRadius: '999px',
                                    background: stepNum >= st.step ? '#1548A6' : '#E2E8F0'
                                  }}
                                />
                                <span
                                  style={{
                                    fontSize: '10px',
                                    fontWeight: stepNum >= st.step ? '700' : '500',
                                    color: stepNum >= st.step ? '#002F34' : '#94A3B8'
                                  }}
                                >
                                  {st.title}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="order-card-body">
                        <div className="order-meta-grid">
                          <div>
                            <small>Seller</small>
                            <strong>{ord.sellerName || ord.seller?.name || 'Verified Seller'}</strong>
                          </div>
                          <div>
                            <small>Delivery Address</small>
                            <strong>
                              {ord.shippingAddress?.city || 'Indore'}{' '}
                              {ord.shippingAddress?.pincode ? `- ${ord.shippingAddress.pincode}` : ''}
                            </strong>
                          </div>
                          <div>
                            <small>Status</small>
                            <strong style={{ color: bucket === 'Cancelled' ? '#DC2626' : '#059669' }}>
                              {bucket === 'Completed'
                                ? 'Delivered & Verified'
                                : bucket === 'Cancelled'
                                ? ord.cancellationReason || 'Cancelled & Refunded'
                                : 'Active Tracking'}
                            </strong>
                          </div>
                        </div>
                      </div>

                      <div className="order-card-footer">
                        <button
                          type="button"
                          className="btn-primary"
                          style={{ padding: '7px 14px', fontSize: '12px' }}
                          onClick={() => setTrackingOrder(ord)}
                        >
                          📍 Live Order Tracking &rarr;
                        </button>

                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                          {bucket === 'Pending' && (
                            <>
                              <button
                                type="button"
                                className="btn-secondary"
                                style={{ padding: '6px 12px', fontSize: '12px', color: '#059669', borderColor: '#A7F3D0' }}
                                onClick={() => handleOrderAction(ord, 'completed', 'Confirmed received by buyer on Web')}
                              >
                                ✓ Mark Received
                              </button>
                              <button
                                type="button"
                                className="btn-secondary"
                                style={{ padding: '6px 12px', fontSize: '12px', color: '#DC2626', borderColor: '#FECACA' }}
                                onClick={() => handleOrderAction(ord, 'cancelled', 'Cancelled by buyer on Web')}
                              >
                                ✕ Cancel Order
                              </button>
                            </>
                          )}
                          <Link to="/chat" className="btn-secondary" style={{ padding: '6px 14px', fontSize: '12px' }}>
                            💬 Chat with Seller
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Services Section */}
        {(activeTab === 'all' || activeTab === 'services') && (
          <div className="orders-section-block">
            <h2 className="section-block-title">Home &amp; Repair Services</h2>
            {bookingsList.length === 0 ? (
              <div className="empty-orders-card">
                <p>No service bookings yet.</p>
                <Link to="/services" className="btn-primary" style={{ display: 'inline-block', marginTop: '10px' }}>
                  Book a Service
                </Link>
              </div>
            ) : (
              <div className="orders-cards-list">
                {bookingsList.map((bkg) => (
                  <div key={bkg.id} className="order-item-card">
                    <div className="order-card-header">
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span className="order-id-label">ID: {bkg.id}</span>
                          <span className={`badge ${bkg.status === 'completed' ? 'badge-green' : 'badge-blue'}`}>
                            {bkg.status === 'completed' ? 'Completed' : 'Assigned & Scheduled'}
                          </span>
                        </div>
                        <h3 className="order-item-name">{bkg.serviceTitle}</h3>
                      </div>

                      <div className="order-amount-box">
                        <span className="order-amount">₹{Number(bkg.total || bkg.amount || 0).toLocaleString('en-IN')}</span>
                        <small className="order-payment-status">{bkg.paymentMethod || 'UPI'}</small>
                      </div>
                    </div>

                    <div className="order-card-body">
                      <div className="order-meta-grid">
                        <div>
                          <small>Date &amp; Window</small>
                          <strong>{bkg.date} ({bkg.timeSlot})</strong>
                        </div>
                        <div>
                          <small>Service Address</small>
                          <strong>{bkg.address || 'Indore'}</strong>
                        </div>
                        {bkg.provider && (
                          <div>
                            <small>Assigned Pro</small>
                            <strong>{bkg.provider.name} (★ {bkg.provider.rating})</strong>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="order-card-footer">
                      <Link to={`/booking-confirmation/${bkg.id}`} className="btn-secondary" style={{ padding: '6px 14px', fontSize: '12px' }}>
                        Track Timeline &rarr;
                      </Link>

                      <div style={{ display: 'flex', gap: '8px' }}>
                        {bkg.status === 'completed' && (
                          <button
                            type="button"
                            className="btn-primary"
                            style={{ padding: '6px 14px', fontSize: '12px' }}
                            onClick={() => handleOpenReview(bkg)}
                          >
                            ★ Write Review
                          </button>
                        )}
                        <Link to="/chat" className="btn-secondary" style={{ padding: '6px 14px', fontSize: '12px' }}>
                          💬 Support / Chat
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Live Order Tracking Modal */}
      {trackingOrder && (
        <div className="review-modal-overlay" onClick={() => setTrackingOrder(null)}>
          <div
            className="review-modal-content"
            style={{ maxWidth: '580px' }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="review-close-btn"
              onClick={() => setTrackingOrder(null)}
            >
              &times;
            </button>
            <h3 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '4px' }}>
              Live Shipment Tracking: {trackingOrder.orderNumber || trackingOrder.id}
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '14px' }}>
              {trackingOrder.productTitle || trackingOrder.items?.[0]?.title || 'Marketplace Order'} • ₹
              {Number(trackingOrder.totalAmount || trackingOrder.total || 0).toLocaleString('en-IN')}
            </p>

            {/* Courier & Estimated Delivery Info */}
            <div
              style={{
                background: '#EFF6FF',
                border: '1px solid #BFDBFE',
                borderRadius: '10px',
                padding: '12px 14px',
                marginBottom: '16px',
                fontSize: '13px'
              }}
            >
              <div style={{ fontWeight: '700', color: '#002F34' }}>
                {trackingOrder.courierName
                  ? `Courier Partner: ${trackingOrder.courierName}`
                  : 'Fulfillment Pipeline Active'}
              </div>
              <div style={{ color: '#1E40AF', marginTop: '3px', fontSize: '12px' }}>
                {trackingOrder.trackingNumber
                  ? `AWB / Tracking ID: ${trackingOrder.trackingNumber}`
                  : `Estimated Delivery: ${trackingOrder.estimatedDelivery || '3-4 business days'}`}
              </div>
            </div>

            {/* 6-Stage Timeline */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '18px' }}>
              {WEB_TRACKING_STAGES.map((stage) => {
                const currentStep = getOrderStep(trackingOrder.trackingStatus, trackingOrder.status);
                const done = currentStep >= stage.step;
                const isCurrent = currentStep === stage.step;
                const matchedLog = (trackingOrder.statusHistory || [])
                  .slice()
                  .reverse()
                  .find((h) => String(h.status || '').toLowerCase() === stage.key);

                return (
                  <div
                    key={stage.key}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '12px',
                      padding: '8px 10px',
                      borderRadius: '8px',
                      background: isCurrent ? '#EFF6FF' : done ? '#F0FDF4' : '#F8FAFC',
                      border: isCurrent ? '1px solid #93C5FD' : '1px solid #E2E8F0'
                    }}
                  >
                    <div
                      style={{
                        width: '22px',
                        height: '22px',
                        borderRadius: '50%',
                        background: done ? '#002F34' : '#CBD5E1',
                        color: '#FFFFFF',
                        fontSize: '11px',
                        fontWeight: '700',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        marginTop: '2px'
                      }}
                    >
                      {done ? '✓' : stage.step}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '13px', fontWeight: '700', color: done ? '#002F34' : '#64748B' }}>
                        {stage.title}
                        {isCurrent && (
                          <span
                            style={{
                              marginLeft: '8px',
                              fontSize: '10px',
                              padding: '2px 6px',
                              borderRadius: '4px',
                              background: '#1548A6',
                              color: '#FFFFFF'
                            }}
                          >
                            CURRENT
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: '11.5px', color: '#475569', marginTop: '2px' }}>
                        {matchedLog?.note || (done ? 'Completed & verified' : 'Pending stage')}
                      </div>
                      {matchedLog?.changedAt && (
                        <div style={{ fontSize: '10.5px', color: '#64748B', marginTop: '2px' }}>
                          {new Date(matchedLog.changedAt).toLocaleString('en-IN')}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px' }}>
              <button
                type="button"
                className="btn-secondary"
                style={{ flex: 1, padding: '10px' }}
                onClick={loadAllData}
              >
                ↻ Sync Latest Status
              </button>
              <button
                type="button"
                className="btn-primary"
                style={{ flex: 1, padding: '10px' }}
                onClick={() => setTrackingOrder(null)}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Review Modal */}
      {reviewModalOpen && (
        <div className="review-modal-overlay" onClick={() => setReviewModalOpen(false)}>
          <div className="review-modal-content" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="review-close-btn"
              onClick={() => setReviewModalOpen(false)}
            >
              &times;
            </button>
            <h3 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '6px' }}>
              Rate &amp; Review Service
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
              How was your experience with <strong>{reviewTarget?.serviceTitle}</strong>?
            </p>

            {reviewSuccess ? (
              <div style={{ background: '#ECFDF5', color: '#065F46', padding: '16px', borderRadius: '10px', textAlign: 'center', fontWeight: '700' }}>
                ✓ Thank you for submitting your verified review!
              </div>
            ) : (
              <form onSubmit={handleSubmitReview}>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '6px' }}>
                    Your Rating
                  </label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        style={{
                          fontSize: '24px',
                          color: star <= ratingVal ? '#F59E0B' : '#CBD5E1',
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer'
                        }}
                        onClick={() => setRatingVal(star)}
                      >
                        ★
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '6px' }}>
                    Written Feedback
                  </label>
                  <textarea
                    rows="3"
                    placeholder="Describe punctuality, quality of work, cleanliness, and overall satisfaction..."
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    style={{ width: '100%', padding: '10px', border: '1px solid #CBD5E1', borderRadius: '8px', fontSize: '13px' }}
                    required
                  />
                </div>

                <button type="submit" className="btn-primary" style={{ width: '100%', padding: '10px' }}>
                  Submit Verified Review
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      <Footer />

      <style>{`
        .orders-dashboard-page {
          background: #F6F5F2;
          min-height: 100vh;
        }
        .orders-container {
          max-width: 900px;
          padding: 36px 16px 80px;
        }
        .orders-header {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          border-bottom: 1px solid #E2E8F0;
          padding-bottom: 20px;
          margin-bottom: 28px;
          flex-wrap: wrap;
          gap: 16px;
        }
        .orders-title {
          font-size: 26px;
          font-weight: 800;
        }
        .orders-subtitle {
          font-size: 14px;
          color: var(--text-secondary);
          margin-top: 4px;
        }
        .orders-tab-group {
          display: flex;
          background: #EEEDE9;
          padding: 4px;
          border-radius: 10px;
        }
        .orders-tab-btn {
          padding: 8px 14px;
          font-size: 13px;
          font-weight: 600;
          color: var(--text-secondary);
          border-radius: 8px;
          cursor: pointer;
        }
        .orders-tab-btn.active {
          background: #FBFBFA;
          color: var(--brand-blue);
          box-shadow: 0 2px 4px rgba(0,0,0,0.06);
        }
        .orders-section-block {
          margin-bottom: 32px;
        }
        .section-block-title {
          font-size: 18px;
          font-weight: 800;
          margin-bottom: 16px;
        }
        .orders-cards-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .order-item-card {
          background: #FBFBFA;
          border: 1px solid #E7E5E4;
          border-radius: 12px;
          padding: 20px;
          box-shadow: 0 2px 8px rgba(15, 23, 42, 0.04);
        }
        .order-card-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          margin-bottom: 14px;
        }
        .order-id-label {
          font-size: 12px;
          font-weight: 700;
          color: var(--text-muted);
        }
        .order-item-name {
          font-size: 16px;
          font-weight: 700;
          color: var(--text-primary);
          margin-top: 4px;
        }
        .order-amount-box {
          text-align: right;
        }
        .order-amount {
          font-size: 18px;
          font-weight: 800;
          color: var(--text-primary);
          display: block;
        }
        .order-payment-status {
          font-size: 11px;
          color: var(--text-muted);
        }
        .order-meta-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
          background: #EEEDE9;
          padding: 12px 14px;
          border-radius: 10px;
          margin-bottom: 16px;
        }
        .order-meta-grid small {
          display: block;
          font-size: 10px;
          text-transform: uppercase;
          color: var(--text-muted);
          font-weight: 700;
        }
        .order-meta-grid strong {
          display: block;
          font-size: 12px;
          color: var(--text-primary);
          margin-top: 2px;
        }
        .order-card-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 10px;
        }
        .empty-orders-card {
          background: #FBFBFA;
          border: 1px dashed #CBD5E1;
          border-radius: 12px;
          padding: 40px;
          text-align: center;
          color: var(--text-secondary);
        }
        .review-modal-overlay {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(15, 23, 42, 0.6);
          backdrop-filter: blur(6px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
          padding: 16px;
        }
        .review-modal-content {
          background: #FBFBFA;
          border-radius: 12px;
          max-width: 440px;
          width: 100%;
          padding: 24px;
          position: relative;
          max-height: 90vh;
          overflow-y: auto;
        }
        .review-close-btn {
          position: absolute;
          top: 16px; right: 18px;
          font-size: 24px;
          color: var(--text-muted);
          cursor: pointer;
          background: none;
          border: none;
        }
        @media (max-width: 700px) {
          .order-meta-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
