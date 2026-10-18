/**
 * @file apps/mobile/src/screens/notifications/NotificationsScreen.jsx
 * @description Centralized notifications center with category tabs (All, Orders/Bookings, Offers, Promotions),
 * unread badges, mark all as read action, and deep-linking to relevant screens.
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import ScreenContainer from '../../components/ScreenContainer';
import Colors from '../../constants/colors';
import Typography from '../../constants/typography';
import Spacing from '../../constants/spacing';
import Radii from '../../constants/radii';
import Shadows from '../../constants/shadows';

const INITIAL_NOTIFICATIONS = [];

export default function NotificationsScreen() {
  const navigation = useNavigation();
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);
  const [activeCategory, setActiveCategory] = useState('all'); // 'all' | 'orders' | 'offers' | 'promotions'

  // Filter list by category
  const filteredList = notifications.filter((item) => {
    if (activeCategory === 'all') return true;
    return item.category === activeCategory;
  });

  const unreadCount = notifications.filter((n) => n.unread).length;

  const handleMarkAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
  };

  const handleNotificationPress = (item) => {
    // Mark as read
    setNotifications((prev) =>
      prev.map((n) => (n.id === item.id ? { ...n, unread: false } : n))
    );

    if (item.targetScreen) {
      if (item.targetScreen === 'Main') {
        navigation.navigate('Main', item.targetParams);
      } else {
        navigation.navigate(item.targetScreen, item.targetParams || {});
      }
    }
  };

  const handleDeleteNotification = (id) => {
    Alert.alert(
      'Remove Notification',
      'Remove this notification from your inbox?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => setNotifications((prev) => prev.filter((n) => n.id !== id))
        }
      ]
    );
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'offer':
        return { name: 'pricetag', color: Colors.terracotta, bg: Colors.sunken };
      case 'booking':
        return { name: 'construct', color: Colors.serviceIndigo, bg: Colors.sunken };
      case 'listing':
        return { name: 'checkmark-circle', color: Colors.emerald, bg: Colors.sunken };
      case 'promotion':
        return { name: 'sparkles', color: Colors.navy, bg: Colors.sunken };
      case 'price_drop':
        return { name: 'trending-down', color: Colors.emerald, bg: Colors.sunken };
      default:
        return { name: 'notifications', color: Colors.terracotta, bg: Colors.sunken };
    }
  };

  const categories = [
    { id: 'all', label: 'All', count: notifications.length },
    { id: 'orders', label: 'Orders & Bookings', count: notifications.filter((n) => n.category === 'orders').length },
    { id: 'offers', label: 'Offers & Deals', count: notifications.filter((n) => n.category === 'offers').length },
    { id: 'promotions', label: 'Promotions', count: notifications.filter((n) => n.category === 'promotions').length }
  ];

  return (
    <ScreenContainer noPadding style={styles.screen}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
          accessibilityLabel="Back">
          <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>

        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>Notifications</Text>
          {unreadCount > 0 && (
            <View style={styles.headerUnreadBadge}>
              <Text style={styles.headerUnreadText}>{unreadCount} new</Text>
            </View>
          )}
        </View>

        {unreadCount > 0 && (
          <TouchableOpacity onPress={handleMarkAllAsRead} accessibilityLabel="Mark all as read">
            <Text style={styles.markAllText}>Mark all read</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Category Filter Pills */}
      <View style={styles.categoryBar}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={categories}
          keyExtractor={(c) => c.id}
          contentContainerStyle={styles.categoryScroll}
          renderItem={({ item }) => {
            const isActive = activeCategory === item.id;
            return (
              <TouchableOpacity
                onPress={() => setActiveCategory(item.id)}
                style={[styles.categoryChip, isActive && styles.categoryChipActive]}
                accessibilityLabel={item.label}>
                <Text style={[styles.categoryChipText, isActive && styles.categoryChipTextActive]}>
                  {item.label}
                </Text>
                {item.count > 0 && (
                  <View style={[styles.chipCount, isActive && styles.chipCountActive]}>
                    <Text style={[styles.chipCountText, isActive && styles.chipCountTextActive]}>
                      {item.count}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          }}
        />
      </View>

      {/* Notifications List */}
      <FlatList
        data={filteredList}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => {
          const iconInfo = getNotificationIcon(item.type);
          return (
            <TouchableOpacity
              style={[styles.notificationCard, item.unread && styles.notificationCardUnread]}
              activeOpacity={0.7}
              onPress={() => handleNotificationPress(item)}
              onLongPress={() => handleDeleteNotification(item.id)}
              accessibilityLabel={item.title}>
              {/* Type Icon */}
              <View style={[styles.iconCircle, { backgroundColor: iconInfo.bg }]}>
                <Ionicons name={iconInfo.name} size={18} color={iconInfo.color} />
              </View>

              {/* Notification Body */}
              <View style={styles.cardBody}>
                <View style={styles.cardHeader}>
                  <Text style={[styles.cardTitle, item.unread && styles.cardTitleUnread]} numberOfLines={1}>
                    {item.title}
                  </Text>
                  <Text style={styles.dateText}>{item.date}</Text>
                </View>
                <Text style={styles.bodyText} numberOfLines={3}>
                  {item.body}
                </Text>
              </View>

              {/* Unread Dot & Arrow */}
              <View style={styles.cardEnd}>
                {item.unread && <View style={styles.unreadDot} />}
                <Ionicons name="chevron-forward" size={16} color={Colors.disabled} style={{ marginTop: 4 }} />
              </View>
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconCircle}>
              <Ionicons name="notifications-off-outline" size={44} color={Colors.disabled} />
            </View>
            <Text style={styles.emptyTitle}>No notifications</Text>
            <Text style={styles.emptySubtitle}>
              You have no notifications in this category. Important updates about orders, offers, and bookings will appear here.
            </Text>
          </View>
        }
      />
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
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.card,
    borderBottomWidth: 1,
    borderBottomColor: Colors.hairline
  },
  backBtn: {
    padding: 6
  },
  headerTitleContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8
  },
  headerTitle: {
    ...Typography.heading2,
    fontSize: 18,
    color: Colors.textPrimary
  },
  headerUnreadBadge: {
    backgroundColor: Colors.sunken,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: Radii.pill,
    marginLeft: 8,
    borderWidth: 1,
    borderColor: Colors.hairline
  },
  headerUnreadText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.navy
  },
  markAllText: {
    ...Typography.bodyBold,
    color: Colors.terracotta,
    fontSize: 13
  },
  categoryBar: {
    backgroundColor: Colors.card,
    borderBottomWidth: 1,
    borderBottomColor: Colors.hairline,
    paddingVertical: 8
  },
  categoryScroll: {
    paddingHorizontal: Spacing.md,
    gap: 8
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: Radii.pill,
    backgroundColor: Colors.sunken
  },
  categoryChipActive: {
    backgroundColor: Colors.navy
  },
  categoryChipText: {
    ...Typography.captionBold,
    fontSize: 12,
    color: Colors.textSecondary
  },
  categoryChipTextActive: {
    color: Colors.card
  },
  chipCount: {
    backgroundColor: Colors.hairline,
    borderRadius: Radii.pill,
    paddingHorizontal: 5,
    paddingVertical: 1,
    marginLeft: 6
  },
  chipCountActive: {
    backgroundColor: 'rgba(251, 251, 250, 0.3)'
  },
  chipCountText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.textSecondary
  },
  chipCountTextActive: {
    color: Colors.card
  },
  listContent: {
    padding: Spacing.md,
    paddingBottom: 40
  },
  notificationCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: Colors.card,
    borderRadius: Radii.card,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.hairline,
    ...Shadows.card
  },
  notificationCardUnread: {
    backgroundColor: Colors.card,
    borderColor: Colors.hairline,
    borderLeftWidth: 3.5,
    borderLeftColor: Colors.terracotta
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    marginTop: 2
  },
  cardBody: {
    flex: 1
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4
  },
  cardTitle: {
    ...Typography.body,
    fontSize: 14,
    color: Colors.textPrimary,
    flex: 1,
    marginRight: 6
  },
  cardTitleUnread: {
    fontWeight: '700',
    color: Colors.textPrimary
  },
  dateText: {
    ...Typography.caption,
    fontSize: 11,
    color: Colors.textSecondary
  },
  bodyText: {
    ...Typography.body,
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18
  },
  cardEnd: {
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingLeft: 6,
    height: 38
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.terracotta
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
    marginTop: 60
  },
  emptyIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.sunken,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md
  },
  emptyTitle: {
    ...Typography.heading2,
    fontSize: 18,
    color: Colors.textPrimary,
    marginBottom: 6
  },
  emptySubtitle: {
    ...Typography.body,
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: 'center',
    maxWidth: 280,
    lineHeight: 18
  }
});