import React from 'react';
import { RecoveryScorecardData } from '../../types';
import { Card } from '../common/Card';
import { formatINR } from '../../lib/formatters';
import { 
  ShieldCheck, 
  TrendingUp, 
  AlertCircle, 
  Sparkles, 
  DollarSign, 
  Percent, 
  Activity, 
  CheckCircle2 
} from 'lucide-react';

interface RecoveryScorecardProps {
  scorecard: RecoveryScorecardData;
  className?: string;
  isCompact?: boolean;
}

export const RecoveryScorecard: React.FC<RecoveryScorecardProps> = ({
  scorecard,
  className = '',
  isCompact = false,
}) => {
  const getTierColor = (tier: RecoveryScorecardData['recoveryQualityTier']) => {
    switch (tier) {
      case 'OPTIMAL':
        return 'bg-emerald-50 text-emerald-700 border-emerald-300';
      case 'ACCEPTABLE':
        return 'bg-blue-50 text-blue-700 border-blue-300';
      case 'DEGRADED':
        return 'bg-amber-50 text-amber-700 border-amber-300';
      case 'FAILED':
        return 'bg-rose-50 text-rose-700 border-rose-300';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-300';
    }
  };

  return (
    <Card className={`p-5 sm:p-6 bg-white border-slate-200/90 shadow-xs ${className}`}>
      {/* Header bar with Score and Tier */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-5 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600 border border-blue-200 shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-extrabold text-slate-900 tracking-tight">
                Deterministic Recovery Scorecard
              </h3>
              <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border uppercase tracking-wider ${getTierColor(scorecard.recoveryQualityTier)}`}>
                {scorecard.recoveryQualityTier}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Automated financial exposure mitigation & net GMV salvage verification
            </p>
          </div>
        </div>

        {/* Quality Score Badge */}
        <div className="flex items-center gap-3 self-start sm:self-auto bg-slate-50 px-3.5 py-1.5 rounded-xl border border-slate-200 font-mono">
          <div className="text-right">
            <span className="text-[10px] uppercase tracking-wider text-slate-400 block font-semibold">
              Quality Index
            </span>
            <span className="text-sm font-extrabold text-slate-900">
              {scorecard.recoveryQualityScore}/100
            </span>
          </div>
          <div className="w-8 h-8 rounded-full border-2 border-emerald-500 flex items-center justify-center text-xs font-bold text-emerald-700 bg-emerald-50">
            {scorecard.recoveryQualityScore}%
          </div>
        </div>
      </div>

      {/* Main Financial Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 mb-4 font-mono">
        {/* Metric 1: Revenue at Risk */}
        <div className="p-3.5 rounded-xl bg-slate-50/90 border border-slate-200/80">
          <span className="text-[10px] uppercase tracking-wider text-slate-500 block font-semibold mb-1">
            Total Revenue at Risk
          </span>
          <div className="text-lg sm:text-xl font-extrabold text-slate-900">
            {formatINR(scorecard.revenueAtRiskINR, true)}
          </div>
          <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1 font-sans">
            <span>{scorecard.totalAffectedTxns} failed transactions</span>
          </div>
        </div>

        {/* Metric 2: Estimated Recoverable */}
        <div className="p-3.5 rounded-xl bg-blue-50/50 border border-blue-200/80">
          <span className="text-[10px] uppercase tracking-wider text-blue-700 block font-semibold mb-1" title="Portion of exposed value classified as recoverable under policy rules">
            Recoverable Revenue
          </span>
          <div className="text-lg sm:text-xl font-extrabold text-blue-700">
            {formatINR(scorecard.estimatedRecoverableINR, true)}
          </div>
          <div className="text-[11px] text-blue-600 mt-1 flex items-center gap-1 font-sans">
            <span>{scorecard.eligibleTxns} eligible under policy</span>
          </div>
        </div>

        {/* Metric 3: Recovered Revenue */}
        <div className="p-3.5 rounded-xl bg-emerald-50/60 border border-emerald-200/80">
          <span className="text-[10px] uppercase tracking-wider text-emerald-700 block font-semibold mb-1" title="Value actually recovered based on observed simulated outcomes">
            {scorecard.revenueAtRiskINR > 0 && scorecard.recoveredRevenueINR === 0 ? 'Actual Recovery' : 'Revenue Recovered'}
          </span>
          <div className="text-lg sm:text-xl font-extrabold text-emerald-700">
            {scorecard.revenueAtRiskINR > 0 && scorecard.recoveredRevenueINR === 0 ? (
              <span className="text-sm sm:text-base font-bold text-amber-700">Pending Execution</span>
            ) : (
              formatINR(scorecard.recoveredRevenueINR, true)
            )}
          </div>
          <div className="text-[11px] text-emerald-700 mt-1 flex items-center gap-1 font-sans font-semibold">
            {scorecard.revenueAtRiskINR > 0 && scorecard.recoveredRevenueINR === 0 ? (
              <span className="text-slate-500 font-normal">Awaiting mitigation authorization</span>
            ) : (
              <>
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{scorecard.recoveryRatePercent}% recovery rate</span>
              </>
            )}
          </div>
        </div>

        {/* Metric 4: Net Value */}
        <div className="p-3.5 rounded-xl bg-slate-50/90 border border-slate-200/80">
          <span className="text-[10px] uppercase tracking-wider text-slate-500 block font-semibold mb-1">
            Net Value (After Ops Cost)
          </span>
          <div className="text-lg sm:text-xl font-extrabold text-slate-900">
            {formatINR(scorecard.netRecoveredValueINR, true)}
          </div>
          <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1 font-sans">
            <span>Routing cost: {formatINR(scorecard.operationalCostINR, true)}</span>
          </div>
        </div>
      </div>

      {/* Progress & Secondary Stats Bar */}
      <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-slate-700">
            Salvage Progress & Recovery Ratio
          </span>
          <span className="font-mono text-slate-600 font-bold">
            {scorecard.recoveredTxns} / {scorecard.eligibleTxns} txns recovered ({scorecard.transactionRecoveryRatePercent}%)
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden flex">
          <div 
            className="bg-emerald-500 h-full transition-all duration-500" 
            style={{ width: `${Math.min(100, scorecard.recoveryRatePercent)}%` }}
            title={`Recovered: ${scorecard.recoveryRatePercent}%`}
          />
          <div 
            className="bg-amber-400 h-full transition-all duration-500" 
            style={{ width: `${Math.max(0, 100 - scorecard.recoveryRatePercent)}%` }}
            title={`At Risk: ${100 - scorecard.recoveryRatePercent}%`}
          />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-[11px] text-slate-500">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Recovered ({scorecard.recoveryRatePercent}%)</span>
            <span className="text-slate-300">|</span>
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            <span>Still at Risk: {formatINR(scorecard.revenueStillAtRiskINR, true)}</span>
          </div>
          <span className="text-slate-600 font-medium">
            {scorecard.qualityExplanation}
          </span>
        </div>
      </div>
    </Card>
  );
};
