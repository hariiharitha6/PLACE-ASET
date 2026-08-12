import api from './api';

export const certificateService = {
  getUserCertificates: async () => {
    const response = await api.get('/certificates');
    return response.data;
  },
  getCertificateDetail: async (id) => {
    const response = await api.get(`/certificates/${id}`);
    return response.data;
  },
  verifyCertificate: async (code) => {
    const response = await api.get(`/certificates/verify/${code}`);
    return response.data;
  },
  issueCertificate: async (data) => {
    const response = await api.post('/certificates/issue', data);
    return response.data;
  },
  getUserAchievements: async () => {
    const response = await api.get('/certificates/achievements');
    return response.data;
  },
  checkAndUnlockAchievements: async () => {
    const response = await api.post('/certificates/achievements/check');
    return response.data;
  }
};
