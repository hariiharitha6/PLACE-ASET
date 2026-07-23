'use client';

import HostGuard from '../../components/host/HostGuard';
import HostSidebar from '../../components/host/HostSidebar';

export default function HostRootLayout({ children }) {
  return (
    <HostGuard>
      <div style={{ minHeight: '100vh', backgroundColor: '#090d16', color: '#f8fafc', display: 'flex' }}>
        <HostSidebar />
        <main style={{ flex: 1, padding: '24px 24px 24px 284px', maxWidth: '1600px', width: '100%' }}>
          {children}
        </main>
      </div>
    </HostGuard>
  );
}
