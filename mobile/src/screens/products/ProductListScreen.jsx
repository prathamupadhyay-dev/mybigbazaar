import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  TextInput,
  ScrollView,
  ActivityIndicator,
  Modal,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useApp } from '../../context/AppContext';
import ScreenContainer from '../../components/ScreenContainer';
import { getProductsApi, formatProductSubtitle, resolveProductImageUrl } from '../../services/productApi';
import { getProductCategoriesApi } from '../../services/categoryApi';

const DEFAULT_CATEGORIES = [
  'All',
  'Cars',
  'Properties',
  'Mobiles',
  'Bikes',
  'Electronics & Appliances',
  'Furniture',
  'Fashion',
];

const SORT_OPTIONS = [
  { id: 'newest', label: 'Newest First' },
  { id: 'priceLow', label: 'Price: Low to High' },
  { id: 'priceHigh', label: 'Price: High to Low' },
];

const PRICE_RANGES = [
  { id: 'all', label: 'Any Price', min: 0, max: Infinity },
  { id: 'under_10k', label: 'Under ₹10,000', min: 0, max: 10000 },
  { id: '10k_50k', label: '₹10,000 – ₹50,000', min: 10000, max: 50000 },
  { id: '50k_2l', label: '₹50,000 – ₹2,00,000', min: 50000, max: 200000 },
  { id: 'above_2l', label: 'Above ₹2,00,000', min: 200000, max: Infinity },
];

export const ProductListScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { watchlist = [], toggleWatchlist, requireAuth, formatPrice, currentLocation } = useApp();
  const [searchQuery, setSearchQuery] = useState(route.params?.query || '');
  const [selectedCategory, setSelectedCategory] = useState(route.params?.category || 'All');
  const [sortBy, setSortBy] = useState('newest');
  const [selectedPriceRange, setSelectedPriceRange] = useState('all');
  const [showFilterModal, setShowFilterModal] = useState(false);

  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
  const [liveProducts, setLiveProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const locationDisplay = currentLocation?.city
    ? `${currentLocation.city}${currentLocation.state ? ', ' + currentLocation.state : ''}`
    : 'Kaveri Nagar, Indore';

  useEffect(() => {
    if (route.params?.category) setSelectedCategory(route.params.category);
    if (route.params?.query !== undefined) setSearchQuery(route.params.query);
  }, [route.params?.category, route.params?.query]);

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      setIsLoading(true);
      try {
        const [cats, prods] = await Promise.all([
          getProductCategoriesApi().catch(() => []),
          getProductsApi().catch(() => []),
        ]);
        if (isMounted) {
          if (Array.isArray(cats) && cats.length > 0) {
            const catNames = cats.map((c) => c.name || c.title).filter(Boolean);
            const merged = Array.from(new Set(['All', ...DEFAULT_CATEGORIES.slice(1), ...catNames]));
            setCategories(merged);
          }
          const mapped = (Array.isArray(prods) ? prods : []).map((p) => {
            const rawCat = typeof p.category === 'object' ? p.category?.name : p.category;
            const catIdCandidate = p.categoryId || (Array.isArray(p.productCategorysId) ? p.productCategorysId[0] : p.productCategorysId);
            const matchedCatName =
              rawCat ||
              (Array.isArray(cats) && cats.length > 0 && catIdCandidate
                ? cats.find((c) => String(c._id || c.id) === String(catIdCandidate))?.name
                : null) ||
              'General';
            const rawImg = Array.isArray(p.images) && p.images[0] ? p.images[0] : p.image || p.imageUrl || null;
            const locStr = typeof p.location === 'string' && p.location
              ? p.location
              : (p.location?.city || p.city || 'Indore');
            const resolvedImg = resolveProductImageUrl(rawImg);
            return {
              ...p,
              id: p._id || p.id,
              title: p.title || p.productName || 'Classified Listing',
              numericPrice: Number(p.price ?? p.productPrice ?? 0),
              subtitle: p.subtitle || formatProductSubtitle(p),
              location: locStr,
              imageUrl: resolvedImg,
              category: matchedCatName,
              condition: p.condition || 'Verified',
              sellerName: p.sellerName || p.seller?.name || p.seller?.fullName || 'Verified Seller',
              rawProduct: {
                ...p,
                location: locStr,
                category: matchedCatName,
                imageUrl: resolvedImg,
                images: Array.isArray(p.images) && p.images.length > 0 ? p.images.map(resolveProductImageUrl) : [resolvedImg]
              },
            };
          });
          setLiveProducts(mapped);
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    loadData();
    return () => {
      isMounted = false;
    };
  }, []);

  const filteredProducts = useMemo(() => {
    const rangeObj = PRICE_RANGES.find((r) => r.id === selectedPriceRange) || PRICE_RANGES[0];

    return liveProducts
      .filter((product) => {
        const q = searchQuery.toLowerCase().trim();
        const matchesSearch =
          !q ||
          (product.title || '').toLowerCase().includes(q) ||
          (product.category || '').toLowerCase().includes(q) ||
          (product.subtitle || '').toLowerCase().includes(q) ||
          (product.location || '').toLowerCase().includes(q);

        if (!matchesSearch) return false;

        if (rangeObj.id !== 'all') {
          const p = product.numericPrice || 0;
          if (p < rangeObj.min || p > rangeObj.max) return false;
        }

        if (selectedCategory === 'All') return true;
        const pCat = (product.category || '').toLowerCase();
        const target = selectedCategory.toLowerCase();
        const firstWord = target.split(' ')[0];
        return pCat.includes(target) || pCat.includes(firstWord);
      })
      .sort((a, b) => {
        if (sortBy === 'priceLow') return (a.numericPrice || 0) - (b.numericPrice || 0);
        if (sortBy === 'priceHigh') return (b.numericPrice || 0) - (a.numericPrice || 0);
        const dA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dB - dA;
      });
  }, [liveProducts, searchQuery, selectedCategory, sortBy, selectedPriceRange]);

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (selectedCategory !== 'All') count += 1;
    if (selectedPriceRange !== 'all') count += 1;
    if (sortBy !== 'newest') count += 1;
    return count;
  }, [selectedCategory, selectedPriceRange, sortBy]);

  const handleResetFilters = () => {
    setSelectedCategory('All');
    setSelectedPriceRange('all');
    setSortBy('newest');
    setSearchQuery('');
  };

  const handleProductPress = (product) => {
    navigation.navigate('ProductDetails', {
      id: product.id,
      product: product.rawProduct || product,
    });
  };

  const handleFavourite = (productId) => {
    requireAuth(navigation, () => {
      toggleWatchlist(productId);
    });
  };

  const renderProductCard = ({ item }) => {
    const isFavourited = watchlist.includes(item.id);
    return (
      <TouchableOpacity
        style={styles.productCard}
        onPress={() => handleProductPress(item)}
        activeOpacity={0.9}
      >
        <View style={styles.imageContainer}>
          <Image source={{ uri: item.imageUrl }} style={styles.productImage} resizeMode="cover" />
          <TouchableOpacity
            style={styles.favouriteBtn}
            onPress={() => handleFavourite(item.id)}
            activeOpacity={0.6}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons
              name={isFavourited ? 'heart' : 'heart-outline'}
              size={20}
              color={isFavourited ? '#FF2D55' : '#FFFFFF'}
              style={styles.heartIconShadow}
            />
          </TouchableOpacity>
        </View>
        <View style={styles.productInfo}>
          <Text style={styles.productPrice} numberOfLines={1}>
            {formatPrice ? formatPrice(item.numericPrice) : `₹ ${item.numericPrice.toLocaleString('en-IN')}`}
          </Text>
          <Text style={styles.productTitle} numberOfLines={1}>
            {item.title}
          </Text>
          <Text style={styles.subtitleMuted} numberOfLines={1}>
            {item.subtitle || item.category}
          </Text>
          <View style={styles.locationRow}>
            <Ionicons name="location-outline" size={11} color="#8E8E93" />
            <Text style={styles.locationText} numberOfLines={1}>
              {item.location}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <ScreenContainer noPadding style={styles.container}>
      {/* Search Result Header Surface: Location Selector on Top Right + Filter Icon on Right of Search Bar */}
      <View style={styles.headerSurface}>
        <View style={styles.topRow}>
          <TouchableOpacity
            style={styles.backRowLeft}
            onPress={() => navigation.goBack()}
            activeOpacity={0.5}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="chevron-back" size={24} color="#1C1C1E" />
            <Text style={styles.headerTitle} numberOfLines={1}>
              {selectedCategory === 'All' ? 'All Listings' : selectedCategory}
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

        {/* Search Bar + Filter Icon on Right Side */}
        <View style={styles.searchRow}>
          <View style={styles.searchInputContainer}>
            <Ionicons name="search" size={17} color="#8E8E93" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder={`Search in ${selectedCategory}...`}
              placeholderTextColor="#8E8E93"
              value={searchQuery}
              onChangeText={setSearchQuery}
              returnKeyType="search"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity
                onPress={() => setSearchQuery('')}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons name="close-circle" size={17} color="#8E8E93" />
              </TouchableOpacity>
            )}
          </View>

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

      {/* Results Count */}
      <View style={styles.resultsHeader}>
        <Text style={styles.resultsCount}>
          {filteredProducts.length} {filteredProducts.length === 1 ? 'result' : 'results'}
          {selectedCategory !== 'All' ? ` in ${selectedCategory}` : ''}
        </Text>
        {(activeFiltersCount > 0 || searchQuery.trim().length > 0) && (
          <TouchableOpacity onPress={handleResetFilters} activeOpacity={0.6}>
            <Text style={styles.resetActionText}>Reset</Text>
          </TouchableOpacity>
        )}
      </View>

      {isLoading ? (
        <View style={styles.emptyContainer}>
          <ActivityIndicator size="small" color="#8E8E93" />
        </View>
      ) : (
        <FlatList
          data={filteredProducts}
          renderItem={renderProductCard}
          keyExtractor={(item) => String(item.id)}
          numColumns={2}
          contentContainerStyle={styles.productList}
          columnWrapperStyle={styles.productRow}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="search-outline" size={38} color="#C7C7CC" />
              <Text style={styles.emptyTitle}>No Results Found</Text>
              <Text style={styles.emptySubtitle}>
                {searchQuery
                  ? `No listings matched "${searchQuery}". Try a different keyword.`
                  : 'No active listings in this category yet. Be the first to post!'}
              </Text>
              <TouchableOpacity
                style={styles.postAdEmptyBtn}
                onPress={() => navigation.navigate('PostAd')}
                activeOpacity={0.85}
              >
                <Text style={styles.postAdEmptyBtnText}>Post a Free Ad</Text>
              </TouchableOpacity>
            </View>
          }
        />
      )}

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
                  const active = sortBy === opt.id;
                  return (
                    <TouchableOpacity
                      key={opt.id}
                      style={[styles.modalChip, active && styles.modalChipActive]}
                      onPress={() => setSortBy(opt.id)}
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
                {categories.map((cat) => {
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
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  headerSurface: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? 10 : 6,
    paddingBottom: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: '#E5E5EA',
  },
  topRow: {
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
  headerTitle: {
    fontSize: 16,
    color: '#1C1C1E',
    fontWeight: '600',
    letterSpacing: -0.3,
    marginLeft: 4,
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
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
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
  resultsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  resultsCount: {
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
  productList: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  productRow: {
    justifyContent: 'space-between',
  },
  productCard: {
    width: '48.4%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 0.5,
    borderColor: '#E5E5EA',
    overflow: 'hidden',
  },
  imageContainer: {
    position: 'relative',
  },
  productImage: {
    width: '100%',
    height: 136,
    backgroundColor: '#F2F2F7',
  },
  favouriteBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heartIconShadow: {
    textShadowColor: 'rgba(0, 0, 0, 0.35)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  productInfo: {
    padding: 10,
  },
  productPrice: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1C1C1E',
    letterSpacing: -0.3,
    marginBottom: 2,
  },
  productTitle: {
    fontSize: 13,
    fontWeight: '500',
    color: '#1C1C1E',
    letterSpacing: -0.2,
    marginBottom: 2,
  },
  subtitleMuted: {
    fontSize: 11.5,
    fontWeight: '400',
    color: '#8E8E93',
    marginBottom: 6,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 6,
    borderTopWidth: 0.5,
    borderTopColor: '#F2F2F7',
  },
  locationText: {
    fontSize: 11,
    fontWeight: '400',
    color: '#8E8E93',
    marginLeft: 3,
    flex: 1,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 70,
    paddingHorizontal: 24,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
    marginTop: 10,
    letterSpacing: -0.3,
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#8E8E93',
    marginTop: 4,
    textAlign: 'center',
    maxWidth: 260,
    lineHeight: 18,
    letterSpacing: -0.2,
  },
  postAdEmptyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007AFF',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 16,
  },
  postAdEmptyBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: -0.2,
  },
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

export default ProductListScreen;
