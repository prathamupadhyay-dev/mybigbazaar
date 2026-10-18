import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Colors from '../../constants/colors';
import Typography from '../../constants/typography';
import Radii from '../../constants/radii';

export const StatusBadge = ({
  status = 'active',
  label,
  size = 'md',
  style
}) => {
  const getBadgeConfig = () => {
    switch (status.toLowerCase()) {
      case 'active':
      case 'verified':
      case 'completed':
        return {
          bg: '#DCFCE7',
          text: Colors.emerald,
          defaultLabel: 'Verified'
        };
      case 'pending':
      case 'under review':
      case 'in progress':
        return {
          bg: Colors.sunken,
          text: Colors.textSecondary,
          defaultLabel: 'Pending'
        };
      case 'countered':
      case 'deal':
      case 'negotiable':
        return {
          bg: Colors.sunken,
          text: Colors.indigo,
          defaultLabel: 'Negotiable'
        };
      case 'featured':
        return {
          bg: Colors.terracotta,
          text: Colors.card,
          defaultLabel: 'Featured'
        };
      case 'accepted':
        return {
          bg: '#DCFCE7',
          text: Colors.emerald,
          defaultLabel: 'Accepted'
        };
      case 'sold':
      case 'cancelled':
      case 'declined':
        return {
          bg: Colors.sunken,
          text: Colors.metadata,
          defaultLabel: 'Sold'
        };
      case 'error':
      case 'disputed':
      case 'rejected':
        return {
          bg: '#FFE4E6',
          text: Colors.crimson,
          defaultLabel: 'Rejected'
        };
      default:
        return {
          bg: Colors.sunken,
          text: Colors.textSecondary,
          defaultLabel: status
        };
    }
  };

  const config = getBadgeConfig();
  const displayLabel = label || config.defaultLabel;

  return (
    <View
      style={[
        styles.badge,
        { backgroundColor: config.bg },
        size === 'sm' && styles.badgeSm,
        style
      ]}
    >
      <Text
        style={[
          styles.text,
          { color: config.text },
          size === 'sm' && styles.textSm
        ]}
      >
        {displayLabel}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radii.badge,
    alignSelf: 'flex-start',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.hairline
  },
  badgeSm: {
    paddingHorizontal: 6,
    paddingVertical: 2
  },
  text: {
    ...Typography.captionBold,
    fontSize: 11,
    letterSpacing: 0.2,
    fontVariant: ['tabular-nums']
  },
  textSm: {
    fontSize: 10
  }
});

export default StatusBadge;
