'use client';

import { useState } from 'react';
import styles from './adminResources.module.css';

export default function AdminResourcesPage() {
  const resources = [
    { id: 'res-1', title: 'Operating Systems & Paging Deep Dive Notes', type: 'PDF', company: 'TCS / Infosys', subject: 'Operating Systems', department: 'CSE', year: '2026', downloads: 342, size: '4.2 MB' },
    { id: 'res-2', title: 'Top 50 Amazon System Design Interview Questions', type: 'DOCX', company: 'Amazon', subject: 'System Design', department: 'CSE & AI&DS', year: '2026', downloads: 518, size: '2.1 MB' },
    { id: 'res-3', title: 'Aptitude & Logical Reasoning Master Handbook', type: 'PDF', company: 'General Placement', subject: 'Aptitude', department: 'All Depts', year: '2026', downloads: 890, size: '12.8 MB' },
    { id: 'res-4', title: 'Data Structures C++ & Java Reference Code', type: 'ZIP', company: 'Multi-Company', subject: 'Data Structures', department: 'CSE', year: '2026', downloads: 215, size: '8.5 MB' },
  ];

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Study Material & Resource Library</h1>
          <p className={styles.subtitle}>Upload, categorize, preview, and update placement notes, PDFs, PPTs, and code files</p>
        </div>
        <button className={styles.primaryBtn}>+ Upload Resource</button>
      </div>

      <div className={styles.card}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Document Title</th>
              <th>Format</th>
              <th>Target Company</th>
              <th>Subject / Topic</th>
              <th>Eligible Dept</th>
              <th>Size</th>
              <th>Downloads</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {resources.map((r) => (
              <tr key={r.id}>
                <td>
                  <div className={styles.titleCell}>
                    <span className={styles.docTitle}>{r.title}</span>
                    <span className={styles.docId}>{r.id}</span>
                  </div>
                </td>
                <td><span className={styles.formatBadge}>{r.type}</span></td>
                <td><span className={styles.companyBadge}>{r.company}</span></td>
                <td>{r.subject}</td>
                <td>{r.department}</td>
                <td>{r.size}</td>
                <td><strong>{r.downloads}</strong></td>
                <td>
                  <div className={styles.btnRow}>
                    <button className={styles.previewBtn}>Preview</button>
                    <button className={styles.editBtn}>Replace</button>
                    <button className={styles.deleteBtn}>Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
