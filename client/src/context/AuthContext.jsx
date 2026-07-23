'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { authService } from '../lib/authService';
import { useRouter, usePathname } from 'next/navigation';

const AuthContext = createContext(null);

export function getDashboardPath(role) {
  switch (role) {
    case 'super_admin':
      return '/super-admin/dashboard';
    case 'college_admin':
      return '/admin/dashboard';
    case 'principal':
      return '/principal/dashboard';
    case 'hod':
      return '/hod/dashboard';
    case 'placement_cell':
      return '/placement/dashboard';
    case 'host':
      return '/host/dashboard';
    case 'faculty':
      return '/faculty/dashboard';
    case 'student':
    default:
      return '/dashboard';
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();
  const pathname = usePathname();

  // Load profile from backend API or localStorage fallback
  const fetchProfile = useCallback(async (_userId) => {
    try {
      const profile = await authService.getProfile();
      if (profile) {
        setUser(profile);
        if (typeof window !== 'undefined') {
          localStorage.setItem('user', JSON.stringify(profile));
        }
        setError(null);

        // Onboarding check for students
        if (profile.role === 'student') {
          const incomplete = !profile.college_id || !profile.roll_number || !profile.department_id;
          if (incomplete && pathname !== '/profile-setup') {
            router.push('/profile-setup');
          }
        }
      }
    } catch (err) {
      console.error('Error fetching user profile from API, checking cached profile', err);
      if (typeof window !== 'undefined') {
        const cached = localStorage.getItem('user');
        if (cached) {
          try {
            setUser(JSON.parse(cached));
          } catch (e) {
            setUser(null);
          }
        }
      }
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
          // Check cached user in localStorage
          if (typeof window !== 'undefined') {
            const cached = localStorage.getItem('user');
            if (cached) {
              try {
                setUser(JSON.parse(cached));
              } catch (e) {
                setUser(null);
              }
            }
          }
          setIsLoading(false);
        }
      } catch (err) {
        console.error('Initialization of auth failed', err);
        setIsLoading(false);
      }

      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          if (session?.user) {
            setIsLoading(true);
            await fetchProfile(session.user.id);
          } else if (event === 'SIGNED_OUT') {
            setUser(null);
            setIsLoading(false);
            if (pathname !== '/login' && pathname !== '/admin/login' && pathname !== '/register' && pathname !== '/forgot-password' && pathname !== '/reset-password' && pathname !== '/') {
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
      if (data?.user) {
        setUser(data.user);
        if (typeof window !== 'undefined') {
          localStorage.setItem('user', JSON.stringify(data.user));
        }
      }
      setIsLoading(false);
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
      if (typeof window !== 'undefined') {
        localStorage.clear();
      }
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
      if (typeof window !== 'undefined') {
        localStorage.setItem('user', JSON.stringify(updated));
      }
      return updated;
    } catch (err) {
      setError(err.error || 'Failed to update profile');
      throw err;
    }
  };

  const value = {
    user,
    isAuthenticated: !!user,
    role: user?.role || 'student',
    isLoading,
    error,
    login,
    register,
    logout,
    forgotPassword,
    resetPassword,
    updateProfile,
    getDashboardPath,
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
