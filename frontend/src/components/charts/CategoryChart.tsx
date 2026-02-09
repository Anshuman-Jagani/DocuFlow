import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from 'recharts';

interface CategoryData {
  name: string;
  value: number;
}

interface CategoryChartProps {
  data: CategoryData[];
  isLoading?: boolean;
}

const COLORS = ['#3b82f6', '#10b981', '#a855f7', '#f59e0b', '#ef4444'];

const CategoryChart: React.FC<CategoryChartProps> = ({ data, isLoading }) => {
  if (isLoading) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-[400px] flex flex-col">
        <div className="h-6 w-48 bg-gray-200 animate-pulse rounded mb-6" />
        <div className="flex-1 flex items-center justify-center">
          <div className="w-48 h-48 bg-gray-200 animate-pulse rounded-full" />
        </div>
      </div>
    );
  }

  const total = data.reduce((sum, item) => sum + item.value, 0);



  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      const percentage = ((data.value / total) * 100).toFixed(1);
      return (
        <div
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.98)',
            backdropFilter: 'blur(8px)',
            border: '1px solid #e5e7eb',
            borderRadius: '12px',
            boxShadow: '0 10px 25px -5px rgb(0 0 0 / 0.1)',
            padding: '12px'
          }}
        >
          <p className="text-gray-900 font-semibold text-sm mb-1">{data.name}</p>
          <p className="text-gray-700 text-sm">
            <span className="font-bold">{data.value}</span> document{data.value !== 1 ? 's' : ''}
          </p>
          <p className="text-gray-600 text-sm">
            <span className="font-bold">{percentage}%</span> of total
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-[400px] flex flex-col transition-all hover:shadow-md">
      <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center">
        <span className="w-1 h-6 bg-primary rounded-full mr-3" />
        Document Distribution
      </h3>
      <div className="flex-1 min-h-0 relative">
        {total === 0 ? (
          <div className="h-full flex items-center justify-center flex-col text-gray-400">
            <div className="w-24 h-24 rounded-full border-4 border-dashed border-gray-200 mb-4" />
            <p className="text-sm font-medium">No documents yet</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={65}
                outerRadius={100}
                paddingAngle={0}
                dataKey="value"
                stroke="none"
                animationBegin={0}
                animationDuration={1000}
                startAngle={90}
                endAngle={450}
              >
                {data.map((_, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={COLORS[index % COLORS.length]}
                    className="hover:opacity-90 transition-opacity cursor-pointer outline-none"
                  />
                ))}
              </Pie>
              <Tooltip
                content={<CustomTooltip />}
                cursor={{ fill: 'transparent' }}
              />
              <Legend 
                verticalAlign="bottom" 
                height={36} 
                iconType="circle"
                wrapperStyle={{ paddingTop: '24px', fontSize: '13px', fontWeight: 500 }}
                formatter={(value) => <span className="text-gray-700">{value}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};

export default CategoryChart;