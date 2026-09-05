import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { SimulationScenarioId, Incident } from '../../types';
import { 
  Zap, 
  Play, 
  RotateCcw, 
  AlertTriangle, 
  ShieldAlert, 
  Cpu, 
  CheckCircle2, 
  Loader2, 
  Lock, 
  Sparkles,
  Layers,
  ArrowRight
} from 'lucide-react';
import { api } from '../../lib/api';

interface SimulationControlModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeScenario: SimulationScenarioId;
  onTriggerScenario: (scenario: SimulationScenarioId) => Promise<void>;
  onRunWorkflowDemo: (scenario: SimulationScenarioId) => Promise<void>;
  onResetSimulation: () => Promise<void>;
  onSelectIncident?: (incidentId: string) => void;
  isProcessing?: boolean;
}

export const SimulationControlModal: React.FC<SimulationControlModalProps> = ({
  isOpen,
  onClose,
  activeScenario,
  onTriggerScenario,
  onRunWorkflowDemo,
  onResetSimulation,
  onSelectIncident,
  isProcessing = false,
}) => {
  const [activeTab, setActiveTab] = useState<'scenarios' | 'seeds'>('seeds');
  const [selectedScenario, setSelectedScenario] = useState<SimulationScenarioId>('hdfc_upi_degradation');
  const [selectedSeed, setSelectedSeed] = useState<'SEED_A' | 'SEED_B' | 'SEED_C' | 'SEED_D' | 'SEED_E'>('SEED_A');
  const [isSeeding, setIsSeeding] = useState(false);

  const DEMO_SEEDS = [
    {
      key: 'SEED_A' as const,
      badge: 'Seed A: High Recovery',
      title: 'HDFC UPI Route Failure (94.2% Recovery)',
      description: 'Upstream HDFC switch encounters 504 timeouts. Detection triggers incident, Investigation isolates route, Resolution selects dynamic smart reroute, verified with 94.2% recovery.',
      outcome: '₹7.96 Lakhs Recovered (94.2%)',
      status: 'VERIFIED',
      accent: 'border-emerald-200 bg-emerald-50/40 text-emerald-900',
    },
    {
      key: 'SEED_B' as const,
      badge: 'Seed B: Partial Recovery',
      title: 'Axis Card Gateway Contention (58.1% Recovery)',
      description: 'Acquirer queue saturation with 4xx terminal issuer rejects. System recovers 180 transient timeouts (₹3.60L) and safely halts remaining 130 terminal errors per policy.',
      outcome: '₹3.60 Lakhs Recovered (58.1%) • 130 Stopped',
      status: 'PARTIAL',
      accent: 'border-amber-200 bg-amber-50/40 text-amber-900',
    },
    {
      key: 'SEED_C' as const,
      badge: 'Seed C: Low Recovery',
      title: 'Hard Core Switch Outage & Account Declines (18.2% Recovery)',
      description: 'Massive auth decline wave. 81.7% are terminal customer account declines (insufficient funds, expired card). Recovers ₹2.10L transient timeouts, excludes 442 declines, and escalates to Merchant Advisory.',
      outcome: '₹2.10 Lakhs Recovered (18.2%) • Escalated to Advisory',
      status: 'LOW_RECOVERY',
      accent: 'border-rose-200 bg-rose-50/40 text-rose-900',
    },
    {
      key: 'SEED_D' as const,
      badge: 'Seed D: Multi-Cohort',
      title: 'Systemic Multi-Bank NPCI Congestion (4 Distinct Cohorts)',
      description: 'NPCI central switch queue depth backlog. Investigation separates into 4 distinct cohorts: 504 Timeout (₹4.8L), Rate-limited (₹2.9L), High-value Enterprise >₹85k (₹2.1L), and Terminal Dropouts (₹1.2L).',
      outcome: '4 Cohort Decomposition • Tailored Policy Routing',
      status: 'MULTI_COHORT',
      accent: 'border-blue-200 bg-blue-50/40 text-blue-900',
    },
    {
      key: 'SEED_E' as const,
      badge: 'Seed E: Safety Block',
      title: 'Adversarial Phantom Route & Duplicate Retry (Policy Block)',
      description: 'Adversarial anomaly proposing unverified gateway route and duplicate retries on already settled payments. Policy POL-IDEMP-01 and POL-ROUTE-SEC-04 trip, triggering SAFE_STOP with 0 unsafe executions.',
      outcome: 'SAFE_STOP Executed • 0 Unsafe Actions',
      status: 'POLICY_BLOCKED',
      accent: 'border-purple-200 bg-purple-50/40 text-purple-900',
    }
  ];

  const scenarios = [
    {
      id: 'hdfc_upi_degradation' as const,
      title: 'HDFC UPI Route Failure (Peak Hour Surge)',
      severity: 'Critical',
      description: 'Acute 43.8% success drop on HDFC_DIRECT_V3 UPI switch due to upstream gateway 504 timeouts.',
      affectedBank: 'HDFC Bank',
      affectedMethod: 'UPI',
      risk: 'Critical (₹8,45,000 GMV/hr)',
    },
    {
      id: 'icici_card_latency_spike' as const,
      title: 'ICICI Credit Card 3DS Latency Spike',
      severity: 'High',
      description: '28.5% timeout rate on ICICI card auth due to acquirer network timeout during 3DS OTP verification.',
      affectedBank: 'ICICI Bank',
      affectedMethod: 'Cards',
      risk: 'High (₹5,60,000 GMV/hr)',
    },
    {
      id: 'sbi_netbanking_outage' as const,
      title: 'SBI NetBanking Authentication Outage',
      severity: 'High',
      description: '52.0% auth failure rate on State Bank of India NetBanking returning 503 Service Unavailable errors.',
      affectedBank: 'SBI',
      affectedMethod: 'Netbanking',
      risk: 'High (₹4,20,000 GMV/hr)',
    },
    {
      id: 'high_traffic_concurrency_spike' as const,
      title: 'High Concurrency Traffic Surge (Flash Sale)',
      severity: 'Medium',
      description: '4x burst traffic causing transaction queue rate limiting and elevated latency across checkout flows.',
      affectedBank: 'Multiple Banks',
      affectedMethod: 'All Methods',
      risk: 'Medium (₹3,80,000 GMV/hr)',
    },
    {
      id: 'npci_switch_congestion' as const,
      title: 'NPCI Common UPI Switch Congestion',
      severity: 'High',
      description: 'National Payments Corporation of India central switch backlog affecting multiple UPI handles.',
      affectedBank: 'All Banks',
      affectedMethod: 'UPI',
      risk: 'High (₹7,10,000 GMV/hr)',
    },
    {
      id: 'steady_normal' as const,
      title: 'Nominal Normal Traffic (Healthy Baseline)',
      severity: 'Nominal',
      description: 'Healthy synthetic traffic stream with 93.4%+ overall success rate across all acquirers.',
      affectedBank: 'All Acquirers',
      affectedMethod: 'All Methods',
      risk: 'Nominal',
    },
  ];

  const handleLoadSeed = async () => {
    setIsSeeding(true);
    try {
      const res = await api.seedScenario(selectedSeed);
      if (onSelectIncident && res.incident) {
        onSelectIncident(res.incident.id);
      }
      onClose();
    } catch (e) {
      console.error('Failed to load seed:', e);
    } finally {
      setIsSeeding(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Payment Scenario Engine & Deterministic Seeds"
      subtitle="Evaluate the 3-agent control plane across diverse, repeatable payment failure conditions."
      maxWidth="3xl"
    >
      <div className="space-y-4">
        {/* Tab switcher */}
        <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
          <button
            onClick={() => setActiveTab('seeds')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'seeds'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            Judge Deterministic Seeds (A–E)
          </button>
          <button
            onClick={() => setActiveTab('scenarios')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'scenarios'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            Live Synthetic Stream Generators
          </button>
        </div>

        {/* Tab 1: SEEDS A-E */}
        {activeTab === 'seeds' && (
          <div className="space-y-3">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600">
              <strong className="text-slate-900 font-bold">Repeatable Evaluation Seeds:</strong> These deterministic states test high recovery, partial recovery, non-retryable exclusions, multi-cohort decompositions, and safety policy blocks.
            </div>

            <div className="space-y-2.5 max-h-[50vh] overflow-y-auto pr-1">
              {DEMO_SEEDS.map((seed) => {
                const isSelected = selectedSeed === seed.key;
                return (
                  <div
                    key={seed.key}
                    onClick={() => setSelectedSeed(seed.key)}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-start justify-between gap-3 ${
                      isSelected
                        ? 'bg-blue-50/50 border-blue-500 ring-1 ring-blue-500/30 shadow-xs'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="space-y-1.5 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                          {seed.badge}
                        </span>
                        <h4 className="text-xs font-bold text-slate-900">
                          {seed.title}
                        </h4>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        {seed.description}
                      </p>
                      <div className="pt-1 flex items-center gap-3 text-[11px] font-mono">
                        <strong className="text-emerald-700 font-semibold">{seed.outcome}</strong>
                      </div>
                    </div>

                    <div className="shrink-0 pt-1">
                      <input
                        type="radio"
                        name="demo_seed_select"
                        checked={isSelected}
                        onChange={() => setSelectedSeed(seed.key)}
                        className="text-blue-600 focus:ring-blue-500 h-4 w-4 cursor-pointer"
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
              <span className="text-[11px] font-mono text-slate-400">
                Instantly loads selected deterministic seed into incident store
              </span>

              <button
                onClick={handleLoadSeed}
                disabled={isSeeding}
                className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {isSeeding ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                Load Deterministic Seed ({selectedSeed.replace('_', ' ')})
              </button>
            </div>
          </div>
        )}

        {/* Tab 2: Standard Synthetic Scenarios */}
        {activeTab === 'scenarios' && (
          <div className="space-y-3">
            <div className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-200 text-xs text-blue-900 flex items-start gap-2.5">
              <Cpu className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <strong className="block text-slate-900 font-bold mb-0.5">Autonomous Synthetic Stream</strong>
                Transactions and metrics are generated dynamically. The Detection, Investigation, and Resolution Agents analyze live telemetry with AI reasoning.
              </div>
            </div>

            <div className="space-y-2 max-h-[45vh] overflow-y-auto pr-1">
              {scenarios.map((sc) => {
                const isSelected = selectedScenario === sc.id;
                const isActive = activeScenario === sc.id;

                return (
                  <div
                    key={sc.id}
                    onClick={() => setSelectedScenario(sc.id)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer flex items-start justify-between gap-3 ${
                      isSelected
                        ? 'bg-blue-50/50 border-blue-500 ring-1 ring-blue-500/30 shadow-xs'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="font-bold text-xs text-slate-900">
                          {sc.title}
                        </span>
                        {isActive && (
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold">
                            CURRENT LIVE
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 leading-relaxed">
                        {sc.description}
                      </p>
                      <div className="mt-1.5 flex items-center gap-3 text-[11px] font-mono text-slate-500">
                        <span>Target: <strong className="text-slate-800">{sc.affectedBank}</strong></span>
                        <span>Method: <strong className="text-slate-800">{sc.affectedMethod}</strong></span>
                        <span>Impact: <strong className="text-rose-600 font-bold">{sc.risk}</strong></span>
                      </div>
                    </div>

                    <div className="shrink-0 pt-1">
                      <input
                        type="radio"
                        name="scenario_select"
                        checked={isSelected}
                        onChange={() => setSelectedScenario(sc.id)}
                        className="text-blue-600 focus:ring-blue-500 h-4 w-4 cursor-pointer"
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <button
                onClick={async () => {
                  await onResetSimulation();
                  onClose();
                }}
                disabled={isProcessing}
                className="px-3.5 py-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50 cursor-pointer shadow-xs"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reset Baseline
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={async () => {
                    await onTriggerScenario(selectedScenario);
                    onClose();
                  }}
                  disabled={isProcessing}
                  className="px-3.5 py-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50 cursor-pointer shadow-xs"
                >
                  <Zap className="w-3.5 h-3.5 text-amber-500" />
                  Inject Stream
                </button>

                <button
                  onClick={async () => {
                    await onRunWorkflowDemo(selectedScenario);
                    onClose();
                  }}
                  disabled={isProcessing}
                  className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer"
                >
                  {isProcessing ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Play className="w-3.5 h-3.5 fill-current" />
                  )}
                  Run 3-Agent Workflow
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
