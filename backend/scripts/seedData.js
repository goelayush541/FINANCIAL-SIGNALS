const mongoose = require('mongoose');
require('dotenv').config();

const User = require('../models/User');
const Signal = require('../models/Signal');

const seedData = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/financial-signals');
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Signal.deleteMany({});
    console.log('Cleared existing data');

    // Create sample user
    const user = new User({
      email: 'demo@finsignal.com',
      password: 'password123',
      firstName: 'Demo',
      lastName: 'User',
      preferences: {
        watchlist: ['AAPL', 'MSFT', 'GOOGL'],
        riskTolerance: 'MEDIUM',
        notifications: {
          email: true,
          signals: true
        }
      }
    });

    await user.save();
    console.log('Created demo user');

    // Create sample signals
    const sampleSignals = [
      {
        symbol: 'AAPL',
        signalType: 'BULLISH',
        strength: 0.85,
        source: 'COMBINED',
        description: 'Strong bullish signal with positive RSI and moving average crossover',
        confidence: 0.78,
        triggers: [
          {
            type: 'PRICE_MOVEMENT',
            value: 'RSI: 25.3, Golden Cross detected',
            timestamp: new Date()
          }
        ],
        priceData: {
          current: 175.43,
          change: 2.15,
          changePercent: 1.24,
          volume: 45218900
        },
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        expiration: new Date(Date.now() + 24 * 60 * 60 * 1000)
      },
      {
        symbol: 'TSLA',
        signalType: 'BEARISH',
        strength: 0.72,
        source: 'NEWS_SENTIMENT',
        description: 'Negative news sentiment with high volume selling pressure',
        confidence: 0.65,
        triggers: [
          {
            type: 'SENTIMENT_SHIFT',
            value: 'Avg Sentiment: -0.34',
            timestamp: new Date()
          }
        ],
        newsReferences: [
          {
            headline: 'Tesla faces regulatory challenges in key markets',
            source: 'Financial Times',
            publishedAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
            sentiment: -0.45,
            url: 'https://example.com/news/1'
          }
        ],
        priceData: {
          current: 235.67,
          change: -8.92,
          changePercent: -3.65,
          volume: 78345200
        },
        timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
        expiration: new Date(Date.now() + 12 * 60 * 60 * 1000)
      },
      {
        symbol: 'MSFT',
        signalType: 'BULLISH',
        strength: 0.68,
        source: 'TECHNICAL',
        description: 'RSI indicates oversold conditions with potential reversal',
        confidence: 0.72,
        triggers: [
          {
            type: 'PRICE_MOVEMENT',
            value: 'RSI: 28.7, approaching oversold territory',
            timestamp: new Date()
          }
        ],
        priceData: {
          current: 334.89,
          change: 1.23,
          changePercent: 0.37,
          volume: 28945600
        },
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
        expiration: new Date(Date.now() + 48 * 60 * 60 * 1000)
      }
    ];

    await Signal.insertMany(sampleSignals);
    console.log('Created sample signals');

    console.log('Database seeded successfully!');
    console.log('Demo credentials:');
    console.log('Email: demo@finsignal.com');
    console.log('Password: password123');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedData();