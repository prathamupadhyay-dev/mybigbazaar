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
import { loginApi, forgotPasswordApi } from '../../services/authApi';
import { useApp } from '../../context/AppContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function PasswordLoginScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const insets = useSafeAreaInsets();
  const { updateUser, setAuthenticated, executePendingAction } = useApp();

  const email = (route.params?.email || '').trim().toLowerCase();

  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleLogin = async () => {
    if (!password || password.length < 6) {
      setErrorMessage('Password must be at least 6 characters.');
      return;
    }

    setErrorMessage('');
    setIsLoading(true);

    try {
      const result = await loginApi({
        email,
        password,
      });

      if (result.user) {
        updateUser(result.user);
        setAuthenticated(true);
      }

      if (executePendingAction) {
        executePendingAction();
      }

      try {
        const hasLocation = await AsyncStorage.getItem('@has_selected_location');
        if (hasLocation === 'true') {
          navigation.reset({
            index: 0,
            routes: [{ name: 'Main', params: { screen: 'Home' } }],
          });
        } else {
          navigation.navigate('LocationPrompt');
        }
      } catch (e) {
        navigation.navigate('LocationPrompt');
      }
    } catch (error) {
      setErrorMessage(error.message || 'Incorrect password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = () => {
    Alert.alert(
      'Reset Password',
      `We will send a 4-digit verification code to ${email}.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Send Code',
          onPress: async () => {
            try {
              if (forgotPasswordApi) {
                await forgotPasswordApi({ email }).catch(() => {});
              }
              navigation.navigate('VerifyOtp', { email, isPhoneAuth: false });
            } catch (err) {
              navigation.navigate('VerifyOtp', { email, isPhoneAuth: false });
            }
          },
        },
      ]
    );
  };

  const handleSignup = () => {
    navigation.navigate('SignupMethod', { email });
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
          <Text style={styles.heading}>Enter your password</Text>

          {/* Selected Email Chip */}
          <View style={styles.emailChipRow}>
            <Ionicons name="mail-outline" size={16} color="#004796" />
            <Text style={styles.emailChipText} numberOfLines={1}>
              {email}
            </Text>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              style={styles.changeEmailBtn}
            >
              <Text style={styles.changeEmailText}>Change</Text>
            </TouchableOpacity>
          </View>

          {/* Password Input Field */}
          <View style={[styles.inputContainer, errorMessage ? styles.inputContainerError : null]}>
            <Text style={styles.inputLabel}>Password</Text>
            <View style={styles.passwordRow}>
              <TextInput
                value={password}
                onChangeText={(val) => {
                  setPassword(val);
                  setErrorMessage('');
                }}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoFocus={true}
                placeholder="Enter account password"
                placeholderTextColor="#94A3B8"
                style={styles.passwordInput}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                style={styles.eyeIcon}
              >
                <Ionicons
                  name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={20}
                  color="#004796"
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Error Message */}
          {errorMessage ? (
            <View style={styles.errorRow}>
              <Ionicons name="alert-circle-outline" size={16} color="#DC2626" />
              <Text style={styles.errorText}>{errorMessage}</Text>
            </View>
          ) : null}

          {/* Forgot Password Link */}
          <TouchableOpacity
            onPress={handleForgotPassword}
            style={styles.forgotLink}
            activeOpacity={0.7}
          >
            <Text style={styles.forgotText}>Forgot your password?</Text>
          </TouchableOpacity>
        </View>

        {/* Bottom Sticky Footer */}
        <View
          style={[
            styles.footer,
            { paddingBottom: Math.max(insets.bottom, 16) + 12 },
          ]}
        >
          <TouchableOpacity
            onPress={handleLogin}
            disabled={password.length < 6 || isLoading}
            activeOpacity={0.8}
            style={[
              styles.loginButton,
              password.length >= 6 ? styles.loginButtonActive : styles.loginButtonDisabled,
            ]}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={styles.loginButtonText}>Log In</Text>
            )}
          </TouchableOpacity>

          {/* Sign Up Link Under Log In */}
          <TouchableOpacity
            onPress={handleSignup}
            activeOpacity={0.7}
            style={styles.signupLinkRow}
          >
            <Text style={styles.signupPrompt}>Don&apos;t have an account? </Text>
            <Text style={styles.signupAction}>Sign Up</Text>
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
  emailChipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F7FF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginTop: 14,
    borderWidth: 1,
    borderColor: '#D0E3F9',
  },
  emailChipText: {
    fontSize: 14,
    color: '#004796',
    fontWeight: '600',
    marginLeft: 8,
    flex: 1,
  },
  changeEmailBtn: {
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  changeEmailText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#004796',
    textDecorationLine: 'underline',
  },
  inputContainer: {
    marginTop: 24,
  },
  inputContainerError: {
    borderBottomColor: '#DC2626',
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#004796',
    marginBottom: 4,
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
  forgotLink: {
    marginTop: 18,
    alignSelf: 'flex-start',
  },
  forgotText: {
    fontSize: 14,
    color: '#004796',
    fontWeight: '600',
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 16,
    backgroundColor: '#FFFFFF',
  },
  loginButton: {
    height: 48,
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  loginButtonDisabled: {
    backgroundColor: '#E0E0E0',
  },
  loginButtonActive: {
    backgroundColor: '#004796',
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
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
});
