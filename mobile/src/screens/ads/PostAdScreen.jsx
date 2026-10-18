import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import {
  Alert,
  Image,
  Modal,
  ScrollView,
  StatusBar,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ScreenContainer from '../../components/ScreenContainer';
import { useApp } from '../../context/AppContext';
import { getProductCategoriesApi } from '../../services/categoryApi';
import { createProductApi } from '../../services/productApi';
import { getTaxesApi } from '../../services/taxApi';
import AuthRequiredState from '../../components/common/AuthRequiredState';
import { getSellerFormApi } from '../../services/sellerFormApi';
import {
  CAR_BRANDS_CATALOG,
  CAR_FUEL_OPTIONS,
  CAR_TRANSMISSION_OPTIONS,
  CAR_OWNER_OPTIONS,
  getCascadingCatalogForCategory,
  generateCategorySuggestion,
  generateCarSuggestion
} from '../../constants/carCatalogData';

const CATEGORY_META = {
  cars: { icon: 'car-sport', color: '#DC2626', bg: '#FEE2E2' },
  properties: { icon: 'business', color: '#2563EB', bg: '#EFF6FF' },
  mobiles: { icon: 'phone-portrait', color: '#059669', bg: '#ECFDF5' },
  jobs: { icon: 'briefcase', color: '#D97706', bg: '#FEF3C7' },
  bikes: { icon: 'bicycle', color: '#E11D48', bg: '#FEE2E2' },
  'electronics & appliances': { icon: 'tv', color: '#7C3AED', bg: '#F5F3FF' },
  electronics: { icon: 'tv', color: '#7C3AED', bg: '#F5F3FF' },
  'commercial vehicles & spares': { icon: 'bus', color: '#EA580C', bg: '#FFF7ED' },
  furniture: { icon: 'bed', color: '#16A34A', bg: '#F0FDF4' },
  fashion: { icon: 'shirt', color: '#BE185D', bg: '#FCE7F3' },
  'books, sports & hobbies': { icon: 'football', color: '#0284C7', bg: '#E0F2FE' },
  pets: { icon: 'paw', color: '#B45309', bg: '#FEF3C7' },
  services: { icon: 'construct', color: '#0891B2', bg: '#ECFEFF' }
};

const resolveCategoryMeta = (catName) => {
  const key = (catName || '').toLowerCase().trim();
  return CATEGORY_META[key] || { icon: 'grid-outline', color: '#007AFF', bg: '#F0F7FF' };
};

// Default fallback categories (including Cars first)
const OLX_CATEGORIES = [
  { id: 'Cars', title: 'Cars', icon: 'car-sport', color: '#DC2626', bg: '#FEE2E2', directForm: true },
  { id: 'Properties', title: 'Properties', icon: 'business', color: '#2563EB', bg: '#EFF6FF', directForm: true },
  { id: 'Mobiles', title: 'Mobiles', icon: 'phone-portrait', color: '#059669', bg: '#ECFDF5', directForm: true },
  { id: 'Jobs', title: 'Jobs', icon: 'briefcase', color: '#D97706', bg: '#FEF3C7', directForm: true },
  { id: 'Bikes', title: 'Bikes', icon: 'bicycle', color: '#E11D48', bg: '#FEE2E2', directForm: true },
  { id: 'Electronics & Appliances', title: 'Electronics & Appliances', icon: 'tv', color: '#7C3AED', bg: '#F5F3FF', directForm: true },
  { id: 'Commercial Vehicles & Spares', title: 'Commercial Vehicles & Spares', icon: 'bus', color: '#EA580C', bg: '#FFF7ED', directForm: true },
  { id: 'Furniture', title: 'Furniture', icon: 'bed', color: '#16A34A', bg: '#F0FDF4', directForm: true },
  { id: 'Fashion', title: 'Fashion', icon: 'shirt', color: '#BE185D', bg: '#FCE7F3', directForm: true },
  { id: 'Books, Sports & Hobbies', title: 'Books, Sports & Hobbies', icon: 'football', color: '#0284C7', bg: '#E0F2FE', directForm: true },
  { id: 'Pets', title: 'Pets', icon: 'paw', color: '#B45309', bg: '#FEF3C7', directForm: true },
  { id: 'Services', title: 'Services', icon: 'construct', color: '#0891B2', bg: '#ECFEFF', directForm: true }
];

const POPULAR_LOCATIONS = [
  { locality: 'Sangam Nagar', city: 'Indore', state: 'Madhya Pradesh' },
  { locality: 'Vijay Nagar', city: 'Indore', state: 'Madhya Pradesh' },
  { locality: 'Palasia', city: 'Indore', state: 'Madhya Pradesh' },
  { locality: 'Bhawarkua', city: 'Indore', state: 'Madhya Pradesh' },
  { locality: 'Super Corridor', city: 'Indore', state: 'Madhya Pradesh' },
  { locality: 'Rajwada', city: 'Indore', state: 'Madhya Pradesh' }
];

export default function PostAdScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const insets = useSafeAreaInsets();
  const { addAd, user, isAuthenticated, currentLocation, currencySymbol } = useApp();

  // Wizard Navigation Flow:
  // 'CATEGORIES' -> 'DETAILS' -> 'PHOTOS' -> 'PRICE' -> 'LOCATION' -> 'REVIEW'
  const [currentView, setCurrentView] = useState('CATEGORIES');

  // Selected Category
  const [selectedCategory, setSelectedCategory] = useState('');

  // Reset wizard to CATEGORIES whenever screen is focused fresh or revisited after blur
  const wasBlurredRef = useRef(false);
  const lastResetParam = useRef(null);

  useFocusEffect(
    useCallback(() => {
      const resetParam = route?.params?.resetToCategories;
      if (wasBlurredRef.current || (resetParam && resetParam !== lastResetParam.current)) {
        setCurrentView('CATEGORIES');
        setSelectedCategory('');
        if (resetParam) lastResetParam.current = resetParam;
      }
      wasBlurredRef.current = false;

      return () => {
        wasBlurredRef.current = true;
      };
    }, [route?.params?.resetToCategories])
  );

  // Dynamic Seller Form state
  const [activeSellerForm, setActiveSellerForm] = useState(null);
  const [dynamicValues, setDynamicValues] = useState({});
  const [activeSelectModalField, setActiveSelectModalField] = useState(null);

  // Cascading Brand -> Model -> Variant state (for Cars)
  const [brandModalOpen, setBrandModalOpen] = useState(false);
  const [brandStep, setBrandStep] = useState('BRAND'); // 'BRAND' | 'MODEL' | 'VARIANT'
  const [brandSearchQuery, setBrandSearchQuery] = useState('');
  const [selectedCarBrand, setSelectedCarBrand] = useState('');
  const [selectedCarModel, setSelectedCarModel] = useState('');
  const [selectedCarVariant, setSelectedCarVariant] = useState('');

  // AI / Suggested Title & Description state
  const [hasUsedSuggestion, setHasUsedSuggestion] = useState(false);
  const [suggestionVariantIdx, setSuggestionVariantIdx] = useState(0);

  // Common Ad Fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [condition, setCondition] = useState('Excellent');

  // Photos (Step 3)
  const [images, setImages] = useState([]);

  // Price (Step 4)
  const [price, setPrice] = useState('');
  const [isNegotiable, setIsNegotiable] = useState(true);

  // Location (Step 5)
  const [city, setCity] = useState(currentLocation?.city || 'Indore');
  const [stateName, setStateName] = useState(currentLocation?.state || 'Madhya Pradesh');
  const [locality, setLocality] = useState(
    currentLocation?.address ? currentLocation.address.split(',')[0] : 'Sangam Nagar'
  );

  // Review Your Details (Step 6: Profile Picture, Account Name, Verified Phone Number)
  const [accountName, setAccountName] = useState(
    user?.fullName || user?.name || 'BigBazaar User'
  );
  const [accountAvatar, setAccountAvatar] = useState(
    user?.avatarUrl || user?.profileImage || null
  );
  const [phone, setPhone] = useState(
    user?.mobileNumber || user?.phoneNumber || user?.phone || '+91 9876543210'
  );

  // Sync user details when user changes
  useEffect(() => {
    if (user) {
      if (user.fullName || user.name) setAccountName(user.fullName || user.name);
      if (user.avatarUrl || user.profileImage) setAccountAvatar(user.avatarUrl || user.profileImage);
      if (user.mobileNumber || user.phoneNumber || user.phone) {
        setPhone(user.mobileNumber || user.phoneNumber || user.phone);
      }
    }
  }, [user]);

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successModalVisible, setSuccessModalVisible] = useState(false);
  const [submittedAd, setSubmittedAd] = useState(null);

  // Live Backend Category & Tax state
  const [liveCategories, setLiveCategories] = useState([]);
  const [liveTaxes, setLiveTaxes] = useState([]);

  const displayCategories = useMemo(() => {
    if (liveCategories && liveCategories.length > 0) {
      const activeList = liveCategories
        .filter((c) => c.isActive !== false && c.status !== 'Inactive')
        .map((c) => {
          const meta = resolveCategoryMeta(c.name || c.title);
          return {
            id: c.name || c.title,
            _id: c._id,
            title: c.name || c.title,
            slug: c.slug,
            icon: c.icon && !c.icon.startsWith('http') && !c.icon.startsWith('/') ? c.icon : meta.icon,
            color: meta.color,
            bg: meta.bg,
            rawCategory: c
          };
        });
      // Ensure Cars is available if not explicitly deactivated
      const hasCarsInRaw = liveCategories.some(
        (c) => (c.name || c.title || '').toLowerCase() === 'cars'
      );
      if (!hasCarsInRaw) {
        return [OLX_CATEGORIES[0], ...activeList];
      }
      return activeList;
    }
    return OLX_CATEGORIES;
  }, [liveCategories]);

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      try {
        const [cats, taxes] = await Promise.all([
          getProductCategoriesApi().catch(() => []),
          getTaxesApi().catch(() => [])
        ]);
        if (isMounted) {
          if (Array.isArray(cats) && cats.length > 0) setLiveCategories(cats);
          if (Array.isArray(taxes) && taxes.length > 0) setLiveTaxes(taxes);
        }
      } catch (e) {
        // Safe fallback
      }
    }
    loadData();
    return () => {
      isMounted = false;
    };
  }, []);

  // Fetch dynamic seller form schema when category changes
  useEffect(() => {
    let isMounted = true;
    async function loadFormSchema() {
      if (!selectedCategory) {
        if (isMounted) {
          setActiveSellerForm(null);
          setDynamicValues({});
        }
        return;
      }
      try {
        const schema = await getSellerFormApi(selectedCategory);
        if (isMounted) {
          setActiveSellerForm(schema);
          if (schema && Array.isArray(schema.fields) && schema.fields.length > 0) {
            setDynamicValues((prev) => {
              const next = { ...prev };
              schema.fields.forEach((f) => {
                if (next[f.key] === undefined) {
                  next[f.key] = '';
                }
              });
              return next;
            });
          }
        }
      } catch (err) {
        if (isMounted) setActiveSellerForm(null);
      }
    }
    loadFormSchema();
    return () => {
      isMounted = false;
    };
  }, [selectedCategory]);

  const handleSaveDraft = async () => {
    try {
      const draft = {
        selectedCategory,
        dynamicValues,
        selectedCarBrand,
        selectedCarModel,
        selectedCarVariant,
        title,
        description,
        price,
        isNegotiable,
        images,
        city,
        stateName,
        locality,
        phone,
        accountName,
        currentView,
        savedAt: new Date().toISOString()
      };
      await AsyncStorage.setItem('@saved_ad_draft', JSON.stringify(draft));
      Alert.alert('Draft Saved', 'Your listing draft has been saved. You can resume anytime.');
    } catch (e) {
      Alert.alert('Error', 'Failed to save draft.');
    }
  };

  const handleCategoryPress = (categoryObj) => {
    const catTitle = categoryObj.title || categoryObj.name || categoryObj.id;
    setSelectedCategory(catTitle);
    setDynamicValues({});
    setSelectedCarBrand('');
    setSelectedCarModel('');
    setSelectedCarVariant('');
    setHasUsedSuggestion(false);
    setCurrentView('DETAILS');
  };

  // Back Navigation Logic following the exact sequence:
  // CATEGORIES -> DETAILS -> PHOTOS -> PRICE -> LOCATION -> REVIEW
  const handleBackPress = () => {
    const exitToPreviousOrHome = () => {
      if (navigation.canGoBack()) {
        navigation.goBack();
      } else {
        navigation.navigate('Home');
      }
    };

    if (currentView === 'CATEGORIES') {
      exitToPreviousOrHome();
    } else if (currentView === 'DETAILS') {
      setCurrentView('CATEGORIES');
      setSelectedCategory('');
    } else if (currentView === 'PHOTOS') {
      setCurrentView('DETAILS');
    } else if (currentView === 'PRICE') {
      setCurrentView('PHOTOS');
    } else if (currentView === 'LOCATION') {
      setCurrentView('PRICE');
    } else if (currentView === 'REVIEW') {
      setCurrentView('LOCATION');
    }
  };

  // Handle "Write for me" / "Rephrase" button for ALL 11 categories
  const handleWriteOrRephrase = () => {
    const nextIdx = hasUsedSuggestion ? suggestionVariantIdx + 1 : 0;
    const suggestion = generateCategorySuggestion(
      selectedCategory,
      {
        ...dynamicValues,
        brandName: selectedCarBrand || dynamicValues.brandName || '',
        model: selectedCarModel || dynamicValues.model || '',
        variant: selectedCarVariant || dynamicValues.variant || ''
      },
      nextIdx
    );
    setTitle(suggestion.title);
    setDescription(suggestion.description);
    setHasUsedSuggestion(true);
    setSuggestionVariantIdx(nextIdx);
  };

  // Step 2: Details Validation
  const validateDetailsStep = () => {
    const isCarCategory = selectedCategory.toLowerCase() === 'cars';
    const currentYear = new Date().getFullYear();

    // Check Year minimum value 1900 for Cars / Vehicles
    if (dynamicValues.year !== undefined && String(dynamicValues.year).trim() !== '') {
      const numYear = Number(dynamicValues.year);
      if (isNaN(numYear) || numYear < 1900) {
        Alert.alert('Invalid Year', 'Year has a minimum value of 1900.');
        return false;
      }
      if (numYear > currentYear + 1) {
        Alert.alert('Invalid Year', `Year cannot exceed ${currentYear + 1}.`);
        return false;
      }
    }

    if (activeSellerForm && Array.isArray(activeSellerForm.fields) && activeSellerForm.fields.length > 0) {
      for (const field of activeSellerForm.fields) {
        if (field.required) {
          const val = dynamicValues[field.key];
          if (val === undefined || val === null || String(val).trim() === '') {
            Alert.alert(`${field.label} Required`, `Please fill in required field: ${field.label}.`);
            return false;
          }
        }
        if (field.minValue && dynamicValues[field.key]) {
          const numVal = Number(dynamicValues[field.key]);
          if (numVal < Number(field.minValue)) {
            Alert.alert(
              `Invalid ${field.label}`,
              `${field.label} has a minimum value of ${field.minValue}.`
            );
            return false;
          }
        }
      }
    } else if (isCarCategory) {
      if (!dynamicValues.brand) {
        Alert.alert('Brand Required', 'Please select Brand / Model / Variant.');
        return false;
      }
      if (!dynamicValues.year || Number(dynamicValues.year) < 1900) {
        Alert.alert('Year Required', 'Year has a minimum value of 1900.');
        return false;
      }
    }

    if (title.trim().length < 3) {
      Alert.alert('Ad Title Required', 'Please enter an ad title.');
      return false;
    }
    if (description.trim().length < 5) {
      Alert.alert('Description Required', 'Please describe what you are selling.');
      return false;
    }
    return true;
  };

  // Step 3: Photos Validation
  const validatePhotosStep = () => {
    if (images.length === 0) {
      Alert.alert('Upload Photos', 'Please upload at least 1 photo to continue.', [
        { text: 'Add Photos', onPress: handleAddPhoto }
      ]);
      return false;
    }
    return true;
  };

  // Step 4: Price Validation
  const validatePriceStep = () => {
    const cleanPrice = Number(price.replace(/[^0-9]/g, ''));
    if (!cleanPrice || cleanPrice <= 0) {
      Alert.alert('Price Required', `Please enter a valid selling price in ${currencySymbol}.`);
      return false;
    }
    return true;
  };

  // Step 5: Location Validation
  const validateLocationStep = () => {
    if (!city.trim() || !locality.trim()) {
      Alert.alert('Location Required', 'Please enter or select your locality and city.');
      return false;
    }
    return true;
  };

  // Photo Pickers (Multiple selection supported)
  const handleAddPhoto = () => {
    if (images.length >= 20) {
      Alert.alert('Limit Reached', 'You can upload up to 20 photos.');
      return;
    }
    Alert.alert('Upload Photos', 'Choose an option to upload photos of your listing', [
      {
        text: 'Take Photo (Camera)',
        onPress: async () => {
          try {
            const { status } = await ImagePicker.requestCameraPermissionsAsync();
            if (status !== 'granted') {
              Alert.alert('Permission Denied', 'Camera permission is required.');
              return;
            }
            const res = await ImagePicker.launchCameraAsync({
              allowsEditing: true,
              aspect: [4, 3],
              quality: 0.85
            });
            if (!res.canceled && res.assets && res.assets.length > 0) {
              setImages((prev) => [...prev, res.assets[0].uri]);
            }
          } catch (err) {
            console.warn('Camera error:', err.message);
          }
        }
      },
      {
        text: 'Choose Multiple from Gallery',
        onPress: async () => {
          try {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
              Alert.alert('Permission Denied', 'Gallery access is needed.');
              return;
            }
            const res = await ImagePicker.launchImageLibraryAsync({
              mediaTypes: ['images'],
              allowsMultipleSelection: true,
              selectionLimit: 20 - images.length,
              quality: 0.85
            });
            if (!res.canceled && res.assets && res.assets.length > 0) {
              const newUris = res.assets.map((a) => a.uri);
              setImages((prev) => [...prev, ...newUris].slice(0, 20));
            }
          } catch (err) {
            console.warn('Gallery error:', err.message);
          }
        }
      },
      { text: 'Cancel', style: 'cancel' }
    ]);
  };

  const handlePickProfileAvatar = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') return;
      const res = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8
      });
      if (!res.canceled && res.assets && res.assets.length > 0) {
        setAccountAvatar(res.assets[0].uri);
      }
    } catch (e) {
      // ignore
    }
  };

  const handleRemovePhoto = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSetCoverPhoto = (index) => {
    if (index === 0) return;
    setImages((prev) => {
      const selected = prev[index];
      const rest = prev.filter((_, i) => i !== index);
      return [selected, ...rest];
    });
  };

  // Final Submit on Step 6 (Review your details)
  const handlePostAd = async () => {
    if (isSubmitting) return;
    if (!accountName.trim()) {
      Alert.alert('Name Required', 'Please enter your account name.');
      return;
    }
    setIsSubmitting(true);
    const cleanPrice = Number(price.replace(/[^0-9]/g, '')) || 0;
    const adId = `ad-${Date.now()}`;

    const matchedCategory = liveCategories.find(
      (c) => (c.name || c.title || '').toLowerCase() === selectedCategory.toLowerCase()
    );
    const categoryId = matchedCategory?._id || liveCategories[0]?._id;
    const taxId = liveTaxes.length > 0 ? liveTaxes[0]._id : '6abb95bd4ee367c57de4d2ae';
    const authId = user?._id || user?.id || '6ab4b4b5edf8105cdd7cd93f';

    const combinedAttributes = {
      ...dynamicValues,
      ...(selectedCarBrand ? { brandName: selectedCarBrand } : {}),
      ...(selectedCarModel ? { model: selectedCarModel } : {}),
      ...(selectedCarVariant ? { variant: selectedCarVariant } : {})
    };

    let backendProduct = null;
    try {
      backendProduct = await createProductApi({
        productName: title.trim(),
        title: title.trim(),
        productDescription: description.trim(),
        description: description.trim(),
        productPrice: cleanPrice,
        productDiscountPrice: cleanPrice,
        taxId,
        authId,
        sellerName: accountName.trim(),
        sellerPhone: phone.trim(),
        category: selectedCategory,
        condition,
        city: city.trim(),
        state: stateName.trim(),
        address: locality.trim(),
        attributes: combinedAttributes,
        productCategorysId: categoryId ? [categoryId] : [],
        status: 'active',
        images
      });
    } catch (err) {
      console.warn('[POST_AD] Backend API notice:', err.message);
    }

    const createdId = backendProduct?.data?._id || backendProduct?._id || adId;
    const newAd = {
      id: createdId,
      adNumber: `${Math.floor(1000000000 + Math.random() * 900000000)}`,
      title: title.trim(),
      description: description.trim(),
      price: cleanPrice,
      isNegotiable,
      category: selectedCategory,
      attributes: combinedAttributes,
      specifications: combinedAttributes,
      customFields: combinedAttributes,
      brand: selectedCarBrand || dynamicValues.brandName || dynamicValues.brand || '',
      model: selectedCarModel || dynamicValues.model || '',
      variant: selectedCarVariant || dynamicValues.variant || '',
      brandModelVariant: dynamicValues.brand || '',
      year: dynamicValues.year || '',
      fuel: dynamicValues.fuel || '',
      transmission: dynamicValues.transmission || '',
      kmDriven: dynamicValues.kmDriven || '',
      owners: dynamicValues.owners || '',
      condition,
      images,
      imageUrl: images[0] || null,
      location: `${locality.trim()}, ${city.trim()}`,
      city: city.trim(),
      state: stateName.trim(),
      locality: locality.trim(),
      phone: phone.trim(),
      status: 'Active',
      createdAt: new Date().toISOString(),
      views: 0,
      sellerName: accountName.trim(),
      sellerAvatar: accountAvatar,
      sellerPhoneVerified: true,
      taxId
    };

    addAd(newAd);
    await AsyncStorage.removeItem('@saved_ad_draft').catch(() => {});
    setSubmittedAd(newAd);
    setIsSubmitting(false);
    setSuccessModalVisible(true);
  };

  const handleFinishSuccess = () => {
    setSuccessModalVisible(false);
    if (submittedAd) {
      navigation.navigate('ProductDetails', { product: submittedAd });
    } else {
      navigation.navigate('MyAds');
    }
  };

  // Cascading Brand -> Model -> Variant helper lists (supports Cars, Bikes, Mobiles)
  const activeCascadingCatalog = useMemo(() => {
    return getCascadingCatalogForCategory(selectedCategory);
  }, [selectedCategory]);

  const filteredCarBrands = useMemo(() => {
    if (!brandSearchQuery.trim()) return activeCascadingCatalog;
    const q = brandSearchQuery.toLowerCase().trim();
    return activeCascadingCatalog.filter(
      (b) =>
        b.brand.toLowerCase().includes(q) ||
        b.models.some((m) => m.model.toLowerCase().includes(q))
    );
  }, [brandSearchQuery, activeCascadingCatalog]);

  const currentBrandObj = useMemo(() => {
    return activeCascadingCatalog.find((b) => b.brand === selectedCarBrand) || null;
  }, [selectedCarBrand, activeCascadingCatalog]);

  const currentModelObj = useMemo(() => {
    if (!currentBrandObj) return null;
    return currentBrandObj.models.find((m) => m.model === selectedCarModel) || null;
  }, [currentBrandObj, selectedCarModel]);

  // Year error check (Year has a minimum value of 1900.)
  const yearValStr = String(dynamicValues.year || '');
  const isYearInvalid =
    yearValStr.length > 0 && (isNaN(Number(yearValStr)) || Number(yearValStr) < 1900);

  // If unauthenticated, gate cleanly
  if (!isAuthenticated || !user) {
    return (
      <ScreenContainer noPadding style={styles.screen}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#002F34" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Sell</Text>
          <View style={{ width: 24 }} />
        </View>
        <AuthRequiredState
          title="Login to Sell on MyBigBazaar"
          message="Post verified ads, upload photos, and connect instantly with genuine buyers across India."
        />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer noPadding style={styles.screen}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* ======================================================== */}
      {/* STEP 1: CATEGORIES GRID                                  */}
      {/* ======================================================== */}
      {currentView === 'CATEGORIES' && (
        <View style={styles.fullFlex}>
          <View style={styles.header}>
            <TouchableOpacity onPress={handleBackPress} style={styles.backButton} accessibilityLabel="Back">
              <Ionicons name="arrow-back" size={24} color="#002F34" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>What are you offering?</Text>
            <View style={{ width: 36 }} />
          </View>

          <ScrollView contentContainerStyle={styles.categoriesGridScroll} showsVerticalScrollIndicator={false}>
            <View style={styles.gridContainer}>
              {displayCategories.map((cat, index) => {
                const isLeftColumn = index % 2 === 0;
                return (
                  <TouchableOpacity
                    key={cat.id}
                    style={[
                      styles.gridItem,
                      isLeftColumn && styles.gridItemLeft,
                      styles.gridItemBottom
                    ]}
                    onPress={() => handleCategoryPress(cat)}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.catIconCircle, { backgroundColor: cat.bg }]}>
                      <Ionicons name={cat.icon} size={32} color={cat.color} />
                    </View>
                    <Text style={styles.catGridTitle} numberOfLines={2}>
                      {cat.title}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>
        </View>
      )}

      {/* ======================================================== */}
      {/* STEP 2: INCLUDE SOME DETAILS (Exact OLX Cars Form)       */}
      {/* ======================================================== */}
      {currentView === 'DETAILS' && (
        <View style={styles.fullFlex}>
          {/* Header */}
          <View style={styles.headerLeftAligned}>
            <TouchableOpacity onPress={handleBackPress} style={styles.backButton} accessibilityLabel="Back">
              <Ionicons name="arrow-back" size={24} color="#002F34" />
            </TouchableOpacity>
            <Text style={styles.headerTitleLeft}>Include some details</Text>
          </View>

          <ScrollView
            contentContainerStyle={[styles.formScroll, { paddingBottom: insets.bottom + 100 }]}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* Category Title & Subtitle (Exact to Screenshot: Bold "Cars" + sub "Cars") */}
            <View style={styles.categoryHeaderContainer}>
              <Text style={styles.categoryHeaderBold}>{selectedCategory}</Text>
              <Text style={styles.subcategoryHeaderSub}>{selectedCategory}</Text>
            </View>

            {/* Dynamic Seller Form Fields */}
            {activeSellerForm && Array.isArray(activeSellerForm.fields) && activeSellerForm.fields.length > 0 ? (
              activeSellerForm.fields.map((field) => {
                const val = dynamicValues[field.key] !== undefined ? dynamicValues[field.key] : '';
                const isRequired = Boolean(field.required);
                const isBrandCascade =
                  field.type === 'brand_model_variant' ||
                  (selectedCategory.toLowerCase() === 'cars' && field.key === 'brand');

                // 1. Cascading Brand -> Model -> Variant Selector
                if (isBrandCascade) {
                  const hasSelection = Boolean(val && String(val).trim().length > 0);
                  return (
                    <View key={field.id || field.key} style={styles.fieldBlock}>
                      {hasSelection && (
                        <Text style={styles.floatingSmallLabel}>Brand / Model / Variant</Text>
                      )}
                      <TouchableOpacity
                        style={styles.underlineSelectField}
                        onPress={() => {
                          setBrandStep('BRAND');
                          setBrandSearchQuery('');
                          setBrandModalOpen(true);
                        }}
                        activeOpacity={0.7}
                      >
                        <Text
                          style={[
                            styles.underlineSelectText,
                            !hasSelection && styles.underlinePlaceholderText
                          ]}
                          numberOfLines={1}
                        >
                          {hasSelection ? val : `${field.label || 'Brand'} ${isRequired ? '*' : ''}`}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  );
                }

                // 2. Segmented Button Group (e.g. Transmission: [Automatic] [Manual])
                if (field.type === 'segmented') {
                  return (
                    <View key={field.id || field.key} style={styles.fieldBlock}>
                      <Text style={styles.transmissionTitle}>
                        {field.label} {isRequired && '*'}
                      </Text>
                      <View style={styles.segmentedRow}>
                        {(field.options || CAR_TRANSMISSION_OPTIONS).map((opt) => {
                          const isSelected = String(val).trim() === String(opt).trim();
                          return (
                            <TouchableOpacity
                              key={opt}
                              style={[styles.segmentBox, isSelected && styles.segmentBoxActive]}
                              onPress={() => setDynamicValues((prev) => ({ ...prev, [field.key]: opt }))}
                              activeOpacity={0.8}
                            >
                              <Text style={[styles.segmentBoxText, isSelected && styles.segmentBoxTextActive]}>
                                {opt}
                              </Text>
                            </TouchableOpacity>
                          );
                        })}
                      </View>
                    </View>
                  );
                }

                // 3. Select Popup Dialog (e.g. Fuel, No. of Owners)
                if (field.type === 'select') {
                  const hasVal = Boolean(val && String(val).trim().length > 0);
                  return (
                    <View key={field.id || field.key} style={styles.fieldBlock}>
                      {hasVal && (
                        <Text style={styles.floatingSmallLabel}>
                          {field.label}
                        </Text>
                      )}
                      <TouchableOpacity
                        style={styles.underlineSelectField}
                        onPress={() => setActiveSelectModalField(field)}
                        activeOpacity={0.7}
                      >
                        <Text
                          style={[
                            styles.underlineSelectText,
                            !hasVal && styles.underlinePlaceholderText
                          ]}
                        >
                          {hasVal ? val : `${field.label} ${isRequired ? '*' : ''}`}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  );
                }

                // 4. Number Input (e.g. Year * with min 1900 validation, KM driven * with 0/6 counter)
                if (field.type === 'number') {
                  const isYearField = field.key === 'year';
                  const hasCounter = Boolean(field.maxLength) && !isYearField;
                  const showRedError = isYearField && isYearInvalid;
                  const hasText = String(val).length > 0;

                  return (
                    <View key={field.id || field.key} style={styles.fieldBlock}>
                      {hasText && (
                        <Text
                          style={[
                            styles.floatingSmallLabel,
                            showRedError && { color: '#DC2626' }
                          ]}
                        >
                          {field.label} {isRequired ? '*' : ''}
                        </Text>
                      )}
                      <TextInput
                        value={String(val)}
                        onChangeText={(text) => {
                          const cleaned = text.replace(/[^0-9]/g, '');
                          const capped = field.maxLength ? cleaned.slice(0, field.maxLength) : cleaned;
                          setDynamicValues((prev) => ({ ...prev, [field.key]: capped }));
                        }}
                        keyboardType="numeric"
                        placeholder={`${field.label} ${isRequired ? '*' : ''}`}
                        placeholderTextColor="#64748B"
                        style={[
                          styles.underlineInput,
                          showRedError && { borderBottomColor: '#DC2626' }
                        ]}
                      />
                      {showRedError && (
                        <Text style={styles.yearErrorText}>
                          Year has a minimum value of 1900.
                        </Text>
                      )}
                      {hasCounter && (
                        <View style={styles.counterRightRow}>
                          <Text style={styles.counterText}>
                            {String(val).length}/{field.maxLength}
                          </Text>
                        </View>
                      )}
                    </View>
                  );
                }

                // 5. Default Text Input
                const hasText = String(val).length > 0;
                return (
                  <View key={field.id || field.key} style={styles.fieldBlock}>
                    {hasText && (
                      <Text style={styles.floatingSmallLabel}>
                        {field.label} {isRequired ? '*' : ''}
                      </Text>
                    )}
                    <TextInput
                      value={String(val)}
                      onChangeText={(text) => {
                        const capped = field.maxLength ? text.slice(0, field.maxLength) : text;
                        setDynamicValues((prev) => ({ ...prev, [field.key]: capped }));
                      }}
                      placeholder={`${field.label} ${isRequired ? '*' : ''}`}
                      placeholderTextColor="#64748B"
                      style={styles.underlineInput}
                    />
                    {Boolean(field.maxLength) && (
                      <View style={styles.counterRightRow}>
                        <Text style={styles.counterText}>
                          {String(val).length}/{field.maxLength}
                        </Text>
                      </View>
                    )}
                  </View>
                );
              })
            ) : null}

            {/* ============================================================== */}
            {/* SUGGESTED / WRITE FOR ME CARD (Ad title* & Description*)       */}
            {/* Matches media_1791717204086.png & media_1791717235139.png      */}
            {/* ============================================================== */}
            <View style={styles.suggestedContainer}>
              <View style={styles.suggestedTopRow}>
                {hasUsedSuggestion ? (
                  <View style={styles.olxSuggestedBadge}>
                    <Ionicons name="sparkles" size={13} color="#9333EA" />
                    <Text style={styles.olxSuggestedBadgeText}>Suggested</Text>
                  </View>
                ) : (
                  <View />
                )}

                <TouchableOpacity
                  style={styles.writeForMeButton}
                  onPress={handleWriteOrRephrase}
                  activeOpacity={0.8}
                >
                  <Ionicons name="refresh" size={15} color="#7C3AED" />
                  <Text style={styles.writeForMeButtonText}>
                    {hasUsedSuggestion ? 'Rephrase' : 'Write for me'}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Ad title* */}
              <View style={styles.fieldBlockInCard}>
                {title.length > 0 && (
                  <Text style={styles.floatingSmallLabel}>Ad title*</Text>
                )}
                <TextInput
                  value={title}
                  onChangeText={setTitle}
                  maxLength={70}
                  placeholder="Ad title*"
                  placeholderTextColor="#002F34"
                  style={styles.underlineInputCard}
                />
                <View style={styles.helperRow}>
                  <Text style={styles.helperText}>
                    {title.length === 0
                      ? 'Mention the key features of your item (e.g. brand, model, age, type)'
                      : ''}
                  </Text>
                  <Text style={styles.counterText}>{title.length}/70</Text>
                </View>
              </View>

              {/* Describe what you are selling * */}
              <View style={[styles.fieldBlockInCard, { marginBottom: 4 }]}>
                {description.length > 0 && (
                  <Text style={[styles.floatingSmallLabel, { color: '#004896' }]}>
                    Describe what you are selling *
                  </Text>
                )}
                <TextInput
                  value={description}
                  onChangeText={setDescription}
                  maxLength={4096}
                  multiline
                  placeholder="Describe what you are selling *"
                  placeholderTextColor="#002F34"
                  style={styles.multilineUnderlineInput}
                />
                <View style={styles.helperRow}>
                  <Text style={styles.helperText}>
                    {description.length === 0
                      ? 'Include condition, features and reason for selling'
                      : ''}
                  </Text>
                  <Text style={styles.counterText}>{description.length}/4096</Text>
                </View>
              </View>
            </View>

            {/* Required fields note */}
            <Text style={styles.requiredNotice}>* Required Fields</Text>
          </ScrollView>

          {/* Sticky Bottom Next Button -> Goes to PHOTOS */}
          <View style={[styles.bottomStickyBar, { paddingBottom: Math.max(insets.bottom, 16) }]}>
            <TouchableOpacity
              style={styles.primaryActionButton}
              onPress={() => {
                if (validateDetailsStep()) {
                  setCurrentView('PHOTOS');
                }
              }}
              activeOpacity={0.85}
            >
              <Text style={styles.primaryActionButtonText}>Next</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* ======================================================== */}
      {/* STEP 3: UPLOAD PHOTOS (Multiple Photos Upload)           */}
      {/* ======================================================== */}
      {currentView === 'PHOTOS' && (
        <View style={styles.fullFlex}>
          <View style={styles.headerLeftAligned}>
            <TouchableOpacity onPress={handleBackPress} style={styles.backButton} accessibilityLabel="Back">
              <Ionicons name="arrow-back" size={24} color="#002F34" />
            </TouchableOpacity>
            <Text style={styles.headerTitleLeft}>Upload your photos</Text>
          </View>

          <ScrollView
            contentContainerStyle={[styles.formScroll, { paddingBottom: insets.bottom + 100 }]}
            showsVerticalScrollIndicator={false}
          >
            <Text style={styles.photosHintText}>
              Upload multiple photos of your {selectedCategory.toLowerCase() || 'item'}. You can select up to 20 photos at once from your gallery or take photos with your camera.
            </Text>

            <View style={styles.photosGrid}>
              {images.map((uri, idx) => (
                <View key={idx} style={styles.photoSlot}>
                  <Image source={{ uri }} style={styles.photoImage} />
                  {idx === 0 && (
                    <View style={styles.coverBadge}>
                      <Text style={styles.coverBadgeText}>COVER</Text>
                    </View>
                  )}
                  <TouchableOpacity style={styles.deletePhotoBtn} onPress={() => handleRemovePhoto(idx)}>
                    <Ionicons name="close" size={16} color="#FFFFFF" />
                  </TouchableOpacity>
                  {idx !== 0 && (
                    <TouchableOpacity style={styles.setCoverBtn} onPress={() => handleSetCoverPhoto(idx)}>
                      <Text style={styles.setCoverText}>Cover</Text>
                    </TouchableOpacity>
                  )}
                </View>
              ))}

              {images.length < 20 && (
                <TouchableOpacity style={styles.addPhotoCard} onPress={handleAddPhoto} activeOpacity={0.7}>
                  <Ionicons name="camera-outline" size={34} color="#002F34" />
                  <Text style={styles.addPhotoTitle}>Add photos</Text>
                  <Text style={styles.addPhotoCounter}>{images.length}/20</Text>
                </TouchableOpacity>
              )}
            </View>
          </ScrollView>

          {/* Sticky Bottom Next Button -> Goes to PRICE */}
          <View style={[styles.bottomStickyBar, { paddingBottom: Math.max(insets.bottom, 16) }]}>
            <TouchableOpacity
              style={styles.primaryActionButton}
              onPress={() => {
                if (validatePhotosStep()) {
                  setCurrentView('PRICE');
                }
              }}
              activeOpacity={0.85}
            >
              <Text style={styles.primaryActionButtonText}>Next</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* ======================================================== */}
      {/* STEP 4: SET A PRICE                                      */}
      {/* ======================================================== */}
      {currentView === 'PRICE' && (
        <View style={styles.fullFlex}>
          <View style={styles.headerLeftAligned}>
            <TouchableOpacity onPress={handleBackPress} style={styles.backButton} accessibilityLabel="Back">
              <Ionicons name="arrow-back" size={24} color="#002F34" />
            </TouchableOpacity>
            <Text style={styles.headerTitleLeft}>Set a price</Text>
          </View>

          <ScrollView
            contentContainerStyle={[styles.formScroll, { paddingBottom: insets.bottom + 100 }]}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.fieldBlock}>
              <Text style={styles.floatingSmallLabel}>Price *</Text>
              <View style={styles.priceInputWrap}>
                <Text style={styles.currencyPrefix}>{currencySymbol}  |</Text>
                <TextInput
                  value={price}
                  onChangeText={(val) => setPrice(val.replace(/[^0-9]/g, ''))}
                  keyboardType="numeric"
                  placeholder="Price"
                  placeholderTextColor="#94A3B8"
                  style={styles.priceInput}
                  maxLength={9}
                  autoFocus
                />
              </View>
              {Number(price) > 0 && (
                <Text style={styles.formattedPriceHint}>
                  {currencySymbol} {Number(price).toLocaleString('en-IN')}
                </Text>
              )}
            </View>
          </ScrollView>

          {/* Sticky Bottom Next Button -> Goes to LOCATION */}
          <View style={[styles.bottomStickyBar, { paddingBottom: Math.max(insets.bottom, 16) }]}>
            <TouchableOpacity
              style={styles.primaryActionButton}
              onPress={() => {
                if (validatePriceStep()) {
                  setCurrentView('LOCATION');
                }
              }}
              activeOpacity={0.85}
            >
              <Text style={styles.primaryActionButtonText}>Next</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* ======================================================== */}
      {/* STEP 5: CONFIRM YOUR LOCATION                            */}
      {/* ======================================================== */}
      {currentView === 'LOCATION' && (
        <View style={styles.fullFlex}>
          <View style={styles.headerLeftAligned}>
            <TouchableOpacity onPress={handleBackPress} style={styles.backButton} accessibilityLabel="Back">
              <Ionicons name="arrow-back" size={24} color="#002F34" />
            </TouchableOpacity>
            <Text style={styles.headerTitleLeft}>Confirm your location</Text>
          </View>

          <ScrollView
            contentContainerStyle={[styles.formScroll, { paddingBottom: insets.bottom + 100 }]}
            keyboardShouldPersistTaps="handled"
          >
            {/* Current selected location row */}
            <View style={styles.locationSelectedCard}>
              <Ionicons name="location" size={22} color="#004896" />
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={styles.locationCardLabel}>LOCATION</Text>
                <Text style={styles.locationCardValue}>
                  {[locality, city, stateName].filter(Boolean).join(', ')}
                </Text>
              </View>
            </View>

            <View style={styles.fieldBlock}>
              <Text style={styles.floatingSmallLabel}>Locality / Neighbourhood *</Text>
              <TextInput
                value={locality}
                onChangeText={setLocality}
                placeholder="e.g. Sangam Nagar, Vijay Nagar"
                placeholderTextColor="#94A3B8"
                style={styles.underlineInput}
              />
            </View>

            <View style={styles.fieldBlock}>
              <Text style={styles.floatingSmallLabel}>City *</Text>
              <TextInput
                value={city}
                onChangeText={setCity}
                placeholder="e.g. Indore"
                placeholderTextColor="#94A3B8"
                style={styles.underlineInput}
              />
            </View>

            <View style={styles.fieldBlock}>
              <Text style={styles.floatingSmallLabel}>State</Text>
              <TextInput
                value={stateName}
                onChangeText={setStateName}
                placeholder="e.g. Madhya Pradesh"
                placeholderTextColor="#94A3B8"
                style={styles.underlineInput}
              />
            </View>

            <Text style={[styles.floatingSmallLabel, { marginBottom: 10, marginTop: 8 }]}>
              POPULAR LOCATIONS
            </Text>
            <View style={styles.popularLocationsWrap}>
              {POPULAR_LOCATIONS.map((loc, idx) => {
                const isSelected = locality === loc.locality && city === loc.city;
                return (
                  <TouchableOpacity
                    key={idx}
                    style={[styles.popularLocRow, isSelected && styles.popularLocRowActive]}
                    onPress={() => {
                      setLocality(loc.locality);
                      setCity(loc.city);
                      setStateName(loc.state);
                    }}
                  >
                    <Ionicons
                      name="location-outline"
                      size={18}
                      color={isSelected ? '#004896' : '#64748B'}
                    />
                    <Text
                      style={[
                        styles.popularLocText,
                        isSelected && { color: '#004896', fontWeight: '700' }
                      ]}
                    >
                      {loc.locality}, {loc.city}
                    </Text>
                    {isSelected && <Ionicons name="checkmark" size={18} color="#004896" />}
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>

          {/* Sticky Bottom Next Button -> Goes to REVIEW */}
          <View style={[styles.bottomStickyBar, { paddingBottom: Math.max(insets.bottom, 16) }]}>
            <TouchableOpacity
              style={styles.primaryActionButton}
              onPress={() => {
                if (validateLocationStep()) {
                  setCurrentView('REVIEW');
                }
              }}
              activeOpacity={0.85}
            >
              <Text style={styles.primaryActionButtonText}>Next</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* ======================================================== */}
      {/* STEP 6: REVIEW YOUR DETAILS                              */}
      {/* Shows Profile Picture, Name of Account, Verified Phone   */}
      {/* ======================================================== */}
      {currentView === 'REVIEW' && (
        <View style={styles.fullFlex}>
          <View style={styles.headerLeftAligned}>
            <TouchableOpacity onPress={handleBackPress} style={styles.backButton} accessibilityLabel="Back">
              <Ionicons name="arrow-back" size={24} color="#002F34" />
            </TouchableOpacity>
            <Text style={styles.headerTitleLeft}>Review your details</Text>
          </View>

          <ScrollView
            contentContainerStyle={[styles.formScroll, { paddingBottom: insets.bottom + 100 }]}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* 1. Profile Picture + Account Name Row */}
            <View style={styles.reviewProfileRow}>
              <TouchableOpacity
                style={styles.reviewAvatarWrap}
                onPress={handlePickProfileAvatar}
                activeOpacity={0.8}
              >
                {accountAvatar ? (
                  <Image source={{ uri: accountAvatar }} style={styles.reviewAvatarImage} />
                ) : (
                  <View style={styles.reviewAvatarFallback}>
                    <Text style={styles.reviewAvatarInitials}>
                      {(accountName || 'U').charAt(0).toUpperCase()}
                    </Text>
                  </View>
                )}
                <View style={styles.reviewAvatarCameraBadge}>
                  <Ionicons name="camera" size={14} color="#FFFFFF" />
                </View>
              </TouchableOpacity>

              <View style={styles.reviewNameInputWrap}>
                <Text style={styles.floatingSmallLabel}>Your name</Text>
                <TextInput
                  value={accountName}
                  onChangeText={setAccountName}
                  maxLength={30}
                  placeholder="Enter your name"
                  placeholderTextColor="#94A3B8"
                  style={styles.underlineInput}
                />
                <View style={styles.counterRightRow}>
                  <Text style={styles.counterText}>{accountName.length}/30</Text>
                </View>
              </View>
            </View>

            {/* 2. Verified Phone Number Section */}
            <View style={styles.verifiedPhoneSection}>
              <Text style={styles.verifiedSectionTitle}>Verified phone number</Text>
              <View style={styles.verifiedPhoneRow}>
                <View style={styles.verifiedPhoneLeft}>
                  <Ionicons name="checkmark-circle" size={22} color="#059669" />
                  <Text style={styles.verifiedPhoneLabel}>Verified phone number</Text>
                </View>
                <Text style={styles.verifiedPhoneNumberText}>
                  {phone.startsWith('+') ? phone : `+91 ${phone}`}
                </Text>
              </View>
            </View>

            {/* Compact Ad Summary Preview */}
            <View style={styles.reviewAdSummaryCard}>
              <Text style={styles.reviewSummaryHeading}>LISTING SUMMARY</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 10 }}>
                {images[0] ? (
                  <Image source={{ uri: images[0] }} style={styles.reviewSummaryThumb} />
                ) : (
                  <View style={[styles.reviewSummaryThumb, { backgroundColor: '#F1F5F9', alignItems: 'center', justifyContent: 'center' }]}>
                    <Ionicons name="car-sport-outline" size={24} color="#64748B" />
                  </View>
                )}
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={styles.reviewSummaryTitle} numberOfLines={1}>
                    {title}
                  </Text>
                  {Boolean(dynamicValues.brand) && (
                    <Text style={styles.reviewSummarySub} numberOfLines={1}>
                      {dynamicValues.brand} {dynamicValues.year ? `| ${dynamicValues.year}` : ''}
                    </Text>
                  )}
                  <Text style={styles.reviewSummaryPrice}>
                    {currencySymbol} {Number(price || 0).toLocaleString('en-IN')}
                  </Text>
                  <Text style={styles.reviewSummaryLoc} numberOfLines={1}>
                    {locality}, {city}
                  </Text>
                </View>
              </View>
            </View>
          </ScrollView>

          {/* Sticky Bottom Post Now Button */}
          <View style={[styles.bottomStickyBar, { paddingBottom: Math.max(insets.bottom, 16) }]}>
            <TouchableOpacity
              style={[styles.primaryActionButton, isSubmitting && { opacity: 0.7 }]}
              onPress={handlePostAd}
              disabled={isSubmitting}
              activeOpacity={0.85}
            >
              <Text style={styles.primaryActionButtonText}>
                {isSubmitting ? 'Posting...' : 'Post now'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* ======================================================== */}
      {/* CASCADING BRAND -> MODEL -> VARIANT MODAL                */}
      {/* ======================================================== */}
      <Modal
        visible={brandModalOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setBrandModalOpen(false)}
      >
        <View style={styles.centerDialogBackdrop}>
          <View style={[styles.centerDialogCard, { maxHeight: '80%' }]}>
            {/* Breadcrumb Header */}
            <View style={styles.dialogBreadcrumbHeader}>
              {brandStep !== 'BRAND' && (
                <TouchableOpacity
                  onPress={() => {
                    if (brandStep === 'VARIANT') setBrandStep('MODEL');
                    else setBrandStep('BRAND');
                  }}
                  style={{ marginRight: 10, padding: 2 }}
                >
                  <Ionicons name="arrow-back" size={20} color="#002F34" />
                </TouchableOpacity>
              )}
              <Text style={styles.dialogBreadcrumbMuted}>
                {selectedCategory || 'Cars'}
                {brandStep === 'MODEL' ? `  >  ${selectedCarBrand}` : ''}
                {brandStep === 'VARIANT' ? `  >  ${selectedCarBrand}  >  ${selectedCarModel}` : ''}
                {'   >   '}
              </Text>
              <Text style={styles.dialogBreadcrumbActive}>
                {brandStep === 'BRAND' ? 'Brand' : brandStep === 'MODEL' ? 'Model' : 'Variant'}
              </Text>
            </View>

            {/* Optional Search Bar in Brand Step */}
            {brandStep === 'BRAND' && (
              <View style={styles.dialogSearchWrap}>
                <Ionicons name="search" size={18} color="#64748B" />
                <TextInput
                  value={brandSearchQuery}
                  onChangeText={setBrandSearchQuery}
                  placeholder="Search car brand..."
                  placeholderTextColor="#94A3B8"
                  style={styles.dialogSearchInput}
                />
              </View>
            )}

            <ScrollView style={{ maxHeight: 380 }} showsVerticalScrollIndicator={false}>
              {brandStep === 'BRAND' &&
                filteredCarBrands.map((bObj) => (
                  <TouchableOpacity
                    key={bObj.brand}
                    style={styles.dialogOptionRow}
                    onPress={() => {
                      setSelectedCarBrand(bObj.brand);
                      setSelectedCarModel('');
                      setSelectedCarVariant('');
                      setBrandStep('MODEL');
                    }}
                  >
                    <Text style={styles.dialogOptionText}>{bObj.brand}</Text>
                    <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
                  </TouchableOpacity>
                ))}

              {brandStep === 'MODEL' &&
                (currentBrandObj?.models || []).map((mObj) => (
                  <TouchableOpacity
                    key={mObj.model}
                    style={styles.dialogOptionRow}
                    onPress={() => {
                      setSelectedCarModel(mObj.model);
                      setSelectedCarVariant('');
                      setBrandStep('VARIANT');
                    }}
                  >
                    <Text style={styles.dialogOptionText}>{mObj.model}</Text>
                    <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
                  </TouchableOpacity>
                ))}

              {brandStep === 'VARIANT' &&
                (currentModelObj?.variants || ['Standard']).map((vName) => (
                  <TouchableOpacity
                    key={vName}
                    style={styles.dialogOptionRow}
                    onPress={() => {
                      const combined = `${selectedCarBrand} / ${selectedCarModel} / ${vName}`;
                      setSelectedCarVariant(vName);
                      setDynamicValues((prev) => ({
                        ...prev,
                        brand: combined,
                        brandName: selectedCarBrand,
                        model: selectedCarModel,
                        variant: vName
                      }));
                      setBrandModalOpen(false);
                    }}
                  >
                    <Text style={styles.dialogOptionText}>{vName}</Text>
                  </TouchableOpacity>
                ))}
            </ScrollView>

            <View style={styles.dialogFooterRow}>
              <TouchableOpacity
                onPress={() => setBrandModalOpen(false)}
                style={styles.dialogCancelBtn}
              >
                <Text style={styles.dialogCancelBtnText}>CANCEL</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ======================================================== */}
      {/* CENTERED POPUP DIALOG FOR FUEL & NO. OF OWNERS           */}
      {/* Exact match to media_1791717218237.png & 1791717226351   */}
      {/* ======================================================== */}
      <Modal
        visible={Boolean(activeSelectModalField)}
        transparent
        animationType="fade"
        onRequestClose={() => setActiveSelectModalField(null)}
      >
        <View style={styles.centerDialogBackdrop}>
          <View style={styles.centerDialogCard}>
            <View style={styles.dialogBreadcrumbHeader}>
              <Text style={styles.dialogBreadcrumbMuted}>
                {selectedCategory || 'Cars'}   &gt;   
              </Text>
              <Text style={styles.dialogBreadcrumbActive}>
                {activeSelectModalField?.label}
              </Text>
            </View>

            <ScrollView style={{ maxHeight: 340 }} showsVerticalScrollIndicator={false}>
              {(activeSelectModalField?.options || []).map((opt) => (
                <TouchableOpacity
                  key={opt}
                  style={styles.dialogOptionRow}
                  onPress={() => {
                    setDynamicValues((prev) => ({
                      ...prev,
                      [activeSelectModalField.key]: opt
                    }));
                    setActiveSelectModalField(null);
                  }}
                >
                  <Text style={styles.dialogOptionText}>{opt}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <View style={styles.dialogFooterRow}>
              <TouchableOpacity
                onPress={() => setActiveSelectModalField(null)}
                style={styles.dialogCancelBtn}
              >
                <Text style={styles.dialogCancelBtnText}>CANCEL</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Success Modal */}
      <Modal visible={successModalVisible} transparent animationType="fade">
        <View style={styles.centerDialogBackdrop}>
          <View style={styles.successModalCard}>
            <View style={styles.successIconCircle}>
              <Ionicons name="checkmark" size={36} color="#FFFFFF" />
            </View>
            <Text style={styles.successModalTitle}>Congratulations!</Text>
            <Text style={styles.successModalSubtitle}>
              Your ad will go live shortly and is ready for buyers on MyBigBazaar.
            </Text>

            <TouchableOpacity style={styles.successPrimaryBtn} onPress={handleFinishSuccess}>
              <Text style={styles.successPrimaryBtnText}>Preview Ad</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.successSecondaryBtn}
              onPress={() => {
                setSuccessModalVisible(false);
                setCurrentView('CATEGORIES');
                setTitle('');
                setDescription('');
                setPrice('');
                setImages([]);
                setDynamicValues({});
              }}
            >
              <Text style={styles.successSecondaryBtnText}>Back to Categories</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#FFFFFF' },
  fullFlex: { flex: 1, backgroundColor: '#FFFFFF' },

  // Headers
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0'
  },
  headerLeftAligned: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0'
  },
  backButton: { width: 36, height: 36, alignItems: 'flex-start', justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#002F34' },
  headerTitleLeft: { fontSize: 19, fontWeight: '500', color: '#002F34', marginLeft: 12 },

  // Categories 2-Column Grid
  categoriesGridScroll: { paddingBottom: 40 },
  gridContainer: { flexDirection: 'row', flexWrap: 'wrap' },
  gridItem: {
    width: '50%',
    height: 125,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    backgroundColor: '#FFFFFF'
  },
  gridItemLeft: { borderRightWidth: 1, borderRightColor: '#EFEFEF' },
  gridItemBottom: { borderBottomWidth: 1, borderBottomColor: '#EFEFEF' },
  catIconCircle: {
    width: 54,
    height: 54,
    borderRadius: 27,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8
  },
  catGridTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#002F34',
    textAlign: 'center',
    lineHeight: 18
  },

  // Form Scroll & Category Heading
  formScroll: { paddingHorizontal: 18, paddingTop: 18 },
  categoryHeaderContainer: {
    marginBottom: 24
  },
  categoryHeaderBold: {
    fontSize: 19,
    fontWeight: '700',
    color: '#002F34'
  },
  subcategoryHeaderSub: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 4
  },

  // Underline Fields (Exact to OLX Screenshots)
  fieldBlock: { marginBottom: 24 },
  floatingSmallLabel: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 2
  },
  underlineSelectField: {
    minHeight: 40,
    justifyContent: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#475569',
    paddingVertical: 6
  },
  underlineSelectText: {
    fontSize: 16,
    color: '#002F34',
    fontWeight: '400'
  },
  underlinePlaceholderText: {
    fontSize: 16,
    color: '#64748B'
  },
  underlineInput: {
    height: 40,
    borderBottomWidth: 1,
    borderBottomColor: '#475569',
    fontSize: 16,
    color: '#002F34',
    paddingHorizontal: 0,
    paddingVertical: 4
  },
  yearErrorText: {
    fontSize: 12,
    color: '#DC2626',
    marginTop: 6
  },
  counterRightRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 4
  },

  // Transmission Segmented Buttons
  transmissionTitle: {
    fontSize: 15,
    color: '#475569',
    marginBottom: 10
  },
  segmentedRow: { flexDirection: 'row', gap: 12 },
  segmentBox: {
    flex: 1,
    height: 46,
    borderWidth: 1,
    borderColor: '#64748B',
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF'
  },
  segmentBoxActive: {
    borderWidth: 1.5,
    borderColor: '#002F34',
    backgroundColor: '#FDF9DB'
  },
  segmentBoxText: { fontSize: 14, fontWeight: '500', color: '#002F34' },
  segmentBoxTextActive: { fontWeight: '600', color: '#002F34' },

  // Suggested / Write for me Card
  suggestedContainer: {
    backgroundColor: '#FAF5FF',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingTop: 14,
    paddingBottom: 18,
    marginTop: 4,
    marginBottom: 16
  },
  suggestedTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16
  },
  olxSuggestedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 16
  },
  olxSuggestedBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#9333EA'
  },
  writeForMeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2
  },
  writeForMeButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#002F34'
  },
  fieldBlockInCard: {
    marginBottom: 20
  },
  underlineInputCard: {
    height: 40,
    borderBottomWidth: 1,
    borderBottomColor: '#002F34',
    fontSize: 16,
    color: '#002F34',
    paddingHorizontal: 0
  },
  multilineUnderlineInput: {
    minHeight: 44,
    borderBottomWidth: 1.5,
    borderBottomColor: '#002F34',
    fontSize: 15,
    color: '#002F34',
    paddingHorizontal: 0,
    paddingVertical: 6,
    lineHeight: 21
  },
  helperRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginTop: 6
  },
  helperText: {
    flex: 1,
    fontSize: 12,
    color: '#002F34',
    lineHeight: 16,
    marginRight: 8
  },
  counterText: {
    fontSize: 11,
    color: '#475569'
  },
  requiredNotice: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 4,
    marginBottom: 16
  },

  // Bottom Sticky Action Bar & Next Button (Dark Blue matching screenshot)
  bottomStickyBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9'
  },
  primaryActionButton: {
    backgroundColor: '#004896',
    height: 48,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center'
  },
  primaryActionButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700'
  },

  // Centered Dialog Modals (Fuel, No. of Owners, Brand/Model/Variant)
  centerDialogBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24
  },
  centerDialogCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 4,
    paddingTop: 20,
    paddingBottom: 14,
    paddingHorizontal: 22,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 14
  },
  dialogBreadcrumbHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginBottom: 16
  },
  dialogBreadcrumbMuted: {
    fontSize: 16,
    color: '#475569',
    fontWeight: '400'
  },
  dialogBreadcrumbActive: {
    fontSize: 16,
    color: '#002F34',
    fontWeight: '600'
  },
  dialogSearchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 6,
    paddingHorizontal: 10,
    height: 40,
    marginBottom: 10
  },
  dialogSearchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: '#002F34'
  },
  dialogOptionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 15
  },
  dialogOptionText: {
    fontSize: 16,
    color: '#002F34'
  },
  dialogFooterRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 12,
    paddingTop: 6
  },
  dialogCancelBtn: {
    paddingVertical: 8,
    paddingHorizontal: 12
  },
  dialogCancelBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#004896',
    letterSpacing: 0.5
  },

  // Photos Step
  photosHintText: {
    fontSize: 13,
    color: '#64748B',
    lineHeight: 19,
    marginBottom: 18
  },
  photosGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12
  },
  photoSlot: {
    width: '30%',
    aspectRatio: 1,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    position: 'relative'
  },
  photoImage: { width: '100%', height: '100%' },
  coverBadge: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 72, 150, 0.85)',
    paddingVertical: 3,
    alignItems: 'center'
  },
  coverBadgeText: { color: '#FFFFFF', fontSize: 10, fontWeight: '700' },
  deletePhotoBtn: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(0,0,0,0.65)',
    alignItems: 'center',
    justifyContent: 'center'
  },
  setCoverBtn: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.55)',
    paddingVertical: 3,
    alignItems: 'center'
  },
  setCoverText: { color: '#FFFFFF', fontSize: 10, fontWeight: '600' },
  addPhotoCard: {
    width: '30%',
    aspectRatio: 1,
    borderRadius: 8,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: '#002F34',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FAFC'
  },
  addPhotoTitle: { fontSize: 12, fontWeight: '600', color: '#002F34', marginTop: 4 },
  addPhotoCounter: { fontSize: 11, color: '#64748B', marginTop: 2 },

  // Price Step
  priceInputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1.5,
    borderBottomColor: '#002F34',
    paddingVertical: 6
  },
  currencyPrefix: {
    fontSize: 18,
    fontWeight: '600',
    color: '#002F34',
    marginRight: 12
  },
  priceInput: {
    flex: 1,
    fontSize: 20,
    fontWeight: '700',
    color: '#002F34',
    paddingVertical: 4
  },
  formattedPriceHint: {
    fontSize: 13,
    color: '#059669',
    fontWeight: '600',
    marginTop: 8
  },

  // Location Step
  locationSelectedCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 8,
    backgroundColor: '#F0F7FF',
    borderWidth: 1,
    borderColor: '#BAE6FD',
    marginBottom: 22
  },
  locationCardLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#004896'
  },
  locationCardValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#002F34',
    marginTop: 2
  },
  popularLocationsWrap: {
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9'
  },
  popularLocRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    gap: 10
  },
  popularLocRowActive: {
    backgroundColor: '#F8FAFC'
  },
  popularLocText: {
    flex: 1,
    fontSize: 15,
    color: '#334155'
  },

  // Step 6: Review Your Details (Profile Picture, Account Name, Verified Phone Number)
  reviewProfileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 28,
    marginTop: 6
  },
  reviewAvatarWrap: {
    width: 76,
    height: 76,
    borderRadius: 38,
    marginRight: 18,
    position: 'relative'
  },
  reviewAvatarImage: {
    width: 76,
    height: 76,
    borderRadius: 38
  },
  reviewAvatarFallback: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: '#004896',
    alignItems: 'center',
    justifyContent: 'center'
  },
  reviewAvatarInitials: {
    fontSize: 30,
    fontWeight: '700',
    color: '#FFFFFF'
  },
  reviewAvatarCameraBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#002F34',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center'
  },
  reviewNameInputWrap: {
    flex: 1
  },
  verifiedPhoneSection: {
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#E2E8F0',
    paddingVertical: 20,
    marginBottom: 24
  },
  verifiedSectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#002F34',
    marginBottom: 14
  },
  verifiedPhoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  verifiedPhoneLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  verifiedPhoneLabel: {
    fontSize: 15,
    color: '#475569'
  },
  verifiedPhoneNumberText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#002F34'
  },
  reviewAdSummaryCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 14
  },
  reviewSummaryHeading: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
    letterSpacing: 0.5
  },
  reviewSummaryThumb: {
    width: 64,
    height: 64,
    borderRadius: 8
  },
  reviewSummaryTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#002F34'
  },
  reviewSummarySub: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2
  },
  reviewSummaryPrice: {
    fontSize: 16,
    fontWeight: '800',
    color: '#004896',
    marginTop: 4
  },
  reviewSummaryLoc: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2
  },

  // Success Modal
  successModalCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center'
  },
  successIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#059669',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16
  },
  successModalTitle: { fontSize: 20, fontWeight: '800', color: '#002F34', marginBottom: 8 },
  successModalSubtitle: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20
  },
  successPrimaryBtn: {
    width: '100%',
    backgroundColor: '#004896',
    paddingVertical: 13,
    borderRadius: 6,
    alignItems: 'center',
    marginBottom: 10
  },
  successPrimaryBtnText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
  successSecondaryBtn: {
    width: '100%',
    paddingVertical: 10,
    alignItems: 'center'
  },
  successSecondaryBtnText: { color: '#004896', fontSize: 14, fontWeight: '600' }
});
