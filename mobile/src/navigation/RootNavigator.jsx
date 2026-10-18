import React from 'react';
import { Platform } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SplashScreen from '../screens/splash/SplashScreen';
import MainTabNavigator from './MainTabNavigator';
import EditProfileScreen from '../screens/profile/EditProfileScreen';
import ServiceBookingScreen from '../screens/services/ServiceBookingScreen';
import AddressManagementScreen from '../screens/address/AddressManagementScreen';
import PaymentManagementScreen from '../screens/payments/PaymentManagementScreen';
import HelpSupportScreen from '../screens/support/HelpSupportScreen';
import SearchScreen from '../screens/search/SearchScreen';
import MapScreen from '../screens/search/MapScreen';
import ServiceDetailsScreen from '../screens/services/ServiceDetailsScreen';
import NotificationsScreen from '../screens/notifications/NotificationsScreen';
import SavedSearchesScreen from '../screens/search/SavedSearchesScreen';
import { RootStackParamList } from './types';
import ProductListScreen from '../screens/products/ProductListScreen';
import ProductDetailsScreen from '../screens/products/ProductDetailsScreen';
import OrderHistoryScreen from '../screens/orders/OrderHistoryScreen';
import AuthLandingScreen from '../screens/auth/AuthLandingScreen';
import PhoneLoginScreen from '../screens/auth/PhoneLoginScreen';
import EmailLoginScreen from '../screens/auth/EmailLoginScreen';
import PasswordLoginScreen from '../screens/auth/PasswordLoginScreen';
import SignupMethodScreen from '../screens/auth/SignupMethodScreen';
import SignupEmailScreen from '../screens/auth/SignupEmailScreen';
import SetPasswordScreen from '../screens/auth/SetPasswordScreen';
import HelpAndSupportScreen from '../screens/support/HelpAndSupportScreen';
import HelpCenterLegalScreen from '../screens/support/HelpCenterLegalScreen';
import LocationPromptScreen from '../screens/location/LocationPromptScreen';
import LocationSelectorScreen from '../screens/location/LocationSelectorScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import SignupScreen from '../screens/auth/SignupScreen';
import VerifyOtpScreen from '../screens/auth/VerifyOtpScreen';
import MyAdsScreen from '../screens/ads/MyAdsScreen';
import PostAdScreen from '../screens/ads/PostAdScreen';
import ChatScreen from '../screens/chat/ChatScreen';
import SecuritySettingsScreen from '../screens/account/SecuritySettingsScreen';
import WatchlistScreen from '../screens/watchlist/WatchlistScreen';
import BucketScreen from '../screens/bucket/BucketScreen';
import ServicesScreen from '../screens/services/ServicesScreen';
import MyActivityScreen from '../screens/activity/MyActivityScreen';
import SellerProfileScreen from '../screens/products/SellerProfileScreen';
import WalletScreen from '../screens/wallet/WalletScreen';
import InvoicesAndBillingScreen from '../screens/account/InvoicesAndBillingScreen';
import EliteBuyerScreen from '../screens/account/EliteBuyerScreen';

const Stack = createNativeStackNavigator();

export default function RootNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="Splash"
      screenOptions={{
        headerShown: false,
        animation: Platform.OS === 'android' ? 'ios_from_right' : 'default',
        gestureEnabled: true
      }}>
      
      <Stack.Screen name="Splash" component={SplashScreen} options={{ animation: 'fade' }} />
      <Stack.Screen name="Main" component={MainTabNavigator} />
      <Stack.Screen name="Services" component={ServicesScreen} />
      <Stack.Screen name="MyActivity" component={MyActivityScreen} />
      <Stack.Screen name="SellerProfile" component={SellerProfileScreen} />
      <Stack.Screen name="Bookings" component={require('../screens/bookings/BookingsScreen').default} />
      <Stack.Screen name="EditProfile" component={EditProfileScreen} />
      <Stack.Screen name="ServiceBooking" component={ServiceBookingScreen} />
      <Stack.Screen name="AddressManagement" component={AddressManagementScreen} />
      <Stack.Screen name="PaymentManagement" component={PaymentManagementScreen} />
      <Stack.Screen name="SecuritySettings" component={SecuritySettingsScreen} />
      <Stack.Screen name="Watchlist" component={WatchlistScreen} />
      <Stack.Screen name="Wallet" component={WalletScreen} />
      <Stack.Screen name="Bucket" component={BucketScreen} />
      <Stack.Screen name="HelpSupport" component={HelpSupportScreen} />
      <Stack.Screen name="Search" component={SearchScreen} />
      <Stack.Screen name="Map" component={MapScreen} />
      <Stack.Screen name="MapScreen" component={MapScreen} />
      <Stack.Screen name="AllItems" component={require('../screens/search/AllItemsScreen').default} />
      <Stack.Screen
        name="ServiceDetails"
        component={ServiceDetailsScreen}
        options={{ animation: 'fade' }} />
      
      <Stack.Screen name="ProductList" component={ProductListScreen} />
      <Stack.Screen name="ProductDetails" component={ProductDetailsScreen} />
      <Stack.Screen name="Checkout" component={require('../screens/checkout/CheckoutScreen').default} />
      <Stack.Screen name="OrderSuccess" component={require('../screens/checkout/OrderSuccessScreen').default} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} />
      <Stack.Screen name="SavedSearches" component={SavedSearchesScreen} />
      <Stack.Screen name="FAQ" component={require('../screens/support/FAQScreen').default} />
      <Stack.Screen name="InvoicesAndBilling" component={InvoicesAndBillingScreen} />
      <Stack.Screen name="EliteBuyer" component={EliteBuyerScreen} />
      <Stack.Screen name="Receipts" component={require('../screens/account/ReceiptsScreen').default} />
      <Stack.Screen name="DeleteAccount" component={require('../screens/account/DeleteAccountScreen').default} />
      <Stack.Screen name="OrderHistory" component={OrderHistoryScreen} />
      <Stack.Screen name="AuthLanding" component={AuthLandingScreen} />
      <Stack.Screen name="Login" component={AuthLandingScreen} />
      <Stack.Screen name="PhoneLogin" component={PhoneLoginScreen} />
      <Stack.Screen name="EmailLogin" component={EmailLoginScreen} />
      <Stack.Screen name="PasswordLogin" component={PasswordLoginScreen} />
      <Stack.Screen name="SignupMethod" component={SignupMethodScreen} />
      <Stack.Screen name="SignupEmail" component={SignupEmailScreen} />
      <Stack.Screen name="SetPassword" component={SetPasswordScreen} />
      <Stack.Screen name="HelpAndSupport" component={HelpAndSupportScreen} />
      <Stack.Screen name="HelpCenterLegal" component={HelpCenterLegalScreen} />
      <Stack.Screen name="LocationPrompt" component={LocationPromptScreen} />
      <Stack.Screen name="LocationSelector" component={LocationSelectorScreen} />
      <Stack.Screen name="LoginLegacy" component={LoginScreen} />
      <Stack.Screen name="Signup" component={SignupScreen} />
      <Stack.Screen name="VerifyOtp" component={VerifyOtpScreen} />
      <Stack.Screen name="MyAds" component={MyAdsScreen} />
      <Stack.Screen name="PostAd" component={PostAdScreen} />
      <Stack.Screen name="Chat" component={ChatScreen} />
      <Stack.Screen name="ProviderOnboarding" component={require('../screens/provider/ProviderOnboardingScreen').default} />
      <Stack.Screen name="ProviderKYC" component={require('../screens/provider/ProviderKYCScreen').default} />
      <Stack.Screen name="ProviderDashboard" component={require('../screens/provider/ProviderDashboardScreen').default} />
      <Stack.Screen name="ProviderServiceForm" component={require('../screens/provider/ProviderServiceFormScreen').default} />
    </Stack.Navigator>);

}
