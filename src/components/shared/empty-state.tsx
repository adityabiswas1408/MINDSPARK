import { ReactNode } from 'react';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({ icon, title, description, action, className = '' }: EmptyStateProps) {
  return (
    <div 
      className={`flex flex-col items-center justify-center text-center p-8 rounded-[14px] bg-card border border-slate-200 ${className}`}
    >
      {icon && (
        <div className="mb-4 text-slate-300 w-16 h-16 flex items-center justify-center">
          {icon}
        </div>
      )}
      <h3 className="font-sans text-[20px] font-bold text-primary mb-2">
        {title}
      </h3>
      <p className="font-sans text-[15px] font-normal text-secondary mb-6 max-w-sm">
        {description}
      </p>
      {action && <div>{action}</div>}
    </div>
  );
}
