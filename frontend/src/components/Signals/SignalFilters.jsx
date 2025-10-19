import React from 'react';
import { Filter, X } from 'lucide-react';

const SignalFilters = ({ filters, onFiltersChange, onClearFilters }) => {
  const handleFilterChange = (key, value) => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
  };

  const hasActiveFilters = Object.values(filters).some(value => value !== '');

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
          <Filter className="h-5 w-5" />
          <span>Filters</span>
        </h3>
        
        {hasActiveFilters && (
          <button
            onClick={onClearFilters}
            className="flex items-center space-x-1 text-sm text-gray-600 hover:text-gray-700"
          >
            <X className="h-4 w-4" />
            <span>Clear All</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Symbol Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Symbol
          </label>
          <input
            type="text"
            placeholder="e.g., AAPL"
            value={filters.symbol || ''}
            onChange={(e) => handleFilterChange('symbol', e.target.value)}
            className="input-field"
          />
        </div>

        {/* Signal Type Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Signal Type
          </label>
          <select
            value={filters.signalType || ''}
            onChange={(e) => handleFilterChange('signalType', e.target.value)}
            className="input-field"
          >
            <option value="">All Types</option>
            <option value="BULLISH">Bullish</option>
            <option value="BEARISH">Bearish</option>
            <option value="NEUTRAL">Neutral</option>
          </select>
        </div>

        {/* Source Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Source
          </label>
          <select
            value={filters.source || ''}
            onChange={(e) => handleFilterChange('source', e.target.value)}
            className="input-field"
          >
            <option value="">All Sources</option>
            <option value="TECHNICAL">Technical</option>
            <option value="NEWS_SENTIMENT">News Sentiment</option>
            <option value="COMBINED">Combined</option>
          </select>
        </div>

        {/* Strength Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Min Strength
          </label>
          <select
            value={filters.strength || ''}
            onChange={(e) => handleFilterChange('strength', e.target.value)}
            className="input-field"
          >
            <option value="">Any Strength</option>
            <option value="0.8">Very Strong (80%+)</option>
            <option value="0.7">Strong (70%+)</option>
            <option value="0.5">Medium (50%+)</option>
            <option value="0.3">Weak (30%+)</option>
          </select>
        </div>
      </div>

      {/* Date Range Filter */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            From Date
          </label>
          <input
            type="date"
            value={filters.fromDate || ''}
            onChange={(e) => handleFilterChange('fromDate', e.target.value)}
            className="input-field"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            To Date
          </label>
          <input
            type="date"
            value={filters.toDate || ''}
            onChange={(e) => handleFilterChange('toDate', e.target.value)}
            className="input-field"
          />
        </div>
      </div>
    </div>
  );
};

export default SignalFilters;