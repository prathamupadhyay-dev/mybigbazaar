import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert,
  StatusBar as RNStatusBar,
} from 'react-native';
import { StatusBar as ExpoStatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { sendPhoneOtpApi, resendOtpApi } from '../../services/authApi';

export default function PhoneLoginScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  const [phoneNumber, setPhoneNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const isValidPhone = phoneNumber.trim().length === 10;

  const handleNext = async () => {
    if (!isValidPhone) return;

    setIsLoading(true);
    const cleanPhone = phoneNumber.trim().replace(/[^0-9]/g, '').slice(-10);
    const tempEmail = `${cleanPhone}@mybigbazaar.com`;

    try {
      let debugOtp = null;
      try {
        const res = await sendPhoneOtpApi({ phoneNumber: cleanPhone });
        debugOtp = res?.otp;
      } catch (apiErr) {
        console.log('[PHONE_LOGIN] Live phone OTP dispatch note:', apiErr.message);
      }

      // Navigate to OTP verification screen with phone credentials
      navigation.navigate('VerifyOtp', {
        phoneNumber: cleanPhone,
        phone: `+91${cleanPhone}`,
        email: tempEmail,
        isPhoneAuth: true,
        debugOtp,
      });
    } catch (error) {
      Alert.alert('Verification Error', error.message || 'Unable to send code. Please try again.');
    } finally {
      setIsLoading(false);
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

      {/* Top Header with Back Arrow and Title */}
      <View style={[styles.header, { paddingTop: Math.max(insets.top, 12) }]}>
        <View style={styles.headerContent}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            activeOpacity={0.7}
            style={styles.backButton}
            accessibilityLabel="Go back"
          >
            <Ionicons name="arrow-back" size={24} color="#002F34" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Login</Text>
        </View>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardContainer}
      >
        <View style={styles.content}>
          {/* Top-Left Avatar Circle (64x64) */}
          <View style={styles.avatarCircle}>
            {/* Stylized Avatar illustration: Curly coral hair & Navy blue shirt */}
            <View style={styles.avatarHair} />
            <View style={styles.avatarFace}>
              <View style={styles.avatarEyeRow}>
                <View style={styles.avatarEye} />
                <View style={styles.avatarEye} />
              </View>
            </View>
            <View style={styles.avatarBody} />
          </View>

          {/* Heading */}
          <Text style={styles.heading}>Enter your phone number</Text>

          {/* Subtitle */}
          <Text style={styles.subtitle}>
            We'll send you a verification code on the same number.
          </Text>

          {/* Country + Phone Input Row */}
          <View style={styles.inputRow}>
            {/* Country Column */}
            <View style={styles.countryCol}>
              <Text style={styles.inputLabel}>Country</Text>
              <View style={styles.countryValueBox}>
                <Text style={styles.countryValue}>+91</Text>
              </View>
            </View>

            {/* Phone Number Column */}
            <View style={styles.phoneCol}>
              <Text style={styles.phoneLabel}>Phone Number</Text>
              <TextInput
                value={phoneNumber}
                onChangeText={(text) => setPhoneNumber(text.replace(/[^0-9]/g, ''))}
                keyboardType="phone-pad"
                maxLength={10}
                autoFocus={true}
                placeholder=""
                placeholderTextColor="#94A3B8"
                style={styles.phoneInput}
              />
            </View>
          </View>
        </View>

        {/* Bottom Sticky Footer */}
        <View
          style={[
            styles.footer,
            { paddingBottom: Math.max(insets.bottom, 16) + 12 },
          ]}
        >
          <TouchableOpacity
            onPress={handleNext}
            disabled={!isValidPhone || isLoading}
            activeOpacity={0.8}
            style={[
              styles.nextButton,
              isValidPhone ? styles.nextButtonActive : styles.nextButtonDisabled,
            ]}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={styles.nextButtonText}>Next</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderColor: '#E5E7EB',
  },
  headerContent: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  backButton: {
    padding: 4,
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 19,
    fontWeight: '600',
    color: '#002F34',
  },
  keyboardContainer: {
    flex: 1,
    justifyContent: 'space-between',
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  avatarCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FADCD2',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    position: 'relative',
  },
  avatarHair: {
    position: 'absolute',
    top: 6,
    width: 44,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#D94436',
  },
  avatarFace: {
    position: 'absolute',
    top: 16,
    width: 28,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FADCD2',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  avatarEyeRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 2,
  },
  avatarEye: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#002F34',
  },
  avatarBody: {
    position: 'absolute',
    bottom: -2,
    width: 48,
    height: 22,
    borderTopLeftRadius: 14,
    borderTopRightRadius: 14,
    backgroundColor: '#004796',
    zIndex: 3,
  },
  heading: {
    fontSize: 24,
    fontWeight: '700',
    color: '#002F34',
    marginTop: 20,
    lineHeight: 30,
  },
  subtitle: {
    fontSize: 15,
    color: '#406367',
    marginTop: 8,
    lineHeight: 22,
  },
  inputRow: {
    flexDirection: 'row',
    marginTop: 28,
    gap: 14,
  },
  countryCol: {
    width: 85,
  },
  inputLabel: {
    fontSize: 12,
    color: '#7F9799',
    marginBottom: 4,
  },
  countryValueBox: {
    borderBottomWidth: 1,
    borderColor: '#002F34',
    paddingVertical: 8,
  },
  countryValue: {
    fontSize: 17,
    color: '#002F34',
    fontWeight: '500',
  },
  phoneCol: {
    flex: 1,
  },
  phoneLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#004796',
    marginBottom: 4,
  },
  phoneInput: {
    borderBottomWidth: 2,
    borderColor: '#004796',
    paddingVertical: 8,
    fontSize: 17,
    color: '#002F34',
    fontWeight: '500',
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 16,
    backgroundColor: '#FFFFFF',
  },
  nextButton: {
    height: 48,
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  nextButtonDisabled: {
    backgroundColor: '#E0E0E0',
  },
  nextButtonActive: {
    backgroundColor: '#004796',
  },
  nextButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
