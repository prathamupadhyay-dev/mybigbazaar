// ============================================================
// MyBigBazaar Admin — Enterprise Command Center DataTable
// 48px Dense Rows, Sunken Headers, Hairline Borders, Full Theme Tokens
// ============================================================

import React, { useState, useMemo } from 'react';
import EmptyState from './EmptyState';

export default function DataTable({
  columns = [],
  data = [],
  keyField = 'id',
  isLoading = false,
  emptyMessage = 'No records found',
  emptyDescription = 'There are no items matching the current filter.',
  pagination = true,
  pageSize = 10,
  rowActions = null,
  onRowClick = null,
  selectedIds = [],
  onSelectionChange = null
}) {
  const [sortKey, setSortKey] = useState(null);
  const [sortOrder, setSortOrder] = useState('asc'); // 'asc' | 'desc'
  const [currentPage, setCurrentPage] = useState(1);

  // Sorting
  const sortedData = useMemo(() => {
    if (!sortKey) return data;
    return [...data].sort((a, b) => {
      const valA = a[sortKey];
      const valB = b[sortKey];
      if (valA === valB) return 0;
      if (valA === null || valA === undefined) return 1;
      if (valB === null || valB === undefined) return -1;
      const compare = valA > valB ? 1 : -1;
      return sortOrder === 'asc' ? compare : -compare;
    });
  }, [data, sortKey, sortOrder]);

  // Pagination
  const totalPages = Math.ceil(sortedData.length / pageSize) || 1;
  const paginatedData = useMemo(() => {
    if (!pagination) return sortedData;
    const start = (currentPage - 1) * pageSize;
    return sortedData.slice(start, start + pageSize);
  }, [sortedData, pagination, currentPage, pageSize]);

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortOrder('asc');
    }
  };

  const handleSelectAll = (e) => {
    if (!onSelectionChange) return;
    if (e.target.checked) {
      onSelectionChange(paginatedData.map((row) => row[keyField]));
    } else {
      onSelectionChange([]);
    }
  };

  const handleSelectRow = (id, e) => {
    e.stopPropagation();
    if (!onSelectionChange) return;
    if (selectedIds.includes(id)) {
      onSelectionChange(selectedIds.filter((item) => item !== id));
    } else {
      onSelectionChange([...selectedIds, id]);
    }
  };

  return (
    <div
      className="p-table-card cc-card"
      style={{
        backgroundColor: 'var(--color-panel, #FBFBFA)',
        borderRadius: '12px',
        border: '1px solid var(--color-border, #E7E5E4)',
        boxShadow: '0 1px 2px 0 rgba(28, 25, 23, 0.04)',
        overflow: 'hidden'
      }}
    >
      <div style={{ overflowX: 'auto', width: '100%' }}>
        <table
          className="admin-table"
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            textAlign: 'left'
          }}
        >
          <thead>
            <tr style={{ height: '48px', backgroundColor: 'var(--color-sunken, #EEEDE9)', borderBottom: '1px solid var(--color-border, #E7E5E4)' }}>
              {onSelectionChange && (
                <th style={{ width: '40px', padding: '0 16px', verticalAlign: 'middle' }}>
                  <input
                    type="checkbox"
                    checked={paginatedData.length > 0 && paginatedData.every((r) => selectedIds.includes(r[keyField]))}
                    onChange={handleSelectAll}
                    style={{ accentColor: 'var(--accent-color, #C2410C)', cursor: 'pointer' }}
                  />
                </th>
              )}
              {columns.map((col) => (
                <th
                  key={col.key || col.header}
                  onClick={() => col.sortable && handleSort(col.key)}
                  style={{
                    padding: '0 16px',
                    fontSize: '11px',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    color: 'var(--color-text-metadata, #6F6A65)',
                    cursor: col.sortable ? 'pointer' : 'default',
                    whiteSpace: 'nowrap',
                    width: col.width || 'auto',
                    textAlign: col.align || 'left',
                    userSelect: 'none',
                    verticalAlign: 'middle'
                  }}
                >
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    <span>{col.header}</span>
                    {col.sortable && sortKey === col.key && (
                      <span style={{ fontSize: '10px', color: 'var(--accent-color, #C2410C)' }}>
                        {sortOrder === 'asc' ? '▲' : '▼'}
                      </span>
                    )}
                  </div>
                </th>
              ))}
              {rowActions && (
                <th
                  style={{
                    padding: '0 16px',
                    fontSize: '11px',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    color: 'var(--color-text-metadata, #6F6A65)',
                    textAlign: 'right',
                    width: '120px',
                    verticalAlign: 'middle'
                  }}
                >
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              // Loading Skeleton in sunken stone
              Array.from({ length: pageSize }).map((_, rIdx) => (
                <tr key={rIdx} style={{ height: '48px', borderBottom: '1px solid var(--color-border, #E7E5E4)' }}>
                  {onSelectionChange && (
                    <td style={{ padding: '0 16px' }}>
                      <div style={{ width: '16px', height: '16px', borderRadius: '4px', backgroundColor: 'var(--color-sunken, #EEEDE9)' }} />
                    </td>
                  )}
                  {columns.map((col, cIdx) => (
                    <td key={cIdx} style={{ padding: '0 16px' }}>
                      <div
                        style={{
                          height: '14px',
                          width: `${Math.max(40, (cIdx * 23 + 55) % 85)}%`,
                          borderRadius: '4px',
                          backgroundColor: 'var(--color-sunken, #EEEDE9)'
                        }}
                      />
                    </td>
                  ))}
                  {rowActions && (
                    <td style={{ padding: '0 16px', textAlign: 'right' }}>
                      <div style={{ height: '14px', width: '50px', marginLeft: 'auto', borderRadius: '4px', backgroundColor: 'var(--color-sunken, #EEEDE9)' }} />
                    </td>
                  )}
                </tr>
              ))
            ) : paginatedData.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + (onSelectionChange ? 1 : 0) + (rowActions ? 1 : 0)}
                  style={{ padding: '40px 16px', textAlign: 'center' }}
                >
                  <EmptyState title={emptyMessage} description={emptyDescription} style={{ border: 'none', backgroundColor: 'transparent', padding: '16px' }} />
                </td>
              </tr>
            ) : (
              paginatedData.map((row) => {
                const isSelected = selectedIds.includes(row[keyField]);
                return (
                  <tr
                    key={row[keyField]}
                    onClick={() => onRowClick && onRowClick(row)}
                    style={{
                      height: '48px',
                      borderBottom: '1px solid var(--color-border, #E7E5E4)',
                      backgroundColor: isSelected ? 'var(--color-sunken, #EEEDE9)' : 'var(--color-panel, #FBFBFA)',
                      cursor: onRowClick ? 'pointer' : 'default',
                      transition: 'background-color 120ms ease'
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected) e.currentTarget.style.backgroundColor = 'var(--color-sunken, #EEEDE9)';
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected) e.currentTarget.style.backgroundColor = 'var(--color-panel, #FBFBFA)';
                    }}
                  >
                    {onSelectionChange && (
                      <td style={{ width: '40px', padding: '0 16px', verticalAlign: 'middle' }}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => handleSelectRow(row[keyField], e)}
                          style={{ accentColor: 'var(--accent-color, #C2410C)', cursor: 'pointer' }}
                        />
                      </td>
                    )}
                    {columns.map((col) => {
                      const val = row[col.key];
                      return (
                        <td
                          key={col.key || col.header}
                          style={{
                            padding: '0 16px',
                            textAlign: col.align || 'left',
                            color: 'var(--color-text-primary, #1C1917)',
                            fontSize: '13px',
                            verticalAlign: 'middle'
                          }}
                          className={col.tabular ? 'tabular-nums' : ''}
                        >
                          {col.render ? col.render(val, row) : val !== undefined && val !== null ? String(val) : '—'}
                        </td>
                      );
                    })}
                    {rowActions && (
                      <td style={{ padding: '0 16px', textAlign: 'right', verticalAlign: 'middle' }}>
                        {rowActions(row)}
                      </td>
                    )}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Bar */}
      {pagination && !isLoading && sortedData.length > 0 && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px 16px',
            borderTop: '1px solid var(--color-border, #E7E5E4)',
            backgroundColor: 'var(--color-panel, #FBFBFA)',
            fontSize: '12px',
            color: 'var(--color-text-secondary, #57534E)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>Showing</span>
            <span style={{ fontWeight: 600, color: 'var(--color-text-primary, #1C1917)' }} className="tabular-nums">
              {Math.min((currentPage - 1) * pageSize + 1, sortedData.length)}
            </span>
            <span>to</span>
            <span style={{ fontWeight: 600, color: 'var(--color-text-primary, #1C1917)' }} className="tabular-nums">
              {Math.min(currentPage * pageSize, sortedData.length)}
            </span>
            <span>of</span>
            <span style={{ fontWeight: 600, color: 'var(--color-text-primary, #1C1917)' }} className="tabular-nums">
              {sortedData.length} records
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <button
              type="button"
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              style={{
                height: '30px',
                padding: '0 12px',
                borderRadius: '6px',
                border: '1px solid var(--color-border, #E7E5E4)',
                backgroundColor: 'var(--color-panel, #FBFBFA)',
                color: currentPage <= 1 ? 'var(--color-text-metadata, #6F6A65)' : 'var(--color-text-primary, #1C1917)',
                fontSize: '12px',
                fontWeight: 500,
                cursor: currentPage <= 1 ? 'not-allowed' : 'pointer',
                transition: 'background-color 120ms ease'
              }}
              onMouseEnter={(e) => {
                if (currentPage > 1) e.currentTarget.style.backgroundColor = 'var(--color-sunken, #EEEDE9)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--color-panel, #FBFBFA)';
              }}
            >
              Previous
            </button>
            <span style={{ padding: '0 8px', fontWeight: 600, color: 'var(--color-text-primary, #1C1917)' }} className="tabular-nums">
              {currentPage} / {totalPages}
            </span>
            <button
              type="button"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              style={{
                height: '30px',
                padding: '0 12px',
                borderRadius: '6px',
                border: '1px solid var(--color-border, #E7E5E4)',
                backgroundColor: 'var(--color-panel, #FBFBFA)',
                color: currentPage >= totalPages ? 'var(--color-text-metadata, #6F6A65)' : 'var(--color-text-primary, #1C1917)',
                fontSize: '12px',
                fontWeight: 500,
                cursor: currentPage >= totalPages ? 'not-allowed' : 'pointer',
                transition: 'background-color 120ms ease'
              }}
              onMouseEnter={(e) => {
                if (currentPage < totalPages) e.currentTarget.style.backgroundColor = 'var(--color-sunken, #EEEDE9)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--color-panel, #FBFBFA)';
              }}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
