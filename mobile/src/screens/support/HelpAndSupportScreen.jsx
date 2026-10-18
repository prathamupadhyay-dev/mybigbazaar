import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Share,
  Linking,
  Platform,
  StatusBar as RNStatusBar,
} from 'react-native';
import { StatusBar as ExpoStatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

export default function HelpAndSupportScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  // 1. Open Help Center & Legal screen
  const handleHelpCenter = () => {
    navigation.navigate('HelpCenterLegal');
  };

  // 2. Open native Play Store intent directly (renders native "Open with: Google Play Store" sheet)
  const handleRateUs = () => {
    const marketUrl =
      Platform.OS === 'ios'
        ? 'itms-apps://itunes.apple.com/app/idcom.raidening.mybigbazzar'
        : 'market://details?id=com.raidening.mybigbazzar';

    const webFallbackUrl = 'https://play.google.com/store/apps/details?id=com.raidening.mybigbazzar';

    Linking.openURL(marketUrl).catch(() => {
      Linking.openURL(webFallbackUrl).catch(() => {});
    });
  };

  // 3. Open native system Share text sheet with exact viral referral copy
  const handleInviteFriends = async () => {
    try {
      await Share.share({
        message:
          "I'm using MyBigBazaar, buying and selling there is much easier: https://mybigbazaar.com/share/?os=android",
      });
    } catch (e) {
      console.log('Error sharing:', e);
    }
  };

  return (
    <View style={styles.container}>
      {/* Deep Navy Blue Status Bar (#00356B) */}
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
          <Text style={styles.headerTitle}>Help & Support</Text>
        </View>
      </View>

      {/* Support Options List */}
      <ScrollView
        contentContainerStyle={[
          styles.listContainer,
          { paddingBottom: Math.max(insets.bottom, 16) + 24 },
        ]}
      >
        {/* 1. Help Center */}
        <TouchableOpacity
          style={styles.row}
          onPress={handleHelpCenter}
          activeOpacity={0.7}
        >
          <View style={styles.textContainer}>
            <Text style={styles.rowTitle}>Help Center</Text>
            <Text style={styles.rowSubtitle}>See FAQ and contact support</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#002F34" />
        </TouchableOpacity>

        {/* 2. Rate us */}
        <TouchableOpacity
          style={styles.row}
          onPress={handleRateUs}
          activeOpacity={0.7}
        >
          <View style={styles.textContainer}>
            <Text style={styles.rowTitle}>Rate us</Text>
            <Text style={styles.rowSubtitle}>
              If you love our app, please take a moment to rate it
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#002F34" />
        </TouchableOpacity>

        {/* 3. Invite friends to MyBigBazaar */}
        <TouchableOpacity
          style={styles.row}
          onPress={handleInviteFriends}
          activeOpacity={0.7}
        >
          <View style={styles.textContainer}>
            <Text style={styles.rowTitle}>Invite friends to MyBigBazaar</Text>
            <Text style={styles.rowSubtitle}>Invite your friends to buy and sell</Text>
          </View>
        </TouchableOpacity>

        {/* 4. Version (Static info row, no chevron) */}
        <View style={styles.rowNoPress}>
          <View style={styles.textContainer}>
            <Text style={styles.rowTitle}>Version</Text>
            <Text style={styles.rowSubtitle}>1.0.0</Text>
          </View>
        </View>
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
  listContainer: {
    backgroundColor: '#FFFFFF',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 18,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },
  rowNoPress: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 18,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },
  textContainer: {
    flex: 1,
    paddingRight: 12,
  },
  rowTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#002F34',
  },
  rowSubtitle: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 4,
    lineHeight: 18,
  },
});
