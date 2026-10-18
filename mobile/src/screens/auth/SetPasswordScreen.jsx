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
  ScrollView,
} from 'react-native';
import { StatusBar as ExpoStatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { signupApi } from '../../services/authApi';
import { useApp } from '../../context/AppContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function SetPasswordScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const insets = useSafeAreaInsets();
  const { updateUser, setAuthenticated, executePendingAction } = useApp();

  const email = (route.params?.email || '').trim().toLowerCase();
  const verifiedOtp = route.params?.otp || '';

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const isValidPassword = password.length >= 6;
  const isMatch = password === confirmPassword && confirmPassword.length > 0;
  const canSubmit = isValidPassword && isMatch && !isLoading;

  const handleRegister = async () => {
    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match. Please verify both fields.');
      return;
    }

    setErrorMessage('');
    setIsLoading(true);

    try {
      const result = await signupApi({
        email,
        password,
        fullName: email.split('@')[0],
      });

      if (result.user) {
        updateUser(result.user);
        setAuthenticated(true);
      }

      if (executePendingAction) {
        executePendingAction();
      }

      Alert.alert(
        'Welcome to MyBigBazaar!',
        'Your account has been registered successfully.',
        [
          {
            text: 'Get Started',
            onPress: async () => {
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
            },
          },
        ]
      );
    } catch (err) {
      setErrorMessage(err.message || 'Registration failed. Please try again.');
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
          <Text style={styles.headerTitle}>Create Password</Text>
        </View>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardContainer}
      >
        <ScrollView
          contentContainerStyle={[
            styles.content,
            { paddingBottom: Math.max(insets.bottom, 16) + 20 },
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
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
          <Text style={styles.heading}>Set your account password</Text>

          {/* Verified Email Banner */}
          <View style={styles.verifiedEmailRow}>
            <Ionicons name="checkmark-circle" size={18} color="#16A34A" />
            <Text style={styles.verifiedEmailText} numberOfLines={1}>
              {email}
            </Text>
            <View style={styles.verifiedBadge}>
              <Text style={styles.verifiedBadgeText}>Verified</Text>
            </View>
          </View>

          {/* New Password Field */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>New Password</Text>
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
                placeholder="At least 6 characters"
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

          {/* Confirm Password Field */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Confirm Password</Text>
            <View style={styles.passwordRow}>
              <TextInput
                value={confirmPassword}
                onChangeText={(val) => {
                  setConfirmPassword(val);
                  setErrorMessage('');
                }}
                secureTextEntry={!showConfirmPassword}
                autoCapitalize="none"
                placeholder="Re-enter password"
                placeholderTextColor="#94A3B8"
                style={styles.passwordInput}
              />
              <TouchableOpacity
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                style={styles.eyeIcon}
              >
                <Ionicons
                  name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={20}
                  color="#004796"
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Password Match Status Checklist */}
          <View style={styles.checklistWrap}>
            <View style={styles.checkItem}>
              <Ionicons
                name={isValidPassword ? 'checkmark-circle' : 'ellipse-outline'}
                size={16}
                color={isValidPassword ? '#16A34A' : '#94A3B8'}
              />
              <Text
                style={[
                  styles.checkText,
                  isValidPassword ? styles.checkTextActive : null,
                ]}
              >
                At least 6 characters
              </Text>
            </View>
            <View style={styles.checkItem}>
              <Ionicons
                name={isMatch ? 'checkmark-circle' : 'ellipse-outline'}
                size={16}
                color={isMatch ? '#16A34A' : '#94A3B8'}
              />
              <Text
                style={[
                  styles.checkText,
                  isMatch ? styles.checkTextActive : null,
                ]}
              >
                Passwords match
              </Text>
            </View>
          </View>

          {/* Error Message */}
          {errorMessage ? (
            <View style={styles.errorRow}>
              <Ionicons name="alert-circle-outline" size={16} color="#DC2626" />
              <Text style={styles.errorText}>{errorMessage}</Text>
            </View>
          ) : null}
        </ScrollView>

        {/* Bottom Sticky Footer */}
        <View
          style={[
            styles.footer,
            { paddingBottom: Math.max(insets.bottom, 16) + 12 },
          ]}
        >
          <TouchableOpacity
            onPress={handleRegister}
            disabled={!canSubmit}
            activeOpacity={0.8}
            style={[
              styles.submitButton,
              canSubmit ? styles.submitButtonActive : styles.submitButtonDisabled,
            ]}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={styles.submitButtonText}>Complete Registration</Text>
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
  verifiedEmailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#BBF7D0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginTop: 14,
    marginBottom: 8,
  },
  verifiedEmailText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    color: '#166534',
    marginLeft: 8,
  },
  verifiedBadge: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  verifiedBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#16A34A',
  },
  inputContainer: {
    marginTop: 20,
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
  checklistWrap: {
    marginTop: 16,
    gap: 8,
  },
  checkItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkText: {
    fontSize: 13,
    color: '#94A3B8',
    marginLeft: 8,
    fontWeight: '500',
  },
  checkTextActive: {
    color: '#16A34A',
    fontWeight: '600',
  },
  errorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  errorText: {
    fontSize: 13,
    color: '#DC2626',
    marginLeft: 6,
    fontWeight: '500',
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 16,
    backgroundColor: '#FFFFFF',
  },
  submitButton: {
    height: 48,
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  submitButtonDisabled: {
    backgroundColor: '#E0E0E0',
  },
  submitButtonActive: {
    backgroundColor: '#004796',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
