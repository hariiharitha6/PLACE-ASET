import api from './api';

export const personalDocumentService = {
  // Upload and process a real file (PDF, DOCX, TXT, images) via multipart/form-data
  uploadFile: async (formData) => {
    const res = await api.post('/ai/personal/documents', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return res.data?.data;
  },

  // Upload and process a personal document (notes, JSON, rawText)
  uploadDocument: async (documentData) => {
    const res = await api.post('/ai/personal/documents', documentData);
    return res.data?.data;
  },

  // Get secure signed URL for viewing document
  getSignedUrl: async (id) => {
    const res = await api.get(`/ai/personal/documents/${id}/signed-url`);
    return res.data?.data?.signedUrl;
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
