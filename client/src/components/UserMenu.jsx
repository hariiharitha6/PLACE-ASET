'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';

export default function UserMenu() {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!user) return null;

  const role = user.role || 'student';

  const getRoleBadgeInfo = (roleStr) => {
    switch (roleStr) {
      case 'super_admin':
        return { label: 'Super Admin', bg: 'rgba(168, 85, 247, 0.15)', color: '#c084fc', border: 'rgba(168, 85, 247, 0.3)' };
      case 'college_admin':
        return { label: 'College Admin', bg: 'rgba(99, 102, 241, 0.15)', color: '#818cf8', border: 'rgba(99, 102, 241, 0.3)' };
      case 'host':
      case 'faculty':
        return { label: 'Host', bg: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', border: 'rgba(56, 189, 248, 0.3)' };
      case 'student':
      default:
        return { label: 'Student', bg: 'rgba(16, 185, 129, 0.15)', color: '#34d399', border: 'rgba(16, 185, 129, 0.3)' };
    }
  };

  const badge = getRoleBadgeInfo(role);

  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <div style={{ position: 'relative' }} ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          background: 'none',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          padding: '4px 10px 4px 6px',
          borderRadius: '20px',
          cursor: 'pointer',
          color: '#f8fafc',
          backgroundColor: 'rgba(255, 255, 255, 0.03)',
        }}
      >
        {user.avatar_url ? (
          <img
            src={user.avatar_url}
            alt={user.full_name || 'User Avatar'}
            style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }}
          />
        ) : (
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
              color: '#ffffff',
              fontWeight: '700',
              fontSize: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {getInitials(user.full_name || user.fullName)}
          </div>
        )}

        <div style={{ textAlign: 'left', display: 'none', flexDirection: 'column' }} className="md:flex">
          <span style={{ fontSize: '13px', fontWeight: '600', color: '#f8fafc', lineHeight: 1.2 }}>
            {user.full_name || user.fullName || 'User'}
          </span>
          <span
            style={{
              fontSize: '10px',
              fontWeight: '700',
              color: badge.color,
              lineHeight: 1.2,
            }}
          >
            {badge.label}
          </span>
        </div>

        <span style={{ fontSize: '10px', color: '#94a3b8' }}>▼</span>
      </button>

      {isOpen && (
        <div
          style={{
            position: 'absolute',
            right: 0,
            top: 'calc(100% + 8px)',
            width: '240px',
            backgroundColor: '#0b1120',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '12px',
            padding: '16px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.5)',
            zIndex: 1000,
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', paddingBottom: '12px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
            {user.avatar_url ? (
              <img
                src={user.avatar_url}
                alt={user.full_name || 'User Avatar'}
                style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }}
              />
            ) : (
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
                  color: '#ffffff',
                  fontWeight: '800',
                  fontSize: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {getInitials(user.full_name || user.fullName)}
              </div>
            )}
            <div style={{ minWidth: 0, flex: 1 }}>
              <p style={{ fontSize: '14px', fontWeight: '700', color: '#f8fafc', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user.full_name || user.fullName || 'User'}
              </p>
              <p style={{ fontSize: '11px', color: '#94a3b8', margin: '2px 0 6px 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user.email}
              </p>
              <span
                style={{
                  backgroundColor: badge.bg,
                  color: badge.color,
                  border: `1px solid ${badge.border}`,
                  fontSize: '10px',
                  fontWeight: '800',
                  padding: '2px 8px',
                  borderRadius: '10px',
                  display: 'inline-block',
                  textTransform: 'uppercase',
                }}
              >
                {badge.label}
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <Link
              href={role === 'student' ? '/dashboard' : role === 'host' ? '/host/dashboard' : '/admin/dashboard'}
              onClick={() => setIsOpen(false)}
              style={{
                padding: '8px 10px',
                borderRadius: '6px',
                color: '#cbd5e1',
                textDecoration: 'none',
                fontSize: '13px',
                fontWeight: '500',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <span>📊</span> Dashboard
            </Link>

            <Link
              href={role === 'admin' || role === 'super_admin' ? '/admin/profile' : '/settings'}
              onClick={() => setIsOpen(false)}
              style={{
                padding: '8px 10px',
                borderRadius: '6px',
                color: '#cbd5e1',
                textDecoration: 'none',
                fontSize: '13px',
                fontWeight: '500',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <span>👤</span> My Profile & Settings
            </Link>
          </div>

          <button
            onClick={() => {
              setIsOpen(false);
              logout();
            }}
            style={{
              padding: '8px 10px',
              borderRadius: '6px',
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              border: 'none',
              color: '#f87171',
              fontWeight: '600',
              fontSize: '12px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              marginTop: '4px',
            }}
          >
            🚪 Logout
          </button>
        </div>
      )}
    </div>
  );
}
