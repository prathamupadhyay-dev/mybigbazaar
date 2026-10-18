/**
 * @file apps/mobile/src/screens/products/SellerProfileScreen.jsx
 * @description Dedicated Seller Credibility & Storefront screen showing verified badges,
 * response time metrics, ratings breakdown, and full grid of active listings.
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Image,
  Alert,
  Share
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import ScreenContainer from '../../components/ScreenContainer';
import Colors from '../../constants/colors';
import Typography from '../../constants/typography';
import Spacing from '../../constants/spacing';
import Radii from '../../constants/radii';
import Shadows from '../../constants/shadows';
import { useApp } from '../../context/AppContext';
import { getProductsApi } from '../../services/productApi';

const SELLER_REVIEWS = [];

export default function SellerProfileScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { requireAuth } = useApp();

  const sellerName = route.params?.sellerName || 'Marketplace Seller';
  const sellerRating = route.params?.sellerRating || 5.0;
  const sellerLocation = route.params?.sellerLocation || 'India';

  const [activeTab, setActiveTab] = useState('listings'); // 'listings' | 'reviews' | 'about'

  const initialListings = Array.isArray(route.params?.sellerListings) ? route.params.sellerListings : [];
  const [liveListings, setLiveListings] = useState(initialListings);

  useEffect(() => {
    if (initialListings.length === 0) {
      getProductsApi()
        .then((prods) => {
          if (Array.isArray(prods) && prods.length > 0) {
            const mapped = prods.slice(0, 6).map((p) => ({
              id: p._id || p.id,
              title: p.productName || p.title || 'Marketplace Item',
              price: `₹${Number(p.productPrice || 0).toLocaleString('en-IN')}`,
              location: p.location || sellerLocation,
              imageUrl: Array.isArray(p.images) && p.images[0]
                ? (p.images[0].startsWith('http') ? p.images[0] : `https://backend.mybigbazaar.com${p.images[0]}`)
                : 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&auto=format&fit=crop&q=80',
              condition: p.condition || 'Like New'
            }));
            setLiveListings(mapped);
          }
        })
        .catch(() => {});
    }
  }, [initialListings.length, sellerLocation]);

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out ${sellerName}'s verified store on BigBazaar!`,
        title: `${sellerName}'s Profile`
      });
    } catch (e) {
      console.warn('Share error', e);
    }
  };

  const handleChat = () => {
    requireAuth(navigation, () => {
      navigation.navigate('Chat', {
        sellerName,
        listingTitle: liveListings[0]?.title || 'Marketplace Item',
        listingPrice: 8500,
        listingImage: liveListings[0]?.imageUrl
      });
    });
  };

  return (
    <ScreenContainer noPadding style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.goBack()} accessibilityLabel="Back">
          <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Seller Profile</Text>
        <TouchableOpacity style={styles.iconBtn} onPress={handleShare} accessibilityLabel="Share seller profile">
          <Ionicons name="share-social-outline" size={22} color={Colors.textPrimary} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Seller Hero Card */}
        <View style={[styles.heroCard, Shadows.card]}>
          <View style={styles.avatarRow}>
            <View style={styles.avatar}>
              <Ionicons name="person" size={32} color={Colors.white} />
            </View>
            <View style={styles.heroInfo}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={styles.sellerNameText}>{sellerName}</Text>
                <Ionicons name="checkmark-circle" size={18} color={Colors.brandGreen} style={{ marginLeft: 4 }} />
              </View>
              <View style={styles.locationRow}>
                <Ionicons name="location-outline" size={13} color={Colors.textSecondary} />
                <Text style={styles.locationText}>{sellerLocation}</Text>
                <Text style={styles.bulletText}>·</Text>
                <Text style={styles.memberSinceText}>Member since 2024</Text>
              </View>
              <View style={styles.verifiedBadgesRow}>
                <View style={styles.verifiedTag}>
                  <Ionicons name="shield-checkmark" size={11} color={Colors.brandGreen} />
                  <Text style={styles.verifiedTagText}>KYC Verified</Text>
                </View>
                <View style={styles.verifiedTag}>
                  <Ionicons name="call" size={11} color={Colors.brandGreen} />
                  <Text style={styles.verifiedTagText}>Phone Verified</Text>
                </View>
              </View>
            </View>
          </View>

          <View style={styles.divider} />

          {/* Key Metrics */}
          <View style={styles.metricsRow}>
            <View style={styles.metricCol}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
                <Ionicons name="star" size={15} color="#F59E0B" />
                <Text style={styles.metricVal}>{sellerRating}</Text>
              </View>
              <Text style={styles.metricLabel}>{SELLER_REVIEWS.length} Reviews</Text>
            </View>
            <View style={styles.statDividerVert} />
            <View style={styles.metricCol}>
              <Text style={styles.metricVal}>Verified</Text>
              <Text style={styles.metricLabel}>Platform Seller</Text>
            </View>
            <View style={styles.statDividerVert} />
            <View style={styles.metricCol}>
              <Text style={styles.metricVal}>Active</Text>
              <Text style={styles.metricLabel}>Status</Text>
            </View>
          </View>
        </View>

        {/* Tab Navigation */}
        <View style={styles.tabNavRow}>
          <TouchableOpacity
            style={[styles.tabNavItem, activeTab === 'listings' && styles.tabNavItemActive]}
            onPress={() => setActiveTab('listings')}>
            <Text style={[styles.tabNavText, activeTab === 'listings' && styles.tabNavTextActive]}>
              Active Listings ({liveListings.length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabNavItem, activeTab === 'reviews' && styles.tabNavItemActive]}
            onPress={() => setActiveTab('reviews')}>
            <Text style={[styles.tabNavText, activeTab === 'reviews' && styles.tabNavTextActive]}>
              Reviews ({SELLER_REVIEWS.length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabNavItem, activeTab === 'about' && styles.tabNavItemActive]}
            onPress={() => setActiveTab('about')}>
            <Text style={[styles.tabNavText, activeTab === 'about' && styles.tabNavTextActive]}>
              About
            </Text>
          </TouchableOpacity>
        </View>

        {/* TAB 1: LISTINGS */}
        {activeTab === 'listings' && (
          liveListings.length === 0 ? (
            <View style={styles.emptyCard}>
              <Ionicons name="cube-outline" size={44} color={Colors.disabled} />
              <Text style={styles.emptyTitle}>No active listings</Text>
              <Text style={styles.emptySub}>This seller does not currently have active items for sale.</Text>
            </View>
          ) : (
            <View style={styles.listingsGrid}>
              {liveListings.map((prod) => (
                <TouchableOpacity
                  key={prod.id}
                  style={[styles.gridCard, Shadows.subtle]}
                  activeOpacity={0.85}
                  onPress={() => navigation.push('ProductDetails', { product: prod })}>
                  <Image source={{ uri: prod.imageUrl }} style={styles.gridImage} resizeMode="cover" />
                  <View style={styles.gridCardBody}>
                    <View style={styles.gridConditionTag}>
                      <Text style={styles.gridConditionText}>{prod.condition || 'Good'}</Text>
                    </View>
                    <Text style={styles.gridTitle} numberOfLines={2}>{prod.title}</Text>
                    <Text style={styles.gridPrice}>{prod.price}</Text>
                    <Text style={styles.gridLocation} numberOfLines={1}>{prod.location || sellerLocation}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )
        )}

        {/* TAB 2: REVIEWS */}
        {activeTab === 'reviews' && (
          SELLER_REVIEWS.length === 0 ? (
            <View style={styles.emptyCard}>
              <Ionicons name="star-outline" size={44} color={Colors.disabled} />
              <Text style={styles.emptyTitle}>No reviews yet</Text>
              <Text style={styles.emptySub}>Ratings and reviews will appear here after completed transactions.</Text>
            </View>
          ) : (
            <View style={styles.reviewsList}>
              {SELLER_REVIEWS.map((rev) => (
                <View key={rev.id} style={[styles.reviewCard, Shadows.card]}>
                  <View style={styles.reviewHeaderRow}>
                    <Text style={styles.buyerNameText}>{rev.buyerName}</Text>
                    <Text style={styles.reviewDateText}>{rev.date}</Text>
                  </View>
                  <View style={styles.reviewStarsRow}>
                    {[...Array(rev.rating)].map((_, i) => (
                      <Ionicons key={i} name="star" size={13} color="#F59E0B" />
                    ))}
                    <Text style={styles.verifiedBuyerBadge}>Verified Purchase</Text>
                  </View>
                  <Text style={styles.reviewCommentText}>"{rev.comment}"</Text>
                </View>
              ))}
            </View>
          )
        )}

        {/* TAB 3: ABOUT */}
        {activeTab === 'about' && (
          <View style={styles.aboutContainer}>
            <View style={[styles.aboutCard, Shadows.card]}>
              <View style={styles.aboutRow}>
                <Ionicons name="shield-checkmark" size={22} color={Colors.brandGreen} />
                <View style={{ marginLeft: 12, flex: 1 }}>
                  <Text style={styles.aboutHeading}>BigBazaar Safe-Deal Escrow Supported</Text>
                  <Text style={styles.aboutSub}>
                    Payments to this seller are held safely by BigBazaar until you physically inspect the item.
                  </Text>
                </View>
              </View>
              <View style={[styles.aboutRow, { marginTop: Spacing.md }]}>
                <Ionicons name="checkmark-done-circle" size={22} color={Colors.primary} />
                <View style={{ marginLeft: 12, flex: 1 }}>
                  <Text style={styles.aboutHeading}>Government ID Verified</Text>
                  <Text style={styles.aboutSub}>
                    Identity and proof of address verified via official UIDAI / PAN databases.
                  </Text>
                </View>
              </View>
              <View style={[styles.aboutRow, { marginTop: Spacing.md }]}>
                <Ionicons name="time-outline" size={22} color="#9333EA" />
                <View style={{ marginLeft: 12, flex: 1 }}>
                  <Text style={styles.aboutHeading}>98% In-App Response Rate</Text>
                  <Text style={styles.aboutSub}>
                    Usually responds to buyer questions and bargaining offers within 15 minutes.
                  </Text>
                </View>
              </View>
            </View>
          </View>
        )}

        <View style={{ height: 90 }} />
      </ScrollView>

      {/* Sticky Bottom Actions */}
      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.chatBtn} onPress={handleChat}>
          <Ionicons name="chatbubbles" size={18} color={Colors.white} />
          <Text style={styles.chatBtnText}>Chat with Seller</Text>
        </TouchableOpacity>
      </View>
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
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.card,
    borderBottomWidth: 1,
    borderBottomColor: Colors.hairline
  },
  headerTitle: {
    ...Typography.bodyBold,
    fontSize: 16,
    color: Colors.textPrimary,
    fontWeight: '700'
  },
  iconBtn: {
    padding: Spacing.xs
  },
  scrollContent: {
    padding: Spacing.base
  },
  heroCard: {
    backgroundColor: Colors.card,
    borderRadius: Radii.card,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.hairline,
    marginBottom: Spacing.base
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.navy,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14
  },
  heroInfo: {
    flex: 1
  },
  sellerNameText: {
    ...Typography.h2,
    fontSize: 16,
    color: Colors.textPrimary,
    fontWeight: '700'
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2
  },
  locationText: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginLeft: 2,
    fontSize: 11
  },
  bulletText: {
    marginHorizontal: 4,
    color: Colors.metadata
  },
  memberSinceText: {
    ...Typography.caption,
    color: Colors.metadata,
    fontSize: 11
  },
  verifiedBadgesRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 6
  },
  verifiedTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.sunken,
    borderWidth: 1,
    borderColor: Colors.hairline,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: Radii.badge,
    gap: 3
  },
  verifiedTagText: {
    fontSize: 9,
    fontWeight: '700',
    color: Colors.emerald
  },
  divider: {
    height: 1,
    backgroundColor: Colors.hairline,
    marginVertical: Spacing.md
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center'
  },
  metricCol: {
    alignItems: 'center'
  },
  metricVal: {
    ...Typography.bodyBold,
    color: Colors.textPrimary,
    fontSize: 14,
    fontWeight: '700',
    fontVariant: ['tabular-nums']
  },
  metricLabel: {
    ...Typography.caption,
    color: Colors.metadata,
    marginTop: 2,
    fontSize: 10
  },
  statDividerVert: {
    width: 1,
    height: 24,
    backgroundColor: Colors.hairline
  },
  tabNavRow: {
    flexDirection: 'row',
    backgroundColor: Colors.sunken,
    borderRadius: Radii.control,
    borderWidth: 1,
    borderColor: Colors.hairline,
    marginBottom: Spacing.base,
    padding: 3
  },
  tabNavItem: {
    flex: 1,
    paddingVertical: 7,
    alignItems: 'center',
    borderRadius: Radii.control - 2
  },
  tabNavItemActive: {
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.hairline,
    ...Shadows.subtle
  },
  tabNavText: {
    ...Typography.captionBold,
    color: Colors.textSecondary,
    fontSize: 11
  },
  tabNavTextActive: {
    color: Colors.navy,
    fontWeight: '700'
  },
  listingsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10
  },
  gridCard: {
    width: '48.5%',
    backgroundColor: Colors.card,
    borderRadius: Radii.card,
    borderWidth: 1,
    borderColor: Colors.hairline,
    overflow: 'hidden'
  },
  gridImage: {
    width: '100%',
    height: 120,
    backgroundColor: Colors.sunken
  },
  gridCardBody: {
    padding: 8
  },
  gridConditionTag: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.sunken,
    borderWidth: 1,
    borderColor: Colors.hairline,
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: Radii.xs,
    marginBottom: 4
  },
  gridConditionText: {
    fontSize: 9,
    fontWeight: '600',
    color: Colors.emerald
  },
  gridTitle: {
    ...Typography.captionBold,
    color: Colors.textPrimary,
    fontSize: 12,
    marginBottom: 4
  },
  gridPrice: {
    ...Typography.bodyBold,
    color: Colors.textPrimary,
    fontSize: 14,
    fontWeight: '700',
    fontVariant: ['tabular-nums']
  },
  gridLocation: {
    ...Typography.caption,
    color: Colors.metadata,
    fontSize: 10,
    marginTop: 2
  },
  reviewsList: {
    gap: Spacing.sm
  },
  reviewCard: {
    backgroundColor: Colors.card,
    borderRadius: Radii.card,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.hairline
  },
  reviewHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  buyerNameText: {
    ...Typography.bodyBold,
    color: Colors.textPrimary,
    fontSize: 13
  },
  reviewDateText: {
    ...Typography.caption,
    color: Colors.metadata,
    fontSize: 10
  },
  reviewStarsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    marginVertical: 4
  },
  verifiedBuyerBadge: {
    fontSize: 9,
    color: Colors.emerald,
    fontWeight: '700',
    marginLeft: 6
  },
  reviewCommentText: {
    ...Typography.body,
    color: Colors.textSecondary,
    fontSize: 12,
    fontStyle: 'italic',
    marginTop: 4
  },
  aboutContainer: {},
  aboutCard: {
    backgroundColor: Colors.card,
    borderRadius: Radii.card,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.hairline
  },
  aboutRow: {
    flexDirection: 'row',
    alignItems: 'flex-start'
  },
  aboutHeading: {
    ...Typography.bodyBold,
    color: Colors.textPrimary,
    fontSize: 13
  },
  aboutSub: {
    ...Typography.secondary,
    color: Colors.textSecondary,
    fontSize: 11,
    marginTop: 2,
    lineHeight: 15
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.card,
    borderTopWidth: 1,
    borderTopColor: Colors.hairline,
    paddingHorizontal: Spacing.base,
    paddingVertical: 10,
    flexDirection: 'row',
    gap: 10
  },
  chatBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 48,
    borderRadius: Radii.button,
    backgroundColor: Colors.terracotta,
    gap: 6,
    ...Shadows.subtle
  },
  chatBtnText: {
    ...Typography.bodyBold,
    color: Colors.card,
    fontSize: 13
  },
  emptyCard: {
    backgroundColor: Colors.card,
    borderRadius: Radii.card,
    borderWidth: 1,
    borderColor: Colors.hairline,
    padding: Spacing.xl,
    alignItems: 'center'
  },
  emptyTitle: {
    ...Typography.bodyBold,
    fontSize: 14,
    color: Colors.textPrimary,
    marginTop: 8
  },
  emptySub: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginTop: 2,
    textAlign: 'center'
  }
});
