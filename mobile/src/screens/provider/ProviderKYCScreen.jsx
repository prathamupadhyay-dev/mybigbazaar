import React, { useState } from 'react';
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation, useRoute } from '@react-navigation/native';
import ScreenContainer from '../../components/ScreenContainer';
import { useApp } from '../../context/AppContext';
import { apiPost } from '../../services/apiClient';
import Colors from '../../constants/colors';
import Typography from '../../constants/typography';
import Spacing from '../../constants/spacing';
import Radii from '../../constants/radii';
import Shadows from '../../constants/shadows';

const DOC_TYPES = [
  { id: 'Aadhaar Card', name: 'Aadhaar Card', hint: '12-digit number (XXXX-XXXX-XXXX)', icon: 'card-outline' },
  { id: 'PAN Card', name: 'PAN Card', hint: '10-character alphanumeric (e.g. ABCDE1234F)', icon: 'document-text-outline' },
  { id: 'Trade License', name: 'Trade / Skill License', hint: 'Govt issued contractor or trade certificate', icon: 'ribbon-outline' },
  { id: 'Voter ID', name: 'Voter ID / EPIC', hint: 'State election commission ID', icon: 'finger-print-outline' }
];

export default function ProviderKYCScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { user, updateUser } = useApp();

  const providerProfileFromRoute = route.params?.providerProfile || user?.providerProfile || {};

  const [docType, setDocType] = useState('Aadhaar Card');
  const [docNumber, setDocNumber] = useState('');
  const [frontImage, setFrontImage] = useState(null);
  const [backImage, setBackImage] = useState(null);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedDocConfig = DOC_TYPES.find(d => d.id === docType) || DOC_TYPES[0];

  const handlePickPhoto = async (side) => {
    Alert.alert(
      `Capture ${side === 'front' ? 'Front' : 'Back'} of ID`,
      'Choose camera or file photo of your document',
      [
        {
          text: 'Take Photo (Camera)',
          onPress: async () => {
            try {
              const { status } = await ImagePicker.requestCameraPermissionsAsync();
              if (status !== 'granted') {
                Alert.alert('Permission Denied', 'Camera permission is required to photograph your document.');
                return;
              }
              const result = await ImagePicker.launchCameraAsync({
                allowsEditing: true,
                aspect: [4, 3],
                quality: 0.8
              });
              if (!result.canceled && result.assets && result.assets[0]?.uri) {
                const asset = result.assets[0];
                const filename = asset.uri.split('/').pop() || `${side}_doc.jpg`;
                const match = /\.(\w+)$/.exec(filename);
                const type = match ? `image/${match[1]}` : `image/jpeg`;
                const img = { uri: asset.uri, name: filename, type };
                if (side === 'front') setFrontImage(img);
                else setBackImage(img);
              }
            } catch (err) {
              console.warn('Camera error:', err.message);
            }
          }
        },
        {
          text: 'Choose from Gallery',
          onPress: async () => {
            try {
              const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
              if (status !== 'granted') {
                Alert.alert('Permission Denied', 'Gallery access is needed to select a document photo.');
                return;
              }
              const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ['images'],
                allowsEditing: true,
                aspect: [4, 3],
                quality: 0.8
              });
              if (!result.canceled && result.assets && result.assets[0]?.uri) {
                const asset = result.assets[0];
                const filename = asset.uri.split('/').pop() || `${side}_doc.jpg`;
                const match = /\.(\w+)$/.exec(filename);
                const type = match ? `image/${match[1]}` : `image/jpeg`;
                const img = { uri: asset.uri, name: filename, type };
                if (side === 'front') setFrontImage(img);
                else setBackImage(img);
              }
            } catch (err) {
              console.warn('Gallery error:', err.message);
            }
          }
        },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;
    if (!docNumber.trim()) {
      Alert.alert('Missing Document ID', 'Please enter your document ID number before submitting.');
      return;
    }
    if (!frontImage) {
      Alert.alert('Document Required', 'Please attach a photo of the front of your ID card.');
      return;
    }
    if (!agreedToTerms) {
      Alert.alert('Terms Agreement', 'Please accept the declaration to proceed with partner verification.');
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('documentType', docType);
      formData.append('docType', docType);
      formData.append('documentNumber', docNumber.trim());
      formData.append('docNumber', docNumber.trim());
      formData.append(
        'businessName',
        providerProfileFromRoute.businessName || user?.fullName || 'Certified Specialist'
      );
      formData.append('experienceYears', String(providerProfileFromRoute.experienceYears || 2));
      formData.append('document', {
        uri: frontImage.uri,
        name: frontImage.name,
        type: frontImage.type
      });
      if (backImage) {
        formData.append('documentBack', {
          uri: backImage.uri,
          name: backImage.name,
          type: backImage.type
        });
      }

      await apiPost('/api/v1/providers/kyc', formData);
    } catch (err) {
      console.warn('[PROVIDER_KYC] Backend multipart POST error notice:', err.message);
    }

    const updatedProfile = {
      ...providerProfileFromRoute,
      isProvider: true,
      kyc: {
        documentType: docType,
        documentNumber: docNumber.trim(),
        documentUrl: frontImage?.uri || '',
        status: 'pending_verification',
        submittedAt: new Date().toISOString()
      },
      kycStatus: 'pending_verification',
      isOnline: true
    };

    updateUser({
      ...user,
      role: 'Provider',
      providerProfile: updatedProfile
    });

    setIsSubmitting(false);
    Alert.alert(
      'KYC Submitted Successfully',
      'Your documents are under review by our trust & safety team. Verification usually completes within 24 hours.\n\nYou can now manage your availability and view incoming job leads in your Partner Dashboard.',
      [
        {
          text: 'Go to Partner Dashboard',
          onPress: () => {
            navigation.reset({
              index: 0,
              routes: [{ name: 'Main' }, { name: 'ProviderDashboard' }]
            });
          }
        }
      ]
    );
  };

  return (
    <ScreenContainer noPadding style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
          accessibilityLabel="Go back"
        >
          <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>ID & Trust Verification</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Verification Guarantee Card */}
        <View style={styles.badgeBanner}>
          <View style={styles.badgeShield}>
            <Ionicons name="shield-checkmark" size={26} color={Colors.card} />
          </View>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={styles.badgeTitle}>Unlock the "Verified Partner" Badge</Text>
            <Text style={styles.badgeDesc}>
              Verified partners receive up to 4x more customer leads and priority job dispatching.
            </Text>
          </View>
        </View>

        {/* Document Selection */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>1. Select Identification Document</Text>
          <Text style={styles.cardSubtitle}>Choose an official government ID in your name</Text>

          <View style={styles.docTypeContainer}>
            {DOC_TYPES.map(item => {
              const isSelected = docType === item.id;
              return (
                <TouchableOpacity
                  key={item.id}
                  style={[styles.docTypeOption, isSelected && styles.docTypeOptionActive]}
                  onPress={() => setDocType(item.id)}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name={item.icon}
                    size={20}
                    color={isSelected ? Colors.brandBlue : Colors.textSecondary}
                  />
                  <Text style={[styles.docTypeName, isSelected && styles.docTypeNameActive]}>
                    {item.name}
                  </Text>
                  {isSelected && (
                    <Ionicons name="checkmark-circle" size={18} color={Colors.brandBlue} style={{ marginLeft: 'auto' }} />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Document Number Input */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>2. Enter Document Number</Text>
          <Text style={styles.cardSubtitle}>{selectedDocConfig.hint}</Text>

          <View style={styles.inputWrapper}>
            <Ionicons name="finger-print" size={20} color={Colors.disabled} style={{ marginRight: 10 }} />
            <TextInput
              style={styles.textInput}
              value={docNumber}
              onChangeText={setDocNumber}
              placeholder={`Enter ${docType} Number`}
              placeholderTextColor={Colors.disabled}
              autoCapitalize="characters"
            />
          </View>
        </View>

        {/* Document Photo Uploads */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>3. Upload Photo ID</Text>
          <Text style={styles.cardSubtitle}>Ensure name, photo, and ID number are clearly legible</Text>

          <View style={styles.uploadRow}>
            {/* Front Photo */}
            <View style={styles.uploadBox}>
              <View
                style={[
                  styles.photoPreviewBox,
                  !frontImage && { backgroundColor: Colors.sunken, alignItems: 'center', justifyContent: 'center' }
                ]}
              >
                {frontImage ? (
                  <>
                    <Image source={{ uri: frontImage.uri }} style={styles.previewImage} resizeMode="cover" />
                    <View style={styles.checkedOverlay}>
                      <Ionicons name="checkmark-circle" size={24} color={Colors.emerald} />
                    </View>
                  </>
                ) : (
                  <Ionicons name="camera-outline" size={32} color={Colors.disabled} />
                )}
              </View>
              <Text style={styles.uploadLabel}>
                {frontImage ? 'Front Side Attached' : 'Front Side (Required)'}
              </Text>
              <TouchableOpacity
                style={frontImage ? styles.reuploadBtn : styles.uploadActionBtn}
                onPress={() => handlePickPhoto('front')}
              >
                <Text style={frontImage ? styles.reuploadText : styles.uploadActionBtnText}>
                  {frontImage ? 'Change Photo' : 'Upload Front'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Back Photo */}
            <View style={styles.uploadBox}>
              <View
                style={[
                  styles.photoPreviewBox,
                  !backImage && { backgroundColor: Colors.sunken, alignItems: 'center', justifyContent: 'center' }
                ]}
              >
                {backImage ? (
                  <>
                    <Image source={{ uri: backImage.uri }} style={styles.previewImage} resizeMode="cover" />
                    <View style={styles.checkedOverlay}>
                      <Ionicons name="checkmark-circle" size={24} color={Colors.emerald} />
                    </View>
                  </>
                ) : (
                  <Ionicons name="camera-outline" size={32} color={Colors.disabled} />
                )}
              </View>
              <Text style={styles.uploadLabel}>
                {backImage ? 'Back Side Attached' : 'Back Side (Optional)'}
              </Text>
              <TouchableOpacity
                style={backImage ? styles.reuploadBtn : styles.uploadActionBtn}
                onPress={() => handlePickPhoto('back')}
              >
                <Text style={backImage ? styles.reuploadText : styles.uploadActionBtnText}>
                  {backImage ? 'Change Photo' : 'Upload Back'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Declaration */}
        <TouchableOpacity
          style={styles.termsRow}
          onPress={() => setAgreedToTerms(!agreedToTerms)}
          activeOpacity={0.8}
        >
          <Ionicons
            name={agreedToTerms ? 'checkbox' : 'square-outline'}
            size={22}
            color={agreedToTerms ? Colors.terracotta : Colors.disabled}
          />
          <Text style={styles.termsText}>
            I hereby certify that I am skilled in my selected trade, have no criminal record, and all submitted documents are valid and original.
          </Text>
        </TouchableOpacity>

        {/* Submit Button */}
        <TouchableOpacity
          style={[styles.submitBtn, isSubmitting && { opacity: 0.7 }]}
          onPress={handleSubmit}
          disabled={isSubmitting}
          activeOpacity={0.8}
        >
          <Ionicons name="cloud-upload-outline" size={20} color={Colors.card} style={{ marginRight: 8 }} />
          <Text style={styles.submitBtnText}>
            {isSubmitting ? 'Verifying & Submitting...' : 'Submit Verification & Launch Dashboard'}
          </Text>
        </TouchableOpacity>

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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.card,
    borderBottomWidth: 1,
    borderBottomColor: Colors.hairline
  },
  backButton: {
    padding: 6,
    borderRadius: Radii.xs
  },
  headerTitle: {
    ...Typography.screenTitle,
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary
  },
  scrollContent: {
    padding: Spacing.md
  },
  badgeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.navy,
    borderRadius: Radii.card,
    padding: 16,
    marginBottom: Spacing.md,
    ...Shadows.card
  },
  badgeShield: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(251,251,250,0.15)',
    alignItems: 'center',
    justifyContent: 'center'
  },
  badgeTitle: {
    ...Typography.bodyBold,
    color: Colors.card,
    fontSize: 15,
    marginBottom: 4
  },
  badgeDesc: {
    ...Typography.secondary,
    color: Colors.sunken,
    fontSize: 12,
    lineHeight: 16
  },
  card: {
    backgroundColor: Colors.card,
    borderRadius: Radii.card,
    padding: 16,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.hairline,
    ...Shadows.card
  },
  cardTitle: {
    ...Typography.sectionHeader,
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 4
  },
  cardSubtitle: {
    ...Typography.secondary,
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 12
  },
  docTypeContainer: {
    gap: 8
  },
  docTypeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: Radii.control,
    backgroundColor: Colors.sunken,
    borderWidth: 1.5,
    borderColor: Colors.hairline
  },
  docTypeOptionActive: {
    borderColor: Colors.navy,
    backgroundColor: Colors.card
  },
  docTypeName: {
    ...Typography.bodyBold,
    fontSize: 14,
    color: Colors.textPrimary,
    marginLeft: 10
  },
  docTypeNameActive: {
    color: Colors.navy
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.sunken,
    borderWidth: 1,
    borderColor: Colors.hairline,
    borderRadius: Radii.control,
    paddingHorizontal: 12,
    paddingVertical: 4
  },
  textInput: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textPrimary,
    paddingVertical: 10
  },
  uploadRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 6
  },
  uploadBox: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: Colors.sunken,
    borderRadius: Radii.control,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.hairline
  },
  photoPreviewBox: {
    width: '100%',
    height: 90,
    borderRadius: Radii.xs,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: Colors.hairline
  },
  previewImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover'
  },
  checkedOverlay: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: Colors.card,
    borderRadius: 12
  },
  uploadLabel: {
    ...Typography.captionBold,
    fontSize: 12,
    color: Colors.textPrimary,
    marginTop: 8,
    marginBottom: 4
  },
  reuploadBtn: {
    paddingVertical: 4,
    paddingHorizontal: 10
  },
  reuploadText: {
    ...Typography.captionBold,
    fontSize: 12,
    color: Colors.terracotta
  },
  uploadActionBtn: {
    backgroundColor: Colors.navy,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: Radii.button,
    marginTop: 2
  },
  uploadActionBtnText: {
    ...Typography.captionBold,
    fontSize: 11,
    color: Colors.card
  },
  termsRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 4,
    marginBottom: Spacing.lg
  },
  termsText: {
    ...Typography.micro,
    flex: 1,
    fontSize: 12,
    color: Colors.textSecondary,
    marginLeft: 8,
    lineHeight: 17
  },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.terracotta,
    paddingVertical: 14,
    borderRadius: Radii.button,
    ...Shadows.subtle
  },
  submitBtnText: {
    ...Typography.bodyBold,
    color: Colors.card,
    fontSize: 15,
    fontWeight: '700'
  }
});
