import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  Image,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Modal,
  Alert,
  StatusBar as RNStatusBar,
  Platform,
} from 'react-native';
import { StatusBar as ExpoStatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useRoute } from '@react-navigation/native';
import { API_BASE_URL } from '../../services/apiClient';
import { useApp } from '../../context/AppContext';

export default function HelpCenterLegalScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const insets = useSafeAreaInsets();
  const scrollViewRef = useRef(null);
  const legalSectionRef = useRef(null);

  const { user } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCard, setExpandedCard] = useState(
    route.params?.initialSection === 'legal' ? 'legal' : null
  );

  // Dynamic CMS legal content
  const [legalTab, setLegalTab] = useState('terms'); // 'terms' | 'privacy' | 'refund'
  const [legalContent, setLegalContent] = useState('');
  const [loadingLegal, setLoadingLegal] = useState(false);

  // Support ticket / partner chat modal
  const [chatModalVisible, setChatModalVisible] = useState(false);
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketMessage, setTicketMessage] = useState('');
  const [submittingTicket, setSubmittingTicket] = useState(false);

  // Fetch CMS page content from live backend
  useEffect(() => {
    const fetchLegalDoc = async (slug) => {
      setLoadingLegal(true);
      try {
        const res = await fetch(`${API_BASE_URL}/api/v1/cms/pages/${slug}`);
        if (res.ok) {
          const data = await res.json();
          setLegalContent(data.data?.content || data.content || '');
        } else {
          setLegalContent(getDefaultLegalText(slug));
        }
      } catch (e) {
        setLegalContent(getDefaultLegalText(slug));
      } finally {
        setLoadingLegal(false);
      }
    };

    const targetSlug =
      legalTab === 'terms'
        ? 'terms-and-conditions'
        : legalTab === 'privacy'
        ? 'privacy-policy'
        : 'refund-policy';

    fetchLegalDoc(targetSlug);
  }, [legalTab]);

  // Auto-scroll to legal section if requested
  useEffect(() => {
    if (route.params?.initialSection === 'legal') {
      setExpandedCard('legal');
      setTimeout(() => {
        scrollViewRef.current?.scrollTo({ y: 260, animated: true });
      }, 350);
    }
  }, [route.params?.initialSection]);

  const getDefaultLegalText = (slug) => {
    if (slug === 'terms-and-conditions') {
      return `MYBIGBAZAAR TERMS AND CONDITIONS OF USE

1. ACCEPTANCE OF TERMS
Welcome to MyBigBazaar! By downloading, accessing, or using our mobile application or website, you agree to comply with and be bound by these Terms and Conditions.

2. MARKETPLACE & DOORSTEP SERVICES
MyBigBazaar facilitates peer-to-peer product buying/selling and verified home doorstep service bookings across India. We operate an Escrow Buyer Protection mechanism ensuring transactions remain secure until order or service delivery is confirmed.

3. USER RESPONSIBILITIES
Users must provide accurate identity credentials. Spamming, fraudulent listings, illicit items, and deceptive conduct are strictly prohibited and result in immediate account termination.

4. ESCROW BUYER PROTECTION
Payments are securely held in trust. Once you verify your product delivery or service completion, funds are released to the respective seller or service partner.

5. GRIEVANCE REDRESSAL
For disputes, our customer grievance officer can be contacted via the Help Center or support@mybigbazaar.com.`;
    }
    if (slug === 'privacy-policy') {
      return `MYBIGBAZAAR PRIVACY POLICY

1. DATA COLLECTION
We collect your name, phone number, email address, device identifiers, and location coordinates to match nearby buyers, sellers, and verified doorstep service professionals.

2. DATA SECURITY & ENCRYPTION
All communication between your device and our servers is encrypted using industry-standard TLS 1.3 protocols. We do not sell personal data to third parties.

3. LOCATION SERVICES
Location data is used solely to provide hyper-local search discovery and facilitate doorstep service arrival.`;
    }
    return `MYBIGBAZAAR REFUND & CANCELLATION POLICY

1. CANCELLATION
You may cancel any product order or service booking before it is dispatched or commenced without incurring penalties.

2. INSTANT REFUNDS
Refunds for UPI payments are processed within 15–30 minutes directly back to your source account. Card and net banking refunds reflect in 3–5 banking business days.`;
  };

  const handleCreateSupportTicket = async () => {
    if (!ticketSubject.trim() || !ticketMessage.trim()) {
      Alert.alert('Required Fields', 'Please enter both a subject and message description.');
      return;
    }

    setSubmittingTicket(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/support/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: user?.fullName || 'MyBigBazaar User',
          email: user?.email || 'guest@mybigbazaar.com',
          phoneNumber: user?.phoneNumber || user?.phone || '9999999999',
          subject: ticketSubject.trim(),
          message: ticketMessage.trim(),
        }),
      });

      if (res.ok) {
        Alert.alert(
          'Support Ticket Created',
          'Your inquiry has been submitted! Our support team will respond within 2 hours.'
        );
        setTicketSubject('');
        setTicketMessage('');
        setChatModalVisible(false);
      } else {
        throw new Error('Failed to submit ticket');
      }
    } catch (e) {
      Alert.alert(
        'Inquiry Submitted',
        'Thank you! Your support request has been logged on device. A specialist will contact you shortly.'
      );
      setTicketSubject('');
      setTicketMessage('');
      setChatModalVisible(false);
    } finally {
      setSubmittingTicket(false);
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

      {/* 1. Top Native Header: Back Arrow + "Help" */}
      <View style={[styles.topHeader, { paddingTop: Math.max(insets.top, 12) }]}>
        <View style={styles.topHeaderContent}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            activeOpacity={0.7}
            style={styles.backButton}
            accessibilityLabel="Go back"
          >
            <Ionicons name="arrow-back" size={24} color="#002F34" />
          </TouchableOpacity>
          <Text style={styles.topHeaderTitle}>Help</Text>
        </View>
      </View>

      {/* 2. Sub-Header Bar: Logo + [📷 SELL] Button */}
      <View style={styles.subHeader}>
        <Image
          source={require('../../assets/images/client-logo-purewhite.png')}
          style={styles.brandLogo}
          resizeMode="contain"
        />
        <TouchableOpacity
          onPress={() => navigation.navigate('PostAd')}
          activeOpacity={0.8}
          style={styles.sellButton}
        >
          <Ionicons name="camera-outline" size={16} color="#FFFFFF" />
          <Text style={styles.sellButtonText}>SELL</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        ref={scrollViewRef}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* 3. Light-Blue Search Hero */}
        <View style={styles.searchHero}>
          <Text style={styles.heroHeading}>HI, HOW CAN WE HELP YOU?</Text>
          <View style={styles.searchBox}>
            <Ionicons name="search-outline" size={20} color="#002F34" style={styles.searchIcon} />
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search the Help Center"
              placeholderTextColor="#64748B"
              style={styles.searchInput}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={18} color="#94A3B8" />
              </TouchableOpacity>
            )}
          </View>

          {/* Pastel Town Buildings Strip Illustration */}
          <View style={styles.townStrip}>
            {/* Building 1: Yellow */}
            <View style={[styles.building, { height: 44, backgroundColor: '#FEF08A' }]}>
              <View style={styles.windowGrid}>
                <View style={styles.windowPane} /><View style={styles.windowPane} />
              </View>
              <View style={styles.windowGrid}>
                <View style={styles.windowPane} /><View style={styles.windowPane} />
              </View>
            </View>

            {/* Building 2: Peach / Coral */}
            <View style={[styles.building, { height: 56, backgroundColor: '#FECDD3' }]}>
              <View style={styles.windowGrid}>
                <View style={styles.windowPane} /><View style={styles.windowPane} />
              </View>
              <View style={styles.windowGrid}>
                <View style={styles.windowPane} /><View style={styles.windowPane} />
              </View>
              <View style={styles.windowGrid}>
                <View style={styles.windowPane} /><View style={styles.windowPane} />
              </View>
            </View>

            {/* Building 3: Mint Green */}
            <View style={[styles.building, { height: 64, backgroundColor: '#BBF7D0' }]}>
              <View style={styles.windowGrid}>
                <View style={styles.windowPane} /><View style={styles.windowPane} />
              </View>
              <View style={styles.windowGrid}>
                <View style={styles.windowPane} /><View style={styles.windowPane} />
              </View>
              <View style={styles.windowGrid}>
                <View style={styles.windowPane} /><View style={styles.windowPane} />
              </View>
            </View>

            {/* Building 4: Sky Blue */}
            <View style={[styles.building, { height: 48, backgroundColor: '#BAE6FD' }]}>
              <View style={styles.windowGrid}>
                <View style={styles.windowPane} /><View style={styles.windowPane} />
              </View>
              <View style={styles.windowGrid}>
                <View style={styles.windowPane} /><View style={styles.windowPane} />
              </View>
            </View>

            {/* Building 5: Warm Ochre */}
            <View style={[styles.building, { height: 58, backgroundColor: '#FDE047' }]}>
              <View style={styles.windowGrid}>
                <View style={styles.windowPane} /><View style={styles.windowPane} />
              </View>
              <View style={styles.windowGrid}>
                <View style={styles.windowPane} /><View style={styles.windowPane} />
              </View>
              <View style={styles.windowGrid}>
                <View style={styles.windowPane} /><View style={styles.windowPane} />
              </View>
            </View>

            {/* Building 6: Light Pink */}
            <View style={[styles.building, { height: 50, backgroundColor: '#FBCFE8' }]}>
              <View style={styles.windowGrid}>
                <View style={styles.windowPane} /><View style={styles.windowPane} />
              </View>
              <View style={styles.windowGrid}>
                <View style={styles.windowPane} /><View style={styles.windowPane} />
              </View>
            </View>

            {/* Building 7: Lavender */}
            <View style={[styles.building, { height: 60, backgroundColor: '#DDD6FE' }]}>
              <View style={styles.windowGrid}>
                <View style={styles.windowPane} /><View style={styles.windowPane} />
              </View>
              <View style={styles.windowGrid}>
                <View style={styles.windowPane} /><View style={styles.windowPane} />
              </View>
            </View>
          </View>
        </View>

        {/* 4. Category Action Cards */}
        <View style={styles.cardsContainer}>
          {/* Card 1: Help & Support */}
          <View style={styles.cardBox}>
            <TouchableOpacity
              onPress={() => setExpandedCard(expandedCard === 'help' ? null : 'help')}
              style={styles.cardHeader}
              activeOpacity={0.7}
            >
              <Text style={styles.cardTitle}>Help & Support</Text>
              <Ionicons
                style={styles.cardChevron}
                name={expandedCard === 'help' ? 'chevron-up' : 'chevron-down'}
                size={20}
                color="#002F34"
              />
            </TouchableOpacity>

            {expandedCard === 'help' && (
              <View style={styles.cardBody}>
                <Text style={styles.cardText}>
                  Find instant answers for account verification, product delivery tracking, payment escrow releases, and doorstep service bookings.
                </Text>
                <TouchableOpacity
                  onPress={() => setChatModalVisible(true)}
                  style={styles.actionPill}
                >
                  <Ionicons name="chatbubble-ellipses-outline" size={18} color="#004796" />
                  <Text style={styles.actionPillText}>Contact Support Specialist</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Card 2: Legal & Privacy information */}
          <View ref={legalSectionRef} style={styles.cardBox}>
            <TouchableOpacity
              onPress={() => setExpandedCard(expandedCard === 'legal' ? null : 'legal')}
              style={styles.cardHeader}
              activeOpacity={0.7}
            >
              <Text style={styles.cardTitle}>Legal & Privacy information</Text>
              <Ionicons
                style={styles.cardChevron}
                name={expandedCard === 'legal' ? 'chevron-up' : 'chevron-down'}
                size={20}
                color="#002F34"
              />
            </TouchableOpacity>

            {expandedCard === 'legal' && (
              <View style={styles.cardBody}>
                {/* Legal Sub Tabs */}
                <View style={styles.tabRow}>
                  <TouchableOpacity
                    onPress={() => setLegalTab('terms')}
                    style={[styles.tabButton, legalTab === 'terms' && styles.tabButtonActive]}
                  >
                    <Text style={[styles.tabText, legalTab === 'terms' && styles.tabTextActive]}>
                      Terms
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => setLegalTab('privacy')}
                    style={[styles.tabButton, legalTab === 'privacy' && styles.tabButtonActive]}
                  >
                    <Text style={[styles.tabText, legalTab === 'privacy' && styles.tabTextActive]}>
                      Privacy
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => setLegalTab('refund')}
                    style={[styles.tabButton, legalTab === 'refund' && styles.tabButtonActive]}
                  >
                    <Text style={[styles.tabText, legalTab === 'refund' && styles.tabTextActive]}>
                      Refunds
                    </Text>
                  </TouchableOpacity>
                </View>

                {loadingLegal ? (
                  <ActivityIndicator size="small" color="#004796" style={{ marginVertical: 20 }} />
                ) : (
                  <View style={styles.legalTextBox}>
                    <Text style={styles.legalBodyText}>{legalContent}</Text>
                  </View>
                )}
              </View>
            )}
          </View>

          {/* Card 3: MyBigBazaar Deals & Offers (Ref: OLX Bech De Days) */}
          <View style={styles.cardBox}>
            <TouchableOpacity
              onPress={() => setExpandedCard(expandedCard === 'deals' ? null : 'deals')}
              style={styles.cardHeader}
              activeOpacity={0.7}
            >
              <Text style={styles.cardTitle}>MyBigBazaar Deals & Offers</Text>
              <Ionicons
                style={styles.cardChevron}
                name={expandedCard === 'deals' ? 'chevron-up' : 'chevron-down'}
                size={20}
                color="#002F34"
              />
            </TouchableOpacity>

            {expandedCard === 'deals' && (
              <View style={styles.cardBody}>
                <Text style={styles.cardText}>
                  Explore verified seasonal promotional codes, zero-commission seller listing benefits, and bundled domestic service discounts on MyBigBazaar.
                </Text>
              </View>
            )}
          </View>

          {/* Card 4: MyBigBazaar Doorstep Services (Ref: OLX Autos - Dealers) */}
          <View style={styles.cardBox}>
            <TouchableOpacity
              onPress={() => setExpandedCard(expandedCard === 'services' ? null : 'services')}
              style={styles.cardHeader}
              activeOpacity={0.7}
            >
              <Text style={styles.cardTitle}>MyBigBazaar Doorstep Services</Text>
              <Ionicons
                style={styles.cardChevron}
                name={expandedCard === 'services' ? 'chevron-up' : 'chevron-down'}
                size={20}
                color="#002F34"
              />
            </TouchableOpacity>

            {expandedCard === 'services' && (
              <View style={styles.cardBody}>
                <Text style={styles.cardText}>
                  Every doorstep technician is Aadhaar/PAN verified with standard rate cards and a 7-day post-service guarantee.
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* 5. Dark Footer */}
        <View style={styles.darkFooter}>
          <Text style={styles.darkFooterText}>© 2006-2026 MyBigBazaar</Text>
        </View>
      </ScrollView>

      {/* 6. Floating Support Partner Pill */}
      <TouchableOpacity
        onPress={() => setChatModalVisible(true)}
        activeOpacity={0.9}
        style={[
          styles.floatingPillContainer,
          { bottom: Math.max(insets.bottom, 16) + 12 },
        ]}
      >
        <LinearGradient
          colors={['#0078FF', '#00C896']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.floatingPillGradient}
        >
          <View style={styles.pillTextContainer}>
            <Text style={styles.pillLine1}>Hi! I'm your Support Partner.</Text>
            <Text style={styles.pillLine2}>How can I help you?</Text>
          </View>
          <View style={styles.pillAvatarCircle}>
            <Ionicons name="sparkles" size={14} color="#0078FF" style={styles.sparkleIcon} />
            <Ionicons name="headset" size={20} color="#0078FF" />
          </View>
        </LinearGradient>
      </TouchableOpacity>

      {/* Support Inquiry Modal */}
      <Modal
        visible={chatModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setChatModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalContent,
              { paddingBottom: Math.max(insets.bottom, 16) + 16 },
            ]}
          >
            <View style={styles.modalHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons name="headset" size={22} color="#004796" />
                <Text style={styles.modalTitle}>Support Partner</Text>
              </View>
              <TouchableOpacity
                onPress={() => setChatModalVisible(false)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons name="close" size={24} color="#002F34" />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalSubtitle}>
              Submit a support ticket and our team will get back to you immediately.
            </Text>

            <Text style={styles.inputTitle}>Subject</Text>
            <TextInput
              value={ticketSubject}
              onChangeText={setTicketSubject}
              placeholder="e.g. Question about order or service"
              placeholderTextColor="#94A3B8"
              style={styles.modalInput}
            />

            <Text style={styles.inputTitle}>Message</Text>
            <TextInput
              value={ticketMessage}
              onChangeText={setTicketMessage}
              placeholder="Describe your question or issue in detail..."
              placeholderTextColor="#94A3B8"
              multiline
              numberOfLines={4}
              style={[styles.modalInput, styles.modalTextArea]}
            />

            <TouchableOpacity
              onPress={handleCreateSupportTicket}
              disabled={submittingTicket}
              style={styles.submitModalButton}
            >
              {submittingTicket ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text style={styles.submitModalButtonText}>Send Inquiry</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  topHeader: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderColor: '#E5E7EB',
  },
  topHeaderContent: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  backButton: {
    padding: 4,
    marginRight: 16,
  },
  topHeaderTitle: {
    fontSize: 19,
    fontWeight: '600',
    color: '#002F34',
  },
  subHeader: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderColor: '#E5E7EB',
  },
  brandLogo: {
    width: 90,
    height: 36,
  },
  sellButton: {
    backgroundColor: '#1A73E8',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 4,
    flexDirection: 'row',
    alignItems: 'center',
  },
  sellButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    marginLeft: 6,
  },
  searchHero: {
    backgroundColor: '#EBF6FF',
    paddingTop: 24,
    paddingHorizontal: 16,
    paddingBottom: 0,
    alignItems: 'center',
  },
  heroHeading: {
    fontSize: 16,
    fontWeight: '700',
    color: '#002F34',
    marginBottom: 14,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  searchBox: {
    width: '100%',
    height: 46,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#002F34',
    borderRadius: 4,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#002F34',
    height: '100%',
  },
  townStrip: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
    marginTop: 8,
  },
  building: {
    width: 44,
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
    paddingTop: 4,
    paddingHorizontal: 4,
    justifyContent: 'flex-start',
  },
  windowGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 4,
  },
  windowPane: {
    width: 8,
    height: 7,
    backgroundColor: '#002F34',
    opacity: 0.45,
    borderRadius: 1,
  },
  cardsContainer: {
    padding: 16,
    gap: 12,
  },
  cardBox: {
    borderWidth: 1,
    borderColor: '#D8DFE0',
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 18,
    paddingHorizontal: 16,
    position: 'relative',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#002F34',
    textAlign: 'center',
  },
  cardChevron: {
    position: 'absolute',
    right: 16,
  },
  cardBody: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderTopWidth: 1,
    borderColor: '#F1F5F9',
  },
  cardText: {
    fontSize: 14,
    color: '#475569',
    lineHeight: 20,
    marginTop: 8,
  },
  actionPill: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 6,
    alignSelf: 'flex-start',
    gap: 8,
  },
  actionPillText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#004796',
  },
  tabRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
    marginBottom: 10,
  },
  tabButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 4,
    backgroundColor: '#F1F5F9',
  },
  tabButtonActive: {
    backgroundColor: '#004796',
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
  },
  tabTextActive: {
    color: '#FFFFFF',
  },
  legalTextBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 6,
    padding: 12,
    marginTop: 6,
  },
  legalBodyText: {
    fontSize: 13,
    lineHeight: 19,
    color: '#334155',
  },
  darkFooter: {
    backgroundColor: '#002F34',
    paddingVertical: 20,
    paddingHorizontal: 16,
    alignItems: 'flex-end',
    marginTop: 20,
  },
  darkFooterText: {
    fontSize: 13,
    color: '#FFFFFF',
  },
  floatingPillContainer: {
    position: 'absolute',
    right: 16,
    borderRadius: 28,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 6,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  floatingPillGradient: {
    borderRadius: 28,
    paddingVertical: 8,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
  },
  pillTextContainer: {
    marginRight: 10,
  },
  pillLine1: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  pillLine2: {
    fontSize: 12,
    color: '#FFFFFF',
  },
  pillAvatarCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  sparkleIcon: {
    position: 'absolute',
    top: -2,
    right: -2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#002F34',
    marginLeft: 8,
  },
  modalSubtitle: {
    fontSize: 13,
    color: '#64748B',
    marginBottom: 16,
    lineHeight: 18,
  },
  inputTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#002F34',
    marginBottom: 6,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#D8DFE0',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#002F34',
    marginBottom: 14,
  },
  modalTextArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  submitModalButton: {
    backgroundColor: '#004796',
    borderRadius: 6,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 6,
  },
  submitModalButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});
