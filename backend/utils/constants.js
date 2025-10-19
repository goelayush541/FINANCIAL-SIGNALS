module.exports = {
  // Trading hours (EST)
  MARKET_OPEN_HOUR: 9,
  MARKET_OPEN_MINUTE: 30,
  MARKET_CLOSE_HOUR: 16,
  MARKET_CLOSE_MINUTE: 0,

  // Signal thresholds
  SIGNAL_STRENGTH: {
    WEAK: 0.3,
    MEDIUM: 0.6,
    STRONG: 0.8
  },

  SENTIMENT_THRESHOLDS: {
    POSITIVE: 0.1,
    NEGATIVE: -0.1,
    STRONGLY_POSITIVE: 0.3,
    STRONGLY_NEGATIVE: -0.3
  },

  TECHNICAL_INDICATORS: {
    RSI_OVERSOLD: 30,
    RSI_OVERBOUGHT: 70,
    RSI_PERIOD: 14,
    SMA_SHORT: 20,
    SMA_LONG: 50,
    EMA_SHORT: 12,
    EMA_LONG: 26
  },

  // API rate limits
  RATE_LIMITS: {
    ALPHA_VANTAGE: 5, // requests per minute
    NEWS_API: 100, // requests per day
    SNOWFLAKE: 100 // requests per minute
  },

  // Backtesting defaults
  BACKTEST_DEFAULTS: {
    INITIAL_CAPITAL: 10000,
    COMMISSION: 0.001, // 0.1%
    SLIPPAGE: 0.001 // 0.1%
  },

  // Symbol lists
  POPULAR_SYMBOLS: [
    'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'META', 'NFLX', 'NVDA',
    'JPM', 'JNJ', 'V', 'PG', 'UNH', 'HD', 'DIS', 'PYPL', 'ADBE', 'NKE'
  ],

  // Time intervals
  INTERVALS: {
    INTRADAY: ['1min', '5min', '15min', '30min', '60min'],
    DAILY: 'daily',
    WEEKLY: 'weekly',
    MONTHLY: 'monthly'
  }
};