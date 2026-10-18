import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import ServiceItemCard from './ServiceItemCard';
import { useApp } from '../../context/AppContext';
import Typography from '../../constants/typography';
import Colors from '../../constants/colors';
import Spacing from '../../constants/spacing';
import Radii from '../../constants/radii';
import Shadows from '../../constants/shadows';

export const TopServicesSlider = ({ services = [] }) => {
  const navigation = useNavigation();
  const { watchlist, toggleWatchlist } = useApp();

  const handleViewAll = () => {
    navigation.navigate('Services');
  };

  const topServices = Array.isArray(services) ? services.filter((item) => item.itemType === 'service') : [];

  const handlePress = (item) => {
    navigation.navigate('ServiceDetails', { item });
  };

  const handleBookPress = (item) => {
    navigation.navigate('ServiceDetails', { item });
  };

  const handleSavePress = (item) => {
    toggleWatchlist(item.id);
  };

  if (topServices.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.headerRow}>
          <View style={styles.titleWrapper}>
            <Text style={styles.title}>Home & Local Services</Text>
            <Text style={styles.subtitle}>Verified Indore pros with upfront rates</Text>
          </View>
          <TouchableOpacity onPress={handleViewAll} style={styles.viewAllBtn} accessibilityLabel="View all services">
            <Text style={styles.viewAllText}>Explore</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity
          style={styles.emptyServicesBanner}
          activeOpacity={0.88}
          onPress={() => navigation.navigate('Services')}>
          <View style={styles.emptyIconCircle}>
            <Ionicons name="construct-outline" size={22} color={Colors.navy} />
          </View>
          <View style={{ flex: 1, marginLeft: Spacing.sm }}>
            <Text style={styles.emptyBannerTitle}>Browse Verified Service Categories</Text>
            <Text style={styles.emptyBannerSub}>
              Plumbing, Electrical, AC Repair, Cleaning & Tutoring directory
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color={Colors.textSecondary} />
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <View style={styles.titleWrapper}>
          <Text style={styles.title}>Top Rated Services</Text>
          <Text style={styles.subtitle}>Verified pros with upfront rates</Text>
        </View>
        <TouchableOpacity onPress={handleViewAll} style={styles.viewAllBtn} accessibilityLabel="View all services">
          <Text style={styles.viewAllText}>View All</Text>
        </TouchableOpacity>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        {topServices.map((item) => (
          <View key={item.id} style={styles.cardWrapper}>
            <ServiceItemCard
              item={item}
              isSaved={watchlist.includes(item.id)}
              onPress={handlePress}
              onBookPress={handleBookPress}
              onSavePress={handleSavePress}
            />
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: Spacing.md
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
    paddingHorizontal: Spacing.xs
  },
  titleWrapper: {
    flex: 1
  },
  title: {
    ...Typography.heading2,
    color: Colors.textPrimary,
    fontSize: 16,
    fontWeight: '700'
  },
  subtitle: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginTop: 2
  },
  viewAllBtn: {
    paddingVertical: 4,
    paddingHorizontal: 8
  },
  viewAllText: {
    ...Typography.bodyBold,
    color: Colors.terracotta,
    fontSize: 13,
    fontWeight: '600'
  },
  scrollContent: {
    paddingRight: Spacing.md
  },
  cardWrapper: {
    width: 188,
    marginRight: Spacing.md
  },
  emptyServicesBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: Radii.card,
    borderWidth: 1,
    borderColor: Colors.hairline,
    padding: Spacing.md,
    marginTop: Spacing.xs,
    ...Shadows.subtle
  },
  emptyIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.sunken,
    borderWidth: 1,
    borderColor: Colors.hairline,
    alignItems: 'center',
    justifyContent: 'center'
  },
  emptyBannerTitle: {
    ...Typography.bodyBold,
    fontSize: 13,
    color: Colors.textPrimary,
    fontWeight: '600'
  },
  emptyBannerSub: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginTop: 2,
    fontSize: 11
  }
});

export default TopServicesSlider;
