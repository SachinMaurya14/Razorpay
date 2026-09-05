import React from 'react';
import { IncidentStatus } from '../../types';
import { Eye, Search, ShieldCheck, CheckCircle2, ChevronRight } from 'lucide-react';

interface IncidentStepperProps {
  currentStatus: IncidentStatus;
  className?: string;
}

export const IncidentStepper: React.FC<IncidentStepperProps> = ({
  currentStatus,
  className = '',
}) => {
  const steps = [
    {
      id: 'DETECTED',
      label: 'DETECTED',
      sub: 'Anomaly Flagged',
      icon: <Eye className="w-4 h-4" />,
    },
    {
      id: 'INVESTIGATING',
      label: 'INVESTIGATING',
      sub: 'Root Cause & Evidence',
      icon: <Search className="w-4 h-4" />,
    },
    {
      id: 'RESOLUTION',
      label: 'RESOLUTION',
      sub: 'Policy & Human Signoff',
      icon: <ShieldCheck className="w-4 h-4" />,
    },
    {
      id: 'VERIFIED',
      label: 'VERIFIED',
      sub: 'Recovery Confirmed',
      icon: <CheckCircle2 className="w-4 h-4" />,
    },
  ];

  const getStepIndex = (status: IncidentStatus) => {
    switch (status) {
      case 'DETECTED': return 0;
      case 'INVESTIGATING': return 1;
      case 'RESOLUTION': return 2;
      case 'VERIFIED':
      case 'RESOLVED': return 3;
      default: return 0;
    }
  };

  const currentIndex = getStepIndex(currentStatus);

  return (
    <div className={`p-4 rounded-xl bg-white border border-slate-200/80 shadow-xs ${className}`}>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 relative">
        {steps.map((step, idx) => {
          const isCompleted = idx < currentIndex || currentStatus === 'VERIFIED' || currentStatus === 'RESOLVED';
          const isCurrent = idx === currentIndex && currentStatus !== 'VERIFIED' && currentStatus !== 'RESOLVED';
          const isPending = idx > currentIndex;

          return (
            <div
              key={step.id}
              className={`p-3 rounded-lg border transition-all flex items-center gap-3 relative ${
                isCurrent
                  ? 'bg-blue-50/60 border-blue-300 ring-1 ring-blue-500/20 text-blue-900'
                  : isCompleted
                  ? 'bg-emerald-50/60 border-emerald-300 text-emerald-900'
                  : 'bg-slate-50/60 border-slate-200/80 text-slate-500'
              }`}
            >
              <div
                className={`p-2 rounded-lg shrink-0 ${
                  isCurrent
                    ? 'bg-blue-600 text-white shadow-xs'
                    : isCompleted
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-slate-200 text-slate-500'
                }`}
              >
                {step.icon}
              </div>
              <div className="min-w-0">
                <span className="text-[10px] font-mono uppercase tracking-wider block opacity-75">
                  Step 0{idx + 1}
                </span>
                <h5 className="text-xs font-bold tracking-tight truncate text-slate-900">
                  {step.label}
                </h5>
                <p className="text-[11px] text-slate-500 truncate">
                  {step.sub}
                </p>
              </div>

              {idx < steps.length - 1 && (
                <ChevronRight className="hidden lg:block absolute -right-2 top-1/2 -translate-y-1/2 z-10 w-4 h-4 text-slate-400" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
