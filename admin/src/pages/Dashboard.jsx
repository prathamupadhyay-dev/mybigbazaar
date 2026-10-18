// ============================================================
// MyBigBazaar Admin Panel — Master Desktop Shell Component
// macOS Native Desktop Application Architecture
// ============================================================

import React, { useState, Suspense } from 'react'
import { lazyRetry } from '../utils/lazyRetry'
import { Routes, Route, Navigate } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import Header from '../components/Header'
import Footer from '../components/Footer'
import PageSkeletonLoader from '../components/PageSkeletonLoader'

// Lazy Route Imports for Verified Business Modules
const Overview = lazyRetry(() => import('./Overview'))

const UsersList = lazyRetry(() => import('./UsersList'))
const UserVerification = lazyRetry(() => import('./UserVerification'))
const SuspendedUsers = lazyRetry(() => import('./SuspendedUsers'))

const AllListings = lazyRetry(() => import('./AllListings'))
const PendingListings = lazyRetry(() => import('./PendingListings'))
const MarketplaceCategories = lazyRetry(() => import('./MarketplaceCategories'))
const MarketplaceSellerForms = lazyRetry(() => import('./MarketplaceSellerForms'))
const Promotions = lazyRetry(() => import('./Promotions'))
const AdCampaigns = lazyRetry(() => import('./AdCampaigns'))

const ServiceCatalogue = lazyRetry(() => import('./ServiceCatalogue'))
const ServiceCategories = lazyRetry(() => import('./ServiceCategories'))
const ServicePackages = lazyRetry(() => import('./ServicePackages'))

const AllProviders = lazyRetry(() => import('./AllProviders'))
const KYC = lazyRetry(() => import('./KYC'))

const AllBookings = lazyRetry(() => import('./AllBookings'))

const Transactions = lazyRetry(() => import('./Transactions'))
const Refunds = lazyRetry(() => import('./Refunds'))
const Invoices = lazyRetry(() => import('./Invoices'))
const Taxes = lazyRetry(() => import('./Taxes'))
const Wallets = lazyRetry(() => import('./Wallets'))

const Banners = lazyRetry(() => import('./Banners'))
const Gallery = lazyRetry(() => import('./Gallery'))
const StaticPages = lazyRetry(() => import('./StaticPages'))
const Notifications = lazyRetry(() => import('./Notifications'))
const SupportCenter = lazyRetry(() => import('./SupportCenter'))
const CustomerReviews = lazyRetry(() => import('./CustomerReviews'))
const RolesPermissions = lazyRetry(() => import('./RolesPermissions'))

const Settings = lazyRetry(() => import('./Settings'))
const Profile = lazyRetry(() => import('./Profile'))

const Orders = lazyRetry(() => import('./Orders'))
const ReportsHub = lazyRetry(() => import('./ReportsHub'))


function Dashboard({ onLogout, token }) {
  // Desktop sidebar default: expanded (206px macOS default), collapsible to compact rail (60px)
  const [sidebarOpen, setSidebarOpen] = useState(() => 
    typeof window !== 'undefined' ? window.innerWidth > 991 : true
  )

  const handleToggleSidebar = () => {
    setSidebarOpen(prev => !prev)
  }

  const handleCloseSidebar = () => {
    if (sidebarOpen) {
      setSidebarOpen(false)
    }
  }

  const [profileImage, setProfileImage] = useState(() => {
    return localStorage.getItem('adminProfileImage') || null
  })

  const [userName, setUserName] = useState(() => {
    try {
      const u = JSON.parse(localStorage.getItem('admin_user') || '{}')
      return u.name || u.fullName || localStorage.getItem('adminName') || 'Administrator'
    } catch {
      return localStorage.getItem('adminName') || 'Administrator'
    }
  })
  
  const [userEmail, setUserEmail] = useState(() => {
    try {
      const u = JSON.parse(localStorage.getItem('admin_user') || '{}')
      return u.email || localStorage.getItem('adminEmail') || 'admin@mybigbazaar.com'
    } catch {
      return localStorage.getItem('adminEmail') || 'admin@mybigbazaar.com'
    }
  })

  const handleProfileImageChange = (img) => {
    setProfileImage(img)
    if (img) localStorage.setItem('adminProfileImage', img)
  }

  return (
    <div className="dashboard-wrapper">
      <style>{`
        .dashboard-wrapper {
          display: flex;
          height: 100vh;
          width: 100vw;
          background-color: var(--color-canvas, #F6F5F2);
          overflow: hidden;
          position: relative;
        }
        
        /* macOS Native Desktop Sidebar Container */
        .dashboard-sidebar-container {
          flex-shrink: 0;
          height: 100vh;
          position: relative;
          z-index: 100;
          overflow: hidden;
          border-right: 1px solid var(--color-border, #E7E5E4);
          background-color: var(--color-panel, #FBFBFA);
        }
        .dashboard-sidebar-container.sidebar-collapsed {
          width: 60px !important;
        }

        /* Spatially stable main viewport: naturally reflows content */
        .dashboard-main {
          flex: 1 1 0;
          min-width: 0;
          height: 100vh;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          position: relative;
          background-color: var(--color-canvas, #F6F5F2);
        }

        .dashboard-content-wrapper {
          position: relative;
          flex: 1 1 0;
          min-height: 0;
          display: flex;
          flex-direction: column;
          width: 100%;
          min-width: 0;
          overflow-y: auto;
          overflow-x: hidden;
          background-color: var(--color-canvas, #F6F5F2);
        }

        .dashboard-content {
          flex: 1;
          box-sizing: border-box;
          width: 100%;
          min-width: 0;
          padding: 20px 24px 32px 24px;
        }

        @media (max-width: 991px) {
          .dashboard-mobile-backdrop {
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background-color: rgba(28, 25, 23, 0.45);
            backdrop-filter: blur(2px);
            -webkit-backdrop-filter: blur(2px);
            z-index: 1040;
          }
          .dashboard-sidebar-container {
            position: fixed;
            top: 0;
            left: 0;
            width: 260px;
            max-width: 80vw;
            transition: transform 180ms ease-out;
            z-index: 1050;
          }
          .dashboard-sidebar-container.sidebar-expanded {
            width: 260px;
            transform: translateX(0);
            box-shadow: 0 0 30px rgba(0,0,0,0.4);
          }
          .dashboard-sidebar-container.sidebar-collapsed {
            width: 260px;
            transform: translateX(-100%);
            box-shadow: none;
          }
          .dashboard-main {
            width: 100%;
            height: 100vh;
          }
          .dashboard-content {
            padding: 16px 14px 24px 14px;
          }
        }
      `}</style>

      {/* Mobile Drawer Backdrop Overlay */}
      {sidebarOpen && (
        <div
          onClick={handleCloseSidebar}
          className="dashboard-mobile-backdrop"
          aria-label="Close Navigation Sidebar Overlay"
        />
      )}

      <div 
        className={`dashboard-sidebar-container ${sidebarOpen ? 'sidebar-expanded' : 'sidebar-collapsed'}`}
        style={{
          width: sidebarOpen ? '206px' : '60px',
          transition: 'width 180ms cubic-bezier(0.16, 1, 0.3, 1)'
        }}
      >
        <Sidebar 
          isOpen={sidebarOpen} 
          onClose={handleCloseSidebar} 
          onToggle={handleToggleSidebar}
          profileImage={profileImage} 
          userName={userName} 
          userEmail={userEmail} 
          onLogout={onLogout} 
        />
      </div>
      
      <div className="dashboard-main">
        <Header 
          onLogout={onLogout} 
          onMenuToggle={handleToggleSidebar} 
          profileImage={profileImage} 
          token={token} 
        />

        <div className="dashboard-content-wrapper">
          <div className="dashboard-content">
            <Suspense fallback={<PageSkeletonLoader />}>
              <Routes>
                {/* 1. OVERVIEW */}
                <Route index element={<Overview token={token} />} />

                {/* ORDERS */}
                <Route path="orders" element={<Orders token={token} />} />
                <Route path="orders/:tab" element={<Orders token={token} />} />

                {/* 2. PEOPLE */}
                <Route path="users" element={<UsersList token={token} />} />
                <Route path="users/verification" element={<UserVerification token={token} />} />
                <Route path="users/suspended" element={<SuspendedUsers token={token} />} />

                {/* 3. MARKETPLACE */}
                <Route path="marketplace" element={<Navigate to="/dashboard/marketplace/categories" replace />} />
                <Route path="marketplace/categories" element={<MarketplaceCategories token={token} />} />
                <Route path="marketplace/subcategories" element={<Navigate to="/dashboard/marketplace/categories" replace />} />
                <Route path="marketplace/seller-forms" element={<MarketplaceSellerForms token={token} />} />
                <Route path="marketplace/listings" element={<AllListings token={token} />} />
                {/* Backward compatibility aliases */}
                <Route path="listings" element={<AllListings token={token} />} />
                <Route path="listings/pending" element={<PendingListings token={token} />} />
                <Route path="listings/categories" element={<MarketplaceCategories token={token} />} />
                <Route path="listings/subcategories" element={<Navigate to="/dashboard/marketplace/categories" replace />} />
                <Route path="listings/seller-forms" element={<MarketplaceSellerForms token={token} />} />
                <Route path="promotions" element={<Promotions token={token} />} />

                {/* 4. ADVERTISEMENT */}
                <Route path="advertisement" element={<Navigate to="/dashboard/advertisement/campaigns" replace />} />
                <Route path="advertisement/banners" element={<Banners token={token} />} />
                <Route path="advertisement/campaigns" element={<AdCampaigns token={token} />} />
                <Route path="advertisement/ad-campaign" element={<AdCampaigns token={token} />} />
                <Route path="ad-campaigns" element={<AdCampaigns token={token} />} />
                <Route path="cms/campaigns" element={<AdCampaigns token={token} />} />
                <Route path="cms/promotions" element={<AdCampaigns token={token} />} />
                <Route path="cms/ad-campaign" element={<AdCampaigns token={token} />} />

                {/* 5. SERVICES */}
                <Route path="services" element={<ServiceCatalogue token={token} />} />
                <Route path="services/categories" element={<ServiceCategories token={token} />} />
                <Route path="providers" element={<AllProviders token={token} />} />
                <Route path="providers/kyc" element={<KYC token={token} />} />
                {/* 5. COMMERCE */}
                <Route path="bookings" element={<AllBookings token={token} />} />
                <Route path="deals" element={<AllBookings token={token} />} />
                <Route path="commerce/deals" element={<AllBookings token={token} />} />
                <Route path="commerce/bookings" element={<AllBookings token={token} />} />
                <Route path="payments/invoices" element={<Invoices token={token} />} />
                <Route path="payments/transactions" element={<Transactions token={token} />} />
                <Route path="payments/refunds" element={<Refunds token={token} />} />
                <Route path="payments/taxes" element={<Taxes token={token} />} />
                <Route path="taxes" element={<Taxes token={token} />} />
                <Route path="payments/wallets" element={<Wallets token={token} />} />
                <Route path="wallets" element={<Wallets token={token} />} />

                {/* 6. COMMUNICATION */}
                <Route path="notifications" element={<Notifications token={token} />} />
                <Route path="support/tickets" element={<SupportCenter token={token} />} />
                <Route path="communication/reviews" element={<CustomerReviews token={token} />} />
                <Route path="reviews" element={<CustomerReviews token={token} />} />

                {/* REPORTS & ANALYTICS */}
                <Route path="reports" element={<ReportsHub token={token} />} />
                <Route path="reports/:tab" element={<ReportsHub token={token} />} />

                {/* 8. CONTENT */}
                <Route path="cms/banners" element={<Banners token={token} />} />
                <Route path="cms/gallery" element={<Gallery token={token} />} />
                <Route path="cms/policies" element={<StaticPages token={token} />} />
                <Route path="cms/pages" element={<StaticPages token={token} />} />
                <Route path="cms/legal" element={<StaticPages token={token} />} />
                <Route path="pages/static" element={<Navigate to="/dashboard/cms/policies" replace />} />
                <Route path="pages" element={<Navigate to="/dashboard/cms/policies" replace />} />

                {/* 9. SETTING */}
                <Route path="settings/roles" element={<RolesPermissions token={token} />} />
                <Route path="settings" element={<Settings token={token} />} />

                {/* 9. ACCOUNT */}
                <Route 
                  path="profile" 
                  element={
                    <Profile 
                      profileImage={profileImage} 
                      onProfileImageChange={handleProfileImageChange} 
                      token={token} 
                      onLogout={onLogout} 
                    />
                  } 
                />
                <Route 
                  path="account" 
                  element={<Navigate to="/dashboard/profile" replace />} 
                />
                
                {/* Fallback to Overview */}
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Routes>
            </Suspense>
          </div>
        </div>

        <Footer />
      </div>
    </div>
  )
}

export default Dashboard
