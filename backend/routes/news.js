const express = require('express');
const router = express.Router();
const newsService = require('../services/newsService');
const auth = require('../middleware/auth');

// Get financial news
router.get('/', auth, async (req, res) => {
  try {
    const { symbols, days = 7 } = req.query;
    
    const symbolList = symbols ? symbols.split(',') : [];
    const news = await newsService.getFinancialNews(symbolList, days);

    res.json({
      success: true,
      data: news,
      count: news.length,
      source: newsService.apiKey ? 'newsapi' : 'mock'
    });
  } catch (error) {
    console.error('Error fetching news:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch news',
      data: newsService.getMockNewsData() // Fallback to mock data
    });
  }
});

// Get news for specific symbol
router.get('/symbol/:symbol', auth, async (req, res) => {
  try {
    const { symbol } = req.params;
    const { days = 7 } = req.query;

    const news = await newsService.getNewsForSymbol(symbol, parseInt(days));

    res.json({
      success: true,
      data: news,
      count: news.length,
      source: newsService.apiKey ? 'newsapi' : 'mock'
    });
  } catch (error) {
    console.error('Error fetching symbol news:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch symbol news',
      data: newsService.getMockNewsData().map(article => ({
        ...article,
        title: `${symbol}: ${article.title}`
      }))
    });
  }
});

module.exports = router;