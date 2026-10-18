import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  TextInput,
  Alert
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../../context/AppContext';
import ScreenContainer from '../../components/ScreenContainer';
import Colors from '../../constants/colors';
import Typography from '../../constants/typography';
import Spacing from '../../constants/spacing';
import Radii from '../../constants/radii';
import Shadows from '../../constants/shadows';
import { formatCurrency } from '../../utils/formatters';

export const BucketScreen = () => {
  const navigation = useNavigation();
  const {
    bucket,
    removeFromBucket,
    updateBucketQuantity,
    getBucketTotals,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
    requireAuth,
    formatPrice
  } = useApp();

  const [couponInput, setCouponInput] = useState('');
  const { subtotal, discount, total } = getBucketTotals();

  // 18% GST calculation on discounted subtotal
  const taxableAmount = Math.max(0, subtotal - discount);
  const gstAmount = Math.round(taxableAmount * 0.18);
  const hasPhysicalItems = bucket.some((b) => b.itemType === 'product' || (!b.serviceId && !b.serviceName));
  const deliveryFee = hasPhysicalItems && subtotal <= 499 && subtotal > 0 ? 49 : 0;
  const finalGrandTotal = taxableAmount + gstAmount + deliveryFee;

  const handleApplyCoupon = () => {
    if (!couponInput.trim()) {
      Alert.alert('Enter Code', 'Please type a coupon code (e.g. FIRST20).');
      return;
    }
    const result = applyCoupon(couponInput);
    if (result.success) {
      Alert.alert('Coupon Applied', result.message);
      setCouponInput('');
    } else {
      Alert.alert('Invalid Coupon', result.message);
    }
  };

  const handleRemoveCoupon = () => {
    removeCoupon();
    Alert.alert('Coupon Removed', 'Standard pricing restored.');
  };

  const handleQuantityChange = (item, delta) => {
    const nextQuantity = item.quantity + delta;
    if (nextQuantity <= 0) {
      handleRemoveItem(item);
      return;
    }
    updateBucketQuantity(item.id, nextQuantity);
  };

  const handleRemoveItem = (item) => {
    Alert.alert(
      'Remove Item',
      `Remove "${item.title || item.serviceName || 'this item'}" from cart?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => removeFromBucket(item.id)
        }
      ]
    );
  };

  const handleCheckout = () => {
    if (bucket.length === 0) {
      Alert.alert('Cart Empty', 'Add items or services to your cart before checkout.');
      return;
    }
    requireAuth(navigation, () => {
      navigation.navigate('Checkout');
    });
  };

  const handleContinueShopping = () => {
    navigation.navigate('Main', { screen: 'Home' });
  };

  const renderCartItem = ({ item }) => (
    <View style={styles.cartItem}>
      {item.imageUrl ? (
        <Image source={{ uri: item.imageUrl }} style={styles.itemImage} />
      ) : (
        <View style={[styles.itemImage, styles.placeholderImage]}>
          <Ionicons name="cube-outline" size={24} color={Colors.textSecondary} />
        </View>
      )}
      <View style={styles.itemDetails}>
        <Text style={styles.itemTitle} numberOfLines={2}>
          {item.title || item.serviceName}
        </Text>
        {item.subCategoryName && (
          <Text style={styles.itemSubtitle}>{item.subCategoryName}</Text>
        )}
        {item.serviceDate && (
          <Text style={styles.itemSchedule}>
            <Ionicons name="calendar-outline" size={12} color={Colors.brandPurple} />
            {' '}{item.serviceDate} {item.timeSlot ? `• ${item.timeSlot}` : ''}
          </Text>
        )}
        <View style={styles.priceRow}>
          <Text style={styles.itemPrice}>
            {formatPrice(item.price * item.quantity)}
          </Text>
          {item.quantity > 1 && (
            <Text style={styles.unitPrice}>{formatPrice(item.price)} each</Text>
          )}
        </View>
      </View>

      <View style={styles.itemActions}>
        <View style={styles.quantityContainer}>
          <TouchableOpacity
            style={styles.qtyBtn}
            onPress={() => handleQuantityChange(item, -1)}>
            <Ionicons name="remove" size={16} color={Colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.qtyText}>{item.quantity}</Text>
          <TouchableOpacity
            style={styles.qtyBtn}
            onPress={() => handleQuantityChange(item, 1)}>
            <Ionicons name="add" size={16} color={Colors.textPrimary} />
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={styles.removeBtn} onPress={() => handleRemoveItem(item)}>
          <Ionicons name="trash-outline" size={18} color={Colors.error} />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <ScreenContainer noPadding>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Cart & Bookings</Text>
        <View style={styles.headerRight}>
          {bucket.length > 0 && (
            <Text style={styles.itemCount}>{bucket.length} item{bucket.length > 1 ? 's' : ''}</Text>
          )}
        </View>
      </View>

      {/* Cart Content */}
      <View style={styles.content}>
        {bucket.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="cart-outline" size={80} color={Colors.disabled} />
            <Text style={styles.emptyTitle}>Your cart is empty</Text>
            <Text style={styles.emptySubtitle}>
              Explore our domestic services and products to add them to your cart
            </Text>
            <TouchableOpacity style={styles.shopNowBtn} onPress={handleContinueShopping}>
              <Text style={styles.shopNowText}>Browse Services</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={bucket}
            keyExtractor={(item) => item.id}
            renderItem={renderCartItem}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
            ListFooterComponent={
              <View style={styles.footerSectionsWrapper}>
                {/* Coupon Code Input Box */}
                <View style={styles.couponCard}>
                  <View style={styles.couponHeaderRow}>
                    <Ionicons name="pricetag-outline" size={18} color={Colors.brandPurple} />
                    <Text style={styles.couponCardTitle}>Apply Coupon Code</Text>
                  </View>

                  {appliedCoupon ? (
                    <View style={styles.appliedCouponBadge}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <Ionicons name="checkmark-circle" size={18} color="#10B981" />
                        <Text style={styles.appliedCouponCode}>{appliedCoupon}</Text>
                        <Text style={styles.appliedCouponDiscount}>
                          (-{formatPrice(discount)})
                        </Text>
                      </View>
                      <TouchableOpacity onPress={handleRemoveCoupon}>
                        <Text style={styles.removeCouponText}>Remove</Text>
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <View style={styles.couponInputRow}>
                      <TextInput
                        style={styles.couponInput}
                        placeholder="Try 'FIRST20' for 20% off"
                        placeholderTextColor={Colors.disabled}
                        value={couponInput}
                        onChangeText={setCouponInput}
                        autoCapitalize="characters"
                      />
                      <TouchableOpacity
                        style={styles.applyCouponBtn}
                        onPress={handleApplyCoupon}>
                        <Text style={styles.applyCouponBtnText}>Apply</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>

                {/* Price Breakdown */}
                <View style={styles.summarySection}>
                  <View style={styles.summaryHeading}>
                    <Ionicons name="receipt-outline" size={20} color={Colors.brandPurple} />
                    <Text style={styles.summaryTitle}>Bill Breakdown</Text>
                  </View>

                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Items Subtotal</Text>
                    <Text style={styles.summaryValue}>{formatPrice(subtotal)}</Text>
                  </View>

                  {discount > 0 && (
                    <View style={styles.summaryRow}>
                      <Text style={styles.summaryLabel}>Promo Discount ({appliedCoupon})</Text>
                      <Text style={styles.discountValue}>-{formatPrice(discount)}</Text>
                    </View>
                  )}

                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Taxes & GST (18%)</Text>
                    <Text style={styles.summaryValue}>{formatPrice(gstAmount)}</Text>
                  </View>

                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Convenience / Delivery Fee</Text>
                    <Text style={deliveryFee === 0 ? styles.freeValue : styles.summaryValue}>
                      {deliveryFee === 0 ? 'FREE' : formatPrice(deliveryFee)}
                    </Text>
                  </View>

                  <View style={[styles.summaryRow, styles.totalRow]}>
                    <View>
                      <Text style={styles.totalLabel}>Grand Total</Text>
                      <Text style={styles.taxInclusiveNote}>(Inclusive of all taxes)</Text>
                    </View>
                    <Text style={styles.totalValue}>{formatPrice(finalGrandTotal)}</Text>
                  </View>
                </View>

                <View style={{ height: 220 }} />
              </View>
            }
          />
        )}
      </View>

      {/* Checkout Sticky Footer */}
      {bucket.length > 0 && (
        <View style={styles.checkoutFooter}>
          <View style={styles.totalContainer}>
            <Text style={styles.footerTotalLabel}>Total to Pay</Text>
            <Text style={styles.footerTotalValue}>{formatPrice(finalGrandTotal)}</Text>
          </View>
          <TouchableOpacity style={styles.checkoutBtn} onPress={handleCheckout}>
            <Text style={styles.checkoutBtnText}>Proceed to Checkout</Text>
            <Ionicons name="arrow-forward" size={18} color={Colors.white} />
          </TouchableOpacity>
        </View>
      )}
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.md,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border
  },
  backBtn: {
    padding: Spacing.xs
  },
  headerTitle: {
    ...Typography.heading2,
    fontSize: 18,
    color: Colors.textPrimary
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  itemCount: {
    ...Typography.body,
    fontSize: 13,
    color: Colors.textSecondary
  },
  content: {
    flex: 1,
    backgroundColor: '#F8FAFC'
  },
  listContainer: {
    padding: Spacing.md
  },
  cartItem: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    padding: Spacing.md,
    borderRadius: 14,
    marginBottom: Spacing.sm,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1
  },
  itemImage: {
    width: 68,
    height: 68,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
    marginRight: Spacing.sm
  },
  placeholderImage: {
    alignItems: 'center',
    justifyContent: 'center'
  },
  itemDetails: {
    flex: 1,
    marginRight: Spacing.xs
  },
  itemTitle: {
    ...Typography.bodyBold,
    fontSize: 14,
    color: Colors.textPrimary
  },
  itemSubtitle: {
    ...Typography.caption,
    color: Colors.brandPurple,
    fontWeight: '600',
    marginTop: 1
  },
  itemSchedule: {
    ...Typography.caption,
    color: Colors.textSecondary,
    fontSize: 11,
    marginTop: 2
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4
  },
  itemPrice: {
    ...Typography.bodyBold,
    fontSize: 15,
    color: Colors.brandPurple
  },
  unitPrice: {
    ...Typography.caption,
    fontSize: 11,
    color: Colors.textSecondary,
    marginLeft: 6
  },
  itemActions: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: 12
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
    paddingHorizontal: 2
  },
  qtyBtn: {
    padding: 6
  },
  qtyText: {
    ...Typography.bodyBold,
    fontSize: 13,
    color: Colors.textPrimary,
    paddingHorizontal: 8
  },
  removeBtn: {
    padding: 4
  },
  footerSectionsWrapper: {
    marginTop: Spacing.xs
  },
  couponCard: {
    backgroundColor: Colors.white,
    padding: Spacing.md,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.md
  },
  couponHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: Spacing.sm
  },
  couponCardTitle: {
    ...Typography.bodyBold,
    fontSize: 14,
    color: Colors.textPrimary
  },
  couponInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  couponInput: {
    flex: 1,
    height: 44,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 10,
    paddingHorizontal: Spacing.md,
    ...Typography.body,
    fontSize: 13,
    color: Colors.textPrimary
  },
  applyCouponBtn: {
    height: 44,
    paddingHorizontal: Spacing.lg,
    backgroundColor: Colors.brandPurple,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center'
  },
  applyCouponBtnText: {
    ...Typography.bodyBold,
    color: Colors.white,
    fontSize: 13
  },
  appliedCouponBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#ECFDF5',
    padding: Spacing.sm + 2,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#A7F3D0'
  },
  appliedCouponCode: {
    ...Typography.bodyBold,
    color: '#065F46',
    fontSize: 13
  },
  appliedCouponDiscount: {
    ...Typography.captionBold,
    color: '#059669',
    fontSize: 12
  },
  removeCouponText: {
    ...Typography.captionBold,
    color: Colors.error,
    fontSize: 12
  },
  summarySection: {
    backgroundColor: Colors.white,
    padding: Spacing.md,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border
  },
  summaryHeading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: Spacing.md
  },
  summaryTitle: {
    ...Typography.bodyBold,
    fontSize: 15,
    color: Colors.textPrimary
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm
  },
  summaryLabel: {
    ...Typography.body,
    fontSize: 13,
    color: Colors.textSecondary
  },
  summaryValue: {
    ...Typography.bodyBold,
    fontSize: 13,
    color: Colors.textPrimary
  },
  discountValue: {
    ...Typography.bodyBold,
    fontSize: 13,
    color: '#059669'
  },
  freeValue: {
    ...Typography.bodyBold,
    fontSize: 13,
    color: '#059669'
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: Spacing.sm,
    marginTop: Spacing.xs
  },
  totalLabel: {
    ...Typography.bodyBold,
    fontSize: 16,
    color: Colors.textPrimary
  },
  taxInclusiveNote: {
    ...Typography.caption,
    color: Colors.disabled,
    fontSize: 10
  },
  totalValue: {
    ...Typography.heading2,
    fontSize: 20,
    color: Colors.primary
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
    marginTop: 80
  },
  emptyTitle: {
    ...Typography.heading2,
    fontSize: 18,
    color: Colors.textPrimary,
    marginTop: Spacing.md
  },
  emptySubtitle: {
    ...Typography.secondary,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: Spacing.lg
  },
  shopNowBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.xl,
    paddingVertical: 12,
    borderRadius: Radii.button,
    ...Shadows.card
  },
  shopNowText: {
    ...Typography.button,
    color: Colors.white
  },
  checkoutFooter: {
    position: 'absolute',
    bottom: 12,
    left: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.white,
    padding: Spacing.md,
    borderRadius: Radii.card,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.floating
  },
  totalContainer: {
    flex: 1
  },
  footerTotalLabel: {
    ...Typography.caption,
    color: Colors.textSecondary,
    fontSize: 11
  },
  footerTotalValue: {
    ...Typography.heading2,
    fontSize: 20,
    color: Colors.primary
  },
  checkoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.lg,
    paddingVertical: 13,
    borderRadius: Radii.button,
    gap: 6,
    ...Shadows.card
  },
  checkoutBtnText: {
    ...Typography.button,
    color: Colors.white,
    fontSize: 14
  }
});

export default BucketScreen;
