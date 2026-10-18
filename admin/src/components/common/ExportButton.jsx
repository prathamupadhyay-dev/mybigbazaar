import React, { useState, useMemo, useEffect } from 'react';
import { Calendar, Download, X, CheckCircle2, Filter, FileText } from 'lucide-react';

/**
 * Universal date parser helper
 * Auto-detects dates from items in various formats (ISO, YYYY-MM-DD, DD/MM/YYYY, timestamps, Date objects)
 */
function parseItemDate(item, explicitKey) {
  if (!item || typeof item !== 'object') return null;

  const candidates = explicitKey
    ? [explicitKey]
    : [
        'createdAt',
        'created_at',
        'date',
        'joinedDate',
        'timestamp',
        'bookingDate',
        'orderDate',
        'invoiceDate',
        'requestedAt',
        'updatedAt',
        'startDate',
        'validUntil',
        'time',
        'effectiveDate'
      ];

  let raw = null;
  let matchedKey = null;

  for (const k of candidates) {
    if (item[k] !== undefined && item[k] !== null && item[k] !== '') {
      raw = item[k];
      matchedKey = k;
      break;
    }
  }

  // Nested checks (e.g. item.slot?.date)
  if (raw === null && item.slot && item.slot.date) {
    raw = item.slot.date;
    matchedKey = 'slot.date';
  }

  // Fallback: scan any key containing date/time/_at
  if (raw === null) {
    for (const [k, v] of Object.entries(item)) {
      if (/date|time|_at/i.test(k) && (typeof v === 'string' || typeof v === 'number' || v instanceof Date)) {
        raw = v;
        matchedKey = k;
        break;
      }
    }
  }

  if (raw === null) return { date: null, key: null };

  if (raw instanceof Date) {
    return { date: isNaN(raw.getTime()) ? null : raw, key: matchedKey };
  }

  if (typeof raw === 'number') {
    const d = new Date(raw > 1e11 ? raw : raw * 1000);
    return { date: isNaN(d.getTime()) ? null : d, key: matchedKey };
  }

  if (typeof raw === 'string') {
    const str = raw.trim();
    // YYYY-MM-DD or YYYY/MM/DD
    const isoMatch = str.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})/);
    if (isoMatch) {
      const d = new Date(parseInt(isoMatch[1], 10), parseInt(isoMatch[2], 10) - 1, parseInt(isoMatch[3], 10));
      return { date: isNaN(d.getTime()) ? null : d, key: matchedKey };
    }
    // DD/MM/YYYY or DD-MM-YYYY
    const ddmmyyyy = str.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})/);
    if (ddmmyyyy) {
      const d = new Date(parseInt(ddmmyyyy[3], 10), parseInt(ddmmyyyy[2], 10) - 1, parseInt(ddmmyyyy[1], 10));
      return { date: isNaN(d.getTime()) ? null : d, key: matchedKey };
    }
    const parsed = new Date(str);
    return { date: isNaN(parsed.getTime()) ? null : parsed, key: matchedKey };
  }

  return { date: null, key: null };
}

function formatDateToInput(d) {
  if (!d || isNaN(d.getTime())) return '';
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/**
 * Universal CSV Export Button with Date Range Selection
 * Provides macOS-native modal to filter data by date range before downloading CSV.
 */
export default function ExportButton({
  data = [],
  filename = 'export.csv',
  columns = null, // [{ key: 'id', label: 'Booking ID' }, ...]
  label = 'Export CSV',
  variant = 'secondary',
  dateKey = null,
  showCalendarIcon = true,
  style = {}
}) {
  const [modalOpen, setModalOpen] = useState(false);
  const [activePreset, setActivePreset] = useState('all'); // 'all' | 'today' | 'yesterday' | 'last7' | 'last30' | 'thisMonth' | 'lastMonth' | 'custom'
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [customFilename, setCustomFilename] = useState('');
  const [exporting, setExporting] = useState(false);
  const [toast, setToast] = useState('');

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3500);
  };

  // Inspect first record to detect date field
  const detectedDateKey = useMemo(() => {
    if (dateKey) return dateKey;
    if (!data || data.length === 0) return null;
    for (const item of data.slice(0, 10)) {
      const res = parseItemDate(item, null);
      if (res.date) return res.key;
    }
    return null;
  }, [data, dateKey]);

  // When modal opens, initialize default filename and dates
  const handleOpenModal = () => {
    setCustomFilename(filename.endsWith('.csv') ? filename.slice(0, -4) : filename);
    setModalOpen(true);
  };

  // Preset handlers
  const handleSelectPreset = (preset) => {
    setActivePreset(preset);
    const now = new Date();

    if (preset === 'all') {
      setStartDate('');
      setEndDate('');
      return;
    }

    if (preset === 'today') {
      const todayStr = formatDateToInput(now);
      setStartDate(todayStr);
      setEndDate(todayStr);
      return;
    }

    if (preset === 'yesterday') {
      const yesterday = new Date(now.getTime() - 86400000);
      const yStr = formatDateToInput(yesterday);
      setStartDate(yStr);
      setEndDate(yStr);
      return;
    }

    if (preset === 'last7') {
      const d7 = new Date(now.getTime() - 7 * 86400000);
      setStartDate(formatDateToInput(d7));
      setEndDate(formatDateToInput(now));
      return;
    }

    if (preset === 'last30') {
      const d30 = new Date(now.getTime() - 30 * 86400000);
      setStartDate(formatDateToInput(d30));
      setEndDate(formatDateToInput(now));
      return;
    }

    if (preset === 'thisMonth') {
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
      setStartDate(formatDateToInput(firstDay));
      setEndDate(formatDateToInput(now));
      return;
    }

    if (preset === 'lastMonth') {
      const firstDayLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const lastDayLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
      setStartDate(formatDateToInput(firstDayLastMonth));
      setEndDate(formatDateToInput(lastDayLastMonth));
      return;
    }

    if (preset === 'custom') {
      if (!startDate) {
        const d30 = new Date(now.getTime() - 30 * 86400000);
        setStartDate(formatDateToInput(d30));
      }
      if (!endDate) {
        setEndDate(formatDateToInput(now));
      }
    }
  };

  // Filter data based on selected date range
  const filteredData = useMemo(() => {
    if (!data || data.length === 0) return [];
    if (!startDate && !endDate) return data;

    let startBound = null;
    let endBound = null;

    if (startDate) {
      const [sy, sm, sd] = startDate.split('-').map(Number);
      startBound = new Date(sy, sm - 1, sd, 0, 0, 0, 0);
    }
    if (endDate) {
      const [ey, em, ed] = endDate.split('-').map(Number);
      endBound = new Date(ey, em - 1, ed, 23, 59, 59, 999);
    }

    return data.filter((item) => {
      const { date } = parseItemDate(item, detectedDateKey);
      if (!date) {
        // If dataset has no detectable date at all, include it so export isn't completely empty
        return !detectedDateKey;
      }
      if (startBound && date < startBound) return false;
      if (endBound && date > endBound) return false;
      return true;
    });
  }, [data, startDate, endDate, detectedDateKey]);

  // Actual CSV export generation
  const performExport = (datasetToExport, explicitSuffix = '') => {
    if (!datasetToExport || datasetToExport.length === 0) {
      showToast('No records match the selected date range.');
      return;
    }

    setExporting(true);

    try {
      const headers = columns
        ? columns.map((c) => c.label)
        : Object.keys(datasetToExport[0] || {});

      const keys = columns
        ? columns.map((c) => c.key)
        : Object.keys(datasetToExport[0] || {});

      const formatCell = (val) => {
        if (val === null || val === undefined) return '""';
        if (typeof val === 'object') return `"${JSON.stringify(val).replace(/"/g, '""')}"`;
        const str = String(val).replace(/"/g, '""');
        return `"${str}"`;
      };

      const headerRow = headers.map((h) => `"${h}"`).join(',');
      const dataRows = datasetToExport.map((item) =>
        keys.map((k) => formatCell(item[k])).join(',')
      );

      // Prepend BOM (\uFEFF) so Excel & Google Sheets correctly decode UTF-8 symbols (₹, letters)
      const csvContent = '\uFEFF' + [headerRow, ...dataRows].join('\r\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob)

      const baseName = (customFilename || filename).replace(/\.csv$/i, '');
      const dateSuffix = explicitSuffix || (startDate && endDate ? `_${startDate}_to_${endDate}` : '');
      const finalFileName = `${baseName}${dateSuffix}.csv`;

      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', finalFileName);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setModalOpen(false);
      showToast(`Exported ${datasetToExport.length} records to ${finalFileName}`);
    } catch (err) {
      console.error('Export failed:', err);
      showToast('Failed to generate export file.');
    } finally {
      setTimeout(() => setExporting(false), 300);
    }
  };

  // Keyboard escape listener
  useEffect(() => {
    if (!modalOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setModalOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [modalOpen]);

  const defaultBtnStyle = {
    padding: '7px 13px',
    fontSize: '0.82rem',
    fontWeight: 600,
    borderRadius: '8px',
    border: variant === 'primary' ? '1px solid var(--primary-color, #4F46E5)' : '1px solid var(--border-color)',
    background: variant === 'primary' ? 'var(--primary-color, #4F46E5)' : 'var(--card-bg)',
    color: variant === 'primary' ? '#FFFFFF' : 'var(--text-primary)',
    cursor: exporting ? 'wait' : 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    transition: 'all 0.15s ease',
    ...style
  };

  return (
    <>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={handleOpenModal}
        disabled={exporting}
        style={defaultBtnStyle}
        title="Filter by date range and export records as CSV"
      >
        {showCalendarIcon ? <Calendar size={13} /> : <Download size={13} />}
        <span>{exporting ? 'Exporting...' : label}</span>
      </button>

      {/* Date Range Export Modal */}
      {modalOpen && (
        <div
          className="modal-overlay"
          onClick={() => setModalOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.45)',
            backdropFilter: 'blur(4px)',
            WebkitBackdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 99999,
            padding: '16px'
          }}
        >
          <div
            className="modal-container"
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: 'var(--card-bg)',
              color: 'var(--text-primary)',
              borderRadius: '16px',
              border: '1px solid var(--border-color)',
              boxShadow: '0 20px 48px rgba(0, 0, 0, 0.22)',
              width: '100%',
              maxWidth: '520px',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            {/* Modal Header */}
            <div
              style={{
                padding: '18px 24px',
                borderBottom: '1px solid var(--border-color)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '10px',
                    background: 'rgba(79, 70, 229, 0.12)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--primary-color, #4F46E5)'
                  }}
                >
                  <Calendar size={18} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.02rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    Export with Date Range
                  </h3>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                    Filter records by date before downloading CSV
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
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
                <X size={15} />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
              {/* Presets Bar */}
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Quick Date Presets
                </label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {[
                    { id: 'all', label: 'All Time' },
                    { id: 'today', label: 'Today' },
                    { id: 'yesterday', label: 'Yesterday' },
                    { id: 'last7', label: 'Last 7 Days' },
                    { id: 'last30', label: 'Last 30 Days' },
                    { id: 'thisMonth', label: 'This Month' },
                    { id: 'lastMonth', label: 'Last Month' },
                    { id: 'custom', label: 'Custom' }
                  ].map((p) => {
                    const isSelected = activePreset === p.id;
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => handleSelectPreset(p.id)}
                        style={{
                          padding: '5px 11px',
                          borderRadius: '8px',
                          fontSize: '0.76rem',
                          fontWeight: isSelected ? 700 : 500,
                          border: isSelected ? '1px solid var(--primary-color, #4F46E5)' : '1px solid var(--border-color)',
                          backgroundColor: isSelected ? 'rgba(79, 70, 229, 0.12)' : 'var(--hover-bg)',
                          color: isSelected ? 'var(--primary-color, #4F46E5)' : 'var(--text-primary)',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        {p.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Start & End Date Inputs */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                    From Date (Inclusive)
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => {
                      setStartDate(e.target.value);
                      setActivePreset('custom');
                    }}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      border: '1px solid var(--border-color)',
                      backgroundColor: 'var(--hover-bg)',
                      color: 'var(--text-primary)',
                      fontSize: '0.84rem',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                    To Date (Inclusive)
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => {
                      setEndDate(e.target.value);
                      setActivePreset('custom');
                    }}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      border: '1px solid var(--border-color)',
                      backgroundColor: 'var(--hover-bg)',
                      color: 'var(--text-primary)',
                      fontSize: '0.84rem',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>

              {/* Target File Name */}
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  Export File Name
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <input
                    type="text"
                    value={customFilename}
                    onChange={(e) => setCustomFilename(e.target.value)}
                    placeholder="export_data"
                    style={{
                      flex: 1,
                      padding: '8px 12px',
                      borderRadius: '8px',
                      border: '1px solid var(--border-color)',
                      backgroundColor: 'var(--hover-bg)',
                      color: 'var(--text-primary)',
                      fontSize: '0.84rem'
                    }}
                  />
                  <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                    .csv
                  </span>
                </div>
              </div>

              {/* Live Preview Box */}
              <div
                style={{
                  padding: '12px 16px',
                  borderRadius: '10px',
                  backgroundColor: 'var(--hover-bg)',
                  border: '1px solid var(--border-color)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '12px'
                }}
              >
                <div>
                  <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {filteredData.length} records ready to export
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                    {startDate || endDate
                      ? `Matching date range: ${startDate || 'Earliest'} to ${endDate || 'Latest'} (out of ${data.length} total)`
                      : `All ${data.length} records in dataset`}
                    {detectedDateKey && ` • Filter field: "${detectedDateKey}"`}
                  </div>
                </div>

                <span
                  style={{
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    padding: '3px 8px',
                    borderRadius: '6px',
                    backgroundColor: filteredData.length > 0 ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)',
                    color: filteredData.length > 0 ? '#10b981' : '#ef4444',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {filteredData.length > 0 ? 'Ready' : '0 Matches'}
                </span>
              </div>
            </div>

            {/* Modal Footer */}
            <div
              style={{
                padding: '14px 24px',
                borderTop: '1px solid var(--border-color)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                backgroundColor: 'var(--card-bg)'
              }}
            >
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setModalOpen(false)}
                style={{
                  padding: '8px 14px',
                  borderRadius: '8px',
                  border: '1px solid var(--border-color)',
                  background: 'transparent',
                  color: 'var(--text-secondary)',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>

              <div style={{ display: 'flex', gap: '8px' }}>
                {(startDate || endDate) && (
                  <button
                    type="button"
                    onClick={() => performExport(data, '_all_records')}
                    style={{
                      padding: '8px 14px',
                      borderRadius: '8px',
                      border: '1px solid var(--border-color)',
                      background: 'var(--hover-bg)',
                      color: 'var(--text-primary)',
                      fontSize: '0.82rem',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                    title="Export all records without date filtering"
                  >
                    Export All ({data.length})
                  </button>
                )}

                <button
                  type="button"
                  className="btn-primary"
                  onClick={() => performExport(filteredData)}
                  disabled={filteredData.length === 0 || exporting}
                  style={{
                    padding: '8px 18px',
                    borderRadius: '8px',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    cursor: filteredData.length === 0 ? 'not-allowed' : 'pointer',
                    opacity: filteredData.length === 0 ? 0.5 : 1
                  }}
                >
                  <Download size={14} />
                  <span>
                    {exporting
                      ? 'Generating...'
                      : `Download CSV (${filteredData.length})`}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Floating Toast Notification */}
      {toast && (
        <div
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            backgroundColor: 'var(--card-bg)',
            border: '1px solid var(--border-color)',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.18)',
            borderRadius: '10px',
            padding: '12px 18px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            zIndex: 999999,
            fontSize: '0.84rem',
            fontWeight: 600,
            color: 'var(--text-primary)'
          }}
        >
          <CheckCircle2 size={16} color="#10B981" />
          <span>{toast}</span>
        </div>
      )}
    </>
  );
}
