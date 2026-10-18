import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  Modal,
  StatusBar
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '../../context/AppContext';
import ScreenContainer from '../../components/ScreenContainer';
import { clearAuthSession } from '../../services/authApi';

export const AccountScreen = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { user, isAuthenticated, logout } = useApp();

  const [eliteModal, setEliteModal] = useState(null); // 'buyer' | 'seller' | null

  const handleLogout = () => {
    Alert.alert('Log Out', 'Are you sure you want to log out of BigBazaar?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log Out',
        style: 'destructive',
        onPress: async () => {
          await logout();
          navigation.reset({ index: 0, routes: [{ name: 'Main' }] });
        },
      },
    ]);
  };

  const handleProfilePress = () => {
    if (!isAuthenticated) {
      navigation.navigate('Login');
    } else {
      navigation.navigate('EditProfile');
    }
  };

  // Display user's actual name / phone (NO "OLX User" per constraint)
  const displayName = isAuthenticated
    ? (user?.fullName || user?.name || (user?.mobileNumber ? `+91 ${user.mobileNumber}` : 'BigBazaar Member'))
    : 'Log In to Your Account';

  return (
    <ScreenContainer noPadding style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { paddingTop: Math.max(insets.top, 12), paddingBottom: 40 }]}
      >
        {/* Top Header Row: Brand Logo (NO OLX logo) */}
        <View style={styles.topLogoRow}>
          <Image
            source={require('../../../assets/client-logo-header.png')}
            style={styles.brandLogo}
            resizeMode="contain"
          />
        </View>

        {/* Title Row: "My Account" & "View & Edit Profile" link */}
        <View style={styles.titleRow}>
          <Text style={styles.headerTitle}>My Account</Text>
          <TouchableOpacity onPress={handleProfilePress} activeOpacity={0.7}>
            <Text style={styles.viewEditProfileText}>View & Edit Profile</Text>
          </TouchableOpacity>
        </View>

        {/* User Card: Gold/Yellow outlined box with circular avatar and actual user name (NO "OLX User") */}
        <TouchableOpacity
          style={styles.userCard}
          onPress={handleProfilePress}
          activeOpacity={0.85}
        >
          <View style={styles.avatarCircleWrap}>
            {user?.profileImage ? (
              <Image source={{ uri: user.profileImage }} style={styles.avatarImg} />
            ) : (
              <View style={styles.avatarDefault}>
                <Ionicons name="person" size={28} color="#0078FF" />
              </View>
            )}
          </View>

          <View style={styles.userInfoCol}>
            <Text style={styles.userNameText} numberOfLines={1}>
              {displayName}
            </Text>
            {isAuthenticated && user?.mobileNumber ? (
              <Text style={styles.userPhoneSubtext}>+91 {user.mobileNumber}</Text>
            ) : null}
          </View>
        </TouchableOpacity>

        {/* Menu Items List matching screenshot */}
        <View style={styles.menuList}>
          {/* 1. Buy Packages & My Orders */}
          <TouchableOpacity
            style={styles.menuRow}
            onPress={() => navigation.navigate('InvoicesAndBilling')}
            activeOpacity={0.7}
          >
            <View style={styles.menuIconWrap}>
              <Ionicons name="card-outline" size={22} color="#002F34" />
            </View>
            <View style={styles.menuTextWrap}>
              <Text style={styles.menuTitle}>Buy Packages & My Orders</Text>
              <Text style={styles.menuSubtitle}>Packages, orders, billing and invoices</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#002F34" />
          </TouchableOpacity>

          {/* 2. Wishlist */}
          <TouchableOpacity
            style={styles.menuRow}
            onPress={() => {
              if (!isAuthenticated) return navigation.navigate('PhoneLogin');
              navigation.navigate('Watchlist');
            }}
            activeOpacity={0.7}
          >
            <View style={styles.menuIconWrap}>
              <Ionicons name="heart-outline" size={22} color="#002F34" />
            </View>
            <View style={styles.menuTextWrap}>
              <Text style={styles.menuTitle}>Wishlist</Text>
              <Text style={styles.menuSubtitle}>View your liked items here</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#002F34" />
          </TouchableOpacity>

          {/* 3. Become an Elite Buyer (Highlighted Row) */}
          <TouchableOpacity
            style={[styles.menuRow, styles.highlightRow]}
            onPress={() => navigation.navigate('EliteBuyer')}
            activeOpacity={0.75}
          >
            <View style={styles.menuIconWrap}>
              <MaterialCommunityIcons name="card-account-phone-outline" size={22} color="#002F34" />
            </View>
            <View style={styles.menuTextWrap}>
              <Text style={styles.menuTitle}>
                Become an <Text style={styles.boldKeyword}>Elite Buyer</Text>
              </Text>
              <Text style={styles.menuSubtitle}>Call owners directly</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#002F34" />
          </TouchableOpacity>

          {/* 4. Become an Elite Seller (Highlighted Row, NO "New" icon per constraint) */}
          <TouchableOpacity
            style={[styles.menuRow, styles.highlightRow]}
            onPress={() => setEliteModal('seller')}
            activeOpacity={0.75}
          >
            <View style={styles.menuIconWrap}>
              <MaterialCommunityIcons name="card-account-phone-outline" size={22} color="#002F34" />
            </View>
            <View style={styles.menuTextWrap}>
              <Text style={styles.menuTitle}>
                Become an <Text style={styles.boldKeyword}>Elite Seller</Text>
              </Text>
              <Text style={styles.menuSubtitle}>Unlock direct calls from buyers</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#002F34" />
          </TouchableOpacity>

          {/* 5. Settings */}
          <TouchableOpacity
            style={styles.menuRow}
            onPress={() => {
              if (!isAuthenticated) return navigation.navigate('PhoneLogin');
              Alert.alert(
                'Account Settings',
                'Manage security, lock preferences, or sign out.',
                [
                  {
                    text: 'Security & App Lock',
                    onPress: () => navigation.navigate('SecuritySettings')
                  },
                  {
                    text: 'Log Out',
                    style: 'destructive',
                    onPress: handleLogout
                  },
                  { text: 'Cancel', style: 'cancel' }
                ]
              );
            }}
            activeOpacity={0.7}
          >
            <View style={styles.menuIconWrap}>
              <Ionicons name="settings-outline" size={22} color="#002F34" />
            </View>
            <View style={styles.menuTextWrap}>
              <Text style={styles.menuTitle}>Settings</Text>
              <Text style={styles.menuSubtitle}>Privacy and logout</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#002F34" />
          </TouchableOpacity>

          {/* 6. Help & Support */}
          <TouchableOpacity
            style={styles.menuRow}
            onPress={() => navigation.navigate('HelpAndSupport')}
            activeOpacity={0.7}
          >
            <View style={styles.menuIconWrap}>
              <Ionicons name="people-outline" size={22} color="#002F34" />
            </View>
            <View style={styles.menuTextWrap}>
              <Text style={styles.menuTitle}>Help & Support</Text>
              <Text style={styles.menuSubtitle}>Help center and legal terms</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#002F34" />
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Elite Modal Sheet */}
      {eliteModal && (
        <Modal
          visible={!!eliteModal}
          transparent
          animationType="fade"
          onRequestClose={() => setEliteModal(null)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <View style={styles.modalHeader}>
                <View style={styles.modalIconBadge}>
                  <MaterialCommunityIcons
                    name={eliteModal === 'buyer' ? 'shield-star' : 'star-shooting'}
                    size={28}
                    color="#0078FF"
                  />
                </View>
                <Text style={styles.modalTitle}>
                  {eliteModal === 'buyer' ? 'Elite Buyer Membership' : 'Elite Seller Membership'}
                </Text>
                <TouchableOpacity onPress={() => setEliteModal(null)} style={styles.closeBtn}>
                  <Ionicons name="close" size={20} color="#002F34" />
                </TouchableOpacity>
              </View>

              <Text style={styles.modalDescription}>
                {eliteModal === 'buyer'
                  ? 'Connect directly with verified owners without delay. Get instant direct phone numbers, verified badges, and priority chat.'
                  : 'Reach high-intent buyers across India. Receive direct inquiries, unlock boosted visibility, and get a verified merchant badge.'}
              </Text>

              <View style={styles.perksList}>
                <View style={styles.perkRow}>
                  <Ionicons name="checkmark-circle" size={18} color="#16A34A" />
                  <Text style={styles.perkText}>Direct verified calling privileges</Text>
                </View>
                <View style={styles.perkRow}>
                  <Ionicons name="checkmark-circle" size={18} color="#16A34A" />
                  <Text style={styles.perkText}>Priority customer support</Text>
                </View>
                <View style={styles.perkRow}>
                  <Ionicons name="checkmark-circle" size={18} color="#16A34A" />
                  <Text style={styles.perkText}>Exclusive membership badge</Text>
                </View>
              </View>

              <TouchableOpacity
                style={styles.modalPrimaryBtn}
                onPress={() => {
                  setEliteModal(null);
                  Alert.alert('Elite Membership', 'Your request has been received. Our team will contact you shortly.');
                }}
              >
                <Text style={styles.modalPrimaryBtnText}>Explore Plans</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}
    </ScreenContainer>
  );
};

export default AccountScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    backgroundColor: '#FFFFFF',
  },
  // Row 1: Brand Logo (App's actual logo, NOT OLX)
  topLogoRow: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 4,
    alignItems: 'flex-start',
  },
  brandLogo: {
    height: 34,
    width: 110,
  },
  // Row 2: "My Account" title & "View & Edit Profile" link
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 14,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#002F34',
  },
  viewEditProfileText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0078FF',
  },
  // Profile Box with Yellow/Gold Border
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 20,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#FBC02D',
    backgroundColor: '#FFFFFF',
  },
  avatarCircleWrap: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 1.5,
    borderColor: '#FBC02D',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EFF6FF',
    overflow: 'hidden',
    marginRight: 14,
  },
  avatarImg: {
    width: '100%',
    height: '100%',
  },
  avatarDefault: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  userInfoCol: {
    flex: 1,
  },
  userNameText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#002F34',
  },
  userPhoneSubtext: {
    fontSize: 12.5,
    color: '#64748B',
    marginTop: 2,
  },
  // Menu items list
  menuList: {
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    backgroundColor: '#FFFFFF',
  },
  highlightRow: {
    backgroundColor: '#F0F7FF',
  },
  menuIconWrap: {
    width: 32,
    alignItems: 'flex-start',
    justifyContent: 'center',
    marginRight: 10,
  },
  menuTextWrap: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#002F34',
  },
  boldKeyword: {
    fontWeight: '800',
  },
  menuSubtitle: {
    fontSize: 12.5,
    color: '#64748B',
    marginTop: 2,
  },
  // Elite Membership Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 22,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  modalIconBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
    color: '#002F34',
    marginLeft: 10,
  },
  closeBtn: {
    padding: 4,
  },
  modalDescription: {
    fontSize: 13,
    color: '#475569',
    lineHeight: 19,
    marginBottom: 16,
  },
  perksList: {
    gap: 8,
    marginBottom: 20,
  },
  perkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  perkText: {
    fontSize: 13,
    color: '#1E293B',
    fontWeight: '500',
  },
  modalPrimaryBtn: {
    backgroundColor: '#002F34',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalPrimaryBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
