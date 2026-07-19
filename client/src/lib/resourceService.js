import api from './api';

export const resourceService = {
  listResources: async (params) => {
    const response = await api.get('/resources', { params });
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
    const response = await api.put(`/resources/${id}`, data);
    return response.data;
  },
  deleteResource: async (id) => {
    const response = await api.delete(`/resources/${id}`);
    return response.data;
  },
  downloadResource: async (id) => {
    const response = await api.post(`/resources/${id}/download`);
    return response.data;
  }
};
