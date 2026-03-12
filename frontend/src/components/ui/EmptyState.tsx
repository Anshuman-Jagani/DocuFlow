import { type ReactNode } from 'react';
import Button from './Button';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

const EmptyState = ({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  className = ''
}: EmptyStateProps) => {
  return (
    <div className={`flex flex-col items-center justify-center py-12 px-4 text-center ${className}`}>
      {icon && (
        <div className="mb-4 text-[#444444]">
          {icon}
        </div>
      )}
      <h3 className="text-lg font-semibold text-white mb-2">
        {title}
      </h3>
      {description && (
        <p className="text-[#444444] mb-6 max-w-md">
          {description}
        </p>
      )}
      {actionLabel && onAction && (
        <Button onClick={onAction} variant="gray">
          {actionLabel}
        </Button>
      )}
    </div>
  );
};

export default EmptyState;
