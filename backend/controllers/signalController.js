const Signal = require('../models/Signal');
const signalService = require('../services/signalService');

exports.getSignals = async (req, res) => {
  try {
    const { symbol, type, source, limit = 50, page = 1 } = req.query;
    
    const filter = {};
    if (symbol) filter.symbol = symbol.toUpperCase();
    if (type) filter.signalType = type;
    if (source) filter.source = source;

    const signals = await Signal.find(filter)
      .sort({ timestamp: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .exec();

    const total = await Signal.countDocuments(filter);

    res.json({
      success: true,
      data: signals,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching signals:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch signals'
    });
  }
};

exports.generateSignals = async (req, res) => {
  try {
    const { symbols } = req.body;

    if (!symbols || !Array.isArray(symbols) || symbols.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Symbols array is required and cannot be empty'
      });
    }

    // Validate symbols
    const validSymbols = symbols.filter(sym => 
      typeof sym === 'string' && sym.length <= 5
    );

    if (validSymbols.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No valid symbols provided'
      });
    }

    const signals = await signalService.generateSignals(validSymbols);

    res.json({
      success: true,
      data: signals,
      count: signals.length,
      message: `Generated ${signals.length} signals for ${validSymbols.length} symbols`
    });
  } catch (error) {
    console.error('Error generating signals:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate signals'
    });
  }
};

exports.getSignalStats = async (req, res) => {
  try {
    const { days = 7 } = req.query;
    const sinceDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const stats = await Signal.aggregate([
      {
        $match: {
          timestamp: { $gte: sinceDate }
        }
      },
      {
        $group: {
          _id: '$signalType',
          count: { $sum: 1 },
          avgStrength: { $avg: '$strength' },
          avgConfidence: { $avg: '$confidence' }
        }
      },
      {
        $project: {
          signalType: '$_id',
          count: 1,
          avgStrength: { $round: ['$avgStrength', 3] },
          avgConfidence: { $round: ['$avgConfidence', 3] },
          _id: 0
        }
      }
    ]);

    const totalSignals = await Signal.countDocuments({ timestamp: { $gte: sinceDate } });
    const symbolStats = await Signal.aggregate([
      {
        $match: {
          timestamp: { $gte: sinceDate }
        }
      },
      {
        $group: {
          _id: '$symbol',
          signalCount: { $sum: 1 },
          bullishCount: {
            $sum: { $cond: [{ $eq: ['$signalType', 'BULLISH'] }, 1, 0] }
          },
          bearishCount: {
            $sum: { $cond: [{ $eq: ['$signalType', 'BEARISH'] }, 1, 0] }
          }
        }
      },
      {
        $sort: { signalCount: -1 }
      },
      {
        $limit: 10
      }
    ]);

    res.json({
      success: true,
      data: {
        totalSignals,
        signalTypeStats: stats,
        topSymbols: symbolStats,
        timeframe: {
          start: sinceDate,
          end: new Date()
        }
      }
    });
  } catch (error) {
    console.error('Error fetching signal stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch signal statistics'
    });
  }
};

exports.getSignalById = async (req, res) => {
  try {
    const { id } = req.params;

    const signal = await Signal.findById(id);
    if (!signal) {
      return res.status(404).json({
        success: false,
        error: 'Signal not found'
      });
    }

    res.json({
      success: true,
      data: signal
    });
  } catch (error) {
    console.error('Error fetching signal:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch signal'
    });
  }
};

exports.deleteSignal = async (req, res) => {
  try {
    const { id } = req.params;

    const signal = await Signal.findByIdAndDelete(id);
    if (!signal) {
      return res.status(404).json({
        success: false,
        error: 'Signal not found'
      });
    }

    res.json({
      success: true,
      message: 'Signal deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting signal:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete signal'
    });
  }
};