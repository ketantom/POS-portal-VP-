'use client';

import React from 'react';
import Image from 'next/image';

interface NavbarProps {
  userEmail?: string;
  onMenuToggle: () => void;
  userName?: string;
}

export default function Navbar({ userEmail, onMenuToggle, userName }: NavbarProps) {
  const displayName = userName || userEmail?.split('@')[0] || 'User';

  return (
    <nav style={styles.navbar}>
      <div style={styles.left}>
        <div style={styles.logoWrapper}>
          <Image
            src="/logo.png"
            alt="Vijaya Products"
            width={40}
            height={40}
            style={styles.logoImage}
            priority
          />
        </div>
        <div style={styles.brand}>
          <span style={styles.brandName}>Vijaya Products</span>
          <span style={styles.brandTag}>POS System</span>
        </div>
      </div>

      <div style={styles.right}>
        <div style={styles.userInfo}>
          <div style={styles.avatar}>
            {displayName.charAt(0).toUpperCase()}
          </div>
          <div style={styles.userText}>
            <span style={styles.greeting}>Hello, {displayName}</span>
            {userEmail && (
              <span style={styles.email}>{userEmail}</span>
            )}
          </div>
        </div>

        <button
          onClick={onMenuToggle}
          style={styles.menuButton}
          aria-label="Toggle menu"
          title="Settings"
        >
          <span style={styles.hamburger}>☰</span>
        </button>
      </div>
    </nav>
  );
}

const styles: Record<string, React.CSSProperties> = {
  navbar: {
    position: 'sticky',
    top: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: '64px',
    padding: '0 24px',
    background: '#FFFFFF',
    borderBottom: '1px solid #E5E7EB',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
    zIndex: 150,
    flexShrink: 0,
  },
  left: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
  },
  logoWrapper: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'transform 0.2s ease',
    cursor: 'pointer',
  },
  logoImage: {
    width: '40px',
    height: '40px',
    objectFit: 'contain',
    borderRadius: '8px',
    transition: 'transform 0.2s ease',
  },
  brand: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1px',
  },
  brandName: {
    fontSize: '16px',
    fontWeight: 700,
    color: '#1F2937',
    letterSpacing: '-0.01em',
    lineHeight: 1.2,
  },
  brandTag: {
    fontSize: '11px',
    fontWeight: 500,
    color: '#9CA3AF',
    letterSpacing: '0.03em',
    textTransform: 'uppercase' as const,
  },
  right: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  userInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  avatar: {
    width: '34px',
    height: '34px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #DC2626 0%, #B91C1C 100%)',
    color: '#FFFFFF',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '14px',
    fontWeight: 700,
    flexShrink: 0,
  },
  userText: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1px',
  },
  greeting: {
    fontSize: '13px',
    fontWeight: 600,
    color: '#1F2937',
    lineHeight: 1.2,
  },
  email: {
    fontSize: '11px',
    color: '#9CA3AF',
    lineHeight: 1.2,
  },
  menuButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '40px',
    height: '40px',
    border: '1px solid #E5E7EB',
    borderRadius: '10px',
    background: '#FFFFFF',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    flexShrink: 0,
  },
  hamburger: {
    fontSize: '20px',
    color: '#6B7280',
    lineHeight: 1,
  },
};
