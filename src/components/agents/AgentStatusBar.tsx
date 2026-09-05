import React from 'react';
import { AgentCardState } from '../../types';
import { Card } from '../common/Card';
import { Eye, Search, ShieldCheck, ArrowRight, CheckCircle2, AlertTriangle, Loader2 } from 'lucide-react';

interface AgentStatusBarProps {
  agents: Record<string, AgentCardState>;
  onSelectAgent?: (id: 'detection' | 'investigation' | 'resolution') => void;
  className?: string;
}

export const AgentStatusBar: React.FC<AgentStatusBarProps> = ({
  agents,
  onSelectAgent,
  className = '',
}) => {
  const getStatusBadge = (status: AgentCardState['status']) => {
    switch (status) {
      case 'monitoring':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            MONITORING
          </span>
        );
      case 'running':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-500/15 text-blue-300 border border-blue-500/30">
            <Loader2 className="w-3 h-3 animate-spin text-blue-400" />
            ACTIVE
          </span>
        );
      case 'approval_required':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30 animate-pulse">
            <AlertTriangle className="w-3 h-3 text-amber-400" />
            APPROVAL REQ.
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
            <CheckCircle2 className="w-3 h-3 text-indigo-400" />
            COMPLETED
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-slate-800 text-slate-400 border border-slate-700">
            IDLE
          </span>
        );
    }
  };

  const agentConfigs = [
    {
      key: 'detection' as const,
      name: 'Detection Agent',
      stepNumber: '01',
      icon: <Eye className="w-4 h-4 text-cyan-400" />,
      tag: 'TELEMETRY STREAM',
      agent: agents.detection || {
        status: 'monitoring',
        currentTask: 'Scanning incoming transaction stream',
        confidence: 0.98,
        model: 'Structured AI',
      },
    },
    {
      key: 'investigation' as const,
      name: 'Investigation Agent',
      stepNumber: '02',
      icon: <Search className="w-4 h-4 text-indigo-400" />,
      tag: 'ROOT CAUSE ATTRIBUTION',
      agent: agents.investigation || {
        status: 'idle',
        currentTask: 'Standing by for anomaly handoff',
        confidence: 0.95,
        model: 'Structured AI',
      },
    },
    {
      key: 'resolution' as const,
      name: 'Resolution Agent',
      stepNumber: '03',
      icon: <ShieldCheck className="w-4 h-4 text-amber-400" />,
      tag: 'SAFE MITIGATION & POLICY',
      agent: agents.resolution || {
        status: 'idle',
        currentTask: 'Policy validation ready',
        confidence: 0.95,
        model: 'Structured AI',
      },
    },
  ];

  return (
    <Card className={`p-4 sm:p-5 bg-white border-slate-200/80 shadow-xs ${className}`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 mb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-blue-600 animate-ping" />
          <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Cooperating AI Agent Pipeline
          </h4>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200 font-semibold">
            3-Agent Orchestration • Structured AI Reasoning
          </span>
        </div>
        <span className="text-[11px] text-slate-500">
          Continuous Closed-Loop Response Engine
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 relative">
        {agentConfigs.map((config, index) => {
          const isLast = index === agentConfigs.length - 1;
          const agent = config.agent;

          return (
            <div key={config.key} className="relative group">
              <div 
                onClick={() => onSelectAgent?.(config.key)}
                className={`p-3.5 rounded-lg border transition-all cursor-pointer ${
                  agent.status === 'running'
                    ? 'bg-blue-50/50 border-blue-300 ring-1 ring-blue-500/20'
                    : agent.status === 'approval_required'
                    ? 'bg-amber-50/50 border-amber-300 ring-1 ring-amber-500/20'
                    : 'bg-slate-50/60 border-slate-200/80 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-white border border-slate-200 text-blue-600 shadow-xs">
                      {config.icon}
                    </div>
                    <div>
                      <span className="text-[10px] font-mono text-slate-400 tracking-wider">
                        AGENT {config.stepNumber}
                      </span>
                      <h5 className="text-sm font-bold text-slate-900 leading-tight">
                        {config.name}
                      </h5>
                    </div>
                  </div>
                  {getStatusBadge(agent.status)}
                </div>

                <div className="mt-2.5">
                  <p className="text-xs text-slate-600 line-clamp-1 font-medium">
                    {agent.currentTask}
                  </p>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] font-mono text-slate-500">
                  <span>Confidence: <strong className="text-slate-800">{Math.round((agent.confidence || 0.95) * 100)}%</strong></span>
                  <span className="text-blue-600 font-sans text-xs font-semibold flex items-center gap-1 group-hover:underline">
                    Inspect
                    <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </div>

              {!isLast && (
                <div className="hidden md:flex absolute -right-3 top-1/2 -translate-y-1/2 z-10 w-6 h-6 rounded-full bg-white border border-slate-200 items-center justify-center text-slate-400 shadow-xs">
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );
};
