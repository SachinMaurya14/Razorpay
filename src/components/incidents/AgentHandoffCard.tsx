import React from 'react';
import { Incident } from '../../types';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { formatINR } from '../../lib/formatters';
import { 
  ArrowRight, 
  CheckCircle2, 
  Cpu, 
  Search, 
  ShieldAlert, 
  GitCommit, 
  ChevronRight,
  Database,
  Lock,
  Layers
} from 'lucide-react';

interface AgentHandoffCardProps {
  incident: Incident;
  className?: string;
}

export const AgentHandoffCard: React.FC<AgentHandoffCardProps> = ({
  incident,
  className = '',
}) => {
  const detConfidence = Math.round((incident.detection?.confidence ?? 0.96) * 100);
  const invConfidence = Math.round((incident.investigation?.confidence ?? 0.94) * 100);
  const resConfidence = Math.round((incident.resolution?.confidence ?? 0.95) * 100);

  return (
    <Card className={`p-6 bg-white border-slate-200/90 shadow-xs space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-indigo-600" />
          <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            Agent Operational Pipeline & Structured Handoffs
          </h4>
        </div>
        <span className="text-xs text-slate-500 font-mono">
          Deterministic Telemetry → 3 Specialized Agents → Human Gate
        </span>
      </div>

      {/* 3-Stage Pipeline Stepper */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 relative">
        {/* Stage 1: Detection Agent */}
        <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-200/80 space-y-3 relative flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold font-mono">
                  1
                </span>
                <span className="font-bold text-xs text-blue-900 uppercase tracking-wide">
                  Detection Agent
                </span>
              </div>
              <Badge variant="neutral" size="sm" className="bg-white border-blue-200 text-blue-800 font-mono">
                {detConfidence}% Conf
              </Badge>
            </div>

            <p className="text-xs text-slate-700 mt-2 leading-relaxed">
              Scanned 15m live transaction window. Detected anomaly exceeding 3σ statistical threshold.
            </p>

            <div className="mt-3 p-2.5 rounded-lg bg-white/90 border border-blue-200/70 font-mono text-[11px] space-y-1 text-slate-600">
              <span className="text-[10px] text-blue-700 uppercase font-bold block">
                Emitted Structured Payload:
              </span>
              <div>• Incident ID: <strong>{incident.id}</strong></div>
              <div>• Severity: <strong className="text-rose-600">{incident.severity.toUpperCase()}</strong></div>
              <div>• Revenue at Risk: <strong>{formatINR(incident.revenueAtRisk, true)}</strong></div>
              <div>• Signals: <strong>{incident.detection?.signals?.length || 3} telemetry anomalies</strong></div>
            </div>
          </div>

          <div className="pt-2 border-t border-blue-200/60 flex items-center justify-between text-[11px] font-mono text-blue-800">
            <span>Stage Status</span>
            <span className="font-bold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
              Handed off to Agent 2
            </span>
          </div>
        </div>

        {/* Stage 2: Investigation Agent */}
        <div className="p-4 rounded-xl bg-indigo-50/60 border border-indigo-200/80 space-y-3 relative flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-bold font-mono">
                  2
                </span>
                <span className="font-bold text-xs text-indigo-900 uppercase tracking-wide">
                  Investigation Agent
                </span>
              </div>
              <Badge variant="neutral" size="sm" className="bg-white border-indigo-200 text-indigo-800 font-mono">
                {invConfidence}% Conf
              </Badge>
            </div>

            <p className="text-xs text-slate-700 mt-2 leading-relaxed">
              Consumed Detection payload. Analyzed 7 cohorts, rejected 3 alternate hypotheses, isolated root cause.
            </p>

            <div className="mt-3 p-2.5 rounded-lg bg-white/90 border border-indigo-200/70 font-mono text-[11px] space-y-1 text-slate-600">
              <span className="text-[10px] text-indigo-700 uppercase font-bold block">
                Emitted Structured Payload:
              </span>
              <div>• Root Cause: <strong>{incident.investigation?.rootCauseCategory || 'Issuer Gateway Switch'}</strong></div>
              <div>• Evidence Points: <strong>{incident.investigation?.evidence?.length || 5} verified</strong></div>
              <div>• Scope: <strong>{incident.investigation?.isolatedOrSystemic || 'Isolated to Segment'}</strong></div>
              <div>• Impacted Merchants: <strong>{incident.affectedMerchants || 18} Live</strong></div>
            </div>
          </div>

          <div className="pt-2 border-t border-indigo-200/60 flex items-center justify-between text-[11px] font-mono text-indigo-800">
            <span>Stage Status</span>
            <span className="font-bold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" />
              Handed off to Agent 3
            </span>
          </div>
        </div>

        {/* Stage 3: Resolution Agent */}
        <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-200/80 space-y-3 relative flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold font-mono">
                  3
                </span>
                <span className="font-bold text-xs text-emerald-900 uppercase tracking-wide">
                  Resolution Agent
                </span>
              </div>
              <Badge variant="neutral" size="sm" className="bg-white border-emerald-200 text-emerald-800 font-mono">
                {resConfidence}% Conf
              </Badge>
            </div>

            <p className="text-xs text-slate-700 mt-2 leading-relaxed">
              Evaluated 4 candidate actions, formulated dynamic routing shift, enforced human approval gate.
            </p>

            <div className="mt-3 p-2.5 rounded-lg bg-white/90 border border-emerald-200/70 font-mono text-[11px] space-y-1 text-slate-600">
              <span className="text-[10px] text-emerald-700 uppercase font-bold block">
                Policy Formulation:
              </span>
              <div>• Policy: <strong>{incident.resolution?.actionType || 'DYNAMIC_REROUTE'}</strong></div>
              <div>• Target Route: <strong>{incident.resolution?.targetRoute || 'HDFC_DIRECT_V3'}</strong></div>
              <div>• Failover Route: <strong>{incident.resolution?.fallbackRoute || 'SECONDARY_ROUTER'}</strong></div>
              <div>• Reversibility: <strong className="text-emerald-700">1-Click Instant Rollback</strong></div>
            </div>
          </div>

          <div className="pt-2 border-t border-emerald-200/60 flex items-center justify-between text-[11px] font-mono text-emerald-800">
            <span>Stage Status</span>
            <span className="font-bold flex items-center gap-1">
              <Lock className="w-3.5 h-3.5 text-amber-600" />
              Dispatched to Human Gate
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
};
