/**
 * @file apps/web/src/App.jsx
 * @description Master router and state provider for MyBigBazaar Web.
 */

import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext.jsx';
import ScrollToTop from './components/ScrollToTop.jsx';

// Core Pages
import HomePage from './pages/HomePage.jsx';
import MarketplacePage from './pages/MarketplacePage.jsx';
import ListingDetailPage from './pages/ListingDetailPage.jsx';
import PostAdPage from './pages/PostAdPage.jsx';
import ServicesPage from './pages/ServicesPage.jsx';
import ServiceDetailPage from './pages/ServiceDetailPage.jsx';
import ProvidersPage from './pages/ProvidersPage.jsx';
import CartCheckoutPage from './pages/CartCheckoutPage.jsx';
import BookingConfirmationPage from './pages/BookingConfirmationPage.jsx';
import OrdersPage from './pages/OrdersPage.jsx';
import WatchlistPage from './pages/WatchlistPage.jsx';
import SellerProfilePage from './pages/SellerProfilePage.jsx';
import UserAccountPage from './pages/UserAccountPage.jsx';
import ChatOffersPage from './pages/ChatOffersPage.jsx';
import SearchResultsPage from './pages/SearchResultsPage.jsx';

// Marketing, Legal & Support Pages
import PartnerPage from './pages/PartnerPage.jsx';
import PrivacyPage from './pages/PrivacyPage.jsx';
import TermsPage from './pages/TermsPage.jsx';
import RefundsPage from './pages/RefundsPage.jsx';
import SafetyPage from './pages/SafetyPage.jsx';
import AboutPage from './pages/AboutPage.jsx';
import DeleteAccountPage from './pages/DeleteAccountPage.jsx';
import SupportCenterPage from './pages/SupportCenterPage.jsx';

export default function App() {
  return (
    <AppProvider>
      <ScrollToTop />
      <Routes>
        {/* Public Homepage */}
        <Route path="/" element={<HomePage />} />

        {/* Marketplace Journeys */}
        <Route path="/marketplace" element={<MarketplacePage />} />
        <Route path="/listing/:id" element={<ListingDetailPage />} />
        <Route path="/post-ad" element={<PostAdPage />} />
        <Route path="/favorites" element={<WatchlistPage />} />
        <Route path="/watchlist" element={<WatchlistPage />} />
        <Route path="/seller/:id" element={<SellerProfilePage />} />

        {/* Home Services Journeys */}
        <Route path="/services" element={<ServicesPage />} />
        <Route path="/service/:id" element={<ServiceDetailPage />} />
        <Route path="/providers" element={<ProvidersPage />} />
        <Route path="/cart" element={<CartCheckoutPage />} />
        <Route path="/checkout" element={<CartCheckoutPage />} />
        <Route path="/booking-confirmation/:id" element={<BookingConfirmationPage />} />

        {/* User Account, Orders & Negotiations */}
        <Route path="/orders" element={<OrdersPage />} />
        <Route path="/account" element={<UserAccountPage />} />
        <Route path="/profile" element={<UserAccountPage />} />
        <Route path="/chat" element={<ChatOffersPage />} />
        <Route path="/chat/:conversationId" element={<ChatOffersPage />} />
        <Route path="/search" element={<SearchResultsPage />} />

        {/* Partner & Trust Pages */}
        <Route path="/partner" element={<PartnerPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/privacy-policy" element={<PrivacyPage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/terms-of-service" element={<TermsPage />} />
        <Route path="/refunds" element={<RefundsPage />} />
        <Route path="/refund-policy" element={<RefundsPage />} />
        <Route path="/safety" element={<SafetyPage />} />
        <Route path="/delete-account" element={<DeleteAccountPage />} />

        {/* Statutory Grievance & Support Center */}
        <Route path="/support" element={<SupportCenterPage />} />
        <Route path="/contact" element={<SupportCenterPage />} />
        <Route path="/help" element={<SupportCenterPage />} />
        <Route path="/grievance" element={<SupportCenterPage />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppProvider>
  );
}
