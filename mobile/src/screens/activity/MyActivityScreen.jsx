/**
 * @file apps/mobile/src/screens/activity/MyActivityScreen.jsx
 * @description Unified Activity Hub consolidating 6 key marketplace activities:
 * 1. Orders (physical purchases with 5-stage tracking, invoices, cancel)
 * 2. Bookings (doorstep service appointments with 8-stage tracking, reschedule, cancel, review)
 * 3. My Ads (Seller Studio with active, review, and sold listings, stats, promote)
 * 4. Watchlist (saved products & services with quick removal and undo toast)
 * 5. Offers (active bargaining negotiations with 1-tap checkout for accepted deals)
 * 6. Reviews (user ratings and feedback)
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Image,
  Modal,
  Alert,
  TextInput
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import ScreenContainer from '../../components/ScreenContainer';
import { useApp } from '../../context/AppContext';
import Colors from '../../constants/colors';
import Typography from '../../constants/typography';
import Spacing from '../../constants/spacing';
import Radii from '../../constants/radii';
import Shadows from '../../constants/shadows';
import { getOrders, refreshOrderTracking, cancelOrder, subscribeOrders } from '../orders/orderStore';
import { getProductsApi } from '../../services/productApi';
import AuthRequiredState from '../../components/common/AuthRequiredState';

const SEGMENTS = [
  { id: 'orders', label: 'Orders', icon: 'bag-check-outline' },
  { id: 'bookings', label: 'Bookings', icon: 'calendar-outline' },
  { id: 'ads', label: 'My Ads', icon: 'pricetags-outline' },
  { id: 'watchlist', label: 'Watchlist', icon: 'heart-outline' },
  { id: 'offers', label: 'Offers', icon: 'swap-horizontal-outline' },
  { id: 'reviews', label: 'Reviews', icon: 'star-outline' }
];

const ORDER_STATUS_CONFIG = {
  pending: { label: 'Order Placed', color: Colors.navy, bg: Colors.sunken, step: 1 },
  placed: { label: 'Order Placed', color: Colors.navy, bg: Colors.sunken, step: 1 },
  confirmed: { label: 'Confirmed', color: Colors.navy, bg: Colors.sunken, step: 2 },
  processing: { label: 'Packed & Processing', color: Colors.indigo, bg: Colors.sunken, step: 3 },
  shipped: { label: 'Shipped', color: Colors.indigo, bg: Colors.sunken, step: 4 },
  out_for_delivery: { label: 'Out for Delivery', color: Colors.terracotta, bg: Colors.sunken, step: 5 },
  delivered: { label: 'Delivered', color: Colors.emerald, bg: Colors.sunken, step: 6 },
  completed: { label: 'Completed', color: Colors.emerald, bg: Colors.sunken, step: 6 },
  cancelled: { label: 'Cancelled', color: Colors.error, bg: Colors.sunken, step: 0 },
  returned: { label: 'Returned', color: Colors.error, bg: Colors.sunken, step: 0 }
};

const RESCHEDULE_DATES = ['Today', 'Tomorrow', 'Day After', '29 Sep', '30 Sep', '01 Oct'];
const RESCHEDULE_SLOTS = ['09:00 AM - 12:00 PM', '01:00 PM - 04:00 PM', '05:00 PM - 08:00 PM'];
const CANCEL_REASONS = [
  'Change of plans / Schedule conflict',
  'Found alternative technician',
  'Issue resolved on its own',
  'Booked by mistake',
  'Other'
];

const INITIAL_OFFERS = [];

const formatCurrency = (val) => {
  const num = Number(val) || 0;
  return `₹${num.toLocaleString('en-IN')}`;
};

export default function MyActivityScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { bookings, cancelBooking, rescheduleBooking, rateBooking, watchlist, toggleWatchlist, ads, user, isAuthenticated } = useApp();

  // Active segment state
  const initialSegment = route.params?.initialTab || 'orders';
  const [activeSegment, setActiveSegment] = useState(initialSegment);

  // Orders State
  const [orders, setOrders] = useState([]);
  const [orderSubTab, setOrderSubTab] = useState('All'); // 'All' | 'Active' | 'Completed' | 'Cancelled'
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [trackingModalVisible, setTrackingModalVisible] = useState(false);

  // Bookings State
  const [bookingSubTab, setBookingSubTab] = useState('upcoming'); // 'upcoming' | 'history'
  const [rescheduleTarget, setRescheduleTarget] = useState(null);
  const [newDate, setNewDate] = useState(RESCHEDULE_DATES[1]);
  const [newTimeSlot, setNewTimeSlot] = useState(RESCHEDULE_SLOTS[0]);
  const [cancelTarget, setCancelTarget] = useState(null);
  const [cancelReason, setCancelReason] = useState(CANCEL_REASONS[0]);
  const [ratingTarget, setRatingTarget] = useState(null);
  const [selectedStars, setSelectedStars] = useState(5);
  const [reviewComment, setReviewComment] = useState('');

  // Watchlist Undo State
  const [undoItem, setUndoItem] = useState(null);

  // Offers State
  const [offersList, setOffersList] = useState(INITIAL_OFFERS);
  const [offerSubTab, setOfferSubTab] = useState('All'); // 'All' | 'Sent' | 'Received'
  const [liveProducts, setLiveProducts] = useState([]);

  // Load persistent orders and live products
  useEffect(() => {
    let isMounted = true;
    getOrders().then((data) => {
      if (isMounted) setOrders(data);
    });

    const unsubscribe = subscribeOrders((updatedOrders) => {
      if (isMounted) setOrders(updatedOrders);
    });

    getProductsApi()
      .then((prods) => {
        if (isMounted && Array.isArray(prods)) {
          setLiveProducts(
            prods.map((p) => ({
              id: p._id || p.id,
              title: p.productName || p.title,
              price: `₹${Number(p.productPrice || 0).toLocaleString('en-IN')}`,
              location: p.location || 'India',
              imageUrl: Array.isArray(p.images) && p.images[0]
                ? (p.images[0].startsWith('http') ? p.images[0] : `https://backend.mybigbazaar.com${p.images[0]}`)
                : null,
              category: 'General',
              itemType: 'product'
            }))
          );
        }
      })
      .catch(() => {});

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  // Filtered Orders
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const status = String(order.trackingStatus || order.status || 'placed').toLowerCase();
      if (orderSubTab === 'Active') {
        return ['placed', 'pending', 'confirmed', 'processing', 'shipped', 'out_for_delivery'].includes(status);
      }
      if (orderSubTab === 'Completed') {
        return ['delivered', 'completed'].includes(status) || order.status === 'completed';
      }
      if (orderSubTab === 'Cancelled') {
        return ['cancelled', 'returned'].includes(status) || order.status === 'cancelled';
      }
      return true;
    });
  }, [orders, orderSubTab]);

  // Filtered Bookings
  const upcomingBookings = useMemo(() => {
    return bookings.filter(
      (b) =>
        b.status === 'Upcoming' ||
        b.status === 'confirmed' ||
        b.status === 'assigned' ||
        b.status === 'In-Progress' ||
        b.status === 'in_progress' ||
        b.status === 'pending'
    );
  }, [bookings]);

  const historyBookings = useMemo(() => {
    return bookings.filter(
      (b) =>
        b.status === 'Completed' ||
        b.status === 'completed' ||
        b.status === 'Cancelled' ||
        b.status === 'cancelled'
    );
  }, [bookings]);

  const displayedBookings = bookingSubTab === 'upcoming' ? upcomingBookings : historyBookings;

  // Filtered Watchlist (Live Products)
  const savedItems = useMemo(() => {
    return liveProducts
      .filter((item) => watchlist.includes(item.id))
      .map((item) => ({
        ...item,
        timeEstimate: item.location,
        itemType: 'product'
      }));
  }, [watchlist, liveProducts]);

  // Filtered Offers
  const filteredOffers = useMemo(() => {
    if (offerSubTab === 'Sent') {
      return offersList.filter((o) => o.type === 'sent');
    }
    if (offerSubTab === 'Received') {
      return offersList.filter((o) => o.type === 'received');
    }
    return offersList;
  }, [offersList, offerSubTab]);

  // Orders Actions
  const handleCancelOrderPress = (order) => {
    Alert.alert(
      'Cancel Order',
      `Are you sure you want to cancel order ${order.orderNumber}? A full refund will be processed to your ${order.paymentMode}.`,
      [
        { text: 'Keep Order', style: 'cancel' },
        {
          text: 'Cancel Order',
          style: 'destructive',
          onPress: async () => {
            await cancelOrder(order.id, 'Cancelled by buyer via My Activity');
            Alert.alert('Order Cancelled', `Order ${order.orderNumber} has been cancelled.`);
            if (selectedOrder?.id === order.id) {
              setTrackingModalVisible(false);
            }
          }
        }
      ]
    );
  };

  const handleDownloadInvoice = (order) => {
    Alert.alert(
      'Tax Invoice',
      `Tax invoice for ${order.orderNumber} (₹${order.pricing?.totalAmount?.toLocaleString('en-IN')}) saved to your device.`,
      [{ text: 'OK' }]
    );
  };

  // Booking Actions
  const handleConfirmReschedule = () => {
    if (!rescheduleTarget) return;
    rescheduleBooking(rescheduleTarget.id, newDate, newTimeSlot);
    setRescheduleTarget(null);
    Alert.alert('Rescheduled', `Booking updated to ${newDate} (${newTimeSlot}).`);
  };

  const handleConfirmCancelBooking = () => {
    if (!cancelTarget) return;
    cancelBooking(cancelTarget.id);
    setCancelTarget(null);
    Alert.alert('Booking Cancelled', 'Your service booking has been cancelled.');
  };

  const handleConfirmRating = () => {
    if (!ratingTarget) return;
    rateBooking(ratingTarget.id, selectedStars, reviewComment);
    setRatingTarget(null);
    setReviewComment('');
    Alert.alert('Review Submitted', 'Your review has been submitted successfully.');
  };

  // Watchlist Actions
  const handleRemoveFromWatchlist = (item) => {
    toggleWatchlist(item.id);
    setUndoItem(item);
    setTimeout(() => {
      setUndoItem((curr) => (curr && curr.id === item.id ? null : curr));
    }, 4000);
  };

  const handleUndoWatchlist = () => {
    if (undoItem) {
      toggleWatchlist(undoItem.id);
      setUndoItem(null);
    }
  };

  // Offers 1-Tap Checkout Action
  const handleProceedOfferToCheckout = (offer) => {
    navigation.navigate('Checkout', {
      listingId: offer.listingId,
      item: {
        id: offer.listingId,
        title: offer.listingTitle,
        price: offer.offerPrice,
        imageUrl: offer.imageUrl,
        sellerName: offer.partnerName
      },
      dealPrice: offer.offerPrice,
      isNegotiatedDeal: true
    });
  };

  // -------------------------------------------------------------
  // TAB 1: ORDERS RENDER
  // -------------------------------------------------------------
  const renderOrdersTab = () => (
    <View style={styles.tabContentContainer}>
      <View style={styles.subFilterBar}>
        {['All', 'Active', 'Completed', 'Cancelled'].map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.subFilterPill, orderSubTab === tab && styles.subFilterPillActive]}
            onPress={() => setOrderSubTab(tab)}>
            <Text style={[styles.subFilterText, orderSubTab === tab && styles.subFilterTextActive]}>
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {filteredOrders.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="bag-handle-outline" size={64} color={Colors.disabled} />
          <Text style={styles.emptyTitle}>No orders in this view</Text>
          <Text style={styles.emptySubtitle}>Items you buy will appear here with live tracking.</Text>
          <TouchableOpacity
            style={styles.actionBtnPrimary}
            onPress={() => navigation.navigate('Home')}>
            <Text style={styles.actionBtnPrimaryText}>Start Shopping</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={filteredOrders}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => {
            const statusCfg = ORDER_STATUS_CONFIG[String(item.trackingStatus || 'placed').toLowerCase()] || ORDER_STATUS_CONFIG.placed;
            const firstItem = item.items?.[0] || {};
            const itemCount = item.items?.length || 1;

            return (
              <View style={[styles.card, Shadows.card]}>
                <View style={styles.cardHeaderRow}>
                  <View>
                    <Text style={styles.orderNumber}>{item.orderNumber}</Text>
                    <Text style={styles.orderDate}>{item.orderDate}</Text>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: statusCfg.bg }]}>
                    <Text style={[styles.statusBadgeText, { color: statusCfg.color }]}>
                      {statusCfg.label}
                    </Text>
                  </View>
                </View>

                <View style={styles.cardDivider} />

                <View style={styles.cardItemRow}>
                  {firstItem.image ? (
                    <Image source={{ uri: firstItem.image }} style={styles.itemThumb} />
                  ) : (
                    <View style={[styles.itemThumb, styles.placeholderThumb]}>
                      <Ionicons name="cube-outline" size={24} color={Colors.textSecondary} />
                    </View>
                  )}
                  <View style={styles.itemInfo}>
                    <Text style={styles.itemTitle} numberOfLines={2}>
                      {firstItem.title || 'Marketplace Item'}
                    </Text>
                    <Text style={styles.itemCountText}>
                      {itemCount > 1 ? `${itemCount} items · ` : ''}Paid via {item.paymentMode}
                    </Text>
                    {(item.courierName || item.trackingNumber) ? (
                      <Text style={[styles.itemCountText, { color: Colors.primary, fontWeight: '700' }]}>
                        🚚 {[item.courierName, item.trackingNumber].filter(Boolean).join(' • ')}
                      </Text>
                    ) : null}
                    <Text style={styles.itemPrice}>
                      ₹{item.pricing?.totalAmount?.toLocaleString('en-IN') || '0'}
                    </Text>
                  </View>
                </View>

                <View style={styles.cardActionsRow}>
                  <TouchableOpacity
                    style={styles.cardActionOutlineBtn}
                    onPress={async () => {
                      setSelectedOrder(item);
                      setTrackingModalVisible(true);
                      const fresh = await refreshOrderTracking(item._id || item.id || item.orderNumber);
                      if (fresh) setSelectedOrder(fresh);
                    }}>
                    <Ionicons name="navigate-outline" size={15} color={Colors.primary} />
                    <Text style={styles.cardActionOutlineText}>Track Live</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.cardActionSubtleBtn}
                    onPress={() => handleDownloadInvoice(item)}>
                    <Ionicons name="document-text-outline" size={15} color={Colors.textSecondary} />
                    <Text style={styles.cardActionSubtleText}>Invoice</Text>
                  </TouchableOpacity>

                  {['placed', 'pending', 'confirmed', 'processing'].includes(String(item.trackingStatus || 'placed').toLowerCase()) && (
                    <TouchableOpacity
                      style={styles.cardActionDangerBtn}
                      onPress={() => handleCancelOrderPress(item)}>
                      <Text style={styles.cardActionDangerText}>Cancel</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            );
          }}
        />
      )}
    </View>
  );

  // -------------------------------------------------------------
  // TAB 2: BOOKINGS RENDER
  // -------------------------------------------------------------
  const renderBookingsTab = () => (
    <View style={styles.tabContentContainer}>
      <View style={styles.subFilterBar}>
        <TouchableOpacity
          style={[styles.subFilterPill, bookingSubTab === 'upcoming' && styles.subFilterPillActive]}
          onPress={() => setBookingSubTab('upcoming')}>
          <Text style={[styles.subFilterText, bookingSubTab === 'upcoming' && styles.subFilterTextActive]}>
            Upcoming ({upcomingBookings.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.subFilterPill, bookingSubTab === 'history' && styles.subFilterPillActive]}
          onPress={() => setBookingSubTab('history')}>
          <Text style={[styles.subFilterText, bookingSubTab === 'history' && styles.subFilterTextActive]}>
            History ({historyBookings.length})
          </Text>
        </TouchableOpacity>
      </View>

      {displayedBookings.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="construct-outline" size={64} color={Colors.disabled} />
          <Text style={styles.emptyTitle}>No {bookingSubTab} bookings</Text>
          <Text style={styles.emptySubtitle}>Book trusted plumbers, electricians, tutors, and cleaners.</Text>
          <TouchableOpacity
            style={styles.actionBtnPrimary}
            onPress={() => navigation.navigate('Services')}>
            <Text style={styles.actionBtnPrimaryText}>Explore Services</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={displayedBookings}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => {
            const isCompleted = item.status === 'Completed' || item.status === 'completed';
            const isCancelled = item.status === 'Cancelled' || item.status === 'cancelled';

            return (
              <View style={[styles.card, Shadows.card]}>
                <View style={styles.cardHeaderRow}>
                  <View>
                    <Text style={styles.orderNumber}>#{item.bookingId}</Text>
                    <Text style={styles.orderDate}>{item.scheduledDate} · {item.scheduledTimeSlot}</Text>
                  </View>
                  <View
                    style={[
                      styles.statusBadge,
                      {
                        backgroundColor: Colors.sunken,
                        borderWidth: 1,
                        borderColor: Colors.hairline
                      }
                    ]}>
                    <Text
                      style={[
                        styles.statusBadgeText,
                        {
                          color: isCompleted ? Colors.emerald : isCancelled ? Colors.error : Colors.navy
                        }
                      ]}>
                      {item.status}
                    </Text>
                  </View>
                </View>

                <View style={styles.cardDivider} />

                <View style={styles.cardItemRow}>
                  <View style={[styles.itemThumb, { backgroundColor: Colors.primaryTint, justifyContent: 'center', alignItems: 'center' }]}>
                    <Ionicons name="construct-outline" size={28} color={Colors.primary} />
                  </View>
                  <View style={styles.itemInfo}>
                    <Text style={styles.itemTitle}>{item.subCategoryName || item.serviceName}</Text>
                    <Text style={styles.itemCountText}>
                      Provider: {item.providerName || 'Assigned Certified Partner'}
                    </Text>
                    <Text style={styles.itemPrice}>{formatCurrency(item.amount)}</Text>
                  </View>
                </View>

                <View style={styles.cardActionsRow}>
                  {!isCompleted && !isCancelled && (
                    <>
                      <TouchableOpacity
                        style={styles.cardActionOutlineBtn}
                        onPress={() => {
                          setRescheduleTarget(item);
                          setNewDate(item.scheduledDate || RESCHEDULE_DATES[1]);
                        }}>
                        <Ionicons name="time-outline" size={15} color={Colors.primary} />
                        <Text style={styles.cardActionOutlineText}>Reschedule</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.cardActionDangerBtn}
                        onPress={() => setCancelTarget(item)}>
                        <Text style={styles.cardActionDangerText}>Cancel</Text>
                      </TouchableOpacity>
                    </>
                  )}

                  {isCompleted && !item.userRating && (
                    <TouchableOpacity
                      style={styles.cardActionOutlineBtn}
                      onPress={() => setRatingTarget(item)}>
                      <Ionicons name="star-outline" size={15} color={Colors.primary} />
                      <Text style={styles.cardActionOutlineText}>Rate Service</Text>
                    </TouchableOpacity>
                  )}

                  {item.userRating && (
                    <View style={styles.ratedChip}>
                      <Ionicons name="star" size={13} color="#F59E0B" />
                      <Text style={styles.ratedChipText}>You rated {item.userRating}★</Text>
                    </View>
                  )}
                </View>
              </View>
            );
          }}
        />
      )}
    </View>
  );

  // -------------------------------------------------------------
  // TAB 3: MY ADS RENDER
  // -------------------------------------------------------------
  const renderAdsTab = () => (
    <View style={styles.tabContentContainer}>
      <View style={styles.sellerStatsBanner}>
        <View style={styles.sellerStatCol}>
          <Text style={styles.sellerStatNumber}>{ads.length || 3}</Text>
          <Text style={styles.sellerStatLabel}>Total Ads</Text>
        </View>
        <View style={styles.statDividerVert} />
        <View style={styles.sellerStatCol}>
          <Text style={styles.sellerStatNumber}>452</Text>
          <Text style={styles.sellerStatLabel}>Views</Text>
        </View>
        <View style={styles.statDividerVert} />
        <View style={styles.sellerStatCol}>
          <Text style={styles.sellerStatNumber}>18</Text>
          <Text style={styles.sellerStatLabel}>Inquiries</Text>
        </View>
      </View>

      <TouchableOpacity
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: Colors.navy,
          padding: 14,
          borderRadius: 12,
          marginHorizontal: 16,
          marginBottom: 16
        }}
        onPress={() => navigation.navigate('Wallet')}
        activeOpacity={0.85}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <Ionicons name="wallet-outline" size={24} color={Colors.card} />
          <View>
            <Text style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)', fontWeight: '700' }}>SELLER WALLET BALANCE</Text>
            <Text style={{ fontSize: 18, color: Colors.card, fontWeight: '800' }}>
              ₹{(Number(user?.walletBalance) || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </Text>
          </View>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: Colors.terracotta, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6 }}>
          <Text style={{ fontSize: 12, color: Colors.card, fontWeight: '700' }}>View Wallet</Text>
          <Ionicons name="chevron-forward" size={14} color={Colors.card} />
        </View>
      </TouchableOpacity>

      <View style={styles.adsHeaderActions}>
        <Text style={styles.sectionHeaderTitle}>Your Published Listings</Text>
        <TouchableOpacity
          style={styles.postNewAdBtn}
          onPress={() => navigation.navigate('PostAd')}>
          <Ionicons name="add" size={16} color={Colors.white} />
          <Text style={styles.postNewAdText}>Post Ad</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={ads}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <View style={[styles.card, Shadows.card]}>
            <View style={styles.cardHeaderRow}>
              <Text style={styles.orderNumber}>{item.adNumber || 'BB-AD'}</Text>
              <View
                style={[
                  styles.statusBadge,
                  {
                    backgroundColor: Colors.sunken,
                    borderWidth: 1,
                    borderColor: Colors.hairline
                  }
                ]}>
                <Text
                  style={[
                    styles.statusBadgeText,
                    {
                      color:
                        item.status === 'Active'
                          ? Colors.emerald
                          : item.status === 'Sold'
                          ? Colors.textSecondary
                          : Colors.terracotta
                    }
                  ]}>
                  {item.status}
                </Text>
              </View>
            </View>

            <View style={styles.cardDivider} />

            <View style={styles.cardItemRow}>
              <Image source={{ uri: item.imageUrl }} style={styles.itemThumb} />
              <View style={styles.itemInfo}>
                <Text style={styles.itemTitle} numberOfLines={2}>{item.title}</Text>
                <Text style={styles.itemCountText}>
                  <Ionicons name="eye-outline" size={13} color={Colors.textSecondary} /> {item.views || 0} views
                </Text>
                <Text style={styles.itemPrice}>₹{item.price?.toLocaleString('en-IN')}</Text>
              </View>
            </View>

            <View style={styles.cardActionsRow}>
              <TouchableOpacity
                style={styles.cardActionOutlineBtn}
                onPress={() => Alert.alert('Boost Listing', 'Promote your ad for ₹99 to reach 5x more buyers.')}>
                <Ionicons name="rocket-outline" size={15} color={Colors.primary} />
                <Text style={styles.cardActionOutlineText}>Boost</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.cardActionSubtleBtn}
                onPress={() => navigation.navigate('MyAds')}>
                <Text style={styles.cardActionSubtleText}>Manage Details</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
    </View>
  );

  // -------------------------------------------------------------
  // TAB 4: WATCHLIST RENDER
  // -------------------------------------------------------------
  const renderWatchlistTab = () => (
    <View style={styles.tabContentContainer}>
      {undoItem && (
        <View style={styles.undoSnackbar}>
          <Text style={styles.undoText}>Removed from Watchlist</Text>
          <TouchableOpacity onPress={handleUndoWatchlist} style={styles.undoButton}>
            <Text style={styles.undoButtonText}>UNDO</Text>
          </TouchableOpacity>
        </View>
      )}

      {savedItems.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="heart-outline" size={64} color={Colors.disabled} />
          <Text style={styles.emptyTitle}>Your Watchlist is empty</Text>
          <Text style={styles.emptySubtitle}>Tap the heart icon on any product or service to save it here.</Text>
          <TouchableOpacity
            style={styles.actionBtnPrimary}
            onPress={() => navigation.navigate('Home')}>
            <Text style={styles.actionBtnPrimaryText}>Discover Items</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={savedItems}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.card, Shadows.card]}
              activeOpacity={0.85}
              onPress={() => {
                if (item.itemType === 'product') {
                  navigation.navigate('ProductDetails', { product: item });
                } else {
                  navigation.navigate('ServiceDetails', { item });
                }
              }}>
              <View style={styles.cardItemRow}>
                <Image source={{ uri: item.imageUrl }} style={styles.itemThumb} />
                <View style={styles.itemInfo}>
                  <View style={styles.typeBadge}>
                    <Text style={styles.typeBadgeText}>
                      {item.itemType === 'service' ? 'Domestic Service' : 'Classified Item'}
                    </Text>
                  </View>
                  <Text style={styles.itemTitle} numberOfLines={2}>{item.title}</Text>
                  <Text style={styles.itemPrice}>{item.price}</Text>
                </View>
                <TouchableOpacity
                  style={styles.removeWatchlistBtn}
                  onPress={() => handleRemoveFromWatchlist(item)}>
                  <Ionicons name="heart" size={22} color={Colors.error} />
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );

  // -------------------------------------------------------------
  // TAB 5: OFFERS RENDER
  // -------------------------------------------------------------
  const renderOffersTab = () => (
    <View style={styles.tabContentContainer}>
      <View style={styles.subFilterBar}>
        {['All', 'Sent', 'Received'].map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.subFilterPill, offerSubTab === tab && styles.subFilterPillActive]}
            onPress={() => setOfferSubTab(tab)}>
            <Text style={[styles.subFilterText, offerSubTab === tab && styles.subFilterTextActive]}>
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {filteredOffers.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="swap-horizontal-outline" size={64} color={Colors.disabled} />
          <Text style={styles.emptyTitle}>No offers</Text>
          <Text style={styles.emptySubtitle}>Bargaining negotiations you make or receive will appear here.</Text>
        </View>
      ) : (
        <FlatList
          data={filteredOffers}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => {
            const isAccepted = item.status === 'accepted';
            const isCountered = item.status === 'countered';
            const isPending = item.status === 'pending';

            return (
              <View style={[styles.card, Shadows.card]}>
                <View style={styles.cardHeaderRow}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Ionicons
                      name={item.type === 'sent' ? 'arrow-up-circle-outline' : 'arrow-down-circle-outline'}
                      size={16}
                      color={item.type === 'sent' ? Colors.primary : Colors.brandGreen}
                      style={{ marginRight: 6 }}
                    />
                    <Text style={styles.partnerText}>
                      {item.type === 'sent' ? `To: ${item.partnerName}` : `From: ${item.partnerName}`}
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.statusBadge,
                      {
                        backgroundColor: Colors.sunken,
                        borderWidth: 1,
                        borderColor: Colors.hairline
                      }
                    ]}>
                    <Text
                      style={[
                        styles.statusBadgeText,
                        {
                          color: isAccepted ? Colors.emerald : isCountered ? Colors.indigo : Colors.terracotta
                        }
                      ]}>
                      {item.status.toUpperCase()}
                    </Text>
                  </View>
                </View>

                <View style={styles.cardDivider} />

                <View style={styles.cardItemRow}>
                  <Image source={{ uri: item.imageUrl }} style={styles.itemThumb} />
                  <View style={styles.itemInfo}>
                    <Text style={styles.itemTitle} numberOfLines={2}>{item.listingTitle}</Text>
                    <View style={styles.offerComparisonRow}>
                      <Text style={styles.askingPriceText}>List: ₹{item.askingPrice.toLocaleString('en-IN')}</Text>
                      <Text style={styles.offerPriceHighlight}>
                        Offer: ₹{item.offerPrice.toLocaleString('en-IN')}
                      </Text>
                    </View>
                    {isCountered && item.counterPrice && (
                      <Text style={styles.counterPriceText}>
                        Counter: ₹{item.counterPrice.toLocaleString('en-IN')}
                      </Text>
                    )}
                  </View>
                </View>

                <View style={styles.cardActionsRow}>
                  <TouchableOpacity
                    style={styles.cardActionSubtleBtn}
                    onPress={() =>
                      navigation.navigate('Chat', {
                        sellerName: item.partnerName,
                        listingTitle: item.listingTitle,
                        listingPrice: item.askingPrice,
                        listingImage: item.imageUrl,
                        listingId: item.listingId
                      })
                    }>
                    <Ionicons name="chatbubbles-outline" size={15} color={Colors.textSecondary} />
                    <Text style={styles.cardActionSubtleText}>Open Chat</Text>
                  </TouchableOpacity>

                  {isAccepted && item.type === 'sent' && (
                    <TouchableOpacity
                      style={styles.actionBtnSpecialDeal}
                      onPress={() => handleProceedOfferToCheckout(item)}>
                      <Ionicons name="shield-checkmark" size={15} color={Colors.white} />
                      <Text style={styles.actionBtnSpecialDealText}>
                        Checkout (₹{item.offerPrice.toLocaleString('en-IN')})
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            );
          }}
        />
      )}
    </View>
  );

  // -------------------------------------------------------------
  // TAB 6: REVIEWS RENDER
  // -------------------------------------------------------------
  const renderReviewsTab = () => (
    <View style={styles.tabContentContainer}>
      <View style={styles.reviewSummaryCard}>
        <View style={styles.reviewScoreBox}>
          <Text style={styles.reviewScoreNumber}>4.9</Text>
          <View style={styles.starsRow}>
            {[1, 2, 3, 4, 5].map((s) => (
              <Ionicons key={s} name="star" size={14} color="#F59E0B" />
            ))}
          </View>
          <Text style={styles.reviewScoreCount}>Based on 8 reviews</Text>
        </View>
        <View style={styles.reviewBadgeBox}>
          <Ionicons name="shield-checkmark" size={28} color={Colors.brandGreen} />
          <Text style={styles.reviewBadgeTitle}>Trusted Community</Text>
          <Text style={styles.reviewBadgeSubtitle}>100% verified transactions</Text>
        </View>
      </View>

      <Text style={styles.sectionHeaderTitle}>Reviews You've Given</Text>

      <FlatList
        data={[
          {
            id: 'rev-1',
            target: 'Alex Smith (Certified Plumber)',
            rating: 5,
            date: '10 Sep 2026',
            comment: 'Arrived right on schedule. Fixed the valve leakage within 30 minutes without any mess.'
          },
          {
            id: 'rev-2',
            target: 'Sony WH-1000XM4 Headphones',
            rating: 5,
            date: '28 Sep 2026',
            comment: 'Pristine condition as described. Escrow payment was very safe and easy.'
          },
          {
            id: 'rev-3',
            target: 'Dr. Sarah Connor (Home Tutor)',
            rating: 5,
            date: '02 Sep 2026',
            comment: 'Cleared all trigonometry concepts clearly. High level of patience.'
          }
        ]}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <View style={[styles.card, Shadows.card]}>
            <View style={styles.cardHeaderRow}>
              <Text style={styles.reviewTargetName}>{item.target}</Text>
              <Text style={styles.orderDate}>{item.date}</Text>
            </View>
            <View style={styles.starsRow}>
              {[...Array(item.rating)].map((_, i) => (
                <Ionicons key={i} name="star" size={14} color="#F59E0B" />
              ))}
            </View>
            <Text style={styles.reviewCommentText}>"{item.comment}"</Text>
          </View>
        )}
      />
    </View>
  );

  return (
    <ScreenContainer noPadding style={styles.container}>
      {/* Top Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Activity</Text>
        <TouchableOpacity
          style={styles.headerCartBtn}
          onPress={() => navigation.navigate('Bucket')}>
          <Ionicons name="cart-outline" size={22} color={Colors.card} />
        </TouchableOpacity>
      </View>

      {/* Segment Scroll Rail */}
      <View style={styles.segmentRailWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.segmentRailContent}>
          {SEGMENTS.map((seg) => {
            const isActive = activeSegment === seg.id;
            return (
              <TouchableOpacity
                key={seg.id}
                style={[styles.segmentBtn, isActive && styles.segmentBtnActive]}
                onPress={() => setActiveSegment(seg.id)}
                activeOpacity={0.8}>
                <Ionicons
                  name={seg.icon}
                  size={16}
                  color={isActive ? Colors.card : Colors.textSecondary}
                  style={{ marginRight: 6 }}
                />
                <Text style={[styles.segmentText, isActive && styles.segmentTextActive]}>
                  {seg.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Segment Content */}
      <View style={styles.body}>
        {!isAuthenticated || !user ? (
          <AuthRequiredState
            title="Activity Hub"
            message="Sign in to view your orders, service appointments, active ads, and saved deals."
          />
        ) : (
          <>
            {activeSegment === 'orders' && renderOrdersTab()}
            {activeSegment === 'bookings' && renderBookingsTab()}
            {activeSegment === 'ads' && renderAdsTab()}
            {activeSegment === 'watchlist' && renderWatchlistTab()}
            {activeSegment === 'offers' && renderOffersTab()}
            {activeSegment === 'reviews' && renderReviewsTab()}
          </>
        )}
      </View>

      {/* ORDER TRACKING MODAL */}
      <Modal
        visible={trackingModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setTrackingModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Live Order Tracking</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <TouchableOpacity
                  onPress={async () => {
                    if (!selectedOrder) return;
                    const fresh = await refreshOrderTracking(
                      selectedOrder._id || selectedOrder.id || selectedOrder.orderNumber
                    );
                    if (fresh) setSelectedOrder(fresh);
                  }}>
                  <Ionicons name="refresh" size={20} color={Colors.primary} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setTrackingModalVisible(false)}>
                  <Ionicons name="close" size={24} color={Colors.textPrimary} />
                </TouchableOpacity>
              </View>
            </View>

            {selectedOrder && (
              <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 440 }}>
                <Text style={styles.modalSubheading}>
                  {selectedOrder.orderNumber} · {selectedOrder.orderDate}
                </Text>

                {(selectedOrder.courierName || selectedOrder.trackingNumber || selectedOrder.estimatedDelivery) ? (
                  <View
                    style={{
                      backgroundColor: Colors.sunken,
                      borderRadius: 8,
                      padding: 10,
                      marginBottom: 12,
                      borderWidth: 1,
                      borderColor: Colors.hairline
                    }}>
                    {selectedOrder.courierName || selectedOrder.trackingNumber ? (
                      <Text style={{ fontSize: 12.5, fontWeight: '700', color: Colors.navy }}>
                        🚚 {[selectedOrder.courierName, selectedOrder.trackingNumber ? `AWB: ${selectedOrder.trackingNumber}` : ''].filter(Boolean).join(' • ')}
                      </Text>
                    ) : null}
                    <Text style={{ fontSize: 11.5, color: Colors.textSecondary, marginTop: 2 }}>
                      Estimated Delivery: {selectedOrder.estimatedDelivery || '3-4 business days'}
                    </Text>
                  </View>
                ) : null}

                <View style={styles.timelineWrapper}>
                  {(selectedOrder.trackingHistory || []).map((step, idx) => (
                    <View key={idx} style={styles.timelineRow}>
                      <View style={styles.timelineIndicatorCol}>
                        <View
                          style={[
                            styles.timelineDot,
                            step.completed && styles.timelineDotCompleted
                          ]}>
                          {step.completed && <Ionicons name="checkmark" size={12} color={Colors.card} />}
                        </View>
                        {idx < selectedOrder.trackingHistory.length - 1 && (
                          <View
                            style={[
                              styles.timelineLine,
                              step.completed && styles.timelineLineCompleted
                            ]}
                          />
                        )}
                      </View>
                      <View style={styles.timelineContentCol}>
                        <Text style={styles.timelineStepTitle}>{step.title}</Text>
                        <Text style={styles.timelineStepTime}>{step.time}</Text>
                        {step.note ? <Text style={styles.timelineStepNote}>{step.note}</Text> : null}
                      </View>
                    </View>
                  ))}
                </View>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

      {/* RESCHEDULE BOOKING MODAL */}
      <Modal
        visible={Boolean(rescheduleTarget)}
        transparent
        animationType="fade"
        onRequestClose={() => setRescheduleTarget(null)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Reschedule Appointment</Text>
              <TouchableOpacity onPress={() => setRescheduleTarget(null)}>
                <Ionicons name="close" size={24} color={Colors.textPrimary} />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalSectionLabel}>Select New Date</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
              {RESCHEDULE_DATES.map((d) => (
                <TouchableOpacity
                  key={d}
                  style={[styles.pickerPill, newDate === d && styles.pickerPillActive]}
                  onPress={() => setNewDate(d)}>
                  <Text style={[styles.pickerPillText, newDate === d && styles.pickerPillTextActive]}>
                    {d}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={styles.modalSectionLabel}>Select Time Window</Text>
            {RESCHEDULE_SLOTS.map((slot) => (
              <TouchableOpacity
                key={slot}
                style={[styles.slotOption, newTimeSlot === slot && styles.slotOptionActive]}
                onPress={() => setNewTimeSlot(slot)}>
                <Text style={[styles.slotOptionText, newTimeSlot === slot && styles.slotOptionTextActive]}>
                  {slot}
                </Text>
                {newTimeSlot === slot && <Ionicons name="checkmark-circle" size={18} color={Colors.primary} />}
              </TouchableOpacity>
            ))}

            <TouchableOpacity style={styles.modalConfirmBtn} onPress={handleConfirmReschedule}>
              <Text style={styles.modalConfirmBtnText}>Confirm Reschedule</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* CANCEL BOOKING MODAL */}
      <Modal
        visible={Boolean(cancelTarget)}
        transparent
        animationType="fade"
        onRequestClose={() => setCancelTarget(null)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Cancel Booking</Text>
              <TouchableOpacity onPress={() => setCancelTarget(null)}>
                <Ionicons name="close" size={24} color={Colors.textPrimary} />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalSectionLabel}>Why are you cancelling?</Text>
            {CANCEL_REASONS.map((reason) => (
              <TouchableOpacity
                key={reason}
                style={[styles.slotOption, cancelReason === reason && styles.slotOptionActive]}
                onPress={() => setCancelReason(reason)}>
                <Text style={[styles.slotOptionText, cancelReason === reason && styles.slotOptionTextActive]}>
                  {reason}
                </Text>
                {cancelReason === reason && <Ionicons name="radio-button-on" size={18} color={Colors.error} />}
              </TouchableOpacity>
            ))}

            <TouchableOpacity
              style={[styles.modalConfirmBtn, { backgroundColor: Colors.error }]}
              onPress={handleConfirmCancelBooking}>
              <Text style={styles.modalConfirmBtnText}>Confirm Cancellation</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* RATE SERVICE MODAL */}
      <Modal
        visible={Boolean(ratingTarget)}
        transparent
        animationType="fade"
        onRequestClose={() => setRatingTarget(null)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Rate Your Experience</Text>
              <TouchableOpacity onPress={() => setRatingTarget(null)}>
                <Ionicons name="close" size={24} color={Colors.textPrimary} />
              </TouchableOpacity>
            </View>

            <View style={styles.starRatingRow}>
              {[1, 2, 3, 4, 5].map((s) => (
                <TouchableOpacity key={s} onPress={() => setSelectedStars(s)} style={{ padding: 6 }}>
                  <Ionicons
                    name={s <= selectedStars ? 'star' : 'star-outline'}
                    size={32}
                    color="#F59E0B"
                  />
                </TouchableOpacity>
              ))}
            </View>

            <TextInput
              style={styles.reviewInput}
              placeholder="Share details of your experience (optional)..."
              placeholderTextColor={Colors.textSecondary}
              multiline
              numberOfLines={3}
              value={reviewComment}
              onChangeText={setReviewComment}
            />

            <TouchableOpacity style={styles.modalConfirmBtn} onPress={handleConfirmRating}>
              <Text style={styles.modalConfirmBtnText}>Submit Review</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.canvas
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.sm,
    backgroundColor: Colors.navy,
    borderBottomWidth: 1,
    borderBottomColor: Colors.hairline
  },
  headerTitle: {
    ...Typography.h2,
    color: Colors.card,
    fontSize: 18
  },
  headerCartBtn: {
    padding: Spacing.xs
  },
  segmentRailWrapper: {
    backgroundColor: Colors.card,
    borderBottomWidth: 1,
    borderBottomColor: Colors.hairline,
    paddingVertical: 10
  },
  segmentRailContent: {
    paddingHorizontal: Spacing.base,
    gap: 8
  },
  segmentBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: Radii.badge || 6,
    backgroundColor: Colors.sunken,
    borderWidth: 1,
    borderColor: Colors.hairline
  },
  segmentBtnActive: {
    backgroundColor: Colors.navy,
    borderColor: Colors.navy
  },
  segmentText: {
    ...Typography.captionBold,
    color: Colors.textSecondary,
    fontSize: 12
  },
  segmentTextActive: {
    color: Colors.card
  },
  body: {
    flex: 1
  },
  tabContentContainer: {
    flex: 1,
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.sm
  },
  subFilterBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: Spacing.sm
  },
  subFilterPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Radii.badge || 6,
    backgroundColor: Colors.sunken,
    borderWidth: 1,
    borderColor: Colors.hairline
  },
  subFilterPillActive: {
    backgroundColor: Colors.terracotta,
    borderColor: Colors.terracotta
  },
  subFilterText: {
    ...Typography.captionBold,
    color: Colors.textSecondary,
    fontSize: 12
  },
  subFilterTextActive: {
    color: Colors.card
  },
  listContent: {
    paddingBottom: 40,
    gap: Spacing.sm
  },
  card: {
    backgroundColor: Colors.card,
    borderRadius: Radii.card || 12,
    borderWidth: 1,
    borderColor: Colors.hairline,
    padding: Spacing.base,
    ...Shadows.card
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start'
  },
  orderNumber: {
    ...Typography.bodyBold,
    color: Colors.textPrimary,
    fontSize: 14
  },
  orderDate: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginTop: 2
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radii.badge || 6
  },
  statusBadgeText: {
    ...Typography.captionBold,
    fontSize: 11
  },
  cardDivider: {
    height: 1,
    backgroundColor: Colors.hairline,
    marginVertical: 10
  },
  cardItemRow: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  itemThumb: {
    width: 60,
    height: 60,
    borderRadius: Radii.input || 8,
    backgroundColor: Colors.sunken,
    marginRight: 12,
    borderWidth: 1,
    borderColor: Colors.hairline
  },
  placeholderThumb: {
    alignItems: 'center',
    justifyContent: 'center'
  },
  itemInfo: {
    flex: 1
  },
  itemTitle: {
    ...Typography.bodyBold,
    color: Colors.textPrimary,
    fontSize: 14
  },
  itemCountText: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginTop: 2
  },
  itemPrice: {
    ...Typography.bodyBold,
    color: Colors.navy,
    fontSize: 15,
    marginTop: 2,
    fontVariant: ['tabular-nums']
  },
  cardActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 8,
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.hairline,
    paddingTop: 10
  },
  cardActionOutlineBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Radii.button || 8,
    borderWidth: 1,
    borderColor: Colors.hairline,
    backgroundColor: Colors.sunken,
    gap: 4
  },
  cardActionOutlineText: {
    ...Typography.captionBold,
    color: Colors.navy,
    fontSize: 12
  },
  cardActionSubtleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: Radii.button || 8,
    borderWidth: 1,
    borderColor: Colors.hairline,
    backgroundColor: Colors.card,
    gap: 4
  },
  cardActionSubtleText: {
    ...Typography.caption,
    color: Colors.textSecondary,
    fontSize: 12
  },
  cardActionDangerBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: Radii.button || 8,
    borderWidth: 1,
    borderColor: Colors.hairline,
    backgroundColor: Colors.sunken
  },
  cardActionDangerText: {
    ...Typography.captionBold,
    color: Colors.error,
    fontSize: 12
  },
  ratedChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.sunken,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: Radii.badge || 6,
    borderWidth: 1,
    borderColor: Colors.hairline,
    gap: 4
  },
  ratedChipText: {
    ...Typography.captionBold,
    color: Colors.navy,
    fontSize: 11
  },
  actionBtnSpecialDeal: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.emerald,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: Radii.button || 8,
    gap: 4
  },
  actionBtnSpecialDealText: {
    ...Typography.captionBold,
    color: Colors.card,
    fontSize: 12
  },
  partnerText: {
    ...Typography.captionBold,
    color: Colors.textPrimary,
    fontSize: 12
  },
  offerComparisonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 3
  },
  askingPriceText: {
    ...Typography.caption,
    color: Colors.textSecondary,
    textDecorationLine: 'line-through',
    fontSize: 11,
    fontVariant: ['tabular-nums']
  },
  offerPriceHighlight: {
    ...Typography.captionBold,
    color: Colors.emerald,
    fontSize: 13,
    fontVariant: ['tabular-nums']
  },
  counterPriceText: {
    ...Typography.captionBold,
    color: Colors.indigo,
    fontSize: 12,
    marginTop: 2,
    fontVariant: ['tabular-nums']
  },
  sellerStatsBanner: {
    flexDirection: 'row',
    backgroundColor: Colors.card,
    borderRadius: Radii.card || 12,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.hairline,
    marginBottom: Spacing.sm,
    justifyContent: 'space-around',
    alignItems: 'center'
  },
  sellerStatCol: {
    alignItems: 'center'
  },
  sellerStatNumber: {
    ...Typography.h2,
    color: Colors.navy,
    fontSize: 18,
    fontVariant: ['tabular-nums']
  },
  sellerStatLabel: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginTop: 2
  },
  statDividerVert: {
    width: 1,
    height: 32,
    backgroundColor: Colors.hairline
  },
  adsHeaderActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm
  },
  sectionHeaderTitle: {
    ...Typography.bodyBold,
    color: Colors.textPrimary,
    fontSize: 14
  },
  postNewAdBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.terracotta,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Radii.button || 8,
    gap: 4
  },
  postNewAdText: {
    ...Typography.captionBold,
    color: Colors.card,
    fontSize: 12
  },
  undoSnackbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.navy,
    paddingHorizontal: Spacing.base,
    paddingVertical: 10,
    borderRadius: Radii.input || 8,
    marginBottom: Spacing.sm
  },
  undoText: {
    ...Typography.caption,
    color: Colors.card
  },
  undoButton: {
    paddingHorizontal: 8,
    paddingVertical: 2
  },
  undoButtonText: {
    ...Typography.captionBold,
    color: Colors.card
  },
  removeWatchlistBtn: {
    padding: Spacing.xs
  },
  typeBadge: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.sunken,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: Radii.badge || 6,
    borderWidth: 1,
    borderColor: Colors.hairline,
    marginBottom: 2
  },
  typeBadgeText: {
    fontSize: 10,
    color: Colors.textSecondary,
    fontWeight: '600'
  },
  reviewSummaryCard: {
    flexDirection: 'row',
    backgroundColor: Colors.card,
    borderRadius: Radii.card || 12,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.hairline,
    marginBottom: Spacing.base,
    alignItems: 'center',
    justifyContent: 'space-around'
  },
  reviewScoreBox: {
    alignItems: 'center'
  },
  reviewScoreNumber: {
    ...Typography.h1,
    color: Colors.navy,
    fontSize: 32,
    fontVariant: ['tabular-nums']
  },
  starsRow: {
    flexDirection: 'row',
    gap: 2,
    marginVertical: 4
  },
  reviewScoreCount: {
    ...Typography.caption,
    color: Colors.textSecondary
  },
  reviewBadgeBox: {
    alignItems: 'center'
  },
  reviewBadgeTitle: {
    ...Typography.bodyBold,
    color: Colors.textPrimary,
    fontSize: 13,
    marginTop: 4
  },
  reviewBadgeSubtitle: {
    ...Typography.caption,
    color: Colors.textSecondary
  },
  reviewTargetName: {
    ...Typography.bodyBold,
    color: Colors.textPrimary,
    fontSize: 13
  },
  reviewCommentText: {
    ...Typography.body,
    color: Colors.textSecondary,
    fontStyle: 'italic',
    marginTop: 6
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.xl
  },
  emptyTitle: {
    ...Typography.bodyBold,
    color: Colors.textPrimary,
    fontSize: 16,
    marginTop: Spacing.md
  },
  emptySubtitle: {
    ...Typography.secondary,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: Spacing.lg
  },
  actionBtnPrimary: {
    backgroundColor: Colors.terracotta,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: Radii.button || 8,
    minHeight: 44,
    justifyContent: 'center'
  },
  actionBtnPrimaryText: {
    ...Typography.button,
    color: Colors.card,
    fontSize: 13
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(28,25,23,0.5)',
    justifyContent: 'flex-end'
  },
  modalCard: {
    backgroundColor: Colors.card,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    borderWidth: 1,
    borderColor: Colors.hairline,
    padding: Spacing.base,
    paddingBottom: 34
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm
  },
  modalTitle: {
    ...Typography.h2,
    color: Colors.textPrimary,
    fontSize: 17
  },
  modalSubheading: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginBottom: Spacing.md
  },
  timelineWrapper: {
    paddingLeft: 6
  },
  timelineRow: {
    flexDirection: 'row',
    marginBottom: Spacing.md
  },
  timelineIndicatorCol: {
    alignItems: 'center',
    marginRight: 14,
    width: 20
  },
  timelineDot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: Colors.sunken,
    borderWidth: 1,
    borderColor: Colors.hairline,
    alignItems: 'center',
    justifyContent: 'center'
  },
  timelineDotCompleted: {
    backgroundColor: Colors.navy,
    borderColor: Colors.navy
  },
  timelineLine: {
    width: 2,
    flex: 1,
    backgroundColor: Colors.hairline,
    marginTop: 4
  },
  timelineLineCompleted: {
    backgroundColor: Colors.navy
  },
  timelineContentCol: {
    flex: 1
  },
  timelineStepTitle: {
    ...Typography.bodyBold,
    color: Colors.textPrimary,
    fontSize: 14
  },
  timelineStepTime: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginTop: 2
  },
  timelineStepNote: {
    ...Typography.caption,
    color: Colors.indigo,
    marginTop: 2,
    fontStyle: 'italic'
  },
  modalSectionLabel: {
    ...Typography.bodyBold,
    color: Colors.textPrimary,
    fontSize: 13,
    marginTop: Spacing.sm,
    marginBottom: 8
  },
  pickerPill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: Radii.badge || 6,
    backgroundColor: Colors.sunken,
    borderWidth: 1,
    borderColor: Colors.hairline,
    marginRight: 8
  },
  pickerPillActive: {
    backgroundColor: Colors.navy,
    borderColor: Colors.navy
  },
  pickerPillText: {
    ...Typography.captionBold,
    color: Colors.textSecondary
  },
  pickerPillTextActive: {
    color: Colors.card
  },
  slotOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: Radii.input || 8,
    borderWidth: 1,
    borderColor: Colors.hairline,
    backgroundColor: Colors.sunken,
    marginBottom: 8
  },
  slotOptionActive: {
    borderColor: Colors.navy,
    borderWidth: 1.5,
    backgroundColor: Colors.card
  },
  slotOptionText: {
    ...Typography.body,
    color: Colors.textPrimary,
    fontSize: 14
  },
  slotOptionTextActive: {
    ...Typography.bodyBold,
    color: Colors.navy
  },
  modalConfirmBtn: {
    backgroundColor: Colors.terracotta,
    paddingVertical: 12,
    minHeight: 48,
    borderRadius: Radii.button || 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.md
  },
  modalConfirmBtnText: {
    ...Typography.button,
    color: Colors.card
  },
  starRatingRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: Spacing.md
  },
  reviewInput: {
    backgroundColor: Colors.sunken,
    borderRadius: Radii.input || 8,
    borderWidth: 1,
    borderColor: Colors.hairline,
    padding: Spacing.md,
    color: Colors.textPrimary,
    textAlignVertical: 'top',
    fontSize: 14
  }
});
