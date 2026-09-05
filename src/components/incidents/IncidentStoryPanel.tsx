import React from 'react';
import { Incident } from '../../types';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { formatINR } from '../../lib/formatters';
import { 
  AlertTriangle, 
  HelpCircle, 
  Flame, 
  DollarSign, 
  Lightbulb, 
  UserCheck, 
  Activity, 
  CheckCircle2,
  ShieldCheck,
  Zap,
  ArrowRight,
  TrendingUp,
  Cpu
} from 'lucide-react';

interface IncidentStoryPanelProps {
  incident: Incident;
  className?: string;
}

export const IncidentStoryPanel: React.FC<IncidentStoryPanelProps> = ({
  incident,
  className = '',
}) => {
  const detConfidence = Math.round((incident.detection?.confidence ?? 0.96) * 100);
  const invConfidence = Math.round((incident.investigation?.confidence ?? 0.94) * 100);
  const resConfidence = Math.round((incident.resolution?.confidence ?? 0.95) * 100);

  const revenueAtRisk = incident.revenueAtRisk ?? incident.detection?.estimatedRevenueAtRisk ?? 845000;
  const estimatedLost = Math.round(revenueAtRisk * 0.12);
  const estimatedRecoverable = revenueAtRisk - estimatedLost;
  const protectedRevenue = incident.resolution?.recoveryMetrics?.protectedRevenueINR ?? 
    (incident.resolution?.executionStatus === 'executed' ? revenueAtRisk : 0);

  const recoveryMetrics = incident.resolution?.recoveryMetrics;
  const isResolved = incident.status === 'VERIFIED' || incident.status === 'RESOLVED';

  return (
    <Card className={`p-6 bg-white border-slate-200/90 shadow-xs ${className}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-6 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-blue-50 border border-blue-200 text-blue-700">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 tracking-tight">
              Executive Incident Narrative & Operational Brief
            </h3>
            <p className="text-xs text-slate-500">
              Clear answers to the 8 core operational questions synthesized from telemetry & reasoning agents.
            </p>
          </div>
        </div>

        {/* 3-Agent Distinct Confidence Bar */}
        <div className="flex items-center gap-2 shrink-0 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-mono">
          <span className="text-[10px] uppercase font-bold text-slate-400">Confidence:</span>
          <span className="text-blue-700" title="Detection Confidence">
            Det: <strong>{detConfidence}%</strong>
          </span>
          <span className="text-slate-300">|</span>
          <span className="text-indigo-700" title="Investigation Confidence">
            Inv: <strong>{invConfidence}%</strong>
          </span>
          <span className="text-slate-300">|</span>
          <span className="text-emerald-700" title="Resolution Confidence">
            Res: <strong>{resConfidence}%</strong>
          </span>
        </div>
      </div>

      {/* 8-Question Operational Story Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. WHAT happened? */}
        <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200/80 space-y-2 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 uppercase tracking-wider mb-1">
              <AlertTriangle className="w-4 h-4 text-rose-600" />
              1. What Happened?
            </div>
            <p className="text-xs text-slate-700 leading-relaxed font-sans">
              {incident.detection?.summary || incident.title}
            </p>
          </div>
          <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px] font-mono text-slate-500">
            <span>Detection Anomaly</span>
            <strong className="text-rose-600">Delta -43.8%</strong>
          </div>
        </div>

        {/* 2. WHY did it happen? */}
        <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200/80 space-y-2 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 uppercase tracking-wider mb-1">
              <HelpCircle className="w-4 h-4 text-indigo-600" />
              2. Why Did It Happen?
            </div>
            <p className="text-xs text-slate-700 leading-relaxed font-sans">
              {incident.investigation?.rootCause || 'Root cause investigation isolating issuer gateway packet loss & switch timeout spikes.'}
            </p>
          </div>
          <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px] font-mono text-slate-500">
            <span>Hypothesis Confidence</span>
            <strong className="text-indigo-600">{invConfidence}%</strong>
          </div>
        </div>

        {/* 3. HOW serious is it? */}
        <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200/80 space-y-2 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 uppercase tracking-wider mb-1">
              <Flame className="w-4 h-4 text-amber-600" />
              3. How Serious Is It?
            </div>
            <div className="space-y-1 text-xs text-slate-700">
              <div className="flex items-center justify-between font-mono">
                <span>Severity Tier:</span>
                <Badge severity={incident.severity} size="sm" />
              </div>
              <div className="flex items-center justify-between font-mono">
                <span>Scope:</span>
                <strong className="text-slate-800">{incident.investigation?.isolatedOrSystemic || 'Isolated to Segment'}</strong>
              </div>
              <div className="flex items-center justify-between font-mono">
                <span>Impacted Merchants:</span>
                <strong className="text-blue-600">{incident.affectedMerchants || 18} Live</strong>
              </div>
            </div>
          </div>
          <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px] font-mono text-slate-500">
            <span>Impacted Txns</span>
            <strong className="text-amber-600">{incident.affectedTransactions || 0} failed</strong>
          </div>
        </div>

        {/* 4. HOW much business affected? */}
        <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200/80 space-y-2 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 uppercase tracking-wider mb-1">
              <DollarSign className="w-4 h-4 text-emerald-600" />
              4. Revenue Exposure
            </div>
            <div className="space-y-1 text-xs text-slate-700 font-mono">
              <div className="flex items-center justify-between">
                <span>Revenue at Risk:</span>
                <strong className="text-rose-600">{formatINR(revenueAtRisk, true)}</strong>
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-500">Gross Lost (12%):</span>
                <span className="text-slate-700">{formatINR(estimatedLost, true)}</span>
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-500">Recoverable (88%):</span>
                <span className="text-emerald-700 font-semibold">{formatINR(estimatedRecoverable, true)}</span>
              </div>
            </div>
          </div>
          <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px] font-mono text-slate-500">
            <span>Protected GMV</span>
            <strong className="text-emerald-600">{formatINR(protectedRevenue, true)}</strong>
          </div>
        </div>

        {/* 5. WHAT does system recommend? */}
        <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200/80 space-y-2 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 uppercase tracking-wider mb-1">
              <Lightbulb className="w-4 h-4 text-blue-600" />
              5. Recommendation
            </div>
            <p className="text-xs text-slate-700 leading-relaxed font-sans">
              {incident.resolution?.recommendedAction || 'Execute dynamic acquirer failover to secondary smart router.'}
            </p>
          </div>
          <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px] font-mono text-slate-500">
            <span>Action Policy</span>
            <strong className="text-blue-700">{incident.resolution?.actionType || 'DYNAMIC_REROUTE'}</strong>
          </div>
        </div>

        {/* 6. WHY does it recommend that? */}
        <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200/80 space-y-2 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 uppercase tracking-wider mb-1">
              <Zap className="w-4 h-4 text-purple-600" />
              6. Why This Action?
            </div>
            <p className="text-xs text-slate-700 leading-relaxed font-sans">
              {incident.resolution?.expectedImpact || 'Instantly recovers 93%+ success rate, isolates degraded banking switch, and provides 1-click rollback.'}
            </p>
          </div>
          <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px] font-mono text-slate-500">
            <span>Reversibility</span>
            <strong className="text-purple-700">1-Click Instant Rollback</strong>
          </div>
        </div>

        {/* 7. WHO approved it? */}
        <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200/80 space-y-2 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 uppercase tracking-wider mb-1">
              <UserCheck className="w-4 h-4 text-slate-700" />
              7. Who Approved It?
            </div>
            <div className="space-y-1 text-xs text-slate-700">
              <div className="flex items-center justify-between font-mono">
                <span>Gate Status:</span>
                <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                  incident.resolution?.approvalStatus === 'approved' 
                    ? 'bg-emerald-100 text-emerald-800' 
                    : incident.resolution?.approvalStatus === 'rejected'
                    ? 'bg-rose-100 text-rose-800'
                    : 'bg-amber-100 text-amber-800'
                }`}>
                  {(incident.resolution?.approvalStatus || 'PENDING').toUpperCase()}
                </span>
              </div>
              <p className="text-[11px] text-slate-600 font-mono truncate">
                Operator: {incident.resolution?.approvedBy || 'Pending Human Review'}
              </p>
            </div>
          </div>
          <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px] font-mono text-slate-500">
            <span>Governance Gate</span>
            <strong className="text-slate-800">Mandatory SRE Signoff</strong>
          </div>
        </div>

        {/* 8. WHAT happened after action? */}
        <div className={`p-4 rounded-xl border space-y-2 flex flex-col justify-between ${
          isResolved 
            ? 'bg-emerald-50/50 border-emerald-200' 
            : incident.resolution?.executionStatus === 'executed'
            ? 'bg-blue-50/50 border-blue-200'
            : 'bg-slate-50/70 border-slate-200/80'
        }`}>
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 uppercase tracking-wider mb-1">
              {isResolved ? (
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
              ) : (
                <Activity className="w-4 h-4 text-blue-600" />
              )}
              8. Post-Action Outcome
            </div>
            <p className="text-xs text-slate-700 leading-relaxed font-sans">
              {recoveryMetrics ? (
                <span>
                  Success rate recovered from <strong>{recoveryMetrics.degradedSuccessRate}%</strong> to{' '}
                  <strong className="text-emerald-700">{recoveryMetrics.recoveredSuccessRate}%</strong>.
                </span>
              ) : incident.resolution?.executionStatus === 'executed' ? (
                'Mitigation active in simulation. Verification stream observing live telemetry recovery.'
              ) : (
                'Awaiting human operator approval to execute simulated routing failover.'
              )}
            </p>
          </div>
          <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px] font-mono text-slate-500">
            <span>Verification State</span>
            <strong className={isResolved ? 'text-emerald-700' : 'text-slate-700'}>
              {incident.resolution?.verificationStatus?.toUpperCase() || 'STANDBY'}
            </strong>
          </div>
        </div>
      </div>
    </Card>
  );
};
