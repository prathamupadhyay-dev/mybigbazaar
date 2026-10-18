import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import HomeScreen from '../screens/home/HomeScreen';
import AccountScreen from '../screens/account/AccountScreen';
import ChatsScreen from '../screens/chat/ChatsScreen';
import PostAdScreen from '../screens/ads/PostAdScreen';
import MyAdsScreen from '../screens/ads/MyAdsScreen';

const Tab = createBottomTabNavigator();

export default function MainTabNavigator() {
  const insets = useSafeAreaInsets();
  const bottomInset = Math.max(insets.bottom, 8);
  const { isAuthenticated } = useApp();
  const navigation = useNavigation();

  const handleProtectedTabPress = (e) => {
    if (!isAuthenticated) {
      e.preventDefault();
      navigation.navigate('AuthLanding');
    }
  };

  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: '#8E8E93',
        tabBarStyle: {
          height: 54 + bottomInset,
          backgroundColor: '#FFFFFF',
          paddingBottom: bottomInset,
          paddingTop: 6,
          borderTopWidth: 0.5,
          borderTopColor: '#E5E5EA',
          elevation: 2,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -1 },
          shadowOpacity: 0.04,
          shadowRadius: 4,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '500',
          marginTop: 2,
        },
      }}
    >
      {/* 1. Home Tab */}
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ focused }) => (
            <Ionicons
              name={focused ? 'home' : 'home-outline'}
              size={23}
              color={focused ? '#007AFF' : '#8E8E93'}
            />
          ),
        }}
      />

      {/* 2. Chats Tab (Messages bubble style) */}
      <Tab.Screen
        name="Chats"
        component={ChatsScreen}
        listeners={{
          tabPress: handleProtectedTabPress,
        }}
        options={{
          tabBarLabel: 'Chats',
          tabBarIcon: ({ focused }) => (
            <Ionicons
              name={focused ? 'chatbubble-ellipses' : 'chatbubble-ellipses-outline'}
              size={23}
              color={focused ? '#007AFF' : '#8E8E93'}
            />
          ),
        }}
      />

      {/* 3. Sell Tab (Clean Elevated Action Button) */}
      <Tab.Screen
        name="Sell"
        component={PostAdScreen}
        listeners={({ navigation }) => ({
          tabPress: (e) => {
            if (!isAuthenticated) {
              e.preventDefault();
              navigation.navigate('AuthLanding');
            } else {
              navigation.navigate('Sell', { resetToCategories: Date.now() });
            }
          },
        })}
        options={{
          tabBarStyle: { display: 'none' },
          tabBarLabel: 'Sell',
          tabBarButton: (props) => (
            <View style={styles.sellTabSlot}>
              <TouchableOpacity
                {...props}
                onPress={(e) => {
                  if (!isAuthenticated) {
                    navigation.navigate('AuthLanding');
                  } else {
                    navigation.navigate('Sell', { resetToCategories: Date.now() });
                    if (props.onPress) {
                      props.onPress(e);
                    }
                  }
                }}
                activeOpacity={0.88}
                style={styles.sellTabButton}
                accessibilityLabel="Sell an item"
              >
                <View style={styles.sellButtonCircle}>
                  <Ionicons name="add" size={26} color="#FFFFFF" />
                </View>
                <Text style={styles.sellLabel}>Sell</Text>
              </TouchableOpacity>
            </View>
          ),
        }}
      />

      {/* 4. My Ads Tab (Collections / Albums style) */}
      <Tab.Screen
        name="MyAds"
        component={MyAdsScreen}
        listeners={{
          tabPress: handleProtectedTabPress,
        }}
        options={{
          tabBarLabel: 'My Ads',
          tabBarIcon: ({ focused }) => (
            <Ionicons
              name={focused ? 'albums' : 'albums-outline'}
              size={23}
              color={focused ? '#007AFF' : '#8E8E93'}
            />
          ),
        }}
      />

      {/* 5. Account Tab (Profile circle icon) */}
      <Tab.Screen
        name="Account"
        component={AccountScreen}
        listeners={{
          tabPress: handleProtectedTabPress,
        }}
        options={{
          tabBarLabel: 'Account',
          tabBarIcon: ({ focused }) => (
            <Ionicons
              name={focused ? 'person-circle' : 'person-circle-outline'}
              size={25}
              color={focused ? '#007AFF' : '#8E8E93'}
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  sellTabSlot: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'visible',
  },
  sellTabButton: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -14,
  },
  sellButtonCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
  },
  sellLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#007AFF',
    marginTop: 2,
  },
});
