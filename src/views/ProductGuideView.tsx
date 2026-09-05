import React from 'react';
import { Card } from '../components/common/Card';
import { 
  HelpCircle, 
  Bot, 
  Eye, 
  Search, 
  ShieldCheck, 
  CheckCircle2, 
  Zap, 
  ShieldAlert, 
  Play, 
  ArrowRight,
  Database,
  Lock
} from 'lucide-react';

interface ProductGuideViewProps {
  onRunDemo: () => void;
}

export const ProductGuideView: React.FC<ProductGuideViewProps> = ({ onRunDemo }) => {
  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Hero Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-blue-50 via-white to-indigo-50/50 border border-blue-100 shadow-xs">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs font-mono uppercase px-2 py-0.5 rounded bg-blue-100 text-blue-800 border border-blue-200">
            Reviewer Architecture Guide
          </span>
          <span className="text-xs text-slate-500 font-mono">
            Razorpay v1.0
          </span>
        </div>

        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          How the 3-Agent Payment Revenue Recovery Engine Works
        </h2>
        <p className="text-sm text-slate-600 mt-2 max-w-3xl leading-relaxed">
          When payment performance deteriorates across banking gateways, operations teams need to quantify revenue exposure, identify the root cause, qualify recoverable payments, and execute safe recovery strategies.
        </p>

        <div className="mt-5">
          <button
            onClick={onRunDemo}
            className="px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-2 cursor-pointer"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>Launch Live 3-Agent Incident Simulation</span>
          </button>
        </div>
      </div>

      {/* 8-Stage Revenue Recovery Flow */}
      <Card className="p-6 bg-white border-slate-200/80 shadow-xs">
        <h3 className="text-base font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          The Payment Revenue Recovery Lifecycle
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <span className="text-xs font-mono font-bold text-rose-600 block">
              01. Payment Degradation
            </span>
            <h4 className="text-sm font-bold text-slate-900">
              Telemetry Anomaly Emerges
            </h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Upstream banking timeout causes sudden 43.8% success rate drop on HDFC UPI direct route during peak hour.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <span className="text-xs font-mono font-bold text-cyan-600 block">
              02. Detection Agent
            </span>
            <h4 className="text-sm font-bold text-slate-900">
              Flags Anomaly & Signals
            </h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Calculates rolling baseline deviation, isolates affected segments, and instantiates Incident Container.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <span className="text-xs font-mono font-bold text-indigo-600 block">
              03. Investigation Agent
            </span>
            <h4 className="text-sm font-bold text-slate-900">
              Mathematical Attribution
            </h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Compares affected cohorts vs unaffected routes, compiles Evidence Matrix, and ranks root-cause hypotheses.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <span className="text-xs font-mono font-bold text-blue-600 block">
              04. Recoverability Assessment
            </span>
            <h4 className="text-sm font-bold text-slate-900">
              Cohort Eligibility & Risk
            </h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Deterministically filters recoverable vs unrecoverable error cohorts; qualifies revenue at risk before proposing interventions.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <span className="text-xs font-mono font-bold text-amber-600 block">
              05. Resolution Agent
            </span>
            <h4 className="text-sm font-bold text-slate-900">
              Synthesizes Safe Mitigation
            </h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Formulates counterfactual candidate strategies ranked by expected recovery, validates policy constraints, and models blast radius.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <span className="text-xs font-mono font-bold text-amber-700 block">
              06. Human Governance
            </span>
            <h4 className="text-sm font-bold text-slate-900">
              Authorizes Financial Change
            </h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Human-in-the-Loop review verifies safety guardrails before deploying routing updates to live simulation.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <span className="text-xs font-mono font-bold text-emerald-600 block">
              07. Recovery Execution
            </span>
            <h4 className="text-sm font-bold text-slate-900">
              Dynamic Route Shift
            </h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Executes scoped traffic reroute to verified secondary acquirer with stopping rules and 1-click rollback capability.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <span className="text-xs font-mono font-bold text-emerald-700 block">
              08. Closed-Loop Verification
            </span>
            <h4 className="text-sm font-bold text-slate-900">
              Verifies Revenue Recovery
            </h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              System generates post-mitigation telemetry stream, confirms 93.4% success recovery, and measures verified recovered revenue.
            </p>
          </div>
        </div>
      </Card>

      {/* Core Engineering Disciplines */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-5 bg-white border-slate-200/80 shadow-xs space-y-3">
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-blue-600" />
            <h4 className="text-sm font-bold text-slate-900">
              Deterministic Layer vs AI Reasoning
            </h4>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            The deterministic layer handles transaction telemetry, cohort aggregation, financial calculations (revenue at risk, recoverable revenue), recovery rules, policy checks, state transitions, execution, and verification. The AI reasoning layer handles qualitative reasoning, root-cause explanation, counterfactual hypothesis evaluation, strategy recommendations, and natural language summaries.
          </p>
        </Card>

        <Card className="p-5 bg-white border-slate-200/80 shadow-xs space-y-3">
          <div className="flex items-center gap-2">
            <Lock className="w-5 h-5 text-emerald-600" />
            <h4 className="text-sm font-bold text-slate-900">
              Server-Side AI Governance
            </h4>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            API keys are managed server-side. Agent decisions, policy checks and human approvals are recorded in the application audit trail.
          </p>
        </Card>
      </div>
    </div>
  );
};
