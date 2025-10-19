import React, { useState, useEffect } from 'react';
import { Plus, TrendingUp, DollarSign, PieChart } from 'lucide-react';
import { portfolioAPI } from '../services/api';
import LoadingSpinner from '../components/Common/LoadingSpinner';

const Portfolio = () => {
  const [portfolios, setPortfolios] = useState([]);
  const [selectedPortfolio, setSelectedPortfolio] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showAddPositionForm, setShowAddPositionForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [newPortfolio, setNewPortfolio] = useState({
    name: '',
    description: '',
    initialCapital: ''
  });
  const [newPosition, setNewPosition] = useState({
    symbol: '',
    quantity: '',
    averagePrice: ''
  });

  useEffect(() => {
    loadPortfolios();
  }, []);

  const loadPortfolios = async () => {
    try {
      const response = await portfolioAPI.getPortfolios();
      setPortfolios(response.data.data);
      if (response.data.data.length > 0 && !selectedPortfolio) {
        setSelectedPortfolio(response.data.data[0]);
      }
    } catch (error) {
      console.error('Error loading portfolios:', error);
    } finally {
      setLoading(false);
    }
  };

  const createPortfolio = async (e) => {
    e.preventDefault();
    try {
      await portfolioAPI.createPortfolio(newPortfolio);
      setShowCreateForm(false);
      setNewPortfolio({ name: '', description: '', initialCapital: '' });
      await loadPortfolios();
    } catch (error) {
      console.error('Error creating portfolio:', error);
    }
  };

  const addPosition = async (e) => {
    e.preventDefault();
    if (!selectedPortfolio) return;
    
    try {
      await portfolioAPI.addPosition(selectedPortfolio._id, newPosition);
      setShowAddPositionForm(false);
      setNewPosition({ symbol: '', quantity: '', averagePrice: '' });
      
      // Refresh portfolio data
      const response = await portfolioAPI.getPortfolio(selectedPortfolio._id);
      setSelectedPortfolio(response.data.data);
      await loadPortfolios();
    } catch (error) {
      console.error('Error adding position:', error);
    }
  };

  const updatePortfolioValues = async (portfolioId) => {
    try {
      const response = await portfolioAPI.updatePortfolioValues(portfolioId);
      setSelectedPortfolio(response.data.data);
      await loadPortfolios();
    } catch (error) {
      console.error('Error updating portfolio values:', error);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Portfolio Management</h1>
          <p className="text-gray-600 mt-1">Track and manage your virtual portfolios</p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="btn-primary flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>New Portfolio</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Portfolio List */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Your Portfolios</h2>
            </div>
            <div className="p-4 space-y-3">
              {portfolios.map((portfolio) => (
                <div
                  key={portfolio._id}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    selectedPortfolio?._id === portfolio._id
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedPortfolio(portfolio)}
                >
                  <h3 className="font-medium text-gray-900">{portfolio.name}</h3>
                  <p className="text-sm text-gray-600 mt-1">{portfolio.description}</p>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-lg font-bold text-gray-900">
                      {formatCurrency(portfolio.currentValue)}
                    </span>
                    <span className={`text-sm font-medium ${
                      portfolio.performance.totalReturn >= 0 ? 'text-success-600' : 'text-danger-600'
                    }`}>
                      {portfolio.performance.totalReturn >= 0 ? '+' : ''}
                      {portfolio.performance.totalReturn?.toFixed(2)}%
                    </span>
                  </div>
                </div>
              ))}
              
              {portfolios.length === 0 && (
                <div className="text-center py-8">
                  <PieChart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No portfolios yet. Create your first portfolio!</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Portfolio Details */}
        <div className="lg:col-span-3">
          {selectedPortfolio ? (
            <div className="space-y-6">
              {/* Portfolio Header */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">{selectedPortfolio.name}</h2>
                    <p className="text-gray-600">{selectedPortfolio.description}</p>
                  </div>
                  <div className="flex space-x-3">
                    <button
                      onClick={() => updatePortfolioValues(selectedPortfolio._id)}
                      className="btn-secondary"
                    >
                      Refresh Prices
                    </button>
                    <button
                      onClick={() => setShowAddPositionForm(true)}
                      className="btn-primary flex items-center space-x-2"
                    >
                      <Plus className="h-4 w-4" />
                      <span>Add Position</span>
                    </button>
                  </div>
                </div>

                {/* Portfolio Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-6">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gray-900">
                      {formatCurrency(selectedPortfolio.currentValue)}
                    </p>
                    <p className="text-sm text-gray-600">Current Value</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gray-900">
                      {formatCurrency(selectedPortfolio.initialCapital)}
                    </p>
                    <p className="text-sm text-gray-600">Initial Capital</p>
                  </div>
                  <div className="text-center">
                    <p className={`text-2xl font-bold ${
                      selectedPortfolio.performance.totalReturn >= 0 ? 'text-success-600' : 'text-danger-600'
                    }`}>
                      {selectedPortfolio.performance.totalReturn >= 0 ? '+' : ''}
                      {selectedPortfolio.performance.totalReturn?.toFixed(2)}%
                    </p>
                    <p className="text-sm text-gray-600">Total Return</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gray-900">
                      {selectedPortfolio.positions.length}
                    </p>
                    <p className="text-sm text-gray-600">Positions</p>
                  </div>
                </div>
              </div>

              {/* Positions Table */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                <div className="p-6 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">Positions</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead>
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Symbol</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Avg Price</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Current Price</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Market Value</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Unrealized P&L</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {selectedPortfolio.positions.map((position, index) => (
                        <tr key={index}>
                          <td className="px-6 py-4 text-sm font-medium text-gray-900">{position.symbol}</td>
                          <td className="px-6 py-4 text-sm text-gray-900">{position.quantity}</td>
                          <td className="px-6 py-4 text-sm text-gray-900">{formatCurrency(position.averagePrice)}</td>
                          <td className="px-6 py-4 text-sm text-gray-900">{formatCurrency(position.currentPrice)}</td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            {formatCurrency(position.currentPrice * position.quantity)}
                          </td>
                          <td className={`px-6 py-4 text-sm font-medium ${
                            position.unrealizedPnL >= 0 ? 'text-success-600' : 'text-danger-600'
                          }`}>
                            {formatCurrency(position.unrealizedPnL)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  
                  {selectedPortfolio.positions.length === 0 && (
                    <div className="text-center py-12">
                      <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">No positions yet. Add your first position!</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
              <DollarSign className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Portfolio Selected</h3>
              <p className="text-gray-600 mb-6">Select a portfolio from the list or create a new one to get started.</p>
              <button
                onClick={() => setShowCreateForm(true)}
                className="btn-primary"
              >
                Create Portfolio
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Create Portfolio Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Create New Portfolio</h3>
            <form onSubmit={createPortfolio}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Portfolio Name</label>
                  <input
                    type="text"
                    required
                    value={newPortfolio.name}
                    onChange={(e) => setNewPortfolio({ ...newPortfolio, name: e.target.value })}
                    className="input-field"
                    placeholder="e.g., Tech Growth Portfolio"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <input
                    type="text"
                    value={newPortfolio.description}
                    onChange={(e) => setNewPortfolio({ ...newPortfolio, description: e.target.value })}
                    className="input-field"
                    placeholder="Optional description"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Initial Capital</label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    value={newPortfolio.initialCapital}
                    onChange={(e) => setNewPortfolio({ ...newPortfolio, initialCapital: e.target.value })}
                    className="input-field"
                    placeholder="10000.00"
                  />
                </div>
              </div>
              <div className="flex space-x-3 mt-6">
                <button type="submit" className="btn-primary flex-1">Create Portfolio</button>
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Position Modal */}
      {showAddPositionForm && selectedPortfolio && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Add Position to {selectedPortfolio.name}</h3>
            <form onSubmit={addPosition}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Symbol</label>
                  <input
                    type="text"
                    required
                    value={newPosition.symbol}
                    onChange={(e) => setNewPosition({ ...newPosition, symbol: e.target.value.toUpperCase() })}
                    className="input-field"
                    placeholder="e.g., AAPL"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Quantity</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={newPosition.quantity}
                    onChange={(e) => setNewPosition({ ...newPosition, quantity: e.target.value })}
                    className="input-field"
                    placeholder="100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Average Price</label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    value={newPosition.averagePrice}
                    onChange={(e) => setNewPosition({ ...newPosition, averagePrice: e.target.value })}
                    className="input-field"
                    placeholder="150.00"
                  />
                </div>
              </div>
              <div className="flex space-x-3 mt-6">
                <button type="submit" className="btn-primary flex-1">Add Position</button>
                <button
                  type="button"
                  onClick={() => setShowAddPositionForm(false)}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Portfolio;