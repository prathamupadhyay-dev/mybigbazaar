import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../../constants/colors';
import Typography from '../../constants/typography';
import Radii from '../../constants/radii';
import Spacing from '../../constants/spacing';

export const SecondaryButton = ({
  title,
  onPress,
  disabled = false,
  loading = false,
  iconName,
  iconPosition = 'left',
  destructive = false,
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

  const borderColor = destructive ? Colors.crimson : Colors.hairline;
  const textColor = destructive ? Colors.crimson : Colors.textPrimary;
  const bgColor = destructive ? '#FFE4E6' : Colors.card;

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }], width: '100%' }}>
      <TouchableOpacity
        style={[
          styles.button,
          { borderColor, backgroundColor: bgColor },
          style
        ]}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled || loading}
        activeOpacity={0.8}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel || title}
      >
        {loading ? (
          <ActivityIndicator color={textColor} size="small" />
        ) : (
          <>
            {iconName && iconPosition === 'left' && (
              <Ionicons
                name={iconName}
                size={18}
                color={textColor}
                style={styles.leftIcon}
              />
            )}
            <Text style={[styles.text, { color: textColor }, textStyle]}>{title}</Text>
            {iconName && iconPosition === 'right' && (
              <Ionicons
                name={iconName}
                size={18}
                color={textColor}
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
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.hairline,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.lg
  },
  text: {
    ...Typography.bodyBold,
    fontSize: 14,
    color: Colors.textPrimary
  },
  leftIcon: {
    marginRight: Spacing.sm
  },
  rightIcon: {
    marginLeft: Spacing.sm
  }
});

export default SecondaryButton;
