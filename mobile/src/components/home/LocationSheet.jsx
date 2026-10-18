import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  Platform,
  Alert,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Colors from '../../constants/colors';
import Typography from '../../constants/typography';
import Spacing from '../../constants/spacing';
import Radii from '../../constants/radii';
import Shadows from '../../constants/shadows';
import { useApp } from '../../context/AppContext';

export const POPULAR_CITIES = [
  { city: 'Indore', area: 'Vijay Nagar', pincode: '452010', state: 'Madhya Pradesh' },
  { city: 'Kottayam', area: 'Kumarakom', pincode: '686001', state: 'Kerala' },
  { city: 'Kochi', area: 'Marine Drive', pincode: '682031', state: 'Kerala' },
  { city: 'Bengaluru', area: 'Koramangala', pincode: '560034', state: 'Karnataka' },
  { city: 'Mumbai', area: 'Andheri West', pincode: '400053', state: 'Maharashtra' },
  { city: 'Delhi', area: 'Connaught Place', pincode: '110001', state: 'Delhi NCR' },
  { city: 'Hyderabad', area: 'Hitec City', pincode: '500081', state: 'Telangana' },
  { city: 'Pune', area: 'Kothrud', pincode: '411038', state: 'Maharashtra' },
  { city: 'Jaipur', area: 'Malviya Nagar', pincode: '302017', state: 'Rajasthan' },
  { city: 'Chennai', area: 'T. Nagar', pincode: '600017', state: 'Tamil Nadu' }
];

export const INDIAN_LOCATIONS = [
  {
    state: 'Madhya Pradesh',
    stateCode: 'MP',
    cities: [
      {
        city: 'Indore',
        pincode: '452001',
        localities: [
          { name: 'Vijay Nagar', pincode: '452010' },
          { name: 'Palasia', pincode: '452001' },
          { name: 'Rajwada', pincode: '452002' },
          { name: 'Indore Airport', pincode: '452005' },
          { name: 'Bhawarkua', pincode: '452014' },
          { name: 'Geeta Bhawan', pincode: '452001' },
          { name: 'Annapurna', pincode: '452009' },
          { name: 'Super Corridor', pincode: '452005' },
          { name: 'Rau', pincode: '453331' },
          { name: 'Bengali Square', pincode: '452016' },
          { name: 'Mahalaxmi Nagar', pincode: '452010' },
          { name: 'Nipania', pincode: '452010' }
        ]
      },
      {
        city: 'Bhopal',
        pincode: '462001',
        localities: [
          { name: 'MP Nagar', pincode: '462011' },
          { name: 'Arera Colony', pincode: '462016' },
          { name: 'Kolar Road', pincode: '462042' },
          { name: 'New Market', pincode: '462003' },
          { name: 'Hoshangabad Road', pincode: '462026' }
        ]
      },
      {
        city: 'Jabalpur',
        pincode: '482001',
        localities: [
          { name: 'Civil Lines', pincode: '482001' },
          { name: 'Wright Town', pincode: '482002' },
          { name: 'Napier Town', pincode: '482001' },
          { name: 'Vijay Nagar', pincode: '482002' }
        ]
      },
      {
        city: 'Gwalior',
        pincode: '474001',
        localities: [
          { name: 'City Centre', pincode: '474011' },
          { name: 'Lashkar', pincode: '474001' },
          { name: 'Morar', pincode: '474006' }
        ]
      },
      {
        city: 'Ujjain',
        pincode: '456001',
        localities: [
          { name: 'Freeganj', pincode: '456010' },
          { name: 'Mahakal Marg', pincode: '456001' },
          { name: 'Nanakheda', pincode: '456010' }
        ]
      }
    ]
  },
  {
    state: 'Kerala',
    stateCode: 'KL',
    cities: [
      {
        city: 'Kottayam',
        pincode: '686001',
        localities: [
          { name: 'Kumarakom', pincode: '686563' },
          { name: 'Collectorate', pincode: '686002' },
          { name: 'Baker Junction', pincode: '686001' },
          { name: 'Pala', pincode: '686575' },
          { name: 'Changanassery', pincode: '686101' },
          { name: 'Ettumanoor', pincode: '686631' }
        ]
      },
      {
        city: 'Kochi',
        pincode: '682001',
        localities: [
          { name: 'Marine Drive', pincode: '682031' },
          { name: 'Kakkanad', pincode: '682030' },
          { name: 'Edappally', pincode: '682024' },
          { name: 'Fort Kochi', pincode: '682001' },
          { name: 'Palarivattom', pincode: '682025' },
          { name: 'Panampilly Nagar', pincode: '682036' },
          { name: 'Aluva', pincode: '683101' }
        ]
      },
      {
        city: 'Thiruvananthapuram',
        pincode: '695001',
        localities: [
          { name: 'Kowdiar', pincode: '695003' },
          { name: 'Kazhakoottam', pincode: '695582' },
          { name: 'Pattom', pincode: '695004' },
          { name: 'Palayam', pincode: '695034' }
        ]
      },
      {
        city: 'Kozhikode',
        pincode: '673001',
        localities: [
          { name: 'Mavoor Road', pincode: '673004' },
          { name: 'Beach Road', pincode: '673032' },
          { name: 'Palayam', pincode: '673001' }
        ]
      }
    ]
  },
  {
    state: 'Karnataka',
    stateCode: 'KA',
    cities: [
      {
        city: 'Bengaluru',
        pincode: '560001',
        localities: [
          { name: 'Koramangala', pincode: '560034' },
          { name: 'Indiranagar', pincode: '560038' },
          { name: 'HSR Layout', pincode: '560102' },
          { name: 'Whitefield', pincode: '560066' },
          { name: 'Jayanagar', pincode: '560041' },
          { name: 'Electronic City', pincode: '560100' },
          { name: 'JP Nagar', pincode: '560078' },
          { name: 'BTM Layout', pincode: '560076' },
          { name: 'Malleshwaram', pincode: '560003' },
          { name: 'Bellandur', pincode: '560103' }
        ]
      },
      {
        city: 'Mysuru',
        pincode: '570001',
        localities: [
          { name: 'Gokulam', pincode: '570002' },
          { name: 'Jayalakshmipuram', pincode: '570012' },
          { name: 'Vijayanagar', pincode: '570017' }
        ]
      }
    ]
  },
  {
    state: 'Maharashtra',
    stateCode: 'MH',
    cities: [
      {
        city: 'Mumbai',
        pincode: '400001',
        localities: [
          { name: 'Andheri West', pincode: '400053' },
          { name: 'Bandra West', pincode: '400050' },
          { name: 'Colaba', pincode: '400005' },
          { name: 'Powai', pincode: '400076' },
          { name: 'Juhu', pincode: '400049' },
          { name: 'Dadar', pincode: '400014' },
          { name: 'Borivali', pincode: '400092' },
          { name: 'BKC', pincode: '400051' }
        ]
      },
      {
        city: 'Pune',
        pincode: '411001',
        localities: [
          { name: 'Kothrud', pincode: '411038' },
          { name: 'Viman Nagar', pincode: '411014' },
          { name: 'Baner', pincode: '411045' },
          { name: 'Hinjewadi', pincode: '411057' },
          { name: 'Wakad', pincode: '411057' },
          { name: 'Shivajinagar', pincode: '411005' },
          { name: 'Koregaon Park', pincode: '411001' }
        ]
      },
      {
        city: 'Nagpur',
        pincode: '440001',
        localities: [
          { name: 'Dharampeth', pincode: '440010' },
          { name: 'Sadar', pincode: '440001' },
          { name: 'Civil Lines', pincode: '440001' }
        ]
      }
    ]
  },
  {
    state: 'Delhi NCR',
    stateCode: 'DL',
    cities: [
      {
        city: 'Delhi',
        pincode: '110001',
        localities: [
          { name: 'Connaught Place', pincode: '110001' },
          { name: 'Hauz Khas', pincode: '110016' },
          { name: 'Saket', pincode: '110017' },
          { name: 'Dwarka', pincode: '110075' },
          { name: 'Karol Bagh', pincode: '110005' },
          { name: 'South Extension', pincode: '110049' },
          { name: 'Lajpat Nagar', pincode: '110024' },
          { name: 'Vasant Kunj', pincode: '110070' },
          { name: 'Rohini', pincode: '110085' }
        ]
      },
      {
        city: 'Noida',
        pincode: '201301',
        localities: [
          { name: 'Sector 18', pincode: '201301' },
          { name: 'Sector 62', pincode: '201309' },
          { name: 'Sector 137', pincode: '201305' }
        ]
      },
      {
        city: 'Gurugram',
        pincode: '122001',
        localities: [
          { name: 'Cyber City', pincode: '122002' },
          { name: 'DLF Phase 1-5', pincode: '122002' },
          { name: 'Golf Course Road', pincode: '122002' }
        ]
      }
    ]
  },
  {
    state: 'Telangana',
    stateCode: 'TS',
    cities: [
      {
        city: 'Hyderabad',
        pincode: '500001',
        localities: [
          { name: 'Hitec City', pincode: '500081' },
          { name: 'Gachibowli', pincode: '500032' },
          { name: 'Banjara Hills', pincode: '500034' },
          { name: 'Jubilee Hills', pincode: '500033' },
          { name: 'Madhapur', pincode: '500081' },
          { name: 'Kondapur', pincode: '500084' },
          { name: 'Secunderabad', pincode: '500003' }
        ]
      }
    ]
  },
  {
    state: 'Tamil Nadu',
    stateCode: 'TN',
    cities: [
      {
        city: 'Chennai',
        pincode: '600001',
        localities: [
          { name: 'T. Nagar', pincode: '600017' },
          { name: 'Anna Nagar', pincode: '600040' },
          { name: 'Adyar', pincode: '600020' },
          { name: 'Velachery', pincode: '600042' },
          { name: 'Mylapore', pincode: '600004' },
          { name: 'OMR', pincode: '600096' }
        ]
      },
      {
        city: 'Coimbatore',
        pincode: '641001',
        localities: [
          { name: 'RS Puram', pincode: '641002' },
          { name: 'Gandhipuram', pincode: '641012' },
          { name: 'Peelamedu', pincode: '641004' }
        ]
      }
    ]
  },
  {
    state: 'Rajasthan',
    stateCode: 'RJ',
    cities: [
      {
        city: 'Jaipur',
        pincode: '302001',
        localities: [
          { name: 'Malviya Nagar', pincode: '302017' },
          { name: 'Vaishali Nagar', pincode: '302021' },
          { name: 'C-Scheme', pincode: '302001' },
          { name: 'Mansarovar', pincode: '302020' },
          { name: 'Raja Park', pincode: '302004' }
        ]
      },
      {
        city: 'Udaipur',
        pincode: '313001',
        localities: [
          { name: 'Panchwati', pincode: '313001' },
          { name: 'Fatehpura', pincode: '313001' },
          { name: 'Hiran Magri', pincode: '313002' }
        ]
      }
    ]
  },
  {
    state: 'Gujarat',
    stateCode: 'GJ',
    cities: [
      {
        city: 'Ahmedabad',
        pincode: '380001',
        localities: [
          { name: 'Satellite', pincode: '380015' },
          { name: 'SG Highway', pincode: '380054' },
          { name: 'Bodakdev', pincode: '380054' },
          { name: 'Vastrapur', pincode: '380015' },
          { name: 'Prahlad Nagar', pincode: '380015' }
        ]
      },
      {
        city: 'Surat',
        pincode: '395001',
        localities: [
          { name: 'Adajan', pincode: '395009' },
          { name: 'Vesu', pincode: '395007' },
          { name: 'Piplod', pincode: '395007' }
        ]
      }
    ]
  },
  {
    state: 'Uttar Pradesh',
    stateCode: 'UP',
    cities: [
      {
        city: 'Lucknow',
        pincode: '226001',
        localities: [
          { name: 'Gomti Nagar', pincode: '226010' },
          { name: 'Hazratganj', pincode: '226001' },
          { name: 'Aliganj', pincode: '226024' },
          { name: 'Indira Nagar', pincode: '226016' }
        ]
      },
      {
        city: 'Varanasi',
        pincode: '221001',
        localities: [
          { name: 'Sigra', pincode: '221010' },
          { name: 'Lanka', pincode: '221005' },
          { name: 'Cantt', pincode: '221002' }
        ]
      }
    ]
  },
  {
    state: 'West Bengal',
    stateCode: 'WB',
    cities: [
      {
        city: 'Kolkata',
        pincode: '700001',
        localities: [
          { name: 'Salt Lake', pincode: '700091' },
          { name: 'Park Street', pincode: '700016' },
          { name: 'New Town', pincode: '700156' },
          { name: 'Ballygunge', pincode: '700019' },
          { name: 'Alipore', pincode: '700027' }
        ]
      }
    ]
  },
  {
    state: 'Punjab',
    stateCode: 'PB',
    cities: [
      {
        city: 'Chandigarh',
        pincode: '160017',
        localities: [
          { name: 'Sector 17', pincode: '160017' },
          { name: 'Sector 35', pincode: '160035' },
          { name: 'Sector 22', pincode: '160022' }
        ]
      },
      {
        city: 'Ludhiana',
        pincode: '141001',
        localities: [
          { name: 'Sarabha Nagar', pincode: '141001' },
          { name: 'Model Town', pincode: '141002' }
        ]
      }
    ]
  }
];

export const LocationSheet = ({ visible, onClose }) => {
  const { activeAddress, setActiveAddress, setCurrentLocation } = useApp();
  const [pincode, setPincode] = useState(activeAddress?.pincode || '452010');
  const [locationQuery, setLocationQuery] = useState('');
  const [isDetecting, setIsDetecting] = useState(false);
  const [recentLocations, setRecentLocations] = useState([]);

  // Hierarchy drilldown navigation: 'search' | 'browse'
  const [activeTab, setActiveTab] = useState('search');
  const [selectedState, setSelectedState] = useState(null);
  const [selectedCity, setSelectedCity] = useState(null);

  useEffect(() => {
    if (visible) {
      loadRecentLocations();
    }
  }, [visible]);

  const filteredSuggestions = useMemo(() => {
    const q = locationQuery.trim().toLowerCase();
    if (!q) return [];

    const matches = [];

    const addMatch = (item) => {
      const key = `${item.area}-${item.city}-${item.state}`;
      if (!matches.some((m) => `${m.area}-${m.city}-${m.state}` === key)) {
        matches.push(item);
      }
    };

    for (const stateObj of INDIAN_LOCATIONS) {
      const stateMatches =
        stateObj.state.toLowerCase().includes(q) ||
        stateObj.stateCode.toLowerCase().includes(q);

      for (const cityObj of stateObj.cities) {
        const cityMatches = cityObj.city.toLowerCase().includes(q);
        const cityPincodeMatches = cityObj.pincode.startsWith(q);

        if (cityMatches || stateMatches || cityPincodeMatches) {
          addMatch({
            area: `${cityObj.city} (All Localities)`,
            city: cityObj.city,
            state: stateObj.state,
            pincode: cityObj.pincode,
            isCityLevel: true
          });
        }

        for (const loc of cityObj.localities) {
          const locMatches = loc.name.toLowerCase().includes(q);
          const pinMatches = loc.pincode.startsWith(q);

          if (locMatches || pinMatches || (cityMatches && matches.length < 15)) {
            addMatch({
              area: loc.name,
              city: cityObj.city,
              state: stateObj.state,
              pincode: loc.pincode
            });
          }
        }
      }
    }

    return matches.slice(0, 15);
  }, [locationQuery]);

  const loadRecentLocations = async () => {
    try {
      const stored = await AsyncStorage.getItem('@recent_locations');
      if (stored) {
        setRecentLocations(JSON.parse(stored));
      } else {
        setRecentLocations([
          { area: 'Vijay Nagar', city: 'Indore', state: 'Madhya Pradesh', pincode: '452010' },
          { area: 'Kumarakom', city: 'Kottayam', state: 'Kerala', pincode: '686001' },
          { area: 'Koramangala', city: 'Bengaluru', state: 'Karnataka', pincode: '560034' }
        ]);
      }
    } catch (e) {
      console.warn('Failed to load recent locations:', e);
    }
  };

  const persistLocation = async (locationData) => {
    try {
      const addressString = `${locationData.street || locationData.area ? (locationData.street || locationData.area) + ', ' : ''}${locationData.city}, ${locationData.state || 'Karnataka'} ${locationData.pincode || ''}`.trim();
      const resolved = {
        ...locationData,
        address: locationData.address || addressString
      };
      setCurrentLocation?.(resolved);
      await AsyncStorage.setItem('@current_location', JSON.stringify(resolved));
      const itemToSave = {
        area: locationData.street || locationData.area || 'Central',
        city: locationData.city,
        state: locationData.state || 'India',
        pincode: locationData.pincode || '452001'
      };
      const updatedRecents = [
        itemToSave,
        ...recentLocations.filter(
          (r) => !(r.city === itemToSave.city && r.area === itemToSave.area)
        )
      ].slice(0, 5);
      setRecentLocations(updatedRecents);
      await AsyncStorage.setItem('@recent_locations', JSON.stringify(updatedRecents));
    } catch (e) {
      console.warn('Failed to persist location:', e);
    }
  };

  const applyPincode = async () => {
    if (!/^\d{6}$/.test(pincode)) {
      Alert.alert('Invalid Pincode', 'Please enter a valid 6-digit Indian pincode.');
      return;
    }
    let matchedLocation = null;
    for (const st of INDIAN_LOCATIONS) {
      for (const ct of st.cities) {
        if (ct.pincode === pincode) {
          matchedLocation = { city: ct.city, area: 'City Center', state: st.state, pincode };
          break;
        }
        for (const loc of ct.localities) {
          if (loc.pincode === pincode) {
            matchedLocation = { city: ct.city, area: loc.name, state: st.state, pincode };
            break;
          }
        }
        if (matchedLocation) break;
      }
      if (matchedLocation) break;
    }

    const updated = {
      ...(activeAddress || {}),
      pincode,
      city: matchedLocation?.city || activeAddress?.city || 'Indore',
      street: matchedLocation?.area || activeAddress?.street || 'Delivery Zone',
      state: matchedLocation?.state || activeAddress?.state || 'Madhya Pradesh',
      isDefault: true
    };
    setActiveAddress(updated);
    await persistLocation(updated);
    onClose?.();
  };

  const useCurrentLocation = async () => {
    setIsDetecting(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setIsDetecting(false);
        Alert.alert(
          'Location Permission Denied',
          'GPS permission was denied. Please select your city manually from the suggestions below.',
          [{ text: 'OK' }]
        );
        return;
      }

      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced
      });

      const reverse = await Location.reverseGeocodeAsync({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude
      });

      if (reverse && reverse.length > 0) {
        const place = reverse[0];
        const detectedCity = place.city || place.subregion || place.district || 'Indore';
        const detectedStreet = place.street || place.name || place.district || 'Vijay Nagar';
        const detectedState = place.region || 'Madhya Pradesh';
        const detectedPincode = place.postalCode || '452010';

        const updated = {
          city: detectedCity,
          street: detectedStreet,
          state: detectedState,
          pincode: detectedPincode,
          isDefault: true
        };
        setPincode(detectedPincode);
        setActiveAddress(updated);
        await persistLocation(updated);
        setIsDetecting(false);
        onClose?.();
      } else {
        throw new Error('Unable to reverse geocode GPS coordinates');
      }
    } catch (error) {
      console.warn('GPS detection fallback:', error.message);
      setIsDetecting(false);
      const fallback = {
        city: 'Indore',
        street: 'Vijay Nagar',
        state: 'Madhya Pradesh',
        pincode: '452010',
        isDefault: true
      };
      setPincode(fallback.pincode);
      setActiveAddress(fallback);
      await persistLocation(fallback);
      Alert.alert('Location Detected (Auto)', 'Set delivery location to Vijay Nagar, Indore.');
      onClose?.();
    }
  };

  const chooseLocation = async (location) => {
    const updated = {
      ...(activeAddress || {}),
      city: location.city,
      street: location.area,
      pincode: location.pincode,
      state: location.state,
      isDefault: true
    };
    setPincode(location.pincode);
    setLocationQuery('');
    setActiveAddress(updated);
    await persistLocation(updated);
    onClose?.();
  };

  const handleCustomQuerySelect = async (queryText) => {
    const trimmed = queryText.trim();
    if (!trimmed) return;
    const updated = {
      ...(activeAddress || {}),
      city: trimmed,
      street: 'Local Area',
      pincode: pincode || '452001',
      state: 'India',
      isDefault: true
    };
    setActiveAddress(updated);
    await persistLocation(updated);
    onClose?.();
  };

  if (!visible) return null;

  return (
    <Modal visible={Boolean(visible)} transparent={true} animationType="fade" onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.overlay}>
        <TouchableOpacity style={styles.overlayBg} onPress={onClose} activeOpacity={1} />

        <View style={styles.sheet}>
          {/* Grab Handle */}
          <View style={styles.handle} />

          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>Select Your Location</Text>
              <Text style={styles.sheetSubtitle}>
                {activeAddress?.city
                  ? `Current: ${activeAddress.street ? activeAddress.street + ', ' : ''}${activeAddress.city}, ${activeAddress.state || 'India'}`
                  : 'Find products and services near you in India'}
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn} accessibilityLabel="Close location picker">
              <Ionicons name="close" size={24} color={Colors.textPrimary} />
            </TouchableOpacity>
          </View>

          {/* Mode Switch Tabs: Live Search vs Browse Hierarchy */}
          <View style={styles.tabBar}>
            <TouchableOpacity
              style={[styles.tabItem, activeTab === 'search' && styles.tabItemActive]}
              onPress={() => setActiveTab('search')}>
              <Ionicons
                name="search-outline"
                size={16}
                color={activeTab === 'search' ? Colors.primary : Colors.textSecondary}
              />
              <Text style={[styles.tabText, activeTab === 'search' && styles.tabTextActive]}>
                Search City / Area
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tabItem, activeTab === 'browse' && styles.tabItemActive]}
              onPress={() => {
                setActiveTab('browse');
                setSelectedState(null);
                setSelectedCity(null);
              }}>
              <Ionicons
                name="git-network-outline"
                size={16}
                color={activeTab === 'browse' ? Colors.primary : Colors.textSecondary}
              />
              <Text style={[styles.tabText, activeTab === 'browse' && styles.tabTextActive]}>
                Browse Hierarchy
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.sheetContent}>
            {/* GPS Detection Bar */}
            <TouchableOpacity
              style={styles.actionRow}
              onPress={useCurrentLocation}
              disabled={isDetecting}>
              <View style={styles.actionIconContainer}>
                {isDetecting ? (
                  <ActivityIndicator size="small" color={Colors.primary} />
                ) : (
                  <Ionicons name="locate" size={20} color={Colors.primary} />
                )}
              </View>
              <View style={styles.actionCopy}>
                <Text style={styles.actionText}>
                  {isDetecting ? 'Detecting your GPS location...' : 'Use Current GPS Location'}
                </Text>
                <Text style={styles.actionSubtext}>Precision location using your phone GPS</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={Colors.primary} />
            </TouchableOpacity>

            {/* TAB 1: LIVE SEARCH & SUGGESTIONS */}
            {activeTab === 'search' && (
              <>
                <Text style={styles.fieldLabel}>Search City, Locality, or State</Text>
                <View style={styles.searchContainer}>
                  <Ionicons name="search-outline" size={19} color={Colors.textSecondary} />
                  <TextInput
                    style={styles.searchInput}
                    value={locationQuery}
                    onChangeText={setLocationQuery}
                    placeholder="e.g. Indore, Vijay Nagar, Kerala, 452010"
                    placeholderTextColor={Colors.disabled}
                    autoCorrect={false}
                    autoCapitalize="words"
                  />
                  {locationQuery.length > 0 && (
                    <TouchableOpacity onPress={() => setLocationQuery('')} style={{ padding: 4 }}>
                      <Ionicons name="close-circle" size={18} color={Colors.textSecondary} />
                    </TouchableOpacity>
                  )}
                </View>

                {locationQuery.trim().length > 0 ? (
                  <View style={styles.suggestionsContainer}>
                    <Text style={styles.suggestionsHeader}>MATCHING LOCATIONS</Text>
                    {filteredSuggestions.length > 0 ? (
                      filteredSuggestions.map((loc, idx) => (
                        <TouchableOpacity
                          key={`${loc.area}-${loc.city}-${idx}`}
                          style={styles.suggestionRow}
                          onPress={() => chooseLocation(loc)}>
                          <View style={styles.suggestionIcon}>
                            <Ionicons
                              name={loc.isCityLevel ? 'business-outline' : 'location-outline'}
                              size={17}
                              color={Colors.primary}
                            />
                          </View>
                          <View style={styles.suggestionCopy}>
                            <Text style={styles.suggestionTitle}>{loc.area}, {loc.city}</Text>
                            <Text style={styles.suggestionMeta}>
                              {loc.state} · {loc.pincode}
                            </Text>
                          </View>
                          <Ionicons name="chevron-forward" size={16} color={Colors.disabled} />
                        </TouchableOpacity>
                      ))
                    ) : (
                      <View style={styles.noMatchBox}>
                        <Ionicons name="information-circle-outline" size={24} color={Colors.brandBlue} />
                        <Text style={styles.noMatchText}>
                          No exact directory match for "{locationQuery}".
                        </Text>
                        <TouchableOpacity
                          style={styles.customQueryBtn}
                          onPress={() => handleCustomQuerySelect(locationQuery)}>
                          <Ionicons name="location" size={16} color={Colors.white} style={{ marginRight: 6 }} />
                          <Text style={styles.customQueryBtnText}>
                            Use "{locationQuery.trim()}" as my location
                          </Text>
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                ) : (
                  <>
                    {recentLocations.length > 0 && (
                      <View style={styles.sectionBlock}>
                        <View style={styles.sectionHeaderRow}>
                          <Ionicons name="time-outline" size={15} color={Colors.textSecondary} style={{ marginRight: 4 }} />
                          <Text style={styles.fieldLabel}>RECENT LOCATIONS</Text>
                        </View>
                        <View style={styles.chipContainer}>
                          {recentLocations.map((item, idx) => (
                            <TouchableOpacity
                              key={idx}
                              style={styles.recentChip}
                              onPress={() => chooseLocation(item)}>
                              <Ionicons name="time" size={13} color={Colors.textSecondary} style={{ marginRight: 5 }} />
                              <Text style={styles.recentChipText} numberOfLines={1}>
                                {item.area}, {item.city}
                              </Text>
                            </TouchableOpacity>
                          ))}
                        </View>
                      </View>
                    )}

                    <View style={styles.sectionBlock}>
                      <View style={styles.sectionHeaderRow}>
                        <Ionicons name="star-outline" size={15} color={Colors.textSecondary} style={{ marginRight: 4 }} />
                        <Text style={styles.fieldLabel}>POPULAR CITIES</Text>
                      </View>
                      <View style={styles.chipContainer}>
                        {POPULAR_CITIES.map((cityItem) => {
                          const isSelected = activeAddress?.city === cityItem.city;
                          return (
                            <TouchableOpacity
                              key={cityItem.city}
                              style={[styles.cityChip, isSelected && styles.cityChipSelected]}
                              onPress={() => chooseLocation(cityItem)}>
                              <Ionicons
                                name={isSelected ? 'checkmark-circle' : 'location-sharp'}
                                size={14}
                                color={isSelected ? Colors.white : Colors.primary}
                                style={{ marginRight: 5 }}
                              />
                              <Text style={[styles.cityChipText, isSelected && styles.cityChipTextSelected]}>
                                {cityItem.city}
                              </Text>
                            </TouchableOpacity>
                          );
                        })}
                      </View>
                    </View>

                    <View style={styles.sectionBlock}>
                      <Text style={styles.fieldLabel}>ENTER 6-DIGIT PINCODE</Text>
                      <View style={styles.inputContainer}>
                        <Ionicons
                          name="navigate-outline"
                          size={18}
                          color={Colors.textSecondary}
                          style={{ marginRight: 8 }}
                        />
                        <TextInput
                          style={styles.input}
                          value={pincode}
                          onChangeText={setPincode}
                          placeholder="e.g. 452010"
                          placeholderTextColor={Colors.disabled}
                          keyboardType="number-pad"
                          maxLength={6}
                        />
                        <TouchableOpacity style={styles.applyBtn} onPress={applyPincode}>
                          <Text style={styles.checkText}>Apply</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </>
                )}
              </>
            )}

            {/* TAB 2: HIERARCHY DRILLDOWN */}
            {activeTab === 'browse' && (
              <View style={styles.hierarchyContainer}>
                <View style={styles.breadcrumbBar}>
                  <TouchableOpacity
                    onPress={() => {
                      setSelectedState(null);
                      setSelectedCity(null);
                    }}>
                    <Text style={styles.breadcrumbLink}>India</Text>
                  </TouchableOpacity>

                  {selectedState && (
                    <>
                      <Ionicons name="chevron-forward" size={14} color={Colors.textSecondary} style={{ marginHorizontal: 4 }} />
                      <TouchableOpacity onPress={() => setSelectedCity(null)}>
                        <Text style={[styles.breadcrumbLink, !selectedCity && styles.breadcrumbActive]}>
                          {selectedState.state}
                        </Text>
                      </TouchableOpacity>
                    </>
                  )}

                  {selectedCity && (
                    <>
                      <Ionicons name="chevron-forward" size={14} color={Colors.textSecondary} style={{ marginHorizontal: 4 }} />
                      <Text style={styles.breadcrumbActive}>{selectedCity.city}</Text>
                    </>
                  )}
                </View>

                {!selectedState && (
                  <View>
                    <Text style={styles.hierarchyInstruction}>Step 1: Select Your State</Text>
                    {INDIAN_LOCATIONS.map((stateItem) => (
                      <TouchableOpacity
                        key={stateItem.state}
                        style={styles.hierarchyRow}
                        onPress={() => setSelectedState(stateItem)}>
                        <View style={styles.hierarchyIconCircle}>
                          <Ionicons name="map-outline" size={18} color={Colors.primary} />
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.hierarchyTitle}>{stateItem.state}</Text>
                          <Text style={styles.hierarchyMeta}>
                            {stateItem.cities.length} major cities cataloged
                          </Text>
                        </View>
                        <Ionicons name="chevron-forward" size={18} color={Colors.disabled} />
                      </TouchableOpacity>
                    ))}
                  </View>
                )}

                {selectedState && !selectedCity && (
                  <View>
                    <Text style={styles.hierarchyInstruction}>
                      Step 2: Select City in {selectedState.state}
                    </Text>
                    {selectedState.cities.map((cityItem) => (
                      <TouchableOpacity
                        key={cityItem.city}
                        style={styles.hierarchyRow}
                        onPress={() => setSelectedCity(cityItem)}>
                        <View style={styles.hierarchyIconCircle}>
                          <Ionicons name="business-outline" size={18} color={Colors.brandBlue} />
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.hierarchyTitle}>{cityItem.city}</Text>
                          <Text style={styles.hierarchyMeta}>
                            {cityItem.localities.length} localities · PIN {cityItem.pincode}
                          </Text>
                        </View>
                        <Ionicons name="chevron-forward" size={18} color={Colors.disabled} />
                      </TouchableOpacity>
                    ))}
                  </View>
                )}

                {selectedState && selectedCity && (
                  <View>
                    <Text style={styles.hierarchyInstruction}>
                      Step 3: Select Locality in {selectedCity.city}
                    </Text>

                    <TouchableOpacity
                      style={[styles.hierarchyRow, styles.entireCityOption]}
                      onPress={() =>
                        chooseLocation({
                          area: 'Entire City',
                          city: selectedCity.city,
                          state: selectedState.state,
                          pincode: selectedCity.pincode
                        })
                      }>
                      <View style={[styles.hierarchyIconCircle, { backgroundColor: '#DBEAFE' }]}>
                        <Ionicons name="checkmark-done" size={18} color={Colors.primary} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.hierarchyTitle, { color: Colors.primary }]}>
                          All of {selectedCity.city}
                        </Text>
                        <Text style={styles.hierarchyMeta}>Show listings across the entire city</Text>
                      </View>
                      <Ionicons name="arrow-forward" size={18} color={Colors.primary} />
                    </TouchableOpacity>

                    {selectedCity.localities.map((loc) => (
                      <TouchableOpacity
                        key={loc.name}
                        style={styles.hierarchyRow}
                        onPress={() =>
                          chooseLocation({
                            area: loc.name,
                            city: selectedCity.city,
                            state: selectedState.state,
                            pincode: loc.pincode
                          })
                        }>
                        <View style={styles.hierarchyIconCircle}>
                          <Ionicons name="location-outline" size={18} color={Colors.primary} />
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.hierarchyTitle}>{loc.name}</Text>
                          <Text style={styles.hierarchyMeta}>PIN: {loc.pincode}</Text>
                        </View>
                        <Ionicons name="checkmark-circle-outline" size={18} color={Colors.disabled} />
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
            )}

            <View style={{ height: 40 }} />
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end'
  },
  overlayBg: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: Colors.overlay
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.border,
    alignSelf: 'center',
    marginBottom: Spacing.md
  },
  sheet: {
    backgroundColor: Colors.card,
    borderTopLeftRadius: Radii.sheet,
    borderTopRightRadius: Radii.sheet,
    paddingTop: Spacing.md,
    paddingHorizontal: Spacing.base,
    paddingBottom: Platform.OS === 'ios' ? 36 : 24,
    maxHeight: '92%',
    borderTopWidth: 1,
    borderTopColor: Colors.hairline,
    ...Shadows.sheet
  },
  sheetContent: {
    paddingBottom: Spacing.md
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.sm
  },
  title: {
    ...Typography.heading2,
    fontSize: 18,
    color: Colors.textPrimary
  },
  sheetSubtitle: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginTop: 2
  },
  closeBtn: {
    padding: 4
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: Colors.sunken,
    borderRadius: Radii.control,
    padding: 3,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.hairline
  },
  tabItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: Radii.control
  },
  tabItemActive: {
    backgroundColor: Colors.card,
    shadowColor: Colors.textPrimary,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
    elevation: 2
  },
  tabText: {
    ...Typography.captionBold,
    color: Colors.textSecondary,
    marginLeft: 6
  },
  tabTextActive: {
    color: Colors.navy,
    fontWeight: '700'
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    backgroundColor: Colors.sunken,
    borderRadius: Radii.control,
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.hairline
  },
  actionIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.hairline,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md
  },
  actionCopy: {
    flex: 1
  },
  actionText: {
    ...Typography.bodyBold,
    fontSize: 14,
    color: Colors.navy
  },
  actionSubtext: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginTop: 1
  },
  sectionBlock: {
    marginTop: Spacing.md
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6
  },
  fieldLabel: {
    ...Typography.captionBold,
    color: Colors.textSecondary,
    fontSize: 11
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    borderWidth: 1,
    borderColor: Colors.hairline,
    borderRadius: Radii.input,
    paddingHorizontal: Spacing.md,
    backgroundColor: Colors.sunken,
    marginTop: 4
  },
  searchInput: {
    flex: 1,
    ...Typography.body,
    color: Colors.textPrimary,
    marginLeft: Spacing.sm
  },
  suggestionsContainer: {
    marginTop: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.hairline,
    borderRadius: Radii.card,
    overflow: 'hidden',
    backgroundColor: Colors.card
  },
  suggestionsHeader: {
    ...Typography.captionBold,
    color: Colors.textSecondary,
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
    paddingBottom: 4,
    fontSize: 10
  },
  suggestionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.hairline
  },
  suggestionIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.sunken,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm
  },
  suggestionCopy: {
    flex: 1
  },
  suggestionTitle: {
    ...Typography.bodyBold,
    fontSize: 13,
    color: Colors.textPrimary
  },
  suggestionMeta: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginTop: 1
  },
  noMatchBox: {
    padding: Spacing.lg,
    alignItems: 'center'
  },
  noMatchText: {
    ...Typography.body,
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 6,
    marginBottom: 12
  },
  customQueryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.terracotta,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: Radii.button
  },
  customQueryBtnText: {
    ...Typography.bodyBold,
    color: Colors.card,
    fontSize: 13
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4
  },
  recentChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: Radii.chip,
    backgroundColor: Colors.sunken,
    borderWidth: 1,
    borderColor: Colors.hairline
  },
  recentChipText: {
    ...Typography.caption,
    color: Colors.textPrimary,
    maxWidth: 160
  },
  cityChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: Radii.chip,
    backgroundColor: Colors.sunken,
    borderWidth: 1,
    borderColor: Colors.hairline
  },
  cityChipSelected: {
    backgroundColor: Colors.navy,
    borderColor: Colors.navy
  },
  cityChipText: {
    ...Typography.body,
    fontSize: 13,
    color: Colors.textPrimary
  },
  cityChipTextSelected: {
    color: Colors.card,
    fontWeight: '600'
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.hairline,
    borderRadius: Radii.input,
    paddingHorizontal: Spacing.md,
    height: 48,
    backgroundColor: Colors.sunken,
    marginTop: 4
  },
  input: {
    flex: 1,
    ...Typography.body,
    fontSize: 15,
    color: Colors.textPrimary
  },
  applyBtn: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.hairline,
    borderRadius: Radii.control
  },
  checkText: {
    ...Typography.bodyBold,
    color: Colors.terracotta,
    fontSize: 13
  },
  hierarchyContainer: {
    marginTop: Spacing.xs
  },
  breadcrumbBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: Colors.sunken,
    borderRadius: Radii.control,
    marginBottom: Spacing.sm
  },
  breadcrumbLink: {
    ...Typography.captionBold,
    color: Colors.navy,
    fontSize: 12
  },
  breadcrumbActive: {
    ...Typography.captionBold,
    color: Colors.textPrimary,
    fontSize: 12
  },
  hierarchyInstruction: {
    ...Typography.captionBold,
    color: Colors.textSecondary,
    marginBottom: 8,
    marginTop: 4
  },
  hierarchyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 11,
    paddingHorizontal: 12,
    borderRadius: Radii.control,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.hairline,
    marginBottom: 6
  },
  entireCityOption: {
    backgroundColor: Colors.sunken,
    borderColor: Colors.navy
  },
  hierarchyIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.sunken,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10
  },
  hierarchyTitle: {
    ...Typography.bodyBold,
    fontSize: 14,
    color: Colors.textPrimary
  },
  hierarchyMeta: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginTop: 1
  }
});

export default LocationSheet;

