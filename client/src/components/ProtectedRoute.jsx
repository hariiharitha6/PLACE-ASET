'use client';

import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

/**
 * Route protection wrapper to guard pages based on authentication state and user roles.
 */
export default function ProtectedRoute({ children, allowedRoles }) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isLoading, isAuthenticated, router]);

  // Visual feedback loader during auth checks
  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        backgroundColor: 'var(--bg-primary)',
        color: 'var(--text-primary)',
        gap: '16px'
      }}>
        <div style={{
          border: '4px solid rgba(255, 255, 255, 0.05)',
          borderLeftColor: 'var(--accent-primary)',
          borderRadius: '50%',
          width: '40px',
          height: '40px',
          animation: 'spin 1s linear infinite'
        }} />
        <span style={{ color: 'var(--text-secondary)', fontSize: '14px', letterSpacing: '0.05em' }}>
          Verifying Identity...
        </span>
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  // Role validation
  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        backgroundColor: 'var(--bg-primary)',
        color: 'var(--text-primary)',
        padding: '24px',
        textAlign: 'center'
      }}>
        <div style={{
          fontSize: '48px',
          marginBottom: '16px'
        }}>
          🛡️
        </div>
        <h1 style={{ 
          fontSize: '24px',
          fontWeight: '700',
          color: 'var(--accent-danger)', 
          marginBottom: '12px' 
        }}>
          Restricted Access
        </h1>
        <p style={{ 
          color: 'var(--text-secondary)', 
          maxWidth: '400px',
          marginBottom: '32px',
          fontSize: '15px'
        }}>
          Your current account role <strong>({user?.role})</strong> does not have permission to view this section.
        </p>
        <button
          onClick={() => router.push('/')}
          style={{
            background: 'var(--gradient-primary)',
            color: '#fff',
            border: 'none',
            padding: '12px 28px',
            borderRadius: 'var(--radius-md)',
            cursor: 'pointer',
            fontWeight: '600',
            boxShadow: 'var(--shadow-glow)',
            transition: 'opacity var(--transition-fast)'
          }}
          onMouseOver={(e) => e.currentTarget.style.opacity = '0.9'}
          onMouseOut={(e) => e.currentTarget.style.opacity = '1'}
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  return children;
}
