'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useAuth } from '../../../context/AuthContext';
import { useToast } from '../../../context/ToastContext';
import { useConfirm } from '../../../context/ConfirmContext';
import { resourceService } from '../../../lib/resourceService';
import { 
  ShieldCheck, Eye, Download, Bookmark, Trash2, Globe, Lock, 
  Sparkles, Layers, BookOpen, AlertTriangle 
} from 'lucide-react';

export default function AdminResourcesPage() {
  const { user } = useAuth();
  const toast = useToast();
  const confirm = useConfirm();

  const [analytics, setAnalytics] = useState(null);
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadAdminData = useCallback(async () => {
    setLoading(true);
    try {
      const [analyticsData, resList] = await Promise.all([
        resourceService.getAdminAnalytics(),
        resourceService.listResources({ limit: 100 })
      ]);
      setAnalytics(analyticsData);
      setResources(resList.resources || []);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load administrative resource moderation data');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadAdminData();
  }, [loadAdminData]);

  const handleModerateAction = async (id, action) => {
    const isConfirmed = await confirm({
      title: `Moderate Resource (${action.toUpperCase()})`,
      message: `Are you sure you want to ${action} this resource? Action will be recorded in audit logs.`,
      type: action === 'remove' ? 'danger' : 'warning'
    });
    if (!isConfirmed) return;

    try {
      await resourceService.moderateResource(id, action, `Admin moderation via portal`);
      toast.success(`Resource ${action} successful`);
      loadAdminData();
    } catch (err) {
      toast.error(`Moderation action failed: ` + err.message);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', padding: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: '800', color: 'var(--text-primary)', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <ShieldCheck size={26} style={{ color: 'var(--accent-primary)' }} /> Institutional Resource Moderation & Governance
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Manage published materials across departments, review flagged items, and maintain audit logs.
          </p>
        </div>
      </div>

      {/* Analytics Summary Cards */}
      {analytics && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
          <div style={{ background: 'var(--bg-glass)', border: '1px solid var(--border-color)', padding: '20px', borderRadius: 'var(--radius-lg)' }}>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '600' }}>Total Institutional Resources</span>
            <h2 style={{ fontSize: '24px', fontWeight: '800', color: 'var(--accent-primary)', marginTop: '4px', margin: 0 }}>{analytics.totalResources}</h2>
          </div>

          <div style={{ background: 'var(--bg-glass)', border: '1px solid var(--border-color)', padding: '20px', borderRadius: 'var(--radius-lg)' }}>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '600' }}>Published Materials</span>
            <h2 style={{ fontSize: '24px', fontWeight: '800', color: 'var(--accent-success)', marginTop: '4px', margin: 0 }}>{analytics.publishedCount}</h2>
          </div>

          <div style={{ background: 'var(--bg-glass)', border: '1px solid var(--border-color)', padding: '20px', borderRadius: 'var(--radius-lg)' }}>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '600' }}>Total Views</span>
            <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#3b82f6', marginTop: '4px', margin: 0 }}>{analytics.totalViews}</h2>
          </div>

          <div style={{ background: 'var(--bg-glass)', border: '1px solid var(--border-color)', padding: '20px', borderRadius: 'var(--radius-lg)' }}>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '600' }}>Total Downloads</span>
            <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#f59e0b', marginTop: '4px', margin: 0 }}>{analytics.totalDownloads}</h2>
          </div>
        </div>
      )}

      {/* Resource Moderation Table */}
      <div style={{ background: 'var(--bg-glass)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', padding: '24px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '16px' }}>Resource Repository Queue</h3>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
            <Sparkles size={20} style={{ animation: 'spin 1s linear infinite', marginBottom: '8px' }} />
            <p>Loading moderation queue...</p>
          </div>
        ) : resources.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
            <p>No resources found in queue.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', color: 'var(--text-primary)' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', textAlign: 'left', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '12px 16px' }}>Resource</th>
                  <th style={{ padding: '12px 16px' }}>Author & Role</th>
                  <th style={{ padding: '12px 16px' }}>Department</th>
                  <th style={{ padding: '12px 16px' }}>Engagement</th>
                  <th style={{ padding: '12px 16px' }}>Status</th>
                  <th style={{ padding: '12px 16px', textAlign: 'right' }}>Moderation Actions</th>
                </tr>
              </thead>
              <tbody>
                {resources.map(res => (
                  <tr key={res.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '14px 16px', fontWeight: '600' }}>
                      <Link href={`/resources/${res.id}`} style={{ color: 'var(--text-primary)', textDecoration: 'none' }}>
                        {res.title}
                      </Link>
                      <span style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)', fontWeight: '400', marginTop: '2px' }}>
                        Type: {res.type}
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      {res.users?.full_name || res.author || 'System User'}
                      <span style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)' }}>{res.users?.role || 'Faculty'}</span>
                    </td>
                    <td style={{ padding: '14px 16px' }}>{res.department}</td>
                    <td style={{ padding: '14px 16px' }}>
                      <span>{res.view_count || 0} views</span> • <span>{res.download_count || 0} dl</span>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{ padding: '4px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: '700', background: res.is_published !== false ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)', color: res.is_published !== false ? '#10b981' : '#ef4444' }}>
                        {res.is_published !== false ? 'Published' : 'Unpublished'}
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                        {res.is_published !== false ? (
                          <button onClick={() => handleModerateAction(res.id, 'unpublish')} style={{ padding: '6px 10px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', background: 'transparent', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '12px' }}>
                            Unpublish
                          </button>
                        ) : (
                          <button onClick={() => handleModerateAction(res.id, 'publish')} style={{ padding: '6px 10px', borderRadius: 'var(--radius-md)', background: 'var(--accent-success)', color: '#fff', border: 'none', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }}>
                            Publish
                          </button>
                        )}
                        <button onClick={() => handleModerateAction(res.id, 'remove')} style={{ padding: '6px 10px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', background: 'transparent', color: 'var(--accent-danger)', cursor: 'pointer', fontSize: '12px' }}>
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
