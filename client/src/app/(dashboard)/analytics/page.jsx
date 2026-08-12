'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useToast } from '../../../context/ToastContext';
import { analyticsService } from '../../../lib/analyticsService';
import { 
  TrendingUp, BarChart3, Target, Zap, Sparkles, 
  Flame, CheckCircle2, Award, Users, BookOpen, Clock 
} from 'lucide-react';
import styles from './analytics.module.css';

export default function AnalyticsPage() {
  const { user } = useAuth();
  const toast = useToast();

  const [studentData, setStudentData] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadAnalytics = useCallback(async () => {
    setLoading(true);
    try {
      const res = await analyticsService.getStudentAnalytics();
      setStudentData(res || null);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadAnalytics();
  }, [loadAnalytics]);

  const summary = studentData?.summary || {
    totalSessions: 0,
    totalQuestions: 0,
    totalCorrect: 0,
    accuracyRate: 0,
    totalXP: 0,
    readinessScore: 0,
    streakDays: 0
  };

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.titleSection}>
          <h1 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <TrendingUp size={26} style={{ color: 'var(--accent-primary)' }} /> Analytics & Performance Insights
          </h1>
          <p>Comprehensive activity heatmap, accuracy trends, skill radar, and Placement Readiness Index.</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className={styles.kpiGrid}>
        <div className={styles.kpiCard}>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Target size={14} style={{ color: 'var(--accent-primary)' }} /> Placement Readiness
          </span>
          <h3 style={{ fontSize: '24px', fontWeight: '800', color: 'var(--accent-primary)', margin: 0 }}>
            {summary.readinessScore}%
          </h3>
          <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Based on practice accuracy & consistency</span>
        </div>

        <div className={styles.kpiCard}>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <CheckCircle2 size={14} style={{ color: '#10b981' }} /> Practice Accuracy
          </span>
          <h3 style={{ fontSize: '24px', fontWeight: '800', color: '#10b981', margin: 0 }}>
            {summary.accuracyRate}%
          </h3>
          <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{summary.totalCorrect} of {summary.totalQuestions} solved correctly</span>
        </div>

        <div className={styles.kpiCard}>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Flame size={14} style={{ color: '#f59e0b' }} /> Current Streak
          </span>
          <h3 style={{ fontSize: '24px', fontWeight: '800', color: '#f59e0b', margin: 0 }}>
            {summary.streakDays} Days
          </h3>
          <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Consecutive practice days</span>
        </div>

        <div className={styles.kpiCard}>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Zap size={14} style={{ color: '#a855f7' }} /> Earned XP
          </span>
          <h3 style={{ fontSize: '24px', fontWeight: '800', color: '#a855f7', margin: 0 }}>
            {summary.totalXP} XP
          </h3>
          <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Total learning rewards</span>
        </div>
      </div>

      {/* Main Section Grid */}
      <div className={styles.sectionGrid}>
        {/* Heatmap & Activity Matrix */}
        <div className={styles.card}>
          <h3 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <BarChart3 size={18} style={{ color: 'var(--accent-primary)' }} /> 30-Day Activity & Practice Consistency Matrix
          </h3>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
              <Sparkles size={20} style={{ animation: 'spin 1s linear infinite', marginBottom: '8px' }} />
              <p>Calculating activity metrics...</p>
            </div>
          ) : (
            <div className={styles.heatmapGrid}>
              {(studentData?.heatmap || []).map((h, idx) => (
                <div key={idx} className={`${styles.heatmapCell} ${h.count > 0 ? styles.heatmapCellActive : ''}`} title={`${h.date}: ${h.count} activities`} />
              ))}
            </div>
          )}

          {/* Skill Breakdown */}
          <h3 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)', margin: '16px 0 0 0' }}>
            Domain & Topic Proficiency
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {(studentData?.skillBreakdown || []).map((sk, idx) => (
              <div key={idx} className={styles.skillRow}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)' }}>
                  <span>{sk.skill}</span>
                  <span>{sk.level}%</span>
                </div>
                <div className={styles.skillTrack}>
                  <div className={styles.skillFill} style={{ width: `${sk.level}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Placement Readiness Breakdown Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className={styles.card}>
            <h3 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text-primary)', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Award size={18} style={{ color: '#10b981' }} /> Readiness Benchmark
            </h3>

            <div style={{ background: 'var(--bg-primary)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Aptitude Benchmark</span>
                <span style={{ fontWeight: '700', color: '#10b981' }}>Passed (85%)</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                <span style={{ color: 'var(--text-secondary)' }}>DSA & Coding Benchmark</span>
                <span style={{ fontWeight: '700', color: 'var(--accent-primary)' }}>Passed (78%)</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                <span style={{ color: 'var(--text-secondary)' }}>SQL & DBMS Benchmark</span>
                <span style={{ fontWeight: '700', color: '#f59e0b' }}>Advanced (90%)</span>
              </div>
            </div>

            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
              🎯 <strong>Placement Advice:</strong> Focus next on solving 10 medium-difficulty Graph and Dynamic Programming problems to boost technical readiness.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
