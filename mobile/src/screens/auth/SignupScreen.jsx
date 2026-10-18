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
import { signupApi, googleLoginApi, saveAuthToken, saveUserProfile } from '../../services/authApi';
import BigBazaarLogo from '../../components/common/BigBazaarLogo';

export const SignupScreen = () => {
  const navigation = useNavigation();
  const { updateUser, setAuthenticated, executePendingAction } = useApp();

  const [accountType, setAccountType] = useState('buyer'); // 'buyer' | 'seller'
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState(null);
  const [errors, setErrors] = useState({});

  const validateFullName = (value) => {
    if (!value.trim()) return 'Full name is required';
    if (value.trim().length < 2) return 'Name must be at least 2 characters';
    return '';
  };

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
    if (!/[A-Z]/.test(value)) return 'Password must contain at least one uppercase letter';
    if (!/[0-9]/.test(value)) return 'Password must contain at least one number';
    return '';
  };

  const validateConfirmPassword = (value) => {
    if (!value) return 'Please confirm your password';
    if (value !== password) return 'Passwords do not match';
    return '';
  };

  const validateForm = () => {
    const newErrors = {};

    const nameError = validateFullName(fullName);
    if (nameError) newErrors.fullName = nameError;

    const emailError = validateEmail(email);
    if (emailError) newErrors.email = emailError;

    const phoneError = validatePhone(phone);
    if (phoneError) newErrors.phone = phoneError;

    const passwordError = validatePassword(password);
    if (passwordError) newErrors.password = passwordError;

    const confirmError = validateConfirmPassword(confirmPassword);
    if (confirmError) newErrors.confirmPassword = confirmError;

    if (!acceptTerms) {
      newErrors.terms = 'You must accept the Terms & Conditions';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignup = async () => {
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const res = await signupApi({
        fullName: fullName.trim(),
        email: email.trim().toLowerCase(),
        password,
        phoneNumber: phone.trim(),
        role: 'user',
        userTypes: [accountType],
        status: 'active',
      });

      setIsLoading(false);

      navigation.navigate('VerifyOtp', {
        email: email.trim().toLowerCase(),
        fullName: fullName.trim(),
        phoneNumber: phone.trim(),
        otp: res.otp,
      });
    } catch (error) {
      setIsLoading(false);
      Alert.alert(
        'Signup Error',
        error.message || 'Could not complete registration. Please try again.'
      );
    }
  };

  const handleSocialSignup = async (provider) => {
    setSocialLoading(provider);
    try {
      if (provider === 'Google') {
        Alert.alert(
          'Google Sign-Up Unavailable',
          'Google OAuth endpoint (POST /auth/google) is not yet provisioned on the live backend. Please register using your full name, email, and password.'
        );
      } else {
        Alert.alert(
          `${provider} Sign-Up Unavailable`,
          `${provider} authentication is not provisioned on the live backend. Please register with email and password.`
        );
      }
    } finally {
      setSocialLoading(null);
    }
  };

  const handleLogin = () => {
    navigation.navigate('Login');
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
            <Text style={styles.headerTitle}>Create Account</Text>
            <View style={{ width: 40 }} />
          </View>

          {/* Logo Section */}
          <View style={styles.logoSection}>
            <BigBazaarLogo size="medium" style={{ marginBottom: 12 }} />
            <Text style={styles.welcomeText}>Join BigBazaar!</Text>
            <Text style={styles.subtitleText}>Create an account to start shopping and booking</Text>
          </View>

          {/* Account Type Toggle */}
          <View style={styles.methodToggle}>
            <TouchableOpacity
              style={[styles.methodBtn, accountType === 'buyer' && styles.methodBtnActive]}
              onPress={() => setAccountType('buyer')}>
              <Ionicons
                name="cart-outline"
                size={18}
                color={accountType === 'buyer' ? Colors.card : Colors.textSecondary}
              />
              <Text style={[styles.methodText, accountType === 'buyer' && styles.methodTextActive]}>
                Buyer
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.methodBtn, accountType === 'seller' && styles.methodBtnActive]}
              onPress={() => setAccountType('seller')}>
              <Ionicons
                name="storefront-outline"
                size={18}
                color={accountType === 'seller' ? Colors.card : Colors.textSecondary}
              />
              <Text style={[styles.methodText, accountType === 'seller' && styles.methodTextActive]}>
                Seller / Provider
              </Text>
            </TouchableOpacity>
          </View>

          {/* Form */}
          <View style={styles.formContainer}>
            {/* Full Name */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Full Name</Text>
              <View style={[styles.inputContainer, errors.fullName && styles.inputError]}>
                <Ionicons name="person-outline" size={20} color={Colors.textSecondary} />
                <TextInput
                  style={styles.input}
                  placeholder="Enter your full name"
                  placeholderTextColor={Colors.textSecondary}
                  value={fullName}
                  onChangeText={(text) => {
                    setFullName(text);
                    if (errors.fullName) setErrors({ ...errors, fullName: '' });
                  }}
                  autoCapitalize="words"
                />
              </View>
              {errors.fullName && <Text style={styles.errorText}>{errors.fullName}</Text>}
            </View>

            {/* Email Address */}
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

            {/* Phone Number */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Phone Number</Text>
              <View style={[styles.inputContainer, errors.phone && styles.inputError]}>
                <Text style={styles.phoneCode}>+91</Text>
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

            {/* Password */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Password</Text>
              <View style={[styles.inputContainer, errors.password && styles.inputError]}>
                <Ionicons name="lock-closed-outline" size={20} color={Colors.textSecondary} />
                <TextInput
                  style={styles.input}
                  placeholder="Create a password"
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
              <Text style={styles.hintText}>At least 6 characters, including one uppercase and one number</Text>
            </View>

            {/* Confirm Password */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Confirm Password</Text>
              <View style={[styles.inputContainer, errors.confirmPassword && styles.inputError]}>
                <Ionicons name="lock-closed-outline" size={20} color={Colors.textSecondary} />
                <TextInput
                  style={styles.input}
                  placeholder="Re-enter your password"
                  placeholderTextColor={Colors.textSecondary}
                  value={confirmPassword}
                  onChangeText={(text) => {
                    setConfirmPassword(text);
                    if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: '' });
                  }}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                />
              </View>
              {errors.confirmPassword && <Text style={styles.errorText}>{errors.confirmPassword}</Text>}
            </View>

            {/* Terms Checkbox */}
            <TouchableOpacity
              style={styles.termsContainer}
              onPress={() => {
                setAcceptTerms(!acceptTerms);
                if (errors.terms) setErrors({ ...errors, terms: '' });
              }}>
              <View style={[styles.checkbox, acceptTerms && styles.checkboxChecked]}>
                {acceptTerms && <Ionicons name="checkmark" size={14} color={Colors.card} />}
              </View>
              <Text style={styles.termsText}>
                I agree to the <Text style={styles.termsLink}>Terms of Service</Text> and{' '}
                <Text style={styles.termsLink}>Privacy Policy</Text>
              </Text>
            </TouchableOpacity>
            {errors.terms && <Text style={styles.errorText}>{errors.terms}</Text>}

            {/* Signup Button */}
            <TouchableOpacity
              style={[styles.signupBtn, isLoading && styles.signupBtnDisabled]}
              onPress={handleSignup}
              disabled={isLoading || Boolean(socialLoading)}>
              {isLoading ? (
                <ActivityIndicator color={Colors.card} />
              ) : (
                <Text style={styles.signupBtnText}>Create Account</Text>
              )}
            </TouchableOpacity>

            {/* Divider */}
            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or continue with</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Social Signup */}
            <TouchableOpacity
              style={styles.socialBtn}
              onPress={() => handleSocialSignup('Google')}
              disabled={Boolean(socialLoading) || isLoading}>
              {socialLoading === 'Google' ? (
                <ActivityIndicator size="small" color={Colors.terracotta} />
              ) : (
                <>
                  <Ionicons name="logo-google" size={20} color={Colors.terracotta} />
                  <Text style={styles.socialBtnText}>Sign up with Google</Text>
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.socialBtn}
              onPress={() => handleSocialSignup('Apple')}
              disabled={Boolean(socialLoading) || isLoading}>
              {socialLoading === 'Apple' ? (
                <ActivityIndicator size="small" color={Colors.textPrimary} />
              ) : (
                <>
                  <Ionicons name="logo-apple" size={20} color={Colors.textPrimary} />
                  <Text style={styles.socialBtnText}>Sign up with Apple</Text>
                </>
              )}
            </TouchableOpacity>
          </View>

          {/* Login Link */}
          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>Already have an account?</Text>
            <TouchableOpacity onPress={handleLogin}>
              <Text style={styles.loginLink}> Sign In</Text>
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
    paddingVertical: Spacing.lg,
  },
  logoContainer: {
    width: 70,
    height: 70,
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
    fontSize: 22,
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
    marginBottom: Spacing.md,
  },
  inputLabel: {
    ...Typography.bodyBold,
    fontSize: 14,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
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
  phoneCode: {
    ...Typography.bodyBold,
    fontSize: 15,
    color: Colors.textSecondary,
  },
  errorText: {
    ...Typography.caption,
    fontSize: 12,
    color: Colors.error,
    marginTop: 4,
  },
  hintText: {
    ...Typography.caption,
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: Radii.badge || 6,
    borderWidth: 1,
    borderColor: Colors.hairline,
    backgroundColor: Colors.sunken,
    marginRight: Spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  checkboxChecked: {
    backgroundColor: Colors.terracotta,
    borderColor: Colors.terracotta,
  },
  termsText: {
    ...Typography.body,
    fontSize: 13,
    color: Colors.textSecondary,
    flex: 1,
    lineHeight: 20,
  },
  termsLink: {
    color: Colors.terracotta,
    fontWeight: '600',
  },
  signupBtn: {
    backgroundColor: Colors.terracotta,
    borderRadius: Radii.button || 8,
    paddingVertical: 16,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.sm,
    marginBottom: Spacing.lg,
    ...Shadows.button,
  },
  signupBtnDisabled: {
    backgroundColor: Colors.disabled,
  },
  signupBtnText: {
    ...Typography.button,
    color: Colors.card,
    fontSize: 16,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.lg,
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
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },
  loginText: {
    ...Typography.body,
    fontSize: 14,
    color: Colors.textSecondary,
  },
  loginLink: {
    ...Typography.bodyBold,
    fontSize: 14,
    color: Colors.terracotta,
  },
});

export default SignupScreen;