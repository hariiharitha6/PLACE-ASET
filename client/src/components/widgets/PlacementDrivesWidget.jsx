'use client';

import { useState } from 'react';
import styles from './placementDrivesWidget.module.css';

export default function PlacementDrivesWidget({ drives = [] }) {
  const defaultDrives = [
    {
      id: 'd-1',
      company: 'TCS (Tata Consultancy Services)',
      logo: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=120&q=80',
      package: '7.0 - 11.5 LPA',
      role: 'Digital & Ninja Software Engineer',
      deadline: 'Aug 01, 2026',
      status: 'Shortlisted',
      eligible: true,
    },
    {
      id: 'd-2',
      company: 'Infosys Specialist Programmer',
      logo: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=120&q=80',
      package: '9.5 LPA',
      role: 'Specialist Programmer (Power Programmer)',
      deadline: 'Aug 15, 2026',
      status: 'Applied',
      eligible: true,
    },
    {
      id: 'd-3',
      company: 'Wipro Turbo Drive',
      logo: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=120&q=80',
      package: '6.5 LPA',
      role: 'Project Engineer',
      deadline: 'July 28, 2026',
      status: 'Eligible',
      eligible: true,
    },
  ];

  const displayDrives = drives.length > 0 ? drives : defaultDrives;
  const [appliedMap, setAppliedMap] = useState({ 'd-2': true });

  const handleApply = (driveId) => {
    setAppliedMap({ ...appliedMap, [driveId]: true });
  };

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <div>
          <h3 className={styles.title}>Active Placement Drives</h3>
          <p className={styles.subtitle}>Direct recruitment opportunities from visiting campus recruiters</p>
        </div>
        <span className={styles.activeBadge}>{displayDrives.length} Drives Open</span>
      </div>

      <div className={styles.drivesList}>
        {displayDrives.map((d) => {
          const isApplied = appliedMap[d.id] || d.status === 'Applied' || d.status === 'Shortlisted';
          const currentStatus = appliedMap[d.id] && d.status === 'Eligible' ? 'Applied' : d.status;

          return (
            <div key={d.id} className={styles.driveItem}>
              <img src={d.logo} alt={d.company} className={styles.logo} />

              <div className={styles.infoArea}>
                <div className={styles.titleRow}>
                  <h4 className={styles.companyName}>{d.company}</h4>
                  <span className={styles.packageTag}>💰 {d.package}</span>
                </div>
                <span className={styles.roleText}>{d.role}</span>
                <span className={styles.deadlineText}>⏰ Application Deadline: {d.deadline}</span>
              </div>

              <div className={styles.actionArea}>
                <span className={`${styles.statusPill} ${styles[currentStatus.toLowerCase()]}`}>
                  {currentStatus}
                </span>

                {!isApplied ? (
                  <button className={styles.applyBtn} onClick={() => handleApply(d.id)}>
                    Quick Apply
                  </button>
                ) : (
                  <button className={styles.appliedBtn} disabled>
                    ✓ Application Submitted
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
