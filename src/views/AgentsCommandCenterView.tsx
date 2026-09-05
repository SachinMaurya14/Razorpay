import React, { useState } from 'react';
import { AgentCardState } from '../types';
import { AgentCard } from '../components/agents/AgentCard';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { 
  Bot, 
  Cpu, 
  Sparkles, 
  Terminal, 
  Play, 
  RefreshCw, 
  ShieldCheck, 
  HelpCircle,
  Eye,
  Search,
  CheckCircle2,
  Activity
} from 'lucide-react';

interface AgentsCommandCenterViewProps {
  agents: Record<string, AgentCardState>;
  onRunWorkflowDemo: () => void;
  onNavigateToPerformance?: () => void;
  isProcessing?: boolean;
}

export const AgentsCommandCenterView: React.FC<AgentsCommandCenterViewProps> = ({
  agents,
  onRunWorkflowDemo,
  onNavigateToPerformance,
  isProcessing = false,
}) => {
  const [selectedAgentForPrompt, setSelectedAgentForPrompt] = useState<'detection' | 'investigation' | 'resolution' | null>(null);

  const getSystemPrompt = (id: 'detection' | 'investigation' | 'resolution') => {
    switch (id) {
      case 'detection':
        return `ROLE: Detection Agent for Razorpay Payment Infrastructure.
OBJECTIVE: Analyze incoming transaction batches (15m sliding window).
INPUT SCHEMA:
  - Telemetry: success_rate, p95_latency_ms, error_code_distribution, segmented by bank & route.
  - Baselines: rolling 7-day average per route.
TASK:
  1. Calculate mathematical deviations from baseline.
  2. If delta > 15% drop in success rate OR p95 latency > 2500ms, flag an anomaly.
  3. Formulate structured DetectionOutput with incident title, severity, confidence, and signals.
OUTPUT FORMAT: Strict JSON adhering to DetectionOutput schema.`;

      case 'investigation':
        return `ROLE: Investigation Agent for Razorpay Payment Infrastructure.
OBJECTIVE: Attribute exact root cause for flagged anomalies.
INPUT SCHEMA:
  - Incident context from Detection Agent.
  - Cohort comparison matrices across banking switches, merchants, devices.
TASK:
  1. Isolate blast radius (single bank vs common network vs merchant SDK).
  2. Rank competing hypotheses with probability scores.
  3. Compile mathematical evidence items with baseline vs observed deltas.
OUTPUT FORMAT: Strict JSON adhering to InvestigationOutput schema.`;

      case 'resolution':
        return `ROLE: Resolution Agent for Razorpay Payment Infrastructure.
OBJECTIVE: Synthesize zero-downtime mitigation strategy.
INPUT SCHEMA:
  - Confirmed root cause & evidence from Investigation Agent.
  - Available fallback routing tables and circuit breakers.
TASK:
  1. Propose dynamic acquirer reroute or traffic throttle.
  2. Compute risk classification (high/medium/low).
  3. Formulate human approval requisition if financial routing is modified.
OUTPUT FORMAT: Strict JSON adhering to ResolutionOutput schema.`;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Bot className="w-5 h-5 text-blue-600" />
            AI Agent Command Center & Runtime Orchestration
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Real-time control plane for the 3 cooperating agents with structured JSON schemas and bounded policy execution.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          {onNavigateToPerformance && (
            <button
              onClick={onNavigateToPerformance}
              className="px-3 py-2 rounded-lg bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Activity className="w-3.5 h-3.5 text-blue-600" />
              Agent Performance (D3)
            </button>
          )}

          <button
            onClick={onRunWorkflowDemo}
            disabled={isProcessing}
            className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            Trigger 3-Agent Response Cycle
          </button>
        </div>
      </div>

      {/* Agents 3-Card Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="flex flex-col space-y-3">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-mono uppercase text-cyan-600 font-bold">
              Agent 01 • Telemetry
            </span>
            <button
              onClick={() => setSelectedAgentForPrompt('detection')}
              className="text-[11px] text-blue-600 hover:underline flex items-center gap-1 font-mono cursor-pointer"
            >
              <Terminal className="w-3 h-3" />
              Prompt Spec
            </button>
          </div>
          <div className="flex-1">
            <AgentCard agent={agents.detection} onRunTest={onRunWorkflowDemo} isLoading={isProcessing} />
          </div>
        </div>

        <div className="flex flex-col space-y-3">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-mono uppercase text-indigo-600 font-bold">
              Agent 02 • Attribution
            </span>
            <button
              onClick={() => setSelectedAgentForPrompt('investigation')}
              className="text-[11px] text-blue-600 hover:underline flex items-center gap-1 font-mono cursor-pointer"
            >
              <Terminal className="w-3 h-3" />
              Prompt Spec
            </button>
          </div>
          <div className="flex-1">
            <AgentCard agent={agents.investigation} onRunTest={onRunWorkflowDemo} isLoading={isProcessing} />
          </div>
        </div>

        <div className="flex flex-col space-y-3">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-mono uppercase text-amber-600 font-bold">
              Agent 03 • Mitigation
            </span>
            <button
              onClick={() => setSelectedAgentForPrompt('resolution')}
              className="text-[11px] text-blue-600 hover:underline flex items-center gap-1 font-mono cursor-pointer"
            >
              <Terminal className="w-3 h-3" />
              Prompt Spec
            </button>
          </div>
          <div className="flex-1">
            <AgentCard agent={agents.resolution} onRunTest={onRunWorkflowDemo} isLoading={isProcessing} />
          </div>
        </div>
      </div>

      {/* Architecture & Prompt Schema Modal */}
      {selectedAgentForPrompt && (
        <Modal
          isOpen={Boolean(selectedAgentForPrompt)}
          onClose={() => setSelectedAgentForPrompt(null)}
          title={`Agent Specification: ${(selectedAgentForPrompt || '').toUpperCase()} AGENT`}
          subtitle="System Prompt Spec & Strict JSON Schema Enforcement"
          maxWidth="2xl"
        >
          <div className="space-y-3 font-mono text-xs">
            <div className="p-4 rounded-lg bg-slate-900 border border-slate-800 text-slate-200 whitespace-pre-wrap leading-relaxed shadow-inner">
              {getSystemPrompt(selectedAgentForPrompt)}
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
