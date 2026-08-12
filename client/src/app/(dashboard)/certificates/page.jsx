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

  const handleDownloadPDF = (title, code) => {
    toast.success(`Preparing official PDF download for ${title} (${code})`);
  };

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.titleSection}>
          <h1 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Award size={26} style={{ color: 'var(--accent-primary)' }} /> Digital Credentials & Certificates
          </h1>
          <p>Verified academic credentials, coding mastery certificates, and competitive event achievements.</p>
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
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>Complete official coding challenges, faculty assignments, or placement drives to unlock certificates.</p>
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
                  {cert.certificate_number}
                </span>
              </div>

              <div>
                <h3 style={{ fontSize: '16px', fontWeight: '800', color: 'var(--text-primary)', margin: '0 0 6px 0' }}>{cert.title}</h3>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: 0 }}>Issued by: {cert.issuer_name || 'PLACE@ASET Platform'}</p>
              </div>

              <div style={{ display: 'flex', gap: '12px', fontSize: '11px', color: 'var(--text-muted)', borderTop: '1px solid var(--border-color)', paddingTop: '12px' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Calendar size={12} /> {new Date(cert.issue_date).toLocaleDateString()}
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <QrCode size={12} /> {cert.verification_code}
                </span>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
                <button onClick={() => handleDownloadPDF(cert.title, cert.verification_code)}
                  style={{ flex: 1, padding: '8px 12px', borderRadius: 'var(--radius-md)', background: 'var(--gradient-primary)', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: '600', fontSize: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                  <Download size={14} /> Download PDF
                </button>

                <Link href={`/certificates/${cert.verification_code}/verify`} target="_blank"
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
