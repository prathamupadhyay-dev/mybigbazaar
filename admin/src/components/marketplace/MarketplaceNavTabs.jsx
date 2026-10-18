import React from 'react';
import { NavLink } from 'react-router-dom';
import { Layers, FolderTree, ClipboardList, ShoppingBag } from 'lucide-react';

export default function MarketplaceNavTabs({ activeTab }) {
  const tabs = [
    { id: 'categories', label: 'Categories', path: '/dashboard/marketplace/categories', icon: Layers },
    { id: 'seller-forms', label: 'Seller Form', path: '/dashboard/marketplace/seller-forms', icon: ClipboardList },
    { id: 'listings', label: 'Listings', path: '/dashboard/marketplace/listings', icon: ShoppingBag },
  ];

  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        backgroundColor: 'var(--color-sunken, #EEEDE9)',
        padding: '4px',
        borderRadius: '10px',
        marginBottom: '20px',
        border: '1px solid var(--color-border, #E7E5E4)'
      }}
      role="tablist"
      aria-label="Marketplace Navigation Tabs"
    >
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        return (
          <NavLink
            key={tab.id}
            to={tab.path}
            role="tab"
            aria-selected={isActive}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '7px 18px',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: isActive ? 600 : 500,
              textDecoration: 'none',
              color: isActive ? 'var(--color-navy, #0B2545)' : 'var(--color-text-secondary, #6F6A65)',
              backgroundColor: isActive ? 'var(--color-panel, #FBFBFA)' : 'transparent',
              boxShadow: isActive ? '0 1px 3px rgba(0,0,0,0.06)' : 'none',
              transition: 'all 140ms ease'
            }}
          >
            <Icon size={15} strokeWidth={isActive ? 2.2 : 1.8} />
            <span>{tab.label}</span>
          </NavLink>
        );
      })}
    </div>
  );
}
