import React, { useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import ScreenContainer from '../../components/ScreenContainer';
import { useApp } from '../../context/AppContext';
import { apiPost } from '../../services/apiClient';
import Colors from '../../constants/colors';
import Typography from '../../constants/typography';
import Spacing from '../../constants/spacing';
import Radii from '../../constants/radii';
import Shadows from '../../constants/shadows';

const CATEGORIES = [
  'Plumber',
  'Electrician',
  'Tutor',
  'AC Repair',
  'Cleaning',
  'Carpentry',
  'Painter',
  'Appliance Repair'
];

const DURATIONS = [
  { label: '30 mins', value: 30 },
  { label: '45 mins', value: 45 },
  { label: '60 mins', value: 60 },
  { label: '90 mins', value: 90 },
  { label: '2 hours', value: 120 }
];

export default function ProviderServiceFormScreen() {
  const navigation = useNavigation();
  const { user } = useApp();

  const [title, setTitle] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Plumber');
  const [subcategory, setSubcategory] = useState('Leakage & Fittings');
  const [duration, setDuration] = useState(60);
  const [basePrice, setBasePrice] = useState('499');
  const [description, setDescription] = useState('');
  const [standardTierPrice, setStandardTierPrice] = useState('499');
  const [premiumTierPrice, setPremiumTierPrice] = useState('999');
  const [coverageCity, setCoverageCity] = useState('Mumbai');
  const [coverageArea, setCoverageArea] = useState('Andheri, Bandra, Juhu, Powai');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handlePublish = async () => {
    if (!title.trim()) {
      Alert.alert('Missing Title', 'Please enter a descriptive service package title.');
      return;
    }
    if (!basePrice || isNaN(Number(basePrice))) {
      Alert.alert('Invalid Price', 'Please enter a valid base price in ₹.');
      return;
    }

    setIsSubmitting(true);

    try {
      await apiPost('/service/create', {
        title: title.trim(),
        name: title.trim(),
        category: selectedCategory,
        serviceCategory: selectedCategory,
        subcategory: subcategory.trim(),
        basePrice: Number(basePrice),
        price: Number(basePrice),
        description: description.trim() || `${title.trim()} professional service`,
        duration,
        timeEstimate: `${duration} mins`,
        location: coverageCity.trim() || 'Indore',
        serviceAreas: coverageArea.split(',').map((s) => s.trim()).filter(Boolean),
        providerId: user?._id || user?.id,
        providerName: user?.fullName || user?.name || 'Certified Partner',
        packages: [
          {
            name: 'Standard Visit',
            price: Number(standardTierPrice) || Number(basePrice),
            duration: `${duration} mins`,
            description: 'Inspection + minor adjustments'
          },
          {
            name: 'Deep / Comprehensive Fix',
            price: Number(premiumTierPrice) || Number(basePrice) * 2,
            duration: `${duration + 30} mins`,
            description: 'Full dismantling & heavy parts replacement',
            isPopular: true
          }
        ]
      });

      setIsSubmitting(false);
      Alert.alert(
        'Service Package Published',
        `"${title}" is now active in your service catalog. Customers in ${coverageCity} can book this package immediately.`,
        [
          {
            text: 'Return to Dashboard',
            onPress: () => navigation.goBack()
          }
        ]
      );
    } catch (err) {
      setIsSubmitting(false);
      Alert.alert('Publish Error', err.message || 'Unable to publish service package right now.');
    }
  };

  return (
    <ScreenContainer noPadding style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
          accessibilityLabel="Go back"
        >
          <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add Service Package</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Basic Details */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>1. Service Offering Details</Text>

          <Text style={styles.label}>Service Package Title *</Text>
          <TextInput
            style={styles.input}
            value={title}
            onChangeText={setTitle}
            placeholder="e.g. Bathroom Leakage & Valve Repair"
            placeholderTextColor={Colors.disabled}
          />

          <Text style={styles.label}>Trade Category</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
            {CATEGORIES.map(cat => {
              const isSelected = selectedCategory === cat;
              return (
                <TouchableOpacity
                  key={cat}
                  style={[styles.catChip, isSelected && styles.catChipActive]}
                  onPress={() => setSelectedCategory(cat)}
                >
                  <Text style={[styles.catChipText, isSelected && styles.catChipTextActive]}>
                    {cat}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          <Text style={styles.label}>Subcategory / Specialty</Text>
          <TextInput
            style={styles.input}
            value={subcategory}
            onChangeText={setSubcategory}
            placeholder="e.g. Tap Repair, Pipe Concealing, MCB Wiring"
            placeholderTextColor={Colors.disabled}
          />

          <Text style={styles.label}>Description of Work & What is Included</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={description}
            onChangeText={setDescription}
            placeholder="Detail what is covered during the visit (e.g. 1-hour inspection, basic sealing, testing water flow)..."
            placeholderTextColor={Colors.disabled}
            multiline
            numberOfLines={3}
          />
        </View>

        {/* Pricing & Duration */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>2. Pricing & Estimated Time</Text>

          <Text style={styles.label}>Estimated Job Duration</Text>
          <View style={styles.durationRow}>
            {DURATIONS.map(d => {
              const isSelected = duration === d.value;
              return (
                <TouchableOpacity
                  key={d.value}
                  style={[styles.durationChip, isSelected && styles.durationChipActive]}
                  onPress={() => setDuration(d.value)}
                >
                  <Text style={[styles.durationText, isSelected && styles.durationTextActive]}>
                    {d.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <Text style={styles.label}>Base Visiting Rate (₹) *</Text>
          <View style={styles.priceInputWrapper}>
            <Text style={styles.currencyPrefix}>₹</Text>
            <TextInput
              style={styles.priceInput}
              value={basePrice}
              onChangeText={setBasePrice}
              keyboardType="numeric"
              placeholder="499"
              placeholderTextColor={Colors.disabled}
            />
          </View>

          <Text style={[styles.label, { marginTop: 14 }]}>Multi-Tier Packages (Optional)</Text>
          <View style={styles.tierContainer}>
            <View style={styles.tierRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.tierName}>Standard Visit</Text>
                <Text style={styles.tierDesc}>Inspection + minor adjustments</Text>
              </View>
              <TextInput
                style={styles.tierPriceInput}
                value={standardTierPrice}
                onChangeText={setStandardTierPrice}
                keyboardType="numeric"
                placeholder="499"
              />
            </View>

            <View style={[styles.tierRow, { borderTopWidth: 1, borderTopColor: Colors.hairline }]}>
              <View style={{ flex: 1 }}>
                <Text style={styles.tierName}>Deep / Comprehensive Fix</Text>
                <Text style={styles.tierDesc}>Full dismantling & heavy parts replacement</Text>
              </View>
              <TextInput
                style={styles.tierPriceInput}
                value={premiumTierPrice}
                onChangeText={setPremiumTierPrice}
                keyboardType="numeric"
                placeholder="999"
              />
            </View>
          </View>
        </View>

        {/* Coverage Location */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>3. Service Coverage</Text>

          <Text style={styles.label}>City</Text>
          <TextInput
            style={styles.input}
            value={coverageCity}
            onChangeText={setCoverageCity}
            placeholder="e.g. Mumbai"
            placeholderTextColor={Colors.disabled}
          />

          <Text style={styles.label}>Target Areas / Localities</Text>
          <TextInput
            style={styles.input}
            value={coverageArea}
            onChangeText={setCoverageArea}
            placeholder="e.g. Andheri East, Andheri West, Bandra"
            placeholderTextColor={Colors.disabled}
          />
        </View>

        {/* Submit */}
        <TouchableOpacity
          style={[styles.publishBtn, isSubmitting && { opacity: 0.7 }]}
          onPress={handlePublish}
          disabled={isSubmitting}
          activeOpacity={0.8}
        >
          <Ionicons name="checkmark-done" size={20} color={Colors.card} style={{ marginRight: 8 }} />
          <Text style={styles.publishBtnText}>
            {isSubmitting ? 'Publishing Package...' : 'Publish Service Offering'}
          </Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </ScreenContainer>
  );
}

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
    backgroundColor: Colors.card,
    borderBottomWidth: 1,
    borderBottomColor: Colors.hairline
  },
  backButton: {
    padding: 6,
    borderRadius: Radii.xs
  },
  headerTitle: {
    ...Typography.screenTitle,
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary
  },
  scrollContent: {
    padding: Spacing.md
  },
  card: {
    backgroundColor: Colors.card,
    borderRadius: Radii.card,
    padding: 16,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.hairline,
    ...Shadows.card
  },
  cardTitle: {
    ...Typography.sectionHeader,
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 12
  },
  label: {
    ...Typography.captionBold,
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 6,
    marginTop: 8
  },
  input: {
    backgroundColor: Colors.sunken,
    borderWidth: 1,
    borderColor: Colors.hairline,
    borderRadius: Radii.control,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: Colors.textPrimary
  },
  textArea: {
    height: 75,
    textAlignVertical: 'top'
  },
  categoryScroll: {
    flexDirection: 'row',
    marginBottom: 6
  },
  catChip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: Radii.pill,
    backgroundColor: Colors.sunken,
    marginRight: 8,
    borderWidth: 1,
    borderColor: Colors.hairline
  },
  catChipActive: {
    backgroundColor: Colors.card,
    borderColor: Colors.navy
  },
  catChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary
  },
  catChipTextActive: {
    color: Colors.navy
  },
  durationRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 6
  },
  durationChip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: Radii.xs,
    backgroundColor: Colors.sunken,
    borderWidth: 1,
    borderColor: Colors.hairline
  },
  durationChipActive: {
    backgroundColor: Colors.navy,
    borderColor: Colors.navy
  },
  durationText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary
  },
  durationTextActive: {
    color: Colors.card
  },
  priceInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.sunken,
    borderWidth: 1,
    borderColor: Colors.hairline,
    borderRadius: Radii.control,
    paddingHorizontal: 14
  },
  currencyPrefix: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginRight: 6
  },
  priceInput: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
    paddingVertical: 10
  },
  tierContainer: {
    backgroundColor: Colors.sunken,
    borderRadius: Radii.control,
    borderWidth: 1,
    borderColor: Colors.hairline,
    overflow: 'hidden'
  },
  tierRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12
  },
  tierName: {
    ...Typography.bodyBold,
    fontSize: 13,
    color: Colors.textPrimary
  },
  tierDesc: {
    ...Typography.micro,
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2
  },
  tierPriceInput: {
    width: 80,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.hairline,
    borderRadius: Radii.xs,
    paddingHorizontal: 10,
    paddingVertical: 6,
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
    textAlign: 'center'
  },
  publishBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.terracotta,
    paddingVertical: 14,
    borderRadius: Radii.button,
    ...Shadows.subtle,
    marginTop: 6
  },
  publishBtnText: {
    ...Typography.bodyBold,
    color: Colors.card,
    fontSize: 15,
    fontWeight: '700'
  }
});
