/**
 * @file apps/mobile/src/screens/chat/ChatsScreen.jsx
 * @description Dynamic OLX-style Chats screen with BUYING and SELLING tabs,
 * quick filters (All, Unread, Important, With Offers), live backend synchronization,
 * offer status badges, and instant navigation to live conversation threads.
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  RefreshControl,
  StatusBar as RNStatusBar,
} from 'react-native';
import { StatusBar as ExpoStatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useApp } from '../../context/AppContext';
import { formatCurrency } from '../../utils/formatters';
import ScreenContainer from '../../components/ScreenContainer';
import { apiGet, apiPatch, apiDelete } from '../../services/apiClient';

const QUICK_FILTERS = ['All', 'Unread', 'Important', 'With Offers'];

export const MagnifyingPersonIllustration = () => {
  return (
    <View style={illustStyles.container}>
      <View style={illustStyles.hairBun} />
      <View style={illustStyles.hairBase} />
      <View style={illustStyles.faceCircle}>
        <View style={illustStyles.eyeDot} />
      </View>
      <View style={illustStyles.torso} />
      <View style={illustStyles.yellowAccent} />
      <View style={illustStyles.glassRim}>
        <View style={illustStyles.glassPupil} />
      </View>
      <View style={illustStyles.glassHandle} />
    </View>
  );
};

const illustStyles = StyleSheet.create({
  container: {
    width: 140,
    height: 150,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginVertical: 10,
  },
  hairBun: {
    position: 'absolute',
    top: 6,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#004796',
    zIndex: 1,
  },
  hairBase: {
    position: 'absolute',
    top: 20,
    width: 70,
    height: 60,
    borderRadius: 35,
    backgroundColor: '#004796',
    zIndex: 2,
  },
  faceCircle: {
    position: 'absolute',
    top: 34,
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#FFB800',
    zIndex: 3,
    justifyContent: 'center',
  },
  eyeDot: {
    position: 'absolute',
    left: 17,
    top: 23,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#004796',
  },
  torso: {
    position: 'absolute',
    top: 86,
    width: 90,
    height: 52,
    borderTopLeftRadius: 45,
    borderTopRightRadius: 45,
    backgroundColor: '#004796',
    zIndex: 4,
  },
  yellowAccent: {
    position: 'absolute',
    top: 102,
    right: 22,
    width: 26,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FFB800',
    zIndex: 5,
  },
  glassRim: {
    position: 'absolute',
    top: 40,
    right: 18,
    width: 54,
    height: 54,
    borderRadius: 27,
    borderWidth: 9,
    borderColor: '#E6C687',
    backgroundColor: '#FFFFFF',
    zIndex: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  glassPupil: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#004796',
  },
  glassHandle: {
    position: 'absolute',
    top: 84,
    right: 18,
    width: 13,
    height: 28,
    borderRadius: 6,
    backgroundColor: '#FFB800',
    transform: [{ rotate: '-35deg' }],
    zIndex: 5,
  },
});

export default function ChatsScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { user } = useApp();

  // Active top mode: 'BUYING' | 'SELLING'
  const [activeTab, setActiveTab] = useState('BUYING');

  // Active filter chip: 'All' | 'Unread' | 'Important' | 'With Offers'
  const [activeFilter, setActiveFilter] = useState('All');

  // User conversations list
  const [conversations, setConversations] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchConversations = useCallback(async () => {
    try {
      const queryParams = [];
      if (user?._id || user?.id) queryParams.push(`userId=${encodeURIComponent(user._id || user.id)}`);
      if (user?.phone || user?.phoneNumber) queryParams.push(`phone=${encodeURIComponent(user.phone || user.phoneNumber)}`);
      const qs = queryParams.length > 0 ? `?${queryParams.join('&')}` : '';

      const res = await apiGet(`/api/v1/chat/conversations${qs}`);
      const list = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];

      const mapped = list.map((c) => {
        const isUserSeller = Boolean(c.isSeller);
        const partnerName =
          c.otherParticipant?.fullName ||
          (isUserSeller ? c.buyerName : c.sellerName) ||
          (isUserSeller ? 'Verified Buyer' : 'Verified Seller');

        const listingImg =
          c.listingImage ||
          (Array.isArray(c.listingId?.images) && c.listingId.images[0]) ||
          null;

        const offerStatus = c.lastMessage?.offerStatus || null;
        const offerAmount = c.lastMessage?.offerAmount || null;

        return {
          id: String(c._id || c.id),
          partnerName,
          buyerName: c.buyerName || 'Aarav Sharma',
          sellerName: c.sellerName || partnerName,
          sellerId: c.sellerId?._id || c.sellerId || '',
          buyerId: c.buyerId?._id || c.buyerId || '',
          time: c.updatedAt
            ? new Date(c.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            : 'Recent',
          listingRefId: String(c.listingRefId || c.listingId?._id || c.listingId || ''),
          listingTitle: c.listingTitle || c.listingId?.title || c.listingId?.productName || 'Classified Listing',
          listingPrice: Number(c.listingPrice || c.listingId?.price || c.listingId?.productPrice || 0),
          listingImage: listingImg,
          listingCategory: c.listingCategory || c.listingId?.categoryName || 'Classifieds',
          listingLocation: c.listingLocation || 'Indore, MP',
          lastMessage: c.lastMessage?.text || 'Tap to view conversation',
          lastMessageType: c.lastMessage?.messageType || 'text',
          offerStatus,
          offerAmount,
          unread: Boolean(c.unreadCount > 0),
          unreadCount: Number(c.unreadCount || 0),
          isSeller: isUserSeller,
          important: Boolean(c.important),
          status: c.status || 'active'
        };
      });

      setConversations(mapped);
    } catch (err) {
      // Retain offline tolerance
    } finally {
      setRefreshing(false);
    }
  }, [user]);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  useFocusEffect(
    useCallback(() => {
      fetchConversations();
    }, [fetchConversations])
  );

  const buyingCount = useMemo(
    () => conversations.filter((c) => !c.isSeller).length,
    [conversations]
  );
  const sellingCount = useMemo(
    () => conversations.filter((c) => c.isSeller).length,
    [conversations]
  );

  const filteredConversations = useMemo(() => {
    return conversations.filter((item) => {
      if (activeTab === 'BUYING' && item.isSeller) return false;
      if (activeTab === 'SELLING' && !item.isSeller) return false;

      if (activeFilter === 'Unread' && !item.unread) return false;
      if (activeFilter === 'Important' && !item.important) return false;
      if (
        activeFilter === 'With Offers' &&
        item.lastMessageType !== 'offer' &&
        !item.offerStatus
      ) {
        return false;
      }

      return true;
    });
  }, [conversations, activeTab, activeFilter]);

  const handleToggleImportant = async (chatId) => {
    const target = conversations.find((c) => c.id === chatId);
    const nextImportant = !target?.important;
    setConversations((prev) =>
      prev.map((c) => (c.id === chatId ? { ...c, important: nextImportant } : c))
    );
    try {
      await apiPatch(`/api/v1/chat/admin/conversations/${chatId}`, { important: nextImportant });
    } catch {}
  };

  const handleDeleteConversation = (chatId) => {
    Alert.alert('Delete Chat', 'Are you sure you want to remove this conversation?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          setConversations((prev) => prev.filter((c) => c.id !== chatId));
          try {
            await apiDelete(`/api/v1/chat/admin/conversations/${chatId}`);
          } catch {}
        },
      },
    ]);
  };

  const getEmptyStateContent = () => {
    if (activeFilter === 'All') {
      if (activeTab === 'BUYING') {
        return {
          title: "You've got no buying messages yet!",
          subtitle: 'Open any ad and tap Chat or Make Offer to start a conversation with the seller.',
          buttonText: 'Explore Listings',
          onPressButton: () => navigation.navigate('Main', { screen: 'Home' }),
        };
      } else {
        return {
          title: "You've got no selling messages yet!",
          subtitle: "As soon as a buyer sends a message or offer on your posted ads, it'll appear here.",
          buttonText: 'Post an Ad',
          onPressButton: () => navigation.navigate('PostAd'),
        };
      }
    }

    if (activeFilter === 'Unread') {
      return {
        title: "Yay! You've read all your messages.",
        subtitle: null,
        buttonText: null,
      };
    }

    if (activeFilter === 'Important') {
      return {
        title: "You've marked nothing important so far.",
        subtitle: 'Tap the star icon on any chat thread to bookmark important deals.',
        buttonText: null,
      };
    }

    return {
      title: 'No offer threads in this view',
      subtitle: 'Use "Make Offer" on any listing to negotiate the price directly in chat.',
      buttonText: null,
    };
  };

  const emptyState = getEmptyStateContent();

  const renderOfferStatusBadge = (item) => {
    if (!item.offerStatus && item.lastMessageType !== 'offer') return null;
    const st = (item.offerStatus || 'pending').toLowerCase();
    const bg =
      st === 'accepted'
        ? '#DCFCE7'
        : st === 'countered'
        ? '#EDE9FE'
        : st === 'declined'
        ? '#FEE2E2'
        : '#FEF3C7';
    const fg =
      st === 'accepted'
        ? '#166534'
        : st === 'countered'
        ? '#5B21B6'
        : st === 'declined'
        ? '#991B1B'
        : '#92400E';
    const label =
      st === 'accepted'
        ? 'DEAL ACCEPTED'
        : st === 'countered'
        ? 'COUNTER OFFER'
        : st === 'declined'
        ? 'OFFER DECLINED'
        : 'OFFER PENDING';

    return (
      <View style={[styles.offerStatusPill, { backgroundColor: bg }]}>
        <Ionicons name="pricetag" size={10} color={fg} style={{ marginRight: 3 }} />
        <Text style={[styles.offerStatusPillText, { color: fg }]}>{label}</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <RNStatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <ExpoStatusBar style="dark" backgroundColor="#FFFFFF" />

      {/* 1. Header Title: "Chats" */}
      <View style={[styles.header, { paddingTop: Math.max(insets.top, 14) }]}>
        <Text style={styles.headerTitle}>Chats</Text>
        <TouchableOpacity
          onPress={() => {
            setRefreshing(true);
            fetchConversations();
          }}
          style={styles.refreshBtn}
        >
          <Ionicons name="refresh" size={18} color="#002F34" />
        </TouchableOpacity>
      </View>

      {/* 2. Top Tabs Switcher: BUYING vs SELLING */}
      <View style={styles.tabSwitcher}>
        <TouchableOpacity
          style={styles.tabButton}
          onPress={() => setActiveTab('BUYING')}
          activeOpacity={0.8}
        >
          <Text
            style={[
              styles.tabButtonText,
              activeTab === 'BUYING' && styles.tabButtonTextActive,
            ]}
          >
            BUYING {buyingCount > 0 ? `(${buyingCount})` : ''}
          </Text>
          {activeTab === 'BUYING' && <View style={styles.activeTabIndicator} />}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.tabButton}
          onPress={() => setActiveTab('SELLING')}
          activeOpacity={0.8}
        >
          <Text
            style={[
              styles.tabButtonText,
              activeTab === 'SELLING' && styles.tabButtonTextActive,
            ]}
          >
            SELLING {sellingCount > 0 ? `(${sellingCount})` : ''}
          </Text>
          {activeTab === 'SELLING' && <View style={styles.activeTabIndicator} />}
        </TouchableOpacity>
      </View>

      {/* 3. QUICK FILTERS Section */}
      <View style={styles.filtersSection}>
        <Text style={styles.filtersHeading}>QUICK FILTERS</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersScroll}
        >
          {QUICK_FILTERS.map((filter) => {
            const isSelected = activeFilter === filter;
            return (
              <TouchableOpacity
                key={filter}
                style={[
                  styles.filterChip,
                  isSelected ? styles.filterChipActive : styles.filterChipInactive,
                ]}
                onPress={() => setActiveFilter(filter)}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    isSelected ? styles.filterChipTextActive : styles.filterChipTextInactive,
                  ]}
                >
                  {filter}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* 4. Main Body: Conversation List OR Contextual Empty State */}
      {filteredConversations.length === 0 ? (
        <View style={styles.emptyContainer}>
          <MagnifyingPersonIllustration />
          <Text style={styles.emptyTitle}>{emptyState.title}</Text>
          {emptyState.subtitle ? (
            <Text style={styles.emptySubtitle}>{emptyState.subtitle}</Text>
          ) : null}
          {emptyState.buttonText ? (
            <TouchableOpacity
              style={styles.emptyButton}
              onPress={emptyState.onPressButton}
              activeOpacity={0.88}
            >
              <Text style={styles.emptyButtonText}>{emptyState.buttonText}</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      ) : (
        <FlatList
          data={filteredConversations}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                fetchConversations();
              }}
              tintColor="#004796"
            />
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.chatCard}
              onPress={() =>
                navigation.navigate('Chat', {
                  conversationId: item.id,
                  sellerName: item.partnerName,
                  sellerId: item.sellerId,
                  buyerId: item.buyerId,
                  listingId: item.listingRefId,
                  listingTitle: item.listingTitle,
                  listingPrice: item.listingPrice,
                  listingImage: item.listingImage,
                  isSeller: item.isSeller,
                })
              }
              onLongPress={() => handleDeleteConversation(item.id)}
              activeOpacity={0.85}
            >
              {/* Partner Avatar */}
              <View style={[styles.avatarWrap, item.isSeller && { backgroundColor: '#059669' }]}>
                <Text style={styles.avatarInitial}>
                  {(item.partnerName || 'U').charAt(0).toUpperCase()}
                </Text>
                {item.unread && <View style={styles.unreadDot} />}
              </View>

              {/* Chat Info */}
              <View style={styles.chatInfo}>
                <View style={styles.chatTopRow}>
                  <Text style={styles.partnerName} numberOfLines={1}>
                    {item.partnerName}
                  </Text>
                  <Text style={styles.timestamp}>{item.time || '10:30 AM'}</Text>
                </View>

                <View style={styles.listingRow}>
                  <Text style={styles.listingTitle} numberOfLines={1}>
                    {item.listingTitle}
                  </Text>
                  {item.listingPrice > 0 && (
                    <Text style={styles.listingPriceTag}>
                      · {formatCurrency(item.listingPrice)}
                    </Text>
                  )}
                </View>

                <View style={styles.bottomPreviewRow}>
                  <Text
                    style={[
                      styles.lastMessage,
                      item.unread && { fontWeight: '700', color: '#002F34' },
                    ]}
                    numberOfLines={1}
                  >
                    {item.lastMessage || 'Hello, is this available?'}
                  </Text>
                  {renderOfferStatusBadge(item)}
                </View>
              </View>

              {/* Right: Star & Listing Thumbnail */}
              <View style={styles.chatRight}>
                <TouchableOpacity
                  onPress={() => handleToggleImportant(item.id)}
                  hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                >
                  <Ionicons
                    name={item.important ? 'star' : 'star-outline'}
                    size={18}
                    color={item.important ? '#F59E0B' : '#94A3B8'}
                  />
                </TouchableOpacity>

                {item.listingImage ? (
                  <Image source={{ uri: item.listingImage }} style={styles.listingThumb} />
                ) : (
                  <View style={styles.thumbPlaceholder}>
                    <Ionicons name="cube-outline" size={16} color="#94A3B8" />
                  </View>
                )}
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    paddingHorizontal: 16,
    paddingBottom: 8,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#002F34',
    letterSpacing: -0.2,
  },
  refreshBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabSwitcher: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#EDEDED',
    backgroundColor: '#FFFFFF',
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    position: 'relative',
  },
  tabButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#546E7A',
    letterSpacing: 0.5,
  },
  tabButtonTextActive: {
    color: '#002F34',
    fontWeight: '700',
  },
  activeTabIndicator: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: '#004796',
  },
  filtersSection: {
    paddingTop: 14,
    paddingBottom: 10,
    backgroundColor: '#FFFFFF',
  },
  filtersHeading: {
    fontSize: 11,
    fontWeight: '700',
    color: '#546E7A',
    letterSpacing: 0.6,
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  filtersScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 18,
    paddingVertical: 7,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterChipActive: {
    backgroundColor: '#DDF2FE',
  },
  filterChipInactive: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CFD8DC',
  },
  filterChipText: {
    fontSize: 13,
  },
  filterChipTextActive: {
    color: '#002F34',
    fontWeight: '600',
  },
  filterChipTextInactive: {
    color: '#546E7A',
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
    paddingBottom: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#002F34',
    textAlign: 'center',
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#546E7A',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
    maxWidth: 290,
  },
  emptyButton: {
    backgroundColor: '#003B73',
    borderRadius: 4,
    paddingVertical: 13,
    paddingHorizontal: 28,
    width: '84%',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  emptyButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  chatCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  avatarWrap: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#004796',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    position: 'relative',
  },
  avatarInitial: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '800',
  },
  unreadDot: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#2563EB',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  chatInfo: {
    flex: 1,
  },
  chatTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  partnerName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#002F34',
    flex: 1,
    marginRight: 8,
  },
  timestamp: {
    fontSize: 11,
    color: '#94A3B8',
  },
  listingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 3,
  },
  listingTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
    flexShrink: 1,
  },
  listingPriceTag: {
    fontSize: 12,
    fontWeight: '700',
    color: '#002F34',
    marginLeft: 4,
  },
  bottomPreviewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 6,
  },
  lastMessage: {
    fontSize: 13,
    color: '#64748B',
    flex: 1,
  },
  offerStatusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  offerStatusPillText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  chatRight: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 50,
    marginLeft: 10,
  },
  listingThumb: {
    width: 36,
    height: 36,
    borderRadius: 6,
    backgroundColor: '#F1F5F9',
  },
  thumbPlaceholder: {
    width: 36,
    height: 36,
    borderRadius: 6,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
