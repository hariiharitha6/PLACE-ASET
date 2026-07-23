import request from 'supertest';
import { expect } from 'chai';
import app from '../../app';
import { AuthService } from '../../services/auth.service';

describe('Auth API Routes Integration Tests', () => {
  it('POST /api/v1/auth/login - should return 200 and set cookie on successful credentials', async () => {
    const originalLogin = AuthService.login;
    AuthService.login = async () => ({
      user: {
        id: 'test-user-id',
        email: 'test@example.com',
        fullName: 'Test User',
        role: 'student',
        collegeId: null,
      },
      session: {
        accessToken: 'mock-access-token',
        refreshToken: 'mock-refresh-token',
        expiresAt: 1234567,
      },
    });

    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'test@example.com',
        password: 'password123',
      });

    expect(res.status).to.equal(200);
    expect(res.body.success).to.be.true;
    expect(res.body.data.user.id).to.equal('test-user-id');
    expect(res.headers['set-cookie'][0]).to.contain('refreshToken=mock-refresh-token');

    AuthService.login = originalLogin;
  });

  it('POST /api/v1/auth/refresh - should refresh access token with cookie-passed token', async () => {
    const originalRefresh = AuthService.refresh;
    AuthService.refresh = async () => ({
      user: {
        id: 'test-user-id',
        email: 'test@example.com',
        fullName: 'Test User',
        role: 'student',
        collegeId: null,
      },
      session: {
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
        expiresAt: 1234567,
      },
    });

    const res = await request(app)
      .post('/api/v1/auth/refresh')
      .set('Cookie', ['refreshToken=old-refresh-token']);

    expect(res.status).to.equal(200);
    expect(res.body.success).to.be.true;
    expect(res.body.data.session.accessToken).to.equal('new-access-token');

    AuthService.refresh = originalRefresh;
  });

  it('POST /api/v1/auth/forgot-password - should initiate recovery flow', async () => {
    const originalSend = AuthService.sendPasswordResetEmail;
    AuthService.sendPasswordResetEmail = async () => {};

    const res = await request(app)
      .post('/api/v1/auth/forgot-password')
      .send({
        email: 'test@example.com',
      });

    expect(res.status).to.equal(200);
    expect(res.body.success).to.be.true;

    AuthService.sendPasswordResetEmail = originalSend;
  });
});
