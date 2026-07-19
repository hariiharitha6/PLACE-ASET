'use client';

import { Trophy, ArrowRight, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

export default function ChallengeWidget({ challenge }) {
  if (!challenge) {
    return (
      <div style={{
        padding: '24px',
        borderRadius: 'var(--radius-lg)',
        background: 'var(--bg-glass)',
        border: '1px solid var(--border-color)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center',
        gap: '12px',
        minHeight: '200px'
      }}>
        <div style={{
          width: '56px',
          height: '56px',
          borderRadius: 'var(--radius-full)',
          background: 'rgba(251, 191, 36, 0.1)',
          color: 'var(--accent-warning)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          <Trophy size={28} />
        </div>
        <h3 style={{ fontSize: '16px', fontWeight: '700' }}>No Active Challenge</h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '13px', maxWidth: '240px' }}>
          Check back later for upcoming weekly challenges and prep sessions.
        </p>
      </div>
    );
  }

  const { title, duration_minutes, isRegistered, completed } = challenge;

  return (
    <div style={{
      padding: '24px',
      borderRadius: 'var(--radius-lg)',
      background: 'var(--gradient-card)',
      border: '1px solid var(--border-accent)',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      gap: '24px',
      boxShadow: 'var(--shadow-glow)',
      minHeight: '200px'
    }}>
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <span style={{
            fontSize: '11px',
            fontWeight: '700',
            textTransform: 'uppercase',
            color: 'var(--accent-primary)',
            backgroundColor: 'rgba(129, 140, 248, 0.1)',
            padding: '4px 8px',
            borderRadius: 'var(--radius-full)'
          }}>
            Weekly Challenge
          </span>
          <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
            ⏱️ {duration_minutes} mins
          </span>
        </div>
        <h3 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '8px' }}>
          {title}
        </h3>
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
          Assess your aptitude and reasoning skills against students in your college.
        </p>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto' }}>
        {completed ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-success)', fontSize: '14px', fontWeight: '600' }}>
            <CheckCircle2 size={16} />
            <span>Completed</span>
          </div>
        ) : isRegistered ? (
          <Link href={`/challenges/arena`} style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'var(--accent-success)',
            color: '#fff',
            padding: '10px 18px',
            borderRadius: 'var(--radius-md)',
            fontWeight: '600',
            fontSize: '14px'
          }}>
            <span>Start Challenge</span>
            <ArrowRight size={14} />
          </Link>
        ) : (
          <Link href={`/challenges`} style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'var(--gradient-primary)',
            color: '#fff',
            padding: '10px 18px',
            borderRadius: 'var(--radius-md)',
            fontWeight: '600',
            fontSize: '14px',
            boxShadow: 'var(--shadow-glow)'
          }}>
            <span>Register Now</span>
            <ArrowRight size={14} />
          </Link>
        )}
      </div>
    </div>
  );
}
