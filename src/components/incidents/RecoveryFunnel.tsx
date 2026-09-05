import React from 'react';
import { RecoveryCohort, RecoveryScorecardData } from '../../types';
import { Card } from '../common/Card';
import { formatINR } from '../../lib/formatters';
import { 
  Filter, 
  ArrowRight, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldCheck, 
  UserCheck, 
  Ban 
} from 'lucide-react';

interface RecoveryFunnelProps {
  scorecard: RecoveryScorecardData;
  cohorts?: RecoveryCohort[];
  className?: string;
}

export const RecoveryFunnel: React.FC<RecoveryFunnelProps> = ({
  scorecard,
  cohorts = [],
  className = '',
}) => {
  const recoverableCount = cohorts
    .filter(c => c.recoverability === 'RECOVERABLE')
    .reduce((acc, c) => acc + c.transactionCount, 0);
  
  const possiblyRecoverableCount = cohorts
    .filter(c => c.recoverability === 'POSSIBLY_RECOVERABLE')
    .reduce((acc, c) => acc + c.transactionCount, 0);

  const nonRecoverableCount = cohorts
    .filter(c => c.recoverability === 'NOT_RECOVERABLE')
    .reduce((acc, c) => acc + c.transactionCount, 0);

  const humanReviewCount = cohorts
    .filter(c => c.recoverability === 'REQUIRES_HUMAN_REVIEW')
    .reduce((acc, c) => acc + c.transactionCount, 0);

  const totalAffected = scorecard.totalAffectedTxns;
  const eligibleTxns = scorecard.eligibleTxns;
  const attemptedTxns = scorecard.attemptedTxns;
  const recoveredTxns = scorecard.recoveredTxns;
  const recoveredRev = scorecard.recoveredRevenueINR;

  return (
    <Card className={`p-5 sm:p-6 bg-white border-slate-200/90 shadow-xs ${className}`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 mb-4 border-b border-slate-100">
        <div>
          <h3 className="text-base font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Filter className="w-4 h-4 text-blue-600" />
            Recovery Opportunity & Verification Funnel
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Tracks affected payment volume through eligibility, governed recovery execution, and verified outcomes.
          </p>
        </div>
        <span className="text-[11px] font-mono text-slate-500 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200">
          Policy POL-REROUTE-04 Active
        </span>
      </div>

      {/* 4-Stage Horizontal Funnel */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 relative">
        {/* Stage 1: Total Affected */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase text-slate-500 font-bold">
                Stage 1: Detected
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-200 text-slate-700 font-mono font-bold">
                100%
              </span>
            </div>
            <h4 className="text-xs font-bold text-slate-800 mt-1">
              Total Affected Volume
            </h4>
            <div className="text-xl font-extrabold font-mono text-slate-900 mt-2">
              {totalAffected} txns
            </div>
            <div className="text-xs font-mono text-rose-600 font-semibold mt-0.5">
              {formatINR(scorecard.revenueAtRiskINR, true)}
            </div>
          </div>
          <p className="text-[11px] text-slate-500 mt-3 pt-2 border-t border-slate-200">
            Raw failure signals captured during anomaly window.
          </p>
        </div>

        {/* Stage 2: Policy Triage */}
        <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-200 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase text-blue-700 font-bold">
                Stage 2: Triaged
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 font-mono font-bold">
                {totalAffected > 0 ? `${Math.round((eligibleTxns / Math.max(1, totalAffected)) * 100)}%` : '0%'}
              </span>
            </div>
            <h4 className="text-xs font-bold text-slate-800 mt-1">
              Eligible Cohorts
            </h4>
            <div className="text-xl font-extrabold font-mono text-blue-700 mt-2">
              {eligibleTxns} txns
            </div>
            <div className="text-xs font-mono text-blue-600 font-semibold mt-0.5">
              {formatINR(scorecard.estimatedRecoverableINR, true)}
            </div>
          </div>

          <div className="text-[10px] text-slate-600 space-y-1 mt-3 pt-2 border-t border-blue-100 font-mono">
            <div className="flex justify-between text-emerald-700 font-semibold">
              <span>Recoverable (A+B):</span>
              <span>{recoverableCount + possiblyRecoverableCount}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Excluded (C):</span>
              <span>{nonRecoverableCount}</span>
            </div>
            <div className="flex justify-between text-amber-700">
              <span>Human Review (D):</span>
              <span>{humanReviewCount}</span>
            </div>
          </div>
        </div>

        {/* Stage 3: Safe Attempt */}
        <div className="p-4 rounded-xl bg-indigo-50/50 border border-indigo-200 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase text-indigo-700 font-bold">
                Stage 3: Dispatched
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-800 font-mono font-bold">
                {attemptedTxns > 0 ? `${Math.round((attemptedTxns / Math.max(1, eligibleTxns)) * 100)}%` : 'Pending'}
              </span>
            </div>
            <h4 className="text-xs font-bold text-slate-800 mt-1">
              Attempted Under Budget
            </h4>
            <div className="text-xl font-extrabold font-mono text-indigo-700 mt-2">
              {attemptedTxns} txns
            </div>
            <div className="text-xs font-mono text-indigo-600 font-semibold mt-0.5">
              {attemptedTxns > 0 ? '2 retries max (0 dups)' : 'Awaiting Authorization'}
            </div>
          </div>
          <p className="text-[11px] text-slate-500 mt-3 pt-2 border-t border-indigo-100">
            Smart Router failover bounded by idempotency keys and retry rate limiters.
          </p>
        </div>

        {/* Stage 4: Recovered */}
        <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-200 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase text-emerald-700 font-bold">
                Stage 4: Verified
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-mono font-bold">
                {recoveredTxns > 0 ? `${scorecard.recoveryRatePercent}% Rate` : 'Pending'}
              </span>
            </div>
            <h4 className="text-xs font-bold text-slate-800 mt-1">
              Successfully Recovered
            </h4>
            <div className="text-xl font-extrabold font-mono text-emerald-700 mt-2">
              {recoveredTxns} txns
            </div>
            <div className="text-xs font-mono text-emerald-600 font-semibold mt-0.5">
              {recoveredTxns > 0 ? formatINR(recoveredRev, true) : '₹0 (Pending Execution)'}
            </div>
          </div>
          <div className="text-[11px] text-emerald-700 mt-3 pt-2 border-t border-emerald-100 flex items-center gap-1 font-semibold">
            <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
            <span>{recoveredTxns > 0 ? 'Telemetry stabilized at nominal SLA' : 'Standing by for execution signoff'}</span>
          </div>
        </div>
      </div>
    </Card>
  );
};
