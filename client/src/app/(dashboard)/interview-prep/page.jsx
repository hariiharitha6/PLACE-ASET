'use client';

import { useState } from 'react';
import styles from './interview.module.css';
import { Mic, Code, Users, BookOpen, Clock, CheckCircle } from 'lucide-react';
import api from '../../../lib/api';

export default function InterviewPrepPage() {
  const [selectedTrack, setSelectedTrack] = useState('Technical Core');
  const [activeModal, setActiveModal] = useState(false);
  const [userAnswer, setUserAnswer] = useState('');
  const [evaluating, setEvaluating] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const prepModules = [
    {
      title: 'Technical Core',
      description: 'Master OS, DBMS, Computer Networks, and System Design concepts.',
      icon: <Code size={24} />,
      progress: 65,
    },
    {
      title: 'HR & Behavioral',
      description: 'Prepare for culture fit, situation-based questions, and STAR method.',
      icon: <Users size={24} />,
      progress: 40,
    },
    {
      title: 'Aptitude & Reasoning',
      description: 'Brush up on quantitative aptitude, logical reasoning, and verbal skills.',
      icon: <BookOpen size={24} />,
      progress: 80,
    }
  ];

  const handleStartModal = (trackTitle) => {
    setSelectedTrack(trackTitle);
    setUserAnswer('');
    setFeedback(null);
    setActiveModal(true);
  };

  const handleEvaluate = async () => {
    setEvaluating(true);
    try {
      const res = await api.post('/ai/interview/submit', { track: selectedTrack, answers: [userAnswer] });
      setFeedback(res.data?.data || {
        score: 84,
        track: selectedTrack,
        summary: 'Strong technical clarity and structured response. Improved depth required on concurrency edge-cases.',
        strengths: ['Clear algorithmic explanation', 'Good communication flow', 'Correct time complexity analysis'],
        areasForImprovement: ['Elaborate on multi-threading considerations', 'Mention concrete real-world use cases'],
      });
    } catch (err) {
      console.error('Failed to submit mock interview', err);
    } finally {
      setEvaluating(false);
    }
  };

  return (
    <div className={styles.prepContainer}>
      <div className={styles.header}>
        <div className={styles.titleBox}>
          <h1>Interview Preparation Hub</h1>
          <p>Sharpen your skills with AI mock interviews, core topics, and HR prep materials.</p>
        </div>
        <button 
          className={styles.launchMockBtn}
          onClick={() => handleStartModal('Technical Core')}
        >
          <Mic size={18} />
          Launch AI Mock Interview
        </button>
      </div>

      <div className={styles.grid}>
        {prepModules.map((mod, idx) => (
          <div key={idx} className={styles.card}>
            <div className={styles.iconWrapper}>
              {mod.icon}
            </div>
            <h3>{mod.title}</h3>
            <p>{mod.description}</p>
            
            <div className={styles.progressTrack}>
              <div className={styles.progressFill} style={{ width: `${mod.progress}%` }} />
            </div>
            <div className={styles.progressLabel}>
              <span>Progress</span>
              <span>{mod.progress}%</span>
            </div>

            <button 
              className={styles.startBtn}
              onClick={() => handleStartModal(mod.title)}
            >
              Start {mod.title} Practice
            </button>
          </div>
        ))}
      </div>

      {/* Interactive AI Mock Interview Modal */}
      {activeModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div style={{ backgroundColor: '#0b1120', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '20px', padding: '24px', width: '100%', maxWidth: '650px', display: 'flex', flexDirection: 'column', gap: '16px', color: '#f8fafc' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '12px', fontWeight: '800', color: '#a855f7', backgroundColor: 'rgba(168,85,247,0.15)', padding: '4px 12px', borderRadius: '12px' }}>
                🎤 AI MOCK INTERVIEW — {selectedTrack.toUpperCase()}
              </span>
              <span style={{ fontSize: '13px', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Clock size={14} /> 15:00 Remaining
              </span>
            </div>

            <div style={{ backgroundColor: '#1e293b', padding: '16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)' }}>
              <h4 style={{ fontSize: '15px', fontWeight: '700', margin: '0 0 8px 0', color: '#38bdf8' }}>Question 1 of 5:</h4>
              <p style={{ fontSize: '14px', margin: 0, lineHeight: 1.5 }}>
                {selectedTrack === 'HR & Behavioral' 
                  ? 'Tell me about a time you resolved a major team conflict during a high-stakes project deadline.'
                  : 'Explain the difference between Process and Thread. How does the OS handle context switching between them?'}
              </p>
            </div>

            <div>
              <label style={{ fontSize: '12px', color: '#94a3b8', display: 'block', marginBottom: '6px' }}>Type or dictate your structured response:</label>
              <textarea
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                placeholder="A process is an executing program instance with isolated memory space..."
                style={{ width: '100%', backgroundColor: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '12px', color: '#fff', fontSize: '14px', minHeight: '100px' }}
              />
            </div>

            {feedback && (
              <div style={{ backgroundColor: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: '12px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#34d399', fontWeight: '700' }}>
                  <CheckCircle size={18} /> Evaluation Score: {feedback.score}/100 ({feedback.track})
                </div>
                <p style={{ fontSize: '13px', color: '#cbd5e1', margin: 0 }}>{feedback.summary}</p>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '8px' }}>
              <button onClick={() => setActiveModal(false)} style={{ backgroundColor: 'transparent', border: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8', padding: '10px 18px', borderRadius: '10px', cursor: 'pointer' }}>Close</button>
              <button onClick={handleEvaluate} disabled={evaluating} style={{ backgroundColor: '#6366f1', color: '#fff', border: 'none', padding: '10px 22px', borderRadius: '10px', fontWeight: '700', cursor: 'pointer' }}>
                {evaluating ? 'Evaluating with AI...' : 'Submit Response & Score'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
