import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Dimensions,
  TextInput,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '../../context/AppContext';
import { getProductsApi, formatProductSubtitle } from '../../services/productApi';
import { API_BASE_URL } from '../../services/apiClient';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const CITIES = ['All', 'Indore', 'Bhopal', 'Mumbai', 'Bengaluru', 'Delhi'];
const RADII = ['5 km', '10 km', '25 km', '50 km'];
const CATEGORIES = [
  'All',
  'Cars',
  'Properties',
  'Mobiles',
  'Bikes',
  'Electronics & Appliances',
  'Furniture',
  'Fashion',
];

const CITY_ZONES = {
  All: ['Vijay Nagar', 'Indiranagar', 'Bandra West', 'Arera Colony', 'Connaught Place'],
  Indore: ['Vijay Nagar', 'Palasia', 'Bhawarkua', 'Super Corridor', 'Rajwada'],
  Bhopal: ['Arera Colony', 'MP Nagar', 'Kolar Road', 'New Market', 'Bairagarh'],
  Mumbai: ['Bandra West', 'Andheri East', 'Powai', 'Lower Parel', 'Juhu'],
  Bengaluru: ['Indiranagar', 'Koramangala', 'Whitefield', 'HSR Layout', 'Jayanagar'],
  Delhi: ['Connaught Place', 'Hauz Khas', 'Dwarka', 'Saket', 'Rohini'],
};

const PIN_POSITIONS = [
  { top: '20%', left: '16%' },
  { top: '24%', left: '62%' },
  { top: '42%', left: '24%' },
  { top: '38%', left: '68%' },
  { top: '58%', left: '18%' },
  { top: '55%', left: '56%' },
  { top: '28%', left: '42%' },
  { top: '65%', left: '40%' },
  { top: '16%', left: '46%' },
  { top: '48%', left: '46%' },
];

export const formatCompactPinPrice = (rawPrice) => {
  const num = Number(rawPrice) || 0;
  if (num >= 10000000) {
    return `₹ ${(num / 10000000).toFixed(2).replace(/\.00$/, '')}Cr`;
  }
  if (num >= 100000) {
    return `₹ ${(num / 100000).toFixed(1).replace(/\.0$/, '')}L`;
  }
  return `₹ ${num.toLocaleString('en-IN')}`;
};

export const resolveProductImage = (item) => {
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

export default function MapScreen({
  isEmbedded = false,
  externalProducts = null,
  selectedCategoryProp = null,
  selectedCityProp = null,
  searchQueryProp = '',
  onSelectCategoryProp = null,
  onSelectCityProp = null,
  onSwitchToList = null,
}) {
  const navigation = useNavigation();
  const route = useRoute();
  const insets = useSafeAreaInsets();
  const { watchlist = [], toggleWatchlist, currentLocation, formatPrice } = useApp();

  const initialCity =
    selectedCityProp ||
    route.params?.city ||
    (currentLocation?.city && CITIES.includes(currentLocation.city) ? currentLocation.city : 'All');
  const initialCategory = selectedCategoryProp || route.params?.category || 'All';

  const [selectedCity, setSelectedCity] = useState(initialCity);
  const [selectedRadius, setSelectedRadius] = useState('10 km');
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [searchQuery, setSearchQuery] = useState(searchQueryProp || route.params?.query || '');
  const [liveProducts, setLiveProducts] = useState([]);
  const [loading, setLoading] = useState(!externalProducts);
  const [selectedPinId, setSelectedPinId] = useState(null);
  const carouselRef = useRef(null);

  useEffect(() => {
    if (selectedCategoryProp !== null) setSelectedCategory(selectedCategoryProp);
  }, [selectedCategoryProp]);

  useEffect(() => {
    if (selectedCityProp !== null) setSelectedCity(selectedCityProp);
  }, [selectedCityProp]);

  useEffect(() => {
    if (searchQueryProp !== undefined) setSearchQuery(searchQueryProp);
  }, [searchQueryProp]);

  const fetchMapProducts = useCallback(async () => {
    if (Array.isArray(externalProducts)) {
      setLiveProducts(externalProducts);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const data = await getProductsApi();
      setLiveProducts(Array.isArray(data) ? data : []);
    } catch (_e) {
      setLiveProducts([]);
    } finally {
      setLoading(false);
    }
  }, [externalProducts]);

  useEffect(() => {
    fetchMapProducts();
  }, [fetchMapProducts]);

  const filteredListings = useMemo(() => {
    return liveProducts.filter((item) => {
      if (selectedCategory && selectedCategory !== 'All') {
        const itemCat = (item.category || '').toLowerCase();
        const target = selectedCategory.toLowerCase();
        const firstWord = target.split(' ')[0];
        if (!itemCat.includes(target) && !itemCat.includes(firstWord)) {
          return false;
        }
      }

      if (selectedCity && selectedCity !== 'All') {
        const loc = `${item.city || ''} ${item.location || ''}`.toLowerCase();
        if (!loc.includes(selectedCity.toLowerCase())) {
          return false;
        }
      }

      if (searchQuery && searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const hay = `${item.title || ''} ${item.productName || ''} ${item.description || ''} ${item.category || ''} ${item.location || ''} ${item.subtitle || ''}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }

      return true;
    });
  }, [liveProducts, selectedCategory, selectedCity, searchQuery]);

  useEffect(() => {
    if (filteredListings.length > 0 && !selectedPinId) {
      setSelectedPinId(filteredListings[0].id || filteredListings[0]._id);
    }
  }, [filteredListings, selectedPinId]);

  const handleCitySelect = (city) => {
    setSelectedCity(city);
    if (onSelectCityProp) onSelectCityProp(city);
  };

  const handleCategorySelect = (cat) => {
    setSelectedCategory(cat);
    if (onSelectCategoryProp) onSelectCategoryProp(cat);
  };

  const handlePinPress = (item, index) => {
    const id = item.id || item._id;
    setSelectedPinId(id);
    if (carouselRef.current) {
      carouselRef.current.scrollTo({
        x: Math.max(0, index * (SCREEN_WIDTH * 0.78 + 12) - 16),
        animated: true,
      });
    }
  };

  const handleOpenProduct = (item) => {
    navigation.navigate('ProductDetails', {
      id: item._id || item.id,
      product: item.rawProduct || item,
    });
  };

  const zones = CITY_ZONES[selectedCity] || CITY_ZONES.Indore;

  return (
    <View style={[styles.container, !isEmbedded && { paddingTop: Math.max(insets.top, 8) }]}>
      {!isEmbedded && (
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      )}

      {/* Standalone Top Header */}
      {!isEmbedded && (
        <View style={styles.topHeader}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => (navigation.canGoBack() ? navigation.goBack() : navigation.navigate('Main'))}
            activeOpacity={0.75}
          >
            <Ionicons name="arrow-back" size={22} color="#002F34" />
          </TouchableOpacity>

          <View style={styles.searchBox}>
            <Ionicons name="search" size={17} color="#002F34" />
            <TextInput
              style={styles.searchInput}
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search cars, mobiles, flats on map..."
              placeholderTextColor="#64748B"
              returnKeyType="search"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={17} color="#64748B" />
              </TouchableOpacity>
            )}
          </View>

          <TouchableOpacity
            style={styles.listSwitchBtn}
            onPress={() => {
              if (onSwitchToList) onSwitchToList();
              else navigation.navigate('Search', { query: searchQuery, category: selectedCategory });
            }}
            activeOpacity={0.8}
          >
            <Ionicons name="list" size={16} color="#002F34" />
            <Text style={styles.listSwitchText}>List</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* City & Radius Selector Bar */}
      <View style={styles.filterHeader}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.cityChipsScroll}
        >
          <View style={styles.radarBadge}>
            <View style={styles.liveDot} />
            <Text style={styles.radarBadgeText}>LIVE RADAR</Text>
          </View>

          {CITIES.map((city) => {
            const active = selectedCity === city;
            return (
              <TouchableOpacity
                key={city}
                style={[styles.cityChip, active && styles.cityChipActive]}
                onPress={() => handleCitySelect(city)}
                activeOpacity={0.8}
              >
                <Ionicons
                  name="location"
                  size={12}
                  color={active ? '#FFFFFF' : '#002F34'}
                  style={{ marginRight: 4 }}
                />
                <Text style={[styles.cityChipText, active && styles.cityChipTextActive]}>
                  {city === 'All' ? 'All Cities' : city}
                </Text>
              </TouchableOpacity>
            );
          })}

          <View style={styles.dividerVert} />

          {RADII.map((rad) => {
            const active = selectedRadius === rad;
            return (
              <TouchableOpacity
                key={rad}
                style={[styles.radiusChip, active && styles.radiusChipActive]}
                onPress={() => setSelectedRadius(rad)}
                activeOpacity={0.8}
              >
                <Text style={[styles.radiusChipText, active && styles.radiusChipTextActive]}>
                  {rad}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Category Filter Pills */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryScroll}
        >
          {CATEGORIES.map((cat) => {
            const active = selectedCategory === cat;
            return (
              <TouchableOpacity
                key={cat}
                style={[styles.catPill, active && styles.catPillActive]}
                onPress={() => handleCategorySelect(cat)}
                activeOpacity={0.8}
              >
                <Text style={[styles.catPillText, active && styles.catPillTextActive]}>
                  {cat}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Interactive Stylized Map Radar Canvas */}
      <View style={styles.mapCanvas}>
        {/* Stylized Map Roads & Blocks */}
        <View style={styles.mapParkZone1} />
        <View style={styles.mapParkZone2} />
        <View style={styles.mapWaterRiver} />
        <View style={[styles.mapRoadHorizontal, { top: '26%' }]} />
        <View style={[styles.mapRoadHorizontal, { top: '52%', height: 6 }]} />
        <View style={[styles.mapRoadHorizontal, { top: '76%' }]} />
        <View style={[styles.mapRoadVertical, { left: '28%' }]} />
        <View style={[styles.mapRoadVertical, { left: '54%', width: 6 }]} />
        <View style={[styles.mapRoadVertical, { left: '78%' }]} />

        {/* Concentric Radar Rings */}
        <View style={styles.radarCenterWrap} pointerEvents="none">
          <View style={styles.radarRingOuter} />
          <View style={styles.radarRingMid} />
          <View style={styles.radarRingInner} />
          <View style={styles.centerCityPin}>
            <Ionicons name="navigate" size={14} color="#FFFFFF" />
          </View>
          <View style={styles.centerCityLabelWrap}>
            <Text style={styles.centerCityLabelText}>
              {selectedCity === 'All' ? 'India Marketplace Radar' : `${selectedCity} • ${selectedRadius}`}
            </Text>
          </View>
        </View>

        {/* Neighborhood Labels */}
        {zones.map((zone, idx) => {
          const zonePos = [
            { top: '12%', left: '10%' },
            { top: '14%', right: '10%' },
            { top: '46%', left: '6%' },
            { top: '68%', right: '12%' },
            { top: '72%', left: '16%' },
          ][idx % 5];
          return (
            <View key={zone} style={[styles.zoneLabelWrap, zonePos]} pointerEvents="none">
              <Text style={styles.zoneLabelText}>{zone.toUpperCase()}</Text>
            </View>
          );
        })}

        {/* Top-Left Summary Pill on Map */}
        <View style={styles.mapCountOverlay}>
          <Ionicons name="pricetag" size={13} color="#1548A6" />
          <Text style={styles.mapCountText}>
            {filteredListings.length} {filteredListings.length === 1 ? 'Ad' : 'Ads'} in{' '}
            {selectedCity === 'All' ? 'All Cities' : selectedCity}
          </Text>
        </View>

        {/* Refresh Radar Button */}
        <TouchableOpacity
          style={styles.mapRefreshBtn}
          onPress={fetchMapProducts}
          activeOpacity={0.85}
        >
          <Ionicons name="refresh" size={16} color="#002F34" />
        </TouchableOpacity>

        {/* Live Listing Pins with Price Bubbles */}
        {loading ? (
          <View style={styles.mapLoadingWrap}>
            <ActivityIndicator size="small" color="#1548A6" />
            <Text style={styles.mapLoadingText}>Scanning live listings...</Text>
          </View>
        ) : (
          filteredListings.slice(0, 10).map((item, idx) => {
            const id = item.id || item._id;
            const isSelected = selectedPinId === id;
            const pos = PIN_POSITIONS[idx % PIN_POSITIONS.length];
            const bubblePrice = formatCompactPinPrice(item.price || item.productPrice || 0);

            return (
              <TouchableOpacity
                key={id || `pin-${idx}`}
                style={[
                  styles.pricePinWrap,
                  pos,
                  isSelected && styles.pricePinWrapSelected,
                ]}
                onPress={() => handlePinPress(item, idx)}
                activeOpacity={0.9}
              >
                <View
                  style={[
                    styles.pricePinBubble,
                    isSelected && styles.pricePinBubbleSelected,
                  ]}
                >
                  <Text
                    style={[
                      styles.pricePinText,
                      isSelected && styles.pricePinTextSelected,
                    ]}
                  >
                    {bubblePrice}
                  </Text>
                </View>
                <View
                  style={[
                    styles.pricePinArrow,
                    isSelected && styles.pricePinArrowSelected,
                  ]}
                />
              </TouchableOpacity>
            );
          })
        )}

        {/* Bottom Horizontal Carousel of Live Listings */}
        <View style={styles.carouselWrapper}>
          {filteredListings.length === 0 && !loading ? (
            <View style={styles.emptyMapCard}>
              <Ionicons name="location-outline" size={24} color="#002F34" />
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={styles.emptyMapTitle}>No ads found in this filter</Text>
                <Text style={styles.emptyMapSub}>
                  Try switching city to "All Cities" or selecting "All" categories.
                </Text>
              </View>
              <TouchableOpacity
                style={styles.resetMapBtn}
                onPress={() => {
                  handleCitySelect('All');
                  handleCategorySelect('All');
                  setSearchQuery('');
                }}
              >
                <Text style={styles.resetMapBtnText}>Reset</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <ScrollView
              ref={carouselRef}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.carouselScroll}
              snapToInterval={SCREEN_WIDTH * 0.78 + 12}
              decelerationRate="fast"
            >
              {filteredListings.map((item) => {
                const id = item.id || item._id;
                const isSelected = selectedPinId === id;
                const isSaved = (watchlist || []).includes(id);
                const subtitle = item.subtitle || formatProductSubtitle(item);
                const imageUri = resolveProductImage(item);
                const priceNum = Number(item.price || item.productPrice || 0);

                return (
                  <TouchableOpacity
                    key={id}
                    style={[
                      styles.carouselCard,
                      isSelected && styles.carouselCardActive,
                    ]}
                    onPress={() => handleOpenProduct(item)}
                    activeOpacity={0.92}
                  >
                    <Image
                      source={{ uri: imageUri }}
                      style={styles.carouselImage}
                      resizeMode="cover"
                    />

                    <View style={styles.carouselCardBody}>
                      <View style={styles.carouselTopRow}>
                        <Text style={styles.carouselPrice} numberOfLines={1}>
                          {formatPrice ? formatPrice(priceNum) : `₹ ${priceNum.toLocaleString('en-IN')}`}
                        </Text>
                        <TouchableOpacity
                          onPress={() => toggleWatchlist && toggleWatchlist(id)}
                          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                        >
                          <Ionicons
                            name={isSaved ? 'heart' : 'heart-outline'}
                            size={18}
                            color={isSaved ? '#E11D48' : '#002F34'}
                          />
                        </TouchableOpacity>
                      </View>

                      <Text style={styles.carouselTitle} numberOfLines={1}>
                        {item.title || item.productName}
                      </Text>

                      {subtitle ? (
                        <Text style={styles.carouselSubtitle} numberOfLines={1}>
                          {subtitle}
                        </Text>
                      ) : (
                        <Text style={styles.carouselSubtitle} numberOfLines={1}>
                          {item.category || 'Verified Ad'}
                        </Text>
                      )}

                      <View style={styles.carouselFooter}>
                        <View style={styles.carouselLocRow}>
                          <Ionicons name="location-outline" size={12} color="#64748B" />
                          <Text style={styles.carouselLocText} numberOfLines={1}>
                            {item.location || item.city || 'India'}
                          </Text>
                        </View>
                        <View style={styles.openPill}>
                          <Text style={styles.openPillText}>View</Text>
                          <Ionicons name="chevron-forward" size={11} color="#1548A6" />
                        </View>
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    gap: 8,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1.2,
    borderColor: '#002F34',
    borderRadius: 8,
    paddingHorizontal: 10,
    height: 40,
    gap: 6,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: '#002F34',
    fontWeight: '500',
    paddingVertical: 0,
  },
  listSwitchBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 10,
    height: 40,
    borderRadius: 8,
    gap: 4,
  },
  listSwitchText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#002F34',
  },
  filterHeader: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    paddingVertical: 8,
  },
  cityChipsScroll: {
    paddingHorizontal: 12,
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  radarBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 999,
    marginRight: 2,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#1548A6',
    marginRight: 5,
  },
  radarBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#1548A6',
    letterSpacing: 0.4,
  },
  cityChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  cityChipActive: {
    backgroundColor: '#002F34',
    borderColor: '#002F34',
  },
  cityChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#002F34',
  },
  cityChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  dividerVert: {
    width: 1,
    height: 20,
    backgroundColor: '#E2E8F0',
    marginHorizontal: 4,
  },
  radiusChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  radiusChipActive: {
    backgroundColor: '#1548A6',
    borderColor: '#1548A6',
  },
  radiusChipText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#475569',
  },
  radiusChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  categoryScroll: {
    paddingHorizontal: 12,
    gap: 6,
  },
  catPill: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 6,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  catPillActive: {
    backgroundColor: '#EFF6FF',
    borderColor: '#1548A6',
  },
  catPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  catPillTextActive: {
    color: '#1548A6',
    fontWeight: '700',
  },
  mapCanvas: {
    flex: 1,
    backgroundColor: '#EBF3FA',
    position: 'relative',
    overflow: 'hidden',
  },
  mapParkZone1: {
    position: 'absolute',
    top: '8%',
    left: '6%',
    width: 130,
    height: 110,
    borderRadius: 24,
    backgroundColor: '#DCFCE7',
    opacity: 0.65,
  },
  mapParkZone2: {
    position: 'absolute',
    bottom: '28%',
    right: '8%',
    width: 150,
    height: 110,
    borderRadius: 30,
    backgroundColor: '#DCFCE7',
    opacity: 0.6,
  },
  mapWaterRiver: {
    position: 'absolute',
    top: '-10%',
    right: '22%',
    width: 36,
    height: '120%',
    backgroundColor: '#BAE6FD',
    opacity: 0.65,
    transform: [{ rotate: '18deg' }],
  },
  mapRoadHorizontal: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: '#FFFFFF',
    opacity: 0.85,
  },
  mapRoadVertical: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 3,
    backgroundColor: '#FFFFFF',
    opacity: 0.85,
  },
  radarCenterWrap: {
    position: 'absolute',
    top: '38%',
    left: '50%',
    width: 300,
    height: 300,
    marginLeft: -150,
    marginTop: -150,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radarRingOuter: {
    position: 'absolute',
    width: 280,
    height: 280,
    borderRadius: 140,
    borderWidth: 1.5,
    borderColor: 'rgba(21, 72, 166, 0.22)',
    backgroundColor: 'rgba(21, 72, 166, 0.04)',
  },
  radarRingMid: {
    position: 'absolute',
    width: 190,
    height: 190,
    borderRadius: 95,
    borderWidth: 1.2,
    borderColor: 'rgba(21, 72, 166, 0.28)',
    backgroundColor: 'rgba(21, 72, 166, 0.05)',
  },
  radarRingInner: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 1.2,
    borderColor: 'rgba(21, 72, 166, 0.35)',
    backgroundColor: 'rgba(21, 72, 166, 0.07)',
  },
  centerCityPin: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#1548A6',
    borderWidth: 3,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
  },
  centerCityLabelWrap: {
    marginTop: 6,
    backgroundColor: 'rgba(0, 47, 52, 0.88)',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 999,
  },
  centerCityLabelText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  zoneLabelWrap: {
    position: 'absolute',
    backgroundColor: 'rgba(255, 255, 255, 0.78)',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 4,
  },
  zoneLabelText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.6,
  },
  mapCountOverlay: {
    position: 'absolute',
    top: 12,
    left: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 6,
    elevation: 3,
  },
  mapCountText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#002F34',
  },
  mapRefreshBtn: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
  },
  mapLoadingWrap: {
    position: 'absolute',
    top: 58,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 8,
  },
  mapLoadingText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#002F34',
  },
  pricePinWrap: {
    position: 'absolute',
    alignItems: 'center',
    zIndex: 10,
  },
  pricePinWrapSelected: {
    zIndex: 30,
    transform: [{ scale: 1.1 }],
  },
  pricePinBubble: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#002F34',
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 999,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 3,
  },
  pricePinBubbleSelected: {
    backgroundColor: '#002F34',
    borderColor: '#FFFFFF',
  },
  pricePinText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#002F34',
  },
  pricePinTextSelected: {
    color: '#FFFFFF',
  },
  pricePinArrow: {
    width: 0,
    height: 0,
    borderLeftWidth: 5,
    borderRightWidth: 5,
    borderTopWidth: 6,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#002F34',
    marginTop: -1,
  },
  pricePinArrowSelected: {
    borderTopColor: '#002F34',
  },
  carouselWrapper: {
    position: 'absolute',
    bottom: 14,
    left: 0,
    right: 0,
  },
  carouselScroll: {
    paddingHorizontal: 14,
    gap: 12,
  },
  carouselCard: {
    width: SCREEN_WIDTH * 0.78,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    flexDirection: 'row',
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
  },
  carouselCardActive: {
    borderColor: '#1548A6',
    borderWidth: 2,
  },
  carouselImage: {
    width: 108,
    height: 112,
    backgroundColor: '#F1F5F9',
  },
  carouselCardBody: {
    flex: 1,
    padding: 10,
    justifyContent: 'space-between',
  },
  carouselTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  carouselPrice: {
    fontSize: 16,
    fontWeight: '800',
    color: '#002F34',
  },
  carouselTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#002F34',
    marginTop: 2,
  },
  carouselSubtitle: {
    fontSize: 11,
    fontWeight: '600',
    color: '#475569',
    marginTop: 2,
  },
  carouselFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 6,
    paddingTop: 5,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  carouselLocRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 6,
  },
  carouselLocText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#64748B',
    marginLeft: 3,
    textTransform: 'uppercase',
  },
  openPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
  },
  openPillText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#1548A6',
    marginRight: 2,
  },
  emptyMapCard: {
    marginHorizontal: 14,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 4,
  },
  emptyMapTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#002F34',
  },
  emptyMapSub: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  resetMapBtn: {
    backgroundColor: '#002F34',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 6,
    marginLeft: 8,
  },
  resetMapBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
});
