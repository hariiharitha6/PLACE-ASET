'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';

export default function HostGuard({ children }) {
  const { user, loading, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        router.replace('/admin/login');
      } else {
        const allowedRoles = ['host', 'faculty', 'college_admin', 'super_admin'];
        if (!user || !allowedRoles.includes(user.role)) {
          router.replace('/admin/access-denied');
        }
      }
    }
  }, [isAuthenticated, user, loading, router]);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#090d16', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#818cf8' }}>
        <span>Authenticating Host Access...</span>
      </div>
    );
  }

  const allowedRoles = ['host', 'faculty', 'college_admin', 'super_admin'];
  if (!isAuthenticated || !user || !allowedRoles.includes(user.role)) {
    return null;
  }

  return <>{children}</>;
}
