'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { authService } from '../lib/authService';
import { useRouter, usePathname } from 'next/navigation';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();
  const pathname = usePathname();

  // Load profile when supabase session changes
  const fetchProfile = useCallback(async (userId) => {
    try {
      const profile = await authService.getProfile();
      setUser(profile);
      setError(null);

      // Onboarding check: If college_id is missing or profile setup is incomplete, redirect to profile-setup
      const incomplete = !profile.college_id || !profile.roll_number || !profile.department_id;
      if (incomplete && pathname !== '/profile-setup') {
        router.push('/profile-setup');
      }
    } catch (err) {
      console.error('Error fetching user profile', err);
      setUser(null);
      setError('Could not fetch user profile.');
    } finally {
      setIsLoading(false);
    }
  }, [pathname, router]);

  useEffect(() => {
    let authListener = null;

    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          await fetchProfile(session.user.id);
        } else {
          setUser(null);
          setIsLoading(false);
        }
      } catch (err) {
        console.error('Initialization of auth failed', err);
        setIsLoading(false);
      }

      // Listen for auth state changes (login, logout, token refresh, etc.)
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          if (session?.user) {
            setIsLoading(true);
            await fetchProfile(session.user.id);
          } else {
            setUser(null);
            setIsLoading(false);
            if (pathname !== '/login' && pathname !== '/register' && pathname !== '/forgot-password' && pathname !== '/reset-password' && pathname !== '/') {
              router.push('/login');
            }
          }
        }
      );
      authListener = subscription;
    };

    initAuth();

    return () => {
      if (authListener) {
        authListener.unsubscribe();
      }
    };
  }, [pathname, router, fetchProfile]);

  const login = async (email, password) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await authService.login(email, password);
      // fetchProfile will be triggered by onAuthStateChange automatically
      return data;
    } catch (err) {
      setError(err.error || 'Invalid credentials or login failed');
      setIsLoading(false);
      throw err;
    }
  };

  const register = async (input) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await authService.register(input);
      return data;
    } catch (err) {
      setError(err.error || 'Registration failed');
      setIsLoading(false);
      throw err;
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await authService.logout();
      setUser(null);
      router.push('/login');
    } catch (err) {
      console.error('Logout error', err);
    } finally {
      setIsLoading(false);
    }
  };

  const forgotPassword = async (email) => {
    setError(null);
    try {
      return await authService.forgotPassword(email);
    } catch (err) {
      setError(err.error || 'Failed to send recovery email');
      throw err;
    }
  };

  const resetPassword = async (password) => {
    setError(null);
    try {
      return await authService.resetPassword(password);
    } catch (err) {
      setError(err.error || 'Password reset failed');
      throw err;
    }
  };

  const updateProfile = async (profileData) => {
    setError(null);
    try {
      const updated = await authService.updateProfile(profileData);
      setUser(updated);
      return updated;
    } catch (err) {
      setError(err.error || 'Failed to update profile');
      throw err;
    }
  };

  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    error,
    login,
    register,
    logout,
    forgotPassword,
    resetPassword,
    updateProfile,
    refetchProfile: () => user && fetchProfile(user.id),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
