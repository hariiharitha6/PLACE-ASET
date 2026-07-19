'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { communityService } from '../../../../lib/communityService';
import { useToast } from '../../../../context/ToastContext';
import { Upload, FileText, ArrowRight, ArrowLeft, Check, AlertCircle, RefreshCw } from 'lucide-react';
import styles from '../community.module.css';

export default function UploadWizardPage() {
  const router = useRouter();
  const { toast } = useToast();

  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Form states
  const [formData, setFormData] = useState({
    title: '',
    type: 'question', // question | resource
    department: 'CSE',
    topic: '',
    difficulty: 'medium',
    company: '',
    tags: '',
    question_type: 'mcq',
    correct_answer: 'A',
    explanation: '',
    source: '',
    reference_link: ''
  });

  const [file, setFile] = useState(null);
  const [ocrJob, setOcrJob] = useState(null);
  const [ocrQuestions, setOcrQuestions] = useState([]);
  const [duplicates, setDuplicates] = useState([]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  // Submit flow
  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title) return toast.error('Please enter a title');

    setIsSubmitting(true);
    setUploadProgress(10);

    try {
      let fileData = undefined;
      if (file) {
        setUploadProgress(40);
        // Mock file storage path
        fileData = {
          name: file.name,
          path: `supabase-storage/community/${Date.now()}_${file.name}`,
          type: file.type,
          size: file.size
        };
      }

      setUploadProgress(70);
      const payload = {
        ...formData,
        tags: formData.tags ? formData.tags.split(',').map(t => t.trim()) : [],
        file: fileData
      };

      const res = await communityService.uploadSubmission(payload);
      setUploadProgress(100);

      toast.success('Submission uploaded successfully!');
      
      // If OCR file was present, step to OCR Preview
      if (file) {
        // Trigger mock ocr job trigger
        const mockJobId = 'ocr_job_mock_' + Date.now();
        setOcrJob({ id: mockJobId, status: 'processing' });
        setStep(3);
        
        // Simulates async ocr completion
        setTimeout(async () => {
          try {
            await communityService.runOCR(mockJobId);
            setOcrJob({ id: mockJobId, status: 'completed' });
            // Fetch extracted questions
            const mockExtracted = [
              {
                statement: `What is the output of the following Java program?\nclass Test {\n  public static void main(String args[]) {\n    System.out.println(10 + 20 + "ASET");\n  }\n}`,
                options: [
                  { label: 'A', content: '30ASET' },
                  { label: 'B', content: '1020ASET' },
                  { label: 'C', content: '30 ASET' },
                  { label: 'D', content: 'Compiler Error' }
                ],
                correctAnswer: 'A',
                explanation: 'Java evaluates arithmetic operations from left to right, adding 10 and 20 first, then concatenates.'
              }
            ];
            setOcrQuestions(mockExtracted);
            toast.success('OCR Text Extraction Completed!');
            
            // Check duplicates
            const dups = await communityService.getDuplicates(res.submission.id);
            setDuplicates(dups.data || []);
          } catch (err) {
            console.error(err);
            setOcrJob({ id: mockJobId, status: 'failed' });
          }
        }, 3000);
      } else {
        // No file attached -> directly show check screen or route back
        // Check duplicates for text input
        const dups = await communityService.getDuplicates(res.submission.id);
        setDuplicates(dups.data || []);
        setStep(4);
      }
    } catch (error) {
      console.error(error);
      toast.error('Failed to submit: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ padding: '24px', maxWidth: '800px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: '800', color: 'var(--text-primary)' }}>Upload Collaborations</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '4px' }}>
          Contribute practice questions or placement preparation notes to the community repository.
        </p>
      </div>

      {/* Progress Wizard tracker */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px', background: 'var(--bg-glass)', padding: '16px 24px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)' }}>
        {['Details', 'Upload Files', 'OCR Parser', 'Duplicate Check'].map((label, idx) => {
          const stepNum = idx + 1;
          const isActive = step === stepNum;
          const isDone = step > stepNum;
          return (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: isDone ? 'var(--accent-success)' : isActive ? 'var(--gradient-primary)' : 'rgba(255,255,255,0.05)',
                color: isDone || isActive ? '#fff' : 'var(--text-muted)',
                fontSize: '12px',
                fontWeight: '700',
                border: isActive ? 'none' : '1px solid var(--border-color)'
              }}>
                {isDone ? <Check size={14} /> : stepNum}
              </div>
              <span style={{ fontSize: '13px', fontWeight: isActive ? '700' : '500', color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
                {label}
              </span>
              {idx < 3 && <div style={{ width: '40px', height: '1px', background: 'var(--border-color)' }} />}
            </div>
          );
        })}
      </div>

      {/* Step 1: Details Form */}
      {step === 1 && (
        <form onSubmit={(e) => { e.preventDefault(); setStep(2); }} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)' }}>Title / Concept Name</label>
            <input type="text" name="title" value={formData.title} onChange={handleChange} required placeholder="e.g. Java string concatenation challenge"
              style={{ background: 'var(--bg-glass)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '10px 14px', color: 'var(--text-primary)', outline: 'none' }} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)' }}>Department</label>
              <select name="department" value={formData.department} onChange={handleChange}
                style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '10px 14px', color: 'var(--text-primary)', outline: 'none' }}>
                <option value="CSE">CSE</option>
                <option value="ECE">ECE</option>
                <option value="EEE">EEE</option>
                <option value="ME">ME</option>
                <option value="CE">CE</option>
                <option value="IT">IT</option>
              </select>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)' }}>Type</label>
              <select name="type" value={formData.type} onChange={handleChange}
                style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '10px 14px', color: 'var(--text-primary)', outline: 'none' }}>
                <option value="question">Practice Question</option>
                <option value="resource">Preparation Document (PDF/Doc)</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)' }}>Topic</label>
              <input type="text" name="topic" value={formData.topic} onChange={handleChange} placeholder="e.g. OOPs, Logic Gates"
                style={{ background: 'var(--bg-glass)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '10px 14px', color: 'var(--text-primary)', outline: 'none' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)' }}>Company specific</label>
              <input type="text" name="company" value={formData.company} onChange={handleChange} placeholder="e.g. TCS, Accenture"
                style={{ background: 'var(--bg-glass)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '10px 14px', color: 'var(--text-primary)', outline: 'none' }} />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)' }}>Tags (comma separated)</label>
            <input type="text" name="tags" value={formData.tags} onChange={handleChange} placeholder="e.g. java, coding, loops"
              style={{ background: 'var(--bg-glass)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '10px 14px', color: 'var(--text-primary)', outline: 'none' }} />
          </div>

          <button type="submit" style={{ alignSelf: 'flex-end', display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', borderRadius: 'var(--radius-md)', background: 'var(--gradient-primary)', color: '#fff', border: 'none', fontWeight: '600', cursor: 'pointer' }}>
            Next Step <ArrowRight size={16} />
          </button>
        </form>
      )}

      {/* Step 2: Upload File / Text fields */}
      {step === 2 && (
        <form onSubmit={handleUploadSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div style={{ border: '2px dashed var(--border-color)', borderRadius: 'var(--radius-lg)', padding: '40px 20px', textAlign: 'center', cursor: 'pointer', background: 'rgba(255,255,255,0.01)' }}>
            <input type="file" onChange={handleFileChange} id="fileUpload" style={{ display: 'none' }} accept=".pdf,.docx,.doc,.pptx,.png,.jpg,.jpeg,.webp" />
            <label htmlFor="fileUpload" style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(99,102,241,0.08)', color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', justifyCenter: 'center', alignSelf: 'center', margin: '0 auto' }}>
                <Upload size={24} style={{ margin: 'auto' }} />
              </div>
              <span style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)' }}>
                {file ? file.name : 'Select or drag-and-drop files'}
              </span>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                Supports PDF, DOCX, Images up to 20MB
              </span>
            </label>
          </div>

          {/* Conditional detailed input fields if not attaching a file */}
          {!file && formData.type === 'question' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', background: 'rgba(255,255,255,0.01)', padding: '20px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontSize: '14px', fontWeight: '700' }}>Or Paste Question Directly</h3>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Type manually instead of file upload</span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Correct Answer Option</label>
                  <select name="correct_answer" value={formData.correct_answer} onChange={handleChange}
                    style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '10px', color: 'var(--text-primary)', outline: 'none' }}>
                    <option value="A">Option A</option>
                    <option value="B">Option B</option>
                    <option value="C">Option C</option>
                    <option value="D">Option D</option>
                  </select>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Source Reference Name</label>
                  <input type="text" name="source" value={formData.source} onChange={handleChange} placeholder="e.g. GeeksforGeeks, LeetCode"
                    style={{ background: 'var(--bg-glass)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '10px 14px', color: 'var(--text-primary)' }} />
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Detailed Explanation</label>
                <textarea name="explanation" value={formData.explanation} onChange={handleChange} rows={3} placeholder="Explain the concept logic behind the correct answer..."
                  style={{ background: 'var(--bg-glass)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '10px 14px', color: 'var(--text-primary)', resize: 'none' }} />
              </div>
            </div>
          )}

          {/* Buttons */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '16px' }}>
            <button type="button" onClick={() => setStep(1)} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', borderRadius: 'var(--radius-md)', background: 'transparent', color: 'var(--text-secondary)', border: '1px solid var(--border-color)', fontWeight: '600', cursor: 'pointer' }}>
              <ArrowLeft size={16} /> Back
            </button>
            <button type="submit" disabled={isSubmitting} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', borderRadius: 'var(--radius-md)', background: 'var(--gradient-primary)', color: '#fff', border: 'none', fontWeight: '600', cursor: 'pointer', opacity: isSubmitting ? 0.7 : 1 }}>
              {isSubmitting ? `Submitting (${uploadProgress}%)` : 'Upload Collaboration'} <Check size={16} />
            </button>
          </div>
        </form>
      )}

      {/* Step 3: OCR job tracking */}
      {step === 3 && (
        <div style={{ background: 'var(--bg-glass)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', padding: '32px', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '24px', alignItems: 'center' }}>
          {ocrJob?.status === 'processing' ? (
            <>
              <div style={{ animation: 'spin 2s linear infinite', color: 'var(--accent-primary)' }}>
                <RefreshCw size={40} style={{ animation: 'spin 1.5s linear infinite' }} />
              </div>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: '700' }}>Running Asynchronous OCR Engine</h3>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '6px' }}>
                  Extracting questions, layout answers, and option tags from file {file?.name}...
                </p>
              </div>
              <div style={{ height: '4px', width: '200px', background: 'rgba(255,255,255,0.05)', borderRadius: '2px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: '60%', background: 'var(--gradient-primary)', animation: 'pulse 1.5s infinite' }}></div>
              </div>
            </>
          ) : ocrJob?.status === 'completed' ? (
            <>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(16,185,129,0.08)', color: 'var(--accent-success)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Check size={24} />
              </div>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)' }}>OCR Extraction Complete</h3>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                  Extracted {ocrQuestions.length} structured question items.
                </p>
              </div>

              {/* Extracted Questions Preview */}
              <div style={{ width: '100%', background: 'rgba(0,0,0,0.15)', padding: '20px', borderRadius: 'var(--radius-md)', textAlign: 'left', border: '1px solid var(--border-color)' }}>
                {ocrQuestions.map((q, idx) => (
                  <div key={idx}>
                    <div style={{ fontWeight: '700', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '8px' }}>Extracted Statement:</div>
                    <pre style={{ fontSize: '12px', color: 'var(--text-primary)', whiteSpace: 'pre-wrap', fontFamily: 'monospace', margin: 0 }}>
                      {q.statement}
                    </pre>
                  </div>
                ))}
              </div>

              <button onClick={() => setStep(4)} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 24px', borderRadius: 'var(--radius-md)', background: 'var(--gradient-primary)', color: '#fff', border: 'none', fontWeight: '600', cursor: 'pointer' }}>
                Check Duplicates <ArrowRight size={16} />
              </button>
            </>
          ) : (
            <>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(239,68,68,0.08)', color: 'var(--accent-danger)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <AlertCircle size={24} />
              </div>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: '700' }}>OCR Pipeline Failed</h3>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                  There was an error parsing the selected document.
                </p>
              </div>
              <button onClick={() => setStep(2)} style={{ padding: '8px 16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', background: 'transparent', cursor: 'pointer' }}>
                Try Uploading Again
              </button>
            </>
          )}
        </div>
      )}

      {/* Step 4: Duplicate checks review */}
      {step === 4 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div style={{ background: 'var(--bg-glass)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', padding: '24px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertCircle size={18} style={{ color: duplicates.length > 0 ? 'var(--accent-warning)' : 'var(--accent-success)' }} />
              Duplicate Check Results
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>
              {duplicates.length > 0
                ? `Warning: We found ${duplicates.length} potential duplicate questions in our question bank matching your submission content.`
                : 'Excellent! No potential duplicates were found in our repository database.'}
            </p>

            {duplicates.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px' }}>
                {duplicates.map(dup => (
                  <div key={dup.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }}>
                    <div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Check Type: {dup.check_type}</div>
                      <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)', marginTop: '2px' }}>
                        Matched with similarity: {(dup.similarity_score * 100).toFixed(0)}%
                      </div>
                    </div>
                    <button onClick={() => router.push(`/community/duplicates/${dup.submission_id}`)}
                      style={{ padding: '6px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', background: 'transparent', color: 'var(--accent-primary)', fontSize: '12px', cursor: 'pointer' }}>
                      Compare
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button onClick={() => router.push('/community')} style={{ alignSelf: 'center', padding: '10px 24px', borderRadius: 'var(--radius-md)', background: 'var(--gradient-primary)', color: '#fff', border: 'none', fontWeight: '600', cursor: 'pointer' }}>
            Go to Community Dashboard
          </button>
        </div>
      )}
    </div>
  );
}
