const axios = require('axios');
const snowflakeClient = require('../config/snowflake');

class NewsService {
  constructor() {
    this.apiKey = process.env.NEWS_API_KEY;
    this.baseURL = 'https://newsapi.org/v2';
  }

  async getFinancialNews(symbols = [], fromDate = null) {
    try {
      // Check if API key is available
      if (!this.apiKey || this.apiKey === 'your-news-api-key') {
        console.warn('⚠️ News API key not configured, returning mock data');
        return this.getMockNewsData();
      }

      const query = symbols.length > 0 ? 
        `(${symbols.map(s => s + ' OR ').join('')}stocks OR trading)` : 
        'stocks OR trading OR finance';

      const response = await axios.get(`${this.baseURL}/everything`, {
        params: {
          q: query,
          from: fromDate || new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          sortBy: 'publishedAt',
          language: 'en',
          apiKey: this.apiKey
        }
      });

      const articles = response.data.articles || [];

      // Analyze sentiment for each article using Snowflake Cortex
      const analyzedArticles = await Promise.all(
        articles.map(async (article) => {
          try {
            // Only analyze if Snowflake is connected
            if (snowflakeClient.isConnected) {
              const sentiment = await snowflakeClient.analyzeSentiment(
                `${article.title} ${article.description || ''}`
              );
              
              const entities = await snowflakeClient.extractEntities(
                `${article.title} ${article.description || ''}`
              );

              return {
                ...article,
                sentiment: sentiment.sentiment_score,
                sentimentLabel: sentiment.sentiment_label,
                entities: entities.entities,
                publishedAt: new Date(article.publishedAt)
              };
            } else {
              // Fallback without Snowflake analysis
              return {
                ...article,
                sentiment: 0,
                sentimentLabel: 'NEUTRAL',
                entities: [],
                publishedAt: new Date(article.publishedAt)
              };
            }
          } catch (error) {
            console.error('Error analyzing article:', error);
            return {
              ...article,
              sentiment: 0,
              sentimentLabel: 'NEUTRAL',
              entities: [],
              publishedAt: new Date(article.publishedAt)
            };
          }
        })
      );

      return analyzedArticles;
    } catch (error) {
      console.error('Error fetching news from API, returning mock data:', error.message);
      return this.getMockNewsData();
    }
  }

  async getNewsForSymbol(symbol, days = 7) {
    const fromDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    return this.getFinancialNews([symbol], fromDate.toISOString().split('T')[0]);
  }

  // Mock data for development when API is not available
  getMockNewsData() {
    return [
      {
        source: { name: 'Financial Times' },
        author: 'Market Analyst',
        title: 'Stock Markets Show Strong Performance This Week',
        description: 'Global markets continue to show resilience amid economic changes.',
        url: 'https://example.com/news/1',
        urlToImage: 'https://via.placeholder.com/300',
        publishedAt: new Date().toISOString(),
        content: 'Market analysis shows positive trends across major indices.',
        sentiment: 0.15,
        sentimentLabel: 'POSITIVE',
        entities: { COMPANY: ['AAPL', 'MSFT'], INDUSTRY: ['Technology'] }
      },
      {
        source: { name: 'Bloomberg' },
        author: 'Finance Reporter',
        title: 'Tech Stocks Lead Market Gains',
        description: 'Technology companies report strong quarterly earnings.',
        url: 'https://example.com/news/2',
        urlToImage: 'https://via.placeholder.com/300',
        publishedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        content: 'Major tech firms exceed expectations in latest reports.',
        sentiment: 0.25,
        sentimentLabel: 'POSITIVE',
        entities: { COMPANY: ['GOOGL', 'AMZN'], INDUSTRY: ['Technology'] }
      },
      {
        source: { name: 'Reuters' },
        author: 'Business Correspondent',
        title: 'Market Volatility Expected in Coming Days',
        description: 'Analysts predict increased volatility due to economic indicators.',
        url: 'https://example.com/news/3',
        urlToImage: 'https://via.placeholder.com/300',
        publishedAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        content: 'Economic data suggests potential market fluctuations.',
        sentiment: -0.1,
        sentimentLabel: 'NEGATIVE',
        entities: { COMPANY: ['TSLA', 'NVDA'], INDUSTRY: ['Automotive', 'Technology'] }
      }
    ];
  }
}

module.exports = new NewsService();