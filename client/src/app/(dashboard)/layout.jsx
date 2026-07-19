'use client';

import { useState } from 'react';
import ProtectedRoute from '../../components/ProtectedRoute';
import Sidebar from '../../components/Sidebar';
import Navbar from '../../components/Navbar';

export default function DashboardLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <ProtectedRoute>
      <div style={{
        minHeight: '100vh',
        backgroundColor: 'var(--bg-primary)',
        color: 'var(--text-primary)',
        display: 'flex'
      }}>
        {/* Responsive Navigation Sidebar */}
        <Sidebar 
          isOpen={sidebarOpen} 
          onClose={() => setSidebarOpen(false)} 
        />

        {/* Primary Page Canvas */}
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          minWidth: 0,
          paddingLeft: '0',
          transition: 'padding-left var(--transition-normal)'
        }}
        className="main-layout-content"
        >
          {/* Top Header Bar */}
          <Navbar onMenuClick={() => setSidebarOpen(true)} />

          {/* Page body content wrapper */}
          <main style={{
            flex: 1,
            padding: '32px 24px',
            maxWidth: '1440px',
            width: '100%',
            margin: '0 auto',
            overflowY: 'auto'
          }}>
            {children}
          </main>
        </div>

        {/* Global style inject for sidebar offset */}
        <style jsx global>{`
          @media (min-width: 1024px) {
            .main-layout-content {
              padding-left: 260px !important;
            }
          }
        `}</style>
      </div>
    </ProtectedRoute>
  );
}
