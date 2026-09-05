import React from 'react';
import { CandidateAction, Incident } from '../../types';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { 
  GitPullRequest, 
  ShieldCheck, 
  AlertTriangle, 
  RotateCcw, 
  CheckCircle2, 
  Clock,
  Sparkles,
  Lock,
  ArrowRight
} from 'lucide-react';

interface CandidateActionsMatrixProps {
  incident: Incident;
  className?: string;
}

export const CandidateActionsMatrix: React.FC<CandidateActionsMatrixProps> = ({
  incident,
  className = '',
}) => {
  const candidateActions: CandidateAction[] = incident.resolution?.candidateActions || [
    {
      id: 'act-1',
      title: 'Dynamic Acquirer Reroute to Secondary Gateway',
      actionType: 'DYNAMIC_REROUTE',
      description: 'Shift eligible HDFC Bank traffic from HDFC_DIRECT_V3 to the approved fallback route (Scope: 100% of affected simulated traffic) with verified 95.4% health.',
      expectedBenefit: '+43.8 pp success rate recovery; recovers ₹8.45L in GMV immediately.',
      risk: 'medium',
      affectedScope: 'HDFC UPI Traffic Only (No collateral impact to ICICI/SBI)',
      confidence: 0.96,
      reversibility: 'Instant (1-click)',
      isRecommended: true,
      requiresApproval: true,
      tradeoffs: 'Marginal +18ms gateway routing overhead vs eliminating ~44% customer dropoffs.'
    },
    {
      id: 'act-2',
      title: 'Adaptive Circuit Breaker Throttle (50% Load)',
      actionType: 'CIRCUIT_BREAKER_THROTTLE',
      description: 'Throttle 50% of traffic to HDFC switch to allow upstream banking buffers to clear queues.',
      expectedBenefit: 'Reduces server-side 504 timeouts, but drops remaining 50% transactions.',
      risk: 'high',
      affectedScope: 'All HDFC Merchants',
      confidence: 0.74,
      reversibility: 'Fast (< 30s)',
      isRecommended: false,
      requiresApproval: true,
      tradeoffs: 'Half of transactions still fail with checkout errors; does not protect full GMV.'
    },
    {
      id: 'act-3',
      title: 'Merchant Integration Advisory Broadcast',
      actionType: 'MERCHANT_ADVISORY_BROADCAST',
      description: 'Push webhook notification advising 18 enterprise merchants to prompt customers for alternate payment methods.',
      expectedBenefit: 'Improves customer awareness without altering core routing tables.',
      risk: 'low',
      affectedScope: 'All Merchants (18 impacted)',
      confidence: 0.62,
      reversibility: 'Instant (1-click)',
      isRecommended: false,
      requiresApproval: false,
      tradeoffs: 'Passive action; does not fix underlying gateway timeout or recover lost checkouts.'
    },
    {
      id: 'act-4',
      title: 'Passive Telemetry Monitoring (No Routing Shift)',
      actionType: 'PASSIVE_MONITORING',
      description: 'Continue observing degradation window for self-healing across upstream HDFC switches.',
      expectedBenefit: 'Zero system mutation risk; maintains original configuration.',
      risk: 'high',
      affectedScope: 'Entire Ingress Gateway',
      confidence: 0.35,
      reversibility: 'Instant (1-click)',
      isRecommended: false,
      requiresApproval: false,
      tradeoffs: 'Allows ₹8.45L revenue exposure to compound every 15 minutes.'
    }
  ];

  return (
    <Card className={`p-6 bg-white border-slate-200/90 shadow-xs space-y-5 ${className}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <GitPullRequest className="w-4 h-4 text-emerald-600" />
          <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            Resolution Agent Decision Matrix & Policy Evaluation
          </h4>
        </div>
        <span className="text-xs text-slate-500 font-mono">
          {candidateActions.length} Candidate Mitigation Policies Evaluated
        </span>
      </div>

      {/* Decision Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse font-sans">
          <thead>
            <tr className="border-b border-slate-200 text-slate-500 font-mono uppercase text-[10px]">
              <th className="pb-2.5 font-semibold">Policy / Action Option</th>
              <th className="pb-2.5 font-semibold">Expected Operational Benefit</th>
              <th className="pb-2.5 font-semibold">Risk Rating</th>
              <th className="pb-2.5 font-semibold">Reversibility</th>
              <th className="pb-2.5 font-semibold">Affected Scope</th>
              <th className="pb-2.5 font-semibold text-center">Confidence</th>
              <th className="pb-2.5 font-semibold text-center">Approval</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {candidateActions.map((action) => {
              const isRec = action.isRecommended;

              return (
                <tr 
                  key={action.id}
                  className={`hover:bg-slate-50/80 transition-colors ${
                    isRec ? 'bg-emerald-50/40 border-l-4 border-l-emerald-600' : ''
                  }`}
                >
                  <td className="py-3 pr-3 font-medium text-slate-900 max-w-xs">
                    <div className="flex items-center gap-2">
                      {isRec && (
                        <span className="px-1.5 py-0.5 rounded bg-emerald-100 border border-emerald-300 text-emerald-800 text-[10px] font-extrabold shrink-0 uppercase tracking-tight">
                          Preferred
                        </span>
                      )}
                      <span className="font-bold text-xs">{action.title}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                      {action.description}
                    </p>
                  </td>

                  <td className="py-3 px-3 text-slate-700 max-w-xs text-xs">
                    <strong className="text-emerald-700 block font-semibold">
                      {action.expectedBenefit}
                    </strong>
                    <span className="text-[10px] text-slate-500 block mt-0.5">
                      Tradeoff: {action.tradeoffs}
                    </span>
                  </td>

                  <td className="py-3 px-3">
                    <Badge
                      variant={action.risk === 'low' ? 'success' : action.risk === 'medium' ? 'warning' : 'danger'}
                      size="sm"
                    >
                      {action.risk.toUpperCase()}
                    </Badge>
                  </td>

                  <td className="py-3 px-3 font-mono text-slate-600 text-xs">
                    <div className="flex items-center gap-1">
                      <RotateCcw className="w-3 h-3 text-slate-400" />
                      {action.reversibility}
                    </div>
                  </td>

                  <td className="py-3 px-3 text-slate-600 font-mono text-[11px]">
                    {action.affectedScope}
                  </td>

                  <td className="py-3 px-3 text-center font-mono font-bold text-slate-900">
                    {Math.round(action.confidence * 100)}%
                  </td>

                  <td className="py-3 pl-3 text-center">
                    {action.requiresApproval ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                        <Lock className="w-2.5 h-2.5" />
                        Human Gate
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-600">
                        Autonomous
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
};
