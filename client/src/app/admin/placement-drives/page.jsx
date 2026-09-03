'use client';

import { useState, useEffect, useCallback } from 'react';
import api from '../../../lib/api';
import EmptyState from '../../../components/ui/EmptyState';
import { Building2, Plus, Users, Award, ExternalLink } from 'lucide-react';
import styles from './placementDrives.module.css';

export default function PlacementDrivesPage() {
  const [drives, setDrives] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDrives = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/placement-drives');
      setDrives(res.data?.data || res.data || []);
    } catch (err) {
      console.error('Failed to load placement drives from database', err);
      setDrives([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDrives();
  }, [fetchDrives]);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Corporate Placement Drives Engine</h1>
          <p className={styles.subtitle}>Track company recruitment drives, eligibility criteria, and candidate selections</p>
        </div>
        <button className={styles.primaryBtn}>+ Register Corporate Drive</button>
      </div>

      <div className={styles.drivesList}>
        {loading ? (
          <div className={styles.textCenter} style={{ padding: '40px', color: 'var(--text-muted)' }}>
            Loading placement drives from database...
          </div>
        ) : drives.length === 0 ? (
          <EmptyState
            icon={<Building2 size={36} style={{ color: 'var(--text-muted)' }} />}
            title="No Corporate Placement Drives Found"
            description="Register a hiring partner company or recruitment drive to start tracking student eligibility."
            actionText="+ Register Corporate Drive"
          />
        ) : (
          drives.map((drive) => (
            <div key={drive.id} className={styles.driveCard}>
              <div className={styles.cardHeader}>
                <div className={styles.companyInfo}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '8px', background: 'rgba(99, 102, 241, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-primary)', fontWeight: '800', fontSize: '18px' }}>
                    {drive.companyName ? drive.companyName.charAt(0) : 'C'}
                  </div>
                  <div>
                    <h2 className={styles.companyTitle}>{drive.companyName}</h2>
                    <span className={styles.packagePill}>💰 Package: {drive.packageLpa || '4.5 - 12.0 LPA'}</span>
                  </div>
                </div>
                <span className={`${styles.statusBadge} ${styles[drive.status?.toLowerCase() || 'active']}`}>
                  {drive.status || 'Active'}
                </span>
              </div>

              <div className={styles.metricsRow}>
                <div className={styles.metricBox}>
                  <span className={styles.metricLabel}>Applied Candidates</span>
                  <span className={styles.metricVal}>{drive.appliedCount || 0}</span>
                </div>
                <div className={styles.metricBox}>
                  <span className={styles.metricLabel}>Shortlisted</span>
                  <span className={styles.metricVal}>{drive.shortlistedCount || 0}</span>
                </div>
                <div className={styles.metricBox}>
                  <span className={styles.metricLabel}>Selected Offers</span>
                  <span className={`${styles.metricVal} ${styles.greenVal}`}>{drive.selectedCount || 0}</span>
                </div>
                <div className={styles.metricBox}>
                  <span className={styles.metricLabel}>CGPA Cutoff</span>
                  <span className={styles.metricVal}>&ge; {drive.cgpaCutoff || 6.5}</span>
                </div>
              </div>

              <div className={styles.detailGrid}>
                <div className={styles.detailBox}>
                  <h4>Eligible Branches</h4>
                  <div className={styles.tagWrap}>
                    {(drive.eligibleBranches || ['CSE', 'ECE', 'AI&DS']).map((b, i) => (
                      <span key={i} className={styles.branchTag}>{b}</span>
                    ))}
                  </div>
                </div>

                <div className={styles.detailBox}>
                  <h4>Selection Process & Rounds</h4>
                  <div className={styles.roundList}>
                    {(drive.selectionProcess || ['Aptitude Assessment', 'Coding Test', 'Interview']).map((r, i) => (
                      <span key={i} className={styles.roundTag}>Round {i + 1}: {r}</span>
                    ))}
                  </div>
                </div>
              </div>

              <div className={styles.cardActions}>
                <button className={styles.btnSecondary}>View Candidates</button>
                <button className={styles.btnSecondary}>Export Shortlist CSV</button>
                <button className={styles.btnPrimary}>Manage Rounds & Offers</button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
