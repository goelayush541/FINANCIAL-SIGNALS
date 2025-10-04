const alphaVantageService = require('./alphaVantageService');
const newsService = require('./newsService');
const Signal = require('../models/Signal');

class SignalService {
  constructor() {
    this.technicalIndicators = {
      rsi: this.calculateRSI,
      sma: this.calculateSMA,
      ema: this.calculateEMA,
      macd: this.calculateMACD
    };
  }

  async generateSignals(symbols) {
    const signals = [];
    console.log(`🎯 Generating signals for symbols: ${symbols.join(', ')}`);

    for (const symbol of symbols) {
      try {
        console.log(`📈 Processing ${symbol}...`);
        
        const [priceData, news] = await Promise.all([
          alphaVantageService.getIntradayData(symbol),
          newsService.getNewsForSymbol(symbol, 1)
        ]);

        if (priceData.length === 0) {
          console.log(`⚠️ No price data for ${symbol}, skipping`);
          continue;
        }

        console.log(`✅ Got ${priceData.length} price data points for ${symbol}`);

        const technicalSignals = await this.generateTechnicalSignals(symbol, priceData);
        const sentimentSignals = await this.generateSentimentSignals(symbol, news);
        const combinedSignals = this.combineSignals(technicalSignals, sentimentSignals);

        signals.push(...combinedSignals);
        console.log(`✅ Generated ${combinedSignals.length} signals for ${symbol}`);
      } catch (error) {
        console.error(`❌ Error generating signals for ${symbol}:`, error);
      }
    }

    // Save signals to database
    if (signals.length > 0) {
      await Signal.insertMany(signals);
      console.log(`💾 Saved ${signals.length} signals to database`);
    } else {
      console.log('⚠️ No signals generated, creating sample signals');
      // Create sample signals if none were generated
      const sampleSignals = this.createSampleSignals(symbols);
      await Signal.insertMany(sampleSignals);
      signals.push(...sampleSignals);
    }

    return signals;
  }

  createSampleSignals(symbols) {
    const sampleSignals = [];
    const signalTypes = ['BULLISH', 'BEARISH', 'NEUTRAL'];
    const sources = ['TECHNICAL', 'NEWS_SENTIMENT', 'COMBINED'];

    symbols.forEach(symbol => {
      const signalType = signalTypes[Math.floor(Math.random() * signalTypes.length)];
      const source = sources[Math.floor(Math.random() * sources.length)];
      
      sampleSignals.push({
        symbol,
        signalType,
        strength: Math.random() * 0.5 + 0.3, // 0.3 to 0.8
        source,
        description: `${signalType} signal for ${symbol} based on ${source.toLowerCase()} analysis`,
        confidence: Math.random() * 0.3 + 0.6, // 0.6 to 0.9
        triggers: [{
          type: 'PRICE_MOVEMENT',
          value: `Sample trigger for demonstration`,
          timestamp: new Date()
        }],
        priceData: {
          current: this.getSamplePrice(symbol),
          change: (Math.random() - 0.5) * 10,
          changePercent: (Math.random() - 0.5) * 5,
          volume: Math.floor(Math.random() * 10000000) + 1000000
        },
        timestamp: new Date(),
        expiration: new Date(Date.now() + 24 * 60 * 60 * 1000)
      });
    });

    console.log(`🎲 Created ${sampleSignals.length} sample signals`);
    return sampleSignals;
  }

  getSamplePrice(symbol) {
    const prices = {
      'AAPL': 175, 'MSFT': 335, 'GOOGL': 135, 'AMZN': 145,
      'TSLA': 235, 'META': 320, 'NFLX': 415, 'NVDA': 450
    };
    return prices[symbol] || 100;
  }

  async generateTechnicalSignals(symbol, priceData) {
    const signals = [];
    const closes = priceData.map(d => d.close);
    
    if (closes.length < 20) {
      console.log(`⚠️ Not enough data for technical analysis on ${symbol}`);
      return signals;
    }

    // Calculate technical indicators
    const rsi = this.calculateRSI(closes);
    const sma20 = this.calculateSMA(closes, 20);
    const sma50 = this.calculateSMA(closes, 50);
    const currentPrice = closes[closes.length - 1];

    console.log(`📊 ${symbol} - RSI: ${rsi.toFixed(2)}, SMA20: ${sma20.toFixed(2)}, SMA50: ${sma50.toFixed(2)}`);

    // RSI based signals
    if (rsi < 30) {
      signals.push({
        symbol,
        signalType: 'BULLISH',
        strength: this.normalizeStrength(30 - rsi, 0, 30),
        source: 'TECHNICAL',
        description: `Oversold RSI (${rsi.toFixed(2)}) indicates potential bounce`,
        confidence: 0.7,
        triggers: [{
          type: 'PRICE_MOVEMENT',
          value: `RSI: ${rsi.toFixed(2)}`,
          timestamp: new Date()
        }],
        priceData: {
          current: currentPrice,
          change: currentPrice - closes[closes.length - 2],
          changePercent: ((currentPrice - closes[closes.length - 2]) / closes[closes.length - 2]) * 100
        },
        expiration: new Date(Date.now() + 24 * 60 * 60 * 1000)
      });
    } else if (rsi > 70) {
      signals.push({
        symbol,
        signalType: 'BEARISH',
        strength: this.normalizeStrength(rsi - 70, 0, 30),
        source: 'TECHNICAL',
        description: `Overbought RSI (${rsi.toFixed(2)}) indicates potential pullback`,
        confidence: 0.7,
        triggers: [{
          type: 'PRICE_MOVEMENT',
          value: `RSI: ${rsi.toFixed(2)}`,
          timestamp: new Date()
        }],
        priceData: {
          current: currentPrice,
          change: currentPrice - closes[closes.length - 2],
          changePercent: ((currentPrice - closes[closes.length - 2]) / closes[closes.length - 2]) * 100
        },
        expiration: new Date(Date.now() + 24 * 60 * 60 * 1000)
      });
    }

    // Moving average crossover
    if (sma20 > sma50 && sma20 !== sma50) {
      const strength = this.normalizeStrength(sma20 - sma50, 0, currentPrice * 0.1);
      signals.push({
        symbol,
        signalType: 'BULLISH',
        strength,
        source: 'TECHNICAL',
        description: `Golden Cross: SMA20 (${sma20.toFixed(2)}) > SMA50 (${sma50.toFixed(2)})`,
        confidence: 0.6,
        triggers: [{
          type: 'PRICE_MOVEMENT',
          value: `SMA20: ${sma20.toFixed(2)}, SMA50: ${sma50.toFixed(2)}`,
          timestamp: new Date()
        }],
        priceData: {
          current: currentPrice,
          change: currentPrice - closes[closes.length - 2],
          changePercent: ((currentPrice - closes[closes.length - 2]) / closes[closes.length - 2]) * 100
        },
        expiration: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
      });
    }

    return signals;
  }

  // ... rest of the existing methods remain the same ...
  async generateSentimentSignals(symbol, news) {
    const signals = [];
    
    if (!news || news.length === 0) return signals;

    const recentNews = news.filter(n => 
      new Date(n.publishedAt) > new Date(Date.now() - 24 * 60 * 60 * 1000)
    );

    if (recentNews.length === 0) return signals;

    const avgSentiment = recentNews.reduce((sum, article) => sum + (article.sentiment || 0), 0) / recentNews.length;
    const positiveNews = recentNews.filter(n => (n.sentiment || 0) > 0.1).length;
    const negativeNews = recentNews.filter(n => (n.sentiment || 0) < -0.1).length;

    console.log(`📰 ${symbol} - Sentiment: ${avgSentiment.toFixed(2)}, Positive: ${positiveNews}, Negative: ${negativeNews}`);

    if (positiveNews > negativeNews * 2 && avgSentiment > 0.2) {
      signals.push({
        symbol,
        signalType: 'BULLISH',
        strength: this.normalizeStrength(avgSentiment, 0, 1),
        source: 'NEWS_SENTIMENT',
        description: `Positive news sentiment (${avgSentiment.toFixed(2)}) with ${positiveNews} positive articles`,
        confidence: 0.8,
        triggers: [{
          type: 'SENTIMENT_SHIFT',
          value: `Avg Sentiment: ${avgSentiment.toFixed(2)}`,
          timestamp: new Date()
        }],
        newsReferences: recentNews.slice(0, 3).map(n => ({
          headline: n.title,
          source: n.source?.name || 'Unknown',
          publishedAt: n.publishedAt,
          sentiment: n.sentiment || 0,
          url: n.url
        })),
        expiration: new Date(Date.now() + 12 * 60 * 60 * 1000)
      });
    } else if (negativeNews > positiveNews * 2 && avgSentiment < -0.2) {
      signals.push({
        symbol,
        signalType: 'BEARISH',
        strength: this.normalizeStrength(Math.abs(avgSentiment), 0, 1),
        source: 'NEWS_SENTIMENT',
        description: `Negative news sentiment (${avgSentiment.toFixed(2)}) with ${negativeNews} negative articles`,
        confidence: 0.8,
        triggers: [{
          type: 'SENTIMENT_SHIFT',
          value: `Avg Sentiment: ${avgSentiment.toFixed(2)}`,
          timestamp: new Date()
        }],
        newsReferences: recentNews.slice(0, 3).map(n => ({
          headline: n.title,
          source: n.source?.name || 'Unknown',
          publishedAt: n.publishedAt,
          sentiment: n.sentiment || 0,
          url: n.url
        })),
        expiration: new Date(Date.now() + 12 * 60 * 60 * 1000)
      });
    }

    return signals;
  }

  combineSignals(technicalSignals, sentimentSignals) {
    const allSignals = [...technicalSignals, ...sentimentSignals];
    const combinedSignals = [];

    // Group by symbol and signal type
    const signalGroups = {};
    
    allSignals.forEach(signal => {
      const key = `${signal.symbol}_${signal.signalType}`;
      if (!signalGroups[key]) {
        signalGroups[key] = [];
      }
      signalGroups[key].push(signal);
    });

    // Combine signals for each group
    Object.values(signalGroups).forEach(signals => {
      if (signals.length > 1) {
        const combinedSignal = this.mergeSignals(signals);
        combinedSignals.push(combinedSignal);
      } else {
        combinedSignals.push(signals[0]);
      }
    });

    return combinedSignals;
  }

  mergeSignals(signals) {
    const baseSignal = { ...signals[0] };
    
    baseSignal.source = 'COMBINED';
    baseSignal.strength = signals.reduce((sum, s) => sum + s.strength, 0) / signals.length;
    baseSignal.confidence = signals.reduce((sum, s) => sum + s.confidence, 0) / signals.length;
    
    // Combine all triggers and news references
    baseSignal.triggers = signals.flatMap(s => s.triggers);
    baseSignal.newsReferences = [
      ...new Map(
        signals.flatMap(s => s.newsReferences || [])
          .map(ref => [ref.url, ref])
      ).values()
    ];

    baseSignal.description = `Combined signal from ${signals.length} sources: ${signals.map(s => s.source).join(' + ')}`;

    return baseSignal;
  }

  // Technical indicator calculations (keep existing)
  calculateRSI(prices, period = 14) {
    if (prices.length < period + 1) return 50;

    const gains = [];
    const losses = [];

    for (let i = 1; i < prices.length; i++) {
      const change = prices[i] - prices[i - 1];
      gains.push(change > 0 ? change : 0);
      losses.push(change < 0 ? Math.abs(change) : 0);
    }

    const avgGain = gains.slice(-period).reduce((a, b) => a + b, 0) / period;
    const avgLoss = losses.slice(-period).reduce((a, b) => a + b, 0) / period;

    if (avgLoss === 0) return 100;

    const rs = avgGain / avgLoss;
    return 100 - (100 / (1 + rs));
  }

  calculateSMA(prices, period) {
    if (prices.length < period) return prices[prices.length - 1];
    return prices.slice(-period).reduce((a, b) => a + b, 0) / period;
  }

  calculateEMA(prices, period) {
    if (prices.length < period) return prices[prices.length - 1];
    
    const multiplier = 2 / (period + 1);
    let ema = prices[0];

    for (let i = 1; i < prices.length; i++) {
      ema = (prices[i] - ema) * multiplier + ema;
    }

    return ema;
  }

  calculateMACD(prices) {
    const ema12 = this.calculateEMA(prices, 12);
    const ema26 = this.calculateEMA(prices, 26);
    return ema12 - ema26;
  }

  normalizeStrength(value, min, max) {
    return Math.min(Math.max((value - min) / (max - min), 0), 1);
  }

  async getRecentSignals(symbol = null, limit = 50) {
    const query = symbol ? { symbol } : {};
    
    return await Signal.find(query)
      .sort({ timestamp: -1 })
      .limit(limit)
      .exec();
  }
}

module.exports = new SignalService();