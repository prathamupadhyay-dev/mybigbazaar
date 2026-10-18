import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Dimensions
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import ScreenContainer from '../../components/ScreenContainer';
import Colors from '../../constants/colors';
import Typography from '../../constants/typography';
import Spacing from '../../constants/spacing';
import Radii from '../../constants/radii';
import Shadows from '../../constants/shadows';
import { useApp } from '../../context/AppContext';
import { getProductCategoriesApi, getServiceCategoriesApi } from '../../services/categoryApi';

const { width } = Dimensions.get('window');
const COLUMN_WIDTH = (width - 32 - 12) / 2;

const CATEGORY_ICON_MAP = {
  // Products
  cars: 'car-sport-outline',
  vehicles: 'car-sport-outline',
  properties: 'business-outline',
  'real-estate': 'business-outline',
  mobiles: 'phone-portrait-outline',
  smartphones: 'phone-portrait-outline',
  electronics: 'tv-outline',
  furniture: 'bed-outline',
  fashion: 'shirt-outline',
  appliances: 'hardware-chip-outline',
  bikes: 'bicycle-outline',
  books: 'book-outline',
  jobs: 'briefcase-outline',
  sports: 'fitness-outline',

  // Services
  ac: 'snow-outline',
  electrical: 'flash-outline',
  plumbing: 'water-outline',
  cleaning: 'sparkles-outline',
  appliance: 'construct-outline',
  carpentry: 'hammer-outline',
  painting: 'color-palette-outline',
  tutor: 'school-outline',
  salon: 'cut-outline',
  beauty: 'flower-outline',
  pest: 'shield-outline',
  default: 'apps-outline'
};

const resolveIcon = (name = '') => {
  const lower = name.toLowerCase();
  for (const [key, icon] of Object.entries(CATEGORY_ICON_MAP)) {
    if (lower.includes(key)) return icon;
  }
  return CATEGORY_ICON_MAP.default;
};

export default function AllItemsScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { bucket } = useApp();
  const initialType = route.params?.type || 'all'; // 'all' | 'product' | 'service'

  const [activeTab, setActiveTab] = useState(initialType);
  const [searchQuery, setSearchQuery] = useState('');
  const [productCategories, setProductCategories] = useState([]);
  const [serviceCategories, setServiceCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function loadAllCategories() {
      setIsLoading(true);
      try {
        const [prods, servs] = await Promise.all([
          getProductCategoriesApi().catch(() => []),
          getServiceCategoriesApi().catch(() => [])
        ]);

        if (isMounted) {
          setProductCategories(Array.isArray(prods) ? prods : []);
          setServiceCategories(Array.isArray(servs) ? servs : []);
        }
      } catch (err) {
        console.warn('Categories load error in AllItemsScreen:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadAllCategories();
    return () => { isMounted = false; };
  }, []);

  const filteredCategories = useMemo(() => {
    let combined = [];

    if (activeTab === 'all' || activeTab === 'product') {
      const pList = productCategories.map((c) => ({
        _id: c._id,
        name: c.name,
        type: 'product',
        badge: 'Classifieds',
        icon: resolveIcon(c.name),
        count: 'Browse ads',
        raw: c
      }));
      combined.push(...pList);
    }

    if (activeTab === 'all' || activeTab === 'service') {
      const sList = serviceCategories.map((c) => ({
        _id: c._id,
        name: c.name,
        type: 'service',
        badge: 'Doorstep',
        icon: resolveIcon(c.name),
        count: 'Book expert',
        raw: c
      }));
      combined.push(...sList);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      combined = combined.filter((c) => c.name.toLowerCase().includes(q));
    }

    return combined;
  }, [activeTab, searchQuery, productCategories, serviceCategories]);

  const handleCategoryPress = (category) => {
    if (category.type === 'product') {
      navigation.navigate('ProductList', {
        category: category.name,
        categoryId: category._id
      });
    } else {
      navigation.navigate('Services', {
        selectedCatId: category._id,
        categoryName: category.name
      });
    }
  };

  return (
    <ScreenContainer noPadding style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          accessibilityLabel="Back"
        >
          <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <View style={{ flex: 1, marginLeft: 8 }}>
          <Text style={styles.headerTitle}>All Categories</Text>
          <Text style={styles.headerSubtitle}>Hyperlocal Category Directory</Text>
        </View>
        <TouchableOpacity
          style={styles.cartButton}
          onPress={() => navigation.navigate('Bucket')}
          accessibilityLabel="Open Bucket">
          <Ionicons name="cart-outline" size={24} color={Colors.textPrimary} />
          {bucket?.length > 0 && (
            <View style={styles.cartBadge}>
              <Text style={styles.cartBadgeText}>{bucket.length}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBox}>
          <Ionicons name="search-outline" size={18} color={Colors.textSecondary} style={{ marginRight: 8 }} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search categories (e.g. Mobiles, AC, Cleaning)..."
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
      </View>

      {/* Segmented Filter Pills */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tabChip, activeTab === 'all' && styles.tabChipActive]}
          onPress={() => setActiveTab('all')}
        >
          <Text style={[styles.tabText, activeTab === 'all' && styles.tabTextActive]}>
            All ({productCategories.length + serviceCategories.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabChip, activeTab === 'product' && styles.tabChipActive]}
          onPress={() => setActiveTab('product')}
        >
          <Ionicons
            name="storefront-outline"
            size={14}
            color={activeTab === 'product' ? Colors.card : Colors.textSecondary}
            style={{ marginRight: 4 }}
          />
          <Text style={[styles.tabText, activeTab === 'product' && styles.tabTextActive]}>
            Classifieds ({productCategories.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabChip, activeTab === 'service' && styles.tabChipActive]}
          onPress={() => setActiveTab('service')}
        >
          <Ionicons
            name="construct-outline"
            size={14}
            color={activeTab === 'service' ? Colors.card : Colors.textSecondary}
            style={{ marginRight: 4 }}
          />
          <Text style={[styles.tabText, activeTab === 'service' && styles.tabTextActive]}>
            Services ({serviceCategories.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Category Grid or Loading/Empty State */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {isLoading ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="large" color={Colors.terracotta} />
            <Text style={styles.loadingText}>Loading verified categories...</Text>
          </View>
        ) : filteredCategories.length === 0 ? (
          <View style={styles.emptyBox}>
            <Ionicons name="search-outline" size={48} color={Colors.disabled} />
            <Text style={styles.emptyTitle}>No matching categories</Text>
            <Text style={styles.emptySubtitle}>Try searching with different keywords</Text>
          </View>
        ) : (
          <View style={styles.grid}>
            {filteredCategories.map((cat) => {
              const isService = cat.type === 'service';
              return (
                <TouchableOpacity
                  key={`${cat.type}-${cat._id}`}
                  style={styles.card}
                  onPress={() => handleCategoryPress(cat)}
                  activeOpacity={0.85}
                >
                  <View style={[styles.iconBox, isService && styles.iconBoxService]}>
                    <Ionicons
                      name={cat.icon}
                      size={22}
                      color={isService ? Colors.indigo : Colors.terracotta}
                    />
                  </View>

                  <View style={styles.cardBody}>
                    <Text style={styles.catName} numberOfLines={1}>
                      {cat.name}
                    </Text>
                    <View style={styles.catMetaRow}>
                      <View style={[styles.typeBadge, isService ? styles.typeBadgeService : styles.typeBadgeProduct]}>
                        <Text style={[styles.typeBadgeText, isService ? styles.typeBadgeTextService : styles.typeBadgeTextProduct]}>
                          {cat.badge}
                        </Text>
                      </View>
                      <Ionicons name="chevron-forward" size={13} color={Colors.disabled} />
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </ScrollView>
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
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.card,
    borderBottomWidth: 1,
    borderBottomColor: Colors.hairline
  },
  backButton: {
    marginRight: Spacing.sm,
    padding: Spacing.xs
  },
  headerTitle: {
    ...Typography.heading2,
    fontSize: 18,
    color: Colors.textPrimary
  },
  headerSubtitle: {
    ...Typography.caption,
    color: Colors.textSecondary,
    fontSize: 11
  },
  cartButton: {
    padding: Spacing.xs,
    position: 'relative'
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
  searchContainer: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.card,
    borderBottomWidth: 1,
    borderBottomColor: Colors.hairline
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.sunken,
    borderRadius: Radii.control,
    paddingHorizontal: Spacing.sm,
    height: 40,
    borderWidth: 1,
    borderColor: Colors.hairline
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: Colors.textPrimary,
    paddingVertical: 0
  },
  tabBar: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.card,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.hairline
  },
  tabChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: Colors.sunken,
    borderWidth: 1,
    borderColor: Colors.hairline
  },
  tabChipActive: {
    backgroundColor: Colors.navy,
    borderColor: Colors.navy
  },
  tabText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary
  },
  tabTextActive: {
    color: Colors.white,
    fontWeight: '700'
  },
  scrollContent: {
    padding: Spacing.md,
    paddingBottom: Spacing.xl * 2
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12
  },
  card: {
    width: COLUMN_WIDTH,
    backgroundColor: Colors.card,
    borderRadius: Radii.card,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.hairline,
    ...Shadows.subtle
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFF7ED',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm
  },
  iconBoxService: {
    backgroundColor: '#EEF2FF'
  },
  cardBody: {
    justifyContent: 'center'
  },
  catName: {
    ...Typography.bodyBold,
    fontSize: 13,
    color: Colors.textPrimary,
    marginBottom: 6
  },
  catMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  typeBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4
  },
  typeBadgeProduct: {
    backgroundColor: '#FFF7ED'
  },
  typeBadgeService: {
    backgroundColor: '#EEF2FF'
  },
  typeBadgeText: {
    fontSize: 9,
    fontWeight: '700'
  },
  typeBadgeTextProduct: {
    color: Colors.terracotta
  },
  typeBadgeTextService: {
    color: Colors.indigo
  },
  loadingBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xl * 2
  },
  loadingText: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginTop: Spacing.sm
  },
  emptyBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xl * 2
  },
  emptyTitle: {
    ...Typography.bodyBold,
    fontSize: 15,
    color: Colors.textPrimary,
    marginTop: Spacing.md
  },
  emptySubtitle: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginTop: 4
  }
});