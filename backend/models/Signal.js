const mongoose = require('mongoose');

const signalSchema = new mongoose.Schema({
  symbol: {
    type: String,
    required: true,
    index: true
  },
  signalType: {
    type: String,
    enum: ['BULLISH', 'BEARISH', 'NEUTRAL'],
    required: true
  },
  strength: {
    type: Number,
    min: 0,
    max: 1,
    required: true
  },
  source: {
    type: String,
    enum: ['TECHNICAL', 'NEWS_SENTIMENT', 'COMBINED'],
    required: true
  },
  description: {
    type: String,
    required: true
  },
  confidence: {
    type: Number,
    min: 0,
    max: 1
  },
  triggers: [{
    type: {
      type: String,
      enum: ['PRICE_MOVEMENT', 'VOLUME_SURGE', 'NEWS_EVENT', 'SENTIMENT_SHIFT']
    },
    value: mongoose.Schema.Types.Mixed,
    timestamp: Date
  }],
  newsReferences: [{
    headline: String,
    source: String,
    publishedAt: Date,
    sentiment: Number,
    url: String
  }],
  priceData: {
    current: Number,
    change: Number,
    changePercent: Number,
    volume: Number
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  },
  expiration: {
    type: Date,
    index: true
  }
}, {
  timestamps: true
});

// Compound index for efficient queries
signalSchema.index({ symbol: 1, timestamp: -1 });
signalSchema.index({ signalType: 1, strength: -1 });

module.exports = mongoose.model('Signal', signalSchema);