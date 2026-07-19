import api from './api';

export const challengeService = {
  /**
   * Lists challenges with optional query filters (status, page, limit).
   */
  listChallenges: async (params) => {
    const response = await api.get('/challenges', { params });
    return response.data;
  },

  /**
   * Fetches basic challenge details.
   */
  getChallengeDetails: async (id) => {
    const response = await api.get(`/challenges/${id}`);
    return response.data;
  },

  /**
   * Starts a candidate's challenge session, returning the question objects.
   */
  startChallenge: async (id) => {
    const response = await api.post(`/challenges/${id}/start`);
    return response.data;
  },

  /**
   * Periodically auto-saves student answers progress.
   */
  saveProgress: async (id, answers) => {
    const response = await api.post(`/challenges/${id}/answers`, { answers });
    return response.data;
  },

  /**
   * Finalizes the challenge attempt.
   */
  finalizeAttempt: async (id) => {
    const response = await api.post(`/challenges/${id}/finalize`);
    return response.data;
  },

  /**
   * Logs a tab blur or visibility shift event.
   */
  logActivity: async (id, event_type, details) => {
    const response = await api.post(`/challenges/${id}/activity`, { event_type, details });
    return response.data;
  },

  /**
   * Retrieves results scorecard and ranking leaderboard lists.
   */
  getChallengeResults: async (id) => {
    const response = await api.get(`/challenges/${id}/results`);
    return response.data;
  },

  /**
   * Fetches discussion thread comments.
   */
  getChallengeDiscussions: async (id) => {
    const response = await api.get(`/challenges/${id}/discussions`);
    return response.data;
  },

  /**
   * Posts a discussion comment or reply.
   */
  postComment: async (id, comment, parent_id) => {
    const response = await api.post(`/challenges/${id}/discussions`, { comment, parent_id });
    return response.data;
  },

  /**
   * Fetches challenge questions with correct answers (solutions view).
   * Only available after challenge ends.
   */
  getChallengeQuestionsWithSolutions: async (id) => {
    const response = await api.get(`/challenges/${id}/solutions`);
    return response.data;
  },

  /**
   * Creates a new challenge (Host/Admin only).
   */
  createChallenge: async (data) => {
    const response = await api.post('/challenges', data);
    return response.data;
  },

  /**
   * Updates an existing challenge (Host/Admin only).
   */
  updateChallenge: async (id, data) => {
    const response = await api.put(`/challenges/${id}`, data);
    return response.data;
  },

  /**
   * Deletes a challenge (Host/Admin only).
   */
  deleteChallenge: async (id) => {
    const response = await api.delete(`/challenges/${id}`);
    return response.data;
  },

  /**
   * Clones a challenge base and maps questions (Host/Admin only).
   */
  cloneChallenge: async (id) => {
    const response = await api.post(`/challenges/${id}/clone`);
    return response.data;
  },

  /**
   * Assigns a list of questions to the challenge (Host/Admin only).
   */
  assignQuestions: async (id, questions) => {
    const response = await api.post(`/challenges/${id}/questions`, { questions });
    return response.data;
  },

  /**
   * Publishes a challenge (Host/Admin only).
   */
  publishChallenge: async (id) => {
    const response = await api.post(`/challenges/${id}/publish`);
    return response.data;
  },

  /**
   * Unpublishes a challenge back to draft (Host/Admin only).
   */
  unpublishChallenge: async (id) => {
    const response = await api.post(`/challenges/${id}/unpublish`);
    return response.data;
  },

  /**
   * Archives a challenge (Host/Admin only).
   */
  archiveChallenge: async (id) => {
    const response = await api.post(`/challenges/${id}/archive`);
    return response.data;
  },

  /**
   * Fetches analytics data for a challenge (Host/Admin only).
   */
  getChallengeAnalytics: async (id) => {
    const response = await api.get(`/challenges/${id}/analytics`);
    return response.data;
  },
};
