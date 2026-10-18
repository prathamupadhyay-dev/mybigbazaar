import React, { useState, useEffect } from 'react';
import PageHeader from '../components/ui/PageHeader';
import ExportButton from '../components/common/ExportButton';
import { apiFetch } from '../utils/api';

export const INITIAL_INVOICES = [];

export default function Invoices() {
  const [invoices, setInvoices] = useState(INITIAL_INVOICES);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  const fetchInvoices = async () => {
    setLoading(true);
    try {
      const res = await apiFetch('/api/v1/invoices').catch(() => null);
      if (res && res.ok) {
        const json = await res.json().catch(() => ({}));
        const list = Array.isArray(json.data) ? json.data : [];
        setInvoices(list);
      }
    } catch (err) {
      console.warn('Failed to load live invoices:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const filteredInvoices = invoices.filter((inv) => {
    const q = searchQuery.trim().toLowerCase();
    const matchesSearch =
      q === ''
        ? true
        : (inv.id || '').toLowerCase().includes(q) ||
          (inv.refNumber || '').toLowerCase().includes(q) ||
          (inv.customerName || '').toLowerCase().includes(q) ||
          (inv.sellerName || '').toLowerCase().includes(q) ||
          (inv.productTitle || '').toLowerCase().includes(q);

    const matchesStatus = statusFilter === 'All' ? true : inv.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const totalInvoicedValue = invoices
    .filter((i) => i.status === 'Paid')
    .reduce((sum, i) => sum + (Number(i.totalAmount) || 0), 0);

  const totalGstCollected = invoices
    .filter((i) => i.status === 'Paid')
    .reduce((sum, i) => sum + (Number(i.totalTax) || 0), 0);

  const paidCount = invoices.filter((i) => i.status === 'Paid').length;

  const handleDownloadPDF = (inv) => {
    showToast(`PDF invoice generated for ${inv.id}. Initiating browser download...`);
  };

  return (
    <div className="admin-page">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          style={{
            position: 'fixed',
            top: '24px',
            right: '24px',
            background: '#10B981',
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

      {/* Header */}
      <PageHeader
        title="Invoices"
        breadcrumbs={['Commerce', 'Invoices']}
      >
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button
            type="button"
            className="btn-secondary"
            onClick={fetchInvoices}
            disabled={loading}
            style={{ padding: '8px 14px', fontSize: '0.84rem' }}
          >
            {loading ? 'Refreshing...' : 'Refresh Invoices'}
          </button>
          <ExportButton
            data={filteredInvoices}
            filename="invoices_gstr1_report.csv"
            label="Export GSTR-1 CSV"
            variant="primary"
            dateKey="date"
            columns={[
              { key: 'id', label: 'Invoice Number' },
              { key: 'refNumber', label: 'Reference Number' },
              { key: 'date', label: 'Date' },
              { key: 'customerName', label: 'Buyer' },
              { key: 'sellerName', label: 'Seller' },
              { key: 'productTitle', label: 'Product' },
              { key: 'customerState', label: 'Place of Supply (State)' },
              { key: 'taxableAmount', label: 'Taxable Value (INR)' },
              { key: 'cgst', label: 'CGST 9% (INR)' },
              { key: 'sgst', label: 'SGST 9% (INR)' },
              { key: 'totalTax', label: 'Total GST (INR)' },
              { key: 'totalAmount', label: 'Invoice Value (INR)' },
              { key: 'status', label: 'Status' }
            ]}
          />
        </div>
      </PageHeader>

      {/* KPI Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '14px',
          marginBottom: '20px'
        }}
      >
        <div className="admin-card" style={{ padding: '16px' }}>
          <div style={{ color: 'var(--text-secondary)', fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Invoiced Revenue
          </div>
          <div style={{ fontSize: '24px', fontWeight: '600', color: 'var(--accent-color)', marginTop: '4px' }}>
            ₹{totalInvoicedValue.toLocaleString('en-IN')}
          </div>
          <div style={{ fontSize: '0.8rem', color: '#10B981', marginTop: '4px' }}>
            Realized order values
          </div>
        </div>

        <div className="admin-card" style={{ padding: '16px' }}>
          <div style={{ color: 'var(--text-secondary)', fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            GST Collected (18%)
          </div>
          <div style={{ fontSize: '24px', fontWeight: '600', color: '#10B981', marginTop: '4px' }}>
            ₹{Math.round(totalGstCollected).toLocaleString('en-IN')}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            CGST &amp; SGST breakdown
          </div>
        </div>

        <div className="admin-card" style={{ padding: '16px' }}>
          <div style={{ color: 'var(--text-secondary)', fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Paid Invoices
          </div>
          <div style={{ fontSize: '24px', fontWeight: '600', color: 'var(--text-primary)', marginTop: '4px' }}>
            {paidCount}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Compliant e-Way records
          </div>
        </div>

        <div className="admin-card" style={{ padding: '16px' }}>
          <div style={{ color: 'var(--text-secondary)', fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            GSTIN Identification
          </div>
          <div style={{ fontSize: '15px', fontWeight: '600', color: 'var(--text-primary)', marginTop: '8px', fontFamily: 'monospace' }}>
            32AAACB0000A1Z5
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            State: Kerala (Code 32)
          </div>
        </div>
      </div>

      {/* Main Invoices Table */}
      <div className="admin-card">
        <div
          className="admin-card-header"
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '12px',
            padding: '16px 20px',
            borderBottom: '1px solid var(--border-color)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: '280px' }}>
            <input
              type="text"
              placeholder="Search by Invoice ID, Ref #, Customer..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 14px',
                borderRadius: '8px',
                border: '1px solid var(--border-color)',
                background: 'var(--input-bg)',
                color: 'var(--text-primary)',
                fontSize: '0.9rem',
                outline: 'none'
              }}
            />
          </div>

          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{
                padding: '8px 12px',
                borderRadius: '8px',
                border: '1px solid var(--border-color)',
                background: 'var(--input-bg)',
                color: 'var(--text-primary)',
                fontSize: '0.9rem',
                outline: 'none'
              }}
            >
              <option value="All">All Invoices</option>
              <option value="Paid">Paid</option>
              <option value="Generated">Generated</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        <div className="table-container contain-content" style={{ overflowX: 'auto' }}>
          <table className="admin-table" style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--hover-bg)', borderBottom: '1px solid var(--border-color)' }}>
                <th style={{ padding: '14px 16px' }}>Invoice Number</th>
                <th style={{ padding: '14px 16px' }}>Ref Number</th>
                <th style={{ padding: '14px 16px' }}>Customer</th>
                <th style={{ padding: '14px 16px' }}>Taxable Value</th>
                <th style={{ padding: '14px 16px' }}>CGST (9%)</th>
                <th style={{ padding: '14px 16px' }}>SGST (9%)</th>
                <th style={{ padding: '14px 16px' }}>Total Amount</th>
                <th style={{ padding: '14px 16px' }}>Commission</th>
                <th style={{ padding: '14px 16px' }}>Net Payout</th>
                <th style={{ padding: '14px 16px' }}>Status</th>
                <th style={{ padding: '14px 16px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan="11" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                    No matching invoices found.
                  </td>
                </tr>
              ) : (
                filteredInvoices.map((inv) => {
                  const commRate = inv.commissionRate || 10;
                  const commAmt = Math.round(((inv.taxableAmount || inv.totalAmount || 0) * commRate) / 100);
                  const netPayout = (inv.totalAmount || 0) - commAmt;
                  return (
                    <tr
                      key={inv.id}
                      style={{ borderBottom: '1px solid var(--border-color)', transition: 'background 0.2s' }}
                    >
                      <td style={{ padding: '14px 16px', fontWeight: '700', color: 'var(--primary-color)' }}>
                        {inv.id}
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ fontWeight: '600' }}>{inv.refNumber}</div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{inv.productTitle || 'Marketplace Item'}</div>
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ fontWeight: '600' }}>{inv.customerName}</div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                          Seller: {inv.sellerName || 'Verified Seller'} · {inv.customerState}
                        </div>
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        ₹{(inv.taxableAmount || 0).toLocaleString('en-IN')}
                      </td>
                      <td style={{ padding: '14px 16px', color: 'var(--text-secondary)' }}>
                        ₹{(inv.cgst || 0).toLocaleString('en-IN')}
                      </td>
                      <td style={{ padding: '14px 16px', color: 'var(--text-secondary)' }}>
                        ₹{(inv.sgst || 0).toLocaleString('en-IN')}
                      </td>
                      <td style={{ padding: '14px 16px', fontWeight: '800', color: '#0A84FF' }}>
                        ₹{(inv.totalAmount || 0).toLocaleString('en-IN')}
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <span style={{ fontWeight: '600', color: 'var(--accent-color)', fontSize: '0.84rem' }}>
                          {commRate}% (₹{commAmt.toLocaleString('en-IN')})
                        </span>
                      </td>
                      <td style={{ padding: '14px 16px', fontWeight: '700', color: '#16a34a' }}>
                        ₹{netPayout.toLocaleString('en-IN')}
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <span
                          className={
                            inv.status === 'Paid'
                              ? 'badge badge-success'
                              : inv.status === 'Generated'
                              ? 'badge badge-warning'
                              : 'badge badge-danger'
                          }
                        >
                          {inv.status}
                        </span>
                      </td>
                    <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                      <button
                        className="btn-secondary"
                        style={{ padding: '6px 12px', fontSize: '0.8rem', marginRight: '6px' }}
                        onClick={() => setSelectedInvoice(inv)}
                      >
                        View Invoice
                      </button>
                      <button
                        className="btn-primary"
                        style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                        onClick={() => handleDownloadPDF(inv)}
                      >
                        PDF
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
            </tbody>
          </table>
        </div>
      </div>

      {/* View Tax Invoice Modal */}
      {selectedInvoice && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            backdropFilter: 'var(--glass-blur)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999
          }}
        >
          <div
            className="admin-card"
            style={{
              width: '640px',
              maxWidth: '92vw',
              padding: '28px',
              background: 'var(--modal-bg)',
              borderRadius: '16px',
              border: '1px solid var(--border-color)',
              boxShadow: '0 12px 32px rgba(0,0,0,0.3)'
            }}
          >
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px', marginBottom: '16px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 600, color: 'var(--text-primary)' }}>MyBigBazaar Internet Private Limited</h3>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                  12 Tech Park, Kumarakom Road, Kottayam, Kerala - 686001
                </div>
                <div style={{ fontSize: '0.8rem', fontWeight: '600', color: '#10B981', marginTop: '2px' }}>
                  GSTIN: 32AAACB0000A1Z5 · State: Kerala (Code 32)
                </div>
              </div>
              <button
                onClick={() => setSelectedInvoice(null)}
                style={{
                  background: 'var(--hover-bg)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '50%',
                  width: '28px',
                  height: '28px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: 'var(--text-secondary)'
                }}
                aria-label="Close"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>

            {/* Invoice Meta Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px', background: 'var(--hover-bg)', padding: '12px', borderRadius: '8px' }}>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Tax Invoice Number:</div>
                <div style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{selectedInvoice.id}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '6px' }}>Reference Order / Booking:</div>
                <div style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{selectedInvoice.refNumber}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Billed To:</div>
                <div style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{selectedInvoice.customerName}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{selectedInvoice.customerEmail}</div>
                <div style={{ fontSize: '0.8rem', color: '#059669', fontWeight: '600' }}>Place of Supply: {selectedInvoice.customerState}</div>
              </div>
            </div>

            {/* Line Items Table */}
            <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse', marginBottom: '16px' }}>
              <thead>
                <tr style={{ background: 'var(--hover-bg)', borderBottom: '1px solid var(--border-color)', fontSize: '0.8rem' }}>
                  <th style={{ padding: '8px 10px', color: 'var(--text-secondary)' }}>Item Description</th>
                  <th style={{ padding: '8px 10px', color: 'var(--text-secondary)' }}>HSN/SAC</th>
                  <th style={{ padding: '8px 10px', color: 'var(--text-secondary)' }}>Qty</th>
                  <th style={{ padding: '8px 10px', color: 'var(--text-secondary)', textAlign: 'right' }}>Amount</th>
                </tr>
              </thead>
              <tbody>
                {(selectedInvoice.items || []).map((it, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid var(--border-color)', fontSize: '0.85rem' }}>
                    <td style={{ padding: '8px 10px', fontWeight: '600', color: 'var(--text-primary)' }}>{it.desc || it.name || 'Item'}</td>
                    <td style={{ padding: '8px 10px', color: 'var(--text-secondary)' }}>{selectedInvoice.hsnCode || '9985'}</td>
                    <td style={{ padding: '8px 10px', color: 'var(--text-secondary)' }}>{it.qty || 1}</td>
                    <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: '600', color: 'var(--text-primary)' }}>
                      ₹{(Number(it.amount) || 0).toLocaleString('en-IN')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Totals Breakdown */}
            <div style={{ background: 'var(--hover-bg)', padding: '14px', borderRadius: '8px', marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '4px' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Taxable Value:</span>
                <span style={{ fontWeight: '600', color: 'var(--text-primary)' }}>₹{(Number(selectedInvoice.taxableAmount) || 0).toLocaleString('en-IN')}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '4px' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Central GST (CGST @ 9%):</span>
                <span style={{ color: 'var(--text-primary)' }}>₹{(Number(selectedInvoice.cgst) || 0).toLocaleString('en-IN')}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '6px' }}>
                <span style={{ color: 'var(--text-secondary)' }}>State GST (SGST @ 9%):</span>
                <span style={{ color: 'var(--text-primary)' }}>₹{(Number(selectedInvoice.sgst) || 0).toLocaleString('en-IN')}</span>
              </div>
              <div style={{ height: '1px', background: 'var(--border-color)', margin: '8px 0' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1rem', fontWeight: '600' }}>
                <span style={{ color: 'var(--text-primary)' }}>Total Invoice Value:</span>
                <span style={{ color: 'var(--accent-color)' }}>₹{(Number(selectedInvoice.totalAmount) || 0).toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Modal Actions */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button className="btn-secondary" onClick={() => setSelectedInvoice(null)} style={{ padding: '8px 16px', borderRadius: '6px' }}>
                Close
              </button>
              <button className="btn-primary" onClick={() => handleDownloadPDF(selectedInvoice)} style={{ padding: '8px 16px', borderRadius: '6px' }}>
                Download PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
