'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { dashboardService } from '../lib/dashboardService';
import { supabase } from '../lib/supabase';

const NotificationContext = createContext({
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  fetchNotifications: () => {},
  markAsRead: () => {},
  markAllAsRead: () => {},
});

export function NotificationProvider({ children }) {
  const { isAuthenticated, user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const fetchNotifications = useCallback(async () => {
    if (!isAuthenticated) return;
    setIsLoading(true);
    try {
      const list = await dashboardService.getNotifications();
      setNotifications(list || []);
      setUnreadCount(list?.filter(n => !n.is_read).length || 0);
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  // Load on mount & setup Supabase Realtime subscription
  useEffect(() => {
    if (!isAuthenticated) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    fetchNotifications();

    // Supabase Realtime subscription for real-time notification push
    let channel = null;
    try {
      if (supabase && supabase.channel) {
        channel = supabase
          .channel(`user-notifications-${user?.id || 'guest'}`)
          .on(
            'postgres_changes',
            {
              event: 'INSERT',
              schema: 'public',
              table: 'notifications',
              filter: user?.id ? `user_id=eq.${user.id}` : undefined,
            },
            (payload) => {
              if (payload.new) {
                setNotifications((prev) => [payload.new, ...prev]);
                setUnreadCount((prev) => prev + 1);
              }
            }
          )
          .subscribe();
      }
    } catch (realtimeErr) {
      console.warn('Supabase Realtime not initialized:', realtimeErr);
    }

    // Safety polling fallback (every 90 seconds)
    const interval = setInterval(fetchNotifications, 90000);

    return () => {
      clearInterval(interval);
      if (channel && supabase && supabase.removeChannel) {
        supabase.removeChannel(channel);
      }
    };
  }, [isAuthenticated, user?.id, fetchNotifications]);

  const markAsRead = async (id) => {
    try {
      await dashboardService.markAsRead(id);
      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, is_read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await dashboardService.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Failed to mark all notifications as read:', err);
    }
  };

  const value = {
    notifications,
    unreadCount,
    isLoading,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  return useContext(NotificationContext);
}
