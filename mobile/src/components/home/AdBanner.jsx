import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../../constants/colors';
import Typography from '../../constants/typography';
import Spacing from '../../constants/spacing';
import Radii from '../../constants/radii';
import Shadows from '../../constants/shadows';
import { getCmsBannersApi, trackBannerEventApi } from '../../services/homeApi';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width - 32;

const DEFAULT_ADS = [
  { id: '1', bgColor: Colors.navy, eyebrow: 'SELL WITH EASE', title: 'Turn unused goods into cash', subtitle: 'List locally and meet verified nearby buyers', cta: 'Post a Free Ad', icon: 'pricetag-outline', route: 'PostAd' },
  { id: '2', bgColor: Colors.navy, eyebrow: 'DOORSTEP SERVICES', title: 'Experts at your doorstep', subtitle: 'Book trusted professionals in Indore', cta: 'Explore Services', icon: 'construct-outline', route: 'Services' },
  { id: '3', bgColor: Colors.navy, eyebrow: 'HYPERLOCAL COMMERCE', title: 'Your next buyer is nearby', subtitle: 'Connect directly with buyers across Indore', cta: 'Post an Ad', icon: 'people-outline', route: 'PostAd' }
];

export const AdBanner = () => {
  const navigation = useNavigation();
  const [ads, setAds] = useState(DEFAULT_ADS);
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollViewRef = useRef(null);
  const scrollInterval = useRef(null);

  useEffect(() => {
    let isMounted = true;
    getCmsBannersApi('promotions').then((data) => {
      if (isMounted && Array.isArray(data) && data.length > 0) {
        const mapped = data.map((b) => ({
          id: b.id || b._id,
          _id: b._id || b.id,
          bgColor: Colors.navy,
          eyebrow: (b.tag || 'Special Offer').toUpperCase(),
          title: b.title || 'Special Promotion',
          subtitle: b.subtitle || 'Discover local offers in Indore',
          cta: b.ctaText || 'Learn More',
          icon: b.targetScreen === 'Services' ? 'construct-outline' : 'pricetag-outline',
          route: b.targetScreen || 'ProductList'
        }));
        setAds(mapped);
      }
    }).catch(console.warn);
    return () => { isMounted = false; };
  }, []);

  useEffect(() => {
    const cur = ads[activeIndex];
    if (cur?._id && cur._id !== '1' && cur._id !== '2' && cur._id !== '3') {
      trackBannerEventApi(cur._id, 'impression');
    }
  }, [activeIndex, ads]);

  useEffect(() => {
    scrollInterval.current = setInterval(() => {
      setActiveIndex((current) => {
        const next = (current + 1) % ads.length;
        scrollViewRef.current?.scrollTo({ x: next * CARD_WIDTH, animated: true });
        return next;
      });
    }, 4500);
    return () => scrollInterval.current && clearInterval(scrollInterval.current);
  }, [ads.length]);

  const pauseAutoScroll = () => scrollInterval.current && clearInterval(scrollInterval.current);
  const resumeAutoScroll = () => {
    pauseAutoScroll();
    scrollInterval.current = setInterval(() => {
      setActiveIndex((current) => {
        const next = (current + 1) % ads.length;
        scrollViewRef.current?.scrollTo({ x: next * CARD_WIDTH, animated: true });
        return next;
      });
    }, 4500);
  };

  const handleScroll = (event) => {
    const slideSize = event.nativeEvent.layoutMeasurement.width;
    setActiveIndex(Math.round(event.nativeEvent.contentOffset.x / slideSize));
  };

  const handlePress = (ad) => {
    if (ad._id && ad._id !== '1' && ad._id !== '2' && ad._id !== '3') {
      trackBannerEventApi(ad._id, 'click');
    }
    navigation.navigate(ad.route);
  };

  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScroll}
        onScrollBeginDrag={pauseAutoScroll}
        onScrollEndDrag={resumeAutoScroll}
        scrollEventThrottle={16}>
        {ads.map((ad) => (
          <TouchableOpacity key={ad.id} activeOpacity={0.92} style={{ width: CARD_WIDTH }} onPress={() => handlePress(ad)}>
            <View style={[styles.card, { backgroundColor: ad.bgColor }]}>
              <View style={styles.copy}>
                <Text style={styles.eyebrow}>{ad.eyebrow}</Text>
                <Text style={styles.title}>{ad.title}</Text>
                <Text style={styles.subtitle}>{ad.subtitle}</Text>
                <View style={styles.cta}>
                  <Text style={styles.ctaText}>{ad.cta}</Text>
                  <Ionicons name="arrow-forward" size={13} color={Colors.card} />
                </View>
              </View>
              <View style={styles.artwork}>
                <Ionicons name={ad.icon} size={48} color={Colors.card} style={{ opacity: 0.8 }} />
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
      <View style={styles.pagination}>
        {ads.map((ad, index) => (
          <View
            key={ad.id}
            style={[styles.dot, index === activeIndex ? styles.dotActive : styles.dotInactive]}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: Spacing.sm
  },
  card: {
    borderRadius: Radii.card,
    overflow: 'hidden',
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: Colors.navy,
    ...Shadows.subtle
  },
  copy: {
    flex: 1,
    zIndex: 1,
    marginRight: 10
  },
  eyebrow: {
    ...Typography.captionBold,
    color: Colors.sunken,
    fontSize: 10,
    letterSpacing: 0.5,
    marginBottom: 4
  },
  title: {
    ...Typography.heading2,
    color: Colors.card,
    fontSize: 17,
    fontWeight: '700',
    lineHeight: 22,
    letterSpacing: -0.2,
    marginBottom: 4
  },
  subtitle: {
    ...Typography.caption,
    color: Colors.sunken,
    fontSize: 11,
    lineHeight: 15,
    marginBottom: 10
  },
  cta: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.terracotta,
    borderRadius: Radii.button,
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 4
  },
  ctaText: {
    ...Typography.captionBold,
    color: Colors.card,
    fontSize: 11,
    fontWeight: '700'
  },
  artwork: {
    width: 60,
    alignItems: 'center',
    justifyContent: 'center'
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 8
  },
  dot: {
    height: 4,
    borderRadius: 2,
    marginHorizontal: 2
  },
  dotActive: {
    width: 16,
    backgroundColor: Colors.terracotta
  },
  dotInactive: {
    width: 6,
    backgroundColor: Colors.hairline
  }
});

export default AdBanner;