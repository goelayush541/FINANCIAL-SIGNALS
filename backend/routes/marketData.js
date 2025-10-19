const express = require('express');
const router = express.Router();
const alphaVantageService = require('../services/alphaVantageService');
const auth = require('../middleware/auth');

// Get intraday data for symbol
router.get('/intraday/:symbol', auth, async (req, res) => {
  try {
    const { symbol } = req.params;
    const { interval = '5min' } = req.query;

    const data = await alphaVantageService.getIntradayData(symbol, interval);
    
    res.json({
      success: true,
      data: {
        symbol,
        interval,
        data
      }
    });
  } catch (error) {
    console.error('Error fetching intraday data:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch market data'
    });
  }
});

// Search symbols
router.get('/search', auth, async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q) {
      return res.status(400).json({
        success: false,
        error: 'Query parameter "q" is required'
      });
    }

    const results = await alphaVantageService.searchSymbols(q);
    
    res.json({
      success: true,
      data: results
    });
  } catch (error) {
    console.error('Error searching symbols:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to search symbols'
    });
  }
});

// Get multiple symbols data
router.post('/batch', auth, async (req, res) => {
  try {
    const { symbols } = req.body;
    
    if (!symbols || !Array.isArray(symbols)) {
      return res.status(400).json({
        success: false,
        error: 'Symbols array is required'
      });
    }

    const data = await Promise.all(
      symbols.map(async (symbol) => {
        try {
          const symbolData = await alphaVantageService.getIntradayData(symbol);
          return { symbol, data: symbolData };
        } catch (error) {
          return { symbol, data: null, error: error.message };
        }
      })
    );

    res.json({
      success: true,
      data
    });
  } catch (error) {
    console.error('Error fetching batch data:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch batch market data'
    });
  }
});

module.exports = router;