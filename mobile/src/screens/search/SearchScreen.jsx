import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  FlatList,
  Image,
  StatusBar,
  ActivityIndicator,
  Modal,
  Platform,
  Keyboard,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '../../context/AppContext';
import { getProductsApi, formatProductSubtitle } from '../../services/productApi';
import {
  getProductCategoriesApi,
  FALLBACK_PRODUCT_CATEGORIES,
} from '../../services/categoryApi';
import { API_BASE_URL } from '../../services/apiClient';

const DEFAULT_CATEGORY_LABELS = [
  'Cars',
  'Properties',
  'Mobiles',
  'Bikes',
  'Electronics & Appliances',
  'Commercial Vehicles & Spares',
  'Furniture',
  'Fashion',
  'Books, Sports & Hobbies',
  'Pets',
  'Services',
  'Jobs',
];

const SORT_OPTIONS = [
  { id: 'newest', label: 'Newest First' },
  { id: 'price_asc', label: 'Price: Low to High' },
  { id: 'price_desc', label: 'Price: High to Low' },
];

const PRICE_RANGES = [
  { id: 'all', label: 'Any Price', min: 0, max: Infinity },
  { id: 'under_10k', label: 'Under ₹10,000', min: 0, max: 10000 },
  { id: '10k_50k', label: '₹10,000 – ₹50,000', min: 10000, max: 50000 },
  { id: '50k_2l', label: '₹50,000 – ₹2,00,000', min: 50000, max: 200000 },
  { id: 'above_2l', label: 'Above ₹2,00,000', min: 200000, max: Infinity },
];

const resolveImage = (item) => {
  const raw =
    (Array.isArray(item?.images) && item.images[0]) ||
    item?.imageUrl ||
    item?.image ||
    null;
  if (!raw || typeof raw !== 'string') {
    return 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=600&auto=format&fit=crop&q=80';
  }
  if (raw.startsWith('http') || raw.startsWith('data:')) return raw;
  const base = (API_BASE_URL || '').replace(/\/+$/, '');
  return `${base}${raw.startsWith('/') ? '' : '/'}${raw}`;
};

export default function SearchScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const insets = useSafeAreaInsets();
  const inputRef = useRef(null);

  const {
    watchlist = [],
    toggleWatchlist,
    currentLocation,
    formatPrice,
    addRecentSearch,
    isAuthenticated,
  } = useApp();

  const hasInitialSearchParams = Boolean(
    (route.params?.query && route.params.query.trim()) ||
      (route.params?.category && route.params.category !== 'All')
  );

  const [isResultsView, setIsResultsView] = useState(hasInitialSearchParams);
  const [query, setQuery] = useState(route.params?.query || '');
  const [selectedCategory, setSelectedCategory] = useState(
    route.params?.category || 'All'
  );
  const [selectedSort, setSelectedSort] = useState('newest');
  const [selectedPriceRange, setSelectedPriceRange] = useState('all');
  const [showFilterModal, setShowFilterModal] = useState(false);

  const [categoryLabels, setCategoryLabels] = useState(DEFAULT_CATEGORY_LABELS);
  const [liveProducts, setLiveProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const locationDisplay = currentLocation?.city
    ? `${currentLocation.city}${currentLocation.state ? ', ' + currentLocation.state : ''}`
    : 'Kaveri Nagar, Indore';

  const fetchProductsAndCategories = useCallback(async () => {
    setLoading(true);
    try {
      const [prods, cats] = await Promise.all([
        getProductsApi().catch(() => []),
        getProductCategoriesApi().catch(() => FALLBACK_PRODUCT_CATEGORIES),
      ]);

      setLiveProducts(Array.isArray(prods) ? prods : []);

      const sourceCats =
        Array.isArray(cats) && cats.length > 0
          ? cats
          : FALLBACK_PRODUCT_CATEGORIES;
      const names = sourceCats
        .filter((c) => c.isActive !== false && c.status !== 'Inactive')
        .map((c) => (c.name || c.title || '').trim())
        .filter(Boolean);

      if (names.length > 0) {
        const uniqueNames = Array.from(new Set(names));
        setCategoryLabels(uniqueNames);
      }
    } catch (_err) {
      setLiveProducts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProductsAndCategories();
  }, [fetchProductsAndCategories]);

  useEffect(() => {
    if (route.params?.category) {
      setSelectedCategory(route.params.category);
      setIsResultsView(true);
    }
    if (route.params?.query !== undefined) {
      setQuery(route.params.query);
      if (route.params.query.trim()) {
        setIsResultsView(true);
      }
    }
  }, [route.params]);

  const filteredProducts = useMemo(() => {
    let results = [...liveProducts];

    // 1. Keyword Search
    if (query && query.trim()) {
      const q = query.toLowerCase().trim();
      results = results.filter((item) => {
        const hay = `${item.title || ''} ${item.productName || ''} ${item.description || ''} ${item.category || ''} ${item.location || ''} ${item.city || ''} ${item.subtitle || ''}`.toLowerCase();
        return hay.includes(q);
      });
    }

    // 2. Category Filter
    if (selectedCategory && selectedCategory !== 'All') {
      const target = selectedCategory.toLowerCase();
      const firstWord = target.split(' ')[0];
      results = results.filter((item) => {
        const cat = (item.category || '').toLowerCase();
        return cat.includes(target) || cat.includes(firstWord);
      });
    }

    // 3. Price Range Filter
    const rangeObj =
      PRICE_RANGES.find((r) => r.id === selectedPriceRange) || PRICE_RANGES[0];
    if (rangeObj.id !== 'all') {
      results = results.filter((item) => {
        const price = Number(item.price ?? item.productPrice ?? 0);
        return price >= rangeObj.min && price <= rangeObj.max;
      });
    }

    // 4. Sort
    if (selectedSort === 'price_asc') {
      results.sort(
        (a, b) =>
          Number(a.price ?? a.productPrice ?? 0) -
          Number(b.price ?? b.productPrice ?? 0)
      );
    } else if (selectedSort === 'price_desc') {
      results.sort(
        (a, b) =>
          Number(b.price ?? b.productPrice ?? 0) -
          Number(a.price ?? a.productPrice ?? 0)
      );
    } else {
      results.sort((a, b) => {
        const dA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dB - dA;
      });
    }

    return results;
  }, [liveProducts, query, selectedCategory, selectedPriceRange, selectedSort]);

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (selectedCategory !== 'All') count += 1;
    if (selectedPriceRange !== 'all') count += 1;
    if (selectedSort !== 'newest') count += 1;
    return count;
  }, [selectedCategory, selectedPriceRange, selectedSort]);

  const handleSearchSubmit = () => {
    Keyboard.dismiss();
    if (query.trim() && addRecentSearch) {
      addRecentSearch(query.trim());
    }
    setIsResultsView(true);
  };

  const handleCategoryLabelPress = (cat) => {
    Keyboard.dismiss();
    setSelectedCategory(cat);
    setIsResultsView(true);
  };

  const handleResetFilters = () => {
    setSelectedCategory('All');
    setSelectedPriceRange('all');
    setSelectedSort('newest');
    setQuery('');
  };

  const handleBackPress = () => {
    if (isResultsView && !hasInitialSearchParams) {
      setIsResultsView(false);
      return;
    }
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate('Main');
    }
  };

  const renderProductCard = ({ item, index }) => {
    const id = item._id || item.id || `prod-${index}`;
    const isSaved = (watchlist || []).includes(id);
    const subtitle = item.subtitle || formatProductSubtitle(item);
    const imageUri = resolveImage(item);
    const priceNum = Number(item.price ?? item.productPrice ?? 0);
    const isFeatured = Boolean(item.isFeatured);

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() =>
          navigation.navigate('ProductDetails', {
            id,
            product: item.rawProduct || item,
          })
        }
        activeOpacity={0.9}
      >
        <View style={styles.imageWrapper}>
          <Image source={{ uri: imageUri }} style={styles.cardImage} resizeMode="cover" />

          {isFeatured && (
            <View style={styles.featuredBadge}>
              <Text style={styles.featuredBadgeText}>FEATURED</Text>
            </View>
          )}

          <TouchableOpacity
            style={styles.heartBtn}
            onPress={() => {
              if (!isAuthenticated) {
                navigation.navigate('AuthLanding');
              } else if (toggleWatchlist) {
                toggleWatchlist(id);
              }
            }}
            activeOpacity={0.6}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons
              name={isSaved ? 'heart' : 'heart-outline'}
              size={20}
              color={isSaved ? '#FF2D55' : '#FFFFFF'}
              style={styles.heartIconShadow}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.cardBody}>
          <Text style={styles.cardPrice} numberOfLines={1}>
            {formatPrice ? formatPrice(priceNum) : `₹ ${priceNum.toLocaleString('en-IN')}`}
          </Text>

          <Text style={styles.cardTitle} numberOfLines={1}>
            {item.title || item.productName}
          </Text>

          <Text style={styles.cardSubtitle} numberOfLines={1}>
            {subtitle || item.category || 'Listing'}
          </Text>

          <View style={styles.cardFooter}>
            <Ionicons name="location-outline" size={11} color="#8E8E93" />
            <Text style={styles.cardLocationText} numberOfLines={1}>
              {item.location || item.city || currentLocation?.city || 'Indore'}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  // ============================================================================
  // VIEW 1: INITIAL SEARCH ENTRY SCREEN (Before Enter / Search is pressed)
  // ============================================================================
  if (!isResultsView) {
    return (
      <View style={[styles.entryContainer, { paddingTop: Math.max(insets.top, 8) }]}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

        {/* 1. Search Bar Row */}
        <View style={styles.entryHeader}>
          <View style={styles.searchBarRow}>
            <TouchableOpacity
              style={styles.backBtn}
              onPress={handleBackPress}
              activeOpacity={0.5}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              accessibilityRole="button"
              accessibilityLabel="Back"
            >
              <Ionicons name="chevron-back" size={24} color="#1C1C1E" />
            </TouchableOpacity>

            <View style={styles.searchInputContainer}>
              <Ionicons
                name="search"
                size={17}
                color="#8E8E93"
                style={styles.searchIcon}
              />
              <TextInput
                ref={inputRef}
                style={styles.searchInput}
                placeholder="Search products, services, and more..."
                placeholderTextColor="#8E8E93"
                value={query}
                onChangeText={setQuery}
                onSubmitEditing={handleSearchSubmit}
                returnKeyType="search"
                autoFocus
              />
              {query.length > 0 && (
                <TouchableOpacity
                  onPress={() => setQuery('')}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Ionicons name="close-circle" size={17} color="#8E8E93" />
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* 2. Location Selector below the Search Bar (same style as Home Screen top right) */}
          <View style={styles.entryLocationRow}>
            <TouchableOpacity
              style={styles.locationSelector}
              onPress={() => navigation.navigate('LocationSelector')}
              activeOpacity={0.6}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              accessibilityRole="button"
              accessibilityLabel={`Location: ${locationDisplay}. Tap to change location`}
            >
              <Ionicons
                name="location-sharp"
                size={15}
                color="#007AFF"
                style={styles.locationPinIcon}
              />
              <Text style={styles.locationSelectorText} numberOfLines={1}>
                {locationDisplay}
              </Text>
              <Ionicons
                name="chevron-down"
                size={12}
                color="#8E8E93"
                style={styles.locationChevron}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* 3. Search by Category (Labels only in that space — no icons, not a slider) */}
        <ScrollView
          contentContainerStyle={styles.entryBody}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.categorySectionHeader}>Search by Category</Text>
          <View style={styles.categoryLabelsGrid}>
            {categoryLabels.map((cat) => (
              <TouchableOpacity
                key={cat}
                style={styles.categoryLabelPill}
                onPress={() => handleCategoryLabelPress(cat)}
                activeOpacity={0.65}
              >
                <Text style={styles.categoryLabelText}>{cat}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>
    );
  }

  // ============================================================================
  // VIEW 2: SEARCH RESULT PAGE (Shown when Enter / Search or Category is pressed)
  // Top Right: Location Selector (like Home Screen)
  // Search Bar Row: Search Bar + Filter Icon on Right Side of Search Bar
  // ============================================================================
  return (
    <View style={[styles.resultsContainer, { paddingTop: Math.max(insets.top, 8) }]}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Search Results Header Surface */}
      <View style={styles.resultsHeaderSurface}>
        {/* Row 1: Back Button + Location Selector on Top Right (like Home Screen) */}
        <View style={styles.resultsTopRow}>
          <TouchableOpacity
            style={styles.backRowLeft}
            onPress={handleBackPress}
            activeOpacity={0.5}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            accessibilityRole="button"
            accessibilityLabel="Back"
          >
            <Ionicons name="chevron-back" size={24} color="#1C1C1E" />
            <Text style={styles.resultsHeaderTitle} numberOfLines={1}>
              {selectedCategory !== 'All' ? selectedCategory : 'Search Results'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.locationSelectorTopRight}
            onPress={() => navigation.navigate('LocationSelector')}
            activeOpacity={0.6}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            accessibilityRole="button"
            accessibilityLabel={`Location: ${locationDisplay}. Tap to change location`}
          >
            <Ionicons
              name="location-sharp"
              size={15}
              color="#007AFF"
              style={styles.locationPinIcon}
            />
            <Text style={styles.locationSelectorText} numberOfLines={1}>
              {locationDisplay}
            </Text>
            <Ionicons
              name="chevron-down"
              size={12}
              color="#8E8E93"
              style={styles.locationChevron}
            />
          </TouchableOpacity>
        </View>

        {/* Row 2: Search Bar + Filter Icon on Right Side of Search Bar */}
        <View style={styles.resultsSearchRow}>
          <View style={styles.searchInputContainer}>
            <Ionicons
              name="search"
              size={17}
              color="#8E8E93"
              style={styles.searchIcon}
            />
            <TextInput
              style={styles.searchInput}
              placeholder="Search listings..."
              placeholderTextColor="#8E8E93"
              value={query}
              onChangeText={setQuery}
              onSubmitEditing={handleSearchSubmit}
              returnKeyType="search"
            />
            {query.length > 0 && (
              <TouchableOpacity
                onPress={() => setQuery('')}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons name="close-circle" size={17} color="#8E8E93" />
              </TouchableOpacity>
            )}
          </View>

          {/* Filter Icon on Right Side of Search Bar (macOS/Apple borderless action button) */}
          <TouchableOpacity
            style={styles.filterIconBtn}
            onPress={() => setShowFilterModal(true)}
            activeOpacity={0.5}
            hitSlop={{ top: 8, bottom: 8, left: 6, right: 6 }}
            accessibilityRole="button"
            accessibilityLabel="Filters"
          >
            <Ionicons name="options-outline" size={22} color="#1C1C1E" />
            {activeFiltersCount > 0 && <View style={styles.filterBadgeDot} />}
          </TouchableOpacity>
        </View>
      </View>

      {/* Results Area */}
      <View style={styles.resultsArea}>
        <View style={styles.resultsSummaryBar}>
          <Text style={styles.resultsCountText}>
            {filteredProducts.length}{' '}
            {filteredProducts.length === 1 ? 'result' : 'results'}
            {selectedCategory !== 'All' ? ` in ${selectedCategory}` : ''}
          </Text>

          {(activeFiltersCount > 0 || query.trim().length > 0) && (
            <TouchableOpacity
              onPress={handleResetFilters}
              activeOpacity={0.6}
              hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
            >
              <Text style={styles.resetActionText}>Reset</Text>
            </TouchableOpacity>
          )}
        </View>

        {loading ? (
          <View style={styles.centerState}>
            <ActivityIndicator size="small" color="#8E8E93" />
            <Text style={styles.loadingText}>Loading listings...</Text>
          </View>
        ) : filteredProducts.length === 0 ? (
          <View style={styles.centerState}>
            <Ionicons
              name="search-outline"
              size={36}
              color="#C7C7CC"
              style={{ marginBottom: 10 }}
            />
            <Text style={styles.emptyTitle}>No Results Found</Text>
            <Text style={styles.emptySub}>
              Try adjusting your search keywords or filters.
            </Text>
            <TouchableOpacity
              style={styles.resetPillBtn}
              onPress={handleResetFilters}
              activeOpacity={0.8}
            >
              <Text style={styles.resetPillBtnText}>Reset Filters</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={filteredProducts}
            keyExtractor={(item, idx) => String(item._id || item.id || idx)}
            numColumns={2}
            columnWrapperStyle={styles.gridRow}
            contentContainerStyle={styles.gridContent}
            showsVerticalScrollIndicator={false}
            onRefresh={fetchProductsAndCategories}
            refreshing={loading}
            renderItem={renderProductCard}
          />
        )}
      </View>

      {/* macOS / Apple Filter & Sort Sheet */}
      <Modal
        visible={showFilterModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowFilterModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filters</Text>
              <TouchableOpacity
                onPress={() => setShowFilterModal(false)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons name="close" size={22} color="#1C1C1E" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 440 }}>
              <Text style={styles.modalSectionTitle}>Sort By</Text>
              <View style={styles.modalChipsWrap}>
                {SORT_OPTIONS.map((opt) => {
                  const active = selectedSort === opt.id;
                  return (
                    <TouchableOpacity
                      key={opt.id}
                      style={[styles.modalChip, active && styles.modalChipActive]}
                      onPress={() => setSelectedSort(opt.id)}
                    >
                      <Text
                        style={[
                          styles.modalChipText,
                          active && styles.modalChipTextActive,
                        ]}
                      >
                        {opt.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <Text style={styles.modalSectionTitle}>Price Range</Text>
              <View style={styles.modalChipsWrap}>
                {PRICE_RANGES.map((range) => {
                  const active = selectedPriceRange === range.id;
                  return (
                    <TouchableOpacity
                      key={range.id}
                      style={[styles.modalChip, active && styles.modalChipActive]}
                      onPress={() => setSelectedPriceRange(range.id)}
                    >
                      <Text
                        style={[
                          styles.modalChipText,
                          active && styles.modalChipTextActive,
                        ]}
                      >
                        {range.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <Text style={styles.modalSectionTitle}>Category</Text>
              <View style={styles.modalChipsWrap}>
                {['All', ...categoryLabels].map((cat) => {
                  const active = selectedCategory === cat;
                  return (
                    <TouchableOpacity
                      key={cat}
                      style={[styles.modalChip, active && styles.modalChipActive]}
                      onPress={() => setSelectedCategory(cat)}
                    >
                      <Text
                        style={[
                          styles.modalChipText,
                          active && styles.modalChipTextActive,
                        ]}
                      >
                        {cat}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.modalResetBtn}
                onPress={handleResetFilters}
              >
                <Text style={styles.modalResetText}>Reset</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalApplyBtn}
                onPress={() => setShowFilterModal(false)}
              >
                <Text style={styles.modalApplyText}>
                  Show {filteredProducts.length} Results
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  // Entry View Styles (Clean macOS/Apple Spotlight screen)
  entryContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  entryHeader: {
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? 8 : 4,
    paddingBottom: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: '#E5E5EA',
    backgroundColor: '#FFFFFF',
  },
  searchBarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  backBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingRight: 2,
    backgroundColor: 'transparent',
  },
  searchInputContainer: {
    flex: 1,
    height: 38,
    backgroundColor: '#F2F2F7',
    borderRadius: 10,
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchIcon: {
    marginRight: 7,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#1C1C1E',
    fontWeight: '400',
    letterSpacing: -0.2,
    paddingVertical: 0,
  },
  entryLocationRow: {
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 28,
  },
  locationSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
    paddingVertical: 2,
  },
  locationSelectorTopRight: {
    flexDirection: 'row',
    alignItems: 'center',
    maxWidth: '58%',
    backgroundColor: 'transparent',
    paddingVertical: 4,
    paddingHorizontal: 2,
  },
  locationPinIcon: {
    marginRight: 4,
  },
  locationSelectorText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1C1C1E',
    letterSpacing: -0.2,
    maxWidth: 170,
  },
  locationChevron: {
    marginLeft: 3,
  },
  entryBody: {
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 32,
  },
  categorySectionHeader: {
    fontSize: 13,
    fontWeight: '600',
    color: '#8E8E93',
    letterSpacing: -0.1,
    marginBottom: 12,
  },
  categoryLabelsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryLabelPill: {
    paddingHorizontal: 13,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#F2F2F7',
  },
  categoryLabelText: {
    fontSize: 13.5,
    fontWeight: '500',
    color: '#1C1C1E',
    letterSpacing: -0.2,
  },

  // Results View Styles
  resultsContainer: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  resultsHeaderSurface: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? 8 : 4,
    paddingBottom: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: '#E5E5EA',
  },
  resultsTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 38,
    marginBottom: 8,
  },
  backRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  resultsHeaderTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
    letterSpacing: -0.3,
    marginLeft: 4,
  },
  resultsSearchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  filterIconBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    position: 'relative',
  },
  filterBadgeDot: {
    position: 'absolute',
    top: 5,
    right: 5,
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#007AFF',
  },
  resultsArea: {
    flex: 1,
  },
  resultsSummaryBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  resultsCountText: {
    fontSize: 13,
    color: '#8E8E93',
    fontWeight: '500',
    letterSpacing: -0.2,
  },
  resetActionText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#007AFF',
    letterSpacing: -0.2,
  },
  gridContent: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  gridRow: {
    justifyContent: 'space-between',
  },
  card: {
    width: '48.4%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 0.5,
    borderColor: '#E5E5EA',
    marginBottom: 12,
    overflow: 'hidden',
  },
  imageWrapper: {
    width: '100%',
    height: 136,
    backgroundColor: '#F2F2F7',
    position: 'relative',
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  featuredBadge: {
    position: 'absolute',
    bottom: 6,
    left: 6,
    backgroundColor: 'rgba(28, 28, 30, 0.78)',
    paddingHorizontal: 6,
    paddingVertical: 2.5,
    borderRadius: 5,
  },
  featuredBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  heartBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  heartIconShadow: {
    textShadowColor: 'rgba(0, 0, 0, 0.35)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  cardBody: {
    padding: 10,
  },
  cardPrice: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1C1C1E',
    letterSpacing: -0.3,
    marginBottom: 2,
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: '500',
    color: '#1C1C1E',
    letterSpacing: -0.2,
    marginBottom: 2,
  },
  cardSubtitle: {
    fontSize: 11.5,
    fontWeight: '400',
    color: '#8E8E93',
    marginBottom: 6,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 6,
    borderTopWidth: 0.5,
    borderTopColor: '#F2F2F7',
  },
  cardLocationText: {
    fontSize: 11,
    fontWeight: '400',
    color: '#8E8E93',
    marginLeft: 3,
    flex: 1,
  },
  centerState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  loadingText: {
    marginTop: 8,
    fontSize: 13,
    color: '#8E8E93',
    fontWeight: '400',
    letterSpacing: -0.2,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
    letterSpacing: -0.3,
  },
  emptySub: {
    fontSize: 13,
    color: '#8E8E93',
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 18,
    letterSpacing: -0.2,
  },
  resetPillBtn: {
    marginTop: 16,
    backgroundColor: '#007AFF',
    paddingHorizontal: 18,
    paddingVertical: 9,
    borderRadius: 8,
  },
  resetPillBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: -0.2,
  },

  // Modal Sheet Styles (macOS / Apple Sheet)
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    padding: 18,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: '#E5E5EA',
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#1C1C1E',
    letterSpacing: -0.3,
  },
  modalSectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#8E8E93',
    letterSpacing: -0.1,
    marginTop: 16,
    marginBottom: 8,
  },
  modalChipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  modalChip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    backgroundColor: '#F2F2F7',
  },
  modalChipActive: {
    backgroundColor: '#007AFF',
  },
  modalChipText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#1C1C1E',
    letterSpacing: -0.2,
  },
  modalChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  modalFooter: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 18,
    paddingTop: 12,
    borderTopWidth: 0.5,
    borderTopColor: '#E5E5EA',
  },
  modalResetBtn: {
    flex: 1,
    height: 44,
    borderRadius: 10,
    backgroundColor: '#F2F2F7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalResetText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1C1C1E',
    letterSpacing: -0.2,
  },
  modalApplyBtn: {
    flex: 2,
    height: 44,
    borderRadius: 10,
    backgroundColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalApplyText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: -0.2,
  },
});
