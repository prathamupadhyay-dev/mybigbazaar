import React from 'react';

/**
 * Clean Administrative Footer
 */
export default function Footer() {
  const currentYear = new Date().getFullYear();
  return (
    <footer
      style={{
        padding: '10px 24px',
        fontSize: '11px',
        color: 'var(--color-text-metadata, #6F6A65)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '8px',
        borderTop: '1px solid var(--color-border, #E7E5E4)',
        backgroundColor: 'var(--color-panel, #FBFBFA)',
        userSelect: 'none'
      }}
    >
      <div>
        <span>MyBigBazaar &copy; {currentYear}</span>
      </div>
    </footer>
  );
}
