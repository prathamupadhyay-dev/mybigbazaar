import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Image, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../../context/AppContext';

const DEFAULT_ROTATION = ['Jobs', 'Mobiles', 'Bikes', 'Properties', 'Furniture', 'Electronics', 'Services'];

export const HomeHeader = ({ onLocationPress, categories = [] }) => {
  const navigation = useNavigation();
  const { currentLocation, isAuthenticated, watchlist } = useApp();
  const [queryIndex, setQueryIndex] = useState(0);

  const rotationItems = React.useMemo(() => {
    if (Array.isArray(categories) && categories.length > 0) {
      const names = categories
        .filter(c => c.isActive !== false && c.status !== 'Inactive')
        .map(c => c.name || c.title)
        .filter(Boolean);
      if (names.length > 0) return names;
    }
    return DEFAULT_ROTATION;
  }, [categories]);

  // Smoothly rotate the search placeholder word every 2.5 seconds
  useEffect(() => {
    if (rotationItems.length === 0) return;
    const timer = setInterval(() => {
      setQueryIndex((prev) => (prev + 1) % rotationItems.length);
    }, 2500);
    return () => clearInterval(timer);
  }, [rotationItems.length]);

  const locationDisplay =
    currentLocation?.city
      ? `${currentLocation.city}${currentLocation.state ? ', ' + currentLocation.state : ''}`
      : 'Kaveri Nagar, Indore';

  return (
    <View style={styles.headerWrapper}>
      {/* Row 1: Brand Logo & Clickable Location (Apple/macOS borderless minimal design) */}
      <View style={styles.topRow}>
        <View style={styles.logoWrap}>
          <Image
            source={require('../../../assets/client-logo-header.png')}
            style={styles.brandLogo}
            resizeMode="contain"
          />
        </View>

        <TouchableOpacity
          style={styles.locationContainer}
          onPress={onLocationPress}
          activeOpacity={0.6}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          accessibilityRole="button"
          accessibilityLabel={`Location: ${locationDisplay}. Tap to change location`}
        >
          <Ionicons name="location-sharp" size={15} color="#007AFF" style={styles.locationPinIcon} />
          <Text style={styles.locationText} numberOfLines={1}>
            {locationDisplay}
          </Text>
          <Ionicons name="chevron-down" size={12} color="#8E8E93" style={styles.locationChevron} />
        </TouchableOpacity>
      </View>

      {/* Row 2: Search Input + Wishlist Heart + Notification Bell (macOS/Apple borderless toolbar actions) */}
      <View style={styles.searchRow}>
        <TouchableOpacity
          style={styles.searchBar}
          onPress={() => navigation.navigate('Search')}
          activeOpacity={0.88}
          accessibilityRole="button"
          accessibilityLabel="Search marketplace"
        >
          <Ionicons name="search" size={17} color="#8E8E93" style={{ marginRight: 8 }} />
          <View style={styles.searchPlaceholderWrap}>
            <Text style={styles.searchPrefix}>Search </Text>
            <Text style={styles.searchQuery} numberOfLines={1}>
              "{rotationItems[queryIndex % rotationItems.length] || 'Items'}"
            </Text>
          </View>
          <View style={styles.micDivider} />
          <Ionicons name="mic-outline" size={18} color="#8E8E93" style={{ marginLeft: 4 }} />
        </TouchableOpacity>

        {/* Wishlist Heart Icon (macOS/Apple borderless icon button) */}
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() => {
            if (!isAuthenticated) {
              navigation.navigate('AuthLanding');
            } else {
              navigation.navigate('Watchlist');
            }
          }}
          activeOpacity={0.5}
          hitSlop={{ top: 8, bottom: 8, left: 6, right: 6 }}
          accessibilityRole="button"
          accessibilityLabel="Wishlist"
        >
          <Ionicons name="heart-outline" size={22} color="#1C1C1E" />
          {watchlist?.length > 0 && <View style={styles.badgeDot} />}
        </TouchableOpacity>

        {/* Notification Bell Icon (macOS/Apple borderless icon button) */}
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() => {
            if (!isAuthenticated) {
              navigation.navigate('AuthLanding');
            } else {
              navigation.navigate('Notifications');
            }
          }}
          activeOpacity={0.5}
          hitSlop={{ top: 8, bottom: 8, left: 6, right: 6 }}
          accessibilityRole="button"
          accessibilityLabel="Notifications"
        >
          <Ionicons name="notifications-outline" size={22} color="#1C1C1E" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  headerWrapper: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? 8 : 4,
    paddingBottom: 8,
    borderBottomWidth: 0.5,
    borderBottomColor: '#E5E5EA',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    height: 40,
    marginBottom: 8,
  },
  logoWrap: {
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  brandLogo: {
    width: 48,
    height: 38,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    maxWidth: '70%',
    backgroundColor: 'transparent',
    paddingVertical: 4,
    paddingHorizontal: 2,
  },
  locationPinIcon: {
    marginRight: 4,
  },
  locationText: {
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
    gap: 6,
  },
  searchBar: {
    flex: 1,
    height: 38,
    backgroundColor: '#F2F2F7',
    borderRadius: 10,
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  searchPlaceholderWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchPrefix: {
    fontSize: 14,
    color: '#8E8E93',
    letterSpacing: -0.2,
  },
  searchQuery: {
    fontSize: 14,
    color: '#1C1C1E',
    fontWeight: '500',
    letterSpacing: -0.2,
    flexShrink: 1,
  },
  micDivider: {
    width: 1,
    height: 16,
    backgroundColor: '#D1D1D6',
    marginRight: 4,
  },
  actionBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  badgeDot: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#FF3B30',
  },
});

export default HomeHeader;