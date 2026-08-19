'use client';

import { useState, useEffect, useCallback } from 'react';
import api from '../../../lib/api';
import styles from './students.module.css';

export default function StudentManagementPage() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedIds, setSelectedIds] = useState([]);
  const [actionSuccess, setActionSuccess] = useState(null);

  const fetchStudents = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/students', {
        params: {
          search,
          department: departmentFilter !== 'ALL' ? departmentFilter : undefined,
          status: statusFilter !== 'ALL' ? statusFilter : undefined,
        },
      });
      setStudents(res.data?.data || res.data || []);
    } catch (err) {
      console.error('Failed to fetch students', err);
      setStudents([]);
    } finally {
      setLoading(false);
    }
  }, [search, departmentFilter, statusFilter]);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  const handleToggleStatus = async (studentId, currentStatus) => {
    try {
      await api.patch(`/admin/students/${studentId}/status`, { is_active: !currentStatus });
      setStudents(students.map(s => s.id === studentId ? { ...s, is_active: !currentStatus } : s));
      setActionSuccess(`Student account ${!currentStatus ? 'activated' : 'suspended'} successfully.`);
      setTimeout(() => setActionSuccess(null), 3000);
    } catch (err) {
      console.error('Failed to update student status', err);
    }
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(students.map(s => s.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(item => item !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const exportCSV = () => {
    if (students.length === 0) return;
    const headers = ['ID,Name,Email,Department,Year,Section,RollNumber,Status\n'];
    const rows = students.map(s => `${s.id},"${s.full_name || ''}",${s.email || ''},${s.departments?.code || 'CSE'},${s.year || 4},${s.section || 'A'},${s.roll_number || 'N/A'},${s.is_active ? 'Active' : 'Suspended'}`).join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ASET_Students_Report.csv';
    a.click();
  };

  const filteredStudents = students.filter(st => {
    if (!search) return true;
    const q = search.toLowerCase();
    return st.full_name?.toLowerCase().includes(q) || st.email?.toLowerCase().includes(q) || st.roll_number?.toLowerCase().includes(q);
  });

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Student Directory & User Management</h1>
          <p className={styles.subtitle}>Audit, suspend, activate, and manage enrolled candidates across departments</p>
        </div>
        <div className={styles.actions}>
          <button className={styles.secondaryBtn} onClick={exportCSV} disabled={students.length === 0}>📥 Export CSV</button>
        </div>
      </div>

      {actionSuccess && (
        <div className={styles.alertSuccess}>
          <span>✅</span>
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* Filter Bar */}
      <div className={styles.filterBar}>
        <div className={styles.searchBox}>
          <span>🔍</span>
          <input
            type="text"
            placeholder="Search by name, email, or roll number..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className={styles.selectGroup}>
          <select value={departmentFilter} onChange={(e) => setDepartmentFilter(e.target.value)}>
            <option value="ALL">All Departments</option>
            <option value="CSE">Computer Science (CSE)</option>
            <option value="ECE">Electronics (ECE)</option>
            <option value="EEE">Electrical (EEE)</option>
            <option value="ME">Mechanical (ME)</option>
            <option value="AI&DS">AI & Data Science</option>
          </select>

          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="ALL">All Statuses</option>
            <option value="active">Active Only</option>
            <option value="suspended">Suspended Only</option>
          </select>
        </div>
      </div>

      {/* Bulk Action Bar */}
      {selectedIds.length > 0 && (
        <div className={styles.bulkBar}>
          <span>Selected {selectedIds.length} candidate(s)</span>
          <div className={styles.bulkActions}>
            <button className={styles.bulkBtnDanger}>Bulk Suspend</button>
            <button className={styles.bulkBtnSuccess}>Bulk Activate</button>
          </div>
        </div>
      )}

      {/* Data Table */}
      <div className={styles.tableCard}>
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>
                  <input
                    type="checkbox"
                    onChange={handleSelectAll}
                    checked={selectedIds.length === students.length && students.length > 0}
                  />
                </th>
                <th>Candidate Name</th>
                <th>Email Address</th>
                <th>Dept</th>
                <th>Year</th>
                <th>Section</th>
                <th>Roll No</th>
                <th>College</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="10" className={styles.textCenter}>Loading student records from Supabase...</td>
                </tr>
              ) : filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan="10" className={styles.textCenter}>No registered student records found.</td>
                </tr>
              ) : (
                filteredStudents.map((st) => (
                  <tr key={st.id}>
                    <td>
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(st.id)}
                        onChange={() => handleSelectOne(st.id)}
                      />
                    </td>
                    <td>
                      <div className={styles.candidateName}>{st.full_name}</div>
                    </td>
                    <td><span className={styles.emailText}>{st.email}</span></td>
                    <td><span className={styles.deptBadge}>{st.departments?.code || 'CSE'}</span></td>
                    <td>Year {st.year || 4}</td>
                    <td>Sec {st.section || 'A'}</td>
                    <td><code>{st.roll_number || 'N/A'}</code></td>
                    <td>{st.colleges?.name || 'ASET'}</td>
                    <td>
                      <span className={st.is_active ? styles.statusActive : styles.statusSuspended}>
                        {st.is_active ? 'Active' : 'Suspended'}
                      </span>
                    </td>
                    <td>
                      <div className={styles.rowActions}>
                        <button
                          className={st.is_active ? styles.actionSuspend : styles.actionActivate}
                          onClick={() => handleToggleStatus(st.id, st.is_active)}
                        >
                          {st.is_active ? 'Suspend' : 'Activate'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
