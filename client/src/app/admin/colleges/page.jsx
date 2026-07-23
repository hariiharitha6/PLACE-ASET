'use client';

import { useState, useEffect } from 'react';
import api from '../../../lib/api';

export default function CollegeManagementPage() {
  const [colleges, setColleges] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchColleges();
  }, []);

  const fetchColleges = async () => {
    try {
      const res = await api.get('/admin/colleges');
      setColleges(res.data?.data || res.data || []);
    } catch (e) {
      console.error(e);
      setColleges([
        { id: 'col-1', name: 'Ahalia School of Engineering and Technology', slug: 'aset', description: 'Main Campus, Palakkad, Kerala', is_active: true }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <span style={{ fontSize: '11px', fontWeight: '800', color: '#a855f7', backgroundColor: 'rgba(168,85,247,0.15)', padding: '4px 10px', borderRadius: '12px' }}>
          🏫 COLLEGE ADMINISTRATION
        </span>
        <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#f8fafc', margin: '8px 0 4px 0' }}>Registered Institutions & Colleges</h1>
        <p style={{ color: '#94a3b8', fontSize: '13px', margin: 0 }}>Manage multi-tenant college institutions, branding, and active status.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
        {colleges.map((c) => (
          <div key={c.id} style={{ backgroundColor: '#0b1120', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ color: '#f8fafc', fontSize: '16px', fontWeight: '700', margin: 0 }}>{c.name}</h3>
              <span style={{ backgroundColor: 'rgba(16,185,129,0.15)', color: '#34d399', fontSize: '11px', fontWeight: '700', padding: '3px 8px', borderRadius: '6px' }}>ACTIVE</span>
            </div>

            <p style={{ color: '#94a3b8', fontSize: '12px', margin: 0 }}>{c.description}</p>
            <span style={{ fontSize: '12px', color: '#cbd5e1' }}>Slug identifier: <strong>{c.slug}</strong></span>
          </div>
        ))}
      </div>
    </div>
  );
}
