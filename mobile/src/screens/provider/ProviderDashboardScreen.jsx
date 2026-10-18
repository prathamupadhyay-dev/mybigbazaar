import React, { useState, useEffect } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import ScreenContainer from '../../components/ScreenContainer';
import { useApp } from '../../context/AppContext';
import { apiGet, apiPut } from '../../services/apiClient';
import Colors from '../../constants/colors';
import Typography from '../../constants/typography';
import Spacing from '../../constants/spacing';
import Radii from '../../constants/radii';
import Shadows from '../../constants/shadows';

const INITIAL_INCOMING_LEADS = [];

const INITIAL_ACTIVE_JOBS = [];

export default function ProviderDashboardScreen() {
  const navigation = useNavigation();
  const { user } = useApp();

  const providerProfile = user?.providerProfile || {};
  const partnerName = providerProfile.fullName || user?.fullName || 'Certified Partner';
  const category = providerProfile.category || 'Plumber';
  const isKycVerified = providerProfile.kycStatus === 'verified';

  const [isOnline, setIsOnline] = useState(providerProfile.isOnline !== false);
  const [incomingLeads, setIncomingLeads] = useState(INITIAL_INCOMING_LEADS);
  const [activeJobs, setActiveJobs] = useState(INITIAL_ACTIVE_JOBS);
  const [completedCount, setCompletedCount] = useState(0);
  const [todayEarnings, setTodayEarnings] = useState(0);

  useEffect(() => {
    let isMounted = true;
    async function loadProviderJobs() {
      try {
        const res = await apiGet('/booking/get-all').catch(() => null);
        const list = Array.isArray(res?.data) ? res.data : (Array.isArray(res?.bookings) ? res.bookings : []);
        if (!isMounted) return;

        const leads = [];
        const active = [];
        let doneCount = 0;
        let earnings = 0;

        for (const b of list) {
          const st = String(b.status || 'confirmed').toLowerCase();
          const addrObj = b.serviceAddress || {};
          const addrStr = typeof addrObj === 'string'
            ? addrObj
            : [addrObj.houseNo, addrObj.street, addrObj.city, addrObj.pincode].filter(Boolean).join(', ') || 'Indore';
          const dateStr = b.scheduledDate
            ? new Date(b.scheduledDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
            : 'Tomorrow';
          const timeStr = b.scheduledTimeSlot || '10:00 AM - 12:00 PM';
          const amt = Number(b.totalAmount ?? b.amount ?? 499);
          const custName = b.customerId?.fullName || b.customerName || 'Customer';
          const custPhone = b.customerId?.phoneNumber || addrObj.phone || '+91 98260 12345';

          if (st === 'completed') {
            doneCount += 1;
            earnings += amt;
          } else if (st === 'assigned' || st === 'in_progress') {
            active.push({
              id: String(b._id || b.bookingId),
              customerName: custName,
              customerPhone: custPhone,
              serviceTitle: b.subCategoryName || b.serviceName || 'Service Visit',
              address: addrStr,
              scheduledTime: `${dateStr}, ${timeStr}`,
              payoutAmount: amt,
              status: st === 'in_progress' ? 'In Progress' : 'Scheduled'
            });
          } else if (st === 'confirmed' || st === 'pending') {
            leads.push({
              id: String(b._id || b.bookingId),
              customerName: custName,
              customerPhone: custPhone,
              distance: '2.4 km',
              serviceTitle: b.subCategoryName || b.serviceName || 'Service Visit',
              address: addrStr,
              scheduledDate: dateStr,
              timeSlot: timeStr,
              payoutAmount: amt,
              notes: b.notes || ''
            });
          }
        }

        setIncomingLeads(leads);
        setActiveJobs(active);
        setCompletedCount(doneCount);
        setTodayEarnings(earnings);
      } catch (e) {}
    }
    loadProviderJobs();
    return () => { isMounted = false; };
  }, []);

  const handleToggleOnline = async (value) => {
    setIsOnline(value);
    apiPut('/api/v1/providers/availability', {
      userId: user?._id || user?.id,
      isAvailable: value
    }).catch(() => {});
    Alert.alert(
      value ? 'Taking Bookings' : 'Gone Offline',
      value
        ? 'You are now Online! Customers in your area will see your profile and dispatch new leads.'
        : 'You are now Offline. You will not receive new incoming job leads until you toggle back online.'
    );
  };

  const handleAcceptLead = (lead) => {
    Alert.alert(
      'Accept Job Lead',
      `Confirm acceptance of job for ${lead.customerName} (₹${lead.payoutAmount})?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Accept Job',
          onPress: () => {
            apiPut(`/booking/update-status/${lead.id}`, {
              status: 'assigned',
              providerName: partnerName
            }).catch(() => {});
            setIncomingLeads(prev => prev.filter(l => l.id !== lead.id));
            setActiveJobs(prev => [
              ...prev,
              {
                id: lead.id,
                customerName: lead.customerName,
                customerPhone: lead.customerPhone,
                serviceTitle: lead.serviceTitle,
                address: lead.address,
                scheduledTime: `${lead.scheduledDate}, ${lead.timeSlot}`,
                payoutAmount: lead.payoutAmount,
                status: 'Scheduled'
              }
            ]);
            Alert.alert(
              'Job Accepted',
              `Job moved to your Active Schedule. You can call ${lead.customerName} at ${lead.customerPhone}.`
            );
          }
        }
      ]
    );
  };

  const handleDeclineLead = (lead) => {
    Alert.alert(
      'Decline Lead',
      `Are you sure you want to pass on this job from ${lead.customerName}?`,
      [
        { text: 'Keep Lead', style: 'cancel' },
        {
          text: 'Decline',
          style: 'destructive',
          onPress: () => {
            setIncomingLeads(prev => prev.filter(l => l.id !== lead.id));
          }
        }
      ]
    );
  };

  const handleStartJob = (job) => {
    apiPut(`/booking/update-status/${job.id}`, {
      status: 'in_progress'
    }).catch(() => {});
    setActiveJobs(prev =>
      prev.map(j => (j.id === job.id ? { ...j, status: 'In Progress' } : j))
    );
    Alert.alert('Service Started', `Work started for ${job.customerName}. Good luck!`);
  };

  const handleCompleteJob = (job) => {
    Alert.alert(
      'Complete Job & Collect Payment',
      `Confirm completion of work? Payout of ₹${job.payoutAmount} will be added to your balance.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Mark Done',
          onPress: () => {
            apiPut(`/booking/update-status/${job.id}`, {
              status: 'completed'
            }).catch(() => {});
            setActiveJobs(prev => prev.filter(j => j.id !== job.id));
            setCompletedCount(prev => prev + 1);
            setTodayEarnings(prev => prev + job.payoutAmount);
            Alert.alert(
              'Job Completed',
              `₹${job.payoutAmount} credited to today's earnings. Customer has been asked to submit a rating.`
            );
          }
        }
      ]
    );
  };

  return (
    <ScreenContainer noPadding style={styles.container}>
      {/* Top Bar with Online Switch */}
      <View style={styles.topBar}>
        <View style={styles.partnerInfo}>
          <Text style={styles.partnerGreeting}>Hi, {partnerName.split(' ')[0]}</Text>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryBadgeText}>{category} Partner</Text>
          </View>
        </View>

        <View style={styles.onlineToggleContainer}>
          <Text style={[styles.onlineLabel, isOnline ? styles.onlineText : styles.offlineText]}>
            {isOnline ? 'ONLINE' : 'OFFLINE'}
          </Text>
          <Switch
            value={isOnline}
            onValueChange={handleToggleOnline}
            trackColor={{ false: Colors.hairline, true: Colors.emerald }}
            thumbColor={isOnline ? Colors.emerald : Colors.disabled}
          />
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* KYC Verification Banner */}
        {isKycVerified ? (
          <View style={[styles.kycBanner, styles.kycBannerVerified]}>
            <Ionicons name="checkmark-circle" size={20} color={Colors.emerald} />
            <Text style={styles.kycBannerTextVerified}>Verified Partner Badge Active · High Dispatch Priority</Text>
          </View>
        ) : (
          <TouchableOpacity
            style={[styles.kycBanner, styles.kycBannerPending]}
            onPress={() => navigation.navigate('ProviderKYC')}
            activeOpacity={0.8}
          >
            <Ionicons name="time-outline" size={20} color={Colors.terracotta} />
            <View style={{ flex: 1, marginLeft: 8 }}>
              <Text style={styles.kycBannerTextPending}>KYC Under Review</Text>
              <Text style={styles.kycBannerSubPending}>Tap to view or update submitted identity documents</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={Colors.terracotta} />
          </TouchableOpacity>
        )}

        {/* Quick KPI Cards */}
        <View style={styles.kpiRow}>
          <View style={styles.kpiCard}>
            <Text style={styles.kpiLabel}>Today's Earnings</Text>
            <Text style={styles.kpiValue}>₹{todayEarnings.toLocaleString('en-IN')}</Text>
            <Text style={styles.kpiSub}>Instant UPI Settlement</Text>
          </View>

          <View style={styles.kpiCard}>
            <Text style={styles.kpiLabel}>Jobs Done</Text>
            <Text style={styles.kpiValue}>{completedCount}</Text>
            <Text style={styles.kpiSub}>{completedCount > 0 ? 'Verified Partner' : 'New Partner'}</Text>
          </View>
        </View>

        {/* Section: Incoming Leads */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Incoming Job Leads ({incomingLeads.length})</Text>
          <View style={styles.liveIndicator}>
            <View style={styles.liveDot} />
            <Text style={styles.liveText}>Live Dispatch</Text>
          </View>
        </View>

        {incomingLeads.length === 0 ? (
          <View style={styles.emptyCard}>
            <Ionicons name="notifications-off-outline" size={32} color={Colors.disabled} />
            <Text style={styles.emptyTitle}>No pending leads at this moment</Text>
            <Text style={styles.emptyDesc}>Keep your status Online. New customer requests in your area will appear here instantly.</Text>
          </View>
        ) : (
          incomingLeads.map(lead => (
            <View key={lead.id} style={styles.leadCard}>
              <View style={styles.leadHeader}>
                <View>
                  <Text style={styles.leadServiceTitle}>{lead.serviceTitle}</Text>
                  <Text style={styles.leadCustomerName}>{lead.customerName} · {lead.distance}</Text>
                </View>
                <View style={styles.payoutBadge}>
                  <Text style={styles.payoutText}>₹{lead.payoutAmount}</Text>
                </View>
              </View>

              <View style={styles.leadDetailRow}>
                <Ionicons name="location-outline" size={16} color={Colors.textSecondary} />
                <Text style={styles.leadAddress} numberOfLines={1}>{lead.address}</Text>
              </View>

              <View style={styles.leadDetailRow}>
                <Ionicons name="calendar-outline" size={16} color={Colors.textSecondary} />
                <Text style={styles.leadSlot}>{lead.scheduledDate}, {lead.timeSlot}</Text>
              </View>

              {lead.notes ? (
                <View style={styles.notesBox}>
                  <Text style={styles.notesText}>"{lead.notes}"</Text>
                </View>
              ) : null}

              {/* Action Buttons */}
              <View style={styles.leadActionRow}>
                <TouchableOpacity
                  style={styles.declineBtn}
                  onPress={() => handleDeclineLead(lead)}
                >
                  <Text style={styles.declineBtnText}>Decline</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.acceptBtn}
                  onPress={() => handleAcceptLead(lead)}
                >
                  <Ionicons name="checkmark-sharp" size={18} color={Colors.card} style={{ marginRight: 6 }} />
                  <Text style={styles.acceptBtnText}>Accept Job (₹{lead.payoutAmount})</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}

        {/* Section: Active / In-Progress Jobs */}
        <View style={[styles.sectionHeaderRow, { marginTop: Spacing.lg }]}>
          <Text style={styles.sectionTitle}>Active Scheduled Jobs ({activeJobs.length})</Text>
        </View>

        {activeJobs.length === 0 ? (
          <View style={styles.emptyCard}>
            <Ionicons name="calendar-outline" size={28} color={Colors.disabled} />
            <Text style={styles.emptyTitle}>No active jobs in progress</Text>
            <Text style={styles.emptyDesc}>Accept an incoming lead above to start your next job.</Text>
          </View>
        ) : (
          activeJobs.map(job => (
            <View key={job.id} style={styles.activeJobCard}>
              <View style={styles.activeJobTop}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.activeJobTitle}>{job.serviceTitle}</Text>
                  <Text style={styles.activeJobCustomer}>{job.customerName} · {job.customerPhone}</Text>
                  <Text style={styles.activeJobAddress}>{job.address}</Text>
                  <Text style={styles.activeJobTime}>{job.scheduledTime}</Text>
                </View>
                <View style={[styles.jobStatusPill, job.status === 'In Progress' ? styles.jobStatusInProgress : styles.jobStatusScheduled]}>
                  <Text style={styles.jobStatusText}>{job.status}</Text>
                </View>
              </View>

              <View style={styles.activeJobActions}>
                {job.status !== 'In Progress' ? (
                  <TouchableOpacity
                    style={styles.startJobBtn}
                    onPress={() => handleStartJob(job)}
                  >
                    <Ionicons name="play-outline" size={16} color={Colors.card} style={{ marginRight: 6 }} />
                    <Text style={styles.startJobBtnText}>Start Service</Text>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    style={styles.completeJobBtn}
                    onPress={() => handleCompleteJob(job)}
                  >
                    <Ionicons name="cash-outline" size={16} color={Colors.card} style={{ marginRight: 6 }} />
                    <Text style={styles.completeJobBtnText}>Mark Done & Collect ₹{job.payoutAmount}</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          ))
        )}

        {/* Partner Shortcuts */}
        <View style={[styles.sectionHeaderRow, { marginTop: Spacing.lg }]}>
          <Text style={styles.sectionTitle}>Partner Management</Text>
        </View>

        <View style={styles.shortcutGrid}>
          <TouchableOpacity
            style={styles.shortcutCard}
            onPress={() => navigation.navigate('ProviderServiceForm')}
          >
            <View style={[styles.shortcutIconBox, { backgroundColor: Colors.sunken }]}>
              <Ionicons name="pricetag-outline" size={22} color={Colors.serviceIndigo} />
            </View>
            <Text style={styles.shortcutTitle}>Add Service Package</Text>
            <Text style={styles.shortcutDesc}>Custom pricing & repair tiers</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.shortcutCard}
            onPress={() => navigation.navigate('ProviderKYC')}
          >
            <View style={[styles.shortcutIconBox, { backgroundColor: Colors.sunken }]}>
              <Ionicons name="shield-checkmark-outline" size={22} color={Colors.emerald} />
            </View>
            <Text style={styles.shortcutTitle}>KYC Verification</Text>
            <Text style={styles.shortcutDesc}>Update photo ID & license</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.shortcutCard}
            onPress={() => navigation.navigate('Main')}
          >
            <View style={[styles.shortcutIconBox, { backgroundColor: Colors.sunken }]}>
              <Ionicons name="swap-horizontal-outline" size={22} color={Colors.textSecondary} />
            </View>
            <Text style={styles.shortcutTitle}>Switch to Buyer</Text>
            <Text style={styles.shortcutDesc}>Return to shopping feed</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.canvas
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.card,
    borderBottomWidth: 1,
    borderBottomColor: Colors.hairline
  },
  partnerInfo: {
    flex: 1
  },
  partnerGreeting: {
    ...Typography.heading2,
    fontSize: 20,
    fontWeight: '700',
    color: Colors.textPrimary
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.sunken,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: Radii.xs,
    marginTop: 4
  },
  categoryBadgeText: {
    ...Typography.captionBold,
    fontSize: 11,
    color: Colors.serviceIndigo
  },
  onlineToggleContainer: {
    alignItems: 'center'
  },
  onlineLabel: {
    fontSize: 11,
    fontWeight: '800',
    marginBottom: 2
  },
  onlineText: {
    color: Colors.emerald
  },
  offlineText: {
    color: Colors.disabled
  },
  scrollContent: {
    padding: Spacing.md
  },
  kycBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: Radii.control,
    marginBottom: Spacing.md
  },
  kycBannerVerified: {
    backgroundColor: Colors.sunken,
    borderWidth: 1,
    borderColor: Colors.hairline
  },
  kycBannerTextVerified: {
    ...Typography.captionBold,
    color: Colors.emerald,
    fontSize: 12,
    marginLeft: 8
  },
  kycBannerPending: {
    backgroundColor: Colors.sunken,
    borderWidth: 1,
    borderColor: Colors.hairline
  },
  kycBannerTextPending: {
    ...Typography.captionBold,
    color: Colors.terracotta,
    fontSize: 12
  },
  kycBannerSubPending: {
    ...Typography.micro,
    color: Colors.textSecondary,
    fontSize: 11,
    marginTop: 1
  },
  kpiRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: Spacing.md
  },
  kpiCard: {
    flex: 1,
    backgroundColor: Colors.card,
    borderRadius: Radii.card,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.hairline,
    ...Shadows.subtle
  },
  kpiLabel: {
    ...Typography.micro,
    fontSize: 11,
    color: Colors.textSecondary,
    fontWeight: '600',
    textTransform: 'uppercase'
  },
  kpiValue: {
    ...Typography.heading1,
    fontSize: 22,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginTop: 4,
    marginBottom: 2
  },
  kpiSub: {
    ...Typography.micro,
    fontSize: 11,
    color: Colors.emerald,
    fontWeight: '600'
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10
  },
  sectionTitle: {
    ...Typography.sectionHeader,
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.emerald,
    marginRight: 6
  },
  liveText: {
    ...Typography.micro,
    fontSize: 11,
    color: Colors.emerald,
    fontWeight: '700'
  },
  emptyCard: {
    backgroundColor: Colors.card,
    borderRadius: Radii.card,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.hairline,
    marginBottom: 12,
    ...Shadows.subtle
  },
  emptyTitle: {
    ...Typography.bodyBold,
    fontSize: 14,
    color: Colors.textPrimary,
    marginTop: 8
  },
  emptyDesc: {
    ...Typography.micro,
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 16
  },
  leadCard: {
    backgroundColor: Colors.card,
    borderRadius: Radii.card,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.hairline,
    ...Shadows.card
  },
  leadHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8
  },
  leadServiceTitle: {
    ...Typography.bodyBold,
    fontSize: 15,
    color: Colors.textPrimary
  },
  leadCustomerName: {
    ...Typography.secondary,
    fontSize: 12,
    color: Colors.serviceIndigo,
    fontWeight: '600',
    marginTop: 2
  },
  payoutBadge: {
    backgroundColor: Colors.sunken,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radii.xs,
    borderWidth: 1,
    borderColor: Colors.hairline
  },
  payoutText: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.emerald
  },
  leadDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6
  },
  leadAddress: {
    ...Typography.secondary,
    fontSize: 12,
    color: Colors.textSecondary,
    marginLeft: 6,
    flex: 1
  },
  leadSlot: {
    ...Typography.secondary,
    fontSize: 12,
    color: Colors.textPrimary,
    fontWeight: '600',
    marginLeft: 6
  },
  notesBox: {
    backgroundColor: Colors.sunken,
    borderRadius: Radii.xs,
    padding: 8,
    marginTop: 8
  },
  notesText: {
    ...Typography.micro,
    fontSize: 11,
    color: Colors.textSecondary,
    fontStyle: 'italic'
  },
  leadActionRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 14
  },
  declineBtn: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: Radii.control,
    backgroundColor: Colors.sunken,
    alignItems: 'center',
    justifyContent: 'center'
  },
  declineBtnText: {
    ...Typography.captionBold,
    color: Colors.danger,
    fontSize: 13
  },
  acceptBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: Radii.button,
    backgroundColor: Colors.emerald
  },
  acceptBtnText: {
    ...Typography.bodyBold,
    color: Colors.card,
    fontSize: 13,
    fontWeight: '700'
  },
  activeJobCard: {
    backgroundColor: Colors.card,
    borderRadius: Radii.card,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.hairline,
    ...Shadows.card
  },
  activeJobTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start'
  },
  activeJobTitle: {
    ...Typography.bodyBold,
    fontSize: 14,
    color: Colors.textPrimary
  },
  activeJobCustomer: {
    ...Typography.secondary,
    fontSize: 12,
    color: Colors.serviceIndigo,
    marginTop: 3
  },
  activeJobAddress: {
    ...Typography.micro,
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2
  },
  activeJobTime: {
    ...Typography.micro,
    fontSize: 11,
    color: Colors.textPrimary,
    fontWeight: '600',
    marginTop: 2
  },
  jobStatusPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radii.xs
  },
  jobStatusInProgress: {
    backgroundColor: Colors.sunken
  },
  jobStatusScheduled: {
    backgroundColor: Colors.sunken
  },
  jobStatusText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textPrimary
  },
  activeJobActions: {
    marginTop: 12
  },
  startJobBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.navy,
    paddingVertical: 9,
    borderRadius: Radii.button
  },
  startJobBtnText: {
    ...Typography.captionBold,
    color: Colors.card,
    fontSize: 13
  },
  completeJobBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.emerald,
    paddingVertical: 9,
    borderRadius: Radii.button
  },
  completeJobBtnText: {
    ...Typography.captionBold,
    color: Colors.card,
    fontSize: 13,
    fontWeight: '700'
  },
  shortcutGrid: {
    flexDirection: 'row',
    gap: 10
  },
  shortcutCard: {
    flex: 1,
    backgroundColor: Colors.card,
    borderRadius: Radii.card,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.hairline,
    ...Shadows.subtle
  },
  shortcutIconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8
  },
  shortcutTitle: {
    ...Typography.captionBold,
    fontSize: 11,
    textAlign: 'center',
    color: Colors.textPrimary,
    marginBottom: 2
  },
  shortcutDesc: {
    ...Typography.micro,
    fontSize: 9,
    textAlign: 'center',
    color: Colors.textSecondary
  }
});
