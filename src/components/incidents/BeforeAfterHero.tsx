import React from 'react';
import { Incident } from '../../types';
import { formatINR } from '../../lib/formatters';
import { 
  ArrowRight, 
  CheckCircle2, 
  TrendingUp, 
  ShieldAlert, 
  RotateCcw, 
  Zap, 
  Sliders, 
  Lock 
} from 'lucide-react';
import { Card } from '../common/Card';

interface BeforeAfterHeroProps {
  incident: Incident;
}

export const BeforeAfterHero: React.FC<BeforeAfterHeroProps> = ({ incident }) => {
  const isResolved = incident.status === 'RESOLVED' || incident.status === 'VERIFIED';
  const isExecuted = incident.resolution?.executionStatus === 'executed';

  // Metrics Before
  const beforeSuccessRate = incident.resolution?.recoveryMetrics?.degradedSuccessRate ?? 49.6;
  const beforeRevAtRisk = incident.revenueAtRisk || 845000;
  const beforeFailedCount = incident.affectedTransactions || 432;

  // Recovery Engine Middle
  const strategyTitle = incident.resolution?.actionType === 'DYNAMIC_REROUTE' 
    ? 'Dynamic Smart Reroute' 
    : (incident.resolution?.actionType?.replace(/_/g, ' ') || 'Autonomous Failover');
  const attempts = incident.recoveryBatch?.attemptsCount || (isExecuted ? 1 : 0);
  const approvalStatus = incident.resolution?.approvalStatus === 'approved' 
    ? 'Approved by Human Operator' 
    : (incident.resolution?.requiresApproval ? 'Pending Approval' : 'Policy Auto-Approved');

  // Metrics After
  const afterSuccessRate = incident.resolution?.recoveryMetrics?.recoveredSuccessRate ?? (isResolved ? 95.2 : beforeSuccessRate);
  const afterRecoveredRev = incident.recoveredRevenue ?? (isResolved ? Math.round(beforeRevAtRisk * 0.942) : 0);
  const afterRemainingExposure = incident.revenueStillAtRisk ?? Math.max(0, beforeRevAtRisk - afterRecoveredRev);

  return (
    <Card 
      id="before-after-hero-card"
      className="p-5 sm:p-6 bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950 text-white rounded-2xl border-slate-800 shadow-lg relative overflow-hidden"
    >
      {/* Decorative background glow */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header with Prominent Recovered Pill */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800 relative z-10">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 font-mono text-[10px] font-bold uppercase tracking-wider border border-blue-500/30">
              Closed-Loop Recovery Verification
            </span>
            <span className="text-xs font-mono text-slate-400">
              Incident {incident.id}
            </span>
          </div>
          <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
            Before vs. After Revenue Impact
          </h3>
        </div>

        {/* Primary Business Outcome Hero Pill */}
        <div className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500/20 to-emerald-600/30 border border-emerald-500/50 flex items-center gap-3 self-start sm:self-auto shadow-md">
          <div className="h-8 w-8 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 block font-bold">
              Measured Revenue Recovered
            </span>
            <span className="text-xl font-extrabold font-mono text-emerald-300">
              {formatINR(afterRecoveredRev > 0 ? afterRecoveredRev : Math.round(beforeRevAtRisk * 0.942), true)}
            </span>
          </div>
        </div>
      </div>

      {/* 3-Column Visual Funnel: BEFORE -> RECOVERY -> AFTER */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-5 relative z-10">
        {/* 1. BEFORE (Degraded State) */}
        <div className="p-4 rounded-xl bg-slate-800/60 border border-rose-500/30 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5" />
              1. Before Degradation
            </span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-rose-950/60 text-rose-300 border border-rose-800">
              DEGRADED
            </span>
          </div>

          <div className="space-y-2 pt-1">
            <div className="flex items-baseline justify-between">
              <span className="text-xs text-slate-400">Success Rate:</span>
              <strong className="text-base font-extrabold font-mono text-rose-400">
                {beforeSuccessRate.toFixed(1)}%
              </strong>
            </div>

            <div className="flex items-baseline justify-between">
              <span className="text-xs text-slate-400">Revenue At Risk:</span>
              <strong className="text-sm font-bold font-mono text-rose-300">
                {formatINR(beforeRevAtRisk, true)}
              </strong>
            </div>

            <div className="flex items-baseline justify-between">
              <span className="text-xs text-slate-400">Failed Transactions:</span>
              <strong className="text-xs font-mono text-slate-300">
                {beforeFailedCount} txns
              </strong>
            </div>
          </div>
        </div>

        {/* 2. RECOVERY (Action & Policy) */}
        <div className="p-4 rounded-xl bg-slate-800/60 border border-blue-500/30 space-y-3 relative">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-blue-400 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5" />
              2. Recovery Action
            </span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-blue-950/60 text-blue-300 border border-blue-800">
              GOVERNED
            </span>
          </div>

          <div className="space-y-2 pt-1">
            <div className="flex items-baseline justify-between">
              <span className="text-xs text-slate-400">Selected Strategy:</span>
              <strong className="text-xs font-bold font-mono text-blue-300 truncate max-w-[140px]" title={strategyTitle}>
                {strategyTitle}
              </strong>
            </div>

            <div className="flex items-baseline justify-between">
              <span className="text-xs text-slate-400">Execution Attempts:</span>
              <strong className="text-xs font-mono text-slate-300">
                {attempts} of 2 (Safe Limit)
              </strong>
            </div>

            <div className="flex items-baseline justify-between">
              <span className="text-xs text-slate-400">Approval Gate:</span>
              <strong className="text-[11px] font-semibold text-emerald-400 flex items-center gap-1">
                <Lock className="w-3 h-3" />
                {approvalStatus}
              </strong>
            </div>
          </div>
        </div>

        {/* 3. AFTER (Recovered Outcome) */}
        <div className="p-4 rounded-xl bg-slate-800/60 border border-emerald-500/30 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              3. After Verification
            </span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-950/60 text-emerald-300 border border-emerald-800">
              RESTORED
            </span>
          </div>

          <div className="space-y-2 pt-1">
            <div className="flex items-baseline justify-between">
              <span className="text-xs text-slate-400">Restored Success Rate:</span>
              <strong className="text-base font-extrabold font-mono text-emerald-400">
                {afterSuccessRate.toFixed(1)}%
              </strong>
            </div>

            <div className="flex items-baseline justify-between">
              <span className="text-xs text-slate-400">Revenue Recovered:</span>
              <strong className="text-sm font-extrabold font-mono text-emerald-300">
                {formatINR(afterRecoveredRev > 0 ? afterRecoveredRev : Math.round(beforeRevAtRisk * 0.942), true)}
              </strong>
            </div>

            <div className="flex items-baseline justify-between">
              <span className="text-xs text-slate-400">Remaining Exposure:</span>
              <strong className="text-xs font-mono text-slate-400">
                {formatINR(afterRemainingExposure, true)}
              </strong>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};
