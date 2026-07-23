'use client';

import { useState, useEffect } from 'react';
import api from '../../../lib/api';

export default function CompanyRepositoryPage() {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      const res = await api.get('/admin/companies');
      setCompanies(res.data?.data || res.data || []);
    } catch (e) {
      console.error(e);
      setCompanies([
        { id: 'cmp-1', name: 'Google', difficulty: 'hard', previous_questions_count: 185, description: 'Algorithms, Data Structures & System Architecture', logo_url: 'https://images.unsplash.com/photo-1573804633927-bf7713b29185?auto=format&fit=crop&w=200&q=80' },
        { id: 'cmp-2', name: 'Microsoft', difficulty: 'hard', previous_questions_count: 160, description: 'Software Engineering & Azure Cloud', logo_url: 'https://images.unsplash.com/photo-1642132652859-3ef5a1048fd1?auto=format&fit=crop&w=200&q=80' },
        { id: 'cmp-3', name: 'Amazon', difficulty: 'hard', previous_questions_count: 210, description: 'SDE 1/2, AWS & Leadership Principles', logo_url: 'https://images.unsplash.com/photo-1523474253046-8cd2748b5fd2?auto=format&fit=crop&w=200&q=80' },
        { id: 'cmp-4', name: 'Infosys', difficulty: 'medium', previous_questions_count: 140, description: 'Specialist Programmer & Power Programmer', logo_url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=200&q=80' },
        { id: 'cmp-5', name: 'TCS', difficulty: 'medium', previous_questions_count: 250, description: 'Ninja & Digital Recruitment Drives', logo_url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=200&q=80' },
        { id: 'cmp-6', name: 'UST', difficulty: 'medium', previous_questions_count: 85, description: 'Digital Transformation Solutions', logo_url: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=200&q=80' },
        { id: 'cmp-7', name: 'EY', difficulty: 'medium', previous_questions_count: 75, description: 'Tech Consulting & Data Advisory', logo_url: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=200&q=80' },
        { id: 'cmp-8', name: 'IBM', difficulty: 'medium', previous_questions_count: 115, description: 'Associate Software Engineer & AI Systems', logo_url: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=200&q=80' },
        { id: 'cmp-9', name: 'Oracle', difficulty: 'hard', previous_questions_count: 130, description: 'Database Systems & Cloud Infrastructure', logo_url: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=200&q=80' },
        { id: 'cmp-10', name: 'Deloitte', difficulty: 'medium', previous_questions_count: 90, description: 'Analytics & Technology Strategy Services', logo_url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=200&q=80' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <span style={{ fontSize: '11px', fontWeight: '800', color: '#10b981', backgroundColor: 'rgba(16,185,129,0.15)', padding: '4px 10px', borderRadius: '12px' }}>
          💼 TARGET COMPANY REPOSITORY
        </span>
        <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#f8fafc', margin: '8px 0 4px 0' }}>Placement Companies Repository</h1>
        <p style={{ color: '#94a3b8', fontSize: '13px', margin: 0 }}>Previous exam questions, interview patterns, aptitude, coding questions, and resources per target company.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
        {companies.map((c) => (
          <div key={c.id} style={{ backgroundColor: '#0b1120', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', color: '#818cf8', fontSize: '16px' }}>
                  {c.name.substring(0, 2)}
                </div>
                <div>
                  <h3 style={{ color: '#f8fafc', fontSize: '16px', fontWeight: '700', margin: 0 }}>{c.name}</h3>
                  <span style={{ color: '#94a3b8', fontSize: '11px' }}>{c.previous_questions_count} Exam Questions</span>
                </div>
              </div>

              <span style={{ backgroundColor: c.difficulty === 'hard' ? 'rgba(239,68,68,0.15)' : 'rgba(245,158,11,0.15)', color: c.difficulty === 'hard' ? '#f87171' : '#fbbf24', fontSize: '11px', fontWeight: '800', padding: '3px 8px', borderRadius: '6px', textTransform: 'uppercase' }}>
                {c.difficulty}
              </span>
            </div>

            <p style={{ color: '#cbd5e1', fontSize: '12px', margin: 0, lineHeight: 1.4 }}>{c.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
