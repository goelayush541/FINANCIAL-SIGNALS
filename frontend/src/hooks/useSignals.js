import { useState, useEffect } from 'react';
import { signalsAPI } from '../services/api';

export const useSignals = (initialFilters = {}) => {
  const [signals, setSignals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState(initialFilters);

  const loadSignals = async (newFilters = filters) => {
    try {
      setLoading(true);
      setError(null);
      
      const params = { ...newFilters };
      if (params.fromDate) {
        params.fromDate = new Date(params.fromDate).toISOString();
      }
      if (params.toDate) {
        params.toDate = new Date(params.toDate).toISOString();
      }

      const response = await signalsAPI.getSignals(params);
      setSignals(response.data.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load signals');
      console.error('Error loading signals:', err);
    } finally {
      setLoading(false);
    }
  };

  const generateSignals = async (symbols) => {
    try {
      setLoading(true);
      setError(null);
      await signalsAPI.generateSignals(symbols);
      await loadSignals(); // Reload signals after generation
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to generate signals');
      console.error('Error generating signals:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateFilters = (newFilters) => {
    setFilters(newFilters);
    loadSignals(newFilters);
  };

  const clearFilters = () => {
    const clearedFilters = {};
    setFilters(clearedFilters);
    loadSignals(clearedFilters);
  };

  useEffect(() => {
    loadSignals();
  }, []);

  return {
    signals,
    loading,
    error,
    filters,
    loadSignals,
    generateSignals,
    updateFilters,
    clearFilters
  };
};