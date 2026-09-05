import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  X, 
  CheckCircle2, 
  Sparkles, 
  ShieldAlert, 
  ArrowRight, 
  Zap, 
  TrendingUp, 
  Lock, 
  Activity,
  Layers,
  ChevronRight
} from 'lucide-react';
import { api } from '../../lib/api';
import { Incident } from '../../types';
import confetti from 'canvas-confetti';

interface JudgeDemoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateView?: (view: 'overview' | 'incidents' | 'incident-detail' | 'batches' | 'command-center' | 'analytics' | 'audit' | 'guide', incidentId?: string) => void;
  onNavigate?: (view: 'overview' | 'incidents' | 'incident-detail' | 'batches' | 'command-center' | 'analytics' | 'audit' | 'guide', incidentId?: string) => void;
  onRefreshData?: () => Promise<void> | void;
}

export interface DemoPhase {
  phaseNumber: number;
  timeRange: string;
  title: string;
  description: string;
  agentResponsible: string;
  targetView: 'overview' | 'incidents' | 'incident-detail' | 'batches' | 'command-center' | 'analytics' | 'audit';
  executeAction?: () => Promise<void>;
}

export const JudgeDemoModal: React.FC<JudgeDemoModalProps> = ({
  isOpen,
  onClose,
  onNavigateView,
  onNavigate,
  onRefreshData,
}) => {
  const [currentPhaseIndex, setCurrentPhaseIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [activeDemoIncident, setActiveDemoIncident] = useState<Incident | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [isExecutingPhase, setIsExecutingPhase] = useState<boolean>(false);

  const timerRef = useRef<any>(null);
  const activeIncidentRef = useRef<Incident | null>(null);

  const safeRefresh = async () => {
    try {
      if (typeof onRefreshData === 'function') {
        await onRefreshData();
      }
    } catch (e) {
      console.warn('Refresh notice:', e);
    }
  };

  const safeNavigate = (view: any, incidentId?: string) => {
    try {
      if (typeof onNavigateView === 'function') {
        onNavigateView(view, incidentId);
      } else if (typeof onNavigate === 'function') {
        onNavigate(view, incidentId);
      }
    } catch (e) {
      console.warn('Navigation notice:', e);
    }
  };

  const PHASES: DemoPhase[] = [
    {
      phaseNumber: 1,
      timeRange: '0–10s',
      title: 'Nominal Baseline Telemetry',
      description: 'System processes live synthetic transactions across all banking gateways (HDFC, ICICI, SBI, Axis). Baseline health is healthy at 93.4% success rate with <380ms latency.',
      agentResponsible: 'System Ingress',
      targetView: 'overview',
    },
    {
      phaseNumber: 2,
      timeRange: '10–20s',
      title: 'Payment Degradation Commences',
      description: 'Upstream banking partner switch begins encountering timeout spikes and 504 packet drops. Success rate starts sharply dropping from 93% to ~49%.',
      agentResponsible: 'Upstream Switch Ingress',
      targetView: 'overview',
    },
    {
      phaseNumber: 3,
      timeRange: '20–30s',
      title: 'Detection Agent Flags Anomaly',
      description: 'Detection Agent identifies statistical 3σ threshold breach, computes rolling deviation, and creates Incident container with initial confidence score.',
      agentResponsible: 'Detection Agent',
      targetView: 'command-center',
    },
    {
      phaseNumber: 4,
      timeRange: '30–40s',
      title: 'Revenue At Risk Quantified',
      description: 'Deterministic monetary layer aggregates impacted transactions, establishing ₹8,45,000 Revenue At Risk across 18 live enterprise merchants.',
      agentResponsible: 'Detection / Financial Engine',
      targetView: 'incident-detail',
    },
    {
      phaseNumber: 5,
      timeRange: '40–50s',
      title: 'Investigation Agent Isolates Root Cause',
      description: 'Compares failing vs unaffected cohorts across 7 dimensions (Bank, Method, Route, Region, Device, Merchant, Error Code) and eliminates secondary hypotheses.',
      agentResponsible: 'Investigation Agent',
      targetView: 'incident-detail',
    },
    {
      phaseNumber: 6,
      timeRange: '50–60s',
      title: 'Recoverability Cohorts Qualified',
      description: 'Segments affected transactions into Cohort A (Gateway Timeout - Recoverable), Cohort B (Switch Congestion - Possibly Recoverable), and Cohort C (Customer PIN/Dropout - Non-Recoverable).',
      agentResponsible: 'Recoverability Engine',
      targetView: 'batches',
    },
    {
      phaseNumber: 7,
      timeRange: '60–70s',
      title: 'Resolution Agent Selects Strategy',
      description: 'Evaluates candidate mitigation options and selects Dynamic Route Failover to secondary Razorpay Smart Router with temporary circuit breaker.',
      agentResponsible: 'Resolution Agent',
      targetView: 'incident-detail',
    },
    {
      phaseNumber: 8,
      timeRange: '70–75s',
      title: 'Policy Validation & Human Approval',
      description: 'Deterministic Policy Engine checks Idempotency (POL-IDEMP-01) and maximum retries. High-impact route change is paused for operator authorization.',
      agentResponsible: 'Policy Engine & Human Operator',
      targetView: 'incident-detail',
    },
    {
      phaseNumber: 9,
      timeRange: '75–85s',
      title: 'Live Recovery Execution',
      description: 'Human approval is granted. Live routing rules update instantaneously. Live transaction stream is diverted to healthy backup router pipe.',
      agentResponsible: 'Resolution Agent & Execution Router',
      targetView: 'incident-detail',
    },
    {
      phaseNumber: 10,
      timeRange: '85–90s',
      title: 'Measured Revenue Recovered & Verified',
      description: 'Post-mitigation telemetry verifies success rate restored to 95.2%. The system measures ₹7,96,000 in actual revenue recovered and generates closed-loop proof.',
      agentResponsible: 'Verification Engine',
      targetView: 'incident-detail',
    }
  ];

  // Run the appropriate server action when moving between phases
  const runPhaseAction = async (phaseIndex: number) => {
    setIsExecutingPhase(true);
    try {
      if (phaseIndex === 0) {
        // Reset to healthy baseline
        await api.resetSimulation();
        await safeRefresh();
        safeNavigate('overview');
      } else if (phaseIndex === 1) {
        // Trigger degradation
        await api.triggerScenario('hdfc_upi_degradation');
        await safeRefresh();
        safeNavigate('overview');
      } else if (phaseIndex === 2 || phaseIndex === 3) {
        // Run agent workflow to create incident
        const result = await api.runDemoIncident('hdfc_upi_degradation');
        setActiveDemoIncident(result.incident);
        activeIncidentRef.current = result.incident;
        await safeRefresh();
        if (phaseIndex === 2) {
          safeNavigate('command-center');
        } else {
          safeNavigate('incident-detail', result.incident.id);
        }
      } else if (phaseIndex === 4) {
        // Show investigation & root cause
        const incident = activeIncidentRef.current || activeDemoIncident;
        if (incident) {
          safeNavigate('incident-detail', incident.id);
        }
      } else if (phaseIndex === 5) {
        // Show batches & cohorts
        safeNavigate('batches');
      } else if (phaseIndex === 6 || phaseIndex === 7) {
        // Resolution & Approval
        const incident = activeIncidentRef.current || activeDemoIncident;
        if (incident) {
          safeNavigate('incident-detail', incident.id);
        }
      } else if (phaseIndex === 8) {
        // Human Approval & Execution
        const incident = activeIncidentRef.current || activeDemoIncident;
        if (incident) {
          await api.approveMitigation(incident.id, true, 'Approved dynamic acquirer failover during Judge Demo.');
          await api.executeMitigation(incident.id);
          await safeRefresh();
          safeNavigate('incident-detail', incident.id);
        }
      } else if (phaseIndex === 9) {
        // Verify Recovery
        const incident = activeIncidentRef.current || activeDemoIncident;
        if (incident) {
          await api.verifyRecovery(incident.id);
          await safeRefresh();
          safeNavigate('incident-detail', incident.id);
          try {
            confetti({
              particleCount: 90,
              spread: 80,
              origin: { y: 0.6 },
              colors: ['#3b82f6', '#10b981', '#6366f1'],
            });
          } catch (e) {
            // fallback
          }
        }
      }
    } catch (err) {
      console.warn('Phase execution notice:', err);
    } finally {
      setIsExecutingPhase(false);
    }
  };

  // Pure timer interval: strictly increments elapsedSeconds
  useEffect(() => {
    if (!isPlaying || !isOpen) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, isOpen]);

  // Phase transition effect: triggers side-effects cleanly outside of render cycles
  useEffect(() => {
    if (!isPlaying || !isOpen) return;

    const targetPhase = Math.min(9, Math.floor(elapsedSeconds / 9));
    if (targetPhase !== currentPhaseIndex) {
      setCurrentPhaseIndex(targetPhase);
      runPhaseAction(targetPhase);
    }
    if (elapsedSeconds >= 90) {
      setIsPlaying(false);
    }
  }, [elapsedSeconds, isPlaying, isOpen, currentPhaseIndex]);

  if (!isOpen) return null;

  const currentPhase = PHASES[currentPhaseIndex];

  const handleStartOrPause = () => {
    if (!isPlaying && currentPhaseIndex === 0 && elapsedSeconds === 0) {
      runPhaseAction(0);
    }
    setIsPlaying(!isPlaying);
  };

  const handleNextPhase = () => {
    if (currentPhaseIndex < PHASES.length - 1) {
      const nextIdx = currentPhaseIndex + 1;
      setCurrentPhaseIndex(nextIdx);
      setElapsedSeconds(nextIdx * 9);
      runPhaseAction(nextIdx);
    }
  };

  const handlePrevPhase = () => {
    if (currentPhaseIndex > 0) {
      const prevIdx = currentPhaseIndex - 1;
      setCurrentPhaseIndex(prevIdx);
      setElapsedSeconds(prevIdx * 9);
      runPhaseAction(prevIdx);
    }
  };

  const handleReset = async () => {
    setIsPlaying(false);
    setCurrentPhaseIndex(0);
    setElapsedSeconds(0);
    activeIncidentRef.current = null;
    setActiveDemoIncident(null);
    await api.resetSimulation();
    await safeRefresh();
    safeNavigate('overview');
  };

  return (
    <div className="fixed inset-x-4 bottom-4 z-50 max-w-4xl mx-auto animate-in slide-in-from-bottom-6 duration-200">
      <div className="bg-slate-950 text-white rounded-2xl shadow-2xl border border-blue-500/40 p-4 sm:p-5 space-y-4 backdrop-blur-xl">
        {/* Top bar with timer & controls */}
        <div className="flex items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <span className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-mono font-extrabold text-xs shadow-xs">
              90s
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-bold text-white tracking-tight flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-blue-400" />
                  Judge Walkthrough Controller
                </h4>
                <span className="px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 font-mono text-[10px] font-bold border border-blue-500/30">
                  Real State Machine
                </span>
              </div>
              <span className="text-[11px] text-slate-400 font-mono">
                Phase {currentPhase.phaseNumber} of 10 • Elapsed: {elapsedSeconds}s / 90s
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleStartOrPause}
              disabled={isExecutingPhase}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs ${
                isPlaying
                  ? 'bg-amber-600 hover:bg-amber-700 text-white'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              {isPlaying ? (
                <>
                  <Pause className="w-3.5 h-3.5 fill-current" />
                  <span>Pause Demo</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>{elapsedSeconds > 0 ? 'Resume Demo' : 'Start 90s Demo'}</span>
                </>
              )}
            </button>

            <button
              onClick={handleReset}
              disabled={isExecutingPhase}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
              title="Reset Demo to 0s baseline"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
              title="Close Judge Demo banner"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Phase Progress Steps */}
        <div className="grid grid-cols-5 sm:grid-cols-10 gap-1.5">
          {PHASES.map((p, idx) => {
            const isActive = idx === currentPhaseIndex;
            const isPassed = idx < currentPhaseIndex;
            return (
              <button
                key={p.phaseNumber}
                onClick={() => {
                  setCurrentPhaseIndex(idx);
                  setElapsedSeconds(idx * 9);
                  runPhaseAction(idx);
                }}
                className={`h-2 rounded-full transition-all cursor-pointer ${
                  isActive
                    ? 'bg-blue-500 ring-2 ring-blue-400/50 shadow-xs'
                    : isPassed
                    ? 'bg-emerald-500'
                    : 'bg-slate-800 hover:bg-slate-700'
                }`}
                title={`Step ${p.phaseNumber}: ${p.title} (${p.timeRange})`}
              />
            );
          })}
        </div>

        {/* Current Active Phase Description Card */}
        <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 font-mono text-[10px] font-bold">
                {currentPhase.timeRange}
              </span>
              <span className="text-xs font-bold text-white">
                {currentPhase.title}
              </span>
              <span className="text-[11px] font-mono text-slate-400">
                • {currentPhase.agentResponsible}
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              {currentPhase.description}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
            <button
              onClick={handlePrevPhase}
              disabled={currentPhaseIndex === 0 || isExecutingPhase}
              className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 disabled:opacity-40 cursor-pointer"
            >
              Prev
            </button>
            <button
              onClick={handleNextPhase}
              disabled={currentPhaseIndex === PHASES.length - 1 || isExecutingPhase}
              className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 disabled:opacity-40 flex items-center gap-1 cursor-pointer"
            >
              <span>Next</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
