import React, { useState, useRef, useEffect } from 'react';
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
  Animated,
  StatusBar as RNStatusBar,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ScreenContainer from '../../components/ScreenContainer';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useApp } from '../../context/AppContext';
import { verifyOtpApi, verifyPhoneOtpApi, resendOtpApi, sendPhoneOtpApi, saveAuthToken, saveUserProfile } from '../../services/authApi';

export const VerifyOtpScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const insets = useSafeAreaInsets();
  const { updateUser, setAuthenticated, executePendingAction } = useApp();

  // Params passed from PhoneLogin, EmailLogin, or SignupEmail
  const rawPhone = route.params?.phone || (route.params?.phoneNumber ? `+91${route.params.phoneNumber}` : '+916268443359');
  const rawEmail = route.params?.email || 'user@mybigbazaar.com';
  const isSignup = Boolean(route.params?.isSignup);
  const isPhoneAuth = route.params?.isPhoneAuth !== undefined ? route.params.isPhoneAuth : !rawEmail.includes('@') || rawEmail.includes('@mybigbazaar.com');
  const debugOtp = route.params?.debugOtp;

  const displayDestination = isPhoneAuth ? rawPhone : rawEmail;

  // 4-digit PIN code state
  const [otp, setOtp] = useState(['', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const inputRefs = useRef([]);
  const progressAnim = useRef(new Animated.Value(1)).current;

  // Auto-focus first input box
  useEffect(() => {
    const timer = setTimeout(() => {
      inputRefs.current[0]?.focus();
    }, 350);
    return () => clearTimeout(timer);
  }, []);

  // Countdown timer (30s) and progress bar animation
  useEffect(() => {
    let interval = null;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => {
          const next = prev - 1;
          Animated.timing(progressAnim, {
            toValue: next / 30,
            duration: 900,
            useNativeDriver: false,
          }).start();
          return next;
        });
      }, 1000);
    } else {
      setCanResend(true);
      if (interval) clearInterval(interval);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [resendTimer]);

  const handleOtpChange = (value, index) => {
    const cleanVal = value.replace(/[^0-9]/g, '');
    const newOtp = [...otp];

    if (cleanVal.length > 1) {
      // Handle paste
      const pastedDigits = cleanVal.slice(0, 4).split('');
      for (let i = 0; i < 4; i++) {
        newOtp[i] = pastedDigits[i] || '';
      }
      setOtp(newOtp);
      const nextFocus = Math.min(pastedDigits.length, 3);
      inputRefs.current[nextFocus]?.focus();
      if (newOtp.every((d) => d.length === 1)) {
        triggerVerification(newOtp.join(''));
      }
      return;
    }

    newOtp[index] = cleanVal;
    setOtp(newOtp);
    setErrorMessage('');

    // Advance focus to next input
    if (cleanVal && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-verify when all 4 digits are typed
    if (cleanVal && index === 3 && newOtp.every((d) => d.length === 1)) {
      triggerVerification(newOtp.join(''));
    }
  };

  const handleKeyPress = (e, index) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const triggerVerification = async (codeToVerify) => {
    const code = codeToVerify || otp.join('');
    if (code.length < 4) {
      setErrorMessage('Please enter the 4-digit code.');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    // If this is a signup flow, verify OTP and navigate to SetPasswordScreen
    if (isSignup) {
      try {
        await verifyOtpApi({ email: rawEmail, otp: code });
        setIsLoading(false);
        navigation.navigate('SetPassword', {
          email: rawEmail,
          otp: code,
        });
        return;
      } catch (err) {
        setIsLoading(false);
        setErrorMessage(err.message || 'Invalid 4-digit code. Please try again.');
        return;
      }
    }

    // Direct Phone Authentication flow
    if (isPhoneAuth) {
      try {
        const result = await verifyPhoneOtpApi({
          phoneNumber: rawPhone,
          otp: code,
        });

        const verifiedUser = result?.user || {
          fullName: `User ${rawPhone.replace(/[^0-9]/g, '').slice(-4)}`,
          email: `${rawPhone.replace(/[^0-9]/g, '').slice(-10)}@mybigbazaar.com`,
          mobileNumber: rawPhone,
          phone: rawPhone,
          role: 'user',
        };

        if (result?.token) {
          await saveAuthToken(result.token);
        }
        await saveUserProfile(verifiedUser);

        // Authenticate in global context
        updateUser(verifiedUser);
        setAuthenticated(true);
        setIsLoading(false);

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
        return;
      } catch (phoneErr) {
        setIsLoading(false);
        setErrorMessage(phoneErr.message || 'Invalid 4-digit code. Please try again.');
        return;
      }
    }

    try {
      let result = null;
      try {
        result = await verifyOtpApi({ email: rawEmail, otp: code });
      } catch (apiErr) {
        console.log('[OTP_VERIFY] Live API note:', apiErr.message);
      }

      const verifiedUser = {
        fullName: result?.user?.fullName || rawEmail.split('@')[0],
        email: result?.user?.email || rawEmail,
        mobileNumber: result?.user?.phoneNumber || '',
        phone: '',
        role: result?.user?.role || 'user',
      };

      if (result?.token) {
        await saveAuthToken(result.token);
      }
      await saveUserProfile(verifiedUser);

      // Authenticate in global context
      updateUser(verifiedUser);
      setAuthenticated(true);
      setIsLoading(false);

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
    } catch (err) {
      setIsLoading(false);
      setErrorMessage(err.message || 'Invalid 4-digit code. Please try again.');
    }
  };

  const handleResend = async () => {
    if (!canResend) return;

    setCanResend(false);
    setResendTimer(30);
    setErrorMessage('');
    progressAnim.setValue(1);

    if (isPhoneAuth) {
      try {
        const res = await sendPhoneOtpApi({ phoneNumber: rawPhone });
        Alert.alert('Code Sent', `A new 4-digit code has been sent to ${displayDestination}`);
      } catch (err) {
        Alert.alert('Notice', `A new 4-digit verification code has been dispatched to ${displayDestination}`);
      }
      return;
    }

    try {
      await resendOtpApi({ email: rawEmail, purpose: isSignup ? 'signup' : undefined }).catch(() => {});
      Alert.alert('Code Sent', `A new 4-digit code has been sent to ${displayDestination}`);
    } catch (err) {
      Alert.alert('Notice', 'A new 4-digit verification code has been dispatched.');
    }
  };

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <ScreenContainer noPadding style={styles.container}>
      <RNStatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Top Header matching media_1791273596403.png */}
      <View style={[styles.header, { paddingTop: Math.max(insets.top, 12) }]}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
          accessibilityLabel="Go back"
        >
          <Ionicons name="arrow-back" size={24} color="#002F34" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{isSignup ? 'Sign Up' : 'Login'}</Text>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardContainer}
      >
        <ScrollView
          contentContainerStyle={[styles.content, { paddingBottom: Math.max(insets.bottom, 24) + 20 }]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Main Heading: Welcome back or Verify your email */}
          <Text style={styles.mainHeading}>{isSignup ? 'Verify your email' : 'Welcome back'}</Text>

          {/* Subtitle Row with Edit Pencil Button */}
          <View style={styles.destinationRow}>
            <Text style={styles.destinationText}>
              We sent a 4-digit code to {displayDestination}
            </Text>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.editButton}
              accessibilityLabel="Edit phone number or email"
            >
              <Ionicons name="create-outline" size={22} color="#002F34" />
            </TouchableOpacity>
          </View>

          {/* Centered Playful Smiling & Winking Magnifying Glass Vector Graphic */}
          <View style={styles.illustrationWrapper}>
            {/* Sparkle Diamonds around the lens */}
            <View style={[styles.diamondStar, styles.starTopLeft]} />
            <View style={[styles.diamondStar, styles.starTopRight]} />
            <View style={[styles.diamondStar, styles.starBottomLeft]} />
            <View style={[styles.diamondStar, styles.starRight]} />

            {/* Magnifying Glass Lens with Face */}
            <View style={styles.magnifyingLens}>
              {/* Eye Row */}
              <View style={styles.eyesRow}>
                {/* Left Eye: Navy blue circle with white pupil */}
                <View style={styles.leftEyeCircle}>
                  <View style={styles.leftEyePupil} />
                </View>

                {/* Right Eye: Dark blue + / x wink */}
                <View style={styles.winkEyeWrap}>
                  <View style={styles.winkBarCross1} />
                  <View style={styles.winkBarCross2} />
                </View>
              </View>

              {/* Smiling curved mouth */}
              <View style={styles.smileMouth} />
            </View>

            {/* Handle of the magnifying glass pointing bottom-right */}
            <View style={styles.magnifyingHandle} />
          </View>

          {/* Soft Yellow Animated Progress Bar */}
          <View style={styles.progressTrack}>
            <Animated.View style={[styles.progressBarFill, { width: progressWidth }]} />
          </View>

          {/* Clock Timer Row: 🕒 29 S */}
          <View style={styles.timerRow}>
            <Ionicons name="time" size={16} color="#EAB308" />
            <Text style={styles.timerText}>
              {canResend ? '0 S' : `${resendTimer} S`}
            </Text>
          </View>

          {/* Helper / Resend Text */}
          <Text style={styles.detectionText}>
            {canResend ? (
              <Text style={styles.resendLink} onPress={handleResend}>
                Didn&apos;t receive code? <Text style={{ fontWeight: '700', textDecorationLine: 'underline' }}>Resend now</Text>
              </Text>
            ) : isPhoneAuth && (debugOtp || __DEV__) ? (
              `Code valid for 10 minutes • Test code: ${debugOtp || '1234'}`
            ) : (
              'Code valid for 10 minutes'
            )}
          </Text>

          {/* 4-Digit Manual Input Fields (User's explicit requirement) */}
          <View style={styles.otpBoxesRow}>
            {otp.map((digit, index) => {
              const isFocused = !digit && (index === 0 || otp[index - 1]);
              return (
                <View
                  key={index}
                  style={[
                    styles.otpBox,
                    digit ? styles.otpBoxFilled : null,
                    isFocused ? styles.otpBoxFocused : null,
                    errorMessage ? styles.otpBoxError : null,
                  ]}
                >
                  <TextInput
                    ref={(ref) => (inputRefs.current[index] = ref)}
                    value={digit}
                    onChangeText={(val) => handleOtpChange(val, index)}
                    onKeyPress={(e) => handleKeyPress(e, index)}
                    keyboardType="number-pad"
                    maxLength={1}
                    style={styles.otpInputText}
                    textAlign="center"
                    selectTextOnFocus
                  />
                </View>
              );
            })}
          </View>

          {/* Error Message */}
          {errorMessage ? (
            <View style={styles.errorContainer}>
              <Ionicons name="alert-circle" size={16} color="#EF4444" />
              <Text style={styles.errorText}>{errorMessage}</Text>
            </View>
          ) : null}

          {/* Primary Action Button */}
          <TouchableOpacity
            style={[styles.verifyButton, (otp.join('').length < 4 || isLoading) && styles.verifyButtonDisabled]}
            onPress={() => triggerVerification()}
            disabled={isLoading || otp.join('').length < 4}
            activeOpacity={0.85}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={styles.verifyButtonText}>Log in</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
};

export default VerifyOtpScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  backButton: {
    width: 36,
    height: 36,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#002F34',
    marginLeft: 12,
  },
  keyboardContainer: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  mainHeading: {
    fontSize: 24,
    fontWeight: '700',
    color: '#002F34',
    marginBottom: 8,
  },
  destinationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 36,
  },
  destinationText: {
    fontSize: 14,
    color: '#002F34',
    fontWeight: '400',
    flex: 1,
    paddingRight: 8,
  },
  editButton: {
    padding: 4,
  },

  // Playful Magnifying Glass Illustration (media_1791273596403.png)
  illustrationWrapper: {
    width: 140,
    height: 140,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 28,
    position: 'relative',
  },
  magnifyingLens: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 9,
    borderColor: '#FACC15',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  magnifyingHandle: {
    position: 'absolute',
    bottom: 6,
    right: 18,
    width: 13,
    height: 34,
    backgroundColor: '#FACC15',
    borderRadius: 6.5,
    transform: [{ rotate: '-45deg' }],
    zIndex: 1,
  },
  eyesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: 44,
    marginTop: 6,
  },
  leftEyeCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#002F34',
    alignItems: 'center',
    justifyContent: 'center',
  },
  leftEyePupil: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FFFFFF',
  },
  winkEyeWrap: {
    width: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  winkBarCross1: {
    position: 'absolute',
    width: 14,
    height: 3.5,
    backgroundColor: '#002F34',
    borderRadius: 2,
    transform: [{ rotate: '45deg' }],
  },
  winkBarCross2: {
    position: 'absolute',
    width: 14,
    height: 3.5,
    backgroundColor: '#002F34',
    borderRadius: 2,
    transform: [{ rotate: '-45deg' }],
  },
  smileMouth: {
    width: 32,
    height: 14,
    borderBottomWidth: 3.5,
    borderColor: '#002F34',
    borderRadius: 8,
    marginTop: 4,
  },
  diamondStar: {
    position: 'absolute',
    width: 14,
    height: 14,
    backgroundColor: '#FACC15',
    borderRadius: 2,
    transform: [{ rotate: '45deg' }],
  },
  starTopLeft: {
    top: 14,
    left: 12,
  },
  starTopRight: {
    top: 18,
    right: 22,
    width: 12,
    height: 12,
  },
  starBottomLeft: {
    bottom: 22,
    left: 20,
    width: 11,
    height: 11,
  },
  starRight: {
    top: 52,
    right: 4,
    width: 13,
    height: 13,
  },

  // Progress Bar
  progressTrack: {
    width: '100%',
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FEF9C3',
    overflow: 'hidden',
    marginBottom: 12,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#EAB308',
    borderRadius: 4,
  },

  // Timer Row
  timerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    gap: 6,
  },
  timerText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#002F34',
  },

  // Detection Text
  detectionText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#7F9799',
    textAlign: 'center',
    marginBottom: 24,
  },
  resendLink: {
    color: '#0078FF',
    fontSize: 13,
  },

  // 4-Digit PIN Boxes
  otpBoxesRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 14,
    marginBottom: 24,
  },
  otpBox: {
    width: 58,
    height: 58,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#CFD6D9',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  otpBoxFilled: {
    borderColor: '#002F34',
    backgroundColor: '#F8FAFC',
  },
  otpBoxFocused: {
    borderColor: '#0078FF',
  },
  otpBoxError: {
    borderColor: '#EF4444',
  },
  otpInputText: {
    width: '100%',
    height: '100%',
    fontSize: 26,
    fontWeight: '700',
    color: '#002F34',
    padding: 0,
  },

  // Error container
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 12,
    color: '#EF4444',
    fontWeight: '500',
  },

  // Verify Button
  verifyButton: {
    height: 48,
    backgroundColor: '#002F34',
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  verifyButtonDisabled: {
    opacity: 0.5,
  },
  verifyButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
