import React from 'react';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { Activity, ShieldCheck, AlertTriangle } from 'lucide-react';

interface PaymentHealthScoreGaugeProps {
  score: number; // 0-100
  successRate: number;
  severity?: 'low' | 'medium' | 'high' | 'critical' | 'nominal' | string;
  className?: string;
}

export const PaymentHealthScoreGauge: React.FC<PaymentHealthScoreGaugeProps> = ({
  score = 100,
  successRate = 98,
  severity = 'nominal',
  className = '',
}) => {
  const getStatusDetails = () => {
    if (score >= 90) {
      return {
        label: 'HEALTHY',
        color: 'text-emerald-400',
        strokeColor: '#10b981',
        bgColor: 'bg-emerald-500/10',
        badge: 'emerald' as const,
        description: 'Payment routes operating within normal latency and SLA parameters.',
      };
    }
    if (score >= 75) {
      return {
        label: 'MINOR DEGRADATION',
        color: 'text-yellow-400',
        strokeColor: '#eab308',
        bgColor: 'bg-yellow-500/10',
        badge: 'amber' as const,
        description: 'Minor latency clustering observed on specific bank routes.',
      };
    }
    if (score >= 60) {
      return {
        label: 'DEGRADED',
        color: 'text-amber-400',
        strokeColor: '#f59e0b',
        bgColor: 'bg-amber-500/10',
        badge: 'amber' as const,
        description: 'Multi-merchant route degradation detected. Active incident response in progress.',
      };
    }
    if (score >= 40) {
      return {
        label: 'SEVERE DEGRADATION',
        color: 'text-orange-400',
        strokeColor: '#f97316',
        bgColor: 'bg-orange-500/10',
        badge: 'amber' as const,
        description: 'Acute degradation on primary acquirer. Elevated revenue exposure.',
      };
    }
    return {
      label: 'CRITICAL',
      color: 'text-rose-400',
      strokeColor: '#f43f5e',
      bgColor: 'bg-rose-500/10',
      badge: 'red' as const,
      description: 'Severe gateway failure on primary acquirer. High revenue at risk.',
    };
  };

  const details = getStatusDetails();
  const radius = 46;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <Card className={`p-5 bg-white border-slate-200/80 shadow-xs flex flex-col justify-between ${className}`}>
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-blue-600" />
          <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Payment Health Index
          </h4>
        </div>
        <Badge variant={details.badge} size="sm" dot>
          {details.label}
        </Badge>
      </div>

      <div className="my-4 flex items-center justify-center gap-6">
        {/* Radial SVG Gauge */}
        <div className="relative w-32 h-32 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 110 110">
            {/* Background Track */}
            <circle
              cx="55"
              cy="55"
              r={radius}
              className="text-slate-100 stroke-current"
              strokeWidth="10"
              fill="transparent"
            />
            {/* Progress Arc */}
            <circle
              cx="55"
              cy="55"
              r={radius}
              stroke={details.strokeColor}
              strokeWidth="10"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
              className="transition-all duration-1000 ease-out"
            />
          </svg>
          <div className="absolute flex flex-col items-center justify-center">
            <span className={`text-3xl font-extrabold font-mono tracking-tighter ${details.color}`}>
              {score}
            </span>
            <span className="text-[10px] font-mono uppercase text-slate-400 font-medium">
              / 100 Score
            </span>
          </div>
        </div>

        <div className="space-y-2 text-xs">
          <div>
            <span className="text-[10px] font-mono uppercase text-slate-400 block">
              Success Rate
            </span>
            <span className="text-base font-bold font-mono text-slate-900">
              {successRate}%
            </span>
          </div>
          <div>
            <span className="text-[10px] font-mono uppercase text-slate-400 block">
              Anomaly Status
            </span>
            <span className="text-xs font-semibold text-slate-700">
              {(!severity || severity === 'nominal') ? 'No Active Outages' : `${String(severity).toUpperCase()} Anomaly Flagged`}
            </span>
          </div>
        </div>
      </div>

      <p className="text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded-lg border border-slate-200/80 leading-relaxed">
        {details.description}
      </p>
    </Card>
  );
};
