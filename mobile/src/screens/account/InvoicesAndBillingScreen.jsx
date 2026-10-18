import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Modal,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ScreenContainer from '../../components/ScreenContainer';
import { useApp } from '../../context/AppContext';

// Seller promotion & visibility packages
const PROMO_PACKAGES = [
  {
    id: 'free',
    name: 'Free Basic',
    price: 0,
    badge: 'Standard',
    perks: [
      'Standard listing in city feed',
      'Active for 30 days',
      'Basic search visibility'
    ]
  },
  {
    id: 'featured',
    name: 'Featured Listing',
    price: 99,
    badge: '3X Reach',
    perks: [
      'Pinned atop category results',
      'Highlighted "Featured" badge',
      'Priority notifications to local buyers'
    ]
  },
  {
    id: 'urgent',
    name: 'Urgent Sale Package',
    price: 149,
    badge: 'Fast Sell',
    perks: [
      'Red "Urgent" flame ribbon on card',
      'Top placement across home & search',
      'Sell up to 5x faster'
    ]
  },
  {
    id: 'elite_seller',
    name: 'Elite Seller Pro',
    price: 499,
    badge: 'Elite Verified',
    perks: [
      'Direct incoming phone calls from buyers',
      'Verified Elite badge on profile',
      'Unlimited ad promotions for 30 days'
    ]
  }
];

export const InvoicesAndBillingScreen = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { user, isAuthenticated, currencySymbol = '₹' } = useApp();

  const [packagesModalVisible, setPackagesModalVisible] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState(null);

  const menuItems = [
    {
      id: 'buy_packages',
      title: 'Buy packages',
      subtitle: 'Sell faster, more & at higher margins with packages',
      onPress: () => {
        if (!isAuthenticated) return navigation.navigate('PhoneLogin');
        setPackagesModalVisible(true);
      }
    },
    {
      id: 'my_orders',
      title: 'My Orders',
      subtitle: 'Active, scheduled and expired orders',
      onPress: () => {
        if (!isAuthenticated) return navigation.navigate('PhoneLogin');
        navigation.navigate('OrderHistory');
      }
    },
    {
      id: 'invoices',
      title: 'Invoices',
      subtitle: 'See and download your invoices',
      onPress: () => {
        if (!isAuthenticated) return navigation.navigate('PhoneLogin');
        navigation.navigate('Receipts');
      }
    },
    {
      id: 'billing_info',
      title: 'Billing information',
      subtitle: 'Edit your billing name, address, etc.',
      onPress: () => {
        if (!isAuthenticated) return navigation.navigate('PhoneLogin');
        navigation.navigate('AddressManagement');
      }
    },
    {
      id: 'view_cart',
      title: 'View Cart',
      subtitle: 'Check out the items in your cart to purchase',
      onPress: () => {
        navigation.navigate('Bucket');
      }
    }
  ];

  const handleSelectPackage = (pkg) => {
    setSelectedPackage(pkg);
    Alert.alert(
      'Activate Package',
      `Would you like to activate the "${pkg.name}" for ${pkg.price === 0 ? 'Free' : `${currencySymbol}${pkg.price}`}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: () => {
            setPackagesModalVisible(false);
            Alert.alert(
              'Package Activated',
              `Your "${pkg.name}" is now active. New listings will receive priority visibility.`
            );
          }
        }
      ]
    );
  };

  return (
    <ScreenContainer noPadding style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Top Header matching exact screenshot */}
      <View style={[styles.header, { paddingTop: Math.max(insets.top, 12) }]}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
          activeOpacity={0.7}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Ionicons name="arrow-back" size={24} color="#002F34" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Invoices & Billing</Text>
      </View>

      <View style={styles.headerDivider} />

      {/* Menu Options List matching exact screenshot */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      >
        {menuItems.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={styles.menuRow}
            onPress={item.onPress}
            activeOpacity={0.7}
          >
            <View style={styles.textContainer}>
              <Text style={styles.itemTitle}>{item.title}</Text>
              <Text style={styles.itemSubtitle}>{item.subtitle}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#002F34" />
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Buy Packages Modal */}
      <Modal
        visible={packagesModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setPackagesModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Seller Growth Packages</Text>
                <Text style={styles.modalSub}>
                  Sell faster, more & at higher margins
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setPackagesModalVisible(false)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons name="close" size={24} color="#002F34" />
              </TouchableOpacity>
            </View>

            <ScrollView
              style={{ maxHeight: 380 }}
              showsVerticalScrollIndicator={false}
            >
              {PROMO_PACKAGES.map((pkg) => (
                <TouchableOpacity
                  key={pkg.id}
                  style={styles.packageCard}
                  onPress={() => handleSelectPackage(pkg)}
                  activeOpacity={0.8}
                >
                  <View style={styles.packageCardHeader}>
                    <View>
                      <Text style={styles.packageName}>{pkg.name}</Text>
                      <View style={styles.packageBadge}>
                        <Text style={styles.packageBadgeText}>{pkg.badge}</Text>
                      </View>
                    </View>
                    <Text style={styles.packagePrice}>
                      {pkg.price === 0 ? 'FREE' : `${currencySymbol}${pkg.price}`}
                    </Text>
                  </View>

                  <View style={styles.perksList}>
                    {pkg.perks.map((perk, idx) => (
                      <View key={idx} style={styles.perkRow}>
                        <Ionicons
                          name="checkmark-circle"
                          size={16}
                          color="#00A5A5"
                          style={{ marginRight: 6 }}
                        />
                        <Text style={styles.perkText}>{perk}</Text>
                      </View>
                    ))}
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <TouchableOpacity
              style={styles.closeBtn}
              onPress={() => setPackagesModalVisible(false)}
              activeOpacity={0.8}
            >
              <Text style={styles.closeBtnText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
  },
  backButton: {
    marginRight: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#002F34',
    letterSpacing: -0.2,
  },
  headerDivider: {
    height: 1,
    backgroundColor: '#E5E7EB',
  },
  listContent: {
    paddingBottom: 40,
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },
  textContainer: {
    flex: 1,
    paddingRight: 16,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#002F34',
    marginBottom: 4,
  },
  itemSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 47, 52, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    width: '100%',
    maxWidth: 420,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    paddingBottom: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#002F34',
  },
  modalSub: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  packageCard: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
  },
  packageCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  packageName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#002F34',
  },
  packageBadge: {
    backgroundColor: '#E6F4F1',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  packageBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#007882',
  },
  packagePrice: {
    fontSize: 18,
    fontWeight: '800',
    color: '#002F34',
  },
  perksList: {
    marginTop: 6,
  },
  perkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  perkText: {
    fontSize: 13,
    color: '#4B5563',
    flex: 1,
  },
  closeBtn: {
    backgroundColor: '#002F34',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 12,
  },
  closeBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});

export default InvoicesAndBillingScreen;
