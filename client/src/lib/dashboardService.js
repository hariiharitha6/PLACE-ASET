import api from './api';

export const dashboardService = {
  /**
   * Fetches the candidate dashboard summary overview.
   */
  getSummary: async () => {
    const response = await api.get('/dashboard/summary');
    return response.data;
  },

  /**
   * Fetches practice arena performance metrics and logs.
   */
  getStats: async () => {
    const response = await api.get('/dashboard/stats');
    return response.data;
  },

  /**
   * Fetches candidate activity history logs.
   */
  getActivityLogs: async () => {
    const response = await api.get('/dashboard/activity');
    return response.data;
  },

  /**
   * Fetches user notification alerts.
   */
  getNotifications: async () => {
    const response = await api.get('/dashboard/notifications');
    return response.data;
  },

  /**
   * Marks a single notification as read.
   */
  markAsRead: async (notificationId) => {
    const response = await api.put(`/dashboard/notifications/${notificationId}/read`);
    return response.data;
  },

  /**
   * Marks all candidate notifications as read.
   */
  markAllAsRead: async () => {
    const response = await api.put('/dashboard/notifications/read-all');
    return response.data;
  }
};
