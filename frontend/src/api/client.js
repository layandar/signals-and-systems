import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8030';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const api = {
  // Health check
  healthCheck: async () => {
    const response = await apiClient.get('/api/health');
    return response.data;
  },

  // Predict activity from uploaded file
  predictActivity: async (file) => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await apiClient.post('/api/predict', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  },

  // Get available activities
  getActivities: async () => {
    const response = await apiClient.get('/api/activities');
    return response.data;
  },
};

export default apiClient;
