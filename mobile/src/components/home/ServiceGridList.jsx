import React from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import ServiceItemCard from './ServiceItemCard';
import Spacing from '../../constants/spacing';
import Colors from '../../constants/colors';
import Typography from '../../constants/typography';
import Radii from '../../constants/radii';
import Shadows from '../../constants/shadows';
import { useApp } from '../../context/AppContext';

const AnimatedCard = ({ item, index, handlePress, handleSavePress, isSaved }) => {
  const opacity = React.useRef(new Animated.Value(0)).current;
  const translateY = React.useRef(new Animated.Value(12)).current;
  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 260, delay: index * 45, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: 0, duration: 260, delay: index * 45, useNativeDriver: true })
    ]).start();
  }, []);
  return (
    <Animated.View style={{ opacity, transform: [{ translateY }] }}>
      <ServiceItemCard
        item={item}
        isSaved={isSaved}
        onPress={handlePress}
        onSavePress={handleSavePress}
      />
    </Animated.View>
  );
};

export const ServiceGridList = ({ items = [], typeFilter = 'all', filters = {} }) => {
  const navigation = useNavigation();
  const { watchlist, toggleWatchlist } = useApp();

  const handlePress = (item) => {
    if (item.itemType === 'product') {
      const numericPrice = parseFloat(String(item.price).replace(/[^0-9.]/g, '')) || 0;
      navigation.navigate('ProductDetails', {
        product: {
          ...item,
          originalPrice: item.originalPrice || ('₹' + Math.round(numericPrice * 1.15)),
          condition: item.condition || 'Used - good condition',
          sellerName: item.sellerName || 'Local seller',
          sellerRating: item.sellerRating || 5.0,
          rating: item.rating || 5.0,
          reviews: item.reviews || 0
        }
      });
      return;
    }
    navigation.navigate('ServiceDetails', { item });
  };

  const sourceItems = Array.isArray(items) ? items : [];
  let filteredItems = sourceItems.filter((item) => typeFilter === 'all' || item.itemType === typeFilter);

  if (filters.Categories && filters.Categories !== 'All') {
    filteredItems = filteredItems.filter((item) => item.category === filters.Categories);
  }
  if (filters['Top Brands'] && filters['Top Brands'] !== 'All') {
    filteredItems = filteredItems.filter((item) => (item.title || '').toLowerCase().includes(filters['Top Brands'].toLowerCase()));
  }
  if (filters['Top Rated'] || filters.Sort === 'Top Rated') {
    filteredItems = filteredItems.slice(0, 4);
  }
  if (filters.Sort === 'Price: Low to High') {
    filteredItems = [...filteredItems].sort((a, b) => parseFloat(String(a.price).replace(/[^0-9.]/g, '')) - parseFloat(String(b.price).replace(/[^0-9.]/g, '')));
  }
  if (filters.Sort === 'Price: High to Low') {
    filteredItems = [...filteredItems].sort((a, b) => parseFloat(String(b.price).replace(/[^0-9.]/g, '')) - parseFloat(String(a.price).replace(/[^0-9.]/g, '')));
  }

  if (filteredItems.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="cube-outline" size={40} color={Colors.disabled} />
        <Text style={styles.emptyTitle}>No active listings yet</Text>
        <Text style={styles.emptySubtitle}>
          {typeFilter === 'product'
            ? 'Be the first in Indore to post a verified pre-owned ad.'
            : 'Verified service providers will appear here once listed.'}
        </Text>
        {typeFilter === 'product' && (
          <TouchableOpacity
            style={styles.postAdBtn}
            onPress={() => navigation.navigate('PostAd')}
            activeOpacity={0.85}>
            <Ionicons name="add-circle-outline" size={16} color={Colors.card} style={{ marginRight: 6 }} />
            <Text style={styles.postAdBtnText}>Post a Free Ad</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  const left = filteredItems.filter((_, index) => index % 2 === 0);
  const right = filteredItems.filter((_, index) => index % 2 !== 0);

  const renderColumn = (columnItems, offset) => (
    <View style={styles.column}>
      {columnItems.map((item, index) => (
        <AnimatedCard
          key={item.id}
          item={item}
          index={offset + index * 2}
          isSaved={watchlist.includes(item.id)}
          handlePress={handlePress}
          handleSavePress={(selected) => toggleWatchlist(selected.id)}
        />
      ))}
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        {renderColumn(left, 0)}
        {renderColumn(right, 1)}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: Spacing.sm
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  column: {
    width: '48.5%'
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xl,
    paddingHorizontal: Spacing.lg,
    backgroundColor: Colors.card,
    borderRadius: Radii.card,
    borderWidth: 1,
    borderColor: Colors.hairline,
    marginVertical: Spacing.sm,
    ...Shadows.subtle
  },
  emptyTitle: {
    ...Typography.bodyBold,
    fontSize: 14,
    color: Colors.textPrimary,
    marginTop: Spacing.sm,
    fontWeight: '700'
  },
  emptySubtitle: {
    ...Typography.caption,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 4,
    maxWidth: 240,
    fontSize: 11
  },
  postAdBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.terracotta,
    paddingHorizontal: Spacing.md,
    paddingVertical: 8,
    borderRadius: Radii.button,
    marginTop: Spacing.md,
    ...Shadows.subtle
  },
  postAdBtnText: {
    ...Typography.captionBold,
    color: Colors.card,
    fontSize: 12,
    fontWeight: '700'
  }
});

export default ServiceGridList;