'use client';

import { useState } from 'react';
import styles from './reports.module.css';

export default function ReportsPage() {
  const [reportType, setReportType] = useState('placement');
  const [downloadMsg, setDownloadMsg] = useState(null);

  const reportCategories = [
    { id: 'placement', title: 'Placement & Offer Report', desc: 'Comprehensive breakdown of company offers, packages, and shortlisted students per department.', icon: '💼' },
    { id: 'attendance', title: 'Drive & Event Attendance Report', desc: 'Detailed candidate attendance logs for campus interviews, workshops, and hackathons.', icon: '📋' },
    { id: 'questions', title: 'Question Bank Audit Report', desc: 'Analytics on question submissions, approval statuses, difficulty balance, and topic coverage.', icon: '❓' },
    { id: 'usage', title: 'Platform Usage & Telemetry', desc: 'Monthly login frequency, active session durations, and practice arena participation.', icon: '📈' },
    { id: 'student', title: 'Student Activity & Leaderboard', desc: 'Individual candidate XP growth, problem solve count, and rank progression.', icon: '🎓' },
  ];

  const triggerExport = (format) => {
    const filename = `ASET_${reportType.toUpperCase()}_Report_2026.${format === 'excel' ? 'xlsx' : format}`;
    setDownloadMsg(`Generating and downloading ${filename}...`);
    setTimeout(() => setDownloadMsg(null), 4000);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Reports & Telemetry Data Exporter</h1>
          <p className={styles.subtitle}>Generate custom audit reports in PDF, CSV, and Excel formats for administrative reporting</p>
        </div>
      </div>

      {downloadMsg && (
        <div className={styles.alertSuccess}>
          <span>📥</span>
          <span>{downloadMsg}</span>
        </div>
      )}

      {/* Categories Grid */}
      <div className={styles.grid}>
        {reportCategories.map((cat) => (
          <div
            key={cat.id}
            className={`${styles.card} ${reportType === cat.id ? styles.selected : ''}`}
            onClick={() => setReportType(cat.id)}
          >
            <span className={styles.icon}>{cat.icon}</span>
            <h3 className={styles.cardTitle}>{cat.title}</h3>
            <p className={styles.cardDesc}>{cat.desc}</p>
          </div>
        ))}
      </div>

      {/* Export Controls Box */}
      <div className={styles.exportBox}>
        <div className={styles.exportHeader}>
          <h3>Export Settings for <u>{reportCategories.find(c => c.id === reportType)?.title}</u></h3>
          <span className={styles.readyBadge}>Ready to Export</span>
        </div>

        <div className={styles.optionsRow}>
          <div className={styles.optGroup}>
            <label>Academic Year</label>
            <select defaultValue="2025-2026">
              <option value="2025-2026">2025 - 2026 (Current)</option>
              <option value="2024-2025">2024 - 2025</option>
            </select>
          </div>

          <div className={styles.optGroup}>
            <label>Department Filter</label>
            <select defaultValue="ALL">
              <option value="ALL">All Departments</option>
              <option value="CSE">CSE</option>
              <option value="ECE">ECE</option>
              <option value="EEE">EEE</option>
              <option value="ME">ME</option>
              <option value="AI&DS">AI & DS</option>
            </select>
          </div>
        </div>

        <div className={styles.btnRow}>
          <button className={styles.csvBtn} onClick={() => triggerExport('csv')}>
            📄 Export CSV
          </button>
          <button className={styles.excelBtn} onClick={() => triggerExport('excel')}>
            📊 Export Excel (.xlsx)
          </button>
          <button className={styles.pdfBtn} onClick={() => triggerExport('pdf')}>
            📕 Export PDF Document
          </button>
        </div>
      </div>
    </div>
  );
}
