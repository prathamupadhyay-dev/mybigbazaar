import React, { useEffect } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  StatusBar as RNStatusBar,
  Platform,
} from 'react-native';
import { StatusBar as ExpoStatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as NavigationBar from 'expo-navigation-bar';
import * as SplashScreenNative from 'expo-splash-screen';

export default function SplashScreen({ navigation }) {
  const insets = useSafeAreaInsets();

  useEffect(() => {
    // Hide native splash screen so this React Native view is immediately visible
    SplashScreenNative.hideAsync().catch(() => {});

    // Configure Android system navigation bar for seamless white canvas
    if (Platform.OS === 'android') {
      try {
        NavigationBar.setBackgroundColorAsync('#FFFFFF').catch(() => {});
        NavigationBar.setButtonStyleAsync('dark').catch(() => {});
      } catch (e) {
        // Fallback for non-supported runtimes
      }
    }

    // Smooth transition to Main tab navigator
    const timer = setTimeout(() => {
      navigation.replace('Main');
    }, 1800);

    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <View style={styles.container}>
      {/* Edge-to-Edge Status Bar Configuration - Apple clean dark-content */}
      <RNStatusBar
        barStyle="dark-content"
        backgroundColor="#FFFFFF"
        translucent={true}
      />
      <ExpoStatusBar
        style="dark"
        backgroundColor="#FFFFFF"
        translucent={true}
      />

      {/* Centered MyBigBazaar Logo - Full color on crisp shade of white */}
      <View style={styles.centerContainer}>
        <Image
          source={require('../../../assets/client-logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>

      {/* Bottom Tagline Text - Apple SF Pro subtle typography */}
      <View
        style={[
          styles.bottomContainer,
          { paddingBottom: Math.max(insets.bottom, 16) + 32 },
        ]}
      >
        <Text style={styles.tagline}>India’s leading marketplace</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  logo: {
    width: 220,
    height: 160,
  },
  bottomContainer: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tagline: {
    fontSize: 14,
    fontWeight: '500',
    color: '#8E8E93',
    letterSpacing: -0.2,
    textAlign: 'center',
  },
});
