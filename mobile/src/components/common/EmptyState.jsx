import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../../constants/colors';
import Typography from '../../constants/typography';
import Spacing from '../../constants/spacing';
import PrimaryButton from './PrimaryButton';

export const EmptyState = ({
  iconName = 'cube-outline',
  title = 'No items found',
  description = 'Try exploring other categories or adjusting your filters.',
  actionTitle,
  onActionPress,
  style
}) => {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.iconContainer}>
        <Ionicons name={iconName} size={32} color={Colors.navy} />
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
      {actionTitle && onActionPress && (
        <View style={styles.actionContainer}>
          <PrimaryButton title={actionTitle} onPress={onActionPress} />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.xxxl,
    backgroundColor: 'transparent'
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.sunken,
    borderWidth: 1,
    borderColor: Colors.hairline,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.base
  },
  title: {
    ...Typography.heading3,
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: Spacing.xs,
    fontSize: 16,
    fontWeight: '600'
  },
  description: {
    ...Typography.secondary,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 19,
    fontSize: 13,
    marginBottom: Spacing.lg
  },
  actionContainer: {
    width: '100%',
    maxWidth: 220
  }
});

export default EmptyState;
