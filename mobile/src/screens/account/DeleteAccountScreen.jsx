import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
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
import { deleteAccountApi } from '../../services/authApi';

const REASON_OPTIONS = [
  'Found an alternative platform',
  'Too many notifications or alerts',
  'Privacy and data security concerns',
  'Temporary break / not using anymore',
  'Other reason',
];

export const DeleteAccountScreen = () => {
  const navigation = useNavigation();
  const { setAuthenticated } = useApp();

  const [selectedReason, setSelectedReason] = useState(REASON_OPTIONS[0]);
  const [otherReasonText, setOtherReasonText] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState('');

  const executeAccountDeletion = async () => {
    setIsDeleting(true);
    setError('');

    try {
      const finalReason = selectedReason === 'Other reason' && otherReasonText.trim()
        ? `Other: ${otherReasonText.trim()}`
        : selectedReason;

      await deleteAccountApi({ password, reason: finalReason });

      setAuthenticated(false);
      setIsDeleting(false);

      Alert.alert(
        'Account Deleted',
        'Your MyBigBazaar account and associated data have been permanently removed.',
        [
          {
            text: 'OK',
            onPress: () => {
              navigation.reset({
                index: 0,
                routes: [{ name: 'Main' }],
              });
            },
          },
        ]
      );
    } catch (err) {
      setIsDeleting(false);
      setError(err.message || 'Failed to delete account. Please verify your password.');
    }
  };

  const handleInitiateDelete = () => {
    if (!password.trim()) {
      setError('Please enter your account password to confirm deletion.');
      return;
    }

    Alert.alert(
      'Permanent Account Deletion',
      'Are you completely sure? This action is permanent and cannot be undone. All your listings, bookings, and chats will be wiped.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Permanently Delete',
          style: 'destructive',
          onPress: executeAccountDeletion,
        },
      ]
    );
  };

  return (
    <ScreenContainer noPadding style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()} accessibilityLabel="Back">
          <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Delete Account</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled">
        {/* Warning Banner */}
        <View style={styles.warningBox}>
          <Ionicons name="warning" size={40} color="#DC2626" />
          <Text style={styles.warningTitle}>Irreversible Action</Text>
          <Text style={styles.warningText}>
            Deleting your account will permanently wipe your profile, active listings, order history,
            saved addresses, and messages. You will not be able to recover this data.
          </Text>
        </View>

        {/* Reason Selection */}
        <Text style={styles.sectionHeading}>Why are you leaving us?</Text>
        <View style={styles.reasonsCard}>
          {REASON_OPTIONS.map((reason) => {
            const isSelected = selectedReason === reason;
            return (
              <TouchableOpacity
                key={reason}
                style={[styles.reasonRow, isSelected && styles.reasonRowSelected]}
                onPress={() => setSelectedReason(reason)}>
                <Ionicons
                  name={isSelected ? 'radio-button-on' : 'radio-button-off'}
                  size={20}
                  color={isSelected ? Colors.primary : Colors.disabled}
                  style={{ marginRight: Spacing.sm }}
                />
                <Text style={[styles.reasonText, isSelected && styles.reasonTextSelected]}>
                  {reason}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {selectedReason === 'Other reason' && (
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Please tell us more (Optional)</Text>
            <TextInput
              style={styles.otherInput}
              value={otherReasonText}
              onChangeText={setOtherReasonText}
              placeholder="Your feedback helps us improve..."
              placeholderTextColor={Colors.disabled}
              multiline
              numberOfLines={2}
            />
          </View>
        )}

        {/* Password Verification */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Confirm Your Password</Text>
          <View style={[styles.passwordWrapper, error && styles.inputError]}>
            <Ionicons name="lock-closed-outline" size={19} color={Colors.textSecondary} />
            <TextInput
              style={styles.passwordInput}
              value={password}
              onChangeText={(t) => {
                setPassword(t);
                if (error) setError('');
              }}
              placeholder="Enter your current password"
              placeholderTextColor={Colors.disabled}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <Ionicons
                name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                size={18}
                color={Colors.textSecondary}
              />
            </TouchableOpacity>
          </View>
          {error ? <Text style={styles.errorText}>{error}</Text> : null}
        </View>

        {/* Delete Button */}
        <TouchableOpacity
          style={[styles.deleteBtn, isDeleting && styles.deleteBtnDisabled]}
          onPress={handleInitiateDelete}
          disabled={isDeleting}>
          {isDeleting ? (
            <ActivityIndicator color={Colors.white} />
          ) : (
            <Text style={styles.deleteBtnText}>Permanently Delete My Account</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </ScreenContainer>
  );
};

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
  backBtn: {
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
  warningBox: {
    backgroundColor: '#FEF2F2',
    padding: Spacing.lg,
    borderRadius: Radii.card,
    borderWidth: 1,
    borderColor: '#FECACA',
    alignItems: 'center',
    marginBottom: Spacing.xl,
    ...Shadows.subtle,
  },
  warningTitle: {
    ...Typography.heading3,
    color: '#DC2626',
    marginTop: Spacing.sm,
    marginBottom: 4,
  },
  warningText: {
    ...Typography.body,
    fontSize: 13,
    color: '#991B1B',
    textAlign: 'center',
    lineHeight: 19,
  },
  sectionHeading: {
    ...Typography.captionBold,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  reasonsCard: {
    backgroundColor: Colors.white,
    borderRadius: Radii.card,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.sm,
    marginBottom: Spacing.lg,
    ...Shadows.subtle,
  },
  reasonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md - 2,
    paddingHorizontal: Spacing.sm,
    borderRadius: Radii.control,
  },
  reasonRowSelected: {
    backgroundColor: '#EFF6FF',
  },
  reasonText: {
    ...Typography.body,
    fontSize: 14,
    color: Colors.textPrimary,
  },
  reasonTextSelected: {
    ...Typography.bodyBold,
    color: Colors.primary,
  },
  inputGroup: {
    marginBottom: Spacing.xl,
  },
  inputLabel: {
    ...Typography.captionBold,
    color: Colors.textPrimary,
    marginBottom: 6,
  },
  otherInput: {
    backgroundColor: Colors.white,
    borderRadius: Radii.control,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.md,
    height: 70,
    fontSize: 14,
    color: Colors.textPrimary,
    textAlignVertical: 'top',
  },
  passwordWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radii.control,
    paddingHorizontal: Spacing.md,
    height: 48,
  },
  passwordInput: {
    flex: 1,
    ...Typography.body,
    fontSize: 14,
    color: Colors.textPrimary,
    marginLeft: Spacing.sm,
  },
  inputError: {
    borderColor: Colors.error,
  },
  errorText: {
    ...Typography.caption,
    color: Colors.error,
    fontSize: 12,
    marginTop: 4,
  },
  deleteBtn: {
    backgroundColor: '#DC2626',
    paddingVertical: 16,
    borderRadius: Radii.button,
    alignItems: 'center',
    marginTop: Spacing.sm,
    ...Shadows.subtle,
  },
  deleteBtnDisabled: {
    opacity: 0.6,
  },
  deleteBtnText: {
    ...Typography.bodyBold,
    color: Colors.white,
    fontSize: 15,
  },
});

export default DeleteAccountScreen;