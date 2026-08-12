'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { certificateService } from '../../../../lib/certificateService';
import { ShieldCheck, CheckCircle2, XCircle, Award, Building, Calendar, QrCode, Sparkles } from 'lucide-react';

export default function PublicCertificateVerifyPage() {
  const params = useParams();
  const code = params.id;

  const [verification, setVerification] = useState(null);
  const [loading, setLoading] = useState(true);

  const verify = useCallback(async () => {
    setLoading(true);
    try {
      const res = await certificateService.verifyCertificate(code);
      setVerification(res);
    } catch (err) {
      setVerification({ is_valid: false, message: 'Verification lookup failed' });
    } finally {
      setLoading(false);
    }
  }, [code]);

  useEffect(() => {
    if (code) verify();
  }, [code, verify]);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div style={{ background: 'var(--bg-glass)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', padding: '40px', maxWidth: '600px', width: '100%', display: 'flex', flexDirection: 'column', gap: '24px', boxShadow: 'var(--shadow-lg)' }}>
        <div style={{ textAlign: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '20px' }}>
          <ShieldCheck size={48} style={{ color: 'var(--accent-primary)', marginBottom: '8px' }} />
          <h1 style={{ fontSize: '22px', fontWeight: '800', color: 'var(--text-primary)', margin: 0 }}>PLACE@ASET Credential Verification</h1>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>Public Authenticity Verification Portal</p>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
            <Sparkles size={24} style={{ animation: 'spin 1s linear infinite', marginBottom: '8px' }} />
            <p>Verifying cryptographic certificate signature...</p>
          </div>
        ) : verification?.is_valid ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid #10b981', padding: '14px 18px', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', gap: '10px', color: '#10b981', fontWeight: '700', fontSize: '14px' }}>
              <CheckCircle2 size={20} /> Official Certificate Verified & Authentic
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', background: 'var(--bg-secondary)', padding: '20px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
              <div>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700' }}>Certificate Title</span>
                <h3 style={{ fontSize: '18px', fontWeight: '800', color: 'var(--text-primary)', margin: '2px 0 0 0' }}>
                  {verification.certificate?.title || 'Certificate of Achievement'}
                </h3>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '8px' }}>
                <div>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Recipient Name</span>
                  <p style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-primary)', margin: 0 }}>
                    {verification.certificate?.users?.full_name || 'Student Candidate'}
                  </p>
                </div>

                <div>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Issuing Institution</span>
                  <p style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-primary)', margin: 0 }}>
                    {verification.certificate?.colleges?.name || 'ASET Engineering College'}
                  </p>
                </div>

                <div>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Issue Date</span>
                  <p style={{ fontSize: '13px', color: 'var(--text-primary)', margin: 0 }}>
                    {new Date(verification.certificate?.issue_date || Date.now()).toLocaleDateString()}
                  </p>
                </div>

                <div>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Verification Code</span>
                  <p style={{ fontSize: '13px', fontFamily: 'monospace', color: 'var(--accent-primary)', margin: 0 }}>
                    {code}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid #ef4444', padding: '20px', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', gap: '12px', color: '#ef4444' }}>
            <XCircle size={24} />
            <div>
              <h4 style={{ margin: 0, fontWeight: '700' }}>Invalid Certificate Code</h4>
              <p style={{ margin: '4px 0 0 0', fontSize: '12px', opacity: 0.9 }}>
                {verification?.message || 'No matching credential found in PLACE@ASET verification database.'}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
