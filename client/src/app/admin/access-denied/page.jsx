'use client';

import Link from 'next/link';

export default function AccessDeniedPage() {
  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#0b1120',
      color: '#f8fafc',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      textAlign: 'center'
    }}>
      <div style={{
        width: '80px',
        height: '80px',
        borderRadius: '20px',
        backgroundColor: 'rgba(239, 68, 68, 0.15)',
        color: '#f87171',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '36px',
        marginBottom: '20px',
        boxShadow: '0 0 30px rgba(239, 68, 68, 0.3)'
      }}>
        🚫
      </div>

      <h1 style={{ fontSize: '28px', fontWeight: '800', margin: '0 0 8px 0' }}>Access Denied</h1>
      <p style={{ color: '#94a3b8', maxWidth: '450px', fontSize: '14px', margin: '0 0 24px 0', lineHeight: 1.5 }}>
        You do not have administrative permissions to view the PLACE@ASET Admin Portal. This incident has been logged in the security audit system.
      </p>

      <Link href="/dashboard" style={{
        backgroundColor: '#6366f1',
        color: '#ffffff',
        padding: '12px 24px',
        borderRadius: '10px',
        fontWeight: '700',
        fontSize: '14px',
        textDecoration: 'none',
        boxShadow: '0 4px 14px rgba(99, 102, 241, 0.4)'
      }}>
        Return to Student Dashboard
      </Link>
    </div>
  );
}
