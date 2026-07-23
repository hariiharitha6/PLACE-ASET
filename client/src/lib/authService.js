import api from './api';
import { supabase } from './supabase';

export const authService = {
  /**
   * Registers a new user on the platform.
   */
  register: async (registerInput) => {
    const response = await api.post('/auth/register', registerInput);
    
    // If the backend returns a session, initialize the Supabase client session
    if (response.success && response.data?.session) {
      const { session } = response.data;
      await supabase.auth.setSession({
        access_token: session.access_token || session.accessToken,
        refresh_token: session.refresh_token || session.refreshToken,
      });
    }
    return response.data;
  },

  /**
   * Logs a user in with their email and password.
   */
  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    
    if (response.success && response.data) {
      const { session, user } = response.data;
      const accessToken = session?.accessToken || session?.access_token;
      const refreshToken = session?.refreshToken || session?.refresh_token;

      if (accessToken && typeof window !== 'undefined') {
        localStorage.setItem('accessToken', accessToken);
        console.log('[AUTH SERVICE TRACE] TOKEN SAVED', { accessToken });
      }
      if (refreshToken && typeof window !== 'undefined') {
        localStorage.setItem('refreshToken', refreshToken);
      }
      if (user && typeof window !== 'undefined') {
        localStorage.setItem('user', JSON.stringify(user));
        console.log('[AUTH SERVICE TRACE] USER SAVED', { user });
      }

      if (session) {
        await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });
      }
      console.log('[AUTH SERVICE TRACE] LOGIN SUCCESS', { responseData: response.data });
    }
    return response.data;
  },

  /**
   * Logs the user out of the platform.
   */
  logout: async () => {
    try {
      await api.post('/auth/logout');
    } catch (err) {
      console.error('API logout request failed', err);
    } finally {
      // Always sign out from Supabase client SDK
      await supabase.auth.signOut();
      if (typeof window !== 'undefined') {
        localStorage.clear();
      }
    }
  },

  /**
   * Requests a password recovery link.
   */
  forgotPassword: async (email) => {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  },

  /**
   * Resets the user's password using the session/token.
   */
  resetPassword: async (password) => {
    const response = await api.post('/auth/reset-password', { password });
    return response.data;
  },

  /**
   * Refreshes the active session.
   */
  refreshSession: async (refreshToken) => {
    const response = await api.post('/auth/refresh', { refreshToken });
    if (response.success && response.data?.session) {
      const { session } = response.data;
      await supabase.auth.setSession({
        access_token: session.accessToken || session.access_token,
        refresh_token: session.refreshToken || session.refresh_token,
      });
    }
    return response.data;
  },

  /**
   * Fetches the profile of the current authenticated user.
   */
  getProfile: async () => {
    const response = await api.get('/users/profile');
    return response.data;
  },

  /**
   * Updates the profile of the current authenticated user.
   */
  updateProfile: async (profileData) => {
    const response = await api.put('/users/profile', profileData);
    return response.data;
  }
};
