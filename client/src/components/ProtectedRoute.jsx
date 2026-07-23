'use client';

import { useAuth, getDashboardPath } from '../context/AuthContext';
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

  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        backgroundColor: '#090d16',
        color: '#f8fafc',
        gap: '16px'
      }}>
        <div style={{
          border: '4px solid rgba(255, 255, 255, 0.05)',
          borderLeftColor: '#6366f1',
          borderRadius: '50%',
          width: '40px',
          height: '40px',
          animation: 'spin 1s linear infinite'
        }} />
        <span style={{ color: '#94a3b8', fontSize: '14px', letterSpacing: '0.05em' }}>
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

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        backgroundColor: '#090d16',
        color: '#f8fafc',
        padding: '24px',
        textAlign: 'center'
      }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>
          🛡️
        </div>
        <h1 style={{ 
          fontSize: '24px',
          fontWeight: '700',
          color: '#f87171', 
          marginBottom: '12px' 
        }}>
          Restricted Access
        </h1>
        <p style={{ 
          color: '#94a3b8', 
          maxWidth: '400px',
          marginBottom: '32px',
          fontSize: '15px'
        }}>
          Your current account role <strong>({user?.role?.toUpperCase() || 'STUDENT'})</strong> does not have permission to view this section.
        </p>
        <button
          onClick={() => router.push(getDashboardPath(user?.role))}
          style={{
            background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
            color: '#fff',
            border: 'none',
            padding: '12px 28px',
            borderRadius: '10px',
            cursor: 'pointer',
            fontWeight: '600',
          }}
        >
          Return to Authorized Dashboard
        </button>
      </div>
    );
  }

  return children;
}
