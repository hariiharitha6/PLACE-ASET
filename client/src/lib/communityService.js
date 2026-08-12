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

  // Module 4.2 Discussions API
  listDiscussions: async (params) => {
    const response = await api.get('/community/discussions', { params });
    return response.data;
  },
  getDiscussionDetail: async (id) => {
    const response = await api.get(`/community/discussions/${id}`);
    return response.data;
  },
  createDiscussion: async (data) => {
    const response = await api.post('/community/discussions', data);
    return response.data;
  },
  createReply: async (discussionId, data) => {
    const response = await api.post(`/community/discussions/${discussionId}/replies`, data);
    return response.data;
  },
  acceptAnswer: async (discussionId, replyId) => {
    const response = await api.patch(`/community/discussions/${discussionId}/replies/${replyId}/accept`);
    return response.data;
  },
  toggleReaction: async (data) => {
    const response = await api.post('/community/discussions/react', data);
    return response.data;
  },
  toggleBookmark: async (id) => {
    const response = await api.post(`/community/discussions/${id}/bookmark`);
    return response.data;
  },
  getAISuggestedAnswer: async (id) => {
    const response = await api.get(`/community/discussions/${id}/ai-suggest`);
    return response.data;
  },
  togglePin: async (id) => {
    const response = await api.patch(`/community/discussions/${id}/pin`);
    return response.data;
  },
  reportContent: async (data) => {
    const response = await api.post('/community/reports', data);
    return response.data;
  },

  // Community repository & OCR engine integrations
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
