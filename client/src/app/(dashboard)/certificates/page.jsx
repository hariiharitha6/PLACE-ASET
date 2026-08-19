'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useAuth } from '../../../context/AuthContext';
import { useToast } from '../../../context/ToastContext';
import { certificateService } from '../../../lib/certificateService';
import { 
  Award, ShieldCheck, Download, ExternalLink, Sparkles, 
  CheckCircle2, QrCode, Share2, FileText, Calendar 
} from 'lucide-react';
import styles from './certificates.module.css';

export default function CertificatesPage() {
  const { user } = useAuth();
  const toast = useToast();

  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadCertificates = useCallback(async () => {
    setLoading(true);
    try {
      const res = await certificateService.getUserCertificates();
      setCertificates(res || []);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load certificates');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadCertificates();
  }, [loadCertificates]);

  const handleDownloadCertificate = (cert) => {
    const studentName = cert.user_name || user?.full_name || 'PLACE@ASET Candidate';
    const certTitle = cert.title || 'Certificate of Excellence';
    const code = cert.verification_code || 'ASET-CERT-VERIFIED';
    const issueDate = cert.issue_date ? new Date(cert.issue_date).toLocaleDateString() : new Date().toLocaleDateString();
    const issuer = cert.issuer_name || 'Ahalia School of Engineering and Technology';

    // Generate clean SVG Certificate Vector
    const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 700" width="1000" height="700">
      <defs>
        <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#0f172a"/>
          <stop offset="50%" stop-color="#1e1b4b"/>
          <stop offset="100%" stop-color="#0f172a"/>
        </linearGradient>
        <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#f59e0b"/>
          <stop offset="50%" stop-color="#fbbf24"/>
          <stop offset="100%" stop-color="#d97706"/>
        </linearGradient>
      </defs>
      
      <!-- Background & Borders -->
      <rect width="1000" height="700" fill="url(#bgGrad)"/>
      <rect x="20" y="20" width="960" height="660" fill="none" stroke="url(#goldGrad)" stroke-width="3" rx="16"/>
      <rect x="30" y="30" width="940" height="640" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="1" rx="12"/>
      
      <!-- Header -->
      <text x="500" y="110" fill="#94a3b8" font-size="16" font-family="sans-serif" font-weight="600" text-anchor="middle" letter-spacing="4">PLACE@ASET DIGITAL CREDENTIAL</text>
      <text x="500" y="160" fill="url(#goldGrad)" font-size="34" font-family="sans-serif" font-weight="800" text-anchor="middle" letter-spacing="1">CERTIFICATE OF RECOGNITION</text>
      
      <!-- Presentation Line -->
      <text x="500" y="220" fill="#e2e8f0" font-size="16" font-family="sans-serif" text-anchor="middle">This credential is proudly presented to</text>
      
      <!-- Candidate Name -->
      <text x="500" y="280" fill="#ffffff" font-size="38" font-family="sans-serif" font-weight="bold" text-anchor="middle">${studentName}</text>
      <line x1="300" y1="300" x2="700" y2="300" stroke="#6366f1" stroke-width="2"/>
      
      <!-- Achievement Details -->
      <text x="500" y="350" fill="#cbd5e1" font-size="18" font-family="sans-serif" text-anchor="middle">For outstanding performance and technical excellence in</text>
      <text x="500" y="390" fill="#38bdf8" font-size="24" font-family="sans-serif" font-weight="700" text-anchor="middle">${certTitle}</text>
      
      <!-- Verification & Metadata Box -->
      <rect x="100" y="470" width="800" height="140" fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.1)" rx="8"/>
      
      <!-- Left Column -->
      <text x="140" y="515" fill="#94a3b8" font-size="12" font-family="sans-serif">ISSUED BY</text>
      <text x="140" y="540" fill="#ffffff" font-size="15" font-family="sans-serif" font-weight="600">${issuer}</text>
      <text x="140" y="575" fill="#94a3b8" font-size="12" font-family="sans-serif">DATE: ${issueDate}</text>
      
      <!-- Right Column -->
      <text x="580" y="515" fill="#94a3b8" font-size="12" font-family="sans-serif">VERIFICATION CODE (BLOCKCHAIN HASH)</text>
      <text x="580" y="540" fill="#fbbf24" font-size="14" font-family="monospace" font-weight="bold">${code}</text>
      <text x="580" y="575" fill="#10b981" font-size="12" font-family="sans-serif">STATUS: SECURELY VERIFIED ON PLACE@ASET</text>
    </svg>`;

    const blob = new Blob([svgContent], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${certTitle.replace(/\s+/g, '_')}_${code}.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast.success(`Downloaded official digital certificate for ${certTitle}`);
  };

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.titleSection}>
          <h1 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Award size={26} style={{ color: 'var(--accent-primary)' }} /> Digital Credentials & Certificates
          </h1>
          <p>Verified academic credentials, coding mastery certificates, and competitive placement achievements.</p>
        </div>

        <Link href="/achievements" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', borderRadius: 'var(--radius-md)', background: 'var(--bg-glass)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', textDecoration: 'none', fontWeight: '600', fontSize: '13px' }}>
          <Sparkles size={16} style={{ color: '#f59e0b' }} /> View Achievement Badges
        </Link>
      </div>

      {/* Certificate Cards Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
          <Sparkles size={24} style={{ animation: 'spin 1s linear infinite', marginBottom: '12px' }} />
          <p>Loading digital certificates...</p>
        </div>
      ) : certificates.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', background: 'var(--bg-glass)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)' }}>
          <Award size={44} style={{ color: 'var(--text-muted)', marginBottom: '12px' }} />
          <h3 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)' }}>No certificates earned yet</h3>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px', maxWidth: '500px', margin: '8px auto' }}>
            Certificates are issued automatically when you win weekly coding challenges, complete faculty assessments, or score above 80% in company placement mocks.
          </p>
          <Link href="/challenges" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', marginTop: '16px', padding: '10px 20px', borderRadius: 'var(--radius-md)', background: 'var(--gradient-primary)', color: '#fff', textDecoration: 'none', fontSize: '13px', fontWeight: '600' }}>
            Join Active Challenges
          </Link>
        </div>
      ) : (
        <div className={styles.grid}>
          {certificates.map(cert => (
            <div key={cert.id} className={styles.certCard}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <span className={`${styles.badge} ${styles.badgeVerified}`}>
                  <ShieldCheck size={14} /> Verified Credential
                </span>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                  {cert.certificate_number || cert.verification_code}
                </span>
              </div>

              <div>
                <h3 style={{ fontSize: '16px', fontWeight: '800', color: 'var(--text-primary)', margin: '0 0 6px 0' }}>{cert.title}</h3>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: 0 }}>Issued by: {cert.issuer_name || 'PLACE@ASET Platform'}</p>
              </div>

              <div style={{ display: 'flex', gap: '12px', fontSize: '11px', color: 'var(--text-muted)', borderTop: '1px solid var(--border-color)', paddingTop: '12px' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Calendar size={12} /> {new Date(cert.issue_date || Date.now()).toLocaleDateString()}
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <QrCode size={12} /> {cert.verification_code}
                </span>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
                <button onClick={() => handleDownloadCertificate(cert)}
                  style={{ flex: 1, padding: '8px 12px', borderRadius: 'var(--radius-md)', background: 'var(--gradient-primary)', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: '600', fontSize: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                  <Download size={14} /> Download Certificate
                </button>

                <Link href={`/certificates/${cert.verification_code || cert.id}/verify`} target="_blank"
                  style={{ padding: '8px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', background: 'transparent', color: 'var(--text-primary)', textDecoration: 'none', fontWeight: '600', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <ExternalLink size={14} /> Verify
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
