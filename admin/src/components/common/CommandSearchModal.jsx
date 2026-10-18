import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  LayoutDashboard,
  Users,
  ShoppingBag,
  Briefcase,
  CreditCard,
  MessageSquare,
  ShieldAlert,
  Settings2,
  Tag,
  Plus,
  Percent,
  Clock,
  CornerDownLeft,
  CircleUserRound,
  FileSpreadsheet,
  FileText,
  Smartphone,
  X,
  Package,
  BarChart3
} from 'lucide-react';

/**
 * CommandSearchModal - Native macOS Spotlight Command Palette (⌘K)
 * Clean section grouping: RECENT / PAGES / ACTIONS / RESULTS
 * Full keyboard arrow navigation, Enter selection, Esc dismissal
 * Zero fake entities; real supported platform commands.
 */
export default function CommandSearchModal({ isOpen, onClose }) {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);

  // Load genuine recently executed commands from localStorage
  const [recentIds, setRecentIds] = useState(() => {
    try {
      const saved = localStorage.getItem('mbb_admin_recent_commands');
      return saved ? JSON.parse(saved) : ['rec-overview', 'rec-users', 'rec-listings'];
    } catch {
      return ['rec-overview', 'rec-users', 'rec-listings'];
    }
  });

  // Master index of searchable pages and operational actions
  const commandIndex = useMemo(() => [
    // ACTIONS
    {
      id: 'act-new-listing',
      title: 'Create Product Listing',
      section: 'ACTIONS',
      subtitle: 'Publish or moderate a classified marketplace item',
      path: '/dashboard/listings',
      icon: Plus,
      color: '#C2410C'
    },
    {
      id: 'act-new-cat',
      title: 'Add Marketplace Category',
      section: 'ACTIONS',
      subtitle: 'Configure taxonomy and seller specifications',
      path: '/dashboard/marketplace/categories',
      icon: Tag,
      color: '#15803D'
    },
    {
      id: 'act-new-service-cat',
      title: 'Add Service Category',
      section: 'ACTIONS',
      subtitle: 'Create doorstep professional vertical',
      path: '/dashboard/services/categories',
      icon: Briefcase,
      color: '#4338CA'
    },
    {
      id: 'act-new-tax',
      title: 'Add GST Tax Slab',
      section: 'ACTIONS',
      subtitle: 'Configure statutory tax percentage',
      path: '/dashboard/payments/taxes',
      icon: Percent,
      color: '#0B2545'
    },
    {
      id: 'act-review-kyc',
      title: 'Review Pending KYC Requests',
      section: 'ACTIONS',
      subtitle: 'Identity verification for users and providers',
      path: '/dashboard/users/verification',
      icon: ShieldAlert,
      color: '#BE123C'
    },
    {
      id: 'act-export-users',
      title: 'Export User Directory CSV',
      section: 'ACTIONS',
      subtitle: 'Download complete registered user records',
      path: '/dashboard/users',
      icon: FileSpreadsheet,
      color: '#0B2545'
    },
    {
      id: 'act-edit-privacy',
      title: 'Edit Privacy Policy',
      section: 'ACTIONS',
      subtitle: 'Update dynamic user data protection policy',
      path: '/dashboard/cms/policies',
      icon: FileText,
      color: '#C2410C'
    },
    {
      id: 'act-edit-refunds',
      title: 'Edit Refund & Cancellation Policy',
      section: 'ACTIONS',
      subtitle: 'Revise buyer escrow refund rules & service guarantees',
      path: '/dashboard/cms/policies',
      icon: FileText,
      color: '#15803D'
    },
    {
      id: 'act-edit-terms',
      title: 'Edit Terms of Service',
      section: 'ACTIONS',
      subtitle: 'Modify platform agreement and legal conditions',
      path: '/dashboard/cms/policies',
      icon: FileText,
      color: '#4338CA'
    },

    // PAGES
    {
      id: 'rec-overview',
      title: 'Overview Cockpit',
      section: 'PAGES',
      subtitle: 'Attention queues, operational snapshot, and live events',
      path: '/dashboard',
      icon: LayoutDashboard,
      color: 'var(--accent-color)'
    },
    {
      id: 'page-orders-pending',
      title: 'Pending Orders',
      section: 'PAGES',
      subtitle: 'Track placed, processing, and dispatched shipments',
      path: '/dashboard/orders/pending',
      icon: Package,
      color: '#C2410C'
    },
    {
      id: 'page-orders-completed',
      title: 'Completed Orders',
      section: 'PAGES',
      subtitle: 'Inspect successfully delivered and verified buyer orders',
      path: '/dashboard/orders/completed',
      icon: Package,
      color: '#15803D'
    },
    {
      id: 'page-orders-cancelled',
      title: 'Cancelled Orders',
      section: 'PAGES',
      subtitle: 'Review cancelled shipments and processed returns',
      path: '/dashboard/orders/cancelled',
      icon: Package,
      color: '#BE123C'
    },
    {
      id: 'page-reports-sales',
      title: 'Sales Report',
      section: 'PAGES',
      subtitle: 'Gross merchandise value, net sales, margins, and top products',
      path: '/dashboard/reports/sales',
      icon: BarChart3,
      color: '#0B2545'
    },
    {
      id: 'page-reports-daily',
      title: 'Daily Report',
      section: 'PAGES',
      subtitle: 'Today\'s operational pulse, signups, listings, and hourly volume',
      path: '/dashboard/reports/daily',
      icon: BarChart3,
      color: '#C2410C'
    },
    {
      id: 'page-reports-payments',
      title: 'Payment Report',
      section: 'PAGES',
      subtitle: 'Payment rails, gateway success rates, escrow, and settlements',
      path: '/dashboard/reports/payments',
      icon: BarChart3,
      color: '#4338CA'
    },
    {
      id: 'rec-users',
      title: 'User Directory',
      section: 'PAGES',
      subtitle: 'Manage buyers, sellers, and platform accounts',
      path: '/dashboard/users',
      icon: Users,
      color: '#4F8BFF'
    },
    {
      id: 'rec-suspended',
      title: 'Suspended Accounts',
      section: 'PAGES',
      subtitle: 'Restricted and suspended accounts review',
      path: '/dashboard/users/suspended',
      icon: Users,
      color: '#DC2626'
    },
    {
      id: 'rec-listings',
      title: 'Marketplace Listings',
      section: 'PAGES',
      subtitle: 'Search and inspect active product classifieds',
      path: '/dashboard/listings',
      icon: ShoppingBag,
      color: '#10B981'
    },
    {
      id: 'rec-pending-listings',
      title: 'Pending Listings',
      section: 'PAGES',
      subtitle: 'Approve or reject submitted classified ads',
      path: '/dashboard/listings/pending',
      icon: ShoppingBag,
      color: '#F59E0B'
    },
    {
      id: 'rec-categories',
      title: 'Product Categories',
      section: 'PAGES',
      subtitle: 'Manage classifieds taxonomy hierarchy',
      path: '/dashboard/listings/categories',
      icon: Tag,
      color: '#059669'
    },
    {
      id: 'rec-services',
      title: 'Service Catalogue & Packages',
      section: 'PAGES',
      subtitle: 'Doorstep services catalogue and tiers',
      path: '/dashboard/services',
      icon: Briefcase,
      color: '#D97706'
    },
    {
      id: 'rec-providers',
      title: 'Provider Roster',
      section: 'PAGES',
      subtitle: 'Verified local technicians and service providers',
      path: '/dashboard/providers',
      icon: Briefcase,
      color: '#2563EB'
    },
    {
      id: 'rec-bookings',
      title: 'Bookings & Orders',
      section: 'PAGES',
      subtitle: 'Track scheduled services and fulfillments',
      path: '/dashboard/bookings',
      icon: Briefcase,
      color: '#6366F1'
    },
    {
      id: 'rec-invoices',
      title: 'Orders / Tax Invoices',
      section: 'PAGES',
      subtitle: 'GST compliance and billing receipts',
      path: '/dashboard/payments/invoices',
      icon: CreditCard,
      color: '#14B8A6'
    },
    {
      id: 'rec-taxes',
      title: 'Taxes & Levies',
      section: 'PAGES',
      subtitle: 'Configure platform GST tax rules',
      path: '/dashboard/payments/taxes',
      icon: CreditCard,
      color: '#8B5CF6'
    },
    {
      id: 'rec-transactions',
      title: 'Payments & Transactions',
      section: 'PAGES',
      subtitle: 'Gateway ledger and reconciliation',
      path: '/dashboard/payments/transactions',
      icon: CreditCard,
      color: '#059669'
    },
    {
      id: 'rec-notifications',
      title: 'Notifications Center',
      section: 'PAGES',
      subtitle: 'System alerts and inquiry dispatch',
      path: '/dashboard/notifications',
      icon: MessageSquare,
      color: '#EC4899'
    },
    {
      id: 'rec-settings',
      title: 'Platform Settings',
      section: 'PAGES',
      subtitle: 'Store identity, author logo, and business parameters',
      path: '/dashboard/settings',
      icon: Settings2,
      color: '#64748B'
    },
    {
      id: 'rec-policies',
      title: 'Pages',
      section: 'PAGES',
      subtitle: 'Dynamic Privacy Policy, Terms of Service, and Refund Rules',
      path: '/dashboard/cms/policies',
      icon: FileText,
      color: '#C2410C'
    },
    {
      id: 'rec-gallery',
      title: 'Media',
      section: 'PAGES',
      subtitle: 'Upload and manage creative images and media assets',
      path: '/dashboard/cms/gallery',
      icon: Smartphone,
      color: '#007AFF'
    },
    {
      id: 'rec-profile',
      title: 'Administrator Profile',
      section: 'PAGES',
      subtitle: 'Security, credentials, and account settings',
      path: '/dashboard/profile',
      icon: CircleUserRound,
      color: 'var(--accent-color)'
    }
  ], []);

  // Filter commands by query
  const filteredList = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) {
      // Default view: Recent + Actions + Pages
      const recentItems = recentIds
        .map(id => commandIndex.find(c => c.id === id))
        .filter(Boolean)
        .slice(0, 4);

      const actionItems = commandIndex.filter(c => c.section === 'ACTIONS');
      const pageItems = commandIndex.filter(c => c.section === 'PAGES');

      return [
        ...recentItems.map(item => ({ ...item, displaySection: 'RECENT' })),
        ...actionItems.map(item => ({ ...item, displaySection: 'ACTIONS' })),
        ...pageItems.map(item => ({ ...item, displaySection: 'PAGES' }))
      ];
    }

    // Search query matches
    return commandIndex
      .filter(item => 
        item.title.toLowerCase().includes(q) ||
        item.subtitle.toLowerCase().includes(q) ||
        item.path.toLowerCase().includes(q)
      )
      .map(item => ({ ...item, displaySection: 'RESULTS' }));
  }, [query, commandIndex, recentIds]);

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);

  // Keyboard navigation within the palette
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev < filteredList.length - 1 ? prev + 1 : 0));
        return;
      }

      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : filteredList.length - 1));
        return;
      }

      if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredList[selectedIndex]) {
          executeCommand(filteredList[selectedIndex]);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, selectedIndex, filteredList, onClose]);

  const executeCommand = (cmd) => {
    if (!cmd) return;

    // Track in recent commands
    try {
      const nextRecent = [cmd.id, ...recentIds.filter(id => id !== cmd.id)].slice(0, 5);
      setRecentIds(nextRecent);
      localStorage.setItem('mbb_admin_recent_commands', JSON.stringify(nextRecent));
    } catch {}

    onClose();
    navigate(cmd.path);
  };

  if (!isOpen) return null;

  // Group filtered items by displaySection
  const groupedSections = {};
  filteredList.forEach((item, index) => {
    const s = item.displaySection;
    if (!groupedSections[s]) groupedSections[s] = [];
    groupedSections[s].push({ item, globalIndex: index });
  });

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(28, 25, 23, 0.45)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        zIndex: 2500,
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        paddingTop: '12vh',
        paddingLeft: '16px',
        paddingRight: '16px'
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '560px',
          backgroundColor: '#FBFBFA',
          borderRadius: '12px',
          border: '1px solid #E7E5E4',
          boxShadow: '0 24px 64px rgba(28, 25, 23, 0.2), 0 2px 10px rgba(28, 25, 23, 0.06)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          animation: 'paletteFadeScale 140ms ease-out'
        }}
      >
        {/* Search Input Bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '14px 18px',
            borderBottom: '1px solid #E7E5E4'
          }}
        >
          <Search size={18} strokeWidth={2} style={{ color: '#6F6A65', flexShrink: 0 }} />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Search commands, pages, or actions... (⌘K)"
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              fontSize: '0.94rem',
              color: '#1C1917',
              fontFamily: 'inherit'
            }}
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              style={{
                background: 'none',
                border: 'none',
                color: '#6F6A65',
                cursor: 'pointer',
                padding: '4px',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <X size={14} />
            </button>
          )}
          <kbd
            style={{
              padding: '2px 6px',
              borderRadius: '5px',
              backgroundColor: '#EEEDE9',
              border: '1px solid #E7E5E4',
              fontSize: '0.68rem',
              fontWeight: 600,
              color: '#57534E',
              fontFamily: 'inherit'
            }}
          >
            ESC
          </kbd>
        </div>

        {/* Command List Body */}
        <div
          style={{
            maxHeight: '380px',
            overflowY: 'auto',
            padding: '8px 6px',
            overscrollBehavior: 'contain'
          }}
        >
          {filteredList.length === 0 ? (
            <div
              style={{
                padding: '36px 16px',
                textAlign: 'center',
                color: '#6F6A65',
                fontSize: '0.84rem'
              }}
            >
              No matching commands or pages for &ldquo;{query}&rdquo;
            </div>
          ) : (
            Object.entries(groupedSections).map(([section, items]) => (
              <div key={section} style={{ marginBottom: '8px' }}>
                <div
                  style={{
                    padding: '6px 12px 4px 12px',
                    fontSize: '0.68rem',
                    fontWeight: 700,
                    letterSpacing: '0.05em',
                    textTransform: 'uppercase',
                    color: '#6F6A65',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  {section === 'RECENT' && <Clock size={12} />}
                  <span>{section}</span>
                </div>

                {items.map(({ item, globalIndex }) => {
                  const Icon = item.icon;
                  const isSelected = globalIndex === selectedIndex;

                  return (
                    <div
                      key={`${section}-${item.id}`}
                      onClick={() => executeCommand(item)}
                      onMouseEnter={() => setSelectedIndex(globalIndex)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '8px 12px',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        backgroundColor: isSelected ? '#EEEDE9' : 'transparent',
                        transition: 'background-color 100ms ease'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
                        <div
                          style={{
                            width: '28px',
                            height: '28px',
                            borderRadius: '6px',
                            backgroundColor: isSelected ? '#E7E5E4' : '#EEEDE9',
                            color: item.color || '#0B2545',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0
                          }}
                        >
                          <Icon size={16} strokeWidth={2} />
                        </div>
                        <div style={{ minWidth: 0 }}>
                          <div
                            style={{
                              fontSize: '0.84rem',
                              fontWeight: isSelected ? 600 : 500,
                              color: isSelected ? '#0B2545' : '#1C1917',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis'
                            }}
                          >
                            {item.title}
                          </div>
                          <div
                            style={{
                              fontSize: '0.72rem',
                              color: '#6F6A65',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis'
                            }}
                          >
                            {item.subtitle}
                          </div>
                        </div>
                      </div>

                      {isSelected && (
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            fontSize: '0.70rem',
                            color: '#0B2545',
                            fontWeight: 600
                          }}
                        >
                          <span>Open</span>
                          <CornerDownLeft size={12} strokeWidth={2.5} />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ))
          )}
        </div>

        {/* Footer Hint Bar */}
        <div
          style={{
            padding: '8px 16px',
            borderTop: '1px solid #E7E5E4',
            backgroundColor: '#EEEDE9',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '0.70rem',
            color: '#6F6A65'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span><kbd style={{ backgroundColor: '#FBFBFA', border: '1px solid #E7E5E4', padding: '1px 4px', borderRadius: '3px' }}>↑</kbd> <kbd style={{ backgroundColor: '#FBFBFA', border: '1px solid #E7E5E4', padding: '1px 4px', borderRadius: '3px' }}>↓</kbd> Navigate</span>
            <span><kbd style={{ backgroundColor: '#FBFBFA', border: '1px solid #E7E5E4', padding: '1px 4px', borderRadius: '3px' }}>↵</kbd> Select</span>
            <span><kbd style={{ backgroundColor: '#FBFBFA', border: '1px solid #E7E5E4', padding: '1px 4px', borderRadius: '3px' }}>ESC</kbd> Close</span>
          </div>
          <span>MyBigBazaar Spotlight</span>
        </div>
      </div>
    </div>
  );
}
