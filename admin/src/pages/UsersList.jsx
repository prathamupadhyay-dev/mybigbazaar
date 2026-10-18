// ============================================================
// User Directory & Account Operations Console
// ============================================================
// Management of unified user accounts and administrator
// accounts: identity verifications, status toggles, and full CRUD.
// ============================================================

import React, { useState, useEffect } from 'react';
import {
  Wallet,
  MessageSquare,
  Send,
  X,
  CheckCircle,
  ArrowDownLeft,
  ArrowUpRight,
  ShieldCheck
} from 'lucide-react';
import BulkActionBar from '../components/common/BulkActionBar';
import ExportButton from '../components/common/ExportButton';
import StatusPill from '../components/common/StatusPill';
import { apiFetch } from '../utils/api';
import PageHeader from '../components/ui/PageHeader';

export default function UsersList() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [verificationFilter, setVerificationFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedIds, setSelectedIds] = useState([]);
  const [inspectUser, setInspectUser] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  // Wallet Modal State
  const [walletModalUser, setWalletModalUser] = useState(null);

  // Chat Modal State
  const [chatModalUser, setChatModalUser] = useState(null);
  const [userChats, setUserChats] = useState([]);
  const [activeChatId, setActiveChatId] = useState(null);
  const [loadingChats, setLoadingChats] = useState(false);
  const [adminChatInput, setAdminChatInput] = useState('');

  // User CRUD Modal State
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add' | 'edit'
  const [editingUserId, setEditingUserId] = useState(null);
  const [userFormData, setUserFormData] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    password: '',
    role: 'user',
    status: 'active',
    walletBalance: 0
  });
  const [isSubmittingUser, setIsSubmittingUser] = useState(false);

  // Delete Confirmation Modal State
  const [deleteConfirmUser, setDeleteConfirmUser] = useState(null);

  const fetchUsers = async () => {
    setLoading(true);
    setLoadError(null);
    try {
      let res = await apiFetch('/api/v1/admin/users?limit=100');
      if (!res.ok) {
        res = await apiFetch('/auth/get-all-users');
      }
      if (!res.ok) {
        res = await apiFetch('/auth/get-all');
      }
      if (!res.ok) {
        throw new Error(`HTTP ${res.status} from user service`);
      }
      const json = await res.json();
      const rawList = Array.isArray(json) ? json : (json.data || json.users || []);
      const mapped = rawList.map((u, idx) => ({
        id: u._id || u.id || `USR-${idx + 1}`,
        name: u.fullName || u.name || `User ${idx + 1}`,
        email: u.email || '—',
        phone: u.phoneNumber || u.phone || '—',
        city: u.city || (u.addresses && u.addresses[0]?.city) || 'Indore',
        role: (u.role === 'admin' || (Array.isArray(u.userTypes) && u.userTypes.includes('admin'))) ? 'Admin' : 'User',
        verification: u.isVerified || u.isEmailVerified || u.status === 'active' ? 'Verified' : 'Pending',
        status: typeof u.status === 'string' ? (u.status.charAt(0).toUpperCase() + u.status.slice(1)) : 'Active',
        lifetimeOrders: u.ordersCount || 0,
        lifetimeSpend: u.spend ? `₹${u.spend.toLocaleString('en-IN')}` : '₹0',
        joinedDate: typeof u.createdAt === 'string' ? u.createdAt.slice(0, 10) : (u.createdAt ? new Date(u.createdAt).toISOString().slice(0, 10) : '—'),
        walletBalance: u.walletBalance || 0
      }));
      setUsers(mapped);
    } catch (err) {
      setLoadError(err.message || 'Unable to connect to live user database');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const showToast = (msg, type = 'info') => {
    const text = typeof msg === 'object' && msg !== null ? (msg.msg || msg.message || 'Action completed') : String(msg || '');
    setToastMessage(text);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleOpenAddUser = () => {
    setModalMode('add');
    setEditingUserId(null);
    setUserFormData({
      fullName: '',
      email: '',
      phoneNumber: '',
      password: '',
      role: 'user',
      status: 'active',
      walletBalance: 0
    });
    setUserModalOpen(true);
  };

  const handleOpenEditUser = (user) => {
    setModalMode('edit');
    setEditingUserId(user.id);
    setUserFormData({
      fullName: user.name,
      email: user.email === '—' ? '' : user.email,
      phoneNumber: user.phone === '—' ? '' : user.phone,
      password: '',
      role: (user.role || 'user').toLowerCase(),
      status: (user.status || 'Active').toLowerCase(),
      walletBalance: user.walletBalance || 0
    });
    setUserModalOpen(true);
  };

  const handleSaveUser = async (e) => {
    e.preventDefault();
    const trimmedName = userFormData.fullName.trim();
    const trimmedEmail = userFormData.email.trim();
    const trimmedPhone = userFormData.phoneNumber.trim();

    if (!trimmedName || !trimmedEmail) {
      showToast('Full name and email are required.', 'error');
      return;
    }

    if (userFormData.password && userFormData.password.trim().length > 0 && userFormData.password.trim().length < 6) {
      showToast('Password must be at least 6 characters.', 'error');
      return;
    }

    setIsSubmittingUser(true);
    const payload = {
      fullName: trimmedName,
      name: trimmedName,
      email: trimmedEmail,
      phoneNumber: trimmedPhone || undefined,
      phone: trimmedPhone || undefined,
      role: userFormData.role,
      status: userFormData.status,
      walletBalance: Number(userFormData.walletBalance) || 0
    };

    if (userFormData.password && userFormData.password.trim().length >= 6) {
      payload.password = userFormData.password.trim();
    } else if (modalMode === 'add') {
      payload.password = 'BigBazaar@2026';
    }

    try {
      if (modalMode === 'add') {
        let res = await apiFetch('/api/v1/admin/users', {
          method: 'POST',
          body: JSON.stringify(payload)
        });
        if (!res.ok) {
          res = await apiFetch('/auth/create-user', {
            method: 'POST',
            body: JSON.stringify(payload)
          });
        }
        if (res.ok) {
          const json = await res.json();
          const created = json.data || json.user || {};
          const newUserItem = {
            id: created._id || created.id || `USR-${Date.now()}`,
            name: created.fullName || payload.fullName,
            email: created.email || payload.email,
            phone: created.phoneNumber || payload.phoneNumber || '—',
            city: 'Indore',
            role: payload.role === 'admin' ? 'Admin' : 'User',
            verification: 'Verified',
            status: payload.status === 'active' ? 'Active' : 'Suspended',
            lifetimeOrders: 0,
            lifetimeSpend: '₹0',
            joinedDate: new Date().toISOString().slice(0, 10),
            walletBalance: payload.walletBalance
          };
          setUsers((prev) => [newUserItem, ...prev.filter(u => u.email !== payload.email)]);
          setUserModalOpen(false);
          showToast(`User "${newUserItem.name}" created and saved to database successfully.`, 'success');
          // Re-fetch live database records in background to guarantee full sync
          fetchUsers();
        } else {
          const data = await res.json().catch(() => ({}));
          showToast(data.message || 'Failed to create user.', 'error');
        }
      } else {
        // Edit Mode
        let res = await apiFetch(`/api/v1/admin/users/${editingUserId}`, {
          method: 'PUT',
          body: JSON.stringify(payload)
        });
        if (!res.ok) {
          res = await apiFetch(`/auth/update-user/${editingUserId}`, {
            method: 'PUT',
            body: JSON.stringify(payload)
          });
        }
        if (res.ok) {
          setUsers((prev) =>
            prev.map((u) =>
              u.id === editingUserId
                ? {
                    ...u,
                    name: payload.fullName,
                    email: payload.email,
                    phone: payload.phoneNumber || '—',
                    role: payload.role === 'admin' ? 'Admin' : 'User',
                    status: payload.status === 'active' ? 'Active' : 'Suspended',
                    walletBalance: payload.walletBalance
                  }
                : u
            )
          );
          setUserModalOpen(false);
          showToast(`User "${payload.fullName}" updated successfully.`, 'success');
          fetchUsers();
        } else {
          const data = await res.json().catch(() => ({}));
          showToast(data.message || 'Failed to update user.', 'error');
        }
      }
    } catch (err) {
      showToast('Backend connection failed while saving user.', 'error');
    } finally {
      setIsSubmittingUser(false);
    }
  };

  const confirmDeleteUser = async () => {
    if (!deleteConfirmUser) return;
    const { id, name } = deleteConfirmUser;
    try {
      let res = await apiFetch(`/api/v1/admin/users/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        res = await apiFetch(`/auth/delete/${id}`, { method: 'DELETE' });
      }
      if (res.ok) {
        setUsers((prev) => prev.filter((u) => u.id !== id));
        showToast(`User "${name}" deleted permanently.`);
        fetchUsers();
      } else {
        const data = await res.json().catch(() => ({}));
        showToast(data.message || 'Failed to delete user.', 'error');
      }
    } catch (e) {
      showToast('Backend connection failed on delete request.', 'error');
    } finally {
      setDeleteConfirmUser(null);
    }
  };

  const toggleStatus = async (id) => {
    const targetUser = users.find(u => u.id === id);
    if (!targetUser) return;
    const nextStatus = targetUser.status === 'Active' ? 'Suspended' : 'Active';

    setUsers((prev) =>
      prev.map((user) => (user.id === id ? { ...user, status: nextStatus } : user))
    );
    showToast(`User ${targetUser.name} is now ${nextStatus}.`);

    try {
      const res = await apiFetch(`/api/v1/admin/users/${id}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status: nextStatus.toLowerCase() })
      });
      if (!res.ok) {
        await apiFetch(`/api/v1/moderation/users/${id}/suspension`, {
          method: 'PUT',
          body: JSON.stringify({ action: nextStatus === 'Suspended' ? 'suspend' : 'activate' })
        });
      }
    } catch (err) {
      console.warn('Status toggle sync error:', err);
    }
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(filteredUsers.map((u) => u.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleToggleRow = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleBulkSuspend = () => {
    const idsToSuspend = [...selectedIds];
    setUsers((prev) =>
      prev.map((u) => (idsToSuspend.includes(u.id) ? { ...u, status: 'Suspended' } : u))
    );
    apiFetch('/api/v1/admin/users/bulk-status', {
      method: 'PUT',
      body: JSON.stringify({ ids: idsToSuspend, status: 'suspended' })
    }).catch(console.warn);
    showToast(`Suspended ${idsToSuspend.length} user accounts.`);
    setSelectedIds([]);
  };

  const handleBulkVerify = () => {
    const idsToVerify = [...selectedIds];
    setUsers((prev) =>
      prev.map((u) => (idsToVerify.includes(u.id) ? { ...u, verification: 'Verified', status: 'Active' } : u))
    );
    apiFetch('/api/v1/admin/users/bulk-status', {
      method: 'PUT',
      body: JSON.stringify({ ids: idsToVerify, status: 'active', isVerified: true })
    }).catch(console.warn);
    showToast(`Verified ${idsToVerify.length} user accounts.`);
    setSelectedIds([]);
  };

  const filteredUsers = users.filter((u) => {
    const q = (searchQuery || '').toLowerCase();
    const matchesSearch =
      (u.name || '').toLowerCase().includes(q) ||
      (u.email || '').toLowerCase().includes(q) ||
      (u.phone || '').includes(searchQuery || '') ||
      (u.city || '').toLowerCase().includes(q);
    const matchesVerification = verificationFilter === 'All' || u.verification === verificationFilter;
    const matchesStatus = statusFilter === 'All' || u.status === statusFilter;
    return matchesSearch && matchesVerification && matchesStatus;
  });

  const totalUsersCount = users.length;
  const activeCount = users.filter((u) => u.status === 'Active').length;
  const verifiedCount = users.filter((u) => u.verification === 'Verified').length;
  const suspendedCount = users.filter((u) => u.status === 'Suspended').length;

  const handleOpenUserChats = async (user) => {
    setChatModalUser(user);
    setLoadingChats(true);
    setUserChats([]);
    setActiveChatId(null);
    try {
      let res = await apiFetch(`/api/v1/chat/admin/user/${user.id}`);
      if (!res.ok) {
        res = await apiFetch(`/chat/admin/user/${user.id}`);
      }
      if (res.ok) {
        const json = await res.json();
        const list = Array.isArray(json.data) ? json.data : (Array.isArray(json) ? json : (json.conversations || []));
        setUserChats(list);
        if (list.length > 0) {
          setActiveChatId(list[0]._id || list[0].id);
        }
      }
    } catch (err) {
      console.warn('Failed to load user chats:', err);
    } finally {
      setLoadingChats(false);
    }
  };

  const handleSendAdminMessage = async (e) => {
    if (e) e.preventDefault();
    if (!adminChatInput.trim() || !activeChatId) return;

    const messageText = adminChatInput.trim();
    setAdminChatInput('');

    const optimisticMsg = {
      _id: `msg-${Date.now()}`,
      text: messageText,
      senderId: { fullName: 'Admin (Support)', role: 'admin' },
      createdAt: new Date().toISOString()
    };

    setUserChats((prev) =>
      prev.map((c) =>
        (c._id === activeChatId || c.id === activeChatId)
          ? { ...c, messages: [...(c.messages || []), optimisticMsg] }
          : c
      )
    );

    try {
      await apiFetch(`/api/v1/chat/conversations/${activeChatId}/messages`, {
        method: 'POST',
        body: JSON.stringify({
          text: messageText,
          messageType: 'admin_notice',
          senderRole: 'admin',
          senderName: 'BigBazaar Trust & Safety Admin'
        })
      });
    } catch (err) {
      console.warn('Failed to dispatch admin chat message:', err);
    }
  };

  return (
    <div className="admin-page" style={{ padding: '24px', maxWidth: '1440px', margin: '0 auto' }}>
      {toastMessage && (
        <div
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            zIndex: 9999,
            backgroundColor: 'var(--card-bg)',
            backdropFilter: 'var(--glass-blur)',
            WebkitBackdropFilter: 'var(--glass-blur)',
            color: 'var(--text-primary)',
            padding: '12px 20px',
            borderRadius: 'var(--mbb-radius-md)',
            border: '1px solid var(--border-color)',
            boxShadow: '0 12px 36px rgba(0,0,0,0.18)',
            fontWeight: 600,
            fontSize: '0.84rem',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--status-success-text)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
          <span>{typeof toastMessage === 'object' && toastMessage !== null ? (toastMessage.msg || toastMessage.message || '') : String(toastMessage || '')}</span>
        </div>
      )}

      {/* Page Header */}
      <PageHeader
        title="Users"
        breadcrumbs={['Users', 'Directory']}
      >
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button
            type="button"
            className="btn-primary"
            onClick={handleOpenAddUser}
            style={{
              padding: '8px 16px',
              fontWeight: 600,
              fontSize: '0.85rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            Add User
          </button>
          <ExportButton
            data={filteredUsers}
            filename="mybigbazaar-users-roster.csv"
            label="Export CSV"
            dateKey="joinedDate"
            columns={[
              { key: 'id', label: 'User ID' },
              { key: 'name', label: 'Full Name' },
              { key: 'phone', label: 'Phone' },
              { key: 'email', label: 'Email' },
              { key: 'city', label: 'City' },
              { key: 'role', label: 'Role' },
              { key: 'verification', label: 'Verification' },
              { key: 'status', label: 'Account Status' },
              { key: 'walletBalance', label: 'Wallet Balance (INR)' },
              { key: 'lifetimeSpend', label: 'Lifetime Spend' },
              { key: 'lifetimeOrders', label: 'Total Orders / Ads' },
              { key: 'joinedDate', label: 'Registration Date' }
            ]}
          />
        </div>
      </PageHeader>

      {/* User Status Metrics Bar */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '12px',
          marginBottom: '20px'
        }}
      >
        <div style={{ padding: '14px 18px', backgroundColor: 'var(--color-panel, #FBFBFA)', border: '1px solid var(--color-border, #E7E5E4)', borderRadius: '10px' }}>
          <div style={{ fontSize: '0.74rem', color: 'var(--color-text-secondary, #57534E)', fontWeight: 500 }}>Total Registered Users</div>
          <div style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--color-text-primary, #1C1917)', marginTop: '4px' }}>
            {totalUsersCount}
          </div>
        </div>
        <div style={{ padding: '14px 18px', backgroundColor: 'var(--color-panel, #FBFBFA)', border: '1px solid var(--color-border, #E7E5E4)', borderRadius: '10px' }}>
          <div style={{ fontSize: '0.74rem', color: 'var(--color-text-secondary, #57534E)', fontWeight: 500 }}>Active Accounts</div>
          <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#16A34A', marginTop: '4px' }}>
            {activeCount}
          </div>
        </div>
        <div style={{ padding: '14px 18px', backgroundColor: 'var(--color-panel, #FBFBFA)', border: '1px solid var(--color-border, #E7E5E4)', borderRadius: '10px' }}>
          <div style={{ fontSize: '0.74rem', color: 'var(--color-text-secondary, #57534E)', fontWeight: 500 }}>Identity Verified</div>
          <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#0284C7', marginTop: '4px' }}>
            {verifiedCount}
          </div>
        </div>
        <div style={{ padding: '14px 18px', backgroundColor: 'var(--color-panel, #FBFBFA)', border: '1px solid var(--color-border, #E7E5E4)', borderRadius: '10px' }}>
          <div style={{ fontSize: '0.74rem', color: 'var(--color-text-secondary, #57534E)', fontWeight: 500 }}>Suspended Accounts</div>
          <div style={{ fontSize: '1.4rem', fontWeight: 700, color: suspendedCount > 0 ? '#DC2626' : 'var(--color-text-metadata, #6F6A65)', marginTop: '4px' }}>
            {suspendedCount}
          </div>
        </div>
      </div>

      {/* Table Card */}
      <div className="admin-card" style={{ padding: '20px 22px' }}>
        {/* Controls Bar */}
        <div style={{ display: 'flex', gap: '14px', marginBottom: '20px', flexWrap: 'wrap', alignItems: 'center' }}>
          <input
            type="text"
            placeholder="Search by name, email, phone, or city..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              flex: 1,
              minWidth: '260px',
              padding: '8px 14px',
              borderRadius: '8px',
              border: '1px solid var(--border-color)',
              background: 'var(--hover-bg)',
              color: 'var(--text-primary)',
              fontSize: '0.88rem',
              outline: 'none'
            }}
          />

          <select
            value={verificationFilter}
            onChange={(e) => setVerificationFilter(e.target.value)}
            style={{
              padding: '8px 14px',
              borderRadius: '8px',
              border: '1px solid var(--border-color)',
              background: 'var(--hover-bg)',
              color: 'var(--text-primary)',
              fontSize: '0.85rem',
              outline: 'none'
            }}
          >
            <option value="All">All Verification</option>
            <option value="Verified">Verified</option>
            <option value="Pending">Pending</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{
              padding: '8px 14px',
              borderRadius: '8px',
              border: '1px solid var(--border-color)',
              background: 'var(--hover-bg)',
              color: 'var(--text-primary)',
              fontSize: '0.85rem',
              outline: 'none'
            }}
          >
            <option value="All">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Suspended">Suspended</option>
          </select>
        </div>

        {/* Users Table */}
        <div className="table-container contain-content" style={{ overflowX: 'auto' }}>
          <table className="admin-table" style={{ width: '100%', minWidth: '850px' }}>
            <thead>
              <tr>
                <th style={{ width: '38px' }}>
                  <input
                    type="checkbox"
                    checked={filteredUsers.length > 0 && selectedIds.length === filteredUsers.length}
                    onChange={handleSelectAll}
                  />
                </th>
                <th>User Details</th>
                <th>City</th>
                <th>Identity Verification</th>
                <th>Status</th>
                <th>Lifetime Activity</th>
                <th>Joined</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '36px', color: 'var(--text-secondary)' }}>
                    Loading user records from live backend...
                  </td>
                </tr>
              ) : loadError ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '36px', color: '#DC2626' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                      <div style={{ fontWeight: 600, fontSize: '15px' }}>Failed to reach backend user service</div>
                      <div style={{ fontSize: '13px', color: '#7F1D1D' }}>{String(loadError)}</div>
                      <button type="button" className="btn-secondary" onClick={fetchUsers} style={{ marginTop: '8px', cursor: 'pointer' }}>Retry</button>
                    </div>
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '36px', color: 'var(--text-secondary)' }}>
                    No users matching criteria.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr
                    key={user.id}
                    onClick={() => setInspectUser(user)}
                    style={{
                      cursor: 'pointer',
                      background: selectedIds.includes(user.id) ? 'var(--hover-bg)' : 'transparent'
                    }}
                  >
                    <td onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(user.id)}
                        onChange={() => handleToggleRow(user.id)}
                      />
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{user.name}</span>
                        {user.role === 'Admin' && (
                          <span
                            style={{
                              fontSize: '0.68rem',
                              fontWeight: 700,
                              padding: '1px 6px',
                              borderRadius: '4px',
                              backgroundColor: 'rgba(79, 70, 229, 0.12)',
                              color: '#4F46E5',
                              textTransform: 'uppercase',
                              letterSpacing: '0.04em'
                            }}
                          >
                            Admin
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>
                        {user.phone} • {user.email}
                      </div>
                    </td>
                    <td>{user.city}</td>
                    <td>
                      <StatusPill status={user.verification} label={user.verification} />
                    </td>
                    <td>
                      <StatusPill status={user.status} />
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, fontSize: '0.82rem', color: 'var(--text-primary)' }}>
                        {user.lifetimeOrders} ads/orders
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--accent-color, #d4af37)', fontWeight: 600 }}>
                        {user.lifetimeSpend} • ₹{user.walletBalance || 0} wallet
                      </div>
                    </td>
                    <td style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{user.joinedDate}</td>
                    <td style={{ textAlign: 'right' }} onClick={(e) => e.stopPropagation()}>
                      <div style={{ display: 'inline-flex', gap: '6px', alignItems: 'center' }}>
                        <button
                          type="button"
                          className="btn-secondary"
                          style={{
                            fontSize: '0.75rem',
                            padding: '4px 8px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            borderColor: 'rgba(217, 119, 6, 0.3)',
                            color: '#d97706'
                          }}
                          onClick={() => setWalletModalUser(user)}
                          title="View current wallet balance"
                        >
                          <Wallet size={12} />
                          <span>Wallet</span>
                        </button>
                        <button
                          type="button"
                          className="btn-secondary"
                          style={{
                            fontSize: '0.75rem',
                            padding: '4px 8px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            borderColor: 'rgba(59, 130, 246, 0.3)',
                            color: '#3b82f6'
                          }}
                          onClick={() => handleOpenUserChats(user)}
                          title="Open user chats"
                        >
                          <MessageSquare size={12} />
                          <span>Chat</span>
                        </button>
                        <button
                          type="button"
                          className="btn-secondary"
                          style={{ fontSize: '0.75rem', padding: '4px 8px' }}
                          onClick={() => handleOpenEditUser(user)}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="btn-secondary"
                          style={{ fontSize: '0.75rem', padding: '4px 8px' }}
                          onClick={() => setInspectUser(user)}
                        >
                          Profile
                        </button>
                        <button
                          type="button"
                          onClick={() => toggleStatus(user.id)}
                          style={{
                            border: '1px solid var(--border-color)',
                            background: user.status === 'Suspended' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.12)',
                            color: user.status === 'Suspended' ? '#10b981' : '#ef4444',
                            fontSize: '0.75rem',
                            fontWeight: '600',
                            padding: '4px 8px',
                            borderRadius: '6px',
                            cursor: 'pointer'
                          }}
                        >
                          {user.status === 'Suspended' ? 'Reinstate' : 'Suspend'}
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteConfirmUser(user)}
                          style={{
                            border: '1px solid var(--border-color)',
                            background: 'rgba(239, 68, 68, 0.12)',
                            color: '#ef4444',
                            fontSize: '0.75rem',
                            fontWeight: '600',
                            padding: '4px 8px',
                            borderRadius: '6px',
                            cursor: 'pointer'
                          }}
                          title="Delete user from database"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Floating Bulk Action Bar */}
      <BulkActionBar
        selectedCount={selectedIds.length}
        onClear={() => setSelectedIds([])}
        actions={[
          { label: 'Bulk Verify', icon: 'M5 13l4 4L19 7', onClick: handleBulkVerify, variant: 'primary' },
          { label: 'Bulk Suspend', icon: 'M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636', onClick: handleBulkSuspend, variant: 'danger' }
        ]}
      />

      {/* Add / Edit User Modal */}
      {userModalOpen && (
        <div className="modal-overlay" onClick={() => setUserModalOpen(false)}>
          <div className="modal-container" style={{ maxWidth: '480px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ margin: 0 }}>{modalMode === 'add' ? 'Add New User' : 'Edit User Account'}</h3>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setUserModalOpen(false)}
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  border: '1px solid var(--border-color)',
                  backgroundColor: 'var(--hover-bg)',
                  color: 'var(--text-secondary)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer'
                }}
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleSaveUser}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label className="form-label" style={{ display: 'block', marginBottom: '6px', fontSize: '0.82rem', fontWeight: 600 }}>
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={userFormData.fullName}
                    onChange={(e) => setUserFormData({ ...userFormData, fullName: e.target.value })}
                    placeholder="e.g. Ramesh Kumar"
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      border: '1px solid var(--border-color)',
                      background: 'var(--hover-bg)',
                      color: 'var(--text-primary)',
                      fontSize: '0.88rem'
                    }}
                  />
                </div>

                <div>
                  <label className="form-label" style={{ display: 'block', marginBottom: '6px', fontSize: '0.82rem', fontWeight: 600 }}>
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={userFormData.email}
                    onChange={(e) => setUserFormData({ ...userFormData, email: e.target.value })}
                    placeholder="user@example.com"
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      border: '1px solid var(--border-color)',
                      background: 'var(--hover-bg)',
                      color: 'var(--text-primary)',
                      fontSize: '0.88rem'
                    }}
                  />
                </div>

                <div>
                  <label className="form-label" style={{ display: 'block', marginBottom: '6px', fontSize: '0.82rem', fontWeight: 600 }}>
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={userFormData.phoneNumber}
                    onChange={(e) => setUserFormData({ ...userFormData, phoneNumber: e.target.value })}
                    placeholder="+91 98765 43210"
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      border: '1px solid var(--border-color)',
                      background: 'var(--hover-bg)',
                      color: 'var(--text-primary)',
                      fontSize: '0.88rem'
                    }}
                  />
                </div>

                <div>
                  <label className="form-label" style={{ display: 'block', marginBottom: '6px', fontSize: '0.82rem', fontWeight: 600 }}>
                    {modalMode === 'add' ? 'Password (default: BigBazaar@2026)' : 'Password (leave blank to keep unchanged)'}
                  </label>
                  <input
                    type="password"
                    value={userFormData.password}
                    onChange={(e) => setUserFormData({ ...userFormData, password: e.target.value })}
                    placeholder={modalMode === 'add' ? 'Leave blank for default (or min 6 chars)' : '••••••••'}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      border: '1px solid var(--border-color)',
                      background: 'var(--hover-bg)',
                      color: 'var(--text-primary)',
                      fontSize: '0.88rem'
                    }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label className="form-label" style={{ display: 'block', marginBottom: '6px', fontSize: '0.82rem', fontWeight: 600 }}>
                      Account Role
                    </label>
                    <select
                      value={userFormData.role}
                      onChange={(e) => setUserFormData({ ...userFormData, role: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        borderRadius: '8px',
                        border: '1px solid var(--border-color)',
                        background: 'var(--hover-bg)',
                        color: 'var(--text-primary)',
                        fontSize: '0.85rem'
                      }}
                    >
                      <option value="user">User</option>
                      <option value="admin">Administrator</option>
                    </select>
                  </div>

                  <div>
                    <label className="form-label" style={{ display: 'block', marginBottom: '6px', fontSize: '0.82rem', fontWeight: 600 }}>
                      Status
                    </label>
                    <select
                      value={userFormData.status}
                      onChange={(e) => setUserFormData({ ...userFormData, status: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        borderRadius: '8px',
                        border: '1px solid var(--border-color)',
                        background: 'var(--hover-bg)',
                        color: 'var(--text-primary)',
                        fontSize: '0.85rem'
                      }}
                    >
                      <option value="active">Active</option>
                      <option value="suspended">Suspended</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="form-label" style={{ display: 'block', marginBottom: '6px', fontSize: '0.82rem', fontWeight: 600 }}>
                    Wallet Balance (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={userFormData.walletBalance}
                    onChange={(e) => setUserFormData({ ...userFormData, walletBalance: Number(e.target.value) || 0 })}
                    placeholder="0"
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      border: '1px solid var(--border-color)',
                      background: 'var(--hover-bg)',
                      color: 'var(--text-primary)',
                      fontSize: '0.88rem'
                    }}
                  />
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '4px', display: 'block' }}>
                    Current account credit for in-app redemption (minimum ₹500 threshold applies to user payouts).
                  </span>
                </div>
              </div>

              <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '16px' }}>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setUserModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={isSubmittingUser}
                >
                  {isSubmittingUser ? 'Saving...' : modalMode === 'add' ? 'Create User' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmUser && (
        <div className="modal-overlay" onClick={() => setDeleteConfirmUser(null)}>
          <div className="modal-container" style={{ maxWidth: '420px', padding: '24px' }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ margin: '0 0 10px', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
              Confirm Account Deletion
            </h3>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: '0 0 20px' }}>
              Are you sure you want to permanently delete user <strong>"{deleteConfirmUser.name}"</strong> ({deleteConfirmUser.email})? This action removes all records from the MongoDB database and cannot be undone.
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setDeleteConfirmUser(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                style={{
                  background: '#ef4444',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '8px 16px',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  cursor: 'pointer'
                }}
                onClick={confirmDeleteUser}
              >
                Delete Permanently
              </button>
            </div>
          </div>
        </div>
      )}

      {/* User Inspect Modal */}
      {inspectUser && (
        <div className="modal-overlay" onClick={() => setInspectUser(null)}>
          <div className="modal-container" style={{ maxWidth: '520px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ margin: 0 }}>User Profile: {inspectUser.id}</h3>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setInspectUser(null)}
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  border: '1px solid var(--border-color)',
                  backgroundColor: 'var(--hover-bg)',
                  color: 'var(--text-secondary)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer'
                }}
                aria-label="Close"
              >
                ✕
              </button>
            </div>
            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <h4 style={{ margin: '0 0 2px', fontSize: '1.1rem', color: 'var(--text-primary)' }}>
                  {inspectUser.name}
                </h4>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                  {inspectUser.phone} • {inspectUser.email}
                </div>
              </div>

              <div className="admin-grid-2">
                <div>
                  <span className="form-label">City Location</span>
                  <p style={{ margin: '4px 0 0', fontWeight: 600, color: 'var(--text-primary)' }}>{inspectUser.city}</p>
                </div>
                <div>
                  <span className="form-label">Account Type</span>
                  <p style={{ margin: '4px 0 0', fontWeight: 600, color: inspectUser.role === 'Admin' ? '#4F46E5' : 'var(--text-primary)' }}>
                    {inspectUser.role === 'Admin' ? 'Administrator' : 'Standard User'}
                  </p>
                </div>
              </div>

              <div className="admin-grid-2">
                <div>
                  <span className="form-label">Lifetime Volume</span>
                  <p style={{ margin: '4px 0 0', fontWeight: 700, color: '#10b981' }}>{inspectUser.lifetimeSpend}</p>
                </div>
                <div>
                  <span className="form-label">Completed Transactions</span>
                  <p style={{ margin: '4px 0 0', fontWeight: 600, color: 'var(--text-primary)' }}>{inspectUser.lifetimeOrders} orders</p>
                </div>
              </div>

              <div className="admin-grid-2" style={{ background: 'var(--hover-bg)', padding: '10px 12px', borderRadius: '8px' }}>
                <div>
                  <span className="form-label">Wallet Balance</span>
                  <p style={{ margin: '4px 0 0', fontWeight: 800, color: 'var(--color-terracotta, #C2410C)', fontSize: '0.95rem' }}>
                    ₹{(Number(inspectUser.walletBalance) || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                </div>
                <div>
                  <span className="form-label">Payout Status</span>
                  <p style={{ margin: '4px 0 0', fontWeight: 600, color: (Number(inspectUser.walletBalance) || 0) >= 500 ? '#10B981' : 'var(--text-secondary)' }}>
                    {(Number(inspectUser.walletBalance) || 0) >= 500 ? '● Eligible (≥ ₹500)' : '○ Locked (< ₹500)'}
                  </p>
                </div>
              </div>
            </div>
            <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button className="btn-secondary" onClick={() => setInspectUser(null)}>Close</button>
              <button
                className="btn-primary"
                onClick={() => {
                  toggleStatus(inspectUser.id);
                  setInspectUser(null);
                }}
              >
                {inspectUser.status === 'Suspended' ? 'Reinstate Account' : 'Suspend Account'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Wallet Balance Modal */}
      {walletModalUser && (
        <div className="modal-overlay" onClick={() => setWalletModalUser(null)}>
          <div
            className="modal-container"
            style={{ maxWidth: '480px', borderRadius: '16px' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header" style={{ padding: '18px 24px', borderBottom: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '10px',
                    background: 'rgba(217, 119, 6, 0.12)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#d97706'
                  }}
                >
                  <Wallet size={20} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    Wallet Overview
                  </h3>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                    {walletModalUser.name} • {walletModalUser.email}
                  </div>
                </div>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setWalletModalUser(null)}
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  border: '1px solid var(--border-color)',
                  backgroundColor: 'var(--hover-bg)',
                  color: 'var(--text-secondary)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer'
                }}
              >
                <X size={15} />
              </button>
            </div>

            <div className="modal-body" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Primary Balance Hero Card */}
              <div
                style={{
                  background: 'linear-gradient(135deg, rgba(217, 119, 6, 0.08) 0%, rgba(245, 158, 11, 0.03) 100%)',
                  border: '1px solid rgba(217, 119, 6, 0.25)',
                  borderRadius: '14px',
                  padding: '20px',
                  textAlign: 'center',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Current Wallet Balance
                </span>
                <div style={{ fontSize: '2.4rem', fontWeight: 800, color: '#d97706', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
                  ₹{(Number(walletModalUser.walletBalance) || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', marginTop: '6px' }}>
                  <span
                    style={{
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      padding: '3px 10px',
                      borderRadius: '999px',
                      backgroundColor: (Number(walletModalUser.walletBalance) || 0) >= 500 ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.12)',
                      color: (Number(walletModalUser.walletBalance) || 0) >= 500 ? '#10b981' : '#ef4444',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <CheckCircle size={11} />
                    {(Number(walletModalUser.walletBalance) || 0) >= 500 ? 'Eligible for Payout (≥ ₹500)' : 'Locked (< ₹500 Min. Payout)'}
                  </span>
                </div>
              </div>

              {/* Statistics Breakdown */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                <div
                  style={{
                    background: 'var(--hover-bg)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '10px',
                    padding: '12px 14px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)', fontSize: '0.75rem', marginBottom: '4px' }}>
                    <ArrowDownLeft size={14} color="#10b981" />
                    <span>Lifetime Volume</span>
                  </div>
                  <div style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {walletModalUser.lifetimeSpend}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                    {walletModalUser.lifetimeOrders} total transactions
                  </div>
                </div>

                <div
                  style={{
                    background: 'var(--hover-bg)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '10px',
                    padding: '12px 14px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)', fontSize: '0.75rem', marginBottom: '4px' }}>
                    <ShieldCheck size={14} color="#6366f1" />
                    <span>Account Trust</span>
                  </div>
                  <div style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {walletModalUser.verification}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                    Status: {walletModalUser.status}
                  </div>
                </div>
              </div>

              {/* Ledger Summary */}
              <div
                style={{
                  background: 'var(--hover-bg)',
                  borderRadius: '10px',
                  border: '1px solid var(--border-color)',
                  padding: '12px 16px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div>
                  <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)' }}>Escrow & Hold</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Funds reserved for in-progress orders</div>
                </div>
                <div style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  ₹0.00
                </div>
              </div>
            </div>

            <div className="modal-footer" style={{ padding: '14px 24px', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setWalletModalUser(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* User Chats Modal */}
      {chatModalUser && (
        <div className="modal-overlay" onClick={() => setChatModalUser(null)}>
          <div
            className="modal-container"
            style={{
              maxWidth: '920px',
              width: '95%',
              height: '620px',
              borderRadius: '16px',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              padding: 0
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div
              style={{
                padding: '16px 24px',
                borderBottom: '1px solid var(--border-color)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: 'var(--card-bg)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '10px',
                    background: 'rgba(59, 130, 246, 0.12)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#3b82f6'
                  }}
                >
                  <MessageSquare size={20} />
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                      User Conversations
                    </h3>
                    <span
                      style={{
                        fontSize: '0.72rem',
                        fontWeight: 600,
                        padding: '2px 8px',
                        borderRadius: '6px',
                        background: 'rgba(59, 130, 246, 0.12)',
                        color: '#3b82f6'
                      }}
                    >
                      {chatModalUser.name}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)' }}>
                    {chatModalUser.phone} • {chatModalUser.email}
                  </div>
                </div>
              </div>

              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setChatModalUser(null)}
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  border: '1px solid var(--border-color)',
                  backgroundColor: 'var(--hover-bg)',
                  color: 'var(--text-secondary)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer'
                }}
              >
                <X size={15} />
              </button>
            </div>

            {/* Split Pane Body */}
            <div style={{ flex: 1, display: 'flex', minHeight: 0 }}>
              {/* Left Column: Conversations List */}
              <div
                style={{
                  width: '300px',
                  borderRight: '1px solid var(--border-color)',
                  display: 'flex',
                  flexDirection: 'column',
                  background: 'var(--hover-bg)'
                }}
              >
                <div
                  style={{
                    padding: '12px 16px',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                    color: 'var(--text-secondary)',
                    borderBottom: '1px solid var(--border-color)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
                >
                  <span>Chat Threads</span>
                  <span>{userChats.length}</span>
                </div>

                <div style={{ flex: 1, overflowY: 'auto', padding: '8px' }}>
                  {loadingChats ? (
                    <div style={{ padding: '24px 16px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.84rem' }}>
                      Loading conversation threads...
                    </div>
                  ) : userChats.length === 0 ? (
                    <div style={{ padding: '32px 16px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.84rem' }}>
                      No active conversations found for this user.
                    </div>
                  ) : (
                    userChats.map((c) => {
                      const cid = c._id || c.id;
                      const isActive = cid === activeChatId;
                      const counterpart = c.otherParticipant?.fullName || (Array.isArray(c.participants) ? c.participants.find(p => (p._id || p.id) !== chatModalUser.id)?.fullName : 'User');
                      const title = c.listingTitle || c.listingId?.title || 'Direct Conversation';
                      const lastMsg = c.messages && c.messages.length > 0 ? c.messages[c.messages.length - 1].text : 'No messages';

                      return (
                        <div
                          key={cid}
                          onClick={() => setActiveChatId(cid)}
                          style={{
                            padding: '10px 12px',
                            borderRadius: '10px',
                            cursor: 'pointer',
                            marginBottom: '6px',
                            background: isActive ? 'var(--card-bg)' : 'transparent',
                            border: isActive ? '1px solid var(--border-color)' : '1px solid transparent',
                            boxShadow: isActive ? '0 2px 8px rgba(0,0,0,0.06)' : 'none',
                            transition: 'all 0.15s ease'
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
                            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {counterpart}
                            </span>
                            {c.updatedAt && (
                              <span style={{ fontSize: '0.68rem', color: 'var(--text-secondary)' }}>
                                {new Date(c.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            )}
                          </div>
                          <div style={{ fontSize: '0.74rem', color: 'var(--accent-color, #d4af37)', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: '2px' }}>
                            {title}
                          </div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {lastMsg}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Right Column: Chat History & Admin Input */}
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'var(--card-bg)' }}>
                {(() => {
                  const currentConv = userChats.find((c) => (c._id || c.id) === activeChatId);

                  if (!currentConv) {
                    return (
                      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '8px', color: 'var(--text-secondary)' }}>
                        <MessageSquare size={36} strokeWidth={1.5} />
                        <span style={{ fontSize: '0.88rem' }}>Select a conversation thread to view messages</span>
                      </div>
                    );
                  }

                  const counterpart = currentConv.otherParticipant?.fullName || 'User';
                  const title = currentConv.listingTitle || currentConv.listingId?.title || 'Direct Conversation';
                  const messagesList = currentConv.messages || [];

                  return (
                    <>
                      {/* Thread Header */}
                      <div
                        style={{
                          padding: '12px 20px',
                          borderBottom: '1px solid var(--border-color)',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}
                      >
                        <div>
                          <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                            Chat with {counterpart}
                          </div>
                          <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>
                            Subject: {title}
                          </div>
                        </div>
                        <span
                          style={{
                            fontSize: '0.72rem',
                            fontWeight: 600,
                            padding: '2px 8px',
                            borderRadius: '4px',
                            background: 'rgba(16, 185, 129, 0.12)',
                            color: '#10b981'
                          }}
                        >
                          Active Thread
                        </span>
                      </div>

                      {/* Messages Scroll Area */}
                      <div
                        style={{
                          flex: 1,
                          overflowY: 'auto',
                          padding: '16px 20px',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '12px'
                        }}
                      >
                        {messagesList.length === 0 ? (
                          <div style={{ margin: 'auto', color: 'var(--text-secondary)', fontSize: '0.84rem' }}>
                            No messages in this conversation yet.
                          </div>
                        ) : (
                          messagesList.map((m, idx) => {
                            const senderName = m.senderId?.fullName || (typeof m.senderId === 'string' ? m.senderId : 'Participant');
                            const isAdmin = senderName.toLowerCase().includes('admin') || m.senderId?.role === 'admin';
                            const isSelectedUser = String(m.senderId?._id || m.senderId) === String(chatModalUser.id);

                            return (
                              <div
                                key={m._id || idx}
                                style={{
                                  display: 'flex',
                                  flexDirection: 'column',
                                  alignItems: isAdmin ? 'center' : (isSelectedUser ? 'flex-end' : 'flex-start'),
                                  maxWidth: '100%'
                                }}
                              >
                                {isAdmin ? (
                                  <div
                                    style={{
                                      background: 'rgba(79, 70, 229, 0.08)',
                                      border: '1px solid rgba(79, 70, 229, 0.25)',
                                      borderRadius: '10px',
                                      padding: '8px 14px',
                                      maxWidth: '80%',
                                      textAlign: 'center'
                                    }}
                                  >
                                    <div style={{ fontSize: '0.68rem', fontWeight: 700, color: '#4F46E5', marginBottom: '2px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                                      Administrator Note
                                    </div>
                                    <div style={{ fontSize: '0.82rem', color: 'var(--text-primary)' }}>
                                      {m.text}
                                    </div>
                                    <div style={{ fontSize: '0.66rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                                      {m.createdAt ? new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                                    </div>
                                  </div>
                                ) : (
                                  <div
                                    style={{
                                      maxWidth: '75%',
                                      background: isSelectedUser ? 'var(--primary-color, #4f46e5)' : 'var(--hover-bg)',
                                      color: isSelectedUser ? '#ffffff' : 'var(--text-primary)',
                                      border: isSelectedUser ? 'none' : '1px solid var(--border-color)',
                                      borderRadius: isSelectedUser ? '14px 14px 2px 14px' : '14px 14px 14px 2px',
                                      padding: '10px 14px',
                                      boxShadow: '0 1px 3px rgba(0,0,0,0.06)'
                                    }}
                                  >
                                    <div
                                      style={{
                                        fontSize: '0.7rem',
                                        fontWeight: 600,
                                        marginBottom: '3px',
                                        color: isSelectedUser ? 'rgba(255,255,255,0.85)' : 'var(--text-secondary)'
                                      }}
                                    >
                                      {senderName}
                                    </div>
                                    <div style={{ fontSize: '0.84rem', lineHeight: 1.4 }}>
                                      {m.text}
                                    </div>
                                    <div
                                      style={{
                                        fontSize: '0.66rem',
                                        marginTop: '4px',
                                        textAlign: 'right',
                                        color: isSelectedUser ? 'rgba(255,255,255,0.7)' : 'var(--text-secondary)'
                                      }}
                                    >
                                      {m.createdAt ? new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                          })
                        )}
                      </div>

                      {/* Admin Message Reply Bar */}
                      <form
                        onSubmit={handleSendAdminMessage}
                        style={{
                          padding: '12px 16px',
                          borderTop: '1px solid var(--border-color)',
                          background: 'var(--card-bg)',
                          display: 'flex',
                          gap: '8px',
                          alignItems: 'center'
                        }}
                      >
                        <input
                          type="text"
                          value={adminChatInput}
                          onChange={(e) => setAdminChatInput(e.target.value)}
                          placeholder="Type an administrative message or support response..."
                          style={{
                            flex: 1,
                            padding: '10px 14px',
                            borderRadius: '8px',
                            border: '1px solid var(--border-color)',
                            background: 'var(--hover-bg)',
                            color: 'var(--text-primary)',
                            fontSize: '0.84rem',
                            outline: 'none'
                          }}
                        />
                        <button
                          type="submit"
                          className="btn-primary"
                          style={{
                            padding: '10px 16px',
                            borderRadius: '8px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            fontSize: '0.82rem'
                          }}
                        >
                          <Send size={14} />
                          <span>Send</span>
                        </button>
                      </form>
                    </>
                  );
                })()}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
