import React from 'react';
import { Hypothesis } from '../../types';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { GitBranch, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

interface HypothesisCardProps {
  hypotheses: Hypothesis[];
  className?: string;
}

export const HypothesisCard: React.FC<HypothesisCardProps> = ({
  hypotheses,
  className = '',
}) => {
  return (
    <Card className={`p-5 bg-white border-slate-200/80 shadow-xs ${className}`}>
      <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <GitBranch className="w-4 h-4 text-cyan-600" />
          <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            Hypothesis Ranking & Attribution Engine
          </h4>
        </div>
        <span className="text-xs text-slate-500 font-mono">
          Investigation Agent Evaluated
        </span>
      </div>

      <div className="space-y-3">
        {(hypotheses || []).map((hyp, index) => {
          const isConfirmed = hyp.status === 'Confirmed Root Cause';
          const isRuledOut = hyp.status === 'Ruled Out';
          const pct = Math.round(hyp.probability * 100);

          return (
            <div
              key={index}
              className={`p-3.5 rounded-lg border transition-all ${
                isConfirmed
                  ? 'bg-blue-50/50 border-blue-300 shadow-xs ring-1 ring-blue-500/20'
                  : isRuledOut
                  ? 'bg-slate-50/40 border-slate-200 opacity-75'
                  : 'bg-slate-50/70 border-slate-200'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-2.5">
                  <div className="mt-0.5">
                    {isConfirmed ? (
                      <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                    ) : isRuledOut ? (
                      <XCircle className="w-4 h-4 text-slate-400 shrink-0" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                    )}
                  </div>
                  <div>
                    <h5 className={`text-xs sm:text-sm font-bold leading-snug ${
                      isConfirmed ? 'text-blue-900' : 'text-slate-900'
                    }`}>
                      {hyp.hypothesis}
                    </h5>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                      {hyp.rationale}
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className={`text-sm font-extrabold font-mono ${
                    isConfirmed ? 'text-emerald-600' : isRuledOut ? 'text-slate-400' : 'text-amber-600'
                  }`}>
                    {pct}%
                  </span>
                  <Badge
                    variant="neutral"
                    size="sm"
                    className={`block mt-1 ${
                      isConfirmed
                        ? 'border-emerald-200 bg-emerald-50 text-emerald-700 font-bold'
                        : isRuledOut
                        ? 'border-slate-200 bg-slate-100 text-slate-500'
                        : 'border-amber-200 bg-amber-50 text-amber-700'
                    }`}
                  >
                    {hyp.status}
                  </Badge>
                </div>
              </div>

              {/* Probability bar */}
              <div className="mt-3 w-full bg-slate-200/80 rounded-full h-1.5 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    isConfirmed ? 'bg-emerald-500' : isRuledOut ? 'bg-slate-400' : 'bg-amber-500'
                  }`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};
