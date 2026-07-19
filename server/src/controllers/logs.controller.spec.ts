import { expect } from 'chai';
import { getActivityLogs, getAuditLogs } from './logs.controller';
import { LoggingService } from '../services/logging.service';
import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';

describe('Logs Controller Unit Tests', () => {
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

  it('getActivityLogs should return 200 on success', async () => {
    const original = LoggingService.getActivityLogs;
    LoggingService.getActivityLogs = async () => ({
      logs: [], total: 0, page: 1, limit: 50, totalPages: 0
    });
    mockReq = {
      user: { id: 'u1', email: 'test@e.com', role: 'host', collegeId: 'c1' },
      query: {}
    };
    await getActivityLogs(mockReq as AuthenticatedRequest, mockRes as Response, () => {});
    expect(resStatus).to.equal(200);
    expect(resJson.success).to.be.true;
    LoggingService.getActivityLogs = original;
  });

  it('getAuditLogs should return 200 on success', async () => {
    const original = LoggingService.getAuditLogs;
    LoggingService.getAuditLogs = async () => ({
      logs: [], total: 0, page: 1, limit: 50, totalPages: 0
    });
    mockReq = {
      user: { id: 'u1', email: 'test@e.com', role: 'host', collegeId: 'c1' },
      query: {}
    };
    await getAuditLogs(mockReq as AuthenticatedRequest, mockRes as Response, () => {});
    expect(resStatus).to.equal(200);
    expect(resJson.success).to.be.true;
    LoggingService.getAuditLogs = original;
  });
});
