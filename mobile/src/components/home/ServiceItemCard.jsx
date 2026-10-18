import React, { useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, TouchableWithoutFeedback, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../../constants/colors';
import Typography from '../../constants/typography';
import Spacing from '../../constants/spacing';
import Radii from '../../constants/radii';
import Shadows from '../../constants/shadows';
import { useNavigation } from '@react-navigation/native';
import { useApp } from '../../context/AppContext';
import { formatCurrency, formatPriceText } from '../../utils/formatters';
import { formatProductSubtitle } from '../../services/productApi';

export const ServiceItemCard = ({ item, isSaved = false, onPress, onBookPress, onSavePress }) => {
  const navigation = useNavigation();
  const { requireAuth } = useApp();
  const scale = useRef(new Animated.Value(1)).current;
  const [isImageLoading, setIsImageLoading] = useState(true);

  const isProduct = item.itemType !== 'service';
  const priceValue = parseFloat(String(item.price ?? item.productPrice ?? 0).replace(/[^0-9.]/g, '')) || 0;
  const hasRatings = Number(item.reviews) > 0;
  const condition = item.condition || (isProduct ? 'Verified' : null);
  const subtitle = item.subtitle || formatProductSubtitle(item);
  const imageUri =
    item.imageUrl ||
    item.image ||
    (Array.isArray(item.images) && item.images.length > 0 ? item.images[0] : null) ||
    'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=600&auto=format&fit=crop&q=80';
  const locationText =
    typeof item.location === 'string' && item.location
      ? item.location
      : item.city || item.location?.city || 'Indore';

  const handleCardPress = () => {
    if (onPress) {
      onPress(item);
    } else if (isProduct) {
      navigation.navigate('ProductDetails', {
        id: item._id || item.id,
        product: {
          ...item,
          condition: condition || 'Good',
          location: locationText,
          sellerName: item.sellerName || item.seller?.name || 'Verified Seller',
          sellerRating: item.rating || 4.8,
          rating: item.rating || 4.8,
          reviews: item.reviews || 0,
          originalPrice: item.originalPrice || priceValue
        }
      });
    } else {
      navigation.navigate('ServiceDetails', { item });
    }
  };

  return (
    <TouchableWithoutFeedback
      onPress={handleCardPress}
      onPressIn={() => Animated.spring(scale, { toValue: 0.975, useNativeDriver: true, speed: 20, bounciness: 5 }).start()}
      onPressOut={() => Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 20, bounciness: 5 }).start()}
    >
      <Animated.View style={[styles.card, { transform: [{ scale }] }]}>
        <View style={styles.imageContainer}>
          {isImageLoading && <View style={[StyleSheet.absoluteFill, styles.imagePlaceholder]} />}
          <Image
            source={{ uri: imageUri }}
            style={styles.image}
            resizeMode="cover"
            onLoadStart={() => setIsImageLoading(true)}
            onLoadEnd={() => setIsImageLoading(false)}
          />

          {isProduct && condition ? (
            <View style={styles.conditionBadge}>
              <Text style={styles.conditionBadgeText}>{condition}</Text>
            </View>
          ) : !isProduct ? (
            <View style={styles.serviceBadge}>
              <Text style={styles.serviceBadgeText}>SERVICE</Text>
            </View>
          ) : null}

          <TouchableOpacity
            style={styles.saveButton}
            onPress={(event) => {
              event.stopPropagation();
              requireAuth(navigation, () => onSavePress && onSavePress(item));
            }}
            activeOpacity={0.8}
            accessibilityLabel={isSaved ? 'Remove from wishlist' : 'Add to wishlist'}
          >
            <Ionicons
              name={isSaved ? 'heart' : 'heart-outline'}
              size={16}
              color={isFavOrSaved(isSaved) ? Colors.crimson : '#002F34'}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.contentContainer}>
          <View style={styles.priceRow}>
            <Text style={styles.price}>{formatPriceText(priceValue)}</Text>
            {item.originalPrice && Number(item.originalPrice) > priceValue ? (
              <Text style={styles.originalPrice}>
                {formatCurrency(item.originalPrice)}
              </Text>
            ) : null}
          </View>

          <Text style={styles.itemTitle} numberOfLines={1}>
            {item.title || item.productName || 'Classified Listing'}
          </Text>

          {subtitle ? (
            <Text style={styles.subtitleText} numberOfLines={1}>
              {subtitle}
            </Text>
          ) : (
            <View style={styles.ratingRow}>
              {hasRatings ? (
                <>
                  <Ionicons name="star" size={11} color={Colors.terracotta} />
                  <Text style={styles.ratingText}>{Number(item.rating).toFixed(1)}</Text>
                  <Text style={styles.ratingCount}>({item.reviews})</Text>
                </>
              ) : (
                <Text style={styles.noRating}>{item.category || 'Verified Listing'}</Text>
              )}
            </View>
          )}

          <View style={styles.metaRow}>
            <Ionicons name="location-outline" size={12} color="#64748B" />
            <Text style={styles.itemMeta} numberOfLines={1}>
              {locationText}
            </Text>
          </View>
        </View>
      </Animated.View>
    </TouchableWithoutFeedback>
  );
};

function isFavOrSaved(val) {
  return Boolean(val);
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...Shadows.subtle
  },
  imageContainer: {
    width: '100%',
    aspectRatio: 1.33,
    backgroundColor: '#F8FAFC',
    position: 'relative',
    overflow: 'hidden'
  },
  imagePlaceholder: {
    backgroundColor: '#F1F5F9'
  },
  image: {
    width: '100%',
    height: '100%'
  },
  conditionBadge: {
    position: 'absolute',
    bottom: 6,
    left: 6,
    backgroundColor: 'rgba(0, 47, 52, 0.85)',
    paddingHorizontal: 7,
    paddingVertical: 2.5,
    borderRadius: 4
  },
  conditionBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.3,
    textTransform: 'uppercase'
  },
  serviceBadge: {
    position: 'absolute',
    bottom: 6,
    left: 6,
    backgroundColor: '#1548A6',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: Radii.xs
  },
  serviceBadgeText: {
    color: '#FFFFFF',
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 0.5
  },
  saveButton: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.94)',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center'
  },
  contentContainer: {
    paddingHorizontal: 10,
    paddingTop: 8,
    paddingBottom: 10
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginBottom: 2
  },
  price: {
    fontSize: 16,
    color: '#002F34',
    fontWeight: '800',
    marginRight: 6,
    fontVariant: ['tabular-nums']
  },
  originalPrice: {
    color: '#94A3B8',
    textDecorationLine: 'line-through',
    marginRight: 4,
    fontSize: 11,
    fontVariant: ['tabular-nums']
  },
  itemTitle: {
    color: '#002F34',
    fontSize: 13,
    lineHeight: 17,
    fontWeight: '600',
    marginBottom: 3
  },
  subtitleText: {
    color: '#475569',
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 4
  },
  ratingRow: {
    minHeight: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 3
  },
  ratingText: {
    color: '#002F34',
    marginLeft: 3,
    fontSize: 10,
    fontWeight: '700'
  },
  ratingCount: {
    color: '#64748B',
    marginLeft: 2,
    fontSize: 10
  },
  noRating: {
    color: '#64748B',
    fontSize: 11,
    fontWeight: '500'
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    minWidth: 0
  },
  itemMeta: {
    color: '#64748B',
    fontSize: 10,
    fontWeight: '600',
    marginLeft: 3,
    flexShrink: 1,
    textTransform: 'uppercase'
  }
});

export default ServiceItemCard;