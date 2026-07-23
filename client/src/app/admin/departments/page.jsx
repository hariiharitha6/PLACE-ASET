'use client';

import { useState, useEffect } from 'react';
import api from '../../../lib/api';

export default function DepartmentManagementPage() {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      const res = await api.get('/admin/departments');
      setDepartments(res.data?.data || res.data || []);
    } catch (e) {
      console.error(e);
      setDepartments([
        { id: 'd-1', name: 'Computer Science & Engineering', code: 'CSE', is_active: true },
        { id: 'd-2', name: 'Electronics & Communication Engineering', code: 'ECE', is_active: true },
        { id: 'd-3', name: 'Electrical & Electronics Engineering', code: 'EEE', is_active: true },
        { id: 'd-4', name: 'Mechanical Engineering', code: 'ME', is_active: true },
        { id: 'd-5', name: 'Civil Engineering', code: 'CE', is_active: true },
        { id: 'd-6', name: 'Artificial Intelligence & Data Science', code: 'AI&DS', is_active: true },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <span style={{ fontSize: '11px', fontWeight: '800', color: '#6366f1', backgroundColor: 'rgba(99,102,241,0.15)', padding: '4px 10px', borderRadius: '12px' }}>
          🏛️ DEPARTMENT ADMINISTRATION
        </span>
        <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#f8fafc', margin: '8px 0 4px 0' }}>Academic Departments</h1>
        <p style={{ color: '#94a3b8', fontSize: '13px', margin: 0 }}>Manage departments, codes, and assigned faculty hosts.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
        {departments.map((d) => (
          <div key={d.id} style={{ backgroundColor: '#0b1120', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ color: '#f8fafc', fontSize: '16px', fontWeight: '700', margin: 0 }}>{d.name}</h3>
              <span style={{ backgroundColor: 'rgba(99,102,241,0.15)', color: '#818cf8', fontSize: '11px', fontWeight: '800', padding: '3px 8px', borderRadius: '6px' }}>{d.code}</span>
            </div>
            <span style={{ fontSize: '12px', color: '#34d399' }}>Status: Active</span>
          </div>
        ))}
      </div>
    </div>
  );
}
