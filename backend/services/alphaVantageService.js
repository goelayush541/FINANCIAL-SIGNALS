const axios = require('axios');

class AlphaVantageService {
  constructor() {
    this.apiKey = process.env.ALPHA_VANTAGE_API_KEY || 'demo';
    this.baseURL = 'https://www.alphavantage.co/query';
  }

  async getIntradayData(symbol, interval = '5min') {
    try {
      // If using demo key or no key, return mock data
      if (!this.apiKey || this.apiKey === 'demo' || this.apiKey === 'your-alpha-vantage-api-key') {
        console.log(`📊 Using mock intraday data for ${symbol}`);
        return this.getMockIntradayData(symbol);
      }

      const response = await axios.get(this.baseURL, {
        params: {
          function: 'TIME_SERIES_INTRADAY',
          symbol: symbol,
          interval: interval,
          apikey: this.apiKey,
          outputsize: 'compact'
        },
        timeout: 10000 // 10 second timeout
      });

      if (response.data['Error Message']) {
        throw new Error(response.data['Error Message']);
      }

      if (response.data['Note']) {
        throw new Error('API call frequency exceeded');
      }

      const timeSeries = response.data[`Time Series (${interval})`];
      if (!timeSeries) {
        throw new Error('No time series data available');
      }

      return this.parseTimeSeriesData(timeSeries);
    } catch (error) {
      console.error(`Error fetching intraday data for ${symbol}:`, error.message);
      console.log('🔄 Falling back to mock data');
      return this.getMockIntradayData(symbol);
    }
  }

  async getDailyData(symbol) {
    try {
      // If using demo key or no key, return mock data
      if (!this.apiKey || this.apiKey === 'demo' || this.apiKey === 'your-alpha-vantage-api-key') {
        console.log(`📊 Using mock daily data for ${symbol}`);
        return this.getMockDailyData(symbol);
      }

      const response = await axios.get(this.baseURL, {
        params: {
          function: 'TIME_SERIES_DAILY',
          symbol: symbol,
          apikey: this.apiKey,
          outputsize: 'compact'
        },
        timeout: 10000
      });

      const timeSeries = response.data['Time Series (Daily)'];
      if (!timeSeries) {
        throw new Error('No daily data available');
      }

      return this.parseTimeSeriesData(timeSeries);
    } catch (error) {
      console.error(`Error fetching daily data for ${symbol}:`, error.message);
      console.log('🔄 Falling back to mock data');
      return this.getMockDailyData(symbol);
    }
  }

  parseTimeSeriesData(timeSeries) {
    if (!timeSeries) return [];

    return Object.entries(timeSeries).map(([timestamp, data]) => ({
      timestamp: new Date(timestamp),
      open: parseFloat(data['1. open']),
      high: parseFloat(data['2. high']),
      low: parseFloat(data['3. low']),
      close: parseFloat(data['4. close']),
      volume: parseInt(data['5. volume'])
    })).sort((a, b) => a.timestamp - b.timestamp);
  }

  async searchSymbols(keywords) {
    try {
      // Mock symbol search
      const mockSymbols = [
        { '1. symbol': 'AAPL', '2. name': 'Apple Inc.' },
        { '1. symbol': 'MSFT', '2. name': 'Microsoft Corporation' },
        { '1. symbol': 'GOOGL', '2. name': 'Alphabet Inc.' },
        { '1. symbol': 'AMZN', '2. name': 'Amazon.com Inc.' },
        { '1. symbol': 'TSLA', '2. name': 'Tesla Inc.' },
        { '1. symbol': 'META', '2. name': 'Meta Platforms Inc.' },
        { '1. symbol': 'NFLX', '2. name': 'Netflix Inc.' },
        { '1. symbol': 'NVDA', '2. name': 'NVIDIA Corporation' }
      ];

      const filtered = mockSymbols.filter(symbol => 
        symbol['1. symbol'].includes(keywords.toUpperCase()) || 
        symbol['2. name'].toLowerCase().includes(keywords.toLowerCase())
      );

      return filtered.length > 0 ? filtered : mockSymbols;
    } catch (error) {
      console.error('Error searching symbols:', error.message);
      return [];
    }
  }

  // Mock data generators
  getMockIntradayData(symbol) {
    const basePrice = this.getBasePrice(symbol);
    const data = [];
    const now = new Date();
    
    // Generate 20 data points for the last 6 hours
    for (let i = 0; i < 20; i++) {
      const timestamp = new Date(now.getTime() - (20 - i) * 30 * 60 * 1000); // 30 min intervals
      const volatility = 0.02; // 2% volatility
      const randomChange = (Math.random() - 0.5) * 2 * volatility;
      const price = basePrice * (1 + randomChange);
      
      data.push({
        timestamp,
        open: price * (1 - Math.random() * 0.01),
        high: price * (1 + Math.random() * 0.02),
        low: price * (1 - Math.random() * 0.02),
        close: price,
        volume: Math.floor(Math.random() * 1000000) + 500000
      });
    }
    
    return data;
  }

  getMockDailyData(symbol) {
    const basePrice = this.getBasePrice(symbol);
    const data = [];
    const today = new Date();
    
    // Generate 30 days of historical data
    for (let i = 0; i < 30; i++) {
      const timestamp = new Date(today);
      timestamp.setDate(today.getDate() - (30 - i));
      
      const volatility = 0.03; // 3% daily volatility
      const randomChange = (Math.random() - 0.5) * 2 * volatility;
      const price = basePrice * (1 + randomChange * (i / 30));
      
      data.push({
        timestamp,
        open: price * (1 - Math.random() * 0.015),
        high: price * (1 + Math.random() * 0.025),
        low: price * (1 - Math.random() * 0.025),
        close: price,
        volume: Math.floor(Math.random() * 50000000) + 10000000
      });
    }
    
    return data;
  }

  getBasePrice(symbol) {
    const basePrices = {
      'AAPL': 175, 'MSFT': 335, 'GOOGL': 135, 'AMZN': 145,
      'TSLA': 235, 'META': 320, 'NFLX': 415, 'NVDA': 450
    };
    return basePrices[symbol] || 100;
  }
}

module.exports = new AlphaVantageService();