const { body, validationResult } = require('express-validator');

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: errors.array()
    });
  }
  next();
};

exports.validateRegister = [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('firstName').notEmpty().trim(),
  body('lastName').notEmpty().trim(),
  handleValidationErrors
];

exports.validateLogin = [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty(),
  handleValidationErrors
];

exports.validateBacktest = [
  body('strategy').isIn(['MOVING_AVERAGE_CROSSOVER', 'RSI_STRATEGY', 'SENTIMENT_DRIVEN', 'COMBINED_SIGNALS']),
  body('symbols').isArray({ min: 1 }),
  body('startDate').isISO8601(),
  body('endDate').isISO8601(),
  handleValidationErrors
];

exports.validatePortfolio = [
  body('name').notEmpty().trim(),
  body('initialCapital').isFloat({ min: 0 }),
  handleValidationErrors
];

exports.validatePosition = [
  body('symbol').notEmpty().trim(),
  body('quantity').isInt({ min: 1 }),
  body('averagePrice').isFloat({ min: 0 }),
  handleValidationErrors
];