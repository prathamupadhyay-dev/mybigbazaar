import React, { useState, useEffect, useMemo, useCallback } from 'react';
import PageHeader from '../components/ui/PageHeader';
import ExportButton from '../components/common/ExportButton';
import { apiFetch } from '../utils/api';

export default function Wallets() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [minRedeemAmount, setMinRedeemAmount] = useState(() => {
    return Number(localStorage.getItem('mbb_min_wallet_redeem')) || 500;
  });
  const [inputThreshold, setInputThreshold] = useState(String(minRedeemAmount));
  const [isSavingThreshold, setIsSavingThreshold] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [eligibilityFilter, setEligibilityFilter] = useState('All'); // 'All' | 'Eligible' | 'Locked'
  const [inspectingUser, setInspectingUser] = useState(null);
  const [adjustAmount, setAdjustAmount] = useState('');
  const [adjustNote, setAdjustNote] = useState('');
  const [isUpdatingWallet, setIsUpdatingWallet] = useState(false);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const fetchWallets = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiFetch('/api/v1/wallets').catch(() => null);
      if (res && res.ok) {
        const json = await res.json().catch(() => ({}));
        const list = Array.isArray(json.data) ? json.data : (Array.isArray(json) ? json : []);
        setUsers(
          list.map(u => ({
            ...u,
            walletBalance: Number(u.walletBalance) || 0
          }))
        );
        setLoading(false);
        return;
      }

      // Fallback to /api/v1/users
      const fallbackRes = await apiFetch('/api/v1/users').catch(() => null);
      if (fallbackRes && fallbackRes.ok) {
        const json = await fallbackRes.json().catch(() => ({}));
        const list = Array.isArray(json.data) ? json.data : (Array.isArray(json) ? json : []);
        setUsers(
          list.map(u => ({
            ...u,
            walletBalance: Number(u.walletBalance) || 0
          }))
        );
      }
    } catch (err) {
      console.warn('Failed to load users for wallets:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch settings & users on load
  useEffect(() => {
    let isMounted = true;

    apiFetch('/api/v1/settings')
      .then(res => res.json())
      .then(data => {
        if (isMounted && data?.minWalletRedeemAmount) {
          const val = Number(data.minWalletRedeemAmount) || 500;
          setMinRedeemAmount(val);
          setInputThreshold(String(val));
          localStorage.setItem('mbb_min_wallet_redeem', String(val));
        }
      })
      .catch(() => {});

    fetchWallets();

    return () => { isMounted = false; };
  }, [fetchWallets]);

  const handleSaveThreshold = async () => {
    const num = parseFloat(inputThreshold);
    if (isNaN(num) || num < 0) {
      showToast('Please enter a valid threshold amount.');
      return;
    }

    setIsSavingThreshold(true);
    setMinRedeemAmount(num);
    localStorage.setItem('mbb_min_wallet_redeem', String(num));

    try {
      await apiFetch('/api/v1/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ minWalletRedeemAmount: num })
      });
      showToast(`Minimum redemption mark updated to ₹${num.toLocaleString('en-IN')}.`);
    } catch {
      showToast(`Redemption mark saved locally: ₹${num.toLocaleString('en-IN')}.`);
    } finally {
      setIsSavingThreshold(false);
    }
  };

  // Adjust a single user's wallet ('credit', 'debit', 'reset', 'set')
  const handleAdjustWallet = async (user, action, amountValue = 0) => {
    const userId = user._id || user.id;
    const numericAmount = Number(amountValue) || 0;
    if ((action === 'credit' || action === 'debit') && numericAmount <= 0) {
      showToast('Please enter a valid positive amount.');
      return;
    }

    setIsUpdatingWallet(true);
    try {
      const res = await apiFetch('/api/v1/wallets/adjust', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          action,
          amount: numericAmount,
          note: adjustNote || `Admin ${action}`
        })
      });
      const json = await res.json().catch(() => ({}));
      const updatedBalance = json?.data?.walletBalance !== undefined
        ? Number(json.data.walletBalance)
        : action === 'reset'
        ? 0
        : action === 'credit'
        ? (Number(user.walletBalance) || 0) + numericAmount
        : Math.max(0, (Number(user.walletBalance) || 0) - numericAmount);

      setUsers(prev =>
        prev.map(u =>
          (u._id || u.id) === userId ? { ...u, walletBalance: updatedBalance } : u
        )
      );
      if (inspectingUser && (inspectingUser._id || inspectingUser.id) === userId) {
        setInspectingUser(prev => prev ? { ...prev, walletBalance: updatedBalance } : null);
      }
      setAdjustAmount('');
      setAdjustNote('');
      showToast(
        action === 'reset'
          ? `Wallet emptied to ₹0.00 for ${user.name || user.fullName || 'User'}.`
          : `Wallet updated to ₹${updatedBalance.toLocaleString('en-IN')} for ${user.name || user.fullName || 'User'}.`
      );
    } catch (err) {
      console.warn('Wallet adjust error:', err);
      showToast('Failed to update wallet balance.');
    } finally {
      setIsUpdatingWallet(false);
    }
  };

  // Empty all wallets to ₹0
  const handleResetAllWallets = async () => {
    setIsUpdatingWallet(true);
    try {
      await apiFetch('/api/v1/wallets/reset-all', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      setUsers(prev => prev.map(u => ({ ...u, walletBalance: 0 })));
      if (inspectingUser) {
        setInspectingUser(prev => prev ? { ...prev, walletBalance: 0 } : null);
      }
      showToast('All user & seller wallets reset to ₹0.00.');
    } catch (err) {
      console.warn('Reset all wallets error:', err);
      showToast('Failed to reset all wallets.');
    } finally {
      setIsUpdatingWallet(false);
    }
  };

  // Metrics Calculation
  const totalWallets = users.length;
  const totalBalanceHeld = users.reduce((sum, u) => sum + (Number(u.walletBalance) || 0), 0);
  const eligibleCount = users.filter(u => (Number(u.walletBalance) || 0) >= minRedeemAmount).length;
  const lockedCount = totalWallets - eligibleCount;

  // Filtered List
  const filteredUsers = useMemo(() => {
    return users.filter(u => {
      const balance = Number(u.walletBalance) || 0;
      const q = searchQuery.trim().toLowerCase();
      const matchesSearch =
        q === '' ||
        (u.name || u.fullName || '').toLowerCase().includes(q) ||
        (u.email || '').toLowerCase().includes(q) ||
        (u.phone || u.phoneNumber || '').toLowerCase().includes(q);

      const matchesRole =
        roleFilter === 'All' ||
        (roleFilter === 'Seller' && (u.role === 'Seller' || u.isSeller)) ||
        (roleFilter === 'Provider' && (u.role === 'Provider' || u.isProvider)) ||
        (roleFilter === 'Customer' && (u.role === 'Customer' || u.role === 'user' || !u.role));

      const matchesEligibility =
        eligibilityFilter === 'All' ||
        (eligibilityFilter === 'Eligible' && balance >= minRedeemAmount) ||
        (eligibilityFilter === 'Locked' && balance < minRedeemAmount);

      return matchesSearch && matchesRole && matchesEligibility;
    });
  }, [users, searchQuery, roleFilter, eligibilityFilter, minRedeemAmount]);

  return (
    <div className="admin-page">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          style={{
            position: 'fixed',
            top: '24px',
            right: '24px',
            background: 'var(--color-emerald, #10B981)',
            color: '#FFFFFF',
            padding: '12px 20px',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            zIndex: 9999,
            fontWeight: '600',
            fontSize: '0.9rem'
          }}
        >
          {toastMessage}
        </div>
      )}

      <PageHeader
        title="Wallets"
        description="Monitor user and seller wallet balances (default ₹0), credit/debit funds, and configure the platform-wide redemption threshold."
      >
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          <button
            type="button"
            className="btn-secondary"
            onClick={fetchWallets}
            disabled={loading}
            style={{ padding: '8px 14px', fontSize: '0.84rem' }}
          >
            {loading ? 'Refreshing...' : 'Refresh Wallets'}
          </button>
          {totalBalanceHeld > 0 && (
            <button
              type="button"
              className="btn-secondary"
              onClick={handleResetAllWallets}
              disabled={isUpdatingWallet}
              style={{
                padding: '8px 14px',
                fontSize: '0.84rem',
                color: '#DC2626',
                borderColor: 'rgba(220, 38, 38, 0.35)'
              }}
            >
              Empty All Wallets (₹0)
            </button>
          )}
          <ExportButton
            data={filteredUsers.map(u => ({
              id: u._id || u.id,
              name: u.fullName || u.name,
              email: u.email,
              phone: u.phoneNumber || u.phone,
              role: u.role || 'Customer',
              walletBalance: Number(u.walletBalance) || 0,
              status: u.status || 'Active',
              payoutEligible: (Number(u.walletBalance) || 0) >= minRedeemAmount ? 'Eligible' : 'Locked',
              createdAt: u.createdAt || ''
            }))}
            filename="wallets_ledger.csv"
            label="Export Wallets CSV"
            dateKey="createdAt"
            columns={[
              { key: 'id', label: 'User ID' },
              { key: 'name', label: 'Name' },
              { key: 'email', label: 'Email' },
              { key: 'phone', label: 'Phone' },
              { key: 'role', label: 'Role' },
              { key: 'walletBalance', label: 'Wallet Balance (INR)' },
              { key: 'payoutEligible', label: 'Payout Eligibility' },
              { key: 'status', label: 'Status' },
              { key: 'createdAt', label: 'Registration Date' }
            ]}
          />
        </div>
      </PageHeader>

      {/* Redemption Threshold Rule Configuration Bar */}
      <div
        className="admin-card"
        style={{
          padding: '16px 20px',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '14px',
          borderRadius: '12px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '8px',
              backgroundColor: 'rgba(194, 65, 12, 0.1)',
              color: 'var(--color-terracotta, #C2410C)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.2rem',
              fontWeight: '700'
            }}
          >
            ₹
          </div>
          <div>
            <div style={{ fontWeight: '700', fontSize: '0.95rem', color: 'var(--color-text-primary)' }}>
              Redemption Threshold Rule
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
              Minimum balance required before a user or seller can request a cash payout to Bank/UPI. New accounts start at ₹0.00.
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <span style={{ position: 'absolute', left: '10px', fontWeight: '700', color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
              ₹
            </span>
            <input
              type="number"
              min="0"
              step="50"
              value={inputThreshold}
              onChange={(e) => setInputThreshold(e.target.value)}
              style={{
                width: '120px',
                padding: '8px 12px 8px 24px',
                borderRadius: '8px',
                border: '1px solid var(--color-border)',
                backgroundColor: 'var(--color-panel)',
                color: 'var(--color-text-primary)',
                fontWeight: '700',
                fontSize: '0.95rem'
              }}
            />
          </div>
          <button
            type="button"
            className="btn-primary"
            onClick={handleSaveThreshold}
            disabled={isSavingThreshold}
            style={{ padding: '8px 16px', fontSize: '0.85rem' }}
          >
            {isSavingThreshold ? 'Saving...' : 'Save Rule'}
          </button>
        </div>
      </div>

      {/* KPI Stats Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '20px' }}>
        <div className="admin-card" style={{ padding: '16px', borderRadius: '12px' }}>
          <div style={{ fontSize: '11px', fontWeight: '700', color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Total Wallets
          </div>
          <div style={{ fontSize: '24px', fontWeight: '800', marginTop: '6px', color: 'var(--color-text-primary)' }}>
            {totalWallets.toLocaleString()}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
            Active platform accounts
          </div>
        </div>

        <div className="admin-card" style={{ padding: '16px', borderRadius: '12px' }}>
          <div style={{ fontSize: '11px', fontWeight: '700', color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Total Balance Held
          </div>
          <div style={{ fontSize: '24px', fontWeight: '800', marginTop: '6px', color: 'var(--color-terracotta, #C2410C)' }}>
            ₹{totalBalanceHeld.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
            Across all users &amp; sellers
          </div>
        </div>

        <div className="admin-card" style={{ padding: '16px', borderRadius: '12px' }}>
          <div style={{ fontSize: '11px', fontWeight: '700', color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Eligible for Payout (≥ ₹{minRedeemAmount})
          </div>
          <div style={{ fontSize: '24px', fontWeight: '800', marginTop: '6px', color: '#10B981' }}>
            {eligibleCount}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
            Can request withdrawal
          </div>
        </div>

        <div className="admin-card" style={{ padding: '16px', borderRadius: '12px' }}>
          <div style={{ fontSize: '11px', fontWeight: '700', color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Empty / Locked (&lt; ₹{minRedeemAmount})
          </div>
          <div style={{ fontSize: '24px', fontWeight: '800', marginTop: '6px', color: 'var(--color-text-secondary)' }}>
            {lockedCount}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
            Default ₹0 or under minimum
          </div>
        </div>
      </div>

      {/* Main Wallets Table Card */}
      <div className="admin-card" style={{ borderRadius: '12px', padding: '20px' }}>
        {/* Filters Toolbar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flex: 1, minWidth: '260px' }}>
            <input
              type="text"
              placeholder="Search user, email, or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                padding: '8px 12px',
                borderRadius: '8px',
                border: '1px solid var(--color-border)',
                backgroundColor: 'var(--color-panel)',
                color: 'var(--color-text-primary)',
                fontSize: '0.88rem',
                width: '100%',
                maxWidth: '320px'
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              style={{
                padding: '8px 12px',
                borderRadius: '8px',
                border: '1px solid var(--color-border)',
                backgroundColor: 'var(--color-panel)',
                color: 'var(--color-text-primary)',
                fontSize: '0.85rem'
              }}
            >
              <option value="All">All Roles</option>
              <option value="Seller">Sellers</option>
              <option value="Provider">Service Providers</option>
              <option value="Customer">Customers</option>
            </select>

            <select
              value={eligibilityFilter}
              onChange={(e) => setEligibilityFilter(e.target.value)}
              style={{
                padding: '8px 12px',
                borderRadius: '8px',
                border: '1px solid var(--color-border)',
                backgroundColor: 'var(--color-panel)',
                color: 'var(--color-text-primary)',
                fontSize: '0.85rem'
              }}
            >
              <option value="All">All Eligibility</option>
              <option value="Eligible">Eligible (≥ ₹{minRedeemAmount})</option>
              <option value="Locked">Locked / Empty (&lt; ₹{minRedeemAmount})</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div style={{ overflowX: 'auto' }}>
          <table className="admin-table" style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--hover-bg)', borderBottom: '1px solid var(--color-border)' }}>
                <th style={{ padding: '12px 16px', fontSize: '12px', fontWeight: '600', color: 'var(--color-text-secondary)' }}>Name &amp; Role</th>
                <th style={{ padding: '12px 16px', fontSize: '12px', fontWeight: '600', color: 'var(--color-text-secondary)' }}>Phone / Email</th>
                <th style={{ padding: '12px 16px', fontSize: '12px', fontWeight: '600', color: 'var(--color-text-secondary)' }}>Wallet Balance</th>
                <th style={{ padding: '12px 16px', fontSize: '12px', fontWeight: '600', color: 'var(--color-text-secondary)' }}>Redeem Eligibility</th>
                <th style={{ padding: '12px 16px', fontSize: '12px', fontWeight: '600', color: 'var(--color-text-secondary)' }}>Wallet Status</th>
                <th style={{ padding: '12px 16px', fontSize: '12px', fontWeight: '600', color: 'var(--color-text-secondary)', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" style={{ padding: '36px', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
                    Loading wallet records...
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ padding: '36px', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
                    No matching wallet records found.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => {
                  const balance = Number(u.walletBalance) || 0;
                  const isEligible = balance >= minRedeemAmount;
                  const roleName = u.role === 'Provider' || u.isProvider ? 'Service Provider' : u.role === 'Seller' || u.isSeller ? 'Seller' : 'Customer';

                  return (
                    <tr
                      key={u._id || u.id}
                      style={{ borderBottom: '1px solid var(--color-border)', transition: 'background 0.15s' }}
                    >
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ fontWeight: '600', color: 'var(--color-text-primary)', fontSize: '0.9rem' }}>
                          {u.name || u.fullName || 'User'}
                        </div>
                        <span
                          style={{
                            display: 'inline-block',
                            fontSize: '11px',
                            fontWeight: '600',
                            padding: '2px 6px',
                            borderRadius: '4px',
                            background: roleName === 'Service Provider' ? 'rgba(11, 37, 69, 0.1)' : roleName === 'Seller' ? 'rgba(194, 65, 12, 0.1)' : 'var(--hover-bg)',
                            color: roleName === 'Service Provider' ? 'var(--color-navy, #0B2545)' : roleName === 'Seller' ? 'var(--color-terracotta, #C2410C)' : 'var(--color-text-secondary)',
                            marginTop: '2px'
                          }}
                        >
                          {roleName}
                        </span>
                      </td>

                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ fontSize: '0.85rem', color: 'var(--color-text-primary)' }}>
                          {u.phone || u.phoneNumber || '—'}
                        </div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
                          {u.email || '—'}
                        </div>
                      </td>

                      <td style={{ padding: '12px 16px', fontWeight: '700', fontSize: '0.95rem', color: balance > 0 ? 'var(--color-terracotta, #C2410C)' : 'var(--color-text-primary)' }}>
                        ₹{balance.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>

                      <td style={{ padding: '12px 16px' }}>
                        {isEligible ? (
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              padding: '3px 8px',
                              borderRadius: '6px',
                              fontSize: '12px',
                              fontWeight: '600',
                              backgroundColor: 'rgba(16, 185, 129, 0.12)',
                              color: '#10B981'
                            }}
                          >
                            <span>●</span> Eligible (≥ ₹{minRedeemAmount})
                          </span>
                        ) : (
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              padding: '3px 8px',
                              borderRadius: '6px',
                              fontSize: '12px',
                              fontWeight: '600',
                              backgroundColor: 'var(--hover-bg)',
                              color: 'var(--color-text-secondary)'
                            }}
                          >
                            <span>○</span> Locked (&lt; ₹{minRedeemAmount})
                          </span>
                        )}
                      </td>

                      <td style={{ padding: '12px 16px', fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
                        {balance > 0 ? 'Active Credits' : 'Empty Wallet (₹0)'}
                      </td>

                      <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '6px', alignItems: 'center' }}>
                          {balance > 0 && (
                            <button
                              type="button"
                              className="btn-secondary"
                              onClick={() => handleAdjustWallet(u, 'reset', 0)}
                              disabled={isUpdatingWallet}
                              style={{ padding: '5px 10px', fontSize: '0.76rem', color: '#DC2626' }}
                            >
                              Reset ₹0
                            </button>
                          )}
                          <button
                            type="button"
                            className="btn-secondary"
                            onClick={() => {
                              setInspectingUser(u);
                              setAdjustAmount('');
                              setAdjustNote('');
                            }}
                            style={{ padding: '5px 12px', fontSize: '0.8rem' }}
                          >
                            Manage Wallet
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Inspect & Manage Wallet Modal */}
      {inspectingUser && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            backdropFilter: 'var(--glass-blur)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10001,
            padding: '20px'
          }}
        >
          <div
            className="admin-card"
            style={{
              width: '520px',
              maxWidth: '92vw',
              padding: '24px',
              borderRadius: '16px',
              background: 'var(--modal-bg, var(--color-panel))',
              border: '1px solid var(--color-border)',
              boxShadow: '0 16px 36px rgba(0,0,0,0.25)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                Manage Wallet: {inspectingUser.name || inspectingUser.fullName || 'User'}
              </h3>
              <button
                type="button"
                onClick={() => setInspectingUser(null)}
                style={{
                  background: 'var(--hover-bg)',
                  border: '1px solid var(--color-border)',
                  borderRadius: '50%',
                  width: '28px',
                  height: '28px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: 'var(--color-text-secondary)'
                }}
              >
                ✕
              </button>
            </div>

            <div style={{ background: 'var(--hover-bg)', padding: '14px', borderRadius: '10px', marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>Current Balance:</span>
                <span style={{ fontWeight: '800', color: 'var(--color-terracotta, #C2410C)', fontSize: '1.05rem' }}>
                  ₹{(Number(inspectingUser.walletBalance) || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>Redeem Threshold:</span>
                <span style={{ fontWeight: '600', color: 'var(--color-text-primary)' }}>₹{minRedeemAmount}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>Status:</span>
                <span style={{ fontWeight: '600', color: (Number(inspectingUser.walletBalance) || 0) >= minRedeemAmount ? '#10B981' : 'var(--color-text-secondary)' }}>
                  {(Number(inspectingUser.walletBalance) || 0) >= minRedeemAmount ? 'Eligible for Payout' : 'Empty / Locked'}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>Contact:</span>
                <span style={{ fontWeight: '500', color: 'var(--color-text-primary)', fontSize: '0.85rem' }}>
                  {inspectingUser.email || inspectingUser.phone || inspectingUser.phoneNumber || '—'}
                </span>
              </div>
            </div>

            {/* Balance Adjustment Controls */}
            <div style={{ border: '1px solid var(--color-border)', padding: '14px', borderRadius: '10px', marginBottom: '16px' }}>
              <div style={{ fontWeight: '700', fontSize: '0.85rem', marginBottom: '10px', color: 'var(--color-text-primary)' }}>
                Adjust Wallet Balance (Credit / Debit / Empty to ₹0)
              </div>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
                <input
                  type="number"
                  min="0"
                  placeholder="Enter amount (₹)"
                  value={adjustAmount}
                  onChange={(e) => setAdjustAmount(e.target.value)}
                  style={{
                    flex: 1,
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: '1px solid var(--color-border)',
                    backgroundColor: 'var(--color-panel)',
                    color: 'var(--color-text-primary)',
                    fontSize: '0.88rem'
                  }}
                />
                <input
                  type="text"
                  placeholder="Note / Reason (optional)"
                  value={adjustNote}
                  onChange={(e) => setAdjustNote(e.target.value)}
                  style={{
                    flex: 1.2,
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: '1px solid var(--color-border)',
                    backgroundColor: 'var(--color-panel)',
                    color: 'var(--color-text-primary)',
                    fontSize: '0.85rem'
                  }}
                />
              </div>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  className="btn-primary"
                  disabled={isUpdatingWallet}
                  onClick={() => handleAdjustWallet(inspectingUser, 'credit', adjustAmount)}
                  style={{ padding: '7px 14px', fontSize: '0.82rem', background: '#10B981', borderColor: '#10B981' }}
                >
                  + Credit Funds
                </button>
                <button
                  type="button"
                  className="btn-secondary"
                  disabled={isUpdatingWallet}
                  onClick={() => handleAdjustWallet(inspectingUser, 'debit', adjustAmount)}
                  style={{ padding: '7px 14px', fontSize: '0.82rem' }}
                >
                  - Debit Funds
                </button>
                <button
                  type="button"
                  className="btn-secondary"
                  disabled={isUpdatingWallet}
                  onClick={() => handleAdjustWallet(inspectingUser, 'reset', 0)}
                  style={{ padding: '7px 14px', fontSize: '0.82rem', color: '#DC2626', marginLeft: 'auto' }}
                >
                  Empty Wallet (Reset to ₹0)
                </button>
              </div>
            </div>

            {/* Payout Destination Card */}
            <div style={{ border: '1px solid var(--color-border)', padding: '14px', borderRadius: '10px', marginBottom: '16px' }}>
              <div style={{ fontWeight: '700', fontSize: '0.85rem', marginBottom: '6px', color: 'var(--color-text-primary)' }}>
                Linked Payout Destination
              </div>
              {inspectingUser.bankDetails?.accountNumber || inspectingUser.upiId ? (
                <div style={{ fontSize: '0.85rem', color: 'var(--color-text-primary)' }}>
                  {inspectingUser.upiId && <div><strong>UPI ID:</strong> {inspectingUser.upiId}</div>}
                  {inspectingUser.bankDetails?.accountNumber && (
                    <div style={{ marginTop: 4 }}>
                      <strong>Bank:</strong> {inspectingUser.bankDetails.bankName} (A/C: {inspectingUser.bankDetails.accountNumber})
                    </div>
                  )}
                </div>
              ) : (
                <div style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
                  No external UPI or Bank account linked by user yet.
                </div>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setInspectingUser(null)}
                style={{ padding: '8px 18px', borderRadius: '8px' }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
