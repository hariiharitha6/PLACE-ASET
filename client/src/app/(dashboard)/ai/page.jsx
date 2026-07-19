'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Brain, 
  Sparkles, 
  TrendingUp, 
  Clock, 
  AlertTriangle, 
  ArrowRight, 
  BookOpen, 
  FileText, 
  Search, 
  RefreshCw, 
  CheckCircle,
  FileImage,
  Award
} from 'lucide-react';
import { useToast } from '../../../context/ToastContext';
import axios from 'axios';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend
} from 'recharts';

export default function AIDashboardPage() {
  const router = useRouter();
  const toast = useToast();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isComputing, setIsComputing] = useState(false);
  const [selectedQuestionId, setSelectedQuestionId] = useState('');
  const [similarQuestions, setSimilarQuestions] = useState([]);
  const [similarityLoading, setSimilarityLoading] = useState(false);

  // Fetch consolidated AI Dashboard metrics
  const fetchAIDashboard = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const token = localStorage.getItem('token') || '';
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1'}/ai/dashboard`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        setData(response.data.data);
      } else {
        setError(response.data.error || 'Failed to retrieve AI dashboard data');
      }
    } catch (err) {
      console.error(err);
      setError('Connection to backend failed. Please verify Supabase credentials.');
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    fetchAIDashboard();
  }, []);

  // Handle manual profile re-computation
  const handleRecompute = async () => {
    setIsComputing(true);
    try {
      const token = localStorage.getItem('token') || '';
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1'}/ai/profile/compute`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        toast.open('success', 'Profile analyzed successfully! Mastery scores and weak topics updated.');
        await fetchAIDashboard(true);
      } else {
        toast.open('error', response.data.error || 'Failed to recompute profile');
      }
    } catch (err) {
      console.error(err);
      toast.open('error', 'Failed to connect to analytics engine');
    } finally {
      setIsComputing(false);
    }
  };

  // Record action on recommendations
  const handleRecommendationAction = async (recId, action, targetUrl) => {
    try {
      const token = localStorage.getItem('token') || '';
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1'}/ai/recommendations/action`, {
        recommendationId: recId,
        action
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      router.push(targetUrl);
    } catch (err) {
      console.error(err);
      router.push(targetUrl); // Fallback redirection if logging fails
    }
  };

  // Search similar questions
  const handleSimilarSearch = async () => {
    if (!selectedQuestionId) return;
    setSimilarityLoading(true);
    try {
      const token = localStorage.getItem('token') || '';
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1'}/ai/similar/${selectedQuestionId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        setSimilarQuestions(response.data.data);
        if (response.data.data.length === 0) {
          toast.open('info', 'No matching similar questions found in bank.');
        }
      }
    } catch (err) {
      console.error(err);
      toast.open('error', 'Error scanning database for similarities');
    } finally {
      setSimilarityLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh', flexDirection: 'column', gap: '16px' }}>
        <RefreshCw className="animate-spin" size={48} style={{ color: 'var(--accent-color)' }} />
        <p style={{ color: 'var(--text-secondary)' }}>Loading AI Intelligence reports...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '24px', backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)', textAlign: 'center' }}>
        <AlertTriangle size={48} style={{ color: '#ef4444', margin: '0 auto 16px auto' }} />
        <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '8px' }}>AI Engine Connection Failed</h3>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '16px' }}>{error}</p>
        <button onClick={() => fetchAIDashboard()} className="btn btn-primary" style={{ padding: '8px 16px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--accent-color)', color: '#fff', border: 'none', cursor: 'pointer' }}>
          Retry Connection
        </button>
      </div>
    );
  }

  const profile = data?.profile || {};
  const recommendations = data?.recommendations || [];
  const studyPath = data?.studyPath || [];
  const ocrJobsCount = data?.ocrJobsCount || 0;

  // Prepare chart data based on mastery or mock defaults if none exists yet
  const chartData = [
    { subject: 'Quantitative Aptitude', A: profile.topic_accuracy?.['Quantitative Aptitude'] * 100 || 60, fullMark: 100 },
    { subject: 'Logical Reasoning', A: profile.topic_accuracy?.['Logical Reasoning'] * 100 || 75, fullMark: 100 },
    { subject: 'Verbal Aptitude', A: profile.topic_accuracy?.['Verbal Aptitude'] * 100 || 80, fullMark: 100 },
    { subject: 'Technical Aptitude', A: profile.topic_accuracy?.['Technical Aptitude'] * 100 || 55, fullMark: 100 },
    { subject: 'OOP Concepts', A: profile.topic_accuracy?.['OOP Concepts'] * 100 || 70, fullMark: 100 },
    { subject: 'DSA', A: profile.topic_accuracy?.['Data Structures & Algorithms'] * 100 || 45, fullMark: 100 },
  ];

  const weakTopicsList = profile.weak_topics || ['Data Structures & Algorithms', 'Technical Aptitude'];
  const strongTopicsList = profile.strong_topics || ['Verbal Aptitude', 'Logical Reasoning'];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Brain size={32} style={{ color: 'var(--accent-color)' }} />
            AI Recommendation Engine & Dashboard
          </h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>
            Personalized study paths, predictive weak topic flags, and question similarity analysis.
          </p>
        </div>

        <button 
          onClick={handleRecompute}
          disabled={isComputing}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '12px 20px',
            backgroundColor: 'var(--bg-glass)',
            border: '1px solid var(--border-accent)',
            borderRadius: 'var(--radius-md)',
            color: 'var(--text-primary)',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all var(--transition-fast)'
          }}
          onMouseOver={(e) => { e.currentTarget.style.backgroundColor = 'var(--bg-glass-hover)'; }}
          onMouseOut={(e) => { e.currentTarget.style.backgroundColor = 'var(--bg-glass)'; }}
        >
          <RefreshCw className={isComputing ? 'animate-spin' : ''} size={18} />
          {isComputing ? 'Analyzing Metrics...' : 'Run Analytics Sync'}
        </button>
      </div>

      {/* Mastery & Telemetry Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
        {/* Mastery Radial Score Card */}
        <div style={{
          backgroundColor: 'var(--bg-secondary)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-color)',
          padding: '24px',
          display: 'flex',
          alignItems: 'center',
          gap: '24px'
        }}>
          <div style={{
            width: '90px',
            height: '90px',
            borderRadius: '50%',
            background: `conic-gradient(var(--accent-color) ${profile.mastery_score * 3.6 || 36}deg, var(--bg-primary) 0deg)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative'
          }}>
            <div style={{
              width: '74px',
              height: '74px',
              borderRadius: '50%',
              backgroundColor: 'var(--bg-secondary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '20px',
              fontWeight: '800'
            }}>
              {profile.mastery_score || 10}%
            </div>
          </div>
          <div>
            <h3 style={{ fontSize: '15px', color: 'var(--text-secondary)', fontWeight: '600' }}>Mastery Index</h3>
            <p style={{ fontSize: '22px', fontWeight: '800', marginTop: '4px' }}>Level {profile.level || 1} Scholar</p>
            <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Calculated against accuracy metrics</span>
          </div>
        </div>

        {/* Learning Velocity Card */}
        <div style={{
          backgroundColor: 'var(--bg-secondary)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-color)',
          padding: '24px',
          display: 'flex',
          alignItems: 'center',
          gap: '20px'
        }}>
          <div style={{
            padding: '16px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            color: '#3b82f6'
          }}>
            <TrendingUp size={28} />
          </div>
          <div>
            <h3 style={{ fontSize: '15px', color: 'var(--text-secondary)', fontWeight: '600' }}>Learning Velocity</h3>
            <p style={{ fontSize: '24px', fontWeight: '800', marginTop: '4px' }}>{profile.learning_velocity || 1.0} Qs/day</p>
            <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Average progress speed last 7 days</span>
          </div>
        </div>

        {/* Practice Frequency Card */}
        <div style={{
          backgroundColor: 'var(--bg-secondary)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-color)',
          padding: '24px',
          display: 'flex',
          alignItems: 'center',
          gap: '20px'
        }}>
          <div style={{
            padding: '16px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            color: '#10b981'
          }}>
            <Clock size={28} />
          </div>
          <div>
            <h3 style={{ fontSize: '15px', color: 'var(--text-secondary)', fontWeight: '600' }}>Practice Speed</h3>
            <p style={{ fontSize: '24px', fontWeight: '800', marginTop: '4px' }}>{profile.average_response_time || 0}s avg</p>
            <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Response latency per solved question</span>
          </div>
        </div>
      </div>

      {/* Skills Analysis & Weak Topics Flags */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', lg: 'repeat(2, 1fr)', gap: '24px', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: '24px' }}>
          {/* Recharts Radar Chart */}
          <div style={{
            flex: '1 1 500px',
            backgroundColor: 'var(--bg-secondary)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border-color)',
            padding: '24px',
            minHeight: '350px'
          }}>
            <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Award size={20} style={{ color: 'var(--accent-color)' }} />
              Aptitude Profile Radar
            </h3>
            <div style={{ width: '100%', height: '280px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
                  <PolarGrid stroke="var(--border-color)" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: 'var(--text-secondary)', fontSize: 11 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: 'var(--text-secondary)' }} />
                  <Radar name="Accuracy %" dataKey="A" stroke="var(--accent-color)" fill="var(--accent-color)" fillOpacity={0.25} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Weak & Strong Topics Listing */}
          <div style={{
            flex: '1 1 400px',
            backgroundColor: 'var(--bg-secondary)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border-color)',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '24px'
          }}>
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px', color: '#ef4444' }}>
                <AlertTriangle size={20} />
                Weak Topics Flagged ({weakTopicsList.length})
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '16px' }}>
                Topics below 60% accuracy. We recommend targeting these immediately.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {weakTopicsList.map((topic, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', backgroundColor: 'rgba(239, 68, 68, 0.05)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                    <span style={{ fontWeight: '600', fontSize: '14px' }}>{topic}</span>
                    <span style={{ fontSize: '12px', color: '#ef4444', backgroundColor: 'rgba(239, 68, 68, 0.1)', padding: '2px 8px', borderRadius: '12px', fontWeight: '700' }}>
                      Needs Practice
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px', color: '#10b981' }}>
                <CheckCircle size={20} />
                Strong Topics Mastered ({strongTopicsList.length})
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '16px' }}>
                Highly optimized categories with 80%+ accuracy rates. Excellent job!
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {strongTopicsList.map((topic, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', backgroundColor: 'rgba(16, 185, 129, 0.05)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                    <span style={{ fontWeight: '600', fontSize: '14px' }}>{topic}</span>
                    <span style={{ fontSize: '12px', color: '#10b981', backgroundColor: 'rgba(16, 185, 129, 0.1)', padding: '2px 8px', borderRadius: '12px', fontWeight: '700' }}>
                      Proficient
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Personalized Study Path Timeline */}
      {studyPath.length > 0 && (
        <div style={{
          backgroundColor: 'var(--bg-secondary)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-color)',
          padding: '24px'
        }}>
          <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sparkles size={20} style={{ color: 'var(--accent-color)' }} />
            Personalized Study Milestones Path
          </h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', position: 'relative', paddingLeft: '16px' }}>
            <div style={{ position: 'absolute', left: '7px', top: '10px', bottom: '10px', width: '2px', backgroundColor: 'var(--border-color)' }} />
            
            {studyPath.map((step, i) => (
              <div key={i} style={{ position: 'relative', display: 'flex', gap: '16px', flexDirection: 'column', paddingBottom: '16px' }}>
                <div style={{
                  position: 'absolute',
                  left: '-14px',
                  top: '4px',
                  width: '12px',
                  height: '12px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--accent-color)',
                  border: '3px solid var(--bg-secondary)',
                  zIndex: 2
                }} />
                
                <div>
                  <h4 style={{ fontWeight: '700', fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    Milestone {step.step}: Master {step.topic}
                    <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 'normal' }}>({step.relevance})</span>
                  </h4>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginTop: '4px' }}>
                    Solve target questions sequentially to unlock this milestone:
                  </p>
                </div>

                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                  {step.targetQuestions.map((q, idx) => (
                    <div 
                      key={idx}
                      onClick={() => router.push(`/questions/${q.id}`)}
                      style={{
                        padding: '10px 16px',
                        backgroundColor: 'var(--bg-primary)',
                        border: '1px solid var(--border-color)',
                        borderRadius: 'var(--radius-md)',
                        fontSize: '13px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        transition: 'all var(--transition-fast)'
                      }}
                      onMouseOver={(e) => { e.currentTarget.style.borderColor = 'var(--accent-color)'; }}
                      onMouseOut={(e) => { e.currentTarget.style.borderColor = 'var(--border-color)'; }}
                    >
                      <span style={{
                        textTransform: 'uppercase',
                        fontSize: '10px',
                        fontWeight: '800',
                        color: q.difficulty === 'easy' ? '#10b981' : q.difficulty === 'medium' ? '#f59e0b' : '#ef4444'
                      }}>
                        {q.difficulty}
                      </span>
                      <span style={{ fontWeight: '500' }}>
                        {q.statement.length > 50 ? `${q.statement.substring(0, 50)}...` : q.statement}
                      </span>
                      <ArrowRight size={14} style={{ marginLeft: 'auto', color: 'var(--text-secondary)' }} />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* AI Recommendations Grid */}
      <div>
        <h2 style={{ fontSize: '20px', fontWeight: '800', marginBottom: '16px' }}>AI Recommended Materials</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
          {recommendations.length === 0 ? (
            <p style={{ color: 'var(--text-secondary)' }}>No recommendations generated yet. Practice more questions to enable customization!</p>
          ) : (
            recommendations.map((rec) => (
              <div 
                key={rec.id}
                style={{
                  backgroundColor: 'var(--bg-secondary)',
                  borderRadius: 'var(--radius-lg)',
                  border: '1px solid var(--border-color)',
                  padding: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  transition: 'all var(--transition-normal)'
                }}
                className="hover-card"
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{
                    fontSize: '11px',
                    fontWeight: '700',
                    textTransform: 'uppercase',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    color: '#3b82f6',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}>
                    {rec.item_type === 'question' ? <BookOpen size={12} /> : <FileText size={12} />}
                    {rec.item_type}
                  </span>
                  
                  <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--accent-color)' }}>
                    {Math.round(rec.confidence_score * 100)}% Match
                  </span>
                </div>

                <p style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)', minHeight: '40px' }}>
                  {rec.reason}
                </p>

                <button
                  onClick={() => handleRecommendationAction(
                    rec.id, 
                    'click', 
                    rec.item_type === 'question' ? `/questions/${rec.item_id}` : `/resources`
                  )}
                  style={{
                    marginTop: 'auto',
                    width: '100%',
                    padding: '10px',
                    backgroundColor: 'var(--bg-primary)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-md)',
                    color: 'var(--text-primary)',
                    fontWeight: '600',
                    fontSize: '13px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    transition: 'all var(--transition-fast)'
                  }}
                  onMouseOver={(e) => { e.currentTarget.style.backgroundColor = 'var(--accent-color)'; e.currentTarget.style.color = '#fff'; }}
                  onMouseOut={(e) => { e.currentTarget.style.backgroundColor = 'var(--bg-primary)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
                >
                  View Recommendation
                  <ArrowRight size={14} />
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Similar Question Detector & OCR Indicators */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', lg: 'repeat(2, 1fr)', gap: '24px', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: '24px' }}>
          
          {/* Similar Question Detector Widget */}
          <div style={{
            flex: '1 1 450px',
            backgroundColor: 'var(--bg-secondary)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border-color)',
            padding: '24px'
          }}>
            <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Search size={20} style={{ color: 'var(--accent-color)' }} />
              Similar Question Lookup (Embedding Search)
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '16px' }}>
              Select an item to scan for duplicates or similar structures using vector similarity.
            </p>
            
            <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
              <select 
                value={selectedQuestionId} 
                onChange={(e) => setSelectedQuestionId(e.target.value)}
                style={{
                  flex: 1,
                  padding: '10px',
                  backgroundColor: 'var(--bg-primary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                  color: 'var(--text-primary)'
                }}
              >
                <option value="">-- Choose question --</option>
                {recommendations.filter(r => r.item_type === 'question').map((r) => (
                  <option key={r.item_id} value={r.item_id}>
                    {r.reason.substring(0, 60)}...
                  </option>
                ))}
              </select>

              <button 
                onClick={handleSimilarSearch}
                disabled={similarityLoading || !selectedQuestionId}
                className="btn"
                style={{
                  padding: '10px 20px',
                  backgroundColor: 'var(--accent-color)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 'var(--radius-md)',
                  cursor: 'pointer',
                  fontWeight: '600'
                }}
              >
                {similarityLoading ? 'Scanning...' : 'Scan Similarity'}
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {similarQuestions.map((match, idx) => (
                <div 
                  key={idx}
                  onClick={() => router.push(`/questions/${match.question.id}`)}
                  style={{
                    padding: '12px',
                    backgroundColor: 'var(--bg-primary)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-color)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    cursor: 'pointer',
                    fontSize: '13px'
                  }}
                >
                  <span style={{ fontWeight: '500' }}>
                    {match.question.statement.length > 60 ? `${match.question.statement.substring(0, 60)}...` : match.question.statement}
                  </span>
                  <span style={{
                    fontWeight: '800',
                    color: 'var(--accent-color)',
                    backgroundColor: 'rgba(59, 130, 246, 0.05)',
                    padding: '2px 8px',
                    borderRadius: '4px'
                  }}>
                    {Math.round(match.similarity * 100)}% Sim
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* OCR Uploads Queue Indicator */}
          <div style={{
            flex: '1 1 350px',
            backgroundColor: 'var(--bg-secondary)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border-color)',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            textAlign: 'center',
            gap: '12px'
          }}>
            <div style={{
              padding: '20px',
              borderRadius: '50%',
              backgroundColor: 'rgba(168, 85, 247, 0.1)',
              color: '#a855f7',
              marginBottom: '8px'
            }}>
              <FileImage size={40} />
            </div>
            
            <h3 style={{ fontSize: '18px', fontWeight: '700' }}>OCR Extract Queue Status</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '13px', maxWidth: '300px' }}>
              Your community uploads scanned via OCR technology. Approved drafts enter the Question Bank.
            </p>

            <div style={{
              padding: '8px 24px',
              borderRadius: '24px',
              backgroundColor: 'var(--bg-primary)',
              border: '1px solid var(--border-color)',
              fontWeight: '700',
              fontSize: '14px',
              marginTop: '8px'
            }}>
              {ocrJobsCount} OCR Jobs Completed
            </div>

            <button 
              onClick={() => router.push('/community/upload')}
              className="btn btn-secondary"
              style={{
                marginTop: '12px',
                padding: '10px 20px',
                backgroundColor: 'var(--bg-glass)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--text-primary)',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              Upload Submission Image
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
