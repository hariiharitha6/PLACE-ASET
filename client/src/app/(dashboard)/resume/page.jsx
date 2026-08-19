'use client';

import { useState, useRef, useEffect } from 'react';
import styles from './resume.module.css';
import { useAuth } from '../../../context/AuthContext';
import { useToast } from '../../../context/ToastContext';
import { Printer, Eye, Sparkles, CheckCircle, Download, FileText, Plus, Trash2 } from 'lucide-react';
import api from '../../../lib/api';

export default function ResumeBuilderPage() {
  const { user } = useAuth();
  const toast = useToast();
  const printRef = useRef(null);

  const [selectedTemplate, setSelectedTemplate] = useState('modern');
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);

  const [resumeData, setResumeData] = useState({
    personal: {
      fullName: '',
      email: '',
      phone: '',
      linkedin: '',
      github: '',
    },
    education: [
      {
        institution: 'Ahalia School of Engineering and Technology',
        degree: 'B.Tech in Computer Science & Engineering',
        duration: '2022 - 2026',
        gpa: '8.8 / 10'
      }
    ],
    experience: [
      {
        company: 'Software Engineering Placement Track',
        role: 'Full-Stack Developer Intern',
        duration: '2025 - Present',
        description: 'Engineered RESTful APIs, optimized SQL queries, and built responsive web applications with TypeScript and Next.js.'
      }
    ],
    projects: [
      {
        name: 'PLACE@ASET Competitive Learning Platform',
        tech: 'Next.js, Node.js, Express, Supabase, AI Engine',
        description: 'Developed an enterprise learning management and competitive placement assessment system with multi-tenant RBAC.'
      }
    ],
    skills: 'JavaScript, TypeScript, React, Next.js, Node.js, Express, PostgreSQL, Supabase, Python, C++, Data Structures, Algorithms, REST APIs'
  });

  useEffect(() => {
    if (user) {
      setResumeData(prev => ({
        ...prev,
        personal: {
          ...prev.personal,
          fullName: user.full_name || prev.personal.fullName || 'Candidate Name',
          email: user.email || prev.personal.email || 'student@aset.ac.in',
        }
      }));
    }
  }, [user]);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadDoc = () => {
    const textContent = `
${resumeData.personal.fullName.toUpperCase()}
Email: ${resumeData.personal.email} | Phone: ${resumeData.personal.phone}
LinkedIn: ${resumeData.personal.linkedin} | GitHub: ${resumeData.personal.github}

==================================================
EDUCATION
==================================================
${resumeData.education.map(e => `${e.institution} - ${e.degree} (${e.duration}) | GPA: ${e.gpa}`).join('\n')}

==================================================
EXPERIENCE & INTERNSHIPS
==================================================
${resumeData.experience.map(e => `${e.company} - ${e.role} (${e.duration})\n${e.description}`).join('\n\n')}

==================================================
PROJECTS
==================================================
${resumeData.projects.map(p => `${p.name} [${p.tech}]\n${p.description}`).join('\n\n')}

==================================================
TECHNICAL SKILLS
==================================================
${resumeData.skills}
    `.trim();

    const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${(resumeData.personal.fullName || 'Candidate').replace(/\s+/g, '_')}_Placement_Resume.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success('Resume file downloaded successfully');
  };

  const handleAIScore = async () => {
    setAnalyzing(true);
    try {
      const res = await api.post('/ai/resume/score', { template: selectedTemplate, sections: resumeData });
      if (res.data?.data) {
        setAiAnalysis(res.data.data);
        toast.success('AI ATS Resume Analysis complete');
      }
    } catch (err) {
      toast.error('AI resume scoring encountered an issue: ' + (err.response?.data?.message || err.message));
    } finally {
      setAnalyzing(false);
    }
  };

  const addEducation = () => {
    setResumeData(prev => ({
      ...prev,
      education: [...prev.education, { institution: 'Institution', degree: 'Degree', duration: 'Year', gpa: 'CGPA' }]
    }));
  };

  const addExperience = () => {
    setResumeData(prev => ({
      ...prev,
      experience: [...prev.experience, { company: 'Company Name', role: 'Role Title', duration: 'Duration', description: 'Key accomplishments and metrics.' }]
    }));
  };

  const addProject = () => {
    setResumeData(prev => ({
      ...prev,
      projects: [...prev.projects, { name: 'Project Title', tech: 'Tech Stack', description: 'Brief summary of features and impact.' }]
    }));
  };

  return (
    <div className={styles.resumeContainer}>
      <div className={styles.headerRow}>
        <div className={styles.titleBox}>
          <h1>ATS-Optimized AI Placement Resume Builder</h1>
          <p>Real-time AI ATS keyword alignment, layout templates, and automated technical evaluation for campus placements.</p>
        </div>
        <div className={styles.actions}>
          <button onClick={handleAIScore} disabled={analyzing} style={{ backgroundColor: '#6366f1', color: '#fff', border: 'none', padding: '10px 18px', borderRadius: '10px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.2s' }}>
            <Sparkles size={16} /> {analyzing ? 'Analyzing with AI...' : 'Run AI ATS Score'}
          </button>
          <button className={styles.previewBtn} onClick={handleDownloadDoc} title="Download Text/Doc Format">
            <Download size={16} /> Export File
          </button>
          <button className={styles.exportBtn} onClick={handlePrint} title="Print or Save as PDF">
            <Printer size={16} /> Print / Save PDF
          </button>
        </div>
      </div>

      {/* Template Selector & AI Score Card */}
      <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', backgroundColor: '#0b1120', padding: '8px 14px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)' }}>
          <span style={{ fontSize: '12px', color: '#94a3b8', fontWeight: '600' }}>Template:</span>
          {['modern', 'tech-minimal', 'executive'].map((tmpl) => (
            <button
              key={tmpl}
              onClick={() => setSelectedTemplate(tmpl)}
              style={{
                backgroundColor: selectedTemplate === tmpl ? '#6366f1' : 'transparent',
                color: selectedTemplate === tmpl ? '#fff' : '#94a3b8',
                border: 'none',
                padding: '6px 12px',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: '700',
                cursor: 'pointer',
                textTransform: 'capitalize',
              }}
            >
              {tmpl.replace('-', ' ')}
            </button>
          ))}
        </div>

        {aiAnalysis && (
          <div style={{ backgroundColor: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', color: '#34d399', padding: '8px 16px', borderRadius: '12px', fontSize: '13px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <CheckCircle size={16} /> Overall Score: {aiAnalysis.overallScore}/100 | ATS Match: {aiAnalysis.atsMatch || '90%'} | Impact: {aiAnalysis.impactScore || 85}/100
          </div>
        )}
      </div>

      {aiAnalysis?.suggestions && (
        <div style={{ padding: '14px 18px', borderRadius: '12px', background: 'rgba(99, 102, 241, 0.05)', border: '1px solid rgba(99, 102, 241, 0.2)', fontSize: '12px', color: '#cbd5e1' }}>
          <strong style={{ color: '#818cf8', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
            <Sparkles size={14} /> AI Improvement Recommendations:
          </strong>
          <ul style={{ margin: '0 0 0 18px', padding: 0, display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {aiAnalysis.suggestions.map((sug, i) => (
              <li key={i}>{sug}</li>
            ))}
          </ul>
          {aiAnalysis.missingKeywords?.length > 0 && (
            <div style={{ marginTop: '8px', display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap' }}>
              <span style={{ color: '#f59e0b', fontWeight: '600' }}>Missing High-Yield Keywords:</span>
              {aiAnalysis.missingKeywords.map((kw, i) => (
                <span key={i} style={{ padding: '2px 8px', borderRadius: '4px', background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24', fontSize: '11px' }}>
                  +{kw}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      <div className={styles.mainGrid}>
        {/* Editor Panel */}
        <div className={styles.formSection}>
          <div className={styles.sectionHeader}>
            <h3>Personal Information</h3>
          </div>
          <div className={styles.formGroup}>
            <label>Full Name</label>
            <input 
              type="text" 
              value={resumeData.personal.fullName}
              onChange={(e) => setResumeData({...resumeData, personal: {...resumeData.personal, fullName: e.target.value}})}
              placeholder="Candidate Full Name"
            />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className={styles.formGroup}>
              <label>Email</label>
              <input 
                type="email" 
                value={resumeData.personal.email}
                onChange={(e) => setResumeData({...resumeData, personal: {...resumeData.personal, email: e.target.value}})}
              />
            </div>
            <div className={styles.formGroup}>
              <label>Phone</label>
              <input 
                type="text" 
                value={resumeData.personal.phone}
                onChange={(e) => setResumeData({...resumeData, personal: {...resumeData.personal, phone: e.target.value}})}
                placeholder="+91 9876543210"
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className={styles.formGroup}>
              <label>LinkedIn</label>
              <input 
                type="text" 
                value={resumeData.personal.linkedin}
                onChange={(e) => setResumeData({...resumeData, personal: {...resumeData.personal, linkedin: e.target.value}})}
                placeholder="linkedin.com/in/username"
              />
            </div>
            <div className={styles.formGroup}>
              <label>GitHub</label>
              <input 
                type="text" 
                value={resumeData.personal.github}
                onChange={(e) => setResumeData({...resumeData, personal: {...resumeData.personal, github: e.target.value}})}
                placeholder="github.com/username"
              />
            </div>
          </div>

          <div className={styles.sectionHeader} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3>Education</h3>
            <button type="button" onClick={addEducation} style={{ background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-primary)', padding: '4px 10px', borderRadius: '6px', fontSize: '11px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Plus size={12} /> Add
            </button>
          </div>
          {resumeData.education.map((edu, idx) => (
            <div key={idx} style={{ padding: '12px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid var(--border-color)', marginBottom: '10px' }}>
              <input 
                type="text" 
                placeholder="Institution Name"
                value={edu.institution}
                onChange={(e) => {
                  const updated = [...resumeData.education];
                  updated[idx].institution = e.target.value;
                  setResumeData({...resumeData, education: updated});
                }}
                style={{ width: '100%', marginBottom: '8px' }}
              />
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '8px' }}>
                <input 
                  type="text" 
                  placeholder="Degree"
                  value={edu.degree}
                  onChange={(e) => {
                    const updated = [...resumeData.education];
                    updated[idx].degree = e.target.value;
                    setResumeData({...resumeData, education: updated});
                  }}
                />
                <input 
                  type="text" 
                  placeholder="Duration"
                  value={edu.duration}
                  onChange={(e) => {
                    const updated = [...resumeData.education];
                    updated[idx].duration = e.target.value;
                    setResumeData({...resumeData, education: updated});
                  }}
                />
                <input 
                  type="text" 
                  placeholder="GPA"
                  value={edu.gpa}
                  onChange={(e) => {
                    const updated = [...resumeData.education];
                    updated[idx].gpa = e.target.value;
                    setResumeData({...resumeData, education: updated});
                  }}
                />
              </div>
            </div>
          ))}

          <div className={styles.sectionHeader} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3>Technical Skills</h3>
          </div>
          <div className={styles.formGroup}>
            <label>Comma-separated keywords (DSA, Frameworks, Languages, Databases, Tools)</label>
            <textarea 
              rows={3} 
              value={resumeData.skills}
              onChange={(e) => setResumeData({...resumeData, skills: e.target.value})}
            />
          </div>
        </div>

        {/* Live Preview Paper Panel */}
        <div className={styles.previewSection} ref={printRef}>
          <div className={styles.paper} style={{ borderTop: selectedTemplate === 'executive' ? '4px solid #a855f7' : selectedTemplate === 'tech-minimal' ? '4px solid #10b981' : '4px solid #6366f1' }}>
            <div className={styles.paperHeader}>
              <h2>{resumeData.personal.fullName || 'Candidate Name'}</h2>
              <p className={styles.contactLine}>
                {resumeData.personal.email} {resumeData.personal.phone ? `| ${resumeData.personal.phone}` : ''} {resumeData.personal.linkedin ? `| ${resumeData.personal.linkedin}` : ''} {resumeData.personal.github ? `| ${resumeData.personal.github}` : ''}
              </p>
            </div>

            <div className={styles.paperSection}>
              <h4>EDUCATION</h4>
              {resumeData.education.map((edu, idx) => (
                <div key={idx} className={styles.paperItem}>
                  <div className={styles.itemTitleRow}>
                    <strong>{edu.institution}</strong>
                    <span>{edu.duration}</span>
                  </div>
                  <div>{edu.degree} — GPA: {edu.gpa}</div>
                </div>
              ))}
            </div>

            <div className={styles.paperSection}>
              <h4>EXPERIENCE & INTERNSHIPS</h4>
              {resumeData.experience.map((exp, idx) => (
                <div key={idx} className={styles.paperItem}>
                  <div className={styles.itemTitleRow}>
                    <strong>{exp.company} — {exp.role}</strong>
                    <span>{exp.duration}</span>
                  </div>
                  <p>{exp.description}</p>
                </div>
              ))}
            </div>

            <div className={styles.paperSection}>
              <h4>PROJECTS</h4>
              {resumeData.projects.map((proj, idx) => (
                <div key={idx} className={styles.paperItem}>
                  <div className={styles.itemTitleRow}>
                    <strong>{proj.name}</strong>
                    <span style={{ fontSize: '11px', color: '#64748b' }}>{proj.tech}</span>
                  </div>
                  <p>{proj.description}</p>
                </div>
              ))}
            </div>

            <div className={styles.paperSection}>
              <h4>TECHNICAL SKILLS</h4>
              <p>{resumeData.skills}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
