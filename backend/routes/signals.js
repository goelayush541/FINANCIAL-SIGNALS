const express = require('express');
const router = express.Router();
const signalService = require('../services/signalService');
const auth = require('../middleware/auth');

// Get recent signals
router.get('/', auth, async (req, res) => {
  try {
    const { symbol, limit = 50 } = req.query;
    const signals = await signalService.getRecentSignals(symbol, parseInt(limit));
    
    res.json({
      success: true,
      data: signals,
      count: signals.length
    });
  } catch (error) {
    console.error('Error fetching signals:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch signals'
    });
  }
});

// Generate signals for specific symbols
router.post('/generate', auth, async (req, res) => {
  try {
    const { symbols } = req.body;
    
    if (!symbols || !Array.isArray(symbols)) {
      return res.status(400).json({
        success: false,
        error: 'Symbols array is required'
      });
    }

    const signals = await signalService.generateSignals(symbols);
    
    res.json({
      success: true,
      data: signals,
      count: signals.length
    });
  } catch (error) {
    console.error('Error generating signals:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate signals'
    });
  }
});

// Get signal statistics
router.get('/stats', auth, async (req, res) => {
  try {
    const { days = 7 } = req.query;
    const sinceDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    // This would typically aggregate signal statistics from the database
    // For now, returning mock stats
    const stats = {
      totalSignals: 150,
      bullishSignals: 85,
      bearishSignals: 45,
      neutralSignals: 20,
      avgConfidence: 0.72,
      topPerformingSymbols: ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA']
    };

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error fetching signal stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch signal statistics'
    });
  }
});

module.exports = router;