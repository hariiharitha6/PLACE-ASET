'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, getDashboardPath } from '../../context/AuthContext';

export default function AdminIndexPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.replace('/admin/login');
      } else if (user?.role === 'super_admin' || user?.role === 'college_admin') {
        router.replace('/admin/dashboard');
      } else {
        router.replace(getDashboardPath(user?.role));
      }
    }
  }, [user, isAuthenticated, isLoading, router]);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#090d16', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#818cf8' }}>
      <span>Redirecting to Admin Portal...</span>
    </div>
  );
}
