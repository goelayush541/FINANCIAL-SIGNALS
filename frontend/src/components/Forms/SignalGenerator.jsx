import React, { useState } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';

const SignalGenerator = ({ onGenerate, onCancel, loading = false }) => {
  const [symbols, setSymbols] = useState(['AAPL', 'MSFT', 'GOOGL']);
  const [customSymbol, setCustomSymbol] = useState('');

  const popularSymbols = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'META', 'NFLX', 'NVDA'];

  const handleAddSymbol = (symbol) => {
    if (symbol && !symbols.includes(symbol.toUpperCase())) {
      setSymbols([...symbols, symbol.toUpperCase()]);
      setCustomSymbol('');
    }
  };

  const handleRemoveSymbol = (symbolToRemove) => {
    setSymbols(symbols.filter(symbol => symbol !== symbolToRemove));
  };

  const handleAddPopularSymbol = (symbol) => {
    if (!symbols.includes(symbol)) {
      setSymbols([...symbols, symbol]);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (symbols.length > 0) {
      onGenerate(symbols);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">Generate Trading Signals</h2>
            <button
              onClick={onCancel}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <p className="text-gray-600 mt-1">
            Select symbols to generate trading signals based on technical analysis and news sentiment.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Selected Symbols */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Selected Symbols ({symbols.length})
            </label>
            <div className="flex flex-wrap gap-2 mb-3">
              {symbols.map((symbol) => (
                <div
                  key={symbol}
                  className="flex items-center space-x-2 bg-primary-100 text-primary-800 px-3 py-1 rounded-full text-sm font-medium"
                >
                  <span>{symbol}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveSymbol(symbol)}
                    className="text-primary-600 hover:text-primary-800 transition-colors"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
              
              {symbols.length === 0 && (
                <p className="text-gray-500 text-sm">No symbols selected. Add symbols below.</p>
              )}
            </div>
          </div>

          {/* Add Custom Symbol */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Add Custom Symbol
            </label>
            <div className="flex space-x-2">
              <input
                type="text"
                value={customSymbol}
                onChange={(e) => setCustomSymbol(e.target.value.toUpperCase())}
                placeholder="Enter symbol (e.g., AAPL)"
                className="input-field flex-1"
                maxLength={5}
              />
              <button
                type="button"
                onClick={() => handleAddSymbol(customSymbol)}
                disabled={!customSymbol.trim()}
                className="btn-primary flex items-center space-x-1 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus className="h-4 w-4" />
                <span>Add</span>
              </button>
            </div>
          </div>

          {/* Popular Symbols */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Popular Symbols
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {popularSymbols.map((symbol) => (
                <button
                  key={symbol}
                  type="button"
                  onClick={() => handleAddPopularSymbol(symbol)}
                  disabled={symbols.includes(symbol)}
                  className={`p-2 rounded-lg border text-sm font-medium transition-colors ${
                    symbols.includes(symbol)
                      ? 'bg-gray-100 text-gray-400 border-gray-300 cursor-not-allowed'
                      : 'bg-white text-gray-700 border-gray-300 hover:border-primary-500 hover:text-primary-600'
                  }`}
                >
                  {symbol}
                </button>
              ))}
            </div>
          </div>

          {/* Quick Add Groups */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Quick Add Groups
            </label>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setSymbols(['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'META'])}
                className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
              >
                Tech Giants
              </button>
              <button
                type="button"
                onClick={() => setSymbols(['JPM', 'BAC', 'WFC', 'GS', 'MS'])}
                className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
              >
                Banks
              </button>
              <button
                type="button"
                onClick={() => setSymbols(['XOM', 'CVX', 'COP', 'SLB', 'EOG'])}
                className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
              >
                Energy
              </button>
              <button
                type="button"
                onClick={() => setSymbols(popularSymbols)}
                className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
              >
                All Popular
              </button>
            </div>
          </div>

          {/* Clear All Button */}
          {symbols.length > 0 && (
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setSymbols([])}
                className="flex items-center space-x-1 text-sm text-danger-600 hover:text-danger-700 font-medium"
              >
                <Trash2 className="h-4 w-4" />
                <span>Clear All Symbols</span>
              </button>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-4 pt-6 border-t border-gray-200">
            <button
              type="submit"
              disabled={symbols.length === 0 || loading}
              className="btn-primary flex-1 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Generating...</span>
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" />
                  <span>Generate Signals ({symbols.length} symbols)</span>
                </>
              )}
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="btn-secondary flex-1"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SignalGenerator;