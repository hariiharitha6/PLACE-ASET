'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import styles from './adminSidebar.module.css';

const navItems = [
  { label: 'Dashboard', path: '/admin/dashboard', icon: '📊' },
  { label: 'All Users', path: '/admin/users', icon: '👥' },
  { label: 'Students', path: '/admin/students', icon: '🎓' },
  { label: 'Hosts & Faculty', path: '/admin/hosts', icon: '👨‍🏫' },
  { label: 'College Admins', path: '/admin/users?role=college_admin', icon: '🏛️' },
  { label: 'Colleges', path: '/admin/colleges', icon: '🏫' },
  { label: 'Departments', path: '/admin/departments', icon: '🏬' },
  { label: 'Questions', path: '/admin/questions', icon: '❓' },
  { label: 'Question Repositories', path: '/admin/repositories', icon: '📚' },
  { label: 'Target Companies', path: '/admin/companies', icon: '💼' },
  { label: 'Datasets', path: '/admin/datasets', icon: '📁' },
  { label: 'OCR & File Upload', path: '/admin/datasets', icon: '📤' },
  { label: 'Approval Queue', path: '/admin/approval', icon: '✅', badge: '12' },
  { label: 'AI Processing Queue', path: '/admin/ai-queue', icon: '⚙️' },
  { label: 'AI Providers', path: '/admin/ai-engine/providers', icon: '⚡' },
  { label: 'Prompt Manager', path: '/admin/ai-engine/prompts', icon: '📝' },
  { label: 'Embeddings & Vectors', path: '/admin/ai-engine/analytics', icon: '🧬' },
  { label: 'Question Generator', path: '/admin/ai-engine/generator', icon: '🤖' },
  { label: 'Challenges', path: '/admin/challenges', icon: '🏆' },
  { label: 'Practice Sets', path: '/admin/tests', icon: '📝' },
  { label: 'Events & Contests', path: '/admin/events', icon: '📅' },
  { label: 'Announcements', path: '/admin/announcements', icon: '📢' },
  { label: 'Reports', path: '/admin/reports', icon: '📄' },
  { label: 'System Analytics', path: '/admin/analytics', icon: '📈' },
  { label: 'Audit Trail Logs', path: '/admin/logs', icon: '📜' },
  { label: 'System Settings', path: '/admin/settings', icon: '🔧' },
  { label: 'Profile', path: '/admin/profile', icon: '👤' },
];

export default function AdminSidebar({ isOpen, onClose }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <>
      {isOpen && (
        <div className={styles.backdrop} onClick={onClose} />
      )}

      <aside className={`${styles.sidebar} ${isOpen ? styles.open : ''}`}>
        <div className={styles.header}>
          <div className={styles.logoBadge}>ASET</div>
          <div className={styles.titleInfo}>
            <span className={styles.brandTitle}>PLACE@ASET</span>
            <span className={styles.brandSubtitle}>Admin Console</span>
          </div>
          {onClose && (
            <button className={styles.closeBtn} onClick={onClose}>✕</button>
          )}
        </div>

        <div className={styles.userCard}>
          <div className={styles.avatar}>
            {user?.full_name ? user.full_name.substring(0, 2).toUpperCase() : 'SA'}
          </div>
          <div className={styles.userInfo}>
            <span className={styles.userName}>{user?.full_name || 'System Admin'}</span>
            <span className={styles.userRole}>{user?.role || 'super_admin'}</span>
          </div>
        </div>

        <nav className={styles.nav}>
          {navItems.map((item) => {
            const isActive = pathname === item.path || pathname?.startsWith(item.path + '/');
            return (
              <Link
                key={item.path}
                href={item.path}
                className={`${styles.navItem} ${isActive ? styles.active : ''}`}
                onClick={onClose}
              >
                <span className={styles.icon}>{item.icon}</span>
                <span className={styles.label}>{item.label}</span>
                {item.badge && (
                  <span className={styles.badge}>{item.badge}</span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className={styles.footer}>
          <button onClick={logout} className={styles.logoutBtn}>
            <span>🚪</span>
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}
