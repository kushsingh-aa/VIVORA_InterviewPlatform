import axios from 'axios';

// Base URL points to current origin in production or http://localhost:5000 in dev
const API_BASE = window.location.origin.includes('http') && !window.location.origin.startsWith('file://')
  ? ''
  : 'http://localhost:5000';

const api = axios.create({
  baseURL: API_BASE,
  timeout: 35000,
});

// Request interceptor to attach JWT token and custom API key from localStorage
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('vivora_token');
    const customApiKey = localStorage.getItem('vivora_api_key');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    if (customApiKey) {
      config.headers['x-api-key'] = customApiKey;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
