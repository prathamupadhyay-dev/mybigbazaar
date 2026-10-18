/**
 * @file apps/mobile/src/screens/chat/ChatScreen.jsx
 * @description Dynamic real-time P2P chat thread synced with /api/v1/chat/conversations:
 * - Pinned item bar with Make Offer & View Listing CTAs
 * - Interactive Offer Card with Accept / Counter / Decline state machine persisted to MongoDB
 * - Automatic or manual Seller Reply simulation & Buyer/Seller perspective toggle
 * - Official Admin Moderator intervention notices
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  Image,
  Modal,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import ScreenContainer from '../../components/ScreenContainer';
import Colors from '../../constants/colors';
import Typography from '../../constants/typography';
import Spacing from '../../constants/spacing';
import Radii from '../../constants/radii';
import Shadows from '../../constants/shadows';
import { formatCurrency } from '../../utils/formatters';
import { useApp } from '../../context/AppContext';
import { apiGet, apiPost } from '../../services/apiClient';

const QUICK_REPLIES = [
  'Is this still available?',
  'What is your best price?',
  'Can I inspect it in person?',
  'Where can we meet?',
  'Can you share more photos?'
];

const REPORT_REASONS = [
  'Spam or irrelevant advertising',
  'Inappropriate or abusive language',
  'Suspected fraud or fake listing',
  'Asking for advance payment or OTP outside BigBazaar',
  'Item condition does not match description',
  'Other'
];

export default function ChatScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { user } = useApp();

  // Route parameters
  const initialConvId = route.params?.conversationId || '';
  const partnerName = route.params?.sellerName || 'Verified Seller';
  const listingTitle = route.params?.listingTitle || 'Listing Inquiry';
  const listingPrice = Number(route.params?.listingPrice) || 0;
  const listingImage = route.params?.listingImage || '';
  const listingId = route.params?.listingId || '';
  const sellerIdParam = route.params?.sellerId || '';
  const isSellerInitial = Boolean(route.params?.isSeller);
  const initialOffer = Number(route.params?.initialOffer) || 0;

  // Dynamic Conversation State
  const [conversationId, setConversationId] = useState(initialConvId);
  const [isSeller, setIsSeller] = useState(isSellerInitial);
  const [autoReplyEnabled, setAutoReplyEnabled] = useState(true);
  const [showSafetyTip, setShowSafetyTip] = useState(true);
  const [isBlocked, setIsBlocked] = useState(false);
  const [text, setText] = useState('');
  const [loadingThread, setLoadingThread] = useState(true);

  // Modals
  const [offerModalVisible, setOfferModalVisible] = useState(false);
  const [customOfferAmount, setCustomOfferAmount] = useState('');
  const [counterModalVisible, setCounterModalVisible] = useState(false);
  const [counterTargetOffer, setCounterTargetOffer] = useState(null);
  const [counterInputAmount, setCounterInputAmount] = useState('');

  const [reportModalVisible, setReportModalVisible] = useState(false);
  const [selectedReportReason, setSelectedReportReason] = useState(REPORT_REASONS[0]);
  const [reportDetails, setReportDetails] = useState('');

  const [messages, setMessages] = useState([]);
  const flatListRef = useRef(null);

  // Map a backend Message doc into the UI format
  const mapBackendMessage = useCallback(
    (m, currentIsSeller) => {
      const role = m.senderRole || 'buyer';
      const mine =
        role === 'admin' || role === 'system'
          ? false
          : currentIsSeller
          ? role === 'seller'
          : role === 'buyer';

      const timeStr = m.createdAt
        ? new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        : 'Just now';

      const offerObj = m.offerDetails
        ? {
            id: String(m._id || m.id),
            amount: Number(m.offerDetails.amount || 0),
            askingPrice: Number(m.offerDetails.askingPrice || listingPrice || m.offerDetails.amount || 0),
            status: String(m.offerDetails.status || 'pending').toLowerCase(),
            counterAmount: m.offerDetails.counterAmount ? Number(m.offerDetails.counterAmount) : null
          }
        : null;

      return {
        id: String(m._id || m.id || `m-${ Math.random()}`),
        sender: m.senderName || m.senderId?.fullName || (mine ? 'You' : partnerName),
        senderRole: role,
        text: m.text || '',
        time: timeStr,
        mine,
        messageType: m.messageType || (offerObj ? 'offer' : 'text'),
        offer: offerObj,
        imageAttachment: m.imageUrl || null
      };
    },
    [listingPrice, partnerName]
  );

  // Initialize or fetch conversation from backend
  useEffect(() => {
    let isMounted = true;

    const initConversation = async () => {
      setLoadingThread(true);
      try {
        if (initialConvId) {
          const res = await apiGet(`/api/v1/chat/conversations/${initialConvId}/messages`);
          const rawMsgs = Array.isArray(res?.data) ? res.data : [];
          if (isMounted) {
            setConversationId(initialConvId);
            setMessages(rawMsgs.map((m) => mapBackendMessage(m, isSellerInitial)));
          }
        } else {
          // Create or find conversation for this listing
          const res = await apiPost('/api/v1/chat/conversations', {
            userId: user?._id || user?.id,
            buyerName: user?.name || user?.fullName || 'Aarav Sharma',
            buyerPhone: user?.phone || user?.phoneNumber || '+919876543210',
            sellerId: sellerIdParam || undefined,
            sellerName: partnerName,
            listingId: listingId || undefined,
            listingTitle,
            listingPrice,
            listingImage,
            initialOffer: initialOffer > 0 ? initialOffer : undefined
          });

          const conv = res?.data;
          if (isMounted && conv) {
            const cid = String(conv._id || conv.id || '');
            setConversationId(cid);
            const rawMsgs = Array.isArray(conv.messages) ? conv.messages : [];
            setMessages(rawMsgs.map((m) => mapBackendMessage(m, isSellerInitial)));
          }
        }
      } catch (err) {
        // Fallback if offline
        if (isMounted && initialOffer > 0) {
          setMessages([
            {
              id: `off-init-${Date.now()}`,
              sender: 'You',
              senderRole: 'buyer',
              text: `Made an offer of ₹${initialOffer.toLocaleString('en-IN')}`,
              time: 'Just now',
              mine: true,
              messageType: 'offer',
              offer: {
                id: `off-${Date.now()}`,
                amount: initialOffer,
                askingPrice: listingPrice,
                status: 'pending',
                counterAmount: null
              }
            }
          ]);
        }
      } finally {
        if (isMounted) {
          setLoadingThread(false);
          setTimeout(() => {
            flatListRef.current?.scrollToEnd({ animated: true });
          }, 150);
        }
      }
    };

    initConversation();
    return () => {
      isMounted = false;
    };
  }, [
    initialConvId,
    listingId,
    listingTitle,
    listingPrice,
    listingImage,
    partnerName,
    sellerIdParam,
    initialOffer,
    isSellerInitial,
    user,
    mapBackendMessage
  ]);

  // Re-evaluate `mine` when user switches Buyer/Seller perspective
  const togglePerspective = () => {
    setIsSeller((prev) => {
      const next = !prev;
      setMessages((curr) =>
        curr.map((m) => ({
          ...m,
          mine:
            m.senderRole === 'admin' || m.senderRole === 'system'
              ? false
              : next
              ? m.senderRole === 'seller'
              : m.senderRole === 'buyer'
        }))
      );
      return next;
    });
  };

  // Send a regular text message
  const handleSendText = async (msgText) => {
    const messageContent = (msgText || text).trim();
    if (!messageContent || isBlocked) return;

    const currentRole = isSeller ? 'seller' : 'buyer';
    const tempId = `m-${Date.now()}`;
    const optimisticMsg = {
      id: tempId,
      sender: isSeller ? partnerName : user?.name || 'Aarav Sharma',
      senderRole: currentRole,
      text: messageContent,
      time: 'Just now',
      mine: true,
      messageType: 'text'
    };

    setMessages((prev) => [...prev, optimisticMsg]);
    if (!msgText) setText('');

    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);

    if (conversationId) {
      try {
        const res = await apiPost(`/api/v1/chat/conversations/${conversationId}/messages`, {
          text: messageContent,
          messageType: 'text',
          senderRole: currentRole,
          senderName: isSeller ? partnerName : user?.name || user?.fullName || 'Aarav Sharma',
          simulateSellerReply: !isSeller && autoReplyEnabled
        });

        if (res?.data) {
          const savedMsg = mapBackendMessage(res.data, isSeller);
          setMessages((prev) => prev.map((m) => (m.id === tempId ? savedMsg : m)));
        }
        if (res?.autoReply) {
          const replyMapped = mapBackendMessage(res.autoReply, isSeller);
          setTimeout(() => {
            setMessages((prev) => [...prev, replyMapped]);
            setTimeout(() => {
              flatListRef.current?.scrollToEnd({ animated: true });
            }, 100);
          }, 500);
        }
      } catch {}
    }
  };

  // Submit custom offer
  const handleSendOffer = async () => {
    const amount = Number(String(customOfferAmount).replace(/[^0-9.]/g, ''));
    if (!amount || amount <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid offer price in Rupees.');
      return;
    }

    if (listingPrice > 0 && amount > listingPrice * 2) {
      Alert.alert('Notice', 'Offer amount cannot exceed twice the asking price.');
      return;
    }

    const tempId = `off-${Date.now()}`;
    const newOfferMsg = {
      id: tempId,
      sender: 'You',
      senderRole: 'buyer',
      text: `Made an offer of ${formatCurrency(amount)}`,
      time: 'Just now',
      mine: !isSeller,
      messageType: 'offer',
      offer: {
        id: tempId,
        amount,
        askingPrice: listingPrice || amount,
        status: 'pending',
        counterAmount: null
      }
    };

    setMessages((prev) => [...prev, newOfferMsg]);
    setOfferModalVisible(false);
    setCustomOfferAmount('');

    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);

    if (conversationId) {
      try {
        const res = await apiPost(`/api/v1/chat/conversations/${conversationId}/messages`, {
          text: `Made an offer of ${formatCurrency(amount)}`,
          messageType: 'offer',
          offerAmount: amount,
          askingPrice: listingPrice || amount,
          senderRole: 'buyer',
          senderName: user?.name || user?.fullName || 'Aarav Sharma',
          simulateSellerReply: false
        });
        if (res?.data) {
          const savedMsg = mapBackendMessage(res.data, isSeller);
          setMessages((prev) => prev.map((m) => (m.id === tempId ? savedMsg : m)));
        }
      } catch {}
    }
  };

  // Seller accepts offer
  const handleAcceptOffer = async (messageId, offerAmount) => {
    setMessages((prev) =>
      prev.map((msg) => {
        if (msg.id === messageId && msg.offer) {
          return {
            ...msg,
            offer: { ...msg.offer, status: 'accepted' }
          };
        }
        return msg;
      })
    );

    const sysMsg = {
      id: `sys-${Date.now()}`,
      sender: 'System',
      senderRole: 'system',
      text: `Deal confirmed! Offer of ${formatCurrency(offerAmount)} was accepted.`,
      time: 'Just now',
      mine: false,
      messageType: 'system'
    };
    setMessages((prev) => [...prev, sysMsg]);

    try {
      await apiPost(`/api/v1/chat/messages/${messageId}/offer`, {
        action: 'accept'
      });
    } catch {}

    Alert.alert(
      'Offer Accepted',
      `Offer of ${formatCurrency(offerAmount)} is accepted. You can now proceed to checkout at the agreed deal price.`
    );
  };

  // Seller declines offer
  const handleDeclineOffer = (messageId, offerAmount) => {
    Alert.alert(
      'Decline Offer',
      `Decline the offer of ${formatCurrency(offerAmount)}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Decline',
          style: 'destructive',
          onPress: async () => {
            setMessages((prev) =>
              prev.map((msg) => {
                if (msg.id === messageId && msg.offer) {
                  return {
                    ...msg,
                    offer: { ...msg.offer, status: 'declined' }
                  };
                }
                return msg;
              })
            );

            const sysMsg = {
              id: `sys-${Date.now()}`,
              sender: 'System',
              senderRole: 'system',
              text: `Offer of ${formatCurrency(offerAmount)} was declined.`,
              time: 'Just now',
              mine: false,
              messageType: 'system'
            };
            setMessages((prev) => [...prev, sysMsg]);

            try {
              await apiPost(`/api/v1/chat/messages/${messageId}/offer`, {
                action: 'decline'
              });
            } catch {}
          }
        }
      ]
    );
  };

  // Open counter offer modal
  const handleOpenCounterModal = (message) => {
    setCounterTargetOffer(message);
    const baseAsk = listingPrice || message.offer.askingPrice || message.offer.amount;
    setCounterInputAmount(String(Math.round((baseAsk + message.offer.amount) / 2)));
    setCounterModalVisible(true);
  };

  // Submit counter offer
  const handleSendCounterOffer = async () => {
    const counterAmount = Number(String(counterInputAmount).replace(/[^0-9.]/g, ''));
    if (!counterAmount || counterAmount <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid counter offer amount.');
      return;
    }

    if (!counterTargetOffer) return;
    const targetMsgId = counterTargetOffer.id;

    setMessages((prev) =>
      prev.map((msg) => {
        if (msg.id === targetMsgId && msg.offer) {
          return {
            ...msg,
            offer: {
              ...msg.offer,
              status: 'countered',
              counterAmount
            }
          };
        }
        return msg;
      })
    );

    const sysMsg = {
      id: `sys-${Date.now()}`,
      sender: 'System',
      senderRole: 'system',
      text: `Counter offer sent: ${formatCurrency(counterAmount)}`,
      time: 'Just now',
      mine: false,
      messageType: 'system'
    };
    setMessages((prev) => [...prev, sysMsg]);

    setCounterModalVisible(false);
    setCounterTargetOffer(null);

    try {
      await apiPost(`/api/v1/chat/messages/${targetMsgId}/offer`, {
        action: 'counter',
        counterAmount
      });
    } catch {}
  };

  // Buyer accepts counter offer
  const handleAcceptCounterOffer = async (messageId, counterAmount) => {
    setMessages((prev) =>
      prev.map((msg) => {
        if (msg.id === messageId && msg.offer) {
          return {
            ...msg,
            offer: {
              ...msg.offer,
              amount: counterAmount,
              status: 'accepted'
            }
          };
        }
        return msg;
      })
    );

    const sysMsg = {
      id: `sys-${Date.now()}`,
      sender: 'System',
      senderRole: 'system',
      text: `Counter offer of ${formatCurrency(counterAmount)} accepted. Deal confirmed!`,
      time: 'Just now',
      mine: false,
      messageType: 'system'
    };
    setMessages((prev) => [...prev, sysMsg]);

    try {
      await apiPost(`/api/v1/chat/messages/${messageId}/offer`, {
        action: 'accept'
      });
    } catch {}

    Alert.alert(
      'Counter Offer Accepted',
      `You agreed on ${formatCurrency(counterAmount)}. Tap "Proceed to Checkout" to complete your purchase.`
    );
  };

  // Proceed to Checkout on accepted offer
  const handleProceedToCheckout = (finalPrice) => {
    navigation.navigate('Checkout', {
      listingId,
      item: {
        id: listingId,
        title: listingTitle,
        price: finalPrice,
        imageUrl: listingImage,
        sellerName: partnerName
      },
      dealPrice: finalPrice,
      isNegotiatedDeal: true
    });
  };

  // Submit report user
  const handleSubmitReport = async () => {
    setReportModalVisible(false);
    try {
      await apiPost('/api/v1/moderation/reports', {
        targetType: 'chat',
        title: `Reported chat with ${partnerName}`,
        reason: selectedReportReason,
        description: reportDetails || `Violation reported in conversation: ${selectedReportReason}`,
        reporter: user?.name || 'Aarav Sharma'
      });
    } catch {}
    Alert.alert(
      'Report Submitted',
      'Thank you for helping keep BigBazaar safe. Our Trust & Safety team has received your report and is reviewing this conversation.',
      [{ text: 'OK' }]
    );
    setReportDetails('');
  };

  // Block user
  const handleToggleBlock = () => {
    if (isBlocked) {
      setIsBlocked(false);
      Alert.alert('User Unblocked', `You can now send and receive messages with ${partnerName}.`);
    } else {
      Alert.alert(
        `Block ${partnerName}?`,
        'You will no longer receive messages or offers from this user. The conversation will be silenced.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Block User',
            style: 'destructive',
            onPress: () => {
              setIsBlocked(true);
              Alert.alert('User Blocked', `${partnerName} has been blocked.`);
            }
          }
        ]
      );
    }
  };

  // 3-dot header action sheet
  const handleOpenMenu = () => {
    Alert.alert('Conversation Options', `Actions with ${partnerName}`, [
      {
        text: 'Make a Price Offer',
        onPress: () => {
          setCustomOfferAmount(listingPrice > 0 ? String(Math.round(listingPrice * 0.9)) : '');
          setOfferModalVisible(true);
        }
      },
      {
        text: `Switch View (Currently: ${isSeller ? 'Seller' : 'Buyer'})`,
        onPress: togglePerspective
      },
      {
        text: isBlocked ? 'Unblock User' : 'Block User',
        style: isBlocked ? 'default' : 'destructive',
        onPress: handleToggleBlock
      },
      {
        text: 'Report User / Scam',
        style: 'destructive',
        onPress: () => setReportModalVisible(true)
      },
      { text: 'Cancel', style: 'cancel' }
    ]);
  };

  // Render Offer Card Component
  const renderOfferCard = (item) => {
    const offer = item.offer;
    if (!offer) return null;

    const askPrice = offer.askingPrice || listingPrice || offer.amount;
    const discountAmount = Math.max(0, askPrice - offer.amount);
    const discountPercent = askPrice > 0 ? Math.round((discountAmount / askPrice) * 100) : 0;

    const isPending = offer.status === 'pending';
    const isCountered = offer.status === 'countered';
    const isAccepted = offer.status === 'accepted';
    const isDeclined = offer.status === 'declined';

    return (
      <View
        style={[
          styles.offerCard,
          isAccepted && styles.offerCardAccepted,
          isDeclined && styles.offerCardDeclined,
          isCountered && styles.offerCardCountered,
          isPending && styles.offerCardPending
        ]}>
        <View style={styles.offerCardHeader}>
          <View style={styles.offerHeaderLeft}>
            <Ionicons
              name={
                isAccepted
                  ? 'shield-checkmark'
                  : isDeclined
                  ? 'close-circle'
                  : isCountered
                  ? 'swap-horizontal'
                  : 'pricetag'
              }
              size={18}
              color={
                isAccepted
                  ? '#059669'
                  : isDeclined
                  ? '#DC2626'
                  : isCountered
                  ? '#7C3AED'
                  : '#D97706'
              }
            />
            <Text style={styles.offerCardTitle}>
              {isAccepted
                ? 'Deal Accepted'
                : isDeclined
                ? 'Offer Declined'
                : isCountered
                ? 'Seller Counter Offer'
                : 'Price Offer'}
            </Text>
          </View>
          <View
            style={[
              styles.offerBadge,
              isAccepted
                ? styles.offerBadgeAccepted
                : isDeclined
                ? styles.offerBadgeDeclined
                : isCountered
                ? styles.offerBadgeCountered
                : styles.offerBadgePending
            ]}>
            <Text
              style={[
                styles.offerBadgeText,
                isAccepted
                  ? styles.offerBadgeTextAccepted
                  : isDeclined
                  ? styles.offerBadgeTextDeclined
                  : isCountered
                  ? styles.offerBadgeTextCountered
                  : styles.offerBadgeTextPending
              ]}>
              {offer.status.toUpperCase()}
            </Text>
          </View>
        </View>

        <View style={styles.offerPricesRow}>
          <View>
            <Text style={styles.offerLabel}>
              {isCountered ? 'Original Offer' : isAccepted ? 'Agreed Price' : 'Offered Price'}
            </Text>
            <Text
              style={[
                styles.offeredAmount,
                isAccepted && { color: '#059669', fontSize: 20 }
              ]}>
              {formatCurrency(isAccepted ? (offer.counterAmount || offer.amount) : offer.amount)}
            </Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={styles.offerLabel}>Asking Price</Text>
            <Text style={styles.originalAmount}>{formatCurrency(askPrice)}</Text>
          </View>
        </View>

        {discountAmount > 0 && !isDeclined && (
          <View style={styles.savingsNotice}>
            <Ionicons name="trending-down" size={14} color="#059669" />
            <Text style={styles.savingsText}>
              Savings of {formatCurrency(discountAmount)} ({discountPercent}% below asking price)
            </Text>
          </View>
        )}

        {isCountered && (
          <View style={styles.counterBox}>
            <View style={styles.counterBoxHeader}>
              <Ionicons name="swap-horizontal" size={16} color="#6D28D9" />
              <Text style={styles.counterBoxTitle}>Seller Proposed Counter Price</Text>
            </View>
            <Text style={styles.counterBoxPrice}>{formatCurrency(offer.counterAmount)}</Text>
            <Text style={styles.counterBoxSub}>
              {partnerName} is willing to close the deal at this counter price.
            </Text>
          </View>
        )}

        {isAccepted && (
          <View style={styles.acceptedSection}>
            <View style={styles.acceptedBanner}>
              <Ionicons name="checkmark-circle" size={18} color="#065F46" />
              <Text style={styles.acceptedBannerText}>
                Deal confirmed at {formatCurrency(offer.counterAmount || offer.amount)}! Both parties agreed to trade.
              </Text>
            </View>

            <TouchableOpacity
              style={styles.checkoutDealBtn}
              onPress={() => handleProceedToCheckout(offer.counterAmount || offer.amount)}
              accessibilityLabel="Proceed to Checkout">
              <Ionicons name="card-outline" size={19} color={Colors.white} style={{ marginRight: 8 }} />
              <Text style={styles.checkoutDealBtnText}>
                Proceed to Checkout ({formatCurrency(offer.counterAmount || offer.amount)})
              </Text>
              <Ionicons name="arrow-forward" size={18} color={Colors.white} style={{ marginLeft: 8 }} />
            </TouchableOpacity>
          </View>
        )}

        {isDeclined && (
          <View style={styles.declinedBanner}>
            <Ionicons name="alert-circle" size={16} color="#991B1B" />
            <Text style={styles.declinedBannerText}>
              This offer was not accepted. You may send a revised offer.
            </Text>
          </View>
        )}

        {isPending && (
          <View style={styles.offerActionsRow}>
            <TouchableOpacity
              style={[styles.offerBtn, styles.counterBtn]}
              onPress={() => handleOpenCounterModal(item)}
              accessibilityLabel="Counter offer">
              <Ionicons name="swap-horizontal" size={15} color="#6D28D9" />
              <Text style={styles.counterBtnText}>Counter</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.offerBtn, styles.acceptBtn]}
              onPress={() => handleAcceptOffer(item.id, offer.amount)}
              accessibilityLabel="Accept offer">
              <Ionicons name="checkmark" size={15} color={Colors.white} />
              <Text style={styles.acceptBtnText}>Accept</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.offerBtn, styles.declineBtn]}
              onPress={() => handleDeclineOffer(item.id, offer.amount)}
              accessibilityLabel="Decline offer">
              <Text style={styles.declineBtnText}>Decline</Text>
            </TouchableOpacity>
          </View>
        )}

        {isCountered && (
          <View style={styles.offerActionsRow}>
            <TouchableOpacity
              style={[styles.offerBtn, styles.acceptBtn]}
              onPress={() => handleAcceptCounterOffer(item.id, offer.counterAmount)}
              accessibilityLabel="Accept counter offer">
              <Ionicons name="checkmark" size={15} color={Colors.white} />
              <Text style={styles.acceptBtnText}>Accept Counter</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.offerBtn, styles.counterBtn]}
              onPress={() => {
                setCustomOfferAmount(String(Math.round((offer.amount + offer.counterAmount) / 2)));
                setOfferModalVisible(true);
              }}
              accessibilityLabel="New offer">
              <Text style={styles.counterBtnText}>New Offer</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.offerBtn, styles.declineBtn]}
              onPress={() => handleDeclineOffer(item.id, offer.counterAmount)}
              accessibilityLabel="Decline counter">
              <Text style={styles.declineBtnText}>Decline</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  return (
    <ScreenContainer noPadding style={styles.screen}>
      {/* 1. Header with Partner & Actions */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.headerBackBtn}
          accessibilityLabel="Back">
          <Ionicons name="arrow-back" size={24} color={Colors.card} />
        </TouchableOpacity>

        <View style={styles.headerAvatarCircle}>
          <Text style={styles.headerAvatarText}>{partnerName.charAt(0).toUpperCase()}</Text>
        </View>

        <View style={styles.headerPartner}>
          <Text style={styles.partnerTitle} numberOfLines={1}>
            {partnerName}
          </Text>
          <View style={styles.onlineStatusRow}>
            <View style={[styles.statusDot, isBlocked && { backgroundColor: Colors.crimson }]} />
            <Text style={styles.statusText}>
              {isBlocked ? 'Blocked' : isSeller ? 'Buyer Inquiry · Live Sync' : 'Online · Verified Seller'}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          onPress={togglePerspective}
          style={styles.roleSwitchPill}
          accessibilityLabel="Switch Buyer/Seller role">
          <Ionicons name="swap-horizontal" size={13} color="#FFFFFF" />
          <Text style={styles.roleSwitchText}>{isSeller ? 'Seller View' : 'Buyer View'}</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={handleOpenMenu} style={styles.headerMenuBtn} accessibilityLabel="More options">
          <Ionicons name="ellipsis-vertical" size={20} color={Colors.card} />
        </TouchableOpacity>
      </View>

      {/* 2. Pinned Top Listing Item Bar */}
      <View style={styles.pinnedItemBar}>
        {listingImage ? (
          <Image source={{ uri: listingImage }} style={styles.pinnedItemImage} />
        ) : (
          <View style={[styles.pinnedItemImage, { backgroundColor: Colors.borderLight, alignItems: 'center', justifyContent: 'center' }]}>
            <Ionicons name="pricetag-outline" size={18} color={Colors.textTertiary} />
          </View>
        )}
        <View style={styles.pinnedItemDetails}>
          <Text style={styles.pinnedItemTitle} numberOfLines={1}>
            {listingTitle}
          </Text>
          <Text style={styles.pinnedItemPrice}>{formatCurrency(listingPrice)}</Text>
        </View>

        <TouchableOpacity
          style={styles.makeOfferTopBtn}
          onPress={() => {
            setCustomOfferAmount(listingPrice > 0 ? String(Math.round(listingPrice * 0.92)) : '');
            setOfferModalVisible(true);
          }}
          accessibilityLabel="Make Offer">
          <Ionicons name="pricetag-outline" size={13} color="#FFFFFF" style={{ marginRight: 4 }} />
          <Text style={styles.makeOfferTopBtnText}>Make Offer</Text>
        </TouchableOpacity>
      </View>

      {/* 3. Compact Safe-Deal Banner */}
      {showSafetyTip && (
        <View style={styles.safeDealBanner}>
          <View style={styles.safeDealIconCircle}>
            <Ionicons name="shield-checkmark" size={15} color="#1D4ED8" />
          </View>
          <Text style={styles.safeDealText} numberOfLines={2}>
            <Text style={{ fontWeight: '700' }}>Live Synced Chat: </Text>
            Messages & offers sync in real time with Seller & Admin Panel.
          </Text>
          <TouchableOpacity onPress={() => setShowSafetyTip(false)} style={styles.safeDealCloseBtn}>
            <Ionicons name="close" size={16} color="#64748B" />
          </TouchableOpacity>
        </View>
      )}

      {/* 4. Messages Thread */}
      {loadingThread ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color={Colors.navy} />
          <Text style={{ marginTop: 10, fontSize: 13, color: Colors.textSecondary }}>
            Syncing conversation with seller...
          </Text>
        </View>
      ) : (
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.messagesList}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => {
            if (item.messageType === 'admin_notice' || item.senderRole === 'admin') {
              return (
                <View style={styles.adminNoticeContainer}>
                  <View style={styles.adminNoticeHeader}>
                    <Ionicons name="shield-checkmark" size={14} color="#1E40AF" />
                    <Text style={styles.adminNoticeTitle}>BigBazaar Trust & Safety Admin</Text>
                  </View>
                  <Text style={styles.adminNoticeText}>{item.text}</Text>
                </View>
              );
            }

            if (item.messageType === 'system') {
              return (
                <View style={styles.systemMessageContainer}>
                  <Text style={styles.systemMessageText}>{item.text}</Text>
                </View>
              );
            }

            if (item.messageType === 'offer') {
              return renderOfferCard(item);
            }

            return (
              <View style={[styles.bubbleWrapper, item.mine ? styles.myBubbleWrapper : styles.theirBubbleWrapper]}>
                <View style={[styles.bubble, item.mine ? styles.myBubble : styles.theirBubble]}>
                  {!item.mine && (
                    <Text style={styles.senderLabelText}>{item.sender}</Text>
                  )}
                  {item.imageAttachment ? (
                    <Image
                      source={{ uri: item.imageAttachment }}
                      style={{ width: 200, height: 140, borderRadius: 8, marginBottom: 6 }}
                      resizeMode="cover"
                    />
                  ) : null}
                  <Text style={[styles.messageText, item.mine && styles.myMessageText]}>
                    {item.text}
                  </Text>
                  <View style={styles.bubbleFooter}>
                    <Text style={[styles.messageTime, item.mine && styles.myMessageTime]}>
                      {item.time}
                    </Text>
                    {item.mine && (
                      <Ionicons name="checkmark-done" size={13} color="rgba(255,255,255,0.7)" style={{ marginLeft: 4 }} />
                    )}
                  </View>
                </View>
              </View>
            );
          }}
          ListEmptyComponent={
            <View style={{ padding: 40, alignItems: 'center', justifyContent: 'center' }}>
              <Ionicons name="chatbubbles-outline" size={48} color={Colors.primary} style={{ marginBottom: 12, opacity: 0.6 }} />
              <Text style={{ fontSize: 16, fontWeight: '700', color: Colors.textPrimary, marginBottom: 6 }}>
                Start chatting with {partnerName}
              </Text>
              <Text style={{ fontSize: 13, color: Colors.textSecondary, textAlign: 'center', lineHeight: 18 }}>
                Ask a question about {listingTitle}, tap a quick reply below, or make an offer!
              </Text>
            </View>
          }
        />
      )}

      {/* Quick Replies Carousel */}
      {!isBlocked && (
        <View style={styles.quickRepliesContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.quickRepliesScroll}>
            {QUICK_REPLIES.map((chip, idx) => (
              <TouchableOpacity
                key={idx}
                style={styles.quickChip}
                onPress={() => handleSendText(chip)}>
                <Text style={styles.quickChipText}>{chip}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* 5. Input Bar or Blocked Notice */}
      {isBlocked ? (
        <View style={styles.blockedBar}>
          <Ionicons name="ban-outline" size={18} color={Colors.danger} style={{ marginRight: 6 }} />
          <Text style={styles.blockedBarText}>You have blocked {partnerName}.</Text>
          <TouchableOpacity onPress={handleToggleBlock}>
            <Text style={styles.unblockText}>Unblock</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}>
          <View style={styles.inputBar}>
            <TouchableOpacity
              onPress={() => {
                setCustomOfferAmount(listingPrice > 0 ? String(Math.round(listingPrice * 0.9)) : '');
                setOfferModalVisible(true);
              }}
              style={{ paddingHorizontal: 6, paddingVertical: 4, marginRight: 4 }}
              accessibilityLabel="Make Offer">
              <Ionicons name="pricetag-outline" size={22} color={Colors.navy} />
            </TouchableOpacity>

            <TextInput
              value={text}
              onChangeText={setText}
              placeholder={isSeller ? 'Reply as Seller...' : `Message ${partnerName}...`}
              placeholderTextColor={Colors.textSecondary}
              style={styles.textInput}
              multiline
              maxLength={500}
            />

            <TouchableOpacity
              onPress={() => handleSendText()}
              disabled={!text.trim()}
              style={[styles.sendBtn, !text.trim() && styles.sendBtnDisabled]}
              accessibilityLabel="Send message">
              <Ionicons name="send" size={18} color={Colors.white} />
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      )}

      {/* 6. Make Offer Modal */}
      <Modal visible={offerModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.offerModalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Make an Offer</Text>
              <TouchableOpacity onPress={() => setOfferModalVisible(false)}>
                <Ionicons name="close" size={24} color={Colors.textPrimary} />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalSubtitle}>
              Current asking price: <Text style={{ fontWeight: '700' }}>{formatCurrency(listingPrice)}</Text>
            </Text>

            <View style={styles.quickDiscountRow}>
              {[5, 10, 15, 20].map((pct) => {
                const discountedPrice = Math.round(listingPrice * (1 - pct / 100));
                return (
                  <TouchableOpacity
                    key={pct}
                    style={styles.discountChip}
                    onPress={() => setCustomOfferAmount(String(discountedPrice))}>
                    <Text style={styles.discountChipPct}>{pct}% OFF</Text>
                    <Text style={styles.discountChipPrice}>{formatCurrency(discountedPrice)}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <View style={styles.modalInputGroup}>
              <Text style={styles.inputLabel}>Your Offer Amount (₹)</Text>
              <TextInput
                value={customOfferAmount}
                onChangeText={setCustomOfferAmount}
                placeholder="e.g. 35000"
                keyboardType="numeric"
                style={styles.modalPriceInput}
              />
            </View>

            <TouchableOpacity
              style={styles.submitOfferBtn}
              onPress={handleSendOffer}
              accessibilityLabel="Submit offer">
              <Text style={styles.submitOfferBtnText}>Send Offer to Seller</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* 7. Counter Offer Modal */}
      <Modal visible={counterModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.offerModalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Counter Offer</Text>
              <TouchableOpacity onPress={() => setCounterModalVisible(false)}>
                <Ionicons name="close" size={24} color={Colors.textPrimary} />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalSubtitle}>
              Buyer offered:{' '}
              <Text style={{ fontWeight: '700' }}>
                {counterTargetOffer ? formatCurrency(counterTargetOffer.offer.amount) : '₹0'}
              </Text>{' '}
              (Asking: {formatCurrency(listingPrice)})
            </Text>

            <View style={styles.modalInputGroup}>
              <Text style={styles.inputLabel}>Your Counter Amount (₹)</Text>
              <TextInput
                value={counterInputAmount}
                onChangeText={setCounterInputAmount}
                placeholder="Enter counter price"
                keyboardType="numeric"
                style={styles.modalPriceInput}
              />
            </View>

            <TouchableOpacity
              style={[styles.submitOfferBtn, { backgroundColor: Colors.primary }]}
              onPress={handleSendCounterOffer}
              accessibilityLabel="Send counter offer">
              <Text style={styles.submitOfferBtnText}>Send Counter Offer</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* 8. Report User Modal */}
      <Modal visible={reportModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.offerModalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Report User</Text>
              <TouchableOpacity onPress={() => setReportModalVisible(false)}>
                <Ionicons name="close" size={24} color={Colors.textPrimary} />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalSubtitle}>
              Help us understand what went wrong with {partnerName}:
            </Text>

            <ScrollView style={{ maxHeight: 220 }}>
              {REPORT_REASONS.map((reason, idx) => {
                const isSelected = selectedReportReason === reason;
                return (
                  <TouchableOpacity
                    key={idx}
                    style={[styles.reportReasonRow, isSelected && styles.reportReasonRowActive]}
                    onPress={() => setSelectedReportReason(reason)}>
                    <Ionicons
                      name={isSelected ? 'radio-button-on' : 'radio-button-off'}
                      size={18}
                      color={isSelected ? Colors.primary : Colors.textSecondary}
                      style={{ marginRight: 8 }}
                    />
                    <Text style={[styles.reportReasonText, isSelected && styles.reportReasonTextActive]}>
                      {reason}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            <TextInput
              value={reportDetails}
              onChangeText={setReportDetails}
              placeholder="Additional comments (optional)..."
              placeholderTextColor={Colors.textSecondary}
              style={styles.reportCommentsInput}
              multiline
              numberOfLines={3}
            />

            <TouchableOpacity
              style={[styles.submitOfferBtn, { backgroundColor: Colors.danger }]}
              onPress={handleSubmitReport}
              accessibilityLabel="Submit safety report">
              <Text style={styles.submitOfferBtnText}>Submit Safety Report</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.navy,
    borderBottomWidth: 1,
    borderBottomColor: Colors.navy
  },
  headerBackBtn: {
    padding: 6,
    marginRight: 6
  },
  headerPartner: {
    flex: 1
  },
  partnerTitle: {
    ...Typography.bodyBold,
    fontSize: 15,
    color: Colors.card
  },
  onlineStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: Colors.emerald,
    marginRight: 5
  },
  statusText: {
    ...Typography.caption,
    fontSize: 11,
    color: Colors.sunken
  },
  headerAvatarCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.sunken,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10
  },
  headerAvatarText: {
    ...Typography.bodyBold,
    color: Colors.navy,
    fontSize: 16
  },
  roleSwitchPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.16)',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 14,
    marginRight: 6,
    gap: 4
  },
  roleSwitchText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF'
  },
  headerMenuBtn: {
    padding: 6
  },
  pinnedItemBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.hairline
  },
  pinnedItemImage: {
    width: 44,
    height: 44,
    borderRadius: Radii.input || 8,
    marginRight: 10,
    backgroundColor: Colors.sunken,
    borderWidth: 1,
    borderColor: Colors.hairline
  },
  pinnedItemDetails: {
    flex: 1,
    marginRight: 8
  },
  pinnedItemTitle: {
    ...Typography.bodyBold,
    fontSize: 13,
    color: Colors.textPrimary
  },
  pinnedItemPrice: {
    ...Typography.captionBold,
    fontSize: 13,
    color: Colors.navy,
    marginTop: 2,
    fontVariant: ['tabular-nums']
  },
  makeOfferTopBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.navy,
    paddingVertical: 7,
    paddingHorizontal: 11,
    borderRadius: Radii.input || 8
  },
  makeOfferTopBtnText: {
    ...Typography.captionBold,
    color: '#FFFFFF',
    fontSize: 12
  },
  safeDealBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.sunken,
    paddingHorizontal: Spacing.md,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.hairline
  },
  safeDealIconCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: Colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8
  },
  safeDealText: {
    ...Typography.caption,
    fontSize: 11,
    color: Colors.textSecondary,
    flex: 1,
    lineHeight: 16,
    marginRight: 8
  },
  messagesList: {
    padding: Spacing.md,
    paddingBottom: 20
  },
  bubbleWrapper: {
    marginBottom: 10,
    maxWidth: '82%'
  },
  myBubbleWrapper: {
    alignSelf: 'flex-end'
  },
  theirBubbleWrapper: {
    alignSelf: 'flex-start'
  },
  bubble: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 16
  },
  myBubble: {
    backgroundColor: Colors.navy,
    borderBottomRightRadius: 4
  },
  theirBubble: {
    backgroundColor: Colors.card,
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: Colors.hairline
  },
  senderLabelText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#004796',
    marginBottom: 3
  },
  messageText: {
    ...Typography.body,
    fontSize: 14,
    color: Colors.textPrimary,
    lineHeight: 20
  },
  myMessageText: {
    color: Colors.card
  },
  bubbleFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 4
  },
  messageTime: {
    ...Typography.caption,
    fontSize: 10,
    color: Colors.textSecondary
  },
  myMessageTime: {
    color: 'rgba(251,251,250,0.7)'
  },
  systemMessageContainer: {
    alignSelf: 'center',
    backgroundColor: Colors.sunken,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Radii.badge || 6,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: Colors.hairline
  },
  systemMessageText: {
    ...Typography.caption,
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center'
  },
  adminNoticeContainer: {
    alignSelf: 'center',
    width: '94%',
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    borderRadius: 10,
    padding: 12,
    marginVertical: 8
  },
  adminNoticeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 6
  },
  adminNoticeTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#1E40AF',
    textTransform: 'uppercase',
    letterSpacing: 0.4
  },
  adminNoticeText: {
    fontSize: 12.5,
    color: '#1E3A8A',
    lineHeight: 18
  },
  offerCard: {
    backgroundColor: Colors.card,
    borderRadius: Radii.card || 12,
    borderWidth: 1.5,
    borderColor: Colors.terracotta,
    padding: 14,
    marginVertical: 8,
    ...Shadows.subtle
  },
  offerCardAccepted: {
    borderColor: Colors.emerald,
    backgroundColor: Colors.card
  },
  offerCardDeclined: {
    borderColor: Colors.crimson,
    backgroundColor: Colors.card
  },
  offerCardCountered: {
    borderColor: Colors.indigo,
    backgroundColor: Colors.card
  },
  offerCardPending: {
    borderColor: Colors.terracotta,
    backgroundColor: Colors.card
  },
  offerCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10
  },
  offerHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  offerCardTitle: {
    ...Typography.bodyBold,
    fontSize: 14,
    color: Colors.textPrimary,
    marginLeft: 6
  },
  offerBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radii.badge || 6,
    borderWidth: 1,
    borderColor: Colors.hairline
  },
  offerBadgePending: { backgroundColor: Colors.sunken },
  offerBadgeAccepted: { backgroundColor: Colors.sunken, borderColor: Colors.emerald },
  offerBadgeDeclined: { backgroundColor: Colors.sunken, borderColor: Colors.crimson },
  offerBadgeCountered: { backgroundColor: Colors.sunken, borderColor: Colors.indigo },
  offerBadgeText: { fontSize: 10, fontWeight: '800' },
  offerBadgeTextPending: { color: Colors.terracotta },
  offerBadgeTextAccepted: { color: Colors.emerald },
  offerBadgeTextDeclined: { color: Colors.crimson },
  offerBadgeTextCountered: { color: Colors.indigo },
  offerPricesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 8
  },
  offerLabel: {
    ...Typography.caption,
    fontSize: 11,
    color: Colors.textSecondary
  },
  offeredAmount: {
    ...Typography.heading1,
    fontSize: 22,
    color: Colors.navy,
    marginTop: 2,
    fontVariant: ['tabular-nums']
  },
  originalAmount: {
    ...Typography.body,
    fontSize: 14,
    color: Colors.textSecondary,
    textDecorationLine: 'line-through',
    fontVariant: ['tabular-nums']
  },
  savingsNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.sunken,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: Radii.badge || 6,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Colors.hairline
  },
  savingsText: {
    ...Typography.caption,
    fontSize: 11,
    color: Colors.emerald,
    fontWeight: '700',
    marginLeft: 5
  },
  counterBox: {
    backgroundColor: Colors.sunken,
    borderRadius: Radii.input || 8,
    padding: 10,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: Colors.hairline
  },
  counterBoxHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4
  },
  counterBoxTitle: {
    ...Typography.captionBold,
    fontSize: 12,
    color: Colors.navy,
    marginLeft: 5
  },
  counterBoxPrice: {
    ...Typography.heading2,
    fontSize: 18,
    color: Colors.navy,
    fontVariant: ['tabular-nums']
  },
  counterBoxSub: {
    ...Typography.caption,
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2
  },
  acceptedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.sunken,
    padding: 8,
    borderRadius: Radii.badge || 6,
    marginTop: 6,
    borderWidth: 1,
    borderColor: Colors.emerald
  },
  acceptedBannerText: {
    ...Typography.caption,
    fontSize: 12,
    color: Colors.emerald,
    fontWeight: '700',
    marginLeft: 6,
    flex: 1
  },
  declinedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.sunken,
    padding: 8,
    borderRadius: Radii.badge || 6,
    marginTop: 6,
    borderWidth: 1,
    borderColor: Colors.crimson
  },
  declinedBannerText: {
    ...Typography.caption,
    fontSize: 12,
    color: Colors.crimson,
    marginLeft: 6,
    flex: 1
  },
  offerActionsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10
  },
  offerBtn: {
    flex: 1,
    minHeight: 40,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: Radii.input || 8
  },
  acceptBtn: {
    backgroundColor: Colors.emerald
  },
  acceptBtnText: {
    ...Typography.captionBold,
    color: Colors.card,
    fontSize: 12,
    marginLeft: 4
  },
  counterBtn: {
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.navy
  },
  counterBtnText: {
    ...Typography.captionBold,
    color: Colors.navy,
    fontSize: 12
  },
  declineBtn: {
    backgroundColor: Colors.sunken,
    borderWidth: 1,
    borderColor: Colors.crimson,
    maxWidth: 70
  },
  declineBtnText: {
    ...Typography.captionBold,
    color: Colors.crimson,
    fontSize: 12
  },
  checkoutDealBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.emerald,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: Radii.button || 8,
    marginTop: 12,
    minHeight: 48
  },
  checkoutDealBtnText: {
    ...Typography.bodyBold,
    color: Colors.card,
    fontSize: 14
  },
  quickRepliesContainer: {
    backgroundColor: Colors.card,
    borderTopWidth: 1,
    borderTopColor: Colors.hairline,
    paddingVertical: 6
  },
  quickRepliesScroll: {
    paddingHorizontal: Spacing.md,
    gap: 6
  },
  quickChip: {
    backgroundColor: Colors.sunken,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Radii.pill,
    borderWidth: 1,
    borderColor: Colors.hairline,
    minHeight: 34,
    justifyContent: 'center'
  },
  quickChipText: {
    ...Typography.caption,
    fontSize: 12,
    color: Colors.textPrimary
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    paddingHorizontal: Spacing.md,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.hairline
  },
  textInput: {
    flex: 1,
    backgroundColor: Colors.sunken,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    maxHeight: 100,
    ...Typography.body,
    fontSize: 14,
    color: Colors.textPrimary,
    borderWidth: 1,
    borderColor: Colors.hairline
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.navy,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8
  },
  sendBtnDisabled: {
    backgroundColor: Colors.disabled
  },
  blockedBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.md,
    backgroundColor: Colors.sunken,
    borderTopWidth: 1,
    borderTopColor: Colors.hairline
  },
  blockedBarText: {
    ...Typography.body,
    fontSize: 13,
    color: Colors.crimson,
    marginRight: 10
  },
  unblockText: {
    ...Typography.bodyBold,
    fontSize: 13,
    color: Colors.navy,
    textDecorationLine: 'underline'
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: Colors.overlay,
    justifyContent: 'flex-end'
  },
  offerModalContainer: {
    backgroundColor: Colors.card,
    borderTopLeftRadius: Radii.card || 12,
    borderTopRightRadius: Radii.card || 12,
    padding: Spacing.lg,
    paddingBottom: 40,
    borderWidth: 1,
    borderColor: Colors.hairline
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6
  },
  modalTitle: {
    ...Typography.heading2,
    fontSize: 18,
    color: Colors.textPrimary
  },
  modalSubtitle: {
    ...Typography.caption,
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: Spacing.md
  },
  quickDiscountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.md
  },
  discountChip: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 4,
    backgroundColor: Colors.sunken,
    borderRadius: Radii.input || 8,
    borderWidth: 1,
    borderColor: Colors.hairline,
    marginHorizontal: 3
  },
  discountChipPct: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.navy
  },
  discountChipPrice: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
    fontVariant: ['tabular-nums']
  },
  modalInputGroup: {
    marginBottom: Spacing.lg
  },
  inputLabel: {
    ...Typography.captionBold,
    fontSize: 12,
    color: Colors.textPrimary,
    marginBottom: 6
  },
  modalPriceInput: {
    borderWidth: 1,
    borderColor: Colors.hairline,
    borderRadius: Radii.input || 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
    backgroundColor: Colors.sunken,
    fontVariant: ['tabular-nums']
  },
  submitOfferBtn: {
    backgroundColor: Colors.terracotta,
    paddingVertical: 14,
    borderRadius: Radii.button || 8,
    alignItems: 'center',
    minHeight: 48,
    justifyContent: 'center'
  },
  submitOfferBtnText: {
    ...Typography.bodyBold,
    color: Colors.card,
    fontSize: 15
  },
  reportReasonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: Radii.input || 8,
    marginBottom: 4
  },
  reportReasonRowActive: {
    backgroundColor: Colors.sunken
  },
  reportReasonText: {
    ...Typography.body,
    fontSize: 13,
    color: Colors.textPrimary,
    flex: 1
  },
  reportReasonTextActive: {
    color: Colors.navy,
    fontWeight: '700'
  },
  reportCommentsInput: {
    borderWidth: 1,
    borderColor: Colors.hairline,
    borderRadius: Radii.input || 8,
    padding: 10,
    textAlignVertical: 'top',
    height: 70,
    ...Typography.body,
    fontSize: 13,
    color: Colors.textPrimary,
    marginVertical: 10,
    backgroundColor: Colors.sunken
  }
});
