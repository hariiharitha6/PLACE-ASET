'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  BookOpen, 
  Trophy, 
  Library, 
  Users, 
  Award, 
  LogOut,
  X,
  Brain,
  Target,
  FileText,
  Mic,
  Bot,
  Calendar,
  UserCheck
} from 'lucide-react';
import { APP_NAME } from '../lib/constants';

export default function Sidebar({ isOpen, onClose }) {
  const pathname = usePathname();
  const { logout, user } = useAuth();

  const navItems = [
    { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Question Bank', href: '/questions', icon: BookOpen },
    { label: 'Practice Arena', href: '/practice', icon: BookOpen },
    { label: 'Challenges', href: '/challenges', icon: Trophy },
    { label: 'AI Personal Mentor', href: '/mentor', icon: Bot },
    { label: 'Personal Studio', href: '/personal', icon: UserCheck },
    { label: 'Resource Library', href: '/resources', icon: Library },
    { label: 'Community', href: '/community', icon: Users },
    { label: 'Calendar & Deadlines', href: '/calendar', icon: Calendar },
    { label: '🎯 Placement Readiness', href: '/dashboard/readiness', icon: Target },
    { label: 'AI Analytics', href: '/ai', icon: Brain },
    { label: 'Digital Credentials', href: '/certificates', icon: Award },
    { label: 'Achievements & Badges', href: '/achievements', icon: Award },
    { label: 'Interview Simulator', href: '/interview-prep', icon: Mic },
    { label: 'AI Resume Builder', href: '/resume', icon: FileText },
  ];

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          onClick={onClose}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.4)',
            backdropFilter: 'blur(4px)',
            zIndex: 390,
            display: 'block'
          }}
          className="lg:hidden"
        />
      )}

      {/* Sidebar container */}
      <aside style={{
        position: 'fixed',
        top: 0,
        bottom: 0,
        left: 0,
        width: '260px',
        backgroundColor: 'var(--bg-secondary)',
        borderRight: '1px solid var(--border-color)',
        zIndex: 400,
        display: 'flex',
        flexDirection: 'column',
        transform: isOpen ? 'translateX(0)' : 'translateX(-100%)',
        transition: 'transform var(--transition-normal)',
      }}
      className="sidebar-component"
      >
        {/* Header */}
        <div style={{
          height: '70px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '0 24px',
          borderBottom: '1px solid var(--border-color)'
        }}>
          <Link href="/" style={{
            fontSize: '18px',
            fontWeight: '800',
            letterSpacing: '-0.02em',
            background: 'var(--gradient-primary)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            textDecoration: 'none'
          }}>
            🎓 {APP_NAME}
          </Link>
          <button 
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '4px'
            }}
            className="lg:hidden"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation Items */}
        <nav style={{
          flex: 1,
          padding: '16px 12px',
          display: 'flex',
          flexDirection: 'column',
          gap: '4px',
          overflowY: 'auto'
        }}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (pathname.startsWith(item.href + '/') && item.href !== '/dashboard');

            return (
              <Link 
                key={item.href} 
                href={item.href}
                onClick={() => {
                  if (window.innerWidth < 1024) onClose();
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-md)',
                  color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                  backgroundColor: isActive ? 'var(--bg-glass-hover)' : 'transparent',
                  border: isActive ? '1px solid var(--border-accent)' : '1px solid transparent',
                  fontWeight: isActive ? '600' : '500',
                  fontSize: '13px',
                  textDecoration: 'none',
                  transition: 'all var(--transition-fast)'
                }}
                onMouseOver={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = 'var(--bg-glass)';
                    e.currentTarget.style.color = 'var(--text-primary)';
                  }
                }}
                onMouseOut={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = 'var(--text-secondary)';
                  }
                }}
              >
                <Icon size={16} style={{ color: isActive ? 'var(--accent-primary)' : 'inherit', flexShrink: 0 }} />
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer Candidate Info */}
        <div style={{
          padding: '16px',
          borderTop: '1px solid var(--border-color)',
          backgroundColor: 'rgba(0, 0, 0, 0.05)',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: 'var(--radius-full)',
              background: 'var(--gradient-primary)',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              fontWeight: '700',
              color: '#fff',
              fontSize: '13px'
            }}>
              {user?.full_name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{
                fontSize: '13px',
                fontWeight: '600',
                color: 'var(--text-primary)',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                margin: 0,
                lineHeight: '1.2'
              }}>
                {user?.full_name || 'Candidate'}
              </p>
              <p style={{
                fontSize: '11px',
                color: 'var(--text-muted)',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                margin: 0,
                textTransform: 'capitalize'
              }}>
                {user?.role || 'Student'}
              </p>
            </div>
          </div>

          <button 
            onClick={logout}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '8px 12px',
              width: '100%',
              borderRadius: 'var(--radius-md)',
              border: '1px solid transparent',
              backgroundColor: 'rgba(248, 113, 113, 0.05)',
              color: 'var(--accent-danger)',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: '600',
              transition: 'all var(--transition-fast)'
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(248, 113, 113, 0.1)'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'rgba(248, 113, 113, 0.05)'}
          >
            <LogOut size={15} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Global CSS Inject for sidebar layout sizing */}
      <style jsx global>{`
        @media (min-width: 1024px) {
          .sidebar-component {
            transform: translateX(0) !important;
          }
          .lg\\:hidden {
            display: none !important;
          }
        }
      `}</style>
    </>
  );
}
