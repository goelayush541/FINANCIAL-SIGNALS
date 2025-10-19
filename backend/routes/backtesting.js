const express = require('express');
const router = express.Router();
const backtestingService = require('../services/backtestingService');
const BacktestResult = require('../models/BacktestResult');
const auth = require('../middleware/auth');

// Run backtest
router.post('/run', auth, async (req, res) => {
  try {
    const {
      strategy,
      parameters,
      symbols,
      startDate,
      endDate,
      name
    } = req.body;

    if (!strategy || !symbols || !startDate || !endDate) {
      return res.status(400).json({
        success: false,
        error: 'Strategy, symbols, startDate, and endDate are required'
      });
    }

    const result = await backtestingService.runBacktest(
      strategy,
      parameters || {},
      symbols,
      new Date(startDate),
      new Date(endDate),
      req.userId,
      name
    );

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error running backtest:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to run backtest'
    });
  }
});

// Get user's backtest history
router.get('/history', auth, async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    const backtests = await backtestingService.getUserBacktests(
      req.userId,
      parseInt(limit)
    );

    res.json({
      success: true,
      data: backtests
    });
  } catch (error) {
    console.error('Error fetching backtest history:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch backtest history'
    });
  }
});

// Get backtest by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const backtest = await backtestingService.getBacktestById(req.userId, req.params.id);

    if (!backtest) {
      return res.status(404).json({
        success: false,
        error: 'Backtest not found'
      });
    }

    res.json({
      success: true,
      data: backtest
    });
  } catch (error) {
    console.error('Error fetching backtest:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch backtest'
    });
  }
});

// Delete backtest
router.delete('/:id', auth, async (req, res) => {
  try {
    const backtest = await backtestingService.deleteBacktest(req.userId, req.params.id);

    if (!backtest) {
      return res.status(404).json({
        success: false,
        error: 'Backtest not found'
      });
    }

    res.json({
      success: true,
      message: 'Backtest deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting backtest:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete backtest'
    });
  }
});

// Get backtest metrics
router.get('/metrics/overview', auth, async (req, res) => {
  try {
    const metrics = await backtestingService.getBacktestMetrics(req.userId);

    res.json({
      success: true,
      data: metrics
    });
  } catch (error) {
    console.error('Error fetching backtest metrics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch backtest metrics'
    });
  }
});

module.exports = router;