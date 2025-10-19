export const SIGNAL_TYPES = {
  BULLISH: {
    label: 'Bullish',
    color: 'success',
    icon: '📈'
  },
  BEARISH: {
    label: 'Bearish',
    color: 'danger',
    icon: '📉'
  },
  NEUTRAL: {
    label: 'Neutral',
    color: 'gray',
    icon: '➡️'
  }
};

export const SIGNAL_SOURCES = {
  TECHNICAL: {
    label: 'Technical',
    description: 'Based on technical indicators'
  },
  NEWS_SENTIMENT: {
    label: 'News Sentiment',
    description: 'Based on news sentiment analysis'
  },
  COMBINED: {
    label: 'Combined',
    description: 'Combined technical and sentiment analysis'
  }
};

export const STRATEGIES = {
  MOVING_AVERAGE_CROSSOVER: {
    label: 'Moving Average Crossover',
    description: 'Generates signals when short-term MA crosses long-term MA',
    parameters: [
      { name: 'shortPeriod', label: 'Short Period', type: 'number', min: 1, max: 100, default: 20 },
      { name: 'longPeriod', label: 'Long Period', type: 'number', min: 1, max: 200, default: 50 }
    ]
  },
  RSI_STRATEGY: {
    label: 'RSI Strategy',
    description: 'Uses RSI oversold/overbought levels for entry/exit signals',
    parameters: [
      { name: 'rsiPeriod', label: 'RSI Period', type: 'number', min: 1, max: 50, default: 14 },
      { name: 'oversold', label: 'Oversold Level', type: 'number', min: 1, max: 50, default: 30 },
      { name: 'overbought', label: 'Overbought Level', type: 'number', min: 50, max: 100, default: 70 }
    ]
  },
  SENTIMENT_DRIVEN: {
    label: 'Sentiment Driven',
    description: 'Incorporates news sentiment analysis into trading decisions',
    parameters: []
  },
  COMBINED_SIGNALS: {
    label: 'Combined Signals',
    description: 'Combines multiple signal types for enhanced accuracy',
    parameters: []
  }
};

export const INTERVALS = {
  '1min': '1 Minute',
  '5min': '5 Minutes',
  '15min': '15 Minutes',
  '30min': '30 Minutes',
  '60min': '1 Hour',
  'daily': 'Daily',
  'weekly': 'Weekly',
  'monthly': 'Monthly'
};

export const POPULAR_SYMBOLS = [
  'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'META', 'NFLX', 'NVDA',
  'JPM', 'JNJ', 'V', 'PG', 'UNH', 'HD', 'DIS', 'PYPL', 'ADBE', 'NKE',
  'BAC', 'WFC', 'XOM', 'CVX', 'KO', 'PEP', 'WMT', 'COST', 'MCD'
];

export const SYMBOL_GROUPS = {
  TECH_GIANTS: ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'META', 'NVDA', 'TSLA'],
  BANKS: ['JPM', 'BAC', 'WFC', 'GS', 'MS', 'C'],
  ENERGY: ['XOM', 'CVX', 'COP', 'SLB', 'EOG'],
  RETAIL: ['WMT', 'COST', 'TGT', 'HD', 'LOW'],
  HEALTHCARE: ['JNJ', 'PFE', 'MRK', 'ABT', 'UNH']
};

export const SENTIMENT_LABELS = {
  POSITIVE: {
    threshold: 0.1,
    label: 'Positive',
    color: 'success',
    icon: '😊'
  },
  NEGATIVE: {
    threshold: -0.1,
    label: 'Negative',
    color: 'danger',
    icon: '😞'
  },
  NEUTRAL: {
    threshold: 0,
    label: 'Neutral',
    color: 'gray',
    icon: '😐'
  }
};

export const CHART_COLORS = {
  primary: '#0ea5e9',
  success: '#22c55e',
  danger: '#ef4444',
  warning: '#f59e0b',
  gray: '#6b7280'
};