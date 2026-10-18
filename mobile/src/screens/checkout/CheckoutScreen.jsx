import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  ActivityIndicator,
  Alert,
  Image
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import ScreenContainer from '../../components/ScreenContainer';
import { useApp } from '../../context/AppContext';
import Colors from '../../constants/colors';
import Typography from '../../constants/typography';
import Spacing from '../../constants/spacing';
import Radii from '../../constants/radii';
import Shadows from '../../constants/shadows';
import { placeOrder } from '../orders/orderStore';
import { getTaxesApi } from '../../services/taxApi';

const NET_BANKING_OPTIONS = ['HDFC Bank', 'State Bank of India', 'ICICI Bank', 'Axis Bank'];
const UPI_APPS = [
  { id: 'gpay', name: 'Google Pay', icon: 'logo-google' },
  { id: 'phonepe', name: 'PhonePe', icon: 'wallet-outline' },
  { id: 'paytm', name: 'Paytm UPI', icon: 'flash-outline' }
];

export default function CheckoutScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const {
    user,
    currentLocation,
    activeAddress,
    addresses,
    setActiveAddress,
    bucket,
    clearBucket,
    getBucketTotals,
    appliedCoupon,
    formatPrice
  } = useApp();

  const [taxes, setTaxes] = useState([]);

  useEffect(() => {
    let isMounted = true;
    getTaxesApi()
      .then((list) => {
        if (isMounted && Array.isArray(list)) {
          setTaxes(list.filter((t) => t.isActive !== false && t.status !== 'inactive'));
        }
      })
      .catch(() => {});
    return () => {
      isMounted = false;
    };
  }, []);

  const isNegotiatedDeal = Boolean(route.params?.isNegotiatedDeal);
  const dealPrice = Number(route.params?.dealPrice) || 0;
  const directItem = route.params?.item || route.params?.product;

  const checkoutItems = useMemo(() => {
    if (directItem) {
      const unitPrice = isNegotiatedDeal && dealPrice > 0
        ? dealPrice
        : Number(directItem.price ?? directItem.productPrice ?? 0);
      return [
        {
          id: directItem._id || directItem.id || `item-${Date.now()}`,
          title: directItem.title || directItem.productName || 'Marketplace Item',
          serviceName: directItem.title || directItem.productName || 'Marketplace Item',
          price: unitPrice,
          quantity: 1,
          imageUrl:
            directItem.imageUrl ||
            (Array.isArray(directItem.images) && directItem.images[0]) ||
            directItem.image ||
            '',
          image:
            directItem.imageUrl ||
            (Array.isArray(directItem.images) && directItem.images[0]) ||
            directItem.image ||
            '',
          taxId: directItem.taxId,
          sellerName: directItem.sellerName || directItem.seller?.name || 'Verified Seller',
          isNegotiated: isNegotiatedDeal,
        },
      ];
    }
    return bucket;
  }, [directItem, isNegotiatedDeal, dealPrice, bucket]);

  const { subtotal: bucketSubtotal, discount: bucketDiscount } = getBucketTotals();
  const subtotal = directItem
    ? Number(checkoutItems[0]?.price || 0)
    : bucketSubtotal;
  const discount = directItem ? 0 : bucketDiscount;

  // Dynamic Tax Calculation from /tax/get-all or /api/v1/taxes
  const activeTaxSlab = useMemo(() => {
    const itemTaxId = checkoutItems[0]?.taxId;
    if (itemTaxId && taxes.length > 0) {
      const matched = taxes.find((t) => String(t._id || t.id) === String(itemTaxId));
      if (matched) return matched;
    }
    if (taxes.length > 0) {
      return taxes[0];
    }
    return { taxName: 'GST', taxPercentage: 18 };
  }, [taxes, checkoutItems]);

  const taxPercentage = Number(
    activeTaxSlab?.taxPercentage ?? activeTaxSlab?.rate ?? activeTaxSlab?.percentage ?? 18
  );
  const taxName = activeTaxSlab?.taxName || activeTaxSlab?.name || 'GST';

  const taxableAmount = Math.max(0, subtotal - discount);
  const gstAmount = Math.round(taxableAmount * (taxPercentage / 100));
  const hasPhysicalItems = checkoutItems.some(
    (b) => b.itemType === 'product' || (!b.serviceId && !b.serviceName && !b.serviceDate)
  );
  const deliveryFee = hasPhysicalItems && taxableAmount <= 499 && taxableAmount > 0 ? 49 : 0;
  const grandTotal = taxableAmount + gstAmount + deliveryFee;

  const resolvedAddress = useMemo(() => {
    if (activeAddress) return activeAddress;
    return {
      id: 'default-loc',
      type: 'Home',
      fullName: user?.name || 'Verified Buyer',
      phone: user?.phone || '+91 98260 00000',
      houseNo: 'Plot 45',
      street: currentLocation?.address || 'Vijay Nagar',
      city: currentLocation?.city || 'Indore',
      pincode: currentLocation?.pincode || '452010',
    };
  }, [activeAddress, user, currentLocation]);

  // Payment states
  const [selectedPaymentMode, setSelectedPaymentMode] = useState('UPI');
  const [selectedUpiApp, setSelectedUpiApp] = useState('gpay');
  const [customUpiId, setCustomUpiId] = useState('');
  const [useCustomUpi, setUseCustomUpi] = useState(false);

  // Card form state
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [cardHolder, setCardHolder] = useState(user?.name || 'Cardholder');

  // Net banking state
  const [selectedBank, setSelectedBank] = useState('HDFC Bank');

  // Address modal
  const [addressModalVisible, setAddressModalVisible] = useState(false);

  // Gateway Simulation Modal
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState('Connecting to payment gateway...');

  const formatCardNumber = (text) => {
    const cleaned = text.replace(/\D/g, '').slice(0, 16);
    const groups = cleaned.match(/.{1,4}/g);
    setCardNumber(groups ? groups.join(' ') : cleaned);
  };

  const formatExpiry = (text) => {
    const cleaned = text.replace(/\D/g, '').slice(0, 4);
    if (cleaned.length >= 3) {
      setCardExpiry(`${cleaned.slice(0, 2)}/${cleaned.slice(2)}`);
    } else {
      setCardExpiry(cleaned);
    }
  };

  const handlePlaceOrder = () => {
    if (!checkoutItems || checkoutItems.length === 0) {
      Alert.alert('Empty Cart', 'Your shopping bucket is empty. Add items to checkout.', [
        { text: 'Start Shopping', onPress: () => navigation.navigate('Main', { screen: 'Home' }) }
      ]);
      return;
    }

    // Validation for Card
    if (selectedPaymentMode === 'Card') {
      const cleanNum = cardNumber.replace(/\s/g, '');
      if (cleanNum.length < 16) {
        Alert.alert('Invalid Card', 'Please enter a valid 16-digit card number.');
        return;
      }
      if (cardExpiry.length < 5) {
        Alert.alert('Invalid Expiry', 'Please enter valid expiry date (MM/YY).');
        return;
      }
      if (cardCvv.length < 3) {
        Alert.alert('Invalid CVV', 'Please enter 3-digit security CVV code.');
        return;
      }
    }

    // Validation for custom UPI
    if (selectedPaymentMode === 'UPI' && useCustomUpi) {
      if (!customUpiId.includes('@')) {
        Alert.alert('Invalid UPI ID', 'Please enter a valid VPA address (e.g. name@okhdfcbank).');
        return;
      }
    }

    setIsProcessing(true);
    setProcessingStep('Authorizing secure transaction...');

    setTimeout(() => {
      setProcessingStep('256-bit SSL Gateway Verification...');
    }, 500);

    setTimeout(() => {
      setProcessingStep('Transaction approved! Generating order confirmation...');
    }, 950);

    setTimeout(async () => {
      const newOrderNum = `ORD-${Math.floor(10000 + Math.random() * 90000)}`;

      const orderItems = checkoutItems.map((item) => ({
        id: item._id || item.id || `item-${Date.now()}`,
        title: item.serviceName || item.title || 'Marketplace Item',
        category: item.category || item.categoryName || 'General',
        price: Number(item.price || 0),
        quantity: Number(item.quantity) || 1,
        image: item.imageUrl || item.image || '',
        sellerName: item.sellerName || 'Verified Seller',
      }));

      const primary = orderItems[0] || {};

      await placeOrder({
        orderNumber: newOrderNum,
        productId: primary.id,
        title: primary.title,
        price: subtotal,
        taxAmount: gstAmount,
        totalAmount: grandTotal,
        paymentMode: selectedPaymentMode,
        buyerName: user?.name || resolvedAddress?.fullName || 'Verified Buyer',
        buyerPhone: user?.phone || resolvedAddress?.phone || '',
        sellerName: primary.sellerName || 'Verified Seller',
        shippingAddress: resolvedAddress,
        items: orderItems,
        pricing: {
          subtotal,
          discount,
          deliveryFee,
          tax: gstAmount,
          taxName,
          taxPercentage,
          totalAmount: grandTotal,
          couponApplied: isNegotiatedDeal ? 'NEGOTIATED_DEAL' : (appliedCoupon || null)
        }
      });

      if (!directItem) {
        clearBucket();
      }
      setIsProcessing(false);

      navigation.reset({
        index: 0,
        routes: [
          { name: 'Main' },
          {
            name: 'OrderSuccess',
            params: {
              orderId: newOrderNum,
              amount: grandTotal,
              paymentMode: selectedPaymentMode,
              itemsCount: orderItems.length
            }
          }
        ]
      });
    }, 1400);
  };

  return (
    <ScreenContainer noPadding>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={Colors.card} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Order Checkout</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Negotiated Deal Notice */}
        {isNegotiatedDeal && (
          <View style={styles.negotiatedBanner}>
            <View style={styles.negotiatedIconBg}>
              <Ionicons name="pricetag" size={18} color={Colors.indigo} />
            </View>
            <View style={{ flex: 1, marginLeft: Spacing.sm }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={styles.negotiatedBannerTitle}>Negotiated Price Applied</Text>
                <View style={styles.negotiatedBadge}>
                  <Text style={styles.negotiatedBadgeText}>SPECIAL DEAL</Text>
                </View>
              </View>
              <Text style={styles.negotiatedBannerText}>
                Special agreed price of ₹{dealPrice.toLocaleString('en-IN')} with the seller is locked for this checkout.
              </Text>
            </View>
          </View>
        )}

        {/* Delivery Address Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Delivery Address</Text>
            <TouchableOpacity onPress={() => setAddressModalVisible(true)}>
              <Text style={styles.changeText}>Change Address</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.card}>
            <View style={styles.addressRow}>
              <View style={styles.addressIconBg}>
                <Ionicons name="location" size={20} color={Colors.navy} />
              </View>
              <View style={styles.addressInfo}>
                <View style={styles.addressTypeBadge}>
                  <Text style={styles.addressTypeBadgeText}>{resolvedAddress.type || 'Home'}</Text>
                </View>
                <Text style={styles.addressPerson}>
                  {resolvedAddress.fullName || 'Verified Buyer'} · {resolvedAddress.phone || '+91 98260 00000'}
                </Text>
                <Text style={styles.addressText}>
                  {resolvedAddress.houseNo ? `${resolvedAddress.houseNo}, ` : ''}{resolvedAddress.street}
                </Text>
                <Text style={styles.addressSubText}>
                  {resolvedAddress.landmark ? `${resolvedAddress.landmark}, ` : ''}
                  {resolvedAddress.city}, {resolvedAddress.pincode}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Order Items Summary */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Order Items ({checkoutItems.length})</Text>
            {!isNegotiatedDeal ? (
              <TouchableOpacity onPress={() => navigation.navigate('Bucket')}>
                <Text style={styles.changeText}>Edit Cart</Text>
              </TouchableOpacity>
            ) : (
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons name="pricetag" size={13} color={Colors.indigo} style={{ marginRight: 4 }} />
                <Text style={{ fontSize: 12, fontWeight: '700', color: Colors.indigo }}>Negotiated Deal</Text>
              </View>
            )}
          </View>
          <View style={styles.card}>
            {checkoutItems.map((item, idx) => (
              <View key={item.id || idx} style={[styles.itemRow, idx < checkoutItems.length - 1 && styles.borderBottom]}>
                <View style={styles.itemThumb}>
                  <Ionicons name="cube-outline" size={22} color={Colors.navy} />
                </View>
                <View style={styles.itemInfo}>
                  <Text style={styles.itemName} numberOfLines={1}>
                    {item.serviceName || item.title || 'Classifieds Product'}
                  </Text>
                  <Text style={styles.itemMeta}>
                    Qty: {item.quantity || 1} {item.subCategoryName ? `· ${item.subCategoryName}` : ''}
                  </Text>
                </View>
                <Text style={styles.itemAmount}>{formatPrice((item.price || 0) * (item.quantity || 1))}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Payment Methods Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Choose Payment Method</Text>

          {/* Option 1: UPI */}
          <TouchableOpacity
            style={[styles.paymentCard, selectedPaymentMode === 'UPI' && styles.paymentCardActive]}
            onPress={() => setSelectedPaymentMode('UPI')}
          >
            <View style={styles.paymentHeader}>
              <View style={styles.paymentIconBg}>
                <Ionicons name="phone-portrait-outline" size={20} color={Colors.navy} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.paymentTitle}>Instant UPI Payment</Text>
                <Text style={styles.paymentSub}>Google Pay, PhonePe, Paytm, or UPI ID</Text>
              </View>
              <View style={styles.radio}>
                {selectedPaymentMode === 'UPI' && <View style={styles.radioDot} />}
              </View>
            </View>

            {selectedPaymentMode === 'UPI' && (
              <View style={styles.paymentExpandedArea}>
                <Text style={styles.inputSubLabel}>Select Preferred App:</Text>
                <View style={styles.upiAppsRow}>
                  {UPI_APPS.map((app) => (
                    <TouchableOpacity
                      key={app.id}
                      style={[styles.upiChip, selectedUpiApp === app.id && !useCustomUpi && styles.upiChipActive]}
                      onPress={() => {
                        setSelectedUpiApp(app.id);
                        setUseCustomUpi(false);
                      }}
                    >
                      <Ionicons
                        name={app.icon}
                        size={16}
                        color={selectedUpiApp === app.id && !useCustomUpi ? Colors.card : Colors.navy}
                      />
                      <Text style={[styles.upiChipText, selectedUpiApp === app.id && !useCustomUpi && styles.upiChipTextActive]}>
                        {app.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <TouchableOpacity
                  style={styles.customUpiToggle}
                  onPress={() => setUseCustomUpi(!useCustomUpi)}
                >
                  <Ionicons
                    name={useCustomUpi ? 'checkbox' : 'square-outline'}
                    size={18}
                    color={Colors.navy}
                  />
                  <Text style={styles.customUpiToggleText}>Enter another UPI ID</Text>
                </TouchableOpacity>

                {useCustomUpi && (
                  <TextInput
                    style={styles.textInput}
                    placeholder="e.g. mobile@okaxis, user@paytm"
                    placeholderTextColor={Colors.textSecondary}
                    value={customUpiId}
                    onChangeText={setCustomUpiId}
                    autoCapitalize="none"
                  />
                )}
              </View>
            )}
          </TouchableOpacity>

          {/* Option 2: Credit / Debit Card */}
          <TouchableOpacity
            style={[styles.paymentCard, selectedPaymentMode === 'Card' && styles.paymentCardActive]}
            onPress={() => setSelectedPaymentMode('Card')}
          >
            <View style={styles.paymentHeader}>
              <View style={styles.paymentIconBg}>
                <Ionicons name="card-outline" size={20} color={Colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.paymentTitle}>Credit or Debit Card</Text>
                <Text style={styles.paymentSub}>Visa, MasterCard, RuPay, Maestro</Text>
              </View>
              <View style={styles.radio}>
                {selectedPaymentMode === 'Card' && <View style={styles.radioDot} />}
              </View>
            </View>

            {selectedPaymentMode === 'Card' && (
              <View style={styles.paymentExpandedArea}>
                <Text style={styles.inputSubLabel}>Card Number</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="4123 4567 8901 2345"
                  placeholderTextColor={Colors.textSecondary}
                  keyboardType="numeric"
                  value={cardNumber}
                  onChangeText={formatCardNumber}
                  maxLength={19}
                />

                <View style={styles.cardRow}>
                  <View style={{ flex: 1, marginRight: Spacing.sm }}>
                    <Text style={styles.inputSubLabel}>Valid Thru</Text>
                    <TextInput
                      style={styles.textInput}
                      placeholder="MM/YY"
                      placeholderTextColor={Colors.textSecondary}
                      keyboardType="numeric"
                      value={cardExpiry}
                      onChangeText={formatExpiry}
                      maxLength={5}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.inputSubLabel}>CVV</Text>
                    <TextInput
                      style={styles.textInput}
                      placeholder="123"
                      placeholderTextColor={Colors.textSecondary}
                      keyboardType="numeric"
                      secureTextEntry
                      value={cardCvv}
                      onChangeText={(t) => setCardCvv(t.slice(0, 4))}
                      maxLength={4}
                    />
                  </View>
                </View>

                <Text style={styles.inputSubLabel}>Cardholder Name</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="Name on card"
                  placeholderTextColor={Colors.textSecondary}
                  value={cardHolder}
                  onChangeText={setCardHolder}
                />
              </View>
            )}
          </TouchableOpacity>

          {/* Option 3: Net Banking */}
          <TouchableOpacity
            style={[styles.paymentCard, selectedPaymentMode === 'NetBanking' && styles.paymentCardActive]}
            onPress={() => setSelectedPaymentMode('NetBanking')}
          >
            <View style={styles.paymentHeader}>
              <View style={styles.paymentIconBg}>
                <Ionicons name="business-outline" size={20} color={Colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.paymentTitle}>Net Banking</Text>
                <Text style={styles.paymentSub}>Direct bank debit from major Indian banks</Text>
              </View>
              <View style={styles.radio}>
                {selectedPaymentMode === 'NetBanking' && <View style={styles.radioDot} />}
              </View>
            </View>

            {selectedPaymentMode === 'NetBanking' && (
              <View style={styles.paymentExpandedArea}>
                <Text style={styles.inputSubLabel}>Select Your Bank:</Text>
                <View style={styles.bankGrid}>
                  {NET_BANKING_OPTIONS.map((bank) => (
                    <TouchableOpacity
                      key={bank}
                      style={[styles.bankChip, selectedBank === bank && styles.bankChipActive]}
                      onPress={() => setSelectedBank(bank)}
                    >
                      <Ionicons
                        name="checkmark-circle"
                        size={16}
                        color={selectedBank === bank ? Colors.navy : Colors.hairline}
                      />
                      <Text style={[styles.bankChipText, selectedBank === bank && styles.bankChipTextActive]}>
                        {bank}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}
          </TouchableOpacity>

          {/* Option 4: COD / Pay After Service */}
          <TouchableOpacity
            style={[styles.paymentCard, selectedPaymentMode === 'Cash on Delivery' && styles.paymentCardActive]}
            onPress={() => setSelectedPaymentMode('Cash on Delivery')}
          >
            <View style={styles.paymentHeader}>
              <View style={styles.paymentIconBg}>
                <Ionicons name="cash-outline" size={20} color={Colors.emerald} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.paymentTitle}>Cash on Delivery (COD)</Text>
                <Text style={styles.paymentSub}>Pay with cash or QR upon delivery/inspection</Text>
              </View>
              <View style={styles.radio}>
                {selectedPaymentMode === 'Cash on Delivery' && <View style={styles.radioDot} />}
              </View>
            </View>
          </TouchableOpacity>
        </View>

        {/* Detailed Price Breakdown */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Price Breakdown</Text>
          <View style={styles.card}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>{isNegotiatedDeal ? 'Agreed Price' : 'Items Subtotal'}</Text>
              <Text style={styles.summaryValue}>{formatPrice(subtotal)}</Text>
            </View>

            {isNegotiatedDeal && (
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabelBlue}>Chat Negotiation Discount</Text>
                <Text style={styles.summaryValueBlue}>Applied</Text>
              </View>
            )}

            {discount > 0 && (
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabelGreen}>Coupon Discount ({appliedCoupon})</Text>
                <Text style={styles.summaryValueGreen}>-{formatPrice(discount)}</Text>
              </View>
            )}

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Taxes & {taxName} ({taxPercentage}%)</Text>
              <Text style={styles.summaryValue}>{formatPrice(gstAmount)}</Text>
            </View>

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Express Delivery</Text>
              <Text style={deliveryFee === 0 ? styles.summaryValueFree : styles.summaryValue}>
                {deliveryFee === 0 ? 'FREE' : formatPrice(deliveryFee)}
              </Text>
            </View>

            <View style={styles.divider} />

            <View style={[styles.summaryRow, { marginBottom: 0 }]}>
              <View>
                <Text style={styles.summaryTotalLabel}>Grand Total</Text>
                <Text style={styles.summaryTotalSub}>Inclusive of all taxes</Text>
              </View>
              <Text style={styles.summaryTotalValue}>{formatPrice(grandTotal)}</Text>
            </View>
          </View>
        </View>

        {/* Buyer Protection Banner */}
        <View style={styles.assurance}>
          <Ionicons name="shield-checkmark" size={22} color={Colors.emerald} />
          <View style={{ flex: 1, marginLeft: Spacing.sm }}>
            <Text style={styles.assuranceTitle}>100% BigBazaar Buyer Protection</Text>
            <Text style={styles.assuranceText}>
              Escrow funds held securely until delivery confirmation. Full refund on cancellation.
            </Text>
          </View>
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Sticky Bottom Bar */}
      <View style={styles.footer}>
        <View style={styles.totalContainer}>
          <Text style={styles.footerTotalLabel}>Total Payable</Text>
          <Text style={styles.footerTotalValue}>{formatPrice(grandTotal)}</Text>
        </View>
        <TouchableOpacity style={styles.placeOrderBtn} onPress={handlePlaceOrder}>
          <Text style={styles.placeOrderBtnText}>Place Order Now</Text>
          <Ionicons name="chevron-forward" size={18} color={Colors.card} style={{ marginLeft: 4 }} />
        </TouchableOpacity>
      </View>

      {/* Address Switcher Modal */}
      <Modal visible={addressModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.addressModal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Delivery Address</Text>
              <TouchableOpacity onPress={() => setAddressModalVisible(false)}>
                <Ionicons name="close" size={24} color={Colors.textPrimary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={{ maxHeight: 350 }}>
              {addresses.map((addr) => (
                <TouchableOpacity
                  key={addr.id}
                  style={[styles.addrOption, activeAddress?.id === addr.id && styles.addrOptionActive]}
                  onPress={() => {
                    setActiveAddress(addr);
                    setAddressModalVisible(false);
                  }}
                >
                  <Ionicons
                    name={activeAddress?.id === addr.id ? 'radio-button-on' : 'radio-button-off'}
                    size={20}
                    color={activeAddress?.id === addr.id ? Colors.terracotta : Colors.disabled}
                  />
                  <View style={{ marginLeft: Spacing.sm, flex: 1 }}>
                    <Text style={styles.addrType}>{addr.type} ({addr.houseNo})</Text>
                    <Text style={styles.addrDetails}>{addr.street}, {addr.city} - {addr.pincode}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <TouchableOpacity
              style={styles.manageAddrBtn}
              onPress={() => {
                setAddressModalVisible(false);
                navigation.navigate('AddressManagement');
              }}
            >
              <Ionicons name="add-circle-outline" size={18} color={Colors.navy} />
              <Text style={styles.manageAddrText}>Add / Manage Addresses</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Gateway Simulation Modal */}
      <Modal visible={isProcessing} transparent animationType="fade">
        <View style={styles.gatewayOverlay}>
          <View style={styles.gatewayBox}>
            <ActivityIndicator size="large" color={Colors.navy} style={{ marginBottom: Spacing.md }} />
            <Text style={styles.gatewayHeading}>Processing Payment</Text>
            <Text style={styles.gatewaySub}>{processingStep}</Text>

            <View style={styles.gatewayLockRow}>
              <Ionicons name="lock-closed" size={16} color={Colors.emerald} />
              <Text style={styles.gatewayLockText}>256-Bit Bank-Grade Encryption</Text>
            </View>
          </View>
        </View>
      </Modal>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.navy,
    borderBottomWidth: 1,
    borderBottomColor: Colors.hairline
  },
  backBtn: {
    padding: Spacing.xs
  },
  headerTitle: {
    ...Typography.heading2,
    fontSize: 18,
    color: Colors.card
  },
  content: {
    flex: 1,
    backgroundColor: Colors.canvas
  },
  section: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.xs
  },
  sectionTitle: {
    ...Typography.heading3,
    fontSize: 16,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs
  },
  changeText: {
    ...Typography.captionBold,
    color: Colors.terracotta
  },
  card: {
    backgroundColor: Colors.card,
    borderRadius: Radii.card || 12,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.hairline
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'flex-start'
  },
  addressIconBg: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.sunken,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm
  },
  addressInfo: {
    flex: 1
  },
  addressTypeBadge: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.sunken,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: Radii.badge || 6,
    borderWidth: 1,
    borderColor: Colors.hairline,
    marginBottom: 4
  },
  addressTypeBadgeText: {
    ...Typography.captionBold,
    fontSize: 11,
    color: Colors.navy
  },
  addressPerson: {
    ...Typography.bodyBold,
    fontSize: 13,
    color: Colors.textPrimary,
    marginBottom: 2
  },
  addressText: {
    ...Typography.body,
    fontSize: 13,
    color: Colors.textSecondary
  },
  addressSubText: {
    ...Typography.caption,
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2
  },
  missingAddressText: {
    ...Typography.bodyBold,
    color: Colors.terracotta,
    textAlign: 'center',
    paddingVertical: Spacing.sm
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm
  },
  borderBottom: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.hairline
  },
  itemThumb: {
    width: 38,
    height: 38,
    borderRadius: Radii.input || 8,
    backgroundColor: Colors.sunken,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm
  },
  itemInfo: {
    flex: 1
  },
  itemName: {
    ...Typography.bodyBold,
    fontSize: 13,
    color: Colors.textPrimary
  },
  itemMeta: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginTop: 2
  },
  itemAmount: {
    ...Typography.bodyBold,
    fontSize: 14,
    color: Colors.textPrimary,
    fontVariant: ['tabular-nums']
  },
  paymentCard: {
    backgroundColor: Colors.card,
    borderRadius: Radii.card || 12,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.hairline,
    marginBottom: Spacing.sm
  },
  paymentCardActive: {
    borderColor: Colors.navy,
    backgroundColor: Colors.sunken
  },
  paymentHeader: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  paymentIconBg: {
    width: 38,
    height: 38,
    borderRadius: Radii.input || 8,
    backgroundColor: Colors.sunken,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm
  },
  paymentTitle: {
    ...Typography.bodyBold,
    fontSize: 14,
    color: Colors.textPrimary
  },
  paymentSub: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginTop: 1
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: Colors.hairline,
    alignItems: 'center',
    justifyContent: 'center'
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.terracotta
  },
  paymentExpandedArea: {
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.hairline
  },
  inputSubLabel: {
    ...Typography.captionBold,
    color: Colors.textSecondary,
    marginBottom: 6,
    marginTop: 4
  },
  upiAppsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: Spacing.sm
  },
  upiChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: Radii.input || 8,
    backgroundColor: Colors.sunken,
    borderWidth: 1,
    borderColor: Colors.hairline,
    gap: 6
  },
  upiChipActive: {
    backgroundColor: Colors.navy,
    borderColor: Colors.navy
  },
  upiChipText: {
    ...Typography.captionBold,
    color: Colors.textPrimary
  },
  upiChipTextActive: {
    color: Colors.card
  },
  customUpiToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: Spacing.xs,
    gap: 6
  },
  customUpiToggleText: {
    ...Typography.caption,
    color: Colors.textPrimary
  },
  textInput: {
    backgroundColor: Colors.sunken,
    borderWidth: 1,
    borderColor: Colors.hairline,
    borderRadius: Radii.input || 8,
    paddingHorizontal: Spacing.md,
    height: 44,
    fontSize: 13,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs
  },
  cardRow: {
    flexDirection: 'row',
    marginBottom: Spacing.xs
  },
  bankGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8
  },
  bankChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: Radii.input || 8,
    backgroundColor: Colors.sunken,
    borderWidth: 1,
    borderColor: Colors.hairline,
    gap: 6,
    width: '48%'
  },
  bankChipActive: {
    borderColor: Colors.navy,
    borderWidth: 1.5,
    backgroundColor: Colors.card
  },
  bankChipText: {
    ...Typography.caption,
    color: Colors.textPrimary
  },
  bankChipTextActive: {
    ...Typography.captionBold,
    color: Colors.navy
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs
  },
  summaryLabel: {
    ...Typography.body,
    fontSize: 13,
    color: Colors.textSecondary
  },
  summaryValue: {
    ...Typography.bodyBold,
    fontSize: 13,
    color: Colors.textPrimary,
    fontVariant: ['tabular-nums']
  },
  summaryLabelGreen: {
    ...Typography.body,
    fontSize: 13,
    color: Colors.emerald
  },
  summaryValueGreen: {
    ...Typography.bodyBold,
    fontSize: 13,
    color: Colors.emerald,
    fontVariant: ['tabular-nums']
  },
  summaryValueFree: {
    ...Typography.bodyBold,
    fontSize: 13,
    color: Colors.emerald
  },
  divider: {
    height: 1,
    backgroundColor: Colors.hairline,
    marginVertical: Spacing.sm
  },
  summaryTotalLabel: {
    ...Typography.bodyBold,
    fontSize: 15,
    color: Colors.textPrimary
  },
  summaryTotalSub: {
    ...Typography.caption,
    fontSize: 11,
    color: Colors.textSecondary
  },
  summaryTotalValue: {
    ...Typography.heading2,
    fontSize: 18,
    color: Colors.navy,
    fontVariant: ['tabular-nums']
  },
  summaryLabelBlue: {
    ...Typography.body,
    fontSize: 13,
    color: Colors.indigo,
    fontWeight: '600'
  },
  summaryValueBlue: {
    ...Typography.bodyBold,
    fontSize: 13,
    color: Colors.indigo
  },
  negotiatedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: Spacing.md,
    marginTop: Spacing.md,
    padding: Spacing.md,
    backgroundColor: Colors.sunken,
    borderRadius: Radii.card || 12,
    borderWidth: 1,
    borderColor: Colors.hairline
  },
  negotiatedIconBg: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.hairline,
    alignItems: 'center',
    justifyContent: 'center'
  },
  negotiatedBannerTitle: {
    ...Typography.bodyBold,
    fontSize: 13,
    color: Colors.indigo
  },
  negotiatedBadge: {
    backgroundColor: Colors.indigo,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: Radii.badge || 6,
    marginLeft: 6
  },
  negotiatedBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: Colors.card
  },
  negotiatedBannerText: {
    ...Typography.caption,
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2
  },
  assurance: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: Spacing.md,
    padding: Spacing.md,
    backgroundColor: Colors.sunken,
    borderRadius: Radii.card || 12,
    borderWidth: 1,
    borderColor: Colors.hairline
  },
  assuranceTitle: {
    ...Typography.bodyBold,
    fontSize: 12,
    color: Colors.emerald
  },
  assuranceText: {
    ...Typography.caption,
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.card,
    borderTopWidth: 1,
    borderTopColor: Colors.hairline,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    paddingBottom: Spacing.lg,
    ...Shadows.floating
  },
  totalContainer: {
    flex: 1
  },
  footerTotalLabel: {
    ...Typography.caption,
    color: Colors.textSecondary
  },
  footerTotalValue: {
    ...Typography.heading1,
    fontSize: 22,
    color: Colors.navy,
    fontVariant: ['tabular-nums']
  },
  placeOrderBtn: {
    backgroundColor: Colors.terracotta,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
    paddingVertical: 14,
    minHeight: 48,
    borderRadius: Radii.button || 8,
    ...Shadows.card
  },
  placeOrderBtnText: {
    ...Typography.button,
    color: Colors.card,
    fontSize: 15
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(28,25,23,0.5)',
    justifyContent: 'flex-end'
  },
  addressModal: {
    backgroundColor: Colors.card,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    borderWidth: 1,
    borderColor: Colors.hairline,
    padding: Spacing.lg,
    ...Shadows.sheet
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md
  },
  modalTitle: {
    ...Typography.heading3,
    fontSize: 17,
    color: Colors.textPrimary
  },
  addrOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: Radii.input || 8,
    borderWidth: 1,
    borderColor: Colors.hairline,
    backgroundColor: Colors.sunken,
    marginBottom: Spacing.sm
  },
  addrOptionActive: {
    borderColor: Colors.navy,
    borderWidth: 1.5,
    backgroundColor: Colors.card
  },
  addrType: {
    ...Typography.bodyBold,
    fontSize: 13,
    color: Colors.textPrimary
  },
  addrDetails: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginTop: 2
  },
  manageAddrBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    gap: 6
  },
  manageAddrText: {
    ...Typography.bodyBold,
    color: Colors.terracotta,
    fontSize: 14
  },
  gatewayOverlay: {
    flex: 1,
    backgroundColor: 'rgba(28,25,23,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl
  },
  gatewayBox: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.hairline,
    padding: Spacing.xl,
    alignItems: 'center',
    width: '100%',
    maxWidth: 320
  },
  gatewayHeading: {
    ...Typography.heading2,
    fontSize: 18,
    color: Colors.textPrimary,
    marginBottom: 4
  },
  gatewaySub: {
    ...Typography.body,
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.md
  },
  gatewayLockRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.sunken,
    borderWidth: 1,
    borderColor: Colors.hairline,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Radii.badge || 6,
    gap: 6
  },
  gatewayLockText: {
    ...Typography.captionBold,
    fontSize: 11,
    color: Colors.emerald
  }
});
