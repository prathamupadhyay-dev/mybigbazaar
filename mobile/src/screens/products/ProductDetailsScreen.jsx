import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  Modal,
  Share,
  Alert,
  TextInput,
  Linking,
  Platform
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../../context/AppContext';
import ScreenContainer from '../../components/ScreenContainer';
import Colors from '../../constants/colors';
import Typography from '../../constants/typography';
import Spacing from '../../constants/spacing';
import Radii from '../../constants/radii';
import Shadows from '../../constants/shadows';
import { getProductsApi, resolveProductImageUrl } from '../../services/productApi';
import { apiGet, apiPost } from '../../services/apiClient';

const { width } = Dimensions.get('window');

export const ProductDetailsScreen = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const route = useRoute();
  const product = route.params?.product;
  const { watchlist, toggleWatchlist, requireAuth, addToBucket, bucket, currencySymbol, formatPrice, addRecentlyViewed, user } = useApp();

  useEffect(() => {
    if (product) {
      addRecentlyViewed?.(product);
    }
  }, [product?.id]);

  const [imageExpanded, setImageExpanded] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [offerModalVisible, setOfferModalVisible] = useState(false);
  const [offerAmount, setOfferAmount] = useState('');
  const [isDescExpanded, setIsDescExpanded] = useState(false);
  const [isSpecsExpanded, setIsSpecsExpanded] = useState(true);
  const [addedFeedbackVisible, setAddedFeedbackVisible] = useState(false);
  const [selectedSize, setSelectedSize] = useState('M');
  const [selectedColor, setSelectedColor] = useState('Graphite');
  const [liveReviews, setLiveReviews] = useState([]);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [newReviewComment, setNewReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const availableSizes = ['S', 'M', 'L', 'XL', 'XXL'];
  const availableColors = [
    { name: 'Graphite', hex: '#1E293B' },
    { name: 'Silver', hex: '#94A3B8' },
    { name: 'Navy', hex: '#1E3A8A' },
    { name: 'Emerald', hex: '#059669' }
  ];

  if (!product) {
    return (
      <ScreenContainer>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color={Colors.disabled} />
          <Text style={styles.errorText}>Product not found</Text>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </ScreenContainer>
    );
  }

  const prodIdStr = String(product.id || product._id || '');
  const isSaved = watchlist.includes(prodIdStr);
  const numericPrice = parseFloat(String(product.price ?? product.productPrice ?? 0).replace(/[^0-9.]/g, '')) || 0;
  const locationString = typeof product.location === 'string' && product.location
    ? product.location
    : ([product.location?.city || product.city, product.location?.state || product.state].filter(Boolean).join(', ') || 'Indore, Madhya Pradesh');
  const categoryString = typeof product.category === 'object' && product.category !== null
    ? (product.category.name || 'General')
    : (product.category || 'General');

  const rawImages = (product.images && Array.isArray(product.images) && product.images.length > 0)
    ? product.images
    : (product.imageUrl ? [product.imageUrl] : (product.image ? [product.image] : []));
  const images = rawImages.filter(Boolean).map(resolveProductImageUrl);

  const handleFavourite = () => {
    requireAuth(navigation, () => {
      toggleWatchlist(prodIdStr);
    });
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out ${product.title} on BigBazaar for ${product.price}! Download the app to view details.`,
        title: product.title
      });
    } catch (error) {
      // silent
    }
  };

  const submitListingReport = async (reason) => {
    try {
      await apiPost('/api/v1/reports', {
        targetType: 'listing',
        targetId: prodIdStr,
        targetTitle: product.title || product.productName || 'Marketplace Listing',
        reason,
        description: `Reported from mobile app: ${reason} (${product.title || 'Listing'})`,
        reporterName: user?.fullName || user?.name || 'Mobile Buyer'
      });
    } catch {}
    Alert.alert('Reported', 'Thank you. Our moderation team has flagged this item for review.');
  };

  const handleReport = () => {
    requireAuth(navigation, () => {
      Alert.alert(
        'Report Listing',
        'Why are you reporting this listing?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Suspicious / Scam', onPress: () => submitListingReport('scam') },
          { text: 'Inappropriate Content', onPress: () => submitListingReport('offensive') },
          { text: 'Misleading Info', onPress: () => submitListingReport('fake_item') }
        ]
      );
    });
  };

  const handleChat = () => {
    requireAuth(navigation, () => {
      navigation.navigate('Chat', {
        sellerName: product.sellerName || product.rawProduct?.createdBy?.fullName || 'Verified Seller',
        sellerId: product.rawProduct?.createdBy?._id || product.rawProduct?.createdBy || product.sellerId || '',
        listingTitle: product.title,
        listingPrice: numericPrice,
        listingImage: images[0] || product.imageUrl,
        listingId: prodIdStr
      });
    });
  };
  const handleAddToCart = () => {
    addToBucket({
      id: prodIdStr,
      title: product.title,
      price: numericPrice,
      imageUrl: images[0] || product.imageUrl,
      category: categoryString,
      condition: product.condition || 'Good',
      sellerName: product.sellerName || 'Local Seller',
      quantity: 1,
      itemType: 'product'
    });
    setAddedFeedbackVisible(true);
  };

  const handleBuyNow = () => {
    requireAuth(navigation, () => {
      addToBucket({
        id: product.id,
        title: product.title,
        price: numericPrice,
        imageUrl: product.imageUrl,
        category: product.category,
        condition: product.condition || 'Good',
        sellerName: product.sellerName || 'Local Seller',
        quantity: 1,
        itemType: 'product'
      });
      navigation.navigate('Checkout', {
        listingId: product.id,
        item: {
          id: product.id,
          title: product.title,
          price: numericPrice,
          imageUrl: product.imageUrl,
          sellerName: product.sellerName || 'Local Seller'
        },
        dealPrice: numericPrice
      });
    });
  };

  const handleMakeOffer = () => {
    requireAuth(navigation, () => {
      setOfferAmount(String(Math.round(numericPrice * 0.9)));
      setOfferModalVisible(true);
    });
  };

  const submitOffer = async () => {
    const amount = Number(offerAmount.replace(/[^0-9.]/g, ''));
    if (!amount || amount <= 0) {
      Alert.alert('Enter valid offer', 'Please enter a valid amount before sending your offer.');
      return;
    }
    setOfferModalVisible(false);

    let createdConvId = '';
    try {
      const res = await apiPost('/api/v1/chat/conversations', {
        userId: user?._id || user?.id,
        buyerName: user?.name || user?.fullName || 'Aarav Sharma',
        buyerPhone: user?.phone || user?.phoneNumber || '+919876543210',
        sellerId: product.rawProduct?.createdBy?._id || product.rawProduct?.createdBy || product.sellerId || undefined,
        sellerName: product.sellerName || product.rawProduct?.createdBy?.fullName || 'Verified Seller',
        listingId: product.id || product._id,
        listingTitle: product.title,
        listingPrice: numericPrice,
        listingImage: images[0] || product.imageUrl,
        initialOffer: amount
      });
      createdConvId = String(res?.data?._id || res?.data?.id || '');
    } catch {}

    Alert.alert(
      'Offer Submitted',
      `Your offer of ${currencySymbol}${amount.toLocaleString()} was sent to ${product.sellerName || 'the seller'}. They will respond via Chat.`,
      [
        { text: 'Later', style: 'cancel' },
        {
          text: 'Open Chat',
          onPress: () => {
            navigation.navigate('Chat', {
              conversationId: createdConvId || undefined,
              sellerName: product.sellerName || product.rawProduct?.createdBy?.fullName || 'Verified Seller',
              sellerId: product.rawProduct?.createdBy?._id || product.rawProduct?.createdBy || product.sellerId || '',
              listingTitle: product.title,
              listingPrice: numericPrice,
              listingImage: images[0] || product.imageUrl,
              listingId: product.id || product._id,
              initialOffer: createdConvId ? 0 : amount
            });
          }
        }
      ]
    );
  };

  const displayPrice = (val) => {
    if (typeof val === 'number') return formatPrice(val);
    if (!val) return '₹0';
    if (typeof val === 'string' && (val.startsWith('₹') || val.startsWith('$'))) return val;
    const num = parseFloat(String(val).replace(/[^0-9.]/g, ''));
    return num ? formatPrice(num) : '₹0';
  };

  const [liveRelated, setLiveRelated] = useState([]);

  useEffect(() => {
    let isMounted = true;
    const prodId = product?.id || product?._id || '';
    if (prodId && /^[0-9a-fA-F]{24}$/.test(String(prodId))) {
      apiGet(`/api/v1/listings/${prodId}`).catch(() => {});
    }
    getProductsApi()
      .then((prods) => {
        if (isMounted && Array.isArray(prods)) {
          setLiveRelated(
            prods.map((p) => {
              const loc = typeof p.location === 'string' && p.location
                ? p.location
                : (p.location?.city || p.city || p.sellerCity || 'Indore');
              return {
                id: p._id || p.id,
                title: p.title || p.productName || 'Untitled',
                price: p.price || p.productPrice || 0,
                location: loc,
                imageUrl: resolveProductImageUrl(
                  (Array.isArray(p.images) && p.images[0]) || p.image || p.imageUrl
                ),
                category: typeof p.category === 'object' ? (p.category?.name || 'General') : (p.category || 'General'),
                rawProduct: p
              };
            })
          );
        }
      })
      .catch(() => {});

    apiGet(`/api/v1/reviews${prodId ? `?productId=${prodId}` : ''}`)
      .then((res) => {
        const list = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
        if (isMounted && list.length > 0) {
          const filtered = prodId
            ? list.filter((r) => !r.productId || String(r.productId) === String(prodId) || (r.productTitle || '').toLowerCase() === (product?.title || '').toLowerCase())
            : list;
          const mapped = (filtered.length > 0 ? filtered : list.slice(0, 4)).map((r, idx) => ({
            id: r._id || r.id || `rev-${idx}`,
            author: r.reviewerName || r.userName || r.author || 'Verified Buyer',
            rating: Number(r.rating) || 5,
            text: r.comment || r.reviewText || r.text || 'Excellent condition item, smooth handover!',
            date: r.createdAt ? new Date(r.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : 'Recent',
            verified: r.verifiedBuyer !== false,
            helpfulCount: r.helpfulCount || 3
          }));
          setLiveReviews(mapped);
        }
      })
      .catch(() => {});

    return () => {
      isMounted = false;
    };
  }, [product?.id]);

  const handleSubmitProductReview = async () => {
    if (!newReviewComment.trim()) {
      Alert.alert('Review Required', 'Please share a brief comment about this item.');
      return;
    }
    setSubmittingReview(true);
    const authorName = user?.fullName || user?.name || 'Aarav Sharma';
    const payload = {
      productId: product?.id || product?._id,
      productTitle: product?.title || 'Listing',
      sellerName: product?.sellerName || 'Verified Seller',
      reviewerId: user?._id || user?.id,
      reviewerName: authorName,
      rating: newReviewRating,
      comment: newReviewComment.trim(),
      verifiedBuyer: true,
      status: 'Approved'
    };
    try {
      await apiPost('/api/v1/reviews', payload);
    } catch {}
    setLiveReviews((prev) => [
      {
        id: `rev-${Date.now()}`,
        author: authorName,
        rating: newReviewRating,
        text: newReviewComment.trim(),
        date: 'Just now',
        verified: true,
        helpfulCount: 1
      },
      ...prev
    ]);
    setSubmittingReview(false);
    setNewReviewComment('');
    setReviewModalOpen(false);
    Alert.alert('Review Submitted', 'Thank you! Your rating and review are now live.');
  };

  const categoryMatches = liveRelated.filter(
    (item) => item.id !== product.id && item.category === product.category
  );
  const relatedProducts = (categoryMatches.length ? categoryMatches : liveRelated.filter((item) => item.id !== product.id)).slice(0, 6);
  const sellerProducts = liveRelated.filter((item) => item.id !== product.id).slice(0, 4);

  const productReviewsList = liveReviews.length > 0 ? liveReviews : (Array.isArray(product.reviewsList) ? product.reviewsList : []);
  const hasProductReviews = productReviewsList.length > 0;

  return (
    <ScreenContainer noPadding style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {product.category || 'Product'}
        </Text>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.headerBtn} onPress={handleShare} accessibilityLabel="Share listing">
            <Ionicons name="share-outline" size={22} color={Colors.textPrimary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerBtn} onPress={handleFavourite} accessibilityLabel="Save to watchlist">
            <Ionicons
              name={isSaved ? 'heart' : 'heart-outline'}
              size={22}
              color={isSaved ? Colors.error : Colors.textPrimary}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.headerBtn}
            onPress={() => navigation.navigate('Bucket')}
            accessibilityLabel="Open Bucket">
            <Ionicons name="cart-outline" size={22} color={Colors.textPrimary} />
            {bucket?.length > 0 && (
              <View style={styles.headerCartBadge}>
                <Text style={styles.headerCartBadgeText}>{bucket.length}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Floating Added to Bucket Banner with Action CTAs */}
      {addedFeedbackVisible && (
        <View style={styles.feedbackBannerContainer}>
          <View style={styles.feedbackCard}>
            <View style={styles.feedbackTopRow}>
              <View style={styles.feedbackCheckCircle}>
                <Ionicons name="checkmark" size={16} color={Colors.white} />
              </View>
              <View style={styles.feedbackCopy}>
                <Text style={styles.feedbackTitle}>Added to Bucket ✓</Text>
                <Text style={styles.feedbackSub} numberOfLines={1}>{product.title}</Text>
              </View>
              <TouchableOpacity
                onPress={() => setAddedFeedbackVisible(false)}
                style={styles.feedbackCloseBtn}
                accessibilityLabel="Close notification">
                <Ionicons name="close" size={18} color={Colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <View style={styles.feedbackActionsRow}>
              <TouchableOpacity
                style={styles.continueShoppingBtn}
                onPress={() => setAddedFeedbackVisible(false)}
                accessibilityRole="button">
                <Text style={styles.continueShoppingText}>Continue Shopping</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.goToBucketBtn}
                onPress={() => {
                  setAddedFeedbackVisible(false);
                  navigation.navigate('Bucket');
                }}
                accessibilityRole="button">
                <Ionicons name="basket" size={15} color={Colors.white} style={{ marginRight: 5 }} />
                <Text style={styles.goToBucketText}>Go to Bucket</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Fullscreen Horizontal Swipeable Image Gallery */}
        <View style={styles.imageGalleryWrapper}>
          {images.length > 0 ? (
            <ScrollView
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              style={styles.sliderContainer}
              onScroll={(e) => {
                const x = e.nativeEvent.contentOffset.x;
                setCurrentImageIndex(Math.round(x / width));
              }}
              scrollEventThrottle={16}
            >
              {images.map((img, idx) => (
                <TouchableOpacity
                  key={idx}
                  activeOpacity={0.9}
                  onPress={() => setImageExpanded(true)}
                >
                  <Image source={{ uri: img }} style={styles.heroImage} resizeMode="cover" />
                </TouchableOpacity>
              ))}
            </ScrollView>
          ) : (
            <View style={[styles.sliderContainer, styles.noImagePlaceholder]}>
              <Ionicons name="image-outline" size={56} color={Colors.disabled} />
              <Text style={styles.noImageText}>No photo provided for this listing</Text>
            </View>
          )}

          {/* Condition tag over image */}
          <View style={styles.imageConditionBadge}>
            <Text style={styles.imageConditionText}>{product.condition || 'Verified Good'}</Text>
          </View>

          {/* Pagination Dots (Only for multiple images) */}
          {images.length > 1 && (
            <View style={styles.paginationDots}>
              {images.map((_, idx) => (
                <View
                  key={idx}
                  style={[styles.dot, currentImageIndex === idx && styles.dotActive]}
                />
              ))}
            </View>
          )}
        </View>

        {/* Parse Dynamic Category Attributes (Cars, Properties, Mobiles, etc.) */}
        {(() => {
          let rawAttrs = product.attributes || product.rawProduct?.attributes || {};
          if (typeof rawAttrs === 'string') {
            try {
              rawAttrs = JSON.parse(rawAttrs);
            } catch {
              rawAttrs = {};
            }
          }
          const catLower = String(categoryString || '').toLowerCase();
          const isCarListing =
            catLower.includes('car') ||
            catLower.includes('bike') ||
            catLower.includes('vehicle') ||
            Boolean(rawAttrs.kmDriven || rawAttrs.fuel || rawAttrs.transmission);
          const isFashionListing = catLower.includes('fashion') || catLower.includes('apparel') || catLower.includes('cloth');

          // Extract Brand / Model / Variant if combined or individual
          let carBrand = rawAttrs.brand || '';
          let carModel = rawAttrs.model || '';
          let carVariant = rawAttrs.variant || '';
          if ((!carBrand || !carModel) && rawAttrs.brandModelVariant) {
            const parts = String(rawAttrs.brandModelVariant).split('/').map((s) => s.trim());
            if (!carBrand && parts[0]) carBrand = parts[0];
            if (!carModel && parts[1]) carModel = parts[1];
            if (!carVariant && parts[2]) carVariant = parts[2];
          }
          const carYear = rawAttrs.year || '';
          const carFuel = rawAttrs.fuel || '';
          const carKm = rawAttrs.kmDriven
            ? `${Number(String(rawAttrs.kmDriven).replace(/[^0-9]/g, '') || 0).toLocaleString('en-IN')} km`
            : '';
          const carTransmission = rawAttrs.transmission || '';
          const carOwners = rawAttrs.owners
            ? (String(rawAttrs.owners).toLowerCase().includes('owner') ? rawAttrs.owners : `${rawAttrs.owners} Owner`)
            : '';

          return (
            <>
              {/* Title, Variant | Year Subtitle, Price & Key Highlights Card */}
              <View style={styles.titleSection}>
                <Text style={styles.productTitle}>{product.title || product.productName}</Text>
                {(carVariant || carYear) ? (
                  <Text style={styles.carSubtitleText}>
                    {[carVariant, carYear].filter(Boolean).join(' | ')}
                  </Text>
                ) : (
                  <View style={styles.conditionRow}>
                    <Text style={styles.conditionLabel}>Condition:</Text>
                    <View style={styles.conditionPill}>
                      <Text style={styles.conditionValue}>{product.condition || 'Verified Good'}</Text>
                    </View>
                    {categoryString ? (
                      <View style={[styles.conditionPill, { backgroundColor: Colors.sunken, marginLeft: 8 }]}>
                        <Text style={[styles.conditionValue, { color: Colors.textSecondary }]}>{categoryString}</Text>
                      </View>
                    ) : null}
                  </View>
                )}

                <View style={[styles.priceMain, { marginTop: 10 }]}>
                  <Text style={styles.currentPrice}>
                    {numericPrice > 0 ? formatPrice(numericPrice) : (product.formattedPrice || product.price)}
                  </Text>
                  {!isCarListing && (
                    <>
                      <Text style={styles.originalPrice}>
                        {product.originalPrice ? formatPrice(Number(product.originalPrice)) : formatPrice(Math.round(numericPrice > 0 ? numericPrice * 1.25 : 999))}
                      </Text>
                      <View style={styles.discountBadge}>
                        <Text style={styles.discountText}>VERIFIED DEAL</Text>
                      </View>
                    </>
                  )}
                </View>

                {/* Car Key Highlights (2x2 Grid matching Screenshot 5) */}
                {isCarListing && (carFuel || carKm || carTransmission || carOwners) && (
                  <View style={styles.keyHighlightsBox}>
                    <Text style={styles.keyHighlightsHeading}>Key Highlights</Text>
                    <View style={styles.keyHighlightsGrid}>
                      {carFuel ? (
                        <View style={styles.highlightItem}>
                          <Ionicons name="color-fill-outline" size={20} color="#002F34" />
                          <Text style={styles.highlightItemText}>{carFuel}</Text>
                        </View>
                      ) : null}
                      {carKm ? (
                        <View style={styles.highlightItem}>
                          <Ionicons name="speedometer-outline" size={20} color="#002F34" />
                          <Text style={styles.highlightItemText}>{carKm}</Text>
                        </View>
                      ) : null}
                      {carTransmission ? (
                        <View style={styles.highlightItem}>
                          <Ionicons name="git-network-outline" size={20} color="#002F34" />
                          <Text style={styles.highlightItemText}>{carTransmission}</Text>
                        </View>
                      ) : null}
                      {carOwners ? (
                        <View style={styles.highlightItem}>
                          <Ionicons name="person-outline" size={20} color="#002F34" />
                          <Text style={styles.highlightItemText}>{carOwners}</Text>
                        </View>
                      ) : null}
                    </View>
                  </View>
                )}

                {/* Location & Posted Date Row */}
                <View style={styles.locationDateFooter}>
                  <View style={styles.locationContainer}>
                    <Ionicons name="location-outline" size={16} color={Colors.textSecondary} />
                    <Text style={styles.locationText}>{locationString}</Text>
                  </View>
                  <Text style={styles.postedDateText}>{product.dateAdded || 'Today'}</Text>
                </View>
              </View>

              {/* Size & Color Selector Chips (Only for Fashion / Apparel items) */}
              {isFashionListing && (
                <View style={styles.selectorSection}>
                  <View style={styles.selectorHeader}>
                    <Text style={styles.selectorLabel}>Size</Text>
                    <Text style={styles.selectorActiveVal}>{selectedSize}</Text>
                  </View>
                  <View style={styles.chipsRow}>
                    {availableSizes.map((sz) => (
                      <TouchableOpacity
                        key={sz}
                        style={[styles.sizeChip, selectedSize === sz && styles.sizeChipActive]}
                        onPress={() => setSelectedSize(sz)}
                      >
                        <Text style={[styles.sizeChipText, selectedSize === sz && styles.sizeChipTextActive]}>
                          {sz}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  <View style={[styles.selectorHeader, { marginTop: 14 }]}>
                    <Text style={styles.selectorLabel}>Color</Text>
                    <Text style={styles.selectorActiveVal}>{selectedColor}</Text>
                  </View>
                  <View style={styles.chipsRow}>
                    {availableColors.map((col) => (
                      <TouchableOpacity
                        key={col.name}
                        style={[styles.colorChip, selectedColor === col.name && styles.colorChipActive]}
                        onPress={() => setSelectedColor(col.name)}
                      >
                        <View style={[styles.colorDot, { backgroundColor: col.hex }]} />
                        <Text style={[styles.colorChipText, selectedColor === col.name && styles.colorChipTextActive]}>
                          {col.name}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              )}

              {/* Product Information Section (All Dynamic Category Specifications) */}
              <View style={styles.expandableSection}>
                <Text style={[styles.sectionTitle, { fontSize: 16, marginBottom: 8 }]}>Product Information</Text>
                <View style={styles.specsTable}>
                  {carBrand ? (
                    <View style={styles.specRow}>
                      <Text style={styles.specKey}>Brand</Text>
                      <Text style={styles.specVal}>{carBrand}</Text>
                    </View>
                  ) : null}
                  {carModel ? (
                    <View style={styles.specRow}>
                      <Text style={styles.specKey}>Model</Text>
                      <Text style={styles.specVal}>{carModel}</Text>
                    </View>
                  ) : null}
                  {carVariant ? (
                    <View style={styles.specRow}>
                      <Text style={styles.specKey}>Variant</Text>
                      <Text style={styles.specVal}>{carVariant}</Text>
                    </View>
                  ) : null}
                  {carYear ? (
                    <View style={styles.specRow}>
                      <Text style={styles.specKey}>Year</Text>
                      <Text style={styles.specVal}>{carYear}</Text>
                    </View>
                  ) : null}
                  {Object.entries(rawAttrs)
                    .filter(([k, v]) => v && !['brandModelVariant', 'brand', 'model', 'variant', 'year'].includes(k))
                    .map(([k, v]) => (
                      <View key={k} style={styles.specRow}>
                        <Text style={[styles.specKey, { textTransform: 'capitalize' }]}>
                          {k.replace(/([A-Z])/g, ' $1').trim()}
                        </Text>
                        <Text style={styles.specVal}>{String(v)}</Text>
                      </View>
                    ))}
                  <View style={styles.specRow}>
                    <Text style={styles.specKey}>Category</Text>
                    <Text style={styles.specVal}>{categoryString}</Text>
                  </View>
                  <View style={styles.specRow}>
                    <Text style={styles.specKey}>Condition</Text>
                    <Text style={styles.specVal}>{product.condition || 'Good'}</Text>
                  </View>
                  <View style={[styles.specRow, { borderBottomWidth: 0 }]}>
                    <Text style={styles.specKey}>Location</Text>
                    <Text style={styles.specVal}>{locationString}</Text>
                  </View>
                </View>
              </View>

              {/* Description Section (Matching Screenshot 5 with View More / View Less) */}
              <View style={styles.expandableSection}>
                <Text style={[styles.sectionTitle, { fontSize: 16, marginBottom: 8 }]}>Description</Text>
                <Text
                  style={styles.descriptionText}
                  numberOfLines={isDescExpanded ? undefined : 6}
                >
                  {product.description ||
                    `Well-maintained ${product.condition || 'good condition'} ${product.title}. Thoroughly inspected and guaranteed authentic.`}
                </Text>
                <TouchableOpacity onPress={() => setIsDescExpanded(!isDescExpanded)} style={{ marginTop: 8 }}>
                  <Text style={styles.viewMoreLessLink}>
                    {isDescExpanded ? 'View Less' : 'View More'}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Gallery Grid Section (Matching Screenshot 5) */}
              {images.length > 0 && (
                <View style={styles.expandableSection}>
                  <Text style={[styles.sectionTitle, { fontSize: 16, marginBottom: 12 }]}>Gallery</Text>
                  <View style={styles.galleryGridContainer}>
                    {images.map((imgUri, idx) => (
                      <TouchableOpacity
                        key={`gal-${idx}`}
                        style={styles.galleryGridItem}
                        activeOpacity={0.88}
                        onPress={() => {
                          setCurrentImageIndex(idx);
                          setImageExpanded(true);
                        }}
                      >
                        <Image source={{ uri: imgUri }} style={styles.galleryGridImage} resizeMode="cover" />
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              )}
            </>
          );
        })()}

        {/* Verified Seller Card */}
        <View style={styles.sellerSection}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <Text style={styles.sectionTitle}>Seller Profile</Text>
            <TouchableOpacity
              onPress={() =>
                navigation.navigate('SellerProfile', {
                  sellerName: product.sellerName || 'Verified Seller',
                  sellerRating: product.sellerRating || 4.8,
                  sellerLocation: product.location || 'Local'
                })
              }>
              <Text style={{ ...Typography.captionBold, color: '#1548A6', fontSize: 12 }}>View Store &rarr;</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            style={styles.sellerCard}
            activeOpacity={0.85}
            onPress={() =>
              navigation.navigate('SellerProfile', {
                sellerName: product.sellerName || 'Verified Seller',
                sellerRating: product.sellerRating || 4.8,
                sellerLocation: product.location || 'Local'
              })
            }>
            <View style={styles.sellerAvatar}>
              <Ionicons name="person" size={26} color={Colors.white} />
            </View>
            <View style={styles.sellerInfo}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={styles.sellerName}>{product.sellerName || 'Verified Seller'}</Text>
                <Ionicons
                  name="checkmark-circle"
                  size={16}
                  color={Colors.brandGreen}
                  style={{ marginLeft: 4 }}
                />
              </View>
              <View style={styles.sellerStatsRow}>
                <Ionicons name="star" size={13} color="#F59E0B" />
                <Text style={styles.sellerRatingText}>
                  {product.sellerRating || 4.8} Rating
                </Text>
                <View style={styles.statDot} />
                <Text style={styles.sellerStatText}>Member since 2024</Text>
                <View style={styles.statDot} />
                <Text style={styles.sellerStatText}>12 active ads</Text>
              </View>
              <View style={styles.verifiedTag}>
                <Text style={styles.verifiedTagText}>KYC & Phone Verified</Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>

        {/* Trust & Safety Highlights */}
        <View style={styles.trustCard}>
          <View style={styles.trustItem}>
            <Ionicons name="shield-checkmark" size={22} color={Colors.brandGreen} />
            <View style={{ marginLeft: 10, flex: 1 }}>
              <Text style={styles.trustTitle}>BigBazaar Safe-Deal Escrow</Text>
              <Text style={styles.trustSubtitle}>
                Payment held securely until you inspect and receive the item.
              </Text>
            </View>
          </View>
          <View style={[styles.trustItem, { marginTop: 12 }]}>
            <Ionicons name="call-outline" size={22} color={Colors.brandBlue} />
            <View style={{ marginLeft: 10, flex: 1 }}>
              <Text style={styles.trustTitle}>Masked Contact Protection</Text>
              <Text style={styles.trustSubtitle}>
                Your personal phone number is never shared publicly.
              </Text>
            </View>
          </View>
        </View>

        {/* Customer Reviews & Ratings Evaluation Layer */}
        <View style={styles.productReviewsWrapper}>
          <View style={styles.reviewsHeaderRow}>
            <Text style={styles.sectionTitle}>Buyer Ratings & Reviews</Text>
            <TouchableOpacity
              onPress={() => setReviewModalOpen((v) => !v)}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: '#EFF6FF',
                paddingHorizontal: 10,
                paddingVertical: 5,
                borderRadius: 999,
                borderWidth: 1,
                borderColor: '#BFDBFE'
              }}
            >
              <Ionicons name="create-outline" size={14} color="#1548A6" />
              <Text style={{ fontSize: 11.5, fontWeight: '700', color: '#1548A6', marginLeft: 4 }}>
                {reviewModalOpen ? 'Close' : 'Write Review'}
              </Text>
            </TouchableOpacity>
          </View>

          {reviewModalOpen && (
            <View
              style={{
                marginTop: 10,
                marginBottom: 14,
                padding: 14,
                borderRadius: 12,
                backgroundColor: '#F8FAFC',
                borderWidth: 1,
                borderColor: '#E2E8F0'
              }}
            >
              <Text style={{ fontSize: 13, fontWeight: '700', color: '#002F34', marginBottom: 8 }}>
                Rate this listing (1–5 Stars)
              </Text>
              <View style={{ flexDirection: 'row', gap: 8, marginBottom: 12 }}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <TouchableOpacity
                    key={star}
                    onPress={() => setNewReviewRating(star)}
                    style={{
                      paddingHorizontal: 10,
                      paddingVertical: 6,
                      borderRadius: 8,
                      backgroundColor: newReviewRating >= star ? '#FEF3C7' : '#FFFFFF',
                      borderWidth: 1,
                      borderColor: newReviewRating >= star ? '#F59E0B' : '#CBD5E1'
                    }}
                  >
                    <Text style={{ fontSize: 13, fontWeight: '700', color: '#B45309' }}>
                      {star} ★
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              <TextInput
                value={newReviewComment}
                onChangeText={setNewReviewComment}
                placeholder="Share your experience with the item and seller..."
                placeholderTextColor="#94A3B8"
                multiline
                style={{
                  backgroundColor: '#FFFFFF',
                  borderWidth: 1,
                  borderColor: '#CBD5E1',
                  borderRadius: 8,
                  padding: 10,
                  minHeight: 72,
                  fontSize: 13,
                  color: '#002F34',
                  textAlignVertical: 'top',
                  marginBottom: 10
                }}
              />
              <TouchableOpacity
                onPress={handleSubmitProductReview}
                disabled={submittingReview}
                style={{
                  backgroundColor: '#1548A6',
                  borderRadius: 8,
                  paddingVertical: 10,
                  alignItems: 'center'
                }}
              >
                <Text style={{ color: '#FFFFFF', fontWeight: '700', fontSize: 13 }}>
                  {submittingReview ? 'Submitting...' : 'Submit Verified Review'}
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {hasProductReviews ? (
            <View style={styles.reviewsContent}>
              {/* Score & Histogram Box */}
              <View style={styles.ratingScoreRow}>
                <View style={styles.scoreOverview}>
                  <Text style={styles.bigRatingText}>{product.rating || '4.8'}</Text>
                  <View style={styles.starsRow}>
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Ionicons key={s} name="star" size={13} color="#F59E0B" />
                    ))}
                  </View>
                  <Text style={styles.totalRatingsCount}>{product.reviews || 8} verified ratings</Text>
                </View>

                {/* Histogram Bars */}
                <View style={styles.histogramCol}>
                  {[
                    { stars: 5, pct: '75%', count: 6 },
                    { stars: 4, pct: '15%', count: 1 },
                    { stars: 3, pct: '10%', count: 1 },
                    { stars: 2, pct: '0%', count: 0 },
                    { stars: 1, pct: '0%', count: 0 }
                  ].map((bar) => (
                    <View key={bar.stars} style={styles.histogramRow}>
                      <Text style={styles.histStarLabel}>{bar.stars}★</Text>
                      <View style={styles.histTrack}>
                        <View style={[styles.histFill, { width: bar.pct }]} />
                      </View>
                      <Text style={styles.histCount}>{bar.count}</Text>
                    </View>
                  ))}
                </View>
              </View>

              {/* Review Cards List */}
              <View style={styles.reviewCardsWrapper}>
                {productReviewsList.map((rev) => (
                  <View key={rev.id} style={styles.reviewItemCard}>
                    <View style={styles.revCardHeader}>
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Text style={styles.revAuthor}>{rev.author}</Text>
                        {rev.verified && (
                          <View style={styles.revVerifiedPill}>
                            <Ionicons name="checkmark-circle" size={11} color={Colors.brandGreen} />
                            <Text style={styles.revVerifiedText}>Verified Buyer</Text>
                          </View>
                        )}
                      </View>
                      <Text style={styles.revDate}>{rev.date}</Text>
                    </View>

                    <View style={styles.starsRow}>
                      {[...Array(rev.rating)].map((_, i) => (
                        <Ionicons key={i} name="star" size={12} color="#F59E0B" />
                      ))}
                    </View>

                    <Text style={styles.revComment}>"{rev.text}"</Text>

                    <View style={styles.revHelpfulRow}>
                      <TouchableOpacity style={styles.revHelpfulBtn} onPress={() => Alert.alert('Helpful', 'Thank you for your feedback!')}>
                        <Ionicons name="thumbs-up-outline" size={12} color={Colors.textSecondary} />
                        <Text style={styles.revHelpfulText}>Helpful ({rev.helpfulCount})</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          ) : (
            <View style={styles.zeroReviewsBox}>
              <Ionicons name="chatbubble-ellipses-outline" size={32} color={Colors.disabled} />
              <Text style={styles.zeroReviewsTitle}>No reviews yet</Text>
              <Text style={styles.zeroReviewsSubtitle}>
                Be the first verified buyer to review this item after physical inspection.
              </Text>
            </View>
          )}
        </View>

        {/* Report Listing */}
        <View style={{ paddingHorizontal: Spacing.lg, marginVertical: Spacing.sm }}>
          <TouchableOpacity style={styles.reportBtn} onPress={handleReport}>
            <Ionicons name="flag-outline" size={16} color={Colors.textSecondary} />
            <Text style={styles.reportBtnText}>Report this listing</Text>
          </TouchableOpacity>
        </View>

        {/* Related Items Horizontal Slider */}
        {relatedProducts.length > 0 && (
          <View style={styles.relatedSection}>
            <View style={styles.relatedHeader}>
              <View>
                <Text style={styles.sectionTitle}>Similar Items</Text>
                <Text style={styles.relatedHint}>In {product.category || 'Marketplace'}</Text>
              </View>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.relatedScroll}
            >
              {relatedProducts.map((item) => {
                const isItemSaved = watchlist.includes(item.id);
                return (
                  <TouchableOpacity
                    key={item.id}
                    style={styles.relatedCard}
                    onPress={() => navigation.push('ProductDetails', { product: item.rawProduct || item })}
                    activeOpacity={0.92}
                  >
                    <View style={styles.relatedImageWrapper}>
                      {item.imageUrl ? (
                        <Image source={{ uri: item.imageUrl }} style={styles.relatedImage} resizeMode="cover" />
                      ) : (
                        <View style={[styles.relatedImage, styles.relatedImagePlaceholder]}>
                          <Ionicons name="bag-handle-outline" size={32} color={Colors.disabled} />
                        </View>
                      )}
                      <View style={styles.similarBadge}>
                        <Ionicons name="sparkles" size={10} color="#FFFFFF" style={{ marginRight: 3 }} />
                        <Text style={styles.similarBadgeText}>SIMILAR</Text>
                      </View>
                      <TouchableOpacity
                        style={styles.relatedHeartBtn}
                        onPress={() => {
                          requireAuth(navigation, () => {
                            toggleWatchlist(item.id);
                          });
                        }}
                        activeOpacity={0.8}
                      >
                        <Ionicons
                          name={isItemSaved ? 'heart' : 'heart-outline'}
                          size={17}
                          color={isItemSaved ? '#E11D48' : '#002F34'}
                        />
                      </TouchableOpacity>
                    </View>
                    <View style={styles.relatedBody}>
                      <Text style={styles.relatedPrice}>{displayPrice(item.price)}</Text>
                      <Text style={styles.relatedTitle} numberOfLines={1}>{item.title}</Text>
                      <View style={styles.relatedSubtitleWrapper}>
                        <Text style={styles.relatedSubtitle} numberOfLines={1}>
                          {item.category || product.category || 'Similar Deal'}
                        </Text>
                      </View>
                      <View style={styles.relatedFooter}>
                        <View style={styles.relatedLocationBox}>
                          <Ionicons name="location-outline" size={11} color="#7F9799" style={{ marginRight: 2 }} />
                          <Text style={styles.relatedLocationText} numberOfLines={1}>{item.location || 'Indore'}</Text>
                        </View>
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        )}

        {/* More from this Seller */}
        {sellerProducts.length > 0 && (
          <View style={[styles.relatedSection, { marginTop: Spacing.md }]}>
            <View style={styles.relatedHeader}>
              <View>
                <Text style={styles.sectionTitle}>More from this Seller</Text>
                <Text style={styles.relatedHint}>From {product.sellerName || 'Verified Seller'}</Text>
              </View>
              <TouchableOpacity
                onPress={() =>
                  navigation.navigate('SellerProfile', {
                    sellerName: product.sellerName || 'Verified Seller',
                    sellerRating: product.sellerRating || 5.0,
                    sellerLocation: product.location || 'Local'
                  })
                }>
                <Text style={{ ...Typography.captionBold, color: '#1548A6', fontSize: 12 }}>View store &rarr;</Text>
              </TouchableOpacity>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.relatedScroll}
            >
              {sellerProducts.map((item) => {
                const isItemSaved = watchlist.includes(item.id);
                return (
                  <TouchableOpacity
                    key={item.id}
                    style={styles.relatedCard}
                    onPress={() => navigation.push('ProductDetails', { product: item.rawProduct || item })}
                    activeOpacity={0.92}
                  >
                    <View style={styles.relatedImageWrapper}>
                      {item.imageUrl ? (
                        <Image source={{ uri: item.imageUrl }} style={styles.relatedImage} resizeMode="cover" />
                      ) : (
                        <View style={[styles.relatedImage, styles.relatedImagePlaceholder]}>
                          <Ionicons name="bag-handle-outline" size={32} color={Colors.disabled} />
                        </View>
                      )}
                      <View style={styles.sellerBadgeOverlay}>
                        <Ionicons name="shield-checkmark" size={10} color="#FFFFFF" style={{ marginRight: 3 }} />
                        <Text style={styles.sellerBadgeText}>VERIFIED</Text>
                      </View>
                      <TouchableOpacity
                        style={styles.relatedHeartBtn}
                        onPress={() => {
                          requireAuth(navigation, () => {
                            toggleWatchlist(item.id);
                          });
                        }}
                        activeOpacity={0.8}
                      >
                        <Ionicons
                          name={isItemSaved ? 'heart' : 'heart-outline'}
                          size={17}
                          color={isItemSaved ? '#E11D48' : '#002F34'}
                        />
                      </TouchableOpacity>
                    </View>
                    <View style={styles.relatedBody}>
                      <Text style={styles.relatedPrice}>{displayPrice(item.price)}</Text>
                      <Text style={styles.relatedTitle} numberOfLines={1}>{item.title}</Text>
                      <View style={styles.relatedSubtitleWrapper}>
                        <Text style={styles.relatedSubtitle} numberOfLines={1}>
                          {product.sellerName || 'Verified Seller'}
                        </Text>
                      </View>
                      <View style={styles.relatedFooter}>
                        <View style={styles.relatedLocationBox}>
                          <Ionicons name="location-outline" size={11} color="#7F9799" style={{ marginRight: 2 }} />
                          <Text style={styles.relatedLocationText} numberOfLines={1}>{item.location || 'Indore'}</Text>
                        </View>
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        )}

        <View style={{ height: 160 }} />
      </ScrollView>

      {/* Sticky Bottom Action Bar with Clean Hierarchy */}
      <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        {/* Tier 1: Secondary Actions */}
        <View style={styles.secondaryActionsRow}>
          <TouchableOpacity
            style={styles.chatActionBtn}
            onPress={handleChat}
            accessibilityLabel="Chat with Seller">
            <Ionicons name="chatbubble-ellipses-outline" size={15} color={Colors.brandBlue} />
            <Text style={styles.chatActionText}>Chat Seller</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.offerActionBtn}
            onPress={handleMakeOffer}
            accessibilityLabel="Make an offer">
            <Ionicons name="pricetag-outline" size={15} color="#D97706" />
            <Text style={styles.offerActionText}>Make Offer</Text>
          </TouchableOpacity>
        </View>

        {/* Tier 2: Primary Commerce Actions */}
        <View style={styles.primaryActionsRow}>
          <TouchableOpacity
            style={styles.addCartBtn}
            onPress={handleAddToCart}
            accessibilityLabel="Add to Bucket">
            <Ionicons name="basket-outline" size={18} color={Colors.primary} />
            <Text style={styles.addCartBtnText}>Add to Bucket</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.buyNowBtn}
            onPress={handleBuyNow}
            accessibilityLabel="Buy Now">
            <Ionicons name="flash" size={16} color={Colors.white} style={{ marginRight: 5 }} />
            <Text style={styles.buyNowBtnText}>Buy Now</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Fullscreen Image Modal */}
      <Modal
        visible={imageExpanded}
        transparent
        animationType="fade"
        onRequestClose={() => setImageExpanded(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeaderRow}>
            <View style={{ flex: 1 }} />
            <TouchableOpacity
              style={styles.modalCloseBtn}
              onPress={() => setImageExpanded(false)}
            >
              <Ionicons name="close" size={24} color={Colors.white} />
            </TouchableOpacity>
          </View>
          <View style={styles.modalImageWrapper}>
            <ScrollView
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onScroll={(e) => {
                const x = e.nativeEvent.contentOffset.x;
                setCurrentImageIndex(Math.round(x / width));
              }}
              scrollEventThrottle={16}
            >
              {images.map((img, idx) => (
                <View
                  key={idx}
                  style={{ width, justifyContent: 'center', alignItems: 'center' }}
                >
                  <Image source={{ uri: img }} style={styles.modalMainImage} resizeMode="contain" />
                </View>
              ))}
            </ScrollView>
          </View>
        </SafeAreaView>
      </Modal>

      {/* Make Offer Modal */}
      <Modal
        visible={offerModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setOfferModalVisible(false)}
      >
        <View style={styles.offerOverlay}>
          <View style={styles.offerSheet}>
            <View style={styles.offerSheetHeader}>
              <Text style={styles.offerTitle}>Make an Offer</Text>
              <TouchableOpacity onPress={() => setOfferModalVisible(false)}>
                <Ionicons name="close" size={22} color={Colors.textSecondary} />
              </TouchableOpacity>
            </View>
            <Text style={styles.offerSubtitle}>
              Suggest a fair price for "{product.title}".
            </Text>
            <View style={styles.offerInputWrap}>
              <Text style={styles.currency}>{currencySymbol}</Text>
              <TextInput
                value={offerAmount}
                onChangeText={setOfferAmount}
                keyboardType="numeric"
                placeholder="Enter offer price"
                placeholderTextColor={Colors.disabled}
                style={styles.offerInput}
              />
            </View>

            {/* Quick discount chips */}
            <View style={styles.quickOfferRow}>
              {[0.95, 0.9, 0.85].map((pct, idx) => {
                const calculated = Math.round(numericPrice * pct);
                return (
                  <TouchableOpacity
                    key={idx}
                    style={styles.quickOfferBtn}
                    onPress={() => setOfferAmount(String(calculated))}
                  >
                    <Text style={styles.quickOfferText}>
                      {currencySymbol}{calculated.toLocaleString()} ({-Math.round((1 - pct) * 100)}%)
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <TouchableOpacity style={styles.submitOfferBtn} onPress={submitOffer}>
              <Text style={styles.submitOfferText}>Send Offer to Seller</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScreenContainer>
  );
};

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
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.card,
    borderBottomWidth: 1,
    borderBottomColor: Colors.hairline
  },
  headerBtn: {
    padding: Spacing.xs
  },
  headerTitle: {
    ...Typography.heading2,
    fontSize: 16,
    color: Colors.textPrimary,
    maxWidth: '60%',
    fontWeight: '700'
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  headerCartBadge: {
    position: 'absolute',
    top: -2,
    right: -4,
    backgroundColor: Colors.terracotta,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3
  },
  headerCartBadgeText: {
    color: Colors.card,
    fontSize: 9,
    fontWeight: '800'
  },
  feedbackBannerContainer: {
    position: 'absolute',
    top: 54,
    left: 16,
    right: 16,
    zIndex: 999
  },
  feedbackCard: {
    backgroundColor: Colors.navy,
    borderRadius: Radii.card,
    padding: 12,
    shadowColor: Colors.textPrimary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: 1,
    borderColor: Colors.navy
  },
  feedbackTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10
  },
  feedbackCheckCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.emerald,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10
  },
  feedbackCopy: {
    flex: 1
  },
  feedbackTitle: {
    ...Typography.bodyBold,
    color: Colors.card,
    fontSize: 13
  },
  feedbackSub: {
    ...Typography.caption,
    color: Colors.sunken,
    fontSize: 11,
    marginTop: 1
  },
  feedbackCloseBtn: {
    padding: 4
  },
  feedbackActionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8
  },
  continueShoppingBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Radii.control,
    backgroundColor: 'rgba(251, 251, 250, 0.15)'
  },
  continueShoppingText: {
    ...Typography.captionBold,
    color: Colors.card,
    fontSize: 11
  },
  goToBucketBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: Radii.control,
    backgroundColor: Colors.terracotta
  },
  goToBucketText: {
    ...Typography.captionBold,
    color: Colors.card,
    fontSize: 11
  },
  content: {
    flex: 1
  },
  imageGalleryWrapper: {
    position: 'relative',
    backgroundColor: Colors.sunken
  },
  sliderContainer: {
    width,
    height: width * 0.85
  },
  noImagePlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.sunken
  },
  noImageText: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginTop: 8
  },
  heroImage: {
    width,
    height: width * 0.85
  },
  imageConditionBadge: {
    position: 'absolute',
    top: 14,
    left: 14,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.hairline,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radii.xs
  },
  imageConditionText: {
    color: Colors.emerald,
    fontSize: 10,
    fontWeight: '700'
  },
  paginationDots: {
    position: 'absolute',
    bottom: 12,
    alignSelf: 'center',
    flexDirection: 'row'
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(251, 251, 250, 0.5)',
    marginHorizontal: 3
  },
  dotActive: {
    backgroundColor: Colors.card,
    width: 16
  },
  priceSection: {
    backgroundColor: Colors.card,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: Colors.hairline
  },
  priceMain: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  currentPrice: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginRight: 10,
    fontVariant: ['tabular-nums']
  },
  originalPrice: {
    fontSize: 14,
    color: Colors.metadata,
    textDecorationLine: 'line-through',
    marginRight: 8,
    fontVariant: ['tabular-nums']
  },
  discountBadge: {
    backgroundColor: Colors.sunken,
    borderWidth: 1,
    borderColor: Colors.hairline,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: Radii.xs
  },
  discountText: {
    color: Colors.emerald,
    fontSize: 10,
    fontWeight: '700'
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4
  },
  locationText: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginLeft: 4,
    fontSize: 12
  },
  taxInclusiveText: {
    fontSize: 11,
    color: Colors.emerald,
    fontWeight: '600',
    marginTop: 4
  },
  selectorSection: {
    backgroundColor: Colors.card,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.hairline
  },
  selectorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8
  },
  selectorLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textPrimary
  },
  selectorActiveVal: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.terracotta
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8
  },
  sizeChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: Radii.control,
    backgroundColor: Colors.sunken,
    borderWidth: 1,
    borderColor: Colors.hairline,
    minWidth: 42,
    alignItems: 'center'
  },
  sizeChipActive: {
    backgroundColor: Colors.terracotta,
    borderColor: Colors.terracotta
  },
  sizeChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textPrimary
  },
  sizeChipTextActive: {
    color: Colors.card,
    fontWeight: '700'
  },
  colorChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: Radii.control,
    backgroundColor: Colors.sunken,
    borderWidth: 1,
    borderColor: Colors.hairline,
    gap: 6
  },
  colorChipActive: {
    borderColor: Colors.terracotta,
    backgroundColor: Colors.card
  },
  colorDot: {
    width: 12,
    height: 12,
    borderRadius: 6
  },
  colorChipText: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.textPrimary
  },
  colorChipTextActive: {
    fontWeight: '700',
    color: Colors.terracotta
  },
  titleSection: {
    backgroundColor: Colors.card,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.hairline
  },
  productTitle: {
    ...Typography.heading2,
    fontSize: 18,
    color: '#002F34',
    marginTop: 2,
    fontWeight: '700'
  },
  carSubtitleText: {
    fontSize: 13,
    color: '#406367',
    marginTop: 4,
    fontWeight: '500'
  },
  keyHighlightsBox: {
    marginTop: 14,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: Colors.hairline
  },
  keyHighlightsHeading: {
    fontSize: 15,
    fontWeight: '700',
    color: '#002F34',
    marginBottom: 12
  },
  keyHighlightsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    rowGap: 14
  },
  highlightItem: {
    width: '50%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingRight: 8
  },
  highlightItemText: {
    fontSize: 13,
    color: '#002F34',
    fontWeight: '500'
  },
  locationDateFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.hairline
  },
  postedDateText: {
    fontSize: 12,
    color: '#406367',
    fontWeight: '500'
  },
  conditionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6
  },
  conditionLabel: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginRight: 6
  },
  conditionPill: {
    backgroundColor: Colors.sunken,
    borderWidth: 1,
    borderColor: Colors.hairline,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: Radii.xs
  },
  conditionValue: {
    ...Typography.captionBold,
    color: Colors.textPrimary,
    fontSize: 11
  },
  expandableSection: {
    backgroundColor: Colors.card,
    marginTop: Spacing.xs,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.hairline
  },
  expandableHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6
  },
  sectionTitle: {
    ...Typography.bodyBold,
    fontSize: 14,
    fontWeight: '700',
    color: '#002F34'
  },
  descriptionText: {
    ...Typography.body,
    fontSize: 13.5,
    color: '#002F34',
    lineHeight: 20
  },
  readMoreText: {
    ...Typography.captionBold,
    color: Colors.terracotta,
    fontSize: 12
  },
  viewMoreLessLink: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#1548A6',
    textDecorationLine: 'underline'
  },
  galleryGridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10
  },
  galleryGridItem: {
    width: (width - Spacing.lg * 2 - 10) / 2,
    height: ((width - Spacing.lg * 2 - 10) / 2) * 0.78,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: Colors.hairline
  },
  galleryGridImage: {
    width: '100%',
    height: '100%'
  },
  specsTable: {
    marginTop: 4
  },
  specRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 9,
    borderBottomWidth: 1,
    borderBottomColor: Colors.hairline
  },
  specKey: {
    ...Typography.caption,
    color: '#406367',
    fontSize: 13.5
  },
  specVal: {
    ...Typography.captionBold,
    color: '#002F34',
    fontSize: 13.5,
    fontWeight: '600'
  },
  sellerSection: {
    backgroundColor: Colors.card,
    marginTop: Spacing.xs,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.hairline
  },
  sellerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    backgroundColor: Colors.sunken,
    padding: Spacing.md,
    borderRadius: Radii.card,
    borderWidth: 1,
    borderColor: Colors.hairline
  },
  sellerAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.navy,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12
  },
  sellerInfo: {
    flex: 1
  },
  sellerName: {
    ...Typography.bodyBold,
    fontSize: 14,
    color: Colors.textPrimary
  },
  sellerStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 3
  },
  sellerRatingText: {
    ...Typography.captionBold,
    fontSize: 11,
    color: Colors.textPrimary,
    marginLeft: 3,
    fontVariant: ['tabular-nums']
  },
  statDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: Colors.hairline,
    marginHorizontal: 6
  },
  sellerStatText: {
    ...Typography.caption,
    fontSize: 11,
    color: Colors.textSecondary
  },
  verifiedTag: {
    backgroundColor: Colors.sunken,
    borderWidth: 1,
    borderColor: Colors.hairline,
    alignSelf: 'flex-start',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: Radii.xs,
    marginTop: 4
  },
  verifiedTagText: {
    color: Colors.emerald,
    fontSize: 10,
    fontWeight: '700'
  },
  trustCard: {
    backgroundColor: Colors.card,
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.md,
    borderRadius: Radii.card,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.hairline,
    ...Shadows.subtle
  },
  trustItem: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  trustTitle: {
    ...Typography.bodyBold,
    fontSize: 13,
    color: Colors.textPrimary
  },
  trustSubtitle: {
    ...Typography.caption,
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2
  },
  reportBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10
  },
  reportBtnText: {
    ...Typography.caption,
    color: Colors.crimson,
    marginLeft: 6,
    fontSize: 12
  },
  relatedSection: {
    backgroundColor: '#FFFFFF',
    marginTop: Spacing.xs,
    paddingVertical: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: '#EDEDED'
  },
  relatedHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.sm
  },
  relatedHint: {
    ...Typography.caption,
    color: '#7F9799',
    marginTop: 2
  },
  relatedScroll: {
    paddingHorizontal: Spacing.lg,
    gap: 10
  },
  relatedCard: {
    width: 172,
    backgroundColor: '#FFFFFF',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#CFD6D9',
    overflow: 'hidden',
    marginRight: 10,
    marginBottom: 4
  },
  relatedImageWrapper: {
    width: '100%',
    height: 140,
    backgroundColor: '#F1F5F9',
    position: 'relative',
    overflow: 'hidden'
  },
  relatedImage: {
    width: '100%',
    height: 140
  },
  relatedImagePlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F1F5F9'
  },
  similarBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: '#7C3AED',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderBottomLeftRadius: 6,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 10
  },
  similarBadgeText: {
    color: '#FFFFFF',
    fontSize: 9.5,
    fontWeight: '800',
    letterSpacing: 0.5
  },
  sellerBadgeOverlay: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: '#059669',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderBottomLeftRadius: 6,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 10
  },
  sellerBadgeText: {
    color: '#FFFFFF',
    fontSize: 9.5,
    fontWeight: '800',
    letterSpacing: 0.5
  },
  relatedHeartBtn: {
    position: 'absolute',
    top: 28,
    right: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    zIndex: 9
  },
  relatedBody: {
    padding: 8
  },
  relatedPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: '#002F34',
    marginBottom: 2,
    lineHeight: 20
  },
  relatedTitle: {
    fontSize: 12,
    fontWeight: '500',
    color: '#002F34',
    marginBottom: 2,
    lineHeight: 16
  },
  relatedSubtitleWrapper: {
    height: 16,
    justifyContent: 'center',
    marginBottom: 2
  },
  relatedSubtitle: {
    fontSize: 11,
    color: '#7F9799'
  },
  relatedFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 28,
    marginTop: 2
  },
  relatedLocationBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 4
  },
  relatedLocationText: {
    fontSize: 10,
    color: '#7F9799',
    fontWeight: '500'
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.card,
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.sm,
    paddingBottom: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.hairline,
    ...Shadows.floating
  },
  secondaryActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
    gap: Spacing.sm
  },
  chatActionBtn: {
    flex: 1,
    height: 36,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.sunken,
    borderRadius: Radii.control,
    borderWidth: 1,
    borderColor: Colors.hairline
  },
  chatActionText: {
    ...Typography.captionBold,
    fontSize: 12,
    color: Colors.navy,
    marginLeft: 4
  },
  offerActionBtn: {
    flex: 1,
    height: 36,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.sunken,
    borderRadius: Radii.control,
    borderWidth: 1,
    borderColor: Colors.hairline
  },
  offerActionText: {
    ...Typography.captionBold,
    fontSize: 12,
    color: Colors.terracotta,
    marginLeft: 4
  },
  primaryActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm
  },
  addCartBtn: {
    flex: 1,
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.card,
    borderRadius: Radii.button,
    borderWidth: 1,
    borderColor: Colors.hairline
  },
  addCartBtnText: {
    ...Typography.bodyBold,
    color: Colors.navy,
    fontSize: 13,
    marginLeft: 6
  },
  buyNowBtn: {
    flex: 1.25,
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.terracotta,
    borderRadius: Radii.button,
    ...Shadows.subtle
  },
  buyNowBtnText: {
    ...Typography.button,
    color: Colors.card,
    fontSize: 14
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(28, 25, 23, 0.95)'
  },
  modalHeaderRow: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm
  },
  modalCloseBtn: {
    padding: Spacing.xs
  },
  modalImageWrapper: {
    flex: 1,
    justifyContent: 'center'
  },
  modalMainImage: {
    width: '100%',
    height: '80%'
  },
  offerOverlay: {
    flex: 1,
    backgroundColor: Colors.overlay,
    justifyContent: 'flex-end'
  },
  offerSheet: {
    backgroundColor: Colors.card,
    borderTopLeftRadius: Radii.sheet,
    borderTopRightRadius: Radii.sheet,
    padding: Spacing.lg,
    paddingBottom: Spacing.xxl,
    borderTopWidth: 1,
    borderTopColor: Colors.hairline,
    ...Shadows.sheet
  },
  offerSheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  offerTitle: {
    ...Typography.heading2,
    fontSize: 17,
    color: Colors.textPrimary
  },
  offerSubtitle: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginTop: 4,
    marginBottom: Spacing.md
  },
  offerInputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.sunken,
    borderRadius: Radii.input,
    paddingHorizontal: Spacing.md,
    height: 48,
    borderWidth: 1,
    borderColor: Colors.hairline
  },
  currency: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginRight: 8
  },
  offerInput: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
    fontVariant: ['tabular-nums']
  },
  quickOfferRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: Spacing.md,
    gap: 6
  },
  quickOfferBtn: {
    flex: 1,
    backgroundColor: Colors.sunken,
    borderWidth: 1,
    borderColor: Colors.hairline,
    paddingVertical: 8,
    borderRadius: Radii.control,
    alignItems: 'center'
  },
  quickOfferText: {
    ...Typography.captionBold,
    fontSize: 10,
    color: Colors.navy,
    fontVariant: ['tabular-nums']
  },
  submitOfferBtn: {
    backgroundColor: Colors.terracotta,
    paddingVertical: 12,
    borderRadius: Radii.button,
    alignItems: 'center',
    marginTop: Spacing.xs,
    ...Shadows.subtle
  },
  submitOfferText: {
    ...Typography.button,
    color: Colors.card,
    fontSize: 14
  },
  productReviewsWrapper: {
    paddingHorizontal: Spacing.base,
    marginTop: Spacing.md
  },
  reviewsHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm
  },
  verifiedCountBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.sunken,
    borderWidth: 1,
    borderColor: Colors.hairline,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radii.badge,
    gap: 4
  },
  verifiedCountText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.emerald
  },
  reviewsContent: {
    backgroundColor: Colors.card,
    borderRadius: Radii.card,
    borderWidth: 1,
    borderColor: Colors.hairline,
    padding: Spacing.base
  },
  ratingScoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.hairline
  },
  scoreOverview: {
    alignItems: 'center',
    paddingRight: Spacing.lg,
    borderRightWidth: 1,
    borderRightColor: Colors.hairline
  },
  bigRatingText: {
    ...Typography.h1,
    fontSize: 28,
    color: Colors.textPrimary,
    fontWeight: '700',
    fontVariant: ['tabular-nums']
  },
  starsRow: {
    flexDirection: 'row',
    gap: 2,
    marginVertical: 4
  },
  totalRatingsCount: {
    ...Typography.caption,
    color: Colors.metadata,
    fontSize: 10,
    fontVariant: ['tabular-nums']
  },
  histogramCol: {
    flex: 1,
    paddingLeft: Spacing.md,
    gap: 4
  },
  histogramRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  histStarLabel: {
    ...Typography.caption,
    fontSize: 10,
    color: Colors.textSecondary,
    width: 20
  },
  histTrack: {
    flex: 1,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: Colors.sunken,
    overflow: 'hidden'
  },
  histFill: {
    height: '100%',
    backgroundColor: Colors.terracotta,
    borderRadius: 2.5
  },
  histCount: {
    ...Typography.caption,
    fontSize: 10,
    color: Colors.metadata,
    width: 14,
    textAlign: 'right',
    fontVariant: ['tabular-nums']
  },
  reviewCardsWrapper: {
    marginTop: Spacing.md,
    gap: Spacing.sm
  },
  reviewItemCard: {
    backgroundColor: Colors.sunken,
    borderRadius: Radii.control,
    padding: 10,
    borderWidth: 1,
    borderColor: Colors.hairline
  },
  revCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  revAuthor: {
    ...Typography.bodyBold,
    fontSize: 12,
    color: Colors.textPrimary
  },
  revVerifiedPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.hairline,
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: Radii.xs,
    marginLeft: 6,
    gap: 2
  },
  revVerifiedText: {
    fontSize: 9,
    fontWeight: '700',
    color: Colors.emerald
  },
  revDate: {
    ...Typography.caption,
    fontSize: 10,
    color: Colors.metadata
  },
  revComment: {
    ...Typography.body,
    fontSize: 11,
    color: Colors.textSecondary,
    fontStyle: 'italic',
    marginTop: 4
  },
  revHelpfulRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 6
  },
  revHelpfulBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4
  },
  revHelpfulText: {
    ...Typography.caption,
    fontSize: 10,
    color: Colors.metadata,
    fontVariant: ['tabular-nums']
  },
  zeroReviewsBox: {
    backgroundColor: Colors.card,
    borderRadius: Radii.card,
    borderWidth: 1,
    borderColor: Colors.hairline,
    padding: Spacing.lg,
    alignItems: 'center'
  },
  zeroReviewsTitle: {
    ...Typography.bodyBold,
    fontSize: 13,
    color: Colors.textPrimary,
    marginTop: 6
  },
  zeroReviewsSubtitle: {
    ...Typography.secondary,
    fontSize: 11,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 2
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl
  },
  errorText: {
    ...Typography.body,
    color: Colors.textSecondary,
    marginVertical: Spacing.md
  },
  backButton: {
    backgroundColor: Colors.navy,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: Radii.button
  },
  backButtonText: {
    color: Colors.card,
    fontWeight: '700'
  }
});

export default ProductDetailsScreen;
