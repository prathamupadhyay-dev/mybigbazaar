/**
 * @file apps/admin/src/pages/Orders.jsx
 * @description Purpose-built Admin Modules for Pending Orders, Completed Orders, and Cancelled Orders.
 * - No redundant global KPI summary cards or duplicate status switcher tabs.
 * - Each sidebar route (/dashboard/orders/pending, /dashboard/orders/completed, /dashboard/orders/cancelled)
 *   renders a dedicated, lifecycle-specific workspace synced in real time with /api/v1/orders and the client apps.
 * - Includes an interactive 6-stage Live Order Tracking & Fulfillment Manager (Placed -> Confirmed -> Processing -> Shipped -> Out for Delivery -> Delivered).
 */

import React, { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import {
  Package,
  Clock,
  CheckCircle2,
  XCircle,
  Search,
  Eye,
  Truck,
  RotateCcw,
  Printer,
  ShieldCheck,
  CreditCard,
  MapPin,
  User,
  ShoppingBag,
  ArrowRight,
  Navigation
} from 'lucide-react';
import PageHeader from '../components/ui/PageHeader';
import StatusBadge from '../components/ui/StatusBadge';
import ExportButton from '../components/common/ExportButton';
import { apiFetch, cleanLegacyMocks } from '../utils/api';

const TRACKING_STAGES = [
  { key: 'placed', label: 'Order Placed', shortLabel: 'Placed', step: 1 },
  { key: 'confirmed', label: 'Order Confirmed', shortLabel: 'Confirmed', step: 2 },
  { key: 'processing', label: 'Packed & Processing', shortLabel: 'Packed', step: 3 },
  { key: 'shipped', label: 'Shipped / In-Transit', shortLabel: 'Shipped', step: 4 },
  { key: 'out_for_delivery', label: 'Out for Delivery', shortLabel: 'Out for Delivery', step: 5 },
  { key: 'delivered', label: 'Delivered & Completed', shortLabel: 'Delivered', step: 6 }
];

const NEXT_STAGE_MAP = {
  pending: { next: 'confirmed', btnLabel: 'Confirm Order', color: '#1548A6' },
  placed: { next: 'confirmed', btnLabel: 'Confirm Order', color: '#1548A6' },
  confirmed: { next: 'processing', btnLabel: 'Mark Packed', color: '#7C3AED' },
  processing: { next: 'shipped', btnLabel: 'Dispatch / Ship', color: '#0284C7' },
  shipped: { next: 'out_for_delivery', btnLabel: 'Out for Delivery', color: '#EA580C' },
  out_for_delivery: { next: 'delivered', btnLabel: 'Mark Delivered', color: '#15803D' }
};

function getStageStepIndex(trackingStatus, status) {
  const s = String(trackingStatus || status || 'placed').toLowerCase();
  if (['cancelled', 'canceled', 'returned', 'rejected'].includes(s)) return 0;
  if (['delivered', 'completed'].includes(s)) return 6;
  if (s === 'out_for_delivery') return 5;
  if (s === 'shipped') return 4;
  if (s === 'processing') return 3;
  if (s === 'confirmed') return 2;
  return 1;
}

export default function Orders() {
  const { tab } = useParams();

  // Active Module determined directly from the sidebar route
  const activeTab = useMemo(() => {
    if (!tab) return 'pending';
    const lower = tab.toLowerCase();
    if (lower === 'completed' || lower === 'completedorders') return 'completed';
    if (lower === 'cancelled' || lower === 'cancelledorders' || lower === 'canceled') return 'cancelled';
    return 'pending';
  }, [tab]);

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [stageFilter, setStageFilter] = useState('All');
  const [paymentModeFilter, setPaymentModeFilter] = useState('All');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('All');
  const [timeFilter, setTimeFilter] = useState('All Time');

  // Interactive Tracking & Details Modal State
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [newCourierName, setNewCourierName] = useState('');
  const [newTrackingNumber, setNewTrackingNumber] = useState('');
  const [newEstimatedDelivery, setNewEstimatedDelivery] = useState('');
  const [statusNote, setStatusNote] = useState('');
  const [toastMessage, setToastMessage] = useState(null);

  // Reset stage sub-filter when switching modules
  useEffect(() => {
    setStageFilter('All');
  }, [activeTab]);

  // Fetch live orders from backend API
  const loadOrders = async () => {
    setLoading(true);
    try {
      const res = await apiFetch('/api/v1/orders?all=true');
      if (res && res.ok) {
        const json = await res.json().catch(() => ({}));
        const list = Array.isArray(json.data)
          ? json.data
          : Array.isArray(json.orders)
          ? json.orders
          : [];
        const cleaned = cleanLegacyMocks(list);
        setOrders(cleaned);
        try {
          localStorage.setItem('mbb_admin_orders', JSON.stringify(cleaned));
        } catch (_e) {}
      }
    } catch (err) {
      console.warn('Failed to fetch live orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, [activeTab]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Categorize orders dynamically by lifecycle state
  const pendingOrdersList = useMemo(() => {
    return orders.filter((o) => {
      const st = String(o.status || '').toLowerCase();
      const tr = String(o.trackingStatus || 'placed').toLowerCase();
      if (['cancelled', 'canceled', 'returned', 'rejected'].includes(st) || ['cancelled', 'canceled', 'returned', 'rejected'].includes(tr)) {
        return false;
      }
      if (['completed', 'delivered'].includes(st) || ['completed', 'delivered'].includes(tr)) {
        return false;
      }
      return true;
    });
  }, [orders]);

  const completedOrdersList = useMemo(() => {
    return orders.filter((o) => {
      const st = String(o.status || '').toLowerCase();
      const tr = String(o.trackingStatus || '').toLowerCase();
      return ['delivered', 'completed'].includes(st) || ['delivered', 'completed'].includes(tr);
    });
  }, [orders]);

  const cancelledOrdersList = useMemo(() => {
    return orders.filter((o) => {
      const st = String(o.status || '').toLowerCase();
      const tr = String(o.trackingStatus || '').toLowerCase();
      return ['cancelled', 'canceled', 'returned', 'rejected'].includes(st) || ['cancelled', 'canceled', 'returned', 'rejected'].includes(tr);
    });
  }, [orders]);

  // Active module dataset
  const currentTabOrders = useMemo(() => {
    if (activeTab === 'completed') return completedOrdersList;
    if (activeTab === 'cancelled') return cancelledOrdersList;
    return pendingOrdersList;
  }, [activeTab, pendingOrdersList, completedOrdersList, cancelledOrdersList]);

  // Apply search, stage, payment, and time filters
  const filteredOrders = useMemo(() => {
    return currentTabOrders.filter((order) => {
      // Pending Stage Filter
      if (activeTab === 'pending' && stageFilter !== 'All') {
        const tr = String(order.trackingStatus || order.status || 'placed').toLowerCase();
        const normalizedStage = tr === 'pending' ? 'placed' : tr;
        if (normalizedStage !== stageFilter) return false;
      }

      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const num = String(order.orderNumber || order.id || '').toLowerCase();
        const buyerName = String(order.buyerName || order.buyerId?.fullName || order.buyerId?.name || order.customerName || '').toLowerCase();
        const sellerName = String(order.sellerName || order.sellerId?.fullName || order.sellerId?.name || '').toLowerCase();
        const buyerEmail = String(order.buyerEmail || order.buyerId?.email || order.customerEmail || '').toLowerCase();
        const buyerPhone = String(order.buyerPhone || order.buyerId?.phoneNumber || order.shippingAddress?.phone || '').toLowerCase();
        const city = String(order.shippingAddress?.city || '').toLowerCase();
        const prodTitle = String(order.productTitle || '').toLowerCase();
        const trackingNum = String(order.trackingNumber || '').toLowerCase();
        const courier = String(order.courierName || '').toLowerCase();
        const itemTitles = (order.items || []).map((i) => (i.title || '').toLowerCase()).join(' ');

        if (
          !num.includes(q) &&
          !buyerName.includes(q) &&
          !sellerName.includes(q) &&
          !buyerEmail.includes(q) &&
          !buyerPhone.includes(q) &&
          !city.includes(q) &&
          !prodTitle.includes(q) &&
          !trackingNum.includes(q) &&
          !courier.includes(q) &&
          !itemTitles.includes(q)
        ) {
          return false;
        }
      }

      // Payment Mode
      if (paymentModeFilter !== 'All') {
        const mode = String(order.paymentMethod || order.paymentMode || '').toLowerCase();
        if (!mode.includes(paymentModeFilter.toLowerCase())) {
          return false;
        }
      }

      // Payment Status
      if (paymentStatusFilter !== 'All') {
        const pStatus = String(order.paymentStatus || '').toLowerCase();
        if (paymentStatusFilter === 'Paid' && !['success', 'paid', 'completed', 'released'].includes(pStatus)) return false;
        if (paymentStatusFilter === 'Pending' && pStatus !== 'pending') return false;
        if (paymentStatusFilter === 'Escrow Held' && pStatus !== 'escrow_held') return false;
        if (paymentStatusFilter === 'Refunded' && pStatus !== 'refunded') return false;
      }

      // Time Range
      if (timeFilter !== 'All Time') {
        const createdDate = new Date(order.createdAt || Date.now());
        const now = new Date();
        if (timeFilter === 'Today') {
          if (createdDate.toDateString() !== now.toDateString()) return false;
        } else if (timeFilter === 'Last 7 Days') {
          const diffDays = (now - createdDate) / (1000 * 3600 * 24);
          if (diffDays > 7) return false;
        } else if (timeFilter === 'Last 30 Days') {
          const diffDays = (now - createdDate) / (1000 * 3600 * 24);
          if (diffDays > 30) return false;
        }
      }

      return true;
    });
  }, [currentTabOrders, activeTab, stageFilter, searchQuery, paymentModeFilter, paymentStatusFilter, timeFilter]);

  // Open detail & tracking modal
  const handleOpenDetail = (order) => {
    setSelectedOrder(order);
    const currentTrack = String(order.trackingStatus || order.status || 'placed').toLowerCase();
    setNewStatus(currentTrack === 'pending' ? 'placed' : currentTrack);
    setNewCourierName(order.courierName || '');
    setNewTrackingNumber(order.trackingNumber || '');
    setNewEstimatedDelivery(
      order.estimatedDelivery ||
        new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN', {
          day: '2-digit',
          month: 'short',
          year: 'numeric'
        })
    );
    setStatusNote('');
  };

  // Persist tracking & status update to backend API
  const handleSaveStatus = async (e) => {
    e?.preventDefault();
    if (!selectedOrder) return;

    setIsUpdatingStatus(true);
    const targetId = selectedOrder._id || selectedOrder.id || selectedOrder.orderNumber;

    try {
      const isCancelled = ['cancelled', 'canceled', 'returned'].includes(newStatus.toLowerCase());
      const isCompleted = ['completed', 'delivered'].includes(newStatus.toLowerCase());
      const resolvedLifecycleStatus = isCancelled ? 'cancelled' : isCompleted ? 'completed' : 'pending';
      const resolvedTrackingStatus = isCompleted ? 'delivered' : newStatus;

      const payload = {
        status: resolvedLifecycleStatus,
        trackingStatus: resolvedTrackingStatus,
        courierName: newCourierName.trim(),
        trackingNumber: newTrackingNumber.trim() || null,
        estimatedDelivery: newEstimatedDelivery.trim(),
        cancellationReason: isCancelled ? statusNote.trim() || 'Cancelled by Admin' : undefined,
        note:
          statusNote.trim() ||
          `Tracking updated to ${resolvedTrackingStatus.replace(/_/g, ' ').toUpperCase()}${
            newCourierName.trim() ? ` via ${newCourierName.trim()}` : ''
          }`
      };

      const res = await apiFetch(`/api/v1/orders/${targetId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      let updatedFromServer = null;
      if (res && res.ok) {
        const json = await res.json().catch(() => ({}));
        updatedFromServer = json.data || json.order || null;
      }

      const nextPayStatus = isCancelled ? 'refunded' : isCompleted ? 'completed' : selectedOrder.paymentStatus;

      setOrders((prev) =>
        prev.map((o) => {
          if (o._id === targetId || o.id === targetId || o.orderNumber === targetId) {
            if (updatedFromServer) return updatedFromServer;
            const history = Array.isArray(o.statusHistory) ? [...o.statusHistory] : [];
            history.push({
              status: resolvedTrackingStatus,
              note: payload.note,
              courierName: payload.courierName,
              trackingNumber: payload.trackingNumber || '',
              changedAt: new Date().toISOString()
            });
            return {
              ...o,
              status: resolvedLifecycleStatus,
              trackingStatus: resolvedTrackingStatus,
              paymentStatus: nextPayStatus,
              courierName: payload.courierName,
              trackingNumber: payload.trackingNumber,
              estimatedDelivery: payload.estimatedDelivery,
              cancellationReason: payload.cancellationReason || o.cancellationReason,
              statusHistory: history,
              updatedAt: new Date().toISOString()
            };
          }
          return o;
        })
      );

      showToast(`Order ${selectedOrder.orderNumber || targetId} synced as "${resolvedTrackingStatus.replace(/_/g, ' ').toUpperCase()}"`);
      setSelectedOrder((prev) =>
        prev
          ? updatedFromServer || {
              ...prev,
              status: resolvedLifecycleStatus,
              trackingStatus: resolvedTrackingStatus,
              paymentStatus: nextPayStatus,
              courierName: payload.courierName,
              trackingNumber: payload.trackingNumber,
              estimatedDelivery: payload.estimatedDelivery
            }
          : null
      );
      setStatusNote('');
    } catch (_err) {
      showToast('Failed to update order tracking status.');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // 1-Click Quick Stage / Status Progression (persists to PUT /api/v1/orders/:id)
  const handleQuickStatus = async (order, targetStatus, customNote = '') => {
    const targetId = order._id || order.id || order.orderNumber;
    const isCancelled = ['cancelled', 'canceled', 'returned'].includes(targetStatus.toLowerCase());
    const isCompleted = ['completed', 'delivered'].includes(targetStatus.toLowerCase());
    const resolvedLifecycleStatus = isCancelled ? 'cancelled' : isCompleted ? 'completed' : 'pending';
    const resolvedTrackingStatus = isCompleted ? 'delivered' : targetStatus;
    const nextPayStatus = isCancelled ? 'refunded' : isCompleted ? 'completed' : order.paymentStatus;
    const noteText =
      customNote ||
      `Order progressed to ${resolvedTrackingStatus.replace(/_/g, ' ').toUpperCase()} by Admin`;

    setOrders((prev) =>
      prev.map((o) => {
        if (o._id === targetId || o.id === targetId || o.orderNumber === targetId) {
          const history = Array.isArray(o.statusHistory) ? [...o.statusHistory] : [];
          history.push({
            status: resolvedTrackingStatus,
            note: noteText,
            courierName: o.courierName || '',
            trackingNumber: o.trackingNumber || '',
            changedAt: new Date().toISOString()
          });
          return {
            ...o,
            status: resolvedLifecycleStatus,
            trackingStatus: resolvedTrackingStatus,
            paymentStatus: nextPayStatus,
            cancellationReason: isCancelled ? noteText : o.cancellationReason,
            statusHistory: history,
            updatedAt: new Date().toISOString()
          };
        }
        return o;
      })
    );

    try {
      await apiFetch(`/api/v1/orders/${targetId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: resolvedLifecycleStatus,
          trackingStatus: resolvedTrackingStatus,
          cancellationReason: isCancelled ? noteText : undefined,
          note: noteText
        })
      });
    } catch (_e) {}

    showToast(`Order ${order.orderNumber || targetId} updated to ${resolvedTrackingStatus.replace(/_/g, ' ').toUpperCase()}`);
  };

  const handlePrintReceipt = () => {
    window.print();
  };

  // Module-specific Header Configuration
  const moduleMeta = useMemo(() => {
    if (activeTab === 'completed') {
      return {
        title: 'Completed Orders',
        breadcrumb: 'Completed Orders',
        badgeColor: '#15803D',
        badgeBg: 'rgba(21, 128, 61, 0.1)'
      };
    }
    if (activeTab === 'cancelled') {
      return {
        title: 'Cancelled Orders',
        breadcrumb: 'Cancelled Orders',
        badgeColor: '#BE123C',
        badgeBg: 'rgba(190, 18, 60, 0.1)'
      };
    }
    return {
      title: 'Pending Orders',
      breadcrumb: 'Pending Orders',
      badgeColor: '#C2410C',
      badgeBg: 'rgba(194, 65, 12, 0.1)'
    };
  }, [activeTab]);

  return (
    <div className="admin-page" style={{ padding: '24px', maxWidth: '1440px', margin: '0 auto' }}>
      {/* Toast Alert */}
      {toastMessage && (
        <div
          style={{
            position: 'fixed',
            top: '24px',
            right: '24px',
            background: 'var(--color-navy, #0B2545)',
            color: '#FFFFFF',
            padding: '12px 20px',
            borderRadius: '8px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.18)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontWeight: '600',
            fontSize: '0.88rem'
          }}
        >
          <CheckCircle2 size={18} color="#10B981" />
          {toastMessage}
        </div>
      )}

      {/* Module Header */}
      <PageHeader
        title={moduleMeta.title}
        breadcrumbs={['Dashboard', 'Orders', moduleMeta.breadcrumb]}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              borderRadius: '999px',
              background: moduleMeta.badgeBg,
              color: moduleMeta.badgeColor,
              fontSize: '12.5px',
              fontWeight: 700
            }}
          >
            <span>{filteredOrders.length}</span>
            <span>{moduleMeta.title}</span>
          </div>

          <button
            onClick={loadOrders}
            disabled={loading}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 14px',
              borderRadius: '6px',
              border: '1px solid var(--color-border, #E7E5E4)',
              background: 'var(--color-panel, #FBFBFA)',
              color: 'var(--text-primary, #1C1917)',
              fontSize: '13px',
              fontWeight: 500,
              cursor: 'pointer'
            }}
          >
            <RotateCcw size={14} className={loading ? 'animate-spin' : ''} />
            Sync Live
          </button>

          <ExportButton
            data={filteredOrders.map((o) => ({
              orderNumber: o.orderNumber || o.id,
              date: new Date(o.createdAt || Date.now()).toLocaleDateString(),
              customer: o.buyerName || o.buyerId?.fullName || o.buyerId?.name || 'Customer',
              phone: o.buyerPhone || o.buyerId?.phoneNumber || o.shippingAddress?.phone || '—',
              email: o.buyerEmail || o.buyerId?.email || '—',
              city: o.shippingAddress?.city || '—',
              itemsCount: (o.items || []).length || 1,
              subtotal: o.subtotal || o.totalAmount,
              taxAmount: o.taxAmount || 0,
              totalAmount: o.totalAmount,
              paymentMode: o.paymentMethod || o.paymentMode || 'UPI',
              paymentStatus: o.paymentStatus || 'paid',
              trackingStatus: o.trackingStatus || o.status || 'placed',
              courierName: o.courierName || '—',
              trackingNumber: o.trackingNumber || '—'
            }))}
            filename={`orders_${activeTab}_export.csv`}
            label={`Export ${moduleMeta.title} (CSV)`}
            variant="primary"
            columns={[
              { key: 'orderNumber', label: 'Order Number' },
              { key: 'date', label: 'Date' },
              { key: 'customer', label: 'Customer' },
              { key: 'phone', label: 'Phone' },
              { key: 'city', label: 'City' },
              { key: 'itemsCount', label: 'Items Count' },
              { key: 'totalAmount', label: 'Total Amount (INR)' },
              { key: 'paymentMode', label: 'Payment Mode' },
              { key: 'paymentStatus', label: 'Payment Status' },
              { key: 'trackingStatus', label: 'Tracking Stage' },
              { key: 'courierName', label: 'Courier' },
              { key: 'trackingNumber', label: 'Tracking #' }
            ]}
          />
        </div>
      </PageHeader>

      {/* Pending Orders Module: Live Tracking Stage Filter Bar */}
      {activeTab === 'pending' && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '14px',
            flexWrap: 'wrap'
          }}
        >
          <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary, #78716C)', marginRight: '4px' }}>
            Tracking Stage:
          </span>
          {[
            { id: 'All', label: 'All Pending Stages' },
            { id: 'placed', label: '1. Placed' },
            { id: 'confirmed', label: '2. Confirmed' },
            { id: 'processing', label: '3. Packed / Processing' },
            { id: 'shipped', label: '4. Shipped / In-Transit' },
            { id: 'out_for_delivery', label: '5. Out for Delivery' }
          ].map((st) => {
            const active = stageFilter === st.id;
            return (
              <button
                key={st.id}
                type="button"
                onClick={() => setStageFilter(st.id)}
                style={{
                  padding: '6px 12px',
                  borderRadius: '999px',
                  border: active ? '1px solid var(--color-navy, #0B2545)' : '1px solid var(--color-border, #E7E5E4)',
                  background: active ? 'var(--color-navy, #0B2545)' : 'var(--color-panel, #FBFBFA)',
                  color: active ? '#FFFFFF' : 'var(--text-primary, #1C1917)',
                  fontSize: '12px',
                  fontWeight: active ? 600 : 500,
                  cursor: 'pointer',
                  transition: 'all 120ms ease'
                }}
              >
                {st.label}
              </button>
            );
          })}
        </div>
      )}

      {/* Search & Filter Toolbar */}
      <div
        style={{
          background: 'var(--color-panel, #FBFBFA)',
          border: '1px solid var(--color-border, #E7E5E4)',
          borderRadius: '10px',
          padding: '14px 16px',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
          marginBottom: '16px'
        }}
      >
        {/* Search Input */}
        <div style={{ position: 'relative', flex: '1 1 280px', maxWidth: '440px' }}>
          <Search
            size={15}
            style={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--text-secondary, #78716C)'
            }}
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by Order #, buyer, seller, phone, city, product, or AWB #..."
            style={{
              width: '100%',
              padding: '8px 12px 8px 34px',
              borderRadius: '6px',
              border: '1px solid var(--color-border, #E7E5E4)',
              background: 'var(--color-canvas, #F6F5F2)',
              fontSize: '13px',
              color: 'var(--text-primary, #1C1917)',
              outline: 'none'
            }}
          />
        </div>

        {/* Filter Dropdowns */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '12px', color: 'var(--text-secondary, #78716C)', fontWeight: 500 }}>Payment:</span>
            <select
              value={paymentModeFilter}
              onChange={(e) => setPaymentModeFilter(e.target.value)}
              style={{
                padding: '6px 10px',
                borderRadius: '6px',
                border: '1px solid var(--color-border, #E7E5E4)',
                background: 'var(--color-canvas, #F6F5F2)',
                fontSize: '12.5px',
                color: 'var(--text-primary, #1C1917)',
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              <option value="All">All Modes</option>
              <option value="UPI">UPI</option>
              <option value="Card">Card</option>
              <option value="NetBanking">NetBanking</option>
              <option value="Cash on Delivery">Cash on Delivery</option>
              <option value="Wallet">Wallet</option>
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '12px', color: 'var(--text-secondary, #78716C)', fontWeight: 500 }}>Pay Status:</span>
            <select
              value={paymentStatusFilter}
              onChange={(e) => setPaymentStatusFilter(e.target.value)}
              style={{
                padding: '6px 10px',
                borderRadius: '6px',
                border: '1px solid var(--color-border, #E7E5E4)',
                background: 'var(--color-canvas, #F6F5F2)',
                fontSize: '12.5px',
                color: 'var(--text-primary, #1C1917)',
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              <option value="All">All Statuses</option>
              <option value="Paid">Paid / Completed</option>
              <option value="Pending">Pending</option>
              <option value="Escrow Held">Escrow Held</option>
              <option value="Refunded">Refunded</option>
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '12px', color: 'var(--text-secondary, #78716C)', fontWeight: 500 }}>Period:</span>
            <select
              value={timeFilter}
              onChange={(e) => setTimeFilter(e.target.value)}
              style={{
                padding: '6px 10px',
                borderRadius: '6px',
                border: '1px solid var(--color-border, #E7E5E4)',
                background: 'var(--color-canvas, #F6F5F2)',
                fontSize: '12.5px',
                color: 'var(--text-primary, #1C1917)',
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              <option value="All Time">All Time</option>
              <option value="Today">Today</option>
              <option value="Last 7 Days">Last 7 Days</option>
              <option value="Last 30 Days">Last 30 Days</option>
            </select>
          </div>

          {(searchQuery || stageFilter !== 'All' || paymentModeFilter !== 'All' || paymentStatusFilter !== 'All' || timeFilter !== 'All Time') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setStageFilter('All');
                setPaymentModeFilter('All');
                setPaymentStatusFilter('All');
                setTimeFilter('All Time');
              }}
              style={{
                padding: '6px 10px',
                borderRadius: '6px',
                border: 'none',
                background: 'rgba(120,113,108,0.12)',
                color: 'var(--text-secondary, #78716C)',
                fontSize: '12px',
                fontWeight: 500,
                cursor: 'pointer'
              }}
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Dedicated Module Data Table */}
      <div
        style={{
          background: 'var(--color-panel, #FBFBFA)',
          border: '1px solid var(--color-border, #E7E5E4)',
          borderRadius: '10px',
          overflow: 'hidden',
          boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
        }}
      >
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
            <thead>
              <tr
                style={{
                  background: 'var(--color-canvas, #F6F5F2)',
                  borderBottom: '1px solid var(--color-border, #E7E5E4)',
                  color: 'var(--text-secondary, #78716C)',
                  fontSize: '11.5px',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em'
                }}
              >
                <th style={{ padding: '12px 16px' }}>Order ID &amp; Date</th>
                <th style={{ padding: '12px 16px' }}>Buyer &amp; Seller</th>
                <th style={{ padding: '12px 16px' }}>Product / Items</th>
                <th style={{ padding: '12px 16px' }}>Total &amp; Tax</th>
                <th style={{ padding: '12px 16px' }}>
                  {activeTab === 'cancelled' ? 'Refund & Payment' : 'Payment'}
                </th>
                <th style={{ padding: '12px 16px' }}>
                  {activeTab === 'pending'
                    ? 'Live Order Tracking Progress'
                    : activeTab === 'completed'
                    ? 'Delivery & Courier Info'
                    : 'Cancellation Reason & Status'}
                </th>
                <th style={{ padding: '12px 16px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: '56px 16px', textAlign: 'center', color: 'var(--text-secondary, #78716C)' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                      <Package size={34} strokeWidth={1.5} color="var(--text-secondary, #78716C)" />
                      <span style={{ fontSize: '14.5px', fontWeight: 600, color: 'var(--text-primary, #1C1917)' }}>
                        No {moduleMeta.title.toLowerCase()} right now
                      </span>
                      <span style={{ fontSize: '12.5px', maxWidth: '420px' }}>
                        {activeTab === 'pending'
                          ? 'New marketplace orders placed by customers in the app will appear here automatically with live tracking controls.'
                          : activeTab === 'completed'
                          ? 'Orders marked delivered by admin or confirmed received by buyers appear here.'
                          : 'Orders cancelled by buyers or admin appear here with refund status.'}
                      </span>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order, idx) => {
                  const buyerName =
                    order.buyerName || order.buyerId?.fullName || order.buyerId?.name || order.customerName || 'Customer';
                  const buyerPhone =
                    order.buyerPhone || order.buyerId?.phoneNumber || order.shippingAddress?.phone || '—';
                  const sellerName =
                    order.sellerName || order.sellerId?.fullName || order.sellerId?.name || 'Verified Seller';
                  const buyerCity = order.shippingAddress?.city || 'Indore';
                  const firstItem = order.items && order.items[0] ? order.items[0] : null;
                  const itemImage = order.productImage || firstItem?.image || '';
                  const itemTitle = order.productTitle || firstItem?.title || 'Marketplace Product';
                  const additionalCount = order.items && order.items.length > 1 ? order.items.length - 1 : 0;
                  const dateStr = order.createdAt
                    ? new Date(order.createdAt).toLocaleDateString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric'
                      })
                    : 'Today';
                  const subtotalVal = Number(order.subtotal || order.totalAmount || 0);
                  const taxVal = Number(order.taxAmount || 0);
                  const rawTrack = String(order.trackingStatus || order.status || 'placed').toLowerCase();
                  const currentStep = getStageStepIndex(rawTrack, order.status);
                  const nextAction = NEXT_STAGE_MAP[rawTrack];
                  const latestHistory =
                    Array.isArray(order.statusHistory) && order.statusHistory.length > 0
                      ? order.statusHistory[order.statusHistory.length - 1]
                      : null;

                  return (
                    <tr
                      key={order._id || order.id || idx}
                      style={{
                        borderBottom: '1px solid var(--color-border, #E7E5E4)',
                        transition: 'background-color 100ms ease',
                        cursor: 'pointer'
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.015)')}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                      onClick={() => handleOpenDetail(order)}
                    >
                      {/* 1. Order ID & Date */}
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                          <span
                            style={{
                              fontFamily: 'monospace',
                              fontSize: '13px',
                              fontWeight: 700,
                              color: 'var(--color-navy, #0B2545)'
                            }}
                          >
                            {order.orderNumber || order.id}
                          </span>
                          <span style={{ fontSize: '11.5px', color: 'var(--text-secondary, #78716C)' }}>
                            {dateStr}
                          </span>
                        </div>
                      </td>

                      {/* 2. Buyer & Seller */}
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                          <span style={{ fontWeight: 600, color: 'var(--text-primary, #1C1917)' }}>{buyerName}</span>
                          <span style={{ fontSize: '11px', color: 'var(--text-secondary, #78716C)' }}>
                            {buyerCity} • {buyerPhone}
                          </span>
                          <span style={{ fontSize: '11px', color: 'var(--color-navy, #0B2545)', fontWeight: 500 }}>
                            Seller: {sellerName}
                          </span>
                        </div>
                      </td>

                      {/* 3. Product / Items */}
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          {itemImage ? (
                            <img
                              src={itemImage}
                              alt=""
                              style={{
                                width: '38px',
                                height: '38px',
                                borderRadius: '6px',
                                objectFit: 'cover',
                                border: '1px solid var(--color-border, #E7E5E4)'
                              }}
                            />
                          ) : (
                            <div
                              style={{
                                width: '38px',
                                height: '38px',
                                borderRadius: '6px',
                                background: 'rgba(0,0,0,0.04)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                              }}
                            >
                              <ShoppingBag size={15} color="var(--text-secondary, #78716C)" />
                            </div>
                          )}
                          <div style={{ display: 'flex', flexDirection: 'column', maxWidth: '190px' }}>
                            <span
                              style={{
                                fontSize: '12.5px',
                                fontWeight: 600,
                                color: 'var(--text-primary, #1C1917)',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap'
                              }}
                              title={itemTitle}
                            >
                              {itemTitle}
                            </span>
                            <span style={{ fontSize: '11px', color: 'var(--text-secondary, #78716C)' }}>
                              Qty: {firstItem?.quantity || 1}
                              {additionalCount > 0 ? ` (+${additionalCount} more)` : ''}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* 4. Total & Tax */}
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ fontWeight: 700, color: 'var(--text-primary, #1C1917)', fontSize: '13.5px' }}>
                          ₹{Number(order.totalAmount || 0).toLocaleString('en-IN')}
                        </div>
                        <div style={{ fontSize: '10.5px', color: 'var(--text-secondary, #78716C)' }}>
                          Sub: ₹{subtotalVal.toLocaleString('en-IN')} + Tax: ₹{taxVal.toLocaleString('en-IN')}
                        </div>
                      </td>

                      {/* 5. Payment / Refund Status */}
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary, #1C1917)' }}>
                            {order.paymentMethod || order.paymentMode || 'UPI'}
                          </span>
                          <StatusBadge
                            status={
                              activeTab === 'cancelled'
                                ? 'refunded'
                                : ['success', 'completed', 'paid', 'released'].includes(
                                    String(order.paymentStatus || '').toLowerCase()
                                  )
                                ? 'paid'
                                : order.paymentStatus || 'pending'
                            }
                            label={
                              activeTab === 'cancelled'
                                ? 'REFUNDED'
                                : (order.paymentStatus || 'PAID').toUpperCase()
                            }
                            dot
                          />
                        </div>
                      </td>

                      {/* 6. Module-Specific Tracking / Delivery / Cancellation Column */}
                      <td style={{ padding: '14px 16px', minWidth: '240px' }}>
                        {activeTab === 'pending' && (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                              <StatusBadge
                                status={rawTrack}
                                label={rawTrack.replace(/_/g, ' ').toUpperCase()}
                                dot
                              />
                              <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary, #78716C)' }}>
                                Step {Math.min(currentStep, 5)} of 5
                              </span>
                            </div>

                            {/* Visual 5-Step Progress Bar */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                              {[1, 2, 3, 4, 5].map((stepNum) => {
                                const filled = currentStep >= stepNum;
                                return (
                                  <div
                                    key={stepNum}
                                    style={{
                                      flex: 1,
                                      height: '5px',
                                      borderRadius: '999px',
                                      background: filled ? '#1548A6' : '#E2E8F0',
                                      transition: 'background 200ms ease'
                                    }}
                                  />
                                );
                              })}
                            </div>

                            {/* Courier & AWB or Expected Delivery */}
                            <div style={{ fontSize: '11px', color: 'var(--text-secondary, #78716C)', display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                              {order.courierName || order.trackingNumber ? (
                                <span style={{ fontFamily: 'monospace', color: 'var(--color-navy, #0B2545)', fontWeight: 600 }}>
                                  🚚 {[order.courierName, order.trackingNumber].filter(Boolean).join(' • ')}
                                </span>
                              ) : (
                                <span>
                                  Est. Delivery: <strong>{order.estimatedDelivery || '3-4 business days'}</strong>
                                </span>
                              )}
                            </div>
                          </div>
                        )}

                        {activeTab === 'completed' && (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <StatusBadge status="completed" label="DELIVERED & COMPLETED" dot />
                            {order.courierName || order.trackingNumber ? (
                              <span style={{ fontSize: '11px', fontFamily: 'monospace', color: 'var(--color-navy, #0B2545)', fontWeight: 600 }}>
                                {[order.courierName, order.trackingNumber].filter(Boolean).join(' • ')}
                              </span>
                            ) : null}
                            <span style={{ fontSize: '11px', color: 'var(--text-secondary, #78716C)' }}>
                              {latestHistory?.note || 'Handed over & verified'}
                            </span>
                          </div>
                        )}

                        {activeTab === 'cancelled' && (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <StatusBadge
                              status="cancelled"
                              label={rawTrack === 'returned' ? 'RETURNED' : 'CANCELLED'}
                              dot
                            />
                            <span style={{ fontSize: '11.5px', color: '#BE123C', fontWeight: 500 }}>
                              {order.cancellationReason || latestHistory?.note || 'Cancelled by user/admin'}
                            </span>
                          </div>
                        )}
                      </td>

                      {/* 7. Actions */}
                      <td style={{ padding: '14px 16px', textAlign: 'right' }} onClick={(e) => e.stopPropagation()}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '6px', flexWrap: 'wrap' }}>
                          {activeTab === 'pending' && nextAction && (
                            <button
                              onClick={() => handleQuickStatus(order, nextAction.next)}
                              title={`Advance tracking to ${nextAction.next.replace(/_/g, ' ')}`}
                              style={{
                                padding: '6px 10px',
                                borderRadius: '6px',
                                border: 'none',
                                background: nextAction.color,
                                color: '#FFFFFF',
                                fontSize: '11.5px',
                                fontWeight: 600,
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px'
                              }}
                            >
                              {nextAction.btnLabel}
                              <ArrowRight size={12} />
                            </button>
                          )}

                          <button
                            onClick={() => handleOpenDetail(order)}
                            title="Open Live Tracking & Order Manager"
                            style={{
                              padding: '6px 10px',
                              borderRadius: '6px',
                              border: '1px solid var(--color-border, #E7E5E4)',
                              background: 'var(--color-canvas, #F6F5F2)',
                              color: 'var(--text-primary, #1C1917)',
                              fontSize: '11.5px',
                              fontWeight: 600,
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}
                          >
                            {activeTab === 'pending' ? <Navigation size={12} /> : <Eye size={12} />}
                            {activeTab === 'pending' ? 'Track / Update' : 'Details'}
                          </button>

                          {activeTab === 'pending' && (
                            <button
                              onClick={() => handleQuickStatus(order, 'cancelled', 'Cancelled by Admin')}
                              title="Cancel Order & Initiate Refund"
                              style={{
                                padding: '6px 10px',
                                borderRadius: '6px',
                                border: '1px solid rgba(190,18,60,0.3)',
                                background: 'rgba(190,18,60,0.08)',
                                color: '#BE123C',
                                fontSize: '11.5px',
                                fontWeight: 600,
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px'
                              }}
                            >
                              <XCircle size={12} />
                              Cancel
                            </button>
                          )}

                          {activeTab !== 'pending' && (
                            <button
                              onClick={() => handleQuickStatus(order, 'placed', 'Reopened to Pending by Admin')}
                              title="Move back to Pending Orders"
                              style={{
                                padding: '6px 10px',
                                borderRadius: '6px',
                                border: '1px solid rgba(194,65,12,0.3)',
                                background: 'rgba(194,65,12,0.08)',
                                color: '#C2410C',
                                fontSize: '11.5px',
                                fontWeight: 600,
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px'
                              }}
                            >
                              <Clock size={12} />
                              Move to Pending
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer */}
        <div
          style={{
            padding: '12px 16px',
            borderTop: '1px solid var(--color-border, #E7E5E4)',
            background: 'var(--color-canvas, #F6F5F2)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '12px',
            color: 'var(--text-secondary, #78716C)'
          }}
        >
          <span>
            Showing <strong>{filteredOrders.length}</strong> of <strong>{currentTabOrders.length}</strong> {moduleMeta.title.toLowerCase()}
          </span>
          <span>
            Synced live with Mobile &amp; Web user order tracking
          </span>
        </div>
      </div>

      {/* Interactive Order Details & Live Tracking Manager Modal */}
      {selectedOrder && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.45)',
            backdropFilter: 'blur(3px)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}
          onClick={() => setSelectedOrder(null)}
        >
          <div
            style={{
              background: 'var(--color-panel, #FBFBFA)',
              border: '1px solid var(--color-border, #E7E5E4)',
              borderRadius: '12px',
              width: '100%',
              maxWidth: '860px',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 20px 40px rgba(0,0,0,0.22)',
              position: 'relative'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div
              style={{
                padding: '18px 24px',
                borderBottom: '1px solid var(--color-border, #E7E5E4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: 'var(--color-canvas, #F6F5F2)',
                position: 'sticky',
                top: 0,
                zIndex: 10
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: 'var(--text-primary, #1C1917)' }}>
                    Order &amp; Live Tracking: {selectedOrder.orderNumber || selectedOrder.id}
                  </h3>
                  <StatusBadge
                    status={selectedOrder.trackingStatus || selectedOrder.status || 'placed'}
                    label={(selectedOrder.trackingStatus || selectedOrder.status || 'placed').replace(/_/g, ' ').toUpperCase()}
                    dot
                  />
                </div>
                <span style={{ fontSize: '12px', color: 'var(--text-secondary, #78716C)' }}>
                  Placed on {selectedOrder.createdAt ? new Date(selectedOrder.createdAt).toLocaleString('en-IN') : 'Recent'}
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button
                  onClick={handlePrintReceipt}
                  title="Print Order Receipt"
                  style={{
                    padding: '6px 12px',
                    borderRadius: '6px',
                    border: '1px solid var(--color-border, #E7E5E4)',
                    background: 'var(--color-panel, #FBFBFA)',
                    color: 'var(--text-primary, #1C1917)',
                    fontSize: '12.5px',
                    fontWeight: 500,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <Printer size={14} />
                  Print Slip
                </button>
                <button
                  onClick={() => setSelectedOrder(null)}
                  style={{
                    width: '30px',
                    height: '30px',
                    borderRadius: '6px',
                    border: 'none',
                    background: 'rgba(0,0,0,0.06)',
                    cursor: 'pointer',
                    fontSize: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--text-primary, #1C1917)'
                  }}
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '22px' }}>
              {/* Interactive 6-Stage Visual Tracking Stepper */}
              <div
                style={{
                  padding: '18px',
                  borderRadius: '10px',
                  border: '1px solid var(--color-border, #E7E5E4)',
                  background: '#FFFFFF'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary, #1C1917)' }}>
                    Interactive Shipment Pipeline (Click any stage to select)
                  </span>
                  <span style={{ fontSize: '11.5px', color: 'var(--text-secondary, #78716C)' }}>
                    Synced with Customer Order Tracking UI
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(115px, 1fr))', gap: '8px' }}>
                  {TRACKING_STAGES.map((stage) => {
                    const currentStep = getStageStepIndex(newStatus, selectedOrder.status);
                    const isCompletedStep = currentStep >= stage.step;
                    const isCurrentStep = newStatus === stage.key || (stage.key === 'delivered' && newStatus === 'completed');
                    return (
                      <button
                        key={stage.key}
                        type="button"
                        onClick={() => setNewStatus(stage.key)}
                        style={{
                          padding: '10px 8px',
                          borderRadius: '8px',
                          border: isCurrentStep
                            ? '2px solid #1548A6'
                            : isCompletedStep
                            ? '1px solid rgba(21, 128, 61, 0.4)'
                            : '1px solid #E2E8F0',
                          background: isCurrentStep
                            ? '#EFF6FF'
                            : isCompletedStep
                            ? '#F0FDF4'
                            : '#F8FAFC',
                          cursor: 'pointer',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: '4px',
                          textAlign: 'center'
                        }}
                      >
                        <span
                          style={{
                            width: '22px',
                            height: '22px',
                            borderRadius: '50%',
                            background: isCurrentStep ? '#1548A6' : isCompletedStep ? '#15803D' : '#CBD5E1',
                            color: '#FFFFFF',
                            fontSize: '11px',
                            fontWeight: 700,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          {isCompletedStep ? '✓' : stage.step}
                        </span>
                        <span
                          style={{
                            fontSize: '11.5px',
                            fontWeight: isCurrentStep || isCompletedStep ? 700 : 500,
                            color: isCurrentStep ? '#1548A6' : isCompletedStep ? '#15803D' : '#64748B'
                          }}
                        >
                          {stage.shortLabel}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Status Update / Logistics Form */}
              <div
                style={{
                  border: '1.5px solid var(--color-navy, #0B2545)',
                  borderRadius: '8px',
                  padding: '18px',
                  background: 'var(--color-panel, #FBFBFA)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                  <Truck size={17} color="var(--color-navy, #0B2545)" />
                  <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: 'var(--text-primary, #1C1917)' }}>
                    Live Tracking &amp; Courier Dispatch Controls
                  </h4>
                </div>

                <form
                  onSubmit={handleSaveStatus}
                  style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: '14px' }}
                >
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary, #78716C)', marginBottom: '4px' }}>
                      Tracking Stage
                    </label>
                    <select
                      value={newStatus}
                      onChange={(e) => setNewStatus(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '8px 10px',
                        borderRadius: '6px',
                        border: '1px solid var(--color-border, #E7E5E4)',
                        background: 'var(--color-canvas, #F6F5F2)',
                        fontSize: '13px',
                        color: 'var(--text-primary, #1C1917)',
                        outline: 'none'
                      }}
                    >
                      <option value="placed">1. Order Placed</option>
                      <option value="confirmed">2. Order Confirmed</option>
                      <option value="processing">3. Packed &amp; Processing</option>
                      <option value="shipped">4. Shipped (In Transit)</option>
                      <option value="out_for_delivery">5. Out for Delivery</option>
                      <option value="delivered">6. Delivered &amp; Completed</option>
                      <option value="cancelled">Cancelled &amp; Refunded</option>
                      <option value="returned">Returned</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary, #78716C)', marginBottom: '4px' }}>
                      Courier Partner
                    </label>
                    <input
                      type="text"
                      value={newCourierName}
                      onChange={(e) => setNewCourierName(e.target.value)}
                      placeholder="e.g. Delhivery, BlueDart, Ekart"
                      style={{
                        width: '100%',
                        padding: '8px 10px',
                        borderRadius: '6px',
                        border: '1px solid var(--color-border, #E7E5E4)',
                        background: 'var(--color-canvas, #F6F5F2)',
                        fontSize: '13px',
                        color: 'var(--text-primary, #1C1917)',
                        outline: 'none'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary, #78716C)', marginBottom: '4px' }}>
                      AWB / Tracking Number
                    </label>
                    <input
                      type="text"
                      value={newTrackingNumber}
                      onChange={(e) => setNewTrackingNumber(e.target.value)}
                      placeholder="e.g. DLV-88123904"
                      style={{
                        width: '100%',
                        padding: '8px 10px',
                        borderRadius: '6px',
                        border: '1px solid var(--color-border, #E7E5E4)',
                        background: 'var(--color-canvas, #F6F5F2)',
                        fontSize: '13px',
                        color: 'var(--text-primary, #1C1917)',
                        outline: 'none'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary, #78716C)', marginBottom: '4px' }}>
                      Estimated Delivery
                    </label>
                    <input
                      type="text"
                      value={newEstimatedDelivery}
                      onChange={(e) => setNewEstimatedDelivery(e.target.value)}
                      placeholder="e.g. 15 Oct 2026"
                      style={{
                        width: '100%',
                        padding: '8px 10px',
                        borderRadius: '6px',
                        border: '1px solid var(--color-border, #E7E5E4)',
                        background: 'var(--color-canvas, #F6F5F2)',
                        fontSize: '13px',
                        color: 'var(--text-primary, #1C1917)',
                        outline: 'none'
                      }}
                    />
                  </div>

                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary, #78716C)', marginBottom: '4px' }}>
                      Live Tracking Note / Hub Location (Visible to Buyer in App)
                    </label>
                    <input
                      type="text"
                      value={statusNote}
                      onChange={(e) => setStatusNote(e.target.value)}
                      placeholder="e.g. Package scanned at Indore Sorting Hub and dispatched to buyer..."
                      style={{
                        width: '100%',
                        padding: '8px 10px',
                        borderRadius: '6px',
                        border: '1px solid var(--color-border, #E7E5E4)',
                        background: 'var(--color-canvas, #F6F5F2)',
                        fontSize: '13px',
                        color: 'var(--text-primary, #1C1917)',
                        outline: 'none'
                      }}
                    />
                  </div>

                  <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end', marginTop: '4px' }}>
                    <button
                      type="submit"
                      disabled={isUpdatingStatus}
                      style={{
                        padding: '9px 20px',
                        borderRadius: '6px',
                        border: 'none',
                        background: 'var(--color-navy, #0B2545)',
                        color: '#FFFFFF',
                        fontSize: '13px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      <CheckCircle2 size={15} />
                      {isUpdatingStatus ? 'Syncing with App...' : 'Save & Sync Live Tracking'}
                    </button>
                  </div>
                </form>
              </div>

              {/* Buyer, Seller & Shipping Destination Cards */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                  gap: '16px'
                }}
              >
                <div
                  style={{
                    padding: '16px',
                    borderRadius: '8px',
                    border: '1px solid var(--color-border, #E7E5E4)',
                    background: 'var(--color-canvas, #F6F5F2)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                    <User size={16} color="var(--color-navy, #0B2545)" />
                    <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary, #1C1917)' }}>
                      Buyer Information
                    </span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '12.5px' }}>
                    <span style={{ fontWeight: 600, color: 'var(--text-primary, #1C1917)' }}>
                      {selectedOrder.buyerName || selectedOrder.buyerId?.fullName || selectedOrder.buyerId?.name || 'Customer'}
                    </span>
                    <span style={{ color: 'var(--text-secondary, #78716C)' }}>
                      Email: {selectedOrder.buyerEmail || selectedOrder.buyerId?.email || '—'}
                    </span>
                    <span style={{ color: 'var(--text-secondary, #78716C)' }}>
                      Phone: {selectedOrder.buyerPhone || selectedOrder.buyerId?.phoneNumber || selectedOrder.shippingAddress?.phone || '—'}
                    </span>
                  </div>
                </div>

                <div
                  style={{
                    padding: '16px',
                    borderRadius: '8px',
                    border: '1px solid var(--color-border, #E7E5E4)',
                    background: 'var(--color-canvas, #F6F5F2)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                    <ShieldCheck size={16} color="var(--color-navy, #0B2545)" />
                    <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary, #1C1917)' }}>
                      Seller Information
                    </span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '12.5px' }}>
                    <span style={{ fontWeight: 600, color: 'var(--text-primary, #1C1917)' }}>
                      {selectedOrder.sellerName || selectedOrder.sellerId?.fullName || selectedOrder.sellerId?.name || 'Verified Seller'}
                    </span>
                    <span style={{ color: 'var(--text-secondary, #78716C)' }}>
                      Email: {selectedOrder.sellerId?.email || '—'}
                    </span>
                    <span style={{ color: 'var(--text-secondary, #78716C)' }}>
                      Phone: {selectedOrder.sellerId?.phoneNumber || '—'}
                    </span>
                  </div>
                </div>

                <div
                  style={{
                    padding: '16px',
                    borderRadius: '8px',
                    border: '1px solid var(--color-border, #E7E5E4)',
                    background: 'var(--color-canvas, #F6F5F2)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                    <MapPin size={16} color="var(--color-navy, #0B2545)" />
                    <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary, #1C1917)' }}>
                      Delivery Address
                    </span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', fontSize: '12.5px', color: 'var(--text-primary, #1C1917)' }}>
                    <span>
                      {selectedOrder.shippingAddress?.houseNo} {selectedOrder.shippingAddress?.street || selectedOrder.shippingAddress?.address}
                    </span>
                    {selectedOrder.shippingAddress?.landmark && (
                      <span style={{ color: 'var(--text-secondary, #78716C)' }}>
                        Landmark: {selectedOrder.shippingAddress?.landmark}
                      </span>
                    )}
                    <span>
                      {selectedOrder.shippingAddress?.city || 'Indore'}, {selectedOrder.shippingAddress?.state || 'Madhya Pradesh'} — {selectedOrder.shippingAddress?.pincode || '452001'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Line Items & Financial Breakdown */}
              <div>
                <h4 style={{ margin: '0 0 10px', fontSize: '14px', fontWeight: 700, color: 'var(--text-primary, #1C1917)' }}>
                  Order Items &amp; Tax Summary
                </h4>
                <div style={{ border: '1px solid var(--color-border, #E7E5E4)', borderRadius: '8px', overflow: 'hidden', marginBottom: '12px' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                    <thead>
                      <tr style={{ background: 'var(--color-canvas, #F6F5F2)', borderBottom: '1px solid var(--color-border, #E7E5E4)', color: 'var(--text-secondary, #78716C)', fontSize: '11.5px', fontWeight: 600 }}>
                        <th style={{ padding: '10px 14px' }}>Item</th>
                        <th style={{ padding: '10px 14px', textAlign: 'center' }}>Qty</th>
                        <th style={{ padding: '10px 14px', textAlign: 'right' }}>Unit Price</th>
                        <th style={{ padding: '10px 14px', textAlign: 'right' }}>Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(selectedOrder.items && selectedOrder.items.length > 0
                        ? selectedOrder.items
                        : [
                            {
                              title: selectedOrder.productTitle || 'Marketplace Product',
                              image: selectedOrder.productImage || '',
                              price: selectedOrder.subtotal || selectedOrder.totalAmount || 0,
                              quantity: 1
                            }
                          ]
                      ).map((item, idx) => (
                        <tr key={item._id || idx} style={{ borderBottom: '1px solid var(--color-border, #E7E5E4)' }}>
                          <td style={{ padding: '10px 14px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <span style={{ fontWeight: 600, color: 'var(--text-primary, #1C1917)' }}>
                                {item.title || selectedOrder.productTitle}
                              </span>
                            </div>
                          </td>
                          <td style={{ padding: '10px 14px', textAlign: 'center', fontWeight: 600 }}>
                            {item.quantity || 1}
                          </td>
                          <td style={{ padding: '10px 14px', textAlign: 'right', color: 'var(--text-secondary, #78716C)' }}>
                            ₹{Number(item.price || 0).toLocaleString('en-IN')}
                          </td>
                          <td style={{ padding: '10px 14px', textAlign: 'right', fontWeight: 700, color: 'var(--text-primary, #1C1917)' }}>
                            ₹{(Number(item.price || 0) * Number(item.quantity || 1)).toLocaleString('en-IN')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div
                  style={{
                    background: 'var(--color-canvas, #F6F5F2)',
                    borderRadius: '8px',
                    border: '1px solid var(--color-border, #E7E5E4)',
                    padding: '14px 16px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '16px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <CreditCard size={16} color="var(--color-navy, #0B2545)" />
                    <span style={{ fontSize: '13px', fontWeight: 600 }}>
                      {selectedOrder.paymentMethod || selectedOrder.paymentMode || 'UPI'}
                    </span>
                    <StatusBadge
                      status={
                        ['success', 'completed', 'paid', 'released'].includes(
                          String(selectedOrder.paymentStatus || '').toLowerCase()
                        )
                          ? 'paid'
                          : selectedOrder.paymentStatus || 'pending'
                      }
                      label={(selectedOrder.paymentStatus || 'completed').toUpperCase()}
                    />
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '18px', fontSize: '13px' }}>
                    <span style={{ color: 'var(--text-secondary, #78716C)' }}>
                      Subtotal: <strong>₹{Number(selectedOrder.subtotal || selectedOrder.totalAmount || 0).toLocaleString('en-IN')}</strong>
                    </span>
                    <span style={{ color: 'var(--text-secondary, #78716C)' }}>
                      {selectedOrder.taxName || 'GST'}: <strong>₹{Number(selectedOrder.taxAmount || 0).toLocaleString('en-IN')}</strong>
                    </span>
                    <span style={{ fontSize: '15px', fontWeight: 700, color: 'var(--color-navy, #0B2545)' }}>
                      Total: ₹{Number(selectedOrder.totalAmount || 0).toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Status History Timeline */}
              {selectedOrder.statusHistory && selectedOrder.statusHistory.length > 0 && (
                <div>
                  <h4 style={{ margin: '0 0 10px', fontSize: '13px', fontWeight: 700, color: 'var(--text-primary, #1C1917)' }}>
                    Live Tracking Audit Log ({selectedOrder.statusHistory.length} events)
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', paddingLeft: '8px' }}>
                    {selectedOrder.statusHistory.map((h, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '12.5px' }}>
                        <span
                          style={{
                            width: '8px',
                            height: '8px',
                            borderRadius: '50%',
                            background: 'var(--color-navy, #0B2545)',
                            marginTop: '5px',
                            flexShrink: 0
                          }}
                        />
                        <div>
                          <strong style={{ color: 'var(--text-primary, #1C1917)', textTransform: 'uppercase' }}>
                            {String(h.status || '').replace(/_/g, ' ')}:
                          </strong>{' '}
                          <span style={{ color: 'var(--text-secondary, #78716C)' }}>{h.note || 'Status updated'}</span>{' '}
                          {(h.courierName || h.trackingNumber) && (
                            <span style={{ fontFamily: 'monospace', color: '#1548A6', fontWeight: 600 }}>
                              [{[h.courierName, h.trackingNumber].filter(Boolean).join(' • ')}]
                            </span>
                          )}{' '}
                          <span style={{ color: 'var(--text-secondary, #78716C)', fontSize: '11px' }}>
                            ({new Date(h.changedAt || Date.now()).toLocaleString('en-IN')})
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
