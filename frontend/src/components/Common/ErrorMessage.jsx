import React from 'react';
import { AlertCircle } from 'lucide-react';

const ErrorMessage = ({ title, message, onRetry }) => {
  return (
    <div className="bg-danger-50 border border-danger-200 rounded-lg p-4">
      <div className="flex items-start space-x-3">
        <AlertCircle className="h-5 w-5 text-danger-600 mt-0.5" />
        <div className="flex-1">
          {title && <h3 className="text-sm font-medium text-danger-800">{title}</h3>}
          <p className="text-sm text-danger-700 mt-1">{message}</p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="mt-3 text-sm font-medium text-danger-600 hover:text-danger-500"
            >
              Try again
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ErrorMessage;