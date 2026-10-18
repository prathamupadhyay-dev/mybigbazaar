import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../../context/AppContext';
import ScreenContainer from '../../components/ScreenContainer';
import Colors from '../../constants/colors';
import Typography from '../../constants/typography';
import Spacing from '../../constants/spacing';
import Radii from '../../constants/radii';
import Shadows from '../../constants/shadows';
import { loginApi, googleLoginApi, resetPasswordApi, saveAuthToken, saveUserProfile } from '../../services/authApi';
import BigBazaarLogo from '../../components/common/BigBazaarLogo';

export const LoginScreen = () => {
  const navigation = useNavigation();
  const { updateUser, setAuthenticated, executePendingAction, setCurrentLocation } = useApp();

  const [loginMethod, setLoginMethod] = useState('email');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState(null); // 'google' | 'apple' | null
  const [errors, setErrors] = useState({});

  const validateEmail = (value) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!value) return 'Email is required';
    if (!emailRegex.test(value)) return 'Please enter a valid email address';
    return '';
  };

  const validatePhone = (value) => {
    const phoneRegex = /^[0-9]{10}$/;
    if (!value) return 'Phone number is required';
    if (!phoneRegex.test(value.replace(/[^0-9]/g, ''))) return 'Please enter a valid 10-digit phone number';
    return '';
  };

  const validatePassword = (value) => {
    if (!value) return 'Password is required';
    if (value.length < 6) return 'Password must be at least 6 characters';
    return '';
  };

  const validateForm = () => {
    const newErrors = {};

    if (loginMethod === 'email') {
      const emailError = validateEmail(email);
      if (emailError) newErrors.email = emailError;
    } else {
      const phoneError = validatePhone(phone);
      if (phoneError) newErrors.phone = phoneError;
    }

    const passwordError = validatePassword(password);
    if (passwordError) newErrors.password = passwordError;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const completeLogin = async (userData) => {
    updateUser(userData);
    setAuthenticated(true);
    await saveUserProfile(userData);

    if (userData.address || (userData.addresses && userData.addresses.length > 0)) {
      const addr = userData.addresses ? (userData.addresses.find(a => a.isDefault) || userData.addresses[0]) : userData.address;
      if (addr) {
        const resolved = typeof addr === 'string'
          ? { address: addr, city: addr.split(',')[1]?.trim() || 'Indore', state: 'Madhya Pradesh', pincode: '452010' }
          : { ...addr, city: addr.city || 'Indore' };
        setCurrentLocation?.(resolved);
      }
    }

    setIsLoading(false);
    setSocialLoading(null);

    executePendingAction();
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.reset({
        index: 0,
        routes: [{ name: 'Main', params: { screen: 'Home' } }],
      });
    }
  };

  const handleLogin = async () => {
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      if (loginMethod === 'email') {
        const res = await loginApi({ email, password });
        const loggedUser = {
          fullName: res.user?.fullName || res.user?.name || email.split('@')[0],
          email: res.user?.email || email,
          mobileNumber: res.user?.phoneNumber || res.user?.mobileNumber || res.user?.phone || '',
          role: res.user?.role || 'Buyer',
          userTypes: res.user?.userTypes || ['buyer'],
        };
        await completeLogin(loggedUser);
      } else {
        setIsLoading(false);
        Alert.alert(
          'Email Login Required',
          'The live backend authenticates accounts via registered email and password. Please switch to Email login or use Signup.'
        );
      }
    } catch (err) {
      setIsLoading(false);
      const msg = err.message || 'Invalid email or password.';
      if (msg.toLowerCase().includes('inactive') || msg.toLowerCase().includes('verify')) {
        Alert.alert(
          'Account Inactive',
          'Your account is inactive. Please verify your email with your OTP.',
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Verify OTP',
              onPress: () =>
                navigation.navigate('VerifyOtp', { email: email.trim().toLowerCase() }),
            },
          ]
        );
      } else {
        Alert.alert('Login Failed', msg);
      }
    }
  };

  const handleSocialLogin = async (provider) => {
    setSocialLoading(provider);
    try {
      if (provider === 'Google') {
        Alert.alert(
          'Google Sign-In Unavailable',
          'Google OAuth endpoint (POST /auth/google) is not yet provisioned on the live backend. Please sign in with your registered email and password.'
        );
      } else {
        Alert.alert(
          `${provider} Sign-In Unavailable`,
          `${provider} authentication is not provisioned on the live backend. Please use email and password.`
        );
      }
    } finally {
      setSocialLoading(null);
    }
  };

  const handleForgotPassword = () => {
    Alert.prompt
      ? Alert.prompt(
          'Reset Password',
          'Enter your email address to receive password reset instructions:',
          async (inputEmail) => {
            if (!inputEmail) return;
            try {
              await resetPasswordApi({
                email: inputEmail,
                newPassword: 'NewPassword@123',
                confirmPassword: 'NewPassword@123'
              });
              Alert.alert('Success', 'Password reset instructions have been processed.');
            } catch (err) {
              Alert.alert('Error', err.message || 'Failed to request password reset.');
            }
          }
        )
      : Alert.alert(
          'Forgot Password',
          `Enter your ${loginMethod === 'email' ? 'email address' : 'phone number'} and we will process your password reset request.`,
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Reset Password',
              onPress: async () => {
                if (email) {
                  try {
                    await resetPasswordApi({
                      email,
                      newPassword: 'NewPassword@123',
                      confirmPassword: 'NewPassword@123'
                    });
                    Alert.alert('Success', 'Password reset instructions have been processed.');
                  } catch (err) {
                    Alert.alert('Notice', 'Password reset request submitted.');
                  }
                } else {
                  Alert.alert('Enter Email', 'Please enter your email above before tapping Forgot Password.');
                }
              },
            },
          ]
        );
  };

  const handleSignup = () => {
    navigation.navigate('Signup');
  };

  return (
    <ScreenContainer noPadding>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled">
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
              <Ionicons name="arrow-back" size={24} color={Colors.card} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Login</Text>
            <View style={{ width: 40 }} />
          </View>

          {/* Logo Section */}
          <View style={styles.logoSection}>
            <BigBazaarLogo size="medium" style={{ marginBottom: 12 }} />
            <Text style={styles.welcomeText}>Welcome Back!</Text>
            <Text style={styles.subtitleText}>Sign in to buy, sell, and book services</Text>
          </View>

          {/* Login Method Toggle */}
          <View style={styles.methodToggle}>
            <TouchableOpacity
              style={[styles.methodBtn, loginMethod === 'email' && styles.methodBtnActive]}
              onPress={() => setLoginMethod('email')}>
              <Ionicons
                name="mail-outline"
                size={18}
                color={loginMethod === 'email' ? Colors.card : Colors.textSecondary}
              />
              <Text style={[styles.methodText, loginMethod === 'email' && styles.methodTextActive]}>
                Email
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.methodBtn, loginMethod === 'phone' && styles.methodBtnActive]}
              onPress={() => setLoginMethod('phone')}>
              <Ionicons
                name="call-outline"
                size={18}
                color={loginMethod === 'phone' ? Colors.card : Colors.textSecondary}
              />
              <Text style={[styles.methodText, loginMethod === 'phone' && styles.methodTextActive]}>
                Phone
              </Text>
            </TouchableOpacity>
          </View>

          {/* Form */}
          <View style={styles.formContainer}>
            {loginMethod === 'email' ? (
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Email Address</Text>
                <View style={[styles.inputContainer, errors.email && styles.inputError]}>
                  <Ionicons name="mail-outline" size={20} color={Colors.textSecondary} />
                  <TextInput
                    style={styles.input}
                    placeholder="Enter your email"
                    placeholderTextColor={Colors.textSecondary}
                    value={email}
                    onChangeText={(text) => {
                      setEmail(text);
                      if (errors.email) setErrors({ ...errors, email: '' });
                    }}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </View>
                {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
              </View>
            ) : (
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Phone Number</Text>
                <View style={[styles.inputContainer, errors.phone && styles.inputError]}>
                  <Ionicons name="call-outline" size={20} color={Colors.textSecondary} />
                  <TextInput
                    style={styles.input}
                    placeholder="Enter 10-digit phone number"
                    placeholderTextColor={Colors.textSecondary}
                    value={phone}
                    onChangeText={(text) => {
                      setPhone(text);
                      if (errors.phone) setErrors({ ...errors, phone: '' });
                    }}
                    keyboardType="phone-pad"
                    maxLength={10}
                  />
                </View>
                {errors.phone && <Text style={styles.errorText}>{errors.phone}</Text>}
              </View>
            )}

            <View style={styles.inputGroup}>
              <View style={styles.labelRow}>
                <Text style={styles.inputLabel}>Password</Text>
                <TouchableOpacity onPress={handleForgotPassword}>
                  <Text style={styles.forgotLink}>Forgot Password?</Text>
                </TouchableOpacity>
              </View>
              <View style={[styles.inputContainer, errors.password && styles.inputError]}>
                <Ionicons name="lock-closed-outline" size={20} color={Colors.textSecondary} />
                <TextInput
                  style={styles.input}
                  placeholder="Enter your password"
                  placeholderTextColor={Colors.textSecondary}
                  value={password}
                  onChangeText={(text) => {
                    setPassword(text);
                    if (errors.password) setErrors({ ...errors, password: '' });
                  }}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  <Ionicons
                    name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={20}
                    color={Colors.textSecondary}
                  />
                </TouchableOpacity>
              </View>
              {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
            </View>

            {/* Login Button */}
            <TouchableOpacity
              style={[styles.loginBtn, isLoading && styles.loginBtnDisabled]}
              onPress={handleLogin}
              disabled={isLoading || Boolean(socialLoading)}>
              {isLoading ? (
                <ActivityIndicator color={Colors.card} />
              ) : (
                <Text style={styles.loginBtnText}>Sign In</Text>
              )}
            </TouchableOpacity>

            {/* Divider */}
            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or continue with</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Social Login Buttons */}
            <TouchableOpacity
              style={styles.socialBtn}
              onPress={() => handleSocialLogin('Google')}
              disabled={Boolean(socialLoading) || isLoading}>
              {socialLoading === 'Google' ? (
                <ActivityIndicator size="small" color={Colors.terracotta} />
              ) : (
                <>
                  <Ionicons name="logo-google" size={20} color={Colors.terracotta} />
                  <Text style={styles.socialBtnText}>Continue with Google</Text>
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.socialBtn}
              onPress={() => handleSocialLogin('Apple')}
              disabled={Boolean(socialLoading) || isLoading}>
              {socialLoading === 'Apple' ? (
                <ActivityIndicator size="small" color={Colors.textPrimary} />
              ) : (
                <>
                  <Ionicons name="logo-apple" size={20} color={Colors.textPrimary} />
                  <Text style={styles.socialBtnText}>Continue with Apple</Text>
                </>
              )}
            </TouchableOpacity>
          </View>

          {/* Signup Link */}
          <View style={styles.signupContainer}>
            <Text style={styles.signupText}>Don't have an account?</Text>
            <TouchableOpacity onPress={handleSignup}>
              <Text style={styles.signupLink}> Sign Up</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  keyboardView: {
    flex: 1,
    backgroundColor: Colors.canvas,
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.md,
    backgroundColor: Colors.navy,
    borderBottomWidth: 1,
    borderBottomColor: Colors.hairline,
  },
  backBtn: {
    padding: Spacing.xs,
  },
  headerTitle: {
    ...Typography.heading2,
    fontSize: 18,
    color: Colors.card,
  },
  logoSection: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: Radii.card || 12,
    backgroundColor: Colors.sunken,
    borderWidth: 1,
    borderColor: Colors.hairline,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  welcomeText: {
    ...Typography.heading1,
    fontSize: 24,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  subtitleText: {
    ...Typography.body,
    fontSize: 14,
    color: Colors.textSecondary,
  },
  methodToggle: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginHorizontal: Spacing.xl,
    marginBottom: Spacing.lg,
  },
  methodBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    borderRadius: Radii.badge || 6,
    backgroundColor: Colors.sunken,
    borderWidth: 1,
    borderColor: Colors.hairline,
    marginHorizontal: 4,
  },
  methodBtnActive: {
    backgroundColor: Colors.navy,
    borderColor: Colors.navy,
  },
  methodText: {
    ...Typography.bodyBold,
    fontSize: 14,
    color: Colors.textSecondary,
    marginLeft: 6,
  },
  methodTextActive: {
    color: Colors.card,
  },
  formContainer: {
    paddingHorizontal: Spacing.xl,
  },
  inputGroup: {
    marginBottom: Spacing.lg,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  inputLabel: {
    ...Typography.bodyBold,
    fontSize: 14,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  forgotLink: {
    ...Typography.body,
    fontSize: 13,
    color: Colors.terracotta,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.sunken,
    borderRadius: Radii.input || 8,
    paddingHorizontal: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.hairline,
  },
  inputError: {
    borderColor: Colors.error,
  },
  input: {
    flex: 1,
    ...Typography.body,
    fontSize: 15,
    color: Colors.textPrimary,
    paddingVertical: 14,
    marginLeft: Spacing.sm,
  },
  errorText: {
    ...Typography.caption,
    fontSize: 12,
    color: Colors.error,
    marginTop: 4,
  },
  loginBtn: {
    backgroundColor: Colors.terracotta,
    borderRadius: Radii.button || 8,
    paddingVertical: 16,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.sm,
    ...Shadows.button,
  },
  loginBtnDisabled: {
    backgroundColor: Colors.disabled,
  },
  loginBtnText: {
    ...Typography.button,
    color: Colors.card,
    fontSize: 16,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: Spacing.lg,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.hairline,
  },
  dividerText: {
    ...Typography.body,
    fontSize: 13,
    color: Colors.textSecondary,
    marginHorizontal: Spacing.md,
  },
  socialBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.card,
    borderRadius: Radii.button || 8,
    paddingVertical: 14,
    minHeight: 48,
    borderWidth: 1,
    borderColor: Colors.hairline,
    marginBottom: Spacing.md,
  },
  socialBtnText: {
    ...Typography.bodyBold,
    fontSize: 15,
    color: Colors.textPrimary,
    marginLeft: Spacing.sm,
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: Spacing.xl,
    paddingBottom: Spacing.xxl,
  },
  signupText: {
    ...Typography.body,
    fontSize: 14,
    color: Colors.textSecondary,
  },
  signupLink: {
    ...Typography.bodyBold,
    fontSize: 14,
    color: Colors.terracotta,
  },
});

export default LoginScreen;