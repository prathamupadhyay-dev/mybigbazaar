import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../../constants/colors';
import Typography from '../../constants/typography';
import Spacing from '../../constants/spacing';
import Radii from '../../constants/radii';
import Shadows from '../../constants/shadows';

const REVIEWS = [
  {
    id: '1',
    name: 'Sarah M.',
    rating: 5,
    text: '"The plumbing service was incredibly fast and professional. Inspected in Vijay Nagar."',
    avatar: 'SM'
  },
  {
    id: '2',
    name: 'Rahul K.',
    rating: 5,
    text: '"Purchased a verified Swift ZXi in Palasia. Everything matches the inspection report."',
    avatar: 'RK'
  },
  {
    id: '3',
    name: 'Emily J.',
    rating: 5,
    text: '"Great home tutoring service for my son. Clear verified tutor profile and reviews."',
    avatar: 'EJ'
  }
];

export const ReviewSlider = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Verified Indore Reviews</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        {REVIEWS.map((review) => (
          <View key={review.id} style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{review.avatar}</Text>
              </View>
              <View style={styles.headerText}>
                <Text style={styles.name}>{review.name}</Text>
                <View style={styles.stars}>
                  {[...Array(review.rating)].map((_, i) => (
                    <Ionicons key={i} name="star" size={12} color={Colors.terracotta} />
                  ))}
                </View>
              </View>
            </View>
            <Text style={styles.reviewText}>{review.text}</Text>
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
  sectionTitle: {
    ...Typography.heading3,
    color: Colors.textPrimary,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: Spacing.sm
  },
  scrollContent: {
    paddingVertical: Spacing.xs
  },
  card: {
    width: 260,
    backgroundColor: Colors.card,
    borderRadius: Radii.card,
    padding: Spacing.md,
    marginRight: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.hairline,
    ...Shadows.subtle
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xs
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.sunken,
    borderWidth: 1,
    borderColor: Colors.hairline,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm
  },
  avatarText: {
    ...Typography.bodyBold,
    color: Colors.navy,
    fontSize: 12
  },
  headerText: {
    flex: 1
  },
  name: {
    ...Typography.bodyBold,
    fontSize: 13,
    color: Colors.textPrimary,
    marginBottom: 2
  },
  stars: {
    flexDirection: 'row',
    gap: 2
  },
  reviewText: {
    ...Typography.body,
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 17
  }
});

export default ReviewSlider;