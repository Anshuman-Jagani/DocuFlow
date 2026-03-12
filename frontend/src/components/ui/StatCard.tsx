import type { LucideIcon } from 'lucide-react';
import clsx from 'clsx';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: { value: number; isPositive: boolean };
  color?: 'blue' | 'green' | 'yellow' | 'red' | 'purple';
  isLoading?: boolean;
}

const iconWrappers = {
  blue:   'text-white/40',
  green:  'text-[#4ADE80]/60',
  yellow: 'text-[#FBBF24]/60',
  red:    'text-[#F87171]/60',
  purple: 'text-[#A78BFA]/60',
};

export default function StatCard({ title, value, icon: Icon, trend, color = 'blue', isLoading = false }: StatCardProps) {
  if (isLoading) {
    return (
      <div className="bg-[#0A0A0A] border border-[#111111] rounded-lg p-6 animate-pulse">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="h-2.5 bg-[#1A1A1A] rounded w-20 mb-3" />
            <div className="h-7 bg-[#1A1A1A] rounded w-24" />
          </div>
          <div className="h-10 w-10 bg-[#1A1A1A] rounded-md" />
        </div>
      </div>
    );
  }

  return (
    <div className="group bg-[#0A0A0A] border border-[#111111] rounded-lg p-6 hover:border-white/10 hover:shadow-card-hover transition-all duration-300 cursor-default">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-bold text-[#333333] uppercase tracking-[0.18em] mb-3">{title}</p>
          <p className="text-3xl font-bold text-white tracking-tight leading-none">{value}</p>
          {trend && (
            <div className="flex items-center mt-3 gap-2">
              <span className={clsx(
                'text-[10px] font-bold px-1.5 py-0.5 rounded',
                trend.isPositive
                  ? 'text-[#4ADE80] bg-[#4ADE80]/10'
                  : 'text-[#F87171] bg-[#F87171]/10'
              )}>
                {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
              </span>
              <span className="text-[10px] text-[#2A2A2A] uppercase font-bold">vs last period</span>
            </div>
          )}
        </div>
        <div className={clsx('p-2.5 rounded-md bg-white/[0.03] transition-all duration-300 group-hover:bg-white/[0.06]', iconWrappers[color])}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}
