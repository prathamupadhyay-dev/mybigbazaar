import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useApp } from '../../context/AppContext';
import ScreenContainer from '../../components/ScreenContainer';
import Colors from '../../constants/colors';
import Typography from '../../constants/typography';
import Spacing from '../../constants/spacing';
import Radii from '../../constants/radii';
import Shadows from '../../constants/shadows';
import { formatCurrency } from '../../utils/formatters';
import AuthRequiredState from '../../components/common/AuthRequiredState';

const DATES = ['Today', 'Tomorrow', 'Day After', '28 Sep', '29 Sep', '30 Sep'];
const TIME_SLOTS = ['09:00 AM - 12:00 PM', '01:00 PM - 04:00 PM', '05:00 PM - 08:00 PM'];
const CANCEL_REASONS = [
  'Change of plans / Schedule conflict',
  'Found alternative technician',
  'Issue resolved on its own',
  'Booked by mistake',
  'Other'
];
const REVIEW_TAGS = ['On-time', 'Polite', 'Clean work', 'Great value', 'Expert diagnostics'];

export default function BookingsScreen() {
  const navigation = useNavigation();
  const { bookings, refreshBookings, cancelBooking, rescheduleBooking, rateBooking, user, isAuthenticated } = useApp();

  useEffect(() => {
    refreshBookings();
  }, [refreshBookings]);

  const [activeTab, setActiveTab] = useState('upcoming'); // 'upcoming' | 'history'

  // Reschedule Modal State
  const [rescheduleTarget, setRescheduleTarget] = useState(null);
  const [newDate, setNewDate] = useState(DATES[1]);
  const [newTimeSlot, setNewTimeSlot] = useState(TIME_SLOTS[0]);

  // Cancel Modal State
  const [cancelTarget, setCancelTarget] = useState(null);
  const [cancelReason, setCancelReason] = useState(CANCEL_REASONS[0]);

  // Rate & Review Modal State
  const [ratingTarget, setRatingTarget] = useState(null);
  const [selectedStars, setSelectedStars] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [selectedTags, setSelectedTags] = useState(['On-time', 'Clean work']);

  // Filter bookings for tabs
  const upcomingBookings = bookings.filter(
    (b) =>
      b.status === 'Upcoming' ||
      b.status === 'confirmed' ||
      b.status === 'assigned' ||
      b.status === 'In-Progress' ||
      b.status === 'in_progress' ||
      b.status === 'pending'
  );

  const historyBookings = bookings.filter(
    (b) =>
      b.status === 'Completed' ||
      b.status === 'completed' ||
      b.status === 'Cancelled' ||
      b.status === 'cancelled'
  );

  const displayedBookings = activeTab === 'upcoming' ? upcomingBookings : historyBookings;

  const steps = ['Confirmed', 'Assigned', 'In Progress', 'Completed'];
  const getStepIndex = (status) =>
    ({
      Upcoming: 1,
      confirmed: 1,
      Pending: 0,
      pending: 0,
      assigned: 1,
      'In-Progress': 2,
      in_progress: 2,
      Completed: 3,
      completed: 3,
      Cancelled: 0,
      cancelled: 0
    }[status] ?? 0);

  // Actions
  const handleOpenReschedule = (booking) => {
    setRescheduleTarget(booking);
    setNewDate(booking.scheduledDate || DATES[1]);
    setNewTimeSlot(booking.scheduledTimeSlot || TIME_SLOTS[0]);
  };

  const handleConfirmReschedule = () => {
    if (!rescheduleTarget) return;
    rescheduleBooking(rescheduleTarget.id, newDate, newTimeSlot);
    Alert.alert(
      'Slot Rescheduled',
      `Booking #${rescheduleTarget.bookingId} has been moved to ${newDate} at ${newTimeSlot}.`
    );
    setRescheduleTarget(null);
  };

  const handleOpenCancel = (booking) => {
    setCancelTarget(booking);
    setCancelReason(CANCEL_REASONS[0]);
  };

  const handleConfirmCancel = () => {
    if (!cancelTarget) return;
    Alert.alert(
      'Confirm Cancellation',
      `Are you sure you want to cancel booking #${cancelTarget.bookingId}?`,
      [
        { text: 'Keep Booking', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: () => {
            cancelBooking(cancelTarget.id);
            setCancelTarget(null);
            Alert.alert('Booking Cancelled', 'Your booking has been cancelled.');
          }
        }
      ]
    );
  };

  const handleOpenRate = (booking) => {
    setRatingTarget(booking);
    setSelectedStars(booking.userRating || 5);
    setReviewComment(booking.userReview || '');
    setSelectedTags(['On-time', 'Clean work']);
  };

  const handleToggleTag = (tag) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleConfirmRate = () => {
    if (!ratingTarget) return;
    const finalComment = selectedTags.length > 0
      ? `${reviewComment ? reviewComment + ' • ' : ''}Tags: ${selectedTags.join(', ')}`
      : reviewComment;

    rateBooking(ratingTarget.id, selectedStars, finalComment);
    Alert.alert('Thank You! ⭐', 'Your feedback has been recorded.');
    setRatingTarget(null);
  };

  const handleBookAgain = (item) => {
    navigation.navigate('ServiceBooking', {
      categoryName: item.category || item.serviceName,
      subCategoryName: item.subCategoryName || item.serviceName,
      amount: item.amount
    });
  };

  const handleChatProvider = (item) => {
    navigation.navigate('Chats');
  };

  const renderBookingItem = ({ item }) => {
    const activeStep = getStepIndex(item.status);
    const isCancelled = item.status === 'Cancelled' || item.status === 'cancelled';
    const isCompleted = item.status === 'Completed' || item.status === 'completed';

    return (
      <View style={styles.card}>
        {/* Top Header */}
        <View style={styles.cardTop}>
          <View style={styles.cardIconBox}>
            <Ionicons name="construct-outline" size={22} color={Colors.brandPurple} />
          </View>
          <View style={styles.cardMainInfo}>
            <Text style={styles.serviceTitle}>{item.serviceName}</Text>
            {item.subCategoryName && (
              <Text style={styles.subCategoryText}>{item.subCategoryName}</Text>
            )}
            <Text style={styles.providerText}>
              By {item.providerName || 'Assigned Certified Partner'}
            </Text>
          </View>
          <View
            style={[
              styles.statusBadge,
              isCancelled && styles.statusBadgeCancelled,
              isCompleted && styles.statusBadgeCompleted
            ]}>
            <Text
              style={[
                styles.statusBadgeText,
                isCancelled && styles.statusBadgeTextCancelled,
                isCompleted && styles.statusBadgeTextCompleted
              ]}>
              {item.status}
            </Text>
          </View>
        </View>

        {/* Schedule & Address Details */}
        <View style={styles.detailsBox}>
          <View style={styles.detailRow}>
            <Ionicons name="calendar-outline" size={15} color={Colors.primary} />
            <Text style={styles.detailText}>{item.scheduledDate}</Text>
          </View>
          <View style={styles.detailRow}>
            <Ionicons name="time-outline" size={15} color={Colors.primary} />
            <Text style={styles.detailText}>{item.scheduledTimeSlot}</Text>
          </View>
          <View style={styles.detailRow}>
            <Ionicons name="location-outline" size={15} color={Colors.textSecondary} />
            <Text style={styles.detailText} numberOfLines={1}>
              {item.serviceAddress || 'Address on file'}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Ionicons name="receipt-outline" size={15} color={Colors.textSecondary} />
            <Text style={styles.detailPriceText}>
              Booking #{item.bookingId} • {formatCurrency(item.amount)} ({item.paymentMode || 'COD'})
            </Text>
          </View>
        </View>

        {/* Stepper (Only on active/upcoming bookings) */}
        {!isCancelled && !isCompleted && (
          <View style={styles.stepperContainer}>
            {steps.map((step, index) => (
              <View key={step} style={styles.stepItem}>
                <View
                  style={[
                    styles.stepDot,
                    index <= activeStep && styles.stepDotActive
                  ]}
                />
                <Text
                  style={[
                    styles.stepLabel,
                    index <= activeStep && styles.stepLabelActive
                  ]}
                  numberOfLines={1}>
                  {step}
                </Text>
                {index < steps.length - 1 && (
                  <View
                    style={[
                      styles.stepLine,
                      index < activeStep && styles.stepLineActive
                    ]}
                  />
                )}
              </View>
            ))}
          </View>
        )}

        {/* Action Buttons: Upcoming */}
        {!isCancelled && !isCompleted && (
          <View style={styles.actionRow}>
            <TouchableOpacity
              style={styles.actionBtnSecondary}
              onPress={() => handleOpenReschedule(item)}>
              <Ionicons name="calendar-outline" size={14} color={Colors.primary} />
              <Text style={styles.actionBtnSecondaryText}>Reschedule</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionBtnChat}
              onPress={() => handleChatProvider(item)}>
              <Ionicons name="chatbubble-ellipses-outline" size={14} color={Colors.primary} />
              <Text style={styles.actionBtnChatText}>Chat</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionBtnCancel}
              onPress={() => handleOpenCancel(item)}>
              <Text style={styles.actionBtnCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Action Buttons: History (Completed / Cancelled) */}
        {isCompleted && (
          <View style={styles.historyActionRow}>
            <TouchableOpacity
              style={styles.rateBtn}
              onPress={() => handleOpenRate(item)}>
              <Ionicons name="star" size={15} color="#F59E0B" />
              <Text style={styles.rateBtnText}>
                {item.userRating ? `Rated ★ ${item.userRating}` : 'Rate & Review'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.bookAgainBtn}
              onPress={() => handleBookAgain(item)}>
              <Ionicons name="repeat" size={15} color={Colors.white} />
              <Text style={styles.bookAgainBtnText}>Book Again</Text>
            </TouchableOpacity>
          </View>
        )}

        {isCancelled && (
          <View style={styles.cancelledNoteRow}>
            <Text style={styles.cancelledNote}>
              Reason: {item.cancellationReason || 'Cancelled by customer'}
            </Text>
            <TouchableOpacity
              style={styles.rebookBtn}
              onPress={() => handleBookAgain(item)}>
              <Text style={styles.rebookBtnText}>Rebook</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  return (
    <ScreenContainer noPadding style={styles.screen}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          accessibilityLabel="Back">
          <Ionicons name="arrow-back" size={24} color={Colors.card} />
        </TouchableOpacity>
        <Text style={styles.title}>My Bookings</Text>
        <View style={{ width: 24 }} />
      </View>

      {!isAuthenticated || !user ? (
        <AuthRequiredState
          title="My Bookings"
          message="Sign in to view your scheduled service appointments and track technicians."
        />
      ) : (
        <>
          {/* Tabs: Upcoming vs History */}
          <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tabItem, activeTab === 'upcoming' && styles.tabItemActive]}
          onPress={() => setActiveTab('upcoming')}>
          <Text
            style={[styles.tabText, activeTab === 'upcoming' && styles.tabTextActive]}>
            Upcoming ({upcomingBookings.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabItem, activeTab === 'history' && styles.tabItemActive]}
          onPress={() => setActiveTab('history')}>
          <Text
            style={[styles.tabText, activeTab === 'history' && styles.tabTextActive]}>
            History ({historyBookings.length})
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={displayedBookings}
        keyExtractor={(item) => item.id}
        renderItem={renderBookingItem}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="calendar-outline" size={62} color={Colors.disabled} />
            <Text style={styles.emptyTitle}>
              {activeTab === 'upcoming' ? 'No active bookings' : 'No past bookings'}
            </Text>
            <Text style={styles.emptySubtitle}>
              {activeTab === 'upcoming'
                ? 'Scheduled services will appear here with real-time status.'
                : 'Completed and cancelled services will be archived here.'}
            </Text>
            <TouchableOpacity
              style={styles.book}
              onPress={() => navigation.navigate('Main', { screen: 'Services' })}>
              <Text style={styles.bookText}>Browse Services</Text>
            </TouchableOpacity>
          </View>
        }
      />

      {/* Reschedule Slot Modal */}
      <Modal
        visible={!!rescheduleTarget}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setRescheduleTarget(null)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Reschedule Booking</Text>
              <TouchableOpacity onPress={() => setRescheduleTarget(null)}>
                <Ionicons name="close" size={22} color={Colors.textPrimary} />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalSub}>Select new arrival date:</Text>
            <View style={styles.modalChipsRow}>
              {DATES.map((dt) => (
                <TouchableOpacity
                  key={dt}
                  style={[styles.modalChip, dt === newDate && styles.modalChipSelected]}
                  onPress={() => setNewDate(dt)}>
                  <Text style={[styles.modalChipText, dt === newDate && styles.modalChipTextSelected]}>
                    {dt}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={[styles.modalSub, { marginTop: Spacing.md }]}>Select time window:</Text>
            <View style={styles.modalSlotsCol}>
              {TIME_SLOTS.map((slot) => (
                <TouchableOpacity
                  key={slot}
                  style={[styles.modalSlotBtn, slot === newTimeSlot && styles.modalSlotBtnSelected]}
                  onPress={() => setNewTimeSlot(slot)}>
                  <Ionicons
                    name="time-outline"
                    size={16}
                    color={slot === newTimeSlot ? Colors.primary : Colors.textSecondary}
                  />
                  <Text
                    style={[
                      styles.modalSlotText,
                      slot === newTimeSlot && styles.modalSlotTextSelected
                    ]}>
                    {slot}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity style={styles.modalActionBtn} onPress={handleConfirmReschedule}>
              <Text style={styles.modalActionBtnText}>Confirm New Time</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Cancel Booking Modal (Destructive confirmation) */}
      <Modal
        visible={!!cancelTarget}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setCancelTarget(null)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: Colors.error }]}>Cancel Booking</Text>
              <TouchableOpacity onPress={() => setCancelTarget(null)}>
                <Ionicons name="close" size={22} color={Colors.textPrimary} />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalSub}>Please select a cancellation reason:</Text>
            <View style={{ gap: 8, marginTop: Spacing.xs }}>
              {CANCEL_REASONS.map((reason) => (
                <TouchableOpacity
                  key={reason}
                  style={[
                    styles.reasonItem,
                    cancelReason === reason && styles.reasonItemSelected
                  ]}
                  onPress={() => setCancelReason(reason)}>
                  <Ionicons
                    name={cancelReason === reason ? 'radio-button-on' : 'radio-button-off'}
                    size={18}
                    color={cancelReason === reason ? Colors.error : Colors.disabled}
                  />
                  <Text style={styles.reasonText}>{reason}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              style={[styles.modalActionBtn, { backgroundColor: Colors.error }]}
              onPress={handleConfirmCancel}>
              <Text style={styles.modalActionBtnText}>Proceed to Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Rate & Review Modal */}
      <Modal
        visible={!!ratingTarget}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setRatingTarget(null)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Rate Your Service</Text>
              <TouchableOpacity onPress={() => setRatingTarget(null)}>
                <Ionicons name="close" size={22} color={Colors.textPrimary} />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalSub}>
              How was your service with {ratingTarget?.providerName || 'the professional'}?
            </Text>

            {/* 5 Stars Picker */}
            <View style={styles.starsRow}>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity key={star} onPress={() => setSelectedStars(star)}>
                  <Ionicons
                    name={star <= selectedStars ? 'star' : 'star-outline'}
                    size={36}
                    color="#F59E0B"
                  />
                </TouchableOpacity>
              ))}
            </View>

            <Text style={[styles.modalSub, { marginTop: Spacing.sm }]}>Quick feedback tags:</Text>
            <View style={styles.tagsRow}>
              {REVIEW_TAGS.map((tag) => {
                const isSelected = selectedTags.includes(tag);
                return (
                  <TouchableOpacity
                    key={tag}
                    style={[styles.tagPill, isSelected && styles.tagPillSelected]}
                    onPress={() => handleToggleTag(tag)}>
                    <Text style={[styles.tagPillText, isSelected && styles.tagPillTextSelected]}>
                      {tag}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <Text style={[styles.modalSub, { marginTop: Spacing.md }]}>Write a review (Optional):</Text>
            <TextInput
              style={styles.reviewInput}
              placeholder="Was the work done properly? Any highlights?"
              placeholderTextColor={Colors.textSecondary}
              multiline
              numberOfLines={3}
              value={reviewComment}
              onChangeText={setReviewComment}
            />

            <TouchableOpacity style={styles.modalActionBtn} onPress={handleConfirmRate}>
              <Text style={styles.modalActionBtnText}>Submit Feedback</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
        </>
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.canvas
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
    backgroundColor: Colors.navy,
    borderBottomWidth: 1,
    borderBottomColor: Colors.navy
  },
  title: {
    ...Typography.heading2,
    color: Colors.card,
    fontSize: 18
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: Colors.card,
    borderBottomWidth: 1,
    borderBottomColor: Colors.hairline
  },
  tabItem: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
    minHeight: 44,
    justifyContent: 'center'
  },
  tabItemActive: {
    borderBottomColor: Colors.navy
  },
  tabText: {
    ...Typography.bodyBold,
    fontSize: 14,
    color: Colors.textSecondary
  },
  tabTextActive: {
    color: Colors.navy
  },
  list: {
    padding: Spacing.md,
    paddingBottom: 130
  },
  card: {
    backgroundColor: Colors.card,
    borderRadius: Radii.card || 12,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.hairline,
    ...Shadows.card
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'flex-start'
  },
  cardIconBox: {
    width: 44,
    height: 44,
    borderRadius: Radii.input || 8,
    backgroundColor: Colors.sunken,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.hairline
  },
  cardMainInfo: {
    flex: 1,
    marginRight: Spacing.xs
  },
  serviceTitle: {
    ...Typography.bodyBold,
    fontSize: 16,
    color: Colors.textPrimary
  },
  subCategoryText: {
    ...Typography.caption,
    color: Colors.indigo,
    fontWeight: '600',
    marginTop: 2
  },
  providerText: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginTop: 2
  },
  statusBadge: {
    backgroundColor: Colors.sunken,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: Radii.badge || 6,
    borderWidth: 1,
    borderColor: Colors.hairline
  },
  statusBadgeCompleted: {
    borderColor: Colors.emerald
  },
  statusBadgeCancelled: {
    borderColor: Colors.crimson
  },
  statusBadgeText: {
    ...Typography.captionBold,
    color: Colors.navy,
    fontSize: 11
  },
  statusBadgeTextCompleted: {
    color: Colors.emerald
  },
  statusBadgeTextCancelled: {
    color: Colors.crimson
  },
  detailsBox: {
    backgroundColor: Colors.sunken,
    padding: Spacing.sm + 2,
    borderRadius: Radii.input || 8,
    marginTop: Spacing.sm,
    gap: 5,
    borderWidth: 1,
    borderColor: Colors.hairline
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  detailText: {
    ...Typography.caption,
    color: Colors.textPrimary,
    flex: 1
  },
  detailPriceText: {
    ...Typography.captionBold,
    color: Colors.navy,
    marginTop: 2,
    fontVariant: ['tabular-nums']
  },
  stepperContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: Spacing.md,
    paddingHorizontal: 4
  },
  stepItem: {
    flex: 1,
    alignItems: 'center',
    position: 'relative'
  },
  stepDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.hairline,
    zIndex: 2
  },
  stepDotActive: {
    backgroundColor: Colors.emerald
  },
  stepLine: {
    position: 'absolute',
    top: 4,
    left: '50%',
    right: '-50%',
    height: 2,
    backgroundColor: Colors.hairline
  },
  stepLineActive: {
    backgroundColor: Colors.emerald
  },
  stepLabel: {
    ...Typography.caption,
    color: Colors.textSecondary,
    fontSize: 9,
    textAlign: 'center',
    marginTop: 5
  },
  stepLabelActive: {
    color: Colors.navy,
    fontWeight: '700'
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: Spacing.md,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.hairline
  },
  actionBtnSecondary: {
    flex: 1.2,
    minHeight: 40,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: Radii.input || 8,
    borderWidth: 1,
    borderColor: Colors.hairline,
    backgroundColor: Colors.card,
    gap: 4
  },
  actionBtnSecondaryText: {
    ...Typography.captionBold,
    color: Colors.navy,
    fontSize: 12
  },
  actionBtnCall: {
    flex: 0.8,
    minHeight: 40,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: Radii.input || 8,
    borderWidth: 1,
    borderColor: Colors.emerald,
    backgroundColor: Colors.sunken,
    gap: 4
  },
  actionBtnCallText: {
    ...Typography.captionBold,
    color: Colors.emerald,
    fontSize: 12
  },
  actionBtnChat: {
    flex: 0.8,
    minHeight: 40,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: Radii.input || 8,
    borderWidth: 1,
    borderColor: Colors.hairline,
    backgroundColor: Colors.sunken,
    gap: 4
  },
  actionBtnChatText: {
    ...Typography.captionBold,
    color: Colors.navy,
    fontSize: 12
  },
  actionBtnCancel: {
    minHeight: 40,
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 10
  },
  actionBtnCancelText: {
    ...Typography.captionBold,
    color: Colors.error,
    fontSize: 12
  },
  historyActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: Spacing.md,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.hairline
  },
  rateBtn: {
    flex: 1,
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: Radii.button || 8,
    borderWidth: 1,
    borderColor: Colors.hairline,
    backgroundColor: Colors.sunken,
    gap: 5
  },
  rateBtnText: {
    ...Typography.captionBold,
    color: Colors.navy,
    fontSize: 13
  },
  bookAgainBtn: {
    flex: 1,
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: Radii.button || 8,
    backgroundColor: Colors.terracotta,
    gap: 5
  },
  bookAgainBtnText: {
    ...Typography.captionBold,
    color: Colors.card,
    fontSize: 13
  },
  cancelledNoteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Spacing.sm,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.hairline
  },
  cancelledNote: {
    ...Typography.caption,
    color: Colors.error,
    flex: 1,
    marginRight: Spacing.xs
  },
  rebookBtn: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    minHeight: 36,
    justifyContent: 'center',
    borderRadius: Radii.button || 8,
    backgroundColor: Colors.terracotta
  },
  rebookBtnText: {
    ...Typography.captionBold,
    color: Colors.card
  },
  empty: {
    alignItems: 'center',
    marginTop: 80,
    paddingHorizontal: Spacing.xl
  },
  emptyTitle: {
    ...Typography.heading2,
    color: Colors.textPrimary,
    marginTop: Spacing.md
  },
  emptySubtitle: {
    ...Typography.caption,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: Spacing.lg
  },
  book: {
    backgroundColor: Colors.terracotta,
    paddingHorizontal: 20,
    paddingVertical: 12,
    minHeight: 48,
    justifyContent: 'center',
    borderRadius: Radii.button || 8
  },
  bookText: {
    ...Typography.button,
    color: Colors.card
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(28,25,23,0.5)',
    justifyContent: 'flex-end'
  },
  modalCard: {
    backgroundColor: Colors.card,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    borderWidth: 1,
    borderColor: Colors.hairline,
    padding: Spacing.lg,
    paddingBottom: Spacing.xxl,
    ...Shadows.sheet
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm
  },
  modalTitle: {
    ...Typography.heading2,
    fontSize: 18,
    color: Colors.textPrimary
  },
  modalSub: {
    ...Typography.captionBold,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs
  },
  modalChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4
  },
  modalChip: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: Radii.badge || 6,
    backgroundColor: Colors.sunken,
    borderWidth: 1,
    borderColor: Colors.hairline
  },
  modalChipSelected: {
    backgroundColor: Colors.navy,
    borderColor: Colors.navy
  },
  modalChipText: {
    ...Typography.captionBold,
    color: Colors.textSecondary
  },
  modalChipTextSelected: {
    color: Colors.card
  },
  modalSlotsCol: {
    gap: 8,
    marginTop: 4
  },
  modalSlotBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: Spacing.md,
    borderRadius: Radii.input || 8,
    backgroundColor: Colors.sunken,
    borderWidth: 1,
    borderColor: Colors.hairline,
    gap: 8
  },
  modalSlotBtnSelected: {
    borderColor: Colors.navy,
    borderWidth: 1.5,
    backgroundColor: Colors.card
  },
  modalSlotText: {
    ...Typography.body,
    fontSize: 13,
    color: Colors.textPrimary,
    flex: 1
  },
  modalSlotTextSelected: {
    color: Colors.navy,
    fontWeight: '700'
  },
  modalActionBtn: {
    marginTop: Spacing.lg,
    paddingVertical: 14,
    minHeight: 48,
    borderRadius: Radii.button || 8,
    backgroundColor: Colors.terracotta,
    alignItems: 'center',
    justifyContent: 'center'
  },
  modalActionBtnText: {
    ...Typography.bodyBold,
    color: Colors.card,
    fontSize: 14
  },
  reasonItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.sm,
    borderRadius: Radii.input || 8,
    backgroundColor: Colors.sunken,
    borderWidth: 1,
    borderColor: Colors.hairline,
    gap: 8
  },
  reasonItemSelected: {
    borderColor: Colors.error,
    borderWidth: 1.5,
    backgroundColor: Colors.card
  },
  reasonText: {
    ...Typography.body,
    fontSize: 13,
    color: Colors.textPrimary
  },
  starsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginVertical: Spacing.md
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4
  },
  tagPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Radii.badge || 6,
    backgroundColor: Colors.sunken,
    borderWidth: 1,
    borderColor: Colors.hairline
  },
  tagPillSelected: {
    backgroundColor: Colors.navy,
    borderColor: Colors.navy
  },
  tagPillText: {
    ...Typography.caption,
    fontSize: 12,
    color: Colors.textSecondary
  },
  tagPillTextSelected: {
    color: Colors.card,
    fontWeight: '700'
  },
  reviewInput: {
    backgroundColor: Colors.sunken,
    borderRadius: Radii.input || 8,
    borderWidth: 1,
    borderColor: Colors.hairline,
    padding: Spacing.sm,
    ...Typography.body,
    fontSize: 13,
    color: Colors.textPrimary,
    textAlignVertical: 'top',
    minHeight: 70,
    marginTop: 4
  }
});
