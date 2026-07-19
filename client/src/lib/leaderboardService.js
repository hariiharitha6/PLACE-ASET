import api from './api';

export const leaderboardService = {
  getPracticeLeaderboard: async (params) => {
    const response = await api.get('/leaderboard/practice', { params });
    return response.data;
  },
  getChallengeLeaderboard: async (params) => {
    const response = await api.get('/leaderboard/challenges', { params });
    return response.data;
  },
  getContributorLeaderboard: async (params) => {
    const response = await api.get('/leaderboard/contributors', { params });
    return response.data;
  },
  getUserBadges: async () => {
    const response = await api.get('/leaderboard/badges');
    return response.data;
  },
  checkBadges: async () => {
    const response = await api.post('/leaderboard/badges/check');
    return response.data;
  },
  getXPHistory: async (params) => {
    const response = await api.get('/leaderboard/xp-history', { params });
    return response.data;
  },
  // Module 7 achievement & badges endpoints
  getAchievements: async () => {
    const response = await api.get('/achievements');
    return response.data;
  },
  getBadgesList: async () => {
    const response = await api.get('/badges');
    return response.data;
  }
};
