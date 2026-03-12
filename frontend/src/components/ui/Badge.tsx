import React from 'react';
import { cn } from '../../utils/helpers';

interface BadgeProps { children: React.ReactNode; variant?: 'success' | 'warning' | 'danger' | 'info' | 'default'; className?: string; }

const variants = {
  success: 'bg-[#4ADE80]/10 text-[#4ADE80] border-[#4ADE80]/20',
  warning: 'bg-[#FBBF24]/10 text-[#FBBF24] border-[#FBBF24]/20',
  danger:  'bg-[#F87171]/10 text-[#F87171] border-[#F87171]/20',
  info:    'bg-white/5 text-white/60 border-white/10',
  default: 'bg-[#111111] text-[#555555] border-[#1A1A1A]',
};

const Badge: React.FC<BadgeProps> = ({ children, variant = 'default', className }) => (
  <span className={cn('inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide border', variants[variant], className)}>
    {children}
  </span>
);

export default Badge;
