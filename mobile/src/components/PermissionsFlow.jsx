import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Platform,
  ActivityIndicator,
  Dimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import Colors from '../constants/colors';
import { useApp } from '../context/AppContext';
import { updateNotificationPermissionApi } from '../services/homeApi';

const { width } = Dimensions.get('window');
const HAS_COMPLETED_PERMISSIONS_KEY = '@has_completed_permissions_flow';

const INDORE_LOCALITIES = [
  { name: 'Vijay Nagar', pincode: '452010', count: '1.2k' },
  { name: 'Palasia', pincode: '452001', count: '840' },
  { name: 'Bhawarkuan', pincode: '452014', count: '620' },
  { name: 'Super Corridor', pincode: '452005', count: '410' },
  { name: 'Rajwada', pincode: '452002', count: '530' },
  { name: 'Rau / Bypass', pincode: '453331', count: '390' }
];

const RADIUS_OPTIONS = [
  { km: 5, ads: '1,120', pros: '18' },
  { km: 10, ads: '2,350', pros: '32' },
  { km: 15, ads: '3,400', pros: '45', recommended: true },
  { km: 20, ads: '4,890', pros: '68' },
  { km: 30, ads: '6,920', pros: '94' }
];

export const PermissionsFlow = () => {
  const {
    setCurrentLocation,
    setLocationPermissionGranted,
    setNotificationPermissionGranted
  } = useApp();

  const [isVisible, setIsVisible] = useState(false);
  const [step, setStep] = useState(1); // 1: Location, 2: Notification
  const [loading, setLoading] = useState(false);
  const [selectedRadius, setSelectedRadius] = useState(15);
  const [selectedLocality, setSelectedLocality] = useState(INDORE_LOCALITIES[0]);

  useEffect(() => {
    checkFirstLoad();
  }, []);

  const checkFirstLoad = async () => {
    try {
      const hasCompleted = await AsyncStorage.getItem(HAS_COMPLETED_PERMISSIONS_KEY);
      if (hasCompleted !== 'true') {
        setIsVisible(true);
      }
    } catch (e) {
      console.log('[PermissionsFlow] Error reading permission status:', e);
    }
  };

  // Step 1: Request Real GPS Location Permission
  const handleAllowLocation = async () => {
    setLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      const isGranted = status === 'granted';
      setLocationPermissionGranted(isGranted);

      if (isGranted) {
        try {
          const position = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced
          });
          const reverse = await Location.reverseGeocodeAsync({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });

          if (reverse && reverse.length > 0) {
            const place = reverse[0];
            const street = place.street || place.name || place.subregion || selectedLocality.name;
            const city = place.city || place.district || 'Indore';
            const state = place.region || 'Madhya Pradesh';
            const pincode = place.postalCode || selectedLocality.pincode;
            const formatted = `${street}, ${city}, ${state} ${pincode}`;

            const detected = {
              address: formatted,
              city,
              state,
              pincode,
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              radiusKm: selectedRadius
            };
            setCurrentLocation(detected);
            await AsyncStorage.setItem('@current_location', JSON.stringify(detected));
          }
        } catch (posError) {
          console.log('[PermissionsFlow] Reverse geocoding error:', posError);
          fallbackIndoreLocation();
        }
      } else {
        fallbackIndoreLocation();
      }
    } catch (err) {
      console.log('[PermissionsFlow] Location permission request failed:', err);
      setLocationPermissionGranted(false);
      fallbackIndoreLocation();
    } finally {
      setLoading(false);
      setStep(2); // Proceed to Notification Step
    }
  };

  const fallbackIndoreLocation = () => {
    const loc = {
      address: `Plot 45, ${selectedLocality.name}, Indore, Madhya Pradesh ${selectedLocality.pincode}`,
      city: 'Indore',
      state: 'Madhya Pradesh',
      pincode: selectedLocality.pincode,
      latitude: 22.7533,
      longitude: 75.8937,
      radiusKm: selectedRadius
    };
    setCurrentLocation(loc);
    AsyncStorage.setItem('@current_location', JSON.stringify(loc)).catch(() => {});
  };

  const handleSkipLocation = () => {
    setLocationPermissionGranted(false);
    fallbackIndoreLocation();
    setStep(2); // Proceed to Notification Step
  };

  const handleSelectLocality = (loc) => {
    setSelectedLocality(loc);
    const updated = {
      address: `Plot 45, ${loc.name}, Indore, Madhya Pradesh ${loc.pincode}`,
      city: 'Indore',
      state: 'Madhya Pradesh',
      pincode: loc.pincode,
      latitude: 22.7533,
      longitude: 75.8937,
      radiusKm: selectedRadius
    };
    setCurrentLocation(updated);
    AsyncStorage.setItem('@current_location', JSON.stringify(updated)).catch(() => {});
  };

  // Step 2: Request Notification Permission
  const handleAllowNotification = async () => {
    setLoading(true);
    try {
      setNotificationPermissionGranted(true);
      await updateNotificationPermissionApi(true);
    } catch (err) {
      console.log('[PermissionsFlow] Notification permission error:', err);
    } finally {
      setLoading(false);
      await completeFlow();
    }
  };

  const handleSkipNotification = async () => {
    setNotificationPermissionGranted(false);
    await updateNotificationPermissionApi(false);
    await completeFlow();
  };

  const completeFlow = async () => {
    try {
      await AsyncStorage.setItem(HAS_COMPLETED_PERMISSIONS_KEY, 'true');
    } catch (e) {
      console.log('[PermissionsFlow] Failed to save completion state:', e);
    }
    setIsVisible(false);
  };

  if (!isVisible) {
    return null;
  }

  const activeRadiusMeta = RADIUS_OPTIONS.find((r) => r.km === selectedRadius) || RADIUS_OPTIONS[2];

  return (
    <Modal visible={isVisible} animationType="slide" transparent={false}>
      <SafeAreaView style={styles.safeArea}>
        {/* Navigation Step Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            {step === 2 && (
              <TouchableOpacity
                onPress={() => setStep(1)}
                style={styles.backBtn}
                accessibilityRole="button"
                accessibilityLabel="Back to location step">
                <Ionicons name="arrow-back" size={20} color="#FBFBFA" />
              </TouchableOpacity>
            )}
            <View>
              <View style={styles.stepBadgeRow}>
                <View style={styles.stepBadgeDot} />
                <Text style={styles.stepBadgeText}>
                  {step === 1 ? 'Step 1 of 2 • Set Discovery Location' : 'Step 2 of 2 • Real-Time Alerts'}
                </Text>
              </View>
              <Text style={styles.headerTitle}>MyBigBazaar</Text>
            </View>
          </View>

          <TouchableOpacity
            onPress={step === 1 ? handleSkipLocation : handleSkipNotification}
            style={styles.skipHeaderBtn}
            accessibilityRole="button"
            accessibilityLabel="Skip this step">
            <Text style={styles.skipHeaderText}>Skip for now</Text>
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* ========================================================= */}
          {/* STEP 1: DISCOVERY LOCATION & RADIUS (From Stitch Export) */}
          {/* ========================================================= */}
          {step === 1 && (
            <View style={styles.stepContent}>
              {/* Radar Map Graphic Simulation */}
              <View style={styles.mapGraphicSection}>
                <View style={styles.mapGridLines}>
                  <View style={styles.mapCircleOuter} />
                  <View style={styles.mapCircleMiddle} />
                  <View style={styles.mapCircleInner} />

                  {/* Landmark Badges */}
                  <View style={[styles.landmarkBadge, { top: 12, left: 16 }]}>
                    <View style={[styles.landmarkDot, { backgroundColor: '#15803D' }]} />
                    <Text style={styles.landmarkText}>Super Corridor</Text>
                  </View>
                  <View style={[styles.landmarkBadge, { top: 14, right: 16 }]}>
                    <Ionicons name="cart" size={10} color="#FBFBFA" style={{ marginRight: 3 }} />
                    <Text style={styles.landmarkText}>C21 Mall</Text>
                  </View>
                  <View style={[styles.landmarkBadge, { bottom: 12, left: 18 }]}>
                    <View style={[styles.landmarkDot, { backgroundColor: '#A8A29E' }]} />
                    <Text style={styles.landmarkText}>AB Road</Text>
                  </View>
                  <View style={[styles.landmarkBadge, { bottom: 12, right: 18 }]}>
                    <View style={[styles.landmarkDot, { backgroundColor: '#A8A29E' }]} />
                    <Text style={styles.landmarkText}>Palasia Junction</Text>
                  </View>

                  {/* Centered Beacon Pin */}
                  <View style={styles.centerBeacon}>
                    <View style={styles.beaconPill}>
                      <Ionicons name="location" size={13} color="#0B2545" />
                      <Text style={styles.beaconCity}>Indore (MP)</Text>
                      <View style={styles.beaconActiveBadge}>
                        <Text style={styles.beaconActiveText}>ACTIVE</Text>
                      </View>
                    </View>
                    <View style={styles.beaconDotCenter} />
                  </View>
                </View>
              </View>

              {/* Title & Explanatory copy */}
              <View style={styles.copyBlock}>
                <Text style={styles.mainTitle}>Find Deals & Trusted Pros Near You</Text>
                <Text style={styles.mainSubtitle}>
                  See second-hand electronics, cars, and certified technicians available within your travel radius in Indore.
                </Text>
              </View>

              {/* Primary GPS Button */}
              <TouchableOpacity
                style={[styles.gpsButton, loading && styles.btnDisabled]}
                onPress={handleAllowLocation}
                disabled={loading}
                activeOpacity={0.92}
                accessibilityRole="button"
                accessibilityLabel="Use current GPS location">
                <View style={styles.gpsIconWrap}>
                  {loading ? (
                    <ActivityIndicator size="small" color="#FBFBFA" />
                  ) : (
                    <Ionicons name="navigate" size={18} color="#FBFBFA" />
                  )}
                </View>
                <View style={styles.gpsTextWrap}>
                  <Text style={styles.gpsBtnTitle}>Use Current GPS Location</Text>
                  <Text style={styles.gpsBtnSub}>Fast auto-detect • Street-level precision</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color="#FBFBFA" style={{ opacity: 0.8 }} />
              </TouchableOpacity>

              {/* Discovery Radius Selector Card */}
              <View style={styles.radiusCard}>
                <View style={styles.radiusHeaderRow}>
                  <View>
                    <Text style={styles.radiusPreTitle}>SEARCH BOUNDARY</Text>
                    <Text style={styles.radiusTitle}>Discovery Distance Radius</Text>
                  </View>
                  <View style={styles.radiusBadge}>
                    <Text style={styles.radiusBadgeText}>{selectedRadius} km</Text>
                  </View>
                </View>

                {/* Radius Chips */}
                <View style={styles.radiusPillsRow}>
                  {RADIUS_OPTIONS.map((opt) => {
                    const isSelected = selectedRadius === opt.km;
                    return (
                      <TouchableOpacity
                        key={opt.km}
                        style={[styles.radiusChip, isSelected && styles.radiusChipActive]}
                        onPress={() => setSelectedRadius(opt.km)}
                        activeOpacity={0.8}>
                        <Text style={[styles.radiusChipText, isSelected && styles.radiusChipTextActive]}>
                          {opt.km} km
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                {/* Dynamic Coverage Indicator Bar */}
                <View style={styles.coverageBar}>
                  <Ionicons name="sparkles" size={15} color="#15803D" style={{ marginRight: 8 }} />
                  <Text style={styles.coverageText}>
                    <Text style={{ fontWeight: '700', color: '#1C1917' }}>~{activeRadiusMeta.ads} ads & {activeRadiusMeta.pros} pros</Text>
                    {' '}available within {selectedRadius} km
                  </Text>
                </View>
              </View>

              {/* Popular Indore Localities */}
              <View style={styles.localitiesSection}>
                <View style={styles.localitiesHeader}>
                  <Text style={styles.localitiesTitle}>Popular Indore Localities</Text>
                  <Text style={styles.localitiesMeta}>Tap to focus</Text>
                </View>

                <View style={styles.localityChipsWrap}>
                  {INDORE_LOCALITIES.map((loc) => {
                    const isSelected = selectedLocality.name === loc.name;
                    return (
                      <TouchableOpacity
                        key={loc.name}
                        style={[styles.localityChip, isSelected && styles.localityChipActive]}
                        onPress={() => handleSelectLocality(loc)}
                        activeOpacity={0.8}>
                        {isSelected && (
                          <Ionicons name="checkmark-circle" size={14} color="#FBFBFA" style={{ marginRight: 4 }} />
                        )}
                        <Text style={[styles.localityChipText, isSelected && styles.localityChipTextActive]}>
                          {loc.name}
                        </Text>
                        <Text style={[styles.localityChipCount, isSelected && styles.localityChipCountActive]}>
                          {loc.count}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              {/* Privacy Assurance Note */}
              <View style={styles.privacyNoteCard}>
                <Ionicons name="shield-checkmark" size={16} color="#4338CA" style={{ marginRight: 8, marginTop: 1 }} />
                <Text style={styles.privacyNoteText}>
                  Your exact GPS coordinates are encrypted. Other bazaar members only see your neighborhood distance.
                </Text>
              </View>
            </View>
          )}

          {/* ========================================================= */}
          {/* STEP 2: NOTIFICATIONS FULL-PAGE BANNER */}
          {/* ========================================================= */}
          {step === 2 && (
            <View style={styles.stepContent}>
              <View style={styles.notifHeroCard}>
                <View style={styles.notifHeroCircle}>
                  <Ionicons name="notifications" size={48} color="#C2410C" />
                </View>
              </View>

              <View style={styles.copyBlock}>
                <Text style={styles.mainTitle}>Stay Updated on Orders & Chats</Text>
                <Text style={styles.mainSubtitle}>
                  Get real-time order tracking, immediate replies from buyers/sellers, and instant alerts when your favorite items drop in price.
                </Text>
              </View>

              {/* Value Feature Cards */}
              <View style={styles.featuresList}>
                <View style={styles.featureItem}>
                  <View style={[styles.featureIconWrap, { backgroundColor: '#EEEDE9' }]}>
                    <Ionicons name="cube" size={20} color="#0B2545" />
                  </View>
                  <View style={styles.featureTextWrap}>
                    <Text style={styles.featureItemTitle}>Real-time Order Alerts</Text>
                    <Text style={styles.featureItemDesc}>
                      Live technician dispatch updates, service arrival notices, and completion OTPs.
                    </Text>
                  </View>
                </View>

                <View style={styles.featureItem}>
                  <View style={[styles.featureIconWrap, { backgroundColor: '#EEEDE9' }]}>
                    <Ionicons name="chatbubbles" size={20} color="#C2410C" />
                  </View>
                  <View style={styles.featureTextWrap}>
                    <Text style={styles.featureItemTitle}>Instant Seller Chat</Text>
                    <Text style={styles.featureItemDesc}>
                      Never miss an offer or negotiation counter-price from buyers and verified sellers.
                    </Text>
                  </View>
                </View>

                <View style={styles.featureItem}>
                  <View style={[styles.featureIconWrap, { backgroundColor: '#EEEDE9' }]}>
                    <Ionicons name="pricetag" size={20} color="#15803D" />
                  </View>
                  <View style={styles.featureTextWrap}>
                    <Text style={styles.featureItemTitle}>Watchlist Price Drops</Text>
                    <Text style={styles.featureItemDesc}>
                      Instant alerts when electronics, bikes, or furniture on your watchlist reduce prices.
                    </Text>
                  </View>
                </View>
              </View>

              {/* Primary Enable Notifications Button */}
              <TouchableOpacity
                style={[styles.primaryCtaButton, loading && styles.btnDisabled]}
                onPress={handleAllowNotification}
                disabled={loading}
                activeOpacity={0.9}
                accessibilityRole="button"
                accessibilityLabel="Enable notifications">
                {loading ? (
                  <ActivityIndicator size="small" color="#FBFBFA" />
                ) : (
                  <>
                    <Text style={styles.primaryCtaText}>Enable Notifications</Text>
                    <Ionicons name="arrow-forward" size={18} color="#FBFBFA" style={{ marginLeft: 6 }} />
                  </>
                )}
              </TouchableOpacity>

              {/* Skip Secondary Button */}
              <TouchableOpacity
                style={styles.secondaryCtaButton}
                onPress={handleSkipNotification}
                disabled={loading}
                activeOpacity={0.7}
                accessibilityRole="button"
                accessibilityLabel="Skip notifications">
                <Text style={styles.secondaryCtaText}>Skip for Now</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>

        {/* Sticky Bottom Confirm on Step 1 */}
        {step === 1 && (
          <View style={styles.stickyFooter}>
            <TouchableOpacity
              style={styles.confirmLocationBtn}
              onPress={() => setStep(2)}
              activeOpacity={0.9}
              accessibilityRole="button"
              accessibilityLabel={`Confirm location ${selectedLocality.name}`}>
              <Text style={styles.confirmLocationText}>
                CONFIRM LOCATION ({selectedRadius} KM)
              </Text>
              <Ionicons name="arrow-forward" size={17} color="#FBFBFA" />
            </TouchableOpacity>
          </View>
        )}
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F6F5F2'
  },
  header: {
    backgroundColor: '#0B2545',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? 24 : 10,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(231, 229, 228, 0.15)'
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
    backgroundColor: 'rgba(251, 251, 250, 0.12)'
  },
  stepBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2
  },
  stepBadgeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#C2410C',
    marginRight: 6
  },
  stepBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#EEEDE9',
    textTransform: 'uppercase',
    letterSpacing: 0.5
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FBFBFA'
  },
  skipHeaderBtn: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
    backgroundColor: 'rgba(251, 251, 250, 0.1)'
  },
  skipHeaderText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#EEEDE9'
  },
  scrollContent: {
    paddingBottom: 100
  },
  stepContent: {
    paddingHorizontal: 16,
    paddingTop: 16
  },
  mapGraphicSection: {
    width: '100%',
    height: 180,
    backgroundColor: '#0F172A',
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E7E5E4',
    marginBottom: 16,
    position: 'relative'
  },
  mapGridLines: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative'
  },
  mapCircleOuter: {
    position: 'absolute',
    width: 170,
    height: 170,
    borderRadius: 85,
    borderWidth: 1,
    borderColor: 'rgba(11, 37, 69, 0.5)',
    backgroundColor: 'rgba(11, 37, 69, 0.2)'
  },
  mapCircleMiddle: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 1,
    borderColor: 'rgba(194, 65, 12, 0.3)',
    backgroundColor: 'rgba(194, 65, 12, 0.1)'
  },
  mapCircleInner: {
    position: 'absolute',
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 1,
    borderColor: 'rgba(251, 251, 250, 0.25)',
    backgroundColor: 'rgba(251, 251, 250, 0.08)'
  },
  landmarkBadge: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 3,
    paddingHorizontal: 7,
    borderRadius: 6,
    backgroundColor: 'rgba(15, 23, 42, 0.88)',
    borderWidth: 1,
    borderColor: 'rgba(231, 229, 228, 0.2)'
  },
  landmarkDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    marginRight: 4
  },
  landmarkText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#FBFBFA'
  },
  centerBeacon: {
    alignItems: 'center',
    zIndex: 10
  },
  beaconPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FBFBFA',
    borderWidth: 1,
    borderColor: '#E7E5E4',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
    marginBottom: 4,
    shadowColor: '#1C1917',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2
  },
  beaconCity: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1C1917',
    marginLeft: 4,
    marginRight: 6
  },
  beaconActiveBadge: {
    backgroundColor: '#DCFCE7',
    paddingVertical: 1,
    paddingHorizontal: 4,
    borderRadius: 4
  },
  beaconActiveText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#15803D'
  },
  beaconDotCenter: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#0B2545',
    borderWidth: 2,
    borderColor: '#FBFBFA'
  },
  copyBlock: {
    marginBottom: 16
  },
  mainTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1C1917',
    letterSpacing: -0.2,
    marginBottom: 6
  },
  mainSubtitle: {
    fontSize: 13,
    lineHeight: 18,
    color: '#57534E'
  },
  gpsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0B2545',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 16,
    minHeight: 48,
    borderWidth: 1,
    borderColor: '#0B2545'
  },
  gpsIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 6,
    backgroundColor: 'rgba(251, 251, 250, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10
  },
  gpsTextWrap: {
    flex: 1
  },
  gpsBtnTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FBFBFA'
  },
  gpsBtnSub: {
    fontSize: 11,
    color: '#EEEDE9',
    marginTop: 1
  },
  radiusCard: {
    backgroundColor: '#FBFBFA',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E7E5E4',
    marginBottom: 16
  },
  radiusHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12
  },
  radiusPreTitle: {
    fontSize: 9,
    fontWeight: '800',
    color: '#0B2545',
    letterSpacing: 0.5
  },
  radiusTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1C1917'
  },
  radiusBadge: {
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FFEDD5',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 6
  },
  radiusBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#C2410C'
  },
  radiusPillsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 6,
    marginBottom: 12
  },
  radiusChip: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 6,
    backgroundColor: '#EEEDE9',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E7E5E4'
  },
  radiusChipActive: {
    backgroundColor: '#0B2545',
    borderColor: '#0B2545'
  },
  radiusChipText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#57534E'
  },
  radiusChipTextActive: {
    color: '#FBFBFA',
    fontWeight: '700'
  },
  coverageBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EEEDE9',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: '#E7E5E4'
  },
  coverageText: {
    fontSize: 11,
    color: '#57534E',
    flex: 1
  },
  localitiesSection: {
    marginBottom: 16
  },
  localitiesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8
  },
  localitiesTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1C1917'
  },
  localitiesMeta: {
    fontSize: 11,
    color: '#6F6A65'
  },
  localityChipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6
  },
  localityChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 7,
    paddingHorizontal: 10,
    borderRadius: 6,
    backgroundColor: '#EEEDE9',
    borderWidth: 1,
    borderColor: '#E7E5E4'
  },
  localityChipActive: {
    backgroundColor: '#0B2545',
    borderColor: '#0B2545'
  },
  localityChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1C1917',
    marginRight: 6
  },
  localityChipTextActive: {
    color: '#FBFBFA',
    fontWeight: '700'
  },
  localityChipCount: {
    fontSize: 10,
    color: '#6F6A65',
    fontWeight: '500'
  },
  localityChipCountActive: {
    color: '#EEEDE9'
  },
  privacyNoteCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#EEEDE9',
    borderRadius: 8,
    padding: 10,
    borderWidth: 1,
    borderColor: '#E7E5E4',
    marginBottom: 20
  },
  privacyNoteText: {
    fontSize: 11,
    lineHeight: 16,
    color: '#57534E',
    flex: 1
  },
  stickyFooter: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(246, 245, 242, 0.98)',
    borderTopWidth: 1,
    borderTopColor: '#E7E5E4',
    paddingHorizontal: 16,
    paddingVertical: 10
  },
  confirmLocationBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#C2410C',
    borderRadius: 8,
    paddingVertical: 13,
    gap: 6,
    minHeight: 48
  },
  confirmLocationText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FBFBFA',
    letterSpacing: 0.5
  },
  notifHeroCard: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 24,
    marginBottom: 8
  },
  notifHeroCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#FFF7ED',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#FFEDD5'
  },
  featuresList: {
    marginBottom: 24
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FBFBFA',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E7E5E4',
    marginBottom: 10
  },
  featureIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12
  },
  featureTextWrap: {
    flex: 1
  },
  featureItemTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1C1917',
    marginBottom: 2
  },
  featureItemDesc: {
    fontSize: 11,
    lineHeight: 15,
    color: '#57534E'
  },
  primaryCtaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#C2410C',
    borderRadius: 8,
    paddingVertical: 14,
    marginBottom: 10,
    minHeight: 48
  },
  primaryCtaText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FBFBFA'
  },
  secondaryCtaButton: {
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center'
  },
  secondaryCtaText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6F6A65'
  },
  btnDisabled: {
    opacity: 0.7
  }
});

export default PermissionsFlow;