'use client';

import { useState, useEffect } from 'react';
import api from '../../../lib/api';

export default function DatasetUploadPage() {
  const [datasets, setDatasets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({
    name: '',
    source: 'Campus Drive 2026',
    company: 'TCS',
    department: 'CSE',
    subject: 'Data Structures & Algorithms',
    visibility: 'private',
    batch: '2022-2026',
    description: 'Raw exam questions for 19-Step AI Pipeline Processing',
    tags: 'C++, DSA, TCS, Aptitude',
  });
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  useEffect(() => {
    fetchDatasets();
  }, []);

  const fetchDatasets = async () => {
    try {
      const res = await api.get('/admin/datasets');
      setDatasets(res.data?.data || res.data || []);
    } catch (e) {
      console.error(e);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name) return;
    setUploading(true);

    try {
      await api.post('/admin/datasets/upload', {
        ...form,
        tags: form.tags.split(',').map(t => t.trim()),
      });
      setForm({
        name: '',
        source: 'Campus Drive 2026',
        company: 'TCS',
        department: 'CSE',
        subject: 'Data Structures & Algorithms',
        visibility: 'private',
        batch: '2022-2026',
        description: '',
        tags: 'C++, DSA, TCS',
      });
      setSelectedFile(null);
      fetchDatasets();
      alert('Dataset uploaded and dispatched to 19-Step AI Processing Pipeline!');
    } catch (err) {
      alert(err.response?.data?.error || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <span style={{ fontSize: '11px', fontWeight: '800', color: '#818cf8', backgroundColor: 'rgba(99, 102, 241, 0.15)', padding: '4px 10px', borderRadius: '12px' }}>
          📁 DATASET INGESTION MODULE
        </span>
        <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#f8fafc', margin: '8px 0 4px 0' }}>Dataset Upload & Multi-File Processing</h1>
        <p style={{ color: '#94a3b8', fontSize: '13px', margin: 0 }}>Upload CSV, XLSX, PDF, DOCX, TXT, JSON, ZIP, or Image files into the Enterprise AI Processing Engine.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        <form onSubmit={handleSubmit} style={{ backgroundColor: '#0b1120', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#f8fafc', margin: 0 }}>Upload New Question Dataset</h3>

          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            style={{
              border: `2px dashed ${dragActive ? '#6366f1' : 'rgba(255,255,255,0.15)'}`,
              borderRadius: '12px',
              padding: '32px 16px',
              textAlign: 'center',
              backgroundColor: dragActive ? 'rgba(99, 102, 241, 0.05)' : 'rgba(255,255,255,0.01)',
              cursor: 'pointer'
            }}
          >
            <span style={{ fontSize: '32px', display: 'block', marginBottom: '8px' }}>📤</span>
            <p style={{ color: '#f8fafc', fontWeight: '600', margin: '0 0 4px 0', fontSize: '14px' }}>
              {selectedFile ? selectedFile.name : 'Drag & Drop Dataset Files Here'}
            </p>
            <span style={{ color: '#64748b', fontSize: '12px' }}>Supports CSV, XLSX, PDF, DOCX, TXT, JSON, ZIP, PNG, JPG</span>
            <input type="file" style={{ display: 'none' }} id="file-upload" onChange={(e) => e.target.files && setSelectedFile(e.target.files[0])} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ fontSize: '12px', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Dataset Name *</label>
              <input type="text" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. TCS NQT 2026 Shift 1" style={{ width: '100%', padding: '10px', borderRadius: '8px', backgroundColor: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: '13px' }} />
            </div>
            <div>
              <label style={{ fontSize: '12px', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Target Company</label>
              <input type="text" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} placeholder="e.g. TCS / Infosys" style={{ width: '100%', padding: '10px', borderRadius: '8px', backgroundColor: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: '13px' }} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ fontSize: '12px', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Department</label>
              <input type="text" value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} placeholder="e.g. CSE / ECE" style={{ width: '100%', padding: '10px', borderRadius: '8px', backgroundColor: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: '13px' }} />
            </div>
            <div>
              <label style={{ fontSize: '12px', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Subject</label>
              <input type="text" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} placeholder="e.g. Data Structures" style={{ width: '100%', padding: '10px', borderRadius: '8px', backgroundColor: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: '13px' }} />
            </div>
          </div>

          <div>
            <label style={{ fontSize: '12px', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Tags (comma separated)</label>
            <input type="text" value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} placeholder="C++, DSA, TCS, Aptitude" style={{ width: '100%', padding: '10px', borderRadius: '8px', backgroundColor: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: '13px' }} />
          </div>

          <button type="submit" disabled={uploading} style={{ backgroundColor: '#6366f1', color: '#fff', padding: '12px', borderRadius: '10px', border: 'none', fontWeight: '700', cursor: 'pointer', boxShadow: '0 4px 14px rgba(99,102,241,0.4)', marginTop: '8px' }}>
            {uploading ? 'Processing AI Pipeline...' : '⚡ Upload & Run AI Extraction Pipeline'}
          </button>
        </form>

        <div style={{ backgroundColor: '#0b1120', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#f8fafc', margin: 0 }}>Recent Datasets Ingested</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {datasets.map((d, i) => (
              <div key={i} style={{ padding: '14px', backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h4 style={{ color: '#f8fafc', margin: '0 0 4px 0', fontSize: '14px' }}>{d.name}</h4>
                  <span style={{ color: '#94a3b8', fontSize: '12px' }}>{d.company || 'General'} &bull; {d.department || 'All Depts'} &bull; {d.status || 'Completed'}</span>
                </div>
                <span style={{ backgroundColor: 'rgba(16, 185, 129, 0.15)', color: '#34d399', fontSize: '11px', fontWeight: '700', padding: '4px 10px', borderRadius: '12px' }}>
                  AI Processed
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
