import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useApp } from '../../context/AppContext';
import ScreenContainer from '../../components/ScreenContainer';
import Colors from '../../constants/colors';
import Typography from '../../constants/typography';
import Spacing from '../../constants/spacing';
import Radii from '../../constants/radii';
import Shadows from '../../constants/shadows';
import { getOrders } from '../orders/orderStore';

const ISSUE_CATEGORIES = [
  'Item Damaged / Not Received',
  'Service Delay',
  'Payment Failure / Refund',
  'Seller / Partner Conduct',
  'App Issue'
];

export const HelpSupportScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { supportTickets, bookings, submitSupportTicket, addTicketMessage } = useApp();

  const [orders, setOrders] = useState([]);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [activeChatTicket, setActiveChatTicket] = useState(null);
  const [chatInput, setChatInput] = useState('');

  // Form State
  const [issueCategory, setIssueCategory] = useState('Item Damaged / Not Received');
  const [referenceType, setReferenceType] = useState('Order'); // 'Order' | 'Booking'
  const [selectedReferenceId, setSelectedReferenceId] = useState('ORD-98421');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [hasAttachment, setHasAttachment] = useState(false);

  useEffect(() => {
    getOrders().then((data) => {
      setOrders(data);
      if (route.params?.orderNumber) {
        setSelectedReferenceId(route.params.orderNumber);
        setReferenceType('Order');
        setCreateModalVisible(true);
        setSubject(`Dispute inquiry for ${route.params.orderNumber}`);
      } else if (data.length > 0) {
        setSelectedReferenceId(data[0].orderNumber);
      }
    });
  }, [route.params]);

  const handleCreateTicket = () => {
    if (!subject.trim() || !description.trim()) {
      Alert.alert('Incomplete Form', 'Please provide a Subject and Complaint Description.');
      return;
    }

    submitSupportTicket({
      issueCategory,
      bookingId: selectedReferenceId,
      subject,
      description,
      hasAttachment
    });

    Alert.alert(
      'Dispute Ticket Submitted',
      'Our customer support grievance team has logged your complaint. We will review and follow up within 15 minutes.'
    );
    setCreateModalVisible(false);
    setSubject('');
    setDescription('');
    setHasAttachment(false);
  };

  const handleSendChatMessage = () => {
    if (!chatInput.trim() || !activeChatTicket) return;
    const userMsg = chatInput.trim();
    addTicketMessage(activeChatTicket.id, userMsg);
    setChatInput('');

    // Simulate instant auto-response from dispute manager
    setTimeout(() => {
      addTicketMessage(
        activeChatTicket.id,
        'Thank you for the update. Our dispute officer has verified the details and initiated escrow protection on your transaction.'
      );
    }, 1200);
  };

  return (
    <ScreenContainer noPadding style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
          accessibilityLabel="Back"
        >
          <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Help & Dispute Support</Text>
        <TouchableOpacity
          style={styles.newTicketBtn}
          onPress={() => setCreateModalVisible(true)}
        >
          <Ionicons name="add" size={24} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Support Hotline Banner */}
        <View style={styles.hotlineBanner}>
          <View style={styles.hotlineIconBox}>
            <Ionicons name="headset" size={24} color="#0284C7" />
          </View>
          <View style={styles.hotlineTextContainer}>
            <Text style={styles.hotlineTitle}>BigBazaar 24x7 Customer Helpdesk</Text>
            <Text style={styles.hotlineSubtitle}>
              Toll-Free: 1800-200-1234 • Escrow & Dispute Grievance Redressal
            </Text>
          </View>
        </View>

        {/* Quick Dispute Raise Card */}
        <TouchableOpacity
          style={styles.raiseDisputeCard}
          onPress={() => setCreateModalVisible(true)}
        >
          <View style={styles.raiseLeft}>
            <Ionicons name="alert-circle-outline" size={24} color={Colors.primary} />
            <View style={{ marginLeft: Spacing.sm }}>
              <Text style={styles.raiseTitle}>Have a complaint with an order or service?</Text>
              <Text style={styles.raiseSub}>
                Raise a dispute ticket for refunds, delays, or damaged goods
              </Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={18} color={Colors.textSecondary} />
        </TouchableOpacity>

        {/* Tickets List */}
        <Text style={styles.sectionHeader}>Your Dispute Tickets ({supportTickets.length})</Text>

        {supportTickets.length === 0 ? (
          <View style={styles.emptyBox}>
            <Ionicons name="chatbubbles-outline" size={44} color={Colors.disabled} />
            <Text style={styles.emptyTitle}>No Active Dispute Tickets</Text>
            <Text style={styles.emptySubtitle}>
              You currently have no open complaints or support queries.
            </Text>
          </View>
        ) : (
          supportTickets.map((t) => (
            <View key={t.id} style={styles.ticketCard}>
              <View style={styles.ticketTop}>
                <View style={styles.ticketIdBox}>
                  <Text style={styles.ticketIdText}>Ticket #{t.ticketId}</Text>
                  <Text style={styles.ticketCategoryText}>
                    {t.issueCategory} • Ref #{t.bookingId}
                  </Text>
                </View>

                <View
                  style={[
                    styles.statusBadge,
                    t.status === 'Open' && styles.openBadge,
                    t.status === 'Under Review' && styles.reviewBadge,
                    t.status === 'Resolved' && styles.resolvedBadge
                  ]}
                >
                  <Text
                    style={[
                      styles.statusBadgeText,
                      t.status === 'Open' && { color: '#0284C7' },
                      t.status === 'Under Review' && { color: '#D97706' },
                      t.status === 'Resolved' && { color: '#059669' }
                    ]}
                  >
                    {t.status}
                  </Text>
                </View>
              </View>

              <Text style={styles.ticketSubject}>{t.subject}</Text>
              <Text style={styles.ticketDesc}>{t.description}</Text>

              {t.hasAttachment && (
                <View style={styles.attachmentTag}>
                  <Ionicons name="document-attach-outline" size={12} color={Colors.primary} />
                  <Text style={styles.attachmentTagText}>Attachment / Bill Uploaded</Text>
                </View>
              )}

              <View style={styles.ticketFooter}>
                <Text style={styles.ticketTime}>{t.createdAt}</Text>
                <TouchableOpacity
                  style={styles.chatActionBtn}
                  onPress={() => setActiveChatTicket(t)}
                >
                  <Ionicons name="chatbubble-ellipses-outline" size={16} color={Colors.primary} />
                  <Text style={styles.chatActionText}>
                    Chat with Support ({t.messages ? t.messages.length : 0})
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      {/* New Ticket Modal */}
      <Modal visible={createModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Submit Dispute / Complaint</Text>
              <TouchableOpacity onPress={() => setCreateModalVisible(false)}>
                <Ionicons name="close" size={24} color={Colors.textPrimary} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={styles.modalScroll}>
              {/* Category Picker */}
              <Text style={styles.fieldLabel}>Dispute Category *</Text>
              <View style={styles.categoryGrid}>
                {ISSUE_CATEGORIES.map((cat) => {
                  const isSelected = issueCategory === cat;
                  return (
                    <TouchableOpacity
                      key={cat}
                      style={[styles.catChip, isSelected && styles.selectedCatChip]}
                      onPress={() => setIssueCategory(cat)}
                    >
                      <Text style={[styles.catChipText, isSelected && styles.selectedCatChipText]}>
                        {cat}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Reference Type Switcher */}
              <Text style={styles.fieldLabel}>Reference Type *</Text>
              <View style={styles.refTypeRow}>
                <TouchableOpacity
                  style={[styles.refTypeBtn, referenceType === 'Order' && styles.refTypeBtnActive]}
                  onPress={() => {
                    setReferenceType('Order');
                    if (orders.length > 0) setSelectedReferenceId(orders[0].orderNumber);
                  }}
                >
                  <Text style={[styles.refTypeText, referenceType === 'Order' && styles.refTypeTextActive]}>
                    Marketplace Order
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.refTypeBtn, referenceType === 'Booking' && styles.refTypeBtnActive]}
                  onPress={() => {
                    setReferenceType('Booking');
                    if (bookings.length > 0) setSelectedReferenceId(bookings[0].bookingId);
                  }}
                >
                  <Text style={[styles.refTypeText, referenceType === 'Booking' && styles.refTypeTextActive]}>
                    Service Booking
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Related ID Picker */}
              <Text style={styles.fieldLabel}>
                Related {referenceType === 'Order' ? 'Order Number' : 'Booking ID'}
              </Text>
              <View style={styles.bookingSelectRow}>
                {referenceType === 'Order'
                  ? orders.slice(0, 3).map((ord) => (
                      <TouchableOpacity
                        key={ord.id}
                        style={[
                          styles.bookingChip,
                          selectedReferenceId === ord.orderNumber && styles.selectedBookingChip
                        ]}
                        onPress={() => setSelectedReferenceId(ord.orderNumber)}
                      >
                        <Text
                          style={[
                            styles.bookingChipText,
                            selectedReferenceId === ord.orderNumber && styles.selectedBookingChipText
                          ]}
                        >
                          {ord.orderNumber}
                        </Text>
                      </TouchableOpacity>
                    ))
                  : bookings.slice(0, 3).map((b) => (
                      <TouchableOpacity
                        key={b.id}
                        style={[
                          styles.bookingChip,
                          selectedReferenceId === b.bookingId && styles.selectedBookingChip
                        ]}
                        onPress={() => setSelectedReferenceId(b.bookingId)}
                      >
                        <Text
                          style={[
                            styles.bookingChipText,
                            selectedReferenceId === b.bookingId && styles.selectedBookingChipText
                          ]}
                        >
                          #{b.bookingId} ({b.serviceName})
                        </Text>
                      </TouchableOpacity>
                    ))}
              </View>

              {/* Subject */}
              <Text style={styles.fieldLabel}>Subject *</Text>
              <TextInput
                style={styles.input}
                placeholder="Brief summary of your complaint"
                placeholderTextColor={Colors.textSecondary}
                value={subject}
                onChangeText={setSubject}
              />

              {/* Description */}
              <Text style={styles.fieldLabel}>Detailed Explanation *</Text>
              <TextInput
                style={styles.textArea}
                placeholder="Explain what went wrong so our grievance officer can resolve it..."
                placeholderTextColor={Colors.textSecondary}
                multiline
                numberOfLines={4}
                value={description}
                onChangeText={setDescription}
              />

              {/* Screenshot / Bill Attachment */}
              <TouchableOpacity
                style={styles.attachmentUploadBtn}
                onPress={() => setHasAttachment(!hasAttachment)}
              >
                <Ionicons
                  name={hasAttachment ? 'checkmark-circle' : 'attach-outline'}
                  size={20}
                  color={hasAttachment ? '#10B981' : Colors.primary}
                />
                <Text style={[styles.attachmentUploadText, hasAttachment && { color: '#10B981' }]}>
                  {hasAttachment
                    ? 'Photo / Invoice Attached (tap to remove)'
                    : 'Attach Screenshot / Invoice (Optional)'}
                </Text>
              </TouchableOpacity>

              {/* Submit */}
              <TouchableOpacity style={styles.submitBtn} onPress={handleCreateTicket}>
                <Text style={styles.submitBtnText}>Submit Complaint Ticket</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Live Support Chat Thread Modal */}
      {activeChatTicket && (
        <Modal visible transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.chatModalContainer}>
              <View style={styles.chatModalHeader}>
                <View>
                  <Text style={styles.modalTitle}>Dispute Ticket #{activeChatTicket.ticketId}</Text>
                  <Text style={styles.chatSubtitle}>Officer: Ananya (Senior Grievance Redressal)</Text>
                </View>
                <TouchableOpacity onPress={() => setActiveChatTicket(null)}>
                  <Ionicons name="close" size={24} color={Colors.textPrimary} />
                </TouchableOpacity>
              </View>

              {/* Message History */}
              <ScrollView style={styles.chatMessagesArea}>
                {activeChatTicket.messages?.map((msg, i) => (
                  <View
                    key={i}
                    style={[
                      styles.chatBubble,
                      msg.sender === 'user' ? styles.userBubble : styles.supportBubble
                    ]}
                  >
                    <Text
                      style={[
                        styles.chatText,
                        msg.sender === 'user' ? styles.userChatText : styles.supportChatText
                      ]}
                    >
                      {msg.text}
                    </Text>
                    <Text style={styles.chatTime}>{msg.time}</Text>
                  </View>
                ))}
              </ScrollView>

              {/* Input Bar */}
              <View style={styles.chatInputRow}>
                <TextInput
                  style={styles.chatInput}
                  placeholder="Type message to dispute executive..."
                  placeholderTextColor={Colors.textSecondary}
                  value={chatInput}
                  onChangeText={setChatInput}
                />
                <TouchableOpacity style={styles.sendBtn} onPress={handleSendChatMessage}>
                  <Ionicons name="send" size={18} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}
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
  newTicketBtn: {
    padding: Spacing.xs
  },
  scrollContent: {
    padding: Spacing.md,
    paddingBottom: Spacing.xl
  },
  hotlineBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E5F1FF',
    padding: Spacing.md,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#BAE6FD',
    marginBottom: Spacing.md
  },
  hotlineIconBox: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm
  },
  hotlineTextContainer: {
    flex: 1
  },
  hotlineTitle: {
    ...Typography.bodyBold,
    fontSize: 13,
    color: '#0369A1'
  },
  hotlineSubtitle: {
    fontSize: 11,
    color: '#0284C7',
    marginTop: 2
  },
  raiseDisputeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    padding: Spacing.md,
    borderRadius: Radii.card,
    borderWidth: 1,
    borderColor: Colors.primary,
    marginBottom: Spacing.md,
    ...Shadows.card
  },
  raiseLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1
  },
  raiseTitle: {
    ...Typography.bodyBold,
    fontSize: 13,
    color: Colors.textPrimary
  },
  raiseSub: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginTop: 2
  },
  sectionHeader: {
    ...Typography.heading3,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm
  },
  ticketCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: Radii.card,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.card
  },
  ticketTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.xs
  },
  ticketIdBox: {
    flex: 1
  },
  ticketIdText: {
    ...Typography.bodyBold,
    color: Colors.textPrimary,
    fontSize: 14
  },
  ticketCategoryText: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginTop: 2
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4
  },
  openBadge: { backgroundColor: '#E5F1FF' },
  reviewBadge: { backgroundColor: '#FEF3C7' },
  resolvedBadge: { backgroundColor: '#D1FAE5' },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: '700'
  },
  ticketSubject: {
    ...Typography.bodyBold,
    fontSize: 13,
    color: Colors.textPrimary,
    marginTop: Spacing.xs
  },
  ticketDesc: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginTop: 2,
    lineHeight: 16
  },
  attachmentTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginTop: Spacing.xs
  },
  attachmentTagText: {
    fontSize: 10,
    color: Colors.primary,
    marginLeft: 3,
    fontWeight: '600'
  },
  ticketFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.sm,
    paddingTop: Spacing.xs,
    borderTopWidth: 1,
    borderTopColor: Colors.border
  },
  ticketTime: {
    ...Typography.caption,
    fontSize: 11,
    color: Colors.textSecondary
  },
  chatActionBtn: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  chatActionText: {
    ...Typography.captionBold,
    color: Colors.primary,
    marginLeft: 4
  },
  emptyBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xl
  },
  emptyTitle: {
    ...Typography.heading3,
    color: Colors.textPrimary,
    marginTop: Spacing.sm
  },
  emptySubtitle: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginTop: 4
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end'
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: Radii.sheet,
    borderTopRightRadius: Radii.sheet,
    padding: Spacing.md,
    maxHeight: '85%'
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
    paddingBottom: Spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border
  },
  modalTitle: {
    ...Typography.heading3,
    color: Colors.textPrimary
  },
  modalScroll: {
    marginBottom: Spacing.md
  },
  fieldLabel: {
    ...Typography.captionBold,
    color: Colors.textPrimary,
    marginTop: Spacing.sm,
    marginBottom: 4
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8
  },
  catChip: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: Radii.sm,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: Colors.border
  },
  selectedCatChip: {
    backgroundColor: Colors.primaryLight,
    borderColor: Colors.primary
  },
  catChipText: {
    ...Typography.caption,
    color: Colors.textSecondary
  },
  selectedCatChipText: {
    color: Colors.primary,
    fontWeight: '700'
  },
  refTypeRow: {
    flexDirection: 'row',
    gap: 8
  },
  refTypeBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: Radii.sm,
    backgroundColor: '#F1F5F9',
    alignItems: 'center'
  },
  refTypeBtnActive: {
    backgroundColor: Colors.primary
  },
  refTypeText: {
    ...Typography.captionBold,
    color: Colors.textSecondary
  },
  refTypeTextActive: {
    color: '#FFFFFF'
  },
  bookingSelectRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8
  },
  bookingChip: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: Radii.sm,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: Colors.border
  },
  selectedBookingChip: {
    backgroundColor: '#EFF6FF',
    borderColor: Colors.primary
  },
  bookingChipText: {
    fontSize: 11,
    color: Colors.textSecondary
  },
  selectedBookingChipText: {
    color: Colors.primary,
    fontWeight: '700'
  },
  input: {
    backgroundColor: '#F8FAFC',
    borderRadius: Radii.control,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.sm,
    height: 44,
    ...Typography.body,
    fontSize: 13,
    color: Colors.textPrimary
  },
  textArea: {
    backgroundColor: '#F8FAFC',
    borderRadius: Radii.control,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.sm,
    ...Typography.body,
    fontSize: 13,
    color: Colors.textPrimary,
    textAlignVertical: 'top',
    minHeight: 80
  },
  attachmentUploadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.sm,
    borderRadius: Radii.control,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: '#FFFFFF',
    marginTop: Spacing.sm
  },
  attachmentUploadText: {
    ...Typography.captionBold,
    color: Colors.primary,
    marginLeft: Spacing.xs
  },
  submitBtn: {
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    borderRadius: Radii.button,
    alignItems: 'center',
    marginTop: Spacing.md,
    marginBottom: Spacing.xl,
    ...Shadows.button
  },
  submitBtnText: {
    ...Typography.bodyBold,
    color: '#FFFFFF'
  },
  chatModalContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: Radii.sheet,
    borderTopRightRadius: Radii.sheet,
    height: '80%',
    padding: Spacing.md
  },
  chatModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border
  },
  chatSubtitle: {
    ...Typography.caption,
    color: '#059669',
    fontWeight: '600',
    marginTop: 2
  },
  chatMessagesArea: {
    flex: 1,
    paddingVertical: Spacing.sm
  },
  chatBubble: {
    maxWidth: '80%',
    padding: Spacing.sm,
    borderRadius: Radii.control,
    marginBottom: Spacing.sm
  },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: Colors.primary,
    borderBottomRightRadius: 2
  },
  supportBubble: {
    alignSelf: 'flex-start',
    backgroundColor: '#F1F5F9',
    borderBottomLeftRadius: 2
  },
  chatText: {
    ...Typography.body,
    fontSize: 13
  },
  userChatText: {
    color: '#FFFFFF'
  },
  supportChatText: {
    color: Colors.textPrimary
  },
  chatTime: {
    fontSize: 9,
    alignSelf: 'flex-end',
    marginTop: 4,
    opacity: 0.7
  },
  chatInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: Spacing.xs
  },
  chatInput: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: Radii.pill,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.md,
    height: 42,
    fontSize: 13
  },
  sendBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: Spacing.xs
  }
});

export default HelpSupportScreen;