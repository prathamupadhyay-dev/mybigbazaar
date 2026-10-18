import React from 'react';

/**
 * Reusable PageToolbar for operational data tables and CMS pages
 * Contains search input, filter dropdowns, sort options, and count summary.
 */
export default function PageToolbar({
  searchValue = '',
  onSearchChange,
  searchPlaceholder = 'Search records...',
  filters = null,
  totalCount = null,
  filteredCount = null,
  children
}) {
  return (
    <div
      className="page-toolbar"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px',
        marginBottom: '16px',
        backgroundColor: '#FBFBFA',
        padding: '10px 14px',
        borderRadius: '12px',
        border: '1px solid #E7E5E4'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: '240px' }}>
        {onSearchChange && (
          <div style={{ position: 'relative', width: '100%', maxWidth: '340px' }}>
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#6F6A65"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{
                position: 'absolute',
                left: '11px',
                top: '50%',
                transform: 'translateY(-50%)',
                pointerEvents: 'none'
              }}
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              value={searchValue}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={searchPlaceholder}
              style={{
                width: '100%',
                padding: '7px 30px 7px 34px',
                borderRadius: '8px',
                border: '1px solid #E7E5E4',
                backgroundColor: '#EEEDE9',
                color: '#1C1917',
                fontSize: '0.84rem',
                outline: 'none',
                transition: 'border-color 150ms ease, box-shadow 150ms ease'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#0B2545';
                e.target.style.boxShadow = '0 0 0 2px rgba(11, 37, 69, 0.15)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#E7E5E4';
                e.target.style.boxShadow = 'none';
              }}
            />
            {searchValue && (
              <button
                type="button"
                onClick={() => onSearchChange('')}
                style={{
                  position: 'absolute',
                  right: '9px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: '#6F6A65',
                  cursor: 'pointer',
                  fontSize: '0.75rem',
                  padding: '2px 4px'
                }}
              >
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            )}
          </div>
        )}

        {filters}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        {totalCount !== null && (
          <span className="tabular-nums" style={{ fontSize: '0.78rem', color: '#6F6A65', fontWeight: 500 }}>
            {filteredCount !== null && filteredCount !== totalCount
              ? `Showing ${filteredCount} of ${totalCount}`
              : `${totalCount} records`}
          </span>
        )}
        {children}
      </div>
    </div>
  );
}
