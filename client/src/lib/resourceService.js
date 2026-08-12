import api from './api';

export const resourceService = {
  listResources: async (params) => {
    const response = await api.get('/resources', { params });
    return response.data;
  },
  getHubSections: async () => {
    const response = await api.get('/resources/hub');
    return response.data;
  },
  getResource: async (id) => {
    const response = await api.get(`/resources/${id}`);
    return response.data;
  },
  createResource: async (data) => {
    const response = await api.post('/resources', data);
    return response.data;
  },
  updateResource: async (id, data) => {
    const response = await api.patch(`/resources/${id}`, data);
    return response.data;
  },
  deleteResource: async (id) => {
    const response = await api.delete(`/resources/${id}`);
    return response.data;
  },
  downloadResource: async (id) => {
    const response = await api.post(`/resources/${id}/download`);
    return response.data;
  },
  addBookmark: async (id) => {
    const response = await api.post(`/resources/${id}/bookmark`);
    return response.data;
  },
  removeBookmark: async (id) => {
    const response = await api.delete(`/resources/${id}/bookmark`);
    return response.data;
  },
  getUserBookmarks: async (params) => {
    const response = await api.get('/resources/bookmarks', { params });
    return response.data;
  },
  getRecommendations: async () => {
    const response = await api.get('/resources/recommendations');
    return response.data;
  },
  processResourceAI: async (id) => {
    const response = await api.post(`/resources/${id}/ai/process`);
    return response.data;
  },
  runResourceAIPrompt: async (id, promptType, customQuestion) => {
    const response = await api.post(`/resources/${id}/ai/prompt`, { promptType, customQuestion });
    return response.data;
  },
  getFacultyAnalytics: async () => {
    const response = await api.get('/resources/faculty/analytics');
    return response.data;
  },
  getAdminAnalytics: async () => {
    const response = await api.get('/resources/admin/analytics');
    return response.data;
  },
  moderateResource: async (id, action, comments) => {
    const response = await api.patch(`/resources/${id}/moderate`, { action, comments });
    return response.data;
  }
};
