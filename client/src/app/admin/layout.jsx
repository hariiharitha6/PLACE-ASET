'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import AdminGuard from '../../components/admin/AdminGuard';
import AdminSidebar from '../../components/admin/AdminSidebar';
import AdminNavbar from '../../components/admin/AdminNavbar';

export default function AdminRootLayout({ children }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Skip sidebar & navbar on the /admin/login page
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  return (
    <AdminGuard>
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#090d16',
        color: '#f8fafc',
        display: 'flex'
      }}>
        <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          minWidth: 0,
          transition: 'padding-left 0.3s ease'
        }} className="admin-main-canvas">
          <AdminNavbar onMenuClick={() => setSidebarOpen(true)} />
          <main style={{
            flex: 1,
            padding: '24px',
            maxWidth: '1600px',
            width: '100%',
            margin: '0 auto'
          }}>
            {children}
          </main>
        </div>
        <style jsx global>{`
          @media (min-width: 1024px) {
            .admin-main-canvas {
              padding-left: 270px !important;
            }
          }
        `}</style>
      </div>
    </AdminGuard>
  );
}
