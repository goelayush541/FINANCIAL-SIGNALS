import axios from 'axios';

// Use environment variable for production, fallback to localhost for development
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://financial-signals.vercel.app/api';
console.log('API Base URL:', API_BASE_URL);

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 second timeout
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      // Only redirect if we're not already on login page
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  verifyToken: () => api.get('/auth/verify'),
};

export const signalsAPI = {
  getSignals: (params) => api.get('/signals', { params }),
  generateSignals: (symbols) => api.post('/signals/generate', { symbols }),
  getStats: (params) => api.get('/signals/stats', { params }),
  getSignal: (id) => api.get(`/signals/${id}`),
  deleteSignal: (id) => api.delete(`/signals/${id}`),
};

export const backtestingAPI = {
  runBacktest: (data) => api.post('/backtesting/run', data),
  getHistory: (params) => api.get('/backtesting/history', { params }),
  getBacktest: (id) => api.get(`/backtesting/${id}`),
  deleteBacktest: (id) => api.delete(`/backtesting/${id}`),
  getMetrics: () => api.get('/backtesting/metrics'),
};

export const marketDataAPI = {
  getIntraday: (symbol, params) => api.get(`/market-data/intraday/${symbol}`, { params }),
  searchSymbols: (query) => api.get('/market-data/search', { params: { q: query } }),
  getBatchData: (symbols) => api.post('/market-data/batch', { symbols }),
  getDaily: (symbol) => api.get(`/market-data/daily/${symbol}`),
};

export const newsAPI = {
  getNews: (params) => api.get('/news', { params }),
  getSymbolNews: (symbol, params) => api.get(`/news/symbol/${symbol}`, { params }),
};

export const portfolioAPI = {
  getPortfolios: () => api.get('/portfolio'),
  getPortfolio: (id) => api.get(`/portfolio/${id}`),
  createPortfolio: (data) => api.post('/portfolio', data),
  addPosition: (portfolioId, data) => api.post(`/portfolio/${portfolioId}/positions`, data),
  updatePortfolioValues: (portfolioId) => api.post(`/portfolio/${portfolioId}/update-values`),
  removePosition: (portfolioId, symbol, quantity) => api.delete(`/portfolio/${portfolioId}/positions`, {
    data: { symbol, quantity }
  }),
};

export default api;