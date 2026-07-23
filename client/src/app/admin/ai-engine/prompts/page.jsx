'use client';

import { useState, useEffect } from 'react';
import api from '../../../../lib/api';

export default function PromptTemplatesPage() {
  const [prompts, setPrompts] = useState([]);
  const [selectedKey, setSelectedKey] = useState('question_categorization');
  const [templateText, setTemplateText] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchPrompts();
  }, []);

  const fetchPrompts = async () => {
    try {
      const res = await api.get('/ai/prompts');
      const data = res.data?.data || res.data || [];
      setPrompts(data);
      if (data.length > 0) {
        setSelectedKey(data[0].key);
        setTemplateText(data[0].template_text);
      }
    } catch (e) {
      console.error(e);
      const fallback = [
        {
          key: 'question_categorization',
          title: 'Question Categorization & Tagging',
          description: 'Classifies questions into subject, topic, subtopic, company, and difficulty',
          template_text: 'Analyze statement: {{statement}}\nOptions: {{options}}',
          version: 2
        },
        {
          key: 'explanation_generation',
          title: 'Step-by-step Solution Generator',
          description: 'Generates detailed step-by-step explanations for technical questions',
          template_text: 'Explain solution for statement: {{statement}} with answer: {{correct_answer}}',
          version: 1
        }
      ];
      setPrompts(fallback);
      setTemplateText(fallback[0].template_text);
    }
  };

  const handleSelect = (p) => {
    setSelectedKey(p.key);
    setTemplateText(p.template_text);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put(`/ai/prompts/${selectedKey}`, { templateText });
      alert('Prompt template updated & version incremented successfully!');
      fetchPrompts();
    } catch (e) {
      alert('Failed to update prompt template');
    } finally {
      setSaving(false);
    }
  };

  const selectedPrompt = prompts.find(p => p.key === selectedKey);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <span style={{ fontSize: '11px', fontWeight: '800', color: '#06b6d4', backgroundColor: 'rgba(6,182,212,0.15)', padding: '4px 10px', borderRadius: '12px' }}>
          📝 AI PROMPT MANAGEMENT
        </span>
        <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#f8fafc', margin: '8px 0 4px 0' }}>System Prompt Templates & Versioning</h1>
        <p style={{ color: '#94a3b8', fontSize: '13px', margin: 0 }}>Manage system prompt templates used across OCR cleanup, categorization, solution generation, and AI Question Generation.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '24px' }}>
        <div style={{ backgroundColor: '#0b1120', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <span style={{ fontSize: '11px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', padding: '0 8px 8px 8px' }}>Prompt Templates</span>
          {prompts.map((p) => (
            <div
              key={p.key}
              onClick={() => handleSelect(p)}
              style={{
                padding: '12px',
                borderRadius: '8px',
                backgroundColor: selectedKey === p.key ? 'rgba(99,102,241,0.15)' : 'transparent',
                border: selectedKey === p.key ? '1px solid rgba(99,102,241,0.3)' : '1px solid transparent',
                cursor: 'pointer'
              }}
            >
              <h4 style={{ color: '#f8fafc', margin: '0 0 2px 0', fontSize: '13px', fontWeight: '600' }}>{p.title}</h4>
              <span style={{ fontSize: '11px', color: '#94a3b8' }}>Version: v{p.version || 1}</span>
            </div>
          ))}
        </div>

        <div style={{ backgroundColor: '#0b1120', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#f8fafc', margin: '0 0 4px 0' }}>{selectedPrompt?.title || 'Prompt Editor'}</h3>
            <p style={{ color: '#94a3b8', fontSize: '13px', margin: 0 }}>{selectedPrompt?.description}</p>
          </div>

          <div>
            <label style={{ fontSize: '12px', color: '#cbd5e1', display: 'block', marginBottom: '6px' }}>Template Text (Variables supported: &#123;&#123;statement&#125;&#125;, &#123;&#123;options&#125;&#125;, &#123;&#123;correct_answer&#125;&#125;)</label>
            <textarea
              rows={10}
              value={templateText}
              onChange={(e) => setTemplateText(e.target.value)}
              style={{ width: '100%', padding: '14px', borderRadius: '10px', backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', color: '#f8fafc', fontFamily: 'monospace', fontSize: '13px', lineHeight: 1.5 }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
            <button onClick={handleSave} disabled={saving} style={{ backgroundColor: '#6366f1', color: '#fff', padding: '10px 20px', borderRadius: '8px', border: 'none', fontWeight: '700', cursor: 'pointer', fontSize: '13px' }}>
              {saving ? 'Saving...' : '💾 Save Template & Increment Version'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
