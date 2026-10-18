import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../../constants/colors';
import Typography from '../../constants/typography';
import Spacing from '../../constants/spacing';
import Radii from '../../constants/radii';

import { getProductCategoriesApi } from '../../services/categoryApi';

const DEFAULT_FILTER_CATEGORIES = ['All', 'Properties', 'Mobiles', 'Jobs', 'Bikes', 'Electronics', 'Furniture', 'Services'];

export default function FilterChipsBar({ categories = [], onFiltersChange }) {
  const [liveCategories, setLiveCategories] = useState([]);

  useEffect(() => {
    if (!categories || categories.length === 0) {
      getProductCategoriesApi().then(cats => {
        if (Array.isArray(cats) && cats.length > 0) setLiveCategories(cats);
      }).catch(() => {});
    }
  }, [categories]);

  const categoryOptions = React.useMemo(() => {
    const source = (categories && categories.length > 0) ? categories : liveCategories;
    if (Array.isArray(source) && source.length > 0) {
      const names = source
        .filter(c => c.isActive !== false && c.status !== 'Inactive')
        .map(c => c.name || c.title)
        .filter(Boolean);
      return ['All', ...names];
    }
    return DEFAULT_FILTER_CATEGORIES;
  }, [categories, liveCategories]);

  const filtersConfig = {
    Location: ['All Indore', 'Vijay Nagar', 'Palasia', 'Bhawarkua', 'Rajwada', 'Rau'],
    Sort: ['Fresh First', 'Price: Low to High', 'Price: High to Low', 'Top Rated'],
    Categories: categoryOptions,
    Verification: ['All Sellers', 'KYC Verified Only', 'Top Rated Sellers']
  };

  const [activeFilter, setActiveFilter] = useState(null);
  const [values, setValues] = useState({
    Location: 'All Indore',
    Sort: 'Fresh First',
    Categories: 'All',
    Verification: 'All Sellers',
    'Verified Only': false
  });

  const choose = (value) => {
    const next = { ...values, [activeFilter]: value };
    setValues(next);
    setActiveFilter(null);
    onFiltersChange?.(next);
  };

  const toggleVerified = () => {
    const next = { ...values, 'Verified Only': !values['Verified Only'] };
    setValues(next);
    onFiltersChange?.(next);
  };

  const chipLabel = (name) => {
    const value = values[name];
    if (value && !value.startsWith('All') && name !== 'Verified Only') {
      return name === 'Sort' ? value.replace('Price: ', '') : value;
    }
    return name;
  };

  const reset = () => {
    const next = {
      Location: 'All Indore',
      Sort: 'Fresh First',
      Categories: 'All',
      Verification: 'All Sellers',
      'Verified Only': false
    };
    setValues(next);
    onFiltersChange?.(next);
  };

  const hasFilters = Object.values(values).some((v) => v !== 'All' && v !== 'All Indore' && v !== 'All Sellers' && v !== 'Fresh First' && v !== false);

  return (
    <View style={styles.container}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {Object.keys(filtersConfig).map((name) => {
          const isActive = values[name] && !values[name].startsWith('All') && values[name] !== 'Fresh First';
          return (
            <TouchableOpacity
              key={name}
              style={[styles.chip, isActive && styles.chipActive]}
              onPress={() => setActiveFilter(name)}
              activeOpacity={0.8}
            >
              <Text style={[styles.chipText, isActive && styles.chipTextActive]} numberOfLines={1}>
                {chipLabel(name)}
              </Text>
              <Ionicons
                name={name === 'Sort' ? 'swap-vertical' : 'chevron-down'}
                size={13}
                color={isActive ? Colors.navy : Colors.textSecondary}
                style={styles.icon}
              />
            </TouchableOpacity>
          );
        })}

        <TouchableOpacity
          style={[styles.chip, values['Verified Only'] && styles.chipActive]}
          onPress={toggleVerified}
          activeOpacity={0.8}
        >
          <Ionicons
            name="shield-checkmark"
            size={13}
            color={values['Verified Only'] ? Colors.emerald : Colors.textSecondary}
            style={styles.leftIcon}
          />
          <Text style={[styles.chipText, values['Verified Only'] && styles.chipTextActive]}>
            Verified
          </Text>
        </TouchableOpacity>

        {hasFilters ? (
          <TouchableOpacity style={styles.clearChip} onPress={reset} activeOpacity={0.8}>
            <Ionicons name="close-circle" size={15} color={Colors.crimson} />
            <Text style={styles.clearText}>Clear</Text>
          </TouchableOpacity>
        ) : null}
      </ScrollView>

      <Modal visible={!!activeFilter} transparent animationType="slide" onRequestClose={() => setActiveFilter(null)}>
        <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={() => setActiveFilter(null)}>
          <View style={styles.sheet} onStartShouldSetResponder={() => true}>
            <View style={styles.handle} />
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>{activeFilter}</Text>
              <TouchableOpacity onPress={() => setActiveFilter(null)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Ionicons name="close" size={20} color={Colors.textSecondary} />
              </TouchableOpacity>
            </View>
            {(filtersConfig[activeFilter] || []).map((option) => (
              <TouchableOpacity key={option} style={styles.option} onPress={() => choose(option)}>
                <Text style={[styles.optionText, values[activeFilter] === option && styles.optionSelected]}>
                  {option}
                </Text>
                {values[activeFilter] === option && (
                  <Ionicons name="checkmark-circle" size={19} color={Colors.terracotta} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.canvas,
    borderBottomWidth: 1,
    borderBottomColor: Colors.hairline,
    zIndex: 9
  },
  scrollContent: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 8,
    alignItems: 'center'
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.hairline,
    borderRadius: Radii.chip,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginRight: 6,
    maxWidth: 160
  },
  chipActive: {
    backgroundColor: Colors.sunken,
    borderColor: Colors.navy
  },
  chipText: {
    ...Typography.captionBold,
    fontSize: 12,
    color: Colors.textSecondary
  },
  chipTextActive: {
    color: Colors.navy,
    fontWeight: '700'
  },
  icon: {
    marginLeft: 4
  },
  leftIcon: {
    marginRight: 4
  },
  clearChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 6
  },
  clearText: {
    ...Typography.captionBold,
    color: Colors.crimson,
    marginLeft: 3,
    fontSize: 12
  },
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(28, 25, 23, 0.55)'
  },
  sheet: {
    backgroundColor: Colors.card,
    borderTopLeftRadius: Radii.sheet,
    borderTopRightRadius: Radii.sheet,
    padding: Spacing.lg,
    paddingBottom: Spacing.xxl,
    borderTopWidth: 1,
    borderTopColor: Colors.hairline
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.hairline,
    alignSelf: 'center',
    marginBottom: Spacing.md
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm
  },
  sheetTitle: {
    ...Typography.heading3,
    color: Colors.textPrimary,
    fontWeight: '600',
    fontSize: 16
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.hairline
  },
  optionText: {
    ...Typography.body,
    fontSize: 14,
    color: Colors.textPrimary
  },
  optionSelected: {
    ...Typography.bodyBold,
    fontSize: 14,
    color: Colors.terracotta
  }
});
