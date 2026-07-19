import api from './api';

export const communityService = {
  listQuestions: async (params) => {
    const response = await api.get('/community/questions', { params });
    return response.data;
  },
  submitQuestion: async (data) => {
    const response = await api.post('/community/questions', data);
    return response.data;
  },
  reviewQuestion: async (id, data) => {
    const response = await api.put(`/community/questions/${id}/review`, data);
    return response.data;
  },
  listSolutions: async (questionId, params) => {
    const response = await api.get(`/community/solutions/${questionId}`, { params });
    return response.data;
  },
  submitSolution: async (data) => {
    const response = await api.post('/community/solutions', data);
    return response.data;
  },
  voteSolution: async (solutionId, voteType) => {
    const response = await api.post(`/community/solutions/${solutionId}/vote`, { vote_type: voteType });
    return response.data;
  },
  // Module 8 community repository & OCR engine integrations
  uploadSubmission: async (data) => {
    const response = await api.post('/community/upload', data);
    return response.data;
  },
  getHistory: async (params) => {
    const response = await api.get('/community/history', { params });
    return response.data;
  },
  getReviewQueue: async (params) => {
    const response = await api.get('/community/review', { params });
    return response.data;
  },
  reviewSubmission: async (id, data) => {
    const response = await api.post(`/community/review/${id}`, data);
    return response.data;
  },
  getDuplicates: async (id) => {
    const response = await api.get(`/community/duplicates/${id}`);
    return response.data;
  },
  runOCR: async (jobId) => {
    const response = await api.post('/community/ocr', { jobId });
    return response.data;
  },
  withdrawSubmission: async (id) => {
    const response = await api.post(`/community/withdraw/${id}`);
    return response.data;
  }
};
