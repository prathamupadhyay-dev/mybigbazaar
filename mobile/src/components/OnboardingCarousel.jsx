import React, { useRef, useState, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, ScrollView, Platform, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../constants/colors';
import Typography from '../constants/typography';
import Spacing from '../constants/spacing';
import Shadows from '../constants/shadows';
import { getCmsBannersApi, trackBannerEventApi } from '../services/homeApi';

const { width, height } = Dimensions.get('window');

const FALLBACK_SLIDES = [
  {
    id: '1',
    _id: '1',
    title: 'Unbeatable Prices!',
    subtitle: 'Exclusive discounts, limited-time deals & the best prices',
    color: Colors.canvas,
    ctaText: 'Get Flat ₹300 Off',
    imageUrl: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=800&auto=format&fit=crop&q=80'
  },
  {
    id: '2',
    _id: '2',
    title: 'Your Favorite Brands,\nAll in One Place',
    subtitle: 'From premium labels to everyday essentials.',
    color: Colors.canvas,
    ctaText: 'Explore Brands',
    imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80'
  },
  {
    id: '3',
    _id: '3',
    title: 'Fashion for Everyone,\nEvery Occasion',
    subtitle: 'Find styles that match your vibe',
    color: Colors.canvas,
    ctaText: 'Shop Fashion',
    imageUrl: 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=800&auto=format&fit=crop&q=80'
  }
];

export const OnboardingCarousel = ({ onComplete }) => {
  const [slides, setSlides] = useState(FALLBACK_SLIDES);
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollRef = useRef(null);

  useEffect(() => {
    let isMounted = true;
    getCmsBannersApi('onboarding').then((data) => {
      if (isMounted && Array.isArray(data) && data.length > 0) {
        setSlides(data);
      }
    }).catch(console.log);
    return () => { isMounted = false; };
  }, []);

  // Track impression for first slide on mount, and on slide change
  useEffect(() => {
    const currentSlide = slides[currentIndex];
    const bannerId = currentSlide?.id || currentSlide?._id;
    if (bannerId) {
      trackBannerEventApi(bannerId, 'impression');
    }
  }, [currentIndex, slides]);

  const handleScroll = (event) => {
    const x = event.nativeEvent.contentOffset.x;
    const nextIdx = Math.round(x / width);
    if (nextIdx !== currentIndex && nextIdx >= 0 && nextIdx < slides.length) {
      setCurrentIndex(nextIdx);
    }
  };

  const handleCtaPress = () => {
    const currentSlide = slides[currentIndex];
    const bannerId = currentSlide?.id || currentSlide?._id;
    if (bannerId) {
      trackBannerEventApi(bannerId, 'click');
    }
    if (onComplete) onComplete();
  };

  const currentSlide = slides[currentIndex] || slides[0];

  return (
    <SafeAreaView style={styles.container}>
      {/* Header with progress and close button */}
      <View style={styles.header}>
        <View style={styles.progressContainer}>
          {slides.map((_, index) => (
            <View
              key={index}
              style={[
                styles.progressBar,
                index === currentIndex ? styles.progressBarActive : styles.progressBarInactive
              ]}
            />
          ))}
        </View>
        <TouchableOpacity style={styles.closeButton} onPress={onComplete} activeOpacity={0.8}>
          <Ionicons name="close" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScroll}
        style={styles.scrollContainer}
      >
        {slides.map((slide, index) => (
          <View key={slide.id || slide._id || index} style={[styles.slide, { backgroundColor: slide.color || Colors.canvas }]}>
            {slide.imageUrl ? (
              <View style={styles.imageWrapper}>
                <Image
                  source={{ uri: slide.imageUrl }}
                  style={styles.slideImage}
                  resizeMode="cover"
                />
              </View>
            ) : (
              <View style={styles.imagePlaceholder}>
                <Ionicons name="image-outline" size={64} color={Colors.disabled} />
                <Text style={{ color: Colors.disabled, marginTop: 8 }}>Slide {index + 1} Visuals</Text>
              </View>
            )}

            <View style={styles.textContainer}>
              <Text style={styles.title}>{slide.title ? slide.title.replace('\\n', '\n') : ''}</Text>
              <Text style={styles.subtitle}>{slide.subtitle || ''}</Text>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Bottom Button */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity style={styles.primaryButton} onPress={handleCtaPress} activeOpacity={0.88}>
          <Text style={styles.primaryButtonText}>{currentSlide?.ctaText || 'Get Flat ₹300 Off'}</Text>
          <Text style={styles.primaryButtonSubText}>Explore Deals</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.canvas
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.lg,
    zIndex: 10,
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 30,
    left: 0,
    right: 0
  },
  progressContainer: {
    flexDirection: 'row',
    flex: 1,
    marginRight: Spacing.lg,
    gap: 8
  },
  progressBar: {
    flex: 1,
    height: 4,
    borderRadius: 2
  },
  progressBarActive: {
    backgroundColor: Colors.terracotta
  },
  progressBarInactive: {
    backgroundColor: Colors.hairline
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.card,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.hairline,
    ...Shadows.subtle
  },
  scrollContainer: {
    flex: 1
  },
  slide: {
    width,
    height: height,
    paddingTop: height * 0.15
  },
  imageWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: Spacing.xl,
    marginTop: Spacing.xl,
    borderRadius: 24,
    overflow: 'hidden',
    marginBottom: 30
  },
  slideImage: {
    width: '100%',
    height: '100%',
    borderRadius: 24
  },
  imagePlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: Spacing.xl,
    marginTop: Spacing.xl,
    backgroundColor: Colors.sunken,
    borderRadius: 24,
    marginBottom: 40
  },
  textContainer: {
    paddingHorizontal: Spacing.xl,
    alignItems: 'center',
    paddingBottom: height * 0.2 // Leave room for button
  },
  title: {
    ...Typography.heading1,
    fontSize: 26,
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: Spacing.sm,
    lineHeight: 34
  },
  subtitle: {
    ...Typography.body,
    fontSize: 15,
    color: Colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: Spacing.md,
    lineHeight: 22
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: Spacing.xl,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    backgroundColor: 'transparent'
  },
  primaryButton: {
    backgroundColor: Colors.terracotta,
    width: '100%',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    ...Shadows.button
  },
  primaryButtonText: {
    ...Typography.button,
    color: Colors.card,
    fontSize: 16,
    marginBottom: 2
  },
  primaryButtonSubText: {
    ...Typography.caption,
    color: Colors.sunken,
    fontSize: 11
  }
});

export default OnboardingCarousel;