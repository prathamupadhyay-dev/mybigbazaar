/**
 * @file apps/web/src/pages/BookingConfirmationPage.jsx
 * @description Master Booking Confirmation & Live Status Tracker receipt page.
 */

import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';
import { webApi } from '../services/apiClient.js';
import { MOCK_BOOKINGS } from '../data/mockData.js';

export default function BookingConfirmationPage() {
  const { id } = useParams();
  const [booking, setBooking] = useState(null);

  useEffect(() => {
    webApi.getBookings().then((list) => {
      const found = list.find((b) => b.id === id);
      setBooking(found || list[0] || MOCK_BOOKINGS[0]);
    });
  }, [id]);

  if (!booking) {
    return (
      <div>
        <Navbar />
        <div className="container" style={{ padding: '80px 16px', textAlign: 'center' }}>
          <p>Loading booking confirmation...</p>
        </div>
        <Footer />
      </div>
    );
  }

  const timelineSteps = booking.timeline || [
    { step: 'Booked', time: 'Just now', done: true },
    { step: 'Confirmed', time: 'Just now', done: true },
    { step: 'Assigned', time: 'Assigned', done: true },
    { step: 'On the Way', time: 'Scheduled', done: false },
    { step: 'In Progress', time: 'Scheduled', done: false },
    { step: 'Completed', time: 'Pending', done: false }
  ];

  return (
    <div className="booking-confirm-page">
      <Navbar />

      <main className="container confirm-container">
        {/* Success Header */}
        <div className="confirm-banner">
          <div className="success-badge-circle">✓</div>
          <span className="badge badge-green" style={{ marginTop: '12px' }}>Booking Confirmed</span>
          <h1 className="confirm-title">Service Scheduled Successfully!</h1>
          <p className="confirm-subtitle">
            Booking ID: <strong style={{ color: 'var(--brand-blue)' }}>{booking.id}</strong>
          </p>
        </div>

        {/* Live Stepper Tracker */}
        <div className="confirm-card">
          <h3 className="section-card-title">Live Service Status</h3>
          <div className="status-stepper">
            {timelineSteps.map((step, idx) => (
              <div key={idx} className={`stepper-node ${step.done ? 'completed' : ''}`}>
                <div className="stepper-dot">
                  {step.done ? '✓' : idx + 1}
                </div>
                <strong className="stepper-label">{step.step}</strong>
                <small className="stepper-time">{step.time}</small>
              </div>
            ))}
          </div>
        </div>

        <div className="confirm-grid-2">
          {/* Assigned Technician Card */}
          <div className="confirm-card">
            <h3 className="section-card-title">Assigned Service Professional</h3>
            <div className="provider-highlight">
              <img
                src={booking.provider?.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'}
                alt={booking.provider?.name || 'Technician'}
                className="provider-avatar-lg"
              />
              <div className="provider-meta">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <h4 style={{ fontSize: '16px', fontWeight: '800', margin: 0 }}>
                    {booking.provider?.name || 'Rajesh Kumar Tech'}
                  </h4>
                  <span className="badge badge-green" style={{ fontSize: '10px' }}>Verified</span>
                </div>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '4px 0 8px' }}>
                  ★ {booking.provider?.rating || '4.92'} • Master Technician
                </p>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <a
                    href={`tel:${booking.provider?.phone || '+919811187654'}`}
                    className="btn-primary"
                    style={{ padding: '6px 14px', fontSize: '12px' }}
                  >
                    📞 Call Technician
                  </a>
                  <Link
                    to="/chat"
                    className="btn-secondary"
                    style={{ padding: '6px 14px', fontSize: '12px' }}
                  >
                    💬 Message
                  </Link>
                </div>
              </div>
            </div>

            <div style={{ background: '#F8FAFC', padding: '12px', borderRadius: '10px', marginTop: '16px' }}>
              <span style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: '700' }}>
                Service Location
              </span>
              <p style={{ fontSize: '13px', color: 'var(--text-primary)', margin: '4px 0 0' }}>
                📍 {booking.address}
              </p>
            </div>
          </div>

          {/* Booking Bill Details */}
          <div className="confirm-card">
            <h3 className="section-card-title">Scheduled Details &amp; Bill</h3>
            <div className="booking-bill-rows">
              <div className="bill-item">
                <span>Service:</span>
                <strong>{booking.serviceTitle}</strong>
              </div>
              <div className="bill-item">
                <span>Scheduled For:</span>
                <strong>{booking.date} ({booking.timeSlot})</strong>
              </div>
              <div className="bill-item">
                <span>Payment Mode:</span>
                <span className="badge badge-blue">{booking.paymentMethod}</span>
              </div>
              <div className="bill-item">
                <span>Total Amount:</span>
                <strong style={{ fontSize: '18px', color: 'var(--brand-green)' }}>
                  ₹{Number(booking.total || booking.amount).toLocaleString('en-IN')}
                </strong>
              </div>
            </div>

            <div className="action-buttons-wrap">
              <Link to="/orders" className="btn-primary" style={{ width: '100%', textAlign: 'center', padding: '12px' }}>
                View All My Bookings
              </Link>
              <Link to="/" className="btn-secondary" style={{ width: '100%', textAlign: 'center', padding: '10px' }}>
                Return to Home
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />

      <style>{`
        .booking-confirm-page {
          background: #F6F5F2;
          min-height: 100vh;
        }
        .confirm-container {
          max-width: 820px;
          padding: 40px 16px 80px;
        }
        .confirm-banner {
          text-align: center;
          margin-bottom: 28px;
        }
        .success-badge-circle {
          width: 64px;
          height: 64px;
          border-radius: 50%;
          background: #059669;
          color: #FBFBFA;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 32px;
          font-weight: 800;
          margin: 0 auto;
          box-shadow: 0 8px 24px rgba(5, 150, 105, 0.3);
        }
        .confirm-title {
          font-size: 26px;
          font-weight: 800;
          margin-top: 12px;
        }
        .confirm-subtitle {
          font-size: 15px;
          color: var(--text-secondary);
          margin-top: 4px;
        }
        .confirm-card {
          background: #FBFBFA;
          border: 1px solid #E7E5E4;
          border-radius: 18px;
          padding: 24px;
          margin-bottom: 24px;
          box-shadow: 0 4px 16px rgba(15, 23, 42, 0.04);
        }
        .section-card-title {
          font-size: 16px;
          font-weight: 800;
          margin-bottom: 18px;
        }
        .status-stepper {
          display: flex;
          align-items: center;
          justify-content: space-between;
          position: relative;
          padding: 10px 0;
        }
        .stepper-node {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
          text-align: center;
        }
        .stepper-dot {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: #E2E8F0;
          color: var(--text-secondary);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          font-weight: 700;
        }
        .stepper-node.completed .stepper-dot {
          background: var(--brand-green);
          color: #FBFBFA;
        }
        .stepper-label {
          font-size: 12px;
          color: var(--text-primary);
        }
        .stepper-time {
          font-size: 10px;
          color: var(--text-muted);
        }
        .confirm-grid-2 {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 24px;
        }
        .provider-highlight {
          display: flex;
          align-items: center;
          gap: 16px;
        }
        .provider-avatar-lg {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          object-fit: cover;
        }
        .booking-bill-rows {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-bottom: 24px;
        }
        .bill-item {
          display: flex;
          justify-content: space-between;
          font-size: 13px;
          padding-bottom: 8px;
          border-bottom: 1px solid #E7E5E4;
        }
        .bill-item span {
          color: var(--text-secondary);
        }
        .action-buttons-wrap {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        @media (max-width: 700px) {
          .confirm-grid-2 {
            grid-template-columns: 1fr;
          }
          .status-stepper {
            overflow-x: auto;
            justify-content: flex-start;
            gap: 20px;
          }
        }
      `}</style>
    </div>
  );
}
