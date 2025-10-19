const express = require('express');
const router = express.Router();
const portfolioService = require('../services/portfolioService');
const auth = require('../middleware/auth');

// Get all portfolios for user
router.get('/', auth, async (req, res) => {
  try {
    const portfolios = await portfolioService.getPortfolios(req.userId);
    
    res.json({
      success: true,
      data: portfolios
    });
  } catch (error) {
    console.error('Error fetching portfolios:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch portfolios'
    });
  }
});

// Get specific portfolio
router.get('/:id', auth, async (req, res) => {
  try {
    const portfolio = await portfolioService.getPortfolio(req.userId, req.params.id);
    
    if (!portfolio) {
      return res.status(404).json({
        success: false,
        error: 'Portfolio not found'
      });
    }

    res.json({
      success: true,
      data: portfolio
    });
  } catch (error) {
    console.error('Error fetching portfolio:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch portfolio'
    });
  }
});

// Create new portfolio
router.post('/', auth, async (req, res) => {
  try {
    const { name, description, initialCapital } = req.body;
    
    if (!name || !initialCapital) {
      return res.status(400).json({
        success: false,
        error: 'Name and initial capital are required'
      });
    }

    const portfolio = await portfolioService.createPortfolio(req.userId, {
      name,
      description,
      initialCapital: parseFloat(initialCapital)
    });

    res.status(201).json({
      success: true,
      data: portfolio
    });
  } catch (error) {
    console.error('Error creating portfolio:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create portfolio'
    });
  }
});

// Add position to portfolio
router.post('/:id/positions', auth, async (req, res) => {
  try {
    const { symbol, quantity, averagePrice, signalId } = req.body;
    
    if (!symbol || !quantity || !averagePrice) {
      return res.status(400).json({
        success: false,
        error: 'Symbol, quantity, and average price are required'
      });
    }

    const portfolio = await portfolioService.addPosition(
      req.userId, 
      req.params.id, 
      { symbol, quantity: parseInt(quantity), averagePrice: parseFloat(averagePrice), signalId }
    );

    res.json({
      success: true,
      data: portfolio
    });
  } catch (error) {
    console.error('Error adding position:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to add position'
    });
  }
});

// Update portfolio values
router.post('/:id/update-values', auth, async (req, res) => {
  try {
    const portfolio = await portfolioService.updatePortfolioValues(req.userId, req.params.id);
    
    res.json({
      success: true,
      data: portfolio
    });
  } catch (error) {
    console.error('Error updating portfolio values:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update portfolio values'
    });
  }
});

module.exports = router;