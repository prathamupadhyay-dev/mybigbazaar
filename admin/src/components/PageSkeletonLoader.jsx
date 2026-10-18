// ============================================================
// Page Skeleton Loader Component
// ============================================================
// High-performance placeholder rendered during lazy module transitions.
// ============================================================

import React from 'react'

function PageSkeletonLoader() {
  return (
    <div className="page-skeleton-loader">
      {/* Top Header Placeholder */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <div className="skeleton-box" style={{ width: '220px', height: '32px' }} />
        <div className="skeleton-box" style={{ width: '120px', height: '36px' }} />
      </div>

      {/* Filter / Search Bar Placeholder */}
      <div className="skeleton-box" style={{ width: '100%', height: '48px', borderRadius: '10px' }} />

      {/* Main Table / Grid Placeholder */}
      <div className="skeleton-box" style={{ width: '100%', height: '360px', borderRadius: '12px' }} />
    </div>
  )
}

export default PageSkeletonLoader
