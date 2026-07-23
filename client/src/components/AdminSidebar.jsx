'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  Users, 
  BookOpen, 
  FolderPlus, 
  Cpu, 
  CheckCircle, 
  FolderGit2, 
  FileText, 
  Trophy, 
  Calendar, 
  Megaphone, 
  BarChart3, 
  Settings, 
  ShieldAlert,
  LogOut,
  X,
  Sparkles,
  Layers,
  Terminal,
  Database
} from 'lucide-react';
import { APP_NAME } from '../lib/constants';

export default function AdminSidebar({ isOpen, onClose }) {
  const pathname = usePathname();
  const { logout, user } = useAuth();

  const adminNav = [
    { section: 'MANAGEMENT', items: [
      { label: 'Overview Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
      { label: 'Students', href: '/admin/students', icon: Users },
      { label: 'Question Repository', href: '/admin/repositories', icon: FolderGit2 },
      { label: 'Dataset Upload', href: '/admin/datasets', icon: FolderPlus },
      { label: 'AI Processing Queue', href: '/admin/ai-queue', icon: Cpu },
      { label: 'Question Approval', href: '/admin/approval', icon: CheckCircle },
      { label: 'Resource Library', href: '/admin/resources', icon: FileText },
      { label: 'Challenges', href: '/admin/challenges', icon: Trophy },
      { label: 'Events & Drives', href: '/admin/events', icon: Calendar },
      { label: 'Announcements', href: '/admin/announcements', icon: Megaphone },
      { label: 'Analytics & Reports', href: '/admin/reports', icon: BarChart3 },
      { label: 'Audit Trail Logs', href: '/admin/logs', icon: ShieldAlert },
    ]},
    { section: 'ENTERPRISE AI ENGINE', items: [
      { label: 'AI Providers & Settings', href: '/admin/ai-engine/providers', icon: Sparkles },
      { label: 'Prompt Templates', href: '/admin/ai-engine/prompts', icon: Terminal },
      { label: 'Question Generator', href: '/admin/ai-engine/generator', icon: Layers },
      { label: 'AI Engine Analytics', href: '/admin/ai-engine/analytics', icon: Database },
    ]},
  ];

  return (
    <>
      {isOpen && (
        <div 
          onClick={onClose}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.4)',
            backdropFilter: 'blur(4px)',
            zIndex: 390,
          }}
          className="lg:hidden"
        />
      )}

      <aside style={{
        position: 'fixed',
        top: 0,
        bottom: 0,
        left: 0,
        width: '270px',
        backgroundColor: '#0b1120',
        borderRight: '1px solid rgba(255, 255, 255, 0.08)',
        zIndex: 400,
        display: 'flex',
        flexDirection: 'column',
        transform: isOpen ? 'translateX(0)' : 'translateX(-100%)',
        transition: 'transform 0.2s ease',
      }}
      className="admin-sidebar-component"
      >
        {/* Header */}
        <div style={{
          height: '70px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '0 20px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)'
        }}>
          <Link href="/admin/dashboard" style={{
            fontSize: '17px',
            fontWeight: '800',
            background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            ⚡ ADMIN &bull; {APP_NAME}
          </Link>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }} className="lg:hidden">
            <X size={20} />
          </button>
        </div>

        {/* Nav list */}
        <nav style={{ flex: 1, padding: '16px 12px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {adminNav.map((sec, sIdx) => (
            <div key={sIdx}>
              <span style={{ fontSize: '10px', fontWeight: '800', color: '#64748b', letterSpacing: '0.05em', padding: '0 12px 8px 12px', display: 'block' }}>
                {sec.section}
              </span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {sec.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => { if (window.innerWidth < 1024) onClose(); }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '10px 14px',
                        borderRadius: '8px',
                        color: isActive ? '#ffffff' : '#94a3b8',
                        backgroundColor: isActive ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
                        border: isActive ? '1px solid rgba(99, 102, 241, 0.3)' : '1px solid transparent',
                        fontWeight: isActive ? '600' : '500',
                        fontSize: '13px',
                      }}
                    >
                      <Icon size={16} style={{ color: isActive ? '#818cf8' : 'inherit' }} />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Footer Admin info */}
        <div style={{ padding: '16px', borderTop: '1px solid rgba(255, 255, 255, 0.08)', backgroundColor: 'rgba(0, 0, 0, 0.2)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)', color: '#fff', fontWeight: '800', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px' }}>
              SA
            </div>
            <div>
              <p style={{ fontSize: '13px', fontWeight: '700', color: '#f8fafc', margin: 0 }}>{user?.full_name || 'Super Admin'}</p>
              <p style={{ fontSize: '11px', color: '#64748b', margin: 0 }}>System Administrator</p>
            </div>
          </div>
          <button onClick={logout} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: 'none', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#f87171', fontWeight: '600', fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            <LogOut size={14} /> Exit Admin Portal
          </button>
        </div>
      </aside>

      <style jsx global>{`
        @media (min-width: 1024px) {
          .admin-sidebar-component { transform: translateX(0) !important; }
        }
      `}</style>
    </>
  );
}
