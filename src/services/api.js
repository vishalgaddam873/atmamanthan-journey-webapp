import axios from 'axios';

const API_BASE_URL = 'http://localhost:5001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Audio endpoints
export const getCommonAudio = () => api.get('/audio/common');
export const getEmotionAudio = (category) => api.get(`/audio/emotion/${category}`);

// Image endpoints
export const getEmotionImages = () => api.get('/images/emotions');
export const getAgeGroupImages = (ageGroup, category) => 
  api.get(`/images/age-group/${ageGroup}/${category}`);

// Session endpoints
export const createSession = (ageGroup) => api.post('/sessions', { ageGroup });
export const getActiveSession = () => api.get('/sessions/active');
export const getSession = (sessionId) => api.get(`/sessions/${sessionId}`);
export const updateSessionEmotion = (sessionId, emotion) => 
  api.patch(`/sessions/${sessionId}/emotion`, { emotion });
export const updateSessionPran = (sessionId, pran) => 
  api.patch(`/sessions/${sessionId}/pran`, { pran });
export const stopSession = (sessionId) => api.post(`/sessions/${sessionId}/stop`);
export const getAllSessions = (filters) => api.get('/sessions', { params: filters });

// Admin endpoints
export const getAnalytics = () => api.get('/admin/analytics');
export const getPranOptions = (category) => api.get(`/admin/pran-options/${category}`);

export default api;

