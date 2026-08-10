'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '../../../../lib/api';

export default function NewHostChallengePage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [durationMinutes, setDurationMinutes] = useState(60);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/host/challenges', {
        title,
        description,
        start_time: startTime,
        end_time: endTime,
        duration_minutes: Number(durationMinutes),
      });
      router.push('/host/dashboard');
    } catch (err) {
      console.error('Failed to create contest challenge', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '24px', maxWidth: '900px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px', color: '#f8fafc' }}>
      <div>
        <span style={{ fontSize: '11px', fontWeight: '800', color: '#a855f7', backgroundColor: 'rgba(168,85,247,0.15)', padding: '4px 10px', borderRadius: '12px' }}>
          🎯 CONTEST & CHALLENGE CREATION WIZARD
        </span>
        <h1 style={{ fontSize: '24px', fontWeight: '800', margin: '8px 0 4px 0' }}>Create Coding Contest / Assessment Drive</h1>
        <p style={{ color: '#94a3b8', fontSize: '13px', margin: 0 }}>
          Set up contest rules, schedule start & end timestamps, and publish to students.
        </p>
      </div>

      <form onSubmit={handleSubmit} style={{ backgroundColor: '#0b1120', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div>
          <label style={{ fontSize: '13px', fontWeight: '600', color: '#94a3b8', display: 'block', marginBottom: '8px' }}>Contest Title</label>
          <input
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={{ width: '100%', backgroundColor: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '12px', color: '#fff', fontSize: '14px' }}
            placeholder="e.g. ASET CSE Annual Hackathon & Coding Contest #1"
          />
        </div>

        <div>
          <label style={{ fontSize: '13px', fontWeight: '600', color: '#94a3b8', display: 'block', marginBottom: '8px' }}>Description & Rules</label>
          <textarea
            required
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            style={{ width: '100%', backgroundColor: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '12px', color: '#fff', fontSize: '14px', minHeight: '100px' }}
            placeholder="Detailed rules, test case scoring format, allowed programming languages..."
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
          <div>
            <label style={{ fontSize: '13px', fontWeight: '600', color: '#94a3b8', display: 'block', marginBottom: '8px' }}>Start Time</label>
            <input
              type="datetime-local"
              required
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              style={{ width: '100%', backgroundColor: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '10px', color: '#fff' }}
            />
          </div>

          <div>
            <label style={{ fontSize: '13px', fontWeight: '600', color: '#94a3b8', display: 'block', marginBottom: '8px' }}>End Time</label>
            <input
              type="datetime-local"
              required
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              style={{ width: '100%', backgroundColor: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '10px', color: '#fff' }}
            />
          </div>

          <div>
            <label style={{ fontSize: '13px', fontWeight: '600', color: '#94a3b8', display: 'block', marginBottom: '8px' }}>Duration (Minutes)</label>
            <input
              type="number"
              required
              value={durationMinutes}
              onChange={(e) => setDurationMinutes(e.target.value)}
              style={{ width: '100%', backgroundColor: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '10px', color: '#fff' }}
            />
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '12px' }}>
          <button type="button" onClick={() => router.back()} style={{ backgroundColor: 'transparent', border: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8', padding: '10px 20px', borderRadius: '10px', cursor: 'pointer' }}>Cancel</button>
          <button type="submit" disabled={loading} style={{ backgroundColor: '#a855f7', color: '#fff', border: 'none', padding: '10px 24px', borderRadius: '10px', fontWeight: '700', cursor: 'pointer' }}>
            {loading ? 'Publishing...' : '🚀 Publish Coding Contest'}
          </button>
        </div>
      </form>
    </div>
  );
}
