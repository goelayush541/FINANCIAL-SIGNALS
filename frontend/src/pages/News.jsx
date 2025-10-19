import React, { useState, useEffect } from 'react';
import { Calendar, ExternalLink, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { newsAPI } from '../services/api';
import LoadingSpinner from '../components/Common/LoadingSpinner';

const News = () => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSymbol, setSelectedSymbol] = useState('');
  const [days, setDays] = useState(1);

  useEffect(() => {
    loadNews();
  }, [selectedSymbol, days]);

  const loadNews = async () => {
    try {
      setLoading(true);
      const params = { days };
      if (selectedSymbol) {
        params.symbols = selectedSymbol;
      }
      const response = await newsAPI.getNews(params);
      setNews(response.data.data || []);
    } catch (error) {
      console.error('Error loading news:', error);
      setNews([]);
    } finally {
      setLoading(false);
    }
  };

  const getSentimentIcon = (sentiment) => {
    if (sentiment > 0.1) return <TrendingUp className="h-4 w-4 text-success-600" />;
    if (sentiment < -0.1) return <TrendingDown className="h-4 w-4 text-danger-600" />;
    return <Minus className="h-4 w-4 text-gray-600" />;
  };

  const getSentimentColor = (sentiment) => {
    if (sentiment > 0.1) return 'text-success-600 bg-success-50 border-success-200';
    if (sentiment < -0.1) return 'text-danger-600 bg-danger-50 border-danger-200';
    return 'text-gray-600 bg-gray-50 border-gray-200';
  };

  const formatSentiment = (sentiment) => {
    if (sentiment > 0.1) return 'Positive';
    if (sentiment < -0.1) return 'Negative';
    return 'Neutral';
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">News & Sentiment</h1>
          <p className="text-gray-600 mt-1">Latest financial news with sentiment analysis</p>
        </div>
        <div className="flex space-x-4">
          <select
            value={selectedSymbol}
            onChange={(e) => setSelectedSymbol(e.target.value)}
            className="input-field w-40"
          >
            <option value="">All Symbols</option>
            <option value="AAPL">Apple</option>
            <option value="MSFT">Microsoft</option>
            <option value="GOOGL">Google</option>
            <option value="AMZN">Amazon</option>
            <option value="TSLA">Tesla</option>
          </select>
          
          <select
            value={days}
            onChange={(e) => setDays(parseInt(e.target.value))}
            className="input-field w-32"
          >
            <option value={1}>Last 24h</option>
            <option value={7}>Last 7 days</option>
            <option value={30}>Last 30 days</option>
          </select>
        </div>
      </div>

      {/* Sentiment Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Articles</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{news.length}</p>
            </div>
            <div className="p-3 bg-primary-50 rounded-lg">
              <Calendar className="h-6 w-6 text-primary-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-success-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Positive</p>
              <p className="text-2xl font-bold text-success-600 mt-1">
                {news.filter(n => n.sentiment > 0.1).length}
              </p>
            </div>
            <div className="p-3 bg-success-50 rounded-lg">
              <TrendingUp className="h-6 w-6 text-success-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-danger-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Negative</p>
              <p className="text-2xl font-bold text-danger-600 mt-1">
                {news.filter(n => n.sentiment < -0.1).length}
              </p>
            </div>
            <div className="p-3 bg-danger-50 rounded-lg">
              <TrendingDown className="h-6 w-6 text-danger-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Neutral</p>
              <p className="text-2xl font-bold text-gray-600 mt-1">
                {news.filter(n => n.sentiment >= -0.1 && n.sentiment <= 0.1).length}
              </p>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <Minus className="h-6 w-6 text-gray-600" />
            </div>
          </div>
        </div>
      </div>

      {/* News Articles */}
      <div className="space-y-4">
        {news.length > 0 ? (
          news.map((article, index) => (
            <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-3">
                    <span className="text-sm font-medium text-gray-900">{article.source?.name}</span>
                    <span className="text-sm text-gray-500">
                      {new Date(article.publishedAt).toLocaleDateString()}
                    </span>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getSentimentColor(article.sentiment)}`}>
                      <div className="flex items-center space-x-1">
                        {getSentimentIcon(article.sentiment)}
                        <span>{formatSentiment(article.sentiment)}</span>
                        <span>({(article.sentiment || 0).toFixed(3)})</span>
                      </div>
                    </span>
                  </div>
                  
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{article.title}</h3>
                  <p className="text-gray-600 mb-4">{article.description}</p>
                  
                  {article.entities && Object.keys(article.entities).length > 0 && (
                    <div className="mb-4">
                      <p className="text-sm font-medium text-gray-700 mb-2">Detected Entities:</p>
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(article.entities).slice(0, 5).map(([entity, info]) => (
                          <span key={entity} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                            {entity}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">
                      {article.author || 'Unknown Author'}
                    </span>
                    <a
                      href={article.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-1 text-primary-600 hover:text-primary-700 text-sm font-medium"
                    >
                      <span>Read Full Article</span>
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-200">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No news found</h3>
            <p className="text-gray-600">Try adjusting your filters or select a different time period.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default News;