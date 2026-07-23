'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, getDashboardPath } from '../../context/AuthContext';

export default function HostIndexPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.replace('/admin/login');
      } else if (user?.role === 'host' || user?.role === 'faculty' || user?.role === 'college_admin' || user?.role === 'super_admin') {
        router.replace('/host/dashboard');
      } else {
        router.replace(getDashboardPath(user?.role));
      }
    }
  }, [user, isAuthenticated, isLoading, router]);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#090d16', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#38bdf8' }}>
      <span>Redirecting to Host Portal...</span>
    </div>
  );
}
