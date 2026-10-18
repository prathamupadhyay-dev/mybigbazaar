import React, { useState, useEffect, useCallback } from 'react';
import {
  Alert,
  FlatList,
  Image,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ScrollView,
  RefreshControl,
  StatusBar
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ScreenContainer from '../../components/ScreenContainer';
import { useApp } from '../../context/AppContext';
import AuthRequiredState from '../../components/common/AuthRequiredState';
import {
  getProductsApi,
  formatProductSubtitle,
  resolveProductImageUrl,
  updateProductApi,
  deleteProductApi
} from '../../services/productApi';

const TABS = ['All', 'Active', 'Under Review', 'Sold', 'Paused'];

// Promotion Packages matching platform
const PACKAGES = [
  {
    id: 'free',
    name: 'Free Basic',
    price: 0,
    badge: 'Standard',
    perks: ['Listed in local feed', 'Active for 30 days', 'Standard search visibility']
  },
  {
    id: 'featured',
    name: 'Featured Listing',
    price: 99,
    badge: '3X Reach',
    perks: ['Pinned above standard listings', 'Orange "Featured" badge', 'Weekly performance stats']
  },
  {
    id: 'urgent',
    name: 'Urgent Sale',
    price: 149,
    badge: 'High Priority',
    perks: ['Red "Urgent" flame banner', 'Top placement across city', 'Instant alert to interested buyers']
  }
];

export default function MyAdsScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { ads, updateAd, updateAdStatus, removeAd, user, isAuthenticated, currencySymbol } = useApp();

  const [activeTab, setActiveTab] = useState('All');
  const [localAds, setLocalAds] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  // Modals state
  const [showPackagesModal, setShowPackagesModal] = useState(false);
  const [editingAd, setEditingAd] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editPrice, setEditPrice] = useState('');
  const [editDescription, setEditDescription] = useState('');

  const formatUiStatus = (rawStatus) => {
    const s = String(rawStatus || 'live').toLowerCase().trim();
    if (s === 'live' || s === 'active' || s === 'approved') return 'Active';
    if (s === 'pending_moderation' || s === 'pending' || s === 'under review') return 'Under Review';
    if (s === 'sold') return 'Sold';
    if (s === 'draft' || s === 'paused') return 'Paused';
    return 'Active';
  };

  const loadLiveAds = useCallback(async () => {
    try {
      const liveList = await getProductsApi();
      if (Array.isArray(liveList)) {
        const userId = String(user?._id || user?.id || '');
        const userName = (user?.fullName || user?.name || '').toLowerCase().trim();
        const userPhone = (user?.phoneNumber || user?.phone || '').replace(/\D/g, '');
        const matched = liveList.filter((item) => {
          const itemSellerId = String(item.sellerId?._id || item.sellerId || item.authId || '');
          const itemSellerName = (item.sellerName || item.seller?.name || item.seller?.fullName || '').toLowerCase().trim();
          const itemPhone = (item.sellerPhone || item.seller?.phone || item.seller?.phoneNumber || '').replace(/\D/g, '');
          if (userId && itemSellerId && userId === itemSellerId) return true;
          if (userName && itemSellerName && userName === itemSellerName) return true;
          if (userPhone && itemPhone && userPhone === itemPhone) return true;
          return false;
        });
        const source = matched.length > 0 ? matched : liveList;
        setLocalAds(
          source.map((item) => ({
            ...item,
            id: item._id || item.id,
            title: item.title || item.productName,
            price: item.price || item.productPrice || 0,
            status: formatUiStatus(item.status),
            imageUrl: resolveProductImageUrl(
              (Array.isArray(item.images) && item.images[0]) || item.image || item.imageUrl
            ),
            subtitle: item.subtitle || formatProductSubtitle(item),
          }))
        );
      }
    } catch (_e) {}
  }, [user]);

  useEffect(() => {
    if (isAuthenticated) {
      loadLiveAds();
    }
  }, [isAuthenticated, loadLiveAds]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadLiveAds();
    setRefreshing(false);
  };

  const combinedAds = React.useMemo(() => {
    const map = new Map();
    [...(ads || []), ...localAds].forEach((ad) => {
      const id = ad?._id || ad?.id;
      if (id && !map.has(id)) {
        map.set(id, {
          ...ad,
          id,
          status: formatUiStatus(ad.status),
          imageUrl: resolveProductImageUrl(ad.imageUrl || (Array.isArray(ad.images) && ad.images[0]) || ad.image)
        });
      }
    });
    return Array.from(map.values());
  }, [ads, localAds]);

  const filterAds = () => {
    if (activeTab === 'All') return combinedAds;
    return combinedAds.filter((ad) => (ad.status || '').toLowerCase() === activeTab.toLowerCase());
  };

  const visibleListings = filterAds();

  const handleToggleStatus = async (ad, newStatus) => {
    updateAdStatus(ad.id, newStatus);
    setLocalAds((prev) =>
      prev.map((item) => (item.id === ad.id ? { ...item, status: newStatus } : item))
    );
    const backendStatus = newStatus.toLowerCase() === 'active'
      ? 'live'
      : (newStatus.toLowerCase() === 'paused' ? 'draft' : newStatus.toLowerCase());
    await updateProductApi(ad.id, { status: backendStatus }).catch(() => {});
  };

  const handleDeletePrompt = (ad) => {
    Alert.alert(
      'Delete Listing?',
      `Are you sure you want to remove "${ad.title}"? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            removeAd(ad.id);
            setLocalAds((prev) => prev.filter((item) => item.id !== ad.id));
            await deleteProductApi(ad.id).catch(() => {});
            Alert.alert('Deleted', 'Your listing has been removed.');
          }
        }
      ]
    );
  };

  const openEditModal = (ad) => {
    setEditingAd(ad);
    setEditTitle(ad.title);
    setEditPrice(String(ad.price));
    setEditDescription(ad.description || '');
  };

  const handleSaveEdit = async () => {
    if (!editTitle.trim() || !editPrice.trim()) {
      Alert.alert('Required Fields', 'Title and price are required.');
      return;
    }
    const cleanPrice = Number(editPrice.replace(/[^0-9]/g, '')) || 0;
    const updates = {
      title: editTitle.trim(),
      price: cleanPrice,
      description: editDescription.trim()
    };
    updateAd(editingAd.id, updates);
    setLocalAds((prev) =>
      prev.map((item) =>
        item.id === editingAd.id
          ? {
              ...item,
              ...updates
            }
          : item
      )
    );
    const targetId = editingAd.id;
    setEditingAd(null);
    await updateProductApi(targetId, updates).catch(() => {});
    Alert.alert('Listing Updated', 'Your changes have been saved.');
  };

  // Status Badge Helper
  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return { label: 'ACTIVE', color: '#16A34A', bg: 'rgba(22, 163, 74, 0.1)' };
      case 'under review':
        return { label: 'UNDER REVIEW', color: '#EA580C', bg: 'rgba(234, 88, 12, 0.1)' };
      case 'sold':
        return { label: 'SOLD', color: '#64748B', bg: 'rgba(100, 116, 139, 0.1)' };
      case 'paused':
        return { label: 'PAUSED', color: '#D97706', bg: 'rgba(217, 119, 6, 0.1)' };
      default:
        return { label: 'ACTIVE', color: '#16A34A', bg: 'rgba(22, 163, 74, 0.1)' };
    }
  };

  if (!isAuthenticated) {
    return (
      <ScreenContainer noPadding style={styles.screen}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <View style={styles.topHeader}>
          <Text style={styles.headerTitle}>My Ads</Text>
        </View>
        <AuthRequiredState
          title="Login to View Your Ads"
          message="Track buyer interest, edit prices, boost listings, and manage your posted items."
        />
      </ScreenContainer>
    );
  }

  // Geometric Vector Illustration for Empty State matching media_1791317820347.png
  const renderEmptyIllustration = () => (
    <View style={styles.illustrationWrap}>
      {/* 1. Yellow House Body + Blue Roof */}
      <View style={styles.houseGraphicWrap}>
        {/* Blue Roof Triangle */}
        <View style={styles.blueRoofTriangle} />
        {/* Yellow House Block */}
        <View style={styles.yellowHouseBlock}>
          {/* Circular Window */}
          <View style={styles.houseWindowCircle} />
        </View>
      </View>

      {/* 2. Yellow Tag / Package on right */}
      <View style={styles.yellowTagShape} />

      {/* 3. Blue Bicycle with two circular wheels */}
      <View style={styles.bicycleGraphicWrap}>
        {/* Left Wheel */}
        <View style={styles.bikeWheelLeft}>
          <View style={styles.bikeWheelHole} />
        </View>
        {/* Blue Frame Bars */}
        <View style={styles.bikeFrameBar1} />
        <View style={styles.bikeFrameBar2} />
        {/* Right Wheel */}
        <View style={styles.bikeWheelRight}>
          <View style={styles.bikeWheelHole} />
        </View>
      </View>

      {/* 4. Coral/Red Ball Circle at bottom */}
      <View style={styles.coralBallCircle} />
    </View>
  );

  return (
    <ScreenContainer noPadding style={styles.screen}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header: "My Ads" */}
      <View style={[styles.topHeader, { paddingTop: Math.max(insets.top, 14) }]}>
        <Text style={styles.headerTitle}>My Ads</Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#002F34']} />}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Top Promo Card ("Want to sell more?") matching screenshot */}
        <View style={styles.promoCard}>
          <View style={styles.promoCardTopRow}>
            {/* Tag Icon Badge */}
            <View style={styles.tagIconCircle}>
              <MaterialCommunityIcons name="tag-text-outline" size={26} color="#0078FF" />
              <View style={styles.exclamationDot}>
                <Text style={styles.exclamationDotText}>!</Text>
              </View>
            </View>

            {/* Texts */}
            <View style={styles.promoTextCol}>
              <Text style={styles.promoHeading}>Want to sell more?</Text>
              <Text style={styles.promoSubtext}>
                Post more Ads for less. Packages that help you save money.
              </Text>
            </View>
          </View>

          {/* Show me packages Button */}
          <TouchableOpacity
            style={styles.showPackagesBtn}
            onPress={() => setShowPackagesModal(true)}
            activeOpacity={0.85}
          >
            <Text style={styles.showPackagesBtnText}>Show me packages</Text>
          </TouchableOpacity>
        </View>

        {/* If user has ads, show Tabs */}
        {combinedAds.length > 0 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.tabsScroll}
          >
            {TABS.map((tab) => {
              const count =
                tab === 'All'
                  ? combinedAds.length
                  : combinedAds.filter((a) => (a.status || '').toLowerCase() === tab.toLowerCase()).length;
              const isSelected = activeTab === tab;
              return (
                <TouchableOpacity
                  key={tab}
                  style={[styles.tabPill, isSelected && styles.tabPillActive]}
                  onPress={() => setActiveTab(tab)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.tabPillText, isSelected && styles.tabPillTextActive]}>
                    {tab}
                  </Text>
                  <View style={[styles.tabBadge, isSelected && styles.tabBadgeActive]}>
                    <Text style={[styles.tabBadgeText, isSelected && styles.tabBadgeTextActive]}>
                      {count}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        )}

        {/* Content Section: Empty State OR Ads List */}
        {visibleListings.length === 0 ? (
          /* Empty State matching media_1791317820347.png */
          <View style={styles.emptyStateSection}>
            {renderEmptyIllustration()}

            <Text style={styles.emptyTitle}>You haven't listed anything yet</Text>
            <Text style={styles.emptySubtitle}>Let go of what you don't use anymore</Text>

            <TouchableOpacity
              style={styles.postActionButton}
              onPress={() => navigation.navigate('Sell')}
              activeOpacity={0.85}
            >
              <Text style={styles.postActionButtonText}>Post</Text>
            </TouchableOpacity>
          </View>
        ) : (
          /* User Ads List */
          <View style={styles.adsListContainer}>
            {visibleListings.map((item) => {
              const badge = getStatusBadge(item.status);
              return (
                <View key={item.id} style={styles.adItemCard}>
                  <View style={styles.adItemTop}>
                    {item.imageUrl ? (
                      <Image source={{ uri: item.imageUrl }} style={styles.adThumb} />
                    ) : (
                      <View style={styles.adThumbPlaceholder}>
                        <Ionicons name="image-outline" size={24} color="#8E8E93" />
                      </View>
                    )}

                    <View style={styles.adItemDetails}>
                      <View style={[styles.statusBadge, { backgroundColor: badge.bg }]}>
                        <Text style={[styles.statusBadgeText, { color: badge.color }]}>
                          {badge.label}
                        </Text>
                      </View>
                      <Text style={styles.adItemTitle} numberOfLines={2}>
                        {item.title}
                      </Text>
                      <Text style={styles.adItemPrice}>
                        {currencySymbol}{Number(item.price).toLocaleString()}
                      </Text>
                      <Text style={styles.adItemCategory}>
                        {item.category} {item.subcategory ? `• ${item.subcategory}` : ''}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.adItemActions}>
                    <TouchableOpacity
                      style={styles.actionBtn}
                      onPress={() => openEditModal(item)}
                    >
                      <Ionicons name="pencil" size={14} color="#0078FF" />
                      <Text style={[styles.actionBtnText, { color: '#0078FF' }]}>Edit</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.actionBtn}
                      onPress={() =>
                        handleToggleStatus(
                          item,
                          item.status === 'Active' ? 'Paused' : 'Active'
                        )
                      }
                    >
                      <Ionicons
                        name={item.status === 'Active' ? 'pause-circle' : 'play-circle'}
                        size={14}
                        color="#002F34"
                      />
                      <Text style={styles.actionBtnText}>
                        {item.status === 'Active' ? 'Pause' : 'Activate'}
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.actionBtn}
                      onPress={() => handleDeletePrompt(item)}
                    >
                      <Ionicons name="trash-outline" size={14} color="#EF4444" />
                      <Text style={[styles.actionBtnText, { color: '#EF4444' }]}>Delete</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>

      {/* Packages Modal */}
      {showPackagesModal && (
        <Modal
          visible={showPackagesModal}
          transparent
          animationType="fade"
          onRequestClose={() => setShowPackagesModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Seller Growth Packages</Text>
                <TouchableOpacity onPress={() => setShowPackagesModal(false)}>
                  <Ionicons name="close" size={22} color="#002F34" />
                </TouchableOpacity>
              </View>

              <Text style={styles.modalDesc}>
                Boost your listings with priority placement to sell up to 5x faster.
              </Text>

              <ScrollView style={{ maxHeight: 320 }}>
                {PACKAGES.map((pkg) => (
                  <View key={pkg.id} style={styles.pkgRow}>
                    <View style={styles.pkgTop}>
                      <Text style={styles.pkgName}>{pkg.name}</Text>
                      <Text style={styles.pkgPrice}>
                        {pkg.price === 0 ? 'Free' : `${currencySymbol}${pkg.price}`}
                      </Text>
                    </View>
                    {pkg.perks.map((p, idx) => (
                      <View key={idx} style={styles.pkgPerk}>
                        <Ionicons name="checkmark-circle" size={15} color="#16A34A" />
                        <Text style={styles.pkgPerkText}>{p}</Text>
                      </View>
                    ))}
                  </View>
                ))}
              </ScrollView>

              <TouchableOpacity
                style={styles.modalActionBtn}
                onPress={() => {
                  setShowPackagesModal(false);
                  Alert.alert('Packages', 'Selected package preference saved.');
                }}
              >
                <Text style={styles.modalActionBtnText}>Got it</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}

      {/* Edit Listing Modal */}
      {editingAd && (
        <Modal
          visible={!!editingAd}
          transparent
          animationType="slide"
          onRequestClose={() => setEditingAd(null)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Edit Ad Details</Text>
                <TouchableOpacity onPress={() => setEditingAd(null)}>
                  <Ionicons name="close" size={22} color="#002F34" />
                </TouchableOpacity>
              </View>

              <Text style={styles.inputLabel}>Ad Title</Text>
              <TextInput
                style={styles.inputField}
                value={editTitle}
                onChangeText={setEditTitle}
                placeholder="Title"
              />

              <Text style={styles.inputLabel}>Price ({currencySymbol})</Text>
              <TextInput
                style={styles.inputField}
                value={editPrice}
                onChangeText={(t) => setEditPrice(t.replace(/[^0-9]/g, ''))}
                keyboardType="numeric"
                placeholder="Price"
              />

              <Text style={styles.inputLabel}>Description</Text>
              <TextInput
                style={[styles.inputField, { height: 75, textAlignVertical: 'top' }]}
                value={editDescription}
                onChangeText={setEditDescription}
                placeholder="Description"
                multiline
              />

              <View style={styles.modalButtonsRow}>
                <TouchableOpacity
                  style={[styles.modalBtn, styles.cancelBtn]}
                  onPress={() => setEditingAd(null)}
                >
                  <Text style={styles.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalBtn, styles.saveBtn]}
                  onPress={handleSaveEdit}
                >
                  <Text style={styles.saveBtnText}>Save</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  topHeader: {
    paddingHorizontal: 16,
    paddingBottom: 14,
    backgroundColor: '#FFFFFF',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#002F34',
  },
  scrollContent: {
    paddingBottom: 60,
  },
  // Top Promo Box ("Want to sell more?")
  promoCard: {
    marginHorizontal: 16,
    marginTop: 4,
    marginBottom: 16,
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 16,
  },
  promoCardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tagIconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#D8E8FC',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  exclamationDot: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  exclamationDotText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  promoTextCol: {
    flex: 1,
    marginLeft: 14,
  },
  promoHeading: {
    fontSize: 16,
    fontWeight: '700',
    color: '#002F34',
    marginBottom: 4,
  },
  promoSubtext: {
    fontSize: 13,
    color: '#4A5568',
    lineHeight: 18,
  },
  showPackagesBtn: {
    backgroundColor: '#002F34',
    borderRadius: 6,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 14,
  },
  showPackagesBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  // Tabs
  tabsScroll: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 8,
  },
  tabPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    gap: 6,
  },
  tabPillActive: {
    backgroundColor: '#002F34',
  },
  tabPillText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
  },
  tabPillTextActive: {
    color: '#FFFFFF',
  },
  tabBadge: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 10,
    backgroundColor: '#E2E8F0',
  },
  tabBadgeActive: {
    backgroundColor: 'rgba(255,255,255,0.25)',
  },
  tabBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
  },
  tabBadgeTextActive: {
    color: '#FFFFFF',
  },
  // Empty State Section matching media_1791317820347.png
  emptyStateSection: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 36,
    paddingBottom: 30,
  },
  // Geometric Vector Graphic
  illustrationWrap: {
    width: 170,
    height: 160,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  houseGraphicWrap: {
    position: 'absolute',
    top: 6,
    left: 48,
    alignItems: 'center',
  },
  blueRoofTriangle: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 24,
    borderRightWidth: 24,
    borderBottomWidth: 24,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: '#004085',
  },
  yellowHouseBlock: {
    width: 44,
    height: 38,
    backgroundColor: '#F5C518',
    alignItems: 'center',
    justifyContent: 'center',
  },
  houseWindowCircle: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#004085',
  },
  yellowTagShape: {
    position: 'absolute',
    top: 24,
    right: 20,
    width: 52,
    height: 64,
    backgroundColor: '#FFD700',
    transform: [{ rotate: '18deg' }],
    borderRadius: 4,
    opacity: 0.95,
  },
  bicycleGraphicWrap: {
    position: 'absolute',
    bottom: 24,
    width: 130,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bikeWheelLeft: {
    position: 'absolute',
    bottom: 0,
    left: 4,
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 10,
    borderColor: '#004085',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bikeWheelRight: {
    position: 'absolute',
    bottom: 0,
    right: 4,
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 10,
    borderColor: '#004085',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bikeWheelHole: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
  },
  bikeFrameBar1: {
    position: 'absolute',
    width: 50,
    height: 7,
    backgroundColor: '#0078FF',
    transform: [{ rotate: '-32deg' }],
    top: 20,
    left: 36,
  },
  bikeFrameBar2: {
    position: 'absolute',
    width: 50,
    height: 7,
    backgroundColor: '#0078FF',
    transform: [{ rotate: '32deg' }],
    top: 20,
    right: 36,
  },
  coralBallCircle: {
    position: 'absolute',
    bottom: 12,
    left: 28,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#FF5E5E',
  },
  // Empty State Typography & Post Button
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#002F34',
    textAlign: 'center',
    marginTop: 22,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 6,
    marginBottom: 24,
  },
  postActionButton: {
    backgroundColor: '#002F34',
    borderRadius: 6,
    paddingVertical: 13,
    width: '80%',
    alignItems: 'center',
  },
  postActionButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  // Ads List when active
  adsListContainer: {
    paddingHorizontal: 16,
    gap: 12,
  },
  adItemCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 12,
  },
  adItemTop: {
    flexDirection: 'row',
    gap: 12,
  },
  adThumb: {
    width: 84,
    height: 84,
    borderRadius: 6,
    backgroundColor: '#090D16',
  },
  adThumbPlaceholder: {
    width: 84,
    height: 84,
    borderRadius: 6,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  adItemDetails: {
    flex: 1,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginBottom: 4,
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  adItemTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#002F34',
    lineHeight: 18,
  },
  adItemPrice: {
    fontSize: 15,
    fontWeight: '700',
    color: '#002F34',
    marginTop: 3,
  },
  adItemCategory: {
    fontSize: 11.5,
    color: '#64748B',
    marginTop: 2,
  },
  adItemActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    marginTop: 10,
    paddingTop: 8,
    gap: 14,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  actionBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#002F34',
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#002F34',
  },
  modalDesc: {
    fontSize: 13,
    color: '#64748B',
    lineHeight: 18,
    marginBottom: 14,
  },
  pkgRow: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
  },
  pkgTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  pkgName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#002F34',
  },
  pkgPrice: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0078FF',
  },
  pkgPerk: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 3,
  },
  pkgPerkText: {
    fontSize: 12,
    color: '#475569',
  },
  modalActionBtn: {
    backgroundColor: '#002F34',
    paddingVertical: 12,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 14,
  },
  modalActionBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
    marginTop: 8,
    marginBottom: 4,
  },
  inputField: {
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 13,
    color: '#002F34',
  },
  modalButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 16,
  },
  modalBtn: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
  },
  cancelBtn: {
    backgroundColor: '#F1F5F9',
  },
  cancelBtnText: {
    color: '#475569',
    fontWeight: '600',
    fontSize: 13,
  },
  saveBtn: {
    backgroundColor: '#002F34',
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
});
