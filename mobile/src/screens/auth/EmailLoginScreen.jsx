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
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useApp } from '../../context/AppContext';
import { checkEmailApi } from '../../services/authApi';

export default function EmailLoginScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { updateUser, setAuthenticated, executePendingAction } = useApp();

  const handleDemoLogin = async () => {
    const demoUser = {
      _id: 'demo-user-001',
      id: 'demo-user-001',
      fullName: 'Demo Guest',
      name: 'Demo Guest',
      email: 'guest.demo@mybigbazaar.com',
      phone: '+91 98765 43210',
      phoneNumber: '+91 98765 43210',
      role: 'user',
      walletBalance: 2500,
      isElite: true,
      city: 'Indore',
      state: 'Madhya Pradesh',
      address: 'Plot 45, Vijay Nagar, Indore, Madhya Pradesh 452010',
    };

    try {
      await AsyncStorage.setItem('@bigbazaar_auth_token', 'demo-mobile-token-' + Date.now());
      await AsyncStorage.setItem('@bigbazaar_user_profile', JSON.stringify(demoUser));
      await AsyncStorage.setItem('@has_selected_location', 'true');
      await AsyncStorage.setItem('@location_permission_granted', 'true');
    } catch (e) {}

    updateUser(demoUser);
    setAuthenticated(true);

    if (executePendingAction) {
      executePendingAction();
    }

    navigation.reset({
      index: 0,
      routes: [{ name: 'Main', params: { screen: 'Home' } }],
    });
  };

  const [email, setEmail] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [notRegistered, setNotRegistered] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const isValidEmail = emailRegex.test(email.trim());

  const handleNext = async () => {
    if (!isValidEmail) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    setErrorMessage('');
    setNotRegistered(false);
    setIsLoading(true);

    const cleanEmail = email.trim().toLowerCase();

    try {
      const result = await checkEmailApi({ email: cleanEmail });

      if (result.exists) {
        // Email is registered -> Navigate to PasswordLoginScreen
        navigation.navigate('PasswordLogin', { email: cleanEmail });
      } else {
        // Email is NOT registered
        setNotRegistered(true);
        setErrorMessage('This email is not registered yet.');
        Alert.alert(
          'Account Not Found',
          `No account was found for ${cleanEmail}. Would you like to create one now?`,
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Sign Up',
              onPress: () => navigation.navigate('SignupEmail', { email: cleanEmail }),
            },
          ]
        );
      }
    } catch (err) {
      // If network fails, allow navigating to PasswordLogin with fallback notice
      setErrorMessage(err.message || 'Unable to verify email. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignupPress = () => {
    navigation.navigate('SignupMethod', { email: email.trim().toLowerCase() });
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
          <Text style={styles.heading}>Enter your email to login</Text>

          {/* Email Input Field */}
          <View style={[styles.emailContainer, errorMessage ? styles.emailContainerError : null]}>
            <Text style={styles.emailLabel}>Email</Text>
            <TextInput
              value={email}
              onChangeText={(val) => {
                setEmail(val);
                setErrorMessage('');
                setNotRegistered(false);
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

          {/* Not Registered Prompt Box */}
          {notRegistered ? (
            <TouchableOpacity
              onPress={() => navigation.navigate('SignupEmail', { email: email.trim().toLowerCase() })}
              style={styles.unregisteredBox}
              activeOpacity={0.8}
            >
              <Ionicons name="person-add-outline" size={20} color="#004796" />
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={styles.unregisteredTitle}>Not registered yet?</Text>
                <Text style={styles.unregisteredSub}>Tap here to sign up with this email</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#004796" />
            </TouchableOpacity>
          ) : (
            /* Yellow/Cream Info Callout Box */
            <View style={styles.calloutBox}>
              <Text style={styles.calloutText}>
                We will check your email and ask for your password on the next step.
              </Text>
            </View>
          )}
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

          {/* Sign Up Option Under Next */}
          <TouchableOpacity
            onPress={handleSignupPress}
            activeOpacity={0.7}
            style={styles.signupLinkRow}
          >
            <Text style={styles.signupPrompt}>Don&apos;t have an account? </Text>
            <Text style={styles.signupAction}>Sign Up</Text>
          </TouchableOpacity>

          {/* Demo Login Button */}
          <TouchableOpacity
            onPress={handleDemoLogin}
            activeOpacity={0.8}
            style={styles.demoLoginBtn}
          >
            <Ionicons name="sparkles-outline" size={17} color="#004796" />
            <Text style={styles.demoLoginText}>Explore in Demo Mode (Without Backend)</Text>
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
  passwordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 2,
    borderColor: '#004796',
  },
  passwordInput: {
    flex: 1,
    paddingVertical: 8,
    fontSize: 17,
    color: '#002F34',
    fontWeight: '500',
  },
  eyeIcon: {
    padding: 6,
  },
  forgotLink: {
    marginTop: 14,
    alignSelf: 'flex-start',
  },
  forgotText: {
    fontSize: 14,
    color: '#004796',
    fontWeight: '600',
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
  emailContainerError: {
    borderColor: '#DC2626',
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
  unregisteredBox: {
    marginTop: 20,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    borderRadius: 8,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
  },
  unregisteredTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#004796',
  },
  unregisteredSub: {
    fontSize: 12,
    color: '#4B5563',
    marginTop: 2,
  },
  signupLinkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    marginTop: 4,
  },
  signupPrompt: {
    fontSize: 14,
    color: '#4B5563',
    fontWeight: '500',
  },
  signupAction: {
    fontSize: 14,
    color: '#004796',
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
  demoLoginBtn: {
    height: 46,
    borderRadius: 12,
    borderWidth: 1.2,
    borderColor: '#004796',
    backgroundColor: '#F0F5FA',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    gap: 8,
  },
  demoLoginText: {
    color: '#004796',
    fontSize: 13.5,
    fontWeight: '700',
  },
});
