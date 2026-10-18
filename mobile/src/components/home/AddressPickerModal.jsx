import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useApp } from '../../context/AppContext';
import Colors from '../../constants/colors';
import Typography from '../../constants/typography';
import Spacing from '../../constants/spacing';
import Radii from '../../constants/radii';

export const AddressPickerModal = ({ visible, onClose }) => {
  const { addresses = [], activeAddress, setActiveAddress } = useApp();
  const navigation = useNavigation();

  const handleSelect = (addr) => {
    setActiveAddress(addr);
    onClose();
  };

  const handleManage = () => {
    onClose();
    navigation.navigate('AddressManagement');
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.sheetContainer}>
              {/* Drag Handle */}
              <View style={styles.handle} />

              {/* Title Row */}
              <View style={styles.headerRow}>
                <View>
                  <Text style={styles.title}>Select Service Location</Text>
                  <Text style={styles.subtitle}>Choose where you need services delivered</Text>
                </View>
                <TouchableOpacity onPress={onClose} style={styles.closeBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                  <Ionicons name="close" size={22} color={Colors.textSecondary} />
                </TouchableOpacity>
              </View>

              {/* Address List */}
              <ScrollView style={styles.list}>
                {addresses.map((item) => {
                  const isSelected = activeAddress?.id === item.id;
                  const iconName =
                    item.type === 'Home'
                      ? 'home-outline'
                      : item.type === 'Office'
                      ? 'briefcase-outline'
                      : 'location-outline';

                  return (
                    <TouchableOpacity
                      key={item.id}
                      style={[styles.addressCard, isSelected && styles.selectedCard]}
                      onPress={() => handleSelect(item)}
                      activeOpacity={0.8}>
                      <View style={[styles.iconBox, isSelected && styles.selectedIconBox]}>
                        <Ionicons
                          name={iconName}
                          size={18}
                          color={isSelected ? Colors.navy : Colors.textSecondary}
                        />
                      </View>

                      <View style={styles.addressInfo}>
                        <View style={styles.typeBadgeRow}>
                          <Text style={styles.addressType}>{item.type}</Text>
                          {item.isDefault && (
                            <View style={styles.defaultBadge}>
                              <Text style={styles.defaultBadgeText}>DEFAULT</Text>
                            </View>
                          )}
                        </View>
                        <Text style={styles.addressText} numberOfLines={2}>
                          {item.houseNo}, {item.street}, {item.city} - {item.pincode}
                        </Text>
                      </View>

                      <View style={styles.radioBox}>
                        <Ionicons
                          name={isSelected ? 'radio-button-on' : 'radio-button-off'}
                          size={20}
                          color={isSelected ? Colors.terracotta : Colors.disabled}
                        />
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>

              {/* Bottom Actions */}
              <TouchableOpacity style={styles.manageButton} onPress={handleManage} activeOpacity={0.8}>
                <Ionicons name="add-circle-outline" size={18} color={Colors.terracotta} />
                <Text style={styles.manageButtonText}>Add or Manage Addresses</Text>
              </TouchableOpacity>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(28, 25, 23, 0.55)',
    justifyContent: 'flex-end'
  },
  sheetContainer: {
    backgroundColor: Colors.card,
    borderTopLeftRadius: Radii.sheet,
    borderTopRightRadius: Radii.sheet,
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.xl,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.hairline,
    maxHeight: '65%'
  },
  handle: {
    width: 36,
    height: 4,
    backgroundColor: Colors.hairline,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: Spacing.sm
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
    paddingBottom: Spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: Colors.hairline
  },
  title: {
    ...Typography.heading3,
    color: Colors.textPrimary,
    fontWeight: '600'
  },
  subtitle: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginTop: 2
  },
  closeBtn: {
    padding: Spacing.xs
  },
  list: {
    marginBottom: Spacing.md
  },
  addressCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: Radii.control,
    borderWidth: 1,
    borderColor: Colors.hairline,
    backgroundColor: Colors.card,
    marginBottom: Spacing.sm
  },
  selectedCard: {
    borderColor: Colors.navy,
    backgroundColor: Colors.sunken
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.sunken,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.hairline
  },
  selectedIconBox: {
    backgroundColor: Colors.card
  },
  addressInfo: {
    flex: 1
  },
  typeBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2
  },
  addressType: {
    ...Typography.bodyBold,
    color: Colors.textPrimary,
    marginRight: Spacing.xs,
    fontSize: 13
  },
  defaultBadge: {
    backgroundColor: Colors.sunken,
    borderWidth: 1,
    borderColor: Colors.hairline,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: Radii.xs
  },
  defaultBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: Colors.emerald,
    letterSpacing: 0.3
  },
  addressText: {
    ...Typography.caption,
    color: Colors.textSecondary,
    lineHeight: 16
  },
  radioBox: {
    marginLeft: Spacing.sm
  },
  manageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: Radii.button,
    borderWidth: 1,
    borderColor: Colors.hairline,
    backgroundColor: Colors.card
  },
  manageButtonText: {
    ...Typography.bodyBold,
    color: Colors.terracotta,
    fontSize: 13,
    marginLeft: Spacing.xs
  }
});

export default AddressPickerModal;