'use client';

import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useNotifications } from '../context/NotificationContext';
import { usePathname, useRouter } from 'next/navigation';
import UserMenu from './UserMenu';
import { 
  Menu, 
  Search, 
  Sun, 
  Moon, 
  Bell, 
  ChevronRight
} from 'lucide-react';

export default function Navbar({ onMenuClick }) {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  
  const [showNotifications, setShowNotifications] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const generateBreadcrumbs = () => {
    const paths = pathname.split('/').filter(p => p);
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', color: 'var(--text-secondary)' }}>
        <span 
          style={{ cursor: 'pointer' }} 
          onClick={() => router.push('/dashboard')}
        >
          Portal
        </span>
        {paths.map((p, idx) => {
          const pathUrl = '/' + paths.slice(0, idx + 1).join('/');
          const isLast = idx === paths.length - 1;
          const label = p.replace(/-/g, ' ');

          return (
            <div key={pathUrl} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <ChevronRight size={14} style={{ color: 'var(--text-muted)' }} />
              <span 
                style={{ 
                  textTransform: 'capitalize', 
                  fontWeight: isLast ? '600' : 'normal',
                  color: isLast ? 'var(--text-primary)' : 'inherit',
                  cursor: isLast ? 'default' : 'pointer'
                }}
                onClick={() => !isLast && router.push(pathUrl)}
              >
                {label}
              </span>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <header style={{
      height: '70px',
      backgroundColor: 'var(--bg-secondary)',
      borderBottom: '1px solid var(--border-color)',
      padding: '0 24px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      position: 'sticky',
      top: 0,
      zIndex: 380,
      backdropFilter: 'blur(8px)',
      background: 'rgba(var(--bg-secondary), 0.8)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <button 
          onClick={onMenuClick}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--text-primary)',
            cursor: 'pointer',
            padding: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 'var(--radius-sm)'
          }}
          className="lg:hidden"
        >
          <Menu size={20} />
        </button>
        <div className="hidden-mobile">
          {generateBreadcrumbs()}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        
        <div className="hidden-mobile" style={{ position: 'relative' }}>
          <Search size={16} style={{
            position: 'absolute',
            left: '12px',
            top: '50%',
            transform: 'translateY(-50%)',
            color: 'var(--text-muted)'
          }} />
          <input 
            type="text" 
            placeholder="Search Arena..." 
            style={{
              padding: '8px 12px 8px 36px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-color)',
              backgroundColor: 'rgba(255, 255, 255, 0.03)',
              color: 'var(--text-primary)',
              fontSize: '14px',
              width: '200px',
              outline: 'none',
              transition: 'all var(--transition-fast)'
            }}
            onFocus={(e) => {
              e.currentTarget.style.width = '240px';
              e.currentTarget.style.borderColor = 'var(--accent-primary)';
            }}
            onBlur={(e) => {
              e.currentTarget.style.width = '200px';
              e.currentTarget.style.borderColor = 'var(--border-color)';
            }}
          />
        </div>

        <button 
          onClick={toggleTheme}
          style={{
            background: 'var(--bg-glass)',
            border: '1px solid var(--border-color)',
            color: 'var(--text-primary)',
            borderRadius: 'var(--radius-md)',
            width: '38px',
            height: '38px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'background var(--transition-fast)'
          }}
          onMouseOver={(e) => e.currentTarget.style.background = 'var(--bg-glass-hover)'}
          onMouseOut={(e) => e.currentTarget.style.background = 'var(--bg-glass)'}
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        <div style={{ position: 'relative' }}>
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            style={{
              background: 'var(--bg-glass)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-primary)',
              borderRadius: 'var(--radius-md)',
              width: '38px',
              height: '38px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              position: 'relative'
            }}
            onMouseOver={(e) => e.currentTarget.style.background = 'var(--bg-glass-hover)'}
            onMouseOut={(e) => e.currentTarget.style.background = 'var(--bg-glass)'}
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span style={{
                position: 'absolute',
                top: '-2px',
                right: '-2px',
                backgroundColor: 'var(--accent-danger)',
                color: '#fff',
                borderRadius: '50%',
                fontSize: '10px',
                fontWeight: '700',
                padding: '1px 5px',
                lineHeight: 'normal'
              }}>
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div style={{
              position: 'absolute',
              top: '48px',
              right: 0,
              width: '320px',
              backgroundColor: 'var(--bg-secondary)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-md)',
              boxShadow: 'var(--shadow-lg)',
              padding: '16px',
              zIndex: 500
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '12px',
                borderBottom: '1px solid var(--border-color)',
                paddingBottom: '8px'
              }}>
                <span style={{ fontWeight: '600', fontSize: '14px' }}>Notifications</span>
                {unreadCount > 0 && (
                  <button 
                    onClick={markAllAsRead}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--accent-primary)',
                      fontSize: '12px',
                      fontWeight: '500',
                      cursor: 'pointer'
                    }}
                  >
                    Mark all read
                  </button>
                )}
              </div>
              <div style={{
                maxHeight: '240px',
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
              }}>
                {notifications.length === 0 ? (
                  <p style={{ textAlign: 'center', padding: '16px 0', fontSize: '13px', color: 'var(--text-muted)' }}>
                    No notifications yet.
                  </p>
                ) : (
                  notifications.map((n) => (
                    <div 
                      key={n.id}
                      onClick={() => !n.is_read && markAsRead(n.id)}
                      style={{
                        padding: '10px',
                        borderRadius: 'var(--radius-sm)',
                        backgroundColor: n.is_read ? 'transparent' : 'rgba(129, 140, 248, 0.05)',
                        border: '1px solid',
                        borderColor: n.is_read ? 'transparent' : 'rgba(129, 140, 248, 0.1)',
                        cursor: n.is_read ? 'default' : 'pointer',
                        fontSize: '12px',
                        transition: 'background var(--transition-fast)'
                      }}
                    >
                      <p style={{ fontWeight: n.is_read ? '500' : '700', color: 'var(--text-primary)', marginBottom: '4px' }}>
                        {n.title}
                      </p>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '11px', lineHeight: '1.4' }}>
                        {n.message}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Menu with Role Badge */}
        <UserMenu />

      </div>

      <style jsx>{`
        @media (max-width: 1024px) {
          .hidden-mobile {
            display: none !important;
          }
        }
      `}</style>
    </header>
  );
}
