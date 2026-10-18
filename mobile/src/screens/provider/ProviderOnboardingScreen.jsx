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

const PROFESSIONS = [
  { id: 'Plumber', name: 'Plumber', icon: 'water-outline', desc: 'Pipes, leakage, bath fittings' },
  { id: 'Electrician', name: 'Electrician', icon: 'flash-outline', desc: 'Wiring, MCBs, appliances' },
  { id: 'Tutor', name: 'Tutor', icon: 'school-outline', desc: 'School, languages, exam prep' },
  { id: 'AC Repair', name: 'AC Repair', icon: 'snow-outline', desc: 'Cooling, gas refill, servicing' },
  { id: 'Cleaning', name: 'Cleaning', icon: 'sparkles-outline', desc: 'Deep home, sofa, kitchen scrub' },
  { id: 'Carpentry', name: 'Carpentry', icon: 'hammer-outline', desc: 'Furniture repair, hinges, doors' },
  { id: 'Painter', name: 'Painter', icon: 'color-palette-outline', desc: 'Interior, exterior, waterproofing' },
  { id: 'Appliance Repair', name: 'Appliance Repair', icon: 'construct-outline', desc: 'Fridge, washing machine, oven' }
];

const EXPERIENCE_OPTIONS = [
  { label: '1 - 2 Years', value: 2 },
  { label: '3 - 5 Years', value: 4 },
  { label: '6 - 9 Years', value: 7 },
  { label: '10+ Years', value: 12 }
];

const METRO_CITIES = ['Mumbai', 'Delhi', 'Bengaluru', 'Pune', 'Chennai', 'Hyderabad', 'Kolkata'];

const RATE_PRESETS = [299, 399, 499, 699, 999];

export default function ProviderOnboardingScreen() {
  const navigation = useNavigation();
  const { user, updateUser } = useApp();

  const [category, setCategory] = useState(PROFESSIONS[0].name);
  const [experience, setExperience] = useState(2);
  const [selectedCity, setSelectedCity] = useState(user?.city || METRO_CITIES[0]);
  const [areaInput, setAreaInput] = useState('');
  const [hourlyRate, setHourlyRate] = useState('');
  const [bio, setBio] = useState('');
  const [payoutUpi, setPayoutUpi] = useState('');

  const handleProceedToKYC = async () => {
    if (!selectedCity) {
      Alert.alert('City Required', 'Please select your operating city.');
      return;
    }
    if (!areaInput.trim()) {
      Alert.alert('Service Areas Required', 'Please enter the localities or pin codes you service.');
      return;
    }
    if (!hourlyRate || isNaN(Number(hourlyRate)) || Number(hourlyRate) <= 0) {
      Alert.alert('Invalid Rate', 'Please enter a valid base visiting rate in ₹.');
      return;
    }
    if (!payoutUpi.trim()) {
      Alert.alert('UPI ID Required', 'Please provide a valid UPI ID (e.g. name@okhdfcbank) for direct bank disbursements.');
      return;
    }

    const providerProfile = {
      isProvider: true,
      category,
      experienceYears: experience,
      city: selectedCity,
      serviceAreas: areaInput.split(',').map(s => s.trim()).filter(Boolean),
      hourlyRate: Number(hourlyRate),
      bio: bio.trim() || `Certified ${category} professional with ${experience} years experience in ${selectedCity}.`,
      payoutUpi: payoutUpi.trim(),
      isOnline: true,
      kycStatus: 'pending_verification'
    };

    try {
      await Promise.all([
        apiPost('/api/v1/providers/profile', {
          userId: user?._id || user?.id,
          businessName: user?.fullName || user?.name || `${category} Specialist`,
          category,
          experienceYears: experience,
          city: selectedCity,
          serviceAreas: providerProfile.serviceAreas,
          bio: providerProfile.bio,
          isAvailable: true
        }).catch(() => null),
        apiPost('/api/enquiries', {
          name: user?.fullName || user?.name || 'Service Partner Applicant',
          email: user?.email || 'partner@bigbazaar.com',
          phone: user?.phoneNumber || user?.phone || '+91 98260 12345',
          subject: `Partner Onboarding: ${category} (${selectedCity})`,
          type: 'partner_onboarding',
          city: selectedCity,
          message: `${category} partner application with ${experience} yrs experience in ${selectedCity} (${areaInput.trim()}). Base rate: ₹${hourlyRate}. UPI: ${payoutUpi.trim()}`
        }).catch(() => null)
      ]);
    } catch (e) {}

    // Update global app state
    updateUser({
      ...user,
      role: 'Provider',
      providerProfile
    });

    // Navigate to KYC screen with the provider details
    navigation.navigate('ProviderKYC', { providerProfile });
  };

  return (
    <ScreenContainer noPadding style={styles.container}>
      {/* Top Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
          accessibilityLabel="Go back"
        >
          <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Become a Service Partner</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Banner Card */}
        <View style={styles.bannerCard}>
          <View style={styles.bannerIconContainer}>
            <Ionicons name="briefcase" size={28} color="#FFFFFF" />
          </View>
          <View style={{ flex: 1, marginLeft: 14 }}>
            <Text style={styles.bannerHeading}>Join 15,000+ Certified Pros</Text>
            <Text style={styles.bannerSubtitle}>
              Get direct customer bookings, set your own service rates, and receive fast UPI payouts.
            </Text>
          </View>
        </View>

        {/* Step 1: Select Category */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>1. Choose Your Primary Trade</Text>
          <Text style={styles.sectionSubtitle}>Select the service category that matches your expertise</Text>

          <View style={styles.gridContainer}>
            {PROFESSIONS.map((item) => {
              const isSelected = category === item.id;
              return (
                <TouchableOpacity
                  key={item.id}
                  style={[styles.professionCard, isSelected && styles.professionCardActive]}
                  onPress={() => setCategory(item.id)}
                  activeOpacity={0.7}
                >
                  <View style={[styles.iconCircle, isSelected && styles.iconCircleActive]}>
                    <Ionicons
                      name={item.icon}
                      size={22}
                      color={isSelected ? Colors.white : Colors.brandBlue}
                    />
                  </View>
                  <Text style={[styles.professionName, isSelected && styles.professionNameActive]}>
                    {item.name}
                  </Text>
                  <Text style={styles.professionDesc} numberOfLines={2}>
                    {item.desc}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Step 2: Experience */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>2. Years of Hands-on Experience</Text>
          <View style={styles.pillRow}>
            {EXPERIENCE_OPTIONS.map((opt) => {
              const isSelected = experience === opt.value;
              return (
                <TouchableOpacity
                  key={opt.value}
                  style={[styles.experiencePill, isSelected && styles.experiencePillActive]}
                  onPress={() => setExperience(opt.value)}
                >
                  <Text style={[styles.pillText, isSelected && styles.pillTextActive]}>
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Step 3: Location Coverage */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>3. Operating City & Local Areas</Text>
          <Text style={styles.sectionSubtitle}>Where do you want to accept service jobs?</Text>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.cityScroll}>
            {METRO_CITIES.map((city) => {
              const isSelected = selectedCity === city;
              return (
                <TouchableOpacity
                  key={city}
                  style={[styles.cityChip, isSelected && styles.cityChipActive]}
                  onPress={() => setSelectedCity(city)}
                >
                  <Text style={[styles.cityChipText, isSelected && styles.cityChipTextActive]}>
                    {city}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          <Text style={styles.inputLabel}>Neighborhoods / Service Hubs (comma-separated)</Text>
          <TextInput
            style={styles.textInput}
            value={areaInput}
            onChangeText={setAreaInput}
            placeholder="e.g. Andheri, Bandra, Powai, Malad"
            placeholderTextColor={Colors.disabled}
          />
        </View>

        {/* Step 4: Visiting Fee & Payout */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>4. Visiting Inspection Rate & Payout</Text>
          <Text style={styles.sectionSubtitle}>Base amount customers pay for arrival & assessment</Text>

          <View style={styles.ratePresetsRow}>
            {RATE_PRESETS.map((rate) => {
              const isSelected = hourlyRate === String(rate);
              return (
                <TouchableOpacity
                  key={rate}
                  style={[styles.ratePresetBtn, isSelected && styles.ratePresetBtnActive]}
                  onPress={() => setHourlyRate(String(rate))}
                >
                  <Text style={[styles.ratePresetText, isSelected && styles.ratePresetTextActive]}>
                    ₹{rate}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={styles.customRateContainer}>
            <Text style={styles.currencyPrefix}>₹</Text>
            <TextInput
              style={styles.rateInput}
              keyboardType="numeric"
              value={hourlyRate}
              onChangeText={setHourlyRate}
              placeholder="499"
              placeholderTextColor={Colors.disabled}
            />
            <Text style={styles.rateUnit}>/ visit</Text>
          </View>

          <Text style={[styles.inputLabel, { marginTop: 14 }]}>Payout UPI ID (Instant Bank Settlement)</Text>
          <TextInput
            style={styles.textInput}
            value={payoutUpi}
            onChangeText={setPayoutUpi}
            placeholder="e.g. yourname@okhdfcbank or yourphone@upi"
            placeholderTextColor={Colors.disabled}
            autoCapitalize="none"
          />
        </View>

        {/* Step 5: Professional Bio */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>5. Short Bio / Qualifications</Text>
          <TextInput
            style={[styles.textInput, styles.textArea]}
            value={bio}
            onChangeText={setBio}
            placeholder="e.g. Govt ITI certified, 6 years experience in residential pipe fittings & leakage repairs..."
            placeholderTextColor={Colors.disabled}
            multiline
            numberOfLines={3}
          />
        </View>

        {/* Bottom CTA */}
        <View style={styles.actionContainer}>
          <TouchableOpacity
            style={styles.submitBtn}
            onPress={handleProceedToKYC}
            activeOpacity={0.8}
          >
            <Text style={styles.submitBtnText}>Continue to ID & KYC Verification</Text>
            <Ionicons name="arrow-forward" size={18} color={Colors.card} style={{ marginLeft: 8 }} />
          </TouchableOpacity>
          <Text style={styles.securityNote}>
            Your personal information is encrypted and never shared publicly.
          </Text>
        </View>

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
    borderRadius: 8
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
  bannerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.navy,
    borderRadius: Radii.card,
    padding: 16,
    marginBottom: Spacing.lg,
    ...Shadows.card
  },
  bannerIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(251,251,250,0.15)',
    alignItems: 'center',
    justifyContent: 'center'
  },
  bannerHeading: {
    ...Typography.bodyBold,
    color: Colors.card,
    fontSize: 16,
    marginBottom: 4
  },
  bannerSubtitle: {
    ...Typography.secondary,
    color: Colors.sunken,
    fontSize: 12,
    lineHeight: 16
  },
  section: {
    backgroundColor: Colors.card,
    borderRadius: Radii.card,
    padding: 16,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.hairline,
    ...Shadows.card
  },
  sectionTitle: {
    ...Typography.sectionHeader,
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 4
  },
  sectionSubtitle: {
    ...Typography.secondary,
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 12
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 6
  },
  professionCard: {
    width: '48%',
    backgroundColor: Colors.sunken,
    borderRadius: Radii.control,
    padding: 12,
    borderWidth: 1.5,
    borderColor: Colors.hairline
  },
  professionCardActive: {
    borderColor: Colors.navy,
    backgroundColor: Colors.card
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Colors.sunken,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8
  },
  iconCircleActive: {
    backgroundColor: Colors.navy
  },
  professionName: {
    ...Typography.bodyBold,
    fontSize: 13,
    color: Colors.textPrimary,
    marginBottom: 2
  },
  professionNameActive: {
    color: Colors.navy
  },
  professionDesc: {
    ...Typography.micro,
    fontSize: 11,
    color: Colors.textSecondary,
    lineHeight: 14
  },
  pillRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 6
  },
  experiencePill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: Radii.pill,
    backgroundColor: Colors.sunken,
    borderWidth: 1,
    borderColor: Colors.hairline
  },
  experiencePillActive: {
    backgroundColor: Colors.navy,
    borderColor: Colors.navy
  },
  pillText: {
    ...Typography.captionBold,
    fontSize: 12,
    color: Colors.textSecondary
  },
  pillTextActive: {
    color: Colors.card
  },
  cityScroll: {
    flexDirection: 'row',
    marginBottom: 12
  },
  cityChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: Radii.pill,
    backgroundColor: Colors.sunken,
    marginRight: 8,
    borderWidth: 1,
    borderColor: Colors.hairline
  },
  cityChipActive: {
    backgroundColor: Colors.card,
    borderColor: Colors.navy
  },
  cityChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary
  },
  cityChipTextActive: {
    color: Colors.navy
  },
  inputLabel: {
    ...Typography.captionBold,
    fontSize: 12,
    color: Colors.textPrimary,
    marginBottom: 6
  },
  textInput: {
    backgroundColor: Colors.sunken,
    borderWidth: 1,
    borderColor: Colors.hairline,
    borderRadius: Radii.control,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: Colors.textPrimary
  },
  textArea: {
    height: 75,
    textAlignVertical: 'top'
  },
  ratePresetsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12
  },
  ratePresetBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: Radii.xs,
    backgroundColor: Colors.sunken,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.hairline
  },
  ratePresetBtnActive: {
    backgroundColor: Colors.card,
    borderColor: Colors.emerald
  },
  ratePresetText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textSecondary
  },
  ratePresetTextActive: {
    color: Colors.emerald
  },
  customRateContainer: {
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
  rateInput: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
    paddingVertical: 10
  },
  rateUnit: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '500'
  },
  actionContainer: {
    marginTop: 8
  },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.terracotta,
    paddingVertical: 14,
    borderRadius: Radii.button,
    ...Shadows.subtle
  },
  submitBtnText: {
    ...Typography.bodyBold,
    color: Colors.card,
    fontSize: 15,
    fontWeight: '700'
  },
  securityNote: {
    ...Typography.micro,
    textAlign: 'center',
    color: Colors.textSecondary,
    marginTop: 10
  }
});
