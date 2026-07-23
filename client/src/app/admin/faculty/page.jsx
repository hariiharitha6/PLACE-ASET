'use client';

import styles from './adminFaculty.module.css';

export default function FacultyManagementPage() {
  const facultyList = [
    { id: 'fac-1', name: 'Dr. Rajesh Kumar', email: 'rajesh.cse@ahalia.edu', department: 'Computer Science', role: 'Department Admin / Faculty', status: 'Active' },
    { id: 'fac-2', name: 'Prof. Lakshmi Menon', email: 'lakshmi.ece@ahalia.edu', department: 'Electronics', role: 'Faculty Host', status: 'Active' },
    { id: 'fac-3', name: 'Dr. Suresh Varma', email: 'suresh.eee@ahalia.edu', department: 'Electrical', role: 'Faculty', status: 'Active' },
    { id: 'fac-4', name: 'Prof. Anita Joseph', email: 'anita.aids@ahalia.edu', department: 'AI & Data Science', role: 'Faculty Host', status: 'Active' },
  ];

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Faculty & Host Administration</h1>
          <p className={styles.subtitle}>Manage faculty credentials, department assignments, and challenge host privileges</p>
        </div>
        <button className={styles.primaryBtn}>+ Add Faculty Member</button>
      </div>

      <div className={styles.card}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Faculty Name</th>
              <th>Email Address</th>
              <th>Assigned Department</th>
              <th>System Role</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {facultyList.map((f) => (
              <tr key={f.id}>
                <td><strong>{f.name}</strong></td>
                <td>{f.email}</td>
                <td><span className={styles.deptBadge}>{f.department}</span></td>
                <td><span className={styles.roleBadge}>{f.role}</span></td>
                <td><span className={styles.activeTag}>{f.status}</span></td>
                <td>
                  <div className={styles.btnRow}>
                    <button className={styles.editBtn}>Edit Role</button>
                    <button className={styles.btnSec}>Assign Dept</button>
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
