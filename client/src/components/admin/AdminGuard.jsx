'use client';

import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function AdminGuard({ children, requiredRoles = ['super_admin', 'admin', 'host', 'faculty'] }) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push('/admin/login');
      } else if (user && !requiredRoles.includes(user.role)) {
        router.push('/admin/login');
      }
    }
  }, [isLoading, isAuthenticated, user, router, requiredRoles]);

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
          border: '4px solid rgba(255, 255, 255, 0.1)',
          borderLeftColor: '#6366f1',
          borderRadius: '50%',
          width: '44px',
          height: '44px',
          animation: 'adminSpin 0.8s linear infinite'
        }} />
        <span style={{ color: '#94a3b8', fontSize: '14px', letterSpacing: '0.05em', fontWeight: '500' }}>
          Verifying Admin Credentials...
        </span>
        <style>{`
          @keyframes adminSpin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (!isAuthenticated || (user && !requiredRoles.includes(user.role))) {
    return null;
  }

  return children;
}
