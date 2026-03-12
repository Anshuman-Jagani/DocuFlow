import { cn } from '../../utils/helpers';

interface SkeletonProps { className?: string; variant?: 'text' | 'circular' | 'rectangular'; width?: string | number; height?: string | number; }

const Skeleton = ({ className, variant = 'rectangular', width, height }: SkeletonProps) => {
  const style = {
    width: width ? (typeof width === 'number' ? `${width}px` : width) : undefined,
    height: height ? (typeof height === 'number' ? `${height}px` : height) : undefined,
  };
  const variantClasses = { text: 'h-4 rounded', circular: 'rounded-full', rectangular: 'rounded-md' };
  return <div className={cn('animate-pulse bg-[#111111]', variantClasses[variant], className)} style={style} />;
};

export const SkeletonCard = () => (
  <div className="bg-[#0A0A0A] border border-[#111111] rounded-lg p-6 space-y-4">
    <Skeleton className="h-5 w-1/3" />
    <Skeleton className="h-3.5 w-full" />
    <Skeleton className="h-3.5 w-2/3" />
  </div>
);

export const SkeletonTable = ({ rows = 5 }: { rows?: number }) => (
  <div className="bg-[#0A0A0A] border border-[#111111] rounded-lg overflow-hidden">
    <div className="p-4 border-b border-[#111111]"><Skeleton className="h-5 w-1/4" /></div>
    <div className="divide-y divide-[#0F0F0F]">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="p-4 flex gap-4">
          <Skeleton className="h-3.5 w-1/4" /><Skeleton className="h-3.5 w-1/3" />
          <Skeleton className="h-3.5 w-1/6" /><Skeleton className="h-3.5 w-1/5" />
        </div>
      ))}
    </div>
  </div>
);

export const SkeletonText = ({ lines = 3 }: { lines?: number }) => (
  <div className="space-y-2">
    {Array.from({ length: lines }).map((_, i) => (
      <Skeleton key={i} className="h-4" width={i === lines - 1 ? '60%' : '100%'} />
    ))}
  </div>
);

export default Skeleton;
