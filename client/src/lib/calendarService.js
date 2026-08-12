import api from './api';

export const calendarService = {
  getEvents: async (params) => {
    const response = await api.get('/calendar/events', { params });
    return response.data;
  },
  createEvent: async (data) => {
    const response = await api.post('/calendar/events', data);
    return response.data;
  },
  deleteEvent: async (id) => {
    const response = await api.delete(`/calendar/events/${id}`);
    return response.data;
  },
  generateAISchedule: async (scheduleType) => {
    const response = await api.post('/calendar/ai-schedule', { scheduleType });
    return response.data;
  }
};
