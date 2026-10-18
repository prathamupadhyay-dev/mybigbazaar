import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Modal,
  ActivityIndicator,
  Platform,
  StatusBar as RNStatusBar,
} from 'react-native';
import { StatusBar as ExpoStatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useApp } from '../../context/AppContext';
import { HAS_SELECTED_LOCATION_KEY } from './LocationPromptScreen';

// Comprehensive Indian States and top cities
const INDIA_DATA = [
  { state: 'Andaman & Nicobar Islands', cities: ['Port Blair', 'Havelock Island', 'Diglipur'] },
  { state: 'Andhra Pradesh', cities: ['Visakhapatnam', 'Vijayawada', 'Guntur', 'Nellore', 'Tirupati'] },
  { state: 'Arunachal Pradesh', cities: ['Itanagar', 'Naharlagun', 'Pasighat', 'Tawang'] },
  { state: 'Assam', cities: ['Guwahati', 'Silchar', 'Dibrugarh', 'Jorhat', 'Nagaon'] },
  { state: 'Bihar', cities: ['Patna', 'Gaya', 'Bhagalpur', 'Muzaffarpur', 'Darbhanga'] },
  { state: 'Chandigarh', cities: ['Chandigarh Sector 17', 'Mohali', 'Panchkula', 'Zirakpur'] },
  { state: 'Chhattisgarh', cities: ['Raipur', 'Bhilai', 'Bilaspur', 'Korba', 'Durg'] },
  { state: 'Dadra & Nagar Haveli', cities: ['Silvassa', 'Amli', 'Naroli'] },
  { state: 'Daman & Diu', cities: ['Daman', 'Diu'] },
  { state: 'Delhi', cities: ['Central Delhi', 'South Delhi', 'Connaught Place', 'Dwarka', 'Rohini', 'Noida', 'Gurugram'] },
  { state: 'Goa', cities: ['Panaji', 'Margao', 'Vasco da Gama', 'Mapusa', 'Ponda'] },
  { state: 'Gujarat', cities: ['Ahmedabad', 'Surat', 'Vadodara', 'Rajkot', 'Bhavnagar', 'Gandhinagar'] },
  { state: 'Haryana', cities: ['Gurugram', 'Faridabad', 'Panipat', 'Ambala', 'Karnal', 'Rohtak'] },
  { state: 'Himachal Pradesh', cities: ['Shimla', 'Dharamshala', 'Manali', 'Mandi', 'Solan'] },
  { state: 'Jammu & Kashmir', cities: ['Srinagar', 'Jammu', 'Anantnag', 'Baramulla'] },
  { state: 'Jharkhand', cities: ['Ranchi', 'Jamshedpur', 'Dhanbad', 'Bokaro', 'Deoghar'] },
  { state: 'Karnataka', cities: ['Bengaluru', 'Mysuru', 'Hubballi', 'Mangaluru', 'Belagavi'] },
  { state: 'Kerala', cities: ['Kochi', 'Thiruvananthapuram', 'Kozhikode', 'Thrissur', 'Kollam'] },
  { state: 'Ladakh', cities: ['Leh', 'Kargil'] },
  { state: 'Lakshadweep', cities: ['Kavaratti', 'Agatti', 'Andrott'] },
  { state: 'Madhya Pradesh', cities: ['Indore', 'Bhopal', 'Jabalpur', 'Gwalior', 'Ujjain', 'Sagar'] },
  { state: 'Maharashtra', cities: ['Mumbai', 'Pune', 'Nagpur', 'Thane', 'Nashik', 'Aurangabad', 'Navi Mumbai'] },
  { state: 'Manipur', cities: ['Imphal', 'Thoubal', 'Bishnupur', 'Churachandpur'] },
  { state: 'Meghalaya', cities: ['Shillong', 'Tura', 'Jowai', 'Nongpoh'] },
  { state: 'Mizoram', cities: ['Aizawl', 'Lunglei', 'Champhai', 'Serchhip'] },
  { state: 'Nagaland', cities: ['Kohima', 'Dimapur', 'Mokokchung', 'Tuensang'] },
  { state: 'Odisha', cities: ['Bhubaneswar', 'Cuttack', 'Rourkela', 'Berhampur', 'Sambalpur', 'Puri'] },
  { state: 'Puducherry', cities: ['Puducherry', 'Karaikal', 'Yanam', 'Mahe'] },
  { state: 'Punjab', cities: ['Ludhiana', 'Amritsar', 'Jalandhar', 'Patiala', 'Bathinda'] },
  { state: 'Rajasthan', cities: ['Jaipur', 'Jodhpur', 'Kota', 'Bikaner', 'Ajmer', 'Udaipur'] },
  { state: 'Sikkim', cities: ['Gangtok', 'Namchi', 'Geyzing', 'Mangan'] },
  { state: 'Tamil Nadu', cities: ['Chennai', 'Coimbatore', 'Madurai', 'Tiruchirappalli', 'Salem'] },
  { state: 'Telangana', cities: ['Hyderabad', 'Warangal', 'Nizamabad', 'Khammam', 'Karimnagar'] },
  { state: 'Tripura', cities: ['Agartala', 'Udaipur', 'Dharmanagar', 'Kailashahar'] },
  { state: 'Uttar Pradesh', cities: ['Lucknow', 'Kanpur', 'Varanasi', 'Agra', 'Prayagraj', 'Noida', 'Ghaziabad'] },
  { state: 'Uttarakhand', cities: ['Dehradun', 'Haridwar', 'Roorkee', 'Haldwani', 'Rishikesh'] },
  { state: 'West Bengal', cities: ['Kolkata', 'Howrah', 'Siliguri', 'Durgapur', 'Asansol'] },
];

// Comprehensive US States and top metro areas
const US_DATA = [
  { state: 'California', cities: ['Los Angeles', 'San Francisco', 'San Diego', 'San Jose', 'Sacramento', 'Oakland'] },
  { state: 'Texas', cities: ['Houston', 'Dallas', 'Austin', 'San Antonio', 'Fort Worth', 'El Paso'] },
  { state: 'Florida', cities: ['Miami', 'Orlando', 'Tampa', 'Jacksonville', 'Fort Lauderdale'] },
  { state: 'New York', cities: ['New York City', 'Buffalo', 'Rochester', 'Albany', 'Syracuse'] },
  { state: 'Illinois', cities: ['Chicago', 'Aurora', 'Naperville', 'Rockford', 'Springfield'] },
  { state: 'Pennsylvania', cities: ['Philadelphia', 'Pittsburgh', 'Allentown', 'Erie', 'Reading'] },
  { state: 'Ohio', cities: ['Columbus', 'Cleveland', 'Cincinnati', 'Toledo', 'Akron'] },
  { state: 'Georgia', cities: ['Atlanta', 'Augusta', 'Savannah', 'Columbus', 'Macon'] },
  { state: 'North Carolina', cities: ['Charlotte', 'Raleigh', 'Greensboro', 'Durham', 'Winston-Salem'] },
  { state: 'Michigan', cities: ['Detroit', 'Grand Rapids', 'Warren', 'Ann Arbor', 'Lansing'] },
  { state: 'Washington', cities: ['Seattle', 'Spokane', 'Tacoma', 'Vancouver', 'Bellevue'] },
  { state: 'New Jersey', cities: ['Newark', 'Jersey City', 'Paterson', 'Elizabeth', 'Trenton'] },
  { state: 'Virginia', cities: ['Virginia Beach', 'Norfolk', 'Chesapeake', 'Richmond', 'Alexandria'] },
  { state: 'Massachusetts', cities: ['Boston', 'Worcester', 'Springfield', 'Cambridge', 'Lowell'] },
  { state: 'Arizona', cities: ['Phoenix', 'Tucson', 'Mesa', 'Chandler', 'Scottsdale'] },
  { state: 'Tennessee', cities: ['Nashville', 'Memphis', 'Knoxville', 'Chattanooga', 'Clarksville'] },
  { state: 'Indiana', cities: ['Indianapolis', 'Fort Wayne', 'Evansville', 'South Bend', 'Carmel'] },
  { state: 'Missouri', cities: ['Kansas City', 'St. Louis', 'Springfield', 'Columbia', 'Independence'] },
  { state: 'Maryland', cities: ['Baltimore', 'Frederick', 'Rockville', 'Gaithersburg', 'Bowie'] },
  { state: 'Colorado', cities: ['Denver', 'Colorado Springs', 'Aurora', 'Fort Collins', 'Lakewood'] },
  { state: 'Wisconsin', cities: ['Milwaukee', 'Madison', 'Green Bay', 'Kenosha', 'Racine'] },
  { state: 'Minnesota', cities: ['Minneapolis', 'Saint Paul', 'Rochester', 'Bloomington', 'Duluth'] },
];

export default function LocationSelectorScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const {
    setCurrentLocation,
    country,
    currency,
    setCountryAndCurrency,
  } = useApp();

  const [activeCountry, setActiveCountry] = useState(country || 'India');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStateObj, setSelectedStateObj] = useState(null);
  const [citiesModalVisible, setCitiesModalVisible] = useState(false);
  const [isLocatingCurrent, setIsLocatingCurrent] = useState(false);

  // Switch country & currency dynamically
  const handleSelectCountry = (targetCountry) => {
    setActiveCountry(targetCountry);
    const targetCurrency = targetCountry === 'United States' ? 'USD' : 'INR';
    setCountryAndCurrency(targetCountry, targetCurrency);
  };

  const currentDataset = activeCountry === 'United States' ? US_DATA : INDIA_DATA;

  // Filtered list based on search query
  const filteredStates = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return currentDataset;

    return currentDataset.filter((item) => {
      const matchState = item.state.toLowerCase().includes(q);
      const matchCity = item.cities.some((c) => c.toLowerCase().includes(q));
      return matchState || matchCity;
    });
  }, [searchQuery, currentDataset]);

  // Handle Selection of Location
  const handleSelectLocation = async (city, state) => {
    const isUS = activeCountry === 'United States';
    const resolved = {
      address: city ? `${city}, ${state}` : `All in ${state || activeCountry}`,
      city: city || state || (isUS ? 'All United States' : 'All India'),
      state: state || (isUS ? 'USA' : 'India'),
      country: activeCountry,
      pincode: isUS ? '90001' : '452010',
    };

    setCurrentLocation(resolved);
    await AsyncStorage.setItem(HAS_SELECTED_LOCATION_KEY, 'true');
    setCitiesModalVisible(false);
    navigation.navigate('Main');
  };

  // Handle "Use current location"
  const handleUseCurrentLocation = async () => {
    setIsLocatingCurrent(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const position = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        const [geo] = await Location.reverseGeocodeAsync({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        }).catch(() => []);

        const isUS = geo?.country?.toLowerCase().includes('united states') || activeCountry === 'United States';
        if (isUS && activeCountry !== 'United States') {
          handleSelectCountry('United States');
        } else if (!isUS && activeCountry !== 'India') {
          handleSelectCountry('India');
        }

        const resolved = {
          address: geo
            ? `${geo.name || geo.street || ''}, ${geo.city || geo.subregion || 'Indore'}, ${geo.region || 'Madhya Pradesh'}`.trim()
            : (activeCountry === 'United States' ? 'San Jose, California' : 'Vijay Nagar, Indore, Madhya Pradesh'),
          city: geo?.city || geo?.subregion || (activeCountry === 'United States' ? 'San Jose' : 'Indore'),
          state: geo?.region || (activeCountry === 'United States' ? 'California' : 'Madhya Pradesh'),
          country: isUS ? 'United States' : 'India',
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };

        setCurrentLocation(resolved);
        await AsyncStorage.setItem(HAS_SELECTED_LOCATION_KEY, 'true');
        navigation.navigate('Main');
      } else {
        // If not granted, default to Indore, MP for India or San Jose for US
        handleSelectLocation(
          activeCountry === 'United States' ? 'San Jose' : 'Indore',
          activeCountry === 'United States' ? 'California' : 'Madhya Pradesh'
        );
      }
    } catch (e) {
      handleSelectLocation(
        activeCountry === 'United States' ? 'San Jose' : 'Indore',
        activeCountry === 'United States' ? 'California' : 'Madhya Pradesh'
      );
    } finally {
      setIsLocatingCurrent(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Deep Navy Blue Status Bar */}
      <RNStatusBar
        barStyle="light-content"
        backgroundColor="#00356B"
        translucent={false}
      />
      <ExpoStatusBar
        style="light"
        backgroundColor="#00356B"
        translucent={false}
      />

      {/* Top Header with Close (✕) and Title "Location" */}
      <View style={[styles.header, { paddingTop: Math.max(insets.top, 12) }]}>
        <View style={styles.headerContent}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            activeOpacity={0.7}
            style={styles.closeButton}
            accessibilityLabel="Close"
          >
            <Ionicons name="close" size={26} color="#002F34" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Location</Text>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBox}>
          <Ionicons name="search-outline" size={20} color="#002F34" style={styles.searchIcon} />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search city, area or neighbourhood"
            placeholderTextColor="#94A3B8"
            style={styles.searchInput}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={18} color="#94A3B8" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* "Use current location" Row */}
      <TouchableOpacity
        onPress={handleUseCurrentLocation}
        disabled={isLocatingCurrent}
        activeOpacity={0.7}
        style={styles.currentLocationRow}
      >
        <View style={styles.locateIconWrapper}>
          {isLocatingCurrent ? (
            <ActivityIndicator size="small" color="#0078FF" />
          ) : (
            <Ionicons name="locate-outline" size={26} color="#0078FF" />
          )}
        </View>
        <View style={styles.currentLocationTextCol}>
          <Text style={styles.currentLocationTitle}>Use current location</Text>
          <Text style={styles.currentLocationSubtitle}>Enable Location</Text>
        </View>
      </TouchableOpacity>

      {/* Country Selector: India 🇮🇳 (INR ₹) vs United States 🇺🇸 (USD $) */}
      <View style={styles.countryTabs}>
        <TouchableOpacity
          onPress={() => handleSelectCountry('India')}
          activeOpacity={0.8}
          style={[
            styles.countryTabButton,
            activeCountry === 'India' && styles.countryTabButtonActive,
          ]}
        >
          <Text
            style={[
              styles.countryTabText,
              activeCountry === 'India' && styles.countryTabTextActive,
            ]}
          >
            🇮🇳 India (₹ INR)
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => handleSelectCountry('United States')}
          activeOpacity={0.8}
          style={[
            styles.countryTabButton,
            activeCountry === 'United States' && styles.countryTabButtonActive,
          ]}
        >
          <Text
            style={[
              styles.countryTabText,
              activeCountry === 'United States' && styles.countryTabTextActive,
            ]}
          >
            🇺🇸 United States ($ USD)
          </Text>
        </TouchableOpacity>
      </View>

      {/* State List */}
      <FlatList
        data={filteredStates}
        keyExtractor={(item) => item.state}
        ListHeaderComponent={
          <View>
            <Text style={styles.chooseStateLabel}>CHOOSE STATE</Text>
            {/* "All in India" or "All in United States" option */}
            <TouchableOpacity
              onPress={() => handleSelectLocation('', '')}
              activeOpacity={0.7}
              style={styles.allCountryRow}
            >
              <Text style={styles.allCountryText}>
                {activeCountry === 'United States' ? 'All in United States' : 'All in India'}
              </Text>
            </TouchableOpacity>
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => {
              setSelectedStateObj(item);
              setCitiesModalVisible(true);
            }}
            activeOpacity={0.7}
            style={styles.stateRow}
          >
            <Text style={styles.stateName}>{item.state}</Text>
            <Ionicons name="chevron-forward" size={18} color="#002F34" />
          </TouchableOpacity>
        )}
        contentContainerStyle={{ paddingBottom: Math.max(insets.bottom, 16) + 24 }}
      />

      {/* City Picker Modal for Selected State */}
      <Modal
        visible={citiesModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setCitiesModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View
            style={[
              styles.modalSheet,
              { paddingBottom: Math.max(insets.bottom, 16) + 20 },
            ]}
          >
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{selectedStateObj?.state}</Text>
              <TouchableOpacity
                onPress={() => setCitiesModalVisible(false)}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              >
                <Ionicons name="close" size={24} color="#002F34" />
              </TouchableOpacity>
            </View>

            {/* "All in [State]" Option */}
            <TouchableOpacity
              onPress={() => handleSelectLocation('', selectedStateObj?.state)}
              style={styles.cityOptionRow}
            >
              <Text style={[styles.cityName, { color: '#0078FF', fontWeight: '700' }]}>
                All in {selectedStateObj?.state}
              </Text>
            </TouchableOpacity>

            {/* City Options List */}
            <FlatList
              data={selectedStateObj?.cities || []}
              keyExtractor={(city) => city}
              renderItem={({ item: city }) => (
                <TouchableOpacity
                  onPress={() => handleSelectLocation(city, selectedStateObj?.state)}
                  style={styles.cityOptionRow}
                >
                  <Text style={styles.cityName}>{city}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderColor: '#E5E7EB',
  },
  headerContent: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  closeButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 19,
    fontWeight: '600',
    color: '#002F34',
    marginLeft: 18,
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchBox: {
    height: 48,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 4,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    backgroundColor: '#FFFFFF',
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#002F34',
    height: '100%',
  },
  currentLocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderColor: '#E5E7EB',
  },
  locateIconWrapper: {
    width: 36,
    alignItems: 'center',
    marginRight: 12,
  },
  currentLocationTextCol: {
    flex: 1,
  },
  currentLocationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0078FF',
  },
  currentLocationSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  countryTabs: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 10,
    backgroundColor: '#F8FAFC',
    borderBottomWidth: 1,
    borderColor: '#E2E8F0',
  },
  countryTabButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 6,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  countryTabButtonActive: {
    backgroundColor: '#004796',
    borderColor: '#004796',
  },
  countryTabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#334155',
  },
  countryTabTextActive: {
    color: '#FFFFFF',
  },
  chooseStateLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
    letterSpacing: 0.5,
    paddingHorizontal: 16,
    marginTop: 18,
    marginBottom: 8,
  },
  allCountryRow: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderColor: '#F1F5F9',
  },
  allCountryText: {
    fontSize: 16,
    color: '#0078FF',
    fontWeight: '600',
  },
  stateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderColor: '#F1F5F9',
  },
  stateName: {
    fontSize: 16,
    color: '#002F34',
    fontWeight: '400',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: '75%',
    paddingTop: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderColor: '#E2E8F0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#002F34',
  },
  cityOptionRow: {
    paddingVertical: 15,
    paddingHorizontal: 18,
    borderBottomWidth: 1,
    borderColor: '#F1F5F9',
  },
  cityName: {
    fontSize: 15,
    color: '#002F34',
  },
});
