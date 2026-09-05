import React, { useState, useEffect, useCallback } from 'react';
import { 
  PaymentHealthMetrics, 
  Incident, 
  AgentCardState, 
  PaymentTransaction, 
  SimulationScenarioId 
} from './types';
import { api } from './lib/api';
import { Header } from './components/layout/Header';
import { Sidebar, AppView } from './components/layout/Sidebar';
import { SimulationControlModal } from './components/simulation/SimulationControlModal';
import { GuidedDemoController } from './components/simulation/GuidedDemoController';
import { GlobalSearchModal } from './components/common/GlobalSearchModal';
import { TransactionDetailModal } from './components/common/TransactionDetailModal';
import { PrototypeDisclaimerBanner } from './components/common/PrototypeDisclaimerBanner';
import { JudgeQuestionsModal } from './components/common/JudgeQuestionsModal';
import { JudgeDemoModal } from './components/simulation/JudgeDemoModal';
import { OverviewView } from './views/OverviewView';
import { IncidentsListView } from './views/IncidentsListView';
import { IncidentDetailView } from './views/IncidentDetailView';
import { RecoveryBatchesView } from './views/RecoveryBatchesView';
import { TransactionsView } from './views/TransactionsView';
import { AgentsCommandCenterView } from './views/AgentsCommandCenterView';
import { AgentPerformanceView } from './views/AgentPerformanceView';
import { AnalyticsView } from './views/AnalyticsView';
import { AuditLogView } from './views/AuditLogView';
import { ProductGuideView } from './views/ProductGuideView';
import confetti from 'canvas-confetti';
import { 
  CheckCircle2, 
  AlertTriangle, 
  Info, 
  X, 
  Sparkles, 
  Loader2,
  ShieldCheck,
  Play
} from 'lucide-react';

const INITIAL_HEALTH: PaymentHealthMetrics = {
  healthScore: 98,
  successRate: 94.2,
  successRateChange: 0.0,
  activeIncidentsCount: 0,
  criticalIncidentsCount: 0,
  totalTransactions24h: 0,
  affectedTransactionsTotal: 0,
  eligibleTransactionsTotal: 0,
  revenueAtRiskINR: 0,
  estimatedRecoverableRevenueINR: 0,
  recoveredRevenueINR: 0,
  revenueStillAtRiskINR: 0,
  recoveryRate: 0,
  transactionRecoveryRate: 0,
  recoveryBatchesCount: 0,
  totalProtectedRevenueINR: 0,
  avgLatencyMs: 380,
  latencyPercentiles: {
    p50: 340,
    p90: 510,
    p95: 620,
    p99: 980,
  },
  currentSystemSeverity: 'nominal',
  trendData: [],
  bankBreakdown: [
    { bank: 'HDFC Bank', successRate: 94.8, totalVolume: 0, failedVolume: 0, avgLatencyMs: 340, status: 'healthy' },
    { bank: 'ICICI Bank', successRate: 94.2, totalVolume: 0, failedVolume: 0, avgLatencyMs: 390, status: 'healthy' },
    { bank: 'State Bank of India', successRate: 92.5, totalVolume: 0, failedVolume: 0, avgLatencyMs: 440, status: 'healthy' },
    { bank: 'Axis Bank', successRate: 93.9, totalVolume: 0, failedVolume: 0, avgLatencyMs: 360, status: 'healthy' },
  ],
  methodBreakdown: [
    { method: 'UPI', sharePercent: 55, successRate: 94.5, avgLatencyMs: 280 },
    { method: 'Cards', sharePercent: 25, successRate: 93.8, avgLatencyMs: 420 },
    { method: 'Netbanking', sharePercent: 12, successRate: 91.2, avgLatencyMs: 510 },
    { method: 'Wallet', sharePercent: 8, successRate: 95.8, avgLatencyMs: 210 },
  ],
  errorCodeDistribution: [],
};

const INITIAL_AGENTS: Record<string, AgentCardState> = {
  detection: {
    id: 'detection',
    name: 'Detection Agent',
    role: 'Continuous Transaction Telemetry & Anomaly Flagging',
    model: 'AI Engine',
    status: 'monitoring',
    currentTask: 'Scanning live transaction streams against rolling 15m baseline',
    lastAction: 'Normal baseline verification — 94.2% success rate',
    confidence: 0.98,
    timestamp: new Date().toISOString(),
    executionTimeMs: 142,
  },
  investigation: {
    id: 'investigation',
    name: 'Investigation Agent',
    role: 'Multi-Dimensional Cohort & Root Cause Attribution',
    model: 'AI Engine',
    status: 'idle',
    currentTask: 'Awaiting anomaly triggers from Detection pipeline',
    lastAction: 'Standing by with segment comparison matrices',
    confidence: 0.96,
    timestamp: new Date().toISOString(),
    executionTimeMs: 220,
  },
  resolution: {
    id: 'resolution',
    name: 'Resolution Agent',
    role: 'Dynamic Mitigation Strategy & Safe Policy Orchestration',
    model: 'AI Engine',
    status: 'idle',
    currentTask: 'Ready to evaluate routing policies upon root cause signoff',
    lastAction: 'Routing table verification complete',
    confidence: 0.95,
    timestamp: new Date().toISOString(),
    executionTimeMs: 180,
  },
};

export const App: React.FC = () => {
  // Navigation & View State
  const [currentView, setCurrentView] = useState<AppView>('overview');
  const [selectedIncidentId, setSelectedIncidentId] = useState<string | null>(null);

  // Core Data State
  const [health, setHealth] = useState<PaymentHealthMetrics>(INITIAL_HEALTH);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [agents, setAgents] = useState<Record<string, AgentCardState>>(INITIAL_AGENTS);
  const [recentTransactions, setRecentTransactions] = useState<PaymentTransaction[]>([]);
  const [activeScenario, setActiveScenario] = useState<SimulationScenarioId>('steady_normal');

  // UI Modals & Popups
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isSimulationModalOpen, setIsSimulationModalOpen] = useState<boolean>(false);
  const [isGuidedTourOpen, setIsGuidedTourOpen] = useState<boolean>(false);
  const [isJudgeDemoOpen, setIsJudgeDemoOpen] = useState<boolean>(false);
  const [isJudgeFaqOpen, setIsJudgeFaqOpen] = useState<boolean>(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState<boolean>(false);
  const [selectedTxForModal, setSelectedTxForModal] = useState<PaymentTransaction | null>(null);
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  const showToast = (text: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToastMessage({ type, text });
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Fetch complete overview metrics from server
  const loadOverviewData = useCallback(async () => {
    try {
      const data = await api.getOverview();
      setHealth(data.health);
      setIncidents(data.incidents);
      setAgents(data.agents);
      setRecentTransactions(data.recentTransactions);
      setActiveScenario(data.activeScenario);
    } catch (err) {
      console.error('Error fetching overview data:', err);
    }
  }, []);

  // Initial load & periodic tick
  useEffect(() => {
    loadOverviewData();

    // Stream live transactions every 3.5s
    const ticker = setInterval(async () => {
      try {
        const { transaction } = await api.getLiveTick();
        setRecentTransactions((prev) => [transaction, ...prev.slice(0, 19)]);
      } catch (err) {
        // Silently ignore ticker hiccups
      }
    }, 3500);

    return () => clearInterval(ticker);
  }, [loadOverviewData]);

  // Global Keyboard Shortcuts (Cmd+K for search)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchModalOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Support browser hash navigation (e.g. #overview, #incidents, #recovery, etc.)
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '') as AppView;
      const validViews: AppView[] = [
        'overview',
        'incidents',
        'incident-detail',
        'recovery',
        'transactions',
        'agents',
        'agent-performance',
        'analytics',
        'audit-log',
        'guide',
      ];
      if (validViews.includes(hash)) {
        setCurrentView(hash);
      }
    };

    if (window.location.hash) {
      handleHashChange();
    }

    window.addEventListener('hashchange', handleHashChange);
    window.addEventListener('popstate', handleHashChange);
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
      window.removeEventListener('popstate', handleHashChange);
    };
  }, []);

  const navigateToView = (view: AppView) => {
    setCurrentView(view);
    if (window.location.hash !== `#${view}`) {
      window.history.pushState(null, '', `#${view}`);
    }
  };

  // Handler: Select incident and navigate to detail view
  const handleSelectIncident = (id: string) => {
    setSelectedIncidentId(id);
    navigateToView('incident-detail');
  };

  // Handler: Run full 3-Agent workflow demo
  const handleRunWorkflowDemo = async (scenario: SimulationScenarioId = 'hdfc_upi_degradation') => {
    setIsProcessing(true);
    showToast('Starting 3-Agent Workflow: Detection -> Investigation -> Resolution...', 'info');

    try {
      const result = await api.runDemoIncident(scenario);
      if (result?.incident) {
        setIncidents(prev => [result.incident, ...prev.filter(i => i.id !== result.incident.id)]);
      }
      await loadOverviewData();
      setSelectedIncidentId(result.incident.id);
      navigateToView('incident-detail');
      showToast(`Incident ${result.incident.id} created and analyzed by 3 agents!`, 'success');
    } catch (err: any) {
      console.error('Workflow run failed:', err);
      showToast(err.message || 'Failed to run agent workflow', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  // Handler: Trigger simulation scenario
  const handleTriggerScenario = async (scenario: SimulationScenarioId) => {
    setIsProcessing(true);
    try {
      await api.triggerScenario(scenario);
      await loadOverviewData();
      showToast(`Simulation updated to scenario: ${scenario}`, 'info');
    } catch (err: any) {
      showToast(err.message || 'Failed to trigger scenario', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  // Handler: Reset simulation to healthy normal
  const handleResetSimulation = async () => {
    setIsProcessing(true);
    try {
      await api.fullReset();
      await loadOverviewData();
      setSelectedIncidentId(null);
      showToast('Simulation reset: Baseline payment routes restored to >93% nominal.', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to reset simulation', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  // Handler: Human approves mitigation
  const handleApproveMitigation = async (notes?: string) => {
    if (!selectedIncidentId) return;
    setIsProcessing(true);
    try {
      const res = await api.approveMitigation(selectedIncidentId, true, notes);
      await loadOverviewData();
      showToast('Mitigation approved by Human Operator. Authorized for simulated rerouting.', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to approve mitigation', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  // Handler: Human rejects mitigation
  const handleRejectMitigation = async (notes?: string) => {
    if (!selectedIncidentId) return;
    setIsProcessing(true);
    try {
      await api.approveMitigation(selectedIncidentId, false, notes);
      await loadOverviewData();
      showToast('Mitigation rejected by Human Operator.', 'info');
    } catch (err: any) {
      showToast(err.message || 'Failed to reject mitigation', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  // Handler: Execute mitigation
  const handleExecuteMitigation = async () => {
    if (!selectedIncidentId) return;
    setIsProcessing(true);
    try {
      await api.executeMitigation(selectedIncidentId);
      await loadOverviewData();
      showToast('Mitigation deployed in simulation. Recovery telemetry active.', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to execute mitigation', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  // Handler: Verify recovery
  const handleVerifyRecovery = async () => {
    if (!selectedIncidentId) return;
    setIsProcessing(true);
    try {
      const res = await api.verifyRecovery(selectedIncidentId);
      await loadOverviewData();

      // Trigger celebratory confetti for successful incident resolution!
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#3b82f6', '#10b981', '#6366f1'],
        });
      } catch (e) {
        // Safe fallback
      }

      showToast('Recovery verified! Success rate restored to 95.2%. Incident marked RESOLVED.', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to verify recovery', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  // Handler: 1-Click Rollback mitigation
  const handleRollbackMitigation = async () => {
    if (!selectedIncidentId) return;
    setIsProcessing(true);
    try {
      await api.rollbackMitigation(selectedIncidentId);
      await loadOverviewData();
      showToast('Mitigation rolled back: Original routing table restored.', 'info');
    } catch (err: any) {
      showToast(err.message || 'Failed to rollback mitigation', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSelectTransactionById = async (txId: string) => {
    const found = recentTransactions.find((t) => t.id === txId);
    if (found) {
      setSelectedTxForModal(found);
    } else {
      try {
        const res = await api.search(txId);
        if (res.transactions && res.transactions.length > 0) {
          setSelectedTxForModal(res.transactions[0]);
        }
      } catch (e) {
        console.error('Failed to find tx:', e);
      }
    }
  };

  const selectedIncident = incidents.find((i) => i.id === selectedIncidentId) || incidents[0];

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 animate-bounce-short">
          <div className={`p-4 rounded-xl border shadow-xl flex items-center gap-3 ${
            toastMessage.type === 'success'
              ? 'bg-white border-emerald-300 text-emerald-900'
              : toastMessage.type === 'error'
              ? 'bg-white border-rose-300 text-rose-900'
              : 'bg-white border-blue-300 text-blue-900'
          }`}>
            {toastMessage.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            ) : toastMessage.type === 'error' ? (
              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
            ) : (
              <Info className="w-5 h-5 text-blue-600 shrink-0" />
            )}
            <span className="text-xs font-semibold">{toastMessage.text}</span>
            <button
              onClick={() => setToastMessage(null)}
              className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Top Header */}
      <Header
        activeScenario={activeScenario}
        healthMetrics={health || undefined}
        onOpenSimulationModal={() => setIsSimulationModalOpen(true)}
        onRunWorkflowDemo={() => handleRunWorkflowDemo('hdfc_upi_degradation')}
        onResetSimulation={handleResetSimulation}
        onOpenHelpModal={() => setCurrentView('guide')}
        onOpenGuidedTour={() => setIsGuidedTourOpen(true)}
        onOpenSearch={() => setIsSearchModalOpen(true)}
        onOpenJudgeDemo={() => setIsJudgeDemoOpen(true)}
        onOpenJudgeQuestions={() => setIsJudgeFaqOpen(true)}
        isProcessing={isProcessing}
      />

      {/* Main Layout Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <Sidebar
          currentView={currentView}
          onNavigate={(view) => navigateToView(view)}
          activeIncidentsCount={incidents.filter((i) => i.status !== 'VERIFIED' && i.status !== 'RESOLVED').length}
        />

        {/* Content View Container */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          {/* Global Prototype & Environment Disclaimer Banner (Judge-ready transparency) */}
          <PrototypeDisclaimerBanner 
            onOpenJudgeFaq={() => setIsJudgeFaqOpen(true)}
            onStartJudgeDemo={() => setIsJudgeDemoOpen(true)}
          />

          {currentView === 'overview' && (
            <OverviewView
              health={health}
              incidents={incidents}
              agents={agents}
              recentTransactions={recentTransactions}
              onSelectIncident={handleSelectIncident}
              onNavigateToAgents={() => navigateToView('agents')}
              onRunWorkflowDemo={() => handleRunWorkflowDemo('hdfc_upi_degradation')}
              onRefresh={loadOverviewData}
              isProcessing={isProcessing}
            />
          )}

          {currentView === 'incidents' && (
            <IncidentsListView
              incidents={incidents}
              onSelectIncident={handleSelectIncident}
              onRunWorkflowDemo={() => handleRunWorkflowDemo('hdfc_upi_degradation')}
              isProcessing={isProcessing}
            />
          )}

          {currentView === 'incident-detail' && selectedIncident && (
            <IncidentDetailView
              incident={selectedIncident}
              onBack={() => navigateToView('incidents')}
              onApproveMitigation={handleApproveMitigation}
              onRejectMitigation={handleRejectMitigation}
              onExecuteMitigation={handleExecuteMitigation}
              onVerifyRecovery={handleVerifyRecovery}
              onRollbackMitigation={handleRollbackMitigation}
              onSelectTransaction={handleSelectTransactionById}
              isProcessing={isProcessing}
            />
          )}

          {currentView === 'incident-detail' && !selectedIncident && (
            <div className="p-12 text-center bg-white rounded-xl border border-slate-200 shadow-xs">
              <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto mb-2 opacity-60" />
              <h3 className="text-base font-bold text-slate-900">No Incident Selected</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                No active incidents recorded. Trigger a simulation or run the 3-agent cycle to generate and inspect an incident.
              </p>
              <button
                onClick={() => navigateToView('incidents')}
                className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
              >
                Back to Incidents List
              </button>
            </div>
          )}

          {currentView === 'recovery' && (
            <RecoveryBatchesView
              onSelectIncident={handleSelectIncident}
              onSelectTransaction={handleSelectTransactionById}
              activeIncidentId={selectedIncidentId || incidents[0]?.id}
            />
          )}

          {currentView === 'transactions' && (
            <TransactionsView
              initialTransactions={recentTransactions}
            />
          )}

          {currentView === 'agents' && (
            <AgentsCommandCenterView
              agents={agents}
              onRunWorkflowDemo={() => handleRunWorkflowDemo('hdfc_upi_degradation')}
              onNavigateToPerformance={() => navigateToView('agent-performance')}
              isProcessing={isProcessing}
            />
          )}

          {currentView === 'agent-performance' && (
            <AgentPerformanceView
              onRunWorkflowDemo={() => handleRunWorkflowDemo('hdfc_upi_degradation')}
              isProcessing={isProcessing}
            />
          )}

          {currentView === 'analytics' && (
            <AnalyticsView
              metrics={health}
            />
          )}

          {currentView === 'audit-log' && (
            <AuditLogView />
          )}

          {currentView === 'guide' && (
            <ProductGuideView
              onRunDemo={() => {
                navigateToView('overview');
                handleRunWorkflowDemo('hdfc_upi_degradation');
              }}
            />
          )}
        </main>
      </div>

      {/* Guided Product Demo Controller (11 Steps) */}
      <GuidedDemoController
        isOpen={isGuidedTourOpen}
        onClose={() => setIsGuidedTourOpen(false)}
        activeIncidentId={selectedIncidentId || incidents[0]?.id}
        onNavigate={(view, incId) => {
          if (view === 'incident') {
            const targetId = incId || selectedIncidentId || incidents[0]?.id;
            if (targetId) {
              setSelectedIncidentId(targetId);
              setCurrentView('incident-detail');
            } else {
              setCurrentView('incidents');
            }
          } else if (view === 'dashboard') {
            setCurrentView('overview');
          } else if (view === 'traffic') {
            setCurrentView('transactions');
          } else if (view === 'simulation') {
            setIsSimulationModalOpen(true);
          } else if (view === 'audit') {
            setCurrentView('audit-log');
          }
        }}
      />

      {/* Global Search Modal (Cmd+K) */}
      <GlobalSearchModal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
        onSelectIncident={(id) => {
          setSelectedIncidentId(id);
          setCurrentView('incident-detail');
        }}
        onSelectTransaction={(tx) => {
          setSelectedTxForModal(tx);
        }}
      />

      {/* Transaction Detail Drill-Down Modal */}
      <TransactionDetailModal
        transaction={selectedTxForModal}
        onClose={() => setSelectedTxForModal(null)}
      />

      {/* Simulation Controls Modal */}
      <SimulationControlModal
        isOpen={isSimulationModalOpen}
        onClose={() => setIsSimulationModalOpen(false)}
        activeScenario={activeScenario}
        onTriggerScenario={handleTriggerScenario}
        onRunWorkflowDemo={handleRunWorkflowDemo}
        onResetSimulation={handleResetSimulation}
        onSelectIncident={(id) => {
          setSelectedIncidentId(id);
          setCurrentView('incident-detail');
          loadOverviewData();
        }}
        isProcessing={isProcessing}
      />

      {/* 90-Second Judge Demo Controller Modal */}
      <JudgeDemoModal
        isOpen={isJudgeDemoOpen}
        onClose={() => setIsJudgeDemoOpen(false)}
        onNavigateView={(view, incidentId) => {
          if (view) setCurrentView(view as any);
          if (incidentId) setSelectedIncidentId(incidentId);
          loadOverviewData();
        }}
        onNavigate={(view, incidentId) => {
          if (view) setCurrentView(view as any);
          if (incidentId) setSelectedIncidentId(incidentId);
          loadOverviewData();
        }}
        onRefreshData={async () => {
          await loadOverviewData();
        }}
      />

      {/* 10 Reviewer / Judge Frequently Asked Questions */}
      <JudgeQuestionsModal
        isOpen={isJudgeFaqOpen}
        onClose={() => setIsJudgeFaqOpen(false)}
      />
    </div>
  );
};

export default App;
