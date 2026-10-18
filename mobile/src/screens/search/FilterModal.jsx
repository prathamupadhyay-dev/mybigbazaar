import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Switch,
  ScrollView,
  TextInput
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../../constants/colors';
import Typography from '../../constants/typography';
import Spacing from '../../constants/spacing';

const CATEGORIES = [
  'All',
  'Electronics',
  'Fashion',
  'Furniture',
  'Bikes',
  'Books',
  'Appliances',
  'Sports',
  'Plumbing',
  'AC Repair'
];

const LOCATIONS = ['All', 'Indore', 'Bhopal', 'Jabalpur', 'Gwalior', 'Ujjain'];
const CONDITIONS = ['All', 'New', 'Like New', 'Good', 'Fair'];
const SORT_OPTIONS = ['Newest', 'Price: Low to High', 'Price: High to Low', 'Verified First'];

export default function FilterModal({
  visible,
  onClose,
  onOpenSort,
  initialFilters = {},
  onApplyFilters,
  onResetFilters
}) {
  const [minPrice, setMinPrice] = useState(
    initialFilters.minPrice !== undefined ? String(initialFilters.minPrice) : ''
  );
  const [maxPrice, setMaxPrice] = useState(
    initialFilters.maxPrice !== undefined ? String(initialFilters.maxPrice) : ''
  );
  const [selectedCategory, setSelectedCategory] = useState(initialFilters.category || 'All');
  const [selectedLocation, setSelectedLocation] = useState(initialFilters.location || 'All');
  const [selectedCondition, setSelectedCondition] = useState(initialFilters.condition || 'All');
  const [sortBy, setSortBy] = useState(initialFilters.sortBy || 'Newest');
  const [verifiedOnly, setVerifiedOnly] = useState(!!initialFilters.verifiedOnly);

  useEffect(() => {
    if (visible) {
      setMinPrice(initialFilters.minPrice !== undefined ? String(initialFilters.minPrice) : '');
      setMaxPrice(initialFilters.maxPrice !== undefined ? String(initialFilters.maxPrice) : '');
      setSelectedCategory(initialFilters.category || 'All');
      setSelectedLocation(initialFilters.location || 'All');
      setSelectedCondition(initialFilters.condition || 'All');
      setSortBy(initialFilters.sortBy || 'Newest');
      setVerifiedOnly(!!initialFilters.verifiedOnly);
    }
  }, [visible, initialFilters]);

  const handleApply = () => {
    const filters = {
      minPrice: minPrice ? Number(minPrice) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
      category: selectedCategory,
      location: selectedLocation,
      condition: selectedCondition,
      sortBy,
      verifiedOnly
    };
    if (onApplyFilters) {
      onApplyFilters(filters);
    }
    onClose();
  };

  const handleReset = () => {
    setMinPrice('');
    setMaxPrice('');
    setSelectedCategory('All');
    setSelectedLocation('All');
    setSelectedCondition('All');
    setSortBy('Newest');
    setVerifiedOnly(false);
    if (onResetFilters) {
      onResetFilters();
    }
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
            <Text style={styles.headerTitle}>Filter Products</Text>
            <TouchableOpacity onPress={handleReset}>
              <Text style={styles.headerRight}>Reset</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Sorting Options */}
            <View style={styles.section}>
              <View style={styles.sectionSubHeader}>
                <Text style={styles.sectionSubTitle}>Sort Listings By</Text>
              </View>
              <View style={styles.chipContainer}>
                {SORT_OPTIONS.map((opt, idx) => {
                  const isActive = sortBy === opt;
                  return (
                    <TouchableOpacity
                      key={idx}
                      style={[styles.chip, isActive && styles.chipActive]}
                      onPress={() => setSortBy(opt)}
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.chipText, isActive && styles.chipTextActive]}>
                        {opt}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Price Range */}
            <View style={styles.section}>
              <View style={styles.sectionSubHeader}>
                <Text style={styles.sectionSubTitle}>Price Range (₹)</Text>
              </View>
              <View style={styles.priceInputs}>
                <View style={styles.priceInputBox}>
                  <Text style={styles.priceInputLabel}>Min Price</Text>
                  <View style={styles.inputWrap}>
                    <Text style={styles.currencyPrefix}>₹</Text>
                    <TextInput
                      style={styles.inputField}
                      keyboardType="numeric"
                      placeholder="0"
                      placeholderTextColor={Colors.disabled}
                      value={minPrice}
                      onChangeText={setMinPrice}
                    />
                  </View>
                </View>
                <View style={styles.priceInputBox}>
                  <Text style={styles.priceInputLabel}>Max Price</Text>
                  <View style={styles.inputWrap}>
                    <Text style={styles.currencyPrefix}>₹</Text>
                    <TextInput
                      style={styles.inputField}
                      keyboardType="numeric"
                      placeholder="50,000+"
                      placeholderTextColor={Colors.disabled}
                      value={maxPrice}
                      onChangeText={setMaxPrice}
                    />
                  </View>
                </View>
              </View>

              {/* Price Quick Presets */}
              <View style={styles.presetContainer}>
                {[
                  { label: 'Under ₹1K', max: '1000' },
                  { label: '₹1K - ₹5K', min: '1000', max: '5000' },
                  { label: '₹5K - ₹20K', min: '5000', max: '20000' },
                  { label: '₹20K+', min: '20000', max: '' }
                ].map((p, idx) => (
                  <TouchableOpacity
                    key={idx}
                    style={styles.presetBtn}
                    onPress={() => {
                      setMinPrice(p.min || '');
                      setMaxPrice(p.max || '');
                    }}
                  >
                    <Text style={styles.presetText}>{p.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Categories */}
            <View style={styles.section}>
              <View style={styles.sectionSubHeader}>
                <Text style={styles.sectionSubTitle}>Categories</Text>
              </View>
              <View style={styles.chipContainer}>
                {CATEGORIES.map((cat, idx) => {
                  const isActive = selectedCategory === cat;
                  return (
                    <TouchableOpacity
                      key={idx}
                      style={[styles.chip, isActive && styles.chipActive]}
                      onPress={() => setSelectedCategory(cat)}
                    >
                      <Text style={[styles.chipText, isActive && styles.chipTextActive]}>
                        {cat}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Condition */}
            <View style={styles.section}>
              <View style={styles.sectionSubHeader}>
                <Text style={styles.sectionSubTitle}>Item Condition</Text>
              </View>
              <View style={styles.chipContainer}>
                {CONDITIONS.map((cond, idx) => {
                  const isActive = selectedCondition === cond;
                  return (
                    <TouchableOpacity
                      key={idx}
                      style={[styles.chip, isActive && styles.chipActive]}
                      onPress={() => setSelectedCondition(cond)}
                    >
                      <Text style={[styles.chipText, isActive && styles.chipTextActive]}>
                        {cond}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Location (Indore / Bhopal / Jabalpur / All) */}
            <View style={styles.section}>
              <View style={styles.sectionSubHeader}>
                <Text style={styles.sectionSubTitle}>City / Location</Text>
              </View>
              <View style={styles.chipContainer}>
                {LOCATIONS.map((loc, idx) => {
                  const isActive = selectedLocation === loc;
                  return (
                    <TouchableOpacity
                      key={idx}
                      style={[styles.chip, isActive && styles.chipActive]}
                      onPress={() => setSelectedLocation(loc)}
                    >
                      <Text style={[styles.chipText, isActive && styles.chipTextActive]}>
                        {loc}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Verified Sellers Toggle */}
            <View style={styles.toggleRow}>
              <View style={{ flex: 1, marginRight: Spacing.md }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Ionicons name="shield-checkmark" size={18} color={Colors.brandGreen} style={{ marginRight: 6 }} />
                  <Text style={styles.toggleTitle}>Verified Sellers Only</Text>
                </View>
                <Text style={styles.toggleSubtitle}>
                  Show only listings with 4.5+ star verified ratings
                </Text>
              </View>
              <Switch
                value={verifiedOnly}
                onValueChange={setVerifiedOnly}
                trackColor={{ false: Colors.hairline, true: Colors.brandGreen }}
                thumbColor="#FFFFFF"
              />
            </View>
          </ScrollView>

          {/* Footer */}
          <View style={styles.footer}>
            <TouchableOpacity style={styles.applyBtn} onPress={handleApply}>
              <Text style={styles.applyBtnText}>Apply Filters</Text>
            </TouchableOpacity>
          </View>
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
    height: '88%'
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
  headerRight: {
    ...Typography.bodyBold,
    color: Colors.primary,
    fontSize: 14
  },
  scrollContent: {
    flex: 1
  },
  section: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.hairline,
    paddingBottom: Spacing.md
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.hairline,
    backgroundColor: '#F8FAFC'
  },
  sectionTitle: {
    ...Typography.bodyBold,
    color: Colors.textPrimary,
    fontSize: 15
  },
  sectionSubHeader: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.xs
  },
  sectionSubTitle: {
    ...Typography.captionBold,
    color: Colors.textSecondary,
    fontSize: 12,
    textTransform: 'uppercase'
  },
  priceInputs: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    marginTop: Spacing.xs
  },
  priceInputBox: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.sm,
    marginHorizontal: Spacing.xs
  },
  priceInputLabel: {
    ...Typography.caption,
    color: Colors.textSecondary,
    fontSize: 11,
    marginBottom: 4
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  currencyPrefix: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginRight: 4
  },
  inputField: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
    padding: 0
  },
  presetContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: Spacing.lg,
    marginTop: Spacing.sm
  },
  presetBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
    marginRight: Spacing.xs,
    marginBottom: Spacing.xs
  },
  presetText: {
    ...Typography.caption,
    color: Colors.textSecondary,
    fontSize: 11
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: Spacing.lg,
    marginTop: Spacing.xs
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    marginRight: Spacing.sm,
    marginBottom: Spacing.sm
  },
  chipActive: {
    backgroundColor: Colors.primary
  },
  chipText: {
    ...Typography.body,
    fontSize: 13,
    color: Colors.textSecondary
  },
  chipTextActive: {
    color: Colors.white,
    fontWeight: '700'
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.hairline
  },
  toggleTitle: {
    ...Typography.bodyBold,
    color: Colors.textPrimary,
    fontSize: 14
  },
  toggleSubtitle: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginTop: 2
  },
  footer: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xl,
    borderTopWidth: 1,
    borderTopColor: Colors.border
  },
  applyBtn: {
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center'
  },
  applyBtnText: {
    ...Typography.button,
    color: Colors.white,
    fontSize: 16
  }
});
