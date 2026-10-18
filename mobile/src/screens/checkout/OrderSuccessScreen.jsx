import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Alert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import ScreenContainer from '../../components/ScreenContainer';
import Colors from '../../constants/colors';
import Typography from '../../constants/typography';
import Radii from '../../constants/radii';
import Spacing from '../../constants/spacing';
import Shadows from '../../constants/shadows';
import { useApp } from '../../context/AppContext';

export default function OrderSuccessScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const {
    orderId = 'ORD-98421',
    amount = 17936,
    paymentMode = 'UPI',
    itemsCount = 1
  } = route.params || {};

  const { appLockEnabled, setAppLockEnabled, appLockPromptShown, setAppLockPromptShown } = useApp();

  const scaleValue = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(scaleValue, {
      toValue: 1,
      friction: 5,
      tension: 40,
      useNativeDriver: true
    }).start();
  }, [scaleValue]);

  useEffect(() => {
    if (appLockEnabled || appLockPromptShown) return undefined;
    setAppLockPromptShown(true);
    const promptTimer = setTimeout(() => {
      Alert.alert(
        'Protect your account',
        'Would you like to turn on App Lock for faster, safer access to your orders and payments?',
        [
          { text: 'Maybe later', style: 'cancel' },
          { text: 'Enable App Lock', onPress: () => setAppLockEnabled(true) }
        ]
      );
    }, 850);
    return () => clearTimeout(promptTimer);
  }, [appLockEnabled, appLockPromptShown, setAppLockEnabled, setAppLockPromptShown]);

  // Delivery estimation: 3 days from today
  const deliveryDate = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });

  return (
    <ScreenContainer noPadding style={styles.container}>
      <View style={styles.content}>
        <Animated.View style={[styles.iconContainer, { transform: [{ scale: scaleValue }] }]}>
          <View style={styles.iconCircle}>
            <Ionicons name="checkmark-circle" size={80} color={Colors.success} />
          </View>
        </Animated.View>

        <Text style={styles.title}>Order Placed!</Text>
        <Text style={styles.subtitle}>
          Thank you for shopping on BigBazaar. Your order has been placed successfully and the seller is preparing your package.
        </Text>

        <View style={[styles.summaryCard, Shadows.card]}>
          <View style={styles.orderIdRow}>
            <Text style={styles.orderIdLabel}>Order Reference</Text>
            <View style={styles.orderBadge}>
              <Text style={styles.orderIdValue}>{orderId}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Estimated Delivery</Text>
            <Text style={styles.detailValueHighlight}>{deliveryDate}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Payment Mode</Text>
            <Text style={styles.detailValue}>{paymentMode}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Total Paid</Text>
            <Text style={styles.detailValue}>₹{amount.toLocaleString('en-IN')}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Items</Text>
            <Text style={styles.detailValue}>{itemsCount} {itemsCount === 1 ? 'item' : 'items'}</Text>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.primaryBtn, Shadows.card]}
          onPress={() => navigation.navigate('OrderHistory', { trackOrderId: orderId })}
          activeOpacity={0.9}
        >
          <Ionicons name="navigate-outline" size={18} color={Colors.card} style={{ marginRight: 6 }} />
          <Text style={styles.primaryBtnText}>Track Order Live</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryBtn}
          onPress={() => navigation.navigate('Main', { screen: 'Home' })}
          activeOpacity={0.8}
        >
          <Text style={styles.secondaryBtnText}>Continue Shopping</Text>
        </TouchableOpacity>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.canvas
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl
  },
  iconContainer: {
    marginBottom: Spacing.md
  },
  iconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: Colors.sunken,
    borderWidth: 1,
    borderColor: Colors.hairline,
    alignItems: 'center',
    justifyContent: 'center'
  },
  title: {
    ...Typography.heading1,
    fontSize: 24,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs
  },
  subtitle: {
    ...Typography.secondary,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.xl,
    lineHeight: 18,
    paddingHorizontal: Spacing.sm
  },
  summaryCard: {
    backgroundColor: Colors.card,
    padding: Spacing.lg,
    borderRadius: Radii.card || 12,
    width: '100%',
    marginBottom: Spacing.xl,
    borderWidth: 1,
    borderColor: Colors.hairline
  },
  orderIdRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  orderIdLabel: {
    ...Typography.captionBold,
    color: Colors.textSecondary
  },
  orderBadge: {
    backgroundColor: Colors.sunken,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radii.badge || 6,
    borderWidth: 1,
    borderColor: Colors.hairline
  },
  orderIdValue: {
    ...Typography.bodyBold,
    fontSize: 13,
    color: Colors.navy,
    letterSpacing: 0.5,
    fontVariant: ['tabular-nums']
  },
  divider: {
    height: 1,
    backgroundColor: Colors.hairline,
    marginVertical: Spacing.sm
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6
  },
  detailLabel: {
    ...Typography.caption,
    fontSize: 12,
    color: Colors.textSecondary
  },
  detailValue: {
    ...Typography.bodyBold,
    fontSize: 12,
    color: Colors.textPrimary,
    fontVariant: ['tabular-nums']
  },
  detailValueHighlight: {
    ...Typography.bodyBold,
    fontSize: 12,
    color: Colors.emerald
  },
  primaryBtn: {
    backgroundColor: Colors.terracotta,
    width: '100%',
    height: 50,
    borderRadius: Radii.button || 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm
  },
  primaryBtnText: {
    ...Typography.button,
    color: Colors.card,
    fontSize: 15
  },
  secondaryBtn: {
    backgroundColor: Colors.card,
    width: '100%',
    height: 48,
    borderRadius: Radii.button || 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.hairline
  },
  secondaryBtnText: {
    ...Typography.bodyBold,
    color: Colors.textPrimary,
    fontSize: 14
  }
});
