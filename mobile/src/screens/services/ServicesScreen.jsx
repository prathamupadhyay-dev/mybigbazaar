import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import ScreenContainer from '../../components/ScreenContainer';
import Colors from '../../constants/colors';
import Typography from '../../constants/typography';
import Spacing from '../../constants/spacing';
import Radii from '../../constants/radii';
import Shadows from '../../constants/shadows';
import { getServiceCategoriesApi, getServiceSubCategoriesApi } from '../../services/categoryApi';
import { apiGet } from '../../services/apiClient';

const DEFAULT_CATEGORY_ICONS = {
  plumber: 'construct-outline',
  electrician: 'flash-outline',
  tutor: 'school-outline',
  cleaning: 'sparkles-outline',
  ac: 'snow-outline',
  carpenter: 'hammer-outline',
  painting: 'color-palette-outline',
  appliance: 'hardware-chip-outline',
  default: 'construct-outline'
};

const getCategoryIcon = (name = '') => {
  const lower = name.toLowerCase();
  for (const [key, icon] of Object.entries(DEFAULT_CATEGORY_ICONS)) {
    if (lower.includes(key)) return icon;
  }
  return DEFAULT_CATEGORY_ICONS.default;
};

export const ServicesScreen = () => {
  const navigation = useNavigation();

  const [categories, setCategories] = useState([]);
  const [selectedCatId, setSelectedCatId] = useState(null);
  const [subCategories, setSubCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');


  // Load real service categories from backend
  useEffect(() => {
    let isMounted = true;
    async function loadCategories() {
      setIsLoading(true);
      try {
        const liveCats = await getServiceCategoriesApi().catch(() => []);
        if (isMounted) {
          if (Array.isArray(liveCats) && liveCats.length > 0) {
            setCategories(liveCats);
            setSelectedCatId(liveCats[0]._id);
          } else {
            setCategories([
              { _id: 'cat-service-all', name: 'Services Directory' }
            ]);
            setSelectedCatId('cat-service-all');
          }
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    loadCategories();
    return () => { isMounted = false; };
  }, []);

  // Load subcategories & live services when category selection changes
  useEffect(() => {
    let isMounted = true;
    async function loadSubs() {
      if (!selectedCatId || selectedCatId === 'cat-service-all') {
        setSubCategories([]);
        return;
      }
      try {
        const selectedCatObj = categories.find((c) => c._id === selectedCatId);
        const selectedCatName = (selectedCatObj?.name || '').toLowerCase();
        const [subs, liveServicesRes] = await Promise.all([
          getServiceSubCategoriesApi(selectedCatId).catch(() => []),
          apiGet('/service/get-all').catch(() => null)
        ]);
        const liveServices = Array.isArray(liveServicesRes?.data)
          ? liveServicesRes.data
          : (Array.isArray(liveServicesRes?.services) ? liveServicesRes.services : []);
        const matchingServices = liveServices
          .filter((svc) => {
            const svcCatId = String(svc.categoryId?._id || svc.categoryId || '');
            const svcCatName = String(svc.category || svc.categoryId?.name || '').toLowerCase();
            return svcCatId === String(selectedCatId) || (selectedCatName && svcCatName.includes(selectedCatName));
          })
          .map((svc) => ({
            _id: svc._id || svc.id,
            name: svc.title || svc.name,
            description: svc.description || '',
            price: svc.basePrice ?? svc.price ?? 499,
            image: Array.isArray(svc.images) && svc.images[0] ? svc.images[0] : svc.image || ''
          }));

        if (isMounted) {
          const baseSubs = Array.isArray(subs) ? subs : [];
          const existingNames = new Set(baseSubs.map((s) => String(s.name || '').toLowerCase()));
          const merged = [
            ...baseSubs,
            ...matchingServices.filter((m) => !existingNames.has(String(m.name || '').toLowerCase()))
          ];
          setSubCategories(merged);
        }
      } catch (err) {
        if (isMounted) setSubCategories([]);
      }
    }
    loadSubs();
    return () => { isMounted = false; };
  }, [selectedCatId, categories]);

  const activeCategory = categories.find((c) => c._id === selectedCatId) || categories[0] || { name: 'Services' };

  const filteredSubCategories = subCategories.filter((sub) => {
    const title = sub.name || sub.title || '';
    const desc = sub.description || '';
    return (
      title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      desc.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  return (
    <ScreenContainer noPadding style={styles.container}>
      {/* Top Header */}
      <View style={styles.topHeader}>
        <TouchableOpacity
          style={styles.headerBackBtn}
          onPress={() => navigation.goBack()}
          accessibilityLabel="Back">
          <Ionicons name="arrow-back" size={24} color={Colors.card} />
        </TouchableOpacity>
        <View style={{ flex: 1, marginLeft: 10 }}>
          <Text style={styles.headerTitle}>Services Directory</Text>
          <Text style={styles.headerSubtitle}>Verified Home & Educational Services</Text>
        </View>
        <View style={styles.headerRightActions}>
          <TouchableOpacity
            style={styles.partnerBtn}
            onPress={() => navigation.navigate('ProviderOnboarding')}
            activeOpacity={0.85}>
            <Ionicons name="briefcase-outline" size={13} color={Colors.card} style={{ marginRight: 3 }} />
            <Text style={styles.partnerBtnText}>Partner</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Search Input */}
      <View style={styles.searchBoxContainer}>
        <Ionicons name="search-outline" size={18} color={Colors.textSecondary} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder={`Search ${activeCategory.name || 'services'}...`}
          placeholderTextColor={Colors.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={18} color={Colors.textSecondary} />
          </TouchableOpacity>
        )}
      </View>

      {/* Category Tabs */}
      {categories.length > 0 && (
        <View style={styles.catTabsWrapper}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.catTabsContent}>
            {categories.map((cat) => {
              const isSelected = cat._id === selectedCatId;
              return (
                <TouchableOpacity
                  key={cat._id}
                  style={[styles.catTab, isSelected && styles.selectedCatTab]}
                  onPress={() => setSelectedCatId(cat._id)}>
                  <Ionicons
                    name={getCategoryIcon(cat.name)}
                    size={16}
                    color={isSelected ? Colors.card : Colors.textSecondary}
                    style={styles.catTabIcon}
                  />
                  <Text style={[styles.catTabText, isSelected && styles.selectedCatTabText]}>
                    {cat.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      )}

      {/* Services List / Honest Empty State */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}>
        
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.primary} />
            <Text style={styles.loadingText}>Loading verified services...</Text>
          </View>
        ) : filteredSubCategories.length === 0 ? (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconCircle}>
              <Ionicons name="construct-outline" size={44} color={Colors.primary} />
            </View>
            <Text style={styles.emptyTitle}>No Active Listings in this Category</Text>
            <Text style={styles.emptySubtitle}>
              Verified service providers for ${activeCategory.name || 'this category'} are currently completing KYC registration in your locality.
            </Text>

            <View style={styles.onboardCalloutCard}>
              <Ionicons name="sparkles" size={20} color={Colors.brandOrange} />
              <View style={{ flex: 1, marginLeft: Spacing.sm }}>
                <Text style={styles.calloutTitle}>Are you a service professional?</Text>
                <Text style={styles.calloutDesc}>
                  Register your business on MyBigBazaar to receive customer bookings directly in your area.
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.registerPartnerBtn}
              onPress={() => navigation.navigate('ProviderOnboarding')}
              activeOpacity={0.88}>
              <Ionicons name="arrow-forward-circle-outline" size={20} color={Colors.card} style={{ marginRight: 6 }} />
              <Text style={styles.registerPartnerBtnText}>Register as a Service Partner</Text>
            </TouchableOpacity>
          </View>
        ) : (
          filteredSubCategories.map((sub) => (
            <View key={sub._id || sub.id} style={styles.serviceCard}>
              <View style={styles.cardHeader}>
                <View style={styles.cardTitleBox}>
                  <Text style={styles.serviceName}>{sub.name || sub.title}</Text>
                  <View style={styles.metaRow}>
                    <Text style={styles.durationText}>Verified Service</Text>
                  </View>
                </View>
              </View>
              {sub.description ? (
                <Text style={styles.serviceDesc}>{sub.description}</Text>
              ) : null}
              <View style={styles.cardActions}>
                <TouchableOpacity
                  style={styles.bookNowBtn}
                  onPress={() => navigation.navigate('ServiceDetails', { item: sub })}>
                  <Text style={styles.bookNowText}>View Details</Text>
                  <Ionicons name="arrow-forward" size={16} color={Colors.card} />
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </ScrollView>

    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.canvas
  },
  topHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
    backgroundColor: Colors.navy,
    borderBottomWidth: 1,
    borderBottomColor: Colors.navy
  },
  headerTitle: {
    ...Typography.heading2,
    color: Colors.card,
    fontSize: 18
  },
  headerSubtitle: {
    ...Typography.caption,
    color: Colors.sunken,
    marginTop: 2
  },
  headerBackBtn: {
    padding: Spacing.xs,
    justifyContent: 'center',
    alignItems: 'center'
  },
  headerRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  headerCartBtn: {
    padding: Spacing.xs,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center'
  },
  cartBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: Colors.terracotta,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3
  },
  cartBadgeText: {
    color: Colors.card,
    fontSize: 9,
    fontWeight: '800'
  },
  partnerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: Colors.terracotta,
    borderRadius: Radii.button || 8,
    minHeight: 32
  },
  partnerBtnText: {
    ...Typography.captionBold,
    color: Colors.card,
    fontSize: 12
  },
  searchBoxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.sunken,
    marginHorizontal: Spacing.md,
    marginTop: Spacing.sm,
    marginBottom: Spacing.sm,
    paddingHorizontal: Spacing.sm + 2,
    borderRadius: Radii.input || 8,
    borderWidth: 1,
    borderColor: Colors.hairline,
    height: 42
  },
  searchIcon: {
    marginRight: Spacing.xs
  },
  searchInput: {
    flex: 1,
    ...Typography.body,
    fontSize: 13,
    color: Colors.textPrimary,
    paddingVertical: 0
  },
  catTabsWrapper: {
    backgroundColor: Colors.card,
    borderBottomWidth: 1,
    borderBottomColor: Colors.hairline,
    paddingVertical: Spacing.xs
  },
  catTabsContent: {
    paddingHorizontal: Spacing.md
  },
  catTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: Radii.chip || 6,
    backgroundColor: Colors.sunken,
    marginRight: Spacing.xs,
    borderWidth: 1,
    borderColor: Colors.hairline,
    minHeight: 36
  },
  selectedCatTab: {
    backgroundColor: Colors.indigo,
    borderColor: Colors.indigo
  },
  catTabIcon: {
    marginRight: 6
  },
  catTabText: {
    ...Typography.bodyBold,
    fontSize: 13,
    color: Colors.textSecondary
  },
  selectedCatTabText: {
    color: Colors.card
  },
  listContent: {
    padding: Spacing.md,
    paddingBottom: Spacing.xl
  },
  listWithCartBar: {
    paddingBottom: 120
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80
  },
  loadingText: {
    ...Typography.body,
    color: Colors.textSecondary,
    marginTop: Spacing.md
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    paddingHorizontal: Spacing.lg
  },
  emptyIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.sunken,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.hairline
  },
  emptyTitle: {
    ...Typography.heading3,
    fontSize: 17,
    color: Colors.textPrimary,
    textAlign: 'center'
  },
  emptySubtitle: {
    ...Typography.body,
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 19,
    maxWidth: 290
  },
  onboardCalloutCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.hairline,
    borderRadius: Radii.card || 12,
    padding: Spacing.md,
    marginTop: Spacing.xl,
    width: '100%',
    ...Shadows.subtle
  },
  calloutTitle: {
    ...Typography.bodyBold,
    fontSize: 14,
    color: Colors.navy
  },
  calloutDesc: {
    ...Typography.caption,
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
    lineHeight: 16
  },
  registerPartnerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.indigo,
    paddingVertical: 12,
    paddingHorizontal: Spacing.xl,
    borderRadius: Radii.button || 8,
    marginTop: Spacing.md,
    width: '100%',
    minHeight: 48
  },
  registerPartnerBtnText: {
    ...Typography.bodyBold,
    color: Colors.card,
    fontSize: 14
  },
  serviceCard: {
    backgroundColor: Colors.card,
    borderRadius: Radii.card || 12,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.hairline,
    ...Shadows.card
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.xs
  },
  cardTitleBox: {
    flex: 1,
    marginRight: Spacing.sm
  },
  serviceName: {
    ...Typography.bodyBold,
    fontSize: 16,
    color: Colors.textPrimary,
    marginBottom: 4
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  durationText: {
    ...Typography.caption,
    color: Colors.emerald,
    fontWeight: '600'
  },
  serviceDesc: {
    ...Typography.caption,
    color: Colors.textSecondary,
    lineHeight: 18,
    marginBottom: Spacing.sm
  },
  cardActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: Spacing.xs
  },
  bookNowBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: Spacing.md,
    borderRadius: Radii.button || 8,
    backgroundColor: Colors.indigo,
    minHeight: 38
  },
  bookNowText: {
    ...Typography.bodyBold,
    color: Colors.card,
    fontSize: 13,
    marginRight: 4
  }
});

export default ServicesScreen;
