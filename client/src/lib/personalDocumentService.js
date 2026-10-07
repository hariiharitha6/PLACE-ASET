import api from './api';

/**
 * Robustly unwrap API response payload.
 * Backend endpoints return: { success: true, data: T }
 * api.js response interceptor returns: response.data (which is { success: true, data: T })
 * This helper unwraps T whether res is { success, data }, raw axios { data: { success, data } }, or T directly.
 */
function unwrapResponse(res) {
  if (res == null) return null;

  if (typeof res === 'object') {
    // Check if nested axios raw response: { data: { success: true, data: ... } }
    if ('data' in res && res.data !== undefined) {
      if (res.data && typeof res.data === 'object' && 'data' in res.data && res.data.data !== undefined) {
        return res.data.data;
      }
      return res.data;
    }
  }

  return res;
}

export const personalDocumentService = {
  // Upload and process a real file (PDF, DOCX, TXT, images) via multipart/form-data
  uploadFile: async (formData) => {
    const res = await api.post('/ai/personal/documents', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return unwrapResponse(res);
  },

  // Upload and process a personal document (notes, JSON, rawText)
  uploadDocument: async (documentData) => {
    const res = await api.post('/ai/personal/documents', documentData);
    return unwrapResponse(res);
  },

  // Get secure signed URL for viewing document
  getSignedUrl: async (id) => {
    const res = await api.get(`/ai/personal/documents/${id}/signed-url`);
    const payload = unwrapResponse(res);
    return payload?.signedUrl || (typeof payload === 'string' ? payload : null);
  },

  // List all personal documents for the authenticated user
  getUserDocuments: async () => {
    const res = await api.get('/ai/personal/documents');
    const payload = unwrapResponse(res);
    if (Array.isArray(payload)) return payload;
    if (payload?.documents && Array.isArray(payload.documents)) return payload.documents;
    return [];
  },

  // Get single personal document details (with AI summary, flashcards, quiz)
  getDocumentById: async (id) => {
    const res = await api.get(`/ai/personal/documents/${id}`);
    return unwrapResponse(res);
  },

  // Delete personal document
  deleteDocument: async (id) => {
    const res = await api.delete(`/ai/personal/documents/${id}`);
    return unwrapResponse(res);
  },

  // Ask AI a question grounded in this specific document
  askDocumentAI: async (id, query) => {
    const res = await api.post(`/ai/personal/documents/${id}/ask`, { query });
    return unwrapResponse(res);
  },

  // Collections
  getUserCollections: async () => {
    const res = await api.get('/ai/personal/collections');
    const payload = unwrapResponse(res);
    if (Array.isArray(payload)) return payload;
    return [];
  },

  createCollection: async (collectionData) => {
    const res = await api.post('/ai/personal/collections', collectionData);
    return unwrapResponse(res);
  }
};
