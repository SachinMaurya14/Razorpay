import React from 'react';
import { ExecutiveIncidentSummary } from '../../types';
import { Card } from '../common/Card';
import { formatINR } from '../../lib/formatters';
import { 
  FileCheck, 
  ShieldAlert, 
  TrendingUp, 
  CheckCircle2, 
  AlertTriangle, 
  Clock,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';

interface ExecutiveSummaryCardProps {
  summary: ExecutiveIncidentSummary;
  className?: string;
}

export const ExecutiveSummaryCard: React.FC<ExecutiveSummaryCardProps> = ({
  summary,
  className = '',
}) => {
  return (
    <Card className={`p-5 sm:p-6 bg-white border-slate-200/90 shadow-xs ${className}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-4 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-blue-50 text-blue-600 border border-blue-200">
            <FileCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              Executive Incident & Recovery Brief
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">
                AUDITED
              </span>
            </h3>
            <p className="text-xs text-slate-500">
              Deterministic post-action synthesis for VP of Engineering & Payment Risk Committee
            </p>
          </div>
        </div>

        <span className="text-xs font-mono text-slate-400">
          Executive Synthesis (Audited)
        </span>
      </div>

      {/* Headline Block */}
      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/90 mb-5">
        <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold block mb-1">
          Incident Executive Summary
        </span>
        <h4 className="text-sm sm:text-base font-bold text-slate-900 leading-snug">
          {summary.headline}
        </h4>
      </div>

      {/* 4 Key Executive Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 mb-5">
        {/* Pillar 1: Revenue Impact Statement */}
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-1.5">
          <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
            <ShieldAlert className="w-4 h-4 text-rose-500" />
            Financial Exposure Statement
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            {summary.revenueImpactStatement}
          </p>
        </div>

        {/* Pillar 2: Recoverability Breakdown */}
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-1.5">
          <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            Deterministic Recoverability Synthesis
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            {summary.recoverabilitySummary}
          </p>
        </div>

        {/* Pillar 3: Action Taken */}
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-1.5">
          <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-blue-600" />
            Mitigation Protocol Executed
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            {summary.actionTakenStatement}
          </p>
        </div>

        {/* Pillar 4: Outcome Verification */}
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-1.5">
          <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4 text-emerald-600" />
            Telemetry Outcome Verification
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            {summary.outcomeVerification}
          </p>
        </div>
      </div>

      {/* Residual Risk Notice */}
      <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200 flex items-start gap-2.5 text-xs text-amber-900">
        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <strong className="font-bold">Residual Operational Risk Notice: </strong>
          <span>{summary.residualRiskNotice}</span>
        </div>
      </div>
    </Card>
  );
};
