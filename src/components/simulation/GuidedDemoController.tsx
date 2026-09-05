import React, { useState, useEffect } from 'react';
import { 
  Play, 
  Pause, 
  ChevronRight, 
  ChevronLeft, 
  RotateCcw, 
  X, 
  Sparkles, 
  CheckCircle2, 
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
  Cpu,
  Layers
} from 'lucide-react';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';

export interface GuidedDemoStep {
  stepNumber: number;
  title: string;
  subtitle: string;
  explanation: string;
  targetView: 'dashboard' | 'incident' | 'traffic' | 'simulation' | 'audit';
  incidentId?: string;
  actionRequired?: string;
}

const DEMO_STEPS: GuidedDemoStep[] = [
  {
    stepNumber: 1,
    title: '1. Nominal Payment Baseline',
    subtitle: 'Healthy Autonomous Ingress Telemetry',
    explanation: 'System monitors millions of live payments in real-time. Ingress telemetry runs stably with a 93.8% success rate and <350ms average gateway latency.',
    targetView: 'dashboard',
  },
  {
    stepNumber: 2,
    title: '2. Upstream Banking Degradation',
    subtitle: 'Simulating Real-World Outage',
    explanation: 'An upstream partner (HDFC UPI gateway) begins experiencing packet drops and timeout spikes. Success rate in that cohort plunges to 49.6%.',
    targetView: 'simulation',
  },
  {
    stepNumber: 3,
    title: '3. Detection Agent',
    subtitle: 'Statistical 3σ Threshold Tripping',
    explanation: 'The Detection Agent analyzes 15-minute sliding windows, isolates a -43.8 pp delta vs baseline, and triggers an incident container with high confidence.',
    targetView: 'dashboard',
  },
  {
    stepNumber: 4,
    title: '4. Executive Narrative & Financial Exposure',
    subtitle: 'Deterministic Business Impact',
    explanation: 'The system computes Revenue At Risk across affected merchants, answering all 8 executive operational questions immediately.',
    targetView: 'incident',
  },
  {
    stepNumber: 5,
    title: '5. Multi-Cohort Investigation Agent',
    subtitle: '7-Dimension Telemetry Segmentation',
    explanation: 'Investigation Agent checks Bank, Payment Method, Route, Region, Device, and Error Codes to prove failure is isolated exclusively to degraded routes.',
    targetView: 'incident',
  },
  {
    stepNumber: 6,
    title: '6. Root Cause Isolation & Evidence Matrix',
    subtitle: 'Hypothesis Elimination & Telemetry Proof',
    explanation: 'The agent rejects merchant integration bugs or client-side regressions, confirming the root cause is upstream BANK_GATEWAY_TIMEOUT.',
    targetView: 'incident',
  },
  {
    stepNumber: 7,
    title: '7. Resolution Decision Matrix',
    subtitle: 'Policy Evaluation & Tradeoff Scoring',
    explanation: 'Resolution Agent compares 4 candidate policies (Reroute vs Circuit Breaker vs Advisory vs Passive). It selects Dynamic Acquirer Reroute as optimal.',
    targetView: 'incident',
  },
  {
    stepNumber: 8,
    title: '8. Human-in-the-Loop Approval Gate',
    subtitle: 'Mandatory SRE Governance',
    explanation: 'Financial mutations strictly require operator sign-off. The SRE reviews risk rating, reversibility (1-click rollback), and authorizes the reroute.',
    targetView: 'incident',
  },
  {
    stepNumber: 9,
    title: '9. Executing Simulated Mitigation',
    subtitle: 'Dynamic Traffic Failover',
    explanation: 'The simulation immediately shifts transactions away from the degraded route to the verified secondary smart router pipe.',
    targetView: 'incident',
  },
  {
    stepNumber: 10,
    title: '10. Recovery Verification & SLA Restoral',
    subtitle: 'Post-Mitigation Telemetry Validation',
    explanation: 'Live verification stream measures the recovered success rate rising above 93%, successfully protecting merchant revenue.',
    targetView: 'incident',
  },
  {
    stepNumber: 11,
    title: '11. Immutable Audit Trail & Rollback',
    subtitle: 'Complete Operational Governance',
    explanation: 'All telemetry changes, agent reasoning tokens, operator sign-offs, and rollback options are immutably logged in the audit ledger.',
    targetView: 'audit',
  },
];

interface GuidedDemoControllerProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (view: 'dashboard' | 'incident' | 'traffic' | 'simulation' | 'audit', incidentId?: string) => void;
  activeIncidentId?: string;
}

export const GuidedDemoController: React.FC<GuidedDemoControllerProps> = ({
  isOpen,
  onClose,
  onNavigate,
  activeIncidentId,
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const currentStep = DEMO_STEPS[currentStepIndex];

  // Auto-navigate when step changes
  useEffect(() => {
    if (isOpen && currentStep) {
      onNavigate(currentStep.targetView, activeIncidentId || currentStep.incidentId);
    }
  }, [currentStepIndex, isOpen, activeIncidentId]);

  // Auto-play timer
  useEffect(() => {
    let interval: any;
    if (isPlaying && isOpen) {
      interval = setInterval(() => {
        setCurrentStepIndex((prev) => {
          if (prev >= DEMO_STEPS.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, 7000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, isOpen]);

  if (!isOpen) return null;

  const handleNext = () => {
    if (currentStepIndex < DEMO_STEPS.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    }
  };

  const handlePrev = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
  };

  const handleRestart = () => {
    setCurrentStepIndex(0);
    setIsPlaying(false);
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 w-full max-w-lg animate-in slide-in-from-bottom-5 duration-200">
      <div className="bg-slate-900 text-white rounded-2xl shadow-2xl border border-slate-700/80 p-5 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-blue-500/20 text-blue-400 border border-blue-500/30">
              <Sparkles className="w-4 h-4" />
            </span>
            <div>
              <h4 className="text-xs font-bold font-mono tracking-wider uppercase text-blue-400">
                Guided Product Tour ({currentStepIndex + 1}/{DEMO_STEPS.length})
              </h4>
              <span className="text-[11px] text-slate-400">Judge-Ready 11-Step Payment Operations Workflow</span>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors text-xs flex items-center gap-1 cursor-pointer"
              title={isPlaying ? 'Pause auto-play' : 'Start auto-play (7s/step)'}
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 text-emerald-400" />}
              <span className="text-[10px] font-mono">{isPlaying ? 'Pause' : 'Play'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Step Content */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              {currentStep.title}
            </h3>
            <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-blue-900/60 border border-blue-700/50 text-blue-300">
              View: {currentStep.targetView.toUpperCase()}
            </span>
          </div>
          <p className="text-xs text-blue-300 font-medium">
            {currentStep.subtitle}
          </p>
          <p className="text-xs text-slate-300 leading-relaxed pt-1">
            {currentStep.explanation}
          </p>
        </div>

        {/* Step Progress Bar */}
        <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden flex gap-0.5">
          {DEMO_STEPS.map((_, idx) => (
            <div
              key={idx}
              onClick={() => setCurrentStepIndex(idx)}
              className={`h-full flex-1 cursor-pointer transition-all ${
                idx === currentStepIndex
                  ? 'bg-blue-500'
                  : idx < currentStepIndex
                  ? 'bg-emerald-500'
                  : 'bg-slate-700'
              }`}
            />
          ))}
        </div>

        {/* Action Controls */}
        <div className="flex items-center justify-between pt-1 text-xs">
          <button
            onClick={handleRestart}
            className="text-slate-400 hover:text-slate-200 flex items-center gap-1 font-mono text-[11px] cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            Restart Tour
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrev}
              disabled={currentStepIndex === 0}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1 cursor-pointer"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              Prev
            </button>

            <button
              onClick={handleNext}
              disabled={currentStepIndex === DEMO_STEPS.length - 1}
              className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1 cursor-pointer shadow-xs"
            >
              Next Step
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
