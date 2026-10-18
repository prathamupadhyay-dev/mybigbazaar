import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../../constants/colors';
import Typography from '../../constants/typography';
import Radii from '../../constants/radii';
import Spacing from '../../constants/spacing';
import Shadows from '../../constants/shadows';

export const PrimaryButton = ({
  title,
  onPress,
  disabled = false,
  loading = false,
  iconName,
  iconPosition = 'left',
  variant = 'terracotta', // 'terracotta' | 'navy' | 'indigo' | 'emerald'
  style,
  textStyle,
  accessibilityLabel
}) => {
  const scaleAnim = React.useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.timing(scaleAnim, {
      toValue: 0.98,
      duration: 120,
      useNativeDriver: true
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 5,
      tension: 40,
      useNativeDriver: true
    }).start();
  };

  const getBackgroundColor = () => {
    if (disabled) return Colors.disabled;
    if (variant === 'navy' || variant === 'primary') return Colors.navy;
    if (variant === 'indigo') return Colors.indigo;
    if (variant === 'emerald' || variant === 'success') return Colors.emerald;
    return Colors.terracotta;
  };

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }], width: '100%' }}>
      <TouchableOpacity
        style={[
          styles.button,
          { backgroundColor: getBackgroundColor() },
          !disabled && Shadows.subtle,
          style
        ]}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled || loading}
        activeOpacity={0.9}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel || title}
      >
        {loading ? (
          <ActivityIndicator color={Colors.card} size="small" />
        ) : (
          <>
            {iconName && iconPosition === 'left' && (
              <Ionicons
                name={iconName}
                size={18}
                color={Colors.card}
                style={styles.leftIcon}
              />
            )}
            <Text style={[styles.text, textStyle]}>{title}</Text>
            {iconName && iconPosition === 'right' && (
              <Ionicons
                name={iconName}
                size={18}
                color={Colors.card}
                style={styles.rightIcon}
              />
            )}
          </>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  button: {
    height: 48,
    borderRadius: Radii.button,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl
  },
  text: {
    ...Typography.button,
    color: Colors.card,
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.2
  },
  leftIcon: {
    marginRight: Spacing.sm
  },
  rightIcon: {
    marginLeft: Spacing.sm
  }
});

export default PrimaryButton;
