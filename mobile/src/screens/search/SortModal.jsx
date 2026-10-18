import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../../constants/colors';
import Typography from '../../constants/typography';
import Spacing from '../../constants/spacing';

export const SORT_OPTIONS = [
  'Featured',
  'Price: Low to High',
  'Price: High to Low',
  'Newest first',
  'Top Rated'
];

export default function SortModal({
  visible,
  onClose,
  selectedSort = 'Featured',
  onSelectSort
}) {
  const handleSelect = (option) => {
    if (onSelectSort) {
      onSelectSort(option);
    }
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose} style={styles.iconBtn}>
              <Ionicons name="close" size={24} color={Colors.textSecondary} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Sort Products</Text>
            <View style={styles.placeholder} />
          </View>

          <ScrollView style={styles.content}>
            {SORT_OPTIONS.map((option, index) => {
              const isSelected = selectedSort === option;
              return (
                <TouchableOpacity
                  key={index}
                  style={styles.optionRow}
                  onPress={() => handleSelect(option)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.optionText, isSelected && styles.optionTextSelected]}>
                    {option}
                  </Text>
                  {isSelected ? (
                    <View style={styles.radioSelected}>
                      <View style={styles.radioInner} />
                    </View>
                  ) : (
                    <View style={styles.radioUnselected} />
                  )}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end'
  },
  modalContent: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: '60%'
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border
  },
  iconBtn: {
    padding: Spacing.xs
  },
  headerTitle: {
    ...Typography.heading2,
    fontSize: 18,
    color: Colors.textPrimary
  },
  placeholder: {
    width: 32
  },
  content: {
    flex: 1
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.hairline
  },
  optionText: {
    ...Typography.body,
    fontSize: 15,
    color: Colors.textPrimary
  },
  optionTextSelected: {
    fontWeight: '700',
    color: Colors.primary
  },
  radioSelected: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center'
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.primary
  },
  radioUnselected: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: Colors.border
  }
});