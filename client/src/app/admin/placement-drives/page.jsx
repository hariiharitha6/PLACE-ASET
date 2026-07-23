'use client';

import { useState, useEffect } from 'react';
import api from '../../../lib/api';
import styles from './placementDrives.module.css';

export default function PlacementDrivesPage() {
  const [drives, setDrives] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDrives();
  }, []);

  const fetchDrives = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/placement-drives');
      setDrives(res.data || []);
    } catch (err) {
      console.error(err);
      setDrives([
        { id: 'drive-1', companyName: 'TCS (Tata Consultancy Services)', logo: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=200&q=80', packageLpa: '7.0 - 11.5 LPA', cgpaCutoff: 7.0, eligibleBranches: ['CSE', 'ECE', 'AI&DS'], selectionProcess: ['Online Aptitude Test', 'Coding Round', 'Technical Interview', 'HR Interview'], deadline: '2026-08-01', appliedCount: 142, shortlistedCount: 48, selectedCount: 12, status: 'Active' },
        { id: 'drive-2', companyName: 'Infosys Specialist Programmer', logo: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=200&q=80', packageLpa: '9.5 LPA', cgpaCutoff: 7.5, eligibleBranches: ['CSE', 'AI&DS'], selectionProcess: ['HackWithInfy / Online Assessment', 'Technical Interview', 'HR'], deadline: '2026-08-15', appliedCount: 98, shortlistedCount: 24, selectedCount: 6, status: 'Upcoming' },
        { id: 'drive-3', companyName: 'Wipro Turbo Drive', logo: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=200&q=80', packageLpa: '6.5 LPA', cgpaCutoff: 6.5, eligibleBranches: ['CSE', 'ECE', 'EEE', 'ME'], selectionProcess: ['National Talent Hunt Test', 'Technical & HR'], deadline: '2026-07-20', appliedCount: 210, shortlistedCount: 85, selectedCount: 32, status: 'Completed' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Corporate Placement Drives Engine</h1>
          <p className={styles.subtitle}>Track company packages, eligibility criteria, and round-by-round candidate selections</p>
        </div>
        <button className={styles.primaryBtn}>+ Register Corporate Drive</button>
      </div>

      <div className={styles.drivesList}>
        {loading ? (
          <div className={styles.textCenter}>Loading placement drives...</div>
        ) : (
          drives.map((drive) => (
            <div key={drive.id} className={styles.driveCard}>
              <div className={styles.cardHeader}>
                <div className={styles.companyInfo}>
                  <img src={drive.logo} alt={drive.companyName} className={styles.companyLogo} />
                  <div>
                    <h2 className={styles.companyTitle}>{drive.companyName}</h2>
                    <span className={styles.packagePill}>💰 Package: {drive.packageLpa}</span>
                  </div>
                </div>
                <span className={`${styles.statusBadge} ${styles[drive.status.toLowerCase()]}`}>
                  {drive.status}
                </span>
              </div>

              <div className={styles.metricsRow}>
                <div className={styles.metricBox}>
                  <span className={styles.metricLabel}>Applied Candidates</span>
                  <span className={styles.metricVal}>{drive.appliedCount}</span>
                </div>
                <div className={styles.metricBox}>
                  <span className={styles.metricLabel}>Shortlisted</span>
                  <span className={styles.metricVal}>{drive.shortlistedCount}</span>
                </div>
                <div className={styles.metricBox}>
                  <span className={styles.metricLabel}>Selected Offers</span>
                  <span className={`${styles.metricVal} ${styles.greenVal}`}>{drive.selectedCount}</span>
                </div>
                <div className={styles.metricBox}>
                  <span className={styles.metricLabel}>CGPA Cutoff</span>
                  <span className={styles.metricVal}>&ge; {drive.cgpaCutoff}</span>
                </div>
              </div>

              <div className={styles.detailGrid}>
                <div className={styles.detailBox}>
                  <h4>Eligible Branches</h4>
                  <div className={styles.tagWrap}>
                    {drive.eligibleBranches?.map((b, i) => (
                      <span key={i} className={styles.branchTag}>{b}</span>
                    ))}
                  </div>
                </div>

                <div className={styles.detailBox}>
                  <h4>Selection Process & Rounds</h4>
                  <div className={styles.roundList}>
                    {drive.selectionProcess?.map((r, i) => (
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
