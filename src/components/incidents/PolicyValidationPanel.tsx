import React from 'react';
import { RecoveryPolicyValidation } from '../../types';
import { Card } from '../common/Card';
import { 
  ShieldCheck, 
  CheckCircle2, 
  AlertTriangle, 
  Lock, 
  RotateCcw, 
  FileText,
  UserCheck
} from 'lucide-react';

interface PolicyValidationPanelProps {
  validation?: RecoveryPolicyValidation;
  className?: string;
}

export const PolicyValidationPanel: React.FC<PolicyValidationPanelProps> = ({
  validation,
  className = '',
}) => {
  const defaultValidation: RecoveryPolicyValidation = validation || {
    isValid: true,
    actionType: 'DYNAMIC_REROUTE',
    eligibilityCheck: 'PASSED',
    retryLimitCheck: 'PASSED',
    duplicateSafetyCheck: 'PASSED',
    riskLevel: 'medium',
    approvalRequired: true,
    approvalRationale: 'Traffic reroute to ICICI/Axis secondary route is fully non-destructive with guaranteed idempotency protection and 1-click instant rollback.',
    reversibility: 'Instant (1-click)',
    scopeLimitPercent: 100,
    policyDecision: 'APPROVED_FOR_EXECUTION',
    policyNotes: 'All 4 safety invariants verified. Zero duplicate charge risk.',
    stoppingCriteria: [
      'Stop if secondary route failure rate exceeds 15%',
      'Stop if secondary gateway p95 latency exceeds 850ms',
      'Stop immediately if any duplicate idempotency collision detected'
    ]
  };

  return (
    <Card className={`p-5 sm:p-6 bg-white border-slate-200/90 shadow-xs ${className}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-4 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-200">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-extrabold text-slate-900 tracking-tight">
                Recovery Policy & Governance Validation
              </h3>
              <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${
                defaultValidation.policyDecision === 'APPROVED_FOR_EXECUTION'
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                  : 'bg-amber-50 text-amber-700 border-amber-300'
              }`}>
                {defaultValidation.policyDecision}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5 font-mono">
              Action Scope: {defaultValidation.actionType} ({defaultValidation.scopeLimitPercent}% traffic shift limit)
            </p>
          </div>
        </div>

        <span className="text-[11px] font-mono text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 font-bold self-start sm:self-auto">
          POLICY POL-REROUTE-04 ACTIVE
        </span>
      </div>

      {/* 4 Core Gate Checks */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        {/* Check 1 */}
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="font-bold text-slate-800">Eligibility Gate</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-[11px] text-slate-600">
            Error codes matched to retryable transport timeout set.
          </p>
          <div className="text-[10px] font-mono font-bold text-emerald-700 mt-2">
            STATUS: {defaultValidation.eligibilityCheck}
          </div>
        </div>

        {/* Check 2 */}
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="font-bold text-slate-800">Retry Rate Limit</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-[11px] text-slate-600">
            Max 2 attempts per transaction session enforced.
          </p>
          <div className="text-[10px] font-mono font-bold text-emerald-700 mt-2">
            STATUS: {defaultValidation.retryLimitCheck}
          </div>
        </div>

        {/* Check 3 */}
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="font-bold text-slate-800">Duplicate Safety</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-[11px] text-slate-600">
            Deterministic idempotency keys prevent dual-debit risk.
          </p>
          <div className="text-[10px] font-mono font-bold text-emerald-700 mt-2">
            STATUS: {defaultValidation.duplicateSafetyCheck}
          </div>
        </div>

        {/* Check 4 */}
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="font-bold text-slate-800">Reversibility</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-[11px] text-slate-600">
            Instant 1-click dynamic rule revocation supported.
          </p>
          <div className="text-[10px] font-mono font-bold text-emerald-700 mt-2">
            {defaultValidation.reversibility}
          </div>
        </div>
      </div>

      {/* Safety & Signoff Rationale Box */}
      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/90 text-xs space-y-2">
        <div className="font-bold text-slate-900 flex items-center gap-1.5">
          <UserCheck className="w-4 h-4 text-blue-600" />
          Governance Signoff & Compliance Rationale
        </div>
        <p className="text-slate-700 leading-relaxed">
          {defaultValidation.approvalRationale}
        </p>

        {defaultValidation.stoppingCriteria && defaultValidation.stoppingCriteria.length > 0 && (
          <div className="pt-2 border-t border-slate-200/60">
            <div className="text-[10px] font-mono uppercase text-slate-400 font-bold mb-1.5">
              Automated Circuit Breaker Stopping Criteria
            </div>
            <ul className="space-y-1">
              {defaultValidation.stoppingCriteria.map((criterion, idx) => (
                <li key={idx} className="flex items-center gap-2 text-[11px] text-slate-600 font-mono">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                  <span>{criterion}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </Card>
  );
};
