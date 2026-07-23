'use client';

import { useState } from 'react';

export default function QuestionRepositoriesPage() {
  const [selectedDept, setSelectedDept] = useState('CSE');
  const [draggedItem, setDraggedItem] = useState(null);

  const hierarchyData = {
    CSE: [
      {
        subject: 'Data Structures & Algorithms',
        topics: [
          {
            name: 'Trees & Graphs',
            difficulties: [
              { level: 'Easy', count: 42, type: 'MCQ', company: 'TCS', year: '2026' },
              { level: 'Medium', count: 35, type: 'Coding', company: 'Amazon', year: '2025' },
              { level: 'Hard', count: 18, type: 'Coding', company: 'Google', year: '2026' },
            ]
          },
          {
            name: 'Dynamic Programming',
            difficulties: [
              { level: 'Medium', count: 28, type: 'Coding', company: 'Microsoft', year: '2025' },
              { level: 'Hard', count: 22, type: 'Coding', company: 'Amazon', year: '2026' },
            ]
          }
        ]
      },
      {
        subject: 'Database Management Systems',
        topics: [
          {
            name: 'SQL & Normalization',
            difficulties: [
              { level: 'Easy', count: 50, type: 'MCQ', company: 'Infosys', year: '2026' },
              { level: 'Medium', count: 30, type: 'Query', company: 'Oracle', year: '2025' },
            ]
          }
        ]
      }
    ],
    ECE: [
      {
        subject: 'Digital Electronics & Microprocessors',
        topics: [
          {
            name: 'Logic Gates & 8085 Microprocessor',
            difficulties: [
              { level: 'Easy', count: 35, type: 'MCQ', company: 'Intel', year: '2025' },
            ]
          }
        ]
      }
    ]
  };

  const handleDragStart = (item) => {
    setDraggedItem(item);
  };

  const handleDrop = (targetTopic) => {
    if (draggedItem) {
      alert(`Moved item "${draggedItem}" into ${targetTopic}`);
      setDraggedItem(null);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <span style={{ fontSize: '11px', fontWeight: '800', color: '#818cf8', backgroundColor: 'rgba(99,102,241,0.15)', padding: '4px 10px', borderRadius: '12px' }}>
            📚 ENTERPRISE REPOSITORY HIERARCHY
          </span>
          <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#f8fafc', margin: '8px 0 4px 0' }}>Question Repository Organization</h1>
          <p style={{ color: '#94a3b8', fontSize: '13px', margin: 0 }}>
            Hierarchy: Department ➔ Subject ➔ Topic ➔ Difficulty ➔ Question Type ➔ Company ➔ Year ➔ Questions
          </p>
        </div>
      </div>

      {/* Department Selector Pills */}
      <div style={{ display: 'flex', gap: '10px' }}>
        {['CSE', 'ECE', 'EEE', 'ME', 'CE', 'AI&DS'].map((dept) => (
          <button
            key={dept}
            onClick={() => setSelectedDept(dept)}
            style={{
              padding: '8px 16px',
              borderRadius: '10px',
              border: 'none',
              fontWeight: '700',
              fontSize: '13px',
              cursor: 'pointer',
              backgroundColor: selectedDept === dept ? '#6366f1' : 'rgba(255,255,255,0.06)',
              color: selectedDept === dept ? '#fff' : '#94a3b8',
              transition: 'all 0.2s',
            }}
          >
            🏛️ {dept} Department
          </button>
        ))}
      </div>

      {/* Hierarchy Browser Canvas */}
      <div style={{ backgroundColor: '#0b1120', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {(hierarchyData[selectedDept] || hierarchyData.CSE).map((sub, sIdx) => (
          <div key={sIdx} style={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '18px' }}>📖</span>
              <h3 style={{ color: '#f8fafc', fontSize: '16px', fontWeight: '800', margin: 0 }}>{sub.subject}</h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', paddingLeft: '16px' }}>
              {sub.topics.map((t, tIdx) => (
                <div
                  key={tIdx}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => handleDrop(t.name)}
                  style={{ backgroundColor: '#1e293b', border: '1px border-dashed rgba(255,255,255,0.1)', borderRadius: '10px', padding: '14px', display: 'flex', flexDirection: 'column', gap: '10px' }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: '#818cf8', fontWeight: '700', fontSize: '14px' }}>📌 {t.name}</span>
                    <span style={{ color: '#94a3b8', fontSize: '11px' }}>Drag items here to re-assign</span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '10px' }}>
                    {t.difficulties.map((d, dIdx) => (
                      <div
                        key={dIdx}
                        draggable
                        onDragStart={() => handleDragStart(`${t.name} - ${d.level}`)}
                        style={{ backgroundColor: '#0b1120', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', padding: '10px', cursor: 'grab', display: 'flex', flexDirection: 'column', gap: '4px' }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '11px', fontWeight: '800', color: d.level === 'Easy' ? '#34d399' : d.level === 'Medium' ? '#fbbf24' : '#f87171' }}>
                            ● {d.level}
                          </span>
                          <span style={{ fontSize: '11px', color: '#94a3b8' }}>{d.count} Qs</span>
                        </div>
                        <div style={{ fontSize: '12px', color: '#cbd5e1', fontWeight: '600' }}>
                          {d.type} &bull; {d.company} ({d.year})
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
