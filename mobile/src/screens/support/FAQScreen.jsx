import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import ScreenContainer from '../../components/ScreenContainer';
import Colors from '../../constants/colors';
import Typography from '../../constants/typography';
import Spacing from '../../constants/spacing';
import Radii from '../../constants/radii';
import Shadows from '../../constants/shadows';

const FAQ_CATEGORIES = ['All', 'Orders', 'Payments', 'Bookings', 'Returns & Refunds', 'Safety'];

const FAQ_DATA = [
  {
    id: 'faq-1',
    category: 'Orders',
    question: 'How do I track my delivery status in real-time?',
    answer: 'Go to "My Orders" from your account tab. Tap on any active order to see its 5-step live tracking timeline from Order Placed, Confirmed, Shipped, to Out for Delivery.'
  },
  {
    id: 'faq-2',
    category: 'Orders',
    question: 'Can I cancel an order after placing it?',
    answer: 'Yes! You can cancel your order anytime before it is dispatched (while status is "Placed" or "Confirmed"). Tap "Cancel" on the order card. A full refund will be credited to your original payment mode.'
  },
  {
    id: 'faq-3',
    category: 'Payments',
    question: 'What payment modes are accepted on MyBigBazaar?',
    answer: 'We support all major payment modes across India: Instant UPI (Google Pay, PhonePe, Paytm, BHIM), Credit & Debit Cards (Visa, MasterCard, RuPay), Net Banking (HDFC, SBI, ICICI, Axis), and Cash on Delivery (COD).'
  },
  {
    id: 'faq-4',
    category: 'Payments',
    question: 'How does BigBazaar Escrow Buyer Protection work?',
    answer: 'When you purchase a product or service, your payment is held securely in an escrow account. The funds are only released to the seller or service partner after you receive the item or confirm the job is satisfactorily completed.'
  },
  {
    id: 'faq-5',
    category: 'Bookings',
    question: 'How do I reschedule or cancel a domestic service booking?',
    answer: 'Navigate to "Bookings" from the bottom bar. Select your upcoming booking and tap "Reschedule" to pick a new date or slot, or "Cancel Booking" if you no longer require the service.'
  },
  {
    id: 'faq-6',
    category: 'Returns & Refunds',
    question: 'How long does it take for a refund to reflect in my bank?',
    answer: 'UPI refunds are processed instantly within 15–30 minutes. Credit/Debit Card and Net Banking refunds are credited within 3–5 working days depending on your issuing bank.'
  },
  {
    id: 'faq-7',
    category: 'Returns & Refunds',
    question: 'What if an item is damaged or not as described by the seller?',
    answer: 'Submit a dispute ticket in "Help & Dispute Support" within 48 hours of delivery with photos of the item. Our team will review the issue and initiate a return pickup and full refund.'
  },
  {
    id: 'faq-8',
    category: 'Safety',
    question: 'Are service professionals verified before being dispatched?',
    answer: 'Yes. Every plumber, electrician, tutor, and home technician on MyBigBazaar undergoes government Aadhaar KYC verification, police background verification, and trade qualification checks.'
  }
];

export const FAQScreen = () => {
  const navigation = useNavigation();
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedIds, setExpandedIds] = useState(['faq-1']); // First expanded by default
  const [feedbackState, setFeedbackState] = useState({});

  const toggleAccordion = (id) => {
    setExpandedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleFeedback = (faqId, isHelpful) => {
    setFeedbackState((prev) => ({ ...prev, [faqId]: isHelpful }));
    Alert.alert('Feedback Recorded', 'Thank you for helping us improve our FAQ articles!');
  };

  const filteredFAQs = FAQ_DATA.filter((faq) => {
    const matchesCategory =
      activeCategory === 'All' ? true : faq.category === activeCategory;

    const matchesSearch =
      searchQuery.trim() === ''
        ? true
        : faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
          faq.answer.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  return (
    <ScreenContainer noPadding style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Frequently Asked Questions</Text>
        <View style={{ width: 32 }} />
      </View>

      {/* Search Input */}
      <View style={styles.searchBox}>
        <Ionicons name="search" size={18} color={Colors.textSecondary} />
        <TextInput
          style={styles.searchInput}
          placeholder="Ask a question or search keywords..."
          placeholderTextColor={Colors.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={18} color={Colors.disabled} />
          </TouchableOpacity>
        )}
      </View>

      {/* Category Pills */}
      <View style={styles.categoryBar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryScroll}>
          {FAQ_CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[styles.catChip, activeCategory === cat && styles.catChipActive]}
              onPress={() => setActiveCategory(cat)}
            >
              <Text style={[styles.catChipText, activeCategory === cat && styles.catChipTextActive]}>
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Contact Support Banner */}
        <TouchableOpacity
          style={styles.supportBanner}
          onPress={() => navigation.navigate('HelpSupport')}
        >
          <View style={styles.supportIconBg}>
            <Ionicons name="chatbubbles" size={22} color={Colors.primary} />
          </View>
          <View style={{ flex: 1, marginLeft: Spacing.sm }}>
            <Text style={styles.supportBannerTitle}>Need personalized assistance?</Text>
            <Text style={styles.supportBannerSub}>
              Submit a dispute ticket or chat with customer support
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={Colors.textSecondary} />
        </TouchableOpacity>

        {/* FAQs Accordion */}
        <Text style={styles.sectionHeader}>
          {activeCategory === 'All' ? 'Common Topics' : `${activeCategory} FAQs`} ({filteredFAQs.length})
        </Text>

        {filteredFAQs.length === 0 ? (
          <View style={styles.emptyBox}>
            <Ionicons name="search-outline" size={48} color={Colors.disabled} />
            <Text style={styles.emptyTitle}>No matching answers found</Text>
            <Text style={styles.emptySub}>Try searching for another keyword or reach out to support.</Text>
          </View>
        ) : (
          filteredFAQs.map((faq) => {
            const isExpanded = expandedIds.includes(faq.id);
            const userRating = feedbackState[faq.id];

            return (
              <View key={faq.id} style={styles.faqCard}>
                <TouchableOpacity
                  style={styles.faqQuestionRow}
                  onPress={() => toggleAccordion(faq.id)}
                  activeOpacity={0.7}
                >
                  <View style={styles.catTag}>
                    <Text style={styles.catTagText}>{faq.category}</Text>
                  </View>
                  <Text style={styles.faqQuestionText}>{faq.question}</Text>
                  <Ionicons
                    name={isExpanded ? 'chevron-up' : 'chevron-down'}
                    size={20}
                    color={Colors.textSecondary}
                  />
                </TouchableOpacity>

                {isExpanded && (
                  <View style={styles.faqAnswerContainer}>
                    <Text style={styles.faqAnswerText}>{faq.answer}</Text>

                    {/* Helpful Prompt */}
                    <View style={styles.feedbackRow}>
                      <Text style={styles.feedbackPrompt}>Was this helpful?</Text>
                      <TouchableOpacity
                        style={[styles.feedbackBtn, userRating === true && styles.feedbackBtnSelected]}
                        onPress={() => handleFeedback(faq.id, true)}
                      >
                        <Ionicons name="thumbs-up-outline" size={14} color={userRating === true ? '#059669' : Colors.textSecondary} />
                        <Text style={[styles.feedbackBtnText, userRating === true && { color: '#059669' }]}>Yes</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[styles.feedbackBtn, userRating === false && styles.feedbackBtnSelected]}
                        onPress={() => handleFeedback(faq.id, false)}
                      >
                        <Ionicons name="thumbs-down-outline" size={14} color={userRating === false ? '#DC2626' : Colors.textSecondary} />
                        <Text style={[styles.feedbackBtnText, userRating === false && { color: '#DC2626' }]}>No</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
              </View>
            );
          })
        )}
      </ScrollView>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 0
  },
  backBtn: {
    padding: Spacing.xs
  },
  headerTitle: {
    ...Typography.heading2,
    color: Colors.textPrimary
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: Spacing.md,
    marginTop: Spacing.xs,
    paddingHorizontal: Spacing.md,
    height: 44,
    borderRadius: Radii.control,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 8
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: Colors.textPrimary
  },
  categoryBar: {
    backgroundColor: '#FFFFFF',
    paddingVertical: Spacing.xs,
    marginTop: Spacing.xs
  },
  categoryScroll: {
    paddingHorizontal: Spacing.md,
    gap: 8
  },
  catChip: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: Radii.pill,
    backgroundColor: '#F1F5F9'
  },
  catChipActive: {
    backgroundColor: Colors.primary
  },
  catChipText: {
    ...Typography.captionBold,
    color: Colors.textSecondary,
    fontSize: 12
  },
  catChipTextActive: {
    color: '#FFFFFF'
  },
  scrollContent: {
    padding: Spacing.md,
    paddingBottom: Spacing.xxl
  },
  supportBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    padding: Spacing.md,
    borderRadius: Radii.card,
    borderWidth: 1,
    borderColor: '#BAE6FD',
    marginBottom: Spacing.md,
    ...Shadows.card
  },
  supportIconBg: {
    width: 40,
    height: 40,
    borderRadius: Radii.control,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center'
  },
  supportBannerTitle: {
    ...Typography.bodyBold,
    fontSize: 13,
    color: '#0369A1'
  },
  supportBannerSub: {
    ...Typography.caption,
    fontSize: 11,
    color: '#0284C7',
    marginTop: 2
  },
  sectionHeader: {
    ...Typography.heading3,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm
  },
  faqCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: Radii.card,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.card
  },
  faqQuestionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  catTag: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4
  },
  catTagText: {
    fontSize: 9,
    fontWeight: '700',
    color: Colors.textSecondary
  },
  faqQuestionText: {
    ...Typography.bodyBold,
    fontSize: 13,
    color: Colors.textPrimary,
    flex: 1
  },
  faqAnswerContainer: {
    marginTop: Spacing.sm,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9'
  },
  faqAnswerText: {
    ...Typography.body,
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 19
  },
  feedbackRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.md,
    paddingTop: Spacing.xs,
    gap: 8
  },
  feedbackPrompt: {
    ...Typography.caption,
    color: Colors.textSecondary,
    fontSize: 11
  },
  feedbackBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 4
  },
  feedbackBtnSelected: {
    backgroundColor: '#F1F5F9',
    borderColor: Colors.primary
  },
  feedbackBtnText: {
    ...Typography.captionBold,
    fontSize: 11,
    color: Colors.textSecondary
  },
  emptyBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60
  },
  emptyTitle: {
    ...Typography.heading3,
    color: Colors.textPrimary,
    marginTop: Spacing.sm
  },
  emptySub: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginTop: 4
  }
});

export default FAQScreen;