/**
 * @file apps/admin/src/pages/RolesPermissions.jsx
 * @description Dynamic Role-Based Access Control (RBAC) Management Console
 * 
 * Features:
 * 1. Matrix Permissions Table:
 *    - Left: Full list of sidebar tabs grouped by Discord/macOS style categories.
 *    - Column 1: "Admin" system role (full access, protected).
 *    - Dynamic Role Columns: Any created role inserts a new column.
 *    - Under each column: Checkboxes for every single tab that control visible tabs.
 *    - Create Role button: Asks for role name, creates a new column immediately.
 * 2. User Directory & Role Assignments (Below Matrix):
 *    - Listing of administrative users along with their current assigned role.
 *    - "+ Add User" button: Search user by username or email, select user, choose role, and add to list.
 *    - Change Role option for any user in the table.
 *    - Delete User option with confirmation modal.
 */

import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Shield,
  ShieldCheck,
  Plus,
  Pencil,
  Trash2,
  Check,
  X,
  Lock,
  Search,
  AlertCircle,
  ChevronDown,
  ChevronRight,
  Layers,
  Sparkles,
  UserPlus,
  Users,
  UserCheck,
  UserX,
  SlidersHorizontal,
  Save,
  RefreshCw,
  Mail,
  User,
  ArrowRight,
  CheckCircle2,
  LayoutDashboard,
  Package,
  ShoppingBag,
  CreditCard,
  BarChart3,
  Megaphone,
  MessageSquare,
  ShieldAlert,
  Smartphone,
  Settings2,
  Tag,
  Radio,
  FileText,
  Clock,
  RotateCcw,
  Percent,
  Wallet,
  Calendar,
  Headphones,
  Star,
  Flag,
  History,
  Images,
  FileCheck,
  Crown
} from 'lucide-react';
import { apiGet, apiPost, apiPut, apiDelete, apiFetch } from '../utils/api';
import { SIDEBAR_NAV_STRUCTURE, getAllTabs } from '../config/sidebarNavigation';

// Tab item icon lookup matching Sidebar
const TAB_ICONS = {
  dashboard: LayoutDashboard,
  orders_pending: Clock,
  orders_completed: CheckCircle2,
  orders_cancelled: X,
  users: Users,
  users_verification: UserCheck,
  marketplace_categories: Layers,
  marketplace_seller_forms: FileText,
  marketplace_listings: Tag,
  commerce_bookings: ShoppingBag,
  commerce_invoices: FileText,
  commerce_payments: CreditCard,
  commerce_refunds: RotateCcw,
  commerce_taxes: Percent,
  commerce_wallets: Wallet,
  reports_sales: BarChart3,
  reports_daily: Calendar,
  reports_payments: CreditCard,
  advertisement_banners: Images,
  advertisement_campaigns: Megaphone,
  comm_notifications: Radio,
  comm_support: Headphones,
  comm_reviews: Star,
  cms_gallery: Images,
  cms_policies: FileCheck,
  config_roles: ShieldCheck,
  config_settings: Settings2
};

// Initial default administrative team members
const INITIAL_STAFF_MEMBERS = [
  {
    id: 'staff-1',
    _id: 'staff-1',
    name: 'Pratham Upadhyay',
    username: 'pratham_admin',
    email: 'pratham@mybigbazaar.com',
    role: 'admin',
    status: 'active',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces',
    assignedDate: '2026-09-01'
  },
  {
    id: 'staff-2',
    _id: 'staff-2',
    name: 'Aakash Verma',
    username: 'aakash_ops',
    email: 'aakash.v@mybigbazaar.com',
    role: 'moderator',
    status: 'active',
    avatar: null,
    assignedDate: '2026-09-15'
  },
  {
    id: 'staff-3',
    _id: 'staff-3',
    name: 'Neha Saxena',
    username: 'neha_support',
    email: 'neha.saxena@mybigbazaar.com',
    role: 'support',
    status: 'active',
    avatar: null,
    assignedDate: '2026-09-22'
  },
  {
    id: 'staff-4',
    _id: 'staff-4',
    name: 'Rajesh Sharma',
    username: 'rajesh_finance',
    email: 'rajesh.fin@mybigbazaar.com',
    role: 'finance',
    status: 'active',
    avatar: null,
    assignedDate: '2026-10-02'
  }
];

// Fallback search candidates pool when backend has few users
const FALLBACK_CANDIDATE_USERS = [
  { id: 'cand-1', name: 'Rahul Deshmukh', username: 'rahul_d', email: 'rahul.deshmukh@gmail.com', avatar: null },
  { id: 'cand-2', name: 'Pooja Iyer', username: 'pooja_iyer', email: 'pooja.iyer@outlook.com', avatar: null },
  { id: 'cand-3', name: 'Vikramaditya Rao', username: 'vikram_rao', email: 'vikram.rao@techcorp.in', avatar: null },
  { id: 'cand-4', name: 'Sunita Patel', username: 'sunita_p', email: 'sunita.patel@mybigbazaar.com', avatar: null },
  { id: 'cand-5', name: 'Devendra Kulkarni', username: 'dev_kulkarni', email: 'dev.kulkarni@gmail.com', avatar: null },
  { id: 'cand-6', name: 'Ananya Roy', username: 'ananya_roy', email: 'ananya.roy@yahoo.com', avatar: null },
  { id: 'cand-7', name: 'Karan Mehra', username: 'karan_m', email: 'karan.mehra@live.com', avatar: null },
  { id: 'cand-8', name: 'Tanvi Joshi', username: 'tanvi_joshi', email: 'tanvi.joshi@startup.io', avatar: null }
];

export default function RolesPermissions({ token }) {
  // -------------------------------------------------------------
  // 1. Roles & Permissions State
  // -------------------------------------------------------------
  const [roles, setRoles] = useState([]);
  const [loadingRoles, setLoadingRoles] = useState(true);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isSavingPermissions, setIsSavingPermissions] = useState(false);

  // Tab Matrix Filters & Expand
  const [tabSearchQuery, setTabSearchQuery] = useState('');
  const [collapsedCategories, setCollapsedCategories] = useState(new Set());

  // Selected Role (Initially null -> Left role column is blank & Bottom-Right user card shows nothing)
  const [selectedRoleId, setSelectedRoleId] = useState(null);

  // Modals for Roles
  const [showCreateRoleModal, setShowCreateRoleModal] = useState(false);
  const [createRoleName, setCreateRoleName] = useState('');
  const [createRoleDesc, setCreateRoleDesc] = useState('');
  const [createRoleTemplate, setCreateRoleTemplate] = useState('empty'); // 'empty' | 'dashboard' | 'all'
  const [deletingRole, setDeletingRole] = useState(null);
  const [editingRoleMeta, setEditingRoleMeta] = useState(null);

  // -------------------------------------------------------------
  // 2. User Directory & Role Assignment State
  // -------------------------------------------------------------
  const [teamMembers, setTeamMembers] = useState([]);
  const [loadingMembers, setLoadingMembers] = useState(true);
  const [memberSearchQuery, setMemberSearchQuery] = useState('');

  // Modals for Users
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [userSearchInput, setUserSearchInput] = useState('');
  const [userSearchResults, setUserSearchResults] = useState([]);
  const [isSearchingUsers, setIsSearchingUsers] = useState(false);
  const [selectedUserToAdd, setSelectedUserToAdd] = useState(null);
  const [selectedRoleForNewUser, setSelectedRoleForNewUser] = useState('moderator');

  // Change Role Modal
  const [userChangingRole, setUserChangingRole] = useState(null);
  const [targetNewRole, setTargetNewRole] = useState('');

  // Delete User Modal
  const [deletingUser, setDeletingUser] = useState(null);

  // Notifications Toast
  const [toast, setToast] = useState(null);
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3800);
  };

  // Flattened list of all navigation tabs from config
  const allTabs = useMemo(() => getAllTabs(), []);
  const totalTabsCount = allTabs.length;

  // -------------------------------------------------------------
  // 3. Load Roles
  // -------------------------------------------------------------
  const fetchRoles = async () => {
    setLoadingRoles(true);
    try {
      const res = await apiGet('/api/v1/roles', {}, token);
      const fetched = Array.isArray(res.data) ? res.data : (Array.isArray(res) ? res : []);

      // Default Admin role specification
      const defaultAdmin = {
        _id: 'system-admin',
        name: 'Admin',
        slug: 'admin',
        description: 'Primary platform administrator with full, unrestricted access to all tabs and features.',
        isSystem: true,
        cannotDelete: true,
        allowedTabs: ['*']
      };

      // Ensure Admin is always first column
      const adminExists = fetched.find(r => r.name?.toLowerCase() === 'admin');
      const otherRoles = fetched.filter(r => r.name?.toLowerCase() !== 'admin');

      let combined = [adminExists || defaultAdmin, ...otherRoles];

      // Provide default sample roles if user is starting fresh
      if (otherRoles.length === 0) {
        const sampleModerator = {
          _id: 'role-moderator',
          name: 'Moderator',
          slug: 'moderator',
          description: 'Content and listing moderation team with access to listings and reports.',
          isSystem: false,
          cannotDelete: false,
          allowedTabs: [
            'dashboard',
            'marketplace_categories',
            'marketplace_listings',
            'users_verification',
            'comm_reviews'
          ]
        };
        const sampleSupport = {
          _id: 'role-support',
          name: 'Support Agent',
          slug: 'support',
          description: 'Customer service desk handling inquiries, orders, and tickets.',
          isSystem: false,
          cannotDelete: false,
          allowedTabs: [
            'dashboard',
            'orders_pending',
            'orders_completed',
            'comm_support',
            'comm_notifications',
            'users'
          ]
        };
        const sampleFinance = {
          _id: 'role-finance',
          name: 'Finance Manager',
          slug: 'finance',
          description: 'Manage invoices, payments, refunds, taxes, wallets, and financial reports.',
          isSystem: false,
          cannotDelete: false,
          allowedTabs: [
            'dashboard',
            'commerce_invoices',
            'commerce_payments',
            'commerce_refunds',
            'commerce_taxes',
            'commerce_wallets',
            'reports_sales',
            'reports_payments'
          ]
        };
        combined = [adminExists || defaultAdmin, sampleModerator, sampleSupport, sampleFinance];
      }

      setRoles(combined);
      try {
        localStorage.setItem('mbb_admin_roles', JSON.stringify(combined));
      } catch {}
    } catch (err) {
      console.warn('Falling back to local storage roles:', err);
      let cached = [
        {
          _id: 'system-admin',
          name: 'Admin',
          slug: 'admin',
          description: 'Primary platform administrator with full unrestricted access.',
          isSystem: true,
          cannotDelete: true,
          allowedTabs: ['*']
        },
        {
          _id: 'role-moderator',
          name: 'Moderator',
          slug: 'moderator',
          description: 'Review listings, categories, and customer reviews.',
          isSystem: false,
          cannotDelete: false,
          allowedTabs: ['dashboard', 'marketplace_categories', 'marketplace_listings', 'comm_reviews']
        },
        {
          _id: 'role-support',
          name: 'Support Agent',
          slug: 'support',
          description: 'Customer service desk handling inquiries, orders, and tickets.',
          isSystem: false,
          cannotDelete: false,
          allowedTabs: ['dashboard', 'orders_pending', 'orders_completed', 'comm_support', 'comm_notifications', 'users']
        },
        {
          _id: 'role-finance',
          name: 'Finance Manager',
          slug: 'finance',
          description: 'Manage invoices, payments, refunds, taxes, wallets, and financial reports.',
          isSystem: false,
          cannotDelete: false,
          allowedTabs: ['dashboard', 'commerce_invoices', 'commerce_payments', 'commerce_refunds', 'commerce_taxes', 'commerce_wallets', 'reports_sales', 'reports_payments']
        }
      ];
      try {
        const stored = localStorage.getItem('mbb_admin_roles');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) cached = parsed;
        }
      } catch {}
      setRoles(cached);
    } finally {
      setLoadingRoles(false);
    }
  };

  // -------------------------------------------------------------
  // 4. Load Team Members
  // -------------------------------------------------------------
  const fetchTeamMembers = async () => {
    setLoadingMembers(true);
    try {
      let members = [];
      const res = await apiFetch('/api/v1/admin/users?limit=100');
      if (res.ok) {
        const json = await res.json();
        const list = Array.isArray(json) ? json : (json.data || json.users || []);
        // Only include users who have an admin/staff role
        const staff = list.filter(u => {
          const r = (u.role || '').toLowerCase();
          return r === 'admin' || r === 'moderator' || r === 'support' || r === 'finance' || (Array.isArray(u.userTypes) && u.userTypes.includes('admin'));
        });

        if (staff.length > 0) {
          members = staff.map((u, i) => ({
            id: u._id || u.id || `staff-${i}`,
            _id: u._id || u.id,
            name: u.fullName || u.name || 'Team Member',
            username: u.username || (u.email ? u.email.split('@')[0] : `user_${i + 1}`),
            email: u.email || '—',
            role: (u.role || 'moderator').toLowerCase(),
            status: u.status || 'active',
            avatar: u.avatarUrl || null,
            assignedDate: u.createdAt ? new Date(u.createdAt).toISOString().slice(0, 10) : '2026-10-01'
          }));
        }
      }

      // If backend has no team members yet, use cached or initial sample staff
      if (members.length === 0) {
        try {
          const cached = localStorage.getItem('mbb_admin_team_members');
          if (cached) {
            const parsed = JSON.parse(cached);
            if (Array.isArray(parsed) && parsed.length > 0) members = parsed;
          }
        } catch {}
      }

      if (members.length === 0) {
        members = INITIAL_STAFF_MEMBERS;
      }

      setTeamMembers(members);
      try {
        localStorage.setItem('mbb_admin_team_members', JSON.stringify(members));
      } catch {}
    } catch (err) {
      console.warn('Using cached team members:', err);
      let fallback = INITIAL_STAFF_MEMBERS;
      try {
        const cached = localStorage.getItem('mbb_admin_team_members');
        if (cached) fallback = JSON.parse(cached);
      } catch {}
      setTeamMembers(fallback);
    } finally {
      setLoadingMembers(false);
    }
  };

  useEffect(() => {
    fetchRoles();
    fetchTeamMembers();
  }, [token]);

  // -------------------------------------------------------------
  // 5. Matrix Checkbox Toggle & Permission Updates
  // -------------------------------------------------------------
  const isTabAllowedForRole = (role, tabId) => {
    if (!role) return false;
    if (role.name?.toLowerCase() === 'admin' || role.isSystem) return true;
    if (role.allowedTabs === '*' || (Array.isArray(role.allowedTabs) && role.allowedTabs.includes('*'))) return true;
    if (Array.isArray(role.allowedTabs)) {
      return role.allowedTabs.includes(tabId);
    }
    return false;
  };

  const toggleTabForRole = (roleId, tabId) => {
    setRoles(prev => {
      const updated = prev.map(r => {
        if ((r._id === roleId || r.id === roleId)) {
          // Cannot alter system admin wildcard
          if (r.name?.toLowerCase() === 'admin' || r.isSystem) return r;

          let currentTabs = Array.isArray(r.allowedTabs) ? [...r.allowedTabs] : [];
          if (currentTabs.includes(tabId)) {
            currentTabs = currentTabs.filter(t => t !== tabId);
          } else {
            currentTabs.push(tabId);
          }
          return { ...r, allowedTabs: currentTabs };
        }
        return r;
      });

      // Save to localStorage immediately
      try {
        localStorage.setItem('mbb_admin_roles', JSON.stringify(updated));
      } catch {}
      setHasUnsavedChanges(true);
      return updated;
    });
  };

  // Toggle entire category for a role
  const toggleCategoryForRole = (roleId, categoryItemIds) => {
    setRoles(prev => {
      const updated = prev.map(r => {
        if ((r._id === roleId || r.id === roleId)) {
          if (r.name?.toLowerCase() === 'admin' || r.isSystem) return r;

          let currentTabs = Array.isArray(r.allowedTabs) ? [...r.allowedTabs] : [];
          const allAlreadySelected = categoryItemIds.every(id => currentTabs.includes(id));

          if (allAlreadySelected) {
            // Deselect all in category
            currentTabs = currentTabs.filter(id => !categoryItemIds.includes(id));
          } else {
            // Select all in category
            const set = new Set([...currentTabs, ...categoryItemIds]);
            currentTabs = Array.from(set);
          }
          return { ...r, allowedTabs: currentTabs };
        }
        return r;
      });

      try {
        localStorage.setItem('mbb_admin_roles', JSON.stringify(updated));
      } catch {}
      setHasUnsavedChanges(true);
      return updated;
    });
  };

  // Toggle all tabs for a role
  const toggleAllForRole = (roleId, selectAll) => {
    setRoles(prev => {
      const updated = prev.map(r => {
        if ((r._id === roleId || r.id === roleId)) {
          if (r.name?.toLowerCase() === 'admin' || r.isSystem) return r;
          return {
            ...r,
            allowedTabs: selectAll ? allTabs.map(t => t.id) : ['dashboard']
          };
        }
        return r;
      });
      try {
        localStorage.setItem('mbb_admin_roles', JSON.stringify(updated));
      } catch {}
      setHasUnsavedChanges(true);
      return updated;
    });
  };

  // Save all modified permissions to backend and update active session
  const saveAllPermissions = async () => {
    setIsSavingPermissions(true);
    try {
      // Sync each role
      for (const role of roles) {
        if (role._id && !role._id.startsWith('role-') && !role._id.startsWith('system-')) {
          try {
            await apiPut(`/api/v1/roles/${role._id}`, {
              name: role.name,
              description: role.description,
              allowedTabs: role.allowedTabs
            }, {}, token);
          } catch (e) {
            console.warn(`Failed to sync role ${role.name} to server:`, e);
          }
        }
      }

      // Check if current user's role was updated
      const activeRole = localStorage.getItem('adminRole') || '';
      const matched = roles.find(r => r.name?.toLowerCase() === activeRole.toLowerCase());
      if (matched) {
        localStorage.setItem('adminRolePermissions', JSON.stringify(matched.allowedTabs));
      }

      setHasUnsavedChanges(false);
      showToast('Role permissions saved and updated successfully.');

      // Dispatch event to dynamically reload sidebar items
      window.dispatchEvent(new CustomEvent('role-permissions-updated'));
    } catch (err) {
      showToast('Saved locally. Some server updates could not complete.', 'error');
    } finally {
      setIsSavingPermissions(false);
    }
  };

  // -------------------------------------------------------------
  // 6. Create Role Modal (Adds a new column to the table)
  // -------------------------------------------------------------
  const handleCreateRole = async (e) => {
    e.preventDefault();
    const trimmed = createRoleName.trim();
    if (!trimmed) {
      showToast('Please enter a role name.', 'error');
      return;
    }

    // Check duplicate
    const exists = roles.some(r => r.name.toLowerCase() === trimmed.toLowerCase());
    if (exists) {
      showToast(`A role named "${trimmed}" already exists.`, 'error');
      return;
    }

    let initialTabs = [];
    if (createRoleTemplate === 'dashboard') {
      initialTabs = ['dashboard'];
    } else if (createRoleTemplate === 'all') {
      initialTabs = allTabs.map(t => t.id);
    }

    const newSlug = trimmed.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const newRolePayload = {
      name: trimmed,
      slug: newSlug,
      description: createRoleDesc.trim(),
      isSystem: false,
      cannotDelete: false,
      allowedTabs: initialTabs
    };

    try {
      let savedRole = null;
      try {
        const res = await apiPost('/api/v1/roles', newRolePayload, {}, token);
        savedRole = res.data;
      } catch (apiErr) {
        console.warn('Could not save role to backend, persisting in local state:', apiErr);
      }

      const finalizedRole = savedRole || {
        _id: `role-${Date.now()}`,
        ...newRolePayload
      };

      const updatedRoles = [...roles, finalizedRole];
      setRoles(updatedRoles);
      try {
        localStorage.setItem('mbb_admin_roles', JSON.stringify(updatedRoles));
      } catch {}

      setSelectedRoleId(finalizedRole._id || finalizedRole.id);
      setShowCreateRoleModal(false);
      setCreateRoleName('');
      setCreateRoleDesc('');
      setCreateRoleTemplate('dashboard');
      showToast(`Role "${trimmed}" created and selected!`);
      window.dispatchEvent(new CustomEvent('role-permissions-updated'));
    } catch (err) {
      showToast('Failed to create role.', 'error');
    }
  };

  // -------------------------------------------------------------
  // 7. Delete Role
  // -------------------------------------------------------------
  const handleDeleteRole = async () => {
    if (!deletingRole) return;
    if (deletingRole.isSystem || deletingRole.cannotDelete || deletingRole.name?.toLowerCase() === 'admin') {
      showToast('The Admin role is protected and cannot be deleted.', 'error');
      setDeletingRole(null);
      return;
    }

    try {
      if (deletingRole._id && !deletingRole._id.startsWith('role-')) {
        try {
          await apiDelete(`/api/v1/roles/${deletingRole._id}`, {}, token);
        } catch (e) {
          console.warn('API delete role failed, removing from local store:', e);
        }
      }

      const deletedId = deletingRole._id || deletingRole.id;
      const updatedRoles = roles.filter(r => (r._id !== deletingRole._id && r.id !== deletingRole.id));
      setRoles(updatedRoles);
      if (selectedRoleId === deletedId) {
        setSelectedRoleId(null);
      }
      try {
        localStorage.setItem('mbb_admin_roles', JSON.stringify(updatedRoles));
      } catch {}

      // Reassign any team members who had this role to 'moderator' or 'admin'
      setTeamMembers(prev => prev.map(m => {
        if (m.role?.toLowerCase() === deletingRole.name?.toLowerCase() || m.role?.toLowerCase() === deletingRole.slug) {
          return { ...m, role: 'moderator' };
        }
        return m;
      }));

      showToast(`Role "${deletingRole.name}" removed from platform.`);
      setDeletingRole(null);
      window.dispatchEvent(new CustomEvent('role-permissions-updated'));
    } catch (err) {
      showToast('Failed to delete role.', 'error');
    }
  };

  // -------------------------------------------------------------
  // 8. User Search for "+ Add User"
  // -------------------------------------------------------------
  useEffect(() => {
    if (!showAddUserModal) {
      setUserSearchInput('');
      setUserSearchResults([]);
      setSelectedUserToAdd(null);
      return;
    }

    const query = userSearchInput.trim().toLowerCase();
    if (!query) {
      // Display initial candidate list
      setUserSearchResults(FALLBACK_CANDIDATE_USERS.slice(0, 5));
      return;
    }

    setIsSearchingUsers(true);
    const debounceTimer = setTimeout(async () => {
      try {
        let results = [];
        // Attempt query to backend
        try {
          const res = await apiFetch(`/api/v1/admin/users?q=${encodeURIComponent(query)}&limit=10`);
          if (res.ok) {
            const data = await res.json();
            const list = Array.isArray(data) ? data : (data.data || data.users || []);
            results = list.map(u => ({
              id: u._id || u.id,
              name: u.fullName || u.name,
              username: u.username || (u.email ? u.email.split('@')[0] : 'user'),
              email: u.email,
              avatar: u.avatarUrl || null
            }));
          }
        } catch (e) {}

        // Complement with fallback mock candidate search
        const fallbackMatches = FALLBACK_CANDIDATE_USERS.filter(u =>
          u.name.toLowerCase().includes(query) ||
          u.username.toLowerCase().includes(query) ||
          u.email.toLowerCase().includes(query)
        );

        // Combine and dedup by email
        const merged = [...results, ...fallbackMatches];
        const unique = merged.filter((item, idx, self) =>
          idx === self.findIndex(t => t.email.toLowerCase() === item.email.toLowerCase())
        );

        setUserSearchResults(unique);
      } catch (err) {
        console.warn('Search failed:', err);
      } finally {
        setIsSearchingUsers(false);
      }
    }, 220);

    return () => clearTimeout(debounceTimer);
  }, [userSearchInput, showAddUserModal]);

  // Handle Add / Assign User
  const handleAssignUserRole = async (e) => {
    e.preventDefault();
    if (!selectedUserToAdd) {
      showToast('Please search and select a user to assign.', 'error');
      return;
    }
    if (!selectedRoleForNewUser) {
      showToast('Please choose a role to assign.', 'error');
      return;
    }

    const targetRoleObj = roles.find(r => (r.slug === selectedRoleForNewUser || r.name.toLowerCase() === selectedRoleForNewUser.toLowerCase())) || { name: selectedRoleForNewUser };

    // Check if already in team list
    const existingIndex = teamMembers.findIndex(m => m.email.toLowerCase() === selectedUserToAdd.email.toLowerCase());

    const newMemberRecord = {
      id: selectedUserToAdd.id || `staff-${Date.now()}`,
      _id: selectedUserToAdd.id || `staff-${Date.now()}`,
      name: selectedUserToAdd.name,
      username: selectedUserToAdd.username || selectedUserToAdd.email.split('@')[0],
      email: selectedUserToAdd.email,
      role: (targetRoleObj.slug || targetRoleObj.name || '').toLowerCase(),
      status: 'active',
      avatar: selectedUserToAdd.avatar || null,
      assignedDate: new Date().toISOString().slice(0, 10)
    };

    // Attempt backend update if valid user id
    if (selectedUserToAdd.id && !selectedUserToAdd.id.startsWith('cand-')) {
      try {
        await apiPut(`/api/v1/admin/users/${selectedUserToAdd.id}/role`, {
          role: (targetRoleObj.slug || targetRoleObj.name || '').toLowerCase()
        }, {}, token);
      } catch (err) {
        console.warn('Backend user role update failed, saved locally:', err);
      }
    }

    let updatedMembers = [];
    if (existingIndex >= 0) {
      updatedMembers = teamMembers.map((m, idx) => idx === existingIndex ? newMemberRecord : m);
      showToast(`Updated role for ${selectedUserToAdd.name} to "${targetRoleObj.name}".`);
    } else {
      updatedMembers = [newMemberRecord, ...teamMembers];
      showToast(`${selectedUserToAdd.name} added to team with role "${targetRoleObj.name}".`);
    }

    setTeamMembers(updatedMembers);
    try {
      localStorage.setItem('mbb_admin_team_members', JSON.stringify(updatedMembers));
    } catch {}

    setShowAddUserModal(false);
    setSelectedUserToAdd(null);
  };

  // -------------------------------------------------------------
  // 9. Change Role for Existing User
  // -------------------------------------------------------------
  const handleConfirmChangeRole = async (e) => {
    e.preventDefault();
    if (!userChangingRole || !targetNewRole) return;

    const targetRoleObj = roles.find(r => (r.slug === targetNewRole || r.name.toLowerCase() === targetNewRole.toLowerCase())) || { name: targetNewRole };

    // Attempt backend update
    if (userChangingRole._id && !userChangingRole._id.startsWith('staff-') && !userChangingRole._id.startsWith('cand-')) {
      try {
        await apiPut(`/api/v1/admin/users/${userChangingRole._id}/role`, {
          role: (targetRoleObj.slug || targetRoleObj.name || '').toLowerCase()
        }, {}, token);
      } catch (err) {
        console.warn('Backend user role update failed, saved locally:', err);
      }
    }

    const updatedMembers = teamMembers.map(m => {
      if (m.id === userChangingRole.id || m.email === userChangingRole.email) {
        return { ...m, role: (targetRoleObj.slug || targetRoleObj.name || '').toLowerCase() };
      }
      return m;
    });

    setTeamMembers(updatedMembers);
    try {
      localStorage.setItem('mbb_admin_team_members', JSON.stringify(updatedMembers));
    } catch {}

    showToast(`Role updated to "${targetRoleObj.name}" for ${userChangingRole.name}.`);
    setUserChangingRole(null);
  };

  // -------------------------------------------------------------
  // 10. Delete User from Team
  // -------------------------------------------------------------
  const handleConfirmDeleteUser = async () => {
    if (!deletingUser) return;

    // Prevent removing the primary admin account
    if (deletingUser.role?.toLowerCase() === 'admin' && teamMembers.filter(m => m.role?.toLowerCase() === 'admin').length <= 1) {
      showToast('Cannot remove the last remaining Super Administrator.', 'error');
      setDeletingUser(null);
      return;
    }

    // Attempt backend call
    if (deletingUser._id && !deletingUser._id.startsWith('staff-') && !deletingUser._id.startsWith('cand-')) {
      try {
        await apiPut(`/api/v1/admin/users/${deletingUser._id}/role`, {
          role: 'buyer'
        }, {}, token);
      } catch (err) {
        console.warn('Backend role revoke failed, saved locally:', err);
      }
    }

    const updatedMembers = teamMembers.filter(m => m.id !== deletingUser.id && m.email !== deletingUser.email);
    setTeamMembers(updatedMembers);
    try {
      localStorage.setItem('mbb_admin_team_members', JSON.stringify(updatedMembers));
    } catch {}

    showToast(`Removed ${deletingUser.name} from administrative access.`);
    setDeletingUser(null);
  };

  // -------------------------------------------------------------
  // Filtered Navigation Categories & Items for Matrix
  // -------------------------------------------------------------
  const filteredNavGroups = useMemo(() => {
    const q = tabSearchQuery.trim().toLowerCase();
    if (!q) return SIDEBAR_NAV_STRUCTURE;

    return SIDEBAR_NAV_STRUCTURE.map(group => {
      const matchGroup = group.label.toLowerCase().includes(q);
      const matchingItems = group.items.filter(item =>
        item.label.toLowerCase().includes(q) ||
        item.id.toLowerCase().includes(q) ||
        item.to.toLowerCase().includes(q)
      );

      if (matchGroup) return group;
      if (matchingItems.length > 0) {
        return { ...group, items: matchingItems };
      }
      return null;
    }).filter(Boolean);
  }, [tabSearchQuery]);

  // Toggle Category Collapse in Table
  const toggleCategoryCollapse = (groupId) => {
    setCollapsedCategories(prev => {
      const next = new Set(prev);
      if (next.has(groupId)) next.delete(groupId);
      else next.add(groupId);
      return next;
    });
  };

  // Helper to check if a team member belongs to a specific Role object
  const doesMemberMatchRole = (member, roleObj) => {
    if (!member || !roleObj) return false;
    const mRole = (member.role || '').trim().toLowerCase();
    const rName = (roleObj.name || '').trim().toLowerCase();
    const rSlug = (roleObj.slug || '').trim().toLowerCase();
    if (!mRole) return false;
    if (mRole === rName || mRole === rSlug) return true;
    if (rSlug && mRole.replace(/[^a-z0-9]+/g, '-') === rSlug) return true;
    if ((rName === 'support agent' || rSlug === 'support') && (mRole === 'support' || mRole === 'support agent')) return true;
    if ((rName === 'finance manager' || rSlug === 'finance') && (mRole === 'finance' || mRole === 'finance manager')) return true;
    return false;
  };

  // Currently selected Role object (null initially until a role is clicked on the right)
  const selectedRole = useMemo(() => {
    if (!selectedRoleId) return null;
    return roles.find(r => (r._id || r.id) === selectedRoleId) || null;
  }, [roles, selectedRoleId]);

  // Filtered Team Members for Selected Role (Initially empty when no role is clicked)
  const filteredTeamMembers = useMemo(() => {
    if (!selectedRole) return [];
    const roleFiltered = teamMembers.filter(m => doesMemberMatchRole(m, selectedRole));
    const q = memberSearchQuery.trim().toLowerCase();
    if (!q) return roleFiltered;
    return roleFiltered.filter(m =>
      m.name.toLowerCase().includes(q) ||
      m.email.toLowerCase().includes(q) ||
      m.username?.toLowerCase().includes(q) ||
      m.role.toLowerCase().includes(q)
    );
  }, [teamMembers, selectedRole, memberSearchQuery]);

  // Role Badge Color Helper
  const getRoleBadgeStyle = (roleName) => {
    const r = (roleName || '').toLowerCase();
    if (r === 'admin' || r === 'super_admin') {
      return {
        bg: 'rgba(11, 37, 69, 0.08)',
        color: 'var(--color-navy, #0B2545)',
        border: 'rgba(11, 37, 69, 0.25)',
        label: 'Admin'
      };
    }
    if (r === 'moderator') {
      return {
        bg: 'rgba(16, 185, 129, 0.09)',
        color: '#059669',
        border: 'rgba(16, 185, 129, 0.25)',
        label: 'Moderator'
      };
    }
    if (r === 'support' || r === 'support agent') {
      return {
        bg: 'rgba(139, 92, 246, 0.09)',
        color: '#7C3AED',
        border: 'rgba(139, 92, 246, 0.25)',
        label: 'Support'
      };
    }
    if (r === 'finance' || r === 'finance manager') {
      return {
        bg: 'rgba(245, 158, 11, 0.1)',
        color: '#D97706',
        border: 'rgba(245, 158, 11, 0.25)',
        label: 'Finance'
      };
    }
    return {
      bg: 'var(--color-sunken, #EEEDE9)',
      color: 'var(--color-text-primary, #1C1917)',
      border: 'var(--color-border, #E7E5E4)',
      label: roleName || 'Custom'
    };
  };

  const selectedRoleIsAdmin = selectedRole
    ? (selectedRole.name?.toLowerCase() === 'admin' || selectedRole.isSystem)
    : false;
  const selectedRoleAllowedCount = selectedRole
    ? (selectedRoleIsAdmin ? totalTabsCount : (Array.isArray(selectedRole.allowedTabs) ? selectedRole.allowedTabs.length : 0))
    : 0;

  return (
    <div style={{ padding: '24px 32px', maxWidth: '1600px', margin: '0 auto', color: 'var(--color-text-primary, #1C1917)' }}>
      {/* Toast Notification */}
      {toast && (
        <div
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '28px',
            zIndex: 99999,
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '12px 18px',
            borderRadius: '10px',
            backgroundColor: toast.type === 'error' ? '#DC2626' : 'var(--color-navy, #0B2545)',
            color: '#FFFFFF',
            fontSize: '13px',
            fontWeight: 600,
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)',
            animation: 'fadeIn 200ms ease-out'
          }}
        >
          {toast.type === 'error' ? <AlertCircle size={16} /> : <CheckCircle2 size={16} />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Top Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px',
          marginBottom: '24px',
          paddingBottom: '20px',
          borderBottom: '1px solid var(--color-border, #E7E5E4)'
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h1
              style={{
                fontSize: '24px',
                fontWeight: 700,
                color: 'var(--color-text-primary, #1C1917)',
                letterSpacing: '-0.025em',
                margin: 0
              }}
            >
              Roles & Permissions
            </h1>
            <span
              style={{
                fontSize: '11px',
                fontWeight: 700,
                padding: '2px 8px',
                borderRadius: '999px',
                backgroundColor: 'var(--color-sunken, #EEEDE9)',
                color: 'var(--color-text-secondary, #57534E)',
                fontFamily: 'var(--font-mono, monospace)'
              }}
            >
              {roles.length} {roles.length === 1 ? 'Role' : 'Roles'}
            </span>
            {hasUnsavedChanges && (
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  padding: '2px 8px',
                  borderRadius: '999px',
                  backgroundColor: '#FEF3C7',
                  color: '#92400E'
                }}
              >
                ● Unsaved Changes
              </span>
            )}
          </div>
          <p
            style={{
              fontSize: '13.5px',
              color: 'var(--color-text-secondary, #57534E)',
              margin: '6px 0 0',
              lineHeight: 1.45
            }}
          >
            Click a role from the Roles card on the right to view and configure its tab permissions on the left, and see users assigned to that role below.
          </p>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Save Permissions Button */}
          {hasUnsavedChanges && (
            <button
              type="button"
              onClick={saveAllPermissions}
              disabled={isSavingPermissions}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                backgroundColor: '#10B981',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '8px',
                padding: '8px 16px',
                fontSize: '12.5px',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 2px 6px rgba(16, 185, 129, 0.25)',
                transition: 'all 120ms ease'
              }}
            >
              <Save size={14} strokeWidth={2.4} />
              {isSavingPermissions ? 'Saving...' : 'Save Permissions'}
            </button>
          )}

          {/* Create Role Button */}
          <button
            type="button"
            onClick={() => {
              setCreateRoleName('');
              setCreateRoleDesc('');
              setCreateRoleTemplate('dashboard');
              setShowCreateRoleModal(true);
            }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: 'var(--color-navy, #0B2545)',
              color: '#FBFBFA',
              border: 'none',
              borderRadius: '8px',
              padding: '8px 16px',
              fontSize: '12.5px',
              fontWeight: 600,
              cursor: 'pointer',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
              transition: 'all 140ms ease'
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#133560')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'var(--color-navy, #0B2545)')}
          >
            <Plus size={15} strokeWidth={2.4} />
            Create Role
          </button>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* 2-COLUMN SPLIT LAYOUT:                                                */}
      {/*   LEFT:  Sidebar Tabs + 1 Selected Role Column (Initially Blank)      */}
      {/*   RIGHT: Card 1 (List of Roles) + Card 2 (Users for Selected Role)    */}
      {/* ===================================================================== */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(480px, 1.08fr) minmax(420px, 0.92fr)',
          gap: '24px',
          alignItems: 'start'
        }}
      >
        {/* ======================================================== */}
        {/* LEFT SIDE: TABS + SINGLE SELECTED ROLE PERMISSIONS CARD  */}
        {/* ======================================================== */}
        <div
          style={{
            backgroundColor: 'var(--color-panel, #FBFBFA)',
            borderRadius: '12px',
            border: '1px solid var(--color-border, #E7E5E4)',
            overflow: 'hidden',
            boxShadow: '0 1px 4px rgba(0,0,0,0.03)'
          }}
        >
          {/* Left Card Controls Bar (Search tabs, Expand/Collapse All) */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 18px',
              backgroundColor: 'var(--color-sunken, #EEEDE9)',
              borderBottom: '1px solid var(--color-border, #E7E5E4)',
              gap: '10px',
              flexWrap: 'wrap'
            }}
          >
            {/* Tab Filter Search */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                backgroundColor: 'var(--color-panel, #FBFBFA)',
                border: '1px solid var(--color-border, #E7E5E4)',
                borderRadius: '7px',
                padding: '6px 12px',
                flex: '1 1 220px',
                maxWidth: '320px'
              }}
            >
              <Search size={14} color="var(--color-text-metadata, #78716C)" />
              <input
                type="text"
                value={tabSearchQuery}
                onChange={(e) => setTabSearchQuery(e.target.value)}
                placeholder="Filter sidebar tabs..."
                style={{
                  border: 'none',
                  outline: 'none',
                  background: 'transparent',
                  fontSize: '12.5px',
                  color: 'var(--color-text-primary, #1C1917)',
                  width: '100%'
                }}
              />
              {tabSearchQuery && (
                <button
                  type="button"
                  onClick={() => setTabSearchQuery('')}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                >
                  <X size={13} color="var(--color-text-metadata, #78716C)" />
                </button>
              )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                type="button"
                onClick={() => {
                  if (collapsedCategories.size > 0) setCollapsedCategories(new Set());
                  else setCollapsedCategories(new Set(SIDEBAR_NAV_STRUCTURE.map(g => g.id)));
                }}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  padding: '5px 10px',
                  fontSize: '11.5px',
                  fontWeight: 600,
                  borderRadius: '6px',
                  border: '1px solid var(--color-border, #E7E5E4)',
                  backgroundColor: 'var(--color-panel, #FBFBFA)',
                  color: 'var(--color-text-secondary, #57534E)',
                  cursor: 'pointer'
                }}
              >
                <SlidersHorizontal size={12} />
                {collapsedCategories.size > 0 ? 'Expand All' : 'Collapse All'}
              </button>
            </div>
          </div>

          {/* Left Permissions Table: Column 0 = Tabs, Column 1 = Single Selected Role (Initially Blank) */}
          <div style={{ overflowX: 'auto', width: '100%' }}>
            <table
              style={{
                width: '100%',
                borderCollapse: 'collapse',
                fontSize: '13px',
                tableLayout: 'fixed'
              }}
            >
              <thead>
                <tr
                  style={{
                    backgroundColor: 'var(--color-sunken, #EEEDE9)',
                    borderBottom: '2px solid var(--color-border, #E7E5E4)'
                  }}
                >
                  {/* Column 0: Sidebar Navigation Tabs List */}
                  <th
                    style={{
                      textAlign: 'left',
                      padding: '14px 18px',
                      width: '62%',
                      fontWeight: 700,
                      fontSize: '12px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      color: 'var(--color-text-metadata, #78716C)',
                      borderRight: '1px solid var(--color-border, #E7E5E4)'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span>Sidebar Tabs ({totalTabsCount})</span>
                    </div>
                  </th>

                  {/* Column 1: Single Active Role Column (Initially Blank) */}
                  <th
                    style={{
                      padding: '12px 14px',
                      width: '38%',
                      textAlign: 'center',
                      verticalAlign: 'middle',
                      backgroundColor: selectedRole
                        ? (selectedRoleIsAdmin ? 'rgba(11, 37, 69, 0.04)' : 'rgba(11, 37, 69, 0.02)')
                        : 'transparent'
                    }}
                  >
                    {selectedRole ? (
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          {selectedRoleIsAdmin ? (
                            <ShieldCheck size={14} color="var(--color-navy, #0B2545)" />
                          ) : (
                            <Shield size={14} color="var(--color-navy, #0B2545)" />
                          )}
                          <span
                            style={{
                              fontSize: '14px',
                              fontWeight: 700,
                              color: 'var(--color-navy, #0B2545)'
                            }}
                          >
                            {selectedRole.name}
                          </span>
                          {selectedRoleIsAdmin && (
                            <span
                              title="System Protected Role"
                              style={{
                                fontSize: '9px',
                                fontWeight: 700,
                                padding: '1px 5px',
                                borderRadius: '4px',
                                backgroundColor: 'rgba(11, 37, 69, 0.1)',
                                color: 'var(--color-navy, #0B2545)',
                                textTransform: 'uppercase',
                                letterSpacing: '0.04em'
                              }}
                            >
                              System
                            </span>
                          )}
                          <button
                            type="button"
                            onClick={() => setSelectedRoleId(null)}
                            title="Clear selected role"
                            style={{
                              border: 'none',
                              background: 'transparent',
                              cursor: 'pointer',
                              padding: '2px',
                              color: 'var(--color-text-metadata, #78716C)',
                              display: 'inline-flex',
                              alignItems: 'center'
                            }}
                          >
                            <X size={13} />
                          </button>
                        </div>

                        {/* Allowed Tabs Badge */}
                        <span
                          style={{
                            fontSize: '11px',
                            fontWeight: 600,
                            padding: '1px 8px',
                            borderRadius: '999px',
                            backgroundColor: 'rgba(11, 37, 69, 0.08)',
                            color: 'var(--color-navy, #0B2545)',
                            fontFamily: 'var(--font-mono, monospace)'
                          }}
                        >
                          {selectedRoleAllowedCount}/{totalTabsCount} Tabs Enabled
                        </span>

                        {/* Quick Select All / Reset for Custom Roles */}
                        {!selectedRoleIsAdmin && (
                          <div style={{ display: 'flex', gap: '8px', marginTop: '2px' }}>
                            <button
                              type="button"
                              onClick={() => toggleAllForRole(selectedRole._id || selectedRole.id, true)}
                              style={{
                                border: 'none',
                                background: 'none',
                                fontSize: '10.5px',
                                fontWeight: 700,
                                color: 'var(--color-navy, #0B2545)',
                                cursor: 'pointer',
                                padding: 0,
                                textDecoration: 'underline'
                              }}
                            >
                              Select All
                            </button>
                            <span style={{ fontSize: '10px', color: 'var(--color-text-metadata, #78716C)' }}>•</span>
                            <button
                              type="button"
                              onClick={() => toggleAllForRole(selectedRole._id || selectedRole.id, false)}
                              style={{
                                border: 'none',
                                background: 'none',
                                fontSize: '10.5px',
                                fontWeight: 600,
                                color: 'var(--color-text-metadata, #78716C)',
                                cursor: 'pointer',
                                padding: 0,
                                textDecoration: 'underline'
                              }}
                            >
                              Reset
                            </button>
                          </div>
                        )}
                      </div>
                    ) : (
                      /* Initially Blank Role Column Header */
                      <div
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          minHeight: '38px',
                          color: 'var(--color-text-metadata, #A8A29E)',
                          fontSize: '11.5px',
                          fontWeight: 600,
                          fontStyle: 'italic'
                        }}
                      >
                        <span>No Role Selected</span>
                        <span style={{ fontSize: '10px', fontWeight: 500, fontStyle: 'normal', opacity: 0.85 }}>
                          Click a role on the right →
                        </span>
                      </div>
                    )}
                  </th>
                </tr>
              </thead>

              {/* Matrix Body: Grouped by Sidebar Categories */}
              <tbody>
                {filteredNavGroups.length === 0 ? (
                  <tr>
                    <td colSpan={2} style={{ padding: '36px', textAlign: 'center', color: 'var(--color-text-secondary, #57534E)' }}>
                      No sidebar tabs match "{tabSearchQuery}".
                    </td>
                  </tr>
                ) : (
                  filteredNavGroups.map((group) => {
                    const isCollapsed = collapsedCategories.has(group.id);
                    const groupItemIds = group.items.map(it => it.id);

                    const selectedCount = selectedRole
                      ? (selectedRoleIsAdmin
                        ? group.items.length
                        : group.items.filter(it => isTabAllowedForRole(selectedRole, it.id)).length)
                      : 0;
                    const allChecked = selectedRole ? selectedCount === group.items.length : false;
                    const someChecked = selectedRole ? (selectedCount > 0 && selectedCount < group.items.length) : false;

                    return (
                      <React.Fragment key={group.id}>
                        {/* Category Header Row */}
                        <tr
                          style={{
                            backgroundColor: 'var(--color-sunken, #F4F3F0)',
                            borderTop: '1px solid var(--color-border, #E7E5E4)',
                            borderBottom: '1px solid var(--color-border, #E7E5E4)'
                          }}
                        >
                          {/* Category Title + Toggle */}
                          <td
                            onClick={() => toggleCategoryCollapse(group.id)}
                            style={{
                              padding: '8px 16px',
                              cursor: 'pointer',
                              userSelect: 'none',
                              backgroundColor: 'var(--color-sunken, #F4F3F0)',
                              borderRight: '1px solid var(--color-border, #E7E5E4)'
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              {isCollapsed ? (
                                <ChevronRight size={13} color="var(--color-text-metadata, #8C8782)" />
                              ) : (
                                <ChevronDown size={13} color="var(--color-text-metadata, #8C8782)" />
                              )}
                              <span
                                style={{
                                  fontSize: '10px',
                                  fontWeight: 700,
                                  textTransform: 'uppercase',
                                  letterSpacing: '0.08em',
                                  color: 'var(--color-text-metadata, #8C8782)'
                                }}
                              >
                                {group.label}
                              </span>
                              <span
                                style={{
                                  fontSize: '9.5px',
                                  color: 'var(--color-text-metadata, #A8A29E)',
                                  fontFamily: 'var(--font-mono, monospace)'
                                }}
                              >
                                ({group.items.length})
                              </span>
                            </div>
                          </td>

                          {/* Category-Level Toggle Checkbox for the Single Selected Role (Blank if none selected) */}
                          <td
                            style={{
                              textAlign: 'center',
                              padding: '6px 14px',
                              backgroundColor: selectedRole
                                ? (selectedRoleIsAdmin ? 'rgba(11, 37, 69, 0.02)' : 'transparent')
                                : 'transparent'
                            }}
                          >
                            {selectedRole ? (
                              selectedRoleIsAdmin ? (
                                <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }} title="Full Admin Access">
                                  <Lock size={12} color="var(--color-navy, #0B2545)" opacity={0.6} />
                                </div>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => toggleCategoryForRole(selectedRole._id || selectedRole.id, groupItemIds)}
                                  title={`Toggle all ${group.label} tabs for ${selectedRole.name}`}
                                  style={{
                                    border: 'none',
                                    background: 'none',
                                    cursor: 'pointer',
                                    padding: '2px',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                  }}
                                >
                                  <div
                                    style={{
                                      width: '16px',
                                      height: '16px',
                                      borderRadius: '4px',
                                      border: allChecked
                                        ? '1px solid var(--color-navy, #0B2545)'
                                        : '1px solid var(--color-border, #D6D3D1)',
                                      backgroundColor: allChecked
                                        ? 'var(--color-navy, #0B2545)'
                                        : (someChecked ? 'rgba(11, 37, 69, 0.15)' : '#FFFFFF'),
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      transition: 'all 120ms ease'
                                    }}
                                  >
                                    {allChecked && <Check size={11} strokeWidth={3} color="#FFFFFF" />}
                                    {someChecked && (
                                      <div style={{ width: '8px', height: '2px', backgroundColor: 'var(--color-navy, #0B2545)' }} />
                                    )}
                                  </div>
                                </button>
                              )
                            ) : null}
                          </td>
                        </tr>

                        {/* Tab Rows in this Category */}
                        {!isCollapsed && group.items.map((item) => {
                          const ItemIcon = TAB_ICONS[item.id] || group.icon || LayoutDashboard;
                          const isChecked = selectedRole ? isTabAllowedForRole(selectedRole, item.id) : false;

                          return (
                            <tr
                              key={item.id}
                              style={{
                                borderBottom: '1px solid var(--color-border, #E7E5E4)',
                                transition: 'background-color 100ms ease'
                              }}
                              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--hover-bg, #F6F5F2)')}
                              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                            >
                              {/* Left Column: Tab Icon + Label + Path */}
                              <td
                                style={{
                                  padding: '10px 18px 10px 30px',
                                  backgroundColor: 'var(--color-panel, #FBFBFA)',
                                  borderRight: '1px solid var(--color-border, #E7E5E4)'
                                }}
                              >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                  <ItemIcon size={14} strokeWidth={2} color="var(--color-text-secondary, #57534E)" />
                                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                                    <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-primary, #1C1917)' }}>
                                      {item.label}
                                    </span>
                                    <span
                                      style={{
                                        fontSize: '10.5px',
                                        color: 'var(--color-text-metadata, #8C8782)',
                                        fontFamily: 'var(--font-mono, monospace)'
                                      }}
                                    >
                                      {item.to}
                                    </span>
                                  </div>
                                </div>
                              </td>

                              {/* Right Column: Single Selected Role Tick Mark (Blank when no role is clicked) */}
                              <td
                                style={{
                                  textAlign: 'center',
                                  padding: '10px 14px',
                                  backgroundColor: selectedRole
                                    ? (selectedRoleIsAdmin ? 'rgba(11, 37, 69, 0.02)' : 'transparent')
                                    : 'transparent'
                                }}
                              >
                                {selectedRole ? (
                                  selectedRoleIsAdmin ? (
                                    /* Admin always has permanent access */
                                    <div
                                      title="Admin has full unrestricted access"
                                      style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        width: '18px',
                                        height: '18px',
                                        borderRadius: '5px',
                                        backgroundColor: 'rgba(11, 37, 69, 0.12)',
                                        color: 'var(--color-navy, #0B2545)',
                                        cursor: 'not-allowed'
                                      }}
                                    >
                                      <Check size={12} strokeWidth={2.8} />
                                    </div>
                                  ) : (
                                    /* Interactive Tick Mark Checkbox for Selected Role */
                                    <button
                                      type="button"
                                      onClick={() => toggleTabForRole(selectedRole._id || selectedRole.id, item.id)}
                                      title={`Toggle ${item.label} for ${selectedRole.name}`}
                                      style={{
                                        border: 'none',
                                        background: 'none',
                                        cursor: 'pointer',
                                        padding: 0,
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                      }}
                                    >
                                      <div
                                        style={{
                                          width: '18px',
                                          height: '18px',
                                          borderRadius: '5px',
                                          border: isChecked
                                            ? '1.5px solid var(--color-navy, #0B2545)'
                                            : '1.5px solid var(--color-border, #D6D3D1)',
                                          backgroundColor: isChecked ? 'var(--color-navy, #0B2545)' : '#FFFFFF',
                                          display: 'flex',
                                          alignItems: 'center',
                                          justifyContent: 'center',
                                          boxShadow: isChecked ? '0 1px 2px rgba(11, 37, 69, 0.2)' : 'none',
                                          transition: 'all 100ms ease'
                                        }}
                                      >
                                        {isChecked && <Check size={12} strokeWidth={3} color="#FFFFFF" />}
                                      </div>
                                    </button>
                                  )
                                ) : null}
                              </td>
                            </tr>
                          );
                        })}
                      </React.Fragment>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* ======================================================== */}
        {/* RIGHT SIDE: 2 STACKED CARDS                              */}
        {/*   CARD 1 (TOP):    LIST OF ROLES                         */}
        {/*   CARD 2 (BOTTOM): FILTERED USERS FOR CLICKED ROLE       */}
        {/* ======================================================== */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* ------------------------------------------------------ */}
          {/* RIGHT CARD 1 (TOP): LIST OF ROLES                      */}
          {/* ------------------------------------------------------ */}
          <div
            style={{
              backgroundColor: 'var(--color-panel, #FBFBFA)',
              borderRadius: '12px',
              border: '1px solid var(--color-border, #E7E5E4)',
              overflow: 'hidden',
              boxShadow: '0 1px 4px rgba(0,0,0,0.03)'
            }}
          >
            {/* Card 1 Header */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '15px 20px',
                backgroundColor: 'var(--color-sunken, #EEEDE9)',
                borderBottom: '1px solid var(--color-border, #E7E5E4)',
                gap: '12px'
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <ShieldCheck size={17} color="var(--color-navy, #0B2545)" />
                  <h2
                    style={{
                      margin: 0,
                      fontSize: '15.5px',
                      fontWeight: 700,
                      color: 'var(--color-text-primary, #1C1917)'
                    }}
                  >
                    Roles List
                  </h2>
                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: 700,
                      padding: '2px 8px',
                      borderRadius: '999px',
                      backgroundColor: 'var(--color-panel, #FBFBFA)',
                      color: 'var(--color-text-secondary, #57534E)',
                      border: '1px solid var(--color-border, #E7E5E4)',
                      fontFamily: 'var(--font-mono, monospace)'
                    }}
                  >
                    {roles.length}
                  </span>
                </div>
                <p style={{ margin: '3px 0 0', fontSize: '12px', color: 'var(--color-text-secondary, #57534E)' }}>
                  Click any role below to load its permissions on the left and filter users below.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setCreateRoleName('');
                  setCreateRoleDesc('');
                  setCreateRoleTemplate('dashboard');
                  setShowCreateRoleModal(true);
                }}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  padding: '6px 12px',
                  fontSize: '12px',
                  fontWeight: 600,
                  borderRadius: '7px',
                  border: '1px solid var(--color-border, #E7E5E4)',
                  backgroundColor: 'var(--color-panel, #FBFBFA)',
                  color: 'var(--color-navy, #0B2545)',
                  cursor: 'pointer',
                  flexShrink: 0
                }}
              >
                <Plus size={13} strokeWidth={2.4} />
                New Role
              </button>
            </div>

            {/* Card 1 Body: Interactive List of Roles */}
            <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {loadingRoles ? (
                <div style={{ padding: '28px', textAlign: 'center', fontSize: '13px', color: 'var(--color-text-secondary, #57534E)' }}>
                  Loading roles...
                </div>
              ) : (
                roles.map((role) => {
                  const roleId = role._id || role.id;
                  const isSelected = selectedRoleId === roleId;
                  const isAdmin = role.name?.toLowerCase() === 'admin' || role.isSystem;
                  const allowedCount = isAdmin
                    ? totalTabsCount
                    : (Array.isArray(role.allowedTabs) ? role.allowedTabs.length : 0);
                  const memberCount = teamMembers.filter(m => doesMemberMatchRole(m, role)).length;

                  return (
                    <div
                      key={roleId}
                      onClick={() => setSelectedRoleId(roleId)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '12px',
                        padding: '12px 14px',
                        borderRadius: '10px',
                        cursor: 'pointer',
                        border: isSelected
                          ? '1.5px solid var(--color-navy, #0B2545)'
                          : '1px solid var(--color-border, #E7E5E4)',
                        backgroundColor: isSelected
                          ? 'rgba(11, 37, 69, 0.06)'
                          : '#FFFFFF',
                        boxShadow: isSelected ? '0 2px 8px rgba(11, 37, 69, 0.08)' : 'none',
                        transition: 'all 120ms ease'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', minWidth: 0 }}>
                        <div
                          style={{
                            width: '34px',
                            height: '34px',
                            borderRadius: '8px',
                            backgroundColor: isSelected
                              ? 'var(--color-navy, #0B2545)'
                              : 'var(--color-sunken, #EEEDE9)',
                            color: isSelected ? '#FFFFFF' : 'var(--color-navy, #0B2545)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                            marginTop: '1px'
                          }}
                        >
                          {isAdmin ? <ShieldCheck size={16} /> : <Shield size={16} />}
                        </div>
                        <div style={{ minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                            <span
                              style={{
                                fontSize: '13.5px',
                                fontWeight: 700,
                                color: isSelected ? 'var(--color-navy, #0B2545)' : 'var(--color-text-primary, #1C1917)'
                              }}
                            >
                              {role.name}
                            </span>
                            {isAdmin && (
                              <span
                                style={{
                                  fontSize: '9px',
                                  fontWeight: 700,
                                  padding: '1px 5px',
                                  borderRadius: '4px',
                                  backgroundColor: 'rgba(11, 37, 69, 0.1)',
                                  color: 'var(--color-navy, #0B2545)',
                                  textTransform: 'uppercase',
                                  letterSpacing: '0.04em'
                                }}
                              >
                                System
                              </span>
                            )}
                            {isSelected && (
                              <span
                                style={{
                                  fontSize: '9.5px',
                                  fontWeight: 700,
                                  padding: '1px 6px',
                                  borderRadius: '999px',
                                  backgroundColor: '#10B981',
                                  color: '#FFFFFF'
                                }}
                              >
                                Active on Left
                              </span>
                            )}
                          </div>
                          {role.description && (
                            <p
                              style={{
                                margin: '2px 0 0',
                                fontSize: '11.5px',
                                color: 'var(--color-text-secondary, #57534E)',
                                lineHeight: 1.35
                              }}
                            >
                              {role.description}
                            </p>
                          )}
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '3px' }}>
                          <span
                            style={{
                              fontSize: '11px',
                              fontWeight: 700,
                              padding: '2px 7px',
                              borderRadius: '999px',
                              backgroundColor: isSelected ? 'var(--color-navy, #0B2545)' : 'var(--color-sunken, #EEEDE9)',
                              color: isSelected ? '#FFFFFF' : 'var(--color-text-secondary, #57534E)',
                              fontFamily: 'var(--font-mono, monospace)'
                            }}
                          >
                            {allowedCount}/{totalTabsCount} Tabs
                          </span>
                          <span
                            style={{
                              fontSize: '10.5px',
                              color: 'var(--color-text-metadata, #78716C)',
                              fontWeight: 600
                            }}
                          >
                            {memberCount} {memberCount === 1 ? 'User' : 'Users'}
                          </span>
                        </div>

                        {!isAdmin && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeletingRole(role);
                            }}
                            title={`Delete ${role.name} role`}
                            style={{
                              border: 'none',
                              background: 'transparent',
                              cursor: 'pointer',
                              padding: '5px',
                              color: 'var(--color-text-metadata, #78716C)',
                              borderRadius: '6px'
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.color = '#DC2626')}
                            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--color-text-metadata, #78716C)')}
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* ------------------------------------------------------ */}
          {/* RIGHT CARD 2 (BOTTOM): USERS FOR CLICKED ROLE          */}
          {/* Initially shows nothing until a role is clicked above  */}
          {/* ------------------------------------------------------ */}
          <div
            style={{
              backgroundColor: 'var(--color-panel, #FBFBFA)',
              borderRadius: '12px',
              border: '1px solid var(--color-border, #E7E5E4)',
              overflow: 'hidden',
              boxShadow: '0 1px 4px rgba(0,0,0,0.03)'
            }}
          >
            {/* Card 2 Header */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '15px 20px',
                backgroundColor: 'var(--color-sunken, #EEEDE9)',
                borderBottom: '1px solid var(--color-border, #E7E5E4)',
                gap: '12px',
                flexWrap: 'wrap'
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <Users size={17} color="var(--color-navy, #0B2545)" />
                  <h2
                    style={{
                      margin: 0,
                      fontSize: '15.5px',
                      fontWeight: 700,
                      color: 'var(--color-text-primary, #1C1917)'
                    }}
                  >
                    {selectedRole ? `Users — ${selectedRole.name}` : 'Users by Role'}
                  </h2>
                  {selectedRole && (
                    <span
                      style={{
                        fontSize: '11px',
                        fontWeight: 700,
                        padding: '2px 8px',
                        borderRadius: '999px',
                        backgroundColor: 'var(--color-panel, #FBFBFA)',
                        color: 'var(--color-text-secondary, #57534E)',
                        border: '1px solid var(--color-border, #E7E5E4)',
                        fontFamily: 'var(--font-mono, monospace)'
                      }}
                    >
                      {filteredTeamMembers.length} {filteredTeamMembers.length === 1 ? 'User' : 'Users'}
                    </span>
                  )}
                </div>
                <p style={{ margin: '3px 0 0', fontSize: '12px', color: 'var(--color-text-secondary, #57534E)' }}>
                  {selectedRole
                    ? `Showing team members assigned to the "${selectedRole.name}" role.`
                    : 'Click a role in the Roles card above to filter and view its assigned users.'}
                </p>
              </div>

              {/* "+ Add User" Button (Pre-fills the clicked role if selected) */}
              <button
                type="button"
                onClick={() => {
                  setUserSearchInput('');
                  setUserSearchResults(FALLBACK_CANDIDATE_USERS.slice(0, 5));
                  setSelectedUserToAdd(null);
                  setSelectedRoleForNewUser(
                    selectedRole
                      ? (selectedRole.slug || selectedRole.name.toLowerCase())
                      : (roles.find(r => r.name?.toLowerCase() !== 'admin')?.slug || 'moderator')
                  );
                  setShowAddUserModal(true);
                }}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  backgroundColor: 'var(--color-navy, #0B2545)',
                  color: '#FBFBFA',
                  border: 'none',
                  borderRadius: '7px',
                  padding: '7px 13px',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
                  transition: 'all 120ms ease'
                }}
              >
                <UserPlus size={13} />
                Add User
              </button>
            </div>

            {/* Optional search inside the selected role's users */}
            {selectedRole && (
              <div
                style={{
                  padding: '10px 16px',
                  borderBottom: '1px solid var(--color-border, #E7E5E4)',
                  backgroundColor: '#FFFFFF'
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    backgroundColor: 'var(--color-panel, #FBFBFA)',
                    border: '1px solid var(--color-border, #E7E5E4)',
                    borderRadius: '7px',
                    padding: '5px 10px'
                  }}
                >
                  <Search size={13} color="var(--color-text-metadata, #78716C)" />
                  <input
                    type="text"
                    value={memberSearchQuery}
                    onChange={(e) => setMemberSearchQuery(e.target.value)}
                    placeholder={`Search users in ${selectedRole.name}...`}
                    style={{
                      border: 'none',
                      outline: 'none',
                      background: 'transparent',
                      fontSize: '12px',
                      color: 'var(--color-text-primary, #1C1917)',
                      width: '100%'
                    }}
                  />
                  {memberSearchQuery && (
                    <button
                      type="button"
                      onClick={() => setMemberSearchQuery('')}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                    >
                      <X size={12} color="var(--color-text-metadata, #78716C)" />
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Card 2 Body: Initially shows nothing when !selectedRole */}
            {!selectedRole ? (
              <div
                style={{
                  padding: '44px 24px',
                  textAlign: 'center',
                  color: 'var(--color-text-metadata, #A8A29E)',
                  fontSize: '12.5px'
                }}
              >
                No role selected. Click a role above to view its users.
              </div>
            ) : loadingMembers ? (
              <div style={{ padding: '32px', textAlign: 'center', fontSize: '13px', color: 'var(--color-text-secondary, #57534E)' }}>
                Loading users...
              </div>
            ) : filteredTeamMembers.length === 0 ? (
              <div style={{ padding: '40px 24px', textAlign: 'center' }}>
                <Users size={28} style={{ color: '#A8A29E', margin: '0 auto 8px', display: 'block' }} />
                <p style={{ margin: 0, fontSize: '13.5px', fontWeight: 600, color: 'var(--color-text-primary, #1C1917)' }}>
                  No users assigned to "{selectedRole.name}"
                </p>
                <p style={{ margin: '4px 0 0', fontSize: '12px', color: 'var(--color-text-secondary, #57534E)' }}>
                  Click "+ Add User" above to assign a user to this role.
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {filteredTeamMembers.map((member) => {
                  const badgeStyle = getRoleBadgeStyle(member.role);

                  return (
                    <div
                      key={member.id || member.email}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '12px',
                        padding: '12px 18px',
                        borderBottom: '1px solid var(--color-border, #E7E5E4)',
                        backgroundColor: '#FFFFFF',
                        transition: 'background-color 100ms ease'
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--hover-bg, #F6F5F2)')}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#FFFFFF')}
                    >
                      {/* User Info */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                        {member.avatar ? (
                          <img
                            src={member.avatar}
                            alt={member.name}
                            style={{ width: '34px', height: '34px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
                          />
                        ) : (
                          <div
                            style={{
                              width: '34px',
                              height: '34px',
                              borderRadius: '50%',
                              backgroundColor: 'var(--color-navy, #0B2545)',
                              color: '#FFFFFF',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '12.5px',
                              fontWeight: 700,
                              flexShrink: 0
                            }}
                          >
                            {member.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div style={{ minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                            <span style={{ fontSize: '13.5px', fontWeight: 600, color: 'var(--color-text-primary, #1C1917)' }}>
                              {member.name}
                            </span>
                            <span
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                padding: '1px 7px',
                                borderRadius: '5px',
                                backgroundColor: badgeStyle.bg,
                                color: badgeStyle.color,
                                border: `1px solid ${badgeStyle.border}`,
                                fontSize: '10.5px',
                                fontWeight: 700
                              }}
                            >
                              {selectedRole.name}
                            </span>
                          </div>
                          <div style={{ fontSize: '11.5px', color: 'var(--color-text-secondary, #57534E)', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {member.email} <span style={{ color: 'var(--color-text-metadata, #78716C)', fontFamily: 'var(--font-mono, monospace)' }}>• @{member.username}</span>
                          </div>
                        </div>
                      </div>

                      {/* Actions: Change Role & Remove User */}
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                        <button
                          type="button"
                          onClick={() => {
                            setUserChangingRole(member);
                            setTargetNewRole(selectedRole.slug || member.role);
                          }}
                          title={`Change role for ${member.name}`}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            padding: '5px 9px',
                            fontSize: '11px',
                            fontWeight: 600,
                            borderRadius: '6px',
                            border: '1px solid var(--color-border, #E7E5E4)',
                            backgroundColor: 'transparent',
                            color: 'var(--color-text-primary, #1C1917)',
                            cursor: 'pointer'
                          }}
                        >
                          <Pencil size={11} strokeWidth={2.4} />
                          Role
                        </button>

                        <button
                          type="button"
                          onClick={() => setDeletingUser(member)}
                          title={`Remove ${member.name}`}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '28px',
                            height: '28px',
                            borderRadius: '6px',
                            border: '1px solid var(--color-border, #E7E5E4)',
                            backgroundColor: 'transparent',
                            color: 'var(--color-text-metadata, #78716C)',
                            cursor: 'pointer'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = '#FEE2E2';
                            e.currentTarget.style.borderColor = '#FCA5A5';
                            e.currentTarget.style.color = '#DC2626';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'transparent';
                            e.currentTarget.style.borderColor = 'var(--color-border, #E7E5E4)';
                            e.currentTarget.style.color = 'var(--color-text-metadata, #78716C)';
                          }}
                        >
                          <Trash2 size={13} strokeWidth={2.2} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* MODAL 1: CREATE ROLE (Inserts New Column to Table)        */}
      {/* ======================================================== */}
      {showCreateRoleModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(28, 25, 23, 0.45)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            zIndex: 10000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowCreateRoleModal(false);
          }}
        >
          <div
            style={{
              width: '520px',
              maxWidth: '94vw',
              backgroundColor: 'var(--color-panel, #FBFBFA)',
              borderRadius: '14px',
              border: '1px solid var(--color-border, #E7E5E4)',
              boxShadow: '0 20px 40px -10px rgba(0,0,0,0.22)',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            {/* Header */}
            <div
              style={{
                padding: '16px 20px',
                borderBottom: '1px solid var(--color-border, #E7E5E4)',
                backgroundColor: 'var(--color-sunken, #EEEDE9)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <div>
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: 'var(--color-text-primary, #1C1917)' }}>
                  Create New Role
                </h3>
                <p style={{ margin: '2px 0 0', fontSize: '12px', color: 'var(--color-text-secondary, #57534E)' }}>
                  This creates and inserts a new role column into the permissions matrix.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowCreateRoleModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--color-text-metadata, #78716C)'
                }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleCreateRole}>
              <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '5px' }}>
                    Role Name *
                  </label>
                  <input
                    type="text"
                    value={createRoleName}
                    onChange={(e) => setCreateRoleName(e.target.value)}
                    placeholder="e.g. Moderator, Support Agent, Finance Manager..."
                    autoFocus
                    required
                    style={{
                      width: '100%',
                      boxSizing: 'border-box',
                      padding: '8px 12px',
                      borderRadius: '7px',
                      border: '1px solid var(--color-border, #E7E5E4)',
                      fontSize: '13px',
                      outline: 'none',
                      backgroundColor: '#FFFFFF',
                      color: 'var(--color-text-primary, #1C1917)'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '5px' }}>
                    Description (Optional)
                  </label>
                  <textarea
                    rows={2}
                    value={createRoleDesc}
                    onChange={(e) => setCreateRoleDesc(e.target.value)}
                    placeholder="Short summary of what this role manages..."
                    style={{
                      width: '100%',
                      boxSizing: 'border-box',
                      padding: '8px 12px',
                      borderRadius: '7px',
                      border: '1px solid var(--color-border, #E7E5E4)',
                      fontSize: '13px',
                      outline: 'none',
                      backgroundColor: '#FFFFFF',
                      color: 'var(--color-text-primary, #1C1917)',
                      resize: 'vertical'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '6px' }}>
                    Initial Permissions Preset
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                    {[
                      { id: 'dashboard', label: 'Dashboard Only', desc: 'Starts minimal' },
                      { id: 'empty', label: 'Empty (No Tabs)', desc: 'Configure manually' },
                      { id: 'all', label: 'All Tabs', desc: 'Full access start' }
                    ].map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setCreateRoleTemplate(opt.id)}
                        style={{
                          padding: '8px 10px',
                          borderRadius: '7px',
                          border: createRoleTemplate === opt.id
                            ? '1.5px solid var(--color-navy, #0B2545)'
                            : '1px solid var(--color-border, #E7E5E4)',
                          backgroundColor: createRoleTemplate === opt.id
                            ? 'rgba(11, 37, 69, 0.05)'
                            : '#FFFFFF',
                          cursor: 'pointer',
                          textAlign: 'left'
                        }}
                      >
                        <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-primary, #1C1917)' }}>
                          {opt.label}
                        </div>
                        <div style={{ fontSize: '10.5px', color: 'var(--color-text-metadata, #78716C)' }}>
                          {opt.desc}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div
                style={{
                  padding: '14px 20px',
                  borderTop: '1px solid var(--color-border, #E7E5E4)',
                  backgroundColor: 'var(--color-sunken, #EEEDE9)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'flex-end',
                  gap: '10px'
                }}
              >
                <button
                  type="button"
                  onClick={() => setShowCreateRoleModal(false)}
                  style={{
                    padding: '7px 14px',
                    fontSize: '12.5px',
                    fontWeight: 600,
                    borderRadius: '6px',
                    border: '1px solid var(--color-border, #E7E5E4)',
                    backgroundColor: 'transparent',
                    color: 'var(--color-text-secondary, #57534E)',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!createRoleName.trim()}
                  style={{
                    padding: '7px 16px',
                    fontSize: '12.5px',
                    fontWeight: 600,
                    borderRadius: '6px',
                    border: 'none',
                    backgroundColor: 'var(--color-navy, #0B2545)',
                    color: '#FBFBFA',
                    cursor: 'pointer',
                    opacity: !createRoleName.trim() ? 0.6 : 1
                  }}
                >
                  Create Role Column
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 2: ADD USER (Search User & Assign Role)             */}
      {/* ======================================================== */}
      {showAddUserModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(28, 25, 23, 0.45)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            zIndex: 10000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowAddUserModal(false);
          }}
        >
          <div
            style={{
              width: '560px',
              maxWidth: '94vw',
              backgroundColor: 'var(--color-panel, #FBFBFA)',
              borderRadius: '14px',
              border: '1px solid var(--color-border, #E7E5E4)',
              boxShadow: '0 20px 40px -10px rgba(0,0,0,0.22)',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            {/* Modal Header */}
            <div
              style={{
                padding: '16px 20px',
                borderBottom: '1px solid var(--color-border, #E7E5E4)',
                backgroundColor: 'var(--color-sunken, #EEEDE9)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <div>
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: 'var(--color-text-primary, #1C1917)' }}>
                  Add Team Member & Assign Role
                </h3>
                <p style={{ margin: '2px 0 0', fontSize: '12px', color: 'var(--color-text-secondary, #57534E)' }}>
                  Search any user by username or email, then select their administrative role.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowAddUserModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--color-text-metadata, #78716C)'
                }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleAssignUserRole}>
              <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {/* Step 1: Search Bar for Users */}
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '6px' }}>
                    1. Search User by Username or Email *
                  </label>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      backgroundColor: '#FFFFFF',
                      border: '1px solid var(--color-border, #E7E5E4)',
                      borderRadius: '8px',
                      padding: '8px 12px'
                    }}
                  >
                    <Search size={15} color="var(--color-text-metadata, #78716C)" />
                    <input
                      type="text"
                      value={userSearchInput}
                      onChange={(e) => setUserSearchInput(e.target.value)}
                      placeholder="Type username (e.g. rahul_d) or email..."
                      autoFocus
                      style={{
                        border: 'none',
                        outline: 'none',
                        background: 'transparent',
                        fontSize: '13px',
                        color: 'var(--color-text-primary, #1C1917)',
                        width: '100%'
                      }}
                    />
                    {userSearchInput && (
                      <button
                        type="button"
                        onClick={() => setUserSearchInput('')}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                      >
                        <X size={13} color="var(--color-text-metadata, #78716C)" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Candidate Selection List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-text-secondary, #57534E)' }}>
                    Matching Users:
                  </span>
                  <div
                    style={{
                      maxHeight: '160px',
                      overflowY: 'auto',
                      border: '1px solid var(--color-border, #E7E5E4)',
                      borderRadius: '8px',
                      backgroundColor: '#FFFFFF',
                      padding: '4px'
                    }}
                  >
                    {isSearchingUsers ? (
                      <div style={{ padding: '16px', textAlign: 'center', fontSize: '12px', color: 'var(--color-text-metadata, #78716C)' }}>
                        Searching users...
                      </div>
                    ) : userSearchResults.length === 0 ? (
                      <div style={{ padding: '16px', textAlign: 'center', fontSize: '12px', color: 'var(--color-text-metadata, #78716C)' }}>
                        No users found matching query.
                      </div>
                    ) : (
                      userSearchResults.map((userItem) => {
                        const isSelected = selectedUserToAdd?.email === userItem.email;

                        return (
                          <div
                            key={userItem.email}
                            onClick={() => setSelectedUserToAdd(userItem)}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              padding: '8px 10px',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              backgroundColor: isSelected ? 'rgba(11, 37, 69, 0.08)' : 'transparent',
                              border: isSelected ? '1px solid var(--color-navy, #0B2545)' : '1px solid transparent',
                              transition: 'all 100ms ease'
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <div
                                style={{
                                  width: '28px',
                                  height: '28px',
                                  borderRadius: '50%',
                                  backgroundColor: 'var(--color-sunken, #EEEDE9)',
                                  color: 'var(--color-navy, #0B2545)',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontSize: '11px',
                                  fontWeight: 700
                                }}
                              >
                                {userItem.name.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <div style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--color-text-primary, #1C1917)' }}>
                                  {userItem.name}
                                </div>
                                <div style={{ fontSize: '11px', color: 'var(--color-text-metadata, #78716C)' }}>
                                  @{userItem.username} • {userItem.email}
                                </div>
                              </div>
                            </div>

                            {isSelected && (
                              <CheckCircle2 size={16} color="var(--color-navy, #0B2545)" />
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* Step 2: Role Selector */}
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '6px' }}>
                    2. Select Role to Assign *
                  </label>
                  <select
                    value={selectedRoleForNewUser}
                    onChange={(e) => setSelectedRoleForNewUser(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      border: '1px solid var(--color-border, #E7E5E4)',
                      backgroundColor: '#FFFFFF',
                      fontSize: '13px',
                      color: 'var(--color-text-primary, #1C1917)',
                      outline: 'none'
                    }}
                  >
                    {roles.map((r) => (
                      <option key={r._id || r.id} value={r.slug || r.name.toLowerCase()}>
                        {r.name} ({r.name.toLowerCase() === 'admin' ? 'All Tabs' : `${r.allowedTabs?.length || 0} Tabs`})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Modal Footer */}
              <div
                style={{
                  padding: '14px 20px',
                  borderTop: '1px solid var(--color-border, #E7E5E4)',
                  backgroundColor: 'var(--color-sunken, #EEEDE9)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'flex-end',
                  gap: '10px'
                }}
              >
                <button
                  type="button"
                  onClick={() => setShowAddUserModal(false)}
                  style={{
                    padding: '7px 14px',
                    fontSize: '12.5px',
                    fontWeight: 600,
                    borderRadius: '6px',
                    border: '1px solid var(--color-border, #E7E5E4)',
                    backgroundColor: 'transparent',
                    color: 'var(--color-text-secondary, #57534E)',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!selectedUserToAdd}
                  style={{
                    padding: '7px 16px',
                    fontSize: '12.5px',
                    fontWeight: 600,
                    borderRadius: '6px',
                    border: 'none',
                    backgroundColor: 'var(--color-navy, #0B2545)',
                    color: '#FBFBFA',
                    cursor: 'pointer',
                    opacity: !selectedUserToAdd ? 0.6 : 1
                  }}
                >
                  Assign Role & Add
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 3: CHANGE ROLE                                     */}
      {/* ======================================================== */}
      {userChangingRole && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(28, 25, 23, 0.45)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            zIndex: 10000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setUserChangingRole(null);
          }}
        >
          <div
            style={{
              width: '440px',
              maxWidth: '92vw',
              backgroundColor: 'var(--color-panel, #FBFBFA)',
              borderRadius: '14px',
              border: '1px solid var(--color-border, #E7E5E4)',
              boxShadow: '0 20px 40px -10px rgba(0,0,0,0.22)',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            <div
              style={{
                padding: '16px 20px',
                borderBottom: '1px solid var(--color-border, #E7E5E4)',
                backgroundColor: 'var(--color-sunken, #EEEDE9)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <div>
                <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: 'var(--color-text-primary, #1C1917)' }}>
                  Change Role for {userChangingRole.name}
                </h3>
                <p style={{ margin: '2px 0 0', fontSize: '11.5px', color: 'var(--color-text-secondary, #57534E)' }}>
                  Select the new administrative role for this account.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setUserChangingRole(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-metadata, #78716C)' }}
              >
                <X size={15} />
              </button>
            </div>

            <form onSubmit={handleConfirmChangeRole}>
              <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '6px' }}>
                    Select New Role
                  </label>
                  <select
                    value={targetNewRole}
                    onChange={(e) => setTargetNewRole(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      border: '1px solid var(--color-border, #E7E5E4)',
                      backgroundColor: '#FFFFFF',
                      fontSize: '13px',
                      color: 'var(--color-text-primary, #1C1917)',
                      outline: 'none'
                    }}
                  >
                    {roles.map((r) => (
                      <option key={r._id || r.id} value={r.slug || r.name.toLowerCase()}>
                        {r.name} ({r.name.toLowerCase() === 'admin' ? 'All Tabs' : `${r.allowedTabs?.length || 0} Tabs`})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div
                style={{
                  padding: '12px 20px',
                  borderTop: '1px solid var(--color-border, #E7E5E4)',
                  backgroundColor: 'var(--color-sunken, #EEEDE9)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'flex-end',
                  gap: '8px'
                }}
              >
                <button
                  type="button"
                  onClick={() => setUserChangingRole(null)}
                  style={{
                    padding: '6px 12px',
                    fontSize: '12px',
                    fontWeight: 600,
                    borderRadius: '6px',
                    border: '1px solid var(--color-border, #E7E5E4)',
                    backgroundColor: 'transparent',
                    color: 'var(--color-text-secondary, #57534E)',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '6px 14px',
                    fontSize: '12px',
                    fontWeight: 600,
                    borderRadius: '6px',
                    border: 'none',
                    backgroundColor: 'var(--color-navy, #0B2545)',
                    color: '#FBFBFA',
                    cursor: 'pointer'
                  }}
                >
                  Update Role
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 4: DELETE ROLE CONFIRMATION                         */}
      {/* ======================================================== */}
      {deletingRole && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(28, 25, 23, 0.45)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            zIndex: 10000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setDeletingRole(null);
          }}
        >
          <div
            style={{
              width: '440px',
              maxWidth: '92vw',
              backgroundColor: 'var(--color-panel, #FBFBFA)',
              borderRadius: '12px',
              border: '1px solid var(--color-border, #E7E5E4)',
              boxShadow: '0 20px 40px -10px rgba(0,0,0,0.22)',
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  backgroundColor: '#FEE2E2',
                  color: '#DC2626',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}
              >
                <Trash2 size={18} />
              </div>
              <div>
                <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: 'var(--color-text-primary, #1C1917)' }}>
                  Delete Role Column?
                </h4>
                <p style={{ margin: '2px 0 0', fontSize: '12px', color: 'var(--color-text-secondary, #57534E)' }}>
                  Are you sure you want to remove role <strong>"{deletingRole.name}"</strong>? This will remove its column from the matrix.
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px', marginTop: '6px' }}>
              <button
                type="button"
                onClick={() => setDeletingRole(null)}
                style={{
                  padding: '7px 14px',
                  fontSize: '12px',
                  fontWeight: 600,
                  borderRadius: '6px',
                  border: '1px solid var(--color-border, #E7E5E4)',
                  backgroundColor: 'transparent',
                  color: 'var(--color-text-secondary, #57534E)',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteRole}
                style={{
                  padding: '7px 16px',
                  fontSize: '12px',
                  fontWeight: 600,
                  borderRadius: '6px',
                  border: 'none',
                  backgroundColor: '#DC2626',
                  color: '#FFFFFF',
                  cursor: 'pointer'
                }}
              >
                Delete Role
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 5: DELETE USER CONFIRMATION                         */}
      {/* ======================================================== */}
      {deletingUser && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(28, 25, 23, 0.45)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            zIndex: 10000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setDeletingUser(null);
          }}
        >
          <div
            style={{
              width: '440px',
              maxWidth: '92vw',
              backgroundColor: 'var(--color-panel, #FBFBFA)',
              borderRadius: '12px',
              border: '1px solid var(--color-border, #E7E5E4)',
              boxShadow: '0 20px 40px -10px rgba(0,0,0,0.22)',
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  backgroundColor: '#FEE2E2',
                  color: '#DC2626',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}
              >
                <Trash2 size={18} />
              </div>
              <div>
                <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: 'var(--color-text-primary, #1C1917)' }}>
                  Remove Team Member?
                </h4>
                <p style={{ margin: '2px 0 0', fontSize: '12px', color: 'var(--color-text-secondary, #57534E)' }}>
                  Are you sure you want to remove <strong>"{deletingUser.name}"</strong> from administrative access?
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px', marginTop: '6px' }}>
              <button
                type="button"
                onClick={() => setDeletingUser(null)}
                style={{
                  padding: '7px 14px',
                  fontSize: '12px',
                  fontWeight: 600,
                  borderRadius: '6px',
                  border: '1px solid var(--color-border, #E7E5E4)',
                  backgroundColor: 'transparent',
                  color: 'var(--color-text-secondary, #57534E)',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteUser}
                style={{
                  padding: '7px 16px',
                  fontSize: '12px',
                  fontWeight: 600,
                  borderRadius: '6px',
                  border: 'none',
                  backgroundColor: '#DC2626',
                  color: '#FFFFFF',
                  cursor: 'pointer'
                }}
              >
                Remove User
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
