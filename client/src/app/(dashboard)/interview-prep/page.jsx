'use client';

import { useState } from 'react';
import styles from './interview.module.css';
import { useToast } from '../../../context/ToastContext';
import { Mic, Code, Users, BookOpen, Clock, CheckCircle, Sparkles, ArrowRight, RefreshCw } from 'lucide-react';
import api from '../../../lib/api';

const TRACK_QUESTIONS = {
  'Technical Core': [
    'Explain the difference between Process and Thread. How does the OS handle context switching between them?',
    'What are database indexes? Compare B-Tree and Hash Index in PostgreSQL or MySQL.',
    'Describe the ACID properties in database transactions and how isolation levels prevent race conditions.',
    'Explain the differences between TCP and UDP. When would you prefer UDP in high-performance applications?'
  ],
  'HR & Behavioral': [
    'Tell me about a time you resolved a major team conflict during a high-stakes project deadline.',
    'Why are you specifically interested in campus recruitment drives with our partner companies?',
    'Describe a situation where a software build failed in production and how you handled the post-mortem.'
  ],
  'Aptitude & Reasoning': [
    'A train running at the speed of 60 km/hr crosses a pole in 9 seconds. What is the length of the train in meters?',
    'If 12 men or 18 women can do a piece of work in 14 days, how many days will 8 men and 16 women take to complete the work?'
  ]
};

export default function InterviewPrepPage() {
  const toast = useToast();
  const [selectedTrack, setSelectedTrack] = useState('Technical Core');
  const [activeModal, setActiveModal] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [answersHistory, setAnswersHistory] = useState([]);
  const [evaluating, setEvaluating] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const prepModules = [
    {
      title: 'Technical Core',
      description: 'Master OS, DBMS, Computer Networks, and System Design concepts.',
      icon: <Code size={24} />,
      progress: 75,
    },
    {
      title: 'HR & Behavioral',
      description: 'Prepare for culture fit, situation-based questions, and the STAR method.',
      icon: <Users size={24} />,
      progress: 60,
    },
    {
      title: 'Aptitude & Reasoning',
      description: 'Brush up on quantitative aptitude, logical reasoning, and time management.',
      icon: <BookOpen size={24} />,
      progress: 85,
    }
  ];

  const handleStartModal = (trackTitle) => {
    setSelectedTrack(trackTitle);
    setCurrentQuestionIndex(0);
    setUserAnswer('');
    setAnswersHistory([]);
    setFeedback(null);
    setActiveModal(true);
  };

  const questions = TRACK_QUESTIONS[selectedTrack] || TRACK_QUESTIONS['Technical Core'];

  const handleEvaluate = async () => {
    if (!userAnswer.trim()) {
      toast.error('Please write an answer before submitting for AI review');
      return;
    }

    setEvaluating(true);
    const updatedAnswers = [
      ...answersHistory,
      { question: questions[currentQuestionIndex], answer: userAnswer }
    ];
    setAnswersHistory(updatedAnswers);

    try {
      const res = await api.post('/ai/interview/submit', { 
        track: selectedTrack, 
        answers: updatedAnswers 
      });

      if (res.data?.data) {
        setFeedback(res.data.data);
        toast.success('AI Interview evaluation generated');
      }
    } catch (err) {
      toast.error('Evaluation failed: ' + (err.response?.data?.message || err.message));
    } finally {
      setEvaluating(false);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setUserAnswer('');
      setFeedback(null);
    } else {
      toast.info('Completed all questions for this track session!');
    }
  };

  return (
    <div className={styles.prepContainer}>
      <div className={styles.header}>
        <div className={styles.titleBox}>
          <h1>Interview Preparation Hub & AI Simulator</h1>
          <p>Real-time conversational mock interviews, structured behavioral scoring, and core placement subject diagnostics.</p>
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
              <span>Readiness Progress</span>
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
          <div style={{ backgroundColor: '#0b1120', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '20px', padding: '24px', width: '100%', maxWidth: '700px', display: 'flex', flexDirection: 'column', gap: '16px', color: '#f8fafc', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '12px', fontWeight: '800', color: '#a855f7', backgroundColor: 'rgba(168,85,247,0.15)', padding: '4px 12px', borderRadius: '12px' }}>
                🎤 AI MOCK INTERVIEW — {selectedTrack.toUpperCase()}
              </span>
              <span style={{ fontSize: '13px', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '6px' }}>
                Question {currentQuestionIndex + 1} of {questions.length}
              </span>
            </div>

            <div style={{ backgroundColor: '#1e293b', padding: '16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)' }}>
              <h4 style={{ fontSize: '14px', fontWeight: '700', margin: '0 0 8px 0', color: '#38bdf8' }}>Question {currentQuestionIndex + 1}:</h4>
              <p style={{ fontSize: '15px', margin: 0, lineHeight: 1.5, color: '#f1f5f9', fontWeight: '500' }}>
                {questions[currentQuestionIndex]}
              </p>
            </div>

            <div>
              <label style={{ fontSize: '12px', color: '#94a3b8', display: 'block', marginBottom: '6px' }}>Your Structured Technical Response:</label>
              <textarea
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                placeholder="Structure your answer with clear points, real-world examples, and complexity/tradeoffs..."
                style={{ width: '100%', backgroundColor: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '12px', color: '#fff', fontSize: '14px', minHeight: '120px', fontFamily: 'inherit' }}
              />
            </div>

            {feedback && (
              <div style={{ backgroundColor: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: '12px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#34d399', fontWeight: '700', fontSize: '15px' }}>
                    <CheckCircle size={18} /> Performance Score: {feedback.score}/100
                  </span>
                  <span style={{ fontSize: '11px', color: '#94a3b8', background: 'rgba(255,255,255,0.05)', padding: '2px 8px', borderRadius: '4px' }}>
                    Track: {feedback.track}
                  </span>
                </div>
                <p style={{ fontSize: '13px', color: '#e2e8f0', margin: 0 }}>{feedback.summary}</p>
                
                {feedback.strengths?.length > 0 && (
                  <div>
                    <strong style={{ fontSize: '12px', color: '#38bdf8' }}>Strengths:</strong>
                    <ul style={{ margin: '4px 0 0 16px', padding: 0, fontSize: '12px', color: '#cbd5e1' }}>
                      {feedback.strengths.map((st, i) => <li key={i}>{st}</li>)}
                    </ul>
                  </div>
                )}

                {feedback.areasForImprovement?.length > 0 && (
                  <div>
                    <strong style={{ fontSize: '12px', color: '#f59e0b' }}>Key Action Items:</strong>
                    <ul style={{ margin: '4px 0 0 16px', padding: 0, fontSize: '12px', color: '#cbd5e1' }}>
                      {feedback.areasForImprovement.map((ai, i) => <li key={i}>{ai}</li>)}
                    </ul>
                  </div>
                )}
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
              <button onClick={() => setActiveModal(false)} style={{ backgroundColor: 'transparent', border: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8', padding: '10px 18px', borderRadius: '10px', cursor: 'pointer' }}>Close Session</button>
              
              <div style={{ display: 'flex', gap: '10px' }}>
                {feedback && currentQuestionIndex < questions.length - 1 && (
                  <button onClick={handleNextQuestion} style={{ backgroundColor: '#10b981', color: '#fff', border: 'none', padding: '10px 18px', borderRadius: '10px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    Next Question <ArrowRight size={14} />
                  </button>
                )}
                <button onClick={handleEvaluate} disabled={evaluating} style={{ backgroundColor: '#6366f1', color: '#fff', border: 'none', padding: '10px 22px', borderRadius: '10px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Sparkles size={14} />
                  {evaluating ? 'Evaluating...' : 'Evaluate Answer'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
