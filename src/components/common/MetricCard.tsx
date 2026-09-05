import React from 'react';
import { Card } from './Card';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface MetricCardProps {
  id?: string;
  title: string;
  value: string | number;
  subValue?: string;
  change?: {
    value: string;
    isPositive: boolean;
    neutral?: boolean;
    timeframe?: string;
  };
  icon?: React.ReactNode;
  variant?: 'default' | 'highlight' | 'danger' | 'warning' | 'success';
  trend?: 'up' | 'down' | 'flat';
}

export const MetricCard: React.FC<MetricCardProps> = ({
  id,
  title,
  value,
  subValue,
  change,
  icon,
  variant = 'default',
  trend,
}) => {
  return (
    <Card id={id} variant={variant} className="p-4 sm:p-5 flex flex-col justify-between shadow-xs">
      <div className="flex items-start justify-between gap-3">
        <div>
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            {title}
          </span>
          <div className="mt-1.5 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-mono">
              {value}
            </span>
            {subValue && (
              <span className="text-xs text-slate-500 font-medium">
                {subValue}
              </span>
            )}
          </div>
        </div>
        {icon && (
          <div className="p-2.5 rounded-lg bg-slate-100 border border-slate-200/80 text-blue-600 shrink-0">
            {icon}
          </div>
        )}
      </div>

      {change && (
        <div className="mt-3.5 pt-2.5 border-t border-slate-100 flex items-center gap-1.5 text-xs">
          {change.neutral ? (
            <Minus className="w-3.5 h-3.5 text-slate-400" />
          ) : change.isPositive ? (
            <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
          ) : (
            <TrendingDown className="w-3.5 h-3.5 text-rose-600" />
          )}
          <span
            className={`font-semibold ${
              change.neutral
                ? 'text-slate-500'
                : change.isPositive
                ? 'text-emerald-600'
                : 'text-rose-600'
            }`}
          >
            {change.value}
          </span>
          {change.timeframe && (
            <span className="text-slate-400 ml-1">{change.timeframe}</span>
          )}
        </div>
      )}
    </Card>
  );
};
