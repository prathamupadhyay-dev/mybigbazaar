import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import Colors from '../../constants/colors';
import Typography from '../../constants/typography';
import Spacing from '../../constants/spacing';
import Radii from '../../constants/radii';
import Shadows from '../../constants/shadows';

export const HeroBanner = () => {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <View style={styles.textContainer}>
        <Text style={styles.greeting}>Indore Hyperlocal</Text>
        <Text style={styles.headline}>Ready for your next verified deal?</Text>
        <TouchableOpacity
          style={styles.ctaButton}
          onPress={() => navigation.navigate('Services')}
          activeOpacity={0.85}>
          <Text style={styles.ctaText}>Explore Now</Text>
          <Ionicons name="arrow-forward" size={15} color={Colors.card} style={styles.ctaIcon} />
        </TouchableOpacity>
      </View>
      <View style={styles.iconWrapper}>
        <Ionicons name="shield-checkmark" size={38} color={Colors.terracotta} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.card,
    borderRadius: Radii.card,
    padding: Spacing.lg,
    marginVertical: Spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: Colors.hairline,
    ...Shadows.subtle
  },
  textContainer: {
    flex: 1,
    marginRight: Spacing.md
  },
  greeting: {
    ...Typography.captionBold,
    color: Colors.terracotta,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
    fontSize: 10
  },
  headline: {
    ...Typography.heading2,
    fontSize: 18,
    lineHeight: 24,
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
    fontWeight: '700'
  },
  ctaButton: {
    backgroundColor: Colors.navy,
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.md,
    paddingVertical: 8,
    borderRadius: Radii.button,
    flexDirection: 'row',
    alignItems: 'center',
    ...Shadows.subtle
  },
  ctaText: {
    ...Typography.button,
    fontSize: 13,
    color: Colors.card
  },
  ctaIcon: {
    marginLeft: 6
  },
  iconWrapper: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.sunken,
    borderWidth: 1,
    borderColor: Colors.hairline,
    alignItems: 'center',
    justifyContent: 'center'
  }
});

export default HeroBanner;