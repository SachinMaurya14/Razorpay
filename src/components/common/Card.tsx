import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  id?: string;
  variant?: 'default' | 'subtle' | 'highlight' | 'danger' | 'warning' | 'success';
}

export const Card: React.FC<CardProps> = ({ 
  children, 
  className = '', 
  id,
  variant = 'default',
  ...props 
}) => {
  const variantStyles = {
    default: 'bg-white border-slate-200/80 shadow-xs text-slate-900',
    subtle: 'bg-slate-50/80 border-slate-200 text-slate-800',
    highlight: 'bg-white border-blue-300 ring-1 ring-blue-500/15 shadow-sm text-slate-900',
    danger: 'bg-rose-50/40 border-rose-200 text-rose-950',
    warning: 'bg-amber-50/40 border-amber-200 text-amber-950',
    success: 'bg-emerald-50/40 border-emerald-200 text-emerald-950',
  };

  return (
    <div 
      id={id}
      className={`rounded-xl border transition-all duration-200 ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
