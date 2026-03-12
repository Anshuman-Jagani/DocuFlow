import React, { type ReactNode } from 'react';
import { cn } from '../../utils/helpers';

interface CardProps { children: ReactNode; className?: string; }
interface CardHeaderProps { children: ReactNode; className?: string; }
interface CardBodyProps { children: ReactNode; className?: string; }
interface CardFooterProps { children: ReactNode; className?: string; }

export const Card: React.FC<CardProps> = ({ children, className }) => (
  <div className={cn('bg-[#0A0A0A] rounded-lg border border-[#111111] hover:border-white/10 transition-all duration-300', className)}>
    {children}
  </div>
);

export const CardHeader: React.FC<CardHeaderProps> = ({ children, className }) => (
  <div className={cn('px-6 py-4 border-b border-[#111111]', className)}>
    {children}
  </div>
);

export const CardBody: React.FC<CardBodyProps> = ({ children, className }) => (
  <div className={cn('px-6 py-4', className)}>
    {children}
  </div>
);

export const CardFooter: React.FC<CardFooterProps> = ({ children, className }) => (
  <div className={cn('px-6 py-4 border-t border-[#111111] bg-black/40', className)}>
    {children}
  </div>
);
