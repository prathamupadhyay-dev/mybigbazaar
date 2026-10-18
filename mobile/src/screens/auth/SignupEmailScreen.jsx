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
import { useNavigation, useRoute } from '@react-navigation/native';
import { checkEmailApi, sendOtpApi } from '../../services/authApi';

export default function SignupEmailScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const insets = useSafeAreaInsets();

  const [email, setEmail] = useState(route.params?.email || '');
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const isValidEmail = emailRegex.test(email.trim());

  const handleNext = async () => {
    if (!isValidEmail) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    setErrorMessage('');
    setIsLoading(true);

    const cleanEmail = email.trim().toLowerCase();

    try {
      // 1. Check if email already exists
      const checkResult = await checkEmailApi({ email: cleanEmail });

      if (checkResult.exists) {
        setIsLoading(false);
        setErrorMessage('An account with this email already exists.');
        Alert.alert(
          'Account Exists',
          `An account is already registered for ${cleanEmail}. Please log in with your password.`,
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Log In',
              onPress: () => navigation.navigate('PasswordLogin', { email: cleanEmail }),
            },
          ]
        );
        return;
      }

      // 2. Email is available -> Send 4-digit verification OTP
      await sendOtpApi({ email: cleanEmail, purpose: 'signup' });

      setIsLoading(false);

      // 3. Navigate to VerifyOtpScreen in signup mode
      navigation.navigate('VerifyOtp', {
        email: cleanEmail,
        isPhoneAuth: false,
        isSignup: true,
      });
    } catch (err) {
      setIsLoading(false);
      setErrorMessage(err.message || 'Failed to send verification code. Please try again.');
    }
  };

  const handleLogin = () => {
    navigation.navigate('EmailLogin');
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
          <Text style={styles.headerTitle}>Sign Up</Text>
        </View>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardContainer}
      >
        <View style={styles.content}>
          {/* Top-Left Avatar Circle (64x64) */}
          <View style={styles.avatarCircle}>
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
          <Text style={styles.heading}>Enter your email to sign up</Text>

          {/* Email Input Field */}
          <View style={[styles.emailContainer, errorMessage ? styles.emailContainerError : null]}>
            <Text style={styles.emailLabel}>Email</Text>
            <TextInput
              value={email}
              onChangeText={(val) => {
                setEmail(val);
                setErrorMessage('');
              }}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              autoFocus={true}
              placeholder="e.g. name@example.com"
              placeholderTextColor="#94A3B8"
              style={styles.emailInput}
            />
          </View>

          {/* Error Message */}
          {errorMessage ? (
            <View style={styles.errorRow}>
              <Ionicons name="alert-circle-outline" size={16} color="#DC2626" />
              <Text style={styles.errorText}>{errorMessage}</Text>
            </View>
          ) : null}

          {/* Yellow/Cream Info Callout Box */}
          <View style={styles.calloutBox}>
            <Text style={styles.calloutText}>
              We will send a 4-digit verification code to this email to confirm your identity.
            </Text>
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
            disabled={!isValidEmail || isLoading}
            activeOpacity={0.8}
            style={[
              styles.nextButton,
              isValidEmail ? styles.nextButtonActive : styles.nextButtonDisabled,
            ]}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={styles.nextButtonText}>Next</Text>
            )}
          </TouchableOpacity>

          {/* Login Option Under Next */}
          <TouchableOpacity
            onPress={handleLogin}
            activeOpacity={0.7}
            style={styles.loginLinkRow}
          >
            <Text style={styles.loginPrompt}>Already have an account? </Text>
            <Text style={styles.loginAction}>Log In</Text>
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
  emailContainer: {
    marginTop: 28,
  },
  emailContainerError: {
    borderColor: '#DC2626',
  },
  emailLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#004796',
    marginBottom: 4,
  },
  emailInput: {
    borderBottomWidth: 2,
    borderColor: '#004796',
    paddingVertical: 8,
    fontSize: 17,
    color: '#002F34',
    fontWeight: '500',
  },
  errorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  errorText: {
    fontSize: 13,
    color: '#DC2626',
    marginLeft: 6,
    fontWeight: '500',
  },
  calloutBox: {
    marginTop: 24,
    backgroundColor: '#FDF9E8',
    borderRadius: 6,
    padding: 16,
  },
  calloutText: {
    fontSize: 15,
    lineHeight: 22,
    color: '#004796',
    fontWeight: '400',
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
  loginLinkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    marginTop: 4,
  },
  loginPrompt: {
    fontSize: 14,
    color: '#4B5563',
    fontWeight: '500',
  },
  loginAction: {
    fontSize: 14,
    color: '#004796',
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
});
