import { expect } from 'chai';
import {
  getProfile,
  updateProfile,
  getPreferences,
  updatePreferences
} from './users.controller';
import { UserService } from '../services/user.service';
import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';

describe('Users Controller Unit Tests', () => {
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

  it('getProfile should return 200 on success', async () => {
    const original = UserService.getProfile;
    UserService.getProfile = async () => ({ id: 'u1', full_name: 'Test' } as any);
    mockReq = { user: { id: 'u1', email: 'test@e.com', role: 'student', collegeId: 'c1' } };
    await getProfile(mockReq as AuthenticatedRequest, mockRes as Response, () => {});
    expect(resStatus).to.equal(200);
    expect(resJson.data.full_name).to.equal('Test');
    UserService.getProfile = original;
  });

  it('updateProfile should return 200 on success', async () => {
    const original = UserService.updateProfile;
    UserService.updateProfile = async () => ({ id: 'u1', full_name: 'Updated' } as any);
    mockReq = {
      user: { id: 'u1', email: 'test@e.com', role: 'student', collegeId: 'c1' },
      validated: {
        body: { fullName: 'Updated' }
      } as any
    };
    await updateProfile(mockReq as AuthenticatedRequest, mockRes as Response, () => {});
    expect(resStatus).to.equal(200);
    expect(resJson.data.full_name).to.equal('Updated');
    UserService.updateProfile = original;
  });

  it('getPreferences should return 200 on success', async () => {
    const original = UserService.getPreferences;
    UserService.getPreferences = async () => ({ user_id: 'u1', challenge_reminders: true } as any);
    mockReq = { user: { id: 'u1', email: 'test@e.com', role: 'student', collegeId: 'c1' } };
    await getPreferences(mockReq as AuthenticatedRequest, mockRes as Response, () => {});
    expect(resStatus).to.equal(200);
    expect(resJson.data.challenge_reminders).to.be.true;
    UserService.getPreferences = original;
  });

  it('updatePreferences should return 200 on success', async () => {
    const original = UserService.updatePreferences;
    UserService.updatePreferences = async () => ({ user_id: 'u1', challenge_reminders: false } as any);
    mockReq = {
      user: { id: 'u1', email: 'test@e.com', role: 'student', collegeId: 'c1' },
      body: { challenge_reminders: false }
    };
    await updatePreferences(mockReq as AuthenticatedRequest, mockRes as Response, () => {});
    expect(resStatus).to.equal(200);
    expect(resJson.data.challenge_reminders).to.be.false;
    UserService.updatePreferences = original;
  });
});
