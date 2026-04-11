import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface CategoryData { name: string; value: number; }
interface CategoryChartProps { data: CategoryData[]; isLoading?: boolean; }

const COLOR_MAP: Record<string, string> = {
  'Invoices': '#22D3EE',
  'Receipts': '#D946EF',
  'Resumes': '#A78BFA',
  'Contracts': '#FBBF24'
};

const DEFAULT_COLOR = '#FFFFFF';

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

  // Only render segments that have actual documents — zero-value entries
  // still consume paddingAngle in Recharts, creating phantom gaps.
  const chartData = data.filter((item) => item.value > 0);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload?.length) {
      const item = payload[0];
      const color = COLOR_MAP[item.name] || DEFAULT_COLOR;
      const pct = total > 0 ? ((item.payload.value / total) * 100).toFixed(1) : '0.0';
      return (
        <div style={{ backgroundColor: '#0A0A0A', border: '1px solid #111111', borderRadius: '12px',
          boxShadow: '0 20px 40px rgba(0,0,0,0.9)', padding: '12px 16px' }}>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
            <p style={{ color: '#FFFFFF', fontWeight: 700, fontSize: 13 }}>{item.name}</p>
          </div>
          <p style={{ color: '#888888', fontSize: 11, marginBottom: 4 }}>
            <span style={{ color: '#FFFFFF', fontWeight: 700 }}>{item.value}</span> doc{item.value !== 1 ? 's' : ''}
          </p>
          <p style={{ color: '#444444', fontSize: 10, textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em' }}>
            <span style={{ color: color }}>{pct}%</span> Contribution
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
              <Pie data={chartData} cx="50%" cy="50%" innerRadius={65} outerRadius={95}
                paddingAngle={chartData.length > 1 ? 4 : 0} dataKey="value" stroke="none"
                animationBegin={0} animationDuration={800} startAngle={90} endAngle={-270}>
                {chartData.map((item, i) => (
                  <Cell key={`cell-${i}`} fill={COLOR_MAP[item.name] || DEFAULT_COLOR}
                    className="hover:opacity-80 transition-opacity cursor-pointer outline-none" />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'transparent' }} />
              <Legend
                verticalAlign="bottom" height={48}
                content={() => (
                  <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center',
                    gap: '8px 16px', paddingTop: '30px' }}>
                    {chartData.map((item) => (
                      <span key={item.name} style={{ display: 'flex', alignItems: 'center',
                        gap: 5, fontSize: '9px', fontWeight: 700,
                        textTransform: 'uppercase', letterSpacing: '0.15em', color: '#555555' }}>
                        <span style={{ width: 8, height: 8, borderRadius: '50%',
                          backgroundColor: COLOR_MAP[item.name] || DEFAULT_COLOR,
                          display: 'inline-block', flexShrink: 0 }} />
                        {item.name}
                      </span>
                    ))}
                  </div>
                )} />
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