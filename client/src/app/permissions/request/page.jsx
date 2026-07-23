'use client';

import { useState } from 'react';
import api from '../../../lib/api';

export default function PermissionRequestPage() {
  const [permissionId, setPermissionId] = useState('approve_questions');
  const [reason, setReason] = useState('');
  const [durationDays, setDurationDays] = useState(7);
  const [priority, setPriority] = useState('medium');
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!reason) {
      alert('Please provide a justification for your request.');
      return;
    }

    setSubmitting(true);
    try {
      await api.post('/admin/permissions/request', {
        permissionId,
        reason,
        durationDays,
        priority,
      });
      setMsg('Permission request submitted successfully! Super Admin will review your request.');
      setReason('');
    } catch (err) {
      alert('Failed to submit permission request.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ padding: '32px 24px', maxWidth: '700px', margin: '0 auto', color: '#f8fafc' }}>
      <div style={{ marginBottom: '24px' }}>
        <span style={{ fontSize: '11px', fontWeight: '800', color: '#6366f1', backgroundColor: 'rgba(99,102,241,0.15)', padding: '4px 10px', borderRadius: '12px' }}>
          🔑 TEMPORARY PERMISSION ENGINE
        </span>
        <h1 style={{ fontSize: '24px', fontWeight: '800', margin: '8px 0 4px 0' }}>Request Temporary Permission Override</h1>
        <p style={{ color: '#94a3b8', fontSize: '13px', margin: 0 }}>
          Submit a time-bound permission escalation request. Super Admin will review and grant temporary access.
        </p>
      </div>

      {msg && (
        <div style={{ backgroundColor: 'rgba(16,185,129,0.15)', color: '#34d399', padding: '14px', borderRadius: '12px', marginBottom: '20px', fontSize: '13px' }}>
          ✅ {msg}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ backgroundColor: '#0b1120', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{ fontSize: '13px', fontWeight: '700', color: '#cbd5e1' }}>Select Required Permission</label>
          <select value={permissionId} onChange={(e) => setPermissionId(e.target.value)} style={{ backgroundColor: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '10px 14px', color: '#fff', fontSize: '13px' }}>
            <option value="approve_questions">Approve & Publish Questions</option>
            <option value="upload_questions">Upload Datasets</option>
            <option value="create_event">Create Placement Event</option>
            <option value="manage_companies">Edit Company Profiles</option>
            <option value="view_student_profiles">View Student Resumes & Profiles</option>
            <option value="export_reports">Export Placement & Performance Reports</option>
          </select>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '13px', fontWeight: '700', color: '#cbd5e1' }}>Requested Duration (Days)</label>
            <select value={durationDays} onChange={(e) => setDurationDays(Number(e.target.value))} style={{ backgroundColor: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '10px 14px', color: '#fff', fontSize: '13px' }}>
              <option value={1}>1 Day Override</option>
              <option value={7}>7 Days Override</option>
              <option value={30}>30 Days Override</option>
              <option value={365}>Permanent Grant</option>
            </select>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '13px', fontWeight: '700', color: '#cbd5e1' }}>Priority</label>
            <select value={priority} onChange={(e) => setPriority(e.target.value)} style={{ backgroundColor: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '10px 14px', color: '#fff', fontSize: '13px' }}>
              <option value="low">Low Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="high">High Priority</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{ fontSize: '13px', fontWeight: '700', color: '#cbd5e1' }}>Reason / Business Justification *</label>
          <textarea rows={4} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="State the reason why you require temporary permission escalation..." style={{ backgroundColor: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '12px', color: '#fff', fontSize: '13px' }} required />
        </div>

        <button type="submit" disabled={submitting} style={{ backgroundColor: '#6366f1', color: '#fff', border: 'none', padding: '12px', borderRadius: '10px', fontWeight: '700', fontSize: '14px', cursor: 'pointer', marginTop: '8px' }}>
          {submitting ? 'Submitting Request...' : '📩 Submit Permission Request'}
        </button>
      </form>
    </div>
  );
}
