import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
  ScrollView,
  TextInput,
  Alert,
  ActivityIndicator,
  Image
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import ScreenContainer from '../../components/ScreenContainer';
import Spacing from '../../constants/spacing';
import Shadows from '../../constants/shadows';
import {
  getOrders,
  refreshOrderTracking,
  cancelOrder,
  completeOrder,
  submitOrderReview,
  subscribeOrders,
  getTrackingStepNumber
} from './orderStore';
import { useApp } from '../../context/AppContext';
import AuthRequiredState from '../../components/common/AuthRequiredState';

const TABS = ['All', 'Pending', 'Completed', 'Cancelled'];

const STATUS_CONFIG = {
  placed: { label: 'Order Placed', color: '#D97706', bg: '#FEF3C7', step: 1 },
  pending: { label: 'Order Placed', color: '#D97706', bg: '#FEF3C7', step: 1 },
  confirmed: { label: 'Confirmed', color: '#1548A6', bg: '#EFF6FF', step: 2 },
  processing: { label: 'Packed & Processing', color: '#7C3AED', bg: '#F5F3FF', step: 3 },
  shipped: { label: 'Shipped / In-Transit', color: '#0284C7', bg: '#E0F2FE', step: 4 },
  out_for_delivery: { label: 'Out for Delivery', color: '#EA580C', bg: '#FFF7ED', step: 5 },
  delivered: { label: 'Delivered', color: '#059669', bg: '#ECFDF5', step: 6 },
  completed: { label: 'Completed', color: '#059669', bg: '#ECFDF5', step: 6 },
  cancelled: { label: 'Cancelled', color: '#DC2626', bg: '#FEF2F2', step: 0 },
  returned: { label: 'Returned', color: '#DC2626', bg: '#FEF2F2', step: 0 }
};

export const OrderHistoryScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { user, isAuthenticated } = useApp();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [syncingTracking, setSyncingTracking] = useState(false);
  const [activeTab, setActiveTab] = useState('All'); // 'All' | 'Pending' | 'Completed' | 'Cancelled'
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [trackingModalVisible, setTrackingModalVisible] = useState(false);

  // Buyer Rating & Review Modal State
  const [reviewOrder, setReviewOrder] = useState(null);
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const data = await getOrders();
      const list = Array.isArray(data) ? data : [];
      setOrders(list);
      if (selectedOrder) {
        const refreshed = list.find(
          (o) =>
            o.id === selectedOrder.id ||
            o._id === selectedOrder._id ||
            o.orderNumber === selectedOrder.orderNumber
        );
        if (refreshed) setSelectedOrder(refreshed);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    getOrders().then((data) => {
      if (!isMounted) return;
      const list = Array.isArray(data) ? data : [];
      setOrders(list);

      const trackOrderId = route.params?.trackOrderId;
      if (trackOrderId && list.length > 0) {
        const matched = list.find(
          (o) => o.orderNumber === trackOrderId || o.id === trackOrderId || o._id === trackOrderId
        );
        if (matched) {
          setSelectedOrder(matched);
          setTrackingModalVisible(true);
        }
      }
    });

    const unsubscribe = subscribeOrders((updatedOrders) => {
      if (!isMounted) return;
      const list = Array.isArray(updatedOrders) ? [...updatedOrders] : [];
      setOrders(list);
      setSelectedOrder((prev) => {
        if (!prev) return null;
        return (
          list.find(
            (o) => o.id === prev.id || o._id === prev._id || o.orderNumber === prev.orderNumber
          ) || prev
        );
      });
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [route.params?.trackOrderId]);

  const getOrderCategoryBucket = (order) => {
    const s = String(order.status || '').toLowerCase();
    const t = String(order.trackingStatus || '').toLowerCase();
    if (['cancelled', 'canceled', 'returned', 'rejected'].includes(s) || ['cancelled', 'canceled', 'returned', 'rejected'].includes(t)) {
      return 'Cancelled';
    }
    if (['completed', 'delivered'].includes(s) || ['completed', 'delivered'].includes(t)) {
      return 'Completed';
    }
    return 'Pending';
  };

  const tabCounts = useMemo(() => {
    const counts = { All: orders.length, Pending: 0, Completed: 0, Cancelled: 0 };
    orders.forEach((o) => {
      const bucket = getOrderCategoryBucket(o);
      counts[bucket] = (counts[bucket] || 0) + 1;
    });
    return counts;
  }, [orders]);

  const filteredOrders = useMemo(() => {
    if (activeTab === 'All') return orders;
    return orders.filter((order) => getOrderCategoryBucket(order) === activeTab);
  }, [orders, activeTab]);

  const handleCancelPress = (order) => {
    Alert.alert(
      'Cancel Order',
      `Are you sure you want to cancel order ${order.orderNumber}? A full refund will be initiated to your ${order.paymentMode || 'payment method'}.`,
      [
        { text: 'Keep Order', style: 'cancel' },
        {
          text: 'Yes, Cancel Order',
          style: 'destructive',
          onPress: async () => {
            await cancelOrder(order.id, 'Cancelled by buyer via mobile app');
            Alert.alert('Order Cancelled', `Order ${order.orderNumber} has been cancelled.`);
          }
        }
      ]
    );
  };

  const handleCompletePress = (order) => {
    Alert.alert(
      'Confirm Order Received',
      `Have you received "${order.title || order.items?.[0]?.title || 'your order'}" in good condition? This will mark ${order.orderNumber} as Completed.`,
      [
        { text: 'Not Yet', style: 'cancel' },
        {
          text: 'Yes, Received',
          onPress: async () => {
            await completeOrder(order.id, 'Confirmed received by buyer');
            Alert.alert(
              'Order Completed!',
              `Order ${order.orderNumber} is now marked as Completed. You can leave a Rating & Review for this purchase.`
            );
          }
        }
      ]
    );
  };

  const openReviewModal = (order) => {
    setReviewOrder(order);
    setRating(order.userReview?.rating || 5);
    setReviewText(order.userReview?.reviewText || '');
  };

  const handleReviewSubmit = async () => {
    if (!reviewOrder) return;
    setSubmittingReview(true);
    try {
      const primaryItem = reviewOrder.items?.[0] || {};
      await submitOrderReview(reviewOrder.id, {
        targetId: reviewOrder.productId || primaryItem.id,
        targetName: reviewOrder.title || primaryItem.title || 'Marketplace Product',
        targetType: 'product',
        rating,
        reviewText: reviewText.trim() || 'Great product and smooth delivery!',
        reviewerName: user?.name || reviewOrder.buyerName || 'Verified Buyer'
      });
      setReviewOrder(null);
      Alert.alert('Review Published', 'Thank you! Your rating and review have been submitted.');
    } catch (err) {
      Alert.alert('Error', err.message || 'Could not submit review.');
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleDownloadInvoice = (order) => {
    Alert.alert(
      'Download Tax Invoice',
      `Tax invoice for ${order.orderNumber} (₹${Number(order.pricing?.totalAmount ?? order.totalAmount ?? 0).toLocaleString('en-IN')}) has been generated and saved to your device.`,
      [{ text: 'OK' }]
    );
  };

  const handleNeedHelp = (order) => {
    navigation.navigate('HelpSupport', { orderNumber: order.orderNumber });
  };

  const openTrackingModal = async (order) => {
    setSelectedOrder(order);
    setTrackingModalVisible(true);
    setSyncingTracking(true);
    try {
      const fresh = await refreshOrderTracking(order._id || order.id || order.orderNumber);
      if (fresh) {
        setSelectedOrder(fresh);
      }
    } finally {
      setSyncingTracking(false);
    }
  };

  const handleManualSyncTracking = async () => {
    if (!selectedOrder) return;
    setSyncingTracking(true);
    try {
      const fresh = await refreshOrderTracking(
        selectedOrder._id || selectedOrder.id || selectedOrder.orderNumber
      );
      if (fresh) {
        setSelectedOrder(fresh);
      }
    } finally {
      setSyncingTracking(false);
    }
  };

  const renderOrderCard = ({ item }) => {
    const bucket = getOrderCategoryBucket(item);
    const rawTrackKey = String(
      bucket === 'Completed'
        ? 'delivered'
        : bucket === 'Cancelled'
        ? item.trackingStatus === 'returned'
          ? 'returned'
          : 'cancelled'
        : item.trackingStatus || 'placed'
    ).toLowerCase();
    const statusCfg = STATUS_CONFIG[rawTrackKey] || STATUS_CONFIG.placed;
    const isPending = bucket === 'Pending';
    const isCompleted = bucket === 'Completed';
    const isCancelled = bucket === 'Cancelled';
    const primaryItem = item.items?.[0] || {};
    const totalAmt = Number(item.pricing?.totalAmount ?? item.totalAmount ?? item.price ?? 0);
    const taxAmt = Number(item.pricing?.tax ?? item.taxAmount ?? 0);
    const currentStep = getTrackingStepNumber(rawTrackKey, item.status);

    return (
      <View style={styles.orderCard}>
        {/* Card Header */}
        <View style={styles.cardHeader}>
          <View>
            <Text style={styles.orderNumber}>{item.orderNumber}</Text>
            <Text style={styles.orderDate}>
              Placed on {item.orderDate} · {item.paymentMode || 'UPI'}
            </Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusCfg.bg }]}>
            <Text style={[styles.statusText, { color: statusCfg.color }]}>
              {statusCfg.label.toUpperCase()}
            </Text>
          </View>
        </View>

        {/* Item Summary */}
        <TouchableOpacity
          style={styles.cardBody}
          onPress={() => openTrackingModal(item)}
          activeOpacity={0.88}
        >
          {primaryItem.image ? (
            <Image source={{ uri: primaryItem.image }} style={styles.itemImage} />
          ) : (
            <View style={styles.itemThumb}>
              <Ionicons name="cube-outline" size={24} color="#002F34" />
            </View>
          )}
          <View style={styles.itemDetails}>
            <Text style={styles.itemTitle} numberOfLines={1}>
              {primaryItem.title || item.title || 'Marketplace Item'}
            </Text>
            <Text style={styles.itemSub}>
              Qty: {primaryItem.quantity || 1} · Price: ₹
              {Number(primaryItem.price || item.price || 0).toLocaleString('en-IN')}
              {taxAmt > 0 ? ` (+₹${taxAmt.toLocaleString('en-IN')} GST)` : ''}
            </Text>
            <Text
              style={[
                styles.itemDelivery,
                isCancelled && { color: '#DC2626' }
              ]}
            >
              {isCompleted
                ? 'Delivered & Verified'
                : isCancelled
                ? item.cancellationReason || 'Order Cancelled & Refund Initiated'
                : `Expected by ${item.estimatedDelivery || '3-4 business days'}`}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
        </TouchableOpacity>

        {/* Dynamic Live 6-Stage Mini Progress Bar on Card */}
        {!isCancelled && (
          <TouchableOpacity
            style={styles.miniTrackerBox}
            onPress={() => openTrackingModal(item)}
            activeOpacity={0.85}
          >
            <View style={styles.miniTrackerHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                <Ionicons name="navigate-circle" size={15} color="#1548A6" />
                <Text style={styles.miniTrackerStageText}>
                  Live Tracking: {statusCfg.label} (Step {Math.min(currentStep, 6)}/6)
                </Text>
              </View>
              {(item.courierName || item.trackingNumber) ? (
                <Text style={styles.miniCourierBadge} numberOfLines={1}>
                  {[item.courierName, item.trackingNumber].filter(Boolean).join(' • ')}
                </Text>
              ) : (
                <Text style={styles.miniTapHint}>Tap to Track →</Text>
              )}
            </View>

            <View style={styles.miniProgressBarRow}>
              {[1, 2, 3, 4, 5, 6].map((st) => {
                const done = currentStep >= st;
                return (
                  <View
                    key={st}
                    style={[
                      styles.miniProgressSegment,
                      done ? styles.miniProgressSegmentActive : null
                    ]}
                  />
                );
              })}
            </View>
          </TouchableOpacity>
        )}

        {/* Buyer Review Display (if already reviewed) */}
        {item.userReview ? (
          <View style={styles.reviewedBanner}>
            <View style={styles.reviewStarsInline}>
              {[1, 2, 3, 4, 5].map((star) => (
                <Ionicons
                  key={star}
                  name={star <= item.userReview.rating ? 'star' : 'star-outline'}
                  size={13}
                  color="#F59E0B"
                />
              ))}
              <Text style={styles.reviewedLabel}>Your Rating ({item.userReview.rating}/5)</Text>
            </View>
            {item.userReview.reviewText ? (
              <Text style={styles.reviewedComment} numberOfLines={2}>
                "{item.userReview.reviewText}"
              </Text>
            ) : null}
          </View>
        ) : null}

        {/* Card Footer */}
        <View style={styles.cardFooter}>
          <View>
            <Text style={styles.amountLabel}>Total (incl. Tax)</Text>
            <Text style={styles.amountValue}>₹{totalAmt.toLocaleString('en-IN')}</Text>
          </View>

          <View style={styles.actionButtonsRow}>
            {isPending && (
              <>
                <TouchableOpacity
                  style={styles.cancelBtn}
                  onPress={() => handleCancelPress(item)}
                >
                  <Text style={styles.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.completeBtn}
                  onPress={() => handleCompletePress(item)}
                >
                  <Ionicons name="checkmark-circle-outline" size={14} color="#FFFFFF" />
                  <Text style={styles.completeBtnText}>Mark Received</Text>
                </TouchableOpacity>
              </>
            )}

            {(isCompleted || isPending) && (
              <TouchableOpacity
                style={styles.reviewBtn}
                onPress={() => openReviewModal(item)}
              >
                <Ionicons name="star-outline" size={13} color="#1548A6" />
                <Text style={styles.reviewBtnText}>
                  {item.userReview ? 'Edit Review' : 'Rate & Review'}
                </Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={styles.trackBtn}
              onPress={() => openTrackingModal(item)}
            >
              <Ionicons name="navigate-outline" size={13} color="#FFFFFF" />
              <Text style={styles.trackBtnText}>Track Live</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  const selectedBucket = selectedOrder ? getOrderCategoryBucket(selectedOrder) : 'Pending';
  const selectedTrackKey = selectedOrder
    ? String(
        selectedBucket === 'Completed'
          ? 'delivered'
          : selectedBucket === 'Cancelled'
          ? 'cancelled'
          : selectedOrder.trackingStatus || 'placed'
      ).toLowerCase()
    : 'placed';
  const selectedStatusCfg = STATUS_CONFIG[selectedTrackKey] || STATUS_CONFIG.placed;

  return (
    <ScreenContainer noPadding style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Orders & Live Tracking</Text>
        <TouchableOpacity style={styles.backBtn} onPress={loadOrders}>
          <Ionicons name="refresh" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {!isAuthenticated || !user ? (
        <AuthRequiredState
          title="My Orders"
          message="Sign in to view your pending, completed, and cancelled orders, track live shipments, and leave buyer reviews."
        />
      ) : (
        <>
          {/* Filter Tabs: All | Pending | Completed | Cancelled */}
          <View style={styles.tabBar}>
            {TABS.map((tab) => {
              const active = activeTab === tab;
              return (
                <TouchableOpacity
                  key={tab}
                  style={[styles.tabItem, active && styles.tabItemActive]}
                  onPress={() => setActiveTab(tab)}
                >
                  <Text style={[styles.tabText, active && styles.tabTextActive]}>
                    {tab} ({tabCounts[tab] || 0})
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Orders List */}
          <FlatList
            data={filteredOrders}
            renderItem={renderOrderCard}
            keyExtractor={(item, idx) => String(item.id || item._id || idx)}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            refreshing={loading}
            onRefresh={loadOrders}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Ionicons name="receipt-outline" size={56} color="#94A3B8" />
                <Text style={styles.emptyTitle}>No {activeTab} Orders</Text>
                <Text style={styles.emptySubtitle}>
                  {activeTab === 'Pending'
                    ? 'You have no pending orders right now.'
                    : activeTab === 'Completed'
                    ? 'Orders marked received or delivered appear here.'
                    : activeTab === 'Cancelled'
                    ? 'You have no cancelled orders.'
                    : 'You have not placed any marketplace orders yet.'}
                </Text>
                <TouchableOpacity
                  style={styles.shopNowBtn}
                  onPress={() => navigation.navigate('Main', { screen: 'Home' })}
                >
                  <Text style={styles.shopNowBtnText}>Browse Marketplace</Text>
                </TouchableOpacity>
              </View>
            }
          />

          {/* Buyer Rating & Review Modal */}
          <Modal
            visible={!!reviewOrder}
            transparent
            animationType="slide"
            onRequestClose={() => setReviewOrder(null)}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <View>
                    <Text style={styles.modalHeading}>Rate & Review Purchase</Text>
                    <Text style={styles.modalSub} numberOfLines={1}>
                      {reviewOrder?.title || reviewOrder?.items?.[0]?.title || reviewOrder?.orderNumber}
                    </Text>
                  </View>
                  <TouchableOpacity onPress={() => setReviewOrder(null)}>
                    <Ionicons name="close" size={24} color="#002F34" />
                  </TouchableOpacity>
                </View>

                <Text style={styles.reviewPromptText}>How was your experience with this product & seller?</Text>
                <View style={styles.starsPickerRow}>
                  {[1, 2, 3, 4, 5].map((s) => (
                    <TouchableOpacity
                      key={s}
                      onPress={() => setRating(s)}
                      style={styles.starBtn}
                    >
                      <Ionicons
                        name={s <= rating ? 'star' : 'star-outline'}
                        size={34}
                        color="#F59E0B"
                      />
                    </TouchableOpacity>
                  ))}
                </View>

                <Text style={styles.reviewInputLabel}>Write your review</Text>
                <TextInput
                  style={styles.reviewInput}
                  placeholder="Share product quality, seller communication, and delivery experience..."
                  placeholderTextColor="#94A3B8"
                  value={reviewText}
                  onChangeText={setReviewText}
                  multiline
                />

                <TouchableOpacity
                  style={styles.submitReviewBtn}
                  onPress={handleReviewSubmit}
                  disabled={submittingReview}
                >
                  {submittingReview ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <Text style={styles.submitReviewBtnText}>Submit Review</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </Modal>

          {/* Dynamic Live Order Tracking & Invoice Modal */}
          {selectedOrder && (
            <Modal
              visible={trackingModalVisible}
              transparent
              animationType="slide"
              onRequestClose={() => setTrackingModalVisible(false)}
            >
              <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                  {/* Modal Header */}
                  <View style={styles.modalHeader}>
                    <View style={{ flex: 1 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                        <Text style={styles.modalHeading}>{selectedOrder.orderNumber}</Text>
                        <View style={[styles.statusBadge, { backgroundColor: selectedStatusCfg.bg }]}>
                          <Text style={[styles.statusText, { color: selectedStatusCfg.color }]}>
                            {selectedStatusCfg.label.toUpperCase()}
                          </Text>
                        </View>
                      </View>
                      <Text style={styles.modalSub}>
                        Placed on {selectedOrder.orderDate} · {selectedOrder.paymentMode || 'UPI'}
                      </Text>
                    </View>

                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                      <TouchableOpacity
                        style={styles.syncLiveBtn}
                        onPress={handleManualSyncTracking}
                        disabled={syncingTracking}
                      >
                        {syncingTracking ? (
                          <ActivityIndicator size="small" color="#1548A6" />
                        ) : (
                          <>
                            <Ionicons name="sync-outline" size={14} color="#1548A6" />
                            <Text style={styles.syncLiveBtnText}>Sync</Text>
                          </>
                        )}
                      </TouchableOpacity>

                      <TouchableOpacity onPress={() => setTrackingModalVisible(false)}>
                        <Ionicons name="close" size={24} color="#002F34" />
                      </TouchableOpacity>
                    </View>
                  </View>

                  <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 520 }}>
                    {/* Live Courier & Estimated Delivery Banner */}
                    <View style={styles.liveCarrierCard}>
                      <View style={styles.liveCarrierRow}>
                        <View style={styles.liveCarrierIconBox}>
                          <Ionicons name="bus-outline" size={20} color="#1548A6" />
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.liveCarrierTitle}>
                            {selectedOrder.courierName
                              ? `Courier: ${selectedOrder.courierName}`
                              : selectedBucket === 'Completed'
                              ? 'Delivered via Verified Logistics'
                              : selectedBucket === 'Cancelled'
                              ? 'Shipment Cancelled'
                              : 'Fulfillment in Progress'}
                          </Text>
                          <Text style={styles.liveCarrierSub}>
                            {selectedOrder.trackingNumber
                              ? `AWB / Tracking ID: ${selectedOrder.trackingNumber}`
                              : selectedBucket === 'Cancelled'
                              ? selectedOrder.cancellationReason || 'Refund processed to original payment source'
                              : `Estimated Delivery: ${selectedOrder.estimatedDelivery || '3-4 business days'}`}
                          </Text>
                        </View>
                      </View>
                    </View>

                    {/* 6-Stage Dynamic Shipment Stepper */}
                    <Text style={styles.sectionHeading}>Live Shipment Tracking Timeline</Text>
                    <View style={styles.timelineContainer}>
                      {selectedOrder.trackingHistory?.map((step, index) => {
                        const isLast = index === selectedOrder.trackingHistory.length - 1;
                        const isCancelledStep = Boolean(step.isCancelled);
                        const isActiveStep = Boolean(step.active);
                        return (
                          <View key={index} style={styles.timelineRow}>
                            <View style={styles.timelineIconCol}>
                              <View
                                style={[
                                  styles.timelineDot,
                                  isCancelledStep
                                    ? { backgroundColor: '#DC2626' }
                                    : isActiveStep
                                    ? { backgroundColor: '#1548A6' }
                                    : step.completed
                                    ? styles.timelineDotCompleted
                                    : styles.timelineDotPending
                                ]}
                              >
                                <Ionicons
                                  name={
                                    isCancelledStep
                                      ? 'close'
                                      : step.completed
                                      ? 'checkmark'
                                      : 'ellipse'
                                  }
                                  size={10}
                                  color="#FFFFFF"
                                />
                              </View>
                              {!isLast && (
                                <View
                                  style={[
                                    styles.timelineLine,
                                    step.completed && styles.timelineLineCompleted
                                  ]}
                                />
                              )}
                            </View>
                            <View style={styles.timelineTextCol}>
                              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                                <Text
                                  style={[
                                    styles.timelineStepTitle,
                                    step.completed && styles.timelineStepTitleCompleted,
                                    isCancelledStep && { color: '#DC2626' }
                                  ]}
                                >
                                  {step.title}
                                </Text>
                                {isActiveStep && !isCancelledStep && (
                                  <View style={styles.currentStagePill}>
                                    <Text style={styles.currentStagePillText}>LIVE</Text>
                                  </View>
                                )}
                              </View>
                              <Text style={styles.timelineStepTime}>{step.time}</Text>
                              {step.note ? (
                                <Text
                                  style={[
                                    styles.timelineStepNote,
                                    isCancelledStep && { color: '#DC2626' }
                                  ]}
                                >
                                  {step.note}
                                </Text>
                              ) : null}
                            </View>
                          </View>
                        );
                      })}
                    </View>

                    {/* Delivery Address */}
                    <Text style={styles.sectionHeading}>Shipping Address</Text>
                    <View style={styles.infoCard}>
                      <Text style={styles.infoTitle}>
                        {selectedOrder.shippingAddress?.fullName || selectedOrder.buyerName} ·{' '}
                        {selectedOrder.shippingAddress?.phone || selectedOrder.buyerPhone}
                      </Text>
                      <Text style={styles.infoText}>
                        {selectedOrder.shippingAddress?.houseNo
                          ? `${selectedOrder.shippingAddress.houseNo}, `
                          : ''}
                        {selectedOrder.shippingAddress?.street || 'Indore'}
                      </Text>
                      <Text style={styles.infoText}>
                        {selectedOrder.shippingAddress?.city || 'Indore'},{' '}
                        {selectedOrder.shippingAddress?.pincode || '452010'}
                      </Text>
                    </View>

                    {/* Price & Tax Breakdown */}
                    <Text style={styles.sectionHeading}>Payment & Tax Summary</Text>
                    <View style={styles.infoCard}>
                      <View style={styles.priceRow}>
                        <Text style={styles.priceLabel}>Items Subtotal</Text>
                        <Text style={styles.priceVal}>
                          ₹{Number(selectedOrder.pricing?.subtotal ?? selectedOrder.price ?? 0).toLocaleString('en-IN')}
                        </Text>
                      </View>
                      {Number(selectedOrder.pricing?.discount) > 0 && (
                        <View style={styles.priceRow}>
                          <Text style={styles.priceDiscount}>Discount</Text>
                          <Text style={styles.priceDiscount}>
                            -₹{Number(selectedOrder.pricing.discount).toLocaleString('en-IN')}
                          </Text>
                        </View>
                      )}
                      <View style={styles.priceRow}>
                        <Text style={styles.priceLabel}>GST / Applicable Tax</Text>
                        <Text style={styles.priceVal}>
                          ₹{Number(selectedOrder.pricing?.tax ?? selectedOrder.taxAmount ?? 0).toLocaleString('en-IN')}
                        </Text>
                      </View>
                      <View style={styles.priceRow}>
                        <Text style={styles.priceLabel}>Delivery Fee</Text>
                        <Text style={styles.priceVal}>
                          {Number(selectedOrder.pricing?.deliveryFee || 0) === 0
                            ? 'FREE'
                            : `₹${selectedOrder.pricing?.deliveryFee}`}
                        </Text>
                      </View>
                      <View style={styles.divider} />
                      <View style={styles.priceRow}>
                        <Text style={styles.priceTotalLabel}>Total Paid</Text>
                        <Text style={styles.priceTotalVal}>
                          ₹{Number(selectedOrder.pricing?.totalAmount ?? selectedOrder.totalAmount ?? 0).toLocaleString('en-IN')}
                        </Text>
                      </View>
                    </View>

                    {/* Actions inside modal */}
                    <View style={styles.modalActionRow}>
                      {selectedBucket === 'Pending' && (
                        <TouchableOpacity
                          style={[styles.modalActionBtn, { backgroundColor: '#ECFDF5', borderColor: '#A7F3D0' }]}
                          onPress={() => handleCompletePress(selectedOrder)}
                        >
                          <Ionicons name="checkmark-circle-outline" size={16} color="#059669" />
                          <Text style={[styles.modalActionText, { color: '#059669' }]}>Mark Received</Text>
                        </TouchableOpacity>
                      )}

                      <TouchableOpacity
                        style={styles.modalActionBtn}
                        onPress={() => handleDownloadInvoice(selectedOrder)}
                      >
                        <Ionicons name="document-text-outline" size={16} color="#002F34" />
                        <Text style={styles.modalActionText}>Invoice</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.modalActionBtn}
                        onPress={() => {
                          setTrackingModalVisible(false);
                          openReviewModal(selectedOrder);
                        }}
                      >
                        <Ionicons name="star-outline" size={16} color="#1548A6" />
                        <Text style={[styles.modalActionText, { color: '#1548A6' }]}>Review</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.modalActionBtn}
                        onPress={() => {
                          setTrackingModalVisible(false);
                          handleNeedHelp(selectedOrder);
                        }}
                      >
                        <Ionicons name="help-buoy-outline" size={16} color="#002F34" />
                        <Text style={styles.modalActionText}>Help</Text>
                      </TouchableOpacity>
                    </View>
                  </ScrollView>
                </View>
              </View>
            </Modal>
          )}
        </>
      )}
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC'
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: 14,
    backgroundColor: '#002F34'
  },
  backBtn: {
    padding: 4
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#FFFFFF'
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    gap: 6
  },
  tabItem: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0'
  },
  tabItemActive: {
    backgroundColor: '#002F34',
    borderColor: '#002F34'
  },
  tabText: {
    color: '#475569',
    fontSize: 11.5,
    fontWeight: '700'
  },
  tabTextActive: {
    color: '#FFFFFF'
  },
  listContent: {
    padding: 12,
    paddingBottom: 80
  },
  orderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...Shadows.subtle
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10
  },
  orderNumber: {
    fontSize: 14,
    fontWeight: '800',
    color: '#002F34'
  },
  orderDate: {
    fontSize: 11.5,
    color: '#64748B',
    marginTop: 2
  },
  statusBadge: {
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 6
  },
  statusText: {
    fontSize: 10.5,
    fontWeight: '800',
    letterSpacing: 0.4
  },
  cardBody: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 10
  },
  itemImage: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: '#E2E8F0',
    marginRight: 10
  },
  itemThumb: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10
  },
  itemDetails: {
    flex: 1
  },
  itemTitle: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#002F34'
  },
  itemSub: {
    fontSize: 11.5,
    color: '#475569',
    marginTop: 2
  },
  itemDelivery: {
    fontSize: 11,
    fontWeight: '700',
    color: '#059669',
    marginTop: 3
  },
  miniTrackerBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 10
  },
  miniTrackerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6
  },
  miniTrackerStageText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#002F34'
  },
  miniCourierBadge: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#1548A6',
    maxWidth: 140
  },
  miniTapHint: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#1548A6'
  },
  miniProgressBarRow: {
    flexDirection: 'row',
    gap: 4
  },
  miniProgressSegment: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E2E8F0'
  },
  miniProgressSegmentActive: {
    backgroundColor: '#1548A6'
  },
  reviewedBanner: {
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FDE68A',
    borderRadius: 8,
    padding: 8,
    marginBottom: 10
  },
  reviewStarsInline: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2
  },
  reviewedLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#92400E',
    marginLeft: 6
  },
  reviewedComment: {
    fontSize: 11.5,
    color: '#78350F',
    fontStyle: 'italic',
    marginTop: 3
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    flexWrap: 'wrap',
    gap: 8
  },
  amountLabel: {
    fontSize: 11,
    color: '#64748B'
  },
  amountValue: {
    fontSize: 16,
    fontWeight: '800',
    color: '#002F34'
  },
  actionButtonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6
  },
  cancelBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: '#FECACA',
    backgroundColor: '#FEF2F2'
  },
  cancelBtnText: {
    color: '#DC2626',
    fontSize: 11.5,
    fontWeight: '700'
  },
  completeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 7,
    backgroundColor: '#059669',
    gap: 4
  },
  completeBtnText: {
    color: '#FFFFFF',
    fontSize: 11.5,
    fontWeight: '700'
  },
  reviewBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 7,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    gap: 4
  },
  reviewBtnText: {
    color: '#1548A6',
    fontSize: 11.5,
    fontWeight: '700'
  },
  trackBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 7,
    backgroundColor: '#002F34',
    gap: 4
  },
  trackBtnText: {
    color: '#FFFFFF',
    fontSize: 11.5,
    fontWeight: '700'
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#002F34',
    marginTop: 12
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 18,
    maxWidth: 260
  },
  shopNowBtn: {
    backgroundColor: '#002F34',
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: 8
  },
  shopNowBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700'
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
    justifyContent: 'flex-end'
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 18
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0'
  },
  modalHeading: {
    fontSize: 17,
    fontWeight: '800',
    color: '#002F34'
  },
  modalSub: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2
  },
  syncLiveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE'
  },
  syncLiveBtnText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#1548A6'
  },
  liveCarrierCard: {
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    borderRadius: 10,
    padding: 12,
    marginBottom: 6
  },
  liveCarrierRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10
  },
  liveCarrierIconBox: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center'
  },
  liveCarrierTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#002F34'
  },
  liveCarrierSub: {
    fontSize: 11.5,
    color: '#1E40AF',
    fontWeight: '600',
    marginTop: 2
  },
  currentStagePill: {
    backgroundColor: '#DBEAFE',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4
  },
  currentStagePillText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#1548A6'
  },
  reviewPromptText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#002F34',
    textAlign: 'center',
    marginTop: 4
  },
  starsPickerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    marginVertical: 14
  },
  starBtn: {
    padding: 4
  },
  reviewInputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
    marginBottom: 6
  },
  reviewInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    padding: 12,
    height: 90,
    textAlignVertical: 'top',
    fontSize: 13.5,
    color: '#002F34'
  },
  submitReviewBtn: {
    backgroundColor: '#1548A6',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 16
  },
  submitReviewBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800'
  },
  sectionHeading: {
    fontSize: 13,
    fontWeight: '800',
    color: '#002F34',
    marginBottom: 6,
    marginTop: 10
  },
  timelineContainer: {
    paddingLeft: 6,
    marginBottom: 8
  },
  timelineRow: {
    flexDirection: 'row',
    marginBottom: 4
  },
  timelineIconCol: {
    alignItems: 'center',
    marginRight: 10,
    width: 20
  },
  timelineDot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center'
  },
  timelineDotCompleted: {
    backgroundColor: '#002F34'
  },
  timelineDotPending: {
    backgroundColor: '#CBD5E1'
  },
  timelineLine: {
    width: 2,
    flex: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 2
  },
  timelineLineCompleted: {
    backgroundColor: '#002F34'
  },
  timelineTextCol: {
    flex: 1,
    paddingBottom: 12
  },
  timelineStepTitle: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '600'
  },
  timelineStepTitleCompleted: {
    color: '#002F34',
    fontWeight: '700'
  },
  timelineStepTime: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1
  },
  timelineStepNote: {
    fontSize: 11,
    color: '#1548A6',
    marginTop: 2,
    fontWeight: '600'
  },
  infoCard: {
    backgroundColor: '#F8FAFC',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 8
  },
  infoTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#002F34',
    marginBottom: 2
  },
  infoText: {
    fontSize: 12,
    color: '#475569'
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6
  },
  priceLabel: {
    fontSize: 12,
    color: '#475569'
  },
  priceVal: {
    fontSize: 12,
    fontWeight: '700',
    color: '#002F34'
  },
  priceDiscount: {
    fontSize: 12,
    fontWeight: '700',
    color: '#059669'
  },
  divider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 6
  },
  priceTotalLabel: {
    fontSize: 13,
    fontWeight: '800',
    color: '#002F34'
  },
  priceTotalVal: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1548A6'
  },
  modalActionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 10
  },
  modalActionBtn: {
    flex: 1,
    minWidth: 74,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
    gap: 5
  },
  modalActionText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#002F34'
  }
});

export default OrderHistoryScreen;
