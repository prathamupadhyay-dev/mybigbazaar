import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Modal,
  Image,
  Alert,
  Platform,
  TextInput,
  ActivityIndicator
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ScreenContainer from '../../components/ScreenContainer';
import { useApp } from '../../context/AppContext';
import { resolveBaseUrl } from '../../services/apiClient';
import { getProductCategoriesApi } from '../../services/categoryApi';

// Dynamically import WebView for native platforms
let WebView = null;
if (Platform.OS !== 'web') {
  try {
    WebView = require('react-native-webview').WebView;
  } catch (err) {
    console.warn('WebView not available on native:', err);
  }
}

const DEFAULT_CATEGORIES_LIST = [
  'Properties',
  'Mobiles',
  'Bikes',
  'Electronics & Appliances',
  'Commercial Vehicles & Spares',
  'Furniture',
  'Fashion',
  'Jobs',
  'Services'
];

export const EliteBuyerScreen = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { user, isAuthenticated, activeAddress } = useApp();

  // Dynamic CMS Page Content State
  const [pageData, setPageData] = useState({
    title: 'Elite Buyer Membership',
    youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    supportEmail: 'support@bigbazaar.com',
    supportPhone: '1800-258-3333',
    badgeText: 'Buy ⚡ Fast',
    headline: 'Call owners directly & close deals 2x faster',
    highlightWord: 'owners',
    card1Title: 'Call Owners Directly',
    card2Title: 'Daily New Matches',
    ctaText: 'Get Started'
  });
  const [loadingCms, setLoadingCms] = useState(false);

  // Dynamic Categories State
  const [categoriesList, setCategoriesList] = useState(DEFAULT_CATEGORIES_LIST);

  // Preference State (Category & Location)
  const [selectedCategory, setSelectedCategory] = useState(DEFAULT_CATEGORIES_LIST[0]);
  const [selectedLocation, setSelectedLocation] = useState(
    activeAddress?.city ? `${activeAddress.city}, India` : 'Sangam Nagar, Indore'
  );

  // Modals State
  const [editPreferenceModal, setEditPreferenceModal] = useState(false);
  const [tempCategory, setTempCategory] = useState(DEFAULT_CATEGORIES_LIST[0]);
  const [tempLocation, setTempLocation] = useState('Sangam Nagar, Indore');
  const [pickingCategory, setPickingCategory] = useState(false);

  const [helpModal, setHelpModal] = useState(false);
  const [videoModal, setVideoModal] = useState(false);

  // Fetch active categories dynamically
  useEffect(() => {
    let mounted = true;
    getProductCategoriesApi()
      .then((cats) => {
        if (mounted && Array.isArray(cats) && cats.length > 0) {
          const names = cats
            .filter((c) => c.isActive !== false && c.status !== 'Inactive')
            .map((c) => c.name || c.title)
            .filter(Boolean);
          if (names.length > 0) {
            setCategoriesList(names);
            setSelectedCategory((prev) => (names.includes(prev) ? prev : names[0]));
            setTempCategory((prev) => (names.includes(prev) ? prev : names[0]));
          }
        }
      })
      .catch(() => {});
    return () => {
      mounted = false;
    };
  }, []);

  // Fetch CMS page configuration from backend
  useEffect(() => {
    let mounted = true;
    const fetchCmsData = async () => {
      try {
        setLoadingCms(true);
        const baseUrl = resolveBaseUrl();
        const url = `${baseUrl}/api/v1/cms/pages/elite-buyer`;
        const res = await fetch(url, { headers: { Accept: 'application/json' } });
        if (res.ok) {
          const json = await res.json();
          if (mounted && json?.data) {
            const d = json.data;
            const cfg = d.config || {};
            setPageData({
              title: d.title || 'Elite Buyer Membership',
              youtubeUrl: d.youtubeUrl || 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
              supportEmail: d.supportEmail || 'support@bigbazaar.com',
              supportPhone: d.supportPhone || '1800-258-3333',
              badgeText: cfg.badgeText || 'Buy ⚡ Fast',
              headline: cfg.headline || 'Call owners directly & close deals 2x faster',
              highlightWord: cfg.highlightWord || 'owners',
              card1Title: cfg.card1Title || 'Call Owners Directly',
              card2Title: cfg.card2Title || 'Daily New Matches',
              ctaText: cfg.ctaText || 'Get Started'
            });
          }
        }
      } catch (err) {
        console.log('[EliteBuyer] Using fallback CMS configuration:', err.message);
      } finally {
        if (mounted) setLoadingCms(false);
      }
    };
    fetchCmsData();
    return () => {
      mounted = false;
    };
  }, []);

  // Parse YouTube video embed ID
  const getEmbedUrl = (url) => {
    if (!url) return '';
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    const id = match && match[2].length === 11 ? match[2] : 'dQw4w9WgXcQ';
    return `https://www.youtube.com/embed/${id}?autoplay=1&playsinline=1&rel=0`;
  };

  const handleOpenEdit = () => {
    setTempCategory(selectedCategory);
    setTempLocation(selectedLocation);
    setPickingCategory(false);
    setEditPreferenceModal(true);
  };

  const handleConfirmPreference = () => {
    setSelectedCategory(tempCategory);
    setSelectedLocation(tempLocation);
    setEditPreferenceModal(false);
  };

  const handleGetStarted = () => {
    if (!isAuthenticated) {
      return navigation.navigate('PhoneLogin');
    }
    Alert.alert(
      'Elite Buyer Activated!',
      `You will now receive direct phone connections and daily verified owner matches for "${selectedCategory}" in ${selectedLocation}.`,
      [
        {
          text: 'Browse Owner Ads',
          onPress: () => {
            navigation.navigate('Main', {
              screen: 'Home',
              params: { category: selectedCategory, filter: 'owner' }
            });
          }
        }
      ]
    );
  };

  const embedUrl = getEmbedUrl(pageData.youtubeUrl);

  return (
    <ScreenContainer noPadding style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Top Header matching exact screenshot (media_1791318551540.png) */}
      <View style={[styles.headerContainer, { paddingTop: Math.max(insets.top, 12) }]}>
        <View style={styles.headerLeft}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backBtn}
            activeOpacity={0.7}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <Ionicons name="arrow-back" size={24} color="#002F34" />
          </TouchableOpacity>

          <View style={styles.headerTextGroup}>
            <Text style={styles.headerCategoryTitle} numberOfLines={1}>
              {selectedCategory}
            </Text>
            <View style={styles.headerLocationRow}>
              <Ionicons name="location-outline" size={13} color="#6B7280" style={{ marginRight: 2 }} />
              <Text style={styles.headerLocationText} numberOfLines={1}>
                {selectedLocation}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.headerRightActions}>
          {/* Edit Button (Pill shaped royal blue button) */}
          <TouchableOpacity
            style={styles.editBtn}
            onPress={handleOpenEdit}
            activeOpacity={0.8}
          >
            <Text style={styles.editBtnText}>Edit</Text>
          </TouchableOpacity>

          {/* Help Button (Pill shaped rounded border button) */}
          <TouchableOpacity
            style={styles.helpBtn}
            onPress={() => setHelpModal(true)}
            activeOpacity={0.8}
          >
            <Text style={styles.helpBtnText}>Help</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.headerDivider} />

      {/* Main Scrollable Body */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 110 }]}
      >
        {/* Background light-blue gradient container */}
        <View style={styles.gradientSection}>
          {/* Crown Logo & Branding */}
          <View style={styles.brandHero}>
            <View style={styles.crownRow}>
              <MaterialCommunityIcons name="crown" size={32} color="#0052CC" />
            </View>
            <Text style={styles.eliteTitle}>ELITE</Text>
            <Text style={styles.eliteSubtitle}>~ BUYER ~</Text>
            <View style={styles.badgeRow}>
              <Text style={styles.badgeText}>{pageData.badgeText}</Text>
            </View>
          </View>

          {/* Mockup Card Illustration matching screenshot */}
          <View style={styles.mockupWrapper}>
            {/* Background card with chip */}
            <View style={styles.mockupBackCard}>
              <View style={styles.filterChip}>
                <Ionicons name="options-outline" size={12} color="#0052CC" style={{ marginRight: 4 }} />
                <Text style={styles.filterChipText}>Filters</Text>
              </View>
              <View style={styles.ownerAdsChip}>
                <Text style={styles.ownerAdsText}>Owner Ads</Text>
                <View style={styles.newBadge}>
                  <Text style={styles.newBadgeText}>New</Text>
                </View>
              </View>
            </View>

            {/* Foreground car ad card with Call button */}
            <View style={styles.mockupFrontCard}>
              <Image
                source={{ uri: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=400&q=80' }}
                style={styles.mockupCarImage}
                resizeMode="cover"
              />
              <View style={styles.mockupCallRow}>
                <View style={styles.mockupPlaceholderBars}>
                  <View style={styles.mockupBarLong} />
                  <View style={styles.mockupBarShort} />
                </View>
                <View style={styles.mockupCallBtn}>
                  <Ionicons name="call" size={13} color="#0052CC" style={{ marginRight: 4 }} />
                  <Text style={styles.mockupCallText}>Call</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Headline with dashed pill highlight */}
          <View style={styles.headlineContainer}>
            <Text style={styles.headlineText}>
              Call{' '}
              <View style={styles.dashedPill}>
                <Text style={styles.dashedPillText}>{pageData.highlightWord}</Text>
              </View>
              {' '}directly & close deals 2x faster
            </Text>
          </View>

          {/* 2 Golden Benefit Feature Cards */}
          <View style={styles.featuresRow}>
            {/* Card 1: Call Owners Directly */}
            <View style={styles.featureCard}>
              <View style={styles.featureIconWrap}>
                <Ionicons name="call" size={28} color="#D4AF37" />
              </View>
              <Text style={styles.featureCardTitle}>{pageData.card1Title}</Text>
            </View>

            {/* Card 2: Daily New Matches */}
            <View style={styles.featureCard}>
              <View style={styles.featureIconWrap}>
                <MaterialCommunityIcons name="creation" size={32} color="#D4AF37" />
              </View>
              <Text style={styles.featureCardTitle}>{pageData.card2Title}</Text>
            </View>
          </View>

          {/* NOTICE: Per user instruction: "it claims 70,000plus elite buyers etc remove that part" */}
          {/* We strictly omit the 70,000+ claim here */}

          {/* "See how it works? >" Button - Plays video inline in app */}
          <TouchableOpacity
            style={styles.seeHowItWorksBtn}
            onPress={() => setVideoModal(true)}
            activeOpacity={0.7}
          >
            <Text style={styles.seeHowItWorksText}>See how it works?</Text>
            <Ionicons name="chevron-forward" size={16} color="#0052CC" />
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Bottom Sticky "Get Started" Button matching screenshot */}
      <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, 14) }]}>
        <TouchableOpacity
          style={styles.getStartedBtn}
          onPress={handleGetStarted}
          activeOpacity={0.85}
        >
          <Text style={styles.getStartedBtnText}>{pageData.ctaText}</Text>
        </TouchableOpacity>
      </View>

      {/* ============================================================== */}
      {/* MODAL 1: Edit Preferences (Image 2 - media_1791318595169.png) */}
      {/* ============================================================== */}
      <Modal
        visible={editPreferenceModal}
        transparent
        animationType="slide"
        onRequestClose={() => setEditPreferenceModal(false)}
      >
        <View style={styles.sheetOverlay}>
          <TouchableOpacity
            style={styles.sheetBackdropTouch}
            activeOpacity={1}
            onPress={() => setEditPreferenceModal(false)}
          />
          <View style={[styles.sheetContainer, { paddingBottom: Math.max(insets.bottom, 16) }]}>
            {/* Sheet Header */}
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>
                Share your preference to start finding owner Ads
              </Text>
              <TouchableOpacity
                onPress={() => setEditPreferenceModal(false)}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              >
                <Ionicons name="close" size={24} color="#1F2937" />
              </TouchableOpacity>
            </View>

            {/* Category Row */}
            <TouchableOpacity
              style={styles.prefRow}
              onPress={() => setPickingCategory(!pickingCategory)}
              activeOpacity={0.7}
            >
              <View style={styles.prefTextCol}>
                <Text style={styles.prefLabel}>Category</Text>
                <Text style={styles.prefValue}>{tempCategory}</Text>
              </View>
              <Ionicons
                name={pickingCategory ? 'chevron-up' : 'chevron-forward'}
                size={20}
                color="#6B7280"
              />
            </TouchableOpacity>

            {/* Inline Category Selector Picker */}
            {pickingCategory && (
              <View style={styles.categoryPickerList}>
                <ScrollView style={{ maxHeight: 180 }} showsVerticalScrollIndicator={false}>
                  {categoriesList.map((cat) => (
                    <TouchableOpacity
                      key={cat}
                      style={[
                        styles.catOptionItem,
                        tempCategory === cat && styles.catOptionActive
                      ]}
                      onPress={() => {
                        setTempCategory(cat);
                        setPickingCategory(false);
                      }}
                    >
                      <Text
                        style={[
                          styles.catOptionText,
                          tempCategory === cat && styles.catOptionTextActive
                        ]}
                      >
                        {cat}
                      </Text>
                      {tempCategory === cat && (
                        <Ionicons name="checkmark" size={18} color="#004085" />
                      )}
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}

            <View style={styles.prefDivider} />

            {/* Location Row */}
            <View style={styles.prefRow}>
              <View style={styles.prefTextCol}>
                <Text style={styles.prefLabel}>Location</Text>
                <TextInput
                  value={tempLocation}
                  onChangeText={setTempLocation}
                  placeholder="Enter location"
                  placeholderTextColor="#9CA3AF"
                  style={styles.prefValueInput}
                />
              </View>
              <Ionicons name="chevron-forward" size={20} color="#6B7280" />
            </View>

            {/* Confirm Button */}
            <TouchableOpacity
              style={styles.confirmBtn}
              onPress={handleConfirmPreference}
              activeOpacity={0.85}
            >
              <Text style={styles.confirmBtnText}>Confirm</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ============================================================== */}
      {/* MODAL 2: Need Help? (Image 3 - media_1791318618399.png)        */}
      {/* ============================================================== */}
      <Modal
        visible={helpModal}
        transparent
        animationType="slide"
        onRequestClose={() => setHelpModal(false)}
      >
        <View style={styles.sheetOverlay}>
          <TouchableOpacity
            style={styles.sheetBackdropTouch}
            activeOpacity={1}
            onPress={() => setHelpModal(false)}
          />
          <View style={[styles.sheetContainer, { paddingBottom: Math.max(insets.bottom, 24) }]}>
            {/* Drag handle */}
            <View style={styles.sheetHandleBar} />

            {/* Header */}
            <View style={styles.helpHeader}>
              <Text style={styles.helpTitle}>Need Help?</Text>
              <TouchableOpacity
                onPress={() => setHelpModal(false)}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              >
                <Ionicons name="close" size={24} color="#1F2937" />
              </TouchableOpacity>
            </View>

            {/* Option 1: View all FAQs */}
            <TouchableOpacity
              style={styles.helpRow}
              onPress={() => {
                setHelpModal(false);
                navigation.navigate('FAQ');
              }}
              activeOpacity={0.7}
            >
              <Ionicons name="help-circle-outline" size={24} color="#1F2937" style={styles.helpIcon} />
              <Text style={styles.helpRowText}>
                View all <Text style={styles.underlineText}>FAQs</Text>
              </Text>
            </TouchableOpacity>

            {/* Option 2: Email */}
            <TouchableOpacity
              style={styles.helpRow}
              onPress={() => {
                Alert.alert('Support Email', `Reach out to our customer care at ${pageData.supportEmail}`);
              }}
              activeOpacity={0.7}
            >
              <Ionicons name="mail-outline" size={24} color="#1F2937" style={styles.helpIcon} />
              <Text style={styles.helpRowText}>Email on - {pageData.supportEmail}</Text>
            </TouchableOpacity>

            {/* Option 3: Call us on */}
            <TouchableOpacity
              style={styles.helpRow}
              onPress={() => {
                Alert.alert('Customer Care Helpline', `Toll-free customer line: ${pageData.supportPhone}`);
              }}
              activeOpacity={0.7}
            >
              <Ionicons name="call-outline" size={24} color="#1F2937" style={styles.helpIcon} />
              <Text style={styles.helpRowText}>Call us on - {pageData.supportPhone}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ============================================================== */}
      {/* MODAL 3: Inline In-App YouTube Video Player                     */}
      {/* Plays in-app without opening external YouTube application      */}
      {/* ============================================================== */}
      <Modal
        visible={videoModal}
        transparent
        animationType="fade"
        onRequestClose={() => setVideoModal(false)}
      >
        <View style={styles.videoModalOverlay}>
          <View style={styles.videoModalCard}>
            <View style={styles.videoModalHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons name="logo-youtube" size={22} color="#DC2626" style={{ marginRight: 8 }} />
                <Text style={styles.videoModalTitle}>How Elite Buyer Works</Text>
              </View>
              <TouchableOpacity
                onPress={() => setVideoModal(false)}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              >
                <Ionicons name="close" size={24} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            {/* In-app video player */}
            <View style={styles.playerContainer}>
              {Platform.OS === 'web' ? (
                <iframe
                  src={embedUrl}
                  title="How Elite Buyer Works"
                  style={{ width: '100%', height: '100%', border: 'none' }}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : WebView ? (
                <WebView
                  source={{ uri: embedUrl }}
                  style={{ flex: 1 }}
                  allowsInlineMediaPlayback
                  mediaPlaybackRequiresUserAction={false}
                  javaScriptEnabled
                  domStorageEnabled
                />
              ) : (
                <View style={styles.noPlayerFallback}>
                  <Ionicons name="play-circle" size={48} color="#FFFFFF" />
                  <Text style={styles.noPlayerText}>
                    Playing YouTube Demo...
                  </Text>
                </View>
              )}
            </View>

            <TouchableOpacity
              style={styles.closeVideoBtn}
              onPress={() => setVideoModal(false)}
              activeOpacity={0.8}
            >
              <Text style={styles.closeVideoBtnText}>Close Video</Text>
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
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: '#FFFFFF',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  backBtn: {
    marginRight: 12,
  },
  headerTextGroup: {
    flex: 1,
  },
  headerCategoryTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#002F34',
  },
  headerLocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  headerLocationText: {
    fontSize: 12,
    color: '#6B7280',
  },
  headerRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  editBtn: {
    backgroundColor: '#004085',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  helpBtn: {
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  helpBtnText: {
    color: '#1F2937',
    fontSize: 13,
    fontWeight: '600',
  },
  headerDivider: {
    height: 1,
    backgroundColor: '#E5E7EB',
  },
  scrollContent: {
    flexGrow: 1,
  },
  gradientSection: {
    backgroundColor: '#EDF7FD',
    alignItems: 'center',
    paddingTop: 24,
    paddingBottom: 36,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  brandHero: {
    alignItems: 'center',
    marginBottom: 20,
  },
  crownRow: {
    marginBottom: 4,
  },
  eliteTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#004085',
    letterSpacing: 2,
  },
  eliteSubtitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0052CC',
    letterSpacing: 1.5,
    marginTop: 1,
  },
  badgeRow: {
    marginTop: 4,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#004085',
  },
  mockupWrapper: {
    width: 260,
    height: 180,
    position: 'relative',
    marginVertical: 10,
    alignItems: 'center',
  },
  mockupBackCard: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 220,
    height: 140,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#BAE6FD',
    padding: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F9FF',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  filterChipText: {
    fontSize: 11,
    color: '#0052CC',
    fontWeight: '600',
  },
  ownerAdsChip: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#38BDF8',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    alignSelf: 'flex-start',
  },
  ownerAdsText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#002F34',
    marginRight: 6,
  },
  newBadge: {
    backgroundColor: '#FDE047',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
  },
  newBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#854D0E',
  },
  mockupFrontCard: {
    position: 'absolute',
    top: 20,
    right: 0,
    width: 200,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  mockupCarImage: {
    width: '100%',
    height: 80,
    borderRadius: 8,
    marginBottom: 8,
  },
  mockupCallRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  mockupPlaceholderBars: {
    flex: 1,
    marginRight: 8,
  },
  mockupBarLong: {
    height: 6,
    backgroundColor: '#E2E8F0',
    borderRadius: 3,
    marginBottom: 4,
    width: '80%',
  },
  mockupBarShort: {
    height: 6,
    backgroundColor: '#F1F5F9',
    borderRadius: 3,
    width: '50%',
  },
  mockupCallBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#0052CC',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  mockupCallText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0052CC',
  },
  headlineContainer: {
    marginTop: 18,
    marginBottom: 20,
    paddingHorizontal: 12,
  },
  headlineText: {
    fontSize: 22,
    fontWeight: '800',
    color: '#002F34',
    textAlign: 'center',
    lineHeight: 32,
  },
  dashedPill: {
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: '#004085',
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 1,
    marginHorizontal: 2,
    top: 3,
  },
  dashedPillText: {
    fontSize: 20,
    fontWeight: '800',
    color: '#004085',
  },
  featuresRow: {
    flexDirection: 'row',
    gap: 14,
    width: '100%',
    marginTop: 6,
    marginBottom: 22,
  },
  featureCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: '#BAE6FD',
    alignItems: 'center',
    paddingVertical: 22,
    paddingHorizontal: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  featureIconWrap: {
    marginBottom: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureCardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#002F34',
    textAlign: 'center',
    lineHeight: 20,
  },
  seeHowItWorksBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  seeHowItWorksText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#004085',
    textDecorationLine: 'underline',
    marginRight: 4,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  getStartedBtn: {
    backgroundColor: '#004085',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  getStartedBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  sheetOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  sheetBackdropTouch: {
    flex: 1,
  },
  sheetContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  sheetTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    flex: 1,
    paddingRight: 16,
    lineHeight: 22,
  },
  prefRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
  },
  prefTextCol: {
    flex: 1,
  },
  prefLabel: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 4,
  },
  prefValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  prefValueInput: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    padding: 0,
  },
  prefDivider: {
    height: 1,
    backgroundColor: '#E5E7EB',
  },
  categoryPickerList: {
    backgroundColor: '#F9FAFB',
    borderRadius: 10,
    padding: 8,
    marginBottom: 10,
  },
  catOptionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  catOptionActive: {
    backgroundColor: '#E0F2FE',
  },
  catOptionText: {
    fontSize: 14,
    color: '#374151',
  },
  catOptionTextActive: {
    color: '#004085',
    fontWeight: '700',
  },
  confirmBtn: {
    backgroundColor: '#004085',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 20,
  },
  confirmBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  sheetHandleBar: {
    width: 40,
    height: 4,
    backgroundColor: '#9CA3AF',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 14,
  },
  helpHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
  },
  helpTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  helpRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  helpIcon: {
    marginRight: 16,
  },
  helpRowText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#111827',
  },
  underlineText: {
    textDecorationLine: 'underline',
    fontWeight: '600',
  },
  videoModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  videoModalCard: {
    width: '100%',
    maxWidth: 500,
    backgroundColor: '#1E293B',
    borderRadius: 16,
    overflow: 'hidden',
  },
  videoModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  videoModalTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  playerContainer: {
    width: '100%',
    height: 260,
    backgroundColor: '#000000',
  },
  noPlayerFallback: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noPlayerText: {
    color: '#FFFFFF',
    marginTop: 8,
    fontSize: 14,
  },
  closeVideoBtn: {
    backgroundColor: '#0F172A',
    paddingVertical: 12,
    alignItems: 'center',
  },
  closeVideoBtnText: {
    color: '#94A3B8',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default EliteBuyerScreen;
