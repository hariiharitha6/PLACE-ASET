import api from './api';

export const analyticsService = {
  getStudentAnalytics: async () => {
    const response = await api.get('/analytics/student');
    return response.data;
  },
  getDepartmentAnalytics: async (params) => {
    const response = await api.get('/analytics/department', { params });
    return response.data;
  },
  getPlacementAnalytics: async () => {
    const response = await api.get('/analytics/placement');
    return response.data;
  },
  getExecutiveAnalytics: async () => {
    const response = await api.get('/analytics/executive');
    return response.data;
  }
};
