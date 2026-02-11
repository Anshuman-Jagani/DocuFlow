import { cn } from '../../utils/helpers';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
}

const Skeleton = ({ 
  className, 
  variant = 'rectangular',
  width,
  height 
}: SkeletonProps) => {
  const baseClasses = 'animate-pulse bg-gray-200';
  
  const variantClasses = {
    text: 'h-4 rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-lg'
  };

  const style = {
    width: width ? (typeof width === 'number' ? `${width}px` : width) : undefined,
    height: height ? (typeof height === 'number' ? `${height}px` : height) : undefined,
  };

  return (
    <div 
      className={cn(baseClasses, variantClasses[variant], className)}
      style={style}
    />
  );
};

// Preset skeleton components
export const SkeletonCard = () => (
  <div className="bg-white rounded-lg shadow p-6 space-y-4">
    <Skeleton className="h-6 w-1/3" />
    <Skeleton className="h-4 w-full" />
    <Skeleton className="h-4 w-2/3" />
  </div>
);

export const SkeletonTable = ({ rows = 5 }: { rows?: number }) => (
  <div className="bg-white rounded-lg shadow overflow-hidden">
    <div className="p-4 border-b">
      <Skeleton className="h-6 w-1/4" />
    </div>
    <div className="divide-y">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="p-4 flex gap-4">
          <Skeleton className="h-4 w-1/4" />
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-4 w-1/6" />
          <Skeleton className="h-4 w-1/5" />
        </div>
      ))}
    </div>
  </div>
);

export const SkeletonText = ({ lines = 3 }: { lines?: number }) => (
  <div className="space-y-2">
    {Array.from({ length: lines }).map((_, i) => (
      <Skeleton 
        key={i} 
        className="h-4" 
        width={i === lines - 1 ? '60%' : '100%'} 
      />
    ))}
  </div>
);

export default Skeleton;
