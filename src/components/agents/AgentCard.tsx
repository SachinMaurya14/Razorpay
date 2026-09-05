import React from 'react';
import { AgentCardState } from '../../types';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { Bot, Cpu, Clock, CheckCircle2, AlertTriangle, Activity, ShieldAlert, Sparkles } from 'lucide-react';

interface AgentCardProps {
  agent: AgentCardState;
  onRunTest?: () => void;
  isLoading?: boolean;
}

export const AgentCard: React.FC<AgentCardProps> = ({
  agent: rawAgent,
  onRunTest,
  isLoading = false,
}) => {
  const agent: AgentCardState = rawAgent || {
    id: 'detection',
    name: 'Autonomous Agent',
    role: 'Continuous Telemetry & Anomaly Flagging',
    model: 'AI Engine',
    status: 'monitoring',
    currentTask: 'Scanning live transaction streams',
    lastAction: 'Normal baseline verification',
    confidence: 0.98,
    timestamp: new Date().toISOString(),
    executionTimeMs: 140,
  };
  const getAgentRoleDescription = (id: string) => {
    switch (id) {
      case 'detection':
        return 'Continuously analyzes multi-dimensional transaction signals (success rate, p95 latency, error code concentration) to identify deviations from rolling historical baselines and create actionable incident containers.';
      case 'investigation':
        return 'Performs cohort decomposition across banking switches, acquirer routes, merchant segments, and devices. Ranks competing root-cause hypotheses with statistical evidence matrices.';
      case 'resolution':
        return 'Synthesizes safe mitigation policies (dynamic routing failovers, circuit breakers, throttle rules). Calculates risk rating, enforces human approval, and automates closed-loop recovery verification.';
      default:
        return agent.role;
    }
  };

  const getAgentColor = (id: string) => {
    switch (id) {
      case 'detection': return 'text-cyan-600 border-cyan-200 bg-cyan-50';
      case 'investigation': return 'text-indigo-600 border-indigo-200 bg-indigo-50';
      case 'resolution': return 'text-amber-600 border-amber-200 bg-amber-50';
      default: return 'text-blue-600 border-blue-200 bg-blue-50';
    }
  };

  return (
    <Card className="p-5 sm:p-6 flex flex-col justify-between h-full bg-white border-slate-200/80 shadow-xs">
      <div>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-xl border ${getAgentColor(agent.id)}`}>
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900">
                  {agent.name}
                </h3>
              </div>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                {agent.role}
              </p>
            </div>
          </div>
          <Badge 
            variant="neutral" 
            dot 
            className={
              agent.status === 'monitoring' 
                ? 'border-emerald-200 bg-emerald-50 text-emerald-700' 
                : agent.status === 'running' 
                ? 'border-blue-200 bg-blue-50 text-blue-700' 
                : agent.status === 'approval_required'
                ? 'border-amber-200 bg-amber-50 text-amber-700'
                : 'border-slate-200 bg-slate-100 text-slate-700'
            }
          >
            {agent.status.replace('_', ' ')}
          </Badge>
        </div>

        <p className="text-xs text-slate-600 mt-4 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-200/80">
          {getAgentRoleDescription(agent.id)}
        </p>

        <div className="mt-4 space-y-2.5">
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/80">
            <span className="text-[10px] font-mono uppercase text-slate-400 tracking-wider">
              Current Active Task
            </span>
            <p className="text-xs font-semibold text-slate-800 mt-1 flex items-start gap-1.5">
              <Activity className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
              {agent.currentTask}
            </p>
          </div>

          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/80">
            <span className="text-[10px] font-mono uppercase text-slate-400 tracking-wider">
              Last Execution Record
            </span>
            <p className="text-xs text-slate-600 mt-1 font-mono">
              {agent.lastAction}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
        <div className="flex items-center gap-4 text-slate-500 font-mono">
          <div>
            <span className="text-[10px] block text-slate-400">Confidence</span>
            <strong className="text-slate-900 text-sm font-bold">
              {Math.round((agent.confidence || 0.95) * 100)}%
            </strong>
          </div>
          <div>
            <span className="text-[10px] block text-slate-400">Avg Latency</span>
            <strong className="text-slate-900 text-sm font-bold">
              {agent.executionTimeMs || 180} ms
            </strong>
          </div>
        </div>

        {onRunTest && (
          <button
            onClick={onRunTest}
            disabled={isLoading}
            className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-colors flex items-center gap-1.5 disabled:opacity-50 cursor-pointer shadow-xs"
          >
            <Cpu className="w-3.5 h-3.5" />
            {isLoading ? 'Running...' : 'Trigger Cycle'}
          </button>
        )}
      </div>
    </Card>
  );
};
