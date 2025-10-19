import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  DollarSign,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { signalsAPI, marketDataAPI } from '../services/api';
import SignalCard from '../components/Signals/SignalCard';
import Chart from '../components/Charts/Chart';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalSignals: 0,
    bullishSignals: 0,
    bearishSignals: 0,
    avgConfidence: 0
  });
  const [recentSignals, setRecentSignals] = useState([]);
  const [marketData, setMarketData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [signalsResponse, statsResponse, marketResponse] = await Promise.all([
        signalsAPI.getSignals({ limit: 10 }),
        signalsAPI.getStats(),
        marketDataAPI.getBatchData(['AAPL', 'MSFT', 'GOOGL', 'AMZN'])
      ]);

      setRecentSignals(signalsResponse.data.data);
      setStats(statsResponse.data.data);
      setMarketData(marketResponse.data.data);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Signals</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.totalSignals}</p>
            </div>
            <div className="p-3 bg-primary-50 rounded-lg">
              <Activity className="h-6 w-6 text-primary-600" />
            </div>
          </div>
          <div className="flex items-center mt-4">
            <ArrowUpRight className="h-4 w-4 text-success-500" />
            <span className="text-sm text-success-600 ml-1">+12% this week</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Bullish Signals</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.bullishSignals}</p>
            </div>
            <div className="p-3 bg-success-50 rounded-lg">
              <TrendingUp className="h-6 w-6 text-success-600" />
            </div>
          </div>
          <div className="flex items-center mt-4">
            <ArrowUpRight className="h-4 w-4 text-success-500" />
            <span className="text-sm text-success-600 ml-1">+8% today</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Bearish Signals</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.bearishSignals}</p>
            </div>
            <div className="p-3 bg-danger-50 rounded-lg">
              <TrendingDown className="h-6 w-6 text-danger-600" />
            </div>
          </div>
          <div className="flex items-center mt-4">
            <ArrowDownRight className="h-4 w-4 text-danger-500" />
            <span className="text-sm text-danger-600 ml-1">-3% today</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Confidence</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {(stats.avgConfidence * 100).toFixed(1)}%
              </p>
            </div>
            <div className="p-3 bg-warning-50 rounded-lg">
              <DollarSign className="h-6 w-6 text-warning-600" />
            </div>
          </div>
          <div className="flex items-center mt-4">
            <ArrowUpRight className="h-4 w-4 text-success-500" />
            <span className="text-sm text-success-600 ml-1">+2% this week</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Signals */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Recent Trading Signals</h2>
              <p className="text-sm text-gray-600 mt-1">Latest generated signals from market analysis</p>
            </div>
            <div className="p-6 space-y-4">
              {recentSignals.map((signal) => (
                <SignalCard key={signal._id} signal={signal} />
              ))}
              {recentSignals.length === 0 && (
                <div className="text-center py-8">
                  <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No signals generated yet</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Market Overview */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Market Overview</h2>
            <p className="text-sm text-gray-600 mt-1">Key stock performance</p>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {marketData.map((stock) => (
                <div key={stock.symbol} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-semibold text-gray-900">{stock.symbol}</p>
                    <p className="text-sm text-gray-600">
                      {stock.data?.[0]?.close ? `$${stock.data[0].close.toFixed(2)}` : 'N/A'}
                    </p>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                    Math.random() > 0.5 
                      ? 'bg-success-100 text-success-700'
                      : 'bg-danger-100 text-danger-700'
                  }`}>
                    {Math.random() > 0.5 ? '+' : ''}{(Math.random() * 5).toFixed(2)}%
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;