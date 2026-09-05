import React from 'react';
import { SimulationScenarioId, PaymentHealthMetrics } from '../../types';
import { 
  Zap, 
  Play, 
  RotateCcw, 
  ShieldCheck, 
  Sparkles, 
  Cpu, 
  Sliders,
  HelpCircle,
  Activity,
  Search
} from 'lucide-react';

interface HeaderProps {
  activeScenario: SimulationScenarioId;
  healthMetrics?: PaymentHealthMetrics;
  onOpenSimulationModal: () => void;
  onRunWorkflowDemo: () => void;
  onResetSimulation: () => void;
  onOpenHelpModal: () => void;
  onOpenGuidedTour: () => void;
  onOpenSearch: () => void;
  onOpenJudgeDemo?: () => void;
  onOpenJudgeQuestions?: () => void;
  isProcessing?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  activeScenario,
  healthMetrics,
  onOpenSimulationModal,
  onRunWorkflowDemo,
  onResetSimulation,
  onOpenHelpModal,
  onOpenGuidedTour,
  onOpenSearch,
  onOpenJudgeDemo,
  onOpenJudgeQuestions,
  isProcessing = false,
}) => {
  const getScenarioLabel = (scenario: SimulationScenarioId) => {
    switch (scenario) {
      case 'hdfc_upi_degradation': return 'HDFC UPI Route Failure';
      case 'icici_card_latency_spike': return 'ICICI Card 3DS Timeout';
      case 'sbi_netbanking_outage': return 'SBI Auth 503 Outage';
      case 'high_traffic_concurrency_spike': return 'Concurrency Traffic Surge';
      case 'npci_switch_congestion': return 'NPCI Switch Congestion';
      default: return 'Steady Normal Stream';
    }
  };

  const isDegraded = activeScenario !== 'steady_normal';

  return (
    <header className="h-16 border-b border-slate-200 bg-white/95 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between gap-4 sticky top-0 z-30 shadow-xs">
      {/* Brand & Identity */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-xs">
            <Zap className="w-5 h-5 fill-current" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm sm:text-base font-extrabold tracking-tight text-slate-900">
                Razorpay
              </h1>
              <span className="hidden sm:inline-block text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 font-semibold">
                3-Agent Operations
              </span>
            </div>
            <p className="text-[10px] text-slate-500 hidden sm:block">
              AI-powered payment revenue recovery
            </p>
          </div>
        </div>
      </div>

      {/* Global Search & Scenario Pill */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenSearch}
          className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50/80 hover:bg-slate-100/80 text-slate-500 hover:text-slate-900 transition-all text-xs cursor-pointer"
        >
          <Search className="w-3.5 h-3.5 text-slate-400" />
          <span>Search incidents, txns...</span>
          <kbd className="px-1.5 py-0.5 rounded bg-white border border-slate-200 text-[10px] font-mono text-slate-500">
            ⌘K
          </kbd>
        </button>

        {/* Center Scenario Pill */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-50 border border-slate-200 text-xs">
          <div className={`w-2 h-2 rounded-full ${isDegraded ? 'bg-rose-500 animate-ping' : 'bg-emerald-500'}`} />
          <span className="text-slate-500 font-mono text-[11px]">Scenario:</span>
          <span className={`font-semibold ${isDegraded ? 'text-rose-700' : 'text-emerald-700'}`}>
            {getScenarioLabel(activeScenario)}
          </span>
          {healthMetrics && (
            <span className="text-slate-500 text-[11px] font-mono border-l border-slate-200 pl-2">
              SR: <strong className="text-slate-900">{healthMetrics.successRate}%</strong>
            </span>
          )}
        </div>
      </div>

      {/* Action Controls */}
      <div className="flex items-center gap-2 sm:gap-2.5">
        {/* Judge 90s One-Click Demo Button */}
        {onOpenJudgeDemo && (
          <button
            id="start-judge-demo-btn"
            onClick={onOpenJudgeDemo}
            className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
            title="Start 90-Second Complete Payment Recovery Demo"
          >
            <Sparkles className="w-3.5 h-3.5 text-blue-200" />
            <span>Judge Demo (90s)</span>
          </button>
        )}

        {/* Judge FAQ Button */}
        {onOpenJudgeQuestions && (
          <button
            id="judge-faq-btn"
            onClick={onOpenJudgeQuestions}
            className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors shadow-xs cursor-pointer"
            title="Reviewer & Judge Frequently Asked Questions"
          >
            <HelpCircle className="w-3.5 h-3.5 text-slate-500" />
            <span>Reviewer FAQ</span>
          </button>
        )}

        <button
          id="open-sim-modal-btn"
          onClick={onOpenSimulationModal}
          className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
          title="Payment Scenarios & Deterministic Seeds A-E"
        >
          <Sliders className="w-3.5 h-3.5 text-blue-600" />
          <span className="hidden sm:inline">Seeds & Scenarios</span>
        </button>

        <button
          id="reset-baseline-btn"
          onClick={onResetSimulation}
          disabled={isProcessing}
          className="p-2 rounded-lg border border-slate-200 bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors shadow-xs cursor-pointer disabled:opacity-50"
          title="Reset simulation to healthy nominal baseline (93%+ SR)"
        >
          <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
        </button>
      </div>
    </header>
  );
};
