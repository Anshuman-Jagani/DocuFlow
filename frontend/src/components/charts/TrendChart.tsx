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
      <div className="bg-[#0A0A0A] border border-[#111111] rounded-lg p-6 animate-pulse">
        <div className="h-3 bg-[#1A1A1A] rounded w-32 mb-4" />
        <div className="h-80 bg-[#050505] rounded" />
      </div>
    );
  }

  const formattedData = data.map(item => ({
    ...item,
    date: format(new Date(item.date), 'MMM dd'),
  }));

  return (
    <div className="bg-[#0A0A0A] border border-[#111111] rounded-lg p-6 hover:border-white/10 transition-all duration-300">
      <div className="flex items-center justify-between mb-6">
        <p className="text-[10px] font-bold text-[#333333] uppercase tracking-[0.18em]">Upload Trends</p>
        <div className="flex gap-1.5">
          {([7, 30] as const).map((p) => (
            <button key={p}
              onClick={() => onPeriodChange(p)}
              className={clsx(
                'px-3 py-1 text-[10px] font-bold rounded transition-all duration-200 uppercase tracking-widest',
                period === p
                  ? 'bg-white text-black'
                  : 'text-[#333333] hover:text-white hover:bg-[#111111] border border-[#111111]'
              )}
            >
              {p}D
            </button>
          ))}
        </div>
      </div>

      {formattedData.length === 0 ? (
        <div className="h-80 flex items-center justify-center text-[#222222]">
          <p className="text-sm font-bold uppercase tracking-widest">No data</p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={formattedData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#111111" vertical={false} />
            <XAxis dataKey="date" axisLine={false} tickLine={false}
              tick={{ fill: '#333333', fontSize: 9, fontWeight: 700, letterSpacing: '0.1em' }} dy={8} />
            <YAxis axisLine={false} tickLine={false}
              tick={{ fill: '#333333', fontSize: 9, fontWeight: 700 }} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#0A0A0A', border: '1px solid #1A1A1A',
                borderRadius: '6px', color: '#FFFFFF', boxShadow: '0 20px 40px rgba(0,0,0,0.8)',
              }}
              labelStyle={{ color: '#555555', fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}
              itemStyle={{ color: '#FFFFFF', fontSize: 12 }}
            />
            <Legend wrapperStyle={{ fontSize: '9px', fontWeight: 700, color: '#333333',
              textTransform: 'uppercase', letterSpacing: '0.15em', paddingTop: '16px' }} />
            <Line type="monotone" dataKey="uploads" stroke="#FFFFFF" strokeWidth={1.5}
              dot={{ fill: '#FFFFFF', r: 2, strokeWidth: 0 }} activeDot={{ r: 4, fill: '#FFFFFF', strokeWidth: 0 }}
              name="Uploads" opacity={0.7} />
            <Line type="monotone" dataKey="processed" stroke="#4ADE80" strokeWidth={1.5}
              dot={{ fill: '#4ADE80', r: 2, strokeWidth: 0 }} activeDot={{ r: 4, fill: '#4ADE80', strokeWidth: 0 }}
              name="Processed" opacity={0.8} />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
