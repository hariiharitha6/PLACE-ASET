import { expect } from 'chai';
import {
  getUserCertificates,
  getCertificateDetail,
  verifyCertificate,
  issueCertificate,
  getUserAchievements,
  checkAndUnlockAchievements
} from './certificate.controller';
import { CertificateService } from '../services/certificate.service';
import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';

describe('Certificate Controller Unit Tests', () => {
  let mockReq: Partial<AuthenticatedRequest>;
  let mockRes: Partial<Response>;
  let resStatus: number;
  let resJson: any;

  beforeEach(() => {
    resStatus = 200;
    resJson = null;
    mockRes = {
      status: (code: number) => { resStatus = code; return mockRes as Response; },
      json: (data: any) => { resJson = data; return mockRes as Response; },
    };
  });

  it('getUserCertificates should return 200 on success', async () => {
    const original = CertificateService.getUserCertificates;
    CertificateService.getUserCertificates = async () => [];
    mockReq = {
      user: { id: 'u1', email: 'test@e.com', role: 'student', collegeId: 'c1' }
    };
    await getUserCertificates(mockReq as AuthenticatedRequest, mockRes as Response, () => {});
    expect(resStatus).to.equal(200);
    expect(resJson.success).to.be.true;
    CertificateService.getUserCertificates = original;
  });

  it('getCertificateDetail should return 200 on success', async () => {
    const original = CertificateService.getCertificateDetail;
    CertificateService.getCertificateDetail = async () => ({ id: 'c1', title: 'Cert' } as any);
    mockReq = { params: { id: 'c1' } };
    await getCertificateDetail(mockReq as AuthenticatedRequest, mockRes as Response, () => {});
    expect(resStatus).to.equal(200);
    expect(resJson.success).to.be.true;
    CertificateService.getCertificateDetail = original;
  });

  it('verifyCertificate should return 200 on success', async () => {
    const original = CertificateService.verifyCertificate;
    CertificateService.verifyCertificate = async () => ({ is_valid: true, message: 'Valid' });
    mockReq = { params: { code: 'code123' } };
    await verifyCertificate(mockReq as AuthenticatedRequest, mockRes as Response, () => {});
    expect(resStatus).to.equal(200);
    expect(resJson.success).to.be.true;
    CertificateService.verifyCertificate = original;
  });

  it('issueCertificate should return 201 on success', async () => {
    const original = CertificateService.issueCertificate;
    CertificateService.issueCertificate = async () => ({ id: 'c1', verification_code: 'code1' } as any);
    mockReq = {
      user: { id: 'u1', email: 'faculty@e.com', role: 'faculty', collegeId: 'c1' },
      body: { title: 'Certificate of Excellence' }
    };
    await issueCertificate(mockReq as AuthenticatedRequest, mockRes as Response, () => {});
    expect(resStatus).to.equal(201);
    expect(resJson.success).to.be.true;
    CertificateService.issueCertificate = original;
  });

  it('getUserAchievements should return 200 on success', async () => {
    const original = CertificateService.getUserAchievements;
    CertificateService.getUserAchievements = async () => [];
    mockReq = { user: { id: 'u1', email: 'test@e.com', role: 'student', collegeId: 'c1' } };
    await getUserAchievements(mockReq as AuthenticatedRequest, mockRes as Response, () => {});
    expect(resStatus).to.equal(200);
    expect(resJson.success).to.be.true;
    CertificateService.getUserAchievements = original;
  });

  it('checkAndUnlockAchievements should return 200 on success', async () => {
    const original = CertificateService.checkAndUnlockAchievements;
    CertificateService.checkAndUnlockAchievements = async () => ({ newly_unlocked: [] });
    mockReq = { user: { id: 'u1', email: 'test@e.com', role: 'student', collegeId: 'c1' } };
    await checkAndUnlockAchievements(mockReq as AuthenticatedRequest, mockRes as Response, () => {});
    expect(resStatus).to.equal(200);
    expect(resJson.success).to.be.true;
    CertificateService.checkAndUnlockAchievements = original;
  });
});
