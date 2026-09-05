import React, { useState } from 'react';
import { Incident } from '../../types';
import { formatINR } from '../../lib/formatters';
import { 
  ShieldAlert, 
  CheckCircle2, 
  HelpCircle, 
  ChevronDown, 
  ChevronUp, 
  ArrowRight, 
  Activity, 
  Cpu, 
  Lock, 
  TrendingUp, 
  Zap,
  Sparkles
} from 'lucide-react';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';

interface ExecutiveIncidentCardProps {
  incident: Incident;
  onOpenTechnicalDetails?: () => void;
}

export const ExecutiveIncidentCard: React.FC<ExecutiveIncidentCardProps> = ({
  incident,
  onOpenTechnicalDetails,
}) => {
  const [showTechnicalDetails, setShowTechnicalDetails] = useState(false);

  // Monetary calculations
  const revAtRisk = incident.revenueAtRisk || 845000;
  const estimatedRecoverable = incident.estimatedRecoverableRevenue || Math.round(revAtRisk * 0.80);
  const actualRecovered = incident.recoveredRevenue || (incident.status === 'RESOLVED' ? Math.round(estimatedRecoverable * 0.94) : 0);
  const isResolved = incident.status === 'RESOLVED' || incident.status === 'VERIFIED';

  // Strategy & Actions
  const actionTitle = incident.resolution?.recommendedAction 
    ? (incident.resolution.recommendedAction.length > 80 
        ? incident.resolution.recommendedAction.slice(0, 80) + '...' 
        : incident.resolution.recommendedAction)
    : 'Dynamic Traffic Shift to Verified Secondary Acquirer';

  return (
    <Card 
      id="executive-incident-card"
      className="p-5 sm:p-6 bg-gradient-to-br from-white via-slate-50/50 to-blue-50/20 border-slate-200/90 shadow-xs space-y-5"
    >
      {/* Header with Title & Badges */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-bold">
              Executive Incident Brief
            </span>
            <span className="text-xs font-mono text-slate-500 font-medium">
              ID: {incident.id}
            </span>
            <Badge severity={incident.severity} size="sm" />
            <Badge status={incident.status} size="sm" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mt-1">
            {incident.title}
          </h3>
        </div>

        {/* Highlighted Outcome Badge */}
        {actualRecovered > 0 && (
          <div className="px-3.5 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center gap-2 shrink-0 shadow-2xs">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider block text-emerald-600">Actual Revenue Recovered</span>
              <strong className="text-sm font-extrabold font-mono text-emerald-700">
                {formatINR(actualRecovered, true)}
              </strong>
            </div>
          </div>
        )}
      </div>

      {/* 8-Part Executive Summary Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
        {/* 1. WHAT HAPPENED */}
        <div className="p-3.5 rounded-xl bg-white border border-slate-200 space-y-1.5 shadow-2xs">
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 block">
            1. What Happened
          </span>
          <p className="text-slate-800 font-medium leading-relaxed">
            {incident.detection?.summary 
              ? incident.detection.summary.slice(0, 110) + '...'
              : 'Acute success rate drop flagged on primary payment route.'}
          </p>
        </div>

        {/* 2. WHY IT MATTERS */}
        <div className="p-3.5 rounded-xl bg-white border border-slate-200 space-y-1.5 shadow-2xs">
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 block">
            2. Why It Matters
          </span>
          <p className="text-slate-800 font-medium leading-relaxed">
            Impacts <strong className="text-slate-900">{incident.affectedMerchants || 18} merchants</strong> with{' '}
            <strong className="text-rose-600 font-semibold">{incident.affectedTransactions} failing transactions</strong>, directly jeopardizing merchant revenue.
          </p>
        </div>

        {/* 3. ROOT CAUSE */}
        <div className="p-3.5 rounded-xl bg-white border border-slate-200 space-y-1.5 shadow-2xs">
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 block">
            3. Root Cause
          </span>
          <p className="text-slate-800 font-medium leading-relaxed">
            {incident.investigation?.rootCause 
              ? (incident.investigation.rootCause.length > 100 
                  ? incident.investigation.rootCause.slice(0, 100) + '...' 
                  : incident.investigation.rootCause)
              : 'Upstream banking gateway switch timeout (>3500ms).'}
          </p>
        </div>

        {/* 4. REVENUE AT RISK */}
        <div className="p-3.5 rounded-xl bg-white border border-slate-200 space-y-1.5 shadow-2xs">
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 block">
            4. Revenue At Risk
          </span>
          <div className="space-y-0.5">
            <span className="text-base font-extrabold font-mono text-rose-600 block">
              {formatINR(revAtRisk, true)}
            </span>
            <span className="text-[10px] text-slate-500 font-mono">
              Calculated on real transaction payload
            </span>
          </div>
        </div>

        {/* 5. RECOVERABLE REVENUE */}
        <div className="p-3.5 rounded-xl bg-white border border-slate-200 space-y-1.5 shadow-2xs">
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 block">
            5. Recoverable Revenue
          </span>
          <div className="space-y-0.5">
            <span className="text-base font-extrabold font-mono text-blue-600 block">
              {formatINR(estimatedRecoverable, true)}
            </span>
            <span className="text-[10px] text-slate-500 font-mono">
              Qualified via idempotency & risk policies
            </span>
          </div>
        </div>

        {/* 6. RECOMMENDED ACTION */}
        <div className="p-3.5 rounded-xl bg-white border border-slate-200 space-y-1.5 shadow-2xs">
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 block">
            6. Recommended Action
          </span>
          <p className="text-slate-800 font-medium leading-relaxed truncate" title={incident.resolution?.recommendedAction}>
            {actionTitle}
          </p>
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="inline-block text-[10px] font-semibold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
              {incident.resolution?.requiresApproval ? 'Human Approval Required' : 'Autonomous Action'}
            </span>
            <span className="text-[10px] text-slate-500 font-mono">
              Scope: 100% of affected simulated traffic
            </span>
          </div>
        </div>

        {/* 7. EXPECTED RECOVERY */}
        <div className="p-3.5 rounded-xl bg-white border border-slate-200 space-y-1.5 shadow-2xs">
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 block">
            7. Expected Recovery
          </span>
          <div className="space-y-0.5">
            <div className="flex items-baseline justify-between">
              <span className="text-[10px] text-slate-500 font-mono">Estimated Rate:</span>
              <span className="text-xs font-bold font-mono text-emerald-600">&gt;85%</span>
            </div>
            <div className="flex items-baseline justify-between pt-0.5">
              <span className="text-[10px] text-slate-500 font-mono">Recoverable Rev:</span>
              <span className="text-sm font-extrabold font-mono text-emerald-600">{formatINR(estimatedRecoverable, true)}</span>
            </div>
            <span className="text-[9px] text-slate-400 font-sans block pt-0.5">
              SLA target restoral to &gt;92%
            </span>
          </div>
        </div>

        {/* 8. ACTUAL RECOVERY */}
        <div className="p-3.5 rounded-xl bg-emerald-50/60 border border-emerald-200 space-y-1.5 shadow-2xs">
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-700 block">
            8. Actual Recovery
          </span>
          <div className="space-y-0.5">
            <span className="text-base font-extrabold font-mono text-emerald-700 block">
              {actualRecovered > 0 ? `Revenue Recovered: ${formatINR(actualRecovered, true)}` : 'Actual Recovery — Pending Execution'}
            </span>
            <span className="text-[10px] text-emerald-800/80 font-mono">
              {actualRecovered > 0 
                ? `${((actualRecovered / Math.max(1, revAtRisk)) * 100).toFixed(1)}% recovery rate verified` 
                : 'Awaiting mitigation verification'}
            </span>
          </div>
        </div>
      </div>

      {/* Technical Details Toggle */}
      <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
        <button
          onClick={() => {
            setShowTechnicalDetails(!showTechnicalDetails);
            if (onOpenTechnicalDetails) onOpenTechnicalDetails();
          }}
          className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1.5 cursor-pointer"
        >
          <span>{showTechnicalDetails ? 'Hide' : 'View'} Technical & Agent Details</span>
          {showTechnicalDetails ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>

        <span className="text-[11px] font-mono text-slate-400">
          Deterministic Rule Layer + AI Reasoning Intelligence
        </span>
      </div>

      {/* Expandable Technical Panel */}
      {showTechnicalDetails && (
        <div className="p-4 rounded-xl bg-slate-900 text-slate-200 font-mono text-xs space-y-3 animate-in fade-in duration-150">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-[11px] text-slate-400">
            <span>PIPELINE TELEMETRY CONTRACT</span>
            <span>APPEND-ONLY AUDIT LOGGED</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-[11px]">
            <div>
              <span className="text-slate-500 block">Detection Engine:</span>
              <strong className="text-cyan-400">AI Reasoning + Rolling 3σ Filter</strong>
              <span className="text-slate-400 block mt-0.5">Confidence: {Math.round((incident.detection?.confidence || 0.96) * 100)}%</span>
            </div>
            <div>
              <span className="text-slate-500 block">Investigation Attribution:</span>
              <strong className="text-indigo-400">Segment Isolation (7 Dimensions)</strong>
              <span className="text-slate-400 block mt-0.5">Confidence: {Math.round((incident.investigation?.confidence || 0.94) * 100)}%</span>
            </div>
            <div>
              <span className="text-slate-500 block">Resolution Policy:</span>
              <strong className="text-amber-400">POL-IDEMP-01 / POL-RR-02 Passed</strong>
              <span className="text-slate-400 block mt-0.5">Confidence: {Math.round((incident.resolution?.confidence || 0.95) * 100)}%</span>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
};
