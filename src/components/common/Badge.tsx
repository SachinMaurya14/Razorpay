import React from 'react';
import { IncidentSeverity, IncidentStatus, RiskLevel, ApprovalStatus } from '../../types';

interface BadgeProps {
  children?: React.ReactNode;
  variant?: 
    | 'neutral' 
    | 'blue' 
    | 'amber' 
    | 'red' 
    | 'emerald' 
    | 'purple'
    | 'severity'
    | 'status'
    | 'risk'
    | 'approval';
  severity?: IncidentSeverity;
  status?: IncidentStatus;
  risk?: RiskLevel;
  approval?: ApprovalStatus;
  size?: 'sm' | 'md';
  className?: string;
  id?: string;
  dot?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  severity,
  status,
  risk,
  approval,
  size = 'md',
  className = '',
  id,
  dot = false,
}) => {
  let style = 'bg-slate-100 text-slate-700 border-slate-200';
  let label = children;
  let dotColor = 'bg-slate-400';

  if (severity) {
    switch (severity) {
      case 'critical':
        style = 'bg-rose-50 text-rose-700 border-rose-200 font-semibold';
        dotColor = 'bg-rose-500 animate-pulse';
        label = label || 'CRITICAL';
        break;
      case 'high':
        style = 'bg-amber-50 text-amber-700 border-amber-200 font-semibold';
        dotColor = 'bg-amber-500';
        label = label || 'HIGH';
        break;
      case 'medium':
        style = 'bg-yellow-50 text-yellow-800 border-yellow-200';
        dotColor = 'bg-yellow-500';
        label = label || 'MEDIUM';
        break;
      case 'low':
        style = 'bg-slate-100 text-slate-700 border-slate-200';
        dotColor = 'bg-slate-500';
        label = label || 'LOW';
        break;
    }
  } else if (status) {
    switch (status) {
      case 'DETECTED':
        style = 'bg-rose-50 text-rose-700 border-rose-200 font-semibold';
        dotColor = 'bg-rose-500 animate-pulse';
        label = label || 'DETECTED';
        break;
      case 'INVESTIGATING':
        style = 'bg-indigo-50 text-indigo-700 border-indigo-200 font-semibold';
        dotColor = 'bg-indigo-500 animate-pulse';
        label = label || 'INVESTIGATING';
        break;
      case 'RESOLUTION':
        style = 'bg-amber-50 text-amber-700 border-amber-200 font-semibold';
        dotColor = 'bg-amber-500';
        label = label || 'RESOLUTION PENDING';
        break;
      case 'VERIFIED':
      case 'RESOLVED':
        style = 'bg-emerald-50 text-emerald-700 border-emerald-200 font-semibold';
        dotColor = 'bg-emerald-500';
        label = label || (status === 'VERIFIED' ? 'VERIFIED' : 'RESOLVED');
        break;
      case 'DISMISSED':
        style = 'bg-slate-100 text-slate-500 border-slate-200';
        dotColor = 'bg-slate-400';
        label = label || 'DISMISSED';
        break;
    }
  } else if (risk) {
    switch (risk) {
      case 'high':
        style = 'bg-rose-50 text-rose-700 border-rose-200 font-semibold';
        dotColor = 'bg-rose-500';
        label = label || 'HIGH RISK';
        break;
      case 'medium':
        style = 'bg-amber-50 text-amber-700 border-amber-200 font-semibold';
        dotColor = 'bg-amber-500';
        label = label || 'MEDIUM RISK';
        break;
      case 'low':
        style = 'bg-emerald-50 text-emerald-700 border-emerald-200 font-semibold';
        dotColor = 'bg-emerald-500';
        label = label || 'LOW RISK';
        break;
    }
  } else if (approval) {
    switch (approval) {
      case 'approved':
        style = 'bg-emerald-50 text-emerald-700 border-emerald-200 font-semibold';
        dotColor = 'bg-emerald-500';
        label = label || 'APPROVED';
        break;
      case 'rejected':
        style = 'bg-rose-50 text-rose-700 border-rose-200 font-semibold';
        dotColor = 'bg-rose-500';
        label = label || 'REJECTED';
        break;
      case 'pending':
        style = 'bg-amber-50 text-amber-700 border-amber-200 font-semibold';
        dotColor = 'bg-amber-500 animate-pulse';
        label = label || 'APPROVAL REQUIRED';
        break;
      case 'not_required':
        style = 'bg-slate-100 text-slate-700 border-slate-200';
        dotColor = 'bg-slate-500';
        label = label || 'AUTO-EXECUTED';
        break;
    }
  } else {
    switch (variant) {
      case 'blue':
        style = 'bg-blue-50 text-blue-700 border-blue-200 font-semibold';
        dotColor = 'bg-blue-500';
        break;
      case 'amber':
        style = 'bg-amber-50 text-amber-700 border-amber-200 font-semibold';
        dotColor = 'bg-amber-500';
        break;
      case 'red':
        style = 'bg-rose-50 text-rose-700 border-rose-200 font-semibold';
        dotColor = 'bg-rose-500';
        break;
      case 'emerald':
        style = 'bg-emerald-50 text-emerald-700 border-emerald-200 font-semibold';
        dotColor = 'bg-emerald-500';
        break;
      case 'purple':
        style = 'bg-purple-50 text-purple-700 border-purple-200 font-semibold';
        dotColor = 'bg-purple-500';
        break;
      default:
        style = 'bg-slate-100 text-slate-700 border-slate-200';
        dotColor = 'bg-slate-500';
    }
  }

  const sizeStyles = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs';

  return (
    <span 
      id={id}
      className={`inline-flex items-center gap-1.5 rounded-md border font-medium uppercase tracking-wider whitespace-nowrap ${sizeStyles} ${style} ${className}`}
    >
      {dot && <span className={`h-1.5 w-1.5 rounded-full ${dotColor}`} />}
      {label}
    </span>
  );
};
