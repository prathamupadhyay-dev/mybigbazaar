import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  StatusBar as RNStatusBar,
  ScrollView,
} from 'react-native';
import { StatusBar as ExpoStatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';

export default function SignupMethodScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const insets = useSafeAreaInsets();

  const initialEmail = route.params?.email || '';

  const handleEmailSignup = () => {
    navigation.navigate('SignupEmail', { email: initialEmail });
  };

  const handlePhoneSignupLocked = () => {
    Alert.alert(
      'Coming Soon',
      'Mobile number registration is currently being updated. Please use Email to create your account.',
      [{ text: 'Use Email', onPress: handleEmailSignup }, { text: 'OK', style: 'cancel' }]
    );
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

      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: Math.max(insets.bottom, 16) + 20 },
        ]}
        showsVerticalScrollIndicator={false}
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
        <Text style={styles.heading}>Choose how to sign up</Text>
        <Text style={styles.subtitle}>
          Create your account to start buying and selling verified items across India.
        </Text>

        {/* Method 1: Email (Active) */}
        <TouchableOpacity
          onPress={handleEmailSignup}
          activeOpacity={0.8}
          style={styles.methodCardActive}
        >
          <View style={styles.methodIconWrapActive}>
            <Ionicons name="mail-outline" size={22} color="#004796" />
          </View>
          <View style={styles.methodTextCol}>
            <Text style={styles.methodTitleActive}>Sign up with Email</Text>
            <Text style={styles.methodSubActive}>
              Recommended &bull; Fast OTP verification
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#004796" />
        </TouchableOpacity>

        {/* Method 2: Phone (LOCKED per user instruction) */}
        <TouchableOpacity
          onPress={handlePhoneSignupLocked}
          activeOpacity={0.7}
          style={styles.methodCardLocked}
        >
          <View style={styles.methodIconWrapLocked}>
            <Ionicons name="phone-portrait-outline" size={22} color="#94A3B8" />
          </View>
          <View style={styles.methodTextCol}>
            <View style={styles.lockRow}>
              <Text style={styles.methodTitleLocked}>Sign up with Phone</Text>
              <View style={styles.lockBadge}>
                <Ionicons name="lock-closed" size={12} color="#64748B" style={{ marginRight: 3 }} />
                <Text style={styles.lockBadgeText}>Coming Soon</Text>
              </View>
            </View>
            <Text style={styles.methodSubLocked}>
              Currently locked &bull; Use email to sign up
            </Text>
          </View>
          <Ionicons name="lock-closed" size={18} color="#94A3B8" />
        </TouchableOpacity>

        {/* Informative Callout */}
        <View style={styles.calloutBox}>
          <Ionicons name="information-circle-outline" size={20} color="#004796" style={{ marginRight: 10, marginTop: 1 }} />
          <Text style={styles.calloutText}>
            You will receive a 4-digit code to verify your email, and then set your password.
          </Text>
        </View>

        {/* Bottom Link: Already have an account? Log In */}
        <TouchableOpacity
          onPress={handleLogin}
          activeOpacity={0.7}
          style={styles.loginLinkRow}
        >
          <Text style={styles.loginPrompt}>Already have an account? </Text>
          <Text style={styles.loginAction}>Log In</Text>
        </TouchableOpacity>
      </ScrollView>
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
    fontSize: 14,
    color: '#64748B',
    marginTop: 6,
    lineHeight: 20,
    marginBottom: 24,
  },
  methodCardActive: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F7FF',
    borderWidth: 1.5,
    borderColor: '#004796',
    borderRadius: 12,
    padding: 16,
    marginBottom: 14,
  },
  methodIconWrapActive: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#DBEAFE',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  methodTextCol: {
    flex: 1,
  },
  methodTitleActive: {
    fontSize: 16,
    fontWeight: '700',
    color: '#002F34',
  },
  methodSubActive: {
    fontSize: 12,
    color: '#004796',
    marginTop: 2,
    fontWeight: '500',
  },
  methodCardLocked: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    opacity: 0.85,
  },
  methodIconWrapLocked: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  lockRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
  },
  methodTitleLocked: {
    fontSize: 16,
    fontWeight: '600',
    color: '#64748B',
  },
  lockBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E2E8F0',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 10,
  },
  lockBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#475569',
  },
  methodSubLocked: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 2,
  },
  calloutBox: {
    backgroundColor: '#FDF9E8',
    borderRadius: 8,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 8,
  },
  calloutText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 19,
    color: '#004796',
    fontWeight: '400',
  },
  loginLinkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    marginTop: 24,
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
