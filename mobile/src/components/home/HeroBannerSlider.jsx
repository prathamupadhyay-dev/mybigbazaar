import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Image,
  FlatList,
  Platform,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getCmsBannersApi, getBannerSettingsApi, trackBannerEventApi } from '../../services/homeApi';
import { API_BASE_URL } from '../../services/apiClient';

const { width } = Dimensions.get('window');
// 14px container margin on left and right - prevents attaching to screen boundary
const CONTAINER_WIDTH = width - 28;
const BANNER_HEIGHT = Math.round(CONTAINER_WIDTH * 0.42); // Clean ~2.4:1 banner proportion (~145px on standard screens)
const CACHED_BANNERS_KEY = '@mbb_cached_home_banners';

// Default active banners matching current Admin Panel listing & DB seed (All 4 slots active)
export const DEFAULT_HOME_BANNERS = [
  {
    _id: '6ac0792039dcd13e9ccaab40',
    id: '6ac0792039dcd13e9ccaab40',
    title: 'Verified Home Services\nAt Your Doorstep',
    subtitle: 'Cleaning, AC Repair, Plumbing & Electricians.',
    imageUrl: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800&auto=format&fit=crop&q=80',
    fallbackImageUrl: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800&auto=format&fit=crop&q=80',
    targetScreen: 'Services',
    linkUrl: '/services',
    ctaText: 'Book Service',
    tag: 'Trending',
    placement: 'home_hero',
    sortOrder: 1,
    order: 1,
    slot: 1,
    isActive: true,
  },
  {
    _id: '6ac555d6c0faca7c37443299',
    id: '6ac555d6c0faca7c37443299',
    title: 'Hero Banner #6',
    subtitle: 'Electronics & Deals',
    imageUrl: '/uploads/313a7916-3d8c-4b99-b871-5919a1b86830-1791317442737-936823073.png',
    fallbackImageUrl: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=800&auto=format&fit=crop&q=80',
    targetScreen: 'ProductList',
    category: 'Mobiles',
    linkUrl: '',
    ctaText: 'Shop Now',
    tag: 'Special Offer',
    placement: 'home_hero',
    sortOrder: 2,
    order: 2,
    slot: 2,
    isActive: true,
  },
  {
    _id: '6ac555f7c0faca7c3744329a',
    id: '6ac555f7c0faca7c3744329a',
    title: 'Hero Banner #4',
    subtitle: 'Fashion & Lifestyle',
    imageUrl: '/uploads/framed-unnamed-1791317495717-61727243.jpg',
    fallbackImageUrl: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&auto=format&fit=crop&q=80',
    targetScreen: 'ProductList',
    category: 'Fashion',
    linkUrl: '',
    ctaText: 'Shop Now',
    tag: 'Special Offer',
    placement: 'home_hero',
    sortOrder: 3,
    order: 3,
    slot: 3,
    isActive: true,
  },
  {
    _id: '6ac0792039dcd13e9ccaab3f',
    id: '6ac0792039dcd13e9ccaab3f',
    title: 'Big Deals\nBigger Happiness',
    subtitle: 'Shop Smart, Live Better with verified local deals.',
    imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80',
    fallbackImageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80',
    targetScreen: 'ProductList',
    category: 'Mobiles',
    linkUrl: '/products',
    ctaText: 'Shop Now',
    tag: 'Special Offer',
    placement: 'home_hero',
    sortOrder: 4,
    order: 4,
    slot: 4,
    isActive: true,
  },
];

export default function HeroBannerSlider({ onSelectServices, refreshTrigger }) {
  const navigation = useNavigation();
  // Initialize with all 4 admin listing banners so they are immediately visible on app open
  const [banners, setBanners] = useState(DEFAULT_HOME_BANNERS);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [autoplayInterval, setAutoplayInterval] = useState(4.5); // Default 4.5s
  const [imageErrors, setImageErrors] = useState({});
  const flatListRef = useRef(null);
  const autoPlayTimer = useRef(null);

  // Dynamic banner & settings loader
  const loadBanners = useCallback(async () => {
    try {
      // Also load configured duration interval
      try {
        const settings = await getBannerSettingsApi();
        if (settings && typeof settings.autoplayIntervalSeconds === 'number' && settings.autoplayIntervalSeconds > 0) {
          setAutoplayInterval(settings.autoplayIntervalSeconds);
        }
      } catch (e) {}

      const res = await getCmsBannersApi('home_hero');

      if (Array.isArray(res) && res.length > 0) {
        // Filter strictly active & non-expired home banners
        const active = res
          .filter((b) => {
            if (b.isActive === false || b.status === 'Inactive') return false;
            if (
              b.placement &&
              b.placement !== 'home_hero' &&
              b.placement !== 'home' &&
              b.placement !== 'hero_banner_slider'
            ) {
              return false;
            }
            if (b.validUntil) {
              const expTime = new Date(b.validUntil).getTime();
              if (!isNaN(expTime) && expTime < Date.now()) return false;
            }
            return true;
          })
          .sort(
            (a, b) =>
              Number(a.sortOrder ?? a.order ?? a.slot ?? 0) -
              Number(b.sortOrder ?? b.order ?? b.slot ?? 0)
          );

        if (active.length > 0) {
          const enriched = active.map((banner, idx) => {
            if (!banner.fallbackImageUrl) {
              const matchedDefault =
                DEFAULT_HOME_BANNERS.find((d) => d._id === banner._id || d.id === banner.id) ||
                DEFAULT_HOME_BANNERS[idx % DEFAULT_HOME_BANNERS.length];
              return { ...banner, fallbackImageUrl: matchedDefault?.fallbackImageUrl };
            }
            return banner;
          });
          setBanners(enriched);
          try {
            await AsyncStorage.setItem(CACHED_BANNERS_KEY, JSON.stringify(enriched));
          } catch (e) {}
          return;
        }
      }

      // If backend was unreachable or returned empty, check cached banners
      try {
        const cached = await AsyncStorage.getItem(CACHED_BANNERS_KEY);
        if (cached !== null) {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed) && parsed.length >= DEFAULT_HOME_BANNERS.length) {
            setBanners(parsed);
            return;
          }
        }
      } catch (e) {}

      // Fallback to all 4 default banners
      setBanners(DEFAULT_HOME_BANNERS);
      try {
        await AsyncStorage.setItem(CACHED_BANNERS_KEY, JSON.stringify(DEFAULT_HOME_BANNERS));
      } catch (e) {}
    } catch (err) {
      console.log('[HeroBannerSlider] Error loading banners:', err);
      // Fallback to all 4 default listing banners
      setBanners(DEFAULT_HOME_BANNERS);
      try {
        await AsyncStorage.setItem(CACHED_BANNERS_KEY, JSON.stringify(DEFAULT_HOME_BANNERS));
      } catch (e) {}
    }
  }, []);

  // Fetch on mount or when refreshTrigger increments
  useEffect(() => {
    loadBanners();
  }, [loadBanners, refreshTrigger]);

  // Re-fetch whenever the user navigates back to Home screen (instant update from admin changes)
  useFocusEffect(
    useCallback(() => {
      loadBanners();
    }, [loadBanners])
  );

  // Telemetry impression
  useEffect(() => {
    if (!banners || banners.length === 0) return;
    const cur = banners[currentIndex];
    if (cur?._id && !String(cur._id).startsWith('banner-')) {
      trackBannerEventApi(cur._id, 'impression');
    }
  }, [currentIndex, banners]);

  // Dynamic Autoplay rotation (ONLY when 2 or more banners)
  useEffect(() => {
    if (!banners || banners.length <= 1) return;

    const intervalMs = Math.max(1000, Math.round((autoplayInterval || 4.5) * 1000));
    autoPlayTimer.current = setInterval(() => {
      setCurrentIndex((prevIndex) => {
        const nextIndex = (prevIndex + 1) % banners.length;
        if (flatListRef.current) {
          flatListRef.current.scrollToIndex({
            index: nextIndex,
            animated: true,
          });
        }
        return nextIndex;
      });
    }, intervalMs);

    return () => {
      if (autoPlayTimer.current) clearInterval(autoPlayTimer.current);
    };
  }, [banners, autoplayInterval]);

  const handleScroll = (event) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffsetX / CONTAINER_WIDTH);
    if (banners && index >= 0 && index < banners.length && index !== currentIndex) {
      setCurrentIndex(index);
    }
  };

  const handleBannerPress = (banner) => {
    if (banner?._id && !String(banner._id).startsWith('banner-')) {
      trackBannerEventApi(banner._id, 'click');
    }

    if (banner.targetScreen === 'Services') {
      if (onSelectServices) {
        onSelectServices();
      } else {
        navigation.navigate('Services');
      }
    } else if (banner.targetScreen === 'Sell' || banner.targetScreen === 'PostAd') {
      navigation.navigate('Sell');
    } else if (banner.targetScreen === 'AllItems') {
      navigation.navigate('ProductList');
    } else {
      navigation.navigate('ProductList', { category: banner.category });
    }
  };

  const resolveImageSource = (item, index = 0) => {
    const errorKey = item?._id || item?.id || String(index);
    const fallback =
      item?.fallbackImageUrl ||
      DEFAULT_HOME_BANNERS[index % DEFAULT_HOME_BANNERS.length]?.fallbackImageUrl ||
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80';

    if (errorKey && imageErrors[errorKey]) {
      return { uri: fallback };
    }

    if (item?.imageUrl) {
      let uri = item.imageUrl;
      if (!uri.startsWith('http://') && !uri.startsWith('https://') && !uri.startsWith('data:')) {
        const cleanPath = uri.startsWith('/') ? uri : `/${uri}`;
        uri = `${API_BASE_URL}${cleanPath}`;
      } else if (Platform.OS !== 'web') {
        uri = uri.replace(/https?:\/\/(localhost|127\.0\.0\.1):5000/, API_BASE_URL);
      }
      return { uri };
    }
    if (item?.imageSource) return item.imageSource;
    return { uri: fallback };
  };

  // =========================================================================
  // CONDITION 1: 0 Active Banners -> Show the container blank
  // =========================================================================
  if (!banners || banners.length === 0) {
    return (
      <View style={styles.sliderWrapper}>
        <View style={[styles.bannerContainer, styles.blankContainer]} />
      </View>
    );
  }

  // =========================================================================
  // CONDITION 2: Exactly 1 Banner -> Single static banner without slider/dots
  // =========================================================================
  if (banners.length === 1) {
    const singleBanner = banners[0];
    const singleKey = singleBanner?._id || singleBanner?.id || '0';
    return (
      <View style={styles.sliderWrapper}>
        <View style={styles.bannerContainer}>
          <TouchableOpacity
            activeOpacity={0.92}
            onPress={() => handleBannerPress(singleBanner)}
            style={styles.bannerCard}
          >
            <Image
              source={resolveImageSource(singleBanner, 0)}
              style={styles.bannerImage}
              resizeMode="cover"
              onError={() => {
                if (singleKey && !imageErrors[singleKey]) {
                  setImageErrors((prev) => ({ ...prev, [singleKey]: true }));
                }
              }}
            />
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // =========================================================================
  // CONDITION 3: 2 or More Banners -> Sliding carousel with pagination dots
  // =========================================================================
  const renderBannerItem = ({ item, index }) => {
    const bannerKey = item?._id || item?.id || String(index);
    return (
      <TouchableOpacity
        activeOpacity={0.92}
        onPress={() => handleBannerPress(item)}
        style={styles.bannerCard}
      >
        <Image
          source={resolveImageSource(item, index)}
          style={styles.bannerImage}
          resizeMode="cover"
          onError={() => {
            if (bannerKey && !imageErrors[bannerKey]) {
              setImageErrors((prev) => ({ ...prev, [bannerKey]: true }));
            }
          }}
        />
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.sliderWrapper}>
      {/* Contained banner wrapper: Left and right margins, rounded corners, pure image */}
      <View style={styles.bannerContainer}>
        <FlatList
          ref={flatListRef}
          data={banners}
          horizontal
          nestedScrollEnabled
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item, idx) => item._id || item.id || `banner-${idx}`}
          renderItem={renderBannerItem}
          onMomentumScrollEnd={handleScroll}
          getItemLayout={(_, index) => ({
            length: CONTAINER_WIDTH,
            offset: CONTAINER_WIDTH * index,
            index,
          })}
          snapToInterval={CONTAINER_WIDTH}
          decelerationRate="fast"
          bounces={false}
        />
      </View>

      {/* Pagination Dots underneath container */}
      <View style={styles.paginationRow}>
        {banners.map((_, idx) => (
          <View
            key={idx}
            style={[
              styles.dot,
              idx === currentIndex && styles.activeDot,
            ]}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  sliderWrapper: {
    marginVertical: 10,
    alignItems: 'center',
    width: '100%',
  },
  bannerContainer: {
    width: CONTAINER_WIDTH,
    height: BANNER_HEIGHT,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#F1F5F9',
  },
  blankContainer: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  bannerCard: {
    width: CONTAINER_WIDTH,
    height: BANNER_HEIGHT,
    overflow: 'hidden',
  },
  bannerImage: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  paginationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    gap: 5,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#CBD5E1',
  },
  activeDot: {
    width: 16,
    backgroundColor: '#0078FF',
  },
});
