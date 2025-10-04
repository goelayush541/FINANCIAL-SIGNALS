const alphaVantageService = require('./alphaVantageService');
const BacktestResult = require('../models/BacktestResult');

class BacktestingService {
  constructor() {
    this.strategies = {
      MOVING_AVERAGE_CROSSOVER: this.movingAverageCrossover,
      RSI_STRATEGY: this.rsiStrategy,
      SENTIMENT_DRIVEN: this.sentimentDrivenStrategy,
      COMBINED_SIGNALS: this.combinedSignalsStrategy
    };
  }

  async runBacktest(strategy, parameters, symbols, startDate, endDate, userId, name = null) {
    const results = {
      totalReturn: 0,
      sharpeRatio: 0,
      maxDrawdown: 0,
      winRate: 0,
      totalTrades: 0,
      profitableTrades: 0
    };

    const trades = [];
    const strategyFn = this.strategies[strategy];

    if (!strategyFn) {
      throw new Error(`Unknown strategy: ${strategy}`);
    }

    for (const symbol of symbols) {
      try {
        const historicalData = await this.getHistoricalData(symbol, startDate, endDate);
        const symbolTrades = await strategyFn.call(this, symbol, historicalData, parameters);
        
        trades.push(...symbolTrades);
      } catch (error) {
        console.error(`Error backtesting ${symbol}:`, error);
      }
    }

    // Calculate performance metrics
    results.totalTrades = trades.length;
    results.profitableTrades = trades.filter(t => t.pnl > 0).length;
    results.winRate = results.totalTrades > 0 ? results.profitableTrades / results.totalTrades : 0;
    results.totalReturn = trades.reduce((sum, trade) => sum + trade.pnl, 0);
    
    // Calculate max drawdown
    results.maxDrawdown = this.calculateMaxDrawdown(trades);
    
    // Calculate Sharpe ratio (simplified)
    results.sharpeRatio = this.calculateSharpeRatio(trades);

    // Save backtest result
    const backtestResult = new BacktestResult({
      userId,
      name: name || `${strategy} Backtest - ${new Date().toLocaleDateString()}`,
      strategy,
      parameters,
      timeframe: { start: startDate, end: endDate },
      symbols,
      results,
      trades
    });

    await backtestResult.save();

    return backtestResult;
  }

  async movingAverageCrossover(symbol, data, parameters) {
    const { shortPeriod = 20, longPeriod = 50 } = parameters;
    const trades = [];
    let position = null;

    for (let i = longPeriod; i < data.length; i++) {
      const slice = data.slice(0, i + 1);
      const prices = slice.map(d => d.close);
      
      const shortMA = this.calculateSMA(prices, shortPeriod);
      const longMA = this.calculateSMA(prices, longPeriod);
      const currentPrice = prices[prices.length - 1];

      if (shortMA > longMA && !position) {
        // Buy signal
        position = {
          symbol,
          entryPrice: currentPrice,
          entryTime: slice[slice.length - 1].timestamp,
          quantity: 100 // Fixed quantity for simplicity
        };
      } else if (shortMA < longMA && position) {
        // Sell signal
        const trade = {
          symbol,
          action: 'SELL',
          entryPrice: position.entryPrice,
          exitPrice: currentPrice,
          quantity: position.quantity,
          entryTime: position.entryTime,
          exitTime: slice[slice.length - 1].timestamp,
          pnl: (currentPrice - position.entryPrice) * position.quantity
        };
        trades.push(trade);
        position = null;
      }
    }

    // Close any open position at the end
    if (position) {
      const lastPrice = data[data.length - 1].close;
      const trade = {
        symbol,
        action: 'SELL',
        entryPrice: position.entryPrice,
        exitPrice: lastPrice,
        quantity: position.quantity,
        entryTime: position.entryTime,
        exitTime: data[data.length - 1].timestamp,
        pnl: (lastPrice - position.entryPrice) * position.quantity
      };
      trades.push(trade);
    }

    return trades;
  }

  async rsiStrategy(symbol, data, parameters) {
    const { oversold = 30, overbought = 70, period = 14 } = parameters;
    const trades = [];
    let position = null;

    for (let i = period; i < data.length; i++) {
      const slice = data.slice(0, i + 1);
      const prices = slice.map(d => d.close);
      
      const rsi = this.calculateRSI(prices, period);
      const currentPrice = prices[prices.length - 1];

      if (rsi < oversold && !position) {
        // Buy signal
        position = {
          symbol,
          entryPrice: currentPrice,
          entryTime: slice[slice.length - 1].timestamp,
          quantity: 100
        };
      } else if (rsi > overbought && position) {
        // Sell signal
        const trade = {
          symbol,
          action: 'SELL',
          entryPrice: position.entryPrice,
          exitPrice: currentPrice,
          quantity: position.quantity,
          entryTime: position.entryTime,
          exitTime: slice[slice.length - 1].timestamp,
          pnl: (currentPrice - position.entryPrice) * position.quantity
        };
        trades.push(trade);
        position = null;
      }
    }

    // Close any open position
    if (position) {
      const lastPrice = data[data.length - 1].close;
      const trade = {
        symbol,
        action: 'SELL',
        entryPrice: position.entryPrice,
        exitPrice: lastPrice,
        quantity: position.quantity,
        entryTime: position.entryTime,
        exitTime: data[data.length - 1].timestamp,
        pnl: (lastPrice - position.entryPrice) * position.quantity
      };
      trades.push(trade);
    }

    return trades;
  }

  async sentimentDrivenStrategy(symbol, data, parameters) {
    // This would integrate with actual sentiment data
    // For now, using a simplified version based on price movements
    return this.movingAverageCrossover(symbol, data, parameters);
  }

  async combinedSignalsStrategy(symbol, data, parameters) {
    // Combine multiple signal types
    const trades = [];
    
    // Implement combined strategy logic here
    // This would integrate technical signals with sentiment analysis
    
    return trades;
  }

  calculateSMA(prices, period) {
    if (prices.length < period) return prices[prices.length - 1];
    return prices.slice(-period).reduce((a, b) => a + b, 0) / period;
  }

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

  calculateMaxDrawdown(trades) {
    let maxDrawdown = 0;
    let peak = 0;
    let runningTotal = 0;

    for (const trade of trades) {
      runningTotal += trade.pnl;
      if (runningTotal > peak) {
        peak = runningTotal;
      }
      const drawdown = peak - runningTotal;
      if (drawdown > maxDrawdown) {
        maxDrawdown = drawdown;
      }
    }

    return maxDrawdown;
  }

  calculateSharpeRatio(trades, riskFreeRate = 0.02) {
    if (trades.length === 0) return 0;

    const returns = trades.map(t => t.pnl);
    const avgReturn = returns.reduce((a, b) => a + b, 0) / returns.length;
    const stdDev = Math.sqrt(
      returns.reduce((a, b) => a + Math.pow(b - avgReturn, 2), 0) / returns.length
    );

    if (stdDev === 0) return 0;

    return (avgReturn - riskFreeRate) / stdDev;
  }

  async getHistoricalData(symbol, startDate, endDate) {
    // For a real implementation, you would fetch historical data
    // Here we're using daily data from Alpha Vantage
    try {
      const data = await alphaVantageService.getDailyData(symbol);
      return data.filter(d => 
        d.timestamp >= startDate && d.timestamp <= endDate
      );
    } catch (error) {
      console.error(`Error fetching historical data for ${symbol}:`, error);
      return [];
    }
  }

  async getUserBacktests(userId, limit = 10) {
    return await BacktestResult.find({ userId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .exec();
  }

  async getBacktestById(userId, backtestId) {
    return await BacktestResult.findOne({
      _id: backtestId,
      userId
    });
  }

  async deleteBacktest(userId, backtestId) {
    return await BacktestResult.findOneAndDelete({
      _id: backtestId,
      userId
    });
  }

  async getBacktestMetrics(userId) {
    const backtests = await BacktestResult.find({ userId })
      .sort({ createdAt: -1 })
      .limit(50);

    const metrics = {
      totalBacktests: backtests.length,
      avgReturn: 0,
      bestReturn: 0,
      worstReturn: 0,
      winRate: 0,
      totalTrades: 0
    };

    if (backtests.length > 0) {
      const returns = backtests.map(bt => bt.results.totalReturn);
      const winningBacktests = backtests.filter(bt => bt.results.totalReturn > 0);
      
      metrics.avgReturn = returns.reduce((a, b) => a + b, 0) / returns.length;
      metrics.bestReturn = Math.max(...returns);
      metrics.worstReturn = Math.min(...returns);
      metrics.winRate = (winningBacktests.length / backtests.length) * 100;
      metrics.totalTrades = backtests.reduce((sum, bt) => sum + bt.results.totalTrades, 0);
    }

    return metrics;
  }
}

module.exports = new BacktestingService();