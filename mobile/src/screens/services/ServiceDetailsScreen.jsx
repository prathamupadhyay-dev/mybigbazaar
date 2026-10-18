import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  Modal,
  Animated,} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import ScreenContainer from '../../components/ScreenContainer';
import Colors from '../../constants/colors';
import Typography from '../../constants/typography';
import Spacing from '../../constants/spacing';
import Radii from '../../constants/radii';
import Shadows from '../../constants/shadows';
import { useApp } from '../../context/AppContext';

const { width } = Dimensions.get('window');

export default function ServiceDetailsScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { item } = route.params || {};
  const { watchlist, toggleWatchlist, requireAuth, activeAddress, formatPrice } = useApp();

  const [imageExpanded, setImageExpanded] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Mount animation values
  const mountOpacity = React.useRef(new Animated.Value(0.85)).current;
  const mountScale = React.useRef(new Animated.Value(0.98)).current;

  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(mountOpacity, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true
      }),
      Animated.timing(mountScale, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true
      })
    ]).start();
  }, []);

  // Parse numeric base price
  const baseNumericPrice = item
    ? typeof item.price === 'number'
      ? item.price
      : parseFloat(String(item.price).replace(/[^0-9.]/g, '')) || 450
    : 450;

  // Package tiers: Basic, Standard, Premium
  const packages = [
    {
      id: 'pkg-basic',
      name: 'Basic',
      tagline: 'Inspection & Minor Fix',
      price: baseNumericPrice,
      duration: '45–60 mins',
      features: [
        'Detailed on-site diagnostic check',
        'Minor repair & tightening',
        '30-day BigBazaar workmanship warranty'
      ],
      popular: false
    },
    {
      id: 'pkg-standard',
      name: 'Standard',
      tagline: 'Full Repair & Tune-up',
      price: Math.round(baseNumericPrice * 1.5),
      duration: '1.5–2 hours',
      features: [
        'Everything in Basic',
        'Deep cleaning / overhaul of parts',
        '60-day warranty on all joints/fittings',
        'Priority same-day technician dispatch'
      ],
      popular: true
    },
    {
      id: 'pkg-premium',
      name: 'Premium',
      tagline: 'Complete Overhaul',
      price: Math.round(baseNumericPrice * 2.2),
      duration: '2.5–3 hours',
      features: [
        'Complete disassembly and overhaul',
        'Chemical sanitization / foam wash',
        '90-day comprehensive guarantee',
        'Free follow-up inspection within 30 days'
      ],
      popular: false
    }
  ];

  const [selectedPackageId, setSelectedPackageId] = useState('pkg-standard');
  const activePackage = packages.find((p) => p.id === selectedPackageId) || packages[1];

  const [selectedSlot, setSelectedSlot] = useState('10:00 AM - 12:00 PM');
  const availableSlots = [
    '09:00 AM - 11:00 AM',
    '11:00 AM - 01:00 PM',
    '02:00 PM - 04:00 PM',
    '04:00 PM - 06:00 PM',
    '06:00 PM - 08:00 PM'
  ];

  const isSaved = item ? watchlist.includes(item.id) : false;

  const relatedServices = [];
  const reviews = [];

  const inclusions = [
    'Verified and background-checked technician',
    '30-to-90 Day Service Guarantee',
    'Pre-service upfront cost estimate',
    'Thorough post-service cleanup'
  ];

  const exclusions = [
    'Cost of new replacement hardware / spare parts',
    'Masonry, carpentry alterations or major wall drilling',
    'Damages caused by pre-existing hazardous wiring or plumbing'
  ];

  if (!item) {
    return (
      <ScreenContainer>
        <Text>Service item not found</Text>
      </ScreenContainer>
    );
  }

  const handleSave = () => {
    requireAuth(navigation, () => {
      toggleWatchlist(item.id);
    });
  };

  const handleBookNow = () => {
    requireAuth(navigation, () => {
      navigation.navigate('ServiceBooking', {
        categoryName: item.category || 'Plumber',
        subCategoryName: item.title,
        packageSelected: {
          name: activePackage.name,
          price: activePackage.price,
          duration: activePackage.duration,
          timeSlot: selectedSlot
        },
        timeSlot: selectedSlot,
        amount: activePackage.price
      });
    });
  };

  const images = item.imageUrl ? [item.imageUrl] : [];

  return (
    <Animated.View style={{ flex: 1, opacity: mountOpacity, transform: [{ scale: mountScale }] }}>
      <ScreenContainer noPadding>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.goBack()} accessibilityLabel="Back">
            <Ionicons name="arrow-back" size={24} color={Colors.card} />
          </TouchableOpacity>
          <Text style={styles.headerTitle} numberOfLines={1}>Service Details</Text>
          <View style={styles.headerRight}>
            <TouchableOpacity style={styles.iconBtn} onPress={handleSave} accessibilityLabel="Add to wishlist">
              <Ionicons
                name={isSaved ? 'heart' : 'heart-outline'}
                size={24}
                color={isSaved ? Colors.crimson : Colors.card}
              />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Hero Image Slider */}
          {images.length > 0 ? (
            <View>
              <ScrollView
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                style={styles.sliderContainer}
                onScroll={(e) => {
                  const x = e.nativeEvent.contentOffset.x;
                  setCurrentImageIndex(Math.round(x / width));
                }}
                scrollEventThrottle={16}>
                {images.map((img, idx) => (
                  <TouchableOpacity key={idx} activeOpacity={0.9} onPress={() => setImageExpanded(true)}>
                    <Image source={{ uri: img }} style={styles.heroImage} resizeMode="cover" />
                  </TouchableOpacity>
                ))}
              </ScrollView>
              {images.length > 1 && (
                <View style={styles.paginationDots}>
                  {images.map((_, idx) => (
                    <View key={idx} style={[styles.dot, currentImageIndex === idx && styles.dotActive]} />
                  ))}
                </View>
              )}
            </View>
          ) : (
            <View style={[styles.heroImage, { alignItems: 'center', justifyContent: 'center', backgroundColor: '#F1F5F9' }]}>
              <Ionicons name="construct-outline" size={56} color={Colors.brandPurple} />
            </View>
          )}

          {/* Title & Category Badge */}
          <View style={styles.titleSection}>
            <View style={styles.categoryPill}>
              <Text style={styles.categoryPillText}>{item.category || 'Home Service'}</Text>
            </View>
            <Text style={styles.itemTitle}>{item.title}</Text>
            <View style={styles.serviceMetaRow}>
              <Ionicons name="shield-checkmark" size={15} color="#10B981" />
              <Text style={styles.serviceMetaText}>Verified Partner Service</Text>
              <View style={styles.metaDot} />
              <Text style={styles.serviceMetaText}>On-demand</Text>
            </View>
            <Text style={styles.serviceDescription}>
              Professional {item.category} repair and maintenance with standard pricing, certified tools, and post-service warranty.
            </Text>
          </View>

          {/* Provider Profile Banner */}
          <View style={styles.providerBanner}>
            <View style={styles.providerAvatarBox}>
              <Ionicons name="person" size={28} color={Colors.brandPurple} />
            </View>
            <View style={styles.providerInfo}>
              <View style={styles.providerNameRow}>
                <Text style={styles.providerName}>Certified Expert Partner</Text>
                <View style={styles.verifiedBadge}>
                  <Ionicons name="shield-checkmark" size={13} color="#10B981" />
                  <Text style={styles.verifiedText}>Verified</Text>
                </View>
              </View>
              <Text style={styles.providerStats}>
                Background-Checked • Certified Professional • BigBazaar Guarantee
              </Text>
            </View>
          </View>

          {/* Quick Specifications */}
          <View style={styles.serviceInfoCard}>
            <View style={styles.serviceInfoItem}>
              <Ionicons name="time-outline" size={20} color={Colors.brandPurple} />
              <View style={styles.infoCol}>
                <Text style={styles.serviceInfoLabel}>Estimated Duration</Text>
                <Text style={styles.serviceInfoValue}>{activePackage.duration}</Text>
              </View>
            </View>
            <View style={styles.serviceInfoItem}>
              <Ionicons name="location-outline" size={20} color={Colors.brandPurple} />
              <View style={styles.infoCol}>
                <Text style={styles.serviceInfoLabel}>Service Area</Text>
                <Text style={styles.serviceInfoValue}>{activeAddress?.city || 'Kottayam & nearby'}</Text>
              </View>
            </View>
            <View style={styles.serviceInfoItem}>
              <Ionicons name="shield-checkmark-outline" size={20} color="#10B981" />
              <View style={styles.infoCol}>
                <Text style={styles.serviceInfoLabel}>Warranty Coverage</Text>
                <Text style={styles.serviceInfoValue}>30-Day Guarantee</Text>
              </View>
            </View>
          </View>

          {/* Package Selection Tabs: Basic, Standard, Premium */}
          <View style={styles.packagesSection}>
            <Text style={styles.sectionHeading}>Choose a Package</Text>
            <Text style={styles.sectionSubheading}>Select the service tier that matches your exact need</Text>

            <View style={styles.packageTabs}>
              {packages.map((pkg) => {
                const isSelected = pkg.id === selectedPackageId;
                return (
                  <TouchableOpacity
                    key={pkg.id}
                    style={[styles.packageCard, isSelected && styles.selectedPackageCard]}
                    onPress={() => setSelectedPackageId(pkg.id)}>
                    {pkg.popular && (
                      <View style={styles.popularBadge}>
                        <Text style={styles.popularText}>POPULAR</Text>
                      </View>
                    )}
                    <View style={styles.packageCardHeader}>
                      <Text style={[styles.packageName, isSelected && styles.selectedPackageText]}>
                        {pkg.name}
                      </Text>
                      <Text style={[styles.packagePrice, isSelected && styles.selectedPackageText]}>
                        {formatPrice(pkg.price)}
                      </Text>
                    </View>
                    <Text style={styles.packageTagline}>{pkg.tagline}</Text>
                    <View style={styles.featureList}>
                      {pkg.features.map((feat, fIdx) => (
                        <View key={fIdx} style={styles.featureRow}>
                          <Ionicons
                            name="checkmark-circle"
                            size={14}
                            color={isSelected ? Colors.brandPurple : '#10B981'}
                          />
                          <Text style={styles.featureText}>{feat}</Text>
                        </View>
                      ))}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Preferred Arrival Slot Selector */}
          <View style={styles.slotSection}>
            <Text style={styles.sectionHeading}>Preferred Arrival Slot</Text>
            <Text style={styles.sectionSubheading}>Select your convenient service start time</Text>
            <View style={styles.slotsRow}>
              {availableSlots.map((slot) => {
                const isSelected = slot === selectedSlot;
                return (
                  <TouchableOpacity
                    key={slot}
                    style={[styles.slotChip, isSelected && styles.slotChipActive]}
                    onPress={() => setSelectedSlot(slot)}>
                    <Ionicons
                      name="time-outline"
                      size={14}
                      color={isSelected ? Colors.card : Colors.textPrimary}
                    />
                    <Text style={[styles.slotChipText, isSelected && styles.slotChipTextActive]}>
                      {slot}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Inclusions vs Exclusions Checklist */}
          <View style={styles.inclusionsSection}>
            <Text style={styles.sectionHeading}>Inclusions & Exclusions</Text>

            <View style={styles.inclusionsCard}>
              <Text style={styles.checklistTitle}>
                <Ionicons name="checkmark-done" size={16} color="#10B981" /> What’s Included
              </Text>
              {inclusions.map((itemText, i) => (
                <View key={i} style={styles.checklistItem}>
                  <Ionicons name="checkmark" size={15} color="#10B981" />
                  <Text style={styles.checklistText}>{itemText}</Text>
                </View>
              ))}

              <View style={styles.divider} />

              <Text style={[styles.checklistTitle, { color: Colors.error }]}>
                <Ionicons name="close-circle" size={16} color={Colors.error} /> What’s Excluded
              </Text>
              {exclusions.map((itemText, i) => (
                <View key={i} style={styles.checklistItem}>
                  <Ionicons name="close" size={15} color={Colors.error} />
                  <Text style={styles.checklistText}>{itemText}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Customer Reviews */}
          <View style={styles.reviewsSection}>
            <View style={styles.relatedHeader}>
              <Text style={styles.sectionHeading}>Customer Reviews</Text>
            </View>
            <View style={{ backgroundColor: Colors.white, borderRadius: 12, padding: Spacing.lg, alignItems: 'center', borderWidth: 1, borderColor: Colors.border, marginTop: Spacing.sm }}>
              <Ionicons name="chatbubble-ellipses-outline" size={32} color={Colors.disabled} />
              <Text style={{ ...Typography.bodyBold, color: Colors.textPrimary, marginTop: 8 }}>No reviews yet</Text>
              <Text style={{ ...Typography.caption, color: Colors.textSecondary, textAlign: 'center', marginTop: 4 }}>
                Verified customer reviews will appear here once bookings for this service are completed.
              </Text>
            </View>
          </View>

          {/* Similar Services */}
          {relatedServices.length > 0 && (
            <View style={styles.relatedSection}>
              <View style={styles.relatedHeader}>
                <Text style={styles.sectionHeading}>Similar Services</Text>
                <Text style={styles.relatedHint}>More in {item.category}</Text>
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.relatedScroll}>
                {relatedServices.map((service) => (
                  <TouchableOpacity
                    key={service.id}
                    style={styles.relatedCard}
                    onPress={() => navigation.push('ServiceDetails', { item: service })}>
                    <Image source={{ uri: service.imageUrl }} style={styles.relatedImage} />
                    <Text style={styles.relatedTitle} numberOfLines={2}>
                      {service.title}
                    </Text>
                    <Text style={styles.relatedPrice}>{service.price}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}

          <View style={{ height: 120 }} />
        </ScrollView>

        {/* Floating Bottom Bar: Booking only for services */}
        <View style={styles.footer}>
          <View style={styles.priceContainer}>
            <Text style={styles.priceText}>{formatPrice(activePackage.price)}</Text>
            <Text style={styles.priceSubtitle}>{activePackage.name} Package</Text>
            <Text style={styles.priceGstText}>Inclusive of 18% GST</Text>
          </View>


          <TouchableOpacity style={styles.primaryBtn} onPress={handleBookNow}>
            <Text style={styles.primaryBtnText}>Book Now</Text>
            <Ionicons name="arrow-forward" size={18} color={Colors.card} />
          </TouchableOpacity>
        </View>

        {/* Fullscreen Image Modal */}
        <Modal
          visible={imageExpanded}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setImageExpanded(false)}>
          <SafeAreaView style={styles.modalContainer}>
            <View style={styles.modalHeaderRow}>
              <View style={{ flex: 1 }} />
              <TouchableOpacity style={styles.modalCloseBtn} onPress={() => setImageExpanded(false)}>
                <Ionicons name="close" size={24} color={Colors.textPrimary} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalImageWrapper}>
              <ScrollView
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onScroll={(e) => {
                  const x = e.nativeEvent.contentOffset.x;
                  setCurrentImageIndex(Math.round(x / width));
                }}
                scrollEventThrottle={16}>
                {images.map((img, idx) => (
                  <View key={idx} style={{ width: width, justifyContent: 'center', alignItems: 'center' }}>
                    <Image source={{ uri: img }} style={styles.modalMainImage} resizeMode="contain" />
                  </View>
                ))}
              </ScrollView>
            </View>
          </SafeAreaView>
        </Modal>
      </ScreenContainer>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.sm,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
    backgroundColor: Colors.navy,
    borderBottomWidth: 1,
    borderBottomColor: Colors.navy
  },
  iconBtn: {
    padding: Spacing.xs,
    minWidth: 44,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center'
  },
  headerTitle: {
    ...Typography.heading2,
    fontSize: 18,
    color: Colors.card,
    flex: 1,
    textAlign: 'center'
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  content: {
    flex: 1,
    backgroundColor: Colors.canvas
  },
  sliderContainer: {
    width: width
  },
  heroImage: {
    width: width,
    height: width * 0.7,
    backgroundColor: Colors.sunken
  },
  paginationDots: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    bottom: Spacing.md,
    left: 0,
    right: 0
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(28,25,23,0.2)',
    marginHorizontal: 4
  },
  dotActive: {
    backgroundColor: Colors.indigo
  },
  titleSection: {
    padding: Spacing.md,
    backgroundColor: Colors.card,
    borderBottomWidth: 1,
    borderBottomColor: Colors.hairline
  },
  categoryPill: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.sunken,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radii.badge || 6,
    marginBottom: Spacing.xs,
    borderWidth: 1,
    borderColor: Colors.hairline
  },
  categoryPillText: {
    ...Typography.captionBold,
    color: Colors.indigo,
    fontSize: 12
  },
  itemTitle: {
    ...Typography.heading2,
    fontSize: 20,
    color: Colors.textPrimary,
    lineHeight: 26,
    marginBottom: Spacing.xs
  },
  serviceMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xs
  },
  serviceMetaText: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginLeft: 5
  },
  metaDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.disabled,
    marginHorizontal: 8
  },
  serviceDescription: {
    ...Typography.body,
    color: Colors.textSecondary,
    lineHeight: 21,
    marginTop: 4
  },
  providerBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    padding: Spacing.md,
    marginHorizontal: Spacing.md,
    marginTop: Spacing.md,
    borderRadius: Radii.card || 12,
    borderWidth: 1,
    borderColor: Colors.hairline,
    ...Shadows.subtle
  },
  providerAvatarBox: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.sunken,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm
  },
  providerInfo: {
    flex: 1
  },
  providerNameRow: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  providerName: {
    ...Typography.bodyBold,
    color: Colors.textPrimary,
    fontSize: 14,
    marginRight: 6
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.sunken,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: Radii.badge || 6,
    borderWidth: 1,
    borderColor: Colors.hairline
  },
  verifiedText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.emerald,
    marginLeft: 2
  },
  providerStats: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginTop: 2
  },
  serviceInfoCard: {
    marginHorizontal: Spacing.md,
    marginTop: Spacing.md,
    padding: Spacing.md,
    borderRadius: Radii.card || 12,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.hairline
  },
  serviceInfoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm
  },
  infoCol: {
    marginLeft: Spacing.sm,
    flex: 1
  },
  serviceInfoLabel: {
    ...Typography.caption,
    color: Colors.textSecondary
  },
  serviceInfoValue: {
    ...Typography.bodyBold,
    color: Colors.textPrimary,
    fontSize: 13
  },
  packagesSection: {
    marginTop: Spacing.md,
    paddingHorizontal: Spacing.md
  },
  sectionHeading: {
    ...Typography.heading2,
    fontSize: 17,
    color: Colors.textPrimary
  },
  sectionSubheading: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginTop: 2,
    marginBottom: Spacing.sm
  },
  packageTabs: {
    gap: 12
  },
  packageCard: {
    backgroundColor: Colors.card,
    borderRadius: Radii.card || 12,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.hairline
  },
  selectedPackageCard: {
    borderColor: Colors.indigo,
    borderWidth: 2,
    backgroundColor: Colors.card
  },
  popularBadge: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.terracotta,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: Radii.badge || 6,
    marginBottom: 6
  },
  popularText: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.card
  },
  packageCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  packageName: {
    ...Typography.bodyBold,
    fontSize: 16,
    color: Colors.textPrimary
  },
  packagePrice: {
    ...Typography.heading2,
    fontSize: 18,
    color: Colors.indigo,
    fontVariant: ['tabular-nums']
  },
  selectedPackageText: {
    color: Colors.indigo
  },
  packageTagline: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginTop: 2,
    marginBottom: Spacing.sm
  },
  featureList: {
    gap: 6,
    borderTopWidth: 1,
    borderTopColor: Colors.hairline,
    paddingTop: Spacing.sm
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  featureText: {
    ...Typography.body,
    fontSize: 13,
    color: Colors.textSecondary,
    marginLeft: 6
  },
  inclusionsSection: {
    marginTop: Spacing.lg,
    paddingHorizontal: Spacing.md
  },
  inclusionsCard: {
    backgroundColor: Colors.card,
    padding: Spacing.md,
    borderRadius: Radii.card || 12,
    borderWidth: 1,
    borderColor: Colors.hairline,
    marginTop: Spacing.sm
  },
  checklistTitle: {
    ...Typography.bodyBold,
    fontSize: 14,
    color: Colors.emerald,
    marginBottom: Spacing.xs
  },
  checklistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6
  },
  checklistText: {
    ...Typography.body,
    fontSize: 13,
    color: Colors.textSecondary,
    marginLeft: 6,
    flex: 1
  },
  divider: {
    height: 1,
    backgroundColor: Colors.hairline,
    marginVertical: Spacing.sm
  },
  reviewsSection: {
    marginTop: Spacing.lg,
    paddingHorizontal: Spacing.md
  },
  ratingSummary: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  ratingSummaryText: {
    ...Typography.captionBold,
    color: Colors.textSecondary,
    marginLeft: 4,
    fontVariant: ['tabular-nums']
  },
  reviewCard: {
    backgroundColor: Colors.card,
    borderRadius: Radii.card || 12,
    padding: Spacing.md,
    marginTop: Spacing.xs,
    borderWidth: 1,
    borderColor: Colors.hairline
  },
  reviewTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  reviewName: {
    ...Typography.bodyBold,
    color: Colors.textPrimary,
    fontSize: 13
  },
  reviewRating: {
    ...Typography.captionBold,
    color: Colors.terracotta,
    fontVariant: ['tabular-nums']
  },
  reviewDate: {
    ...Typography.caption,
    color: Colors.disabled,
    fontSize: 11,
    marginTop: 1
  },
  reviewText: {
    ...Typography.body,
    color: Colors.textSecondary,
    marginTop: 4,
    lineHeight: 18,
    fontSize: 13
  },
  relatedSection: {
    marginTop: Spacing.lg,
    paddingHorizontal: Spacing.md
  },
  relatedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.xs
  },
  relatedHint: {
    ...Typography.caption,
    color: Colors.textSecondary
  },
  relatedScroll: {
    paddingRight: Spacing.md,
    paddingTop: Spacing.xs
  },
  relatedCard: {
    width: 150,
    marginRight: Spacing.sm,
    backgroundColor: Colors.card,
    borderRadius: Radii.card || 12,
    borderWidth: 1,
    borderColor: Colors.hairline,
    overflow: 'hidden',
    paddingBottom: Spacing.sm
  },
  relatedImage: {
    width: '100%',
    height: 90,
    backgroundColor: Colors.sunken
  },
  relatedTitle: {
    ...Typography.bodyBold,
    fontSize: 12,
    color: Colors.textPrimary,
    paddingHorizontal: Spacing.sm,
    marginTop: Spacing.xs
  },
  relatedPrice: {
    ...Typography.captionBold,
    color: Colors.indigo,
    paddingHorizontal: Spacing.sm,
    marginTop: 3,
    fontVariant: ['tabular-nums']
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.card,
    borderTopWidth: 1,
    borderTopColor: Colors.hairline,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 2,
    paddingBottom: Spacing.lg,
    gap: 8,
    ...Shadows.floating
  },
  priceContainer: {
    marginRight: 6
  },
  priceText: {
    ...Typography.heading2,
    fontSize: 20,
    color: Colors.navy,
    fontVariant: ['tabular-nums']
  },
  priceSubtitle: {
    ...Typography.caption,
    color: Colors.textSecondary,
    fontSize: 11
  },
  secondaryBtn: {
    flex: 1,
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: Radii.button || 8,
    borderWidth: 1,
    borderColor: Colors.hairline,
    backgroundColor: Colors.card,
    gap: 4
  },
  secondaryBtnText: {
    ...Typography.bodyBold,
    color: Colors.textPrimary,
    fontSize: 13
  },
  primaryBtn: {
    flex: 1.2,
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: Radii.button || 8,
    backgroundColor: Colors.indigo,
    gap: 4
  },
  primaryBtnText: {
    ...Typography.bodyBold,
    color: Colors.card,
    fontSize: 14
  },
  modalContainer: {
    flex: 1,
    backgroundColor: Colors.canvas
  },
  modalHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md
  },
  modalCloseBtn: {
    padding: Spacing.sm,
    backgroundColor: Colors.sunken,
    borderRadius: 20
  },
  modalImageWrapper: {
    flex: 1,
    justifyContent: 'center'
  },
  modalMainImage: {
    width: '100%',
    height: '100%'
  },
  slotSection: {
    paddingHorizontal: Spacing.md,
    marginTop: Spacing.lg
  },
  slotsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: Spacing.sm
  },
  slotChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.hairline || '#E2E8F0',
    backgroundColor: Colors.card
  },
  slotChipActive: {
    backgroundColor: Colors.brandPurple,
    borderColor: Colors.brandPurple
  },
  slotChipText: {
    ...Typography.captionBold,
    color: Colors.textPrimary
  },
  slotChipTextActive: {
    color: Colors.card
  },
  priceGstText: {
    fontSize: 10,
    color: '#10B981',
    fontWeight: '600',
    marginTop: 1
  }
});
