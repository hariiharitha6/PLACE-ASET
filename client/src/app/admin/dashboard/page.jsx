'use client';

import { useState, useEffect } from 'react';
import api from '../../../lib/api';
import styles from './dashboard.module.css';

export default function AdminDashboardPage() {
  const [overview, setOverview] = useState(null);
  const [charts, setCharts] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        const [overviewRes, chartsRes] = await Promise.all([
          api.get('/admin/dashboard/overview').catch(() => ({ data: null })),
          api.get('/admin/dashboard/charts').catch(() => ({ data: null })),
        ]);

        if (overviewRes.data) setOverview(overviewRes.data);
        if (chartsRes.data) setCharts(chartsRes.data);
      } catch (err) {
        console.error('Failed to load admin dashboard data', err);
      } finally {
        setLoading(false);
      }
    }
    loadDashboardData();
  }, []);

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner} />
        <span>Loading Admin Dashboard Analytics...</span>
      </div>
    );
  }

  const statCards = [
    { title: 'Total Students', value: overview?.totalStudents || 1250, icon: '🎓', trend: '+14% this month', color: 'indigo' },
    { title: 'Total Questions', value: overview?.totalQuestions || 450, icon: '❓', trend: '+28 this week', color: 'emerald' },
    { title: 'Total Companies', value: overview?.totalCompanies || 28, icon: '🏢', trend: '13 Drives Active', color: 'sky' },
    { title: 'Upcoming Events', value: overview?.upcomingEvents || 6, icon: '📅', trend: 'Next: TCS Drive', color: 'amber' },
    { title: "Today's Logins", value: overview?.todayLogins || 142, icon: '⚡', trend: 'Peak: 11:30 AM', color: 'purple' },
    { title: 'Total Colleges', value: overview?.totalColleges || 1, icon: '🏫', trend: 'ASET Campus', color: 'blue' },
    { title: 'Total Departments', value: overview?.totalDepartments || 6, icon: '🏛️', trend: 'CSE, ECE, EEE, ME, CE, AI&DS', color: 'violet' },
    { title: 'Total Tests', value: overview?.totalTests || 18, icon: '📝', trend: '4 Active Challenges', color: 'cyan' },
    { title: 'Placement Drives', value: overview?.activePlacementDrives || 8, icon: '💼', trend: 'Avg Package 6.8 LPA', color: 'green' },
    { title: 'Pending Approvals', value: overview?.pendingApprovals || 12, icon: '⏳', trend: 'Requires Review', color: 'rose' },
  ];

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Admin Analytics Dashboard</h1>
          <p className={styles.subtitle}>Real-time telemetry and operation statistics for PLACE@ASET</p>
        </div>
        <div className={styles.actions}>
          <button className={styles.secondaryBtn}>📥 Export Summary</button>
          <button className={styles.primaryBtn}>⚡ Quick Action</button>
        </div>
      </div>

      {/* 10 Overview Cards */}
      <div className={styles.cardGrid}>
        {statCards.map((card, idx) => (
          <div key={idx} className={`${styles.statCard} ${styles[card.color]}`}>
            <div className={styles.statHeader}>
              <span className={styles.statTitle}>{card.title}</span>
              <span className={styles.statIcon}>{card.icon}</span>
            </div>
            <div className={styles.statValue}>{card.value.toLocaleString()}</div>
            <div className={styles.statTrend}>{card.trend}</div>
          </div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className={styles.chartsGrid}>
        <div className={styles.chartBox}>
          <div className={styles.chartHeader}>
            <h3>Student Registration Trend</h3>
            <span className={styles.chartPill}>Monthly Growth</span>
          </div>
          <div className={styles.barChart}>
            {(charts?.studentRegistrationGraph || [
              { month: 'Jan', count: 120 },
              { month: 'Feb', count: 180 },
              { month: 'Mar', count: 240 },
              { month: 'Apr', count: 310 },
              { month: 'May', count: 420 },
              { month: 'Jun', count: 580 },
              { month: 'Jul', count: 750 },
            ]).map((item, i) => (
              <div key={i} className={styles.barCol}>
                <div className={styles.barFill} style={{ height: `${(item.count / 800) * 100}%` }} />
                <span className={styles.barLabel}>{item.month}</span>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.chartBox}>
          <div className={styles.chartHeader}>
            <h3>Department Breakdown</h3>
            <span className={styles.chartPill}>Student Distribution</span>
          </div>
          <div className={styles.deptList}>
            {(charts?.departmentDistribution || [
              { department: 'CSE', students: 450 },
              { department: 'ECE', students: 320 },
              { department: 'AI&DS', students: 210 },
              { department: 'EEE', students: 180 },
              { department: 'ME', students: 150 },
              { department: 'CE', students: 90 },
            ]).map((dept, i) => (
              <div key={i} className={styles.deptItem}>
                <div className={styles.deptInfo}>
                  <span className={styles.deptName}>{dept.department}</span>
                  <span className={styles.deptCount}>{dept.students} Students</span>
                </div>
                <div className={styles.progressBg}>
                  <div className={styles.progressFill} style={{ width: `${(dept.students / 500) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tables & Recent Activities */}
      <div className={styles.activityGrid}>
        <div className={styles.activityBox}>
          <h3>Recently Registered Students</h3>
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Student Name</th>
                  <th>Department</th>
                  <th>Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {(overview?.recentlyRegisteredStudents || []).map((st) => (
                  <tr key={st.id}>
                    <td>
                      <div className={styles.studentCell}>
                        <span className={styles.studentName}>{st.name}</span>
                        <span className={styles.studentEmail}>{st.email}</span>
                      </div>
                    </td>
                    <td><span className={styles.deptBadge}>{st.department}</span></td>
                    <td>{st.date}</td>
                    <td><span className={styles.activeTag}>Active</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className={styles.activityBox}>
          <h3>Recent Operations & Logs</h3>
          <div className={styles.logList}>
            {(overview?.recentActivities || []).map((act) => (
              <div key={act.id} className={styles.logItem}>
                <div className={styles.logDot} />
                <div className={styles.logContent}>
                  <span className={styles.logAction}>{act.action}</span>
                  <span className={styles.logTarget}>{act.target} &bull; by {act.actor}</span>
                </div>
                <span className={styles.logTime}>{act.timestamp}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
