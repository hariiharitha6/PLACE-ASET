import api from './api';

export const mentorService = {
  getUserChats: async () => {
    const response = await api.get('/mentor/chats');
    return response.data;
  },
  createChatSession: async (data) => {
    const response = await api.post('/mentor/chats', data);
    return response.data;
  },
  getChatMessages: async (chatId) => {
    const response = await api.get(`/mentor/chats/${chatId}/messages`);
    return response.data;
  },
  sendMentorMessage: async (chatId, data) => {
    const response = await api.post(`/mentor/chats/${chatId}/messages`, data);
    return response.data;
  },
  executeQuickPrompt: async (mode) => {
    const response = await api.post('/mentor/quick-prompt', { mode });
    return response.data;
  }
};
