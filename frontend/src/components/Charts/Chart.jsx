import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';

const Chart = ({ data, symbol }) => {
  if (!data || data.length === 0) {
    return (
      <div className="h-96 flex items-center justify-center text-gray-500">
        No chart data available
      </div>
    );
  }

  // Format data for Recharts
  const chartData = data
    .slice()
    .reverse()
    .map(item => ({
      timestamp: new Date(item.timestamp).toLocaleTimeString(),
      time: new Date(item.timestamp).getTime(),
      price: item.close,
      open: item.open,
      high: item.high,
      low: item.low,
      volume: item.volume
    }));

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900">{label}</p>
          <p className="text-sm text-gray-600">
            Price: <span className="font-medium">${data.price?.toFixed(2)}</span>
          </p>
          <p className="text-sm text-gray-600">
            Open: <span className="font-medium">${data.open?.toFixed(2)}</span>
          </p>
          <p className="text-sm text-gray-600">
            High: <span className="font-medium">${data.high?.toFixed(2)}</span>
          </p>
          <p className="text-sm text-gray-600">
            Low: <span className="font-medium">${data.low?.toFixed(2)}</span>
          </p>
          <p className="text-sm text-gray-600">
            Volume: <span className="font-medium">{data.volume?.toLocaleString()}</span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="h-96 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis 
            dataKey="timestamp"
            tick={{ fontSize: 12 }}
            interval="preserveStartEnd"
          />
          <YAxis 
            tick={{ fontSize: 12 }}
            tickFormatter={(value) => `$${value.toFixed(2)}`}
            domain={['dataMin - 1', 'dataMax + 1']}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Line
            type="monotone"
            dataKey="price"
            stroke="#0ea5e9"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4 }}
            name={`${symbol} Price`}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default Chart;