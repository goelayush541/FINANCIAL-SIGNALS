const BacktestResult = require('../models/BacktestResult');
const backtestingService = require('../services/backtestingService');

exports.runBacktest = async (req, res) => {
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
      name || `${strategy} Backtest - ${new Date().toLocaleDateString()}`
    );

    res.json({
      success: true,
      data: result,
      message: 'Backtest completed successfully'
    });
  } catch (error) {
    console.error('Error running backtest:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to run backtest: ' + error.message
    });
  }
};

exports.getBacktestHistory = async (req, res) => {
  try {
    const { limit = 10, page = 1 } = req.query;

    const backtests = await BacktestResult.find({ userId: req.userId })
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .exec();

    const total = await BacktestResult.countDocuments({ userId: req.userId });

    res.json({
      success: true,
      data: backtests,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching backtest history:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch backtest history'
    });
  }
};

exports.getBacktestById = async (req, res) => {
  try {
    const { id } = req.params;

    const backtest = await BacktestResult.findOne({
      _id: id,
      userId: req.userId
    });

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
};

exports.deleteBacktest = async (req, res) => {
  try {
    const { id } = req.params;

    const backtest = await BacktestResult.findOneAndDelete({
      _id: id,
      userId: req.userId
    });

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
};

exports.getBacktestMetrics = async (req, res) => {
  try {
    const backtests = await BacktestResult.find({ userId: req.userId })
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

    res.json({
      success: true,
      data: metrics
    });
  } catch (error) {
    console.error('Error calculating backtest metrics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to calculate metrics'
    });
  }
};