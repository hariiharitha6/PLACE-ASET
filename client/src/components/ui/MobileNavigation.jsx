'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { Home, Compass, BookOpen, Users, Bot, Sparkles } from 'lucide-react';
import styles from './MobileNavigation.module.css';

export default function MobileNavigation() {
  const pathname = usePathname();
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) return null;

  const role = user?.role || 'student';
  const isStudent = role === 'student';

  const navItems = [
    { label: 'Home', href: '/dashboard', icon: <Home size={18} /> },
    { label: 'Practice', href: '/practice', icon: <Compass size={18} /> },
    { label: 'Resources', href: '/resources', icon: <BookOpen size={18} /> },
    { label: 'Community', href: '/community', icon: <Users size={18} /> },
    { label: 'Mentor', href: '/mentor', icon: <Bot size={18} /> },
    { label: 'Studio', href: '/personal', icon: <Sparkles size={18} /> },
  ];

  return (
    <nav className={styles.mobileNav} aria-label="Mobile Bottom Navigation">
      {navItems.map((item) => {
        const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`${styles.navItem} ${isActive ? styles.active : ''}`}
          >
            <span className={styles.iconBox}>{item.icon}</span>
            <span className={styles.label}>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
