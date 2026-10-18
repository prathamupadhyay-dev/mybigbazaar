import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  StatusBar
} from 'react-native';
import ScreenContainer from '../../components/ScreenContainer';
import { useApp } from '../../context/AppContext';
import ServiceItemCard from '../../components/home/ServiceItemCard';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { getProductsApi, formatProductSubtitle } from '../../services/productApi';
import { API_BASE_URL } from '../../services/apiClient';

export default function WatchlistScreen() {
  const { watchlist, toggleWatchlist } = useApp();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const [undoItem, setUndoItem] = useState(null);
  const [liveProducts, setLiveProducts] = useState([]);

  useEffect(() => {
    let isMounted = true;
    getProductsApi()
      .then((prods) => {
        if (isMounted && Array.isArray(prods)) {
          const base = (API_BASE_URL || '').replace(/\/+$/, '');
          setLiveProducts(
            prods.map((p) => ({
              ...p,
              id: p._id || p.id,
              title: p.productName || p.title,
              price: p.price || p.productPrice || 0,
              originalPrice: p.originalPrice || p.productPrice || null,
              subtitle: p.subtitle || formatProductSubtitle(p),
              location: p.location || 'India',
              imageUrl:
                Array.isArray(p.images) && p.images[0]
                  ? p.images[0].startsWith('http') || p.images[0].startsWith('data:')
                    ? p.images[0]
                    : `${base}${p.images[0].startsWith('/') ? '' : '/'}${p.images[0]}`
                  : p.image || null,
              rating: 4.8,
              reviews: 0,
              category: p.category || 'General',
              itemType: 'product'
            }))
          );
        }
      })
      .catch(() => {});
    return () => { isMounted = false; };
  }, []);

  const handlePress = (item) => {
    if (item.itemType === 'product') {
      const numericPrice = parseFloat(String(item.price).replace(/[^0-9.]/g, '')) || 0;
      navigation.navigate('ProductDetails', {
        product: {
          ...item,
          originalPrice: item.originalPrice || '₹' + Math.round(numericPrice * 1.15),
          condition: item.condition || 'Used - good condition',
          sellerName: item.sellerName || 'Local Seller',
          sellerRating: item.sellerRating || 5.0,
          rating: item.rating || 5.0,
          reviews: item.reviews || 0,
          location: item.location || 'India'
        }
      });
    } else {
      navigation.navigate('ServiceDetails', { item });
    }
  };

  const handleRemove = (item) => {
    toggleWatchlist(item.id);
    setUndoItem(item);
    setTimeout(() => {
      setUndoItem((current) => (current && current.id === item.id ? null : current));
    }, 4000);
  };

  const handleUndo = () => {
    if (undoItem) {
      toggleWatchlist(undoItem.id);
      setUndoItem(null);
    }
  };

  const savedItems = useMemo(() => {
    return liveProducts.filter((item) => (watchlist || []).includes(item.id));
  }, [watchlist, liveProducts]);

  // Clicking Discover redirects to homepage
  const handleDiscover = () => {
    navigation.navigate('Main', { screen: 'Home' });
  };

  // 3 Overlapping Hearts Graphic matching media_1791318313629.jpg
  const renderHeartsIllustration = () => (
    <View style={styles.heartsContainer}>
      {/* Center Bright Red Heart */}
      <View style={styles.centerHeart}>
        <Ionicons name="heart" size={96} color="#FF2222" />
      </View>
      {/* Left Wine / Deep Red Heart */}
      <View style={styles.leftHeart}>
        <Ionicons name="heart" size={62} color="#A30036" />
      </View>
      {/* Right Soft Pink / Peach Heart */}
      <View style={styles.rightHeart}>
        <Ionicons name="heart" size={64} color="#FDC4B2" />
      </View>
    </View>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      {renderHeartsIllustration()}

      <Text style={styles.emptyTitle}>You haven't liked anything yet</Text>
      <Text style={styles.emptySubtitle}>
        Collect all the things you like in one place
      </Text>

      <TouchableOpacity
        style={styles.discoverBtn}
        onPress={handleDiscover}
        activeOpacity={0.85}
      >
        <Text style={styles.discoverBtnText}>Discover</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <ScreenContainer noPadding style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header matching media_1791318313629.jpg: Back arrow & Wishlist */}
      <View style={[styles.header, { paddingTop: Math.max(insets.top, 12) }]}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => {
            if (navigation.canGoBack()) {
              navigation.goBack();
            } else {
              navigation.navigate('Main', { screen: 'Home' });
            }
          }}
          accessibilityLabel="Back"
        >
          <Ionicons name="arrow-back" size={24} color="#002F34" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Wishlist</Text>
        <View style={{ width: 36 }} />
      </View>

      {/* Undo Toast */}
      {undoItem && (
        <View style={styles.undoToast}>
          <Text style={styles.undoText} numberOfLines={1}>
            Removed "{undoItem.title}"
          </Text>
          <TouchableOpacity onPress={handleUndo} style={styles.undoBtn}>
            <Text style={styles.undoBtnText}>UNDO</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Main Content */}
      <View style={styles.content}>
        {savedItems.length === 0 ? (
          renderEmpty()
        ) : (
          <FlatList
            data={savedItems}
            keyExtractor={(item) => item.id}
            numColumns={2}
            columnWrapperStyle={styles.row}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <View style={styles.cardWrapper}>
                <ServiceItemCard
                  item={item}
                  isSaved={true}
                  onPress={handlePress}
                  onBookPress={handlePress}
                  onSavePress={() => handleRemove(item)}
                />
              </View>
            )}
          />
        )}
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  backBtn: {
    width: 36,
    height: 36,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#002F34',
  },
  content: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  // 3 Overlapping Hearts graphic
  heartsContainer: {
    width: 170,
    height: 140,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginBottom: 20,
  },
  centerHeart: {
    position: 'absolute',
    top: 8,
    alignSelf: 'center',
    zIndex: 2,
  },
  leftHeart: {
    position: 'absolute',
    bottom: 6,
    left: 8,
    zIndex: 3,
  },
  rightHeart: {
    position: 'absolute',
    top: 20,
    right: 4,
    zIndex: 1,
  },
  // Empty State
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingBottom: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#002F34',
    textAlign: 'center',
    marginTop: 14,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 20,
    marginTop: 8,
    maxWidth: 240,
  },
  discoverBtn: {
    backgroundColor: '#004085',
    paddingVertical: 12,
    paddingHorizontal: 42,
    borderRadius: 24,
    marginTop: 26,
    alignSelf: 'center',
  },
  discoverBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  // List Container
  listContainer: {
    padding: 16,
    paddingBottom: 40,
  },
  row: {
    justifyContent: 'space-between',
  },
  cardWrapper: {
    width: '48.5%',
    marginBottom: 12,
  },
  undoToast: {
    position: 'absolute',
    bottom: 24,
    left: 20,
    right: 20,
    backgroundColor: '#002F34',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    zIndex: 100,
  },
  undoText: {
    color: '#FFFFFF',
    fontSize: 12.5,
    flex: 1,
    marginRight: 10,
  },
  undoBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  undoBtnText: {
    color: '#0078FF',
    fontSize: 13,
    fontWeight: '700',
  },
});
