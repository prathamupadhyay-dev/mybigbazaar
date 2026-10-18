/**
 * @file apps/web/src/pages/CartCheckoutPage.jsx
 * @description Comprehensive Cart & Booking Checkout flow with items review, address selection,
 * date/time slot scheduling, promo coupons (FIRST20, BIGBAZAAR), escrow/payment method options,
 * and instant booking confirmation creation.
 */

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';
import AuthModal from '../components/AuthModal.jsx';
import { useApp } from '../context/AppContext.jsx';

export default function CartCheckoutPage() {
  const navigate = useNavigate();
  const {
    cart,
    removeFromCart,
    updateCartQty,
    clearCart,
    cartSubtotal,
    platformFee,
    cartTotal,
    couponCode,
    couponDiscount,
    couponMessage,
    applyCoupon,
    currentUser,
    isAuthenticated,
    openAuth,
    createBooking
  } = useApp();

  const [inputCoupon, setInputCoupon] = useState(couponCode || '');
  const [selectedAddressId, setSelectedAddressId] = useState('addr-01');
  const [newStreet, setNewStreet] = useState('');
  const [newCity, setNewCity] = useState(currentUser?.city || 'Indore');
  const [newPincode, setNewPincode] = useState(currentUser?.pincode || '452001');
  const [addingAddress, setAddingAddress] = useState(false);
  const [paymentMode, setPaymentMode] = useState('upi');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [checkoutError, setCheckoutError] = useState('');

  const addresses = currentUser?.savedAddresses || [
    {
      id: 'addr-01',
      tag: 'Home',
      fullName: currentUser?.fullName || currentUser?.name || 'Verified Customer',
      phone: currentUser?.phone || '',
      street: currentUser?.address || 'Palasia Main Road',
      city: currentUser?.city || 'Indore',
      pincode: currentUser?.pincode || '452001'
    }
  ];

  const handleApplyCouponCode = (e) => {
    e.preventDefault();
    applyCoupon(inputCoupon);
  };

  const handleCheckoutSubmit = async (e) => {
    e.preventDefault();
    setCheckoutError('');

    if (cart.length === 0) {
      setCheckoutError('Your cart is empty.');
      return;
    }

    if (!isAuthenticated) {
      openAuth('login');
      return;
    }

    setIsSubmitting(true);

    try {
      const activeAddr = addresses.find((a) => a.id === selectedAddressId) || addresses[0];
      const addressString = activeAddr
        ? `${activeAddr.street}, ${activeAddr.city} - ${activeAddr.pincode}`
        : 'Indore, Madhya Pradesh - 452001';

      const bookingPayload = {
        serviceTitle: cart.map((i) => i.title).join(' + '),
        category: cart[0]?.category || 'General Service',
        items: cart,
        amount: cartSubtotal,
        discount: couponDiscount,
        platformFee,
        total: cartTotal,
        paymentMethod: paymentMode === 'cod' ? 'Cash After Service' : (paymentMode === 'upi' ? 'UPI (Instant)' : 'Card Payment'),
        address: addressString,
        date: cart[0]?.date || 'Tomorrow',
        timeSlot: cart[0]?.timeSlot || '10:00 AM - 12:00 PM'
      };

      const booking = await createBooking(bookingPayload);
      setIsSubmitting(false);
      navigate(`/booking-confirmation/${booking.id}`);
    } catch (err) {
      setIsSubmitting(false);
      setCheckoutError(err.message || 'Failed to complete booking. Please try again.');
    }
  };

  if (cart.length === 0) {
    return (
      <div className="checkout-page">
        <Navbar />
        <AuthModal />
        <div className="container" style={{ padding: '80px 16px', textAlign: 'center', minHeight: '60vh' }}>
          <div style={{ fontSize: '56px', marginBottom: '16px' }}>🛍️</div>
          <h2 style={{ fontSize: '24px', fontWeight: '800' }}>Your Service Cart is Empty</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '15px', maxWidth: '440px', margin: '8px auto 24px' }}>
            Explore our trusted home maintenance and repair services or explore the marketplace for deals.
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <Link to="/services" className="btn-primary">
              Explore Services
            </Link>
            <Link to="/marketplace" className="btn-secondary">
              Browse Marketplace
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="checkout-page">
      <Navbar />
      <AuthModal />

      <main className="container checkout-layout">
        {/* Left Column: Cart items, Address, Payment */}
        <section className="checkout-form-column">
          <h1 className="checkout-heading">Review Order &amp; Schedule Service</h1>

          {checkoutError && <div className="checkout-error-banner">{checkoutError}</div>}

          {/* 1. Items in Cart */}
          <div className="checkout-section-card">
            <div className="sec-header">
              <span className="step-num-badge">1</span>
              <h3>Selected Services &amp; Items ({cart.length})</h3>
            </div>

            <div className="cart-items-list">
              {cart.map((item) => (
                <div key={item.id} className="cart-item-row">
                  <img src={item.image} alt={item.title} className="cart-item-img" />
                  <div className="cart-item-info">
                    <h4 className="cart-item-title">{item.title}</h4>
                    <span className="cart-item-cat">{item.category}</span>
                    <div className="cart-item-meta">
                      {item.duration && <span>⏱ {item.duration}</span>}
                      {item.date && <span>📅 {item.date}</span>}
                    </div>
                  </div>

                  <div className="cart-qty-ctrl">
                    <button
                      type="button"
                      className="qty-btn"
                      onClick={() => updateCartQty(item.id, (item.quantity || 1) - 1)}
                    >
                      -
                    </button>
                    <span className="qty-val">{item.quantity || 1}</span>
                    <button
                      type="button"
                      className="qty-btn"
                      onClick={() => updateCartQty(item.id, (item.quantity || 1) + 1)}
                    >
                      +
                    </button>
                  </div>

                  <div className="cart-item-price-block tabular-nums">
                    <span className="cart-price tabular-nums">
                      ₹{((item.price || 0) * (item.quantity || 1)).toLocaleString('en-IN')}
                    </span>
                    <button
                      type="button"
                      className="cart-remove-btn"
                      onClick={() => removeFromCart(item.id)}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 2. Service Address */}
          <div className="checkout-section-card">
            <div className="sec-header">
              <span className="step-num-badge">2</span>
              <h3>Service &amp; Delivery Address</h3>
            </div>

            <div className="address-options-list">
              {addresses.map((addr) => (
                <label
                  key={addr.id}
                  className={`address-option-card ${selectedAddressId === addr.id ? 'selected' : ''}`}
                >
                  <input
                    type="radio"
                    name="address"
                    value={addr.id}
                    checked={selectedAddressId === addr.id}
                    onChange={() => setSelectedAddressId(addr.id)}
                  />
                  <div className="address-text">
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <strong>{addr.fullName}</strong>
                      <span className="badge badge-blue" style={{ fontSize: '10px' }}>{addr.tag}</span>
                    </div>
                    <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '4px 0 2px' }}>
                      {addr.street}, {addr.city} - {addr.pincode}
                    </p>
                    <small style={{ color: 'var(--text-muted)' }}>Phone: {addr.phone}</small>
                  </div>
                </label>
              ))}
            </div>

            {/* Quick Add Address Form */}
            {addingAddress ? (
              <div className="new-address-form">
                <h4 style={{ fontSize: '14px', fontWeight: '700', marginBottom: '10px' }}>
                  Add Service Address
                </h4>
                <div className="form-group">
                  <input
                    type="text"
                    placeholder="House/Flat number, Building, Street..."
                    value={newStreet}
                    onChange={(e) => setNewStreet(e.target.value)}
                    className="checkout-input"
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  <input
                    type="text"
                    placeholder="City"
                    value={newCity}
                    onChange={(e) => setNewCity(e.target.value)}
                    className="checkout-input"
                  />
                  <input
                    type="text"
                    placeholder="Pincode"
                    value={newPincode}
                    onChange={(e) => setNewPincode(e.target.value)}
                    className="checkout-input"
                  />
                </div>
                <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                  <button
                    type="button"
                    className="btn-primary"
                    style={{ padding: '6px 12px', fontSize: '12px' }}
                    onClick={() => {
                      if (newStreet.trim()) {
                        addresses.push({
                          id: `addr-${Date.now()}`,
                          tag: 'Other',
                          fullName: currentUser?.name || 'Customer',
                          phone: currentUser?.phone || '+91 99999 88888',
                          street: newStreet,
                          city: newCity,
                          pincode: newPincode
                        });
                        setSelectedAddressId(addresses[addresses.length - 1].id);
                        setAddingAddress(false);
                      }
                    }}
                  >
                    Save Address
                  </button>
                  <button
                    type="button"
                    className="btn-secondary"
                    style={{ padding: '6px 12px', fontSize: '12px' }}
                    onClick={() => setAddingAddress(false)}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                className="add-address-trigger"
                onClick={() => setAddingAddress(true)}
              >
                + Add New Address
              </button>
            )}
          </div>

          {/* 3. Payment Method */}
          <div className="checkout-section-card">
            <div className="sec-header">
              <span className="step-num-badge">3</span>
              <h3>Choose Payment Mode</h3>
            </div>

            <div className="payment-options-grid">
              <label className={`payment-pill ${paymentMode === 'upi' ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name="payment"
                  value="upi"
                  checked={paymentMode === 'upi'}
                  onChange={() => setPaymentMode('upi')}
                />
                <div className="payment-icon">📱</div>
                <div>
                  <strong>UPI / Google Pay / PhonePe</strong>
                  <small>Instant zero-fee safe transfer</small>
                </div>
              </label>

              <label className={`payment-pill ${paymentMode === 'card' ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name="payment"
                  value="card"
                  checked={paymentMode === 'card'}
                  onChange={() => setPaymentMode('card')}
                />
                <div className="payment-icon">💳</div>
                <div>
                  <strong>Credit / Debit Card</strong>
                  <small>Visa, Mastercard, RuPay</small>
                </div>
              </label>

              <label className={`payment-pill ${paymentMode === 'cod' ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name="payment"
                  value="cod"
                  checked={paymentMode === 'cod'}
                  onChange={() => setPaymentMode('cod')}
                />
                <div className="payment-icon">💵</div>
                <div>
                  <strong>Pay After Service (Cash / UPI)</strong>
                  <small>Pay verified technician upon completion</small>
                </div>
              </label>
            </div>
          </div>
        </section>

        {/* Right Column: Order Summary & Confirm Action */}
        <aside className="checkout-summary-column">
          <div className="summary-card">
            <h3 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '16px' }}>
              Order Bill Summary
            </h3>

            {/* Promo Code Box */}
            <form onSubmit={handleApplyCouponCode} className="coupon-form">
              <input
                type="text"
                placeholder="Promo Code (e.g. FIRST20)"
                value={inputCoupon}
                onChange={(e) => setInputCoupon(e.target.value)}
                className="coupon-input"
              />
              <button type="submit" className="coupon-btn">
                Apply
              </button>
            </form>
            {couponMessage && (
              <div className={`coupon-msg ${couponDiscount > 0 ? 'success' : 'error'}`}>
                {couponMessage}
              </div>
            )}

            <div className="bill-rows">
              <div className="bill-row">
                <span>Subtotal ({cart.length} item{cart.length > 1 ? 's' : ''})</span>
                <span>₹{cartSubtotal.toLocaleString('en-IN')}</span>
              </div>

              {couponDiscount > 0 && (
                <div className="bill-row discount-row">
                  <span>Coupon Discount ({couponCode})</span>
                  <span>- ₹{couponDiscount.toLocaleString('en-IN')}</span>
                </div>
              )}

              <div className="bill-row">
                <span>Safe Escrow / Platform Fee</span>
                <span>₹{platformFee}</span>
              </div>

              <div className="bill-row">
                <span>Taxes &amp; GST</span>
                <span style={{ color: 'var(--brand-green)' }}>Included</span>
              </div>

              <div className="bill-divider" />

              <div className="bill-row total-row">
                <span>Total Payable</span>
                <span>₹{cartTotal.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <button
              type="button"
              className="btn-primary confirm-booking-btn"
              onClick={handleCheckoutSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Confirming Booking...' : `Confirm & Pay ₹${cartTotal.toLocaleString('en-IN')}`}
            </button>

            <div className="escrow-assurance">
              <span>🛡️</span>
              <p>
                <strong>BigBazaar Safe-Deal Escrow</strong>
                Your payment is held safely until the technician finishes the job to your complete satisfaction.
              </p>
            </div>
          </div>
        </aside>
      </main>

      <Footer />

      <style>{`
        .checkout-page {
          background: #F6F5F2;
          min-height: 100vh;
        }
        .checkout-layout {
          display: grid;
          grid-template-columns: 1fr 380px;
          gap: 32px;
          padding: 32px 16px 80px;
        }
        .checkout-heading {
          font-size: 24px;
          font-weight: 800;
          margin-bottom: 24px;
        }
        .checkout-error-banner {
          background: #FEE2E2;
          border: 1px solid #F87171;
          color: #991B1B;
          padding: 12px 16px;
          border-radius: 10px;
          font-size: 13px;
          margin-bottom: 20px;
        }
        .checkout-section-card {
          background: #FBFBFA;
          border: 1px solid #E7E5E4;
          border-radius: 18px;
          padding: 24px;
          margin-bottom: 24px;
        }
        .sec-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 20px;
        }
        .step-num-badge {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: var(--brand-blue);
          color: #FBFBFA;
          font-size: 13px;
          font-weight: 800;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .cart-items-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .cart-item-row {
          display: flex;
          align-items: center;
          gap: 14px;
          padding-bottom: 14px;
          border-bottom: 1px solid #E7E5E4;
        }
        .cart-item-img {
          width: 64px;
          height: 64px;
          border-radius: 10px;
          object-fit: cover;
        }
        .cart-item-info {
          flex: 1;
        }
        .cart-item-title {
          font-size: 14px;
          font-weight: 700;
          color: var(--text-primary);
          margin-bottom: 2px;
        }
        .cart-item-cat {
          font-size: 11px;
          color: var(--text-muted);
          text-transform: uppercase;
        }
        .cart-item-meta {
          display: flex;
          gap: 10px;
          font-size: 12px;
          color: var(--text-secondary);
          margin-top: 4px;
        }
        .cart-qty-ctrl {
          display: flex;
          align-items: center;
          gap: 8px;
          background: #EEEDE9;
          padding: 4px 8px;
          border-radius: 8px;
        }
        .qty-btn {
          width: 24px;
          height: 24px;
          border-radius: 4px;
          background: #FBFBFA;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
          border: 1px solid #E7E5E4;
        }
        .qty-val {
          font-size: 13px;
          font-weight: 700;
          min-width: 14px;
          text-align: center;
        }
        .cart-item-price-block {
          text-align: right;
          min-width: 90px;
        }
        .cart-price {
          font-size: 16px;
          font-weight: 800;
          color: var(--text-primary);
          display: block;
        }
        .cart-remove-btn {
          font-size: 11px;
          color: #DC2626;
          cursor: pointer;
          margin-top: 4px;
        }
        .address-options-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
          margin-bottom: 14px;
        }
        .address-option-card {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          padding: 14px;
          border: 1px solid #E7E5E4;
          border-radius: 12px;
          cursor: pointer;
          transition: border-color 0.15s;
        }
        .address-option-card.selected {
          border-color: var(--brand-blue);
          background: var(--brand-blue-light);
        }
        .add-address-trigger {
          font-size: 13px;
          font-weight: 700;
          color: var(--brand-blue);
          cursor: pointer;
          padding: 8px 0;
        }
        .new-address-form {
          background: #EEEDE9;
          border: 1px solid #E7E5E4;
          border-radius: 12px;
          padding: 16px;
          margin-top: 10px;
        }
        .checkout-input {
          width: 100%;
          padding: 10px 12px;
          border: 1px solid #E7E5E4;
          border-radius: 8px;
          font-size: 13px;
        }
        .payment-options-grid {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .payment-pill {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 14px 16px;
          border: 1px solid #E7E5E4;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.15s;
        }
        .payment-pill.selected {
          border-color: var(--brand-blue);
          background: var(--brand-blue-light);
        }
        .payment-icon {
          font-size: 22px;
        }
        .payment-pill strong {
          display: block;
          font-size: 14px;
        }
        .payment-pill small {
          color: var(--text-secondary);
          font-size: 11px;
        }
        .summary-card {
          background: #FBFBFA;
          border: 1px solid #E7E5E4;
          border-radius: 12px;
          padding: 24px;
          box-shadow: 0 4px 16px rgba(15, 23, 42, 0.05);
          position: sticky;
          top: 80px;
        }
        .coupon-form {
          display: flex;
          gap: 8px;
          margin-bottom: 8px;
        }
        .coupon-input {
          flex: 1;
          padding: 8px 12px;
          border: 1px solid #E7E5E4;
          border-radius: 8px;
          font-size: 13px;
          text-transform: uppercase;
        }
        .coupon-btn {
          padding: 8px 16px;
          background: #0F172A;
          color: #FBFBFA;
          border-radius: 8px;
          font-weight: 700;
          font-size: 13px;
          cursor: pointer;
        }
        .coupon-msg {
          font-size: 12px;
          margin-bottom: 14px;
          padding: 6px 10px;
          border-radius: 6px;
        }
        .coupon-msg.success {
          background: #ECFDF5;
          color: #065F46;
        }
        .coupon-msg.error {
          background: #FEF2F2;
          color: #991B1B;
        }
        .bill-rows {
          display: flex;
          flex-direction: column;
          gap: 10px;
          margin-bottom: 20px;
        }
        .bill-row {
          display: flex;
          justify-content: space-between;
          font-size: 14px;
          color: var(--text-secondary);
        }
        .discount-row {
          color: var(--brand-green);
          font-weight: 600;
        }
        .bill-divider {
          height: 1px;
          background: #E2E8F0;
          margin: 6px 0;
        }
        .total-row {
          font-size: 18px;
          font-weight: 800;
          color: var(--text-primary);
        }
        .confirm-booking-btn {
          width: 100%;
          padding: 14px;
          font-size: 15px;
          font-weight: 800;
          border-radius: 12px;
          box-shadow: 0 4px 14px rgba(21, 72, 166, 0.25);
        }
        .escrow-assurance {
          display: flex;
          gap: 10px;
          margin-top: 18px;
          background: #EEEDE9;
          padding: 12px;
          border-radius: 10px;
          font-size: 11px;
          color: var(--text-secondary);
          line-height: 1.4;
        }
        .escrow-assurance strong {
          display: block;
          color: var(--text-primary);
          margin-bottom: 2px;
        }
        @media (max-width: 900px) {
          .checkout-layout {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
