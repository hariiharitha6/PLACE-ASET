import { expect } from 'chai';
import { register, login, logout, refresh } from './auth.controller';
import { AuthService } from '../services/auth.service';
import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';

describe('Auth Controller Unit Tests', () => {
  let mockReq: Partial<AuthenticatedRequest>;
  let mockRes: Partial<Response>;
  let resStatus: number;
  let resJson: any;
  let cookies: Record<string, any>;
  let clearedCookies: string[];

  beforeEach(() => {
    resStatus = 200;
    resJson = null;
    cookies = {};
    clearedCookies = [];

    mockRes = {
      status: (code: number) => {
        resStatus = code;
        return mockRes as Response;
      },
      json: (data: any) => {
        resJson = data;
        return mockRes as Response;
      },
      cookie: (name: string, value: any) => {
        cookies[name] = value;
        return mockRes as Response;
      },
      clearCookie: (name: string) => {
        clearedCookies.push(name);
        delete cookies[name];
        return mockRes as Response;
      },
    };
  });

  it('register should return 201 on success and set refreshToken cookie', async () => {
    const originalRegister = AuthService.register;
    AuthService.register = async () => ({
      userId: 'test-user-id',
      email: 'test@example.com',
      session: {
        access_token: 'mock-access-token',
        refresh_token: 'mock-refresh-token',
        expires_in: 3600,
        token_type: 'bearer',
        user: null as any,
      },
    });

    mockReq = {
      validated: {
        body: {
          email: 'test@example.com',
          password: 'password123',
          fullName: 'Test User',
          collegeId: '00000000-0000-0000-0000-000000000000',
        },
      },
    };

    await register(mockReq as AuthenticatedRequest, mockRes as Response, () => {});

    expect(resStatus).to.equal(201);
    expect(resJson.success).to.be.true;
    expect(resJson.data.userId).to.equal('test-user-id');
    expect(cookies['refreshToken']).to.equal('mock-refresh-token');

    AuthService.register = originalRegister;
  });

  it('login should return 200 on success and set refreshToken cookie', async () => {
    const originalLogin = AuthService.login;
    AuthService.login = async () => ({
      user: {
        id: 'test-user-id',
        email: 'test@example.com',
        role: 'student',
        collegeId: null,
      },
      session: {
        accessToken: 'mock-access-token',
        refreshToken: 'mock-refresh-token',
        expiresAt: 1234567,
      },
    });

    mockReq = {
      validated: {
        body: {
          email: 'test@example.com',
          password: 'password123',
        },
      },
    };

    await login(mockReq as AuthenticatedRequest, mockRes as Response, () => {});

    expect(resStatus).to.equal(200);
    expect(resJson.success).to.be.true;
    expect(resJson.data.user.id).to.equal('test-user-id');
    expect(cookies['refreshToken']).to.equal('mock-refresh-token');

    AuthService.login = originalLogin;
  });

  it('logout should clear cookie and return 200', async () => {
    const originalLogout = AuthService.logout;
    AuthService.logout = async () => {};

    mockReq = {
      headers: {
        authorization: 'Bearer mock-access-token',
      },
    };

    await logout(mockReq as AuthenticatedRequest, mockRes as Response, () => {});

    expect(resStatus).to.equal(200);
    expect(resJson.success).to.be.true;
    expect(clearedCookies).to.include('refreshToken');

    AuthService.logout = originalLogout;
  });

  it('refresh should return 200 with new session and set cookie', async () => {
    const originalRefresh = AuthService.refresh;
    AuthService.refresh = async () => ({
      user: {
        id: 'test-user-id',
        email: 'test@example.com',
        role: 'student',
        collegeId: null,
      },
      session: {
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
        expiresAt: 1234567,
      },
    });

    mockReq = {
      cookies: {
        refreshToken: 'old-refresh-token',
      },
      body: {},
    } as any;

    await refresh(mockReq as any, mockRes as Response, () => {});

    expect(resStatus).to.equal(200);
    expect(resJson.success).to.be.true;
    expect(resJson.data.session.accessToken).to.equal('new-access-token');
    expect(cookies['refreshToken']).to.equal('new-refresh-token');

    AuthService.refresh = originalRefresh;
  });
});
