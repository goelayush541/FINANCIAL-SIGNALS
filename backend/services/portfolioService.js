const Portfolio = require('../models/Portfolio');
const alphaVantageService = require('./alphaVantageService');

class PortfolioService {
  async createPortfolio(userId, portfolioData) {
    const portfolio = new Portfolio({
      userId,
      ...portfolioData,
      currentValue: portfolioData.initialCapital
    });

    return await portfolio.save();
  }

  async getPortfolios(userId) {
    return await Portfolio.find({ userId }).sort({ createdAt: -1 });
  }

  async getPortfolio(userId, portfolioId) {
    return await Portfolio.findOne({ _id: portfolioId, userId });
  }

  async updatePortfolioValues(userId, portfolioId) {
    const portfolio = await this.getPortfolio(userId, portfolioId);
    if (!portfolio) throw new Error('Portfolio not found');

    let totalValue = 0;
    
    // Update prices for all positions
    for (let position of portfolio.positions) {
      try {
        const priceData = await alphaVantageService.getIntradayData(position.symbol);
        const currentPrice = priceData[0]?.close || position.currentPrice;
        
        position.currentPrice = currentPrice;
        position.unrealizedPnL = (currentPrice - position.averagePrice) * position.quantity;
        
        totalValue += currentPrice * position.quantity;
      } catch (error) {
        console.error(`Error updating price for ${position.symbol}:`, error);
        totalValue += position.currentPrice * position.quantity;
      }
    }

    // Add cash position
    const cash = portfolio.initialCapital - portfolio.positions.reduce((sum, pos) => 
      sum + (pos.averagePrice * pos.quantity), 0
    );
    
    portfolio.currentValue = totalValue + cash;
    portfolio.performance.totalReturn = ((portfolio.currentValue - portfolio.initialCapital) / portfolio.initialCapital) * 100;

    return await portfolio.save();
  }

  async addPosition(userId, portfolioId, positionData) {
    const portfolio = await this.getPortfolio(userId, portfolioId);
    if (!portfolio) throw new Error('Portfolio not found');

    const existingPosition = portfolio.positions.find(
      pos => pos.symbol === positionData.symbol
    );

    if (existingPosition) {
      // Update existing position
      const totalQuantity = existingPosition.quantity + positionData.quantity;
      const totalCost = (existingPosition.averagePrice * existingPosition.quantity) + 
                       (positionData.averagePrice * positionData.quantity);
      
      existingPosition.averagePrice = totalCost / totalQuantity;
      existingPosition.quantity = totalQuantity;
    } else {
      // Add new position
      portfolio.positions.push(positionData);
    }

    await this.updatePortfolioValues(userId, portfolioId);
    return await portfolio.save();
  }

  async removePosition(userId, portfolioId, symbol, quantity) {
    const portfolio = await this.getPortfolio(userId, portfolioId);
    if (!portfolio) throw new Error('Portfolio not found');

    const positionIndex = portfolio.positions.findIndex(pos => pos.symbol === symbol);
    if (positionIndex === -1) throw new Error('Position not found');

    const position = portfolio.positions[positionIndex];
    
    if (quantity >= position.quantity) {
      // Remove entire position
      portfolio.positions.splice(positionIndex, 1);
    } else {
      // Reduce position size
      position.quantity -= quantity;
    }

    await this.updatePortfolioValues(userId, portfolioId);
    return await portfolio.save();
  }
}

module.exports = new PortfolioService();