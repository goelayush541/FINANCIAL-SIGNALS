import React, { useState, useEffect } from 'react';
import { Play, History, BarChart3, TrendingUp } from 'lucide-react';
import { backtestingAPI } from '../services/api';
import BacktestForm from '../components/Forms/BacktestForm';
import LoadingSpinner from '../components/Common/LoadingSpinner';

const Backtesting = () => {
  const [backtests, setBacktests] = useState([]);
  const [selectedBacktest, setSelectedBacktest] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    loadBacktestHistory();
  }, []);

  const loadBacktestHistory = async () => {
    try {
      const response = await backtestingAPI.getHistory({ limit: 10 });
      setBacktests(response.data.data);
    } catch (error) {
      console.error('Error loading backtest history:', error);
    }
  };

  const runBacktest = async (backtestData) => {
    try {
      setLoading(true);
      const response = await backtestingAPI.runBacktest(backtestData);
      await loadBacktestHistory(); // Refresh history
      setSelectedBacktest(response.data.data);
      setShowForm(false);
    } catch (error) {
      console.error('Error running backtest:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num) => {
    if (num === undefined || num === null) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(num);
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Strategy Backtesting</h1>
          <p className="text-gray-600 mt-1">Test trading strategies with historical data</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="btn-primary flex items-center space-x-2"
        >
          <Play className="h-4 w-4" />
          <span>Run Backtest</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Backtest Form */}
        {showForm && (
          <div className="lg:col-span-3">
            <BacktestForm 
              onSubmit={runBacktest} 
              onCancel={() => setShowForm(false)}
            />
          </div>
        )}

        {/* Selected Backtest Results */}
        {selectedBacktest && (
          <div className="lg:col-span-3">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Backtest Results</h2>
                <p className="text-sm text-gray-600">{selectedBacktest.name}</p>
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gray-900">
                      {formatNumber(selectedBacktest.results.totalReturn)}%
                    </p>
                    <p className="text-sm text-gray-600">Total Return</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gray-900">
                      {formatNumber(selectedBacktest.results.winRate * 100)}%
                    </p>
                    <p className="text-sm text-gray-600">Win Rate</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gray-900">
                      {selectedBacktest.results.totalTrades}
                    </p>
                    <p className="text-sm text-gray-600">Total Trades</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gray-900">
                      {formatNumber(selectedBacktest.results.sharpeRatio)}
                    </p>
                    <p className="text-sm text-gray-600">Sharpe Ratio</p>
                  </div>
                </div>

                {/* Trades Table */}
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead>
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Symbol</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Entry</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Exit</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">P&L</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {selectedBacktest.trades.slice(0, 10).map((trade, index) => (
                        <tr key={index}>
                          <td className="px-4 py-3 text-sm font-medium text-gray-900">{trade.symbol}</td>
                          <td className="px-4 py-3 text-sm">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              trade.action === 'BUY' 
                                ? 'bg-success-100 text-success-700'
                                : 'bg-danger-100 text-danger-700'
                            }`}>
                              {trade.action}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900">${formatNumber(trade.entryPrice)}</td>
                          <td className="px-4 py-3 text-sm text-gray-900">${formatNumber(trade.exitPrice)}</td>
                          <td className={`px-4 py-3 text-sm font-medium ${
                            trade.pnl >= 0 ? 'text-success-600' : 'text-danger-600'
                          }`}>
                            ${formatNumber(trade.pnl)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Backtest History */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                <History className="h-5 w-5" />
                <span>Backtest History</span>
              </h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {backtests.map((backtest) => (
                  <div 
                    key={backtest._id}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedBacktest?._id === backtest._id 
                        ? 'border-primary-500 bg-primary-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedBacktest(backtest)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-gray-900">{backtest.name}</h3>
                        <p className="text-sm text-gray-600">
                          {backtest.symbols.join(', ')} • {backtest.strategy.replace(/_/g, ' ')}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className={`text-lg font-bold ${
                          backtest.results.totalReturn >= 0 ? 'text-success-600' : 'text-danger-600'
                        }`}>
                          {formatNumber(backtest.results.totalReturn)}%
                        </p>
                        <p className="text-xs text-gray-500">Return</p>
                      </div>
                    </div>
                  </div>
                ))}
                
                {backtests.length === 0 && (
                  <div className="text-center py-8">
                    <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No backtests yet. Run your first backtest!</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Strategy Info */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
              <TrendingUp className="h-5 w-5" />
              <span>Available Strategies</span>
            </h2>
          </div>
          <div className="p-6 space-y-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium text-gray-900">Moving Average Crossover</h3>
              <p className="text-sm text-gray-600 mt-1">
                Generates signals when short-term MA crosses long-term MA
              </p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium text-gray-900">RSI Strategy</h3>
              <p className="text-sm text-gray-600 mt-1">
                Uses RSI oversold/overbought levels for entry/exit signals
              </p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium text-gray-900">Sentiment Driven</h3>
              <p className="text-sm text-gray-600 mt-1">
                Incorporates news sentiment analysis into trading decisions
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Backtesting;