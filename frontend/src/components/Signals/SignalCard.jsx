import React from 'react';
import { TrendingUp, TrendingDown, Minus, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';

const SignalCard = ({ signal }) => {
  const getSignalIcon = (type) => {
    switch (type) {
      case 'BULLISH':
        return <TrendingUp className="h-5 w-5 text-success-600" />;
      case 'BEARISH':
        return <TrendingDown className="h-5 w-5 text-danger-600" />;
      default:
        return <Minus className="h-5 w-5 text-gray-600" />;
    }
  };

  const getSignalColor = (type) => {
    switch (type) {
      case 'BULLISH':
        return 'bg-success-50 border-success-200';
      case 'BEARISH':
        return 'bg-danger-50 border-danger-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const getStrengthColor = (strength) => {
    if (strength > 0.7) return 'bg-success-500';
    if (strength > 0.4) return 'bg-warning-500';
    return 'bg-gray-500';
  };

  return (
    <div className={`p-4 rounded-lg border ${getSignalColor(signal.signalType)}`}>
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-3">
          {getSignalIcon(signal.signalType)}
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="font-semibold text-gray-900">{signal.symbol}</h3>
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                signal.signalType === 'BULLISH' 
                  ? 'bg-success-100 text-success-700'
                  : signal.signalType === 'BEARISH'
                  ? 'bg-danger-100 text-danger-700'
                  : 'bg-gray-100 text-gray-700'
              }`}>
                {signal.signalType}
              </span>
            </div>
            <p className="text-sm text-gray-600 mt-1">{signal.description}</p>
            <div className="flex items-center space-x-4 mt-2">
              <span className="text-xs text-gray-500">
                {format(new Date(signal.timestamp), 'MMM dd, HH:mm')}
              </span>
              <span className="text-xs text-gray-500 capitalize">{signal.source.toLowerCase()}</span>
              {signal.confidence && (
                <span className="text-xs text-gray-500">
                  Confidence: {(signal.confidence * 100).toFixed(0)}%
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <div className="w-20 bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full ${getStrengthColor(signal.strength)}`}
              style={{ width: `${signal.strength * 100}%` }}
            ></div>
          </div>
          <span className="text-sm font-medium text-gray-700 w-8">
            {(signal.strength * 100).toFixed(0)}%
          </span>
        </div>
      </div>

      {signal.newsReferences && signal.newsReferences.length > 0 && (
        <div className="mt-3 pt-3 border-t border-gray-200">
          <div className="flex items-center space-x-2 text-xs text-gray-600">
            <AlertCircle className="h-3 w-3" />
            <span>Triggered by {signal.newsReferences.length} news article(s)</span>
          </div>
        </div>
      )}

      {signal.priceData && (
        <div className="mt-3 pt-3 border-t border-gray-200">
          <div className="flex items-center space-x-4 text-sm">
            <span className="text-gray-900 font-medium">
              ${signal.priceData.current?.toFixed(2)}
            </span>
            <span className={
              signal.priceData.change >= 0 
                ? 'text-success-600' 
                : 'text-danger-600'
            }>
              {signal.priceData.change >= 0 ? '+' : ''}{signal.priceData.change?.toFixed(2)} 
              ({signal.priceData.changePercent?.toFixed(2)}%)
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default SignalCard;