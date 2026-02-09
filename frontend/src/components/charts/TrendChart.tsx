import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { TrendData } from '../../services/dashboardService';
import { format } from 'date-fns';
import clsx from 'clsx';

interface TrendChartProps {
  data: TrendData[];
  period: 7 | 30;
  onPeriodChange: (period: 7 | 30) => void;
  isLoading?: boolean;
}

export default function TrendChart({ data, period, onPeriodChange, isLoading = false }: TrendChartProps) {
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="h-8 bg-gray-200 rounded w-48 mb-4 animate-pulse"></div>
        <div className="h-80 bg-gray-100 rounded animate-pulse"></div>
      </div>
    );
  }

  const formattedData = data.map(item => ({
    ...item,
    date: format(new Date(item.date), 'MMM dd'),
  }));

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Upload Trends</h3>
        <div className="flex space-x-2">
          <button
            onClick={() => onPeriodChange(7)}
            className={clsx(
              'px-4 py-2 text-sm font-medium rounded-lg transition-colors',
              period === 7
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            )}
          >
            7 Days
          </button>
          <button
            onClick={() => onPeriodChange(30)}
            className={clsx(
              'px-4 py-2 text-sm font-medium rounded-lg transition-colors',
              period === 30
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            )}
          >
            30 Days
          </button>
        </div>
      </div>

      {formattedData.length === 0 ? (
        <div className="h-80 flex items-center justify-center text-gray-500">
          <p>No trend data available</p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={320}>
          <LineChart data={formattedData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis 
              dataKey="date" 
              stroke="#6b7280"
              style={{ fontSize: '12px' }}
            />
            <YAxis 
              stroke="#6b7280"
              style={{ fontSize: '12px' }}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              }}
            />
            <Legend 
              wrapperStyle={{ fontSize: '14px' }}
            />
            <Line 
              type="monotone" 
              dataKey="uploads" 
              stroke="#3b82f6" 
              strokeWidth={2}
              dot={{ fill: '#3b82f6', r: 4 }}
              activeDot={{ r: 6 }}
              name="Uploads"
            />
            <Line 
              type="monotone" 
              dataKey="processed" 
              stroke="#10b981" 
              strokeWidth={2}
              dot={{ fill: '#10b981', r: 4 }}
              activeDot={{ r: 6 }}
              name="Processed"
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
