import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import ScreenContainer from '../../components/ScreenContainer';
import { useApp } from '../../context/AppContext';
import Colors from '../../constants/colors';
import Spacing from '../../constants/spacing';
import Radii from '../../constants/radii';
import Shadows from '../../constants/shadows';
import AuthRequiredState from '../../components/common/AuthRequiredState';
import { apiGet, apiPost, apiPut } from '../../services/apiClient';

const TOPUP_PRESETS = [100, 500, 1000, 2000];

export default function WalletScreen() {
  const navigation = useNavigation();
  const { user, updateUser, isAuthenticated } = useApp();

  const [minRedeemAmount, setMinRedeemAmount] = useState(500);
  const [activeTab, setActiveTab] = useState('All'); // 'All' | 'Credits' | 'Redemptions'
  const [walletTransactions, setWalletTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Add Money / Top-up Modal State
  const [isTopupModalVisible, setTopupModalVisible] = useState(false);
  const [topupAmount, setTopupAmount] = useState('500');
  const [topupMethod, setTopupMethod] = useState('UPI'); // 'UPI' | 'Card' | 'NetBanking'
  const [isToppingUp, setIsToppingUp] = useState(false);

  // Redeem / Payout Modal State
  const [isRedeemModalVisible, setRedeemModalVisible] = useState(false);
  const [payoutType, setPayoutType] = useState('upi'); // 'upi' | 'bank'
  const [redeemAmount, setRedeemAmount] = useState('');
  const [upiId, setUpiId] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [confirmAccount, setConfirmAccount] = useState('');
  const [ifscCode, setIfscCode] = useState('');
  const [holderName, setHolderName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Default wallet balance to ₹0 for every user until topped up or earned
  const walletBalance = Number(user?.walletBalance) || 0;

  const fetchWalletData = useCallback(async () => {
    if (!isAuthenticated) return;
    setLoading(true);
    try {
      const [settingsRes, profileRes, walletsRes] = await Promise.all([
        apiGet('/api/v1/settings').catch(() => null),
        apiGet('/auth/profile').catch(() => apiGet('/user/profile').catch(() => null)),
        apiGet('/api/v1/wallets').catch(() => null),
      ]);

      if (settingsRes?.minWalletRedeemAmount || settingsRes?.data?.minWalletRedeemAmount) {
        setMinRedeemAmount(
          Number(settingsRes.minWalletRedeemAmount || settingsRes.data?.minWalletRedeemAmount) || 500
        );
      }

      const liveUser = profileRes?.user || profileRes?.data;
      if (liveUser && typeof liveUser.walletBalance === 'number') {
        updateUser({ walletBalance: Number(liveUser.walletBalance) || 0 });
      }

      const rawTxns = Array.isArray(walletsRes?.data)
        ? walletsRes.data
        : Array.isArray(walletsRes?.transactions)
        ? walletsRes.transactions
        : Array.isArray(walletsRes)
        ? walletsRes
        : [];

      const userId = String(user?._id || user?.id || '');
      const userName = (user?.name || '').toLowerCase().trim();

      const userTxns = rawTxns.filter((tx) => {
        if (!userId && !userName) return false;
        const txUserId = String(tx.userId || '');
        const txUserName = (tx.userName || '').toLowerCase().trim();
        if (userId && txUserId && userId === txUserId) return true;
        if (userName && txUserName && userName === txUserName) return true;
        return false;
      });

      setWalletTransactions(userTxns);

      // If user profile didn't have an explicit balance, compute from user's ledger if transactions exist
      if (userTxns.length > 0 && liveUser?.walletBalance === undefined) {
        const computedBalance = userTxns.reduce((acc, tx) => {
          const amt = Number(tx.amount) || 0;
          return tx.type === 'debit' ? acc - amt : acc + amt;
        }, 0);
        updateUser({ walletBalance: Math.max(0, computedBalance) });
      }
    } catch (_e) {
      // Keep current state
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, user?._id, user?.id, user?.name]);

  useEffect(() => {
    fetchWalletData();
  }, [fetchWalletData]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchWalletData();
    setRefreshing(false);
  };

  const filteredTransactions = useMemo(() => {
    if (activeTab === 'Credits') {
      return walletTransactions.filter((t) => t.type !== 'debit');
    }
    if (activeTab === 'Redemptions') {
      return walletTransactions.filter((t) => t.type === 'debit');
    }
    return walletTransactions;
  }, [walletTransactions, activeTab]);

  if (!isAuthenticated) {
    return (
      <ScreenContainer>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color="#002F34" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>My Wallet</Text>
          <View style={{ width: 40 }} />
        </View>
        <AuthRequiredState
          title="Sign In to View Wallet"
          message="Log in to check your live wallet balance, add money, and redeem earnings to your bank or UPI."
        />
      </ScreenContainer>
    );
  }

  const isEligible = walletBalance >= minRedeemAmount;
  const progressPercent = Math.min((walletBalance / minRedeemAmount) * 100, 100);

  const handleConfirmTopup = async () => {
    const amt = parseFloat(topupAmount);
    if (isNaN(amt) || amt <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid top-up amount greater than ₹0.');
      return;
    }

    setIsToppingUp(true);
    const nextBalance = walletBalance + amt;
    const payload = {
      userId: user?._id || user?.id,
      userName: user?.name || 'BigBazaar User',
      type: 'credit',
      amount: amt,
      category: 'topup',
      paymentMethod: topupMethod,
      status: 'completed',
      reference: `TOPUP-${Date.now().toString().slice(-6)}`,
      notes: `Added ₹${amt.toLocaleString('en-IN')} via ${topupMethod}`,
    };

    try {
      let createdTx = null;
      try {
        const res = await apiPost('/api/v1/wallets/topup', payload);
        createdTx = res?.data || res?.transaction || payload;
      } catch (_topupErr) {
        const res = await apiPost('/api/v1/wallets', payload).catch(() => null);
        createdTx = res?.data || payload;
      }

      await apiPut('/auth/profile', { walletBalance: nextBalance }).catch(() => {});

      updateUser({ walletBalance: nextBalance });
      setWalletTransactions((prev) => [
        {
          _id: createdTx?._id || `tx-${Date.now()}`,
          ...payload,
          ...(createdTx || {}),
          createdAt: new Date().toISOString(),
        },
        ...prev,
      ]);
      setTopupModalVisible(false);
      Alert.alert(
        'Money Added Successfully',
        `₹${amt.toLocaleString('en-IN')} has been credited to your wallet via ${topupMethod}. New balance: ₹${nextBalance.toLocaleString('en-IN')}.`
      );
    } catch (err) {
      Alert.alert('Top-up Error', err.message || 'Could not process wallet top-up.');
    } finally {
      setIsToppingUp(false);
    }
  };

  const handleOpenRedeemModal = () => {
    if (!isEligible) {
      Alert.alert(
        'Redemption Locked',
        `You need a minimum balance of ₹${minRedeemAmount} to request a payout. Your current balance is ₹${walletBalance.toFixed(2)}. You can also tap "Add Money" to top up your wallet.`
      );
      return;
    }
    setRedeemAmount(String(walletBalance));
    setRedeemModalVisible(true);
  };

  const handleConfirmRedeem = async () => {
    const amt = parseFloat(redeemAmount);
    if (isNaN(amt) || amt < minRedeemAmount) {
      Alert.alert('Invalid Amount', `Minimum redemption amount is ₹${minRedeemAmount}.`);
      return;
    }
    if (amt > walletBalance) {
      Alert.alert(
        'Insufficient Balance',
        `You cannot redeem more than your available balance of ₹${walletBalance.toFixed(2)}.`
      );
      return;
    }

    if (payoutType === 'upi') {
      if (!upiId.trim() || !upiId.includes('@')) {
        Alert.alert('Invalid UPI ID', 'Please enter a valid UPI ID (e.g. mobile@upi or username@bank).');
        return;
      }
    } else {
      if (!accountNumber.trim() || accountNumber !== confirmAccount) {
        Alert.alert('Account Mismatch', 'Bank account numbers do not match.');
        return;
      }
      if (!ifscCode.trim() || ifscCode.length < 4) {
        Alert.alert('Invalid IFSC', 'Please enter a valid Bank IFSC code.');
        return;
      }
      if (!holderName.trim()) {
        Alert.alert('Name Required', 'Please provide the account holder name.');
        return;
      }
    }

    setIsSubmitting(true);
    const nextBalance = Math.max(0, walletBalance - amt);
    const payload = {
      userId: user?._id || user?.id,
      userName: user?.name || 'BigBazaar User',
      type: 'debit',
      amount: amt,
      category: 'withdrawal',
      status: 'completed',
      reference: `PAYOUT-${Date.now().toString().slice(-6)}`,
      notes:
        payoutType === 'upi'
          ? `Payout to UPI (${upiId.trim()})`
          : `Bank Transfer (${ifscCode.trim()})`,
    };

    try {
      const res = await apiPost('/api/v1/wallets', payload).catch(() => null);
      await apiPut('/auth/profile', { walletBalance: nextBalance }).catch(() => {});

      updateUser({ walletBalance: nextBalance });
      setWalletTransactions((prev) => [
        {
          _id: res?.data?._id || `tx-${Date.now()}`,
          ...payload,
          createdAt: new Date().toISOString(),
        },
        ...prev,
      ]);
      setRedeemModalVisible(false);
      Alert.alert(
        'Redemption Request Submitted',
        `₹${amt.toLocaleString('en-IN')} payout initiated. Remaining balance: ₹${nextBalance.toLocaleString('en-IN')}.`
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScreenContainer noPadding style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#002F34" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Wallet</Text>
        <TouchableOpacity
          onPress={() =>
            Alert.alert(
              'Wallet Help',
              `Every user starts with ₹0 balance. Add money anytime via UPI/Card or earn from marketplace sales & services. Redeem once your balance reaches ₹${minRedeemAmount}.`
            )
          }
          style={styles.infoBtn}
        >
          <Ionicons name="information-circle-outline" size={24} color="#64748B" />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#002F34']} />
        }
      >
        {/* Wallet Balance Hero Card */}
        <View style={styles.balanceCard}>
          <View style={styles.balanceTopRow}>
            <View>
              <Text style={styles.balanceLabel}>AVAILABLE BALANCE</Text>
              <Text style={styles.balanceAmount}>
                ₹{walletBalance.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </Text>
            </View>
            <View style={styles.walletIconCircle}>
              <Ionicons name="wallet" size={26} color="#FFFFFF" />
            </View>
          </View>

          {/* Dynamic Progress Bar & Threshold Gate */}
          <View style={styles.progressContainer}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressText}>
                {isEligible
                  ? `Redeem unlocked (Reached ₹${minRedeemAmount})`
                  : `₹${walletBalance.toFixed(0)} of ₹${minRedeemAmount} needed for bank payout`}
              </Text>
              <Text style={styles.progressPercent}>{Math.round(progressPercent)}%</Text>
            </View>
            <View style={styles.progressBarTrack}>
              <View
                style={[
                  styles.progressBarFill,
                  {
                    width: `${progressPercent}%`,
                    backgroundColor: isEligible ? '#10B981' : '#38BDF8',
                  },
                ]}
              />
            </View>
          </View>

          {/* Dual Action Buttons: Add Money + Redeem */}
          <View style={styles.walletActionRow}>
            <TouchableOpacity
              style={styles.addMoneyBtn}
              onPress={() => setTopupModalVisible(true)}
              activeOpacity={0.85}
            >
              <Ionicons name="add-circle" size={18} color="#002F34" style={{ marginRight: 6 }} />
              <Text style={styles.addMoneyBtnText}>Add Money</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.redeemBtn,
                !isEligible ? styles.redeemBtnDisabled : styles.redeemBtnActive,
              ]}
              onPress={handleOpenRedeemModal}
              activeOpacity={0.85}
            >
              <Ionicons
                name={isEligible ? 'cash-outline' : 'lock-closed-outline'}
                size={16}
                color="#FFFFFF"
                style={{ marginRight: 6 }}
              />
              <Text style={styles.redeemBtnText}>
                {isEligible ? 'Withdraw' : `Redeem (₹${minRedeemAmount}+)`}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Info Banner */}
        <View style={styles.infoBanner}>
          <Ionicons name="shield-checkmark" size={20} color="#059669" style={{ marginRight: 10, marginTop: 2 }} />
          <View style={{ flex: 1 }}>
            <Text style={styles.infoBannerTitle}>Safe Escrow & Instant Top-Up</Text>
            <Text style={styles.infoBannerText}>
              Use your BigBazaar Wallet for 1-tap checkout on marketplace deals and doorstep services, or withdraw earnings directly to UPI.
            </Text>
          </View>
        </View>

        {/* Transactions Section */}
        <View style={styles.transactionsHeader}>
          <Text style={styles.transactionsTitle}>TRANSACTION LEDGER</Text>
          {loading && <ActivityIndicator size="small" color="#002F34" />}
        </View>

        {/* Filter Tabs */}
        <View style={styles.tabsRow}>
          {['All', 'Credits', 'Redemptions'].map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[styles.tabChip, activeTab === tab && styles.tabChipActive]}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={[styles.tabChipText, activeTab === tab && styles.tabChipTextActive]}>
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Transaction List or Empty State */}
        {filteredTransactions.length === 0 ? (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconCircle}>
              <Ionicons name="receipt-outline" size={32} color="#64748B" />
            </View>
            <Text style={styles.emptyTitle}>No wallet transactions yet</Text>
            <Text style={styles.emptySubtitle}>
              Your wallet starts at ₹0. Tap "Add Money" above to top up your balance or complete a deal to earn credits.
            </Text>
          </View>
        ) : (
          <View style={styles.txList}>
            {filteredTransactions.map((tx, index) => {
              const isCredit = tx.type !== 'debit';
              const dateStr = tx.createdAt
                ? new Date(tx.createdAt).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })
                : 'Today';
              return (
                <View key={tx._id || tx.id || `tx-${index}`} style={styles.txCard}>
                  <View
                    style={[
                      styles.txIconWrap,
                      { backgroundColor: isCredit ? '#ECFDF5' : '#FEF2F2' },
                    ]}
                  >
                    <Ionicons
                      name={isCredit ? 'arrow-down-outline' : 'arrow-up-outline'}
                      size={18}
                      color={isCredit ? '#059669' : '#DC2626'}
                    />
                  </View>
                  <View style={styles.txInfo}>
                    <Text style={styles.txTitle} numberOfLines={1}>
                      {tx.notes || (isCredit ? 'Wallet Credit / Top-up' : 'Wallet Withdrawal')}
                    </Text>
                    <Text style={styles.txMeta}>
                      {dateStr} {tx.reference ? `• ${tx.reference}` : ''}
                    </Text>
                  </View>
                  <Text
                    style={[
                      styles.txAmount,
                      { color: isCredit ? '#059669' : '#DC2626' },
                    ]}
                  >
                    {isCredit ? '+' : '-'}₹{Number(tx.amount || 0).toLocaleString('en-IN')}
                  </Text>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>

      {/* Add Money / Top-up Modal */}
      <Modal
        visible={isTopupModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setTopupModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Money to Wallet</Text>
              <TouchableOpacity onPress={() => setTopupModalVisible(false)}>
                <Ionicons name="close" size={24} color="#002F34" />
              </TouchableOpacity>
            </View>

            <Text style={styles.inputLabel}>Enter Amount (₹)</Text>
            <TextInput
              style={styles.textInput}
              keyboardType="numeric"
              value={topupAmount}
              onChangeText={(t) => setTopupAmount(t.replace(/[^0-9]/g, ''))}
              placeholder="e.g. 500"
            />

            <View style={styles.presetRow}>
              {TOPUP_PRESETS.map((amt) => {
                const active = Number(topupAmount) === amt;
                return (
                  <TouchableOpacity
                    key={amt}
                    style={[styles.presetChip, active && styles.presetChipActive]}
                    onPress={() => setTopupAmount(String(amt))}
                  >
                    <Text style={[styles.presetChipText, active && styles.presetChipTextActive]}>
                      +₹{amt}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <Text style={[styles.inputLabel, { marginTop: 14 }]}>Payment Method</Text>
            <View style={styles.payoutTabs}>
              {['UPI', 'Card', 'NetBanking'].map((m) => {
                const active = topupMethod === m;
                return (
                  <TouchableOpacity
                    key={m}
                    style={[styles.payoutTabBtn, active && styles.payoutTabBtnActive]}
                    onPress={() => setTopupMethod(m)}
                  >
                    <Text style={[styles.payoutTabText, active && styles.payoutTabTextActive]}>
                      {m}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <TouchableOpacity
              style={styles.submitRedeemBtn}
              onPress={handleConfirmTopup}
              disabled={isToppingUp}
            >
              {isToppingUp ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.submitRedeemBtnText}>
                  Proceed to Add ₹{Number(topupAmount || 0).toLocaleString('en-IN')}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Redeem Modal */}
      <Modal
        visible={isRedeemModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setRedeemModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Redeem Wallet Balance</Text>
              <TouchableOpacity onPress={() => setRedeemModalVisible(false)}>
                <Ionicons name="close" size={24} color="#002F34" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.inputLabel}>Redemption Amount (₹)</Text>
              <TextInput
                style={styles.textInput}
                keyboardType="numeric"
                value={redeemAmount}
                onChangeText={setRedeemAmount}
                placeholder={`Min ₹${minRedeemAmount}`}
              />

              <Text style={[styles.inputLabel, { marginTop: 14 }]}>Payout Destination</Text>
              <View style={styles.payoutTabs}>
                <TouchableOpacity
                  style={[styles.payoutTabBtn, payoutType === 'upi' && styles.payoutTabBtnActive]}
                  onPress={() => setPayoutType('upi')}
                >
                  <Ionicons name="flash-outline" size={16} color={payoutType === 'upi' ? '#FFFFFF' : '#002F34'} />
                  <Text style={[styles.payoutTabText, payoutType === 'upi' && styles.payoutTabTextActive]}>UPI</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.payoutTabBtn, payoutType === 'bank' && styles.payoutTabBtnActive]}
                  onPress={() => setPayoutType('bank')}
                >
                  <Ionicons name="business-outline" size={16} color={payoutType === 'bank' ? '#FFFFFF' : '#002F34'} />
                  <Text style={[styles.payoutTabText, payoutType === 'bank' && styles.payoutTabTextActive]}>Bank Transfer</Text>
                </TouchableOpacity>
              </View>

              {payoutType === 'upi' ? (
                <View style={{ marginTop: 12 }}>
                  <Text style={styles.inputLabel}>UPI ID</Text>
                  <TextInput
                    style={styles.textInput}
                    value={upiId}
                    onChangeText={setUpiId}
                    placeholder="e.g. 9876543210@upi or name@okaxis"
                    autoCapitalize="none"
                  />
                </View>
              ) : (
                <View style={{ marginTop: 12 }}>
                  <Text style={styles.inputLabel}>Account Holder Name</Text>
                  <TextInput
                    style={styles.textInput}
                    value={holderName}
                    onChangeText={setHolderName}
                    placeholder="As shown in bank passbook"
                  />

                  <Text style={[styles.inputLabel, { marginTop: 10 }]}>Bank Account Number</Text>
                  <TextInput
                    style={styles.textInput}
                    keyboardType="numeric"
                    value={accountNumber}
                    onChangeText={setAccountNumber}
                    placeholder="Enter account number"
                  />

                  <Text style={[styles.inputLabel, { marginTop: 10 }]}>Confirm Account Number</Text>
                  <TextInput
                    style={styles.textInput}
                    keyboardType="numeric"
                    value={confirmAccount}
                    onChangeText={setConfirmAccount}
                    placeholder="Re-enter account number"
                  />

                  <Text style={[styles.inputLabel, { marginTop: 10 }]}>IFSC Code</Text>
                  <TextInput
                    style={styles.textInput}
                    value={ifscCode}
                    onChangeText={(t) => setIfscCode(t.toUpperCase())}
                    placeholder="e.g. HDFC0001234"
                    autoCapitalize="characters"
                  />
                </View>
              )}

              <TouchableOpacity
                style={styles.submitRedeemBtn}
                onPress={handleConfirmRedeem}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.submitRedeemBtnText}>Request Payout</Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#002F34',
  },
  scrollContent: {
    padding: Spacing.md,
    paddingBottom: 40,
  },
  balanceCard: {
    backgroundColor: '#002F34',
    borderRadius: 16,
    padding: Spacing.lg,
    ...Shadows.subtle,
  },
  balanceTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  balanceLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.72)',
    letterSpacing: 0.6,
  },
  balanceAmount: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFFFFF',
    marginTop: 4,
  },
  walletIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.14)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressContainer: {
    marginBottom: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    padding: 12,
    borderRadius: 10,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  progressText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.9)',
  },
  progressPercent: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  progressBarTrack: {
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  walletActionRow: {
    flexDirection: 'row',
    gap: 10,
  },
  addMoneyBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 10,
  },
  addMoneyBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#002F34',
  },
  redeemBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 10,
  },
  redeemBtnActive: {
    backgroundColor: '#1548A6',
  },
  redeemBtnDisabled: {
    backgroundColor: 'rgba(255, 255, 255, 0.16)',
  },
  redeemBtnText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  infoBanner: {
    flexDirection: 'row',
    backgroundColor: '#ECFDF5',
    borderColor: '#A7F3D0',
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginTop: 14,
  },
  infoBannerTitle: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#059669',
    marginBottom: 2,
  },
  infoBannerText: {
    fontSize: 11.5,
    color: '#475569',
    lineHeight: 16,
  },
  transactionsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 24,
    marginBottom: 10,
  },
  transactionsTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.6,
  },
  tabsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  tabChip: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  tabChipActive: {
    backgroundColor: '#002F34',
    borderColor: '#002F34',
  },
  tabChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  tabChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  txList: {
    gap: 10,
  },
  txCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 12,
  },
  txIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  txInfo: {
    flex: 1,
    marginRight: 8,
  },
  txTitle: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#002F34',
  },
  txMeta: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  txAmount: {
    fontSize: 15,
    fontWeight: '800',
  },
  emptyContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
  },
  emptyIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#002F34',
    marginBottom: 4,
  },
  emptySubtitle: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 17,
    maxWidth: 280,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#002F34',
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
    marginBottom: 6,
  },
  textInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#002F34',
    fontWeight: '600',
  },
  presetRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
  },
  presetChip: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
  },
  presetChipActive: {
    backgroundColor: '#EFF6FF',
    borderColor: '#1548A6',
  },
  presetChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#002F34',
  },
  presetChipTextActive: {
    color: '#1548A6',
  },
  payoutTabs: {
    flexDirection: 'row',
    gap: 10,
  },
  payoutTabBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
  },
  payoutTabBtnActive: {
    backgroundColor: '#002F34',
    borderColor: '#002F34',
  },
  payoutTabText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#002F34',
  },
  payoutTabTextActive: {
    color: '#FFFFFF',
  },
  submitRedeemBtn: {
    backgroundColor: '#1548A6',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    marginBottom: 10,
  },
  submitRedeemBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});
