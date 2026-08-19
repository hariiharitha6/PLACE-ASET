'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { challengeService } from '../../../lib/challengeService';
import { Trophy, Clock, HelpCircle, Users, Plus, Sparkles } from 'lucide-react';
import styles from './adminTests.module.css';

export default function TestsPage() {
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadTests() {
      try {
        const res = await challengeService.getChallenges();
        setChallenges(res?.challenges || res?.data || []);
      } catch (err) {
        console.error('Failed to load challenges for admin', err);
        setChallenges([]);
      } finally {
        setLoading(false);
      }
    }
    loadTests();
  }, []);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Assessment & Challenge Administration</h1>
          <p className={styles.subtitle}>Manage campus challenges, timer rules, question sets, and candidate sessions</p>
        </div>
        <Link href="/challenges/new" className={styles.primaryBtn} style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
          <Plus size={16} /> Create New Assessment
        </Link>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
          <Sparkles size={24} style={{ animation: 'spin 1s linear infinite', marginBottom: '10px' }} />
          <p>Loading assessment registry from database...</p>
        </div>
      ) : challenges.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', background: 'var(--bg-glass)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)' }}>
          <Trophy size={40} style={{ color: 'var(--text-muted)', marginBottom: '12px' }} />
          <h3 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)', margin: 0 }}>No assessments found</h3>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>Create an official placement assessment or weekly challenge to begin testing candidates.</p>
          <Link href="/challenges/new" style={{ display: 'inline-block', marginTop: '16px', padding: '10px 20px', background: 'var(--gradient-primary)', color: '#fff', borderRadius: 'var(--radius-md)', textDecoration: 'none', fontWeight: '600', fontSize: '13px' }}>
            + Create First Challenge
          </Link>
        </div>
      ) : (
        <div className={styles.grid}>
          {challenges.map((t) => (
            <div key={t.id} className={styles.card}>
              <div className={styles.cardHeader}>
                <span className={styles.catBadge}>{t.category || t.department || 'Placement Mock'}</span>
                <span className={styles.statusPill} style={{ textTransform: 'capitalize' }}>{t.status || 'Active'}</span>
              </div>
              <h3 className={styles.testTitle}>{t.title}</h3>
              <div className={styles.metaRow}>
                <span><Clock size={13} /> {t.duration_minutes || 60} Mins</span>
                <span><HelpCircle size={13} /> {t.total_questions || 20} Questions</span>
                <span><Users size={13} /> {t.participant_count || 0} Submissions</span>
              </div>
              <div className={styles.btnRow}>
                <Link href={`/challenges/${t.id}`} className={styles.btnPrimary} style={{ textDecoration: 'none', textAlign: 'center' }}>
                  View Submissions
                </Link>
                <Link href={`/challenges/${t.id}/edit`} className={styles.btnSec} style={{ textDecoration: 'none', textAlign: 'center' }}>
                  Edit Settings
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
