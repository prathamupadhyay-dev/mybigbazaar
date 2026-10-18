import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../../context/AppContext';
import ScreenContainer from '../../components/ScreenContainer';
import Colors from '../../constants/colors';
import Typography from '../../constants/typography';
import Spacing from '../../constants/spacing';
import Radii from '../../constants/radii';
import Shadows from '../../constants/shadows';
import { formatCurrency } from '../../utils/formatters';

const DATES = ['Today', 'Tomorrow', 'Day After', '28 Sep', '29 Sep', '30 Sep'];

const TIME_SLOTS = [
  { id: 'slot-1', time: '09:00 AM - 12:00 PM', label: 'Morning Slot' },
  { id: 'slot-2', time: '01:00 PM - 04:00 PM', label: 'Afternoon Slot' },
  { id: 'slot-3', time: '05:00 PM - 08:00 PM', label: 'Evening Slot' }
];

const ADD_ONS = [
  {
    id: 'addon-parts',
    title: 'Spare Parts Protection',
    description: 'Covers up to ₹1,000 for unexpected valve, gasket or switch parts',
    price: 199
  },
  {
    id: 'addon-priority',
    title: 'Priority Technician Dispatch',
    description: 'Guaranteed arrival within chosen 60-min window',
    price: 99
  }
];

export const ServiceBookingScreen = ({ route, navigation }) => {
  const initialCat = route.params?.categoryName || 'Plumber';
  const initialSub = route.params?.subCategoryName || 'General Service';
  const incomingPackage = route.params?.packageSelected || { name: 'Standard', price: route.params?.amount || 499 };
  const basePrice = Number(route.params?.amount) || incomingPackage.price || 499;

  const { activeAddress, addresses, setActiveAddress, createInstantBooking, clearBucket } = useApp();

  // Wizard States: Step 1 (Package & Addons), Step 2 (Schedule), Step 3 (Address), Step 4 (Payment)
  const [currentStep, setCurrentStep] = useState(1);

  // Selected add-ons
  const [selectedAddons, setSelectedAddons] = useState([]);

  // Date and Slot
  const [selectedDate, setSelectedDate] = useState(DATES[1]);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(TIME_SLOTS[0].time);

  // Address selection
  const [selectedAddressId, setSelectedAddressId] = useState(activeAddress?.id || (addresses[0] && addresses[0].id));

  // Payment choice
  const [paymentChoice, setPaymentChoice] = useState('Prepaid');
  const [problemDescription, setProblemDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const toggleAddon = (id) => {
    setSelectedAddons((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const addonsTotal = selectedAddons.reduce((sum, id) => {
    const found = ADD_ONS.find((a) => a.id === id);
    return sum + (found ? found.price : 0);
  }, 0);

  const grandTotal = basePrice + addonsTotal;

  const currentAddress = addresses.find((a) => a.id === selectedAddressId) || activeAddress || (addresses.length > 0 ? addresses[0] : null);

  const handleNextStep = () => {
    if (currentStep === 3 && !currentAddress) {
      Alert.alert(
        'Address Required',
        'Please add or select a service delivery address before proceeding.',
        [
          { text: 'Add Address', onPress: () => navigation.navigate('AddressManagement') },
          { text: 'Cancel', style: 'cancel' }
        ]
      );
      return;
    }
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    } else {
      handleConfirmBooking();
    }
  };

  const handlePreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else {
      navigation.goBack();
    }
  };

  const handleConfirmBooking = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    const formattedAddress = currentAddress
      ? `${currentAddress.houseNo ? currentAddress.houseNo + ', ' : ''}${currentAddress.street || ''}, ${currentAddress.city || ''} - ${currentAddress.pincode || ''}`
      : 'Address on file';

    try {
      const bookingId = await createInstantBooking({
        serviceId: route.params?.serviceId,
        serviceName: initialCat,
        subCategoryName: `${initialSub} (${incomingPackage.name} Package)`,
        category: initialCat,
        packageSelected: {
          name: incomingPackage.name,
          price: grandTotal,
          duration: incomingPackage.duration || '1-2 hours'
        },
        scheduledDate: selectedDate,
        scheduledTimeSlot: selectedTimeSlot,
        providerName: 'Certified Expert Partner',
        providerContact: '+91 98260 12345',
        providerRating: 5.0,
        amount: grandTotal,
        status: 'Upcoming',
        serviceAddress: formattedAddress,
        paymentMode: paymentChoice === 'Prepaid' ? 'UPI' : 'Cash on Delivery'
      });

      setIsSubmitting(false);

      Alert.alert(
        'Booking Confirmed',
        `Your booking #${bookingId} is confirmed for ${selectedDate} (${selectedTimeSlot}). A certified pro will arrive at your address.`,
        [
          {
            text: 'View in My Bookings',
            onPress: () => {
              navigation.navigate('MyActivity', { initialTab: 'bookings' });
            }
          }
        ]
      );
    } catch (err) {
      setIsSubmitting(false);
      Alert.alert('Booking Failed', err.message || 'Unable to confirm booking right now.');
    }
  };

  return (
    <ScreenContainer noPadding style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={handlePreviousStep}
          accessibilityLabel="Back">
          <Ionicons name="arrow-back" size={24} color={Colors.card} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Service Booking Wizard</Text>
        <View style={{ width: 32 }} />
      </View>

      {/* 4-Step Progress Indicator */}
      <View style={styles.progressRow}>
        {[
          { step: 1, label: 'Package' },
          { step: 2, label: 'Schedule' },
          { step: 3, label: 'Address' },
          { step: 4, label: 'Payment' }
        ].map((item, idx) => {
          const isActive = currentStep === item.step;
          const isPassed = currentStep > item.step;
          return (
            <React.Fragment key={item.step}>
              <View style={styles.stepBubbleContainer}>
                <View
                  style={[
                    styles.stepBubble,
                    isActive && styles.stepBubbleActive,
                    isPassed && styles.stepBubblePassed
                  ]}>
                  {isPassed ? (
                    <Ionicons name="checkmark" size={14} color={Colors.white} />
                  ) : (
                    <Text
                      style={[
                        styles.stepBubbleText,
                        (isActive || isPassed) && styles.stepBubbleTextActive
                      ]}>
                      {item.step}
                    </Text>
                  )}
                </View>
                <Text
                  style={[
                    styles.stepLabel,
                    (isActive || isPassed) && styles.stepLabelActive
                  ]}>
                  {item.label}
                </Text>
              </View>
              {idx < 3 && (
                <View
                  style={[
                    styles.stepProgressLine,
                    currentStep > item.step && styles.stepProgressLineActive
                  ]}
                />
              )}
            </React.Fragment>
          );
        })}
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* STEP 1: Package & Add-ons */}
        {currentStep === 1 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>1. Confirm Package & Add-ons</Text>

            <View style={styles.selectedPkgBanner}>
              <View style={{ flex: 1 }}>
                <Text style={styles.selectedPkgName}>{initialSub}</Text>
                <Text style={styles.selectedPkgTier}>
                  {incomingPackage.name} Package • {initialCat}
                </Text>
              </View>
              <Text style={styles.selectedPkgPrice}>{formatCurrency(basePrice)}</Text>
            </View>

            <Text style={[styles.sectionSubtitle, { marginTop: Spacing.md }]}>
              Recommended Protection Add-ons:
            </Text>

            {ADD_ONS.map((addon) => {
              const isChecked = selectedAddons.includes(addon.id);
              return (
                <TouchableOpacity
                  key={addon.id}
                  style={[styles.addonCard, isChecked && styles.addonCardChecked]}
                  onPress={() => toggleAddon(addon.id)}>
                  <Ionicons
                    name={isChecked ? 'checkbox' : 'square-outline'}
                    size={22}
                    color={isChecked ? Colors.primary : Colors.disabled}
                    style={{ marginRight: Spacing.sm }}
                  />
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.addonTitle, isChecked && styles.addonTitleChecked]}>
                      {addon.title}
                    </Text>
                    <Text style={styles.addonDesc}>{addon.description}</Text>
                  </View>
                  <Text style={styles.addonPrice}>+{formatCurrency(addon.price)}</Text>
                </TouchableOpacity>
              );
            })}

            <Text style={[styles.sectionSubtitle, { marginTop: Spacing.md }]}>
              Describe your issue (Optional):
            </Text>
            <TextInput
              style={styles.textArea}
              placeholder="e.g. leaking faucet, second floor bathroom, model number..."
              placeholderTextColor={Colors.textSecondary}
              multiline
              numberOfLines={3}
              value={problemDescription}
              onChangeText={setProblemDescription}
            />
          </View>
        )}

        {/* STEP 2: Date & Slot Picker */}
        {currentStep === 2 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>2. Choose Date & Time Slot</Text>
            <Text style={styles.sectionSubtitle}>Select technician arrival day:</Text>

            <View style={styles.datesRow}>
              {DATES.map((dt) => {
                const isSelected = dt === selectedDate;
                return (
                  <TouchableOpacity
                    key={dt}
                    style={[styles.dateChip, isSelected && styles.selectedDateChip]}
                    onPress={() => setSelectedDate(dt)}>
                    <Text style={[styles.dateText, isSelected && styles.selectedDateText]}>
                      {dt}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <Text style={[styles.sectionSubtitle, { marginTop: Spacing.md }]}>
              Select time slot:
            </Text>
            {TIME_SLOTS.map((slot) => {
              const isSelected = slot.time === selectedTimeSlot;
              return (
                <TouchableOpacity
                  key={slot.id}
                  style={[styles.slotCard, isSelected && styles.selectedSlotCard]}
                  onPress={() => setSelectedTimeSlot(slot.time)}>
                  <Ionicons
                    name="time-outline"
                    size={20}
                    color={isSelected ? Colors.primary : Colors.textSecondary}
                    style={styles.slotIcon}
                  />
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.slotTimeText, isSelected && styles.selectedSlotText]}>
                      {slot.time}
                    </Text>
                    <Text style={styles.slotLabelText}>{slot.label}</Text>
                  </View>
                  {isSelected && (
                    <Ionicons name="checkmark-circle" size={20} color={Colors.primary} />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {/* STEP 3: Service Address */}
        {currentStep === 3 && (
          <View style={styles.section}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>3. Select Service Address</Text>
              <TouchableOpacity onPress={() => navigation.navigate('AddressManagement')}>
                <Text style={styles.changeAddressLink}>+ Add New</Text>
              </TouchableOpacity>
            </View>

            {addresses.length === 0 ? (
              <View style={styles.emptyAddressBox}>
                <Ionicons name="location-outline" size={36} color={Colors.disabled} style={{ marginBottom: Spacing.xs }} />
                <Text style={styles.emptyAddressTitle}>No saved addresses found</Text>
                <Text style={styles.emptyAddressSub}>Please add a service delivery address to continue with your booking.</Text>
                <TouchableOpacity
                  style={styles.addAddressInlineBtn}
                  onPress={() => navigation.navigate('AddressManagement')}>
                  <Ionicons name="add-circle-outline" size={16} color={Colors.white} style={{ marginRight: 6 }} />
                  <Text style={styles.addAddressInlineBtnText}>Add Address</Text>
                </TouchableOpacity>
              </View>
            ) : (
              addresses.map((addr) => {
                const isSelected = addr.id === selectedAddressId;
                return (
                  <TouchableOpacity
                    key={addr.id}
                    style={[styles.addressCard, isSelected && styles.addressCardSelected]}
                    onPress={() => {
                      setSelectedAddressId(addr.id);
                      setActiveAddress(addr);
                    }}>
                    <Ionicons
                      name={isSelected ? 'radio-button-on' : 'radio-button-off'}
                      size={20}
                      color={isSelected ? Colors.primary : Colors.disabled}
                      style={{ marginRight: Spacing.sm }}
                    />
                    <View style={{ flex: 1 }}>
                      <View style={styles.addressTagRow}>
                        <Text style={styles.addressType}>{addr.type || 'Home'} Address</Text>
                        {addr.isDefault && (
                          <View style={styles.defaultPill}>
                            <Text style={styles.defaultPillText}>DEFAULT</Text>
                          </View>
                        )}
                      </View>
                      <Text style={styles.addressLine}>
                        {addr.houseNo ? `${addr.houseNo}, ` : ''}{addr.street}, {addr.city} - {addr.pincode}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })
            )}
          </View>
        )}

        {/* STEP 4: Payment Option */}
        {currentStep === 4 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>4. Payment Option</Text>

            <View style={styles.policyBox}>
              <View style={styles.policyTitleRow}>
                <Ionicons name="shield-checkmark-outline" size={18} color={Colors.primary} />
                <Text style={styles.policyTitle}>Safe Deal & Rework Guarantee</Text>
              </View>
              <Text style={styles.policyText}>
                Free cancellation up to 2 hours before the slot. Full rework covered under 30-day BigBazaar warranty.
              </Text>
            </View>

            <View style={styles.paymentOptionsRow}>
              <TouchableOpacity
                style={[styles.paymentCard, paymentChoice === 'Prepaid' && styles.selectedPaymentCard]}
                onPress={() => setPaymentChoice('Prepaid')}>
                <Ionicons
                  name="card-outline"
                  size={24}
                  color={paymentChoice === 'Prepaid' ? Colors.primary : Colors.textSecondary}
                />
                <Text style={[styles.paymentCardTitle, paymentChoice === 'Prepaid' && styles.selectedPaymentText]}>
                  Prepaid (UPI / Card)
                </Text>
                <Text style={styles.paymentCardSub}>Instant digital confirmation</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.paymentCard,
                  paymentChoice === 'Cash on Delivery' && styles.selectedPaymentCard
                ]}
                onPress={() => setPaymentChoice('Cash on Delivery')}>
                <Ionicons
                  name="cash-outline"
                  size={24}
                  color={paymentChoice === 'Cash on Delivery' ? Colors.primary : Colors.textSecondary}
                />
                <Text
                  style={[
                    styles.paymentCardTitle,
                    paymentChoice === 'Cash on Delivery' && styles.selectedPaymentText
                  ]}>
                  Pay After Service
                </Text>
                <Text style={styles.paymentCardSub}>Cash or UPI on completion</Text>
              </TouchableOpacity>
            </View>

            {/* Summary Review */}
            <View style={styles.reviewSummaryCard}>
              <Text style={styles.reviewSummaryHeading}>Booking Summary</Text>
              <View style={styles.summaryItemRow}>
                <Text style={styles.summaryItemLabel}>Service & Tier:</Text>
                <Text style={styles.summaryItemValue}>{incomingPackage.name} Package</Text>
              </View>
              <View style={styles.summaryItemRow}>
                <Text style={styles.summaryItemLabel}>Scheduled Slot:</Text>
                <Text style={styles.summaryItemValue}>{selectedDate} • {selectedTimeSlot}</Text>
              </View>
              <View style={styles.summaryItemRow}>
                <Text style={styles.summaryItemLabel}>Address:</Text>
                <Text style={styles.summaryItemValue} numberOfLines={1}>
                  {currentAddress ? `${currentAddress.city || currentAddress.street} - ${currentAddress.pincode}` : 'Not selected'}
                </Text>
              </View>
              <View style={[styles.summaryItemRow, styles.summaryTotalRow]}>
                <Text style={styles.summaryTotalLabel}>Total Amount:</Text>
                <Text style={styles.summaryTotalValue}>{formatCurrency(grandTotal)}</Text>
              </View>
            </View>
          </View>
        )}

        {/* Price Breakdown Banner */}
        <View style={styles.summaryBox}>
          <View>
            <Text style={styles.summaryLabel}>Total Payable</Text>
            <Text style={styles.summaryPrice}>{formatCurrency(grandTotal)}</Text>
          </View>
          <View style={styles.guaranteeTag}>
            <Ionicons name="shield-checkmark" size={14} color="#10B981" />
            <Text style={styles.guaranteeText}>30-Day Free Rework</Text>
          </View>
        </View>
      </ScrollView>

      {/* Footer Navigation Buttons */}
      <View style={styles.footerActions}>
        {currentStep > 1 && (
          <TouchableOpacity style={styles.prevBtn} onPress={handlePreviousStep}>
            <Text style={styles.prevBtnText}>Back</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={[styles.confirmBookingBtn, isSubmitting && { opacity: 0.6 }]}
          disabled={isSubmitting}
          onPress={handleNextStep}>
          <Text style={styles.confirmBookingText}>
            {isSubmitting
              ? 'Confirming Booking...'
              : currentStep === 4
              ? 'Confirm & Book Service'
              : `Continue to Step ${currentStep + 1}`}
          </Text>
          {!isSubmitting && <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />}
        </TouchableOpacity>
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.canvas
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.navy,
    borderBottomWidth: 1,
    borderBottomColor: Colors.navy
  },
  backBtn: {
    padding: Spacing.xs,
    minWidth: 44,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center'
  },
  headerTitle: {
    ...Typography.heading2,
    fontSize: 18,
    color: Colors.card
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#081B33',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md
  },
  stepBubbleContainer: {
    alignItems: 'center'
  },
  stepBubble: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(231,229,228,0.2)',
    alignItems: 'center',
    justifyContent: 'center'
  },
  stepBubbleActive: {
    backgroundColor: Colors.terracotta
  },
  stepBubblePassed: {
    backgroundColor: Colors.emerald
  },
  stepBubbleText: {
    ...Typography.captionBold,
    color: Colors.sunken,
    fontSize: 12
  },
  stepBubbleTextActive: {
    color: Colors.card
  },
  stepLabel: {
    ...Typography.caption,
    fontSize: 10,
    color: Colors.sunken,
    marginTop: 2
  },
  stepLabelActive: {
    color: Colors.card,
    fontWeight: '700'
  },
  stepProgressLine: {
    flex: 1,
    height: 2,
    backgroundColor: 'rgba(231,229,228,0.2)',
    marginHorizontal: 6,
    marginBottom: 12
  },
  stepProgressLineActive: {
    backgroundColor: Colors.emerald
  },
  scrollContent: {
    padding: Spacing.md,
    paddingBottom: Spacing.xxl
  },
  section: {
    backgroundColor: Colors.card,
    borderRadius: Radii.card || 12,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.hairline,
    ...Shadows.card
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs
  },
  sectionTitle: {
    ...Typography.heading3,
    fontSize: 16,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs
  },
  sectionSubtitle: {
    ...Typography.captionBold,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs
  },
  selectedPkgBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.sunken,
    padding: Spacing.md,
    borderRadius: Radii.card || 12,
    borderWidth: 1,
    borderColor: Colors.hairline,
    marginTop: Spacing.xs
  },
  selectedPkgName: {
    ...Typography.bodyBold,
    fontSize: 15,
    color: Colors.textPrimary
  },
  selectedPkgTier: {
    ...Typography.caption,
    color: Colors.indigo,
    marginTop: 2
  },
  selectedPkgPrice: {
    ...Typography.heading2,
    fontSize: 18,
    color: Colors.navy,
    fontVariant: ['tabular-nums']
  },
  addonCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.sm + 2,
    borderRadius: Radii.input || 8,
    borderWidth: 1,
    borderColor: Colors.hairline,
    backgroundColor: Colors.card,
    marginBottom: Spacing.xs
  },
  addonCardChecked: {
    borderColor: Colors.indigo,
    borderWidth: 1.5,
    backgroundColor: Colors.sunken
  },
  addonTitle: {
    ...Typography.bodyBold,
    fontSize: 13,
    color: Colors.textPrimary
  },
  addonTitleChecked: {
    color: Colors.navy
  },
  addonDesc: {
    ...Typography.caption,
    color: Colors.textSecondary,
    fontSize: 11,
    marginTop: 2
  },
  addonPrice: {
    ...Typography.bodyBold,
    color: Colors.navy,
    fontSize: 13,
    marginLeft: Spacing.xs,
    fontVariant: ['tabular-nums']
  },
  textArea: {
    backgroundColor: Colors.sunken,
    borderRadius: Radii.input || 8,
    borderWidth: 1,
    borderColor: Colors.hairline,
    padding: Spacing.sm,
    ...Typography.body,
    fontSize: 13,
    color: Colors.textPrimary,
    textAlignVertical: 'top',
    minHeight: 70
  },
  datesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: Spacing.xs
  },
  dateChip: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: Radii.chip || 6,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.hairline
  },
  selectedDateChip: {
    backgroundColor: Colors.indigo,
    borderColor: Colors.indigo
  },
  dateText: {
    ...Typography.captionBold,
    color: Colors.textSecondary
  },
  selectedDateText: {
    color: Colors.card
  },
  slotCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm + 2,
    paddingHorizontal: Spacing.md,
    borderRadius: Radii.input || 8,
    backgroundColor: Colors.card,
    marginBottom: Spacing.xs,
    borderWidth: 1,
    borderColor: Colors.hairline
  },
  selectedSlotCard: {
    borderColor: Colors.indigo,
    borderWidth: 1.5,
    backgroundColor: Colors.sunken
  },
  slotIcon: {
    marginRight: Spacing.sm
  },
  slotTimeText: {
    ...Typography.bodyBold,
    fontSize: 14,
    color: Colors.textPrimary,
    fontVariant: ['tabular-nums']
  },
  slotLabelText: {
    ...Typography.caption,
    color: Colors.textSecondary,
    fontSize: 11
  },
  selectedSlotText: {
    color: Colors.navy
  },
  changeAddressLink: {
    ...Typography.captionBold,
    color: Colors.navy
  },
  addressCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: Radii.card || 12,
    borderWidth: 1,
    borderColor: Colors.hairline,
    backgroundColor: Colors.card,
    marginBottom: Spacing.sm
  },
  addressCardSelected: {
    borderColor: Colors.indigo,
    borderWidth: 1.5,
    backgroundColor: Colors.sunken
  },
  addressTagRow: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  addressType: {
    ...Typography.bodyBold,
    fontSize: 13,
    color: Colors.textPrimary
  },
  defaultPill: {
    backgroundColor: Colors.sunken,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: Radii.badge || 6,
    marginLeft: 6,
    borderWidth: 1,
    borderColor: Colors.hairline
  },
  defaultPillText: {
    fontSize: 9,
    fontWeight: '800',
    color: Colors.emerald
  },
  addressLine: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginTop: 2
  },
  policyBox: {
    backgroundColor: Colors.sunken,
    borderRadius: Radii.input || 8,
    padding: Spacing.sm,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.hairline
  },
  policyTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4
  },
  policyTitle: {
    ...Typography.captionBold,
    color: Colors.navy
  },
  policyText: {
    ...Typography.caption,
    color: Colors.textSecondary,
    lineHeight: 17
  },
  paymentOptionsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: Spacing.md
  },
  paymentCard: {
    flex: 1,
    padding: Spacing.md,
    borderRadius: Radii.card || 12,
    borderWidth: 1,
    borderColor: Colors.hairline,
    backgroundColor: Colors.card,
    alignItems: 'center'
  },
  selectedPaymentCard: {
    borderColor: Colors.indigo,
    borderWidth: 1.5,
    backgroundColor: Colors.sunken
  },
  paymentCardTitle: {
    ...Typography.captionBold,
    color: Colors.textPrimary,
    marginTop: 6,
    textAlign: 'center'
  },
  selectedPaymentText: {
    color: Colors.navy
  },
  paymentCardSub: {
    fontSize: 10,
    color: Colors.textSecondary,
    marginTop: 2,
    textAlign: 'center'
  },
  reviewSummaryCard: {
    backgroundColor: Colors.sunken,
    borderRadius: Radii.input || 8,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.hairline
  },
  reviewSummaryHeading: {
    ...Typography.bodyBold,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs
  },
  summaryItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 3
  },
  summaryItemLabel: {
    ...Typography.caption,
    color: Colors.textSecondary
  },
  summaryItemValue: {
    ...Typography.captionBold,
    color: Colors.textPrimary,
    fontVariant: ['tabular-nums']
  },
  summaryTotalRow: {
    borderTopWidth: 1,
    borderTopColor: Colors.hairline,
    marginTop: 6,
    paddingTop: 6
  },
  summaryTotalLabel: {
    ...Typography.bodyBold,
    color: Colors.textPrimary
  },
  summaryTotalValue: {
    ...Typography.bodyBold,
    color: Colors.navy,
    fontSize: 16,
    fontVariant: ['tabular-nums']
  },
  summaryBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.card,
    padding: Spacing.md,
    borderRadius: Radii.card || 12,
    borderWidth: 1,
    borderColor: Colors.hairline,
    marginBottom: Spacing.md,
    ...Shadows.subtle
  },
  summaryLabel: {
    ...Typography.caption,
    color: Colors.textSecondary
  },
  summaryPrice: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.navy,
    fontVariant: ['tabular-nums']
  },
  guaranteeTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.sunken,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: Radii.badge || 6,
    borderWidth: 1,
    borderColor: Colors.hairline
  },
  guaranteeText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.emerald,
    marginLeft: 4
  },
  footerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    backgroundColor: Colors.card,
    borderTopWidth: 1,
    borderTopColor: Colors.hairline,
    gap: 10,
    ...Shadows.floating
  },
  prevBtn: {
    minHeight: 48,
    paddingVertical: 14,
    paddingHorizontal: Spacing.lg,
    borderRadius: Radii.button || 8,
    borderWidth: 1,
    borderColor: Colors.hairline,
    backgroundColor: Colors.card,
    alignItems: 'center',
    justifyContent: 'center'
  },
  prevBtnText: {
    ...Typography.bodyBold,
    color: Colors.textSecondary
  },
  confirmBookingBtn: {
    flex: 1,
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: Spacing.md,
    borderRadius: Radii.button || 8,
    backgroundColor: Colors.terracotta
  },
  confirmBookingText: {
    ...Typography.bodyBold,
    color: Colors.card,
    fontSize: 14,
    marginRight: 6
  },
  emptyAddressBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xl,
    paddingHorizontal: Spacing.md,
    backgroundColor: Colors.sunken,
    borderRadius: Radii.input || 8,
    borderWidth: 1,
    borderColor: Colors.hairline,
    borderStyle: 'dashed'
  },
  emptyAddressTitle: {
    ...Typography.bodyBold,
    fontSize: 15,
    color: Colors.textPrimary,
    marginBottom: 4
  },
  emptyAddressSub: {
    ...Typography.caption,
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.md,
    lineHeight: 18
  },
  addAddressInlineBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.terracotta,
    paddingVertical: 10,
    paddingHorizontal: Spacing.lg,
    borderRadius: Radii.button || 8,
    minHeight: 44
  },
  addAddressInlineBtnText: {
    ...Typography.captionBold,
    color: Colors.card,
    fontSize: 13
  }
});

export default ServiceBookingScreen;
