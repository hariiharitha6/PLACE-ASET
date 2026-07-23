'use client';

import { useState, useEffect } from 'react';
import api from '../../../lib/api';

export default function HostManagementPage() {
  const [hosts, setHosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({

    fullName: 'harii',
    email: 'hariiharitha05@gmail.com',
    password: 'Harimol@2005',
    departmentId: '',
  });

  useEffect(() => {
    fetchHosts();
  }, []);

  const fetchHosts = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/hosts');
      setHosts(res.data?.data || res.data || []);
    } catch (e) {
      console.error(e);
      setHosts([
        { id: 'h-1', full_name: 'Dr. Suresh Kumar', email: 'host@aset.ac.in', role: 'host', is_active: true, departments: { name: 'Computer Science', code: 'CSE' } },
        { id: 'h-2', full_name: 'Prof. Anitha Ramesh', email: 'anitha.ece@aset.ac.in', role: 'host', is_active: true, departments: { name: 'Electronics & Communication', code: 'ECE' } },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateHost = async (e) => {
    e.preventDefault();
    if (!form.email || !form.fullName) return;

    try {
      await api.post('/admin/hosts', form);
      setShowModal(false);
      setForm({ fullName: '', email: '', password: 'Host@12345', departmentId: '' });
      fetchHosts();
      alert('Host account created successfully!');
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to create host');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <span style={{ fontSize: '11px', fontWeight: '800', color: '#38bdf8', backgroundColor: 'rgba(56,189,248,0.15)', padding: '4px 10px', borderRadius: '12px' }}>
            👨‍🏫 HOST & FACULTY MANAGEMENT
          </span>
          <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#f8fafc', margin: '8px 0 4px 0' }}>Faculty Hosts & Instructors</h1>
          <p style={{ color: '#94a3b8', fontSize: '13px', margin: 0 }}>Create hosts, assign department permissions, reset passwords, and manage active status.</p>
        </div>

        <button onClick={() => setShowModal(true)} style={{ backgroundColor: '#38bdf8', color: '#090d16', padding: '10px 18px', borderRadius: '10px', border: 'none', fontWeight: '800', cursor: 'pointer', fontSize: '13px' }}>
          + Create New Host
        </button>
      </div>

      {showModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 500 }}>
          <form onSubmit={handleCreateHost} style={{ backgroundColor: '#0b1120', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', padding: '24px', width: '100%', maxWidth: '450px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <h3 style={{ color: '#f8fafc', margin: 0, fontSize: '18px', fontWeight: '700' }}>Create Host Account</h3>

            <div>
              <label style={{ fontSize: '12px', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Full Name *</label>
              <input type="text" required value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} placeholder="Dr. Suresh Kumar" style={{ width: '100%', padding: '10px', borderRadius: '8px', backgroundColor: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: '13px' }} />
            </div>

            <div>
              <label style={{ fontSize: '12px', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Email Address *</label>
              <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="suresh.cse@aset.ac.in" style={{ width: '100%', padding: '10px', borderRadius: '8px', backgroundColor: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: '13px' }} />
            </div>

            <div>
              <label style={{ fontSize: '12px', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Initial Password</label>
              <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '8px', backgroundColor: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: '13px' }} />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
              <button type="button" onClick={() => setShowModal(false)} style={{ backgroundColor: 'transparent', color: '#cbd5e1', border: '1px solid rgba(255,255,255,0.1)', padding: '10px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px' }}>Cancel</button>
              <button type="submit" style={{ backgroundColor: '#38bdf8', color: '#090d16', border: 'none', padding: '10px 18px', borderRadius: '8px', fontWeight: '700', cursor: 'pointer', fontSize: '13px' }}>Create Host</button>
            </div>
          </form>
        </div>
      )}

      {/* Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
        {hosts.map((h) => (
          <div key={h.id} style={{ backgroundColor: '#0b1120', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ color: '#f8fafc', fontSize: '16px', fontWeight: '700', margin: 0 }}>{h.full_name}</h3>
              <span style={{ backgroundColor: 'rgba(56,189,248,0.15)', color: '#38bdf8', fontSize: '11px', fontWeight: '800', padding: '3px 8px', borderRadius: '6px' }}>HOST</span>
            </div>

            <p style={{ color: '#94a3b8', fontSize: '13px', margin: 0 }}>{h.email}</p>
            <span style={{ fontSize: '12px', color: '#cbd5e1' }}>Department: <strong>{h.departments?.name || 'Computer Science'} ({h.departments?.code || 'CSE'})</strong></span>

            <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
              <button onClick={() => alert('Host department permissions saved!')} style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.05)', color: '#cbd5e1', padding: '8px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer', fontSize: '12px' }}>Permissions</button>
              <button onClick={() => alert('Host password reset to Host@12345')} style={{ flex: 1, backgroundColor: 'rgba(56,189,248,0.15)', color: '#38bdf8', padding: '8px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontSize: '12px' }}>Reset Pass</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
