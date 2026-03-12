import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface CategoryData { name: string; value: number; }
interface CategoryChartProps { data: CategoryData[]; isLoading?: boolean; }

// Pure monochrome palette — white shades only
const COLORS = ['#FFFFFF', '#888888', '#444444', '#222222', '#111111'];

const CategoryChart: React.FC<CategoryChartProps> = ({ data, isLoading }) => {
  if (isLoading) {
    return (
      <div className="bg-[#0A0A0A] border border-[#111111] p-6 rounded-lg h-[380px] flex flex-col animate-pulse">
        <div className="h-2.5 w-40 bg-[#1A1A1A] rounded mb-6" />
        <div className="flex-1 flex items-center justify-center">
          <div className="w-44 h-44 bg-[#050505] rounded-full" />
        </div>
      </div>
    );
  }

  const total = data.reduce((sum, item) => sum + item.value, 0);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload?.length) {
      const item = payload[0];
      const pct = total > 0 ? ((item.value / total) * 100).toFixed(1) : '0.0';
      return (
        <div style={{ backgroundColor: '#0A0A0A', border: '1px solid #1A1A1A', borderRadius: '6px',
          boxShadow: '0 20px 40px rgba(0,0,0,0.9)', padding: '10px 14px' }}>
          <p style={{ color: '#FFFFFF', fontWeight: 700, fontSize: 13, marginBottom: 4 }}>{item.name}</p>
          <p style={{ color: '#555555', fontSize: 11 }}>
            <span style={{ color: '#FFFFFF', fontWeight: 700 }}>{item.value}</span> doc{item.value !== 1 ? 's' : ''}
          </p>
          <p style={{ color: '#333333', fontSize: 11 }}>
            <span style={{ color: '#888888', fontWeight: 700 }}>{pct}%</span> of total
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-[#0A0A0A] border border-[#111111] p-6 rounded-lg h-[380px] flex flex-col hover:border-white/10 transition-all duration-300">
      <p className="text-[10px] font-bold text-[#333333] uppercase tracking-[0.18em] mb-6">Distribution</p>
      <div className="flex-1 min-h-0 relative">
        {total === 0 ? (
          <div className="h-full flex items-center justify-center flex-col gap-3 text-[#1E1E1E]">
            <div className="w-20 h-20 rounded-full border-2 border-dashed border-[#1A1A1A]" />
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#222222]">No documents</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={data} cx="50%" cy="50%" innerRadius={60} outerRadius={90}
                paddingAngle={3} dataKey="value" stroke="none"
                animationBegin={0} animationDuration={800} startAngle={90} endAngle={450}>
                {data.map((_, i) => (
                  <Cell key={`cell-${i}`} fill={COLORS[i % COLORS.length]}
                    className="hover:opacity-75 transition-opacity cursor-pointer outline-none" />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'transparent' }} />
              <Legend verticalAlign="bottom" height={36} iconType="circle"
                wrapperStyle={{ paddingTop: '20px', fontSize: '9px', fontWeight: 700,
                  color: '#333333', textTransform: 'uppercase', letterSpacing: '0.1em' }}
                formatter={(v) => <span style={{ color: '#333333' }}>{v}</span>} />
            </PieChart>
          </ResponsiveContainer>
        )}
        {/* Center label */}
        {total > 0 && (
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none" style={{ paddingBottom: 36 }}>
            <p className="text-[9px] font-bold text-[#333333] uppercase tracking-widest">Total</p>
            <p className="text-2xl font-bold text-white mt-1">{total}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryChart;