import api from './api';

export const practiceService = {
  startSession: async (data) => {
    const response = await api.post('/practice/start', data);
    return response.data;
  },
  submitAnswer: async (data) => {
    const response = await api.post('/practice/submit', data);
    return response.data;
  },
  endSession: async (data) => {
    const response = await api.post('/practice/end', data);
    return response.data;
  },
  getHistory: async (params) => {
    const response = await api.get('/practice/history', { params });
    return response.data;
  },
  getSessionResults: async (sessionId) => {
    const response = await api.get(`/practice/sessions/${sessionId}/results`);
    return response.data;
  },
  getStats: async () => {
    const response = await api.get('/practice/statistics');
    return response.data;
  },
  getRecommendations: async () => {
    const response = await api.get('/practice/recommendations');
    return response.data;
  },
  toggleBookmark: async (questionId) => {
    const response = await api.post('/practice/bookmarks', { questionId });
    return response.data;
  },
  getBookmarks: async () => {
    const response = await api.get('/practice/bookmarks');
    return response.data;
  }
};
