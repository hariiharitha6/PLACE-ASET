import api from './api';

export const personalDocumentService = {
  // Upload and process a personal document (notes, PDF, code, study guide)
  uploadDocument: async (documentData) => {
    const res = await api.post('/ai/personal/documents', documentData);
    return res.data?.data;
  },

  // List all personal documents for the authenticated user
  getUserDocuments: async () => {
    const res = await api.get('/ai/personal/documents');
    return res.data?.data || [];
  },

  // Get single personal document details (with AI summary, flashcards, quiz)
  getDocumentById: async (id) => {
    const res = await api.get(`/ai/personal/documents/${id}`);
    return res.data?.data;
  },

  // Delete personal document
  deleteDocument: async (id) => {
    const res = await api.delete(`/ai/personal/documents/${id}`);
    return res.data?.data;
  },

  // Ask AI a question grounded in this specific document
  askDocumentAI: async (id, query) => {
    const res = await api.post(`/ai/personal/documents/${id}/ask`, { query });
    return res.data?.data;
  },

  // Collections
  getUserCollections: async () => {
    const res = await api.get('/ai/personal/collections');
    return res.data?.data || [];
  },

  createCollection: async (collectionData) => {
    const res = await api.post('/ai/personal/collections', collectionData);
    return res.data?.data;
  }
};
