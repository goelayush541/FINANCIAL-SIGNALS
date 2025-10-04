import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
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

// Handle token expiration and invalid tokens
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Check if the error indicates we should clear the token
      if (error.response.data?.clearToken) {
        localStorage.removeItem('token');
      }
      
      // Only redirect to login if we're not already on login page
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
  getDaily: (symbol) => api.get(`/market-data/daily/${symbol}`),
  searchSymbols: (query) => api.get('/market-data/search', { params: { q: query } }),
  getBatchData: (symbols) => api.post('/market-data/batch', { symbols }),
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