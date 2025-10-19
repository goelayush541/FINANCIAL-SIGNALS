const mongoose = require('mongoose');

const backtestResultSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  name: {
    type: String,
    required: true
  },
  strategy: {
    type: String,
    required: true,
    enum: ['MOVING_AVERAGE_CROSSOVER', 'RSI_STRATEGY', 'SENTIMENT_DRIVEN', 'COMBINED_SIGNALS']
  },
  parameters: {
    type: Map,
    of: mongoose.Schema.Types.Mixed
  },
  timeframe: {
    start: { type: Date, required: true },
    end: { type: Date, required: true }
  },
  symbols: [String],
  results: {
    totalReturn: { type: Number, required: true },
    sharpeRatio: { type: Number },
    maxDrawdown: { type: Number },
    winRate: { type: Number },
    totalTrades: { type: Number },
    profitableTrades: { type: Number }
  },
  trades: [{
    symbol: String,
    action: { type: String, enum: ['BUY', 'SELL'] },
    entryPrice: Number,
    exitPrice: Number,
    quantity: Number,
    entryTime: Date,
    exitTime: Date,
    pnl: Number,
    signalId: mongoose.Schema.Types.ObjectId
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('BacktestResult', backtestResultSchema);