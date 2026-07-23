'use client';

import { useState } from 'react';
import api from '../../../../lib/api';

export default function AIQuestionGeneratorPage() {
  const [form, setForm] = useState({
    subject: 'Data Structures & Algorithms',
    topic: 'Trees & Graphs',
    difficulty: 'medium',
    company: 'TCS Digital',
    count: 3,
  });
  const [loading, setLoading] = useState(false);
  const [generatedResult, setGeneratedResult] = useState(null);

  const [improveInput, setImproveInput] = useState('');
  const [improvedResult, setImprovedResult] = useState('');
  const [improving, setImproving] = useState(false);

  const handleGenerate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/ai/generate', form);
      setGeneratedResult(res.data?.data?.result?.text || JSON.stringify(res.data, null, 2));
    } catch (err) {
      alert(err.response?.data?.error || 'Generation failed');
    } finally {
      setLoading(false);
    }
  };

  const handleImprove = async () => {
    if (!improveInput) return;
    setImproving(true);
    try {
      const res = await api.post('/ai/improve', { statement: improveInput });
      setImprovedResult(res.data?.data?.improved || 'Improved text output');
    } catch (err) {
      alert('Improvement failed');
    } finally {
      setImproving(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <span style={{ fontSize: '11px', fontWeight: '800', color: '#f59e0b', backgroundColor: 'rgba(245,158,11,0.15)', padding: '4px 10px', borderRadius: '12px' }}>
          🤖 SYNTHETIC AI GENERATOR & IMPROVER
        </span>
        <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#f8fafc', margin: '8px 0 4px 0' }}>AI Question Generator & Question Improver</h1>
        <p style={{ color: '#94a3b8', fontSize: '13px', margin: 0 }}>Generate synthetic placement exam questions or refine existing raw question statements with AI.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        <div style={{ backgroundColor: '#0b1120', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#f8fafc', margin: 0 }}>⚡ AI Question Generator</h3>

          <form onSubmit={handleGenerate} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div>
              <label style={{ fontSize: '12px', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Subject</label>
              <input type="text" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '8px', backgroundColor: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: '13px' }} />
            </div>
            <div>
              <label style={{ fontSize: '12px', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Topic</label>
              <input type="text" value={form.topic} onChange={(e) => setForm({ ...form, topic: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '8px', backgroundColor: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: '13px' }} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '12px', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Target Company</label>
                <input type="text" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '8px', backgroundColor: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: '13px' }} />
              </div>
              <div>
                <label style={{ fontSize: '12px', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Difficulty</label>
                <select value={form.difficulty} onChange={(e) => setForm({ ...form, difficulty: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '8px', backgroundColor: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: '13px' }}>
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>
            </div>

            <button type="submit" disabled={loading} style={{ backgroundColor: '#6366f1', color: '#fff', padding: '12px', borderRadius: '8px', border: 'none', fontWeight: '700', cursor: 'pointer', marginTop: '8px' }}>
              {loading ? 'Generating...' : '✨ Generate Synthetic Questions'}
            </button>
          </form>

          {generatedResult && (
            <div style={{ backgroundColor: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
              <span style={{ fontSize: '11px', color: '#34d399', fontWeight: '700', display: 'block', marginBottom: '4px' }}>AI Generation Output:</span>
              <pre style={{ color: '#cbd5e1', fontSize: '12px', whiteSpace: 'pre-wrap', margin: 0 }}>{generatedResult}</pre>
            </div>
          )}
        </div>

        <div style={{ backgroundColor: '#0b1120', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#f8fafc', margin: 0 }}>🛠️ AI Question Statement Improver</h3>
          <p style={{ color: '#94a3b8', fontSize: '13px', margin: 0 }}>Paste a raw or draft question statement to fix grammar, formatting, and generate clear step-by-step solution explanations.</p>

          <textarea
            rows={5}
            value={improveInput}
            onChange={(e) => setImproveInput(e.target.value)}
            placeholder="Paste raw question statement..."
            style={{ width: '100%', padding: '12px', borderRadius: '8px', backgroundColor: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: '13px' }}
          />

          <button onClick={handleImprove} disabled={improving} style={{ backgroundColor: '#10b981', color: '#fff', padding: '12px', borderRadius: '8px', border: 'none', fontWeight: '700', cursor: 'pointer' }}>
            {improving ? 'Improving...' : '⚡ Refine & Improve Statement'}
          </button>

          {improvedResult && (
            <div style={{ backgroundColor: 'rgba(16,185,129,0.05)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(16,185,129,0.2)' }}>
              <span style={{ fontSize: '11px', color: '#34d399', fontWeight: '700', display: 'block', marginBottom: '4px' }}>Improved Result:</span>
              <p style={{ color: '#cbd5e1', fontSize: '13px', margin: 0, lineHeight: 1.4 }}>{improvedResult}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
