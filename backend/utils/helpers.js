const moment = require('moment');

class Helpers {
  static formatPrice(price) {
    if (price === undefined || price === null) return 'N/A';
    return parseFloat(price).toFixed(2);
  }

  static calculatePercentageChange(oldValue, newValue) {
    if (!oldValue || !newValue) return 0;
    return ((newValue - oldValue) / oldValue) * 100;
  }

  static generateSignalId() {
    return `SIG_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  static normalizeText(text) {
    if (!text) return '';
    return text
      .toString()
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, ' ');
  }

  static formatTimestamp(date) {
    return moment(date).format('YYYY-MM-DD HH:mm:ss');
  }

  static isMarketHours() {
    const now = moment().utc();
    const day = now.day();
    const hour = now.hour();
    
    // Market hours: Monday-Friday, 9:30 AM - 4:00 PM EST (UTC-5)
    // Convert to UTC: 14:30 - 21:00 UTC
    if (day >= 1 && day <= 5) { // Monday to Friday
      if (hour >= 14 && hour < 21) {
        return true;
      }
    }
    return false;
  }

  static calculateVolatility(prices) {
    if (!prices || prices.length < 2) return 0;
    
    const returns = [];
    for (let i = 1; i < prices.length; i++) {
      const returnVal = (prices[i] - prices[i - 1]) / prices[i - 1];
      returns.push(returnVal);
    }
    
    const mean = returns.reduce((a, b) => a + b, 0) / returns.length;
    const variance = returns.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / returns.length;
    
    return Math.sqrt(variance) * Math.sqrt(252); // Annualized volatility
  }

  static sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  static validateSymbol(symbol) {
    return /^[A-Z]{1,5}$/.test(symbol);
  }

  static formatLargeNumber(num) {
    if (num >= 1000000000) {
      return (num / 1000000000).toFixed(2) + 'B';
    }
    if (num >= 1000000) {
      return (num / 1000000).toFixed(2) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(2) + 'K';
    }
    return num.toString();
  }
}

module.exports = Helpers;