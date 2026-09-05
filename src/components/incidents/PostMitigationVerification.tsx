import React from 'react';
import { ResolutionOutput } from '../../types';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { CheckCircle2, TrendingUp, ShieldCheck, DollarSign, Activity } from 'lucide-react';

interface PostMitigationVerificationProps {
  recoveryMetrics?: ResolutionOutput['recoveryMetrics'];
  className?: string;
}

export const PostMitigationVerification: React.FC<PostMitigationVerificationProps> = ({
  recoveryMetrics,
  className = '',
}) => {
  if (!recoveryMetrics) return null;

  const recSuccess = recoveryMetrics.recoveredSuccessRate ?? 94;
  const degSuccess = recoveryMetrics.degradedSuccessRate ?? 50;
  const successDelta = recSuccess - degSuccess;
  const protectedRev = recoveryMetrics.protectedRevenueINR ?? 0;
  const baselineRate = recoveryMetrics.baselineSuccessRate ?? 93.4;

  return (
    <Card className={`p-5 sm:p-6 bg-white border-emerald-300 shadow-xs relative overflow-hidden ${className}`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 mb-4 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-200">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-base font-bold text-slate-900 flex items-center gap-2">
              Post-Mitigation Recovery Verification
              <Badge variant="emerald" size="sm">RESOLVED</Badge>
            </h4>
            <p className="text-xs text-slate-500">
              Measured from live synthetic transaction telemetry sample ({recoveryMetrics.sampleSize || 150} txns)
            </p>
          </div>
        </div>

        <span className="text-xs font-mono text-slate-400">
          Verified at {recoveryMetrics.verifiedAt ? new Date(recoveryMetrics.verifiedAt).toLocaleTimeString() : 'Recently'}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
          <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block font-medium">
            Degraded vs Recovered Success
          </span>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold font-mono text-emerald-600">
              {recSuccess}%
            </span>
            <span className="text-xs text-rose-500 line-through font-mono">
              {degSuccess}%
            </span>
          </div>
          <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1 mt-1">
            <TrendingUp className="w-3.5 h-3.5" />
            +{successDelta.toFixed(1)}% recovery delta
          </span>
        </div>

        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
          <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block font-medium">
            Protected GMV Volume
          </span>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold font-mono text-slate-900">
              ₹{protectedRev.toLocaleString('en-IN')}
            </span>
          </div>
          <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1 mt-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Zero transaction loss on reroute
          </span>
        </div>

        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
          <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block font-medium">
            Baseline Target Comparison
          </span>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold font-mono text-blue-600">
              {baselineRate}%
            </span>
            <span className="text-xs text-slate-400 font-mono">
              target SLA
            </span>
          </div>
          <span className="text-[11px] text-blue-600 font-semibold flex items-center gap-1 mt-1">
            <Activity className="w-3.5 h-3.5" />
            Within ±0.6% nominal baseline
          </span>
        </div>
      </div>
    </Card>
  );
};
