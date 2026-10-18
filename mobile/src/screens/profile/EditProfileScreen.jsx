import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../../context/AppContext';
import ScreenContainer from '../../components/ScreenContainer';
import Colors from '../../constants/colors';
import Typography from '../../constants/typography';
import Spacing from '../../constants/spacing';
import Radii from '../../constants/radii';
import Shadows from '../../constants/shadows';
import { updateProfileApi, saveUserProfile } from '../../services/authApi';

const AVATAR_OPTIONS = [
  { id: 'av-1', icon: 'person', label: 'Classic Blue', bg: '#2563EB', fg: '#FFFFFF' },
  { id: 'av-2', icon: 'person-circle', label: 'Emerald Pro', bg: '#059669', fg: '#FFFFFF' },
  { id: 'av-3', icon: 'sparkles', label: 'Amber Star', bg: '#D97706', fg: '#FFFFFF' },
  { id: 'av-4', icon: 'shield-checkmark', label: 'Indigo Shield', bg: '#4F46E5', fg: '#FFFFFF' },
  { id: 'av-5', icon: 'happy', label: 'Ruby Smile', bg: '#DC2626', fg: '#FFFFFF' },
  { id: 'av-6', icon: 'heart', label: 'Rose Gold', bg: '#DB2777', fg: '#FFFFFF' },
];

const GENDER_OPTIONS = ['Male', 'Female', 'Other', 'Prefer not to say'];

export default function EditProfileScreen() {
  const navigation = useNavigation();
  const { user, updateUser } = useApp();

  const [name, setName] = useState(user?.fullName || user?.name || '');
  const [phone, setPhone] = useState(user?.mobileNumber || user?.phone || user?.phoneNumber || '');
  const [gender, setGender] = useState(user?.gender || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [selectedAvatar, setSelectedAvatar] = useState(user?.avatar || AVATAR_OPTIONS[0]);
  const [avatarModalVisible, setAvatarModalVisible] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Validation Error', 'Full Name cannot be empty.');
      return;
    }

    const cleanPhone = phone.trim();
    if (!cleanPhone) {
      Alert.alert('Validation Error', 'Phone number is required.');
      return;
    }

    setIsSaving(true);

    const updatedProfile = {
      fullName: name.trim(),
      mobileNumber: cleanPhone,
      email: user.email,
      gender,
      bio: bio.trim(),
      avatar: selectedAvatar,
      role: user.role || 'Buyer',
    };

    try {
      // 1. Update in-memory AppContext state immediately
      updateUser(updatedProfile);

      // 2. Persist to AsyncStorage
      await saveUserProfile(updatedProfile);

      // 3. Call backend API (with offline resilience built-in)
      await updateProfileApi({
        fullName: updatedProfile.fullName,
        phoneNumber: updatedProfile.mobileNumber,
        gender: updatedProfile.gender,
        bio: updatedProfile.bio,
        avatar: updatedProfile.avatar,
      });

      setIsSaving(false);
      Alert.alert('Profile Updated', 'Your profile details have been successfully saved.', [
        { text: 'Done', onPress: () => navigation.goBack() },
      ]);
    } catch (err) {
      setIsSaving(false);
      Alert.alert('Saved with Notice', 'Changes saved to device. Server response: ' + err.message, [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    }
  };

  return (
    <ScreenContainer noPadding style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()} accessibilityLabel="Back">
          <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <TouchableOpacity
          onPress={handleSave}
          style={[styles.saveBtn, isSaving && styles.saveBtnDisabled]}
          disabled={isSaving}>
          {isSaving ? (
            <ActivityIndicator size="small" color={Colors.primary} />
          ) : (
            <Text style={styles.saveBtnText}>Save</Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled">
        {/* Avatar Section */}
        <View style={styles.avatarSection}>
          <TouchableOpacity
            style={[styles.avatarBadge, { backgroundColor: selectedAvatar?.bg || Colors.primary }]}
            onPress={() => setAvatarModalVisible(true)}
            activeOpacity={0.8}>
            <Ionicons
              name={selectedAvatar?.icon || 'person'}
              size={48}
              color={selectedAvatar?.fg || Colors.white}
            />
            <View style={styles.cameraIconContainer}>
              <Ionicons name="camera" size={14} color={Colors.white} />
            </View>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setAvatarModalVisible(true)}>
            <Text style={styles.changeAvatarText}>Change Avatar</Text>
          </TouchableOpacity>
        </View>

        {/* Form Fields */}
        <View style={styles.formCard}>
          {/* Full Name */}
          <View style={styles.inputGroup}>
            <Text style={styles.fieldLabel}>Full Name</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="person-outline" size={19} color={Colors.textSecondary} />
              <TextInput
                style={styles.textInput}
                value={name}
                onChangeText={setName}
                placeholder="Enter full name"
                placeholderTextColor={Colors.disabled}
              />
            </View>
          </View>

          {/* Email Address (Read-Only) */}
          <View style={styles.inputGroup}>
            <View style={styles.labelRow}>
              <Text style={styles.fieldLabel}>Email Address</Text>
              <View style={styles.readOnlyBadge}>
                <Ionicons name="lock-closed" size={12} color={Colors.textSecondary} style={{ marginRight: 3 }} />
                <Text style={styles.readOnlyText}>Read-Only</Text>
              </View>
            </View>
            <View style={[styles.inputWrapper, styles.readOnlyInput]}>
              <Ionicons name="mail-outline" size={19} color={Colors.disabled} />
              <TextInput
                style={[styles.textInput, styles.readOnlyFieldText]}
                value={user.email}
                editable={false}
              />
            </View>
            <Text style={styles.helperText}>Email is linked to account security and cannot be changed.</Text>
          </View>

          {/* Phone Number */}
          <View style={styles.inputGroup}>
            <Text style={styles.fieldLabel}>Phone Number</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="call-outline" size={19} color={Colors.textSecondary} />
              <TextInput
                style={styles.textInput}
                value={phone}
                onChangeText={setPhone}
                placeholder="Enter 10-digit mobile"
                placeholderTextColor={Colors.disabled}
                keyboardType="phone-pad"
              />
            </View>
          </View>

          {/* Gender Selector */}
          <View style={styles.inputGroup}>
            <Text style={styles.fieldLabel}>Gender</Text>
            <View style={styles.genderRow}>
              {GENDER_OPTIONS.map((g) => {
                const isSelected = gender === g;
                return (
                  <TouchableOpacity
                    key={g}
                    style={[styles.genderChip, isSelected && styles.genderChipSelected]}
                    onPress={() => setGender(g)}>
                    <Text style={[styles.genderChipText, isSelected && styles.genderChipTextSelected]}>
                      {g}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Bio / About */}
          <View style={styles.inputGroup}>
            <View style={styles.labelRow}>
              <Text style={styles.fieldLabel}>Bio / About</Text>
              <Text style={styles.charCount}>{bio.length}/150</Text>
            </View>
            <View style={[styles.inputWrapper, styles.textAreaWrapper]}>
              <TextInput
                style={styles.textArea}
                value={bio}
                onChangeText={(t) => t.length <= 150 && setBio(t)}
                placeholder="Tell us a little about yourself or your services"
                placeholderTextColor={Colors.disabled}
                multiline
                numberOfLines={3}
              />
            </View>
          </View>
        </View>

        {/* Change Password Link */}
        <TouchableOpacity
          style={styles.securityLinkCard}
          onPress={() => navigation.navigate('SecuritySettings')}>
          <View style={styles.securityLeft}>
            <View style={styles.securityIconBox}>
              <Ionicons name="key-outline" size={20} color={Colors.primary} />
            </View>
            <View>
              <Text style={styles.securityTitle}>Change Password</Text>
              <Text style={styles.securitySubtitle}>Manage your login password and 2FA</Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={18} color={Colors.disabled} />
        </TouchableOpacity>
      </ScrollView>

      {/* Avatar Picker Modal */}
      <Modal visible={avatarModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={styles.modalBg}
            onPress={() => setAvatarModalVisible(false)}
            activeOpacity={1}
          />
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Choose Avatar Style</Text>
              <TouchableOpacity onPress={() => setAvatarModalVisible(false)}>
                <Ionicons name="close" size={24} color={Colors.textPrimary} />
              </TouchableOpacity>
            </View>
            <View style={styles.avatarGrid}>
              {AVATAR_OPTIONS.map((item) => {
                const isSelected = selectedAvatar?.id === item.id;
                return (
                  <TouchableOpacity
                    key={item.id}
                    style={[styles.avatarChoice, isSelected && styles.avatarChoiceSelected]}
                    onPress={() => {
                      setSelectedAvatar(item);
                      setAvatarModalVisible(false);
                    }}>
                    <View style={[styles.avatarCircle, { backgroundColor: item.bg }]}>
                      <Ionicons name={item.icon} size={32} color={item.fg} />
                    </View>
                    <Text style={styles.avatarChoiceLabel}>{item.label}</Text>
                    {isSelected && (
                      <Ionicons
                        name="checkmark-circle"
                        size={18}
                        color={Colors.primary}
                        style={styles.selectedCheck}
                      />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
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
  saveBtn: {
    paddingVertical: 7,
    paddingHorizontal: 16,
    borderRadius: Radii.button,
    backgroundColor: '#EFF6FF',
  },
  saveBtnDisabled: {
    opacity: 0.6,
  },
  saveBtnText: {
    ...Typography.bodyBold,
    color: Colors.primary,
    fontSize: 14,
  },
  scrollContent: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },
  avatarSection: {
    alignItems: 'center',
    marginVertical: Spacing.md,
  },
  avatarBadge: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    ...Shadows.subtle,
  },
  cameraIconContainer: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.textPrimary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.white,
  },
  changeAvatarText: {
    ...Typography.bodyBold,
    color: Colors.primary,
    fontSize: 14,
    marginTop: Spacing.sm,
  },
  formCard: {
    backgroundColor: Colors.white,
    borderRadius: Radii.card,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    ...Shadows.subtle,
  },
  inputGroup: {
    marginBottom: Spacing.lg,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  fieldLabel: {
    ...Typography.captionBold,
    color: Colors.textPrimary,
    fontSize: 13,
    marginBottom: 6,
  },
  charCount: {
    ...Typography.caption,
    color: Colors.textSecondary,
    fontSize: 11,
  },
  readOnlyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: Radii.xs,
  },
  readOnlyText: {
    ...Typography.caption,
    fontSize: 10,
    color: Colors.textSecondary,
    fontWeight: '600',
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
  readOnlyInput: {
    backgroundColor: '#F1F5F9',
    borderColor: '#E2E8F0',
  },
  textInput: {
    flex: 1,
    ...Typography.body,
    fontSize: 15,
    color: Colors.textPrimary,
    marginLeft: Spacing.sm,
  },
  readOnlyFieldText: {
    color: Colors.textSecondary,
  },
  helperText: {
    ...Typography.caption,
    color: Colors.textSecondary,
    fontSize: 11,
    marginTop: 4,
  },
  genderRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  genderChip: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: Radii.pill,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  genderChipSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  genderChipText: {
    ...Typography.body,
    fontSize: 13,
    color: Colors.textSecondary,
  },
  genderChipTextSelected: {
    color: Colors.white,
    fontWeight: '600',
  },
  textAreaWrapper: {
    height: 80,
    alignItems: 'flex-start',
    paddingVertical: Spacing.sm,
  },
  textArea: {
    flex: 1,
    ...Typography.body,
    fontSize: 14,
    color: Colors.textPrimary,
    textAlignVertical: 'top',
  },
  securityLinkCard: {
    backgroundColor: Colors.white,
    borderRadius: Radii.card,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    ...Shadows.subtle,
  },
  securityLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  securityIconBox: {
    width: 40,
    height: 40,
    borderRadius: Radii.control,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  securityTitle: {
    ...Typography.bodyBold,
    fontSize: 14,
    color: Colors.textPrimary,
  },
  securitySubtitle: {
    ...Typography.caption,
    color: Colors.textSecondary,
    fontSize: 12,
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
    padding: Spacing.xl,
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
  avatarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  avatarChoice: {
    width: '47%',
    backgroundColor: '#F8FAFC',
    borderRadius: Radii.control,
    padding: Spacing.md,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    position: 'relative',
  },
  avatarChoiceSelected: {
    borderColor: Colors.primary,
    backgroundColor: '#EFF6FF',
  },
  avatarCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  avatarChoiceLabel: {
    ...Typography.captionBold,
    fontSize: 12,
    color: Colors.textPrimary,
  },
  selectedCheck: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
});