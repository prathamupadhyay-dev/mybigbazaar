import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Text,
  Image,
  RefreshControl,
  Dimensions,
  Linking,
  Modal,
  Animated,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ScreenContainer from '../../components/ScreenContainer';
import HomeHeader from '../../components/home/HomeHeader';
import HeroBannerSlider from '../../components/home/HeroBannerSlider';
import { useApp } from '../../context/AppContext';
import { getProductsApi, formatProductSubtitle, resolveProductImageUrl } from '../../services/productApi';
import { API_BASE_URL } from '../../services/apiClient';
import {
  getProductCategoriesApi,
  FALLBACK_PRODUCT_CATEGORIES
} from '../../services/categoryApi';
import { getCmsBannersApi } from '../../services/homeApi';

const { width } = Dimensions.get('window');

// Color Palette for Categories
const CATEGORY_STYLE_PALETTE = {
  cars: { color: '#DC2626', bg: '#FEE2E2' },
  properties: { color: '#2563EB', bg: '#EFF6FF' },
  mobiles: { color: '#059669', bg: '#ECFDF5' },
  jobs: { color: '#D97706', bg: '#FEF3C7' },
  bikes: { color: '#E11D48', bg: '#FEE2E2' },
  electronics: { color: '#7C3AED', bg: '#F5F3FF' },
  'electronics & appliances': { color: '#7C3AED', bg: '#F5F3FF' },
  'commercial vehicles': { color: '#EA580C', bg: '#FFF7ED' },
  'commercial vehicles & spares': { color: '#EA580C', bg: '#FFF7ED' },
  furniture: { color: '#16A34A', bg: '#F0FDF4' },
  fashion: { color: '#BE185D', bg: '#FCE7F3' },
  'books, sports & hobbies': { color: '#0284C7', bg: '#E0F2FE' },
  books: { color: '#0284C7', bg: '#E0F2FE' },
  sports: { color: '#0284C7', bg: '#E0F2FE' },
  pets: { color: '#B45309', bg: '#FEF3C7' },
  services: { color: '#0891B2', bg: '#ECFEFF' },
  clothes: { color: '#BE185D', bg: '#FCE7F3' },
  bags: { color: '#9333EA', bg: '#F3E8FF' },
};

const resolveCategoryMedia = (cat) => {
  let imageUri = null;
  if (cat.image && typeof cat.image === 'string' && cat.image.trim()) {
    imageUri = cat.image.trim();
  } else if (Array.isArray(cat.images) && cat.images.length > 0 && typeof cat.images[0] === 'string') {
    imageUri = cat.images[0].trim();
  } else if (
    cat.icon &&
    typeof cat.icon === 'string' &&
    (cat.icon.startsWith('http://') || cat.icon.startsWith('https://') || cat.icon.startsWith('/uploads') || cat.icon.startsWith('data:'))
  ) {
    imageUri = cat.icon.trim();
  }

  if (imageUri) {
    if (imageUri.startsWith('/')) {
      const baseUrl = (API_BASE_URL || '').replace(/\/+$/, '');
      imageUri = `${baseUrl}${imageUri}`;
    }
    return { isImage: true, uri: imageUri };
  }

  let rawIcon = cat.icon || 'grid-outline';
  if (typeof rawIcon !== 'string' || !rawIcon.trim()) {
    rawIcon = 'grid-outline';
  }
  rawIcon = rawIcon.trim().toLowerCase();

  const ALIASES = {
    car: 'car-sport',
    vehicle: 'car-sport',
    vehicles: 'car-sport',
    mobile: 'phone-portrait',
    phone: 'phone-portrait',
    property: 'business',
    realestate: 'business',
    'real-estate': 'business',
    job: 'briefcase',
    bike: 'bicycle',
    motorcycle: 'bicycle',
    appliance: 'tv',
    appliances: 'tv',
    sport: 'football',
    sports: 'football',
    service: 'construct',
    services: 'construct',
    clothes: 'shirt',
    clothing: 'shirt',
    bag: 'briefcase',
    bags: 'briefcase',
  };

  const ioniconName = ALIASES[rawIcon] || rawIcon;
  const key = (cat.name || cat.title || '').toLowerCase().trim();
  const palette = CATEGORY_STYLE_PALETTE[key] || {
    color: '#0078FF',
    bg: '#F0F7FF',
  };

  return {
    isImage: false,
    icon: ioniconName,
    color: palette.color,
    bg: palette.bg,
  };
};

export default function HomeScreen() {
  const navigation = useNavigation();
  const { currentLocation, formatPrice, isAuthenticated, recentlyViewed = [], clearRecentlyViewed, watchlist = [], toggleWatchlist } = useApp();
  const [refreshing, setRefreshing] = useState(false);
  const [favorites, setFavorites] = useState({});
  const [liveProducts, setLiveProducts] = useState([]);
  const [categories, setCategories] = useState(FALLBACK_PRODUCT_CATEGORIES);
  const [categoriesModalVisible, setCategoriesModalVisible] = useState(false);
  const [promoBanner, setPromoBanner] = useState(null);
  const [bannerRefreshKey, setBannerRefreshKey] = useState(0);
  const scrollY = useRef(new Animated.Value(0)).current;

  // Fetch live products, categories & promotional banner from API
  const fetchHomeData = async () => {
    try {
      const [prodRes, catRes, promoRes] = await Promise.all([
        getProductsApi().catch(() => []),
        getProductCategoriesApi().catch(() => []),
        getCmsBannersApi('promotions').catch(() => null),
      ]);

      if (Array.isArray(promoRes) && promoRes.length > 0) {
        const activePromo = promoRes.find((b) => b.isActive !== false && b.status !== 'Inactive');
        if (activePromo && activePromo.imageUrl) {
          setPromoBanner(activePromo);
        } else {
          setPromoBanner(null);
        }
      } else {
        setPromoBanner(null);
      }

      const catIdMap = new Map();
      if (Array.isArray(catRes) && catRes.length > 0) {
        catRes.forEach((c) => {
          if (c._id || c.id) catIdMap.set(String(c._id || c.id), c.name);
        });
        const activeCats = catRes
          .filter((c) => c.isActive !== false && c.status !== 'Inactive')
          .sort((a, b) => {
            const oA = typeof a.sortOrder === 'number' && a.sortOrder > 0 ? a.sortOrder : 9999;
            const oB = typeof b.sortOrder === 'number' && b.sortOrder > 0 ? b.sortOrder : 9999;
            if (oA !== oB) return oA - oB;
            return (a.name || '').localeCompare(b.name || '');
          });
        if (activeCats.length > 0) {
          setCategories(activeCats);
        }
      }

      const rawList = Array.isArray(prodRes) ? prodRes : (prodRes?.products || prodRes?.data || []);
      const mapped = rawList.map((p, idx) => {
        const rawCat = typeof p.category === 'object' ? p.category?.name : p.category;
        const catIdCandidate = p.categoryId || (Array.isArray(p.productCategorysId) && p.productCategorysId[0]);
        const resolvedCategory = rawCat || (catIdCandidate && catIdMap.get(String(catIdCandidate))) || 'Classifieds';
        const resolvedImage = resolveProductImageUrl((p.images && p.images[0]) || p.image || p.imageUrl);
        return {
          id: p._id || p.id || `prod-${idx}`,
          title: (p.title || p.productName || p.name || 'Classified Item').toUpperCase(),
          price: typeof p.price === 'number' ? p.price : (typeof p.productPrice === 'number' ? p.productPrice : 0),
          originalPrice: p.originalPrice || p.productPrice || p.price || 0,
          discountPrice: p.discountPrice || p.productDiscountPrice || 0,
          isFeatured: Boolean(p.isFeatured),
          isElite: Boolean(p.isFeatured) || idx % 2 === 1,
          subtitle: p.subtitle || formatProductSubtitle(p) || null,
          location: (
            typeof p.location === 'string' && p.location
              ? p.location
              : p.city || p.location?.city || currentLocation?.city || 'INDORE'
          ).toUpperCase(),
          imageUrl: resolvedImage,
          phone: p.seller?.phone || p.seller?.phoneNumber || p.sellerPhone || p.contactPhone || '',
          views: typeof p.views === 'number' ? p.views : 0,
          sellerName: p.seller?.name || p.seller?.fullName || p.sellerName || 'Verified Seller',
          category: resolvedCategory,
          rawProduct: {
            ...p,
            category: resolvedCategory,
            imageUrl: resolvedImage,
            images: Array.isArray(p.images) && p.images.length > 0 ? p.images.map(resolveProductImageUrl) : [resolvedImage]
          },
        };
      });
      setLiveProducts(mapped);
    } catch (e) {
      setLiveProducts([]);
    }
  };

  useEffect(() => {
    AsyncStorage.getItem('@cached_active_categories').then(cached => {
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setCategories(parsed);
          }
        } catch (err) {}
      }
    }).catch(() => {});

    fetchHomeData();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      fetchHomeData();
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    setBannerRefreshKey((prev) => prev + 1);
    await fetchHomeData();
    setRefreshing(false);
  };

  useEffect(() => {
    if (Array.isArray(watchlist)) {
      const favMap = {};
      watchlist.forEach((w) => {
        if (w?.id || w?._id) favMap[w.id || w._id] = true;
      });
      setFavorites((prev) => ({ ...prev, ...favMap }));
    }
  }, [watchlist]);

  const toggleFavorite = (id) => {
    setFavorites((prev) => ({ ...prev, [id]: !prev[id] }));
    const item = liveProducts.find((p) => p.id === id);
    if (item && toggleWatchlist) {
      toggleWatchlist(item);
    }
  };

  // 1. Popular Products (Ranked by view count & featured status from live backend)
  const allPopularProducts = useMemo(() => {
    return [...liveProducts].sort((a, b) => (b.views || 0) - (a.views || 0));
  }, [liveProducts]);

  // 2. Trending Products (Discounted deals or newest live items)
  const allTrendingProducts = useMemo(() => {
    const liveDeals = liveProducts.filter(
      (p) => (p.originalPrice && p.price && p.originalPrice > p.price) || (p.discountPrice && p.discountPrice < p.price)
    );
    return liveDeals.length > 0 ? liveDeals : liveProducts;
  }, [liveProducts]);

  // 2.5 Featured Products (Promoted ads & featured live products)
  const allFeaturedProducts = useMemo(() => {
    const liveFeatured = liveProducts.filter((p) => p.isFeatured || p.isElite);
    return liveFeatured.length > 0 ? liveFeatured : liveProducts;
  }, [liveProducts]);

  // 3. Best Sellers (Dynamic sellers aggregated exclusively from live ads)
  const allBestSellers = useMemo(() => {
    const sellerMap = new Map();
    liveProducts.forEach((p) => {
      const name = p.sellerName || p.seller?.name || 'Verified Seller';
      if (name && !sellerMap.has(name)) {
        const initials = name
          .split(' ')
          .map((w) => w[0])
          .join('')
          .toUpperCase()
          .slice(0, 2);
        sellerMap.set(name, {
          id: `seller-${name.toLowerCase().replace(/\s+/g, '-')}`,
          name,
          avatarText: initials || 'SE',
          avatarColor: '#1548A6',
          avatarBg: '#EFF6FF',
          specialty: p.category || 'Classifieds & Deals',
          rating: 4.8,
          reviewsCount: 12,
          activeAdsCount: liveProducts.filter((x) => (x.sellerName || x.seller?.name || 'Verified Seller') === name).length,
          location: p.location || 'Indore',
          verified: true,
          badgeText: 'VERIFIED SELLER',
        });
      }
    });

    return Array.from(sellerMap.values()).slice(0, 4);
  }, [liveProducts]);

  // 4. Fresh Recommendations (Exclusively live items from backend)
  const allRecommendations = useMemo(() => {
    return liveProducts;
  }, [liveProducts]);

  // 5. Recently Viewed Items (Dynamic from browsing history or live listings)
  const displayRecentlyViewed = useMemo(() => {
    if (Array.isArray(recentlyViewed) && recentlyViewed.length > 0) {
      return recentlyViewed.map((item, idx) => ({
        id: item.id || item._id || `recent-${idx}`,
        title: (item.title || item.name || item.productName || 'Viewed Item').toUpperCase(),
        price: typeof item.price === 'number' ? item.price : (typeof item.productPrice === 'number' ? item.productPrice : 0),
        originalPrice: item.originalPrice || item.price || 0,
        subtitle: item.subtitle || formatProductSubtitle(item) || null,
        location: (typeof item.location === 'string' ? item.location : item.location?.city || currentLocation?.city || 'INDORE').toUpperCase(),
        imageUrl: item.imageUrl || (item.images && item.images[0]) || 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=600&auto=format&fit=crop&q=80',
        category: item.category || 'Classifieds',
        rawProduct: item.rawProduct || item,
      }));
    }
    return liveProducts.slice(0, 6);
  }, [recentlyViewed, liveProducts, currentLocation]);

  const handleCategoryPress = (cat) => {
    const name = cat.name || cat.title || cat.category || '';
    const isService = cat.isService || name.toLowerCase() === 'services' || cat.slug === 'services';
    if (isService) {
      navigation.navigate('Services');
    } else {
      navigation.navigate('ProductList', { category: name });
    }
  };

  return (
    <ScreenContainer noPadding style={styles.container}>
      {/* 1. Fixed Top Header (Logo, Location, Search, Wishlist, Notification) */}
      <HomeHeader
        categories={categories}
        onLocationPress={() => navigation.navigate('LocationSelector')}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        nestedScrollEnabled
        overScrollMode="never"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#0078FF']} />
        }
      >
        {/* 2. Hero Banner Slider (Direct Owner Ad Page @99) */}
        <HeroBannerSlider
          onSelectServices={() => navigation.navigate('Services')}
          refreshTrigger={bannerRefreshKey}
        />

        {/* 3. Categories 8x1 Horizontal Scroll + See All button at far right */}
        <View style={styles.categoriesSection}>
          <ScrollView
            horizontal
            nestedScrollEnabled
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesScroll}
          >
            {categories.slice(0, 8).map((cat) => {
              const media = resolveCategoryMedia(cat);
              const catName = cat.name || cat.title || 'Category';
              const catKey = cat._id || cat.id || catName;

              return (
                <TouchableOpacity
                  key={catKey}
                  style={styles.categoryItem}
                  onPress={() => handleCategoryPress(cat)}
                  activeOpacity={0.8}
                >
                  <View style={[styles.categoryTile, !media.isImage && { backgroundColor: media.bg }]}>
                    {media.isImage ? (
                      <Image
                        source={{ uri: media.uri }}
                        style={styles.categoryImage}
                        resizeMode="cover"
                      />
                    ) : (
                      <Ionicons name={media.icon} size={28} color={media.color} />
                    )}
                  </View>
                  <Text style={styles.categoryLabel} numberOfLines={2}>
                    {catName}
                  </Text>
                </TouchableOpacity>
              );
            })}

            {/* See All Button at the far right of the 8x1 row */}
            <TouchableOpacity
              style={styles.seeAllItem}
              onPress={() => setCategoriesModalVisible(true)}
              activeOpacity={0.8}
              accessibilityLabel="See all categories"
            >
              <View style={styles.seeAllTile}>
                <Ionicons name="grid-outline" size={22} color="#007AFF" />
              </View>
              <Text style={styles.seeAllLabel} numberOfLines={1}>
                See all
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>

        {/* 4. Popular Slider */}
        {allPopularProducts.length > 0 ? (
          <View style={styles.horizontalSection}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>Popular</Text>
            </View>

            <ScrollView
              horizontal
              nestedScrollEnabled
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.sliderContentContainer}
            >
              {allPopularProducts.map((item) => {
                const isFav = !!favorites[item.id];
                return (
                  <TouchableOpacity
                    key={item.id}
                    style={styles.sliderCard}
                    onPress={() => {
                      if (item.rawProduct) {
                        navigation.navigate('ProductDetails', { id: item.id, product: item.rawProduct });
                      } else {
                        navigation.navigate('ProductDetails', { id: item.id, product: item });
                      }
                    }}
                    activeOpacity={0.92}
                  >
                    <View style={styles.sliderImageWrapper}>
                      <Image source={{ uri: item.imageUrl }} style={styles.sliderImage} resizeMode="cover" />
                      <View style={styles.popularBadge}>
                        <Ionicons name="flame" size={10} color="#FFFFFF" style={{ marginRight: 3 }} />
                        <Text style={styles.popularBadgeText}>POPULAR</Text>
                      </View>
                      <TouchableOpacity
                        style={styles.sliderHeartBtn}
                        onPress={() => {
                          if (!isAuthenticated) navigation.navigate('AuthLanding');
                          else toggleFavorite(item.id);
                        }}
                        activeOpacity={0.7}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      >
                        <Ionicons
                          name={isFav ? 'heart' : 'heart-outline'}
                          size={21}
                          color={isFav ? '#FF2D55' : '#FFFFFF'}
                          style={styles.heartIconShadow}
                        />
                      </TouchableOpacity>
                    </View>
                    <View style={styles.sliderBody}>
                      <Text style={styles.sliderPrice}>{formatPrice(item.price)}</Text>
                      <Text style={styles.sliderTitle} numberOfLines={1}>{item.title}</Text>
                      <View style={styles.sliderSubtitleWrapper}>
                        <Text style={styles.sliderSubtitle} numberOfLines={1}>
                          {item.subtitle || item.category || 'Popular Deal'}
                        </Text>
                      </View>
                      <View style={styles.sliderFooter}>
                        <View style={styles.sliderLocationBox}>
                          <Ionicons name="location-outline" size={11} color="#7F9799" style={{ marginRight: 2 }} />
                          <Text style={styles.sliderLocationText} numberOfLines={1}>{item.location}</Text>
                        </View>
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        ) : null}

        {/* 5. Trending Slider */}
        {allTrendingProducts.length > 0 ? (
          <View style={styles.horizontalSection}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>Trending</Text>
            </View>

            <ScrollView
              horizontal
              nestedScrollEnabled
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.sliderContentContainer}
            >
              {allTrendingProducts.map((item) => {
                const isFav = !!favorites[item.id];
                return (
                  <TouchableOpacity
                    key={item.id}
                    style={styles.sliderCard}
                    onPress={() => {
                      if (item.rawProduct) {
                        navigation.navigate('ProductDetails', { id: item.id, product: item.rawProduct });
                      } else {
                        navigation.navigate('ProductDetails', { id: item.id, product: item });
                      }
                    }}
                    activeOpacity={0.92}
                  >
                    <View style={styles.sliderImageWrapper}>
                      <Image source={{ uri: item.imageUrl }} style={styles.sliderImage} resizeMode="cover" />
                      <View style={styles.trendingBadge}>
                        <Ionicons name="trending-up" size={10} color="#FFFFFF" style={{ marginRight: 3 }} />
                        <Text style={styles.trendingBadgeText}>TRENDING</Text>
                      </View>
                      <TouchableOpacity
                        style={styles.sliderHeartBtn}
                        onPress={() => {
                          if (!isAuthenticated) navigation.navigate('AuthLanding');
                          else toggleFavorite(item.id);
                        }}
                        activeOpacity={0.7}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      >
                        <Ionicons
                          name={isFav ? 'heart' : 'heart-outline'}
                          size={21}
                          color={isFav ? '#FF2D55' : '#FFFFFF'}
                          style={styles.heartIconShadow}
                        />
                      </TouchableOpacity>
                    </View>
                    <View style={styles.sliderBody}>
                      <View style={styles.trendingPriceRow}>
                        <Text style={styles.sliderPrice}>{formatPrice(item.price)}</Text>
                        {item.originalPrice && item.originalPrice > item.price ? (
                          <Text style={styles.strikethroughPrice}>{formatPrice(item.originalPrice)}</Text>
                        ) : null}
                      </View>
                      <Text style={styles.sliderTitle} numberOfLines={1}>{item.title}</Text>
                      <View style={styles.sliderSubtitleWrapper}>
                        <Text style={styles.sliderSubtitle} numberOfLines={1}>
                          {item.subtitle || item.category || 'Trending Deal'}
                        </Text>
                      </View>
                      <View style={styles.sliderFooter}>
                        <View style={styles.sliderLocationBox}>
                          <Ionicons name="location-outline" size={11} color="#7F9799" style={{ marginRight: 2 }} />
                          <Text style={styles.sliderLocationText} numberOfLines={1}>{item.location}</Text>
                        </View>
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        ) : null}

        {/* 5.5 Featured Slider */}
        {allFeaturedProducts.length > 0 ? (
          <View style={styles.horizontalSection}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>Featured</Text>
            </View>

            <ScrollView
              horizontal
              nestedScrollEnabled
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.sliderContentContainer}
            >
              {allFeaturedProducts.map((item) => {
                const isFav = !!favorites[item.id];
                return (
                  <TouchableOpacity
                    key={item.id}
                    style={styles.sliderCard}
                    onPress={() => {
                      if (item.rawProduct) {
                        navigation.navigate('ProductDetails', { id: item.id, product: item.rawProduct });
                      } else {
                        navigation.navigate('ProductDetails', { id: item.id, product: item });
                      }
                    }}
                    activeOpacity={0.92}
                  >
                    <View style={styles.sliderImageWrapper}>
                      <Image source={{ uri: item.imageUrl }} style={styles.sliderImage} resizeMode="cover" />
                      <View style={styles.featuredBadge}>
                        <Ionicons name="sparkles" size={10} color="#FFFFFF" style={{ marginRight: 3 }} />
                        <Text style={styles.featuredBadgeText}>FEATURED</Text>
                      </View>
                      <TouchableOpacity
                        style={styles.sliderHeartBtn}
                        onPress={() => {
                          if (!isAuthenticated) navigation.navigate('AuthLanding');
                          else toggleFavorite(item.id);
                        }}
                        activeOpacity={0.7}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      >
                        <Ionicons
                          name={isFav ? 'heart' : 'heart-outline'}
                          size={21}
                          color={isFav ? '#FF2D55' : '#FFFFFF'}
                          style={styles.heartIconShadow}
                        />
                      </TouchableOpacity>
                    </View>
                    <View style={styles.sliderBody}>
                      <Text style={styles.sliderPrice}>{formatPrice(item.price)}</Text>
                      <Text style={styles.sliderTitle} numberOfLines={1}>{item.title}</Text>
                      <View style={styles.sliderSubtitleWrapper}>
                        <Text style={styles.sliderSubtitle} numberOfLines={1}>
                          {item.subtitle || item.category || 'Featured'}
                        </Text>
                      </View>
                      <View style={styles.sliderFooter}>
                        <View style={styles.sliderLocationBox}>
                          <Ionicons name="location-outline" size={11} color="#7F9799" style={{ marginRight: 2 }} />
                          <Text style={styles.sliderLocationText} numberOfLines={1}>{item.location}</Text>
                        </View>
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        ) : null}

        {/* 6. Promotional Ad Campaign Banner */}
        {promoBanner?.imageUrl ? (
          <View style={styles.promoBannerContainer}>
            <TouchableOpacity
              style={styles.promoBannerCard}
              onPress={() => {
                const target = promoBanner?.targetScreen || 'PostAd';
                if (promoBanner?.linkUrl && promoBanner.linkUrl.startsWith('http')) {
                  Linking.openURL(promoBanner.linkUrl).catch(() => {});
                } else {
                  navigation.navigate(target);
                }
              }}
              activeOpacity={0.92}
            >
              <Image
                source={{
                  uri: promoBanner.imageUrl.startsWith('http')
                    ? promoBanner.imageUrl
                    : `${(API_BASE_URL && typeof API_BASE_URL === 'string' && API_BASE_URL !== 'undefined') ? API_BASE_URL.replace(/\/+$/, '') : 'https://backend.mybigbazaar.com'}${promoBanner.imageUrl.startsWith('/') ? '' : '/'}${promoBanner.imageUrl}`
                }}
                style={styles.promoBannerFullImage}
                resizeMode="cover"
              />
            </TouchableOpacity>
          </View>
        ) : null}

        {/* 7. Best Sellers Grid */}
        {allBestSellers.length > 0 ? (
          <View style={styles.bestSellersSection}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>Best Sellers</Text>
            </View>

            <View style={styles.bestSellersGrid}>
              {allBestSellers.slice(0, 4).map((seller) => (
                <TouchableOpacity
                  key={seller.id}
                  style={styles.sellerCard}
                  onPress={() => navigation.navigate('SellerProfile', {
                    sellerName: seller.name,
                    sellerRating: seller.rating,
                    sellerLocation: seller.location,
                    sellerCategory: seller.specialty,
                  })}
                  activeOpacity={0.88}
                >
                  <View style={styles.sellerHeader}>
                    <View style={[styles.sellerAvatar, { backgroundColor: seller.avatarBg }]}>
                      <Text style={[styles.sellerAvatarText, { color: seller.avatarColor }]}>
                        {seller.avatarText}
                      </Text>
                      {seller.verified && (
                        <View style={styles.verifiedCheckBadge}>
                          <Ionicons name="checkmark-circle" size={14} color="#10B981" />
                        </View>
                      )}
                    </View>
                    <View style={styles.sellerBadgePill}>
                      <Text style={styles.sellerBadgePillText}>{seller.badgeText}</Text>
                    </View>
                  </View>

                  <Text style={styles.sellerName} numberOfLines={1}>{seller.name}</Text>
                  <Text style={styles.sellerSpecialty} numberOfLines={1}>{seller.specialty}</Text>

                  <View style={styles.sellerMetricsRow}>
                    <View style={styles.sellerRatingBox}>
                      <Ionicons name="star" size={11} color="#F59E0B" style={{ marginRight: 2 }} />
                      <Text style={styles.sellerRatingText}>{seller.rating}</Text>
                    </View>
                    <Text style={styles.sellerAdsCount}>{seller.activeAdsCount} ads</Text>
                  </View>

                  <View style={styles.sellerLocationRow}>
                    <Ionicons name="location-outline" size={10} color="#7F9799" style={{ marginRight: 2 }} />
                    <Text style={styles.sellerLocationText} numberOfLines={1}>{seller.location}</Text>
                  </View>

                  <View style={styles.viewStoreBtn}>
                    <Text style={styles.viewStoreBtnText}>View Store</Text>
                    <Ionicons name="chevron-forward" size={11} color="#0078FF" />
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ) : null}

        {/* Recently Viewed Items Section (Slider) */}
        {displayRecentlyViewed.length > 0 ? (
          <View style={styles.horizontalSection}>
            <View style={styles.sectionHeaderRow}>
              <View style={styles.recentlyViewedHeaderLeft}>
                <Ionicons name="time-outline" size={19} color="#002F34" style={{ marginRight: 6 }} />
                <Text style={styles.sectionTitle}>Recently Viewed</Text>
              </View>
              {Array.isArray(recentlyViewed) && recentlyViewed.length > 0 && clearRecentlyViewed ? (
                <TouchableOpacity onPress={clearRecentlyViewed} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                  <Text style={styles.clearRecentText}>Clear</Text>
                </TouchableOpacity>
              ) : null}
            </View>

            <ScrollView
              horizontal
              nestedScrollEnabled
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.sliderContentContainer}
            >
              {displayRecentlyViewed.map((item) => {
                const isFav = !!favorites[item.id];
                return (
                  <TouchableOpacity
                    key={item.id}
                    style={styles.sliderCard}
                    onPress={() => {
                      if (item.rawProduct) {
                        navigation.navigate('ProductDetails', { id: item.id, product: item.rawProduct });
                      } else {
                        navigation.navigate('ProductDetails', { id: item.id, product: item });
                      }
                    }}
                    activeOpacity={0.92}
                  >
                    <View style={styles.sliderImageWrapper}>
                      <Image source={{ uri: item.imageUrl }} style={styles.sliderImage} resizeMode="cover" />
                      <View style={styles.recentViewedBadge}>
                        <Ionicons name="eye-outline" size={10} color="#FFFFFF" style={{ marginRight: 3 }} />
                        <Text style={styles.recentViewedBadgeText}>VIEWED</Text>
                      </View>
                      <TouchableOpacity
                        style={styles.sliderHeartBtn}
                        onPress={() => {
                          if (!isAuthenticated) navigation.navigate('AuthLanding');
                          else toggleFavorite(item.id);
                        }}
                        activeOpacity={0.7}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      >
                        <Ionicons
                          name={isFav ? 'heart' : 'heart-outline'}
                          size={21}
                          color={isFav ? '#FF2D55' : '#FFFFFF'}
                          style={styles.heartIconShadow}
                        />
                      </TouchableOpacity>
                    </View>
                    <View style={styles.sliderBody}>
                      <Text style={styles.sliderPrice}>{formatPrice(item.price)}</Text>
                      <Text style={styles.sliderTitle} numberOfLines={1}>{item.title}</Text>
                      <View style={styles.sliderSubtitleWrapper}>
                        <Text style={styles.sliderSubtitle} numberOfLines={1}>
                          {item.subtitle || item.category || 'Classified'}
                        </Text>
                      </View>
                      <View style={styles.sliderFooter}>
                        <View style={styles.sliderLocationBox}>
                          <Ionicons name="location-outline" size={11} color="#7F9799" style={{ marginRight: 2 }} />
                          <Text style={styles.sliderLocationText} numberOfLines={1}>{item.location}</Text>
                        </View>
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        ) : null}

        {/* 8. Fresh Recommendations Section */}
        <View style={styles.recommendationsSection}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Fresh recommendations</Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('Map')}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: '#EFF6FF',
                paddingHorizontal: 10,
                paddingVertical: 5,
                borderRadius: 16,
                borderWidth: 1,
                borderColor: '#BFDBFE'
              }}
              activeOpacity={0.8}
            >
              <Ionicons name="map-outline" size={13} color="#1548A6" style={{ marginRight: 4 }} />
              <Text style={{ fontSize: 11, fontWeight: '700', color: '#1548A6' }}>Map View</Text>
            </TouchableOpacity>
          </View>

          {allRecommendations.length === 0 ? (
            <View
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: 14,
                borderWidth: 1,
                borderColor: '#E2E8F0',
                padding: 28,
                alignItems: 'center',
                marginTop: 8
              }}
            >
              <Ionicons name="pricetag-outline" size={38} color="#94A3B8" />
              <Text style={{ fontSize: 16, fontWeight: '800', color: '#002F34', marginTop: 10 }}>
                No Live Listings Yet
              </Text>
              <Text
                style={{
                  fontSize: 13,
                  color: '#64748B',
                  textAlign: 'center',
                  marginTop: 4,
                  marginBottom: 16,
                  lineHeight: 19
                }}
              >
                Post an ad now to list your item on BigBazaar Marketplace.
              </Text>
              <TouchableOpacity
                onPress={() => navigation.navigate('PostAd')}
                style={{
                  backgroundColor: '#002F34',
                  paddingHorizontal: 20,
                  paddingVertical: 11,
                  borderRadius: 999,
                  flexDirection: 'row',
                  alignItems: 'center'
                }}
                activeOpacity={0.85}
              >
                <Ionicons name="add-circle-outline" size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
                <Text style={{ color: '#FFFFFF', fontSize: 13, fontWeight: '700' }}>Post Free Ad</Text>
              </TouchableOpacity>
            </View>
          ) : (
            /* 2-Column Product Cards Grid */
            <View style={styles.productGrid}>
              {allRecommendations.map((item) => {
                const isFav = !!favorites[item.id];
                const isElite = !!item.isElite;

                return (
                  <TouchableOpacity
                    key={item.id}
                    style={[
                      styles.cardContainer,
                      isElite && styles.cardContainerElite
                    ]}
                    onPress={() => {
                      if (item.rawProduct) {
                        navigation.navigate('ProductDetails', { id: item.id, product: item.rawProduct });
                      } else {
                        navigation.navigate('ProductDetails', { id: item.id, product: item });
                      }
                    }}
                    activeOpacity={0.92}
                  >
                    <View style={styles.cardImageWrapper}>
                      <Image
                        source={{ uri: item.imageUrl }}
                        style={styles.cardImage}
                        resizeMode="cover"
                      />

                      {isElite && (
                        <View style={styles.eliteBadgeOverlay}>
                          <Ionicons name="ribbon" size={10} color="#FFFFFF" style={{ marginRight: 3 }} />
                          <Text style={styles.eliteBadgeText}>ELITE</Text>
                        </View>
                      )}

                      <TouchableOpacity
                        style={styles.cardHeartBtn}
                        onPress={() => {
                          if (!isAuthenticated) {
                            navigation.navigate('AuthLanding');
                          } else {
                            toggleFavorite(item.id);
                          }
                        }}
                        activeOpacity={0.7}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      >
                        <Ionicons
                          name={isFav ? 'heart' : 'heart-outline'}
                          size={21}
                          color={isFav ? '#FF2D55' : '#FFFFFF'}
                          style={styles.heartIconShadow}
                        />
                      </TouchableOpacity>
                    </View>

                    <View style={styles.cardBody}>
                      <Text style={styles.cardPrice}>
                        {formatPrice(item.price)}
                      </Text>

                      <Text style={styles.cardTitle} numberOfLines={1}>
                        {item.title}
                      </Text>

                      <View style={styles.cardSubtitleWrapper}>
                        {item.subtitle ? (
                          <Text style={styles.cardSubtitle} numberOfLines={1}>
                            {item.subtitle}
                          </Text>
                        ) : null}
                      </View>

                      <View style={styles.cardFooter}>
                        <View style={styles.cardLocationBox}>
                          <Ionicons name="location-outline" size={11} color="#7F9799" style={{ marginRight: 3, flexShrink: 0 }} />
                          <Text style={styles.cardLocationText} numberOfLines={1} ellipsizeMode="tail">
                            {item.location}
                          </Text>
                        </View>

                        {isElite && item.phone ? (
                          <TouchableOpacity
                            style={styles.cardCallBtn}
                            onPress={() => {
                              if (!isAuthenticated) {
                                navigation.navigate('AuthLanding');
                              } else {
                                Linking.openURL(`tel:${item.phone}`);
                              }
                            }}
                            activeOpacity={0.8}
                          >
                            <Ionicons name="call" size={13} color="#FFFFFF" />
                          </TouchableOpacity>
                        ) : null}
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </View>
      </ScrollView>

      {/* 5. "See All" Categories Modal */}
      <Modal
        visible={categoriesModalVisible}
        animationType="slide"
        onRequestClose={() => setCategoriesModalVisible(false)}
      >
        <SafeAreaView style={styles.splitModalSafe}>
          {/* Top Header */}
          <View style={styles.splitHeader}>
            <TouchableOpacity
              onPress={() => setCategoriesModalVisible(false)}
              style={styles.splitBackButton}
              accessibilityLabel="Back to Home"
            >
              <Ionicons name="arrow-back" size={24} color="#002F34" />
            </TouchableOpacity>
            <Text style={styles.splitHeaderTitle}>Categories</Text>
            <View style={{ width: 36 }} />
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.splitRightScroll}
          >
            <View style={styles.subCatGrid}>
              {categories.map((cat, index) => {
                const media = resolveCategoryMedia(cat);
                const catName = cat.name || cat.title || 'Category';
                const catKey = cat._id || cat.id || `all-cat-${index}`;

                return (
                  <TouchableOpacity
                    key={catKey}
                    style={styles.subCatGridItem}
                    onPress={() => {
                      setCategoriesModalVisible(false);
                      handleCategoryPress(cat);
                    }}
                    activeOpacity={0.7}
                  >
                    <View
                      style={[
                        styles.subCatCircle,
                        !media.isImage && { backgroundColor: media.bg },
                      ]}
                    >
                      {media.isImage ? (
                        <Image
                          source={{ uri: media.uri }}
                          style={styles.subCatImage}
                          resizeMode="cover"
                        />
                      ) : (
                        <Ionicons
                          name={media.icon}
                          size={28}
                          color={media.color}
                        />
                      )}
                    </View>
                    <Text style={styles.subCatLabel} numberOfLines={2}>
                      {catName}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Warm Yellow Sell CTA Card */}
            <TouchableOpacity
              style={styles.sellCtaCard}
              onPress={() => {
                setCategoriesModalVisible(false);
                navigation.navigate('PostAd');
              }}
              activeOpacity={0.88}
            >
              <View style={styles.sellCtaAvatarCircle}>
                <Ionicons name="search" size={15} color="#0284C7" />
              </View>
              <Text style={styles.sellCtaText}>
                Have something to sell? List here
              </Text>
              <Ionicons name="chevron-forward" size={15} color="#0F172A" style={{ marginLeft: 'auto' }} />
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </ScreenContainer>
  );
}

const CARD_WIDTH = (width - 28 - 10) / 2;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  scrollContent: {
    paddingBottom: 24,
  },

  // 8x1 Category Scroll + See All Item
  categoriesSection: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 14,
    borderBottomWidth: 0.5,
    borderBottomColor: '#E5E5EA',
  },
  categoriesScroll: {
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  categoryItem: {
    width: 68,
    alignItems: 'center',
  },
  categoryTile: {
    width: 58,
    height: 58,
    borderRadius: 16,
    backgroundColor: '#F2F2F7',
    borderWidth: 0.5,
    borderColor: '#E5E5EA',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 5,
    overflow: 'hidden',
  },
  categoryImage: {
    width: '100%',
    height: '100%',
    borderRadius: 16,
  },
  categoryLabel: {
    fontSize: 10.5,
    fontWeight: '500',
    color: '#1C1C1E',
    textAlign: 'center',
    lineHeight: 13,
  },
  seeAllItem: {
    width: 68,
    alignItems: 'center',
  },
  seeAllTile: {
    width: 58,
    height: 58,
    borderRadius: 16,
    backgroundColor: '#F2F2F7',
    borderWidth: 0.5,
    borderColor: '#E5E5EA',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 5,
  },
  seeAllLabel: {
    fontSize: 10.5,
    fontWeight: '600',
    color: '#007AFF',
    textAlign: 'center',
    lineHeight: 13,
  },

  // Horizontal Slider Sections (Popular & Trending)
  horizontalSection: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 14,
    borderBottomWidth: 0.5,
    borderBottomColor: '#E5E5EA',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1C1C1E',
    letterSpacing: -0.3,
  },
  seeAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 6,
  },
  seeAllBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#007AFF',
    marginRight: 2,
  },
  sliderContentContainer: {
    paddingHorizontal: 14,
    gap: 10,
  },
  sliderCard: {
    width: 172,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 0.5,
    borderColor: '#E5E5EA',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  sliderImageWrapper: {
    width: '100%',
    height: 135,
    backgroundColor: '#F2F2F7',
    position: 'relative',
    overflow: 'hidden',
  },
  sliderImage: {
    width: '100%',
    height: '100%',
  },
  popularBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#EA580C',
    paddingHorizontal: 7,
    paddingVertical: 2.5,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 10,
  },
  popularBadgeText: {
    color: '#FFFFFF',
    fontSize: 9.5,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  trendingBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#007AFF',
    paddingHorizontal: 7,
    paddingVertical: 2.5,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 10,
  },
  trendingBadgeText: {
    color: '#FFFFFF',
    fontSize: 9.5,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  featuredBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#D97706',
    paddingHorizontal: 7,
    paddingVertical: 2.5,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 10,
  },
  featuredBadgeText: {
    color: '#FFFFFF',
    fontSize: 9.5,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  recentViewedBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#002F34',
    paddingHorizontal: 7,
    paddingVertical: 2.5,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 10,
  },
  recentViewedBadgeText: {
    color: '#23E5DB',
    fontSize: 9.5,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  recentlyViewedHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  clearRecentText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0078FF',
  },
  sliderHeartBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  sliderBody: {
    padding: 8,
  },
  sliderPrice: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1C1C1E',
    marginBottom: 2,
    lineHeight: 19,
  },
  trendingPriceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
    marginBottom: 2,
  },
  strikethroughPrice: {
    fontSize: 11,
    color: '#9CA3AF',
    textDecorationLine: 'line-through',
  },
  sliderTitle: {
    fontSize: 12,
    fontWeight: '500',
    color: '#1C1C1E',
    marginBottom: 2,
    lineHeight: 16,
  },
  sliderSubtitleWrapper: {
    height: 16,
    justifyContent: 'center',
    marginBottom: 2,
  },
  sliderSubtitle: {
    fontSize: 11,
    color: '#8E8E93',
  },
  sliderFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 28,
    marginTop: 2,
  },
  sliderLocationBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 4,
  },
  sliderLocationText: {
    fontSize: 10,
    color: '#8E8E93',
    fontWeight: '500',
  },
  viewsCountBox: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewsCountText: {
    fontSize: 9.5,
    color: '#8E8E93',
    fontWeight: '600',
  },
  trendingTagSmall: {
    fontSize: 9.5,
    color: '#007AFF',
    fontWeight: '700',
  },

  // Promotional Banner (Pure Image Container for Ad Campaigns)
  promoBannerContainer: {
    paddingHorizontal: 14,
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 0.5,
    borderBottomColor: '#E5E5EA',
  },
  promoBannerCard: {
    width: '100%',
    height: Math.round((width - 28) * 0.42),
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#F5F5F4',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  promoBannerFullImage: {
    width: '100%',
    height: '100%',
  },

  // Best Sellers Grid
  bestSellersSection: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 14,
    borderBottomWidth: 0.5,
    borderBottomColor: '#E5E5EA',
  },
  bestSellersGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 14,
    gap: 10,
  },
  sellerCard: {
    width: CARD_WIDTH,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 0.5,
    borderColor: '#E5E5EA',
    padding: 12,
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  sellerHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  sellerAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  sellerAvatarText: {
    fontSize: 13,
    fontWeight: '700',
  },
  verifiedCheckBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: '#FFFFFF',
    borderRadius: 7,
  },
  sellerBadgePill: {
    backgroundColor: '#F2F2F7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  sellerBadgePillText: {
    fontSize: 7.5,
    fontWeight: '700',
    color: '#475569',
  },
  sellerName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1C1C1E',
    marginBottom: 2,
  },
  sellerSpecialty: {
    fontSize: 10.5,
    color: '#8E8E93',
    marginBottom: 8,
  },
  sellerMetricsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  sellerRatingBox: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sellerRatingText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#B45309',
  },
  sellerAdsCount: {
    fontSize: 10.5,
    color: '#8E8E93',
    fontWeight: '500',
  },
  sellerLocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  sellerLocationText: {
    fontSize: 10,
    color: '#8E8E93',
    flex: 1,
  },
  viewStoreBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F2F2F7',
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 0.5,
    borderColor: '#E5E5EA',
  },
  viewStoreBtnText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#007AFF',
    marginRight: 2,
  },

  // Recommendations Grid
  recommendationsSection: {
    paddingTop: 16,
  },
  sectionHeader: {
    marginBottom: 12,
  },
  productGrid: {
    paddingHorizontal: 14,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 10,
  },

  // Unified Card Container
  cardContainer: {
    width: CARD_WIDTH,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 0.5,
    borderColor: '#E5E5EA',
    overflow: 'hidden',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  cardContainerElite: {
    borderWidth: 1,
    borderColor: '#007AFF',
  },

  // Image Area
  cardImageWrapper: {
    width: '100%',
    height: 140,
    backgroundColor: '#F2F2F7',
    position: 'relative',
    overflow: 'hidden',
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },

  // Elite Badge Overlay
  eliteBadgeOverlay: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#007AFF',
    paddingHorizontal: 7,
    paddingVertical: 2.5,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 10,
  },
  eliteBadgeText: {
    color: '#FFFFFF',
    fontSize: 9.5,
    fontWeight: '700',
    letterSpacing: 0.5,
  },

  // Heart Button: Apple design (pure icon without white background)
  cardHeartBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  heartIconShadow: {
    textShadowColor: 'rgba(0, 0, 0, 0.45)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },

  // Card Body
  cardBody: {
    padding: 8,
  },
  cardPrice: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1C1C1E',
    marginBottom: 2,
    lineHeight: 19,
  },
  cardTitle: {
    fontSize: 12,
    fontWeight: '500',
    color: '#1C1C1E',
    marginBottom: 2,
    lineHeight: 16,
  },
  cardSubtitleWrapper: {
    height: 16,
    justifyContent: 'center',
    marginBottom: 2,
  },
  cardSubtitle: {
    fontSize: 11,
    color: '#8E8E93',
  },

  // Footer Row: Location & Call Button
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 32,
    marginTop: 2,
  },
  cardLocationBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 8,
    overflow: 'hidden',
  },
  cardLocationText: {
    flex: 1,
    fontSize: 10,
    color: '#8E8E93',
    fontWeight: '500',
  },
  cardCallBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },

  // "See All" Categories Split-Screen View
  splitModalSafe: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  splitHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  splitBackButton: {
    width: 36,
    height: 36,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  splitHeaderTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#002F34',
  },
  splitBody: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
  },

  // Left Rail (Categories navigation rail)
  splitLeftRail: {
    width: 92,
    backgroundColor: '#EDF4F9',
    borderRightWidth: 1,
    borderRightColor: '#E2E8F0',
  },
  splitRailItem: {
    width: '100%',
    paddingVertical: 14,
    paddingHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    backgroundColor: 'transparent',
  },
  splitRailItemActive: {
    backgroundColor: '#FFFFFF',
  },
  splitActiveBar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 3.5,
    backgroundColor: '#0078FF',
    borderTopRightRadius: 2,
    borderBottomRightRadius: 2,
  },
  splitRailIconWrapper: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  splitRailImage: {
    width: 34,
    height: 34,
  },
  splitRailLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: '#002F34',
    textAlign: 'center',
    lineHeight: 14,
  },
  splitRailLabelActive: {
    color: '#002F34',
    fontWeight: '700',
  },

  // Right Panel (Subcategories & Car sections)
  splitRightPanel: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  splitLoadingBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
  },
  splitRightScroll: {
    padding: 14,
    paddingBottom: 40,
  },
  splitRightTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
  },
  splitRightCatTitle: {
    fontSize: 16.5,
    fontWeight: '700',
    color: '#002F34',
    marginRight: 10,
  },
  splitRightHeaderLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E2E8F0',
  },

  // 3-Column Circular Subcategories Grid
  subCatGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  subCatGridItem: {
    width: '33.33%',
    alignItems: 'center',
    paddingHorizontal: 4,
    marginBottom: 18,
  },
  subCatCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#EDF2F7',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
    position: 'relative',
  },
  subCatImage: {
    width: '100%',
    height: '100%',
    borderRadius: 34,
  },
  subCatLabel: {
    fontSize: 11.5,
    color: '#002F34',
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 14.5,
    paddingHorizontal: 2,
  },
  subCatNewBadge: {
    position: 'absolute',
    bottom: -2,
    backgroundColor: '#DC2626',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 6,
    zIndex: 5,
  },
  subCatNewBadgeText: {
    color: '#FFFFFF',
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 0.5,
  },

  // Cars Grouped Sections
  carsSectionHeading: {
    fontSize: 13,
    fontWeight: '700',
    color: '#002F34',
    marginBottom: 10,
    marginTop: 8,
  },
  carsPillsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
    marginBottom: 12,
  },
  carFilterCard: {
    width: '33.33%',
    alignItems: 'center',
    paddingHorizontal: 4,
    marginBottom: 14,
  },
  carCirclePill: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  carCirclePillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#002F34',
    textAlign: 'center',
  },
  carCardDesc: {
    fontSize: 10.5,
    color: '#475569',
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 13,
  },

  // Bottom Yellow Sell CTA Card
  sellCtaCard: {
    backgroundColor: '#FEFCE8',
    borderWidth: 1,
    borderColor: '#FEF08A',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginTop: 22,
    flexDirection: 'row',
    alignItems: 'center',
  },
  sellCtaAvatarCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#E0F2FE',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  sellCtaText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#002F34',
    flex: 1,
  },
});