import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  Switch,
  Alert,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import ScreenContainer from '../../components/ScreenContainer';
import Colors from '../../constants/colors';
import Typography from '../../constants/typography';
import Spacing from '../../constants/spacing';
import Radii from '../../constants/radii';
import Shadows from '../../constants/shadows';
import { useApp } from '../../context/AppContext';
import AuthRequiredState from '../../components/common/AuthRequiredState';

const ADDRESS_TYPES = ['Home', 'Office', 'Other'];

export const AddressManagementScreen = () => {
  const navigation = useNavigation();
  const {
    addresses,
    activeAddress,
    addAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress,
    user,
    isAuthenticated,
  } = useApp();

  const [modalVisible, setModalVisible] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState(null);

  // Form State
  const [addressType, setAddressType] = useState('Home');
  const [houseNo, setHouseNo] = useState('');
  const [street, setStreet] = useState('');
  const [landmark, setLandmark] = useState('');
  const [city, setCity] = useState('');
  const [pincode, setPincode] = useState('');
  const [isDefault, setIsDefault] = useState(false);
  const [errors, setErrors] = useState({});

  const openAddModal = () => {
    setEditingAddressId(null);
    setAddressType('Home');
    setHouseNo('');
    setStreet('');
    setLandmark('');
    setCity(activeAddress?.city || 'Kottayam');
    setPincode(activeAddress?.pincode || '686001');
    setIsDefault(addresses.length === 0);
    setErrors({});
    setModalVisible(true);
  };

  const openEditModal = (addr) => {
    setEditingAddressId(addr.id);
    setAddressType(addr.type || 'Home');
    setHouseNo(addr.houseNo || '');
    setStreet(addr.street || '');
    setLandmark(addr.landmark || '');
    setCity(addr.city || '');
    setPincode(addr.pincode || '');
    setIsDefault(Boolean(addr.isDefault));
    setErrors({});
    setModalVisible(true);
  };

  const validateForm = () => {
    const errs = {};
    if (!houseNo.trim()) errs.houseNo = 'House / Flat / Building No. is required';
    if (!street.trim()) errs.street = 'Street or locality is required';
    if (!city.trim()) errs.city = 'City name is required';
    if (!/^\d{6}$/.test(pincode.trim())) errs.pincode = 'Valid 6-digit pincode is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSaveAddress = () => {
    if (!validateForm()) return;

    const payload = {
      type: addressType,
      houseNo: houseNo.trim(),
      street: street.trim(),
      landmark: landmark.trim(),
      city: city.trim(),
      pincode: pincode.trim(),
      isDefault,
    };

    if (editingAddressId) {
      updateAddress(editingAddressId, payload);
    } else {
      addAddress(payload);
    }

    setModalVisible(false);
  };

  const confirmDeleteAddress = (id, label) => {
    Alert.alert(
      'Delete Address',
      `Are you sure you want to remove "${label}" from your saved addresses?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteAddress(id),
        },
      ]
    );
  };

  return (
    <ScreenContainer noPadding style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()} accessibilityLabel="Back">
          <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Saved Addresses</Text>
        <TouchableOpacity onPress={openAddModal} style={styles.headerAddBtn}>
          <Ionicons name="add" size={24} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      {!isAuthenticated || !user ? (
        <AuthRequiredState
          title="My Addresses"
          message="Sign in to save and manage your verified delivery and service addresses."
        />
      ) : (
        <>
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Add Address Quick Card */}
        <TouchableOpacity style={styles.addNewCard} onPress={openAddModal}>
          <View style={styles.addNewIcon}>
            <Ionicons name="add-circle" size={24} color={Colors.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.addNewTitle}>Add New Address</Text>
            <Text style={styles.addNewSubtitle}>Deliver orders and book services to this place</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={Colors.primary} />
        </TouchableOpacity>

        <Text style={styles.sectionHeading}>Your Addresses ({addresses.length})</Text>

        {addresses.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="location-outline" size={48} color={Colors.disabled} />
            <Text style={styles.emptyTitle}>No saved addresses yet</Text>
            <Text style={styles.emptySubtitle}>Add your home or workplace address for instant checkout.</Text>
            <TouchableOpacity style={styles.emptyBtn} onPress={openAddModal}>
              <Text style={styles.emptyBtnText}>Add Address</Text>
            </TouchableOpacity>
          </View>
        ) : (
          addresses.map((addr) => {
            const isSelected = addr.isDefault || activeAddress?.id === addr.id;
            return (
              <View key={addr.id} style={[styles.addressCard, isSelected && styles.addressCardDefault]}>
                <View style={styles.cardHeader}>
                  <View style={styles.typeRow}>
                    <View style={styles.typeBadge}>
                      <Ionicons
                        name={
                          addr.type === 'Office'
                            ? 'briefcase-outline'
                            : addr.type === 'Other'
                            ? 'location-outline'
                            : 'home-outline'
                        }
                        size={14}
                        color={Colors.primary}
                        style={{ marginRight: 4 }}
                      />
                      <Text style={styles.typeText}>{addr.type || 'Home'}</Text>
                    </View>
                    {addr.isDefault && (
                      <View style={styles.defaultBadge}>
                        <Text style={styles.defaultText}>DEFAULT</Text>
                      </View>
                    )}
                  </View>
                  <View style={styles.actionIcons}>
                    <TouchableOpacity
                      style={styles.iconBtn}
                      onPress={() => openEditModal(addr)}
                      accessibilityLabel="Edit address">
                      <Ionicons name="pencil-outline" size={18} color={Colors.textSecondary} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.iconBtn}
                      onPress={() => confirmDeleteAddress(addr.id, `${addr.type || 'Address'} (${addr.houseNo})`)}
                      accessibilityLabel="Delete address">
                      <Ionicons name="trash-outline" size={18} color={Colors.error} />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Address Details */}
                <Text style={styles.addressLine}>
                  {addr.houseNo}, {addr.street}
                </Text>
                {addr.landmark ? (
                  <Text style={styles.landmarkText}>Landmark: {addr.landmark}</Text>
                ) : null}
                <Text style={styles.cityPincode}>
                  {addr.city} — {addr.pincode}
                </Text>

                {/* Make Default Action if not default */}
                {!addr.isDefault && (
                  <TouchableOpacity
                    style={styles.setDefaultBtn}
                    onPress={() => setDefaultAddress(addr.id)}>
                    <Ionicons name="radio-button-off" size={16} color={Colors.primary} style={{ marginRight: 6 }} />
                    <Text style={styles.setDefaultText}>Set as default delivery address</Text>
                  </TouchableOpacity>
                )}
              </View>
            );
          })
        )}
      </ScrollView>

      {/* Add / Edit Address Modal */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <TouchableOpacity style={styles.modalBg} onPress={() => setModalVisible(false)} activeOpacity={1} />
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingAddressId ? 'Edit Address' : 'Add New Address'}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color={Colors.textPrimary} />
              </TouchableOpacity>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={styles.modalFormContent}>
              {/* Type Selection */}
              <Text style={styles.inputLabel}>Address Type</Text>
              <View style={styles.typeSelector}>
                {ADDRESS_TYPES.map((t) => {
                  const selected = addressType === t;
                  return (
                    <TouchableOpacity
                      key={t}
                      style={[styles.typeOption, selected && styles.typeOptionSelected]}
                      onPress={() => setAddressType(t)}>
                      <Text style={[styles.typeOptionText, selected && styles.typeOptionTextSelected]}>
                        {t}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* House No */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>House / Flat / Block No.</Text>
                <TextInput
                  style={[styles.modalInput, errors.houseNo && styles.inputError]}
                  value={houseNo}
                  onChangeText={setHouseNo}
                  placeholder="e.g. Flat 402, Royal Residency"
                  placeholderTextColor={Colors.disabled}
                />
                {errors.houseNo && <Text style={styles.errorText}>{errors.houseNo}</Text>}
              </View>

              {/* Street */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Street / Locality</Text>
                <TextInput
                  style={[styles.modalInput, errors.street && styles.inputError]}
                  value={street}
                  onChangeText={setStreet}
                  placeholder="e.g. Kumarakom Road, Kaloor"
                  placeholderTextColor={Colors.disabled}
                />
                {errors.street && <Text style={styles.errorText}>{errors.street}</Text>}
              </View>

              {/* Landmark */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Landmark (Optional)</Text>
                <TextInput
                  style={styles.modalInput}
                  value={landmark}
                  onChangeText={setLandmark}
                  placeholder="e.g. Near Metro Station / Govt Hospital"
                  placeholderTextColor={Colors.disabled}
                />
              </View>

              {/* City & Pincode Row */}
              <View style={styles.rowInputs}>
                <View style={[styles.inputGroup, { flex: 1.2, marginRight: 10 }]}>
                  <Text style={styles.inputLabel}>City</Text>
                  <TextInput
                    style={[styles.modalInput, errors.city && styles.inputError]}
                    value={city}
                    onChangeText={setCity}
                    placeholder="e.g. Kottayam"
                    placeholderTextColor={Colors.disabled}
                  />
                  {errors.city && <Text style={styles.errorText}>{errors.city}</Text>}
                </View>

                <View style={[styles.inputGroup, { flex: 0.9 }]}>
                  <Text style={styles.inputLabel}>Pincode</Text>
                  <TextInput
                    style={[styles.modalInput, errors.pincode && styles.inputError]}
                    value={pincode}
                    onChangeText={setPincode}
                    placeholder="e.g. 686001"
                    placeholderTextColor={Colors.disabled}
                    keyboardType="number-pad"
                    maxLength={6}
                  />
                  {errors.pincode && <Text style={styles.errorText}>{errors.pincode}</Text>}
                </View>
              </View>

              {/* Set as Default Toggle */}
              <View style={styles.defaultToggleRow}>
                <View style={{ flex: 1, paddingRight: 10 }}>
                  <Text style={styles.defaultToggleTitle}>Set as Default Address</Text>
                  <Text style={styles.defaultToggleSubtitle}>
                    Use this address automatically for bookings and checkout
                  </Text>
                </View>
                <Switch
                  value={isDefault}
                  onValueChange={setIsDefault}
                  trackColor={{ false: '#CBD5E1', true: '#93C5FD' }}
                  thumbColor={isDefault ? Colors.primary : '#FFFFFF'}
                />
              </View>

              {/* Save Button */}
              <TouchableOpacity style={styles.modalSaveBtn} onPress={handleSaveAddress}>
                <Text style={styles.modalSaveBtnText}>
                  {editingAddressId ? 'Update Address' : 'Save Address'}
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
        </>
      )}
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backButton: {
    padding: Spacing.xs,
  },
  headerTitle: {
    ...Typography.heading2,
    fontSize: 18,
    color: Colors.textPrimary,
  },
  headerAddBtn: {
    padding: Spacing.xs,
  },
  scrollContent: {
    padding: Spacing.md,
    paddingBottom: Spacing.xxl,
  },
  addNewCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    borderRadius: Radii.card,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: '#BFDBFE',
    ...Shadows.subtle,
  },
  addNewIcon: {
    marginRight: Spacing.md,
  },
  addNewTitle: {
    ...Typography.bodyBold,
    fontSize: 15,
    color: Colors.primary,
  },
  addNewSubtitle: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  sectionHeading: {
    ...Typography.captionBold,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xxl,
    backgroundColor: Colors.white,
    borderRadius: Radii.card,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.subtle,
  },
  emptyTitle: {
    ...Typography.bodyBold,
    fontSize: 16,
    color: Colors.textPrimary,
    marginTop: Spacing.md,
  },
  emptySubtitle: {
    ...Typography.caption,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 4,
    paddingHorizontal: Spacing.xl,
  },
  emptyBtn: {
    marginTop: Spacing.lg,
    backgroundColor: Colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: Radii.button,
  },
  emptyBtnText: {
    ...Typography.bodyBold,
    color: Colors.white,
    fontSize: 14,
  },
  addressCard: {
    backgroundColor: Colors.white,
    borderRadius: Radii.card,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.subtle,
  },
  addressCardDefault: {
    borderColor: Colors.primary,
    borderWidth: 1.5,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  typeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radii.xs,
  },
  typeText: {
    ...Typography.captionBold,
    color: Colors.primary,
    fontSize: 12,
  },
  defaultBadge: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: Radii.xs,
  },
  defaultText: {
    ...Typography.captionBold,
    color: '#15803D',
    fontSize: 10,
  },
  actionIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconBtn: {
    padding: 4,
  },
  addressLine: {
    ...Typography.bodyBold,
    fontSize: 15,
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  landmarkText: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  cityPincode: {
    ...Typography.body,
    fontSize: 14,
    color: Colors.textSecondary,
  },
  setDefaultBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.md,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  setDefaultText: {
    ...Typography.captionBold,
    color: Colors.primary,
    fontSize: 13,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalBg: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: Colors.overlay,
  },
  modalSheet: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: Radii.sheet,
    borderTopRightRadius: Radii.sheet,
    padding: Spacing.lg,
    maxHeight: '85%',
    ...Shadows.sheet,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  modalTitle: {
    ...Typography.heading2,
    fontSize: 18,
    color: Colors.textPrimary,
  },
  modalFormContent: {
    paddingBottom: Spacing.xl,
  },
  inputLabel: {
    ...Typography.captionBold,
    color: Colors.textPrimary,
    marginBottom: 6,
  },
  typeSelector: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: Spacing.md,
  },
  typeOption: {
    flex: 1,
    paddingVertical: 9,
    alignItems: 'center',
    borderRadius: Radii.control,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  typeOptionSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  typeOptionText: {
    ...Typography.bodyBold,
    fontSize: 13,
    color: Colors.textSecondary,
  },
  typeOptionTextSelected: {
    color: Colors.white,
  },
  inputGroup: {
    marginBottom: Spacing.md,
  },
  rowInputs: {
    flexDirection: 'row',
  },
  modalInput: {
    backgroundColor: '#F8FAFC',
    borderRadius: Radii.control,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.md,
    height: 48,
    fontSize: 14,
    color: Colors.textPrimary,
  },
  inputError: {
    borderColor: Colors.error,
  },
  errorText: {
    ...Typography.caption,
    color: Colors.error,
    fontSize: 11,
    marginTop: 3,
  },
  defaultToggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  defaultToggleTitle: {
    ...Typography.bodyBold,
    fontSize: 14,
    color: Colors.textPrimary,
  },
  defaultToggleSubtitle: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  modalSaveBtn: {
    backgroundColor: Colors.primary,
    borderRadius: Radii.button,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: Spacing.xs,
  },
  modalSaveBtnText: {
    ...Typography.button,
    color: Colors.white,
    fontSize: 15,
  },
});

export default AddressManagementScreen;