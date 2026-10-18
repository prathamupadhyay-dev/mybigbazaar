import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  StatusBar as RNStatusBar,
  Platform,
} from 'react-native';
import { StatusBar as ExpoStatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function AuthLandingScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  const handleClose = async () => {
    try {
      const hasLocation = await AsyncStorage.getItem('@has_selected_location');
      if (hasLocation === 'true') {
        if (navigation.canGoBack()) {
          navigation.goBack();
        } else {
          navigation.navigate('Main');
        }
      } else {
        navigation.navigate('LocationPrompt');
      }
    } catch (e) {
      navigation.navigate('LocationPrompt');
    }
  };

  const handleHelp = () => {
    navigation.navigate('HelpAndSupport');
  };

  const handleContinueWithPhone = () => {
    navigation.navigate('PhoneLogin');
  };

  const handleLoginWithEmail = () => {
    navigation.navigate('EmailLogin');
  };

  const handleSignup = () => {
    navigation.navigate('SignupMethod');
  };

  const handleOpenLegal = () => {
    navigation.navigate('HelpCenterLegal', { initialSection: 'legal' });
  };

  return (
    <View style={styles.container}>
      {/* Apple-style light status bar to match top canvas */}
      <RNStatusBar
        barStyle="dark-content"
        backgroundColor="#FFFFFF"
        translucent={false}
      />
      <ExpoStatusBar
        style="dark"
        backgroundColor="#FFFFFF"
        translucent={false}
      />

      {/* Top Section: Apple-clean spacious white canvas */}
      <View style={[styles.topSection, { paddingTop: Math.max(insets.top, 10) }]}>
        {/* Apple-style Navigation Header */}
        <View style={styles.topBar}>
          {/* Apple Borderless Close Button */}
          <TouchableOpacity
            onPress={handleClose}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            activeOpacity={0.5}
            style={styles.closeButton}
            accessibilityLabel="Close"
          >
            <Ionicons name="close" size={24} color="#1C1C1E" />
          </TouchableOpacity>

          {/* Apple Borderless Help Button */}
          <TouchableOpacity
            onPress={handleHelp}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            activeOpacity={0.5}
            style={styles.helpButton}
            accessibilityLabel="Help"
          >
            <Ionicons name="help-circle-outline" size={19} color="#1C1C1E" />
            <Text style={styles.helpText}>Help</Text>
          </TouchableOpacity>
        </View>

        {/* Hero Area: Brand Logo with Apple breathing room */}
        <View style={styles.logoContainer}>
          <Image
            source={require('../../../assets/client-logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>
      </View>

      {/* Bottom Action Sheet: Apple rounded card with refined tones & frosted surfaces */}
      <View
        style={[
          styles.bottomSection,
          { paddingBottom: Math.max(insets.bottom, 16) + 16 },
        ]}
      >
        {/* Apple Primary Action Button: "Continue with Phone" */}
        <TouchableOpacity
          onPress={handleContinueWithPhone}
          activeOpacity={0.88}
          style={styles.phoneButton}
        >
          <View style={styles.phoneIconWrap}>
            <Ionicons name="phone-portrait-outline" size={18} color="#004796" />
          </View>
          <Text style={styles.phoneButtonText}>Continue with Phone</Text>
        </TouchableOpacity>

        {/* Apple Hairline Divider: "OR" */}
        <View style={styles.orDividerRow}>
          <View style={styles.orHairline} />
          <Text style={styles.orBadge}>OR</Text>
          <View style={styles.orHairline} />
        </View>

        {/* Apple Secondary Action: Frosted Translucent "Login with Email" Button */}
        <TouchableOpacity
          onPress={handleLoginWithEmail}
          activeOpacity={0.82}
          style={styles.emailButton}
        >
          <Ionicons name="mail-outline" size={19} color="#FFFFFF" style={{ marginRight: 8 }} />
          <Text style={styles.emailButtonText}>Login with Email</Text>
        </TouchableOpacity>

        {/* Sign Up Link: Under Login with Email */}
        <TouchableOpacity
          onPress={handleSignup}
          activeOpacity={0.8}
          style={styles.signupButton}
        >
          <Text style={styles.signupButtonPrompt}>Don&apos;t have an account? </Text>
          <Text style={styles.signupButtonAction}>Sign Up</Text>
        </TouchableOpacity>

        {/* Apple Footnote: Legal Disclaimers with high clarity */}
        <View style={styles.legalContainer}>
          <Text style={styles.legalNotice}>
            If you continue, you are accepting
          </Text>
          <TouchableOpacity onPress={handleOpenLegal} activeOpacity={0.75} style={styles.legalLinkBtn}>
            <Text style={styles.legalLink}>
              MyBigBazaar Terms and Conditions and Privacy Policy
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  topSection: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    justifyContent: 'space-between',
  },
  topBar: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 6,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  closeButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },
  helpButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
    paddingHorizontal: 8,
    paddingVertical: 7.5,
  },
  helpText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1C1C1E',
    marginLeft: 4,
    letterSpacing: -0.2,
  },
  logoContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  logo: {
    width: 220,
    height: 140,
    maxWidth: '85%',
  },
  bottomSection: {
    backgroundColor: '#004796',
    paddingHorizontal: 22,
    paddingTop: 24,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    borderTopWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.16)',
    ...Platform.select({
      ios: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: -6 },
        shadowOpacity: 0.16,
        shadowRadius: 20,
      },
      android: {
        elevation: 10,
      },
    }),
  },
  phoneButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    height: 54,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.12,
        shadowRadius: 10,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  phoneIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#EDF4FC',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  phoneButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#004796',
    letterSpacing: -0.2,
  },
  orDividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 18,
    paddingHorizontal: 10,
  },
  orHairline: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(255, 255, 255, 0.28)',
  },
  orBadge: {
    color: 'rgba(255, 255, 255, 0.72)',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 1.2,
    marginHorizontal: 14,
    textTransform: 'uppercase',
  },
  emailButton: {
    height: 52,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.26)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 22,
  },
  emailButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: -0.2,
  },
  signupButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    marginBottom: 16,
  },
  signupButtonPrompt: {
    color: 'rgba(255, 255, 255, 0.85)',
    fontSize: 14,
    fontWeight: '500',
  },
  signupButtonAction: {
    color: '#FFB800',
    fontSize: 14,
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
  legalContainer: {
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  legalNotice: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.72)',
    textAlign: 'center',
    lineHeight: 16,
    letterSpacing: -0.1,
  },
  legalLinkBtn: {
    marginTop: 4,
    paddingVertical: 2,
  },
  legalLink: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '600',
    textDecorationLine: 'underline',
    textAlign: 'center',
    lineHeight: 18,
    letterSpacing: -0.1,
  },
});
