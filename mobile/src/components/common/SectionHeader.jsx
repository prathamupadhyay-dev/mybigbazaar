import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../../constants/colors';
import Typography from '../../constants/typography';
import Spacing from '../../constants/spacing';

export const SectionHeader = ({
  title,
  subtitle,
  actionLabel,
  onActionPress,
  style
}) => {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.titleContainer}>
        <Text style={styles.title}>{title}</Text>
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      </View>
      {actionLabel && (
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={onActionPress}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel={actionLabel}
        >
          <Text style={styles.actionText}>{actionLabel}</Text>
          <Ionicons name="chevron-forward" size={14} color={Colors.terracotta} />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.xs,
    marginBottom: Spacing.sm
  },
  titleContainer: {
    flex: 1
  },
  title: {
    ...Typography.sectionHeader,
    color: Colors.textPrimary,
    fontWeight: '600',
    fontSize: 16
  },
  subtitle: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginTop: 2
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.xs,
    paddingLeft: Spacing.sm
  },
  actionText: {
    ...Typography.captionBold,
    color: Colors.terracotta,
    fontSize: 12,
    fontWeight: '600',
    marginRight: 2
  }
});

export default SectionHeader;
