import React, { useState } from 'react';
import { Incident } from '../types';
import { IncidentStepper } from '../components/incidents/IncidentStepper';
import { IncidentStoryPanel } from '../components/incidents/IncidentStoryPanel';
import { AgentHandoffCard } from '../components/incidents/AgentHandoffCard';
import { SegmentComparisonView } from '../components/incidents/SegmentComparisonView';
import { CandidateActionsMatrix } from '../components/incidents/CandidateActionsMatrix';
import { EvidenceMatrix } from '../components/incidents/EvidenceMatrix';
import { HypothesisCard } from '../components/incidents/HypothesisCard';
import { HumanApprovalCard } from '../components/incidents/HumanApprovalCard';
import { PostMitigationVerification } from '../components/incidents/PostMitigationVerification';
import { IncidentTimeline } from '../components/incidents/IncidentTimeline';
import { RecoveryScorecard } from '../components/incidents/RecoveryScorecard';
import { RecoveryFunnel } from '../components/incidents/RecoveryFunnel';
import { RecoveryCohortsTable } from '../components/incidents/RecoveryCohortsTable';
import { StrategyComparisonCard } from '../components/incidents/StrategyComparisonCard';
import { ExecutiveSummaryCard } from '../components/incidents/ExecutiveSummaryCard';
import { PolicyValidationPanel } from '../components/incidents/PolicyValidationPanel';
import { ExecutiveIncidentCard } from '../components/incidents/ExecutiveIncidentCard';
import { BeforeAfterHero } from '../components/incidents/BeforeAfterHero';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { formatINR } from '../lib/formatters';
import { 
  ArrowLeft, 
  Search, 
  ShieldAlert, 
  Layers, 
  GitPullRequest, 
  CheckCircle2,
  FileText,
  Activity,
  RotateCcw,
  Sparkles,
  Lock
} from 'lucide-react';

interface IncidentDetailViewProps {
  incident: Incident;
  onBack: () => void;
  onApproveMitigation: (notes?: string) => Promise<void>;
  onRejectMitigation: (notes?: string) => Promise<void>;
  onExecuteMitigation: () => Promise<void>;
  onVerifyRecovery: () => Promise<void>;
  onRollbackMitigation?: () => Promise<void>;
  onSelectTransaction?: (txId: string) => void;
  isProcessing?: boolean;
}

export const IncidentDetailView: React.FC<IncidentDetailViewProps> = ({
  incident,
  onBack,
  onApproveMitigation,
  onRejectMitigation,
  onExecuteMitigation,
  onVerifyRecovery,
  onRollbackMitigation,
  onSelectTransaction,
  isProcessing = false,
}) => {
  const [activeTab, setActiveTab] = useState<
    'narrative' | 'recovery' | 'segments' | 'matrix' | 'policy' | 'evidence' | 'hypotheses' | 'timeline'
  >('recovery');

  const detConfidence = Math.round((incident.detection?.confidence ?? 0.96) * 100);
  const invConfidence = Math.round((incident.investigation?.confidence ?? 0.94) * 100);
  const resConfidence = Math.round((incident.resolution?.confidence ?? 0.95) * 100);

  // Derive cohorts if not directly on incident
  const cohorts = incident.recoveryCohorts || incident.resolution?.recoveryCohorts || [];
  const scorecard = incident.recoveryScorecard || incident.resolution?.scorecard;
  const strategies = incident.strategyExperiments || incident.resolution?.strategyComparison || [];
  const execSummary = incident.executiveSummary;
  const policyValidation = incident.resolution?.policyValidation;

  return (
    <div className="space-y-6">
      {/* Top Bar with Back Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <button
          onClick={onBack}
          className="px-3.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors self-start shadow-xs cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 text-slate-500" />
          Back to Command Center
        </button>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-slate-500">
            Incident ID: <strong className="text-slate-800 font-bold">{incident.id}</strong>
          </span>
          <Badge severity={incident.severity} size="sm" />
          <Badge status={incident.status} size="sm" />
        </div>
      </div>

      {/* Incident Header Card */}
      <Card className="p-6 bg-white border-slate-200/80 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
          <div className="space-y-2 max-w-3xl">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 font-bold">
                Payment Route Anomaly
              </span>
              <span className="text-xs text-slate-400 font-mono">
                Detected {incident.detectedAt ? new Date(incident.detectedAt).toLocaleString() : 'Recently'}
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              {incident.title}
            </h2>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed bg-slate-50 p-3.5 rounded-xl border border-slate-200/80">
              <strong className="text-slate-900">Detection Agent Telemetry Synthesis:</strong>{' '}
              {incident.detection?.summary || incident.title}
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 shrink-0 lg:w-96 font-mono text-xs">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] uppercase text-slate-400 block font-medium">Revenue at Risk</span>
              <span className="text-base font-extrabold text-rose-600">
                {formatINR(incident.revenueAtRisk ?? 845000, true)}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] uppercase text-slate-400 block font-medium">Impacted Txns</span>
              <span className="text-base font-extrabold text-amber-600">
                {incident.affectedTransactions || 0} failed
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 col-span-2 sm:col-span-1">
              <span className="text-[10px] uppercase text-slate-400 block font-medium">Merchants</span>
              <span className="text-base font-extrabold text-blue-600">
                {incident.affectedMerchants || 18} Live
              </span>
            </div>
          </div>
        </div>
      </Card>

      {/* 4-Stage Workflow Stepper */}
      <IncidentStepper currentStatus={incident.status} />

      {/* 1-Card Executive Incident Summary (Section 21) */}
      <ExecutiveIncidentCard 
        incident={incident} 
        onOpenTechnicalDetails={() => setActiveTab('matrix')}
      />

      {/* Before / After Hero (Section 22 - For Executed or Verified Incidents) */}
      {(incident.resolution?.executionStatus === 'executed' || incident.status === 'VERIFIED' || incident.status === 'RESOLVED') && (
        <BeforeAfterHero incident={incident} />
      )}

      {/* Post-Mitigation Verification HUD (if verified or executed) */}
      {incident.resolution?.recoveryMetrics && (
        <PostMitigationVerification 
          recoveryMetrics={incident.resolution.recoveryMetrics} 
        />
      )}

      {/* Human-in-the-loop Approval & Action Card with 1-Click Rollback */}
      {incident.resolution && (
        <HumanApprovalCard
          resolution={incident.resolution}
          onApprove={onApproveMitigation}
          onReject={onRejectMitigation}
          onExecute={onExecuteMitigation}
          onVerify={onVerifyRecovery}
          onRollback={onRollbackMitigation}
          isProcessing={isProcessing}
        />
      )}

      {/* Structured Agent Pipeline & Handoff Banner */}
      <AgentHandoffCard incident={incident} />

      {/* Deep-Dive Analysis Tabs */}
      <div className="flex items-center gap-1.5 border-b border-slate-200 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('recovery')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'recovery'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <ShieldAlert className="w-3.5 h-3.5" />
          Recovery Ops & Scorecard
        </button>

        <button
          onClick={() => setActiveTab('narrative')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'narrative'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          Executive Narrative (8 Questions)
        </button>

        <button
          onClick={() => setActiveTab('segments')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'segments'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          Cohort Breakdown (7 Dimensions)
        </button>

        <button
          onClick={() => setActiveTab('matrix')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'matrix'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <GitPullRequest className="w-3.5 h-3.5" />
          Mitigation Matrix & Strategies
        </button>

        <button
          onClick={() => setActiveTab('policy')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'policy'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Lock className="w-3.5 h-3.5" />
          Policy & Governance
        </button>

        <button
          onClick={() => setActiveTab('evidence')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'evidence'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Activity className="w-3.5 h-3.5" />
          Evidence Matrix ({incident.investigation?.evidence?.length || 5})
        </button>

        <button
          onClick={() => setActiveTab('hypotheses')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'hypotheses'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Search className="w-3.5 h-3.5" />
          Hypotheses ({incident.investigation?.alternativeHypotheses?.length || 3})
        </button>

        <button
          onClick={() => setActiveTab('timeline')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'timeline'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Audit Ledger ({incident.timeline?.length || 4})
        </button>
      </div>

      {/* Tab: Recovery Ops & Scorecard */}
      {activeTab === 'recovery' && (
        <div className="space-y-6">
          {scorecard && (
            <RecoveryScorecard scorecard={scorecard} />
          )}

          {scorecard && (
            <RecoveryFunnel scorecard={scorecard} cohorts={cohorts} />
          )}

          {cohorts.length > 0 && (
            <RecoveryCohortsTable 
              cohorts={cohorts} 
              onSelectTransaction={onSelectTransaction}
            />
          )}

          {strategies.length > 0 && (
            <StrategyComparisonCard strategies={strategies} />
          )}
        </div>
      )}

      {/* Tab: Executive Narrative */}
      {activeTab === 'narrative' && (
        <div className="space-y-6">
          {execSummary && (
            <ExecutiveSummaryCard summary={execSummary} />
          )}
          <IncidentStoryPanel incident={incident} />
        </div>
      )}

      {/* Tab: Cohort & Segment Breakdown */}
      {activeTab === 'segments' && (
        <SegmentComparisonView incident={incident} />
      )}

      {/* Tab: Mitigation Decision Matrix & Strategy Tradeoffs */}
      {activeTab === 'matrix' && (
        <div className="space-y-6">
          {strategies.length > 0 && (
            <StrategyComparisonCard strategies={strategies} />
          )}
          <CandidateActionsMatrix incident={incident} />
        </div>
      )}

      {/* Tab: Policy & Governance */}
      {activeTab === 'policy' && (
        <PolicyValidationPanel validation={policyValidation} />
      )}

      {/* Tab: Telemetry Evidence Matrix */}
      {activeTab === 'evidence' && incident.investigation && (
        <div className="space-y-6">
          <EvidenceMatrix evidence={incident.investigation.evidence} />

          {/* Root Cause Summary Card */}
          <Card className="p-5 bg-white border-slate-200/80 shadow-xs">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-600 shrink-0">
                <Search className="w-5 h-5" />
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                    Investigation Agent Synthesis & Isolation
                  </h4>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200 font-bold">
                    Confidence: {invConfidence}%
                  </span>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed">
                  {incident.investigation.rootCause}
                </p>
                <div className="pt-2 flex items-center gap-4 text-xs font-mono text-slate-500">
                  <span>Scope: <strong className="text-blue-600">{incident.investigation.isolatedOrSystemic}</strong></span>
                  <span>Category: <strong className="text-slate-800">{incident.investigation.rootCauseCategory}</strong></span>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Tab: Alternative Hypotheses */}
      {activeTab === 'hypotheses' && incident.investigation && (
        <HypothesisCard hypotheses={incident.investigation.alternativeHypotheses} />
      )}

      {/* Tab: Chronological Audit Log */}
      {activeTab === 'timeline' && (
        <IncidentTimeline timeline={incident.timeline} />
      )}
    </div>
  );
};
