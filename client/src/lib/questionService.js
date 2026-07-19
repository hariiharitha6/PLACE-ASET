import api from './api';

export const questionService = {
  /**
   * Searches and filters questions in the question bank.
   */
  searchAndFilter: async (params) => {
    const response = await api.get('/questions', { params });
    return response.data;
  },

  /**
   * Retrieves detail parameter for a question by its ID.
   */
  getQuestionDetails: async (id) => {
    const response = await api.get(`/questions/${id}`);
    return response.data;
  },

  /**
   * Submits a new question to the bank.
   */
  createQuestion: async (data) => {
    const response = await api.post('/questions', data);
    return response.data;
  },

  /**
   * Updates an existing question details and logs a new version.
   */
  updateQuestion: async (id, data) => {
    const response = await api.put(`/questions/${id}`, data);
    return response.data;
  },

  /**
   * Deletes a question completely from the bank.
   */
  deleteQuestion: async (id) => {
    const response = await api.delete(`/questions/${id}`);
    return response.data;
  },

  /**
   * Archives a question.
   */
  archiveQuestion: async (id) => {
    const response = await api.put(`/questions/${id}/archive`);
    return response.data;
  },

  /**
   * Restores an archived question.
   */
  restoreQuestion: async (id) => {
    const response = await api.put(`/questions/${id}/restore`);
    return response.data;
  },

  /**
   * Clones a question structure.
   */
  cloneQuestion: async (id) => {
    const response = await api.post(`/questions/${id}/clone`);
    return response.data;
  },

  /**
   * Retrieves previous versions history logs for a question.
   */
  getVersionHistory: async (id) => {
    const response = await api.get(`/questions/${id}/history`);
    return response.data;
  },

  /**
   * Fetches a randomized set of practice questions.
   */
  getRandomQuestions: async (params) => {
    const response = await api.get('/questions/random', { params });
    return response.data;
  },

  /**
   * Retrieves total statistics for the question bank.
   */
  getStatistics: async () => {
    const response = await api.get('/questions/statistics');
    return response.data;
  }
};
