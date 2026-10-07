import api from './api';

export const assistantService = {
  /**
   * Send a chat message with optional conversationId and context
   */
  sendMessage: async ({ message, conversationId, context, mode }) => {
    const response = await api.post('/assistant/chat', {
      message,
      conversationId,
      context,
      mode,
    });
    return response.data;
  },

  /**
   * Get user's conversation threads
   */
  getConversations: async () => {
    const response = await api.get('/assistant/conversations');
    return response.data;
  },

  /**
   * Create a new conversation thread
   */
  createConversation: async ({ title, category } = {}) => {
    const response = await api.post('/assistant/conversations', {
      title,
      category,
    });
    return response.data;
  },

  /**
   * Get messages in a conversation
   */
  getMessages: async (conversationId) => {
    const response = await api.get(`/assistant/conversations/${conversationId}/messages`);
    return response.data;
  },

  /**
   * Rename a conversation
   */
  renameConversation: async (conversationId, title) => {
    const response = await api.patch(`/assistant/conversations/${conversationId}`, {
      title,
    });
    return response.data;
  },

  /**
   * Delete a conversation
   */
  deleteConversation: async (conversationId) => {
    const response = await api.delete(`/assistant/conversations/${conversationId}`);
    return response.data;
  },

  /**
   * Clear messages in a conversation
   */
  clearConversation: async (conversationId) => {
    const response = await api.post(`/assistant/conversations/${conversationId}/clear`);
    return response.data;
  },

  /**
   * Execute quick study action
   */
  executeQuickAction: async (action) => {
    const response = await api.post('/assistant/quick-action', { action });
    return response.data;
  },

  /**
   * Check AI provider and engine status
   */
  getStatus: async () => {
    const response = await api.get('/assistant/status');
    return response.data;
  },
};
