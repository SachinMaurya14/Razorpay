import React from 'react';
import { StrategyComparisonOption } from '../../types';
import { Card } from '../common/Card';
import { formatINR } from '../../lib/formatters';
import { 
  GitPullRequest, 
  CheckCircle2, 
  AlertTriangle, 
  Sparkles, 
  ShieldAlert, 
  Clock, 
  ArrowRight,
  TrendingUp
} from 'lucide-react';

interface StrategyComparisonCardProps {
  strategies: StrategyComparisonOption[];
  className?: string;
}

export const StrategyComparisonCard: React.FC<StrategyComparisonCardProps> = ({
  strategies = [],
  className = '',
}) => {
  return (
    <Card className={`p-5 sm:p-6 bg-white border-slate-200/90 shadow-xs ${className}`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 mb-4 border-b border-slate-100">
        <div>
          <h3 className="text-base font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <GitPullRequest className="w-4 h-4 text-blue-600" />
            Strategy Comparison & Counterfactual Tradeoff Analysis
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Ranked mitigation candidate options evaluated by the Resolution Agent before policy dispatch
          </p>
        </div>
        <span className="text-[11px] font-mono text-slate-600 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200">
          Ranked by Expected Revenue Recovery (Risk-Adjusted)
        </span>
      </div>

      {/* Strategies Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {strategies.map((option) => {
          const isRec = option.isRecommended;

          return (
            <div
              key={option.strategyId}
              className={`p-4 rounded-xl border flex flex-col justify-between transition-all ${
                isRec
                  ? 'bg-blue-50/40 border-blue-300 ring-1 ring-blue-500/20 shadow-xs'
                  : 'bg-slate-50/60 border-slate-200/80 hover:bg-slate-50'
              }`}
            >
              <div>
                {/* Header Badge */}
                <div className="flex items-center justify-between gap-2">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono uppercase ${
                    isRec ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-700'
                  }`}>
                    Rank #{option.rank}
                  </span>

                  {isRec && (
                    <span className="text-[11px] font-bold text-blue-700 flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5" />
                      Primary Recommendation
                    </span>
                  )}
                </div>

                <h4 className="text-sm font-bold text-slate-900 mt-2">
                  {option.strategyName}
                </h4>

                <div className="text-[11px] font-mono text-slate-500 mt-0.5">
                  Action: <strong className="text-slate-700">{option.actionType}</strong>
                </div>

                {/* Quantitative Projections */}
                <div className="mt-3.5 pt-3 border-t border-slate-200/60 grid grid-cols-2 gap-2 font-mono text-xs">
                  <div className="p-2 rounded-lg bg-white border border-slate-200">
                    <span className="text-[9px] uppercase tracking-wider text-slate-400 block font-semibold" title="Simulated success proportion of eligible transactions">
                      Expected Recovery
                    </span>
                    <span className="text-base font-extrabold text-emerald-600">
                      {option.expectedRecoveryRatePercent}%
                    </span>
                    <span className="block text-[8px] text-slate-400 font-sans mt-0.5">Success proportion</span>
                  </div>

                  <div className="p-2 rounded-lg bg-white border border-slate-200">
                    <span className="text-[9px] uppercase tracking-wider text-slate-400 block font-semibold" title="Simulated transaction value projected to remain protected">
                      Projected GMV
                    </span>
                    <span className="text-sm font-extrabold text-slate-900">
                      {formatINR(option.expectedRevenueRecoveredINR, true)}
                    </span>
                    <span className="block text-[8px] text-slate-400 font-sans mt-0.5">Protected volume</span>
                  </div>
                </div>

                {/* Latency & Risk Metrics */}
                <div className="mt-3 space-y-1.5 text-xs text-slate-600 font-sans">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-500">Latency Penalty:</span>
                    <span className="font-mono font-semibold text-slate-800">
                      +{option.additionalHopLatencyMs}ms
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-500">Execution Risk:</span>
                    <span className={`font-bold uppercase text-[10px] px-1.5 py-0.2 rounded font-mono ${
                      option.risk === 'low' ? 'bg-emerald-100 text-emerald-800' :
                      option.risk === 'medium' ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
                    }`}>
                      {option.risk}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-500">Resolution Confidence:</span>
                    <span className="font-mono font-bold text-blue-700">
                      {Math.round(option.confidence * 100)}%
                    </span>
                  </div>
                </div>

                {/* Tradeoffs Description */}
                <div className="mt-3 p-2.5 rounded-lg bg-white border border-slate-200/80 text-[11px] text-slate-600 leading-relaxed">
                  <strong className="text-slate-800">Tradeoffs:</strong> {option.tradeoffs}
                </div>
              </div>

              {/* Status Footer */}
              <div className="mt-4 pt-2.5 border-t border-slate-200 flex items-center justify-between text-[11px]">
                <span className="text-slate-500 font-mono">
                  {option.requiresApproval ? 'Signoff Required' : 'Pre-approved'}
                </span>
                {isRec ? (
                  <span className="text-blue-700 font-bold flex items-center gap-1">
                    Selected for Execution <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                ) : (
                  <span className="text-slate-400 font-medium">
                    Standby Candidate
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="pt-2 text-right">
        <span className="text-[10px] text-slate-400 font-sans">
          Note: Protected GMV = transaction value protected by the simulated mitigation.
        </span>
      </div>
    </Card>
  );
};
