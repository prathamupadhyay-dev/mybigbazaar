import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Platform,
  ActivityIndicator,
  StatusBar as RNStatusBar,
  ScrollView,
} from 'react-native';
import { StatusBar as ExpoStatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useApp } from '../../context/AppContext';

export const HAS_SELECTED_LOCATION_KEY = '@has_selected_location';

export default function LocationPromptScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { setCurrentLocation, setLocationPermissionGranted, country } = useApp();

  const [permissionModalVisible, setPermissionModalVisible] = useState(false);
  const [selectedAccuracy, setSelectedAccuracy] = useState('precise'); // 'precise' | 'approximate'
  const [isLocating, setIsLocating] = useState(false);
  const [attemptCount, setAttemptCount] = useState(0);

  // Trigger Find My Location action
  const handleFindMyLocation = () => {
    // If user already attempted once, or on subsequent clicks, proceed to other location selector
    if (attemptCount >= 1) {
      navigation.navigate('LocationSelector');
      return;
    }
    setAttemptCount((prev) => prev + 1);
    setPermissionModalVisible(true);
  };

  // User clicked "Other location"
  const handleOtherLocation = () => {
    navigation.navigate('LocationSelector');
  };

  // Handle Permission Choice from Modal
  const handlePermissionChoice = async (type) => {
    setPermissionModalVisible(false);

    if (type === 'denied') {
      // User tapped "Don't allow" -> open manual location selector
      navigation.navigate('LocationSelector');
      return;
    }

    // User selected "While using the app" or "Only this time"
    setIsLocating(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        setLocationPermissionGranted(true);
        const position = await Location.getCurrentPositionAsync({
          accuracy:
            selectedAccuracy === 'precise'
              ? Location.Accuracy.High
              : Location.Accuracy.Balanced,
        });

        const [geo] = await Location.reverseGeocodeAsync({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        }).catch(() => []);

        const resolvedLocation = {
          address: geo
            ? `${geo.name || geo.street || ''}, ${geo.city || geo.subregion || 'Indore'}, ${geo.region || 'Madhya Pradesh'} ${geo.postalCode || ''}`.trim()
            : (country === 'United States' ? 'San Jose, California 95113' : 'Vijay Nagar, Indore, Madhya Pradesh 452010'),
          city: geo?.city || geo?.subregion || (country === 'United States' ? 'San Jose' : 'Indore'),
          state: geo?.region || (country === 'United States' ? 'California' : 'Madhya Pradesh'),
          pincode: geo?.postalCode || (country === 'United States' ? '95113' : '452010'),
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };

        setCurrentLocation(resolvedLocation);
        await AsyncStorage.setItem(HAS_SELECTED_LOCATION_KEY, 'true');
        navigation.navigate('Main');
      } else {
        // Permission denied by system dialog -> open manual location selector
        navigation.navigate('LocationSelector');
      }
    } catch (err) {
      console.log('Location detection fallback:', err.message);
      navigation.navigate('LocationSelector');
    } finally {
      setIsLocating(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Deep Navy Blue Status Bar */}
      <RNStatusBar
        barStyle="light-content"
        backgroundColor="#00356B"
        translucent={false}
      />
      <ExpoStatusBar
        style="light"
        backgroundColor="#00356B"
        translucent={false}
      />

      <View style={[styles.content, { paddingTop: Math.max(insets.top, 24) + 40 }]}>
        {/* Soft Blue Ripple & Location Pin Illustration */}
        <View style={styles.rippleOuter}>
          <View style={styles.rippleInner}>
            <View style={styles.pinWrapper}>
              <Ionicons name="location-sharp" size={72} color="#0078FF" />
              {/* Center Yellow Dot */}
              <View style={styles.pinYellowDot} />
            </View>
          </View>
        </View>

        {/* Heading */}
        <Text style={styles.heading}>Where is your location?</Text>

        {/* Subtitle */}
        <Text style={styles.subtitle}>
          Enjoy a personalized selling and buying experience by telling us your location.
        </Text>
      </View>

      {/* Bottom Action Buttons */}
      <View
        style={[
          styles.footer,
          { paddingBottom: Math.max(insets.bottom, 16) + 32 },
        ]}
      >
        {/* Primary Button: "Find My Location" */}
        <TouchableOpacity
          onPress={handleFindMyLocation}
          disabled={isLocating}
          activeOpacity={0.85}
          style={styles.findButton}
        >
          {isLocating ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <>
              <Ionicons name="locate-outline" size={20} color="#FFFFFF" />
              <Text style={styles.findButtonText}>Find My Location</Text>
            </>
          )}
        </TouchableOpacity>

        {/* Secondary Link: "Other location" */}
        <TouchableOpacity
          onPress={handleOtherLocation}
          activeOpacity={0.7}
          style={styles.otherLocationContainer}
        >
          <Text style={styles.otherLocationText}>Other location</Text>
          <View style={styles.otherLocationUnderline} />
        </TouchableOpacity>
      </View>

      {/* Permission Modal (Screenshot 2: Android Location Dialog) */}
      <Modal
        visible={permissionModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setPermissionModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.permissionCard}>
            {/* Cyan Location Pin */}
            <Ionicons name="location-sharp" size={28} color="#38BDF8" />

            {/* Title */}
            <Text style={styles.permissionTitle}>
              Allow MyBigBazaar to access this device's location?
            </Text>

            {/* Visual Options: Precise vs Approximate */}
            <View style={styles.accuracyRow}>
              {/* Precise Option */}
              <TouchableOpacity
                onPress={() => setSelectedAccuracy('precise')}
                activeOpacity={0.8}
                style={[
                  styles.accuracyItem,
                  selectedAccuracy === 'precise' && styles.accuracyItemActive,
                ]}
              >
                <View style={styles.accuracyCirclePreview}>
                  {/* Grid Lines */}
                  <View style={styles.gridLineHorizontal} />
                  <View style={styles.gridLineVertical} />
                  <View style={styles.gridPin}>
                    <Ionicons name="location-sharp" size={22} color="#0078FF" />
                  </View>
                </View>
                <Text style={styles.accuracyLabel}>Precise</Text>
              </TouchableOpacity>

              {/* Approximate Option */}
              <TouchableOpacity
                onPress={() => setSelectedAccuracy('approximate')}
                activeOpacity={0.8}
                style={[
                  styles.accuracyItem,
                  selectedAccuracy === 'approximate' && styles.accuracyItemActive,
                ]}
              >
                <View style={styles.accuracyCirclePreview}>
                  {/* Coarse road lines */}
                  <View style={styles.roadLine1} />
                  <View style={styles.roadLine2} />
                  <View style={styles.roadLine3} />
                </View>
                <Text style={styles.accuracyLabel}>Approximate</Text>
              </TouchableOpacity>
            </View>

            {/* Permission Option Buttons */}
            <View style={styles.permissionButtons}>
              <TouchableOpacity
                onPress={() => handlePermissionChoice('while_using')}
                activeOpacity={0.85}
                style={styles.pillButton}
              >
                <Text style={styles.pillButtonText}>While using the app</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => handlePermissionChoice('only_once')}
                activeOpacity={0.85}
                style={styles.pillButton}
              >
                <Text style={styles.pillButtonText}>Only this time</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => handlePermissionChoice('denied')}
                activeOpacity={0.85}
                style={styles.pillButton}
              >
                <Text style={styles.pillButtonText}>Don't allow</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    justifyContent: 'space-between',
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  rippleOuter: {
    width: 230,
    height: 230,
    borderRadius: 115,
    backgroundColor: 'rgba(0, 120, 255, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  rippleInner: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(0, 120, 255, 0.16)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pinWrapper: {
    width: 72,
    height: 72,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  pinYellowDot: {
    position: 'absolute',
    top: 20,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#FFD700',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  heading: {
    fontSize: 24,
    fontWeight: '700',
    color: '#002F34',
    marginTop: 24,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#406367',
    textAlign: 'center',
    marginTop: 12,
    lineHeight: 24,
    paddingHorizontal: 16,
  },
  footer: {
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  findButton: {
    backgroundColor: '#004796',
    borderRadius: 5,
    height: 48,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  findButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 8,
  },
  otherLocationContainer: {
    marginTop: 22,
    alignItems: 'center',
  },
  otherLocationText: {
    color: '#004796',
    fontSize: 16,
    fontWeight: '700',
  },
  otherLocationUnderline: {
    height: 2,
    backgroundColor: '#004796',
    width: '100%',
    marginTop: 2,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  permissionCard: {
    backgroundColor: '#2F3842',
    borderRadius: 20,
    paddingVertical: 24,
    paddingHorizontal: 20,
    width: '100%',
    alignItems: 'center',
  },
  permissionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
    marginTop: 12,
    lineHeight: 24,
  },
  accuracyRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 24,
    marginVertical: 22,
  },
  accuracyItem: {
    alignItems: 'center',
    padding: 6,
    borderRadius: 10,
  },
  accuracyItemActive: {
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  accuracyCirclePreview: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: '#1E293B',
    borderWidth: 2,
    borderColor: '#475569',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    position: 'relative',
  },
  gridLineHorizontal: {
    position: 'absolute',
    width: '100%',
    height: 1,
    backgroundColor: '#475569',
  },
  gridLineVertical: {
    position: 'absolute',
    height: '100%',
    width: 1,
    backgroundColor: '#475569',
  },
  gridPin: {
    zIndex: 2,
  },
  roadLine1: {
    position: 'absolute',
    width: 60,
    height: 3,
    backgroundColor: '#EAB308',
    transform: [{ rotate: '35deg' }],
  },
  roadLine2: {
    position: 'absolute',
    width: 70,
    height: 2,
    backgroundColor: '#EAB308',
    transform: [{ rotate: '-45deg' }],
  },
  roadLine3: {
    position: 'absolute',
    width: 50,
    height: 3,
    backgroundColor: '#38BDF8',
    top: 20,
  },
  accuracyLabel: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 8,
  },
  permissionButtons: {
    width: '100%',
    gap: 10,
  },
  pillButton: {
    backgroundColor: '#BAE6FD',
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  pillButtonText: {
    color: '#002F34',
    fontSize: 15,
    fontWeight: '600',
  },
});
