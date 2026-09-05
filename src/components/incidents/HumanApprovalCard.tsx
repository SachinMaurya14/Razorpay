import React, { useState } from 'react';
import { ResolutionOutput } from '../../types';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { ShieldAlert, ShieldCheck, Check, X, ArrowRight, AlertTriangle, Zap, UserCheck, Loader2, RotateCcw } from 'lucide-react';

interface HumanApprovalCardProps {
  resolution: ResolutionOutput;
  onApprove: (notes?: string) => Promise<void>;
  onReject: (notes?: string) => Promise<void>;
  onExecute: () => Promise<void>;
  onVerify: () => Promise<void>;
  onRollback?: () => Promise<void>;
  isProcessing?: boolean;
}

export const HumanApprovalCard: React.FC<HumanApprovalCardProps> = ({
  resolution,
  onApprove,
  onReject,
  onExecute,
  onVerify,
  onRollback,
  isProcessing = false,
}) => {
  const [operatorNotes, setOperatorNotes] = useState('');
  const [showNotesInput, setShowNotesInput] = useState(false);

  const isPendingApproval = resolution.approvalStatus === 'pending';
  const isApproved = resolution.approvalStatus === 'approved';
  const isExecuted = resolution.executionStatus === 'executed';
  const isVerified = resolution.verificationStatus === 'resolved';

  const handleApprove = async () => {
    await onApprove(operatorNotes || 'Confirmed: Authorizing dynamic traffic reroute.');
  };

  const handleReject = async () => {
    await onReject(operatorNotes || 'Rejected by operator: Manual intervention preferred.');
  };

  return (
    <Card className="p-5 sm:p-6 bg-white border-slate-200/80 shadow-xs relative overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-600">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900">
                Resolution Agent Proposed Mitigation
              </h3>
              <Badge risk={resolution.riskLevel} />
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Human-in-the-Loop Governance • Action Policy Verification
            </p>
          </div>
        </div>

        <Badge approval={resolution.approvalStatus} />
      </div>

      {/* Recommended Action Box */}
      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block">
            Target Operational Action
          </span>
          <p className="text-sm font-bold text-slate-900 mt-1 leading-relaxed">
            {resolution.recommendedAction}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-slate-200 text-xs font-mono">
          <div>
            <span className="text-[10px] block text-slate-400">Action Type</span>
            <span className="font-semibold text-blue-600">{resolution.actionType}</span>
          </div>
          <div>
            <span className="text-[10px] block text-slate-400">Degraded Route</span>
            <span className="font-semibold text-rose-600">{resolution.targetRoute || 'HDFC_DIRECT_V3'}</span>
          </div>
          <div>
            <span className="text-[10px] block text-slate-400">Target Fallback Pipe</span>
            <span className="font-semibold text-emerald-600">{resolution.fallbackRoute || 'RAZORPAY_SMART_ROUTER_SECONDARY'}</span>
          </div>
        </div>
      </div>

      {/* Candidate Actions Evaluation Table */}
      {resolution.candidateActions && resolution.candidateActions.length > 0 && (
        <div className="mt-4 pt-4 border-t border-slate-100">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-mono uppercase tracking-wider text-slate-500 font-bold">
              Evaluated Mitigation Strategies ({resolution.candidateActions.length})
            </span>
            <span className="text-[10px] text-slate-400 font-mono">
              Auto-selected optimal risk-adjusted strategy
            </span>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-[10px] uppercase font-mono text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Strategy</th>
                  <th className="py-2.5 px-3">Expected Benefit</th>
                  <th className="py-2.5 px-3">Risk</th>
                  <th className="py-2.5 px-3">Reversibility</th>
                  <th className="py-2.5 px-3">Confidence</th>
                  <th className="py-2.5 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {resolution.candidateActions.map((cand) => (
                  <tr 
                    key={cand.id}
                    className={`transition-colors ${
                      cand.isRecommended ? 'bg-blue-50/40 font-medium' : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <td className="py-2.5 px-3">
                      <div className="flex items-center gap-1.5">
                        {cand.isRecommended && (
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-600 shrink-0" />
                        )}
                        <div>
                          <div className="font-semibold text-slate-900">{cand.title}</div>
                          <div className="text-[10px] text-slate-400 font-mono">{cand.actionType}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-2.5 px-3 text-slate-700 max-w-[220px]">
                      {cand.expectedBenefit}
                    </td>
                    <td className="py-2.5 px-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                        cand.risk === 'low' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                        cand.risk === 'medium' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                        'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}>
                        {cand.risk}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-mono text-[11px] text-slate-600">
                      {cand.reversibility}
                    </td>
                    <td className="py-2.5 px-3 font-mono font-bold text-slate-800">
                      {Math.round(cand.confidence * 100)}%
                    </td>
                    <td className="py-2.5 px-3">
                      {cand.isRecommended ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-600 text-white">
                          RECOMMENDED
                        </span>
                      ) : (
                        <span className="text-[10px] font-mono text-slate-400">
                          Alternative
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Expected Impact & Risk Disclosure */}
      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="p-3.5 rounded-lg bg-emerald-50/60 border border-emerald-200">
          <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-700 font-bold block">
            Expected Business Impact
          </span>
          <p className="text-xs text-emerald-900 mt-1 leading-relaxed">
            {resolution.expectedImpact}
          </p>
        </div>

        <div className="p-3.5 rounded-lg bg-amber-50/60 border border-amber-200">
          <span className="text-[10px] font-mono uppercase tracking-wider text-amber-700 font-bold block">
            Risk & Safeguards
          </span>
          <p className="text-xs text-amber-900 mt-1 leading-relaxed">
            {resolution.riskLevel === 'high' 
              ? 'High impact: modifies active banking acquirer pipe. Reversible within 60s via circuit breaker.' 
              : 'Isolated to HDFC UPI segment. Traffic shift is zero-downtime and transparent to customer checkout.'}
          </p>
        </div>
      </div>

      {/* Operator Signoff Details if already approved */}
      {isApproved && (
        <div className="mt-4 p-3.5 rounded-lg bg-blue-50/60 border border-blue-200 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-blue-600" />
            <div>
              <span className="text-slate-900 font-semibold block">
                Approved by {resolution.approvedBy || 'Operator (Lead Payments SRE)'}
              </span>
              <span className="text-[11px] text-slate-500 font-mono">
                {resolution.approvedAt ? new Date(resolution.approvedAt).toLocaleTimeString() : 'Recently'}
              </span>
            </div>
          </div>
          <Badge variant="emerald" size="sm">
            AUTHORIZED
          </Badge>
        </div>
      )}

      {/* Action Controls */}
      <div className="mt-5 pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="text-xs text-slate-500">
          {isPendingApproval ? (
            <span className="flex items-center gap-1.5 text-amber-600 font-medium">
              <AlertTriangle className="w-3.5 h-3.5" />
              Human verification required prior to financial routing changes
            </span>
          ) : isVerified ? (
            <span className="text-emerald-600 font-medium flex items-center gap-1.5">
              <Check className="w-4 h-4" />
              Mitigation executed and verified in live simulation
            </span>
          ) : isExecuted ? (
            <span className="text-blue-600 font-medium flex items-center gap-1.5">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              Mitigation active. Telemetry recovery stream awaiting verification.
            </span>
          ) : (
            <span className="text-slate-700">
              Operator sign-off complete. Ready to deploy simulated routing.
            </span>
          )}
        </div>

        <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
          {/* 1-Click Rollback */}
          {(isExecuted || isVerified) && onRollback && (
            <button
              id="rollback-mitigation-btn"
              onClick={onRollback}
              disabled={isProcessing}
              className="px-3.5 py-2 rounded-lg border border-rose-300 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold transition-all flex items-center gap-1.5 disabled:opacity-50 cursor-pointer shadow-xs"
              title="Restores original routing table state and resets active mitigation rules"
            >
              <RotateCcw className="w-3.5 h-3.5 text-rose-600" />
              Rollback (1-Click)
            </button>
          )}

          {isPendingApproval && (
            <>
              <button
                id="reject-mitigation-btn"
                onClick={handleReject}
                disabled={isProcessing}
                className="px-3.5 py-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors flex items-center gap-1.5 disabled:opacity-50 cursor-pointer shadow-xs"
              >
                <X className="w-3.5 h-3.5 text-rose-600" />
                Reject
              </button>

              <button
                id="approve-mitigation-btn"
                onClick={handleApprove}
                disabled={isProcessing}
                className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
              >
                {isProcessing ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Check className="w-3.5 h-3.5" />
                )}
                Approve Mitigation
              </button>
            </>
          )}

          {isApproved && !isExecuted && (
            <button
              id="execute-mitigation-btn"
              onClick={onExecute}
              disabled={isProcessing}
              className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
            >
              {isProcessing ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Zap className="w-3.5 h-3.5" />
              )}
              Apply Simulated Reroute
            </button>
          )}

          {isExecuted && !isVerified && (
            <button
              id="verify-recovery-btn"
              onClick={onVerify}
              disabled={isProcessing}
              className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 disabled:opacity-50 cursor-pointer animate-pulse"
            >
              {isProcessing ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <ShieldCheck className="w-3.5 h-3.5" />
              )}
              Verify Recovery Metrics
            </button>
          )}
        </div>
      </div>
    </Card>
  );
};
