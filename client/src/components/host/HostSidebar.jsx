'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { LayoutDashboard, BookOpen, Trophy, CheckCircle, FileUp, LogOut } from 'lucide-react';

export default function HostSidebar({ isOpen, onClose }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const navItems = [
    { label: 'Host Dashboard', path: '/host/dashboard', icon: LayoutDashboard },
    { label: 'My Questions & PDFs', path: '/admin/questions', icon: BookOpen },
    { label: 'Create Practice Set', path: '/admin/practice', icon: FileUp },
    { label: 'Manage Challenges', path: '/admin/challenges', icon: Trophy },
    { label: 'Assigned Approvals', path: '/admin/approval', icon: CheckCircle, badge: '5' },
  ];

  return (
    <aside style={{
      position: 'fixed',
      top: 0,
      bottom: 0,
      left: 0,
      width: '260px',
      backgroundColor: '#0b1120',
      borderRight: '1px solid rgba(255, 255, 255, 0.08)',
      zIndex: 400,
      display: 'flex',
      flexDirection: 'column',
    }}>
      <div style={{ height: '70px', display: 'flex', alignItems: 'center', padding: '0 20px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
        <span style={{ fontSize: '16px', fontWeight: '800', color: '#38bdf8' }}>
          👨‍🏫 HOST PORTAL
        </span>
      </div>

      <div style={{ padding: '16px 12px', flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.path;
          return (
            <Link
              key={item.path}
              href={item.path}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 14px',
                borderRadius: '8px',
                color: isActive ? '#ffffff' : '#94a3b8',
                backgroundColor: isActive ? 'rgba(56, 189, 248, 0.15)' : 'transparent',
                border: isActive ? '1px solid rgba(56, 189, 248, 0.3)' : '1px solid transparent',
                fontSize: '13px',
                fontWeight: isActive ? '600' : '500',
                textDecoration: 'none',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Icon size={16} />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span style={{ backgroundColor: '#38bdf8', color: '#090d16', fontSize: '10px', fontWeight: '800', padding: '2px 6px', borderRadius: '10px' }}>
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </div>

      <div style={{ padding: '16px', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '6px', backgroundColor: '#38bdf8', color: '#090d16', fontWeight: '800', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px' }}>
            HF
          </div>
          <div>
            <p style={{ color: '#f8fafc', fontSize: '13px', fontWeight: '700', margin: 0 }}>{user?.full_name || 'Faculty Host'}</p>
            <p style={{ color: '#64748b', fontSize: '11px', margin: 0 }}>Host / Faculty</p>
          </div>
        </div>
        <button onClick={logout} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: 'none', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#f87171', fontWeight: '600', fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
          <LogOut size={14} /> Exit Host Portal
        </button>
      </div>
    </aside>
  );
}
