import React, { useState, useEffect } from 'react';
import { Filter, RefreshCw, Download, TrendingUp, TrendingDown } from 'lucide-react';
import { signalsAPI } from '../services/api';
import SignalCard from '../components/Signals/SignalCard';
import LoadingSpinner from '../components/Common/LoadingSpinner';

const Signals = () => {
  const [signals, setSignals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    symbol: '',
    signalType: '',
    source: '',
    strength: ''
  });

  useEffect(() => {
    loadSignals();
  }, []);

  const loadSignals = async () => {
    try {
      setLoading(true);
      const response = await signalsAPI.getSignals({ limit: 100 });
      setSignals(response.data.data);
    } catch (error) {
      console.error('Error loading signals:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateSignals = async () => {
    try {
      setLoading(true);
      const symbols = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'META', 'NFLX', 'NVDA'];
      await signalsAPI.generateSignals(symbols);
      await loadSignals(); // Reload signals after generation
    } catch (error) {
      console.error('Error generating signals:', error);
    }
  };

  const filteredSignals = signals.filter(signal => {
    return (
      (!filters.symbol || signal.symbol.includes(filters.symbol.toUpperCase())) &&
      (!filters.signalType || signal.signalType === filters.signalType) &&
      (!filters.source || signal.source === filters.source) &&
      (!filters.strength || signal.strength >= parseFloat(filters.strength))
    );
  });

  const bullishCount = filteredSignals.filter(s => s.signalType === 'BULLISH').length;
  const bearishCount = filteredSignals.filter(s => s.signalType === 'BEARISH').length;

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Trading Signals</h1>
          <p className="text-gray-600 mt-1">Real-time trading signals from market analysis</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={generateSignals}
            className="btn-primary flex items-center space-x-2"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Generate Signals</span>
          </button>
          <button className="btn-secondary flex items-center space-x-2">
            <Download className="h-4 w-4" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Signals</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{filteredSignals.length}</p>
            </div>
            <div className="p-3 bg-primary-50 rounded-lg">
              <Filter className="h-6 w-6 text-primary-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Bullish Signals</p>
              <p className="text-2xl font-bold text-success-600 mt-1">{bullishCount}</p>
            </div>
            <div className="p-3 bg-success-50 rounded-lg">
              <TrendingUp className="h-6 w-6 text-success-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Bearish Signals</p>
              <p className="text-2xl font-bold text-danger-600 mt-1">{bearishCount}</p>
            </div>
            <div className="p-3 bg-danger-50 rounded-lg">
              <TrendingDown className="h-6 w-6 text-danger-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Symbol</label>
            <input
              type="text"
              placeholder="e.g., AAPL"
              value={filters.symbol}
              onChange={(e) => setFilters({ ...filters, symbol: e.target.value })}
              className="input-field"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Signal Type</label>
            <select
              value={filters.signalType}
              onChange={(e) => setFilters({ ...filters, signalType: e.target.value })}
              className="input-field"
            >
              <option value="">All Types</option>
              <option value="BULLISH">Bullish</option>
              <option value="BEARISH">Bearish</option>
              <option value="NEUTRAL">Neutral</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Source</label>
            <select
              value={filters.source}
              onChange={(e) => setFilters({ ...filters, source: e.target.value })}
              className="input-field"
            >
              <option value="">All Sources</option>
              <option value="TECHNICAL">Technical</option>
              <option value="NEWS_SENTIMENT">News Sentiment</option>
              <option value="COMBINED">Combined</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Min Strength</label>
            <select
              value={filters.strength}
              onChange={(e) => setFilters({ ...filters, strength: e.target.value })}
              className="input-field"
            >
              <option value="">Any Strength</option>
              <option value="0.7">Strong (70%+)</option>
              <option value="0.5">Medium (50%+)</option>
              <option value="0.3">Weak (30%+)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Signals List */}
      <div className="space-y-4">
        {filteredSignals.length > 0 ? (
          filteredSignals.map((signal) => (
            <SignalCard key={signal._id} signal={signal} />
          ))
        ) : (
          <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-200">
            <Filter className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No signals found</h3>
            <p className="text-gray-600 mb-4">Try adjusting your filters or generate new signals</p>
            <button
              onClick={generateSignals}
              className="btn-primary"
            >
              Generate Signals
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Signals;