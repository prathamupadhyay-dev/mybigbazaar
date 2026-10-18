import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  ScrollView,
  Modal,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import ScreenContainer from '../../components/ScreenContainer';
import Colors from '../../constants/colors';
import Typography from '../../constants/typography';
import Spacing from '../../constants/spacing';
import Radii from '../../constants/radii';
import Shadows from '../../constants/shadows';
import { useApp } from '../../context/AppContext';
import { changePasswordApi } from '../../services/authApi';

export default function SecuritySettingsScreen() {
  const navigation = useNavigation();
  const { appLockEnabled, setAppLockEnabled } = useApp();

  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [passwordModalVisible, setPasswordModalVisible] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  const handleToggle2FA = (val) => {
    if (val) {
      Alert.alert(
        'Enable 2-Step Verification',
        'When signing in from a new device, an SMS verification code will be required.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Enable',
            onPress: () => {
              setTwoFactorEnabled(true);
              Alert.alert('2FA Enabled', 'Your account is now protected by 2-step verification.');
            },
          },
        ]
      );
    } else {
      setTwoFactorEnabled(false);
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword) {
      setPasswordError('Please enter your current password.');
      return;
    }
    if (!newPassword || newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match.');
      return;
    }

    setIsChangingPassword(true);
    setPasswordError('');

    try {
      const res = await changePasswordApi({ currentPassword, newPassword });
      setIsChangingPassword(false);
      setPasswordModalVisible(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      Alert.alert('Success', res.message || 'Password changed successfully!');
    } catch (err) {
      setIsChangingPassword(false);
      setPasswordError(err.message || 'Could not change password. Please verify current password.');
    }
  };

  return (
    <ScreenContainer noPadding style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()} accessibilityLabel="Back">
          <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>App Lock & Security</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <View style={styles.heroIcon}>
            <Ionicons
              name={appLockEnabled ? 'lock-closed' : 'shield-checkmark-outline'}
              size={36}
              color={Colors.primary}
            />
          </View>
          <Text style={styles.title}>Account Protection</Text>
          <Text style={styles.subtitle}>
            Safeguard your personal data, saved cards, and transaction history.
          </Text>
        </View>

        {/* Setting 1: App Lock */}
        <View style={styles.settingCard}>
          <View style={styles.settingCopy}>
            <View style={styles.cardTitleRow}>
              <Ionicons name="finger-print-outline" size={20} color={Colors.primary} style={{ marginRight: 6 }} />
              <Text style={styles.settingTitle}>Biometric App Lock</Text>
            </View>
            <Text style={styles.settingSubtitle}>
              Require biometric authentication (Face ID or Fingerprint) whenever BigBazaar is opened.
            </Text>
          </View>
          <Switch
            value={appLockEnabled}
            onValueChange={setAppLockEnabled}
            trackColor={{ false: '#CBD5E1', true: '#93C5FD' }}
            thumbColor={appLockEnabled ? Colors.primary : '#FFFFFF'}
          />
        </View>

        {/* Setting 2: Two-Factor Auth */}
        <View style={styles.settingCard}>
          <View style={styles.settingCopy}>
            <View style={styles.cardTitleRow}>
              <Ionicons name="keypad-outline" size={20} color={Colors.primary} style={{ marginRight: 6 }} />
              <Text style={styles.settingTitle}>Two-Factor Authentication</Text>
            </View>
            <Text style={styles.settingSubtitle}>
              Require an SMS OTP when logging in from unknown devices or browsers.
            </Text>
          </View>
          <Switch
            value={twoFactorEnabled}
            onValueChange={handleToggle2FA}
            trackColor={{ false: '#CBD5E1', true: '#93C5FD' }}
            thumbColor={twoFactorEnabled ? Colors.primary : '#FFFFFF'}
          />
        </View>

        {/* Action: Change Password */}
        <TouchableOpacity
          style={styles.actionCard}
          onPress={() => {
            setPasswordError('');
            setPasswordModalVisible(true);
          }}>
          <View style={styles.actionLeft}>
            <View style={styles.actionIconBox}>
              <Ionicons name="lock-closed-outline" size={20} color={Colors.primary} />
            </View>
            <View>
              <Text style={styles.actionTitle}>Change Password</Text>
              <Text style={styles.actionSubtitle}>Update your account login password</Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={18} color={Colors.disabled} />
        </TouchableOpacity>

        {/* Device Info Card */}
        <View style={styles.infoBox}>
          <Ionicons name="phone-portrait-outline" size={18} color={Colors.textSecondary} />
          <Text style={styles.infoText}>
            Current Session: Active on this device. Secured with end-to-end token encryption.
          </Text>
        </View>
      </ScrollView>

      {/* Change Password Modal */}
      <Modal visible={passwordModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={styles.modalBg}
            onPress={() => setPasswordModalVisible(false)}
            activeOpacity={1}
          />
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Change Password</Text>
              <TouchableOpacity onPress={() => setPasswordModalVisible(false)}>
                <Ionicons name="close" size={24} color={Colors.textPrimary} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
              {/* Current Password */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Current Password</Text>
                <View style={styles.inputWrapper}>
                  <TextInput
                    style={styles.input}
                    value={currentPassword}
                    onChangeText={setCurrentPassword}
                    placeholder="Enter current password"
                    placeholderTextColor={Colors.disabled}
                    secureTextEntry={!showCurrent}
                    autoCapitalize="none"
                  />
                  <TouchableOpacity onPress={() => setShowCurrent(!showCurrent)}>
                    <Ionicons
                      name={showCurrent ? 'eye-off-outline' : 'eye-outline'}
                      size={18}
                      color={Colors.textSecondary}
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {/* New Password */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>New Password</Text>
                <View style={styles.inputWrapper}>
                  <TextInput
                    style={styles.input}
                    value={newPassword}
                    onChangeText={setNewPassword}
                    placeholder="At least 6 characters"
                    placeholderTextColor={Colors.disabled}
                    secureTextEntry={!showNew}
                    autoCapitalize="none"
                  />
                  <TouchableOpacity onPress={() => setShowNew(!showNew)}>
                    <Ionicons
                      name={showNew ? 'eye-off-outline' : 'eye-outline'}
                      size={18}
                      color={Colors.textSecondary}
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Confirm New Password */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Confirm New Password</Text>
                <View style={styles.inputWrapper}>
                  <TextInput
                    style={styles.input}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    placeholder="Re-enter new password"
                    placeholderTextColor={Colors.disabled}
                    secureTextEntry={!showNew}
                    autoCapitalize="none"
                  />
                </View>
              </View>

              {passwordError ? (
                <View style={styles.errorBox}>
                  <Ionicons name="alert-circle" size={16} color={Colors.error} />
                  <Text style={styles.errorText}>{passwordError}</Text>
                </View>
              ) : null}

              <TouchableOpacity
                style={[styles.savePasswordBtn, isChangingPassword && styles.savePasswordBtnDisabled]}
                onPress={handleChangePassword}
                disabled={isChangingPassword}>
                {isChangingPassword ? (
                  <ActivityIndicator color={Colors.white} />
                ) : (
                  <Text style={styles.savePasswordBtnText}>Update Password</Text>
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
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backButton: {
    padding: Spacing.xs,
  },
  headerTitle: {
    ...Typography.heading2,
    fontSize: 18,
    color: Colors.textPrimary,
  },
  scrollContent: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },
  heroSection: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  heroIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  title: {
    ...Typography.heading2,
    fontSize: 20,
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  subtitle: {
    ...Typography.body,
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: Spacing.lg,
  },
  settingCard: {
    backgroundColor: Colors.white,
    borderRadius: Radii.card,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
    ...Shadows.subtle,
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  settingCopy: {
    flex: 1,
    paddingRight: Spacing.md,
  },
  settingTitle: {
    ...Typography.bodyBold,
    fontSize: 15,
    color: Colors.textPrimary,
  },
  settingSubtitle: {
    ...Typography.caption,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  actionCard: {
    backgroundColor: Colors.white,
    borderRadius: Radii.card,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.lg,
    ...Shadows.subtle,
  },
  actionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  actionIconBox: {
    width: 40,
    height: 40,
    borderRadius: Radii.control,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionTitle: {
    ...Typography.bodyBold,
    fontSize: 15,
    color: Colors.textPrimary,
  },
  actionSubtitle: {
    ...Typography.caption,
    color: Colors.textSecondary,
    fontSize: 12,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: Radii.control,
    padding: Spacing.md,
    gap: 8,
  },
  infoText: {
    ...Typography.caption,
    color: Colors.textSecondary,
    flex: 1,
    lineHeight: 17,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalBg: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: Colors.overlay,
  },
  modalSheet: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: Radii.sheet,
    borderTopRightRadius: Radii.sheet,
    padding: Spacing.lg,
    paddingBottom: Spacing.xxl,
    ...Shadows.sheet,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  modalTitle: {
    ...Typography.heading2,
    fontSize: 18,
    color: Colors.textPrimary,
  },
  inputGroup: {
    marginBottom: Spacing.md,
  },
  inputLabel: {
    ...Typography.captionBold,
    color: Colors.textPrimary,
    marginBottom: 6,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radii.control,
    paddingHorizontal: Spacing.md,
    backgroundColor: '#F8FAFC',
    height: 48,
  },
  input: {
    flex: 1,
    ...Typography.body,
    fontSize: 14,
    color: Colors.textPrimary,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
    gap: 6,
  },
  errorText: {
    ...Typography.caption,
    color: Colors.error,
    fontSize: 12,
    flex: 1,
  },
  savePasswordBtn: {
    backgroundColor: Colors.primary,
    borderRadius: Radii.button,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: Spacing.sm,
  },
  savePasswordBtnDisabled: {
    opacity: 0.6,
  },
  savePasswordBtnText: {
    ...Typography.button,
    color: Colors.white,
    fontSize: 15,
  },
});
