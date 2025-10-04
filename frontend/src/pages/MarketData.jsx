import React, { useState, useEffect } from 'react';
import { Search, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import { marketDataAPI } from '../services/api';
import Chart from '../components/Charts/Chart';
import LoadingSpinner from '../components/Common/LoadingSpinner';

const MarketData = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedSymbol, setSelectedSymbol] = useState('AAPL');
  const [marketData, setMarketData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [popularSymbols] = useState(['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'META', 'NFLX', 'NVDA']);

  useEffect(() => {
    loadMarketData(selectedSymbol);
  }, [selectedSymbol]);

  const loadMarketData = async (symbol) => {
    try {
      setLoading(true);
      const response = await marketDataAPI.getIntraday(symbol, { interval: '5min' });
      setMarketData(response.data.data.data || []);
    } catch (error) {
      console.error('Error loading market data:', error);
      setMarketData([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (query) => {
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }

    try {
      const response = await marketDataAPI.searchSymbols(query);
      setSearchResults(response.data.data || []);
    } catch (error) {
      console.error('Error searching symbols:', error);
      setSearchResults([]);
    }
  };

  const getPriceChange = (data) => {
    if (!data || data.length < 2) return { change: 0, percent: 0 };
    const current = data[0]?.close;
    const previous = data[1]?.close;
    const change = current - previous;
    const percent = (change / previous) * 100;
    return { change, percent };
  };

  const priceChange = getPriceChange(marketData);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Market Data</h1>
        <p className="text-gray-600 mt-1">Real-time and historical market data</p>
      </div>

      {/* Search and Popular Symbols */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search symbols (e.g., AAPL, MSFT)..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                handleSearch(e.target.value);
              }}
              className="input-field pl-10"
            />
            
            {searchResults.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                {searchResults.map((result) => (
                  <div
                    key={result['1. symbol']}
                    className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                    onClick={() => {
                      setSelectedSymbol(result['1. symbol']);
                      setSearchQuery('');
                      setSearchResults([]);
                    }}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="font-medium text-gray-900">{result['1. symbol']}</span>
                        <span className="text-gray-600 ml-2">{result['2. name']}</span>
                      </div>
                      <span className="text-sm text-gray-500">{result['4. region']}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-2 overflow-x-auto">
          {popularSymbols.map((symbol) => (
            <button
              key={symbol}
              onClick={() => setSelectedSymbol(symbol)}
              className={`px-4 py-2 rounded-lg border transition-colors whitespace-nowrap ${
                selectedSymbol === symbol
                  ? 'bg-primary-500 text-white border-primary-500'
                  : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
              }`}
            >
              {symbol}
            </button>
          ))}
        </div>
      </div>

      {/* Current Price Card */}
      {marketData.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Current Price</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  ${marketData[0]?.close?.toFixed(2)}
                </p>
              </div>
              <div className="p-3 bg-primary-50 rounded-lg">
                <DollarSign className="h-6 w-6 text-primary-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Change</p>
                <p className={`text-3xl font-bold mt-2 ${
                  priceChange.change >= 0 ? 'text-success-600' : 'text-danger-600'
                }`}>
                  {priceChange.change >= 0 ? '+' : ''}{priceChange.change?.toFixed(2)}
                </p>
              </div>
              <div className={`p-3 rounded-lg ${
                priceChange.change >= 0 ? 'bg-success-50' : 'bg-danger-50'
              }`}>
                {priceChange.change >= 0 ? (
                  <TrendingUp className="h-6 w-6 text-success-600" />
                ) : (
                  <TrendingDown className="h-6 w-6 text-danger-600" />
                )}
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Change %</p>
                <p className={`text-3xl font-bold mt-2 ${
                  priceChange.percent >= 0 ? 'text-success-600' : 'text-danger-600'
                }`}>
                  {priceChange.percent >= 0 ? '+' : ''}{priceChange.percent?.toFixed(2)}%
                </p>
              </div>
              <div className={`p-3 rounded-lg ${
                priceChange.percent >= 0 ? 'bg-success-50' : 'bg-danger-50'
              }`}>
                {priceChange.percent >= 0 ? (
                  <TrendingUp className="h-6 w-6 text-success-600" />
                ) : (
                  <TrendingDown className="h-6 w-6 text-danger-600" />
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Chart */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">
            {selectedSymbol} - Intraday Price Chart
          </h2>
          <div className="flex space-x-2">
            <button className="px-3 py-1 text-sm bg-primary-500 text-white rounded-lg">5min</button>
            <button className="px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded-lg">15min</button>
            <button className="px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded-lg">1H</button>
          </div>
        </div>
        
        {loading ? (
          <div className="h-96 flex items-center justify-center">
            <LoadingSpinner />
          </div>
        ) : marketData.length > 0 ? (
          <Chart data={marketData} symbol={selectedSymbol} />
        ) : (
          <div className="h-96 flex items-center justify-center text-gray-500">
            No market data available for {selectedSymbol}
          </div>
        )}
      </div>

      {/* Recent Data Table */}
      {marketData.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Recent Prices</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Timestamp</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Open</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">High</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Low</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Close</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Volume</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {marketData.slice(0, 10).map((data, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {new Date(data.timestamp).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">${data.open?.toFixed(2)}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">${data.high?.toFixed(2)}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">${data.low?.toFixed(2)}</td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">${data.close?.toFixed(2)}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{data.volume?.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default MarketData;