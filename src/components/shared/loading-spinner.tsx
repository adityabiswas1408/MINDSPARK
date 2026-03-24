'use client';

interface LoadingSpinnerProps {
  text?: string;
  className?: string;
}

export function LoadingSpinner({ text = 'Loading...', className = '' }: LoadingSpinnerProps) {
  return (
    <div 
      role="status" 
      aria-busy="true" 
      className={`flex flex-col items-center justify-center p-8 space-y-4 ${className}`}
    >
      <div 
        className="w-10 h-10 rounded-full bg-[#1A3829]/10 border-2 border-[#1A3829] breathing-circle" 
        aria-hidden="true" 
      />
      {text && (
        <span className="font-sans text-[15px] font-medium text-secondary">
          {text}
        </span>
      )}
      <span className="sr-only">{text}</span>
    </div>
  );
}
