import React, { useState } from 'react';
import { X } from 'lucide-react';

const BacktestForm = ({ onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    strategy: 'MOVING_AVERAGE_CROSSOVER',
    symbols: ['AAPL', 'MSFT', 'GOOGL'],
    startDate: '2023-01-01',
    endDate: '2023-12-31',
    parameters: {
      shortPeriod: 20,
      longPeriod: 50,
      rsiPeriod: 14,
      oversold: 30,
      overbought: 70
    }
  });

  const strategies = {
    MOVING_AVERAGE_CROSSOVER: {
      name: 'Moving Average Crossover',
      parameters: ['shortPeriod', 'longPeriod']
    },
    RSI_STRATEGY: {
      name: 'RSI Strategy',
      parameters: ['rsiPeriod', 'oversold', 'overbought']
    },
    SENTIMENT_DRIVEN: {
      name: 'Sentiment Driven',
      parameters: []
    },
    COMBINED_SIGNALS: {
      name: 'Combined Signals',
      parameters: []
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleSymbolChange = (index, value) => {
    const newSymbols = [...formData.symbols];
    newSymbols[index] = value.toUpperCase();
    setFormData({ ...formData, symbols: newSymbols });
  };

  const addSymbol = () => {
    setFormData({
      ...formData,
      symbols: [...formData.symbols, '']
    });
  };

  const removeSymbol = (index) => {
    const newSymbols = formData.symbols.filter((_, i) => i !== index);
    setFormData({ ...formData, symbols: newSymbols });
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">Run Backtest</h2>
        <button
          onClick={onCancel}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Backtest Name</label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="input-field"
            placeholder="e.g., MA Crossover Test Q1 2023"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Strategy</label>
            <select
              value={formData.strategy}
              onChange={(e) => setFormData({ ...formData, strategy: e.target.value })}
              className="input-field"
            >
              {Object.entries(strategies).map(([value, strategy]) => (
                <option key={value} value={value}>{strategy.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Symbols</label>
            <div className="space-y-2">
              {formData.symbols.map((symbol, index) => (
                <div key={index} className="flex space-x-2">
                  <input
                    type="text"
                    required
                    value={symbol}
                    onChange={(e) => handleSymbolChange(index, e.target.value)}
                    className="input-field flex-1"
                    placeholder="e.g., AAPL"
                  />
                  {formData.symbols.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeSymbol(index)}
                      className="px-3 py-2 text-danger-600 hover:text-danger-700 transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={addSymbol}
                className="text-sm text-primary-600 hover:text-primary-700 font-medium"
              >
                + Add Symbol
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
            <input
              type="date"
              required
              value={formData.startDate}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
            <input
              type="date"
              required
              value={formData.endDate}
              onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
              className="input-field"
            />
          </div>
        </div>

        {/* Strategy Parameters */}
        {strategies[formData.strategy].parameters.length > 0 && (
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Strategy Parameters</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {strategies[formData.strategy].parameters.includes('shortPeriod') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Short Period</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={formData.parameters.shortPeriod}
                    onChange={(e) => setFormData({
                      ...formData,
                      parameters: { ...formData.parameters, shortPeriod: parseInt(e.target.value) }
                    })}
                    className="input-field"
                  />
                </div>
              )}
              {strategies[formData.strategy].parameters.includes('longPeriod') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Long Period</label>
                  <input
                    type="number"
                    min="1"
                    max="200"
                    value={formData.parameters.longPeriod}
                    onChange={(e) => setFormData({
                      ...formData,
                      parameters: { ...formData.parameters, longPeriod: parseInt(e.target.value) }
                    })}
                    className="input-field"
                  />
                </div>
              )}
              {strategies[formData.strategy].parameters.includes('rsiPeriod') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">RSI Period</label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={formData.parameters.rsiPeriod}
                    onChange={(e) => setFormData({
                      ...formData,
                      parameters: { ...formData.parameters, rsiPeriod: parseInt(e.target.value) }
                    })}
                    className="input-field"
                  />
                </div>
              )}
              {strategies[formData.strategy].parameters.includes('oversold') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Oversold Level</label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={formData.parameters.oversold}
                    onChange={(e) => setFormData({
                      ...formData,
                      parameters: { ...formData.parameters, oversold: parseInt(e.target.value) }
                    })}
                    className="input-field"
                  />
                </div>
              )}
              {strategies[formData.strategy].parameters.includes('overbought') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Overbought Level</label>
                  <input
                    type="number"
                    min="50"
                    max="100"
                    value={formData.parameters.overbought}
                    onChange={(e) => setFormData({
                      ...formData,
                      parameters: { ...formData.parameters, overbought: parseInt(e.target.value) }
                    })}
                    className="input-field"
                  />
                </div>
              )}
            </div>
          </div>
        )}

        <div className="flex space-x-4 pt-6 border-t border-gray-200">
          <button type="submit" className="btn-primary flex-1">Run Backtest</button>
          <button type="button" onClick={onCancel} className="btn-secondary flex-1">Cancel</button>
        </div>
      </form>
    </div>
  );
};

export default BacktestForm;