import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-200 mt-auto">
      <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center space-x-2 mb-4 md:mb-0">
            <div className="w-6 h-6 bg-gradient-to-r from-primary-500 to-primary-600 rounded flex items-center justify-center">
              <span className="text-white text-xs font-bold">F</span>
            </div>
            <span className="text-sm font-medium text-gray-900">FinSignal</span>
          </div>
          
          <div className="flex items-center space-x-6">
            <span className="text-sm text-gray-500">
              © 2024 FinSignal. All rights reserved.
            </span>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-gray-500 text-sm">
                Privacy
              </a>
              <a href="#" className="text-gray-400 hover:text-gray-500 text-sm">
                Terms
              </a>
              <a href="#" className="text-gray-400 hover:text-gray-500 text-sm">
                Support
              </a>
            </div>
          </div>
          
          <div className="text-sm text-gray-500">
            <span>Data provided by </span>
            <a 
              href="https://www.alphavantage.co/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary-600 hover:text-primary-700"
            >
              Alpha Vantage
            </a>
            <span> and </span>
            <a 
              href="https://newsapi.org/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary-600 hover:text-primary-700"
            >
              News API
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;