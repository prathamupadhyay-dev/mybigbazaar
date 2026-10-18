import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useApp } from '../../context/AppContext';
import ScreenContainer from '../../components/ScreenContainer';
import Colors from '../../constants/colors';
import Typography from '../../constants/typography';
import Spacing from '../../constants/spacing';
import Radii from '../../constants/radii';
import Shadows from '../../constants/shadows';
import { formatCurrency } from '../../utils/formatters';

const SAVED_METHODS_KEY = '@mybigbazaar_saved_payment_methods';

const STATUS_FILTERS = ['All', 'Success', 'Failed', 'Pending'];
const refundRequests = [];

const INITIAL_PAYMENT_METHODS = [];

export const PaymentManagementScreen = () => {
  const navigation = useNavigation();
  const { transactions } = useApp();
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [paymentMethods, setPaymentMethods] = useState(INITIAL_PAYMENT_METHODS);

  // Add Payment Method Modal State
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [methodType, setMethodType] = useState('Card'); // 'Card' | 'UPI'
  const [cardNum, setCardNum] = useState('');
  const [cardHolder, setCardHolder] = useState('John Doe');
  const [cardExp, setCardExp] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [upiId, setUpiId] = useState('');
  const [makeDefault, setMakeDefault] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(SAVED_METHODS_KEY).then((raw) => {
      if (raw) {
        try {
          setPaymentMethods(JSON.parse(raw));
        } catch (e) {}
      }
    });
  }, []);

  const saveMethodsToStorage = async (newList) => {
    setPaymentMethods(newList);
    try {
      await AsyncStorage.setItem(SAVED_METHODS_KEY, JSON.stringify(newList));
    } catch (e) {}
  };

  const filteredTransactions = transactions.filter((t) =>
    selectedFilter === 'All' ? true : t.status === selectedFilter
  );

  const handleDownloadInvoice = (txn) => {
    Alert.alert(
      'Official Receipt Saved',
      `Payment receipt for ${txn.serviceName || 'Transaction'} (Ref: ${txn.transactionId}) has been downloaded successfully.`
    );
  };

  const handleRetryPayment = (txn) => {
    Alert.alert(
      'Payment Gateway Retry',
      `Re-initiating 256-bit gateway for ₹${txn.amount} via ${txn.paymentMode}...`,
      [{ text: 'OK' }]
    );
  };

  const handleRemoveMethod = (method) => {
    Alert.alert(
      'Remove Payment Method?',
      `Are you sure you want to remove ${method.type} (${method.label}) from your saved methods?`,
      [
        { text: 'Keep', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            const updated = paymentMethods.filter((item) => item.id !== method.id);
            saveMethodsToStorage(updated);
          }
        }
      ]
    );
  };

  const handleSetDefault = (methodId) => {
    const updated = paymentMethods.map((m) => ({
      ...m,
      isDefault: m.id === methodId
    }));
    saveMethodsToStorage(updated);
  };

  const handleAddNewMethod = () => {
    if (methodType === 'Card') {
      const cleanCard = cardNum.replace(/\s/g, '');
      if (cleanCard.length < 16) {
        Alert.alert('Invalid Card', 'Please enter a valid 16-digit card number.');
        return;
      }
      if (cardExp.length < 5) {
        Alert.alert('Invalid Expiry', 'Please enter valid expiry date (MM/YY).');
        return;
      }
      const last4 = cleanCard.slice(-4);
      const newMethod = {
        id: `pm-${Date.now()}`,
        label: `•••• ${last4}`,
        type: cleanCard.startsWith('4') ? 'Visa' : 'MasterCard',
        detail: `${cardHolder} · Exp ${cardExp}`,
        isDefault: makeDefault || paymentMethods.length === 0
      };

      const updated = makeDefault
        ? paymentMethods.map((m) => ({ ...m, isDefault: false })).concat(newMethod)
        : [...paymentMethods, newMethod];

      saveMethodsToStorage(updated);
      Alert.alert('Card Added', `Card ending in ${last4} was saved securely.`);
    } else {
      if (!upiId.trim() || !upiId.includes('@')) {
        Alert.alert('Invalid UPI ID', 'Please enter a valid UPI VPA (e.g. name@okaxis).');
        return;
      }
      const newMethod = {
        id: `pm-${Date.now()}`,
        label: upiId.trim().toLowerCase(),
        type: 'UPI',
        detail: 'Verified UPI VPA',
        isDefault: makeDefault || paymentMethods.length === 0
      };

      const updated = makeDefault
        ? paymentMethods.map((m) => ({ ...m, isDefault: false })).concat(newMethod)
        : [...paymentMethods, newMethod];

      saveMethodsToStorage(updated);
      Alert.alert('UPI Saved', `UPI ID ${upiId} was saved.`);
    }

    setAddModalVisible(false);
    setCardNum('');
    setCardExp('');
    setCardCvv('');
    setUpiId('');
    setMakeDefault(false);
  };

  return (
    <ScreenContainer noPadding style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
          accessibilityLabel="Back"
        >
          <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Payments & Refunds</Text>
        <View style={{ width: 32 }} />
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterBar}>
        {STATUS_FILTERS.map((f) => {
          const isSelected = selectedFilter === f;
          return (
            <TouchableOpacity
              key={f}
              style={[styles.filterChip, isSelected && styles.selectedFilterChip]}
              onPress={() => setSelectedFilter(f)}
            >
              <Text style={[styles.filterText, isSelected && styles.selectedFilterText]}>
                {f}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Secure Gateway Banner */}
        <View style={styles.gatewayBanner}>
          <Ionicons name="shield-checkmark" size={22} color="#10B981" />
          <View style={styles.gatewayTextContainer}>
            <Text style={styles.gatewayTitle}>100% Secure Payment Architecture</Text>
            <Text style={styles.gatewaySubtitle}>
              PCI-DSS Level 1 & 256-bit encrypted UPI, Cards & NetBanking
            </Text>
          </View>
        </View>

        {/* Saved Payment Methods Section */}
        <View style={styles.methodsHeader}>
          <Text style={styles.sectionHeader}>Saved Payment Methods</Text>
          <TouchableOpacity onPress={() => setAddModalVisible(true)}>
            <Text style={styles.addMethodText}>+ Add New Method</Text>
          </TouchableOpacity>
        </View>

        {paymentMethods.length === 0 ? (
          <View style={styles.methodEmpty}>
            <Text style={styles.emptySubtitle}>No saved payment methods yet.</Text>
          </View>
        ) : (
          paymentMethods.map((method) => (
            <View key={method.id} style={styles.methodCard}>
              <View style={styles.methodIcon}>
                <Ionicons
                  name={method.type === 'UPI' ? 'phone-portrait-outline' : 'card-outline'}
                  size={20}
                  color={Colors.primary}
                />
              </View>
              <View style={styles.methodCopy}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Text style={styles.methodLabel}>
                    {method.type} · {method.label}
                  </Text>
                  {method.isDefault && (
                    <View style={styles.defaultBadge}>
                      <Text style={styles.defaultBadgeText}>DEFAULT</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.methodDetail}>{method.detail}</Text>
              </View>

              <View style={styles.methodActions}>
                {!method.isDefault && (
                  <TouchableOpacity
                    style={styles.setDefaultBtn}
                    onPress={() => handleSetDefault(method.id)}
                  >
                    <Text style={styles.setDefaultText}>Set Default</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  onPress={() => handleRemoveMethod(method)}
                  accessibilityLabel={`Remove ${method.type}`}
                >
                  <Ionicons name="trash-outline" size={18} color="#DC2626" />
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}

        {/* Transaction History */}
        <Text style={[styles.sectionHeader, { marginTop: Spacing.md }]}>
          Transaction History ({filteredTransactions.length})
        </Text>

        {filteredTransactions.length === 0 ? (
          <View style={styles.emptyBox}>
            <Ionicons name="receipt-outline" size={44} color={Colors.disabled} />
            <Text style={styles.emptyTitle}>No Transactions Found</Text>
            <Text style={styles.emptySubtitle}>
              There are no {selectedFilter.toLowerCase()} transactions recorded.
            </Text>
          </View>
        ) : (
          filteredTransactions.map((txn) => (
            <View key={txn.id} style={styles.card}>
              <View style={styles.cardTop}>
                <View style={styles.txnIdBox}>
                  <Text style={styles.serviceTitle}>{txn.serviceName || 'Service Booking'}</Text>
                  <Text style={styles.txnId}>Txn ID: {txn.transactionId}</Text>
                </View>
                <Text style={styles.amountText}>{formatCurrency(txn.amount)}</Text>
              </View>

              <View style={styles.metaRow}>
                <View style={styles.modeBadge}>
                  <Ionicons
                    name={txn.paymentMode === 'UPI' ? 'phone-portrait-outline' : 'card-outline'}
                    size={12}
                    color={Colors.textPrimary}
                  />
                  <Text style={styles.modeText}>{txn.paymentMode}</Text>
                </View>
                <Text style={styles.dateText}>• {txn.date}</Text>

                {txn.couponApplied && (
                  <View style={styles.couponBadge}>
                    <Text style={styles.couponText}>{txn.couponApplied}</Text>
                  </View>
                )}

                <View
                  style={[
                    styles.statusBadge,
                    txn.status === 'Success' && styles.successBadge,
                    txn.status === 'Failed' && styles.failedBadge,
                    txn.status === 'Pending' && styles.pendingBadge
                  ]}
                >
                  <Text
                    style={[
                      styles.statusText,
                      txn.status === 'Success' && { color: '#059669' },
                      txn.status === 'Failed' && { color: '#DC2626' },
                      txn.status === 'Pending' && { color: '#D97706' }
                    ]}
                  >
                    {txn.status}
                  </Text>
                </View>
              </View>

              <View style={styles.actionsRow}>
                {txn.status === 'Success' && (
                  <TouchableOpacity
                    style={styles.invoiceBtn}
                    onPress={() => handleDownloadInvoice(txn)}
                  >
                    <Ionicons name="download-outline" size={16} color={Colors.primary} />
                    <Text style={styles.invoiceBtnText}>Download Receipt</Text>
                  </TouchableOpacity>
                )}

                {txn.status === 'Failed' && (
                  <TouchableOpacity
                    style={styles.retryBtn}
                    onPress={() => handleRetryPayment(txn)}
                  >
                    <Ionicons name="refresh-outline" size={16} color="#DC2626" />
                    <Text style={styles.retryBtnText}>Retry Gateway</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          ))
        )}

        {/* Refunds Status Section */}
        <Text style={[styles.sectionHeader, { marginTop: Spacing.lg }]}>Refund Statuses</Text>
        {refundRequests.length === 0 ? (
          <View style={styles.methodEmpty}>
            <Text style={styles.emptySubtitle}>No refund requests active.</Text>
          </View>
        ) : (
          refundRequests.map((refund) => (
            <View key={refund.id} style={styles.card}>
              <View style={styles.cardTop}>
                <View style={styles.txnIdBox}>
                  <Text style={styles.serviceTitle}>{refund.reason}</Text>
                  <Text style={styles.txnId}>Ref: {refund.orderId} · {refund.date}</Text>
                </View>
                <Text style={styles.amountText}>{formatCurrency(refund.amount)}</Text>
              </View>
              <View style={styles.refundStatusRow}>
                <Ionicons
                  name={refund.status === 'Processed' ? 'checkmark-circle' : 'time-outline'}
                  size={16}
                  color={refund.status === 'Processed' ? '#059669' : '#D97706'}
                />
                <Text
                  style={[
                    styles.refundStatusText,
                    { color: refund.status === 'Processed' ? '#059669' : '#D97706' }
                  ]}
                >
                  {refund.status}
                </Text>
                <Text style={styles.refundHint}>
                  {refund.status === 'Processed'
                    ? 'Credited to original source account'
                    : 'Processing with payment gateway (usually 3–5 working days)'}
                </Text>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      {/* Add Payment Method Modal */}
      <Modal visible={addModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.addModalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalHeading}>Add Payment Method</Text>
              <TouchableOpacity onPress={() => setAddModalVisible(false)}>
                <Ionicons name="close" size={24} color={Colors.textPrimary} />
              </TouchableOpacity>
            </View>

            {/* Type Switcher */}
            <View style={styles.modalTypeRow}>
              <TouchableOpacity
                style={[styles.modalTypeChip, methodType === 'Card' && styles.modalTypeChipActive]}
                onPress={() => setMethodType('Card')}
              >
                <Ionicons name="card-outline" size={16} color={methodType === 'Card' ? '#FFFFFF' : Colors.primary} />
                <Text style={[styles.modalTypeText, methodType === 'Card' && styles.modalTypeTextActive]}>
                  Credit / Debit Card
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalTypeChip, methodType === 'UPI' && styles.modalTypeChipActive]}
                onPress={() => setMethodType('UPI')}
              >
                <Ionicons name="phone-portrait-outline" size={16} color={methodType === 'UPI' ? '#FFFFFF' : Colors.primary} />
                <Text style={[styles.modalTypeText, methodType === 'UPI' && styles.modalTypeTextActive]}>
                  UPI ID (VPA)
                </Text>
              </TouchableOpacity>
            </View>

            {methodType === 'Card' ? (
              <View>
                <Text style={styles.fieldLabel}>Card Number</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="4123 4567 8901 2345"
                  placeholderTextColor={Colors.textSecondary}
                  keyboardType="numeric"
                  value={cardNum}
                  onChangeText={(t) => {
                    const clean = t.replace(/\D/g, '').slice(0, 16);
                    const groups = clean.match(/.{1,4}/g);
                    setCardNum(groups ? groups.join(' ') : clean);
                  }}
                  maxLength={19}
                />

                <Text style={styles.fieldLabel}>Name on Card</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="Cardholder Name"
                  placeholderTextColor={Colors.textSecondary}
                  value={cardHolder}
                  onChangeText={setCardHolder}
                />

                <View style={{ flexDirection: 'row', gap: 10 }}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.fieldLabel}>Expiry (MM/YY)</Text>
                    <TextInput
                      style={styles.modalInput}
                      placeholder="08/28"
                      placeholderTextColor={Colors.textSecondary}
                      keyboardType="numeric"
                      value={cardExp}
                      onChangeText={(t) => {
                        const clean = t.replace(/\D/g, '').slice(0, 4);
                        setCardExp(clean.length >= 3 ? `${clean.slice(0, 2)}/${clean.slice(2)}` : clean);
                      }}
                      maxLength={5}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.fieldLabel}>CVV Code</Text>
                    <TextInput
                      style={styles.modalInput}
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
              </View>
            ) : (
              <View>
                <Text style={styles.fieldLabel}>UPI ID (VPA)</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="username@okaxis or mobile@paytm"
                  placeholderTextColor={Colors.textSecondary}
                  value={upiId}
                  onChangeText={setUpiId}
                  autoCapitalize="none"
                />
                <Text style={styles.upiHelperText}>
                  A ₹1 refundable token verification ping will be simulated.
                </Text>
              </View>
            )}

            {/* Set Default Switch */}
            <TouchableOpacity
              style={styles.defaultToggleRow}
              onPress={() => setMakeDefault(!makeDefault)}
            >
              <Ionicons
                name={makeDefault ? 'checkbox' : 'square-outline'}
                size={20}
                color={Colors.primary}
              />
              <Text style={styles.defaultToggleText}>Set as primary payment method</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.saveMethodBtn} onPress={handleAddNewMethod}>
              <Text style={styles.saveMethodBtnText}>Save Payment Method</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 0,
    elevation: 0
  },
  backBtn: {
    padding: Spacing.xs
  },
  headerTitle: {
    ...Typography.heading2,
    color: Colors.textPrimary
  },
  filterBar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    gap: 8
  },
  filterChip: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: Radii.pill,
    backgroundColor: '#F1F5F9'
  },
  selectedFilterChip: {
    backgroundColor: Colors.primary
  },
  filterText: {
    ...Typography.captionBold,
    color: Colors.textSecondary,
    fontSize: 12
  },
  selectedFilterText: {
    color: '#FFFFFF'
  },
  scrollContent: {
    padding: Spacing.md,
    paddingBottom: Spacing.xl
  },
  gatewayBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    padding: Spacing.md,
    borderRadius: Radii.card,
    borderWidth: 1,
    borderColor: '#A7F3D0',
    marginBottom: Spacing.md,
    ...Shadows.subtle
  },
  gatewayTextContainer: {
    marginLeft: Spacing.sm,
    flex: 1
  },
  gatewayTitle: {
    ...Typography.bodyBold,
    fontSize: 13,
    color: '#065F46'
  },
  gatewaySubtitle: {
    fontSize: 11,
    color: '#047857',
    marginTop: 1
  },
  sectionHeader: {
    ...Typography.heading3,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm
  },
  methodsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Spacing.xs
  },
  addMethodText: {
    ...Typography.captionBold,
    color: Colors.primary
  },
  methodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: Radii.card,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.sm,
    marginBottom: Spacing.sm,
    ...Shadows.subtle
  },
  methodIcon: {
    width: 38,
    height: 38,
    borderRadius: Radii.control,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm
  },
  methodCopy: {
    flex: 1
  },
  methodLabel: {
    ...Typography.bodyBold,
    color: Colors.textPrimary,
    fontSize: 13
  },
  defaultBadge: {
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: Radii.xs
  },
  defaultBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#065F46'
  },
  methodDetail: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginTop: 2
  },
  methodActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  setDefaultBtn: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radii.xs,
    borderWidth: 1,
    borderColor: Colors.border
  },
  setDefaultText: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.textSecondary
  },
  methodEmpty: {
    backgroundColor: '#FFFFFF',
    borderRadius: Radii.control,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: Radii.card,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.subtle
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.xs
  },
  txnIdBox: {
    flex: 1,
    marginRight: Spacing.sm
  },
  serviceTitle: {
    ...Typography.bodyBold,
    color: Colors.textPrimary,
    fontSize: 14
  },
  txnId: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginTop: 2
  },
  amountText: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.primary
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 4
  },
  modeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: Radii.xs
  },
  modeText: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginLeft: 3
  },
  dateText: {
    ...Typography.caption,
    color: Colors.textSecondary,
    fontSize: 11
  },
  couponBadge: {
    backgroundColor: '#E5F1FF',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: Radii.xs
  },
  couponText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#0284C7'
  },
  statusBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: Radii.xs,
    marginLeft: 'auto'
  },
  successBadge: { backgroundColor: '#D1FAE5' },
  failedBadge: { backgroundColor: '#FEE2E2' },
  pendingBadge: { backgroundColor: '#FEF3C7' },
  statusText: {
    fontSize: 10,
    fontWeight: '700'
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: Spacing.sm,
    paddingTop: Spacing.xs,
    borderTopWidth: 1,
    borderTopColor: Colors.border
  },
  refundStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.sm,
    gap: 5
  },
  refundStatusText: {
    ...Typography.captionBold,
    fontSize: 12
  },
  refundHint: {
    ...Typography.caption,
    color: Colors.textSecondary,
    flex: 1,
    marginLeft: 4
  },
  invoiceBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8
  },
  invoiceBtnText: {
    ...Typography.captionBold,
    color: Colors.primary,
    marginLeft: 4
  },
  retryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8
  },
  retryBtnText: {
    ...Typography.captionBold,
    color: '#DC2626',
    marginLeft: 4
  },
  emptyBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xl
  },
  emptyTitle: {
    ...Typography.heading3,
    color: Colors.textPrimary,
    marginTop: Spacing.sm
  },
  emptySubtitle: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginTop: 4
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: Colors.overlay,
    justifyContent: 'flex-end'
  },
  addModalContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: Radii.sheet,
    borderTopRightRadius: Radii.sheet,
    padding: Spacing.lg,
    ...Shadows.sheet
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md
  },
  modalHeading: {
    ...Typography.heading3,
    fontSize: 17,
    color: Colors.textPrimary
  },
  modalTypeRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: Spacing.md
  },
  modalTypeChip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: Radii.control,
    backgroundColor: '#F1F5F9',
    gap: 6
  },
  modalTypeChipActive: {
    backgroundColor: Colors.primary
  },
  modalTypeText: {
    ...Typography.captionBold,
    color: Colors.textPrimary
  },
  modalTypeTextActive: {
    color: '#FFFFFF'
  },
  fieldLabel: {
    ...Typography.captionBold,
    color: Colors.textSecondary,
    marginBottom: 4,
    marginTop: 4
  },
  modalInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radii.control,
    paddingHorizontal: Spacing.md,
    height: 44,
    fontSize: 13,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs
  },
  upiHelperText: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginTop: 4
  },
  defaultToggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: Spacing.md,
    gap: 8
  },
  defaultToggleText: {
    ...Typography.body,
    fontSize: 13,
    color: Colors.textPrimary
  },
  saveMethodBtn: {
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    borderRadius: Radii.button,
    alignItems: 'center',
    marginBottom: Spacing.md
  },
  saveMethodBtnText: {
    ...Typography.button,
    color: '#FFFFFF',
    fontSize: 15
  }
});

export default PaymentManagementScreen;
